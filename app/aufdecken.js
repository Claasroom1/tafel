// Tafel-App – Aufdecken vorbereiten: Teile des Tafelbilds bekommen Schritt-Nummern und erscheinen beim Vorführen
// nacheinander mit einem Effekt (Einblenden, Hochschweben, Wachsen, „Wie geschrieben“). Zuhause vorbereiten, in der Stunde antippen.
'use strict';
(function () {
const h = T.h, S = T.S;
const EFFEKTE = [['', '✨ Automatisch'], ['ein', '🌫 Einblenden'], ['hoch', '⬆ Hochschweben'], ['zoom', '🔍 Wachsen'], ['wisch', '✍ Wie geschrieben']];
const DAUER = 700;
let zeigen = false, anim = null;
const stand = new WeakMap(); // Seite → aufgedeckter Schritt (0 = alles mit Schritt verdeckt)
const schritte = pg => pg.items.reduce((m, i) => Math.max(m, i.auf || 0), 0);
const standVon = pg => stand.get(pg) || 0;
const leicht = t => 1 - Math.pow(1 - t, 3); // sanftes Abbremsen

// ---------- Zeichnen (wird von kern.js / werkzeuge.js aufgerufen) ----------
T.aufZustand = (pg, it) => {
  if (!zeigen || !it.auf) return null;
  if (it.auf > standVon(pg)) return false;
  if (anim && anim.pg === pg && it.auf === anim.schritt) {
    const t = (performance.now() - anim.t0) / DAUER;
    if (t < 1) return { p: leicht(Math.max(0, t)), eff: it.eff || (it.t === 's' ? 'wisch' : 'hoch') };
  }
  return null;
};
T.aufEffekt = (ctx, it, a, px) => {
  const b = T.bbox(it), p = a.p;
  if (a.eff === 'wisch') { ctx.beginPath(); ctx.rect(b.x0 - 12 * px, b.y0 - 12 * px, (b.x1 - b.x0 + 24 * px) * p, b.y1 - b.y0 + 24 * px); ctx.clip(); return; }
  ctx.globalAlpha *= p;
  if (a.eff === 'hoch') ctx.translate(0, (1 - p) * 46 * px);
  else if (a.eff === 'zoom') { const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, s = 0.55 + 0.45 * p; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); }
};
// Beim Vorbereiten: kleine Nummern an jedem Teil, das einen Schritt hat
T.aufMarken = (ctx, px) => {
  if (zeigen || !vorbereiten || !S.board) return;
  const r = 13 * px;
  for (const it of T.page().items) {
    if (!it.auf) continue; const b = T.bbox(it);
    ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.arc(b.x0, b.y0, r, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `700 ${15 * px}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(it.auf), b.x0, b.y0 + px);
  }
};

// ---------- Vorführen ----------
function animiere(pg, schritt) {
  anim = { pg, schritt, t0: performance.now() };
  const lauf = () => { T.render(); if (anim && performance.now() - anim.t0 < DAUER + 40) requestAnimationFrame(lauf); else { anim = null; T.render(); } };
  lauf();
}
// Start eines Schritts: „nach vorheriger“ (it.nach = Sekunden) läuft von selbst an, sonst bei Klick
const nachVon = (pg, s) => { const i = pg.items.find(x => x.auf === s && x.nach != null); return i ? +i.nach : null; };
let autoTimer = 0;
function autoWeiter() { // nächster Schritt startet automatisch, wenn er „nach vorheriger“ eingestellt ist
  clearTimeout(autoTimer); if (!zeigen) return;
  const pg = T.page(), k = standVon(pg), n = nachVon(pg, k + 1);
  if (k < schritte(pg) && n != null) autoTimer = setTimeout(() => { if (zeigen && T.page() === pg && standVon(pg) === k) weiter(); }, (k ? DAUER : 0) + n * 1000);
}
// Weiter wie bei einer Präsentation: erst die Schritte dieser Seite, dann die nächste Seite (dort wieder alles verdeckt)
function weiter() {
  const pg = T.page(), n = schritte(pg), k = standVon(pg), P = S.board.pages;
  if (k < n) { stand.set(pg, k + 1); animiere(pg, k + 1); leiste(); autoWeiter(); return; }
  if (S.page < P.length - 1) { stand.set(P[S.page + 1], 0); T.gotoPage(S.page + 1); leiste(); autoWeiter(); }
  else T.toast('Ende der Präsentation ✓', 1500);
}
function zurueck() {
  clearTimeout(autoTimer);
  const pg = T.page(), k = standVon(pg), P = S.board.pages;
  if (k > 0) { stand.set(pg, k - 1); anim = null; T.render(); leiste(); return; }
  if (S.page > 0) { const vor = P[S.page - 1]; stand.set(vor, schritte(vor)); T.gotoPage(S.page - 1); leiste(); } // vorige Seite fertig aufgedeckt
}
function starten(abSeite) {
  zeigen = true; vorbereiten = false; S.sel = null; T.closePops(); bereich(false);
  for (const pg of S.board.pages) stand.set(pg, 0);
  if (abSeite != null) T.gotoPage(abSeite);
  T.render(); T.renderOver(); leiste(); autoWeiter();
}
function beenden() { clearTimeout(autoTimer); spielStopp(); if (T.schwarzAn && T.schwarzAn()) T.schwarz(false); zeigen = false; anim = null; T.render(); T.renderOver(); leiste(); }
T.aufWeiter = weiter;
let vorbereiten = false; // Nummern und Leiste nur beim Vorbereiten

// ---------- Präsentationssteuerung: schwebend, frei verschiebbar (z. B. ans Pult), Position je Lehrkraft gemerkt ----------
// ◀ zurück · ▶ automatisch weiter (alle n Sekunden) / ⏸ anhalten · ⏭ weiter · ⬛ Tafel schwarz · ✕ beenden
const bar = h('div', { id: 'aufleiste' });
bar.addEventListener('pointerdown', e => e.stopPropagation());
document.body.append(bar);
let abspielen = 0, spielTimer = 0; // Sekunden je Schritt beim automatischen Ablauf (0 = aus)
function spielStopp() { abspielen = 0; clearInterval(spielTimer); }
function spielStart(sek) {
  spielStopp(); abspielen = sek;
  spielTimer = setInterval(() => {
    const pg = T.page(), P = S.board.pages; if (!zeigen) return spielStopp();
    if (S.page === P.length - 1 && standVon(pg) >= schritte(pg)) { spielStopp(); leiste(); T.toast('Ende der Präsentation ✓', 1500); return; }
    weiter();
  }, sek * 1000);
}
const posSetzen = () => { const p = T.opts.praesPos; if (p) { bar.style.left = T.clamp(p.x, 0, innerWidth - 120) + 'px'; bar.style.top = T.clamp(p.y, 56, innerHeight - 70) + 'px'; bar.classList.add('frei'); } else { bar.style.left = ''; bar.style.top = ''; bar.classList.remove('frei'); } };
function leiste() {
  const pg = S.board && T.page(), n = pg ? schritte(pg) : 0;
  bar.innerHTML = ''; bar.classList.toggle('aktiv', zeigen);
  const sichtbar = S.board && zeigen; // beim Vorbereiten übernimmt der Animationsbereich rechts
  bar.style.display = sichtbar ? 'flex' : 'none';
  if (!sichtbar) { spielStopp(); return; }
  const k = standVon(pg), P = S.board.pages, letzte = S.page === P.length - 1 && k >= n;
  const griff = h('div', { class: 'al-griff', title: 'Ziehen: Steuerung verschieben (z. B. ans Pult) – doppelt tippen: zurück nach unten' }, '✥');
  griff.addEventListener('pointerdown', e => { // am ganzen Fenster verfolgen – reißt nicht ab
    e.preventDefault(); const r = bar.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, id = e.pointerId;
    const mv = ev => { if (ev.pointerId !== id) return; bar.classList.add('frei'); bar.style.left = T.clamp(ev.clientX - dx, 0, innerWidth - 120) + 'px'; bar.style.top = T.clamp(ev.clientY - dy, 56, innerHeight - 70) + 'px'; };
    const up = ev => { if (ev.pointerId !== id) return; removeEventListener('pointermove', mv, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true);
      if (bar.classList.contains('frei')) { T.opts.praesPos = { x: parseInt(bar.style.left), y: parseInt(bar.style.top) }; T.saveOpts(); } };
    addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  });
  griff.addEventListener('dblclick', () => { delete T.opts.praesPos; T.saveOpts(); posSetzen(); });
  const sekWahl = h('select', { class: 'al-sek', title: 'Sekunden je Schritt beim automatischen Ablauf', onchange: e => { T.opts.praesSek = +e.target.value; T.saveOpts(); if (abspielen) spielStart(+e.target.value); } },
    ...[3, 5, 10, 20, 30].map(s => h('option', { value: s, selected: (T.opts.praesSek || 5) === s }, s + ' s')));
  bar.append(griff,
    h('button', { class: 'al-rund', title: 'Zurück (← oder Bild auf)', disabled: S.page === 0 && k === 0, onclick: () => { spielStopp(); zurueck(); leiste(); } }, '◀'),
    abspielen ? h('button', { class: 'al-rund an', title: 'Automatischen Ablauf anhalten', onclick: () => { spielStopp(); leiste(); } }, '⏸')
      : h('button', { class: 'al-rund', title: 'Automatisch weiter (alle ' + (T.opts.praesSek || 5) + ' s)', disabled: letzte, onclick: () => { spielStart(T.opts.praesSek || 5); leiste(); } }, '▶'),
    sekWahl,
    h('button', { class: 'al-weiter', title: 'Weiter (→, Leertaste oder Bild ab / Klicker)', disabled: letzte, onclick: weiter }, k < n ? 'Weiter ⏭' : letzte ? 'Ende ✓' : 'Nächste Seite ⏭'),
    n ? h('div', { class: 'al-punkte' }, ...Array.from({ length: n }, (_, i) => h('span', { class: i < k ? 'an' : '' }))) : '',
    h('span', { class: 'al-stand' }, `${S.page + 1}/${P.length}`),
    h('button', { class: 'al-rund' + (T.schwarzAn && T.schwarzAn() ? ' an' : ''), title: 'Tafel schwarz – ausblenden (Taste B); nochmals: wieder zeigen', onclick: () => { T.schwarz && T.schwarz(); leiste(); } }, '⬛'),
    h('button', { class: 'al-rund', title: 'Präsentation beenden – alles sichtbar (Esc)', onclick: beenden }, '✕'));
  posSetzen();
}
T.aufLeiste = leiste;
addEventListener('keydown', e => {
  if (!zeigen || !S.board || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.getElementById('modal').style.display === 'flex') return;
  if (T.schwarzAn && T.schwarzAn() && ['ArrowRight', ' ', 'PageDown', 'Enter', 'ArrowLeft', 'PageUp'].includes(e.key)) { T.schwarz(false); leiste(); } // erst wieder einblenden
  else if (['ArrowRight', ' ', 'PageDown', 'Enter'].includes(e.key)) weiter(); // Präsentations-Klicker senden meist Bild ab/auf
  else if (['ArrowLeft', 'PageUp'].includes(e.key)) zurueck();
  else if (e.key === 'Escape') { if (T.schwarzAn && T.schwarzAn()) { T.schwarz(false); leiste(); } else beenden(); }
  else if (e.key === 'b' || e.key === 'B' || e.key === '.') { T.schwarz && T.schwarz(); leiste(); } // wie in PowerPoint
  else return;
  e.preventDefault(); e.stopImmediatePropagation();
}, true);

// ---------- 🎬 Animationsbereich (rechts, wie in PowerPoint) ----------
// Element auswählen → Effekt antippen → Start einstellen (bei Klick / mit vorheriger / nach vorheriger + Sekunden).
// Darunter die Reihenfolge der Seite: antippen wählt aus, ▲▼ sortiert, 🗑 entfernt die Animation.
const pane = h('div', { id: 'animbereich' }); pane.addEventListener('pointerdown', e => e.stopPropagation()); document.body.append(pane);
let paneAuf = false, paneKey = '';
const NACH = [0, 0.5, 1, 2, 3, 5];
function nummerieren(pg) { // Schritte lückenlos 1 … n
  const alt = [...new Set(pg.items.filter(i => i.auf).map(i => i.auf))].sort((a, b) => a - b), neu = new Map(alt.map((v, j) => [v, j + 1]));
  for (const i of pg.items) if (i.auf) i.auf = neu.get(i.auf);
}
const gewaehlt = () => S.sel ? T.page().items.filter(i => S.sel.ids.has(i.id)) : [];
function aendere(fn) { const pg = T.page(); T.snap(); fn(pg); nummerieren(pg); T.render(); T.renderOver(); paneKey = ''; zeichnePane(); }
function setzeEffekt(v) {
  const gew = gewaehlt(); if (!gew.length) return;
  aendere(pg => { const neu = schritte(pg) + 1; for (const i of gew) { if (!i.auf) i.auf = neu; if (v) i.eff = v; else delete i.eff; } });
}
function setzeStart(art, sek) { // art: klick | mit | nach
  const gew = gewaehlt().filter(i => i.auf); if (!gew.length) return;
  aendere(pg => {
    const s = Math.min(...gew.map(i => i.auf)), ids = new Set(gew.map(i => i.id)), geteilt = pg.items.some(i => i.auf === s && !ids.has(i.id));
    if (art === 'mit') { const ziel = Math.max(1, s - (geteilt ? 0 : 1)), nv = nachVon(pg, ziel); for (const i of gew) { i.auf = ziel; if (nv != null) i.nach = nv; else delete i.nach; } return; }
    const eigen = geteilt ? s + 0.5 : s; // eigener Schritt direkt dahinter, wenn er bisher „mit“ anderen lief
    for (const i of gew) { i.auf = eigen; if (art === 'nach') i.nach = sek; else delete i.nach; }
  });
}
function verschiebe(s, d) {
  aendere(pg => { const t = s + d; if (t < 1 || t > schritte(pg)) return; for (const i of pg.items) { if (i.auf === s) i.auf = t; else if (i.auf === t) i.auf = s; } });
}
const beschreibe = it => it.t === 's' ? '✍ Handschrift' : it.k === 'text' ? '🔤 „' + String(it.d.text).split('\n')[0].slice(0, 22) + '“' : it.k === 'bild' ? '🖼 Bild' : '🧩 ' + ((T.BAUSTEINE[it.k] || {}).name || it.k);
const EFF_NAME = Object.fromEntries(EFFEKTE);
function zeichnePane() {
  if (!paneAuf || !S.board) return;
  const pg = T.page(), gew = gewaehlt(), n = schritte(pg);
  const key = [S.page, n, gew.map(i => i.id + ':' + (i.auf || 0) + (i.eff || '') + (i.nach ?? '')).join(), pg.items.filter(i => i.auf).map(i => i.id + i.auf + (i.eff || '') + (i.nach ?? '')).join()].join('|');
  if (key === paneKey) return; paneKey = key;
  pane.innerHTML = '';
  const kopf = h('div', { class: 'ab-kopf' }, h('b', {}, '✨ Animation'), h('span', { style: { flex: 1 } }), h('button', { class: 'nzu', title: 'Schließen', onclick: () => bereich(false) }, '×'));
  const start = h('div', { class: 'row' }, h('button', { class: 'big prim', onclick: () => starten(0) }, '▶ Von Seite 1'), h('button', { class: 'big', onclick: () => starten() }, `▶ Ab Seite ${S.page + 1}`));
  // Ausgewähltes animieren
  const sek = h('div', { class: 'ab-teil' }, h('h3', {}, 'Ausgewähltes animieren'));
  if (!gew.length) sek.append(h('p', { class: 'hint' }, 'Mit ⬚ Auswahl etwas auf der Tafel antippen oder umrahmen (Text, Handschrift, Bild …) – dann hier einen Effekt wählen.'));
  else {
    const effs = [...new Set(gew.map(i => i.auf ? i.eff || '' : null))], anim = gew.some(i => i.auf);
    sek.append(h('p', { class: 'hint', style: { margin: '0 0 6px' } }, gew.length === 1 ? beschreibe(gew[0]) : gew.length + ' Teile gewählt'),
      h('div', { class: 'ab-effekte' }, ...EFFEKTE.map(([v, l]) => h('button', { class: 'big' + (anim && effs.length === 1 && effs[0] === v ? ' on' : ''), onclick: () => setzeEffekt(v) }, l))));
    if (anim) {
      const s = Math.min(...gew.filter(i => i.auf).map(i => i.auf)), nv = nachVon(pg, s), geteilt = pg.items.some(i => i.auf === s && !gew.includes(i));
      const art = geteilt ? 'mit' : nv != null ? 'nach' : 'klick'; // teilt sich den Schritt mit anderen = „mit vorheriger“
      sek.append(h('h3', {}, 'Start'),
        h('div', { class: 'row' }, ...[['klick', '🖱 Bei Klick'], ['mit', '⇉ Mit vorheriger'], ['nach', '⏱ Nach vorheriger']].map(([v, l]) => h('button', { class: 'big' + (art === v ? ' on' : ''), disabled: v === 'mit' && s === 1 && !geteilt, onclick: () => setzeStart(v, nv != null ? nv : 1) }, l))),
        art === 'nach' ? h('div', { class: 'row', style: { marginTop: '6px' } }, h('span', { class: 'hint' }, 'Verzögerung:'), ...NACH.map(v => h('button', { class: 'big' + (nv === v ? ' on' : ''), onclick: () => setzeStart('nach', v) }, String(v).replace('.', ',') + ' s'))) : '',
        h('div', { class: 'row', style: { marginTop: '8px' } }, h('button', { class: 'big warn', onclick: () => aendere(() => { for (const i of gew) { delete i.auf; delete i.eff; delete i.nach; } }) }, '✕ Animation entfernen')));
    }
  }
  // Reihenfolge
  const liste = h('div', { class: 'ab-liste' });
  for (let s = 1; s <= n; s++) {
    const teile = pg.items.filter(i => i.auf === s); if (!teile.length) continue;
    const nv = nachVon(pg, s), aktiv = gew.length && teile.every(i => gew.includes(i));
    liste.append(h('div', { class: 'ab-eintrag' + (aktiv ? ' on' : ''), onclick: () => T.select(teile.map(i => i.id)) },
      h('span', { class: 'ab-nr' }, String(s)), h('span', { class: 'ab-start', title: nv != null ? 'startet nach der vorherigen' : 'startet bei Klick' }, nv != null ? '⏱ ' + String(nv).replace('.', ',') + ' s' : '🖱'),
      h('span', { class: 'ab-was' }, beschreibe(teile[0]) + (teile.length > 1 ? ' + ' + (teile.length - 1) : ''), h('small', {}, EFF_NAME[teile[0].eff || ''] || '')),
      h('button', { title: 'Früher', disabled: s === 1, onclick: e => { e.stopPropagation(); verschiebe(s, -1); } }, '▲'),
      h('button', { title: 'Später', disabled: s === n, onclick: e => { e.stopPropagation(); verschiebe(s, 1); } }, '▼'),
      h('button', { title: 'Animation entfernen', onclick: e => { e.stopPropagation(); aendere(() => { for (const i of teile) { delete i.auf; delete i.eff; delete i.nach; } }); } }, '🗑')));
  }
  pane.append(kopf, h('div', { class: 'ab-body' }, start, sek, h('div', { class: 'ab-teil' }, h('h3', {}, `Reihenfolge auf Seite ${S.page + 1}`), n ? liste : h('p', { class: 'hint' }, 'Noch keine Animationen auf dieser Seite.'),
    n ? h('button', { class: 'big', style: { marginTop: '8px' }, onclick: () => starten() }, '▶ Diese Seite testen') : ''),
    h('p', { class: 'hint' }, 'Vorführen: Weiter mit → , Leertaste, Enter oder dem Präsentations-Klicker. „Nach vorheriger“ läuft von selbst an. Esc beendet.')));
}
function bereich(an) {
  paneAuf = an == null ? !paneAuf : an; pane.classList.toggle('auf', paneAuf); document.body.classList.toggle('animAuf', paneAuf);
  vorbereiten = paneAuf; if (paneAuf) { zeigen = false; if (S.tool !== 'auswahl') T.ui && T.ui.setTool('auswahl'); paneKey = ''; zeichnePane(); }
  const b = document.getElementById('bAnim'); if (b) b.classList.toggle('on', paneAuf);
  leiste(); T.render(); T.renderOver();
}
const altPlace = T.placeSelBar; // Auswahl geändert → Bereich aktualisieren (baut nur bei Änderung neu)
T.placeSelBar = a => { altPlace && altPlace(a); zeichnePane(); };
// oben: ✨ Animation blendet den Bereich ein/aus, ▶ Präsentieren startet die Bildschirmpräsentation
const ak = document.getElementById('bAnim'); if (ak) ak.addEventListener('click', () => { if (zeigen) beenden(); bereich(); });
const pk = document.getElementById('bPraes');
if (pk) pk.addEventListener('click', () => {
  if (!S.board) return; if (zeigen) { beenden(); return; }
  T.openPop(pk, h('h4', {}, '▶ Bildschirmpräsentation'), h('div', { class: 'row' },
    h('button', { class: 'big prim', onclick: () => starten(0) }, '▶ Von Seite 1'), h('button', { class: 'big', onclick: () => starten() }, `▶ Ab Seite ${S.page + 1}`)),
    h('p', { class: 'hint', style: { maxWidth: '380px' } }, 'Weiter mit → , Leertaste, Enter oder dem Präsentations-Klicker. Esc beendet. Animationen einstellen: ✨ Animation.'));
});
T.praesentation = () => bereich(true);
T.aufPop = () => bereich(true); // ✨ Aufdecken in der Auswahl-Leiste öffnet den Animationsbereich
})();
