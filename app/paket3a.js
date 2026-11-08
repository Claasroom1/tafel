// Tafel-App – Paket 3a: Beschriften auf eigenen Bildern (T.beschriftenStart) und Mathe-Bausteine
// „Würfelnetz“ (T.BAUSTEINE.wuerfelnetz) und „Würfelgebäude“ (T.BAUSTEINE.wuerfelgebaeude).
// Eigenständig: braucht nur kern.js, bausteine.js und uebungen.js (Kärtchen ukarte/uziel/uknopf, Einrasten, Prüfen).
'use strict';
(function () {
if (!T.BAUSTEINE || !T._svg) return;
const B = T.BAUSTEINE, CM = T.CM, { doc, ln, tx, rc, f } = T._svg;
const mess = (t, fs, fett) => { const c = T._mctx || (T._mctx = document.createElement('canvas').getContext('2d')); c.font = `${fett ? 700 : 400} ${fs}px Segoe UI`; return c.measureText(String(t)).width; };
const mische = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// =====================================================================
// Würfelnetze: die 11 Netze und typische Nicht-Netze (Zellen [x, y]); Prüfung durch Abrollen eines Würfels
// =====================================================================
const NETZE = [
  /* 1-4-1 */ [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  /* 2-3-1 */ [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]],
  /* 2-2-2 */ [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
  /* 3-3 */ [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]]
];
const KEINE = {
  k1: ['Fünferreihe', [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 0]]],
  k2: ['2 × 3-Block', [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]],
  k3: ['U-Form', [[0, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]]],
  k4: ['Viererreihe, zwei Flächen oben', [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1]]],
  k5: ['L-Form', [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2]]],
  k6: ['mit 2 × 2-Block', [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1], [3, 1]]]
};
// Würfel über das Netz abrollen: Zustand = welche Würfelfläche unten/oben/hinten/vorne/rechts/links liegt.
// Gegenflächen: 0–1, 2–3, 4–5. Ergebnis: Flächennummer je Zelle oder null (kein Netz).
const ROLL = {
  '1,0': s => ({ u: s.r, o: s.l, h: s.h, v: s.v, r: s.o, l: s.u }), '-1,0': s => ({ u: s.l, o: s.r, h: s.h, v: s.v, r: s.u, l: s.o }),
  '0,1': s => ({ u: s.v, o: s.h, h: s.u, v: s.o, r: s.r, l: s.l }), '0,-1': s => ({ u: s.h, o: s.v, h: s.o, v: s.u, r: s.r, l: s.l })
};
function falten(zellen) {
  if (!zellen || zellen.length !== 6) return null;
  const key = c => c[0] + ',' + c[1], set = new Map(zellen.map((c, i) => [key(c), i]));
  for (const [x, y] of zellen) if (set.has(key([x + 1, y])) && set.has(key([x, y + 1])) && set.has(key([x + 1, y + 1]))) return null; /* 2×2-Block faltet nie */
  const st = new Array(6).fill(null); st[0] = { u: 0, o: 1, h: 2, v: 3, r: 4, l: 5 };
  const stapel = [0];
  while (stapel.length) {
    const i = stapel.pop(), [x, y] = zellen[i];
    for (const dir of Object.keys(ROLL)) {
      const [dx, dy] = dir.split(',').map(Number), j = set.get(key([x + dx, y + dy])); if (j == null) continue;
      const n = ROLL[dir](st[i]);
      if (st[j] == null) { st[j] = n; stapel.push(j); } else if (st[j].u !== n.u) return null;
    }
  }
  if (st.some(s => s == null)) return null;
  const fl = st.map(s => s.u);
  return new Set(fl).size === 6 ? fl : null;
}
T.wuerfelFalten = falten; /* für Tests */
T.WUERFELNETZE = { NETZE, KEINE };
const GEGEN = ['#fecaca', '#bfdbfe', '#bbf7d0'], GEGEN_RAND = ['#dc2626', '#2563eb', '#16a34a'];
const zahl1 = v => T.zahl ? T.zahl(Math.round(v * 10) / 10, 1) : String(Math.round(v * 10) / 10).replace('.', ',');
const cm = v => zahl1(v) + ' cm';

// ---------- Faltbaum für Netze aus Rechtecken (Würfel, Quader): jede Fläche klappt um ihre Kante zur Elternfläche um 90° nach oben ----------
const rnd = v => Math.round(v * 1000) / 1000;
const kKey = (p, q) => { const a = rnd(p[0]) + ',' + rnd(p[1]) + ',' + rnd(p[2] || 0), b = rnd(q[0]) + ',' + rnd(q[1]) + ',' + rnd(q[2] || 0); return a < b ? a + '|' + b : b + '|' + a; };
const mitte2 = p => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
function faltBaum(faces, root) {
  const kanten = new Map();
  faces.forEach((F, i) => F.p.forEach((p, j) => { const k = kKey(p, F.p[(j + 1) % F.p.length]); if (!kanten.has(k)) kanten.set(k, []); kanten.get(k).push([i, j]); }));
  const nb = faces.map(() => []), rand = [];
  for (const L of kanten.values()) {
    if (L.length === 2) { const [i, j] = L[0], i2 = L[1][0], p = faces[i].p[j], q = faces[i].p[(j + 1) % faces[i].p.length]; nb[i].push([i2, p, q]); nb[i2].push([i, p, q]); }
    else L.forEach(x => rand.push(x));
  }
  const gel = faces.map(() => null), da = new Set([root]), sch = [root];
  while (sch.length) {
    const i = sch.shift();
    for (const [j, p, q] of nb[i]) {
      if (da.has(j)) continue; da.add(j); sch.push(j);
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]); let u = [(q[0] - p[0]) / L, (q[1] - p[1]) / L, 0];
      const m = mitte2(faces[j].p), dd = [m[0] - p[0], m[1] - p[1]];
      if (u[0] * dd[1] - u[1] * dd[0] < 0) u = u.map(v => -v);
      gel[j] = { von: i, c: [p[0], p[1], 0], u, w: faces[j].w || Math.PI / 2 }; /* w: Knickwinkel bei t = 1 (Würfel/Quader 90°) */
    }
  }
  const kette = faces.map((_, i) => { const k = []; let x = i; while (gel[x]) { k.push(gel[x]); x = gel[x].von; } return k; });
  return { gel, kette, rand, ok: da.size === faces.length };
}
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function drehe(v, h, th, richtung) {
  const w = richtung ? v : [v[0] - h.c[0], v[1] - h.c[1], v[2] - h.c[2]], co = Math.cos(th), si = Math.sin(th), u = h.u, uw = u[0] * w[0] + u[1] * w[1] + u[2] * w[2], x = kreuz(u, w);
  const r = [0, 1, 2].map(i => w[i] * co + x[i] * si + u[i] * uw * (1 - co));
  return richtung ? r : [r[0] + h.c[0], r[1] + h.c[1], r[2] + h.c[2]];
}
const punkt3 = (baum, i, q, t) => baum.kette[i].reduce((v, h) => drehe(v, h, t * h.w), [q[0], q[1], 0]);
// Klebelaschen automatisch: Randkanten, die im gefalteten Körper zusammenfallen, bilden ein Paar – Lasche an die erste
function autoLaschen(faces, baum) {
  const paare = new Map();
  const grob = v => v.map(x => Math.round(x * 50) / 50);
  baum.rand.forEach(([i, j]) => { const F = faces[i], k = kKey(grob(punkt3(baum, i, F.p[j], 1)), grob(punkt3(baum, i, F.p[(j + 1) % F.p.length], 1))); if (!paare.has(k)) paare.set(k, []); paare.get(k).push([i, j]); });
  const out = []; for (const L of paare.values()) if (L.length === 2) { const [i, j] = L[0], F = faces[i]; out.push([F.p[j], F.p[(j + 1) % F.p.length], mitte2(F.p)]); }
  return out;
}
T.faltBaum = faltBaum; T.autoLaschen = autoLaschen; /* für Tests */

