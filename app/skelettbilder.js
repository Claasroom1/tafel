// Tafel-App – Skelette und Schädel zum Beschriften (selbst gezeichnet, schematisch, plastische Knochen)
// Skelette: Mensch (von vorn), Hund, Katze, Vogel (Taube), Frosch (von oben), Fisch (Barsch)
// Schädel: Mensch, Hund, Katze, Vogel, Fisch (von der Seite), Frosch (von oben) – dieselben Zeichnungen stecken auch in den Skeletten.
// Knochen werden aus Umrisspunkten als glatte Kurven gezeichnet (glatt); Röhrenknochen nach Vorlagen (V), dünne Knochen als Bänder (band).
// Nutzt die Beschriftungs-Technik aus paket3b.js (T.BESCHRIFTUNG: Kästchen, Nummern, Legende; zuordnen.js liest BILD[...].pts).
'use strict';
(function () {
if (!T.BESCHRIFTUNG || !T._svg || !T.BAUSTEINE) return;
const { BILD, bildGen, F_BESCHR } = T.BESCHRIFTUNG, B = T.BAUSTEINE, { f } = T._svg;

// ---------- Farben, Verläufe ----------
const KS = '#6b5b45', KF = '#b3a893', KN = '#7ea3bc';
const lg = (id, st, quer) => `<linearGradient id="${id}" x1="0" y1="0" x2="${quer ? 0 : 1}" y2="${quer ? 1 : 0}">${st.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const rg = (id, st) => `<radialGradient id="${id}" cx=".4" cy=".36" r=".75">${st.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;
const DEFS = '<defs>'
  + lg('knL', [[0, '#c7b48d'], [.2, '#e8dcc2'], [.44, '#fcf8ee'], [.68, '#f1e7d2'], [1, '#c8b58f']])
  + rg('knR', [[0, '#fefbf3'], [.55, '#f2e9d5'], [1, '#d6c4a0']])
  + lg('knFL', [[0, '#ddd5c4'], [.45, '#f6f2ea'], [1, '#dcd3c1']])
  + rg('knFR', [[0, '#f9f6f0'], [1, '#e2dacb']])
  + lg('knKL', [[0, '#b4cfe0'], [.45, '#eef6fa'], [1, '#b9d2e2']])
  + rg('knKR', [[0, '#f3f9fc'], [1, '#bfd6e5']])
  + rg('lochG', [[0, '#5b4d3d'], [1, '#2c251e']])
  + lg('zahnG', [[0, '#fffefb'], [1, '#e9e2d1']], true)
  + '</defs>';
const NS = 'vector-effect="non-scaling-stroke" stroke-linejoin="round"';
const FU = { L: ['knL', KS], R: ['knR', KS], FL: ['knFL', KF], FR: ['knFR', KF], KL: ['knKL', KN], KR: ['knKR', KN] };
const fuell = (art, w) => `fill="url(#${FU[art][0]})" stroke="${FU[art][1]}" stroke-width="${w || 1.5}" ${NS}`;
const art = (o, rund) => (o && o.fern ? 'F' : o && o.knorpel ? 'K' : '') + (rund ? 'R' : 'L');

// ---------- Geometrie ----------
// geschlossene (oder offene) glatte Kurve durch Punkte; Punkt [x,y,1] = Ecke
function glatt(p, zu = true, k = 1) {
  const n = p.length, g = i => zu ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))];
  let d = `M ${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < (zu ? n : n - 1); i++) {
    const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2), tb = b[2] ? 0 : k / 6, tc = c[2] ? 0 : k / 6;
    d += ` C ${f(b[0] + (c[0] - a[0]) * tb)} ${f(b[1] + (c[1] - a[1]) * tb)} ${f(c[0] - (e[0] - b[0]) * tc)} ${f(c[1] - (e[1] - b[1]) * tc)} ${f(c[0])} ${f(c[1])}`;
  }
  return d + (zu ? ' Z' : '');
}
function kurve(p, n) {
  const g = i => p[Math.max(0, Math.min(p.length - 1, i))], out = [];
  for (let i = 0; i < p.length - 1; i++) {
    const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
    for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(k => 0.5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - e[k]) * t2 + (-a[k] + 3 * b[k] - 3 * c[k] + e[k]) * t3))); }
  }
  out.push([p[p.length - 1][0], p[p.length - 1][1]]); return out;
}
const flaeche = (pts, o = {}) => `<path d="${glatt(pts)}" ${fuell(art(o, !o.lang))} ${o.extra || ''}/>`;
const pfad = (d, o = {}) => `<path d="${d}" ${fuell(art(o, !o.lang))} ${o.extra || ''}/>`;
const loch = pts => `<path d="${glatt(pts)}" fill="url(#lochG)" stroke="${KS}" stroke-width="1.3" ${NS}/>`;
const lochEl = (cx, cy, rx, ry, rot) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#lochG)" stroke="${KS}" stroke-width="1.3" ${NS}${rot ? ` transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})"` : ''}/>`;
const el = (cx, cy, rx, ry, o = {}) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" ${fuell(art(o, true), 1.3)}${o.rot ? ` transform="rotate(${f(o.rot)} ${f(cx)} ${f(cy)})"` : ''}/>`;
const linie = (pts, c, w, extra) => `<path d="${glatt(pts, false)}" fill="none" stroke="${c || KF}" stroke-width="${w || 1.2}" stroke-linecap="round" ${NS} ${extra || ''}/>`;
const zahn = pts => `<path d="${glatt(pts)}" fill="url(#zahnG)" stroke="${KS}" stroke-width="1.2" ${NS}/>`;
const spiegel = (s, W) => `<g transform="translate(${W} 0) scale(-1 1)">${s}</g>`;
const voll = (h, mx) => { const r = h.slice(1, -1).reverse().map(([x, y, e]) => [2 * mx - x, y, e]); return [...h, ...r]; }; /* rechte Hälfte (oben Mitte … unten Mitte) → ganzer Umriss */
const beide = (fn, W) => fn() + spiegel(fn(), W);
// Platzierung einer Zeichnung (eigene Koordinaten) im Bild: Punkt umrechnen und SVG-Gruppe
const lage = (x, y, k, rot = 0) => ({ x, y, k, rot, p: (px, py) => { const a = rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [x + k * (px * c - py * s), y + k * (px * s + py * c)]; },
  g: inhalt => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${k})">${inhalt}</g>` });

// Knochen nach Vorlage: Vorlage senkrecht (u: 0 oben … 1 unten, du: Versatz in Dicken, v: quer in Dicken)
function knochen(V, x1, y1, x2, y2, d, o = {}) {
  const L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(-(x2 - x1), y2 - y1) * 180 / Math.PI, sp = o.sp ? -1 : 1;
  const p = V.map(([u, du, v, e]) => [sp * v * d, u * L + du * d, e]);
  return `<path transform="translate(${f(x1)} ${f(y1)}) rotate(${f(a)})" d="${glatt(p)}" ${fuell(art(o), 1.4)}/>`;
}
const punktAm = (x1, y1, x2, y2, u, du, v, d, sp) => { const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, vv = (sp ? -1 : 1) * v * d, uu = u * L + du * d;
  return [x1 + ux * uu + uy * vv, y1 + uy * uu - ux * vv]; };
// Band entlang einer Linie (Rippen, Schlüsselbein, Knorpel, Flossenstrahlen, Dornfortsätze)
function band(pts, w0, w1, o = {}) {
  const q = kurve(pts, 6), n = q.length, li = [], re = [], mi = [];
  for (let i = 0; i < n; i++) {
    const a = q[Math.max(0, i - 1)], b = q[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, t = i / (n - 1), w = (w0 + (w1 - w0) * t) / 2;
    li.push([q[i][0] - dy / l * w, q[i][1] + dx / l * w]); re.push([q[i][0] + dy / l * w, q[i][1] - dx / l * w]); mi.push([q[i][0] + dy / l * w * 0.3, q[i][1] - dx / l * w * 0.3]);
  }
  const t0 = [q[0][0] - q[1][0], q[0][1] - q[1][1]], l0 = Math.hypot(...t0) || 1, t1 = [q[n - 1][0] - q[n - 2][0], q[n - 1][1] - q[n - 2][1]], l1 = Math.hypot(...t1) || 1;
  const kappe0 = [q[0][0] + t0[0] / l0 * w0 * 0.45, q[0][1] + t0[1] / l0 * w0 * 0.45], kappe1 = [q[n - 1][0] + t1[0] / l1 * w1 * 0.45, q[n - 1][1] + t1[1] / l1 * w1 * 0.45];
  const umr = [kappe0, ...li, kappe1, ...re.reverse()];
  const fa = o.knorpel ? ['#d3e5ef', KN, '#f4f9fc'] : o.fern ? ['#eee8dc', KF, '#faf8f4'] : ['#ece1c9', KS, '#fcf8ee'];
  let s = `<path d="${glatt(umr)}" fill="${fa[0]}" stroke="${fa[1]}" stroke-width="${o.sw || 1.3}" ${NS}/>`;
  if (!o.ohneGlanz && Math.max(w0, w1) >= 3) s += `<path d="${glatt(mi.slice(1, -1), false)}" fill="none" stroke="${fa[2]}" stroke-width="${f(Math.min(w0, w1) * 0.32 + 0.4)}" stroke-linecap="round" stroke-opacity=".95"/>`;
  return s;
}

// ---------- Knochenvorlagen ----------
const V = {
  klein: [[0, -.7, 0], [0, -.5, 1.1], [0, .6, 1.2], [.5, 0, .75], [1, -.6, 1.05], [1, .5, .95], [1, .7, 0], [1, .5, -.95], [1, -.6, -1.05], [.5, 0, -.75], [0, .6, -1.2], [0, -.5, -1.1]],
  end: [[0, -.6, 0], [0, -.4, 1.1], [0, .6, 1.1], [.6, 0, .62], [1, -.4, .75], [1, .25, .45], [1, .4, -.3], [1, -.3, -.7], [.6, 0, -.6], [0, .6, -1.1], [0, -.4, -1.1]],
  roehre: [[0, -1, 0], [0, -.75, 1.25], [0, .2, 1.7], [0, 1.6, 1.3], [.2, 0, 1], [.8, 0, 1], [1, -1.6, 1.3], [1, -.2, 1.7], [1, .75, 1.25], [1, 1, 0], [1, .75, -1.25], [1, -.2, -1.7], [1, -1.6, -1.3], [.8, 0, -1], [.2, 0, -1], [0, 1.6, -1.3], [0, .2, -1.7], [0, -.75, -1.25]],
  // Mensch von vorn (+ = zur Körpermitte)
  oberarmV: [[0, -1.6, 1.2], [0, -1.2, 2.4], [0, .4, 3.0], [0, 2.0, 2.5], [0, 3.4, 1.4], [.25, 0, 1], [.6, 0, 1], [.84, 0, 1.25], [1, -2.6, 2.0], [1, -1.2, 3.0], [1, -.2, 2.6], [1, .7, 2.0], [1, 1.1, 1.0], [1, .6, .3], [1, .9, -.4], [1, .8, -1.4], [1, -.3, -2.1], [1, -1.5, -2.4], [1, -3, -1.5], [.75, 0, -1], [.35, 0, -1.15], [0, 4, -1.5], [0, 2, -2.1], [0, 0, -2.1], [0, -1.4, -1.2], [0, -1.9, 0]],
  elleV: [[0, -1, .6], [0, -.4, 1.6], [0, 1.6, 1.8], [0, 4, 1.1], [.3, 0, .8], [.85, 0, .7], [1, -1.5, .9], [1, 0, 1.1], [1, 1.2, .6], [1, .8, -.2], [1, 0, -.8], [.85, 0, -.6], [.3, 0, -.75], [0, 4, -1.0], [0, 1.8, -1.5], [0, 0, -1.6], [0, -.9, -.6]],
  speicheV: [[0, -.4, 0], [0, -.2, 1.1], [0, 1.3, 1.1], [0, 2.2, .7], [.2, 0, .8], [.6, 0, .9], [.85, 0, 1.2], [1, -1.2, 1.9], [1, .3, 1.8], [1, .6, .6], [1, .9, -.8], [1, 1.7, -1.6], [1, .3, -2.2], [.85, 0, -1.4], [.55, 0, -.95], [.2, 0, -.8], [0, 2.2, -.7], [0, 1.3, -1.1], [0, -.2, -1.1]],
  oberschenkelV: [[0, -1.6, 3.2], [0, -1.2, 4.4], [0, .2, 5.0], [0, 1.4, 4.5], [0, 1.9, 3.4], [0, 2.4, 2.4], [0, 4.6, 1.7], [0, 5.6, 2.1], [0, 6.8, 1.2], [.3, 0, 1.0], [.7, 0, 1.05], [.88, 0, 1.6], [1, -2.2, 2.7], [1, -.8, 3.1], [1, .4, 2.6], [1, .9, 1.6], [1, .4, .3, 1], [1, .9, -.9], [1, .5, -2.3], [1, -1, -2.9], [1, -2.5, -2.5], [.88, 0, -1.5], [.7, 0, -1.05], [.3, 0, -1.15], [0, 7, -1.5], [0, 3.5, -2.0], [0, 1, -2.4], [0, -1.4, -2.2], [0, -1.6, -1.2], [0, -.6, .4], [0, -.9, 1.8]],
  schienbeinV: [[0, -.3, -.4], [0, -.6, .3], [0, -.2, 1.2], [0, -.1, 2.9], [0, 1.2, 3.2], [0, 3.2, 2.0], [.22, 0, 1.1], [.8, 0, .95], [.93, 0, 1.35], [1, -.6, 1.7], [1, 1.4, 1.4], [1, 1.0, .8], [1, .1, .2], [1, .1, -1.2], [1, -.6, -1.6], [.9, 0, -1.15], [.7, 0, -.85], [.22, 0, -1.05], [0, 3.4, -2.2], [0, 1.4, -3.1], [0, -.1, -2.9], [0, -.2, -1.2]],
  // Tiere von der Seite (+ = nach vorn/kopfwärts, wenn der Knochen nach unten zeigt)
  oberarmS: [[0, -1.8, 1.6], [0, -1.2, 2.6], [0, .6, 2.6], [0, 2.6, 1.8], [.2, 0, 1.2], [.38, 0, 1.35], [.5, 0, 1.0], [.82, 0, 1.05], [1, -2.2, 1.7], [1, -.6, 1.9], [1, .8, 1.2], [1, 1.1, 0], [1, .8, -1.3], [1, -.6, -1.9], [1, -2.4, -1.5], [.8, 0, -.95], [.4, 0, -1.05], [.15, 0, -1.4], [0, 2.4, -2.2], [0, .6, -2.6], [0, -1.0, -2.2], [0, -1.6, -1.0], [0, -1.2, .4]],
  elleS: [[0, -.6, 0], [0, -.3, 1.2], [0, 2.0, 1.6], [0, 3.2, .7], [0, 4.4, 1.8], [0, 5.6, 1.0], [.3, 0, .75], [.85, 0, .55], [1, -.4, .8], [1, .6, .4], [1, .6, -.5], [.85, 0, -.6], [.4, 0, -.8], [0, 4.5, -1.3], [0, 1.5, -1.6], [0, -.2, -1.4]],
  speicheS: [[0, -.4, 0], [0, -.2, 1.3], [0, 1.2, 1.2], [.3, 0, 1.0], [.55, 0, 1.05], [.85, 0, 1.1], [1, -.8, 1.5], [1, .4, 1.2], [1, .7, 0], [1, .4, -1.3], [1, -.8, -1.2], [.85, 0, -.8], [.5, 0, -.75], [.2, 0, -.8], [0, 1.2, -1.3], [0, -.2, -1.3]],
  oberschenkelS: [[0, -2.4, -1.6], [0, -1.6, -.2], [0, -1.4, 1.2], [0, -.4, 2.0], [0, 1.6, 1.8], [0, 3.0, 1.2], [.25, 0, 1.0], [.7, 0, 1.0], [.86, 0, 1.3], [1, -1.8, 1.9], [1, -.2, 1.6], [1, .8, .8], [1, 1.0, -.4], [1, .6, -1.4], [1, -.8, -1.9], [1, -2.2, -1.5], [.8, 0, -1.05], [.3, 0, -1.0], [0, 4, -1.4], [0, 2, -2.0], [0, 0, -2.4], [0, -1.6, -2.6]],
  schienbeinS: [[0, -.5, -.6], [0, -.6, .8], [0, -.2, 2.2], [0, 1.5, 2.6], [.12, 0, 2.0], [.3, 0, 1.1], [.75, 0, .85], [.92, 0, 1.0], [1, -.2, 1.3], [1, .8, .6], [1, .9, -.6], [1, -.2, -1.3], [.9, 0, -.9], [.55, 0, -.85], [.2, 0, -1.2], [0, 1.5, -2.2], [0, 0, -2.0]],
  wadenbeinV: [[0, -.6, 0], [0, -.2, 1.3], [0, 1.6, 1.2], [.12, 0, .7], [.88, 0, .7], [1, -1.5, 1.0], [1, .6, .8], [1, 1.6, -.2], [1, .5, -1.1], [1, -1.5, -1.2], [.88, 0, -.7], [.12, 0, -.75], [0, 1.6, -1.4], [0, -.2, -1.5]]
};
// Finger/Zehe: Gelenkpunkte → Glieder mit kleinen Spalten, letztes Glied spitz zulaufend
const finger = (pts, d, o = {}) => { let s = ''; for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L, g = Math.min(1.6, L * 0.1), dd = d * (1 - i * 0.12);
  s += knochen(i === pts.length - 2 && !o.stumpf ? V.end : V.klein, ax + ux * (g + dd * 0.6), ay + uy * (g + dd * 0.6), bx - ux * (g + dd * 0.6), by - uy * (g + dd * 0.6), dd, o); } return s; };

// =====================================================================
// MENSCH von vorn (anatomische Grundstellung: Handflächen nach vorn, Daumen außen)
// =====================================================================
const RIPPE = (() => { // i = 0…11; hinten am Wirbel (yp), seitlich am weitesten (W), vorn Knochen-Knorpel-Grenze (A, D)
  const W = [44, 60, 72, 81, 87, 91, 93, 94, 93, 90, 84, 74], Lo = [12, 18, 22, 25, 26, 27, 28, 28, 28, 28, 28, 26],
    A = [24, 31, 37, 43, 51, 59, 68, 66, 68, 70], D = [22, 37, 47, 53, 56, 58, 60, 64, 70, 76], SY = [229, 252, 270, 288, 306, 322, 336];
  return Array.from({ length: 12 }, (_, i) => ({ yp: 214 + i * 13.5, W: W[i], Lo: Lo[i], A: A[i], D: D[i], sy: SY[i] }));
})();
function schaedelVorn() {
  let s = flaeche(voll([[500, 30], [520, 32], [535, 40], [545, 53], [548, 67], [545, 80], [540, 90], [542, 99], [547, 106], [544, 113], [535, 118], [527, 123], [522, 129], [511, 131], [500, 131]], 500));
  s += beide(() => loch([[508, 86], [516, 83], [528, 83], [536, 87], [539, 96], [536, 105], [527, 108], [515, 107], [509, 101]]) + linie([[507, 82], [520, 78], [535, 82]], KS, 1.2) + linie([[531, 109], [540, 109], [546, 107]], KF) + linie([[515, 110], [519, 118], [521, 126]], KF) + `<circle cx="514" cy="114" r="1.5" fill="#6b5b45"/>`, 1000);
  s += loch([[500, 99], [504, 103], [507, 110], [508, 116], [505, 121], [500, 123], [495, 121], [492, 116], [493, 110], [496, 103]]); // Nasenöffnung
  s += flaeche([[497, 88], [503, 88], [504, 100], [500, 103], [496, 100]]); // Nasenbeine
  for (let i = 0; i < 4; i++) { const w = [5.4, 4.8, 4.6, 4.2][i], x0 = 500 + [0, 5.6, 10.6, 15.4][i], dy = i * i * 0.35;
    s += beide(() => zahn([[x0 + .3, 128 + dy, 1], [x0 + w, 128 + dy, 1], [x0 + w - .2, 136.2 + dy - (i === 2 ? 0 : .4)], [x0 + w / 2, 137 + dy + (i === 2 ? .8 : 0)], [x0 + .5, 136.2 + dy]]), 1000); }
  s += flaeche(voll([[500, 139], [512, 139], [522, 137], [529, 131], [533, 121], [540, 117], [543, 126], [542, 140], [537, 150], [527, 157], [513, 161], [500, 163]], 500));
  for (let i = 0; i < 4; i++) { const w = [4.4, 4.6, 4.6, 4.2][i], x0 = 500 + [0, 4.6, 9.4, 14.2][i], dy = i * i * 0.35;
    s += beide(() => zahn([[x0 + .3, 145 + dy, 1], [x0 + w, 145 + dy, 1], [x0 + w - .2, 138.4 + dy], [x0 + w / 2, 137.6 + dy - (i === 2 ? .8 : 0)], [x0 + .5, 138.4 + dy]]), 1000); }
  s += beide(() => `<circle cx="514" cy="151" r="1.5" fill="#6b5b45"/>` + linie([[528, 140], [532, 148]], KF), 1000);
  s += linie([[500, 32], [499, 44], [501, 56]], KF);
  return s;
}
function mensch() {
  let s = DEFS;
  // Schulterblatt (hinter dem Brustkorb)
  s += beide(() => flaeche([[464, 212], [442, 211], [420, 209], [404, 210], [399, 218], [404, 226], [406, 236], [412, 252], [425, 278], [440, 306], [452, 330], [462, 318], [468, 284], [470, 244]], { fern: true }), 1000);
  // Rippen hinten (hinter der Wirbelsäule, heller)
  s += beide(() => RIPPE.map(r => band([[487, r.yp + 2], [500 - r.W * 0.55, r.yp + r.Lo * 0.35], [500 - r.W + 5, r.yp + r.Lo - 4]], 5, 6, { fern: true, ohneGlanz: true })).join(''), 1000);
  // Wirbelsäule: Halswirbel, Brustwirbel, Lendenwirbel mit Bandscheiben (hellblau)
  const wk = (y, w, h, quer) => (quer ? beide(() => band([[500 - w * 0.3, y + h * 0.5], [500 - w / 2 - quer * 0.5, y + h * 0.42], [500 - w / 2 - quer, y + h * 0.3]], h * 0.6, h * 0.36, { ohneGlanz: h < 10 }), 1000) : '') +`<rect x="${f(500 - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(h * 0.35)}" ${fuell('L', 1.3)}/>`;
  const sch = (y, w) => `<rect x="${f(500 - w / 2 + 1)}" y="${f(y)}" width="${f(w - 2)}" height="3" rx="1.5" fill="#d3e5ef" stroke="${KN}" stroke-width="1" ${NS}/>`;
  for (let i = 0; i < 7; i++) { const y = 150 + i * 9.4; s += sch(y - 2.4, 18 + i) + wk(y, 18 + i, 7, 7); }
  for (let i = 0; i < 12; i++) { const y = 214 + i * 13.5; s += sch(y - 2.5, 24 + i * 1.2) + wk(y, 24 + i * 1.2, 11); }
  [14, 19, 23, 19, 14].forEach((q, i) => { const y = 376 + i * 19, w = 38 + i * 2; s += sch(y - 3, w) + wk(y, w, 16, q); });
  // Steißbein und Kreuzbein
  [[531, 7], [537, 5.5], [542, 4]].forEach(([y, w]) => { s += el(500, y, w, 2.8); });
  s += flaeche([[466, 472], [534, 472], [531, 488], [522, 508], [511, 523], [504, 529], [496, 529], [489, 523], [478, 508], [469, 488]]);
  [[483, 9, 3.6], [495, 7.5, 3.3], [506, 6, 3], [516, 4.6, 2.6]].forEach(([y, dx, r]) => { s += lochEl(500 - dx, y, r, r * 0.8) + lochEl(500 + dx, y, r, r * 0.8); });
  [489, 500.5, 511].forEach((y, i) => { s += linie([[486 + i * 3, y], [500, y + 1], [514 - i * 3, y]], KF); });
  // Becken: Darmbein, Hüftpfanne, Sitzbein, Schambein mit Hüftloch
  const kopf = [447, 525];
  s += beide(() => flaeche([[472, 466], [458, 452], [438, 450], [422, 459], [415, 474], [418, 488], [424, 496, 1], [431, 503], [433, 512], [434, 524], [436, 540], [441, 554], [449, 563], [461, 567], [474, 563], [485, 556], [494, 549], [497, 544], [497, 534], [490, 530], [478, 524], [468, 514], [464, 505], [466, 492], [472, 482], [476, 474]])
    + lochEl(468, 545, 8.5, 12, 22) + linie([[470, 470], [446, 462], [428, 470]], KF) + `<circle cx="${f(kopf[0])}" cy="${f(kopf[1])}" r="14.5" fill="#d9cba9" stroke="${KS}" stroke-width="1.3" ${NS}/>`, 1000);
  // Rippen vorn mit Rippenknorpel (hellblau), Brustbein
  s += beide(() => {
    let r = '', k = '';
    RIPPE.forEach((q, i) => {
      const ax = 500 - q.W, ay = q.yp + q.Lo;
      if (i < 10) { const ex = 500 - q.A, ey = q.yp + q.D; r += band([[ax + 5, ay - 4], [ax, ay + 3], [ax + (ex - ax) * 0.42, ay + (ey - ay) * 0.62], [ex, ey]], 6.5, 6); }
      else r += band([[ax + 5, ay - 4], [ax, ay + 3], [ax + 3, ay + 14], [ax + 9, ay + 24]], 6.5, 4.2);
    });
    for (let i = 0; i < 7; i++) { const q = RIPPE[i], ex = 500 - q.A, ey = q.yp + q.D, my = ey + (q.sy - ey) * 0.45 + (i > 2 ? 3 : 0); k += band([[ex + 1, ey], [ex + (489 - ex) * 0.5, my], [489, q.sy]], 5.6, 5, { knorpel: true }); }
    const ziel = [[453, 349], [441, 366], [436, 386]]; // Rippen 8–10 schließen an den Knorpel darüber an (Rippenbogen)
    for (let i = 7; i < 10; i++) { const q = RIPPE[i], ex = 500 - q.A, ey = q.yp + q.D, [px, py] = ziel[i - 7]; k += band([[ex + 1, ey], [ex + (px - ex) * 0.4 + 1, ey + (py - ey) * 0.55], [px, py]], 5.2, 4.4, { knorpel: true }); }
    return r + k;
  }, 1000);
  s += flaeche([[488, 216], [494, 214], [500, 218], [506, 214], [512, 216], [517, 223], [517, 233], [512, 246], [510, 252, 1], [490, 252, 1], [488, 246], [483, 233], [483, 223]]);
  s += flaeche([[489, 255, 1], [511, 255, 1], [512, 270], [513, 290], [514, 308], [513, 324], [510, 335], [506, 341, 1], [494, 341, 1], [490, 335], [487, 324], [486, 308], [487, 290], [488, 270]]) + [271, 289, 306, 323].map(y => linie([[492, y], [508, y]], KF, 1)).join('');
  s += flaeche([[494, 343], [506, 343], [505, 353], [500, 362], [495, 353]], { knorpel: true });
  // Schlüsselbein, Schulterhöhe, Rabenschnabelfortsatz
  s += beide(() => flaeche([[392, 206], [410, 203], [419, 208], [411, 215], [394, 214]]) + band([[430, 220], [421, 228], [414, 236]], 6, 4) + band([[491, 219], [470, 222], [446, 216], [424, 209], [406, 208]], 9.5, 8), 1000);
  // Arme
  s += beide(() => {
    let a = knochen(V.oberarmV, 387, 230, 366, 410, 5.5);
    a += knochen(V.elleV, 378, 413, 370, 560, 3.3) + knochen(V.speicheV, 357, 416, 350, 558, 3.4);
    [[348, 566, 5.5, 4.6], [358, 566, 5.2, 4.8], [368, 567, 5, 4.6], [376, 565, 3.6, 3.4], [344, 578, 5, 4.6], [353, 579, 4.6, 4.8], [362, 580, 5.2, 5.4], [372, 578, 5.4, 5]].forEach(([x, y, rx, ry]) => { a += el(x, y, rx, ry); });
    const mc = [[353, 586, 350, 626], [362, 587, 361, 627], [370, 586, 371, 623], [377, 584, 381, 618]], L = [[22, 14, 10], [24, 15, 10], [22, 14, 10], [18, 11, 9]], sp = [-0.1, 0, 0.08, 0.17];
    mc.forEach(([x1, y1, x2, y2], j) => { a += knochen(V.klein, x1, y1, x2, y2, 3.2); let x = x2 + sp[j] * 2, y = y2 + 2; const pts = [[x, y]]; L[j].forEach(l => { x += sp[j] * l; y += l; pts.push([x, y]); }); a += finger(pts, 2.9); });
    a += knochen(V.klein, 344, 585, 334, 606, 3.3) + finger([[333, 609], [326, 628], [321, 643]], 3.1);
    return a;
  }, 1000);
  // Beine
  s += beide(() => {
    let b = knochen(V.wadenbeinV, 447, 771, 449, 994, 3.1);
    // Oberschenkelknochen: Kopf, Hals, großer und kleiner Rollhügel, Schaft, zwei Gelenkknorren
    b += flaeche([[439, 516], [428, 522], [419, 523], [412, 518, 1], [405, 528], [404, 543], [409, 560], [418, 585], [428, 630], [441, 690], [445, 712], [440, 728], [440, 742], [447, 752], [456, 752], [461, 746], [467, 752], [477, 752], [484, 744], [485, 730], [480, 716], [458, 690], [445, 630], [436, 595], [434, 582], [438, 575], [433, 569], [434, 556], [442, 538], [452, 532]], { lang: true });
    b += linie([[418, 524], [424, 540], [433, 552]], KF) + el(...kopf, 12.5, 12.5) + `<path d="M ${kopf[0] - 15} ${kopf[1] + 2} A 15 15 0 0 1 ${kopf[0] + 11} ${kopf[1] - 10}" fill="none" stroke="${KS}" stroke-width="2.2" ${NS}/>`; // Pfannenrand
    b += knochen(V.schienbeinV, 462, 752, 466, 978, 6.5) + el(462, 724, 9.5, 12.5);
    // Fuß (von vorn verkürzt): Sprungbein, Fußwurzel, Mittelfuß, Zehen – Großzehe innen
    b += el(449, 1003, 7.5, 6.5) + el(475, 1002, 8.5, 5.5) + el(464, 993, 12.5, 7.5) + [[481, 1011], [472, 1012], [463, 1011]].map(([x, y]) => el(x, y, 4.6, 4.2)).join('');
    const mt = [[483, 1015, 488, 1038, 3.6], [473, 1016, 475, 1041, 2.7], [464, 1016, 463, 1040, 2.6], [456, 1015, 452, 1038, 2.5], [448, 1010, 441, 1033, 2.6]], zl = [[0, 12, 10], [10, 7, 6], [9.5, 6.5, 5.5], [9, 6, 5], [8, 5.5, 4.5]];
    mt.forEach(([x1, y1, x2, y2, d], j) => { b += knochen(V.klein, x1, y1, x2, y2, d); const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; let x = x2 + ux * 1.5, y = y2 + uy * 1.5; const pts = [[x, y]];
      zl[j].filter(Boolean).forEach(l => { x += ux * l; y += uy * l; pts.push([x, y]); }); b += finger(pts, j ? 2.3 : 3.4); });
    return b;
  }, 1000);
  s += `<g transform="translate(500 30) scale(1.0) translate(-500 -30)">${schaedelVorn()}</g>`;
  return s;
}
const R = (x, y) => [1000 - x, y]; // Punkt auf der rechten Körperhälfte (gespiegelt)
BILD.sk_mensch = { titel: 'Skelett des Menschen', W: 1000, H: 1100, unter: 'Skelett des Menschen von vorn (Schema) · hellblau: Knorpel', zeichne: mensch,
  pts: [['Schädel', 478, 50, 'l', 60, 'schützt das Gehirn und die Sinnesorgane'],
    ['Schlüsselbein', 448, 216, 'l', 160, 'verbindet Brustbein und Schulterblatt; hält die Schulter seitlich'],
    ['Oberarmknochen', 379, 320, 'l', 270, 'langer Knochen zwischen Schulter- und Ellenbogengelenk'],
    ['Speiche', 353, 488, 'l', 400, 'Unterarmknochen auf der Daumenseite; dreht sich beim Drehen der Hand'],
    ['Handknochen', 361, 606, 'l', 520, 'Handwurzel-, Mittelhand- und Fingerknochen – viele kleine Knochen, sehr beweglich'],
    ['Oberschenkelknochen', 441, 640, 'l', 640, 'längster und kräftigster Knochen des Körpers'],
    ['Wadenbein', 441, 880, 'l', 860, 'dünner Unterschenkelknochen an der Außenseite'],
    ['Fußknochen', 470, 1022, 'l', 990, 'Fußwurzel-, Mittelfuß- und Zehenknochen; tragen das Körpergewicht'],
    ['Schulterblatt', ...R(408, 250), 'r', 150, 'flacher Knochen hinten an der Schulter; bildet mit dem Oberarm das Schultergelenk'],
    ['Brustbein', 500, 296, 'r', 230, 'vorn in der Mitte des Brustkorbs; hier setzen die Rippen mit Knorpel an'],
    ['Rippen', ...R(422, 352), 'r', 310, '12 Paare; bilden mit Brustbein und Wirbelsäule den Brustkorb – schützen Herz und Lunge'],
    ['Wirbelsäule', 500, 422, 'r', 390, 'Achse des Körpers aus vielen Wirbeln mit Bandscheiben; trägt den Kopf, schützt das Rückenmark'],
    ['Becken', ...R(428, 474), 'r', 470, 'verbindet Wirbelsäule und Beine; trägt und schützt die Bauchorgane'],
    ['Elle', ...R(376, 492), 'r', 550, 'Unterarmknochen auf der Seite des kleinen Fingers; bildet den Ellenbogen'],
    ['Kniescheibe', ...R(462, 724), 'r', 720, 'schützt das Kniegelenk vorn'],
    ['Schienbein', ...R(465, 880), 'r', 860, 'kräftiger Unterschenkelknochen; trägt das Körpergewicht']] };

// =====================================================================
// Hilfen für Zähne und Wirbel (Seitenansicht)
// =====================================================================
const mm = (L, liste) => liste.map(([n, x, y, ...r]) => [n, ...L.p(x, y), ...r]); /* Beschriftungspunkte aus Zeichnungskoordinaten */
const lageAn = (ziel, punkt, k, rot = 0) => { const a = rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return lage(ziel[0] - k * (punkt[0] * c - punkt[1] * s), ziel[1] - k * (punkt[0] * s + punkt[1] * c), k, rot); };
// Kegelzahn (Schneide-, Eckzahn): Basis bei (x,y), Breite b, Höhe h, krumm = Versatz der Spitze
const kegel = (x, y, b, h, unten, krumm = 0) => { const s = unten ? 1 : -1; return zahn([[x - b / 2, y, 1], [x + b / 2, y, 1], [x + b * 0.42 + krumm * 0.45, y + s * h * 0.55], [x + krumm, y + s * h], [x - b * 0.45 + krumm * 0.5, y + s * h * 0.5]]); };
// Backenzahn mit Höckern (hs: Höckerhöhen von vorn nach hinten)
const backen = (x1, x2, y, hs, unten) => { const s = unten ? 1 : -1, n = hs.length, w = x2 - x1, p = [[x2, y, 1], [x2 - w * 0.03, y + s * hs[0] * 0.6]];
  hs.forEach((h, i) => { const xa = x2 - w * i / n, xb = x2 - w * (i + 1) / n; if (i) p.push([xa, y + s * Math.min(h, hs[i - 1]) * 0.62]); p.push([(xa + xb) / 2, y + s * h, 1]); });
  p.push([x1 + w * 0.03, y + s * hs[n - 1] * 0.6]); p.push([x1, y, 1]); return zahn(p); };
// Wirbelsäule von der Seite: Liste von Wirbeln {x,y,a (Richtung kopfwärts in Grad), l, h, dorn, neig, quer, fern}
function wirbelReihe(liste, o = {}) {
  let hinten = '', mitte = '', vorn = '';
  for (const w of liste) {
    const tr = `translate(${f(w.x)} ${f(w.y)}) rotate(${f(w.a)})`, h2 = w.h / 2;
    let g = '';
    if (w.bogen !== false) g += flaeche([[-w.l * 0.42, -h2 + 1], [-w.l * 0.3, -h2 - w.h * 0.42], [w.l * 0.3, -h2 - w.h * 0.42], [w.l * 0.42, -h2 + 1]], { fern: w.fern });
    if (w.dorn) { const n = (w.neig || 0) * Math.PI / 180, bx = (w.dx || 0), by = -h2 - w.h * 0.3; g += band([[bx, by], [bx + Math.sin(n) * w.dorn * 0.5, by - Math.cos(n) * w.dorn * 0.5], [bx + Math.sin(n) * w.dorn, by - Math.cos(n) * w.dorn]], w.l * 0.5, Math.max(2.5, w.l * 0.26), { fern: w.fern }); }
    if (w.quer) g += band([[0, 0], [w.quer * 0.6, w.quer * 0.25], [w.quer, w.quer * 0.42]], w.l * 0.42, w.l * 0.22, { fern: w.fern });
    hinten += `<g transform="${tr}">${g}</g>`;
    vorn += `<g transform="${tr}"><rect x="${f(-w.l / 2)}" y="${f(-h2)}" width="${f(w.l)}" height="${f(w.h)}" rx="${f(Math.min(w.l, w.h) * 0.3)}" ${fuell(w.fern ? 'FR' : 'R', 1.3)}/></g>`;
  }
  if (o.scheiben) mitte = band(liste.map(w => [w.x, w.y]), liste[0].h * 0.7, liste[liste.length - 1].h * 0.7, { knorpel: true, ohneGlanz: true });
  return hinten + mitte + vorn;
}
// Wirbel entlang einer Linie verteilen (pts von kopfwärts nach schwanzwärts)
function verteile(pts, n, fn) { const q = kurve(pts, 12), L = [0]; for (let i = 1; i < q.length; i++) L.push(L[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]));
  const at = s => { for (let i = 1; i < q.length; i++) if (L[i] >= s) { const u = (s - L[i - 1]) / (L[i] - L[i - 1] || 1); return [q[i - 1][0] + (q[i][0] - q[i - 1][0]) * u, q[i - 1][1] + (q[i][1] - q[i - 1][1]) * u, Math.atan2(q[i - 1][1] - q[i][1], q[i - 1][0] - q[i][0]) * 180 / Math.PI]; } const a = q[q.length - 2], b = q[q.length - 1]; return [b[0], b[1], Math.atan2(a[1] - b[1], a[0] - b[0]) * 180 / Math.PI]; };
  return Array.from({ length: n }, (_, i) => { const t = n === 1 ? 0.5 : i / (n - 1), [x, y, a] = at(t * L[L.length - 1]); return Object.assign({ x, y, a }, fn(i, t)); }); }

