// Tafel-App – 📢 Belehrungen zu Beginn des Schuljahres (Niedersachsen, Oberschule Jg. 5–10): Bildtafeln zum Besprechen mit der ganzen Klasse
// Übersicht zum Abhaken · Feueralarm · Unfall/Erste Hilfe · Waffenerlass · Infektionsschutz (§ 34 IfSG) · Schulweg · Pause · Handy/Fotos/Cybermobbing ·
// Rauchen/Alkohol/Drogen · Fehlzeiten · Sport · Fachräume · Eigentum. Alles selbst gezeichnet (SVG); schulspezifische Angaben unter ✏️ Bearbeiten oder mit dem Stift auf die Linien.
// Rechtsstand: November 2026 – Fundstellen jeweils klein unten in der Tafel.
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', ROT = '#c62828', LILA = '#6a1b9a', GRAU = '#64748b', RAND = '#3a6d99', DUNKEL = '#1b1f2a';
const SGRUEN = '#1e8a3c', SROT = '#d32f2f', WEISS = '#ffffff', GELB = '#f9c80e';
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const fett = 'font-weight="700"';
const box = (x, y, w, h, rand, fuell, r = 14, sw = 2.5) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const umbruch = (z, max) => { const out = []; let cur = ''; for (const w of String(z).split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const zeilenText = (x, y, t, max, size, col, abst, extra = '', mittig = false) => umbruch(t, max).map((z, i) => (mittig ? mitte : text)(x, y + i * abst, z, size, col, extra)).join('');
const linie = (x1, y1, x2, y2, col, w = 2, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const kreis = (cx, cy, r, fuell, rand = 'none', sw = 0) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const variante = (k, name, d) => { T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {}; T.KACHEL_VARIANTEN[k] = { name, d }; };
function tafel(icon, titel, W, H, inhalt, P) {
  return { svg: T._svg.doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 42, icon + ' ' + titel, 32, P.ink, fett) + inhalt), w: W, h: H };
}

// ---------- Bausteine für die Tafeln: Regel-Kasten, Felder zum Ausfüllen, Spalten, Fußzeile ----------
/* Kasten mit Überschrift und Regeln; jede Zeile ein eigenes <text> (fürs „Erarbeiten“). Liefert eine Bau-Funktion (x, y, w) => { s, h } */
const K = (titel, regeln, col, fuell, o = {}) => (x, y, w) => {
  const gr = o.gr || 20, za = Math.round(gr * 1.3), max = Math.max(12, Math.floor((w - 66) / (gr * (o.fett ? 0.53 : 0.48)))), tmax = Math.max(12, Math.floor((w - 36) / ((gr + 2) * 0.52)));
  let s = '', yy = y + 28, unten = y + 20;
  if (titel) { umbruch(titel, tmax).forEach(z => { s += text(x + 18, yy, z, gr + 2, col, fett); unten = yy + gr * 0.6; yy += za + 2; }); yy += 6; }
  regeln.forEach((r, i) => {
    const z = umbruch(r, o.absatz ? max + 4 : max), tx = o.absatz ? x + 18 : x + 52;
    if (!o.absatz) s += o.nr ? kreis(x + 30, yy, 13, col) + mitte(x + 30, yy + 1, String(i + 1), 18, WEISS, fett) : kreis(x + 30, yy, 5.5, col);
    z.forEach((t, j) => { s += text(tx, yy + j * za, t, gr, DUNKEL, o.fett ? fett : ''); });
    unten = yy + (z.length - 1) * za + gr * 0.6; yy += z.length * za + 9;
  });
  const h = unten - y + 18;
  return { s: box(x, y, w, h, col, fuell, 14, 2.5) + s, h };
};
/* Kasten mit Feldern zum Eintragen: [[Beschriftung, Wert]] – ohne Wert bleibt eine Linie für den Stift */
const F = (titel, liste, col = '#b26a00', fuell = '#fffde7') => (x, y, w) => {
  let s = '', yy = y + 28;
  if (titel) { umbruch(titel, Math.floor((w - 36) / 12)).forEach(z => { s += text(x + 18, yy, z, 22, col, fett); yy += 30; }); yy += 10; }
  liste.forEach(([lab, wert]) => {
    const lw = [...lab].length * 20 * 0.57 + 14, neueZeile = lw > w * 0.6;
    s += text(x + 18, yy, lab, 20, DUNKEL, fett);
    const lx = neueZeile ? x + 18 : x + 18 + lw, ly = neueZeile ? yy + 34 : yy;
    s += linie(lx, ly + 13, x + w - 18, ly + 13, GRAU, 2, 'stroke-dasharray="7 6"');
    if (wert && String(wert).trim()) s += text(lx + 6, ly - 1, String(wert).trim(), 21, BLAU, fett);
    yy = ly + 46;
  });
  const h = yy - y - 18;
  return { s: box(x, y, w, h, col, fuell, 14, 2.5) + s, h };
};
/* freie Zeichnung mit fester Höhe */
const Z = (h, fn) => (x, y, w) => ({ s: fn(x, y, w), h });
function stapel(teile, x, y, w) { let s = '', yy = y; teile.forEach(t => { const r = t(x, yy, w); s += r.s; yy += r.h + 16; }); return { s, y: yy - 16 }; }
/* ganze Tafel: optional volle Breite oben, dann zwei Spalten, unten die Rechtsgrundlage (klein) */
function seite(icon, titel, P, { oben = [], links = [], rechts = [], unten = [], grundlage = '' }) {
  const W = 1000; let s = '', y = 78;
  if (oben.length) { const r = stapel(oben, 30, y, 940); s += r.s; y = r.y + 16; }
  const L = stapel(links, 30, y, 455), R = stapel(rechts, 515, y, 455); s += L.s + R.s;
  y = Math.max(links.length ? L.y : y, rechts.length ? R.y : y) + (links.length || rechts.length ? 16 : 0);
  if (unten.length) { const r = stapel(unten, 30, y, 940); s += r.s; y = r.y + 16; }
  const gz = umbruch('Grundlage: ' + grundlage, 100);
  s += linie(30, y + 6, 970, y + 6, GRAU, 1, 'opacity=".5"');
  gz.forEach((z, i) => { s += text(30, y + 28 + i * 23, z, 18, GRAU); });
  const H = Math.ceil(y + 28 + (gz.length - 1) * 23 + 26);
  return tafel(icon, titel, W, H, s, P);
}
const bildUnterschrift = (x, y, t, P, max = 20) => zeilenText(x, y, t, max, 18, P.ink, 22, fett, true);

// ---------- Sicherheitszeichen (vereinfacht nach DIN EN ISO 7010, selbst gezeichnet) ----------
const pk = (x, y, g) => (u, v) => f(x + u * g) + ' ' + f(y + v * g);
const schild = (x, y, g, farbe, innen) => `<rect x="${f(x)}" y="${f(y)}" width="${f(g)}" height="${f(g)}" rx="${f(g * 0.07)}" fill="${farbe}" stroke="${WEISS}" stroke-width="${f(g * 0.03)}"/>` + innen;
function zRettungsweg(x, y, g) {
  const p = pk(x, y, g);
  return schild(x, y, g, SGRUEN,
    `<rect x="${f(x + 0.64 * g)}" y="${f(y + 0.14 * g)}" width="${f(0.24 * g)}" height="${f(0.72 * g)}" fill="none" stroke="${WEISS}" stroke-width="${f(0.05 * g)}"/>` +
    kreis(x + 0.44 * g, y + 0.22 * g, 0.075 * g, WEISS) +
    `<path d="M ${p(0.42, 0.33)} L ${p(0.36, 0.56)} M ${p(0.22, 0.42)} L ${p(0.41, 0.36)} L ${p(0.56, 0.47)} M ${p(0.36, 0.56)} L ${p(0.5, 0.67)} L ${p(0.52, 0.84)} M ${p(0.36, 0.56)} L ${p(0.27, 0.71)} L ${p(0.12, 0.72)}" fill="none" stroke="${WEISS}" stroke-width="${f(0.075 * g)}" stroke-linecap="round" stroke-linejoin="round"/>`);
}
function zPfeil(x, y, g, links = false) {
  const p = links ? (u, v) => pk(x, y, g)(1 - u, v) : pk(x, y, g);
  return schild(x, y, g, SGRUEN, `<path d="M ${p(0.14, 0.41)} L ${p(0.54, 0.41)} L ${p(0.54, 0.26)} L ${p(0.86, 0.5)} L ${p(0.54, 0.74)} L ${p(0.54, 0.59)} L ${p(0.14, 0.59)} Z" fill="${WEISS}"/>`);
}
function zErsteHilfe(x, y, g) {
  const p = pk(x, y, g);
  return schild(x, y, g, SGRUEN, `<path d="M ${p(0.39, 0.16)} L ${p(0.61, 0.16)} L ${p(0.61, 0.39)} L ${p(0.84, 0.39)} L ${p(0.84, 0.61)} L ${p(0.61, 0.61)} L ${p(0.61, 0.84)} L ${p(0.39, 0.84)} L ${p(0.39, 0.61)} L ${p(0.16, 0.61)} L ${p(0.16, 0.39)} L ${p(0.39, 0.39)} Z" fill="${WEISS}"/>`);
}
function zSammelstelle(x, y, g) {
  const p = pk(x, y, g), pf = (u1, v1, u2, v2, u3, v3) => `<path d="M ${p(u1, v1)} L ${p(u2, v2)} L ${p(u3, v3)} Z" fill="${WEISS}"/>`;
  let s = pf(0.1, 0.1, 0.3, 0.14, 0.14, 0.3) + pf(0.9, 0.1, 0.7, 0.14, 0.86, 0.3) + pf(0.1, 0.9, 0.3, 0.86, 0.14, 0.7) + pf(0.9, 0.9, 0.7, 0.86, 0.86, 0.7);
  [[0.36, 0.4], [0.5, 0.36], [0.64, 0.4]].forEach(([u, v]) => { s += kreis(x + u * g, y + v * g, 0.055 * g, WEISS) + `<path d="M ${p(u - 0.06, v + 0.32)} L ${p(u - 0.06, v + 0.12)} Q ${p(u, v + 0.06)} ${p(u + 0.06, v + 0.12)} L ${p(u + 0.06, v + 0.32)} Z" fill="${WEISS}"/>`; });
  return schild(x, y, g, SGRUEN, s);
}
function zLoescher(x, y, g) {
  const p = pk(x, y, g);
  return schild(x, y, g, SROT,
    `<rect x="${f(x + 0.38 * g)}" y="${f(y + 0.34 * g)}" width="${f(0.24 * g)}" height="${f(0.52 * g)}" rx="${f(0.07 * g)}" fill="${WEISS}"/>` +
    `<rect x="${f(x + 0.45 * g)}" y="${f(y + 0.24 * g)}" width="${f(0.1 * g)}" height="${f(0.12 * g)}" fill="${WEISS}"/>` +
    `<path d="M ${p(0.4, 0.22)} L ${p(0.66, 0.16)} M ${p(0.55, 0.28)} Q ${p(0.82, 0.3)} ${p(0.76, 0.62)}" fill="none" stroke="${WEISS}" stroke-width="${f(0.045 * g)}" stroke-linecap="round"/>`);
}
function zMelder(x, y, g) {
  return schild(x, y, g, SROT, `<rect x="${f(x + 0.2 * g)}" y="${f(y + 0.2 * g)}" width="${f(0.6 * g)}" height="${f(0.6 * g)}" rx="${f(0.05 * g)}" fill="${WEISS}"/>` +
    kreis(x + 0.5 * g, y + 0.5 * g, 0.17 * g, SROT) + kreis(x + 0.5 * g, y + 0.5 * g, 0.06 * g, WEISS));
}
function zVerbot(cx, cy, r, innen) {
  const d = r * 0.7;
  return kreis(cx, cy, r, WEISS) + innen + kreis(cx, cy, r * 0.92, 'none', SROT, r * 0.16) + linie(cx - d * 0.95, cy - d * 0.95, cx + d * 0.95, cy + d * 0.95, SROT, r * 0.16);
}
const zigarette = (cx, cy, r) => `<rect x="${f(cx - r * 0.62)}" y="${f(cy + r * 0.08)}" width="${f(r * 0.9)}" height="${f(r * 0.2)}" fill="#eceff1" stroke="${DUNKEL}" stroke-width="${f(r * 0.04)}"/><rect x="${f(cx + r * 0.28)}" y="${f(cy + r * 0.08)}" width="${f(r * 0.3)}" height="${f(r * 0.2)}" fill="#e0913a" stroke="${DUNKEL}" stroke-width="${f(r * 0.04)}"/>` +
  `<path d="M ${f(cx - r * 0.5)} ${f(cy)} q ${f(r * 0.1)} ${f(-r * 0.15)} 0 ${f(-r * 0.3)} q ${f(-r * 0.1)} ${f(-r * 0.15)} 0 ${f(-r * 0.3)}" fill="none" stroke="#78909c" stroke-width="${f(r * 0.06)}" stroke-linecap="round"/>`;
const vape = (cx, cy, r) => `<rect x="${f(cx - r * 0.18)}" y="${f(cy - r * 0.55)}" width="${f(r * 0.36)}" height="${f(r * 1.1)}" rx="${f(r * 0.12)}" fill="#90a4ae" stroke="${DUNKEL}" stroke-width="${f(r * 0.04)}"/><rect x="${f(cx - r * 0.08)}" y="${f(cy - r * 0.72)}" width="${f(r * 0.16)}" height="${f(r * 0.2)}" fill="${DUNKEL}"/>` + kreis(cx, cy + r * 0.25, r * 0.07, '#4fc3f7');
const flasche = (cx, cy, r) => `<path d="M ${f(cx - r * 0.08)} ${f(cy - r * 0.7)} L ${f(cx + r * 0.08)} ${f(cy - r * 0.7)} L ${f(cx + r * 0.08)} ${f(cy - r * 0.35)} Q ${f(cx + r * 0.25)} ${f(cy - r * 0.25)} ${f(cx + r * 0.25)} ${f(cy)} L ${f(cx + r * 0.25)} ${f(cy + r * 0.65)} L ${f(cx - r * 0.25)} ${f(cy + r * 0.65)} L ${f(cx - r * 0.25)} ${f(cy)} Q ${f(cx - r * 0.25)} ${f(cy - r * 0.25)} ${f(cx - r * 0.08)} ${f(cy - r * 0.35)} Z" fill="#6d4c41" stroke="${DUNKEL}" stroke-width="${f(r * 0.04)}"/>`;
const messer = (cx, cy, r) => `<path d="M ${f(cx - r * 0.6)} ${f(cy + r * 0.3)} L ${f(cx + r * 0.05)} ${f(cy - r * 0.05)} L ${f(cx + r * 0.6)} ${f(cy - r * 0.45)} Q ${f(cx + r * 0.3)} ${f(cy + r * 0.05)} ${f(cx + r * 0.12)} ${f(cy + r * 0.1)} Z" fill="#cfd8dc" stroke="${DUNKEL}" stroke-width="${f(r * 0.04)}"/>` +
  `<path d="M ${f(cx - r * 0.6)} ${f(cy + r * 0.3)} L ${f(cx - r * 0.1)} ${f(cy + r * 0.02)} L ${f(cx - r * 0.02)} ${f(cy + r * 0.16)} L ${f(cx - r * 0.5)} ${f(cy + r * 0.46)} Z" fill="#5d4037" stroke="${DUNKEL}" stroke-width="${f(r * 0.04)}"/>`;
function zWarnung(cx, cy, g) {
  const h = g * 0.87;
  return `<path d="M ${f(cx)} ${f(cy - h / 2)} L ${f(cx + g / 2)} ${f(cy + h / 2)} L ${f(cx - g / 2)} ${f(cy + h / 2)} Z" fill="${GELB}" stroke="${DUNKEL}" stroke-width="${f(g * 0.07)}" stroke-linejoin="round"/>` +
    `<rect x="${f(cx - g * 0.045)}" y="${f(cy - h * 0.18)}" width="${f(g * 0.09)}" height="${f(h * 0.4)}" rx="${f(g * 0.03)}" fill="${DUNKEL}"/>` + kreis(cx, cy + h * 0.33, g * 0.055, DUNKEL);
}

// ---------- Themen der Übersicht ----------
const THEMEN = [
  ['🔥', 'Feueralarm und Räumung', 'be_brand', true], ['🩹', 'Unfall und Erste Hilfe', 'be_erstehilfe', true],
  ['🚫', 'Waffen und gefährliche Dinge', 'be_waffen', true], ['🤒', 'Krank? Zu Hause bleiben!', 'be_ifsg', true],
  ['🚸', 'Schulweg und Bus', 'be_schulweg', false], ['🏫', 'Pause und Schulgelände', 'be_pause', false],
  ['📱', 'Handy, Fotos und Internet', 'be_handy', false], ['🚭', 'Rauchen, Alkohol, Drogen', 'be_rauchen', false],
  ['📅', 'Fehlen und Entschuldigen', 'be_fehlzeiten', false], ['⚽', 'Sportunterricht', 'be_sport', false],
  ['🧪', 'Fachräume', 'be_fachraum', false], ['🎒', 'Eigentum und Fundsachen', 'be_eigentum', false]];

// ---------- Übersicht zum Abhaken ----------
B.be_uebersicht = { name: 'Belehrungen: Übersicht zum Abhaken', gruppe: 'Klassenleben', def: { auswahl: 'alle', erledigt: [], datum: '', klasse: '' },
  felder: [{ k: 'auswahl', l: 'Themen', typ: 'auswahl', opts: [['alle', 'Alle 12 Themen'], ['kern', 'Nur Pflicht-Kern (Brand, Erste Hilfe, Waffen, Infektionsschutz)']] },
    { k: 'klasse', l: 'Klasse (leer = Linie)', typ: 'text' }, { k: 'datum', l: 'Belehrt am (leer = Linie)', typ: 'text' }],
  gen: (d, P) => {
    const nr = THEMEN.map((t, i) => i).filter(i => d.auswahl !== 'kern' || THEMEN[i][3]);
    const fertig = new Set((d.erledigt || []).map(Number)), sp = 4, kw = 220, kh = 150, gap = 20, x0 = 30, y0 = 112, teile = [];
    const zeilen = Math.ceil(nr.length / sp), W = 1000;
    let s = text(30, 84, 'Thema antippen = besprochen ✔ (nochmals antippen = Haken weg)', 18, GRAU);
    nr.forEach((i, j) => {
      const [em, name] = THEMEN[i], x = x0 + (j % sp) * (kw + gap), y = y0 + Math.floor(j / sp) * (kh + gap), ok = fertig.has(i);
      s += box(x, y, kw, kh, ok ? GRUEN : RAND, ok ? '#e8f5e9' : '#f1f5f9', 16, ok ? 3.5 : 2.5);
      s += mitte(x + kw / 2, y + 44, em, 40, '#000000');
      s += zeilenText(x + kw / 2, y + 94, name, 17, 20, DUNKEL, 24, fett, true);
      s += ok ? kreis(x + kw - 24, y + 24, 16, GRUEN) + `<path d="M ${f(x + kw - 32)} ${f(y + 24)} L ${f(x + kw - 26)} ${f(y + 31)} L ${f(x + kw - 15)} ${f(y + 17)}" fill="none" stroke="${WEISS}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
        : kreis(x + kw - 24, y + 24, 15, WEISS, GRAU, 2.5);
      teile.push({ id: 'k' + i, x, y, w: kw, h: kh });
    });
    let y = y0 + zeilen * (kh + gap) + 14;
    const anz = nr.filter(i => fertig.has(i)).length;
    s += text(30, y, `${anz} von ${nr.length} Themen besprochen`, 22, anz === nr.length ? GRUEN : P.ink, fett);
    y += 50;
    const feld = (x, lab, wert, w) => text(x, y, lab, 22, P.ink, fett) + linie(x + [...lab].length * 12 + 14, y + 14, x + w, y + 14, GRAU, 2, 'stroke-dasharray="7 6"') +
      (wert && String(wert).trim() ? text(x + [...lab].length * 12 + 20, y, String(wert).trim(), 22, BLAU, fett) : '');
    s += feld(30, 'Belehrt am:', d.datum, 330) + feld(370, 'Klasse:', d.klasse, 560) + feld(600, 'Unterschrift:', '', 970);
    y += 44;
    s += text(30, y, 'Im Klassenbuch eintragen: Datum, Themen, Unterschrift der Lehrkraft.', 18, GRAU);
    const H = y + 34;
    return { ...tafel('📢', 'Belehrungen zu Beginn des Schuljahres', W, H, s, P), teile };
  },
  tippen: (o, id) => {
    if (!/^k\d+$/.test(String(id))) return;
    const i = +String(id).slice(1);
    T.bausteinAendern(o, { f: dd => { const s = new Set((dd.erledigt || []).map(Number)); s.has(i) ? s.delete(i) : s.add(i); return { d: { ...dd, erledigt: [...s].sort((a, b) => a - b) } }; } });
  } };
B.be_uebersicht.schnell = [{ l: '⬜ Alle Haken weg', f: dd => ({ d: { ...dd, erledigt: [] } }) },
  { l: '✔ Alle abhaken', f: dd => ({ d: { ...dd, erledigt: THEMEN.map((t, i) => i).filter(i => dd.auswahl !== 'kern' || THEMEN[i][3]) } }) }];
variante('be_uebersicht:kern', 'Belehrungen: Pflicht-Kern zum Abhaken (Brand, Erste Hilfe, Waffen, Infektionsschutz)', { auswahl: 'kern', erledigt: [], datum: '', klasse: '' });

// ---------- Feueralarm und Räumung ----------
B.be_brand = { name: 'Belehrung: Feueralarm und Räumung', gruppe: 'Klassenleben', def: { signal: '', sammelplatz: '', fluchtweg: '', melder: '', raum: false, raumsignal: '' },
  felder: [{ k: 'signal', l: 'So klingt unser Feueralarm', typ: 'text' }, { k: 'sammelplatz', l: 'Unser Sammelplatz', typ: 'text' }, { k: 'fluchtweg', l: 'Fluchtweg aus diesem Raum', typ: 'text' },
    { k: 'melder', l: 'Nächster Feuermelder', typ: 'text' }, { k: 'raum', l: 'Zusätzlich: Signal „Im Raum bleiben“ (Gefahr im Gebäude)', typ: 'check' }, { k: 'raumsignal', l: 'So klingt das Signal „Im Raum bleiben“', typ: 'text' }],
  gen: (d, P) => {
    const g = 84;
    const zeichenReihe = Z(150, (x, y) => zRettungsweg(x + 20, y + 6, g) + zPfeil(x + 114, y + 6, g) + bildUnterschrift(x + 109, y + 118, 'Grün: Rettungsweg', P, 30) +
      zLoescher(x + 360, y + 6, g) + zMelder(x + 454, y + 6, g) + bildUnterschrift(x + 449, y + 118, 'Rot: Feuerlöscher, Feuermelder', P, 34) +
      zSammelstelle(x + 760, y + 6, g) + bildUnterschrift(x + 802, y + 118, 'Sammelstelle', P, 30));
    const links = [K('Der Alarm geht los – so geht’s:', ['Ruhe bewahren. Nicht rennen, nicht schreien.', 'Alles liegen lassen – auch Taschen.', 'Fenster zu, Tür zu (nicht abschließen).', 'Der Lehrkraft folgen – den grünen Schildern nach.', 'Keinen Aufzug benutzen.', 'Am Sammelplatz zusammenbleiben. Die Lehrkraft zählt, ob alle da sind.', 'Erst zurück ins Haus, wenn es erlaubt wird.'], ROT, '#ffebee', { nr: true }),
      K('Du siehst Feuer oder Rauch?', ['Sofort eine Lehrkraft holen oder den Feuermelder drücken.', 'Nicht selbst löschen – bring dich in Sicherheit.', 'Notruf Feuerwehr: 112'], ORANGE, '#fff3e0')];
    const rechts = [F('Bei uns:', [['Unser Alarm:', d.signal], ['Unser Sammelplatz:', d.sammelplatz], ['Fluchtweg aus diesem Raum:', d.fluchtweg], ['Nächster Feuermelder:', d.melder]]),
      K('Du bist gerade allein, z. B. auf der Toilette?', ['Nimm den nächsten Fluchtweg nach draußen.', 'Geh sofort zu deiner Klasse am Sammelplatz und melde dich.'], BLAU, '#e3f2fd')];
    const unten = [K('', ['Der Feueralarm klingt anders als der Pausengong. Wir üben die Räumung mindestens einmal im Schuljahr.'], GRUEN, '#e8f5e9', { absatz: true, fett: true })];
    if (d.raum) unten.push(K('Anderes Signal: „Im Raum bleiben“ (Gefahr im Gebäude)', ['So klingt es: ' + (d.raumsignal && String(d.raumsignal).trim() ? String(d.raumsignal).trim() : '______________________________'), 'Raum nicht verlassen. Tür schließen und – wenn möglich – abschließen.', 'Weg von Tür und Fenstern, ruhig und leise sein.', 'Auf Anweisungen warten (Durchsage, Lehrkraft, Polizei). Es gilt der Notfallplan der Schule.'], LILA, '#f3e5f5'));
    return seite('🔥', 'Feueralarm – was tun?', P, { oben: [zeichenReihe], links, rechts, unten,
      grundlage: 'RdErl. d. MK „Erste Hilfe, Brandschutz und Evakuierung in Schulen“ v. 27.6.2016 (Nds. MBl. S. 765; SVBl. S. 437), zuletzt geändert 13.12.2021, Nr. 3.1.4 (Unterweisung in den ersten drei Wochen des Schuljahres, Eintrag im Klassenbuch), Nr. 3.1.6 (Alarmsignal), Nr. 3.2.1 (mind. eine Räumungsübung je Schuljahr). Zeichen nach DIN EN ISO 7010.' });
  } };
B.be_brand.schnell = [{ l: '🔒 Signal „Im Raum bleiben“ ein/aus', f: dd => ({ d: { ...dd, raum: !dd.raum } }) }];
variante('be_brand:raum', 'Belehrung: Feueralarm + Signal „Im Raum bleiben“', { signal: '', sammelplatz: '', fluchtweg: '', melder: '', raum: true, raumsignal: '' });

// ---------- Unfall und Erste Hilfe ----------
B.be_erstehilfe = { name: 'Belehrung: Unfall und Erste Hilfe', gruppe: 'Klassenleben', def: { ersthelfer: '', ort: '', sani: '' },
  felder: [{ k: 'ersthelfer', l: 'Unsere Ersthelferinnen und Ersthelfer', typ: 'text' }, { k: 'ort', l: 'Erste Hilfe gibt es im …', typ: 'text' }, { k: 'sani', l: 'Schulsanitätsdienst', typ: 'text' }],
  gen: (d, P) => {
    const zeichen = Z(110, (x, y) => zErsteHilfe(x + 10, y + 8, 92) + text(x + 125, y + 40, 'Dieses Zeichen zeigt dir:', 20, P.ink) + text(x + 125, y + 72, 'Hier gibt es Erste Hilfe.', 22, P.ink, fett));
    const links = [zeichen,
      K('Jemand hat sich verletzt:', ['Ruhe bewahren.', 'Sofort eine Lehrkraft oder andere Erwachsene holen.', 'Bei der verletzten Person bleiben und sie beruhigen.', 'Bring dich nicht selbst in Gefahr.', 'Bei Lebensgefahr: Notruf 112 – kostenlos, auch ohne Guthaben.'], ROT, '#ffebee', { nr: true }),
      K('Notruf 112 – das sagst du:', ['Wo ist es passiert?', 'Was ist passiert?', 'Wie viele Verletzte?', 'Warten! Die Leitstelle stellt noch Fragen.'], BLAU, '#e3f2fd')];
    const rechts = [F('Bei uns:', [['Ersthelfer:', d.ersthelfer], ['Erste Hilfe im:', d.ort], ['Schulsanitäter:', d.sani]]),
      K('Jeder Unfall wird gemeldet', ['Sag jede Verletzung sofort einer Lehrkraft – auch eine kleine.', 'Sie wird aufgeschrieben (Meldeblock oder Verbandbuch).', 'Musst du zum Arzt, sag dort: „Es war ein Schulunfall.“', 'Die Schule meldet den Unfall dann an die Unfallkasse.'], GRUEN, '#e8f5e9'),
      K('Du bist versichert', ['im Unterricht und in der Pause,', 'bei Ausflügen und Klassenfahrten,', 'auf dem direkten Schulweg.'], LILA, '#f3e5f5')];
    return seite('🩹', 'Unfall – was tun?', P, { links, rechts,
      grundlage: 'RdErl. d. MK „Erste Hilfe, Brandschutz und Evakuierung in Schulen“ v. 27.6.2016 i. d. F. v. 13.12.2021, Nr. 2 (Erste Hilfe; jede Hilfeleistung dokumentieren; Unfallmeldung binnen drei Tagen bei Arztbesuch); gesetzliche Schülerunfallversicherung § 2 Abs. 1 Nr. 8 b SGB VII, Unfallanzeige § 193 SGB VII.' });
  } };

// ---------- Waffen und gefährliche Gegenstände ----------
B.be_waffen = { name: 'Belehrung: Waffen und gefährliche Gegenstände (Waffenerlass)', gruppe: 'Klassenleben', def: {}, felder: [],
  gen: (d, P) => {
    const zeichen = Z(116, (x, y, w) => zVerbot(x + 60, y + 58, 50, messer(x + 60, y + 58, 50)) + text(x + 130, y + 38, 'Diese Dinge sind in der Schule verboten –', 22, P.ink, fett) +
      text(x + 130, y + 70, 'im Gebäude, auf dem Schulgelände und bei allen', 20, P.ink) + text(x + 130, y + 96, 'Schulveranstaltungen (Ausflug, Klassenfahrt).', 20, P.ink));
    const links = [K('Verboten:', ['Waffen aller Art – auch Schreckschuss- und Gaspistolen', 'Messer – auch Taschenmesser und Küchenmesser', 'Butterflymesser, Schlagringe, Schlagstöcke', 'Pfefferspray und Reizgas', 'Laserpointer'], ROT, '#ffebee'),
      K('Auch verboten:', ['Softair-Waffen und Spielzeugwaffen', 'Nachbildungen, die wie echte Waffen aussehen', 'Munition, Feuerwerk, Böller, Schwarzpulver', 'Chemikalien, die verletzen oder explodieren können'], ROT, '#ffebee')];
    const rechts = [K('Das gilt für alle', ['Auch für Volljährige – auch mit Waffenschein.', 'Ausnahmen gibt es nur mit Erlaubnis der Schulleitung, z. B. Messer im Hauswirtschaftsunterricht oder beim Theater.'], BLAU, '#e3f2fd'),
      K('Du siehst bei jemandem eine Waffe?', ['Nicht selbst wegnehmen.', 'Sofort einer Lehrkraft Bescheid sagen.', 'Das ist kein Petzen – es schützt alle.'], ORANGE, '#fff3e0'),
      K('Wer etwas mitbringt:', ['Es gibt Erziehungsmittel oder Ordnungsmaßnahmen.', 'Bei Gefahr oder Straftaten wird die Polizei gerufen.'], GRAU, '#eef2f7'),
      K('Erlaubt:', ['Zirkel, Schere, Spitzer – das sind Schulsachen. Sie werden nur zum Arbeiten benutzt.'], GRUEN, '#e8f5e9')];
    return seite('🚫', 'Waffen und gefährliche Dinge – verboten!', P, { oben: [zeichen], links, rechts,
      grundlage: 'RdErl. d. MK „Verbot des Mitbringens von Waffen, Munition und vergleichbaren Gegenständen sowie von Chemikalien in Schulen“ v. 27.10.2021 – 36.3-81 704/03 (Nds. MBl. S. 1660; SVBl. 12/2021 S. 645), gültig bis 31.12.2027; Nr. 1–5 Verbote, Nr. 6 Ausnahmen, Nr. 7 Belehrung zu Beginn jedes Schuljahres; § 61 NSchG.' });
  } };

// ---------- Infektionsschutz (§ 34 IfSG) ----------
const IFSG_KURZ = ['Masern', 'Mumps', 'Röteln', 'Windpocken', 'Keuchhusten', 'Scharlach', 'Krätze', 'Borkenflechte', 'Hepatitis A', 'Tuberkulose', 'schwere Darminfektionen (z. B. EHEC)'];
const IFSG_LANG = ['Cholera', 'Diphtherie', 'EHEC-Infektion', 'virusbedingtes hämorrhagisches Fieber', 'Hib-Meningitis', 'Impetigo contagiosa (Borkenflechte)', 'Keuchhusten', 'ansteckende Lungentuberkulose', 'Masern', 'Meningokokken-Infektion', 'Mumps',
  'Orthopocken (z. B. Mpox)', 'Paratyphus', 'Pest', 'Kinderlähmung (Polio)', 'Röteln', 'Scharlach / Streptokokken', 'Shigellose (Ruhr)', 'Krätze (Skabies)', 'Typhus', 'Hepatitis A oder E', 'Windpocken'];
const Chips = (titel, liste, col, fuell, gr = 20) => (x, y, w) => {
  let s = text(x + 18, y + 28, titel, 22, col, fett), cx = x + 18, cy = y + 62;
  const ch = gr + 16;
  liste.forEach(t => {
    const cw = [...t].length * gr * 0.52 + 28;
    if (cx + cw > x + w - 14) { cx = x + 18; cy += ch + 10; }
    s += box(cx, cy, cw, ch, col, WEISS, ch / 2, 1.8) + mitte(cx + cw / 2, cy + ch / 2, t, gr, DUNKEL);
    cx += cw + 10;
  });
  const h = cy + ch + 16 - y;
  return { s: box(x, y, w, h, col, fuell, 14, 2.5) + s, h };
};
B.be_ifsg = { name: 'Belehrung: Krank? Zu Hause bleiben! (§ 34 IfSG)', gruppe: 'Klassenleben', def: { liste: false },
  felder: [{ k: 'liste', l: 'Vollständige Liste nach § 34 Abs. 1 IfSG (z. B. für Elternabend)', typ: 'check' }],
  gen: (d, P) => {
    const oben = [d.liste ? Chips('Bei diesen Krankheiten – oder dem Verdacht darauf – darfst du nicht in die Schule:', IFSG_LANG, ROT, '#ffebee', 18)
      : Chips('Bei diesen Krankheiten darfst du nicht in die Schule, zum Beispiel:', IFSG_KURZ, ROT, '#ffebee')];
    const links = [K('Wichtig:', ['Schon der Verdacht reicht: erst zum Arzt.', 'Wiederkommen erst, wenn eine Ärztin oder ein Arzt sagt: keine Ansteckung mehr.', 'Deine Eltern informieren sofort die Schule.', 'Hat jemand bei dir zu Hause so eine Krankheit, können auch für dich Regeln gelten. Das Gesundheitsamt sagt Bescheid.'], ROT, '#ffebee', { nr: true }),
      K('Kopfläuse?', ['Sag es zu Hause – das ist nicht peinlich.', 'Die Eltern melden es der Schule.', 'Erst nach der richtigen Behandlung wieder in die Schule.'], ORANGE, '#fff3e0')];
    const rechts = [K('Fieber, Erbrechen, Durchfall?', ['Zu Hause bleiben und auskurieren.', 'Nach Magen-Darm: erst 48 Stunden ohne Beschwerden wiederkommen (Empfehlung).'], BLAU, '#e3f2fd'),
      K('So schützt du dich und andere:', ['Hände mit Seife waschen – 20 bis 30 Sekunden.', 'Husten und niesen in die Armbeuge.', 'Benutzte Taschentücher sofort in den Müll.', 'Trinkflasche und Besteck nicht teilen.'], GRUEN, '#e8f5e9')];
    return seite('🤒', 'Krank? Dann bleib zu Hause!', P, { oben, links, rechts,
      grundlage: '§ 34 Infektionsschutzgesetz (IfSG): Abs. 1 Krankheiten und Verlausung, Abs. 3 Erkrankung in der Wohngemeinschaft, Abs. 5 Mitteilungspflicht der Eltern und Belehrung bei Aufnahme; Hygieneplan der Schule. 48-Stunden-Regel: Empfehlung des RKI.' });
  } };
variante('be_ifsg:liste', 'Belehrung: Infektionsschutz mit vollständiger Liste (§ 34 IfSG)', { liste: true });

// ---------- Schulweg und Bus ----------
B.be_schulweg = { name: 'Belehrung: Sicher auf dem Schulweg', gruppe: 'Klassenleben', def: { gefahr: '', fahrrad: '' },
  felder: [{ k: 'gefahr', l: 'Gefährliche Stelle auf unserem Schulweg', typ: 'text' }, { k: 'fahrrad', l: 'Fahrräder und Roller stehen …', typ: 'text' }],
  gen: (d, P) => {
    const links = [K('Zu Fuß', ['Über die Straße an Ampel oder Zebrastreifen.', 'Nicht zwischen parkenden Autos auf die Straße.', 'Im Dunkeln: helle Kleidung und Reflektoren.'], BLAU, '#e3f2fd'),
      K('Mit dem Fahrrad', ['Helm tragen – er schützt deinen Kopf.', 'Licht, Bremsen, Klingel und Reflektoren müssen funktionieren.', 'Kopfhörer raus, Handy weg.', 'Hintereinander fahren, auf dem Radweg bleiben.', 'E-Scooter erst ab 14 Jahren.'], GRUEN, '#e8f5e9'),
      F('Bei uns:', [['Achtung, gefährlich:', d.gefahr], ['Räder stehen:', d.fahrrad]])];
    const rechts = [K('Mit dem Bus', ['An der Haltestelle Abstand zur Bordsteinkante halten.', 'Nicht drängeln beim Einsteigen.', 'Sitzen oder gut festhalten. Taschen nicht in den Gang.', 'Nach dem Aussteigen warten, bis der Bus weg ist. Erst dann über die Straße.'], ORANGE, '#fff3e0'),
      K('Du bist versichert', ['Auf dem direkten Weg zwischen Zuhause und Schule bist du unfallversichert.', 'Ein Umweg für private Dinge (z. B. Einkaufen) ist nicht versichert.', 'Unfall auf dem Schulweg? Sofort in der Schule melden.'], LILA, '#f3e5f5')];
    return seite('🚸', 'Sicher auf dem Schulweg', P, { links, rechts,
      grundlage: 'Gesetzliche Schülerunfallversicherung: § 2 Abs. 1 Nr. 8 b SGB VII, Wegeunfall § 8 Abs. 2 Nr. 1 SGB VII; Straßenverkehrs-Ordnung (StVO); Ausrüstung von Fahrrädern §§ 64a, 65, 67 StVZO; E-Scooter ab 14: § 3 eKFV.' });
  } };

// ---------- Pause und Schulgelände ----------
B.be_pause = { name: 'Belehrung: Pause und Schulgelände', gruppe: 'Klassenleben', def: { bereich: '', regen: '', aufsicht: '' },
  felder: [{ k: 'bereich', l: 'Unsere Pausenbereiche', typ: 'text' }, { k: 'regen', l: 'In der Regenpause', typ: 'text' }, { k: 'aufsicht', l: 'Die Pausenaufsicht findest du …', typ: 'text' }],
  gen: (d, P) => {
    const links = [K('Auf dem Schulgelände bleiben', ['Während Unterricht und Pausen verlässt du das Schulgelände nicht – nur mit Erlaubnis.', 'Die Lehrkräfte haben die Aufsicht. Sie müssen wissen, wo du bist.'], BLAU, '#e3f2fd'),
      K('Fair und sicher', ['Keine Gewalt – auch nicht „aus Spaß“.', 'Nicht mit Schneebällen, Steinen oder Stöcken werfen.', 'Im Haus und auf Treppen gehen, nicht rennen.', 'Bei Glätte langsam gehen, nicht schlittern.', 'Müll in den Mülleimer. Toiletten sauber halten.'], GRUEN, '#e8f5e9')];
    const rechts = [F('Bei uns:', [['Pausenbereiche:', d.bereich], ['Regenpause:', d.regen], ['Aufsicht:', d.aufsicht]]),
      K('Hilfe holen', ['Streit, Verletzung oder Ärger? Geh zur Pausenaufsicht.', 'Eine fremde Person auf dem Gelände? Nicht selbst ansprechen – sofort Lehrkraft oder Sekretariat informieren.'], ORANGE, '#fff3e0'),
      K('Es gilt die Schulordnung', ['Die Schulleitung hat das Hausrecht. Bei Verstößen gibt es Erziehungsmittel oder Ordnungsmaßnahmen.'], GRAU, '#eef2f7')];
    return seite('🏫', 'Pause und Schulgelände', P, { links, rechts,
      grundlage: '§ 62 Abs. 1 NSchG (Aufsicht; Schülerinnen und Schüler des Sekundarbereichs I dürfen das Schulgrundstück nicht unbefugt verlassen); § 58 NSchG (Pflichten); § 61 NSchG (Erziehungsmittel, Ordnungsmaßnahmen); Hausrecht der Schulleitung (§ 111 NSchG); Schulordnung.' });
  } };

// ---------- Handy, Fotos und Internet ----------
B.be_handy = { name: 'Belehrung: Handy, Fotos und Cybermobbing', gruppe: 'Klassenleben', def: { unterricht: '', pause: '', verstoss: '', hilfe: '' },
  felder: [{ k: 'unterricht', l: 'Handy im Unterricht', typ: 'text' }, { k: 'pause', l: 'Handy in der Pause', typ: 'text' }, { k: 'verstoss', l: 'Bei Verstoß', typ: 'text' }, { k: 'hilfe', l: 'Ansprechpersonen (Vertrauenslehrkraft, Schulsozialarbeit)', typ: 'text' }],
  gen: (d, P) => {
    const links = [F('Unsere Handyregeln:', [['Im Unterricht:', d.unterricht], ['In der Pause:', d.pause], ['Bei Verstoß:', d.verstoss]]),
      K('Recht am eigenen Bild', ['Fotos und Videos von anderen nur mit ihrer Erlaubnis.', 'Bilder von anderen nur mit Erlaubnis weiterschicken oder posten.', 'Das gilt auch für Lehrkräfte.', 'Heimlich filmen oder aufnehmen – z. B. in Toilette oder Umkleide – ist eine Straftat.'], BLAU, '#e3f2fd')];
    const rechts = [K('Cybermobbing ist nicht harmlos', ['Beleidigen, bedrohen, bloßstellen im Netz kann strafbar sein.', 'Ab 14 Jahren kannst du dafür bestraft werden.', 'Nicht mitmachen, nicht liken, nicht weiterleiten.', 'Beweise sichern (Screenshot) und Hilfe holen.'], ORANGE, '#fff3e0'),
      K('Nacktbilder von Kindern oder Jugendlichen', ['Niemals speichern, weiterleiten oder einen Screenshot machen – auch das ist strafbar.', 'Sofort einer erwachsenen Person Bescheid sagen.'], ROT, '#ffebee'),
      F('Hier bekommst du Hilfe:', [['Bei uns:', d.hilfe], ['Nummer gegen Kummer:', '116 111']], GRUEN, '#e8f5e9')];
    return seite('📱', 'Handy, Fotos und Internet', P, { links, rechts,
      grundlage: 'Handyregeln: Schulordnung der Schule. Recht am eigenen Bild: § 22 KUG, DSGVO. Strafrecht: § 185 ff. StGB (Beleidigung), § 201 (heimliche Tonaufnahmen), § 201a (Bildaufnahmen in geschützten Räumen), § 238 (Nachstellung), § 241 (Bedrohung), § 184b StGB (Missbrauchsdarstellungen); Strafmündigkeit ab 14: § 19 StGB.' });
  } };

// ---------- Rauchen, Alkohol, Drogen ----------
B.be_rauchen = { name: 'Belehrung: Rauchen, Vapes, Alkohol, Drogen', gruppe: 'Klassenleben', def: { hilfe: '' },
  felder: [{ k: 'hilfe', l: 'Ansprechperson (Beratung, Sucht)', typ: 'text' }],
  gen: (d, P) => {
    const zeichen = Z(120, (x, y) => { const y0 = y + 60; return zVerbot(x + 70, y0, 52, zigarette(x + 70, y0, 52)) + zVerbot(x + 200, y0, 52, vape(x + 200, y0, 52)) + zVerbot(x + 330, y0, 52, flasche(x + 330, y0, 52)) +
      text(x + 410, y0 - 18, 'Auf dem ganzen Schulgelände verboten –', 22, P.ink, fett) + text(x + 410, y0 + 14, 'im Gebäude, auf dem Schulhof', 20, P.ink) + text(x + 410, y0 + 40, 'und bei Schulveranstaltungen.', 20, P.ink); });
    const links = [K('Verboten sind:', ['Zigaretten, Zigarren, Shisha', 'E-Zigaretten und Vapes – auch ohne Nikotin', 'Tabakerhitzer', 'Alkohol', 'Cannabis und andere Drogen'], ROT, '#ffebee'),
      K('Wer es trotzdem tut:', ['Es gibt Erziehungsmittel oder Ordnungsmaßnahmen.', 'Die Eltern werden informiert.'], GRAU, '#eef2f7')];
    const rechts = [K('Warum?', ['Nikotin macht sehr schnell abhängig – auch in Vapes.', 'Rauch und Dampf schaden auch anderen.', 'Alkohol und Cannabis schaden dem Gehirn, das noch bis etwa 25 wächst.'], BLAU, '#e3f2fd'),
      K('Jugendschutz', ['Unter 18 verboten: Tabak, E-Zigaretten (auch ohne Nikotin), Cannabis.', 'Kein Cannabis-Konsum in Sichtweite von Schulen – auch nicht für Erwachsene.'], LILA, '#f3e5f5'),
      F('Du willst aufhören oder machst dir Sorgen?', [['Sprich mit:', d.hilfe]], GRUEN, '#e8f5e9')];
    return seite('🚭', 'Rauchen, Alkohol, Drogen – nicht bei uns!', P, { oben: [zeichen], links, rechts,
      grundlage: '§ 1 Abs. 1 Satz 1 Nr. 5 und Satz 2 Nds. Nichtraucherschutzgesetz (NiRSG; Schulgebäude sowie Hof- und Freiflächen), seit 24.05.2025 einschließlich E-Zigaretten und erhitzter Tabakerzeugnisse (Änderungsgesetz v. 20.05.2025, Nds. GVBl. Nr. 30); §§ 9, 10 JuSchG; §§ 2, 5 KCanG; BtMG; Schulordnung; § 61 NSchG.' });
  } };

// ---------- Fehlen und Entschuldigen ----------
B.be_fehlzeiten = { name: 'Belehrung: Schulpflicht, Fehlen und Entschuldigen', gruppe: 'Klassenleben', def: { melden: '', telefon: '', frist: '' },
  felder: [{ k: 'melden', l: 'So melden wir uns krank (Telefon, IServ, App …)', typ: 'text' }, { k: 'telefon', l: 'Telefon Sekretariat', typ: 'text' }, { k: 'frist', l: 'Schriftliche Entschuldigung bis …', typ: 'text' }],
  gen: (d, P) => {
    const links = [K('Schulpflicht', ['In Niedersachsen musst du zur Schule gehen – das ist Gesetz.', 'Du kommst regelmäßig und pünktlich zum Unterricht.'], BLAU, '#e3f2fd'),
      K('Du bist krank?', ['Deine Eltern melden dich am ersten Tag vor Unterrichtsbeginn krank.', 'Sie sagen den Grund und wie lange du ungefähr fehlst.', 'Die Schule kann ein ärztliches Attest verlangen.', 'Verpassten Stoff holst du selbst nach.'], ROT, '#ffebee', { nr: true }),
      F('Bei uns:', [['So melden wir uns krank:', d.melden], ['Telefon Sekretariat:', d.telefon], ['Entschuldigung abgeben bis:', d.frist]])];
    const rechts = [K('Frei für einen wichtigen Termin? (Beurlaubung)', ['Die Eltern beantragen es vorher schriftlich – rechtzeitig und mit Grund.', 'Direkt vor oder nach den Ferien gibt es nur in Härtefällen frei.', 'Ein früherer Urlaubsflug ist kein Grund.'], GRUEN, '#e8f5e9'),
      K('Unentschuldigt gefehlt?', ['Die Eltern werden sofort informiert.', 'Bei wiederholtem Fehlen wird das Jugendamt informiert. Es kann auch ein Bußgeld geben.'], ORANGE, '#fff3e0')];
    return seite('📅', 'Fehlen und Entschuldigen', P, { links, rechts,
      grundlage: 'Schulpflicht §§ 63 ff. NSchG, Teilnahmepflicht § 58 NSchG, Ordnungswidrigkeit § 176 NSchG; RdErl. d. MK „Ergänzende Bestimmungen zum Rechtsverhältnis zur Schule und zur Schulpflicht“ v. 08.12.2025 (SVBl. 1/2026 S. 9), Nr. 3.2.1 Beurlaubung, Nr. 3.3.1 Benachrichtigung und ärztliche Bescheinigung, Nr. 3.3.2 unentschuldigtes Fehlen.' });
  } };

// ---------- Sportunterricht ----------
B.be_sport = { name: 'Belehrung: Sportunterricht', gruppe: 'Klassenleben', def: { wertsachen: '', mitbringen: '', ohne: '' },
  felder: [{ k: 'wertsachen', l: 'Wertsachen bleiben …', typ: 'text' }, { k: 'mitbringen', l: 'Mitbringen', typ: 'text' }, { k: 'ohne', l: 'Ohne Sportzeug …', typ: 'text' }],
  gen: (d, P) => {
    const links = [K('Vor dem Sport', ['Schmuck und Uhren ablegen.', 'Piercings, die nicht abgehen: abkleben – nur wenn die Lehrkraft es erlaubt.', 'Lange Haare zusammenbinden.', 'Kein Kaugummi, nichts im Mund – Erstickungsgefahr!', 'Sportkleidung und saubere Hallenschuhe anziehen.', 'Brille: am besten eine Sportbrille.'], BLAU, '#e3f2fd', { nr: true })];
    const rechts = [K('In der Halle', ['Erst in die Halle, wenn die Lehrkraft da ist.', 'Geräte nur mit Erlaubnis aufbauen und benutzen.', 'Verletzt? Sofort der Lehrkraft sagen.', 'Wer Sicherheitsregeln nicht beachtet, kann vom Sport ausgeschlossen werden.'], GRUEN, '#e8f5e9'),
      F('Bei uns:', [['Wertsachen:', d.wertsachen], ['Mitbringen:', d.mitbringen], ['Ohne Sportzeug:', d.ohne]])];
    return seite('⚽', 'Sicher im Sportunterricht', P, { links, rechts,
      grundlage: 'RdErl. d. MK „Bestimmungen für den Schulsport“ v. 1.12.2023 – 24-52 100/1 (SVBl. 1/2024 S. 6), gültig bis 31.12.2029: Nr. 2.8 Sportkleidung, Nr. 2.9 Schmuck, Haare, Kaugummi, Nr. 2.10 Brillen, Nr. 2.11 Sicherheitsbelehrung (mind. einmal im Schuljahr, Eintrag im Klassenbuch).' });
  } };

// ---------- Fachräume ----------
B.be_fachraum = { name: 'Belehrung: Fachräume (Grundregeln)', gruppe: 'Klassenleben', def: { notaus: '' },
  felder: [{ k: 'notaus', l: 'Not-Aus-Schalter ist …', typ: 'text' }],
  gen: (d, P) => {
    const zeichen = Z(110, (x, y) => { const y0 = y + 55; return zWarnung(x + 60, y0, 96) + text(x + 130, y0 - 18, 'Chemie, Physik, Biologie, Technik, Küche, Werkraum:', 22, P.ink, fett) +
      text(x + 130, y0 + 16, 'Dort gelten eigene Regeln. Die Fachlehrkraft belehrt euch im Fachraum.', 20, P.ink); });
    const links = [K('Grundregeln für alle Fachräume', ['Nur mit Lehrkraft hineingehen.', 'Essen und Trinken sind verboten.', 'Nichts anfassen oder einschalten ohne Auftrag.', 'Schutzbrille und Schutzkleidung tragen, wenn es gesagt wird.', 'Lange Haare zusammenbinden.'], ORANGE, '#fff3e0', { nr: true })];
    const rechts = [K('Etwas ist passiert?', ['Unfall, Glasbruch oder etwas verschüttet? Sofort der Lehrkraft sagen.', 'Nichts selbst wegräumen.'], ROT, '#ffebee'),
      F('Bei uns:', [['Not-Aus-Schalter:', d.notaus]])];
    return seite('🧪', 'Fachräume – erst die Regeln', P, { oben: [zeichen], links, rechts,
      grundlage: 'KMK-Empfehlung „Richtlinie zur Sicherheit im Unterricht“ (RiSU) in der jeweils gültigen Fassung; Gefahrstoffverordnung; die ausführliche Unterweisung macht die Fachlehrkraft im Fachraum und dokumentiert sie.' });
  } };

// ---------- Eigentum und Fundsachen ----------
B.be_eigentum = { name: 'Belehrung: Eigentum, Wertsachen und Fundsachen', gruppe: 'Klassenleben', def: { fund: '', fach: '' },
  felder: [{ k: 'fund', l: 'Fundsachen abgeben bei …', typ: 'text' }, { k: 'fach', l: 'Schließfächer / Wertsachen', typ: 'text' }],
  gen: (d, P) => {
    const links = [K('Wertsachen', ['Bring nur mit, was du für die Schule brauchst.', 'Lass Geld, Handy und Wertsachen nie offen liegen.', 'Für deine Sachen bist du selbst verantwortlich.'], BLAU, '#e3f2fd'),
      K('Fremdes Eigentum', ['Nimm nichts, was dir nicht gehört – Diebstahl ist eine Straftat.', 'Wer etwas mutwillig kaputt macht, muss den Schaden bezahlen.', 'Das gilt auch für Tische, Toiletten, Wände und Geräte der Schule.'], ROT, '#ffebee')];
    const rechts = [K('Schulbücher (Ausleihe)', ['Schulbücher sorgfältig behandeln – mit Umschlag.', 'Nichts hineinschreiben.', 'Verloren oder kaputt? Dann muss das Buch ersetzt werden.'], GRUEN, '#e8f5e9'),
      F('Bei uns:', [['Fundsachen abgeben:', d.fund], ['Schließfach / Wertsachen:', d.fach]])];
    return seite('🎒', 'Eigentum, Wertsachen, Fundsachen', P, { links, rechts,
      grundlage: '§ 58 NSchG (Pflichten), § 61 NSchG; Schadensersatz §§ 823, 828 BGB; Diebstahl § 242 StGB, Sachbeschädigung § 303 StGB; Bedingungen der Lernmittelausleihe der Schule; Fundsachen §§ 965 ff. BGB; Schulordnung.' });
  } };
})();
