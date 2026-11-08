// Tafel-App – interaktive Übungen (Kärtchen sortieren, Reihenfolge, Zuordnen, Lückentext, Multiple Choice),
// Diagramme, Messwerttabelle und Formelsammlung
'use strict';
(function () {
const { doc, ln, tx, rc, f } = T._svg, B = T.BAUSTEINE, CM = T.CM;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const zeilen = s => String(s || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean);
const mess = (t, fs, fett) => { const c = T._mctx || (T._mctx = document.createElement('canvas').getContext('2d')); c.font = `${fett ? 700 : 400} ${fs}px Segoe UI`; return c.measureText(String(t)).width; };
const PASTELL = ['#e3f2fd', '#fff3e0', '#e8f5e9', '#fce4ec', '#ede7f6', '#e0f7fa'];

// ---------- Bausteine der Übungen (werden über die Übungs-Leiste erzeugt) ----------
B.ukarte = { name: 'Kärtchen', gruppe: 'intern', def: { text: '', w: 200, h: 70 }, felder: [],
  gen: (d, P) => {
    if (d.form) return formKarte(d, P); /* neue Übungsarten: Zeile, Sprechblase, Antipp-Stelle … */
    if (d.verdeckt) return { svg: doc(d.w, d.h, ''), w: d.w, h: d.h }; // ★★★ Lückentext: Lösungswort noch unsichtbar
    if (d.memo && !d.offen) { // Memory: verdeckte Rückseite
      const W = d.w, H = d.h; let s = `<defs><linearGradient id="mr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b5bd6"/><stop offset="1" stop-color="#8e5bd6"/></linearGradient><pattern id="mp" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="11" height="22" fill="rgba(255,255,255,.08)"/></pattern></defs>`;
      s += rc(3, 3, W - 6, H - 6, '#3f3fa8', 'url(#mr)', 3, 'rx="16"') + rc(3, 3, W - 6, H - 6, 'none', 'url(#mp)', 0, 'rx="16"') + tx(W / 2, H / 2, '?', 'rgba(255,255,255,.85)', H * 0.5, 'middle', 'font-weight="700"');
      return { svg: doc(W, H, s), w: W, h: H };
    }
    const W = d.w, H = d.h, st = d.status, rand = st === 'richtig' ? '#16a34a' : st === 'falsch' ? '#dc2626' : (d.mc ? '#5b5bd6' : '#64748b');
    const fs = Math.min(H * (d.memo ? 0.3 : 0.42), (W - (d.mc ? 70 : 24)) / Math.max(3, String(d.text).length) * 1.9);
    let s = rc(3, 3, W - 6, H - 6, rand, st === 'richtig' ? '#dcfce7' : st === 'falsch' ? '#fee2e2' : (d.fuell || '#ffffff'), st ? 5 : 3, 'rx="16"');
    if (d.mc) { s += rc(18, H / 2 - 16, 32, 32, '#334155', d.gewaehlt ? '#5b5bd6' : '#fff', 3, 'rx="7"'); if (d.gewaehlt) s += `<path d="M24 ${H / 2} l7 8 l14 -16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`; }
    s += tx(d.mc ? 60 + (W - 60) / 2 : W / 2, H / 2, d.text, '#1b1f2a', fs, 'middle', 'font-weight="600"');
    if (st) s += `<circle cx="${W - 18}" cy="18" r="15" fill="${rand}"/>` + tx(W - 18, 19, st === 'richtig' ? '✓' : '✗', '#fff', 20, 'middle', 'font-weight="700"');
    return { svg: doc(W, H, s), w: W, h: H };
  } };
B.uziel = { name: 'Ablagefeld', gruppe: 'intern', def: { titel: '', w: 260, h: 300 }, felder: [],
  gen: (d) => {
    const W = d.w, H = d.h; let s = rc(3, 3, W - 6, H - 6, '#94a3b8', d.fuell || 'rgba(148,163,184,.08)', 3, 'rx="18" stroke-dasharray="12 8"');
    if (d.titel) s += rc(3, 3, W - 6, 54, 'none', d.kopf || '#e2e8f0', 0, 'rx="18"') + tx(W / 2, 31, d.titel, '#1b1f2a', Math.min(26, (W - 20) / Math.max(4, d.titel.length) * 1.9), 'middle', 'font-weight="700"');
    if (d.nr != null) s += tx(W / 2, H / 2, d.nr, '#cbd5e1', Math.min(W, H) * 0.5, 'middle', 'font-weight="700"');
    return { svg: doc(W, H, s), w: W, h: H };
  } };
B.uknopf = { name: 'Übungsknopf', gruppe: 'intern', def: { text: '✓ Prüfen', w: 220, h: 70 }, felder: [],
  gen: (d) => { const W = d.w, H = d.h; const s = `<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${d.farbe || '#5b5bd6'}"/><stop offset="1" stop-color="${d.farbe2 || '#8e5bd6'}"/></linearGradient></defs>` + rc(2, 2, W - 4, H - 4, 'none', 'url(#g)', 0, `rx="${H / 2}"`) + tx(W / 2, H / 2, d.text, '#fff', H * 0.38, 'middle', 'font-weight="700"'); return { svg: doc(W, H, s), w: W, h: H }; } };
// Lückentext: Wörter in [eckigen Klammern] werden zu Lücken (Teile g0, g1 …)
B.luecktext = { name: 'Lückentext', gruppe: 'intern', def: { text: '', breite: 1100 }, felder: [],
  gen: (d, P) => {
    const fs = 30, lh = 74, W = d.breite, pad = 20, teile = []; let s = '', x = pad, y = pad, gi = 0;
    const loes = [...String(d.text).matchAll(/\[([^\]]+)\]/g)].map(m => m[1]), lw = Math.max(120, ...loes.map(l => mess(l, fs, true) + 50));
    for (const stueck of String(d.text).split(/(\[[^\]]+\])/)) {
      if (!stueck) continue;
      if (/^\[.*\]$/.test(stueck)) {
        if (x + lw > W - pad) { x = pad; y += lh; }
        s += rc(x, y + 6, lw, lh - 16, '#94a3b8', 'rgba(148,163,184,.12)', 2.5, 'rx="10" stroke-dasharray="8 6"');
        if (d.hinweis) s += `<text x="${f(x + 12)}" y="${f(y + lh / 2)}" font-size="${fs * 0.8}" fill="#94a3b8" dominant-baseline="central" font-weight="700">${esc(stueck.slice(1, 2))}…</text>`; // ★: Anfangsbuchstabe
        teile.push({ id: 'g' + gi++, x, y: y + 6, w: lw, h: lh - 16 }); x += lw + 12; continue;
      }
      for (const wort of stueck.split(/(\s+)/)) {
        if (!wort) continue; if (/^\s+$/.test(wort)) { x += mess(' ', fs); continue; }
        if (wort === '\n') { x = pad; y += lh; continue; }
        const ww = mess(wort, fs); if (x + ww > W - pad) { x = pad; y += lh; }
        s += `<text x="${f(x)}" y="${f(y + lh / 2)}" font-size="${fs}" fill="${P.ink}" dominant-baseline="central">${esc(wort)}</text>`; x += ww;
      }
    }
    const H = y + lh + pad;
    return { svg: doc(W, H, rc(2, 2, W - 4, H - 4, P.grid, P.ink === '#1a1a1a' ? '#fff' : 'rgba(255,255,255,.06)', 2, 'rx="16"') + s), w: W, h: H, teile };
  } };
// Antipp-Text: ein Satz mit vorberechneten Textstücken [x, y, Text, grau]; die Antipp-Stellen liegen als eigene Kärtchen darüber
B.utippsatz = { name: 'Antipp-Satz', gruppe: 'intern', def: { stuecke: [], w: 600, h: 70, fs: 34 }, felder: [],
  gen: (d, P) => {
    const W = d.w, H = d.h; let s = rc(2, 2, W - 4, H - 4, P.grid, P.ink === '#1a1a1a' ? '#fff' : 'rgba(255,255,255,.06)', 2, 'rx="14"');
    for (const [x, y, t, grau] of d.stuecke || []) s += `<text x="${f(x)}" y="${f(y)}" font-size="${grau ? 24 : d.fs}" fill="${grau ? '#94a3b8' : P.ink}" dominant-baseline="central" style="white-space:pre">${esc(t)}</text>`;
    return { svg: doc(W, H, s), w: W, h: H };
  } };

