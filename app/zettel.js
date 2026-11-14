// Tafel-App – Haftnotizen (Klebezettel) mit Clustern nach Farbe und Punkte-Abstimmung, dazu die Wortwolke.
// Zettel sind normale Bausteine: mit dem Finger verschieben, mit dem Stift beschriften (Handschrift wandert mit),
// doppelt tippen zum Eintippen. „Clustern“ ordnet sie nach Farbe in Spalten mit Überschrift.
'use strict';
(function () {
const { doc, tx, rc, f, esc } = T._svg, B = T.BAUSTEINE, S = T.S, h = T.h;
const zeilen = s => String(s || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean);
const mess = (t, fs, fett) => { const c = T._mctx || (T._mctx = document.createElement('canvas').getContext('2d')); c.font = `${fett ? 700 : 600} ${fs}px Segoe UI`; return c.measureText(String(t)).width; };

// [id, Name, Papier, Akzent]
const ZF = [['gelb', 'Gelb', '#fff59d', '#f9a825'], ['orange', 'Orange', '#ffcc80', '#ef6c00'], ['rosa', 'Rosa', '#f8bbd0', '#d81b60'],
  ['lila', 'Lila', '#d1c4e9', '#5e35b1'], ['blau', 'Blau', '#b3e5fc', '#0277bd'], ['gruen', 'Grün', '#c5e1a5', '#558b2f']];
const zf = id => ZF.find(z => z[0] === id) || ZF[0];
T.ZETTEL_FARBEN = ZF;

// Text auf dem Zettel umbrechen – Schrift so groß wie möglich
function umbrechen(text, bw, bh) {
  const absaetze = String(text || '').split(/\r?\n/);
  for (let fs = 36; fs >= 14; fs -= 2) {
    const out = [];
    for (const a of absaetze) {
      let z = '';
      for (const w of a.split(/\s+/).filter(Boolean)) { const t = z ? z + ' ' + w : w; if (mess(t, fs) <= bw || !z) z = t; else { out.push(z); z = w; } }
      out.push(z);
    }
    if (out.length * fs * 1.22 <= bh && out.every(l => mess(l, fs) <= bw)) return { fs, zeilen: out };
    if (fs === 14) return { fs, zeilen: out.slice(0, Math.max(1, Math.floor(bh / (fs * 1.22)))) };
  }
}

B.zettel = { name: 'Haftnotiz', gruppe: 'intern', def: { text: '', farbe: 'gelb', punkte: 0, sieger: false },
  felder: [{ k: 'text', l: 'Text (leer lassen = mit dem Stift beschriften)', typ: 'textarea' }, { k: 'farbe', l: 'Farbe', typ: 'auswahl', opts: ZF.map(z => [z[0], z[1]]) }, { k: 'punkte', l: 'Punkte', typ: 'zahl', min: 0, max: 99 }],
  gen: d => {
    const W = 220, H = 220, [, , papier, akz] = zf(d.farbe), n = Math.max(0, Math.round(d.punkte || 0));
    let s = rc(9, 11, W - 14, H - 14, 'none', 'rgba(0,0,0,.16)', 0, 'rx="6"');
    s += `<path d="M4 4 H${W - 6} V${H - 40} L${W - 40} ${H - 6} H4 Z" fill="${papier}" stroke="${d.sieger ? '#f59e0b' : 'rgba(0,0,0,.12)'}" stroke-width="${d.sieger ? 9 : 1.5}" stroke-linejoin="round"/>`;
    s += `<path d="M${W - 6} ${H - 40} L${W - 40} ${H - 40} L${W - 40} ${H - 6} Z" fill="${akz}" opacity=".35"/>`; // umgeknickte Ecke
    s += rc(4, 4, W - 10, 22, 'none', akz, 0, 'opacity=".22"'); // Klebestreifen
    const unten = n ? 40 : 14, u = umbrechen(d.text, W - 34, H - 34 - unten);
    if (u && d.text) { const y0 = 26 + (H - 26 - unten - u.zeilen.length * u.fs * 1.22) / 2 + u.fs * 0.61;
      u.zeilen.forEach((z, i) => { s += tx(W / 2 - 4, y0 + i * u.fs * 1.22, z, '#1b1f2a', u.fs, 'middle', 'font-weight="600"'); }); }
    if (n) { // Punkte unten: bis 7 als Klebepunkte, darüber mit Zahl
      const k = Math.min(n, 7);
      for (let i = 0; i < k; i++) s += `<circle cx="${f(24 + i * 22)}" cy="${H - 30}" r="9" fill="#e53935" stroke="#fff" stroke-width="2.5"/>`;
      if (n > 7 || n > 1) s += tx(24 + k * 22 + 6, H - 30, n > 7 ? '= ' + n : String(n), '#b71c1c', 20, 'start', 'font-weight="700"');
    }
    if (d.sieger) s += `<circle cx="${W - 26}" cy="26" r="22" fill="#f59e0b" stroke="#fff" stroke-width="3"/>` + tx(W - 26, 27, '★', '#fff', 28, 'middle', 'font-weight="700"');
    return { svg: doc(W, H, s), w: W, h: H };
  } };
B.zettel.schnell = [{ l: '＋ Punkt', f: d => ({ d: { ...d, punkte: (d.punkte || 0) + 1 } }) }, { l: '− Punkt', f: d => ({ d: { ...d, punkte: Math.max(0, (d.punkte || 0) - 1) } }) },
  { l: '🎨 Farbe', f: d => ({ d: { ...d, farbe: ZF[(ZF.findIndex(z => z[0] === d.farbe) + 1) % ZF.length][0] } }) }];

// Überschrift einer Gruppe (entsteht beim Clustern)
B.clusterkopf = { name: 'Gruppen-Überschrift', gruppe: 'intern', def: { titel: 'Gruppe', farbe: 'gelb', breite: 220 }, felder: [{ k: 'titel', l: 'Überschrift', typ: 'text' }],
  gen: d => { const W = Math.max(120, d.breite), H = 64, akz = zf(d.farbe)[3], fs = Math.min(32, (W - 30) / Math.max(4, String(d.titel).length) * 1.9);
    return { svg: doc(W, H, rc(2, 2, W - 4, H - 4, 'none', akz, 0, 'rx="16"') + tx(W / 2, H / 2, d.titel, '#fff', fs, 'middle', 'font-weight="700"')), w: W, h: H }; } };

// ---------- Wortwolke ----------
const WW_HELL = ['#1565c0', '#c62828', '#2e7d32', '#6a1b9a', '#ef6c00', '#00838f', '#ad1457', '#283593'];
const WW_DUNKEL = ['#90caf9', '#ff8a80', '#a5d6a7', '#ce93d8', '#ffcc80', '#80deea', '#f48fb1', '#9fa8da'];
const WW_BSP = 'Ideen *4\nsammeln *2\nBegriffe *3\nWortwolke *5\nKlasse\nThema *2\nTafel\nhäufig = groß';
T.wortwolkeZaehlen = text => { // „Begriff“ mehrfach oder „Begriff *3“ → Häufigkeit
  const m = new Map();
  for (const z of zeilen(text)) {
    const g = z.match(/^(.*?)\s*\*\s*(\d+)$/), wort = (g ? g[1] : z).trim(), n = g ? Math.max(1, +g[2]) : 1, key = wort.toLowerCase();
    if (!wort) continue; const e = m.get(key); if (e) e.n += n; else m.set(key, { wort, n });
  }
  return [...m.values()].sort((a, b) => b.n - a.n || a.wort.localeCompare(b.wort, 'de')).slice(0, 80);
};
B.wortwolke = { name: 'Wortwolke', gruppe: 'Struktur', def: { titel: '', woerter: '', farbig: true },
  felder: [{ k: 'titel', l: 'Überschrift (optional)', typ: 'text' }, { k: 'woerter', l: 'Begriffe – mehrfach genannt = größer (oder „Begriff *3“)', typ: 'liste' }, { k: 'farbig', l: 'Bunt', typ: 'check' }],
  gen: (d, P) => {
    const leer = !zeilen(d.woerter).length, liste = T.wortwolkeZaehlen(leer ? WW_BSP : d.woerter), dunkel = P.ink !== '#1a1a1a';
    const max = liste.length ? liste[0].n : 1, min = liste.length ? liste[liste.length - 1].n : 1;
    const platz = [], pad = 6; let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
    const frei = (x, y, w, hh) => platz.every(r => x + w + pad <= r.x || r.x + r.w + pad <= x || y + hh + pad <= r.y || r.y + r.h + pad <= y);
    liste.forEach((e, i) => {
      const fs = max === min ? 44 : 26 + (e.n - min) / (max - min) * 66, w = mess(e.wort, fs, true), hh = fs * 1.05;
      for (let t = 0; t < 900; t += 0.18) { // Spirale von der Mitte nach außen (breiter als hoch)
        const r = 5 * t, x = r * 1.7 * Math.cos(t) - w / 2, y = r * Math.sin(t) - hh / 2;
        if (frei(x, y, w, hh)) { platz.push({ x, y, w, h: hh, fs, e, i }); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + hh); return; }
      }
    });
    const rand = 24, kopf = d.titel ? 70 : 0, W = Math.max(300, x1 - x0 + 2 * rand), H = Math.max(160, y1 - y0 + 2 * rand + kopf + (leer ? 40 : 0));
    const ox = (W - (x1 - x0)) / 2 - x0, oy = kopf + rand - y0, farben = dunkel ? WW_DUNKEL : WW_HELL;
    let s = rc(2, 2, W - 4, H - 4, P.grid, dunkel ? 'rgba(20,24,32,.55)' : 'rgba(255,255,255,.92)', 2, 'rx="22"'); // ruhige Karte – auch über anderem gut lesbar
    if (d.titel) s += tx(W / 2, 38, d.titel, P.ink, 34, 'middle', 'font-weight="700"');
    for (const p of platz) {
      const c = leer ? (dunkel ? 'rgba(255,255,255,.35)' : '#b8bfcc') : d.farbig ? farben[p.i % farben.length] : P.ink;
      const op = !d.farbig && !leer && max > min ? f(0.55 + 0.45 * (p.e.n - min) / (max - min)) : 1;
      s += `<text x="${f(p.x + ox + p.w / 2)}" y="${f(p.y + oy + p.h / 2)}" font-size="${f(p.fs)}" font-weight="700" fill="${c}" opacity="${op}" text-anchor="middle" dominant-baseline="central">${esc(p.e.wort)}</text>`;
    }
    if (leer) s += tx(W / 2, H - 22, 'Beispiel – ✏️ Bearbeiten: eigene Begriffe eintragen', P.acc, 18);
    return { svg: doc(W, H, s), w: W, h: H };
  } };
B.wortwolke.schnell = [{ l: '＋ Begriff', aus: async o => {
  const t = await T.frage('Begriff hinzufügen (schon vorhandene werden größer):', { feld: {}, ok: '＋ Hinzufügen' }); if (!t || !t.trim()) return;
  T.bausteinAendern(T.page().items.find(i => i.id === o.id) || o, { f: d => ({ d: { ...d, woerter: (zeilen(d.woerter).length ? d.woerter.replace(/\s*$/, '') + '\n' : '') + t.trim() } }) });
} }];

// ---------- Einfügen ----------
const massstab = () => T.clamp(1 / T.page().view.z, 0.5, 4);
let staffel = 0;
function zettelNeu(farbe, text, at) {
  const k = massstab(), [cx, cy] = at || T.viewCenter(), w = 220 * k, o = { t: 'o', id: T.uid(), k: 'zettel', d: { ...B.zettel.def, farbe, text: text || '' }, w, h: w, r: 0 };
  const versatz = at ? 0 : (staffel++ % 6) * 34 * k; o.x = cx - w / 2 + versatz; o.y = cy - w / 2 + versatz; return o;
}
const zettelDa = () => T.page().items.filter(i => i.t === 'o' && i.k === 'zettel');
function mehrereEintippen() {
  let farbe = T.opts.zettelFarbe || 'gelb';
  const ta = h('textarea', { class: 'feld', style: { minHeight: '220px', fontSize: '20px' }, placeholder: 'Ein Zettel pro Zeile …' });
  const fw = h('div', { class: 'row zettel-farben' });
  const male = () => { fw.innerHTML = ''; for (const [id, n, p] of ZF) fw.append(h('button', { class: 'zf' + (id === farbe ? ' on' : ''), style: { background: p }, title: n, onclick: () => { farbe = id; male(); } })); };
  male();
  T.openDlg([h('h2', {}, '🗒 Haftnotizen eintippen'), h('p', { class: 'hint' }, 'Jede Zeile wird ein eigener Zettel. Farbe:'), fw, ta,
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => {
      const L = zeilen(ta.value); if (!L.length) { T.toast('Bitte mindestens eine Zeile eintippen.'); return; }
      T.closeDlg(); T.opts.zettelFarbe = farbe; T.saveOpts();
      const k = massstab(), r = T.viewRect(), sp = Math.min(6, Math.max(1, Math.floor((r.x1 - r.x0 - 80 * k) / (250 * k)))), x0 = r.x0 + 60 * k, y0 = r.y0 + 100 * k;
      T.snap(); L.forEach((t, i) => { const o = zettelNeu(farbe, t, [0, 0]); o.x = x0 + (i % sp) * 250 * k; o.y = y0 + Math.floor(i / sp) * 250 * k; T.page().items.push(o); });
      T.render(); T.toast(L.length + ' Zettel auf der Tafel – mit dem Finger verschieben, „🗂 Clustern“ ordnet nach Farbe.', 3500);
    } }, '⤴ Auf die Tafel'))]);
  setTimeout(() => ta.focus(), 60);
}

