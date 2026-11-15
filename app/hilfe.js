// Tafel-App – ❓ Hilfe & Lernvideos
// Links die Kapitel, rechts je Kapitel eine kurze Anleitung und „▶ Lernvideo abspielen“.
// Das Lernvideo ist keine Videodatei, sondern eine Vorführung in der echten App: ein großer Zeiger gleitet zum Knopf,
// ein Ring zeigt ihn, unten (bzw. oben) steht ein Untertitel – dann wird der Knopf wirklich angetippt bzw. auf der Tafel geschrieben.
// Geschrieben wird nur auf einer eigenen Vorführseite; am Ende ist die Tafel wieder genau wie vorher (Seiten, Verlauf, Werkzeug, Farbe).
'use strict';
(function () {
const S = T.S, h = T.h, $ = id => document.getElementById(id);

/* ---------- Aussehen ---------- */
const css = document.createElement('style');
css.textContent = `
#dlg.lv-dlg { width: min(1180px, 96vw); max-width: 96vw; height: min(840px, 90vh); max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
#dlg.lv-dlg .dlg-kopf h2 { font-size: 26px; }
.lv-wrap { display: flex; gap: 18px; flex: 1; min-height: 0; }
.lv-kap { display: flex; flex-direction: column; gap: 6px; width: 290px; flex: none; overflow-y: auto; padding: 2px 6px 2px 2px; }
.lv-kap button { display: flex; align-items: center; gap: 10px; text-align: left; font-size: 18px; min-height: 56px; padding: 8px 14px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); color: var(--text); cursor: pointer; touch-action: manipulation; }
.lv-kap button.on { border-color: #7c4dff; box-shadow: 0 0 0 3px rgba(124,77,255,.28); font-weight: 700; }
.lv-kap .lv-ico { font-size: 24px; width: 32px; text-align: center; flex: none; }
.lv-kap .lv-name { flex: 1; }
.lv-kap .lv-vid { font-size: 13px; color: var(--muted); flex: none; }
.lv-inhalt { flex: 1; min-width: 0; overflow-y: auto; font-size: 19px; line-height: 1.5; color: var(--text); padding: 0 8px 12px 4px; }
.lv-inhalt h3 { font-size: 28px; margin: 4px 0 10px; }
.lv-inhalt h4 { font-size: 20px; margin: 16px 0 6px; }
.lv-inhalt p { margin: 6px 0 10px; }
.lv-inhalt ol { padding-left: 30px; margin: 4px 0; }
.lv-inhalt li { margin: 7px 0; }
.lv-start { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 4px 0 14px; padding: 14px; border: 1px solid var(--line); border-radius: 16px; }
.lv-start .lv-play { font-size: 22px; min-height: 62px; padding: 0 28px; }
.lv-start .lv-tempo { display: flex; gap: 6px; align-items: center; color: var(--muted); font-size: 16px; }
.lv-start .lv-tempo button { min-height: 48px; font-size: 17px; }
.lv-start .lv-klein { flex-basis: 100%; font-size: 15px; color: var(--muted); }
.lv-hinweis { background: rgba(255,193,7,.14); border: 1px solid rgba(255,193,7,.6); border-radius: 12px; padding: 10px 14px; }
@media (max-width: 820px) { .lv-wrap { flex-direction: column; } .lv-kap { width: auto; flex-direction: row; flex-wrap: wrap; max-height: 32vh; } .lv-kap button { min-height: 48px; font-size: 16px; } }

#lv-zeiger { position: fixed; left: 0; top: 0; width: 0; height: 0; z-index: 9992; pointer-events: none; display: none; will-change: transform; }
#lv-zeiger .lv-kreis { position: absolute; left: -30px; top: -30px; width: 60px; height: 60px; border-radius: 50%; box-sizing: border-box;
  background: radial-gradient(circle, #fff 0 5px, #ff6d00 6px 9px, rgba(255,193,7,.30) 10px); border: 4px solid #ff6d00;
  box-shadow: 0 0 0 3px rgba(255,255,255,.92), 0 8px 22px rgba(0,0,0,.38); transition: transform .15s; }
#lv-zeiger .lv-welle { position: absolute; left: -30px; top: -30px; width: 60px; height: 60px; border-radius: 50%; border: 4px solid #ff6d00; opacity: 0; box-sizing: border-box; }
#lv-zeiger .lv-finger { position: absolute; left: 6px; top: 22px; font-size: 38px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,.45)); }
#lv-zeiger.drueckt .lv-kreis { transform: scale(.72); }
#lv-zeiger.tipp .lv-kreis { animation: lvTipp .45s ease-out; }
#lv-zeiger.tipp .lv-welle { animation: lvWelle .65s ease-out; }
@keyframes lvTipp { 0% { transform: scale(1); } 35% { transform: scale(.66); } 100% { transform: scale(1); } }
@keyframes lvWelle { 0% { transform: scale(.6); opacity: .95; } 100% { transform: scale(2.6); opacity: 0; } }
#lv-ring { position: fixed; z-index: 9991; pointer-events: none; display: none; border: 4px solid #e91e63; border-radius: 14px; box-sizing: border-box; animation: lvPuls 1.1s ease-in-out infinite; }
@keyframes lvPuls { 0%, 100% { box-shadow: 0 0 0 0 rgba(233,30,99,.6); } 50% { box-shadow: 0 0 0 14px rgba(233,30,99,0); } }

#lv-leiste { position: fixed; left: 50%; transform: translateX(-50%); bottom: 14px; width: min(1060px, calc(100vw - 24px)); z-index: 9993; pointer-events: none; display: none; flex-direction: column-reverse; gap: 8px; align-items: center; }
#lv-leiste.auf { display: flex; }
#lv-leiste.ende { bottom: 112px; }
#lv-leiste.oben { bottom: auto; top: 62px; flex-direction: column; }
#lv-leiste .lv-text { align-self: stretch; background: var(--surface); color: var(--text); border: 2px solid #7c4dff; border-radius: 18px; box-shadow: var(--shadow-lg);
  padding: 14px 22px; font-size: 26px; line-height: 1.35; font-weight: 600; text-align: center; }
#lv-leiste .lv-steuer { pointer-events: auto; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: center; background: var(--surface); color: var(--text);
  border: 1px solid var(--line); border-radius: 999px; box-shadow: var(--shadow-lg); padding: 6px 10px; }
#lv-leiste .lv-steuer button { min-width: 58px; height: 54px; font-size: 22px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--text); cursor: pointer; padding: 0 14px; touch-action: manipulation; }
#lv-leiste .lv-steuer button.prim { background: #7c4dff; border-color: #7c4dff; color: #fff; font-weight: 700; }
#lv-leiste .lv-steuer button:disabled { opacity: .4; }
#lv-leiste .lv-zahl { font-size: 17px; color: var(--muted); padding: 0 8px; white-space: nowrap; }
#lv-leiste.pause .lv-text { border-color: #ff9800; }
`;
document.head.append(css);

/* ---------- kleine Helfer ---------- */
class Halt extends Error {}
let L = null; /* das laufende Lernvideo */
const schlaf = ms => new Promise(r => setTimeout(r, ms));
const sofort = () => !!(L && (L.schnell || L.springen));
const lesezeit = t => Math.min(6500, Math.max(1800, 900 + String(t || '').length * 52));
const sichtbar = el => {
  if (!el || !el.isConnected || !el.getClientRects().length) return false;
  const r = el.getBoundingClientRect(), st = getComputedStyle(el);
  return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none';
};
/* q: CSS-Selektor, Element, Liste oder Funktion – liefert das erste sichtbare Element */
function finde(q) {
  let r = typeof q === 'function' ? q() : typeof q === 'string' ? [...document.querySelectorAll(q)] : q;
  if (!Array.isArray(r)) r = r && r.length != null && !r.nodeType ? [...r] : [r];
  return r.find(sichtbar) || null;
}
/* Knopf in einem Bereich, dessen Text passt (z. B. knopf('#pop', /Laserpointer/)) */
const knopf = (wurzel, re, sel = 'button') => () => [...document.querySelectorAll(wurzel)].flatMap(w => [...w.querySelectorAll(sel)]).filter(b => re.test(b.textContent));
const alleIn = (wurzel, sel) => () => [...document.querySelectorAll(wurzel)].flatMap(w => [...w.querySelectorAll(sel)]);
const schnell = () => { const s = $('schnellLeiste'); return sichtbar(s) ? s : null; };
const dockAuf = () => { const d = $('dock'); return d && d.classList.contains('auf') ? d : null; };
const dlgAuf = () => { const m = $('modal'); return m && m.style.display === 'flex'; };

/* Wartezeiten: richten sich nach dem Tempo, halten bei ⏸ an, enden sofort bei ⏭ und brechen bei ✕/⏮ ab */
function warte(ms, pausierbar = true) {
  const l = L; if (!l) return Promise.reject(new Halt());
  const gen = l.gen;
  return new Promise((ok, nein) => {
    let rest = ms * l.tempo, t0 = performance.now();
    const tick = () => {
      if (L !== l || l.gen !== gen || l.aus) return nein(new Halt());
      if (S.dirty) l.warSchmutzig = true; else if (l.warSchmutzig) l.gespeichert = true; /* zwischendurch automatisch gespeichert? */
      const t = performance.now(); if (!(pausierbar && l.pause)) rest -= t - t0; t0 = t;
      if (l.schnell || l.springen) rest = 0;
      if (rest <= 0) return ok();
      setTimeout(tick, Math.min(40, Math.max(5, rest)));
    };
    tick();
  });
}
/* echte Zeit (nicht pausierbar) – für Striche, damit ⏸ keinen halben Strich „festhält“ */
function schlafHalt(ms) {
  const l = L, gen = l && l.gen;
  return new Promise((ok, nein) => setTimeout(() => (!l || L !== l || l.gen !== gen || l.aus) ? nein(new Halt()) : ok(), ms));
}
async function warteAuf(q, ms = 2500) {
  const l = L, gen = l && l.gen, t0 = performance.now();
  for (;;) {
    if (!l || L !== l || l.gen !== gen || l.aus) throw new Halt();
    const el = finde(q); if (el) return el;
    if (performance.now() - t0 > ms) return null;
    await schlaf(60);
  }
}

/* ---------- Zeiger, Ring, Untertitel, Steuerleiste ---------- */
const ui = {};
function baueUI() {
  if (ui.zeiger) return;
  ui.zeiger = h('div', { id: 'lv-zeiger' }, h('div', { class: 'lv-welle' }), h('div', { class: 'lv-kreis' }), h('div', { class: 'lv-finger' }, '👆'));
  ui.ring = h('div', { id: 'lv-ring' });
  ui.text = h('div', { class: 'lv-text' });
  ui.steuer = h('div', { class: 'lv-steuer' });
  ui.leiste = h('div', { id: 'lv-leiste' }, ui.text, ui.steuer);
  document.body.append(ui.ring, ui.zeiger, ui.leiste);
}
/* Tipps auf die Steuerleiste nicht an die App weitergeben (sonst schließen sich offene Menüs) – der Klick kommt trotzdem an */
for (const typ of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend']) window.addEventListener(typ, e => { if (ui.steuer && e.target && e.target.nodeType === 1 && ui.steuer.contains(e.target)) e.stopPropagation(); }, true);
window.addEventListener('keydown', e => {
  if (!L || L.aus) return;
  if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); befehl('aus'); }
  else if (e.key === ' ' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) { e.stopPropagation(); e.preventDefault(); pauseUm(); }
}, true);

let zx = 0, zy = 0;
function zeigerSetzen(x, y) { baueUI(); const z = ui.zeiger; z.style.display = 'block'; z.style.transition = 'none'; z.style.transform = `translate(${x}px,${y}px)`; zx = x; zy = y; }
async function zeigerZu(x, y, ms = 650) {
  baueUI(); const z = ui.zeiger;
  if (z.style.display !== 'block') { zeigerSetzen(innerWidth / 2, innerHeight * 0.55); void z.offsetWidth; }
  const d = sofort() ? 0 : Math.round(ms * L.tempo * Math.min(1.4, Math.max(0.5, Math.hypot(x - zx, y - zy) / 500)));
  z.style.transition = d ? `transform ${d}ms cubic-bezier(.45,.05,.25,1)` : 'none';
  z.style.transform = `translate(${x}px,${y}px)`; zx = x; zy = y;
  await warte(d / L.tempo);
}
async function tippAnimation() { if (sofort()) return; const z = ui.zeiger; z.classList.remove('tipp'); void z.offsetWidth; z.classList.add('tipp'); await warte(300); }
function ring(r) { baueUI(); if (!r) { ui.ring.style.display = 'none'; return; } Object.assign(ui.ring.style, { display: 'block', left: (r.left - 7) + 'px', top: (r.top - 7) + 'px', width: (r.width + 14) + 'px', height: (r.height + 14) + 'px' }); }
const ringWeg = () => ring(null);
function rechteck(el) { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height, x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
function inSicht(el) {
  const r = el.getBoundingClientRect();
  if (r.top >= 56 && r.bottom <= innerHeight - 4 && r.left >= 0 && r.right <= innerWidth) return;
  if (el.closest('#dock, #dlg, #pop, #schnellLeiste, #selbar, #seitenPanel, .widget, #eigenPanel')) try { el.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) {}
}
/* Untertitel oben, wenn das Ziel in der unteren Hälfte liegt (z. B. Werkzeugleiste) – sonst unten */
function platz(r) {
  if (!r) return;
  const H = ui.leiste.offsetHeight || 150, stoesstOben = r.top < 62 + H + 10, stoesstUnten = r.top + r.height > innerHeight - 14 - H - 10;
  let oben = r.top + r.height / 2 > innerHeight * 0.5;
  if (oben && stoesstOben && !stoesstUnten) oben = false; else if (!oben && stoesstUnten && !stoesstOben) oben = true; /* das Ziel nie verdecken, wenn es anders geht */
  ui.leiste.classList.toggle('oben', oben);
}
function untertitel(text, r) { baueUI(); if (text != null) ui.text.textContent = text; platz(r); }
async function sage(text, ms) { untertitel(text); await warte(ms != null ? ms : lesezeit(text)); }
async function fehlt(text) {
  L.uebersprungen.push(text || ('Schritt ' + (L.i + 1)));
  ringWeg(); if (sofort()) return;
  untertitel('⏭ Dieser Schritt wird übersprungen – das Element ist hier gerade nicht zu sehen.'); await warte(1700);
}
/* Ziel suchen, hinzeigen, Ring, Untertitel – dann wirklich antippen (opt.nurZeigen: nur zeigen) */
async function tippe(q, text, opt = {}) {
  const el = await warteAuf(q, opt.warten || 2500);
  if (!el) { await fehlt(text); return null; }
  if (!sofort()) {
    inSicht(el); const r = rechteck(el);
    untertitel(text != null ? text : null, r);
    await zeigerZu(r.x, r.y); ring(r);
    await warte(opt.lesen != null ? opt.lesen : text ? lesezeit(text) * 0.75 : 600);
    if (!opt.nurZeigen) await tippAnimation();
  }
  if (!opt.nurZeigen) { if (opt.fokus) el.focus(); el.click(); }
  await warte(opt.nach != null ? opt.nach : 500);
  ringWeg();
  return el;
}
const zeige = (q, text, opt = {}) => tippe(q, text, { ...opt, nurZeigen: true });
/* mehrere Einträge nacheinander zeigen (ohne Antippen), Untertitel je Eintrag */
async function zeigeAlle(q, textFn, max = 8, ms) {
  const els = (typeof q === 'function' ? q() : [...document.querySelectorAll(q)]).filter(sichtbar).slice(0, max);
  if (!els.length) { await fehlt(); return []; }
  let erst = true;
  for (const el of els) {
    if (sofort()) break;
    inSicht(el); const r = rechteck(el), t = textFn ? textFn(el) : null;
    untertitel(t || null, erst ? r : null); erst = false;
    await zeigerZu(r.x, r.y, 420); ring(r);
    await warte(ms || (t ? Math.max(1400, lesezeit(t) * 0.7) : 900));
  }
  ringWeg(); return els;
}
const titelText = el => { const t = (el.textContent || '').replace(/\s+/g, ' ').trim(), hint = el.title || ''; return hint && !t.includes(hint) ? t + ' – ' + hint : t; };

/* ---------- Stift auf der Tafel (echte Pointer-Ereignisse auf #cOver) ---------- */
let pid = 7300;
function stiftEreignis(typ, x, y, id) {
  const ziel = $('cOver'); if (!ziel) return;
  ziel.dispatchEvent(new PointerEvent(typ, { bubbles: true, cancelable: true, composed: true, pointerId: id, pointerType: 'pen', isPrimary: true, clientX: x, clientY: y, screenX: x, screenY: y,
    pressure: typ === 'pointerup' ? 0 : 0.55, buttons: typ === 'pointerup' ? 0 : 1, button: typ === 'pointermove' ? -1 : 0, width: 1, height: 1 }));
}
/* Linienzug fein unterteilen (gleichmäßige Stiftbewegung) */
function fein(pts, schritt = 6) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / schritt)); for (let k = 1; k <= n; k++) out.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); }
  return out;
}
async function strich(pts) {
  pts = fein(pts); if (!pts.length) return;
  const id = ++pid; let unten = false;
  try {
    if (!sofort()) await zeigerZu(pts[0][0], pts[0][1], 450);
    stiftEreignis('pointerdown', pts[0][0], pts[0][1], id); unten = true; if (ui.zeiger) ui.zeiger.classList.add('drueckt');
    for (let i = 1; i < pts.length; i++) {
      stiftEreignis('pointermove', pts[i][0], pts[i][1], id);
      if (!sofort()) { zeigerSetzen(pts[i][0], pts[i][1]); if (i % 2 === 0) await schlafHalt(Math.max(4, 14 * L.tempo)); }
    }
  } finally {
    if (unten) { const p = pts[pts.length - 1]; stiftEreignis('pointerup', p[0], p[1], id); }
    if (ui.zeiger) ui.zeiger.classList.remove('drueckt');
  }
  if (!sofort()) await warte(120);
}
async function tippeTafel(x, y) {
  if (!sofort()) { await zeigerZu(x, y); await tippAnimation(); }
  const id = ++pid; stiftEreignis('pointerdown', x, y, id); stiftEreignis('pointerup', x, y, id);
  await warte(350);
}
const ellipse = (cx, cy, rx, ry, a0 = -Math.PI / 2, n = 36, voll = 1) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + i / n * 2 * Math.PI * voll; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
/* Schreibfläche: Mitte der sichtbaren Tafel */
function flaeche() {
  const x0 = (T.ox || 0) + (innerWidth - (T.ox || 0)) * 0.24, y0 = innerHeight * 0.3, H = Math.max(60, Math.min(110, innerHeight * 0.12));
  return { x0, y0, H };
}
/* „Hallo“ als Handschrift – Striche in Bildschirmkoordinaten */
function halloStriche() {
  const { x0, y0, H: u } = flaeche(), st = []; let x = x0;
  st.push([[x, y0], [x, y0 + u]], [[x + 0.55 * u, y0], [x + 0.55 * u, y0 + u]], [[x, y0 + 0.52 * u], [x + 0.55 * u, y0 + 0.52 * u]]); x += 0.85 * u;
  st.push(ellipse(x + 0.22 * u, y0 + 0.75 * u, 0.22 * u, 0.25 * u, -0.25), [[x + 0.45 * u, y0 + 0.5 * u], [x + 0.45 * u, y0 + u]]); x += 0.75 * u;
  st.push([[x, y0], [x, y0 + u]]); x += 0.3 * u;
  st.push([[x, y0], [x, y0 + u]]); x += 0.25 * u;
  st.push(ellipse(x + 0.24 * u, y0 + 0.75 * u, 0.24 * u, 0.25 * u)); x += 0.55 * u;
  L.wort = { x0: x0, y0: y0, x1: x, y1: y0 + u, u };
  return st;
}
async function schreibeHallo() { for (const s of halloStriche()) await strich(s); }
/* Text in ein Eingabefeld „tippen“ (Zeichen für Zeichen, mit input-Ereignis) */
async function eintippen(el, text) {
  try { el.focus(); } catch (e) {}
  for (const ch of text) { el.value += ch; el.dispatchEvent(new Event('input', { bubbles: true })); await warte(sofort() ? 0 : 95, false); }
}
const bildschirm = (wx, wy) => { const v = T.page().view; return [wx * v.z + v.x + (T.ox || 0), wy * v.z + v.y]; };
const neuesFenster = () => [...document.querySelectorAll('.widget')].filter(w => L && !L.merk.widgets.has(w)).pop() || null;

