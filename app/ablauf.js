// Tafel-App – 🔀 Abläufe sichtbar machen: Ablauf-Bausteine (Schritt, Start/Ende, Entscheidung, Ein-/Ausgabe, Station, Beschriftung)
// und ein SCHWEBENDES Menü wie bei den Schaltzeichen: antippen setzt den Baustein neben den letzten und verbindet beide mit einem
// haftenden Pfeil. Dazu fertige Vorlagen (Prozesskette, Kreislauf, Entscheidung, EVA, Ursache–Wirkung, Reiz–Reaktion, Energiekette …).
'use strict';
(function () {
const h = T.h, S = T.S, CM = T.CM, { doc, tx, f, esc } = T._svg;
const FARBEN = { blau: '#dcebfb', gruen: '#dff1e2', gelb: '#fff3c4', rot: '#fde0e3', lila: '#ece0f7', grau: '#e9edf1', ohne: 'none' };
const RAND = { blau: '#1565c0', gruen: '#2e7d32', gelb: '#b28704', rot: '#c62828', lila: '#6a1b9a', grau: '#546e7a', ohne: null };
const FORMEN = [['schritt', '▭ Schritt'], ['start', '⬭ Start / Ende'], ['entscheidung', '◇ Entscheidung'], ['eingabe', '▱ Ein-/Ausgabe'], ['station', '◯ Station'], ['beschriftung', 'Aa Beschriftung']];
const mctx = document.createElement('canvas').getContext('2d');
const breiteVon = (t, fs, fett) => { mctx.font = `${fett ? 700 : 400} ${fs}px Segoe UI`; return mctx.measureText(t).width; };
function umbrechen(text, maxW, fs, fett) { // Zeilenumbruch nach Breite; „|“ oder Zeilenumbruch erzwingen eine neue Zeile
  const out = [];
  for (const absatz of String(text || '').split(/\n|\|/)) {
    let z = '';
    for (const w of absatz.split(/\s+/).filter(Boolean)) {
      const neu = z ? z + ' ' + w : w;
      if (z && breiteVon(neu, fs, fett) > maxW) { out.push(z); z = w; } else z = neu;
    }
    out.push(z);
  }
  return out.length ? out : [''];
}
T.BAUSTEINE.ablauf = { name: 'Ablauf-Baustein', gruppe: 'Struktur',
  def: { form: 'schritt', text: 'Schritt', farbe: 'blau', breite: 5, groesse: 24, fett: false },
  felder: [{ k: 'text', l: 'Text (| = neue Zeile)', typ: 'text' }, { k: 'form', l: 'Form', typ: 'auswahl', opts: FORMEN.map(([v, l]) => [v, l]) },
    { k: 'farbe', l: 'Farbe', typ: 'auswahl', opts: [['blau', 'Blau'], ['gruen', 'Grün'], ['gelb', 'Gelb'], ['rot', 'Rot'], ['lila', 'Lila'], ['grau', 'Grau'], ['ohne', 'ohne Füllung']] },
    { k: 'breite', l: 'Breite (cm)', typ: 'zahl', min: 2, max: 20 }, { k: 'groesse', l: 'Schriftgröße', typ: 'zahl', min: 14, max: 60 }, { k: 'fett', l: 'fett', typ: 'check' }],
  gen: (d, P) => {
    const fs = T.clamp(+d.groesse || 24, 10, 80), form = d.form || 'schritt', hell = P.ink === '#1a1a1a';
    const fuell = FARBEN[d.farbe] || FARBEN.blau, rand = (hell && RAND[d.farbe]) || P.ink, gefuellt = fuell !== 'none' && form !== 'beschriftung';
    const tFarbe = gefuellt ? '#1a1a1a' : P.ink;
    let W = T.clamp(+d.breite || 5, 1, 30) * CM;
    const innen = form === 'entscheidung' ? 0.58 : form === 'station' ? 0.72 : form === 'eingabe' ? 0.78 : 0.88;
    const zeilen = umbrechen(d.text, W * innen - 8, fs, d.fett), lh = fs * 1.25;
    if (form === 'beschriftung') W = Math.max(...zeilen.map(z => breiteVon(z, fs, d.fett))) + 16;
    const textH = zeilen.length * lh;
    let H = Math.max(fs * 2.2, textH + fs * 1.1);
    if (form === 'entscheidung') H = Math.max(H, textH * 2 + fs * 1.4, W * 0.55);
    if (form === 'station') H = Math.max(H, textH / 0.72 + fs * 0.6);
    if (form === 'beschriftung') H = textH + 10;
    const m = 3, w = W - 2 * m, hh = H - 2 * m; let s = '';
    const st = `stroke="${rand}" stroke-width="3" fill="${gefuellt ? fuell : 'none'}"`;
    if (form === 'schritt') s += `<rect x="${m}" y="${m}" width="${f(w)}" height="${f(hh)}" rx="10" ${st}/>`;
    else if (form === 'start') s += `<rect x="${m}" y="${m}" width="${f(w)}" height="${f(hh)}" rx="${f(hh / 2)}" ${st}/>`;
    else if (form === 'entscheidung') s += `<polygon points="${f(W / 2)},${m} ${f(W - m)},${f(H / 2)} ${f(W / 2)},${f(H - m)} ${m},${f(H / 2)}" ${st}/>`;
    else if (form === 'eingabe') { const sch = Math.min(hh * 0.4, w * 0.15); s += `<polygon points="${f(m + sch)},${m} ${f(W - m)},${m} ${f(W - m - sch)},${f(H - m)} ${m},${f(H - m)}" ${st}/>`; }
    else if (form === 'station') s += `<ellipse cx="${f(W / 2)}" cy="${f(H / 2)}" rx="${f(w / 2)}" ry="${f(hh / 2)}" ${st}/>`;
    const y0 = H / 2 - textH / 2 + lh / 2;
    zeilen.forEach((z, i) => { s += tx(W / 2, y0 + i * lh, z, tFarbe, fs, 'middle', d.fett ? 'font-weight="700"' : ''); });
    return { svg: doc(W, H, s), w: W, h: H };
  } };

// ---------- Setzen und Verbinden ----------
const k = () => 1 / T.page().view.z; // Bausteine erscheinen auf dem Bildschirm immer gleich groß
function neu(d, x, y, mitte) { // x/y = linke obere Ecke (oder Mitte)
  const dd = { ...T.BAUSTEINE.ablauf.def, ...d }, g = T.genObj('ablauf', dd, false), s = k();
  const w = g.w * s, hh = g.h * s;
  return { t: 'o', id: T.uid(), k: 'ablauf', d: dd, x: mitte ? x - w / 2 : x, y: mitte ? y - hh / 2 : y, w, h: hh, r: 0 };
}
function pfeil(a, b) {
  const it = { t: 's', id: T.uid(), m: 'line', g: 1, c: S.farbe.stift, w: Math.max(3, Math.min(6, S.groesse.stift || 4)), arrow: true, p: [[a.x, a.y, .5], [b.x, b.y, .5]], an: [a.id, b.id] };
  const p = T.verbinderPunkte ? T.verbinderPunkte(T.page(), it) : null; if (p) it.p = p;
  return it;
}
let fenster = null, letztes = null, richtung = T.opts.ablaufRichtung || 'rechts', verbinden = T.opts.ablaufVerbinden !== false, farbe = T.opts.ablaufFarbe || 'blau';
const merke = () => { T.opts.ablaufRichtung = richtung; T.opts.ablaufVerbinden = verbinden; T.opts.ablaufFarbe = farbe; T.saveOpts(); };
function bezug() { // ausgewählter Ablauf-Baustein hat Vorrang (z. B. zweiter Ast einer Entscheidung)
  const pg = T.page();
  if (S.sel && S.sel.ids && S.sel.ids.size === 1) { const it = pg.items.find(i => S.sel.ids.has(i.id)); if (it && it.t === 'o') return it; }
  return letztes && pg.items.find(i => i.id === letztes) || null;
}
function setze(form, text) {
  const alt = bezug(), abstand = 1.6 * CM * k();
  let o;
  if (!alt) { const r = T.viewRect(); o = neu({ form, text, farbe }, r.x0 + (r.x1 - r.x0) * 0.12, r.y0 + (r.y1 - r.y0) * 0.3); }
  else {
    o = neu({ form, text, farbe }, 0, 0);
    if (richtung === 'unten') { o.x = alt.x + alt.w / 2 - o.w / 2; o.y = alt.y + alt.h + abstand; }
    else { o.x = alt.x + alt.w + abstand; o.y = alt.y + alt.h / 2 - o.h / 2; }
  }
  T.snap(); T.addItem(o);
  if (alt && verbinden && form !== 'beschriftung') T.addItem(pfeil(alt, o));
  letztes = o.id; T.nachEinfuegen([o.id]); T.render();
  return o;
}
// ---------- Vorlagen ----------
function legeAb(teile, pfeile) { // teile: [{d, x, y}] in cm relativ zur Mitte; pfeile: [[i, j], …]
  const r = T.viewRect(), cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2, s = CM * k();
  const objs = teile.map(t => neu({ farbe, ...t.d }, cx + t.x * s, cy + t.y * s, true));
  T.snap(); objs.forEach(o => T.addItem(o));
  const ps = pfeile.map(([i, j]) => pfeil(objs[i], objs[j])); ps.forEach(p => T.addItem(p));
  letztes = objs[objs.length - 1].id; T.nachEinfuegen(objs.map(o => o.id).concat(ps.map(p => p.id))); T.render();
  T.toast('Texte ändern: Baustein antippen → ✏️ Bearbeiten.', 3000);
}
const kette = (texte, form = 'schritt', abst = 7) => legeAb(texte.map((t, i) => ({ d: { form: Array.isArray(t) ? t[1] : form, text: Array.isArray(t) ? t[0] : t }, x: (i - (texte.length - 1) / 2) * abst, y: 0 })), texte.slice(1).map((_, i) => [i, i + 1]));
const kreis = (texte, form = 'station') => {
  const n = texte.length, R = Math.max(5, n * 1.35);
  legeAb(texte.map((t, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return { d: { form, text: t, breite: 4.6 }, x: R * 1.25 * Math.cos(a), y: R * 0.8 * Math.sin(a) }; }), texte.map((_, i) => [i, (i + 1) % n]));
};
const VORLAGEN = [
  ['➡ Prozesskette', () => kette([['Start', 'start'], 'Schritt 1', 'Schritt 2', 'Schritt 3', ['Ende', 'start']], 'schritt', 6.4)],
  ['🔄 Kreislauf (4)', () => kreis(['Station 1', 'Station 2', 'Station 3', 'Station 4'])],
  ['🔄 Kreislauf (6)', () => kreis(['Station 1', 'Station 2', 'Station 3', 'Station 4', 'Station 5', 'Station 6'])],
  ['◇ Ja/Nein-Entscheidung', () => legeAb([
    { d: { form: 'start', text: 'Start' }, x: -11, y: -3 }, { d: { form: 'schritt', text: 'Schritt' }, x: -4.5, y: -3 },
    { d: { form: 'entscheidung', text: 'Bedingung erfüllt?', breite: 5.5 }, x: 3, y: -3 },
    { d: { form: 'schritt', text: 'Schritt bei „ja“' }, x: 11, y: -3 }, { d: { form: 'schritt', text: 'Schritt bei „nein“' }, x: 3, y: 3.8 },
    { d: { form: 'beschriftung', text: 'ja', groesse: 22 }, x: 6.6, y: -4 }, { d: { form: 'beschriftung', text: 'nein', groesse: 22 }, x: 4.1, y: 0.9 }],
    [[0, 1], [1, 2], [2, 3], [2, 4]])],
  ['▱ EVA (Eingabe – Verarbeitung – Ausgabe)', () => kette([['Eingabe', 'eingabe'], 'Verarbeitung', ['Ausgabe', 'eingabe']], 'schritt', 7)],
  ['⇉ Ursachen → Wirkung', () => legeAb([
    { d: { text: 'Ursache 1' }, x: -6, y: -4 }, { d: { text: 'Ursache 2' }, x: -6, y: 0 }, { d: { text: 'Ursache 3' }, x: -6, y: 4 },
    { d: { text: 'Wirkung', farbe: 'rot', fett: true }, x: 4, y: 0 }], [[0, 3], [1, 3], [2, 3]])],
  ['⚡ Reiz-Reaktions-Schema', () => legeAb(['Reiz', 'Sinnesorgan', 'Nerv', 'Gehirn / Rückenmark', 'Nerv', 'Muskel', 'Reaktion'].map((t, i) => ({ d: { text: t, form: i === 0 || i === 6 ? 'start' : 'schritt', breite: i === 3 ? 4.6 : 3.8, groesse: 22 }, x: (i % 4) * 6 - 9, y: i < 4 ? -2.2 : 2.2 })).map((t, i) => i >= 4 ? { ...t, x: 9 - (i - 4) * 6 } : t),
    [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]])],
  ['🔋 Energiekette', () => legeAb([
    { d: { form: 'start', text: 'Energieform', farbe: 'gelb', breite: 4.2, groesse: 22 }, x: -12, y: 0 }, { d: { text: 'Energiewandler', breite: 4.2, groesse: 22 }, x: -6, y: 0 },
    { d: { form: 'start', text: 'Energieform', farbe: 'gelb', breite: 4.2, groesse: 22 }, x: 0, y: 0 }, { d: { text: 'Energiewandler', breite: 4.2, groesse: 22 }, x: 6, y: 0 },
    { d: { form: 'start', text: 'genutzte Energieform', farbe: 'gruen', breite: 4.2, groesse: 22 }, x: 12, y: 0 },
    { d: { form: 'start', text: 'thermische Energie (Umgebung)', farbe: 'grau', breite: 5.4, groesse: 20 }, x: 0, y: 4.5 }],
    [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [3, 5]])],
  ['💧 Wasserkreislauf', () => kreis(['Verdunstung', 'Kondensation (Wolken)', 'Niederschlag', 'Versickerung und Abfluss'])],
  ['📝 Vorgang: Erst – Dann – Zum Schluss', () => kette(['Zuerst …', 'Dann …', 'Danach …', 'Zum Schluss …'], 'schritt', 6.4)]
];

// ---------- 🔀 Schwebendes Menü ----------
function menue() {
  if (fenster && fenster.isConnected) { fenster.style.zIndex = 9999; return; }
  const bild = form => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj('ablauf', { form, farbe, text: form === 'beschriftung' ? 'Text' : '', breite: 3.4, groesse: 18 }, false).svg);
  const textFeld = h('input', { class: 'feld', placeholder: 'Text für den nächsten Baustein …', style: { width: '100%' }, onkeydown: e => { if (e.key === 'Enter') { e.preventDefault(); setze('schritt', textFeld.value || 'Schritt'); textFeld.value = ''; } } });
  const inhalt = h('div', { class: 'ab-menue' });
  const zeichne = () => {
    inhalt.innerHTML = '';
    const an = (v, txt, title, fn) => h('button', { class: 'big' + (v ? ' on' : ''), title, onclick: fn }, txt);
    inhalt.append(
      h('div', { class: 'row' }, an(richtung === 'rechts', '→ rechts', 'Nächster Baustein rechts daneben', () => { richtung = 'rechts'; merke(); zeichne(); }),
        an(richtung === 'unten', '↓ unten', 'Nächster Baustein darunter', () => { richtung = 'unten'; merke(); zeichne(); }),
        an(verbinden, '🔗 Pfeil', 'Automatisch mit einem haftenden Pfeil verbinden', () => { verbinden = !verbinden; merke(); zeichne(); }),
        h('button', { class: 'big', title: 'Neue Kette beginnen (nicht an den letzten anhängen)', onclick: () => { letztes = null; T.select && T.select([]); T.toast('Der nächste Baustein beginnt eine neue Kette.', 1800); } }, '✚ neu')),
      textFeld,
      h('div', { class: 'sz-gitter' }, ...FORMEN.map(([form, name]) => h('button', { class: 'sz-k', title: name + ' – antippen: neben den letzten setzen und verbinden',
        onclick: () => { setze(form, textFeld.value || (form === 'start' ? (bezug() ? 'Ende' : 'Start') : form === 'entscheidung' ? 'Frage?' : form === 'beschriftung' ? 'ja' : form === 'station' ? 'Station' : form === 'eingabe' ? 'Eingabe' : 'Schritt')); textFeld.value = ''; } },
        h('img', { src: bild(form), alt: '' }), h('span', {}, name.replace(/^\S+ /, ''))))),
      h('div', { class: 'row ab-farben' }, ...Object.keys(FARBEN).map(fb => h('button', { class: 'sw' + (fb === farbe ? ' on' : ''), title: fb === 'ohne' ? 'ohne Füllung' : fb, style: { background: fb === 'ohne' ? 'var(--surface)' : FARBEN[fb], width: '40px', height: '40px', border: `2px solid ${RAND[fb] || 'var(--line)'}` }, onclick: () => { farbe = fb; merke(); zeichne(); } }, fb === 'ohne' ? '∅' : ''))),
      h('details', { class: 'ab-vorlagen', open: !!T.opts.ablaufVorlagenAuf, ontoggle: e => { T.opts.ablaufVorlagenAuf = e.target.open; T.saveOpts(); } }, h('summary', {}, '📋 Fertige Vorlagen'),
        h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch' } }, ...VORLAGEN.map(([l, fn]) => h('button', { class: 'big', onclick: fn }, l)))),
      h('p', { class: 'hint', style: { margin: '6px 0 0', maxWidth: '380px' } }, 'Antippen setzt den Baustein neben den zuletzt gesetzten (oder den ausgewählten) und verbindet beide mit einem Pfeil. Für eine Verzweigung: Entscheidung auswählen, dann den nächsten Baustein antippen. Das Fenster bleibt offen, bis × getippt wird.'));
  };
  zeichne();
  fenster = T.widget('🔀 Abläufe', [inhalt], Math.max(20, innerWidth - 480), 110);
  fenster.classList.add('schwebemenue');
  fenster.onclose = () => { fenster = null; letztes = null; };
  if (T.schwebeMini) T.schwebeMini(fenster, 'ablauf');
}
T.ablaufMenue = menue;
})();
