// Tafel-App – 📝 Deutsch / 🔤 Englisch: Tafelbilder für den Sprachunterricht
// Deutsch: Erzählkurve · Argumentationstreppe · Personenkonstellation · Zeitformen · Wortfeld-Stern
// Englisch: Tenses timeline · Signal words · Question words · Word order · Telling the time · Days, months, dates
// Alles selbst gezeichnet (SVG). Jeder sinntragende Text ist ein eigenes <text>, die Überschrift kommt zuerst.
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', ROT = '#c62828', LILA = '#6a1b9a', TUERKIS = '#00838f', GRAU = '#64748b', RAND = '#3a6d99', DUNKEL = '#1b1f2a';
const HELL = { [BLAU]: '#e3f2fd', [GRUEN]: '#e8f5e9', [ORANGE]: '#fff3e0', [ROT]: '#ffebee', [LILA]: '#f3e5f5', [TUERKIS]: '#e0f7fa' };
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const fett = 'font-weight="700"', kursiv = 'font-style="italic"';
const box = (x, y, w, h, rand, fuell, r = 14, sw = 2.5) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const linie = (x1, y1, x2, y2, col, w = 2, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const kreis = (cx, cy, r, fuell, rand = 'none', sw = 0) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const pfeil = (x1, y1, x2, y2, col, w = 4) => { const a = Math.atan2(y2 - y1, x2 - x1), k = 16, ax = x2 - k * Math.cos(a), ay = y2 - k * Math.sin(a);
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(ax)}" y2="${f(ay)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${f(x2)} ${f(y2)} L ${f(ax + 9 * Math.sin(a))} ${f(ay - 9 * Math.cos(a))} L ${f(ax - 9 * Math.sin(a))} ${f(ay + 9 * Math.cos(a))} Z" fill="${col}"/>`; };
const umbruch = (z, max) => { const out = []; let cur = ''; for (const w of String(z).split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const zeilenText = (x, y, t, max, size, col, abst, extra = '', mittig = false) => umbruch(t, max).map((z, i) => (mittig ? mitte : text)(x, y + i * abst, z, size, col, extra)).join('');
function tafel(titel, W, H, inhalt, P, icon = '📝') {
  return { svg: T._svg.doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 42, icon + ' ' + titel, 32, P.ink, fett) + inhalt), w: W, h: H };
}
const EN = '🔤';
const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};
const liste = s => String(s || '').split(',').map(w => w.trim()).filter(Boolean);
const bez = (p, t) => { const u = 1 - t, k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]; return [0, 1].map(j => k.reduce((a, c, i) => a + c * p[i][j], 0)); };

// ======================= DEUTSCH =======================

