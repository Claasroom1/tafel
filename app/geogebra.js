// Tafel-App – GeoGebra in der Mathe-Tafel (offizielle Einbettung über geogebra.org, nur mit Internet)
// GeoGebra ist für nicht-kommerzielle Nutzung (Unterricht) kostenlos; die Apps werden live von geogebra.org geladen, nichts wird mitgeliefert.
'use strict';
(function () {
const h = T.h;
const APPS = [['graphing', '📈', 'Grafikrechner'], ['geometry', '📐', 'Geometrie'], ['3d', '🧊', '3D-Rechner'], ['cas', '🧮', 'CAS-Rechner']];
let ov = null, flaeche = null, chips = null, aktiv = null, laden = null;
const applets = {}; // je App ein eigenes Fenster – Konstruktionen bleiben erhalten, solange die Tafel offen ist

function ladeGgb() {
  if (window.GGBApplet) return Promise.resolve();
  return laden || (laden = new Promise((ok, fehler) => {
    const s = document.createElement('script'); s.src = 'https://www.geogebra.org/apps/deployggb.js';
    s.onload = ok; s.onerror = () => { s.remove(); laden = null; fehler(new Error('offline')); };
    document.head.append(s);
  }));
}
function offline() {
  T.toast('GeoGebra braucht Internet (wird von geogebra.org geladen). Ohne Internet: 📈 Funktionsplotter unter Werkzeuge.', 7000,
    [['📈 Plotter öffnen', () => T.plotter()]]);
}

function fenster() {
  if (ov) { ov.style.display = 'flex'; return; }
  chips = h('div', { class: 'row', style: { gap: '6px' } });
  flaeche = h('div', { class: 'ggb-flaeche' });
  ov = h('div', { class: 'plot-ov ggb-ov' },
    h('div', { class: 'plot-kopf' }, h('b', {}, 'GeoGebra'), chips, h('span', { style: { flex: 1 } }),
      h('button', { class: 'big', title: 'Die Zeichenfläche als Bild auf die Tafel – dort weiter beschriften', onclick: alsBild }, '📷 Als Bild auf die Tafel'),
      h('button', { class: 'nzu', title: 'Schließen (die Konstruktion bleibt erhalten, solange die Tafel-App geöffnet ist)', onclick: () => { ov.style.display = 'none'; } }, '×')),
    flaeche, h('div', { class: 'ggb-fuss' }, 'GeoGebra® – geogebra.org, für den Unterricht kostenlos. Läuft nur mit Internet.'));
  ov.addEventListener('pointerdown', e => e.stopPropagation());
  document.body.append(ov);
}
function zeigeChips() {
  chips.innerHTML = '';
  for (const [id, em, n] of APPS) chips.append(h('button', { class: 'kat' + (id === aktiv ? ' on' : ''), onclick: () => T.geogebra(id) }, em + ' ' + n));
}
function groesse() {
  const a = applets[aktiv]; if (!a || !a.api || !ov || ov.style.display === 'none') return;
  try { a.api.setSize(flaeche.clientWidth, flaeche.clientHeight); } catch (e) {}
}
addEventListener('resize', () => setTimeout(groesse, 100));

T.geogebra = async (app = 'graphing') => {
  try { await ladeGgb(); } catch (e) { offline(); return; }
  fenster(); aktiv = app; zeigeChips();
  for (const [id, a] of Object.entries(applets)) a.box.style.display = id === app ? '' : 'none';
  if (applets[app]) { groesse(); return; }
  const id = 'ggb_' + app.replace(/\W/g, ''), box = h('div', { id, class: 'ggb-box' }, h('p', { class: 'hint', style: { padding: '20px' } }, 'GeoGebra wird geladen …'));
  flaeche.append(box); const a = applets[app] = { box, api: null };
  const ggb = new window.GGBApplet({
    appName: app, id: id + 'api', width: flaeche.clientWidth, height: flaeche.clientHeight, language: 'de',
    showToolBar: true, showAlgebraInput: true, showMenuBar: true, enableShiftDragZoom: true, showResetIcon: false, useBrowserForJS: false,
    appletOnLoad: api => { a.api = api; groesse(); }
  }, true);
  ggb.inject(id);
};

function alsBild() {
  const a = applets[aktiv];
  if (!a || !a.api) { T.toast('GeoGebra ist noch nicht geladen.'); return; }
  let b64 = '';
  try { b64 = a.api.getPNGBase64(1.5, false, 96); } catch (e) {}
  if (!b64) { T.toast('Bild konnte nicht erzeugt werden (beim 3D-Rechner nicht möglich).', 4000); return; }
  const src = 'data:image/png;base64,' + b64, img = new Image();
  img.onload = () => { ov.style.display = 'none'; T.addBild(src, img.naturalWidth, img.naturalHeight); };
  img.src = src;
}
})();