// ---------- Netze zeichnen (Maße in cm): Flächen, Kreise, Kreisausschnitte, Laschen, Zähne, Maße ----------
function lasche(p1, p2, innen, tief) {
  const L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), u = [(p2[0] - p1[0]) / L, (p2[1] - p1[1]) / L]; let n = [-u[1], u[0]];
  const m = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]; if ((innen[0] - m[0]) * n[0] + (innen[1] - m[1]) * n[1] > 0) n = [-n[0], -n[1]];
  const dd = Math.min(tief, L * 0.35), ins = Math.min(dd, L * 0.3);
  return [p1, p2, [p2[0] + n[0] * dd - u[0] * ins, p2[1] + n[1] * dd - u[1] * ins], [p1[0] + n[0] * dd + u[0] * ins, p1[1] + n[1] * dd + u[1] * ins]];
}
function zeichneNetz(N, d, P) {
  const tabs = d.laschen ? (N.laschen || []).map(([a, b, c]) => lasche(a, b, c, 0.55)).concat((N.zaehne || []).map(([a, b, c]) => lasche(a, b, c, 0.35))
    .filter(q => !(N.kreise || []).some(k => q.some(p => Math.hypot(p[0] - k.c[0], p[1] - k.c[1]) < k.r + 0.06)))) : [];
  const pts = [];
  (N.polys || []).forEach(F => pts.push(...F.p)); tabs.forEach(q => pts.push(...q));
  (N.kreise || []).forEach(k => pts.push([k.c[0] - k.r, k.c[1] - k.r], [k.c[0] + k.r, k.c[1] + k.r]));
  (N.sektoren || []).forEach(S => { pts.push(S.c); for (let i = 0; i <= 48; i++) { const w = S.a0 + (S.a1 - S.a0) * i / 48; pts.push([S.c[0] + S.R * Math.cos(w), S.c[1] + S.R * Math.sin(w)]); } });
  const x0 = Math.min(...pts.map(p => p[0])), y0 = Math.min(...pts.map(p => p[1])), x1 = Math.max(...pts.map(p => p[0])), y1 = Math.max(...pts.map(p => p[1]));
  const m = 10, X = v => m + (v - x0) * CM, Y = v => m + (v - y0) * CM, W = (x1 - x0) * CM + 2 * m, H = (y1 - y0) * CM + 2 * m;
  const poly = (p, fill, st, sw) => `<polygon points="${p.map(q => f(X(q[0])) + ',' + f(Y(q[1]))).join(' ')}" fill="${fill}" stroke="${st}" stroke-width="${sw || 2.5}" stroke-linejoin="round"/>`;
  const farbe = g => d.gegen && g != null && g >= 0 ? GEGEN[g % 3] : P.papier;
  let s = tabs.map(q => poly(q, P.soft, P.ink, 1.5)).join('');
  (N.sektoren || []).forEach(S => { const a = [S.c[0] + S.R * Math.cos(S.a0), S.c[1] + S.R * Math.sin(S.a0)], b = [S.c[0] + S.R * Math.cos(S.a1), S.c[1] + S.R * Math.sin(S.a1)];
    s += `<path d="M${f(X(S.c[0]))} ${f(Y(S.c[1]))} L${f(X(a[0]))} ${f(Y(a[1]))} A${f(S.R * CM)} ${f(S.R * CM)} 0 ${S.a1 - S.a0 > Math.PI ? 1 : 0} 1 ${f(X(b[0]))} ${f(Y(b[1]))} Z" fill="${farbe(S.g)}" stroke="${P.ink}" stroke-width="2.5" stroke-linejoin="round"/>`; });
  (N.polys || []).forEach(F => { s += poly(F.p, farbe(F.g), P.ink); });
  (N.kreise || []).forEach(k => { s += `<circle cx="${f(X(k.c[0]))}" cy="${f(Y(k.c[1]))}" r="${f(k.r * CM)}" fill="${farbe(k.g)}" stroke="${P.ink}" stroke-width="2.5"/>`; });
  if (d.masse) {
    const fs = Math.max(13, Math.min(18, 0.42 * CM));
    (N.hilfs || []).forEach(([a, b]) => { s += ln(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), P.acc, 2, 'stroke-dasharray="6 5"'); });
    (N.masse || []).forEach(([x, y, t, rot]) => { s += tx(X(x), Y(y), t, P.acc, fs, 'middle', 'font-weight="600"' + (rot ? ` transform="rotate(${rot} ${f(X(x))} ${f(Y(y))})"` : '')); });
  }
  return { svg: doc(W, H, s), w: W, h: H };
}
const Rk = (x, y, w, h, name, g) => ({ p: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], name, g });
// Quadernetz: a = Länge, b = Breite, c = Höhe; drei Netzformen; Gegenflächen: hinten/vorne 0, Boden/Deckel 1, links/rechts 2
function quaderNetz(a, b, c, form) {
  let F;
  if (+form === 3) F = [Rk(0, b, b, c, 'links', 2), Rk(b, b, a, c, 'vorne', 0), Rk(b + a, b, b, c, 'rechts', 2), Rk(2 * b + a, b, a, c, 'hinten', 0), Rk(b, b + c, a, b, 'Boden', 1), Rk(2 * b + a, 0, a, b, 'Deckel', 1)];
  else {
    const ys = +form === 2 ? 2 * c + b : c;
    F = [Rk(c, 0, a, c, 'hinten', 0), Rk(c, c, a, b, 'Boden', 1), Rk(c, c + b, a, c, 'vorne', 0), Rk(c, 2 * c + b, a, b, 'Deckel', 1), Rk(0, ys, c, b, 'links', 2), Rk(c + a, ys, c, b, 'rechts', 2)];
  }
  return { faces: F, root: F.findIndex(x => x.name === 'Boden') };
}
function wuerfelFlaechen(z, a) {
  const fl = falten(z), F = z.map(([x, y], i) => ({ ...Rk(x * a, y * a, a, a), g: fl ? Math.floor(fl[i] / 2) : -1 }));
  const key = c => c[0] + ',' + c[1], set = new Set(z.map(key)), grad = z.map(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => set.has(key([x + dx, y + dy]))).length);
  return { faces: F, root: grad.indexOf(Math.max(...grad)), ok: !!fl };
}
const masseRk = (F, seite, t) => { const [[x0, y0], , [x1, y1]] = F.p, e = 0.4;
  return seite === 'oben' ? [(x0 + x1) / 2, y0 + e, t] : seite === 'unten' ? [(x0 + x1) / 2, y1 - e, t] : seite === 'links' ? [x0 + e, (y0 + y1) / 2, t, -90] : [x1 - e, (y0 + y1) / 2, t, -90]; };

B.wuerfelnetz = { name: 'Würfelnetz', gruppe: 'Mathe', def: { netz: '1', gegen: false, laschen: false, masse: false, a: 2 },
  felder: [{ k: 'netz', l: 'Netz', typ: 'auswahl', opts: NETZE.map((_, i) => [String(i + 1), 'Würfelnetz ' + (i + 1)]).concat(Object.keys(KEINE).map(k => [k, 'kein Netz: ' + KEINE[k][0]])) },
    { k: 'a', l: 'Kantenlänge (cm)', typ: 'zahl', min: 0.5, max: 8 }, { k: 'gegen', l: 'Gegenflächen gleich färben', typ: 'check' },
    { k: 'laschen', l: 'Klebelaschen', typ: 'check' }, { k: 'masse', l: 'Kantenlänge beschriften', typ: 'check' }],
  gen: (d, P) => {
    const z = KEINE[d.netz] ? KEINE[d.netz][1] : NETZE[T.clamp(Math.round(+d.netz) || 1, 1, 11) - 1], a = T.clamp(+d.a || 2, 0.5, 8);
    const W = wuerfelFlaechen(z, a), baum = faltBaum(W.faces, W.root);
    return zeichneNetz({ polys: W.faces, laschen: W.ok ? autoLaschen(W.faces, baum) : [], masse: [masseRk(W.faces[W.root], 'oben', 'a = ' + cm(a))] }, d, P);
  } };
const q3 = (l, fn) => ({ l, f: d => ({ d: fn({ ...d }) }) });
B.wuerfelnetz.schnell = [q3('▶ Nächstes Netz', d => { const i = KEINE[d.netz] ? 0 : +d.netz || 1; d.netz = String(i % 11 + 1); return d; }), q3('🎨 Gegenflächen ein/aus', d => { d.gegen = !d.gegen; return d; }),
  q3('Klebelaschen ein/aus', d => { d.laschen = !d.laschen; return d; }), q3('Maße ein/aus', d => { d.masse = !d.masse; return d; })];

