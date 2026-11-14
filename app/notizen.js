// Tafel-App – Notizen als Registerkarten am Rand (rechts, bei Bedienseite links links) (mehrere Notizen) + Störungsnotiz je Stunde
'use strict';
(function () {
const S = T.S, F = T.ablage, h = T.h;
const panel = h('div', { id: 'notizen' }), reiter = h('div', { id: 'nreiter' });
document.body.append(panel, reiter);
let offen = false, aktiv = null, schrift = 26;
const FARBEN = ['#fff3a8', '#ffd6a5', '#ffc9de', '#cde7ff', '#c9f2d0', '#e3d5ff'];
const REGELN = 'Unsere Klassenregeln\n1. Wir hören einander zu und lassen andere ausreden.\n2. Wir melden uns, bevor wir sprechen.\n3. Wir gehen freundlich und respektvoll miteinander um.\n4. Wir halten Ordnung an unserem Platz.\n5. Wir sind pünktlich und haben unser Material dabei.';

// ---------- Speicher: dauerhafte Notizen & Störungen liegen im Ordner der Lehrkraft (Unterordner mit „_“) ----------
async function lesen(sub, name, fallbackKey) {
  if (F.root && T.opts.lehrkraft) {
    try { const d = await F.dir([T.opts.lehrkraft, sub], false); return JSON.parse(await (await (await d.getFileHandle(name)).getFile()).text()); } catch (e) { return null; }
  }
  try { return await T.idbGet(fallbackKey); } catch (e) { return null; }
}
async function schreiben(sub, name, fallbackKey, daten) {
  if (F.root && T.opts.lehrkraft) {
    const d = await F.dir([T.opts.lehrkraft, sub], true), fh = await d.getFileHandle(name, { create: true }), w = await fh.createWritable();
    await w.write(JSON.stringify(daten, null, 1)); await w.close(); return;
  }
  await T.idbSet(fallbackKey, daten);
}
const lehrkraft = () => T.opts.lehrkraft || 'Lehrkraft';

// ---------- Notizlisten ----------
let dauer = null, dauerT = 0, laedt = false;   // dauerhafte Notizen der Lehrkraft (alle Tafeln)
const neueNotiz = (titel, scope) => ({ id: T.uid(), titel, farbe: FARBEN[(alle().length) % FARBEN.length], modus: 'text', text: '', ink: [], scope });
async function ladeDauer() {
  if (dauer || laedt) return; laedt = true;
  const d = await lesen('_Notizen', 'notizen.json', 'notizen:' + lehrkraft());
  if (d && Array.isArray(d.notizen)) dauer = d.notizen;
  else if (d && (d.text || (d.ink && d.ink.length))) dauer = [{ id: T.uid(), titel: 'Notizen', farbe: FARBEN[0], modus: d.ink && d.ink.length && !d.text ? 'ink' : 'text', text: d.text || '', ink: d.ink || [], scope: 'dauer' }];
  else dauer = [];
  laedt = false; zeichneReiter(); if (offen) zeichne();
}
function sichereDauer() {
  clearTimeout(dauerT);
  dauerT = setTimeout(() => schreiben('_Notizen', 'notizen.json', 'notizen:' + lehrkraft(), { notizen: dauer, geaendert: new Date().toISOString() }).catch(e => T.toast('Notiz nicht gespeichert: ' + e.message)), 700);
}
function tafelListe() {
  const b = S.board; if (!b) return [];
  if (!Array.isArray(b.notizListe)) { // ältere Tafeln: eine einzelne Notiz übernehmen
    b.notizListe = [];
    if ((typeof b.notizen === 'string' && b.notizen) || (b.notizInk && b.notizInk.length)) b.notizListe.push({ id: T.uid(), titel: 'Tafel-Notiz', farbe: FARBEN[3], modus: b.notizen ? 'text' : 'ink', text: b.notizen || '', ink: b.notizInk || [], scope: 'tafel' });
    delete b.notizen; delete b.notizInk;
  }
  return b.notizListe;
}
const alle = () => (dauer || []).concat(tafelListe());
const finde = id => alle().find(n => n.id === id);
function geaendert(n) { if (n.scope === 'dauer') sichereDauer(); else T.changed(); }

// ---------- Reiter am Rand ----------
function zeichneReiter() {
  reiter.innerHTML = ''; reiter.style.display = S.board ? 'flex' : 'none';
  if (!S.board) return;
  if (!dauer) ladeDauer();
  /* ◀ ▶ Notizfeld auf- und zuschieben (ganz oben in der Reiterleiste) */
  const links = document.body.classList.contains('seite-links'), zuPfeil = links ? '◀' : '▶', aufPfeil = links ? '▶' : '◀';
  reiter.append(h('button', { class: 'nr pfeil', title: offen ? 'Notizen zuschieben' : 'Notizen aufschieben', onclick: () => T.toggleNotizen() }, h('span', {}, offen ? zuPfeil : aufPfeil)));
  for (const n of alle()) reiter.append(h('button', { class: 'nr' + (offen && aktiv === n.id ? ' on' : ''), style: { background: n.farbe }, title: n.titel + (n.scope === 'dauer' ? ' (dauerhaft)' : ' (nur diese Tafel)'), onclick: () => oeffne(n.id) },
    h('span', {}, (n.scope === 'dauer' ? '📌 ' : '') + (n.titel || 'Notiz'))));
  reiter.append(h('button', { class: 'nr stoer' + (offen && aktiv === 'stoer' ? ' on' : ''), title: 'Störungen dieser Stunde', onclick: () => oeffne('stoer') }, h('span', {}, '⚠ Störungen')));
  reiter.append(h('button', { class: 'nr plus', title: 'Neue Notiz', onclick: () => {
    const n = neueNotiz('Notiz ' + (alle().length + 1), 'tafel'); tafelListe().push(n); T.changed(); oeffne(n.id); // Standard: nur diese Tafel
  } }, h('span', {}, '＋')));
}
function oeffne(id) {
  if (offen && aktiv === id) { schliesse(); return; }
  aktiv = id; offen = true; freiSetzen(); breiteSetzen(T.opts.notizBreite); panel.classList.add('auf'); document.body.classList.add('notizAuf'); zeichne();
}
function schliesse() { offen = false; panel.classList.remove('auf'); document.body.classList.remove('notizAuf', 'notizBreit'); zeichneReiter(); }
T.toggleNotizen = () => { if (offen) schliesse(); else oeffne(aktiv && (aktiv === 'stoer' || finde(aktiv)) ? aktiv : (alle()[0] ? alle()[0].id : 'stoer')); };

// Schreibfläche für Handschrift (Stift schreibt, Radierer entfernt ganze Striche)
function inkArea(ink) {
  const BASIS = 440, cv = h('canvas', { class: 'nink' }), wrap = h('div', { class: 'ninkwrap' }, cv);
  let farbe = '#1a1a1a', staerke = 3, radier = false, live = null;
  const k = () => cv.clientWidth / BASIS;
  const male = () => {
    const d = devicePixelRatio || 1, w = cv.clientWidth, hh = cv.clientHeight; if (!w) return;
    if (cv.width !== Math.round(w * d) || cv.height !== Math.round(hh * d)) { cv.width = Math.round(w * d); cv.height = Math.round(hh * d); }
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.fillStyle = '#fffdf3'; c.fillRect(0, 0, w, hh);
    c.strokeStyle = '#d7e3ef'; c.lineWidth = 1; c.beginPath(); for (let y = 44 * k(); y < hh; y += 44 * k()) { c.moveTo(0, y); c.lineTo(w, y); } c.stroke();
    c.setTransform(d * k(), 0, 0, d * k(), 0, 0);
    for (const s of ink.get().concat(live ? [live] : [])) T.drawStroke(c, s, false, s === live ? T.buildPath(s) : undefined);
  };
  const druck = ev => ev.pointerType === 'pen' && ev.pressure && ev.pressure !== 0.5 ? T.r2(ev.pressure) : 0.5;
  const pos = e => { const r = cv.getBoundingClientRect(); return [T.r1((e.clientX - r.left) / k()), T.r1((e.clientY - r.top) / k())]; };
  const radiere = p => { const alt = ink.get(), neu = alt.filter(s => !T.hitStroke(s, p[0], p[1], 10)); if (neu.length !== alt.length) { ink.set(neu); male(); } };
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} const p = pos(e);
    if (radier || (e.buttons & 32)) { live = { radier: true }; radiere(p); return; }
    live = { t: 's', m: 'pen', c: farbe, w: staerke, p: [[p[0], p[1], druck(e)]] }; male();
  });
  cv.addEventListener('pointermove', e => {
    if (!live) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of (evs.length ? evs : [e])) {
      const p = pos(ev); if (live.radier) { radiere(p); continue; }
      const l = live.p[live.p.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) < 0.8) continue;
      live.p.push([T.r1(l[0] + (p[0] - l[0]) * 0.6), T.r1(l[1] + (p[1] - l[1]) * 0.6), druck(ev)]);
    }
    if (!live.radier) male();
  });
  const ende = () => { if (live && !live.radier && live.p.length) ink.set(ink.get().concat([live])); live = null; male(); };
  cv.addEventListener('pointerup', ende); cv.addEventListener('pointercancel', ende);
  const leiste = h('div', { class: 'row' });
  const knopf = (txt, fn, an) => { const b = h('button', { class: 'big' + (an ? ' on' : ''), onclick: () => { fn(); if (b.dataset.wahl) { [...leiste.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); } } }, txt); return b; };
  for (const [c, n] of [['#1a1a1a', 'schwarz'], ['#d32f2f', 'rot'], ['#1565c0', 'blau'], ['#2e7d32', 'grün']]) {
    const b = knopf('', () => { farbe = c; radier = false; }, c === farbe); b.dataset.wahl = 1; b.title = n;
    b.append(h('span', { style: { display: 'inline-block', width: '22px', height: '22px', borderRadius: '50%', background: c, verticalAlign: 'middle' } })); leiste.append(b);
  }
  const rb = knopf('🧽', () => { radier = true; }); rb.dataset.wahl = 1; rb.title = 'Schwamm (ganze Striche)'; leiste.append(rb);
  leiste.append(knopf('↶', () => { const a = ink.get(); if (a.length) { ink.set(a.slice(0, -1)); male(); } }), knopf('🗑', async () => { if (ink.get().length && await T.frage('Handschrift löschen?', { ok: '🗑 Löschen' })) { ink.set([]); male(); } }));
  new ResizeObserver(() => requestAnimationFrame(male)).observe(cv);
  return { el: wrap, leiste };
}

