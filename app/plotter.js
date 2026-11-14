// Tafel-App – Funktionsplotter: verschieb-/zoombares Koordinatensystem, Schieberegler, Merkmale, Wertetabelle,
// Tangente, Sekante, Steigungsdreieck, Fläche. „Auf die Tafel“ legt ein Bild ab, das sich wieder im Plotter öffnen lässt.
'use strict';
(function () {
const h = T.h, PI = Math.PI;
const FARBEN = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00897b'];
const zahl = (v, st = 2) => { if (!isFinite(v)) return '–'; const r = Math.round(v * 10 ** st) / 10 ** st; return (Object.is(r, -0) ? 0 : r).toLocaleString('de-DE', { maximumFractionDigits: st }); };

// ---------- Formel-Parser (sicher, ohne eval): Punkt- vor Strichrechnung, Potenzen, implizites Malzeichen ----------
const FUNK = { sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  sqrt: Math.sqrt, wurzel: Math.sqrt, abs: Math.abs, betrag: Math.abs, ln: Math.log, log: Math.log10, lg: Math.log10, exp: Math.exp };
const NAMEN = Object.keys(FUNK).concat(['pi']).sort((a, b) => b.length - a.length);
const PARAM = /^[a-dk-nqrstuvw]$/; // Buchstaben, die als Schieberegler-Parameter gelten (nicht x, e, f, g, h …)
function tokens(s) {
  s = s.replace(/^\s*(?:[fghp]\s*[₀-₉\d]*\s*\(\s*x\s*\)|y)\s*=\s*/i, '').replace(/·|×|\*/g, '*').replace(/:|÷/g, '/').replace(/−|–/g, '-').replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/,/g, '.').toLowerCase();
  const t = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; t.push({ t: 'n', v: parseFloat(s.slice(i, j)) }); i = j; continue; }
    if (/[a-z]/.test(c)) {
      const n = NAMEN.find(n => s.startsWith(n, i));
      if (n) { t.push(n === 'pi' ? { t: 'n', v: PI } : { t: 'f', v: n }); i += n.length; continue; }
      t.push(c === 'e' ? { t: 'n', v: Math.E } : { t: 'v', v: c }); i++; continue;
    }
    if ('+-*/^()'.includes(c)) { t.push({ t: c }); i++; continue; }
    throw new Error('Zeichen „' + c + '“');
  }
  return t;
}
T.formel = text => {
  const tk = tokens(text); let p = 0; const params = new Set();
  const sieh = () => tk[p], nimm = typ => { const x = tk[p]; if (!x || (typ && x.t !== typ)) throw new Error('Eingabe prüfen'); p++; return x; };
  const startetPrimaer = x => x && (x.t === 'n' || x.t === 'v' || x.t === 'f' || x.t === '(');
  const ausdruck = () => { let a = produkt(); while (sieh() && (sieh().t === '+' || sieh().t === '-')) { const op = nimm().t, b = produkt(), l = a; a = op === '+' ? (x, P) => l(x, P) + b(x, P) : (x, P) => l(x, P) - b(x, P); } return a; };
  const produkt = () => { let a = vorzeichen();
    for (;;) { const s = sieh(); if (s && (s.t === '*' || s.t === '/')) { nimm(); const b = vorzeichen(), l = a; a = s.t === '*' ? (x, P) => l(x, P) * b(x, P) : (x, P) => l(x, P) / b(x, P); }
      else if (startetPrimaer(s)) { const b = potenz(), l = a; a = (x, P) => l(x, P) * b(x, P); } else return a; } };
  const vorzeichen = () => { if (sieh() && sieh().t === '-') { nimm(); const a = vorzeichen(); return (x, P) => -a(x, P); } if (sieh() && sieh().t === '+') { nimm(); return vorzeichen(); } return potenz(); };
  const potenz = () => { const b = primaer(); if (sieh() && sieh().t === '^') { nimm(); const e = vorzeichen(); return (x, P) => Math.pow(b(x, P), e(x, P)); } return b; };
  const primaer = () => {
    const s = nimm();
    if (s.t === 'n') { const v = s.v; return () => v; }
    if (s.t === 'v') { if (s.v === 'x') return x => x; if (!PARAM.test(s.v)) throw new Error('Unbekannt: ' + s.v); params.add(s.v); const k = s.v; return (x, P) => (P[k] == null ? 1 : P[k]); }
    if (s.t === 'f') { const fn = FUNK[s.v]; let a; if (sieh() && sieh().t === '(') { nimm(); a = ausdruck(); nimm(')'); } else a = potenz(); return (x, P) => fn(a(x, P)); }
    if (s.t === '(') { const a = ausdruck(); nimm(')'); return a; }
    throw new Error('Eingabe prüfen');
  };
  const f = ausdruck(); if (p < tk.length) throw new Error('Eingabe prüfen');
  return { f, params: [...params].sort() };
};

