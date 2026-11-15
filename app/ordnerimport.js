// Tafel-App – viele Tafeln auf einmal übernehmen: ganzer Ordner (z. B. der Ablageordner in IServ), ZIP-Datei oder mehrere Dateien.
// Jede Tafel kommt in Lehrkraft › Klasse › Fach (wie beim Speichern); vorhandene Dateien werden nie überschrieben.
// Gemeinsame Datei für die Lehrkräfte-Version (GitHub) und die Schüler-Version – in beiden gleich halten.
'use strict';
(function () {
const F = T.ablage; if (!F) return;
const KL = 'Klasse ';
const waehlen = (accept, ordner) => new Promise(res => {
  const i = document.createElement('input'); i.type = 'file'; i.multiple = true;
  if (ordner) i.webkitdirectory = true; else i.accept = accept;
  i.onchange = () => res([...(i.files || [])]); i.click();
});
T.dateienWaehlen = () => waehlen('.json,.zip,application/json,application/zip');
T.ordnerWaehlen = () => waehlen('', true);
T.ordnerWahlMoeglich = (() => { try { return 'webkitdirectory' in document.createElement('input'); } catch (e) { return false; } })();

// alle .json-Dateien einsammeln – mit ihrem Pfad (Ordner …, Dateiname)
const istZip = f => /\.zip$/i.test(f.name) || /zip/.test(f.type || '');
const sammeln = async dateien => {
  const out = [];
  for (const f of dateien) {
    if (istZip(f)) {
      const z = T.zipLesen(await f.arrayBuffer());
      for (const n of z.namen) {
        if (/[\\/]$/.test(n) || !/\.json$/i.test(n) || /(^|[\\/])(__MACOSX|\.)/.test(n)) continue;
        const inhalt = await z.lies(n); if (inhalt != null) out.push({ teile: n.split(/[\\/]/).filter(Boolean), inhalt }); /* manche Windows-ZIPs trennen mit \ */
      }
    } else if (/\.json$/i.test(f.name)) out.push({ teile: (f.webkitRelativePath || f.name).split('/').filter(Boolean), inhalt: await f.text() });
  }
  return out;
};

// Übernehmen: Tafeln einsortieren, Sicherungen einspielen; Ergebnis für die Meldung
T.tafelnImportieren = async dateien => {
  if (!F.root) { T.toast('Zum Übernehmen mehrerer Tafeln zuerst anmelden bzw. einen Ablageordner einrichten.', 5000); return null; }
  const roh = await sammeln(dateien), tafeln = [], sicherungen = [];
  for (const x of roh) {
    let j; try { j = JSON.parse(x.inhalt); } catch (e) { continue; }
    if (F.istSicherung(j)) sicherungen.push(j);
    else if (j && Array.isArray(j.pages)) tafeln.push({ j, teile: x.teile });
  }
  const ich = T.angemeldet && T.angemeldet() && T.opts && T.opts.lehrkraft || '';
  const lks = new Set(tafeln.map(t => t.j.lehrkraft || ''));
  const liste = []; let fremd = 0;
  for (const t of tafeln) {
    const b = t.j;
    if (ich && b.lehrkraft && b.lehrkraft !== ich && lks.size > 1) { fremd++; continue; } /* Ordner mehrerer Lehrkräfte: nur die eigenen */
    if (ich) b.lehrkraft = ich; else b.lehrkraft = b.lehrkraft || 'Lehrkraft';
    const ordner = t.teile.slice(0, -1), klOrdner = ordner.find(s => s.startsWith(KL));
    if (!b.klasse && klOrdner) b.klasse = klOrdner.slice(KL.length);
    b.fach = b.fach || (ordner.length ? ordner[ordner.length - 1] : '') || 'Sonstiges';
    b.titel = b.titel || 'Tafel'; b.datum = b.datum || T.today();
    let name = t.teile[t.teile.length - 1];
    if (/�/.test(name) || !/\.tafel\.json$/i.test(name)) name = `${b.datum} ${F.safe(b.titel)}.tafel.json`;
    liste.push({ pfad: [F.safe(b.lehrkraft), ...(b.klasse ? [F.safe(KL + b.klasse)] : []), F.safe(b.fach)], name, inhalt: JSON.stringify(b) });
  }
  let neu = liste.length ? await F.einspielen({ dateien: liste }) : 0;
  for (const s of sicherungen) neu += await F.einspielen(s);
  return { neu, tafeln: liste.length, sicherungen: sicherungen.length, fremd };
};
T.importMeldung = r => {
  if (!r.tafeln && !r.sicherungen) return 'In der Auswahl wurde keine Tafel gefunden.';
  return `📥 ${r.neu} Tafel(n) übernommen – einsortiert nach Klasse und Fach.`
    + (r.tafeln - r.neu > 0 && !r.sicherungen ? ` ${r.tafeln - r.neu} waren schon vorhanden.` : '')
    + (r.fremd ? ` ${r.fremd} Tafel(n) anderer Lehrkräfte wurden übersprungen.` : '');
};
})();
