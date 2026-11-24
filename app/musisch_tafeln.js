// Tafel-App – 🎵 Musik · 🎨 Kunst · ⚽ Sport: Bildtafeln (Vorlagen › Musik / Kunst / Sport)
// Notenwerte · Klaviatur · Rhythmusraster · Takt und Tempo · Instrumentengruppen · Farbkreis nach Itten · Perspektive · Bildanalyse · Drittelregel ·
// Spielfelder (maßstäblich) · Stationenkreis · Mannschaftseinteilung (mit Klassenliste) · Turnierplan. Alles selbst gezeichnet (SVG), Texte unter ✏️ Bearbeiten bzw. Optionen.
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', ROT = '#c62828', LILA = '#6a1b9a', GRAU = '#64748b', RAND = '#3a6d99', DUNKEL = '#1b1f2a';
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const quer = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, `text-anchor="middle" transform="rotate(-90 ${f(x)} ${f(y)})" ` + extra);
const fett = 'font-weight="700"';
const box = (x, y, w, h, rand, fuell, r = 14, sw = 2.5) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const pfeil = (x1, y1, x2, y2, col, w = 4) => { const a = Math.atan2(y2 - y1, x2 - x1), k = 16, ax = x2 - k * Math.cos(a), ay = y2 - k * Math.sin(a);
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(ax)}" y2="${f(ay)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${f(x2)} ${f(y2)} L ${f(ax + 9 * Math.sin(a))} ${f(ay - 9 * Math.cos(a))} L ${f(ax - 9 * Math.sin(a))} ${f(ay + 9 * Math.cos(a))} Z" fill="${col}"/>`; };
const umbruch = (z, max) => { const out = []; let cur = ''; for (const w of String(z).split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const zeilenText = (x, y, t, max, size, col, abst, extra = '', mittig = false) => umbruch(t, max).map((z, i) => (mittig ? mitte : text)(x, y + i * abst, z, size, col, extra)).join('');
const linie = (x1, y1, x2, y2, col, w = 2, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const kreis = (cx, cy, r, fuell, rand = 'none', sw = 0) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const vieleck = (pkte, fuell, rand = DUNKEL, sw = 2.5, extra = '') => `<path d="M ${pkte.map(p => f(p[0]) + ' ' + f(p[1])).join(' L ')} Z" fill="${fuell}" stroke="${rand}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`;
const anz = (v, a, b, def) => Math.round(T.clamp(+v || def, a, b));
const umschalten = (liste, id) => { const s = new Set(liste || []); s.has(id) ? s.delete(id) : s.add(id); return [...s]; };
const variante = (k, name, d) => { if (T.KACHEL_VARIANTEN) T.KACHEL_VARIANTEN[k] = { name, d }; };
function tafel(icon, titel, W, H, inhalt, P) {
  return { svg: T._svg.doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 42, icon + ' ' + titel, 32, P.ink, fett) + inhalt), w: W, h: H };
}

/* =====================================================================  MUSIK  ===================================================================== */

// ---------- Notenwerte ----------
const NW = [['ganze Note', 'ganze Pause', '4'], ['halbe Note', 'halbe Pause', '2'], ['Viertelnote', 'Viertelpause', '1'], ['Achtelnote', 'Achtelpause', '½'], ['Sechzehntelnote', 'Sechzehntelpause', '¼']];
function notenkopf(x, y, art, P) { /* 0 = ganze (hohl, ohne Hals), 1 = halbe (hohl), 2 = gefüllt */
  if (art === 0) return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="13" ry="8.5" fill="${P.papier}" stroke="${P.ink}" stroke-width="3.5"/>`;
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="10" ry="7" fill="${art === 1 ? P.papier : P.ink}" stroke="${P.ink}" stroke-width="2.6" transform="rotate(-20 ${f(x)} ${f(y)})"/>`;
}
function pausenzeichen(k, cx, yc, P) { /* auf kurzem Notensystem (Linienabstand 9), yc = Mittellinie */
  let s = '';
  for (let j = -2; j <= 2; j++) s += linie(cx - 30, yc + j * 9, cx + 30, yc + j * 9, GRAU, 1.4);
  if (k === 0) s += `<rect x="${f(cx - 12)}" y="${f(yc - 9)}" width="24" height="5" fill="${P.ink}"/>`; /* hängt unter der 4. Linie */
  else if (k === 1) s += `<rect x="${f(cx - 12)}" y="${f(yc - 5)}" width="24" height="5" fill="${P.ink}"/>`; /* liegt auf der 3. Linie */
  else if (k === 2) s += `<path d="M ${cx - 3} ${yc - 16} L ${cx + 5} ${yc - 6} L ${cx - 3} ${yc + 2} L ${cx + 5} ${yc + 10} C ${cx - 4} ${yc + 6} ${cx - 6} ${yc + 14} ${cx} ${yc + 18}" fill="none" stroke="${P.ink}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/>`;
  else if (k === 3) s += kreis(cx - 4, yc - 6, 3.6, P.ink) + `<path d="M ${cx - 4} ${yc - 3} Q ${cx + 1} ${yc - 1} ${cx + 6} ${yc - 9} L ${cx - 1} ${yc + 14}" fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  else s += kreis(cx - 3, yc - 10, 3.3, P.ink) + kreis(cx - 6, yc - 1, 3.3, P.ink) + `<path d="M ${cx - 3} ${yc - 7} Q ${cx + 2} ${yc - 5} ${cx + 7} ${yc - 13} L ${cx - 2} ${yc + 14} M ${cx - 6} ${yc + 2} Q ${cx - 1} ${yc + 4} ${cx + 4} ${yc - 4}" fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  return s;
}
B.mu_notenwerte = { name: 'Notenwerte und Pausen', gruppe: 'Musik', def: { namen: true },
  felder: [{ k: 'namen', l: 'Namen zeigen (aus = leer zum Beschriften)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 740, Y = [165, 280, 395, 510, 625], xL = 40, xR = 560, xpos = (k, i) => xL + (i + 0.5) * (xR - xL) / (1 << k);
    let s = mitte(300, 90, 'Note', 20, GRAU, fett) + mitte(632, 90, 'Pause', 20, GRAU, fett) + text(690, 90, 'Name', 20, GRAU, fett) + mitte(925, 82, 'Schläge', 20, GRAU, fett) + mitte(925, 106, 'im 4/4-Takt', 18, GRAU);
    NW.forEach(([nn, pn, sch], k) => {
      const y = Y[k], n = 1 << k;
      if (k < 4) s += linie(30, y + 33, 970, y + 33, GRAU, 1, 'stroke-dasharray="4 6" opacity=".6"');
      if (k > 0) for (let i = 0; i < n; i++) s += linie(xpos(k - 1, i >> 1), Y[k - 1] + 12, xpos(k, i) + 4, y - 64, GRAU, 1.5);
      for (let i = 0; i < n; i++) { const x = xpos(k, i); s += notenkopf(x, y, Math.min(k, 2), P); if (k > 0) s += linie(x + 9, y - 2, x + 9, y - 52, P.ink, 2.6); }
      if (k >= 3) { const g = k === 3 ? 2 : 4; /* Balken: Achtel paarweise, Sechzehntel zu viert */
        for (let i = 0; i < n; i += g) { const xa = xpos(k, i) + 9, xb = xpos(k, i + g - 1) + 9;
          s += `<rect x="${f(xa - 1.3)}" y="${y - 52}" width="${f(xb - xa + 2.6)}" height="6" fill="${P.ink}"/>`;
          if (k === 4) s += `<rect x="${f(xa - 1.3)}" y="${y - 42}" width="${f(xb - xa + 2.6)}" height="6" fill="${P.ink}"/>`; } }
      s += pausenzeichen(k, 632, y - 22, P);
      if (d.namen) s += text(690, y - 34, nn, 21, P.ink, fett) + text(690, y - 8, pn, 19, P.ink);
      s += mitte(925, y - 22, sch, 32, P.ink, fett);
    });
    s += mitte(500, 702, '1 ganze Note = 2 halbe = 4 Viertel = 8 Achtel = 16 Sechzehntel', 22, P.ink, fett);
    return tafel('🎵', 'Notenwerte und Pausen', W, H, s, P);
  } };
B.mu_notenwerte.schnell = [{ l: '🏷 Namen ein/aus', f: dd => ({ d: { ...dd, namen: !dd.namen } }) }];

// ---------- Klaviatur ----------
const WEISS = ['c', 'd', 'e', 'f', 'g', 'a', 'h'], SCHWARZ = [[0, 'cis', 'des'], [1, 'dis', 'es'], [3, 'fis', 'ges'], [4, 'gis', 'as'], [5, 'ais', 'b']];
B.mu_klavier = { name: 'Klaviatur (Tasten antippen)', gruppe: 'Musik', def: { oktaven: 2, namen: true, schwarz: false, an: [] },
  felder: [{ k: 'oktaven', l: 'Oktaven', typ: 'zahl', min: 1, max: 3 }, { k: 'namen', l: 'Tonnamen auf den weißen Tasten', typ: 'check' }, { k: 'schwarz', l: 'Schwarze Tasten beschriften (cis/des …)', typ: 'check' }],
  gen: (d, P) => {
    const n = anz(d.oktaven, 1, 3, 2), zahl = n * 7 + 1, wk = n === 1 ? 110 : 62, W = Math.max(1000, zahl * wk + 80), x0 = (W - zahl * wk) / 2, y0 = 90, hw = 300, hs = 190, bk = wk * 0.6, H = y0 + hw + 70;
    const an = new Set(d.an || []), teile = [], hatSchwarz = i => i >= 0 && i < n * 7 && [0, 1, 3, 4, 5].includes(i % 7);
    let s = '', sw = '';
    for (let i = 0; i < zahl; i++) { const x = x0 + i * wk, id = 'w' + i;
      s += `<rect x="${f(x)}" y="${y0}" width="${f(wk)}" height="${hw}" rx="6" fill="${an.has(id) ? '#ffb74d' : '#ffffff'}" stroke="${DUNKEL}" stroke-width="2.5"/>`;
      if (d.namen) s += mitte(x + wk / 2, y0 + hw - 32, WEISS[i % 7], n === 1 ? 30 : 24, DUNKEL, fett);
      const l = hatSchwarz(i - 1) ? x + bk / 2 : x, r = hatSchwarz(i) ? x + wk - bk / 2 : x + wk; /* Tippflächen ohne Überlappung mit den schwarzen Tasten */
      teile.push({ id, x: l, y: y0, w: r - l, h: hs }, { id, x, y: y0 + hs, w: wk, h: hw - hs }); }
    for (let o = 0; o < n; o++) SCHWARZ.forEach(([pos, n1, n2], j) => { const id = 'b' + (o * 5 + j), cx = x0 + (o * 7 + pos + 1) * wk, x = cx - bk / 2;
      sw += `<rect x="${f(x)}" y="${y0}" width="${f(bk)}" height="${hs}" rx="4" fill="${an.has(id) ? ORANGE : DUNKEL}" stroke="${DUNKEL}" stroke-width="2"/>`;
      if (d.schwarz) sw += mitte(cx, y0 + hs - 50, n1, 18, '#ffffff', fett) + mitte(cx, y0 + hs - 26, n2, 18, '#ffffff', fett);
      teile.push({ id, x, y: y0, w: bk, h: hs }); });
    s += sw + text(x0, y0 + hw + 36, 'Taste antippen: markieren – nochmals antippen: wieder aus', 18, GRAU);
    return { ...tafel('🎹', 'Klaviatur', W, H, s, P), teile };
  },
  tippen: (o, id) => T.bausteinAendern(o, { f: dd => ({ d: { ...dd, an: umschalten(dd.an, id) } }) }) };
B.mu_klavier.schnell = [{ l: '⬜ Alle aus', f: dd => ({ d: { ...dd, an: [] } }) },
  { l: '🎼 C-Dur-Tonleiter', f: dd => ({ d: { ...dd, an: ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'] } }) },
  { l: '🏷 Namen ein/aus', f: dd => ({ d: { ...dd, namen: !dd.namen } }) }];
variante('mu_klavier:cdur', 'Klaviatur: C-Dur-Dreiklang (c – e – g)', { oktaven: 2, namen: true, schwarz: false, an: ['w0', 'w2', 'w4'] });
variante('mu_klavier:leer', 'Klaviatur ohne Tonnamen', { oktaven: 2, namen: false, schwarz: false, an: [] });

// ---------- Rhythmusraster (Body-Percussion) ----------
const ZAEHL = { 4: [''], 8: ['', '+'], 16: ['', 'e', '+', 'e'] }, STIMMFARBE = ['#1e88e5', '#e53935', '#43a047', '#fb8c00'];
B.mu_rhythmus = { name: 'Rhythmusraster (Body-Percussion)', gruppe: 'Musik', def: { takte: 4, unter: '4', stimmen: 3, name1: 'Klatschen', name2: 'Stampfen', name3: 'Schnipsen', name4: 'Patschen', an: [] },
  felder: [{ k: 'takte', l: 'Takte', typ: 'zahl', min: 1, max: 8 }, { k: 'unter', l: 'Kästchen je Takt', typ: 'auswahl', opts: [['4', '4 – Viertel (1 2 3 4)'], ['8', '8 – Achtel (1 + 2 + …)'], ['16', '16 – Sechzehntel (1 e + e …)']] },
    { k: 'stimmen', l: 'Stimmen (Zeilen)', typ: 'zahl', min: 1, max: 4 }, { k: 'name1', l: 'Stimme 1', typ: 'text' }, { k: 'name2', l: 'Stimme 2', typ: 'text' }, { k: 'name3', l: 'Stimme 3', typ: 'text' }, { k: 'name4', l: 'Stimme 4', typ: 'text' }],
  gen: (d, P) => {
    const u = [4, 8, 16].includes(+d.unter) ? +d.unter : 4, sub = u / 4, nT = anz(d.takte, 1, 8, 4), nS = anz(d.stimmen, 1, 4, 3), proSys = u === 16 ? 2 : 4, cw = u === 4 ? 52 : 40, zh = 58, kh = 40;
    const sysAnz = Math.ceil(nT / proSys), gx0 = 220, W = Math.max(1000, gx0 + Math.min(nT, proSys) * u * cw + 30), sysH = kh + nS * zh + 36, y0 = 78, H = y0 + sysAnz * sysH + 40;
    const an = new Set(d.an || []), teile = [];
    let s = '';
    for (let sy = 0; sy < sysAnz; sy++) {
      const ys = y0 + sy * sysH, t0 = sy * proSys, t1 = Math.min(nT, t0 + proSys), xe = gx0 + (t1 - t0) * u * cw, yg = ys + kh, yu = yg + nS * zh;
      for (let v = 0; v < nS; v++) { const yv = yg + v * zh, nm = d['name' + (v + 1)];
        if (v) s += linie(40, yv, xe, yv, GRAU, 1.2);
        s += nm ? text(40, yv + zh / 2, nm, 21, STIMMFARBE[v], fett) : linie(40, yv + zh - 12, gx0 - 20, yv + zh - 12, GRAU, 1.5, 'stroke-dasharray="4 5"'); }
      for (let t = t0; t < t1; t++) for (let k = 0; k < u; k++) {
        const c = t * u + k, x = gx0 + ((t - t0) * u + k) * cw, j = k % sub, schlag = j === 0;
        s += mitte(x + cw / 2, ys + kh / 2, schlag ? String(k / sub + 1) : ZAEHL[u][j], schlag ? 21 : 19, schlag ? P.ink : GRAU, schlag ? fett : '');
        if (k > 0) s += linie(x, yg, x, yu, GRAU, schlag ? 1.8 : 0.8, schlag ? '' : 'stroke-dasharray="3 4"');
        for (let v = 0; v < nS; v++) { const id = 'r' + v + '_' + c, yv = yg + v * zh, on = an.has(id);
          s += kreis(x + cw / 2, yv + zh / 2, Math.min(cw, zh) * 0.32, on ? STIMMFARBE[v] : 'none', on ? STIMMFARBE[v] : GRAU, on ? 2 : 1.4);
          teile.push({ id, x, y: yv, w: cw, h: zh }); } }
      s += linie(gx0, yg, xe, yg, P.ink, 2) + linie(gx0, yu, xe, yu, P.ink, 2);
      for (let t = t0; t <= t1; t++) { const x = gx0 + (t - t0) * u * cw;
        if (t === nT) s += linie(x - 7, yg, x - 7, yu, P.ink, 1.8) + linie(x, yg, x, yu, P.ink, 6); /* Schlussstrich */
        else s += linie(x, yg, x, yu, P.ink, 3); }
    }
    s += text(40, H - 28, 'Kreis antippen: Schlag setzen – nochmals antippen: wieder weg', 18, GRAU);
    return { ...tafel('🥁', 'Rhythmus – Body-Percussion', W, H, s, P), teile };
  },
  tippen: (o, id) => T.bausteinAendern(o, { f: dd => ({ d: { ...dd, an: umschalten(dd.an, id) } }) }) };
B.mu_rhythmus.schnell = [{ l: '⬜ Alle aus', f: dd => ({ d: { ...dd, an: [] } }) },
  { l: '🔁 Unterteilung 4 → 8 → 16', f: dd => ({ d: { ...dd, unter: { 4: '8', 8: '16', 16: '4' }[+dd.unter] || '4', an: [] } }) },
  { l: '＋ Takt', f: dd => ({ d: { ...dd, takte: Math.min(8, (+dd.takte || 4) + 1) } }) }, { l: '− Takt', f: dd => ({ d: { ...dd, takte: Math.max(1, (+dd.takte || 4) - 1) } }) }];

// ---------- Takt, Tempo, Dynamik ----------
const TAKTARTEN = [['2', '4', 'z. B. Marsch, Polka', [2, 0], 2], ['3', '4', 'z. B. Walzer', [2, 0, 0], 3], ['4', '4', 'z. B. Popmusik', [2, 0, 1, 0], 4], ['6', '8', 'z. B. Tarantella', [2, 0, 0, 1, 0, 0], 2]];
const TEMPI = [['Largo', 'breit, sehr langsam', 'ca. 40–60'], ['Adagio', 'langsam, ruhig', 'ca. 66–76'], ['Andante', 'gehend, ruhig', 'ca. 76–108'], ['Moderato', 'mäßig bewegt', 'ca. 108–120'], ['Allegro', 'schnell, lebhaft', 'ca. 120–168'], ['Presto', 'sehr schnell', 'ca. 168–200']];
const DYNAMIK = [['pp', 'pianissimo', 'sehr leise'], ['p', 'piano', 'leise'], ['mp', 'mezzopiano', 'mäßig leise'], ['mf', 'mezzoforte', 'mäßig laut'], ['f', 'forte', 'laut'], ['ff', 'fortissimo', 'sehr laut']];
const NOTENSCHRIFT = 'font-family="Times New Roman, Georgia, serif" font-style="italic" font-weight="700"';
function dirigierfigur(art, cx, ty) { /* einfache Schlagfigur (rechte Hand), ty = oberer Punkt */
  const c = ROT, z = (x, y, t) => mitte(x, y, t, 21, c, fett);
  if (art === 2) return pfeil(cx - 14, ty, cx - 14, ty + 85, c) + pfeil(cx + 14, ty + 85, cx + 14, ty + 4, c) + z(cx - 34, ty + 78, '1') + z(cx + 34, ty + 10, '2');
  if (art === 3) return pfeil(cx, ty, cx, ty + 85, c) + pfeil(cx + 4, ty + 85, cx + 64, ty + 48, c) + pfeil(cx + 62, ty + 42, cx + 6, ty + 2, c) + z(cx - 16, ty + 84, '1') + z(cx + 80, ty + 50, '2') + z(cx - 14, ty + 4, '3');
  return pfeil(cx, ty, cx, ty + 85, c) + pfeil(cx - 3, ty + 85, cx - 62, ty + 48, c) + pfeil(cx - 58, ty + 44, cx + 62, ty + 44, c) + pfeil(cx + 62, ty + 40, cx + 6, ty + 2, c)
    + z(cx + 16, ty + 88, '1') + z(cx - 78, ty + 48, '2') + z(cx + 78, ty + 48, '3') + z(cx - 14, ty + 4, '4');
}
B.mu_takt = { name: 'Takt, Tempo und Lautstärke', gruppe: 'Musik', def: { takt: true, tempo: true, dynamik: true },
  felder: [{ k: 'takt', l: 'Taktarten (Betonung, Dirigieren)', typ: 'check' }, { k: 'tempo', l: 'Tempobezeichnungen', typ: 'check' }, { k: 'dynamik', l: 'Lautstärke (Dynamik)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000; let s = '', y = 70;
    if (d.takt) {
      s += text(30, 92, 'Taktarten', 24, P.ink, fett);
      const yk = 112, FARBEN = ['#e3f2fd', '#e8f5e9', '#fff3e0', '#f3e5f5'], RAENDER = [BLAU, GRUEN, ORANGE, LILA];
      TAKTARTEN.forEach(([z, n, bsp, bet, fig], i) => { const x = 30 + i * 238, w = 226;
        s += box(x, yk, w, 350, RAENDER[i], FARBEN[i]);
        s += mitte(x + 44, yk + 40, z, 38, DUNKEL, fett) + mitte(x + 44, yk + 80, n, 38, DUNKEL, fett);
        s += mitte(x + 145, yk + 40, z + '/' + n + '-Takt', 22, DUNKEL, fett) + zeilenText(x + 145, yk + 72, bsp, 14, 18, DUNKEL, 22, '', true);
        s += text(x + 14, yk + 126, 'Betonung:', 18, DUNKEL, fett);
        const gap = (w - 28) / bet.length;
        bet.forEach((st, j) => { const bx = x + 14 + gap * (j + 0.5), hb = [10, 20, 32][st], bw = Math.min(gap * 0.5, 22);
          s += mitte(bx, yk + 160, String(j + 1), [20, 25, 32][st], DUNKEL, st ? fett : '');
          s += `<rect x="${f(bx - bw / 2)}" y="${yk + 212 - hb}" width="${f(bw)}" height="${hb}" rx="3" fill="${['#90a4ae', '#64b5f6', BLAU][st]}"/>`; });
        s += text(x + 14, yk + 236, i === 3 ? 'Dirigieren in 2:' : 'Dirigieren:', 18, DUNKEL, fett);
        s += dirigierfigur(fig, x + w / 2, yk + 254);
      });
      s += text(30, 484, 'groß = schwer (betont) · mittel = halbschwer · klein = leicht (unbetont)', 18, P.ink);
      s += text(30, 508, '6/8-Takt im schnellen Tempo: 2 Schläge zu je 3 Achteln', 18, P.ink);
      y = 545;
    }
    let hB = 0;
    if (d.tempo) {
      s += text(30, y + 10, 'Tempo', 24, P.ink, fett) + text(30, y + 48, 'Bezeichnung', 18, GRAU, fett) + text(165, y + 48, 'Bedeutung', 18, GRAU, fett) + text(480, y + 48, 'Schläge/Min.', 18, GRAU, 'text-anchor="end" ' + fett);
      TEMPI.forEach(([n, bed, bpm], i) => { const yy = y + 88 + i * 40;
        s += linie(30, yy - 20, 480, yy - 20, GRAU, 1, 'opacity=".5"') + text(30, yy, n, 22, P.ink, fett) + text(165, yy, bed, 20, P.ink) + text(480, yy, bpm, 20, P.ink, 'text-anchor="end"'); });
      s += pfeil(492, y + 76, 492, y + 300, GRAU, 3);
      hB = 330;
    }
    if (d.dynamik) {
      const x = d.tempo ? 525 : 30;
      s += text(x, y + 10, 'Lautstärke (Dynamik)', 24, P.ink, fett);
      DYNAMIK.forEach(([z, it, bed], i) => { const yy = y + 56 + i * 38;
        s += text(x + 4, yy, z, 28, P.ink, NOTENSCHRIFT) + text(x + 78, yy, it, 20, P.ink, 'font-style="italic"') + text(x + 245, yy, bed, 20, P.ink); });
      const yc = y + 56 + 6 * 38 + 14, yd = yc + 56;
      s += `<path d="M ${x + 120} ${yc - 13} L ${x + 4} ${yc} L ${x + 120} ${yc + 13}" fill="none" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>` + text(x + 140, yc - 12, 'crescendo (cresc.)', 20, P.ink, 'font-style="italic"') + text(x + 140, yc + 14, 'allmählich lauter', 19, P.ink);
      s += `<path d="M ${x + 4} ${yd - 13} L ${x + 120} ${yd} L ${x + 4} ${yd + 13}" fill="none" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>` + text(x + 140, yd - 12, 'decrescendo (decresc.)', 20, P.ink, 'font-style="italic"') + text(x + 140, yd + 14, 'allmählich leiser', 19, P.ink);
      hB = Math.max(hB, yd + 34 - y);
    }
    const H = Math.round(y + Math.max(hB, d.takt ? 0 : 60) + 20);
    return tafel('🎼', 'Takt, Tempo und Lautstärke', W, H, s, P);
  } };

// ---------- Instrumentengruppen ----------
const INSTR = [
  ['Streichinstrumente', 'Violine (Geige), Bratsche, Violoncello, Kontrabass', 'Saiten werden mit dem Bogen gestrichen (oder gezupft) und schwingen. Der Holzkörper verstärkt den Klang.', '#6d4c41', '#efebe9'],
  ['Holzblasinstrumente', 'Querflöte, Klarinette, Oboe, Fagott', 'Die Luft schwingt an einer Kante (Flöte) oder ein Rohrblatt schwingt und bringt die Luft im Rohr zum Schwingen.', GRUEN, '#e8f5e9'],
  ['Blechblasinstrumente', 'Trompete, Posaune, Horn, Tuba', 'Die Lippen schwingen („summen“) im Mundstück und bringen die Luft im Rohr zum Schwingen.', '#b26a00', '#fff8e1'],
  ['Schlaginstrumente', 'Pauke, Große Trommel, Becken, Xylofon', 'Fell, Holz oder Metall wird angeschlagen und schwingt.', ROT, '#ffebee'],
  ['Tasteninstrumente', 'Klavier (Flügel), Cembalo, Orgel', 'Über eine Mechanik: Hammer schlägt Saite (Klavier), Saite wird angerissen (Cembalo), Luft strömt in Pfeifen (Orgel).', BLAU, '#e3f2fd']];
B.mu_instrumente = { name: 'Instrumentengruppen (Orchester)', gruppe: 'Musik', def: { leer: false },
  felder: [{ k: 'leer', l: 'Leer (nur Gruppennamen – Beispiele und Tonerzeugung selbst eintragen)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 800; let s = text(40, 92, 'Gruppe', 18, GRAU, fett) + text(320, 92, 'Beispiele', 18, GRAU, fett) + text(590, 92, 'So entsteht der Ton', 18, GRAU, fett);
    INSTR.forEach(([n, bsp, ton, col, fuell], i) => { const y = 110 + i * 124, h = 112, ym = y + h / 2;
      s += box(30, y, 940, h, col, fuell) + linie(305, y + 12, 305, y + h - 12, col, 1.5) + linie(575, y + 12, 575, y + h - 12, col, 1.5);
      s += text(46, ym, n, 21, col, fett);
      if (!d.leer) { const zb = umbruch(bsp, 24).length, zt = umbruch(ton, 40).length;
        s += zeilenText(320, ym - (zb - 1) * 12.5, bsp, 24, 19, DUNKEL, 25) + zeilenText(590, ym - (zt - 1) * 12.5, ton, 40, 19, DUNKEL, 25); } });
    if (!d.leer) s += text(30, 760, 'Die Querflöte ist meist aus Metall – sie zählt trotzdem zu den Holzblasinstrumenten.', 19, P.ink);
    return tafel('🎻', 'Instrumentengruppen im Orchester', W, H, s, P);
  } };
B.mu_instrumente.schnell = [{ l: '🙈 Leer / ausgefüllt', f: dd => ({ d: { ...dd, leer: !dd.leer } }) }];

/* =====================================================================  KUNST  ===================================================================== */

// ---------- Farbkreis nach Itten ----------
const ITTEN = [['Gelb', '#ffe500'], ['Gelborange', '#ffb400'], ['Orange', '#ff7f00'], ['Rotorange', '#f4511e'], ['Rot', '#e30613'], ['Rotviolett', '#a8136b'],
  ['Violett', '#6a1b9a'], ['Blauviolett', '#3e2b8f'], ['Blau', '#0057b8'], ['Blaugrün', '#00897b'], ['Grün', '#2e9a3a'], ['Gelbgrün', '#9ccc2a']];
const HELL = new Set([0, 1, 2, 11]);
B.ku_farbkreis = { name: 'Farbkreis nach Itten', gruppe: 'Kunst', def: { modus: 'normal', namen: true, farbe: true },
  felder: [{ k: 'modus', l: 'Darstellung', typ: 'auswahl', opts: [['normal', 'Farbkreis (Primär-, Sekundär-, Tertiärfarben)'], ['komplementaer', 'Komplementärfarben'], ['warmkalt', 'Warme und kalte Farben']] },
    { k: 'namen', l: 'Farbnamen zeigen', typ: 'check' }, { k: 'farbe', l: 'Farbig (aus = weiß zum Ausmalen)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 710, cx = 340, cy = 410, ro = 220, ri = 140, R = 128, modus = d.modus || 'normal', farbig = d.farbe !== false;
    const pt = (r, g) => [cx + r * Math.sin(g * Math.PI / 180), cy - r * Math.cos(g * Math.PI / 180)], P2 = (r, g) => pt(r, g).map(f).join(' ');
    const fuell = i => farbig ? ITTEN[i][1] : '#ffffff', tinte = i => farbig && !HELL.has(i) ? '#ffffff' : DUNKEL, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = '';
    if (modus === 'warmkalt') { /* warm/kalt-Bögen außen */
      s += `<path d="M ${P2(ro + 9, 15)} A ${ro + 9} ${ro + 9} 0 0 1 ${P2(ro + 9, 165)}" fill="none" stroke="#ef6c00" stroke-width="11"/>`;
      s += `<path d="M ${P2(ro + 9, 195)} A ${ro + 9} ${ro + 9} 0 0 1 ${P2(ro + 9, 345)}" fill="none" stroke="#1e88e5" stroke-width="11"/>`; }
    for (let i = 0; i < 12; i++) { const a1 = i * 30 - 15, a2 = i * 30 + 15;
      s += `<path d="M ${P2(ro, a1)} A ${ro} ${ro} 0 0 1 ${P2(ro, a2)} L ${P2(ri, a2)} A ${ri} ${ri} 0 0 0 ${P2(ri, a1)} Z" fill="${fuell(i)}" stroke="${DUNKEL}" stroke-width="2.5" stroke-linejoin="round"/>`; }
    const VG = pt(R, 0), VR = pt(R, 120), VB = pt(R, 240), C = [cx, cy];
    s += vieleck([VG, mid(VG, VR), C, mid(VB, VG)], fuell(0)) + vieleck([VR, mid(VR, VB), C, mid(VG, VR)], fuell(4)) + vieleck([VB, mid(VB, VG), C, mid(VR, VB)], fuell(8));
    s += vieleck([VG, pt(R, 60), VR], fuell(2)) + vieleck([VR, pt(R, 180), VB], fuell(6)) + vieleck([VB, pt(R, 300), VG], fuell(10));
    if (modus === 'warmkalt') s += linie(...pt(ro + 8, 0), ...pt(ri - 6, 0), P.ink, 4, 'stroke-dasharray="9 6"') + linie(...pt(ri - 6, 180), ...pt(ro + 8, 180), P.ink, 4, 'stroke-dasharray="9 6"');
    if (modus === 'komplementaer') for (const [a, b] of [[0, 6], [4, 10], [8, 2]]) { const p = pt(180, a * 30), q = pt(180, b * 30);
      s += linie(...p, ...q, '#ffffff', 9) + linie(...p, ...q, DUNKEL, 4) + kreis(...p, 9, DUNKEL, '#ffffff', 3) + kreis(...q, 9, DUNKEL, '#ffffff', 3); }
    if (d.namen) {
      for (const [i, r, dy] of [[0, 0.45, 0], [4, 0.45, 0], [8, 0.45, 0], [2, 0.667, -12], [6, 0.667, 0], [10, 0.667, -12]]) { if (modus === 'komplementaer') break; const [x, y] = pt(R * r, i * 30); s += mitte(x, y + dy, ITTEN[i][0], 18, tinte(i), fett); }
      const rl = ro + (modus === 'warmkalt' ? 26 : 14);
      for (let i = 0; i < 12; i++) { const g = i * 30, [x, y] = pt(rl, g), sn = Math.sin(g * Math.PI / 180);
        s += Math.abs(sn) < 0.01 ? mitte(x, y + (g === 0 ? -12 : 14), ITTEN[i][0], 20, P.ink) : text(x, y, ITTEN[i][0], 20, P.ink, sn > 0 ? '' : 'text-anchor="end"'); }
    }
    let yP = 110; const zeile = (t, size, col, extra = '', luft = 8) => { const mx = size >= 20 ? 28 : 32, z = umbruch(t, mx); s += zeilenText(690, yP, t, mx, size, col, size + 6, extra); yP += z.length * (size + 6) + luft; };
    if (modus === 'komplementaer') {
      zeile('Komplementärfarben', 23, P.ink, fett, 10); zeile('liegen sich im Farbkreis genau gegenüber:', 19, P.ink, '', 14);
      for (const t of ['Gelb – Violett', 'Rot – Grün', 'Blau – Orange']) zeile(t, 21, P.ink, fett, 4);
      yP += 14; zeile('Nebeneinander verstärken sie sich gegenseitig (Komplementärkontrast).', 19, P.ink, '', 14);
      zeile('Gemischt ergeben sie ein trübes Grau oder Braun.', 19, P.ink);
    } else if (modus === 'warmkalt') {
      s += text(560, 112, 'warm', 28, '#ef6c00', fett) + text(60, 112, 'kalt', 28, '#1e88e5', fett);
      zeile('Warme Farben', 22, '#ef6c00', fett, 4); zeile('Gelborange bis Rotviolett', 19, P.ink, '', 2); zeile('wirken nah, anregend, aktiv', 19, P.ink, '', 22);
      zeile('Kalte Farben', 22, '#1e88e5', fett, 4); zeile('Blauviolett bis Gelbgrün', 19, P.ink, '', 2); zeile('wirken fern, ruhig, kühl', 19, P.ink, '', 22);
      zeile('Gelb und Violett liegen auf der Grenze.', 19, P.ink, '', 14); zeile('am wärmsten: Rotorange', 19, P.ink, fett, 2); zeile('am kältesten: Blaugrün', 19, P.ink, fett);
    } else if (d.namen) {
      zeile('Primärfarben (1. Ordnung)', 20, P.ink, fett, 2); zeile('Gelb, Rot, Blau – nicht aus anderen Farben mischbar', 19, P.ink, '', 20);
      zeile('Sekundärfarben (2. Ordnung)', 20, P.ink, fett, 2); zeile('aus zwei Primärfarben gemischt:', 19, P.ink, '', 2);
      for (const t of ['Gelb + Rot = Orange', 'Rot + Blau = Violett', 'Blau + Gelb = Grün']) zeile(t, 19, P.ink, '', 0);
      yP += 20; zeile('Tertiärfarben (3. Ordnung)', 20, P.ink, fett, 2); zeile('Primärfarbe + benachbarte Sekundärfarbe, z. B. Gelb + Orange = Gelborange', 19, P.ink);
    }
    const titel = { komplementaer: 'Farbkreis: Komplementärfarben', warmkalt: 'Farbkreis: warme und kalte Farben' }[modus] || 'Farbkreis nach Itten';
    return tafel('🎨', titel, W, H, s, P);
  } };
B.ku_farbkreis.schnell = [{ l: '🏷 Namen ein/aus', f: dd => ({ d: { ...dd, namen: !dd.namen } }) }, { l: '🖍 Farbig / weiß', f: dd => ({ d: { ...dd, farbe: dd.farbe === false } }) }];
variante('ku_farbkreis:komplementaer', 'Farbkreis: Komplementärfarben', { modus: 'komplementaer', namen: true, farbe: true });
variante('ku_farbkreis:leer', 'Farbkreis leer (zum Ausmalen)', { modus: 'normal', namen: false, farbe: false });
variante('ku_farbkreis:warmkalt', 'Farbkreis: warme und kalte Farben', { modus: 'warmkalt', namen: true, farbe: true });

// ---------- Perspektive ----------
const schnitt = (p1, p2, p3, p4) => { const n = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]), a = p1[0] * p2[1] - p1[1] * p2[0], b = p3[0] * p4[1] - p3[1] * p4[0];
  return [(a * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b) / n, (a * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b) / n]; };
const aufLinie = (p, q, x) => [x, p[1] + (q[1] - p[1]) * (x - p[0]) / (q[0] - p[0])];
const FLUCHT = '#e53935', HORIZONT = '#1e88e5';
B.ku_perspektive = { name: 'Perspektive (Fluchtpunkt)', gruppe: 'Kunst', def: { art: 'eins', begriffe: true },
  felder: [{ k: 'art', l: 'Art', typ: 'auswahl', opts: [['eins', 'Zentralperspektive (1 Fluchtpunkt)'], ['zwei', 'Übereckperspektive (2 Fluchtpunkte)']] }, { k: 'begriffe', l: 'Begriffe zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 700, hy = 250, fl = (p, q) => linie(p[0], p[1], q[0], q[1], FLUCHT, 1.8, 'stroke-dasharray="8 6"');
    let s = '';
    if (d.art === 'zwei') {
      const F1 = [60, hy], F2 = [940, hy], Ct = [480, 330], Cb = [480, 560];
      const Lt = aufLinie(Ct, F1, 280), Lb = aufLinie(Cb, F1, 280), Rt = aufLinie(Ct, F2, 720), Rb = aufLinie(Cb, F2, 720);
      const m1 = aufLinie(Ct, F1, schnitt(Ct, Lb, Lt, Cb)[0]), Hd = schnitt(Lt, F2, Rt, F1), m2 = schnitt(m1, F2, Rt, Hd);
      const A = [m1[0], m1[1] - 110], A2 = aufLinie(A, F2, m2[0]);
      s += linie(30, hy, 970, hy, HORIZONT, 3);
      s += fl(Ct, F1) + fl(Cb, F1) + fl(Ct, F2) + fl(Cb, F2) + fl(A, F2);
      s += vieleck([Lt, Ct, Cb, Lb], '#ffcc80') + vieleck([Ct, Rt, Rb, Cb], '#ffb74d') + vieleck([Lt, Ct, A], '#ffcc80') + vieleck([Ct, Rt, A2, A], '#e57373');
      s += linie(Ct[0], Ct[1], Cb[0], Cb[1], DUNKEL, 4);
      s += kreis(...F1, 8, FLUCHT) + kreis(...F2, 8, FLUCHT);
      if (d.begriffe) {
        s += text(200, hy - 22, 'Horizont', 20, HORIZONT, fett) + text(40, hy - 26, 'Fluchtpunkt 1', 20, FLUCHT, fett) + text(960, hy - 26, 'Fluchtpunkt 2', 20, FLUCHT, 'text-anchor="end" ' + fett);
        s += text(30, 362, 'Fluchtlinien', 20, FLUCHT, fett) + mitte(Cb[0], Cb[1] + 26, 'vorn: groß', 19, P.ink, fett) + text(Lb[0] - 12, Lb[1] + 14, 'hinten: kleiner', 19, P.ink, 'text-anchor="end" ' + fett);
        s += text(30, 650, 'Die vordere Kante steht senkrecht – die Seiten laufen zu zwei Fluchtpunkten auf dem Horizont.', 20, P.ink);
      }
      return tafel('📐', 'Übereckperspektive (zwei Fluchtpunkte)', W, H, s, P);
    }
    const FP = [500, hy], zu = (p, k) => [FP[0] + (p[0] - FP[0]) * k, FP[1] + (p[1] - FP[1]) * k], tiefe = z => 1 / (1 + 0.4 * z);
    s += linie(30, hy, 970, hy, HORIZONT, 3);
    s += vieleck([[230, 600], [770, 600], FP], 'rgba(120,144,156,.45)', 'none', 0) + linie(230, 600, ...FP, P.ink, 3) + linie(770, 600, ...FP, P.ink, 3);
    for (let k = 0; k < 9; k++) { const z1 = k * 1.2, z2 = z1 + 0.6; s += linie(500, hy + 350 * tiefe(z1), 500, hy + 350 * tiefe(z2), '#ffffff', Math.max(1.5, 7 * tiefe(z1))); }
    s += fl([830, 600], FP) + fl([830, 420], FP);
    for (const z of [0, 1.5, 3.5, 7]) { const k = tiefe(z), b = zu([830, 600], k), t = zu([830, 420], k);
      s += linie(b[0], b[1], t[0], t[1], P.ink, 8 * k + 1) + kreis(t[0], t[1], 12 * k + 1, '#fbc02d', P.ink, 1.5); }
    const Fr = [[50, 390], [190, 390], [190, 500], [50, 500]], Bk = Fr.map(p => zu(p, 0.75));
    s += fl(Fr[0], FP) + fl(Fr[1], FP) + fl(Fr[2], FP);
    s += vieleck([Fr[0], Fr[1], Bk[1], Bk[0]], '#bbdefb') + vieleck([Fr[1], Bk[1], Bk[2], Fr[2]], '#64b5f6') + vieleck(Fr, '#90caf9');
    s += kreis(...FP, 8, FLUCHT);
    if (d.begriffe) {
      s += text(30, hy - 22, 'Horizont (Augenhöhe)', 20, HORIZONT, fett) + text(516, hy - 26, 'Fluchtpunkt', 20, FLUCHT, fett) + text(40, 330, 'Fluchtlinien', 20, FLUCHT, fett);
      s += text(30, 560, 'Vordergrund: groß', 20, P.ink, fett) + text(620, 205, 'Hintergrund: klein', 20, P.ink, fett);
      s += text(30, 650, 'Alle Linien, die in die Tiefe führen, treffen sich im Fluchtpunkt auf dem Horizont.', 20, P.ink);
    }
    return tafel('📐', 'Zentralperspektive (ein Fluchtpunkt)', W, H, s, P);
  } };
B.ku_perspektive.schnell = [{ l: '🏷 Begriffe ein/aus', f: dd => ({ d: { ...dd, begriffe: !dd.begriffe } }) }];
variante('ku_perspektive:eins', 'Zentralperspektive (1 Fluchtpunkt)', { art: 'eins', begriffe: true });
variante('ku_perspektive:zwei', 'Übereckperspektive (2 Fluchtpunkte)', { art: 'zwei', begriffe: true });

// ---------- Bildanalyse ----------
const SCHRITTE = [['Erster Eindruck', 'Was fällt mir auf? Wie wirkt das Bild auf mich?', ORANGE, '#fff3e0'],
  ['Beschreiben', 'Was ist zu sehen? Vorder-, Mittel-, Hintergrund – genau und sachlich', BLAU, '#e3f2fd'],
  ['Analysieren', 'Farbe, Form, Komposition, Licht: Wie ist das Bild gestaltet?', GRUEN, '#e8f5e9'],
  ['Deuten', 'Was bedeutet das Bild? Was will die Künstlerin / der Künstler sagen?', LILA, '#f3e5f5'],
  ['Bewerten', 'Wie gefällt mir das Bild? Meinung mit Gründen', ROT, '#ffebee']];
B.ku_bildanalyse = { name: 'Bildanalyse in 5 Schritten', gruppe: 'Kunst', def: { ebenen: false },
  felder: [{ k: 'ebenen', l: 'Bildfeld in Vorder-, Mittel-, Hintergrund gliedern', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 710, bx = 30, by = 80, bw = 460, bh = 600;
    let s = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="none" stroke="${P.ink}" stroke-width="2.5" stroke-dasharray="12 8"/>`;
    if (d.ebenen) {
      for (const k of [1, 2]) s += linie(bx, by + k * bh / 3, bx + bw, by + k * bh / 3, GRAU, 2, 'stroke-dasharray="8 7"');
      ['Hintergrund', 'Mittelgrund', 'Vordergrund'].forEach((t, k) => { s += text(bx + 14, by + k * bh / 3 + 24, t, 20, GRAU, fett); });
    }
    s += mitte(bx + bw / 2, by + bh / 2, 'Bild hier einfügen', 22, GRAU);
    SCHRITTE.forEach(([t, u, col, fl], i) => { const y = 80 + i * 122;
      s += box(515, y, 455, 112, col, fl) + kreis(548, y + 30, 18, col) + mitte(548, y + 31, String(i + 1), 22, '#ffffff', fett);
      s += text(578, y + 30, t, 23, DUNKEL, fett) + zeilenText(578, y + 64, u, 38, 19, DUNKEL, 24); });
    return tafel('🖼', 'Bildanalyse', W, H, s, P);
  } };
B.ku_bildanalyse.schnell = [{ l: '🧱 Bildebenen ein/aus', f: dd => ({ d: { ...dd, ebenen: !dd.ebenen } }) }];
variante('ku_bildanalyse:ebenen', 'Bildanalyse: Vorder-, Mittel-, Hintergrund', { ebenen: true });

/* =====================================================================  SPORT  ===================================================================== */

// ---------- Spielfelder (maßstäblich, Draufsicht) ----------
const FELDER = {
  fussball: { L: 105, B: 68, m: 8, oy: 108, icon: '⚽', name: 'Fußballfeld (105 × 68 m)' },
  handball: { L: 40, B: 20, m: 21, oy: 110, icon: '🤾', name: 'Handballfeld (40 × 20 m)' },
  basketball: { L: 28, B: 15, m: 30, oy: 110, icon: '🏀', name: 'Basketballfeld (28 × 15 m)' },
  volleyball: { L: 18, B: 9, m: 44, oy: 180, icon: '🏐', name: 'Volleyballfeld (18 × 9 m)' },
  halle: { L: 27, B: 15, m: 31, oy: 132, icon: '🏃', name: 'Sporthalle (Einfeldhalle 27 × 15 m)' } };
const RASEN = '#3b8a3e', RASEN2 = '#449648', HOLZ = '#c8915a', BRAUN = '#3e2723', WAND = '#5d4037', WL = '#ffffff';
B.sp_feld = { name: 'Spielfeld (maßstäblich)', gruppe: 'Sport', def: { art: 'fussball', masse: false },
  felder: [{ k: 'art', l: 'Spielfeld', typ: 'auswahl', opts: [['fussball', 'Fußball'], ['handball', 'Handball'], ['basketball', 'Basketball'], ['volleyball', 'Volleyball'], ['halle', 'Leere Sporthalle (Einfeldhalle)']] },
    { k: 'masse', l: 'Maße zeigen', typ: 'check' }],
  gen: (d, P) => {
    const art = FELDER[d.art] ? d.art : 'fussball', F = FELDER[art], W = 1000, m = F.m, ox = (W - F.L * m) / 2, oy = F.oy, rasen = art === 'fussball';
    const H = Math.round(oy + F.B * m + (art === 'halle' ? 4.6 * m + 50 : art === 'volleyball' ? 1.75 * m + 70 : 76));
    const X = x => ox + x * m, Y = y => oy + y * m, mc = rasen ? WL : BRAUN, gestr = 'stroke-dasharray="6 5"';
    const ln = (x1, y1, x2, y2, w = 3, extra = '') => linie(X(x1), Y(y1), X(x2), Y(y2), WL, w, extra);
    const re = (x1, y1, x2, y2, fuell = 'none') => `<rect x="${f(X(Math.min(x1, x2)))}" y="${f(Y(Math.min(y1, y2)))}" width="${f(Math.abs(x2 - x1) * m)}" height="${f(Math.abs(y2 - y1) * m)}" fill="${fuell}" stroke="${WL}" stroke-width="3"/>`;
    const pk = (x, y) => kreis(X(x), Y(y), 4, WL);
    const bogen = (cx, cy, r, a1, a2, extra = '') => { const p = a => [X(cx + r * Math.cos(a * Math.PI / 180)), Y(cy + r * Math.sin(a * Math.PI / 180))], [x1, y1] = p(a1), [x2, y2] = p(a2);
      return `<path d="M ${f(x1)} ${f(y1)} A ${f(r * m)} ${f(r * m)} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${f(x2)} ${f(y2)}" fill="none" stroke="${WL}" stroke-width="3" ${extra}/>`; };
    const bogenS = (cx, cy, r, a1, a2, rechts) => rechts ? bogen(F.L - cx, cy, r, 180 - a2, 180 - a1) : bogen(cx, cy, r, a1, a2);
    const massH = (a, b, yp, t, oben = false) => linie(X(a), yp, X(b), yp, mc, 1.5) + linie(X(a), yp - 7, X(a), yp + 7, mc, 1.5) + linie(X(b), yp - 7, X(b), yp + 7, mc, 1.5) + mitte((X(a) + X(b)) / 2, oben ? yp - 16 : yp + 18, t, 20, mc, fett);
    const massV = (a, b, xp, tx, t) => linie(xp, Y(a), xp, Y(b), mc, 1.5) + linie(xp - 7, Y(a), xp + 7, Y(a), mc, 1.5) + linie(xp - 7, Y(b), xp + 7, Y(b), mc, 1.5) + quer(tx, (Y(a) + Y(b)) / 2, t, 20, mc, fett);
    const mt = (x, y, t, extra = '') => mitte(X(x), Y(y), t, 18, mc, fett + ' ' + extra);
    let s = `<rect x="20" y="66" width="${W - 40}" height="${H - 86}" rx="14" fill="${rasen ? RASEN : art === 'halle' ? '#eceff1' : HOLZ}"/>`;
    if (rasen) for (let i = 0; i < 14; i += 2) s += `<rect x="${f(X(i * 7.5))}" y="${f(Y(0))}" width="${f(7.5 * m)}" height="${f(68 * m)}" fill="${RASEN2}"/>`;
    if (art !== 'halle') s += re(0, 0, F.L, F.B);

    if (art === 'fussball') {
      s += ln(52.5, 0, 52.5, 68) + `<circle cx="${f(X(52.5))}" cy="${f(Y(34))}" r="${f(9.15 * m)}" fill="none" stroke="${WL}" stroke-width="3"/>` + pk(52.5, 34);
      s += bogen(0, 0, 1, 0, 90) + bogen(0, 68, 1, -90, 0) + bogen(105, 0, 1, 90, 180) + bogen(105, 68, 1, 180, 270);
      for (const r of [false, true]) { const sx = x => r ? 105 - x : x;
        s += re(sx(0), 13.84, sx(16.5), 54.16) + re(sx(0), 24.84, sx(5.5), 43.16) + pk(sx(11), 34) + bogenS(11, 34, 9.15, -53.13, 53.13, r) + re(sx(0), 30.34, sx(-2), 37.66, 'rgba(255,255,255,.25)'); }
      if (d.masse) {
        s += massH(0, 105, Y(68) + 24, '105 m') + massV(0, 68, X(0) - 34, X(0) - 50, '68 m');
        s += ln(0, 57, 16.5, 57, 1.5, gestr) + mt(8.25, 59.3, '16,5 m') + ln(14.5, 13.84, 14.5, 54.16, 1.5, gestr) + quer(X(12.4), Y(20), '40,32 m', 18, mc, fett);
        s += ln(0, 22.6, 5.5, 22.6, 1.5, gestr) + text(X(0.3), Y(20.6), '5,5 m', 18, mc, fett) + quer(X(7.2), Y(34), '18,32 m', 18, mc, fett) + mt(11.6, 37, '11 m');
        s += ln(52.5, 34, 52.5 + 9.15 * Math.cos(-40 * Math.PI / 180), 34 + 9.15 * Math.sin(-40 * Math.PI / 180), 1.5, gestr) + text(X(60.5), Y(23.5), 'r = 9,15 m', 18, mc, fett);
        s += quer(X(107) + 16, Y(34), 'Tor 7,32 m', 18, mc, fett) + text(X(1.4), Y(2.2), 'r = 1 m', 18, mc, fett);
      }
    } else if (art === 'handball') {
      s += ln(20, 0, 20, 20);
      const q = Math.max(0.15, 7 / m);
      s += ln(15.5, 20 - q, 15.5, 20 + q) + ln(24.5, 20 - q, 24.5, 20 + q);
      for (const r of [false, true]) { const sx = x => r ? 40 - x : x, sw = r ? 0 : 1, A = (x, y) => f(X(sx(x))) + ' ' + f(Y(y)), k = Math.max(0.075, 6 / m);
        s += `<path d="M ${A(0, 2.5)} A ${f(6 * m)} ${f(6 * m)} 0 0 ${sw} ${A(6, 8.5)} L ${A(6, 11.5)} A ${f(6 * m)} ${f(6 * m)} 0 0 ${sw} ${A(0, 17.5)}" fill="rgba(255,255,255,.15)" stroke="${WL}" stroke-width="3"/>`;
        s += `<path d="M ${A(Math.sqrt(81 - 72.25), 0)} A ${f(9 * m)} ${f(9 * m)} 0 0 ${sw} ${A(9, 8.5)} L ${A(9, 11.5)} A ${f(9 * m)} ${f(9 * m)} 0 0 ${sw} ${A(Math.sqrt(81 - 72.25), 20)}" fill="none" stroke="${WL}" stroke-width="3" stroke-dasharray="10 8"/>`;
        s += ln(sx(7), 9.5, sx(7), 10.5) + ln(sx(4), 10 - k, sx(4), 10 + k) + re(sx(0), 8.5, sx(-1), 11.5, 'rgba(255,255,255,.3)'); }
      if (d.masse) {
        s += massH(0, 40, Y(20) + 26, '40 m') + massV(0, 20, X(40) + 34, X(40) + 49, '20 m');
        s += ln(0, 8.5, 6.364, 2.136, 1.5, gestr) + mt(2.1, 4.4, '6 m') + mt(8.4, 2.0, '9 m') + mt(7, 12.6, '7 m') + mt(4, 11.2, '4 m') + quer(X(-1) - 16, Y(10), 'Tor 3 m', 18, mc, fett);
      }
    } else if (art === 'basketball') {
      s += ln(14, 0, 14, 15) + `<circle cx="${f(X(14))}" cy="${f(Y(7.5))}" r="${f(1.8 * m)}" fill="none" stroke="${WL}" stroke-width="3"/>`;
      for (const r of [false, true]) { const sx = x => r ? 28 - x : x, sw = r ? 0 : 1, A = (x, y) => f(X(sx(x))) + ' ' + f(Y(y)), x3 = 1.575 + Math.sqrt(6.75 * 6.75 - 6.6 * 6.6);
        s += `<path d="M ${A(0, 0.9)} L ${A(x3, 0.9)} A ${f(6.75 * m)} ${f(6.75 * m)} 0 0 ${sw} ${A(x3, 14.1)} L ${A(0, 14.1)}" fill="none" stroke="${WL}" stroke-width="3"/>`;
        s += re(sx(0), 5.05, sx(5.8), 9.95, 'rgba(255,255,255,.18)');
        s += `<path d="M ${A(5.8, 5.7)} A ${f(1.8 * m)} ${f(1.8 * m)} 0 0 ${sw} ${A(5.8, 9.3)}" fill="none" stroke="${WL}" stroke-width="3"/>`;
        s += `<path d="M ${A(1.2, 6.25)} L ${A(1.575, 6.25)} A ${f(1.25 * m)} ${f(1.25 * m)} 0 0 ${sw} ${A(1.575, 8.75)} L ${A(1.2, 8.75)}" fill="none" stroke="${WL}" stroke-width="2.5"/>`;
        s += linie(X(sx(1.2)), Y(6.6), X(sx(1.2)), Y(8.4), WL, 6) + linie(X(sx(1.2)), Y(7.5), X(sx(1.35)), Y(7.5), '#ff7043', 3) + kreis(X(sx(1.575)), Y(7.5), 0.225 * m, 'none', '#ff7043', 3.5); }
      if (d.masse) {
        s += massH(0, 28, Y(15) + 26, '28 m') + massV(0, 15, X(28) + 34, X(28) + 49, '15 m');
        s += ln(1.575, 7.5, 1.575 + 6.75 * Math.cos(40 * Math.PI / 180), 7.5 - 6.75 * Math.sin(40 * Math.PI / 180), 1.5, gestr) + mt(4.4, 3.4, '6,75 m') + text(X(0.3), Y(0.45), '0,90 m', 18, mc, fett);
        s += quer(X(5.25), Y(7.5), '4,90 m', 18, mc, fett) + ln(0, 9.55, 5.8, 9.55, 1.5, gestr) + mt(3.9, 9.05, '5,80 m') + text(X(0.3), Y(11), 'Korbmitte 1,575 m', 18, mc, fett);
        s += ln(14, 7.5, 14 + 1.8 * Math.cos(Math.PI / 4), 7.5 - 1.8 * Math.sin(Math.PI / 4), 1.5, gestr) + text(X(15.5), Y(5.6), 'r = 1,80 m', 18, mc, fett);
      }
    } else if (art === 'volleyball') {
      for (const x of [6, 12]) s += ln(x, 0, x, 9) + ln(x, -1.75, x, 0, 3, `stroke-dasharray="${f(0.15 * m)} ${f(0.2 * m)}"`) + ln(x, 9, x, 10.75, 3, `stroke-dasharray="${f(0.15 * m)} ${f(0.2 * m)}"`);
      s += ln(9, 0, 9, 9) + linie(X(9), Y(-1), X(9), Y(10), WL, 7, 'opacity=".9"') + kreis(X(9), Y(-1), 8, '#455a64', WL, 2) + kreis(X(9), Y(10), 8, '#455a64', WL, 2);
      if (d.masse) {
        s += massH(0, 18, Y(10.75) + 22, '18 m') + massV(0, 9, X(0) - 30, X(0) - 45, '9 m') + mitte(X(9), Y(-1) - 26, 'Netz', 18, mc, fett);
        for (const [a, b] of [[6, 9], [9, 12]]) s += ln(a, 0.7, b, 0.7, 1.5, gestr) + mt((a + b) / 2, 1.3, '3 m') + mt((a + b) / 2, 4.5, 'Angriffszone');
      }
    } else {
      const wd = 0.4 * m, BODEN = HOLZ, RAUM = '#cfd8dc';
      s += `<rect x="${f(X(0.8))}" y="${f(Y(15.2))}" width="${f(25.4 * m)}" height="${f(4.4 * m)}" fill="${RAUM}" stroke="${WAND}" stroke-width="${f(wd)}"/>`;
      s += `<rect x="${f(X(-0.2))}" y="${f(Y(-0.2))}" width="${f(27.4 * m)}" height="${f(15.4 * m)}" fill="${BODEN}" stroke="${WAND}" stroke-width="${f(wd)}"/>`;
      for (const a of [4, 12, 20]) s += `<rect x="${f(X(a))}" y="${f(Y(14.95))}" width="${f(3 * m)}" height="${f(0.5 * m)}" fill="${RAUM}"/>` + linie(X(a), Y(15.2), X(a + 3), Y(15.2), WAND, 2, 'stroke-dasharray="5 4"');
      for (const [a, sw] of [[2, 1], [23.5, 0]]) { const hx = sw ? a : a + 1.5;
        s += `<rect x="${f(X(a))}" y="${f(Y(-0.45))}" width="${f(1.5 * m)}" height="${f(0.5 * m)}" fill="${BODEN}"/>` + linie(X(hx), Y(0), X(hx), Y(1.5), WAND, 3);
        s += `<path d="M ${f(X(sw ? a + 1.5 : a))} ${f(Y(0))} A ${f(1.5 * m)} ${f(1.5 * m)} 0 0 ${sw} ${f(X(hx))} ${f(Y(1.5))}" fill="none" stroke="${WAND}" stroke-width="1.5" stroke-dasharray="4 4"/>`; }
      s += linie(X(0.05), Y(3), X(0.05), Y(12), WAND, 3) + linie(X(0.35), Y(3), X(0.35), Y(12), WAND, 3);
      for (let y = 3.25; y < 12; y += 0.5) s += linie(X(0.05), Y(y), X(0.35), Y(y), WAND, 2);
      s += mitte(X(13.5), Y(17.4), 'Geräteraum', 22, BRAUN, fett) + mitte(X(2.75), Y(2.2), 'Tür', 18, BRAUN, fett) + mitte(X(24.25), Y(2.2), 'Tür', 18, BRAUN, fett) + quer(X(1.0), Y(7.5), 'Sprossenwand', 18, BRAUN, fett);
      if (d.masse) s += massH(0, 27, Y(0) - 26, '27 m', true) + massV(0, 15, X(27) + 34, X(27) + 49, '15 m');
    }
    return tafel(F.icon, F.name, W, H, s, P);
  } };
B.sp_feld.schnell = [{ l: '📏 Maße ein/aus', f: dd => ({ d: { ...dd, masse: !dd.masse } }) }];
variante('sp_feld:fussball', 'Fußballfeld (105 × 68 m)', { art: 'fussball', masse: false });
variante('sp_feld:handball', 'Handballfeld (40 × 20 m)', { art: 'handball', masse: false });
variante('sp_feld:basketball', 'Basketballfeld (28 × 15 m)', { art: 'basketball', masse: false });
variante('sp_feld:volleyball', 'Volleyballfeld (18 × 9 m)', { art: 'volleyball', masse: false });
variante('sp_feld:halle', 'Leere Sporthalle (Aufbauplan)', { art: 'halle', masse: false });

// ---------- Stationenkreis / Zirkeltraining ----------
const STATIONSFARBEN = ['#1e88e5', '#e53935', '#43a047', '#fb8c00', '#8e24aa', '#00897b', '#6d4c41', '#d81b60', '#3949ab', '#7cb342'];
B.sp_stationen = { name: 'Stationenkreis (Zirkeltraining)', gruppe: 'Sport', def: { anzahl: 6, belastung: '45 s Belastung', wechsel: '15 s Wechsel' },
  felder: [{ k: 'anzahl', l: 'Anzahl Stationen', typ: 'zahl', min: 4, max: 10 }, { k: 'belastung', l: 'Belastung', typ: 'text' }, { k: 'wechsel', l: 'Pause / Wechsel', typ: 'text' }],
  gen: (d, P) => {
    const n = anz(d.anzahl, 4, 10, 6), W = 1000, R = 300, r = Math.min(105, Math.PI * R / n * 0.62), cx = 500, cy = 80 + R + r, H = Math.round(cy + R + r + 30);
    const p = a => [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    let s = '', kr = '';
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n, [x, y] = p(a), col = STATIONSFARBEN[i % STATIONSFARBEN.length];
      kr += kreis(x, y, r, '#ffffff', col, 5) + kreis(x, y - r + 26, 19, col) + mitte(x, y - r + 27, String(i + 1), 22, '#ffffff', fett);
      const d1 = (r + 12) / R, a1 = a + d1, a2 = a + 2 * Math.PI / n - d1, ae = a2 - 14 / R, [x1, y1] = p(a1), [x2, y2] = p(ae), [tx, ty] = p(a2), t = [-Math.sin(a2), Math.cos(a2)], nn = [Math.cos(a2), Math.sin(a2)], bx = tx - 16 * t[0], by = ty - 16 * t[1];
      s += `<path d="M ${f(x1)} ${f(y1)} A ${R} ${R} 0 0 1 ${f(x2)} ${f(y2)}" fill="none" stroke="${GRAU}" stroke-width="5" stroke-linecap="round"/>`;
      s += `<path d="M ${f(tx)} ${f(ty)} L ${f(bx + 9 * nn[0])} ${f(by + 9 * nn[1])} L ${f(bx - 9 * nn[0])} ${f(by - 9 * nn[1])} Z" fill="${GRAU}"/>`; }
    s += kr + box(cx - 170, cy - 75, 340, 150, ORANGE, '#fff3e0', 18, 3) + linie(cx - 140, cy, cx + 140, cy, ORANGE, 1.5, 'stroke-dasharray="6 5"');
    if (d.belastung) s += mitte(cx, cy - 36, d.belastung, 26, ROT, fett);
    if (d.wechsel) s += mitte(cx, cy + 36, d.wechsel, 24, GRUEN, fett);
    return tafel('🔄', 'Zirkeltraining – Stationen', W, H, s, P);
  } };
B.sp_stationen.schnell = [{ l: '＋ Station', f: dd => ({ d: { ...dd, anzahl: Math.min(10, (+dd.anzahl || 6) + 1) } }) }, { l: '− Station', f: dd => ({ d: { ...dd, anzahl: Math.max(4, (+dd.anzahl || 6) - 1) } }) }];

// ---------- Mannschaftseinteilung ----------
const LEIBCHEN = { rot: '#e53935', blau: '#1e88e5', gelb: '#fdd835', 'grün': '#43a047', gruen: '#43a047', orange: '#fb8c00', 'weiß': '#ffffff', weiss: '#ffffff', schwarz: '#212121',
  lila: '#8e24aa', violett: '#8e24aa', pink: '#ec407a', rosa: '#f48fb1', grau: '#9e9e9e', 'türkis': '#00acc1', tuerkis: '#00acc1', braun: '#795548', hellblau: '#4fc3f7', hellgrün: '#9ccc65' };
const HELLE_LEIBCHEN = new Set(['#fdd835', '#ffffff', '#fb8c00', '#f48fb1', '#9e9e9e', '#4fc3f7', '#9ccc65']);
const paarungen = n => { const t = [...Array(n).keys()]; if (n % 2) t.push(-1); const k = t.length, out = [];
  for (let r = 0; r < k - 1; r++) { for (let i = 0; i < k / 2; i++) { const a = t[i], b = t[k - 1 - i]; if (a >= 0 && b >= 0) out.push([a, b]); } t.splice(1, 0, t.pop()); }
  return out; };
const mischen = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const verteilen = (a, n) => Array.from({ length: n }, (_, i) => a.filter((_, j) => j % n === i));
const passend = (t, px, gr = 20) => { t = String(t); let sz = gr; if (t.length * sz * 0.58 > px) sz = Math.min(gr, 18); /* zu lang: auf 18 px, dann kürzen */
  const max = Math.max(2, Math.floor(px / (sz * 0.58))); return [t.length > max ? t.slice(0, max - 1) + '…' : t, sz]; };
const klassenListe = kl => { if (!kl) return []; /* Namen nur aus dem lokalen Speicher dieses Browsers – nichts wird gesendet */
  try { const L = JSON.parse(localStorage.getItem('tafelapp.klassen') || '{}'), a = L && typeof L === 'object' ? L[kl] : null;
    return Array.isArray(a) ? a.map(x => String(x == null ? '' : x).trim()).filter(Boolean) : []; } catch (e) { return []; } };
const tafelKlasse = d => String(d.klasse || '').trim() || String((T.S && T.S.board && T.S.board.klasse) || '').trim();
const teamListen = d => typeof d.namen === 'string' /* Feld „namen“: eine Zeile je Team, z. B. „Rot: Anna, Ben“ – sonst d.teams (Array je Team) */
  ? d.namen.split(/\r?\n/).filter(l => l.trim()).map(l => { const p = l.indexOf(':'); return (p >= 0 ? l.slice(p + 1) : l).split(',').map(x => x.trim()).filter(Boolean); })
  : Array.isArray(d.teams) ? d.teams.map(t => Array.isArray(t) ? t.map(x => String(x == null ? '' : x).trim()).filter(Boolean) : []) : [];
const teamInfo = (d, i) => { const nm = String(d.farben || '').split(',').map(x => x.trim()).filter(Boolean)[i] || 'Team ' + (i + 1), col = LEIBCHEN[nm.toLowerCase()] || '#90a4ae';
  return { nm, col, rand: col === '#ffffff' ? '#9e9e9e' : col, schrift: HELLE_LEIBCHEN.has(col) ? DUNKEL : '#ffffff' }; };
const teamsSetzen = (dd, L) => { const leer = !L.some(t => t.length);
  return { ...dd, teams: leer ? [] : L, namen: leer ? '' : L.map((t, i) => teamInfo(dd, i).nm + ': ' + t.join(', ')).join('\n') }; };
B.sp_teams = { name: 'Mannschaftseinteilung mit Spielplan', gruppe: 'Sport', def: { anzahl: 4, farben: 'Rot, Blau, Gelb, Grün, Orange, Weiß', zeilen: 6, klasse: '', namen: '', teams: [], fehlt: [] },
  felder: [{ k: 'anzahl', l: 'Anzahl Teams', typ: 'zahl', min: 2, max: 6 }, { k: 'farben', l: 'Leibchenfarben (mit Komma getrennt)', typ: 'text' }, { k: 'zeilen', l: 'Zeilen je Team', typ: 'zahl', min: 3, max: 10 },
    { k: 'klasse', l: 'Klasse für „🎲 Klasse zufällig verteilen“ (leer = Klasse der Tafel)', typ: 'text' },
    { k: 'namen', l: 'Namen je Team (eine Zeile je Team, Namen mit Komma, z. B. „Rot: Anna, Ben“)', typ: 'liste' }],
  gen: (d, P) => {
    const n = anz(d.anzahl, 2, 6, 4), L = teamListen(d), fehlt = new Set(Array.isArray(d.fehlt) ? d.fehlt : []), maxN = Math.max(0, ...L.slice(0, n).map(t => t.length));
    const z = Math.max(anz(d.zeilen, 3, 10, 6), maxN ? maxN + 1 : 0), W = 1000, team = i => teamInfo(d, i), teile = [];
    const y0 = 80, hh = 56, rh = 44, cw = (940 - (n - 1) * 16) / n, gr = cw >= 200 ? 21 : 18; let s = '';
    const kl = tafelKlasse(d); if (maxN && kl) s += text(970, 42, 'Klasse ' + kl, 22, GRAU, 'text-anchor="end" ' + fett);
    for (let i = 0; i < n; i++) { const x = 30 + i * (cw + 16), t = team(i);
      s += box(x, y0, cw, hh + z * rh, t.rand, 'none', 12, 3) + `<path d="M ${f(x)} ${y0 + hh} L ${f(x)} ${y0 + 12} Q ${f(x)} ${y0} ${f(x + 12)} ${y0} L ${f(x + cw - 12)} ${y0} Q ${f(x + cw)} ${y0} ${f(x + cw)} ${y0 + 12} L ${f(x + cw)} ${y0 + hh} Z" fill="${t.col}" stroke="${t.rand}" stroke-width="3"/>`;
      s += mitte(x + cw / 2, y0 + hh / 2, t.nm, 24, t.schrift, fett);
      for (let j = 1; j < z; j++) s += linie(x + 10, y0 + hh + j * rh, x + cw - 10, y0 + hh + j * rh, GRAU, 1, 'opacity=".6"');
      (L[i] || []).forEach((nm, j) => { const yz = y0 + hh + j * rh, weg = fehlt.has(nm), [tx, sz] = passend(nm, cw - 28, gr);
        s += text(x + 14, yz + rh / 2, tx, sz, P.ink, weg ? 'opacity=".45"' : '');
        if (weg) s += linie(x + 10, yz + rh / 2, x + 18 + Math.min(cw - 28, tx.length * sz * 0.56), yz + rh / 2, P.ink, 2.5);
        teile.push({ id: 'n' + i + '_' + j, x: x + 4, y: yz + 1, w: cw - 8, h: rh - 2 }); }); }
    let yH = y0 + hh + z * rh;
    if (maxN) { s += text(30, yH + 30, 'Namen antippen: fehlt heute (durchgestrichen) – nochmals antippen: wieder da', 18, GRAU); yH += 40; }
    const PA = paarungen(n), yP = yH + 50, proSp = Math.ceil(PA.length / 3);
    s += text(30, yP, 'Wer spielt gegen wen?', 24, P.ink, fett) + text(335, yP, '(jeder gegen jeden: ' + PA.length + (PA.length === 1 ? ' Spiel)' : ' Spiele)'), 19, GRAU);
    PA.forEach(([a, b], i) => { const x = 30 + Math.floor(i / proSp) * 313, y = yP + 50 + (i % proSp) * 48, A = team(a), Bt = team(b);
      s += text(x, y, (i + 1) + '.', 20, GRAU, fett) + kreis(x + 42, y, 8, A.col, A.rand, 2) + kreis(x + 60, y, 8, Bt.col, Bt.rand, 2) + text(x + 76, y, A.nm + ' – ' + Bt.nm, 20, P.ink);
      s += linie(x + 228, y + 12, x + 254, y + 12, GRAU, 1.5) + mitte(x + 264, y, ':', 22, P.ink, fett) + linie(x + 274, y + 12, x + 296, y + 12, GRAU, 1.5); });
    const H = yP + 50 + proSp * 48 + 10;
    return { ...tafel('👕', 'Mannschaften', W, H, s, P), teile };
  },
  tippen: (o, id) => T.bausteinAendern(o, { f: dd => { const m = /^n(\d+)_(\d+)$/.exec(id), L = teamListen(dd), nm = m && L[+m[1]] && L[+m[1]][+m[2]];
    return { d: nm ? { ...dd, fehlt: umschalten(dd.fehlt, nm) } : dd }; } }) };
B.sp_teams.schnell = [
  { l: '🎲 Klasse zufällig verteilen', f: dd => { const alle = klassenListe(tafelKlasse(dd)), fehlt = new Set(Array.isArray(dd.fehlt) ? dd.fehlt : []);
    if (!alle.length) { T.toast('Keine Klassenliste für diese Klasse – unter ☰ › Klassenlisten anlegen.', 3500); return { d: dd }; }
    return { d: teamsSetzen(dd, verteilen(mischen(alle.filter(x => !fehlt.has(x))), anz(dd.anzahl, 2, 6, 4))) }; } },
  { l: '⚖ Neu mischen', f: dd => { const n = anz(dd.anzahl, 2, 6, 4), fehlt = new Set(Array.isArray(dd.fehlt) ? dd.fehlt : []), alle = teamListen(dd).slice(0, n).flat().filter(x => !fehlt.has(x));
    if (!alle.length) { T.toast('Noch keine Namen – zuerst „🎲 Klasse zufällig verteilen“ oder Namen unter Optionen eintragen.', 3500); return { d: dd }; }
    return { d: teamsSetzen(dd, verteilen(mischen(alle), n)) }; } },
  { l: '🧹 Namen leeren', f: dd => ({ d: { ...dd, namen: '', teams: [], fehlt: [] } }) },
  { l: '＋ Team', f: dd => { const n = Math.min(6, anz(dd.anzahl, 2, 6, 4) + 1), L = teamListen(dd).slice(0, n);
    return { d: L.some(t => t.length) ? { ...teamsSetzen(dd, L), anzahl: n } : { ...dd, anzahl: n } }; } },
  { l: '− Team', f: dd => { const alt = anz(dd.anzahl, 2, 6, 4), n = Math.max(2, alt - 1), L = teamListen(dd).slice(0, alt); if (n === alt || !L.some(t => t.length)) return { d: { ...dd, anzahl: n } };
    const rest = L.slice(0, n); while (rest.length < n) rest.push([]); /* Namen des letzten Teams auf die kleinsten Teams verteilen */
    for (const nm of L.slice(n).flat()) rest.reduce((a, b) => b.length < a.length ? b : a).push(nm);
    return { d: { ...teamsSetzen(dd, rest), anzahl: n } }; } }];

// ---------- Turnierplan (K.-o., Gruppen, Liga) ----------
const MODI = ['ko', 'gruppen', 'liga'], MODUS_NAME = { ko: 'K.-o.-System (Turnierbaum)', gruppen: 'Gruppenphase + K.-o.-Runde', liga: 'Liga: jeder gegen jeden' };
const GOLD = '#f9a825', GOLD_D = '#b26a00', SIEG_F = '#e8f5e9', RAUS_F = '#eceff1', BUCH = 'ABCD', RUNDE = { 1: 'Finale', 2: 'Halbfinale', 4: 'Viertelfinale', 8: 'Achtelfinale' };
const TEAMS_STD = n => Array.from({ length: n }, (_, i) => 'Team ' + (i + 1)).join('\n');
const setzListe = P => { let a = [1]; while (a.length < P) { const m = a.length * 2 + 1; a = a.flatMap(x => [x, m - x]); } return a; }; /* 8 → 1 8 4 5 2 7 3 6: Freilose treffen die besten Setzplätze */
const zweierPotenz = x => { let p = 2; while (p < x) p *= 2; return p; };
const turnierNamen = d => String(d.teams == null ? '' : d.teams).split(/\r?\n/).map(x => x.trim()).filter(Boolean).slice(0, 16);
const turnierTeams = d => { const nm = turnierNamen(d), n = nm.length ? Math.max(2, nm.length) : anz(d.anzahl, 2, 16, 8); return Array.from({ length: n }, (_, i) => nm[i] || ''); };
const turnierModus = d => MODI.includes(d.modus) ? d.modus : 'ko';
const gruppenZahl = (d, n) => Math.max(1, Math.min(anz(d.gruppen, 2, 4, 2), Math.floor(n / 2)));
const koGroesse = d => { const n = turnierTeams(d).length, m = turnierModus(d); return m === 'liga' ? 0 : zweierPotenz(m === 'gruppen' ? 2 * gruppenZahl(d, n) : n); };
const bergerRunden = n => { const t = [...Array(n).keys()]; if (n % 2) t.push(-1); const k = t.length, out = []; /* Rundenverfahren: Team 0 fest, die anderen rotieren */
  for (let r = 0; r < k - 1; r++) { const sp = []; let frei = -1;
    for (let i = 0; i < k / 2; i++) { const a = t[i], b = t[k - 1 - i]; if (a < 0 || b < 0) frei = a < 0 ? b : a; else sp.push(r % 2 && i === 0 ? [b, a] : [a, b]); }
    out.push({ sp, frei }); t.splice(1, 0, t.pop()); }
  return out; };
const spiel = (a, b, k, sieger) => { const echt = !!(a && b && !a.frei && !b.frei);
  const w = !a || !b ? null : a.frei && b.frei ? { frei: true } : a.frei ? b : b.frei ? a : sieger[k] === 0 ? a : sieger[k] === 1 ? b : null;
  return { a, b, k, w, echt, auto: !!(a && b && !echt) }; };
function koBaum(slots, sieger) { const runden = []; let tn = slots.map(x => x || { frei: true });
  while (tn.length > 1) { const sp = []; for (let m = 0; m < tn.length / 2; m++) sp.push(spiel(tn[2 * m], tn[2 * m + 1], runden.length + '_' + m, sieger)); runden.push(sp); tn = sp.map(x => x.w); }
  return runden; }
const pokal = (cx, ty) => { const p = (...z) => z.map(f).join(' ');
  return `<path d="M ${p(cx - 38, ty + 10)} C ${p(cx - 70, ty + 8, cx - 68, ty + 54, cx - 20, ty + 56)}" fill="none" stroke="${GOLD_D}" stroke-width="7" stroke-linecap="round"/>`
    + `<path d="M ${p(cx + 38, ty + 10)} C ${p(cx + 70, ty + 8, cx + 68, ty + 54, cx + 20, ty + 56)}" fill="none" stroke="${GOLD_D}" stroke-width="7" stroke-linecap="round"/>`
    + `<path d="M ${p(cx - 44, ty)} L ${p(cx + 44, ty)} C ${p(cx + 44, ty + 46, cx + 24, ty + 66, cx, ty + 68)} C ${p(cx - 24, ty + 66, cx - 44, ty + 46, cx - 44, ty)} Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="3"/>`
    + box(cx - 7, ty + 66, 14, 16, GOLD_D, GOLD, 2, 2) + box(cx - 26, ty + 82, 52, 10, GOLD_D, GOLD, 3, 2) + box(cx - 36, ty + 92, 72, 12, GOLD_D, GOLD_D, 3, 2)
    + mitte(cx, ty + 28, '1', 30, DUNKEL, fett); };
const KO = { FW: 260, FH: 46, SB: 52, AB: 64, SW: 240 }; /* Feldbreite, Feldhöhe, Ergebnisfeld, Abstand der Runden, Siegerfeld */
function koZeichnen(slots, sieger, platz3, x0, top, P) {
  const { FW, FH, SB, AB, SW } = KO, R = Math.round(Math.log2(slots.length)), U = 2 * FH + 46, runden = koBaum(slots, sieger), teile = [];
  const cx = r => x0 + r * (FW + AB), yc = (r, m) => top + (m + 0.5) * U * (1 << r);
  const verl = sp => sp.w && sp.a && sp.b ? (sp.w === sp.a ? sp.b : sp.a) : null;
  const p3 = platz3 && R >= 2 ? spiel(verl(runden[R - 2][0]), verl(runden[R - 2][1]), R + '_0', sieger) : null;
  const num = {}; let nr = 0, s = '';
  for (let r = 0; r < R - 1; r++) runden[r].forEach(sp => { if (!sp.auto) num[sp.k] = ++nr; });
  if (p3 && !p3.auto) num[p3.k] = ++nr;
  num[runden[R - 1][0].k] = ++nr;
  const teamFeld = (x, y, p, zu) => {
    const fill = zu === 'sieg' ? SIEG_F : zu === 'raus' ? RAUS_F : p && p.frei ? '#f1f5f9' : '#ffffff';
    let t = box(x, y, FW, FH, zu === 'sieg' ? GRUEN : RAND, fill, 8, zu === 'sieg' ? 3 : 2);
    if (p && p.frei) return t + text(x + 16, y + FH / 2, 'Freilos', 18, DUNKEL, 'font-style="italic" opacity=".55"');
    t += box(x + FW - SB, y + 6, SB - 6, FH - 12, GRAU, '#ffffff', 6, 1.5);
    if (!p) return t;
    t += `<rect x="${f(x + 8)}" y="${f(y + 8)}" width="44" height="${FH - 16}" rx="${(FH - 16) / 2}" fill="${zu === 'raus' ? '#90a4ae' : zu === 'sieg' ? GRUEN : BLAU}"/>` + mitte(x + 30, y + FH / 2, p.nr, 18, '#ffffff', fett);
    if (p.nm) { const [tx, sz] = passend(p.nm, FW - SB - 70, 20); t += text(x + 62, y + FH / 2, tx, sz, DUNKEL, zu === 'sieg' ? fett : zu === 'raus' ? 'opacity=".5"' : ''); }
    return t; };
  const zeigeSpiel = (sp, x, ym, titel) => {
    if (titel) s += text(x + 4, ym - FH - 16, titel, 18, GRAU, fett);
    [sp.a, sp.b].forEach((p, i) => { const y = ym - FH + i * FH, zu = sp.echt && sp.w ? (sp.w === p ? 'sieg' : 'raus') : 'offen';
      s += teamFeld(x, y, p, zu);
      if (sp.echt) teile.push({ id: 's' + sp.k + '_' + i, x, y, w: p.nm ? FW - SB : 62, h: FH }); }); };
  for (let r = 0; r < R; r++) { const mc = runden[r].length; s += mitte(cx(r) + FW / 2, top - 22, r === 0 && runden[0].some(sp => sp.auto) ? '1. Runde' : RUNDE[mc] || (r + 1) + '. Runde', 22, P.ink, fett);
    if (r < R - 1) runden[r].forEach((sp, m) => { const x1 = cx(r) + FW, xm = x1 + AB / 2, y1 = yc(r, m), y2 = yc(r + 1, m >> 1) + (m % 2 ? FH / 2 : -FH / 2), ok = sp.echt && sp.w;
      s += `<path d="M ${f(x1)} ${f(y1)} H ${f(xm)} V ${f(y2)} H ${f(cx(r + 1))}" fill="none" stroke="${ok ? GRUEN : GRAU}" stroke-width="${ok ? 4 : 2.5}" stroke-linejoin="round"/>`; }); }
  for (let r = 0; r < R; r++) runden[r].forEach((sp, m) => zeigeSpiel(sp, cx(r), yc(r, m), num[sp.k] ? 'Spiel ' + num[sp.k] : ''));
  const fin = runden[R - 1][0], yF = yc(R - 1, 0), xS = cx(R), wFin = fin.w && !fin.w.frei ? fin.w : null;
  s += linie(cx(R - 1) + FW, yF, xS, yF, wFin ? GRUEN : GRAU, wFin ? 4 : 2.5) + mitte(xS + SW / 2, top - 22, 'Sieger', 22, P.ink, fett);
  s += box(xS, yF - FH / 2 - 4, SW, FH + 8, GOLD_D, '#fff8e1', 10, 3);
  if (wFin) { const [tx, sz] = passend(wFin.nm || (/^\d+$/.test(wFin.nr) ? 'Nr. ' + wFin.nr : wFin.nr), SW - 24, 22); s += mitte(xS + SW / 2, yF, tx, sz, DUNKEL, fett); }
  s += pokal(xS + SW / 2, yF + FH / 2 + 22);
  let unten = Math.max(top + U * slots.length / 2, yF + FH / 2 + 22 + 104 + 10);
  if (p3) { const y3 = yF + 2 * FH + 56; zeigeSpiel(p3, cx(R - 1), y3, (num[p3.k] ? 'Spiel ' + num[p3.k] + ' · ' : '') + 'um Platz 3'); unten = Math.max(unten, y3 + FH + 10); }
  return { s, teile, w: R * (FW + AB) + SW, h: unten - top, spiele: nr }; }
function tabelleZ(x, y, w, zeilen) { /* Ergebnistabelle mit leeren Feldern zum Eintragen */
  const breit = w >= 700, cu = breit ? 70 : 42, nrW = breit ? 64 : 50, SP = [['Sp', 1], ['S', 1], ['U', 1], ['N', 1], ['Tore', 1.7], ['Pkt', 1.25]];
  const rest = SP.reduce((a, c) => a + c[1] * cu, 0), nmW = w - nrW - rest, kh = 40, zh = 44, h = kh + zeilen.length * zh;
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${h}" fill="#ffffff"/><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${kh}" fill="#e3f2fd"/>`;
  s += mitte(x + nrW / 2, y + kh / 2, 'Nr.', 18, DUNKEL, fett) + text(x + nrW + 10, y + kh / 2, 'Team', 18, DUNKEL, fett);
  let xx = x + nrW + nmW; const vl = [x + nrW, xx];
  SP.forEach(([t, k]) => { s += mitte(xx + k * cu / 2, y + kh / 2, t, 18, DUNKEL, fett); xx += k * cu; vl.push(xx); });
  const xt = x + nrW + nmW + 4 * cu + 1.7 * cu / 2;
  zeilen.forEach((z, i) => { const yy = y + kh + i * zh, ym = yy + zh / 2; s += linie(x, yy, x + w, yy, GRAU, 1.2);
    s += mitte(x + nrW / 2, ym, z.nr, 18, DUNKEL, fett) + mitte(xt, ym, ':', 20, DUNKEL, 'opacity=".45"');
    if (z.nm) { const [tx, sz] = passend(z.nm, nmW - 18, 20); s += text(x + nrW + 10, ym, tx, sz, DUNKEL); } });
  vl.slice(0, -1).forEach(v => { s += linie(v, y, v, y + h, GRAU, 1.2); });
  s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${h}" fill="none" stroke="${RAND}" stroke-width="2.5"/>`;
  return { s, h }; }
const SPZ = 40; /* Zeilenhöhe im Spielplan */
const spielKopf = (x, y, w) => text(x + 36, y, 'Nr.', 18, GRAU, 'text-anchor="end" ' + fett) + text(x + 46, y, 'Feld', 18, GRAU, fett) + text(x + 122, y, 'Spiel', 18, GRAU, fett) + mitte(x + w - 46, y, 'Ergebnis', 18, GRAU, fett);
const spielZeile = (x, y, w, g, P) => { const ym = y + SPZ / 2, pw = w - 214, ganz = passend(g.a + ' – ' + g.b, pw, 20), [ta, sa] = passend(g.a, (pw - 34) / 2, 20), [tb, sb] = passend(g.b, (pw - 34) / 2, 20);
  const [tx, sz] = ganz[0].endsWith('…') ? [ta + ' – ' + tb, Math.min(sa, sb)] : ganz;
  return text(x + 36, ym, g.nr + '.', 18, P.ink, 'text-anchor="end" ' + fett) + text(x + 46, ym, 'Feld ' + g.feld, 18, GRAU) + text(x + 122, ym, tx, sz, P.ink)
    + box(x + w - 84, y + 4, 76, SPZ - 8, GRAU, '#ffffff', 6, 1.5) + mitte(x + w - 46, ym, ':', 20, DUNKEL, fett); };
const LEGENDE = 'Sp = Spiele · S = Siege · U = Unentschieden · N = Niederlagen · Punkte: Sieg 3, Unentschieden 1, Niederlage 0';
B.sp_turnier = { name: 'Turnierplan (K.-o., Gruppen, Liga)', gruppe: 'Sport', def: { modus: 'ko', teams: TEAMS_STD(8), anzahl: 8, gruppen: 2, platz3: true, sieger: {} },
  felder: [{ k: 'modus', l: 'Turnierform', typ: 'auswahl', opts: MODI.map(m => [m, MODUS_NAME[m]]) },
    { k: 'teams', l: 'Teams (je Zeile eins; leer = Felder zum Hineinschreiben)', typ: 'liste' },
    { k: 'anzahl', l: 'Anzahl Teams (wenn keine Namen eingetragen sind)', typ: 'zahl', min: 2, max: 16 },
    { k: 'gruppen', l: 'Anzahl Gruppen (bei Gruppenphase)', typ: 'zahl', min: 2, max: 4 },
    { k: 'platz3', l: 'Spiel um Platz 3 (K.-o.-Runde)', typ: 'check' }],
  gen: (d, P) => {
    const modus = turnierModus(d), tn = turnierTeams(d), n = tn.length, sieger = d.sieger && typeof d.sieger === 'object' ? d.sieger : {}, platz3 = d.platz3 !== false;
    const HINWEIS = 'Team antippen: Sieger (rückt weiter) – nochmals antippen: zurücknehmen';
    if (modus === 'ko') {
      const PP = zweierPotenz(n), slots = setzListe(PP).map(sd => sd <= n ? { nr: String(sd), nm: tn[sd - 1] } : null), top = 160, K = koZeichnen(slots, sieger, platz3, 30, top, P), W = Math.max(1000, K.w + 60);
      let s = text(30, 92, n + ' Teams · ' + K.spiele + ' Spiele' + (PP > n ? ' · ' + (PP - n) + (PP - n === 1 ? ' Freilos' : ' Freilose') : ''), 20, GRAU) + K.s;
      const H = Math.round(top + K.h + 56); s += text(30, H - 28, HINWEIS, 18, GRAU);
      return { ...tafel('🏆', 'Turnierplan – K.-o.-System', W, H, s, P), teile: K.teile };
    }
    if (modus === 'liga') {
      const W = 1000, namenMod = n <= 8 && tn.some(Boolean), lab = i => namenMod && tn[i] ? tn[i] : String(i + 1), BR = bergerRunden(n);
      let s = text(30, 92, n + ' Teams · jeder gegen jeden · ' + (n * (n - 1) / 2) + ' Spiele in ' + BR.length + ' Runden', 20, GRAU);
      const T1 = tabelleZ(30, 116, 940, tn.map((nm, i) => ({ nr: String(i + 1), nm }))); s += T1.s;
      let y = 116 + T1.h + 28; s += text(30, y, LEGENDE, 18, GRAU); y += 56;
      s += text(30, y, 'Spielplan', 24, P.ink, fett) + (namenMod ? '' : text(170, y, '(Zahlen = Nr. in der Tabelle)', 18, GRAU)); y += 40;
      const C = namenMod ? 2 : 3, cw = (940 - (C - 1) * 20) / C; let nr = 0;
      const bl = BR.map((r, ri) => ({ kopf: 'Runde ' + (ri + 1) + (r.frei >= 0 ? ' · spielfrei: ' + lab(r.frei) : ''), sp: r.sp.map(([a, b], j) => ({ nr: ++nr, feld: j + 1, a: lab(a), b: lab(b) })) }));
      const bh = b => 34 + b.sp.length * SPZ, ziel = bl.reduce((a, b) => a + bh(b), 0) / C, spalten = [[]]; let akt = 0;
      bl.forEach(b => { if (akt > 0 && akt + bh(b) / 2 > ziel && spalten.length < C) { spalten.push([]); akt = 0; } spalten[spalten.length - 1].push(b); akt += bh(b); });
      let yMax = y;
      spalten.forEach((sp, c) => { const x = 30 + c * (cw + 20); let yy = y + 16; s += spielKopf(x, y, cw);
        sp.forEach(b => { s += text(x, yy + 20, passend(b.kopf, cw, 18)[0], 18, P.ink, fett); yy += 34; b.sp.forEach(g => { s += spielZeile(x, yy, cw, g, P); yy += SPZ; }); });
        yMax = Math.max(yMax, yy); });
      const H = Math.round(yMax + 30);
      return { ...tafel('🏆', 'Turnierplan – Liga (jeder gegen jeden)', W, H, s, P), teile: [] };
    }
    const g = gruppenZahl(d, n), GR = Array.from({ length: g }, (_, k) => tn.map((nm, i) => ({ nm, i })).filter(x => x.i % g === k).map((x, j) => ({ nr: BUCH[k] + (j + 1), nm: x.nm })));
    const PP = zweierPotenz(2 * g), zweite = g === 3 ? [0, 2, 1] : [...Array(g).keys()]; /* Zweite so setzen, dass in der 1. K.-o.-Runde keine Gruppe gegen sich selbst spielt */
    const seeds = [...Array(g).keys()].map(k => ({ nr: '1. ' + BUCH[k] })).concat(zweite.map(k => ({ nr: '2. ' + BUCH[k] })));
    const slots = setzListe(PP).map(sd => sd <= 2 * g ? seeds[sd - 1] : null);
    const Kw = Math.round(Math.log2(PP)) * (KO.FW + KO.AB) + KO.SW, W = Math.max(1000, Kw + 60), C = g === 1 ? 1 : 2, bw = (W - 60 - (C - 1) * 30) / C;
    const GB = GR.map(gr => bergerRunden(gr.length)), maxR = Math.max(...GB.map(b => b.length)), spiele = GR.map(() => []); let nr = 0;
    for (let r = 0; r < maxR; r++) { let feld = 0; GB.forEach((b, k) => (b[r] ? b[r].sp : []).forEach(([a, c]) => { const L = x => GR[k][x].nm || GR[k][x].nr; spiele[k].push({ nr: ++nr, feld: ++feld, a: L(a), b: L(c) }); })); }
    let s = text(30, 92, n + ' Teams · ' + g + (g === 1 ? ' Gruppe' : ' Gruppen') + ' · ' + nr + ' Gruppenspiele · danach K.-o.-Runde', 20, GRAU), y = 120;
    for (let k0 = 0; k0 < g; k0 += C) { let hz = 0;
      for (let k = k0; k < Math.min(g, k0 + C); k++) { const x = 30 + (k - k0) * (bw + 30); let yy = y;
        s += text(x, yy + 14, 'Gruppe ' + BUCH[k], 24, P.ink, fett); yy += 40;
        const TB = tabelleZ(x, yy, bw, GR[k]); s += TB.s; yy += TB.h + 30;
        s += spielKopf(x, yy, bw); yy += 16; spiele[k].forEach(gm => { s += spielZeile(x, yy, bw, gm, P); yy += SPZ; });
        hz = Math.max(hz, yy - y); }
      y += hz + 30; }
    s += text(30, y, LEGENDE, 18, GRAU); y += 56;
    s += text(30, y, 'K.-o.-Runde', 24, P.ink, fett) + text(200, y, '1. A = Gruppenerster A · 2. A = Gruppenzweiter A', 18, GRAU); y += 30;
    const top = y + 60, K = koZeichnen(slots, sieger, platz3, 30, top, P); s += K.s;
    const H = Math.round(top + K.h + 56); s += text(30, H - 28, HINWEIS, 18, GRAU);
    return { ...tafel('🏆', 'Turnierplan – Gruppen und K.-o.-Runde', W, H, s, P), teile: K.teile };
  },
  tippen: (o, id) => T.bausteinAendern(o, { f: dd => { const m = /^s(\d+)_(\d+)_([01])$/.exec(id), R = Math.round(Math.log2(koGroesse(dd) || 1)); if (!m || !R) return { d: dd };
    const r = +m[1], sp = +m[2], seite = +m[3], k = r + '_' + sp, si = { ...(dd.sieger && typeof dd.sieger === 'object' ? dd.sieger : {}) };
    const weg = (rr, mm) => { if (rr >= R) return; delete si[rr + '_' + mm]; if (rr === R - 2) delete si[R + '_0']; weg(rr + 1, mm >> 1); }; /* abhängige spätere Ergebnisse löschen */
    if (r < R) { weg(r + 1, sp >> 1); if (r === R - 2) delete si[R + '_0']; }
    if (si[k] === seite) delete si[k]; else si[k] = seite;
    return { d: { ...dd, sieger: si } }; } }) };
const turnierNeu = (dd, nm) => ({ ...dd, teams: nm.join('\n'), sieger: {} });
B.sp_turnier.schnell = [
  { l: '🎲 Auslosen', f: dd => { const nm = turnierNamen(dd); if (nm.length < 2) { T.toast('Zum Auslosen zuerst Teamnamen eintragen (Optionen).', 3000); return { d: { ...dd, sieger: {} } }; } return { d: turnierNeu(dd, mischen(nm)) }; } },
  { l: '↺ Ergebnisse löschen', f: dd => ({ d: { ...dd, sieger: {} } }) },
  { l: '＋ Team', f: dd => { const nm = turnierNamen(dd); if (!nm.length) return { d: { ...dd, anzahl: Math.min(16, anz(dd.anzahl, 2, 16, 8) + 1), sieger: {} } };
    let i = nm.length + 1; while (nm.includes('Team ' + i)) i++; return { d: turnierNeu(dd, nm.length < 16 ? [...nm, 'Team ' + i] : nm) }; } },
  { l: '− Team', f: dd => { const nm = turnierNamen(dd); if (!nm.length) return { d: { ...dd, anzahl: Math.max(2, anz(dd.anzahl, 2, 16, 8) - 1), sieger: {} } };
    return { d: turnierNeu(dd, nm.length > 2 ? nm.slice(0, -1) : nm) }; } },
  { l: '🏆 Modus wechseln', f: dd => { const m = MODI[(MODI.indexOf(turnierModus(dd)) + 1) % MODI.length]; T.toast('Turnierform: ' + MODUS_NAME[m], 2000); return { d: { ...dd, modus: m, sieger: {} } }; } }];
variante('sp_turnier:ko', 'Turnierplan: K.-o.-System (Turnierbaum)', { modus: 'ko', teams: TEAMS_STD(8), anzahl: 8, gruppen: 2, platz3: true, sieger: {} });
variante('sp_turnier:gruppen', 'Turnierplan: Gruppenphase + K.-o.-Runde', { modus: 'gruppen', teams: TEAMS_STD(8), anzahl: 8, gruppen: 2, platz3: true, sieger: {} });
variante('sp_turnier:liga', 'Turnierplan: Liga – jeder gegen jeden', { modus: 'liga', teams: TEAMS_STD(6), anzahl: 6, gruppen: 2, platz3: false, sieger: {} });

/* =====================================================================  KUNST (Fortsetzung)  ===================================================================== */

// ---------- Drittelregel (Bildaufbau in der Fotografie) ----------
function drittelRaster(x, y, w, h, hell, gold) { /* hell = weiße Linien mit dunklem Rand (über Foto/Bild) */
  let s = ''; const lin = (x1, y1, x2, y2) => hell ? linie(x1, y1, x2, y2, DUNKEL, 7, 'opacity=".5"') + linie(x1, y1, x2, y2, '#ffffff', 3.5) : linie(x1, y1, x2, y2, BLAU, 3.5);
  if (gold) for (const k of [0.382, 0.618]) { const g = 'stroke-dasharray="14 10"';
    for (const [x1, y1, x2, y2] of [[x + k * w, y, x + k * w, y + h], [x, y + k * h, x + w, y + k * h]]) s += (hell ? linie(x1, y1, x2, y2, DUNKEL, 6, g + ' opacity=".5"') : '') + linie(x1, y1, x2, y2, GOLD, 3.5, g); }
  for (const k of [1, 2]) s += lin(x + k * w / 3, y, x + k * w / 3, y + h) + lin(x, y + k * h / 3, x + w, y + k * h / 3);
  for (const a of [1, 2]) for (const b of [1, 2]) { const px = x + a * w / 3, py = y + b * h / 3; s += kreis(px, py, 14, 'none', '#ffffff', 9) + kreis(px, py, 14, 'none', ROT, 4.5) + kreis(px, py, 4.5, ROT); }
  return s; }
function drittelLandschaft(x, y, w, h) { /* Horizont im unteren Drittel, Baum auf der rechten Linie, Sonne auf dem Kraftpunkt oben links */
  const hz = y + 2 * h / 3, bx = x + 2 * w / 3, sx = x + w / 3, sy = y + h / 3;
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="#bbdefb"/><rect x="${f(x)}" y="${f(hz)}" width="${f(w)}" height="${f(h / 3)}" fill="#81c784"/>`;
  for (const k of [0.3, 0.6]) s += linie(x + 10, hz + k * h / 3, x + w - 10, hz + k * h / 3, '#66bb6a', 3);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; s += linie(sx + 44 * Math.cos(a), sy + 44 * Math.sin(a), sx + 60 * Math.cos(a), sy + 60 * Math.sin(a), '#f9a825', 4); }
  s += kreis(sx, sy, 34, '#fdd835', '#f9a825', 3);
  s += `<rect x="${f(bx - 11)}" y="${f(y + h * 0.42)}" width="22" height="${f(hz + h * 0.12 - y - h * 0.42)}" fill="#6d4c41"/>`;
  s += kreis(bx - 38, y + h * 0.44, 38, '#43a047', '#2e7d32', 3) + kreis(bx + 38, y + h * 0.44, 38, '#43a047', '#2e7d32', 3) + kreis(bx, y + h * 0.36, 54, '#43a047', '#2e7d32', 3);
  return s; }
const DRITTEL_REGELN = [['Motiv', 'Nicht in die Mitte setzen, sondern auf eine Linie oder einen Kraftpunkt.', ROT],
  ['Horizont', 'Auf eine waagerechte Linie legen (oberes oder unteres Drittel) – nicht in die Mitte.', BLAU],
  ['Blickrichtung', 'In Blick- oder Bewegungsrichtung mehr Platz lassen.', GRUEN],
  ['Ausnahme', 'Bei Symmetrie das Motiv bewusst mittig setzen.', LILA]];
B.ku_drittel = { name: 'Drittelregel (Bildaufbau in der Fotografie)', gruppe: 'Kunst', def: { gold: false, beispiel: false, folie: false },
  felder: [{ k: 'beispiel', l: 'Schematisches Beispiel (Landschaft) zeigen', typ: 'check' }, { k: 'gold', l: 'Goldenen Schnitt zusätzlich zeigen', typ: 'check' },
    { k: 'folie', l: 'Nur Raster als durchsichtige Folie (3 : 2) – über ein Foto legen', typ: 'check' }],
  gen: (d, P) => {
    if (d.folie) { const W = 900, H = 600;
      const s = `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="none" stroke="${DUNKEL}" stroke-width="6" opacity=".5"/><rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="none" stroke="#ffffff" stroke-width="3"/>`
        + drittelRaster(0, 0, W, H, true, !!d.gold) + text(18, 28, 'Drittelregel', 18, '#ffffff', fett + ` stroke="${DUNKEL}" stroke-width="4" paint-order="stroke"`);
      return { svg: T._svg.doc(W, H, s), w: W, h: H }; }
    const W = 1000, bx = 30, by = 84, bw = 570, bh = 380;
    let s = d.beispiel ? drittelLandschaft(bx, by, bw, bh) : mitte(bx + bw / 2, by + bh / 2, 'Foto hier einfügen', 20, GRAU);
    s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="${P.ink}" stroke-width="2.5" ${d.beispiel ? '' : 'stroke-dasharray="12 8"'}/>` + drittelRaster(bx, by, bw, bh, !!d.beispiel, !!d.gold);
    let y = by + bh + 34;
    s += kreis(bx + 14, y, 12, 'none', ROT, 4) + kreis(bx + 14, y, 4, ROT) + text(bx + 40, y, 'Kraftpunkt = Schnittpunkt zweier Drittellinien', 19, P.ink);
    if (d.gold) { y += 34; s += linie(bx, y, bx + 28, y, GOLD, 3.5, 'stroke-dasharray="10 6"') + text(bx + 40, y, 'Goldener Schnitt (Linien bei ≈ 0,382 und 0,618)', 19, P.ink);
      y += 32; s += text(bx, y, 'Drittelregel = vereinfachter Goldener Schnitt (≈ 1 : 1,618)', 19, P.ink, fett); }
    if (d.beispiel) { y += 34; const t = 'Beispiel: Horizont im unteren Drittel, Baum auf der rechten Linie, Sonne auf einem Kraftpunkt'; s += zeilenText(bx, y, t, 56, 19, P.ink, 25); y += (umbruch(t, 56).length - 1) * 25; }
    let yr = 100; s += text(630, yr, 'Merksätze', 24, P.ink, fett); yr += 44;
    DRITTEL_REGELN.forEach(([t, u, col], i) => { s += kreis(645, yr, 15, col) + mitte(645, yr + 1, String(i + 1), 18, '#ffffff', fett) + text(672, yr, t, 21, P.ink, fett);
      s += zeilenText(672, yr + 30, u, 28, 19, P.ink, 25); yr += 30 + umbruch(u, 28).length * 25 + 24; });
    const H = Math.round(Math.max(y, yr - 24) + 36);
    return tafel('📷', 'Drittelregel – Bildaufbau in der Fotografie', W, H, s, P);
  } };
B.ku_drittel.schnell = [{ l: '🏞 Beispiel ein/aus', f: dd => ({ d: { ...dd, beispiel: !dd.beispiel } }) }, { l: '✨ Goldener Schnitt ein/aus', f: dd => ({ d: { ...dd, gold: !dd.gold } }) },
  { l: '🖼 Folie (nur Raster) ein/aus', f: dd => ({ d: { ...dd, folie: !dd.folie } }) }];
variante('ku_drittel:raster', 'Drittelregel: Bildfeld mit Raster und Merksätzen', { gold: false, beispiel: false, folie: false });
variante('ku_drittel:beispiel', 'Drittelregel: mit Beispiel (Landschaft)', { gold: false, beispiel: true, folie: false });
variante('ku_drittel:gold', 'Drittelregel und Goldener Schnitt', { gold: true, beispiel: false, folie: false });
variante('ku_drittel:folie', 'Drittelregel: Raster als Folie (über ein Foto legen)', { gold: false, beispiel: false, folie: true });
})();