// ---------- Körpernetze: Quader, Dreiecksprisma, quadratische Pyramide, Tetraeder, Zylinder, Kegel ----------
const KOERPER = [['quader', 'Quader'], ['prisma', 'Dreiecksprisma'], ['pyramide', 'Quadratische Pyramide'], ['tetraeder', 'Tetraeder'], ['zylinder', 'Zylinder'], ['kegel', 'Kegel']];
function koerperNetz(d) {
  const g = (k, lo, hi, std) => T.clamp(+d[k] || std, lo, hi);
  const a = g('a', 0.5, 20, 4), b = g('b', 0.5, 20, 3), c = g('c', 0.5, 20, 2), h = g('h', 0.5, 25, 5), r = g('r', 0.3, 12, 2);
  if (d.koerper === 'prisma') {
    const gs = a, hd = b, l = c, s = Math.hypot(hd, gs / 2);
    const S1 = Rk(0, hd, s, l, 'S1', -1), G = Rk(s, hd, gs, l, 'G', -1), S2 = Rk(s + gs, hd, s, l, 'S2', -1);
    const To = { p: [[s, hd], [s + gs, hd], [s + gs / 2, 0]], g: 0 }, Tu = { p: [[s, hd + l], [s + gs, hd + l], [s + gs / 2, 2 * hd + l]], g: 0 };
    const mo = mitte2(To.p), mu = mitte2(Tu.p);
    return { polys: [S1, G, S2, To, Tu],
      laschen: [[[0, hd], [0, hd + l], mitte2(S1.p)], [[s, hd], [s + gs / 2, 0], mo], [[s + gs, hd], [s + gs / 2, 0], mo], [[s, hd + l], [s + gs / 2, 2 * hd + l], mu], [[s + gs, hd + l], [s + gs / 2, 2 * hd + l], mu]],
      hilfs: [[[s + gs / 2, hd], [s + gs / 2, 0]]],
      masse: [masseRk(G, 'unten', 'g = ' + cm(gs)), masseRk(S1, 'links', 'l = ' + cm(l)), masseRk(S2, 'oben', 's ≈ ' + cm(s)), [s + gs / 2 + 0.25 + Math.min(1.1, gs * 0.25), hd * 0.55, 'h = ' + cm(hd)]] };
  }
  if (d.koerper === 'pyramide') {
    const hs = Math.hypot(h, a / 2), Q = Rk(hs, hs, a, a, 'G', -1), A = hs + a / 2;
    const To = { p: [[hs, hs], [hs + a, hs], [A, 0]] }, Tr = { p: [[hs + a, hs], [hs + a, hs + a], [2 * hs + a, A]] }, Tu = { p: [[hs + a, hs + a], [hs, hs + a], [A, 2 * hs + a]] }, Tl = { p: [[hs, hs + a], [hs, hs], [0, A]] };
    return { polys: [Q, To, Tr, Tu, Tl],
      laschen: [[[hs + a, hs], [A, 0], mitte2(To.p)], [[hs + a, hs + a], [2 * hs + a, A], mitte2(Tr.p)], [[hs, hs + a], [A, 2 * hs + a], mitte2(Tu.p)], [[hs, hs], [0, A], mitte2(Tl.p)]],
      hilfs: [[[A, hs], [A, 0]]], masse: [masseRk(Q, 'unten', 'a = ' + cm(a)), [A + 0.3 + Math.min(1.2, a * 0.28), hs * 0.6, 'hₛ ≈ ' + cm(hs)]] };
  }
  if (d.koerper === 'tetraeder') {
    const H2 = a * Math.sqrt(3), A = [0, H2], Bp = [2 * a, H2], C = [a, 0], mAB = [a, H2], mBC = [1.5 * a, H2 / 2], mCA = [0.5 * a, H2 / 2];
    const M = { p: [mAB, mBC, mCA] }, FA = { p: [A, mAB, mCA] }, FB = { p: [mAB, Bp, mBC] }, FC = { p: [mCA, mBC, C] };
    return { polys: [M, FA, FB, FC], laschen: [[A, mAB, mitte2(FA.p)], [Bp, mBC, mitte2(FB.p)], [C, mCA, mitte2(FC.p)]], masse: [[a / 2, H2 - 0.4, 'a = ' + cm(a)]] };
  }
  if (d.koerper === 'zylinder') {
    const U = 2 * Math.PI * r, R0 = Rk(0, 2 * r, U, h, 'M', -1), n = Math.max(4, Math.round(U / 0.9)), zae = [];
    for (let i = 0; i < n; i++) { const xa = U * i / n, xb = U * (i + 1) / n; zae.push([[xa, 2 * r], [xb, 2 * r], [U / 2, 2 * r + h / 2]], [[xa, 2 * r + h], [xb, 2 * r + h], [U / 2, 2 * r + h / 2]]); }
    return { polys: [R0], kreise: [{ c: [U / 2, r], r, g: 0 }, { c: [U / 2, 3 * r + h], r, g: 0 }], laschen: [[[U, 2 * r], [U, 2 * r + h], [U / 2, 2 * r + h / 2]]], zaehne: zae,
      hilfs: [[[U / 2, r], [U / 2 + r, r]]],
      masse: [[U / 2 + r / 2, r - 0.35, 'r = ' + cm(r)], masseRk(R0, 'links', 'h = ' + cm(h)), [U / 2, 2 * r + Math.min(h / 2, 0.6), 'u = 2 · π · r ≈ ' + cm(U)]] };
  }
  if (d.koerper === 'kegel') {
    const s = Math.hypot(r, h), al = 2 * Math.PI * r / s, a0 = Math.PI / 2 - al / 2, a1 = Math.PI / 2 + al / 2, n = Math.max(4, Math.round(s * al / 0.9)), zae = [];
    const P0 = [s * Math.cos(a0), s * Math.sin(a0)];
    for (let i = 0; i < n; i++) { const w1 = a0 + al * i / n, w2 = a0 + al * (i + 1) / n; zae.push([[s * Math.cos(w1), s * Math.sin(w1)], [s * Math.cos(w2), s * Math.sin(w2)], [0, 0]]); }
    const wm = a0 + Math.min(al * 0.25, 0.5);
    return { sektoren: [{ c: [0, 0], R: s, a0, a1, g: -1 }], kreise: [{ c: [0, s + r], r, g: -1 }], laschen: [[[0, 0], P0, [0, s / 2]]], zaehne: zae,
      hilfs: [[[0, s + r], [r, s + r]]],
      masse: [[r / 2, s + r - 0.35, 'r = ' + cm(r)], [s * 0.55 * Math.cos(wm) + 0.1, s * 0.55 * Math.sin(wm) - 0.3, 's ≈ ' + cm(s), wm * 180 / Math.PI],
        [0, Math.min(s * 0.35, 1.6), 'α ≈ ' + zahl1(al * 180 / Math.PI) + '°']] };
  }
  const Q = quaderNetz(a, b, c, d.form), baum = faltBaum(Q.faces, Q.root), fn = n => Q.faces.find(x => x.name === n);
  return { polys: Q.faces, laschen: autoLaschen(Q.faces, baum), masse: [masseRk(fn('Boden'), 'oben', 'a = ' + cm(a)), masseRk(fn('Boden'), 'rechts', 'b = ' + cm(b)), masseRk(fn('vorne'), 'links', 'c = ' + cm(c))] };
}
B.koerpernetz = { name: 'Körpernetz', gruppe: 'Mathe', def: { koerper: 'quader', form: '1', a: 4, b: 3, c: 2, h: 5, r: 2, laschen: false, masse: false, gegen: false },
  felder: [{ k: 'koerper', l: 'Körper', typ: 'auswahl', opts: KOERPER }, { k: 'form', l: 'Netzform (Quader)', typ: 'auswahl', opts: [['1', 'Form 1: Seiten am Boden'], ['2', 'Form 2: Seiten am Deckel'], ['3', 'Form 3: Seitenstreifen']] },
    { k: 'a', l: 'a (cm) – Quader: Länge · Prisma: Grundseite g des Dreiecks · Pyramide: Grundkante · Tetraeder: Kante', typ: 'zahl', min: 0.5, max: 20 },
    { k: 'b', l: 'b (cm) – Quader: Breite · Prisma: Höhe h des Dreiecks', typ: 'zahl', min: 0.5, max: 20 },
    { k: 'c', l: 'c (cm) – Quader: Höhe · Prisma: Länge l', typ: 'zahl', min: 0.5, max: 20 },
    { k: 'h', l: 'h (cm) – Körperhöhe bei Pyramide, Zylinder, Kegel', typ: 'zahl', min: 0.5, max: 25 }, { k: 'r', l: 'r (cm) – Radius bei Zylinder und Kegel', typ: 'zahl', min: 0.3, max: 12 },
    { k: 'laschen', l: 'Klebelaschen', typ: 'check' }, { k: 'masse', l: 'Maße beschriften', typ: 'check' }, { k: 'gegen', l: 'Gegenflächen gleich färben (Quader, Prisma, Zylinder)', typ: 'check' }],
  gen: (d, P) => zeichneNetz(koerperNetz(d), d, P) };
