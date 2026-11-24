// Tafel-App – 🤝 Klassenleben & Lernen: Vorlagen für Klassenlehrer-Stunden, Sozialtraining und Methoden (Vorlagen › 🤝 Klassenleben & Lernen)
// Klassenregeln erarbeiten · Arbeitsverhalten erklärt · Sozialverhalten erklärt · Lernen lernen · Kalender · Gefühlskarten ·
// Impulse zum Nachdenken · Präsentieren mit Plakat · Präsentieren mit PowerPoint/PC · Präsentationen bewerten
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', ROT = '#c62828', LILA = '#6a1b9a', GRAU = '#64748b', RAND = '#3a6d99', TINTE = '#1b1f2a';
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const fett = 'font-weight="700"';
const box = (x, y, w, h, rand, fuell, r = 14, sw = 2.5) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const linien = (x0, x1, y, n, abst = 44) => { let s = ''; for (let i = 0; i < n; i++) s += `<line x1="${x0}" y1="${y + i * abst}" x2="${x1}" y2="${y + i * abst}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6 6"/>`; return s; };
const umbruch = (z, max) => { const out = []; let cur = ''; for (const w of String(z).split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
function tafel(icon, titel, W, H, inhalt, P) {
  return { svg: T._svg.doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 44, icon + ' ' + titel, 32, P.ink, fett) + inhalt), w: W, h: H };
}
/* Liste aus Karten: [Überschrift, Erklärung, Farbe] – zwei Spalten, Höhe passt sich an */
function karten(liste, y0, P, spalten = 2, W = 1000) {
  const sw = (W - 60 - (spalten - 1) * 20) / spalten, max = Math.round(sw / 11.5); let s = '', y = y0, hoeheZeile = 0;
  liste.forEach(([t, erkl, col], i) => {
    const sp = i % spalten, zl = umbruch(erkl, max), hh = 52 + zl.length * 26 + 12;
    if (sp === 0) { y += hoeheZeile; hoeheZeile = 0; }
    const hMax = Math.max(...liste.slice(i - sp, i - sp + spalten).map(([, e]) => 52 + umbruch(e, max).length * 26 + 12));
    const x = 30 + sp * (sw + 20);
    s += box(x, y, sw, hMax, col, 'none', 12) + `<rect x="${f(x)}" y="${y}" width="${f(sw)}" height="40" rx="12" fill="${col}" opacity=".14"/>` + text(x + 16, y + 21, t, 21, col, fett);
    zl.forEach((z, j) => { s += text(x + 16, y + 62 + j * 26, z, 19, P.ink); });
    hoeheZeile = Math.max(hoeheZeile, hMax + 14);
  });
  return { s, y: y + hoeheZeile };
}

// ---------- Klassenregeln erarbeiten ----------
B.kl_regeln = { name: 'Klassenregeln erarbeiten', gruppe: 'Struktur', def: { thema: 'weg', regeln: 6 },
  felder: [{ k: 'thema', l: 'Tafel', typ: 'auswahl', opts: [['weg', 'So erarbeiten wir unsere Regeln'], ['plakat', 'Unsere Klassenregeln (zum Ausfüllen)']] }, { k: 'regeln', l: 'Zeilen für Regeln', typ: 'zahl', min: 3, max: 10 }],
  gen: (d, P) => {
    if (d.thema === 'plakat') {
      const n = Math.round(T.clamp(+d.regeln || 6, 3, 10)), W = 1000, H = 150 + n * 62 + 170; let s = '';
      s += text(30, 92, 'So wollen wir miteinander lernen und leben:', 21, GRAU);
      for (let i = 0; i < n; i++) { const y = 140 + i * 62; s += `<circle cx="56" cy="${y + 14}" r="19" fill="${BLAU}"/>` + mitte(56, y + 15, String(i + 1), 20, '#fff', fett) + linien(92, 970, y + 30, 1); }
      const yU = 150 + n * 62 + 20;
      s += text(30, yU, 'Wenn jemand eine Regel nicht einhält:', 20, P.ink, fett) + linien(30, 970, yU + 40, 1);
      s += text(30, yU + 90, 'Unterschriften:', 20, P.ink, fett) + linien(200, 970, yU + 100, 1);
      return tafel('📜', 'Unsere Klassenregeln', W, H, s, P);
    }
    const SCHRITTE = [['1  Sammeln', 'Was ist uns wichtig, damit sich alle wohlfühlen und gut lernen können? Jede und jeder schreibt Ideen auf Karten.', BLAU],
      ['2  Ordnen', 'Ähnliche Karten zusammenlegen. Was gehört zusammen? Doppeltes weglassen.', LILA],
      ['3  Auswählen', 'Wenige Regeln reichen – höchstens 5 bis 7. Was ist am wichtigsten?', ORANGE],
      ['4  Positiv formulieren', 'Sagen, was wir tun: „Wir lassen andere ausreden.“ statt „Nicht dazwischenreden!“', GRUEN],
      ['5  Folgen vereinbaren', 'Was passiert, wenn jemand eine Regel nicht einhält? Fair und für alle gleich.', ROT],
      ['6  Abstimmen und unterschreiben', 'Alle stimmen ab und unterschreiben. So gelten die Regeln für alle – auch für Lehrkräfte.', BLAU],
      ['7  Überprüfen', 'Regelmäßig im Klassenrat schauen: Klappt es? Muss eine Regel geändert werden?', GRAU]];
    const k = karten(SCHRITTE, 80, P);
    return tafel('📜', 'So erarbeiten wir unsere Klassenregeln', 1000, k.y + 20, k.s, P);
  } };