// =====================================================================
// SCHÄDEL HUND (von der Seite, Nase rechts; Maße in mm, Ursprung: äußerer Gehörgang)
// =====================================================================
const mund = p => `<path d="${glatt(p)}" fill="#6f6150" fill-opacity=".5"/>`; /* dunkler Spalt zwischen den Zahnreihen */
function schaedelHund() {
  let s = flaeche([[-30, -46], [-14, -58], [6, -64], [30, -62], [55, -55], [75, -50], [88, -44], [110, -38], [140, -32], [170, -27], [192, -24], [198, -20, 1], [196, -14], [200, -6], [207, 2], [209, 8, 1], [204, 12], [190, 13], [175, 12], [150, 11], [125, 10], [105, 10], [88, 9], [80, 6], [60, 6], [40, 8], [20, 8], [10, 6], [2, 10], [-4, 18], [-12, 18], [-18, 14], [-22, 22, 1], [-26, 14], [-31, 6], [-35, -8], [-35, -28]]);
  s += `<path d="${glatt([[2, -8], [10, -40], [32, -54], [52, -48], [50, -28], [46, -8], [26, -2]])}" fill="#d6c6a2" fill-opacity=".4"/>`; // Schläfengrube
  s += loch([[54, -30], [60, -42], [74, -46], [88, -42], [94, -32], [92, -16], [82, -8], [66, -6], [56, -14]]); // Augenhöhle
  s += loch([[191, -22], [197, -17], [200, -8], [197, -3], [191, -7], [188, -15]]) + lochEl(132, -12, 3, 2.2); // Nasenöffnung, Unteraugenhöhlenloch
  s += linie([[-28, -47], [0, -60], [40, -58]], KS, 1.2) + band([[60, -45], [57, -40], [55, -35]], 5, 3) + linie([[100, -36], [130, -22], [160, -16]], KF) + el(-5, 13, 9, 7) + lochEl(0, -1, 4, 3.4);
  s += mund([[205, 11], [190, 13], [150, 11], [105, 10], [86, 9], [84, 15], [110, 17], [140, 18], [170, 19], [194, 17]]);
  // Unterkiefer mit Zähnen
  s += kegel(197, 16.5, 3.2, 7, false) + kegel(200.5, 15.5, 3.2, 7, false) + kegel(193.5, 17, 7, 20, false, -2.5);
  s += backen(178, 182, 18.5, [3.5], false) + backen(162, 172, 19, [2, 6, 2.5], false) + backen(146, 159, 18.5, [2.5, 7, 3], false) + backen(129, 143, 18, [3, 8, 3.5], false) + backen(101, 125, 17, [6, 11, 8, 4], false) + backen(89, 99, 16, [4, 3.5], false) + backen(82, 88, 15, [2.5], false);
  s += flaeche([[196, 16], [200, 22], [198, 30], [190, 36], [170, 38], [140, 40], [110, 41], [80, 40], [50, 38], [25, 34], [8, 28], [-5, 26, 1], [2, 20], [5, 12], [3, 7], [10, 2], [16, 8], [18, -8], [22, -26], [28, -33], [35, -29], [42, -12], [52, 4], [80, 14], [110, 17], [140, 18], [170, 19], [188, 18]]);
  s += lochEl(168, 30, 2.4, 1.8) + lochEl(150, 31, 2, 1.5) + el(7, 5, 5, 3.5);
  // Oberkieferzähne (außen über den unteren), Jochbogen
  s += kegel(207, 9.5, 3.4, 7, true) + kegel(203.5, 10.5, 3.6, 7.5, true) + kegel(199, 11.5, 4.2, 9, true, -1) + kegel(185, 13, 8, 22, true, -3);
  s += backen(171, 176, 12, [5], true) + backen(155, 166, 11.5, [2.5, 7, 3], true) + backen(137, 152, 11, [3, 8, 3.5], true) + backen(110, 133, 10.5, [4, 12, 6], true) + backen(96, 109, 10, [5, 5], true) + backen(87, 95, 9.5, [3.5, 3.5], true);
  s += flaeche([[-2, 6], [8, -1], [30, -5], [54, -7], [74, -8], [92, -12], [104, -16], [106, -8], [98, 2], [80, 6], [58, 7], [34, 9], [12, 11], [0, 12]]) + band([[52, -6], [53, -13], [55, -19]], 5, 3); // Jochbogen mit Stirnfortsatz
  return s;
}
function schaedelKatze() {
  let s = flaeche([[-20, -28], [-8, -40], [8, -46], [25, -46], [40, -40], [50, -32], [58, -26], [68, -20], [76, -16, 1], [77, -10], [79, -4], [81, 2], [81, 7, 1], [76, 8], [68, 8], [60, 7], [48, 6], [40, 4], [30, 8], [16, 9], [8, 6], [4, 10], [-2, 20], [-12, 20], [-16, 13], [-18, 17, 1], [-22, 6], [-25, -6], [-24, -20]]);
  s += `<path d="${glatt([[0, -6], [4, -26], [18, -38], [30, -34], [28, -18], [24, -4], [12, -2]])}" fill="#d9caa8" fill-opacity=".55"/>`;
  s += loch([[28, -24], [32, -34], [42, -38], [52, -34], [56, -24], [54, -12], [46, -6], [34, -6], [28, -14]]);
  s += loch([[73, -16], [77, -12], [79, -5], [77, -1], [73, -6]]) + lochEl(60, -6, 2, 1.5) + lochEl(0, -1, 3.2, 2.8) + el(-6, 13, 8, 6.5);
  s += band([[35, -34], [32, -29], [30, -25]], 4, 2.6) + linie([[-18, -30], [0, -44], [20, -46]], KF);
  s += mund([[78, 8], [60, 7], [42, 5], [40, 10], [52, 14], [66, 15], [76, 14]]);
  let u =kegel(75.5, 14.5, 2, 3.4, false) + kegel(78, 14, 2, 3.4, false) + kegel(72, 15, 5, 15, false, -1.5);
  u += backen(58, 64, 15, [1.5, 4.5, 2], false) + backen(50, 57, 15, [2, 5, 2.5], false) + backen(40, 50, 14, [6, 4], false);
  u += flaeche([[76, 14], [79, 20], [76, 26], [66, 28], [50, 28], [32, 26], [16, 22], [4, 18], [-2, 18, 1], [2, 12], [4, 7], [8, 4], [12, 8], [14, -6], [16, -18], [22, -16], [26, -4], [34, 8], [44, 13], [60, 15], [72, 15]]);
  u += lochEl(66, 22, 1.5, 1.1);
  s += u;
  s += kegel(80, 8, 2, 3.4, true) + kegel(77.6, 8.4, 2.2, 3.6, true) + kegel(72, 8.6, 5.6, 15, true, -1.5);
  s += backen(63, 66, 8, [2.4], true) + backen(55, 63, 7.5, [2, 6, 2.5], true) + backen(41, 56, 7, [3, 8, 5], true);
  s += flaeche([[-2, 4], [8, 0], [22, -1], [34, 0], [46, -3], [54, -10], [58, -6], [54, 4], [42, 9], [26, 10], [10, 10], [0, 9]]) + band([[33, 0], [31, -8], [30, -14]], 4, 2.6); // Jochbogen mit Stirnfortsatz
  return s;
}

