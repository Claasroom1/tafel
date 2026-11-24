// Tafel-App – 📄 Arbeitsblätter: importierte Arbeitsblätter (PDF, Word, PowerPoint, Bilder – eine oder mehrere Seiten) ablegen
// und später per Klick wieder einfügen. Sortiert nach Fach, Jahrgang und Thema.
// SPEICHERN: nach einem Import im Hinweis „📄 Als Arbeitsblatt speichern“ – oder 💾 Speichern ▾ › „📄 Als Arbeitsblatt speichern“.
// EINFÜGEN: Vorlagen › 📄 Arbeitsblätter (Filter Fach/Jahrgang, Suche) › antippen = als neue Seite(n) hinter der aktuellen.
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

/* JPEG-Bild verkleinern (nur wenn es dadurch wirklich kleiner wird) */
const verkleinern = src => new Promise(ok => { const img = new Image();
  img.onload = () => { const f = Math.min(1, 1300 / img.naturalWidth), c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * f); c.height = Math.round(img.naturalHeight * f);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); const u = c.toDataURL('image/jpeg', 0.6); ok(u.length < src.length * 0.9 ? u : src); };
  img.onerror = () => ok(src); img.src = src; });

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
    /* große Seitenbilder (ältere PDF-Importe, Fotos) schlank speichern: höchstens 1300 px breit, JPEG 60 % – auch in der offenen Tafel */
    const neu = new Map();
    for (const p of seiten) for (const it of p.items) if (it.k === 'bild' && it.d && /^data:image\/jpeg/.test(it.d.src || '') && it.d.src.length > 350000) {
      if (!neu.has(it.d.src)) neu.set(it.d.src, await verkleinern(it.d.src)); it.d.src = neu.get(it.d.src); }
    if ([...neu].some(([a, b]) => a !== b)) { for (const p of S.board.pages) for (const it of p.items) if (it.k === 'bild' && it.d && neu.has(it.d.src)) it.d = { ...it.d, src: neu.get(it.d.src) }; T.changed(); T.render(); }
    if (!e.bild && T.vorschauBild) { try { e.bild = await T.vorschauBild(seiten[0].items, seiten[0].bg); } catch (x) {} }
    try { await sichern(e, seiten); } catch (x) { T.toast('Nicht gespeichert: ' + (x.message || x), 5000); return; }
    T.closeDlg(); neuLaden();
    T.toast(`📄 Arbeitsblatt „${e.thema}“ gespeichert – unter Vorlagen › 📄 Arbeitsblätter.`, 3000, [['Öffnen', () => T.arbeitsblaetterFenster()]]);
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

/* ---------- Vorschau & Einfügen ---------- */
/* Bild einer Seite (alles darauf, eingepasst) in gewünschter Breite – groß genug zum Lesen */
async function seitenBild(p, breite) {
  const r = rahmenVon(p.items || []) || { x0: 0, y0: 0, x1: 1200, y1: 800 }, m = 16, w = r.x1 - r.x0 + 2 * m, hh = r.y1 - r.y0 + 2 * m, s = breite / w;
  const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.max(20, Math.round(hh * s));
  const x = c.getContext('2d'), pg = { ...p, view: { x: 0, y: 0, z: 1 } }, ber = { x0: r.x0 - m, y0: r.y0 - m, x1: r.x1 + m, y1: r.y1 + m };
  const male = () => { x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.setTransform(s, 0, 0, s, -ber.x0 * s, -ber.y0 * s); T.paintPage(x, pg, ber, 1 / s, { export: true }); };
  male(); await new Promise(res => setTimeout(res, 400)); male(); /* Bilder sind dann geladen */
  return c.toDataURL('image/jpeg', 0.88);
}
/* Antippen eines Arbeitsblatts: große Vorschau aller Seiten (blättern, zoomen), Seiten auswählen, dann einfügen –
   mehrere Seiten: „auf Seiten verteilen“ oder „auf einer Seite untereinander“; eine Seite: „neue Seite“ oder „auf diese Seite“ */
