// Tafel-App – 🧊 3D-Körper an den Ecken anfassen: orange Griffe ändern Länge, Breite, Höhe bzw. Radius (in 0,5-cm-Schritten).
// Die vordere untere Ecke (bei Zylinder/Kegel die Mitte der Grundfläche, bei der Kugel der Mittelpunkt) bleibt dabei stehen.
'use strict';
(function () {
const CM = T.CM, M = 40, Z = 0.5 * Math.SQRT1_2; // Rand im SVG, Schrägbild: Tiefe 45°, halb verkürzt
const tief = [Math.SQRT1_2, -Math.SQRT1_2]; // Richtung der Tiefe im Bild
const RECHTS = [1, 0], OBEN = [0, -1];
// je Körper: Ankerpunkt (SVG) und Griffe { k: Maß, at: Lage (SVG), u: Richtung, pro: SVG-Einheiten je cm }
const KG = {
  wuerfel: { anker: (d, g) => [M, g.h - M], griffe: d => [{ k: 'a', at: [d.a * CM, 0], u: RECHTS, pro: CM }] },
  quader: { anker: (d, g) => [M, g.h - M], griffe: d => [{ k: 'a', at: [d.a * CM, 0], u: RECHTS, pro: CM }, { k: 'c', at: [0, -d.c * CM], u: OBEN, pro: CM },
    { k: 'b', at: [d.b * Z * CM, -d.b * Z * CM], u: tief, pro: 0.5 * CM }] },
  pyramide: { anker: (d, g) => [M, g.h - M], griffe: d => [{ k: 'a', at: [d.a * CM, 0], u: RECHTS, pro: CM }, { k: 'h', at: [(d.a / 2 + d.a * Z) * CM, -(d.h + d.a * Z) * CM], u: OBEN, pro: CM }] },
  prisma: { anker: (d, g) => [M, g.h - M], griffe: d => [{ k: 'g', at: [d.g * CM, 0], u: RECHTS, pro: CM }, { k: 'hd', at: [d.g / 2 * CM, -d.hd * CM], u: OBEN, pro: CM },
    { k: 'l', at: [d.l * Z * CM, -d.l * Z * CM], u: tief, pro: 0.5 * CM }] },
  zylinder: { anker: (d, g) => [g.w / 2, g.h - M - d.r * CM * 0.38], griffe: d => [{ k: 'r', at: [d.r * CM, 0], u: RECHTS, pro: CM }, { k: 'h', at: [0, -d.h * CM], u: OBEN, pro: CM }] },
  kegel: { anker: (d, g) => [g.w / 2, M + d.h * CM], griffe: d => [{ k: 'r', at: [d.r * CM, 0], u: RECHTS, pro: CM }, { k: 'h', at: [0, -d.h * CM], u: OBEN, pro: CM }] },
  kugel: { anker: (d, g) => [g.w / 2, g.h / 2], griffe: d => [{ k: 'r', at: [d.r * CM, 0], u: RECHTS, pro: CM }] }
};
const NAME = { a: 'a', b: 'b', c: 'c', h: 'h', r: 'r', g: 'g', hd: 'h', l: 'l' };
const daten = o => ({ ...T.BAUSTEINE[o.k].def, ...o.d });
const basis = d => ({ ...d, volumen: false, oberflaeche: false, kanten: false }); /* Lage der Griffe: Körper ohne Zusätze */
const RAND = 120, versatz = d => d.kanten ? RAND : 0; /* mit Kantenlängen: links Platz für die Beschriftung */
const anker = (K, k, d) => { const A = K.anker(d, T.genObj(k, basis(d), false)); return [A[0] + versatz(d), A[1]]; };

// 📏 Kantenlängen (bzw. r, h) mit Wert – Lage relativ zum Anker (SVG), n = Richtung der Beschriftung, gestr = Hilfslinie
const D = Math.SQRT1_2;
const KANTEN = {
  wuerfel: d => [{ t: 'a', v: d.a, p1: [0, 0], p2: [d.a * CM, 0], n: [0, 1] }],
  quader: d => [{ t: 'a', v: d.a, p1: [0, 0], p2: [d.a * CM, 0], n: [0, 1] }, { t: 'c', v: d.c, p1: [0, 0], p2: [0, -d.c * CM], n: [-1, 0] },
    { t: 'b', v: d.b, p1: [d.a * CM, 0], p2: [(d.a + d.b * Z) * CM, -d.b * Z * CM], n: [D, D] }],
  pyramide: d => [{ t: 'a', v: d.a, p1: [0, 0], p2: [d.a * CM, 0], n: [0, 1] },
    { t: 'h', v: d.h, p1: [(d.a / 2 + d.a / 2 * Z) * CM, -d.a / 2 * Z * CM], p2: [(d.a / 2 + d.a / 2 * Z) * CM, -(d.h + d.a / 2 * Z) * CM], n: [1, 0], gestr: true }],
  prisma: d => [{ t: 'g', v: d.g, p1: [0, 0], p2: [d.g * CM, 0], n: [0, 1] }, { t: 'h', v: d.hd, p1: [d.g / 2 * CM, 0], p2: [d.g / 2 * CM, -d.hd * CM], n: [1, 0], gestr: true },
    { t: 'l', v: d.l, p1: [d.g * CM, 0], p2: [(d.g + d.l * Z) * CM, -d.l * Z * CM], n: [D, D] }],
  zylinder: d => [{ t: 'r', v: d.r, p1: [0, -d.h * CM], p2: [d.r * CM, -d.h * CM], n: [0, -1], off: d.r * CM * 0.38 }, { t: 'h', v: d.h, p1: [d.r * CM, 0], p2: [d.r * CM, -d.h * CM], n: [1, 0] }],
  kegel: d => [{ t: 'r', v: d.r, p1: [0, 0], p2: [d.r * CM, 0], n: [0, 1], off: d.r * CM * 0.38 }, { t: 'h', v: d.h, p1: [0, 0], p2: [0, -d.h * CM], n: [-1, 0], gestr: true }],
  kugel: d => [{ t: 'r', v: d.r, p1: [0, 0], p2: [d.r * CM * D, -d.r * CM * D], n: [D, D], gestr: true }]
};

// 📦 Volumen und 🧱 Oberfläche (einzeln zuschaltbar) – stehen unter dem Körper
const PI = Math.PI, wurzel = Math.sqrt;
const VO = {
  wuerfel: d => [d.a ** 3, 6 * d.a ** 2, false],
  quader: d => [d.a * d.b * d.c, 2 * (d.a * d.b + d.a * d.c + d.b * d.c), false],
  pyramide: d => [d.a * d.a * d.h / 3, d.a * d.a + 2 * d.a * wurzel(d.h * d.h + d.a * d.a / 4), true], /* quadratische Grundfläche, Seitenhöhe hs = √(h² + (a/2)²) */
  prisma: d => { const G = d.g * d.hd / 2, s = wurzel(d.g * d.g / 4 + d.hd * d.hd); return [G * d.l, 2 * G + (d.g + 2 * s) * d.l, true]; }, /* gleichschenkliges Dreieck */
  zylinder: d => [PI * d.r * d.r * d.h, 2 * PI * d.r * (d.r + d.h), true],
  kegel: d => [PI * d.r * d.r * d.h / 3, PI * d.r * (d.r + wurzel(d.r * d.r + d.h * d.h)), true],
  kugel: d => [4 / 3 * PI * d.r ** 3, 4 * PI * d.r * d.r, true]
};
// 🔄 Frei drehen: echte 3D-Ansicht (senkrechte Parallelprojektion) mit Drehung um die senkrechte Achse (dy) und Neigung (dp)
// Modelle in cm, y nach oben; „glatte“ Kanten (Mantel von Zylinder/Kegel) erscheinen nur als Umriss
const MODELL = {
  wuerfel: d => quaderM(d.a, d.a, d.a), quader: d => quaderM(d.a, d.b, d.c),
  pyramide: d => ({ V: [[0, 0, 0], [d.a, 0, 0], [d.a, 0, d.a], [0, 0, d.a], [d.a / 2, d.h, d.a / 2]], F: [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]], namen: 'ABCDS' }),
  prisma: d => ({ V: [[0, 0, 0], [d.g, 0, 0], [d.g / 2, d.hd, 0], [0, 0, d.l], [d.g, 0, d.l], [d.g / 2, d.hd, d.l]], F: [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]], namen: 'ABCDEF' }),
  zylinder: d => rund(d.r, d.h, false), kegel: d => rund(d.r, d.h, true)
};
function quaderM(a, b, c) { return { V: [[0, 0, 0], [a, 0, 0], [a, 0, b], [0, 0, b], [0, c, 0], [a, c, 0], [a, c, b], [0, c, b]], F: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], namen: 'ABCDEFGH' }; }
function rund(r, h, spitz) {
  const n = 64, V = [], F = [], glatt = new Set(), unten = [], key = (a, b) => Math.min(a, b) + '-' + Math.max(a, b);
  for (let i = 0; i < n; i++) { const t = i / n * 2 * PI; V.push([r * Math.cos(t), 0, r * Math.sin(t)]); unten.push(i); }
  if (spitz) { V.push([0, h, 0]); for (let i = 0; i < n; i++) { const j = (i + 1) % n; F.push([i, j, n]); glatt.add(key(i, n)); } }
  else { for (let i = 0; i < n; i++) V.push([r * Math.cos(i / n * 2 * PI), h, r * Math.sin(i / n * 2 * PI)]);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; F.push([i, j, n + j, n + i]); glatt.add(key(i, n + i)); }
    F.push(unten.map(i => n + i)); }
  F.push(unten); return { V, F, glatt };
}
function dreh3d(k, d, P) {
  const { doc, tx, ln, f } = T._svg, m = 40, a = (d.dy == null ? 30 : +d.dy || 0) * PI / 180, p = (d.dp == null ? 20 : +d.dp || 0) * PI / 180, ca = Math.cos(a), sa = Math.sin(a), cp = Math.cos(p), sp = Math.sin(p);
  const rot = v => { const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca; return [x1, v[1] * cp - z1 * sp, v[1] * sp + z1 * cp]; };
  if (k === 'kugel') { /* Kugel: Umriss bleibt, der Äquator zeigt die Drehung (vorn durchgezogen, hinten gestrichelt) */
    const r = d.r * CM, W = 2 * r + 2 * m, c = W / 2; let s = `<circle cx="${f(c)}" cy="${f(c)}" r="${f(r)}" fill="${P.soft}" stroke="${P.ink}" stroke-width="3"/>`;
    for (let i = 0; i < 96; i++) { const q1 = rot([d.r * Math.cos(i / 96 * 2 * PI), 0, d.r * Math.sin(i / 96 * 2 * PI)]), q2 = rot([d.r * Math.cos((i + 1) / 96 * 2 * PI), 0, d.r * Math.sin((i + 1) / 96 * 2 * PI)]), vorn = q1[2] + q2[2] >= 0;
      s += ln(c + q1[0] * CM, c - q1[1] * CM, c + q2[0] * CM, c - q2[1] * CM, P.ink, vorn ? 2.5 : 2, vorn ? '' : `stroke-dasharray="${P.dash}"`); }
    if (d.masse) s += `<circle cx="${f(c)}" cy="${f(c)}" r="3.5" fill="${P.acc}"/>`;
    return { svg: doc(W, W, s), w: W, h: W };
  }
  const M3 = MODELL[k](d), xs = M3.V.map(v => v[0]), ys = M3.V.map(v => v[1]), zs = M3.V.map(v => v[2]);
  const mid = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
  const R = Math.max(...M3.V.map(v => Math.hypot(v[0] - mid[0], v[1] - mid[1], v[2] - mid[2]))), W = 2 * R * CM + 2 * m, c = W / 2;
  const Q = M3.V.map(v => rot([v[0] - mid[0], v[1] - mid[1], v[2] - mid[2]])), X = q => c + q[0] * CM, Y = q => c - q[1] * CM;
  const sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]], cen = [0, 1, 2].map(i => Q.reduce((s, q) => s + q[i], 0) / Q.length);
  const vis = M3.F.map(fc => { const u = sub(Q[fc[1]], Q[fc[0]]), w = sub(Q[fc[fc.length - 1]], Q[fc[0]]); let nz = u[0] * w[1] - u[1] * w[0];
    const fm = [0, 1, 2].map(i => fc.reduce((s, j) => s + Q[j][i], 0) / fc.length), n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], nz];
    if (n[0] * (fm[0] - cen[0]) + n[1] * (fm[1] - cen[1]) + n[2] * (fm[2] - cen[2]) < 0) nz = -nz; return nz > 1e-9; });
  const kanten = new Map();
  M3.F.forEach((fc, fi) => fc.forEach((u, i) => { const v = fc[(i + 1) % fc.length], key = Math.min(u, v) + '-' + Math.max(u, v); const e = kanten.get(key) || { u, v, fl: [] }; e.fl.push(fi); kanten.set(key, e); }));
  let s = '';
  if (d.flaechen !== false || M3.glatt) M3.F.forEach((fc, fi) => { if (vis[fi]) s += `<polygon points="${fc.map(j => f(X(Q[j])) + ',' + f(Y(Q[j]))).join(' ')}" fill="${P.soft}" stroke="${P.soft}" stroke-width="1"/>`; });
  for (const [key, e] of kanten) {
    const sicht = e.fl.some(i => vis[i]);
    if (M3.glatt && M3.glatt.has(key)) { if (e.fl.length === 2 && vis[e.fl[0]] !== vis[e.fl[1]]) s += ln(X(Q[e.u]), Y(Q[e.u]), X(Q[e.v]), Y(Q[e.v]), P.ink, 3); continue; } /* Mantel: nur der Umriss */
    s += ln(X(Q[e.u]), Y(Q[e.u]), X(Q[e.v]), Y(Q[e.v]), P.ink, sicht ? 3 : 2, sicht ? '' : `stroke-dasharray="${P.dash}"`);
  }
  if (d.ecken && M3.namen) Q.forEach((q, i) => { if (i >= M3.namen.length) return; const dx = X(q) - c, dy = Y(q) - c, l = Math.hypot(dx, dy) || 1; s += tx(X(q) + dx / l * 20, Y(q) + dy / l * 20, M3.namen[i], P.acc, 20, 'middle', 'font-weight="600"'); });
  return { svg: doc(W, W, s), w: W, h: W };
}
T.dreh3d = dreh3d; T.istKoerper = o => !!(o && o.t === 'o' && (VO[o.k] || o.k === 'faltnetz') && T.BAUSTEINE[o.k] && o.d && o.d.r3); /* nur mit 🔄 Drehen an: ziehen dreht (Körper und animierte Netze) */
if (T._svg) for (const k of Object.keys(VO)) {
  const Bk = T.BAUSTEINE[k]; if (!Bk) continue;
  const { doc, tx, ln, f } = T._svg, alt0 = Bk.gen, alt = (d, P) => d.r3 ? dreh3d(k, { ...Bk.def, ...d }, P) : alt0(d, P);
  Bk.felder = (Bk.felder || []).concat([{ k: 'kanten', l: 'Kantenlängen (bzw. r, h) mit Wert anzeigen', typ: 'check' }, { k: 'volumen', l: 'Volumen V anzeigen', typ: 'check' }, { k: 'oberflaeche', l: 'Oberfläche O anzeigen', typ: 'check' },
    { k: 'r3', l: '🔄 Gedrehte 3D-Ansicht (aus = wieder Schrägbild) – gewählten Körper mit dem Finger ziehen dreht ihn', typ: 'check' }, { k: 'dy', l: 'Drehung (°)', typ: 'zahl', min: -360, max: 360 }, { k: 'dp', l: 'Neigung (°)', typ: 'zahl', min: -90, max: 90 }]);
  Bk.gen = (d0, P) => {
    const d = d0.r3 ? { ...d0, kanten: false } : d0; /* gedreht: Kantenbeschriftung passt nicht zur Lage */
    const g = alt(d, P); if (!d.volumen && !d.oberflaeche && !d.kanten) return g;
    const dd = { ...Bk.def, ...d }, z = v => T.zahl(v, 1), [V, O, ca] = VO[k](dd), gl = ca ? ' ≈ ' : ' = ';
    const L = versatz(d), unten = d.kanten ? 30 : 0;
    let s = g.svg.replace('<svg ', `<svg x="${L}" y="0" `);
    if (d.kanten) {
      const A = KG[k].anker(dd, g);
      for (const q of KANTEN[k](dd)) {
        const a = [L + A[0] + q.p1[0], A[1] + q.p1[1]], b = [L + A[0] + q.p2[0], A[1] + q.p2[1]], o = 30 + (q.off || 0);
        if (q.gestr) s += ln(a[0], a[1], b[0], b[1], P.acc, 2.5, 'stroke-dasharray="7 5"');
        const x = (a[0] + b[0]) / 2 + q.n[0] * o, y = (a[1] + b[1]) / 2 + q.n[1] * o;
        s += tx(x, y, q.t + ' = ' + z(q.v) + ' cm', P.acc, 23, q.n[0] > 0.3 ? 'start' : q.n[0] < -0.3 ? 'end' : 'middle', 'font-weight="700"');
      }
    }
    const zeilen = [d.volumen ? 'V' + gl + z(V) + ' cm³' : '', d.oberflaeche ? 'O' + gl + z(O) + ' cm²' : ''].filter(Boolean);
    const W = Math.max(g.w + 2 * L, 300), H = g.h + unten + (zeilen.length ? 10 + zeilen.length * 36 : 0);
    s += zeilen.map((t, i) => tx(W / 2, g.h + unten + 24 + i * 36, t, P.ink, 26, 'middle', 'font-weight="700"')).join('');
    void f;
    return { ...g, svg: doc(W, H, s), w: W, h: H };
  };
  const altS = Bk.schnell;
  // Symbolzeile: 📏 Kanten · 📦 Volumen · 🧱 Oberfläche – ein Tipp schaltet um
  const schalter = (akt, k) => b => { const o = akt(); if (!o) return; T.bausteinAendern(o, { f: dd => ({ d: { ...dd, [k]: !dd[k] } }) }); const n = akt(); b.classList.toggle('on', !!(n && n.d[k])); };
  Bk.schnell = d => [{ el: akt => T.chipZeile ? T.chipZeile([
    { sym: '🔄', title: 'Drehen: an = Körper mit dem Finger ziehen dreht ihn (waagerecht rundherum, senkrecht neigen), verschieben am ✥ · aus = wieder Schrägbild', an: !!d.r3, fn: schalter(akt, 'r3') },
    { sym: '📏', title: 'Kantenlängen (bzw. r, h) mit Wert', an: !!d.kanten, fn: schalter(akt, 'kanten') },
    { sym: '📦', title: 'Volumen V', an: !!d.volumen, fn: schalter(akt, 'volumen') },
    { sym: '🧱', title: 'Oberfläche O', an: !!d.oberflaeche, fn: schalter(akt, 'oberflaeche') }]) : document.createElement('span') }]
    .concat(typeof altS === 'function' ? altS(d) : altS || []);
}
// Griffe in Tafel-Koordinaten (für Zeichnen und Antippen)
T.koerperGriffe = o => {
  const K = o && o.t === 'o' && !o.fest && KG[o.k]; if (!K) return [];
  const d = daten(o);
  if (d.r3) return []; /* 🔄 gedreht: der ganze Körper ist der Griff (ziehen dreht) */
  const g = T.genObj(o.k, d, false), A = anker(K, o.k, d);
  return K.griffe(d).map(q => { const [x, y] = T.svgZuWelt(o, g, A[0] + q.at[0], A[1] + q.at[1]); return { ...q, x, y, name: NAME[q.k] || q.k }; });
};
T.koerperGriffAt = (o, x, y, r) => T.koerperGriffe(o).find(q => Math.hypot(q.x - x, q.y - y) <= r) || null;
// Ziehen: Maß aus dem Abstand zum Anker entlang der Griffrichtung; Anker bleibt an seiner Stelle auf der Tafel
T.koerperGriffZiehen = (o0, q) => {
  if (q.k === 'dreh') { /* waagerecht ziehen = um die senkrechte Achse drehen (360°), senkrecht ziehen = neigen */
    const d0 = daten(o0), y0 = d0.dy == null ? 30 : +d0.dy, p0 = d0.dp == null ? 20 : +d0.dp, z = T.page().view.z || 1; let snapped = false, zuletzt = '';
    return {
      move(wx, wy) {
        let dy = Math.round(y0 + (wx - q.x) * z * 0.6) % 360; if (dy < 0) dy += 360;
        const dp = T.clamp(Math.round(p0 + (wy - q.y) * z * 0.6), -90, 90), sig = dy + '/' + dp;
        T.overlay.label = { x: wx, y: wy, t: '⟳ ' + dy + '° · ↕ ' + dp + '°' };
        if (sig === zuletzt) { T.renderOver(); return; }
        if (!snapped) { T.snap(); snapped = true; } zuletzt = sig;
        const o = T.page().items.find(i => i.id === o0.id) || o0, n = { ...o, d: { ...o.d, r3: true, dy, dp } };
        if (!o.d.r3) { const g0 = T.genObj(o.k, o.d, false), g1 = T.genObj(o.k, n.d, false), s = o.w / g0.w, cx = o.x + o.w / 2, cy = o.y + o.h / 2; n.w = g1.w * s; n.h = g1.h * s; n.x = cx - n.w / 2; n.y = cy - n.h / 2; } /* erstes Drehen: Schrägbild → 3D-Ansicht, Mitte bleibt */
        T.replaceItem(n); T.render(); T.renderOver();
      },
      up() { T.overlay.label = null; T.renderOver(); if (snapped) T.changed && T.changed(); }
    };
  }
  const K = KG[o0.k], B = T.BAUSTEINE[o0.k], d0 = daten(o0), g0 = T.genObj(o0.k, d0, false), s = o0.w / g0.w, A0 = anker(K, o0.k, d0);
  const W0 = T.svgZuWelt(o0, g0, A0[0], A0[1]), feld = (B.felder || []).find(f => f.k === q.k) || {}, lo = feld.min || 0.5, hi = feld.max || 30;
  const a = (o0.r || 0) * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
  let snapped = false, zuletzt = d0[q.k];
  return {
    move(wx, wy) {
      // Zeiger → Bildkoordinaten des Körpers beim Anfassen
      const dx = wx - (o0.x + o0.w / 2), dy = wy - (o0.y + o0.h / 2), lx = dx * co + dy * si, ly = -dx * si + dy * co;
      const sx = lx / s + g0.w / 2, sy = ly / s + g0.h / 2;
      let v = ((sx - A0[0]) * q.u[0] + (sy - A0[1]) * q.u[1]) / q.pro;
      v = T.clamp(Math.round(v * 2) / 2, lo, hi);
      T.overlay.label = { x: wx, y: wy, t: (NAME[q.k] || q.k) + ' = ' + String(v).replace('.', ',') + ' cm' };
      if (v === zuletzt) { T.renderOver(); return; }
      if (!snapped) { T.snap(); snapped = true; }
      zuletzt = v;
      const d = { ...o0.d, [q.k]: v }, g = T.genObj(o0.k, { ...B.def, ...d }, false), A = anker(K, o0.k, { ...B.def, ...d }), w = g.w * s, h = g.h * s;
      const ox = (A[0] - g.w / 2) * s, oy = (A[1] - g.h / 2) * s, cx = W0[0] - (ox * co - oy * si), cy = W0[1] - (ox * si + oy * co);
      T.replaceItem({ ...o0, d, w, h, x: cx - w / 2, y: cy - h / 2 });
      T.render(); T.renderOver();
    },
    up() { T.overlay.label = null; T.renderOver(); if (snapped) T.changed && T.changed(); }
  };
};
})();
