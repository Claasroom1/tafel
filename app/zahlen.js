// Tafel-App – ✏️ Texte anpassen und 🔢 Zahlen anpassen – für ALLE Bausteine (Vorlagen, Belehrungen, Bildtafeln, Erklärtafeln …):
// Im Kontextmenü stehen „✏️ Texte anpassen“ (jede Zeile der Tafel umformulieren oder weglassen) und „🔢 Zahlen anpassen“
// (jede Zahl einzeln ändern, z. B. neue Sitzzahl, andere Jahreszahl). Ausgenommen sind Elemente, die man ohnehin direkt bearbeitet
// (Text, Formel, Bild, Übungskärtchen, Lösungen).
// Gespeichert wird je Änderung der ursprüngliche Text bzw. die ursprüngliche Zahl. Ändert sich die Tafel selbst (z. B. über ✏️ Bearbeiten),
// greift eine Änderung nur noch, wenn dort weiterhin derselbe Text bzw. dieselbe Zahl steht – so landet nie etwas an der falschen Stelle.
// Die Änderungen wirken vor 🙈 Erarbeiten (erarbeiten.js verdeckt also die angepassten Texte).
'use strict';
(function () {
const B = T.BAUSTEINE, h = T.h;
const AUSNAHMEN = new Set(['text', 'formel', 'bild', 'ukarte', 'uziel', 'uknopf', 'loesung', 'kacheln', 'abdeckung']);
const OHNE_ZAHLEN = new Set(['sp_turnier', 'sp_teams', 'be_uebersicht']); /* Zahlen kommen dort aus dem Ablauf (Spielnummern, Haken) */
const ZAHL = /\d+(?:[.,]\d+)*/g;
const ent = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const leer = o => !o || !Object.keys(o).length;
/* alle Texte der Tafel (in Reihenfolge; leere zählen nicht) */
function texteFinden(svg) {
  const out = [], re = /<text [^>]*>([^<]*)<\/text>/g; let m;
  while ((m = re.exec(svg))) { const t = ent(m[1]); if (t.trim()) out.push(t); }
  return out;
}
function zahlenFinden(svg) {
  const out = []; texteFinden(svg).forEach((t, ti) => { let n, ni = 0; ZAHL.lastIndex = 0; while ((n = ZAHL.exec(t))) out.push({ key: ti + '.' + ni++, alt: n[0], zeile: t, pos: n.index }); });
  return out;
}
/* Texte ersetzen (zuerst ganze Zeilen, dann einzelne Zahlen) – Schlüssel = Nummer des Textes.
   markieren: jeder Text bekommt data-ti (seine Nummer) – für das direkte Bearbeiten auf der Tafel */
function anwenden(svg, tx, zl, markieren) {
  let ti = 0;
  return svg.replace(/(<text )([^>]*>)([^<]*)(<\/text>)/g, (all, a0, a1, inhalt, e) => {
    const t = ent(inhalt); if (!t.trim()) return all;
    const i = ti++; let neu = t;
    const w = tx && tx[i]; if (w && w.alt === t) neu = w.neu;
    else if (zl) { let ni = 0; neu = t.replace(ZAHL, alt => { const z = zl[i + '.' + ni++]; return z && z.alt === alt ? z.neu : alt; }); }
    const a = a0 + (markieren ? `data-ti="${i}" ` : '') + a1;
    return neu === t && !markieren ? all : a + esc(neu) + e;
  });
}
/* ✏️ Direkt ändern: Lage der Texte schätzen (wie in erarbeiten.js) */
const attr = (a, n) => { const m = a.match(new RegExp('(?:^|\\s)' + n + '="([^"]*)"')); return m ? m[1] : null; };
function textLagen(svg) {
  const out = [], re = /<text ([^>]*)>([^<]*)<\/text>/g; let m;
  while ((m = re.exec(svg))) {
    const a = m[1], ti = attr(a, 'data-ti'); if (ti == null) continue;
    const t = ent(m[2]), x = +attr(a, 'x') || 0, y = +attr(a, 'y') || 0, gr = +attr(a, 'font-size') || 20, anker = attr(a, 'text-anchor') || 'start', fett = /font-weight="(700|bold)"/.test(a);
    const w = Math.max(gr * 2, [...t].length * gr * (fett ? 0.6 : 0.55)), hh = gr * 1.3, x0 = anker === 'middle' ? x - w / 2 : anker === 'end' ? x - w : x;
    if (/rotate\(/.test(attr(a, 'transform') || '')) continue; /* gedrehte Beschriftungen: über die Liste ändern */
    out.push({ i: +ti, t, x0, y0: /central|middle/.test(attr(a, 'dominant-baseline') || '') ? y - hh / 2 : y - gr * 0.85, w, h: hh, gr, anker });
  }
  return out;
}
/* Eingabefeld genau über dem Text auf dem Bildschirm */
let offenesFeld = null;
function direktFeld(o, i) {
  if (offenesFeld) offenesFeld.fertig(true);
  const cur = T.page().items.find(x => x.id === o.id) || o, g = T.genObj(o.k, cur.d, false), L = textLagen(g.svg).find(q => q.i === i); if (!L) return;
  const orig = texteFinden(roh(cur))[i]; if (orig == null) return;
  const v = T.page().view, [ax, ay] = T.svgZuWelt(cur, g, L.x0, L.y0), [bx, by] = T.svgZuWelt(cur, g, L.x0 + L.w, L.y0 + L.h);
  const sx = T.ox + v.x + Math.min(ax, bx) * v.z, sy = v.y + Math.min(ay, by) * v.z, sw = Math.abs(bx - ax) * v.z, sh = Math.abs(by - ay) * v.z;
  const jetzt = L.t, inp = h('input', { class: 'direkt-text', value: jetzt });
  Object.assign(inp.style, { position: 'fixed', left: Math.max(4, sx - 6) + 'px', top: (sy - 4) + 'px', width: Math.min(innerWidth - 20, Math.max(sw + 60, 220)) + 'px', height: Math.max(30, sh + 8) + 'px',
    fontSize: Math.max(14, sh * 0.72) + 'px', zIndex: 60, padding: '0 6px', border: '2px solid #1e88e5', borderRadius: '8px', background: '#fffde7', color: '#1b1f2a', boxShadow: '0 4px 16px rgba(0,0,0,.25)' });
  let erledigt = false;
  const fertig = speichern => {
    if (erledigt) return; erledigt = true; inp.remove(); offenesFeld = null; document.removeEventListener('pointerdown', aussen, true);
    if (!speichern || inp.value === jetzt) return;
    const c2 = T.page().items.find(x => x.id === o.id); if (!c2) return;
    const tx = { ...((c2.d || {}).texte || {}) }; if (inp.value === orig) delete tx[i]; else tx[i] = { alt: orig, neu: inp.value };
    aendernMitDaten(c2, tx, (c2.d || {}).zahlen); /* Wert in den Daten (z. B. Diagramm-Tabelle) → Diagramm zieht mit */
  };
  const aussen = e => { if (e.target !== inp) fertig(true); };
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') fertig(true); else if (e.key === 'Escape') fertig(false); });
  inp.addEventListener('pointerdown', e => e.stopPropagation());
  document.body.append(inp); offenesFeld = { fertig }; setTimeout(() => { inp.focus(); inp.select(); document.addEventListener('pointerdown', aussen, true); }, 30);
}
/* 📊 Werte sind Daten: Steht ein geänderter Text bzw. eine geänderte Zahl als Wert in einem Feld des Bausteins (Tabelle, Liste, Text, Zahl –
   z. B. die Wertetabelle eines Diagramms, Klimadaten, Überschrift), wird der WERT geändert statt nur die Anzeige. Dann zieht alles mit,
   was daraus gezeichnet wird (Säulen, Kurven, Achsen …). Welche Zelle zu Text Nr. i gehört, wird zuverlässig ermittelt: Kandidaten-Zelle
   probeweise durch eine Markierung ersetzen und schauen, ob genau Text Nr. i sie danach enthält. Passt nichts, bleibt es bei der Anzeige-Änderung. */
const MARK = '⟦m⟧';
function datenStellen(Bk, d, alt) {
  const a = String(alt).trim(), out = []; if (!a || !Array.isArray(Bk.felder)) return out;
  for (const fd of Bk.felder) {
    const v = d[fd.k]; if (v == null || typeof v === 'object') continue;
    if (fd.typ === 'zahl' || fd.typ === 'text') { if (String(v).trim() === a) out.push({ setze: (dd, neu) => ({ ...dd, [fd.k]: fd.typ === 'zahl' && !isNaN(+String(neu).replace(',', '.')) ? +String(neu).replace(',', '.') : neu }) }); continue; }
    if (fd.typ !== 'tabelle' && fd.typ !== 'liste') continue;
    const zeilen = String(v).split(/(\r?\n)/);
    zeilen.forEach((z, zi) => { if (zi % 2) return; z.split(/(;|\t)/).forEach((c, ci) => { if (ci % 2 || c.trim() !== a) return;
      out.push({ setze: (dd, neu) => { const zs = String(dd[fd.k]).split(/(\r?\n)/), ts = zs[zi].split(/(;|\t)/); ts[ci] = ts[ci].replace(a, neu); zs[zi] = ts.join(''); return { ...dd, [fd.k]: zs.join('') }; } }); }); });
  }
  return out;
}
function datenStelle(o, i, alt) {
  const Bk = B[o.k]; if (!Bk || !Bk.__genT) return null;
  const d = { ...Bk.def, ...o.d, texte: {}, zahlen: {} }, P = T.palette ? T.palette(false) : {};
  for (const st of datenStellen(Bk, d, alt)) {
    try { const t = texteFinden(Bk.__genT(st.setze(d, MARK), P).svg); if (t[i] != null && t[i].includes(MARK)) return st; } catch (e) {}
  }
  return null;
}
/* Änderungen übernehmen: was in den Daten steht, dort ändern; der Rest bleibt Anzeige-Änderung (texte/zahlen) */
function aendernMitDaten(o, tx, zl) {
  const roh0 = texteFinden(roh(o)); let d = { ...o.d }; const tRest = { ...(tx || {}) }, zRest = { ...(zl || {}) };
  for (const [i, w] of Object.entries(tx || {})) { if (w.alt !== roh0[+i] || w.neu === '') continue; const st = datenStelle({ ...o, d }, +i, w.alt); if (st) { d = st.setze(d, w.neu); delete tRest[i]; } }
  for (const [key, w] of Object.entries(zl || {})) { const i = +key.split('.')[0]; if (tRest[i]) continue; const st = datenStelle({ ...o, d }, i, w.alt); if (st) { d = st.setze(d, w.neu); delete zRest[key]; } }
  T.bausteinAendern(o, { f: () => ({ d: { ...d, texte: tRest, zahlen: zRest } }) });
}
const roh = (o, extra) => { const Bk = B[o.k]; return Bk.__genT({ ...Bk.def, ...o.d, texte: {}, zahlen: {}, ...(extra || {}) }, T.palette ? T.palette(false) : {}).svg; };
const uebernehmen = (o, feld, wert) => T.bausteinAendern(o, { f: dd => ({ d: { ...dd, [feld]: wert } }) });
const knoepfe = (o, feld, werte) => h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Abbrechen'),
  !leer((o.d || {})[feld]) ? h('button', { class: 'big', onclick: () => { T.closeDlg(); uebernehmen(o, feld, {}); } }, '↺ Alle wie in der Vorlage') : '',
  h('button', { class: 'big prim', onclick: () => { document.activeElement && document.activeElement.blur(); T.closeDlg(); const d0 = o.d || {};
    if (feld === 'texte') aendernMitDaten(o, { ...werte }, d0.zahlen); else aendernMitDaten(o, d0.texte, { ...werte }); } }, 'Übernehmen'));

function texteDialog(o) {
  const liste = texteFinden(roh(o)), tx = { ...((o.d || {}).texte || {}) };
  if (!liste.length) { T.toast && T.toast('Auf dieser Tafel stehen keine Texte.', 2000); return; }
  const felder = liste.map((t, i) => {
    const jetzt = tx[i] && tx[i].alt === t ? tx[i].neu : t;
    const inp = h('input', { class: 'feld', value: jetzt, style: { width: '100%', boxSizing: 'border-box' }, oninput: e => { const v = e.target.value; if (v === t) delete tx[i]; else tx[i] = { alt: t, neu: v }; } });
    return h('label', { class: 'fld', style: { display: 'block' } }, h('span', { style: { color: 'var(--muted)', fontSize: '13px' } }, i === 0 ? 'Überschrift' : 'Zeile ' + i + (jetzt !== t ? ' (geändert)' : '')), inp);
  });
  T.openDlg([h('h2', {}, '✏️ Texte anpassen'), h('p', { class: 'hint' }, 'Jede Zeile der Tafel lässt sich umformulieren. Ganz leeren = Zeile weglassen. Gilt für diese Tafel; als eigene Vorlage behalten: Seite über 📑 Seiten › „⭐ Als Vorlage“ speichern.'),
    h('div', { style: { maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' } }, ...felder), knoepfe(o, 'texte', tx)]);
}
function zahlenDialog(o) {
  const liste = zahlenFinden(roh(o)), z = { ...((o.d || {}).zahlen || {}) };
  if (!liste.length) { T.toast && T.toast('Auf dieser Tafel stehen keine Zahlen.', 2000); return; }
  const felder = liste.map(e => {
    const jetzt = z[e.key] && z[e.key].alt === e.alt ? z[e.key].neu : e.alt;
    const inp = h('input', { class: 'feld', value: jetzt, style: { width: '110px' }, onchange: ev => { const v = ev.target.value.trim(); if (!v || v === e.alt) delete z[e.key]; else z[e.key] = { alt: e.alt, neu: v }; } });
    const vor = e.zeile.slice(Math.max(0, e.pos - 34), e.pos), nach = e.zeile.slice(e.pos + e.alt.length, e.pos + e.alt.length + 34);
    return h('label', { class: 'fld', style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h('span', { style: { flex: 1, color: 'var(--muted)' } }, (e.pos > 34 ? '…' : '') + vor, h('b', { style: { color: 'var(--text)' } }, e.alt), nach + (e.zeile.length > e.pos + e.alt.length + 34 ? '…' : '')), inp);
  });
  T.openDlg([h('h2', {}, '🔢 Zahlen anpassen'), h('p', { class: 'hint' }, 'Links steht die Zahl, wie sie in der Vorlage vorkommt – rechts den neuen Wert eintragen (leer = wie in der Vorlage).'),
    h('div', { style: { maxHeight: '58vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' } }, ...felder), knoepfe(o, 'zahlen', z)]);
}
function einrichten(k) {
  const Bk = B[k]; if (!Bk || Bk.__genT || AUSNAHMEN.has(k) || typeof Bk.gen !== 'function') return;
  /* innerste Erzeugung umhüllen: ist 🙈 Erarbeiten schon eingerichtet, dessen Kern (__gen) – so wirkt es vor dem Verdecken */
  const feld = Bk.__gen ? '__gen' : 'gen', kern = Bk[feld];
  Bk.__genT = kern;
  Bk[feld] = (d, P) => {
    const g = kern(d, P); if (!g || !g.svg) return g;
    if (d.texteDirekt) { /* ✏️ Direkt ändern: jeder Text gestrichelt umrandet und antippbar (Teil x<Nummer>) */
      const svg = anwenden(g.svg, d.texte, d.zahlen, true), L = textLagen(svg);
      const rahmen = L.map(q => `<rect x="${(q.x0 - 4).toFixed(1)}" y="${q.y0.toFixed(1)}" width="${(q.w + 8).toFixed(1)}" height="${q.h.toFixed(1)}" rx="5" fill="rgba(30,136,229,.07)" stroke="#1e88e5" stroke-width="1.5" stroke-dasharray="5 4"/>`).join('');
      return { ...g, svg: svg.replace(/<\/svg>\s*$/, rahmen + '</svg>'), teile: (g.teile || []).concat(L.map(q => ({ id: 'x' + q.i, x: q.x0 - 4, y: q.y0, w: q.w + 8, h: q.h }))) };
    }
    return !leer(d.texte) || !leer(d.zahlen) ? { ...g, svg: anwenden(g.svg, d.texte, d.zahlen) } : g;
  };
  /* Antippen im Direkt-Modus: Text öffnen; sonst wie bisher (tippenFuer sagt der Eingabe, welche Teile hier gemeint sind) */
  const tAlt = Bk.tippen, fuerAlt = Bk.tippenFuer;
  Bk.tippen = (o, id) => { if (/^x\d+$/.test(id)) return direktFeld(o, +id.slice(1)); return tAlt && tAlt(o, id); };
  Bk.tippenFuer = id => /^[xt]\d+$/.test(id) || (!!tAlt && (!fuerAlt || fuerAlt(id))); /* t<Nr> = 🙈 Erarbeiten (erarbeiten.js) */
  const sAlt = Bk.schnell;
  Bk.schnell = d => (d.texteDirekt ? [{ l: '✔ Texte fertig', f: dd => { const n = { ...dd }; delete n.texteDirekt; return { d: n }; } }] : [])
    .concat(typeof sAlt === 'function' ? sAlt(d) : (sAlt || []),
      d.texteDirekt ? [] : [{ l: '✏️ Texte direkt ändern', f: dd => { T.toast && T.toast('Eine Zeile mit dem Finger oder der Maus antippen – dort tippen, Enter speichert, Esc bricht ab. Fertig: „✔ Texte fertig“.', 4500); return { d: { ...dd, texteDirekt: true, erarbeiten: false } }; } }],
      [{ l: '📋 Texte als Liste', aus: o => texteDialog(o) }], OHNE_ZAHLEN.has(k) ? [] : [{ l: '🔢 Zahlen anpassen', aus: o => zahlenDialog(o) }]);
}
const alle = () => Object.keys(B).forEach(einrichten);
alle(); addEventListener('load', alle); setTimeout(alle, 2000);
/* später nachgeladene Bausteine (z. B. Skelette): beim ersten Zeichnen einrichten */
if (T.genObj) { const altG = T.genObj; T.genObj = (k, ...r) => { einrichten(k); return altG(k, ...r); }; }
T.zahlenEinrichten = T.texteEinrichten = einrichten;
})();
