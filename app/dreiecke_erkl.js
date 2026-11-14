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
const THEMEN = [['uebersicht', 'Dreiecksarten'], ['gleichschenklig', 'Gleichschenkliges Dreieck'], ['gleichseitig', 'Gleichseitiges = gleichwinkliges Dreieck']];
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
  gen: (d, P) => (ZEICHNE[d.thema] || ZEICHNE.uebersicht)(P) };
T.dreieckErklMenue = () => {
  const h = T.h, bild = k => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj('dreieckerkl', { thema: k }, false).svg);
  const einfuegen = k => { T.closeDlg(); const g = T.genObj('dreieckerkl', { thema: k }, false), r = T.viewRect(), fz = Math.min(1, (r.x1 - r.x0) * 0.8 / g.w, (r.y1 - r.y0) * 0.8 / g.h), [cx, cy] = T.viewCenter();
    T.snap(); T.addItem({ t: 'o', id: T.uid(), k: 'dreieckerkl', d: { thema: k }, x: cx - g.w * fz / 2, y: cy - g.h * fz / 2, w: g.w * fz, h: g.h * fz, r: 0 }); T.render(); };
  const alle = () => { T.closeDlg(); T.snap(); const S = T.S, start = S.page + 1;
    THEMEN.forEach(([k, l], i) => { const g = T.genObj('dreieckerkl', { thema: k }, false), np = { ...T.newPage('weiss'), titel: 'Dreiecke: ' + l };
      np.items.push({ t: 'o', id: T.uid(), k: 'dreieckerkl', d: { thema: k }, x: 40, y: 30, w: g.w, h: g.h, r: 0 }); S.board.pages.splice(start + i, 0, np); });
    T.gotoPage(start); T.toast('3 Seiten zu Dreiecken eingefügt – mit ◀ ▶ blättern.', 3000); };
  T.openDlg([h('h2', {}, '🔺 Dreiecke erklärt'), h('p', { class: 'hint' }, 'Drei Bildtafeln mit kurzen Merksätzen. Antippen fügt eine Tafel ein.'),
    h('div', { class: 'tiles' }, ...THEMEN.map(([k, l]) => h('button', { class: 'tile', onclick: () => einfuegen(k) }, h('img', { src: bild(k), alt: '' }), l))),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Schließen'), h('button', { class: 'big', onclick: () => T.tafelnAufEineSeite('dreieckerkl', THEMEN.map(([k]) => ({ thema: k }))) }, '📜 Alle auf eine Seite'), h('button', { class: 'big prim', onclick: alle }, '📄 Alle 3 auf neue Seiten'))]);
};
})();
