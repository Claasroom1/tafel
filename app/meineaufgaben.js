// Tafel-App – ⭐ Meine Aufgaben
// ANLEGEN oben über „💾 Speichern ▾“: ganze Seite, Auswahl oder eine Aufgaben-Sammlung (Aufgabe + Lösung, Jahrgang, ★-Niveau).
// AUFRUFEN im Aufgaben-Menü (Reiter „⭐ Meine Aufgaben“) – mit Filtern nach Fach, Klasse, Jahrgang, Art und Suchwort.
// Sammlungen: localStorage „tafelapp.meineAufgaben“ (gehört zu den persönlichen Einstellungen, wird mit _einstellungen.json gesichert).
// Seiten/Ausschnitte (können Bilder enthalten): Ablageordner der Lehrkraft „_Meine Aufgaben/seiten.json“, ohne Ordner IndexedDB.
'use strict';
(function () {
const h = T.h, S = T.S, KEY = 'tafelapp.meineAufgaben', F = T.ablage;
const lade = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
const sichere = a => { try { localStorage.setItem(KEY, JSON.stringify(a)); return true; } catch (e) { T.toast('Konnte nicht speichern: ' + e.message, 4000); return false; } };
const FACH_VON = { mathe: 'Mathe', nawi: 'NaWi', englisch: 'Englisch' };
const tafelFach = () => { const f = (S.board && S.board.fach) || 'Sonstiges'; return /^sonstiges/i.test(f) && S.aufFach && FACH_VON[S.aufFach] ? FACH_VON[S.aufFach] : f; };
const tafelKlasse = () => (S.board && S.board.klasse) || T.opts.klasse || '';
const BUCHST = 'abcdefghijklmnopqrstuvwxyz';
const NAWI = /^(NaWi|Physik|Chemie|Biologie|Technik)/;
let filter = null; // { fach, klasse, jg, art, suche } – beim ersten Öffnen: Fach der Tafel, alle Klassen
let neuZeichnenPanel = null; // Liste im Aufgaben-Menü nach dem Speichern auffrischen

const zuText = l => l.map(x => x.t + (x.l ? ' | ' + x.l : '')).join('\n');
const ausText = s => String(s || '').split('\n').map(z => { const i = z.indexOf('|'); return i < 0 ? { t: z.trim(), l: '' } : { t: z.slice(0, i).trim(), l: z.slice(i + 1).trim() }; }).filter(x => x.t);
const einfuegen = (a, art) => T.aufgabenEinfuegen(a, art || T.opts.aufLoes || 'einzeln', T.opts.platz || 'mittel');
function aufTafel(s, mischen) {
  let liste = s.aufgaben.slice(); if (!liste.length) { T.toast('Die Sammlung ist leer.'); return; }
  if (mischen) for (let i = liste.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [liste[i], liste[j]] = [liste[j], liste[i]]; }
  const mitL = liste.some(x => x.l);
  einfuegen({ titel: s.name + (s.nv ? '  ' + '★'.repeat(s.nv) : ''),
    aufgaben: liste.map((x, i) => (liste.length > 1 ? (BUCHST[i] || (i + 1)) + ') ' : '') + x.t),
    loesungen: mitL ? liste.map(x => x.l || '–') : [] }, mitL ? null : 'keine');
}
// Jahrgang (5–10) und Klasse: „a“ wird mit Jg. 7 zu „7a“; Eigenes wie „5.1“ bleibt, wie es eingetippt ist
const klasseZerlegen = k => { const m = String(k || '').match(/^(5|6|7|8|9|10)\s*([a-zA-Z])$/); return m ? { jg: +m[1], buchst: m[2].toLowerCase() } : { jg: 0, buchst: String(k || '') }; };
const klasseBauen = (jg, eingabe) => { const e = String(eingabe || '').trim(); return jg && /^[a-zA-Z]$/.test(e) ? jg + e.toLowerCase() : e; };
function klassenWahl(s) { // s.jg, s.klasse werden direkt gesetzt
  const z = klasseZerlegen(s.klasse); if (!s.jg && z.jg) s.jg = z.jg;
  const inp = h('input', { class: 'feld ma-klasse', value: z.jg ? z.buchst : (s.klasse || ''), placeholder: 'a, b, c … oder z. B. 5.1', oninput: () => { s.klasse = klasseBauen(s.jg, inp.value); } });
  const jgReihe = h('div', { class: 'row ma-jg' }, ...[0, 5, 6, 7, 8, 9, 10].map(j => h('button', { class: 'big' + ((s.jg || 0) === j ? ' on' : ''), onclick: () => { s.jg = j; [...jgReihe.children].forEach((b, i) => b.classList.toggle('on', [0, 5, 6, 7, 8, 9, 10][i] === j)); s.klasse = klasseBauen(j, inp.value); } }, j ? 'Jg. ' + j : 'alle')));
  return h('div', { class: 'fld' }, h('span', {}, 'Jahrgang'), jgReihe, h('span', {}, 'Klasse (leer = alle Klassen des Jahrgangs)'), inp);
}
const faecher = extra => { const l = (T.FAECHER || []).map(x => x.id || x); for (const e of [].concat(extra || [])) if (e && !l.includes(e)) l.push(e); return l; };

// ---------- ＋ Aufgaben-Sammlung anlegen / bearbeiten (Dialog) ----------
function sammlungDialog(alt) {
  const s = alt ? JSON.parse(JSON.stringify(alt)) : { id: T.uid(), name: '', fach: tafelFach(), klasse: tafelKlasse(), jg: 0, nv: 0, aufgaben: [] };
  const name = h('input', { class: 'feld', value: s.name, placeholder: 'Name, z. B. „Prozentrechnung – Grundwert“', oninput: e => { s.name = e.target.value; } });
  const fach = h('select', { class: 'feld', onchange: e => { s.fach = e.target.value; } }, ...faecher(s.fach).map(f => h('option', { value: f, selected: f === s.fach }, f)));
  const nv = h('div', { class: 'row' }, ...[0, 1, 2, 3].map(n => h('button', { class: 'big' + ((s.nv || 0) === n ? ' on' : ''), onclick: () => { s.nv = n; [...nv.children].forEach((b, i) => b.classList.toggle('on', i === n)); } }, n ? '★'.repeat(n) : 'ohne')));
  const tab = T.tabFeld({ typ: 'tabelle', l: 'Aufgaben – je Zeile eine Aufgabe, rechts die Lösung (darf leer bleiben)', kopf: ['Aufgabe', 'Lösung'], spalten: 2, fest: 2, trenner: ' | ' }, zuText(s.aufgaben));
  const speichern = () => {
    s.aufgaben = ausText(tab.get());
    if (!s.name.trim()) { T.toast('Bitte oben einen Namen eingeben.'); name.focus(); return; }
    if (!s.aufgaben.length) { T.toast('Bitte mindestens eine Aufgabe eintragen.'); return; }
    s.name = s.name.trim(); s.geaendert = new Date().toISOString();
    const alle = lade(), i = alle.findIndex(x => x.id === s.id); if (i >= 0) alle[i] = s; else alle.push(s);
    if (!sichere(alle)) return;
    T.closeDlg(); T.toast('⭐ Gespeichert – unter „Aufgaben › ⭐ Meine Aufgaben“.', 2500); neuZeichnenPanel && neuZeichnenPanel();
  };
  T.openDlg([h('h2', {}, alt ? '✏️ Aufgaben-Sammlung bearbeiten' : '＋ Neue Aufgaben-Sammlung'),
    h('label', { class: 'fld' }, 'Name', name),
    h('label', { class: 'fld' }, 'Fach', fach),
    klassenWahl(s),
    h('div', { class: 'fld' }, h('span', {}, 'Niveau (steht als Sterne im Titel)'), nv),
    tab.el,
    h('p', { class: 'hint' }, 'Tipp: Eine Tabelle aus Word oder Excel (Spalte Aufgabe, Spalte Lösung) kopieren und ins erste Feld einfügen.'),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: () => { s.aufgaben = ausText(tab.get()); if (!s.aufgaben.length) { T.toast('Noch keine Aufgaben.'); return; } T.closeDlg(); aufTafel(s, false); } }, '⤴ Nur auf die Tafel'),
      h('button', { class: 'big prim', onclick: speichern }, '💾 Speichern'))], true);
  setTimeout(() => name.focus(), 50);
}
T.sammlungDialog = sammlungDialog;