// ---------- Clustern: Gruppen nach Farbe, Spalten mit Überschrift ----------
function clustern() {
  const pg = T.page(), zz = zettelDa(); if (!zz.length) { T.toast('Noch keine Haftnotizen auf dieser Seite.'); return; }
  const zw = Math.max(...zz.map(z => z.w)), zh = Math.max(...zz.map(z => z.h)), gap = zw * 0.12, kopfH = 64 * zw / 220;
  const x0 = Math.min(...zz.map(z => z.x)), y0 = Math.min(...zz.map(z => z.y)), ziel = new Map(), koepfe = [];
  // Handschrift auf einem Zettel gehört zu ihm und wandert mit
  const mit = new Map();
  for (const it of pg.items) if (it.t === 's') { const b = T.bbox(it), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, z = zz.slice().reverse().find(o => T.hitObj(o, cx, cy)); if (z) mit.set(it.id, z.id); }
  let gx = x0;
  for (const [id, name] of ZF) {
    const g = zz.filter(z => z.d.farbe === id); if (!g.length) continue;
    g.sort((a, b) => (b.d.punkte || 0) - (a.d.punkte || 0) || a.y - b.y || a.x - b.x);
    const sp = g.length <= 3 ? 1 : g.length <= 8 ? 2 : 3, gw = sp * zw + (sp - 1) * gap;
    g.forEach((z, i) => ziel.set(z.id, [gx + (i % sp) * (zw + gap), y0 + kopfH + gap + Math.floor(i / sp) * (zh + gap)]));
    const alt = pg.items.find(i => i.k === 'clusterkopf' && i.d.farbe === id), k = zw / 220;
    koepfe.push({ t: 'o', id: alt ? alt.id : T.uid(), k: 'clusterkopf', d: { ...B.clusterkopf.def, ...(alt ? alt.d : { titel: name }), farbe: id, breite: gw / k }, x: gx, y: y0, w: gw, h: kopfH, r: 0 });
    gx += gw + gap * 2.5;
  }
  T.snap();
  pg.items = pg.items.filter(i => i.k !== 'clusterkopf').concat(koepfe);
  const start = new Map(zz.map(z => [z.id, [z.x, z.y]])), striche = new Map(pg.items.filter(i => mit.has(i.id)).map(i => [i.id, i.p])), t0 = performance.now(), dauer = 450;
  let fertig = false;
  const setze = e => { // e = 0 … 1 (Anteil des Wegs)
    const lage = id => { const a = start.get(id), b = ziel.get(id); return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]; };
    pg.items = pg.items.map(it => {
      if (ziel.has(it.id)) { const [x, y] = lage(it.id); return { ...it, x, y }; }
      if (striche.has(it.id)) { const z = mit.get(it.id), a = start.get(z), [x, y] = lage(z), dx = x - a[0], dy = y - a[1]; return { ...it, p: striche.get(it.id).map(q => [T.r1(q[0] + dx), T.r1(q[1] + dy), q[2]]) }; }
      return it;
    });
    T.render(); T.renderOver();
  };
  const schritt = () => { if (fertig) return; const t = Math.min(1, (performance.now() - t0) / dauer); setze(1 - Math.pow(1 - t, 3)); if (t < 1) requestAnimationFrame(schritt); else fertig = true; };
  requestAnimationFrame(schritt);
  setTimeout(() => { if (!fertig) { fertig = true; setze(1); } }, dauer + 300); // falls die Animation pausiert (verborgenes Fenster): Endzustand sicher setzen
  T.toast('Nach Farbe geordnet. Überschrift antippen › ✏️ Bearbeiten zum Umbenennen.', 3500);
}