B.kl_regeln.schnell = [{ l: '🔁 Weg ↔ Plakat', f: dd => ({ d: { ...dd, thema: dd.thema === 'plakat' ? 'weg' : 'plakat' } }) }, { l: '＋ Zeile', f: dd => ({ d: { ...dd, regeln: Math.min(10, (+dd.regeln || 6) + 1) } }) }];

// ---------- Arbeits- und Sozialverhalten erklärt (Bewertungsbereiche wie auf dem Zeugnis in Niedersachsen) ----------
const STUFEN_AV = [['A', 'verdient besondere Anerkennung'], ['B', 'entspricht den Erwartungen in vollem Umfang'], ['C', 'entspricht den Erwartungen'], ['D', 'entspricht den Erwartungen mit Einschränkungen'], ['E', 'entspricht nicht den Erwartungen']];
function stufenLeiste(y, P) {
  let s = text(30, y, 'So wird bewertet:', 21, P.ink, fett); const farben = ['#2e7d32', '#558b2f', '#1565c0', '#ef6c00', '#c62828'];
  STUFEN_AV.forEach(([b, t], i) => { const yy = y + 34 + i * 36; s += `<circle cx="48" cy="${yy}" r="15" fill="${farben[i]}"/>` + mitte(48, yy + 1, b, 17, '#fff', fett) + text(74, yy, t, 19, P.ink); });
  return s;
}
const AV = [['Leistungsbereitschaft und Mitarbeit', 'Ich arbeite im Unterricht mit, melde mich und gebe mir Mühe – auch wenn etwas schwer ist.', BLAU],
  ['Ziel- und Ergebnisorientierung', 'Ich arbeite auf ein Ziel hin und bringe Aufgaben zu Ende.', LILA],
  ['Kooperationsfähigkeit', 'Ich arbeite gut mit anderen zusammen, höre zu und teile Aufgaben fair auf.', GRUEN],
  ['Selbstständigkeit', 'Ich fange von selbst an, hole mir Hilfe, wenn ich nicht weiterkomme, und plane meine Arbeit.', ORANGE],
  ['Sorgfalt und Ausdauer', 'Ich arbeite ordentlich und genau und bleibe dran, bis ich fertig bin.', ROT],
  ['Verlässlichkeit', 'Ich habe mein Material dabei, mache Hausaufgaben und halte Absprachen ein.', GRAU]];
const SV = [['Reflexionsfähigkeit', 'Ich denke über mein Verhalten nach und kann sagen, was gut lief und was nicht.', BLAU],
  ['Konfliktfähigkeit', 'Ich löse Streit mit Worten, höre die andere Seite an und suche gemeinsam eine Lösung.', ROT],
  ['Vereinbaren und Einhalten von Regeln, Fairness', 'Ich halte mich an Regeln und bin fair zu allen.', ORANGE],
  ['Hilfsbereitschaft und Achtung anderer', 'Ich helfe anderen und gehe respektvoll mit allen um.', GRUEN],
  ['Übernahme von Verantwortung', 'Ich übernehme Dienste und Aufgaben und stehe zu meinen Fehlern.', LILA],
  ['Mitgestaltung des Gemeinschaftslebens', 'Ich bringe mich in die Klasse ein, zum Beispiel im Klassenrat oder bei Festen.', GRAU]];
const verhalten = (titel, icon, liste, einleitung) => (d, P) => {
  const k = karten(liste, 110, P); let s = text(30, 86, einleitung, 20, GRAU) + k.s;
  if (d.stufen !== false) s += stufenLeiste(k.y + 10, P);
  return tafel(icon, titel, 1000, k.y + (d.stufen !== false ? 220 : 20), s, P);
};
B.kl_av = { name: 'Arbeitsverhalten erklärt', gruppe: 'Struktur', def: { stufen: true }, felder: [{ k: 'stufen', l: 'Bewertungsstufen A–E zeigen', typ: 'check' }],
  gen: verhalten('Arbeitsverhalten – was heißt das?', '📝', AV, 'Auf dem Zeugnis wird das Arbeitsverhalten in diesen Bereichen eingeschätzt:') };
