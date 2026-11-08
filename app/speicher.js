// Tafel-App – Ablage: Ordner (File System Access API) mit Rückfall auf Download/Upload
'use strict';
(function () {
const DB = 'tafelapp', ST = 'kv';
function idb() { return new Promise((res, rej) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(ST); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
T.idbGet = async k => { const db = await idb(); return new Promise((res, rej) => { const q = db.transaction(ST).objectStore(ST).get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); };
T.idbSet = async (k, v) => { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction(ST, 'readwrite'); tx.objectStore(ST).put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); };

const F = T.ablage = { root: null, pending: null, supported: !!window.showDirectoryPicker };
// iPad/Safari: der Gerätespeicher der App (OPFS) kennt dort oft kein „createWritable“ – Ersatz über einen kleinen Hintergrund-Helfer
// (Worker mit createSyncAccessHandle). Die übrige App schreibt unverändert mit createWritable → write → close.
T.schreibErsatz = () => {
  if (typeof FileSystemFileHandle === 'undefined' || 'createWritable' in FileSystemFileHandle.prototype) return false;
  const code = 'onmessage=async e=>{const{id,fh,daten}=e.data;try{const h=await fh.createSyncAccessHandle();h.truncate(0);h.write(new Uint8Array(daten),{at:0});h.flush();h.close();postMessage({id})}catch(x){postMessage({id,fehler:String(x&&x.message||x)})}}';
  const helfer = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))), warte = new Map(); let nr = 0;
  helfer.onmessage = e => { const w = warte.get(e.data.id); if (!w) return; warte.delete(e.data.id); if (e.data.fehler) w.nein(new Error(e.data.fehler)); else w.ja(); };
  const bytes = async d => typeof d === 'string' ? new TextEncoder().encode(d) : d instanceof Blob ? new Uint8Array(await d.arrayBuffer()) : d instanceof ArrayBuffer ? new Uint8Array(d) : ArrayBuffer.isView(d) ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength) : new TextEncoder().encode(String(d));
  FileSystemFileHandle.prototype.createWritable = async function () {
    const fh = this, teile = [];
    return { write: async d => { teile.push(await bytes(d && d.type === 'write' ? d.data : d)); },
      close: async () => { const n = teile.reduce((s, t) => s + t.length, 0), alle = new Uint8Array(n); let o = 0; for (const t of teile) { alle.set(t, o); o += t.length; }
        const id = ++nr; await new Promise((ja, nein) => { warte.set(id, { ja, nein }); helfer.postMessage({ id, fh, daten: alle.buffer }, [alle.buffer]); }); },
      abort: async () => { teile.length = 0; } };
  };
  return true;
};
F.init = async () => {
  if (!F.supported) { // z. B. Android, iPad: kein Ordnerzugriff → Speicher der App auf dem Gerät (gleiche Ordnerstruktur)
    if (navigator.storage && navigator.storage.getDirectory) {
      try { F.root = await navigator.storage.getDirectory(); F.intern = true; T.schreibErsatz(); if (navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    }
    return;
  }
  try {
    // Jede Lehrkraft hat ihren eigenen Ablageordner (gemerkt auf diesem Gerät). Ältere Fassung: ein gemeinsamer Ordner „root“ –
    // der wird beim ersten Start der zuletzt gewählten Lehrkraft zugeordnet.
    const name = T.opts.lehrkraft;
    let h = name ? await T.idbGet(rootKey(name)) : null;
    if (!h) { const alt = await T.idbGet('root'); if (alt && name) { await T.idbSet(rootKey(name), alt); h = alt; } else if (!name) h = alt; }
    if (!h) return;
    const p = await h.queryPermission({ mode: 'readwrite' });
    if (p === 'granted') F.root = h; else F.pending = h;
  } catch (e) {}
};
const rootKey = name => 'root:' + F.safe(name);
F.connect = async () => {
  const h = await window.showDirectoryPicker({ id: 'tafelapp', mode: 'readwrite' });
  const name = T.opts.lehrkraft;
  await T.idbSet(name ? rootKey(name) : 'root', h); F.root = h; F.pending = null;
};
// Lehrkraft gewechselt (Anmelden auf der Startseite): ihren eigenen Ablageordner verbinden.
// Fragt der Browser nach Erlaubnis, wird – solange der Tipp noch „frisch“ ist – gleich gefragt; sonst erscheint „▶ Starten“.
// Gemerkte Ordner aller Lehrkräfte vorab laden – so kann ein Tipp auf den Namen die Erlaubnis SOFORT (noch im Tipp) anfragen:
// der Browser zeigt dann nur „Zulassen“, kein Ordner-Auswählen mehr.
F.handleCache = {}; F.freigabe = null;
F.ladeOrdner = async namen => { for (const n of namen) { try { F.handleCache[n] = await T.idbGet(rootKey(n)) || null; } catch (e) { F.handleCache[n] = null; } } };
F.hatOrdner = n => !!F.handleCache[n];
F.sofortFreigeben = name => {
  const h = F.handleCache[name]; F.freigabe = null;
  if (!h || !h.requestPermission) return;
  try { F.freigabe = { name, p: h.requestPermission({ mode: 'readwrite' }).catch(() => 'denied') }; } catch (e) {}
};
F.wechselLehrkraft = async name => {
  if (!F.supported) return;
  F.root = null; F.pending = null;
  let h = name ? await T.idbGet(rootKey(name)).catch(() => null) : null;
  if (!h) return; // noch kein eigener Ordner → Startseite bietet „📂 Ordner wählen“ an
  try {
    if (F.freigabe && F.freigabe.name === name) { const p = await F.freigabe.p; F.freigabe = null; if (p === 'granted') { F.root = h; return; } }
    let p = await h.queryPermission({ mode: 'readwrite' });
    if (p !== 'granted') { try { p = await h.requestPermission({ mode: 'readwrite' }); } catch (e) {} }
    if (p === 'granted') F.root = h; else F.pending = h;
  } catch (e) { F.pending = h; }
};
F.hatEigenenOrdner = async name => !!(name && await T.idbGet(rootKey(name)).catch(() => null));
F.reconnect = async () => {
  if (!F.pending) { await F.connect(); return true; }
  const p = await F.pending.requestPermission({ mode: 'readwrite' });
  if (p === 'granted') { F.root = F.pending; F.pending = null; return true; }
  return false;
};
F.name = () => (F.root || F.pending || {}).name || '';
F.safe = s => String(s || '').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').replace(/^\.+/, '').trim().slice(0, 80) || 'Tafel';
F.dir = async (parts, create) => { let d = F.root; for (const p of parts) d = await d.getDirectoryHandle(F.safe(p), { create }); return d; };
const IGNORE = /^(app|\..*|_.*)$/i;
// Ablage: Lehrkraft › Klasse › Fach. „wer“ ist der Lehrkraft-Name oder [Lehrkraft, „Klasse 7b“];
// ältere Tafeln ohne Klasse liegen weiter direkt unter Lehrkraft › Fach.
const KL = 'Klasse ';
F.wer = (lehrkraft, klasse) => klasse ? [lehrkraft, KL + klasse] : [lehrkraft];
const pf = wer => Array.isArray(wer) ? wer : [wer];
F.teachers = async () => {
  const out = []; if (!F.root) return out;
  for await (const [n, h] of F.root.entries()) if (h.kind === 'directory' && !IGNORE.test(n)) out.push(n);
  return out.sort((a, b) => a.localeCompare(b, 'de'));
};
// Freiwilliger PIN pro Lehrkraft (Sperre in der App): gespeichert nur als Prüfwert (Salz + SHA-256), im Ordner der Lehrkraft
// (gilt so auf allen Geräten mit diesem Ablageordner), ohne Ablageordner im Browser.
const PIN_DATEI = '_pin.json', pinKey = t => 'tafelapp.pin.' + F.safe(t);
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
async function pinHash(pin, salz) {
  const text = salz + '|' + pin;
  if (crypto.subtle) return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  let h = 2166136261; for (const c of text) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return 'f' + (h >>> 0).toString(16); // Notlösung ohne Web-Crypto
}
F.pinLesen = async teacher => {
  if (F.root) { try { const d = await F.dir([teacher], false), f = await (await d.getFileHandle(PIN_DATEI)).getFile(); return JSON.parse(await f.text()); } catch (e) { return null; } }
  try { return JSON.parse(localStorage.getItem(pinKey(teacher)) || 'null'); } catch (e) { return null; }
};
F.pinSetzen = async (teacher, pin) => { // pin = null entfernt die Sperre
  const daten = pin ? (() => { const salz = hex(crypto.getRandomValues(new Uint8Array(12))); return { salz }; })() : null;
  if (daten) daten.hash = await pinHash(pin, daten.salz);
  if (F.root) {
    const d = await F.dir([teacher], true);
    if (!daten) { try { await d.removeEntry(PIN_DATEI); } catch (e) {} return; }
    const w = await (await d.getFileHandle(PIN_DATEI, { create: true })).createWritable(); await w.write(JSON.stringify(daten)); await w.close(); return;
  }
  try { if (daten) localStorage.setItem(pinKey(teacher), JSON.stringify(daten)); else localStorage.removeItem(pinKey(teacher)); } catch (e) {}
};
F.pinPruefen = async (teacher, pin) => { const p = await F.pinLesen(teacher); return !p || (await pinHash(pin, p.salz)) === p.hash; };
F.klassen = async teacher => {
  const out = []; if (!F.root) return out;
  try { for await (const [n, h] of (await F.dir([teacher], false)).entries()) if (h.kind === 'directory' && n.startsWith(KL)) out.push(n.slice(KL.length)); } catch (e) {}
  return out.sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));
};
F.faecher = async wer => {
  const out = {}; if (!F.root) return out;
  try {
    const d = await F.dir(pf(wer), false);
    for await (const [n, h] of d.entries()) if (h.kind === 'directory' && !IGNORE.test(n) && !n.startsWith(KL)) {
      let c = 0; for await (const [m, x] of h.entries()) if (x.kind === 'file' && m.endsWith('.tafel.json')) c++;
      out[n] = c;
    }
  } catch (e) {}
  return out;
};
F.boards = async (wer, fach) => {
  const out = []; if (!F.root) return out;
  let d; try { d = await F.dir([...pf(wer), fach], false); } catch (e) { return out; }
  for await (const [n, h] of d.entries()) {
    if (h.kind !== 'file' || !n.endsWith('.tafel.json')) continue;
    const m = n.match(/^(\d{4}-\d{2}-\d{2})\s+(.*?)\.tafel\.json$/);
    let mod = 0; try { mod = (await h.getFile()).lastModified; } catch (e) {}
    out.push({ name: n, datum: m ? m[1] : '', titel: m ? m[2] : n.replace(/\.tafel\.json$/, ''), mod });
  }
  return out.sort((a, b) => b.name.localeCompare(a.name, 'de'));
};
F.read = async (wer, fach, name) => {
  const w = pf(wer), d = await F.dir([...w, fach], false), fh = await d.getFileHandle(name), file = await fh.getFile();
  const board = JSON.parse(await file.text());
  if (w[1] && !board.klasse) board.klasse = w[1].slice(KL.length);
  return { board, file: { teacher: F.safe(w[0]), klasse: w[1] ? F.safe(w[1]) : '', fach: F.safe(fach), name, lastMod: file.lastModified } };
};
const exists = async (d, n) => { try { await d.getFileHandle(n); return true; } catch (e) { return false; } };
const unique = async (d, base) => { let n = base + '.tafel.json', i = 2; while (await exists(d, n)) n = `${base} (${i++}).tafel.json`; return n; };