B.koerpernetz.schnell = [q3('Klebelaschen ein/aus', d => { d.laschen = !d.laschen; return d; }), q3('Maße ein/aus', d => { d.masse = !d.masse; return d; }),
  q3('🎨 Gegenflächen ein/aus', d => { d.gegen = !d.gegen; return d; }), q3('▶ Nächster Körper', d => { const i = KOERPER.findIndex(k => k[0] === d.koerper); d.koerper = KOERPER[(i + 1) % KOERPER.length][0]; return d; }),
  q3('⇄ Quader: andere Netzform', d => { d.form = String((+d.form || 1) % 3 + 1); return d; })];
T.koerperNetz = koerperNetz; /* für Tests */

// ---------- Faltnetz (animiert): alle Körpernetze, t = 0 flach … 1 gefaltet; Schrägbild-Projektion ----------
// Würfel, Quader, Prisma, Pyramide, Tetraeder: Flächen klappen um ihre Kanten (Knickwinkel je Körper).
// Zylinder und Kegel: der Mantel rollt sich auf (Krümmung wächst mit t), die Kreise klappen als Deckel hoch.
const FALT_KOERPER = [['wuerfel', 'Würfel'], ['quader', 'Quader'], ['prisma', 'Dreiecksprisma'], ['pyramide', 'Quadratische Pyramide'], ['tetraeder', 'Tetraeder'], ['zylinder', 'Zylinder'], ['kegel', 'Kegel']];
function faltMasse(d) { const g = (k, lo, hi, std) => T.clamp(+d[k] || std, lo, hi); return { a: g('a', 0.5, 15, 3), b: g('b', 0.5, 15, 2), c: g('c', 0.5, 15, 1.5), h: g('h', 0.5, 15, 4), r: g('r', 0.3, 8, 1.5) }; }
function faltFlaechen(d) {
  const M = faltMasse(d), k = d.koerper;
  if (k === 'quader') return quaderNetz(M.a, M.b, M.c, d.form);
  if (k === 'prisma' || k === 'pyramide' || k === 'tetraeder') {
    const F = koerperNetz({ ...d, ...M }).polys.map(x => ({ ...x }));
    if (k === 'prisma') { const knick = Math.PI - Math.atan2(M.b, M.a / 2); F[0].w = F[2].w = knick; return { faces: F, root: 1 }; } /* Seiten bis zur Dreiecksspitze, Dreiecke 90° */
    if (k === 'pyramide') { const knick = Math.PI - Math.atan2(M.h, M.a / 2); F.slice(1).forEach(x => { x.w = knick; }); return { faces: F, root: 0 }; }
    const knick = Math.PI - Math.acos(1 / 3); F.slice(1).forEach(x => { x.w = knick; }); return { faces: F, root: 0 }; /* Tetraeder: Flächenwinkel ≈ 70,5° */
  }
  return wuerfelFlaechen(NETZE[T.clamp(Math.round(+d.netz) || 1, 1, 11) - 1], M.a);
}
// Flächen im Raum bei Faltzustand t: { q: 3D-Punkte, p2: flache Punkte, g, rand: nur diese Kanten zeichnen (sonst alle) }
function faltSzene(d, t) {
  const M = faltMasse(d), n = 36, kreis = (cx, cy, r) => Array.from({ length: 48 }, (_, i) => [cx + r * Math.cos(i * Math.PI / 24), cy + r * Math.sin(i * Math.PI / 24)]);
  if (d.koerper === 'zylinder') {
    const r = M.r, h = M.h, U = 2 * Math.PI * r, xm = U / 2, y0 = 2 * r, kr = t / r, F = [];
    const P = (x, y) => { const u = x - xm; return kr < 1e-6 ? [x, y, 0] : [xm + Math.sin(u * kr) / kr, y, (1 - Math.cos(u * kr)) / kr]; };
    for (let i = 0; i < n; i++) { const xa = U * i / n, xb = U * (i + 1) / n, p2 = [[xa, y0], [xb, y0], [xb, y0 + h], [xa, y0 + h]];
      F.push({ p2, q: p2.map(p => P(p[0], p[1])), g: -1, rand: [0, 2].concat(i === 0 ? [3] : [], i === n - 1 ? [1] : []) }); }
    const ph = t * Math.PI / 2, cs = Math.cos(ph), sn = Math.sin(ph);
    const oben = kreis(xm, r, r), unten = kreis(xm, 3 * r + h, r);
    F.push({ p2: oben, q: oben.map(([x, y]) => { const dy = y - y0; return [x, y0 + dy * cs, -dy * sn]; }), g: 0 });
    F.push({ p2: unten, q: unten.map(([x, y]) => { const dy = y - y0 - h; return [x, y0 + h + dy * cs, dy * sn]; }), g: 0 });
    return { faces: F, ctr: [xm, y0 + h / 2] };
  }
  if (d.koerper === 'kegel') {
    const r = M.r, s = Math.hypot(r, M.h), al = 2 * Math.PI * r / s, rho = s + (r - s) * t, sb = rho / s, cb = Math.sqrt(Math.max(0, 1 - sb * sb)), F = [];
    const P = (dd, th) => { const ps = th * s / rho, x = dd * sb * Math.sin(ps), y = dd * sb * Math.cos(ps), z = dd * cb; return [x, y * sb + z * cb, -y * cb + z * sb]; };
    for (let i = 0; i < n; i++) { const t1 = -al / 2 + al * i / n, t2 = -al / 2 + al * (i + 1) / n, p2 = [[0, 0], [s * Math.sin(t1), s * Math.cos(t1)], [s * Math.sin(t2), s * Math.cos(t2)]];
      F.push({ p2, q: [[0, 0, 0], P(s, t1), P(s, t2)], g: -1, rand: [1].concat(i === 0 ? [0] : [], i === n - 1 ? [2] : []) }); }
    const ph = t * (Math.PI / 2 + Math.asin(r / s)), cs = Math.cos(ph), sn = Math.sin(ph), deckel = kreis(0, s + r, r);
    F.push({ p2: deckel, q: deckel.map(([x, y]) => { const dy = y - s; return [x, s + dy * cs, dy * sn]; }), g: 0 });
    return { faces: F, ctr: [0, s / 2] };
  }
  const N = faltFlaechen(d), baum = faltBaum(N.faces, N.root);
  return { faces: N.faces.map((Fa, i) => ({ p2: Fa.p, q: Fa.p.map(p => punkt3(baum, i, p, t)), g: Fa.g })), ctr: mitte2(N.faces[N.root].p) };
}
T.faltSzene = faltSzene; /* für Tests */
const newellZ = q => q.reduce((s, v, i) => { const w = q[(i + 1) % q.length]; return s + (v[0] - w[0]) * (v[1] + w[1]); }, 0);
function faltProjektion(d, t) {
  const S = faltSzene(d, t), ctr = S.ctr, ps = t * (d.koerper === 'kegel' ? 70 : 30) * Math.PI / 180, /* Kegel: von der Seite, nicht entlang der Achse */ ph = t * 55 * Math.PI / 180, cs = Math.cos(ps), sn = Math.sin(ps), cp = Math.cos(ph), sp = Math.sin(ph);
  const cam = v => { const x = v[0] - ctr[0], y = v[1] - ctr[1], z = v[2], x2 = x * cs - y * sn, y2 = x * sn + y * cs; return [x2, y2 * cp - z * sp, y2 * sp + z * cp]; };
  return S.faces.map(Fa => { const q = Fa.q.map(cam);
    return { q, tiefe: q.reduce((s, v) => s + v[2], 0) / q.length, innen: newellZ(q) * newellZ(Fa.p2) >= 0, g: Fa.g, rand: Fa.rand }; });
}
B.faltnetz = { name: 'Faltnetz (animiert)', gruppe: 'Mathe', def: { koerper: 'wuerfel', netz: '1', form: '1', a: 3, b: 2, c: 1.5, h: 4, r: 1.5, t: 0, gegen: false },
  felder: [{ k: 'koerper', l: 'Körper', typ: 'auswahl', opts: FALT_KOERPER },
    { k: 'netz', l: 'Würfelnetz', typ: 'auswahl', opts: NETZE.map((_, i) => [String(i + 1), 'Würfelnetz ' + (i + 1)]) },
    { k: 'form', l: 'Quadernetz', typ: 'auswahl', opts: [['1', 'Form 1: Seiten am Boden'], ['2', 'Form 2: Seiten am Deckel'], ['3', 'Form 3: Seitenstreifen']] },
    { k: 'a', l: 'a (cm) – Würfel/Tetraeder: Kante · Quader: Länge · Prisma: Grundseite g des Dreiecks · Pyramide: Grundkante', typ: 'zahl', min: 0.5, max: 15 },
    { k: 'b', l: 'b (cm) – Quader: Breite · Prisma: Höhe h des Dreiecks', typ: 'zahl', min: 0.5, max: 15 },
    { k: 'c', l: 'c (cm) – Quader: Höhe · Prisma: Länge l', typ: 'zahl', min: 0.5, max: 15 },
    { k: 'h', l: 'h (cm) – Körperhöhe bei Pyramide, Zylinder, Kegel', typ: 'zahl', min: 0.5, max: 15 }, { k: 'r', l: 'r (cm) – Radius bei Zylinder und Kegel', typ: 'zahl', min: 0.3, max: 8 },
    { k: 't', l: 'Faltzustand (0 = flach, 1 = gefaltet)', typ: 'zahl', min: 0, max: 1 },
    { k: 'gegen', l: 'Gegenflächen gleich färben', typ: 'check' }],
  gen: (d, P) => {
    const t = T.clamp(+d.t || 0, 0, 1);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].forEach(tt => faltProjektion(d, tt).forEach(Fl => Fl.q.forEach(v => { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); })));
    const m = 14, W = (x1 - x0) * CM + 2 * m, H = (y1 - y0) * CM + 2 * m, X = v => f(m + (v[0] - x0) * CM), Y = v => f(m + (v[1] - y0) * CM);
    const fl = faltProjektion(d, t).sort((a, b) => a.tiefe - b.tiefe);
    const s = fl.map(Fl => {
      const fill = d.gegen && Fl.g >= 0 ? GEGEN[Fl.g % 3] : Fl.innen ? P.papier : P.soft, pts = Fl.q.map(v => X(v) + ',' + Y(v)).join(' ');
      if (!Fl.rand) return `<polygon points="${pts}" fill="${fill}" stroke="${P.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
      /* Mantelstreifen: Nähte unsichtbar, nur die Außenkanten zeichnen */
      return `<polygon points="${pts}" fill="${fill}" stroke="${fill}" stroke-width="1.2" stroke-linejoin="round"/>` +
        `<path d="${Fl.rand.map(j => { const a = Fl.q[j], b = Fl.q[(j + 1) % Fl.q.length]; return `M${X(a)} ${Y(a)}L${X(b)} ${Y(b)}`; }).join('')}" stroke="${P.ink}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
    }).join('');
    return { svg: doc(W, H, s), w: W, h: H };
  } };
