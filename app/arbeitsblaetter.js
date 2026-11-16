// Tafel-App – 📄 Arbeitsblätter: importierte Arbeitsblätter (PDF, Word, PowerPoint, Bilder – eine oder mehrere Seiten) ablegen
// und später per Klick wieder einfügen. Sortiert nach Fach, Jahrgang und Thema.
// SPEICHERN: nach einem Import im Hinweis „📄 Als Arbeitsblatt speichern“ – oder 💾 Speichern ▾ › „📄 Als Arbeitsblatt speichern“.
// EINFÜGEN: Einfügen › 📄 Arbeitsblätter (Filter Fach/Jahrgang, Suche) › antippen = als neue Seite(n) hinter der aktuellen.
// Ablage: Ablageordner › Lehrkraft › „_Arbeitsblätter“ › Fach › „Jg 7 – Thema.ab.json“ (+ Vorschaubild „… .ab.jpg“).
// Ohne Ablageordner (iPad): im Browser-Speicher (IndexedDB). Fremde Dateien werden nie überschrieben.
'use strict';
(function () {
const h = T.h, S = T.S, F = T.ablage, ORD = '_Arbeitsblätter';
const lk = () => T.opts.lehrkraft || 'Lehrkraft';
const mitOrdner = () => !!(F && F.root && T.opts.lehrkraft);
const JG = [5, 6, 7, 8, 9, 10];
const NAME_RE = /^(?:Jg (\d+) – )?(.*?)(?: \((\d+)\))?\.ab\.json$/;
let filter = { fach: null, jg: 0, suche: '' }, cache = null, cacheFuer = null, neuZeichnen = null;

/* ---------- Speicher ---------- */
const dateiBasis = e => F.safe((e.jg ? 'Jg ' + e.jg + ' – ' : '') + e.thema);
async function liste() {
  if (cache && cacheFuer === lk() + '|' + mitOrdner()) return cache;
  const out = [];
  if (mitOrdner()) {
    try {
      const wurzel = await F.dir([lk(), ORD], false);
      for await (const [fach, fd] of wurzel.entries()) {
        if (fd.kind !== 'directory') continue;
        const bilder = {};
        for await (const [n, x] of fd.entries()) if (x.kind === 'file' && /\.ab\.jpg$/i.test(n)) bilder[n.replace(/\.jpg$/i, '.json')] = x;
        for await (const [n, x] of fd.entries()) {
          const m = x.kind === 'file' && n.match(NAME_RE); if (!m) continue;
          let datum = 0; try { datum = (await x.getFile()).lastModified; } catch (e) {}
          out.push({ id: fach + '/' + n, fach, jg: m[1] ? +m[1] : 0, thema: m[2], datei: n, fachDir: fd, bildFh: bilder[n] || null, datum });
        }
      }
    } catch (e) { /* noch kein Ordner „_Arbeitsblätter“ */ }
  } else {
    try { const a = await T.idbGet('arbeitsblaetter:' + lk()); if (Array.isArray(a)) out.push(...a); } catch (e) {}
  }
  out.sort((a, b) => (a.fach || '').localeCompare(b.fach || '', 'de') || (a.jg || 99) - (b.jg || 99) || a.thema.localeCompare(b.thema, 'de', { numeric: true }));
  cache = out; cacheFuer = lk() + '|' + mitOrdner();
  return out;
}
const neuLaden = () => { cache = null; if (neuZeichnen) neuZeichnen(); };
async function laden(e) {
  if (e.fachDir) return JSON.parse(await (await (await e.fachDir.getFileHandle(e.datei)).getFile()).text());
  return await T.idbGet('ab:' + e.id);
}
async function sichern(e, seiten) {
  const inhalt = { app: 'Tafel-App-Arbeitsblatt', version: 1, thema: e.thema, fach: e.fach, jg: e.jg || 0, erstellt: new Date().toISOString(), lehrkraft: lk(), seiten };
  if (mitOrdner()) {
    const d = await F.dir([lk(), ORD, e.fach], true), basis = dateiBasis(e);
    let name = basis + '.ab.json', i = 2;
    for (;;) { try { await d.getFileHandle(name); name = `${basis} (${i++}).ab.json`; } catch (x) { break; } } /* nie überschreiben */
    const w = await (await d.getFileHandle(name, { create: true })).createWritable(); await w.write(JSON.stringify(inhalt)); await w.close();
    if (e.bild) { try { const blob = await (await fetch(e.bild)).blob(), wb = await (await d.getFileHandle(name.replace(/\.json$/, '.jpg'), { create: true })).createWritable(); await wb.write(blob); await wb.close(); } catch (x) {} }
  } else {
    const id = T.uid(), a = (await T.idbGet('arbeitsblaetter:' + lk())) || [];
    await T.idbSet('ab:' + id, inhalt);
    a.push({ id, thema: e.thema, fach: e.fach, jg: e.jg || 0, bild: e.bild || '', seitenAnz: seiten.length, datum: Date.now() });
    await T.idbSet('arbeitsblaetter:' + lk(), a);
  }
}
async function loeschen(e) {
  if (e.fachDir) {
    await e.fachDir.removeEntry(e.datei);
    try { await e.fachDir.removeEntry(e.datei.replace(/\.json$/, '.jpg')); } catch (x) {}
  } else {
    const a = ((await T.idbGet('arbeitsblaetter:' + lk())) || []).filter(x => x.id !== e.id);
    await T.idbSet('arbeitsblaetter:' + lk(), a); await T.idbSet('ab:' + e.id, null);
  }
}

/* ---------- Speichern-Dialog ---------- */
/* von, bis: Seitenindex (0-basiert); ohne Angabe die aktuelle Seite */
T.alsArbeitsblatt = (von, bis) => {
  if (!S.board) return;
  const n = S.board.pages.length;
  let a = von != null ? von : S.page, b = bis != null ? bis : a;
  const e = { thema: (T.page().titel || '').trim(), fach: (T.tafelFachMA ? T.tafelFachMA() : (S.board.fach || '')) || 'Sonstiges', jg: 0 };
  const faecher = T.faecherListe ? T.faecherListe(e.fach) : [e.fach];
  const thema = h('input', { class: 'feld', value: e.thema, placeholder: 'Thema, z. B. „Brüche erweitern“ oder „Simple past – Übungen“', oninput: ev => { e.thema = ev.target.value; } });
  const fach = h('select', { class: 'feld', onchange: ev => { e.fach = ev.target.value; } }, ...faecher.map(f => h('option', { value: f, selected: f === e.fach }, f)));
  const jgReihe = h('div', { class: 'row ma-jg' }, ...[0, ...JG].map(j => h('button', { class: 'big' + (e.jg === j ? ' on' : ''), onclick: () => { e.jg = j; [...jgReihe.children].forEach((k, i) => k.classList.toggle('on', [0, ...JG][i] === j)); } }, j ? 'Jg. ' + j : 'alle')));
  const zahl = (wert, setze) => h('input', { class: 'feld', type: 'number', min: 1, max: n, value: wert + 1, style: { width: '80px' }, onchange: ev => { setze(T.clamp((+ev.target.value || 1) - 1, 0, n - 1)); } });
  const bild = h('img', { class: 'ma-bild', alt: '' });
  const vorschau = () => { const pg = S.board.pages[a]; if (pg && T.vorschauBild && pg.items.length) T.vorschauBild(pg.items, pg.bg).then(src => { bild.src = src; e.bild = src; }).catch(() => {}); };
  vorschau();
  const speichern = async () => {
    e.thema = e.thema.trim(); if (!e.thema) { T.toast('Bitte ein Thema eingeben.'); thema.focus(); return; }
    if (b < a) [a, b] = [b, a];
    const seiten = JSON.parse(JSON.stringify(S.board.pages.slice(a, b + 1)));
    if (!seiten.some(p => p.items && p.items.length)) { T.toast('Diese Seite(n) sind leer.'); return; }
    seiten.forEach(p => p.items.forEach(i => { delete i.ag; }));
    if (!e.bild && T.vorschauBild) { try { e.bild = await T.vorschauBild(seiten[0].items, seiten[0].bg); } catch (x) {} }
    try { await sichern(e, seiten); } catch (x) { T.toast('Nicht gespeichert: ' + (x.message || x), 5000); return; }
    T.closeDlg(); neuLaden();
    T.toast(`📄 Arbeitsblatt „${e.thema}“ gespeichert – unter Einfügen › 📄 Arbeitsblätter.`, 3000, [['Öffnen', () => T.einfuegenKategorie && T.einfuegenKategorie('Arbeitsblaetter')]]);
  };
  T.openDlg([h('h2', {}, '📄 Als Arbeitsblatt speichern'), bild,
    h('label', { class: 'fld' }, 'Thema', thema),
    h('label', { class: 'fld' }, 'Fach', fach),
    h('div', { class: 'fld' }, h('span', {}, 'Jahrgang'), jgReihe),
    n > 1 ? h('div', { class: 'fld' }, h('span', {}, 'Seiten'), h('div', { class: 'row', style: { alignItems: 'center', gap: '8px' } },
      'von', zahl(a, v => { a = v; vorschau(); }), 'bis', zahl(b, v => { b = v; }), h('span', { class: 'hint' }, `(die Tafel hat ${n} Seiten)`))) : '',
    h('p', { class: 'hint' }, mitOrdner() ? `Liegt im Ablageordner unter ${lk()} › ${ORD} › Fach.` : 'Ohne Ablageordner liegt es nur im Speicher dieses Browsers.'),
    h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: speichern }, '📄 Speichern'))]);
  setTimeout(() => thema.focus(), 50);
};

