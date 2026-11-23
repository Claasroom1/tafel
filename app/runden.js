// Tafel-App – 🎯 Runden
// 1) Animation (Mathe › 📘 Erklärungen › Zahlen & Runden): Zahl und Rundungsstelle wählen. Schritt für Schritt: Rundungsstelle gelb,
//    Ziffer rechts daneben rot eingekreist, Regel 0–4 abrunden / 5–9 aufrunden, Zahlenstrahl zwischen den Nachbarzahlen
//    (die Zahl gleitet zur näheren), dann wird das Ergebnis geschrieben – Ziffern rechts werden 0, bei 9 mit Übertrag.
// 2) Vorlage „Runden – Stellenwerttafel“ (Einfügen › Mathe): Rundungsstelle wählbar (☰ ◀ ▶), gelb/rot markiert, eine oder mehrere
//    Zahlen oder leere Zeilen zum Ausfüllen; Lösung verdeckt (☰ 👁). Weißes Blatt.
'use strict';
(function () {
const h = T.h, NS = 'http://www.w3.org/2000/svg';
const STELLEN = [['M', 'Millionen', 6], ['HT', 'Hunderttausender', 5], ['ZT', 'Zehntausender', 4], ['T', 'Tausender', 3], ['H', 'Hunderter', 2], ['Z', 'Zehner', 1], ['E', 'Einer', 0]];
const EXP = Object.fromEntries(STELLEN.map(s => [s[0], s[2]])), NAME = Object.fromEntries(STELLEN.map(s => [s[0], s[1]]));
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); /* 4 738 mit schmalem Leerzeichen */
const runde = (zahl, e) => { const p = 10 ** e; return Math.floor(zahl / p + 0.5) * p; }; /* kaufmännisch: ab 5 aufrunden */
const warte = ms => new Promise(r => setTimeout(r, ms));
const svgEl = (tag, attr, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attr || {})) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const anim = (el, frames, ms, verz = 0) => el.animate(frames, { duration: ms, delay: verz, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {});
const TX = (x, y, s, g, f, w = 700) => svgEl('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': g, 'font-weight': w, fill: f || '#111', 'font-family': 'Segoe UI, system-ui' }, s);

