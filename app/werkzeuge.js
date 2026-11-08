// Tafel-App – Messwerkzeuge (Lineal, Geodreieck, Winkelmesser, Zirkel) und Overlay
'use strict';
(function () {
const S = T.S, CM = T.CM, PI = Math.PI;

// I.s = Vergrößerung des Werkzeugs (Skala bleibt in „Werkzeug-Zentimetern“)
T.toLocal = (I, x, y) => { const k = I.s || 1, dx = x - I.x, dy = y - I.y, c = Math.cos(-I.a), s = Math.sin(-I.a); return [(dx * c - dy * s) / k, (dx * s + dy * c) / k]; };
T.toWorld = (I, lx, ly) => { const k = I.s || 1, c = Math.cos(I.a), s = Math.sin(I.a); lx *= k; ly *= k; return [I.x + lx * c - ly * s, I.y + lx * s + ly * c]; };
T.setAngleAbout = (I, a, lx, ly) => { // dreht um lokalen Punkt (lx,ly), der in der Welt fest bleibt
  const [wx, wy] = T.toWorld(I, lx, ly), k = I.s || 1; I.a = a; const c = Math.cos(a), s = Math.sin(a);
  I.x = wx - (lx * c - ly * s) * k; I.y = wy - (lx * s + ly * c) * k;
};
T.setScaleAbout = (I, sc, lx, ly) => { // vergrößert um lokalen Punkt (lx,ly)
  const [wx, wy] = T.toWorld(I, lx, ly); I.s = T.clamp(sc, 0.5, 4); const k = I.s, c = Math.cos(I.a), s = Math.sin(I.a);
  I.x = wx - (lx * c - ly * s) * k; I.y = wy - (lx * s + ly * c) * k;
};
T.snapAngle = a => { // auf ganze Grad, magnetisch bei 15°-Schritten
  let d = a * 180 / PI; const m = Math.round(d / 15) * 15; d = Math.abs(d - m) < 2.5 ? m : Math.round(d); return d * PI / 180;
};
const degText = a => { let d = Math.round(a * 180 / PI) % 360; if (d < 0) d += 360; return d + '°'; };

const LL = 30 * CM + 40, LH = 100, GR = 8 * CM, WR = 8 * CM;
T.INSTR = {
  lineal: {
    name: 'Lineal',
    edges: [{ t: 'l', a: [0, 0], b: [LL, 0] }, { t: 'l', a: [0, LH], b: [LL, LH] }],
    center: [LL / 2, LH / 2], knob: [LL - 70, LH / 2 + 8], close: [44, LH - 30],
    contains: (x, y) => x >= 0 && x <= LL && y >= 0 && y <= LH,
    draw(ctx, px) {
      ctx.fillStyle = 'rgba(255,248,205,.86)'; ctx.strokeStyle = '#8a7a2a'; ctx.lineWidth = 1.5 * px;
      ctx.beginPath(); ctx.rect(0, 0, LL, LH); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#333'; ctx.fillStyle = '#333'; ctx.lineWidth = Math.max(px, 0.8);
      ctx.font = '600 15px Segoe UI'; ctx.textAlign = 'center'; ctx.beginPath();
      for (let mm = 0; mm <= 300; mm++) {
        const x = 20 + mm * 4, l = mm % 10 === 0 ? 26 : mm % 5 === 0 ? 17 : 10;
        ctx.moveTo(x, 0); ctx.lineTo(x, l);
        if (mm % 10 === 0) ctx.fillText(mm / 10, x, 44);
      }
      ctx.stroke(); ctx.font = '12px Segoe UI'; ctx.fillText('cm', LL - 24, 62);
    }
  },
  geodreieck: {
    name: 'Geodreieck',
    edges: [{ t: 'l', a: [-GR, 0], b: [GR, 0] }, { t: 'l', a: [-GR, 0], b: [0, -GR] }, { t: 'l', a: [0, -GR], b: [GR, 0] }],
    center: [0, -GR / 3], knob: [0, -GR + 62], close: [-GR + 82, -40],
    contains: (x, y) => y <= 0 && Math.abs(x) - y <= GR,
    draw(ctx, px) {
      ctx.fillStyle = 'rgba(214,236,255,.80)'; ctx.strokeStyle = '#3a6d99'; ctx.lineWidth = 1.5 * px;
      ctx.beginPath(); ctx.moveTo(-GR, 0); ctx.lineTo(GR, 0); ctx.lineTo(0, -GR); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(40,80,120,.35)'; ctx.lineWidth = Math.max(px, 0.7); ctx.beginPath();
      for (let k = 1; k <= 5; k++) { ctx.moveTo(-GR, -k * 20); ctx.lineTo(GR, -k * 20); }
      ctx.moveTo(0, 0); ctx.lineTo(0, -GR); ctx.stroke();
      ctx.strokeStyle = '#1d3b57'; ctx.fillStyle = '#1d3b57'; ctx.lineWidth = Math.max(px, 0.8); ctx.beginPath();
      for (let mm = -80; mm <= 80; mm++) { const x = mm * 4, l = mm % 10 === 0 ? 22 : mm % 5 === 0 ? 14 : 8; ctx.moveTo(x, 0); ctx.lineTo(x, -l); }
      const R1 = 200;
      for (let d = 0; d <= 180; d++) {
        const a = -d * PI / 180, l = d % 10 === 0 ? 16 : d % 5 === 0 ? 10 : 5, c = Math.cos(a), s = Math.sin(a);
        ctx.moveTo(c * R1, s * R1); ctx.lineTo(c * (R1 - l), s * (R1 - l));
      }
      ctx.stroke(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '600 13px Segoe UI';
      for (let mm = -80; mm <= 80; mm += 10) if (mm) ctx.fillText(Math.abs(mm / 10), mm * 4, -32);
      ctx.font = '11px Segoe UI';
      for (let d = 10; d < 180; d += 10) {
        const a = -d * PI / 180; ctx.fillText(d, Math.cos(a) * 172, Math.sin(a) * 172);
        ctx.fillStyle = '#b03030'; ctx.fillText(180 - d, Math.cos(a) * 152, Math.sin(a) * 152); ctx.fillStyle = '#1d3b57';
      }
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, 2 * PI); ctx.fill();
      ctx.restore();
    }
  },
  winkelmesser: {
    name: 'Winkelmesser',
    edges: [{ t: 'l', a: [-WR, 0], b: [WR, 0] }, { t: 'c', c: [0, 0], r: WR }],
    center: [0, -WR / 2], knob: [0, -150], close: [0, -88],
    contains: (x, y) => y <= 0 && Math.hypot(x, y) <= WR,
    draw(ctx, px) {
      ctx.fillStyle = 'rgba(225,245,225,.82)'; ctx.strokeStyle = '#3c7a3c'; ctx.lineWidth = 1.5 * px;
      ctx.beginPath(); ctx.arc(0, 0, WR, PI, 2 * PI); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#1f3d1f'; ctx.fillStyle = '#1f3d1f'; ctx.lineWidth = Math.max(px, 0.8); ctx.beginPath();
      for (let d = 0; d <= 180; d++) {
        const a = -d * PI / 180, l = d % 10 === 0 ? 22 : d % 5 === 0 ? 14 : 8, c = Math.cos(a), s = Math.sin(a);
        ctx.moveTo(c * WR, s * WR); ctx.lineTo(c * (WR - l), s * (WR - l));
        if (d % 10 === 0) { ctx.moveTo(c * 70, s * 70); ctx.lineTo(c * 82, s * 82); }
      }
      ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.moveTo(0, 0); ctx.lineTo(0, -20); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let d = 0; d <= 180; d += 10) {
        const a = -d * PI / 180;
        ctx.font = '600 14px Segoe UI'; ctx.fillStyle = '#1f3d1f'; ctx.fillText(d, Math.cos(a) * (WR - 38), Math.sin(a) * (WR - 38));
        ctx.font = '12px Segoe UI'; ctx.fillStyle = '#b03030'; ctx.fillText(180 - d, Math.cos(a) * (WR - 62), Math.sin(a) * (WR - 62));
      }
    }
  }
};

T.toggleInstrument = kind => {
  const i = S.inst.findIndex(x => x.kind === kind);
  if (i >= 0) { S.inst.splice(i, 1); }
  else {
    const [cx, cy] = T.viewCenter();
    if (kind === 'zirkel') S.inst.push({ kind, x: cx - 60, y: cy + 60, r: 3 * CM, a: 0 });
    else {
      const I = { kind, x: 0, y: 0, a: 0 }, D = T.INSTR[kind];
      I.x = cx - D.center[0]; I.y = cy - D.center[1]; S.inst.push(I);
    }
  }
  T.renderOver(); T.onInst && T.onInst();
};

// ----- Zirkel -----
T.zirkelGeom = Z => {
  const N = [Z.x, Z.y], P = [Z.x + Z.r * Math.cos(Z.a), Z.y + Z.r * Math.sin(Z.a)];
  let nx = -Math.sin(Z.a), ny = Math.cos(Z.a); if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
  const hh = Math.max(150, Z.r * 0.55), M = [(N[0] + P[0]) / 2, (N[1] + P[1]) / 2], H = [M[0] + nx * hh, M[1] + ny * hh];
  return { N, P, H, close: [H[0] + nx * 70, H[1] + ny * 70], kreis: [H[0] - ny * 75 + nx * 10, H[1] + nx * 75 + ny * 10] };
};
function drawZirkel(ctx, Z, px) {
  const g = T.zirkelGeom(Z), hr = Math.max(24, 20 * px);
  ctx.save(); ctx.lineCap = 'round';
  ctx.setLineDash([6 * px, 6 * px]); ctx.strokeStyle = 'rgba(30,111,217,.45)'; ctx.lineWidth = 1.5 * px;
  ctx.beginPath(); ctx.arc(g.N[0], g.N[1], Z.r, 0, 2 * PI); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#6b7380'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(g.N[0], g.N[1]); ctx.lineTo(g.H[0], g.H[1]); ctx.lineTo(g.P[0], g.P[1]); ctx.stroke();
  ctx.strokeStyle = '#aab2bd'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(g.N[0], g.N[1]); ctx.lineTo(g.H[0], g.H[1]); ctx.lineTo(g.P[0], g.P[1]); ctx.stroke();
  const grip = (p, col, txt) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], hr, 0, 2 * PI); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `600 ${hr * 0.9}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, p[0], p[1] + 1);
  };
  grip(g.H, 'rgba(30,111,217,.92)', '↻'); grip(g.N, 'rgba(90,98,110,.9)', '✥'); grip(g.P, S.farbe.stift === '#ffffff' ? '#444' : S.farbe.stift, '↔');
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(g.N[0], g.N[1], 3 * px, 0, 2 * PI); ctx.fill();
  grip(g.close, 'rgba(200,50,50,.85)', '×'); grip(g.kreis, 'rgba(30,140,80,.9)', '◯');
  const lbl = 'r = ' + T.zahl(Z.r / CM, 1) + ' cm';
  ctx.font = `600 ${18 * px}px Segoe UI`; const tw = ctx.measureText(lbl).width;
  const lx = (g.N[0] + g.P[0]) / 2, ly = (g.N[1] + g.P[1]) / 2 + 30 * px;
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(lx - tw / 2 - 6 * px, ly - 13 * px, tw + 12 * px, 26 * px);
  ctx.fillStyle = '#123'; ctx.fillText(lbl, lx, ly);
  ctx.restore();
}

function drawInstrument(ctx, I, px) {
  if (I.kind === 'zirkel') return drawZirkel(ctx, I, px);
  const D = T.INSTR[I.kind], k = I.s || 1, hr = Math.max(24, 20 * px) / k;
  ctx.save(); ctx.translate(I.x, I.y); ctx.rotate(I.a); ctx.scale(k, k); px /= k;
  ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  D.draw(ctx, px); ctx.shadowColor = 'transparent';
  const btn = (p, col, txt) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], hr, 0, 2 * PI); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `600 ${hr}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, p[0], p[1] + 1);
  };
  btn(D.knob, 'rgba(30,111,217,.9)', '↻'); btn(D.close, 'rgba(200,50,50,.85)', '×');
  ctx.font = `600 ${15 * px}px Segoe UI`; ctx.fillStyle = '#123'; ctx.textAlign = 'center';
  ctx.fillText(degText(-I.a) + (k !== 1 ? '  ·  ' + Math.round(k * 100) + ' %' : ''), D.knob[0], D.knob[1] + hr + 14 * px);
  ctx.restore();
}

