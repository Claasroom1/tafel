// Tafel-App – 🧭 Unterrichtsalltag: Strukturen zum Hineinschreiben und gemeinsamen Besprechen (Tafel und Notizheft – kein Aufgabengenerator)
// Arbeitsauftrag-Karte · „Fertig? Dann …“ · Gruppenrollen · Klassendienste · Klassenrat · Lernstationen mit Laufzettel ·
// Redemittel / Satzanfänge · Wortspeicher · Visueller Tagesplan · Geburtstagskalender. Namen nur aus dem lokalen Speicher dieses Geräts – nichts wird gesendet.
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', ROT = '#c62828', LILA = '#6a1b9a', TUERKIS = '#00838f', BRAUN = '#8d6e63', GRAU = '#64748b', RAND = '#3a6d99', TINTE = '#1b1f2a', LINIE = '#94a3b8';
const FARBEN = [BLAU, GRUEN, ORANGE, LILA, ROT, TUERKIS, BRAUN, GRAU];
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const rechts = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="end" ' + extra);
const fett = 'font-weight="700"';
const box = (x, y, w, h, rand, fuell, r = 14, sw = 2.5, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}" ${extra}/>`;
const flaeche = (x, y, w, h, col, op, r = 14) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${col}" opacity="${op}"/>`;
const strich = (x1, y1, x2, y2, col = LINIE, sw = 1.5, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${sw}" ${extra}/>`;
const linien = (x0, x1, y, n, abst = 44) => { let s = ''; for (let i = 0; i < n; i++) s += strich(x0, y + i * abst, x1, y + i * abst, LINIE, 1.5, 'stroke-dasharray="6 6"'); return s; };
const umbruch = (z, max) => { const out = []; let cur = ''; for (const w of String(z).split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const zeilen = s => String(s || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean);
const kurz = (t, max) => { t = String(t); return t.length > max ? t.slice(0, Math.max(1, max - 1)) + '…' : t; };
const ganz = (v, lo, hi, def) => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? Math.round(T.clamp(n, lo, hi)) : def; };
const haken = (x, y, an, gr, P) => box(x, y, gr, gr, an ? GRUEN : P.ink, an ? GRUEN : 'none', 7, 2.5) +
  (an ? `<path d="M ${f(x + gr * 0.22)} ${f(y + gr * 0.52)} l ${f(gr * 0.2)} ${f(gr * 0.23)} l ${f(gr * 0.37)} ${f(-gr * 0.47)}" fill="none" stroke="#ffffff" stroke-width="${f(gr / 9)}" stroke-linecap="round" stroke-linejoin="round"/>` : '');
const umschalten = (arr, i) => { const s = new Set(arr || []); s.has(i) ? s.delete(i) : s.add(i); return [...s].sort((a, b) => a - b); };
function tafel(icon, titel, W, H, inhalt, P, teile) {
  const r = { svg: T._svg.doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 44, icon + ' ' + titel, 32, P.ink, fett) + inhalt), w: W, h: H };
  if (teile && teile.length) r.teile = teile;
  return r;
}

/* Klassenliste: nur aus dem lokalen Speicher dieses Browsers (Klasse → Vornamen), nichts wird gesendet */
const tafelKlasse = d => String(d.klasse || '').trim() || String((T.S && T.S.board && T.S.board.klasse) || '').trim();
const klassenListe = kl => { if (!kl) return [];
  try { const L = JSON.parse(localStorage.getItem('tafelapp.klassen') || '{}'), a = L && typeof L === 'object' ? L[kl] : null;
    return Array.isArray(a) ? a.map(x => String(x == null ? '' : x).trim()).filter(Boolean) : []; } catch (e) { return []; } };
const mischen = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const ausListe = (o, fn) => {
  const d = { ...B[o.k].def, ...o.d }, kl = tafelKlasse(d), L = klassenListe(kl);
  if (!L.length) { T.toast && T.toast(kl ? 'Für die Klasse ' + kl + ' ist keine Namensliste gespeichert – Namen bitte mit dem Stift eintragen.' : 'Diese Tafel hat keine Klasse – Klasse unter ✏️ Bearbeiten eintragen oder Namen mit dem Stift schreiben.', 3800); return; }
  T.bausteinAendern(o, { f: dd => ({ d: fn(dd, L) }) });
};
const KLASSE_FELD = { k: 'klasse', l: 'Klasse für die Namensliste (leer = Klasse der Tafel)', typ: 'text' };

// ---------- 1 · Arbeitsauftrag-Karte ----------
const SOZIAL = [['allein', '👤', 'allein', BLAU, '#e3f2fd'], ['partner', '👥', 'zu zweit', GRUEN, '#e8f5e9'], ['gruppe', '👨‍👩‍👧', 'Gruppe', ORANGE, '#fff3e0']];
B.al_auftrag = { name: 'Arbeitsauftrag-Karte', gruppe: 'Klassenleben',
  def: { was: '', womit: '', sozial: '', minuten: 0, fertig: '' },
  felder: [{ k: 'was', l: 'Was? (leer = Linien zum Schreiben)', typ: 'textarea' }, { k: 'womit', l: 'Womit? – Material (leer = Linie)', typ: 'text' },
    { k: 'sozial', l: 'Wie? – Sozialform (auch antippbar)', typ: 'auswahl', opts: [['', 'offen'], ['allein', '👤 allein'], ['partner', '👥 zu zweit'], ['gruppe', '👨‍👩‍👧 Gruppe']] },
    { k: 'minuten', l: 'Wie lange? – Minuten (0 = leer zum Schreiben)', typ: 'zahl', min: 0, max: 240 }, { k: 'fertig', l: 'Fertig? Dann … (leer = Linie)', typ: 'textarea' }],
  gen: (d, P) => {
    const W = 1000, teile = [], xi = 330; let y = 80, s = '';
    const feld = (icon, label, col, h, inhalt) => {
      s += box(30, y, 940, h, col, 'none', 14) + flaeche(30, y, 280, h, col, 0.13) + mitte(78, y + h / 2, icon, 44, '#000000');
      label.forEach((l, i) => { s += text(118, y + h / 2 + (i - (label.length - 1) / 2) * 30, l, 24, col, fett); });
      s += inhalt(y, h); y += h + 14;
    };
    const textFeld = (t, n0) => { const zl = zeilen(t).flatMap(z => umbruch(z, 42)), h = zl.length ? Math.max(96, 36 + zl.length * 36) : 40 + n0 * 48;
      return [h, (y0, hh) => zl.length ? zl.map((z, i) => text(xi, y0 + hh / 2 + (i - (zl.length - 1) / 2) * 36, z, 26, P.ink)).join('') : linien(xi, 950, y0 + 64, n0, 48)]; };
    let [h1, i1] = textFeld(d.was, 2); feld('📝', ['Was?'], BLAU, h1, i1);
    [h1, i1] = textFeld(d.womit, 1); feld('🧰', ['Womit?'], LILA, h1, i1);
    feld('🤝', ['Wie?'], GRUEN, 124, (y0, hh) => { let t = '';
      SOZIAL.forEach(([k, em, l, col, fu], i) => { const x = xi + i * 208, an = d.sozial === k, aus = d.sozial && !an;
        t += box(x, y0 + 12, 192, hh - 24, an ? col : GRAU, an ? fu : 'none', 14, an ? 4 : 2, aus ? 'opacity=".45"' : '');
        t += mitte(x + 96, y0 + 50, em, 40, '#000000', aus ? 'opacity=".45"' : '') + mitte(x + 96, y0 + 92, l, 21, an ? TINTE : P.ink, (an ? fett : '') + (aus ? ' opacity=".45"' : ''));
        teile.push({ id: 'so_' + k, x, y: y0 + 12, w: 192, h: hh - 24 }); });
      return t; });
    const min = ganz(d.minuten, 0, 240, 0);
    feld('⏱️', ['Wie lange?'], ORANGE, 96, (y0, hh) => min ? text(xi, y0 + hh / 2, min + ' Minuten', 34, P.ink, fett)
      : box(xi, y0 + 16, 150, hh - 32, LINIE, 'none', 10, 2, 'stroke-dasharray="6 6"') + text(xi + 168, y0 + hh / 2, 'Minuten', 26, P.ink));
    [h1, i1] = textFeld(d.fertig, 1); feld('✅', ['Fertig?', 'Dann …'], ROT, Math.max(h1, 96), i1);
    return tafel('📌', 'Arbeitsauftrag', W, y + 6, s, P, teile);
  } };