// ---------- Punkte-Abstimmung ----------
let leiste = null;
T.punkteModus = false;
T.zettelPunkt = (id, n = 1) => {
  const o = T.page().items.find(i => i.id === id); if (!o) return;
  T.snap(); T.replaceItem({ ...o, d: { ...o.d, punkte: Math.max(0, (o.d.punkte || 0) + n) } });
};
function auswerten() {
  const zz = zettelDa(), max = Math.max(0, ...zz.map(z => z.d.punkte || 0));
  if (!max) { T.toast('Noch keine Punkte vergeben.'); return; }
  T.snap(); const pg = T.page();
  pg.items = pg.items.map(it => it.k === 'zettel' ? { ...it, d: { ...it.d, sieger: (it.d.punkte || 0) === max } } : it); T.render();
  const sieger = zz.filter(z => (z.d.punkte || 0) === max);
  T.toast(`★ Meiste Punkte (${max}): ` + sieger.map(z => z.d.text ? '„' + z.d.text.replace(/\s+/g, ' ').slice(0, 40) + '“' : 'Zettel ' + zf(z.d.farbe)[1]).join(', '), 6000);
}
function punkteZurueck() {
  if (!zettelDa().some(z => z.d.punkte || z.d.sieger)) return;
  T.snap(); const pg = T.page(); pg.items = pg.items.map(it => it.k === 'zettel' ? { ...it, d: { ...it.d, punkte: 0, sieger: false } } : it); T.render();
}
T.punkteUmschalten = an => {
  T.punkteModus = an == null ? !T.punkteModus : an;
  if (leiste) { leiste.remove(); leiste = null; }
  if (T.punkteModus) {
    leiste = h('div', { id: 'punkteleiste' }, h('span', { class: 'pl-text' }, '🔴 Abstimmung: Zettel antippen = 1 Punkt'),
      h('button', { class: 'big', title: 'Letzten Punkt zurücknehmen', onclick: T.undo }, '↶'),
      h('button', { class: 'big', onclick: punkteZurueck }, '↺ Alle auf 0'),
      h('button', { class: 'big', onclick: auswerten }, '★ Auswerten'),
      h('button', { class: 'big prim', onclick: () => T.punkteUmschalten(false) }, '✓ Fertig'));
    document.body.append(leiste);
    if (!zettelDa().length) T.toast('Auf dieser Seite gibt es noch keine Haftnotizen.', 3000);
  }
  document.querySelectorAll('[data-punkte]').forEach(b => b.classList.toggle('on', T.punkteModus));
};

