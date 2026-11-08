// Tafel-App – Word- und PDF-Import mit bearbeitbarem Text.
// Word (.docx): Absätze werden zu Textelementen (Überschriften, fett/kursiv/unterstrichen, Farbe, Schrift), Bilder zu Bildern.
// PDF: der Text jeder Seite wird an seiner Stelle als Textblock eingesetzt (PDF-Leser ist in der App enthalten).
// Jedes Element lässt sich danach verschieben, drehen, fixieren und per Doppeltipp bearbeiten.
'use strict';
(function () {
const S = T.S, h = T.h;
const ZEILE = 1.3; // Zeilenhöhe der Textelemente (wie in T.textMetrics)

// ---------- Seiten füllen ----------
function setzer() {
  const oben = 70;
  const breite = Math.max(600, T.W - T.ox - 110), hoehe = Math.max(400, T.H - oben - 120);
  const seiten = []; let pg = null, y = 0;
  const neu = () => { pg = T.newPage('weiss'); pg.view = { x: 40, y: oben, z: 1 }; seiten.push(pg); y = 0; };
  const platz = hh => { if (!pg) neu(); else if (y > 0 && y + hh > hoehe) neu(); };
  return {
    breite, seiten,
    text(d, abstand) {
      d.text = umbrechen(d.text, d, breite); const m = T.textMetrics(d); platz(m.h);
      pg.items.push({ t: 'o', id: T.uid(), k: 'text', d, x: d.einzug || 0, y, w: m.w, h: m.h, r: 0 }); delete d.einzug;
      y += m.h + (abstand != null ? abstand : d.size * 0.3);
    },
    luecke(v) { if (pg && y > 0) y += v; },
    bild(src, w, hh) {
      const f = Math.min(1, breite * 0.7 / w, hoehe * 0.7 / hh); w *= f; hh *= f; platz(hh);
      pg.items.push({ t: 'o', id: T.uid(), k: 'bild', d: { src }, x: 0, y, w, h: hh, r: 0 }); y += hh + 16;
    },
    umbruch() { if (pg && y > 0) neu(); }
  };
}
function umbrechen(text, d, maxW) { // lange Absätze in Zeilen teilen (Textelemente brechen selbst nicht um)
  const out = [];
  for (const zeile of String(text).split('\n')) {
    let akt = '';
    for (const wort of zeile.split(/ +/)) {
      const t = akt ? akt + ' ' + wort : wort;
      if (akt && T.textMetrics({ ...d, text: t }).w > maxW) { out.push(akt); akt = wort; } else akt = t;
    }
    out.push(akt);
  }
  return out.join('\n');
}
function einsetzen(seiten, was) {
  if (!seiten.length) { T.toast('In der Datei wurde kein Text gefunden.', 4000); return; }
  T.snap(); const start = S.page + 1;
  S.board.pages.splice(start, 0, ...seiten.slice(0, 40));
  T.ui.gotoPage(start); T.nachEinfuegen();
  T.toast(`${was} auf ${Math.min(40, seiten.length)} neue Seite(n) eingefügt. Antippen = verschieben, doppelt tippen = Text ändern.`, 5000);
}

// ---------- Word (.docx) ----------
const SCHRIFT = n => /comic/i.test(n) ? 'kinder' : /courier|consolas|mono/i.test(n) ? 'mono' : /times|georgia|cambria|garamond|book|serif/i.test(n) ? 'serif' : /print|script|hand/i.test(n) ? 'hand' : null;
const kind = (el, name) => el && [...el.children].find(c => c.localName === name);
const attr = (el, name) => el ? el.getAttribute('w:' + name) || el.getAttribute(name) : null;
const an = el => !!el && !/^(0|false|none)$/i.test(attr(el, 'val') || '');
async function wordLesen(buf) {
  const zip = T.zipLesen(buf), xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const dok = await zip.lies('word/document.xml'); if (!dok) throw new Error('kein Word-Dokument');
  const rels = {}, relXml = await zip.lies('word/_rels/document.xml.rels');
  if (relXml) for (const r of xml(relXml).getElementsByTagName('Relationship')) rels[r.getAttribute('Id')] = r.getAttribute('Target');
  let grundPt = 11; const stile = await zip.lies('word/styles.xml');
  if (stile) { const sz = xml(stile).querySelector('docDefaults rPrDefault sz'); if (sz) grundPt = (+attr(sz, 'val') || 22) / 2; }
  const pt = v => v / grundPt; // Faktor zur Grundschrift
  const GRUND = 30, L = setzer(); let bilder = 0, bloecke = 0;
  const bildLaden = async (rid, ext) => {
    const ziel = rels[rid]; if (!ziel) return;
    const pfad = ziel.startsWith('/') ? ziel.slice(1) : 'word/' + ziel.replace(/^\.\//, ''), typ = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp' }[pfad.split('.').pop().toLowerCase()];
    if (!typ) return; const bytes = await zip.lies(pfad, true); if (!bytes) return;
    const src = await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(new Blob([bytes], { type: typ })); });
    const w = ext ? ext[0] / 9525 : 400, hh = ext ? ext[1] / 9525 : 300; L.bild(src, w, hh); bilder++;
  };
  // ein Absatz → Text, Format (gilt für den ganzen Block: fett/kursiv nur, wenn der ganze Text so ist), Bilder, Seitenumbruch
  async function absatz(p, inTabelle) {
    const pPr = kind(p, 'pPr'), stil = attr(kind(pPr, 'pStyle'), 'val') || '';
    const ueb = /^(title|titel)$/i.test(stil) ? 0 : (stil.match(/(?:heading|berschrift)\s*(\d)/i) || [])[1];
    let text = '', fett = true, kursiv = true, unter = true, gr = 0, farbe = null, schrift = null, hatText = false;
    const bildDa = [];
    for (const r of p.getElementsByTagNameNS('*', 'r')) {
      const rPr = kind(r, 'rPr'); let t = '';
      for (const c of r.children) {
        if (c.localName === 't') t += c.textContent;
        else if (c.localName === 'tab') t += '    ';
        else if (c.localName === 'br') { if (attr(c, 'type') === 'page') bildDa.push('umbruch'); else t += '\n'; }
        else if (c.localName === 'drawing' || c.localName === 'pict') {
          const blip = c.getElementsByTagNameNS('*', 'blip')[0] || c.getElementsByTagNameNS('*', 'imagedata')[0], ext = c.getElementsByTagNameNS('*', 'extent')[0];
          const rid = blip && (blip.getAttribute('r:embed') || blip.getAttribute('r:id'));
          if (rid) bildDa.push([rid, ext ? [+ext.getAttribute('cx'), +ext.getAttribute('cy')] : null]);
        }
      }
      if (!t) continue; text += t;
      if (!t.trim()) continue; hatText = true;
      fett = fett && an(kind(rPr, 'b')); kursiv = kursiv && an(kind(rPr, 'i')); unter = unter && an(kind(rPr, 'u'));
      const sz = kind(rPr, 'sz'); if (sz) gr = Math.max(gr, +attr(sz, 'val') / 2);
      const col = attr(kind(rPr, 'color'), 'val'); if (col && /^[0-9a-f]{6}$/i.test(col) && !farbe && col.toLowerCase() !== '000000') farbe = '#' + col;
      const fo = kind(rPr, 'rFonts'); if (fo && !schrift) schrift = SCHRIFT(attr(fo, 'ascii') || attr(fo, 'hAnsi') || '');
    }
    if (inTabelle) return text.trim();
    for (const b of bildDa) { if (b === 'umbruch') L.umbruch(); else await bildLaden(b[0], b[1]); }
    if (!hatText) { L.luecke(GRUND * 0.5); return; }
    const faktor = ueb === 0 ? 2 : ueb === '1' ? 1.6 : ueb === '2' ? 1.35 : ueb ? 1.2 : 1;
    const size = Math.round(T.clamp(GRUND * (gr ? pt(gr) : 1) * (gr && ueb != null ? 1 : faktor), 16, 110));
    const num = kind(pPr, 'numPr'), ebene = num ? +(attr(kind(num, 'ilvl'), 'val') || 0) : 0;
    const d = { text: (num ? '•  ' : '') + text.replace(/\s+$/, ''), size, c: farbe || '#1a1a1a' };
    if (fett || ueb != null) d.fett = true; if (kursiv) d.kursiv = true; if (unter) d.unter = true; if (schrift) d.schrift = schrift;
    if (num) d.einzug = 30 + ebene * 40;
    if (ueb != null) L.luecke(size * 0.3);
    L.text(d); bloecke++;
  }
  const body = xml(dok).getElementsByTagNameNS('*', 'body')[0];
  const flach = els => [...els].flatMap(el => el.localName === 'sdt' ? flach((kind(el, 'sdtContent') || el).children) : [el]); // Inhaltssteuerelemente (z. B. Inhaltsverzeichnis) auspacken
  for (const el of body ? flach(body.children) : []) {
    if (el.localName === 'p') await absatz(el);
    else if (el.localName === 'tbl') { // Tabelle: eine Zeile je Tabellenzeile, Zellen mit │ getrennt
      const zeilen = [];
      for (const tr of [...el.children].filter(c => c.localName === 'tr')) {
        const zellen = []; for (const tc of [...tr.children].filter(c => c.localName === 'tc')) { const teile = []; for (const p of tc.getElementsByTagNameNS('*', 'p')) teile.push(await absatz(p, true)); zellen.push(teile.filter(Boolean).join(' ')); }
        zeilen.push(zellen.join('   │   '));
      }
      if (zeilen.length) { L.text({ text: zeilen.join('\n'), size: GRUND, c: '#1a1a1a' }); bloecke++; }
    }
  }
  einsetzen(L.seiten, `${bloecke} Textblöcke${bilder ? ' und ' + bilder + ' Bild(er)' : ''}`);
}

// ---------- PDF als Text ----------
async function pdfText(file) {
  let lib; try { lib = await T.ui.ladePdfJs(); } catch (e) { T.toast('Der PDF-Leser konnte nicht geladen werden.', 6000); return; }
  T.toast('PDF wird gelesen …', 8000);
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise, max = Math.min(pdf.numPages, 40), seiten = [];
  let bloecke = 0;
  for (let i = 1; i <= max; i++) {
    const pg = await pdf.getPage(i), vp0 = pg.getViewport({ scale: 1 }), B = 1200, sc = B / vp0.width, vp = pg.getViewport({ scale: sc });
    const tc = await pg.getTextContent(), teile = [];
    for (const it of tc.items) {
      if (!it.str || !it.str.trim()) continue; // Leerzeichen ergeben sich aus den Abständen
      const t = lib.Util.transform(vp.transform, it.transform), fs = Math.hypot(t[2], t[3]);
      if (fs < 2) continue; teile.push({ s: it.str, x: t[4], y: t[5], fs, w: it.width * sc });
    }
    // Zeilen: gleiche Grundlinie, von links nach rechts; großer Abstand = eigener Block (Spalten, Tabellen)
    teile.sort((a, b) => a.y - b.y || a.x - b.x);
    const zeilen = [];
    for (const t of teile) {
      const z = zeilen.find(z => Math.abs(z.y - t.y) < t.fs * 0.45 && t.x >= z.ende - t.fs * 0.3 && t.x - z.ende < t.fs * 3);
      if (z) { if (t.x - z.ende > t.fs * 0.2 && !/\s$/.test(z.s) && !/^\s/.test(t.s)) z.s += ' '; z.s += t.s; z.ende = t.x + t.w; z.fs = Math.max(z.fs, t.fs); }
      else zeilen.push({ s: t.s, x: t.x, y: t.y, fs: t.fs, ende: t.x + t.w });
    }
    // Absätze: Zeilen untereinander mit gleichem linken Rand, gleicher Größe und normalem Zeilenabstand
    const bl = [];
    for (const z of zeilen.filter(z => z.s.trim()).sort((a, b) => a.y - b.y || a.x - b.x)) {
      const b = bl.find(b => Math.abs(b.x - z.x) < z.fs * 1.2 && Math.abs(b.fs - z.fs) < z.fs * 0.15 && z.y - b.letzte > 0 && z.y - b.letzte < z.fs * 1.9);
      if (b) { b.zeilen.push(z.s.trim()); b.letzte = z.y; } else bl.push({ x: z.x, y: z.y, fs: z.fs, letzte: z.y, zeilen: [z.s.trim()] });
    }
    if (!bl.length) continue;
    const seite = T.newPage('weiss');
    for (const b of bl) {
      const d = { text: b.zeilen.join('\n'), size: Math.round(b.fs * 10) / 10, c: '#1a1a1a' }, m = T.textMetrics(d);
      seite.items.push({ t: 'o', id: T.uid(), k: 'text', d, x: T.r1(b.x - d.size * 0.2), y: T.r1(b.y - d.size * 1.1), w: m.w, h: m.h, r: 0 }); bloecke++;
    }
    const oben = 70;
    const z = Math.min(1, (T.W - T.ox - 60) / (B + 40)); // auf Breite – gut lesbar, nach unten verschieben
    seite.view = { x: 30 - 20 * z, y: oben, z };
    seiten.push(seite);
  }
  if (!seiten.length) { T.toast('In dieser PDF ist kein Text gespeichert (z. B. eingescannt). Bitte „PDF als Bild“ verwenden.', 6000); return; }
  einsetzen(seiten, `${bloecke} Textblöcke aus ${max} PDF-Seite(n)`);
}

// ---------- Auswahl ----------
T.dokImport = async () => {
  const file = await T.pickFile('.docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'); if (!file) return;
  const name = file.name.toLowerCase();
  if (/\.doc$/.test(name)) { T.toast('Alte Word-Datei (.doc): bitte in Word als .docx speichern und dann einfügen.', 6000); return; }
  try {
    if (/\.docx$/.test(name)) { T.toast('Word-Datei wird gelesen …', 4000); await wordLesen(await file.arrayBuffer()); return; }
    if (/\.pdf$/.test(name) || file.type === 'application/pdf') {
      T.openDlg([h('h2', {}, '📄 PDF einfügen'),
        h('p', {}, 'Wie soll die PDF auf die Tafel?'),
        h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch', gap: '10px' } },
          h('button', { class: 'big prim', style: { justifyContent: 'flex-start', textAlign: 'left' }, onclick: () => { T.closeDlg(); pdfText(file).catch(() => T.toast('Die PDF-Datei konnte nicht gelesen werden.', 4000)); } },
            h('b', {}, '🔤 Text bearbeitbar'), h('span', { class: 'hint', style: { marginLeft: '8px' } }, 'Text verschieben und ändern – Bilder/Grafiken der PDF fehlen')),
          h('button', { class: 'big', style: { justifyContent: 'flex-start', textAlign: 'left' }, onclick: () => { T.closeDlg(); pdfAlsBild(file); } },
            h('b', {}, '🖼 Als Bild'), h('span', { class: 'hint', style: { marginLeft: '8px' } }, 'sieht genau aus wie die Vorlage – Text nicht änderbar')))]);
      return;
    }
    T.toast('Bitte eine Word- (.docx) oder PDF-Datei wählen.', 4000);
  } catch (e) { T.toast('Die Datei konnte nicht gelesen werden.', 4000); }
};
function pdfAlsBild(file) { // vorhandener PDF-Import (Seiten als Bilder) mit der schon gewählten Datei
  const alt = T.pickFile; T.pickFile = () => { T.pickFile = alt; return Promise.resolve(file); };
  T.ui.pdfEinfuegen().finally(() => { T.pickFile = alt; });
}
})();