B.al_auftrag.tippen = (o, id) => { const k = id.slice(3); T.bausteinAendern(o, { f: dd => ({ d: { ...dd, sozial: dd.sozial === k ? '' : k } }) }); };
B.al_auftrag.schnell = [{ l: '＋ 5 Minuten', f: dd => ({ d: { ...dd, minuten: Math.min(240, ganz(dd.minuten, 0, 240, 0) + 5) } }) },
  { l: '− 5 Minuten', f: dd => ({ d: { ...dd, minuten: Math.max(0, ganz(dd.minuten, 0, 240, 0) - 5) } }) },
  { l: '↺ Sozialform offen', f: dd => ({ d: { ...dd, sozial: '' } }) }];

// ---------- 2 · „Fertig? Dann …“ ----------
const FERTIG_BSP = [['📖', 'Lesen'], ['📇', 'Lernkarten üben'], ['🤝', 'Anderen helfen'], ['📒', 'Heft ordnen'], ['✏️', 'Fehler verbessern'], ['🧩', 'Knobeln'], ['🎨', 'Heft gestalten'], ['🔁', 'Wiederholen']];
const PASTELL = [[BLAU, '#e3f2fd'], [GRUEN, '#e8f5e9'], [ORANGE, '#fff3e0'], [LILA, '#f3e5f5'], [ROT, '#ffebee'], [TUERKIS, '#e0f7fa'], ['#9e7c00', '#fffde7'], ['#455a64', '#eceff1']];
const EMOJI_VORN = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})[️‍\p{Extended_Pictographic}]*)\s*/u;
B.al_fertig = { name: 'Fertig? Dann …', gruppe: 'Klassenleben',
  def: { thema: 'leer', anzahl: 6, angebote: '' },
  felder: [{ k: 'thema', l: 'Kacheln', typ: 'auswahl', opts: [['leer', 'Leer (zum Hineinschreiben)'], ['beispiel', 'Mit Beispielen (Lesen, Lernkarten …)']] },
    { k: 'anzahl', l: 'Anzahl Kacheln (4–8)', typ: 'zahl', min: 4, max: 8 }, { k: 'angebote', l: 'Eigene Angebote (je Zeile eins, gern mit Symbol vorn) – ersetzen die Kacheln', typ: 'liste' }],
  gen: (d, P) => {
    const n = ganz(d.anzahl, 4, 8, 6), eigene = zeilen(d.angebote), sp = n <= 4 ? 2 : n <= 6 ? 3 : 4, cw = (940 - (sp - 1) * 20) / sp, ch = 200, W = 1000;
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = 30 + (i % sp) * (cw + 20), y = 82 + Math.floor(i / sp) * (ch + 18), [col, fu] = PASTELL[i % PASTELL.length];
      let em = '', t = '';
      if (eigene.length) { const z = eigene[i] || '', m = z.match(EMOJI_VORN); em = m ? m[1] : ''; t = m ? z.slice(m[0].length) : z; }
      else if (d.thema === 'beispiel') [em, t] = FERTIG_BSP[i % FERTIG_BSP.length];
      s += box(x, y, cw, ch, col, fu, 18, 3);
      if (em) s += mitte(x + cw / 2, y + 62, em, 60, '#000000');
      else s += `<circle cx="${f(x + cw / 2)}" cy="${y + 58}" r="32" fill="${col}"/>` + mitte(x + cw / 2, y + 59, String(i + 1), 32, '#ffffff', fett);
      if (t) { const zl = umbruch(t, Math.floor(cw / 14)).slice(0, 2); zl.forEach((z, j) => { s += mitte(x + cw / 2, y + 140 + (j - (zl.length - 1) / 2) * 32, z, 26, TINTE, fett); }); }
      else s += strich(x + 20, y + 130, x + cw - 20, y + 130, LINIE, 1.5, 'stroke-dasharray="6 6"') + strich(x + 20, y + 172, x + cw - 20, y + 172, LINIE, 1.5, 'stroke-dasharray="6 6"');
    }
    const H = 82 + Math.ceil(n / sp) * (ch + 18) + 12;
    return tafel('✅', 'Fertig? Dann …', W, H, s, P);
  } };
B.al_fertig.schnell = [{ l: '＋ Kachel', f: dd => ({ d: { ...dd, anzahl: Math.min(8, ganz(dd.anzahl, 4, 8, 6) + 1) } }) }, { l: '− Kachel', f: dd => ({ d: { ...dd, anzahl: Math.max(4, ganz(dd.anzahl, 4, 8, 6) - 1) } }) },
  { l: '🔁 Leer ↔ Beispiele', f: dd => ({ d: { ...dd, thema: dd.thema === 'beispiel' ? 'leer' : 'beispiel' } }) }];