// ---------- Kärtchen-Formen der neuen Übungsarten (d.form) ----------
const umbruch = (text, fs, maxW, fett) => {
  const out = [];
  for (const absatz of String(text == null ? '' : text).split(/\n/)) {
    let z = '';
    for (const w of absatz.split(/\s+/).filter(Boolean)) { const t = z ? z + ' ' + w : w; if (z && mess(t, fs, fett) > maxW) { out.push(z); z = w; } else z = t; }
    out.push(z);
  }
  return out;
};
const zText = (zl, x, y, lh, fs, farbe, anchor, extra) => zl.map((z, i) => tx(x, y + i * lh, z, farbe, fs, anchor || 'start', extra || '')).join('');
const STF = { richtig: ['#16a34a', '#dcfce7'], falsch: ['#dc2626', '#fee2e2'] };
const plakette = (W, st) => `<circle cx="${W - 18}" cy="18" r="15" fill="${STF[st][0]}"/>` + tx(W - 18, 19, st === 'richtig' ? '✓' : '✗', '#fff', 20, 'middle', 'font-weight="700"');
function formKarte(d, P) {
  const W = d.w, st = STF[d.status] ? d.status : null; let H = d.h || 70, s = '';
  if (d.form === 'titel') { // Aufgabe / Auftrag über der Übung (ohne Rahmen)
    const fs = d.fs || 30, lh = fs * 1.3, zl = umbruch(d.text, fs, W - 8, !d.duenn); H = zl.length * lh + 10;
    s = zText(zl, 4, 5 + lh / 2, lh, fs, d.duenn ? (P.ink === '#1a1a1a' ? '#475569' : '#cbd5e1') : P.ink, 'start', d.duenn ? '' : 'font-weight="700"');
  } else if (d.form === 'hinweis') { // ★-Hilfe (Regelkarte)
    const fs = 22, lh = fs * 1.35, zl = umbruch(d.text, fs, W - 30); H = zl.length * lh + 18;
    s = rc(2, 2, W - 4, H - 4, '#eab308', '#fef9c3', 2, 'rx="12"') + zText(zl, 15, 9 + lh / 2, lh, fs, '#713f12');
  } else if (d.form === 'info') { // Lösung / Musterbegründung (bis 💡 verdeckt)
    const fs = d.klein ? 20 : 23, lh = fs * 1.35, zl = d.text ? umbruch(d.text, fs, W - 28) : [], kopf = d.titel ? 30 : 0; H = kopf + zl.length * lh + 18;
    s = rc(2, 2, W - 4, H - 4, '#16a34a', '#ecfdf5', 2.5, 'rx="12"') + (d.titel ? tx(14, 8 + 15, d.titel, '#15803d', 22, 'start', 'font-weight="700"') : '') + zText(zl, 14, 9 + kopf + lh / 2, lh, fs, '#14532d');
  } else if (d.form === 'feld') { // Schreibfeld (gestrichelt) mit Beschriftung
    s = rc(3, 3, W - 6, H - 6, '#94a3b8', 'rgba(148,163,184,.08)', 2.5, 'rx="14" stroke-dasharray="10 7"') + tx(16, 22, d.text, '#64748b', 20, 'start', 'font-weight="600"');
  } else if (d.form === 'lesetext') { // Text mit Zeilennummern (Aussagen prüfen)
    const fs = 27, lh = fs * 1.45, nrW = 58; let y = 14, b = '';
    (d.zeilen || []).forEach((z, i) => { const zl = umbruch(z, fs, W - nrW - 26); b += tx(nrW - 16, y + lh / 2, String(i + 1), '#94a3b8', 20, 'end', 'font-weight="700"') + zText(zl, nrW, y + lh / 2, lh, fs, '#1b1f2a'); y += zl.length * lh; });
    H = y + 14; s = rc(2, 2, W - 4, H - 4, '#cbd5e1', '#ffffff', 2, 'rx="14"') + ln(nrW - 7, 12, nrW - 7, H - 12, '#e2e8f0', 2) + b;
  } else if (d.form === 'zeile') { // Zeile zum Antippen (Fehler finden) bzw. Aussage
    const fs = 27, lh = fs * 1.4, xt = d.nr != null ? 62 : 18, zl = umbruch(d.text, fs, W - xt - 46); H = Math.max(70, zl.length * lh + 22);
    const mk = d.markiert && !st, rand = st ? STF[st][0] : mk ? '#f97316' : '#94a3b8', fill = st ? STF[st][1] : mk ? '#fff7ed' : (d.fuell || '#ffffff');
    s = rc(3, 3, W - 6, H - 6, rand, fill, st || mk ? 5 : 2.5, 'rx="14"');
    if (d.nr != null) s += `<circle cx="32" cy="${f(H / 2)}" r="17" fill="${mk ? '#f97316' : '#e2e8f0'}"/>` + tx(32, H / 2 + 1, String(d.nr), mk ? '#fff' : '#475569', 18, 'middle', 'font-weight="700"');
    s += zText(zl, xt, (H - zl.length * lh) / 2 + lh / 2, lh, fs, '#1b1f2a');
    if (st) s += plakette(W, st); else if (mk) s += `<circle cx="${W - 18}" cy="18" r="15" fill="#f97316"/>` + tx(W - 18, 19, '!', '#fff', 22, 'middle', 'font-weight="700"');
  } else if (d.form === 'wahl') { // Antwortfeld (richtig / falsch / steht nicht im Text)
    const fs = 22, zl = umbruch(d.text, fs, W - 20, true), an = d.gewaehlt;
    const fill = st && an ? STF[st][0] : an ? '#5b5bd6' : '#ffffff', rand = st ? STF[st][0] : '#5b5bd6';
    s = rc(3, 3, W - 6, H - 6, rand, fill, st ? 5 : 3, 'rx="16"') + zText(zl, W / 2, H / 2 - (zl.length - 1) * fs * 0.6, fs * 1.2, fs, an ? '#ffffff' : '#312e81', 'middle', 'font-weight="700"');
  } else if (d.form === 'blase') { // Sprechblase (Wer hat recht?)
    const fsN = 22, fs = 25, lh = fs * 1.35, zl = d.text ? umbruch(d.text, fs, W - 40) : [], innen = 16 + 30 + zl.length * lh + (d.leer ? 60 : 56);
    const KH = Math.max(d.hMin || 0, innen); H = KH + 28;
    const rand = st ? STF[st][0] : d.leer ? '#94a3b8' : '#5b5bd6', fill = st ? STF[st][1] : '#ffffff';
    s = `<path d="M18 3 H${f(W - 18)} Q${f(W - 3)} 3 ${f(W - 3)} 18 V${f(KH - 15)} Q${f(W - 3)} ${f(KH)} ${f(W - 18)} ${f(KH)} H96 L52 ${f(H - 3)} L64 ${f(KH)} H18 Q3 ${f(KH)} 3 ${f(KH - 15)} V18 Q3 3 18 3 Z" fill="${fill}" stroke="${rand}" stroke-width="${st ? 5 : 3}" ${d.leer ? 'stroke-dasharray="10 7"' : ''}/>`;
    s += tx(20, 16 + 14, d.name || '', d.leer ? '#64748b' : '#4338ca', fsN, 'start', 'font-weight="700"') + zText(zl, 20, 16 + 30 + lh / 2, lh, fs, '#1b1f2a');
    if (d.stimme && d.lab && d.lab[d.stimme - 1]) { const t = (d.stimme === 1 ? '✓ ' : d.stimme === 2 ? '✗ ' : '~ ') + d.lab[d.stimme - 1], bw = mess(t, 20, true) + 30;
      s += rc(16, KH - 50, bw, 38, 'none', '#5b5bd6', 0, 'rx="19"') + tx(16 + bw / 2, KH - 31, t, '#fff', 20, 'middle', 'font-weight="700"'); }
    if (st) s += plakette(W, st);
  } else if (d.form === 'schalter') { // Antipp-Stelle im Satz (Komma / Auswahl)
    const fs = d.fs || 34, w = d.wert || '';
    if (d.art === 'komma') {
      if (st) s += rc(2, 2, W - 4, H - 4, STF[st][0], STF[st][1], 2.5, 'rx="8"');
      s += w ? tx(W / 2, H * 0.42, ',', st ? STF[st][0] : '#1d4ed8', fs * 1.4, 'middle', 'font-weight="700"') : `<circle cx="${f(W / 2)}" cy="${f(H * 0.66)}" r="4" fill="#94a3b8"/>`;
    } else {
      s += rc(3, 3, W - 6, H - 6, st ? STF[st][0] : w ? '#6366f1' : '#94a3b8', st ? STF[st][1] : w ? '#e0e7ff' : 'rgba(148,163,184,.14)', st ? 4 : 2.5, `rx="10"${w || st ? '' : ' stroke-dasharray="7 5"'}`);
      s += tx(W / 2, H / 2, w || '?', st ? STF[st][0] : w ? '#1d4ed8' : '#94a3b8', w ? fs * 0.9 : fs * 0.8, 'middle', 'font-weight="700"');
    }
  }
  return { svg: doc(W, H, d.verdeckt ? '' : s), w: W, h: H };
}