// =====================================================================
// HUND und KATZE (von der Seite, Kopf rechts) – gemeinsamer Bauplan, eigene Maße
// =====================================================================
function vierbeiner(P) {
  const d = P.d;
  const vorderbein = (dx, dy, fern) => { const o = { fern }, m = ([x, y]) => [x + dx, y + dy];
    let s = knochen(V.elleS, ...m(P.elle[0]), ...m(P.elle[1]), d.elle, o) + knochen(V.speicheS, ...m(P.speiche[0]), ...m(P.speiche[1]), d.speiche, o);
    s += knochen(V.oberarmS, ...m(P.schulter), ...m(P.ellbogen), d.oberarm, o);
    const [cx, cy] = m(P.handwurzel); s += el(cx - 14, cy + 1, d.speiche * 0.9, d.speiche * 1.1, o) + el(cx, cy - 2, d.speiche * 1.4, d.speiche * 0.9, o) + el(cx + 1, cy + 6, d.speiche * 1.4, d.speiche * 0.9, o);
    s += knochen(V.klein, ...m(P.mittelhand[0]), ...m(P.mittelhand[1]), d.mittel, o) + finger(P.zehe.map(m), d.mittel * 0.95, Object.assign({ stumpf: true }, o)) + kralle(m(P.zehe[P.zehe.length - 1]), P.kralle, fern);
    return s; };
  const hinterbein = (dx, dy, fern) => { const o = { fern }, m = ([x, y]) => [x + dx, y + dy];
    let s = knochen(V.roehre, ...m(P.wadenbein[0]), ...m(P.wadenbein[1]), d.wadenbein, o);
    s += knochen(V.oberschenkelS, ...m(P.huefte), ...m(P.knie), d.oberschenkel, o) + el(...m(P.huefte), d.oberschenkel * 1.25, d.oberschenkel * 1.25, o) + el(...m(P.kniescheibe), d.oberschenkel * 0.6, d.oberschenkel * 1.1, Object.assign({ rot: -20 }, o));
    s += knochen(V.schienbeinS, ...m(P.knie2), ...m(P.sprung), d.schienbein, o);
    s += knochen(V.roehre, ...m(P.ferse[0]), ...m(P.ferse[1]), d.ferse, o);
    const [tx, ty] = m(P.sprung); s += el(tx + 4, ty + 6, d.schienbein * 1.1, d.schienbein * 0.9, o) + el(tx + 8, ty + 17, d.mittel * 1.3, d.mittel * 1.1, o);
    s += knochen(V.klein, ...m(P.mittelfuss[0]), ...m(P.mittelfuss[1]), d.mittel, o) + finger(P.zeheH.map(m), d.mittel * 0.95, Object.assign({ stumpf: true }, o)) + kralle(m(P.zeheH[P.zeheH.length - 1]), P.kralle, fern);
    return s; };
  let s = DEFS + `<g transform="translate(${P.dx} ${P.dy})">`;
  s += vorderbein(...P.fernV, true) + hinterbein(...P.fernH, true);
  // Wirbelsäule (Halswirbel vom Kopf aus: Atlas, Axis, … 7. Halswirbel)
  const hals = verteile(P.hals, 7, i => ({ l: P.wg.hals[0] * (i === 0 ? 0.9 : i === 1 ? 1.25 : 1), h: P.wg.hals[1], dorn: i === 6 ? P.dornC7 : i < 2 ? 0 : 5, neig: 10 }));
  const brust = verteile(P.brust, 13, i => ({ l: P.wg.brust[0], h: P.wg.brust[1], dorn: P.dornT[i], neig: P.neigT[i] }));
  const lende = verteile(P.lende, 7, i => ({ l: P.wg.lende[0], h: P.wg.lende[1], dorn: P.dornL[i], neig: P.neigL, quer: P.querL }));
  const schwanz = verteile(P.schwanz, P.schwanzN, (i, t) => ({ l: P.wg.schwanz[0] * (1 - t * 0.5), h: P.wg.schwanz[1] * (1 - t * 0.6), dorn: i < 4 ? 5 - i : 0, neig: 20, bogen: i < 6 }));
  s += wirbelReihe(schwanz);
  s += wirbelReihe([...hals, ...brust, ...lende], { scheiben: true });
  // zweiter Halswirbel mit Kamm, erster Halswirbel (Atlas) mit Flügel
  const c2 = hals[1], c1 = hals[0];
  s += `<g transform="translate(${f(c2.x)} ${f(c2.y)}) rotate(${f(c2.a)})">${flaeche([[-c2.l * 0.5, -c2.h * 0.5], [-c2.l * 0.3, -c2.h * 1.15], [c2.l * 0.55, -c2.h * 1.2], [c2.l * 0.6, -c2.h * 0.7], [c2.l * 0.4, -c2.h * 0.45]])}</g>`;
  s += `<g transform="translate(${f(c1.x)} ${f(c1.y)}) rotate(${f(c1.a)})">${flaeche([[-c1.l * 0.7, -c1.h * 0.2], [-c1.l * 0.5, -c1.h * 0.75], [c1.l * 0.4, -c1.h * 0.8], [c1.l * 0.55, c1.h * 0.1], [c1.l * 0.2, c1.h * 0.75], [-c1.l * 0.6, c1.h * 0.6]])}</g>`;
  s += flaeche(P.kreuzbein) + P.kreuzDorn.map(([x, y]) => band([[x, y], [x - 3, y - 9]], 6, 3)).join('');
  // Rippen mit Rippenknorpel, Brustbein
  const [sa, sb] = P.brustbein, sx = t => [sa[0] + (sb[0] - sa[0]) * t, sa[1] + (sb[1] - sa[1]) * t], J = [], kn = [];
  brust.forEach((w, i) => { const jx = w.x - P.rZurueck[i], jy = P.rTief[i]; J.push([jx, jy]);
    s += band([[w.x + 2, w.y + 1], [w.x - P.rZurueck[i] * 0.45, w.y + (jy - w.y) * 0.32], [w.x - P.rZurueck[i] * 0.9, w.y + (jy - w.y) * 0.7], [jx, jy]], P.rB, P.rB * 0.9); });
  let k = '';
  for (let i = 0; i < 13; i++) { const [jx, jy] = J[i];
    if (i < 9) { const [zx, zy] = sx(i === 0 ? 0.02 : (i - 0.4) / 8.4); kn.push([jx + (zx - jx) * 0.5, jy + (zy - jy) * 0.5]); k += band([[jx, jy], [jx + (zx - jx) * 0.35, jy + (zy - jy) * 0.6], [zx, zy]], P.rB * 0.85, P.rB * 0.75, { knorpel: true }); }
    else if (i < 12) { const [px, py] = kn[i - 1]; kn.push([jx + (px - jx) * 0.5, jy + (py - jy) * 0.55]); k += band([[jx, jy], [jx + (px - jx) * 0.35, jy + (py - jy) * 0.65], [px, py]], P.rB * 0.8, P.rB * 0.7, { knorpel: true }); }
    else k += band([[jx, jy], [jx + 6, jy + 12]], P.rB * 0.8, P.rB * 0.5, { knorpel: true }); }
  s += k;
  for (let i = 0; i < 8; i++) { const [x1, y1] = sx(i / 8 + 0.01), [x2, y2] = sx((i + 1) / 8 - 0.01); s += knochen(V.klein, x1, y1, x2, y2, P.rB * 0.75); }
  s += band([sb, [sb[0] - 14, sb[1] + 3], [sb[0] - 26, sb[1] + 4]], P.rB, P.rB * 0.6, { knorpel: true }); // Schwertfortsatz (Knorpel)
  // Becken, Schulterblatt
  s += flaeche(P.becken) + `<circle cx="${f(P.huefte[0])}" cy="${f(P.huefte[1])}" r="${f(d.oberschenkel * 1.55)}" fill="#d9cba9" stroke="${KS}" stroke-width="1.3" ${NS}/>` + lochEl(...P.foramen);
  s += band(P.sbKnorpel, P.rB * 1.3, P.rB * 1.3, { knorpel: true, ohneGlanz: true }) + flaeche(P.schulterblatt) + band(P.spina, P.rB * 0.9, P.rB * 0.9);
  s += hinterbein(0, 0, false) + vorderbein(0, 0, false);
  s += P.kopf.g(P.schaedel());
  return s + '</g>';
}
const kralle = ([x, y], [w, l, krumm], fern) => `<path d="${glatt([[x - 1, y - w * 0.5], [x + l * 0.6, y - w * 0.35 - krumm * 0.3], [x + l, y + krumm, 1], [x + l * 0.55, y + w * 0.25], [x - 1, y + w * 0.5]])}" fill="${fern ? '#d8d0c2' : '#9b8d76'}" stroke="${fern ? KF : KS}" stroke-width="1.2" ${NS}/>`;