// ---------- 3 · Gruppenrollen ----------
const ROLLEN = [['⏱️', 'Zeitwächter', 'achtet auf die Zeit', BLAU], ['✍️', 'Schreiber', 'schreibt die Ergebnisse auf', GRUEN], ['🎤', 'Sprecher', 'stellt die Ergebnisse vor', ORANGE],
  ['📦', 'Materialchef', 'holt und bringt das Material', LILA], ['🤫', 'Ruhewächter', 'achtet auf leise Stimmen', TUERKIS]];
B.al_rollen = { name: 'Gruppenrollen', gruppe: 'Klassenleben',
  def: { gruppen: 4, ruhe: false, aufgaben: true, klasse: '', namen: [] },
  felder: [{ k: 'gruppen', l: 'Anzahl Gruppen (1–10)', typ: 'zahl', min: 1, max: 10 }, { k: 'ruhe', l: '🤫 Ruhewächter dazu', typ: 'check' }, { k: 'aufgaben', l: 'Kurze Aufgabe unter jeder Rolle', typ: 'check' }, KLASSE_FELD],
  gen: (d, P) => {
    const W = 1000, R = d.ruhe ? 5 : 4, rollen = ROLLEN.slice(0, R), g = ganz(d.gruppen, 1, 10, 4), namen = Array.isArray(d.namen) ? d.namen : [];
    const kw = (940 - (R - 1) * 14) / R, kh = d.aufgaben ? 166 : 112; let s = '';
    rollen.forEach(([em, n, a, col], i) => { const x = 30 + i * (kw + 14);
      s += box(x, 80, kw, kh, col, 'none', 14) + flaeche(x, 80, kw, kh, col, 0.1) + mitte(x + kw / 2, 118, em, 40, '#000000') + mitte(x + kw / 2, 166, n, 22, col, fett);
      if (d.aufgaben) umbruch(a, Math.floor(kw / 10.5)).slice(0, 2).forEach((z, j) => { s += mitte(x + kw / 2, 198 + j * 24, z, 18, P.ink); }); });
    const extra = namen.some(gr => Array.isArray(gr) && gr.length > R), gw = 150, ew = extra ? 190 : 0, rw = (940 - gw - ew) / R, y0 = 80 + kh + 24, zh = 56, hk = 50;
    s += flaeche(30, y0, 940, hk, RAND, 0.12, 0) + text(46, y0 + hk / 2, 'Gruppe', 20, P.ink, fett);
    rollen.forEach(([em, n, , col], i) => { const x = 30 + gw + i * rw; s += mitte(x + rw / 2, y0 + hk / 2, em + ' ' + (rw > 150 ? n : ''), 20, col, fett); });
    if (extra) s += mitte(30 + gw + R * rw + ew / 2, y0 + hk / 2, '👥 weitere', 20, P.ink, fett);
    for (let gi = 0; gi < g; gi++) { const y = y0 + hk + gi * zh, gr = Array.isArray(namen[gi]) ? namen[gi] : [], col = FARBEN[gi % FARBEN.length];
      s += `<circle cx="58" cy="${y + zh / 2}" r="18" fill="${col}"/>` + mitte(58, y + zh / 2 + 1, String(gi + 1), 20, '#ffffff', fett);
      for (let ri = 0; ri < R; ri++) if (gr[ri]) s += mitte(30 + gw + ri * rw + rw / 2, y + zh / 2, kurz(gr[ri], Math.floor(rw / 11.5)), 21, P.ink, fett);
      if (extra && gr.length > R) s += mitte(30 + gw + R * rw + ew / 2, y + zh / 2, kurz(gr.slice(R).join(', '), Math.floor(ew / 10.5)), 18, P.ink);
      s += strich(30, y, 970, y, LINIE, 1.2); }
    const yE = y0 + hk + g * zh;
    s += box(30, y0, 940, yE - y0, RAND, 'none', 0, 2);
    for (let i = 0; i <= R; i++) s += strich(30 + gw + i * rw, y0, 30 + gw + i * rw, yE, LINIE, 1.2);
    let H = yE + 24;
    if (!namen.some(gr => Array.isArray(gr) && gr.length)) { s += text(30, yE + 30, 'Namen mit dem Stift eintragen – oder 🎲 aus der Klassenliste dieses Geräts verteilen.', 18, GRAU); H = yE + 60; }
    return tafel('👥', 'Gruppenrollen', W, H, s, P);
  } };
B.al_rollen.schnell = [{ l: '🎲 Aus Klassenliste verteilen', aus: o => ausListe(o, (dd, L) => { const g = ganz(dd.gruppen, 1, 10, 4), nm = Array.from({ length: g }, () => []); mischen(L).forEach((n, i) => nm[i % g].push(n)); return { ...dd, namen: nm }; }) },
  { l: '🧹 Namen leeren', f: dd => ({ d: { ...dd, namen: [] } }) },
  { l: '＋ Gruppe', f: dd => ({ d: { ...dd, gruppen: Math.min(10, ganz(dd.gruppen, 1, 10, 4) + 1) } }) }, { l: '− Gruppe', f: dd => ({ d: { ...dd, gruppen: Math.max(1, ganz(dd.gruppen, 1, 10, 4) - 1) } }) },
  { l: '🤫 Ruhewächter ein/aus', f: dd => ({ d: { ...dd, ruhe: !dd.ruhe } }) }];

// ---------- 4 · Klassendienste / Ämter ----------
const DIENST_SYMBOL = [[/tafel/i, '🧽'], [/fenster|lüft/i, '🪟'], [/pflanz|blume|gieß/i, '🪴'], [/ordnung|aufräum|fegen|besen/i, '🧹'], [/austeil|blätter|zettel/i, '📄'],
  [/licht|smartboard|beamer|strom/i, '💡'], [/müll|abfall/i, '🗑️'], [/kalender|datum/i, '📅'], [/klassenbuch|buch/i, '📘'], [/tür|stuhl|stühle/i, '🪑'], [/milch|essen|obst/i, '🍎'], [/post|bote|sekretariat/i, '✉️']];