async function einfuegen(e) {
  let d; try { d = await laden(e); } catch (x) { d = null; }
  if (!d || !Array.isArray(d.seiten) || !d.seiten.length) { T.toast('Das Arbeitsblatt konnte nicht geladen werden.', 4000); return; }
  const n = d.seiten.length, gross = new Array(n), klein = new Array(n), wahl = new Set(d.seiten.map((_, i) => i));
  let k = 0, zoom = 1;
  const bild = h('img', { alt: '', title: 'Antippen: vergrößern / wieder einpassen', style: { display: 'block', width: '100%', cursor: 'zoom-in', background: '#fff' }, onclick: () => setzeZoom(zoom > 1 ? 1 : 2) });
  const ansicht = h('div', { style: { maxHeight: '56vh', overflow: 'auto', border: '1px solid var(--line, #ccc)', borderRadius: '10px', background: '#e5e7eb', touchAction: 'pan-x pan-y' } }, bild);
  const stand = h('b', { style: { minWidth: '110px', textAlign: 'center' } }), zoomTxt = h('span', { class: 'hint', style: { minWidth: '50px' } });
  const zurueck = h('button', { class: 'big', onclick: () => zeige(k - 1) }, '◀'), weiter = h('button', { class: 'big', onclick: () => zeige(k + 1) }, '▶');
  const leiste = h('div', { class: 'row', style: { flexWrap: 'nowrap', gap: '8px', overflowX: 'auto', padding: '4px 0' } });
  const knoepfe = h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '8px', marginTop: '6px' } }), zahl = h('span', { class: 'hint' });
  const setzeZoom = z => { zoom = T.clamp(z, 1, 4); bild.style.width = zoom * 100 + '%'; bild.style.cursor = zoom > 1 ? 'zoom-out' : 'zoom-in'; zoomTxt.textContent = Math.round(zoom * 100) + ' %'; };
  const zeige = async i => {
    k = T.clamp(i, 0, n - 1); stand.textContent = `Seite ${k + 1}/${n}`; zurueck.disabled = k === 0; weiter.disabled = k === n - 1;
    [...leiste.children].forEach((el, j) => { el.style.outline = j === k ? '3px solid var(--acc, #4f46e5)' : 'none'; });
    if (!gross[k]) { bild.style.opacity = '.4'; gross[k] = await seitenBild(d.seiten[k], 1500); }
    if (k === T.clamp(i, 0, n - 1)) { bild.src = gross[k]; bild.style.opacity = '1'; }
  };
  const aktionen = () => {
    const sel = [...wahl].sort((a, b) => a - b), m = sel.length, teil = { ...d, seiten: sel.map(i => d.seiten[i]) }, los = art => { T.closeDlg(); einsetzen(e, teil, art); };
    zahl.textContent = n > 1 ? `${m} von ${n} Seiten gewählt` : '';
    knoepfe.innerHTML = '';
    if (!m) { knoepfe.append(h('span', { class: 'hint' }, 'Mindestens eine Seite ankreuzen.')); return; }
    knoepfe.append(m > 1 ? h('button', { class: 'big prim', onclick: () => los('seiten') }, `📑 Auf ${m} Seiten verteilen`) : h('button', { class: 'big prim', onclick: () => los('seiten') }, '📄 Als neue Seite'),
      m > 1 ? h('button', { class: 'big', onclick: () => los('untereinander') }, '⬇ Auf einer Seite untereinander') : h('button', { class: 'big', title: 'Unter das, was schon auf der aktuellen Seite steht', onclick: () => los('hier') }, '⬇ Auf diese Seite (darunter)'));
  };
  d.seiten.forEach((p, i) => {
    const img = h('img', { alt: '', style: { width: '120px', height: '90px', objectFit: 'contain', background: '#fff', display: 'block', borderRadius: '6px' } });
    const haken = h('input', { type: 'checkbox', title: 'Diese Seite einfügen', style: { width: '22px', height: '22px' }, onclick: ev => ev.stopPropagation(), onchange: ev => { ev.target.checked ? wahl.add(i) : wahl.delete(i); aktionen(); } });
    haken.checked = true;
    leiste.append(h('div', { style: { flex: '0 0 auto', cursor: 'pointer', padding: '4px', borderRadius: '8px', background: 'var(--surface2, #f3f4f6)' }, title: 'Seite ' + (i + 1) + ' ansehen', onclick: () => zeige(i) },
      img, h('label', { class: 'row', style: { alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '4px' }, onclick: ev => ev.stopPropagation() }, n > 1 ? haken : '', h('span', {}, String(i + 1)))));
    klein[i] = img;
  });
  T.openDlg([h('h2', {}, `📄 ${e.thema}`),
    h('div', { class: 'row', style: { alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }, zurueck, stand, weiter, h('span', { style: { flex: 1 } }),
      h('button', { class: 'big', title: 'Verkleinern', onclick: () => setzeZoom(zoom - 0.5) }, '🔍−'), zoomTxt, h('button', { class: 'big', title: 'Vergrößern', onclick: () => setzeZoom(zoom + 0.5) }, '🔍＋')),
    ansicht,
    n > 1 ? h('div', { class: 'row', style: { alignItems: 'center', gap: '8px', marginTop: '6px' } }, h('b', {}, 'Alle Seiten'), zahl,
      h('button', { class: 'big', onclick: () => { const alle = wahl.size === n; wahl.clear(); if (!alle) d.seiten.forEach((_, i) => wahl.add(i)); leiste.querySelectorAll('input').forEach((c, i) => { c.checked = wahl.has(i); }); aktionen(); } }, 'Alle / keine')) : '',
    n > 1 ? leiste : '',
    knoepfe,
    h('p', { class: 'hint' }, 'Bild antippen = vergrößern (dann verschieben bzw. scrollen), nochmals = einpassen. ' + (n > 1 ? 'Häkchen = diese Seite einfügen. Verteilte Seiten heißen „' + e.thema + ' (1/…)“ und stehen im 📑 Seiten-Menü zur Auswahl.' : ''))], true);
  setzeZoom(1); aktionen(); await zeige(0);
  for (let i = 0; i < n; i++) { if (!T.h || !klein[i].isConnected) break; klein[i].src = await seitenBild(d.seiten[i], 260); } /* Mini-Vorschauen nach und nach */
}
/* Rahmen aller Elemente einer Seite (Weltkoordinaten) */
const rahmenVon = items => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of items) { const b = T.bbox(it); x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1); }
  return isFinite(x0) ? { x0, y0, x1, y1 } : null; };
