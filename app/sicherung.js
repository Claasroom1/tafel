// Tafel-App – 💾 Sicherung: alles Wichtige in EINER Datei (für iPad/Browser ohne Ablageordner gedacht, geht überall)
//   · Tafeln und Notizen der Ablage (wie bisher F.sicherung) + der Browser-Speicher der App: Einstellungen, Klassenlisten,
//     Vorlagen, Übungslisten, Hausaufgaben, Notizen, Vokabeln … (alle Schlüssel „tafelapp.*“ / „tafelgeraet.*“)
//   · Wiederherstellen überschreibt nie etwas: fehlende Einträge kommen dazu, Listen (z. B. Hausaufgaben) werden zusammengeführt
//   · Beim Start: dauerhaften Speicher anfordern (Browser räumt dann nicht von selbst auf) und – ohne Ablageordner –
//     an eine Sicherung erinnern, wenn die letzte länger als 7 Tage her ist
// Gemeinsame Datei für die Lehrkräfte-Version (GitHub) und die Schüler-Version – in beiden gleich halten.
'use strict';
(function () {
const F = T.ablage; if (!F) return;
const LETZTE = 'tafelapp.sicherung.letzte', HINWEIS = 'tafelapp.sicherung.hinweis';
const lies = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const schreib = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
const gehoert = k => /^(tafelapp|tafelgeraet)\./.test(k) && !/^tafelapp\.sicherung\./.test(k);
const speicherAlle = () => { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (gehoert(k)) o[k] = localStorage.getItem(k); } } catch (e) { /* kein Zugriff */ } return o; };

// Dauerhaften Speicher anfordern (iPad: wirkt vor allem in der App vom Home-Bildschirm)
const dauerhaft = async () => { try { return navigator.storage && navigator.storage.persist ? await navigator.storage.persist() : false; } catch (e) { return false; } };
dauerhaft();

// Ablage-Dateien sammeln (wie F.sicherung, aber ohne Herunterladen)
const IGNORE = /^(app|\..*|_.*)$/i;
const ablageDateien = async () => {
  const dateien = []; if (!F.root) return dateien;
  const lauf = async (dir, pfad) => { for await (const [n, x] of dir.entries()) {
    if (x.kind === 'directory') { if (!pfad.length && IGNORE.test(n) && !n.startsWith('_')) continue; await lauf(x, pfad.concat(n)); }
    else if (n.endsWith('.json') && pfad.length) dateien.push({ pfad, name: n, inhalt: await (await x.getFile()).text() }); } };
  await lauf(F.root, []); return dateien;
};
// Datei weitergeben: am iPad über „Teilen“ (In Dateien / iCloud Drive sichern), sonst als Download
const weitergeben = async (blob, name) => {
  try { const datei = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [datei] }) && /iPad|iPhone|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document) { await navigator.share({ files: [datei], title: name }); return 'geteilt'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'abgebrochen'; }
  T.downloadBlob(blob, name); return 'geladen';
};
T.allesSichern = async () => {
  const dateien = await ablageDateien(), speicher = speicherAlle();
  const blob = new Blob([JSON.stringify({ app: 'Tafel-App-Sicherung', version: 2, erstellt: new Date().toISOString(), dateien, speicher })], { type: 'application/json' });
  const wie = await weitergeben(blob, `Tafel-App Sicherung ${T.today()}.json`);
  if (wie === 'abgebrochen') return null;
  schreib(LETZTE, String(Date.now()));
  return { dateien: dateien.length, eintraege: Object.keys(speicher).length };
};
F.sicherung = async () => (await T.allesSichern() || { dateien: 0 }).dateien; /* „💾 Sicherung exportieren“ der Startseite nimmt jetzt auch den Browser-Speicher mit */

// Browser-Speicher zurückholen: fehlende Schlüssel setzen; Listen mit id (Hausaufgaben, Vokabeln …) zusammenführen; Vorhandenes bleibt
const speicherEinspielen = speicher => {
  let n = 0;
  for (const [k, v] of Object.entries(speicher || {})) {
    if (!gehoert(k) || typeof v !== 'string') continue;
    const alt = lies(k);
    if (alt == null) { if (schreib(k, v)) n++; continue; }
    if (alt === v) continue;
    try { const a = JSON.parse(alt), b = JSON.parse(v);
      if (Array.isArray(a) && Array.isArray(b) && b.every(x => x && x.id != null)) { const ids = new Set(a.map(x => x && x.id)), neu = b.filter(x => !ids.has(x.id));
        if (neu.length && schreib(k, JSON.stringify(a.concat(neu)))) n += neu.length; } } catch (e) { /* kein JSON – Vorhandenes bleibt */ }
  }
  return n;
};
const einspielenAlt = F.einspielen;
F.einspielen = async bundle => { /* auch beim bisherigen „📥 Sicherung einspielen“ */
  const n = F.root && (bundle.dateien || []).length ? await einspielenAlt(bundle) : 0;
  const m = speicherEinspielen(bundle.speicher);
  if (m) setTimeout(() => T.toast && T.toast(`Außerdem ${m} Einträge (Einstellungen, Listen, Hausaufgaben …) zurückgeholt – ganz wirksam nach einem Neustart der App.`, 5000), 5200);
  return n;
};
T.allesWiederherstellen = async () => {
  const f = await T.pickFile('.json,application/json'); if (!f) return;
  let b; try { b = JSON.parse(await f.text()); } catch (e) { T.toast('Das ist keine Sicherungsdatei.', 3500); return; }
  if (!F.istSicherung(b)) { T.toast('Das ist keine Sicherungsdatei der Tafel-App.', 3500); return; }
  const ohneOrdner = (b.dateien || []).length && !F.root;
  const n = F.root ? await einspielenAlt(b) : 0, m = speicherEinspielen(b.speicher);
  T.toast(`Wiederhergestellt: ${n} Tafel-Datei(en), ${m} weitere Einträge. Vorhandenes wurde nicht überschrieben.` + (ohneOrdner ? ' Für die Tafeln zuerst den Ablageordner verbinden und nochmals einspielen.' : '') + ' Die App lädt gleich neu.', 6000);
  setTimeout(() => location.reload(), 3500);
};