// Kanten-Suche fürs Entlangzeichnen
T.findEdge = (x, y, tol) => {
  let best = null;
  for (const I of S.inst) {
    if (I.kind === 'zirkel') continue;
    const [lx, ly] = T.toLocal(I, x, y);
    for (const e of T.INSTR[I.kind].edges) {
      let d;
      if (e.t === 'l') {
        const dx = e.b[0] - e.a[0], dy = e.b[1] - e.a[1], L2 = dx * dx + dy * dy, t = ((lx - e.a[0]) * dx + (ly - e.a[1]) * dy) / L2;
        if (t < -0.02 || t > 1.02) continue; d = T.distSeg(lx, ly, e.a[0], e.a[1], e.b[0], e.b[1]);
      } else {
        if (ly > 5) continue; d = Math.abs(Math.hypot(lx - e.c[0], ly - e.c[1]) - e.r);
      }
      d *= I.s || 1;
      if (d <= tol && (!best || d < best.d)) best = { I, e, d };
    }
  }
  return best;
};
T.edgeParam = (I, e, x, y) => { // Linie: t in [0,1]; Kreis: Winkel in [-π,0]
  const [lx, ly] = T.toLocal(I, x, y);
  if (e.t === 'l') { const dx = e.b[0] - e.a[0], dy = e.b[1] - e.a[1]; return T.clamp(((lx - e.a[0]) * dx + (ly - e.a[1]) * dy) / (dx * dx + dy * dy), 0, 1); }
  let a = Math.atan2(ly - e.c[1], lx - e.c[0]); if (a > 0) a = a > PI / 2 ? -PI : 0; return a;
};
T.edgePoint = (I, e, t) => e.t === 'l'
  ? T.toWorld(I, e.a[0] + (e.b[0] - e.a[0]) * t, e.a[1] + (e.b[1] - e.a[1]) * t)
  : T.toWorld(I, e.c[0] + e.r * Math.cos(t), e.c[1] + e.r * Math.sin(t));