// ---------- 📄 Seiten und Ausschnitte ----------
const lk = () => T.opts.lehrkraft || 'Lehrkraft';
let seiten = null, seitenLaedt = null, seitenFuer = null;
async function seitenLaden() {
  if (seiten && seitenFuer === lk()) return seiten; if (seitenLaedt) return seitenLaedt;
  seitenLaedt = (async () => {
    let d = null;
    if (F && F.root && T.opts.lehrkraft) { try { const dir = await F.dir([lk(), '_Meine Aufgaben'], false); d = JSON.parse(await (await (await dir.getFileHandle('seiten.json')).getFile()).text()); } catch (e) { d = null; } }
    if (!d) { try { d = await T.idbGet('meineSeiten:' + lk()); } catch (e) { d = null; } }
    seiten = d && Array.isArray(d.seiten) ? d.seiten : []; seitenFuer = lk(); seitenLaedt = null; return seiten;
  })();
  return seitenLaedt;
}
async function seitenSichern() {
  const daten = { seiten, geaendert: new Date().toISOString() };
  try {
    if (F && F.root && T.opts.lehrkraft) { const dir = await F.dir([lk(), '_Meine Aufgaben'], true), fh = await dir.getFileHandle('seiten.json', { create: true }), w = await fh.createWritable(); await w.write(JSON.stringify(daten)); await w.close(); }
    else await T.idbSet('meineSeiten:' + lk(), daten);
    return true;
  } catch (e) { T.toast('Nicht gespeichert: ' + (e.message || e), 4000); return false; }
}
const box = items => { const bb = items.map(T.bbox); return { x0: Math.min(...bb.map(b => b.x0)), y0: Math.min(...bb.map(b => b.y0)), x1: Math.max(...bb.map(b => b.x1)), y1: Math.max(...bb.map(b => b.y1)) }; };
async function vorschauBild(items, bg) {
  const b = box(items), m = 20, w = b.x1 - b.x0 + 2 * m, hh = b.y1 - b.y0 + 2 * m, s = Math.min(1, 360 / w, 240 / hh);
  const c = document.createElement('canvas'); c.width = Math.max(20, Math.round(w * s)); c.height = Math.max(20, Math.round(hh * s));
  const x = c.getContext('2d'), r = { x0: b.x0 - m, y0: b.y0 - m, x1: b.x1 + m, y1: b.y1 + m }, pg = { items, bg: bg || 'weiss', view: { x: 0, y: 0, z: 1 } };
  x.setTransform(s, 0, 0, s, -r.x0 * s, -r.y0 * s); T.paintPage(x, pg, r, 1 / s, { export: true });
  await new Promise(res => setTimeout(res, 350)); T.paintPage(x, pg, r, 1 / s, { export: true }); /* Bilder und Bausteine sind dann geladen */
  return c.toDataURL('image/jpeg', 0.75);
}
async function seiteAblegen(nurAuswahl) {
  const pg = T.page(); let items = pg.items.filter(i => !(nurAuswahl && !(S.sel && S.sel.ids && S.sel.ids.has(i.id))));
  if (!items.length) { T.toast(nurAuswahl ? 'Erst etwas auswählen.' : 'Die Seite ist leer.'); return; }
  const vorschlag = (nurAuswahl ? '' : (pg.titel || '')) || (S.board && S.board.titel) || '';
  items = JSON.parse(JSON.stringify(items)); items.forEach(i => { delete i.ag; });
  const e = { id: T.uid(), art: 'seite', name: vorschlag, fach: tafelFach(), klasse: tafelKlasse(), jg: 0, bg: pg.bg, abstand: pg.abstand || null, items };
  const name = h('input', { class: 'feld', value: e.name, placeholder: 'Name, z. B. „Satzglieder bestimmen“', oninput: ev => { e.name = ev.target.value; } });
  const fach = h('select', { class: 'feld', onchange: ev => { e.fach = ev.target.value; } }, ...faecher(e.fach).map(f => h('option', { value: f, selected: f === e.fach }, f)));
  const bild = h('img', { class: 'ma-bild', alt: '' }); vorschauBild(items, pg.bg).then(src => { bild.src = src; e.bild = src; });
  const hinzufuegen = async () => {
    if (!e.name.trim()) { T.toast('Bitte einen Namen eingeben.'); name.focus(); return; }
    e.name = e.name.trim(); e.datum = new Date().toISOString(); if (!e.bild) e.bild = await vorschauBild(items, pg.bg);
    await seitenLaden(); seiten.unshift(e);
    if (await seitenSichern()) { T.closeDlg(); T.toast('⭐ Abgelegt – unter „Aufgaben › ⭐ Meine Aufgaben“.', 2500); neuZeichnenPanel && neuZeichnenPanel(); }
  };
  T.openDlg([h('h2', {}, nurAuswahl ? `⭐ Auswahl (${items.length}) zu „Meine Aufgaben“` : '⭐ Diese Seite zu „Meine Aufgaben“'),
    bild, h('label', { class: 'fld' }, 'Name', name), h('label', { class: 'fld' }, 'Fach', fach), klassenWahl(e),
    h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: hinzufuegen }, '⭐ Hinzufügen'))]);
  setTimeout(() => { name.focus(); name.select(); }, 50);
}
T.seiteZuMeinenAufgaben = seiteAblegen;
function seiteEinsetzen(e, neueSeite) {
  const neuId = new Map(e.items.map(it => [it.id, T.uid()]));
  let dx = 0, dy = 0;
  if (!neueSeite) { const b = box(e.items), [cx, cy] = T.viewCenter(); dx = cx - (b.x0 + b.x1) / 2; dy = cy - (b.y0 + b.y1) / 2; }
  const neu = e.items.map(it => { const k = { ...JSON.parse(JSON.stringify(it)), id: neuId.get(it.id) };
    if (k.t === 's') k.p = k.p.map(q => [T.r1(q[0] + dx), T.r1(q[1] + dy), q[2]]); else { k.x += dx; k.y += dy; }
    if (k.an) { const a = k.an.map(i => Array.isArray(i) ? (i.every(j => neuId.has(j)) ? i.map(j => neuId.get(j)) : null) : neuId.get(i)); if (a[0] && a[1]) k.an = a; else delete k.an; }
    return k; });
  if (T.neueGruppen) T.neueGruppen(neu);
  T.snap();
  if (neueSeite) {
    const p = T.newPage(e.bg || T.page().bg); p.abstand = e.abstand || null; p.items.push(...neu);
    S.board.pages.splice(S.page + 1, 0, p); T.gotoPage(S.page + 1);
    T.toast('📄 Als neue Seite ' + (S.page + 1) + ' eingefügt.', 2000);
  } else { T.page().items.push(...neu); T.nachEinfuegen(neu.map(i => i.id)); }
  T.changed && T.changed(); T.render(); T.renderOver();
}