/* ================= Animation ================= */
T.rundenAnim = () => {
  const B = 940, H = 540;
  const fZ = h('input', { class: 'feld', type: 'number', min: 1, max: 9999999, value: 4738, style: { width: '140px', fontSize: '20px' } });
  const fS = h('select', { class: 'feld' }, ...STELLEN.slice(1, 6).reverse().map(([k, n]) => h('option', { value: k }, 'auf ' + n))); fS.value = 'H';
  const tempo = h('select', { class: 'feld', title: 'Tempo' }, h('option', { value: '1.6' }, 'langsam'), h('option', { value: '1' }, 'normal'), h('option', { value: '0.6' }, 'schnell')); tempo.value = '1';
  const weiter = h('button', { class: 'big prim' }, 'Weiter ▶'), alles = h('button', { class: 'big' }, '▶▶ Alles'), neu = h('button', { class: 'big' }, '↺ Neu');
  const aufgabe = h('span', { class: 'ba-aufgabe' }), jetzt = h('span', { class: 'ba-jetzt' }), info = h('div', { class: 'ba-info' });
  const svg = svgEl('svg', { viewBox: `0 0 ${B} ${H}`, width: B, height: H, class: 'ba-svg' });
  const w = T.widget('🎯 Runden', [h('div', { class: 'row', style: { gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' } }, h('b', {}, 'Zahl'), fZ, fS, neu, h('span', { style: { flex: 1 } }), tempo, weiter, alles),
    h('div', { class: 'ba-gross' }, aufgabe, jetzt), info, h('div', { class: 'ba-wrap' }, svg)], Math.max(10, innerWidth / 2 - 480), 60);
  const wrap = w.querySelector('.ba-wrap'), passe = () => { wrap.style.zoom = String(Math.max(0.45, Math.min(1, (innerWidth - 40) / (B + 30), (innerHeight - 300) / H))); };
  passe(); addEventListener('resize', passe); const zuAlt = w.onclose; w.onclose = () => { removeEventListener('resize', passe); zuAlt && zuAlt(); };
  const t = ms => ms * (+tempo.value || 1);
  const sag = (s, f) => { info.textContent = s; info.style.borderColor = f || 'var(--acc,#4f46e5)'; }, zeig = (s, f) => { jetzt.textContent = s; jetzt.style.color = f || '#1d4ed8'; };
  let L = null, k = 0, besch = false;
  const SPW = 112, X0 = 76, YK = 46, YZ = 120, YE = 205;
  const spX = i => X0 + i * SPW + SPW / 2;
  function start() {
    if (besch) return;
    const zahl = Math.round(+fZ.value || 0), e = EXP[fS.value];
    if (!(zahl > 0) || zahl > 9999999) { sag('Bitte eine Zahl von 1 bis 9 999 999 eingeben.', '#dc2626'); return; }
    if (zahl < 10 ** e) { sag(`${fmt(zahl)} hat keine ${NAME[fS.value]} – kleinere Rundungsstelle wählen.`, '#dc2626'); return; }
    const ergebnis = runde(zahl, e), stellen = Math.max(String(zahl).length, String(ergebnis).length);
    const spalten = STELLEN.filter(s => s[2] < stellen); /* nur die nötigen Spalten */
    L = { zahl, e, ergebnis, spalten, ziffern: String(zahl).padStart(spalten.length, ' ').split(''), idx: spalten.findIndex(s => s[2] === e) };
    L.entsch = +String(zahl).padStart(spalten.length, '0')[L.idx + 1];
    k = 0; svg.innerHTML = '';
    aufgabe.textContent = `${fmt(zahl)} ≈ ?`; zeig(`auf ${NAME[fS.value]} runden`, '#475569');
    sag('„Weiter ▶“: Schritt für Schritt runden.');
    /* Stellenwerttafel */
    const x0 = X0, wT = spalten.length * SPW;
    svg.append(svgEl('rect', { x: x0, y: YK - 26, width: wT, height: YE - YK + 70, rx: 12, fill: '#fff', stroke: '#94a3b8', 'stroke-width': 2 }));
    for (let i = 1; i < spalten.length; i++) svg.append(svgEl('line', { x1: x0 + i * SPW, y1: YK - 26, x2: x0 + i * SPW, y2: YE + 44, stroke: '#cbd5e1', 'stroke-width': 2 }));
    svg.append(svgEl('line', { x1: x0, y1: YK + 26, x2: x0 + wT, y2: YK + 26, stroke: '#94a3b8', 'stroke-width': 2 }), svgEl('line', { x1: x0, y1: YZ + 42, x2: x0 + wT, y2: YZ + 42, stroke: '#cbd5e1', 'stroke-width': 2 }));
    L.markGelb = svgEl('rect', { x: x0 + L.idx * SPW + 3, y: YK - 23, width: SPW - 6, height: YE - YK + 64, rx: 10, fill: '#fde68a', opacity: 0 }); svg.append(L.markGelb);
    spalten.forEach(([kz], i) => svg.append(TX(spX(i), YK, kz, 26, i === L.idx ? '#b45309' : '#475569')));
    L.ziffernEl = L.ziffern.map((z, i) => { const el = TX(spX(i), YZ, z.trim(), 58, '#111', 800); svg.append(el); return el; });
    svg.append(TX(40, YZ, '', 30), TX(40, YE, '≈', 46, '#16a34a', 800));
    weiter.disabled = alles.disabled = false;
  }
  async function s1() {
    zeig(`1. Rundungsstelle: ${NAME[fS.value]}`, '#b45309'); sag(`Die ${NAME[fS.value]} sind die Rundungsstelle – hier steht eine ${L.ziffern[L.idx]}.`, '#b45309');
    await anim(L.markGelb, [{ opacity: 0 }, { opacity: 1 }], t(600));
  }
  async function s2() {
    const kz = L.spalten[L.idx + 1][0];
    zeig(`2. Rechts daneben (${kz}): ${L.entsch}`, '#dc2626'); sag(`Entscheidend ist nur die Ziffer rechts neben der Rundungsstelle (${NAME[kz]}): ${L.entsch}.`, '#dc2626');
    const kr = svgEl('circle', { cx: spX(L.idx + 1), cy: YZ, r: 40, fill: 'none', stroke: '#dc2626', 'stroke-width': 5, 'stroke-dasharray': 252, 'stroke-dashoffset': 252 }); svg.append(kr);
    await anim(kr, [{ strokeDashoffset: 252 }, { strokeDashoffset: 0 }], t(700));
  }
  async function s3() {
    const auf = L.entsch >= 5, y = 300, x0 = 170, bw = 60, g = svgEl('g'); svg.append(g);
    zeig(`3. ${L.entsch} → ${auf ? 'aufrunden' : 'abrunden'}`, auf ? '#ea580c' : '#2563eb');
    sag(`Regel: Bei 0, 1, 2, 3, 4 wird abgerundet, bei 5, 6, 7, 8, 9 aufgerundet. ${L.entsch} → ${auf ? 'aufrunden' : 'abrunden'}.`, auf ? '#ea580c' : '#2563eb');
    for (let d = 0; d <= 9; d++) { const x = x0 + d * (bw + 4), f = d < 5 ? '#dbeafe' : '#ffedd5', r = d < 5 ? '#2563eb' : '#ea580c';
      g.append(svgEl('rect', { x, y, width: bw, height: 52, rx: 8, fill: f, stroke: r, 'stroke-width': d === L.entsch ? 5 : 2 }), TX(x + bw / 2, y + 26, String(d), 30, r, 800)); }
    g.append(TX(x0 + 2.5 * (bw + 4) - 2, y + 76, '◀ abrunden', 22, '#2563eb'), TX(x0 + 7.5 * (bw + 4) - 2, y + 76, 'aufrunden ▶', 22, '#ea580c'));
    await anim(g, [{ opacity: 0 }, { opacity: 1 }], t(500));
    const z = x0 + L.entsch * (bw + 4) + bw / 2, pf = svgEl('path', { d: `M${z} ${y - 34} l-10 -16 h20 z`, fill: '#dc2626' }); svg.append(pf);
    await anim(pf, [{ transform: 'translateY(-14px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], t(700));
  }
  async function s4() {
    const p = 10 ** L.e, unten = Math.floor(L.zahl / p) * p, oben = unten + p, mitte = unten + p / 2, y = 470, xa = 150, xb = 790, X = v => xa + (v - unten) / p * (xb - xa);
    zeig(`4. Zwischen ${fmt(unten)} und ${fmt(oben)}`, '#7c3aed');
    sag(`${fmt(L.zahl)} liegt zwischen ${fmt(unten)} und ${fmt(oben)}. Die Mitte ist ${fmt(mitte)} – ${L.zahl >= mitte ? 'die Zahl liegt ab der Mitte, also näher an ' + fmt(oben) : 'die Zahl liegt vor der Mitte, also näher an ' + fmt(unten)}.`, '#7c3aed');
    const g = svgEl('g'); g.append(svgEl('line', { x1: xa - 30, y1: y, x2: xb + 30, y2: y, stroke: '#111', 'stroke-width': 3 }));
    for (const [v, l, f] of [[unten, fmt(unten), '#111'], [oben, fmt(oben), '#111'], [mitte, fmt(mitte), '#7c3aed']]) g.append(svgEl('line', { x1: X(v), y1: y - 14, x2: X(v), y2: y + 14, stroke: f, 'stroke-width': 3 }), TX(X(v), y + 34, l, 22, f));
    svg.append(g); await anim(g, [{ opacity: 0 }, { opacity: 1 }], t(500));
    const pt = svgEl('circle', { cx: X(L.zahl), cy: y, r: 11, fill: '#dc2626', stroke: '#fff', 'stroke-width': 3 }), lab = TX(X(L.zahl), y - 32, fmt(L.zahl), 22, '#dc2626');
    svg.append(pt, lab); await anim(pt, [{ opacity: 0 }, { opacity: 1 }], t(300)); await warte(t(500));
    const ziel = L.ergebnis === oben ? X(oben) : X(unten), dx = ziel - X(L.zahl);
    await Promise.all([anim(pt, [{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], t(1100)), anim(lab, [{ opacity: 1 }, { opacity: 0.35 }], t(1100))]);
  }
  async function s5() {
    const erg = String(L.ergebnis).padStart(L.spalten.length, ' ').split(''), auf = L.entsch >= 5;
    zeig(`5. ${fmt(L.zahl)} ≈ ${fmt(L.ergebnis)}`, '#16a34a');
    const neun = auf && L.ziffern[L.idx] === '9';
    sag((auf ? `Aufrunden: Die ${NAME[fS.value]}-Ziffer wird um 1 größer` + (neun ? ' – aus 9 wird 10, also Übertrag nach links' : '') : `Abrunden: Die ${NAME[fS.value]}-Ziffer bleibt`) + '. Alle Ziffern rechts davon werden 0.', '#16a34a');
    for (let i = 0; i < erg.length; i++) { const z = erg[i].trim(); if (!z) continue;
      const el = TX(spX(i), YE, z, 58, i > L.idx ? '#94a3b8' : i === L.idx || (neun && i < L.idx && z !== L.ziffern[i]) ? '#16a34a' : '#111', 800); svg.append(el);
      await anim(el, [{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 1, transform: 'translateY(0)' }], t(320)); }
    aufgabe.textContent = `${fmt(L.zahl)} ≈ ${fmt(L.ergebnis)}`; aufgabe.classList.add('eb-ok'); aufgabe.style.color = '#16a34a';
  }
  const SCHRITTE = [s1, s2, s3, s4, s5];
  async function naechster() {
    if (besch || !L || k >= SCHRITTE.length) return;
    besch = true; weiter.disabled = alles.disabled = true;
    try { await SCHRITTE[k++](); } finally { besch = false; }
    if (k >= SCHRITTE.length) { zeig('✓ gerundet', '#16a34a'); sag(`${fmt(L.zahl)} ≈ ${fmt(L.ergebnis)} (gerundet auf ${NAME[fS.value]}). Das Zeichen ≈ heißt „ungefähr gleich“.`, '#16a34a'); }
    else weiter.disabled = alles.disabled = false;
  }
  weiter.onclick = () => naechster();
  alles.onclick = async () => { while (L && k < SCHRITTE.length && w.isConnected) { await naechster(); await warte(t(500)); } };
  neu.onclick = () => { aufgabe.style.color = ''; start(); }; fZ.addEventListener('change', () => neu.onclick()); fS.addEventListener('change', () => neu.onclick());
  start();
  return w;
};

/* ================= Vorlage: Runden – Stellenwerttafel ================= */
const B = T.BAUSTEINE, f1 = v => Math.round(v * 10) / 10;
const RSTELLEN = STELLEN.slice(1, 6).reverse().map(([k, n]) => [k, n]); /* Z … HT */
B.runden = { name: 'Runden – Stellenwerttafel', gruppe: 'Mathe', def: { zahlen: '4738; 12 495; 960', stelle: 'H', leer: 3, regel: true, loesung: false },
  felder: [{ k: 'zahlen', l: 'Zahlen (mit ; trennen – leer = leere Zeilen zum Ausfüllen)', typ: 'text' },
    { k: 'stelle', l: 'Rundungsstelle', typ: 'auswahl', opts: RSTELLEN.map(([k, n]) => [k, n]) },
    { k: 'leer', l: 'Leere Zeilen (wenn keine Zahlen)', typ: 'zahl', min: 1, max: 8 },
    { k: 'regel', l: 'Regel „0–4 abrunden, 5–9 aufrunden“ darunter', typ: 'check' },
    { k: 'loesung', l: 'Lösung zeigen (grün)', typ: 'check' }],
  gen: d => {
    const e = EXP[d.stelle] != null ? EXP[d.stelle] : 2, zahlen = String(d.zahlen || '').split(';').map(s => +s.replace(/[^\d]/g, '')).filter(n => n > 0 && n <= 9999999);
    const zeilen = zahlen.length ? zahlen : Array(T.clamp(+d.leer || 3, 1, 8)).fill(null);
    const stellen = Math.max(e + 2, ...zahlen.map(n => String(Math.max(n, runde(n, e))).length));
    const spalten = STELLEN.filter(s => s[2] < stellen), idx = spalten.findIndex(s => s[2] === e);
    const SW = 74, ZH = 70, x0 = 24, y0 = 24, kopf = 58, wT = spalten.length * SW, xE = x0 + wT + 26, bE = 230, W = xE + bE + 24;
    const H = y0 + kopf + zeilen.length * ZH + (d.regel ? 108 : 16), ink = '#1f2937', tx = (x, y, s, g, f, w = 700) => T._svg.tx(x, y, s, f, g, 'middle', `font-weight="${w}"`);
    let s = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>`;
    /* gelbe Rundungsstelle, rot umrandet die Ziffer rechts daneben */
    s += `<rect x="${x0 + idx * SW + 2}" y="${y0 + 2}" width="${SW - 4}" height="${kopf + zeilen.length * ZH - 4}" rx="8" fill="#fde68a"/>`;
    s += `<rect x="${x0 + (idx + 1) * SW + 3}" y="${y0 + 3}" width="${SW - 6}" height="${kopf + zeilen.length * ZH - 6}" rx="8" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="8 6"/>`;
    s += `<rect x="${x0}" y="${y0}" width="${wT}" height="${kopf + zeilen.length * ZH}" rx="10" fill="none" stroke="#64748b" stroke-width="2.5"/>`;
    for (let i = 1; i < spalten.length; i++) s += `<line x1="${x0 + i * SW}" y1="${y0}" x2="${x0 + i * SW}" y2="${y0 + kopf + zeilen.length * ZH}" stroke="#94a3b8" stroke-width="1.5"/>`;
    for (let r = 0; r <= zeilen.length; r++) s += `<line x1="${x0}" y1="${y0 + kopf + r * ZH}" x2="${x0 + wT}" y2="${y0 + kopf + r * ZH}" stroke="#94a3b8" stroke-width="${r ? 1.5 : 2.5}"/>`;
    spalten.forEach(([kz], i) => { s += tx(x0 + i * SW + SW / 2, y0 + kopf / 2, kz, 24, i === idx ? '#b45309' : '#475569'); });
    s += tx(xE + bE / 2, y0 + kopf / 2, `gerundet auf ${NAME[d.stelle] || 'Hunderter'}`, 18, '#475569', 600);
    zeilen.forEach((n, r) => {
      const yc = y0 + kopf + r * ZH + ZH / 2;
      if (n != null) String(n).padStart(spalten.length, ' ').split('').forEach((z, i) => { if (z.trim()) s += tx(x0 + i * SW + SW / 2, yc, z, 40, ink, 800); });
      s += tx(xE - 6, yc, '≈', 40, '#16a34a', 800);
      s += `<rect x="${xE + 22}" y="${yc - 25}" width="${bE - 22}" height="50" rx="10" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="7 5"/>`;
      if (n != null && d.loesung) s += tx(xE + 22 + (bE - 22) / 2, yc, fmt(runde(n, e)), 34, '#16a34a', 800);
    });
    if (d.regel) { const yr = H - 76; for (let z = 0; z <= 9; z++) { const x = x0 + z * 40; s += `<rect x="${x}" y="${yr - 18}" width="36" height="36" rx="7" fill="${z < 5 ? '#dbeafe' : '#ffedd5'}" stroke="${z < 5 ? '#2563eb' : '#ea580c'}" stroke-width="2"/>` + tx(x + 18, yr, String(z), 22, z < 5 ? '#2563eb' : '#ea580c', 800); }
      s += T._svg.tx(x0, yr + 38, '0–4 abrunden · 5–9 aufrunden (die Ziffer rechts daneben entscheidet)', '#334155', 17, 'start', 'font-weight="700"'); }
    return { svg: T._svg.doc(f1(W), f1(H), s), w: W, h: H };
  } };
B.runden.schnell = d => {
  const i = RSTELLEN.findIndex(x => x[0] === d.stelle);
  return [{ l: d.loesung ? '🙈 Lösung verdecken' : '👁 Lösung zeigen', f: dd => ({ d: { ...dd, loesung: !dd.loesung } }) },
    ...(i < RSTELLEN.length - 1 ? [{ l: '◀ Rundungsstelle (' + RSTELLEN[i + 1][1] + ')', f: dd => ({ d: { ...dd, stelle: RSTELLEN[i + 1][0] } }) }] : []),
    ...(i > 0 ? [{ l: 'Rundungsstelle ▶ (' + RSTELLEN[i - 1][1] + ')', f: dd => ({ d: { ...dd, stelle: RSTELLEN[i - 1][0] } }) }] : [])];
};
{ const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};
  KV['runden:leer'] = { name: 'Runden – Stellenwerttafel (leer)', d: { zahlen: '' } }; }
})();