// ---------- Übungen erzeugen ----------
const mische = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function objekt(k, d, x, y, k2 = 1) { const g = T.genObj(k, d, false); return { t: 'o', id: T.uid(), k, d, x, y, w: g.w * k2, h: g.h * k2, r: 0 }; }
T.UEBUNGEN = {
  gruppen: { n: 'Kärtchen sortieren', bsp: 'Säugetiere: Hund, Katze, Wal, Fledermaus\nVögel: Amsel, Pinguin, Strauß\nFische: Hai, Forelle', hilfe: 'Eine Gruppe pro Zeile: „Gruppe: Begriff, Begriff, …“. Optional erste Zeile „Aufgabe: …“ (steht dann über der Übung).',
    vorlagen: [ // feste Spaltensätze (G5) – als Beispiel gefüllt, zum Anpassen
      { n: '🔬 Variablen-Check', text: 'Aufgabe: Versuch: Löst sich Zucker in warmem Wasser schneller als in kaltem? Ordne zu.\nverändert: Wassertemperatur\ngemessen: Zeit bis zum Auflösen\ngleich gehalten: Wassermenge, Zuckermenge, Zuckersorte, Gefäß, Umrühren' },
      { n: '👁 Beobachtung / Deutung', text: 'Aufgabe: Eine brennende Kerze wird mit einem Glas überdeckt. Was ist Beobachtung, was ist Deutung?\nBeobachtung: Flamme wird kleiner, Flamme erlischt, Glas beschlägt innen, Glas wird warm\nDeutung: Sauerstoff wird knapp, Verbrennung erzeugt Wasser, Verbrennung setzt Wärme frei' },
      { n: '⚖ Pro / Contra', text: 'Aufgabe: Sollen Handys in den Pausen verboten werden? Sortiere die Argumente.\nPro (dafür): mehr Bewegung in der Pause, mehr Gespräche, weniger Streit im Klassenchat\nContra (dagegen): Eltern können nicht anrufen, Lern-Apps in Freistunden, Verbot fördert Heimlichkeit' },
      { n: '➡ Ursache / Wirkung', text: 'Aufgabe: Was ist Ursache, was ist Wirkung?\nUrsache: starker Regen, Eis auf der Straße, Batterie leer\nWirkung: Fluss tritt über das Ufer, Auto rutscht, Taschenlampe bleibt dunkel' }
    ] },
  reihe: { n: 'Reihenfolge', bsp: 'Ei\nRaupe\nPuppe\nSchmetterling', hilfe: 'Ein Schritt pro Zeile – in der richtigen Reihenfolge eintippen, die App mischt.' },
  paare: { n: 'Zuordnen', bsp: 'dog = Hund\ncat = Katze\nhorse = Pferd\nbird = Vogel', hilfe: 'Ein Paar pro Zeile: „links = rechts“' },
  luecke: { n: 'Lückentext', bsp: 'Die Sonne [geht] im Osten [auf] und im [Westen] unter.\nAblenker: Norden, steht', hilfe: 'Lückenwörter in [eckige Klammern]. Optional letzte Zeile „Ablenker: …“ für falsche Wörter.' },
  mc: { n: 'Multiple Choice', bsp: 'Welche Tiere sind Säugetiere?\n*Wal\nHai\n*Fledermaus\nPinguin', hilfe: 'Erste Zeile: Frage. Dann eine Antwort pro Zeile, richtige mit * davor.' },
  memory: { n: 'Memory', bsp: 'dog = Hund\ncat = Katze\nhorse = Pferd\nbird = Vogel\nmouse = Maus\nfish = Fisch', hilfe: 'Ein Paar pro Zeile: „Karte A = Karte B“. Auf der Tafel: zwei Karten aufdecken – passen sie, bleiben sie offen.' },
  karten: { n: 'Karteikarten', bsp: 'dog = Hund\ncat = Katze\nhorse = Pferd\nbird = Vogel\nmouse = Maus\nfish = Fisch', hilfe: 'Vorderseite = Rückseite. Antippen dreht die Karte um.' },
  salat: { n: 'Buchstabensalat', bsp: 'Schmetterling\nRaupe\nPuppe', hilfe: 'Ein Wort pro Zeile. Die Buchstaben werden gemischt und in die Kästchen gezogen.' },
  fehler: { n: 'Fehler finden', bsp: 'Aufgabe: Ben hat gerechnet. Prüfe jede Zeile.\n5 + 4 · 3 = 27 => 5 + 4 · 3 = 5 + 12 = 17\n20 − 8 : 4 = 18\n18 − 6 − 2 = 14 => 18 − 6 − 2 = 12 − 2 = 10\n7 + 3 · 0 = 7',
    hilfe: 'Eine Zeile pro Rechenschritt, Satz oder Protokollzeile. Fehlerhafte Zeile: „falsche Zeile => richtige Fassung“. Optional: „Aufgabe: …“, „Sprache: en“ (englische Beschriftung).',
    tafel: 'Übung steht auf der Tafel – falsche Zeilen antippen, Verbesserung daneben schreiben, dann „✓ Prüfen“.', nv: ['Fehlerzeilen sind markiert – nur verbessern', 'Anzahl der Fehler steht dabei', 'ohne Hinweis, Fehler erklären'] },
  aussagen: { n: 'Aussagen prüfen', bsp: 'Text:\nLina hat einen Hund namens Bruno.\nJeden Morgen geht sie mit ihm in den Park.\nBruno ist drei Jahre alt und spielt gern mit Bällen.\nr: Lina geht täglich mit ihrem Hund hinaus. @2\nf: Bruno ist ein junger Welpe. @3\nn: Lina hat auch eine Katze.',
    hilfe: 'Optional „Text:“ und darunter die Textzeilen (werden nummeriert). Aussagen: „r: …“ richtig, „f: …“ falsch, „n: …“ steht nicht im Text – Belegzeile mit „@ 3“. Optional: „Antworten: stimmt | stimmt nicht | nicht ablesbar“, „Sprache: en“, „Diagramm: Titel“ mit Datenzeilen „Mo;24“.',
    tafel: 'Übung steht auf der Tafel – je Aussage ein Feld antippen, dann „✓ Prüfen“.', nv: ['nur richtig / falsch, Zeile angegeben', 'drei Antworten', 'drei Antworten + Zeile bzw. Begründung aufschreiben'] },
  recht: { n: 'Wer hat recht?', bsp: 'Frage: Ist 0,5 größer als 0,45?\n- Tom: 0,45 ist größer, weil 45 größer als 5 ist. | Falsch: Man vergleicht Stelle für Stelle. 5 Zehntel sind mehr als 4 Zehntel.\n+ Mia: 0,5 ist größer, denn 0,5 = 0,50 und 50 Hundertstel sind mehr als 45 Hundertstel. | Richtig: Mit gleich vielen Nachkommastellen sieht man es sofort.',
    hilfe: 'Optional „Frage: …“. Je Sprechblase eine Zeile: „+ Name: Aussage | Begründung“ (+ = stimmt, - = stimmt nicht, ~ = stimmt teilweise). Begründung erscheint erst mit 💡.',
    tafel: 'Übung steht auf der Tafel – Sprechblase antippen (stimmt / stimmt nicht), darunter begründen, dann „✓ Prüfen“.', nv: ['zwei Sprechblasen, Satzanfang im Begründungsfeld', 'alle Sprechblasen', 'zusätzlich eigene Aussage erfinden'] },
  tipp: { n: 'Antipp-Text', bsp: 'Ich glaube[,] dass es morgen regnet. Regel: Vor „dass“ steht ein Komma.\nWir kaufen Äpfel[,] Birnen und Bananen. Regel: Aufzählung – kein Komma vor „und“.\nBeim {*L|l}aufen bekomme ich Seitenstiche.\nIch hoffe, {das|*dass} du kommst.',
    hilfe: 'Ein Satz pro Zeile. [,] = hier gehört ein Komma (dann wird jede Wortlücke antippbar). {das|*dass} = Auswahl, * markiert die richtige Form (ohne * ist die erste richtig). {*G|g}roß = Groß/klein. Am Zeilenende optional „Regel: …“.',
    tafel: 'Übung steht auf der Tafel – Stellen antippen (schaltet durch), dann „✓ Prüfen“.', nv: ['Anzahl der Kommas und Regel stehen dabei', 'ohne Hilfe', 'zusätzlich Regel aufschreiben'] },
  kaesten: { n: 'Zuordnungskästen', bsp: 'Aufgabe: Beschrifte die Blüte.\nKronblatt\nKelchblatt\nStaubblatt\nStempel\nFruchtknoten\nAblenker: Wurzel, Laubblatt',
    hilfe: 'Ein Begriff pro Zeile – je Begriff ein leerer Kasten, die Begriffe liegen gemischt im Wortspeicher. Die Kästen auf der Tafel frei verschieben (z. B. auf ein Bild oder eine Zeichnung) und mit 🔒 fixieren. Optional „Aufgabe: …“ und „Ablenker: …“ (für ★★★).',
    tafel: 'Kästen an die richtigen Stellen schieben (z. B. aufs Bild) und 🔒 fixieren – dann die Begriffe hineinziehen und „✓ Prüfen“.', nv: ['Anfangsbuchstabe steht im Kasten', 'normal', 'mit Ablenkern im Wortspeicher'] }
};
// ---------- Neue Übungsarten: Aufbau ----------
const gross = s => String(s).charAt(0).toUpperCase() + String(s).slice(1);
const SPR = {
  de: { richtig: 'richtig', falsch: 'falsch', nicht: 'steht nicht im Text', zeile: '✎ Zeile', zAbk: 'Zeile', begr: '✎ Begründung', korr: '✎ richtig:', regel: '✎ Regel:',
    stimmt: 'stimmt', stimmtNicht: 'stimmt nicht', teils: 'stimmt teilweise', du: 'Deine eigene Aussage:', satz: n => `✎ ${n} hat (nicht) recht, weil …`,
    komma: n => n === 0 ? '(kein Komma)' : n === 1 ? '(1 Komma)' : `(${n} Kommas)`,
    fehler: [n => 'Die markierten Zeilen sind falsch. Schreibe sie daneben richtig auf.', n => `Hier ${n === 1 ? 'steckt 1 Fehler' : `stecken ${n} Fehler`}. Tippe die falschen Zeilen an und verbessere sie.`, () => 'Finde die Fehler: Tippe die falschen Zeilen an, verbessere sie und erkläre, was falsch war.'],
    aussagen: (nv, text, L) => text ? ['Lies den Text. Richtig oder falsch? Tippe an.', 'Lies den Text. Richtig, falsch oder steht nicht im Text? Tippe an.', 'Lies den Text. Richtig, falsch oder steht nicht im Text? Tippe an und schreibe die Zeile auf, die es belegt.'][nv - 1]
      : [`${gross(L[0])} oder ${L[1]}? Tippe an.`, `${gross(L[0])}, ${L[1]} oder ${L[2]}? Tippe an.`, `${gross(L[0])}, ${L[1]} oder ${L[2]}? Tippe an und begründe.`][nv - 1],
    recht: nv => ['Wer hat recht? Tippe die Sprechblase an (stimmt / stimmt nicht) und begründe mit dem Satzanfang.', 'Wer hat recht? Tippe die Sprechblase an (stimmt / stimmt nicht) und begründe.', 'Wer hat recht? Tippe an, begründe – und schreibe selbst eine richtige Aussage.'][nv - 1],
    tipp: (komma, wahl, nv, regel) => (komma && wahl ? 'Setze die fehlenden Kommas und wähle die richtige Form: Tippe die Stellen an.' : komma ? 'Wo fehlen Kommas? Tippe zwischen die Wörter.' : 'Tippe die Kästchen an, bis die richtige Form dasteht.') + (nv === 3 && regel ? ' Schreibe die Regel auf.' : '') },
  en: { richtig: 'true', falsch: 'false', nicht: 'not given', zeile: '✎ Line', zAbk: 'line', begr: '✎ Because …', korr: '✎ correct:', regel: '✎ Rule:',
    stimmt: 'right', stimmtNicht: 'wrong', teils: 'partly right', du: 'Your own statement:', satz: n => `✎ ${n} is right / wrong because …`,
    komma: n => n === 0 ? '(no comma)' : n === 1 ? '(1 comma)' : `(${n} commas)`,
    fehler: [n => 'The marked lines are wrong. Write them correctly next to them.', n => `There ${n === 1 ? 'is 1 mistake' : `are ${n} mistakes`}. Tap the wrong lines and correct them.`, () => 'Find the mistakes: tap the wrong lines, correct them and explain what was wrong.'],
    aussagen: (nv, text, L) => text ? ['Read the text. True or false? Tap.', 'Read the text. True, false or not given? Tap.', 'Read the text. True, false or not given? Tap and write down the line that proves it.'][nv - 1]
      : [`${gross(L[0])} or ${L[1]}? Tap.`, `${gross(L[0])}, ${L[1]} or ${L[2]}? Tap.`, `${gross(L[0])}, ${L[1]} or ${L[2]}? Tap and give a reason.`][nv - 1],
    recht: nv => ['Who is right? Tap the speech bubble (right / wrong) and use the sentence starter.', 'Who is right? Tap the speech bubble (right / wrong) and give a reason.', 'Who is right? Tap, give a reason – and write a correct statement of your own.'][nv - 1],
    tipp: (komma, wahl, nv, regel) => (komma ? 'Where are commas missing? Tap between the words.' : 'Tap the boxes until the correct form appears.') + (nv === 3 && regel ? ' Write down the rule.' : '') }
};
// Steuerzeilen („Aufgabe: …“, „Sprache: en“ …) herauslösen; Synonyme auf deutsche Schlüssel
const SCHL = { aufgabe: 'aufgabe', task: 'aufgabe', sprache: 'sprache', language: 'sprache', frage: 'frage', question: 'frage', antworten: 'antworten', answers: 'antworten', text: 'text', diagramm: 'diagramm', diagram: 'diagramm', diagrammart: 'diagrammart', regel: 'regel', rule: 'regel' };
function steuer(L, erlaubt) {
  const opt = {}, rest = [];
  for (const l of L) { const m = l.match(/^([A-Za-zä]+)\s*:\s*(.*)$/), s = m && SCHL[m[1].toLowerCase()]; if (s && erlaubt.includes(s) && !(s in opt)) opt[s] = m[2].trim(); else rest.push(l); }
  return { opt, rest };
}
const sprache = opt => /^(en|englisch|english)/i.test(opt.sprache || '') ? SPR.en : SPR.de;
const KW = 34, TFS = 34; // Antipp-Text: Breite einer Kommastelle, Schriftgröße
function tippAtome(zeile, komma) {
  const A = [];
  for (const st of zeile.replace(/\s+\[,\]/g, '[,]').split(/(\[,\]|\{[^{}]+\})/)) {
    if (!st) continue;
    if (st === '[,]') { A.push({ t: 'slot', art: 'komma', opts: [','], soll: ',', w: KW }); continue; }
    if (/^\{.*\}$/.test(st)) {
      const roh = st.slice(1, -1).split('|').map(s => s.trim()).filter(Boolean); if (!roh.length) continue;
      const si = roh.findIndex(o => o.startsWith('*')), opts = roh.map(o => o.replace(/^\*\s*/, ''));
      A.push({ t: 'slot', art: 'wahl', soll: opts[si >= 0 ? si : 0], opts: opts.slice().sort((a, b) => a.localeCompare(b, 'de')), w: Math.max(56, ...opts.map(o => mess(o, TFS * 0.9, true) + 26)) }); continue;
    }
    for (const teil of st.split(/(\s+)/)) if (teil) A.push(/^\s+$/.test(teil) ? { t: 'sp' } : { t: 'w', s: teil });
  }
  if (!komma) return A;
  const out = []; // zwischen zwei Wörtern ohne Satzzeichen: mögliche Kommastelle (antippbar, soll leer bleiben)
  A.forEach((a, i) => {
    if (a.t === 'sp' && i > 0 && i < A.length - 1) {
      const v = A[i - 1], n = A[i + 1];
      const vOk = v.t === 'w' ? !/[,.;:!?–—-]$/.test(v.s) : v.art === 'wahl', nOk = n.t === 'w' ? !/^[–—-]/.test(n.s) : n.art === 'wahl';
      if (vOk && nOk) out.push({ t: 'slot', art: 'komma', opts: [','], soll: '', w: KW });
    }
    out.push(a);
  });
  return out;
}
const BAU = {
  kaesten(c) { // 🧩 leere Kästen (frei verschiebbar) + Wortspeicher
    const { opt, rest } = steuer(c.L, ['aufgabe']); let abl = [];
    const W = rest.filter(l => { const m = l.match(/^ablenker\s*:\s*(.*)$/i); if (m) { abl = m[1].split(/[,;]/).map(s => s.trim()).filter(Boolean); return false; } return true; }).slice(0, 16);
    if (!W.length) return;
    if (c.nv !== 3) abl = [];
    const kw = Math.max(170, ...W.concat(abl).map(t => mess(t, 28, true) + 50)), zw = kw + 20, sp = Math.max(1, Math.min(W.length, Math.floor(1150 / (zw + 30))));
    let y = c.titel(opt.aufgabe || 'Ziehe die Begriffe aus dem Wortspeicher in die passenden Kästen.', '');
    W.forEach((t, i) => c.neu.push(objekt('uziel', { w: zw, h: 84, uid: c.uid, id: 'z' + i, nr: c.nv === 1 ? t.charAt(0) + '…' : null }, c.x0 + (i % sp) * (zw + 30) * c.k, c.y0 + (y + Math.floor(i / sp) * 110) * c.k, c.k)));
    y += Math.ceil(W.length / sp) * 110 + 20;
    y += c.put({ form: 'titel', duenn: true, fs: 24, text: 'Wortspeicher', w: 1150 }, 0, y).h / c.k + 10;
    let x = 0;
    mische(W.map((t, i) => [t, 'z' + i]).concat(abl.map(a => [a, null]))).forEach(([t, soll]) => { if (x + kw > 1150 && x > 0) { x = 0; y += 90; } c.put({ text: t, w: kw, h: 70, ziehbar: true, soll }, x, y); x += kw + 20; });
  },
  fehler(c) {
    const { opt, rest } = steuer(c.L, ['aufgabe', 'sprache']), S = sprache(opt), nv = c.nv;
    const Z = rest.map(l => { const t = l.split(/\s*(?:=>|⇒)\s*/); return { t: t[0], fehler: t.length > 1, korr: t.slice(1).join(' ⇒ ').trim() || t[0] }; }).filter(z => z.t);
    if (!Z.length) return;
    const nf = Z.filter(z => z.fehler).length; let y = c.titel(opt.aufgabe, S.fehler[nv - 1](nf));
    const rw = Math.min(1000, Math.max(520, ...Z.map(z => mess(z.t, 27) + 120))), kw = 600;
    Z.forEach((z, i) => {
      const zeile = c.put({ form: 'zeile', text: z.t, nr: i + 1, w: rw, tipp: 'fehler', fehler: z.fehler, wende: nv !== 1, markiert: nv === 1 && z.fehler, vorgabe: nv === 1 && z.fehler }, 0, y);
      let hh = zeile.h / c.k;
      if (z.fehler) {
        const info = { form: 'info', text: z.korr, w: kw, loes: true, verdeckt: true }, ih = c.mass(info).h;
        if (nv === 1) { const fh = Math.max(hh, ih + 46); c.put({ form: 'feld', text: S.korr, w: kw + 20, h: fh }, rw + 24, y); c.put(info, rw + 34, y + 38); hh = fh; }
        else { c.put(info, rw + 24, y); hh = Math.max(hh, ih); }
      }
      y += hh + 14;
    });
  },
  aussagen(c) {
    const { opt, rest } = steuer(c.L, ['aufgabe', 'sprache', 'antworten', 'text', 'diagramm', 'diagrammart']), S = sprache(opt), nv = c.nv;
    const lab = opt.antworten ? opt.antworten.split(/\s*[|;]\s*/).filter(Boolean) : [], L3 = [lab[0] || S.richtig, lab[1] || S.falsch, lab[2] || S.nicht];
    const text = opt.text ? [opt.text] : [], daten = [], A = [];
    rest.forEach(l => {
      const m = l.match(/^(r|w|t|f|n|ng|\?)\s*[:)]\s*(.+)$/i);
      if (m) { let t = m[2], b = ''; const bm = t.match(/\s*@\s*(.+)$/); if (bm) { b = bm[1].trim(); t = t.slice(0, bm.index).trim(); } const kk = m[1].toLowerCase(); A.push({ t, b, soll: 'rwt'.includes(kk) ? 0 : kk === 'f' ? 1 : 2 }); }
      else if (opt.diagramm != null && /[;\t]/.test(l)) daten.push(l);
      else text.push(l);
    });
    let y = c.titel(opt.aufgabe, S.aussagen(nv, text.length > 0, L3));
    if (text.length) { const w = Math.min(1150, Math.max(560, ...text.map(z => mess(z, 27) + 110))), o = c.put({ form: 'lesetext', zeilen: text, w }, 0, y); y += o.h / c.k + 30; }
    else if (opt.diagramm != null && daten.length > 1) {
      const art = ['saeulen', 'balken', 'linie', 'punkte'].includes((opt.diagrammart || '').toLowerCase()) ? opt.diagrammart.toLowerCase() : 'saeulen';
      const o = objekt('diagramm', { ...B.diagramm.def, art, titel: opt.diagramm, daten: daten.join('\n'), ausgleich: false, uid: c.uid }, c.x0, c.y0 + y * c.k, c.k * 0.85); c.neu.push(o); y += o.h / c.k + 30;
    }
    const liste = A.filter(a => nv > 1 || a.soll < 2), nOpt = nv === 1 ? 2 : 3, ow = L3.slice(0, nOpt).map(t => Math.min(220, Math.max(130, mess(t, 22, true) + 34)));
    const aw = 720, beleg = text.length > 0;
    liste.forEach((a, i) => {
      const st = c.put({ form: 'zeile', text: a.t + (nv === 1 && a.b && beleg ? `  (→ ${S.zAbk} ${a.b})` : ''), nr: i + 1, w: aw, fuell: '#f8fafc' }, 0, y);
      const hh = Math.max(st.h / c.k, nv === 3 ? 86 : 70); let x = aw + 20;
      L3.slice(0, nOpt).forEach((t, j) => { c.put({ form: 'wahl', text: t, w: ow[j], h: hh, tipp: 'wahl', wende: true, gruppe: i, wert: j, soll: a.soll }, x, y); x += ow[j] + 12; });
      if (nv === 3) {
        const fw = beleg ? 150 : 380; c.put({ form: 'feld', text: beleg ? S.zeile : S.begr, w: fw, h: hh }, x + 8, y);
        if (a.b) c.put({ form: 'info', klein: true, text: beleg && /^\d/.test(a.b) ? S.zAbk + ' ' + a.b : a.b, w: fw - 16, loes: true, verdeckt: true }, x + 16, y + 32);
      }
      y += hh + 14;
    });
  },
  recht(c) {
    const { opt, rest } = steuer(c.L, ['aufgabe', 'sprache', 'frage']), S = sprache(opt), nv = c.nv;
    let P = rest.map(l => { const m = l.match(/^([+\-−~])?\s*([^:|]{1,40}):\s*(.+)$/); if (!m) return null; const [aus, ...beg] = m[3].split('|');
      return { soll: { '+': 1, '-': 2, '−': 2, '~': 3 }[m[1]] || 0, name: m[2].trim(), t: aus.trim(), beg: beg.join('|').trim() }; }).filter(Boolean);
    if (!P.length) return;
    const lab = [S.stimmt, S.stimmtNicht].concat(P.some(p => p.soll === 3) ? [S.teils] : []);
    if (nv === 1) { const a = P.find(p => p.soll === 1), b = P.find(p => p.soll === 2); P = a && b ? P.filter(p => p === a || p === b) : P.slice(0, 2); } else P = P.slice(0, 4);
    let y = c.titel(opt.frage || opt.aufgabe, opt.frage && opt.aufgabe ? opt.aufgabe : S.recht(nv));
    const dds = P.map(p => ({ form: 'blase', name: p.name, text: p.t, lab, soll: p.soll, stimme: 0, tipp: p.soll ? 'blase' : null, wende: !!p.soll }));
    if (nv === 3) dds.push({ form: 'blase', name: S.du, text: '', lab: [], leer: true });
    const bw = dds.length >= 4 ? 400 : 440, gap = 30; dds.forEach(d => { d.w = bw; });
    const hMin = Math.max(...dds.map(d => c.mass(d).h)) - 28;
    dds.forEach((d, i) => c.put({ ...d, hMin }, i * (bw + gap), y));
    y += hMin + 28 + 14;
    dds.forEach((d, i) => {
      const p = P[i], fx = i * (bw + gap), info = p && (p.beg || p.soll) ? { form: 'info', titel: p.soll ? lab[p.soll - 1] : '', text: p.beg, w: bw - 20, loes: true, verdeckt: true } : null;
      const ih = info ? c.mass(info).h : 0, fh = Math.max(200, ih + 52);
      c.put({ form: 'feld', text: nv === 1 && p ? S.satz(p.name) : S.begr, w: bw, h: fh }, fx, y);
      if (info) c.put(info, fx + 10, y + fh - ih - 10);
    });
  },
  tipp(c) {
    const { opt, rest } = steuer(c.L, ['aufgabe', 'sprache', 'regel']), S = sprache(opt), nv = c.nv, lh = 70, maxW = 1500;
    const komma = rest.some(l => l.includes('[,]'));
    const Z = rest.map(l => { const m = l.split(/\s+(?:Regel|Rule)\s*:\s*/i); return { atome: tippAtome(m[0], komma), regel: (m[1] || '').trim() }; });
    const wahl = Z.some(z => z.atome.some(a => a.art === 'wahl')), regel = !!opt.regel || Z.some(z => z.regel);
    let y = c.titel(opt.aufgabe, opt.aufgabe ? (nv === 3 && regel ? S.tipp(false, false, 3, true).replace(/^.*?\.\s*/, '') : '') : S.tipp(komma, wahl, nv, regel));
    const regelKarte = (text, x, w) => { // ★: Regel sichtbar · ★★★: Schreibfeld, Regel erst mit 💡
      if (nv === 1) { const o = c.put({ form: 'hinweis', text, w }, x, y); y += o.h / c.k + 12; }
      else if (nv === 3) { const info = { form: 'info', klein: true, text, w: w - 20, loes: true, verdeckt: true }, ih = c.mass(info).h, fh = ih + 46; c.put({ form: 'feld', text: S.regel, w, h: fh }, x, y); c.put(info, x + 10, y + 36); y += fh + 12; }
    };
    if (opt.regel && nv === 1) regelKarte(opt.regel, 0, 1100);
    Z.forEach((z, zi) => {
      const stuecke = [], slots = []; let x = 16, yy = 0, wMax = 0;
      const platz = w => { if (x + w > maxW - 16 && x > 16) { x = 16; yy += lh; } };
      z.atome.forEach(a => {
        if (a.t === 'sp') { if (x > 16) x += mess(' ', TFS); return; }
        const w = a.t === 'w' ? mess(a.s, TFS) : a.w; platz(w);
        if (a.t === 'w') stuecke.push([x, yy + lh / 2, a.s]); else slots.push({ ...a, x, y: yy });
        x += w; wMax = Math.max(wMax, x);
      });
      if (nv === 1 && komma) { const t = S.komma(z.atome.filter(a => a.art === 'komma' && a.soll === ',').length), w = mess(t, 24) + 24; platz(w); stuecke.push([x + 20, yy + lh / 2, t, 1]); x += w; wMax = Math.max(wMax, x); }
      const satz = objekt('utippsatz', { stuecke, w: wMax + 16, h: yy + lh, fs: TFS, uid: c.uid }, c.x0, c.y0 + y * c.k, c.k); c.neu.push(satz);
      slots.forEach(s => c.put({ form: 'schalter', art: s.art, opts: s.opts, soll: s.soll, wert: '', w: s.w, h: lh - 12, fs: TFS, tipp: 'schalter', wende: true }, s.x, y + s.y + 6));
      y += yy + lh + 12;
      if (z.regel) regelKarte(z.regel, 40, 1000);
      void zi;
    });
    if (opt.regel && nv === 3) regelKarte(opt.regel, 0, 1100);
  }
};
T.uebSteuer = steuer; /* für den Editor (uebeditor.js) */
// Antippen der neuen Kärtchen (über d.wende → T.karteWenden)
const setz = (o, dd) => T.replaceItem({ ...o, d: { ...o.d, ...dd } });
const TIPP = {
  fehler: o => setz(o, { markiert: !o.d.markiert, status: null }),
  wahl: o => T.page().items.filter(i => i.k === 'ukarte' && i.d.uid === o.d.uid && i.d.tipp === 'wahl' && i.d.gruppe === o.d.gruppe).forEach(i => setz(i, { gewaehlt: i.id === o.id ? !o.d.gewaehlt : false, status: null })),
  blase: o => setz(o, { stimme: ((o.d.stimme || 0) + 1) % ((o.d.lab || []).length + 1), status: null }),
  schalter: o => { const r = [''].concat(o.d.opts || []), i = r.indexOf(o.d.wert || ''); setz(o, { wert: r[(i + 1) % r.length], status: null }); }
};
// Prüfen / Neu / Lösung der neuen Übungsarten
const loesZeigen = (items, an) => items.filter(i => i.k === 'ukarte' && i.d.loes).forEach(c => setz(c, { verdeckt: !an }));
const AKTION = {
  fehler(a, items) {
    const Z = items.filter(i => i.d.form === 'zeile' && i.d.tipp === 'fehler'), nf = Z.filter(z => z.d.fehler).length;
    if (a === 'pruefen') {
      let gef = 0, zuviel = 0;
      Z.forEach(z => { if (!z.d.markiert) { setz(z, { status: null }); return; } if (z.d.fehler) gef++; else zuviel++; setz(z, { status: z.d.fehler ? 'richtig' : 'falsch' }); });
      T.toast(gef === nf && !zuviel ? `🎉 Alle ${nf} Fehler gefunden! Verbesserungen vergleichen: 💡 Lösung.` : `${gef} von ${nf} Fehlern gefunden` + (zuviel ? ` – ${zuviel === 1 ? '1 markierte Zeile ist' : zuviel + ' markierte Zeilen sind'} richtig.` : '.'), 4000);
      if (gef === nf && !zuviel) T.beep && T.beep();
    } else if (a === 'mischen') { Z.forEach(z => setz(z, { markiert: !!z.d.vorgabe, status: null })); loesZeigen(items, false); }
    else { Z.forEach(z => setz(z, { markiert: !!z.d.fehler, status: null })); loesZeigen(items, true); }
  },
  aussagen(a, items) {
    const O = items.filter(i => i.d.tipp === 'wahl'), G = [...new Set(O.map(o => o.d.gruppe))];
    if (a === 'pruefen') {
      let r = 0, offen = 0;
      G.forEach(g => { const og = O.filter(o => o.d.gruppe === g), gw = og.find(o => o.d.gewaehlt); if (!gw) offen++; else if (gw.d.wert === gw.d.soll) r++;
        og.forEach(o => setz(o, { status: o.d.gewaehlt ? (o.d.wert === o.d.soll ? 'richtig' : 'falsch') : null })); });
      T.toast(r === G.length ? `🎉 Alles richtig! (${r} von ${G.length})` : `${r} von ${G.length} richtig` + (offen ? ` – ${offen} noch offen.` : ' – die roten noch einmal prüfen.'), 3500);
      if (r === G.length) T.beep && T.beep();
    } else if (a === 'mischen') { O.forEach(o => setz(o, { gewaehlt: false, status: null })); loesZeigen(items, false); }
    else { O.forEach(o => setz(o, { gewaehlt: o.d.wert === o.d.soll, status: o.d.wert === o.d.soll ? 'richtig' : null })); loesZeigen(items, true); }
  },
  recht(a, items) {
    const Bl = items.filter(i => i.d.tipp === 'blase');
    if (a === 'pruefen') {
      let r = 0, offen = 0;
      Bl.forEach(b => { if (!b.d.stimme) { offen++; setz(b, { status: null }); return; } if (b.d.stimme === b.d.soll) r++; setz(b, { status: b.d.stimme === b.d.soll ? 'richtig' : 'falsch' }); });
      T.toast(r === Bl.length ? '🎉 Alles richtig eingeschätzt! Begründungen vergleichen: 💡 Lösung.' : `${r} von ${Bl.length} richtig eingeschätzt` + (offen ? ` – ${offen} noch offen.` : '.'), 4000);
      if (r === Bl.length) T.beep && T.beep();
    } else if (a === 'mischen') { Bl.forEach(b => setz(b, { stimme: 0, status: null })); loesZeigen(items, false); }
    else { Bl.forEach(b => setz(b, { stimme: b.d.soll, status: 'richtig' })); loesZeigen(items, true); }
  },
  tipp(a, items) {
    const Sl = items.filter(i => i.d.form === 'schalter');
    if (a === 'pruefen') {
      let r = 0, fz = 0, offen = 0, n = 0;
      Sl.forEach(s => { const w = s.d.wert || '', soll = s.d.soll; let st = null;
        if (s.d.art === 'komma') { if (soll === ',') { n++; if (w === ',') { st = 'richtig'; r++; } else offen++; } else if (w === ',') { st = 'falsch'; fz++; } }
        else { n++; if (!w) offen++; else if (w === soll) { st = 'richtig'; r++; } else { st = 'falsch'; fz++; } }
        setz(s, { status: st }); });
      T.toast(r === n && !fz ? `🎉 Alles richtig! (${r} von ${n})` : `${r} von ${n} Stellen richtig` + (fz ? `, ${fz} falsch` : '') + (offen ? `, ${offen} noch offen` : '') + '.', 4000);
      if (r === n && !fz) T.beep && T.beep();
    } else if (a === 'mischen') { Sl.forEach(s => setz(s, { wert: '', status: null })); loesZeigen(items, false); }
    else { Sl.forEach(s => setz(s, { wert: s.d.soll, status: s.d.soll ? 'richtig' : null })); loesZeigen(items, true); }
  }
};
// opt: { nv: 1|2|3 (★ mit Hilfen, ★★ normal, ★★★ schwerer), x0, y0, k } – mit x0/y0 wird die Übung an derselben Stelle neu aufgebaut (Niveau wechseln)
T.uebungErzeugen = (typ, text, opt = {}) => {
  const pg = T.page(), z = pg.view.z, k = opt.k || T.clamp(1 / z, 0.5, 4), uid = T.uid(), r = T.viewRect(), x0 = opt.x0 != null ? opt.x0 : r.x0 + 60 * k, neu = [];
  const nv = opt.nv || 2, fest = opt.x0 != null;
  // nicht über vorhandene Inhalte legen: unterhalb von allem, was im Bereich der neuen Übung liegt
  const belegt = fest ? [] : pg.items.filter(i => i.t === 'o' && i.x < x0 + 1300 * k && i.x + i.w > x0 && i.y + i.h > r.y0);
  let y0 = fest ? opt.y0 : Math.max(r.y0 + 90 * k, ...belegt.map(i => i.y + i.h + 60 * k));
  const yStart = y0;
  const L = zeilen(text); if (!L.length) { T.toast('Bitte zuerst Inhalte eintippen.'); return; }
  if (['gruppen', 'reihe', 'paare'].includes(typ)) { // optional „Aufgabe: …“ als Überschrift
    const ai = L.findIndex(l => /^(aufgabe|task)\s*:/i.test(l));
    if (ai >= 0) { const at = L.splice(ai, 1)[0].replace(/^[^:]*:\s*/, ''); if (at) { const tt = objekt('ukarte', { form: 'titel', text: at, w: 1100, uid }, x0, y0, k); neu.push(tt); y0 += tt.h + 20 * k; } }
  }
  const karte = (text, extra, x, y) => neu.push(objekt('ukarte', { text, w: Math.max(170, mess(text, 28, true) + 50), h: 70, uid, ziehbar: true, ...extra }, x, y, k));
  const beispiel = (text, w, zx, zy, zw, zh) => neu.push(objekt('ukarte', { text, w, h: 70, uid, fuell: '#e0e7ff', beispiel: true }, zx + (zw - w) / 2 * k, zy + (zh - 70) / 2 * k, k)); // ★: liegt schon richtig (fest)
  let unten = y0;
  if (typ === 'gruppen') {
    const G = L.map(l => { const [t, rest] = l.split(/:(.*)/s); return { t: t.trim(), w: (rest || '').split(/[,;]/).map(s => s.trim()).filter(Boolean) }; }).filter(g => g.w.length);
    const breite = 280, hoehe = Math.max(260, 90 + Math.max(...G.map(g => g.w.length)) * 80);
    G.forEach((g, i) => neu.push(objekt('uziel', { titel: nv === 3 ? '?' : g.t, titelEcht: g.t, w: breite, h: hoehe, uid, id: 'z' + i, kopf: PASTELL[i % 6] }, x0 + i * (breite + 30) * k, y0, k)));
    if (nv === 1) G.forEach((g, i) => { const w = Math.max(170, mess(g.w[0], 28, true) + 50); neu.push(objekt('ukarte', { text: g.w[0], w, h: 70, uid, fuell: '#e0e7ff', beispiel: true }, x0 + (i * (breite + 30) + (breite - w) / 2) * k, y0 + 64 * k, k)); });
    unten = y0 + (hoehe + 50) * k; let x = x0, y = unten;
    mische(G.flatMap((g, i) => g.w.slice(nv === 1 ? 1 : 0).map(w => [w, 'z' + i, i]))).forEach(([w, soll]) => { const wb = (Math.max(170, mess(w, 28, true) + 50) + 20) * k; if (x + wb > x0 + G.length * (breite + 30) * k && x > x0) { x = x0; y += 90 * k; } karte(w, { soll }, x, y); x += wb; });
  } else if (typ === 'reihe') {
    const sw = 220; L.forEach((l, i) => neu.push(objekt('uziel', { nr: nv === 3 ? null : i + 1, w: sw, h: 110, uid, id: 'z' + i }, x0 + i * (sw + 20) * k, y0, k)));
    const vor = nv === 1 ? new Set([0, L.length - 1]) : new Set();
    vor.forEach(i => beispiel(L[i], 200, x0 + i * (sw + 20) * k, y0, sw, 110));
    unten = y0 + 150 * k; let x = x0; mische(L.map((l, i) => [l, 'z' + i, i]).filter(e => !vor.has(e[2]))).forEach(([l, soll]) => { karte(l, { soll, w: 200 }, x, unten); x += 220 * k; });
  } else if (typ === 'paare') {
    const P = L.map(l => l.split(/\s*=\s*/)).filter(p => p.length >= 2).slice(0, nv === 1 ? 6 : 99), lw = Math.max(200, ...P.map(p => mess(p[0], 28, true) + 50)), rw = Math.max(200, ...P.map(p => mess(p[1], 28, true) + 50));
    P.forEach((p, i) => { const y = y0 + i * 90 * k; neu.push(objekt('ukarte', { text: p[0], w: lw, h: 70, uid, fuell: '#f1f5f9' }, x0, y, k), objekt('uziel', { w: rw + 20, h: 84, uid, id: 'z' + i }, x0 + (lw + 30) * k, y - 7 * k, k)); });
    if (nv === 1) beispiel(P[0][1], rw, x0 + (lw + 30) * k, y0 - 7 * k, rw + 20, 84);
    const xr = x0 + (lw + rw + 140) * k; mische(P.map((p, i) => [p[1], 'z' + i, i]).filter(e => nv !== 1 || e[2] !== 0)).forEach(([t, soll], i) => karte(t, { soll, w: rw }, xr, y0 + i * 90 * k));
    unten = y0 + P.length * 90 * k;
  } else if (typ === 'luecke') {
    let ablenker = []; const textZ = L.filter(l => { const m = l.match(/^ablenker\s*:\s*(.*)$/i); if (m) { ablenker = m[1].split(/[,;]/).map(s => s.trim()).filter(Boolean); return false; } return true; });
    if (nv === 1) ablenker = [];
    const t = textZ.join('\n'), lt = objekt('luecktext', { text: t, breite: 1100, uid, hinweis: nv === 1 }, x0, y0, k); neu.push(lt);
    const loes = [...t.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]); unten = y0 + lt.h + 40 * k; let x = x0, y = unten;
    if (nv === 3) { // ★★★: ohne Wortkarten – in die Lücken schreiben; „Lösung“ blendet die Wörter ein
      const g = T.genObj('luecktext', lt.d, false), sk = lt.w / g.w;
      loes.forEach((w, i) => { const tl = g.teile[i]; if (!tl) return; const kw = Math.min(tl.w, Math.max(150, mess(w, 28, true) + 50)); neu.push(objekt('ukarte', { text: w, w: kw, h: 70, uid, verdeckt: true, soll: 'g' + i, luecke: lt.id }, x0 + (tl.x + (tl.w - kw) / 2) * sk, y0 + (tl.y + (tl.h - 70) / 2) * sk, k)); });
    } else mische(loes.map((w, i) => [w, 'g' + i]).concat(ablenker.map(a => [a, null]))).forEach(([w, soll]) => { const wb = (Math.max(150, mess(w, 28, true) + 50) + 20) * k; if (x + wb > x0 + 1100 * k) { x = x0; y += 90 * k; } karte(w, { soll, w: Math.max(150, mess(w, 28, true) + 50), luecke: lt.id }, x, y); x += wb; });
    unten = y;
  } else if (typ === 'mc') {
    const opts = L.slice(1), nr = opts.filter(o => o.startsWith('*')).length, frage = L[0] + (nv === 1 ? `  (${nr} ${nr === 1 ? 'Antwort ist' : 'Antworten sind'} richtig)` : '');
    const tg = { text: frage, size: 36, c: '#1b1f2a', fett: true }, m = T.textMetrics(tg); neu.push({ t: 'o', id: T.uid(), k: 'text', d: tg, x: x0, y: y0, w: m.w * k, h: m.h * k, r: 0 });
    const bw = Math.max(320, ...opts.map(o => mess(o.replace(/^\*/, ''), 28, true) + 120));
    opts.forEach((o, i) => neu.push(objekt('ukarte', { text: o.replace(/^\*\s*/, ''), richtig: o.startsWith('*'), mc: true, gewaehlt: false, w: bw, h: 76, uid }, x0, y0 + (m.h + 20 + i * 90) * k, k)));
    unten = y0 + (m.h + 20 + opts.length * 90) * k;
  } else if (typ === 'memory') { // verdeckte Karten im Raster; Paare über d.paar
    const P = L.map(l => l.split(/\s*=\s*/)).filter(p => p.length >= 2 && p[0] && p[1]).slice(0, [0, 6, 10, 15][nv]);
    const karten = mische(P.flatMap((p, i) => [[p[0], i], [p.slice(1).join(' = '), i]])), sp = Math.min(6, Math.ceil(Math.sqrt(karten.length * 1.5))), kw = 230, kh = 130;
    karten.forEach(([t, paar], i) => neu.push(objekt('ukarte', { text: t, memo: true, paar, offen: false, w: kw, h: kh, uid }, x0 + (i % sp) * (kw + 20) * k, y0 + Math.floor(i / sp) * (kh + 20) * k, k)));
  } else if (typ === 'salat') { // je Wort: gemischte Buchstaben-Kärtchen über einer Reihe Kästchen
    let y = y0; const bw = 66;
    L.slice(0, 8).forEach((wort, wi) => {
      const zeichen = [...wort.replace(/\s+/g, '')]; if (!zeichen.length) return;
      let gem = mische(zeichen); for (let v = 0; v < 5 && gem.join('') === zeichen.join('') && zeichen.length > 1; v++) gem = mische(zeichen);
      if (nv === 1) gem.splice(gem.indexOf(zeichen[0]), 1); // ★: erster Buchstabe liegt schon im Kästchen
      let K = gem.map(c => ({ c, extra: false }));
      if (nv === 3) K = mische(K.concat([0, 1].map(() => ({ c: 'aeilnrst'[Math.floor(Math.random() * 8)], extra: true })))); // ★★★: zwei Buchstaben zu viel
      K.forEach(({ c, extra }, i) => neu.push(objekt('ukarte', extra ? { text: c, w: bw - 6, h: 70, uid, ziehbar: true, soll: null } : { text: c, w: bw - 6, h: 70, uid, ziehbar: true, buchstabe: true, soll: 'w' + wi }, x0 + i * bw * k, y, k)));
      zeichen.forEach((c, i) => neu.push(objekt('uziel', { w: bw, h: 84, uid, id: 'w' + wi + '_' + i, loes: c }, x0 + i * bw * k, y + 90 * k, k)));
      if (nv === 1) neu.push(objekt('ukarte', { text: zeichen[0], w: bw - 6, h: 70, uid, fuell: '#e0e7ff', beispiel: true }, x0 + 3 * k, y + 97 * k, k));
      y += 200 * k;
    });
  } else if (typ === 'karten') { // Karteikarten: Vorderseite A, antippen dreht auf B
    const P = L.map(l => l.split(/\s*=\s*/)).filter(p => p.length >= 2 && p[0]).slice(0, 24), sp = Math.min(5, Math.ceil(Math.sqrt(P.length * 1.6))), kw = 260, kh = 140;
    mische(P).forEach((p, i) => neu.push(objekt('ukarte', { text: p[0], vorne: p[0], hinten: p.slice(1).join(' = '), wende: true, gedreht: false, fuell: '#fff8db', w: kw, h: kh, uid }, x0 + (i % sp) * (kw + 20) * k, y0 + Math.floor(i / sp) * (kh + 20) * k, k)));
  } else if (BAU[typ]) { // Fehler finden, Aussagen prüfen, Wer hat recht?, Antipp-Text – Maße in Kärtchen-Pixeln ab (x0, y0)
    const c = { L, nv, k, uid, neu, x0, y0,
      put: (dd, lx, ly) => { const o = objekt('ukarte', { uid, ...dd }, x0 + lx * k, y0 + ly * k, k); neu.push(o); return o; },
      mass: dd => T.genObj('ukarte', dd, false),
      titel: (aufgabe, auftrag) => { let y = 0; if (aufgabe) y += c.put({ form: 'titel', text: aufgabe, w: 1150 }, 0, y).h / k + 6; if (auftrag) y += c.put({ form: 'titel', duenn: true, fs: 24, text: auftrag, w: 1150 }, 0, y).h / k; return y + 22; } };
    BAU[typ](c);
  }
  // Knöpfe unter der Übung
  if (!neu.length) { T.toast('Bitte zuerst Inhalte eintragen.'); return; }
  const ky = Math.max(...neu.map(o => o.y + o.h)) + 30 * k;
  const knoepfe = typ === 'memory' ? [['↺ Neu mischen', 'mischen', '#5b5bd6', '#8e5bd6'], ['💡 Alle aufdecken', 'loesung', '#f59e0b', '#f97316']]
    : typ === 'karten' ? [['↺ Mischen', 'mischen', '#5b5bd6', '#8e5bd6'], ['🔁 Alle umdrehen', 'loesung', '#f59e0b', '#f97316']]
    : typ === 'luecke' && nv === 3 ? [['💡 Lösung', 'loesung', '#f59e0b', '#f97316']]
    : typ === 'fehler' && nv === 1 ? [['💡 Lösung', 'loesung', '#f59e0b', '#f97316'], ['↺ Von vorn', 'mischen', '#5b5bd6', '#8e5bd6']]
    : BAU[typ] ? [['✓ Prüfen', 'pruefen', '#16a34a', '#22c55e'], ['↺ Von vorn', 'mischen', '#5b5bd6', '#8e5bd6'], ['💡 Lösung', 'loesung', '#f59e0b', '#f97316']]
    : [['✓ Prüfen', 'pruefen', '#16a34a', '#22c55e'], ['↺ Mischen', 'mischen', '#5b5bd6', '#8e5bd6'], ['💡 Lösung', 'loesung', '#f59e0b', '#f97316']];
  const quelle = { typ, quelle: text, ox: x0, oy: yStart, ok: k, nv };
  const kb = typ === 'memory' || typ === 'karten' ? 300 : 220;
  knoepfe.forEach(([t, a, c1, c2], i) => neu.push(objekt('uknopf', { text: t, aktion: a, uid, farbe: c1, farbe2: c2, ...quelle, w: kb }, x0 + i * (kb + 20) * k, ky, k)));
  if (typ !== 'karten') [1, 2, 3].forEach((s, i) => neu.push(objekt('uknopf', { text: '★'.repeat(s), aktion: 'niveau', stufe: s, uid, ...quelle, w: 110, h: 60,
    farbe: s === nv ? '#5b5bd6' : '#94a3b8', farbe2: s === nv ? '#8e5bd6' : '#cbd5e1' }, x0 + (knoepfe.length * (kb + 20) + 20 + i * 120) * k, ky + 5 * k, k)));
  T.snap(); neu.forEach(o => pg.items.push(o));
  if (!fest && y0 > r.y1 - 250 * k) { pg.view.y = 70 - (y0 - 30 * k) * z; } // Übung liegt unterhalb: Tafel dorthin schieben
  T.render();
  if (!fest && T.UEBUNGEN[typ] && T.UEBUNGEN[typ].tafel) T.toast(T.UEBUNGEN[typ].tafel, 3500);
  else if (!fest) T.toast(typ === 'memory' ? 'Memory steht auf der Tafel – zwei Karten antippen.' : typ === 'karten' ? 'Karteikarten stehen auf der Tafel – antippen dreht um.' : 'Übung steht auf der Tafel – Kärtchen ziehen, dann „✓ Prüfen“. ★ / ★★ / ★★★ wechselt das Niveau.', 3500);
  else T.toast('Niveau ' + '★'.repeat(nv), 1500);
};
// Karteikarte umdrehen
T.karteWenden = o => { if (o.d.tipp && TIPP[o.d.tipp]) { T.snap(); TIPP[o.d.tipp](o); T.render(); return; } /* neue Übungsarten: Antippen */
  const g = !o.d.gedreht; T.snap(); T.replaceItem({ ...o, d: { ...o.d, gedreht: g, text: g ? o.d.hinten : o.d.vorne, fuell: g ? '#dbeafe' : '#fff8db' } }); T.render(); };