// ---------- 📌 Meine Vorlagen: markierte Objekte (Bild, Tabelle, Bausteine, Text, Handschrift …) als eigene Vorlage ----------
// Speichern: Kontextmenü „📌 Als Vorlage speichern“ · Einsetzen: Einfügen › 📌 Meine Vorlagen (Lehrkraft › _Meine Vorlagen › vorlagen.json)
let vorlagen = null, vorlagenFuer = null;
async function vorlagenLaden() {
  if (vorlagen && vorlagenFuer === lk()) return vorlagen;
  let d = null;
  if (F && F.root && T.opts.lehrkraft) { try { const dir = await F.dir([lk(), '_Meine Vorlagen'], false); d = JSON.parse(await (await (await dir.getFileHandle('vorlagen.json')).getFile()).text()); } catch (e) { d = null; } }
  if (!d) { try { d = await T.idbGet('meineVorlagen:' + lk()); } catch (e) { d = null; } }
  vorlagen = d && Array.isArray(d.vorlagen) ? d.vorlagen : []; vorlagenFuer = lk(); return vorlagen;
}
async function vorlagenSichern() {
  const daten = { vorlagen, geaendert: new Date().toISOString() };
  try {
    if (F && F.root && T.opts.lehrkraft) { const dir = await F.dir([lk(), '_Meine Vorlagen'], true), fh = await dir.getFileHandle('vorlagen.json', { create: true }), w = await fh.createWritable(); await w.write(JSON.stringify(daten)); await w.close(); }
    else await T.idbSet('meineVorlagen:' + lk(), daten);
    return true;
  } catch (e) { T.toast('Nicht gespeichert: ' + (e.message || e), 4000); return false; }
}
// 👥 Gemeinsame Vorlagen: im Ablageordner unter „_Gemeinsame Vorlagen“, je Vorlage eine eigene Datei (kein Überschreiben fremder Vorlagen)
const GEM = '_Gemeinsame Vorlagen';
async function gemeinsamLaden() {
  if (!F || !F.root) return [];
  const out = [];
  try { const dir = await F.dir([GEM], false); for await (const [n, fh] of dir.entries()) { if (fh.kind !== 'file' || !/\.json$/i.test(n)) continue; try { const v = JSON.parse(await (await fh.getFile()).text()); if (v && Array.isArray(v.items)) out.push({ ...v, datei: n }); } catch (e) {} } } catch (e) {}
  return out.sort((a, b) => String(b.datum || '').localeCompare(String(a.datum || '')));
}
async function gemeinsamSichern(e) {
  try { const dir = await F.dir([GEM], true), fh = await dir.getFileHandle(F.safe(e.name) + ' – ' + e.id + '.json', { create: true }), w = await fh.createWritable(); await w.write(JSON.stringify(e)); await w.close(); return true; }
  catch (x) { T.toast('Nicht freigegeben: ' + (x.message || x), 4000); return false; }
}
async function gemeinsamLoeschen(v) { try { const dir = await F.dir([GEM], false); await dir.removeEntry(v.datei); return true; } catch (x) { T.toast('Nicht gelöscht: ' + (x.message || x), 4000); return false; } }
let vorlagenNeu = null; // offenes Einfügen-Menü neu zeichnen
T.alsVorlage = () => {
  const pg = T.page(), items = pg.items.filter(i => S.sel && S.sel.ids && S.sel.ids.has(i.id));
  if (!items.length) { T.toast('Erst etwas auswählen (antippen oder Rahmen ziehen).'); return; }
  const kopie = JSON.parse(JSON.stringify(items)); kopie.forEach(i => { delete i.ag; });
  const e = { id: T.uid(), name: '', fach: tafelFach(), bg: pg.bg, items: kopie };
  const name = h('input', { class: 'feld', placeholder: 'Name, z. B. „Wochenplan-Tabelle“ oder „Kartenausschnitt“', oninput: ev => { e.name = ev.target.value; } });
  const fach = h('select', { class: 'feld', onchange: ev => { e.fach = ev.target.value; } }, h('option', { value: '' }, 'alle Fächer'), ...faecher(e.fach).map(f => h('option', { value: f, selected: f === e.fach }, f)));
  const bild = h('img', { class: 'ma-bild', alt: '' }); vorschauBild(kopie, pg.bg).then(src => { bild.src = src; e.bild = src; });
  const teilen = h('input', { type: 'checkbox', disabled: !(F && F.root), style: { width: '24px', height: '24px' } });
  const speichern = async () => {
    if (!e.name.trim()) { T.toast('Bitte einen Namen eingeben.'); name.focus(); return; }
    e.name = e.name.trim(); e.datum = new Date().toISOString(); if (!e.bild) e.bild = await vorschauBild(kopie, pg.bg);
    if (teilen.checked) { e.autor = lk(); if (await gemeinsamSichern(e)) { T.closeDlg(); T.toast('👥 Für alle freigegeben – unter „Einfügen › 📌 Meine Vorlagen › Gemeinsam“.', 3000); vorlagenNeu && vorlagenNeu(); } return; }
    await vorlagenLaden(); vorlagen.unshift(e);
    if (await vorlagenSichern()) { T.closeDlg(); T.toast('📌 Als Vorlage gespeichert – unter „Einfügen › 📌 Meine Vorlagen“.', 2800); vorlagenNeu && vorlagenNeu(); }
  };
  T.openDlg([h('h2', {}, `📌 Als Vorlage speichern (${items.length} ${items.length === 1 ? 'Element' : 'Elemente'})`), bild,
    h('label', { class: 'fld' }, 'Name', name), h('label', { class: 'fld' }, 'Fach (zum Sortieren)', fach),
    h('label', { class: 'row', style: { alignItems: 'center', gap: '10px', margin: '6px 0' } }, teilen, h('span', {}, '👥 Für alle Lehrkräfte freigeben'),
      h('span', { class: 'hint' }, F && F.root ? '(liegt dann im gemeinsamen Ablageordner)' : '(geht nur mit verbundenem Ablageordner)')),
    h('p', { class: 'hint' }, 'Gespeichert wird alles Markierte so, wie es ist – Bilder, Tabellen, Bausteine, Text und Handschrift.'),
    h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: speichern }, '📌 Speichern'))]);
  setTimeout(() => name.focus(), 50);
};
T.vorlagenPanel = () => {
  const box = h('div', {}, h('p', { class: 'hint' }, 'Wird geladen …'));
  let verwalten = false;
  const zeichne = async () => {
    await vorlagenLaden(); const gem = await gemeinsamLaden(); box.innerHTML = '';
    const gemKachel = v => {
      const t = h('button', { class: 'tile vl-tile', title: verwalten ? '' : 'Antippen: in die Mitte der Tafel einsetzen', onclick: () => { if (!verwalten) { seiteEinsetzen(v, false); T.toast('👥 „' + v.name + '“ eingesetzt.', 2000); } } },
        v.bild ? h('img', { src: v.bild, alt: '' }) : h('div', { class: 'em' }, '👥'), v.name, h('span', { class: 'vl-autor' }, 'von ' + (v.autor || '?')));
      if (!verwalten || v.autor !== lk()) return t; // löschen darf nur, wer sie freigegeben hat
      return h('div', { class: 'vl-verw' }, t, h('div', { class: 'row' }, h('button', { class: 'big warn', title: 'Freigabe zurücknehmen (für alle löschen)', onclick: async () => { if (await T.frage(`Gemeinsame Vorlage „${v.name}“ für alle löschen?`, { ok: '🗑 Löschen' }) && await gemeinsamLoeschen(v)) zeichne(); } }, '🗑')));
    };
    const gemTeil = () => gem.length ? [h('h3', {}, '👥 Gemeinsam (alle Lehrkräfte)'), h('div', { class: 'tiles' }, ...gem.map(gemKachel))] : [];
    if (!vorlagen.length) { box.append(h('p', { class: 'hint' }, 'Noch keine eigenen Vorlagen. So geht’s: auf der Tafel ein oder mehrere Objekte markieren (z. B. ein Bild und eine Tabelle) › im Kontextmenü „📌 Als Vorlage speichern“.'), ...gemTeil()); return; }
    const mein = tafelFach(), faecherDa = [...new Set(vorlagen.map(v => v.fach || ''))].sort((a, b) => (b === mein) - (a === mein) || (a === '') - (b === '') || a.localeCompare(b, 'de'));
    box.append(h('div', { class: 'row' }, h('button', { class: 'big' + (verwalten ? ' on' : ''), title: 'Umbenennen und Löschen', onclick: () => { verwalten = !verwalten; zeichne(); } }, verwalten ? '✓ Fertig' : '✏️ Verwalten')));
    for (const fa of faecherDa) {
      box.append(h('h3', {}, fa || 'Alle Fächer'));
      box.append(h('div', { class: 'tiles' }, ...vorlagen.filter(v => (v.fach || '') === fa).map(v => {
        const t = h('button', { class: 'tile vl-tile', title: verwalten ? '' : 'Antippen: in die Mitte der Tafel einsetzen', onclick: () => { if (!verwalten) { seiteEinsetzen(v, false); T.toast('📌 „' + v.name + '“ eingesetzt – gleich ausgewählt zum Verschieben.', 2000); } } },
          v.bild ? h('img', { src: v.bild, alt: '' }) : h('div', { class: 'em' }, '📌'), v.name);
        if (!verwalten) return t;
        return h('div', { class: 'vl-verw' }, t, h('div', { class: 'row' },
          h('button', { class: 'big', title: 'Umbenennen', onclick: async () => { const n = await T.frage('Neuer Name:', { feld: { wert: v.name }, ok: '✔ Umbenennen' }); if (n && n.trim()) { v.name = n.trim(); await vorlagenSichern(); zeichne(); } } }, '✏️'),
          h('button', { class: 'big warn', title: 'Löschen', onclick: async () => { if (await T.frage(`Vorlage „${v.name}“ löschen?`, { ok: '🗑 Löschen' })) { vorlagen.splice(vorlagen.indexOf(v), 1); await vorlagenSichern(); zeichne(); } } }, '🗑'),
          F && F.root ? h('button', { class: 'big', title: 'Für alle Lehrkräfte freigeben (Kopie im gemeinsamen Ordner)', onclick: async () => { if (await gemeinsamSichern({ ...v, id: T.uid(), autor: lk(), datum: new Date().toISOString() })) { T.toast('👥 Für alle freigegeben.', 2000); zeichne(); } } }, '👥') : ''));
      })));
    }
    box.append(...gemTeil());
  };
  vorlagenNeu = () => { if (box.isConnected) zeichne(); };
  zeichne();
  return box;
};