// ---------- Mathematik: Ableitungen, Nullstellen, Extrema, Wendepunkte, Integral ----------
const abl = (f, x) => { const hh = 1e-5 * (1 + Math.abs(x)); return (f(x + hh) - f(x - hh)) / (2 * hh); };
const abl2 = (f, x) => { const hh = 1e-3 * (1 + Math.abs(x)); return (f(x + hh) - 2 * f(x) + f(x - hh)) / (hh * hh); };
function wechsel(g, a, b, n = 1600) { // Stellen mit Vorzeichenwechsel von g (Bisektion)
  const out = []; let x0 = a, y0 = g(a);
  for (let i = 1; i <= n; i++) {
    const x1 = a + (b - a) * i / n, y1 = g(x1);
    if (isFinite(y0) && isFinite(y1) && (y0 === 0 || y0 * y1 < 0) && Math.abs(y1 - y0) < 1e6) {
      let l = x0, r = x1, yl = y0; if (y0 === 0) { out.push(x0); } else { for (let k = 0; k < 60; k++) { const m = (l + r) / 2, ym = g(m); if (yl * ym <= 0) r = m; else { l = m; yl = ym; } } out.push((l + r) / 2); }
    }
    x0 = x1; y0 = y1;
  }
  const abstand = (b - a) / 2000;
  return out.filter((x, i, liste) => i === 0 || Math.abs(x - liste[i - 1]) > abstand);
}
function merkmale(f, a, b) {
  const tol = (b - a) * 1e-9 + 1e-12;
  const nst = wechsel(f, a, b).filter(x => Math.abs(f(x)) < 1e-6 * (1 + Math.abs(abl(f, x))));
  // doppelte Nullstellen (Berührpunkte): f' wechselt und f ≈ 0
  const ext = wechsel(x => abl(f, x), a, b).map(x => ({ x, y: f(x), art: abl2(f, x) < 0 ? 'Hochpunkt' : 'Tiefpunkt' })).filter(p => isFinite(p.y));
  for (const p of ext) if (Math.abs(p.y) < 1e-7 && !nst.some(x => Math.abs(x - p.x) < tol * 1e6)) nst.push(p.x);
  const wend = wechsel(x => abl2(f, x), a, b, 800).map(x => ({ x, y: f(x) })).filter(p => isFinite(p.y) && Math.abs(abl2(f, p.x - (b - a) / 400) - abl2(f, p.x + (b - a) / 400)) > 1e-6);
  return { nst: nst.sort((u, v) => u - v), ext, wend };
}
// Geradengleichung schön schreiben: y = −x + 2, y = 0,5x, y = 3
const gerade = (m, b) => { const mm = Math.round(m * 100) / 100, bb = Math.round(b * 100) / 100;
  const xs = mm === 0 ? '' : mm === 1 ? 'x' : mm === -1 ? '−x' : (mm < 0 ? '−' : '') + zahl(Math.abs(mm)) + 'x';
  const bs = bb === 0 ? (xs ? '' : '0') : (xs ? (bb < 0 ? ' − ' : ' + ') + zahl(Math.abs(bb)) : (bb < 0 ? '−' : '') + zahl(Math.abs(bb)));
  return 'y = ' + xs + bs; };
const integral = (f, a, b, n = 600) => { const hh = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * hh) * (i % 2 ? 4 : 2); return s * hh / 3; };
T._plotMathe = () => ({ merkmale, integral, flaeche: (...a) => flaeche(...a) }); // für Tests
const flaeche = (f, a, b, n = 2000) => { let s = 0; const hh = (b - a) / n; for (let i = 0; i < n; i++) s += Math.abs(f(a + (i + 0.5) * hh)) * hh; return Math.abs(s); };

// ---------- Achsenteilung ----------
const schoen = roh => { const m = 10 ** Math.floor(Math.log10(roh)), r = roh / m; return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * m; };
const piSchritt = roh => { const q = roh / PI; return PI * (q < 0.375 ? 0.25 : q < 0.75 ? 0.5 : schoen(q)); };
const piText = v => { const q = Math.round(v / PI * 4); if (q === 0) return '0'; const g = (a, b) => b ? g(b, a % b) : Math.abs(a), t = g(q, 4), z = q / t, n = 4 / t;
  const zs = z === 1 ? 'π' : z === -1 ? '−π' : (z < 0 ? '−' : '') + Math.abs(z) + 'π'; return n === 1 ? zs : zs + '/' + n; };