// Speichert die Tafel. Fremde Änderungen an der Datei werden nie überschrieben (dann entsteht eine Konfliktkopie).
F.save = async (board, file) => {
  const teacher = F.safe(board.lehrkraft), fach = F.safe(board.fach), klasse = board.klasse ? F.safe(KL + board.klasse) : '';
  const d = await F.dir([teacher, ...(klasse ? [klasse] : []), fach], true);
  const base = `${board.datum} ${F.safe(board.titel)}`, wanted = base + '.tafel.json';
  let name, removeOld = null, hinweis = '';
  if (file && file.teacher === teacher && (file.klasse || '') === klasse && file.fach === fach) {
    let cur = null; try { cur = await (await d.getFileHandle(file.name)).getFile(); } catch (e) {}
    if (cur && file.lastMod && cur.lastModified !== file.lastMod) { name = await unique(d, base + ' (Konflikt)'); hinweis = 'konflikt'; }
    else if (file.name === wanted || !cur && !(await exists(d, wanted))) name = wanted;
    else { name = await unique(d, base); if (cur) removeOld = { d, name: file.name }; }
  } else {
    name = await unique(d, base);
    if (file) {
      try {
        const od = await F.dir([file.teacher, ...(file.klasse ? [file.klasse] : []), file.fach], false), cur = await (await od.getFileHandle(file.name)).getFile();
        if (cur.lastModified === file.lastMod) removeOld = { d: od, name: file.name };
      } catch (e) {}
    }
  }
  const fh = await d.getFileHandle(name, { create: true });
  const w = await fh.createWritable(); await w.write(JSON.stringify(board)); await w.close();
  const lastMod = (await fh.getFile()).lastModified;
  if (removeOld && removeOld.name !== name) { try { await removeOld.d.removeEntry(removeOld.name); } catch (e) {} } // alte Datei nach Umbenennen
  return { file: { teacher, klasse, fach, name, lastMod }, hinweis };
};