/* ---------- Menüs, die je nach Einstellung als Leiste unten oder als Seitenleiste aufgehen ---------- */
async function menueAuf(art, text) {
  if ((art === 'werkzeuge' || art === 'classroom' || art === 'einfuegen') && (dockAuf() && $('dock').querySelector('.dbody, .tile, .kats'))) {
    const s = schnell(); if (!s) return 'dock';
  }
  await tippe('#t_' + art, text);
  await warte(250);
  return schnell() ? 'leiste' : dockAuf() ? 'dock' : null;
}
/* „☰ Alle“ in der Leiste → Seitenleiste */
async function alleAuf(art, text) {
  if (dockAuf()) return true;
  const s = schnell();
  if (s) await tippe(knopf('#schnellLeiste', /☰ Alle/), text || '„☰ Alle“ öffnet alles als Seitenleiste.');
  if (!dockAuf() && T.zeigeDock) T.zeigeDock(art);
  await warte(450);
  return !!dockAuf();
}
const dockZu = () => tippe('#dock.auf .dkopf button[title="Seitenleiste schließen"]', '× schließt die Seitenleiste wieder.');
/* Classroom-Werkzeug starten – in der Leiste über „☰ Alle ▾“, in der Seitenleiste über die Kacheln */
async function crStarte(re, text, ersterText) {
  const inDock = () => dockAuf() && finde(knopf('#dock', re, '.tile'));
  const inLeiste = () => finde(knopf('#schnellLeiste', re, '.sl-eintrag'));
  if (!inDock() && !inLeiste()) {
    const art = await menueAuf('classroom', ersterText || '„Classroom“ antippen.');
    if (art === 'leiste' && !inLeiste()) await tippe(() => document.querySelector('#schnellLeiste [data-klapp="alle"]') || finde(knopf('#schnellLeiste', /☰ Alle/)), '„☰ Alle“ klappt alle Classroom-Werkzeuge auf.');
  }
  return tippe(() => inDock() || inLeiste(), text, { nach: 700 });
}
async function fensterZu(text) {
  await warte(200);
  if (dlgAuf()) return tippe('#dlg .dlg-kopf > button.nzu', text || '× schließt das Fenster.');
  const w = neuesFenster();
  if (w) return tippe(() => w.querySelector('.wk-zu'), text || '× schließt das Fenster.');
  return null;
}