const dienstSymbol = t => { for (const [re, em] of DIENST_SYMBOL) if (re.test(t)) return em; return '⭐'; };
const plus7 = t => { const m = String(t || '').trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})?$/); if (!m) return t;
  const j = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : new Date().getFullYear(), dt = new Date(j, +m[2] - 1, +m[1] + 7), z = v => String(v).padStart(2, '0');
  return z(dt.getDate()) + '.' + z(dt.getMonth() + 1) + '.' + (m[3] ? dt.getFullYear() : ''); };
B.al_dienste = { name: 'Klassendienste', gruppe: 'Klassenleben',
  def: { dienste: 'Tafel\nFenster / Lüften\nPflanzen\nOrdnung\nAusteilen\nLicht / Smartboard', woche: '', klasse: '', reihe: [], start: 0 },
  felder: [{ k: 'dienste', l: 'Dienste (je Zeile einer)', typ: 'liste' }, { k: 'woche', l: 'Woche vom (z. B. 16.11.2026; leer = Linie)', typ: 'text' }, KLASSE_FELD],
  gen: (d, P) => {
    const W = 1000, di = zeilen(d.dienste).slice(0, 12), reihe = Array.isArray(d.reihe) ? d.reihe.filter(Boolean) : [], st = ganz(d.start, 0, 9999, 0), zh = 74; let s = '';
    s += text(30, 100, 'Woche vom', 24, P.ink, fett) + (String(d.woche || '').trim() ? text(170, 100, String(d.woche).trim(), 26, P.ink, fett) : linien(170, 420, 114, 1));
    const y0 = 136;
    s += flaeche(30, y0, 940, 46, RAND, 0.12, 0) + text(110, y0 + 23, 'Dienst', 20, P.ink, fett) + text(580, y0 + 23, 'Wer?', 20, P.ink, fett);
    di.forEach((t, i) => { const y = y0 + 46 + i * zh, col = FARBEN[i % FARBEN.length];
      s += `<circle cx="70" cy="${y + zh / 2}" r="27" fill="${col}" opacity=".16"/>` + mitte(70, y + zh / 2, dienstSymbol(t), 32, '#000000') + text(110, y + zh / 2, kurz(t, 26), 26, P.ink, fett);
      if (reihe.length) s += text(580, y + zh / 2, kurz(reihe[(st + i) % reihe.length], 22), 28, P.ink, fett); else s += linien(580, 950, y + zh - 18, 1);
      if (i) s += strich(30, y, 970, y, LINIE, 1.2); });
    const yE = y0 + 46 + di.length * zh;
    s += box(30, y0, 940, yE - y0, RAND, 'none', 0, 2) + strich(560, y0, 560, yE, LINIE, 1.2);
    let H = yE + 24;
    if (!reihe.length) { s += text(30, yE + 30, 'Namen mit dem Stift eintragen – oder 🎲 aus der Klassenliste dieses Geräts verteilen.', 18, GRAU); H = yE + 60; }
    return tafel('🧹', 'Klassendienste', W, H, s, P);
  } };
const weiterRotieren = dd => { const n = zeilen(dd.dienste).length || 1, r = dd.reihe.length; return { ...dd, woche: plus7(dd.woche), start: (ganz(dd.start, 0, 9999, 0) + n) % r }; };
B.al_dienste.schnell = [{ l: '➡ Nächste Woche', aus: o => { const d = { ...B.al_dienste.def, ...o.d };
    if (Array.isArray(d.reihe) && d.reihe.length) T.bausteinAendern(o, { f: dd => ({ d: weiterRotieren(dd) }) });
    else ausListe(o, (dd, L) => ({ ...dd, woche: plus7(dd.woche), reihe: L, start: 0 })); } },
  { l: '🎲 Neu verteilen', aus: o => ausListe(o, (dd, L) => ({ ...dd, reihe: mischen(L), start: 0 })) },
  { l: '🧹 Namen leeren', f: dd => ({ d: { ...dd, reihe: [], start: 0 } }) }];

// ---------- 5 · Klassenrat ----------
const KR_ROLLEN = [['🎙️', 'Leitung', BLAU], ['📝', 'Protokoll', GRUEN], ['⏱️', 'Zeitwächter', ORANGE], ['⚖️', 'Regelwächter', LILA]];
const KR_ABLAUF = ['👋 Begrüßung', '📖 Protokoll der letzten Sitzung', '💬 Anliegen besprechen', '🌟 Lob', '✅ Beschlüsse', '🔚 Abschluss'];
B.al_klassenrat = { name: 'Klassenrat', gruppe: 'Klassenleben',
  def: { datum: '', anliegen: 6, beschluesse: 3, fertig: [] },
  felder: [{ k: 'datum', l: 'Datum (leer = Linie)', typ: 'text' }, { k: 'anliegen', l: 'Kärtchen für Anliegen (2–8)', typ: 'zahl', min: 2, max: 8 }, { k: 'beschluesse', l: 'Zeilen für Beschlüsse (1–6)', typ: 'zahl', min: 1, max: 6 }],
  gen: (d, P) => {
    const W = 1000, teile = [], fe = new Set(d.fertig || []), na = ganz(d.anliegen, 2, 8, 6), nb = ganz(d.beschluesse, 1, 6, 3); let s = '';
    s += rechts(780, 44, 'Datum', 22, GRAU) + (String(d.datum || '').trim() ? text(796, 44, kurz(String(d.datum).trim(), 12), 24, P.ink, fett) : linien(796, 968, 58, 1));
    const rw = (940 - 3 * 16) / 4;
    KR_ROLLEN.forEach(([em, n, col], i) => { const x = 30 + i * (rw + 16);
      s += box(x, 82, rw, 100, col, 'none', 12) + flaeche(x, 82, rw, 44, col, 0.13, 12) + text(x + 14, 104, em, 26, '#000000') + text(x + 54, 104, n, 22, col, fett) + linien(x + 16, x + rw - 16, 162, 1); });
    const yA = 206, sh = 56;
    s += text(30, yA + 16, '🧭 Ablauf', 24, P.ink, fett);
    const naechst = KR_ABLAUF.findIndex((_, i) => !fe.has(i));
    KR_ABLAUF.forEach((t, i) => { const y = yA + 40 + i * sh, an = fe.has(i);
      if (i === naechst) s += flaeche(30, y + 2, 420, sh - 4, BLAU, 0.1, 10);
      s += haken(42, y + sh / 2 - 17, an, 34, P) + text(92, y + sh / 2, (i + 1) + '. ' + t, 22, an ? GRAU : P.ink, (i === naechst ? fett + ' ' : '') + (an ? 'text-decoration="line-through"' : ''));
      teile.push({ id: 'ab' + i, x: 30, y, w: 420, h: sh }); });
    const xK = 476, kw = (494 - 14) / 2, rows = Math.ceil(na / 2), hRechts = KR_ABLAUF.length * sh, kh = Math.max(64, (hRechts - (rows - 1) * 12) / rows);
    s += text(xK, yA + 16, '💬 Anliegen', 24, P.ink, fett);
    for (let i = 0; i < na; i++) { const x = xK + (i % 2) * (kw + 14), y = yA + 40 + Math.floor(i / 2) * (kh + 12);
      s += box(x, y, kw, kh, ORANGE, 'rgba(239,108,0,.07)', 10, 2, 'stroke-dasharray="8 6"'); }
    const yB = yA + 40 + Math.max(hRechts, rows * (kh + 12) - 12) + 30, zh = 56, c1 = 600, c2 = 800;
    s += text(30, yB + 16, '✅ Beschlüsse', 24, P.ink, fett);
    const yT = yB + 40;
    s += flaeche(30, yT, 940, 46, RAND, 0.12, 0) + text(46, yT + 23, 'Beschluss', 20, P.ink, fett) + text(c1 + 16, yT + 23, 'Wer?', 20, P.ink, fett) + text(c2 + 16, yT + 23, 'Bis wann?', 20, P.ink, fett);
    for (let i = 1; i < nb; i++) s += strich(30, yT + 46 + i * zh, 970, yT + 46 + i * zh, LINIE, 1.2);
    const yE = yT + 46 + nb * zh;
    s += box(30, yT, 940, yE - yT, RAND, 'none', 0, 2) + strich(c1, yT, c1, yE, LINIE, 1.2) + strich(c2, yT, c2, yE, LINIE, 1.2) + strich(30, yT + 46, 970, yT + 46, LINIE, 1.2);
    return tafel('🗣', 'Klassenrat', W, yE + 24, s, P, teile);
  } };