B.kl_sv = { name: 'Sozialverhalten erklärt', gruppe: 'Struktur', def: { stufen: true }, felder: [{ k: 'stufen', l: 'Bewertungsstufen A–E zeigen', typ: 'check' }],
  gen: verhalten('Sozialverhalten – was heißt das?', '🤝', SV, 'Auf dem Zeugnis wird das Sozialverhalten in diesen Bereichen eingeschätzt:') };
B.kl_av.schnell = B.kl_sv.schnell = [{ l: '🔤 Stufen A–E ein/aus', f: dd => ({ d: { ...dd, stufen: dd.stufen === false } }) }];

// ---------- Lernen lernen ----------
const METHODEN = [['🗂 Lernkartei', 'Frage vorne, Antwort hinten. Gewusste Karten wandern ein Fach weiter, falsche zurück nach vorn.', BLAU],
  ['🧠 Selbst abfragen', 'Buch zu – was weiß ich noch? Aufschreiben oder erzählen. Das merkt man sich besser als bloßes Durchlesen.', LILA],
  ['📅 Verteilt lernen', 'Lieber jeden Tag 15 Minuten als alles am Abend vor der Arbeit. Nach ein paar Tagen wiederholen.', GRUEN],
  ['🗣 Erklären', 'Wer etwas einer anderen Person erklären kann, hat es verstanden. Lernpartner suchen!', ORANGE],
  ['🗺 Mindmap', 'Thema in die Mitte, Unterthemen als Äste, Stichworte daran. So entsteht ein Überblick.', ROT],
  ['🖍 Markieren und zusammenfassen', 'Erst lesen, dann nur das Wichtigste markieren und in eigenen Worten aufschreiben.', GRAU],
  ['🔗 Eselsbrücken', 'Merksätze, Reime oder Bilder helfen beim Erinnern – zum Beispiel für Reihenfolgen.', BLAU],
  ['✍️ Üben mit Aufgaben', 'Aufgaben ohne Lösung rechnen oder schreiben, dann selbst kontrollieren.', GRUEN]];
const TIPPS = [['🪑 Fester Lernplatz', 'Ruhig, hell, aufgeräumt – alles Nötige liegt bereit.', BLAU],
  ['📵 Handy weg', 'Benachrichtigungen lenken ab. Handy in einen anderen Raum legen.', ROT],
  ['🎯 Kleines Ziel setzen', '„Heute lerne ich 10 Vokabeln.“ statt „Ich lerne Englisch.“', ORANGE],
  ['⏱ Pausen machen', 'Nach etwa 20–30 Minuten kurz aufstehen, trinken, bewegen.', GRUEN],
  ['😴 Gut schlafen', 'Im Schlaf festigt das Gehirn, was wir gelernt haben.', LILA],
  ['✅ Kontrollieren', 'Am Ende prüfen: Was kann ich jetzt? Was muss ich noch üben?', GRAU]];
B.kl_lernen = { name: 'Lernen lernen', gruppe: 'Struktur', def: { thema: 'methoden' }, felder: [{ k: 'thema', l: 'Tafel', typ: 'auswahl', opts: [['methoden', 'Lernmethoden'], ['tipps', 'Tipps für gutes Lernen']] }],
  gen: (d, P) => { const tipps = d.thema === 'tipps', k = karten(tipps ? TIPPS : METHODEN, 80, P);
    return tafel('🎓', tipps ? 'Lernen lernen – Tipps für gutes Lernen' : 'Lernen lernen – Lernmethoden', 1000, k.y + 20, k.s, P); } };
B.kl_lernen.schnell = [{ l: '🔁 Methoden ↔ Tipps', f: dd => ({ d: { ...dd, thema: dd.thema === 'tipps' ? 'methoden' : 'tipps' } }) }];

// ---------- Kalender ----------
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const jetzt = new Date();
B.kl_kalender = { name: 'Kalender (Monat)', gruppe: 'Struktur', def: { monat: jetzt.getMonth() + 1, jahr: jetzt.getFullYear(), heute: true },
  felder: [{ k: 'monat', l: 'Monat (1–12)', typ: 'zahl', min: 1, max: 12 }, { k: 'jahr', l: 'Jahr', typ: 'zahl', min: 2000, max: 2100 }, { k: 'heute', l: 'Heute markieren', typ: 'check' }],
  gen: (d, P) => {
    const m = Math.round(T.clamp(+d.monat || 1, 1, 12)), j = Math.round(T.clamp(+d.jahr || 2026, 2000, 2100));
    const erster = (new Date(j, m - 1, 1).getDay() + 6) % 7, tage = new Date(j, m, 0).getDate(), wochen = Math.ceil((erster + tage) / 7);
    const W = 1000, cw = 134, ch = 96, x0 = 31, y0 = 130, H = y0 + wochen * ch + 30; let s = '';
    ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].forEach((t, i) => { s += mitte(x0 + i * cw + cw / 2, 104, t, 20, i > 4 ? ROT : P.ink, fett); });
    const h0 = new Date(); for (let z = 0; z < wochen * 7; z++) {
      const tag = z - erster + 1, x = x0 + (z % 7) * cw, y = y0 + Math.floor(z / 7) * ch, gueltig = tag >= 1 && tag <= tage, we = z % 7 > 4;
      const heute = d.heute && gueltig && h0.getFullYear() === j && h0.getMonth() + 1 === m && h0.getDate() === tag;
      s += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${heute ? 'rgba(21,101,192,.16)' : we ? 'rgba(198,40,40,.05)' : 'none'}" stroke="#94a3b8" stroke-width="1.2"/>`;
      if (gueltig) s += text(x + 10, y + 20, String(tag), 22, heute ? BLAU : we ? ROT : P.ink, heute ? fett : '');
      if (heute) s += `<rect x="${x + 2}" y="${y + 2}" width="${cw - 4}" height="${ch - 4}" fill="none" stroke="${BLAU}" stroke-width="3"/>`;
    }
    return tafel('📅', MONATE[m - 1] + ' ' + j, W, H, s, P);
  } };
