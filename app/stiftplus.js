// Tafel-App – Stift-Extras: Laserpointer (Spur verblasst), Formerkennung (Stift kurz halten → saubere Form)
// und Verbindungspfeile, die an zwei Elementen haften und beim Verschieben mitwandern (Concept-Map).
'use strict';
(function () {
const S = T.S, PI = Math.PI;
const q = (x, y) => [T.r1(x), T.r1(y), .5];

// ---------- Laserpointer ----------
const spuren = []; // { it, ende } – ende = null, solange der Stift noch unten ist
T.laserStart = it => { spuren.push({ it, ende: null }); T.renderLive(); };
T.laserEnde = it => { const s = spuren.find(x => x.it === it); if (s) s.ende = performance.now(); T.renderLive(); };
T.laserAktiv = () => spuren.length > 0; // für kern.js: dann die ganze Live-Fläche neu zeichnen
T.zeichneLaser = ctx => {
  if (!spuren.length) return;
  const jetzt = performance.now(), aktiv = spuren.some(s => !s.ende), letzte = Math.max(...spuren.map(s => s.ende || jetzt));
  const a = aktiv ? 1 : 1 - T.clamp((jetzt - letzte - 2000) / 700, 0, 1); // 2 s stehen lassen, dann ausblenden
  if (a <= 0) { spuren.length = 0; return; }
  const z = T.page().view.z, c = S.farbe.stift, col = /^#(1a1a1a|000000|ffffff|f4f4f0)$/i.test(c) ? '#ff1744' : c;
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of spuren) {
    if (!s.it.p.length) continue;
    const p = T.buildPath({ m: 'line', p: s.it.p });
    ctx.shadowColor = col; ctx.shadowBlur = 16 * T.dpr; ctx.strokeStyle = col; ctx.lineWidth = 8 / z; ctx.stroke(p);
    ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.6 / z; ctx.stroke(p);
  }
  ctx.restore();
  T.renderLive(); // weiter animieren, bis alles verblasst ist
};

// ---------- Formerkennung ----------
function rdp(pts, eps) { // Ramer-Douglas-Peucker: Ecken eines Linienzugs
  if (pts.length < 3) return pts.slice();
  let dmax = 0, idx = 0; const a = pts[0], b = pts[pts.length - 1];
  for (let i = 1; i < pts.length - 1; i++) { const d = T.distSeg(pts[i][0], pts[i][1], a[0], a[1], b[0], b[1]); if (d > dmax) { dmax = d; idx = i; } }
  if (dmax <= eps) return [a, b];
  return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
}
const winkel = (a, b, c) => { // Richtungsänderung bei b (0 = gerade weiter)
  const u = Math.atan2(b[1] - a[1], b[0] - a[0]), v = Math.atan2(c[1] - b[1], c[0] - b[0]); let d = Math.abs(v - u); if (d > PI) d = 2 * PI - d; return d;
};
T.formErkennen = (live, z) => {
  const pts = live.p.map(p => [p[0], p[1]]); if (pts.length < 6) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, laenge = 0;
  pts.forEach((p, i) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); if (i) laenge += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]); });
  const diag = Math.hypot(x1 - x0, y1 - y0); if (diag * z < 50) return null; // zu klein (Buchstaben)
  const A = pts[0], E = pts[pts.length - 1], abstand = Math.hypot(E[0] - A[0], E[1] - A[1]);
  const basis = { ...live, m: live.m === 'hl' ? 'hl' : 'line', g: 1 }; delete basis.arrow;
  // gerade Linie
  if (abstand * z >= 50 && laenge < abstand * 1.15) {
    let abw = 0; for (const p of pts) abw = Math.max(abw, T.distSeg(p[0], p[1], A[0], A[1], E[0], E[1]));
    if (abw <= Math.max(abstand * 0.06, 3 / z)) {
      let w = Math.atan2(E[1] - A[1], E[0] - A[0]); const r = Math.round(w / (PI / 4)) * PI / 4;
      if (Math.abs(w - r) < 5 * PI / 180) w = r; // waagerecht, senkrecht, 45° rasten ein
      return { ...basis, p: [q(A[0], A[1]), q(A[0] + abstand * Math.cos(w), A[1] + abstand * Math.sin(w))], closed: false };
    }
    return null;
  }
  if (abstand > diag * 0.3 || laenge < diag * 1.8) return null; // nicht geschlossen
  // Ecken suchen (geschlossener Linienzug), fast gerade Stellen und Doppelpunkte entfernen
  let V = rdp(pts.concat([A]), diag * 0.07).slice(0, -1);
  for (let wieder = true; wieder && V.length > 2;) {
    wieder = false;
    for (let i = 0; i < V.length; i++) {
      const a = V[(i + V.length - 1) % V.length], b = V[i], c = V[(i + 1) % V.length];
      if (winkel(a, b, c) < 28 * PI / 180 || Math.hypot(b[0] - a[0], b[1] - a[1]) < diag * 0.1) { V.splice(i, 1); wieder = true; break; }
    }
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 || 1, ry = (y1 - y0) / 2 || 1;
  const rr = pts.map(p => Math.hypot((p[0] - cx) / rx, (p[1] - cy) / ry)), mw = rr.reduce((s, v) => s + v, 0) / rr.length;
  const streu = Math.sqrt(rr.reduce((s, v) => s + (v - mw) ** 2, 0) / rr.length) / mw;
  if ((V.length >= 5 && streu < 0.16) || streu < 0.07) { // Kreis bzw. Ellipse
    let a = rx, b = ry; if (Math.abs(a - b) / Math.max(a, b) < 0.18) a = b = (a + b) / 2;
    const p = []; for (let k = 0; k < 96; k++) { const t = k / 96 * 2 * PI; p.push(q(cx + a * Math.cos(t), cy + b * Math.sin(t))); }
    return { ...basis, p, closed: true };
  }
  if (V.length === 3) return { ...basis, p: V.map(v => q(v[0], v[1])), closed: true };
  if (V.length === 4) { // Rechteck: Richtung der längsten Seite, bei fast waagerecht/senkrecht genau ausgerichtet
    let best = 0, w = 0;
    for (let i = 0; i < 4; i++) { const a = V[i], b = V[(i + 1) % 4], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > best) { best = l; w = Math.atan2(b[1] - a[1], b[0] - a[0]); } }
    const r = Math.round(w / (PI / 2)) * PI / 2; if (Math.abs(w - r) < 10 * PI / 180) w = r;
    const c = Math.cos(w), s = Math.sin(w), lok = pts.map(p => [p[0] * c + p[1] * s, -p[0] * s + p[1] * c]);
    const u0 = Math.min(...lok.map(p => p[0])), u1 = Math.max(...lok.map(p => p[0])), v0 = Math.min(...lok.map(p => p[1])), v1 = Math.max(...lok.map(p => p[1]));
    return { ...basis, p: [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => q(u * c - v * s, u * s + v * c)), closed: true };
  }
  return null;
};

