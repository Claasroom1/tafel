// Tafel-App – 📝 Mitschrift- und Lernvorlagen + 🗂 Vokabeltrainer (gemeinsam für Lehrkräfte- und Schüler-Version, braucht vorlagen-kern.js)
//   Cornell-Notizen, Hefteintrag, Begriffe, Stichpunkte, Mindmap (mit Unterpunkten), Stundenplan, Lernplan, Versuchsprotokoll, Lesetagebuch, Buchvorstellung.
//   Einfügen › 📋 Stunde & Rückmeldung (Schüler-Version: „📝 Mitschrift & Lernen“). Seitengriffe ↔ ↕ über T.VL.dehnen.
'use strict';
(function () {
const B = T.BAUSTEINE; if (!B || !T._svg) return;
const { f, esc, t, fett, linien, kasten, blatt, kopf, ABST, anz, breite, THEMA, kopfFelder, abschnitte, vorlage, zeilenNeu, dehnen: DEHNEN, einfuegen, bild, nachDemZeichnen, farben } = T.VL;
const { TINTE, BLAU, GRUEN, ORANGE, LILA, LINIE, RAND } = farben;

// ---------- 📝 Mitschrift-Vorlagen ----------

B.ms_cornell = { name: 'Cornell-Notizen', gruppe: 'Struktur', def: { thema: '', zeilen: 10 },
  felder: [THEMA, { k: 'zeilen', l: 'Zeilen für Notizen', typ: 'zahl', min: 4, max: 40 }],
  gen: d => {
    const n = anz(d, 4, 40, 10), W = breite(d, 1000), y0 = 140, hN = 50 + n * ABST, yZ = y0 + hN + 20, H = yZ + 50 + 3 * ABST + 20;
    let s = kopf(d, W, '📝 CORNELL-NOTIZEN');
    s += kasten(20, y0, 290, hN, LILA, 'rgba(106,27,154,.05)') + t(36, y0 + 26, 'Stichworte & Fragen', 21, LILA, fett) + linien(36, 294, y0 + 50 + ABST * 0.8, n, ABST);
    s += kasten(326, y0, W - 346, hN, BLAU) + t(342, y0 + 26, 'Notizen', 21, BLAU, fett) + linien(342, W - 36, y0 + 50 + ABST * 0.8, n, ABST);
    s += kasten(20, yZ, W - 40, 50 + 3 * ABST, GRUEN, 'rgba(46,125,50,.05)') + t(36, yZ + 26, 'Zusammenfassung in eigenen Worten', 21, GRUEN, fett) + linien(36, W - 36, yZ + 50 + ABST * 0.8, 3, ABST);
    return { svg: blatt(W, H, s), w: W, h: H };
  } };

B.ms_heft = { name: 'Hefteintrag (Merke, Beispiel, Skizze)', gruppe: 'Struktur', def: { thema: '', zeilen: 4, skizze: true },
  felder: [THEMA, { k: 'zeilen', l: 'Zeilen im Merkkasten', typ: 'zahl', min: 2, max: 30 }, { k: 'skizze', l: 'Feld für eine Skizze', typ: 'check' }],
  gen: d => {
    const n = anz(d, 2, 30, 4), W = breite(d, 1000), y0 = 140, hM = 50 + n * ABST, yB = y0 + hM + 20, hB = 50 + 3 * ABST, sk = d.skizze !== false;
    const H = yB + hB + 20 + (sk ? 300 : 0);
    let s = kopf(d, W, '📝 HEFTEINTRAG');
    s += kasten(20, y0, W - 40, hM, ORANGE, 'rgba(239,108,0,.07)') + t(36, y0 + 26, '💡 Merke', 22, '#b45309', fett) + linien(36, W - 36, y0 + 50 + ABST * 0.8, n, ABST);
    s += kasten(20, yB, W - 40, hB, BLAU) + t(36, yB + 26, '✏️ Beispiel', 22, BLAU, fett) + linien(36, W - 36, yB + 50 + ABST * 0.8, 3, ABST);
    if (sk) s += kasten(20, yB + hB + 20, W - 40, 280, GRUEN) + t(36, yB + hB + 46, '🖍 Skizze', 22, GRUEN, fett);
    return { svg: blatt(W, H, s), w: W, h: H };
  } };

B.ms_begriffe = { name: 'Begriffe & Erklärungen', gruppe: 'Struktur', def: { thema: '', zeilen: 6 },
  felder: [THEMA, { k: 'zeilen', l: 'Anzahl Begriffe', typ: 'zahl', min: 3, max: 30 }],
  gen: d => {
    const n = anz(d, 3, 30, 6), W = breite(d, 1000), y0 = 140, zh = 2 * ABST, H = y0 + 50 + n * zh + 24, xT = 300;
    let s = kopf(d, W, '📝 BEGRIFFE');
    s += kasten(20, y0, W - 40, 50 + n * zh, LILA) + `<rect x="20" y="${y0}" width="${W - 40}" height="50" rx="12" fill="${LILA}" opacity=".12"/>`;
    s += t(36, y0 + 25, 'Begriff', 22, LILA, fett) + t(xT + 16, y0 + 25, 'Erklärung in eigenen Worten', 22, LILA, fett);
    s += `<line x1="${xT}" y1="${y0}" x2="${xT}" y2="${y0 + 50 + n * zh}" stroke="${LILA}" stroke-width="1.5"/>`;
    for (let i = 0; i < n; i++) { const y = y0 + 50 + i * zh;
      if (i) s += `<line x1="20" y1="${y}" x2="${W - 20}" y2="${y}" stroke="${LILA}" stroke-width="1" opacity=".5"/>`;
      s += linien(xT + 16, W - 36, y + ABST * 0.85, 2, ABST * 0.9); }
    return { svg: blatt(W, H, s), w: W, h: H };
  } };

B.ms_stichpunkte = { name: 'Mitschrift in Stichpunkten', gruppe: 'Struktur', def: { thema: '', zeilen: 10, fragen: true },
  felder: [THEMA, { k: 'zeilen', l: 'Stichpunkte', typ: 'zahl', min: 4, max: 40 }, { k: 'fragen', l: 'Kasten „Das möchte ich noch wissen“', typ: 'check' }],
  gen: d => {
    const n = anz(d, 4, 40, 10), W = breite(d, 1000), y0 = 130, fr = d.fragen !== false, yF = y0 + n * ABST + 30, H = yF + (fr ? 50 + 2 * ABST + 30 : 0);
    let s = kopf(d, W, '📝 MITSCHRIFT');
    for (let i = 0; i < n; i++) { const y = y0 + (i + 1) * ABST; s += t(34, y - 14, '•', 30, BLAU, fett) + linien(62, W - 30, y, 1, ABST); }
    if (fr) s += kasten(20, yF, W - 40, 50 + 2 * ABST, ORANGE, 'rgba(239,108,0,.07)') + t(36, yF + 26, '❓ Das möchte ich noch wissen', 21, '#b45309', fett) + linien(36, W - 36, yF + 50 + ABST * 0.8, 2, ABST);
    return { svg: blatt(W, H, s), w: W, h: H };
  } };

// 🗓 Stundenplan: Mo–Fr × Stunden; Fächer getippt (✏️ Bearbeiten) oder mit dem Stift in die leeren Felder
const TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'], TFARBEN = ['#e3f2fd', '#e8f5e9', '#fff3e0', '#f3e5f5', '#fce4ec'];
B.ms_stundenplan = { name: 'Stundenplan', gruppe: 'Struktur', def: { titel: 'Mein Stundenplan', zeilen: 6, zeiten: '', faecher: '' },
  felder: [{ k: 'titel', l: 'Überschrift', typ: 'text' }, { k: 'zeilen', l: 'Stunden am Tag', typ: 'zahl', min: 4, max: 10 },
    { k: 'zeiten', l: 'Uhrzeiten (je Zeile eine Stunde, z. B. 8:00–8:45; leer = frei)', typ: 'liste' },
    { k: 'faecher', l: 'Fächer (je Zeile eine Stunde: Mo;Di;Mi;Do;Fr – z. B. Mathe;Deutsch;Englisch;Bio;Sport)', typ: 'liste' }],
  gen: d => {
    const n = anz(d, 4, 10, 6), W = breite(d, 1100), x0 = 20, wS = 150, wT = (W - 2 * x0 - wS) / 5, y0 = 80, hK = 50, hZ = Math.round(T.clamp(+d.zh || 64, 50, 220)), H = y0 + hK + n * hZ + 24;
    const zeiten = String(d.zeiten || '').split(/\r?\n/), faecher = String(d.faecher || '').split(/\r?\n/).map(z => z.split(';').map(s => s.trim()));
    let s = t(30, 42, '🗓 ' + (d.titel || 'Stundenplan'), 30, TINTE, fett);
    s += kasten(x0, y0, W - 2 * x0, hK + n * hZ, RAND);
    TAGE.forEach((tg, i) => { const x = x0 + wS + i * wT; s += `<rect x="${f(x)}" y="${y0}" width="${f(wT)}" height="${hK}" fill="${TFARBEN[i]}"/>` + t(x + wT / 2, y0 + hK / 2, tg, 22, TINTE, 'text-anchor="middle" ' + fett); });
    s += t(x0 + 16, y0 + hK / 2, 'Stunde', 20, RAND, fett);
    for (let r = 0; r < n; r++) { const y = y0 + hK + r * hZ;
      s += `<line x1="${x0}" y1="${y}" x2="${W - x0}" y2="${y}" stroke="${RAND}" stroke-width="${r ? 1 : 2}"/>` + t(x0 + 16, y + (zeiten[r] ? hZ / 2 - 10 : hZ / 2), (r + 1) + '.', 22, TINTE, fett);
      if (zeiten[r]) s += t(x0 + 16, y + hZ / 2 + 14, zeiten[r].trim(), 15, '#64748b');
      for (let c = 0; c < 5; c++) { const v = (faecher[r] || [])[c]; if (v) s += t(x0 + wS + c * wT + wT / 2, y + hZ / 2, v, 21, TINTE, 'text-anchor="middle"'); } }
    for (let c = 0; c <= 4; c++) s += `<line x1="${f(x0 + wS + c * wT)}" y1="${y0}" x2="${f(x0 + wS + c * wT)}" y2="${y0 + hK + n * hZ}" stroke="${RAND}" stroke-width="${c ? 1 : 2}"/>`;
    return { svg: blatt(W, H, s), w: W, h: H };
  } };


vorlage('ms_versuch', 'Versuchsprotokoll', '🔬 VERSUCHSPROTOKOLL', ['Versuch', 'Datum', 'Name', 'Gruppe'], [
  ['❓ Frage – Was wollen wir herausfinden?', BLAU, 2], ['💭 Vermutung – Ich vermute, dass …', LILA, 2],
  ['🧰 Material', '#64748b', 2], ['✏️ Skizze des Aufbaus', GRUEN, 0, 260], ['🔧 Durchführung – So sind wir vorgegangen', BLAU, 3],
  ['👀 Beobachtung – Das haben wir gesehen / gemessen', ORANGE, 3], ['✅ Ergebnis und Erklärung – Stimmt die Vermutung?', GRUEN, 3]]);
vorlage('ms_lesetagebuch', 'Lesetagebuch', '📖 LESETAGEBUCH', ['Buch', 'Datum', 'Autorin / Autor', 'Seiten von – bis'], [
  ['📌 Das ist passiert', BLAU, 4], ['👤 Diese Figuren kommen vor', LILA, 2], ['❤️ Das hat mir gefallen – das nicht', ORANGE, 3], ['🔮 So geht es vielleicht weiter', GRUEN, 2]]);
vorlage('ms_buch', 'Buchvorstellung', '📚 BUCHVORSTELLUNG', ['Titel', 'Erschienen', 'Autorin / Autor', 'Seiten'], [
  ['👤 Die wichtigsten Figuren', LILA, 2], ['📌 Worum geht es? (ohne das Ende zu verraten)', BLAU, 4], ['⭐ Meine Lieblingsstelle (Seite …)', ORANGE, 2],
  ['💬 Meine Meinung   ☆ ☆ ☆ ☆ ☆', GRUEN, 3], ['🎯 Ich empfehle das Buch für …', '#64748b', 1]]);

// 🧠 Mindmap: Thema in der Mitte, Äste zu Feldern mit Linien, außen Unterpunkte (je Ast bis 4)
// Unterpunkte: das kleine ＋ am Ast antippen (oder ✏️ Bearbeiten). Der äußere Ring ist von Anfang an frei gehalten –
// so verrutscht beim Hinzufügen nichts, und schon Geschriebenes bleibt in seinem Feld.
const MM_FARBEN = [BLAU, GRUEN, ORANGE, LILA, '#c62828', '#00838f', '#6d4c41', '#ad1457'];
const mmUnter = (d, i) => Math.round(T.clamp(Array.isArray(d.u) && d.u[i] != null ? +d.u[i] : (+d.unter || 0), 0, 4));
B.ms_mindmap = { name: 'Mindmap', gruppe: 'Struktur', def: { thema: '', aeste: 6, unter: 0 },
  felder: [{ k: 'thema', l: 'Thema in der Mitte (leer = zum Schreiben)', typ: 'text' }, { k: 'aeste', l: 'Anzahl der Äste', typ: 'zahl', min: 3, max: 8 },
    { k: 'unter', l: 'Unterpunkte je Ast (0–4; einzeln: ＋ am Ast antippen)', typ: 'zahl', min: 0, max: 4 }],
  gen: d => {
    const n = Math.round(T.clamp(+d.aeste || 6, 3, 8)), W = breite(d, 1700), H = Math.round(T.clamp(+d.bh || 1150, 700, 2600)), cx = W / 2, cy = H / 2 + 10;
    const rx = Math.max(260, W / 2 - 400), ry = Math.max(200, H / 2 - 300), ux = W / 2 - 110, uy = H / 2 - 62, teile = [];
    let s = t(30, 40, '🧠 MINDMAP', 20, RAND, fett), aussen = '', unten = '';
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n, bx = cx + Math.cos(a) * rx, by = cy + Math.sin(a) * ry, col = MM_FARBEN[i % MM_FARBEN.length], bw = 250, bh = 140, k = mmUnter(d, i);
      s += `<path d="M ${f(cx + Math.cos(a) * 150)} ${f(cy + Math.sin(a) * 70)} Q ${f(cx + Math.cos(a) * (rx * 0.55))} ${f(cy + Math.sin(a) * (ry * 0.5))} ${f(bx - Math.cos(a) * bw * 0.45)} ${f(by - Math.sin(a) * bh * 0.45)}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`;
      aussen += kasten(bx - bw / 2, by - bh / 2, bw, bh, col, '#ffffff', 18) + linien(bx - bw / 2 + 16, bx + bw / 2 - 16, by - bh / 2 + 44, 3, 40);
      for (let j = 0; j < k; j++) { /* Unterpunkte fächerförmig außen um den Ast */
        const w = a + (j - (k - 1) / 2) * (0.62 / Math.max(1, n / 6)), sx = cx + Math.cos(w) * ux, sy = cy + Math.sin(w) * uy, sw = 190, sh = 80;
        const px = T.clamp(sx, sw / 2 + 12, W - sw / 2 - 12), py = T.clamp(sy, sh / 2 + 60, H - sh / 2 - 12);
        unten += `<line x1="${f(bx + Math.cos(w) * bw * 0.48)}" y1="${f(by + Math.sin(w) * bh * 0.48)}" x2="${f(px)}" y2="${f(py)}" stroke="${col}" stroke-width="3.5" stroke-linecap="round"/>`;
        aussen += kasten(px - sw / 2, py - sh / 2, sw, sh, col, '#ffffff', 14) + linien(px - sw / 2 + 14, px + sw / 2 - 14, py + 18, 1, 40);
      }
      if (k < 4) { /* ＋ = Unterpunkt anhängen (antippen) */
        const qx = bx + Math.cos(a) * (bw / 2 + 4), qy = by + Math.sin(a) * (bh / 2 + 4), px = T.clamp(qx, bx - bw / 2 - 4, bx + bw / 2 + 4), py = T.clamp(qy, by - bh / 2 - 4, by + bh / 2 + 4);
        aussen += `<circle cx="${f(px)}" cy="${f(py)}" r="17" fill="${col}"/>` + t(px, py + 1, '＋', 22, '#ffffff', 'text-anchor="middle" ' + fett);
        teile.push({ id: 'u' + i, x: px - 22, y: py - 22, w: 44, h: 44 });
      }
    }
    s = s.replace('<path', unten + '<path') + aussen + `<ellipse cx="${cx}" cy="${cy}" rx="160" ry="72" fill="#fff8e1" stroke="${RAND}" stroke-width="3"/>`;
    s += d.thema ? t(cx, cy, d.thema, 30, TINTE, 'text-anchor="middle" ' + fett) : `<line x1="${cx - 110}" y1="${cy + 18}" x2="${cx + 110}" y2="${cy + 18}" stroke="${LINIE}" stroke-width="1.5"/>`;
    return { svg: blatt(W, H, s), w: W, h: H, teile };
  } };
B.ms_mindmap.tippen = (o, id) => { const i = +id.slice(1);
  T.bausteinAendern(o, { f: dd => { const n = Math.round(T.clamp(+dd.aeste || 6, 3, 8)), u = Array.from({ length: n }, (_, j) => mmUnter(dd, j)); u[i] = Math.min(4, u[i] + 1); return { d: { ...dd, u } }; } }); };
B.ms_mindmap.schnell = [{ l: '＋ Unterpunkt an jedem Ast', f: dd => { const n = Math.round(T.clamp(+dd.aeste || 6, 3, 8)); return { d: { ...dd, u: Array.from({ length: n }, (_, j) => Math.min(4, mmUnter(dd, j) + 1)) } }; } },
  { l: '− Unterpunkte (je Ast einer weniger)', f: dd => { const n = Math.round(T.clamp(+dd.aeste || 6, 3, 8)); return { d: { ...dd, u: Array.from({ length: n }, (_, j) => Math.max(0, mmUnter(dd, j) - 1)) } }; } },
  { l: '＋ Ast', f: dd => ({ d: { ...dd, aeste: Math.min(8, (+dd.aeste || 6) + 1) } }) }];

// 📅 Lernplan für eine Klassenarbeit: Tage mit Lernaufgabe, Kästchen antippen = erledigt
B.ms_lernplan = { name: 'Lernplan für eine Klassenarbeit', gruppe: 'Struktur', def: { fach: '', zeilen: 7, fertig: [] },
  felder: [{ k: 'fach', l: 'Fach (leer = Linie zum Schreiben)', typ: 'text' }, { k: 'zeilen', l: 'Lerntage', typ: 'zahl', min: 3, max: 30 }],
  gen: d => {
    const n = anz(d, 3, 30, 7), W = breite(d, 1000), y0 = 190, zh = 60, H = y0 + 50 + n * zh + 30 + 50 + 2 * ABST + 30, fertig = new Set(d.fertig || []), teile = [];
    let s = t(30, 40, '📅 LERNPLAN', 20, RAND, fett);
    s += t(30, 90, 'Fach:', 24, TINTE, fett) + (d.fach ? t(110, 90, d.fach, 26, TINTE, fett) : `<line x1="110" y1="106" x2="${W - 520}" y2="106" stroke="${LINIE}" stroke-width="1.5"/>`);
    s += t(W - 480, 90, 'Klassenarbeit am:', 24, TINTE, fett) + `<line x1="${W - 270}" y1="106" x2="${W - 30}" y2="106" stroke="${LINIE}" stroke-width="1.5"/>`;
    s += t(30, 145, 'Themen:', 24, TINTE, fett) + `<line x1="130" y1="161" x2="${W - 30}" y2="161" stroke="${LINIE}" stroke-width="1.5"/>`;
    s += kasten(20, y0, W - 40, 50 + n * zh, BLAU) + `<rect x="20" y="${y0}" width="${W - 40}" height="50" rx="12" fill="${BLAU}" opacity=".12"/>`;
    s += t(36, y0 + 25, 'Tag', 21, BLAU, fett) + t(196, y0 + 25, 'Das lerne ich', 21, BLAU, fett) + t(W - 60, y0 + 25, '✓', 22, BLAU, 'text-anchor="middle" ' + fett);
    s += `<line x1="180" y1="${y0}" x2="180" y2="${y0 + 50 + n * zh}" stroke="${BLAU}" stroke-width="1.5"/><line x1="${W - 100}" y1="${y0}" x2="${W - 100}" y2="${y0 + 50 + n * zh}" stroke="${BLAU}" stroke-width="1.5"/>`;
    for (let i = 0; i < n; i++) { const y = y0 + 50 + i * zh, an = fertig.has(i), bx = W - 75, by = y + zh / 2 - 17;
      if (i) s += `<line x1="20" y1="${y}" x2="${W - 20}" y2="${y}" stroke="${BLAU}" stroke-width="1" opacity=".45"/>`;
      s += t(36, y + zh / 2, (i + 1) + '.', 21, '#64748b', fett);
      s += `<rect x="${bx}" y="${by}" width="34" height="34" rx="7" fill="${an ? GRUEN : '#ffffff'}" stroke="${an ? GRUEN : TINTE}" stroke-width="2.5"/>`;
      if (an) s += `<path d="M ${bx + 8} ${by + 17} l 7 8 l 12 -16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
      teile.push({ id: 'k' + i, x: W - 100, y, w: 80, h: zh }); }
    const yT = y0 + 50 + n * zh + 30;
    s += kasten(20, yT, W - 40, 50 + 2 * ABST, ORANGE, 'rgba(239,108,0,.07)') + t(36, yT + 26, '💡 Tipps: Was hilft mir beim Lernen?', 21, '#b45309', fett) + linien(36, W - 36, yT + 50 + ABST * 0.8, 2, ABST);
    return { svg: blatt(W, H, s), w: W, h: H, teile };
  } };
B.ms_lernplan.tippen = (o, id) => { const i = +id.slice(1);
  T.bausteinAendern(o, { f: dd => { const fe = new Set(dd.fertig || []); fe.has(i) ? fe.delete(i) : fe.add(i); return { d: { ...dd, fertig: [...fe].sort((a, b) => a - b) } }; } }); };

const MITSCHRIFT = ['ms_cornell', 'ms_heft', 'ms_begriffe', 'ms_stichpunkte', 'ms_mindmap', 'ms_stundenplan', 'ms_lernplan', 'ms_versuch', 'ms_lesetagebuch', 'ms_buch'];
for (const k of ['ms_cornell', 'ms_heft', 'ms_begriffe', 'ms_stichpunkte', 'ms_stundenplan', 'ms_lernplan']) B[k].schnell = [{ l: '＋ Zeile', f: dd => ({ d: { ...dd, zeilen: (+dd.zeilen || B[k].def.zeilen) + 1 } }) }, { l: '− Zeile', f: dd => ({ d: { ...dd, zeilen: Math.max(2, (+dd.zeilen || B[k].def.zeilen) - 1) } }) }];

// ↔ ↕ Seitengriffe: welche Angabe wächst, wenn man unten zieht
Object.assign(DEHNEN, {
  ms_cornell: zeilenNeu(4, 40, 10, ABST), ms_heft: zeilenNeu(2, 30, 4, ABST), ms_stichpunkte: zeilenNeu(4, 40, 10, ABST),
  ms_begriffe: zeilenNeu(3, 30, 6, 2 * ABST), ms_lernplan: zeilenNeu(3, 30, 7, 60),
  ms_stundenplan: (d, dy) => ({ zh: Math.round(T.clamp((+d.zh || 64) + dy / anz(d, 4, 10, 6), 50, 220)) }),
  ms_mindmap: (d, dy) => ({ bh: Math.round(T.clamp((+d.bh || 1150) + dy, 700, 2600)) }),
  ms_versuch: null, ms_lesetagebuch: null, ms_buch: null });
for (const k of ['ms_versuch', 'ms_lesetagebuch', 'ms_buch']) DEHNEN[k] = (d, dy) => ({ mehr: Math.max(0, (+d.mehr || 0) + Math.round(dy / ABST)) });


// Einfügen › 📋 Stunde & Rückmeldung: die Vorlagen stehen vorn (dazu 📒 Heft und 🗂 Vokabeltrainer)
nachDemZeichnen.push(() => document.querySelectorAll('.tiles').forEach(box => {
  if (box.querySelector('.ms-tile') || ![...box.children].some(c => /^(Blitzlicht|Exit-Ticket)/.test(c.textContent.trim()))) return;
  const knopf = (sym, name, fn) => { const b = document.createElement('button'); b.className = 'tile ms-tile'; b.onclick = fn;
    const em = document.createElement('div'); em.className = 'em'; em.textContent = sym; b.append(em, name); return b; };
  box.prepend(...(T.hausaufgabenheft ? [knopf('📒', T.SCHUELER ? 'Hausaufgabenheft' : 'Aufgaben & Notizen', () => T.hausaufgabenheft())] : []), knopf('🗂', 'Vokabeltrainer', () => T.vokabeltrainer()),
    ...MITSCHRIFT.map(k => { const b = document.createElement('button'); b.className = 'tile ms-tile'; b.onclick = () => einfuegen(k);
      const img = document.createElement('img'); img.src = bild(k); img.alt = ''; b.append(img, B[k].name); return b; }));
}));

// ---------- 🗂 Vokabeltrainer: eigene Listen, Karteikarten oder Eintippen, Falsches kommt wieder ----------
const VK_KEY = 'tafelapp.vokabeln.v1';
const vkLaden = () => { try { return JSON.parse(localStorage.getItem(VK_KEY)) || []; } catch (e) { return []; } };
const vkSpeichern = l => { try { localStorage.setItem(VK_KEY, JSON.stringify(l)); } catch (e) { T.toast && T.toast('Speichern nicht möglich (privates Fenster?)', 2600); } };
const paareAus = txt => String(txt || '').split(/\r?\n/).map(z => z.split(/\s*(?:;|\t| = | – | - )\s*/)).filter(p => p.length >= 2 && p[0].trim() && p[1].trim()).map(p => [p[0].trim(), p.slice(1).join(' ').trim()]);
const norm = s => String(s).toLowerCase().replace(/^(to|the|a|an|der|die|das|ein|eine)\s+/, '').replace(/[.,!?;:"'()]/g, '').replace(/\s+/g, ' ').trim();
const richtig = (eingabe, loesung) => { const e = norm(eingabe); return !!e && String(loesung).split(/[,/]/).some(l => norm(l) === e) || norm(loesung) === e; };
const mischen = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
T.vokabeltrainer = () => {
  const h = T.h; let listen = vkLaden();
  const zeige = (...inhalt) => T.openDlg([h('h2', {}, '🗂 Vokabeltrainer'), ...inhalt]);
  const knopf = (l, fn, prim) => h('button', { class: 'big' + (prim ? ' prim' : ''), onclick: fn }, l);
  const uebersicht = () => zeige(
    listen.length ? h('div', { class: 'ha-liste' }, ...listen.map(L => h('div', { class: 'vk-zeile' }, h('b', {}, L.name || 'Liste'), h('span', { class: 'hint' }, L.paare.length + ' Wörter'),
      knopf('▶ Üben', () => start(L), true), knopf('✏️', () => bearbeiten(L)), knopf('🗑', async () => { if (await T.frage('Liste „' + L.name + '“ löschen?', { ok: 'Löschen' })) { listen = listen.filter(x => x !== L); vkSpeichern(listen); uebersicht(); } else uebersicht(); }))))
      : h('p', { class: 'hint' }, 'Noch keine Vokabelliste. Lege eine an – z. B. die Wörter einer Unit.'),
    h('div', { class: 'acts' }, knopf('＋ Neue Liste', () => bearbeiten(null), true)));
  const bearbeiten = L => {
    const name = h('input', { class: 'feld', placeholder: 'Name der Liste, z. B. Unit 2 – Food', value: L ? L.name : '', style: { width: '100%' } });
    // Tabelle: je Zeile Wort | Übersetzung | 🗑 – Enter springt weiter, in der letzten Zeile kommt eine neue dazu
    const kopfA = h('input', { class: 'feld vk-kopf', value: (L && L.spalten && L.spalten[0]) || 'Englisch' }), kopfB = h('input', { class: 'feld vk-kopf', value: (L && L.spalten && L.spalten[1]) || 'Deutsch' });
    const tab = h('div', { class: 'vk-tab' });
    const zeile = (a = '', b = '') => {
      const ia = h('input', { class: 'feld', value: a, autocomplete: 'off', spellcheck: 'false' }), ib = h('input', { class: 'feld', value: b, autocomplete: 'off', spellcheck: 'false' });
      const r = h('div', { class: 'vk-reihe' }, ia, ib, h('button', { class: 'ha-weg', title: 'Zeile löschen', onclick: () => { r.remove(); if (!tab.children.length) zeile(); } }, '🗑'));
      ia.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ib.focus(); } });
      ib.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const n = r.nextElementSibling; (n ? n.querySelector('input') : zeile().querySelector('input')).focus(); } });
      ia.addEventListener('paste', e => { const txt = (e.clipboardData || window.clipboardData).getData('text'); const p = paareAus(txt); if (p.length < 2 && !/\r?\n/.test(txt)) return; /* mehrere Zeilen aus Word/Excel einfügen */
        e.preventDefault(); if (!p.length) return; ia.value = p[0][0]; ib.value = p[0][1]; let nach = r; p.slice(1).forEach(([x, y]) => { const z = zeile(x, y); nach.after(z); nach = z; }); });
      tab.append(r); return r; };
    (L && L.paare.length ? L.paare : [['', ''], ['', ''], ['', '']]).forEach(([a, b]) => zeile(a, b));
    zeige(name, h('div', { class: 'vk-reihe vk-titel' }, kopfA, kopfB, h('span', {})), tab,
      h('div', { class: 'row', style: { gap: '8px', marginTop: '8px' } }, h('button', { class: 'big', onclick: () => zeile().querySelector('input').focus() }, '＋ Zeile')),
      h('p', { class: 'hint' }, 'Enter springt zum nächsten Feld. Mehrere richtige Antworten mit Komma trennen (z. B. Freund, Freundin). Eine Liste aus Word oder Excel lässt sich in die erste Zelle einfügen.'),
      h('div', { class: 'acts' }, knopf('Abbrechen', uebersicht), knopf('💾 Speichern', () => {
        const paare = [...tab.children].map(r => [...r.querySelectorAll('input')].map(i => i.value.trim())).filter(([a, b]) => a && b);
        if (!paare.length) { T.toast('Bitte mindestens eine Zeile mit Wort und Übersetzung ausfüllen', 3000); return; }
        const spalten = [kopfA.value.trim() || 'Wort', kopfB.value.trim() || 'Übersetzung'];
        if (L) { L.name = name.value.trim() || L.name; L.paare = paare; L.spalten = spalten; } else listen.push({ id: Date.now(), name: name.value.trim() || 'Meine Vokabeln', paare, spalten });
        vkSpeichern(listen); uebersicht(); }, true)));
    setTimeout(() => (L ? tab.querySelector('input') : name).focus(), 50);
  };
  const start = L => {
    let richtung = 'ab', modus = 'karte';
    const wahl = (opts, akt, set) => h('div', { class: 'row', style: { gap: '8px', flexWrap: 'wrap' } }, ...opts.map(([v, l]) => h('button', { class: 'big' + (v === akt() ? ' on' : ''), onclick: e => { set(v); [...e.target.parentNode.children].forEach(c => c.classList.toggle('on', c === e.target)); } }, l)));
    zeige(h('h3', {}, L.name + ' · ' + L.paare.length + ' Wörter'),
      h('p', { class: 'hint' }, 'Richtung'), wahl((([a, b]) => [['ab', a + ' → ' + b], ['ba', b + ' → ' + a], ['mix', '🔀 gemischt']])(L.spalten || ['links', 'rechts']), () => richtung, v => { richtung = v; }),
      h('p', { class: 'hint' }, 'So üben'), wahl([['karte', '🃏 Karteikarten (umdrehen)'], ['tippen', '⌨ Antwort eintippen']], () => modus, v => { modus = v; }),
      h('div', { class: 'acts' }, knopf('← Zurück', uebersicht), knopf('▶ Los', () => ueben(L, L.paare, richtung, modus), true)));
  };
  const ueben = (L, paare, richtung, modus) => {
    const karten = mischen(paare.map(p => { const um = richtung === 'ba' || (richtung === 'mix' && Math.random() < 0.5); return { frage: um ? p[1] : p[0], antwort: um ? p[0] : p[1], paar: p }; }));
    const falsch = new Set(); let gewusst = 0, schritt = 0; const gesamt = karten.length;
    const stand = () => h('p', { class: 'hint' }, `Noch ${karten.length} · ✓ ${gewusst} gewusst` + (falsch.size ? ` · ${falsch.size} zum Wiederholen` : ''));
    const karte = (txt, sub) => h('div', { class: 'vk-karte' }, h('div', { class: 'vk-wort' }, txt), sub ? h('div', { class: 'vk-loes' }, sub) : '');
    const weiter = ok => { const k = karten.shift(); if (ok) gewusst++; else { falsch.add(k.paar); karten.splice(Math.min(karten.length, 3), 0, k); } schritt++; naechste(); }; /* Falsches kommt nach 3 Karten wieder */
    const naechste = () => {
      if (!karten.length) return zeige(h('div', { class: 'vk-karte' }, h('div', { class: 'vk-wort' }, '🎉 Geschafft!'), h('div', { class: 'vk-loes' }, `${gesamt} Wörter · ${falsch.size ? falsch.size + ' musstest du wiederholen' : 'alle beim ersten Mal gewusst'}`)),
        falsch.size ? h('p', { class: 'hint' }, 'Wiederholen: ' + [...falsch].map(p => p[0] + ' – ' + p[1]).join(' · ')) : '',
        h('div', { class: 'acts' }, knopf('← Listen', uebersicht), falsch.size ? knopf('🔁 Nur die schwierigen', () => ueben(L, [...falsch], richtung, modus)) : '', knopf('🔁 Alles nochmal', () => ueben(L, L.paare, richtung, modus), true)));
      const k = karten[0];
      if (modus === 'karte') {
        zeige(stand(), karte(k.frage), h('div', { class: 'acts' }, knopf('↩ Umdrehen', () => zeige(stand(), karte(k.frage, k.antwort),
          h('div', { class: 'acts' }, knopf('✗ Noch nicht', () => weiter(false)), knopf('✓ Gewusst', () => weiter(true), true))), true)));
      } else {
        const ein = h('input', { class: 'feld', placeholder: 'Antwort', style: { width: '100%', fontSize: '22px' }, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
        const pruefen = () => { const ok = richtig(ein.value, k.antwort);
          zeige(stand(), karte(k.frage, (ok ? '✓ Richtig: ' : '✗ Richtig wäre: ') + k.antwort), ok ? '' : h('p', { class: 'hint' }, 'Deine Antwort: ' + (ein.value || '–')),
            h('div', { class: 'acts' }, ok ? '' : knopf('Hatte ich doch richtig', () => weiter(true)), knopf('Weiter ▶', () => weiter(ok), true))); };
        ein.addEventListener('keydown', e => { if (e.key === 'Enter') pruefen(); });
        zeige(stand(), karte(k.frage), ein, h('div', { class: 'acts' }, knopf('Weiß ich nicht', () => { ein.value = ''; pruefen(); }), knopf('Prüfen', pruefen, true)));
        setTimeout(() => ein.focus(), 50);
      }
    };
    naechste();
  };
  uebersicht();
};
document.head.append(Object.assign(document.createElement('style'), { textContent:
  '.vk-zeile{display:grid;grid-template-columns:1fr auto auto auto auto;align-items:center;gap:8px;padding:6px 10px;border:1.5px solid var(--line);border-radius:12px}' +
  '.vk-tab{display:flex;flex-direction:column;gap:6px;max-height:48vh;overflow:auto;margin-top:4px}' +
  '.vk-reihe{display:grid;grid-template-columns:1fr 1fr 40px;gap:8px;align-items:center}.vk-reihe input{width:100%;box-sizing:border-box;font-size:18px}' +
  '.vk-titel{margin-top:10px}.vk-kopf{font-weight:700;background:transparent!important;border-style:dashed!important}' +
  '.vk-karte{margin:14px 0;padding:34px 20px;border-radius:18px;border:2px solid var(--line);background:var(--surface);text-align:center}' +
  '.vk-wort{font-size:36px;font-weight:700}.vk-loes{margin-top:16px;font-size:26px;color:#2e7d32;font-weight:600}' }));

})();
