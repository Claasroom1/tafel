// Tafel-App – 🍕 Bruchstücke: ein Ganzes (Kreis, Streifen, Rechteck) in n gleiche Stücke teilen – jedes Stück ist ein eigenes
// Element (mit dem Finger verschieben, am ↻ drehen). Dazu auf Wunsch der Umriss des Ganzen zum Wiederzusammenlegen.
// Stück: d = { form, nenner, a0, a1 (Anteil 0…1 des Ganzen), farbe, beschr } – „✂ halbieren“ teilt ein Stück in zwei.
'use strict';
(function () {
const CM = T.CM, R = 4 * CM, SW = 12 * CM, SH = { streifen: 2.4 * CM, rechteck: 6 * CM }, M = 6;
const f = v => Math.round(v * 10) / 10;
const FARBEN = [['#fdba74', 'Orange'], ['#fca5a5', 'Rot'], ['#86efac', 'Grün'], ['#93c5fd', 'Blau'], ['#fde68a', 'Gelb'], ['#d8b4fe', 'Lila']];
// Umriss eines Stücks im Koordinatensystem des Ganzen (Kreis: Mittelpunkt 0,0; Streifen/Rechteck: links oben 0,0)
function umriss(d) {
  if (d.form === 'kreis') {
    const P = [[0, 0]], n = Math.max(2, Math.ceil((d.a1 - d.a0) * 96));
    for (let k = 0; k <= n; k++) { const t = (-0.25 + d.a0 + (d.a1 - d.a0) * k / n) * 2 * Math.PI; P.push([R * Math.cos(t), R * Math.sin(t)]); }
    return P;
  }
  const H = SH[d.form] || SH.streifen; return [[SW * d.a0, 0], [SW * d.a1, 0], [SW * d.a1, H], [SW * d.a0, H]];
}
const rahmen = P => { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); return { x0: Math.min(...xs) - M, y0: Math.min(...ys) - M, x1: Math.max(...xs) + M, y1: Math.max(...ys) + M }; };
// Bruch als Zähler/Strich/Nenner
const bruchSvg = (x, y, z, n, fs, c) => `<text x="${f(x)}" y="${f(y - fs * 0.62)}" font-size="${f(fs)}" text-anchor="middle" dominant-baseline="central" fill="${c}" font-weight="700">${z}</text>` +
  `<line x1="${f(x - fs * 0.45)}" y1="${f(y)}" x2="${f(x + fs * 0.45)}" y2="${f(y)}" stroke="${c}" stroke-width="${f(fs * 0.09)}" stroke-linecap="round"/>` +
  `<text x="${f(x)}" y="${f(y + fs * 0.62)}" font-size="${f(fs)}" text-anchor="middle" dominant-baseline="central" fill="${c}" font-weight="700">${n}</text>`;
function stueckSvg(d, P) {
  const U = umriss(d), B = rahmen(U), W = B.x1 - B.x0, H = B.y1 - B.y0, X = p => f(p[0] - B.x0), Y = p => f(p[1] - B.y0);
  let s = `<polygon points="${U.map(p => X(p) + ',' + Y(p)).join(' ')}" fill="${d.farbe || '#fdba74'}" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>`;
  if (d.beschr !== false) {
    let cx, cy; const anteil = d.a1 - d.a0;
    if (d.form === 'kreis') { const t = (-0.25 + (d.a0 + d.a1) / 2) * 2 * Math.PI, rr = anteil >= 0.5 ? 0 : R * 0.58; cx = rr * Math.cos(t); cy = rr * Math.sin(t); }
    else { cx = SW * (d.a0 + d.a1) / 2; cy = (SH[d.form] || SH.streifen) / 2; }
    const fs = Math.max(13, Math.min(30, d.form === 'kreis' ? R * Math.min(0.24, anteil * 1.6) : Math.min(SW * anteil * 0.42, (SH[d.form] || SH.streifen) * 0.36)));
    s += bruchSvg(cx - B.x0, cy - B.y0, 1, d.nenner, fs, '#1f2937');
  }
  return { svg: T._svg.doc(W, H, s), w: W, h: H, B };
}
function ganzesSvg(d, P) {
  const U = d.form === 'kreis' ? Array.from({ length: 97 }, (_, k) => [R * Math.cos(k / 96 * 2 * Math.PI), R * Math.sin(k / 96 * 2 * Math.PI)]) : umriss({ ...d, a0: 0, a1: 1 });
  const B = rahmen(U), W = B.x1 - B.x0, H = B.y1 - B.y0;
  const s = `<polygon points="${U.map(p => f(p[0] - B.x0) + ',' + f(p[1] - B.y0)).join(' ')}" fill="${P.papier}" fill-opacity=".35" stroke="${P.ink}" stroke-width="2.5" stroke-dasharray="9 7"/>` +
    `<text x="${f(W / 2)}" y="${f(H - 2)}" font-size="16" text-anchor="middle" fill="${P.ink}" opacity=".55">1 Ganzes</text>`;
  return { svg: T._svg.doc(W, H, s), w: W, h: H, B };
}
const B = T.BAUSTEINE;
/* ◐ durchsichtig / deckend – direkt im Kontextmenü (gilt für alle markierten Elemente; Deckkraft wie beim Schieberegler: it.alpha) */
const DURCH = { l: '◐ durchsichtig / deckend', aus: o => { const ids = T.S.sel && T.S.sel.ids && T.S.sel.ids.size ? T.S.sel.ids : new Set([o.id]), pg = T.page(), an = !(o.alpha < 1);
  T.snap(); pg.items.forEach((it, i) => { if (ids.has(it.id)) { const n = { ...it }; if (an) n.alpha = 0.5; else delete n.alpha; pg.items[i] = n; } }); T.render(); T.renderOver(); T.changed && T.changed(); } };
B.bruchstueck = { name: 'Bruchstück', gruppe: 'Mathe', def: { form: 'kreis', nenner: 4, a0: 0, a1: 0.25, farbe: '#fdba74', beschr: true },
  felder: [{ k: 'farbe', l: 'Farbe', typ: 'auswahl', opts: FARBEN }, { k: 'beschr', l: 'Bruch (1/n) auf das Stück schreiben', typ: 'check' }],
  gen: (d, P) => stueckSvg(d, P) };
B.bruchganzes = { name: 'Ganzes (Umriss)', gruppe: 'Mathe', def: { form: 'kreis' }, felder: [], gen: (d, P) => ganzesSvg(d, P) };
// Kachel unter Einfügen › Mathe (Vorschau: Kreis in vier Stücken, leicht auseinandergezogen)
B.bruchstuecke = { name: 'Bruchstücke zum Legen', gruppe: 'Mathe', def: { form: 'kreis', n: 4 }, felder: [],
  gen: (d, P) => {
    let s = ''; const w = 2 * R + 60;
    for (let i = 0; i < 4; i++) { const t = (-0.25 + (i + 0.5) / 4) * 2 * Math.PI, dx = 14 * Math.cos(t), dy = 14 * Math.sin(t), U = umriss({ form: 'kreis', a0: i / 4, a1: (i + 1) / 4 });
      s += `<polygon points="${U.map(p => f(p[0] + w / 2 + dx) + ',' + f(p[1] + w / 2 + dy)).join(' ')}" fill="${FARBEN[i % FARBEN.length][0]}" stroke="${P.ink}" stroke-width="3"/>`; }
    return { svg: T._svg.doc(w, w, s), w, h: w };
  } };
// Ein Stück so auf die Tafel legen, dass der Punkt (gx, gy) des Ganzen auf (wx, wy) liegt
function legeStueck(d, wx, wy, r) {
  const g = stueckSvg(d, T.palette(false)), a = (r || 0) * Math.PI / 180;
  const lx = -g.B.x0 - g.w / 2, ly = -g.B.y0 - g.h / 2, cx = wx - (lx * Math.cos(a) - ly * Math.sin(a)), cy = wy - (lx * Math.sin(a) + ly * Math.cos(a));
  return { t: 'o', id: T.uid(), k: 'bruchstueck', d, x: cx - g.w / 2, y: cy - g.h / 2, w: g.w, h: g.h, r: r || 0 };
}
// Ursprung des Ganzen (Kreismitte bzw. linke obere Ecke) eines liegenden Stücks auf der Tafel
function ursprung(o) {
  const g = stueckSvg(o.d, T.palette(false)), s = o.w / g.w, a = (o.r || 0) * Math.PI / 180, lx = (-g.B.x0 - g.w / 2) * s, ly = (-g.B.y0 - g.h / 2) * s;
  return [o.x + o.w / 2 + lx * Math.cos(a) - ly * Math.sin(a), o.y + o.h / 2 + lx * Math.sin(a) + ly * Math.cos(a)];
}
T.bruchstueckeEinfuegen = ({ form = 'kreis', n = 4, farbe = '#fdba74', beschr = true, ganzes = true } = {}) => {
  const [cx, cy] = T.viewCenter(), neu = [];
  const ox = form === 'kreis' ? cx : cx - SW / 2, oy = form === 'kreis' ? cy : cy - (SH[form] || SH.streifen) / 2;
  if (ganzes) { const g = ganzesSvg({ form }, T.palette(false)); neu.push({ t: 'o', id: T.uid(), k: 'bruchganzes', d: { form }, x: ox + g.B.x0, y: oy + g.B.y0, w: g.w, h: g.h, r: 0 }); }
  for (let i = 0; i < n; i++) neu.push(legeStueck({ form, nenner: n, a0: i / n, a1: (i + 1) / n, farbe, beschr }, ox, oy, 0));
  T.snap(); neu.forEach(o => T.addItem(o)); T.render(); T.renderOver();
  T.toast(`${n} Stücke eingefügt – mit dem Finger einzeln herausziehen, am ↻ drehen; im Kontextmenü „✂ halbieren“.`, 4000);
};
// Kontextmenü eines Stücks: Bruch ein/aus, halbieren, Farbe
B.bruchstueck.schnell = d => [
  { l: '✂ halbieren', aus: o => {
    const [ux, uy] = ursprung(o), m = (o.d.a0 + o.d.a1) / 2, s = o.w / stueckSvg(o.d, T.palette(false)).w;
    const teil = (a0, a1) => { const x = legeStueck({ ...o.d, a0, a1, nenner: o.d.nenner * 2 }, ux, uy, o.r); x.w *= s; x.h *= s; const g = stueckSvg(x.d, T.palette(false)), a = (o.r || 0) * Math.PI / 180,
      lx = (-g.B.x0 - g.w / 2) * s, ly = (-g.B.y0 - g.h / 2) * s; const ccx = ux - (lx * Math.cos(a) - ly * Math.sin(a)), ccy = uy - (lx * Math.sin(a) + ly * Math.cos(a)); x.x = ccx - x.w / 2; x.y = ccy - x.h / 2; return x; };
    T.snap(); const pg = T.page(); pg.items = pg.items.filter(i => i.id !== o.id); const A = teil(o.d.a0, m), Bb = teil(m, o.d.a1); T.addItem(A); T.addItem(Bb); T.S.sel = null; T.render(); T.renderOver();
    T.toast(`Halbiert: zwei Stücke zu je 1/${o.d.nenner * 2}.`, 2200); } },
  { l: d.beschr === false ? '½ Bruch zeigen' : '½ Bruch ausblenden', f: dd => ({ d: { ...dd, beschr: dd.beschr === false } }) },
  { l: '🎨 Farbe wechseln', f: dd => { const i = FARBEN.findIndex(c => c[0] === dd.farbe); return { d: { ...dd, farbe: FARBEN[(i + 1) % FARBEN.length][0] } }; } }, DURCH];
B.bruchganzes.schnell = () => [DURCH];
// Auswahl vor dem Einfügen: Form, Anzahl der Stücke, Farbe
T.bruchstueckeMenue = () => {
  const h = T.h, st = { form: 'kreis', n: 4, farbe: '#fdba74', beschr: true, ganzes: true };
  const zeige = () => {
    const wahl = (arr, k) => h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }, ...arr.map(([v, l]) => h('button', { class: 'big' + (st[k] === v ? ' on' : ''), onclick: () => { st[k] = v; zeige(); } }, l)));
    T.openDlg([h('h2', {}, '🍕 Bruchstücke zum Legen'),
      h('p', { class: 'hint' }, 'Ein Ganzes wird in gleiche Stücke geteilt. Jedes Stück lässt sich einzeln verschieben und drehen – z. B. zum Vergleichen, Ergänzen oder Erweitern.'),
      h('h3', {}, 'Form'), wahl([['kreis', '◔ Kreis (Pizza)'], ['streifen', '▭ Streifen'], ['rechteck', '▦ Rechteck (Schokolade)']], 'form'),
      h('h3', {}, 'In wie viele Stücke?'), wahl([2, 3, 4, 5, 6, 8, 10, 12].map(v => [v, String(v)]), 'n'),
      h('h3', {}, 'Farbe'), h('div', { class: 'row', style: { gap: '8px' } }, ...FARBEN.map(([c, l]) => h('button', { class: 'sw' + (st.farbe === c ? ' on' : ''), title: l, style: { background: c, width: '44px', height: '44px' }, onclick: () => { st.farbe = c; zeige(); } }))),
      h('label', { class: 'fld check' }, (() => { const i = h('input', { type: 'checkbox', onchange: e => { st.beschr = e.target.checked; } }); i.checked = st.beschr; return i; })(), 'Bruch (1/n) auf jedes Stück schreiben'),
      h('label', { class: 'fld check' }, (() => { const i = h('input', { type: 'checkbox', onchange: e => { st.ganzes = e.target.checked; } }); i.checked = st.ganzes; return i; })(), 'Umriss des Ganzen dazulegen (zum Wiederzusammensetzen)'),      h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => { T.closeDlg(); T.bruchstueckeEinfuegen(st); } }, '＋ Einfügen'))]);
  };
  zeige();
};