B.kl_kalender.schnell = [{ l: '◀ Monat', f: dd => { let m = (+dd.monat || 1) - 1, j = +dd.jahr || 2026; if (m < 1) { m = 12; j--; } return { d: { ...dd, monat: m, jahr: j } }; } },
  { l: 'Monat ▶', f: dd => { let m = (+dd.monat || 1) + 1, j = +dd.jahr || 2026; if (m > 12) { m = 1; j++; } return { d: { ...dd, monat: m, jahr: j } }; } },
  { l: '📅 Dieser Monat', f: dd => { const n = new Date(); return { d: { ...dd, monat: n.getMonth() + 1, jahr: n.getFullYear() } }; } }];

// ---------- Gefühlskarten (Sozialtraining) ----------
const GEFUEHLE = [['😀', 'fröhlich', '#fff59d'], ['😢', 'traurig', '#90caf9'], ['😠', 'wütend', '#ef9a9a'], ['😨', 'ängstlich', '#b39ddb'],
  ['😮', 'überrascht', '#ffe082'], ['😊', 'stolz', '#a5d6a7'], ['😳', 'verlegen', '#f8bbd0'], ['😑', 'gelangweilt', '#cfd8dc'],
  ['😞', 'enttäuscht', '#9fa8da'], ['🤩', 'begeistert', '#ffcc80'], ['😒', 'eifersüchtig', '#c5e1a5'], ['🥺', 'einsam', '#b0bec5'],
  ['😌', 'zufrieden', '#c8e6c9'], ['😤', 'genervt', '#ffab91'], ['🥰', 'geliebt', '#f48fb1'], ['😴', 'müde', '#d1c4e9']];
B.kl_gefuehle = { name: 'Gefühlskarten', gruppe: 'Struktur', def: { thema: 'karten', anzahl: 16 },
  felder: [{ k: 'thema', l: 'Tafel', typ: 'auswahl', opts: [['karten', 'Gefühlskarten'], ['satz', 'Über Gefühle sprechen (Satzanfänge)'], ['barometer', 'Wie geht es mir heute? (Stimmungsbarometer)']] }, { k: 'anzahl', l: 'Anzahl Karten (8–16)', typ: 'zahl', min: 8, max: 16 }],
  gen: (d, P) => {
    if (d.thema === 'satz') {
      const SAETZE = [['Ich fühle mich …, weil …', BLAU], ['Mir geht es gerade …', LILA], ['Mir hilft, wenn …', GRUEN], ['Ich-Botschaft: Ich fühle mich …, wenn du … . Ich wünsche mir, dass …', ORANGE], ['Ich habe bemerkt, dass du … . Wie geht es dir?', ROT]];
      let s = text(30, 86, 'Gefühle in Worte fassen – diese Satzanfänge helfen:', 20, GRAU); let y = 110;
      for (const [t, col] of SAETZE) { const zl = umbruch(t, 70), hh = 30 + zl.length * 30 + 52; s += box(30, y, 940, hh, col, 'none', 12) + zl.map((z, i) => text(52, y + 32 + i * 30, z, 23, col, fett)).join('') + linien(52, 948, y + 30 + zl.length * 30 + 22, 1); y += hh + 14; }
      return tafel('💬', 'Über Gefühle sprechen', 1000, y + 16, s, P);
    }
    if (d.thema === 'barometer') {
      const L = [['🤩', 'super', '#66bb6a'], ['🙂', 'gut', '#9ccc65'], ['😐', 'geht so', '#ffee58'], ['🙁', 'nicht so gut', '#ffa726'], ['😢', 'schlecht', '#ef5350']];
      let s = text(30, 86, 'Jede und jeder setzt einen Punkt oder Namen in das passende Feld.', 20, GRAU);
      L.forEach(([e, t, c], i) => { const y = 110 + i * 104; s += `<rect x="30" y="${y}" width="940" height="92" rx="14" fill="${c}" opacity=".35" stroke="${c}" stroke-width="3"/>` + mitte(90, y + 47, e, 50, '#000') + text(150, y + 46, t, 26, TINTE, fett); });
      return tafel('🌡', 'Wie geht es mir heute?', 1000, 110 + 5 * 104 + 20, s, P);
    }
    const n = Math.round(T.clamp(+d.anzahl || 16, 8, 16)), sp = 4, cw = 222, chh = 170, W = 1000, zeilenN = Math.ceil(n / sp), H = 90 + zeilenN * (chh + 16) + 20; let s = '';
    GEFUEHLE.slice(0, n).forEach(([e, t, c], i) => { const x = 30 + (i % sp) * (cw + 16), y = 84 + Math.floor(i / sp) * (chh + 16);
      s += `<rect x="${x}" y="${y}" width="${cw}" height="${chh}" rx="16" fill="${c}" stroke="#37474f" stroke-width="1.5"/>` + mitte(x + cw / 2, y + 70, e, 64, '#000') + mitte(x + cw / 2, y + 140, t, 24, TINTE, fett); });
    return tafel('🎭', 'Gefühlskarten', W, H, s, P);
  } };