function wolkeAusZetteln() {
  const zz = zettelDa().filter(z => String(z.d.text || '').trim());
  if (!zz.length) { T.toast('Die Zettel haben noch keinen getippten Text – Handschrift kann die Tafel nicht lesen. Zettel doppelt antippen zum Eintippen.', 5500); return; }
  const woerter = zz.map(z => { const t = z.d.text.replace(/\s+/g, ' ').trim(), n = 1 + (z.d.punkte || 0); return n > 1 ? t + ' *' + n : t; }).join('\n');
  const d = { ...B.wortwolke.def, woerter }, g = T.genObj('wortwolke', d, false), alle = zettelDa().concat(T.page().items.filter(i => i.k === 'clusterkopf'));
  const zw = Math.max(...alle.map(z => z.w)), s = zw / 220; // gleicher Maßstab wie die Zettel, rechts daneben
  const x = Math.max(...alle.map(z => z.x + z.w)) + zw * 0.4, y = Math.min(...alle.map(z => z.y));
  const o = { t: 'o', id: T.uid(), k: 'wortwolke', d, x, y, w: g.w * s, h: g.h * s, r: 0 };
  T.snap(); T.addItem(o); T.nachEinfuegen([o.id]); T.allesZeigen();
  T.toast('Wortwolke aus ' + zz.length + ' Zetteln – gleiche Begriffe und Punkte machen ein Wort größer.', 4000);
}

