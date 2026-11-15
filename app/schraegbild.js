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
const zf = v => String(v).replace('.', ',');
const ORANGE = '#ef6c00';
const knopf = (x, y, z) => `<circle cx="${f(x)}" cy="${f(y)}" r="28" fill="none" stroke="${ORANGE}" stroke-width="3" stroke-opacity=".45"/><circle cx="${f(x)}" cy="${f(y)}" r="20" fill="${ORANGE}" fill-opacity=".92" stroke="#fff" stroke-width="4"/>` +
  `<text x="${f(x)}" y="${f(y + 1)}" font-size="22" fill="#fff" text-anchor="middle" dominant-baseline="central" font-weight="700">${z}</text>`;
function zeichner(K) {
  const L = K.l * 2, H = K.h * 2, Tz = K.t / 2, ds = Tz * 2 * U * Math.SQRT1_2; /* Kästchen; Tiefe halb so lang (cm), schräg: Versatz je Richtung */
  const P = (k, l) => [K.X0 + k * U, K.Y0 - l * U];
  const E = { A: P(0, 0), B: P(L, 0), C: P(L, H), D: P(0, H) };
  for (const [k, n] of [['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'Hh']]) E[n] = [E[k][0] + ds, E[k][1] - ds];
  /* gestrichelt: an beiden Ecken beginnt bzw. endet die Linie mit einem Strich, dazwischen gleichmäßig verteilt */
  const strichMuster = (a, b) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]), g = 9, n = Math.max(2, Math.round((len + g) / (12 + g))), d = (len - (n - 1) * g) / n; return `stroke-dasharray="${f(d)} ${g}"`; };
  const kanten = (liste, col, w, gestrichelt) => liste.map(([a, b, v]) => linie(E[a], E[b], col, w, gestrichelt && v ? strichMuster(E[a], E[b]) : '')).join('');
  const punkte = col => Object.values(E).map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="4.5" fill="${col}"/>`).join('');
  const masse = () => text((E.A[0] + E.B[0]) / 2 - 26, E.A[1] + 22, zf(K.l) + ' cm', 22, '#334155', 'font-weight="700"') + text(E.A[0] - 70, (E.A[1] + E.D[1]) / 2, zf(K.h) + ' cm', 22, '#334155', 'font-weight="700"');
  const tiefeText = () => { const t = zf(K.t) + ' cm Tiefe → ' + String(Tz).replace('.', ',') + ' cm (die Hälfte)', b = breite(t, 20);
    if (E.F[0] + 16 + b <= 985) return text(E.F[0] + 16, E.B[1] - ds / 2 - 6, t, 20, ROT, 'font-weight="700"');
    return text(Math.max(40 + b / 2, Math.min(960 - b / 2, (E.Hh[0] + E.G[0]) / 2)), E.G[1] - 22, t, 20, ROT, 'font-weight="700" text-anchor="middle"'); }; /* großer Körper: Text über die hintere Kante */
  /* ✋ Griffe (nur Regeln-Tafel, wenn eingeschaltet): Länge an der rechten Vorderkante, Höhe an der oberen, Tiefe an der hinteren oberen Ecke G (45°) */
  const griffe = () => K.wuerfel ? [{ id: 'mA', x: E.B[0], y: (E.B[1] + E.C[1]) / 2, z: '↔' }]
    : [{ id: 'mL', x: E.B[0], y: (E.B[1] + E.C[1]) / 2, z: '↔' }, { id: 'mH', x: (E.D[0] + E.C[0]) / 2, y: E.D[1], z: '↕' }, { id: 'mT', x: E.G[0], y: E.G[1], z: '⤢' }];
  const winkel45 = () => { const [x, y] = E.B, r = 44; return `<path d="M ${x + r} ${y} A ${r} ${r} 0 0 0 ${f(x + r * Math.SQRT1_2)} ${f(y - r * Math.SQRT1_2)}" fill="none" stroke="${ROT}" stroke-width="3"/>` + linie([x, y], [x + 70, y], ROT, 2, 'stroke-dasharray="4 4"') + text(x + 50, y - 16, '45°', 20, ROT, 'font-weight="700"'); };
  const tafel = (titel, bild, schritte, Pal) => {
    const top = 528, zh = 40, Hh = top + schritte.length * zh + 22;
    let s = `<rect x="0" y="0" width="${W}" height="${Hh}" rx="18" fill="${Pal.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 38, '🧊 Schrägbild ' + K.name + ': ' + titel, 32, Pal.ink, 'font-weight="700"') + karo() + bild;
    schritte.forEach((z, i) => { s += text(30, top + i * zh, z, 23, Pal.ink); });
    return { svg: T._svg.doc(W, Hh, s), w: W, h: Hh };
  };
  const wuerfel = K.l === K.h && K.h === K.t;
  return {
    regeln: (Pal, mitGriffen) => { const gr = mitGriffen ? griffe() : [];
      const res = tafel('Die Regeln', kanten(VORNE, BLAU, 4) + kanten(HINTEN_TIEF, BLAU, 4, true) + kanten(HINTEN, BLAU, 4, true) + punkte(BLAU) + masse() + winkel45() + tiefeText() + gr.map(q => knopf(q.x, q.y, q.z)).join(''), [
      '1. Die Vorderfläche wird in wahrer Größe gezeichnet' + (wuerfel ? ' (Quadrat mit echten Maßen).' : ' (Rechteck mit echten Maßen).'),
      '2. Kanten nach hinten: schräg im 45°-Winkel und auf die Hälfte verkürzt –',
      '    ' + zf(K.t) + ' cm Tiefe werden ' + String(Tz).replace('.', ',') + ' cm lang gezeichnet (mit dem Geodreieck messen).',
      '3. Verdeckte (unsichtbare) Kanten werden gestrichelt gezeichnet.',
      'Beispiel: ' + K.text + '.'], Pal);
      return gr.length ? { ...res, teile: gr.map(q => ({ id: q.id, x: q.x - 28, y: q.y - 28, w: 56, h: 56, zieh: true })) } : res; },
    s1: Pal => tafel('① Vorderfläche', kanten(VORNE, ROT, 5) + masse() + nr(E.A[0] - 30, E.A[1] + 30, 1), [
      '1. Die Vorderfläche als ' + (wuerfel ? 'Quadrat' : 'Rechteck') + ' in wahrer Größe zeichnen:',
      '    ' + (wuerfel ? zf(K.l) + ' cm × ' + zf(K.h) + ' cm = ' + L + ' × ' + H + ' Kästchen.' : zf(K.l) + ' cm lang = ' + L + ' Kästchen, ' + zf(K.h) + ' cm hoch = ' + H + ' Kästchen.'),
      'Tipp: Mit Bleistift dünn vorzeichnen – nachgezogen wird am Schluss.'], Pal),
    s2: Pal => tafel('② Kanten nach hinten', kanten(VORNE, BLAU, 4) + kanten(HINTEN_TIEF, ROT, 4, true) + winkel45() + tiefeText() + nr(E.B[0] - 30, E.B[1] + 26, 2), [
      '2. Von jeder Ecke eine Kante schräg nach rechts oben zeichnen (45°, Geodreieck).',
      '    Tiefe ' + zf(K.t) + ' cm → halb so lang: ' + String(Tz).replace('.', ',') + ' cm abmessen.',
      'Die Kante unten links ist verdeckt: gleich gestrichelt zeichnen.' + (wuerfel ? ' Kürzer aussehen ist richtig so.' : '')], Pal),
    s3: Pal => tafel('③ Hinterfläche', kanten(VORNE, BLAU, 4) + kanten(HINTEN_TIEF, BLAU, 4, true) + kanten(HINTEN, ROT, 4, true) + nr(E.Hh[0] - 34, E.Hh[1] - 24, 3), [
      '3. Die Endpunkte verbinden: Es entsteht die Hinterfläche (' + zf(K.l) + ' cm × ' + zf(K.h) + ' cm).',
      '    Die zwei verdeckten Kanten (unten und links) gleich gestrichelt zeichnen.',
      'Prüfen: Gegenüberliegende Kanten sind parallel und gleich lang.'], Pal),
    s4: Pal => tafel('④ Verdeckte Kanten prüfen', kanten(VORNE, BLAU, 5) + kanten(HINTEN_TIEF.filter(k => !k[2]), BLAU, 5) + kanten(HINTEN.filter(k => !k[2]), BLAU, 5) +
      kanten(HINTEN_TIEF.filter(k => k[2]).concat(HINTEN.filter(k => k[2])), ROT, 4, true) + nr(E.E[0] + 26, E.E[1] + 30, 4), [
      '4. Die drei verdeckten Kanten treffen sich hinten unten links – alle gestrichelt.',
      '    An jeder Ecke beginnt und endet die Linie mit einem Strich, dazwischen gleichmäßig.',
      'Zum Schluss die sichtbaren Kanten kräftig nachziehen – fertig!'], Pal) };
}
// Maße aus d (l, h, t in cm; Würfel: l für alle Kanten) – ohne Angabe die bisherigen Beispielmaße; 0,5-cm-Raster (= 1 Kästchen), so begrenzt, dass alles auf das Karopapier passt
const breite = (t, fs) => { try { const c = T._mctx || (T._mctx = document.createElement('canvas').getContext('2d')); c.font = `700 ${fs}px Segoe UI`; return c.measureText(t).width; } catch (e) { return t.length * fs * 0.52; } };
const passt = K => { const ds = K.t * U * Math.SQRT1_2, rechts = K.X0 + K.l * 2 * U + ds;
  return rechts <= 950 && K.Y0 - K.h * 2 * U - ds >= 104; };