B.al_klassenrat.tippen = (o, id) => { const i = +id.slice(2); T.bausteinAendern(o, { f: dd => ({ d: { ...dd, fertig: umschalten(dd.fertig, i) } }) }); };
B.al_klassenrat.schnell = [{ l: '↺ Alle Haken weg', f: dd => ({ d: { ...dd, fertig: [] } }) },
  { l: '＋ Anliegen', f: dd => ({ d: { ...dd, anliegen: Math.min(8, ganz(dd.anliegen, 2, 8, 6) + 2) } }) }, { l: '− Anliegen', f: dd => ({ d: { ...dd, anliegen: Math.max(2, ganz(dd.anliegen, 2, 8, 6) - 2) } }) },
  { l: '＋ Beschluss', f: dd => ({ d: { ...dd, beschluesse: Math.min(6, ganz(dd.beschluesse, 1, 6, 3) + 1) } }) }, { l: '− Beschluss', f: dd => ({ d: { ...dd, beschluesse: Math.max(1, ganz(dd.beschluesse, 1, 6, 3) - 1) } }) }];

// ---------- 6 · Lernstationen mit Laufzettel ----------
B.al_stationen = { name: 'Lernstationen', gruppe: 'Klassenleben',
  def: { thema: 'tafel', anzahl: 6, namen: '', wahl: [], fertig: [] },
  felder: [{ k: 'thema', l: 'Ansicht', typ: 'auswahl', opts: [['tafel', 'Tafel (groß)'], ['laufzettel', 'Laufzettel (schmal, fürs Heft)']] }, { k: 'anzahl', l: 'Anzahl Stationen (3–12)', typ: 'zahl', min: 3, max: 12 },
    { k: 'namen', l: 'Namen der Stationen (je Zeile einer; leer = zum Schreiben)', typ: 'liste' }],
  gen: (d, P) => {
    const n = ganz(d.anzahl, 3, 12, 6), nm = zeilen(d.namen), wahl = new Set(d.wahl || []), fe = new Set(d.fertig || []), teile = [], schmal = d.thema === 'laufzettel';
    const W = schmal ? 560 : 1000, rh = schmal ? 56 : (n > 8 ? 62 : 72), y0 = schmal ? 140 : 120; let s = '';
    const xN = schmal ? 52 : 64, xT = schmal ? 88 : 108, xC = schmal ? 364 : 704, cw = schmal ? 94 : 150, xH = schmal ? 484 : 890, hk = schmal ? 38 : 44;
    if (schmal) s += text(30, 96, 'Name', 22, P.ink, fett) + linien(100, 530, 110, 1);
    s += text(xT, y0 - 18, 'Station', 19, GRAU) + mitte(xC + cw / 2, y0 - 18, schmal ? '⭐ / ○' : 'Pflicht / Wahl', 19, GRAU) + mitte(xH + hk / 2, y0 - 18, '✓', 20, GRAU, fett);
    for (let i = 0; i < n; i++) {
      const y = y0 + i * rh, col = FARBEN[i % FARBEN.length], w = wahl.has(i), an = fe.has(i), yc = y + rh / 2;
      s += strich(30, y, W - 30, y, LINIE, 1.2);
      s += `<circle cx="${xN}" cy="${f(yc)}" r="${schmal ? 19 : 24}" fill="${col}"/>` + mitte(xN, yc + 1, String(i + 1), schmal ? 20 : 24, '#ffffff', fett);
      if (nm[i]) s += text(xT, yc, kurz(nm[i], schmal ? 21 : 38), schmal ? 21 : 26, P.ink, fett); else s += linien(xT, xC - 20, y + rh - 14, 1);
      const ch = rh - 16;
      s += w ? box(xC, y + 8, cw, ch, GRAU, 'none', ch / 2, 2, 'stroke-dasharray="6 5"') + mitte(xC + cw / 2, yc, schmal ? '○' : '○ Wahl', schmal ? 26 : 22, P.ink, fett)
        : box(xC, y + 8, cw, ch, ORANGE, '#fff3e0', ch / 2, 2.5) + mitte(xC + cw / 2, yc, schmal ? '⭐' : '⭐ Pflicht', schmal ? 24 : 22, TINTE, fett);
      teile.push({ id: 'pw' + i, x: xC, y: y + 4, w: cw, h: rh - 8 });
      s += haken(xH, yc - hk / 2, an, hk, P);
      teile.push({ id: 'ok' + i, x: xH - 10, y: y + 2, w: hk + 20, h: rh - 4 });
    }
    const yE = y0 + n * rh;
    s += strich(30, yE, W - 30, yE, LINIE, 1.2) + text(30, yE + 30, schmal ? '⭐ Pflicht · ○ Wahl' : '⭐ Pflicht · ○ Wahl – antippen zum Umschalten · Kästchen antippen = erledigt', 18, GRAU);
    return tafel(schmal ? '🗺' : '🧭', schmal ? 'Laufzettel' : 'Lernstationen', W, yE + 60, s, P, teile);
  } };