B.kl_gefuehle.schnell = [{ l: '🎭 Karten', f: dd => ({ d: { ...dd, thema: 'karten' } }) }, { l: '💬 Satzanfänge', f: dd => ({ d: { ...dd, thema: 'satz' } }) }, { l: '🌡 Barometer', f: dd => ({ d: { ...dd, thema: 'barometer' } }) }];

// ---------- Impulse zum Nachdenken ----------
const IMPULSE = ['Was hat dich heute zum Lächeln gebracht?', 'Wofür bist du heute dankbar?', 'Was macht für dich eine gute Freundin oder einen guten Freund aus?',
  'Wann warst du das letzte Mal richtig stolz auf dich?', 'Was würdest du tun, wenn du einen Tag lang unsichtbar wärst?', 'Wie kannst du heute jemandem eine Freude machen?',
  'Was hast du diese Woche Neues gelernt?', 'Was ist mutiger: Nein sagen oder Ja sagen?', 'Wenn du etwas an unserer Schule ändern könntest – was wäre es?',
  'Was tust du, wenn du wütend bist? Was hilft dir?', 'Welche Eigenschaft magst du an dir besonders?', 'Wann hat dir zuletzt jemand geholfen?',
  'Was bedeutet für dich Gerechtigkeit?', 'Ist es immer richtig, die Wahrheit zu sagen?', 'Was würdest du einem neuen Kind in unserer Klasse raten?',
  'Worauf freust du dich in diesem Monat?', 'Was ist wichtiger: viel Geld oder viel Zeit?', 'Was kannst du gut, was andere vielleicht nicht wissen?',
  'Wie sieht für dich ein perfekter Tag aus?', 'Was machst du, wenn jemand ausgeschlossen wird?', 'Welchen Fehler hast du gemacht – und was hast du daraus gelernt?',
  'Was bedeutet es, ein gutes Vorbild zu sein?', 'Wofür würdest du dich einsetzen?', 'Was beruhigt dich, wenn du aufgeregt bist?'];
B.kl_impuls = { name: 'Impuls zum Nachdenken', gruppe: 'Struktur', def: { nr: 0, eigener: '' },
  felder: [{ k: 'eigener', l: 'Eigener Impuls (leer = aus der Sammlung)', typ: 'text' }, { k: 'nr', l: 'Nummer in der Sammlung (0–' + (IMPULSE.length - 1) + ')', typ: 'zahl', min: 0, max: IMPULSE.length - 1 }],
  gen: (d, P) => {
    const t = (d.eigener || '').trim() || IMPULSE[Math.abs(Math.round(+d.nr || 0)) % IMPULSE.length], zl = umbruch(t, 38), W = 1000, H = 200 + zl.length * 50 + 110;
    let s = `<rect x="30" y="80" width="940" height="${H - 110}" rx="22" fill="#fff8e1" stroke="${ORANGE}" stroke-width="3"/>` + mitte(500, 132, '💭', 54, '#000');
    zl.forEach((z, i) => { s += mitte(500, 200 + i * 50, z, 36, TINTE, fett); });
    s += linien(80, 920, H - 66, 1) + text(80, H - 92, 'Meine Gedanken:', 18, GRAU);
    return tafel('💭', 'Impuls zum Nachdenken', W, H, s, P);
  } };
B.kl_impuls.schnell = [{ l: '🎲 Neuer Impuls', f: dd => { let n; do { n = Math.floor(Math.random() * IMPULSE.length); } while (n === +dd.nr && IMPULSE.length > 1); return { d: { ...dd, nr: n, eigener: '' } }; } },
  { l: '▶ Nächster', f: dd => ({ d: { ...dd, nr: ((+dd.nr || 0) + 1) % IMPULSE.length, eigener: '' } }) }];