// ---------- 📏 Brüche am Zahlenstrahl: Brüche eingeben – Einteilung passt sich an, jeder Bruch hat seine Farbe ----------
// Einteilung: automatisch (Hauptnenner = kgV aller Nenner), selbst festgelegt (Teile je Ganzes) oder keine (die SuS ermitteln sie).
// Liegen mehrere Brüche am selben Strich (z. B. 1/2 und 2/4), stehen sie übereinander – jeder in seiner Farbe.
const BS_FARBEN = ['#2563eb', '#dc2626', '#16a34a', '#ea580c', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const kgV = (a, b) => a / ggT(a, b) * b;
// „3/4“, „1 1/2“ (gemischt), „2“ – getrennt durch ; oder ,
function brueche(text) {
  const out = [], fehler = [];
  for (const roh of String(text || '').split(/[;,]/)) {
    const t = roh.trim(); if (!t) continue;
    let m = t.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/), z, n;
    if (m) { n = +m[3]; z = +m[1] * n + +m[2]; }
    else if ((m = t.match(/^(\d+)\s*\/\s*(\d+)$/))) { z = +m[1]; n = +m[2]; }
    else if ((m = t.match(/^(\d+)$/))) { z = +m[1]; n = 1; }
    if (!n || n > 100 || z / n > 20) { fehler.push(t); continue; }
    out.push({ z, n, text: t });
  }
  return { liste: out, fehler };
}
const bruchTxt = (x, y, z, n, c, fs) => tx(x, y - fs * 0.62, String(z), c, fs, 'middle', 'font-weight="700"') + ln(x - Math.max(String(z).length, String(n).length) * fs * 0.3 - 3, y, x + Math.max(String(z).length, String(n).length) * fs * 0.3 + 3, y, c, Math.max(2, fs * 0.08)) + tx(x, y + fs * 0.66, String(n), c, fs, 'middle', 'font-weight="700"');
const tx = (...a) => T._svg.tx(...a), ln = (...a) => T._svg.ln(...a); /* aus bausteine.js */
B.bruchstrahl = { name: 'Brüche am Zahlenstrahl', gruppe: 'Mathe', def: { brueche: '1/4; 3/4; 5/4', einteilung: 'auto', teile: 4, ende: 0, laenge: 12, anzeige: 'bruch', zeigen: 'alle', strichBeschr: false, hinweis: true },
  felder: [{ k: 'brueche', l: 'Brüche (mit ; trennen, z. B. 1/4; 3/8; 1 1/2; 2)', typ: 'text' },
    { k: 'einteilung', l: 'Einteilung', typ: 'auswahl', opts: [['auto', 'automatisch (Hauptnenner aller Brüche)'], ['eigene', 'selbst festlegen (Teile je Ganzes, unten)'], ['keine', 'keine – die SuS ermitteln sie (nur 0, 1, 2 …)']] },
    { k: 'teile', l: 'Teile je Ganzes (bei „selbst festlegen“)', typ: 'zahl', min: 1, max: 60 },
    { k: 'ende', l: 'Bis (0 = automatisch bis zur nächsten ganzen Zahl)', typ: 'zahl', min: 0, max: 20 },
    { k: 'laenge', l: 'Länge eines Ganzen (cm)', typ: 'zahl', min: 4, max: 40 },
    { k: 'anzeige', l: 'Unechte Brüche zeigen als', typ: 'auswahl', opts: [['bruch', 'Bruch (z. B. 5/4)'], ['gemischt', 'gemischte Zahl (z. B. 1 1/4)'], ['beide', 'beides']] },
    { k: 'zeigen', l: 'Brüche', typ: 'auswahl', opts: [['alle', 'beschriftet'], ['punkte', 'nur farbige Punkte (Brüche ablesen)'], ['keine', 'keine (Brüche selbst eintragen)']] },
    { k: 'strichBeschr', l: 'Jeden kleinen Strich beschriften (z. B. 1/8, 2/8 …)', typ: 'check' },
    { k: 'hinweis', l: 'Darunter erklären, wie die Einteilung entsteht', typ: 'check' }],
  gen: (d, P) => {
    const { liste, fehler } = brueche(d.brueche), U = T.clamp(+d.laenge || 12, 4, 40) * CM;
    const nenner = [...new Set(liste.map(b => b.n))];
    const HN = Math.min(120, nenner.reduce((a, b) => kgV(a, b), 1));
    const N = d.einteilung === 'keine' ? 1 : d.einteilung === 'eigene' ? T.clamp(Math.round(+d.teile || 1), 1, 60) : HN;
    const maxW = Math.max(1, ...liste.map(b => b.z / b.n));
    const E = +d.ende > 0 ? Math.max(1, Math.ceil(+d.ende)) : Math.max(1, Math.ceil(maxW - 1e-9));
    const sichtbar = liste.filter(b => b.z / b.n <= E + 1e-9);
    // gleiche Werte bündeln (exakt über den gemeinsamen Nenner)
    const L = liste.reduce((a, b) => kgV(a, b.n), 1), gruppen = new Map(), x0 = 50, x0v = k => x0 + (k / L) * U;
    sichtbar.forEach(b => { const i = liste.indexOf(b), k = b.z * (L / b.n); if (!gruppen.has(k)) gruppen.set(k, []); gruppen.get(k).push({ ...b, farbe: BS_FARBEN[i % BS_FARBEN.length] }); });
    const fs = 24, zeile = d.anzeige === 'beide' ? 104 : 74, BW = 80;
    // Ebenen: nah beieinanderliegende Brüche weichen nach oben aus, damit sich die Kästchen nicht überdecken
    const ebenen = [], lage = new Map();
    for (const [k, g] of [...gruppen].sort((a, b) => a[0] - b[0])) {
      const x = x0v(k);
      let b = 0; while (g.some((_, j) => ebenen[b + j] != null && x - ebenen[b + j] < BW + 6)) b++;
      g.forEach((_, j) => { ebenen[b + j] = x; }); lage.set(k, b);
    }
    const oben = d.zeigen === 'alle' ? 30 + Math.max(1, ebenen.length) * zeile : 50, W = x0 + E * U + 70, yA = oben + 20;
    let s = ln(x0, yA, x0 + E * U + 40, yA, P.ink, 3) + `<path d="M${f(x0 + E * U + 52)} ${f(yA)} l-16 -9 v18 z" fill="${P.ink}"/>`;
    // kleine Striche, große Striche (ganze Zahlen)
    for (let k = 0; k <= E * N; k++) {
      const x = x0 + k * U / N, ganz = k % N === 0;
      s += ln(x, yA - (ganz ? 16 : 9), x, yA + (ganz ? 16 : 9), P.ink, ganz ? 3 : 2);
      if (ganz) s += tx(x, yA + 36, String(k / N), P.ink, 26, 'middle', 'font-weight="700"');
      else if (d.strichBeschr && N > 1) s += bruchTxt(x, yA + 46, k, N, '#6b7280', 15); /* z. B. 5/4 – als Bruch des Ganzen gezählt */
    }
    // Brüche: Punkt am Strahl, darüber die Brüche übereinander (je Bruch eine Farbe)
    let warn = false;
    for (const [k, g] of gruppen) {
      const x = x0v(k), passt = (k * N) % L === 0, b0 = lage.get(k); /* passt: liegt genau auf einem Strich der Einteilung */
      if (d.zeigen !== 'keine') g.forEach((b, j) => { s += `<circle cx="${f(x)}" cy="${f(yA)}" r="${f(Math.max(4, 9 - j * 2))}" fill="${b.farbe}" stroke="#fff" stroke-width="2"/>`; });
      if (d.zeigen === 'alle') {
        s += ln(x, yA - 14, x, yA - 52 - b0 * zeile + fs * 1.3, g[0].farbe, 2, 'stroke-dasharray="4 4" opacity=".7"');
        g.forEach((b, j) => {
          const y = yA - 52 - (b0 + j) * zeile, ganz = Math.floor(b.z / b.n), rest = b.z % b.n;
          const gem = b.z >= b.n && b.n > 1, hoch = fs * 2.6 + (gem && d.anzeige === 'beide' ? 30 : 0);
          const bg = `<rect x="${f(x - BW / 2)}" y="${f(y - fs * 1.3)}" width="${BW}" height="${f(hoch)}" rx="10" fill="${P.papier || '#fff'}" fill-opacity=".9" stroke="${b.farbe}" stroke-width="2"/>`;
          if (b.n === 1) s += bg + tx(x, y, String(b.z), b.farbe, 30, 'middle', 'font-weight="700"');
          else if (gem && d.anzeige === 'gemischt') s += bg + (rest ? tx(x - 16, y, String(ganz), b.farbe, 32, 'middle', 'font-weight="700"') + bruchTxt(x + 14, y, rest, b.n, b.farbe, fs - 4) : tx(x, y, String(ganz), b.farbe, 32, 'middle', 'font-weight="700"'));
          else if (gem && d.anzeige === 'beide') s += bg + bruchTxt(x, y, b.z, b.n, b.farbe, fs) + tx(x, y + fs * 1.75, '= ' + ganz + (rest ? ' ' + rest + '/' + b.n : ''), b.farbe, 17, 'middle', 'font-weight="600"');
          else s += bg + bruchTxt(x, y, b.z, b.n, b.farbe, fs);
        });
      }
      if (!passt && d.einteilung !== 'keine') { warn = true; s += tx(x, yA + (d.strichBeschr ? 84 : 60), '↑ zwischen den Strichen', '#dc2626', 14); }
    }
    let H = yA + (d.strichBeschr ? 80 : 56) + (warn ? 24 : 0);
    if (d.hinweis) {
      const nn = nenner.filter(n => n > 1).sort((a, b) => a - b);
      const t = d.einteilung === 'keine' ? 'Einteilung: Welche Nenner kommen vor? Wie viele gleiche Teile braucht ein Ganzes?'
        : d.einteilung === 'eigene' ? `Einteilung: jedes Ganze in ${N} gleiche Teile (1 Teil = 1/${N}).` + (nn.some(n => N % n) ? ' Nicht jeder Bruch passt auf einen Strich – Nenner müssen in ' + N + ' aufgehen.' : '')
        : !nn.length ? 'Nur ganze Zahlen – keine Einteilung nötig.'
        : nn.length === 1 ? `Nenner ${nn[0]} → jedes Ganze in ${nn[0]} gleiche Teile.`
        : `Nenner ${nn.join(', ')} → kleinste gemeinsame Einteilung (Hauptnenner): ${HN} → jedes Ganze in ${HN} gleiche Teile.`;
      s += tx(x0 - 20, H + 4, '💡 ' + t, P.ink, 17, 'start', 'opacity=".8"'); H += 30;
    }
    if (fehler.length) { s += tx(x0 - 20, H + 4, 'Nicht verstanden: ' + fehler.join('; ') + ' (Beispiel: 3/4 oder 1 1/2)', '#dc2626', 16, 'start'); H += 28; }
    const breite = Math.max(W, d.hinweis ? 760 : 0);
    return { svg: T._svg.doc(breite, H, s), w: breite, h: H };
  } };
