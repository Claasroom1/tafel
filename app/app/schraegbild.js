// Tafel-App – 🧊 Schrägbild zeichnen: Schritt für Schritt (selbst gezeichnete Bildtafeln auf Karopapier, SVG)
// Quader (5 cm lang, 3 cm hoch, 4 cm tief) oder Würfel (Kantenlänge 4 cm).
// Regeln · ① Vorderfläche · ② Kanten nach hinten · ③ Hinterfläche · ④ verdeckte Kanten – der neue Teil ist rot, Fertiges blau.
// Karopapier: 1 Kästchen = 0,5 cm. Nach hinten: im 45°-Winkel und auf die Hälfte verkürzt (4 cm Tiefe → 2 cm zeichnen).
'use strict';
(function () {
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const W = 1000, BLAU = '#1565c0', ROT = '#d32f2f', RAND = '#3a6d99', U = 30; /* U: ein Kästchen (0,5 cm) in Bildpunkten */
const KOERPER = { /* Maße in cm: Länge, Höhe, Tiefe */
  quader: { name: 'Quader', l: 5, h: 3, t: 4, X0: 230, Y0: 450, text: 'Quader – 5 cm lang, 3 cm hoch, 4 cm tief' },
  wuerfel: { name: 'Würfel', l: 4, h: 4, t: 4, X0: 330, Y0: 455, text: 'Würfel – alle Kanten 4 cm lang' } };
const linie = (a, b, col, w, extra = '') => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const nr = (x, y, n) => `<circle cx="${f(x)}" cy="${f(y)}" r="19" fill="${ROT}"/><text x="${f(x)}" y="${f(y)}" font-size="22" fill="#fff" text-anchor="middle" dominant-baseline="central" font-weight="700">${n}</text>`;
const STRICH = 'stroke-dasharray="12 9"';
function karo() {
  let s = `<rect x="30" y="70" width="${W - 60}" height="420" rx="10" fill="#fbfdff" stroke="#c9d8e8" stroke-width="1.5"/>`;
  for (let x = 30 + U; x < W - 30; x += U) s += `<line x1="${x}" y1="72" x2="${x}" y2="488" stroke="#bcd3ea" stroke-width="1"/>`;
  for (let y = 70 + U; y < 490; y += U) s += `<line x1="32" y1="${y}" x2="${W - 32}" y2="${y}" stroke="#bcd3ea" stroke-width="1"/>`;
  return s;
}
// Kanten: [von, nach, verdeckt?] – vorne A B C D (unten links, unten rechts, oben rechts, oben links), hinten E F G Hh entsprechend
const VORNE = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']];
const HINTEN_TIEF = [['A', 'E', true], ['B', 'F'], ['C', 'G'], ['D', 'Hh']];
const HINTEN = [['E', 'F', true], ['F', 'G'], ['G', 'Hh'], ['Hh', 'E', true]];
function zeichner(K) {
  const L = K.l * 2, H = K.h * 2, Tz = K.t / 2, ds = Tz * 2 * U * Math.SQRT1_2; /* Kästchen; Tiefe halb so lang (cm), schräg: Versatz je Richtung */
  const P = (k, l) => [K.X0 + k * U, K.Y0 - l * U];
  const E = { A: P(0, 0), B: P(L, 0), C: P(L, H), D: P(0, H) };
  for (const [k, n] of [['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'Hh']]) E[n] = [E[k][0] + ds, E[k][1] - ds];
  /* gestrichelt: an beiden Ecken beginnt bzw. endet die Linie mit einem Strich, dazwischen gleichmäßig verteilt */
  const strichMuster = (a, b) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]), g = 9, n = Math.max(2, Math.round((len + g) / (12 + g))), d = (len - (n - 1) * g) / n; return `stroke-dasharray="${f(d)} ${g}"`; };
  const kanten = (liste, col, w, gestrichelt) => liste.map(([a, b, v]) => linie(E[a], E[b], col, w, gestrichelt && v ? strichMuster(E[a], E[b]) : '')).join('');
  const punkte = col => Object.values(E).map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="4.5" fill="${col}"/>`).join('');
  const masse = () => text((E.A[0] + E.B[0]) / 2 - 26, E.A[1] + 22, K.l + ' cm', 22, '#334155', 'font-weight="700"') + text(E.A[0] - 70, (E.A[1] + E.D[1]) / 2, K.h + ' cm', 22, '#334155', 'font-weight="700"');
  const tiefeText = () => text(E.F[0] + 16, E.B[1] - ds / 2 - 6, K.t + ' cm Tiefe → ' + String(Tz).replace('.', ',') + ' cm (die Hälfte)', 20, ROT, 'font-weight="700"');
  const winkel45 = () => { const [x, y] = E.B, r = 44; return `<path d="M ${x + r} ${y} A ${r} ${r} 0 0 0 ${f(x + r * Math.SQRT1_2)} ${f(y - r * Math.SQRT1_2)}" fill="none" stroke="${ROT}" stroke-width="3"/>` + linie([x, y], [x + 70, y], ROT, 2, 'stroke-dasharray="4 4"') + text(x + 50, y - 16, '45°', 20, ROT, 'font-weight="700"'); };
  const tafel = (titel, bild, schritte, Pal) => {
    const top = 528, zh = 40, Hh = top + schritte.length * zh + 22;
    let s = `<rect x="0" y="0" width="${W}" height="${Hh}" rx="18" fill="${Pal.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 38, '🧊 Schrägbild ' + K.name + ': ' + titel, 32, Pal.ink, 'font-weight="700"') + karo() + bild;
    schritte.forEach((z, i) => { s += text(30, top + i * zh, z, 23, Pal.ink); });
    return { svg: T._svg.doc(W, Hh, s), w: W, h: Hh };
  };
  const wuerfel = K.l === K.h && K.h === K.t;
  return {
    regeln: Pal => tafel('Die Regeln', kanten(VORNE, BLAU, 4) + kanten(HINTEN_TIEF, BLAU, 4, true) + kanten(HINTEN, BLAU, 4, true) + punkte(BLAU) + masse() + winkel45() + tiefeText(), [
      '1. Die Vorderfläche wird in wahrer Größe gezeichnet' + (wuerfel ? ' (Quadrat mit echten Maßen).' : ' (Rechteck mit echten Maßen).'),
      '2. Kanten nach hinten: schräg im 45°-Winkel und auf die Hälfte verkürzt –',
      '    ' + K.t + ' cm Tiefe werden ' + String(Tz).replace('.', ',') + ' cm lang gezeichnet (mit dem Geodreieck messen).',
      '3. Verdeckte (unsichtbare) Kanten werden gestrichelt gezeichnet.',
      'Beispiel: ' + K.text + '.'], Pal),
    s1: Pal => tafel('① Vorderfläche', kanten(VORNE, ROT, 5) + masse() + nr(E.A[0] - 30, E.A[1] + 30, 1), [
      '1. Die Vorderfläche als ' + (wuerfel ? 'Quadrat' : 'Rechteck') + ' in wahrer Größe zeichnen:',
      '    ' + (wuerfel ? K.l + ' cm × ' + K.h + ' cm = ' + L + ' × ' + H + ' Kästchen.' : K.l + ' cm lang = ' + L + ' Kästchen, ' + K.h + ' cm hoch = ' + H + ' Kästchen.'),
      'Tipp: Mit Bleistift dünn vorzeichnen – nachgezogen wird am Schluss.'], Pal),
    s2: Pal => tafel('② Kanten nach hinten', kanten(VORNE, BLAU, 4) + kanten(HINTEN_TIEF, ROT, 4, true) + winkel45() + tiefeText() + nr(E.B[0] - 30, E.B[1] + 26, 2), [
      '2. Von jeder Ecke eine Kante schräg nach rechts oben zeichnen (45°, Geodreieck).',
      '    Tiefe ' + K.t + ' cm → halb so lang: ' + String(Tz).replace('.', ',') + ' cm abmessen.',
      'Die Kante unten links ist verdeckt: gleich gestrichelt zeichnen.' + (wuerfel ? ' Kürzer aussehen ist richtig so.' : '')], Pal),
    s3: Pal => tafel('③ Hinterfläche', kanten(VORNE, BLAU, 4) + kanten(HINTEN_TIEF, BLAU, 4, true) + kanten(HINTEN, ROT, 4, true) + nr(E.Hh[0] - 34, E.Hh[1] - 24, 3), [
      '3. Die Endpunkte verbinden: Es entsteht die Hinterfläche (' + K.l + ' cm × ' + K.h + ' cm).',
      '    Die zwei verdeckten Kanten (unten und links) gleich gestrichelt zeichnen.',
      'Prüfen: Gegenüberliegende Kanten sind parallel und gleich lang.'], Pal),
    s4: Pal => tafel('④ Verdeckte Kanten prüfen', kanten(VORNE, BLAU, 5) + kanten(HINTEN_TIEF.filter(k => !k[2]), BLAU, 5) + kanten(HINTEN.filter(k => !k[2]), BLAU, 5) +
      kanten(HINTEN_TIEF.filter(k => k[2]).concat(HINTEN.filter(k => k[2])), ROT, 4, true) + nr(E.E[0] + 26, E.E[1] + 30, 4), [
      '4. Die drei verdeckten Kanten treffen sich hinten unten links – alle gestrichelt.',
      '    An jeder Ecke beginnt und endet die Linie mit einem Strich, dazwischen gleichmäßig.',
      'Zum Schluss die sichtbaren Kanten kräftig nachziehen – fertig!'], Pal) };
}
const ZEICHNER = { quader: zeichner(KOERPER.quader), wuerfel: zeichner(KOERPER.wuerfel) };
const THEMEN = [['regeln', 'Die Regeln'], ['s1', '① Vorderfläche'], ['s2', '② Kanten nach hinten'], ['s3', '③ Hinterfläche'], ['s4', '④ Verdeckte Kanten prüfen']];
T.BAUSTEINE.schraegerkl = { name: 'Schrägbild zeichnen', gruppe: 'Mathe', def: { thema: 'regeln', koerper: 'quader' },
  felder: [{ k: 'koerper', l: 'Körper', typ: 'auswahl', opts: [['quader', 'Quader'], ['wuerfel', 'Würfel']] }, { k: 'thema', l: 'Schritt', typ: 'auswahl', opts: THEMEN }],
  gen: (d, Pal) => { const Z = ZEICHNER[d.koerper] || ZEICHNER.quader; return (Z[d.thema] || Z.regeln)(Pal); } };
// Auswahl: Körper wählen, dann eine Tafel einfügen oder alle auf neue Seiten (Schritt für Schritt blättern)
let koerper = 'quader';
T.schraegErklMenue = () => {
  const h = T.h, d = k => ({ thema: k, koerper }), bild = k => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj('schraegerkl', d(k), false).svg);
  const einfuegen = k => { T.closeDlg(); const g = T.genObj('schraegerkl', d(k), false), r = T.viewRect(), fz = Math.min(1, (r.x1 - r.x0) * 0.8 / g.w, (r.y1 - r.y0) * 0.8 / g.h), [cx, cy] = T.viewCenter();
    T.snap(); T.addItem({ t: 'o', id: T.uid(), k: 'schraegerkl', d: d(k), x: cx - g.w * fz / 2, y: cy - g.h * fz / 2, w: g.w * fz, h: g.h * fz, r: 0 }); T.render(); };
  const alle = () => { T.closeDlg(); T.snap(); const S = T.S, start = S.page + 1;
    THEMEN.forEach(([k, l], i) => { const g = T.genObj('schraegerkl', d(k), false), np = { ...T.newPage('weiss'), titel: 'Schrägbild ' + KOERPER[koerper].name + ': ' + l };
      np.items.push({ t: 'o', id: T.uid(), k: 'schraegerkl', d: d(k), x: 40, y: 30, w: g.w, h: g.h, r: 0 }); S.board.pages.splice(start + i, 0, np); });
    T.gotoPage(start); T.toast('5 Seiten zum Schrägbild eingefügt – mit ◀ ▶ Schritt für Schritt blättern.', 3000); };
  T.openDlg([h('h2', {}, '🧊 Schrägbild zeichnen – Schritt für Schritt'), h('p', { class: 'hint' }, 'Große Bildtafeln auf Karopapier. Erst den Körper wählen, dann eine Tafel antippen – oder alle nacheinander auf neue Seiten zum Blättern.'),
    h('div', { class: 'row', style: { gap: '6px', marginBottom: '8px' } }, ...Object.entries(KOERPER).map(([k, K]) => h('button', { class: 'big' + (koerper === k ? ' on' : ''), onclick: () => { koerper = k; T.schraegErklMenue(); } }, (k === 'wuerfel' ? '🎲 ' : '▭ ') + K.name))),
    h('div', { class: 'tiles' }, ...THEMEN.map(([k, l]) => h('button', { class: 'tile', onclick: () => einfuegen(k) }, h('img', { src: bild(k), alt: '' }), l))),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Schließen'), h('button', { class: 'big', onclick: () => T.tafelnAufEineSeite('schraegerkl', THEMEN.map(([k]) => d(k))) }, '📜 Alle auf eine Seite'), h('button', { class: 'big prim', onclick: alle }, '📄 Alle 5 auf neue Seiten'))]);
};
})();
