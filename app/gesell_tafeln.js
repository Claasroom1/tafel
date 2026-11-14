// Tafel-App – Tafelbilder für Gesellschaft, Religion / Werte und Normen und Methoden
// Epochen · Quellenarbeit · Karikatur · Gewaltenteilung · Bundestagswahl · Kompassrose · Klimazonen ·
// Kirchenjahr · Weltreligionen · Dilemma · Think-Pair-Share · Placemat · Lerntempoduett · Ich-Du-Wir · Vier-Ecken.
// Alles selbst gezeichnet (SVG). Jeder Text ist ein eigenes <text>-Element, die Überschrift kommt zuerst.
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', ROT = '#c62828', LILA = '#6a1b9a', GRAU = '#64748b', RAND = '#3a6d99', DK = '#1b1f2a';
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const fett = 'font-weight="700"';
const box = (x, y, w, h, rand, fuell, r = 14, sw = 2.5) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const linie = (x1, y1, x2, y2, col, w = 2, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const pfeil = (x1, y1, x2, y2, col, w = 4) => { const a = Math.atan2(y2 - y1, x2 - x1), k = 16, ax = x2 - k * Math.cos(a), ay = y2 - k * Math.sin(a);
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(ax)}" y2="${f(ay)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${f(x2)} ${f(y2)} L ${f(ax + 9 * Math.sin(a))} ${f(ay - 9 * Math.cos(a))} L ${f(ax - 9 * Math.sin(a))} ${f(ay + 9 * Math.cos(a))} Z" fill="${col}"/>`; };
const umbruch = (z, max) => { const out = []; let cur = ''; for (const w of String(z).split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const zeilenText = (x, y, t, max, size, col, abst, extra = '', mittig = false) => umbruch(t, max).map((z, i) => (mittig ? mitte : text)(x, y + i * abst, z, size, col, extra)).join('');
function tafel(titel, W, H, inhalt, P, icon) {
  return { svg: T._svg.doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 42, icon + ' ' + titel, 32, P.ink, fett) + inhalt), w: W, h: H };
}
const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};
const umschalt = (l, k) => ({ l, f: dd => ({ d: { ...dd, [k]: !dd[k] } }) });
const HELL = { [ROT]: '#ff8a80', [BLAU]: '#90caf9', [GRUEN]: '#a5d6a7', [ORANGE]: '#ffcc80', [LILA]: '#ce93d8', [GRAU]: '#b0bec5' };
const tc = (P, col) => (/^#(f|e|d)/i.test(String(P.ink)) ? HELL[col] || col : col); /* Farbe für Text direkt auf der Tafel: auf dunkler Tafel aufgehellt */

// ======================= GESELLSCHAFT =======================

// ---------- Epochen-Zeitleiste ----------
const EPOCHEN = [ /* Name (Zeilen), Stichworte, Füllung, Randfarbe */
  [['Ur- und', 'Frühgeschichte'], ['Steinzeit', 'erste Bauern'], '#d7ccc8', '#6d4c41'],
  [['Antike'], ['Hochkulturen', 'Griechen, Römer'], '#ffe082', '#b8860b'],
  [['Mittelalter'], ['Ritter, Burgen', 'Klöster'], '#a5d6a7', GRUEN],
  [['Frühe', 'Neuzeit'], ['Entdeckungen', 'Reformation'], '#90caf9', BLAU],
  [['Moderne'], ['Industrie', 'Weltkriege'], '#ce93d8', LILA],
  [['Zeit-', 'geschichte'], ['Teilung 1949', 'Einheit 1990'], '#ffab91', ORANGE]];
const GRENZEN = ['ca. 3000 v. Chr.', 'ca. 500 n. Chr.', 'ca. 1500', 'ca. 1800', '1945', 'heute'];
B.ge_epochen = { name: 'Epochen-Zeitleiste', gruppe: 'Gesellschaft', def: { namen: true, stichworte: true },
  felder: [{ k: 'namen', l: 'Namen der Epochen zeigen (aus = leer zum Beschriften)', typ: 'check' }, { k: 'stichworte', l: 'Stichworte zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 450, x0 = 35, sw = 155, y1 = 130, y2 = 200; let s = '';
    EPOCHEN.forEach(([nz, st, fuell, col], i) => { const x = x0 + i * sw, xm = x + sw / 2;
      s += `<rect x="${x}" y="${y1}" width="${sw}" height="${y2 - y1}" fill="${fuell}" stroke="#37474f" stroke-width="2"/>`;
      if (d.namen) nz.forEach((z, j) => { s += mitte(xm, (y1 + y2) / 2 + (j - (nz.length - 1) / 2) * 26, z, 20, DK, fett); });
      s += box(x + 5, 255, sw - 10, 120, col, fuell, 10, 2);
      if (d.stichworte) st.forEach((z, j) => { s += mitte(xm, 292 + j * 40, z, 18, DK); });
    });
    for (let i = 0; i <= 6; i++) s += linie(x0 + i * sw, y2, x0 + i * sw, y2 + 14, '#37474f', 2.5);
    GRENZEN.forEach((g, i) => { const x = x0 + (i + 1) * sw; s += i === 5 ? text(x, 232, g, 18, P.ink, 'text-anchor="end" ' + fett) : mitte(x, 232, g, 18, P.ink, fett); });
    const rot = tc(P, ROT);
    s += linie(318, 96, 318, 214, rot, 4) + mitte(318, 80, 'Christi Geburt', 19, rot, fett);
    s += text(310, 112, '← v. Chr.', 18, rot, 'text-anchor="end"') + text(326, 112, 'n. Chr. →', 18, rot);
    s += text(35, 410, 'Die Abschnitte sind nicht maßstabsgetreu. Die Jahreszahlen sind ungefähre Grenzen.', 18, tc(P, GRAU));
    return tafel('Epochen der Geschichte', W, H, s, P, '⏳');
  } };
B.ge_epochen.schnell = [umschalt('🏷 Namen ein/aus', 'namen'), umschalt('💡 Stichworte ein/aus', 'stichworte')];
KV['ge_epochen:leer'] = { name: 'Epochen-Zeitleiste (leer)', d: { namen: false, stichworte: false } };

// ---------- Quellenarbeit ----------
const QUELLARTEN = [['📜', 'Textquellen', 'Urkunde, Brief, Tagebuch, Zeitung', BLAU, '#e3f2fd'],
  ['🖼️', 'Bildquellen', 'Gemälde, Foto, Plakat, Zeichnung', LILA, '#f3e5f5'],
  ['🏺', 'Sachquellen', 'Werkzeug, Kleidung, Münze, Gebäude', '#8d6e63', '#efebe9'],
  ['🗣️', 'Mündliche Quellen', 'Interview mit Zeitzeugen, Lieder, Erzählungen', GRUEN, '#e8f5e9']];
const WFRAGEN = [['Wer?', 'Wer hat die Quelle gemacht?'], ['Wann?', 'Wann ist sie entstanden?'], ['Wo?', 'Wo ist sie entstanden?'],
  ['Was?', 'Worum geht es? Was wird gezeigt?'], ['Für wen?', 'An wen richtet sie sich?'], ['Warum?', 'Mit welcher Absicht entstand sie?']];
B.ge_quellen = { name: 'Quellenarbeit (Quellenarten, W-Fragen)', gruppe: 'Gesellschaft', def: { erkl: true },
  felder: [{ k: 'erkl', l: 'Erklärungen und Beispiele zeigen (aus = leer zum Ausfüllen)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 625; let s = '';
    s += text(30, 88, 'Quellenarten', 24, P.ink, fett);
    QUELLARTEN.forEach(([ic, n, bsp, col, fuell], i) => { const x = 30 + (i % 2) * 270, y = 110 + Math.floor(i / 2) * 148;
      s += box(x, y, 255, 135, col, fuell, 12) + text(x + 14, y + 32, ic, 28, '#000') + text(x + 56, y + 32, n, 21, col, fett);
      if (d.erkl) s += zeilenText(x + 16, y + 74, bsp, 24, 19, DK, 25); });
    s += text(30, 428, 'Quelle und Darstellung', 24, P.ink, fett);
    [[30, 'Quelle', 'stammt aus der Zeit, um die es geht', ORANGE, '#fff3e0'], [300, 'Darstellung', 'wurde später über diese Zeit verfasst, z. B. Schulbuch, Film', ROT, '#ffebee']].forEach(([x, n, erkl, col, fuell]) => {
      s += box(x, 450, 255, 150, col, fuell, 12) + text(x + 16, 480, n, 22, col, fett);
      if (d.erkl) s += zeilenText(x + 16, 518, erkl, 23, 19, DK, 25); });
    s += text(590, 88, 'W-Fragen an eine Quelle', 24, P.ink, fett);
    WFRAGEN.forEach(([w, erkl], i) => { const y = 110 + i * 82;
      s += box(590, y, 380, 72, BLAU, i % 2 ? '#ffffff' : '#e3f2fd', 10, 2) + text(605, y + 36, w, 24, BLAU, fett);
      if (d.erkl) { const z = umbruch(erkl, 23); s += zeilenText(725, y + 36 - (z.length - 1) * 12, erkl, 23, 19, DK, 24); } });
    return tafel('Arbeiten mit Quellen', W, H, s, P, '📜');
  } };
B.ge_quellen.schnell = [umschalt('💡 Erklärungen ein/aus', 'erkl')];
KV['ge_quellen:leer'] = { name: 'Quellenarbeit (leer)', d: { erkl: false } };

// ---------- Karikatur analysieren ----------
const KARI = [['Beschreiben', BLAU, '#e3f2fd', ['Was ist zu sehen? Personen, Gegenstände', 'Welche Texte, Zahlen, Symbole gibt es?', 'Wer hat sie wann und wo veröffentlicht?']],
  ['Deuten', ORANGE, '#fff3e0', ['Wofür stehen die Figuren und Symbole?', 'Auf welches Problem bezieht sie sich?', 'Was ist die Aussage der Karikatur?']],
  ['Beurteilen', GRUEN, '#e8f5e9', ['Ist die Aussage überzeugend? Was fehlt?', 'Wie stehe ich selbst dazu? Begründe.']]];
B.ge_karikatur = { name: 'Karikatur analysieren', gruppe: 'Gesellschaft', def: { fragen: true },
  felder: [{ k: 'fragen', l: 'Leitfragen zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 650; let s = '';
    s += `<rect x="30" y="75" width="420" height="540" rx="14" fill="none" stroke="${GRAU}" stroke-width="3" stroke-dasharray="12 9"/>` + mitte(240, 345, 'Karikatur hier einfügen', 22, tc(P, GRAU));
    KARI.forEach(([n, col, fuell, fr], i) => { const x = 480, y = 75 + i * 185;
      s += box(x, y, 490, 170, col, fuell, 14) + `<circle cx="${x + 32}" cy="${y + 32}" r="20" fill="${col}"/>` + mitte(x + 32, y + 33, String(i + 1), 22, '#ffffff', fett) + text(x + 64, y + 32, n, 26, col, fett);
      if (d.fragen) { let yy = y + 70; fr.forEach(q => { const z = umbruch('– ' + q, 45); s += zeilenText(x + 20, yy, '– ' + q, 45, 19, DK, 24); yy += z.length * 24 + 4; }); } });
    return tafel('Karikatur analysieren', W, H, s, P, '🖊️');
  } };
B.ge_karikatur.schnell = [umschalt('💡 Leitfragen ein/aus', 'fragen')];
KV['ge_karikatur:leer'] = { name: 'Karikatur analysieren (leer)', d: { fragen: false } };

// ---------- Gewaltenteilung ----------
const GEWALTEN = [['Legislative', 'gesetzgebende Gewalt', BLAU, '#e3f2fd', [['Bundestag'], ['Bundesrat']], ['beschließt Gesetze', 'kontrolliert die Regierung']],
  ['Exekutive', 'ausführende Gewalt', ORANGE, '#fff3e0', [['Bundesregierung'], ['Verwaltung'], ['Polizei']], ['führt die Gesetze aus', 'regiert das Land']],
  ['Judikative', 'rechtsprechende Gewalt', GRUEN, '#e8f5e9', [['Gerichte'], ['Bundesverfassungs-', 'gericht']], ['spricht Recht', 'prüft, ob Gesetze dem Grundgesetz entsprechen']]];
B.ge_gewalten = { name: 'Gewaltenteilung', gruppe: 'Gesellschaft', def: { inhalte: true },
  felder: [{ k: 'inhalte', l: 'Organe und Aufgaben zeigen (aus = leer zum Ausfüllen)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 690, y0 = 75; let s = '';
    GEWALTEN.forEach(([n, sub, col, fuell, organe, aufg], i) => { const x = 50 + i * 325;
      s += box(x, y0, 250, 345, col, fuell, 14, 3) + mitte(x + 125, y0 + 32, n, 28, col, fett);
      if (!d.inhalte) return;
      s += mitte(x + 125, y0 + 64, sub, 18, DK, 'font-style="italic"');
      let y = y0 + 88;
      organe.forEach(o => { const h = o.length > 1 ? 58 : 40; s += box(x + 20, y, 210, h, col, '#ffffff', 10, 2);
        o.forEach((z, j) => { s += mitte(x + 125, y + h / 2 + (j - (o.length - 1) / 2) * 23, z, 19, DK, fett); }); y += h + 10; });
      y += 14; s += text(x + 18, y, 'Aufgabe:', 18, col, fett); y += 27;
      aufg.forEach(a => { s += zeilenText(x + 18, y, a, 22, 19, DK, 24); y += umbruch(a, 22).length * 24 + 4; });
    });
    s += pfeil(312, 245, 363, 245, GRAU, 4) + pfeil(363, 245, 312, 245, GRAU, 4) + pfeil(637, 245, 688, 245, GRAU, 4) + pfeil(688, 245, 637, 245, GRAU, 4);
    s += `<path d="M 190 424 Q 500 490 810 424" fill="none" stroke="${GRAU}" stroke-width="4"/>` + pfeil(227, 431, 190, 424, GRAU, 4) + pfeil(773, 431, 810, 424, GRAU, 4);
    s += mitte(500, 476, 'Die drei Gewalten kontrollieren sich gegenseitig.', 19, P.ink, fett);
    s += box(110, 497, 840, 52, '#8d6e63', '#fff8e1', 10, 3) + mitte(530, 523, 'Grundgesetz – die Grundlage für alle drei Gewalten', 22, DK, fett);
    s += pfeil(70, 600, 70, 424, tc(P, BLAU), 5) + text(84, 573, 'wählt den Bundestag', 19, tc(P, BLAU), fett);
    s += box(30, 602, 300, 58, BLAU, '#e3f2fd', 12, 3) + mitte(180, 631, '👥 Volk (Wahlberechtigte)', 21, DK, fett);
    s += text(355, 631, 'Alle Staatsgewalt geht vom Volke aus. (Art. 20 GG)', 20, P.ink, 'font-style="italic"');
    return tafel('Gewaltenteilung in Deutschland', W, H, s, P, '⚖️');
  } };
B.ge_gewalten.schnell = [umschalt('💡 Inhalte ein/aus', 'inhalte')];
KV['ge_gewalten:leer'] = { name: 'Gewaltenteilung (leer)', d: { inhalte: false } };

// ---------- Bundestagswahl ----------
const KANDIDATEN = [['Mara Lindholm', 'BfZ', 'Bund für Zukunft'], ['Jonas Reiter', 'SOP', 'Sonnenpartei'], ['Selin Kaya', 'LGM', 'Liste Gemeinsam'], ['Paul Brandt', 'FRP', 'Fahrradpartei']];
const WAHLINFO = [['Erststimme', '#37474f', '#eceff1', ['Wahl einer Person aus dem eigenen Wahlkreis (299 Wahlkreise).', 'Wer die meisten Erststimmen hat, gewinnt den Wahlkreis.', 'Den Sitz erhält sie oder er, wenn er durch die Zweitstimmen der Partei gedeckt ist.']],
  ['Zweitstimme', BLAU, '#e3f2fd', ['Wahl einer Partei (ihrer Landesliste).', 'Sie entscheidet, wie viele der 630 Sitze im Bundestag jede Partei bekommt.']],
  ['5-%-Hürde', ROT, '#ffebee', ['Sitze bekommt nur eine Partei mit mindestens 5 % der Zweitstimmen –', 'oder wenn sie in mindestens 3 Wahlkreisen die meisten Erststimmen hat (Grundmandatsklausel).']]];
const GRUNDSAETZE = [['allgemein', 'alle Deutschen ab 18 Jahren'], ['unmittelbar', 'direkt, ohne Wahlleute dazwischen'], ['frei', 'ohne Zwang oder Druck'],
  ['gleich', 'jede Stimme zählt gleich viel'], ['geheim', 'niemand darf sehen, wie ich wähle']];
B.ge_wahl = { name: 'Bundestagswahl (Erst- und Zweitstimme)', gruppe: 'Gesellschaft', def: { erkl: true },
  felder: [{ k: 'erkl', l: 'Erklärungen zeigen (aus = leer zum Ausfüllen)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000; let s = '', y = 75;
    WAHLINFO.forEach(([n, col, fuell, zl]) => { const zeilen = d.erkl ? zl.reduce((a, z) => a + umbruch(z, 42).length, 0) : 3, h = 52 + zeilen * 24 + (d.erkl ? (zl.length - 1) * 6 : 0) + 8;
      s += box(525, y, 445, h, col, fuell, 12) + text(543, y + 28, n, 23, col, fett);
      if (d.erkl) { let yy = y + 62; zl.forEach(z => { s += zeilenText(543, yy, z, 42, 19, DK, 24); yy += umbruch(z, 42).length * 24 + 6; }); }
      y += h + 14; });
    const yEnd = Math.max(585, y - 14);
    s += box(30, 75, 470, yEnd - 75, '#555555', '#fffdf5', 6, 2.5);
    s += mitte(265, 103, 'Stimmzettel', 24, DK, fett) + mitte(265, 132, 'für die Wahl zum Deutschen Bundestag', 18, DK) + mitte(265, 156, 'im Wahlkreis 99 Musterstadt', 18, DK) + mitte(265, 186, 'Sie haben 2 Stimmen', 20, DK, fett);
    s += box(42, 205, 220, 70, '#263238', '#eceff1', 4, 2.5) + mitte(152, 228, 'Erststimme', 22, DK, fett) + mitte(152, 256, 'für eine Person', 18, DK);
    s += box(268, 205, 220, 70, BLAU, '#e3f2fd', 4, 2.5) + mitte(378, 228, 'Zweitstimme', 22, BLAU, fett) + mitte(378, 256, 'für eine Partei', 18, DK);
    KANDIDATEN.forEach(([name, kurz, partei], i) => { const yy = 285 + i * 72;
      s += box(42, yy, 220, 66, '#263238', '#ffffff', 4, 2) + text(54, yy + 22, name, 19, DK, fett) + text(54, yy + 46, kurz, 18, DK) + `<circle cx="236" cy="${yy + 33}" r="15" fill="#ffffff" stroke="#263238" stroke-width="2.5"/>`;
      s += box(268, yy, 220, 66, BLAU, '#ffffff', 4, 2) + `<circle cx="294" cy="${yy + 33}" r="15" fill="#ffffff" stroke="${BLAU}" stroke-width="2.5"/>` + text(320, yy + 22, kurz, 19, DK, fett) + text(320, yy + 46, partei, 18, DK); });
    const yG = yEnd + 38;
    s += text(30, yG, 'Wahlgrundsätze (Artikel 38 Grundgesetz)', 23, P.ink, fett);
    const farben = [BLAU, ORANGE, GRUEN, LILA, ROT], fuellen = ['#e3f2fd', '#fff3e0', '#e8f5e9', '#f3e5f5', '#ffebee'];
    GRUNDSAETZE.forEach(([n, erkl], i) => { const x = 30 + i * 190;
      s += box(x, yG + 25, 178, 132, farben[i], fuellen[i], 12) + mitte(x + 89, yG + 53, n, 21, farben[i], fett);
      if (d.erkl) s += zeilenText(x + 89, yG + 87, erkl, 17, 18, DK, 23, '', true); });
    const H = yG + 180;
    return tafel('Die Bundestagswahl', W, H, s, P, '🗳️');
  } };
B.ge_wahl.schnell = [umschalt('💡 Erklärungen ein/aus', 'erkl')];
KV['ge_wahl:leer'] = { name: 'Bundestagswahl (leer)', d: { erkl: false } };

// ---------- Kompassrose ----------
B.ge_kompass = { name: 'Kompassrose (Himmelsrichtungen)', gruppe: 'Gesellschaft', def: { beschriftung: true, merkhilfe: true },
  felder: [{ k: 'beschriftung', l: 'Himmelsrichtungen und Grad zeigen', typ: 'check' }, { k: 'merkhilfe', l: 'Merkhilfen rechts zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 680, cx = d.merkhilfe ? 320 : 500, cy = 375, pt = (r, a) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
    let s = `<circle cx="${cx}" cy="${cy}" r="200" fill="none" stroke="${RAND}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="186" fill="none" stroke="${RAND}" stroke-width="1.5"/>`;
    for (let a = 0; a < 360; a += 15) { const [x1, y1] = pt(a % 45 ? 192 : 180, a), [x2, y2] = pt(200, a); s += linie(x1, y1, x2, y2, RAND, a % 45 ? 1.5 : 3); }
    const zacke = (a, lang, breit, dunkel, hell) => { const [tx, ty] = pt(lang, a), [l1, l2] = pt(breit, a - 90), [r1, r2] = pt(breit, a + 90);
      return `<path d="M ${cx} ${cy} L ${f(tx)} ${f(ty)} L ${f(l1)} ${f(l2)} Z" fill="${dunkel}" stroke="#263238" stroke-width="1.5"/><path d="M ${cx} ${cy} L ${f(tx)} ${f(ty)} L ${f(r1)} ${f(r2)} Z" fill="${hell}" stroke="#263238" stroke-width="1.5"/>`; };
    for (const a of [45, 135, 225, 315]) s += zacke(a, 140, 18, '#78909c', '#eceff1');
    for (const a of [90, 180, 270]) s += zacke(a, 225, 28, '#37474f', '#cfd8dc');
    s += zacke(0, 225, 28, '#b71c1c', '#ef9a9a') + `<circle cx="${cx}" cy="${cy}" r="8" fill="#ffffff" stroke="#263238" stroke-width="2"/>`;
    if (d.beschriftung) {
      const bl = tc(P, BLAU);
      [['N', 0], ['O', 90], ['S', 180], ['W', 270]].forEach(([n, a]) => { const [x, y] = pt(258, a); s += mitte(x, y, n, 34, n === 'N' ? tc(P, ROT) : P.ink, fett); });
      [['NO', 45], ['SO', 135], ['SW', 225], ['NW', 315]].forEach(([n, a]) => { const [x, y] = pt(250, a); s += mitte(x, y, n, 24, P.ink, fett); });
      s += text(cx + 24, cy - 258, '0°', 20, bl, fett) + mitte(cx + 258, cy + 34, '90°', 20, bl, fett) + text(cx + 24, cy + 258, '180°', 20, bl, fett) + mitte(cx - 258, cy + 34, '270°', 20, bl, fett);
    }
    if (d.merkhilfe) {
      s += box(620, 80, 355, 255, ORANGE, '#fff8e1', 14) + text(640, 112, '☀️ Der Lauf der Sonne', 22, ORANGE, fett);
      ['Im Osten geht die Sonne auf,', 'im Süden nimmt sie ihren Lauf,', 'im Westen wird sie untergehn,', 'im Norden ist sie nie zu sehn.'].forEach((z, i) => { s += text(640, 152 + i * 32, z, 20, DK); });
      s += text(640, 288, 'Mittags steht die Sonne im Süden.', 19, DK, fett) + text(640, 316, '(gilt für Deutschland)', 18, '#5d4037');
      s += box(620, 355, 355, 175, BLAU, '#e3f2fd', 14) + text(640, 387, 'Haupthimmelsrichtungen:', 20, BLAU, fett) + text(640, 419, 'Norden, Osten, Süden, Westen', 19, DK);
      s += text(640, 462, 'Nebenhimmelsrichtungen:', 20, BLAU, fett) + text(640, 494, 'Nordost, Südost, Südwest, Nordwest', 18, DK);
      s += box(620, 550, 355, 100, GRUEN, '#e8f5e9', 14) + text(640, 580, 'Merksatz im Uhrzeigersinn:', 19, GRUEN, fett) + text(640, 616, 'Nie Ohne Seife Waschen', 22, DK, fett);
    }
    return tafel('Die Himmelsrichtungen', W, H, s, P, '🧭');
  } };
B.ge_kompass.schnell = [umschalt('🏷 Beschriftung ein/aus', 'beschriftung'), umschalt('💡 Merkhilfen ein/aus', 'merkhilfe')];
KV['ge_kompass:leer'] = { name: 'Kompassrose (leer)', d: { beschriftung: false, merkhilfe: false } };

// ---------- Klimazonen ----------
const ZONEN = [['Polare Zone', 55, '#e3f2fd'], ['Subpolare Zone', 45, '#b3e5fc'], ['Gemäßigte Zone', 60, '#a5d6a7'], ['Subtropen', 55, '#ffe082'], ['Tropen', 60, '#ffab91']]; /* vom Pol zum Äquator, Höhe schematisch */
B.ge_klimazonen = { name: 'Klimazonen der Erde', gruppe: 'Gesellschaft', def: { namen: true, linien: true },
  felder: [{ k: 'namen', l: 'Namen der Klimazonen zeigen', typ: 'check' }, { k: 'linien', l: 'Breitenkreise beschriften', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 730, xa = 60, xb = 560, yTop = 85, yAeq = 360; let s = '';
    let y = yTop; const grenzeN = [];
    ZONEN.forEach(([n, h, fuell]) => { s += `<rect x="${xa}" y="${y}" width="${xb - xa}" height="${h}" fill="${fuell}"/>` + `<rect x="${xa}" y="${2 * yAeq - y - h}" width="${xb - xa}" height="${h}" fill="${fuell}"/>`;
      if (d.namen) s += mitte((xa + xb) / 2, y + h / 2, n, 21, DK, fett) + mitte((xa + xb) / 2, 2 * yAeq - y - h / 2, n, 21, DK, fett);
      y += h; grenzeN.push(y); });
    s += `<rect x="${xa}" y="${yTop}" width="${xb - xa}" height="${2 * (yAeq - yTop)}" fill="none" stroke="#37474f" stroke-width="3"/>`;
    for (const yy of [grenzeN[1], grenzeN[2], 2 * yAeq - grenzeN[1], 2 * yAeq - grenzeN[2]]) s += linie(xa, yy, xb, yy, '#37474f', 1.5);
    const L = [[yTop, 'Nordpol (90° N)', P.ink, 0], [grenzeN[0], 'nördlicher Polarkreis (66,6° N)', BLAU, 1], [grenzeN[3], 'nördlicher Wendekreis (23,4° N)', ORANGE, 1],
      [yAeq, 'Äquator (0°)', ROT, 2], [2 * yAeq - grenzeN[3], 'südlicher Wendekreis (23,4° S)', ORANGE, 1], [2 * yAeq - grenzeN[0], 'südlicher Polarkreis (66,6° S)', BLAU, 1], [2 * yAeq - yTop, 'Südpol (90° S)', P.ink, 0]];
    L.forEach(([yy, n, col, art]) => { if (art) s += linie(xa - 10, yy, 585, yy, col, art === 2 ? 4 : 3, art === 1 ? 'stroke-dasharray="12 7"' : '');
      else s += linie(xb, yy, 585, yy, col, 2);
      if (d.linien) s += text(595, yy, n, 19, col === P.ink ? P.ink : tc(P, col), fett); });
    s += text(30, 672, 'Vom Äquator zu den Polen wird es kälter, weil die Sonnenstrahlen immer flacher auftreffen.', 19, P.ink);
    s += text(30, 702, 'Vereinfachte Darstellung: Die Grenzen der Klimazonen folgen nicht genau den Breitenkreisen.', 18, tc(P, GRAU));
    return tafel('Die Klimazonen der Erde', W, H, s, P, '🌍');
  } };
B.ge_klimazonen.schnell = [umschalt('🏷 Zonen ein/aus', 'namen'), umschalt('📏 Breitenkreise ein/aus', 'linien')];
KV['ge_klimazonen:leer'] = { name: 'Klimazonen der Erde (leer)', d: { namen: false, linien: false } };

// ======================= RELIGION / WERTE UND NORMEN =======================

// ---------- Kirchenjahr ----------
const VIO = '#7e57c2', WEISS = '#fffdf2', ROTL = '#e53935', GRUENL = '#43a047', SCHWARZ = '#263238';
const KJ_ABSCHNITTE = [[0, 4, VIO], [4, 6, WEISS], [6, 12, GRUENL], [12, 17.6, VIO], [17.6, 18, SCHWARZ], [18, 25, WEISS], [25, 26, ROTL], [26, 52, GRUENL]]; /* in Wochen ab 1. Advent */
const KJ_FESTE = [ /* Woche, Zeilen, Beschriftungspunkt x/y, Ausrichtung, fett */
  [2, ['Advent (Beginn)'], 585, 150, 'start', true], [4.3, ['Weihnachten'], 650, 192, 'start', true], [5.9, ['Epiphanias (6.1.)'], 690, 234, 'start', false],
  [12, ['Aschermittwoch'], 765, 340, 'start', false], [14.8, ['Passionszeit /', 'Fastenzeit'], 765, 400, 'start', false], [17.8, ['Karfreitag'], 742, 478, 'start', false],
  [18.1, ['Ostern'], 735, 535, 'start', true], [23.7, ['Christi Himmelfahrt'], 595, 662, 'start', false], [25.5, ['Pfingsten'], 515, 702, 'middle', true],
  [26.2, ['Trinitatis'], 440, 672, 'end', false], [39, ['Sonntage nach', 'Trinitatis'], 250, 390, 'end', false], [44.5, ['Erntedank'], 290, 240, 'end', false],
  [48.3, ['Reformationstag (31.10.)'], 370, 206, 'end', false], [48.5, ['Allerheiligen (1.11.)'], 385, 166, 'end', false], [51.5, ['Ewigkeitssonntag / Totensonntag'], 470, 128, 'end', false]];
B.re_kirchenjahr = { name: 'Kirchenjahr', gruppe: 'Religion', def: { namen: true, legende: true },
  felder: [{ k: 'namen', l: 'Feste und Zeiten beschriften (aus = leer)', typ: 'check' }, { k: 'legende', l: 'Bedeutung der Farben zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, cx = 500, cy = 400, R = 230, ri = 80, gr = w => w * 360 / 52, pt = (r, a) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
    let s = '';
    KJ_ABSCHNITTE.forEach(([w1, w2, col]) => { const a1 = gr(w1), a2 = gr(w2), gb = a2 - a1 > 180 ? 1 : 0, [x1, y1] = pt(R, a1), [x2, y2] = pt(R, a2), [x3, y3] = pt(ri, a2), [x4, y4] = pt(ri, a1);
      s += `<path d="M ${f(x1)} ${f(y1)} A ${R} ${R} 0 ${gb} 1 ${f(x2)} ${f(y2)} L ${f(x3)} ${f(y3)} A ${ri} ${ri} 0 ${gb} 0 ${f(x4)} ${f(y4)} Z" fill="${col}" stroke="#455a64" stroke-width="1.5"/>`; });
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#455a64" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${ri}" fill="none" stroke="#455a64" stroke-width="3"/>`;
    { const [x1, y1] = pt(ri - 6, 0), [x2, y2] = pt(R + 14, 0); s += linie(x1, y1, x2, y2, P.ink, 5); }
    s += mitte(cx, cy, 'Kirchenjahr', 22, P.ink, fett);
    KJ_FESTE.forEach(([w, zl, lx, ly, anker, dick]) => { const a = gr(w), [x1, y1] = pt(R - 10, a), [x2, y2] = pt(R + 8, a);
      s += linie(x1, y1, x2, y2, P.ink, 3);
      if (!d.namen) return;
      const ex = anker === 'start' ? lx - 6 : anker === 'end' ? lx + 6 : lx, ey = anker === 'middle' ? ly - 14 : ly;
      s += linie(x2, y2, ex, ey, tc(P, GRAU), 1.5);
      zl.forEach((z, j) => { s += text(lx, ly + j * 25, z, 19, P.ink, `text-anchor="${anker}" ` + (dick ? fett : '')); }); });
    let H = 720;
    if (d.legende) {
      [[VIO, 'violett', 'Vorbereitung, Buße'], [WEISS, 'weiß', 'Christusfeste, Freude'], [ROTL, 'rot', 'Heiliger Geist, Kirche'], [GRUENL, 'grün', 'Wachstum, Alltag']].forEach(([col, n, bed], i) => { const x = 30 + i * 240;
        s += `<rect x="${x}" y="738" width="28" height="28" rx="5" fill="${col}" stroke="#455a64" stroke-width="2"/>` + text(x + 38, 752, n, 20, P.ink, fett) + text(x + 38, 780, bed, 18, P.ink); });
      s += `<rect x="30" y="806" width="28" height="28" rx="5" fill="${SCHWARZ}" stroke="#455a64" stroke-width="2"/>` + text(68, 820, 'Karfreitag: schwarz (evangelisch), rot (katholisch)', 18, P.ink);
      H = 860;
    }
    return tafel('Das Kirchenjahr', W, H, s, P, '⛪');
  } };
B.re_kirchenjahr.schnell = [umschalt('🏷 Namen ein/aus', 'namen'), umschalt('🎨 Farben-Legende ein/aus', 'legende')];
KV['re_kirchenjahr:leer'] = { name: 'Kirchenjahr (leer)', d: { namen: false } };

// ---------- Weltreligionen im Vergleich ----------
const RELIGIONEN = [['Judentum', '✡', BLAU, '#e3f2fd', [['Tanach', '(mit der Tora)'], ['Synagoge'], ['Pessach', 'Jom Kippur', 'Chanukka'], ['Stammvater', 'Abraham; Mose']]],
  ['Christentum', '✝', LILA, '#f3e5f5', [['Bibel (Altes und', 'Neues Testament)'], ['Kirche'], ['Weihnachten', 'Ostern', 'Pfingsten'], ['Jesus Christus']]],
  ['Islam', '☪', GRUEN, '#e8f5e9', [['Koran'], ['Moschee'], ['Fest des', 'Fastenbrechens', 'Opferfest'], ['Prophet', 'Mohammed', '(7. Jh. n. Chr.)']]],
  ['Hinduismus', '🕉', ORANGE, '#fff3e0', [['Veden,', 'Bhagavad Gita'], ['Tempel'], ['Diwali', 'Holi'], ['kein Gründer,', 'entstand in', 'Indien']]],
  ['Buddhismus', '☸', '#a1740f', '#fff8e1', [['Tipitaka', '(Pali-Kanon)'], ['Tempel,', 'Kloster'], ['Vesakh'], ['Siddhartha', 'Gautama', '(der Buddha)']]]];
const REL_ZEILEN = [['Heilige', 'Schrift'], ['Gotteshaus /', 'Tempel'], ['Feste'], ['Gründer /', 'Ursprung']];
B.re_weltreligionen = { name: 'Weltreligionen im Vergleich', gruppe: 'Religion', def: { leer: false },
  felder: [{ k: 'leer', l: 'Leer (nur Symbole und Zeilentitel)', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 625, xs = 160, sb = 166, yk = 75, hk = 115, zh = 100; let s = '';
    RELIGIONEN.forEach(([n, sym, col, fuell, zellen], i) => { const x = xs + i * sb, xm = x + sb / 2;
      s += box(x + 3, yk, sb - 6, hk + 4 * zh + 10, col, fuell, 12, 2.5);
      s += mitte(xm, yk + 42, sym, 46, col) + mitte(xm, yk + 92, n, 20, col, fett);
      if (!d.leer) zellen.forEach((zl, r) => { const ym = yk + hk + 10 + r * zh + zh / 2; zl.forEach((z, j) => { s += mitte(xm, ym + (j - (zl.length - 1) / 2) * 24, z, 18, DK); }); });
    });
    REL_ZEILEN.forEach((zl, r) => { const yo = yk + hk + 10 + r * zh, ym = yo + zh / 2;
      s += linie(30, yo, 970, yo, GRAU, 1.5, 'stroke-dasharray="6 5"');
      zl.forEach((z, j) => { s += text(30, ym + (j - (zl.length - 1) / 2) * 25, z, 20, P.ink, fett); }); });
    return tafel('Weltreligionen im Vergleich', W, H, s, P, '🕊️');
  } };
B.re_weltreligionen.schnell = [umschalt('🧹 Leer ein/aus', 'leer')];
KV['re_weltreligionen:leer'] = { name: 'Weltreligionen im Vergleich (leer)', d: { leer: true } };

// ---------- Dilemma-Diskussion ----------
B.re_dilemma = { name: 'Dilemma-Diskussion', gruppe: 'Religion', def: { dilemma: '', frage: '' },
  felder: [{ k: 'dilemma', l: 'Dilemma (leer = Fläche zum Hineinschreiben)', typ: 'text' }, { k: 'frage', l: 'Entscheidungsfrage (optional)', typ: 'text' }],
  gen: (d, P) => {
    const W = 1000, H = 780; let s = '';
    s += box(30, 70, 940, 165, BLAU, '#e3f2fd', 14) + text(50, 96, 'Das Dilemma:', 20, BLAU, fett);
    s += umbruch(d.dilemma || '', 80).slice(0, 3).map((z, i) => text(50, 128 + i * 27, z, 21, DK)).join('');
    if (d.frage) s += text(50, 212, d.frage, 21, DK, fett);
    [[30, '👍 Pro – dafür spricht …', GRUEN, '#e8f5e9'], [510, '👎 Contra – dagegen spricht …', ROT, '#ffebee']].forEach(([x, n, col, fuell]) => {
      s += box(x, 250, 460, 255, col, fuell, 14) + text(x + 20, 280, n, 22, col, fett);
      for (let i = 0; i < 4; i++) s += linie(x + 20, 340 + i * 44, x + 440, 340 + i * 44, col, 1.2, 'stroke-dasharray="6 6" opacity=".6"'); });
    s += text(30, 540, 'Meine Entscheidung', 22, P.ink, fett);
    ['#ef5350', '#ffab91', '#fff59d', '#c5e1a5', '#66bb6a'].forEach((col, i) => { s += `<rect x="${100 + i * 160}" y="575" width="160" height="34" fill="${col}" stroke="#455a64" stroke-width="1.5"/>`; });
    for (let i = 0; i < 9; i++) s += `<circle cx="${100 + i * 100}" cy="592" r="13" fill="#ffffff" stroke="#455a64" stroke-width="2.5"/>`;
    s += mitte(100, 637, 'auf keinen Fall', 20, tc(P, ROT), fett) + mitte(500, 637, 'unentschieden', 19, tc(P, GRAU)) + mitte(900, 637, 'auf jeden Fall', 20, tc(P, GRUEN), fett);
    s += text(30, 690, 'Begründung: Ich habe mich so entschieden, weil …', 21, P.ink, fett);
    s += linie(30, 745, 970, 745, GRAU, 1.5, 'stroke-dasharray="8 6"');
    return tafel('Dilemma-Diskussion', W, H, s, P, '🤔');
  } };

// ======================= METHODEN =======================

// ---------- Think – Pair – Share ----------
const TPS = [['💭', 'Think', 'Denken – allein', BLAU, '#e3f2fd', ['Denke allein über die Aufgabe nach.', 'Notiere deine Ideen in Stichworten.']],
  ['👥', 'Pair', 'Austauschen – zu zweit', ORANGE, '#fff3e0', ['Tausche dich mit deinem Partner oder deiner Partnerin aus.', 'Ergänzt eure Notizen.']],
  ['🗣️', 'Share', 'Vorstellen – in der Klasse', GRUEN, '#e8f5e9', ['Stellt eure Ergebnisse der Klasse vor.', 'Hört zu und ergänzt.']]];
B.me_tps = { name: 'Think – Pair – Share', gruppe: 'Methoden', def: { anweisung: true, z1: '', z2: '', z3: '' },
  felder: [{ k: 'anweisung', l: 'Arbeitsanweisungen zeigen', typ: 'check' }, { k: 'z1', l: 'Zeit Think (z. B. 3 Min.)', typ: 'text' }, { k: 'z2', l: 'Zeit Pair', typ: 'text' }, { k: 'z3', l: 'Zeit Share', typ: 'text' }],
  gen: (d, P) => {
    const W = 1000, H = 560, y = 75; let s = '';
    TPS.forEach(([ic, n, de, col, fuell, anw], i) => { const x = 30 + i * 325, xm = x + 145, zeit = d['z' + (i + 1)];
      s += box(x, y, 290, 450, col, fuell, 16, 3) + mitte(xm, y + 55, ic, 50, '#000') + mitte(xm, y + 120, n, 32, col, fett) + mitte(xm, y + 156, de, 20, DK, fett);
      if (d.anweisung) { let yy = y + 200; anw.forEach(a => { s += zeilenText(xm, yy, a, 24, 19, DK, 25, '', true); yy += umbruch(a, 24).length * 25 + 8; }); }
      s += box(x + 18, y + 370, 254, 62, col, '#ffffff', 10, 2) + text(x + 34, y + 401, '⏱ Zeit:', 20, DK, fett);
      if (zeit) s += text(x + 130, y + 401, zeit, 22, DK, fett);
      else s += linie(x + 130, y + 414, x + 255, y + 414, GRAU, 1.5, 'stroke-dasharray="6 5"');
      if (i < 2) s += pfeil(x + 294, y + 225, x + 322, y + 225, GRAU, 5); });
    return tafel('Think – Pair – Share', W, H, s, P, '💭');
  } };
B.me_tps.schnell = [umschalt('💡 Anweisungen ein/aus', 'anweisung')];
KV['me_tps:leer'] = { name: 'Think – Pair – Share (leer)', d: { anweisung: false } };

// ---------- Placemat ----------
B.me_placemat = { name: 'Placemat', gruppe: 'Methoden', def: { thema: '', n: 4, hinweis: true },
  felder: [{ k: 'thema', l: 'Thema', typ: 'text' }, { k: 'n', l: 'Anzahl Personen (Außenfelder)', typ: 'zahl', min: 3, max: 6 }, { k: 'hinweis', l: 'Ablauf unten zeigen', typ: 'check' }],
  gen: (d, P) => {
    const n = Math.round(T.clamp(+d.n || 4, 3, 6)), W = 1000, H = d.hinweis ? 815 : 750, cx = 500, cy = 420, A = 460, Bh = 305, a = 170, b = 110; let s = '';
    s += text(30, 88, 'Thema:', 22, P.ink, fett);
    if (d.thema) s += text(115, 88, d.thema, 22, P.ink);
    else s += linie(115, 100, 700, 100, GRAU, 1.5, 'stroke-dasharray="6 5"');
    s += box(cx - A, cy - Bh, 2 * A, 2 * Bh, RAND, 'none', 10, 3.5);
    const tRand = (phi, ha, hb) => Math.min(ha / Math.max(Math.abs(Math.cos(phi)), 1e-9), hb / Math.max(Math.abs(Math.sin(phi)), 1e-9));
    if (n === 4) for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) s += linie(cx + sx * a, cy + sy * b, cx + sx * A, cy + sy * Bh, RAND, 3);
    else for (let k = 0; k < n; k++) { const phi = (-90 + (k + 0.5) * 360 / n) * Math.PI / 180, ti = tRand(phi, a, b), to = tRand(phi, A, Bh);
      s += linie(cx + ti * Math.cos(phi), cy + ti * Math.sin(phi), cx + to * Math.cos(phi), cy + to * Math.sin(phi), RAND, 3); }
    for (let k = 0; k < n; k++) { const phi = (-90 + k * 360 / n) * Math.PI / 180, r = tRand(phi, A, Bh) - 42, x = cx + r * Math.cos(phi), y = cy + r * Math.sin(phi);
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="20" fill="${RAND}"/>` + mitte(x, y + 1, String(k + 1), 21, '#ffffff', fett); }
    s += box(cx - a, cy - b, 2 * a, 2 * b, ORANGE, '#fff8e1', 12, 3) + mitte(cx, cy - b + 26, 'Gruppenergebnis', 20, ORANGE, fett);
    if (d.hinweis) { s += text(30, 755, 'Jede Person schreibt zuerst still in ihr eigenes Feld.', 20, P.ink);
      s += text(30, 785, 'Dann einigt sich die Gruppe und schreibt das Wichtigste in die Mitte.', 20, P.ink); }
    return tafel('Placemat', W, H, s, P, '🧩');
  } };
B.me_placemat.schnell = [{ l: '＋ Feld', f: dd => ({ d: { ...dd, n: Math.min(6, (+dd.n || 4) + 1) } }) }, { l: '− Feld', f: dd => ({ d: { ...dd, n: Math.max(3, (+dd.n || 4) - 1) } }) }, umschalt('💡 Ablauf ein/aus', 'hinweis')];

// ---------- Lerntempoduett ----------
const LTD = [['✏️', 'Einzelarbeit', BLAU, '#e3f2fd', 'Bearbeite die Aufgabe allein in deinem Tempo.'],
  ['', 'Bushaltestelle', '#2e7d32', '#e8f5e9', 'Wer fertig ist, geht zur Bushaltestelle und wartet dort auf eine Partnerin oder einen Partner.'],
  ['👥', 'Partnerarbeit', ORANGE, '#fff3e0', 'Setzt euch zusammen. Vergleicht und besprecht eure Ergebnisse.'],
  ['📄', 'Nächste Aufgabe', LILA, '#f3e5f5', 'Holt euch die nächste Aufgabe und arbeitet wieder allein weiter.']];
B.me_lerntempo = { name: 'Lerntempoduett (Bushaltestelle)', gruppe: 'Methoden', def: { anweisung: true },
  felder: [{ k: 'anweisung', l: 'Arbeitsanweisungen zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 600, y = 75; let s = '';
    LTD.forEach(([ic, n, col, fuell, anw], i) => { const x = 30 + i * 240, xm = x + 107;
      s += box(x, y, 215, 380, col, fuell, 16, 3) + `<circle cx="${x + 24}" cy="${y + 24}" r="16" fill="${col}"/>` + mitte(x + 24, y + 25, String(i + 1), 19, '#ffffff', fett);
      if (ic) s += mitte(xm, y + 75, ic, 52, '#000');
      else { const sx = xm, sy = y + 62;
        s += `<rect x="${sx - 4}" y="${sy}" width="8" height="72" fill="#78909c"/><circle cx="${sx}" cy="${sy}" r="42" fill="#ffd600" stroke="#2e7d32" stroke-width="6"/>`;
        s += `<path d="M ${sx - 14} ${sy - 20} L ${sx - 14} ${sy + 20} M ${sx + 14} ${sy - 20} L ${sx + 14} ${sy + 20} M ${sx - 14} ${sy} L ${sx + 14} ${sy}" stroke="#2e7d32" stroke-width="7" stroke-linecap="round" fill="none"/>`; }
      s += mitte(xm, y + 162, n, 22, col, fett);
      if (d.anweisung) s += zeilenText(xm, y + 200, anw, 19, 19, DK, 25, '', true);
      if (i < 3) s += pfeil(x + 217, y + 190, x + 238, y + 190, GRAU, 4); });
    s += `<path d="M 857 455 L 857 500 L 137 500 L 137 472" fill="none" stroke="${GRAU}" stroke-width="4" stroke-linejoin="round"/>` + pfeil(137, 480, 137, 457, GRAU, 4);
    s += mitte(497, 525, 'und wieder von vorn', 20, P.ink, fett);
    s += text(30, 568, 'Alle arbeiten im eigenen Tempo. Wer gleich schnell ist, arbeitet zusammen.', 20, P.ink);
    return tafel('Lerntempoduett', W, H, s, P, '🚏');
  } };
B.me_lerntempo.schnell = [umschalt('💡 Anweisungen ein/aus', 'anweisung')];
KV['me_lerntempo:leer'] = { name: 'Lerntempoduett (leer)', d: { anweisung: false } };

// ---------- Ich – Du – Wir ----------
const figur = (x, y, sk, col) => `<circle cx="${f(x)}" cy="${f(y - 14 * sk)}" r="${f(9 * sk)}" fill="${col}"/><path d="M ${f(x - 15 * sk)} ${f(y + 16 * sk)} Q ${f(x - 15 * sk)} ${f(y - 2 * sk)} ${f(x)} ${f(y - 2 * sk)} Q ${f(x + 15 * sk)} ${f(y - 2 * sk)} ${f(x + 15 * sk)} ${f(y + 16 * sk)} Z" fill="${col}"/>`;
const IDW = [['Ich', 'allein', 105, 165, 1, BLAU, '#e3f2fd', 'Ich denke allein nach und notiere meine Ideen.'],
  ['Du', 'zu zweit', 130, 450, 2, ORANGE, '#fff3e0', 'Ich tausche mich mit meinem Partner oder meiner Partnerin aus.'],
  ['Wir', 'in der Gruppe', 155, 785, 4, GRUEN, '#e8f5e9', 'Wir besprechen alles in der Gruppe und einigen uns auf ein Ergebnis.']];
B.me_ichduwir = { name: 'Ich – Du – Wir', gruppe: 'Methoden', def: { leitsatz: true },
  felder: [{ k: 'leitsatz', l: 'Leitsätze zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 600, cy = 290; let s = '';
    IDW.forEach(([n, sub, r, cx, anz, col, fuell, satz], i) => {
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fuell}" stroke="${col}" stroke-width="4"/>` + mitte(cx, cy - 38, n, 46, col, fett) + mitte(cx, cy + 4, sub, 20, DK, fett);
      for (let k = 0; k < anz; k++) s += figur(cx + (k - (anz - 1) / 2) * 38, cy + 52, 1.1, col);
      if (d.leitsatz) s += zeilenText(cx, cy + 190, satz, 24, 20, P.ink, 27, '', true);
      if (i < 2) { const nx = IDW[i + 1]; s += pfeil(cx + r + 6, cy, nx[3] - nx[2] - 6, cy, GRAU, 5); } });
    return tafel('Ich – Du – Wir', W, H, s, P, '👥');
  } };
B.me_ichduwir.schnell = [umschalt('💡 Leitsätze ein/aus', 'leitsatz')];
KV['me_ichduwir:leer'] = { name: 'Ich – Du – Wir (leer)', d: { leitsatz: false } };

// ---------- Vier-Ecken-Methode ----------
B.me_viereecken = { name: 'Vier-Ecken-Methode', gruppe: 'Methoden', def: { frage: '', pa: '', pb: '', pc: '', pd: '', hinweis: true },
  felder: [{ k: 'frage', l: 'Frage (Mitte)', typ: 'text' }, { k: 'pa', l: 'Ecke A', typ: 'text' }, { k: 'pb', l: 'Ecke B', typ: 'text' }, { k: 'pc', l: 'Ecke C', typ: 'text' }, { k: 'pd', l: 'Ecke D', typ: 'text' },
    { k: 'hinweis', l: 'Ablauf unten zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = d.hinweis ? 770 : 720, wand = '#5d4037'; let s = '';
    s += `<path d="M 450 695 L 110 695 L 110 75 L 890 75 L 890 695 L 530 695" fill="none" stroke="${wand}" stroke-width="9" stroke-linejoin="round"/>`;
    s += linie(450, 695, 450, 617, wand, 3) + `<path d="M 450 617 A 78 78 0 0 1 528 695" fill="none" stroke="${wand}" stroke-width="2" stroke-dasharray="6 5"/>`;
    [['A', 'pa', 130, 95, BLAU, '#e3f2fd'], ['B', 'pb', 570, 95, GRUEN, '#e8f5e9'], ['C', 'pc', 130, 495, ORANGE, '#fff3e0'], ['D', 'pd', 570, 495, LILA, '#f3e5f5']].forEach(([L, k, x, y, col, fuell]) => {
      s += box(x, y, 300, 180, col, fuell, 14, 3) + `<circle cx="${x + 32}" cy="${y + 32}" r="24" fill="${col}"/>` + mitte(x + 32, y + 33, L, 28, '#ffffff', fett);
      if (d[k]) s += umbruch(d[k], 21).slice(0, 5).map((z, i) => text(x + 68, y + 32 + i * 27, z, 20, DK, fett)).join(''); });
    s += box(320, 315, 360, 155, ORANGE, '#fff8e1', 14, 3) + mitte(500, 337, 'Frage', 19, ORANGE, fett);
    if (d.frage) s += umbruch(d.frage, 28).slice(0, 4).map((z, i) => mitte(500, 372 + i * 27, z, 21, DK, fett)).join('');
    if (d.hinweis) s += text(30, 735, 'Geht in die Ecke, die eurer Meinung entspricht. Tauscht euch dort aus und begründet eure Wahl.', 19, P.ink);
    return tafel('Vier-Ecken-Methode', W, H, s, P, '🔲');
  } };
B.me_viereecken.schnell = [umschalt('💡 Ablauf ein/aus', 'hinweis')];
})();