B.al_stationen.tippen = (o, id) => { const i = +id.slice(2), k = id.slice(0, 2) === 'pw' ? 'wahl' : 'fertig';
  T.bausteinAendern(o, { f: dd => ({ d: { ...dd, [k]: umschalten(dd[k], i) } }) }); };
B.al_stationen.schnell = [{ l: '↺ Alle Haken weg', f: dd => ({ d: { ...dd, fertig: [] } }) },
  { l: '＋ Station', f: dd => ({ d: { ...dd, anzahl: Math.min(12, ganz(dd.anzahl, 3, 12, 6) + 1) } }) }, { l: '− Station', f: dd => ({ d: { ...dd, anzahl: Math.max(3, ganz(dd.anzahl, 3, 12, 6) - 1) } }) },
  { l: '🔁 Tafel ↔ Laufzettel', f: dd => ({ d: { ...dd, thema: dd.thema === 'laufzettel' ? 'tafel' : 'laufzettel' } }) }];

// ---------- 7 · Redemittel / Satzanfänge ----------
const REDE = {
  de: [['💬', 'Meinung sagen', ['Ich bin der Meinung, dass …', 'Ich finde, …', 'Meiner Ansicht nach …', 'Ich denke, …']],
    ['👍', 'Zustimmen', ['Ich stimme dir zu, weil …', 'Das sehe ich genauso, denn …', 'Da hast du recht, …']],
    ['✋', 'Widersprechen', ['Ich sehe das anders, denn …', 'Da bin ich anderer Meinung, weil …', 'Das stimmt nicht ganz, …']],
    ['❓', 'Nachfragen', ['Kannst du erklären, was du mit … meinst?', 'Wie meinst du das?', 'Habe ich richtig verstanden, dass …?']],
    ['💡', 'Begründen', ['…, weil …', 'Ein Grund dafür ist …', 'Zum Beispiel …', 'Deshalb …']],
    ['🌟', 'Feedback geben', ['Mir gefällt …', 'Gut finde ich, dass …', 'Mein Tipp: …', 'Du könntest noch …']]],
  en: [['💬', 'Giving your opinion', ['I think …', 'In my opinion, …', 'I believe …']],
    ['👍', 'Agreeing', ['I agree because …', 'That’s right.', 'I think so, too.']],
    ['✋', 'Disagreeing', ['I don’t agree because …', 'I see it differently.', 'I’m not sure about that.']],
    ['❓', 'Asking', ['Could you explain …?', 'What do you mean by …?', 'Can you say that again, please?']],
    ['💡', 'Giving reasons', ['…, because …', 'For example, …', 'That’s why …']],
    ['🌟', 'Giving feedback', ['I like …', 'Well done! …', 'My tip: …', 'You could also …']]] };
B.al_redemittel = { name: 'Redemittel / Satzanfänge', gruppe: 'Klassenleben',
  def: { thema: 'de' },
  felder: [{ k: 'thema', l: 'Tafel', typ: 'auswahl', opts: [['de', 'Deutsch (mit Satzanfängen)'], ['en', 'Englisch (useful phrases)'], ['leer', 'Leer (nur Kategorien zum Sammeln)']] }],
  gen: (d, P) => {
    const leer = d.thema === 'leer', liste = d.thema === 'en' ? REDE.en : REDE.de, W = 1000, kw = 460, zh = 36; let s = '', y = 80;
    for (let r = 0; r < 3; r++) {
      const paar = liste.slice(r * 2, r * 2 + 2), zl = paar.map(([, , sa]) => leer ? [] : sa.flatMap(z => umbruch(z.replace(/ …/g, ' …'), 37).map((t, j) => [t, j === 0])));
      const hh = leer ? 54 + 4 * 46 : 58 + Math.max(...zl.map(z => z.length)) * zh + 8;
      paar.forEach(([em, kat], i) => { const x = 30 + i * (kw + 20), col = FARBEN[(r * 2 + i) % FARBEN.length];
        s += box(x, y, kw, hh, col, 'none', 14) + flaeche(x, y, kw, 46, col, 0.14, 14) + text(x + 14, y + 23, em, 24, '#000000') + text(x + 52, y + 23, kat, 23, col, fett);
        if (leer) s += linien(x + 18, x + kw - 18, y + 92, 4, 46);
        else zl[i].forEach(([t, neu], j) => { const yy = y + 76 + j * zh; if (neu) s += `<circle cx="${x + 24}" cy="${yy}" r="5" fill="${col}"/>`; s += text(x + 40, yy, t, 22, P.ink); }); });
      y += hh + 16;
    }
    return tafel('💬', d.thema === 'en' ? 'Useful phrases' : leer ? 'Redemittel – wir sammeln' : 'Redemittel – so kann ich es sagen', W, y, s, P);
  } };
B.al_redemittel.schnell = [{ l: '🇩🇪 Deutsch', f: dd => ({ d: { ...dd, thema: 'de' } }) }, { l: '🇬🇧 Englisch', f: dd => ({ d: { ...dd, thema: 'en' } }) }, { l: '⬜ Leer', f: dd => ({ d: { ...dd, thema: 'leer' } }) }];