// ---------- Auswerten, Einrasten, Mischen, Lösung ----------
const mitte = o => [o.x + o.w / 2, o.y + o.h / 2];
function zielVon(karte, items) { // Ablagefeld bzw. Lücke, in der die Kartenmitte liegt
  const [cx, cy] = mitte(karte);
  for (const z of items) {
    if (z.k === 'uziel' && T.hitObj(z, cx, cy)) return { id: z.d.id, obj: z };
    if (z.k === 'luecktext') { const id = T.teilAt ? T.teilAtAlle(z, cx, cy) : null; if (id) return { id, obj: z, teil: id }; }
  }
  return null;
}
T.teilAtAlle = (o, x, y) => { const g = T.genObj(o.k, o.d, false); if (!g.teile) return null; const [lx, ly] = T.objLocal(o, x, y), sx = (lx + o.w / 2) * g.w / o.w, sy = (ly + o.h / 2) * g.h / o.h;
  const t = g.teile.find(t => sx >= t.x && sx <= t.x + t.w && sy >= t.y && sy <= t.y + t.h); return t ? t.id : null; };
const zielRechteck = (z, teil) => { if (!teil) return z; const g = T.genObj(z.k, z.d, false), t = g.teile.find(x => x.id === teil), [ax, ay] = T.svgZuWelt(z, g, t.x, t.y), [bx, by] = T.svgZuWelt(z, g, t.x + t.w, t.y + t.h); return { x: ax, y: ay, w: bx - ax, h: by - ay }; };
T.uebungEinrasten = karte => { // Kärtchen mittig in Ablagefeld/Lücke setzen; mehrere Kärtchen im Feld werden untereinander gestapelt
  const pg = T.page(), items = pg.items.filter(i => i.d && i.d.uid === karte.d.uid), z = zielVon(karte, items);
  let neu = { ...karte, d: { ...karte.d, status: null } };
  if (z) {
    const r = zielRechteck(z.obj, z.teil);
    if (z.obj.k === 'uziel' && z.obj.d.titel) { // Kategorie: unter der Überschrift stapeln
      const drin = items.filter(i => i.k === 'ukarte' && i.id !== karte.id && (zielVon(i, items) || {}).id === z.id).length, kopf = 64 * z.obj.h / T.genObj('uziel', z.obj.d, false).h;
      neu.x = r.x + (r.w - karte.w) / 2; neu.y = r.y + kopf + drin * (karte.h + 10);
    } else { neu.x = r.x + (r.w - karte.w) / 2; neu.y = r.y + (r.h - karte.h) / 2; }
  }
  T.replaceItem(neu);
};
// Memory: Karte antippen deckt auf; zwei offene Karten – passen sie (gleiches Paar), bleiben sie grün offen, sonst nach 1,5 s wieder zu
let memoOffen = [], memoTimer = 0;
T.memoryTipp = o => {
  const finde = id => T.page().items.find(i => i.id === id);
  if (o.d.offen || o.d.gefunden) return;
  if (memoOffen.length >= 2) { clearTimeout(memoTimer); memoOffen.forEach(id => { const c = finde(id); if (c && !c.d.gefunden) T.replaceItem({ ...c, d: { ...c.d, offen: false, status: null } }); }); memoOffen = []; }
  T.replaceItem({ ...o, d: { ...o.d, offen: true, status: null } }); memoOffen.push(o.id);
  if (memoOffen.length === 2) {
    const [a, b] = memoOffen.map(finde);
    if (a && b && a.d.uid === b.d.uid && a.d.paar === b.d.paar) {
      [a, b].forEach(c => T.replaceItem({ ...c, d: { ...c.d, offen: true, gefunden: true, status: 'richtig' } })); memoOffen = [];
      const rest = T.page().items.filter(i => i.d && i.d.uid === a.d.uid && i.d.memo && !i.d.gefunden);
      if (!rest.length) { T.toast('🎉 Alle Paare gefunden!', 3000); T.beep && T.beep(); }
    } else memoTimer = setTimeout(() => { memoOffen.forEach(id => { const c = finde(id); if (c && !c.d.gefunden) T.replaceItem({ ...c, d: { ...c.d, offen: false } }); }); memoOffen = []; T.render(); }, 1500);
  }
  T.render();
};
T.uebungAktion = knopf => {
  const pg = T.page(), uid = knopf.d.uid, items = pg.items.filter(i => i.d && i.d.uid === uid), karten = items.filter(i => i.k === 'ukarte' && (i.d.ziehbar || i.d.mc));
  if (knopf.d.aktion === 'niveau') { // Übung an gleicher Stelle im anderen Niveau neu aufbauen
    if (knopf.d.quelle == null) return; T.snap();
    const pgx = T.page(); pgx.items = pgx.items.filter(i => !(i.d && i.d.uid === uid));
    const lage = new Map(items.filter(i => i.k === 'uziel').map(i => [i.d.id, i])); /* Zuordnungskästen: verschobene Kästen bleiben, wo sie sind */
    T.uebungErzeugen(knopf.d.typ, knopf.d.quelle, { nv: knopf.d.stufe, x0: knopf.d.ox, y0: knopf.d.oy, k: knopf.d.ok });
    if (knopf.d.typ === 'kaesten') { const it = T.page().items, kn = it.filter(i => i.k === 'uknopf').pop(), nu = kn && kn.d.uid;
      T.page().items = it.map(i => { const a = i.k === 'uziel' && i.d.uid === nu && lage.get(i.d.id); return a ? { ...i, x: a.x, y: a.y, ...(a.fest ? { fest: true } : {}) } : i; }); T.render(); }
    return;
  }
  T.snap();
  if (AKTION[knopf.d.typ]) { AKTION[knopf.d.typ](knopf.d.aktion, items); T.render(); T.renderOver(); return; }
  if (knopf.d.typ === 'karten') { // Karteikarten: mischen (alle Vorderseite) bzw. alle umdrehen
    const kk = items.filter(i => i.k === 'ukarte' && i.d.wende);
    if (knopf.d.aktion === 'mischen') { const pl = mische(kk.map(c => [c.x, c.y])); kk.forEach((c, i) => T.replaceItem({ ...c, x: pl[i][0], y: pl[i][1], d: { ...c.d, gedreht: false, text: c.d.vorne, fuell: '#fff8db' } })); }
    else { const g = !kk.every(c => c.d.gedreht); kk.forEach(c => T.replaceItem({ ...c, d: { ...c.d, gedreht: g, text: g ? c.d.hinten : c.d.vorne, fuell: g ? '#dbeafe' : '#fff8db' } })); }
    T.render(); T.renderOver(); return;
  }
  if (knopf.d.typ === 'memory') { // Memory: neu mischen (alles verdeckt) bzw. alle aufdecken
    const mk = items.filter(i => i.k === 'ukarte' && i.d.memo);
    if (knopf.d.aktion === 'mischen') { const pl = mische(mk.map(c => [c.x, c.y])); mk.forEach((c, i) => T.replaceItem({ ...c, x: pl[i][0], y: pl[i][1], d: { ...c.d, offen: false, status: null, gefunden: false } })); }
    else mk.forEach(c => T.replaceItem({ ...c, d: { ...c.d, offen: true } }));
    memoOffen = []; T.render(); T.renderOver(); return;
  }
  if (knopf.d.aktion === 'pruefen') {
    let r = 0, n = 0;
    for (const c of karten) {
      let st;
      if (c.d.mc) { st = !!c.d.gewaehlt === !!c.d.richtig ? 'richtig' : 'falsch'; }
      else if (c.d.buchstabe) { const z = zielVon(c, items); st = z && z.obj.d.loes === c.d.text && String(z.id).startsWith(c.d.soll + '_') ? 'richtig' : 'falsch'; } // gleiche Buchstaben sind austauschbar
      else { const z = zielVon(c, items); if (c.d.soll == null) st = z ? 'falsch' : null; else st = z && z.id === c.d.soll ? 'richtig' : 'falsch'; }
      if (st) { n++; if (st === 'richtig') r++; }
      T.replaceItem({ ...c, d: { ...c.d, status: st } });
    }
    T.toast(r === n ? `🎉 Alles richtig! (${r} von ${n})` : `${r} von ${n} richtig – die roten Kärtchen noch einmal prüfen.`, 3500);
    if (r === n) T.beep && T.beep();
  } else if (knopf.d.aktion === 'mischen') {
    const xs = karten.map(c => c.x), ys = karten.map(c => c.y), x0 = Math.min(...xs), y0 = Math.min(...ys);
    const plaetze = mische(karten.map(c => [c.x, c.y]));
    if (knopf.d.typ === 'mc') karten.forEach(c => T.replaceItem({ ...c, d: { ...c.d, gewaehlt: false, status: null } }));
    else { // alle Kärtchen zurück in einen Stapelbereich unter der Übung
      const k = karten[0] ? karten[0].h / 70 : 1, start = Math.max(...items.filter(i => i.k !== 'ukarte' && i.k !== 'uknopf').map(i => i.y + i.h), y0) + 30 * k;
      let x = Math.min(...items.map(i => i.x)), y = start, xmax = x + 1100 * k; void plaetze; void x0;
      mische(karten).forEach(c => { if (c.d.soll === undefined && !c.d.ziehbar) return; if (x + c.w > xmax) { x = Math.min(...items.map(i => i.x)); y += c.h + 20 * k; } T.replaceItem({ ...c, x, y, d: { ...c.d, status: null } }); x += c.w + 20 * k; });
      const ky = y + 100 * k; items.filter(i => i.k === 'uknopf').forEach(b => T.replaceItem({ ...b, y: ky }));
    }
  } else if (knopf.d.aktion === 'loesung') {
    const vergeben = new Set(items.filter(i => i.d.beispiel).map(i => (zielVon(i, items) || {}).id).filter(Boolean)); // Buchstabensalat: schon belegte Kästchen
    items.filter(i => i.k === 'uziel' && i.d.titelEcht && i.d.titel !== i.d.titelEcht).forEach(zz => T.replaceItem({ ...zz, d: { ...zz.d, titel: zz.d.titelEcht } })); // ★★★: Gruppennamen aufdecken
    items.filter(i => i.k === 'ukarte' && i.d.verdeckt).forEach(c => T.replaceItem({ ...c, d: { ...c.d, verdeckt: false, status: 'richtig' } })); // ★★★ Lückentext: Wörter einblenden
    for (const c of karten) {
      if (c.d.mc) { T.replaceItem({ ...c, d: { ...c.d, gewaehlt: !!c.d.richtig, status: 'richtig' } }); continue; }
      if (c.d.soll == null) continue;
      if (c.d.buchstabe) { // freies Kästchen mit passendem Buchstaben suchen
        const z = items.find(i => i.k === 'uziel' && String(i.d.id).startsWith(c.d.soll + '_') && i.d.loes === c.d.text && !vergeben.has(i.d.id));
        if (z) vergeben.add(z.d.id);
        if (z) T.replaceItem({ ...c, x: z.x + (z.w - c.w) / 2, y: z.y + (z.h - c.h) / 2, d: { ...c.d, status: 'richtig' } });
        continue;
      }
      const ziel =c.d.soll[0] === 'g' ? items.find(i => i.k === 'luecktext') : items.find(i => i.k === 'uziel' && i.d.id === c.d.soll); if (!ziel) continue;
      const r = zielRechteck(ziel, c.d.soll[0] === 'g' ? c.d.soll : null);
      T.replaceItem({ ...c, x: r.x + (r.w - c.w) / 2, y: r.y + (r.h - c.h) / 2, d: { ...c.d, status: 'richtig' } });
      if (ziel.k === 'uziel' && ziel.d.titel) T.uebungEinrasten(T.page().items.find(i => i.id === c.id));
    }
    T.page().items.filter(i => i.d && i.d.uid === uid && i.k === 'ukarte' && i.d.soll && i.d.ziehbar).forEach(c => T.replaceItem({ ...c, d: { ...c.d, status: 'richtig' } }));
  }
  T.render(); T.renderOver();
};

