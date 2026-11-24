// Tafel-App – 💼 Wirtschaft (Ergänzung): Erweiterter Wirtschaftskreislauf (Haushalte, Unternehmen, Staat, Banken, Ausland) – nur Geldströme.
// Wahlweise mit Betragstabelle zum Rechnen (Mrd. €; vorgegeben oder leer) und Kontrolle „Einnahmen = Ausgaben“ je Sektor.
// Vorlagen › 💼 Wirtschaft. 🙈 Erarbeiten und 🔢 Zahlen anpassen über erarbeiten.js / zahlen.js (Präfix wi_).
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', LILA = '#6a1b9a', GRAU = '#64748b', RAND = '#3a6d99';
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const fett = 'font-weight="700"';
const box = (x, y, w, h, rand, fuell, r = 16, sw = 3) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
/* Pfeil über Eckpunkte (rechtwinklig geführt), Spitze am letzten Punkt */
const pfeil = (pts, col, w = 3.5) => {
  const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1], a = Math.atan2(y2 - y1, x2 - x1), k = 15, ax = x2 - k * Math.cos(a), ay = y2 - k * Math.sin(a);
  const linie = pts.slice(0, -1).map(([x, y], i) => (i ? 'L ' : 'M ') + f(x) + ' ' + f(y)).join(' ') + ` L ${f(ax)} ${f(ay)}`;
  return `<path d="${linie}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${f(x2)} ${f(y2)} L ${f(ax + 8 * Math.sin(a))} ${f(ay - 8 * Math.cos(a))} L ${f(ax - 8 * Math.sin(a))} ${f(ay + 8 * Math.cos(a))} Z" fill="${col}"/>`; };
const sektor = (x, y, w, h, sym, name, col, fuell) => box(x, y, w, h, col, fuell) + mitte(x + w / 2, y + h / 2 - 16, sym, 34, '#000') + mitte(x + w / 2, y + h / 2 + 24, name, 22, col, fett);

/* Ströme: Schlüssel, Name in der Tabelle, Beispielwert (Mrd. €) – das Beispiel geht für jeden Sektor auf */
const STROEME = [['einkommen', 'Einkommen (an Haushalte)', 1000], ['konsum', 'Konsumausgaben', 800], ['steuernH', 'Steuern, Abgaben der Haushalte', 250], ['transfer', 'Transferzahlungen', 200],
  ['sparen', 'Sparen', 150], ['steuernU', 'Steuern der Unternehmen', 150], ['subv', 'Subventionen, Staatsaufträge', 200], ['kredite', 'Kredite für Investitionen', 150],
  ['export', 'Exporterlöse', 400], ['import', 'Importausgaben', 400]];
const BEISPIEL = Object.fromEntries(STROEME.map(([k, , v]) => [k, String(v)]));

B.wi_kreislauf2 = { name: 'Erweiterter Wirtschaftskreislauf', gruppe: 'Gesellschaft', def: { ausland: true, betraege: false, werte: {} },
  felder: [{ k: 'ausland', l: 'Ausland zeigen (offene Volkswirtschaft)', typ: 'check' }, { k: 'betraege', l: 'Beträge zum Rechnen (Tabelle darunter)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, mitA = d.ausland !== false, mitB = !!d.betraege, w = d.werte || {}; let s = '';
    const xH = 40, xU = 560, yM = 300, bw = 230, bh = 130, xS = 300;
    s += sektor(xH, yM, bw, bh, '🏠', 'Private Haushalte', ORANGE, '#fff3e0');
    s += sektor(xU, yM, bw, bh, '🏭', 'Unternehmen', BLAU, '#e3f2fd');
    s += sektor(xS, 70, 230, 100, '🏛', 'Staat', LILA, '#f3e5f5');
    s += sektor(xS, 590, 230, 100, '🏦', 'Banken', GRUEN, '#e8f5e9');
    if (mitA) s += sektor(840, yM, 140, bh, '🌍', 'Ausland', GRAU, '#eef2f7');
    /* Haushalte ↔ Unternehmen */
    s += pfeil([[xU, yM + 35], [xH + bw, yM + 35]], ORANGE) + mitte(415, yM + 14, 'Einkommen (Löhne, Gewinne)', 18, P.ink);
    s += pfeil([[xH + bw, yM + bh - 35], [xU, yM + bh - 35]], BLAU) + mitte(415, yM + bh - 14, 'Konsumausgaben', 18, P.ink);
    /* Haushalte ↔ Staat */
    s += pfeil([[100, yM], [100, 100], [xS, 100]], LILA) + text(40, 78, 'Steuern, Sozialabgaben', 18, P.ink);
    s += pfeil([[xS, 145], [200, 145], [200, yM]], LILA) + text(210, 196, 'Transferzahlungen', 18, P.ink) + text(210, 220, '(z. B. Kindergeld, Rente)', 18, P.ink);
    /* Unternehmen ↔ Staat */
    s += pfeil([[775, yM], [775, 100], [xS + 230, 100]], LILA) + text(600, 78, 'Steuern', 18, P.ink);
    s += pfeil([[xS + 230, 145], [600, 145], [600, yM]], LILA) + text(612, 196, 'Subventionen,', 18, P.ink) + text(612, 220, 'Staatsaufträge', 18, P.ink);
    /* Haushalte → Banken → Unternehmen */
    s += pfeil([[155, yM + bh], [155, 640], [xS, 640]], GRUEN) + text(165, 520, 'Sparen', 18, P.ink, fett);
    s += pfeil([[xS + 230, 640], [675, 640], [675, yM + bh]], GRUEN) + text(685, 520, 'Kredite für Investitionen', 18, P.ink, fett);
    /* Unternehmen ↔ Ausland */
    if (mitA) {
      s += pfeil([[840, yM + 35], [xU + bw, yM + 35]], GRAU) + mitte(860, yM - 18, 'Exporterlöse', 18, P.ink);
      s += pfeil([[xU + bw, yM + bh - 35], [840, yM + bh - 35]], GRAU) + mitte(830, yM + bh + 22, 'Importausgaben', 18, P.ink);
    }
    s += text(30, 722, 'Dargestellt sind nur die Geldströme. Die Güterströme fließen jeweils in die Gegenrichtung.', 19, P.ink);
    s += text(30, 750, 'Banken sammeln die Ersparnisse und vergeben sie als Kredite – so wird aus Sparen Investition.', 19, P.ink);
    let H = 780;
    if (mitB) { /* Betragstabelle: zwei Spalten, Wert vorgegeben oder leeres Feld zum Ausrechnen */
      const liste = STROEME.filter(([k]) => mitA || (k !== 'export' && k !== 'import')), y0 = 800, zh = 50, sp = 470;
      s += text(30, y0, 'Beträge (in Mrd. € pro Jahr)', 24, P.ink, fett);
      liste.forEach(([k, name], i) => { const x = 30 + (i % 2) * sp, y = y0 + 30 + Math.floor(i / 2) * zh, wert = String(w[k] == null ? '' : w[k]).trim();
        s += box(x, y, sp - 20, zh - 8, RAND, 'none', 10, 1.5) + text(x + 14, y + (zh - 8) / 2, name, 18, P.ink);
        s += box(x + sp - 150, y + 5, 120, zh - 18, GRAU, wert ? 'none' : 'rgba(148,163,184,.12)', 8, 1.5) + (wert ? mitte(x + sp - 90, y + (zh - 8) / 2, wert, 20, P.ink, fett) : ''); });
      const yK = y0 + 30 + Math.ceil(liste.length / 2) * zh + 20;
      s += text(30, yK, 'Kontrolle: Für jeden Sektor gilt Einnahmen = Ausgaben.', 21, P.ink, fett);
      const K = [['Haushalte:', 'Einkommen + Transfers = Konsum + Sparen + Steuern'], ['Unternehmen:', mitA ? 'Konsum + Subventionen + Kredite + Export = Einkommen + Steuern + Import' : 'Konsum + Subventionen + Kredite = Einkommen + Steuern'],
        ['Staat:', 'Steuern (Haushalte + Unternehmen) = Transfers + Subventionen'], ['Banken:', 'Sparen = Kredite']].concat(mitA ? [['Ausland:', 'Import = Export']] : []);
      K.forEach(([wer, gl], i) => { s += text(30, yK + 34 + i * 30, wer, 19, P.ink, fett) + text(170, yK + 34 + i * 30, gl, 19, P.ink); });
      H = yK + 34 + K.length * 30 + 10;
    }
    return { svg: T._svg.doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 36, '💼 Erweiterter Wirtschaftskreislauf', 30, P.ink, fett) + s), w: W, h: H };
  } };
