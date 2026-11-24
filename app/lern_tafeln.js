// Tafel-App – 🎒 Lern- und Heftvorlagen für Schülerinnen und Schüler (gemeinsam für Lehrkräfte- und Schüler-Version, braucht vorlagen-kern.js)
//   Kompetenzraster, Lernzettel, Fehlerprotokoll, Lernkarten (+ Leitner-Kasten), Lesemethode in 5 Schritten, Lerntagebuch, Wochen-Lernzeitplan.
//   Tafel und Notizheft – Strukturen zum Hineinschreiben mit dem Stift, kein Aufgabengenerator. Seitengriffe ↔ ↕ über T.VL.dehnen.
//   Ladereihenfolge: NACH vorlagen-kern.js.
'use strict';
(function () {
const B = T.BAUSTEINE; if (!B || !T._svg || !T.VL) return;
const { f, t, fett, linien, kasten, blatt, kopf, ABST, anz, breite, THEMA, kopfFelder, abschnitte, zeilenNeu, dehnen: DEHNEN } = T.VL;
const { BLAU, GRUEN, ORANGE, LILA, LINIE, RAND } = T.VL.farben;
const DUNKEL = '#1b1f2a', ROT = '#c62828', TUERKIS = '#00838f', BRAUN = '#b45309';
const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};
const mitte = 'text-anchor="middle"', ende = 'text-anchor="end"';
const band = (x, y, w, h, col) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="12" fill="${col}" opacity=".12"/>`;
const strich = (x1, y1, x2, y2, col, sw = 1.5, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${sw}" ${extra}/>`;
const liste = v => String(v || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean);
const umbruch = (s, max) => { const z = []; let a = '';
  for (const w of String(s).trim().split(/\s+/)) { if (a && (a + ' ' + w).length > max) { z.push(a); a = w; } else a = a ? a + ' ' + w : w; }
  if (a) z.push(a); return z; };
const breiteMin = (d, std, min) => Math.max(min, breite(d, std));
const zeileMehr = (k, lo, hi) => [{ l: '＋ Zeile', f: dd => ({ d: { ...dd, zeilen: Math.min(hi, (+dd.zeilen || B[k].def.zeilen) + 1) } }) },
  { l: '− Zeile', f: dd => ({ d: { ...dd, zeilen: Math.max(lo, (+dd.zeilen || B[k].def.zeilen) - 1) } }) }];

// 😊 😐 😟 antippen: gewähltes Gesicht hervorgehoben, die anderen blass; nochmal antippen = abwählen. Speicher: d.wahl = { gruppe: 0|1|2 }
const GESICHTER = ['😊', '😐', '😟'];
const smileys = (x0, cy, gap, gruppe, wahl, teile, gr = 30) => { let s = ''; const w = wahl ? wahl[gruppe] : undefined;
  GESICHTER.forEach((g, i) => { const x = x0 + i * gap, an = w === i;
    if (an) s += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(gap * 0.46)}" fill="#fff3c4" stroke="${ORANGE}" stroke-width="3"/>`;
    s += t(x, cy + 1, g, gr, DUNKEL, mitte + (w != null && !an ? ' opacity=".3"' : ''));
    teile.push({ id: gruppe + '_' + i, x: x - gap / 2, y: cy - gap / 2, w: gap, h: gap }); });
  return s; };
const smileyTippen = (o, id) => { const [g, s] = String(id).split('_');
  T.bausteinAendern(o, { f: dd => { const w = { ...(dd.wahl || {}) }; if (w[g] === +s) delete w[g]; else w[g] = +s; return { d: { ...dd, wahl: w } }; } }); };