const HUND = { dx: -24, dy: -40, d: { oberarm: 5, elle: 3.4, speiche: 3.6, mittel: 3, oberschenkel: 5.2, schienbein: 4.6, wadenbein: 1.6, ferse: 3.8 },
  hals: [[906, 296], [896, 308], [882, 334], [866, 362], [846, 394]], brust: [[830, 398], [790, 384], [740, 374], [690, 368], [642, 366]], lende: [[624, 366], [580, 361], [536, 364], [502, 372]],
  schwanz: [[432, 393], [402, 410], [372, 438], [344, 476], [322, 522], [306, 572]], schwanzN: 20,
  wg: { hals: [21, 14], brust: [13.5, 15], lende: [18, 17], schwanz: [14, 11] }, dornC7: 18,
  dornT: [62, 66, 64, 60, 55, 48, 42, 36, 30, 26, 24, 22, 22], neigT: [-28, -26, -24, -22, -20, -18, -15, -12, -8, 0, 6, 10, 12], dornL: [22, 24, 25, 25, 24, 22, 18], neigL: 22, querL: 22,
  kreuzbein: [[492, 368], [488, 384], [470, 390], [446, 396], [444, 382], [466, 374]], kreuzDorn: [[484, 368], [470, 372], [456, 377]],
  rZurueck: [-6, 4, 12, 20, 28, 34, 40, 46, 50, 54, 56, 56, 52], rTief: [448, 456, 462, 468, 472, 474, 474, 472, 468, 462, 452, 440, 424], rB: 5.6, brustbein: [[850, 470], [702, 528]],
  becken: [[496, 344], [510, 348], [518, 360], [512, 376], [490, 386], [468, 394], [458, 408], [448, 424], [426, 432], [404, 428], [390, 414, 1], [396, 402], [414, 398], [432, 392], [452, 384], [470, 368], [484, 350]], foramen: [421, 416, 11, 5.5, -8],
  schulterblatt: [[828, 356], [806, 352], [786, 358], [770, 374], [784, 396], [806, 420], [830, 442], [850, 456], [858, 466], [866, 478], [880, 472], [882, 460], [874, 448], [864, 428], [852, 398], [842, 370]],
  spina: [[800, 356], [820, 392], [842, 428], [860, 454], [870, 460]], sbKnorpel: [[830, 354], [806, 349], [784, 355], [768, 372]],
  schulter: [866, 470], ellbogen: [812, 560], elle: [[794, 538], [824, 652]], speiche: [[816, 566], [828, 650]], handwurzel: [830, 661], mittelhand: [[832, 670], [846, 694]], zehe: [[848, 697], [860, 702], [870, 704]], kralle: [4.5, 12, 4],
  huefte: [448, 404], knie: [518, 508], kniescheibe: [530, 494], knie2: [514, 514], sprung: [436, 610], wadenbein: [[504, 520], [430, 604]], ferse: [[432, 616], [420, 588]],
  mittelfuss: [[440, 628], [452, 694]], zeheH: [[454, 697], [466, 702], [476, 704]], fernV: [-26, -4], fernH: [22, -4],
  schaedel: schaedelHund, kopf: lageAn([910, 296], [-31, 6], 0.68, 12) };