// Dialog „💾 Sicherung“
const tageSeit = () => { const t = +lies(LETZTE); return t ? Math.floor((Date.now() - t) / 864e5) : null; };
T.sicherungDialog = async () => {
  const h = T.h, tage = tageSeit(), fest = await (async () => { try { return navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false; } catch (e) { return false; } })();
  const status = tage == null ? 'Noch keine Sicherung auf diesem Gerät.' : tage === 0 ? 'Letzte Sicherung: heute.' : `Letzte Sicherung: vor ${tage} Tag${tage === 1 ? '' : 'en'}.`;
  T.openDlg([h('h2', {}, '💾 Sicherung'),
    h('p', {}, 'Speichert alles in eine Datei: Tafeln, Einstellungen, Listen, Hausaufgaben, Notizen und Vokabeln. ',
      h('b', {}, 'Am iPad: '), 'beim Teilen „In Dateien sichern“ wählen – am besten in iCloud Drive. Dann bleibt alles erhalten, auch wenn der Browser-Speicher gelöscht wird.'),
    h('p', { class: 'hint' }, status + (fest ? ' · Dauerhafter Speicher ist an.' : ' · Tipp: Die App über „Zum Home-Bildschirm“ starten – dann löscht Safari die Daten nicht von selbst.')),
    h('div', { class: 'acts' },
      h('button', { class: 'big', onclick: () => { T.closeDlg(); T.allesWiederherstellen(); } }, '📥 Wiederherstellen'),
      h('button', { class: 'big prim', onclick: async () => { T.closeDlg(); try { const r = await T.allesSichern(); if (r) T.toast(`💾 Gesichert: ${r.dateien} Tafel-Datei(en), ${r.eintraege} weitere Einträge.`, 3500); } catch (e) { T.toast('Sicherung fehlgeschlagen: ' + e.message, 5000); } } }, '💾 Jetzt sichern'))]);
};

// Knopf auf der Startseite (Kopfzeile) + Erinnerung, wenn ohne Ablageordner gearbeitet wird
const knopf = () => {
  const A = document.getElementById('archiv'); if (!A || getComputedStyle(A).display === 'none') return;
  const kopf = A.querySelector('.kopf'); if (!kopf || kopf.querySelector('.sich-kopf')) return;
  const tage = tageSeit(), alt = !F.supported && (tage == null || tage > 7);
  const b = T.h('button', { class: 'big sich-kopf', title: 'Alles in einer Datei sichern oder wiederherstellen', onclick: () => T.sicherungDialog() }, '💾 Sicherung');
  if (alt) b.append(T.h('span', { class: 'sich-punkt', title: 'Länger nicht gesichert' }, '!'));
  const nach = kopf.querySelector('.ha-kopf') || kopf.querySelector('.spacer'); if (nach) nach.after(b); else kopf.append(b);
};
new MutationObserver(knopf).observe(document.body, { childList: true, subtree: true });
document.head.append(Object.assign(document.createElement('style'), { textContent:
  '.sich-kopf{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;margin-left:8px}.sich-punkt{min-width:22px;height:22px;border-radius:11px;background:#ef6c00;color:#fff;font:700 14px/22px system-ui;text-align:center}' }));
setTimeout(() => {
  if (F.supported) return; /* mit Ablageordner (PC, Board) liegt ohnehin alles im Ordner */
  const tage = tageSeit(), heute = T.today ? T.today() : new Date().toDateString();
  if (tage != null && tage <= 7) return; if (lies(HINWEIS) === heute) return;
  if (!Object.keys(speicherAlle()).length) return; /* noch nichts zu sichern */
  schreib(HINWEIS, heute);
  T.toast && T.toast(tage == null ? '💾 Tipp: Die Daten einmal in iCloud Drive / „Dateien“ sichern – dann gehen sie nicht verloren.' : `💾 Letzte Sicherung vor ${tage} Tagen – jetzt sichern?`, 9000, [['Sichern', () => T.sicherungDialog()]]);
}, 9000);
})();