const haken = (bx, by, an) => `<rect x="${f(bx)}" y="${f(by)}" width="36" height="36" rx="8" fill="${an ? GRUEN : '#ffffff'}" stroke="${an ? GRUEN : DUNKEL}" stroke-width="2.5"/>` +
  (an ? `<path d="M ${f(bx + 8)} ${f(by + 18)} l 7 8 l 13 -17" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : '');
const spitze = (x, y, a, col, g = 18) => { const p = da => [x - g * Math.cos(a + da), y - g * Math.sin(a + da)], [ax, ay] = p(0.45), [bx, by] = p(-0.45);
  return `<path d="M ${f(x)} ${f(y)} L ${f(ax)} ${f(ay)} L ${f(bx)} ${f(by)} Z" fill="${col}"/>`; };

// ---------- 1 🎯 Kompetenzraster / Selbsteinschätzung ----------
B.ln_kompetenz = { name: 'Kompetenzraster – Selbsteinschätzung', gruppe: 'Struktur', def: { thema: '', zeilen: 6, ich: '', wahl: {} },
  felder: [THEMA, { k: 'ich', l: 'Ich kann … (je Zeile ein Satz; leer = Linien zum Schreiben)', typ: 'liste' }, { k: 'zeilen', l: 'Zeilen', typ: 'zahl', min: 3, max: 20 }],
  gen: d => {
    const ich = liste(d.ich), n = Math.min(20, Math.max(anz(d, 3, 20, 6), ich.length)), W = breiteMin(d, 1150, 1000), teile = [];
    const xS = W - 250, xN = xS - 190, xV = xN - 190, y0 = 140, hK = 54, maxZ = Math.max(12, Math.floor((xV - 56) / 11));
    const zeilen = Array.from({ length: n }, (_, i) => ich[i] ? umbruch(ich[i], maxZ) : null), hoehe = zeilen.map(z => z ? Math.max(92, 32 + z.length * 30) : 92);
    const hT = hK + hoehe.reduce((a, b) => a + b, 0), H = y0 + hT + 80;
    let s = kopf(d, W, '🎯 KOMPETENZRASTER – SELBSTEINSCHÄTZUNG');
    s += kasten(20, y0, W - 40, hT, BLAU) + band(20, y0, W - 40, hK, BLAU);
    s += t(36, y0 + hK / 2, 'Ich kann …', 21, BLAU, fett) + t(xV + 95, y0 + hK / 2, 'vorher', 21, BLAU, mitte + ' ' + fett) +
      t(xN + 95, y0 + hK / 2, 'nachher', 21, BLAU, mitte + ' ' + fett) + t(xS + 16, y0 + hK / 2, 'So übe ich:', 21, BLAU, fett);
    for (const x of [xV, xN, xS]) s += strich(x, y0, x, y0 + hT, BLAU);
    let y = y0 + hK;
    zeilen.forEach((z, i) => { const zh = hoehe[i], cy = y + zh / 2;
      s += strich(20, y, W - 20, y, BLAU, i ? 1 : 1.5, i ? 'opacity=".5"' : '');
      if (z) z.forEach((zz, j) => { s += t(36, cy - (z.length - 1) * 15 + j * 30, zz, 21, DUNKEL); });
      else s += t(36, y + 28, 'Ich kann', 20, DUNKEL) + strich(130, y + 40, xV - 16, y + 40, LINIE) + strich(36, y + 80, xV - 16, y + 80, LINIE);
      s += smileys(xV + 95 - 56, cy, 56, 'v' + i, d.wahl, teile) + smileys(xN + 95 - 56, cy, 56, 'n' + i, d.wahl, teile);
      s += strich(xS + 14, y + 40, W - 34, y + 40, LINIE) + strich(xS + 14, y + 80, W - 34, y + 80, LINIE);
      y += zh; });
    const yL = y0 + hT + 40, sp = (W - 60) / 3;
    [['😊', 'Das kann ich gut.'], ['😐', 'Das kann ich schon etwas.'], ['😟', 'Das kann ich noch nicht.']].forEach(([g, l], i) => { s += t(30 + i * sp, yL, g + ' ' + l, 20, DUNKEL); });
    return { svg: blatt(W, H, s), w: W, h: H, teile };
  } };
B.ln_kompetenz.tippen = smileyTippen;
B.ln_kompetenz.schnell = zeileMehr('ln_kompetenz', 3, 20).concat([{ l: '↺ Smileys zurücksetzen', f: dd => ({ d: { ...dd, wahl: {} } }) }]);

// ---------- 2 🗒 Lernzettel ----------
B.ln_lernzettel = { name: 'Lernzettel', gruppe: 'Struktur', def: { thema: '', zeilen: 4 },
  felder: [THEMA, { k: 'zeilen', l: 'Anzahl Begriffe', typ: 'zahl', min: 2, max: 15 }],
  gen: d => {
    const n = anz(d, 2, 15, 4), W = breiteMin(d, 1000, 800), y0 = 140, zh = 88, xT = 300, hB = 84 + n * zh + 6;
    let s = kopf(d, W, '🗒 LERNZETTEL');
    s += kasten(20, y0, W - 40, hB, LILA) + t(36, y0 + 26, '📌 Die wichtigsten Begriffe', 21, LILA, fett);
    s += t(36, y0 + 64, 'Begriff', 20, DUNKEL, fett) + t(xT + 16, y0 + 64, 'Erklärung in eigenen Worten', 20, DUNKEL, fett);
    s += strich(xT, y0 + 46, xT, y0 + hB, LILA);
    for (let i = 0; i < n; i++) { const y = y0 + 84 + i * zh;
      s += strich(20, y, W - 20, y, LILA, 1, 'opacity=".5"') + strich(36, y + 62, xT - 16, y + 62, LINIE) + linien(xT + 16, W - 36, y + 40, 2, 40); }
    const a = abschnitte(W, y0 + hB + 16, [['✏️ Beispiel / Skizze', BLAU, 0, 260], ['💡 Merke!', ORANGE, 3], ['❓ Meine Frage dazu', GRUEN, 2]]);
    s += a.s; const H = a.y + 4;
    return { svg: blatt(W, H, s), w: W, h: H };
  } };
B.ln_lernzettel.schnell = zeileMehr('ln_lernzettel', 2, 15);

// ---------- 3 🔎 Fehlerprotokoll ----------
B.ln_fehler = { name: 'Fehlerprotokoll', gruppe: 'Struktur', def: { zeilen: 8 },
  felder: [{ k: 'zeilen', l: 'Zeilen', typ: 'zahl', min: 3, max: 30 }],
  gen: d => {
    const n = anz(d, 3, 30, 8), W = breiteMin(d, 1300, 1200), zh = 92, wD = 200, w3 = (W - 40 - wD) / 3;
    let s = t(30, 40, '🔎 FEHLERPROTOKOLL', 20, RAND, fett);
    const kf = kopfFelder(W, 84, ['Name', 'Klasse']); s += kf.s;
    s += t(30, kf.y + 8, 'Aus Fehlern lerne ich: Was war falsch? Wie ist es richtig? Was merke ich mir?', 20, DUNKEL);
    const y0 = kf.y + 40, hK = 54, hT = hK + n * zh, H = y0 + hT + 24;
    const spalten = [['Datum / Fach', RAND, 20, wD], ['❌ Mein Fehler', ROT, 20 + wD, w3], ['✅ So ist es richtig', GRUEN, 20 + wD + w3, w3], ['💡 Das merke ich mir (Tipp)', BRAUN, 20 + wD + 2 * w3, w3]];
    s += kasten(20, y0, W - 40, hT, RAND);
    spalten.forEach(([l, col, x, w], i) => { s += `<rect x="${f(x)}" y="${y0}" width="${f(w)}" height="${hK}" fill="${col}" opacity=".1"/>` + t(x + 14, y0 + hK / 2, l, 21, col, fett);
      if (i) s += strich(x, y0, x, y0 + hT, RAND); });
    for (let r = 0; r < n; r++) { const y = y0 + hK + r * zh;
      s += strich(20, y, W - 20, y, RAND, r ? 1 : 2, r ? 'opacity=".5"' : '');
      for (const [, , x, w] of spalten) s += linien(x + 14, x + w - 14, y + 42, 2, 42); }
    return { svg: blatt(W, H, s), w: W, h: H };
  } };
B.ln_fehler.schnell = zeileMehr('ln_fehler', 3, 30);

// ---------- 4 🃏 Lernkarten (alle Fächer) + 🗃 Leitner-Kasten ----------
const kartenAnz = d => [4, 6, 8].includes(+d.anzahl) ? +d.anzahl : 6;
const kartenPaare = d => liste(d.karten).map(z => { const p = z.split(/\s*(?:;| = | – | - )\s*/); return [p[0] || '', p.slice(1).join(' ')]; });
const kartenText = (txt, cx, yA, yB, w, col) => { /* Text mittig im Feld, umbrochen; gibt '' zurück, wenn kein Text */
  if (!txt) return ''; const z = umbruch(txt, Math.max(8, Math.floor(w / 12.5))).slice(0, Math.max(1, Math.floor((yB - yA) / 30)));
  let s = ''; const cy = (yA + yB) / 2; z.forEach((zz, j) => { s += t(cx, cy - (z.length - 1) * 15 + j * 30, zz, 23, col, mitte + ' ' + fett); }); return s; };
const leerLinien = (x0, x1, yA, yB) => { const k = Math.max(1, Math.floor((yB - yA) / ABST)); return linien(x0, x1, yA + ABST * 0.8, k, ABST); };
const LEITNER = [['Fach 1', 'täglich', ROT, '#ffebee'], ['Fach 2', 'alle 2 Tage', ORANGE, '#fff3e0'], ['Fach 3', 'wöchentlich', '#f9a825', '#fffde7'],
  ['Fach 4', 'alle 2 Wochen', '#7cb342', '#f1f8e9'], ['Fach 5', 'monatlich', GRUEN, '#e8f5e9']];
const leitner = d => {
  const W = breiteMin(d, 1400, 1200), bw = (W - 60 - 4 * 24) / 5, yb = 250, bh = 190, yr = yb + bh + 56;
  let s = t(30, 46, '🗃 Der Leitner-Kasten: So lerne ich mit Lernkarten', 30, DUNKEL, fett);
  s += t(W / 2, 112, '✅ gewusst → ein Fach weiter', 24, GRUEN, mitte + ' ' + fett);
  LEITNER.forEach(([fach, wann, col, hell], i) => { const x = 30 + i * (bw + 24);
    for (let k = 0; k < 3; k++) s += `<rect x="${f(x + 22 + k * 14)}" y="${f(yb - 34 + k * 9)}" width="${f(bw - 70)}" height="70" rx="6" fill="#ffffff" stroke="${col}" stroke-width="2"/>`;
    s += `<rect x="${f(x)}" y="${yb}" width="${f(bw)}" height="${bh}" rx="14" fill="${hell}" stroke="${col}" stroke-width="3"/>`;
    s += t(x + bw / 2, yb + 62, fach, 28, DUNKEL, mitte + ' ' + fett) + t(x + bw / 2, yb + 112, 'wiederholen:', 20, DUNKEL, mitte) + t(x + bw / 2, yb + 146, wann, 22, DUNKEL, mitte + ' ' + fett);
    if (i < 4) { const x1 = x + bw * 0.68, x2 = x + bw + 24 + bw * 0.32, ym = yb - 120;
      s += `<path d="M ${f(x1)} ${yb - 44} Q ${f((x1 + x2) / 2)} ${ym} ${f(x2)} ${yb - 44}" fill="none" stroke="${GRUEN}" stroke-width="5" stroke-linecap="round"/>` + spitze(x2, yb - 40, Math.atan2(yb - 44 - ym, x2 - (x1 + x2) / 2), GRUEN); }
    if (i > 0) s += strich(x + bw / 2, yb + bh, x + bw / 2, yr, ROT, 5, 'stroke-linecap="round"'); });
  const xa = 30 + bw / 2, xe = 30 + 4 * (bw + 24) + bw / 2;
  s += strich(xa, yr, xe, yr, ROT, 5, 'stroke-linecap="round"') + strich(xa, yr, xa, yb + bh + 18, ROT, 5, 'stroke-linecap="round"') + spitze(xa, yb + bh + 4, -Math.PI / 2, ROT, 22);
  s += t(W / 2, yr + 40, '❌ nicht gewusst → zurück in Fach 1', 24, ROT, mitte + ' ' + fett);
  const yS = yr + 84, schritte = ['Neue Karten kommen in Fach 1.', 'Karte nehmen, Frage lesen, Antwort sagen – dann umdrehen und vergleichen.',
    'Gewusst: Die Karte kommt ein Fach weiter. Nicht gewusst: Sie kommt zurück in Fach 1.', 'Wiederhole jedes Fach so oft, wie es auf dem Fach steht.', 'Eine Karte aus Fach 5 gewusst? Dann kannst du sie sicher.'];
  const hS = 56 + schritte.length * 38 + 10;
  s += kasten(20, yS, W - 40, hS, BLAU, 'rgba(21,101,192,.05)') + t(36, yS + 28, '📋 So geht’s', 22, BLAU, fett);
  schritte.forEach((l, i) => { s += t(40, yS + 70 + i * 38, (i + 1) + '.', 21, BLAU, fett) + t(74, yS + 70 + i * 38, l, 21, DUNKEL); });
  const H = yS + hS + 20;
  return { svg: blatt(W, H, s), w: W, h: H };
};
B.ln_karten = { name: 'Lernkarten (alle Fächer)', gruppe: 'Struktur', def: { thema: '', anzahl: '6', art: 'neben', karten: '', umgedreht: [] },
  felder: [{ k: 'thema', l: 'Fach / Thema (leer = Linie zum Schreiben)', typ: 'text' },
    { k: 'art', l: 'Ansicht', typ: 'auswahl', opts: [['neben', 'Vorderseite und Rückseite nebeneinander'], ['drehen', 'Karten zum Umdrehen (↻ antippen)'], ['leitner', 'Leitner-Kasten (Erklärung)']] },
    { k: 'anzahl', l: 'Anzahl Karten', typ: 'auswahl', opts: [['4', '4 Karten'], ['6', '6 Karten'], ['8', '8 Karten']] },
    { k: 'karten', l: 'Karten (je Zeile: Vorderseite ; Rückseite – leer = zum Beschriften mit dem Stift)', typ: 'liste' }],
  gen: d => {
    if (d.art === 'leitner') return leitner(d);
    const A = kartenAnz(d), paare = kartenPaare(d), y0 = 140, teile = [], drehen = d.art === 'drehen';
    const W = breiteMin(d, 1400, 1100), ch = Math.round(T.clamp(+d.kh || (drehen ? 260 : 230), 180, 600));
    let s = kopf(d, W, drehen ? '🃏 LERNKARTEN ZUM UMDREHEN' : '🃏 LERNKARTEN'), H;
    if (!drehen) { const pw = (W - 60) / 2, rows = A / 2;
      for (let i = 0; i < A; i++) { const x = 20 + (i % 2) * (pw + 20), y = y0 + Math.floor(i / 2) * (ch + 20), h2 = pw / 2, [vo, hi] = paare[i] || ['', ''];
        s += kasten(x, y, pw, ch, RAND, '#ffffff', 14) + strich(x + h2, y + 8, x + h2, y + ch - 8, RAND, 2, 'stroke-dasharray="8 6"');
        s += t(x + 14, y + 26, '❓ Vorderseite', 20, BLAU, fett) + t(x + h2 - 14, y + 26, String(i + 1), 20, DUNKEL, ende + ' ' + fett) + t(x + h2 + 14, y + 26, '💡 Rückseite', 20, GRUEN, fett);
        s += vo ? kartenText(vo, x + h2 / 2, y + 48, y + ch - 10, h2 - 28, DUNKEL) : leerLinien(x + 14, x + h2 - 14, y + 48, y + ch - 10);
        s += hi ? kartenText(hi, x + h2 * 1.5, y + 48, y + ch - 10, h2 - 28, DUNKEL) : leerLinien(x + h2 + 14, x + pw - 14, y + 48, y + ch - 10); }
      H = y0 + rows * (ch + 20) + 4;
    } else { const cols = A / 2, cw = (W - 40 - (cols - 1) * 20) / cols, um = new Set(d.umgedreht || []);
      for (let i = 0; i < A; i++) { const x = 20 + (i % cols) * (cw + 20), y = y0 + Math.floor(i / cols) * (ch + 20), r = um.has(i), [vo, hi] = paare[i] || ['', ''];
        const col = r ? GRUEN : BLAU, dunkel = r ? '#1b5e20' : '#0d47a1', txt = r ? hi : vo;
        s += kasten(x, y, cw, ch, col, r ? '#e8f5e9' : '#e3f2fd', 14);
        s += t(x + 14, y + 26, r ? '💡 Antwort' : '❓ Frage / Begriff', 20, dunkel, fett) + t(x + cw - 14, y + 26, String(i + 1), 20, DUNKEL, ende + ' ' + fett);
        s += txt ? kartenText(txt, x + cw / 2, y + 48, y + ch - 64, cw - 28, DUNKEL) : leerLinien(x + 14, x + cw - 14, y + 48, y + ch - 64);
        s += `<rect x="${f(x + cw - 150)}" y="${f(y + ch - 52)}" width="136" height="40" rx="20" fill="${col}"/>` + t(x + cw - 82, y + ch - 31, '↻ umdrehen', 20, '#ffffff', mitte + ' ' + fett);
        teile.push({ id: 'dreh' + i, x: x + cw - 158, y: y + ch - 60, w: 152, h: 56 }); }
      H = y0 + 2 * (ch + 20);
      if (!paare.length) { s += t(30, H + 6, 'Tipp: Frage und Antwort unter ✏️ Bearbeiten eintragen – dann zeigt ↻ die andere Seite.', 19, DUNKEL); H += 34; }
      H += 4; }
    return { svg: blatt(W, H, s), w: W, h: H, teile };
  } };
B.ln_karten.tippen = (o, id) => { const i = +String(id).replace('dreh', '');
  T.bausteinAendern(o, { f: dd => { const u = new Set(dd.umgedreht || []); u.has(i) ? u.delete(i) : u.add(i); return { d: { ...dd, umgedreht: [...u].sort((a, b) => a - b) } }; } }); };
B.ln_karten.schnell = d => [{ l: '＋ 2 Karten', f: dd => ({ d: { ...dd, anzahl: String(Math.min(8, kartenAnz(dd) + 2)) } }) },
  { l: '− 2 Karten', f: dd => ({ d: { ...dd, anzahl: String(Math.max(4, kartenAnz(dd) - 2)) } }) },
  ...(d.art === 'drehen' ? [{ l: '↻ Alle umdrehen / zurück', f: dd => ({ d: { ...dd, umgedreht: (dd.umgedreht || []).length ? [] : Array.from({ length: kartenAnz(dd) }, (_, i) => i) } }) }] : []),
  { l: 'Ansicht: nebeneinander / umdrehen', f: dd => ({ d: { ...dd, art: dd.art === 'drehen' ? 'neben' : 'drehen', kh: undefined } }) }];
KV['ln_karten:drehen'] = { name: 'Lernkarten zum Umdrehen', d: { art: 'drehen' } };
KV['ln_karten:leitner'] = { name: 'Lernkarten: Leitner-Kasten', d: { art: 'leitner' } };

// ---------- 5 📖 Lesemethode in 5 Schritten ----------
const LESEN = [['👀', 'Überfliegen', 'Worum geht es? Überschrift, Bilder und fett Gedrucktes ansehen.', BLAU],
  ['❓', 'Fragen stellen', 'Was weiß ich schon? Was möchte ich wissen?', LILA],
  ['🔍', 'Gründlich lesen', 'Abschnitt für Abschnitt lesen. Unbekannte Wörter markieren und klären.', ORANGE],
  ['✍️', 'Zusammenfassen', 'Was steht in jedem Abschnitt? Kurz in eigenen Worten.', GRUEN],
  ['🔁', 'Wiederholen', 'Was ist die Kernaussage? Kann ich meine Fragen jetzt beantworten?', TUERKIS]];
B.ln_lesen = { name: 'Lesemethode in 5 Schritten', gruppe: 'Struktur', def: { thema: '', art: 'feld', zeilen: 3 },
  felder: [{ k: 'thema', l: 'Text / Thema (leer = Linie zum Schreiben)', typ: 'text' },
    { k: 'art', l: 'Ansicht', typ: 'auswahl', opts: [['feld', 'Zum Ausfüllen (Felder mit Linien)'], ['erklaerung', 'Erklärung für die Tafel (nur die 5 Schritte)']] },
    { k: 'zeilen', l: 'Zeilen je Schritt', typ: 'zahl', min: 1, max: 10 }],
  gen: d => {
    if (d.art === 'erklaerung') {
      const W = breiteMin(d, 1300, 1100), rh = 140, y0 = 100, H = y0 + 5 * rh + 10;
      let s = t(40, 52, '📖 Lesemethode in 5 Schritten', 36, DUNKEL, fett);
      LESEN.forEach(([em, titel, txt, col], i) => { const y = y0 + i * rh, cy = y + 56;
        if (i < 4) s += strich(80, cy + 40, 80, cy + rh - 52, LINIE, 5, 'stroke-linecap="round"') + spitze(80, cy + rh - 40, Math.PI / 2, LINIE, 18);
        s += kasten(132, y, W - 162, 112, col, '#ffffff', 16) + band(132, y, W - 162, 112, col);
        s += `<circle cx="80" cy="${f(cy)}" r="38" fill="${col}"/>` + t(80, cy + 2, String(i + 1), 36, '#ffffff', mitte + ' ' + fett);
        s += t(152, cy, em, 50, DUNKEL) + t(232, y + 34, titel, 34, DUNKEL, fett) + t(232, y + 80, txt, 24, DUNKEL); });
      return { svg: blatt(W, H, s), w: W, h: H };
    }
    const n = anz(d, 1, 10, 3), W = breiteMin(d, 1000, 1000), y0 = 140;
    let s = kopf(d, W, '📖 LESEMETHODE IN 5 SCHRITTEN'), y = y0;
    LESEN.forEach(([em, titel, txt, col], i) => { const hh = 90 + n * ABST;
      s += kasten(20, y, W - 40, hh, col) + `<circle cx="52" cy="${y + 30}" r="20" fill="${col}"/>` + t(52, y + 31, String(i + 1), 22, '#ffffff', mitte + ' ' + fett);
      s += t(84, y + 30, em + ' ' + titel, 22, col, fett) + t(84, y + 62, txt, 20, DUNKEL);
      s += linien(36, W - 36, y + 110, n, ABST); y += hh + 16; });
    const H = y + 4;
    return { svg: blatt(W, H, s), w: W, h: H };
  } };
B.ln_lesen.schnell = zeileMehr('ln_lesen', 1, 10);
KV['ln_lesen:erklaerung'] = { name: 'Lesemethode – Erklärung (Tafel)', d: { art: 'erklaerung' } };

// ---------- 6 📔 Lerntagebuch (ein Tag oder eine Woche) ----------
const ARBEIT = ['Ich habe konzentriert gearbeitet.', 'Ich habe sorgfältig gearbeitet.', 'Ich habe Hilfe geholt, wenn ich sie brauchte.'];
const WOCHE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
B.ln_tagebuch = { name: 'Lerntagebuch', gruppe: 'Struktur', def: { art: 'tag', zeilen: 3, wahl: {} },
  felder: [{ k: 'art', l: 'Ansicht', typ: 'auswahl', opts: [['tag', 'Ein Tag'], ['woche', 'Woche (5 Tage untereinander)']] },
    { k: 'zeilen', l: 'Zeilen bei „Heute habe ich gelernt“', typ: 'zahl', min: 1, max: 12 }],
  gen: d => {
    const teile = [];
    if (d.art === 'woche') {
      const W = breiteMin(d, 1500, 1300), zh = Math.round(T.clamp(+d.zh || 110, 90, 300)), wT = 150, wS = 250, wA = 260, wN = 270, wG = W - 40 - wT - wS - wA - wN;
      let s = t(30, 40, '📔 LERNTAGEBUCH – WOCHE', 20, RAND, fett);
      const kf = kopfFelder(W, 84, ['Woche vom', 'Fach']); s += kf.s;
      const y0 = kf.y + 6, hK = 54, hT = hK + 5 * zh, H = y0 + hT + 24;
      const sp = [['Tag', 20, wT], ['📚 Heute habe ich gelernt …', 20 + wT, wG], ['Schwer / leicht', 20 + wT + wG, wS], ['So habe ich gearbeitet', 20 + wT + wG + wS, wA], ['➡️ Nächstes Mal …', 20 + wT + wG + wS + wA, wN]];
      s += kasten(20, y0, W - 40, hT, LILA) + band(20, y0, W - 40, hK, LILA);
      sp.forEach(([l, x], i) => { s += t(x + 14, y0 + hK / 2, l, 20, LILA, fett); if (i) s += strich(x, y0, x, y0 + hT, LILA); });
      const k = Math.max(1, Math.floor((zh - 10) / ABST));
      WOCHE.forEach((tag, r) => { const y = y0 + hK + r * zh;
        s += strich(20, y, W - 20, y, LILA, r ? 1 : 1.5, r ? 'opacity=".5"' : '') + t(36, y + 28, tag, 21, DUNKEL, fett) + strich(36, y + zh - 22, wT + 6, y + zh - 22, LINIE);
        for (const [, x, w] of [sp[1], sp[2], sp[4]]) s += linien(x + 14, x + w - 14, y + 42, k, ABST);
        s += smileys(sp[3][1] + wA / 2 - 62, y + zh / 2, 62, 'w' + r, d.wahl, teile); });
      return { svg: blatt(W, H, s), w: W, h: H, teile };
    }
    const n = anz(d, 1, 12, 3), W = breiteMin(d, 1000, 900);
    let s = t(30, 40, '📔 LERNTAGEBUCH', 20, RAND, fett);
    const kf = kopfFelder(W, 84, ['Datum', 'Fach']); s += kf.s;
    const a = abschnitte(W, kf.y, [['📚 Heute habe ich gelernt …', BLAU, n]]); s += a.s; let y = a.y;
    const hw = (W - 56) / 2, hL = 50 + 2 * ABST;
    s += kasten(20, y, hw, hL, GRUEN) + t(36, y + 26, '🙂 Das war leicht …', 21, GRUEN, fett) + linien(36, 20 + hw - 16, y + 50 + ABST * 0.8, 2, ABST);
    s += kasten(36 + hw, y, hw, hL, ORANGE) + t(52 + hw, y + 26, '😓 Das war schwer …', 21, BRAUN, fett) + linien(52 + hw, W - 36, y + 50 + ABST * 0.8, 2, ABST);
    y += hL + 16;
    const hA = 56 + ARBEIT.length * 62 + 6;
    s += kasten(20, y, W - 40, hA, LILA) + t(36, y + 26, '🛠 So habe ich gearbeitet', 21, LILA, fett);
    ARBEIT.forEach((l, i) => { const cy = y + 56 + i * 62 + 31;
      if (i) s += strich(36, cy - 31, W - 36, cy - 31, LILA, 1, 'opacity=".35"');
      s += t(40, cy, l, 21, DUNKEL) + smileys(W - 60 - 2 * 58, cy, 58, 'a' + i, d.wahl, teile); });
    y += hA + 16;
    const b = abschnitte(W, y, [['➡️ Nächstes Mal …', TUERKIS, 2]]); s += b.s;
    const H = b.y + 4;
    return { svg: blatt(W, H, s), w: W, h: H, teile };
  } };
B.ln_tagebuch.tippen = smileyTippen;
B.ln_tagebuch.schnell = zeileMehr('ln_tagebuch', 1, 12).concat([{ l: '↺ Smileys zurücksetzen', f: dd => ({ d: { ...dd, wahl: {} } }) }]);
KV['ln_tagebuch:woche'] = { name: 'Lerntagebuch – Woche', d: { art: 'woche' } };

// ---------- 7 ⏰ Wochen-Lernzeitplan ----------
const TAGE7 = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
B.ln_lernzeit = { name: 'Wochen-Lernzeitplan', gruppe: 'Struktur', def: { zeitfelder: 4, zeiten: '', erledigt: [] },
  felder: [{ k: 'zeitfelder', l: 'Zeitfelder je Tag', typ: 'zahl', min: 2, max: 6 },
    { k: 'zeiten', l: 'Uhrzeiten über den Spalten (je Zeile eine, z. B. 15:00–15:25; leer = zum Eintragen)', typ: 'liste' }],
  gen: d => {
    const m = Math.round(T.clamp(+d.zeitfelder || 4, 2, 6)), W = breiteMin(d, 1400, 1200), zh = Math.round(T.clamp(+d.zh || 80, 60, 240)), teile = [];
    const zeiten = String(d.zeiten || '').split(/\r?\n/).map(z => z.trim()), fertig = new Set(d.erledigt || []), wT = 170, wE = 130, wZ = (W - 40 - wT - wE) / m;
    let s = t(30, 40, '⏰ WOCHEN-LERNZEITPLAN', 20, RAND, fett);
    const kf = kopfFelder(W, 84, ['Woche vom', 'Mein Ziel']); s += kf.s;
    const y0 = kf.y + 6, hK = 54, hT = hK + 7 * zh;
    s += kasten(20, y0, W - 40, hT, RAND) + band(20, y0, W - 40, hK, RAND);
    s += t(36, y0 + hK / 2, 'Tag', 21, RAND, fett) + t(W - 20 - wE / 2, y0 + hK / 2, 'Erledigt', 21, RAND, mitte + ' ' + fett);
    for (let j = 0; j < m; j++) { const x = 20 + wT + j * wZ;
      s += strich(x, y0, x, y0 + hT, RAND, j ? 1 : 2);
      s += zeiten[j] ? t(x + wZ / 2, y0 + hK / 2, zeiten[j], 20, DUNKEL, mitte + ' ' + fett) : t(x + 14, y0 + hK / 2, '🕒', 20, DUNKEL) + strich(x + 46, y0 + 40, x + wZ - 14, y0 + 40, LINIE); }
    s += strich(W - 20 - wE, y0, W - 20 - wE, y0 + hT, RAND, 2);
    TAGE7.forEach((tag, r) => { const y = y0 + hK + r * zh, an = fertig.has(r);
      if (r >= 5) s += `<rect x="21" y="${y}" width="${W - 42}" height="${zh}" fill="#64748b" opacity=".07"/>`;
      s += strich(20, y, W - 20, y, RAND, r ? 1 : 2, r ? 'opacity=".5"' : '') + t(36, y + zh / 2, tag, 21, DUNKEL, fett);
      s += haken(W - 20 - wE / 2 - 18, y + zh / 2 - 18, an);
      teile.push({ id: 'ok' + r, x: W - 20 - wE, y, w: wE, h: zh }); });
    const yP = y0 + hT + 24, tipps = ['25 Minuten lernen – dann 5 Minuten Pause.', 'Nach 4 Lernzeiten: eine lange Pause (etwa 20 Minuten).', 'In der Pause: aufstehen, etwas trinken, kurz bewegen.'];
    const hP = 56 + tipps.length * 36 + 8, H = yP + hP + 20;
    s += kasten(20, yP, W - 40, hP, ORANGE, 'rgba(239,108,0,.07)') + t(36, yP + 28, '⏱ Pausen-Tipp', 22, BRAUN, fett);
    tipps.forEach((l, i) => { s += t(40, yP + 72 + i * 36, '• ' + l, 21, DUNKEL); });
    return { svg: blatt(W, H, s), w: W, h: H, teile };
  } };
B.ln_lernzeit.tippen = (o, id) => { const i = +String(id).replace('ok', '');
  T.bausteinAendern(o, { f: dd => { const e = new Set(dd.erledigt || []); e.has(i) ? e.delete(i) : e.add(i); return { d: { ...dd, erledigt: [...e].sort((a, b) => a - b) } }; } }); };
B.ln_lernzeit.schnell = [{ l: '＋ Zeitfeld', f: dd => ({ d: { ...dd, zeitfelder: Math.min(6, (+dd.zeitfelder || 4) + 1) } }) },
  { l: '− Zeitfeld', f: dd => ({ d: { ...dd, zeitfelder: Math.max(2, (+dd.zeitfelder || 4) - 1) } }) },
  { l: '↺ Erledigt zurücksetzen', f: dd => ({ d: { ...dd, erledigt: [] } }) }];

// ↔ ↕ Seitengriffe: was wächst, wenn man unten zieht (rechts ziehen = breiter regelt vorlagen-kern.js)
Object.assign(DEHNEN, {
  ln_kompetenz: zeilenNeu(3, 20, 6, 92), ln_lernzettel: zeilenNeu(2, 15, 4, 88), ln_fehler: zeilenNeu(3, 30, 8, 92),
  ln_karten: (d, dy) => d.art === 'leitner' ? {} : ({ kh: Math.round(T.clamp((+d.kh || (d.art === 'drehen' ? 260 : 230)) + dy / (d.art === 'drehen' ? 2 : kartenAnz(d) / 2), 180, 600)) }),
  ln_lesen: (d, dy) => d.art === 'erklaerung' ? {} : zeilenNeu(1, 10, 3, 5 * ABST)(d, dy),
  ln_tagebuch: (d, dy) => d.art === 'woche' ? { zh: Math.round(T.clamp((+d.zh || 110) + dy / 5, 90, 300)) } : zeilenNeu(1, 12, 3, ABST)(d, dy),
  ln_lernzeit: (d, dy) => ({ zh: Math.round(T.clamp((+d.zh || 80) + dy / 7, 60, 240)) }) });

T.LERN_VORLAGEN = ['ln_kompetenz', 'ln_lernzettel', 'ln_fehler', 'ln_karten', 'ln_lesen', 'ln_tagebuch', 'ln_lernzeit'];
})();
