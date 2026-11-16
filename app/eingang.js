// Tafel-App – 📥 Eingang: vom Tablet (oder einem anderen Gerät) ans Smartboard – über IServ, ohne neue Knöpfe.
// NEU: Es gibt keinen eigenen Eingangsordner mehr – am Tablet die Tafel direkt in den verbundenen Ablageordner (Name › Klasse › Fach)
// sichern, dann steht sie am Board gleich in der Liste. „_Eingang“ wird nicht mehr angelegt, nur ein schon vorhandener noch gelesen.
// Tablet: „📤 Speichern unter“ (eine Tafel) oder „💾 Sicherung › Jetzt sichern“ (alles: Tafeln, Notizen, Einstellungen, Klassenlisten,
// Sitzpläne, Vorlagen …) – beim Teilen IServ wählen und dort im Tafel-Ablageordner den Ordner „_Eingang“.
// Smartboard (Ablageordner verbunden, z. B. über IServ synchronisiert): Die App schaut beim Start und jede Minute in „_Eingang“
// und bietet an, was neu ist. Übernehmen: eine Tafel kommt nach Lehrkraft › Klasse › Fach (neue Datei – nie überschreiben) und öffnet sich;
// eine Sicherung wird zusammengeführt (Vorhandenes bleibt). Die Datei wandert danach nach „_Eingang/_übernommen“.
// Gemeinsam für Lehrkräfte- und Schüler-Version.
'use strict';
(function () {
const F = T.ablage; if (!F) return;
const h = T.h, ORD = '_Eingang', ERL = '_übernommen';
const spaeter = new Set(); let laeuft = false, box = null;
const bereit = () => F.root && !F.intern && T.opts && T.opts.lehrkraft && (!T.angemeldet || T.angemeldet());
async function pruefen() {
  if (laeuft || !bereit()) return; laeuft = true;
  try {
    let d; try { d = await F.dir([ORD], false); } catch (e) { return; } /* nur noch, falls es den alten Ordner „_Eingang“ gibt – Tafeln gehören direkt in den Ablageordner */
    const neu = [];
    for await (const [n, fh] of d.entries()) {
      if (fh.kind !== 'file' || !/\.json$/i.test(n)) continue;
      let f; try { f = await fh.getFile(); } catch (e) { continue; }
      const key = n + '|' + f.lastModified; if (spaeter.has(key)) continue;
      let j; try { j = JSON.parse(await f.text()); } catch (e) { continue; }
      if (F.istSicherung && F.istSicherung(j)) { if (j.lehrkraft && F.safe(j.lehrkraft) !== F.safe(T.opts.lehrkraft)) continue; } /* Sicherung einer anderen Lehrkraft (gemeinsamer Ordner) */
      if (F.istSicherung && F.istSicherung(j)) neu.push({ n, key, art: 'sicherung', j, text: `💾 Sicherung (${(j.dateien || []).length} Tafel-Datei(en), ${Object.keys(j.speicher || {}).length} Einträge)` });
      else if (j && Array.isArray(j.pages)) {
        if (j.lehrkraft && F.safe(j.lehrkraft) !== F.safe(T.opts.lehrkraft)) continue; /* gehört einer anderen Lehrkraft */
        neu.push({ n, key, art: 'tafel', j, text: `📄 ${j.titel || 'Tafel'}` + (j.klasse ? ` · Klasse ${j.klasse}` : '') + (j.fach ? ` · ${j.fach}` : '') });
      }
    }
    zeige(neu);
  } finally { laeuft = false; }
}
async function wegraeumen(x) { /* nach „_Eingang/_übernommen“ verschieben (Kopie schreiben, dann Original entfernen) */
  try { const d = await F.dir([ORD], false), z = await F.dir([ORD, ERL], true), txt = await (await (await d.getFileHandle(x.n)).getFile()).text();
    const w = await (await z.getFileHandle(x.n, { create: true })).createWritable(); await w.write(txt); await w.close(); await d.removeEntry(x.n); } catch (e) {}
}
async function uebernehmen(x) {
  if (x.art === 'tafel') {
    if (T.tafelSichern && !(await T.tafelSichern())) return;
    const b = { ...x.j, lehrkraft: T.opts.lehrkraft, fach: x.j.fach || 'Sonstiges' };
    try { const r = await F.save(b, null); await wegraeumen(x); weg(x); T.ladeTafel(b, r.file); T.toast && T.toast('📥 Übernommen und geöffnet: ' + (b.titel || 'Tafel') + (b.klasse ? ' (Klasse ' + b.klasse + ')' : ''), 3500); }
    catch (e) { T.toast && T.toast('Nicht übernommen: ' + (e.message || e), 5000); }
  } else {
    try { const n = await F.einspielen(x.j); await wegraeumen(x); weg(x); T.toast && T.toast(`📥 Sicherung übernommen: ${n} Tafel-Datei(en) dazu, Einstellungen und Listen zusammengeführt – Vorhandenes blieb. Die App lädt gleich neu.`, 5000); setTimeout(() => location.reload(), 4000); }
    catch (e) { T.toast && T.toast('Nicht übernommen: ' + (e.message || e), 5000); }
  }
}
function weg(x) { spaeter.add(x.key); if (box) { const z = box.querySelector(`[data-key="${CSS.escape(x.key)}"]`); if (z) z.remove(); if (!box.querySelector('.eg-zeile')) { box.remove(); box = null; } } }
function zeige(liste) {
  if (box) { box.remove(); box = null; } if (!liste.length) return;
  box = h('div', { id: 'eingangBox' }, h('b', {}, '📥 Neu im Eingang (IServ)'),
    ...liste.map(x => h('div', { class: 'eg-zeile', 'data-key': x.key }, h('span', { class: 'eg-text' }, x.text),
      h('button', { class: 'big prim', onclick: () => uebernehmen(x) }, x.art === 'tafel' ? 'Übernehmen & öffnen' : 'Zusammenführen'),
      h('button', { class: 'big', title: 'Erst einmal liegen lassen', onclick: () => weg(x) }, 'Später'))));
  box.addEventListener('pointerdown', e => e.stopPropagation());
  document.body.append(box);
}
document.head.append(Object.assign(document.createElement('style'), { textContent:
  '#eingangBox{position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:57;background:var(--surface);color:var(--text);border:2px solid #34d399;border-radius:16px;box-shadow:var(--shadow-lg);padding:10px 14px;display:flex;flex-direction:column;gap:8px;max-width:min(680px,94vw)}'
  + '#eingangBox .eg-zeile{display:flex;align-items:center;gap:8px;flex-wrap:wrap}#eingangBox .eg-text{flex:1;min-width:200px}' }));
setTimeout(pruefen, 3000); setInterval(pruefen, 60000); addEventListener('focus', () => setTimeout(pruefen, 500));
T.eingangPruefen = pruefen;
/* Hinweis auf dem Tablet (ohne echten Ablageordner): wohin speichern, damit das Smartboard es findet */
T.eingangHinweis = () => T.SCHUELER
  ? 'Zum Weiterarbeiten an einem anderen Gerät: in IServ (Eigene Dateien) sichern – dort über „📥 Wiederherstellen“ bzw. „📂 Tafel-Datei öffnen“ wieder holen.'
  : 'Fürs Smartboard: beim Teilen IServ wählen und im verbundenen Ablageordner der Tafel den eigenen Ordner wählen (Name › Klasse › Fach) – am Board steht die Tafel dann gleich in der Liste. Eine Sicherung („alles“) am Board über 💾 Sicherung › 📥 Wiederherstellen holen.';
})();