const KATZE = { dx: -10, dy: -40, d: { oberarm: 4, elle: 2.8, speiche: 3, mittel: 2.4, oberschenkel: 4.4, schienbein: 3.8, wadenbein: 1.3, ferse: 3.2 },
  hals: [[898, 308], [888, 322], [876, 346], [862, 372], [846, 402]], brust: [[832, 406], [790, 392], [740, 382], [690, 378], [642, 378]], lende: [[624, 377], [578, 370], [532, 371], [494, 380]],
  schwanz: [[432, 398], [396, 414], [360, 446], [330, 500], [314, 566], [316, 630]], schwanzN: 22,
  wg: { hals: [20, 12], brust: [13.5, 13], lende: [19, 15], schwanz: [13, 9] }, dornC7: 14,
  dornT: [30, 30, 29, 28, 26, 24, 22, 20, 18, 16, 16, 16, 16], neigT: [-30, -28, -26, -24, -22, -20, -16, -12, -6, 0, 8, 12, 14], dornL: [18, 20, 22, 22, 22, 20, 16], neigL: 25, querL: 22,
  kreuzbein: [[486, 374], [482, 390], [466, 396], [444, 402], [442, 388], [462, 380]], kreuzDorn: [[478, 374], [464, 379], [452, 384]],
  rZurueck: [-6, 2, 10, 18, 26, 32, 38, 44, 48, 52, 54, 54, 50], rTief: [452, 460, 466, 470, 474, 476, 476, 474, 470, 464, 454, 442, 428], rB: 4.8, brustbein: [[848, 476], [712, 520]],
  becken: [[492, 358], [504, 364], [506, 376], [490, 388], [470, 396], [456, 404], [450, 418], [440, 432], [420, 438], [398, 434], [384, 420, 1], [390, 408], [408, 404], [426, 398], [446, 388], [464, 376], [478, 364]], foramen: [416, 424, 10, 5, -8],
  schulterblatt: [[822, 368], [800, 364], [778, 370], [764, 386], [778, 406], [800, 428], [824, 446], [848, 460], [856, 470], [864, 484], [876, 480], [880, 468], [872, 454], [862, 432], [850, 404], [838, 380]],
  spina: [[796, 368], [816, 402], [838, 436], [856, 460], [866, 466]], sbKnorpel: [[824, 366], [800, 361], [776, 368], [762, 384]],
  schulter: [864, 474], ellbogen: [806, 566], elle: [[786, 544], [818, 662]], speiche: [[810, 572], [822, 660]], handwurzel: [824, 670], mittelhand: [[826, 680], [838, 699]], zehe: [[840, 701], [850, 704], [858, 705]], kralle: [3.6, 8, -2],
  huefte: [444, 410], knie: [508, 520], kniescheibe: [520, 508], knie2: [504, 526], sprung: [430, 630], wadenbein: [[494, 532], [424, 622]], ferse: [[426, 636], [414, 608]],
  mittelfuss: [[434, 650], [446, 698]], zeheH: [[448, 700], [458, 704], [466, 705]], fernV: [-24, -4], fernH: [22, -4],
  schaedel: schaedelKatze, kopf: lageAn([906, 306], [-22, 6], 1.25, 6) };
// Beschriftung: [Begriff, x, y, Seite, Kästchen-y, Funktion]; Punkte mit 'k' am Ende liegen im Schädel (mm)
const vbPts = (P, liste) => liste.map(([n, x, y, s, ay, fn, k]) => { const [px, py] = k ? P.kopf.p(x, y) : [x, y]; return [n, px + P.dx, py + P.dy, s, ay, fn]; });
BILD.sk_hund = { titel: 'Skelett des Hundes', W: 1300, H: 700, unter: 'Skelett des Hundes von der Seite (Schema) · hellere Beine: andere Körperseite · hellblau: Knorpel', zeichne: () => vierbeiner(HUND),
  pts: vbPts(HUND, [['Wirbelsäule', 580, 362, 'l', 80, 'Achse des Körpers aus vielen Wirbeln; schützt das Rückenmark'],
    ['Becken', 500, 360, 'l', 150, 'verbindet Wirbelsäule und Hinterbeine'],
    ['Oberschenkelknochen', 483, 456, 'l', 230, 'Knochen zwischen Hüft- und Kniegelenk'],
    ['Kniescheibe', 530, 494, 'l', 300, 'schützt das Kniegelenk'],
    ['Schwanzwirbel', 372, 438, 'l', 370, 'viele kleine Wirbel; der Schwanz hilft beim Gleichgewicht und bei der Verständigung'],
    ['Unterschenkelknochen', 475, 562, 'l', 450, 'Schienbein und Wadenbein zwischen Knie und Ferse'],
    ['Fersenbein', 424, 596, 'l', 530, 'Ansatz der Achillessehne – der Hund läuft auf den Zehen (Zehengänger)'],
    ['Zehenknochen', 466, 702, 'l', 610, 'der Hund tritt nur mit den Zehen auf'],
    ['Schädel', 20, -45, 'r', 60, 'schützt Gehirn und Sinnesorgane; lange Schnauze mit kräftigem Gebiss', 1],
    ['Halswirbel', 882, 334, 'r', 130, 'sieben Halswirbel – wie bei fast allen Säugetieren'],
    ['Unterkiefer', 120, 36, 'r', 200, 'beweglicher Kiefer mit den unteren Zähnen', 1],
    ['Schulterblatt', 812, 402, 'r', 270, 'flacher Knochen; verbindet das Vorderbein mit dem Rumpf'],
    ['Rippen', 700, 430, 'r', 340, 'bilden mit Brustbein und Wirbelsäule den Brustkorb; schützen Herz und Lunge'],
    ['Brustbein', 776, 499, 'r', 420, 'unten am Brustkorb; hier enden die Rippenknorpel'],
    ['Oberarmknochen', 840, 515, 'r', 490, 'Knochen zwischen Schulter- und Ellenbogengelenk'],
    ['Elle und Speiche', 822, 610, 'r', 570, 'die beiden Unterarmknochen'],
    ['Mittelhandknochen', 839, 682, 'r', 640, 'zwischen Handwurzel und Zehen']]) };
BILD.sk_katze = { titel: 'Skelett der Katze', W: 1300, H: 700, unter: 'Skelett der Katze von der Seite (Schema) · hellere Beine: andere Körperseite · hellblau: Knorpel', zeichne: () => vierbeiner(KATZE),
  pts: vbPts(KATZE, [['Wirbelsäule', 578, 370, 'l', 80, 'sehr biegsam – die Katze kann sich stark krümmen und strecken'],
    ['Becken', 494, 368, 'l', 150, 'verbindet Wirbelsäule und Hinterbeine'],
    ['Oberschenkelknochen', 476, 465, 'l', 230, 'Knochen zwischen Hüft- und Kniegelenk; kräftig für weite Sprünge'],
    ['Kniescheibe', 520, 508, 'l', 300, 'schützt das Kniegelenk'],
    ['Schwanzwirbel', 330, 500, 'l', 370, 'sehr langer Schwanz aus vielen Wirbeln – wichtig für das Gleichgewicht beim Springen und Klettern'],
    ['Unterschenkelknochen', 467, 578, 'l', 450, 'Schienbein und Wadenbein zwischen Knie und Ferse'],
    ['Fersenbein', 418, 614, 'l', 530, 'Ansatz der Achillessehne – die Katze ist ein Zehengänger'],
    ['Zehenknochen', 458, 704, 'l', 610, 'am letzten Zehenglied sitzen die einziehbaren Krallen'],
    ['Schädel', 10, -35, 'r', 60, 'rund mit kurzem Gesicht und großen Augenhöhlen', 1],
    ['Halswirbel', 876, 346, 'r', 130, 'sieben Halswirbel – wie bei fast allen Säugetieren'],
    ['Unterkiefer', 40, 24, 'r', 200, 'beweglicher Kiefer; Fangzähne zum Festhalten der Beute', 1],
    ['Schulterblatt', 808, 404, 'r', 270, 'nur in Muskeln aufgehängt (kein Gelenk zum Rumpf) – weite, federnde Sprünge'],
    ['Rippen', 700, 440, 'r', 340, 'bilden mit Brustbein und Wirbelsäule den Brustkorb; schützen Herz und Lunge'],
    ['Brustbein', 776, 498, 'r', 420, 'unten am Brustkorb; hier enden die Rippenknorpel'],
    ['Oberarmknochen', 836, 520, 'r', 490, 'Knochen zwischen Schulter- und Ellenbogengelenk'],
    ['Elle und Speiche', 816, 616, 'r', 570, 'die beiden Unterarmknochen'],
    ['Mittelhandknochen', 832, 690, 'r', 640, 'zwischen Handwurzel und Zehen']]) };
const LH = lage(330, 300, 2), LK = lage(360, 330, 4.4);
BILD.sch_hund = { titel: 'Schädel des Hundes', W: 1000, H: 600, unter: 'Schädel des Hundes von der Seite (Schema) · Fleischfressergebiss', zeichne: () => DEFS + LH.g(schaedelHund()),
  pts: mm(LH, [['Scheitelkamm', 2, -62, 'l', 100, 'Knochenkamm oben – Ansatz der kräftigen Kaumuskeln'],
    ['Hirnschädel', -22, -28, 'l', 180, 'umschließt und schützt das Gehirn'],
    ['Jochbogen', 40, 4, 'l', 260, 'Knochenbrücke; unter ihr verläuft der Kaumuskel'],
    ['Kiefergelenk', 8, 6, 'l', 340, 'Scharniergelenk: Unterkiefer geht nur auf und zu (kein Mahlen)'],
    ['Unterkiefer', 70, 35, 'l', 420, 'lang und kräftig – starke Beißkraft'],
    ['Augenhöhle', 72, -26, 'r', 110, 'schützt das Auge; Augen schräg nach vorn'],
    ['Nasenöffnung', 195, -12, 'r', 185, 'große Nasenhöhle – sehr guter Geruchssinn'],
    ['Schneidezähne', 205, 14, 'r', 260, 'klein – zum Abnagen und Putzen'],
    ['Fangzahn (Eckzahn)', 183, 26, 'r', 335, 'lang und spitz – packt und hält die Beute'],
    ['Reißzahn', 122, 19, 'r', 410, 'großer Backenzahn mit scharfen Kanten – schneidet Fleisch wie eine Schere'],
    ['Backenzähne', 102.5, 13.5, 'r', 485, 'zerkleinern und zerquetschen auch Knochen']]) };