// ---------- Zeichnen (für Fenster und Export) ----------
function zeichne(ctx, W, H, st, F, opt = {}) {
  const fs = opt.fs || 14, X = x => (x - st.xmin) / (st.xmax - st.xmin) * W, Y = y => (st.ymax - y) / (st.ymax - st.ymin) * H;
  const ink = opt.dunkel ? '#e8eaf2' : '#1b1f2a', gitter = opt.dunkel ? 'rgba(255,255,255,.12)' : '#e3e8f0', gitter2 = opt.dunkel ? 'rgba(255,255,255,.22)' : '#c9d3e1';
  ctx.fillStyle = opt.dunkel ? '#151821' : '#ffffff'; ctx.fillRect(0, 0, W, H);
  const sx = st.pi ? piSchritt((st.xmax - st.xmin) / Math.max(4, W / 110)) : schoen((st.xmax - st.xmin) / Math.max(4, W / 90)), sy = schoen((st.ymax - st.ymin) / Math.max(4, H / 70));
  // Gitter
  if (st.gitter !== false) {
    ctx.lineWidth = 1;
    for (const [s, farbe] of [[sx / (st.pi ? 2 : 5), gitter], [sx, gitter2]]) { ctx.strokeStyle = farbe; ctx.beginPath(); for (let x = Math.ceil(st.xmin / s) * s; x <= st.xmax; x += s) { ctx.moveTo(Math.round(X(x)) + .5, 0); ctx.lineTo(Math.round(X(x)) + .5, H); } ctx.stroke(); }
    for (const [s, farbe] of [[sy / 5, gitter], [sy, gitter2]]) { ctx.strokeStyle = farbe; ctx.beginPath(); for (let y = Math.ceil(st.ymin / s) * s; y <= st.ymax; y += s) { ctx.moveTo(0, Math.round(Y(y)) + .5); ctx.lineTo(W, Math.round(Y(y)) + .5); } ctx.stroke(); }
  }
  // Achsen
  const ax = T.clamp(Y(0), 0, H), ay = T.clamp(X(0), 0, W);
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, ax); ctx.lineTo(W, ax); ctx.moveTo(ay, 0); ctx.lineTo(ay, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W, ax); ctx.lineTo(W - 12, ax - 6); ctx.lineTo(W - 12, ax + 6); ctx.fill(); ctx.beginPath(); ctx.moveTo(ay, 0); ctx.lineTo(ay - 6, 12); ctx.lineTo(ay + 6, 12); ctx.fill();
  ctx.font = `${fs}px Segoe UI`; ctx.textBaseline = 'top'; ctx.textAlign = 'center';
  for (let x = Math.ceil(st.xmin / sx) * sx; x <= st.xmax; x += sx) { if (Math.abs(x) < sx / 2) continue; const px = X(x); ctx.fillRect(px - 1, ax - 5, 2, 10); ctx.fillText(st.pi ? piText(x) : zahl(x, 6), px, Math.min(ax + 8, H - fs - 2)); }
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let y = Math.ceil(st.ymin / sy) * sy; y <= st.ymax; y += sy) { if (Math.abs(y) < sy / 2) continue; const py = Y(y); ctx.fillRect(ay - 5, py - 1, 10, 2); ctx.fillText(zahl(y, 6), Math.max(ay - 8, fs * 2.5), py); }
  ctx.font = `italic ${fs + 3}px Segoe UI`; ctx.textAlign = 'right'; ctx.fillText('x', W - 6, ax - 14); ctx.textAlign = 'left'; ctx.fillText('y', ay + 10, 12);
  // Fläche unter der Kurve
  const wz = st.wz || {}, fz = F[wz.fi] && F[wz.fi].f;
  if (wz.art === 'flaeche' && fz) {
    const a = Math.min(wz.a, wz.b), b = Math.max(wz.a, wz.b), farbe = F[wz.fi].farbe;
    ctx.beginPath(); ctx.moveTo(X(a), Y(0)); for (let i = 0; i <= 300; i++) { const x = a + (b - a) * i / 300, y = fz(x); ctx.lineTo(X(x), Y(isFinite(y) ? y : 0)); } ctx.lineTo(X(b), Y(0)); ctx.closePath();
    const ga = ctx.globalAlpha; ctx.globalAlpha = ga * 0.28; ctx.fillStyle = farbe; ctx.fill(); ctx.globalAlpha = ga;
  }
  // Graphen
  for (const g of F) {
    if (!g.f || g.aus) continue;
    ctx.strokeStyle = g.farbe; ctx.lineWidth = opt.dicke || 3.2; ctx.lineJoin = 'round'; ctx.beginPath();
    let zuvor = null; const schritt = (st.xmax - st.xmin) / (W * 2);
    for (let x = st.xmin; x <= st.xmax + schritt; x += schritt) {
      const y = g.f(x), py = Y(y);
      if (!isFinite(y) || Math.abs(py) > H * 50) { zuvor = null; continue; }
      if (zuvor != null && Math.abs(py - zuvor) > H * 1.5) zuvor = null; // Polstelle: nicht verbinden
      if (zuvor == null) ctx.moveTo(X(x), py); else ctx.lineTo(X(x), py); zuvor = py;
    }
    ctx.stroke();
    if (st.namen !== false && g.name) { // Beschriftung am rechten Rand
      for (let x = st.xmax - (st.xmax - st.xmin) * 0.06; x > st.xmin; x -= (st.xmax - st.xmin) / 40) { const y = g.f(x); if (isFinite(y) && y > st.ymin && y < st.ymax) {
        ctx.font = `600 ${fs + 2}px Segoe UI`; ctx.fillStyle = g.farbe; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(g.name, X(x), Y(y) - 6); break; } }
    }
  }
  // markante Punkte
  const punkt = (x, y, farbe, text, form) => {
    const px = X(x), py = Y(y); if (px < -20 || px > W + 20 || py < -20 || py > H + 20) return;
    ctx.fillStyle = farbe; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    if (form === 'raute') { ctx.moveTo(px, py - 8); ctx.lineTo(px + 8, py); ctx.lineTo(px, py + 8); ctx.lineTo(px - 8, py); ctx.closePath(); } else ctx.arc(px, py, 6.5, 0, 2 * PI);
    ctx.fill(); ctx.stroke();
    if (text && st.koord !== false) { ctx.font = `${fs}px Segoe UI`; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.lineWidth = 4; ctx.strokeStyle = opt.dunkel ? '#151821' : '#fff'; ctx.strokeText(text, px + 9, py - 6); ctx.fillStyle = farbe; ctx.fillText(text, px + 9, py - 6); }
  };
  const P = (x, y) => `(${zahl(x)} | ${zahl(y)})`;
  for (const g of F) {
    if (!g.f || g.aus) continue; const m = st.merk || {};
    if (!(m.nst || m.ext || m.wend || m.yab)) continue;
    const M = merkmale(g.f, st.xmin, st.xmax);
    if (m.nst) for (const x of M.nst) punkt(x, 0, g.farbe, 'N' + P(x, 0));
    if (m.ext) for (const e of M.ext) punkt(e.x, e.y, g.farbe, (e.art === 'Hochpunkt' ? 'H' : 'T') + P(e.x, e.y), 'raute');
    if (m.wend) for (const w of M.wend) punkt(w.x, w.y, g.farbe, 'W' + P(w.x, w.y), 'raute');
    if (m.yab) { const y = g.f(0); if (isFinite(y)) punkt(0, y, g.farbe, 'S' + P(0, y)); }
  }
  // Werkzeuge
  const labelBox = (text, px, py, farbe) => { ctx.font = `600 ${fs + 1}px Segoe UI`; const w = ctx.measureText(text).width + 14; const x = T.clamp(px, 4, W - w - 4), y = T.clamp(py, 4, H - fs - 14);
    ctx.fillStyle = opt.dunkel ? 'rgba(21,24,33,.9)' : 'rgba(255,255,255,.92)'; ctx.strokeStyle = farbe; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, fs + 12, 8) : ctx.rect(x, y, w, fs + 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = farbe; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 7, y + (fs + 12) / 2); };
  const linie = (m, x0, y0, farbe, gestrichelt) => { ctx.strokeStyle = farbe; ctx.lineWidth = 2.4; ctx.setLineDash(gestrichelt ? [10, 7] : []); ctx.beginPath(); ctx.moveTo(X(st.xmin), Y(y0 + m * (st.xmin - x0))); ctx.lineTo(X(st.xmax), Y(y0 + m * (st.xmax - x0))); ctx.stroke(); ctx.setLineDash([]); };
  if (fz && wz.art) {
    const farbe = '#334155', g = F[wz.fi];
    if (wz.art === 'tangente' || wz.art === 'dreieck') {
      const x0 = wz.x0, y0 = fz(x0), m = abl(fz, x0), b = y0 - m * x0;
      linie(m, x0, y0, farbe, wz.art === 'dreieck');
      if (wz.art === 'dreieck') {
        const dx = wz.dx || 1, x1 = x0 + dx, y1 = y0 + m * dx;
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(x0), Y(y0)); ctx.lineTo(X(x1), Y(y0)); ctx.lineTo(X(x1), Y(y1)); ctx.stroke();
        ctx.font = `600 ${fs + 2}px Segoe UI`; ctx.fillStyle = '#d97706'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('Δx = ' + zahl(dx), (X(x0) + X(x1)) / 2, Y(y0) + (m >= 0 ? 6 : -fs - 8));
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Δy = ' + zahl(m * dx), X(x1) + 8, (Y(y0) + Y(y1)) / 2);
        labelBox(`m = Δy : Δx = ${zahl(m)}`, X(x1) + 10, Y(y1) - fs - 30, '#d97706');
      } else labelBox(`Tangente: ${gerade(m, b)}   (m = ${zahl(m)})`, X(x0) + 14, Y(y0) + 14, farbe);
      punkt(x0, y0, g.farbe, P(x0, y0));
    } else if (wz.art === 'sekante') {
      const x1 = wz.x1, x2 = wz.x2, y1 = fz(x1), y2 = fz(x2), m = (y2 - y1) / (x2 - x1 || 1e-9), b = y1 - m * x1;
      linie(m, x1, y1, farbe);
      labelBox(`Sekante: ${gerade(m, b)}   (m = ${zahl(m)})`, Math.min(X(x1), X(x2)) + 14, Math.max(Y(y1), Y(y2)) + 14, farbe);
      punkt(x1, y1, g.farbe, 'P' + P(x1, y1)); punkt(x2, y2, g.farbe, 'Q' + P(x2, y2));
    } else if (wz.art === 'flaeche') {
      const a = Math.min(wz.a, wz.b), b = Math.max(wz.a, wz.b);
      for (const x of [wz.a, wz.b]) { ctx.strokeStyle = g.farbe; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(fz(x))); ctx.stroke(); ctx.setLineDash([]); punkt(x, 0, g.farbe, ''); }
      labelBox(`∫ von ${zahl(a)} bis ${zahl(b)} = ${zahl(integral(fz, a, b), 3)}   ·   Fläche ≈ ${zahl(flaeche(fz, a, b), 3)}`, X((a + b) / 2) - 120, 14, g.farbe);
    }
  }
}