// ---------- Inhalt des Feldes ----------
function zeichne() {
  zeichneReiter(); panel.innerHTML = '';
  if (aktiv === 'stoer') { panel.append(kopfzeile('⚠ Störungen dieser Stunde', 'var(--surface2)'), stoerTab(), rand); return; }
  const n = finde(aktiv);
  document.body.classList.toggle('notizBreit', !!(n && n.modus === 'hilfe')); // Hilfen (Bilder) brauchen ein breiteres Feld; Werkzeuge werden verkleinert
  if (!n) { panel.append(kopfzeile('Notizen', 'var(--surface2)'), h('div', { class: 'nbody' }, h('p', { class: 'hint' }, laedt ? 'Wird geladen …' : 'Mit ＋ am Rand eine Notiz anlegen.')), rand); return; }
  panel.append(notizKopf(n), notizBody(n), rand);
}
// ↔ Breite des Notizfelds an der Innenkante ziehen (wird gemerkt)
const breiteSetzen = w => { if (w) document.body.style.setProperty('--nW', w + 'px'); else document.body.style.removeProperty('--nW'); };
const rand = h('div', { class: 'nrand', title: 'Ziehen: Notizfeld breiter oder schmaler' }, h('span', {}, '⋮'));
{ let zieht = false;
  rand.addEventListener('pointerdown', e => { if (panel.classList.contains('frei')) return; e.preventDefault(); zieht = true; try { rand.setPointerCapture(e.pointerId); } catch (x) {} });
  rand.addEventListener('pointermove', e => { if (!zieht) return; const links = document.body.classList.contains('seite-links');
    const w = Math.round(T.clamp(links ? e.clientX - panel.getBoundingClientRect().left : innerWidth - e.clientX, 260, innerWidth * 0.85)); breiteSetzen(w); T.opts.notizBreite = w; });
  const los = () => { if (zieht) { zieht = false; T.saveOpts(); } }; rand.addEventListener('pointerup', los); rand.addEventListener('pointercancel', los);
  rand.addEventListener('dblclick', () => { delete T.opts.notizBreite; breiteSetzen(0); T.saveOpts(); }); /* Doppeltipp: Standardbreite */ }