const istStd = K => { const S = K.wuerfel ? KOERPER.wuerfel : KOERPER.quader; return K.l === S.l && K.h === S.h && K.t === S.t; };
function massK(koerper, l, h, t) {
  const S = koerper === 'wuerfel' ? KOERPER.wuerfel : KOERPER.quader, w = S === KOERPER.wuerfel;
  const K = w ? { ...S, l, h: l, t: l, wuerfel: true, text: 'Würfel – alle Kanten ' + zf(l) + ' cm lang' } : { ...S, l, h, t, text: 'Quader – ' + zf(l) + ' cm lang, ' + zf(h) + ' cm hoch, ' + zf(t) + ' cm tief' };
  return K;
}
function masseVon(d) {
  const w = d.koerper === 'wuerfel', S = w ? KOERPER.wuerfel : KOERPER.quader, z = (v, std) => v != null && v !== '' && isFinite(+v) ? Math.max(1, Math.min(12, Math.round(+v * 2) / 2)) : std;
  let l = z(d.l, S.l), h = w ? l : z(d.h, S.h), t = w ? l : z(d.t, S.t), K = massK(d.koerper, l, h, t);
  for (let i = 0; i < 80 && !istStd(K) && !passt(K); i++) { /* zu groß eingetragen: schrittweise verkleinern */
    if (w) l -= 0.5; else if (K.Y0 - K.h * 2 * U - K.t * U * Math.SQRT1_2 < 104 && h > 1) h -= 0.5; else if (l > 1) l -= 0.5; else if (t > 1) t -= 0.5; else break;
    K = massK(d.koerper, Math.max(1, l), Math.max(1, h), Math.max(1, t));
  }
  return K;
}
function masseZiehen(d, id, sx, sy) {
  if (d.thema !== 'regeln' || !d.griffe || !isFinite(sx) || !isFinite(sy)) return null;
  const K = masseVon(d), ds = K.t * U * Math.SQRT1_2, Cx = K.X0 + K.l * 2 * U, Cy = K.Y0 - K.h * 2 * U, halb = v => Math.round(v * 2) / 2;
  let k, v;
  if (id === 'mL' || id === 'mA') { k = 'l'; v = halb((sx - K.X0) / (2 * U)); }
  else if (id === 'mH') { k = 'h'; v = halb((K.Y0 - sy) / (2 * U)); }
  else if (id === 'mT') { k = 't'; v = halb(((sx - Cx) - (sy - Cy)) * Math.SQRT1_2 / U); } /* Länge von C aus entlang 45° (in Bildpunkten) = Tiefe · U, denn gezeichnet wird die halbe Tiefe */
  else return null;
  v = Math.max(1, Math.min(12, v));
  const neu = m => massK(d.koerper, m.l, m.h, m.t), M = { l: K.l, h: K.h, t: K.t };
  M[k] = v; if (K.wuerfel) M.h = M.t = M.l = v;
  while (!passt(neu(M)) && M[k] > 1) { M[k] -= 0.5; if (K.wuerfel) M.h = M.t = M.l = M[k]; }
  if (!passt(neu(M)) || M[k] === K[k]) return null;
  return K.wuerfel ? { ...d, l: M.l } : { ...d, l: M.l, h: M.h, t: M.t };
}
const THEMEN = [['regeln', 'Die Regeln'], ['s1', '① Vorderfläche'], ['s2', '② Kanten nach hinten'], ['s3', '③ Hinterfläche'], ['s4', '④ Verdeckte Kanten prüfen']];
T.BAUSTEINE.schraegerkl = { name: 'Schrägbild zeichnen', gruppe: 'Mathe', def: { thema: 'regeln', koerper: 'quader', griffe: false },
  felder: [{ k: 'koerper', l: 'Körper', typ: 'auswahl', opts: [['quader', 'Quader'], ['wuerfel', 'Würfel']] }, { k: 'thema', l: 'Schritt', typ: 'auswahl', opts: THEMEN },
    { k: 'l', l: 'Länge (cm) – Würfel: Kantenlänge', typ: 'zahl', min: 1, max: 12 }, { k: 'h', l: 'Höhe (cm, Quader)', typ: 'zahl', min: 1, max: 12 }, { k: 't', l: 'Tiefe (cm, Quader)', typ: 'zahl', min: 1, max: 12 },
    { k: 'griffe', l: 'Regeln-Tafel: Maße mit Griffen ziehen', typ: 'check' }],
  gen: (d, Pal) => { const Z = zeichner(masseVon(d)); return d.thema === 'regeln' || !Z[d.thema] ? Z.regeln(Pal, !!d.griffe) : Z[d.thema](Pal); },
  ziehen: (d, id, sx, sy) => masseZiehen(d, id, sx, sy),
  schnell: d => d.thema === 'regeln' || !d.thema ? [{ l: d.griffe ? '✋ Griffe aus' : '✋ Maße ziehen (Griffe)', f: dd => ({ d: { ...dd, griffe: !dd.griffe } }) }] : [] };
// Auswahl: Körper wählen, dann eine Tafel einfügen oder alle auf neue Seiten (Schritt für Schritt blättern)
let koerper = 'quader';
T.schraegErklMenue = () => {
  const h = T.h, d = k => k === 'regeln' ? { thema: k, koerper, griffe: true } : { thema: k, koerper }, /* neu eingefügt: Regeln-Tafel gleich mit Griffen */ bild = k => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj('schraegerkl', d(k), false).svg);
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