T.edgeLen = e => e.t === 'l' ? Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]) : e.r;

// Was liegt unter dem Zeiger? (für Eingabe)
T.instHit = (x, y, px) => {
  const hr = Math.max(24, 20 * px) + 6 * px;
  for (let i = S.inst.length - 1; i >= 0; i--) {
    const I = S.inst[i];
    if (I.kind === 'zirkel') {
      const g = T.zirkelGeom(I), near = p => Math.hypot(x - p[0], y - p[1]) <= hr;
      if (near(g.close)) return { I, part: 'close' };
      if (near(g.kreis)) return { I, part: 'kreis' };
      if (near(g.H)) return { I, part: 'dreh' };
      if (near(g.P)) return { I, part: 'radius' };
      if (near(g.N)) return { I, part: 'move' };
      if (T.distSeg(x, y, g.N[0], g.N[1], g.H[0], g.H[1]) < 14 * px + 6 || T.distSeg(x, y, g.H[0], g.H[1], g.P[0], g.P[1]) < 14 * px + 6) return { I, part: 'move' };
      continue;
    }
    const D = T.INSTR[I.kind], [lx, ly] = T.toLocal(I, x, y), lr = hr / (I.s || 1);
    if (Math.hypot(lx - D.close[0], ly - D.close[1]) <= lr) return { I, part: 'close' };
    if (Math.hypot(lx - D.knob[0], ly - D.knob[1]) <= lr) return { I, part: 'knob' };
    if (D.contains(lx, ly)) return { I, part: 'body' };
  }
  return null;
};