// Kontextmenü: ein einfaches Fenster statt „Zahlen anpassen“ – Brüche eintippen, Einteilung und Anzeige mit Knöpfen, Vorschau sofort
B.bruchstrahl.schnell = () => [{ l: '🔢 Brüche eingeben', aus: o => bruchstrahlDialog(o) }, DURCH];
T.bruchstrahlDialog = o => bruchstrahlDialog(o);
function bruchstrahlDialog(o) {
  const h = T.h, d = { ...B.bruchstrahl.def, ...o.d };
  const bild = h('img', { alt: '', style: { width: '100%', maxHeight: '260px', objectFit: 'contain', background: '#fff', borderRadius: '10px', border: '1px solid var(--line, #ddd)' } });
  const info = h('p', { class: 'hint', style: { margin: '4px 0' } });
  const vorschau = () => { try { const g = B.bruchstrahl.gen(d, T.palette(false)); bild.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(g.svg); const { fehler } = brueche(d.brueche); info.textContent = fehler.length ? '⚠ Nicht verstanden: ' + fehler.join('; ') : ''; } catch (e) {} };
  const reihe = (titel, k, opts) => { const r = h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } });
    const male = () => { r.innerHTML = ''; opts.forEach(([v, l]) => r.append(h('button', { class: 'big' + (d[k] === v ? ' on' : ''), onclick: () => { d[k] = v; male(); feldTeile.style.display = d.einteilung === 'eigene' ? '' : 'none'; vorschau(); } }, l))); };
    male(); return h('div', { class: 'fld' }, h('span', {}, titel), r); };
  const eingabe = h('input', { class: 'feld', value: d.brueche, placeholder: 'z. B. 1/4; 3/8; 1 1/2; 2', style: { width: '100%', boxSizing: 'border-box', fontSize: '22px' }, oninput: e => { d.brueche = e.target.value; vorschau(); } });
  const teile = h('input', { class: 'feld', type: 'number', min: 1, max: 60, value: d.teile, style: { width: '90px' }, oninput: e => { d.teile = T.clamp(+e.target.value || 1, 1, 60); vorschau(); } });
  const feldTeile = h('label', { class: 'row', style: { alignItems: 'center', gap: '8px', display: d.einteilung === 'eigene' ? '' : 'none' } }, 'Jedes Ganze in', teile, 'gleiche Teile');
  T.openDlg([h('h2', {}, '🔢 Brüche am Zahlenstrahl'),
    h('label', { class: 'fld' }, 'Brüche (mit ; trennen – gemischte Zahl mit Leerzeichen: 1 1/2)', eingabe), info,
    reihe('Einteilung', 'einteilung', [['auto', 'automatisch'], ['eigene', 'selbst festlegen'], ['keine', 'keine (SuS ermitteln)']]), feldTeile,
    reihe('Brüche zeigen', 'zeigen', [['alle', 'beschriftet'], ['punkte', 'nur Punkte'], ['keine', 'gar nicht (eintragen)']]),
    reihe('Unechte Brüche als', 'anzeige', [['bruch', '5/4'], ['gemischt', '1 ¼'], ['beide', 'beides']]),
    bild,
    h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: () => {
      const g0 = T.genObj('bruchstrahl', o.d, false), sk = g0 && g0.w ? o.w / g0.w : 1, g = T.genObj('bruchstrahl', d, false);
      T.snap(); T.replaceItem({ ...o, d: { ...d }, w: g.w * sk, h: g.h * sk }); T.closeDlg(); T.render(); T.renderOver(); } }, '✔ Übernehmen'))]);
  vorschau(); setTimeout(() => { eingabe.focus(); eingabe.select(); }, 60);
}