/* ---------- Kapitel ---------- */
const KAP = [
  { id: 'stift', ico: '✏️', titel: 'Stift / Feder',
    text: ['Mit dem Stift schreiben Sie wie auf einer Kreidetafel – druckempfindlich und geglättet. Farbe und Stärke stehen direkt daneben in der Werkzeugleiste.',
      'Ein zweiter Tipp auf „Stift“ öffnet das Stift-Menü: Stift, Kalligrafie-Feder oder Textmarker, ein Effekt (Schatten, Neon, Gold …), die Formerkennung und der Doppeltipp.'],
    schritte: ['Unten auf „Stift“ tippen.', 'Den Farbpunkt antippen und eine Farbe wählen.', 'Den Stärke-Punkt antippen: S, M, L oder XL.', 'Auf die Tafel schreiben.', 'Nochmals auf „Stift“ tippen: Stiftart, Effekt, Formerkennung. Noch ein Tipp schließt das Menü.'],
    video: [
      async () => { if (S.tool === 'stift' || S.tool === 'marker') T.setTool('auswahl'); await sage('In diesem Video: schreiben, Farbe und Stärke wählen und das Stift-Menü.', 2600); },
      async () => { await tippe('#t_stift', 'Unten auf „Stift“ tippen – jetzt schreibt der Stift.'); },
      async () => {
        if (!await tippe('#farben .sw-aktuell, #farben .sw', 'Der Farbpunkt zeigt die aktuelle Farbe. Antippen öffnet die Farbauswahl.')) return;
        await tippe(() => { const r = $('pop').querySelector('.row'); const sw = r ? [...r.querySelectorAll('.sw')] : []; return sw[2] || sw[1] || sw[0]; }, 'Eine Farbe antippen – fertig. Wir nehmen Blau.');
      },
      async () => {
        if (!await tippe('#groessen .sz', 'Daneben die Stärke. Antippen zeigt S, M, L und XL.')) return;
        await tippe(() => { const sz = [...$('pop').querySelectorAll('.sz-wahl .sz, .sz')]; return sz[2] || sz[sz.length - 1]; }, 'Wir nehmen L – etwas kräftiger.');
      },
      async () => { untertitel('Jetzt einfach auf die Tafel schreiben.', { top: innerHeight * 0.3, height: 10 }); await warte(900); await schreibeHallo(); await warte(800); },
      async () => {
        await tippe('#t_stift', 'Noch einmal auf „Stift“ tippen: Das Stift-Menü öffnet sich.');
        await warte(300);
        await zeigeAlle(() => [...document.querySelectorAll('#schnellLeiste .fl-k, #pop button.big, #pop .big')], titelText, 7);
      },
      async () => { await tippe('#t_stift', 'Nochmals auf „Stift“ tippen schließt das Menü wieder.'); if (schnell()) T.schnellWeg(); T.closePops(); },
      async () => { await sage('Tipp: Die Stift-Rückseite bzw. die Stift-Taste wischt weg. Mit dem Finger verschieben und zoomen Sie die Tafel.', 3600); }
    ] },
  { id: 'hervorheben', ico: '🖍', titel: 'Hervorheben',
    text: ['„Hervorheben“ sammelt alles zum Zeigen: 🔴 Laserpointer (die Spur verschwindet nach 2 Sekunden), 🔦 Scheinwerfer, 🔍 Lupe, 📖 Leselineal, ⬛ Tafel schwarz und 🎭 Vorhang.',
      'Zum Markieren von Geschriebenem gibt es im Stift-Menü den Textmarker: durchsichtig, er liegt immer unter der Schrift.'],
    schritte: ['Unten auf „Hervorheben“ tippen.', 'Eine Hilfe wählen, z. B. „Laserpointer“.', 'Mit dem Stift zeigen oder umkreisen.', 'Zurück zum Schreiben: „Stift“ antippen.', 'Markieren: „Stift“ noch einmal antippen › „Textmarker“ › über das Wort fahren.'],
    video: [
      async () => { untertitel('Zuerst steht schon etwas an der Tafel …', { top: innerHeight * 0.3, height: 10 }); if (S.tool !== 'stift') T.setTool('stift'); await schreibeHallo(); await warte(500); },
      async () => { await tippe('#t_hervor', 'Unten auf „Hervorheben“ tippen – hier sind die Zeige-Hilfen.'); await warte(300); await zeigeAlle(() => [...document.querySelectorAll('#schnellLeiste .fl-k, #pop button.big')], titelText, 7); },
      async () => { await tippe(knopf('#schnellLeiste, #pop', /Laserpointer/), 'Wir nehmen den Laserpointer.'); },
      async () => {
        const w = L.wort; untertitel('Mit dem Stift zeigen oder umkreisen – die rote Spur verschwindet nach 2 Sekunden.', { top: w.y0, height: 1 });
        await warte(700); await strich(ellipse((w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2, (w.x1 - w.x0) / 2 + 40, (w.y1 - w.y0) / 2 + 30, -Math.PI / 2, 48, 1.05)); await warte(2600);
      },
      async () => { await tippe('#t_hervor', 'Laser aus: „Laser“ antippen …'); await warte(300); await tippe(knopf('#schnellLeiste, #pop', /Laserpointer/), '… und den Laserpointer noch einmal antippen. Oder einfach „Stift“ antippen.'); },
      async () => {
        if (S.tool !== 'stift') await tippe('#t_stift', 'Zum Markieren: „Stift“ antippen …');
        await tippe('#t_stift', 'Ein weiterer Tipp auf „Stift“ öffnet das Stift-Menü.');
        await tippe(knopf('#schnellLeiste, #pop', /Textmarker/), '„Textmarker“ wählen.');
      },
      async () => {
        const w = L.wort; untertitel('Mit dem Textmarker über das Geschriebene fahren – die Schrift bleibt gut lesbar.', { top: w.y0, height: 1 });
        await warte(600); const y = w.y0 + w.u * 0.62; await strich([[w.x0 - 12, y], [w.x1 + 12, y]]); await warte(1200);
      },
      async () => {
        await tippe('#t_stift', 'Zurück zum Stift: „Marker“ antippen …');
        await tippe(() => [...document.querySelectorAll('#schnellLeiste .fl-k, #pop button.big')].filter(b => /^\s*Stift(?!art)/.test(b.textContent.trim())), '… und „Stift“ wählen.');
        if (schnell()) T.schnellWeg(); T.closePops();
      }
    ] },
  { id: 'schwamm', ico: '🧽', titel: 'Schwamm & Wischen',
    text: ['Der Schwamm wischt Stellen weg. Beim Antippen klappt gleich die Auswahl auf: „Stellen wegwischen“, „Ganze Striche“ oder „🗑 Seite leeren“. Die Größe (S bis XXL) steht daneben.',
      '„Wischen“ fragt kurz nach: ✍ nur Handschrift (Vorlagen und Bausteine bleiben stehen), 🧩 nur Bausteine & Bilder oder 🗑 alles. Mit „↶ Zurück“ kommt alles wieder.'],
    schritte: ['„Schwamm“ antippen und „Stellen wegwischen“ wählen.', 'Mit dem Stift über die Stelle fahren.', '„Ganze Striche“: einen Strich antippen – er ist ganz weg.', '„Wischen“ antippen und wählen, was weg soll.', 'Aus Versehen gewischt? „↶ Zurück“.'],
    video: [
      async () => { untertitel('Zuerst steht schon etwas an der Tafel …', { top: innerHeight * 0.3, height: 10 }); if (S.tool !== 'stift') T.setTool('stift'); await schreibeHallo(); await warte(500); },
      async () => { await tippe('#t_radierer', 'Unten auf „Schwamm“ tippen. Die Auswahl klappt gleich auf.'); await warte(300); await zeigeAlle(() => [...document.querySelectorAll('#schnellLeiste .fl-k, #pop button.big')], titelText, 4); },
      async () => {
        await tippe(knopf('#schnellLeiste, #pop', /Stellen wegwischen/), '„Stellen wegwischen“ wählen.');
        const w = L.wort, x = w.x1 - w.u * 0.3; untertitel('Mit dem Stift über die Stelle fahren – nur dort wird gewischt.', { top: w.y0, height: 1 });
        await warte(500); await strich([[x - 30, w.y0 + w.u * 0.45], [x + 30, w.y0 + w.u * 0.6], [x - 30, w.y0 + w.u * 0.75], [x + 30, w.y0 + w.u * 0.9], [x - 30, w.y0 + w.u * 1.02]]); await warte(700);
      },
      async () => {
        await tippe('#t_radierer', 'Noch einmal „Schwamm“ …');
        await tippe(knopf('#schnellLeiste, #pop', /Ganze Striche/), '… und „Ganze Striche“: Ein Tipp löscht den ganzen Strich.');
        const w = L.wort; untertitel('Den Strich antippen – weg ist er.', { top: w.y0, height: 1 }); await tippeTafel(w.x0, w.y0 + w.u * 0.25); await warte(700);
      },
      async () => { await tippe('#t_wischen', '„Wischen“ fragt kurz nach, was weg soll.'); await warte(300); await zeigeAlle(() => [...document.querySelectorAll('#schnellLeiste .fl-k, #pop button.big')], el => titelText(el).replace(/\(\d+\)/, '').trim(), 3); },
      async () => { await tippe(knopf('#schnellLeiste, #pop', /Nur Handschrift/), '„✍ Nur Handschrift“: Vorlagen und Bausteine bleiben stehen.'); await warte(900); },
      async () => { await zeige('#t_undo', 'Aus Versehen gewischt? „↶ Zurück“ holt alles wieder.'); }
    ] },
  { id: 'auswahl', ico: '⬚', titel: 'Auswahl & Text',
    text: ['🔤 Text: antippen, dann auf die Tafel tippen und schreiben (am Board öffnet sich ein Eingabefenster, am PC mit der Maus tippt man direkt auf der Tafel).',
      '⬚ Auswahl: Ein Element antippen – rechts daneben erscheint ☰. Antippen öffnet das Kontextmenü: ✏️ Bearbeiten, ⧉ Duplizieren, ⬆ ⬇ nach vorne/hinten, 🔒 Fixieren und „⚙ Alle Einstellungen …“. Ziehen verschiebt, ⤡ vergrößert, ↻ dreht. Rahmen ziehen wählt mehrere aus. Handschrift antippen wählt das ganze Wort.'],
    schritte: ['„Text“ antippen, dann auf die Tafel tippen.', 'Text eingeben und „OK“ antippen.', '„Auswahl“ antippen und den Text antippen.', '☰ antippen: Das Kontextmenü öffnet sich.', 'Ziehen verschiebt das Element. ✕ schließt das Menü.'],
    video: [
      async () => { await tippe('#t_text', 'Unten auf „Text“ tippen.'); },
      async () => { const f = flaeche(); untertitel('Dann auf die Tafel tippen – dort, wo der Text stehen soll.', { top: f.y0, height: 1 }); await warte(900); await tippeTafel(f.x0, f.y0 + 20); },
      async () => {
        const ta = await tippe('#dlg textarea', 'Den Text eingeben – am Board mit der Bildschirmtastatur.', { nurZeigen: true, warten: 3000 });
        if (!ta) return; await eintippen(ta, 'Willkommen in Klasse 7!'); await warte(500);
        await tippe(knopf('#dlg', /^\s*OK\s*$/), '„OK“ antippen – der Text steht auf der Tafel.');
      },
      async () => { await tippe('#t_auswahl', 'Jetzt „Auswahl“ antippen.'); },
      async () => {
        const it = T.page().items.filter(i => i.k === 'text').pop();
        if (!it) { await fehlt('Text antippen'); return; }
        const [x, y] = bildschirm(it.x + it.w / 2, it.y + it.h / 2); untertitel('Den Text antippen – er ist markiert.', { top: y, height: 1 });
        await warte(700); await tippeTafel(x, y);
        if (!S.sel || !S.sel.ids.has(it.id)) { T.select([it.id]); await warte(300); }
      },
      async () => {
        await zeige('#selbar', 'Rechts daneben steht ☰ – das Kontextmenü.');
        await tippe('#selbar .sel-auf', '☰ antippen öffnet das Menü.');
        await zeigeAlle(alleIn('#selbar', '.chips button, .sel-mehr'), el => ({ '✏️': '✏️ Bearbeiten', '⧉': '⧉ Duplizieren', '⬆': '⬆ Nach vorne', '⬇': '⬇ Nach hinten', '🔒': '🔒 Fixieren – verrutscht nicht mehr' })[el.textContent.trim()] || titelText(el), 6);
      },
      async () => {
        const it = T.page().items.filter(i => i.k === 'text').pop(); if (!it) return;
        const [x, y] = bildschirm(it.x + it.w / 2, it.y + it.h / 2); untertitel('Ziehen verschiebt den Text.', { top: y, height: 1 });
        await warte(600); await strich([[x, y], [x + 60, y + 30], [x + 140, y + 70]]); await warte(500);
      },
      async () => { await tippe(() => document.querySelector('#selbar .sel-kopf button[title^="Schließen"]') || document.querySelector('#selbar .sel-auf'), '✕ schließt das Menü und hebt die Auswahl auf.'); S.sel = null; T.renderOver(); }
    ] },
  { id: 'seite', ico: '📄', titel: 'Seiten',
    text: ['Im Feld „Seite“ unten: ◀ vorige Seite, die Seitenzahl, ▶ nächste Seite und ＋ neue Seite.',
      'Die Seitenzahl antippen öffnet die Seiten-Leiste mit drei Bereichen: 🎨 Hintergrund (weiß, schwarz, grün – kariert, liniert, Schreiblinien, Punkte, Notenlinien), 📑 Inhaltsverzeichnis (alle Seiten als Bildchen, Titel eintippen, umsortieren) und 🛠 Seite & Ansicht (duplizieren, löschen, als Vorlage speichern, Ansicht 100 %).'],
    schritte: ['＋ hängt eine neue Seite an.', '◀ und ▶ blättern.', 'Die Seitenzahl antippen: Die Seiten-Leiste öffnet sich.', 'Hintergrund wählen, z. B. kariert.', '„📑 Inhaltsverzeichnis“ und „🛠 Seite & Ansicht“ ansehen, × schließt.'],
    video: [
      async () => { const t = { t_prev: '◀ vorige Seite', seiteBtn: 'Die Seitenzahl – antippen öffnet die Seiten-Leiste', t_next: '▶ nächste Seite', t_neu: '＋ neue Seite anhängen' };
        await zeigeAlle(() => ['t_prev', 'seiteBtn', 't_next', 't_neu'].map($).filter(Boolean), el => t[el.id], 4, 1700); },
      async () => { await tippe('#t_neu', '＋ antippen: Eine neue, leere Seite kommt dazu.'); await warte(600); },
      async () => { await tippe('#t_prev', '◀ blättert zurück.'); },
      async () => { await tippe('#seiteBtn', 'Die Seitenzahl antippen: Die Seiten-Leiste öffnet sich.'); await warte(400); },
      async () => {
        await zeige('#seitenPanel .sp-bg', '„🎨 Hintergrund“: weiß, schwarz oder grün – leer, kariert, liniert, Punkte …');
        await tippe(() => [...document.querySelectorAll('#seitenPanel .bgtile')].filter(b => /kariert/i.test(b.title)), 'Wir nehmen kariert.');
      },
      async () => { await tippe(knopf('#seitenPanel .sp-kats', /Inhaltsverzeichnis/), '„📑 Inhaltsverzeichnis“: alle Seiten als Bildchen – antippen springt hin, ▲ ▼ sortiert um.'); await warte(800); },
      async () => {
        await tippe(knopf('#seitenPanel .sp-kats', /Seite & Ansicht/), '„🛠 Seite & Ansicht“: neue Seite, duplizieren, löschen, als Vorlage speichern.');
        await zeigeAlle(alleIn('#seitenPanel', '.sp-knoepfe button'), titelText, 6, 1100);
      },
      async () => { await tippe('#seitenPanel .sp-kopf button[title="Schließen"]', '× schließt die Seiten-Leiste.'); T.seitenLeiste && T.seitenLeiste(false); }
    ] },
  { id: 'werkzeuge', ico: '📐', titel: 'Werkzeuge',
    text: ['„Werkzeuge“ enthält Lineal, Geodreieck, Winkelmesser, Zirkel und den wissenschaftlichen Rechner.',
      'Antippen blendet ein Werkzeug ein bzw. wieder aus. Mit dem Finger verschieben, mit zwei Fingern drehen und vergrößern. Der Stift zeichnet an der Kante entlang; beim Zirkel den Stift an die Mine setzen und herumfahren.'],
    schritte: ['„Werkzeuge“ antippen.', 'z. B. „Geodreieck“ antippen – es liegt auf der Tafel.', 'Verschieben mit dem Finger, drehen mit zwei Fingern.', 'Ausschalten: „Werkzeuge“ › „Geodreieck“ noch einmal antippen.', '🧮 Rechner: öffnet die Seitenleiste mit dem Rechner.'],
    video: [
      async () => {
        const art = await menueAuf('werkzeuge', 'Unten auf „Werkzeuge“ tippen.');
        if (art === 'dock') await zeigeAlle('#dock [data-inst]', el => el.textContent.trim(), 4, 1000);
        else await zeigeAlle('#schnellLeiste .fl-k', el => el.textContent.trim(), 6, 1000);
      },
      async () => { await tippe(() => [...document.querySelectorAll('#schnellLeiste .fl-k, #dock [data-inst="geodreieck"]')].filter(b => /Geodreieck/.test(b.textContent)), '„Geodreieck“ antippen – es liegt jetzt auf der Tafel.'); await warte(500); },
      async () => {
        const I = S.inst.find(i => i.kind === 'geodreieck');
        if (I) { const D = T.INSTR && T.INSTR.geodreieck, c = D && D.center ? D.center : [0, 0], [x, y] = bildschirm(I.x + c[0], I.y + c[1]); untertitel('Mit dem Finger verschieben, mit zwei Fingern drehen. Der Stift zeichnet an der Kante entlang.', { top: y, height: 1 }); await zeigerZu(x, y); await warte(3200); }
        else await sage('Mit dem Finger verschieben, mit zwei Fingern drehen. Der Stift zeichnet an der Kante entlang.');
      },
      async () => {
        if (!dockAuf()) await menueAuf('werkzeuge', 'Zum Ausschalten: wieder „Werkzeuge“ …');
        await tippe(() => [...document.querySelectorAll('#schnellLeiste .fl-k, #dock [data-inst="geodreieck"]')].filter(b => /Geodreieck/.test(b.textContent)), '… und noch einmal „Geodreieck“ – weg ist es.');
      },
      async () => {
        if (!dockAuf()) { await menueAuf('werkzeuge', 'Den Rechner gibt es auch hier: „Werkzeuge“ …'); await tippe(knopf('#schnellLeiste', /Rechner/), '… „🧮 Rechner“ öffnet die Seitenleiste.'); await warte(500); }
        await zeige(() => { const d = dockAuf(); return d && ([...d.querySelectorAll('h3')].find(x => /Rechner/.test(x.textContent)) || d.querySelector('.dbody')); }, 'Der wissenschaftliche Rechner steht in der Seitenleiste.');
        await dockZu();
      }
    ] },
  { id: 'einfuegen', ico: '🧩', titel: 'Einfügen',
    text: ['„Einfügen“ bringt Vorlagen, Bausteine, Bilder, Karten, Formeln und mehr auf die Tafel. In der Leiste stehen oben ◇ Formen und 🧮 Aufgaben, darunter Ihre ⭐ Favoriten. „☰ Alle“ öffnet alles als Seitenleiste – dort mit ☆ Favoriten wählen.',
      'Ganz oben in der Seitenleiste: 🔍 Suche – z. B. „Bruch“ findet alle passenden Vorlagen. Eine Vorlage antippen setzt sie in die Mitte der Tafel. Danach: ☰ › „✏️ Texte direkt ändern“ – jede Zeile antippen und neuen Text eintippen.'],
    schritte: ['„Einfügen“ antippen, dann „☰ Alle“.', 'Oben suchen, z. B. „Bruch“ – oder links eine Kategorie wählen.', 'Eine Vorlage antippen – sie steht auf der Tafel.', '☰ am Element › „✏️ Texte direkt ändern“.', 'Fertig: „✔ Texte fertig“.'],
    video: [
      async () => {
        const art = await menueAuf('einfuegen', 'Unten auf „Einfügen“ tippen.');
        if (art === 'leiste') await zeige('#schnellLeiste', 'Oben ◇ Formen und 🧮 Aufgaben, darunter Ihre ⭐ Favoriten.');
        await alleAuf('einfuegen', '„☰ Alle“ öffnet alle Vorlagen als Seitenleiste.');
      },
      async () => { await zeigeAlle('#dock .kats .kat', el => 'Kategorie: ' + el.textContent.replace(/[☆★]/g, '').trim(), 4, 900); },
      async () => {
        const f = await tippe('#dock .einf-suche', 'Schneller geht es mit der Suche oben.', { fokus: true });
        if (!f) return; L.gesucht = true; await eintippen(f, 'Bruch'); await warte(700);
        await zeige('#dock .einf-treffer', 'Alle Vorlagen mit „Bruch“ erscheinen.', { lesen: 1600 });
      },
      async () => {
        await tippe('#dock .einf-treffer .tile', 'Eine Vorlage antippen – sie steht in der Mitte der Tafel.', { nach: 700 });
        const f = document.querySelector('#dock .einf-suche'); if (f && f.value) { f.value = ''; f.dispatchEvent(new Event('input', { bubbles: true })); }
      },
      async () => { if (dockAuf()) await dockZu(); },
      async () => {
        if (!S.sel) { const it = T.page().items.filter(i => i.t === 'o').pop(); if (it) { T.select([it.id]); await warte(300); } }
        await zeige('#selbar', 'Die Vorlage ist markiert. Rechts daneben steht ☰.');
        await tippe('#selbar .sel-auf', '☰ antippen öffnet das Menü.');
      },
      async () => {
        const b = await tippe(knopf('#selbar', /Texte direkt ändern/), '„✏️ Texte direkt ändern“: Jede Zeile wird umrandet – antippen und neuen Text eintippen.', { nach: 900 });
        if (!b) return; await sage('Eine umrandete Zeile antippen, tippen, Enter speichert.', 2600);
        await tippe(knopf('#selbar', /Texte fertig/), '„✔ Texte fertig“ beendet das Ändern.');
      },
      async () => { await tippe(() => document.querySelector('#selbar .sel-kopf button[title^="Schließen"]'), '✕ schließt das Menü.'); S.sel = null; T.renderOver(); }
    ] },
  { id: 'classroom', ico: '⏱', titel: 'Classroom',
    text: ['„Classroom“ enthält die Werkzeuge für die Klasse: Klassenliste und Sitzplan, Timer und Stoppuhr, Phasentimer, Arbeitssymbole, Ampel, Lautstärke, Umfrage, Punktestand, Buzzer, Namen ziehen, Glücksrad, Gruppen bilden, Würfel, QR-Code und Feiern.',
      'In der Leiste stehen Ihre ⭐ Favoriten; „☰ Alle ▾“ klappt alle Werkzeuge auf – ☆ daneben nimmt eines in die Favoriten. Die Werkzeuge öffnen sich als kleine Fenster; × schließt, 📝 legt sie in die Notizen.'],
    schritte: ['„Classroom“ antippen, dann „☰ Alle ▾“.', 'Ein Werkzeug antippen, z. B. „Timer / Stoppuhr“.', 'Im Fenster bedienen (Zeit wählen, ▶ Start).', '× schließt das Fenster.', 'Klassenliste und Sitzplan liegen ganz oben unter „Klasse“.'],
    video: [
      async () => {
        const art = await menueAuf('classroom', 'Unten auf „Classroom“ tippen.');
        if (art === 'leiste') { await zeige('#schnellLeiste', 'Hier stehen Ihre ⭐ Favoriten.'); await tippe(() => document.querySelector('#schnellLeiste [data-klapp="alle"]') || finde(knopf('#schnellLeiste', /☰ Alle/)), '„☰ Alle ▾“ zeigt alle Classroom-Werkzeuge.'); }
      },
      async () => {
        if (!await crStarte(/Timer \/ Stoppuhr/, '„Timer / Stoppuhr“ antippen.')) return;
        const w = neuesFenster(); if (!w) return;
        await tippe(() => [...w.querySelectorAll('button')].filter(b => /^5 min$/.test(b.textContent.trim())), 'Zeit wählen, z. B. 5 Minuten …');
        await tippe(() => [...w.querySelectorAll('button')].filter(b => /Start/.test(b.textContent)), '… und ▶ Start.', { nach: 1200 });
        await fensterZu('× schließt das Fenster.');
      },
      async () => { if (!await crStarte(/Namen ziehen/, '„Namen ziehen“: zufällig jemanden aus der Klassenliste.')) return; await warte(1200); await fensterZu(); },
      async () => {
        if (!await crStarte(/Würfel/, '„Würfel“: ein, zwei oder drei Würfel.')) return;
        const w = neuesFenster(); if (w) await tippe(() => [...w.querySelectorAll('button')].filter(b => /^Würfeln$/.test(b.textContent.trim())), '„Würfeln“ antippen.', { nach: 1200 });
        await fensterZu();
      },
      async () => { if (!await crStarte(/Klassenliste/, '„📋 Klassenliste“: Namen eintragen oder aus einer Datei (Excel, CSV) übernehmen.')) return; await warte(1300); await fensterZu('× schließt die Klassenliste.'); },
      async () => {
        if (!await crStarte(/Sitzplan/, '„🪑 Sitzplan“: Tische und Namen wie im Klassenraum.')) return;
        const sp = await warteAuf('#sitzplanBox', 2500);
        if (sp) { await zeige(sp, 'Tische mit dem Finger verschieben, Namen zuordnen, Gruppen bilden.', { lesen: 2200 }); await tippe('#sitzplanBox .sp-x', '✕ schließt den Sitzplan (er wird gespeichert).'); }
        else if (dlgAuf()) { await sage('Zuerst fragt der Sitzplan nach der Klasse.', 2200); T.closeDlg(); }
      },
      async () => { if (schnell()) T.schnellWeg(); if (dockAuf()) await dockZu(); await sage('Tipp: ☆ neben einem Werkzeug nimmt es in Ihre Favoriten – dann steht es direkt in der Leiste.', 3200); }
    ] },
  { id: 'speichern', ico: '💾', titel: 'Speichern & Vorlagen',
    text: ['Angemeldet speichert die Tafel alle 20 Sekunden von selbst in Ihren Ordner. Oben links unter „📁 Tafel ▾“: 💾 Speichern (Strg+S), 📤 Speichern unter … (als Datei, z. B. auf USB-Stick oder in IServ), ⭐ Zu „Meine Aufgaben“, 📌 Als Vorlage speichern, ⇅ Import / Export.',
      '📌 Vorlage: ein fertiges Tafelbild zum Wiederverwenden – die ganze Seite oder nur das Markierte. Später finden Sie es unter Einfügen › 📌 Meine Vorlagen.'],
    schritte: ['Oben links „📁 Tafel ▾“ antippen.', '„💾 Speichern“ oder „📤 Speichern unter …“.', '„📌 Als Vorlage speichern …“ antippen.', '„📄 Diese Seite als Vorlage“ oder „☑ Auswahl als Vorlage“.', 'Einsetzen: Einfügen › 📌 Meine Vorlagen.'],
    video: [
      async () => { await tippe('#bArchiv', 'Oben links „📁 Tafel“ antippen.'); await warte(300); },
      async () => { await zeigeAlle(() => [...document.querySelectorAll('#pop button')].filter(b => /Speichern|Vorlage|Import/.test(b.textContent)), titelText, 5, 1700); },
      async () => {
        if (!T.alsVorlage) { await sage('Vorlagen speichern gibt es in dieser Fassung nicht.'); return; }
        await tippe(knopf('#pop', /Als Vorlage speichern/), '„📌 Als Vorlage speichern …“ antippen.'); await warte(300);
        await zeige('#pop .vl-kasten', 'Hier: die ganze Seite oder nur das Markierte als Vorlage.');
        await zeige(knopf('#pop', /Diese Seite als Vorlage/), '„📄 Diese Seite als Vorlage“ – später unter Einfügen › 📌 Meine Vorlagen.');
      },
      async () => { await sage('Wir speichern jetzt nicht – das Menü schließt sich wieder.', 2000); T.closePops(); }
    ] },
  { id: 'ordner', ico: '📲', titel: 'Tablet → Smartboard & Ordner',
    text: ['Ihr persönlicher Ordner (z. B. IServ „Eigene Dateien“, synchronisiert) enthält Ihre Tafeln, Notizen und Einstellungen – nur Sie sehen ihn.',
      'Ein gemeinsamer Ordner (z. B. ein IServ-Gruppenordner) ist für alles, was das Kollegium mitnutzt: Vorlagen, Klassenlisten, Sitzpläne und Tafeln zum Teilen. Wie die beiden Ordner eingerichtet werden, steht unter ⚙ Einstellungen.',
      'Vom Tablet ans Smartboard: Am Tablet über „📤 Speichern unter …“ bzw. 💾 Sicherung › „Jetzt sichern“ in IServ den Ordner „_Eingang“ im Tafel-Ordner wählen. Am Board erscheint „📥 Neu im Eingang“ – „Übernehmen & öffnen“. Bequemer: ⚙ Einstellungen › „📲 Tablet → Smartboard“ › beim Beenden fragen und senden.',
      '💾 Sicherung: alles (Tafeln, Notizen, Einstellungen, Listen, Vorlagen) in einer Datei – zum Mitnehmen auf ein anderes Gerät und zum Wiederherstellen.'],
    schritte: ['Persönliches in den eigenen Ordner, Geteiltes in den gemeinsamen Ordner.', 'Tablet: Tafel bzw. Sicherung in IServ › Tafel-Ordner › „_Eingang“ speichern.', 'Board: „📥 Neu im Eingang“ › „Übernehmen & öffnen“.', '⚙ › 🧰 Leiste & Favoriten › „📲 Tablet → Smartboard“: beim Beenden fragen und senden.', 'Regelmäßig 💾 Sicherung exportieren.'],
    video: [
      async () => { await sage('Persönliches liegt in Ihrem Ordner, Geteiltes (Vorlagen, Klassenlisten, Sitzpläne) im gemeinsamen Ordner.', 3800); },
      async () => { await tippe('#bSettings', 'Oben rechts ⚙ Einstellungen öffnen.', { nach: 700 }); },
      async () => {
        if (!dlgAuf()) { await fehlt('Einstellungen'); return; }
        const b = finde(knopf('#dlg .einst-links', /Leiste & Favoriten/));
        if (!b) { await sage('Diese Einstellungen gibt es erst nach dem Anmelden (👤 Anmelden auf der Startseite).', 3200); return; }
        await tippe(b, 'Links „🧰 Leiste & Favoriten“ antippen.');
        await zeige(() => [...document.querySelectorAll('#dlg h3')].filter(x => /Tablet → Smartboard|anderes Gerät/.test(x.textContent)), 'Hier: „📲 Tablet → Smartboard“.', { lesen: 1500 });
        await zeige(() => { const h3 = [...document.querySelectorAll('#dlg h3')].find(x => /Tablet → Smartboard|anderes Gerät/.test(x.textContent)); const l = h3 && h3.nextElementSibling; return l && (l.querySelector('select') || l); }, 'Beim Beenden fragt das Tablet: „📲 Ans Smartboard senden?“ – diese Tafel oder alles.');
      },
      async () => {
        if (!dlgAuf()) return;
        const b = finde(knopf('#dlg .einst-links', /Ablageordner|Ordner/));
        if (b) await tippe(b, 'Unter „📂 Ablageordner“ wählen Sie Ihren Ordner.', { nach: 700 });
        await sage('Im Ablageordner legt die Tafel den Ordner „_Eingang“ an. Was dort ankommt, erscheint am Board als „📥 Neu im Eingang“.', 4200);
      },
      async () => { if (dlgAuf()) await tippe('#dlg .dlg-kopf > button.nzu', '× schließt die Einstellungen.'); T.closeDlg(); },
      async () => { await sage('Tipp: Regelmäßig „💾 Sicherung“ exportieren – dann ist nichts verloren.', 3000); }
    ] }
];

/* ---------- Vorher merken, Vorführseite, Aufräumen, Wiederherstellen ---------- */
const OPTS = ['stiftArt', 'stiftEffekt', 'formAus', 'doppeltipp', 'zuletztHilfe']; /* zuletztHilfe: der Laser im Video zählt nicht als „zuletzt benutzt“ */
function uiAufraeumen() {
  const m = L && L.merk;
  try { T.closePops(); } catch (e) {}
  try { T.schnellWeg && T.schnellWeg(); } catch (e) {}
  try { if (T.formLeisteAuf && T.formLeisteAuf()) T.formLeisteWeg(); } catch (e) {}
  try {
    let f = document.querySelector('#dock .einf-suche');
    if (!f && L && L.gesucht && T.zeigeDock) { T.zeigeDock('einfuegen'); f = document.querySelector('#dock .einf-suche'); }
    if (f && f.value) { f.value = ''; f.dispatchEvent(new Event('input', { bubbles: true })); }
    if (L) L.gesucht = false;
  } catch (e) {}
  try { const dz = document.querySelector('#dock.auf .dkopf button[title="Seitenleiste schließen"]'); if (dz) dz.click(); } catch (e) {}
  try { T.seitenLeiste && T.seitenLeiste(false); } catch (e) {}
  try { T.closeDlg(); } catch (e) {}
  if (m) {
    document.querySelectorAll('.widget').forEach(w => { if (!m.widgets.has(w)) { const z = w.querySelector('.wk-zu'); if (z) z.click(); else w.remove(); } });
    const sp = $('sitzplanBox'); if (sp && !m.sitzplan) { const x = sp.querySelector('.sp-x'); if (x) x.click(); else sp.remove(); }
  }
  document.querySelectorAll('textarea.tafel-tippen').forEach(t => { try { t.blur(); } catch (e) {} });
  if (S.board) { S.sel = null; S.teil = null; try { T.renderOver(); T.placeSelBar && T.placeSelBar(null); } catch (e) {} }
  ringWeg();
}
/* 👤 Datenschutz: Während eines Lernvideos sieht die App nur erfundene Demo-Daten (Klasse „Demo 5a“ mit ausgedachten Vornamen,
   leere Sitzpläne). Lesen von Klassenlisten/Sitzplänen liefert die Demo, Schreiben landet nur in der Demo – die echten Daten
   werden weder gezeigt noch verändert. Nach dem Video (oder bei Abbruch/Neuladen) ist alles wieder wie vorher. */
const DEMO_NAMEN = ['Anni', 'Bela', 'Cem', 'Dina', 'Elias', 'Fenja', 'Goran', 'Hira', 'Ilvy', 'Jano', 'Kaya', 'Lenni', 'Mats', 'Nele', 'Ole', 'Pia', 'Quinn', 'Rieke', 'Sami', 'Tara', 'Ugur', 'Vida', 'Wanda', 'Yaro'];
const DEMO_KLASSE = 'Demo 5a';
const SG = Storage.prototype.getItem, SS = Storage.prototype.setItem, SR = Storage.prototype.removeItem;
let demoAn = false;
function demoDaten(an) {
  if (an === demoAn) return; demoAn = an;
  if (!an) { Storage.prototype.getItem = SG; Storage.prototype.setItem = SS; Storage.prototype.removeItem = SR; return; }
  const demo = { 'tafelapp.klassen': JSON.stringify({ [DEMO_KLASSE]: DEMO_NAMEN }), 'tafelapp.sitzplan': '{}' };
  Storage.prototype.getItem = function (k) { return this === localStorage && Object.prototype.hasOwnProperty.call(demo, k) ? demo[k] : SG.call(this, k); };
  Storage.prototype.setItem = function (k, v) { if (this === localStorage && Object.prototype.hasOwnProperty.call(demo, k)) { demo[k] = String(v); return; } return SS.call(this, k, v); };
  Storage.prototype.removeItem = function (k) { if (this === localStorage && Object.prototype.hasOwnProperty.call(demo, k)) { demo[k] = '{}'; return; } return SR.call(this, k); };
}
function merken() {
  const m = { board: S.board, klasse: S.board.klasse, pages: S.board.pages, page: S.page, hu: T.hist.u.slice(), hr: T.hist.r.slice(), dirty: S.dirty, geaendert: S.board.geaendert,
    inst: S.inst.slice(), tool: S.tool, stiftArt: S.stiftArt, vorLaser: S.vorLaser, radModus: S.radModus, farbe: { ...S.farbe }, groesse: { ...S.groesse },
    opts: Object.fromEntries(OPTS.map(k => [k, T.opts[k]])), widgets: new Set(document.querySelectorAll('.widget')), sitzplan: !!$('sitzplanBox') };
  L.merk = m;
}
/* eigene, leere Vorführseite hinten an – die echten Seiten bleiben unberührt */
function vorfuehrSeite() {
  const m = L.merk;
  S.board.pages = m.pages.slice();
  const np = T.newPage('weiss'); np.titel = '🎬 Lernvideo'; S.board.pages.push(np);
  S.board.klasse = DEMO_KLASSE; /* Sitzplan & Co. zeigen die erfundene Demo-Klasse */
  S.inst = []; S.sel = null; S.teil = null;
  Object.assign(S.farbe, m.farbe); Object.assign(S.groesse, m.groesse);
  S.stiftArt = m.stiftArt === 'laser' ? (m.vorLaser || 'normal') : m.stiftArt; S.radModus = m.radModus;
  T.setTool(m.tool === 'stift' || m.tool === 'marker' ? 'stift' : m.tool || 'stift');
  T.gotoPage(S.board.pages.length - 1);
  for (const k of OPTS) if (m.opts[k] === undefined) delete T.opts[k]; else T.opts[k] = m.opts[k];
}
function wiederherstellen() {
  const m = L.merk;
  if (!S.board || S.board !== m.board) return; /* Tafel inzwischen gewechselt: nichts anfassen */
  S.board.pages = m.pages; if (m.klasse === undefined) delete S.board.klasse; else S.board.klasse = m.klasse;
  T.hist.u.length = 0; T.hist.u.push(...m.hu); T.hist.r.length = 0; T.hist.r.push(...m.hr);
  S.inst = m.inst; S.sel = null; S.teil = null;
  S.stiftArt = m.stiftArt; S.vorLaser = m.vorLaser; S.radModus = m.radModus;
  T.gotoPage(Math.min(m.page, S.board.pages.length - 1));
  Object.assign(S.farbe, m.farbe); Object.assign(S.groesse, m.groesse);
  let opt = false; for (const k of OPTS) { if (T.opts[k] !== m.opts[k]) { opt = true; if (m.opts[k] === undefined) delete T.opts[k]; else T.opts[k] = m.opts[k]; } }
  if (opt && T.saveOpts) T.saveOpts();
  S.board.geaendert = m.geaendert; S.dirty = m.dirty || !!L.gespeichert; /* wurde zwischendurch gespeichert: gleich noch einmal sauber speichern */
  T.setTool(m.tool || 'stift');
  try { T.render(); T.renderOver(); T.updateToolbar(); } catch (e) {}
}

/* ---------- Steuerleiste ---------- */
function steuerBauen() {
  baueUI(); ui.steuer.innerHTML = '';
  const k = (txt, titel, fn, cls) => h('button', { title: titel, class: cls || '', onclick: fn }, txt);
  ui.zahl = h('span', { class: 'lv-zahl' });
  ui.pauseK = k('⏸', 'Pause / weiter (Leertaste)', pauseUm);
  ui.tempoK = k('', 'Tempo umschalten', () => { if (!L) return; L.tempo = L.tempo > 1.2 ? 1 : 1.6; T.opts.lernvideoLangsam = L.tempo > 1.2; T.saveOpts && T.saveOpts(); tempoZeigen(); });
  ui.steuer.append(h('span', { class: 'lv-zahl', style: { fontWeight: 700 } }, '🎬 ' + L.kap.titel), ui.zahl,
    k('⏮', 'Zurück zum vorigen Schritt', () => befehl('zurueck')), ui.pauseK, k('⏭', 'Nächster Schritt', () => { if (L) L.springen = true; }), ui.tempoK,
    k('✕', 'Lernvideo beenden (Esc)', () => befehl('aus')));
  tempoZeigen();
}
function tempoZeigen() { if (ui.tempoK && L) ui.tempoK.textContent = L.tempo > 1.2 ? '🐢 Langsam' : L.tempo < 0.9 ? '⚡ Test' : '▶ Normal'; }
function pauseUm() { if (!L) return; L.pause = !L.pause; ui.pauseK.textContent = L.pause ? '▶' : '⏸'; ui.leiste.classList.toggle('pause', L.pause); }
function zaehler() { if (ui.zahl && L) ui.zahl.textContent = `Schritt ${L.i + 1} / ${L.kap.video.length}`; }
function befehl(art) {
  if (!L || L.aus) return;
  if (art === 'aus') { L.aus = true; L.befehl = { art }; L.gen++; return; }
  if (art === 'zurueck') { const ziel = L.i - (performance.now() - L.schrittStart < 2500 ? 1 : 0); L.befehl = { art, ziel: Math.max(0, ziel) }; L.gen++; }
}

/* ---------- Abspielen ---------- */
async function spiele() {
  let ab = 0, erst = true;
  for (;;) {
    L.befehl = null;
    try {
      if (!erst) { uiAufraeumen(); vorfuehrSeite(); }
      erst = false;
      const kap = L.kap;
      for (let i = 0; i < kap.video.length; i++) {
        L.schnell = i < ab; L.i = i; L.springen = false; L.schrittStart = performance.now(); zaehler();
        try { await kap.video[i](); }
        catch (e) {
          if (e instanceof Halt) throw e;
          console.error('[Lernvideo] ' + kap.id + ' Schritt ' + (i + 1), e); L.fehler.push(kap.id + ' Schritt ' + (i + 1) + ': ' + (e && e.message));
          if (!L.schnell) { ringWeg(); untertitel('Hier hat etwas nicht geklappt – weiter mit dem nächsten Schritt.'); await warte(1500); }
        }
      }
      return 'fertig';
    } catch (e) {
      if (!(e instanceof Halt)) throw e;
      const b = L.befehl; if (!b || b.art === 'aus' || L.aus) return 'aus';
      ab = b.ziel; L.gen++; L.pause = false; if (ui.pauseK) { ui.pauseK.textContent = '⏸'; ui.leiste.classList.remove('pause'); }
    }
  }
}
function endKarte(kap, fertig) {
  baueUI(); ui.zeiger.style.display = 'none'; ringWeg();
  ui.leiste.classList.add('auf', 'ende'); ui.leiste.classList.remove('pause', 'oben'); /* über der Werkzeugleiste – sie bleibt zum Ausprobieren frei */
  ui.text.textContent = fertig ? 'Fertig – jetzt selbst ausprobieren! 👍' : 'Lernvideo beendet.';
  ui.steuer.innerHTML = '';
  const weg = () => { clearTimeout(ui.endT); ui.leiste.classList.remove('auf', 'ende'); ui.steuer.innerHTML = ''; };
  ui.steuer.append(h('button', { class: 'prim', onclick: () => { weg(); T.hilfe(kap.id); } }, '↩ Zurück zur Hilfe'),
    h('button', { onclick: () => { weg(); T.lernvideo(kap.id); } }, '↻ Nochmal'),
    h('button', { onclick: weg }, '✕ Schließen'));
  clearTimeout(ui.endT); ui.endT = setTimeout(weg, 15000);
}
T.lernvideo = (kapId, opt = {}) => {
  const kap = KAP.find(k => k.id === kapId) || KAP[0];
  if (L) befehl('aus');
  if (!S.board) { T.toast('Bitte zuerst eine Tafel öffnen – z. B. „⚡ Leere Tafel“ auf der Startseite.', 4500); return Promise.resolve({ ergebnis: 'keineTafel' }); }
  clearTimeout(ui.endT);
  const l = { kap, gen: 0, i: 0, pause: false, tempo: opt.tempo || (T.opts.lernvideoLangsam ? 1.6 : 1), uebersprungen: [], fehler: [] };
  L = l;
  try { T.closeDlg(); T.closePops(); T.schnellWeg && T.schnellWeg(); } catch (e) {}
  merken(); demoDaten(true); uiAufraeumen(); vorfuehrSeite();
  baueUI(); steuerBauen(); ui.leiste.classList.add('auf'); ui.leiste.classList.remove('pause', 'oben', 'ende'); ui.text.textContent = '🎬 ' + kap.titel;
  zeigerSetzen(innerWidth / 2, innerHeight * 0.55);
  const ende = erg => {
    try { uiAufraeumen(); } catch (e) { console.error(e); }
    try { wiederherstellen(); } catch (e) { console.error('[Lernvideo] Wiederherstellen', e); }
    if (L === l || !L) demoDaten(false);
    const info = { ergebnis: erg, uebersprungen: l.uebersprungen.slice(), fehler: l.fehler.slice() };
    if (L === l) L = null;
    if (L) return info; /* schon ein neues Video gestartet */
    endKarte(kap, erg === 'fertig');
    T.toast(erg === 'fertig' ? 'Fertig – jetzt selbst ausprobieren' : 'Lernvideo beendet – die Tafel ist wie vorher.', 4500);
    return info;
  };
  return spiele().then(ende, e => { console.error('[Lernvideo]', e); l.fehler.push(String(e && e.message)); return ende('fehler'); });
};

/* ---------- Hilfefenster ---------- */
let hilfeKap = null;
function startBereich(k) {
  if (!k.video) return h('p', { class: 'lv-hinweis' }, 'Für dieses Kapitel gibt es nur die Anleitung.');
  if (!S.board) {
    const los = finde('button.loslegen');
    return h('div', { class: 'lv-start' }, h('div', { class: 'lv-hinweis', style: { flexBasis: '100%' } }, 'Bitte zuerst eine Tafel öffnen – das Lernvideo zeigt alles an der echten Tafel.'),
      los ? h('button', { class: 'big prim lv-play', onclick: async () => {
        T.closeDlg(); los.click();
        for (let n = 0; n < 60 && !S.board; n++) await schlaf(100);
        if (S.board) T.lernvideo(k.id); else T.toast('Bitte zuerst eine Tafel öffnen.', 3000);
      } }, '⚡ Leere Tafel öffnen und Video starten') : '');
  }
  const langsam = !!T.opts.lernvideoLangsam;
  const tempo = (an, txt, wert) => h('button', { class: 'big' + (an ? ' on' : ''), onclick: () => { if (wert) T.opts.lernvideoLangsam = true; else delete T.opts.lernvideoLangsam; T.saveOpts && T.saveOpts(); T.hilfe(k.id); } }, txt);
  return h('div', { class: 'lv-start' }, h('button', { class: 'big prim lv-play', onclick: () => T.lernvideo(k.id) }, '▶ Lernvideo abspielen'),
    h('div', { class: 'lv-tempo' }, 'Tempo:', tempo(!langsam, 'Normal', false), tempo(langsam, '🐢 Langsam', true)),
    h('div', { class: 'lv-klein' }, 'Das Video zeigt alles an Ihrer Tafel – auf einer eigenen Vorführseite. Danach ist die Tafel wieder wie vorher. Unten: ⏸ Pause, ⏮ zurück, ⏭ weiter, ✕ beenden (oder Esc).'));
}
T.hilfe = kapId => {
  if (kapId && KAP.some(k => k.id === kapId)) hilfeKap = kapId;
  if (!hilfeKap) hilfeKap = KAP[0].id;
  const nav = h('div', { class: 'lv-kap' }), inhalt = h('div', { class: 'lv-inhalt' });
  const zeichne = () => {
    nav.innerHTML = '';
    nav.append(...KAP.map(k => h('button', { class: k.id === hilfeKap ? 'on' : '', onclick: () => { hilfeKap = k.id; zeichne(); inhalt.scrollTop = 0; } },
      h('span', { class: 'lv-ico' }, k.ico), h('span', { class: 'lv-name' }, k.titel), k.video ? h('span', { class: 'lv-vid', title: 'mit Lernvideo' }, '▶') : '')));
    const k = KAP.find(x => x.id === hilfeKap);
    inhalt.innerHTML = '';
    inhalt.append(h('h3', {}, k.ico + ' ' + k.titel), ...k.text.map(t => h('p', {}, t)), startBereich(k),
      h('h4', {}, 'So geht’s'), h('ol', {}, ...k.schritte.map(s => h('li', {}, s))));
  };
  T.openDlg([h('h2', {}, '❓ Hilfe & Lernvideos'), h('div', { class: 'lv-wrap' }, nav, inhalt)], true);
  $('dlg').classList.add('lv-dlg');
  zeichne();
};
T.hilfeKapitel = () => KAP.map(k => k.id);
})();