// ---------- Präsentieren: Plakat · PowerPoint/PC · Bewerten ----------
const PLAKAT = [['📰 Überschrift', 'Groß, kurz und auf Abstand lesbar – auch aus der letzten Reihe.', BLAU],
  ['✂️ Stichworte statt Sätze', 'Nur das Wichtigste in Stichworten. Den Rest erzählst du beim Vortrag.', LILA],
  ['🔠 Gut lesbare Schrift', 'Groß, in Druckschrift, mit dickem Stift. Nicht zu eng schreiben.', GRUEN],
  ['🧩 Klare Gliederung', 'Inhalte in Blöcke oder Kästen aufteilen. Pfeile zeigen Zusammenhänge.', ORANGE],
  ['🖼 Bilder und Skizzen', 'Passende Bilder, Diagramme oder Zeichnungen – mit Beschriftung.', ROT],
  ['🎨 Farben sparsam', 'Wenige Farben, immer mit gleicher Bedeutung (z. B. Überschriften blau).', GRAU],
  ['📏 Platz lassen', 'Nicht alles vollschreiben – Freiraum macht das Plakat übersichtlich.', BLAU],
  ['📚 Quellen angeben', 'Unten klein notieren, woher Bilder und Informationen stammen.', LILA]];
const VORTRAG = [['🗣 Frei sprechen', 'Mit Stichwortkarten, nicht ablesen.', GRUEN], ['👀 Blickkontakt', 'Zum Publikum schauen, nicht zum Plakat oder zur Wand.', ORANGE],
  ['🔊 Laut und langsam', 'Deutlich sprechen und Pausen machen.', ROT], ['👉 Zeigen', 'Beim Erklären auf die passende Stelle zeigen.', BLAU]];
const PC = [['🧾 Wenig Text pro Folie', 'Höchstens etwa 5 Stichpunkte. Keine ganzen Sätze abschreiben.', BLAU],
  ['🔠 Große Schrift', 'Mindestens 24 Punkt, gut lesbare Schriftart, starker Kontrast (dunkel auf hell).', LILA],
  ['🎨 Einheitliches Design', 'Gleicher Hintergrund, gleiche Farben und Schriften auf allen Folien.', GRUEN],
  ['🖼 Bilder statt Textwüsten', 'Bilder, Diagramme und Grafiken erklären oft mehr als Text.', ORANGE],
  ['✨ Effekte sparsam', 'Animationen und Übergänge nur, wenn sie etwas zeigen – sonst lenken sie ab.', ROT],
  ['🧭 Roter Faden', 'Titelfolie, Gliederung, Hauptteil, Zusammenfassung – in sinnvoller Reihenfolge.', GRAU],
  ['📚 Quellen', 'Auf der letzten Folie angeben, woher Bilder und Informationen stammen.', BLAU],
  ['🔌 Technik testen', 'Vorher ausprobieren: Startet die Datei? Funktionieren Beamer und Ton?', LILA]];
const PC_VORTRAG = [['🗣 Nicht vorlesen', 'Die Folien unterstützen – du erklärst frei.', GRUEN], ['👀 Zum Publikum', 'Zum Publikum sprechen, nicht zur Leinwand.', ORANGE],
  ['⏱ Zeit einhalten', 'Üben und dabei die Zeit stoppen.', ROT], ['❓ Fragen', 'Am Ende Zeit für Fragen lassen.', BLAU]];
const KRITERIEN = [['Inhalt', ['fachlich richtig', 'vollständig und auf das Thema bezogen', 'verständlich erklärt']],
  ['Aufbau', ['Einleitung – Hauptteil – Schluss', 'roter Faden, sinnvolle Reihenfolge']],
  ['Vortrag', ['frei gesprochen', 'laut, deutlich, nicht zu schnell', 'Blickkontakt zum Publikum']],
  ['Plakat / Folien', ['gut lesbar und übersichtlich', 'passende Bilder, Quellen angegeben']],
  ['Zeit und Fragen', ['Zeit eingehalten', 'Fragen beantwortet']]];
