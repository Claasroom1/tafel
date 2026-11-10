// Tafel-App – 📐 Geodreieck erklärt: fünf große Bildtafeln (selbst gezeichnet, SVG) für die Mathe-Tafel
// Aufbau · Strecke messen · Winkel messen · Parallele zeichnen · Senkrechte zeichnen – jeweils Bild + Schritte
'use strict';
(function () {
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const W = 1000, BLAU = '#1565c0', ROT = '#d32f2f', LINIE = '#3a6d99';
// Geodreieck in Zentimeter-Koordinaten (x nach rechts, y nach oben): Zeichenkante von (-8|0) bis (8|0), Spitze (0|8), Nullpunkt (0|0)
function geo(ox, oy, u, rot, P) {
  const a = rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const X = (x, y) => f(ox + u * (x * c - y * s)), Y = (x, y) => f(oy - u * (x * s + y * c));
  const L = (x1, y1, x2, y2, col, w, extra = '') => `<line x1="${X(x1, y1)}" y1="${Y(x1, y1)}" x2="${X(x2, y2)}" y2="${Y(x2, y2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const T = (x, y, t, size, col, extra = '') => `<text x="${X(x, y)}" y="${Y(x, y)}" font-size="${f(size)}" fill="${col}" text-anchor="middle" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
  let o = `<polygon points="${X(-8, 0)},${Y(-8, 0)} ${X(8, 0)},${Y(8, 0)} ${X(0, 8)},${Y(0, 8)}" fill="rgba(186,220,250,.62)" stroke="${LINIE}" stroke-width="2.5" stroke-linejoin="round"/>`;
  for (let k = 1; k <= 4; k++) o += L(-(8 - k) + 0.25, k, (8 - k) - 0.25, k, 'rgba(40,80,120,.45)', 1.6); /* Hilfslinien: parallel zur Zeichenkante */
  o += L(0, 0, 0, 7.6, 'rgba(40,80,120,.7)', 1.8); /* Mittellinie */
  for (let mm = -75; mm <= 75; mm++) { const x = mm / 10, l = mm % 10 === 0 ? 0.42 : mm % 5 === 0 ? 0.28 : 0.16; o += L(x, 0, x, l, '#1d3b57', mm % 10 === 0 ? 1.6 : 1); }
  for (let cm = -7; cm <= 7; cm++) o += T(cm, 0.72, Math.abs(cm), u * 0.36, '#1d3b57', 'font-weight="600"');
  const R = 5.35; /* Winkelskala: Striche alle 5°, Zahlen alle 10° – außen ab rechts, innen ab links */
  for (let g = 0; g <= 180; g += 5) { const t = g * Math.PI / 180, l = g % 10 === 0 ? 0.32 : 0.18; o += L(R * Math.cos(t), R * Math.sin(t), (R - l) * Math.cos(t), (R - l) * Math.sin(t), '#1d3b57', 1.2); }
  for (let g = 20; g <= 160; g += 10) { const t = g * Math.PI / 180; /* 10° und 170° ohne Zahl – dort stehen die Zentimeterzahlen */ o += T(4.75 * Math.cos(t), 4.75 * Math.sin(t), g, u * 0.27, '#1d3b57') + T(4.15 * Math.cos(t), 4.15 * Math.sin(t), 180 - g, u * 0.24, ROT); }
  o += `<circle cx="${X(0, 0)}" cy="${Y(0, 0)}" r="${f(u * 0.12)}" fill="${ROT}"/>`;
  return { svg: o, X, Y, L, T };
}
const kreisNr = (x, y, n) => `<circle cx="${f(x)}" cy="${f(y)}" r="17" fill="${ROT}"/><text x="${f(x)}" y="${f(y)}" font-size="20" fill="#fff" text-anchor="middle" dominant-baseline="central" font-weight="700">${n}</text>`;
const linie = (x1, y1, x2, y2, col, w = 4, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
// Ganze Tafel: Titel, Bild, nummerierte Schritte
function tafel(titel, bild, schritte, P) {
  const top = 520, zh = 40, H = top + schritte.length * zh + 24;
  let s = `<rect x="0" y="0" width="${W}" height="${H}" rx="18" fill="${P.papier}" stroke="${LINIE}" stroke-width="2"/>` + text(30, 40, '📐 Geodreieck: ' + titel, 32, P.ink, 'font-weight="700"') + bild;
  schritte.forEach((z, i) => { s += text(30, top + i * zh, z, 24, P.ink); });
  return { svg: T._svg.doc(W, H, s), w: W, h: H };
}
const THEMEN = [['aufbau', 'Was steht darauf?'], ['strecke', 'Strecke messen'], ['winkel', 'Winkel messen'], ['parallele', 'Parallele zeichnen'], ['senkrechte', 'Senkrechte zeichnen']];
const ZEICHNE = {
  aufbau: P => { const g = geo(500, 440, 40, 0, P);
    const b = g.svg + kreisNr(g.X(6.2, -0.75), g.Y(6.2, -0.75), 1) + kreisNr(g.X(0, -0.75), g.Y(0, -0.75), 2) + kreisNr(g.X(0.75, 6.6), g.Y(0.75, 6.6), 3) + kreisNr(g.X(-5.4, 1.5), g.Y(-5.4, 1.5), 4) + kreisNr(g.X(-3.6, 4.9), g.Y(-3.6, 4.9), 5);
    return tafel('Was steht darauf?', b, ['① Zeichenkante mit Zentimeter- und Millimeterskala – die 0 ist in der Mitte.', '② Nullpunkt: Hier beginnt jede Messung.', '③ Mittellinie: Sie steht senkrecht (im rechten Winkel) auf der Zeichenkante.', '④ Hilfslinien: Sie verlaufen parallel zur Zeichenkante.', '⑤ Winkelskala: zwei Zahlenreihen von 0° bis 180° – schwarz ab rechts, rot ab links.'], P); },
  strecke: P => { const g = geo(500, 420, 40, 0, P), A = [g.X(0, 0), g.Y(0, 0) + 16], B = [g.X(5.3, 0), g.Y(5.3, 0) + 16];
    const b = g.svg + linie(A[0], A[1], B[0], B[1], BLAU, 5) + `<circle cx="${A[0]}" cy="${A[1]}" r="6" fill="${BLAU}"/><circle cx="${B[0]}" cy="${B[1]}" r="6" fill="${BLAU}"/>` +
      text(A[0] - 10, A[1] + 26, 'A', 26, BLAU, 'font-weight="700"') + text(B[0] - 6, B[1] + 26, 'B', 26, BLAU, 'font-weight="700"') +
      `<circle cx="${B[0]}" cy="${g.Y(5.3, 0.2)}" r="16" fill="none" stroke="${ROT}" stroke-width="3.5"/>` + text(B[0] + 22, A[1] + 26, '5,3 cm', 26, ROT, 'font-weight="700"');
    return tafel('Strecke messen', b, ['1. Die Zeichenkante genau an die Strecke anlegen.', '2. Den Nullpunkt genau auf den Anfangspunkt A schieben.', '3. Am Endpunkt B ablesen: 5 cm und 3 mm – also 5,3 cm.', 'Tipp: Nicht bei der Kante des Geodreiecks anfangen, sondern immer bei der 0!'], P); },
  winkel: P => { const g = geo(500, 440, 40, 0, P), t = 50 * Math.PI / 180;
    const b = g.svg + g.L(0, 0, 9.2, 0, BLAU, 5) + g.L(0, 0, 9 * Math.cos(t), 9 * Math.sin(t), BLAU, 5, 'stroke-opacity=".55"') + /* Schenkel halb durchsichtig – die Zahl darunter bleibt lesbar */
      `<rect x="${f(g.X(5.15, 4.95) - 6)}" y="${f(g.Y(5.15, 4.95) - 20)}" width="148" height="40" rx="10" fill="#fff" stroke="${ROT}" stroke-width="2.5"/>` + text(g.X(5.15, 4.95) + 6, g.Y(5.15, 4.95), 'hier: 50°', 24, ROT, 'font-weight="700"') + /* Ablese-Hinweis außerhalb des Geodreiecks */
      `<path d="M ${g.X(1.3, 0)} ${g.Y(1.3, 0)} A ${f(52)} ${f(52)} 0 0 0 ${g.X(1.3 * Math.cos(t), 1.3 * Math.sin(t))} ${g.Y(1.3 * Math.cos(t), 1.3 * Math.sin(t))}" fill="none" stroke="${ROT}" stroke-width="3"/>` +
      `<circle cx="${g.X(4.75 * Math.cos(t), 4.75 * Math.sin(t))}" cy="${g.Y(4.75 * Math.cos(t), 4.75 * Math.sin(t))}" r="17" fill="none" stroke="${ROT}" stroke-width="3.5"/>` +
      text(g.X(0, 0) - 34, g.Y(0, 0) + 24, 'S', 26, BLAU, 'font-weight="700"') + text(g.X(9.3, 0) - 4, g.Y(9.3, 0) - 22, '1. Schenkel', 20, BLAU) + text(g.X(5.6, 7.1), g.Y(5.6, 7.1), '2. Schenkel', 20, BLAU) +
      text(g.X(1.9, 1.5), g.Y(1.9, 1.5), 'α = 50°', 24, ROT, 'font-weight="700" stroke="#fff" stroke-width="5" paint-order="stroke"');
    return tafel('Winkel messen', b, ['1. Erst schätzen: spitz (unter 90°) oder stumpf (über 90°)?', '2. Den Nullpunkt genau auf den Scheitelpunkt S legen.', '3. Die Zeichenkante genau auf einen Schenkel legen.', '4. Auf der Skala ablesen, die an diesem Schenkel bei 0° beginnt – hier: 50°.', 'Passt die Zahl nicht zur Schätzung (z. B. 130° statt 50°)? Dann die andere Reihe nehmen.'], P); },
  parallele: P => { const g = geo(500, 440, 40, 0, P);
    const b = g.svg + g.L(-9.6, 2, 9.6, 2, BLAU, 4.5) + text(g.X(9.7, 2) + 8, g.Y(9.7, 2), 'g', 30, BLAU, 'font-weight="700" font-style="italic"') +
      g.L(-9.6, 0, 9.6, 0, ROT, 4.5, 'stroke-dasharray="14 9"') + text(g.X(9.7, 0) + 8, g.Y(9.7, 0), 'h', 30, ROT, 'font-weight="700" font-style="italic"') +
      g.L(-0.45, 0.08, -0.45, 1.92, ROT, 3, '') + `<polygon points="${g.X(-0.45, 1.92)},${g.Y(-0.45, 1.92)} ${g.X(-0.6, 1.6)},${g.Y(-0.6, 1.6)} ${g.X(-0.3, 1.6)},${g.Y(-0.3, 1.6)}" fill="${ROT}"/>` +
      `<polygon points="${g.X(-0.45, 0.08)},${g.Y(-0.45, 0.08)} ${g.X(-0.6, 0.4)},${g.Y(-0.6, 0.4)} ${g.X(-0.3, 0.4)},${g.Y(-0.3, 0.4)}" fill="${ROT}"/>` + text(g.X(-2.3, 1), g.Y(-2.3, 1), '2 cm', 24, ROT, 'font-weight="700"');
    return tafel('Parallele zeichnen', b, ['1. Das Geodreieck so legen, dass eine Hilfslinie genau auf der Geraden g liegt.', '2. An der Zeichenkante entlang die neue Gerade h zeichnen.', '3. Fertig: h ist parallel zu g (h ∥ g). Abstand an der Mittellinie: hier 2 cm.', 'Tipp: Das Geodreieck beim Zeichnen gut festhalten, damit es nicht verrutscht.'], P); },
  senkrechte: P => { const g = geo(600, 290, 25, 90, P), Px = g.X(0, 0), Py = g.Y(0, 0);
    const b = g.svg + linie(Px - 360, Py, Px + 230, Py, BLAU, 4.5) + text(Px + 240, Py, 'g', 30, BLAU, 'font-weight="700" font-style="italic"') +
      linie(Px, Py - 215, Px, Py + 215, ROT, 4.5, 'stroke-dasharray="14 9"') + text(Px + 14, Py - 225, 's', 30, ROT, 'font-weight="700" font-style="italic"') +
      `<path d="M ${Px + 26} ${Py} L ${Px + 26} ${Py - 26} L ${Px} ${Py - 26}" fill="none" stroke="${ROT}" stroke-width="3"/><circle cx="${Px + 13}" cy="${Py - 13}" r="3.5" fill="${ROT}"/>` +
      text(Px + 18, Py + 26, 'P', 26, BLAU, 'font-weight="700"');
    return tafel('Senkrechte zeichnen', b, ['1. Die Mittellinie genau auf die Gerade g legen.', '2. Das Geodreieck verschieben, bis der Nullpunkt auf dem Punkt P liegt.', '3. An der Zeichenkante entlang zeichnen: Die Gerade s steht senkrecht auf g (s ⊥ g).', 'Prüfen: Zwischen g und s ist ein rechter Winkel (90°).'], P); }
};
T.BAUSTEINE.geoerkl = { name: 'Geodreieck erklärt', gruppe: 'Mathe', def: { thema: 'aufbau' },
  felder: [{ k: 'thema', l: 'Thema', typ: 'auswahl', opts: THEMEN }],
  gen: (d, P) => (ZEICHNE[d.thema] || ZEICHNE.aufbau)(P) };
// Auswahl: eine Tafel einfügen oder alle fünf auf neue Seiten
T.geoErklMenue = () => {
  const h = T.h, bild = k => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj('geoerkl', { thema: k }, false).svg);
  const einfuegen = k => { T.closeDlg(); const g = T.genObj('geoerkl', { thema: k }, false), r = T.viewRect(), fz = Math.min(1, (r.x1 - r.x0) * 0.8 / g.w, (r.y1 - r.y0) * 0.8 / g.h), [cx, cy] = T.viewCenter();
    T.snap(); T.addItem({ t: 'o', id: T.uid(), k: 'geoerkl', d: { thema: k }, x: cx - g.w * fz / 2, y: cy - g.h * fz / 2, w: g.w * fz, h: g.h * fz, r: 0 }); T.render(); };
  const alle = () => { T.closeDlg(); T.snap(); const S = T.S, start = S.page + 1;
    THEMEN.forEach(([k, l], i) => { const g = T.genObj('geoerkl', { thema: k }, false), np = { ...T.newPage('weiss'), titel: 'Geodreieck: ' + l };
      np.items.push({ t: 'o', id: T.uid(), k: 'geoerkl', d: { thema: k }, x: 40, y: 30, w: g.w, h: g.h, r: 0 }); S.board.pages.splice(start + i, 0, np); });
    T.gotoPage(start); T.toast('5 Seiten zum Geodreieck eingefügt – mit ◀ ▶ blättern.', 3000); };
  T.openDlg([h('h2', {}, '📐 Geodreieck erklärt'), h('p', { class: 'hint' }, 'Große Bildtafeln mit Schritten – antippen fügt eine Tafel ein. Mit dem Geodreieck aus den Werkzeugen lässt sich alles gleich ausprobieren.'),
    h('div', { class: 'tiles' }, ...THEMEN.map(([k, l]) => h('button', { class: 'tile', onclick: () => einfuegen(k) }, h('img', { src: bild(k), alt: '' }), l))),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Schließen'), h('button', { class: 'big prim', onclick: alle }, '📄 Alle 5 auf neue Seiten'))]);
};
})();