// Animation: Bilder der nächsten Stufe vorladen (dann zeichnet die Tafel ohne Flackern), requestAnimationFrame mit setTimeout-Rückfall
const LAEUFT = new Map();
const naechst = cb => { let los = false; const go = () => { if (!los) { los = true; cb(); } }; if (typeof requestAnimationFrame === 'function') requestAnimationFrame(go); setTimeout(go, 45); };
const vorladen = (k, d) => Promise.all([false, true].map(dark => new Promise(res => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj(k, d, dark).svg); })));
function falteAnimiert(o, ziel) {
  const id = o.id, cur0 = T.page().items.find(i => i.id === id) || o; let start = T.clamp(+cur0.d.t || 0, 0, 1);
  if (Math.abs(start - ziel) < 0.001) start = 1 - ziel;
  T.snap(); const marke = {}; LAEUFT.set(id, marke);
  const dauer = 2600 * Math.abs(ziel - start), t0 = performance.now();
  const schritt = () => {
    if (LAEUFT.get(id) !== marke) return;
    const q = dauer ? Math.min(1, (performance.now() - t0) / dauer) : 1, e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2, t = Math.round((start + (ziel - start) * e) * 1000) / 1000;
    const cur = T.page().items.find(i => i.id === id); if (!cur) { LAEUFT.delete(id); return; }
    const d = { ...cur.d, t };
    vorladen(cur.k, d).then(() => {
      if (LAEUFT.get(id) !== marke) return;
      const c2 = T.page().items.find(i => i.id === id); if (!c2) { LAEUFT.delete(id); return; }
      T.replaceItem({ ...c2, d }); T.renderOver && T.renderOver();
      if (regler && regler.isConnected) regler.value = Math.round(t * 100);
      if (q < 1) naechst(schritt); else LAEUFT.delete(id);
    });
  };
  naechst(schritt);
}
T.falteAnimiert = falteAnimiert; /* für Tests */
// Schieberegler: flach (links) bis gefaltet (rechts) – ziehen faltet live; folgt auch ▶/◀
let regler = null;
function faltRegler(akt) {
  const h = T.h, o0 = akt(), wert = v => Math.round(T.clamp(+v || 0, 0, 1) * 100);
  const r = h('input', { type: 'range', min: 0, max: 100, step: 1, value: wert(o0.d.t), class: 'falt-regler', title: 'Ziehen: flach ↔ gefaltet' });
  let beschaeftigt = false, ziel = null; // immer nur den neuesten Reglerwert zeichnen (Bild vorladen = kein Flackern)
  const zeig = () => {
    if (beschaeftigt || ziel == null) return; const t = ziel, cur = akt(); ziel = null; if (!cur) return; beschaeftigt = true;
    vorladen(cur.k, { ...cur.d, t }).then(() => { beschaeftigt = false; const c2 = akt(); if (c2) { T.replaceItem({ ...c2, d: { ...c2.d, t } }); T.renderOver && T.renderOver(); } zeig(); });
  };
  r.addEventListener('pointerdown', e => { e.stopPropagation(); LAEUFT.delete(o0.id); T.snap(); });
  r.addEventListener('input', () => { LAEUFT.delete(o0.id); ziel = (+r.value) / 100; zeig(); });
  regler = r;
  return h('label', { class: 'falt-zeile' }, h('span', {}, 'flach'), r, h('span', {}, 'gefaltet'));
}
// Kacheln unter Einfügen › 3D-Körper: zu jedem Netz die animierte Fassung (Name, voreingestellte Werte, Vorschau-Werte)
const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};
[['quader', 'Quader', { a: 3, b: 2, c: 1.5 }, 'Quadernetz'], ['prisma', 'Dreiecksprisma', { a: 3, b: 2.5, c: 4 }, 'Prismennetz'], ['pyramide', 'Pyramide', { a: 3, h: 4 }, 'Pyramidennetz'],
  ['tetraeder', 'Tetraeder', { a: 3 }, 'Tetraedernetz'], ['zylinder', 'Zylinder', { r: 1.5, h: 4 }, 'Zylindernetz'], ['kegel', 'Kegel', { r: 1.5, h: 4 }, 'Kegelnetz']].forEach(([k, name, m, netz]) => {
  KV['koerpernetz:' + k] = { name: netz, d: { koerper: k } };
  KV['faltnetz:' + k] = { name: name + ' (animiert)', d: { koerper: k, ...m }, vorschau: { t: 0.55 } };
});
KV['faltnetz:wuerfel'] = { name: 'Würfel (animiert)', d: { koerper: 'wuerfel' }, vorschau: { t: 0.55 } };
B.faltnetz.schnell = d => [{ l: '▶ Falten', aus: o => falteAnimiert(o, 1) }, { l: '◀ Auffalten', aus: o => falteAnimiert(o, 0) }, { l: 'Regler', el: faltRegler }]
  .concat(d.koerper === 'wuerfel' || d.koerper === 'quader' ? [q3('▶ Nächstes Netz', dd => { if (dd.koerper === 'quader') dd.form = String((+dd.form || 1) % 3 + 1); else dd.netz = String((+dd.netz || 1) % 11 + 1); return dd; })] : [])
  .concat([q3('🎨 Gegenflächen ein/aus', dd => { dd.gegen = !dd.gegen; return dd; })]);