B.kl_praes = { name: 'Präsentieren', gruppe: 'Struktur', def: { thema: 'plakat', zeilen: 10 },
  felder: [{ k: 'thema', l: 'Tafel', typ: 'auswahl', opts: [['plakat', 'Was macht ein gutes Plakat aus?'], ['pc', 'Was macht eine gute PowerPoint-Präsentation aus?'], ['bewertung', 'Wie bewerten wir Präsentationen? (Kriterien)'], ['leer', 'Präsentationen bewerten – leeres Raster']] }, { k: 'zeilen', l: 'Zeilen im leeren Raster', typ: 'zahl', min: 4, max: 16 }],
  gen: (d, P) => {
    if (d.thema === 'leer') { /* leeres Raster: Kriterien selbst eintragen (mit der Klasse sammeln) */
      const n = Math.round(T.clamp(+d.zeilen || 10, 4, 16)), W = 1000, xs = [700, 765, 830, 895], zh = 50; let y = 120, s = text(30, 86, 'Kriterien gemeinsam festlegen und eintragen – dann für jeden Punkt ein Kreuz:  ++ · + · o · −', 20, GRAU);
      ['++', '+', 'o', '−'].forEach((t, i) => { s += mitte(xs[i] + 30, y - 4, t, 22, P.ink, fett); }); y += 20;
      const y0 = y; s += text(46, y + 18, 'Name / Thema:', 19, GRAU); s += linien(190, 660, y + 34, 1); y += zh;
      for (let i = 0; i < n; i++) { s += `<line x1="30" y1="${y + zh}" x2="970" y2="${y + zh}" stroke="#94a3b8" stroke-width="1"/>` + mitte(52, y + zh / 2, (i + 1) + '.', 18, GRAU) + linien(76, 670, y + zh - 12, 1);
        xs.forEach(x => { s += `<rect x="${x + 16}" y="${y + 12}" width="28" height="26" rx="5" fill="none" stroke="${GRAU}" stroke-width="2"/>`; }); y += zh; }
      s += `<rect x="30" y="${y0}" width="940" height="${y - y0}" fill="none" stroke="${RAND}" stroke-width="2"/><line x1="680" y1="${y0}" x2="680" y2="${y}" stroke="#94a3b8" stroke-width="1"/>`;
      s += text(30, y + 34, 'Das war besonders gut:', 20, P.ink, fett) + linien(270, 970, y + 44, 1) + text(30, y + 88, 'Tipp für das nächste Mal:', 20, P.ink, fett) + linien(290, 970, y + 98, 1);
      return tafel('⭐', 'Präsentationen bewerten', W, y + 130, s, P);
    }
    if (d.thema === 'bewertung') {
      const W = 1000, sp = ['++', '+', 'o', '−'], xs = [700, 765, 830, 895], zh = 44; let y = 120, s = text(30, 86, 'Für jeden Punkt ein Kreuz:  ++ sehr gut · + gut · o teilweise · − noch nicht', 20, GRAU);
      sp.forEach((t, i) => { s += mitte(xs[i] + 30, y - 4, t, 22, P.ink, fett); }); y += 20;
      for (const [bereich, punkte] of KRITERIEN) {
        s += `<rect x="30" y="${y}" width="940" height="${zh}" fill="rgba(21,101,192,.12)"/>` + text(46, y + zh / 2, bereich, 22, BLAU, fett); y += zh;
        for (const p of punkte) { s += `<line x1="30" y1="${y + zh}" x2="970" y2="${y + zh}" stroke="#94a3b8" stroke-width="1"/>` + text(60, y + zh / 2, p, 20, P.ink);
          xs.forEach(x => { s += `<rect x="${x + 16}" y="${y + 9}" width="28" height="26" rx="5" fill="none" stroke="${GRAU}" stroke-width="2"/>`; }); y += zh; }
      }
      s += `<rect x="30" y="140" width="940" height="${y - 140}" fill="none" stroke="${RAND}" stroke-width="2"/>`;
      s += text(30, y + 34, 'Das war besonders gut:', 20, P.ink, fett) + linien(270, 970, y + 44, 1) + text(30, y + 88, 'Tipp für das nächste Mal:', 20, P.ink, fett) + linien(290, 970, y + 98, 1);
      return tafel('⭐', 'Präsentationen bewerten – Kriterien', W, y + 130, s, P);
    }
    const pc = d.thema === 'pc', k = karten(pc ? PC : PLAKAT, 80, P), v = karten(pc ? PC_VORTRAG : VORTRAG, k.y + 50, P, 2);
    const s = k.s + text(30, k.y + 22, pc ? 'Beim Vortrag:' : 'Beim Vortrag mit dem Plakat:', 24, P.ink, fett) + v.s;
    return tafel(pc ? '💻' : '🪧', pc ? 'Eine gute Präsentation mit PowerPoint / PC' : 'Ein gutes Plakat – eine gute Präsentation', 1000, v.y + 20, s, P);
  } };
B.kl_praes.schnell = [{ l: '🪧 Plakat', f: dd => ({ d: { ...dd, thema: 'plakat' } }) }, { l: '💻 PowerPoint', f: dd => ({ d: { ...dd, thema: 'pc' } }) }, { l: '⭐ Bewerten', f: dd => ({ d: { ...dd, thema: 'bewertung' } }) }, { l: '⬜ Leeres Raster', f: dd => ({ d: { ...dd, thema: 'leer' } }) },
  { l: '＋ Zeile', f: dd => ({ d: { ...dd, zeilen: Math.min(16, (+dd.zeilen || 10) + 1) } }) }, { l: '− Zeile', f: dd => ({ d: { ...dd, zeilen: Math.max(4, (+dd.zeilen || 10) - 1) } }) }];