/* ---------- Einfügen ---------- */
async function einfuegen(e) {
  let d; try { d = await laden(e); } catch (x) { d = null; }
  if (!d || !Array.isArray(d.seiten) || !d.seiten.length) { T.toast('Das Arbeitsblatt konnte nicht geladen werden.', 4000); return; }
  T.snap();
  const start = S.page + 1;
  const neu = d.seiten.map(p => {
    const k = JSON.parse(JSON.stringify(p)), ids = new Map((k.items || []).map(it => [it.id, T.uid()]));
    k.items = (k.items || []).map(it => {
      const x = { ...it, id: ids.get(it.id) };
      if (x.an) { const an = x.an.map(i => Array.isArray(i) ? (i.every(j => ids.has(j)) ? i.map(j => ids.get(j)) : null) : ids.get(i)); if (an[0] && an[1]) x.an = an; else delete x.an; }
      return x; });
    if (T.neueGruppen) T.neueGruppen(k.items);
    if (!k.view) k.view = { x: 0, y: 0, z: 1 };
    return k; });
  S.board.pages.splice(start, 0, ...neu);
  T.gotoPage(start); T.changed && T.changed();
  T.toast(`📄 „${e.thema}“ eingefügt (${neu.length} Seite${neu.length === 1 ? '' : 'n'} ab Seite ${start + 1}).`, 2500);
}