// ---------- ✏️ Bruchrechnen zum Ausfüllen (wie die schriftliche Aufgabe): Bruchstriche mit Kästchen, Rechenzeichen, Bögen „· □“ / „: □“ ----------
// art: erweitern · kuerzen · plus · minus · mal · geteilt. „aufgabe“ (z. B. 2/3 + 1/4) steht schon drin – leer = alles zum Ausfüllen.
// Schritte abwählbar: ohne Erweitern (gleichnamige Brüche), ohne Kürzen; Pfeile ein/aus oder „↗ Pfeile lösen“ = einzeln verschiebbar.
// Lösung verdeckt; ☰ „👁 Lösung zeigen“ (grün). Immer weißes Blatt mit dunkler Schrift. Mit dem Stift hineinschreiben.
const BV_ARTEN = [['erweitern', 'Erweitern'], ['kuerzen', 'Kürzen'], ['plus', 'Addieren (+)'], ['minus', 'Subtrahieren (−)'], ['mal', 'Multiplizieren (·)'], ['geteilt', 'Dividieren (:)']];
const bvBrueche = s => [...String(s || '').matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m => ({ z: +m[1], n: +m[2] })).filter(b => b.n > 0);
const BV = { FW: 120, OW: 58, MY: 158, H: 316 };
/* Aufbau: Folge aus Brüchen {k: Schlüssel} und Zeichen; Bögen [von, bis, oben?, Zeichen, Schlüssel der Zahl] */
function bvAufbau(d) {
  const art = d.art, erw = d.erweitern !== false, kue = d.kuerzen !== false, F = k => ({ k });
  if (art === 'erweitern') return { s: [F('A'), '=', F('E')], b: [['A', 'E', true, '·', 'k'], ['A', 'E', false, '·', 'k']] };
  if (art === 'kuerzen') return { s: [F('A'), '=', F('K')], b: [['A', 'K', true, ':', 'k'], ['A', 'K', false, ':', 'k']] };
  const s = [], b = [];
  if (art === 'plus' || art === 'minus') { const o = art === 'plus' ? '+' : '−';
    s.push(F('A'), o, F('B'), '=');
    if (erw) { s.push(F('A2'), o, F('B2'), '='); b.push(['A', 'A2', true, '·', 'ka'], ['B', 'B2', false, '·', 'kb']); }
    s.push(F('S')); }
  else if (art === 'mal') s.push(F('A'), '·', F('B'), '=', F('S'));
  else s.push(F('A'), ':', F('B'), '=', F('A2'), '·', F('B2'), '=', F('S')); /* geteilt: mal dem Kehrwert */
  if (kue) { s.push('=', F('K')); b.push(['S', 'K', true, ':', 'g']); }
  return { s, b };
}
/* Lösung: Werte je Schlüssel – nur wenn die Aufgabe vollständig ist */
function bvLoesung(d, br) {
  const [A, Bb] = br, art = d.art; if (!A) return null;
  if (art === 'erweitern') { const k = +d.faktor; return k > 1 ? { E: { z: A.z * k, n: A.n * k }, k } : null; }
  if (art === 'kuerzen') { const k = +d.faktor || ggT(A.z, A.n); return k > 1 && !(A.z % k) && !(A.n % k) ? { K: { z: A.z / k, n: A.n / k }, k } : null; }
  if (!Bb) return null;
  let L = {}, z, n;
  if (art === 'plus' || art === 'minus') {
    const HN = d.erweitern === false && A.n === Bb.n ? A.n : kgV(A.n, Bb.n), a = A.z * HN / A.n, b = Bb.z * HN / Bb.n;
    z = art === 'plus' ? a + b : a - b; n = HN; if (z < 0) return null;
    L = { A2: { z: a, n: HN }, B2: { z: b, n: HN }, ka: HN / A.n, kb: HN / Bb.n };
  } else if (art === 'mal') { z = A.z * Bb.z; n = A.n * Bb.n; }
  else { if (!Bb.z) return null; L = { A2: { z: A.z, n: A.n }, B2: { z: Bb.n, n: Bb.z } }; z = A.z * Bb.n; n = A.n * Bb.z; }
  const g = ggT(z, n); Object.assign(L, { S: { z, n }, K: { z: z / g, n: n / g }, g: g > 1 ? g : '–' });
  return L;
}
/* Bogen mit Pfeil und Kästchen „· □“ – x1…x2 auf Höhe y0, oben oder unten (für Vorlage und einzelnen Bogenpfeil) */
function bvBogen(x1, x2, y0, oben, zeichen, zahl, mitKasten) {
  const akz = '#2563eb', kq = oben ? y0 - 84 : y0 + 84, mx = (x1 + x2) / 2, ly = oben ? y0 - 42 : y0 + 42, a = Math.atan2(y0 - kq, x2 - mx);
  return `<path d="M${f(x1)} ${f(y0)} Q${f(mx)} ${f(kq)} ${f(x2)} ${f(y0)}" fill="none" stroke="${akz}" stroke-width="3"/>`
    + `<path d="M${f(x2)} ${f(y0)} l${f(-15 * Math.cos(a - 0.45))} ${f(-15 * Math.sin(a - 0.45))} M${f(x2)} ${f(y0)} l${f(-15 * Math.cos(a + 0.45))} ${f(-15 * Math.sin(a + 0.45))}" stroke="${akz}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    + `<rect x="${f(mx - 44)}" y="${f(ly - 24)}" width="88" height="48" rx="10" fill="#fff" stroke="${akz}" stroke-width="2"${mitKasten ? ' stroke-dasharray="5 4"' : ''}/>`
    + tx(mx - 24, ly, zeichen, akz, 34, 'middle', 'font-weight="800"') + (zahl != null && zahl !== '' ? tx(mx + 16, ly, String(zahl), '#16a34a', 30, 'middle', 'font-weight="700"') : '');
}
/* Lage der Teile in der Vorlage (auch für „Pfeile lösen“) */
function bvLagen(d) {
  const A = bvAufbau(d), xs = {}, pos = []; let x = 30;
  for (const t of A.s) { const w = typeof t === 'string' ? BV.OW : BV.FW; pos.push(x + w / 2); if (typeof t !== 'string') xs[t.k] = x + w / 2; x += w; }
  return { A, xs, pos, W: x + 30 };
}
B.bruchvorlage = { name: 'Bruchrechnen zum Ausfüllen', gruppe: 'Mathe', def: { art: 'plus', aufgabe: '', faktor: '', erweitern: true, kuerzen: true, pfeile: true, kaestchen: true, loesung: false },
  felder: [{ k: 'art', l: 'Rechenart', typ: 'auswahl', opts: BV_ARTEN },
    { k: 'aufgabe', l: 'Aufgabe vorgeben (z. B. 2/3 + 1/4 – leer = alles zum Ausfüllen)', typ: 'text' },
    { k: 'faktor', l: 'Erweitern/Kürzen mit … (nur für die Lösung)', typ: 'text' },
    { k: 'erweitern', l: 'Schritt „Erweitern auf gleiche Nenner“ (Plus/Minus) – aus bei gleichnamigen Brüchen', typ: 'check' },
    { k: 'kuerzen', l: 'Schritt „Ergebnis kürzen“', typ: 'check' },
    { k: 'pfeile', l: 'Bögen mit Pfeil (· □ / : □)', typ: 'check' },
    { k: 'kaestchen', l: 'Gestrichelte Kästchen für Zähler und Nenner', typ: 'check' },
    { k: 'loesung', l: 'Lösung zeigen (grün)', typ: 'check' }],
  gen: d => {
    const { A, xs, pos, W } = bvLagen(d), br = bvBrueche(d.aufgabe), L = d.loesung ? bvLoesung(d, br) : null;
    const { MY, H } = BV, fs = 44, gruen = '#16a34a', ink = '#1f2937', gitter = '#94a3b8'; /* immer weißes Blatt – auch auf dunkler Tafel gut lesbar */
    const kasten = (cx, cy) => d.kaestchen ? `<rect x="${f(cx - 46)}" y="${f(cy - 30)}" width="92" height="60" rx="8" fill="none" stroke="${gitter}" stroke-width="2" stroke-dasharray="6 5"/>` : '';
    const paar = (cx, v, farbe) => { const g = String(v.z).length > 3 || String(v.n).length > 3 ? fs * 0.62 : fs;
      return tx(cx, MY - 40, String(v.z), farbe, g, 'middle', 'font-weight="700"') + tx(cx, MY + 40, String(v.n), farbe, g, 'middle', 'font-weight="700"'); };
    let out = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>`; /* weißer Hintergrund */
    A.s.forEach((t, i) => {
      const cx = pos[i];
      if (typeof t === 'string') { out += tx(cx, MY + 2, t, ink, fs, 'middle', 'font-weight="700"'); return; }
      out += ln(cx - 48, MY, cx + 48, MY, ink, 4) + kasten(cx, MY - 40) + kasten(cx, MY + 40); /* Bruchstrich vorgegeben */
      const vorgabe = t.k === 'A' ? br[0] : t.k === 'B' ? br[1] : null;
      if (vorgabe) out += paar(cx, vorgabe, ink); else if (L && L[t.k]) out += paar(cx, L[t.k], gruen);
    });
    if (d.pfeile !== false) for (const [v, z, oben, zeichen, wk] of A.b) out += bvBogen(xs[v] + 6, xs[z] - 6, oben ? MY - 82 : MY + 82, oben, zeichen, L ? L[wk] : null, d.kaestchen);
    return { svg: T._svg.doc(W, H, out), w: W, h: H };
  } };