BILD.sch_katze = { titel: 'Schädel der Katze', W: 1000, H: 600, unter: 'Schädel der Katze von der Seite (Schema) · Fleischfressergebiss', zeichne: () => DEFS + LK.g(schaedelKatze()),
  pts: mm(LK, [['Hirnschädel', -6, -30, 'l', 120, 'umschließt und schützt das Gehirn'],
    ['Jochbogen', 22, 4, 'l', 220, 'breite Knochenbrücke – Platz für kräftige Kaumuskeln'],
    ['Kiefergelenk', 5, 7, 'l', 300, 'Scharniergelenk: Unterkiefer geht nur auf und zu'],
    ['Unterkiefer', 40, 22, 'l', 380, 'kurz – dadurch sehr starke Beißkraft'],
    ['Augenhöhle', 42, -22, 'r', 130, 'sehr groß, nach vorn gerichtet – gutes räumliches Sehen, auch in der Dämmerung'],
    ['Nasenöffnung', 76, -8, 'r', 210, 'Öffnung der Nasenhöhle'],
    ['Schneidezähne', 79, 10, 'r', 290, 'sehr klein'],
    ['Fangzahn (Eckzahn)', 72.5, 16, 'r', 370, 'lang und dolchartig – tötet und hält die Beute'],
    ['Reißzahn', 48, 14, 'r', 450, 'schneidet Fleisch wie eine Schere']]) };

// =====================================================================
// SCHÄDEL MENSCH von der Seite (mm, Ursprung: äußerer Gehörgang, Blick nach rechts)
// =====================================================================
function schaedelMenschSeite() {
  let s = flaeche([[10, -125], [35, -123], [60, -115], [80, -100], [92, -80], [97, -56], [98, -43], [95, -31], [100, -24], [106, -14], [108, -9, 1], [103, -4], [100, 4], [103, 12], [110, 17, 1], [111, 30], [110, 36, 1], [100, 41], [85, 43], [70, 43], [56, 41], [50, 33], [44, 20], [34, 12], [20, 10], [8, 9], [0, 11], [-6, 18], [-10, 28, 1], [-17, 20], [-30, 15], [-50, 8], [-70, -5], [-84, -20], [-90, -45], [-86, -75], [-70, -100], [-46, -117], [-16, -126]]);
  s += naht([[36, -122], [37, -100], [39, -75], [40, -52], [37, -36]]) + naht([[37, -36], [20, -46], [0, -47], [-20, -41], [-33, -25], [-36, -8]]) + naht([[-58, -107], [-62, -80], [-56, -50], [-45, -24], [-36, -8]]) + linie([[86, -76], [60, -96], [20, -104], [-20, -98], [-50, -80], [-62, -56]], KF, 1.1);
  s += loch([[73, -40], [84, -44], [93, -40], [96, -28], [94, -15], [87, -9], [77, -9], [72, -18], [71, -30]]); // Augenhöhle
  s += loch([[107, -8], [102, -2], [100, 5], [103, 11], [107, 13], [104, 4]]); // Nasenöffnung (Rand)
  s += lochEl(0, 0, 4.5, 5.5) + lochEl(88, 3, 2.2, 1.7) + band([[-2, 14], [3, 24], [8, 34]], 2.6, 1.2); // Gehörgang, Unteraugenhöhlenloch, Griffelfortsatz
  s += mund([[110, 41], [85, 43], [60, 42], [58, 50], [85, 53], [108, 52]]);
  // Unterkiefer mit Zähnen
  const unten = [[106, 109, 9], [102, 106, 9], [96, 102, 10], [90, 96, 8], [84, 90, 8]];
  unten.forEach(([a, b, h], i) => { s += i < 3 ? kegel((a + b) / 2, 53, b - a, h, false, 0.5) : backen(a, b, 53, [h * 0.8, h * 0.6], false); });
  [[73, 84], [62, 73], [53, 62]].forEach(([a, b]) => { s += backen(a, b, 53, [6, 6.5], false); });
  s += flaeche([[109, 52], [112, 60], [111, 72], [106, 82], [98, 88], [84, 89], [60, 86], [36, 81], [18, 76], [10, 69], [7, 52], [8, 30], [10, 18], [6, 11], [11, 6], [18, 9], [26, 20], [34, 12], [40, 8], [46, 26], [52, 42], [58, 50], [70, 53], [85, 54], [100, 54]]);
  s += lochEl(88, 73, 2.3, 1.8) + linie([[46, 30], [56, 50], [70, 58]], KF);
  // Oberkieferzähne, Jochbein und Jochbogen
  [[108, 111, 10], [104, 108, 9.5], [97, 104, 11]].forEach(([a, b, h]) => { s += kegel((a + b) / 2, 42, b - a, h, true, 0.6); });
  [[91, 97], [85, 91]].forEach(([a, b]) => { s += backen(a, b, 42.5, [7, 6], true); });
  [[75, 85], [65, 75], [56, 65]].forEach(([a, b], i) => { s += backen(a, b, 42.5 - i, [6, 6.5], true); });
  s += flaeche([[62, 0], [44, 1], [24, 2], [10, 1], [4, 4], [6, 9], [20, 9], [40, 8], [58, 10]]) + flaeche([[66, -30], [72, -29], [74, -12], [86, -6], [91, 4], [82, 14], [66, 14], [56, 10], [60, 0], [64, -14]]); // Jochbogen, Jochbein
  return s;
}
function naht(pts) { return linie(pts, KF, 1.1, 'stroke-dasharray="4 3"'); }

// =====================================================================
// VOGEL (Taube, von der Seite, Kopf rechts, Flügel angehoben)
// =====================================================================
function schaedelVogel() { // mm, Ursprung: Kiefergelenk
  let s = flaeche([[-14, -6], [-16, -14], [-12, -22], [-4, -26], [6, -25], [14, -21], [19, -17], [21, -16.5], [30, -12.5], [40, -7.5], [46, -3.5], [49.5, .5], [49, 3, 1], [44, 1.2], [36, .4], [26, .2], [19, 1], [12, 2.4], [4, 2.6], [-2, 1.5], [-8, .5], [-12, -1.5]]);
  s += loch([[-4, -17], [0, -21], [6, -21.5], [11, -19], [13, -13], [11, -6], [5, -3], [-1, -4], [-5, -9]]);
  s += `<circle cx="4" cy="-12" r="5.4" fill="none" stroke="#efe6d2" stroke-width="2.6"/><circle cx="4" cy="-12" r="5.4" fill="none" stroke="${KS}" stroke-width="2.6" stroke-dasharray="1.1 1.2" stroke-opacity=".45"/>`; // Knochenring im Auge
  s += loch([[21, -11], [30, -9.6], [33.5, -7.6], [28, -7], [21, -8.4]]) + linie([[19, -17], [20, -12], [19, -7]], KF) + lochEl(-9.5, -4, 1.6, 1.8);
  s += band([[0, 2], [10, 1.6], [19, .8]], 1.6, 1.4) + flaeche([[-3, -4], [1, -4.5], [2, 3], [-2, 3.5]]);
  s += flaeche([[-3, 2.5], [4, 1.8], [20, 2.4], [36, 2.6], [47, 3.4], [48.5, 5, 1], [40, 6.2], [25, 6.6], [10, 6.8], [0, 6.4], [-4, 5]]);
  return s;
}
function vogel() {
  const SV = lageAn([842, 208], [-14, -4], 1.65, 6);
  const bein = (dx, dy, fern) => { const o = { fern }, m = ([x, y]) => [x + dx, y + dy];
    let b = band([m([712, 456]), m([700, 480]), m([690, 502])], 3, 1.2, o) + knochen(V.oberschenkelS, ...m([660, 405]), ...m([722, 446]), 4.4, o);
    b += knochen(V.schienbeinS, ...m([718, 452]), ...m([652, 562]), 3.8, o) + knochen(V.roehre, ...m([652, 568]), ...m([674, 632]), 3.4, o);
    b += finger([[676, 640], [696, 645], [710, 647], [722, 649], [732, 650]].map(m), 2.4, { fern: true, stumpf: true }) + kralle(m([732, 650]), [3, 9, 3], true); // 4. Zehe (dahinter)
    b += finger([[678, 638], [700, 642], [718, 645], [732, 647], [744, 648]].map(m), 2.6, Object.assign({ stumpf: true }, o)) + kralle(m([744, 648]), [3.4, 10, 3], fern); // 3. Zehe
    b += finger([[676, 637], [692, 638], [706, 639], [716, 640]].map(m), 2.4, Object.assign({ stumpf: true }, o)) + kralle(m([716, 640]), [3, 8, 2], fern); // 2. Zehe
    b += finger([[672, 639], [656, 643], [644, 646]].map(m), 2.5, Object.assign({ stumpf: true }, o)) + `<g transform="translate(${f(m([644, 646])[0] * 2)} 0) scale(-1 1)">${kralle(m([644, 646]), [3, 9, 3], fern)}</g>`; // 1. Zehe nach hinten
    return b; };
  let s = DEFS + '<g transform="translate(-110 -50) scale(1.12)">' + bein(-14, -4, true);
  // Becken (mit dem Kreuzbein verwachsen), Schwanzwirbel, Steißknochen
  s += flaeche([[742, 344], [722, 347], [690, 359], [650, 375], [612, 393], [586, 409], [580, 424], [600, 432], [626, 428], [650, 423], [668, 415], [684, 404], [704, 391], [726, 377], [745, 360]]) + lochEl(660, 405, 7.5, 7.5);
  s += flaeche([[652, 420], [626, 427], [598, 431], [586, 438], [598, 446], [628, 443], [656, 432]]) + lochEl(618, 434, 7, 3, -8) + band([[666, 418], [634, 438], [604, 448], [582, 452]], 3.2, 2);
  s += band([[744, 342], [700, 358], [650, 378], [600, 400]], 3.6, 3, { ohneGlanz: true });
  s += wirbelReihe(verteile([[588, 416], [570, 426], [552, 438]], 6, () => ({ l: 9, h: 8, dorn: 6, neig: -10 })));
  s += flaeche([[553, 432], [540, 432], [524, 446], [528, 458], [542, 452], [555, 444]]); // Steißknochen (trägt die Schwanzfedern)
  // Brustwirbel (verwachsen), Rippen mit Hakenfortsätzen, Brustbein mit Kiel
  s += wirbelReihe(verteile([[792, 330], [766, 340], [742, 350]], 5, () => ({ l: 9.5, h: 10, dorn: 12, neig: 0 })));
  for (let i = 0; i < 6; i++) {
    const vx = 786 - 11 * i, vy = 337 + 4.5 * i;
    if (i === 0) { s += band([[vx, vy], [vx - 6, vy + 26], [vx - 10, vy + 46]], 3.6, 2.8); continue; }
    const jx = 764 - 14 * i, jy = 424 + 6 * i, sx = 798 - 11 * i, sy = 432 + 4 * i;
    s += band([[vx, vy], [vx - 8, vy + 30], [jx + 4, jy - 30], [jx, jy]], 3.8, 3.4) + band([[jx, jy], [jx + 12, jy + 6], [sx, sy]], 3.2, 3);
    if (i < 5) s += band([[vx - 9, vy + 40], [vx - 18, vy + 34], [vx - 26, vy + 30]], 2.6, 1.6); // Hakenfortsatz
  }
  s += flaeche([[806, 446], [812, 468], [808, 496], [796, 520], [778, 530], [752, 524], [724, 508], [696, 492], [672, 484], [700, 478], [740, 466], [780, 452]]) + linie([[810, 472], [800, 508], [780, 524]], '#fffaf0', 2.2); // Kiel
  s += flaeche([[808, 428], [770, 440], [730, 454], [690, 468], [662, 478, 1], [668, 486], [700, 480], [740, 468], [780, 454], [810, 446]]); // Brustbeinplatte
  // Schulterblatt, Rabenbein, Gabelbein
  s += band([[804, 336], [770, 346], [736, 358], [706, 372]], 7, 3.6) + knochen(V.roehre, 806, 336, 806, 432, 4.2) + band([[814, 330], [822, 360], [826, 390], [820, 414]], 4.2, 3);
  s += bein(0, 0, false);
  // Halswirbel (S-förmig), Flügel, Schädel
  s += wirbelReihe(verteile([[840, 210], [828, 226], [818, 246], [816, 268], [822, 288], [814, 308], [796, 326]], 13, (i, t) => ({ l: 12.5 + t * 2, h: 8 + t * 2, dorn: 3, neig: 0, quer: 4 })));
  s += knochen(V.oberarmS, 806, 330, 770, 244, 4.6);
  s += knochen(V.roehre, 772, 236, 668, 188, 2.2) + knochen(V.roehre, 766, 242, 664, 198, 3.2) + el(662, 190, 4.5, 4) + el(664, 200, 4, 3.6); // Speiche, Elle, Handwurzel
  s += knochen(V.roehre, 658, 192, 594, 184, 2.8) + band([[656, 198], [630, 204], [606, 198], [594, 188]], 2.6, 2.2) + knochen(V.end, 652, 186, 664, 172, 2.4); // Mittelhand (zwei verwachsene Stäbe), Daumen
  s += knochen(V.klein, 590, 183, 562, 180, 3.2) + knochen(V.end, 559, 180, 544, 179, 1.8) + knochen(V.end, 590, 191, 578, 193, 1.8); // Finger
  s += SV.g(schaedelVogel());
  return s + '</g>';
}