// ---------- Diagramm ----------
const zahlen = s => parseFloat(String(s).replace(',', '.'));
const schoen = roh => { const m = 10 ** Math.floor(Math.log10(roh || 1)), r = roh / m; return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * m; };
const DFARB = ['#5b5bd6', '#f59e0b', '#16a34a', '#ec4899', '#0ea5e9', '#8b5cf6'];
B.diagramm = { name: 'Diagramm', gruppe: 'Diagramme', def: { art: 'saeulen', titel: '', daten: 'Tag;Temperatur in °C\nMo;12\nDi;15\nMi;11\nDo;17\nFr;19', ausgleich: false },
  felder: [{ k: 'art', l: 'Art', typ: 'auswahl', opts: [['saeulen', 'Säulendiagramm'], ['balken', 'Balkendiagramm'], ['linie', 'Liniendiagramm'], ['punkte', 'Punktdiagramm (Messwerte)'], ['kreis', 'Kreisdiagramm']] },
    { k: 'titel', l: 'Überschrift', typ: 'text' }, { k: 'daten', l: 'Daten (1. Zeile: Beschriftungen, darunter je Zeile x und y – weitere Spalten = weitere Reihen)', typ: 'tabelle' },
    { k: 'ausgleich', l: 'Ausgleichsgerade (bei Punkt-/Liniendiagramm)', typ: 'check' }],
  gen: (d, P) => diagramm(d, P) };