// ---------- 8 · Wortspeicher / Fachbegriffe ----------
B.al_wortspeicher = { name: 'Wortspeicher', gruppe: 'Klassenleben',
  def: { thema: '', art: 'wortarten', zeilen: 8 },
  felder: [{ k: 'thema', l: 'Thema (leer = Linie zum Schreiben)', typ: 'text' }, { k: 'art', l: 'Spalten', typ: 'auswahl', opts: [['wortarten', 'Nomen · Verben · Adjektive'], ['begriffe', 'Begriff – Erklärung']] },
    { k: 'zeilen', l: 'Zeilen (4–16)', typ: 'zahl', min: 4, max: 16 }],
  gen: (d, P) => {
    const W = 1000, n = ganz(d.zeilen, 4, 16, 8), rh = 50, begr = d.art === 'begriffe', th = String(d.thema || '').trim(); let s = '';
    const xT = begr ? 290 : 310;
    s += th ? text(xT, 44, kurz(th, 36), 30, P.ink, fett) : linien(xT, 970, 58, 1);
    const sp = begr ? [['Begriff', '', BLAU, 30, 300], ['Erklärung', '', GRUEN, 330, 640]]
      : [['Nomen', 'der, die, das …', BLAU, 30, 940 / 3], ['Verben', 'ich …, du …', ROT, 30 + 940 / 3, 940 / 3], ['Adjektive', 'groß, leise …', GRUEN, 30 + 1880 / 3, 940 / 3]];
    const y0 = 80, hk = 64, yE = y0 + hk + n * rh + 10;
    sp.forEach(([t, sub, col, x, w]) => {
      s += box(x, y0, w, yE - y0, col, 'none', 12) + flaeche(x, y0, w, hk, col, 0.14, 12) + text(x + 16, y0 + hk / 2, t, 24, col, fett);
      if (sub) s += rechts(x + w - 14, y0 + hk / 2, sub, 18, GRAU);
      s += linien(x + 14, x + w - 14, y0 + hk + rh - 6, n, rh);
    });
    return tafel('📚', begr ? 'Fachbegriffe' : 'Wortspeicher', W, yE + 20, s, P);
  } };
B.al_wortspeicher.schnell = [{ l: '＋ Zeile', f: dd => ({ d: { ...dd, zeilen: Math.min(16, ganz(dd.zeilen, 4, 16, 8) + 1) } }) }, { l: '− Zeile', f: dd => ({ d: { ...dd, zeilen: Math.max(4, ganz(dd.zeilen, 4, 16, 8) - 1) } }) },
  { l: '🔁 Wortarten ↔ Begriffe', f: dd => ({ d: { ...dd, art: dd.art === 'begriffe' ? 'wortarten' : 'begriffe' } }) }];

// ---------- 9 · Visueller Tagesplan ----------
const TP_MAX = 8;
const TP_SYMBOLE = [['lesen', '📖', 'Lesen'], ['schreiben', '✏️', 'Schreiben'], ['rechnen', '➗', 'Rechnen'], ['pause', '🍎', 'Pause'], ['sport', '⚽', 'Sport'], ['kunst', '🎨', 'Kunst'],
  ['musik', '🎵', 'Musik'], ['forschen', '🔬', 'Forschen'], ['gruppe', '🧩', 'Gruppenarbeit'], ['gespraech', '💬', 'Gesprächskreis'], ['computer', '💻', 'Computer'],
  ['essen', '🍽️', 'Mittagessen'], ['test', '📝', 'Test'], ['ausflug', '🚶', 'Ausflug'], ['ha', '🏠', 'Hausaufgaben'], ['nachhause', '🚌', 'Nachhause']];
const tpSym = k => TP_SYMBOLE.find(x => x[0] === k);
const TP_DEF = { anzahl: 6, fertig: [] };
const TP_FELDER = [{ k: 'anzahl', l: 'Anzahl Zeilen (3–' + TP_MAX + ')', typ: 'zahl', min: 3, max: TP_MAX }];
for (let i = 1; i <= TP_MAX; i++) {
  TP_DEF['z' + i] = ''; TP_DEF['s' + i] = ''; TP_DEF['x' + i] = '';
  TP_FELDER.push({ k: 'z' + i, l: i + ' · Uhrzeit', typ: 'text' }, { k: 's' + i, l: i + ' · Symbol', typ: 'auswahl', opts: [['', '○ frei (zum Malen)']].concat(TP_SYMBOLE.map(([k, e, t]) => [k, e + ' ' + t])) },
    { k: 'x' + i, l: i + ' · Text (leer = Name des Symbols)', typ: 'text' });
}
B.al_tagesplan = { name: 'Visueller Tagesplan', gruppe: 'Klassenleben', def: TP_DEF, felder: TP_FELDER,
  gen: (d, P) => {
    const W = 1000, n = ganz(d.anzahl, 3, TP_MAX, 6), fe = new Set(d.fertig || []), teile = [], rh = 86, y0 = 82; let s = '';
    let naechst = -1; for (let i = 0; i < n; i++) if (!fe.has(i)) { naechst = i; break; }
    for (let i = 0; i < n; i++) {
      const y = y0 + i * rh, yc = y + rh / 2, an = fe.has(i), jetzt = i === naechst, sy = tpSym(d['s' + (i + 1)]), zeit = String(d['z' + (i + 1)] || '').trim();
      const t = String(d['x' + (i + 1)] || '').trim() || (sy ? sy[2] : ''), col = FARBEN[i % FARBEN.length];
      if (jetzt) s += flaeche(30, y + 3, 940, rh - 6, BLAU, 0.1, 12) + rechts(955, yc, '◀ jetzt', 22, BLAU, fett);
      if (i) s += strich(30, y, 970, y, LINIE, 1);
      s += haken(42, yc - 21, an, 42, P);
      teile.push({ id: 'ok' + i, x: 30, y: y + 4, w: 66, h: rh - 8 });
      s += zeit ? text(108, yc, kurz(zeit, 6), 28, an ? GRAU : P.ink, fett) : linien(108, 220, yc + 18, 1);
      if (sy) s += `<circle cx="290" cy="${yc}" r="36" fill="${PASTELL[i % PASTELL.length][1]}" stroke="${col}" stroke-width="2.5" ${an ? 'opacity=".45"' : ''}/>` + mitte(290, yc + 1, sy[1], 42, '#000000', an ? 'opacity=".45"' : '');
      else s += `<circle cx="290" cy="${yc}" r="36" fill="none" stroke="${LINIE}" stroke-width="2" stroke-dasharray="6 5"/>`;
      teile.push({ id: 'sy' + i, x: 250, y: y + 4, w: 80, h: rh - 8 });
      if (t) s += text(346, yc, kurz(t, jetzt ? 30 : 36), 30, an ? GRAU : P.ink, fett + (an ? ' text-decoration="line-through"' : ''));
      else s += linien(346, jetzt ? 840 : 950, yc + 18, 1);
    }
    const yE = y0 + n * rh;
    s += text(30, yE + 28, 'Kästchen oder Symbol antippen = erledigt', 18, GRAU);
    return tafel('📅', 'Unser Tag', W, yE + 58, s, P, teile);
  } };
