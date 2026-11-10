// Tafel-App – Service Worker: macht die installierte App offline lauffähig (nur bei Aufruf über https)
const VERSION = 'tafel-2026-11-14r';
const DATEIEN = ['./', './Tafel.html', './manifest.webmanifest', './app/tafel.css', './app/kern.js', './app/werkzeuge.js', './app/eingabe.js', './app/bausteine.js',
  './app/karten.js', './app/flexibel.js', './app/karten2.js', './app/karten/welt.js', './app/karten/de.js',
  './app/karten/relief-welt.js', './app/karten/relief-eu.js', './app/karten/relief-af.js', './app/karten/relief-as.js', './app/karten/relief-na.js',
  './app/karten/relief-sa.js', './app/karten/relief-oz.js', './app/karten/relief-de.js', './app/bilder/skelette.js', './app/speicher.js', './app/aufgaben.js', './app/oberflaeche.js', './app/notizen.js', './app/rechner.js', './app/classroom.js', './app/plotter.js', './app/uebungen.js', './app/gebete.js', './app/geogebra.js', './app/rechenwege.js', './app/teiler.js', './app/tastatur.js', './app/aufdecken.js', './app/zettel.js', './app/stiftplus.js', './app/classroom2.js', './app/dokimport.js', './app/minikarte.js', './app/palette.js', './app/uebeditor.js', './app/deutsch.js', './app/ablauf.js', './app/geruest.js','./app/kamera.js', './app/pptimport.js', './app/aufnahme.js', './app/meineaufgaben.js', './app/paket3b.js', './app/skelettbilder.js', './app/figuren.js', './app/zuordnen.js', './app/koerpergriffe.js', './app/puzzle.js', './app/bruchstuecke.js', './app/geodreieck_erkl.js', './app/feiern.js', './app/paket3a.js','./app/pdfjs/pdf.min.js', './app/pdfjs/pdf.worker.min.js', './app/icons/icon-192.png','./app/icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Erst aus dem Netz (damit Aktualisierungen ankommen), ohne Netz aus dem Zwischenspeicher.
// Auch wenn die Webseite gelöscht ist (404 o. Ä.), läuft die installierte App aus dem Zwischenspeicher weiter –
// Fehlerseiten werden nie gespeichert.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const ausSpeicher = () => caches.match(e.request, { ignoreSearch: true }).then(m => m || (e.request.mode === 'navigate' ? caches.match('./Tafel.html') : undefined));
  e.respondWith(fetch(e.request).then(r => {
    if (!r.ok) return ausSpeicher().then(m => m || r);
    const k = r.clone(); caches.open(VERSION).then(c => c.put(e.request, k)); return r;
  }).catch(() => ausSpeicher().then(m => m || Response.error())));
});