/* ↗ Pfeile lösen: jeder Bogen wird ein eigenes Element (verschieben, breiter ziehen, löschen) – in der Vorlage aus */
function bvPfeileLoesen(o) {
  const d = { ...B.bruchvorlage.def, ...o.d }, { A, xs, W } = bvLagen(d), s = o.w / W, neu = [];
  for (const [v, z, oben, zeichen] of A.b) {
    const x1 = xs[v] + 6 - 12, breite = xs[z] - xs[v] - 12 + 24, y0 = oben ? BV.MY - 82 : BV.MY + 82, top = oben ? y0 - 96 : y0 - 14;
    neu.push({ t: 'o', id: T.uid(), k: 'bruchpfeil', d: { zeichen, lage: oben ? 'oben' : 'unten', breite: Math.round(breite), kaestchen: d.kaestchen }, x: o.x + x1 * s, y: o.y + top * s, w: breite * s, h: 110 * s, r: 0 });
  }
  if (!neu.length) { T.toast('Hier gibt es keine Pfeile.', 2000); return; }
  T.snap(); T.replaceItem({ ...o, d: { ...o.d, pfeile: false } }); neu.forEach(x => T.addItem(x)); T.S.sel = null; T.render(); T.renderOver();
  T.toast('↗ Die Pfeile sind jetzt einzelne Elemente – antippen und verschieben, an der Ecke breiter ziehen, 🗑 löschen.', 4000);
}
B.bruchvorlage.schnell = d => [
  { l: d.loesung ? '🙈 Lösung verdecken' : '👁 Lösung zeigen', f: dd => ({ d: { ...dd, loesung: !dd.loesung } }) },
  ...(d.art === 'plus' || d.art === 'minus' ? [{ l: d.erweitern === false ? '➕ Schritt Erweitern' : '➖ Ohne Erweitern (gleichnamig)', f: dd => ({ d: { ...dd, erweitern: dd.erweitern === false } }) }] : []),
  ...(d.art !== 'erweitern' && d.art !== 'kuerzen' ? [{ l: d.kuerzen === false ? '➕ Schritt Kürzen' : '➖ Ohne Kürzen', f: dd => ({ d: { ...dd, kuerzen: dd.kuerzen === false } }) }] : []),
  { l: d.pfeile === false ? '↷ Pfeile zeigen' : '↷ Pfeile ausblenden', f: dd => ({ d: { ...dd, pfeile: dd.pfeile === false } }) },
  ...(d.pfeile === false ? [] : [{ l: '↗ Pfeile lösen (verschiebbar)', aus: o => bvPfeileLoesen(o) }]), DURCH];