breiteSetzen(T.opts.notizBreite);
// ⧉ Schwebend: Notizfeld als frei verschiebbares Fenster (Kopf ziehen, Ecke unten rechts = Größe) – wird gemerkt
function freiSetzen() {
  const an = !!T.opts.notizFrei, p = T.opts.notizPos || {};
  panel.classList.toggle('frei', an); document.body.classList.toggle('notizFrei', an);
  if (an) Object.assign(panel.style, { left: T.clamp(p.x != null ? p.x : innerWidth - 470, 0, innerWidth - 120) + 'px', top: T.clamp(p.y != null ? p.y : 90, 56, innerHeight - 80) + 'px', width: (p.w || 440) + 'px', height: (p.h || Math.round(innerHeight * 0.62)) + 'px' });
  else ['left', 'top', 'width', 'height'].forEach(k => { panel.style[k] = ''; });
}
const freiKnopf = () => h('button', { class: 'nzu', title: T.opts.notizFrei ? 'Wieder fest an den Rand' : 'Als schwebendes Fenster – frei verschiebbar', onclick: () => { T.opts.notizFrei = !T.opts.notizFrei; T.saveOpts(); freiSetzen(); zeichne(); } }, T.opts.notizFrei ? '⇥' : '⧉');
{ let zug = null; const merkePos = () => { const r = panel.getBoundingClientRect(); T.opts.notizPos = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; T.saveOpts(); };
  panel.addEventListener('pointerdown', e => { if (!panel.classList.contains('frei') || !e.target.closest('.nkopf') || e.target.closest('input,button,textarea,select')) return; zug = [e.clientX - panel.offsetLeft, e.clientY - panel.offsetTop]; panel.setPointerCapture(e.pointerId); });
  panel.addEventListener('pointermove', e => { if (zug) { panel.style.left = T.clamp(e.clientX - zug[0], 0, innerWidth - 120) + 'px'; panel.style.top = T.clamp(e.clientY - zug[1], 56, innerHeight - 80) + 'px'; } });
  panel.addEventListener('pointerup', () => { if (zug) { zug = null; merkePos(); } else if (panel.classList.contains('frei')) merkePos(); }); }
