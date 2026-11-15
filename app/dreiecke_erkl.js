// Tafel-App – 🔺 Dreiecke erklärt: große Bildtafeln (selbst gezeichnet, SVG) für die Mathe-Tafel
// Übersicht (nach Seiten / nach Winkeln) · gleichschenkliges Dreieck · gleichseitiges (= gleichwinkliges) Dreieck
// Gleich lange Seiten: gleiche Anzahl Striche; gleich große Winkel: gleiche Anzahl Bögen (übliche Schulschreibweise).
'use strict';
(function () {
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const W = 1000, BLAU = '#1565c0', ROT = '#d32f2f', GRUEN = '#2e7d32', RAND = '#3a6d99';
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const linie = (a, b, col, w, extra = '') => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const dreieck = (P, col, w, fuell) => `<polygon points="${P.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${fuell || 'none'}" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"/>`;
/* gleich lange Seiten: n kleine Striche quer zur Seite in der Mitte */
function striche(a, b, n, col, gr = 14) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l, nx = -uy, ny = ux;
  let s = ''; for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 8; const cx = mx + ux * o, cy = my + uy * o; s += linie([cx - nx * gr / 2, cy - ny * gr / 2], [cx + nx * gr / 2, cy + ny * gr / 2], col, 3); }
  return s;
}
/* Winkelbogen am Punkt V zwischen den Richtungen zu A und B (der kleinere Winkel), n Bögen = gleich große Winkel */
function bogen(V, A, B, r, col, n = 1, recht = false) {
  if (recht) { const u = norm(A, V), v = norm(B, V), q = r * 0.7; return `<path d="M ${f(V[0] + u[0] * q)} ${f(V[1] + u[1] * q)} L ${f(V[0] + (u[0] + v[0]) * q)} ${f(V[1] + (u[1] + v[1]) * q)} L ${f(V[0] + v[0] * q)} ${f(V[1] + v[1] * q)}" fill="none" stroke="${col}" stroke-width="3"/><circle cx="${f(V[0] + (u[0] + v[0]) * q * 0.5)}" cy="${f(V[1] + (u[1] + v[1]) * q * 0.5)}" r="3.5" fill="${col}"/>`; }
  const a1 = Math.atan2(A[1] - V[1], A[0] - V[0]), a2 = Math.atan2(B[1] - V[1], B[0] - V[0]); let d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
  let s = ''; for (let i = 0; i < n; i++) { const rr = r + i * 7; s += `<path d="M ${f(V[0] + rr * Math.cos(a1))} ${f(V[1] + rr * Math.sin(a1))} A ${rr} ${rr} 0 0 ${d > 0 ? 1 : 0} ${f(V[0] + rr * Math.cos(a2))} ${f(V[1] + rr * Math.sin(a2))}" fill="none" stroke="${col}" stroke-width="3"/>`; }
  return s;
}
const norm = (A, V) => { const l = Math.hypot(A[0] - V[0], A[1] - V[1]); return [(A[0] - V[0]) / l, (A[1] - V[1]) / l]; };
/* Beschriftung eines Winkels innen (auf der Winkelhalbierenden) */
const winkelText = (V, A, B, t, col, abst = 52) => { const u = norm(A, V), v = norm(B, V), w = [u[0] + v[0], u[1] + v[1]], l = Math.hypot(w[0], w[1]) || 1; return mitte(V[0] + w[0] / l * abst, V[1] + w[1] / l * abst, t, 24, col, 'font-weight="700" font-style="italic" stroke="#fff" stroke-opacity=".85" stroke-width="6" paint-order="stroke"'); };
/* Seitenname außen neben der Seitenmitte */
const seitenText = (a, b, t, innen, col = BLAU) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny); nx /= l; ny /= l;
  if ((innen[0] - mx) * nx + (innen[1] - my) * ny > 0) { nx = -nx; ny = -ny; } return text(mx + nx * 22, my + ny * 22, t, 24, col, 'text-anchor="' + (nx < -0.4 ? 'end' : nx > 0.4 ? 'start' : 'middle') + '" font-weight="700" font-style="italic"'); };