function diagramm(d, P) {
  const Z = String(d.daten || '').split(/\r?\n/).map(l => l.split(/;|\t/).map(s => s.trim())).filter(r => r.some(Boolean));
  const kopf = Z[0] || ['x', 'y'], rows = Z.slice(1), reihen = Math.max(1, kopf.length - 1);
  const W = 900, H = 600, top = d.titel ? 70 : 30, ml = 90, mr = 30, mb = 80, pw = W - ml - mr, ph = H - top - mb;
  let s = d.titel ? tx(W / 2, 34, d.titel, P.ink, 30, 'middle', 'font-weight="700"') : '';
  const werte = rows.map(r => r.slice(1).map(zahlen));
  if (d.art === 'kreis') {
    const v = rows.map(r => Math.max(0, zahlen(r[1]) || 0)), sum = v.reduce((a, b) => a + b, 0) || 1, cx = 320, cy = top + ph / 2 + 10, R = Math.min(ph / 2, 230);
    let a = -Math.PI / 2;
    v.forEach((x, i) => { const b = a + x / sum * 2 * Math.PI, gross = b - a > Math.PI ? 1 : 0;
      s += v.length === 1 ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${DFARB[i % 6]}"/>` : `<path d="M${cx} ${cy} L${f(cx + R * Math.cos(a))} ${f(cy + R * Math.sin(a))} A${R} ${R} 0 ${gross} 1 ${f(cx + R * Math.cos(b))} ${f(cy + R * Math.sin(b))}Z" fill="${DFARB[i % 6]}" stroke="#fff" stroke-width="3"/>`;
      const m = (a + b) / 2; if (x / sum > 0.04) s += tx(cx + R * 0.62 * Math.cos(m), cy + R * 0.62 * Math.sin(m), Math.round(x / sum * 100) + ' %', '#fff', 22, 'middle', 'font-weight="700"'); a = b; });
    rows.forEach((r, i) => { const y = top + 30 + i * 40; s += rc(600, y - 12, 24, 24, 'none', DFARB[i % 6], 0, 'rx="5"') + tx(636, y, `${r[0]} (${r[1]})`, P.ink, 20, 'start'); });
    return { svg: doc(W, H, s), w: W, h: H };
  }
  const xNum = ['punkte', 'linie'].includes(d.art) && rows.every(r => isFinite(zahlen(r[0])));
  const alle = werte.flat().filter(isFinite), xs = rows.map(r => zahlen(r[0]));
  let ymin = Math.min(0, ...alle), ymax = Math.max(...alle, 1); const sy = schoen((ymax - ymin) / 6); ymin = Math.floor(ymin / sy) * sy; ymax = Math.ceil(ymax / sy) * sy;
  let xmin = 0, xmax = rows.length, sx = 1;
  if (xNum) { xmin = Math.min(0, ...xs); xmax = Math.max(...xs); sx = schoen((xmax - xmin) / 8 || 1); xmin = Math.floor(xmin / sx) * sx; xmax = Math.ceil(xmax / sx) * sx || 1; }
  const balken = d.art === 'balken';
  const X = v => ml + (v - xmin) / (xmax - xmin) * pw, Y = v => top + ph - (v - ymin) / (ymax - ymin) * ph;
  const VX = v => ml + (v - ymin) / (ymax - ymin) * pw; // für Balken (Wert waagerecht)
  // Gitter und Achsen
  for (let v = ymin; v <= ymax + 1e-9; v += sy) { const p = balken ? VX(v) : Y(v); s += balken ? ln(p, top, p, top + ph, P.grid, 1) + tx(p, top + ph + 22, T.zahl(v, 3), P.ink, 16) : ln(ml, p, ml + pw, p, P.grid, 1) + tx(ml - 10, p, T.zahl(v, 3), P.ink, 16, 'end'); }
  s += ln(ml, top + ph, ml + pw, top + ph, P.ink, 2.5) + ln(ml, top, ml, top + ph, P.ink, 2.5);
  const yName = kopf.slice(1).join(' / '), xName = kopf[0];
  s += balken ? tx(ml + pw / 2, H - 22, yName, P.ink, 18) : tx(ml + pw / 2, H - 22, xName, P.ink, 18) + `<text x="24" y="${f(top + ph / 2)}" font-size="18" fill="${P.ink}" text-anchor="middle" transform="rotate(-90 24 ${f(top + ph / 2)})">${esc(yName)}</text>`;
  if (xNum) for (let v = xmin; v <= xmax + 1e-9; v += sx) s += ln(X(v), top + ph, X(v), top + ph + 6, P.ink, 2) + tx(X(v), top + ph + 22, T.zahl(v, 3), P.ink, 16);
  const n = rows.length, slot = (balken ? ph : pw) / Math.max(1, n), bb = slot * 0.7 / reihen;
  if (!xNum) rows.forEach((r, i) => { const m = (balken ? top : ml) + slot * (i + 0.5); s += balken ? tx(ml - 10, m, r[0], P.ink, 16, 'end') : tx(m, top + ph + 22, r[0], P.ink, 16); });
  for (let j = 0; j < reihen; j++) {
    const farbe = DFARB[j % 6], pkt = rows.map((r, i) => [xNum ? xs[i] : i, werte[i][j]]).filter(p => isFinite(p[1]));
    const px = ([i]) => xNum ? X(i) : ml + slot * (i + 0.5);
    if (d.art === 'saeulen') pkt.forEach(([i, v]) => { const x = ml + slot * (i + 0.15) + j * bb; s += rc(x, Math.min(Y(v), Y(0)), bb - 4, Math.abs(Y(v) - Y(0)), 'none', farbe, 0, 'rx="4"'); });
    else if (balken) pkt.forEach(([i, v]) => { const y = top + slot * (i + 0.15) + j * bb; s += rc(Math.min(VX(v), VX(0)), y, Math.abs(VX(v) - VX(0)), bb - 4, 'none', farbe, 0, 'rx="4"'); });
    else {
      if (d.art === 'linie') s += `<polyline points="${pkt.map(p => f(px(p)) + ',' + f(Y(p[1]))).join(' ')}" fill="none" stroke="${farbe}" stroke-width="4" stroke-linejoin="round"/>`;
      pkt.forEach(p => { s += d.art === 'punkte' ? `<path d="M${f(px(p) - 8)} ${f(Y(p[1]) - 8)}l16 16M${f(px(p) + 8)} ${f(Y(p[1]) - 8)}l-16 16" stroke="${farbe}" stroke-width="3.5"/>` : `<circle cx="${f(px(p))}" cy="${f(Y(p[1]))}" r="6" fill="${farbe}"/>`; });
      if (d.ausgleich && pkt.length >= 2) { // lineare Regression; bei Text-x (Mo, Di …) nur Trendlinie ohne Gleichung
        const nn = pkt.length, sx1 = pkt.reduce((a, p) => a + p[0], 0), sy1 = pkt.reduce((a, p) => a + p[1], 0), sxx = pkt.reduce((a, p) => a + p[0] * p[0], 0), sxy = pkt.reduce((a, p) => a + p[0] * p[1], 0);
        const m = (nn * sxy - sx1 * sy1) / (nn * sxx - sx1 * sx1 || 1), b = (sy1 - m * sx1) / nn;
        const [a0, a1] = xNum ? [xmin, xmax] : [0, n - 1];
        s += `<line x1="${f(px([a0]))}" y1="${f(Y(m * a0 + b))}" x2="${f(px([a1]))}" y2="${f(Y(m * a1 + b))}" stroke="${farbe}" stroke-width="2.5" stroke-dasharray="10 7" opacity=".8"/>`;
        if (xNum) s += tx(ml + pw - 10, top + 20 + j * 28, `y ≈ ${T.zahl(m, 3)}·x ${b < 0 ? '−' : '+'} ${T.zahl(Math.abs(b), 3)}`, farbe, 18, 'end', 'font-weight="600"');
      }
    }
    if (reihen > 1) s += rc(ml + 10 + j * 190, top - 26, 18, 18, 'none', farbe, 0, 'rx="4"') + tx(ml + 34 + j * 190, top - 17, kopf[j + 1], P.ink, 16, 'start');
  }
  return { svg: doc(W, H, s), w: W, h: H };
}
const dq = (l, fn) => ({ l, f: d => ({ d: fn({ ...d }) }) });
B.diagramm.schnell = ['saeulen', 'balken', 'linie', 'punkte', 'kreis'].map((a, i) => dq(['▮ Säulen', '▬ Balken', '📈 Linie', '✕ Punkte', '◔ Kreis'][i], d => { d.art = a; return d; }))
  .concat([dq('Ausgleichsgerade', d => { d.ausgleich = !d.ausgleich; return d; })]);