// Löschen = in den Papierkorb der Lehrkraft verschieben (Lehrkraft › _Papierkorb › Fach), wiederherstellbar
const kopiere = async (vonDir, name, nachDir, zielName) => {
  const text = await (await (await vonDir.getFileHandle(name)).getFile()).text();
  const fh = await nachDir.getFileHandle(zielName, { create: true }), w = await fh.createWritable(); await w.write(text); await w.close();
};
F.trash = async (wer, fach, name) => {
  const von = await F.dir([...pf(wer), fach], false), nach = await F.dir([...pf(wer), '_Papierkorb', fach], true);
  const base = name.replace(/\.tafel\.json$/, ''); const ziel = (await exists(nach, name)) ? (await unique(nach, base)) : name;
  await kopiere(von, name, nach, ziel); await von.removeEntry(name);
};
F.trashList = async wer => {
  const out = []; if (!F.root) return out;
  let pk; try { pk = await F.dir([...pf(wer), '_Papierkorb'], false); } catch (e) { return out; }
  for await (const [fach, d] of pk.entries()) if (d.kind === 'directory') for await (const [n, x] of d.entries()) if (x.kind === 'file' && n.endsWith('.tafel.json')) {
    let zeit = 0; try { zeit = (await x.getFile()).lastModified; } catch (e) {} // Zeitpunkt des Löschens (die Datei wird beim Löschen neu geschrieben)
    out.push({ fach, name: n, zeit }); }
  return out.sort((a, b) => b.name.localeCompare(a.name, 'de'));
};
// Papierkorb: endgültig löschen (einzeln) bzw. alles, was länger als „tage“ darin liegt
F.trashDelete = async (wer, fach, name) => { const d = await F.dir([...pf(wer), '_Papierkorb', fach], false); await d.removeEntry(name); };
F.trashPurge = async (wer, tage, fach) => {
  let n = 0; const grenze = Date.now() - tage * 864e5;
  for (const x of await F.trashList(wer)) { if (fach && x.fach !== fach) continue; if (tage && x.zeit && x.zeit > grenze) continue; try { await F.trashDelete(wer, x.fach, x.name); n++; } catch (e) {} }
  return n;
};
F.restore = async (wer, fach, name) => {
  const von = await F.dir([...pf(wer), '_Papierkorb', fach], false), nach = await F.dir([...pf(wer), fach], true);
  const ziel = (await exists(nach, name)) ? (await unique(nach, name.replace(/\.tafel\.json$/, ''))) : name;
  await kopiere(von, name, nach, ziel); await von.removeEntry(name); return ziel;
};