// =====================================================================
// FROSCH (von oben, Kopf oben)
// =====================================================================
function schaedelFrosch() { // mm, Ursprung: Schädelmitte
  let s = beide(() => `<path d="${glatt([[-11.8, -4], [-9, -9], [-7.4, -7.5], [-7.5, -5.5], [-4, -4.5], [-3.6, -2], [-3.9, 2], [-4.6, 5], [-9.4, 5.4], [-11.4, 3.5], [-12.4, -.5]])}" fill="#e6dfd3" stroke="none"/>`, 0);
  s += beide(() => band([[-12.4, 8.4], [-9, 4], [-6, 1]], 1.2, .9, { fern: true, ohneGlanz: true }) + band([[-4.2, -4.6], [-8, -5.4], [-11.6, -4.6]], 1.1, .9, { fern: true, ohneGlanz: true }), 0); // Gaumenknochen (unten, durch die Augenhöhle sichtbar)
  s += band([[-13, 9], [-13.8, 3], [-13.2, -3], [-11, -8], [-7.2, -11.4], [-3.6, -13], [0, -13.6], [3.6, -13], [7.2, -11.4], [11, -8], [13.2, -3], [13.8, 3], [13, 9]], 1.5, 1.5); // Oberkieferbogen
  s += beide(() => flaeche([[-.6, -10.6, 1], [-6.8, -8.6, 1], [-7.6, -6.2], [-6.6, -5.2, 1], [-1, -5, 1]]) + flaeche([[-4.4, 5.4, 1], [-9.6, 5.8], [-11, 7.4, 1], [-9, 9.6], [-3.4, 9.4, 1]]) + band([[-12.6, 9], [-10.8, 7], [-10.6, 4], [-11.4, 2]], 1.4, 1.1) + lochEl(-4.6, -11.6, .9, .7), 0);
  s += flaeche([[-2.4, -5, 1], [2.4, -5, 1], [2.8, -2.4, 1], [-2.8, -2.4, 1]]) + flaeche([[-3.2, -2.6, 1], [3.2, -2.6, 1], [3.6, 2], [4.4, 6, 1], [3, 7.6, 1], [-3, 7.6, 1], [-4.4, 6, 1], [-3.6, 2]]) + linie([[0, -2.4], [0, 7.4]], KF, 1.1);
  s += el(-2.2, 10.4, 1.5, 1) + el(2.2, 10.4, 1.5, 1);
  return s;
}
function frosch() {
  const SK = lage(500, 118, 5);
  const halb = () => {
    let s = '';
    // Hinterbein: Oberschenkel, Unterschenkel (Schien- und Wadenbein verwachsen), zwei lange Fußwurzelknochen, Fuß
    s += knochen(V.roehre, 488, 412, 362, 478, 5) + knochen(V.roehre, 362, 486, 410, 618, 5.2) + linie([[366, 496], [406, 608]], KF);
    s += knochen(V.roehre, 414, 626, 370, 696, 2.5) + knochen(V.roehre, 405, 622, 360, 690, 2.5) + el(364, 704, 7, 5) + el(354, 706, 5, 4.5);
    [[402, 800, 2], [386, 836, 2], [358, 862, 3], [320, 874, 4], [290, 828, 3]].forEach(([x, y, n]) => { const x0 = 360, y0 = 712, pts = [[x0 + (x - x0) * 0.02, y0 + (y - y0) * 0.02]];
      const tm = 0.4; pts.push([x0 + (x - x0) * tm, y0 + (y - y0) * tm]); for (let k = 1; k <= n; k++) { const t = tm + (1 - tm) * k / n; pts.push([x0 + (x - x0) * t, y0 + (y - y0) * t]); } s += finger(pts, 2.6); });
    // Schultergürtel und Vorderbein
    s += band([[478, 192], [458, 188], [440, 192]], 9, 9, { knorpel: true, ohneGlanz: true }) + flaeche([[470, 196], [450, 192], [436, 196], [430, 208], [446, 212], [468, 208]]) + band([[438, 204], [414, 208]], 9, 7);
    s += knochen(V.roehre, 412, 210, 368, 246, 4) + knochen(V.roehre, 366, 244, 352, 198, 3.6) + linie([[364, 236], [354, 204]], KF);
    s += el(350, 191, 5, 4) + el(342, 193, 4, 4) + el(358, 191, 4, 4);
    [[370, 146, 2], [356, 124, 2], [338, 128, 3], [322, 150, 3]].forEach(([x, y, n]) => { const x0 = 350, y0 = 186, pts = [[x0, y0]], tm = 0.4; pts.push([x0 + (x - x0) * tm, y0 + (y - y0) * tm]); for (let k = 1; k <= n; k++) { const t = tm + (1 - tm) * k / n; pts.push([x0 + (x - x0) * t, y0 + (y - y0) * t]); } s += finger(pts, 2.4); });
    // Querfortsätze der Wirbel, Darmbein
    [40, 52, 50, 38, 34, 32, 30].forEach((q, i) => { const y = 178 + (i + 1) * 13.8; s += band([[496, y], [500 - q * 0.6, y - (i === 0 ? 4 : 0) + i * 0.6], [500 - q, y + (i === 0 ? -8 : i * 1.2)]], 6, 4); });
    s += band([[494, 290], [476, 293], [458, 297]], 9, 13) + band([[462, 296], [466, 330], [476, 370], [488, 404]], 9, 12);
    return s;
  };
  let s = DEFS + beide(halb, 1000);
  for (let i = 0; i < 8; i++) { const y = 178 + i * 13.8; s += `<rect x="489" y="${f(y - 6)}" width="22" height="12" rx="4" ${fuell('R', 1.3)}/>` + linie([[500, y - 5], [500, y + 5]], KF, 1); }
  s += `<rect x="487" y="284" width="26" height="13" rx="4" ${fuell('R', 1.3)}/>`;
  s += band([[500, 300], [500, 350], [500, 402]], 11, 5) + linie([[500, 304], [500, 396]], KF, 1.1); // Steißbein (Urostyl)
  s += el(500, 412, 17, 11) + lochEl(488, 410, 3.5, 3.5) + lochEl(512, 410, 3.5, 3.5);
  s += SK.g(schaedelFrosch());
  return s;
}

// =====================================================================
// FISCH (Barsch, von der Seite, Kopf rechts)
// =====================================================================
function schaedelFisch() { // Einheiten: Kopflänge = 100, Ursprung: Hinterrand des Kiemendeckels
  let s = flaeche([[100, -3], [97, -9], [89, -18], [77, -27], [61, -35], [41, -42], [21, -46], [6, -48], [3, -36], [14, -30], [30, -28], [46, -27], [56, -26], [62, -26], [78, -24], [88, -14], [94, -6]]); // Hirnschädel
  s += flaeche([[58, -22], [62, -8], [70, 0], [68, 8], [62, 14], [54, 18], [48, 14], [46, -4], [48, -18]], { fern: true }); // Kieferstiel (Wange)
  s += loch([[61, -16], [64, -24], [72, -27.5], [80, -24], [83, -16], [80, -8], [72, -5], [64, -8]]); // Augenhöhle
  s += band([[82, -1], [74, -2.5], [66, -4], [60, -9], [58.5, -17], [61, -25]], 4.5, 3.4) + flaeche([[84, -6], [92, -6], [95, -2], [90, 2], [82, 2], [80, -3]]); // Unteraugenknochen, Tränenbein
  s += flaeche([[62, 6], [70, 5], [68, 14], [62, 14]]); // Quadratbein (Kiefergelenk)
  for (let i = 0; i < 6; i++) s += kegel(97 - i * 2.8, 2.2 + i * .25, 1.1, 1.4, true) + kegel(96.5 - i * 2.9, 2.4 + i * .3, 1.1, 1.4, false);
  s += flaeche([[99.5, 1, 1], [99, 5], [94, 9], [84, 13], [74, 16], [66, 16], [64, 13], [70, 9], [76, 6], [86, 4], [94, 2.5]]); // Unterkiefer
  s += flaeche([[96, -7], [90, -4], [80, -1], [72, 1], [68, 3], [69, 6], [74, 5.5], [84, 2], [94, -2.5]]) + flaeche([[100.5, -1.5, 1], [98, -8], [95.5, -9.5], [95.5, -5], [91, -.5], [83, 2.6], [82, 1.2], [90, -2], [96, -3]]); // Oberkiefer, Zwischenkiefer
  s += [[58, 33, 36, 38], [56, 34, 32, 41], [53, 34.5, 28, 44], [50, 35, 24, 46], [46, 35, 20, 47], [42, 34, 16, 46]].map(([a, b, c, d]) => band([[a, b], [(a + c) / 2, (b + d) / 2 + 2], [c, d]], 1.6, 1.1)).join(''); // Kiemenhautstrahlen
  s += flaeche([[66, 30], [48, 26], [42, 30], [54, 34], [68, 33]]) + flaeche([[46, 12], [32, 14], [16, 12], [6, 9], [4, 14], [14, 20], [30, 22], [44, 20]]); // Zwischen-, Unterkiemendeckel
  s += flaeche([[47, -31], [32, -33], [18, -30], [8, -22], [2, -12], [-4, -7, 1], [3, -4], [8, 4], [18, 10], [34, 12], [46, 10], [46, -10]]) + linie([[42, -26], [24, -18], [8, -10]], KF); // Kiemendeckel mit Dorn
  s += band([[52, -30], [49, -14], [47, 4], [46, 17], [50, 25.5], [58, 28.5], [65, 29]], 6.5, 5.5); // Vorkiemendeckel
  for (let i = 0; i < 7; i++) { const [x, y] = i < 5 ? [43.4 - i * .3, -6 + i * 6] : [48 + (i - 5) * 6, 31.5]; s += band([[x + (i < 5 ? 1 : 0), y], [x - (i < 5 ? 2.4 : 0), y + (i < 5 ? 1.2 : 2.4)]], 1.3, .5); } // Zähnchen am Vorkiemendeckel
  return s;
}
// dünner Knochen (Gräte, Flossenstrahl): Kontur und helle Füllung als zwei Linien
const grat = (pts, w, hell) => `<path d="${glatt(pts, false)}" fill="none" stroke="${hell ? '#b9aa90' : '#8e7c60'}" stroke-width="${f(w + 1.4)}" stroke-linecap="round"/><path d="${glatt(pts, false)}" fill="none" stroke="${hell ? '#f7f2e8' : '#f1e8d4'}" stroke-width="${f(w)}" stroke-linecap="round"/>`;
function fisch() {
  const KP = lage(873, 322, 1.77);
  const ob = [[1050, 318], [1000, 292], [940, 262], [890, 244], [840, 232], [780, 230], [720, 236], [660, 248], [600, 264], [540, 284], [490, 298], [470, 300]], un = [[1050, 330], [1010, 352], [960, 380], [900, 402], [840, 412], [780, 414], [720, 408], [660, 396], [600, 378], [540, 358], [490, 346], [470, 344]];
  const prof = L => x => { for (let i = 1; i < L.length; i++) if (x >= L[i][0]) { const [x0, y0] = L[i - 1], [x1, y1] = L[i], t = (x - x0) / (x1 - x0); return y0 + (y1 - y0) * t; } return L[L.length - 1][1]; };
  const oben = prof(ob), unten = prof(un);
  let s = DEFS + `<path d="${glatt([...ob, [300, 222], [330, 322], [300, 422], ...un.slice().reverse()])}" fill="#f4f7fa" fill-opacity=".6" stroke="#a9b6c4" stroke-width="1.8" stroke-dasharray="7 6"/>`;
  const flosse = (strahlen, haut, stachel) => `<path d="${glatt(haut)}" fill="#e3ebf2" fill-opacity=".9" stroke="#a9b6c4" stroke-width="1.3"/>` + strahlen.map(([a, b]) => grat([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - (stachel ? 0 : 1)], b], stachel ? 2 : 1.1, !stachel)).join('');
  const r1 = [], r2 = [], af = [], sw = [], br = [], ba = [], tr = [];
  for (let i = 0; i < 14; i++) { const x = 852 - i * 11.5, h = [40, 58, 66, 66, 62, 56, 50, 44, 38, 33, 28, 24, 22, 26][i]; r1.push([[x, oben(x) + 2], [x - h * 0.42, oben(x) + 2 - h]]); tr.push(x); }
  for (let i = 0; i < 14; i++) { const x = 690 - i * 9.4, h = [26, 40, 48, 50, 50, 48, 46, 43, 40, 37, 34, 31, 28, 25][i]; r2.push([[x, oben(x) + 2], [x - h * 0.5, oben(x) + 2 - h]]); tr.push(x); }
  for (let i = 0; i < 10; i++) { const x = 640 - i * 8.5, h = [24, 34, 42, 44, 42, 40, 37, 34, 31, 28][i]; af.push([[x, unten(x) - 2], [x - h * 0.55, unten(x) - 2 + h]]); }
  for (let k = 0; k <= 16; k++) { const t = k / 16, by = 302 + t * 40, ey = t < 0.5 ? 222 + t * 2 * 92 : 322 + (t - 0.5) * 2 * 100, ex = t < 0.5 ? 300 + 30 * t * 2 : 330 - 30 * (t - 0.5) * 2; sw.push([[478, by], [ex + 8, ey]]); }
  for (let i = 0; i < 12; i++) br.push([[868, 348 + i * 0.6], [800 + i * 2.6, 336 + i * 5.4]]);
  for (let i = 0; i < 6; i++) ba.push([[858, 408], [794 + i * 4, 418 + i * 5]]);
  const haut = (a, x0, y0, x1, y1) => [[x0, y0], ...a.map(([, b]) => b), [x1, y1]];
  s += flosse(sw, [[478, 300], ...sw.map(([, b]) => b), [478, 344]]);
  s += flosse(r1, haut(r1, 856, oben(856) + 3, 700, oben(700) + 3), true) + flosse(r2, haut(r2, 692, oben(692) + 3, 566, oben(566) + 3));
  s += flosse(af, haut(af, 642, unten(642) - 3, 560, unten(560) - 3));
  s += flosse(ba, [[860, 406], ...ba.map(([, b]) => b), [850, 412]]);
  // Flossenträger, Wirbelsäule, Dornfortsätze, Rippen (Gräten)
  for (const x of tr) s += grat([[x, oben(x) + 3], [x + 4, oben(x) + 30]], 1.4, true);
  const lin = [[882, 288], [820, 300], [740, 308], [640, 314], [540, 320], [478, 322]], wl = verteile(lin, 40, (i, t) => ({ l: 12 - t * 3, h: 12 - t * 4, bogen: false }));
  wl.forEach((w, i) => { s += grat([[w.x, w.y - 4], [w.x - 8, (w.y + oben(w.x)) / 2], [w.x - 16, oben(w.x) + 14]], 1.6);
    if (i >= 2 && i < 21) s += grat([[w.x, w.y + 4], [w.x - 6, w.y + 34], [w.x - 18, unten(w.x) - 30], [w.x - 26, unten(w.x) - 12]], 1.6);
    else if (i >= 21) s += grat([[w.x, w.y + 4], [w.x - 8, (w.y + unten(w.x)) / 2], [w.x - 16, unten(w.x) - 12]], 1.6); });
  s += wirbelReihe(wl);
  s += flaeche([[478, 300], [470, 304], [468, 340], [478, 344], [486, 330], [486, 312]]); // Schwanzflossenträger (Hypurale)
  s += band([[886, 266], [880, 300], [878, 340], [884, 380], [892, 404]], 7, 5) + band([[874, 360], [860, 380], [850, 398]], 3, 2); // Schultergürtel
  s += KP.g(schaedelFisch());
  s += flosse(br, [[868, 346], ...br.map(([, b]) => b), [866, 352]]); // Brustflosse direkt hinter dem Kiemendeckel
  return s;
}