// ---------- Verbindungspfeile ----------
// Stelle, an der der Strahl von der Mitte eines Elements in Richtung (dx, dy) seinen Rand verlässt
function randPunkt(o, cx, cy, dx, dy) {
  const a = -(o.r || 0) * PI / 180, lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
  const t = Math.min(Math.abs(lx) > 1e-9 ? o.w / 2 / Math.abs(lx) : Infinity, Math.abs(ly) > 1e-9 ? o.h / 2 / Math.abs(ly) : Infinity);
  return [cx + dx * t, cy + dy * t];
}
// Ende einer Verbindung: ein Element (id) oder eine Gruppe (Liste von ids, z. B. ein handgeschriebenes Wort oder eine gezeichnete Form)
// → als Rechteck {x, y, w, h, r}; bei Gruppen der Rahmen um alle Teile
T.verbinderEnde = (pg, ref) => {
  const ids = Array.isArray(ref) ? ref : [ref], teile = pg.items.filter(i => ids.includes(i.id)); if (!teile.length) return null;
  if (teile.length === 1 && teile[0].t === 'o') return { ...teile[0], teile };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const t of teile) { const b = T.bbox(t); x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, r: 0, teile };
};
T.anMap = (an, f) => an.map(x => Array.isArray(x) ? x.map(f) : f(x)); // ids einer Verbindung umschreiben (Kopien, Vorlagen)
T.verbinderPunkte = (pg, it, drag) => {
  const A = T.verbinderEnde(pg, it.an[0]), B = T.verbinderEnde(pg, it.an[1]); if (!A || !B) return null;
  const off = o => drag && S.sel && o.teile.some(t => S.sel.ids.has(t.id)) ? [drag.dx, drag.dy] : [0, 0];
  const [ax, ay] = off(A), [bx, by] = off(B), ca = [A.x + A.w / 2 + ax, A.y + A.h / 2 + ay], cb = [B.x + B.w / 2 + bx, B.y + B.h / 2 + by];
  const L = Math.hypot(cb[0] - ca[0], cb[1] - ca[1]); if (L < 1) return null;
  const dx = (cb[0] - ca[0]) / L, dy = (cb[1] - ca[1]) / L, rand = 10 + it.w;
  const pa = randPunkt({ ...A }, ca[0], ca[1], dx, dy), pb = randPunkt({ ...B }, cb[0], cb[1], -dx, -dy);
  const da = Math.hypot(pa[0] - ca[0], pa[1] - ca[1]) + rand, db = Math.hypot(pb[0] - cb[0], pb[1] - cb[1]) + rand;
  if (da + db >= L - 8) return [q(ca[0], ca[1]), q(cb[0], cb[1])]; // Elemente überlappen: von Mitte zu Mitte
  return [q(ca[0] + dx * da, ca[1] + dy * da), q(cb[0] - dx * db, cb[1] - dy * db)];
};
T.verbinderAktualisieren = pg => {
  const a = pg.items;
  for (let i = 0; i < a.length; i++) {
    const it = a[i]; if (!it.an) continue;
    const p = T.verbinderPunkte(pg, it); if (!p) continue;
    if (Math.abs(p[0][0] - it.p[0][0]) + Math.abs(p[0][1] - it.p[0][1]) + Math.abs(p[1][0] - it.p[it.p.length - 1][0]) + Math.abs(p[1][1] - it.p[it.p.length - 1][1]) > 0.5) a[i] = { ...it, p };
  }
};
})();
