// Tafel-App – 📐 Figur mit einstellbaren Winkeln (Einfügen › Mathe): Dreieck, Trapez, Parallelogramm, Raute, Rechteck.
// Winkel antippen › ＋/− (ohne Tastatur); die übrigen Winkel rechnet die Figur fachlich richtig mit
// (Dreieck: γ = 180° − α − β · Trapez: α + δ = β + γ = 180° · Parallelogramm/Raute: gegenüberliegende Winkel gleich).
// Je Winkel wählbar: Wert, „?“, nur Name (α) oder leer – z. B. für „Berechne den fehlenden Winkel“.
'use strict';
(function () {
if (!T.BAUSTEINE || !T._svg) return;
const B = T.BAUSTEINE, CM = T.CM, { doc, tx, f } = T._svg;
const RAD = Math.PI / 180, z1 = v => String(Math.round(v * 10) / 10).replace('.', ',');
const FORMEN = [['dreieck', '△ Dreieck'], ['trapez', '⏢ Trapez'], ['parallelogramm', '▱ Parallelogramm'], ['raute', '◇ Raute'], ['rechteck', '▭ Rechteck']];
const GRIECH = ['α', 'β', 'γ', 'δ'], ECKE = ['A', 'B', 'C', 'D'];
const zahl = (d, k, lo, hi, std) => T.clamp(+d[k] || std, lo, hi);

// Ecken in cm (y nach oben, A unten links, B unten rechts), Innenwinkel W, Seitennamen
function figur(d) {
  const a = zahl(d, 'a', 1, 20, 7), b = zahl(d, 'b', 1, 20, 4), al = zahl(d, 'alpha', 5, 175, 60);
  if (d.form === 'dreieck') {
    const be = Math.min(zahl(d, 'beta', 5, 175, 50), 175 - al), ga = 180 - al - be, bl = a * Math.sin(be * RAD) / Math.sin(ga * RAD); // b = c · sin β / sin γ
    return { P: [[0, 0], [a, 0], [bl * Math.cos(al * RAD), bl * Math.sin(al * RAD)]], W: [al, be, ga], S: ['c', 'a', 'b'] }; // Seite AB = c, BC = a, CA = b
  }
  if (d.form === 'trapez') {
    const be = zahl(d, 'beta', 5, 175, 70), cot = w => Math.cos(w * RAD) / Math.sin(w * RAD);
    let hh = zahl(d, 'h', 0.5, 15, 3.5); const k = cot(al) + cot(be); if (k > 0) hh = Math.min(hh, (a - 0.5) / k); // obere Seite c bleibt > 0
    return { P: [[0, 0], [a, 0], [a - hh * cot(be), hh], [hh * cot(al), hh]], W: [al, be, 180 - be, 180 - al], S: ['a', 'b', 'c', 'd'], hh };
  }
  if (d.form === 'parallelogramm' || d.form === 'raute') {
    const s = d.form === 'raute' ? a : b, D = [s * Math.cos(al * RAD), s * Math.sin(al * RAD)];
    return { P: [[0, 0], [a, 0], [a + D[0], D[1]], D], W: [al, 180 - al, al, 180 - al], S: ['a', 'b', 'c', 'd'] };
  }
  return { P: [[0, 0], [a, 0], [a, b], [0, b]], W: [90, 90, 90, 90], S: ['a', 'b', 'c', 'd'] }; // Rechteck
}

B.figur = { name: 'Figur (Winkel einstellbar)', gruppe: 'Mathe',
  def: { form: 'dreieck', a: 10, b: 5, h: 4.5, alpha: 60, beta: 50, ecken: true, seiten: false, wz: {} },
  felder: [{ k: 'form', l: 'Figur', typ: 'auswahl', opts: FORMEN },
    { k: 'a', l: 'Grundseite AB (cm)', typ: 'zahl', min: 1, max: 20 },
    { k: 'b', l: 'Seite AD (cm) – Parallelogramm, Rechteck', typ: 'zahl', min: 1, max: 20 },
    { k: 'h', l: 'Höhe (cm) – Trapez', typ: 'zahl', min: 0.5, max: 15 },
    { k: 'alpha', l: 'Winkel α (°)', typ: 'zahl', min: 5, max: 175 }, { k: 'beta', l: 'Winkel β (°) – Dreieck, Trapez', typ: 'zahl', min: 5, max: 175 },
    { k: 'ecken', l: 'Eckpunkte A, B, C … beschriften', typ: 'check' }, { k: 'seiten', l: 'Seitenlängen anzeigen', typ: 'check' }],
  gen: (d, P) => {
    P = T.palette(false); // immer weiß hinterlegt
    const F = figur(d), n = F.P.length, m = 90, ink = P.ink;
    const xs = F.P.map(p => p[0]), ys = F.P.map(p => p[1]), x0 = Math.min(...xs), y1 = Math.max(...ys);
    const W = (Math.max(...xs) - x0) * CM + 2 * m, H = (y1 - Math.min(...ys)) * CM + 2 * m;
    const S = F.P.map(([x, y]) => [m + (x - x0) * CM, m + (y1 - y) * CM]), mx = S.reduce((s, p) => s + p[0], 0) / n, my = S.reduce((s, p) => s + p[1], 0) / n;
    const laenge = i => Math.hypot(F.P[(i + 1) % n][0] - F.P[i][0], F.P[(i + 1) % n][1] - F.P[i][1]);
    let s = `<rect x="0" y="0" width="${f(W)}" height="${f(H)}" fill="#ffffff"/>`;
    s += `<polygon points="${S.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="#eaf2fe" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>`;
    const teile = [];
    // Seiten: Länge (wenn eingeschaltet), antippbar
    for (let i = 0; i < n; i++) {
      const p = S[i], q = S[(i + 1) % n], cx = (p[0] + q[0]) / 2, cy = (p[1] + q[1]) / 2;
      let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      if ((cx - mx) * nx + (cy - my) * ny < 0) { nx = -nx; ny = -ny; } // nach außen
      if (d.seiten) s += tx(cx + nx * 26, cy + ny * 26, F.S[i] + ' = ' + z1(laenge(i)) + ' cm', '#1d4ed8', 22, 'middle', 'font-weight="600"');
      teile.push({ id: 's' + i, x: cx - 40, y: cy - 30, w: 80, h: 60 });
    }
    // Winkel: Bogen (90° als Quadrat mit Punkt), Beschriftung je nach Zustand
    const wz = d.wz || {};
    for (let i = 0; i < n; i++) {
      const V = S[i], A = S[(i + n - 1) % n], C = S[(i + 1) % n];
      const d1 = [A[0] - V[0], A[1] - V[1]], d2 = [C[0] - V[0], C[1] - V[1]], l1 = Math.hypot(...d1), l2 = Math.hypot(...d2);
      const u1 = [d1[0] / l1, d1[1] / l1], u2 = [d2[0] / l2, d2[1] / l2], r = Math.min(0.9 * CM, Math.min(l1, l2) * 0.32);
      const w = Math.round(F.W[i] * 10) / 10, mid = [u1[0] + u2[0], u1[1] + u2[1]], ml = Math.hypot(...mid) || 1, bis = [mid[0] / ml, mid[1] / ml];
      if (Math.abs(w - 90) < 0.05) {
        const q = r * 0.62, e1 = [V[0] + u1[0] * q, V[1] + u1[1] * q], e2 = [V[0] + u2[0] * q, V[1] + u2[1] * q], e3 = [e1[0] + u2[0] * q, e1[1] + u2[1] * q];
        s += `<path d="M ${f(e1[0])} ${f(e1[1])} L ${f(e3[0])} ${f(e3[1])} L ${f(e2[0])} ${f(e2[1])}" fill="none" stroke="#b45309" stroke-width="2.5"/><circle cx="${f(V[0] + bis[0] * q * 0.7)}" cy="${f(V[1] + bis[1] * q * 0.7)}" r="3.5" fill="#b45309"/>`;
      } else {
        const sweep = u1[0] * u2[1] - u1[1] * u2[0] > 0 ? 1 : 0;
        s += `<path d="M ${f(V[0] + u1[0] * r)} ${f(V[1] + u1[1] * r)} A ${f(r)} ${f(r)} 0 0 ${sweep} ${f(V[0] + u2[0] * r)} ${f(V[1] + u2[1] * r)} L ${f(V[0])} ${f(V[1])} Z" fill="#fde68a" fill-opacity=".55" stroke="#b45309" stroke-width="2.5"/>`;
      }
      const z = wz[i] || 'zahl', txt = z === 'leer' ? '' : z === 'name' ? GRIECH[i] : z === 'frage' ? GRIECH[i] + ' = ?' : GRIECH[i] + ' = ' + z1(w) + '°';
      const tr = r + 30; if (txt) s += tx(V[0] + bis[0] * tr, V[1] + bis[1] * tr, txt, '#92400e', 20, 'middle', 'font-weight="700"');
      if (d.ecken !== false) { const ex = V[0] - mx, ey = V[1] - my, el = Math.hypot(ex, ey) || 1; s += tx(V[0] + ex / el * 30, V[1] + ey / el * 30, ECKE[i], ink, 26, 'middle', 'font-weight="700"'); }
      teile.push({ id: 'w' + i, x: V[0] + bis[0] * (r * 0.6) - 50, y: V[1] + bis[1] * (r * 0.6) - 40, w: 100, h: 80 }); // Winkel liegen über den Seiten (Vorrang beim Antippen)
    }
    return { svg: doc(W, H, s), w: W, h: H, teile };
  } };

// Winkel i um dw ändern – die anderen Winkel rechnen mit
function winkelAendern(d, i, dw) {
  const al = zahl(d, 'alpha', 5, 175, 60), be = zahl(d, 'beta', 5, 175, 50), r = v => Math.round(v * 10) / 10;
  if (d.form === 'dreieck') {
    if (i === 0) d.alpha = r(T.clamp(al + dw, 5, 175 - Math.min(be, 170)));
    else if (i === 1) d.beta = r(T.clamp(be + dw, 5, 175 - al));
    else d.beta = r(T.clamp(be - dw, 5, 175 - al)); // γ größer → β kleiner (α bleibt)
  } else if (d.form === 'trapez') {
    if (i === 0) d.alpha = r(T.clamp(al + dw, 5, 175)); else if (i === 1) d.beta = r(T.clamp(be + dw, 5, 175));
    else if (i === 2) d.beta = r(T.clamp(be - dw, 5, 175)); else d.alpha = r(T.clamp(al - dw, 5, 175));
  } else if (d.form === 'parallelogramm' || d.form === 'raute') d.alpha = r(T.clamp(al + (i % 2 ? -dw : dw), 5, 175));
  return d;
}
const wzSetzen = (d, i, z) => { const w = { ...(d.wz || {}) }; if (z === 'zahl') delete w[i]; else w[i] = z; return { ...d, wz: w }; };
B.figur.teil = (d, id) => {
  const i = +id.slice(1);
  if (id[0] === 'w') {
    const fest = d.form === 'rechteck';
    return (fest ? [] : [['＋1°', 1], ['−1°', -1], ['＋5°', 5], ['−5°', -5]].map(([l, dw]) => ({ l, f: dd => ({ d: winkelAendern({ ...dd }, i, dw) }) })))
      .concat([{ l: '🔢 Wert zeigen', f: dd => ({ d: wzSetzen(dd, i, 'zahl') }) }, { l: '❓ Als „?“', f: dd => ({ d: wzSetzen(dd, i, 'frage') }) },
        { l: '🔤 Nur Name (' + GRIECH[i] + ')', f: dd => ({ d: wzSetzen(dd, i, 'name') }) }, { l: '◻ Leer', f: dd => ({ d: wzSetzen(dd, i, 'leer') }) }]);
  }
  // Seite: Länge ändern, wo sie frei wählbar ist (sonst ergibt sie sich aus den Winkeln)
  const k = i === 0 ? 'a' : (d.form === 'parallelogramm' || d.form === 'rechteck') && i % 2 ? 'b' : d.form === 'raute' ? 'a' : null;
  if (!k) return [{ l: '📏 Seitenlängen ein/aus', f: dd => ({ d: { ...dd, seiten: !dd.seiten } }) }];
  return [['＋0,5 cm', 0.5], ['−0,5 cm', -0.5], ['＋1 cm', 1], ['−1 cm', -1]].map(([l, dl]) => ({ l, f: dd => ({ d: { ...dd, [k]: Math.round(T.clamp((+dd[k] || 4) + dl, 1, 20) * 10) / 10 } }) }))
    .concat([{ l: '📏 Seitenlängen ein/aus', f: dd => ({ d: { ...dd, seiten: !dd.seiten } }) }]);
};
const q = (l, fn) => ({ l, f: d => ({ d: fn({ ...d }) }) });
B.figur.schnell = d => FORMEN.filter(([k]) => k !== d.form).map(([k, l]) => q(l, dd => { dd.form = k; if (k === 'trapez' && (+dd.beta || 0) < 30) dd.beta = 70; return dd; }))
  .concat(d.form === 'trapez' ? [q('⇕ Höhe +0,5 cm', dd => { dd.h = Math.min(15, (+dd.h || 3.5) + 0.5); return dd; }), q('⇕ Höhe −0,5 cm', dd => { dd.h = Math.max(0.5, (+dd.h || 3.5) - 0.5); return dd; })] : [])
  .concat([q('📏 Seitenlängen ein/aus', dd => { dd.seiten = !dd.seiten; return dd; }), q('🅰 Eckpunkte ein/aus', dd => { dd.ecken = dd.ecken === false; return dd; }),
    q('❓ Alle Winkel als „?“', dd => { dd.wz = { 0: 'frage', 1: 'frage', 2: 'frage', 3: 'frage' }; return dd; }), q('🔢 Alle Winkel zeigen', dd => { dd.wz = {}; return dd; }),
    d.form === 'rechteck' ? null : q('🎲 Zufällige Winkel', dd => { const R = (lo, hi) => lo + Math.round(Math.random() * (hi - lo));
      if (dd.form === 'dreieck') { dd.alpha = R(25, 95); dd.beta = R(25, Math.min(110, 160 - dd.alpha)); } else if (dd.form === 'trapez') { dd.alpha = R(45, 115); dd.beta = R(45, 115); } else dd.alpha = R(40, 80);
      return dd; })].filter(Boolean));
T.figurDaten = figur; /* für Tests */
})();
