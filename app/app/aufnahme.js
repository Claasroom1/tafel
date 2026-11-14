// Tafel-App – 🎬 Video: Anschrieb aufnehmen (Video oder Stop-Motion) und Videos abspielen (Datei, YouTube, Vimeo, Link).
// Aufgenommen wird NUR die Tafel (ohne Menüs, Leisten, Fenster): die drei Zeichenflächen, bei Live-Bild auch Kamera bzw. Video dahinter.
// Nichts wird automatisch gespeichert oder hochgeladen – das fertige Video wird erst mit „💾 Speichern“ eine Datei.
'use strict';
(function () {
const h = T.h, S = T.S;
const toast = (t, ms) => T.toast(t, ms);
const tafelName = () => { const t = (S.board && S.board.titel) || 'Tafel'; return window.F && F.safe ? F.safe(t) : t; };
const MIME = ['video/mp4;codecs=avc1.42E01F', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
  .find(m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
const endung = () => MIME.startsWith('video/mp4') ? 'mp4' : 'webm';
const dockR = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dockR')) || 0;
const kannAufnehmen = () => { if (MIME && HTMLCanvasElement.prototype.captureStream) return true; toast('Dieser Browser kann keine Videos aufnehmen – bitte Edge oder Chrome verwenden.', 4000); return false; };

// ---------- Tafelbild (nur die Tafelfläche) ----------
function bereich() { const x = T.ox || 0, y = 56; return { x, y, w: Math.max(50, innerWidth - x - dockR()), h: Math.max(50, innerHeight - y) }; }
function zielGroesse(maxB = 1920) {
  const b = bereich(), d = T.dpr || 1, s = Math.min(1, maxB / (b.w * d));
  const gerade = n => Math.max(2, Math.round(n) - (Math.round(n) % 2)); // Video-Kodierer möchten gerade Maße
  return { w: gerade(b.w * d * s), h: gerade(b.h * d * s) };
}
// Live-Hintergrund (Kamera oder Video-Datei) mit hineinzeichnen – Fremdseiten (YouTube …) lassen sich technisch nicht aufnehmen
function hgElement() {
  const v = document.querySelector('#liveVideo, video.hgMedien');
  if (!v || !v.videoWidth) return null;
  if (v.id !== 'liveVideo' && !/^blob:/.test(v.currentSrc || v.src || '')) return null; // fremde Links würden die Aufnahme sperren
  return v;
}
function zeichneTafel(ctx, W, H) {
  const b = bereich(), d = T.dpr || 1, cv = T.cv;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = T.liveHg ? '#000' : '#fff'; ctx.fillRect(0, 0, W, H);
  if (T.liveHg) {
    const v = hgElement();
    if (v) { const f = Math.min(W / v.videoWidth, H / v.videoHeight), vw = v.videoWidth * f, vh = v.videoHeight * f; try { ctx.drawImage(v, (W - vw) / 2, (H - vh) / 2, vw, vh); } catch (e) {} }
  }
  for (const id of ['cMain', 'cLive', 'cOver']) { const c = cv[id]; if (c && c.width) ctx.drawImage(c, b.x * d, b.y * d, b.w * d, b.h * d, 0, 0, W, H); }
}
function tafelBild(maxB) { const g = zielGroesse(maxB), c = document.createElement('canvas'); c.width = g.w; c.height = g.h; zeichneTafel(c.getContext('2d'), g.w, g.h); return c; }

// ---------- Steuerleiste oben ----------
let leiste = null;
function zeigeLeiste(...inhalt) {
  if (!leiste) { leiste = h('div', { id: 'aufnBar' }); document.body.append(leiste); }
  leiste.innerHTML = ''; leiste.append(...inhalt.flat().filter(Boolean));
}
function leisteWeg() { if (leiste) leiste.remove(); leiste = null; }
const knopf = (txt, title, fn, kl) => h('button', { class: kl || '', title, onclick: fn }, txt);
const zeit = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

// ---------- ⏺ Anschrieb als Video ----------
let rec = null; // { mr, teile, zeichner, mik, t0, pause, gesamt, uhr, anzeige }
let bereit = false; // Steuerung ist oben, Aufnahme wartet auf den roten Punkt
function videoStart() { // erst die Steuerung zeigen – aufgenommen wird ab dem roten ⏺
  if (rec || sm || bereit) { toast('Es läuft schon eine Aufnahme.'); return; }
  if (!kannAufnehmen()) return;
  bereit = true;
  zeigeLeiste(h('span', { class: 'rec' }, '● 0:00'),
    knopf('⏺ Aufnahme starten', 'Ab jetzt wird die Tafel aufgenommen', () => { bereit = false; aufnahmeBeginnen(); }, 'rot'),
    knopf('✕', 'Doch nicht aufnehmen', () => { bereit = false; leisteWeg(); }));
  toast('Tafel vorbereiten – dann oben auf den roten Punkt ⏺ tippen.', 3000);
}
async function aufnahmeBeginnen() {
  const g = zielGroesse(), c = document.createElement('canvas'); c.width = g.w; c.height = g.h; const ctx = c.getContext('2d');
  zeichneTafel(ctx, g.w, g.h);
  const strom = c.captureStream(30); let mik = null;
  if (T.opts.aufTon) {
    try { mik = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); mik.getAudioTracks().forEach(t => strom.addTrack(t)); }
    catch (e) { toast('Mikrofon nicht erlaubt oder nicht vorhanden – Aufnahme ohne Ton.', 3500); }
  }
  let mr; try { mr = new MediaRecorder(strom, { mimeType: MIME, videoBitsPerSecond: 6e6 }); } catch (e) { toast('Aufnahme konnte nicht starten: ' + (e.message || e), 4000); if (mik) mik.getTracks().forEach(t => t.stop()); leisteWeg(); return; }
  const teile = []; mr.ondataavailable = e => { if (e.data && e.data.size) teile.push(e.data); };
  rec = { mr, teile, mik, t0: performance.now(), pause: 0, gesamt: 0 };
  rec.zeichner = setInterval(() => { if (rec && mr.state === 'recording') zeichneTafel(ctx, g.w, g.h); }, 1000 / 30);
  mr.start(1000);
  const anzeige = h('span', { class: 'rec blink' }, '● 0:00');
  const pauseK = knopf('⏸ Pause', 'Aufnahme anhalten', () => {
    if (mr.state === 'recording') { mr.pause(); rec.gesamt += performance.now() - rec.t0; pauseK.textContent = '⏺ Weiter'; pauseK.classList.add('rot'); anzeige.classList.remove('blink'); }
    else if (mr.state === 'paused') { mr.resume(); rec.t0 = performance.now(); pauseK.textContent = '⏸ Pause'; pauseK.classList.remove('rot'); anzeige.classList.add('blink'); }
  });
  rec.uhr = setInterval(() => { if (!rec) return; const ms = rec.gesamt + (mr.state === 'recording' ? performance.now() - rec.t0 : 0); anzeige.textContent = (mr.state === 'paused' ? '⏸ ' : '● ') + zeit(ms / 1000); }, 250);
  zeigeLeiste(anzeige, mik ? h('span', { title: 'Mit Ton (Mikrofon)' }, '🎙') : '', pauseK,
    knopf('⏹ Fertig', 'Aufnahme beenden – das Video öffnet sich zum Ansehen und Speichern', () => videoStopp(true), 'prim'),
    knopf('✕', 'Aufnahme verwerfen', async () => { if (await T.frage('Aufnahme verwerfen?', { ok: '✕ Verwerfen' })) videoStopp(false); }));
  toast('⏺ Aufnahme läuft – aufgenommen wird nur die Tafel, ohne Menüs.', 3000);
}
function videoStopp(behalten) {
  if (!rec) return; const r = rec; rec = null;
  clearInterval(r.zeichner); clearInterval(r.uhr); leisteWeg();
  r.mr.onstop = () => {
    if (r.mik) r.mik.getTracks().forEach(t => t.stop());
    if (!behalten) { toast('Aufnahme verworfen.', 1500); return; }
    const blob = new Blob(r.teile, { type: MIME.split(';')[0] });
    spieler({ blob, name: `${tafelName()} – Tafelvideo.${endung()}` });
  };
  try { r.mr.stop(); } catch (e) { r.mr.onstop(); }
}

// ---------- 🎞 Stop-Motion ----------
const UEB = [['schnitt', 'Schnitt'], ['blende', 'Überblenden'], ['schieben', 'Schieben ←'], ['wischen', 'Wischen →'], ['aufdecken', 'Aufdecken ↓'], ['zoom', 'Heranzoomen'], ['schwarz', 'Über Schwarz']];
const DAUERN = [0.3, 0.5, 1, 1.5, 2, 3, 5, 8];
let sm = null; // { bilder: [{blob, url, dauer, ueb, uebDauer, fp}], auto, timer, leiste }
function fingerabdruck(c) { const k = document.createElement('canvas'); k.width = 32; k.height = 18; const x = k.getContext('2d'); x.drawImage(c, 0, 0, 32, 18); return x.getImageData(0, 0, 32, 18).data.join(','); }
function bildAufnehmen(still) {
  if (!sm) return;
  const c = tafelBild(), fp = fingerabdruck(c), letztes = sm.bilder[sm.bilder.length - 1];
  if (still && letztes && letztes.fp === fp) return; // automatisch: keine doppelten Bilder
  c.toBlob(blob => {
    if (!sm || !blob) return;
    const v = letztes || { dauer: 1, ueb: 'blende', uebDauer: 0.5 };
    sm.bilder.push({ blob, url: URL.createObjectURL(blob), dauer: v.dauer, ueb: v.ueb, uebDauer: v.uebDauer, fp });
    smLeisteZeichnen(true); smBar();
    if (!still) { const l = document.getElementById('smLeiste'); if (l) { l.classList.add('blitz'); setTimeout(() => l.classList.remove('blitz'), 250); } }
  }, 'image/jpeg', 0.9);
}
function smStart() {
  if (rec || sm || bereit) { toast('Es läuft schon eine Aufnahme.'); return; }
  if (!kannAufnehmen()) return;
  sm ={ bilder: [], auto: T.opts.smAuto !== false };
  smLeisteZeichnen(); smBar(); bildAufnehmen(false);
  toast('🎞 Stop-Motion: Jetzt anschreiben. ' + (sm.auto ? 'Nach jedem Strich kommt automatisch ein Bild dazu.' : 'Mit „📸 Bild“ ein Bild aufnehmen.'), 4000);
}
// Automatisch: kurz nach dem Loslassen auf der Tafel (Strich, Verschieben, Einfügen …)
addEventListener('pointerup', e => {
  if (!sm || !sm.auto || !(e.target && e.target.id === 'cOver')) return;
  clearTimeout(sm.timer); sm.timer = setTimeout(() => bildAufnehmen(true), 900);
}, true);
function smBar() {
  if (!sm) return;
  const autoK = knopf((sm.auto ? '● ' : '○ ') + 'Auto', 'Nach jedem Strich automatisch ein Bild aufnehmen', () => { sm.auto = !sm.auto; T.opts.smAuto = sm.auto; T.saveOpts(); smBar(); }, sm.auto ? 'on' : '');
  zeigeLeiste(h('span', { class: 'rec' }, '🎞 ' + sm.bilder.length + (sm.bilder.length === 1 ? ' Bild' : ' Bilder')),
    knopf('📸 Bild', 'Jetzt ein Bild der Tafel aufnehmen', () => bildAufnehmen(false), 'rot'), autoK,
    knopf('🎬 Video erstellen', 'Aus den Bildern und Übergängen ein Video machen', smVideo, 'prim'),
    knopf('✕', 'Stop-Motion beenden', smEnde));
}
async function smEnde() {
  if (sm && sm.bilder.length > 1 && !await T.frage('Stop-Motion beenden? Die Bilder werden verworfen (ein erstelltes Video bleibt, wenn es gespeichert wurde).', { ok: '✕ Beenden' })) return;
  if (!sm) return; sm.bilder.forEach(b => URL.revokeObjectURL(b.url)); clearTimeout(sm.timer); sm = null;
  const l = document.getElementById('smLeiste'); if (l) l.remove(); leisteWeg();
}
function smLeisteZeichnen(nachUnten) {
  if (!sm) return;
  let l = document.getElementById('smLeiste');
  const seite = T.opts.smSeite === 'links' ? 'links' : 'rechts';
  if (!l) { l = h('div', { id: 'smLeiste' }); document.body.append(l); }
  l.className = seite + (T.opts.smMini ? ' mini' : '');
  const alt = l.querySelector('.smListe'), scroll = alt ? alt.scrollTop : 0;
  l.innerHTML = '';
  const kopf = h('div', { class: 'smKopf' }, h('b', {}, '🎞 Bilder'),
    h('button', { title: 'Leiste auf die andere Seite', onclick: () => { T.opts.smSeite = seite === 'links' ? 'rechts' : 'links'; T.saveOpts(); smLeisteZeichnen(); } }, '⇆'),
    h('button', { title: T.opts.smMini ? 'Aufklappen' : 'Einklappen', onclick: () => { T.opts.smMini = !T.opts.smMini; T.saveOpts(); smLeisteZeichnen(); } }, T.opts.smMini ? '▢' : '–'));
  l.append(kopf); if (T.opts.smMini) return;
  const auswahl = (werte, wert, fn, title, txt) => h('select', { class: 'feld', title, onchange: e => fn(e.target.value) }, ...werte.map(w => h('option', { value: w[0] != null ? w[0] : w, selected: String(w[0] != null ? w[0] : w) === String(wert) }, txt ? txt(w) : w)));
  const sek = d => String(d).replace('.', ',') + ' s';
  // Für alle Bilder auf einmal
  l.append(h('div', { class: 'smAlle' }, h('span', {}, 'Für alle:'),
    auswahl([['', 'Übergang …'], ...UEB], '', v => { if (!v) return; sm.bilder.forEach(b => { b.ueb = v; }); smLeisteZeichnen(); }, 'Übergang für alle Bilder', w => w[1]),
    auswahl([['', 'Dauer …'], ...DAUERN.map(d => [d, sek(d)])], '', v => { if (!v) return; sm.bilder.forEach(b => { b.dauer = +v; }); smLeisteZeichnen(); }, 'Wie lange jedes Bild stehen bleibt', w => w[1])));
  const liste = h('div', { class: 'smListe' });
  if (!sm.bilder.length) liste.append(h('p', { class: 'hint' }, 'Noch keine Bilder.'));
  sm.bilder.forEach((b, i) => {
    const schieb = r => { const j = i + r; if (j < 0 || j >= sm.bilder.length) return; [sm.bilder[i], sm.bilder[j]] = [sm.bilder[j], sm.bilder[i]]; smLeisteZeichnen(); };
    liste.append(h('div', { class: 'smBild' },
      h('img', { src: b.url, alt: 'Bild ' + (i + 1), title: 'Bild ' + (i + 1) }), h('span', { class: 'nr' }, i + 1),
      h('div', { class: 'smZeile' },
        auswahl(DAUERN.map(d => [d, sek(d)]), b.dauer, v => { b.dauer = +v; }, 'So lange bleibt dieses Bild stehen', w => '⏱ ' + w[1]),
        h('button', { title: 'Nach vorne', onclick: () => schieb(-1) }, '↑'), h('button', { title: 'Nach hinten', onclick: () => schieb(1) }, '↓'),
        h('button', { title: 'Bild löschen', onclick: () => { URL.revokeObjectURL(b.url); sm.bilder.splice(i, 1); smLeisteZeichnen(); smBar(); } }, '✕'))));
    if (i < sm.bilder.length - 1) liste.append(h('div', { class: 'smUeb', title: 'Übergang zum nächsten Bild' }, '↓',
      auswahl(UEB, b.ueb, v => { b.ueb = v; smLeisteZeichnen(); }, 'Übergang zum nächsten Bild', w => w[1]),
      b.ueb === 'schnitt' ? '' : auswahl([0.3, 0.5, 1, 1.5, 2].map(d => [d, sek(d)]), b.uebDauer, v => { b.uebDauer = +v; }, 'Dauer des Übergangs', w => w[1])));
  });
  l.append(liste); liste.scrollTop = nachUnten ? liste.scrollHeight : scroll;
}
// Übergang von Bild a nach b bei Fortschritt p (0 … 1)
function uebergang(ctx, a, b, art, p, W, H) {
  const bild = (x, al = 1, dx = 0, s = 1) => { ctx.save(); ctx.globalAlpha = al; ctx.translate(W / 2 + dx, H / 2); ctx.scale(s, s); ctx.drawImage(x, -W / 2, -H / 2, W, H); ctx.restore(); };
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // weich anfahren und abbremsen
  switch (art) {
    case 'blende': bild(a); bild(b, e); break;
    case 'schieben': bild(a, 1, -e * W); bild(b, 1, (1 - e) * W); break;
    case 'wischen': bild(a); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, e * W, H); ctx.clip(); bild(b); ctx.restore(); break;
    case 'aufdecken': bild(a); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, e * H); ctx.clip(); bild(b); ctx.restore(); break;
    case 'zoom': bild(a); bild(b, e, 0, 0.6 + 0.4 * e); break;
    case 'schwarz': if (p < 0.5) bild(a, 1 - 2 * p); else bild(b, 2 * p - 1); break;
    default: bild(p < 1 ? a : b);
  }
}
async function smVideo() {
  if (!sm || !sm.bilder.length) { toast('Noch keine Bilder.'); return; }
  const bilder = await Promise.all(sm.bilder.map(b => createImageBitmap(b.blob)));
  const W = bilder[0].width, H = bilder[0].height;
  // Ablauf: Bild stehen lassen, dann Übergang zum nächsten
  const plan = []; let t = 0;
  sm.bilder.forEach((b, i) => {
    plan.push({ von: t, bis: t + b.dauer, a: i }); t += b.dauer;
    if (i < sm.bilder.length - 1 && b.ueb !== 'schnitt') { plan.push({ von: t, bis: t + b.uebDauer, a: i, b: i + 1, art: b.ueb }); t += b.uebDauer; }
  });
  const gesamt = t + 0.4; // kurz nachlaufen, damit das letzte Bild nicht abgeschnitten wird
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  const zeichne = s => { const st = plan.find(x => s < x.bis) || plan[plan.length - 1]; if (st.b == null) uebergang(ctx, bilder[st.a], bilder[st.a], 'schnitt', 0, W, H); else uebergang(ctx, bilder[st.a], bilder[st.b], st.art, Math.min(1, (s - st.von) / (st.bis - st.von)), W, H); };
  zeichne(0);
  const mr = new MediaRecorder(c.captureStream(30), { mimeType: MIME, videoBitsPerSecond: 6e6 }), teile = [];
  mr.ondataavailable = e => { if (e.data && e.data.size) teile.push(e.data); };
  let abbruch = false;
  const balken = h('div', { class: 'smFort' }, h('div')), info = h('span', {}, '0 %');
  const w = T.widget('🎬 Video wird erstellt …', [balken, h('p', { class: 'hint', style: { margin: '8px 0 0' } }, 'Das dauert so lange wie das Video (', zeit(gesamt), '). Bitte die Tafel-App so lange geöffnet und sichtbar lassen.'), h('div', { class: 'row' }, info)], Math.max(20, innerWidth / 2 - 200), 120);
  w.onclose = () => { abbruch = true; try { mr.stop(); } catch (e) {} };
  await new Promise(fertig => {
    mr.onstop = fertig; mr.start(500); const t0 = performance.now();
    const schritt = setInterval(() => {
      const s = (performance.now() - t0) / 1000;
      if (abbruch || s >= gesamt) { clearInterval(schritt); zeichne(gesamt); setTimeout(() => { try { mr.stop(); } catch (e) { fertig(); } }, 150); return; }
      zeichne(s); const pz = Math.round(s / gesamt * 100); balken.firstChild.style.width = pz + '%'; info.textContent = pz + ' %';
    }, 1000 / 30);
  });
  bilder.forEach(b => b.close && b.close());
  if (w.isConnected) w.remove();
  if (abbruch) { toast('Video-Erstellung abgebrochen.', 1500); return; }
  spieler({ blob: new Blob(teile, { type: MIME.split(';')[0] }), name: `${tafelName()} – Stop-Motion.${endung()}` });
}

// ---------- ▶ Videoplayer: Datei, YouTube, Vimeo, Link – im Fenster oder hinter der Tafel (darauf schreiben) ----------
function linkQuelle(url) {
  url = url.trim(); let m;
  if ((m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/))) {
    const st = (url.match(/[?&](?:t|start)=(\d+)/) || [])[1];
    const herkunft = /^https?:$/.test(location.protocol) ? '&origin=' + encodeURIComponent(location.origin) : '';
    return { art: 'youtube', id: m[1], start: st || 0, src: `https://www.youtube-nocookie.com/embed/${m[1]}?enablejsapi=1&rel=0&playsinline=1&modestbranding=1${st ? '&start=' + st : ''}${herkunft}`, url };
  }
  if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return { art: 'vimeo', src: `https://player.vimeo.com/video/${m[1]}?dnt=1`, url };
  if (/\.(mp4|webm|ogg|ogv|m4v|mov)(\?|#|$)/i.test(url)) return { art: 'datei', src: url, url };
  if (/^https?:\/\//i.test(url)) return { art: 'seite', src: url, url };
  return null;
}
let hgAktiv = null; // { el, zurueck } – Medium liegt gerade hinter der Tafel
function hgAus() {
  if (!hgAktiv) return; const a = hgAktiv; hgAktiv = null;
  a.el.classList.remove('hgMedien'); a.zurueck(a.el);
  if (!(T.kameraAn && T.kameraAn())) { T.liveHg = false; document.body.classList.remove('liveHg'); T.render(); T.renderOver(); }
}
T.videoHgAus = hgAus;
function hgAn(el, zurueck) {
  hgAus(); if (T.kameraAn && T.kameraAn()) T.kameraAus(true);
  el.classList.add('hgMedien'); document.body.insertBefore(el, document.getElementById('cMain'));
  hgAktiv = { el, zurueck }; T.liveHg = true; document.body.classList.add('liveHg'); T.render(); T.renderOver();
}
let vpNr = 0;
// YouTube aus der Tafel-Datei (file://): YouTube verlangt beim Einbetten eine Webadresse als Herkunft – sonst „Fehler 153“.
// Dann läuft das Video in einem eigenen YouTube-Fenster; „🖊 Fenster hinter die Tafel“ legt dieses Fenster als Live-Hintergrund hinter die Tafel.
let ytFenster = null;
function youtubeFenster(q) {
  const url = `https://www.youtube.com/watch?v=${q.id}${q.start ? '&t=' + q.start + 's' : ''}`;
  const b = Math.min(1100, screen.availWidth - 80), hh = Math.min(700, screen.availHeight - 80);
  try { if (ytFenster && !ytFenster.closed) ytFenster.close(); } catch (e) {}
  ytFenster = window.open(url, 'tafel-youtube', `popup=yes,width=${b},height=${hh},left=${Math.round((screen.availWidth - b) / 2)},top=${Math.round((screen.availHeight - hh) / 2)}`);
  if (!ytFenster) toast('Das Fenster wurde blockiert – bitte Pop-ups für die Tafel erlauben oder „↗ Im Browser“ nehmen.', 5000);
  return ytFenster;
}
function youtubeDateiSpieler(q) {
  const nr = ++vpNr;
  const box = h('div', { class: 'vp-yt-hinweis' },
    h('b', {}, '▶ YouTube läuft in einem eigenen Fenster'),
    h('p', { class: 'hint', style: { margin: '6px 0 0' } }, 'Aus der Tafel-Datei lässt YouTube kein eingebettetes Video zu (Fehler 153). Darum öffnet sich das Video in einem eigenen YouTube-Fenster – dort mit „F“ oder ⛶ auf Vollbild.'),
    h('ol', { class: 'hint', style: { margin: '6px 0 0', paddingLeft: '20px' } },
      h('li', {}, '„▶ Video öffnen“ – das YouTube-Fenster erscheint.'),
      h('li', {}, '„🖊 Fenster hinter die Tafel“ – in der Auswahl das YouTube-Fenster wählen. Dann liegt das Video hinter der Tafel und man schreibt darüber.')));
  const reihe = h('div', { class: 'row' },
    h('button', { class: 'big prim', title: 'Video im eigenen YouTube-Fenster öffnen', onclick: () => youtubeFenster(q) }, '▶ Video öffnen'),
    h('button', { class: 'big', title: 'Das YouTube-Fenster als Live-Bild hinter die Tafel legen – darüber schreiben', onclick: () => { if (!ytFenster || ytFenster.closed) youtubeFenster(q); setTimeout(() => T.kamera && T.kamera('fenster'), 600); } }, '🖊 Fenster hinter die Tafel'),
    h('button', { class: 'big', title: 'YouTube-Fenster schließen', onclick: () => { try { ytFenster && ytFenster.close(); } catch (e) {} ytFenster = null; } }, '✕ YouTube-Fenster zu'));
  const w = T.widget('▶ YouTube', [box, reihe], Math.max(20, innerWidth / 2 - 300 + (nr % 4) * 30), 130 + (nr % 4) * 30);
  w.classList.add('vp-fenster');
  youtubeFenster(q); // gleich öffnen (direkt nach dem Antippen von „Öffnen“ erlaubt der Browser das Fenster)
  return w;
}
function spieler(q) {
  if (q.art === 'youtube' && (location.protocol === 'file:' || q.alsFenster)) return youtubeDateiSpieler(q);
  const nr = ++vpNr;
  let el, art = 'datei', blobUrl = null;
  if (q.blob || q.file) { blobUrl = URL.createObjectURL(q.blob || q.file); el = h('video', { src: blobUrl, controls: true, playsinline: true }); }
  else if (q.art === 'datei') el = h('video', { src: q.src, controls: true, playsinline: true });
  else { art = q.art; el = h('iframe', { src: q.src, allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' }); }
  const box = h('div', { class: 'vpBox' }, el);
  const befehl = cmd => { // ▶/⏸ auch dann, wenn das Video hinter der Tafel liegt
    if (el.tagName === 'VIDEO') { if (cmd === 'play') el.play().catch(() => {}); else el.pause(); return; }
    try {
      if (art === 'youtube') el.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd === 'play' ? 'playVideo' : 'pauseVideo', args: [] }), '*');
      else if (art === 'vimeo') el.contentWindow.postMessage(JSON.stringify({ method: cmd }), '*');
    } catch (e) {}
  };
  const steuer = art !== 'seite';
  const hinterK = h('button', { class: 'big', title: 'Das Video liegt hinter der Tafel – darüber mit Stift und Textmarker schreiben', onclick: () => {
    if (hgAktiv && hgAktiv.el === el) { hgAus(); return; }
    hgAn(el, e => { box.append(e); hinterK.textContent = '🖊 Hinter die Tafel'; hinterK.classList.remove('on'); box.style.display = ''; });
    hinterK.textContent = '↩ Zurück ins Fenster'; hinterK.classList.add('on'); box.style.display = 'none';
  } }, '🖊 Hinter die Tafel');
  const reihe = h('div', { class: 'row' },
    steuer ? hinterK : '',
    steuer ? h('button', { class: 'big', title: 'Abspielen', onclick: () => befehl('play') }, '▶') : '',
    steuer ? h('button', { class: 'big', title: 'Anhalten', onclick: () => befehl('pause') }, '⏸') : '',
    q.blob ? h('button', { class: 'big prim', title: 'Video als Datei speichern (z. B. für IServ, YouTube …)', onclick: () => T.downloadBlob(q.blob, q.name) }, '💾 Speichern') : '',
    q.url ? h('button', { class: 'big', title: 'In einem neuen Browser-Fenster öffnen', onclick: () => window.open(q.url, '_blank', 'noopener') }, '↗ Im Browser') : '');
  const hinweis = art === 'youtube' ? 'Braucht Internet. Zeigt YouTube einen Fehler (z. B. „153“), das Video mit „↗ Im Browser“ öffnen und über 🎬 Video › Fenster als Hintergrund hinter die Tafel legen.'
    : art === 'seite' ? 'Viele Seiten erlauben keine Anzeige in anderen Apps – dann „↗ Im Browser“.'
    : q.blob ? 'Gespeichert wird erst mit „💾 Speichern“. Die Datei kann z. B. bei IServ oder YouTube hochgeladen werden.' : '';
  const titel = q.blob ? '🎬 ' + q.name.replace(/\.(mp4|webm)$/, '') : art === 'youtube' ? '▶ YouTube' : art === 'vimeo' ? '▶ Vimeo' : '▶ Video';
  const w = T.widget(titel, [box, reihe, hinweis ? h('p', { class: 'hint', style: { margin: '6px 0 0', maxWidth: '640px' } }, hinweis) : ''], Math.max(20, innerWidth / 2 - 340 + (nr % 4) * 30), 130 + (nr % 4) * 30);
  w.classList.add('vp-fenster');
  const groesse = f => { const r = box.getBoundingClientRect(); box.style.width = T.clamp(r.width * f, 240, innerWidth - 60) + 'px'; box.style.height = T.clamp(r.height * f, 135, innerHeight - 220) + 'px'; };
  w.kopf(h('button', { class: 'wk-mini', title: 'Kleiner', onclick: () => groesse(0.8) }, '−'), h('button', { class: 'wk-mini', title: 'Größer', onclick: () => groesse(1.25) }, '＋'));
  w.onclose = () => { if (hgAktiv && hgAktiv.el === el) hgAus(); try { if (el.tagName === 'VIDEO') el.pause(); } catch (e) {} el.remove(); if (blobUrl && !q.blob) URL.revokeObjectURL(blobUrl); };
  if (q.blob) el.play && el.play().catch(() => {});
  return w;
}
async function videoDatei() { const f = await T.pickFile('video/*'); if (f) spieler({ file: f, name: f.name }); }
async function videoLink() {
  const u = await T.frage('Link zum Video (YouTube, Vimeo oder direkter Link zu einer .mp4-Datei):', { feld: { wert: '' }, ok: '▶ Öffnen' });
  if (!u || !u.trim()) return; const q = linkQuelle(u);
  if (!q) { toast('Das ist kein gültiger Link.'); return; }
  spieler(q);
}
T.videoSpieler = spieler;

// ---------- Menü „🎬 Video“ oben ----------
function videoPop(el) {
  const spalte = (...k) => h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch' } }, ...k);
  const zu = fn => () => { T.closePops(); fn(); };
  const tonK = h('label', { class: 'big', style: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }, title: 'Beim Video auch den Ton (Mikrofon) aufnehmen' },
    h('input', { type: 'checkbox', checked: !!T.opts.aufTon, style: { width: '24px', height: '24px' }, onchange: e => { T.opts.aufTon = e.target.checked; T.saveOpts(); } }), '🎙 Mit Ton (Mikrofon)');
  const kameraAn = T.kameraAn && T.kameraAn();
  T.openPop(el,
    h('h4', {}, 'Aufnehmen (nur die Tafel)'), spalte(
      rec ? h('button', { class: 'big warn', onclick: zu(() => videoStopp(true)) }, '⏹ Aufnahme beenden')
        : bereit ? h('button', { class: 'big', onclick: zu(() => { bereit = false; aufnahmeBeginnen(); }) }, h('span', { style: { color: '#e5484d' } }, '⏺'), ' Aufnahme starten')
        : h('button', { class: 'big', title: 'Alles, was an der Tafel passiert, wird als Video aufgenommen – ohne Menüs', onclick: zu(videoStart) }, h('span', { style: { color: '#e5484d' } }, '⏺'), ' Anschrieb als Video'),
      sm ? h('button', { class: 'big warn', onclick: zu(smEnde) }, '✕ Stop-Motion beenden')
        : h('button', { class: 'big', title: 'Einzelbilder des Anschriebs sammeln, Übergänge wählen, daraus ein Video machen', onclick: zu(smStart) }, '🎞 Stop-Motion'),
      tonK),
    h('h4', { style: { marginTop: '14px' } }, 'Abspielen'), spalte(
      h('button', { class: 'big', title: 'Video-Datei (mp4, webm …) vom Rechner oder Stick', onclick: zu(videoDatei) }, '📁 Video-Datei öffnen'),
      h('button', { class: 'big', title: 'YouTube, Vimeo oder Link zu einer Video-Datei', onclick: zu(videoLink) }, '🔗 YouTube / Link')),
    h('h4', { style: { marginTop: '14px' } }, 'Live hinter der Tafel'), spalte(
      h('button', { class: 'big' + (kameraAn ? ' on' : ''), title: 'Webcam oder Dokumentenkamera live hinter der Tafel – darauf schreiben, festhalten', onclick: zu(() => T.kamera && T.kamera('kamera')) }, '📷 Kamera / Dokumentenkamera'),
      navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia && !T.istIpad ? h('button', { class: 'big', title: 'Ein anderes Fenster (z. B. digitales Schulbuch, PDF) live hinter der Tafel', onclick: zu(() => T.kamera && T.kamera('fenster')) }, '🖥 Fenster als Hintergrund') : '', /* Tablet: geht dort nicht – nicht anbieten */
      kameraAn || hgAktiv ? h('button', { class: 'big warn', onclick: zu(() => { if (kameraAn) T.kameraAus(); hgAus(); }) }, '✕ Live-Bild aus') : ''));
}
const vk = document.getElementById('bVideo'); if (vk) vk.onclick = e => videoPop(e.currentTarget);
T.aufnahme = { videoStart, smStart, tafelBild, linkQuelle };
})();