// ---------- Erzählkurve / Spannungsbogen ----------
B.de_erzaehlkurve = { name: 'Erzählkurve (Spannungsbogen)', gruppe: 'Sprache', def: { namen: true, fragen: true },
  felder: [{ k: 'namen', l: 'Namen der Abschnitte zeigen', typ: 'check' }, { k: 'fragen', l: 'Leitfragen zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 720; let s = '';
    const K1 = [[250, 430], [380, 420], [520, 300], [617, 130]], K2 = [[617, 130], [680, 280], [760, 400], [960, 420]];
    s += pfeil(28, 475, 28, 95, GRAU, 3) + text(12, 285, 'Spannung', 18, GRAU, 'text-anchor="middle" ' + fett + ' transform="rotate(-90 12 285)"');
    s += `<path d="M 40 440 L 250 430 C 380 420 520 300 617 130 C 680 280 760 400 960 420" fill="none" stroke="${ROT}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    const ST = [
      ['Einleitung', BLAU, [145, 435], ['Wer? Wo? Wann?', 'Wie ist die Lage am Anfang?']],
      ['Hauptteil', ORANGE, bez(K1, 0.5), ['Was passiert nach und nach?', 'Welches Problem entsteht?']],
      ['Höhepunkt', ROT, [617, 130], ['Was ist der spannendste Moment?', 'Was entscheidet sich jetzt?']],
      ['Schluss', GRUEN, bez(K2, 0.75), ['Wie geht es aus?', 'Wie fühlen sich die Figuren?']]];
    if (d.namen) s += text(250, 320, 'Spannung steigt', 18, ORANGE, kursiv + ' ' + fett) + text(800, 250, 'Spannung fällt', 18, GRUEN, kursiv + ' ' + fett);
    ST.forEach(([name, col, pt, fragen], i) => {
      const x = 25 + i * 240, w = 225, y = 495, bx = x + w / 2;
      s += linie(pt[0], pt[1], bx, y, col, 2, 'stroke-dasharray="6 6"');
      s += kreis(pt[0], pt[1], i === 2 ? 14 : 11, col, '#ffffff', 3);
      s += box(x, y, w, 205, col, HELL[col], 14, 3);
      if (d.namen) s += mitte(bx, y + 32, name, 24, col, fett);
      if (d.fragen) { let yy = y + 77; fragen.forEach(q => { s += zeilenText(bx, yy, q, 19, 19, DUNKEL, 26, '', true); yy += umbruch(q, 19).length * 26 + 8; }); }
    });
    return tafel('Erzählkurve – der Spannungsbogen', W, H, s, P);
  } };
B.de_erzaehlkurve.schnell = [{ l: '🏷 Namen ein/aus', f: dd => ({ d: { ...dd, namen: !dd.namen } }) }, { l: '❓ Leitfragen ein/aus', f: dd => ({ d: { ...dd, fragen: !dd.fragen } }) }];
KV['de_erzaehlkurve:leer'] = { name: 'Erzählkurve (leer)', d: { namen: false, fragen: false } };

// ---------- Argumentationstreppe ----------
B.de_argument = { name: 'Argumentationstreppe', gruppe: 'Sprache', def: { fragen: true, saetze: true },
  felder: [{ k: 'fragen', l: 'Leitfragen zeigen', typ: 'check' }, { k: 'saetze', l: 'Satzanfänge zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 700; let s = '';
    const ST = [['Behauptung', 'Was ist meine These?', ['Ich bin der Meinung, dass …', 'Ich finde, dass …'], BLAU],
      ['Begründung', 'Warum ist das so?', ['…, weil …', 'Ein Grund dafür ist, …'], GRUEN],
      ['Beispiel / Beleg', 'Woran sieht man das?', ['Zum Beispiel …', 'Das zeigt sich daran, dass …'], ORANGE],
      ['Folgerung', 'Was folgt daraus?', ['Deshalb …', 'Daraus folgt, dass …'], LILA]];
    s += text(30, 105, 'Ein Argument steigt Stufe für Stufe:', 20, P.ink, fett) + text(30, 137, 'These → Begründung → Beispiel → Folgerung', 18, GRAU);
    s += pfeil(60, 405, 690, 125, GRAU, 4);
    ST.forEach(([name, frage, saetze, col], i) => {
      const x = 30 + i * 240, w = 225, top = 440 - i * 100, bx = x + w / 2;
      s += box(x, top, w, 670 - top, col, HELL[col], 12, 3);
      s += kreis(x + 22, top, 17, col, '#ffffff', 2.5) + mitte(x + 22, top + 1, String(i + 1), 19, '#ffffff', fett);
      s += mitte(bx, top + 34, name, 22, col, fett);
      if (d.fragen) s += zeilenText(bx, top + 70, frage, 20, 19, DUNKEL, 25, kursiv, true);
      if (d.saetze) { let yy = top + 112; saetze.forEach(z => { s += zeilenText(bx, yy, z, 19, 19, col, 26, '', true); yy += umbruch(z, 19).length * 26 + 8; }); }
    });
    return tafel('Argumentationstreppe', W, H, s, P);
  } };
B.de_argument.schnell = [{ l: '❓ Leitfragen ein/aus', f: dd => ({ d: { ...dd, fragen: !dd.fragen } }) }, { l: '✍ Satzanfänge ein/aus', f: dd => ({ d: { ...dd, saetze: !dd.saetze } }) }];
KV['de_argument:leer'] = { name: 'Argumentationstreppe (ohne Hilfen)', d: { fragen: false, saetze: false } };

// ---------- Personenkonstellation ----------
B.de_figuren = { name: 'Personenkonstellation (Figuren)', gruppe: 'Sprache', def: { haupt: 'Hauptfigur', anzahl: 6, figuren: '' },
  felder: [{ k: 'haupt', l: 'Hauptfigur', typ: 'text' }, { k: 'anzahl', l: 'Anzahl Figuren ringsum', typ: 'zahl', min: 3, max: 8 },
    { k: 'figuren', l: 'Namen der Figuren (mit Komma getrennt, leer = freie Kästen)', typ: 'text' }],
  gen: (d, P) => {
    const W = 1000, H = 740, n = Math.round(T.clamp(+d.anzahl || 6, 3, 8)), cx = 500, cy = 380, rx = 370, ry = 245, namen = liste(d.figuren);
    const FARBEN = [BLAU, GRUEN, ORANGE, LILA, TUERKIS, ROT];
    let linien = '', felder = '', kaesten = '';
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n, px = cx + rx * Math.cos(a), py = cy + ry * Math.sin(a), mx = cx + 0.5 * (px - cx), my = cy + 0.5 * (py - cy), col = FARBEN[i % FARBEN.length];
      linien += linie(cx, cy, px, py, GRAU, 3);
      felder += box(mx - 65, my - 18, 130, 36, GRAU, P.papier, 8, 1.5).replace('/>', ' stroke-dasharray="5 4"/>');
      kaesten += box(px - 100, py - 40, 200, 80, col, HELL[col], 12, 3);
      if (namen[i]) kaesten += mitte(px, py, namen[i], namen[i].length > 14 ? 19 : 22, DUNKEL, fett);
    }
    let s = linien + felder + kaesten + box(cx - 110, cy - 40, 220, 80, ROT, HELL[ROT], 16, 4);
    const hf = String(d.haupt || '').trim();
    if (hf) s += mitte(cx, cy, hf, hf.length > 14 ? 21 : 26, DUNKEL, fett);
    s += text(30, 712, 'Auf die Linien: Wie stehen die Figuren zueinander? (Freund, Gegner, Mutter …)', 18, GRAU);
    return tafel('Personenkonstellation', W, H, s, P);
  } };
B.de_figuren.schnell = [{ l: '＋ Figur', f: dd => ({ d: { ...dd, anzahl: Math.min(8, (+dd.anzahl || 6) + 1) } }) }, { l: '− Figur', f: dd => ({ d: { ...dd, anzahl: Math.max(3, (+dd.anzahl || 6) - 1) } }) }];

// ---------- Zeitformen ----------
const ZEITFORMEN = [
  ['Plusquamperfekt', 'ich war gegangen', 'noch vor einem anderen Ereignis in der Vergangenheit', 'hatte/war + Partizip II', 0],
  ['Präteritum', 'ich ging', 'Erzählzeit, v. a. schriftlich', 'Stamm + -te (sagte) oder Stammwechsel (ging)', 0],
  ['Perfekt', 'ich bin gegangen', 'Vergangenheit, v. a. mündlich', 'habe/bin + Partizip II', 0],
  ['Präsens', 'ich gehe', 'jetzt, immer wieder, allgemein gültig', 'Stamm + Endung (geh-e)', 1],
  ['Futur I', 'ich werde gehen', 'Zukunft, Vermutung', 'werden + Infinitiv', 2],
  ['Futur II', 'ich werde gegangen sein', 'in der Zukunft schon abgeschlossen', 'werden + Partizip II + sein/haben', 2]];
B.de_zeitformen = { name: 'Zeitformen auf dem Zeitpfeil', gruppe: 'Sprache', def: { futur2: true, beispiele: true, info: true },
  felder: [{ k: 'futur2', l: 'Futur II zeigen', typ: 'check' }, { k: 'beispiele', l: 'Beispiele („gehen“) zeigen', typ: 'check' }, { k: 'info', l: 'Gebrauch und Bildung zeigen', typ: 'check' }],
  gen: (d, P) => {
    const L = d.futur2 ? ZEITFORMEN : ZEITFORMEN.slice(0, 5), n = L.length, W = d.futur2 ? 1100 : 1000, H = 650, gap = 10, cw = (W - 40 - (n - 1) * gap) / n;
    const X = i => 20 + i * (cw + gap);
    const BAND = [['Vergangenheit', BLAU], ['Gegenwart', ROT], ['Zukunft', GRUEN]];
    let s = '';
    BAND.forEach(([name, col], b) => { const idx = L.map((z, i) => z[4] === b ? i : -1).filter(i => i >= 0), x1 = X(idx[0]), x2 = X(idx[idx.length - 1]) + cw;
      s += box(x1, 82, x2 - x1, 40, col, HELL[col], 10, 2) + mitte((x1 + x2) / 2, 102, name, 20, col, fett); });
    s += pfeil(20, 165, W - 15, 165, P.ink, 4);
    L.forEach(([name, bsp, gebr, bild, b], i) => {
      const x = X(i), mx = x + cw / 2, col = BAND[b][1], y = 205;
      s += kreis(mx, 165, b === 1 ? 11 : 8, col, P.papier, 2) + linie(mx, 175, mx, y, col, 2, 'stroke-dasharray="4 4"');
      s += box(x, y, cw, 375, col, HELL[col], 12, 2.5) + mitte(mx, y + 30, name, 19, col, fett);
      s += linie(x + 12, y + 52, x + cw - 12, y + 52, col, 1.5);
      if (d.beispiele) s += zeilenText(mx, y + 82, bsp, 13, 20, DUNKEL, 26, fett, true);
      if (d.info) { s += linie(x + 12, y + 140, x + cw - 12, y + 140, col, 1, 'stroke-dasharray="5 5"');
        s += zeilenText(mx, y + 165, gebr, 15, 18, DUNKEL, 23, kursiv, true);
        s += linie(x + 12, y + 245, x + cw - 12, y + 245, col, 1, 'stroke-dasharray="5 5"');
        s += zeilenText(mx, y + 270, bild, 15, 18, col, 23, fett, true); }
    });
    s += text(30, 615, '„gehen“ bildet Perfekt und Plusquamperfekt mit „sein“ (Fortbewegung). Partizip II: gegangen', 19, P.ink);
    return tafel('Die Zeitformen des Verbs', W, H, s, P);
  } };
B.de_zeitformen.schnell = [{ l: '⏩ Futur II ein/aus', f: dd => ({ d: { ...dd, futur2: !dd.futur2 } }) }, { l: '💡 Beispiele ein/aus', f: dd => ({ d: { ...dd, beispiele: !dd.beispiele } }) }];
KV['de_zeitformen:leer'] = { name: 'Zeitformen (leer)', d: { beispiele: false, info: false } };

// ---------- Wortfeld-Stern ----------
B.de_wortfeld = { name: 'Wortfeld-Stern', gruppe: 'Sprache', def: { wort: 'sagen', anzahl: 10, woerter: '' },
  felder: [{ k: 'wort', l: 'Zentralwort', typ: 'text' }, { k: 'anzahl', l: 'Anzahl Strahlen', typ: 'zahl', min: 8, max: 12 },
    { k: 'woerter', l: 'Wörter (mit Komma getrennt, leer = freie Felder)', typ: 'text' }],
  gen: (d, P) => {
    const W = 1000, H = 700, cx = 500, cy = 380, rx = 400, ry = 241, n = Math.round(T.clamp(+d.anzahl || 10, 8, 12)), w = liste(d.woerter);
    const FARBEN = [BLAU, GRUEN, ORANGE, LILA, TUERKIS, ROT];
    let strahlen = '', felder = '';
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i + 0.5) * 2 * Math.PI / n, px = cx + rx * Math.cos(a), py = cy + ry * Math.sin(a), col = FARBEN[i % FARBEN.length];
      strahlen += linie(cx, cy, px, py, col, 3);
      felder += box(px - 95, py - 28, 190, 56, col, HELL[col], 28, 2.5);
      if (w[i]) felder += mitte(px, py, w[i], w[i].length > 13 ? 19 : 22, DUNKEL, fett);
    }
    let s = strahlen + felder + `<ellipse cx="${cx}" cy="${cy}" rx="125" ry="58" fill="#fff8e1" stroke="${ORANGE}" stroke-width="4"/>`;
    const zw = String(d.wort || '').trim();
    if (zw) s += mitte(cx, cy, zw, zw.length > 10 ? 26 : 34, DUNKEL, fett);
    return tafel(zw ? 'Wortfeld „' + zw + '“' : 'Wortfeld', W, H, s, P);
  } };
B.de_wortfeld.schnell = [{ l: '＋ Strahl', f: dd => ({ d: { ...dd, anzahl: Math.min(12, (+dd.anzahl || 10) + 1) } }) }, { l: '− Strahl', f: dd => ({ d: { ...dd, anzahl: Math.max(8, (+dd.anzahl || 10) - 1) } }) }];
KV['de_wortfeld:sagen'] = { name: 'Wortfeld „sagen“', d: { wort: 'sagen', anzahl: 12, woerter: 'flüstern, rufen, behaupten, antworten, erklären, fragen, murmeln, schreien, berichten, erzählen, meinen, stottern' } };
KV['de_wortfeld:gehen'] = { name: 'Wortfeld „gehen“', d: { wort: 'gehen', anzahl: 12, woerter: 'laufen, rennen, schlendern, schleichen, stolpern, humpeln, eilen, spazieren, marschieren, wandern, hüpfen, trödeln' } };
KV['de_wortfeld:leer'] = { name: 'Wortfeld-Stern (leer)', d: { wort: '', anzahl: 10, woerter: '' } };

// ======================= ENGLISCH =======================

// ---------- Tenses timeline ----------
const TENSES = [
  ['simple present', 'habits, facts', 'She plays football every Saturday.', 'I play – he/she/it plays (-s)', BLAU],
  ['present progressive', 'happening now', 'Look! He is running to the bus.', 'am/is/are + -ing', TUERKIS],
  ['simple past', 'finished action in the past', 'We visited Grandma yesterday.', 'verb + -ed / 2nd form (go – went)', ORANGE],
  ['present perfect', 'past → now, result counts', 'I have already finished my homework.', 'have/has + 3rd form', ROT],
  ['will-future', 'prediction, spontaneous decision', 'I think it will rain tomorrow.', 'will + infinitive', GRUEN],
  ['going to-future', 'plan, intention', 'We are going to visit Paris next summer.', 'am/is/are + going to + infinitive', LILA]];
B.en_tenses = { name: 'Tenses timeline', gruppe: 'Sprache', def: { beispiele: true, bildung: true, gebrauch: true },
  felder: [{ k: 'beispiele', l: 'Example sentences', typ: 'check' }, { k: 'bildung', l: 'Form (Bildung)', typ: 'check' }, { k: 'gebrauch', l: 'Use (Gebrauch) unter dem Namen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, RH = 105, Y0 = 130, H = Y0 + TENSES.length * RH + 25, T0 = 270, NOW = 375, T1 = 485;
    let s = '';
    s += text(30, 105, 'tense', 19, GRAU, fett) + mitte(300, 105, 'past', 19, GRAU, fett) + mitte(NOW, 105, 'now', 19, ROT, fett) + mitte(450, 105, 'future', 19, GRAU, fett) + text(505, 105, 'example · form', 19, GRAU, fett);
    TENSES.forEach(([name, use, bsp, form, col], i) => {
      const y = Y0 + i * RH, yc = y + RH / 2;
      s += `<rect x="20" y="${y + 4}" width="${W - 40}" height="${RH - 8}" rx="12" fill="${col}" opacity=".10"/>`;
      s += text(30, yc - 20, name, 21, col, fett);
      if (d.gebrauch) s += zeilenText(30, yc + 8, use, 22, 18, P.ink, 22);
      s += pfeil(T0, yc, T1, yc, GRAU, 2.5) + linie(NOW, yc - 20, NOW, yc + 20, ROT, 2.5);
      if (i === 0) for (let x = 285; x <= 465; x += 30) s += kreis(x, yc, 5, col);
      if (i === 1) s += `<path d="M 335 ${yc} q 5 -12 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`;
      if (i === 2) s += kreis(305, yc, 9, col);
      if (i === 3) s += `<path d="M 300 ${yc} Q 337 ${yc - 42} ${NOW} ${yc}" fill="none" stroke="${col}" stroke-width="4"/>` + kreis(300, yc, 7, col) + kreis(NOW, yc, 7, col);
      if (i === 4) s += kreis(440, yc, 9, col);
      if (i === 5) s += `<path d="M ${NOW} ${yc} Q 410 ${yc - 40} 445 ${yc}" fill="none" stroke="${col}" stroke-width="4" stroke-dasharray="7 5"/>` + kreis(NOW, yc, 6, col) + kreis(445, yc, 9, col);
      if (d.beispiele) s += text(505, yc - 16, bsp, 20, P.ink, kursiv);
      if (d.bildung) s += text(505, yc + 18, form, 19, col, fett);
    });
    return tafel('Tenses on the timeline', W, H, s, P, EN);
  } };