// ---------- Overlay ----------
T.overlay = { cursor: null, band: null, label: null };
T.selBounds = () => {
  const sel = S.sel; if (!sel || !sel.ids.size) return null;
  const items = T.page().items.filter(it => sel.ids.has(it.id)); if (!items.length) return null;
  if (items.length === 1 && items[0].t === 'o') return { obj: items[0] };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of items) { const b = T.bbox(it); x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1); }
  return { x0, y0, x1, y1 };
};
T.groupHandles = (sb, px) => { const o = T.eckForm && T.eckForm() ? 34 * px : 0; /* Form mit Eckgriffen: ✥ und ⤡ etwas nach außen, damit die Ecken frei bleiben */
  return { scale: [sb.x1 + o, sb.y1 + o], rot: [(sb.x0 + sb.x1) / 2, sb.y0 - 46 * px - o], move: [sb.x0 - o, sb.y0 - o] }; };
T.objHandles = (o, px) => {
  const c = T.objCorners(o), a = (o.r || 0) * PI / 180, cx = o.x + o.w / 2, cy = o.y + o.h / 2, d = o.h / 2 + 46 * px;
  return { scale: c[2], rot: [cx + Math.sin(a) * d, cy - Math.cos(a) * d], move: c[0], corners: c }; // ✥ oben links, ⤡ unten rechts, ↻ oben
};
T.drawOverlay = () => {
  const ctx = T.cv.cOverX, px = 1 / T.page().view.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, T.cv.cOver.width, T.cv.cOver.height);
  T.setViewTf(ctx);
  for (const I of S.inst) drawInstrument(ctx, I, px);
  T.aufMarken && T.aufMarken(ctx, px); // Nummern der Aufdeck-Schritte (nur beim Vorbereiten)
  // Auswahl
  const sb = T.selBounds(), dx = S.drag ? S.drag.dx : 0, dy = S.drag ? S.drag.dy : 0;
  let anchor = null;
  if (sb) {
    ctx.save(); ctx.translate(dx, dy); ctx.strokeStyle = '#1e6fd9'; ctx.lineWidth = 2 * px; ctx.setLineDash([8 * px, 6 * px]);
    if (sb.obj) {
      const h = T.objHandles(sb.obj, px), c = h.corners;
      ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(c[i][0], c[i][1]); ctx.closePath(); ctx.stroke();
      ctx.setLineDash([]); const top = [(c[0][0] + c[1][0]) / 2, (c[0][1] + c[1][1]) / 2];
      if (!sb.obj.fest) { ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(h.rot[0], h.rot[1]); ctx.stroke(); }
      const hr = 20 * px;
      for (const [p, t] of sb.obj.fest ? [[h.scale, '🔒']] : [[h.move, '✥'], [h.scale, '⤡'], [h.rot, '↻']]) { // fixiert: Schloss statt Griffe
        ctx.fillStyle = '#1e6fd9'; ctx.beginPath(); ctx.arc(p[0], p[1], hr, 0, 2 * PI); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `600 ${hr * 1.1}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, p[0], p[1] + px);
      }
      if (T.koerperGriffe && !S.drag) for (const q of T.koerperGriffe(sb.obj)) { // 🧊 Maße ziehen (orange)
        ctx.setLineDash([]); ctx.beginPath(); ctx.arc(q.x, q.y, 14 * px, 0, 2 * PI); ctx.fillStyle = '#ffedd5'; ctx.fill(); ctx.lineWidth = 4 * px; ctx.strokeStyle = '#ea580c'; ctx.stroke();
        ctx.fillStyle = '#c2410c'; ctx.font = `italic 700 ${15 * px}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(q.name, q.x, q.y + px);
      }
      const te = T.teilEcken && T.teilEcken(sb.obj); // angetipptes Feld hervorheben
      if (te) {
        ctx.beginPath(); ctx.moveTo(te[0][0], te[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(te[i][0], te[i][1]); ctx.closePath();
        ctx.fillStyle = 'rgba(91,91,214,.16)'; ctx.fill(); ctx.strokeStyle = '#5b5bd6'; ctx.lineWidth = 4 * px; ctx.setLineDash([]); ctx.stroke();
      }
      if (T.overlay.rotDeg != null) { ctx.fillStyle = '#123'; ctx.font = `600 ${16 * px}px Segoe UI`; ctx.fillText(T.overlay.rotDeg + '°', h.rot[0], h.rot[1] - 34 * px); }
      anchor = { x0: Math.min(...c.map(p => p[0])) + dx, x1: Math.max(...c.map(p => p[0])) + dx, y0: Math.min(...c.map(p => p[1]), h.rot[1]) + dy, y1: Math.max(...c.map(p => p[1])) + dy };
    } else {
      ctx.strokeRect(sb.x0, sb.y0, sb.x1 - sb.x0, sb.y1 - sb.y0);
      // Griffe auch für Gruppen und Handschrift: ⤡ vergrößern, ↻ drehen (fixiert: Schloss)
      const h = T.groupHandles(sb, px), fest = T.page().items.some(it => it.fest && S.sel.ids.has(it.id)), hr = 20 * px;
      ctx.setLineDash([]);
      if (!fest) { ctx.beginPath(); ctx.moveTo((sb.x0 + sb.x1) / 2, sb.y0); ctx.lineTo(h.rot[0], h.rot[1]); ctx.stroke(); }
      for (const [p, t] of fest ? [[h.scale, '🔒']] : [[h.move, '✥'], [h.scale, '⤡'], [h.rot, '↻']]) {
        ctx.fillStyle = '#1e6fd9'; ctx.beginPath(); ctx.arc(p[0], p[1], hr, 0, 2 * PI); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `600 ${hr * 1.1}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, p[0], p[1] + px);
      }
      if (T.overlay.rotDeg != null) { ctx.fillStyle = '#123'; ctx.font = `600 ${16 * px}px Segoe UI`; ctx.fillText(T.overlay.rotDeg + '°', h.rot[0], h.rot[1] - 34 * px); }
      const ef = !fest && T.eckForm && T.eckForm(); /* ◉ Eckgriffe: anfassen und ziehen */
      if (ef) T.eckGriffe(ef).forEach((q, i) => { const fb = T.eckGriffFarbe ? T.eckGriffFarbe(ef, i) : '#1e6fd9'; /* Kreiswinkel: orange = Winkel verstellen */
        ctx.beginPath(); ctx.arc(q[0], q[1], 13 * px, 0, 2 * PI); ctx.fillStyle = fb === '#ea580c' ? '#ffedd5' : '#fff'; ctx.fill(); ctx.lineWidth = 4 * px; ctx.strokeStyle = fb; ctx.stroke(); ctx.beginPath(); ctx.arc(q[0], q[1], (fb === '#ea580c' ? 6 : 4) * px, 0, 2 * PI); ctx.fillStyle = fb; ctx.fill(); });
      anchor = { x0: sb.x0 + dx, x1: sb.x1 + dx, y0: (fest ? sb.y0 : h.rot[1] - hr) + dy, y1: sb.y1 + dy };
    }
    ctx.restore();
  }
  T.placeSelBar && T.placeSelBar(anchor);
  const o = T.overlay;
  if (o.band) {
    ctx.fillStyle = 'rgba(30,111,217,.08)'; ctx.strokeStyle = '#1e6fd9'; ctx.lineWidth = 1.5 * px; ctx.setLineDash([6 * px, 4 * px]);
    const b = o.band; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); ctx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); ctx.setLineDash([]);
  }
  if (o.ziel) { // Verbindungspfeil: hier würde er andocken
    const c = T.objCorners(o.ziel); ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(c[i][0], c[i][1]); ctx.closePath();
    ctx.fillStyle = 'rgba(91,91,214,.12)'; ctx.fill(); ctx.strokeStyle = '#5b5bd6'; ctx.lineWidth = 4 * px; ctx.setLineDash([]); ctx.stroke();
  }
  if (o.cursor) {
    ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.5 * px; ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); ctx.arc(o.cursor.x, o.cursor.y, o.cursor.r, 0, 2 * PI); ctx.fill(); ctx.stroke();
  }
  if (o.label) {
    ctx.font = `600 ${20 * px}px Segoe UI`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(o.label.t).width, x = o.label.x + 22 * px, y = o.label.y - 26 * px;
    ctx.fillStyle = 'rgba(20,30,45,.85)'; ctx.fillRect(x - 8 * px, y - 15 * px, tw + 16 * px, 30 * px);
    ctx.fillStyle = '#fff'; ctx.fillText(o.label.t, x, y);
  }
};
})();