/* Beträge eintragen: eigener Dialog (leer lassen = Feld zum Ausrechnen) */
function betraegeDialog(o) {
  const h = T.h, d = { ...B.wi_kreislauf2.def, ...o.d }, w = { ...(d.werte || {}) };
  const zeilen = STROEME.map(([k, name]) => h('label', { class: 'fld', style: { display: 'flex', alignItems: 'center', gap: '8px' } }, h('span', { style: { flex: 1 } }, name),
    h('input', { class: 'feld', value: w[k] == null ? '' : w[k], style: { width: '110px' }, onchange: e => { w[k] = e.target.value.trim(); } }), 'Mrd. €'));
  T.openDlg([h('h2', {}, '💶 Beträge eintragen'), h('p', { class: 'hint' }, 'Leer lassen = leeres Feld zum Ausrechnen. Das Beispiel geht für jeden Sektor auf (Einnahmen = Ausgaben).'), ...zeilen,
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: () => { STROEME.forEach(([k]) => { w[k] = BEISPIEL[k]; }); T.closeDlg(); T.bausteinAendern(o, { f: dd => ({ d: { ...dd, betraege: true, werte: { ...w } } }) }); } }, '📋 Beispiel einsetzen'),
      h('button', { class: 'big', onclick: T.closeDlg }, 'Abbrechen'),
      h('button', { class: 'big prim', onclick: () => { document.activeElement && document.activeElement.blur(); T.closeDlg(); T.bausteinAendern(o, { f: dd => ({ d: { ...dd, betraege: true, werte: { ...w } } }) }); } }, 'Übernehmen'))]);
}
B.wi_kreislauf2.schnell = [{ l: '💶 Beträge eintragen', aus: o => betraegeDialog(o) }, { l: '🧮 Beträge ein/aus', f: dd => ({ d: { ...dd, betraege: !dd.betraege } }) },
  { l: '🌍 Ausland ein/aus', f: dd => ({ d: { ...dd, ausland: dd.ausland === false } }) }];
const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};
KV['wi_kreislauf2:offen'] = { name: 'Erweiterter Wirtschaftskreislauf (mit Ausland)', d: { ausland: true } };
KV['wi_kreislauf2:geschlossen'] = { name: 'Erweiterter Wirtschaftskreislauf (ohne Ausland)', d: { ausland: false } };
KV['wi_kreislauf2:rechnen'] = { name: 'Erweiterter Wirtschaftskreislauf – mit Beträgen rechnen', d: { ausland: true, betraege: true, werte: { ...BEISPIEL, konsum: '', sparen: '', import: '' } } };
KV['wi_kreislauf2:rechnenleer'] = { name: 'Erweiterter Wirtschaftskreislauf – Beträge leer', d: { ausland: true, betraege: true, werte: {} } };
})();