B.en_tenses.schnell = [{ l: '💬 Examples on/off', f: dd => ({ d: { ...dd, beispiele: !dd.beispiele } }) }, { l: '🔧 Form on/off', f: dd => ({ d: { ...dd, bildung: !dd.bildung } }) }];
KV['en_tenses:leer'] = { name: 'Tenses timeline (leer)', d: { beispiele: false, bildung: false, gebrauch: false } };

// ---------- Signal words ----------
const SIGNAL = [
  ['simple present', BLAU, ['always', 'usually', 'often', 'sometimes', 'never', 'every day', 'on Mondays']],
  ['present progressive', TUERKIS, ['now', 'right now', 'at the moment', 'Look!', 'Listen!']],
  ['simple past', ORANGE, ['yesterday', 'last week', 'last year', 'two days ago', 'in 2020', 'when I was six']],
  ['present perfect', ROT, ['already', 'just', 'ever', 'never', 'yet', 'so far', 'since 2020', 'for three days']],
  ['will-future', GRUEN, ['tomorrow', 'next week', 'soon', 'in 2050', 'I think …', 'probably', 'perhaps']]];
B.en_signalwords = { name: 'Signal words (tenses)', gruppe: 'Sprache', def: { leer: false },
  felder: [{ k: 'leer', l: 'Leer (nur Überschriften, Spalten zum Hineinschreiben)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 580; let s = '';
    SIGNAL.forEach(([name, col, words], i) => {
      const x = 25 + i * 190, w = 180, mx = x + w / 2;
      s += box(x, 165, w, 340, col, HELL[col], 12, 2.5) + box(x, 85, w, 80, col, col, 12, 2.5);
      s += zeilenText(mx, umbruch(name, 13).length > 1 ? 112 : 125, name, 13, 21, '#ffffff', 26, fett, true);
      if (!d.leer) words.forEach((wd, k) => { s += mitte(mx, 197 + k * 38, wd, 20, DUNKEL, wd.endsWith('!') ? fett : ''); });
    });
    s += text(30, 545, 'Signal words help you to choose the right tense.', 21, P.ink);
    return tafel('Signal words', W, H, s, P, EN);
  } };
B.en_signalwords.schnell = [{ l: '⬜ Leer/gefüllt', f: dd => ({ d: { ...dd, leer: !dd.leer } }) }];
KV['en_signalwords:leer'] = { name: 'Signal words (leer)', d: { leer: true } };

// ---------- Question words ----------
const FRAGEWOERTER = [
  ['who', 'wer?', 'Who is your best friend?'], ['what', 'was?', 'What is your name?'], ['where', 'wo? / wohin?', 'Where do you live?'],
  ['when', 'wann?', 'When is your birthday?'], ['why', 'warum?', 'Why are you sad?'], ['how', 'wie?', 'How are you?'],
  ['which', 'welche(r/s)?', 'Which bus do you take?'], ['whose', 'wessen?', 'Whose bag is this?'], ['how much', 'wie viel?', 'How much is the cap?'],
  ['how many', 'wie viele?', 'How many pets do you have?'], ['how old', 'wie alt?', 'How old are you?'], ['what time', 'um wie viel Uhr?', 'What time does it start?']];
B.en_questionwords = { name: 'Question words', gruppe: 'Sprache', def: { deutsch: true, beispiele: true },
  felder: [{ k: 'deutsch', l: 'Deutsche Bedeutung zeigen', typ: 'check' }, { k: 'beispiele', l: 'Example questions', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 640, FARBEN = [BLAU, GRUEN, ORANGE, LILA]; let s = '';
    FRAGEWOERTER.forEach(([en, de, bsp], i) => {
      const c = i % 3, r = Math.floor(i / 3), x = 25 + c * 322, y = 85 + r * 132, col = FARBEN[r];
      s += box(x, y, 308, 122, col, HELL[col], 12, 2.5);
      s += text(x + 16, y + 30, en, 28, col, fett);
      if (d.deutsch) s += text(x + 16, y + 64, de, 20, DUNKEL, kursiv);
      if (d.beispiele) s += text(x + 16, y + 98, bsp, 19, DUNKEL);
    });
    return tafel('Question words', W, H, s, P, EN);
  } };
B.en_questionwords.schnell = [{ l: '🇩🇪 Deutsch ein/aus', f: dd => ({ d: { ...dd, deutsch: !dd.deutsch } }) }, { l: '💬 Examples on/off', f: dd => ({ d: { ...dd, beispiele: !dd.beispiele } }) }];
KV['en_questionwords:leer'] = { name: 'Question words (nur Englisch)', d: { deutsch: false, beispiele: false } };

// ---------- Word order ----------
const SPALTEN = [['S', 'Subject', 'wer?', BLAU], ['V', 'Verb', 'tut was?', ROT], ['O', 'Object', 'wen? was?', GRUEN], ['P', 'Place', 'wo? wohin?', ORANGE], ['T', 'Time', 'wann?', LILA]];
const SATZBSP = [['My sister', 'plays', 'tennis', 'in the park', 'on Sundays.'], ['We', 'watched', 'a film', 'at the cinema', 'yesterday.']];
B.en_wordorder = { name: 'Word order (S – V – O – P – T)', gruppe: 'Sprache', def: { leer: false },
  felder: [{ k: 'leer', l: 'Leer (Spalten zum Hineinschreiben)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, zeilen = d.leer ? 3 : 2, RY = 205, RH = 88, yM = RY + zeilen * RH + 20, H = yM + 150; let s = '';
    SPALTEN.forEach(([k, name, frage, col], i) => {
      const x = 25 + i * 192, w = 182, mx = x + w / 2;
      s += box(x, 85, w, 110, col, col, 12, 2.5) + mitte(mx, 114, k, 40, '#ffffff', fett) + mitte(mx, 152, name, 21, '#ffffff', fett) + mitte(mx, 177, frage, 18, '#ffffff');
      for (let z = 0; z < zeilen; z++) {
        s += box(x, RY + z * RH, w, RH - 10, col, HELL[col], 10, 2);
        if (!d.leer) s += mitte(mx, RY + z * RH + (RH - 10) / 2, SATZBSP[z][i], 22, DUNKEL, i === 1 ? fett : '');
      }
    });
    s += box(25, yM, 950, 120, ROT, '#fff8e1', 14, 3) + mitte(500, yM + 38, 'SVO – Place before Time', 34, ROT, fett);
    s += mitte(500, yM + 88, 'The time can also start the sentence: Yesterday, we watched a film.', 20, DUNKEL);
    return tafel('Word order in English sentences', W, H, s, P, EN);
  } };
B.en_wordorder.schnell = [{ l: '⬜ Leer/gefüllt', f: dd => ({ d: { ...dd, leer: !dd.leer } }) }];
KV['en_wordorder:leer'] = { name: 'Word order (leer)', d: { leer: true } };

// ---------- Telling the time ----------
const UHR_TEXT = ["o'clock", 'five past', 'ten past', 'quarter past', 'twenty past', 'twenty-five past', 'half past', 'twenty-five to', 'twenty to', 'quarter to', 'ten to', 'five to'];
const STUNDEN_EN = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
const MIN_EN = { 5: 'five', 10: 'ten', 15: 'quarter', 20: 'twenty', 25: 'twenty-five', 30: 'half' };
B.en_time = { name: 'Telling the time', gruppe: 'Sprache', def: { beschriftung: true, zeiger: true, stunde: 3, minute: 10 },
  felder: [{ k: 'beschriftung', l: 'Ausdrücke rund um die Uhr zeigen', typ: 'check' }, { k: 'zeiger', l: 'Zeiger und Beispielsatz zeigen', typ: 'check' },
    { k: 'stunde', l: 'Stunde (1–12)', typ: 'zahl', min: 1, max: 12 }, { k: 'minute', l: 'Minute (0–55, Fünferschritte)', typ: 'zahl', min: 0, max: 55 }],
  gen: (d, P) => {
    const W = 1000, H = 800, cx = 500, cy = 390, r = 200; let s = '';
    s += `<path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z" fill="#e8f5e9"/><path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z" fill="#fff3e0"/>`;
    s += kreis(cx, cy, r, 'none', DUNKEL, 6);
    for (let m = 0; m < 60; m++) { const a = m * Math.PI / 30, l = m % 5 ? 10 : 20, sn = Math.sin(a), cs = Math.cos(a);
      s += linie(cx + (r - 6) * sn, cy - (r - 6) * cs, cx + (r - 6 - l) * sn, cy - (r - 6 - l) * cs, DUNKEL, m % 5 ? 1.5 : 3.5); }
    for (let h = 1; h <= 12; h++) { const a = h * Math.PI / 6; s += mitte(cx + 158 * Math.sin(a), cy - 158 * Math.cos(a) + 2, String(h), 30, DUNKEL, fett); }
    s += text(40, 110, 'TO (vor)', 26, ORANGE, fett) + text(960, 110, 'PAST (nach)', 26, GRUEN, 'text-anchor="end" ' + fett);
    if (d.beschriftung) UHR_TEXT.forEach((t, i) => {
      const a = i * Math.PI / 6, R = r + 28, x = cx + R * Math.sin(a), y = cy - R * Math.cos(a) + (i === 0 ? -6 : i === 6 ? 6 : 0);
      const anker = i === 0 || i === 6 ? 'middle' : i < 6 ? 'start' : 'end', col = i === 0 ? BLAU : i <= 6 ? GRUEN : ORANGE;
      s += text(x, y, t, 21, col, `text-anchor="${anker}" ` + fett);
    });
    if (d.zeiger) {
      const h = Math.round(T.clamp(+d.stunde || 12, 1, 12)), m = Math.round(T.clamp(+d.minute || 0, 0, 55) / 5) * 5;
      const ah = ((h % 12) + m / 60) * Math.PI / 6, am = m * Math.PI / 30;
      s += linie(cx, cy, cx + 105 * Math.sin(ah), cy - 105 * Math.cos(ah), DUNKEL, 10) + linie(cx, cy, cx + 160 * Math.sin(am), cy - 160 * Math.cos(am), DUNKEL, 6) + kreis(cx, cy, 10, ROT);
      const satz = m === 0 ? `It's ${STUNDEN_EN[h % 12]} o'clock.` : m <= 30 ? `It's ${MIN_EN[m]} past ${STUNDEN_EN[h % 12]}.` : `It's ${MIN_EN[60 - m]} to ${STUNDEN_EN[(h + 1) % 12]}.`;
      s += mitte(cx, 685, `${h}:${String(m).padStart(2, '0')}  →  ${satz}`, 26, P.ink, fett);
    } else s += kreis(cx, cy, 10, ROT);
    s += text(40, 735, 'a.m. = before noon (0:00 – 11:59)   ·   7 a.m. = 7:00', 20, P.ink);
    s += text(40, 768, 'p.m. = after noon (12:00 – 23:59)   ·   7 p.m. = 19:00', 20, P.ink);
    const t = tafel('Telling the time', W, H, s, P, EN);
    if (d.zeiger) { /* 🎚 Griffe an den Zeigerenden: Minutenzeiger (blau) und Stundenzeiger (orange) drehen */
      const h = Math.round(T.clamp(+d.stunde || 12, 1, 12)), m = Math.round(T.clamp(+d.minute || 0, 0, 55) / 5) * 5;
      const ah = ((h % 12) + m / 60) * Math.PI / 6, am = m * Math.PI / 30, mx = cx + 160 * Math.sin(am), my = cy - 160 * Math.cos(am), hx = cx + 105 * Math.sin(ah), hy = cy - 105 * Math.cos(ah);
      const knopf = (x, y, col) => kreis(x, y, 22, 'none', 'rgba(0,0,0,.35)', 2) + kreis(x, y, 20, col, '#ffffff', 3) + kreis(x, y, 8, 'none', '#ffffff', 3);
      t.svg = t.svg.replace(/<\/svg>\s*$/, knopf(hx, hy, ORANGE) + knopf(mx, my, BLAU) + '</svg>');
      t.teile = [{ id: 'minute', x: mx - 22, y: my - 22, w: 44, h: 44, zieh: true }, { id: 'stunde', x: hx - 22, y: hy - 22, w: 44, h: 44, zieh: true }];
    }
    return t;
  },
  /* Minutenzeiger im 5-Minuten-Raster (über 12 hinweg zählt die Stunde mit), Stundenzeiger in ganzen Stunden */
  ziehen: (d, id, sx, sy) => {
    let h = Math.round(T.clamp(+d.stunde || 12, 1, 12)), m = Math.round(T.clamp(+d.minute || 0, 0, 55) / 5) * 5;
    const w = (Math.atan2(sx - 500, 390 - sy) + 2 * Math.PI) % (2 * Math.PI), schritt = Math.PI / 6;
    if (id === 'minute') { const nm = Math.round(w / schritt) % 12 * 5;
      if (m >= 45 && nm <= 15) h = h % 12 + 1; else if (m <= 15 && nm >= 45) h = (h + 10) % 12 + 1;
      m = nm; }
    else if (id === 'stunde') { const nh = Math.round(w / schritt - m / 60); h = ((nh % 12) + 12) % 12 || 12; }
    else return null;
    return h === +d.stunde && m === +d.minute ? null : { ...d, stunde: h, minute: m };
  } };
B.en_time.schnell = [{ l: '🏷 Ausdrücke ein/aus', f: dd => ({ d: { ...dd, beschriftung: !dd.beschriftung } }) }, { l: '🕒 Zeiger ein/aus', f: dd => ({ d: { ...dd, zeiger: !dd.zeiger } }) },
  { l: '+5 min', f: dd => { let h = Math.round(T.clamp(+dd.stunde || 12, 1, 12)), m = Math.round(T.clamp(+dd.minute || 0, 0, 55) / 5) * 5 + 5; if (m >= 60) { m = 0; h = h % 12 + 1; } return { d: { ...dd, stunde: h, minute: m } }; } }];
KV['en_time:leer'] = { name: 'Telling the time (leere Uhr)', d: { beschriftung: false, zeiger: false } };

// ---------- Days, months, dates ----------
const TAGE = [['Monday', 'Montag'], ['Tuesday', 'Dienstag'], ['Wednesday', 'Mittwoch'], ['Thursday', 'Donnerstag'], ['Friday', 'Freitag'], ['Saturday', 'Samstag'], ['Sunday', 'Sonntag']];
const MONATE = [['January', 'Januar'], ['February', 'Februar'], ['March', 'März'], ['April', 'April'], ['May', 'Mai'], ['June', 'Juni'], ['July', 'Juli'], ['August', 'August'],
  ['September', 'September'], ['October', 'Oktober'], ['November', 'November'], ['December', 'Dezember']];
const ORDINAL = [['1st', 'first'], ['2nd', 'second'], ['3rd', 'third'], ['4th', 'fourth'], ['5th', 'fifth'], ['9th', 'ninth'], ['11th', 'eleventh'], ['12th', 'twelfth'], ['13th', 'thirteenth'],
  ['20th', 'twentieth'], ['21st', 'twenty-first'], ['22nd', 'twenty-second'], ['23rd', 'twenty-third'], ['31st', 'thirty-first']];
B.en_dates = { name: 'Days, months, dates', gruppe: 'Sprache', def: { deutsch: true, woerter: true },
  felder: [{ k: 'deutsch', l: 'Deutsche Wörter zeigen', typ: 'check' }, { k: 'woerter', l: 'Ordinalzahlen ausgeschrieben zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 790; let s = '';
    s += text(30, 100, 'Days of the week', 24, BLAU, fett) + text(330, 100, 'Months', 24, GRUEN, fett) + text(650, 100, 'Ordinal numbers', 24, ORANGE, fett);
    s += linie(310, 85, 310, 570, GRAU, 1.5) + linie(630, 85, 630, 570, GRAU, 1.5);
    TAGE.forEach(([en, de], i) => { const y = 145 + i * 40; s += text(30, y, en, 22, P.ink, fett); if (d.deutsch) s += text(170, y, de, 19, GRAU); });
    MONATE.forEach(([en, de], i) => { const y = 145 + i * 36; s += text(330, y, en, 22, P.ink, fett); if (d.deutsch) s += text(480, y, de, 19, GRAU); });
    ORDINAL.forEach(([z, w], i) => { const y = 145 + i * 31, end = z.slice(-2), col = end === 'st' ? ROT : end === 'nd' ? GRUEN : end === 'rd' ? BLAU : P.ink;
      s += text(650, y, z, 22, col, fett); if (d.woerter) s += text(730, y, w, 20, P.ink); });
    s += box(30, 435, 265, 135, ROT, '#ffebee', 12, 2.5) + text(46, 465, 'Always with a', 20, DUNKEL, fett) + text(46, 492, 'capital letter:', 20, DUNKEL, fett) + text(46, 527, 'Monday, May', 22, ROT, fett);
    s += text(46, 555, 'immer groß!', 18, DUNKEL, kursiv);
    s += text(650, 590, 'Aber: 11th, 12th, 13th → -th', 18, GRAU, fett);
    s += box(30, 615, 940, 150, BLAU, '#e3f2fd', 14, 3);
    s += text(55, 655, 'We write:  3rd May  or  May 3rd', 26, DUNKEL, fett);
    s += text(55, 698, 'We say:  the third of May  or  May the third', 26, BLAU, fett);
    s += text(55, 740, '3rd May 2025 → the third of May, twenty twenty-five', 20, DUNKEL, kursiv);
    return tafel('Days, months and dates', W, H, s, P, EN);
  } };
B.en_dates.schnell = [{ l: '🇩🇪 Deutsch ein/aus', f: dd => ({ d: { ...dd, deutsch: !dd.deutsch } }) }, { l: '🔢 Wörter ein/aus', f: dd => ({ d: { ...dd, woerter: !dd.woerter } }) }];
})();
