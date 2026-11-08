// Tafel-App – 📷 Kamera / Dokumentenkamera und 🖥 anderes Fenster als Live-Hintergrund der Tafel.
// Das Bild liegt HINTER der Tafel; Stifte, Textmarker, Lineal, Scheinwerfer, Leselineal … arbeiten ganz normal darüber.
// 📸 Festhalten legt das aktuelle Bild als normales Bild auf die Tafel (dann ist die Kamera aus). Nichts wird automatisch gespeichert.
'use strict';
(function () {
const h = T.h, S = T.S;
let strom = null, video = null, fenster = null, art = null, dreh = 0, spiegel = false, geraetId = T.opts.kameraId || '';
let lupe = { z: 1, x: 0, y: 0 }, steuer = null; /* 🔍 Ausschnitt des Live-Bilds; steuer: CaptureController (geteilter Edge-Tab: blättern/zoomen) */
const alleStroeme = new Set(); let startNr = 0; // jeder gestartete Strom wird gemerkt – „Aus“ beendet wirklich alle (auch bei doppeltem Antippen)
const stoppeAlle = () => { for (const s of alleStroeme) s.getTracks().forEach(t => t.stop()); alleStroeme.clear(); strom = null; };

function stil() {
  if (!video) return;
  video.style.transform = `translate(${lupe.x}%, ${lupe.y}%) scale(${lupe.z}) rotate(${dreh}deg)` + (spiegel ? ' scaleX(-1)' : '');
  const quer = dreh % 180 !== 0; video.classList.toggle('quer', quer);
}
function aus(still) {
  startNr++; stoppeAlle(); if (video) { video.srcObject = null; video.remove(); video = null; }
  document.querySelectorAll('#liveVideo').forEach(v => v.remove());
  T.liveHg = false; document.body.classList.remove('liveHg'); T.render(); T.renderOver();
  if (fenster && fenster.isConnected) { fenster.remove(); } fenster = null; art = null;
  if (!still) T.toast('Live-Bild aus – die Tafel ist wieder normal.', 1800);
}
T.kameraAus = aus;
// Welche Kamera? Gemerkte Wahl dieses Boards – sonst bevorzugt eine echte USB-/Dokumentenkamera statt Handy- oder virtueller Kameras
// (Windows meldet z. B. das per „Smartphone-Link“ verbundene Handy als Kamera).
const VIRTUELL = /phone|handy|smartphone|link|virtual|virtuell|obs|droidcam|iriun|epoccam|continuity|camo|snap camera|xsplit|nvidia broadcast|teams/i;
async function kameraWaehlen() {
  let l = await kameraListe();
  if (l.length && !l.some(g => g.label)) { // Namen gibt es erst nach einer Erlaubnis: kurz öffnen und gleich wieder schließen
    try { const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); s.getTracks().forEach(t => t.stop()); l = await kameraListe(); } catch (e) { return ''; }
  }
  const gemerkt = geraetId && l.find(g => g.deviceId === geraetId);
  if (gemerkt && (T.opts.kameraManuell || !VIRTUELL.test(gemerkt.label || ''))) return geraetId; // selbst gewählt – oder keine Handy-Kamera
  const echt = l.find(g => g.label && !VIRTUELL.test(g.label));
  return (echt || l[0] || {}).deviceId || '';
}
async function starten(neuArt, id) {
  if (T.videoHgAus) T.videoHgAus(); /* ein Video hinter der Tafel weicht dem Live-Bild */
  if (neuArt === 'kamera' && !id) id = await kameraWaehlen();
  stoppeAlle(); const nr = ++startNr; let neu;
  try {
    if (neuArt === 'fenster') {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) throw new Error('Dieser Browser kann kein Fenster teilen.');
      // Beim Teilen NICHT zum geteilten Fenster wechseln – man bleibt auf der Tafel (Edge/Chrome: CaptureController)
      const ctrl = typeof CaptureController === 'function' ? new CaptureController() : null;
      T.toast('Programm nicht in der Liste? Es darf nicht minimiert sein – kurz in der Taskleiste öffnen, dann hier erneut „🖥 Anderes Fenster“. Die Liste wird jedes Mal neu erstellt.', 7000);
      /* Fenster zuerst anbieten; surfaceSwitching: über die Freigabe-Leiste von Edge später auf ein anderes (auch neu geöffnetes) Fenster umschalten */
      neu = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'never', displaySurface: 'window' }, audio: false, selfBrowserSurface: 'exclude', surfaceSwitching: 'include', ...(ctrl ? { controller: ctrl } : {}) });
      try { if (ctrl && ctrl.setFocusBehavior) ctrl.setFocusBehavior('no-focus-change'); } catch (e) {} // muss sofort nach dem Teilen kommen
      try { window.focus(); } catch (e) {}
      steuer = ctrl; lupe = { z: 1, x: 0, y: 0 };
    } else {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Keine Kamera verfügbar (Browser).');
      neu = await navigator.mediaDevices.getUserMedia({ video: { deviceId: id ? { exact: id } : undefined, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
    }
    if (nr !== startNr) { neu.getTracks().forEach(t => t.stop()); return false; } // inzwischen erneut gestartet oder beendet
    stoppeAlle(); alleStroeme.add(neu); strom = neu; // ältere Ströme beenden, nur den neuen behalten
    if (neuArt !== 'fenster') { const spur = strom.getVideoTracks()[0], s = spur && spur.getSettings ? spur.getSettings() : {}; if (s.deviceId) geraetId = s.deviceId; } // gemerkt wird nur eine selbst gewählte Kamera
  } catch (e) {
    T.toast(e && e.name === 'NotAllowedError' ? 'Zugriff nicht erlaubt – im Browser die Kamera bzw. das Teilen zulassen.' : 'Bild konnte nicht gestartet werden: ' + (e.message || e), 4500);
    if (!video) aus(true); return false;
  }
  art = neuArt;
  if (!video) { video = h('video', { id: 'liveVideo', autoplay: true, muted: true, playsinline: true }); document.body.insertBefore(video, document.getElementById('cMain')); }
  video.srcObject = strom; try { await Promise.race([video.play(), new Promise(r => setTimeout(r, 1500))]); } catch (e) {} // nie hängen bleiben
  strom.getVideoTracks()[0].addEventListener('ended', () => { if (art === neuArt) aus(); }); // Teilen im Browser beendet
  T.liveHg = true; document.body.classList.add('liveHg'); stil(); T.render(); T.renderOver();
  return true;
}
// Standbild: aktuelles Bild (gedreht/gespiegelt wie angezeigt) als normales Bild auf die Tafel
function festhalten() {
  if (!video || !video.videoWidth) { T.toast('Noch kein Bild – einen Moment warten.', 1500); return; }
  const vw = video.videoWidth, vh = video.videoHeight, quer = dreh % 180 !== 0;
  const c = document.createElement('canvas'); c.width = quer ? vh : vw; c.height = quer ? vw : vh;
  const x = c.getContext('2d'); x.translate(c.width / 2, c.height / 2); x.rotate(dreh * Math.PI / 180); if (spiegel) x.scale(-1, 1); x.drawImage(video, -vw / 2, -vh / 2);
  const src = c.toDataURL('image/jpeg', 0.85);
  aus(true); T.addBild(src, c.width, c.height, null, 0.95, 4);
  T.toast('📸 Standbild liegt auf der Tafel – jetzt darauf schreiben. Tipp: „🔒 Fixieren“, damit es nicht verrutscht.', 3500);
}
// 🔍 Live-Bild vergrößern und verschieben (geht bei jedem Fenster und bei der Kamera)
function lupeSetzen(dz, dx, dy, reset) {
  if (reset) lupe = { z: 1, x: 0, y: 0 };
  else { lupe.z = T.clamp(Math.round(lupe.z * (dz || 1) * 100) / 100, 1, 6); const g = 50 * (lupe.z - 1) / lupe.z; lupe.x = T.clamp(lupe.x + (dx || 0), -g * lupe.z, g * lupe.z); lupe.y = T.clamp(lupe.y + (dy || 0), -g * lupe.z, g * lupe.z); }
  if (lupe.z === 1) { lupe.x = 0; lupe.y = 0; }
  stil(); const a = fenster && fenster.querySelector('.lupe-z'); if (a) a.textContent = Math.round(lupe.z * 100) + ' %';
}
// 📖 Geteilter Edge-Tab (z. B. Schulbuch im Browser): scrollen = weiterblättern, Seiten-Zoom – Edge fragt beim ersten Mal nach Erlaubnis
const tabSteuerbar = () => { const sp = strom && strom.getVideoTracks()[0], s = sp && sp.getSettings ? sp.getSettings() : {}; return !!(steuer && steuer.sendWheel && s.displaySurface === 'browser'); };
async function blaettern(richtung) {
  try {
    const sp = strom.getVideoTracks()[0], s = sp.getSettings();
    await steuer.sendWheel({ x: Math.round((s.width || 1280) / 2), y: Math.round((s.height || 800) / 2), wheelDeltaX: 0, wheelDeltaY: richtung * Math.round((s.height || 800) * 0.8) });
  } catch (e) { T.toast('Blättern ging nicht: ' + (e.message || e) + ' – in Edge die Erlaubnis zum Steuern zulassen.', 4500); }
}
async function tabZoom(d) {
  try { if (d > 0) await steuer.increaseZoomLevel(); else if (d < 0) await steuer.decreaseZoomLevel(); else await steuer.resetZoomLevel(); }
  catch (e) { T.toast('Zoomen im Tab ging nicht: ' + (e.message || e), 4000); }
}
async function kameraListe() {
  try { const l = await navigator.mediaDevices.enumerateDevices(); return l.filter(d => d.kind === 'videoinput'); } catch (e) { return []; }
}
async function panel() {
  if (fenster && fenster.isConnected) fenster.remove();
  const knopf = (txt, title, fn, prim) => h('button', { class: 'big' + (prim ? ' prim' : ''), title, onclick: fn }, txt);
  const reihe = h('div', { class: 'row' });
  if (art === 'kamera') {
    const geraete = await kameraListe();
    if (geraete.length > 1) reihe.append(h('label', { class: 'fld', style: { margin: 0, width: '100%' } }, 'Kamera (wird für dieses Board gemerkt)',
      h('select', { class: 'feld', title: 'Kamera wählen (USB-Kamera, Dokumentenkamera, Webcam …)', onchange: async e => { geraetId = e.target.value; T.opts.kameraId = geraetId; T.opts.kameraManuell = true; T.saveOpts(); if (await starten('kamera', e.target.value)) panel(); } },
        ...geraete.map((g, i) => h('option', { value: g.deviceId, selected: g.deviceId === geraetId }, (g.label || 'Kamera ' + (i + 1)) + (g.label && VIRTUELL.test(g.label) ? ' (Handy/virtuell)' : ''))))));
    else if (geraete.length === 1) reihe.append(h('span', { class: 'hint' }, '📷 ' + (geraete[0].label || 'Kamera')));
  } else reihe.append(knopf('🖥 Anderes Fenster', 'Ein anderes Fenster oder den Bildschirm wählen', async () => { if (await starten('fenster')) panel(); }));
  const klein = (txt, title, fn) => h('button', { class: 'big', style: { minWidth: '52px', padding: '0 10px' }, title, onclick: fn }, txt);
  // 🔍 Zoom links, Steuerkreuz rechts (▲ ◀ ⤢ ▶ ▼) – verschiebt nur den Ausschnitt des Bildes, blättert nicht
  const kreuz = h('div', { class: 'lupe-kreuz', title: 'Ausschnitt verschieben' },
    h('span'), klein('▲', 'Ausschnitt nach oben', () => lupeSetzen(1, 0, 8)), h('span'),
    klein('◀', 'Ausschnitt nach links', () => lupeSetzen(1, 8, 0)), klein('⤢', 'Ganzes Bild', () => lupeSetzen(1, 0, 0, true)), klein('▶', 'Ausschnitt nach rechts', () => lupeSetzen(1, -8, 0)),
    h('span'), klein('▼', 'Ausschnitt nach unten', () => lupeSetzen(1, 0, -8)), h('span'));
  const lupenReihe = h('div', { class: 'row', style: { alignItems: 'center', gap: '14px' } },
    h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' } }, h('span', { class: 'hint', style: { margin: 0 } }, '🔍 Bild zoomen'),
      h('div', { class: 'row', style: { alignItems: 'center' } }, klein('−', 'Live-Bild verkleinern', () => lupeSetzen(1 / 1.25)), h('span', { class: 'lupe-z', style: { minWidth: '52px', textAlign: 'center', fontWeight: 700 } }, Math.round(lupe.z * 100) + ' %'), klein('＋', 'Live-Bild vergrößern', () => lupeSetzen(1.25)))),
    kreuz);
  const tabReihe = art === 'fenster' && tabSteuerbar() ? h('div', { class: 'row', style: { alignItems: 'center' } }, h('span', { class: 'hint', style: { margin: 0 } }, '📖 Im Tab:'),
    klein('⬆ Zurück', 'Im geteilten Tab nach oben scrollen (vorige Seite)', () => blaettern(-1)), klein('⬇ Weiter', 'Im geteilten Tab nach unten scrollen (nächste Seite)', () => blaettern(1)),
    klein('🔎−', 'Seite im Tab kleiner', () => tabZoom(-1)), klein('🔎＋', 'Seite im Tab größer', () => tabZoom(1)), klein('100 %', 'Seiten-Zoom zurücksetzen', () => tabZoom(0))) : '';
  const inhalt = [reihe, lupenReihe, tabReihe,
    h('div', { class: 'row' },
      knopf('⟳ 90°', 'Bild drehen (Dokumentenkameras liefern es oft verdreht)', () => { dreh = (dreh + 90) % 360; stil(); }),
      knopf('⇋ Spiegeln', 'Bild spiegeln (Webcam)', () => { spiegel = !spiegel; stil(); }),
      knopf('📸 Festhalten', 'Aktuelles Bild als Standbild auf die Tafel – dann ist das Live-Bild aus', festhalten, true),
      knopf('✕ Aus', 'Live-Bild beenden', () => aus())),
    h('p', { class: 'hint', style: { margin: '6px 0 0', maxWidth: '380px' } }, art === 'kamera'
      ? 'Das Kamerabild liegt hinter der Tafel – Stifte, Lineal, Scheinwerfer, Leselineal … darüber nutzen. Bitte nur auf Buch und Material richten, nicht auf Kinder. Gespeichert wird nur ein festgehaltenes Standbild.'
      : tabSteuerbar() ? 'Geteilter Edge-Tab: mit ⬇ Weiter / ⬆ Zurück blättern, mit 🔎 die Seite im Tab zoomen (Edge fragt beim ersten Mal nach Erlaubnis). 🔍 vergrößert nur das Bild auf der Tafel.'
        : 'Das gewählte Fenster liegt live hinter der Tafel. 🔍 vergrößert das Bild auf der Tafel. Blättern geht von hier nur, wenn das Buch in einem Edge-Tab läuft und Sie beim Teilen „Registerkarte“ wählen – Programme außerhalb des Browsers lassen sich aus der Tafel nicht steuern (dort selbst umblättern, Alt+Tab).')];
  fenster = T.widget(art === 'kamera' ? '📷 Kamera' : '🖥 Fenster', inhalt, Math.max(20, innerWidth - 460), 70);
  fenster.classList.add('live-panel');
  fenster.onclose = () => { fenster = null; aus(); }; // × am Fenster = Kamera bzw. Fenster-Bild aus
  // – klappt das Fenster zu einer kleinen Leiste zusammen (Live-Bild läuft weiter); gemerkt für das nächste Mal
  const mini = an => { fenster.classList.toggle('mini', an); klapp.textContent = an ? '▢' : '–'; klapp.title = an ? 'Wieder aufklappen' : 'Einklappen – das Live-Bild läuft weiter'; T.opts.livePanelMini = an; T.saveOpts(); };
  const klapp = h('button', { class: 'wk-mini', onclick: () => mini(!fenster.classList.contains('mini')) }, '–');
  fenster.kopf(klapp, h('button', { class: 'wk-mini', title: 'Festhalten: Standbild auf die Tafel', onclick: festhalten }, '📸'));
  const zu = fenster.querySelector('.wk-zu'); if (zu) zu.title = 'Live-Bild beenden';
  mini(!!T.opts.livePanelMini);
}
let startetGerade = false;
T.kamera = async neuArt => {
  if (startetGerade) return; // doppeltes Antippen während der Erlaubnis-Abfrage ignorieren
  if (art === neuArt && strom) { panel(); return; }
  startetGerade = true; setTimeout(() => { startetGerade = false; }, 15000);
  try { if (await starten(neuArt)) panel(); } finally { startetGerade = false; } // welche Kamera: kameraWaehlen()
};
T.kameraAn = () => !!strom;
})();
