// Tafel-App – Paket 3b: Bausteine für Einfügen › 🔬 Naturwissenschaft (alle Zeichnungen selbst erstellt, schematisch)
// Beschriftungsbilder: Pflanzenzelle, Tierzelle, Blüte, Auge, Mikroskop, Herz – Beschriftung als Begriffe, Nummern oder leere Kästchen,
// Legende wahlweise (Nummern, Wortspeicher, Funktionen). Dazu: Teilchenmodell-Bild und Energieflussdiagramm.
// Eigenständig: braucht nur T.BAUSTEINE und T._svg aus bausteine.js.
'use strict';
(function () {
if (!T.BAUSTEINE || !T._svg) return;
const B = T.BAUSTEINE, { doc, ln, tx, rc, f, esc } = T._svg;

// ---------- Helfer ----------
const mess = (t, fs, fett) => { const c = T._mctx || (T._mctx = document.createElement('canvas').getContext('2d')); c.font = `${fett ? 700 : 400} ${fs}px Segoe UI`; return c.measureText(String(t)).width; };
const umbruch = (text, fs, maxW, fett) => {
  const out = [];
  for (const absatz of String(text == null ? '' : text).split(/\n/)) {
    let z = '';
    for (const w of absatz.split(/\s+/).filter(Boolean)) { const t = z ? z + ' ' + w : w; if (z && mess(t, fs, fett) > maxW) { out.push(z); z = w; } else z = t; }
    out.push(z);
  }
  return out;
};
const zufall = s => { s = (Math.abs(Math.round(s)) % 2147483646) + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const kreisPkt = (cx, cy, r, g) => [cx + r * Math.cos(g * Math.PI / 180), cy + r * Math.sin(g * Math.PI / 180)];
const pk = p => f(p[0]) + ' ' + f(p[1]);

// =====================================================================
// Beschriftungsbilder
// pts: [Begriff, Punkt x, Punkt y, Seite 'l'/'r', Höhe des Kästchens, Funktion]
// =====================================================================
const LBW = 220, LBH = 56;
// Chloroplast: linsenförmig mit Granastapeln (Thylakoide)
const chloro = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="19" ry="10" fill="#4ade80" stroke="#166534" stroke-width="2"/>`
  + [-10, -3, 4, 11].map((gx, i) => `<rect x="${gx - 2.5}" y="${i % 2 ? -5 : -3}" width="5" height="${i % 2 ? 8 : 6}" rx="1" fill="#15803d"/>`).join('')
  + '<line x1="-13" y1="0" x2="13" y2="0" stroke="#166534" stroke-width="1"/></g>';
// Zellkern: Kernhülle (doppelt, mit Poren), Kernkörperchen, Chromatin
const kern = (cx, cy, r, seed) => { const z = zufall(seed); let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ecdffb" stroke="#6b21a8" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="none" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="9 4"/>`;
  for (let i = 0; i < 14; i++) { const w = z() * 6.283, d = (r - 10) * Math.sqrt(z()); s += `<circle cx="${f(cx + d * Math.cos(w))}" cy="${f(cy + d * Math.sin(w))}" r="${f(1.6 + z() * 1.8)}" fill="#a78bfa"/>`; }
  return s + `<circle cx="${f(cx + r * 0.22)}" cy="${f(cy - r * 0.2)}" r="${f(r * 0.27)}" fill="#7e22ce"/>`; };
// Körnchen im Zellplasma (gleichbleibend: fester Startwert)
const koernchen = (n, seed, x0, y0, x1, y1, frei, farbe) => { const z = zufall(seed); let s = '', k = 0;
  for (let i = 0; i < n * 6 && k < n; i++) { const x = x0 + z() * (x1 - x0), y = y0 + z() * (y1 - y0), r = 1.4 + z() * 1.6; if (!frei(x, y)) continue; k++; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${farbe}"/>`; }
  return s; };
const inPoly = (p, x, y) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
const BILD = {
  pflanzenzelle: { titel: 'Pflanzenzelle', W: 1000, H: 600, unter: 'Pflanzenzelle (Schema, wie im Lichtmikroskop)',
    zeichne: () => {
      const aussen = [[334, 96], [668, 88], [676, 506], [326, 512]], innen = [[349, 111], [653, 104], [661, 491], [341, 497]], pp = p => p.map(q => q.join(',')).join(' ');
      // angeschnittene Nachbarzellen: deren Wände laufen an den Ecken weiter
      let s = [[334, 96, 296, 70], [334, 96, 300, 100], [668, 88, 706, 62], [668, 88, 704, 90], [676, 506, 712, 534], [676, 506, 712, 506], [326, 512, 290, 540], [326, 512, 290, 512], [500, 92, 498, 58], [502, 509, 504, 545]]
        .map(([a, b, c, d]) => ln(a, b, c, d, '#7da35a', 12) + ln(a, b, c, d, '#a3c46c', 6)).join('');
      s += `<polygon points="${pp(aussen)}" fill="#bcd68f" stroke="#4d7c0f" stroke-width="3" stroke-linejoin="round"/>`;
      s += `<polygon points="${pp(aussen.map(([x, y]) => [x + (x < 500 ? 7 : -7), y + (y < 300 ? 7 : -7)]))}" fill="none" stroke="#8fb85c" stroke-width="1.5" stroke-dasharray="14 6"/>`;
      s += `<polygon points="${pp(innen)}" fill="#f1faee" stroke="#15803d" stroke-width="2.5" stroke-linejoin="round"/>`;
      const vak = 'M 452 140 C 520 128 586 134 600 160 C 616 200 614 400 604 446 C 592 474 520 472 452 468 C 428 462 424 430 428 380 C 432 300 420 200 430 168 C 434 150 440 142 452 140 Z';
      s += koernchen(70, 7, 352, 112, 652, 492, (x, y) => inPoly(innen, x, y) && !(x > 420 && x < 612 && y > 126 && y < 478) && Math.hypot(x - 388, y - 232) > 40, '#9bb89a');
      s += `<path d="${vak}" fill="#d3ecfb" stroke="#0369a1" stroke-width="2.5"/>`;
      s += kern(388, 232, 34, 11);
      return s + chloro(384, 330, 15) + chloro(392, 462, -10) + chloro(500, 121, 0) + chloro(580, 121, -4) + chloro(636, 240, 88) + chloro(636, 370, 92) + chloro(520, 482, 2) + chloro(592, 480, -3) + chloro(378, 400, 70);
    },
    pts: [['Zellwand', 338, 200, 'l', 110, 'gibt der Pflanzenzelle Halt und eine feste Form'],
      ['Zellkern', 374, 244, 'l', 230, 'enthält die Erbinformation und steuert die Zelle'],
      ['Zellmembran', 345, 300, 'l', 350, 'grenzt die Zelle ab und regelt, welche Stoffe hinein- und hinausgelangen'],
      ['Zellplasma', 402, 440, 'l', 470, 'füllt die Zelle aus; in ihm laufen viele Stoffwechselvorgänge ab'],
      ['Chloroplast', 636, 240, 'r', 200, 'enthält Blattgrün; hier findet die Fotosynthese statt'],
      ['Vakuole', 540, 330, 'r', 380, 'speichert Zellsaft (Wasser mit gelösten Stoffen) und hält die Zelle prall']] },
  tierzelle: { titel: 'Tierzelle', W: 1000, H: 600, unter: 'Tierzelle (Schema, wie im Lichtmikroskop)',
    zeichne: () => {
      const rand = 'M 360 200 C 400 110 560 100 640 170 C 720 240 690 400 620 460 C 540 520 400 510 350 430 C 300 350 320 260 360 200 Z';
      let s = `<path d="${rand}" fill="#fdf1f6" stroke="#be185d" stroke-width="4"/>`;
      s += `<path d="${rand}" fill="none" stroke="#f9a8d4" stroke-width="1.5" transform="translate(500 300) scale(0.975) translate(-500 -300)"/>`;
      const im = (x, y) => { const a = (x - 505) / 175, b = (y - 305) / 180; return a * a + b * b < 0.8; };
      s += koernchen(90, 5, 330, 120, 690, 490, (x, y) => im(x, y) && Math.hypot(x - 500, y - 300) > 58, '#d6a3bd');
      // einige Bläschen (Vesikel) im Zellplasma
      [[420, 210, 9], [600, 210, 7], [610, 360, 10], [430, 420, 8], [560, 440, 6]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#e79ac0" stroke-width="1.5"/>`; });
      return s + kern(500, 300, 50, 3);
    },
    pts: [['Zellmembran', 322, 308, 'l', 300, 'grenzt die Zelle ab und regelt, welche Stoffe hinein- und hinausgelangen'],
      ['Zellkern', 530, 322, 'r', 230, 'enthält die Erbinformation und steuert die Zelle'],
      ['Zellplasma', 600, 400, 'r', 400, 'füllt die Zelle aus; in ihm laufen viele Stoffwechselvorgänge ab']] },
  bluete: { titel: 'Blüte (Längsschnitt)', W: 1000, H: 660, unter: 'Blüte im Längsschnitt (Schema)',
    zeichne: () => {
      const halb = '<path d="M 452 505 C 380 500 282 400 292 262 C 360 282 432 400 464 500 Z" fill="#f9a8d4" stroke="#be185d" stroke-width="2.5"/>'
        + '<path d="M 470 505 Q 440 420 432 336" fill="none" stroke="#a16207" stroke-width="4"/><ellipse cx="432" cy="322" rx="9" ry="16" fill="#facc15" stroke="#a16207" stroke-width="2"/>'
        + '<path d="M 482 505 Q 468 432 460 366" fill="none" stroke="#a16207" stroke-width="4"/><ellipse cx="460" cy="352" rx="9" ry="16" fill="#facc15" stroke="#a16207" stroke-width="2"/>'
        + '<path d="M 446 512 Q 400 518 358 560 Q 412 556 452 530 Z" fill="#16a34a" stroke="#14532d" stroke-width="2"/>';
      return halb + `<g transform="translate(1000 0) scale(-1 1)">${halb}</g>`
        + '<rect x="492" y="528" width="16" height="102" fill="#4d7c0f"/>'
        + '<path d="M 438 500 Q 500 550 562 500 Z" fill="#65a30d" stroke="#3f6212" stroke-width="2"/>'
        + '<ellipse cx="500" cy="462" rx="36" ry="44" fill="#86efac" stroke="#166534" stroke-width="3"/>'
        + '<ellipse cx="490" cy="456" rx="6" ry="9" fill="#fefce8" stroke="#166534" stroke-width="1.5"/><ellipse cx="510" cy="472" rx="6" ry="9" fill="#fefce8" stroke="#166534" stroke-width="1.5"/>'
        + '<rect x="494" y="302" width="12" height="120" fill="#bbf7d0" stroke="#166534" stroke-width="2"/>'
        + '<ellipse cx="500" cy="294" rx="22" ry="11" fill="#a3e635" stroke="#3f6212" stroke-width="2.5"/>';
    },
    pts: [['Narbe', 480, 292, 'l', 190, 'fängt den Pollen auf (klebrig)'],
      ['Griffel', 494, 370, 'l', 300, 'verbindet Narbe und Fruchtknoten; der Pollenschlauch wächst hindurch'],
      ['Fruchtknoten', 466, 465, 'l', 420, 'enthält die Samenanlagen; wird nach der Befruchtung zur Frucht'],
      ['Kelchblatt', 392, 540, 'l', 550, 'schützt die Blüte, solange sie noch eine Knospe ist'],
      ['Kronblatt', 670, 340, 'r', 250, 'lockt mit Farbe und Duft Insekten an'],
      ['Staubblatt', 555, 419, 'r', 400, 'bildet im Staubbeutel den Pollen']] },
  auge: { titel: 'Auge (Längsschnitt)', W: 1000, H: 560, unter: 'Auge im Längsschnitt (Schema, Licht fällt von links ein)',
    zeichne: () => {
      const cx = 500, cy = 300, R = 180, P = (r, g) => kreisPkt(cx, cy, r, g);
      let s = `<circle cx="${cx}" cy="${cy}" r="${R - 6}" fill="#f0f9ff"/>`;
      s += `<path d="M ${pk(P(R, 210))} A ${R} ${R} 0 1 1 ${pk(P(R, 150))}" fill="none" stroke="#64748b" stroke-width="10"/>`;
      s += `<path d="M ${pk(P(R - 8, 212))} A ${R - 8} ${R - 8} 0 1 1 ${pk(P(R - 8, 148))}" fill="none" stroke="#9f1239" stroke-width="3"/>`;
      s += `<path d="M ${pk(P(R - 13, 222))} A ${R - 13} ${R - 13} 0 1 1 ${pk(P(R - 13, 138))}" fill="none" stroke="#f97316" stroke-width="6"/>`;
      /* Sehnerv: zieht vom blinden Fleck durch die Augenwand nach hinten */
      s += `<path d="M ${pk(P(R - 13, 11))} L ${pk(P(R + 6, 9))} L 760 328 L 760 372 L ${pk(P(R + 6, 21))} L ${pk(P(R - 13, 19))} Z" fill="#fde047" stroke="#a16207" stroke-width="2"/>`;
      const bf = P(R - 13, 15); s += `<circle cx="${f(bf[0])}" cy="${f(bf[1])}" r="8" fill="#fef08a" stroke="#a16207" stroke-width="1.5"/>`;
      /* gelber Fleck: auf der optischen Achse, gegenüber der Pupille (ca. 15° neben dem blinden Fleck) */
      const gf = P(R - 13, 0); s += `<ellipse cx="${f(gf[0])}" cy="${f(gf[1])}" rx="5" ry="11" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>`;
      s += '<path d="M 344 210 Q 248 300 344 390 L 358 390 L 358 210 Z" fill="#e0f2fe"/><path d="M 344 210 Q 248 300 344 390" fill="none" stroke="#0284c7" stroke-width="5"/>';
      s += '<rect x="352" y="212" width="12" height="60" fill="#92400e"/><rect x="352" y="328" width="12" height="60" fill="#92400e"/>';
      s += '<ellipse cx="376" cy="219" rx="11" ry="7" fill="#be123c"/><ellipse cx="376" cy="381" rx="11" ry="7" fill="#be123c"/>';
      s += ln(380, 224, 388, 248, '#94a3b8', 1.5) + ln(372, 225, 382, 251, '#94a3b8', 1.5) + ln(380, 376, 388, 352, '#94a3b8', 1.5) + ln(372, 375, 382, 349, '#94a3b8', 1.5);
      s += '<ellipse cx="392" cy="300" rx="22" ry="54" fill="#fde68a" fill-opacity=".85" stroke="#b45309" stroke-width="2.5"/>';
      return s;
    },
    pts: [['Ziliarmuskel', 376, 219, 'l', 60, 'Ringmuskel; verändert über die Linsenbänder die Form der Linse (nah oder fern sehen)'],
      ['Iris', 358, 240, 'l', 140, 'regelt mit der Pupille, wie viel Licht ins Auge fällt'],
      ['Hornhaut', 304, 264, 'l', 225, 'schützt das Auge vorn und bricht das Licht'],
      ['Pupille', 358, 300, 'l', 320, 'Öffnung in der Iris, durch die das Licht ins Auge fällt'],
      ['Linse', 395, 345, 'l', 430, 'bricht das Licht und stellt das Bild scharf (nah oder fern)'],
      ['Lederhaut', 585, 141, 'r', 50, 'feste, weiße Außenhaut; schützt das Auge'],
      ['Aderhaut', 628, 185, 'r', 115, 'versorgt die Netzhaut mit Blut (Sauerstoff und Nährstoffe)'],
      ['Netzhaut', 653, 232, 'r', 180, 'Lichtsinneszellen wandeln Licht in Signale um'],
      ['Glaskörper', 560, 262, 'r', 245, 'durchsichtige, gallertartige Masse; füllt das Auge aus und hält es in Form'],
      ['gelber Fleck', 667, 300, 'r', 310, 'Stelle des schärfsten Sehens – hier liegen besonders viele Zapfen'],
      ['Sehnerv', 735, 352, 'r', 375, 'leitet die Signale der Netzhaut zum Gehirn'],
      ['blinder Fleck', 661, 343, 'r', 440, 'Austritt des Sehnervs – keine Lichtsinneszellen, hier sieht man nichts']] },
  mikroskop: { titel: 'Mikroskop', W: 1000, H: 700, unter: 'Lichtmikroskop (Schema, Seitenansicht)',
    zeichne: () => '<path d="M 330 640 L 650 640 Q 662 640 660 626 L 650 590 L 340 590 L 320 626 Q 318 640 330 640 Z" fill="#334155"/>'
      + rc(420, 562, 60, 28, 'none', '#475569', 0, 'rx="4"') + '<circle cx="450" cy="556" r="14" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>'
      + ln(450, 536, 450, 466, '#facc15', 3, 'stroke-dasharray="6 6"')
      + '<path d="M 588 590 L 648 590 C 690 470 690 300 640 190 L 584 190 C 628 300 628 470 588 590 Z" fill="#475569"/>'
      + rc(470, 200, 130, 38, 'none', '#475569', 0, 'rx="6"')
      + rc(428, 130, 44, 170, '#334155', '#e2e8f0', 3) + rc(434, 78, 32, 52, '#334155', '#cbd5e1', 3) + '<ellipse cx="450" cy="78" rx="16" ry="5" fill="#bae6fd" stroke="#334155" stroke-width="2"/>'
      + '<path d="M 420 300 L 480 300 L 495 322 L 405 322 Z" fill="#64748b"/>'
      + rc(440, 322, 20, 58, '#334155', '#94a3b8', 2) + rc(443, 380, 14, 8, 'none', '#334155', 0)
      + '<rect x="404" y="320" width="16" height="40" fill="#94a3b8" stroke="#334155" stroke-width="2" transform="rotate(28 412 322)"/>'
      + '<rect x="480" y="320" width="16" height="40" fill="#94a3b8" stroke="#334155" stroke-width="2" transform="rotate(-28 488 322)"/>'
      + rc(340, 420, 280, 18, 'none', '#1e293b', 0, 'rx="3"') + rc(400, 411, 100, 9, '#0284c7', '#e0f2fe', 1.5) + ln(372, 418, 402, 412, '#94a3b8', 3) + ln(528, 418, 498, 412, '#94a3b8', 3)
      + rc(410, 446, 80, 12, 'none', '#64748b', 0, 'rx="3"') + ln(490, 452, 516, 462, '#64748b', 4)
      + '<circle cx="650" cy="430" r="34" fill="#94a3b8" stroke="#334155" stroke-width="3"/><circle cx="650" cy="430" r="15" fill="#cbd5e1" stroke="#334155" stroke-width="3"/>',
    pts: [['Okular', 466, 100, 'r', 90, 'Linse, durch die man schaut; vergrößert das Bild noch einmal (z. B. 10-fach)'],
      ['Tubus', 472, 170, 'r', 190, 'Rohr, das Okular und Objektiv verbindet'],
      ['Grobtrieb', 676, 414, 'r', 340, 'verändert den Abstand stark – zum groben Scharfstellen'],
      ['Feintrieb', 652, 436, 'r', 460, 'verändert den Abstand nur wenig – zum feinen Scharfstellen'],
      ['Objektiv', 440, 352, 'l', 330, 'Linse dicht über dem Präparat; vergrößert zuerst (z. B. 4-, 10-, 40-fach)'],
      ['Objekttisch', 350, 429, 'l', 430, 'Auflage für den Objektträger mit dem Präparat'],
      ['Blende', 412, 452, 'l', 520, 'regelt, wie viel Licht durch das Präparat fällt (Helligkeit, Kontrast)'],
      ['Lichtquelle', 436, 556, 'l', 620, 'beleuchtet das Präparat von unten']] },
  herz: { titel: 'Herz', W: 1000, H: 812, unter: 'Herz von vorn, aufgeschnitten (Schema) · blau: sauerstoffarmes Blut · rot: sauerstoffreiches Blut',
    zeichne: () => {
      const BL = '#5b9cf0', BLc = '#a9cbfa', BLs = '#1e3a8a', RT = '#e5484d', RTc = '#f8b4b4', RTs = '#7f1d1d', MU = '#e8958d', MUs = '#9f1239';
      const rohr = (d, fill, st) => `<path d="${d}" fill="${fill}" stroke="${st}" stroke-width="2.5" stroke-linejoin="round"/>`;
      // Gefäße hinter dem Herzen: Lungenarterie (Stamm + Äste), Aortenbogen mit Kopf-/Armarterien, obere Hohlvene, Lungenvenen
      let s = rohr('M 262 130 Q 254 147 262 164 L 446 164 L 446 262 L 486 262 L 486 166 L 740 166 Q 748 151 740 136 L 486 136 Q 476 128 446 128 Z', BL, BLs);
      s += [[572, 70], [612, 58], [652, 66]].map(([x, y]) => rohr(`M ${x - 9} ${y + 22} L ${x - 9} ${y - 22} Q ${x} ${y - 30} ${x + 9} ${y - 22} L ${x + 9} ${y + 22} Z`, RT, RTs)).join('');
      s += rohr('M 520 262 L 520 112 C 520 44 730 44 730 112 L 730 176 Q 710 186 690 176 L 690 118 C 686 84 566 84 560 118 L 560 262 Z', RT, RTs);
      s += rohr('M 350 262 L 350 34 Q 371 24 392 34 L 392 262 Z', BL, BLs);
      s += rohr('M 640 262 L 762 262 Q 770 275 762 288 L 640 288 Z', RT, RTs);
      // Herzmuskel (Spitze zeigt nach links unten im Körper = rechts unten im Bild)
      s += `<path d="M 326 232 C 300 300 298 420 350 500 C 408 590 498 652 566 702 C 652 622 714 512 710 400 C 708 320 698 268 676 232 C 600 214 400 214 326 232 Z" fill="${MU}" stroke="${MUs}" stroke-width="3"/>`;
      s += `<path d="M 360 520 C 420 600 500 650 560 690" fill="none" stroke="#f3b3ab" stroke-width="5" stroke-linecap="round"/>`; /* Glanzlicht */
      // Hohlräume: Vorhöfe, Kammern, Durchgänge zu den Gefäßen
      s += rohr('M 344 254 C 338 300 340 340 352 362 L 434 362 L 434 254 Q 390 240 344 254 Z', BLc, BLs);
      s += rohr('M 332 394 L 494 394 L 496 604 C 440 572 376 506 350 452 C 336 428 332 410 332 394 Z', BLc, BLs);
      s += rohr('M 566 254 L 566 352 L 664 352 C 674 320 674 280 666 254 Q 616 240 566 254 Z', RTc, RTs);
      s += rohr('M 520 384 L 664 384 C 674 472 646 562 572 640 L 530 600 C 526 520 522 450 520 384 Z', RTc, RTs);
      s += rc(352, 226, 38, 34, 'none', BLc, 0) + rc(446, 226, 40, 172, 'none', BLc, 0) + rc(520, 226, 40, 162, 'none', RTc, 0) + rc(660, 264, 48, 22, 'none', RTc, 0);
      s += rc(364, 356, 62, 42, 'none', BLc, 0) + rc(582, 346, 70, 42, 'none', RTc, 0);
      // Segelklappen (zwischen Vorhof und Kammer) und Taschenklappen (am Beginn der Arterien)
      const segel = (x, y, b) => `<path d="M ${x} ${y} C ${x + 6} ${y + 26} ${x + 14} ${y + 44} ${x + 22} ${y + 50} L ${x + b * 0.42} ${y} Z M ${x + b} ${y} C ${x + b - 6} ${y + 26} ${x + b - 14} ${y + 44} ${x + b - 22} ${y + 50} L ${x + b * 0.58} ${y} Z" fill="#ffffff" stroke="#334155" stroke-width="2"/>`
        + ln(x + 22, y + 50, x + 26, y + 72, '#64748b', 1.5) + ln(x + b - 22, y + 50, x + b - 26, y + 72, '#64748b', 1.5);
      s += segel(364, 360, 62) + segel(582, 350, 70);
      const tasche = (x, y) => `<path d="M ${x} ${y} Q ${x + 7} ${y + 16} ${x + 13} ${y} Q ${x + 20} ${y + 16} ${x + 27} ${y} Q ${x + 33} ${y + 16} ${x + 40} ${y}" fill="#ffffff" fill-opacity=".85" stroke="#334155" stroke-width="2"/>`;
      s += tasche(446, 250) + tasche(520, 250);
      // untere Hohlvene: kommt von unten und mündet in den rechten Vorhof
      s += rohr('M 300 740 L 300 300 Q 300 292 308 292 L 356 292 L 356 334 L 336 334 L 336 740 Z', BL, BLs) + rc(338, 296, 18, 36, 'none', BLc, 0);
      // Fließrichtung
      const pfeil = (x1, y1, x2, y2, c) => { const w = Math.atan2(y2 - y1, x2 - x1), a = 9; return ln(x1, y1, x2, y2, c, 3) + `<path d="M ${f(x2)} ${f(y2)} L ${f(x2 - a * Math.cos(w - 0.5))} ${f(y2 - a * Math.sin(w - 0.5))} L ${f(x2 - a * Math.cos(w + 0.5))} ${f(y2 - a * Math.sin(w + 0.5))} Z" fill="${c}"/>`; };
      s += pfeil(371, 120, 371, 200, '#1e3a8a') + pfeil(466, 320, 466, 286, '#1e3a8a') + pfeil(420, 150, 300, 150, '#1e3a8a') + pfeil(540, 320, 540, 286, '#7f1d1d') + pfeil(760, 275, 700, 275, '#7f1d1d') + pfeil(318, 700, 318, 620, '#1e3a8a');
      s += tx(330, 768, '← rechte Körperseite', '#475569', 19, 'middle', 'font-weight="600"') + tx(670, 768, 'linke Körperseite →', '#475569', 19, 'middle', 'font-weight="600"');
      return s;
    },
    pts: [['obere Hohlvene', 371, 70, 'l', 60, 'bringt sauerstoffarmes Blut aus Kopf und Armen zum rechten Vorhof'],
      ['Lungenarterie', 286, 146, 'l', 140, 'führt sauerstoffarmes Blut von der rechten Kammer zur Lunge'],
      ['rechter Vorhof', 384, 300, 'l', 230, 'nimmt sauerstoffarmes Blut aus dem Körper auf'],
      ['Segelklappe', 390, 384, 'l', 330, 'verhindert, dass Blut aus der Kammer in den Vorhof zurückfließt'],
      ['rechte Kammer', 404, 476, 'l', 430, 'pumpt sauerstoffarmes Blut in die Lunge'],
      ['untere Hohlvene', 318, 590, 'l', 560, 'bringt sauerstoffarmes Blut aus dem Unterkörper zum rechten Vorhof'],
      ['Aorta', 700, 120, 'r', 50, 'führt sauerstoffreiches Blut von der linken Kammer in den Körper'],
      ['Taschenklappe', 553, 254, 'r', 150, 'verhindert, dass Blut aus der Arterie in die Kammer zurückfließt'],
      ['Lungenvene', 740, 275, 'r', 255, 'bringt sauerstoffreiches Blut von der Lunge zum linken Vorhof'],
      ['linker Vorhof', 612, 318, 'r', 350, 'nimmt sauerstoffreiches Blut aus der Lunge auf'],
      ['linke Kammer', 612, 480, 'r', 470, 'pumpt sauerstoffreiches Blut in den ganzen Körper (dickste Muskelwand)']] }
};

function bildGen(id, d) {
  const b = BILD[id], W0 = b.W, H0 = b.H, mod = d.beschr || 'nummern', leg = d.legende || 'aus';
  let s = b.zeichne();
  b.pts.forEach(([n, px, py, seite, ay], i) => {
    const bx = seite === 'l' ? 10 : W0 - 10 - LBW, ex = seite === 'l' ? bx + LBW : bx, links = seite === 'l';
    s += ln(px, py, ex, ay, '#1e293b', 2) + `<circle cx="${f(px)}" cy="${f(py)}" r="4.5" fill="#1e293b"/>`;
    s += rc(bx, ay - LBH / 2, LBW, LBH, '#64748b', '#ffffff', 2, `rx="10"${mod === 'begriffe' ? '' : ' stroke-dasharray="8 6"'}`);
    if (mod === 'nummern' || mod === 'beides') { const nx = links ? bx + LBW - 22 : bx + 22; s += `<circle cx="${f(nx)}" cy="${f(ay)}" r="15" fill="#334155"/>` + tx(nx, ay + 1, String(i + 1), '#fff', 17, 'middle', 'font-weight="700"'); }
    if (mod === 'begriffe' || mod === 'beides') { const fs = Math.min(22, (LBW - (mod === 'beides' ? 54 : 20)) / Math.max(1, mess(n, 22, true)) * 22);
      s += tx(links ? bx + LBW - (mod === 'beides' ? 44 : 10) : bx + (mod === 'beides' ? 44 : 10), ay, n, '#1e293b', f(fs), links ? 'end' : 'start', 'font-weight="700"'); }
  });
  if (b.unter) s += tx(W0 / 2, H0 - 16, b.unter, '#64748b', 17, 'middle', 'font-style="italic"');
  // Legende rechts daneben
  let W = W0, H = H0, lg = '';
  if (leg !== 'aus') {
    const LW = leg === 'funktion' ? 600 : 330, x0 = W0 + 10, fs = 20, lh = 26;
    let y = 24; lg += tx(x0 + 16, y + 6, leg === 'wort' ? 'Wortspeicher' : leg === 'funktion' ? 'Begriffe und Funktionen' : 'Legende', '#1e293b', 23, 'start', 'font-weight="700"'); y += 40;
    const liste = leg === 'wort' ? b.pts.map(p => p[0]).sort((a, c) => a.localeCompare(c, 'de')).map(n => [null, n, '']) : b.pts.map((p, i) => [mod === 'nummern' || mod === 'beides' ? i + 1 : null, p[0], leg === 'funktion' ? p[5] : '']);
    liste.forEach(([nr, n, fn]) => {
      const xt = x0 + (nr ? 54 : 18);
      if (nr) lg += `<circle cx="${x0 + 30}" cy="${f(y + 12)}" r="13" fill="#334155"/>` + tx(x0 + 30, y + 13, String(nr), '#fff', 15, 'middle', 'font-weight="700"');
      lg += tx(xt, y + 12, n, '#1e293b', fs, 'start', 'font-weight="700"'); y += lh;
      if (fn) { umbruch(fn, 18, LW - 70).forEach(z => { lg += tx(xt, y + 10, z, '#475569', 18, 'start'); y += 23; }); y += 6; }
      y += 6;
    });
    W = W0 + LW + 20; H = Math.max(H0, y + 20);
    lg = rc(W0 + 10, 4, LW, y + 6, '#cbd5e1', '#f8fafc', 2, 'rx="14"') + lg;
  }
  const hg = rc(1, 1, W0 - 2, H0 - 2, '#cbd5e1', '#ffffff', 2, 'rx="16"');
  return { svg: doc(W, H, hg + s + lg), w: W, h: H };
}
const F_BESCHR = [
  { k: 'beschr', l: 'Beschriftung', typ: 'auswahl', opts: [['nummern', 'Nummern (Begriffe verdeckt)'], ['begriffe', 'Begriffe zeigen'], ['beides', 'Nummern und Begriffe'], ['leer', 'leere Kästchen zum Beschriften']] },
  { k: 'legende', l: 'Legende daneben', typ: 'auswahl', opts: [['aus', 'keine'], ['nummern', 'Nummern mit Begriffen'], ['wort', 'Wortspeicher (ohne Nummern, alphabetisch)'], ['funktion', 'Begriffe mit Funktion']] }
];
T.BESCHRIFTUNG = { BILD, bildGen, F_BESCHR, LBW, LBH }; /* für skelettbilder.js (gleiche Kästchen, Legende, Nummern) */
[['pflanzenzelle', 'bio_pflanzenzelle'], ['tierzelle', 'bio_tierzelle'], ['bluete', 'bio_bluete'], ['auge', 'bio_auge'], ['mikroskop', 'bio_mikroskop'], ['herz', 'bio_herz']].forEach(([id, key]) => {
  B[key] = { name: BILD[id].titel + ' (beschriften)', gruppe: 'NaWi', def: { beschr: 'leer', legende: 'aus' }, felder: F_BESCHR, gen: d => bildGen(id, d) };
});

// =====================================================================
// Teilchenmodell: Kugelbild eines Stoffs im Gefäß (Anordnung aus einer Zahl erzeugt – „Anordnung“ ändern = neue Verteilung)
// =====================================================================
const KB = ['#3b82f6', '#1e3a8a'], KR = ['#ef4444', '#7f1d1d'], KG = ['#a3a3a3', '#404040'];
const TART = [['fest', 'fest', 'fest'], ['fluessig', 'flüssig', 'flüssig'], ['gas', 'gasförmig', 'gasförmig'], ['gasgemisch', 'Gasgemisch (zwei Gase)', 'Gasgemisch'], ['loesung', 'Lösung (z. B. Zuckerwasser)', 'Lösung'], ['ungeloest', 'Zucker in Wasser, noch nicht gelöst', 'Zucker, noch ungelöst'], ['sandwasser', 'Sand in Wasser (Gemenge)', 'Sand in Wasser'], ['leer', 'leeres Gefäß (selbst zeichnen)', '']];
function teilchenPos(art, n, rnd) {
  const r = 13, xa = 20 + r, xb = 250 - r, yb = 260 - r, out = [];
  if (art === 'fest') { const sp = 8, rows = Math.ceil(n / sp); for (let i = 0; i < n; i++) { const c = i % sp, z = Math.floor(i / sp); out.push([xa + 4 + c * 26.5, yb - z * 26.5]); } void rows; return out; }
  if (art === 'gas') { for (let t = 0; out.length < n && t < 5000; t++) { const p = [xa + rnd() * (xb - xa), 44 + rnd() * (yb - 44)]; if (out.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 48)) out.push(p); } return out; }
  /* flüssig: dicht, aber ungeordnet – versetzte Reihen mit leichtem Zittern und einzelnen Lücken */
  let lueck = 0;
  for (let z = 0; z < 10 && out.length < n; z++) {
    const reihe = []; for (let x = xa + (z % 2 ? 13 : 0); x <= xb; x += 27) reihe.push([x, yb - z * 23.5]);
    const rest = n - out.length;
    let nimm = rest >= reihe.length ? reihe.filter(() => !(z > 0 && lueck < 3 && rnd() < 0.12 && ++lueck)) : reihe.map(p => [rnd(), p]).sort((a, b) => a[0] - b[0]).slice(0, rest).map(e => e[1]);
    nimm.forEach(p => out.push([p[0] + (rnd() - 0.5) * 5, p[1] + (rnd() - 0.5) * 4]));
  }
  return out;
}
function teilchenGen(d) {
  const W = 270, H = d.text ? 320 : 286, rnd = zufall(d.anordnung || 1), art = d.art, ball = (x, y, c) => `<circle cx="${f(x)}" cy="${f(y)}" r="13" fill="${c[0]}" stroke="${c[1]}" stroke-width="2"/><circle cx="${f(x - 4)}" cy="${f(y - 4)}" r="3.5" fill="#fff" fill-opacity=".55"/>`;
  let s = rc(1, 1, W - 2, H - 2, '#cbd5e1', '#ffffff', 2, 'rx="14"');
  if (art === 'gas' || art === 'gasgemisch') s += rc(18, 24, 234, 240, 'none', '#f8fafc', 0);
  const n = Math.max(1, Math.min(60, +d.anzahl || ({ fest: 32, fluessig: 30, gas: 10, gasgemisch: 12, loesung: 30, ungeloest: 30, sandwasser: 30, leer: 0 })[art] || 0));
  if (art === 'fest' || art === 'fluessig') teilchenPos(art, n, rnd).forEach(([x, y]) => { s += ball(x, y, KB); });
  else if (art === 'gas' || art === 'gasgemisch') teilchenPos('gas', n, rnd).forEach(([x, y], i) => {
    let a = rnd() * Math.PI * 2; for (let v = 0; v < 12; v++) { const ex = x - Math.cos(a) * 32, ey = y - Math.sin(a) * 32; if (ex > 22 && ex < 248 && ey > 26 && ey < 258) break; a += Math.PI / 6; } s += ln(x - Math.cos(a) * 18, y - Math.sin(a) * 18, x - Math.cos(a) * 30, y - Math.sin(a) * 30, '#94a3b8', 2.5) + ball(x, y, art === 'gasgemisch' && i % 2 ? KR : KB); });
  else if (art === 'loesung') { /* gelöste Teilchen gleichmäßig zwischen den Wasserteilchen verteilt */
    const P = teilchenPos('fluessig', n, rnd), rot = [], idx = P.map((_, i) => i).sort(() => rnd() - 0.5);
    for (const i of idx) { if (rot.length >= Math.round(n / 5)) break; if (rot.every(j => Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) > 60)) rot.push(i); }
    P.forEach(([x, y], i) => { s += ball(x, y, rot.includes(i) ? KR : KB); });
  } else if (art === 'ungeloest' || art === 'sandwasser') { /* Kristall bzw. Sandkorn als geordneter Block am Boden, Wasser drumherum */
    const blk = []; for (let z = 0; z < 2; z++) for (let c = 0; c < 3; c++) blk.push([46 + c * 26.5, 247 - z * 26.5]);
    teilchenPos('fluessig', n, rnd).filter(([x, y]) => !(x < 46 + 3 * 26.5 && y > 247 - 2 * 26.5 - 6)).forEach(([x, y]) => { s += ball(x, y, KB); });
    blk.forEach(([x, y]) => { s += ball(x, y, art === 'ungeloest' ? KR : KG); });
  }
  s += `<path d="M 16 22 L 16 264 L 254 264 L 254 22" fill="none" stroke="#475569" stroke-width="4" stroke-linejoin="round"/>`;
  if (d.text) s += tx(W / 2, 294, (TART.find(t => t[0] === art) || ['', '', ''])[2], '#1e293b', 20, 'middle', 'font-weight="700"');
  return { svg: doc(W, H, s), w: W, h: H };
}
B.nawi_teilchen = { name: 'Teilchenmodell-Bild', gruppe: 'NaWi', def: { art: 'fest', anordnung: 1, anzahl: 0, text: false },
  felder: [{ k: 'art', l: 'Was zeigt das Bild?', typ: 'auswahl', opts: TART }, { k: 'text', l: 'Bezeichnung darunter zeigen', typ: 'check' },
    { k: 'anordnung', l: 'Anordnung (andere Zahl = andere zufällige Verteilung)', typ: 'zahl', min: 1, max: 999 }, { k: 'anzahl', l: 'Anzahl der Teilchen (0 = passende Anzahl)', typ: 'zahl', min: 0, max: 60 }],
  gen: d => teilchenGen(d) };

// =====================================================================
// Energieflussdiagramm (KC-Sprache: „thermische Energie“, nie „Wärmeenergie“). Pfeilbreite = Anteil.
// =====================================================================
const GERAETE = [ // Wirkungsgrade als typische Schätzwerte
  ['gluehlampe', 'Glühlampe', 'elektrische Energie', 'Strahlungsenergie (Licht)', 5], ['led', 'LED-Lampe', 'elektrische Energie', 'Strahlungsenergie (Licht)', 30],
  ['wasserkocher', 'Wasserkocher', 'elektrische Energie', 'thermische Energie des Wassers', 90], ['motor', 'Elektromotor', 'elektrische Energie', 'Bewegungsenergie', 80],
  ['solar', 'Solarzelle', 'Strahlungsenergie (Licht)', 'elektrische Energie', 20], ['auto', 'Automotor (Benzin)', 'chemische Energie', 'Bewegungsenergie', 25],
  ['mensch', 'Muskeln beim Radfahren', 'chemische Energie', 'Bewegungsenergie', 25], ['kohle', 'Kohlekraftwerk', 'chemische Energie', 'elektrische Energie', 40],
  ['dynamo', 'Fahrraddynamo', 'Bewegungsenergie', 'elektrische Energie', 60]];
function flussGen(d) {
  const g = GERAETE.find(x => x[0] === d.geraet), ein = g ? g[2] : d.ein, wand = g ? g[1] : d.wandler, nutz = g ? g[3] : d.nutz;
  const p = T.clamp(g ? g[4] : +d.prozent || 0, 0, 100), leer = d.leer, BW = 250, BH = 100, GAP = 90, y0 = 46, cy = y0 + BH / 2, T0 = 70, W = 3 * BW + 2 * GAP + 20, H = 500;
  const t1 = Math.max(5, T0 * p / 100), t2 = Math.max(5, T0 * (100 - p) / 100), xW = BW + GAP, xE = 2 * (BW + GAP), xU = xW, yU = 340, mx = xW + BW / 2;
  const kasten = (x, y, t, art) => {
    const farbe = art === 'w' ? ['#ea580c', '#fff7ed'] : art === 'u' ? ['#dc2626', '#fef2f2'] : ['#0284c7', '#f0f9ff'];
    let s = rc(x, y, BW, BH, farbe[0], farbe[1], 3, `rx="14"${leer && art !== 'w' ? ' stroke-dasharray="10 7"' : ''}`);
    if (leer && art !== 'w') return s;
    const zl = umbruch(t, 22, BW - 24, art === 'w'), lh = 27;
    return s + zl.map((z, i) => tx(x + BW / 2, y + BH / 2 + (i - (zl.length - 1) / 2) * lh, z, '#1e293b', 22, 'middle', art === 'w' ? 'font-weight="700"' : '')).join('');
  };
  const band = (x1, x2, yc, t) => { const hl = 22; return `<path d="M ${f(x1)} ${f(yc - t / 2)} L ${f(x2 - hl)} ${f(yc - t / 2)} L ${f(x2 - hl)} ${f(yc - t / 2 - 9)} L ${f(x2)} ${f(yc)} L ${f(x2 - hl)} ${f(yc + t / 2 + 9)} L ${f(x2 - hl)} ${f(yc + t / 2)} L ${f(x1)} ${f(yc + t / 2)} Z" fill="#fb923c" fill-opacity=".85" stroke="#c2410c" stroke-width="1.5"/>`; };
  const bandRunter = (xc, y1, y2, t) => { const hl = 22; return `<path d="M ${f(xc - t / 2)} ${f(y1)} L ${f(xc - t / 2)} ${f(y2 - hl)} L ${f(xc - t / 2 - 9)} ${f(y2 - hl)} L ${f(xc)} ${f(y2)} L ${f(xc + t / 2 + 9)} ${f(y2 - hl)} L ${f(xc + t / 2)} ${f(y2 - hl)} L ${f(xc + t / 2)} ${f(y1)} Z" fill="#fca5a5" fill-opacity=".9" stroke="#b91c1c" stroke-width="1.5"/>`; };
  let s = rc(1, 1, W - 2, H - 2, '#cbd5e1', '#ffffff', 2, 'rx="16"');
  s += band(10 + BW, 10 + xW, cy, T0) + band(10 + xW + BW, 10 + xE, cy, t1) + bandRunter(10 + mx, y0 + BH, yU, t2);
  s += kasten(10, y0, ein, 'e') + kasten(10 + xW, y0, wand, 'w') + kasten(10 + xE, y0, nutz, 'e') + kasten(10 + xU, yU, 'thermische Energie (Umgebung)', 'u');
  if (d.prozent_zeigen) s += tx(10 + BW + GAP / 2, cy - T0 / 2 - 28, '100 %', '#9a3412', 20, 'middle', 'font-weight="700"') + tx(10 + xW + BW + GAP / 2, cy - t1 / 2 - 28, p + ' %', '#9a3412', 20, 'middle', 'font-weight="700"')
    + tx(10 + mx + t2 / 2 + 18, (y0 + BH + yU) / 2, (100 - p) + ' %', '#b91c1c', 20, 'start', 'font-weight="700"');
  s += tx(10 + xE + BW / 2, y0 + BH + 26, 'genutzt', '#0369a1', 18, 'middle', 'font-style="italic"') + tx(10 + xU + BW / 2, yU + BH + 24, 'nicht genutzt – an die Umgebung abgegeben', '#b91c1c', 17, 'middle', 'font-style="italic"');
  return { svg: doc(W, H, s), w: W, h: H };
}
B.nawi_energiefluss = { name: 'Energieflussdiagramm', gruppe: 'NaWi', def: { geraet: 'gluehlampe', ein: 'elektrische Energie', wandler: 'Gerät', nutz: 'genutzte Energieform', prozent: 50, prozent_zeigen: false, leer: true },
  felder: [{ k: 'geraet', l: 'Gerät (typische Wirkungsgrade)', typ: 'auswahl', opts: GERAETE.map(g => [g[0], `${g[1]} (etwa ${g[4]} %)`]).concat([['eigen', 'eigenes Gerät (Felder unten)']]) },
    { k: 'prozent_zeigen', l: 'Anteile in % zeigen', typ: 'check' }, { k: 'leer', l: 'Energieformen leer lassen (zum Ausfüllen)', typ: 'check' },
    { k: 'ein', l: 'Eigenes Gerät: zugeführte Energieform', typ: 'text' }, { k: 'wandler', l: 'Eigenes Gerät: Name des Wandlers', typ: 'text' },
    { k: 'nutz', l: 'Eigenes Gerät: genutzte Energieform', typ: 'text' }, { k: 'prozent', l: 'Eigenes Gerät: genutzter Anteil in %', typ: 'zahl', min: 0, max: 100 }],
  gen: d => flussGen(d) };

T.PAKET3B = { BILD, bildGen, teilchenGen, flussGen }; /* für Tests */
})();