/* Zeilen für die Merksätze rechts umbrechen (ca. 30 Zeichen bei Schriftgröße 27) */
const umbruch = (z, max = 30) => { const out = []; let cur = ''; for (const w of z.split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } out.push(cur); return out; };
/* kleine Zeichen vor den Merksätzen: Striche (gleich lange Seiten), Bögen (gleich große Winkel), gestrichelte Achse */
const ZEICHEN = {
  striche: (x, y) => linie([x, y + 12], [x + 44, y + 12], BLAU, 4) + linie([x + 18, y + 2], [x + 18, y + 22], ROT, 3) + linie([x + 26, y + 2], [x + 26, y + 22], ROT, 3),
  boegen: (x, y) => `<path d="M ${x} ${y + 24} L ${x + 44} ${y + 24} M ${x} ${y + 24} L ${x + 34} ${y - 4}" stroke="${BLAU}" stroke-width="4" fill="none" stroke-linecap="round"/>` + `<path d="M ${x + 22} ${y + 24} A 22 22 0 0 0 ${f(x + 17)} ${f(y + 10)}" stroke="${GRUEN}" stroke-width="3" fill="none"/><path d="M ${x + 29} ${y + 24} A 29 29 0 0 0 ${f(x + 22)} ${f(y + 6)}" stroke="${GRUEN}" stroke-width="3" fill="none"/>`,
  achse: (x, y) => linie([x + 22, y - 6], [x + 22, y + 30], ROT, 3, 'stroke-dasharray="7 5"'),
  name: (x, y) => mitte(x + 22, y + 12, 'Aa', 22, BLAU, 'font-weight="700" font-style="italic"'),
  grad: (x, y) => mitte(x + 22, y + 12, '60°', 22, GRUEN, 'font-weight="700"')
};
/* Tafel: Bild links, kurze Merksätze rechts mit viel Abstand, unten ein Merke-Kasten */
function tafel(titel, bild, punkte, merke, P, extra) {
  const x0 = 560, top = 120; let y = top, s = '';
  for (const [zeichen, satz] of punkte) {
    const zl = umbruch(satz); if (zeichen && ZEICHEN[zeichen]) s += ZEICHEN[zeichen](x0, y - 12);
    zl.forEach((z, i) => { s += text(x0 + 62, y + i * 34, z, 27, P.ink); });
    y += zl.length * 34 + 46;
  }
  let yE = Math.max(y, 520); if (extra) { s += extra.svg(yE + 10); yE += extra.h + 10; } /* z. B. Beispiel-Dreiecke unter Bild und Merksätzen */
  const H = yE + (merke ? 90 : 20);
  let g = `<rect x="0" y="0" width="${W}" height="${H}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 44, '🔺 ' + titel, 34, P.ink, 'font-weight="700"') + bild + s;
  if (merke) g += `<rect x="30" y="${H - 80}" width="${W - 60}" height="58" rx="12" fill="rgba(46,125,50,.1)" stroke="${GRUEN}" stroke-width="2"/>` + text(52, H - 51, '💡 Merke: ' + merke, 26, P.ink, 'font-weight="700"');
  return { svg: T._svg.doc(W, H, g), w: W, h: H };
}
/* Beispiele gleichschenkliger Dreiecke – maßstabsgetreue Winkel: zwei gleiche Basiswinkel, die Spitze ergibt sich aus 180° */
const BEISPIELE = P => ({ h: 272, svg: y0 => {
  let s = `<line x1="30" y1="${y0}" x2="${W - 30}" y2="${y0}" stroke="${RAND}" stroke-width="1.5" stroke-opacity=".5"/>` + text(30, y0 + 30, 'Beispiele – die drei Winkel ergeben zusammen immer 180°:', 22, RAND, 'font-weight="700"');
  [[70, 'spitzwinklig'], [45, 'rechtwinklig'], [30, 'stumpfwinklig'], [60, 'auch gleichseitig!']].forEach(([bw, art], i) => {
    const cx = 130 + i * 247, gy = y0 + 196, t = Math.tan(bw * Math.PI / 180), halb = Math.min(100, 130 / t), hh = halb * t, sp = 180 - 2 * bw;
    const A = [cx - halb, gy], B = [cx + halb, gy], C = [cx, gy - hh], gleichS = bw === 60;
    s += dreieck([A, B, C], BLAU, 3.5, 'rgba(21,101,192,.07)') + striche(A, C, 1, ROT) + striche(B, C, 1, ROT) + (gleichS ? striche(A, B, 1, ROT) : '');
    s += bogen(A, B, C, 26, GRUEN, 2) + bogen(B, A, C, 26, GRUEN, 2) + (sp === 90 ? bogen(C, A, B, 18, '#6a1b9a', 1, true) : bogen(C, A, B, 22, '#6a1b9a'));
    s += mitte(cx, gy + 26, bw + '° + ' + bw + '° + ' + sp + '° = 180°', 19, P.ink, 'font-weight="700"') + mitte(cx, gy + 50, art, 19, gleichS ? ROT : '#475569', gleichS ? 'font-weight="700"' : '');
  });
  return s; } });
/* 🖐 Dreieck verändern: Ecken A, B, C ziehen – Winkel (ganze Grad, Summe genau 180°), Seiten und Dreiecksart rechnen live mit */
const PX = 40, FELD = { x0: 60, y0: 110, x1: 440, y1: 580 }, ORANGE = '#ef6c00', WF = ['#2e7d32', '#6a1b9a', '#00838f'], GR = ['α', 'β', 'γ'];
const ECKEN_STD = { A: [90, 520], B: [430, 520], C: [290, 190] };
const ecken = d => ['A', 'B', 'C'].map(k => Array.isArray(d && d[k]) && d[k].length === 2 && isFinite(d[k][0]) && isFinite(d[k][1]) ? [+d[k][0], +d[k][1]] : ECKEN_STD[k]);
const abst = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
const winkelBei = (V, X, Y) => { const u = [X[0] - V[0], X[1] - V[1]], v = [Y[0] - V[0], Y[1] - V[1]]; return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))))) * 180 / Math.PI; };
/* Seite i liegt der Ecke i gegenüber (a = BC, b = CA, c = AB); gleiche Seiten mit Toleranz 0,5 Bildpunkte */
function analyse(E) {
  const [A, B, C] = E, s = [abst(B, C), abst(C, A), abst(A, B)], w = [winkelBei(A, B, C), winkelBei(B, C, A), winkelBei(C, A, B)];
  const gl = [[0, 1], [1, 2], [0, 2]].filter(([i, j]) => Math.abs(s[i] - s[j]) < 0.5), seiten = gl.length >= 2 ? 3 : gl.length;
  let g = [];
  if (seiten === 3) g = [60, 60, 60];
  else if (seiten === 1) { const [i, j] = gl[0], b = Math.round((w[i] + w[j]) / 2); g[i] = g[j] = b; g[3 - i - j] = 180 - 2 * b; } /* gleiche Basiswinkel */
  else {
    const r = w.findIndex(x => Math.abs(x - 90) < 0.3);
    if (r >= 0) { const [i, j] = [0, 1, 2].filter(x => x !== r); g[r] = 90; g[i] = Math.round(w[i]); g[j] = 90 - g[i]; }
    else { g = w.map(Math.floor); const rest = 180 - g[0] - g[1] - g[2]; [0, 1, 2].sort((x, y) => (w[y] - Math.floor(w[y])) - (w[x] - Math.floor(w[x]))).slice(0, rest).forEach(i => { g[i]++; }); } /* größte Reste aufrunden: Summe genau 180° */
  }
  const L = s.map(x => x / PX);
  if (seiten === 3) L.fill((L[0] + L[1] + L[2]) / 3); else if (seiten === 1) { const [i, j] = gl[0]; L[i] = L[j] = (L[i] + L[j]) / 2; }
  const max = Math.max(...g);
  return { s, w, g, gl, seiten, cm: L.map(v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',')), art: max === 90 ? 'rechtwinklig' : max > 90 ? 'stumpfwinklig' : 'spitzwinklig', gross: g.indexOf(max) };
}
const gueltig = E => [0, 1, 2].every(i => abst(E[i], E[(i + 1) % 3]) >= 40) && [0, 1, 2].every(i => winkelBei(E[i], E[(i + 1) % 3], E[(i + 2) % 3]) >= 2);
/* Einrasten der gezogenen Ecke: rechter Winkel (Thaleskreis bzw. Senkrechte) und gleich lange Seiten (Mittelsenkrechte bzw. Kreis) – Schnittpunkte zuerst */
function einrasten(p, P, Q) {
  const d = abst(P, Q), M = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], u = [(Q[0] - P[0]) / d, (Q[1] - P[1]) / d], n = [-u[1], u[0]];
  const K = [{ k: [M, d / 2] }, { l: [P, n] }, { l: [Q, n] }, { l: [M, n] }, { k: [P, d] }, { k: [Q, d] }];
  const proj = c => { if (c.l) { const [o, v] = c.l, t = (p[0] - o[0]) * v[0] + (p[1] - o[1]) * v[1]; return [o[0] + v[0] * t, o[1] + v[1] * t]; }
    const [m, r] = c.k, l = abst(m, p) || 1; return [m[0] + (p[0] - m[0]) / l * r, m[1] + (p[1] - m[1]) / l * r]; };
  const schnitt = (c1, c2) => {
    if (c1.l && c2.l) return []; /* alle drei Geraden sind parallel */
    if (c1.k && c2.k) { const [m1, r1] = c1.k, [m2, r2] = c2.k, e = abst(m1, m2); if (e < 1e-9 || e > r1 + r2 || e < Math.abs(r1 - r2)) return [];
      const a = (r1 * r1 - r2 * r2 + e * e) / (2 * e), h = Math.sqrt(Math.max(0, r1 * r1 - a * a)), ex = (m2[0] - m1[0]) / e, ey = (m2[1] - m1[1]) / e, bx = m1[0] + ex * a, by = m1[1] + ey * a;
      return [[bx - ey * h, by + ex * h], [bx + ey * h, by - ex * h]]; }
    const L = c1.l || c2.l, Kk = c1.k || c2.k, [o, v] = L, [m, r] = Kk, w0 = [o[0] - m[0], o[1] - m[1]], bb = w0[0] * v[0] + w0[1] * v[1], cc = w0[0] * w0[0] + w0[1] * w0[1] - r * r, D = bb * bb - cc;
    if (D < 0) return []; const q = Math.sqrt(D); return [-bb - q, -bb + q].map(t => [o[0] + v[0] * t, o[1] + v[1] * t]);
  };
  const naechster = (liste, R) => liste.filter(q => abst(q, p) <= R).sort((x, y) => abst(x, p) - abst(y, p))[0];
  const zwei = []; for (let i = 0; i < K.length; i++) for (let j = i + 1; j < K.length; j++) zwei.push(...schnitt(K[i], K[j]));
  return naechster(zwei, 20) || naechster(K.map(proj), 16) || p;
}
const knopf = V => `<circle cx="${f(V[0])}" cy="${f(V[1])}" r="30" fill="none" stroke="${ORANGE}" stroke-width="3" stroke-opacity=".45"/><circle cx="${f(V[0])}" cy="${f(V[1])}" r="21" fill="${ORANGE}" fill-opacity=".92" stroke="#fff" stroke-width="4"/><circle cx="${f(V[0])}" cy="${f(V[1])}" r="5" fill="#fff"/>`;
function veraendern(P, d) {
  const E = ecken(d), [A, B, C] = E, an = analyse(E), H = 760, x0 = 625, innen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
  let b = `<rect x="30" y="80" width="570" height="530" rx="12" fill="#fbfdff" stroke="#c9d8e8" stroke-width="1.5"/>`;
  for (let x = 70; x < 600; x += PX) b += `<line x1="${x}" y1="82" x2="${x}" y2="608" stroke="#dbe7f3" stroke-width="1"/>`;
  for (let y = 120; y < 610; y += PX) b += `<line x1="32" y1="${y}" x2="598" y2="${y}" stroke="#dbe7f3" stroke-width="1"/>`;
  b += dreieck(E, BLAU, 5, 'rgba(21,101,192,.08)');
  const seite = i => [E[(i + 1) % 3], E[(i + 2) % 3]];
  if (an.seiten === 3) [0, 1, 2].forEach(i => { b += striche(...seite(i), 2, ROT, 18); });
  else if (an.seiten === 1) an.gl[0].forEach(i => { b += striche(...seite(i), 1, ROT, 18); });
  [0, 1, 2].forEach(i => { const V = E[i], X = E[(i + 1) % 3], Y = E[(i + 2) % 3], n = an.seiten === 3 ? 3 : an.seiten === 1 && an.gl[0].includes(i) ? 2 : 1;
    b += an.g[i] === 90 ? bogen(V, X, Y, 54, WF[i], 1, true) : bogen(V, X, Y, 42, WF[i], n); /* außerhalb des Griffs, damit Bögen sichtbar bleiben */
    b += winkelText(V, X, Y, an.g[i] + '°', WF[i], Math.max(80, Math.min(135, 46 + 26 / Math.sin(an.w[i] * Math.PI / 360)))); });
  [0, 1, 2].forEach(i => { /* Seitenname außen – passt er nicht ins Zeichenfeld, dann innen neben die Seite */
    const [p, q] = seite(i), t = 'abc'[i] + ' = ' + an.cm[i] + ' cm', bw = t.length * 13.5, mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const l = Math.hypot(nx, ny); nx /= l; ny /= l;
    if ((innen[0] - mx) * nx + (innen[1] - my) * ny > 0) { nx = -nx; ny = -ny; }
    const lage = s => { const x = mx + s * nx * 24, y = my + s * ny * 24, an2 = s * nx < -0.4 ? 'end' : s * nx > 0.4 ? 'start' : 'middle', x0 = an2 === 'end' ? x - bw : an2 === 'start' ? x : x - bw / 2; return { x, y, an2, ok: x0 >= 36 && x0 + bw <= 594 && y >= 96 && y <= 596 }; };
    let L = lage(1); if (!L.ok) { const L2 = lage(-1); if (L2.ok) L = L2; }
    b += text(L.x, L.y, t, 24, BLAU, `text-anchor="${L.an2}" font-weight="700" font-style="italic" stroke="#fff" stroke-opacity=".85" stroke-width="6" paint-order="stroke"`); });
  E.forEach((V, i) => { const l = abst(innen, V) || 1; b += knopf(V) + mitte(V[0] + (V[0] - innen[0]) / l * 50, V[1] + (V[1] - innen[1]) / l * 50, 'ABC'[i], 28, P.ink, 'font-weight="700" stroke="#fff" stroke-opacity=".85" stroke-width="6" paint-order="stroke"'); });
  let s = text(x0, 108, '🖐 Ecken A, B, C ziehen!', 24, ORANGE, 'font-weight="700"');
  [0, 1, 2].forEach(i => { s += text(x0, 160 + i * 42, GR[i] + ' = ' + an.g[i] + '°', 30, WF[i], 'font-weight="700"') + text(x0 + 150, 160 + i * 42, '(bei ' + 'ABC'[i] + ')', 22, '#475569'); });
  s += text(x0, 296, an.g.join('° + ') + '° = 180°', 26, P.ink, 'font-weight="700"');
  s += `<line x1="${x0}" y1="328" x2="${W - 30}" y2="328" stroke="${RAND}" stroke-width="1.5" stroke-opacity=".5"/>`;
  const gW = GR[an.gross], wGrund = an.art === 'rechtwinklig' ? gW + ' ist genau 90°' : an.art === 'stumpfwinklig' ? gW + ' ist größer als 90°' : 'alle Winkel kleiner als 90°';
  const sArt = an.seiten === 3 ? 'gleichseitig' : an.seiten === 1 ? 'gleichschenklig' : 'unregelmäßig';
  const sGrund = an.seiten === 3 ? ['alle Seiten gleich lang', '(also auch gleichschenklig)'] : an.seiten === 1 ? ['2 Seiten gleich lang: ' + an.gl[0].map(i => 'abc'[i]).join(' = ')] : ['alle Seiten verschieden lang'];
  s += text(x0, 362, 'Nach den Winkeln:', 22, RAND, 'font-weight="700"') + text(x0, 398, an.art, 30, P.ink, 'font-weight="700"') + text(x0, 434, wGrund, 22, '#475569');
  s += text(x0, 492, 'Nach den Seiten:', 22, RAND, 'font-weight="700"') + text(x0, 528, sArt, 30, P.ink, 'font-weight="700"');
  sGrund.forEach((z, i) => { s += text(x0, 564 + i * 30, z, 22, '#475569'); });
  const g = `<rect x="0" y="0" width="${W}" height="${H}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 44, '🔺 Dreieck verändern', 34, P.ink, 'font-weight="700"') + b + s +
    `<rect x="30" y="${H - 80}" width="${W - 60}" height="58" rx="12" fill="rgba(46,125,50,.1)" stroke="${GRUEN}" stroke-width="2"/>` + text(52, H - 51, '💡 Merke: Die Winkelsumme im Dreieck beträgt 180°.', 26, P.ink, 'font-weight="700"');
  return { svg: T._svg.doc(W, H, g), w: W, h: H, teile: E.map((V, i) => ({ id: 'ecke' + 'ABC'[i], x: V[0] - 30, y: V[1] - 30, w: 60, h: 60, zieh: true })) };
}
function eckeZiehen(d, id, sx, sy) {
  const i = ['eckeA', 'eckeB', 'eckeC'].indexOf(id); if (d.thema !== 'veraendern' || i < 0 || !isFinite(sx) || !isFinite(sy)) return null;
  const E = ecken(d), roh = [Math.max(FELD.x0, Math.min(FELD.x1, sx)), Math.max(FELD.y0, Math.min(FELD.y1, sy))];
  let p = einrasten(roh, E[(i + 1) % 3], E[(i + 2) % 3]);
  if (p[0] < FELD.x0 || p[0] > FELD.x1 || p[1] < FELD.y0 || p[1] > FELD.y1) p = roh;
  const N = E.slice(); N[i] = p; if (!gueltig(N)) return null;
  const r = v => Math.round(v * 100) / 100;
  return { ...d, A: N[0].map(r), B: N[1].map(r), C: N[2].map(r) };
}
const THEMEN = [['uebersicht', 'Dreiecksarten'], ['gleichschenklig', 'Gleichschenkliges Dreieck'], ['gleichseitig', 'Gleichseitiges = gleichwinkliges Dreieck'], ['veraendern', 'Dreieck verändern']];
const ZEICHNE = {
  uebersicht: P => {
    /* zwei Reihen à drei Dreiecke, darunter Name und ein kurzer Satz */
    const zelle = (cx, cy, pts, name, satz, extra) => { const p = pts.map(([x, y]) => [cx + x, cy + y]);
      return dreieck(p, BLAU, 3.5, 'rgba(21,101,192,.07)') + (extra ? extra(p) : '') + mitte(cx, cy + 92, name, 24, P.ink, 'font-weight="700"') + mitte(cx, cy + 124, satz, 20, '#475569'); };
    const ung = [[-95, 55], [100, 55], [-30, -70]], gs = [[-70, 55], [70, 55], [0, -80]], gl = [[-80, 55], [80, 55], [0, 55 - 160 * Math.sin(Math.PI / 3)]];
    const sp = [[-85, 55], [85, 55], [15, -75]], re = [[-80, 55], [80, 55], [-80, -70]], st = [[-110, 55], [70, 55], [-70, 15]];
    let b = text(30, 100, 'Nach den Seiten', 24, RAND, 'font-weight="700"') + text(30, 410, 'Nach den Winkeln', 24, RAND, 'font-weight="700"');
    b += zelle(190, 210, ung, 'unregelmäßig', 'alle Seiten verschieden');
    b += zelle(500, 210, gs, 'gleichschenklig', '2 Seiten gleich lang', p => striche(p[0], p[2], 1, ROT) + striche(p[1], p[2], 1, ROT));
    b += zelle(810, 210, gl, 'gleichseitig', 'alle Seiten und Winkel gleich', p => striche(p[0], p[1], 2, ROT) + striche(p[1], p[2], 2, ROT) + striche(p[2], p[0], 2, ROT));
    b += zelle(190, 520, sp, 'spitzwinklig', 'alle Winkel kleiner als 90°', p => bogen(p[0], p[1], p[2], 26, GRUEN) + bogen(p[1], p[0], p[2], 26, GRUEN) + bogen(p[2], p[0], p[1], 26, GRUEN));
    b += zelle(500, 520, re, 'rechtwinklig', 'ein Winkel ist genau 90°', p => bogen(p[0], p[1], p[2], 26, GRUEN, 1, true));
    b += zelle(810, 520, st, 'stumpfwinklig', 'ein Winkel größer als 90°', p => bogen(p[2], p[0], p[1], 24, GRUEN));
    const H = 760;
    b += `<rect x="30" y="${H - 80}" width="${W - 60}" height="58" rx="12" fill="rgba(46,125,50,.1)" stroke="${GRUEN}" stroke-width="2"/>` + text(52, H - 51, '💡 Merke: Die drei Winkel ergeben zusammen immer 180°.', 26, P.ink, 'font-weight="700"');
    return { svg: T._svg.doc(W, H, `<rect x="0" y="0" width="${W}" height="${H}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 44, '🔺 Dreiecksarten', 34, P.ink, 'font-weight="700"') + b), w: W, h: H }; },
  gleichschenklig: P => {
    const A = [100, 470], B = [440, 470], C = [270, 120], M = [270, 470];
    let b = dreieck([A, B, C], BLAU, 5, 'rgba(21,101,192,.06)') + linie([270, 96], [270, 500], ROT, 3, 'stroke-dasharray="12 9"');
    b += striche(A, C, 1, ROT, 18) + striche(B, C, 1, ROT, 18) + bogen(A, B, C, 44, GRUEN, 2) + bogen(B, A, C, 44, GRUEN, 2) + bogen(M, C, B, 18, ROT, 1, true);
    b += seitenText(C, A, 'Schenkel', B) + seitenText(B, C, 'Schenkel', A) + mitte(185, 500, 'Basis', 24, BLAU, 'font-weight="700" font-style="italic"');
    return tafel('Gleichschenkliges Dreieck', b, [
      ['striche', 'Zwei Seiten sind gleich lang. Sie heißen Schenkel.'],
      ['name', 'Die dritte Seite heißt Basis.'],
      ['boegen', 'Die zwei Winkel an der Basis sind gleich groß. Der dritte Winkel ist meist anders.'],
      ['achse', 'Es hat eine Symmetrieachse.']], 'Nicht jedes gleichschenklige Dreieck ist gleichwinklig.', P, BEISPIELE(P)); },
  veraendern: (P, d) => veraendern(P, d || {}),
  gleichseitig: P => {
    const s = 360, A = [90, 480], B = [450, 480], C = [270, 480 - s * Math.sin(Math.PI / 3)];
    let b = dreieck([A, B, C], BLAU, 5, 'rgba(21,101,192,.06)');
    for (const [V, X, Y] of [[A, B, C], [B, C, A], [C, A, B]]) { const m = [(X[0] + Y[0]) / 2, (X[1] + Y[1]) / 2], u = norm(m, V); b += linie([V[0] - u[0] * 26, V[1] - u[1] * 26], [m[0] + u[0] * 26, m[1] + u[1] * 26], ROT, 2.5, 'stroke-dasharray="10 8" stroke-opacity=".7"'); }
    b += striche(A, B, 2, ROT, 18) + striche(B, C, 2, ROT, 18) + striche(C, A, 2, ROT, 18);
    b += bogen(A, B, C, 40, GRUEN, 3) + bogen(B, A, C, 40, GRUEN, 3) + bogen(C, A, B, 40, GRUEN, 3);
    b += winkelText(A, B, C, '60°', GRUEN, 84) + winkelText(B, A, C, '60°', GRUEN, 84) + winkelText(C, A, B, '60°', GRUEN, 84);
    return tafel('Gleichseitiges = gleichwinkliges Dreieck', b, [
      ['striche', 'Alle drei Seiten sind gleich lang: gleichseitig.'],
      ['boegen', 'Alle drei Winkel sind gleich groß: gleichwinklig.'],
      ['grad', 'Jeder Winkel ist 60°, denn 180° : 3 = 60°.'],
      ['achse', 'Es hat drei Symmetrieachsen.']], 'Gleichseitig und gleichwinklig gehören immer zusammen.', P); }
};
T.BAUSTEINE.dreieckerkl = { name: 'Dreiecke erklärt', gruppe: 'Mathe', def: { thema: 'uebersicht' },
  felder: [{ k: 'thema', l: 'Thema', typ: 'auswahl', opts: THEMEN }],
  gen: (d, P) => (ZEICHNE[d.thema] || ZEICHNE.uebersicht)(P, d),
  ziehen: (d, id, sx, sy) => eckeZiehen(d, id, sx, sy) };
T.dreieckErklMenue = () => {
  const h = T.h, bild = k => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj('dreieckerkl', { thema: k }, false).svg);
  const einfuegen = k => { T.closeDlg(); const g = T.genObj('dreieckerkl', { thema: k }, false), r = T.viewRect(), fz = Math.min(1, (r.x1 - r.x0) * 0.8 / g.w, (r.y1 - r.y0) * 0.8 / g.h), [cx, cy] = T.viewCenter();
    T.snap(); T.addItem({ t: 'o', id: T.uid(), k: 'dreieckerkl', d: { thema: k }, x: cx - g.w * fz / 2, y: cy - g.h * fz / 2, w: g.w * fz, h: g.h * fz, r: 0 }); T.render(); };
  const alle = () => { T.closeDlg(); T.snap(); const S = T.S, start = S.page + 1;
    THEMEN.forEach(([k, l], i) => { const g = T.genObj('dreieckerkl', { thema: k }, false), np = { ...T.newPage('weiss'), titel: 'Dreiecke: ' + l };
      np.items.push({ t: 'o', id: T.uid(), k: 'dreieckerkl', d: { thema: k }, x: 40, y: 30, w: g.w, h: g.h, r: 0 }); S.board.pages.splice(start + i, 0, np); });
    T.gotoPage(start); T.toast(THEMEN.length + ' Seiten zu Dreiecken eingefügt – mit ◀ ▶ blättern.', 3000); };
  T.openDlg([h('h2', {}, '🔺 Dreiecke erklärt'), h('p', { class: 'hint' }, 'Bildtafeln mit kurzen Merksätzen. Antippen fügt eine Tafel ein. Bei „Dreieck verändern“ lassen sich die Ecken ziehen.'),
    h('div', { class: 'tiles' }, ...THEMEN.map(([k, l]) => h('button', { class: 'tile', onclick: () => einfuegen(k) }, h('img', { src: bild(k), alt: '' }), l))),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Schließen'), h('button', { class: 'big', onclick: () => T.tafelnAufEineSeite('dreieckerkl', THEMEN.map(([k]) => ({ thema: k }))) }, '📜 Alle auf eine Seite'), h('button', { class: 'big prim', onclick: alle }, '📄 Alle ' + THEMEN.length + ' auf neue Seiten'))]);
};
})();