// ---------- Fenster ----------
const STANDARD = { xmin: -10, xmax: 10, ymin: -7, ymax: 7 };
T.plotter = (vorlage, objId) => {
  const st = JSON.parse(JSON.stringify(vorlage || { ...STANDARD, terme: ['x^2', ''], params: {}, merk: { nst: false, ext: false, wend: false, yab: false }, pi: false, gitter: true, koord: true, wz: { art: null, fi: 0, x0: 1, dx: 1, x1: -1, x2: 2, a: 0, b: 2 }, wt: { von: -3, bis: 3, schritt: 1, fi: 0 } }));
  st.farben = st.farben || FARBEN.slice(); st.aus = st.aus || [];
  const ov = h('div', { class: 'plot-ov' }), cv = h('canvas', { class: 'plot-cv' }), seite = h('div', { class: 'plot-seite' });
  const kopf = h('div', { class: 'plot-kopf' }, h('b', {}, '📈 Funktionsplotter'), h('span', { style: { flex: 1 } }),
    h('button', { class: 'big prim', onclick: () => aufTafel() }, objId ? '✓ Auf der Tafel aktualisieren' : '⤴ Auf die Tafel'), h('button', { class: 'nzu', title: 'Schließen', onclick: () => ov.remove() }, '×'));
  const nav = h('div', { class: 'plot-nav' },
    h('button', { title: 'Hineinzoomen', onclick: () => zoom(0.8) }, '＋'), h('button', { title: 'Herauszoomen', onclick: () => zoom(1.25) }, '−'),
    h('button', { title: 'Standardansicht', onclick: () => { Object.assign(st, STANDARD); passeAn(); male(); } }, '⌂'));
  ov.append(kopf, h('div', { class: 'plot-haupt' }, seite, h('div', { class: 'plot-flaeche' }, cv, nav)));
  document.body.append(ov);
  let F = [], fokus = null, fokusIdx = 0, fehler = {};
  const uebersetze = () => {
    F = []; const params = new Set();
    st.terme.forEach((t, i) => { const name = 'f' + (st.terme.length > 1 ? '₁₂₃₄₅₆'[i] : '');
      if (!t.trim()) { F.push({ name, farbe: st.farben[i % 6], f: null }); delete fehler[i]; return; }
      try { const r = T.formel(t); r.params.forEach(p => params.add(p)); F.push({ name, farbe: st.farben[i % 6], aus: st.aus[i], f: x => r.f(x, st.params) }); delete fehler[i]; }
      catch (e) { F.push({ name, farbe: st.farben[i % 6], f: null }); fehler[i] = e.message; } });
    for (const p of params) if (st.params[p] == null) st.params[p] = 1;
    st._params = [...params].sort();
  };
  const passeAn = () => { const r = cv.getBoundingClientRect(); if (!r.width) return; const cx = (st.xmin + st.xmax) / 2, cy = (st.ymin + st.ymax) / 2, ex = (st.xmax - st.xmin) / r.width; // gleiche Einheiten in x und y
    st.ymin = cy - ex * r.height / 2; st.ymax = cy + ex * r.height / 2; void cx; };
  const male = () => {
    const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; if (!r.width) return;
    if (cv.width !== Math.round(r.width * d) || cv.height !== Math.round(r.height * d)) { cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
    const ctx = cv.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0);
    zeichne(ctx, r.width, r.height, st, F, { dunkel: document.documentElement.dataset.theme === 'dark', fs: 14 });
    if (st.wz.art && F[st.wz.fi] && F[st.wz.fi].f) griffe().forEach(g => { const px = (g.x - st.xmin) / (st.xmax - st.xmin) * r.width, py = (st.ymax - g.y) / (st.ymax - st.ymin) * r.height;
      ctx.strokeStyle = '#5b5bd6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 16, 0, 2 * PI); ctx.stroke(); });
    wertetabelle();
  };
  const zoom = (k, mx, my) => { const cx = mx == null ? (st.xmin + st.xmax) / 2 : mx, cy = my == null ? (st.ymin + st.ymax) / 2 : my;
    st.xmin = cx + (st.xmin - cx) * k; st.xmax = cx + (st.xmax - cx) * k; st.ymin = cy + (st.ymin - cy) * k; st.ymax = cy + (st.ymax - cy) * k; male(); };
  // Griffe der Werkzeuge (verschiebbar auf dem Graphen bzw. der x-Achse)
  const griffe = () => { const w = st.wz, f = F[w.fi] && F[w.fi].f; if (!f) return [];
    if (w.art === 'tangente' || w.art === 'dreieck') return [{ k: 'x0', x: w.x0, y: f(w.x0) }];
    if (w.art === 'sekante') return [{ k: 'x1', x: w.x1, y: f(w.x1) }, { k: 'x2', x: w.x2, y: f(w.x2) }];
    if (w.art === 'flaeche') return [{ k: 'a', x: w.a, y: 0 }, { k: 'b', x: w.b, y: 0 }];
    return []; };
  // Zeiger: verschieben, mit zwei Fingern zoomen, Griffe ziehen
  const ptr = new Map(); let ziehe = null, pinch = null;
  const welt = e => { const r = cv.getBoundingClientRect(); return [st.xmin + (e.clientX - r.left) / r.width * (st.xmax - st.xmin), st.ymax - (e.clientY - r.top) / r.height * (st.ymax - st.ymin)]; };
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), st: { ...st }, m: welt({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 }) }; ziehe = null; return; }
    const r = cv.getBoundingClientRect(), [wx, wy] = welt(e);
    const g = griffe().find(g => Math.hypot((g.x - st.xmin) / (st.xmax - st.xmin) * r.width - (e.clientX - r.left), (st.ymax - g.y) / (st.ymax - st.ymin) * r.height - (e.clientY - r.top)) < 30);
    ziehe = g ? { griff: g.k } : { x: e.clientX, y: e.clientY, st: { ...st } }; void wx; void wy;
  });
  cv.addEventListener('pointermove', e => {
    if (!ptr.has(e.pointerId)) return; ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = cv.getBoundingClientRect();
    if (pinch && ptr.size >= 2) { const [a, b] = [...ptr.values()], k = pinch.d / Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), p0 = pinch.st, [mx, my] = pinch.m;
      st.xmin = mx + (p0.xmin - mx) * k; st.xmax = mx + (p0.xmax - mx) * k; st.ymin = my + (p0.ymin - my) * k; st.ymax = my + (p0.ymax - my) * k; male(); return; }
    if (!ziehe) return;
    if (ziehe.griff) { const [wx] = welt(e); st.wz[ziehe.griff] = Math.round(wx * 100) / 100; male(); return; }
    const dx = (e.clientX - ziehe.x) / r.width * (ziehe.st.xmax - ziehe.st.xmin), dy = (e.clientY - ziehe.y) / r.height * (ziehe.st.ymax - ziehe.st.ymin);
    st.xmin = ziehe.st.xmin - dx; st.xmax = ziehe.st.xmax - dx; st.ymin = ziehe.st.ymin + dy; st.ymax = ziehe.st.ymax + dy; male();
  });
  const los = e => { ptr.delete(e.pointerId); if (ptr.size < 2) pinch = null; if (!ptr.size) { ziehe = null; seiteBauen(); } };
  cv.addEventListener('pointerup', los); cv.addEventListener('pointercancel', los);
  cv.addEventListener('wheel', e => { e.preventDefault(); const [mx, my] = welt(e); zoom(Math.exp(e.deltaY * 0.0015), mx, my); }, { passive: false });
  new ResizeObserver(() => requestAnimationFrame(() => { passeAn(); male(); })).observe(cv);

  // ---------- Seitenleiste ----------
  let tabelleBox = null;
  const tastatur = () => h('div', { class: 'plot-tasten' }, ...['x', 'x²', '^', '(', ')', '√', 'sin', 'cos', 'tan', 'π', 'a', 'b', 'c', 'e', 'ln', '+', '−', '·', ':', '⌫'].map(k => h('button', { onpointerdown: e => e.preventDefault(), onclick: () => {
    fokus = seite.querySelectorAll('.plot-term')[fokusIdx] || seite.querySelector('.plot-term'); if (!fokus) return; // zuletzt angetipptes Feld
    const ein = { 'x²': 'x^2', '√': '√(', sin: 'sin(', cos: 'cos(', tan: 'tan(', ln: 'ln(', '·': '·', ':': ':' }[k] || k;
    const aktiv = document.activeElement === fokus, s = aktiv ? fokus.selectionStart : fokus.value.length, en = aktiv ? fokus.selectionEnd : s;
    if (k === '⌫') { if (s === en && s > 0) { fokus.value = fokus.value.slice(0, s - 1) + fokus.value.slice(en); fokus.setSelectionRange(s - 1, s - 1); } else { fokus.value = fokus.value.slice(0, s) + fokus.value.slice(en); fokus.setSelectionRange(s, s); } }
    else { fokus.value = fokus.value.slice(0, s) + ein + fokus.value.slice(en); fokus.setSelectionRange(s + ein.length, s + ein.length); }
    fokus.dispatchEvent(new Event('input')); fokus.focus();
  } }, k)));
  const wertetabelle = () => {
    if (!tabelleBox) return; const w = st.wt, g = F[w.fi]; tabelleBox.innerHTML = '';
    if (!g || !g.f) { tabelleBox.append(h('p', { class: 'hint' }, 'Funktion wählen.')); return; }
    const xs = []; const sch = Math.max(Math.abs(+w.schritt) || 1, (Math.abs(w.bis - w.von) || 1) / 60);
    for (let x = +w.von; x <= +w.bis + sch / 1e6 && xs.length < 61; x += sch) xs.push(Math.round(x * 1e9) / 1e9);
    tabelleBox.append(h('div', { class: 'plot-wt' }, h('table', {}, h('tr', {}, h('th', {}, 'x'), ...xs.map(x => h('td', {}, zahl(x, 3)))), h('tr', {}, h('th', { style: { color: g.farbe } }, g.name + '(x)'), ...xs.map(x => h('td', {}, zahl(g.f(x), 3)))))));
  };
  const seiteBauen = () => {
    uebersetze(); seite.innerHTML = '';
    // Funktionen
    seite.append(h('h3', {}, 'Funktionen'));
    st.terme.forEach((t, i) => {
      const inp = h('input', { class: 'feld plot-term' + (fehler[i] ? ' fehler' : ''), value: t, placeholder: 'z. B. 0,5x² − 2  oder  a·sin(b·x)', spellcheck: 'false' });
      const merkeFeld = () => { fokus = inp; fokusIdx = i; };
      inp.addEventListener('focus', merkeFeld); inp.addEventListener('pointerdown', merkeFeld);
      inp.addEventListener('input', () => { st.terme[i] = inp.value; uebersetze(); inp.classList.toggle('fehler', !!fehler[i]); male(); clearTimeout(inp._t); inp._t = setTimeout(() => { const f = document.activeElement === inp; seiteBauen(); if (f) { const n = seite.querySelectorAll('.plot-term')[i]; n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 700); });
      seite.append(h('div', { class: 'plot-fz' },
        h('button', { class: 'plot-farbe', style: { background: st.farben[i % 6] }, title: 'Farbe wechseln', onclick: () => { const k = FARBEN.indexOf(st.farben[i]); st.farben[i] = FARBEN[(k + 1) % FARBEN.length]; seiteBauen(); male(); } }),
        h('span', { class: 'plot-fn' }, F[i].name + '(x) ='), inp,
        h('button', { class: 'pmini', title: 'ein-/ausblenden', onclick: () => { st.aus[i] = !st.aus[i]; seiteBauen(); male(); } }, st.aus[i] ? '🙈' : '👁'),
        h('button', { class: 'pmini', title: 'entfernen', onclick: () => { st.terme.splice(i, 1); st.aus.splice(i, 1); if (!st.terme.length) st.terme.push(''); seiteBauen(); male(); } }, '×')));
      if (fehler[i]) seite.append(h('div', { class: 'hint', style: { color: 'var(--danger)' } }, fehler[i]));
    });
    if (st.terme.length < 6) seite.append(h('button', { class: 'big', onclick: () => { st.terme.push(''); fokusIdx = st.terme.length - 1; seiteBauen(); seite.querySelectorAll('.plot-term')[fokusIdx].focus(); } }, '＋ Funktion'));
    seite.append(tastatur());
    // Schieberegler
    if (st._params.length) {
      seite.append(h('h3', {}, 'Schieberegler'));
      for (const p of st._params) {
        const wert = h('input', { type: 'text', inputmode: 'decimal', class: 'feld plot-pwert', value: String(st.params[p]).replace('.', ','), onchange: e => { st.params[p] = parseFloat(String(e.target.value).replace(',', '.')) || 0; seiteBauen(); male(); } });
        const sl = h('input', { type: 'range', min: -10, max: 10, step: 0.1, value: st.params[p], oninput: e => { st.params[p] = +e.target.value; wert.value = String(st.params[p]).replace('.', ','); male(); } });
        seite.append(h('div', { class: 'plot-param' }, h('b', {}, p + ' ='), sl, wert));
      }
    }
    // Merkmale
    const chk = (k, l) => { const c = h('input', { type: 'checkbox', onchange: e => { st.merk[k] = e.target.checked; male(); } }); c.checked = !!st.merk[k]; return h('label', { class: 'fld check' }, c, l); };
    seite.append(h('h3', {}, 'Markante Punkte'), h('div', { class: 'grid2' }, chk('nst', 'Nullstellen N'), chk('ext', 'Hoch-/Tiefpunkte H/T'), chk('wend', 'Wendepunkte W'), chk('yab', 'y-Achsenabschnitt S')));
    // Werkzeuge
    const fsel = (wert, set) => h('select', { class: 'feld', onchange: e => { set(+e.target.value); male(); seiteBauen(); } }, ...F.map((g, i) => g.f ? h('option', { value: i, selected: i === wert }, g.name) : null).filter(Boolean));
    const WZ = [[null, 'aus'], ['tangente', 'Tangente'], ['sekante', 'Sekante'], ['dreieck', 'Steigungsdreieck'], ['flaeche', 'Fläche/Integral']];
    seite.append(h('h3', {}, 'Werkzeuge'), h('div', { class: 'row' }, ...WZ.map(([k, l]) => h('button', { class: 'big' + (st.wz.art === k ? ' on' : ''), onclick: () => { st.wz.art = k; if (k) { const r = (st.xmax - st.xmin); if (st.wz.x0 < st.xmin || st.wz.x0 > st.xmax) st.wz.x0 = Math.round((st.xmin + r * 0.6) * 10) / 10; } seiteBauen(); male(); } }, l))));
    if (st.wz.art) seite.append(h('div', { class: 'row' }, 'für', fsel(st.wz.fi, v => { st.wz.fi = v; }),
      st.wz.art === 'dreieck' ? h('label', { class: 'row' }, 'Δx =', h('input', { type: 'text', inputmode: 'decimal', class: 'feld plot-pwert', value: String(st.wz.dx || 1).replace('.', ','), onchange: e => { st.wz.dx = parseFloat(String(e.target.value).replace(',', '.')) || 1; male(); } })) : '',
      h('span', { class: 'hint' }, 'Blaue Kreise im Bild ziehen')));
    // Wertetabelle
    const zf = (k, l) => h('label', { class: 'row', style: { gap: '4px' } }, l, h('input', { type: 'text', inputmode: 'decimal', class: 'feld plot-pwert', value: String(st.wt[k]).replace('.', ','), onchange: e => { const v = parseFloat(String(e.target.value).replace(',', '.')); if (isFinite(v)) st.wt[k] = v; wertetabelle(); } }));
    tabelleBox = h('div', {});
    seite.append(h('h3', {}, 'Wertetabelle'), h('div', { class: 'row' }, fsel(st.wt.fi, v => { st.wt.fi = v; }), zf('von', 'von'), zf('bis', 'bis'), zf('schritt', 'Schritt')), tabelleBox,
      h('button', { class: 'big', onclick: wertetabelleAufTafel }, '⤴ Wertetabelle auf die Tafel'));
    // Ansicht
    const ch2 = (k, l) => { const c = h('input', { type: 'checkbox', onchange: e => { st[k] = e.target.checked; male(); } }); c.checked = st[k] !== false && !!(k === 'pi' ? st.pi : true); if (k === 'pi') c.checked = !!st.pi; return h('label', { class: 'fld check' }, c, l); };
    seite.append(h('h3', {}, 'Ansicht'), h('div', { class: 'grid2' }, ch2('pi', 'x-Achse in π-Schritten'), ch2('gitter', 'Gitter'), ch2('koord', 'Koordinaten an Punkten'), ch2('namen', 'Namen der Graphen')),
      h('p', { class: 'hint' }, 'Bild verschieben: ziehen · Zoomen: zwei Finger, Mausrad oder ＋/−. Eingabe z. B. 2x+1, 0,5x^2−3, a(x−b)^2+c, 2^x, sin(x), √x, ln(x). Buchstaben a, b, c, d, k, m, n … werden zu Schiebereglern.'));
    wertetabelle();
  };
  function wertetabelleAufTafel() {
    const w = st.wt, g = F[w.fi]; if (!g || !g.f) return; const xs = [];
    const sch = Math.max(Math.abs(+w.schritt) || 1, (Math.abs(w.bis - w.von) || 1) / 14);
    for (let x = +w.von; x <= +w.bis + sch / 1e6 && xs.length < 15; x += sch) xs.push(Math.round(x * 1e9) / 1e9);
    const inhalt = 'x;' + xs.map(x => zahl(x, 3)).join(';') + '\n' + g.name + '(x);' + xs.map(x => zahl(g.f(x), 3)).join(';');
    const d = { ...T.BAUSTEINE.tabelle.def, zeilen: 2, spalten: xs.length + 1, breite: 2.2, hoehe: 1.3, kopf: false, inhalt };
    const gen = T.genObj('tabelle', d, false), [cx, cy] = T.viewCenter(), z = T.page().view.z, k = Math.min(1 / z, (T.viewRect().x1 - T.viewRect().x0) * 0.8 / gen.w);
    T.snap(); T.addItem({ t: 'o', k: 'tabelle', d, x: cx - gen.w * k / 2, y: cy - gen.h * k / 2, w: gen.w * k, h: gen.h * k, r: 0 }); T.toast('Wertetabelle steht auf der Tafel.');
  }
  function aufTafel() {
    const r = cv.getBoundingClientRect(), W = 1400, H = Math.round(W * r.height / r.width), c = document.createElement('canvas'); c.width = W; c.height = H;
    zeichne(c.getContext('2d'), W, H, st, F, { fs: 20, dicke: 4.5 });
    const src = c.toDataURL('image/png'), plot = JSON.parse(JSON.stringify({ ...st, _params: undefined }));
    const pg = T.page(), alt = objId && pg.items.find(i => i.id === objId);
    T.snap();
    if (alt) { const hh = alt.w * H / W; T.replaceItem({ ...alt, d: { src, plot }, h: hh }); }
    else { const vr = T.viewRect(), k = Math.min((vr.x1 - vr.x0) * 0.6 / W, (vr.y1 - vr.y0) * 0.7 / H), [cx, cy] = T.viewCenter();
      const it = T.addItem({ t: 'o', k: 'graph', d: { src, plot }, x: cx - W * k / 2, y: cy - H * k / 2, w: W * k, h: H * k, r: 0 }); objId = it.id; }
    T.render(); T.toast('Graph steht auf der Tafel – antippen und „📈 Im Plotter öffnen“ wählt ihn wieder.', 3000);
    kopf.querySelector('.prim').textContent = '✓ Auf der Tafel aktualisieren';
  }
  seiteBauen(); requestAnimationFrame(() => { if (!vorlage) passeAn(); male(); });
};
})();