T.arbeitsblaetterPanel = () => {
  const box = h('div', {}, h('p', { class: 'hint' }, 'Wird geladen …'));
  let verwalten = false; cache = null; /* beim Öffnen frisch lesen – es kann inzwischen etwas über den Ordner dazugekommen sein */
  const zeichne = async () => {
    const alle = await liste(); box.innerHTML = '';
    if (filter.fach == null) { const f = T.tafelFachMA ? T.tafelFachMA() : ''; filter.fach = alle.some(e => e.fach === f) ? f : ''; }
    const faecher = [...new Set(alle.map(e => e.fach).concat(filter.fach ? [filter.fach] : []))].sort((a, b) => a.localeCompare(b, 'de'));
    const auswahl = (wert, opts, setze, title) => h('select', { class: 'feld', title, onchange: ev => { setze(ev.target.value); zeichne(); } }, ...opts.map(([v, l]) => h('option', { value: v, selected: String(v) === String(wert) }, l)));
    const suche = h('input', { class: 'feld', type: 'search', value: filter.suche, placeholder: '🔍 Thema suchen …', style: { flex: '1 1 160px' },
      oninput: ev => { filter.suche = ev.target.value; clearTimeout(suche.t); suche.t = setTimeout(() => { zeichne().then(() => { const s = box.querySelector('input[type=search]'); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } }); }, 250); } });
    const speichernKnopf = h('button', { class: 'big', title: 'Die aktuelle Seite (oder mehrere Seiten) als Arbeitsblatt ablegen', onclick: () => T.alsArbeitsblatt() }, '📄 Diese Seite als Arbeitsblatt speichern');
    box.append(h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }, speichernKnopf,
      alle.length ? h('button', { class: 'big' + (verwalten ? ' on' : ''), title: 'Löschen', onclick: () => { verwalten = !verwalten; zeichne(); } }, verwalten ? '✓ Fertig' : '✏️ Verwalten') : ''));
    if (!alle.length) { box.append(h('p', { class: 'hint' }, 'Noch keine Arbeitsblätter. So geht’s: Arbeitsblatt importieren (Einfügen › 🖼️ Bilder & Text › PDF, Word oder PowerPoint) – danach im Hinweis „📄 Als Arbeitsblatt speichern“ antippen, Thema, Fach und Jahrgang wählen. Oder später über 💾 Speichern ▾ › „📄 Als Arbeitsblatt speichern“.')); return; }
    box.append(h('div', { class: 'row ma-filter', style: { flexWrap: 'wrap', gap: '6px', margin: '8px 0' } },
      auswahl(filter.fach, [['', 'alle Fächer'], ...faecher.map(f => [f, f])], v => { filter.fach = v; }, 'Fach'),
      auswahl(filter.jg, [[0, 'alle Jahrgänge'], ...JG.map(j => [j, 'Jg. ' + j])], v => { filter.jg = +v; }, 'Jahrgang'),
      suche));
    const such = String(filter.suche || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
    const treffer = alle.filter(e => (!filter.fach || e.fach === filter.fach) && (!filter.jg || !e.jg || e.jg === filter.jg)
      && such.every(w => (e.thema + ' ' + e.fach + (e.jg ? ' jg ' + e.jg : '')).toLowerCase().includes(w)));
    if (!treffer.length) { box.append(h('p', { class: 'hint' }, 'Nichts gefunden – Filter oben ändern (z. B. „alle Fächer“).')); return; }
    const gruppen = new Map();
    for (const e of treffer) { const k = e.fach + (e.jg ? ' · Jg. ' + e.jg : ' · alle Jahrgänge'); if (!gruppen.has(k)) gruppen.set(k, []); gruppen.get(k).push(e); }
    for (const [titel, es] of gruppen) {
      box.append(h('h3', {}, titel));
      box.append(h('div', { class: 'tiles' }, ...es.map(e => {
        const img = h('img', { alt: '' });
        if (e.bild) img.src = e.bild;
        else if (e.bildFh) e.bildFh.getFile().then(f => { e.bild = URL.createObjectURL(f); img.src = e.bild; }).catch(() => {});
        const t = h('button', { class: 'tile vl-tile', title: verwalten ? '' : 'Antippen: als neue Seite(n) hinter der aktuellen einfügen', onclick: () => { if (!verwalten) einfuegen(e); } },
          e.bild || e.bildFh ? img : h('div', { class: 'em' }, '📄'), e.thema);
        if (!verwalten) return t;
        return h('div', { class: 'vl-verw' }, t, h('div', { class: 'row' },
          h('button', { class: 'big warn', title: 'Löschen', onclick: async () => { if (await T.frage(`Arbeitsblatt „${e.thema}“ löschen?`, { ok: '🗑 Löschen' })) { try { await loeschen(e); } catch (x) { T.toast('Nicht gelöscht: ' + (x.message || x), 4000); } neuLaden(); } } }, '🗑')));
      })));
    }
  };
  neuZeichnen = () => { if (box.isConnected) zeichne(); };
  zeichne();
  return box;
};
})();