B.al_tagesplan.tippen = (o, id) => { const i = +id.slice(2); T.bausteinAendern(o, { f: dd => ({ d: { ...dd, fertig: umschalten(dd.fertig, i) } }) }); };
B.al_tagesplan.schnell = [{ l: '✔ Nächste abhaken', f: dd => { const n = ganz(dd.anzahl, 3, TP_MAX, 6), fe = new Set(dd.fertig || []); for (let i = 0; i < n; i++) if (!fe.has(i)) { fe.add(i); break; } return { d: { ...dd, fertig: [...fe].sort((a, b) => a - b) } }; } },
  { l: '↺ Alle Haken weg', f: dd => ({ d: { ...dd, fertig: [] } }) },
  { l: '＋ Zeile', f: dd => ({ d: { ...dd, anzahl: Math.min(TP_MAX, ganz(dd.anzahl, 3, TP_MAX, 6) + 1) } }) }, { l: '− Zeile', f: dd => ({ d: { ...dd, anzahl: Math.max(3, ganz(dd.anzahl, 3, TP_MAX, 6) - 1) } }) }];

// ---------- 10 · Geburtstagskalender ----------
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONAT_FARBE = m => m === 11 || m <= 1 ? BLAU : m <= 4 ? GRUEN : m <= 7 ? ORANGE : BRAUN;
B.al_geburtstage = { name: 'Geburtstagskalender', gruppe: 'Klassenleben',
  def: { liste: '', zeilen: 3, heute: true },
  felder: [{ k: 'liste', l: 'Geburtstage (Name; TT.MM.) – bleiben nur auf diesem Gerät', typ: 'tabelle', kopf: ['Name', 'Datum (TT.MM.)'], fest: 2 },
    { k: 'zeilen', l: 'Freie Zeilen je Monat (mindestens, 1–8)', typ: 'zahl', min: 1, max: 8 }, { k: 'heute', l: 'Aktuellen Monat hervorheben', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, mon = Array.from({ length: 12 }, () => []), jetzt = new Date(), mJetzt = jetzt.getMonth(); let falsch = 0, s = '';
    for (const z of zeilen(d.liste)) { const p = z.split(';'), name = (p[0] || '').trim(), m = (p.slice(1).join(';') || '').match(/(\d{1,2})\s*\.\s*(\d{1,2})/);
      const tg = m ? +m[1] : 0, mo = m ? +m[2] : 0;
      if (!name || mo < 1 || mo > 12 || tg < 1 || tg > [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1]) { falsch++; continue; }
      mon[mo - 1].push([tg, name]); }
    mon.forEach(l => l.sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1])));
    const nz = Math.max(ganz(d.zeilen, 1, 8, 3), ...mon.map(l => l.length)), zh = 36, cw = (940 - 3 * 14) / 4, ch = 52 + nz * zh + 8;
    mon.forEach((l, m) => { const x = 30 + (m % 4) * (cw + 14), y = 80 + Math.floor(m / 4) * (ch + 14), col = MONAT_FARBE(m), hier = d.heute && m === mJetzt;
      s += box(x, y, cw, ch, col, hier ? 'rgba(21,101,192,.07)' : 'none', 12, hier ? 5 : 2.5) + flaeche(x, y, cw, 44, col, hier ? 0.24 : 0.14, 12) + text(x + 14, y + 22, MONATE[m], 22, col, fett);
      if (hier) s += rechts(x + cw - 12, y + 22, '⭐', 22, '#000000');
      for (let j = 0; j < nz; j++) { const yy = y + 52 + j * zh + zh / 2;
        if (l[j]) { const heute = hier && l[j][0] === jetzt.getDate();
          s += text(x + 14, yy, l[j][0] + '.', 20, P.ink, fett) + text(x + 54, yy, kurz(l[j][1], heute ? 12 : 14), 20, P.ink, heute ? fett : '');
          if (heute) s += rechts(x + cw - 10, yy, '🎂', 22, '#000000'); }
        else s += strich(x + 14, yy + 12, x + cw - 14, yy + 12, LINIE, 1.5, 'stroke-dasharray="6 6"'); }
    });
    const yE = 80 + 3 * (ch + 14);
    s += text(30, yE + 16, '🔒 Die Daten bleiben nur auf diesem Gerät – nichts wird gesendet.' + (falsch ? ' · ' + falsch + ' Zeile(n) nicht lesbar (Name; TT.MM.)' : ''), 18, GRAU);
    return tafel('🎂', 'Unsere Geburtstage', W, yE + 46, s, P);
  } };
B.al_geburtstage.schnell = [{ l: '＋ Zeile je Monat', f: dd => ({ d: { ...dd, zeilen: Math.min(8, ganz(dd.zeilen, 1, 8, 3) + 1) } }) }, { l: '− Zeile je Monat', f: dd => ({ d: { ...dd, zeilen: Math.max(1, ganz(dd.zeilen, 1, 8, 3) - 1) } }) },
  { l: '⭐ Monat hervorheben ein/aus', f: dd => ({ d: { ...dd, heute: !dd.heute } }) }];

// Kacheln (gleicher Baustein, voreingestellte Tafel)
const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};
KV['al_fertig:leer'] = { name: 'Fertig? Dann … (leer)', d: { thema: 'leer' } }; KV['al_fertig:beispiel'] = { name: 'Fertig? Dann … (Beispiele)', d: { thema: 'beispiel' } };
KV['al_stationen:tafel'] = { name: 'Lernstationen (Tafel)', d: { thema: 'tafel' } }; KV['al_stationen:laufzettel'] = { name: 'Laufzettel Stationen', d: { thema: 'laufzettel' } };
KV['al_redemittel:de'] = { name: 'Redemittel (Deutsch)', d: { thema: 'de' } }; KV['al_redemittel:en'] = { name: 'Useful phrases (Englisch)', d: { thema: 'en' } }; KV['al_redemittel:leer'] = { name: 'Redemittel (leer)', d: { thema: 'leer' } };
KV['al_wortspeicher:wortarten'] = { name: 'Wortspeicher (Wortarten)', d: { art: 'wortarten' } }; KV['al_wortspeicher:begriffe'] = { name: 'Fachbegriffe-Wand', d: { art: 'begriffe' } };
KV['al_tagesplan:leer'] = { name: 'Tagesplan (leer)', d: { anzahl: 6 } };
KV['al_tagesplan:beispiel'] = { name: 'Tagesplan (Beispieltag)', d: { anzahl: 8, z1: '8:00', s1: 'lesen', z2: '8:45', s2: 'rechnen', z3: '9:30', s3: 'pause', z4: '9:50', s4: 'gruppe',
  z5: '10:35', s5: 'sport', z6: '11:20', s6: 'pause', z7: '11:40', s7: 'schreiben', z8: '12:25', s8: 'nachhause' } };
})();
