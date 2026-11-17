// Tafel-App – Rechenwege: schematische Erklärungen mit Musterbeispiel (wie im Schulbuch), als Bild auf die Tafel
// Jedes Schema ist ein SVG mit weißem Kartenhintergrund (auch auf dunkler Tafel lesbar). Alle Beispiele sind nachgerechnet.
'use strict';
(function () {
const h = T.h;
const FONT = "'Segoe UI', Roboto, Arial, sans-serif";
const F = { ink: '#1f2937', blau: '#2563eb', rot: '#dc2626', gruen: '#16a34a', orange: '#ea580c', lila: '#7c3aed', grau: '#6b7280', gitter: '#cbd5e1' };
const W = 1000;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tx = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${o.g || 30}" fill="${o.f || F.ink}" font-weight="${o.w || 400}" text-anchor="${o.a || 'start'}" dominant-baseline="central" style="white-space:pre"${o.i ? ' font-style="italic"' : ''}>${esc(s)}</text>`;
// mehrfarbige Zeile: teile = ['normal', ['farbig', 'blau', fett?], …]
const txs = (x, y, teile, o = {}) => `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${o.g || 24}" fill="${F.ink}" text-anchor="${o.a || 'start'}" dominant-baseline="central" style="white-space:pre">${teile.map(p => typeof p === 'string' ? esc(p) : `<tspan fill="${F[p[1]] || F.ink}"${p[2] ? ' font-weight="700"' : ''}>${esc(p[0])}</tspan>`).join('')}</text>`;
const ln = (x1, y1, x2, y2, f = F.ink, b = 3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${f}" stroke-width="${b}" stroke-linecap="round"/>`;
const DEFS = '<defs>' + Object.entries(F).map(([k, c]) => `<marker id="p${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`).join('') + '</defs>';
const pfeil = (d, f = 'ink', b = 3) => `<path d="${d}" fill="none" stroke="${F[f]}" stroke-width="${b}" marker-end="url(#p${f})"/>`;
const kasten = (x, y, w, hh, f = '#eef2ff', r = '#c7d2fe') => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="14" fill="${f}" stroke="${r}" stroke-width="2"/>`;
// Schritt-Gruppen: st(k, …) erscheint ab Schritt k, bis(k, …) nur bis Schritt k (z. B. eine Zwischenzahl, die später ersetzt wird).
// Gelbe Markierung (class hl) ist normal unsichtbar und wird nur im gerade gezeigten Schritt eingeblendet.
const st = (k, s) => `<g class="s${k}">${s}</g>`;
const bis = (k, s) => `<g class="b${k}">${s}</g>`;
const mark = (x, y, w, hh, nurRahmen) => `<rect class="hl" style="display:none" x="${x}" y="${y}" width="${w}" height="${hh}" rx="12" fill="${nurRahmen ? 'none' : '#fef9c3'}" stroke="#facc15" stroke-width="${nurRahmen ? 4 : 2}"/>`;
// nummerierter Schritt (eine oder mehrere Zeilen) – gehört automatisch zu Schritt nr (oder k)
const schritt = (x, y, nr, farbe, zeilen, g = 24, k = +nr) => st(k, mark(x - 8, y - 22, W - x - 22, zeilen.length * 32 + 12) + `<circle cx="${x + 16}" cy="${y}" r="16" fill="${F[farbe]}"/>` + tx(x + 16, y + 1, nr, { g: 19, f: '#fff', w: 700, a: 'middle' }) +
  zeilen.map((z, i) => txs(x + 44, y + i * 32, z, { g })).join(''));
const bruch = (x, y, z, n, f = 'ink', g = 40) => {
  const b = Math.max(String(z).length, String(n).length) * g * 0.32 + 10;
  return tx(x, y - g * 0.62, z, { g, f: F[f], w: 700, a: 'middle' }) + ln(x - b, y, x + b, y, F[f], 3) + tx(x, y + g * 0.66, n, { g, f: F[f], w: 700, a: 'middle' });
};
// Rechenkästchen wie im Heft
const raster = (x0, y0, sp, ze, C) => {
  let s = `<rect x="${x0}" y="${y0}" width="${sp * C}" height="${ze * C}" fill="#f8fafc"/>`;
  for (let i = 0; i <= sp; i++) s += ln(x0 + i * C, y0, x0 + i * C, y0 + ze * C, F.gitter, 1);
  for (let j = 0; j <= ze; j++) s += ln(x0, y0 + j * C, x0 + sp * C, y0 + j * C, F.gitter, 1);
  return s;
};
const zellen = (x0, y0, C) => ({
  z: (sp, ze, s, f = 'ink', o = {}) => tx(x0 + sp * C + C / 2, y0 + ze * C + C / 2 + (o.dy || 0), s, { g: o.g || C * 0.68, f: F[f], w: o.w || 600, a: 'middle', i: o.i }),
  strich: (sp0, sp1, ze, f = F.ink) => ln(x0 + sp0 * C + 4, y0 + ze * C, x0 + (sp1 + 1) * C - 4, y0 + ze * C, f, 5), /* trennt Übertrag und Ergebnis (etwas dicker) */
  doppel: (sp0, sp1, ze, f = F.ink) => ln(x0 + sp0 * C + 4, y0 + ze * C - 3, x0 + (sp1 + 1) * C - 4, y0 + ze * C - 3, f, 2.5) + ln(x0 + sp0 * C + 4, y0 + ze * C + 3, x0 + (sp1 + 1) * C - 4, y0 + ze * C + 3, f, 2.5), /* Doppelstrich unter dem Ergebnis */
  quer: (sp, ze) => ln(x0 + sp * C + 10, y0 + ze * C + C - 10, x0 + sp * C + C - 10, y0 + ze * C + 10, F.rot, 2.5),
  mx: sp => x0 + sp * C + C / 2, oy: ze => y0 + ze * C
});
const karte = (titel, jg, hh, inhalt, css = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${hh}" viewBox="0 0 ${W} ${hh}">${DEFS}${css ? `<style>${css}</style>` : ''}` +
  `<rect x="2" y="2" width="${W - 4}" height="${hh - 4}" rx="26" fill="#ffffff" stroke="#c7d2fe" stroke-width="4"/>` +
  `<path d="M2 28a26 26 0 0 1 26-26h${W - 56}a26 26 0 0 1 26 26v48h-${W - 4}z" fill="#4f46e5"/>` +
  tx(36, 40, titel, { g: 32, f: '#fff', w: 700 }) + tx(W - 36, 40, jg, { g: 22, f: '#e0e7ff', a: 'end' }) + inhalt + '</svg>';

const R = [];
// Aus den Schritt-Gruppen entstehen die Bilder automatisch: Bild 0 = Aufgabe, Bild k = bis Schritt k (Schritt k gelb), letztes Bild = alles
const css = (k, N) => { const aus = []; for (let j = k + 1; j <= N; j++) aus.push('.s' + j); for (let j = 1; j < k; j++) aus.push('.b' + j);
  return (aus.length ? aus.join(',') + '{display:none}' : '') + (k >= 1 && k <= N ? `.s${k} .hl{display:inline !important}` : ''); };
const neu = (gruppe, id, name, jg, hh, inhalt) => {
  const N = Math.max(0, ...[...inhalt.matchAll(/class="s(\d+)"/g)].map(m => +m[1]));
  const frames = N ? Array.from({ length: N + 2 }, (_, k) => karte(name, jg, hh, inhalt, css(k, N))) : null;
  R.push({ gruppe, id, name, svg: frames ? frames[N + 1] : karte(name, jg, hh, inhalt), frames, h: hh });
};
// Schrittfolge: Bild 0 = Aufgabe, letztes Bild = alles fertig; in der Schritt-Ansicht mit ◀ ▶ durchklicken
const neuSchritte = (gruppe, id, name, jg, hh, bilder) => { const frames = bilder.map(b => karte(name, jg, hh, b)); R.push({ gruppe, id, name, svg: frames[frames.length - 1], frames, h: hh }); };

// ---------- Schriftlich rechnen ----------
{ // Regeln für SuS: 358 + 246 + 17 = 621 (Stellen untereinander, Zeichen je Zahl, Übertrag, dicker Strich, Doppelstrich)
  const C = 50, x0 = 50, y0 = 120, Z = zellen(x0, y0, C), dy = 74, ys = 140;
  neu('Schriftlich rechnen (Kl. 5/6)', 'schr-regeln', 'Schriftlich addieren und subtrahieren – so geht’s', 'Klasse 5', ys + 7 * dy + 20,
    raster(x0, y0, 4, 6, C) +
    st(1, Z.z(1, 0, 'H', 'orange', { g: 22 }) + Z.z(2, 0, 'Z', 'gruen', { g: 22 }) + Z.z(3, 0, 'E', 'blau', { g: 22 })) +
    Z.z(1, 1, '3', 'orange') + Z.z(2, 1, '5', 'gruen') + Z.z(3, 1, '8', 'blau') +
    Z.z(1, 2, '2', 'orange') + Z.z(2, 2, '4', 'gruen') + Z.z(3, 2, '6', 'blau') +
    Z.z(2, 3, '1', 'gruen') + Z.z(3, 3, '7', 'blau') +
    st(2, Z.z(0, 2, '+', 'rot', { w: 800 }) + Z.z(0, 3, '+', 'rot', { w: 800 })) +
    st(3, `<rect x="${x0 + C}" y="${y0 + 4 * C}" width="${3 * C}" height="${C}" fill="#fef2f2"/>` + Z.z(0, 4, 'Ü', 'rot', { g: 18 }) + Z.strich(0, 3, 5)) +
    st(4, Z.z(3, 5, '1', 'blau', { w: 800 }) + Z.z(2, 4, '2', 'rot', { g: 22 })) +
    st(5, Z.z(2, 5, '2', 'gruen', { w: 800 }) + Z.z(1, 4, '1', 'rot', { g: 22 })) +
    st(6, Z.z(1, 5, '6', 'orange', { w: 800 }) + Z.doppel(0, 3, 6)) +
    schritt(290, ys, '1', 'lila', [[['Stellen untereinander: ', 'lila', 1], 'Einer unter Einer,'], ['Zehner unter Zehner, Hunderter unter Hunderter.']], 20) +
    schritt(290, ys + dy, '2', 'rot', [[['Rechenzeichen: ', 'rot', 1], 'jede weitere Zahl bekommt ihr eigenes'], ['Zeichen – bei drei Zahlen also ', ['+  +', 'rot', 1], '  (bzw.  ', ['−  −', 'rot', 1], ').']], 20) +
    schritt(290, ys + 2 * dy, '3', 'rot', [[['Unter die Zahlen: ', 'rot', 1], 'eine Zeile für den ', ['Übertrag', 'rot', 1], ','], ['darunter einen ', ['etwas dickeren Strich', 'ink', 1], '.']], 20) +
    schritt(290, ys + 3 * dy, '4', 'blau', [[['Von rechts beginnen: ', 'blau', 1], 'Einer: 8 + 6 + 7 = 21'], ['→ schreibe ', ['1', 'blau', 1], ', der Übertrag ', ['2', 'rot', 1], ' kommt zu den Zehnern.']], 20) +
    schritt(290, ys + 4 * dy, '5', 'gruen', [[['Zehner: ', 'gruen', 1], '5 + 4 + 1 + ', ['2', 'rot', 1], ' = 12 → schreibe ', ['2', 'gruen', 1], ','], ['Übertrag ', ['1', 'rot', 1], ' zu den Hundertern.']], 20) +
    schritt(290, ys + 5 * dy, '6', 'orange', [[['Hunderter: ', 'orange', 1], '3 + 2 + ', ['1', 'rot', 1], ' = 6.  Ergebnis: ', ['621', 'orange', 1]], ['Unter das Ergebnis kommt der ', ['Doppelstrich', 'ink', 1], '.']], 20) +
    schritt(290, ys + 6 * dy, '7', 'lila', [[['Minus geht genauso: ', 'lila', 1], 'Stellen untereinander, von rechts,'], ['ergänzen oder abziehen – wie in deiner Klasse. Am Ende: Probe!']], 20));
}
{ // 478 + 356 = 834
  const C = 50, x0 = 60, y0 = 110, Z = zellen(x0, y0, C);
  neu('Schriftlich rechnen (Kl. 5/6)', 'add', 'Schriftlich addieren', 'Klasse 5', 420,
    raster(x0, y0, 4, 5, C) + Z.z(1, 0, 'H', 'orange', { g: 22 }) + Z.z(2, 0, 'Z', 'gruen', { g: 22 }) + Z.z(3, 0, 'E', 'blau', { g: 22 }) +
    Z.z(1, 1, '4', 'orange') + Z.z(2, 1, '7', 'gruen') + Z.z(3, 1, '8', 'blau') +
    Z.z(0, 2, '+') + Z.z(1, 2, '3', 'orange') + Z.z(2, 2, '5', 'gruen') + Z.z(3, 2, '6', 'blau') + Z.strich(0, 3, 4) + Z.doppel(0, 3, 5) +
    kasten(310, 330, 650, 56) + txs(330, 358, [['Tipp: ', 'lila', 1], 'Bei den Einern beginnen. Stellen genau untereinander!'], { g: 22 }) +
    st(1, Z.z(3, 4, '4', 'blau', { w: 800 }) + Z.z(2, 3, '1', 'rot', { g: 22 })) +
    st(2, Z.z(2, 4, '3', 'gruen', { w: 800 }) + Z.z(1, 3, '1', 'rot', { g: 22 })) +
    st(3, Z.z(1, 4, '8', 'orange', { w: 800 })) +
    schritt(310, 140, '1', 'blau', [[['Einer: ', 'blau', 1], '8 + 6 = 14 → schreibe ', ['4', 'blau', 1], ', Übertrag ', ['1', 'rot', 1]]]) +
    schritt(310, 210, '2', 'gruen', [[['Zehner: ', 'gruen', 1], '7 + 5 + ', ['1', 'rot', 1], ' = 13 → schreibe ', ['3', 'gruen', 1], ', Übertrag ', ['1', 'rot', 1]]]) +
    schritt(310, 280, '3', 'orange', [[['Hunderter: ', 'orange', 1], '4 + 3 + ', ['1', 'rot', 1], ' = 8 → schreibe ', ['8', 'orange', 1]]]));
}
{ // 725 − 348 = 377 (Ergänzen)
  const C = 50, x0 = 60, y0 = 110, Z = zellen(x0, y0, C);
  neu('Schriftlich rechnen (Kl. 5/6)', 'sub-erg', 'Schriftlich subtrahieren – Ergänzen', 'Klasse 5', 470,
    raster(x0, y0, 4, 5, C) + Z.z(1, 0, 'H', 'orange', { g: 22 }) + Z.z(2, 0, 'Z', 'gruen', { g: 22 }) + Z.z(3, 0, 'E', 'blau', { g: 22 }) +
    Z.z(1, 1, '7', 'orange') + Z.z(2, 1, '2', 'gruen') + Z.z(3, 1, '5', 'blau') +
    Z.z(0, 2, '−') + Z.z(1, 2, '3', 'orange') + Z.z(2, 2, '4', 'gruen') + Z.z(3, 2, '8', 'blau') + Z.strich(0, 3, 4) + Z.doppel(0, 3, 5) +
    st(1, Z.z(3, 4, '7', 'blau', { w: 800 }) + Z.z(2, 3, '1', 'rot', { g: 22 })) +
    st(2, Z.z(2, 4, '7', 'gruen', { w: 800 }) + Z.z(1, 3, '1', 'rot', { g: 22 })) +
    st(3, Z.z(1, 4, '3', 'orange', { w: 800 })) +
    txs(310, 120, [['Ergänzen: ', 'lila', 1], 'Wie viel fehlt von unten bis oben?'], { g: 24 }) +
    schritt(310, 175, '1', 'blau', [[['Einer: ', 'blau', 1], '8 bis 5 geht nicht → 8 bis 15: ', ['7', 'blau', 1]], ['schreibe 7, Übertrag ', ['1', 'rot', 1]]]) +
    schritt(310, 265, '2', 'gruen', [[['Zehner: ', 'gruen', 1], '4 + ', ['1', 'rot', 1], ' = 5;  5 bis 12: ', ['7', 'gruen', 1]], ['schreibe 7, Übertrag ', ['1', 'rot', 1]]]) +
    schritt(310, 355, '3', 'orange', [[['Hunderter: ', 'orange', 1], '3 + ', ['1', 'rot', 1], ' = 4;  4 bis 7: ', ['3', 'orange', 1]]]) +
    st(4, mark(302, 390, 666, 60) + kasten(310, 395, 650, 50) + txs(330, 420, [['Probe: ', 'lila', 1], '348 + 377 = 725 ✓'], { g: 22 })));
}
{ // 725 − 348 = 377 (Abziehen mit Entbündeln)
  const C = 50, x0 = 60, y0 = 110, Z = zellen(x0, y0, C);
  neu('Schriftlich rechnen (Kl. 5/6)', 'sub-abz', 'Schriftlich subtrahieren – Abziehen', 'Klasse 5', 470,
    raster(x0, y0, 4, 5, C) + Z.z(1, 0, 'H', 'orange', { g: 22 }) + Z.z(2, 0, 'Z', 'gruen', { g: 22 }) + Z.z(3, 0, 'E', 'blau', { g: 22 }) +
    Z.z(1, 2, '7', 'orange') + Z.z(2, 2, '2', 'gruen') + Z.z(3, 2, '5', 'blau') +
    Z.z(0, 3, '−') + Z.z(1, 3, '3', 'orange') + Z.z(2, 3, '4', 'gruen') + Z.z(3, 3, '8', 'blau') + Z.strich(0, 3, 4) + Z.doppel(0, 3, 5) +
    st(1, Z.quer(3, 2) + Z.z(3, 1, '15', 'rot', { g: 24 }) + Z.quer(2, 2) + Z.z(3, 4, '7', 'blau', { w: 800 })) + bis(1, st(1, Z.z(2, 1, '1', 'rot', { g: 24 }))) + // 2 Zehner → 1 Zehner
    st(2, Z.z(2, 1, '11', 'rot', { g: 24 }) + Z.quer(1, 2) + Z.z(1, 1, '6', 'rot', { g: 24 }) + Z.z(2, 4, '7', 'gruen', { w: 800 })) +
    st(3, Z.z(1, 4, '3', 'orange', { w: 800 })) +
    txs(310, 120, [['Abziehen: ', 'lila', 1], 'Reicht es nicht, wird ', ['entbündelt', 'rot', 1], '.'], { g: 24 }) +
    schritt(310, 175, '1', 'blau', [[['Einer: ', 'blau', 1], '5 − 8 geht nicht → 1 Zehner entbündeln'], ['5 wird ', ['15', 'rot', 1], ':  15 − 8 = ', ['7', 'blau', 1]]]) +
    schritt(310, 265, '2', 'gruen', [[['Zehner: ', 'gruen', 1], 'übrig 1;  1 − 4 geht nicht → 1 Hunderter'], ['entbündeln:  ', ['11', 'rot', 1], ' − 4 = ', ['7', 'gruen', 1]]]) +
    schritt(310, 355, '3', 'orange', [[['Hunderter: ', 'orange', 1], 'übrig ', ['6', 'rot', 1], ';  6 − 3 = ', ['3', 'orange', 1]]]) +
    st(4, mark(302, 390, 666, 60) + kasten(310, 395, 650, 50) + txs(330, 420, [['Probe: ', 'lila', 1], '348 + 377 = 725 ✓'], { g: 22 })));
}
{ // 243 · 36 = 8748 – Ziffer für Ziffer, als Schrittfolge (Bild k zeigt alles bis Schritt k)
  const C = 50, x0 = 60, y0 = 140, Z = zellen(x0, y0, C);
  const merk = (sp, ze, s) => tx(x0 + sp * C + 11, y0 + ze * C + 11, s, { g: 17, f: F.rot, w: 700, a: 'middle' }); // kleine Merkzahl oben links im Kästchen
  const kreis = (sp, ze) => `<circle cx="${Z.mx(sp)}" cy="${y0 + ze * C + C / 2}" r="21" fill="#fde68a"/>`;
  // Schritte: Text, Hinweis, beteiligte Ziffern [Spalte im 1. Faktor, Spalte im 2. Faktor]
  const S = [
    { t: ['3 · 3 = 9  →  ', ['9', 'orange', 1], ' unter die 3 schreiben'], hint: 'Rechts beginnen – die 3 steht für 30, also unter die 3.', an: [2, 4] },
    { t: ['4 · 3 = 12  →  ', ['2', 'orange', 1], ' schreiben, ', ['1', 'rot', 1], ' merken'], an: [1, 4] },
    { t: ['2 · 3 = 6, 6 + ', ['1', 'rot', 1], ' = 7  →  ', ['7', 'orange', 1], ' schreiben'], an: [0, 4] },
    { t: ['3 · 6 = 18  →  ', ['8', 'blau', 1], ' unter die 6, ', ['1', 'rot', 1], ' merken'], hint: 'Neue Reihe: Sie endet eine Stelle weiter rechts, unter der 6.', an: [2, 5] },
    { t: ['4 · 6 = 24, 24 + ', ['1', 'rot', 1], ' = 25  →  ', ['5', 'blau', 1], ' schreiben, ', ['2', 'rot', 1], ' merken'], an: [1, 5] },
    { t: ['2 · 6 = 12, 12 + ', ['2', 'rot', 1], ' = 14  →  ', ['14', 'blau', 1], ' schreiben'], an: [0, 5] },
    { t: ['Untereinander addieren:  ', ['8748', 'gruen', 1]], hint: 'Von rechts: 8 | 9+5 = 14, 1 merken | 2+4+1 = 7 | 7+1 = 8' }
  ];
  const yS = [], hoehe = s => s.hint ? 74 : 46; let yy = 180; for (const s of S) { yS.push(yy); yy += hoehe(s); }
  const bild = k => { // k = 0: Aufgabe, 1…7: Schritte, 8: fertig mit Überschlag
    let s = raster(x0, y0, 6, 5, C) + txs(60, 112, [['Aufgabe: ', 'lila', 1], '243 · 36  –  erst mal ', ['3', 'orange', 1], ', dann mal ', ['6', 'blau', 1], ', dann addieren'], { g: 25 });
    const cur = S[k - 1]; if (cur && cur.an) s += kreis(cur.an[0], 0) + kreis(cur.an[1], 0);
    s += Z.z(0, 0, '2') + Z.z(1, 0, '4') + Z.z(2, 0, '3') + Z.z(3, 0, '·') + Z.z(4, 0, '3', 'orange', { w: 800 }) + Z.z(5, 0, '6', 'blau', { w: 800 }) + Z.strich(0, 5, 1);
    if (k >= 1) s += Z.z(4, 1, '9', 'orange');
    if (k >= 2) s += Z.z(3, 1, '2', 'orange') + merk(2, 1, '1');
    if (k >= 3) s += Z.z(2, 1, '7', 'orange');
    if (k >= 4) s += Z.z(5, 2, '8', 'blau') + merk(4, 2, '1');
    if (k >= 5) s += Z.z(4, 2, '5', 'blau') + merk(3, 2, '2');
    if (k >= 6) s += Z.z(3, 2, '4', 'blau') + Z.z(2, 2, '1', 'blau');
    if (k >= 7) s += Z.z(3, 3, '1', 'rot', { g: 22 }) + Z.strich(2, 5, 4) + Z.doppel(2, 5, 5) + Z.z(2, 4, '8', 'gruen', { w: 800 }) + Z.z(3, 4, '7', 'gruen', { w: 800 }) + Z.z(4, 4, '4', 'gruen', { w: 800 }) + Z.z(5, 4, '8', 'gruen', { w: 800 });
    if (k === 0) s += tx(410, 200, 'Weiter mit ▶ – Schritt für Schritt.', { g: 24, f: F.grau });
    S.forEach((st, i) => {
      if (i >= k) return; const y = yS[i], aktiv = i === k - 1 && k <= S.length;
      if (aktiv) s += `<rect x="404" y="${y - 24}" width="566" height="${hoehe(st) - 4}" rx="12" fill="#fef9c3" stroke="#facc15" stroke-width="2"/>`;
      s += schritt(412, y, String(i + 1), i < 3 ? 'orange' : i < 6 ? 'blau' : 'gruen', [st.t], 21);
      if (st.hint) s += tx(456, y + 30, '💡 ' + st.hint, { g: 17, f: F.grau });
    });
    if (k >= 8) s += kasten(404, yy - 4, 566, 46) + txs(424, yy + 19, [['Überschlag: ', 'lila', 1], '250 · 35 = 8 750 – passt ✓'], { g: 21 });
    return s;
  };
  neuSchritte('Schriftlich rechnen (Kl. 5/6)', 'mul', 'Schriftlich multiplizieren', 'Klasse 5', yy + 70, Array.from({ length: 9 }, (_, k) => bild(k)));
}
{ // 756 : 3 = 252
  const C = 44, x0 = 40, y0 = 110, Z = zellen(x0, y0, C);
  const ab = sp => pfeil(`M${Z.mx(sp)} ${Z.oy(1) - 4} L${Z.mx(sp)} ${Z.oy(sp === 2 ? 2 : 4) + 6}`, 'lila', 2.5);
  neu('Schriftlich rechnen (Kl. 5/6)', 'div', 'Schriftlich dividieren', 'Klasse 5', 450,
    raster(x0, y0, 10, 7, C) +
    Z.z(1, 0, '7') + Z.z(2, 0, '5') + Z.z(3, 0, '6') + Z.z(4, 0, ':') + Z.z(5, 0, '3') + Z.z(6, 0, '=') +
    st(1, Z.z(7, 0, '2', 'orange', { w: 800 }) + Z.z(0, 1, '−', 'orange') + Z.z(1, 1, '6', 'orange') + Z.strich(0, 1, 2) + Z.z(1, 2, '1')) +
    st(2, ab(2) + Z.z(2, 2, '5') + Z.z(8, 0, '5', 'gruen', { w: 800 }) + Z.z(0, 3, '−', 'gruen') + Z.z(1, 3, '1', 'gruen') + Z.z(2, 3, '5', 'gruen') + Z.strich(0, 2, 4) + Z.z(2, 4, '0')) +
    st(3, ab(3) + Z.z(3, 4, '6') + Z.z(9, 0, '2', 'blau', { w: 800 }) + Z.z(2, 5, '−', 'blau') + Z.z(3, 5, '6', 'blau') + Z.strich(2, 3, 6) + Z.z(3, 6, '0')) +
    schritt(510, 130, '1', 'orange', [['7 : 3 = ', ['2', 'orange', 1], '   (2 · 3 = 6)'], ['Rest 7 − 6 = 1']], 22) +
    schritt(510, 220, '2', 'gruen', [[['5 herunterholen', 'lila', 1], ' → 15 : 3 = ', ['5', 'gruen', 1]], ['(5 · 3 = 15)   Rest 0']], 22) +
    schritt(510, 310, '3', 'blau', [[['6 herunterholen', 'lila', 1], ' → 6 : 3 = ', ['2', 'blau', 1]], ['(2 · 3 = 6)   Rest 0']], 22) +
    st(4, mark(502, 370, 466, 60) + kasten(510, 375, 450, 50) + txs(530, 400, [['Probe: ', 'lila', 1], '252 · 3 = 756 ✓'], { g: 22 })));
}
{ // 467 + 285 + 139 = 891 – mehrere Zahlen
  const C = 50, x0 = 60, y0 = 110, Z = zellen(x0, y0, C);
  neu('Schriftlich rechnen (Kl. 5/6)', 'add-mehr', 'Schriftlich addieren – mehrere Zahlen', 'Klasse 5', 500,
    raster(x0, y0, 4, 6, C) + Z.z(1, 0, 'H', 'orange', { g: 22 }) + Z.z(2, 0, 'Z', 'gruen', { g: 22 }) + Z.z(3, 0, 'E', 'blau', { g: 22 }) +
    Z.z(1, 1, '4', 'orange') + Z.z(2, 1, '6', 'gruen') + Z.z(3, 1, '7', 'blau') +
    Z.z(0, 2, '+') + Z.z(1, 2, '2', 'orange') + Z.z(2, 2, '8', 'gruen') + Z.z(3, 2, '5', 'blau') +
    Z.z(0, 3, '+') + Z.z(1, 3, '1', 'orange') + Z.z(2, 3, '3', 'gruen') + Z.z(3, 3, '9', 'blau') + Z.strich(0, 3, 5) + Z.doppel(0, 3, 6) +
    st(1, Z.z(3, 5, '1', 'blau', { w: 800 }) + Z.z(2, 4, '2', 'rot', { g: 22 })) +
    st(2, Z.z(2, 5, '9', 'gruen', { w: 800 }) + Z.z(1, 4, '1', 'rot', { g: 22 })) +
    st(3, Z.z(1, 5, '8', 'orange', { w: 800 })) +
    txs(310, 120, [['Alle Zahlen ', 'ink'], ['stellengerecht', 'lila', 1], ' untereinander schreiben.'], { g: 22 }) +
    schritt(310, 175, '1', 'blau', [[['Einer: ', 'blau', 1], '7 + 5 + 9 = 21'], ['schreibe ', ['1', 'blau', 1], ', Übertrag ', ['2', 'rot', 1]]]) +
    schritt(310, 265, '2', 'gruen', [[['Zehner: ', 'gruen', 1], '6 + 8 + 3 + ', ['2', 'rot', 1], ' = 19'], ['schreibe ', ['9', 'gruen', 1], ', Übertrag ', ['1', 'rot', 1]]]) +
    schritt(310, 355, '3', 'orange', [[['Hunderter: ', 'orange', 1], '4 + 2 + 1 + ', ['1', 'rot', 1], ' = 8 → schreibe ', ['8', 'orange', 1]]]) +
    st(4, mark(52, 414, 896, 76) + kasten(60, 420, 880, 64) + txs(80, 440, [['Achtung: ', 'rot', 1], 'Bei mehreren Zahlen kann der Übertrag auch 2 oder mehr sein.'], { g: 21 }) +
      txs(80, 468, [['Überschlag: ', 'lila', 1], '500 + 300 + 100 = 900 – Ergebnis 891 passt ✓'], { g: 21 })));
}
{ // 900 − 345 − 218 = 337 – mehrere Zahlen (Ergänzen) bzw. erst zusammenzählen
  const C = 50, x0 = 60, y0 = 110, Z = zellen(x0, y0, C);
  neu('Schriftlich rechnen (Kl. 5/6)', 'sub-mehr', 'Schriftlich subtrahieren – mehrere Zahlen', 'Klasse 5', 600,
    raster(x0, y0, 4, 6, C) + Z.z(1, 0, 'H', 'orange', { g: 22 }) + Z.z(2, 0, 'Z', 'gruen', { g: 22 }) + Z.z(3, 0, 'E', 'blau', { g: 22 }) +
    Z.z(1, 1, '9', 'orange') + Z.z(2, 1, '0', 'gruen') + Z.z(3, 1, '0', 'blau') +
    Z.z(0, 2, '−') + Z.z(1, 2, '3', 'orange') + Z.z(2, 2, '4', 'gruen') + Z.z(3, 2, '5', 'blau') +
    Z.z(0, 3, '−') + Z.z(1, 3, '2', 'orange') + Z.z(2, 3, '1', 'gruen') + Z.z(3, 3, '8', 'blau') + Z.strich(0, 3, 5) + Z.doppel(0, 3, 6) +
    st(1, Z.z(3, 5, '7', 'blau', { w: 800 }) + Z.z(2, 4, '2', 'rot', { g: 22 })) +
    st(2, Z.z(2, 5, '3', 'gruen', { w: 800 }) + Z.z(1, 4, '1', 'rot', { g: 22 })) +
    st(3, Z.z(1, 5, '3', 'orange', { w: 800 })) +
    txs(310, 120, [['Ergänzen: ', 'lila', 1], 'Untere Ziffern addieren, dann bis oben ergänzen.'], { g: 22 }) +
    schritt(310, 175, '1', 'blau', [[['Einer: ', 'blau', 1], '5 + 8 = 13;  13 bis 20: ', ['7', 'blau', 1]], ['schreibe 7, Übertrag ', ['2', 'rot', 1]]]) +
    schritt(310, 265, '2', 'gruen', [[['Zehner: ', 'gruen', 1], '4 + 1 + ', ['2', 'rot', 1], ' = 7;  7 bis 10: ', ['3', 'gruen', 1]], ['schreibe 3, Übertrag ', ['1', 'rot', 1]]]) +
    schritt(310, 355, '3', 'orange', [[['Hunderter: ', 'orange', 1], '3 + 2 + ', ['1', 'rot', 1], ' = 6;  6 bis 9: ', ['3', 'orange', 1]]]) +
    st(4, mark(52, 414, 896, 96) + kasten(60, 420, 880, 84, '#f0fdf4', '#bbf7d0') + txs(80, 442, [['Oder in zwei Schritten: ', 'gruen', 1], 'erst die abzuziehenden Zahlen addieren,'], { g: 21 }) +
      txs(80, 476, ['345 + 218 = ', ['563', 'gruen', 1], ',  dann  900 − 563 = ', ['337', 'gruen', 1], '  (abziehen oder ergänzen)'], { g: 21 })) +
    st(5, mark(52, 524, 896, 60) + kasten(60, 530, 880, 48) + txs(80, 554, [['Probe: ', 'lila', 1], '337 + 345 + 218 = 900 ✓'], { g: 22 })));
}

// ---------- Kopfrechnen: leichte Strategien (jede Zeile ein Schritt) ----------
const strategien = (id, name, jg, einleitung, liste) => {
  const y0 = 165, dy = 84;
  neu('Kopfrechnen (Kl. 5/6)', id, name, jg, y0 + liste.length * dy + 20,
    txs(60, 115, einleitung, { g: 23 }) +
    liste.map(([titel, farbe, beispiel, tipp], i) => { const y = y0 + i * dy;
      return st(i + 1, mark(44, y - 26, 912, dy - 6) + `<circle cx="76" cy="${y}" r="16" fill="${F[farbe]}"/>` + tx(76, y + 1, String(i + 1), { g: 19, f: '#fff', w: 700, a: 'middle' }) +
        tx(104, y, titel, { g: 21, w: 700, f: F[farbe] }) + (tipp ? tx(104, y + 32, '💡 ' + tipp, { g: 17, f: F.grau }) : '') + txs(440, y, beispiel, { g: 22 })); }).join(''));
};
strategien('kr-plus', 'Kopfrechnen: Plus und Minus', 'Klasse 5', [['Nicht alles auf einmal – ', 'ink'], ['Rechenwege', 'lila', 1], ', die das Rechnen leicht machen:'], [
  ['Schrittweise', 'blau', ['47 + 38 = 47 + ', ['30', 'blau', 1], ' + ', ['8', 'blau', 1], ' = 77 + 8 = ', ['85', 'blau', 1]], 'erst die Zehner, dann die Einer'],
  ['Hilfsaufgabe (runden)', 'orange', ['56 + 29 = 56 + ', ['30', 'orange', 1], ' − ', ['1', 'orange', 1], ' = ', ['85', 'orange', 1]], 'mit der runden Zahl rechnen, dann ausgleichen'],
  ['Geschickt tauschen', 'gruen', ['17 + 25 + 3 = ', ['17 + 3', 'gruen', 1], ' + 25 = 20 + 25 = ', ['45', 'gruen', 1]], 'Zahlen, die zusammen eine runde Zahl ergeben'],
  ['Gegensinnig verändern', 'lila', ['48 + 27 = ', ['50', 'lila', 1], ' + ', ['25', 'lila', 1], ' = ', ['75', 'lila', 1]], 'bei Plus: eine Zahl + 2, die andere − 2 – die Summe bleibt'],
  ['Gleichsinnig verändern', 'rot', ['83 − 48 = ', ['85', 'rot', 1], ' − ', ['50', 'rot', 1], ' = ', ['35', 'rot', 1]], 'bei Minus: beide Zahlen + 2 – der Unterschied bleibt'],
  ['Ergänzen (minus)', 'blau', ['82 − 77:  von 77 bis 82 sind es ', ['5', 'blau', 1]], 'gut, wenn die Zahlen nah beieinander liegen']]);
strategien('kr-mal', 'Kopfrechnen: Mal und Geteilt', 'Klasse 5', [['Mit dem ', 'ink'], ['kleinen Einmaleins', 'lila', 1], ' und ein paar Tricks:'], [
  ['Zerlegen', 'blau', ['7 · 14 = ', ['7 · 10', 'blau', 1], ' + ', ['7 · 4', 'blau', 1], ' = 70 + 28 = ', ['98', 'blau', 1]], 'eine Zahl in Zehner und Einer zerlegen'],
  ['Nachbaraufgabe', 'orange', ['9 · 8 = ', ['10 · 8', 'orange', 1], ' − 8 = 80 − 8 = ', ['72', 'orange', 1]], 'von einer leichten Aufgabe aus rechnen'],
  ['Verdoppeln und Halbieren', 'gruen', ['25 · 12 = ', ['50', 'gruen', 1], ' · ', ['6', 'gruen', 1], ' = ', ['300', 'gruen', 1]], 'eine Zahl · 2, die andere : 2 – das Ergebnis bleibt'],
  ['Mit Nullen', 'lila', ['30 · 40 = ', ['3 · 4', 'lila', 1], ' · 100 = ', ['1 200', 'lila', 1]], 'erst ohne Nullen rechnen, dann die Nullen anhängen'],
  ['Geteilt zerlegen', 'rot', ['84 : 4 = ', ['80 : 4', 'rot', 1], ' + ', ['4 : 4', 'rot', 1], ' = 20 + 1 = ', ['21', 'rot', 1]], 'in Zahlen zerlegen, die gut teilbar sind'],
  ['Umkehraufgabe prüfen', 'blau', ['84 : 4 = 21, denn ', ['21 · 4 = 84', 'blau', 1], ' ✓'], 'Geteilt-Aufgaben mit Mal kontrollieren']]);

// ---------- Brüche & Dezimalzahlen ----------
/* Streifen aus n gleichen Teilen, k davon gefärbt (für Erweitern/Kürzen) */
const streifen = (x, y, w, hh, n, k, farbe, rand = F.ink) => { let s = ''; for (let i = 0; i < n; i++) s += `<rect x="${x + i * w / n}" y="${y}" width="${w / n}" height="${hh}" fill="${i < k ? farbe : '#fff'}" stroke="${rand}" stroke-width="${n > 16 ? 1.5 : 2.5}"/>`; return s; };
{ // 2/3 = 8/12; 2/3 und 3/4 vergleichen
  neu('Brüche & Dezimalzahlen (Kl. 6/7)', 'erw-allein', 'Brüche erweitern', 'Klasse 6', 720,
    txs(60, 115, [['Erweitern: ', 'blau', 1], 'Zähler ', ['und', 'blau', 1], ' Nenner mit derselben Zahl ', ['multiplizieren', 'blau', 1], ' (nicht mit 0).'], { g: 24 }) +
    bruch(90, 225, '2', '3', 'ink', 44) + streifen(460, 200, 480, 50, 3, 2, '#bfdbfe') + tx(700, 275, '2 von 3 Teilen', { g: 19, f: F.grau, a: 'middle' }) +
    st(1, mark(44, 150, 912, 150, true) + tx(140, 225, '=', { g: 44, a: 'middle' }) + bruch(220, 225, '2 · 4', '3 · 4', 'blau', 34) + tx(300, 225, '=', { g: 44, a: 'middle' }) + bruch(360, 225, '8', '12', 'blau', 44)) +
    st(2, mark(44, 305, 912, 120, true) + streifen(460, 320, 480, 50, 12, 8, '#93c5fd') + tx(700, 395, '8 von 12 Teilen – gleich viel gefärbt!', { g: 19, f: F.blau, a: 'middle', w: 600 }) +
      txs(60, 345, ['Jedes Drittel wird in ', ['4', 'blau', 1], ' Teile geteilt:'], { g: 21 }) + txs(60, 380, ['mehr Teile, aber ', ['kleinere', 'blau', 1], ' Teile.'], { g: 21 })) +
    st(3, mark(44, 440, 912, 150, true) + txs(60, 470, [['Wozu? ', 'orange', 1], 'Brüche mit gleichem Nenner kann man leicht vergleichen.'], { g: 22 }) +
      bruch(110, 540, '2', '3') + tx(160, 540, '=', { g: 34, a: 'middle' }) + bruch(215, 540, '8', '12', 'blau') + tx(300, 540, 'und', { g: 24, a: 'middle' }) +
      bruch(370, 540, '3', '4') + tx(420, 540, '=', { g: 34, a: 'middle' }) + bruch(475, 540, '9', '12', 'orange') +
      txs(560, 540, ['→  ', ['9/12 > 8/12', 'orange', 1], ', also  3/4 > 2/3'], { g: 22 })) +
    st(4, mark(52, 609, 896, 96) + kasten(60, 615, 880, 84) + txs(80, 640, [['Merke: ', 'lila', 1], 'Beim Erweitern bleibt der ', ['Wert', 'lila', 1], ' des Bruchs gleich –'], { g: 22 }) +
      txs(80, 674, ['nur die Einteilung wird ', ['feiner', 'lila', 1], '. Erweiterungszahl: jede Zahl außer 0.'], { g: 22 })));
}
{ // 18/24 = 9/12 = 3/4; ggT 6
  neu('Brüche & Dezimalzahlen (Kl. 6/7)', 'kuerz', 'Brüche kürzen', 'Klasse 6', 790,
    txs(60, 115, [['Kürzen: ', 'gruen', 1], 'Zähler ', ['und', 'gruen', 1], ' Nenner durch dieselbe Zahl ', ['dividieren', 'gruen', 1], '.'], { g: 24 }) +
    bruch(130, 220, '18', '24', 'ink', 44) +
    st(1, mark(240, 160, 716, 120, true) + txs(260, 195, [['Gemeinsamen Teiler suchen: ', 'orange', 1]], { g: 22 }) +
      txs(260, 240, ['18 und 24 sind beide teilbar durch ', ['2', 'orange', 1], ', ', ['3', 'orange', 1], ' und ', ['6', 'orange', 1], '.'], { g: 22 })) +
    st(2, mark(44, 290, 420, 150, true) + txs(60, 318, [['Schrittweise: ', 'gruen', 1]], { g: 22 }) +
      bruch(110, 372, '18', '24', 'ink', 32) + tx(170, 372, '=', { g: 32, a: 'middle' }) + bruch(230, 372, '9', '12', 'gruen', 32) + tx(230, 428, ': 2', { g: 20, f: F.gruen, w: 700, a: 'middle' }) +
      tx(290, 372, '=', { g: 32, a: 'middle' }) + bruch(350, 372, '3', '4', 'gruen', 32) + tx(350, 428, ': 3', { g: 20, f: F.gruen, w: 700, a: 'middle' })) +
    st(3, mark(470, 290, 486, 150, true) + txs(490, 318, [['Oder in einem Schritt: ', 'blau', 1]], { g: 22 }) +
      txs(490, 362, ['mit dem ', ['größten', 'blau', 1], ' gemeinsamen Teiler'], { g: 20 }) + txs(490, 400, ['ggT(18, 24) = ', ['6', 'blau', 1], ':   18 : 6 = 3,  24 : 6 = 4'], { g: 20 })) +
    st(4, mark(44, 452, 912, 166, true) + streifen(80, 470, 840, 46, 24, 18, '#bbf7d0') + tx(500, 534, '18 von 24 Teilen', { g: 18, f: F.grau, a: 'middle' }) +
      streifen(80, 552, 840, 46, 4, 3, '#86efac') + tx(500, 612, '3 von 4 Teilen – gleich viel gefärbt: weniger, aber größere Teile', { g: 18, f: F.gruen, a: 'middle', w: 600 })) +
    st(5, mark(52, 644, 896, 126) + kasten(60, 650, 880, 114) + txs(80, 675, [['Merke: ', 'lila', 1], 'Der ', ['Wert', 'lila', 1], ' bleibt gleich. Gekürzt wird nur mit einem gemeinsamen Teiler.'], { g: 21 }) +
      txs(80, 709, [['Vollständig gekürzt', 'lila', 1], ', wenn Zähler und Nenner keinen gemeinsamen'], { g: 21 }) + txs(80, 739, ['Teiler außer 1 mehr haben – z. B. 3/4.'], { g: 21 })));
}
{ // Zahlenstrahl für Brüche einteilen (für SuS): 1/3, 3/4, 5/4 → Hauptnenner 12 → 12 Kästchen je Ganzes
  const K = 34, xa = 92, ya = 300, X = n => xa + n * K; /* n = Anzahl Kästchen ab 0; 12 Kästchen = 1 Ganzes */
  let kaest = ''; for (let i = 0; i < 24; i++) kaest += `<rect x="${X(i)}" y="${ya - K}" width="${K}" height="${K}" fill="#f8fafc" stroke="${F.gitter}" stroke-width="1"/>`;
  let teil = ''; for (let i = 1; i < 24; i++) if (i % 12) teil += ln(X(i), ya - 9, X(i), ya + 9, F.ink, 2);
  const ganz = [0, 1, 2].map(v => ln(X(v * 12), ya - 18, X(v * 12), ya + 18, F.ink, 3.5) + tx(X(v * 12), ya + 40, String(v), { g: 28, w: 700, a: 'middle' })).join('');
  const marke = (n, z, nn, f, hoch = 0, extra = '') => `<circle cx="${X(n)}" cy="${ya}" r="8" fill="${F[f]}" stroke="#fff" stroke-width="2"/>` + bruch(X(n), ya - K - 52 - hoch, z, nn, f, 24) + extra;
  const bogen = (n0, n1, f, txt, tief = 0) => pfeil(`M${X(n0) + 6} ${ya + 62} Q${(X(n0) + X(n1)) / 2} ${ya + 96 + tief} ${X(n1)} ${ya + 14}`, f, 2.5) + tx((X(n0) + X(n1)) / 2 + 20, ya + 90 + tief, txt, { g: 17, f: F[f], w: 700, a: 'middle' });
  const yT = 470, dyT = 64;
  neu('Brüche & Dezimalzahlen (Kl. 6/7)', 'bruchstrahl', 'Zahlenstrahl für Brüche einteilen', 'Klasse 6', 880,
    txs(60, 112, [['Aufgabe: ', 'lila', 1], 'Trage ', ['1/3', 'blau', 1], ', ', ['3/4', 'rot', 1], ' und ', ['5/4', 'orange', 1], ' am Zahlenstrahl ein.'], { g: 24 }) +
    ln(xa, ya, X(24) + 40, ya, F.ink, 3) + `<path d="M${X(24) + 52} ${ya} l-16 -9 v18 z" fill="${F.ink}"/>` + ganz +
    st(3, kaest + ganz) + st(4, teil) +
    st(5, marke(4, 1, 3, 'blau') + bogen(0, 4, 'blau', '4 Kästchen') + marke(9, 3, 4, 'rot', 0) + bogen(0, 9, 'rot', '9 Kästchen', 40)) +
    st(6, marke(15, 5, 4, 'orange', 0, tx(X(15) + 34, ya - K - 52, '= 1 ¼', { g: 24, f: F.orange, w: 700 }))) +
    schritt(60, yT, '1', 'blau', [[['Nenner ansehen: ', 'blau', 1], '1/3 → Drittel,  3/4 und 5/4 → Viertel.']], 20) +
    schritt(60, yT + dyT, '2', 'orange', [[['Hauptnenner: ', 'orange', 1], 'kleinste Zahl, in der 3 und 4 aufgehen → ', ['12', 'orange', 1], '.']], 20) +
    schritt(60, yT + 2 * dyT, '3', 'gruen', [[['Einheit wählen: ', 'gruen', 1], 'von 0 bis 1 genau ', ['12 Kästchen', 'gruen', 1], ' (oder 12 cm) – 1 Kästchen = 1/12.']], 20) +
    schritt(60, yT + 3 * dyT, '4', 'lila', [[['Einteilen: ', 'lila', 1], 'Drittel = alle ', ['4', 'lila', 1], ' Kästchen,  Viertel = alle ', ['3', 'lila', 1], ' Kästchen.']], 20) +
    schritt(60, yT + 4 * dyT, '5', 'rot', [[['Eintragen: ', 'rot', 1], '1/3 = 4/12 → 4 Kästchen;   3/4 = 9/12 → 9 Kästchen.']], 20) +
    schritt(60, yT + 5 * dyT, '6', 'orange', [[['Über 1 hinaus: ', 'orange', 1], '5/4 = 1 ¼ → 12 + 3 = ', ['15', 'orange', 1], ' Kästchen (ein Ganzes und ein Viertel).']], 20) +
    st(7, mark(52, 832, 896, 40) + kasten(60, 836, 880, 34) + txs(80, 853, [['Merke: ', 'lila', 1], 'Die Länge des Ganzen muss sich durch jeden Nenner teilen lassen.'], { g: 19 })));
}
{ // 2/3 = 8/12; 12/18 = 2/3
  // Bogenpfeil über dem Zähler bzw. unter dem Nenner (c = Höhe des Bruchstrichs)
  const bogen = (x1, x2, c, oben, f, txt) => { const y = c + (oben ? -60 : 60);
    return pfeil(`M${x1} ${y} Q${(x1 + x2) / 2} ${y + (oben ? -55 : 55)} ${x2} ${y}`, f, 3) + tx((x1 + x2) / 2, y + (oben ? -45 : 45), txt, { g: 26, f: F[f], w: 700, a: 'middle' }); };
  const a = 265, b = 575;
  neu('Brüche & Dezimalzahlen (Kl. 6/7)', 'erw', 'Brüche erweitern und kürzen', 'Klasse 6', 785,
    txs(60, 120, [['Erweitern: ', 'blau', 1], 'Zähler und Nenner mit derselben Zahl ', ['multiplizieren', 'blau', 1], '.'], { g: 25 }) +
    bruch(380, a, '2', '3', 'ink', 44) +
    st(1, mark(300, a - 120, 400, 240, true) + bogen(405, 590, a, true, 'blau', '· 4') + bogen(405, 590, a, false, 'blau', '· 4') + tx(500, a, '=', { g: 44, a: 'middle' }) + bruch(620, a, '8', '12', 'blau', 44) +
      tx(720, a, '2 · 4 = 8,  3 · 4 = 12', { g: 21, f: F.grau })) +
    txs(60, 425, [['Kürzen: ', 'gruen', 1], 'Zähler und Nenner durch dieselbe Zahl ', ['dividieren', 'gruen', 1], '.'], { g: 25 }) +
    bruch(380, b, '12', '18', 'ink', 44) +
    st(2, mark(300, b - 120, 400, 240, true) + bogen(415, 595, b, true, 'gruen', ': 6') + bogen(415, 595, b, false, 'gruen', ': 6') + tx(500, b, '=', { g: 44, a: 'middle' }) + bruch(620, b, '2', '3', 'gruen', 44) +
      tx(720, b, '12 : 6 = 2,  18 : 6 = 3', { g: 21, f: F.grau })) +
    st(3, mark(52, 709, 896, 58) + kasten(60, 715, 880, 46) + txs(80, 738, [['Merke: ', 'lila', 1], 'Der Wert des Bruchs bleibt gleich – nur die Einteilung ändert sich.'], { g: 22 })));
}
{ // 2/8 + 5/12 = 1/4 + 5/12 = 3/12 + 5/12 = 8/12 = 2/3;  5/6 − 1/4 = 10/12 − 3/12 = 7/12 – als Schrittfolge
  const g = 32;
  // Ausdruck aus Brüchen und Text nebeneinander: ['b', z, n, farbe] | ['t', text, farbe]
  const ausdruck = (x, y, teile, gg = g) => {
    let s = '';
    for (const [art, a, b, f] of teile) {
      if (art === 'b') { const hb = Math.max(String(a).length, String(b).length) * gg * 0.32 + 10; s += bruch(x + hb, y, a, b, f || 'ink', gg); x += 2 * hb + 14; }
      else { s += tx(x, y, a, { g: art === 'k' ? 24 : gg, f: F[b] || F.ink, w: art === 'k' ? 700 : 400 }); x += String(a).length * (art === 'k' ? 24 : gg) * 0.56 + 14; }
    }
    return s;
  };
  const S = [
    { titel: 'Kürzen, wenn es geht', hint: '2 und 8 sind beide durch 2 teilbar', farbe: 'gruen', ex: [['b', 2, 8], ['t', '='], ['b', 1, 4, 'gruen'], ['k', ': 2', 'gruen']] },
    { titel: 'Hauptnenner finden', hint: 'kleinste Zahl, durch die 4 und 12 teilbar sind', farbe: 'orange', ex: [['t', '4 und 12  →'], ['t', 'HN = 12', 'orange']] },
    { titel: 'Erweitern auf den Hauptnenner', hint: 'Zähler und Nenner mit der gleichen Zahl mal', farbe: 'blau', ex: [['b', 1, 4], ['t', '='], ['b', 3, 12, 'blau'], ['k', '· 3', 'blau'], ['t', '   '], ['b', 5, 12], ['k', 'bleibt', 'grau']] },
    { titel: 'Zähler addieren', hint: 'der Nenner bleibt gleich!', farbe: 'rot', ex: [['b', 3, 12, 'blau'], ['t', '+'], ['b', 5, 12], ['t', '='], ['b', 8, 12, 'rot'], ['k', '3 + 5 = 8', 'rot']] },
    { titel: 'Ergebnis kürzen', hint: '8 und 12 sind beide durch 4 teilbar', farbe: 'lila', ex: [['b', 8, 12, 'rot'], ['t', '='], ['b', 2, 3, 'lila'], ['k', ': 4', 'lila']] }
  ];
  const y0 = 270, dy = 92;
  const bild = k => { // 0: Aufgabe, 1…5: Schritte, 6: fertig + Subtraktion
    let s = txs(60, 112, [['Brüche addieren oder subtrahieren: ', 'lila', 1], 'erst gleiche Nenner herstellen!'], { g: 24 }) +
      ausdruck(80, 175, [['t', 'Aufgabe:', 'grau'], ['b', 2, 8], ['t', '+'], ['b', 5, 12], ['t', '='], k >= 5 ? ['b', 2, 3, 'lila'] : ['t', '?', 'grau']], 36);
    if (k === 0) s += tx(60, y0, 'Weiter mit ▶ – Schritt für Schritt.', { g: 24, f: F.grau });
    S.forEach((st, i) => {
      if (i >= k) return; const y = y0 + i * dy, aktiv = i === k - 1 && k <= S.length;
      if (aktiv) s += `<rect x="44" y="${y - 44}" width="912" height="${dy - 6}" rx="14" fill="#fef9c3" stroke="#facc15" stroke-width="2"/>`;
      s += `<circle cx="76" cy="${y - 12}" r="16" fill="${F[st.farbe]}"/>` + tx(76, y - 11, String(i + 1), { g: 19, f: '#fff', w: 700, a: 'middle' }) +
        tx(104, y - 12, st.titel, { g: 23, w: 700, f: F[st.farbe] }) + tx(104, y + 18, '💡 ' + st.hint, { g: 17, f: F.grau }) + ausdruck(500, y, st.ex);
    });
    if (k >= 6) {
      const y = y0 + 5 * dy + 10;
      s += kasten(44, y - 50, 912, 124) + tx(64, y - 24, 'Subtrahieren geht genauso:', { g: 21, w: 700, f: F.lila }) +
        ausdruck(64, y + 22, [['b', 5, 6], ['t', '−'], ['b', 1, 4], ['t', '='], ['b', 10, 12, 'blau'], ['t', '−'], ['b', 3, 12, 'blau'], ['t', '='], ['b', 7, 12, 'rot'], ['k', '(nicht kürzbar)', 'grau']], 28);
    }
    return s;
  };
  neuSchritte('Brüche & Dezimalzahlen (Kl. 6/7)', 'bradd', 'Brüche addieren und subtrahieren', 'Klasse 6', y0 + 5 * dy + 130, Array.from({ length: 7 }, (_, k) => bild(k)));
}
{ // 3,75 + 12,4 = 16,15;  2,4 · 1,3 = 3,12
  const C = 50, x0 = 60, y0 = 140, Z = zellen(x0, y0, C);
  neu('Brüche & Dezimalzahlen (Kl. 6/7)', 'dez', 'Dezimalzahlen rechnen', 'Klasse 6', 500,
    tx(60, 112, 'Addieren: Komma unter Komma', { g: 24, w: 700, f: F.blau }) +
    raster(x0, y0, 6, 5, C) + `<rect x="${x0 + 3 * C}" y="${y0}" width="${C}" height="${5 * C}" fill="#fee2e2" opacity=".7"/>` +
    Z.z(1, 0, 'Z', 'grau', { g: 20 }) + Z.z(2, 0, 'E', 'grau', { g: 20 }) + Z.z(4, 0, 'z', 'grau', { g: 20 }) + Z.z(5, 0, 'h', 'grau', { g: 20 }) +
    Z.z(2, 1, '3') + Z.z(3, 1, ',', 'rot', { w: 800 }) + Z.z(4, 1, '7') + Z.z(5, 1, '5') +
    Z.z(0, 2, '+') + Z.z(1, 2, '1') + Z.z(2, 2, '2') + Z.z(3, 2, ',', 'rot', { w: 800 }) + Z.z(4, 2, '4') + Z.strich(0, 5, 4) + Z.doppel(0, 5, 5) +
    st(1, mark(52, 404, 540, 34) + Z.z(5, 2, '0', 'grau', { i: true }) + txs(60, 420, [['① Lücken mit ', 'ink'], ['0', 'grau', 1], ' auffüllen: 12,4 = 12,40'], { g: 21 })) +
    st(2, mark(52, 440, 540, 34) + Z.z(2, 3, '1', 'rot', { g: 22 }) + Z.z(1, 4, '1', 'ink', { w: 800 }) + Z.z(2, 4, '6', 'ink', { w: 800 }) + Z.z(3, 4, ',', 'rot', { w: 800 }) + Z.z(4, 4, '1', 'ink', { w: 800 }) + Z.z(5, 4, '5', 'ink', { w: 800 }) +
      txs(60, 456, [['② Von rechts addieren, ', 'ink'], ['Komma', 'rot', 1], ' bleibt an seiner Stelle'], { g: 21 })) +
    tx(480, 112, 'Multiplizieren: 2,4 · 1,3', { g: 24, w: 700, f: F.orange }) +
    schritt(480, 170, '3', 'orange', [['Ohne Komma rechnen:'], ['24 · 13 = ', ['312', 'orange', 1]]], 23) +
    schritt(480, 260, '4', 'lila', [['Nachkommastellen zählen:'], ['2,', ['4', 'lila', 1], ' → 1   1,', ['3', 'lila', 1], ' → 1   zusammen ', ['2', 'lila', 1]]], 23) +
    schritt(480, 350, '5', 'rot', [['Komma setzen – 2 Stellen von rechts:'], ['2,4 · 1,3 = ', ['3,12', 'rot', 1]]], 23));
}

// ---------- Prozent & Dreisatz ----------
{ // 20 % von 80 € = 16 €
  const x0 = 80, bw = 840, y = 210, n = 5, sw = bw / n;
  let balken = '';
  let euro = '';
  for (let i = 0; i < n; i++) { balken += `<rect x="${x0 + i * sw}" y="${y}" width="${sw}" height="64" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>` +
    tx(x0 + (i + 1) * sw, y - 22, (i + 1) * 20 + ' %', { g: 22, f: F.blau, a: 'middle', w: 600 });
    euro += tx(x0 + (i + 1) * sw, y + 88, (i + 1) * 16 + ' €', { g: 22, f: F.orange, a: 'middle', w: 600 }); }
  neu('Prozent & Dreisatz (Kl. 7)', 'proz', 'Prozentrechnung', 'Klasse 7', 560,
    txs(60, 120, ['Wie viel sind ', ['20 %', 'blau', 1], ' von ', ['80 €', 'orange', 1], '?'], { g: 28 }) +
    st(1, mark(40, 162, 920, 118, true) + tx(x0, y - 22, '0 %', { g: 22, f: F.blau, a: 'middle' }) + balken + tx(940, 120, '① 100 % in 5 Teile zu je 20 %', { g: 21, f: F.grau, a: 'end' })) +
    st(2, mark(40, 278, 920, 40, true) + tx(x0, y + 88, '0 €', { g: 22, f: F.orange, a: 'middle' }) + euro + `<rect x="${x0}" y="${y}" width="${sw}" height="64" fill="#bfdbfe" stroke="#64748b" stroke-width="2"/>` +
      tx(x0 + sw / 2, y + 32, '16 €', { g: 26, w: 800, f: F.rot, a: 'middle' }) + tx(940, 330, '② 80 € : 5 = 16 € je Teil', { g: 21, f: F.grau, a: 'end' })) +
    st(3, mark(40, 340, 920, 112) + txs(60, 360, [['Grundwert G', 'orange', 1], ' = 80 € (das Ganze = 100 %)'], { g: 23 }) +
      txs(60, 395, [['Prozentsatz p %', 'blau', 1], ' = 20 %'], { g: 23 }) +
      txs(60, 430, [['Prozentwert W', 'rot', 1], ' = gesuchter Anteil'], { g: 23 }) +
      kasten(540, 345, 400, 100) + txs(560, 375, [['W', 'rot', 1], ' = ', ['G', 'orange', 1], ' · ', ['p', 'blau', 1], ' : 100'], { g: 26 }) + txs(560, 415, ['= 80 € · 20 : 100 = ', ['16 €', 'rot', 1]], { g: 26 })) +
    st(4, mark(52, 469, 896, 62) + kasten(60, 475, 880, 50) + txs(80, 500, [['Kurz: ', 'lila', 1], '20 % = 1/5  →  80 € : 5 = 16 €  ✓'], { g: 23 })));
}
{ // Dreisatz 3 Hefte 4,50 € → 1 Heft 1,50 € → 5 Hefte 7,50 €
  const xl = 330, xr = 610, x1 = 210, x2 = 730, ys = [215, 295, 375];
  const bogenL = (ya, yb, txt, f) => pfeil(`M${x1} ${ya + 8} Q${x1 - 60} ${(ya + yb) / 2} ${x1} ${yb - 8}`, f, 3) + tx(x1 - 70, (ya + yb) / 2, txt, { g: 26, w: 700, f: F[f], a: 'end' });
  const bogenR = (ya, yb, txt, f) => pfeil(`M${x2} ${ya + 8} Q${x2 + 60} ${(ya + yb) / 2} ${x2} ${yb - 8}`, f, 3) + tx(x2 + 70, (ya + yb) / 2, txt, { g: 26, w: 700, f: F[f] });
  let tab = `<rect x="${x1}" y="140" width="${x2 - x1}" height="275" rx="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>` + ln(470, 140, 470, 415, '#94a3b8', 2) + ln(x1, 175, x2, 175, '#94a3b8', 2) +
    tx(xl, 158, 'Hefte', { g: 22, w: 700, a: 'middle', f: F.grau }) + tx(xr, 158, 'Preis', { g: 22, w: 700, a: 'middle', f: F.grau });
  const zeileT = ([a, b, f], i) => tx(xl, ys[i], a, { g: 34, w: 700, a: 'middle', f: F[f] }) + tx(xr, ys[i], b, { g: 34, w: 700, a: 'middle', f: F[f] });
  const Z3 = [['3', '4,50 €', 'ink'], ['1', '1,50 €', 'blau'], ['5', '7,50 €', 'rot']];
  neu('Prozent & Dreisatz (Kl. 7)', 'dreisatz', 'Dreisatz', 'Klasse 7', 610,
    txs(60, 110, ['3 Hefte kosten 4,50 €. Was kosten ', ['5 Hefte', 'rot', 1], '?'], { g: 26 }) + tab + zeileT(Z3[0], 0) +
    st(1, bogenL(ys[0], ys[1], ': 3', 'blau') + bogenR(ys[0], ys[1], ': 3', 'blau') + zeileT(Z3[1], 1)) +
    st(2, bogenL(ys[1], ys[2], '· 5', 'orange') + bogenR(ys[1], ys[2], '· 5', 'orange') + zeileT(Z3[2], 2)) +
    schritt(60, 455, '1', 'blau', [['Auf ', ['1', 'blau', 1], ' zurückrechnen: 4,50 € : 3 = ', ['1,50 €', 'blau', 1]]], 22) +
    schritt(60, 500, '2', 'orange', [['Auf die gesuchte Menge: 1,50 € · 5 = ', ['7,50 €', 'rot', 1]]], 22) +
    st(3, mark(52, 529, 896, 58) + kasten(60, 535, 880, 46) + txs(80, 558, [['Merke: ', 'lila', 1], 'Was du links rechnest, rechnest du auch rechts.'], { g: 22 })));
}

// ---------- Terme & Gleichungen ----------
{ // 4 + 3 · (8 − 2) = 22
  neu('Terme & Gleichungen (Kl. 7–10)', 'klapu', 'Klammer vor Punkt vor Strich', 'Klasse 5–7', 610,
    kasten(60, 100, 880, 54) + txs(80, 127, [['Reihenfolge:  ', 'lila', 1], ['① Klammern', 'rot', 1], '   →   ', ['② Punkt ( · : )', 'blau', 1], '   →   ', ['③ Strich ( + − )', 'gruen', 1]], { g: 24 }) +
    txs(90, 215, ['4 + 3 · ', ['(8 − 2)', 'rot', 1]], { g: 44 }) +
    st(1, mark(580, 192, 380, 46) + tx(600, 215, '① Klammer zuerst: 8 − 2 = 6', { g: 23, f: F.rot, w: 600 }) + mark(40, 262, 520, 66, true) + txs(60, 295, ['= 4 + ', ['3 · 6', 'blau', 1]], { g: 44 })) +
    st(2, mark(580, 272, 380, 46) + tx(600, 295, '② Punkt vor Strich: 3 · 6 = 18', { g: 23, f: F.blau, w: 600 }) + mark(40, 342, 520, 66, true) + txs(60, 375, ['= ', ['4 + 18', 'gruen', 1]], { g: 44 })) +
    st(3, mark(580, 352, 380, 46) + tx(600, 375, '③ Strich zuletzt: 4 + 18 = 22', { g: 23, f: F.gruen, w: 600 }) + mark(40, 422, 520, 66, true) + txs(60, 455, ['= ', ['22', 'ink', 1]], { g: 44 })) +
    st(4, mark(52, 494, 896, 56) + kasten(60, 500, 880, 44, '#fef2f2', '#fecaca') + txs(80, 522, [['Falsch: ', 'rot', 1], '4 + 3 = 7, dann 7 · 6 = 42  ✗'], { g: 22 })) +
    st(5, mark(44, 556, 912, 38) + txs(60, 575, [['Gleichrangig: ', 'lila', 1], 'von links nach rechts, z. B.  12 : 3 · 2 = 4 · 2 = 8'], { g: 22 })));
}
{ // Terme: 3x + 5 + 2x − 1 = 5x + 4;  3·(x + 4) = 3x + 12;  5 − (x − 2) = 7 − x
  const y = 420;
  neu('Terme & Gleichungen (Kl. 7–10)', 'terme', 'Terme umformen', 'Klasse 7/8', 640,
    txs(60, 110, [['Zusammenfassen: ', 'blau', 1], 'nur gleichartige Glieder (x zu x, Zahl zu Zahl)'], { g: 24 }) +
    txs(80, 175, [['3x', 'blau', 1], ' + ', ['5', 'orange', 1], ' + ', ['2x', 'blau', 1], ' − ', ['1', 'orange', 1]], { g: 40 }) +
    st(1, mark(44, 140, 912, 108, true) + txs(80, 175, [['3x', 'blau', 1], ' + ', ['5', 'orange', 1], ' + ', ['2x', 'blau', 1], ' − ', ['1', 'orange', 1], ' = ', ['5x', 'blau', 1], ' + ', ['4', 'orange', 1]], { g: 40 }) +
      txs(80, 228, [['x-Glieder: ', 'blau', 1], '3x + 2x = 5x       ', ['Zahlen: ', 'orange', 1], '5 − 1 = 4'], { g: 22 })) +
    st(2, mark(44, 270, 912, 190, true) + txs(60, 300, [['Ausmultiplizieren: ', 'gruen', 1], 'jedes Glied in der Klammer wird mal genommen'], { g: 24 }) +
      tx(100, y, '3', { g: 44, w: 700, f: F.gruen, a: 'middle' }) + tx(132, y, '·', { g: 44, a: 'middle' }) + tx(165, y, '(', { g: 44, a: 'middle' }) +
      tx(200, y, 'x', { g: 44, a: 'middle' }) + tx(245, y, '+', { g: 44, a: 'middle' }) + tx(290, y, '4', { g: 44, a: 'middle' }) + tx(325, y, ')', { g: 44, a: 'middle' }) +
      pfeil(`M100 ${y - 28} Q150 ${y - 85} 196 ${y - 30}`, 'gruen', 3) + pfeil(`M100 ${y - 28} Q195 ${y - 120} 286 ${y - 30}`, 'gruen', 3)) +
    st(3, mark(340, 392, 600, 56, true) + txs(350, y, ['= 3 · x + 3 · 4 = ', ['3x + 12', 'gruen', 1]], { g: 40 })) +
    st(4, mark(44, 475, 912, 130, true) + txs(60, 505, [['Minus vor der Klammer: ', 'rot', 1], 'alle Vorzeichen in der Klammer drehen sich um'], { g: 24 }) +
      txs(80, 570, ['5 ', ['−', 'rot', 1], ' (x − 2) = 5 ', ['−', 'rot', 1], ' x ', ['+', 'rot', 1], ' 2 = ', ['7 − x', 'rot', 1]], { g: 40 })));
}
{ // 3x + 5 = 20 → x = 5
  const xe = 400, zeile = (y, l, r) => tx(xe - 22, y, l, { g: 44, a: 'end', w: 600 }) + tx(xe, y, '=', { g: 44, a: 'middle' }) + tx(xe + 22, y, r, { g: 44, w: 600 });
  const op = (y, t, f) => tx(600, y, t, { g: 34, w: 700, f: F[f] });
  neu('Terme & Gleichungen (Kl. 7–10)', 'gleich', 'Gleichungen umformen', 'Klasse 7/8', 600,
    txs(60, 110, [['Ziel: ', 'lila', 1], 'x allein auf eine Seite bringen – mit der ', ['Umkehrrechnung', 'lila', 1], '.'], { g: 24 }) +
    zeile(185, '3x + 5', '20') +
    st(1, mark(180, 152, 760, 148, true) + op(185, '| − 5', 'orange') + pfeil('M590 205 Q560 235 590 260', 'orange', 2.5) + zeile(270, '3x', '15') + tx(700, 185, 'auf beiden Seiten − 5', { g: 21, f: F.orange })) +
    st(2, mark(180, 240, 760, 160, true) + op(270, '| : 3', 'blau') + pfeil('M590 290 Q560 320 590 345', 'blau', 2.5) + tx(700, 270, 'auf beiden Seiten : 3', { g: 21, f: F.blau }) +
      `<rect x="${xe - 110}" y="322" width="220" height="68" rx="12" fill="#dcfce7" stroke="${F.gruen}" stroke-width="3"/>` + zeile(356, 'x', '5')) +
    st(3, mark(44, 418, 912, 82) + txs(60, 440, [['Wie bei einer Waage: ', 'orange', 1], 'Was du links machst, machst du auch rechts.'], { g: 23 }) +
      txs(60, 480, [['Umkehrrechnung: ', 'blau', 1], 'plus ↔ minus,   mal ↔ geteilt'], { g: 23 })) +
    st(4, mark(52, 509, 896, 64) + kasten(60, 515, 880, 52) + txs(80, 541, [['Probe: ', 'lila', 1], '3 · 5 + 5 = 15 + 5 = 20 ✓'], { g: 23 })));
}
T.RECHENWEGE = R;
T.rwSvg = { karte, tx, txs, ln, kasten, F, W }; // für den Teiler-Finder

// ---------- Seitenleiste: eigenes Fenster wie die Emojis ----------
const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
const url = r => svgUrl(r.svg);
// Schritt-Ansicht: großes Fenster, mit ◀ ▶ Schritt für Schritt aufdecken (auch mit Pfeiltasten)
function schritte(r) {
  let k = 0; const n = r.frames.length - 1;
  const bild = h('img', { class: 'rw-schritt-bild', alt: r.name }), stand = h('span', { class: 'rw-stand' });
  const zurueck = h('button', { class: 'big', onclick: () => geh(k - 1) }, '◀ Zurück'), weiter = h('button', { class: 'big prim', onclick: () => geh(k + 1) }, 'Weiter ▶');
  const geh = i => { k = T.clamp(i, 0, n); bild.src = svgUrl(r.frames[k]); stand.textContent = k === 0 ? 'Aufgabe' : k === n ? 'fertig ✓' : `Schritt ${k} von ${n - 1}`; zurueck.disabled = k === 0; weiter.disabled = k === n; };
  const w = T.widget('📘 ' + r.name, [
    h('div', { class: 'row rw-schritt-leiste' }, zurueck, stand, weiter, h('button', { class: 'big', onclick: () => geh(n) }, 'Alles zeigen'),
      h('span', { style: { flex: 1 } }),
      h('button', { class: 'big', title: 'Diesen Stand groß auf die Tafel', onclick: () => T.addBild(svgUrl(r.frames[k]), W, r.h, null, 0.92, 1.6) }, '⤴ Auf die Tafel'),
      h('button', { class: 'big', title: 'Mit allen Schritten in die Notizen – dort ein- und ausblenden und durchblättern', onclick: () => T.notizHilfe(r.name, url(r), W, r.h, r.frames.map(svgUrl)) }, '📝 Notizen')),
    bild], Math.max(10, innerWidth / 2 - 520), 64);
  const taste = e => { if (!w.isConnected) { removeEventListener('keydown', taste, true); return; } if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') geh(k + 1); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') geh(k - 1); else return; e.preventDefault(); e.stopImmediatePropagation(); };
  addEventListener('keydown', taste, true); w.onclose = () => removeEventListener('keydown', taste, true);
  geh(0);
}
/* Weitere Mathe-Erklärungen der App (nur verlinkt, kein doppelter Inhalt): Geometrie-Erklärtafeln und der Teiler-Finder */
const EXTRA = [
  { id: 'x:teiler', gruppe: 'Teilbarkeit (Kl. 5/6)', name: 'Vielfache & Teiler (ggT, kgV)', em: '🔢', da: () => !!T.teilerFinder, run: () => T.teilerFinder() },
  { id: 'x:geoerkl', gruppe: 'Geometrie', name: 'Geodreieck erklärt', k: 'geoerkl', da: () => !!T.geoErklMenue, run: () => T.geoErklMenue() },
  { id: 'x:dreieckerkl', gruppe: 'Geometrie', name: 'Dreiecke erklärt', k: 'dreieckerkl', da: () => !!T.dreieckErklMenue, run: () => T.dreieckErklMenue() },
  { id: 'x:schraegerkl', gruppe: 'Geometrie', name: 'Schrägbild zeichnen', k: 'schraegerkl', da: () => !!T.schraegErklMenue, run: () => T.schraegErklMenue() }];
T.RECHENWEGE_EXTRA = EXTRA;
const extraNach = id => EXTRA.find(x => x.id === id && x.da());
T.rechenwegSchritte = id => { const x = extraNach(id); if (x) return x.run(); const r = R.find(x => x.id === id); if (r && r.frames) schritte(r); else if (r) T.addBild(url(r), W, r.h, null, 0.92, 1.6); };
/* ⭐ Favoriten (Einfügen-Leiste): einzelne Erklärung bzw. alle Erklärungen */
T.FAV_SONDER = T.FAV_SONDER || [];
T.FAV_SONDER.push({ prefix: 'einfuegen:rw:', sym: '📘', name: id => { const x = extraNach(id); if (x) return x.name; const r = R.find(x => x.id === id); return r && r.name; }, run: id => T.rechenwegSchritte(id) },
  { prefix: 'einfuegen:rwalle', sym: '📘', name: () => 'Erklärungen / Rechenwege', run: () => { T.rwZurueck = 'einfuegen'; T.zeigeDock('mathe-rechenwege'); } });
/* Reihenfolge der Themen: Rechnen · Teilbarkeit · Brüche · Prozent · Terme · Geometrie */
const THEMEN = ['Schriftlich rechnen', 'Kopfrechnen', 'Teilbarkeit', 'Brüche', 'Prozent', 'Terme', 'Geometrie'];
const rang = t => { const i = THEMEN.findIndex(x => t.startsWith(x)); return i < 0 ? 99 : i; };
T.rechenwegePanel = () => {
  const gruppen = [];
  const dazu = (gruppe, el) => { let g = gruppen.find(x => x[0] === gruppe); if (!g) gruppen.push(g = [gruppe, []]); g[1].push(el); };
  for (const r of R) dazu(r.gruppe, h('div', { class: 'tile rw-tile', role: 'button', 'data-rw': r.id, title: r.name + (r.frames ? ' – Schritt für Schritt' : ' – auf die Tafel'), onclick: () => r.frames ? schritte(r) : T.addBild(url(r), W, r.h, null, 0.92, 1.6) },
    h('img', { src: url(r), alt: '' }), r.name,
    h('button', { class: 'rw-notiz', title: 'In die Notizen legen – dort ein- und ausblenden', onclick: e => { e.stopPropagation(); T.notizHilfe(r.name, url(r), W, r.h, r.frames && r.frames.map(svgUrl)); } }, '📝')));
  for (const x of EXTRA) if (x.da()) dazu(x.gruppe, h('div', { class: 'tile rw-tile', role: 'button', 'data-rw': x.id, title: x.name, onclick: () => x.run() },
    x.k && T.thumb ? h('img', { src: T.thumb(x.k), alt: '' }) : h('div', { class: 'em' }, x.em || '📘'), x.name));
  gruppen.sort((a, b) => rang(a[0]) - rang(b[0]));
  const zurueck = T.rwZurueck === 'einfuegen' ? 'einfuegen' : 'aufgaben'; /* geöffnet über Einfügen › Mathe bzw. Mathe › 📘 Erklärungen */
  return [h('button', { class: 'big', onclick: () => T.zeigeDock(zurueck) }, zurueck === 'einfuegen' ? '← Einfügen' : '← Mathe'),
    ...gruppen.flatMap(([titel, liste]) => [h('h3', {}, titel), h('div', { class: 'tiles rw-tiles' }, ...liste)]),
    h('p', { class: 'hint' }, 'Kachel antippen: Erklärung Schritt für Schritt durchklicken (Weiter ▶, Pfeiltasten). ⤴ Auf die Tafel legt den gezeigten Stand groß auf die Tafel, 📝 legt sie in die Notizen – dort über den Reiter am rechten Rand ein- und ausblenden und durchblättern. ☆ = in die Einfügen-Leiste. Alle Beispiele sind nachgerechnet.')];
};
})();