/* ↷ einzelner Bogenpfeil „· □“ / „: □“ – frei verschieben, breiter ziehen; oben oder unten gebogen */
B.bruchpfeil = { name: 'Bogenpfeil (· □ / : □)', gruppe: 'Mathe', def: { zeichen: '·', lage: 'oben', breite: 260, zahl: '', kaestchen: true },
  felder: [{ k: 'zeichen', l: 'Zeichen', typ: 'auswahl', opts: [['·', '· (erweitern)'], [':', ': (kürzen)']] }, { k: 'lage', l: 'Bogen', typ: 'auswahl', opts: [['oben', 'nach oben gewölbt'], ['unten', 'nach unten gewölbt']] },
    { k: 'breite', l: 'Breite', typ: 'zahl', min: 120, max: 900 }, { k: 'zahl', l: 'Zahl im Kästchen (leer = zum Ausfüllen)', typ: 'text' }, { k: 'kaestchen', l: 'Kästchen gestrichelt', typ: 'check' }],
  gen: d => { const W = T.clamp(+d.breite || 260, 120, 900), H = 110, oben = d.lage !== 'unten', y0 = oben ? 96 : 14;
    return { svg: T._svg.doc(W, H, bvBogen(12, W - 12, y0, oben, d.zeichen || '·', d.zahl, d.kaestchen)), w: W, h: H }; } };
B.bruchpfeil.schnell = d => [{ l: d.lage === 'unten' ? '⤴ nach oben gewölbt' : '⤵ nach unten gewölbt', f: dd => ({ d: { ...dd, lage: dd.lage === 'unten' ? 'oben' : 'unten' } }) },
  { l: d.zeichen === ':' ? '· erweitern' : ': kürzen', f: dd => ({ d: { ...dd, zeichen: dd.zeichen === ':' ? '·' : ':' } }) }, DURCH];
{ const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {}; /* Einfügen › Mathe: je Rechenart eine Kachel */
  for (const [v, l] of BV_ARTEN) KV['bruchvorlage:' + v] = { name: 'Bruchrechnen: ' + l, d: { art: v } }; }
})();