freiSetzen();
const kopfzeile = (titel, farbe) => h('div', { class: 'nkopf', style: { background: farbe } }, h('b', { style: { flex: 1, fontSize: '18px', alignSelf: 'center' } }, titel), freiKnopf(), h('button', { class: 'nzu', title: 'Schließen', onclick: schliesse }, '×'));
function notizKopf(n) {
  const titel = h('input', { type: 'text', value: n.titel, class: 'ntitel', oninput: e => { n.titel = e.target.value; geaendert(n); zeichneReiter(); } });
  const farben = h('div', { class: 'row', style: { gap: '6px' } }, ...FARBEN.map(c => h('button', { class: 'nfarbe' + (n.farbe === c ? ' on' : ''), style: { background: c }, onclick: () => { n.farbe = c; geaendert(n); zeichne(); } })));
  const scope = h('div', { class: 'row' },
    h('button', { class: 'big' + (n.scope === 'dauer' ? ' on' : ''), title: 'Erscheint bei jeder Tafel', onclick: () => verschiebe(n, 'dauer') }, '📌 Dauerhaft'),
    h('button', { class: 'big' + (n.scope === 'tafel' ? ' on' : ''), title: 'Gehört nur zu dieser Tafel', onclick: () => verschiebe(n, 'tafel') }, 'Nur diese Tafel'),
    h('span', { style: { flex: 1 } }),
    h('button', { class: 'big warn', title: 'Notiz löschen', onclick: () => loesche(n) }, '🗑'));
  return h('div', { class: 'nkopf col', style: { background: n.farbe } }, h('div', { class: 'row' }, titel, freiKnopf(), h('button', { class: 'nzu', title: 'Schließen', onclick: schliesse }, '×')), farben, scope);
}
function verschiebe(n, ziel) {
  if (n.scope === ziel) return;
  if (n.scope === 'dauer') { dauer.splice(dauer.indexOf(n), 1); tafelListe().push(n); n.scope = 'tafel'; }
  else { const l = tafelListe(); l.splice(l.indexOf(n), 1); dauer.push(n); n.scope = 'dauer'; }
  sichereDauer(); T.changed(); zeichne();
}
async function loesche(n) {
  if ((n.text || (n.ink && n.ink.length)) && !await T.frage(`Notiz „${n.titel}“ löschen?`, { ok: '🗑 Löschen' })) return;
  const l = n.scope === 'dauer' ? dauer : tafelListe(); l.splice(l.indexOf(n), 1); geaendert(n);
  for (const e of wzListe(n)) if (WZ.has(e.id)) { const w = WZ.get(e.id); WZ.delete(e.id); w.onclose && w.onclose(); } // Werkzeuge wirklich beenden (Timer usw.)
  const rest = alle(); aktiv = rest.length ? rest[0].id : null; if (!rest.length) schliesse(); else zeichne();
}
// ---------- 📥 Ablage: markierte Tafel-Objekte schnell in die Notizen legen (und später zurückholen) ----------
// Jeder Eintrag merkt sich die Objekte (Bilder, Bausteine, Texte, Handschrift) samt kleinem Vorschaubild.
function vorschau(items) {
  const bb = items.map(T.bbox), x0 = Math.min(...bb.map(b => b.x0)), y0 = Math.min(...bb.map(b => b.y0)), x1 = Math.max(...bb.map(b => b.x1)), y1 = Math.max(...bb.map(b => b.y1));
  const w = Math.max(1, x1 - x0), hh = Math.max(1, y1 - y0), k = Math.min(1, 320 / w, 220 / hh), pad = 8;
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * k + 2 * pad); cv.height = Math.ceil(hh * k + 2 * pad);
  const c = cv.getContext('2d'); c.fillStyle = '#ffffff'; c.fillRect(0, 0, cv.width, cv.height);
  c.translate(pad, pad); c.scale(k, k); c.translate(-x0, -y0);
  for (const it of items) { try { if (it.t === 'o') T.drawObj(c, it, false, 1 / k); else T.drawStroke(c, it, false); } catch (e) {} }
  return { src: cv.toDataURL('image/png'), box: { x0, y0, w, h: hh } };
}
function ablageNotiz() {
  let n = tafelListe().find(x => x.modus === 'ablage') || (dauer || []).find(x => x.modus === 'ablage');
  if (!n) { n = { ...neueNotiz('📥 Ablage', 'tafel'), modus: 'ablage', eintraege: [] }; tafelListe().push(n); }
  if (!Array.isArray(n.eintraege)) n.eintraege = [];
  return n;
}
T.inNotizen = () => {
  if (!S.board || !S.sel) return;
  const pg = T.page(), items = pg.items.filter(i => S.sel.ids.has(i.id)); if (!items.length) return;
  const n = ablageNotiz(), v = vorschau(items);
  n.eintraege.push({ id: T.uid(), items: JSON.parse(JSON.stringify(items)), bild: v.src, box: v.box });
  T.snap(); pg.items = pg.items.filter(i => !S.sel.ids.has(i.id)); S.sel = null;
  T.render(); T.renderOver(); T.placeSelBar && T.placeSelBar(); geaendert(n); zeichneReiter(); if (offen && aktiv === n.id) zeichne();
  T.toast(`In die Notiz „${n.titel}“ gelegt – Reiter am Rand antippen, dort „⤴ Auf die Tafel“.`, 3000);
};
// Eintrag zurück auf die Tafel: in die Mitte des sichtbaren Bereichs, mit neuen Kennungen (Kopie bleibt auf Wunsch in der Ablage)
function zurueckAufTafel(n, e, behalten) {
  if (!S.board) return;
  const [cx, cy] = T.viewCenter(), dx = cx - (e.box.x0 + e.box.w / 2), dy = cy - (e.box.y0 + e.box.h / 2);
  const ids = new Map(e.items.map(it => [it.id, T.uid()]));
  const neu = e.items.map(it => {
    const k = { ...JSON.parse(JSON.stringify(it)), id: ids.get(it.id) };
    if (k.t === 's') k.p = k.p.map(q => [T.r1(q[0] + dx), T.r1(q[1] + dy), q[2]]); else { k.x += dx; k.y += dy; }
    if (k.an) delete k.an; return k; // Verbindungspfeile zu anderen Elementen gelten nicht mehr
  });
  T.snap(); neu.forEach(it => T.page().items.push(it)); T.S.sel = { ids: new Set(neu.map(i => i.id)) };
  if (!behalten) { n.eintraege = n.eintraege.filter(x => x !== e); geaendert(n); }
  T.render(); T.renderOver(); T.placeSelBar && T.placeSelBar(); zeichne();
}
function ablageBody(n, box) {
  const liste = n.eintraege || [];
  if (!liste.length) box.append(h('p', { class: 'hint' }, 'Noch leer. Auf der Tafel etwas markieren (antippen oder mit „Auswahl“ einen Rahmen ziehen) und im Menü „📥 In Notizen“ wählen.'));
  else box.append(h('div', { class: 'nablage' }, ...liste.map(e => h('div', { class: 'nab' },
    h('img', { src: e.bild, alt: 'geparktes Element', title: 'Antippen: zurück auf die Tafel', onclick: () => zurueckAufTafel(n, e, false) }),
    h('div', { class: 'row' },
      h('button', { class: 'big prim', title: 'Zurück auf die Tafel (aus der Ablage nehmen)', onclick: () => zurueckAufTafel(n, e, false) }, '⤴ Tafel'),
      h('button', { class: 'big', title: 'Duplizieren: auf die Tafel – bleibt zusätzlich in der Ablage', onclick: () => zurueckAufTafel(n, e, true) }, '⧉'),
      h('button', { class: 'big warn', title: 'Aus der Ablage löschen', onclick: async () => { if (await T.frage('Dieses Element aus der Ablage löschen?', { ok: '🗑 Löschen' })) { n.eintraege = n.eintraege.filter(x => x !== e); geaendert(n); zeichne(); } } }, '🗑'))))));
  box.append(h('p', { class: 'hint' }, n.scope === 'dauer' ? '📌 Dauerhaft: Die Ablage ist bei jeder Tafel da – so lassen sich Elemente auch in andere Tafeln mitnehmen.' : 'Gehört zu dieser Tafel. „📌 Dauerhaft“ macht die Ablage bei jeder Tafel verfügbar (zum Mitnehmen in andere Tafeln).'));
  return box;
}

