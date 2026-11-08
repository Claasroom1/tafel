// Tafel-App – Favoriten: schwebende, frei verschiebbare Leiste mit Lieblingswerkzeugen (Knopf ⭐ Favoriten in der Werkzeugleiste).
// Favoriten sind Stifte (Farbe + Stärke), Marker, Laser, Radierer – oder beliebige Aktionen: Geodreieck, Lineal, Timer,
// Würfel, Scheinwerfer, Einfügen … Ein-/ausschalten: ⚙ Einstellungen oder Stift-Menü; × blendet aus.
// ＋ öffnet die Auswahl (aktueller Stift oder eine Aktion), ✎ = bearbeiten (× entfernt, Ziehen sortiert um, ↺ Standard). Position und Favoriten bleiben gespeichert.
'use strict';
(function () {
const h = T.h, S = T.S;
const STANDARD = [{ tool: 'stift', c: '#1a1a1a', w: 4 }, { tool: 'stift', c: '#d32f2f', w: 4 }, { tool: 'stift', c: '#1565c0', w: 4 },
  { tool: 'marker', c: '#ffe14d', w: 28 }, { tool: 'laser' }, { tool: 'radierer', w: 90 }];
const favs = () => Array.isArray(T.opts.favoriten) ? T.opts.favoriten : STANDARD; // auch eine leere Palette bleibt leer
let bearbeiten = false; // ✎-Modus: × entfernt, Ziehen sortiert um
let zieh = null, sortiert = false; // läuft gerade ein Verschieben der Leiste / ein Umsortieren?
const box = h('div', { id: 'palette' }); box.addEventListener('pointerdown', e => e.stopPropagation()); document.body.append(box);

// ---------- Aktionen, die in die Palette dürfen: id → [Symbol, Name, Bereich, ausführen, aktiv?] ----------
const C = () => T.CR || {}, inst = k => () => T.toggleInstrument(k), instAn = k => () => S.inst.some(i => i.kind === k);
const werkz = id => () => T.ui.setTool(id), werkzAn = id => () => S.tool === id;
const AKTIONEN = {
  auswahl: ['⬚', 'Auswahl', 'Werkzeuge', werkz('auswahl'), werkzAn('auswahl')],
  hand: ['✥', 'Tafel verschieben', 'Werkzeuge', werkz('hand'), werkzAn('hand')],
  text: ['T', 'Text', 'Werkzeuge', werkz('text'), werkzAn('text')],
  formen: ['◇', 'Formen', 'Werkzeuge', el => { T.ui.setTool('form'); T.ui.formPop(el); }, werkzAn('form')],
  undo: ['↶', 'Zurück', 'Werkzeuge', () => T.undo()],
  redo: ['↷', 'Vor', 'Werkzeuge', () => T.redo()],
  wischen: ['🧹', 'Wischen', 'Werkzeuge', el => T.ui.tafelWischen({ currentTarget: el })],
  lineal: ['📏', 'Lineal', 'Messen', inst('lineal'), instAn('lineal')],
  geodreieck: ['📐', 'Geodreieck', 'Messen', inst('geodreieck'), instAn('geodreieck')],
  winkelmesser: ['◠', 'Winkelmesser', 'Messen', inst('winkelmesser'), instAn('winkelmesser')],
  zirkel: ['🧭', 'Zirkel', 'Messen', inst('zirkel'), instAn('zirkel')],
  rechner: ['🧮', 'Rechner', 'Messen', () => T.ui.zeigeDock('werkzeuge', true)],
  plotter: ['📈', 'Funktionsplotter', 'Messen', () => T.plotter && T.plotter()],
  laser: ['🔴', 'Laserpointer', 'Hervorheben', () => waehle({ tool: 'laser' }), () => S.tool === 'stift' && S.stiftArt === 'laser'],
  marker: ['🖍', 'Textmarker', 'Werkzeuge', () => waehle({ tool: 'marker', c: S.farbe.marker, w: S.groesse.marker }), () => S.tool === 'marker'],
  scheinwerfer: ['🔦', 'Scheinwerfer', 'Hervorheben', () => C().scheinwerfer(), () => T.crAktiv && T.crAktiv('scheinwerfer')],
  schwarz: ['⬛', 'Tafel schwarz', 'Hervorheben', () => T.schwarz && T.schwarz(), () => T.schwarzAn && T.schwarzAn()],
  leselineal: ['📖', 'Leselineal', 'Hervorheben', () => C().leselineal(), () => T.crAktiv && T.crAktiv('leselineal')],
  lupe: ['🔍', 'Lupe', 'Hervorheben', () => C().lupe(), () => T.crAktiv && T.crAktiv('lupe')],
  vorhang: ['🎭', 'Vorhang', 'Hervorheben', () => T.vorhang(), () => T.vorhangAn && T.vorhangAn()],
  phasen: ['⏳', 'Phasentimer', 'Classroom', () => T.ui.phasenWidget()],
  timer: ['⏱', 'Timer / Stoppuhr', 'Classroom', () => T.ui.timerWidget()],
  stoppuhren: ['🏁', 'Mehrere Stoppuhren', 'Classroom', () => C().stoppuhren()],
  uhr: ['🕘', 'Uhr & Datum', 'Classroom', () => C().uhr()],
  arbeit: ['🤫', 'Arbeitssymbole', 'Classroom', () => C().arbeit()],
  ampel: ['🚦', 'Ampel', 'Classroom', () => C().ampel()],
  laut: ['🔊', 'Lautstärke', 'Classroom', () => C().laut()],
  zufall: ['🎯', 'Namen ziehen', 'Classroom', () => T.ui.zufallWidget()],
  gluecksrad: ['🎡', 'Glücksrad', 'Classroom', () => C().gluecksrad()],
  wuerfel: ['🎲', 'Würfel', 'Classroom', () => T.ui.wuerfelWidget()],
  gruppen: ['👥', 'Gruppen bilden', 'Classroom', () => C().gruppen()],
  punkte: ['🏆', 'Punktestand', 'Classroom', () => C().punkte()],
  umfrage: ['📊', 'Umfrage', 'Classroom', () => C().umfrage()],
  quiz: ['🔔', 'Team-Quiz', 'Classroom', () => C().quiz && C().quiz()],
  einfuegen: ['🧩', 'Einfügen', 'Fenster', () => T.ui.zeigeDock('einfuegen', true)],
  mathe: ['🧮', 'Aufgaben (Mathe / NaWi)', 'Fenster', () => T.ui.zeigeDock('aufgaben', true)],
  classroom: ['🎒', 'Classroom', 'Fenster', () => T.ui.zeigeDock('classroom', true)],
  seite: ['📄', 'Neue Seite', 'Fenster', () => T.ui.neueSeite()]
};
const BEREICHE = ['Werkzeuge', 'Messen', 'Hervorheben', 'Classroom', 'Fenster'];

const aktiv = f => f.aktion ? !!(AKTIONEN[f.aktion] && AKTIONEN[f.aktion][4] && AKTIONEN[f.aktion][4]())
  : f.tool === 'laser' ? S.tool === 'stift' && S.stiftArt === 'laser'
  : f.tool === 'radierer' ? S.tool === 'radierer' && S.groesse.radierer === f.w
  : S.tool === f.tool && S.stiftArt !== 'laser' && S.farbe[f.tool] === f.c && S.groesse[f.tool] === f.w && (f.tool !== 'stift' || !f.art || S.stiftArt === f.art);
function waehle(f, el) {
  if (f.aktion) { const a = AKTIONEN[f.aktion]; if (a) a[3](el); setTimeout(zeichne, 50); return; }
  if (f.tool === 'laser') { if (S.stiftArt !== 'laser') S.vorLaser = S.stiftArt; S.stiftArt = 'laser'; T.ui.setTool('stift'); }
  else if (f.tool === 'radierer') { S.groesse.radierer = f.w; T.ui.setTool('radierer'); }
  else { if (S.stiftArt === 'laser') S.stiftArt = S.vorLaser || 'normal'; if (f.tool === 'stift' && f.art) S.stiftArt = f.art; S.farbe[f.tool] = f.c; S.groesse[f.tool] = f.w; T.ui.setTool(f.tool); }
  zeichne();
}
function aktuell() { // das gerade eingestellte Werkzeug als Favorit
  if (S.tool === 'stift' && S.stiftArt === 'laser') return { tool: 'laser' };
  if (S.tool === 'radierer') return { tool: 'radierer', w: S.groesse.radierer };
  const t = S.tool === 'marker' ? 'marker' : 'stift'; return { tool: t, c: S.farbe[t], w: S.groesse[t], art: t === 'stift' ? S.stiftArt : undefined };
}
const titel = f => f.aktion ? (AKTIONEN[f.aktion] || ['', f.aktion])[1] : f.tool === 'laser' ? 'Laserpointer' : f.tool === 'radierer' ? 'Radierer' : (f.tool === 'marker' ? 'Marker ' : f.art === 'kalli' ? 'Feder ' : 'Stift ') + f.c;
// Stifte ohne feste Art folgen der eingestellten Stiftart – ihr Symbol auch (Feder an → Federsymbol)
const ikon = f => f.tool === 'marker' ? 'marker' : (f.art || (S.stiftArt === 'laser' ? S.vorLaser : S.stiftArt)) === 'kalli' ? 'feder' : 'stift';
function knopf(f, i) {
  let inhalt;
  const IC = T.ICON || {};
  if (f.aktion === 'marker' && IC.marker) inhalt = h('span', { class: 'pa-ico', html: IC.marker });
  else if (f.aktion) inhalt = h('span', { class: 'pa-sym' }, (AKTIONEN[f.aktion] || ['?'])[0]);
  else if ((f.tool === 'stift' || f.tool === 'marker') && IC.stift) { // gleiche Symbole wie in der Werkzeugleiste, Farbe als Punkt an der Spitze
    inhalt = h('span', { class: 'pa-ico', html: IC[ikon(f)] }); inhalt.append(h('i', { style: { background: f.c } })); }
  else if (f.tool === 'laser') inhalt = h('span', { class: 'pa-sym' }, '🔴');
  else if (f.tool === 'radierer') inhalt = h('span', { class: 'pa-sym' }, '🧽');
  else { const gr = Math.max(8, Math.min(26, f.tool === 'marker' ? f.w / 2 : f.w * 2.4)); inhalt = h('i', { style: { width: gr + 'px', height: gr + 'px', background: f.c, borderRadius: f.tool === 'marker' ? '4px' : '50%', opacity: f.tool === 'marker' ? .8 : 1 } }); }
  if (bearbeiten) { // Bearbeiten: × entfernt, am Element ziehen sortiert um
    const b = h('div', { class: 'pa-k pa-edit', 'data-i': i, title: titel(f) + ' – ziehen: umsortieren' + (f.tool === 'stift' || f.tool === 'marker' ? ', antippen: ändern' : '') }, inhalt,
      h('button', { class: 'pa-x', title: 'Entfernen', onclick: e => { e.stopPropagation(); const l = favs().slice(); l.splice(i, 1); T.opts.favoriten = l; T.saveOpts(); zeichne(); } }, '×'));
    b.addEventListener('pointerdown', e => {
      // Bewegung am ganzen Fenster verfolgen: das Element wandert beim Umsortieren im DOM – dabei ginge ein Pointer-Capture verloren
      if (e.target.closest('.pa-x') || sortiert) return; e.preventDefault(); e.stopPropagation(); b.classList.add('zieht'); sortiert = true; const id = e.pointerId, sx = e.clientX, sy = e.clientY; let bewegt = false;
      const mv = ev => { if (ev.pointerId !== id) return; ev.preventDefault(); ev.stopPropagation(); if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) bewegt = true;
        const ziel = document.elementsFromPoint(ev.clientX, ev.clientY).find(x => x !== b && x.classList && x.classList.contains('pa-edit')); if (!ziel) return;
        const r = ziel.getBoundingClientRect(), vor = r.width > r.height * 1.5 ? ev.clientX < r.left + r.width / 2 : ev.clientY < r.top + r.height / 2;
        const nach = vor ? ziel : ziel.nextSibling; if (nach !== b && b.nextSibling !== nach) box.insertBefore(b, nach); };
      const up = ev => { if (ev.pointerId !== id) return; ev.stopPropagation(); for (const [t, f] of [['pointermove', mv], ['pointerup', up], ['pointercancel', up]]) removeEventListener(t, f, true);
        b.classList.remove('zieht'); sortiert = false;
        if (!bewegt && ev.type === 'pointerup') { if (f.tool === 'stift' || f.tool === 'marker') stiftAendern(b, i); return; } // nur angetippt: Stift ändern
        const alt = favs(); T.opts.favoriten = [...box.querySelectorAll('.pa-edit')].map(x => alt[+x.dataset.i]); T.saveOpts(); zeichne(); };
      addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
    });
    return b;
  }
  const b = h('button', { class: 'pa-k' + (aktiv(f) ? ' on' : ''), title: titel(f) + ' – lang drücken: entfernen' }, inhalt);
  let t = 0, lang = false;
  b.addEventListener('pointerdown', () => { lang = false; t = setTimeout(async () => { lang = true; if (await T.frage(`„${titel(f)}“ aus den Favoriten entfernen?`, { ok: 'Entfernen' })) { const l = favs().slice(); l.splice(i, 1); T.opts.favoriten = l; T.saveOpts(); zeichne(); } }, 650); });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => clearTimeout(t));
  b.addEventListener('click', e => { if (!lang) waehle(f, e.currentTarget); });
  return b;
}
// ＋: aktuellen Stift speichern oder eine Aktion auswählen
// Stift-Baukasten: Art (Stift / Feder / Textmarker), Farbe und Stärke direkt hier wählen – ohne das Menü zu verlassen
function stiftBau(s, neu) {
  const W = T.STIFTWAHL || {}, IC = T.ICON || {}, mk = s.tool === 'marker';
  const art = (tool, a, ico, txt) => h('button', { class: 'big' + (s.tool === tool && (tool === 'marker' || (s.art || 'normal') === a) ? ' on' : ''), style: { display: 'flex', alignItems: 'center', gap: '8px' },
    onclick: () => { if (s.tool !== tool) { s.c = tool === 'marker' ? (S.farbe.marker || '#ffe14d') : (S.farbe.stift || '#1a1a1a'); s.w = (tool === 'marker' ? S.groesse.marker : S.groesse.stift) || W.GROESSEN[tool][1]; } s.tool = tool; s.art = tool === 'stift' ? a : undefined; neu(); } },
    h('span', { class: 'ico-k', html: IC[ico] || '' }), txt);
  const farben = (mk ? W.MARKER_MEHR : W.MEHR) || [];
  const gr = (W.GROESSEN || {})[s.tool] || [];
  return [h('div', { class: 'row' }, art('stift', 'normal', 'stift', 'Stift'), art('stift', 'kalli', 'feder', 'Feder'), art('marker', '', 'marker', 'Textmarker')),
    h('div', { class: 'row pa-farben' }, ...farben.map(c => h('button', { class: 'sw' + (s.c === c ? ' on' : ''), title: c, style: { background: c, width: '38px', height: '38px', outline: s.c === c ? '3px solid var(--acc)' : '', outlineOffset: '2px' }, onclick: () => { s.c = c; neu(); } })),
      h('input', { type: 'color', value: s.c, title: 'Eigene Farbe', style: { width: '44px', height: '38px' }, onchange: e => { s.c = e.target.value; neu(); } })),
    h('div', { class: 'row' }, ...gr.map((g, i) => { const d = Math.min(26, Math.max(4, mk ? g / 2.6 : g * 1.5));
      return h('button', { class: 'big' + (s.w === g ? ' on' : ''), style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '70px' }, onclick: () => { s.w = g; neu(); } },
        h('i', { style: { display: 'block', width: d + 'px', height: d + 'px', borderRadius: mk ? '4px' : '50%', background: s.c, opacity: mk ? .8 : 1, boxShadow: '0 0 0 1px rgba(0,0,0,.25)' } }), (W.STAERKE_NAME || [])[i] || ''); }))];
}
function hinzufuegen(anker, s) {
  const fuegeHinzu = f => { if (favs().length >= 16) { T.toast('Höchstens 16 Elemente – erst eines entfernen (⚙).', 2500); return; } T.opts.favoriten = favs().concat(f); T.saveOpts(); T.closePops(); zeichne(); };
  const schon = new Set(favs().filter(f => f.aktion).map(f => f.aktion)), a = aktuell();
  if (!s) s = a.tool === 'stift' || a.tool === 'marker' ? { ...a, art: a.tool === 'stift' ? (a.art === 'kalli' ? 'kalli' : 'normal') : undefined } : { tool: 'stift', art: 'normal', c: S.farbe.stift, w: S.groesse.stift };
  T.openPop(anker, h('h4', {}, '＋ Stift zusammenstellen'), ...stiftBau(s, () => hinzufuegen(anker, s)),
    h('div', { class: 'row', style: { marginTop: '6px' } }, h('button', { class: 'big prim', onclick: () => fuegeHinzu({ ...s }) }, '＋ Diesen ' + (s.tool === 'marker' ? 'Marker' : s.art === 'kalli' ? 'Federstift' : 'Stift') + ' zu den Favoriten')),
    ...BEREICHE.flatMap(b => [h('h4', { style: { marginTop: '10px' } }, b), h('div', { class: 'row pa-wahl' }, ...Object.entries(AKTIONEN).filter(([, x]) => x[2] === b).map(([id, x]) =>
      h('button', { class: 'big' + (schon.has(id) ? ' on' : ''), disabled: schon.has(id), title: schon.has(id) ? 'Schon in den Favoriten' : '', onclick: () => fuegeHinzu({ aktion: id }), html: (id === 'marker' && T.ICON ? `<span class="ico-k" style="vertical-align:middle">${T.ICON.marker}</span>` : x[0]) + ' ' + x[1] })))]),
    h('p', { class: 'hint' }, 'Entfernen, umsortieren und Stifte ändern: ⚙ in den Favoriten.'));
}
// Bearbeiten: einen Stift der Favoriten antippen → Art, Farbe, Stärke ändern
function stiftAendern(anker, i, s) {
  const f = favs()[i]; if (!f) return;
  if (!s) s = { tool: f.tool, c: f.c, w: f.w, art: f.tool === 'stift' ? (f.art || 'normal') : undefined };
  T.openPop(anker, h('h4', {}, 'Favorit ändern'), ...stiftBau(s, () => stiftAendern(anker, i, s)),
    h('div', { class: 'row', style: { marginTop: '6px' } }, h('button', { class: 'big prim', onclick: () => { const l = favs().slice(); l[i] = { ...s }; T.opts.favoriten = l; T.saveOpts(); T.closePops(); zeichne(); } }, '✓ Übernehmen')));
}
function zeichne() {
  const an = !!T.opts.palette && !!S.board;
  if (sortiert) return; // während des Umsortierens nicht neu aufbauen
  box.style.display = an ? 'flex' : 'none'; if (!an) return;
  box.innerHTML = '';
  const griff = h('div', { class: 'pa-griff', title: 'Ziehen: Favoriten verschieben' }, '✥');
  box.classList.toggle('bearbeiten', bearbeiten);
  box.append(griff, ...favs().map(knopf), h('div', { class: 'pa-trenn' }), // Trennlinie: darunter nur Verwaltung, keine Favoriten
    h('button', { class: 'pa-k pa-plus', title: 'Hinzufügen: aktueller Stift oder Geodreieck, Timer, Würfel …', onclick: e => hinzufuegen(e.currentTarget) }, '＋'),
    ...(bearbeiten
      ? [h('button', { class: 'pa-k pa-plus', title: 'Zurück zu den Standard-Favoriten', onclick: async () => { if (await T.frage('Favoriten auf die Standard-Stifte zurücksetzen?', { ok: 'Zurücksetzen' })) { delete T.opts.favoriten; T.saveOpts(); zeichne(); } } }, '↺'),
         h('button', { class: 'pa-k pa-fertig', title: 'Bearbeiten beenden', onclick: () => { bearbeiten = false; zeichne(); } }, '✓')]
      : [h('button', { class: 'pa-k pa-plus', title: 'Favoriten bearbeiten: entfernen und umsortieren', onclick: () => { bearbeiten = true; zeichne(); } }, '⚙'),
         h('button', { class: 'pa-k pa-zu', title: 'Favoriten ausblenden (wieder einblenden: ⭐ Favoriten in der Werkzeugleiste)', onclick: () => T.paletteZeigen(false) }, '×')]));
  if (!favs().length && !bearbeiten) box.insertBefore(h('span', { class: 'pa-leer' }, 'leer – ＋'), box.children[1]);
  // Position (gespeichert)
  const p = T.opts.palettePos || { x: innerWidth - 120, y: 140 };
  if (!zieh) { box.style.left = T.clamp(p.x, 0, innerWidth - 60) + 'px'; box.style.top = T.clamp(p.y, 56, Math.max(56, innerHeight - box.offsetHeight - 10)) + 'px'; }
  griff.addEventListener('pointerdown', ziehStart);
}
// Verschieben am ✥ (oder am Rand der Leiste): Bewegung wird am ganzen Fenster verfolgt –
// so reißt das Ziehen nicht ab, wenn Finger/Stift/Maus den kleinen Griff verlässt oder die Leiste neu gezeichnet wird.
function ziehStart(e) {
  if (zieh || (e.button && e.button !== 0)) return;
  e.preventDefault(); e.stopPropagation();
  const r = box.getBoundingClientRect(); zieh = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top };
  box.classList.add('zieht');
  addEventListener('pointermove', ziehMove, true); addEventListener('pointerup', ziehEnde, true); addEventListener('pointercancel', ziehEnde, true);
}
function ziehMove(e) {
  if (!zieh || e.pointerId !== zieh.id) return; e.preventDefault(); e.stopPropagation();
  box.style.left = T.clamp(e.clientX - zieh.dx, 0, innerWidth - 60) + 'px'; box.style.top = T.clamp(e.clientY - zieh.dy, 56, innerHeight - 80) + 'px';
}
function ziehEnde(e) {
  if (!zieh || e.pointerId !== zieh.id) return; e.stopPropagation(); zieh = null; box.classList.remove('zieht');
  removeEventListener('pointermove', ziehMove, true); removeEventListener('pointerup', ziehEnde, true); removeEventListener('pointercancel', ziehEnde, true);
  T.opts.palettePos = { x: parseInt(box.style.left), y: parseInt(box.style.top) }; T.saveOpts();
}
box.addEventListener('pointerdown', e => { if (e.target === box && !box.classList.contains('bearbeiten')) ziehStart(e); }); // auch am Rand der Leiste greifen
T.paletteZeigen = an => { if (an != null) { T.opts.palette = an; T.saveOpts(); } if (T.ui && T.ui.updateToolbar) T.ui.updateToolbar(); else zeichne(); }; // Knopf ⭐ Favoriten zeigt an/aus
T.paletteNeu = zeichne; // wird von der Werkzeugleiste bei jedem Wechsel aufgerufen
addEventListener('resize', () => { if (T.opts.palette) zeichne(); }); // im Fenster halten

// Doppeltipp „zuletzt benutzt“: merkt sich jedes Hilfsmittel, das eingeschaltet wird – egal ob über Menü, Favoriten oder Werkzeuge
// (palette.js lädt nach allen Werkzeug-Dateien, deshalb hier)
{
  const C = T.CR || {};
  const merke = (obj, key, id, istAn) => { const f = obj[key]; if (typeof f !== 'function') return;
    obj[key] = function (...a) { const r = f.apply(this, a); const name = id || a[0]; try { if (istAn(name)) T.merkeHilfe && T.merkeHilfe(name); } catch (e) {} return r; }; };
  merke(T, 'toggleInstrument', null, k => S.inst.some(i => i.kind === k));
  for (const k of ['scheinwerfer', 'lupe', 'leselineal']) merke(C, k, k, () => T.crAktiv && T.crAktiv(k));
  merke(T, 'vorhang', 'vorhang', () => T.vorhangAn && T.vorhangAn());
  merke(T, 'schwarz', 'schwarz', () => T.schwarzAn && T.schwarzAn());
}
})();
