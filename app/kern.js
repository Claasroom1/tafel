// Tafel-App – Kern: Zustand, Geometrie, Zeichnen, Verlauf
'use strict';
(function () {
const T = window.T = window.T || {};

T.CM = 40;                       // Weltpixel pro Zentimeter
T.uid = () => Math.random().toString(36).slice(2, 10);
T.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
T.r1 = v => Math.round(v * 10) / 10;
T.r2 = v => Math.round(v * 100) / 100;
T.zahl = (v, st = 2) => (Math.round(v * 10 ** st) / 10 ** st).toLocaleString('de-DE');

T.FAECHER = [
  { id: 'Mathe', farbe: '#1e88e5', icon: '➗' }, { id: 'Deutsch', farbe: '#f9b800', icon: '✍️' },
  { id: 'Englisch', farbe: '#e53935', icon: '💬' }, { id: 'NaWi', farbe: '#43a047', icon: '🔬' },
  { id: 'Biologie', farbe: '#7cb342', icon: '🌱' }, { id: 'Chemie', farbe: '#00897b', icon: '⚗️' },
  { id: 'Physik', farbe: '#5e35b1', icon: '🧲' }, { id: 'Erdkunde', farbe: '#00838f', icon: '🌍' },
  { id: 'Geschichte', farbe: '#8d6e63', icon: '🏛️' }, { id: 'Politik', farbe: '#546e7a', icon: '⚖️' },
  { id: 'Wirtschaft', farbe: '#f9a825', icon: '📈' }, { id: 'Religion-WuN', farbe: '#ab47bc', icon: '🕊️' },
  { id: 'Musik', farbe: '#d81b60', icon: '🎵' }, { id: 'Kunst', farbe: '#fb8c00', icon: '🎨' },
  { id: 'Sport', farbe: '#43a047', icon: '⚽' }, { id: 'Technik', farbe: '#6d4c41', icon: '🔧' },
  { id: 'Informatik', farbe: '#3949ab', icon: '💻' }, { id: 'Französisch', farbe: '#1565c0', icon: '🥐' },
  { id: 'Klassenrat', farbe: '#00acc1', icon: '🤝' }, { id: 'Sonstiges', farbe: '#757575', icon: '📌' }
];
T.fach = id => T.FAECHER.find(f => f.id === id) || { id, farbe: '#757575', icon: '📁' };

// Hintergründe: jede Tafelfarbe (weiß, schwarz, grün) mit allen Mustern. IDs: weiß = Muster allein ('kariert'), sonst Farbe + Muster ('gruenkariert'); leer = 'weiss' / 'schwarz' / 'gruen'
T.MUSTER = [['', 'Leer'], ['kariert', 'Kariert'], ['liniert', 'Liniert'], ['lineatur', 'Schreiblinien'], ['punkte', 'Punkte'], ['noten', 'Notenlinien']];
T.TAFELFARBEN = [['weiss', 'Weiß', '#ffffff'], ['schwarz', 'Schwarz', '#1f2328'], ['gruen', 'Tafelgrün', '#2d5a3d']];
T.HINTERGRUENDE = T.TAFELFARBEN.flatMap(([f, fn]) => T.MUSTER.map(([m, mn]) => ({
  id: m ? (f === 'weiss' ? m : f + m) : f, name: m ? (f === 'weiss' ? mn : fn.replace('Tafelgrün', 'Grün') + ' ' + mn.toLowerCase()) : fn, farbe: f, muster: m, dunkel: f !== 'weiss' })));
T.bgInfo = id => T.HINTERGRUENDE.find(b => b.id === id) || T.HINTERGRUENDE[0];
// Nachtmodus: weiße Tafeln werden (nur in der Anzeige) schwarz mit gleichem Muster – gespeichert, exportiert und gedruckt bleibt weiß
T.anzeigeBg = pg => {
  const b = T.bgInfo(pg.bg);
  if (!T.opts.tafelNacht || b.farbe !== 'weiss' || document.documentElement.dataset.theme !== 'dark') return pg.bg;
  return 'schwarz' + b.muster;
};
T.isDark = pg => T.bgInfo(T.anzeigeBg(pg)).dunkel; // wie die Tafel gerade angezeigt wird (Nachtmodus berücksichtigt)

// ---------- Einstellungen (nur Komfort, keine Tafeldaten) ----------
const OPT_KEY = 'tafelapp.opts';
T.opts = { finger: 'pan', palm: true, druck: 'auto', glatt: 0.45, leisteOben: false, lehrkraft: '' };
try { Object.assign(T.opts, JSON.parse(localStorage.getItem(OPT_KEY) || '{}')); } catch (e) {}
T.saveOpts = () => { try { localStorage.setItem(OPT_KEY, JSON.stringify(T.opts)); } catch (e) {} };

T.S = {
  board: null, page: 0, tool: 'stift',
  farbe: { stift: '#1a1a1a', marker: '#ffe14d' },
  groesse: { stift: T.opts.stiftStaerke || 4, marker: 28, radierer: 50 }, // Standard-Strichstärke: ⚙ Einstellungen
  radModus: 'teil', form: 'linie', stiftArt: T.opts.stiftArt === 'kalli' ? 'kalli' : 'normal', inst: [], sel: null, drag: null, dirty: false, file: null
};
T.today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
T.newPage = (bg = 'weiss') => ({ bg, items: [], view: { x: 0, y: 0, z: 1 } });
T.newBoard = (lehrkraft, fach, titel) => ({
  app: 'Tafel-App', version: 1, id: T.uid(), lehrkraft, fach, titel, datum: T.today(),
  erstellt: new Date().toISOString(), geaendert: new Date().toISOString(), pages: [T.newPage()]
});
T.page = () => T.S.board.pages[T.S.page];

// ---------- Geometrie ----------
T.distSeg = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = T.clamp(t, 0, 1);
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const bbCache = new WeakMap();
T.bbox = it => {
  let b = bbCache.get(it); if (b) return b;
  if (it.t === 's') {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of it.p) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    const m = it.w; b = { x0: x0 - m, y0: y0 - m, x1: x1 + m, y1: y1 + m };
  } else {
    const c = T.objCorners(it);
    b = { x0: Math.min(...c.map(p => p[0])), y0: Math.min(...c.map(p => p[1])), x1: Math.max(...c.map(p => p[0])), y1: Math.max(...c.map(p => p[1])) };
  }
  bbCache.set(it, b); return b;
};
T.objCorners = o => {
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2, a = (o.r || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => { const lx = u * o.w / 2, ly = v * o.h / 2; return [cx + lx * c - ly * s, cy + lx * s + ly * c]; });
};
T.objLocal = (o, x, y) => {
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2, a = -(o.r || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const dx = x - cx, dy = y - cy; return [dx * c - dy * s, dx * s + dy * c];
};
T.hitObj = (o, x, y, pad = 0) => { const [lx, ly] = T.objLocal(o, x, y); return Math.abs(lx) <= o.w / 2 + pad && Math.abs(ly) <= o.h / 2 + pad; };
T.hitStroke = (it, x, y, r) => {
  const b = T.bbox(it); if (x < b.x0 - r || x > b.x1 + r || y < b.y0 - r || y > b.y1 + r) return false;
  const p = it.p, rr = r + it.w / 2;
  if (p.length === 1) return Math.hypot(x - p[0][0], y - p[0][1]) <= rr;
  for (let i = 1; i < p.length; i++) if (T.distSeg(x, y, p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]) <= rr) return true;
  return false;
};

// ---------- Strich-Pfade ----------
const halfW = (w, pr) => w * (0.35 + 1.3 * pr) / 2;
function outlinePath(path, pts, w) {
  const n = pts.length;
  if (n === 1 || (n === 2 && Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) < 0.5)) {
    path.arc(pts[0][0], pts[0][1], halfW(w, pts[0][2]), 0, Math.PI * 2); return;
  }
  const L = [], R = [], A = [], H = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const h = halfW(w, pts[i][2]);
    L.push([pts[i][0] - dy * h, pts[i][1] + dx * h]); R.push([pts[i][0] + dy * h, pts[i][1] - dx * h]);
    A.push(Math.atan2(dx, -dy)); H.push(h);
  }
  path.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n - 1; i++) path.quadraticCurveTo(L[i][0], L[i][1], (L[i][0] + L[i + 1][0]) / 2, (L[i][1] + L[i + 1][1]) / 2);
  path.lineTo(L[n - 1][0], L[n - 1][1]);
  path.arc(pts[n - 1][0], pts[n - 1][1], H[n - 1], A[n - 1], A[n - 1] + Math.PI, true);
  for (let i = n - 2; i > 0; i--) path.quadraticCurveTo(R[i][0], R[i][1], (R[i][0] + R[i - 1][0]) / 2, (R[i][1] + R[i - 1][1]) / 2);
  path.lineTo(R[0][0], R[0][1]);
  path.arc(pts[0][0], pts[0][1], H[0], A[0] + Math.PI, A[0], true);
  path.closePath();
}
function polyPath(path, pts, smooth, closed) {
  const n = pts.length; path.moveTo(pts[0][0], pts[0][1]);
  if (n === 1) { path.lineTo(pts[0][0] + 0.01, pts[0][1]); return; }
  if (!smooth || n < 3) { for (let i = 1; i < n; i++) path.lineTo(pts[i][0], pts[i][1]); }
  else {
    for (let i = 1; i < n - 1; i++) path.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
    path.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
  if (closed) path.closePath();
}
// Kalligrafie: breite Feder im festen Winkel – je Abschnitt die konvexe Hülle der Federabdrücke
const NIB = -40 * Math.PI / 180;
function hull(pts) {
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function kalliPath(path, pts, w) {
  const L = w * 1.3, nx = Math.cos(NIB) * L, ny = Math.sin(NIB) * L, hair = Math.max(0.6, w * 0.09);
  const seg = (a, b) => {
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx = -dy / l * hair; dy = (b[0] - a[0]) / l * hair;
    const h = hull([[a[0] + nx, a[1] + ny], [a[0] - nx, a[1] - ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] + dx, a[1] + dy], [a[0] - dx, a[1] - dy], [b[0] + dx, b[1] + dy], [b[0] - dx, b[1] - dy]]);
    path.moveTo(h[0][0], h[0][1]); for (let i = 1; i < h.length; i++) path.lineTo(h[i][0], h[i][1]); path.closePath();
  };
  if (pts.length === 1) seg(pts[0], [pts[0][0] + 0.5, pts[0][1] + 0.5]);
  for (let i = 1; i < pts.length; i++) seg(pts[i - 1], pts[i]);
}
T.buildPath = it => {
  const p = new Path2D();
  if (it.m === 'kalli') kalliPath(p, it.p, it.w);
  else if (it.m === 'pen') outlinePath(p, it.p, it.w); else polyPath(p, it.p, it.m === 'hl' && !it.g, it.closed);
  return p;
};
const pathCache = new WeakMap();
T.strokePath = it => { let p = pathCache.get(it); if (!p) { p = T.buildPath(it); pathCache.set(it, p); } return p; };

T.inkColor = (c, dark) => {
  if (dark && (c === '#1a1a1a' || c === '#000000')) return '#f4f4f0';
  if (!dark && (c === '#ffffff' || c === '#f4f4f0')) return '#1a1a1a';
  return c;
};
// Linienarten (runde Enden verlängern jeden Strich um die Strichbreite – darum die Lücken etwas größer)
T.strichMuster = (ls, w) => { w = Math.max(1, w || 3); return ls === 'strich' ? [w * 3, w * 2.6] : ls === 'punktstrich' ? [w * 4, w * 2.2, 0.01, w * 2.2] : ls === 'punkt' ? [0.01, w * 2.2] : []; };
// 📐 Winkel zwischen Linien anzeigen (Formen mit „Winkel anzeigen“): an gemeinsamen Endpunkten, Schnittpunkten und in Dreieck/Rechteck
T.winkelMalen = (ctx, pg, dark, px) => {
  const linien = pg.items.filter(i => i.t === 's' && i.m === 'line' && !i.an && !i.wkAus && i.p && i.p.length === 2 && !i.closed); /* wkAus: bei dieser Linie Winkel ausgeblendet */
  const mitW = pg.items.filter(i => i.t === 's' && i.wk && !i.wkAus && i.m === 'line' && !i.an);
  if (!mitW.length) return;
  const verdeckt = pg.wkVerdeckt || {}, orte = []; (T._wkOrte || (T._wkOrte = new WeakMap())).set(pg, orte); /* Lage der Winkel zum Antippen */
  const zeichne = (V, A, B, col, w, rundVorgabe, key) => { // Winkel am Scheitel V zwischen den Strahlen V→A und V→B
    let a1 = Math.atan2(A[1] - V[1], A[0] - V[0]), a2 = Math.atan2(B[1] - V[1], B[0] - V[0]);
    let d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const grad = Math.abs(d) * 180 / Math.PI; if (grad < 1 || grad > 179) return;
    const r = Math.min(Math.hypot(A[0] - V[0], A[1] - V[1]), Math.hypot(B[0] - V[0], B[1] - V[1])) * 0.35, rr = Math.min(r, 60 * px + w * 2);
    ctx.save(); ctx.setLineDash([]); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(1.5 * px, w * 0.5);
    ctx.beginPath(); ctx.arc(V[0], V[1], rr, a1, a1 + d, d < 0); ctx.stroke();
    const mid = a1 + d / 2, rund = rundVorgabe != null ? rundVorgabe : Math.round(grad);
    if (rund === 90) { ctx.beginPath(); ctx.arc(V[0] + Math.cos(mid) * rr * 0.5, V[1] + Math.sin(mid) * rr * 0.5, Math.max(2 * px, w * 0.45), 0, 2 * Math.PI); ctx.fill(); }
    const fs = 20 * px; ctx.font = `600 ${fs}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tx = V[0] + Math.cos(mid) * (rr + fs * 1.2), ty = V[1] + Math.sin(mid) * (rr + fs * 1.2);
    const zust = key ? T.winkelZustand(pg, key) : 'zahl', txt = zust === 'frage' ? '?' : zust === 'leer' ? '' : rund + '°'; /* einzeln ausgeblendet: „?“ oder nur der Bogen */
    if (txt) { ctx.lineWidth = 4 * px; ctx.strokeStyle = dark ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.85)'; ctx.strokeText(txt, tx, ty); ctx.fillText(txt, tx, ty); }
    if (key) orte.push({ key, x: tx, y: ty, vx: V[0] + Math.cos(mid) * rr * 0.6, vy: V[1] + Math.sin(mid) * rr * 0.6, r: Math.max(fs * 1.3, rr * 0.5) });
    ctx.restore();
  };
  // Erst alle Winkel sammeln, dann so runden, dass Dreiecke genau 180° (Vierecke 360°) ergeben
  const winkelGrad = (V, A, B) => { let d = Math.atan2(B[1] - V[1], B[0] - V[0]) - Math.atan2(A[1] - V[1], A[0] - V[0]); while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI; return Math.abs(d) * 180 / Math.PI; };
  const liste = [], merke = (V, A, B, col, w, ids, key) => { const g = winkelGrad(V, A, B); if (g < 1 || g > 179) return null; const e = { V, A, B, col, w, g, ids, key, rund: Math.round(g) }; liste.push(e); return e; };
  const summeRunden = (E, ziel) => { // größte Reste: Summe der gerundeten Werte = ziel (nur wenn die echten Werte schon passen)
    const sum = E.reduce((s, x) => s + x.g, 0); if (Math.abs(sum - ziel) > 1.5) return;
    const k = E.map(x => ({ x, f: Math.floor(x.g) })), rest = ziel - k.reduce((s, y) => s + y.f, 0);
    k.sort((p, q) => (q.x.g - q.f) - (p.x.g - p.f)).forEach((y, i) => { y.x.rund = y.f + (i < rest ? 1 : 0); });
  };
  const len = l => Math.hypot(l.p[1][0] - l.p[0][0], l.p[1][1] - l.p[0][1]);
  const fertig = new Set();
  for (const it of mitW) {
    const col = it.wc || T.inkColor(it.c, dark); /* 📐 eigene Winkelfarbe */
    if (it.closed && it.p.length >= 3 && it.p.length <= 4) { // Dreieck, Rechteck: Innenwinkel
      const n = it.p.length, E = []; for (let i = 0; i < n; i++) { const e = merke(it.p[i], it.p[(i + n - 1) % n], it.p[(i + 1) % n], col, it.w, null, it.id + '#' + i); if (e) E.push(e); }
      if (E.length === n) summeRunden(E, (n - 2) * 180);
      continue;
    }
    if (it.p.length !== 2) continue;
    for (const o of linien) {
      if (o === it) continue; const schl = [it.id, o.id].sort().join('|'); if (fertig.has(schl)) continue; fertig.add(schl);
      // Schnittpunkt der beiden Geraden: liegt er an den Enden beider Striche (auch bei kleiner Lücke oder Überstand) → Ecke (Innenwinkel);
      // liegt er mitten in beiden → Kreuzung (spitzer bzw. rechter Winkel)
      const [a, b] = it.p, [c, e] = o.p, den = (b[0] - a[0]) * (e[1] - c[1]) - (b[1] - a[1]) * (e[0] - c[0]); if (Math.abs(den) < 1e-6) continue;
      const t = ((c[0] - a[0]) * (e[1] - c[1]) - (c[1] - a[1]) * (e[0] - c[0])) / den, u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den;
      const S0 = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
      const tol = Math.max(14 * px, it.w * 2, o.w * 2), L1 = len(it), L2 = len(o);
      const amEnde = (tt, L) => Math.min(Math.abs(tt), Math.abs(1 - tt)) * L <= Math.max(tol, L * 0.12);
      if (amEnde(t, L1) && amEnde(u, L2)) { merke(S0, Math.abs(t) < Math.abs(1 - t) ? b : a, Math.abs(u) < Math.abs(1 - u) ? e : c, col, it.w, [it.id, o.id], schl); continue; }
      if (t <= 0.02 || t >= 0.98 || u <= 0.02 || u >= 0.98) continue; // sonst nur echte Schnittpunkte
      const skalar = (b[0] - a[0]) * (e[0] - c[0]) + (b[1] - a[1]) * (e[1] - c[1]);
      merke(S0, b, skalar >= 0 ? e : c, col, it.w, null, schl + '|x'); /* der spitze bzw. rechte Winkel */
    }
  }
  // Dreiecke aus drei einzelnen Linien: je zwei teilen sich eine Ecke → zusammen genau 180°
  const ecken = liste.filter(x => x.ids);
  for (let i = 0; i < ecken.length; i++) for (let j = i + 1; j < ecken.length; j++) for (let k = j + 1; k < ecken.length; k++) {
    const E = [ecken[i], ecken[j], ecken[k]], ids = new Set(E.flatMap(x => x.ids));
    if (ids.size === 3 && E.every(x => x.ids[0] !== x.ids[1])) summeRunden(E, 180);
  }
  for (const x of liste) zeichne(x.V, x.A, x.B, x.col, x.w, x.rund, x.key);
};
// 📐 Winkel unter dem Finger finden (Zahl oder Bogen) und einzeln umschalten: Zahl → „?“ → leer → Zahl
T.winkelAt = (wx, wy, px) => {
  const pg = T.page(); if (!pg || !T._wkOrte || !(pg.items.some(i => i.kw || i.ms || i.mu || i.mf) || (!pg.winkelAus && pg.items.some(i => i.wk && !i.wkAus)))) return null;
  const orte = T._wkOrte.get(pg) || [], tol = 6 * (px || 1);
  return orte.find(o => Math.hypot(wx - o.x, wy - o.y) < o.r * 0.7 + tol || Math.hypot(wx - o.vx, wy - o.vy) < o.r * 0.45 + tol) || null;
};
// Zustand eines Winkels: 'zahl' | 'frage' | 'leer' – ohne Eintrag gilt der Start der Seite (neue Seiten mit Formen: zuerst „?“)
T.winkelZustand = (pg, key) => { const v = (pg.wkVerdeckt || {})[key]; return v || (/#[muf]/.test(key) ? 'zahl' : pg.wkStart || 'zahl'); }; /* Maße (#m, #u, #f) zuerst mit Wert */
T.winkelUmschalten = o => {
  const pg = T.page(); T.snap(); const v = { ...(pg.wkVerdeckt || {}) }, z = T.winkelZustand(pg, o.key);
  const n = z === 'frage' ? 'zahl' : z === 'zahl' ? 'leer' : 'frage'; v[o.key] = n; /* „?“ → Wert → nur Bogen → „?“ */
  pg.wkVerdeckt = v; T.render(); T.renderOver && T.renderOver();
  T.toast(n === 'zahl' ? 'Winkel aufgedeckt – nochmals antippen: nur der Bogen' : n === 'leer' ? 'Nur der Bogen – nochmals antippen: „?“' : 'Winkel als „?“ – antippen deckt ihn auf', 1800);
};
// Alle Winkel (der gewählten Formen oder der ganzen Seite) zeigen bzw. als „?“
T.winkelAlle = (zust, ids) => {
  const pg = T.page(), orte = (T._wkOrte && T._wkOrte.get(pg)) || []; T.snap();
  const v = { ...(pg.wkVerdeckt || {}) };
  if (!ids) { for (const k of Object.keys(v)) delete v[k]; pg.wkStart = zust; }
  else for (const o of orte) if (!/#[muf]/.test(o.key) && ids.some(id => o.key.includes(id))) v[o.key] = zust;
  pg.wkVerdeckt = v; T.changed && T.changed(); T.render(); T.renderOver && T.renderOver();
};
// ◔ Kreiswinkel (Formen): Kreis mit zwei Radien; p = [B, M, A, Kreispunkte ab A gegen den Uhrzeigersinn], kw.th = Winkel von A nach B
T.kreisWinkelPunkte = (M, r, aA, th, ry) => { // aA: Richtung von A in Grad (mathematisch, gegen den Uhrzeigersinn); ry: Ellipse (r = waagerechte Halbachse)
  const pt = g => { const c = Math.cos(g * Math.PI / 180), s = Math.sin(g * Math.PI / 180), q = ry == null ? r : r * ry / Math.hypot(ry * c, r * s); return [M[0] + q * c, M[1] - q * s]; };
  const P = [pt(aA + th), [M[0], M[1]]]; for (let k = 0; k <= 120; k++) P.push(pt(aA + k * 3));
  return P;
};
const KW_BRUCH = { 30: '1/12', 36: '1/10', 45: '⅛', 60: '⅙', 72: '⅕', 90: '¼', 120: '⅓', 135: '⅜', 144: '⅖', 180: '½', 216: '⅗', 225: '⅝', 240: '⅔', 270: '¾', 288: '⅘', 300: '⅚', 315: '⅞', 360: 'ganzer' };
T.kreisWinkelText = (th, ellipse) => { const g = Math.round(th), b = !ellipse && KW_BRUCH[g]; return g + '°' + (b ? ' = ' + b + ' Kreis' : ''); }; /* Ellipse: nur Grad – Bruchteile der Fläche stimmen dort nicht */
T.kreisWinkelMalen = (ctx, pg, dark, px, teil, drag) => {
  const orte = teil === 'flaeche' ? null : (T._wkOrte || (T._wkOrte = new WeakMap())).get(pg) || []; if (orte) T._wkOrte.set(pg, orte);
  const verdeckt = pg.wkVerdeckt || {};
  for (const it of pg.items) {
    if (it.t !== 's' || !it.kw || !it.p || it.p.length !== 123) continue; /* angeradiert/zerteilt: nur noch Linien */
    const [B, M, A] = it.p, th = it.kw.th, aA = Math.atan2(M[1] - A[1], A[0] - M[0]);
    const r = it.kw.el ? Math.min(...(R => [Math.max(...R.map(q => q[0])) - Math.min(...R.map(q => q[0])), Math.max(...R.map(q => q[1])) - Math.min(...R.map(q => q[1]))])(it.p.slice(2))) / 2 : Math.hypot(A[0] - M[0], A[1] - M[1]);
    if (r < 2) continue;
    const aus = it.wkAus || pg.winkelAus; /* „📐 Winkel ausblenden“: Bogen, Gradzahl und gelbe Fläche weg (eigene Füllung bleibt) */
    if (aus && (teil !== 'flaeche' || !it.fl)) continue;
    ctx.save();
    if (drag && T.S.sel && T.S.sel.ids.has(it.id)) ctx.translate(drag.dx, drag.dy);
    const col = T.inkColor(it.c, dark), a0 = -aA, a1 = -aA - th * Math.PI / 180; // Leinwand: y nach unten → Winkel negativ
    if (teil === 'flaeche') {
      if (it.fl) { /* 🪣 eigene Füllung: ganzer Kreis bzw. ganze Ellipse */
        ctx.save(); ctx.beginPath(); it.p.slice(2).forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
        ctx.fillStyle = it.fl; if (dark) ctx.globalAlpha *= 0.75; ctx.fill(); ctx.restore();
      }
      if (!aus) { // Winkelausschnitt leicht getönt (unter den Linien), entlang der Randpunkte (3°-Schritte ab A) – passt für Kreis und Ellipse
        ctx.beginPath(); ctx.moveTo(M[0], M[1]);
        const nk = Math.min(120, Math.floor(th / 3)); for (let k = 0; k <= nk; k++) ctx.lineTo(it.p[2 + k][0], it.p[2 + k][1]); ctx.lineTo(B[0], B[1]); ctx.closePath();
        ctx.fillStyle = it.fl ? (dark ? 'rgba(0,0,0,.25)' : 'rgba(146,64,14,.18)') : (dark ? 'rgba(250,204,21,.28)' : 'rgba(253,230,138,.6)'); ctx.fill();
      }
      ctx.restore(); continue;
    }
    const rr = Math.min(r * 0.3, 70 * px + it.w * 2), mid = -aA - th * Math.PI / 360, key = it.id + '#kw';
    const wcol = it.wc || '#b45309'; ctx.strokeStyle = wcol; ctx.fillStyle = wcol; ctx.lineWidth = Math.max(2 * px, it.w * 0.6);
    if (Math.round(th) === 90) { const q = rr * 0.7, u = [Math.cos(a0), Math.sin(a0)], v = [Math.cos(a1), Math.sin(a1)];
      ctx.beginPath(); ctx.moveTo(M[0] + u[0] * q, M[1] + u[1] * q); ctx.lineTo(M[0] + (u[0] + v[0]) * q, M[1] + (u[1] + v[1]) * q); ctx.lineTo(M[0] + v[0] * q, M[1] + v[1] * q); ctx.stroke();
      ctx.beginPath(); ctx.arc(M[0] + Math.cos(mid) * q * 0.75, M[1] + Math.sin(mid) * q * 0.75, Math.max(2.5 * px, it.w * 0.5), 0, 2 * Math.PI); ctx.fill();
    } else if (th > 0.5) { ctx.beginPath(); ctx.arc(M[0], M[1], rr, a0, a1, true); ctx.stroke(); }
    const zust = T.winkelZustand(pg, key), txt = zust === 'frage' ? '?' : zust === 'leer' ? '' : T.kreisWinkelText(th, it.kw.el);
    const fs = Math.max(18 * px, Math.min(r * 0.13, 34 * px)), d = th > 300 ? 0 : Math.min(r * 0.62, rr + fs * 2.4), tx = M[0] + Math.cos(mid) * d, ty = M[1] + Math.sin(mid) * d + (th > 300 ? fs * 1.4 : 0);
    if (txt) { ctx.font = `700 ${fs}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 5 * px; ctx.strokeStyle = dark ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.9)'; ctx.strokeText(txt, tx, ty); ctx.fillStyle = it.wc || (dark ? '#fcd34d' : '#92400e'); ctx.fillText(txt, tx, ty); }
    orte.push({ key, x: tx, y: ty, vx: M[0] + Math.cos(mid) * rr * 0.6, vy: M[1] + Math.sin(mid) * rr * 0.6, r: Math.max(fs * 1.6, rr * 0.5) });
    ctx.restore();
  }
};
// 📏 Maße an Formen (je Form einzeln zuschaltbar): ms = Seitenlängen/Radius/Halbachsen, mu = Umfang, mf = Flächeninhalt
T.formMasse = it => { // Werte in cm bzw. cm²; null, wenn für diese Form nicht sinnvoll
  const P = it.p, cm = v => v / T.CM, d = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const hb = Q => { const xs = Q.map(q => q[0]), ys = Q.map(q => q[1]); return [(Math.max(...xs) - Math.min(...xs)) / 2, (Math.max(...ys) - Math.min(...ys)) / 2]; };
  if (it.kw && P.length === 123) {
    const [, M, A] = P, th = it.kw.th;
    if (it.kw.el) { const [a, b] = hb(P.slice(2)); return { art: 'ellipse', M, a: cm(a), b: cm(b), sektor: true }; }
    const r = cm(d(M, A)), bog = 2 * Math.PI * r * th / 360;
    return { art: 'kreiswinkel', M, A, r, u: th >= 360 ? 2 * Math.PI * r : 2 * r + bog, f: Math.PI * r * r * th / 360, ca: true };
  }
  if (it.fz === 'kreis' && it.closed && P.length === 120) { const M = [P.reduce((s, q) => s + q[0], 0) / 120, P.reduce((s, q) => s + q[1], 0) / 120], r = cm(d(M, P[0])); return { art: 'kreis', M, r, u: 2 * Math.PI * r, f: Math.PI * r * r, ca: true }; }
  if (it.fz === 'ellipse' && it.closed && P.length === 96) { const M = [P.reduce((s, q) => s + q[0], 0) / 96, P.reduce((s, q) => s + q[1], 0) / 96], [a, b] = hb(P).map(cm);
    return { art: 'ellipse', M, a, b, u: Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b))), f: Math.PI * a * b, ca: true }; } /* Umfang: Näherung nach Ramanujan */
  if (it.closed && P.length >= 3 && P.length <= 4) {
    const s = P.map((q, i) => cm(d(q, P[(i + 1) % P.length]))), fl = Math.abs(P.reduce((t, q, i) => { const n = P[(i + 1) % P.length]; return t + q[0] * n[1] - n[0] * q[1]; }, 0)) / 2 / T.CM / T.CM;
    return { art: 'vieleck', s, u: s.reduce((a, b) => a + b, 0), f: fl };
  }
  if (!it.closed && P.length === 2) return { art: 'strecke', s: [cm(d(P[0], P[1]))] };
  return null;
};
T.masseMalen = (ctx, pg, dark, px, drag) => {
  const orte = (T._wkOrte || (T._wkOrte = new WeakMap())).get(pg) || []; T._wkOrte.set(pg, orte);
  const z = v => T.zahl(v, 1), col = dark ? '#93c5fd' : '#1d4ed8', fs = 19 * px;
  const schreibe = (txt, x, y, key, fett) => {
    const zust = T.winkelZustand(pg, key), t = zust === 'frage' ? '?' : zust === 'leer' ? '' : txt;
    if (t) { ctx.font = `${fett ? 700 : 600} ${fs}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 5 * px; ctx.strokeStyle = dark ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.92)'; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); }
    orte.push({ key, x, y, vx: x, vy: y, r: Math.max(fs * 1.6, ctx.measureText(txt).width / 2) });
  };
  const strich = (a, b) => { ctx.save(); ctx.setLineDash([7 * px, 5 * px]); ctx.strokeStyle = col; ctx.lineWidth = 2.5 * px; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore(); };
  for (const it of pg.items) {
    if (it.t !== 's' || !(it.ms || it.mu || it.mf) || !it.p) continue;
    const W = T.formMasse(it); if (!W) continue;
    ctx.save(); if (drag && T.S.sel && T.S.sel.ids.has(it.id)) ctx.translate(drag.dx, drag.dy);
    const P = it.p, mx = P.reduce((s, q) => s + q[0], 0) / P.length, my = P.reduce((s, q) => s + q[1], 0) / P.length;
    if (it.ms) {
      if (W.art === 'vieleck' || W.art === 'strecke') {
        const n = W.art === 'strecke' ? 1 : P.length;
        for (let i = 0; i < n; i++) {
          const a = P[i], b = P[(i + 1) % P.length], cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
          if (W.art === 'vieleck' ? (cx - mx) * nx + (cy - my) * ny < 0 : ny > 0) { nx = -nx; ny = -ny; } /* nach außen bzw. über die Strecke */
          schreibe(z(W.s[i]) + ' cm', cx + nx * (fs * 1.1 + it.w), cy + ny * (fs * 1.1 + it.w), it.id + '#m' + i);
        }
      } else if (W.art === 'kreis' || W.art === 'kreiswinkel') {
        const M = W.M, R = W.r * T.CM, g = W.art === 'kreiswinkel' ? Math.atan2(W.A[1] - M[1], W.A[0] - M[0]) : -Math.PI / 6, E = [M[0] + R * Math.cos(g), M[1] + R * Math.sin(g)];
        if (W.art === 'kreis' || it.wkAus || pg.winkelAus) strich(M, E);
        const nx = Math.sin(g), ny = -Math.cos(g); schreibe('r = ' + z(W.r) + ' cm', (M[0] + E[0]) / 2 + nx * fs * 1.1, (M[1] + E[1]) / 2 + ny * fs * 1.1, it.id + '#m0');
      } else if (W.art === 'ellipse') {
        const M = W.M, Ea = [M[0] + W.a * T.CM, M[1]], Eb = [M[0], M[1] - W.b * T.CM]; strich(M, Ea); strich(M, Eb);
        schreibe('a = ' + z(W.a) + ' cm', (M[0] + Ea[0]) / 2, M[1] + fs * 1.1, it.id + '#m0'); schreibe('b = ' + z(W.b) + ' cm', M[0] - fs * 3.2, (M[1] + Eb[1]) / 2, it.id + '#m1');
      }
    }
    if ((it.mu && W.u != null) || (it.mf && W.f != null)) { // Umfang und Flächeninhalt unter der Form
      const y1 = Math.max(...P.map(q => q[1])) + fs * 1.6 + it.w + (it.ms && W.art === 'vieleck' ? fs * 1.8 : 0), ca = W.ca ? '≈ ' : '= '; /* unter den Seitenlängen */
      const teile = [it.mu && W.u != null ? ['u ' + ca + z(W.u) + ' cm', '#u'] : null, it.mf && W.f != null ? ['A ' + ca + z(W.f) + ' cm²', '#f'] : null].filter(Boolean);
      ctx.font = `700 ${fs}px Segoe UI`; const br = teile.map(t => ctx.measureText(t[0]).width), luecke = fs * 1.5, ges = br.reduce((a, b) => a + b, 0) + luecke * (teile.length - 1);
      let x = mx - ges / 2; teile.forEach((t, i) => { schreibe(t[0], x + br[i] / 2, y1, it.id + t[1], true); x += br[i] + luecke; });
    }
    ctx.restore();
  }
};
const kwRingPfade = new WeakMap(); /* ◔ Kreiswinkel mit ausgeblendetem Winkel: nur der Rand, ohne Radien */
const kwRing = it => { let p = kwRingPfade.get(it); if (!p) { p = new Path2D(); it.p.slice(2).forEach((q, k) => k ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); kwRingPfade.set(it, p); } return p; };
T.drawStroke = (ctx, it, dark, path) => {
  if (it.kw && it.p && it.p.length === 123 && (it.wkAus || (T.page() && T.page().winkelAus))) path = kwRing(it);
  path = path || T.strokePath(it);
  if (it.fl && it.m === 'line' && it.closed) { ctx.save(); ctx.fillStyle = it.fl; if (dark) ctx.globalAlpha *= 0.75; ctx.fill(path); ctx.restore(); } /* 🪣 gefüllte Form */
  const col = T.inkColor(it.c, dark), flaeche = it.m === 'pen' || it.m === 'kalli';
  const male = farbe => {
    if (flaeche) { ctx.fillStyle = farbe; ctx.fill(path); return; }
    ctx.save();
    if (it.m === 'hl') { ctx.globalAlpha *= dark ? 0.42 : 0.5; if (!dark) ctx.globalCompositeOperation = 'multiply'; }
    ctx.strokeStyle = farbe; ctx.lineWidth = it.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (it.ls) ctx.setLineDash(T.strichMuster(it.ls, it.w)); /* gestrichelt, Strichpunkt, gepunktet */
    ctx.stroke(path);
    ctx.restore();
  };
  if (!it.fx || it.m === 'hl') male(col);
  else { // Stift-Effekte: Schatten, Graffiti, Neon (Schattenwerte sind Bildschirmpunkte → mit dem Maßstab umrechnen)
    const t = ctx.getTransform(), k = Math.hypot(t.a, t.b), w = it.w;
    ctx.save();
    if (it.fx === 'schatten') { ctx.shadowColor = 'rgba(0,0,0,.42)'; ctx.shadowBlur = w * 2.2 * k; ctx.shadowOffsetX = w * 0.7 * k; ctx.shadowOffsetY = w * k; male(col); }
    else if (it.fx === 'neon') { ctx.shadowColor = col; ctx.shadowBlur = w * 5 * k; male(col); male(col); ctx.shadowBlur = 0; ctx.globalAlpha *= dark ? 0.4 : 0.18; male('#ffffff'); } // heller Kern, auf hell dezenter
    else if (it.fx === 'graffiti') {
      const rand = dark ? '#ffffff' : '#141414';
      ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = w * 1.2 * k; ctx.shadowOffsetX = w * 0.9 * k; ctx.shadowOffsetY = w * 1.1 * k;
      ctx.strokeStyle = rand; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = flaeche ? w * 1.3 : w * 2.1; ctx.stroke(path); // kräftiger Umriss
      ctx.shadowColor = 'transparent'; male(col);
      if (flaeche) { // Glanzlicht: heller Rand oben links, darüber die Farbe leicht versetzt
        ctx.save(); ctx.clip(path); const ga = ctx.globalAlpha; ctx.globalAlpha = ga * 0.5; male('#ffffff'); ctx.globalAlpha = ga; ctx.translate(w * 0.3, w * 0.3); male(col); ctx.restore();
      }
    } else male(col);
    ctx.restore();
  }
  if (it.pkt && it.p.length > 1) { // Strecke: Anfangs- und Endpunkt; Strahl: nur Anfangspunkt
    ctx.fillStyle = col; const r = Math.max(4, it.w * 1.6);
    for (const q of it.pkt === 'beide' ? [it.p[0], it.p[it.p.length - 1]] : [it.p[0]]) { ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 2 * Math.PI); ctx.fill(); }
  }
  if (it.arrow && it.p.length > 1) {
    const b = it.p[it.p.length - 1]; let a = it.p[0];
    for (let i = it.p.length - 2; i >= 0; i--) if (Math.hypot(b[0] - it.p[i][0], b[1] - it.p[i][1]) > 2) { a = it.p[i]; break; }
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.max(16, it.w * 4.5), sp = 0.45;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(b[0] + Math.cos(ang) * it.w * 0.6, b[1] + Math.sin(ang) * it.w * 0.6);
    ctx.lineTo(b[0] - L * Math.cos(ang - sp), b[1] - L * Math.sin(ang - sp));
    ctx.lineTo(b[0] - L * Math.cos(ang + sp), b[1] - L * Math.sin(ang + sp)); ctx.closePath(); ctx.fill();
  }
};

// ---------- Hintergrund ----------
// Abstände in Millimetern (pro Seite änderbar über page.abstand); 1 mm = 4 Weltpixel – gelten für das Muster, egal welche Tafelfarbe
T.ABSTAND = {
  kariert: { std: 20, opts: [5, 10, 15, 20, 25, 30], l: 'Kästchengröße' },
  liniert: { std: 20, opts: [9, 12, 15, 20, 25, 30], l: 'Linienabstand' }, lineatur: { std: 15, opts: [5, 7, 10, 15, 20], l: 'Höhe Mittelband' },
  punkte: { std: 20, opts: [10, 15, 20, 25, 30], l: 'Punktabstand' }, noten: { std: 5, opts: [2.5, 3.5, 5, 7], l: 'Linienabstand' }
};
for (const b of T.HINTERGRUENDE) if (b.muster && !T.ABSTAND[b.id]) T.ABSTAND[b.id] = T.ABSTAND[b.muster];
T.gridPx = pg => T.bgInfo(pg.bg).muster === 'kariert' ? (pg.abstand || T.ABSTAND.kariert.std) * 4 : null;
function paintBg(ctx, bg, r, px, abstand) {
  const B = T.bgInfo(bg), muster = B.muster, A = T.ABSTAND[muster];
  const mm = ((A && (abstand || A.std)) || 10) * 4, dk = B.dunkel;
  ctx.fillStyle = T.TAFELFARBEN.find(f => f[0] === B.farbe)[2];
  ctx.fillRect(r.x0 - 2, r.y0 - 2, r.x1 - r.x0 + 4, r.y1 - r.y0 + 4);
  const lw = Math.max(px, 0.6);
  const hlines = (step, off, col, w) => {
    if (step / px < 4) return;
    ctx.beginPath(); for (let y = Math.floor((r.y0 - off) / step) * step + off; y <= r.y1; y += step) { ctx.moveTo(r.x0, y); ctx.lineTo(r.x1, y); }
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  };
  const vlines = (step, col, w) => {
    if (step / px < 4) return;
    ctx.beginPath(); for (let x = Math.floor(r.x0 / step) * step; x <= r.x1; x += step) { ctx.moveTo(x, r.y0); ctx.lineTo(x, r.y1); }
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  };
  // Linienfarben: auf weiß blau/grau, auf schwarz und grün zartes Weiß (wie Kreide)
  const C = dk ? { gitter: 'rgba(255,255,255,.2)', linie: 'rgba(255,255,255,.26)', zart: 'rgba(255,255,255,.18)', kraeftig: 'rgba(255,255,255,.42)', band: 'rgba(255,255,255,.05)', punkt: 'rgba(255,255,255,.5)', noten: 'rgba(255,255,255,.55)' }
    : { gitter: '#bcd2e6', linie: '#a9c4dc', zart: '#c9d6e3', kraeftig: '#7fa3c4', band: 'rgba(120,170,220,.08)', punkt: '#9fb3c8', noten: '#777' };
  switch (muster) {
    case 'kariert': hlines(mm, 0, C.gitter, lw); vlines(mm, C.gitter, lw); break;
    case 'liniert': hlines(mm, 0, C.linie, lw * 1.2); break;
    case 'lineatur': { // Grundschul-/Förderlineatur: Ober-, Mittel-, Grund-, Unterlinie; z = Höhe des Mittelbands
      const z = mm, p = z * 4;
      hlines(p, 0, C.zart, lw); hlines(p, z, C.kraeftig, lw * 1.3); hlines(p, 2 * z, C.kraeftig, lw * 1.3); hlines(p, 3 * z, C.zart, lw);
      if (z / px >= 4) { ctx.fillStyle = C.band; for (let y = Math.floor(r.y0 / p) * p + z; y <= r.y1; y += p) ctx.fillRect(r.x0, y, r.x1 - r.x0, z); }
      break;
    }
    case 'punkte': {
      const st = mm; if (st / px < 6) break; ctx.fillStyle = C.punkt;
      const d = Math.max(1.6, 1.6 * px);
      for (let x = Math.floor(r.x0 / st) * st; x <= r.x1; x += st) for (let y = Math.floor(r.y0 / st) * st; y <= r.y1; y += st) ctx.fillRect(x - d / 2, y - d / 2, d, d);
      break;
    }
    case 'noten':
      for (let k = 0; k < 5; k++) hlines(mm * 11, mm * 3 + k * mm, C.noten, lw * 1.1); // System = 4 Abstände, dazwischen Platz
      break;
  }
}

// ---------- Seite malen ----------
T.paintPage = (ctx, pg, rect, px, o = {}) => {
  const bg = o.export ? pg.bg : T.anzeigeBg(pg); // Export/Druck: immer der gespeicherte Hintergrund
  if (!o.export && T.liveHg) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); } // 📷 Kamera/Fenster: Hintergrund durchsichtig
  else paintBg(ctx, bg, rect, px, pg.abstand);
  const dark = T.bgInfo(bg).dunkel, S = T.S;
  const drag = !o.export && S.drag && S.sel ? S.drag : null;
  if (!drag && T.verbinderAktualisieren) T.verbinderAktualisieren(pg); // haftende Pfeile an die Elemente anpassen
  const vis = it => { const b = T.bbox(it); return !(b.x1 < rect.x0 || b.x0 > rect.x1 || b.y1 < rect.y0 || b.y0 > rect.y1); };
  const each = (filter, fn) => {
    for (const it of pg.items) {
      if (!filter(it)) continue;
      const a = !o.export && it.auf && T.aufZustand ? T.aufZustand(pg, it) : null; // Aufdecken: noch verdeckt (false) oder gerade im Einblenden ({p, eff})
      if (a === false) continue;
      const moved = drag && (S.sel.ids.has(it.id) || (S.dragMit && S.dragMit.has(it.id)));
      if (drag && it.an && !moved && T.verbinderPunkte) { const p = T.verbinderPunkte(pg, it, drag); if (p) { fn({ ...it, p }); continue; } } // Pfeil wandert beim Ziehen mit
      if (!moved && !vis(it)) continue;
      const durch = it.alpha != null && it.alpha < 1; // Deckkraft per Schieberegler
      if (a || moved || durch) {
        ctx.save(); if (durch) ctx.globalAlpha *= it.alpha;
        if (a) T.aufEffekt(ctx, it, a, px); else if (moved) ctx.translate(drag.dx, drag.dy);
        fn(it); ctx.restore();
      } else fn(it);
    }
  };
  each(it => it.t === 'o', it => T.drawObj(ctx, it, dark, px));
  const mitKw = pg.items.some(i => i.kw); /* ◔ Kreiswinkel: Fläche unter, Bogen und Gradzahl über den Linien */
  if (mitKw) T.kreisWinkelMalen(ctx, pg, dark, px, 'flaeche', drag);
  each(it => it.t === 's' && it.m === 'hl', it => T.drawStroke(ctx, it, dark));
  each(it => it.t === 's' && it.m !== 'hl', it => T.drawStroke(ctx, it, dark));
  if (T._wkOrte) T._wkOrte.set(pg, []); /* Lage der antippbaren Winkel jedes Mal neu */
  if (!pg.winkelAus && pg.items.some(i => i.wk)) T.winkelMalen(ctx, pg, dark, px); // 📐 Winkel zwischen Linien (auf der Seite ausblendbar)
  if (mitKw) T.kreisWinkelMalen(ctx, pg, dark, px, 'text', drag);
  if (pg.items.some(i => i.ms || i.mu || i.mf)) T.masseMalen(ctx, pg, dark, px, drag); /* 📏 Maße, Umfang, Flächeninhalt */
  if (T.zellSchatten) each(it => it.t === 'o' && T.hatZellSchatten(it), it => T.zellSchatten(ctx, it, dark)); // Zellenschatten liegt auch über Handschrift
  each(it => it.t === 'o' && it.k === 'abdeckung', it => T.drawObj(ctx, it, dark, px)); // Abdeckung liegt über allem
};

// ---------- Leinwände & Rendern ----------
const cv = T.cv = {};
T.initCanvas = () => {
  for (const id of ['cMain', 'cLive', 'cOver']) { cv[id] = document.getElementById(id); cv[id + 'X'] = cv[id].getContext('2d', id === 'cLive' ? { desynchronized: true } : undefined); } // Live-Strich: Zeichnen mit geringer Verzögerung (Edge/Chrome)
  resize(); addEventListener('resize', resize);
};
function resize() {
  T.dpr = devicePixelRatio || 1; T.W = innerWidth; T.H = innerHeight;
  for (const id of ['cMain', 'cLive', 'cOver']) { cv[id].width = Math.round(T.W * T.dpr); cv[id].height = Math.round(T.H * T.dpr); }
  T.render(); T.renderLive(); T.renderOver();
}
T.lives = new Set(); // Striche, die gerade geschrieben werden (je Stift/Finger einer)
const need = { main: false, live: false, over: false }; let raf = 0;
const req = k => { need[k] = true; if (!raf) raf = requestAnimationFrame(frame); };
T.render = () => req('main'); T.renderLive = () => req('live'); T.renderOver = () => req('over');
// T.ox: Breite der Seitenleiste links – die Tafel beginnt dann rechts davon (geteiltes Fenster)
T.ox = 0;
T.viewRect = () => { const v = T.page().view; return { x0: -v.x / v.z, y0: -v.y / v.z, x1: (T.W - T.ox - v.x) / v.z, y1: (T.H - v.y) / v.z }; };
T.setViewTf = ctx => { const v = T.page().view, d = T.dpr; ctx.setTransform(d * v.z, 0, 0, d * v.z, d * (v.x + T.ox), d * v.y); };
function frame() {
  raf = 0; if (!T.S.board) return;
  const n = { ...need }; need.main = need.live = need.over = false;
  if (n.main) { const ctx = cv.cMainX; T.setViewTf(ctx); T.paintPage(ctx, T.page(), T.viewRect(), 1 / T.page().view.z); T.miniKarte && T.miniKarte(); }
  if (n.live) zeichneLive();
  if (n.over && T.drawOverlay) T.drawOverlay();
}
// Live-Strich schnell zeichnen: nur den geänderten Bereich leeren, Tinte bis zur Stiftspitze
let liveAlt = null; // zuletzt bemalter Bereich (Bildschirmpunkte)
function liveBereich(liste) {
  const v = T.page().view, d = T.dpr; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, rand = 0;
  for (const l of liste) {
    const pts = l.spitze ? l.p.concat([l.spitze]) : l.p;
    for (const q of pts) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
    rand = Math.max(rand, (l.w || 4) * (l.m === 'kalli' ? 1.5 : 1) * (l.fx ? 7 : 1)); // Effekte (Neon-Schein, Schatten) brauchen mehr Rand
  }
  if (!isFinite(x0)) return null;
  const m = (rand * v.z + 16) * d;
  return { x: (x0 * v.z + v.x + T.ox) * d - m, y: (y0 * v.z + v.y) * d - m, w: (x1 - x0) * v.z * d + 2 * m, h: (y1 - y0) * v.z * d + 2 * m };
}
function zeichneLive() {
  const ctx = cv.cLiveX, liste = [T.live, ...T.lives].filter(l => l && l.p.length), laser = T.laserAktiv && T.laserAktiv();
  const neu = laser ? null : liveBereich(liste);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (laser || !liveAlt || !neu) ctx.clearRect(0, 0, cv.cLive.width, cv.cLive.height);
  else { const x0 = Math.min(liveAlt.x, neu.x), y0 = Math.min(liveAlt.y, neu.y); ctx.clearRect(x0, y0, Math.max(liveAlt.x + liveAlt.w, neu.x + neu.w) - x0, Math.max(liveAlt.y + liveAlt.h, neu.y + neu.h) - y0); }
  liveAlt = neu;
  T.setViewTf(ctx);
  const dunkel = T.isDark(T.page());
  for (const l of liste) {
    // Tinte reicht bis zur Stiftspitze; Effekte (Schatten, Neon …) sieht man schon beim Schreiben
    const z = { ...l, p: l.spitze ? l.p.concat([[l.spitze[0], l.spitze[1], l.p[l.p.length - 1][2]]]) : l.p };
    T.drawStroke(ctx, z, dunkel, T.buildPath(z));
  }
  if (T.zeichneLaser) T.zeichneLaser(ctx);
}

// ---------- Verlauf (Rückgängig/Wiederholen) ----------
T.hist = { u: [], r: [] };
const capture = () => ({ page: T.S.page, pages: T.S.board.pages.map(p => ({ ...p, items: p.items.slice() })) });
T.snap = () => {
  T.hist.u.push(capture()); if (T.hist.u.length > 200) T.hist.u.shift();
  T.hist.r.length = 0; T.changed();
};
function restore(s) {
  T.S.board.pages = s.pages.map(p => ({ ...p, items: p.items.slice() }));
  T.S.page = Math.min(s.page, T.S.board.pages.length - 1); T.S.sel = null; T.S.drag = null;
  T.changed(); T.render(); T.renderOver(); T.onPage && T.onPage();
}
T.undo = () => { if (!T.hist.u.length) return; T.hist.r.push(capture()); restore(T.hist.u.pop()); };
T.redo = () => { if (!T.hist.r.length) return; T.hist.u.push(capture()); restore(T.hist.r.pop()); };
T.changed = () => { T.S.dirty = true; if (T.S.board) T.S.board.geaendert = new Date().toISOString(); T.onChange && T.onChange(); };

T.addItem = it => { it.id = it.id || T.uid(); const pgA = T.page(); if (it.t === 's' && (it.wk || it.kw || it.fz) && pgA.wkStart == null) pgA.wkStart = T.opts && T.opts.winkelFrage === false ? 'zahl' : 'frage'; /* neue Seite mit Formen: Winkel zuerst als „?“ */ pgA.items.push(it); T.render(); return it; };
T.replaceItem = it => { const a = T.page().items, i = a.findIndex(x => x.id === it.id); if (i >= 0) a[i] = it; T.render(); };

// ---------- Radieren ----------
function densify(pts, step) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(d / step);
    for (let k = 1; k <= n; k++) { const t = k / (n + 1); out.push([T.r1(a[0] + (b[0] - a[0]) * t), T.r1(a[1] + (b[1] - a[1]) * t), a[2] + (b[2] - a[2]) * t]); }
    out.push(b);
  }
  return out;
}
T.eraseAt = (items, x, y, r, whole) => {
  let changed = false; const out = [];
  for (const it of items) {
    if (it.t !== 's' || !T.hitStroke(it, x, y, r)) { out.push(it); continue; }
    const pts = densify(it.p, Math.max(1.5, r / 4)), rr = r + it.w * 0.3;
    if (!whole && !pts.some(p => Math.hypot(p[0] - x, p[1] - y) <= rr)) { out.push(it); continue; }
    changed = true; if (whole || it.an) continue; // haftende Pfeile verschwinden ganz
    let run = [];
    const flush = arrow => { if (run.length >= 2 || (run.length === 1 && it.m === 'pen')) out.push({ ...it, id: T.uid(), p: run, closed: false, arrow }); run = []; };
    for (const p of pts) { if (Math.hypot(p[0] - x, p[1] - y) <= rr) flush(false); else run.push(p); }
    flush(!!it.arrow);
  }
  return changed ? out : null;
};

// ---------- Ansicht ----------
T.zoomAt = (sx, sy, f) => {
  sx -= T.ox; const v = T.page().view, z = T.clamp(v.z * f, 0.03, 8), wx = (sx - v.x) / v.z, wy = (sy - v.y) / v.z;
  v.z = z; v.x = sx - wx * z; v.y = sy - wy * z; T.render(); T.renderOver(); T.onZoom && T.onZoom();
};
T.resetView = () => { const v = T.page().view; v.x = 0; v.y = 0; v.z = 1; T.render(); T.renderOver(); T.onZoom && T.onZoom(); };
T.viewCenter = () => { const r = T.viewRect(); return [(r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2]; };
})();
