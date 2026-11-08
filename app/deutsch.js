// Tafel-App – Deutsch: Wortarten einfärben, Silbenbögen, Satzglieder markieren.
// Text eingeben (✏️ Bearbeiten), an der Tafel mit dem Finger (oder der Maus) antippen:
// Wortarten / Satzglieder: oben in der Legende eine Farbe wählen, dann Wörter antippen (nochmals = weg).
// Silben: Bögen werden automatisch gesetzt (Faustregel) – eigene Trennung mit | im Wort, z. B. Schmet|ter|ling.
'use strict';
(function () {
const { doc, tx, rc, f, esc } = T._svg, B = T.BAUSTEINE;
const mess = (t, fs, fett) => { const c = T._mctx || (T._mctx = document.createElement('canvas').getContext('2d')); c.font = `${fett ? 700 : 400} ${fs}px Segoe UI`; return c.measureText(String(t)).width; };

const WORTARTEN = [['N', 'Nomen', '#60a5fa'], ['V', 'Verb', '#f87171'], ['A', 'Adjektiv', '#4ade80'], ['Ar', 'Artikel', '#facc15'], ['P', 'Pronomen', '#c084fc'], ['Pr', 'Präposition', '#fb923c'], ['K', 'Konjunktion', '#94a3b8']];
const SATZGLIEDER = [['S', 'Subjekt', '#eab308'], ['P', 'Prädikat', '#ef4444'], ['AO', 'Akkusativobjekt', '#3b82f6'], ['DO', 'Dativobjekt', '#22c55e'], ['Adv', 'Adverbiale', '#f97316']];
const LISTE = { wortarten: WORTARTEN, satzglieder: SATZGLIEDER };

// ---------- Silbentrennung (Faustregel für die Grundschul-/Sek-I-Silbe) ----------
const VOK = 'aeiouäöüyAEIOUÄÖÜY', DIPH = ['ei', 'ai', 'au', 'äu', 'eu', 'ie', 'Ei', 'Ai', 'Au', 'Eu', 'Äu'];
const ZUSAMMEN = ['sch', 'ch', 'ck', 'ph', 'th', 'qu', 'pf'];
function silben(wort) {
  if (wort.includes('|')) return wort.split('|').filter(Boolean);
  const w = wort, kerne = []; // [start, ende] der Vokalgruppen
  for (let i = 0; i < w.length; i++) {
    if (!VOK.includes(w[i])) continue;
    let e = i + 1; if (e < w.length && DIPH.includes(w.slice(i, e + 1))) e++;
    kerne.push([i, e]); i = e - 1;
  }
  if (kerne.length < 2) return [w];
  const teile = []; let start = 0;
  for (let k = 0; k < kerne.length - 1; k++) {
    const von = kerne[k][1], bis = kerne[k + 1][0], kons = w.slice(von, bis); // Konsonanten zwischen zwei Vokalgruppen
    let schnitt;
    if (kons.length === 0) schnitt = von;                                   // Vokal | Vokal (z. B. Ru-in)
    else if (kons.length === 1) schnitt = von;                              // ein Konsonant geht in die nächste Silbe (Ro-se)
    else {
      const z = ZUSAMMEN.find(c => kons.toLowerCase().endsWith(c));         // sch, ch, ck … bleiben zusammen (Ta-sche, Zu-cker)
      schnitt = z && kons.length === z.length ? von : z ? bis - z.length : bis - 1; // sonst: letzter Konsonant nach rechts (Kat-ze)
    }
    teile.push(w.slice(start, schnitt)); start = schnitt;
  }
  teile.push(w.slice(start));
  return teile.filter(Boolean);
}
T.silben = silben; // für Tests

// ---------- Darstellung ----------
function sprachtext(d, P) {
  const modus = d.modus, fs = d.groesse || 40, lh = fs * (modus === 'satzglieder' ? 2.6 : modus === 'silben' ? 2.2 : 1.9), W = d.breite || 1200, pad = 24;
  const L = LISTE[modus], marks = d.marks || {}, teile = []; let s = '', x = pad, y = pad;
  // Legende (zum Auswählen der Farbe)
  if (L) {
    let lx = pad;
    L.forEach(([code, name, farbe], j) => {
      const bw = mess(name, 20, true) + 46, an = d.aktiv === code;
      s += rc(lx, y, bw, 40, an ? '#1b1f2a' : farbe, farbe, an ? 4 : 1.5, 'rx="20"') + tx(lx + bw / 2, y + 20, name, '#1b1f2a', 20, 'middle', 'font-weight="700"');
      teile.push({ id: 'L' + code, x: lx, y, w: bw, h: 40 }); lx += bw + 10;
      if (lx > W - 200 && j < L.length - 1) { lx = pad; y += 50; }
    });
    y += 64;
  }
  // Wörter setzen
  const woerter = []; let wi = 0;
  for (const zeile of String(d.text || '').split(/\r?\n/)) {
    for (const roh of zeile.split(/\s+/).filter(Boolean)) {
      const m = roh.match(/^([„"'(»«]*)(.*?)([.,;:!?“"')»«]*)$/) || ['', '', roh, ''], kern = m[2].replace(/\|/g, ''), ww = mess(m[1] + kern + m[3], fs) + 4;
      if (x + ww > W - pad && x > pad) { x = pad; y += lh; }
      woerter.push({ i: wi, x, y, w: ww, vor: m[1], kern, nach: m[3], roh: m[2] }); x += ww + mess(' ', fs) * 1.2; wi++;
    }
    x = pad; y += lh;
  }
  const H = y + pad - (modus === 'silben' ? 0 : lh * 0.3);
  const farbeVon = c => (L || []).find(e => e[0] === c);
  // Satzglieder: benachbarte Wörter mit gleicher Markierung bilden einen Kasten
  if (modus === 'satzglieder') {
    for (let a = 0; a < woerter.length;) {
      const c = marks[woerter[a].i]; if (!c) { a++; continue; }
      let b = a; while (b + 1 < woerter.length && marks[woerter[b + 1].i] === c && woerter[b + 1].y === woerter[a].y) b++;
      const fa = farbeVon(c) || ['', '', '#999'], x1 = woerter[a].x - 8, x2 = woerter[b].x + woerter[b].w + 8, yy = woerter[a].y + lh * 0.18;
      const lab = mess(fa[1], 18, true) <= x2 - x1 - 8 ? fa[1] : fa[0]; // schmaler Kasten: Abkürzung (S, P, AO …)
      s += rc(x1, yy, x2 - x1, fs * 1.5, fa[2], fa[2] + '33', 3.5, 'rx="10"') + tx(x1 + 6, yy - 12, lab, fa[2], 18, 'start', 'font-weight="700"');
      a = b + 1;
    }
  }
  for (const w of woerter) {
    const mitte = w.y + (modus === 'satzglieder' ? lh * 0.18 + fs * 0.75 : fs * 0.75);
    if (modus === 'wortarten' && marks[w.i]) { const fa = farbeVon(marks[w.i]); if (fa) s += rc(w.x - 4, mitte - fs * 0.72, mess(w.kern, fs) + 8 + mess(w.vor, fs), fs * 1.44, 'none', fa[2], 0, 'rx="8"'); }
    s += `<text x="${f(w.x)}" y="${f(mitte)}" font-size="${fs}" fill="${P.ink}" dominant-baseline="central" style="white-space:pre">${esc(w.vor + w.kern + w.nach)}</text>`;
    if (modus === 'silben' && (d.alleBoegen || marks[w.i])) { // Silbenbögen unter dem Wort
      let sx = w.x + mess(w.vor, fs);
      for (const sil of silben(w.roh)) { const sw = mess(sil.replace(/\|/g, ''), fs), by = mitte + fs * 0.62;
        s += `<path d="M${f(sx + 3)} ${f(by)} Q ${f(sx + sw / 2)} ${f(by + fs * 0.55)} ${f(sx + sw - 3)} ${f(by)}" fill="none" stroke="${d.bogenFarbe || '#e11d48'}" stroke-width="${f(Math.max(2.5, fs / 12))}" stroke-linecap="round"/>`; sx += sw; }
    }
    teile.push({ id: 'w' + w.i, x: w.x - 4, y: w.y, w: w.w + 8, h: lh * 0.95 });
  }
  return { svg: doc(W, H, rc(2, 2, W - 4, H - 4, P.grid, P.ink === '#1a1a1a' ? '#fff' : 'rgba(255,255,255,.04)', 2, 'rx="16"') + s), w: W, h: H, teile };
}
const BEISPIEL = 'Der kleine Hund spielt im Garten mit einem roten Ball.\nAm Abend schläft er zufrieden in seinem Körbchen.';
const FELDER = [{ k: 'text', l: 'Text (Silben: eigene Trennung mit | im Wort, z. B. Schmet|ter|ling)', typ: 'textarea' }, { k: 'groesse', l: 'Schriftgröße', typ: 'zahl', min: 20, max: 90 }];
B.wortarten = { name: 'Wortarten einfärben', gruppe: 'Sprachen', def: { text: BEISPIEL, modus: 'wortarten', groesse: 40, breite: 1200, marks: {}, aktiv: 'N' }, felder: FELDER, gen: sprachtext };
B.silbenboegen = { name: 'Silbenbögen', gruppe: 'Sprachen', def: { text: 'Schmetterling Tomate Zucker Katze Tasche Sonne Fenster', modus: 'silben', groesse: 48, breite: 1200, marks: {}, alleBoegen: false }, felder: FELDER, gen: sprachtext };
B.satzglieder = { name: 'Satzglieder markieren', gruppe: 'Sprachen', def: { text: 'Am Morgen gibt die Lehrerin den Kindern die Hefte zurück.', modus: 'satzglieder', groesse: 40, breite: 1200, marks: {}, aktiv: 'S' }, felder: FELDER, gen: sprachtext };
const leer = d => ({ d: { ...d, marks: {} } });
B.wortarten.schnell = [{ l: '🧹 Farben weg', f: leer }];
B.satzglieder.schnell = [{ l: '🧹 Markierungen weg', f: leer }];
B.silbenboegen.schnell = [{ l: '⌒ Alle Bögen', f: d => ({ d: { ...d, alleBoegen: true } }) }, { l: '🧹 Bögen weg', f: d => ({ d: { ...d, alleBoegen: false, marks: {} } }) }];

// ---------- Antippen an der Tafel ----------
const TYPEN = ['wortarten', 'silbenboegen', 'satzglieder'];
T.istSprachtext = o => !!o && TYPEN.includes(o.k);
T.sprachTipp = (o, wx, wy) => {
  const id = T.teilAtAlle(o, wx, wy); if (!id) return;
  const d = { ...o.d, marks: { ...(o.d.marks || {}) } };
  if (id[0] === 'L') d.aktiv = id.slice(1);
  else { const i = id.slice(1); if (o.k === 'silbenboegen') { if (d.marks[i]) delete d.marks[i]; else d.marks[i] = 1; }
    else if (d.marks[i] === d.aktiv) delete d.marks[i]; else d.marks[i] = d.aktiv; }
  T.snap(); T.replaceItem({ ...o, d }); T.render();
};
})();