// ---------- Messwerttabelle ----------
B.messwerte = { name: 'Messwerttabelle', gruppe: 'Diagramme', def: { groessen: 'Zeit t in s;Weg s in m', zeilen: 6, werte: '' },
  felder: [{ k: 'groessen', l: 'Größen mit Einheit (je Feld eine)', typ: 'tabelle', zeile: true, spalten: 2 }, { k: 'zeilen', l: 'Anzahl Messungen', typ: 'zahl', min: 1, max: 30 }, { k: 'werte', l: 'Messwerte (je Zeile eine Messung) – oder leer lassen zum Hineinschreiben', typ: 'tabelle', kopfAus: 'groessen' }],
  gen: (d, P) => { const g = String(d.groessen).split(';').map(s => s.trim()).filter(Boolean), w = String(d.werte || '').split(/\r?\n/).filter(l => l.trim());
    const n = Math.max(Math.round(d.zeilen), w.length);
    return B.tabelle.gen({ zeilen: n + 1, spalten: g.length + 1, kopf: true, breite: 4.2, hoehe: 1.3, sb: [1.6].concat(g.map(() => 4.2)), zh: d.zh, inhalt: ['Nr.'].concat(g).join(';') + '\n' + Array.from({ length: n }, (_, i) => [i + 1].concat((w[i] || '').split(';').map(s => s.trim())).join(';')).join('\n') }, P); } };