const verschiebe = (it, dx, dy) => { if (it.t === 's') it.p = it.p.map(q => [T.r1(q[0] + dx), T.r1(q[1] + dy), q[2]]); else { it.x += dx; it.y += dy; } };
function einsetzen(e, d, art) {
  T.snap();
  const abId = T.uid(), n = d.seiten.length;
  const neu = d.seiten.map(p => {
    const k = JSON.parse(JSON.stringify(p)), ids = new Map((k.items || []).map(it => [it.id, T.uid()]));
    k.items = (k.items || []).map(it => {
      const x = { ...it, id: ids.get(it.id) };
      if (x.an) { const an = x.an.map(i => Array.isArray(i) ? (i.every(j => ids.has(j)) ? i.map(j => ids.get(j)) : null) : ids.get(i)); if (an[0] && an[1]) x.an = an; else delete x.an; }
      return x; });
    if (T.neueGruppen) T.neueGruppen(k.items);
    if (!k.view) k.view = { x: 0, y: 0, z: 1 };
    return k; });
  if (art === 'seiten') { /* jede Seite eine Tafelseite – Titel und Kennung fürs 📑 Seiten-Menü */
    neu.forEach((p, i) => { p.titel = n > 1 ? `${e.thema} (${i + 1}/${n})` : e.thema; p.ab = { id: abId, thema: e.thema, teil: i + 1, von: n }; });
    const start = S.page + 1;
    S.board.pages.splice(start, 0, ...neu);
    T.gotoPage(start); T.changed();
    T.toast(`📄 „${e.thema}“ eingefügt (${n} Seite${n === 1 ? '' : 'n'} ab Seite ${start + 1}).`, 2500);
    return;
  }
  /* untereinander: alle Seiten nacheinander nach unten, linksbündig – auf eine neue Seite bzw. unter das Vorhandene dieser Seite */
  const ziel = art === 'hier' ? T.page() : Object.assign(T.newPage(neu[0].bg || 'weiss'), { abstand: neu[0].abstand || null, titel: e.thema });
  const vorher = rahmenVon(ziel.items), ABST = 60;
  let y = vorher ? vorher.y1 + ABST : 0, x = vorher ? vorher.x0 : 0, erster = null;
  for (const p of neu) {
    const r = rahmenVon(p.items); if (!r) continue;
    p.items.forEach(it => verschiebe(it, x - r.x0, y - r.y0));
    if (!erster) erster = { x, y };
    ziel.items.push(...p.items); y += r.y1 - r.y0 + ABST;
  }
  if (art !== 'hier') {
    const z = Math.min(1, (T.W - T.ox - 80) / Math.max(400, (rahmenVon(ziel.items) || { x1: 1000, x0: 0 }).x1 - (rahmenVon(ziel.items) || { x0: 0 }).x0));
    ziel.view = { x: 40 - (erster ? erster.x : 0) * z, y: 70 - (erster ? erster.y : 0) * z, z };
    S.board.pages.splice(S.page + 1, 0, ziel); T.gotoPage(S.page + 1);
  } else { const v = T.page().view; if (erster) { v.y = 70 - erster.y * v.z; } T.render(); T.renderOver(); }
  T.changed();
  T.toast(`📄 „${e.thema}“ ${art === 'hier' ? 'auf diese Seite gesetzt' : 'auf einer neuen Seite untereinander eingefügt'} – nach unten scrollen für den Rest.`, 3000);
}