// =====================================================================
// Würfelgebäude: Bauplan (Zahl = Anzahl Würfel übereinander; erste Zeile = hinten) und Ansichten
// =====================================================================
const plan = s => { const r = String(s || '').split(/[\/\n;]+/).map(z => z.trim().split(/[\s,]+/).filter(Boolean).map(v => T.clamp(Math.round(+v) || 0, 0, 9))).filter(z => z.length);
  const n = Math.max(1, ...r.map(z => z.length)); return r.length ? r.map(z => z.concat(new Array(n - z.length).fill(0))) : [[1]]; };
const ansichten = p => ({
  vorne: p[0].map((_, x) => Math.max(...p.map(z => z[x]))),
  rechts: p.map(z => Math.max(...z)).reverse(), /* von rechts gesehen: links = vorne, rechts = hinten */
  oben: p.map(z => z.map(v => v > 0))
});
T.wuerfelAnsichten = s => ansichten(plan(s)); /* für Tests */
B.wuerfelgebaeude = { name: 'Würfelgebäude / Schrägbild', gruppe: 'Mathe', def: { plan: '1 2 1 / 0 3 2 / 0 1 1', zeige: 'plan', zahlen: true, a: 1.2 },
  felder: [{ k: 'plan', l: 'Bauplan: Zahlen je Zeile, Zeilen mit / trennen (erste Zeile = hinten, 0 = leer)', typ: 'text' },
    { k: 'zeige', l: 'Zeigen', typ: 'auswahl', opts: [['plan', 'Bauplan'], ['schraeg', 'Schrägbild'], ['vorne', 'Ansicht von vorne'], ['rechts', 'Ansicht von rechts'], ['oben', 'Ansicht von oben'], ['ansichten', 'drei Ansichten'], ['alle', 'Bauplan, Schrägbild und Ansichten']] },
    { k: 'zahlen', l: 'Zahlen im Bauplan zeigen (aus = leerer Bauplan zum Ausfüllen)', typ: 'check' }, { k: 'a', l: 'Kantenlänge (cm)', typ: 'zahl', min: 0.5, max: 4 }],
  gen: (d, P) => {
    const p = plan(d.plan), A = ansichten(p), a = T.clamp(+d.a || 1.2, 0.5, 4) * CM, fs = Math.max(14, a * 0.32), lab = fs * 1.9;
    const teile = [];
    const kaest = (gx, gy, w, h, fill, st = 2.5) => rc(gx, gy, w, h, P.ink, fill, st);
    const cap = (w, t) => tx(w / 2, 0, t, P.ink, fs, 'middle', 'font-weight="700"');
    const zPlan = () => { const nx = p[0].length, ny = p.length, w = nx * a, h = ny * a; let s = '';
      p.forEach((z, y) => z.forEach((v, x) => { s += kaest(x * a, y * a, a, a, v ? P.soft : P.papier); if (v && d.zahlen) s += tx(x * a + a / 2, y * a + a / 2, String(v), P.ink, a * 0.5, 'middle', 'font-weight="700"'); }));
      s += tx(w / 2, h + fs * 0.9, '▲ vorne', P.acc, fs * 0.85, 'middle', 'font-weight="600"');
      return { s, w, h: h + fs * 1.8, t: 'Bauplan' }; };
    const zSaeulen = (hs, t) => { const hm = Math.max(1, ...hs), w = hs.length * a, h = hm * a; let s = ln(-4, h, w + 4, h, P.ink, 3);
      hs.forEach((v, x) => { for (let k = 0; k < v; k++) s += kaest(x * a, h - (k + 1) * a, a, a, P.soft); });
      return { s, w, h: h + 6, t }; };
    const zOben = () => { const nx = p[0].length, w = nx * a, h = p.length * a; let s = '';
      A.oben.forEach((z, y) => z.forEach((v, x) => { if (v) s += kaest(x * a, y * a, a, a, P.soft); }));
      s += tx(w / 2, h + fs * 0.9, '▲ vorne', P.acc, fs * 0.85, 'middle', 'font-weight="600"');
      return { s, w, h: h + fs * 1.8, t: 'von oben' }; };
    const zSchraeg = () => { /* Schrägbild: Tiefe nach rechts oben (45°, halbe Länge); Würfel von hinten nach vorne, links nach rechts, unten nach oben */
      const t = a * 0.5 * Math.SQRT1_2, ny = p.length, nx = p[0].length, hm = Math.max(1, ...p.flat()), w = nx * a + ny * t, h = hm * a + ny * t; let s = '';
      const pt = (x, y, z) => [x * a + (ny - z) * t, h - y * a - (ny - z) * t]; /* z = Zeile (0 = hinten) */
      const poly = (q, fill) => `<polygon points="${q.map(([x, y]) => f(x) + ',' + f(y)).join(' ')}" fill="${fill}" stroke="${P.ink}" stroke-width="2" stroke-linejoin="round"/>`;
      for (let z = 0; z < ny; z++) for (let x = 0; x < nx; x++) for (let y = 0; y < p[z][x]; y++) {
        const v = z + 1; /* Vorderkante */
        s += poly([pt(x, y, v), pt(x + 1, y, v), pt(x + 1, y + 1, v), pt(x, y + 1, v)], P.papier);
        s += poly([pt(x, y + 1, v), pt(x + 1, y + 1, v), pt(x + 1, y + 1, z), pt(x, y + 1, z)], P.soft);
        s += poly([pt(x + 1, y, v), pt(x + 1, y, z), pt(x + 1, y + 1, z), pt(x + 1, y + 1, v)], P.head);
      }
      return { s, w, h: h + 4, t: 'Schrägbild' }; };
    const Z = { plan: zPlan, schraeg: zSchraeg, vorne: () => zSaeulen(A.vorne, 'von vorne'), rechts: () => zSaeulen(A.rechts, 'von rechts'), oben: zOben };
    const liste = d.zeige === 'alle' ? ['plan', 'schraeg', 'vorne', 'rechts', 'oben'] : d.zeige === 'ansichten' ? ['vorne', 'rechts', 'oben'] : [Z[d.zeige] ? d.zeige : 'plan'];
    const mit = liste.length > 1, m = 14, gap = a * 0.9; let x = m, s = '', H = 0;
    const st = liste.map(k => Z[k]());
    const hMax = Math.max(...st.map(q => q.h));
    st.forEach(q => { s += `<g transform="translate(${f(x)} ${f(m + (mit ? lab : 0) + hMax - q.h)})">${q.s}</g>`;
      if (mit) s += `<g transform="translate(${f(x)} ${f(m + lab / 2)})">${cap(q.w, q.t)}</g>`; x += q.w + gap; });
    const W = x - gap + m; H = m * 2 + (mit ? lab : 0) + hMax;
    void teile;
    return { svg: doc(W, H, s), w: W, h: H };
  } };

// =====================================================================
// G6 Beschriften auf eigenen Bildern
// T.beschriftenStart(bildItem): Dialog – Punkte aufs Bild tippen, Begriffe eintragen – erzeugt die Übung neben dem Bild.
// Das Bild selbst bleibt unverändert; Punkte und Linien liegen als eigenes Objekt (fixiert) darüber.
// =====================================================================
B.p3anker = { name: 'Beschriftungspunkte', gruppe: 'intern', def: { W: 100, H: 100, pk: [], nr: false }, felder: [],
  gen: (d) => {
    let s = '';
    (d.pk || []).forEach(([px, py, lx, ly, n]) => { s += ln(px, py, lx, ly, '#1e293b', 5) + ln(px, py, lx, ly, '#ffffff', 2); });
    (d.pk || []).forEach(([px, py, , , n]) => {
      s += `<circle cx="${f(px)}" cy="${f(py)}" r="${d.nr ? 17 : 10}" fill="#ffffff" stroke="#dc2626" stroke-width="4"/>`;
      if (d.nr) s += tx(px, py + 1, String(n), '#b91c1c', 19, 'middle', 'font-weight="700"');
    });
    return { svg: doc(d.W, d.H, s), w: d.W, h: d.H };
  } };