const SM = lage(470, 330, 2.35), SV2 = lage(390, 320, 6.6), SF = lage(500, 300, 18), SFi = lage(300, 250, 4.4);
BILD.sch_mensch = { titel: 'Schädel des Menschen', W: 1000, H: 640, unter: 'Schädel des Menschen von der Seite (Schema)', zeichne: () => DEFS + SM.g(schaedelMenschSeite()),
  pts: mm(SM, [['Hirnschädel', -30, -80, 'l', 120, 'umschließt und schützt das Gehirn; aus mehreren Knochen, die an Nähten fest verwachsen sind'],
    ['Kiefergelenk', 12, 8, 'l', 300, 'Gelenk des Unterkiefers vor dem Ohr – zum Kauen und Sprechen'],
    ['Backenzähne', 70, 45.5, 'l', 400, 'breit mit Höckern – zermahlen die Nahrung'],
    ['Unterkiefer', 40, 76, 'l', 480, 'einziger beweglicher Schädelknochen'],
    ['Augenhöhle', 84, -26, 'r', 150, 'schützt das Auge'],
    ['Jochbein', 78, 2, 'r', 230, 'Wangenknochen'],
    ['Nasenöffnung', 104, 4, 'r', 300, 'Öffnung der Nasenhöhle'],
    ['Oberkiefer', 92, 32, 'r', 380, 'trägt die oberen Zähne'],
    ['Schneidezähne', 109, 47, 'r', 450, 'meißelförmig – beißen ab'],
    ['Eckzahn', 100.5, 48, 'r', 530, 'spitz – hält fest und reißt ab']]) };
const TV = (x, y) => [-110 + 1.12 * x, -50 + 1.12 * y], SVk = lageAn([842, 208], [-14, -4], 1.65, 6);
BILD.sk_vogel = { titel: 'Skelett des Vogels', W: 1300, H: 720, unter: 'Skelett einer Taube von der Seite (Schema, Flügel angehoben) · hellere Beine: andere Körperseite', zeichne: () => vogel(),
  pts: [['Handknochen', 626, 188, 'l', 100, 'zum Teil miteinander verwachsen – tragen die Handschwingen'],
    ['Elle und Speiche', 716, 220, 'l', 170, 'Unterarmknochen; an der Elle sitzen die Armschwingen'],
    ['Oberarmknochen', 788, 288, 'l', 250, 'hohl und leicht (mit Luft gefüllt)'],
    ['Becken', 690, 375, 'l', 330, 'mit den Wirbeln zu einer festen Platte verwachsen'],
    ['Oberschenkelknochen', 691, 426, 'l', 405, 'kurz und schräg nach vorn – liegt im Körper'],
    ['Schwanzwirbel', 558, 436, 'l', 490, 'kurz; der letzte Knochen trägt die Schwanzfedern'],
    ['Unterschenkelknochen', 685, 507, 'l', 560, 'langer Knochen; das „Knie“ zeigt beim Vogel nach vorn'],
    ['Laufknochen', 663, 600, 'l', 630, 'verwachsene Fußknochen; der Vogel steht auf den Zehen'],
    ['Schädel', ...SVk.p(-4, -20), 'r', 80, 'leicht, mit sehr großen Augenhöhlen'],
    ['Schnabel', ...SVk.p(38, -4), 'r', 150, 'aus Horn, ohne Zähne – leicht'],
    ['Halswirbel', 818, 268, 'r', 230, 'viele Halswirbel – der Hals ist sehr beweglich'],
    ['Gabelbein', 825, 389, 'r', 310, 'die beiden Schlüsselbeine, zu einer Gabel verwachsen; federt beim Flügelschlag'],
    ['Rippen', 756, 410, 'r', 390, 'mit Hakenfortsätzen; machen den Brustkorb stabil'],
    ['Brustbein mit Kiel', 782, 506, 'r', 470, 'großer Kamm (Kiel): Ansatz der kräftigen Flugmuskeln'],
    ['Zehen', 726, 647, 'r', 620, 'drei Zehen nach vorn, eine nach hinten – zum Greifen von Ästen']].map(([n, x, y, ...r]) => [n, ...TV(x, y), ...r]) };
BILD.sch_vogel = { titel: 'Schädel des Vogels', W: 1000, H: 560, unter: 'Schädel einer Taube von der Seite (Schema)', zeichne: () => DEFS + SV2.g(schaedelVogel()),
  pts: mm(SV2, [['Hirnschädel', -8, -18, 'l', 150, 'dünne, leichte Knochen – rund um das Gehirn'],
    ['Kiefergelenk', 0, 1, 'l', 330, 'über das Quadratbein beweglich – auch der Oberschnabel kann sich etwas heben'],
    ['Augenhöhle', 10, -17, 'r', 150, 'riesig, mit einem Knochenring im Auge – Vögel sehen sehr gut'],
    ['Nasenloch', 27, -9, 'r', 220, 'schlitzförmige Öffnung am Schnabelgrund'],
    ['Oberschnabel', 38, -4, 'r', 290, 'mit Horn überzogen, ohne Zähne – leicht'],
    ['Unterschnabel', 36, 5, 'r', 360, 'Vögel haben keine Zähne; die Nahrung wird ganz geschluckt']]) };
const SKf = lage(500, 118, 5), RS = (x, y) => [1000 - x, y];
BILD.sk_frosch = { titel: 'Skelett des Froschs', W: 1000, H: 950, unter: 'Skelett eines Froschs von oben (Schema) · Frösche haben keine Rippen · hellblau: Knorpel', zeichne: frosch,
  pts: [['Augenhöhle', ...SKf.p(-8, -1), 'l', 60, 'sehr groß – die Augen liegen hoch oben am Kopf'],
    ['Schädel', ...SKf.p(-2, 3), 'l', 135, 'breit und flach, mit großen Öffnungen – leicht'],
    ['Handknochen', 353, 152, 'l', 210, 'vier Finger'],
    ['Unterarmknochen', 359, 221, 'l', 285, 'Elle und Speiche zu einem Knochen verwachsen'],
    ['Oberarmknochen', 390, 228, 'l', 360, 'kurz und kräftig – fängt den Aufprall nach dem Sprung ab'],
    ['Schulterblatt', 452, 200, 'l', 435, 'verbindet das Vorderbein mit dem Rumpf; der obere Teil ist Knorpel'],
    ['Wirbelsäule', 500, 233, 'r', 180, 'kurz, nur neun Wirbel; Frösche haben keine Rippen'],
    ['Becken', ...RS(469, 345), 'r', 300, 'lange Darmbeine – übertragen die Sprungkraft auf den Körper'],
    ['Steißbein', 500, 380, 'r', 390, 'langer Knochenstab aus verwachsenen Schwanzwirbeln (Urostyl)'],
    ['Oberschenkelknochen', ...RS(424, 445), 'r', 470, 'lang und kräftig – Sprungbein'],
    ['Unterschenkelknochen', ...RS(386, 552), 'r', 570, 'Schienbein und Wadenbein zu einem Knochen verwachsen'],
    ['Fußwurzelknochen', ...RS(392, 658), 'r', 670, 'stark verlängert – macht das Bein länger für weite Sprünge'],
    ['Zehenknochen', ...RS(352, 800), 'r', 790, 'fünf lange Zehen mit Schwimmhäuten']] };
BILD.sch_frosch = { titel: 'Schädel des Froschs', W: 1000, H: 560, unter: 'Schädel eines Froschs von oben (Schema)', zeichne: () => DEFS + SF.g(schaedelFrosch()),
  pts: mm(SF, [['Augenhöhle', -8, -1, 'l', 230, 'riesige Öffnungen – die Augen ragen nach oben heraus'],
    ['Oberkiefer', -13.6, 2, 'l', 320, 'schmaler Knochenbogen am Rand; mit sehr kleinen Zähnen'],
    ['Kiefergelenk', -12.8, 8.6, 'l', 420, 'weit hinten – das Maul ist sehr breit'],
    ['Nasenloch', 4.6, -11.6, 'r', 100, 'liegt vorn oben – der Frosch atmet auch halb untergetaucht'],
    ['Hirnkapsel', 2, 2, 'r', 260, 'schmaler Knochen zwischen den Augen um das kleine Gehirn']]) };
const KPf = lage(873, 322, 1.77);
BILD.sk_fisch = { titel: 'Skelett des Fischs', W: 1300, H: 640, unter: 'Skelett eines Barschs von der Seite (Schema) · gestrichelt: Körperumriss', zeichne: fisch,
  pts: [['Rückenflosse', 772, 205, 'l', 100, 'stabilisiert den Fisch – er kippt nicht um'],
    ['Flossenstrahlen', 622, 232, 'l', 180, 'dünne Knochenstäbe; spannen die Flossenhaut auf'],
    ['Schwanzflosse', 370, 300, 'l', 260, 'treibt den Fisch an (Antrieb)'],
    ['Wirbelsäule', 620, 315, 'l', 340, 'aus vielen Wirbeln; macht den Körper biegsam'],
    ['Rippen (Gräten)', 742, 370, 'l', 420, 'dünne Knochen; umschließen die Bauchhöhle'],
    ['Afterflosse', 595, 400, 'l', 500, 'hilft beim Steuern und stabilisiert'],
    ['Schädel', ...KPf.p(30, -36), 'r', 120, 'schützt das Gehirn'],
    ['Kiemendeckel', ...KPf.p(22, -8), 'r', 200, 'Knochenplatte; schützt die Kiemen'],
    ['Augenhöhle', ...KPf.p(72, -16), 'r', 280, 'Öffnung im Schädel für das Auge'],
    ['Unterkiefer', ...KPf.p(86, 10), 'r', 360, 'beweglicher Kiefer; das Maul öffnet sich nach vorn'],
    ['Brustflosse', 835, 360, 'r', 440, 'zum Steuern, Bremsen und Stillstehen'],
    ['Bauchflosse', 832, 420, 'r', 520, 'hilft beim Steuern und Halten der Lage']] };
BILD.sch_fisch = { titel: 'Schädel des Fischs', W: 1000, H: 520, unter: 'Kopfskelett eines Barschs von der Seite (Schema)', zeichne: () => DEFS + SFi.g(schaedelFisch()),
  pts: mm(SFi, [['Hirnschädel', 30, -37, 'l', 100, 'schützt das Gehirn'],
    ['Kiemendeckel', 22, -8, 'l', 200, 'Knochenplatte; schützt die Kiemen und hilft beim Atmen (Wasser hinauspumpen)'],
    ['Vorkiemendeckel', 48, 0, 'l', 300, 'gebogene Knochenspange vor dem Kiemendeckel, mit kleinen Zähnchen'],
    ['Augenhöhle', 72, -16, 'r', 130, 'große Öffnung für das Auge'],
    ['Oberkiefer', 82, 1, 'r', 210, 'mit vielen kleinen, spitzen Zähnen'],
    ['Unterkiefer', 86, 10, 'r', 290, 'beweglich – das Maul kann sich weit öffnen'],
    ['Kiefergelenk', 65, 11, 'r', 370, 'Gelenk zwischen Unterkiefer und Schädel']]) };


// ---------- als Bausteine anmelden (Kennungen bleiben: bio_sk_* / bio_sch_*) ----------
T.SKELETT_BILDER = [['mensch', 'Mensch'], ['hund', 'Hund'], ['katze', 'Katze'], ['vogel', 'Vogel'], ['frosch', 'Frosch'], ['fisch', 'Fisch']];
for (const [id] of T.SKELETT_BILDER) for (const art of ['sk', 'sch']) {
  const key = art + '_' + id;
  B['bio_' + key] = { name: BILD[key].titel + ' (beschriften)', gruppe: 'NaWi', def: { beschr: 'leer', legende: 'aus' }, felder: F_BESCHR, gen: d => bildGen(key, d) };
}
})();