// Hilfe-Notiz (Bild, z. B. Rechenweg oder Teiler-Finder): Reiter am Rand antippen = ein-/ausblenden
T.notizHilfe = (titel, src, w, hh, schritte) => {
  if (!S.board) return;
  const n = { ...neueNotiz('📘 ' + titel, 'tafel'), modus: 'hilfe', bild: { src, w, h: hh } };
  if (schritte && schritte.length > 1) { n.bild.schritte = schritte; n.bild.k = 0; } // Schrittfolge: in der Notiz durchblättern
  tafelListe().push(n); T.changed(); aktiv = null; oeffne(n.id);
  T.toast('In den Notizen – den Reiter am Rand antippen zum Ein- und Ausblenden.', 3500);
};
// ---------- Classroom-Werkzeug in der Notiz (Timer, Ampel, Würfel …): läuft weiter, solange die App offen ist ----------
// 📝 im Fenster: in die gerade offene Notiz – sonst in den gemeinsamen Reiter „🎒 Classroom“ (alle Werkzeuge untereinander)
const WZ = new Map(); // Werkzeug-Eintrag-id → Fenster (Kopfknöpfe und Inhalt werden in die Notiz verschoben)
const wzListe = n => { if (!Array.isArray(n.werkzeuge)) { n.werkzeuge = n.wz ? [{ id: T.uid(), wz: n.wz, titel: n.titel }] : []; delete n.wz; } return n.werkzeuge; };
T.widgetInNotizen = w => {
  if (!S.board) return;
  let n = offen && aktiv && aktiv !== 'stoer' ? finde(aktiv) : null;
  if (!n) { n = tafelListe().find(x => x.modus === 'werkzeug'); if (!n) { n = { ...neueNotiz('🎒 Classroom', 'tafel'), modus: 'werkzeug' }; tafelListe().push(n); } }
  const e = { id: T.uid(), wz: w._wz, titel: w._titel || 'Werkzeug' }; wzListe(n).push(e); WZ.set(e.id, w); w.remove(); geaendert(n);
  aktiv = n.id; if (!offen) { offen = true; freiSetzen(); panel.classList.add('auf'); document.body.classList.add('notizAuf'); } zeichne();
  T.toast(`In der Notiz „${n.titel}“ – läuft dort weiter. Reiter am Rand antippen zum Ein- und Ausblenden.`, 3000);
};
function wzRaus(n, e, alsFenster) { // ⤴ wieder als Fenster auf die Tafel – oder ✕ beenden
  const w = WZ.get(e.id); WZ.delete(e.id);
  if (w && alsFenster) { w._head.insertBefore(w._knoepfe, w._zu); w.append(w._wb); document.body.append(w); w.style.zIndex = 9000; }
  else if (w) w.onclose && w.onclose();
  n.werkzeuge = wzListe(n).filter(x => x !== e);
  if (n.modus === 'werkzeug' && !n.werkzeuge.length) { const l = n.scope === 'dauer' ? dauer : tafelListe(); l.splice(l.indexOf(n), 1); geaendert(n); const rest = alle(); aktiv = rest.length ? rest[0].id : null; schliesse(); return; }
  geaendert(n); zeichne();
}
function wzKarten(n) {
  return wzListe(n).map(e => {
    const w = WZ.get(e.id), f = !w && T.crOeffner && T.crOeffner(e.wz);
    const gr = d => { T.opts.wzNotizZoom = Math.round(T.clamp((T.opts.wzNotizZoom || 0.6) + d, 0.35, 1.2) * 100) / 100; T.saveOpts(); zeichne(); }; /* Werkzeug in der Notiz kleiner/größer */
    const kopf = h('div', { class: 'nwz-kopf' }, h('b', {}, e.titel),
      w ? h('button', { title: 'Kleiner', onclick: () => gr(-0.1) }, '−') : '', w ? h('button', { title: 'Größer', onclick: () => gr(0.1) }, '＋') : '',
      w ? h('button', { title: 'Wieder als verschiebbares Fenster auf die Tafel', onclick: () => wzRaus(n, e, true) }, '⤴') : '',
      h('button', { title: 'Werkzeug beenden und aus der Notiz nehmen', onclick: () => wzRaus(n, e, false) }, '✕'));
    if (w) return h('div', { class: 'nwz' }, kopf, h('div', { class: 'nwz-inhalt', style: { zoom: T.opts.wzNotizZoom || 0.6 } }, w._knoepfe, w._wb));
    return h('div', { class: 'nwz' }, kopf, h('div', { class: 'wb' }, h('p', { class: 'hint' }, 'Gerade geschlossen (z. B. nach dem Neuladen).'),
      f ? h('button', { class: 'big prim', onclick: () => {
        const vor = new Set(document.querySelectorAll('.widget')); T._wz = e.wz; try { f(); } finally { T._wz = null; }
        const neu = [...document.querySelectorAll('.widget')].find(x => !vor.has(x)); if (neu) { WZ.set(e.id, neu); neu.remove(); zeichne(); }
      } }, '▶ Wieder öffnen') : ''));
  });
}
function notizBody(n) {
  const box = notizInhalt(n), karten = wzKarten(n);
  if (karten.length) { const kopf = box.querySelector(':scope > .row'); if (n.modus === 'werkzeug' || !kopf) box.prepend(...karten); else kopf.after(...karten); }
  else if (n.modus === 'werkzeug') box.append(h('p', { class: 'hint' }, 'Noch kein Werkzeug. Im Classroom-Fenster 📝 antippen.'));
  return box;
}
function notizInhalt(n) {
  const box = h('div', { class: 'nbody' });
  if (n.modus === 'werkzeug') return box;
  if (n.modus === 'ablage') return ablageBody(n, box);
  if (n.modus === 'hilfe' && n.bild) {
    const sch = n.bild.schritte, aktSrc = () => sch ? sch[n.bild.k || 0] : n.bild.src;
    const img = h('img', { class: 'nhilfe', src: aktSrc(), alt: n.titel });
    if (sch) {
      const last = sch.length - 1, stand = h('b', { class: 'rw-stand' });
      const geh = i => { n.bild.k = T.clamp(i, 0, last); img.src = aktSrc(); stand.textContent = n.bild.k === 0 ? 'Aufgabe' : n.bild.k === last ? 'fertig ✓' : `Schritt ${n.bild.k} von ${last - 1}`; };
      box.append(h('div', { class: 'row nschritte' }, h('button', { class: 'big', onclick: () => geh(n.bild.k - 1) }, '◀'), stand, h('button', { class: 'big prim', onclick: () => geh(n.bild.k + 1) }, '▶'), h('button', { class: 'big', onclick: () => geh(last) }, 'Alles')));
      geh(n.bild.k || 0);
    }
    // Aktionen über dem Bild – ohne Scrollen erreichbar
    box.prepend(h('div', { class: 'row' }, h('button', { class: 'big', title: 'Groß auf die Tafel legen', onclick: () => T.addBild(aktSrc(), n.bild.w, n.bild.h, null, 0.92, 1.6) }, '⤴ Auf die Tafel'),
      h('button', { class: 'big', onclick: schliesse }, '🙈 Ausblenden')));
    box.append(img,
      h('p', { class: 'hint' }, 'Ein- und ausblenden: den Reiter am Rand antippen. ' + (n.scope === 'dauer' ? '📌 Erscheint bei jeder Tafel.' : 'Gehört zu dieser Tafel – „📌 Dauerhaft“ zeigt die Hilfe bei jeder Tafel.')));
    return box;
  }
  box.append(h('div', { class: 'row' },
    h('button', { class: 'big' + (n.modus === 'ink' ? ' on' : ''), onclick: () => { n.modus = 'ink'; geaendert(n); zeichne(); } }, '✍ Mit Stift'),
    h('button', { class: 'big' + (n.modus !== 'ink' ? ' on' : ''), onclick: () => { n.modus = 'text'; geaendert(n); zeichne(); } }, '⌨ Tippen')));
  if (n.modus === 'ink') {
    const f = inkArea({ get: () => n.ink || [], set: v => { n.ink = v; geaendert(n); } });
    box.append(f.el, f.leiste);
  } else {
    const ta = h('textarea', { class: 'ntext', style: { fontSize: schrift + 'px' }, placeholder: 'z. B. Klassenregeln, Dienste, Merksätze …' }); ta.value = n.text || '';
    ta.addEventListener('input', () => { n.text = ta.value; geaendert(n); });
    const groesse = d => { schrift = T.clamp(schrift + d, 16, 60); ta.style.fontSize = schrift + 'px'; };
    box.append(ta, h('div', { class: 'row' },
      h('button', { class: 'big', onclick: () => groesse(-4) }, 'A−'), h('button', { class: 'big', onclick: () => groesse(4) }, 'A+'),
      h('button', { class: 'big', onclick: () => { ta.value = (ta.value ? ta.value + '\n\n' : '') + REGELN; ta.dispatchEvent(new Event('input')); } }, '📋 Regel-Vorlage'),
      h('button', { class: 'big', title: 'Notiz als Text auf die Tafel setzen', onclick: () => { if (!ta.value.trim() || !S.board) return; const d = { text: ta.value.trim(), size: 32, c: T.isDark(T.page()) ? '#ffffff' : '#1a1a1a', fett: false }, m = T.textMetrics(d), [cx, cy] = T.viewCenter(); T.snap(); T.addItem({ t: 'o', k: 'text', d, x: cx - m.w / 2, y: cy - m.h / 2, w: m.w, h: m.h, r: 0 }); T.toast('Notiz steht jetzt auf der Tafel.'); } }, '⤴ Auf die Tafel')));
  }
  box.append(h('p', { class: 'hint' }, n.scope === 'dauer' ? (F.root ? '📌 Erscheint bei jeder Tafel – gespeichert unter „' + lehrkraft() + ' › _Notizen“.' : '📌 Erscheint bei jeder Tafel – ohne Ablageordner nur auf diesem PC gespeichert.') : 'Gehört nur zu dieser Tafel und wird mit ihr gespeichert.'));
  return box;
}