const objekt = (k, d, x, y, s) => { const g = T.genObj(k, d, false); return { t: 'o', id: T.uid(), k, d, x, y, w: g.w * s, h: g.h * s, r: 0 }; };
const KN = { pruefen: ['✓ Prüfen', '#16a34a', '#22c55e'], mischen: ['↺ Von vorn', '#5b5bd6', '#8e5bd6'], loesung: ['💡 Lösung', '#f59e0b', '#f97316'] };
function weltPunkt(bild, u, v) { /* Bildkoordinaten 0…1 → Tafel (auch bei gedrehtem Bild) */
  const lx = (u - 0.5) * bild.w, ly = (v - 0.5) * bild.h, a = (bild.r || 0) * Math.PI / 180;
  return [bild.x + bild.w / 2 + lx * Math.cos(a) - ly * Math.sin(a), bild.y + bild.h / 2 + lx * Math.sin(a) + ly * Math.cos(a)];
}
function beschriftenBauen(meta, nv) {
  const pg = T.page(), bild = pg.items.find(i => i.id === meta.bild);
  if (!bild) { T.toast('Das Bild ist nicht mehr auf dieser Seite.'); return null; }
  const k = meta.k, uid = T.uid(), neu = [], bb = T.bbox(bild), gap = 70 * k;
  const P = meta.P.map((p, i) => ({ ...p, i, w: weltPunkt(bild, p.u, p.v) }));
  const BW = Math.max(190, ...meta.P.concat(nv === 2 ? meta.abl.map(t => ({ t })) : []).map(p => mess(p.t, 28, true) + 50));
  const zw = BW + 20, zh = 84, abst = 96 * k;
  const links = P.filter(p => p.w[0] < (bb.x0 + bb.x1) / 2).sort((a, b) => a.w[1] - b.w[1]), rechts = P.filter(p => !links.includes(p)).sort((a, b) => a.w[1] - b.w[1]);
  const spalte = (L, x) => { let y = -Infinity; L.forEach(p => { y = Math.max(p.w[1] - zh * k / 2, y + abst); p.z = [x, y]; }); };
  spalte(links, bb.x0 - gap - zw * k); spalte(rechts, bb.x1 + gap);
  P.forEach((p, nr) => { p.nr = nr + 1; });
  /* Punkte + Linien (ein fixiertes Objekt über dem Bild) */
  const ends = P.map(p => [p.z[0] + (links.includes(p) ? zw * k : 0), p.z[1] + zh * k / 2]);
  const xs = P.flatMap((p, i) => [p.w[0], ends[i][0]]), ys = P.flatMap((p, i) => [p.w[1], ends[i][1]]);
  const ox = Math.min(...xs) - 24 * k, oy = Math.min(...ys) - 24 * k, W = (Math.max(...xs) - ox) / k + 24, H = (Math.max(...ys) - oy) / k + 24;
  const anker = { t: 'o', id: T.uid(), k: 'p3anker', fest: true, d: { uid, W, H, nr: nv === 3, pk: P.map((p, i) => [(p.w[0] - ox) / k, (p.w[1] - oy) / k, (ends[i][0] - ox) / k, (ends[i][1] - oy) / k, p.nr]) }, x: ox, y: oy, w: W * k, h: H * k, r: 0 };
  const x0 = Math.min(bb.x0, ...P.map(p => p.z[0])), x1 = Math.max(bb.x1, ...P.map(p => p.z[0] + zw * k));
  const auftrag = ['Ziehe die Begriffe an die richtigen Stellen.', 'Ziehe die passenden Begriffe an die Stellen. Nicht alle Begriffe passen.', 'Schreibe zu jeder Nummer den passenden Begriff.'][nv - 1];
  const tit = objekt('ukarte', { form: 'titel', text: auftrag, w: Math.max(600, (x1 - x0) / k), fs: 26, uid }, x0, 0, k);
  tit.y = Math.min(bb.y0, ...P.map(p => p.z[1])) - tit.h - 24 * k; neu.push(tit, anker);
  if (nv === 3) {
    P.forEach(p => {
      neu.push(objekt('ukarte', { form: 'feld', text: String(p.nr), w: zw, h: zh, uid }, p.z[0], p.z[1], k));
      neu.push(objekt('ukarte', { text: p.t, w: BW, h: 70, uid, verdeckt: true, loes: true }, p.z[0] + 10 * k, p.z[1] + 7 * k, k));
    });
  } else P.forEach(p => neu.push(objekt('uziel', { w: zw, h: zh, uid, id: 'z' + p.i }, p.z[0], p.z[1], k)));
  let unten = Math.max(bb.y1, ...P.map(p => p.z[1] + zh * k)) + 40 * k;
  if (nv !== 3) {
    const karten = mische(P.map(p => [p.t, 'z' + p.i]).concat(nv === 2 ? meta.abl.map(t => [t, null]) : []));
    let x = x0, y = unten; const xmax = Math.max(x1, x0 + 900 * k);
    karten.forEach(([t, soll]) => { const w = Math.max(170, mess(t, 28, true) + 50); if (x + w * k > xmax && x > x0) { x = x0; y += 90 * k; }
      neu.push(objekt('ukarte', { text: t, w, h: 70, uid, ziehbar: true, soll }, x, y, k)); x += (w + 20) * k; });
    unten = y + 100 * k;
  }
  const knoepfe = nv === 3 ? ['loesung'] : ['pruefen', 'mischen', 'loesung'];
  knoepfe.forEach((a, i) => neu.push(objekt('uknopf', { text: KN[a][0], aktion: a, uid, typ: 'p3b', farbe: KN[a][1], farbe2: KN[a][2], w: 220 }, x0 + i * 240 * k, unten, k)));
  [1, 2, 3].forEach(s => neu.push(objekt('uknopf', { text: '★'.repeat(s), aktion: 'niveau', stufe: s, uid, typ: 'p3b', p3b: meta, w: 110, h: 60,
    farbe: s === nv ? '#5b5bd6' : '#94a3b8', farbe2: s === nv ? '#8e5bd6' : '#cbd5e1' }, x0 + (knoepfe.length * 240 + 20 + (s - 1) * 120) * k, unten + 5 * k, k)));
  /* bei ★★ ohne Ablenker: Hinweis im Toast */
  return { neu, uid };
}
const gruppeVon = bildId => { const kn = T.page().items.find(i => i.k === 'uknopf' && i.d && i.d.p3b && i.d.p3b.bild === bildId); return kn ? { uid: kn.d.uid, meta: kn.d.p3b } : null; };
function legen(meta, nv, alt) {
  const r = beschriftenBauen(meta, nv); if (!r) return;
  T.snap();
  const pg = T.page(); if (alt) pg.items = pg.items.filter(i => !(i.d && i.d.uid === alt));
  r.neu.forEach(o => pg.items.push(o));
  T.render(); T.renderOver && T.renderOver();
}
const altAktion = T.uebungAktion;
T.uebungAktion = knopf => {
  if (knopf && knopf.d && knopf.d.p3b && knopf.d.aktion === 'niveau') { legen(knopf.d.p3b, knopf.d.stufe, knopf.d.uid); T.toast('Niveau ' + '★'.repeat(knopf.d.stufe), 1500); return; }
  return altAktion ? altAktion(knopf) : undefined;
};