B.messwerte.schnell = [
  dq('＋ Messung', d => { d.zeilen = Math.round(d.zeilen) + 1; return d; }), dq('＋ Größe', d => { d.groessen += ';Neue Größe in …'; return d; }),
  { l: '📊 Diagramm daraus', aus: o => { const g = String(o.d.groessen).split(';').map(s => s.trim()), w = String(o.d.werte || '').split(/\r?\n/).filter(l => l.trim());
    if (!w.length) { T.toast('Erst Messwerte eintragen (✏️ Bearbeiten) – dann entsteht das Diagramm.', 4000); return; }
    const d = { ...B.diagramm.def, art: 'punkte', ausgleich: true, titel: '', daten: g.join(';') + '\n' + w.join('\n') }, gg = T.genObj('diagramm', d, false), k = o.h / gg.h * 1.6;
    T.snap(); T.addItem({ t: 'o', k: 'diagramm', d, x: o.x + o.w + 40, y: o.y, w: gg.w * k, h: gg.h * k, r: 0 }); T.toast('Diagramm steht neben der Tabelle.'); } }];

// ---------- Formelsammlung ----------
// {Zähler|Nenner} wird als Bruch gesetzt
B.formel = { name: 'Formel', gruppe: 'intern', def: { text: 'v = {s|t}', name: '', groesse: 44 }, felder: [{ k: 'text', l: 'Formel ({Zähler|Nenner} für Brüche)', typ: 'text' }, { k: 'name', l: 'Bezeichnung (optional)', typ: 'text' }],
  gen: (d, P) => {
    const fs = d.groesse || 44, kf = fs * 0.8, teile = String(d.text).split(/(\{[^{}]*\|[^{}]*\})/), pad = 16; let x = pad, s = '';
    const hatBruch = teile.some(t => /^\{/.test(t)), H = (hatBruch ? fs * 2.6 : fs * 1.6) + (d.name ? 40 : 0) + pad, mid = (d.name ? 40 : 0) + pad / 2 + (hatBruch ? fs * 1.3 : fs * 0.8);
    if (d.name) s += tx(pad, 22, d.name, P.acc, 20, 'start', 'font-weight="600"');
    for (const t of teile) {
      if (!t) continue;
      const m = t.match(/^\{([^|]*)\|([^}]*)\}$/);
      if (m) { const w = Math.max(mess(m[1], kf), mess(m[2], kf)) + 16; s += tx(x + w / 2, mid - kf * 0.62, m[1], P.ink, kf) + ln(x + 4, mid, x + w - 4, mid, P.ink, Math.max(2, fs * 0.06)) + tx(x + w / 2, mid + kf * 0.66, m[2], P.ink, kf); x += w; }
      else { s += `<text x="${f(x)}" y="${f(mid)}" font-size="${fs}" fill="${P.ink}" dominant-baseline="central" font-family="Cambria Math, Segoe UI, serif">${esc(t)}</text>`; x += mess(t, fs) * 1.04; }
    }
    const W = Math.max(x + pad, d.name ? mess(d.name, 20, true) + 2 * pad : 0);
    return { svg: doc(W, H, s), w: W, h: H };
  } };
T.FORMELN = {
  'Mathe: Flächen': [['Rechteck', 'A = a · b'], ['Quadrat', 'A = a²'], ['Dreieck', 'A = {g · h|2}'], ['Parallelogramm', 'A = g · h'], ['Trapez', 'A = {(a + c) · h|2}'], ['Kreis', 'A = π · r²'], ['Kreisumfang', 'u = 2 · π · r']],
  'Mathe: Körper': [['Würfel', 'V = a³'], ['Quader', 'V = a · b · c'], ['Prisma', 'V = G · h'], ['Zylinder', 'V = π · r² · h'], ['Pyramide', 'V = {1|3} · G · h'], ['Kegel', 'V = {1|3} · π · r² · h'], ['Kugel', 'V = {4|3} · π · r³'], ['Kugeloberfläche', 'O = 4 · π · r²']],
  'Mathe: Algebra & Funktionen': [['Satz des Pythagoras', 'a² + b² = c²'], ['Prozentwert', 'W = {G · p|100}'], ['Zinsen', 'Z = {K · p|100}'], ['Lineare Funktion', 'f(x) = m · x + b'], ['Steigung', 'm = {y₂ − y₁|x₂ − x₁}'], ['Scheitelpunktform', 'f(x) = a(x − d)² + e'], ['p-q-Formel', 'x₁,₂ = −{p|2} ± √({p²|4} − q)'], ['Binomische Formel', '(a + b)² = a² + 2ab + b²'], ['Dreisatz', '{a|b} = {c|d}']],
  'Physik': [['Geschwindigkeit', 'v = {s|t}'], ['Beschleunigung', 'a = {Δv|Δt}'], ['Kraft', 'F = m · a'], ['Gewichtskraft', 'F_G = m · g'], ['Dichte', 'ρ = {m|V}'], ['Druck', 'p = {F|A}'], ['Arbeit', 'W = F · s'], ['Leistung', 'P = {W|t}'], ['Ohmsches Gesetz', 'U = R · I'], ['Elektrische Leistung', 'P = U · I'], ['Kinetische Energie', 'E_kin = {1|2} · m · v²'], ['Lageenergie', 'E_pot = m · g · h'], ['Wirkungsgrad', 'η = {E_nutz|E_zu}']],
  'Chemie': [['Stoffmenge', 'n = {m|M}'], ['Konzentration', 'c = {n|V}'], ['Massenanteil', 'w = {m_Stoff|m_gesamt}'], ['Dichte', 'ρ = {m|V}']]
};
})();