// ---------- Störungen: einfache Notiz für diese Stunde (keine Statistik) ----------
// Liegt getrennt von der Tafel (Lehrkraft › _Stoerungen), damit sie nie in weitergegebenen Tafeln steckt.
let stoer = null, stoerFuer = null, stoerT = 0, verdeckt = false;
const stoerName = b => F.safe(b.stoerDatei || (b.stoerDatei = `${b.datum} ${b.fach} - ${b.titel}`)) + '.json';
async function ladeStoer() {
  const b = S.board; if (!b || stoerFuer === b.id) return;
  stoerFuer = b.id; stoer = null;
  stoer = (await lesen('_Stoerungen', stoerName(b), 'stoer:' + b.id)) || { text: '', ink: [] };
  if (offen && aktiv === 'stoer') zeichne();
}
function sichereStoer() {
  const b = S.board; if (!b || !stoer) return;
  clearTimeout(stoerT); stoerT = setTimeout(() => schreiben('_Stoerungen', stoerName(b), 'stoer:' + b.id, { ...stoer, datum: b.datum, fach: b.fach, tafel: b.titel, geaendert: new Date().toISOString() }).catch(e => T.toast('Nicht gespeichert: ' + e.message, 5000)), 800);
}
function stoerTab() {
  const box = h('div', { class: 'nbody' });
  if (!S.board) { box.append(h('p', { class: 'hint' }, 'Erst eine Tafel öffnen.')); return box; }
  if (stoerFuer !== S.board.id || !stoer) { ladeStoer(); box.append(h('p', { class: 'hint' }, 'Wird geladen …')); return box; }
  const modus = T.opts.stoerModus === 'text' ? 'text' : 'ink';
  box.append(h('div', { class: 'row' },
    h('button', { class: 'big' + (modus === 'ink' ? ' on' : ''), onclick: () => { T.opts.stoerModus = 'ink'; T.saveOpts(); zeichne(); } }, '✍ Mit Stift'),
    h('button', { class: 'big' + (modus === 'text' ? ' on' : ''), onclick: () => { T.opts.stoerModus = 'text'; T.saveOpts(); zeichne(); } }, '⌨ Tippen'),
    h('span', { style: { flex: 1 } }),
    h('button', { class: 'big', title: 'Sichtschutz: Notiz vor der Klasse verdecken', onclick: () => { verdeckt = !verdeckt; zeichne(); } }, verdeckt ? '👁 zeigen' : '🙈 verdecken')));
  let feld;
  if (modus === 'ink') { const f = inkArea({ get: () => stoer.ink || [], set: v => { stoer.ink = v; sichereStoer(); } }); feld = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 } }, f.el, f.leiste); }
  else { feld = h('textarea', { class: 'ntext', style: { fontSize: schrift + 'px' }, placeholder: 'Störungen in dieser Stunde, z. B. „10:15 Max – Handy“' }); feld.value = stoer.text || ''; feld.addEventListener('input', () => { stoer.text = feld.value; sichereStoer(); }); }
  const huelle = h('div', { class: 'nstoer' + (verdeckt ? ' verdeckt' : ''), style: { display: 'flex', flexDirection: 'column', flex: 1 } }, feld);
  if (verdeckt) huelle.append(h('button', { class: 'nvorhang', onclick: () => { verdeckt = false; zeichne(); } }, '🙈 verdeckt – antippen zum Zeigen'));
  box.append(huelle, h('p', { class: 'hint' }, 'Nur für diese Stunde (diese Tafel). ' + (F.root ? 'Gespeichert unter „' + lehrkraft() + ' › _Stoerungen“, getrennt von der Tafel – sie steckt also nicht in Tafeln, die Sie weitergeben.' : 'Ohne Ablageordner nur auf diesem PC gespeichert.')));
  return box;
}

T.onBoardLoaded = () => { if (aktiv && aktiv !== 'stoer' && !finde(aktiv)) aktiv = null; if (offen) { if (!aktiv) schliesse(); else zeichne(); } else zeichneReiter(); };
T.onLehrkraft = () => { dauer = null; stoerFuer = null; stoer = null; aktiv = null; if (offen) schliesse(); else zeichneReiter(); };
zeichneReiter();
})();