/* ---------- ⭐ Favoriten (Einfügen-Leiste): ein einzelnes Arbeitsblatt bzw. das Arbeitsblätter-Fenster ---------- */
const favId = e => 'einfuegen:ab:' + encodeURIComponent(e.id) + '|' + e.thema;
T.FAV_SONDER = T.FAV_SONDER || [];
T.FAV_SONDER.push({ prefix: 'einfuegen:ab:', sym: '📄', name: rest => rest.slice(rest.indexOf('|') + 1),
  run: async rest => { cache = null; const id = decodeURIComponent(rest.slice(0, rest.indexOf('|'))), e = (await liste()).find(x => String(x.id) === id);
    if (e) einfuegen(e); else T.toast('Dieses Arbeitsblatt gibt es nicht mehr (gelöscht, umbenannt oder anderer Ablageordner).', 4000); } },
  { prefix: 'einfuegen:abfenster', sym: '📄', name: () => 'Arbeitsblätter', run: () => T.arbeitsblaetterFenster() });

/* ---------- Eigenes Fenster (Vorlagen › ☰ Alle › 📄 Arbeitsblätter) ---------- */
T.arbeitsblaetterFenster = () => {
  T.openDlg([h('h2', {}, '📄 Arbeitsblätter'), T.arbeitsblaetterPanel(),
    h('p', { class: 'hint' }, 'Antippen fügt das Arbeitsblatt ein – vorher fragt die App: auf mehrere Seiten verteilen oder auf einer Seite untereinander.')], true);
};
/* Liste der Arbeitsblätter, die auf dieser Tafel auf mehrere Seiten verteilt sind (für das 📑 Seiten-Menü) */
T.arbeitsblaetterDerTafel = () => {
  const m = new Map(); if (!S.board) return [];
  S.board.pages.forEach((p, i) => { if (p.ab && p.ab.id) { if (!m.has(p.ab.id)) m.set(p.ab.id, { thema: p.ab.thema, seiten: [] }); m.get(p.ab.id).seiten.push(i); } });
  return [...m.values()];
};

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
    if (!alle.length) { box.append(h('p', { class: 'hint' }, 'Noch keine Arbeitsblätter. So geht’s: Arbeitsblatt importieren (Vorlagen › 🖼️ Bilder & Text › PDF, Word oder PowerPoint) – danach im Hinweis „📄 Als Arbeitsblatt speichern“ antippen, Thema, Fach und Jahrgang wählen. Oder später über 💾 Speichern ▾ › „📄 Als Arbeitsblatt speichern“.')); return; }
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
        if (!verwalten) { if (T.favStern) T.favStern(favId(e), t); return t; } /* ☆ = in die Einfügen-Leiste */
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