// Sicherung: alle Tafeln, Notizen usw. der Ablage in einer Datei (zum Übertragen, z. B. per USB-Stick oder IServ)
F.sicherung = async () => {
  const dateien = [];
  const lauf = async (dir, pfad) => {
    for await (const [n, x] of dir.entries()) {
      if (x.kind === 'directory') { if (!pfad.length && IGNORE.test(n) && !n.startsWith('_')) continue; await lauf(x, pfad.concat(n)); }
      else if (n.endsWith('.json') && pfad.length) dateien.push({ pfad, name: n, inhalt: await (await x.getFile()).text() });
    }
  };
  await lauf(F.root, []);
  const blob = new Blob([JSON.stringify({ app: 'Tafel-App-Sicherung', version: 1, erstellt: new Date().toISOString(), dateien })], { type: 'application/json' });
  T.downloadBlob(blob, `Tafel-App Sicherung ${T.today()}.json`);
  return dateien.length;
};
F.einspielen = async bundle => { // vorhandene Dateien werden nie überschrieben – gleichnamige bekommen eine Nummer
  let n = 0;
  for (const f of bundle.dateien || []) {
    if (!Array.isArray(f.pfad) || !f.name || f.pfad.some(p => /[\\/:*?"<>|]|^\.\.?$/.test(p))) continue;
    const d = await F.dir(f.pfad, true);
    let name = f.name;
    if (await exists(d, name)) { const alt = await (await (await d.getFileHandle(name)).getFile()).text(); if (alt === f.inhalt) continue; name = await unique(d, name.replace(/(\.tafel)?\.json$/, '')); if (!f.name.endsWith('.tafel.json')) name = name.replace(/\.tafel\.json$/, '.json'); }
    const w = await (await d.getFileHandle(name, { create: true })).createWritable(); await w.write(f.inhalt); await w.close(); n++;
  }
  return n;
};
F.istSicherung = j => j && j.app === 'Tafel-App-Sicherung' && Array.isArray(j.dateien);

F.download = board => {
  const blob = new Blob([JSON.stringify(board)], { type: 'application/json' });
  T.downloadBlob(blob, `${F.safe(board.lehrkraft)} - ${board.klasse ? F.safe(board.klasse) + ' - ' : ''}${F.safe(board.fach)} - ${board.datum} ${F.safe(board.titel)}.tafel.json`);
};
T.downloadBlob = (blob, name) => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
};
T.pickFile = accept => new Promise(res => {
  const i = document.createElement('input'); i.type = 'file'; i.accept = accept;
  i.onchange = () => res(i.files[0] || null); i.click();
});
F.upload = async () => {
  const f = await T.pickFile('.json,application/json'); if (!f) return null;
  return JSON.parse(await f.text());
};

T.checkBoard = b => {
  if (!b || !Array.isArray(b.pages)) throw new Error('Das ist keine Tafel-Datei.');
  b.pages.forEach(p => { p.items = Array.isArray(p.items) ? p.items : []; p.view = p.view || { x: 0, y: 0, z: 1 }; p.bg = p.bg || 'weiss'; p.items.forEach(it => { it.id = it.id || T.uid(); }); });
  if (!b.pages.length) b.pages.push(T.newPage());
  b.lehrkraft = b.lehrkraft || T.opts.lehrkraft || 'Lehrkraft'; b.fach = b.fach || 'Sonstiges'; b.titel = b.titel || 'Tafel'; b.datum = b.datum || T.today();
  return b;
};
})();