// ---------- 🎯 SMART-Ziele (Feedback: aus der Rückmeldung ein eigenes Ziel machen) ----------
const SMART = [['S', 'Spezifisch', 'Was genau will ich erreichen?', 'Ich lerne die englischen Vokabeln von Unit 3.', BLAU],
  ['M', 'Messbar', 'Woran merke ich, dass ich es geschafft habe?', 'Im Vokabeltest habe ich mindestens 8 von 10 richtig.', GRUEN],
  ['A', 'Attraktiv', 'Warum ist mir das Ziel wichtig?', 'Dann kann ich im Unterricht besser mitreden.', ORANGE],
  ['R', 'Realistisch', 'Kann ich das mit meiner Zeit schaffen?', 'Jeden Tag 10 Minuten – das passt in meinen Nachmittag.', LILA],
  ['T', 'Terminiert', 'Bis wann will ich es schaffen?', 'Bis zum Vokabeltest am Freitag in zwei Wochen.', ROT]];
B.kl_smart = { name: 'SMART-Ziele setzen', gruppe: 'Struktur', def: { thema: 'erklaert' },
  felder: [{ k: 'thema', l: 'Tafel', typ: 'auswahl', opts: [['erklaert', 'Erklärt mit Beispiel'], ['leer', 'Leer: eigenes Ziel planen']] }],
  gen: (d, P) => {
    const leer = d.thema === 'leer', W = 1000, zh = leer ? 104 : 112, y0 = 84; let s = '';
    SMART.forEach(([b, wort, frage, bsp, col], i) => {
      const y = y0 + i * zh;
      s += box(30, y, 940, zh - 12, col, 'none', 14) + `<circle cx="78" cy="${y + (zh - 12) / 2}" r="34" fill="${col}"/>` + mitte(78, y + (zh - 12) / 2, b, 40, '#ffffff', fett);
      s += text(130, y + 26, wort, 24, col, fett) + text(300, y + 26, frage, 20, P.ink);
      if (leer) s += linien(130, 950, y + 72, 1);
      else s += text(130, y + 68, 'Beispiel: ' + bsp, 19, P.ink, 'font-style="italic"');
    });
    const yZ = y0 + 5 * zh + 6;
    s += box(30, yZ, 940, 120, RAND, 'none', 14) + text(50, yZ + 30, '🎯 Mein SMARTes Ziel:', 22, P.ink, fett) + linien(300, 950, yZ + 44, 1) + linien(50, 950, yZ + 92, 1);
    if (!leer) s += text(30, yZ + 142, 'Ein gutes Ziel erfüllt alle fünf Punkte.', 19, P.ink, fett) + text(30, yZ + 170, 'Nach dem Termin prüfen: Geschafft? Was mache ich als Nächstes?', 19, P.ink);
    return tafel('🎯', 'SMART-Ziele setzen', W, yZ + (leer ? 140 : 196), s, P);
  } };
B.kl_smart.schnell = [{ l: '🔁 Erklärt ↔ leer', f: dd => ({ d: { ...dd, thema: dd.thema === 'leer' ? 'erklaert' : 'leer' } }) }];

// Kacheln unter Vorlagen › 🤝 Klassenleben & Lernen (gleicher Baustein, voreingestellte Tafel)
const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};
KV['kl_smart:erklaert'] = { name: 'SMART-Ziele (erklärt)', d: { thema: 'erklaert' } }; KV['kl_smart:leer'] = { name: 'SMART-Ziele (leer, eigenes Ziel)', d: { thema: 'leer' } };
KV['kl_regeln:weg'] = { name: 'Klassenregeln erarbeiten', d: { thema: 'weg' } }; KV['kl_regeln:plakat'] = { name: 'Unsere Klassenregeln (Plakat)', d: { thema: 'plakat' } };
KV['kl_lernen:methoden'] = { name: 'Lernen lernen: Methoden', d: { thema: 'methoden' } }; KV['kl_lernen:tipps'] = { name: 'Lernen lernen: Tipps', d: { thema: 'tipps' } };
KV['kl_gefuehle:karten'] = { name: 'Gefühlskarten', d: { thema: 'karten' } }; KV['kl_gefuehle:satz'] = { name: 'Über Gefühle sprechen', d: { thema: 'satz' } }; KV['kl_gefuehle:barometer'] = { name: 'Stimmungsbarometer', d: { thema: 'barometer' } };
KV['kl_praes:plakat'] = { name: 'Präsentieren mit Plakat', d: { thema: 'plakat' } }; KV['kl_praes:pc'] = { name: 'Präsentieren mit PowerPoint', d: { thema: 'pc' } }; KV['kl_praes:bewertung'] = { name: 'Präsentationen bewerten', d: { thema: 'bewertung' } }; KV['kl_praes:leer'] = { name: 'Präsentationen bewerten (leer)', d: { thema: 'leer' } };
})();