// ---------- Dialog: Punkte setzen und Begriffe eintragen ----------
const CSS = `
.p3-hg { position: fixed; inset: 0; z-index: 9000; background: rgba(15,23,42,.55); display: flex; align-items: center; justify-content: center; }
.p3-dlg { background: var(--surface, #fff); color: var(--text, #1b1f2a); border-radius: 18px; box-shadow: 0 20px 60px rgba(0,0,0,.35); width: min(1180px, 96vw); max-height: 94vh; display: flex; flex-direction: column; overflow: hidden; }
.p3-kopf { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--line, #e2e8f0); font-size: 18px; font-weight: 700; }
.p3-kopf span { flex: 1; }
.p3-rumpf { display: flex; gap: 16px; padding: 14px 18px; overflow: auto; flex: 1; min-height: 0; flex-wrap: wrap; }
.p3-bildbox { position: relative; flex: 0 0 auto; align-self: flex-start; cursor: crosshair; border: 1px solid var(--line, #e2e8f0); border-radius: 10px; overflow: hidden; touch-action: none; }
.p3-bildbox img { display: block; max-width: min(720px, 60vw, 88vw - 40px); max-height: 68vh; user-select: none; -webkit-user-drag: none; }
.p3-pkt { position: absolute; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; background: #fff; border: 4px solid #dc2626; color: #b91c1c; font: 700 15px/26px Segoe UI, sans-serif; text-align: center; pointer-events: none; box-sizing: border-box; }
.p3-liste { flex: 1; min-width: 260px; display: flex; flex-direction: column; gap: 8px; }
.p3-zeile { display: flex; gap: 8px; align-items: center; }
.p3-nr { width: 30px; height: 30px; border-radius: 50%; background: #dc2626; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: 0 0 auto; }
.p3-dlg input[type=text] { flex: 1; min-height: 44px; font-size: 17px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--line, #cbd5e1); background: var(--surface2, #fff); color: var(--text, #1b1f2a); }
.p3-dlg button { min-height: 44px; padding: 0 16px; border-radius: 12px; border: 1px solid var(--line, #cbd5e1); background: var(--surface2, #f8fafc); color: var(--text, #1b1f2a); font-size: 16px; cursor: pointer; }
.p3-dlg button.on, .p3-dlg button.p3-los { background: var(--acc, #5b5bd6); border-color: var(--acc, #5b5bd6); color: #fff; font-weight: 700; }
.p3-hinweis { color: var(--muted, #64748b); font-size: 14px; }
.p3-fuss { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 12px 18px; border-top: 1px solid var(--line, #e2e8f0); }
.p3-fuss .p3-platz { flex: 1; }
`;
if (!document.getElementById('p3a-stil')) { const st = document.createElement('style'); st.id = 'p3a-stil'; st.textContent = CSS; document.head.append(st); }
const el = (tag, at, ...kinder) => { const e = document.createElement(tag); Object.entries(at || {}).forEach(([k, v]) => { if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'class') e.className = v; else e.setAttribute(k, v); });
  kinder.flat().forEach(c => c != null && e.append(c)); return e; };

T.beschriftenStart = bildItem => {
  const pg = T.page(), bild = typeof bildItem === 'string' ? pg.items.find(i => i.id === bildItem) : bildItem && pg.items.find(i => i.id === bildItem.id);
  if (!bild || bild.k !== 'bild' || !bild.d || !bild.d.src) { T.toast('Bitte zuerst ein Bild auswählen.'); return; }
  const alt = gruppeVon(bild.id);
  const M = { P: alt ? alt.meta.P.map(p => ({ ...p })) : [], abl: alt ? alt.meta.abl.join(', ') : '', nv: 1 };
  const hg = el('div', { class: 'p3-hg' }), img = el('img', { src: bild.d.src, alt: '' }), box = el('div', { class: 'p3-bildbox' }, img), liste = el('div', { class: 'p3-liste' });
  const zu = () => { hg.remove(); document.removeEventListener('keydown', taste, true); };
  const taste = e => { if (e.key === 'Escape') { e.stopPropagation(); zu(); } };
  const malen = () => {
    box.querySelectorAll('.p3-pkt').forEach(p => p.remove());
    M.P.forEach((p, i) => box.append(el('div', { class: 'p3-pkt', style: `left:${p.u * 100}%;top:${p.v * 100}%` }, String(i + 1))));
    liste.replaceChildren(
      el('div', { class: 'p3-hinweis' }, M.P.length ? 'Zu jedem Punkt den Begriff eintragen. Weitere Punkte: ins Bild tippen.' : 'Tippe im Bild auf die Stellen, die beschriftet werden sollen.'),
      ...M.P.map((p, i) => { const inp = el('input', { type: 'text', placeholder: 'Begriff zu Punkt ' + (i + 1) }); inp.value = p.t || ''; inp.addEventListener('input', () => { p.t = inp.value; });
        return el('div', { class: 'p3-zeile' }, el('span', { class: 'p3-nr' }, String(i + 1)), inp, el('button', { title: 'Punkt löschen', onclick: () => { M.P.splice(i, 1); malen(); } }, '✕')); }),
      el('div', { class: 'p3-hinweis', style: 'margin-top:10px' }, 'Ablenker für ★★ (freiwillig, mit Komma trennen):'),
      (() => { const a = el('input', { type: 'text', placeholder: 'z. B. Begriffe, die nicht passen' }); a.value = M.abl; a.addEventListener('input', () => { M.abl = a.value; }); return a; })());
    const leer = liste.querySelectorAll('input[type=text]'); if (M.P.length && leer[M.P.length - 1] && !M.P[M.P.length - 1].t) leer[M.P.length - 1].focus();
  };
  box.addEventListener('pointerdown', e => {
    e.preventDefault(); const r = img.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height; if (u < 0 || u > 1 || v < 0 || v > 1) return;
    if (M.P.length >= 12) { T.toast('Höchstens 12 Punkte.'); return; }
    M.P.push({ u: Math.round(u * 1000) / 1000, v: Math.round(v * 1000) / 1000, t: '' }); malen();
  });
  const nvKn = [1, 2, 3].map(s => el('button', { title: ['Begriffe ziehen', 'Begriffe ziehen, dazu Ablenker', 'Punkte nummeriert, Begriffe selbst schreiben'][s - 1], onclick: () => { M.nv = s; nvKn.forEach((b, i) => b.classList.toggle('on', i === s - 1)); } }, '★'.repeat(s)));
  nvKn[0].classList.add('on');
  const los = () => {
    const P = M.P.map(p => ({ ...p, t: String(p.t || '').trim() })).filter(p => p.t);
    if (P.length < 2) { T.toast('Bitte mindestens zwei Punkte setzen und beschriften.'); return; }
    if (M.P.some(p => !String(p.t || '').trim())) { T.toast('Punkte ohne Begriff bitte beschriften oder löschen.'); return; }
    const doppelt = P.map(p => p.t.toLowerCase()).filter((t, i, a) => a.indexOf(t) !== i);
    if (doppelt.length) { T.toast('Jeder Begriff nur einmal, bitte – „' + doppelt[0] + '“ kommt doppelt vor.'); return; }
    const abl = M.abl.split(/[,;]/).map(s => s.trim()).filter(s => s && !P.some(p => p.t.toLowerCase() === s.toLowerCase()));
    const k = alt ? alt.meta.k : T.clamp(Math.min(1 / T.page().view.z, Math.max(bild.w, bild.h) / 700), 0.4, 4); /* Kärtchen passend zur Bildgröße */
    zu(); legen({ bild: bild.id, P, abl, k }, M.nv, alt && alt.uid);
    T.toast(M.nv === 2 && !abl.length ? 'Steht auf der Tafel. Tipp: Für ★★ Ablenker eintragen (Beschriften erneut öffnen).' : 'Steht auf der Tafel – Begriffe ziehen, dann „✓ Prüfen“. ★ wechselt das Niveau.', 4000);
  };
  hg.append(el('div', { class: 'p3-dlg' },
    el('div', { class: 'p3-kopf' }, el('span', {}, '🏷 Bild beschriften'), el('button', { title: 'Schließen', onclick: zu }, '✕')),
    el('div', { class: 'p3-rumpf' }, box, liste),
    el('div', { class: 'p3-fuss' }, el('span', { class: 'p3-hinweis' }, 'Niveau'), ...nvKn, el('span', { class: 'p3-platz' }),
      M.P.length ? el('button', { onclick: () => { M.P = []; malen(); } }, 'Alle Punkte löschen') : null,
      el('button', { onclick: zu }, 'Abbrechen'), el('button', { class: 'p3-los', onclick: los }, alt ? '✓ Übung erneuern' : '✓ Übung erstellen'))));
  hg.addEventListener('pointerdown', e => { if (e.target === hg) zu(); });
  document.addEventListener('keydown', taste, true);
  document.body.append(hg); malen();
};
})();
