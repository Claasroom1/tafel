// Tafel-App – 🍕 Bruchstücke: ein Ganzes (Kreis, Streifen, Rechteck) in n gleiche Stücke teilen – jedes Stück ist ein eigenes
// Element (mit dem Finger verschieben, am ↻ drehen). Dazu auf Wunsch der Umriss des Ganzen zum Wiederzusammenlegen.
// Stück: d = { form, nenner, a0, a1 (Anteil 0…1 des Ganzen), farbe, beschr } – „✂ halbieren“ teilt ein Stück in zwei.
'use strict';
(function () {
const CM = T.CM, R = 4 * CM, SW = 12 * CM, SH = { streifen: 2.4 * CM, rechteck: 6 * CM }, M = 6;
const f = v => Math.round(v * 10) / 10;
const FARBEN = [['#fdba74', 'Orange'], ['#fca5a5', 'Rot'], ['#86efac', 'Grün'], ['#93c5fd', 'Blau'], ['#fde68a', 'Gelb'], ['#d8b4fe', 'Lila']];
// Umriss eines Stücks im Koordinatensystem des Ganzen (Kreis: Mittelpunkt 0,0; Streifen/Rechteck: links oben 0,0)
function umriss(d) {
  if (d.form === 'kreis') {
    const P = [[0, 0]], n = Math.max(2, Math.ceil((d.a1 - d.a0) * 96));
    for (let k = 0; k <= n; k++) { const t = (-0.25 + d.a0 + (d.a1 - d.a0) * k / n) * 2 * Math.PI; P.push([R * Math.cos(t), R * Math.sin(t)]); }
    return P;
  }
  const H = SH[d.form] || SH.streifen; return [[SW * d.a0, 0], [SW * d.a1, 0], [SW * d.a1, H], [SW * d.a0, H]];
}
const rahmen = P => { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); return { x0: Math.min(...xs) - M, y0: Math.min(...ys) - M, x1: Math.max(...xs) + M, y1: Math.max(...ys) + M }; };
// Bruch als Zähler/Strich/Nenner
const bruchSvg = (x, y, z, n, fs, c) => `<text x="${f(x)}" y="${f(y - fs * 0.62)}" font-size="${f(fs)}" text-anchor="middle" dominant-baseline="central" fill="${c}" font-weight="700">${z}</text>` +
  `<line x1="${f(x - fs * 0.45)}" y1="${f(y)}" x2="${f(x + fs * 0.45)}" y2="${f(y)}" stroke="${c}" stroke-width="${f(fs * 0.09)}" stroke-linecap="round"/>` +
  `<text x="${f(x)}" y="${f(y + fs * 0.62)}" font-size="${f(fs)}" text-anchor="middle" dominant-baseline="central" fill="${c}" font-weight="700">${n}</text>`;
function stueckSvg(d, P) {
  const U = umriss(d), B = rahmen(U), W = B.x1 - B.x0, H = B.y1 - B.y0, X = p => f(p[0] - B.x0), Y = p => f(p[1] - B.y0);
  let s = `<polygon points="${U.map(p => X(p) + ',' + Y(p)).join(' ')}" fill="${d.farbe || '#fdba74'}" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>`;
  if (d.beschr !== false) {
    let cx, cy; const anteil = d.a1 - d.a0;
    if (d.form === 'kreis') { const t = (-0.25 + (d.a0 + d.a1) / 2) * 2 * Math.PI, rr = anteil >= 0.5 ? 0 : R * 0.58; cx = rr * Math.cos(t); cy = rr * Math.sin(t); }
    else { cx = SW * (d.a0 + d.a1) / 2; cy = (SH[d.form] || SH.streifen) / 2; }
    const fs = Math.max(13, Math.min(30, d.form === 'kreis' ? R * Math.min(0.24, anteil * 1.6) : Math.min(SW * anteil * 0.42, (SH[d.form] || SH.streifen) * 0.36)));
    s += bruchSvg(cx - B.x0, cy - B.y0, 1, d.nenner, fs, '#1f2937');
  }
  return { svg: T._svg.doc(W, H, s), w: W, h: H, B };
}
function ganzesSvg(d, P) {
  const U = d.form === 'kreis' ? Array.from({ length: 97 }, (_, k) => [R * Math.cos(k / 96 * 2 * Math.PI), R * Math.sin(k / 96 * 2 * Math.PI)]) : umriss({ ...d, a0: 0, a1: 1 });
  const B = rahmen(U), W = B.x1 - B.x0, H = B.y1 - B.y0;
  const s = `<polygon points="${U.map(p => f(p[0] - B.x0) + ',' + f(p[1] - B.y0)).join(' ')}" fill="${P.papier}" fill-opacity=".35" stroke="${P.ink}" stroke-width="2.5" stroke-dasharray="9 7"/>` +
    `<text x="${f(W / 2)}" y="${f(H - 2)}" font-size="16" text-anchor="middle" fill="${P.ink}" opacity=".55">1 Ganzes</text>`;
  return { svg: T._svg.doc(W, H, s), w: W, h: H, B };
}
const B = T.BAUSTEINE;
B.bruchstueck = { name: 'Bruchstück', gruppe: 'Mathe', def: { form: 'kreis', nenner: 4, a0: 0, a1: 0.25, farbe: '#fdba74', beschr: true },
  felder: [{ k: 'farbe', l: 'Farbe', typ: 'auswahl', opts: FARBEN }, { k: 'beschr', l: 'Bruch (1/n) auf das Stück schreiben', typ: 'check' }],
  gen: (d, P) => stueckSvg(d, P) };
B.bruchganzes = { name: 'Ganzes (Umriss)', gruppe: 'Mathe', def: { form: 'kreis' }, felder: [], gen: (d, P) => ganzesSvg(d, P) };
// Kachel unter Einfügen › Mathe (Vorschau: Kreis in vier Stücken, leicht auseinandergezogen)
B.bruchstuecke = { name: 'Bruchstücke zum Legen', gruppe: 'Mathe', def: { form: 'kreis', n: 4 }, felder: [],
  gen: (d, P) => {
    let s = ''; const w = 2 * R + 60;
    for (let i = 0; i < 4; i++) { const t = (-0.25 + (i + 0.5) / 4) * 2 * Math.PI, dx = 14 * Math.cos(t), dy = 14 * Math.sin(t), U = umriss({ form: 'kreis', a0: i / 4, a1: (i + 1) / 4 });
      s += `<polygon points="${U.map(p => f(p[0] + w / 2 + dx) + ',' + f(p[1] + w / 2 + dy)).join(' ')}" fill="${FARBEN[i % FARBEN.length][0]}" stroke="${P.ink}" stroke-width="3"/>`; }
    return { svg: T._svg.doc(w, w, s), w, h: w };
  } };
// Ein Stück so auf die Tafel legen, dass der Punkt (gx, gy) des Ganzen auf (wx, wy) liegt
function legeStueck(d, wx, wy, r) {
  const g = stueckSvg(d, T.palette(false)), a = (r || 0) * Math.PI / 180;
  const lx = -g.B.x0 - g.w / 2, ly = -g.B.y0 - g.h / 2, cx = wx - (lx * Math.cos(a) - ly * Math.sin(a)), cy = wy - (lx * Math.sin(a) + ly * Math.cos(a));
  return { t: 'o', id: T.uid(), k: 'bruchstueck', d, x: cx - g.w / 2, y: cy - g.h / 2, w: g.w, h: g.h, r: r || 0 };
}
// Ursprung des Ganzen (Kreismitte bzw. linke obere Ecke) eines liegenden Stücks auf der Tafel
function ursprung(o) {
  const g = stueckSvg(o.d, T.palette(false)), s = o.w / g.w, a = (o.r || 0) * Math.PI / 180, lx = (-g.B.x0 - g.w / 2) * s, ly = (-g.B.y0 - g.h / 2) * s;
  return [o.x + o.w / 2 + lx * Math.cos(a) - ly * Math.sin(a), o.y + o.h / 2 + lx * Math.sin(a) + ly * Math.cos(a)];
}
T.bruchstueckeEinfuegen = ({ form = 'kreis', n = 4, farbe = '#fdba74', beschr = true, ganzes = true } = {}) => {
  const [cx, cy] = T.viewCenter(), neu = [];
  const ox = form === 'kreis' ? cx : cx - SW / 2, oy = form === 'kreis' ? cy : cy - (SH[form] || SH.streifen) / 2;
  if (ganzes) { const g = ganzesSvg({ form }, T.palette(false)); neu.push({ t: 'o', id: T.uid(), k: 'bruchganzes', d: { form }, x: ox + g.B.x0, y: oy + g.B.y0, w: g.w, h: g.h, r: 0 }); }
  for (let i = 0; i < n; i++) neu.push(legeStueck({ form, nenner: n, a0: i / n, a1: (i + 1) / n, farbe, beschr }, ox, oy, 0));
  T.snap(); neu.forEach(o => T.addItem(o)); T.render(); T.renderOver();
  T.toast(`${n} Stücke eingefügt – mit dem Finger einzeln herausziehen, am ↻ drehen; im Kontextmenü „✂ halbieren“.`, 4000);
};
// Kontextmenü eines Stücks: Bruch ein/aus, halbieren, Farbe
B.bruchstueck.schnell = d => [
  { l: '✂ halbieren', aus: o => {
    const [ux, uy] = ursprung(o), m = (o.d.a0 + o.d.a1) / 2, s = o.w / stueckSvg(o.d, T.palette(false)).w;
    const teil = (a0, a1) => { const x = legeStueck({ ...o.d, a0, a1, nenner: o.d.nenner * 2 }, ux, uy, o.r); x.w *= s; x.h *= s; const g = stueckSvg(x.d, T.palette(false)), a = (o.r || 0) * Math.PI / 180,
      lx = (-g.B.x0 - g.w / 2) * s, ly = (-g.B.y0 - g.h / 2) * s; const ccx = ux - (lx * Math.cos(a) - ly * Math.sin(a)), ccy = uy - (lx * Math.sin(a) + ly * Math.cos(a)); x.x = ccx - x.w / 2; x.y = ccy - x.h / 2; return x; };
    T.snap(); const pg = T.page(); pg.items = pg.items.filter(i => i.id !== o.id); const A = teil(o.d.a0, m), Bb = teil(m, o.d.a1); T.addItem(A); T.addItem(Bb); T.S.sel = null; T.render(); T.renderOver();
    T.toast(`Halbiert: zwei Stücke zu je 1/${o.d.nenner * 2}.`, 2200); } },
  { l: d.beschr === false ? '½ Bruch zeigen' : '½ Bruch ausblenden', f: dd => ({ d: { ...dd, beschr: dd.beschr === false } }) },
  { l: '🎨 Farbe wechseln', f: dd => { const i = FARBEN.findIndex(c => c[0] === dd.farbe); return { d: { ...dd, farbe: FARBEN[(i + 1) % FARBEN.length][0] } }; } }];
// Auswahl vor dem Einfügen: Form, Anzahl der Stücke, Farbe
T.bruchstueckeMenue = () => {
  const h = T.h, st = { form: 'kreis', n: 4, farbe: '#fdba74', beschr: true, ganzes: true };
  const zeige = () => {
    const wahl = (arr, k) => h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }, ...arr.map(([v, l]) => h('button', { class: 'big' + (st[k] === v ? ' on' : ''), onclick: () => { st[k] = v; zeige(); } }, l)));
    T.openDlg([h('h2', {}, '🍕 Bruchstücke zum Legen'),
      h('p', { class: 'hint' }, 'Ein Ganzes wird in gleiche Stücke geteilt. Jedes Stück lässt sich einzeln verschieben und drehen – z. B. zum Vergleichen, Ergänzen oder Erweitern.'),
      h('h3', {}, 'Form'), wahl([['kreis', '◔ Kreis (Pizza)'], ['streifen', '▭ Streifen'], ['rechteck', '▦ Rechteck (Schokolade)']], 'form'),
      h('h3', {}, 'In wie viele Stücke?'), wahl([2, 3, 4, 5, 6, 8, 10, 12].map(v => [v, String(v)]), 'n'),
      h('h3', {}, 'Farbe'), h('div', { class: 'row', style: { gap: '8px' } }, ...FARBEN.map(([c, l]) => h('button', { class: 'sw' + (st.farbe === c ? ' on' : ''), title: l, style: { background: c, width: '44px', height: '44px' }, onclick: () => { st.farbe = c; zeige(); } }))),
      h('label', { class: 'fld check' }, (() => { const i = h('input', { type: 'checkbox', onchange: e => { st.beschr = e.target.checked; } }); i.checked = st.beschr; return i; })(), 'Bruch (1/n) auf jedes Stück schreiben'),
      h('label', { class: 'fld check' }, (() => { const i = h('input', { type: 'checkbox', onchange: e => { st.ganzes = e.target.checked; } }); i.checked = st.ganzes; return i; })(), 'Umriss des Ganzen dazulegen (zum Wiederzusammensetzen)'),
      h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => { T.closeDlg(); T.bruchstueckeEinfuegen(st); } }, '＋ Einfügen'))]);
  };
  zeige();
};
})();