// Bereich in Einfügen › Strukturieren
T.zettelPanel = () => {
  const farben = h('div', { class: 'row zettel-farben' }, ...ZF.map(([id, n, p]) => h('button', { class: 'zf', style: { background: p }, title: 'Zettel ' + n, onclick: () => {
    const o = zettelNeu(id); T.snap(); T.addItem(o); T.opts.zettelFarbe = id; T.saveOpts();
    if (!T.zettelTipp) { T.zettelTipp = 1; T.toast('Zettel: mit dem Finger verschieben, mit dem Stift beschriften – doppelt antippen zum Eintippen.', 4000); }
  } })));
  return [h('div', { class: 'einf-box haft' }, h('h3', {}, '🗒 Haftnotizen'), farben, /* eigener, gelb hinterlegter Kasten – deutlich getrennt von den Vorlagen */
    h('div', { class: 'tiles klein' },
      h('button', { class: 'tile', onclick: mehrereEintippen }, h('div', { class: 'em' }, '⌨'), 'Mehrere eintippen'),
      h('button', { class: 'tile', onclick: clustern }, h('div', { class: 'em' }, '🗂'), 'Clustern (nach Farbe)'),
      h('button', { class: 'tile' + (T.punkteModus ? ' on' : ''), 'data-punkte': 1, onclick: () => T.punkteUmschalten() }, h('div', { class: 'em' }, '🔴'), 'Punkte verteilen'),
      h('button', { class: 'tile', onclick: wolkeAusZetteln }, h('div', { class: 'em' }, '☁'), 'Wortwolke aus Zetteln')),
    h('p', { class: 'hint' }, 'Farbe antippen = neuer Zettel. „Clustern“ sortiert nach Farbe (meiste Punkte oben), „Punkte verteilen“: jeder Tipp auf einen Zettel gibt einen Punkt.')),
    h('h3', { class: 'einf-trenner' }, '📋 Vorlagen zum Strukturieren')];
};
})();
