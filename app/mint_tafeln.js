// Tafel-App – MINT-Bildtafeln: Mathe (Prozentstreifen, Bruch – Dezimalzahl – Prozent, Baumdiagramm),
// NaWi (Aggregatzustände, Nahrungskette/-netz, Fotosynthese und Zellatmung), Technik (Binärzahlen, Dreitafelprojektion).
// Alles selbst gezeichnet (SVG); jeder sinntragende Text ist ein eigenes <text> (für „🙈 Erarbeiten“), Überschrift zuerst.
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', ROT = '#c62828', LILA = '#6a1b9a', GRAU = '#64748b', RAND = '#3a6d99', DUNKEL = '#1b1f2a', MITTELGRAU = '#475569';
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const fett = 'font-weight="700"';
const box = (x, y, w, h, rand, fuell, r = 14, sw = 2.5) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const pfeil = (x1, y1, x2, y2, col, w = 4) => { const a = Math.atan2(y2 - y1, x2 - x1), k = 16, ax = x2 - k * Math.cos(a), ay = y2 - k * Math.sin(a);
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(ax)}" y2="${f(ay)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${f(x2)} ${f(y2)} L ${f(ax + 9 * Math.sin(a))} ${f(ay - 9 * Math.cos(a))} L ${f(ax - 9 * Math.sin(a))} ${f(ay + 9 * Math.cos(a))} Z" fill="${col}"/>`; };
const umbruch = (z, max) => { const out = []; let cur = ''; for (const w of String(z).split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const zeilenText = (x, y, t, max, size, col, abst, extra = '', mittig = false) => umbruch(t, max).map((z, i) => (mittig ? mitte : text)(x, y + i * abst, z, size, col, extra)).join('');
const linie = (x1, y1, x2, y2, col, w = 2, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${w}" ${extra}/>`;
const strich = 'stroke-dasharray="6 6"';
/* Pfeilspitze am Ende einer gekrümmten Linie (Richtung von (vx, vy) nach (x, y)) */
const spitze = (vx, vy, x, y, col) => { const l = Math.hypot(x - vx, y - vy) || 1; return pfeil(x - 24 * (x - vx) / l, y - 24 * (y - vy) / l, x, y, col, 4); };
/* Zahl mit Komma, höchstens 2 Nachkommastellen */
const zf = v => String(Math.round(v * 100) / 100).replace('.', ',');
function tafel(icon, titel, W, H, inhalt, P) {
  return { svg: T._svg.doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 42, icon + ' ' + titel, 32, P.ink, fett) + inhalt), w: W, h: H };
}
const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};

// ======================= MATHE =======================

// ---------- Prozentstreifen ----------
const PS_X0 = 80, PS_SW = 840;
/* 🎚 runder Griff zum Anfassen (Ø 40): art 'h' = ↔, 'v' = ↕ */
const griffKnopf = (x, y, col, art) => {
  const p = art === 'v' ? `M ${f(x)} ${f(y - 11)} L ${f(x)} ${f(y + 11)} M ${f(x - 5)} ${f(y - 5)} L ${f(x)} ${f(y - 11)} L ${f(x + 5)} ${f(y - 5)} M ${f(x - 5)} ${f(y + 5)} L ${f(x)} ${f(y + 11)} L ${f(x + 5)} ${f(y + 5)}`
    : `M ${f(x - 11)} ${f(y)} L ${f(x + 11)} ${f(y)} M ${f(x - 5)} ${f(y - 5)} L ${f(x - 11)} ${f(y)} L ${f(x - 5)} ${f(y + 5)} M ${f(x + 5)} ${f(y - 5)} L ${f(x + 11)} ${f(y)} L ${f(x + 5)} ${f(y + 5)}`;
  return `<circle cx="${f(x)}" cy="${f(y)}" r="22" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="${f(x)}" cy="${f(y)}" r="20" fill="${col}" stroke="#ffffff" stroke-width="3"/>` +
    `<path d="${p}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
};
B.ma_prozent = { name: 'Prozentstreifen (G, W, p %)', gruppe: 'Mathe', def: { grundwert: 80, prozent: 25, werte: true },
  felder: [{ k: 'grundwert', l: 'Grundwert G', typ: 'zahl', min: 0, max: 1000000 }, { k: 'prozent', l: 'Prozentsatz p (in %)', typ: 'zahl', min: 0, max: 100 },
    { k: 'werte', l: 'Werte zeigen (aus = leere Felder zum Ausfüllen)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 610, X0 = PS_X0, SW = PS_SW, y1 = 150, y2 = 220;
    let G = +d.grundwert; if (!isFinite(G) || G < 0) G = 80;
    let p = +d.prozent; if (!isFinite(p)) p = 25; p = T.clamp(p, 0, 100);
    const Wert = G * p / 100, xp = X0 + SW * p / 100, zeig = d.werte !== false;
    let s = '';
    s += `<rect x="${X0}" y="${y1}" width="${SW}" height="${y2 - y1}" fill="#ffffff"/>`;
    if (p > 0) s += `<rect x="${X0}" y="${y1}" width="${f(SW * p / 100)}" height="${y2 - y1}" fill="#ffcc80"/>`;
    for (let k = 0; k <= 10; k++) {
      const x = X0 + k * SW / 10;
      s += linie(x, y1, x, y2, '#37474f', k === 0 || k === 10 ? 2.5 : 1.5);
      s += mitte(x, 126, (k * 10) + ' %', 18, P.ink);
      if (zeig) s += mitte(x, 246, zf(G * k / 10), 18, BLAU);
      else s += linie(x - 30, 258, x + 30, 258, GRAU, 1.5, strich);
    }
    s += `<rect x="${X0}" y="${y1}" width="${SW}" height="${y2 - y1}" fill="none" stroke="#37474f" stroke-width="2.5"/>`;
    s += linie(xp, y1 - 10, xp, y2 + 10, ROT, 4, 'stroke-linecap="round"');
    const klammer = (xa, xb, y, col) => `<path d="M ${f(xa)} ${y - 10} L ${f(xa)} ${y} L ${f(xb)} ${y} L ${f(xb)} ${y - 10}" fill="none" stroke="${col}" stroke-width="3"/>`;
    if (p > 0) s += klammer(X0, xp, 284, ORANGE);
    s += text(X0, 310, 'Prozentwert W', 22, ORANGE, fett);
    s += zeig ? text(X0 + 190, 310, '= ' + zf(Wert), 22, ORANGE, fett) : linie(X0 + 190, 322, X0 + 360, 322, GRAU, 1.5, strich);
    s += text(520, 310, 'Prozentsatz p %', 22, ROT, fett);
    s += zeig ? text(730, 310, '= ' + zf(p) + ' %', 22, ROT, fett) : linie(730, 322, 900, 322, GRAU, 1.5, strich);
    s += klammer(X0, X0 + SW, 344, BLAU);
    s += text(X0, 370, 'Grundwert G', 22, BLAU, fett);
    s += zeig ? text(X0 + 190, 370, '= ' + zf(G) + '  (das Ganze = 100 %)', 22, BLAU, fett) : linie(X0 + 190, 382, X0 + 360, 382, GRAU, 1.5, strich);
    s += box(40, 410, 920, 110, RAND, '#eef2f7', 12);
    [['W = G · p : 100', 'Prozentwert berechnen', 193], ['G = W · 100 : p', 'Grundwert berechnen', 500], ['p = W · 100 : G', 'Prozentsatz berechnen', 807]].forEach(([fo, l, x]) => {
      s += mitte(x, 448, fo, 26, DUNKEL, fett) + mitte(x, 488, l, 18, MITTELGRAU); });
    s += linie(347, 425, 347, 505, '#94a3b8', 1.5) + linie(653, 425, 653, 505, '#94a3b8', 1.5);
    if (zeig) s += text(40, 565, 'Beispiel: W = ' + zf(G) + ' · ' + zf(p) + ' : 100 = ' + zf(Wert), 22, P.ink);
    else s += text(40, 565, 'Erst klären: Was ist gegeben – G, W oder p? Was ist gesucht?', 22, P.ink);
    /* 🎚 Griff am Ende der p-%-Fläche: waagerecht ziehen ändert p */
    s += griffKnopf(xp, (y1 + y2) / 2, ROT, 'h');
    const t = tafel('💯', 'Prozentstreifen', W, H, s, P);
    t.teile = [{ id: 'p', x: xp - 22, y: y1 - 12, w: 44, h: y2 - y1 + 24, zieh: true }];
    return t;
  },
  /* p in ganzen Prozent, nahe den 10er-Marken rastet es leicht ein */
  ziehen: (d, id, sx) => {
    if (id !== 'p') return null;
    const roh = T.clamp((sx - PS_X0) / PS_SW * 100, 0, 100), z = Math.round(roh / 10) * 10, p = Math.abs(roh - z) < 0.8 ? z : Math.round(roh);
    return p === +d.prozent ? null : { ...d, prozent: p };
  } };
B.ma_prozent.schnell = [{ l: '👁 Werte ein/aus', f: dd => ({ d: { ...dd, werte: dd.werte === false } }) },
  { l: 'p + 5 %', f: dd => ({ d: { ...dd, prozent: Math.min(100, (+dd.prozent || 0) + 5) } }) },
  { l: 'p − 5 %', f: dd => ({ d: { ...dd, prozent: Math.max(0, (+dd.prozent || 0) - 5) } }) }];
KV['ma_prozent:leer'] = { name: 'Prozentstreifen (leer)', d: { werte: false } };

// ---------- Bruch – Dezimalzahl – Prozent ----------
const BDP = [[1, 2, '0,5', '50 %', 'kreis'], [1, 4, '0,25', '25 %', 'kreis'], [3, 4, '0,75', '75 %', 'kreis'], [1, 5, '0,2', '20 %', 'streifen'],
  [1, 10, '0,1', '10 %', 'streifen'], [1, 3, '0,333…', '≈ 33,3 %', 'kreis'], [1, 100, '0,01', '1 %', 'hundert']];
function bdpBild(z, n, art, cx, cy) {
  const F = '#64b5f6', S = '#37474f';
  if (art === 'kreis') {
    const r = 28, a = -Math.PI / 2 + 2 * Math.PI * z / n, ex = cx + r * Math.cos(a), ey = cy + r * Math.sin(a);
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff"/>`;
    s += `<path d="M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${z / n > 0.5 ? 1 : 0} 1 ${f(ex)} ${f(ey)} Z" fill="${F}"/>`;
    for (let i = 0; i < n; i++) { const b = -Math.PI / 2 + 2 * Math.PI * i / n; s += linie(cx, cy, cx + r * Math.cos(b), cy + r * Math.sin(b), S, 1.5); }
    return s + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${S}" stroke-width="2"/>`;
  }
  if (art === 'streifen') {
    const w = 150, h = 30, x0 = cx - w / 2, y0 = cy - h / 2;
    let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#ffffff"/><rect x="${x0}" y="${y0}" width="${f(w * z / n)}" height="${h}" fill="${F}"/>`;
    for (let i = 1; i < n; i++) s += linie(x0 + w * i / n, y0, x0 + w * i / n, y0 + h, S, 1.5);
    return s + `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${S}" stroke-width="2"/>`;
  }
  const c = 6, x0 = cx - 30, y0 = cy - 30;
  let s = `<rect x="${x0}" y="${y0}" width="60" height="60" fill="#ffffff"/><rect x="${x0}" y="${y0}" width="${c}" height="${c}" fill="${F}"/>`;
  for (let i = 1; i < 10; i++) s += linie(x0 + i * c, y0, x0 + i * c, y0 + 60, '#90a4ae', 0.8) + linie(x0, y0 + i * c, x0 + 60, y0 + i * c, '#90a4ae', 0.8);
  return s + `<rect x="${x0}" y="${y0}" width="60" height="60" fill="none" stroke="${S}" stroke-width="2"/>`;
}
B.ma_bdp = { name: 'Bruch – Dezimalzahl – Prozent', gruppe: 'Mathe', def: { leer: false, bilder: true },
  felder: [{ k: 'leer', l: 'Leer (nur Brüche, Rest frei zum Ausfüllen)', typ: 'check' }, { k: 'bilder', l: 'Bildchen zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, y0 = 80, kh = 54, zh = 76, n = BDP.length, yE = y0 + kh + n * zh, H = yE + 80;
    const SP = [[40, 240, 'Bild'], [240, 420, 'Bruch'], [420, 700, 'Dezimalzahl'], [700, 960, 'Prozent']];
    let s = `<rect x="40" y="${y0}" width="920" height="${kh}" fill="#e3f2fd"/>`;
    SP.forEach(([a, b, t]) => { s += mitte((a + b) / 2, y0 + kh / 2, t, 22, DUNKEL, fett); });
    BDP.forEach(([z, nn, dez, pro, art], i) => {
      const yc = y0 + kh + i * zh + zh / 2;
      if (d.bilder !== false) s += bdpBild(z, nn, art, 140, yc);
      const hb = nn >= 100 ? 26 : 18;
      s += mitte(330, yc - 18, String(z), 26, P.ink, fett) + linie(330 - hb, yc, 330 + hb, yc, P.ink, 2.5) + mitte(330, yc + 19, String(nn), 26, P.ink, fett);
      if (!d.leer) s += mitte(560, yc, dez, 26, P.ink) + mitte(830, yc, pro, 26, P.ink);
    });
    for (let i = 0; i <= n; i++) s += linie(40, y0 + kh + i * zh, 960, y0 + kh + i * zh, GRAU, i === 0 || i === n ? 2.5 : 1.2);
    s += `<rect x="40" y="${y0}" width="920" height="${yE - y0}" fill="none" stroke="${RAND}" stroke-width="2.5"/>`;
    [240, 420, 700].forEach(x => { s += linie(x, y0, x, yE, GRAU, 1.5); });
    s += text(40, yE + 40, 'Prozent heißt „von Hundert“: 1 % = 1/100 = 0,01', 22, P.ink, fett);
    return tafel('🔢', 'Bruch – Dezimalzahl – Prozent', W, H, s, P);
  } };
B.ma_bdp.schnell = [{ l: '👁 Lösungen ein/aus', f: dd => ({ d: { ...dd, leer: !dd.leer } }) }, { l: '🖼 Bilder ein/aus', f: dd => ({ d: { ...dd, bilder: dd.bilder === false } }) }];
KV['ma_bdp:leer'] = { name: 'Bruch – Dezimalzahl – Prozent (leer)', d: { leer: true } };

// ---------- Baumdiagramm ----------
const liste = s => { const l = String(s || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 4); return l.length >= 2 ? l : ['Kopf', 'Zahl']; };
B.ma_baum = { name: 'Baumdiagramm (zweistufig)', gruppe: 'Mathe', def: { stufe1: 'Kopf, Zahl', stufe2: 'Kopf, Zahl', zeigen: false },
  felder: [{ k: 'stufe1', l: 'Ergebnisse 1. Stufe (mit Komma getrennt, 2–4)', typ: 'text' }, { k: 'stufe2', l: 'Ergebnisse 2. Stufe (mit Komma getrennt, 2–4)', typ: 'text' },
    { k: 'zeigen', l: 'Wahrscheinlichkeiten zeigen (gleich wahrscheinlich, als Bruch)', typ: 'check' }],
  gen: (d, P) => {
    const A = liste(d.stufe1), Bl = liste(d.stufe2), n1 = A.length, n2 = Bl.length, L = n1 * n2;
    const sp = L <= 4 ? 88 : L <= 6 ? 70 : L <= 9 ? 54 : 42, y0 = 130, xR = 60, x1 = 280, x2 = 560, W = 1000;
    const bw = t => T.clamp(String(t).length * 12 + 30, 80, 160), bh = Math.min(42, sp - 8), gr = sp >= 54 ? 20 : 18;
    const yBlatt = j => y0 + (j + 0.5) * sp, yK1 = i => y0 + (i * n2 + n2 / 2) * sp, yRoot = y0 + L * sp / 2;
    const zeig = !!d.zeigen;
    let s = '', kanten = '', knoten = '', felder = '';
    s += mitte(x1, 100, '1. Stufe', 20, GRAU, fett) + mitte(x2, 100, '2. Stufe', 20, GRAU, fett) + text(655, 100, 'Ergebnis', 20, GRAU, fett) + mitte(885, 100, 'Wahrscheinlichkeit', 18, GRAU, fett);
    const feld = (xa, ya, xb, yb, t, nn, rh) => { const x = xa + (xb - xa) * t, y = ya + (yb - ya) * t, w = 64;
      return zeig ? `<rect x="${f(x - w / 2)}" y="${f(y - rh / 2)}" width="${w}" height="${f(rh)}" rx="6" fill="${P.papier}"/>` + mitte(x, y, '1/' + nn, 18, P.ink, fett)
        : `<rect x="${f(x - w / 2)}" y="${f(y - rh / 2)}" width="${w}" height="${f(rh)}" rx="6" fill="${P.papier}" stroke="${GRAU}" stroke-width="1.5" ${strich}/>`; };
    knoten += `<circle cx="${xR}" cy="${f(yRoot)}" r="8" fill="${P.ink}"/>`;
    A.forEach((a, i) => {
      const yk = yK1(i), w1 = bw(a);
      kanten += linie(xR, yRoot, x1 - w1 / 2, yk, P.ink, 2.5);
      felder += feld(xR, yRoot, x1 - w1 / 2, yk, 0.55, n1, 32);
      knoten += box(x1 - w1 / 2, yk - bh / 2, w1, bh, BLAU, '#e3f2fd', 10) + mitte(x1, yk, a, gr, DUNKEL, fett);
      Bl.forEach((b, j) => {
        const yb = yBlatt(i * n2 + j), w2 = bw(b);
        kanten += linie(x1 + w1 / 2, yk, x2 - w2 / 2, yb, P.ink, 2.5);
        felder += feld(x1 + w1 / 2, yk, x2 - w2 / 2, yb, 0.62, n2, Math.min(32, 0.62 * sp - 3));
        knoten += box(x2 - w2 / 2, yb - bh / 2, w2, bh, GRUEN, '#e8f5e9', 10) + mitte(x2, yb, b, gr, DUNKEL, fett);
        knoten += text(655, yb, '(' + a + '; ' + b + ')', gr, P.ink);
        knoten += zeig ? mitte(885, yb, '1/' + n1 + ' · 1/' + n2 + ' = 1/' + L, gr, P.ink) : linie(800, yb + 12, 970, yb + 12, GRAU, 1.5, strich);
      });
    });
    s += kanten + felder + knoten;
    const yM = y0 + L * sp + 24;
    s += box(40, yM, 920, 148, RAND, '#eef2f7', 12);
    s += text(60, yM + 26, 'Pfadregeln', 22, RAND, fett);
    s += text(60, yM + 58, 'Produktregel:', 19, DUNKEL, fett) + text(210, yM + 58, 'Wahrscheinlichkeiten entlang eines Pfades multiplizieren.', 19, DUNKEL);
    s += text(60, yM + 88, 'Summenregel:', 19, DUNKEL, fett) + text(210, yM + 88, 'Mehrere Pfade zu einem Ereignis: Pfadwahrscheinlichkeiten addieren.', 19, DUNKEL);
    s += text(60, yM + 120, 'An jedem Verzweigungspunkt ergeben die Wahrscheinlichkeiten zusammen 1.', 19, DUNKEL);
    return tafel('🌳', 'Baumdiagramm', W, yM + 148 + 26, s, P);
  } };
B.ma_baum.schnell = [{ l: '👁 Wahrscheinlichkeiten ein/aus', f: dd => ({ d: { ...dd, zeigen: !dd.zeigen } }) },
  { l: '🪙 Münze 2×', f: dd => ({ d: { ...dd, stufe1: 'Kopf, Zahl', stufe2: 'Kopf, Zahl' } }) },
  { l: '🎨 Glücksrad 3 Farben 2×', f: dd => ({ d: { ...dd, stufe1: 'rot, blau, gelb', stufe2: 'rot, blau, gelb' } }) }];

// ======================= NAWI =======================

// ---------- Aggregatzustände ----------
const FLUESSIG = [[12, 89], [31, 90], [50, 88], [69, 90], [88, 89], [107, 90], [126, 88], [141, 75], [21, 71], [40, 72], [59, 70], [78, 72], [97, 70], [116, 72],
  [11, 53], [30, 54], [49, 52], [68, 55], [88, 52], [107, 55], [127, 54]];
const GAS = [[18, 18, 1, 0.4], [75, 12, -1, 0.6], [132, 28, -0.5, 1], [40, 60, 1, -0.7], [104, 70, 0.8, 0.8], [62, 92, -1, -0.3], [138, 90, -0.6, -1]];
B.nw_aggregat = { name: 'Aggregatzustände und Übergänge', gruppe: 'NaWi', def: { wasser: true },
  felder: [{ k: 'wasser', l: 'Beispiel Wasser zeigen (Eis, Wasser, Wasserdampf; 0 °C / 100 °C)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, wasser = d.wasser !== false, H = wasser ? 680 : 630, yB = 210, hB = 230, yA = 280;
    const K = [[30, 'fest', 'Eis', ['geordnet,', 'fest am Platz'], '#eceff1', '#546e7a'], [390, 'flüssig', 'Wasser', ['ungeordnet, dicht,', 'verschiebbar'], '#e1f5fe', '#0277bd'],
      [750, 'gasförmig', 'Wasserdampf', ['weit entfernt,', 'frei beweglich'], '#f3e5f5', LILA]];
    const teil = (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="8.5" fill="#42a5f5" stroke="#0d47a1" stroke-width="1.5"/>`;
    let s = '';
    K.forEach(([x, n, bsp, besch, fuell, col], i) => {
      const ax = x + 35;
      s += box(x, yB, 220, hB, col, fuell, 16, 3) + mitte(x + 110, yB + 28, n, 26, DUNKEL, fett);
      if (wasser) s += mitte(x + 110, yB + 55, '(' + bsp + ')', 18, MITTELGRAU, 'font-style="italic"');
      if (i === 0) { for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) s += teil(ax + 17.5 + c * 19, yA + 15.5 + r * 19); }
      else if (i === 1) s += `<path d="M ${ax - 6} ${yA + 30} L ${ax - 6} ${yA + 101} L ${ax + 156} ${yA + 101} L ${ax + 156} ${yA + 30}" fill="none" stroke="#90a4ae" stroke-width="2.5"/>` + FLUESSIG.map(([px, py]) => teil(ax + px, yA + py)).join('');
      else s += GAS.map(([px, py, dx, dy]) => linie(ax + px - dx * 22, yA + py - dy * 14, ax + px - dx * 11, yA + py - dy * 7, '#90a4ae', 2, 'stroke-linecap="round"') + teil(ax + px, yA + py)).join('');
      s += mitte(x + 110, yB + 192, besch[0], 18, DUNKEL) + mitte(x + 110, yB + 214, besch[1], 18, DUNKEL);
    });
    const ue = (xa, xb, oben, unten, unten2) => {
      let t = pfeil(xa + 6, 300, xb - 6, 300, ROT, 5) + pfeil(xb - 6, 360, xa + 6, 360, BLAU, 5);
      t += mitte((xa + xb) / 2, unten2 ? 258 : 276, oben, 20, ROT, fett);
      if (unten2) t += mitte((xa + xb) / 2, 280, unten2, 18, ROT);
      return t + mitte((xa + xb) / 2, 386, unten, 20, BLAU, fett);
    };
    s += ue(250, 390, 'Schmelzen', 'Erstarren') + ue(610, 750, 'Verdampfen', 'Kondensieren', '(Sieden)');
    s += `<path d="M 140 ${yB} Q 500 0 860 ${yB}" fill="none" stroke="${ROT}" stroke-width="4"/>` + spitze(500, 0, 860, yB, ROT) + mitte(500, 140, 'Sublimieren', 20, ROT, fett);
    s += `<path d="M 860 ${yB + hB} Q 500 650 140 ${yB + hB}" fill="none" stroke="${BLAU}" stroke-width="4"/>` + spitze(500, 650, 140, yB + hB, BLAU) + mitte(500, 512, 'Resublimieren', 20, BLAU, fett);
    s += pfeil(40, 590, 100, 590, ROT, 5) + text(114, 590, 'Wärme wird zugeführt', 20, ROT, fett);
    s += pfeil(520, 590, 580, 590, BLAU, 5) + text(594, 590, 'Wärme wird abgegeben', 20, BLAU, fett);
    if (wasser) {
      s += text(40, 637, 'Beispiel Wasser (bei Normaldruck):', 20, P.ink, fett);
      s += text(465, 637, 'Schmelztemperatur 0 °C', 20, P.ink) + text(725, 637, 'Siedetemperatur 100 °C', 20, P.ink);
    }
    return tafel('🧊', 'Aggregatzustände', W, H, s, P);
  } };
B.nw_aggregat.schnell = [{ l: '💧 Wasser-Beispiel ein/aus', f: dd => ({ d: { ...dd, wasser: dd.wasser === false } }) }];

// ---------- Nahrungskette / Nahrungsnetz ----------
const ROLLE = { p: ['#c8e6c9', GRUEN], k1: ['#fff59d', '#f9a825'], k2: ['#ffccbc', '#d84315'] };
const NETZ = { Habicht: [300, 125, 'k2'], Meise: [170, 255, 'k2'], Fuchs: [540, 255, 'k2'], Waldkauz: [820, 255, 'k2'],
  Raupe: [120, 390, 'k1'], 'Eichhörnchen': [350, 390, 'k1'], Maus: [590, 390, 'k1'], Reh: [840, 390, 'k1'], Eiche: [300, 525, 'p'], 'Gräser, Kräuter': [720, 525, 'p'] };
const NETZ_PF = [['Eiche', 'Raupe'], ['Eiche', 'Eichhörnchen'], ['Eiche', 'Maus'], ['Eiche', 'Reh'], ['Gräser, Kräuter', 'Maus'], ['Gräser, Kräuter', 'Reh'],
  ['Raupe', 'Meise'], ['Meise', 'Habicht'], ['Eichhörnchen', 'Habicht'], ['Maus', 'Fuchs'], ['Maus', 'Waldkauz']];
const legendePfeil = (x, y, P) => pfeil(x, y, x + 70, y, P.ink, 4) + text(x + 84, y, 'bedeutet: „wird gefressen von“', 20, P.ink, fett);
B.nw_nahrung = { name: 'Nahrungskette / Nahrungsnetz', gruppe: 'NaWi', def: { art: 'kette' },
  felder: [{ k: 'art', l: 'Darstellung', typ: 'auswahl', opts: [['kette', 'Nahrungskette (Gras – Hase – Fuchs)'], ['netz', 'Nahrungsnetz (Wald)'], ['leer', 'Leer (Kästen zum Ausfüllen)']] }],
  gen: (d, P) => {
    const W = 1000; let s = '';
    if (d.art === 'netz') {
      const H = 730, hw = 90, hh = 26;
      const rand = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.min((hw + 6) / Math.abs(dx || 1e-9), (hh + 6) / Math.abs(dy || 1e-9)); return [a[0] + dx * t, a[1] + dy * t]; };
      NETZ_PF.forEach(([v, n]) => { const A = NETZ[v], Bz = NETZ[n], p1 = rand(A, Bz), p2 = rand(Bz, A); s += pfeil(p1[0], p1[1], p2[0], p2[1], P.ink, 3); });
      Object.entries(NETZ).forEach(([n, [x, y, r]]) => { s += box(x - hw, y - hh, 2 * hw, 2 * hh, ROLLE[r][1], ROLLE[r][0], 12, 2.5) + mitte(x, y, n, 22, DUNKEL, fett); });
      [['p', 'Produzenten', 40], ['k1', 'Konsumenten 1. Ordnung', 250], ['k2', 'Konsumenten höherer Ordnung', 580]].forEach(([r, t, x]) => {
        s += `<rect x="${x}" y="608" width="24" height="24" rx="5" fill="${ROLLE[r][0]}" stroke="${ROLLE[r][1]}" stroke-width="2"/>` + text(x + 34, 620, t, 20, P.ink); });
      s += legendePfeil(40, 660, P);
      s += text(40, 698, 'Destruenten (Bakterien, Pilze) zersetzen tote Lebewesen zu Mineralstoffen.', 20, P.ink);
      return tafel('🦊', 'Nahrungsnetz im Wald', W, H, s, P);
    }
    if (d.art === 'leer') {
      const H = 660, R = [[150, 'k2', 'Konsumenten', '2. Ordnung'], [290, 'k1', 'Konsumenten', '1. Ordnung'], [430, 'p', 'Produzenten', '(Pflanzen)']];
      R.forEach(([y, r, a, b]) => {
        s += text(40, y - 14, a, 21, ROLLE[r][1], fett) + text(40, y + 14, b, 21, ROLLE[r][1], fett);
        for (let i = 0; i < 4; i++) s += `<rect x="${265 + i * 180}" y="${y - 32}" width="160" height="64" rx="12" fill="${ROLLE[r][0]}" fill-opacity=".35" stroke="${ROLLE[r][1]}" stroke-width="2.5" ${strich}/>`;
      });
      s += text(40, 530, 'Destruenten', 21, '#6d4c41', fett) + `<rect x="265" y="500" width="700" height="60" rx="12" fill="none" stroke="#6d4c41" stroke-width="2.5" ${strich}/>`;
      s += legendePfeil(40, 610, P);
      return tafel('🦊', 'Nahrungskette / Nahrungsnetz', W, H, s, P);
    }
    const H = 620, K = [[50, 'Gras', 'p', 'Produzent', '(stellt durch Fotosynthese Nährstoffe her)'], [380, 'Hase', 'k1', 'Konsument 1. Ordnung', '(Pflanzenfresser)'],
      [710, 'Fuchs', 'k2', 'Konsument 2. Ordnung', '(Fleischfresser)']];
    K.forEach(([x, n, r, rolle, erkl], i) => {
      s += box(x, 130, 240, 90, ROLLE[r][1], ROLLE[r][0], 16, 3) + mitte(x + 120, 175, n, 30, DUNKEL, fett);
      s += mitte(x + 120, 250, rolle, 22, P.ink, fett) + zeilenText(x + 120, 280, erkl, 27, 18, P.ink, 22, '', true);
      if (i < 2) s += pfeil(x + 248, 175, x + 322, 175, P.ink, 5);
      s += `<line x1="${x + 120}" y1="330" x2="${x + 120}" y2="362" stroke="#6d4c41" stroke-width="3" ${strich}/>` + pfeil(x + 120, 356, x + 120, 378, '#6d4c41', 3);
    });
    s += box(50, 380, 900, 120, '#6d4c41', '#efebe9', 14, 3);
    s += mitte(500, 408, 'Destruenten (Zersetzer): Bakterien und Pilze', 22, DUNKEL, fett);
    s += mitte(500, 440, 'zersetzen tote Lebewesen und Ausscheidungen zu Mineralstoffen.', 20, DUNKEL);
    s += mitte(500, 472, 'Die Mineralstoffe nehmen Pflanzen wieder auf.', 20, DUNKEL);
    s += `<path d="M 50 450 Q 4 330 48 200" fill="none" stroke="${GRUEN}" stroke-width="3" ${strich}/>` + spitze(30, 260, 50, 200, GRUEN);
    s += legendePfeil(40, 545, P);
    s += text(40, 585, 'In Pfeilrichtung werden Stoffe und Energie weitergegeben.', 20, P.ink);
    return tafel('🦊', 'Nahrungskette', W, H, s, P);
  } };
KV['nw_nahrung:kette'] = { name: 'Nahrungskette (Gras – Hase – Fuchs)', d: { art: 'kette' } };
KV['nw_nahrung:netz'] = { name: 'Nahrungsnetz (Wald)', d: { art: 'netz' } };
KV['nw_nahrung:leer'] = { name: 'Nahrungskette / -netz (leer)', d: { art: 'leer' } };

// ---------- Fotosynthese und Zellatmung ----------
B.nw_fotosynthese = { name: 'Fotosynthese und Zellatmung', gruppe: 'NaWi', def: { formel: false },
  felder: [{ k: 'formel', l: 'Chemische Formelgleichungen zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, fo = !!d.formel; let s = '';
    s += box(40, 90, 260, 240, GRUEN, '#e8f5e9', 16, 3) + box(700, 90, 260, 240, '#bf360c', '#fff3e0', 16, 3);
    s += mitte(170, 118, 'Fotosynthese', 24, DUNKEL, fett) + mitte(170, 144, 'in den Chloroplasten', 18, MITTELGRAU);
    s += `<circle cx="80" cy="186" r="16" fill="#ffd54f" stroke="#f9a825" stroke-width="2"/>`;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += linie(80 + 21 * Math.cos(a), 186 + 21 * Math.sin(a), 80 + 29 * Math.cos(a), 186 + 29 * Math.sin(a), '#f9a825', 3, 'stroke-linecap="round"'); }
    s += pfeil(108, 196, 150, 214, '#f9a825', 3);
    s += `<path d="M 130 262 Q 150 182 262 178 Q 246 262 130 262 Z" fill="#66bb6a" stroke="${GRUEN}" stroke-width="3"/><path d="M 130 262 Q 190 230 258 182" fill="none" stroke="${GRUEN}" stroke-width="2.5"/>`;
    s += mitte(80, 228, 'Licht', 18, '#e65100', fett);
    s += mitte(170, 290, 'Lichtenergie wird im', 18, DUNKEL) + mitte(170, 312, 'Traubenzucker gespeichert', 18, DUNKEL);
    s += mitte(830, 118, 'Zellatmung', 24, DUNKEL, fett) + mitte(830, 144, 'in den Mitochondrien', 18, MITTELGRAU);
    s += `<ellipse cx="830" cy="206" rx="85" ry="42" fill="#ffccbc" stroke="#bf360c" stroke-width="3"/>`;
    s += `<path d="M 757 206 q 9.5 -24 19 0 t 19 0 t 19 0 t 19 0 t 19 0 t 19 0 t 19 0 t 19 0" fill="none" stroke="#bf360c" stroke-width="2.5"/>`;
    s += pfeil(830, 250, 830, 290, ORANGE, 4) + mitte(830, 312, 'Energie wird frei', 18, '#bf360c', fett);
    s += mitte(170, 352, '(grüne Pflanzen, bei Licht)', 18, P.ink) + mitte(830, 352, '(Pflanzen und Tiere)', 18, P.ink);
    s += `<path d="M 300 140 Q 500 60 700 140" fill="none" stroke="${GRUEN}" stroke-width="4"/>` + spitze(500, 60, 700, 140, GRUEN) + mitte(500, 78, 'Traubenzucker + Sauerstoff', 20, GRUEN, fett);
    s += `<path d="M 700 290 Q 500 380 300 290" fill="none" stroke="#bf360c" stroke-width="4"/>` + spitze(500, 380, 300, 290, '#bf360c') + mitte(500, 362, 'Kohlenstoffdioxid + Wasser', 20, '#bf360c', fett);
    const hG = fo ? 150 : 110, gl = (y, titel, col, fuell, links, rechts, ueber, unter, fL, fR, unterRechts) => {
      let t = box(40, y, 920, hG, col, fuell, 14, 2.5) + text(60, y + 28, titel, 22, col, fett);
      t += text(60, y + 70, links, 22, DUNKEL) + pfeil(392, y + 70, 568, y + 70, col, 4) + text(585, y + 70, rechts, 22, DUNKEL);
      if (ueber) t += mitte(480, y + 48, ueber, 18, MITTELGRAU, fett);
      if (unter) t += mitte(480, y + 92, unter, 18, MITTELGRAU, fett);
      if (unterRechts) t += text(585, y + 96, unterRechts, 18, col, fett);
      if (fo) t += text(60, y + 128, fL, 22, DUNKEL, fett) + pfeil(392, y + 128, 568, y + 128, col, 4) + text(585, y + 128, fR, 22, DUNKEL, fett);
      return t; };
    const y1 = 400, y2 = y1 + hG + 16;
    s += gl(y1, 'Fotosynthese', GRUEN, '#e8f5e9', 'Kohlenstoffdioxid + Wasser', 'Traubenzucker + Sauerstoff', 'Licht', 'Chlorophyll', '6 CO₂ + 6 H₂O', 'C₆H₁₂O₆ + 6 O₂', '');
    s += gl(y2, 'Zellatmung', '#bf360c', '#fff3e0', 'Traubenzucker + Sauerstoff', 'Kohlenstoffdioxid + Wasser', '', '', 'C₆H₁₂O₆ + 6 O₂', '6 CO₂ + 6 H₂O', 'Energie wird frei');
    return tafel('🌿', 'Fotosynthese und Zellatmung', W, y2 + hG + 30, s, P);
  } };
B.nw_fotosynthese.schnell = [{ l: '⚗ Formeln ein/aus', f: dd => ({ d: { ...dd, formel: !dd.formel } }) }];

// ======================= TECHNIK / INFORMATIK =======================

// ---------- Binärzahlen ----------
const HOCH = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷'];
B.it_binaer = { name: 'Binärzahlen (8 Bit)', gruppe: 'Technik', def: { zahl: 13, bits: true },
  felder: [{ k: 'zahl', l: 'Zahl (0–255)', typ: 'zahl', min: 0, max: 255 }, { k: 'bits', l: 'Bits zeigen (aus = leere Kästen)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 540, n = Math.round(T.clamp(+d.zahl || 0, 0, 255)), zeig = d.bits !== false, teile = [];
    let s = '';
    const summanden = [];
    for (let i = 0; i < 8; i++) {
      const k = 7 - i, wert = 1 << k, bit = (n >> k) & 1, x = 45 + i * 115, cx = x + 52.5;
      if (bit) summanden.push(wert);
      s += mitte(cx, 118, String(wert), 30, BLAU, fett) + mitte(cx, 152, '2' + HOCH[k], 20, GRAU);
      s += box(x, 175, 105, 100, RAND, zeig && bit ? '#c8e6c9' : '#ffffff', 12, 3);
      if (zeig) s += mitte(cx, 227, String(bit), 60, DUNKEL, fett);
      teile.push({ id: 'b' + k, x, y: 175, w: 105, h: 100 });
    }
    s += text(45, 320, 'Rechnung:', 24, P.ink, fett);
    if (zeig) s += text(190, 320, summanden.length ? summanden.join(' + ') + ' = ' + n : 'keine Stelle besetzt: 0', 28, P.ink);
    else s += linie(190, 334, 950, 334, GRAU, 1.5, strich);
    s += text(45, 375, 'Dezimalzahl:', 24, P.ink, fett) + text(240, 375, String(n), 28, BLAU, fett);
    s += text(480, 375, 'Binärzahl:', 24, P.ink, fett);
    if (zeig) s += text(645, 375, n.toString(2).padStart(8, '0'), 28, GRUEN, fett); else s += linie(645, 389, 920, 389, GRAU, 1.5, strich);
    s += text(45, 432, 'Jede Stelle ist doppelt so viel wert wie die Stelle rechts daneben.', 20, P.ink);
    s += text(45, 466, '1 Bit = 0 oder 1 · 8 Bit = 1 Byte · größte Zahl mit 8 Bit: 255', 20, P.ink);
    s += text(45, 505, zeig ? 'Kasten antippen: Bit umschalten (0 ↔ 1)' : 'Kasten antippen: Bits aufdecken', 18, GRAU);
    return { ...tafel('💻', 'Binärzahlen', W, H, s, P), teile };
  } };
B.it_binaer.tippen = (o, id) => {
  const m = /^b([0-7])$/.exec(id); if (!m) return; const k = +m[1];
  T.bausteinAendern(o, { f: dd => dd.bits === false ? { d: { ...dd, bits: true } } : { d: { ...dd, zahl: (Math.round(+dd.zahl || 0) & 255) ^ (1 << k) } } });
};
B.it_binaer.schnell = [{ l: '＋1', f: dd => ({ d: { ...dd, zahl: Math.min(255, Math.round(+dd.zahl || 0) + 1) } }) },
  { l: '−1', f: dd => ({ d: { ...dd, zahl: Math.max(0, Math.round(+dd.zahl || 0) - 1) } }) },
  { l: '🎲 Zufallszahl', f: dd => ({ d: { ...dd, zahl: Math.floor(Math.random() * 256) } }) },
  { l: '👁 Bits ein/aus', f: dd => ({ d: { ...dd, bits: dd.bits === false } }) }];
KV['it_binaer:leer'] = { name: 'Binärzahlen (Bits leer)', d: { bits: false } };

// ---------- Dreitafelprojektion ----------
/* Werkstück: Winkel (L-Profil) – Platte 4 × 3 × 1 (Breite × Tiefe × Höhe), rechts ein Klotz 1 × 3 × 3. x = Breite, y = Tiefe (0 = vorn), z = Höhe. */
B.it_dreitafel = { name: 'Dreitafelprojektion', gruppe: 'Technik', def: { leer: false, hilfs: true },
  felder: [{ k: 'leer', l: 'Nur Rahmen (Ansichten selbst zeichnen)', typ: 'check' }, { k: 'hilfs', l: 'Hilfslinien und Gehrungslinie zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 700, leer = !!d.leer, hilfs = d.hilfs !== false;
    let s = '';
    /* Schrägbild (Kabinettprojektion: Tiefe unter 45°, auf die Hälfte verkürzt) */
    const u2 = 55, OX = 100, OY = 470, q = 0.5 * Math.SQRT1_2;
    const pr = (x, y, z) => [OX + u2 * (x + q * y), OY - u2 * (z + q * y)];
    const flaeche = (pts, fuell) => `<path d="M ${pts.map(p => pr(...p).map(f).join(' ')).join(' L ')} Z" fill="${fuell}" stroke="${DUNKEL}" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += flaeche([[0, 0, 1], [3, 0, 1], [3, 3, 1], [0, 3, 1]], '#eceff1');
    s += flaeche([[0, 0, 0], [4, 0, 0], [4, 0, 3], [3, 0, 3], [3, 0, 1], [0, 0, 1]], '#cfd8dc');
    s += flaeche([[3, 0, 3], [4, 0, 3], [4, 3, 3], [3, 3, 3]], '#eceff1');
    s += flaeche([[4, 0, 0], [4, 3, 0], [4, 3, 3], [4, 0, 3]], '#b0bec5');
    const bl = (a, b, t, col, dx, dy) => { const A = pr(...a), Bp = pr(...b); return pfeil(A[0], A[1], Bp[0], Bp[1], col, 3) + mitte(A[0] + dx, A[1] + dy, t, 22, col, fett); };
    s += bl([1.5, -2.2, 0.5], [1.5, -0.25, 0.5], 'V', ROT, -14, 14);
    s += bl([-1.6, 1.5, 0.5], [-0.2, 1.5, 0.5], 'S', BLAU, -16, 0);
    s += bl([1.5, 1.5, 2.7], [1.5, 1.5, 1.15], 'D', GRUEN, 0, -16);
    s += mitte(215, 205, 'Schrägbild', 22, P.ink, fett);
    s += mitte(215, 535, '(Kabinettprojektion)', 18, GRAU);
    /* Ansichten: Vorderansicht oben links, Draufsicht darunter, Seitenansicht von links rechts daneben */
    const u = 55, g = 55, FX = 470, FY = 320, DY = FY + g, SX = FX + 4 * u + g;
    const V = (x, z) => [FX + x * u, FY - z * u], D = (x, y) => [FX + x * u, DY + (3 - y) * u], S = (y, z) => [SX + (3 - y) * u, FY - z * u];
    const zug = (pts, zu = true) => `<path d="M ${pts.map(p => p.map(f).join(' ')).join(' L ')}${zu ? ' Z' : ''}" fill="none" stroke="${P.ink}" stroke-width="3.5" stroke-linejoin="round"/>`;
    const hl = (a, b) => linie(a[0], a[1], b[0], b[1], GRAU, 1.2);
    if (hilfs && !leer) {
      for (const x of [0, 3, 4]) s += hl(V(x, 0), D(x, 3));
      for (const z of [0, 1, 3]) s += hl([FX + 4 * u, FY - z * u], S(3, z));
      for (const y of [3, 0]) { const dd = (3 - y) * u; s += hl(D(4, y), [SX + dd, DY + dd]) + hl([SX + dd, DY + dd], [SX + dd, FY]); }
    }
    if (hilfs) s += linie(SX - 15, DY - 15, SX + 3 * u + 25, DY + 3 * u + 25, ROT, 1.8) + text(975, 592, 'Gehrungslinie (45°)', 18, ROT, 'text-anchor="end"');
    if (leer) {
      const rahmen = (x, y, w, h) => `<rect x="${f(x - 15)}" y="${f(y - 15)}" width="${f(w + 30)}" height="${f(h + 30)}" rx="8" fill="none" stroke="${GRAU}" stroke-width="1.8" ${strich}/>`;
      s += rahmen(FX, FY - 3 * u, 4 * u, 3 * u) + rahmen(FX, DY, 4 * u, 3 * u) + rahmen(SX, FY - 3 * u, 3 * u, 3 * u);
    } else {
      s += zug([V(0, 0), V(4, 0), V(4, 3), V(3, 3), V(3, 1), V(0, 1)]);
      s += zug([D(0, 0), D(4, 0), D(4, 3), D(0, 3)]) + zug([D(3, 0), D(3, 3)], false);
      s += zug([S(0, 0), S(3, 0), S(3, 3), S(0, 3)]) + zug([S(0, 1), S(3, 1)], false);
    }
    s += mitte(FX + 2 * u, FY - 3 * u - 32, 'Vorderansicht', 20, P.ink, fett);
    s += mitte(SX + 1.5 * u, FY - 3 * u - 48, 'Seitenansicht', 20, P.ink, fett) + mitte(SX + 1.5 * u, FY - 3 * u - 25, 'von links', 18, P.ink);
    s += mitte(FX + 2 * u, DY + 3 * u + 32, 'Draufsicht', 20, P.ink, fett);
    s += text(40, 625, 'Projektionsmethode 1 (Europa): Draufsicht unter der Vorderansicht,', 19, P.ink);
    s += text(40, 652, 'Seitenansicht von links rechts neben der Vorderansicht.', 19, P.ink);
    s += text(40, 680, 'dicke Linie = sichtbare Kante · dünne Linie = Hilfslinie', 18, GRAU);
    return tafel('📐', 'Dreitafelprojektion', W, H, s, P);
  } };
B.it_dreitafel.schnell = [{ l: '✏ Ansichten ein/aus', f: dd => ({ d: { ...dd, leer: !dd.leer } }) }, { l: '📏 Hilfslinien ein/aus', f: dd => ({ d: { ...dd, hilfs: dd.hilfs === false } }) }];
KV['it_dreitafel:leer'] = { name: 'Dreitafelprojektion (leer)', d: { leer: true, hilfs: true } };

// ---------- Von Binärzahlen zur Schrift (ASCII) ----------
/* ASCII ist ein 7-Bit-Code (0–127); druckbar sind 32–126. Im Byte wird er mit führender 0 gespeichert. */
const utf8Bytes = z => { try { return new TextEncoder().encode(z).length; } catch (e) { return 2; } };
B.it_ascii = { name: 'Von Binärzahlen zur Schrift (ASCII)', gruppe: 'Technik', def: { wort: 'Hallo', bits: true, codes: true },
  felder: [{ k: 'wort', l: 'Wort (höchstens 8 Zeichen)', typ: 'text' }, { k: 'bits', l: 'Bits zeigen (aus = leere Kästchen zum Ausfüllen)', typ: 'check' },
    { k: 'codes', l: 'ASCII-Codes (dezimal) zeigen', typ: 'check' }, { k: 'kette', l: 'Kette zeigen: Bits → Zahl → Zeichen → Schrift → Bildschirm', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, alle = Array.from(d.wort == null ? 'Hallo' : String(d.wort)), zeichen = alle.slice(0, 8), gekuerzt = alle.length > 8;
    const leerWort = zeichen.length === 0, n = leerWort ? 6 : zeichen.length, zeigB = d.bits !== false, zeigC = d.codes !== false;
    const cw = Math.min(110, 800 / n), X0 = 160, bw = Math.min(cw - 24, 60), yB = 236, rh = 38;
    const falsch = zeichen.filter(z => { const c = z.codePointAt(0); return c < 32 || c > 126; });
    let s = '';
    s += text(40, 110, 'Zeichen', 20, P.ink, fett);
    s += text(40, 170, 'ASCII-Code', 20, P.ink, fett) + text(40, 194, '(dezimal)', 18, P.ink);
    s += text(40, 222, 'Stellenwert', 18, GRAU, fett);
    for (let k = 0; k < 8; k++) s += text(140, yB + rh / 2 + k * rh, String(128 >> k), 20, BLAU, fett + ' text-anchor="end"');
    for (let i = 0; i < n; i++) {
      const z = leerWort ? '' : zeichen[i], c = leerWort ? -1 : z.codePointAt(0), ok = c >= 32 && c <= 126, cx = X0 + (i + 0.5) * cw, ww = cw - 14;
      s += box(cx - ww / 2, 82, ww, 56, leerWort ? GRAU : ok ? RAND : ROT, ok || leerWort ? '#ffffff' : '#ffebee', 10, 2.5);
      if (!leerWort) s += c === 32 ? mitte(cx, 110, 'Leer', 18, MITTELGRAU, 'font-style="italic"') : mitte(cx, 110, z, 34, DUNKEL, fett);
      s += pfeil(cx, 140, cx, 158, GRAU, 2.5);
      if (!leerWort && !ok) s += box(cx - ww / 2, 160, ww, 42, ROT, '#ffebee', 10, 2.5) + mitte(cx, 181, '?', 26, ROT, fett);
      else if (zeigC && !leerWort) s += box(cx - ww / 2, 160, ww, 42, BLAU, '#e3f2fd', 10, 2.5) + mitte(cx, 181, String(c), 26, DUNKEL, fett);
      else s += `<rect x="${f(cx - ww / 2)}" y="160" width="${f(ww)}" height="42" rx="10" fill="#ffffff" stroke="${GRAU}" stroke-width="1.8" ${strich}/>`;
      s += pfeil(cx, 204, cx, 230, GRAU, 2.5);
      for (let k = 0; k < 8; k++) {
        const y = yB + k * rh + 3, bit = ok ? (c >> (7 - k)) & 1 : 0;
        if (!leerWort && !ok) s += `<rect x="${f(cx - bw / 2)}" y="${f(y)}" width="${f(bw)}" height="${rh - 6}" rx="6" fill="#f1f5f9" stroke="${GRAU}" stroke-width="1.5" ${strich}/>`;
        else s += box(cx - bw / 2, y, bw, rh - 6, RAND, zeigB && ok && bit ? '#c8e6c9' : '#ffffff', 6, 2);
        if (zeigB && ok) s += mitte(cx, y + (rh - 6) / 2, String(bit), 22, DUNKEL, fett);
      }
    }
    const yK = 565, hK = 165;
    s += box(40, yK, 920, hK, RAND, '#eef2f7', 12) + linie(540, yK + 15, 540, yK + hK - 15, '#94a3b8', 1.5);
    s += text(60, yK + 28, 'ASCII-Tabelle (Ausschnitt)', 21, RAND, fett);
    s += text(60, yK + 66, 'A = 65 · B = 66 · C = 67 · … · Z = 90', 20, DUNKEL);
    s += text(60, yK + 100, 'a = 97 · b = 98 · c = 99 · … · z = 122', 20, DUNKEL);
    s += text(60, yK + 134, 'Leerzeichen = 32 · 0 = 48 · … · 9 = 57', 20, DUNKEL);
    s += mitte(750, yK + 36, '1 Zeichen = 1 Byte = 8 Bit', 25, DUNKEL, fett);
    s += mitte(750, yK + 78, 'ASCII ist ein 7-Bit-Code (0 bis 127).', 19, DUNKEL);
    s += mitte(750, yK + 106, 'Im Byte steht vorne eine 0:', 19, DUNKEL);
    s += mitte(750, yK + 134, 'die Stelle 128 ist immer 0.', 19, DUNKEL);
    let y = yK + hK + 36;
    if (falsch.length) {
      const fl = [...new Set(falsch)].map(z => '„' + z + '“');
      const hw = fl.join(', ') + (fl.length > 1 ? ' sind keine ASCII-Zeichen' : ' ist kein ASCII-Zeichen') + ' – Umlaute (ä, ö, ü, ß) fehlen in ASCII.';
      s += zeilenText(40, y, hw, 85, 20, ROT, 28, fett);
      y += 28 * umbruch(hw, 85).length;
      const nb = utf8Bytes(falsch[0]);
      s += text(40, y, 'Unicode (UTF-8) speichert sie mit mehr Bits: „' + falsch[0] + '“ braucht ' + nb + ' Byte = ' + nb * 8 + ' Bit.', 20, P.ink);
      y += 34;
    }
    if (gekuerzt) { s += text(40, y, 'Es werden nur die ersten 8 Zeichen gezeigt.', 18, GRAU); y += 30; }
    if (leerWort) { s += text(40, y, 'Eigenes Wort eintragen: Zeichen → ASCII-Code → 8 Bit', 18, GRAU); y += 30; }
    if (d.kette !== false) { /* Vom Bit zum sichtbaren Buchstaben: Speicher → Programm → Zeichentabelle → Schriftart → Bildschirm */
      const z0 = zeichen.find(z => { const c = z.codePointAt(0); return c > 32 && c <= 126; }) || 'A', c0 = z0.codePointAt(0), bits0 = c0.toString(2).padStart(8, '0');
      const yk = y + 20, kw = 160, kh = 150, schritt = 188, mono = 'font-family="Consolas, Courier New, monospace"';
      s += text(40, yk, 'Wie wird aus Bits ein Buchstabe auf dem Bildschirm?', 23, P.ink, fett);
      const K = [['Speicher', 'nur Bits', '#eef2f7'], ['Programm', 'liest eine Zahl', '#e3f2fd'], ['Zeichentabelle', 'Zahl → Zeichen', '#fff3e0'], ['Schriftart', 'Aussehen', '#f3e5f5'], ['Bildschirm', 'Pixel leuchten', '#e8f5e9']];
      K.forEach(([titel, unter, fuell], i) => { const x = 40 + i * schritt, yy = yk + 26, mx = x + kw / 2;
        s += box(x, yy, kw, kh, RAND, fuell, 12, 2.5) + mitte(mx, yy + 24, titel, 19, DUNKEL, fett) + mitte(mx, yy + kh - 20, unter, 18, MITTELGRAU, 'font-style="italic"');
        if (i < 4) s += pfeil(x + kw + 4, yy + kh / 2, x + schritt - 4, yy + kh / 2, GRAU, 3);
        const ym = yy + kh / 2 + 4;
        if (i === 0) s += mitte(mx, ym, bits0, 22, DUNKEL, fett + ' ' + mono);
        if (i === 1) s += mitte(mx, ym, 'Zahl ' + c0, 26, DUNKEL, fett);
        if (i === 2) s += mitte(mx, ym, c0 + ' = „' + z0 + '“', 26, DUNKEL, fett);
        if (i === 3) s += text(mx - 48, ym, z0, 40, DUNKEL, 'text-anchor="middle" font-family="Georgia, Times New Roman, serif"') + text(mx, ym, z0, 40, DUNKEL, 'text-anchor="middle" font-family="Arial, sans-serif" font-weight="700"') + text(mx + 48, ym, z0, 40, DUNKEL, 'text-anchor="middle" font-family="Comic Sans MS, cursive"');
        if (i === 4) { s += `<g opacity=".9">`; for (let gx = 0; gx < 6; gx++) for (let gy = 0; gy < 5; gy++) s += `<rect x="${f(mx - 42 + gx * 14)}" y="${f(ym - 34 + gy * 14)}" width="12" height="12" fill="#ffffff" stroke="#c8d3e0" stroke-width="1"/>`;
          s += `</g>` + mitte(mx, ym, z0, 46, '#2e7d32', fett + ' ' + mono); }
      });
      let y2 = yk + 26 + kh + 34;
      s += text(40, y2, 'Gleiche Zahl, andere Schriftart: „' + z0 + '“ sieht anders aus – die Zahl ' + c0 + ' bleibt gleich.', 19, P.ink); y2 += 30;
      s += text(40, y2, 'Zeichensalat: Benutzt ein Programm die falsche Tabelle, wird aus „ü“ z. B. „Ã¼“.', 19, P.ink); y2 += 28;
      s += text(40, y2, 'Die Bits stimmen – nur die Übersetzung in Zeichen ist falsch.', 19, P.ink); y = y2 + 24;
    }
    return tafel('🔤', 'Von Binärzahlen zur Schrift', W, y + 4, s, P);
  } };
B.it_ascii.schnell = [{ l: '👁 Bits ein/aus', f: dd => ({ d: { ...dd, bits: dd.bits === false } }) }, { l: '🔢 Codes ein/aus', f: dd => ({ d: { ...dd, codes: dd.codes === false } }) }, { l: '🔗 Kette ein/aus', f: dd => ({ d: { ...dd, kette: dd.kette === false } }) }];
KV['it_ascii:leer'] = { name: 'Von Binärzahlen zur Schrift (leer)', d: { bits: false, codes: false } };

// ---------- EVA-Prinzip ----------
/* Je Beispiel: Eingabe, Verarbeitung, Ausgabe, Speicher */
const EVA = {
  computer: ['Computer', ['Tastatur', 'Maus', 'Mikrofon'], ['Prozessor (CPU)'], ['Bildschirm', 'Lautsprecher', 'Drucker'], ['Festplatte', 'SSD']],
  taschenrechner: ['Taschenrechner', ['Tasten'], ['Rechenwerk'], ['Display'], ['Speichertaste (M)']],
  toaster: ['Toaster', ['Drehregler', 'Hebel'], ['Steuerung (Zeitschalter)'], ['Heizdrähte (Wärme)', 'Hebel springt hoch'], ['kein Speicher']],
  ampel: ['Ampelsteuerung', ['Taster für Fußgänger', 'Sensor'], ['Steuergerät'], ['Lampen rot-gelb-grün'], ['Ampelprogramm (Phasen, Zeiten)']] };
B.it_eva = { name: 'EVA-Prinzip', gruppe: 'Technik', def: { beispiel: 'computer' },
  felder: [{ k: 'beispiel', l: 'Beispiel', typ: 'auswahl', opts: [['computer', 'Computer'], ['taschenrechner', 'Taschenrechner'], ['toaster', 'Toaster'], ['ampel', 'Ampelsteuerung'], ['leer', 'Leer (nur Überschriften)']] }],
  gen: (d, P) => {
    const W = 1000, H = 690, bsp = EVA[d.beispiel], leer = !bsp;
    const K = [[40, 90, 'Eingabe', 'Daten kommen hinein', GRUEN, '#e8f5e9'], [370, 90, 'Verarbeitung', 'Daten werden bearbeitet', BLAU, '#e3f2fd'],
      [700, 90, 'Ausgabe', 'Ergebnisse kommen heraus', ORANGE, '#fff3e0'], [370, 410, 'Speicher', 'Daten werden aufbewahrt', LILA, '#f3e5f5']];
    let s = '';
    K.forEach(([x, y, titel, unter, col, fuell], i) => {
      const h = i < 3 ? 240 : 170;
      s += box(x, y, 260, h, col, fuell, 16, 3) + mitte(x + 130, y + 34, titel, 28, DUNKEL, fett);
      if (leer) return;
      s += mitte(x + 130, y + 66, unter, 18, MITTELGRAU, 'font-style="italic"');
      let yy = y + 108;
      bsp[i + 1].forEach(t => {
        const z = umbruch(t, 19), grau = t === 'kein Speicher';
        s += zeilenText(x + 130, yy, t, 19, 22, grau ? MITTELGRAU : DUNKEL, 27, grau ? '' : fett, true);
        yy += z.length * 27 + 9;
      });
    });
    s += pfeil(306, 210, 364, 210, P.ink, 6) + pfeil(636, 210, 694, 210, P.ink, 6);
    s += pfeil(480, 336, 480, 404, P.ink, 4) + pfeil(520, 404, 520, 336, P.ink, 4);
    s += text(468, 370, 'speichern', 18, P.ink, 'text-anchor="end"') + text(532, 370, 'laden', 18, P.ink);
    s += text(40, 616, 'Merke: Ein Gerät nimmt Daten auf (Eingabe), verarbeitet sie (Verarbeitung)', 20, P.ink, fett);
    s += text(40, 646, 'und gibt ein Ergebnis aus (Ausgabe). Daten können gespeichert werden (Speicher).', 20, P.ink, fett);
    return tafel('⚙', leer ? 'EVA-Prinzip' : 'EVA-Prinzip: ' + bsp[0], W, H, s, P);
  } };
KV['it_eva:computer'] = { name: 'EVA-Prinzip (Computer)', d: { beispiel: 'computer' } };
KV['it_eva:toaster'] = { name: 'EVA-Prinzip (Toaster)', d: { beispiel: 'toaster' } };
KV['it_eva:leer'] = { name: 'EVA-Prinzip (leer)', d: { beispiel: 'leer' } };
})();