// ---------- ⭐ Meine Aufgaben aufrufen (Aufgaben-Menü) – mit Filtern ----------
T.meineAufgabenPanel = (ctx, neuZeichnen) => {
  neuZeichnenPanel = neuZeichnen;
  if (!seiten || seitenFuer !== lk()) { seitenLaden().then(() => neuZeichnen()); }
  if (!filter) filter = { fach: tafelFach(), klasse: '', jg: 0, art: '', suche: '' };
  const sam = lade().map(s => ({ ...s, art: 'sammlung' })), sei = (seiten || []);
  const alle = sam.concat(sei);
  const fachPasst = e => !filter.fach || e.fach === filter.fach || (NAWI.test(filter.fach) && NAWI.test(e.fach || ''));
  const such = filter.suche.toLowerCase();
  const liste = alle.filter(e => fachPasst(e) && (!filter.klasse || (e.klasse || '') === filter.klasse) && (!filter.jg || !e.jg || e.jg === filter.jg) && (!filter.art || e.art === filter.art)
    && (!such || (e.name + ' ' + (e.aufgaben || []).map(a => a.t).join(' ')).toLowerCase().includes(such)))
    .sort((a, b) => String(b.geaendert || b.datum || '').localeCompare(String(a.geaendert || a.datum || '')));
  // Filter
  const auswahl = (wert, opts, setze, title) => h('select', { class: 'feld', title, onchange: e => { setze(e.target.value); neuZeichnen(); } }, ...opts.map(([v, l]) => h('option', { value: v, selected: String(v) === String(wert) }, l)));
  const fListe = [...new Set(alle.map(e => e.fach).filter(Boolean).concat(filter.fach ? [filter.fach] : []))].sort((a, b) => a.localeCompare(b, 'de'));
  const kListe = [...new Set(alle.map(e => e.klasse).filter(Boolean).concat(filter.klasse ? [filter.klasse] : []))].sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));
  const suche = h('input', { class: 'feld', type: 'search', value: filter.suche, placeholder: '🔍 Suchen (Name oder Aufgabentext) …', style: { flex: '1 1 200px' }, onchange: e => { filter.suche = e.target.value.trim(); neuZeichnen(); } });
  const filterZeile = h('div', { class: 'row ma-filter' },
    auswahl(filter.fach, [['', 'alle Fächer'], ...fListe.map(f => [f, f])], v => { filter.fach = v; }, 'Fach'),
    auswahl(filter.klasse, [['', 'alle Klassen'], ...kListe.map(k => [k, 'Klasse ' + k])], v => { filter.klasse = v; }, 'Klasse'),
    auswahl(filter.jg, [[0, 'alle Jahrgänge'], ...[5, 6, 7, 8, 9, 10].map(j => [j, 'Jg. ' + j])], v => { filter.jg = +v; }, 'Jahrgang'),
    sam.length ? auswahl(filter.art, [['', 'Seiten und Sammlungen'], ['seite', '📄 nur Seiten'], ['sammlung', '📝 nur Sammlungen']], v => { filter.art = v; }, 'Art') : '', /* ältere Sammlungen bleiben nutzbar, neue gibt es nur noch als Seiten */
    suche);
  let mischen = !!T.opts.meineMischen;
  const info = e => [e.fach, e.klasse ? 'Kl. ' + e.klasse : '', e.jg ? 'Jg. ' + e.jg : '', e.nv ? '★'.repeat(e.nv) : '',
    e.art === 'seite' ? e.items.length + ' Element' + (e.items.length === 1 ? '' : 'e') : e.aufgaben.length + ' Aufgabe' + (e.aufgaben.length === 1 ? '' : 'n'),
    new Date(e.geaendert || e.datum || Date.now()).toLocaleDateString('de-DE')].filter(Boolean).join(' · ');
  const karte = e => e.art === 'seite'
    ? h('div', { class: 'ma-karte ma-seite' },
      e.bild ? h('img', { src: e.bild, alt: '', class: 'ma-bild', title: 'Antippen: hier auf die Tafel', onclick: () => seiteEinsetzen(e, false) }) : '',
      h('div', { class: 'ma-kopf' }, h('b', {}, '📄 ' + e.name), h('small', {}, info(e))),
      h('div', { class: 'row' },
        h('button', { class: 'big prim', title: 'In die Mitte der aktuellen Seite einfügen', onclick: () => seiteEinsetzen(e, false) }, '⤴ Hierher'),
        h('button', { class: 'big', title: 'Als neue Seite hinter der aktuellen einfügen', onclick: () => seiteEinsetzen(e, true) }, '📄 Neue Seite'),
        h('button', { class: 'big', title: 'Name, Fach, Jahrgang und Klasse ändern', onclick: () => {
          const k = { name: e.name, fach: e.fach, jg: e.jg || 0, klasse: e.klasse || '' };
          const fach = h('select', { class: 'feld', onchange: ev => { k.fach = ev.target.value; } }, ...faecher(k.fach).map(f => h('option', { value: f, selected: f === k.fach }, f)));
          T.openDlg([h('h2', {}, '✏️ ' + e.name), h('label', { class: 'fld' }, 'Name', h('input', { class: 'feld', value: k.name, oninput: ev => { k.name = ev.target.value; } })),
            h('label', { class: 'fld' }, 'Fach', fach), klassenWahl(k),
            h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: async () => { if (!k.name.trim()) return; Object.assign(e, k, { name: k.name.trim() }); await seitenSichern(); T.closeDlg(); neuZeichnen(); } }, '✏️ Übernehmen'))]); } }, '✏️'),
        h('button', { class: 'big warn', title: 'Löschen', onclick: async () => { if (await T.frage(`„${e.name}“ aus „Meine Aufgaben“ löschen?`, { ok: '🗑 Löschen' })) { seiten = seiten.filter(x => x.id !== e.id); await seitenSichern(); neuZeichnen(); } } }, '🗑')))
    : h('div', { class: 'ma-karte' },
      h('div', { class: 'ma-kopf' }, h('b', {}, '📝 ' + e.name), h('small', {}, info(e))),
      h('div', { class: 'row' },
        h('button', { class: 'big prim', title: 'Auf die Tafel', onclick: () => aufTafel(e, mischen) }, '⤴ Auf die Tafel'),
        h('button', { class: 'big', title: 'Bearbeiten', onclick: () => sammlungDialog(lade().find(x => x.id === e.id)) }, '✏️'),
        h('button', { class: 'big warn', title: 'Löschen', onclick: async () => { if (await T.frage(`Sammlung „${e.name}“ löschen?`, { ok: '🗑 Löschen' })) { sichere(lade().filter(x => x.id !== e.id)); neuZeichnen(); } } }, '🗑')));
  return [h('h2', { style: { margin: '2px 0 6px', fontSize: '20px' } }, '⭐ Meine Aufgaben'),
    filterZeile,
    liste.length ? h('div', { class: 'ma-liste' }, ...liste.map(karte))
      : h('p', { class: 'hint' }, alle.length ? 'Nichts gefunden – Filter oben ändern (z. B. „alle Fächer“).' : 'Noch keine eigenen Aufgaben. Aufgaben auf einer Tafelseite tippen oder einfügen, dann oben „💾 Speichern ▾“ › „📄 Diese Seite“ oder „☑ Auswahl“.'),
    liste.some(e => e.art !== 'seite') ? h('label', { class: 'big', style: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '8px' } },
      h('input', { type: 'checkbox', checked: mischen, style: { width: '24px', height: '24px' }, onchange: e => { mischen = e.target.checked; T.opts.meineMischen = mischen; T.saveOpts(); } }), '🔀 Sammlungen gemischt einfügen') : '',
    ...(liste.some(e => e.art !== 'seite') ? (ctx.optionen || []) : []),
    h('p', { class: 'hint' }, 'Neue Einträge: oben „💾 Speichern ▾“ › „📄 Diese Seite“ oder „☑ Auswahl“.')];
};
})();
