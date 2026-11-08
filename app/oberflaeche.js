// Tafel-App – Oberfläche: Werkzeugleiste, Dialoge, Ablage, Export, Klassen-Werkzeuge
'use strict';
(function () {
const S = T.S, F = T.ablage, $ = id => document.getElementById(id);
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'html') e.innerHTML = v; else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
};
T.h = h;
T.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const toast = (msg, ms = 2600, actions) => {
  const t = $('toast'); t.textContent = msg; t.style.display = 'block';
  if (actions) t.append(h('span', { class: 'toastBtns' }, ...actions.map(([l, fn]) => h('button', { onclick: () => { t.style.display = 'none'; fn(); } }, l)))); clearTimeout(toast.t); toast.t = setTimeout(() => t.style.display = 'none', ms); };
T.toast = toast;

// ---------- Symbole ----------
const sv = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  // Stiftarten – überall dieselben Symbole (Werkzeugleiste, Stift-Menü, Favoriten): Kugelschreiber, Schreibfeder, breiter Textmarker
  stift: sv('<g transform="rotate(-45 12 12)"><path d="M1.5 12L6 10.2v3.6z" fill="currentColor"/><rect x="6" y="10" width="13" height="4" rx="1"/><path d="M19 10.6h1.6a1.4 1.4 0 0 1 0 2.8H19"/><path d="M13 10V8.4h5.5"/></g>'),
  feder: sv('<g transform="rotate(45 12 12)"><path d="M12 22.5L7 13.5Q7 9 9 6.5h6q2 2.5 2 7z"/><path d="M12 22.5V15"/><circle cx="12" cy="13.2" r="1.3"/><rect x="8.5" y="2.5" width="7" height="4" rx="1"/></g>'),
  marker: sv('<g transform="rotate(-45 12 12)"><rect x="8" y="7.5" width="13.5" height="9" rx="1.8"/><path d="M8 9.5H5.8v5H8"/><path d="M5.8 10.4L2.4 12.6v2.2h3.4z" fill="#f2c200" stroke="#c99a00"/></g>'),
  hervor: sv('<g transform="rotate(-45 12 12)"><rect x="1.5" y="10.6" width="12" height="2.8" rx="1.2"/></g><circle cx="18.6" cy="5.4" r="1.9" fill="#ff1744" stroke="#ff1744"/><path d="M18.6 1.2v1M22.8 5.4h-1M21.6 2.4l-.7.7M21.6 8.4l-.7-.7M15.6 2.4l.7.7" stroke="#ff1744"/>'),
  radierer: sv('<path d="M8 20h12"/><path d="M4.5 15.5l9-9a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L13 19H8.2z"/><path d="M9 11l5 5"/>'),
  auswahl: sv('<path d="M4 4l6.5 15 2-6.5 6.5-2z"/><path d="M14 14l5 5"/>'),
  hand: sv('<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'),
  form: sv('<rect x="3" y="12" width="9" height="9" rx="1"/><circle cx="16" cy="8" r="5"/>'),
  text: sv('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'),
  lineal: sv('<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>'),
  geodreieck: sv('<path d="M2 18h20L12 8z"/><path d="M8 18a4 4 0 0 1 8 0"/><path d="M12 18v-3"/>'),
  winkelmesser: sv('<path d="M2 17a10 10 0 0 1 20 0z"/><path d="M12 17l5-6"/><path d="M6 17a6 6 0 0 1 12 0"/>'),
  zirkel: sv('<circle cx="12" cy="4" r="1.6"/><path d="M11.2 5.5L6 20M12.8 5.5L18 20"/><path d="M8 15a8 6 0 0 0 8 0"/>'),
  einfuegen: sv('<path d="M12 2l8 4.5v9L12 20l-8-4.5v-9z"/><path d="M12 11l8-4.5M12 11v9M12 11L4 6.5"/>'),
  classroom: sv('<circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.5 2"/><path d="M9 3h6M12 3v3"/>'),
  aufgaben: sv('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h4M9 6v4M14 8h4M7 16h4M14 15h4M14 17h4"/>'),
  englisch: sv('<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-4 3.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><text x="12" y="11.6" font-size="7.5" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none" font-family="Segoe UI, sans-serif">EN</text>'),
  nawi: sv('<path d="M9 3h6M10 3v6.5L4.6 18.4A1.8 1.8 0 0 0 6.1 21h11.8a1.8 1.8 0 0 0 1.5-2.6L14 9.5V3"/><path d="M7 15h10"/><circle cx="10.5" cy="17.6" r=".9" fill="currentColor"/><circle cx="13.8" cy="18.3" r=".7" fill="currentColor"/>'),
  undo: sv('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
  redo: sv('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
  favoriten: sv('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
  // Besen (schräg): langer gerader Stiel, Bindung, breiter Borstenkopf mit Borsten
  wischen: sv('<g transform="rotate(38 12 12) translate(12 12) scale(.9) translate(-12 -12)"><path d="M12 0.5V11.5"/><rect x="9.6" y="11.5" width="4.8" height="2.6" rx=".6" fill="currentColor"/><path d="M9.8 14.1h4.4l3.3 9H6.5z" fill="currentColor" fill-opacity=".18"/><path d="M10.6 15.2l-1.6 7.4M12 15.2v7.6M13.4 15.2l1.6 7.4"/></g>'),
  links: sv('<path d="M15 5l-7 7 7 7"/>'), rechts: sv('<path d="M9 5l7 7-7 7"/>'), plus: sv('<path d="M12 5v14M5 12h14"/>')
};
T.ICON = I; // auch für die Favoriten
const ikoTxt = (ico, txt) => h('b', { style: { display: 'flex', alignItems: 'center', gap: '8px' }, html: `<span class="ico-k">${I[ico]}</span>` + txt });

// ---------- Werkzeugleiste ----------
// Farben in der Werkzeugleiste: wenige Standardfarben, unter ⚙ Einstellungen frei wählbar (weitere Farben: Regenbogen-Knopf)
const FARBEN = { stift: ['#1a1a1a', '#d32f2f', '#1565c0', '#2e7d32'], marker: ['#ffe14d', '#7ef57e', '#ff8ad8'] };
const MARKER_MEHR = ['#ffe14d', '#7ef57e', '#ff8ad8', '#7fd3ff', '#ffb74d', '#c5a3ff', '#ff6b6b'];
const leisteFarben = art => { const l = T.opts.leisteFarben && T.opts.leisteFarben[art]; return Array.isArray(l) && l.length ? l : FARBEN[art]; };
const MEHR = ['#1a1a1a', '#5f6368', '#9aa0a6', '#ffffff', '#d32f2f', '#e91e63', '#ad1457', '#6a1b9a', '#3949ab', '#1565c0', '#0288d1', '#00838f', '#2e7d32', '#7cb342', '#f9a825', '#ef6c00', '#795548', '#ffe14d', '#7ef57e', '#7fd3ff'];
const GROESSEN = { stift: [2, 4, 8, 14], marker: [16, 28, 44, 64], radierer: [24, 50, 90, 150, 260] };
const STAERKE_NAME = ['S', 'M', 'L', 'XL', 'XXL'];
T.STIFTWAHL = { MEHR, MARKER_MEHR, GROESSEN, STAERKE_NAME }; // für den Stift-Baukasten der Favoriten
const TOOLS = [['stift', 'Stift'], ['hervor', 'Hervorheben'], ['radierer', 'Radierer'], ['auswahl', 'Auswahl'], ['hand', 'Tafel verschieben'], ['form', 'Formen'], ['text', 'Text']];
const INSTR = [['lineal', 'Lineal'], ['geodreieck', 'Geodreieck'], ['winkelmesser', 'Winkel'], ['zirkel', 'Zirkel']];

// Reihenfolge der Werkzeugleiste – unter ⚙ Einstellungen anpassbar (T.opts.leiste); „|“ = Trennstrich
const LEISTE_STD = ['auswahl', 'stift', 'hervor', 'radierer', 'undo', 'redo', 'wischen', 'hand', 'form', 'text', 'favoriten', '|', 'farben', '|', 'groessen', '|',
  'werkzeuge', 'einfuegen', 'aufgaben', 'classroom', '|', 'seiten'];
const LEISTE_NAME = { auswahl: 'Auswahl', stift: 'Stift', hervor: 'Hervorheben', radierer: 'Radierer', undo: 'Zurück', redo: 'Vor', wischen: 'Wischen', hand: 'Tafel verschieben', form: 'Formen', text: 'Text', favoriten: 'Favoriten',
  farben: 'Farben', groessen: 'Stärken', werkzeuge: 'Werkzeuge', einfuegen: 'Einfügen', aufgaben: 'Aufgaben', classroom: 'Classroom', seiten: 'Seiten ◀ 1/3 ▶ Neu', '|': '│' };
function leisteReihenfolge() {
  const o = Array.isArray(T.opts.leiste) ? T.opts.leiste.filter(id => id === '|' || LEISTE_STD.includes(id)) : [];
  if (!o.length) return LEISTE_STD.slice();
  for (const id of LEISTE_STD) if (id !== '|' && !o.includes(id)) o.push(id); // neue Knöpfe hängen hinten an
  return o;
}
function buildToolbar() {
  const tb = $('toolbar'); tb.innerHTML = '';
  const btn = (id, label, icon, fn, title) => h('button', { class: 'tool', id: 't_' + id, title: title || label, onclick: fn, html: icon + `<span>${label}</span>` });
  const TL = Object.fromEntries(TOOLS);
  const teil = id => {
    if (id === '|') return h('div', { class: 'sep' });
    if (TL[id]) return btn(id, TL[id], I[id], ev => toolClick(id, ev.currentTarget));
    switch (id) {
      case 'farben': return [h('div', { id: 'farben', class: 'row', style: { flexWrap: 'nowrap', gap: '5px' } }), h('button', { class: 'sw', id: 'mehrFarben', title: 'Weitere Farben', style: { background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }, onclick: ev => farbPop(ev.currentTarget) })];
      case 'groessen': return h('div', { id: 'groessen', class: 'row', style: { flexWrap: 'nowrap', gap: '0' } });
      case 'werkzeuge': return btn('werkzeuge', 'Werkzeuge', I.geodreieck, () => zeigeDock('werkzeuge', true), 'Lineal, Geodreieck, Zirkel, Rechner, Timer …');
      case 'einfuegen': return btn('einfuegen', 'Einfügen', I.einfuegen, () => zeigeDock('einfuegen', true), 'Grafiken, Vorlagen, Karten, Bilder');
      case 'aufgaben': return btn('aufgaben', 'Aufgaben', I.aufgaben, e => aufgabenKnopf(e), 'Aufgaben des Fachs (Mathe, NaWi) – erscheint in Tafeln, für deren Fach es fertige Aufgaben gibt');
      case 'classroom': return btn('classroom', 'Classroom', I.classroom, () => zeigeDock('classroom', true), 'Phasentimer, Timer, Zufall, Würfel …');
      case 'undo': return btn('undo', 'Zurück', I.undo, T.undo, 'Rückgängig (Strg+Z)');
      case 'redo': return btn('redo', 'Vor', I.redo, T.redo, 'Wiederholen (Strg+Y)');
      case 'wischen': return btn('wischen', 'Wischen', I.wischen, tafelWischen, 'Tafel wischen: Handschrift, Bausteine oder alles');
      case 'favoriten': return btn('favoriten', 'Favoriten', I.favoriten, () => T.paletteZeigen && T.paletteZeigen(!T.opts.palette), 'Favoriten ein-/ausblenden: schwebende Leiste mit Lieblingsstiften und -werkzeugen');
      case 'seiten': return [btn('prev', 'Seite', I.links, () => gotoPage(S.page - 1), 'Vorige Seite'),
        h('button', { class: 'tool seite', id: 'seiteBtn', onclick: ev => seitenPop(ev.currentTarget), title: 'Seiten und Hintergrund' }),
        btn('next', 'Seite', I.rechts, () => gotoPage(S.page + 1), 'Nächste Seite'), btn('neu', 'Neu', I.plus, neueSeite, 'Neue Seite anhängen')];
    }
    return null;
  };
  // ausgeblendete Knöpfe gibt es trotzdem (unsichtbar) – so funktionieren Tastenkürzel und Anzeigen weiter
  const aus = leisteAus(), versteckt = h('div', { style: { display: 'none' } });
  for (const id of leisteReihenfolge()) { const el = teil(id); if (el) (aus.has(id) ? versteckt : tb).append(...[].concat(el)); }
  tb.append(versteckt);
  updateToolbar();
}
T.buildToolbar = buildToolbar;
const leisteAus = () => new Set(Array.isArray(T.opts.leisteAus) ? T.opts.leisteAus.filter(id => LEISTE_STD.includes(id) && id !== '|') : []);
function leisteSpeichern(sichtbar, aus) { T.opts.leiste = sichtbar.concat(aus); T.opts.leisteAus = aus; T.saveOpts(); buildToolbar(); }
function leisteStandard() { delete T.opts.leiste; delete T.opts.leisteAus; T.saveOpts(); buildToolbar(); }
const LEISTE_ICON = { auswahl: '⬚', stift: '✏️', hervor: '🖍', radierer: '🧽', undo: '↶', redo: '↷', wischen: '🧹', hand: '✥', form: '◇', text: 'T', favoriten: '⭐', farben: '🎨', groessen: '●',
  werkzeuge: '📐', einfuegen: '🧩', aufgaben: '🧮', classroom: '⏱', seiten: '📄', '|': '│' };

// ---------- Werkzeugleiste direkt bearbeiten: Kärtchen ziehen (Drag & Drop), × blendet aus, ausgeblendete per Antippen zurück ----------
let leisteEdit = null;
function leisteBearbeiten() {
  T.closePops(); closeDlg(); if (leisteEdit) leisteEdit.remove();
  const tb = $('toolbar'); tb.style.visibility = 'hidden';
  const box = h('div', { id: 'leisteEdit' }); leisteEdit = box; document.body.append(box);
  box.addEventListener('pointerdown', e => e.stopPropagation());
  const zeichne = () => {
    const aus = leisteAus(), sichtbar = leisteReihenfolge().filter(id => !aus.has(id));
    box.innerHTML = '';
    const reihe = h('div', { class: 'le-reihe' }), lager = h('div', { class: 'le-lager' });
    const chip = (id, i) => {
      const c = h('div', { class: 'le-chip' + (id === '|' ? ' trenn' : ''), 'data-id': id, title: 'Ziehen zum Verschieben' }, h('span', { class: 'le-ico' }, LEISTE_ICON[id] || '•'), h('span', {}, id === '|' ? 'Trennstrich' : (LEISTE_NAME[id] || id).replace(' ◀ 1/3 ▶ Neu', '')),
        h('button', { class: 'le-x', title: id === '|' ? 'Trennstrich entfernen' : 'Ausblenden', onclick: e => { e.stopPropagation(); const s = sichtbar.slice(); s.splice(i, 1); leisteSpeichern(s, id === '|' ? [...aus] : [...aus, id]); zeichne(); } }, '×'));
      ziehbar(c); return c;
    };
    sichtbar.forEach((id, i) => reihe.append(chip(id, i)));
    lager.append(h('span', { class: 'le-titel' }, aus.size ? 'Ausgeblendet – antippen zum Einblenden:' : 'Nichts ausgeblendet. × an einem Kärtchen blendet es aus.'),
      ...[...aus].map(id => h('button', { class: 'le-aus', onclick: () => { leisteSpeichern(sichtbar.concat(id), [...aus].filter(x => x !== id)); zeichne(); } }, (LEISTE_ICON[id] || '') + ' ' + (LEISTE_NAME[id] || id).replace(' ◀ 1/3 ▶ Neu', '') + ' ＋')));
    box.append(h('div', { class: 'le-kopf' }, h('b', {}, '✋ Werkzeugleiste anpassen'), h('span', { class: 'hint' }, 'Kärtchen ziehen = verschieben · × = ausblenden'), h('span', { style: { flex: 1 } }),
      h('button', { class: 'big', onclick: () => { leisteSpeichern(sichtbar.concat('|'), [...aus]); zeichne(); } }, '＋ Trennstrich'),
      h('button', { class: 'big', onclick: () => { leisteStandard(); zeichne(); } }, '↺ Standard'),
      h('button', { class: 'big prim', onclick: leisteFertig }, '✓ Fertig')), reihe, lager);
    // Drag & Drop: Kärtchen folgt dem Finger, die anderen rücken beiseite; Loslassen speichert die neue Reihenfolge
    function ziehbar(c) {
      c.addEventListener('pointerdown', e => {
        if (e.target.closest('button')) return; e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch (x) {}
        c.classList.add('zieht');
        const mv = ev => {
          const el = document.elementsFromPoint(ev.clientX, ev.clientY).find(x => x !== c && x.classList && x.classList.contains('le-chip') && x.parentNode === reihe);
          if (!el) return; const r = el.getBoundingClientRect();
          reihe.insertBefore(c, ev.clientX < r.left + r.width / 2 ? el : el.nextSibling);
        };
        const up = () => {
          c.removeEventListener('pointermove', mv); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up); c.classList.remove('zieht');
          leisteSpeichern([...reihe.children].map(x => x.dataset.id), [...leisteAus()]); zeichne();
        };
        c.addEventListener('pointermove', mv); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
      });
    }
  };
  zeichne();
}
function leisteFertig() { if (leisteEdit) leisteEdit.remove(); leisteEdit = null; $('toolbar').style.visibility = ''; buildToolbar(); }
T.leisteBearbeiten = leisteBearbeiten;
// Lange auf die Werkzeugleiste drücken (0,8 s) öffnet das Anpassen – ein kurzer Tipp wirkt wie immer
(() => {
  const tb = $('toolbar'); let t = 0, start = null, gestartet = false;
  tb.addEventListener('pointerdown', e => { start = [e.clientX, e.clientY]; gestartet = false; clearTimeout(t); t = setTimeout(() => { gestartet = true; leisteBearbeiten(); }, 800); }, true);
  tb.addEventListener('pointermove', e => { if (start && Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 12) clearTimeout(t); }, true);
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) tb.addEventListener(ev, () => { clearTimeout(t); start = null; }, true);
  tb.addEventListener('click', e => { if (gestartet) { e.stopPropagation(); e.preventDefault(); gestartet = false; } }, true); // der lange Druck löst keinen Knopf aus
})();
// Einstellungen: Knöpfe umsortieren (◀ ▶), ausblenden (×) und wieder einblenden, Trennstriche, Standard
function leisteAnpassen(box) {
  const aus = leisteAus(), o = leisteReihenfolge().filter(id => !aus.has(id)), neu = () => { box.innerHTML = ''; leisteAnpassen(box); };
  const set = (sichtbar, a = [...aus]) => { leisteSpeichern(sichtbar, a); neu(); };
  box.append(h('div', { class: 'leiste-anpassen' }, ...o.map((id, i) => h('span', { class: 'la-chip' + (id === '|' ? ' trenn' : '') },
    h('button', { title: 'Nach links', disabled: i === 0, onclick: () => { const n = o.slice(); [n[i - 1], n[i]] = [n[i], n[i - 1]]; set(n); } }, '◀'),
    h('b', {}, LEISTE_NAME[id] || id),
    h('button', { title: id === '|' ? 'Trennstrich entfernen' : 'Ausblenden', onclick: () => set(o.filter((_, j) => j !== i), id === '|' ? [...aus] : [...aus, id]) }, '×'),
    h('button', { title: 'Nach rechts', disabled: i === o.length - 1, onclick: () => { const n = o.slice(); [n[i + 1], n[i]] = [n[i], n[i + 1]]; set(n); } }, '▶')))),
    aus.size ? h('div', { class: 'leiste-anpassen', style: { marginTop: '8px' } }, h('span', { class: 'hint' }, 'Ausgeblendet:'), ...[...aus].map(id => h('button', { class: 'big', onclick: () => set(o.concat(id), [...aus].filter(x => x !== id)) }, (LEISTE_NAME[id] || id) + ' ＋'))) : '',
    h('div', { class: 'row', style: { marginTop: '8px' } }, h('button', { class: 'big prim', onclick: leisteBearbeiten }, '✋ Direkt an der Leiste (ziehen)'), h('button', { class: 'big', onclick: () => set(o.concat('|')) }, '＋ Trennstrich'), h('button', { class: 'big', onclick: () => { leisteStandard(); neu(); } }, '↺ Standard')));
}
function curKind() { return S.tool === 'marker' ? 'marker' : S.tool === 'radierer' ? 'radierer' : 'stift'; }
function updateToolbar() {
  for (const [id] of TOOLS) $('t_' + id).classList.toggle('on', S.tool === id);
  const feder = (S.stiftArt === 'laser' ? S.vorLaser : S.stiftArt) === 'kalli';
  const mk = S.tool === 'marker';
  $('t_stift').querySelector('span').textContent = mk ? 'Marker' : feder ? 'Feder' : 'Stift';
  const sIco = mk ? 'marker' : feder ? 'feder' : 'stift', tS = $('t_stift'); // Symbol wechselt mit der Stiftart
  if (tS.dataset.ico !== sIco) { tS.dataset.ico = sIco; const alt = tS.querySelector('svg'); if (alt) alt.outerHTML = I[sIco]; }
  $('t_stift').title = (mk ? 'Textmarker' : feder ? 'Kalligrafie-Feder' : 'Stift') + ' (nochmals tippen: Stift, Feder, Textmarker, Formerkennung, Effekt)';
  $('t_stift').classList.toggle('on', (S.tool === 'stift' && !laserAn()) || mk);
  const hv = $('t_hervor'), hvArt = laserAn() ? 'Laser' : '';
  if (hvArt && T.merkeHilfe) T.merkeHilfe('laser'); // für den Doppeltipp „zuletzt benutzt“
  hv.classList.toggle('on', !!hvArt); hv.classList.toggle('laser', hvArt === 'Laser'); hv.querySelector('span').textContent = hvArt || 'Hervorheben';
  for (const id of ['werkzeuge', 'einfuegen', 'aufgaben', 'classroom']) $('t_' + id).classList.toggle('on', dockArt === id || (id === 'aufgaben' && dockArt === 'mathe-rechenwege'));
  const fa = fachAufgaben(), mathe = !!fa; // „Aufgaben“ nur in Fächern mit fertigen Aufgaben; Symbol des Fachs darüber
  const tA = $('t_aufgaben'); tA.style.display = mathe ? '' : 'none';
  { const ico = fa === 'nawi' ? 'nawi' : fa === 'englisch' ? 'englisch' : 'aufgaben'; if (tA.dataset.ico !== ico) { tA.dataset.ico = ico; const alt = tA.querySelector('svg'); if (alt) alt.outerHTML = I[ico]; }
    tA.title = fa === 'nawi' ? 'NaWi-Aufgaben: Einheiten umrechnen, Formeln anwenden' : fa === 'englisch' ? 'Englisch-Aufgaben: Verben, Zeitformen, Fragen, Steigerung' : fa === 'eigen' ? 'Meine Aufgaben: eigene Aufgaben mit Lösungen anlegen, speichern und auf die Tafel legen' : 'Mathe-Aufgaben, Rechenwege, Funktionsplotter, GeoGebra'; }
  if (!mathe && (dockArt === 'aufgaben' || dockArt === 'mathe-rechenwege')) return schliesseDock();
  if (dockArt === 'werkzeuge') document.querySelectorAll('#dock [data-inst]').forEach(b => b.classList.toggle('on', S.inst.some(i => i.kind === b.dataset.inst)));
  const vb = document.querySelector('#dock [data-vorhang]'); if (vb) vb.classList.toggle('on', !!vorhang);
  document.querySelectorAll('#dock [data-cr]').forEach(b => b.classList.toggle('on', !!(T.crAktiv && T.crAktiv(b.dataset.cr)))); // Scheinwerfer, Lupe, geteilte Tafel
  const k = curKind(), fk = k === 'marker' ? 'marker' : 'stift', fw = $('farben'); fw.innerHTML = '';
  for (const c of leisteFarben(fk)) fw.append(h('button', { class: 'sw' + (S.farbe[fk] === c ? ' on' : ''), style: { background: c }, title: c, onclick: () => { S.farbe[fk] = c; if (S.tool !== fk && S.tool !== 'form' && S.tool !== 'text') setTool(fk); updateToolbar(); T.renderOver(); } }));
  if (!leisteFarben(fk).includes(S.farbe[fk])) fw.append(h('button', { class: 'sw on', style: { background: S.farbe[fk] } }));
  const gw = $('groessen'); gw.innerHTML = '';
  GROESSEN[k].forEach((g, i) => {
    const d = k === 'radierer' ? 8 + i * 6 : Math.min(24, Math.max(4, k === 'marker' ? g / 2.6 : g * 1.5));
    gw.append(h('button', { class: 'sz' + (S.groesse[k] === g ? ' on' : ''), title: (k === 'radierer' ? 'Radiergröße ' : 'Strichstärke ') + STAERKE_NAME[i], onclick: () => { S.groesse[k] = g; updateToolbar(); } },
      h('i', { style: { width: d + 'px', height: d + 'px', background: k === 'radierer' ? 'transparent' : k === 'marker' ? S.farbe.marker : (S.farbe.stift === '#ffffff' ? '#ccc' : S.farbe.stift), border: k === 'radierer' ? '2px solid currentColor' : '' } }),
      h('span', {}, STAERKE_NAME[i])));
  });
  $('t_undo').disabled = !T.hist.u.length; $('t_redo').disabled = !T.hist.r.length;
  if (S.board) {
    const ti = T.page().titel; // Seitentitel statt „Seiten“, wenn vergeben
    $('seiteBtn').innerHTML = `<span style="font-size:17px">${S.page + 1} / ${S.board.pages.length}</span><span class="seite-titel">${ti ? T.esc(ti) : 'Seiten'}</span>`;
    $('t_prev').disabled = S.page === 0; $('t_next').disabled = S.page >= S.board.pages.length - 1;
  }
  T.aufLeiste && T.aufLeiste();
  const fb = $('t_favoriten'); if (fb) fb.classList.toggle('on', !!T.opts.palette); // Favoriten eingeblendet?
  T.paletteNeu && T.paletteNeu(); // schwebende Palette: aktives Werkzeug hervorheben
}
T.onInst = updateToolbar;

// ---------- Seitenleiste (geteiltes Fenster: links Werkzeuge/Einfügen/Aufgaben, rechts die Tafel) ----------
let dockArt = null, dockKnoepfe = []; // dockKnoepfe: Aktionsknöpfe eines Panels für die Kopfzeile neben dem ×
T.dockKopf = (...els) => { dockKnoepfe = els.flat().filter(Boolean); };
const DOCK_TITEL = { werkzeuge: '🛠 Werkzeuge', einfuegen: '🧩 Einfügen', classroom: '🎒 Classroom', 'mathe-rechenwege': '📘 Rechenwege',
  get aufgaben() { const f = fachAufgaben(); return f === 'nawi' ? '🧪 NaWi-Aufgaben' : f === 'englisch' ? '🇬🇧 Englisch-Aufgaben' : f === 'mathe' ? '🧮 Mathe-Aufgaben' : f === 'eigen' ? '⭐ Meine Aufgaben' : '🧮 Aufgaben'; } };
// Aufgaben-Kategorien je Fach (Präfix der Kategorie-Kennung)
const KAT_FACH = k => /^nawi/.test(k) ? 'nawi' : /^eng/.test(k) ? 'englisch' : 'mathe';
// Für welches Fach gibt es fertige Aufgaben? mathe | nawi | alle (schnelle Tafel / Sonstiges) | null (Knopf ausgeblendet)
function fachAufgaben() {
  if (!S.board) return null; const f = S.board.fach || '';
  if (/^mathe/i.test(f)) return 'mathe';
  if (/^(nawi|physik|chemie|biologie|technik|naturwiss)/i.test(f)) return 'nawi';
  if (/^englisch/i.test(f)) return 'englisch';
  if (/^sonstiges/i.test(f)) return S.aufFach || 'alle'; // schnelle Tafel: Fach im Menü über „Aufgaben“ gewählt
  return 'eigen'; // alle anderen Fächer: nur „⭐ Meine Aufgaben“
}
// Schnelle Tafel (Fach „Sonstiges“): „Aufgaben“ öffnet nach oben ein Menü mit allen Fächern, für die es fertige Aufgaben gibt
const AUF_FAECHER = [['mathe', '🧮 Mathe'], ['nawi', '🔬 NaWi · Physik · Chemie · Technik'], ['englisch', '🇬🇧 Englisch'], ['alle', '📚 Alle Fächer']];
function aufgabenKnopf(e) {
  const el = e.currentTarget;
  if (!S.board || !/^sonstiges/i.test(S.board.fach || '') || dockArt === 'aufgaben' || dockArt === 'mathe-rechenwege') { zeigeDock('aufgaben', true); return; }
  openPop(el, h('h4', {}, 'Aufgaben für welches Fach?'), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch' } },
    ...AUF_FAECHER.map(([v, l]) => h('button', { class: 'big' + ((S.aufFach || 'alle') === v ? ' on' : ''), onclick: () => { S.aufFach = v === 'alle' ? null : v; T.closePops(); zeigeDock('aufgaben'); updateToolbar(); } }, l))));
}
// ⧉ Seitenleiste als Schwebemenü: dasselbe Menü in einem verschiebbaren Fenster, das offen bleibt
const dockSchwebe = {};
function dockInhalt(art) {
  dockKnoepfe = [];
  const inhalt = art === 'werkzeuge' ? werkzeugePanel() : art === 'einfuegen' ? einfuegenPanel() : art === 'classroom' ? classroomPanel() : art === 'mathe-rechenwege' ? T.rechenwegePanel() : aufgabenPanel();
  // zweigeteilt (Einfügen, Mathe): links Kategorien untereinander, rechts die Inhalte – breitere Leiste
  const zwei = !!(inhalt && inhalt.links);
  const body = zwei ? h('div', { class: 'dbody zweiteilig' }, h('div', { class: 'zw-links' }, ...inhalt.links), h('div', { class: 'zw-rechts' }, ...[].concat(inhalt.rechts)))
    : h('div', { class: 'dbody' }, ...[].concat(inhalt));
  return { body, zwei, knoepfe: dockKnoepfe };
}
function dockAlsSchwebe(art) {
  schliesseDock(); dockArt = null;
  const w = schwebeMenue('dock-' + art, DOCK_TITEL[art], neu => { dockSchwebe[art] = neu; const r = dockInhalt(art); return [r.knoepfe.length ? h('div', { class: 'row' }, ...r.knoepfe) : '', r.body]; }, art === 'einfuegen' || art === 'aufgaben' ? 760 : 460);
  if (w) { w.classList.add('dock-schwebe'); const alt = w.onclose; w.onclose = () => { delete dockSchwebe[art]; alt && alt(); }; }
  updateToolbar();
}
function zeigeDock(art, umschalten) {
  const dock = $('dock');
  if (dockSchwebe[art] && !(umschalten && dockArt === art)) { dockSchwebe[art](); return; } /* als Schwebemenü offen: dort auffrischen */
  if (umschalten && dockArt === art) return schliesseDock();
  dockArt = art; dock.innerHTML = '';
  const { body, zwei, knoepfe } = dockInhalt(art);
  dock.append(h('div', { class: 'dkopf' }, h('b', {}, DOCK_TITEL[art]), ...knoepfe,
    h('button', { class: 'nzu', title: 'Als Schwebemenü öffnen – verschiebbares Fenster, bleibt offen', onclick: () => dockAlsSchwebe(art) }, '⧉'),
    h('button', { class: 'nzu', title: 'Seitenleiste schließen', onclick: schliesseDock }, '×')), body);
  dock.classList.toggle('breit', zwei); dock.classList.toggle('einf', art === 'einfuegen'); /* Einfügen: Kacheln als schmale Liste untereinander */
  const war = dock.classList.contains('auf');
  if (!war) { dock.classList.add('auf'); document.body.classList.add('dockAuf'); }
  const bw = dock.getBoundingClientRect().width;
  if (T.opts.seite === 'rechts') { // Bedienseite rechts: Leiste liegt rechts über der Tafel, die Tafel rückt nicht
    document.documentElement.style.setProperty('--dockR', bw + 'px');
    if (T.ox) { T.ox = 0; document.documentElement.style.setProperty('--dockW', '0px'); T.render(); T.renderOver(); vorhangPlatz(); }
  } else if (!war || Math.abs(bw - T.ox) > 1) { T.ox = bw; document.documentElement.style.setProperty('--dockW', T.ox + 'px'); T.render(); T.renderOver(); vorhangPlatz(); }
  T.closePops(); updateToolbar();
}
function schliesseDock() {
  dockArt = null; $('dock').classList.remove('auf'); document.body.classList.remove('dockAuf');
  T.ox = 0; document.documentElement.style.setProperty('--dockW', '0px'); document.documentElement.style.setProperty('--dockR', '0px'); T.render(); T.renderOver(); updateToolbar(); vorhangPlatz();
}
// Auf die Tafel getippt: offene Seitenleiste (Einfügen, Werkzeuge, Classroom, Aufgaben …) schließt von selbst – erst nach dem Tippen/Strich,
// damit nichts verrutscht. Schwebemenüs (⧉) bleiben offen.
{ let tafelGriff = false;
  document.getElementById('cOver').addEventListener('pointerdown', () => { tafelGriff = !!dockArt; }, true);
  document.addEventListener('pointerup', () => { if (!tafelGriff) return; tafelGriff = false; setTimeout(() => { if (dockArt) schliesseDock(); }, 0); }, true); }
// Bedienseite (Pult links / rechts): Werkzeugleiste, Zoom-Knöpfe, Minikarte, Seitenleiste und Präsentationssteuerung rücken an diese Seite
const SEITEN = [['mitte', '⬌ Mitte'], ['links', '⬅ Links'], ['rechts', '➡ Rechts']];
function seiteAnwenden() {
  const s = T.opts.seite || 'mitte', b = document.body, dk = $('dock');
  if (dk) { dk.style.transition = 'none'; requestAnimationFrame(() => requestAnimationFrame(() => { dk.style.transition = ''; })); } // nicht quer über die Tafel fliegen
  b.classList.toggle('seite-links', s === 'links'); b.classList.toggle('seite-rechts', s === 'rechts');
  const k = $('navSeite'); if (k) k.title = 'Bedienseite: ' + SEITEN.find(x => x[0] === s)[1].slice(2) + ' – antippen wechselt (Pult links / Mitte / rechts)';
  if (dockArt) { const a = dockArt; schliesseDock(); zeigeDock(a); }
}
function seiteWechseln() {
  const i = SEITEN.findIndex(x => x[0] === (T.opts.seite || 'mitte')), n = SEITEN[(i + 1) % SEITEN.length];
  if (n[0] === 'mitte') delete T.opts.seite; else T.opts.seite = n[0]; T.saveOpts(); seiteAnwenden();
  toast('Bedienseite: ' + n[1].slice(2) + ' – Werkzeugleiste, Zoom und Seitenleiste', 1800);
}
T.seiteAnwenden = seiteAnwenden;
T.zeigeDock = zeigeDock;
function werkzeugePanel() {
  const inst = h('div', { class: 'tiles klein' }, ...INSTR.map(([id, l]) => h('button', { class: 'tile', 'data-inst': id, onclick: () => T.toggleInstrument(id), html: I[id] + `<span>${l === 'Winkel' ? 'Winkelmesser' : l}</span>` })));
  setTimeout(updateToolbar, 0);
  return [h('h3', {}, 'Messen & Zeichnen'), inst, h('p', { class: 'hint' }, 'Antippen blendet ein/aus. Drehen am ↻, Größe mit zwei Fingern oder ↻ kurz antippen.'),
    h('h3', {}, 'Wissenschaftlicher Rechner'), T.rechner()]; // Funktionsplotter: unter Mathe
}
// Classroom-Werkzeuge je Symbol – damit ein Werkzeug aus den Notizen wieder geöffnet werden kann (z. B. nach dem Neuladen)
T.crOeffner = em => { const C = T.CR || {}; return ({ '📋': () => klassenliste(), '⏳': phasenWidget, '⏱': timerWidget, '🏁': C.stoppuhren, '🕘': C.uhr, '🤫': C.arbeit, '🚦': C.ampel, '🔊': C.laut,
  '📊': C.umfrage, '🏆': C.punkte, '🔔': C.quiz, '🎯': zufallWidget, '🎡': C.gluecksrad, '👥': C.gruppen, '🎲': wuerfelWidget, '🔳': C.qr })[em] || null; };
function classroomPanel() {
  /* T._wz: das gerade geöffnete Fenster bekommt „📝 In die Notizen“ */
  const kachel = (em, name, fn, attr) => h('button', { class: 'tile', ...(attr || {}), onclick: () => { T._wz = em; try { fn && fn(); } finally { T._wz = null; } } }, h('div', { class: 'em' }, em), name);
  setTimeout(updateToolbar, 0);
  const C = T.CR || {};
  return [h('h3', {}, 'Klasse'), h('div', { class: 'tiles klein' }, kachel('📋', 'Klassenliste', () => klassenliste())),
    h('h3', {}, 'Zeit'), h('div', { class: 'tiles klein' }, kachel('⏳', 'Phasentimer', phasenWidget), kachel('⏱', 'Timer / Stoppuhr', timerWidget), kachel('🏁', 'Mehrere Stoppuhren', C.stoppuhren), kachel('🕘', 'Uhr & Datum', C.uhr)),
    h('h3', {}, 'Klasse führen'), h('div', { class: 'tiles klein' }, kachel('🤫', 'Arbeits­symbole', C.arbeit), kachel('🚦', 'Ampel', C.ampel), kachel('🔊', 'Lautstärke', C.laut)),
    h('h3', {}, 'Mitmachen'), h('div', { class: 'tiles klein' }, kachel('📊', 'Umfrage', C.umfrage), kachel('🏆', 'Punkte­stand', C.punkte), C.quiz ? kachel('🔔', 'Team-Quiz (Buzzer)', C.quiz) : ''),
    h('h3', {}, 'Zufall & Gruppen'), h('div', { class: 'tiles klein' }, kachel('🎯', 'Namen ziehen', zufallWidget), kachel('🎡', 'Glücksrad', C.gluecksrad), kachel('👥', 'Gruppen bilden', C.gruppen), kachel('🎲', 'Würfel', wuerfelWidget)),
    h('h3', {}, 'Teilen'), h('div', { class: 'tiles klein' }, kachel('🔳', 'QR-Code', C.qr)),
    h('p', { class: 'hint' }, 'Die Werkzeuge öffnen sich als kleine Fenster auf der Tafel und lassen sich an der Titelleiste verschieben. 📝 im Fenster legt das Werkzeug in die offene Notiz (sonst in den Reiter „🎒 Classroom“) – dort läuft es weiter.')];
}
const EMOJIS = [
  ['Lob', ['⭐', '🌟', '✨', '👍', '👏', '🙌', '💪', '💯', '🏆', '🥇', '🥈', '🥉', '🎉', '🎯', '🔥', '🚀', '👑', '🦸', '🌈', '🍀']],
  ['Gesichter', ['😀', '😃', '😊', '🙂', '😎', '🤩', '🥳', '😮', '🤔', '😐', '😕', '🙁', '😢', '😴', '🤫', '🤐', '😡', '🤯', '🙈', '🤝']],
  ['Zeichen', ['✅', '✔️', '❌', '❓', '❗', '‼️', '⚠️', '⛔', '🛑', '➡️', '⬅️', '⬆️', '⬇️', '🔄', '➕', '➖', '✖️', '➗', '🟢', '🔴']],
  ['Schule', ['✏️', '🖊️', '📏', '📐', '📚', '📖', '📝', '📌', '📎', '✂️', '🧮', '🔬', '🧪', '🌍', '🗺️', '⏰', '🔔', '💡', '👀', '👂']],
  ['Natur & Tiere', ['🌞', '🌙', '⛅', '🌧️', '❄️', '🌳', '🌻', '🍎', '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🦁', '🐸', '🐝', '🦋', '🐢']],
  ['Herzen', ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '💖', '💝']]];
function stempelPanel() { // Emojis: auswählen, dann auf die Tafel tippen – jedes Tippen setzt ein Emoji
  const knopf = s => h('button', { class: 'stbtn' + (S.stempel === s && S.tool === 'stempel' ? ' on' : ''), onclick: () => { S.stempel = s; setTool('stempel'); zeigeDock('einfuegen'); toast('Emoji gewählt – jetzt auf die Tafel tippen.', 1800); } }, s);
  const gruppen = EMOJIS.flatMap(([titel, liste]) => [h('h3', {}, titel), h('div', { class: 'stempel' }, ...liste.map(knopf))]);
  return [...gruppen, /* Größe: einfach mit zwei Fingern oder am ⤡ ändern */
    h('p', { class: 'hint' }, 'Emoji wählen, dann auf die Tafel tippen – danach schreibt der Stift wieder. Größe ändern: mit zwei Fingern aufziehen oder am ⤡. Für ein weiteres Emoji es erneut wählen.')];
}
function setTool(id) {
  S.tool = id; if (id !== 'auswahl') S.sel = null; T.overlay.cursor = null;
  updateToolbar(); T.renderOver();
}
function toolClick(id, el) {
  if (id === 'hervor') return hervorPop(el);
  if (id === 'stift' && S.stiftArt === 'laser') { S.stiftArt = S.vorLaser || 'normal'; setTool('stift'); return; } // vom Laser zurück zum Schreiben
  if (id === 'stift' && S.tool === 'marker') return stiftPop(el); // Textmarker aktiv: Stiftmenü zur Auswahl öffnen
  const again = S.tool === id; setTool(id);
  if (id === 'form') formPop(el);
  else if (id === 'radierer' && again) radPop(el);
  else if (id === 'stift' && again) stiftPop(el);
}
// Hervorheben: Laserpointer, Scheinwerfer, Lupe, Vorhang – alles zum Zeigen und Lenken der Aufmerksamkeit
const laserAn = () => S.tool === 'stift' && S.stiftArt === 'laser';
function laserUmschalten(an) {
  if (an) { if (S.stiftArt !== 'laser') S.vorLaser = S.stiftArt; S.stiftArt = 'laser'; toast('Laserpointer: mit dem Stift zeigen – die Spur verschwindet nach 2 s.', 2500); }
  else S.stiftArt = S.vorLaser || 'normal';
  setTool('stift');
}
// ⧉ Klappmenü oder Schwebemenü: inhalt(neu, schwebend, zu) liefert den Inhalt; „zu“ schließt das Klappmenü bzw. frischt das Schwebemenü auf
function popOderSchwebe(id, titel, inhalt, breite) {
  const schwebe = () => schwebeMenue(id, titel, neu => inhalt(neu, true, () => neu()), breite);
  return el => { const neu = () => openPop(el, h('div', { class: 'row', style: { justifyContent: 'flex-end', margin: '-4px 0 4px' } }, alsSchwebe(() => { T.closePops(); schwebe(); })), ...inhalt(neu, false, () => T.closePops())); neu(); };
}
const hervorPop = popOderSchwebe('hervor', '🔦 Hervorheben', hervorInhalt, 600);
function hervorInhalt(neu, schwebend, zu) {
  const C = T.CR || {};
  const k = (an, em, txt, hint, fn) => h('button', { class: 'big' + (an ? ' on' : ''), style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '170px' }, onclick: () => { if (!schwebend) T.closePops(); fn(); if (schwebend) setTimeout(zu, 50); } },
    h('b', {}, em + ' ' + txt), h('span', { style: { fontSize: '13px', color: 'var(--muted)' } }, hint));
  return [h('h4', {}, 'Hervorheben'), h('div', { class: 'row', style: { maxWidth: '560px' } },
    k(laserAn(), '🔴', 'Laserpointer', 'zeigen – Spur verschwindet nach 2 s', () => laserUmschalten(!laserAn())),
    C.scheinwerfer ? k(T.crAktiv('scheinwerfer'), '🔦', 'Scheinwerfer', 'alles dunkel bis auf einen Lichtkreis', C.scheinwerfer) : '',
    C.lupe ? k(T.crAktiv('lupe'), '🔍', 'Lupe', 'vergrößert die Stelle darunter', C.lupe) : '',
    C.leselineal ? k(T.crAktiv('leselineal'), '📖', 'Leselineal', 'nur eine Zeile hell – Zeile für Zeile lesen', C.leselineal) : '',
    T.schwarz ? k(T.schwarzAn(), '⬛', 'Tafel schwarz', 'alles ausblenden – antippen zeigt sie wieder', () => T.schwarz()) : '',
    k(!!vorhang, '🎭', 'Vorhang', 'Tafel abdecken, von den Seiten aufziehen', () => vorhangUmschalten())),
    h('p', { class: 'hint', style: { maxWidth: '520px' } }, 'Nochmals antippen schaltet aus. Zurück zum Schreiben: Stift antippen.')];
}
const stiftPop = popOderSchwebe('stift', '✏️ Stift', stiftInhalt, 680);
function stiftInhalt(neu, schwebend, zu) {
  const marker = S.tool === 'marker';
  const wahl = (art, ico, txt, hint) => h('button', { class: 'big' + (!marker && S.stiftArt === art ? ' on' : ''), style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '190px' }, onclick: () => { S.stiftArt = art; T.opts.stiftArt = art; T.saveOpts(); setTool('stift'); updateToolbar(); zu(); } },
    ikoTxt(ico, txt), h('span', { style: { fontSize: '13px', color: 'var(--muted)' } }, hint));
  const tm = h('button', { class: 'big' + (marker ? ' on' : ''), style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '190px' }, onclick: () => { setTool('marker'); zu(); } },
    ikoTxt('marker', 'Textmarker'), h('span', { style: { fontSize: '13px', color: 'var(--muted)' } }, 'durchsichtig, liegt unter der Schrift'));
  const eff = (v, txt, hint) => h('button', { class: 'big' + ((T.opts.stiftEffekt || '') === v ? ' on' : ''), style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '140px' },
    onclick: () => { if (v) T.opts.stiftEffekt = v; else delete T.opts.stiftEffekt; T.saveOpts(); zu(); toast(v ? 'Effekt für neue Handschrift: ' + txt.replace(/^\S+ /, '') : 'Handschrift ohne Effekt', 2000); } },
    h('b', {}, txt), h('span', { style: { fontSize: '13px', color: 'var(--muted)' } }, hint));
  const formAn = !T.opts.formAus;
  return [h('h4', {}, 'Stiftart'), h('div', { class: 'row' },
    wahl('normal', 'stift', 'Stift', 'druckempfindlich, rund'), wahl('kalli', 'feder', 'Kalligrafie-Feder', 'breite Feder, Schönschrift'), tm),
    h('div', { class: 'row', style: { marginTop: '10px' } }, h('button', { class: 'big' + (formAn ? ' on' : ''), style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
      onclick: () => { T.opts.formAus = formAn; T.saveOpts(); zu(); toast(formAn ? 'Formerkennung aus' : 'Formerkennung an: Kreis, Dreieck, Rechteck oder Linie zeichnen und den Stift kurz halten', 3000); } },
      h('b', {}, '🔷 Formerkennung: ' + (formAn ? 'an' : 'aus')), h('span', { style: { fontSize: '13px', color: 'var(--muted)' } }, 'Form zeichnen, Stift kurz halten → saubere Form')),
      doppelWahl()),
    h('h4', { style: { marginTop: '14px' } }, 'Effekt'), h('div', { class: 'row', style: { maxWidth: '640px' } },
      eff('', '✏️ Ohne Effekt', 'normale Tinte'), eff('schatten', '🌗 Schatten', 'weicher Schatten'), eff('graffiti', '🎨 Graffiti', 'Umriss + Glanz'), eff('neon', '💡 Neon', 'leuchtet – toll auf dunkel')),
    h('p', { class: 'hint', style: { maxWidth: '560px' } }, 'Gilt für neue Handschrift. Schon Geschriebenes: mit „Auswahl“ markieren › 🎨 Effekt.')];
}
// ✌ Doppeltipp direkt im Stift-Menü (neben der Formerkennung) wählen – Auswahlliste wie in den Einstellungen
const HILFE_ANZEIGE = { lineal: '📏 Lineal', geodreieck: '📐 Geodreieck', winkelmesser: '◠ Winkelmesser', scheinwerfer: '🔦 Scheinwerfer', lupe: '🔍 Lupe', leselineal: '📖 Leselineal', vorhang: '🎭 Vorhang', schwarz: '⬛ Tafel schwarz', laser: '🔴 Laserpointer' };
function doppelWahl() {
  const info = h('span', { style: { fontSize: '13px', color: 'var(--muted)' } });
  const zeigeInfo = () => { const v = T.opts.doppeltipp || ''; info.textContent = !v ? 'zwei kurze Tipper mit dem Stift' : v === 'zuletzt' ? 'gerade: ' + HILFE_ANZEIGE[T.opts.zuletztHilfe || 'laser'] : 'nochmals doppelt tippen = zurück/aus'; };
  const sel = h('select', { class: 'feld', style: { fontSize: '16px', padding: '6px 8px', maxWidth: '260px' }, onchange: e => {
    if (e.target.value) T.opts.doppeltipp = e.target.value; else delete T.opts.doppeltipp; T.saveOpts(); zeigeInfo();
    toast(e.target.value ? '✌ Zweimal kurz mit dem Stift tippen: ' + e.target.selectedOptions[0].textContent : 'Doppeltipp aus', 2200); } },
    ...(T.DOPPEL_ZIELE || [['', 'aus']]).map(([v, l]) => h('option', { value: v, selected: (T.opts.doppeltipp || '') === v }, l)));
  zeigeInfo();
  return h('div', { class: 'big' + (T.opts.doppeltipp ? ' on' : ''), style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', cursor: 'default' } },
    h('b', {}, '✌ Doppeltipp'), sel, info);
}
// Effekt für markierte Handschrift ändern (aus der Auswahl-Leiste)
function effektPop(el) {
  const striche = T.page().items.filter(i => S.sel && S.sel.ids.has(i.id) && i.t === 's' && i.m !== 'hl');
  const setze = v => { T.snap(); for (const s of striche) { if (v) s.fx = v; else delete s.fx; } T.render(); T.closePops(); };
  openPop(el, h('h4', {}, '🎨 Effekt für die markierte Handschrift'), h('div', { class: 'row' },
    ...[['', '✏️ Ohne'], ['schatten', '🌗 Schatten'], ['graffiti', '🎨 Graffiti'], ['neon', '💡 Neon']].map(([v, l]) => h('button', { class: 'big', onclick: () => setze(v) }, l))));
}

// ---------- Popover ----------
const pop = $('pop');
let popAnker = null;
function openPop(anchor, ...content) {
  // Erneutes Antippen desselben Knopfes schließt das Menü wieder (nur bei echtem Klick auf den Knopf, nicht beim Auffrischen aus dem Menü heraus)
  const ev = window.event;
  if (pop.style.display === 'block' && popAnker === anchor && ev && ev.type === 'click' && anchor.contains(ev.target)) { T.closePops(); return; }
  popAnker = anchor;
  pop.innerHTML = ''; pop.append(...content); pop.style.display = 'block';
  const r = anchor.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  let x = T.clamp(r.left + r.width / 2 - pw / 2, 10, innerWidth - pw - 10);
  let y = r.top - ph - 12; if (y < 60) y = r.bottom + 12 + ph <= innerHeight - 10 ? r.bottom + 12 : 64; // passt weder oben noch unten: oben am Rand (scrollt innen)
  pop.style.left = x + 'px'; pop.style.top = y + 'px';
}
T.closePops = () => { pop.style.display = 'none'; };
T.openPop = (...a) => openPop(...a);
document.addEventListener('pointerdown', e => { if (pop.style.display === 'block' && !pop.contains(e.target) && !e.target.closest('#toolbar,#topbar')) T.closePops(); }, true);

function farbPop(el) {
  const fk = curKind() === 'marker' ? 'marker' : 'stift';
  const grid = h('div', { class: 'row', style: { maxWidth: '360px' } });
  for (const c of MEHR) grid.append(h('button', { class: 'sw', style: { background: c, width: '48px', height: '48px' }, onclick: () => { S.farbe[fk] = c; T.closePops(); updateToolbar(); } }));
  const inp = h('input', { type: 'color', value: S.farbe[fk], style: { width: '100%', height: '50px', marginTop: '10px' }, oninput: e => { S.farbe[fk] = e.target.value; updateToolbar(); } });
  openPop(el, h('h4', {}, fk === 'marker' ? 'Markerfarbe' : 'Stiftfarbe'), grid, inp);
}
// 🪣 Füllung und Winkelfarbe: gilt für neue Formen; ist eine Form ausgewählt, ändert es auch diese
const FUELL = [[null, 'keine'], ['#fde68a', 'gelb'], ['#bfdbfe', 'blau'], ['#bbf7d0', 'grün'], ['#fecaca', 'rot'], ['#e9d5ff', 'lila'], ['#e5e7eb', 'grau']];
const WFARBE = [[null, 'wie Linie'], ['#dc2626', 'rot'], ['#2563eb', 'blau'], ['#16a34a', 'grün'], ['#ea580c', 'orange'], ['#9333ea', 'lila']];
function formFarbZeilen(neu) {
  const sel = () => S.sel && S.sel.ids ? T.page().items.filter(i => S.sel.ids.has(i.id) && i.t === 's' && i.m === 'line' && !i.an) : [];
  const setzen = (k, v) => {
    S[k === 'fl' ? 'formFuell' : 'winkelFarbe'] = v;
    const s = sel(); if (s.length) { T.snap(); s.forEach(i => { const n = { ...i }; if (v) n[k] = v; else delete n[k]; T.replaceItem(n); }); T.changed && T.changed(); T.render(); }
    neu();
  };
  const reihe = (k, L, akt) => h('div', { class: 'row' }, ...L.map(([c, l]) => h('button', { class: 'big' + ((akt || null) === c ? ' on' : ''), title: l, onclick: () => setzen(k, c),
    style: { display: 'flex', alignItems: 'center', gap: '8px' } }, c ? h('span', { style: { width: '22px', height: '22px', borderRadius: '6px', background: c, border: '1px solid #94a3b8', display: 'inline-block' } }) : '', l)));
  const s1 = sel()[0];
  return [h('h4', { style: { marginTop: '12px' } }, '🪣 Füllung (Dreieck, Viereck, Kreis, Kreiswinkel)'), reihe('fl', FUELL, s1 ? s1.fl : S.formFuell),
    h('h4', { style: { marginTop: '12px' } }, '📐 Winkelfarbe'), reihe('wc', WFARBE, s1 ? s1.wc : S.winkelFarbe)];
}
// ❓ Winkel zuerst verdeckt (Voreinstellung) und auf dieser Seite alle zeigen / alle als „?“
function wkStartBox(neu) {
  const an = T.opts.winkelFrage !== false;
  return h('div', {},
    h('label', { class: 'big', style: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '6px' }, title: 'Neue Winkel erscheinen als „?“ – antippen deckt sie einzeln auf' },
      h('input', { type: 'checkbox', checked: an, style: { width: '24px', height: '24px' }, onchange: e => { if (e.target.checked) delete T.opts.winkelFrage; else T.opts.winkelFrage = false; T.saveOpts(); T.page().wkStart = e.target.checked ? 'frage' : 'zahl'; T.render(); neu(); } }),
      '❓ Winkel zuerst als „?“'),
    h('div', { class: 'row', style: { marginTop: '6px' } },
      h('button', { class: 'big', onclick: () => { T.winkelAlle('zahl'); neu(); } }, '👁 Alle zeigen'),
      h('button', { class: 'big', onclick: () => { T.winkelAlle('frage'); neu(); } }, '❓ Alle als „?“')));
}
// 📏 Maße, Umfang, Flächeninhalt – einzeln zuschaltbar; gilt für neue Formen, ist eine Form gewählt, auch für diese
const MASSE = [['ms', '📏 Seitenlängen / Radius'], ['mu', '⭕ Umfang u'], ['mf', '▦ Flächeninhalt A']];
function masseZeilen(neu) {
  const sel = S.sel && S.sel.ids ? T.page().items.filter(i => S.sel.ids.has(i.id) && i.t === 's' && i.m === 'line' && !i.an) : [];
  const M = S.masse || (S.masse = {});
  return [h('h4', { style: { marginTop: '12px' } }, '📏 Maße'), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch', gap: '4px' } },
    ...MASSE.map(([k, l]) => h('label', { class: 'big', style: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' } },
      h('input', { type: 'checkbox', checked: sel.length ? sel.some(i => i[k]) : !!M[k], style: { width: '24px', height: '24px' }, onchange: e => {
        const an = e.target.checked; M[k] = an;
        if (sel.length) { T.snap(); sel.forEach(i => { const n = { ...i }; if (an) n[k] = 1; else delete n[k]; T.replaceItem(n); }); T.changed && T.changed(); }
        T.render(); T.renderOver(); neu(); } }), l))),
    h('p', { class: 'hint', style: { margin: '4px 0 0' } }, 'Einzelnen Wert antippen: „?“ → leer → Wert. Beim Kreis mit „≈“ (π gerundet).')];
}
// Schaltsymbole: [{ sym, title, an, fn(knopf) }] – ein Tipp schaltet um, eingeschaltet farbig hinterlegt
T.chipZeile = liste => h('div', { class: 'chipzeile' }, ...liste.filter(Boolean).map(c => { const b = h('button', { class: 'chip' + (c.an ? ' on' : ''), title: c.title, onclick: e => c.fn(b, e) }, c.sym); return b; }));
function formChips(g, sel) {
  const pg = T.page(), W = sel.map(i => T.formMasse ? T.formMasse(i) : null);
  const neuBauen = () => { selbar.dataset.key = ''; T.changed && T.changed(); T.render(); T.renderOver(); };
  const schalte = (k, an, wert) => { T.snap(); sel.forEach(i => { const o = pg.items.find(x => x.id === i.id) || i, n = { ...o }; if (an) n[k] = wert == null ? 1 : wert; else delete n[k]; T.replaceItem(n); }); neuBauen(); };
  const hatWinkel = sel.some(i => i.kw || (i.closed && i.p.length >= 3 && i.p.length <= 4) || (!i.closed && i.p.length === 2));
  const zeigtW = !pg.winkelAus && sel.some(i => !i.wkAus) && (sel.some(i => i.wk || i.kw) || pg.items.some(i => i.wk && !i.wkAus));
  const alle = k => sel.every(i => i[k]);
  g.append(T.chipZeile([
    hatWinkel ? { sym: '📐', title: zeigtW ? 'Winkel ausblenden' : 'Winkel anzeigen', an: zeigtW, fn: () => {
      const ids = new Set(sel.map(i => i.id)); T.snap();
      pg.items = pg.items.map(i => ids.has(i.id) ? (zeigtW ? (({ wk, ...r }) => ({ ...r, wkAus: 1 }))(i) : (({ wkAus, ...r }) => ({ ...r, wk: 1 }))(i)) : i);
      if (!zeigtW) delete pg.winkelAus; neuBauen(); } } : null,
    W.some(Boolean) ? { sym: '📏', title: 'Seitenlängen bzw. Radius', an: alle('ms'), fn: () => schalte('ms', !alle('ms')) } : null,
    W.some(w => w && w.u != null) ? { sym: '⭕', title: 'Umfang u', an: alle('mu'), fn: () => schalte('mu', !alle('mu')) } : null,
    W.some(w => w && w.f != null) ? { sym: '▦', title: 'Flächeninhalt A', an: alle('mf'), fn: () => schalte('mf', !alle('mf')) } : null,
    sel.some(i => i.closed || i.kw) ? { sym: '🪣', title: 'Füllung ein/aus (Farbe unter ⋯)', an: alle('fl'), fn: () => schalte('fl', !alle('fl'), S.formFuell || '#fde68a') } : null,
    { sym: '⋯', title: 'Messen & Darstellen: alle Winkel zeigen / als „?“, Füllfarbe, Winkelfarbe', an: false, fn: b => messenPop(b, sel.map(i => i.id)) }]));
}
// ⋯ Messen & Darstellen – das Seltene: Winkel alle zeigen / als „?“, Füllfarbe, Winkelfarbe
function messenPop(el, ids) {
  const neu = () => openPop(el, h('h4', {}, 'Messen & Darstellen'),
    h('div', { class: 'row' }, h('button', { class: 'big', onclick: () => { T.winkelAlle('zahl', ids); neu(); } }, '👁 Alle Winkel zeigen'), h('button', { class: 'big', onclick: () => { T.winkelAlle('frage', ids); neu(); } }, '❓ Alle Winkel als „?“')),
    h('div', { class: 'row', style: { marginTop: '6px' } }, h('span', { class: 'hint', style: { margin: 0, alignSelf: 'center' } }, 'Ganze Seite:'),
      h('button', { class: 'big', onclick: () => { T.winkelAlle('zahl'); neu(); } }, '👁 zeigen'), h('button', { class: 'big', onclick: () => { T.winkelAlle('frage'); neu(); } }, '❓ als „?“')),
    ...formFarbZeilen(neu));
  neu();
}
function formFarbPop(el) { openPop(el, ...formFarbZeilen(() => formFarbPop(el))); }
function formInhalt(neu, schwebend) {
  // links: Formen untereinander, nach Art getrennt – rechts: Linienart, Winkel, Füllung, Winkelfarbe
  const wahl = (id, l, hinweis) => h('button', { class: 'fm-k' + (S.form === id ? ' on' : ''), onclick: () => { S.form = id; if (S.tool !== 'form') setTool('form'); T.verbinderZuruecksetzen && T.verbinderZuruecksetzen(); if (hinweis) toast(hinweis, 3500); neu(); } }, l); /* Menü bleibt offen – Linienart, Farben gleich dazu wählen */
  const kat = t => h('div', { class: 'fm-kat' }, t);
  const K3 = [['wuerfel', '🧊 Würfel'], ['quader', '▭ Quader'], ['prisma', '△ Dreiecksprisma'], ['pyramide', '◮ Pyramide'], ['zylinder', '⌭ Zylinder'], ['kegel', '▲ Kegel'], ['kugel', '● Kugel']].filter(([k]) => T.BAUSTEINE[k]);
  const links = h('div', { class: 'fm-links' },
    kat('Linien'), ...[['linie', '╱ Linie'], ['strecke', '•—• Strecke'], ['strahl', '•— Strahl'], ['pfeil', '➝ Pfeil']].map(([id, l]) => wahl(id, l)),
    kat('Flächen'), ...[['rechteck', '▭ Rechteck'], ['dreieck', '△ Dreieck'], ['trapez', '⏢ Trapez'], ['parallelogramm', '▱ Parallelogramm'], ['raute', '◇ Raute'], ['kreis', '⊙ Kreis / Kreiswinkel'], ['ellipse', '⬭ Ellipse']].map(([id, l]) => wahl(id, l)),
    kat('3D-Körper'), ...K3.map(([k, l]) => wahl('3d:' + k, l, 'Körper aufziehen – Maße, Ecken und Kanten danach im Kontextmenü „✏️ Bearbeiten“')),
    kat('Verbinden (haftet an zwei Elementen)'), ...[['verbinder', '⤳ Verbindungspfeil'], ['verbinderLinie', '— Verbindungslinie'], ['verbinderPunkte', '•—• Linie mit Punkten']].map(([id, l]) => wahl(id, l, 'Erstes Element antippen (Zettel, Text, Baustein, Bild), dann das zweite.')));
  // Linienart (gilt für neue Formen und Verbindungen; ist etwas ausgewählt, ändert sie auch dessen Linien)
  const LA = [['voll', '━━ durchgezogen'], ['strich', '╍╍ gestrichelt'], ['punktstrich', '─·─ Strichpunkt'], ['punkt', '┈┈ gepunktet']];
  const laRow = h('div', { class: 'row' }, ...LA.map(([v, l]) => h('button', { class: 'big' + ((S.linienArt || 'voll') === v ? ' on' : ''), onclick: () => {
    S.linienArt = v;
    const sel = S.sel && S.sel.ids ? T.page().items.filter(i => S.sel.ids.has(i.id) && i.t === 's' && i.m === 'line') : [];
    if (sel.length) { T.snap(); sel.forEach(i => { const n = { ...i }; if (v === 'voll') delete n.ls; else n.ls = v; T.replaceItem(n); }); T.render(); }
    neu(); } }, l)));
  const wkBox = h('label', { class: 'big', style: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '8px' }, title: 'Zeigt bei neuen Linien den Winkel zu anschließenden oder kreuzenden Linien, bei Dreieck und Vierecken die Innenwinkel' },
    h('input', { type: 'checkbox', checked: !!S.winkelZeigen || (!T.page().winkelAus && T.page().items.some(i => i.wk)), style: { width: '24px', height: '24px' }, onchange: e => {
      S.winkelZeigen = e.target.checked;
      const pg = T.page(); if (S.winkelZeigen) delete pg.winkelAus; else pg.winkelAus = true; /* Häkchen weg = alle Winkel dieser Seite ausblenden (wieder an = wieder sichtbar) */
      const sel = S.sel && S.sel.ids ? pg.items.filter(i => S.sel.ids.has(i.id) && i.t === 's' && i.m === 'line' && !i.an) : [];
      if (sel.length && S.winkelZeigen) { T.snap(); sel.forEach(i => T.replaceItem({ ...i, wk: 1 })); }
      T.changed && T.changed(); T.render(); } }), '📐 Winkel anzeigen');
  const rechts = h('div', { class: 'fm-rechts' }, schwebend ? '' : h('div', { class: 'row', style: { justifyContent: 'flex-end', marginBottom: '6px' } }, alsSchwebe(() => { T.closePops(); formSchwebe(); })), h('h4', {}, 'Linienart'), laRow, ...(ff => [ff[0], ff[1], ff[2], wkBox, ff[3]])(formFarbZeilen(neu)), /* Voreinstellungen (Winkel zuerst „?“, Maße für neue Formen): ⚙ Einstellungen › Formen & Messen */ /* „Winkel anzeigen“ steht bei der Winkelfarbe */
    h('p', { class: 'hint', style: { marginTop: '12px' } }, 'Nach dem Zeichnen einer Form schreibt der Stift wieder; mit dem Finger antippen: Menü, verschieben, Ecken ziehen. Linien rasten bei 45° ein. Kreis vom Mittelpunkt aus ziehen; Kreis antippen und den orangen Randpunkt ziehen = Kreiswinkel. Formen antippen: Ecken ziehen.'));
  return [h('div', { class: 'fm-wrap' }, links, rechts)];
}
function formPop(el) { const neu = () => openPop(el, ...formInhalt(neu, false)); neu(); }
function formSchwebe() { schwebeMenue('formen', '◇ Formen', neu => formInhalt(neu, true), 800); }
const radPop = popOderSchwebe('radierer', '🧽 Radierer', radInhalt, 460);
function radInhalt(neu, schwebend, zu) {
  return [h('h4', {}, 'Radierer'), h('div', { class: 'row' },
    h('button', { class: 'big' + (S.radModus === 'teil' ? ' on' : ''), onclick: () => { S.radModus = 'teil'; setTool('radierer'); zu(); } }, 'Stellen radieren'),
    h('button', { class: 'big' + (S.radModus === 'strich' ? ' on' : ''), onclick: () => { S.radModus = 'strich'; setTool('radierer'); zu(); } }, 'Ganze Striche'),
    h('button', { class: 'big warn', onclick: () => { if (!schwebend) T.closePops(); seiteLeeren(); } }, '🗑 Seite leeren'))];
}
// Vorschau-Kachel eines Hintergrunds (CSS): Tafelfarbe + Muster, Linien auf dunkel in zartem Weiß
function bgVorschau(b) {
  const g = T.TAFELFARBEN.find(f => f[0] === b.farbe)[2], dk = b.dunkel;
  const L = dk ? 'rgba(255,255,255,.3)' : '#a9c4dc', K = dk ? 'rgba(255,255,255,.55)' : '#7fa3c4', B = dk ? 'rgba(255,255,255,.06)' : '#eef4fa', N = dk ? 'rgba(255,255,255,.6)' : '#777';
  switch (b.muster) {
    case 'kariert': return `repeating-linear-gradient(0deg,${L} 0 1px,transparent 1px 8px),repeating-linear-gradient(90deg,${L} 0 1px,${g} 1px 8px)`;
    case 'liniert': return `repeating-linear-gradient(0deg,${L} 0 1px,${g} 1px 14px)`;
    case 'lineatur': return `repeating-linear-gradient(0deg,${K} 0 1px,${B} 1px 9px,${K} 9px 10px,${g} 10px 22px)`;
    case 'punkte': return `radial-gradient(${dk ? 'rgba(255,255,255,.7)' : '#9fb3c8'} 1.2px,${g} 1.4px) 0 0/10px 10px`;
    case 'noten': return `repeating-linear-gradient(0deg,${N} 0 1px,${g} 1px 5px)`;
  }
  return g;
}
function seitenPop(el) {
  const bgs = h('div', { class: 'row' });
  // drei Reihen: Weiß, Schwarz, Grün – jeweils leer, kariert, liniert, Schreiblinien, Punkte, Notenlinien
  bgs.style.flexDirection = 'column'; bgs.style.alignItems = 'stretch';
  for (const [f, fn] of T.TAFELFARBEN) bgs.append(h('div', { class: 'row bgreihe' }, h('span', { class: 'bgreihe-name' }, fn),
    ...T.HINTERGRUENDE.filter(b => b.farbe === f).map(b => h('button', { class: 'bgtile' + (T.page().bg === b.id ? ' on' : ''), title: b.name, style: { background: bgVorschau(b), color: b.dunkel ? '#fff' : '#223' },
      onclick: () => { T.snap(); T.page().bg = b.id; T.page().abstand = null; T.render(); autoInk(); seitenPop(el); } }, (T.MUSTER.find(m => m[0] === b.muster) || [, ''])[1]))));
  const A = T.ABSTAND[T.page().bg], abRow = h('div', { class: 'row', style: { maxWidth: '520px' } });
  if (A) {
    const cur = T.page().abstand || A.std, setze = v => { v = T.clamp(+v || A.std, 1, 60); T.snap(); T.page().abstand = v === A.std ? null : v; T.render(); seitenPop(el); };
    for (const v of A.opts) abRow.append(h('button', { class: 'big' + (v === cur ? ' on' : ''), onclick: () => setze(v) }, T.zahl(v, 1) + ' mm'));
    const inp = h('input', { type: 'text', class: 'feld', value: String(cur).replace('.', ','), inputmode: 'decimal', style: { width: '110px' }, title: 'Eigener Wert in mm' });
    inp.addEventListener('change', () => setze(String(inp.value).replace(',', '.')));
    abRow.append(inp, h('span', { class: 'hint' }, 'mm'));
  }
  // Inhaltsverzeichnis: Vorschaubild, Nummer, Titel – antippen springt hin, ◀ ▶ sortiert um
  const nav = h('div', { class: 'seiten-liste' });
  const schiebe = (i, d) => { const j = i + d, P = S.board.pages; if (j < 0 || j >= P.length) return; T.snap(); [P[i], P[j]] = [P[j], P[i]]; if (S.page === i) S.page = j; else if (S.page === j) S.page = i; updateToolbar(); seitenPop(el); };
  // Mehrere Seiten wählen und auf einmal löschen (das Menü bleibt offen); 🗑 an jeder Karte löscht sofort (↶ Zurück stellt wieder her)
  const P = S.board.pages; if (seitenWahl) for (const p of [...seitenWahl]) if (!P.includes(p)) seitenWahl.delete(p);
  P.forEach((p, i) => {
    const titel = h('input', { type: 'text', class: 'seite-name', value: p.titel || '', placeholder: 'Titel …', onclick: e => e.stopPropagation(),
      onchange: e => { p.titel = e.target.value.trim() || undefined; if (!p.titel) delete p.titel; T.changed(); updateToolbar(); } });
    const n = p.items.reduce((m, it) => Math.max(m, it.auf || 0), 0), gew = seitenWahl && seitenWahl.has(p);
    nav.append(h('div', { class: 'seite-karte' + (i === S.page && !seitenWahl ? ' on' : '') + (gew ? ' gewaehlt' : ''), onclick: () => {
        if (seitenWahl) { gew ? seitenWahl.delete(p) : seitenWahl.add(p); seitenPop(el); return; }
        gotoPage(i); T.closePops(); } },
      h('div', { class: 'seite-bild' }, seitenBild(p), h('b', { class: 'seite-nr' }, String(i + 1)), n ? h('span', { class: 'seite-auf', title: n + ' Aufdeck-Schritte' }, '✨' + n) : '',
        seitenWahl ? h('span', { class: 'seite-haken' + (gew ? ' an' : '') }, gew ? '✓' : '') : h('button', { class: 'seite-weg', title: 'Diese Seite löschen (↶ Zurück stellt sie wieder her)', onclick: e => { e.stopPropagation(); seitenEntfernen([p]); seitenPop(el); } }, '🗑')),
      titel, h('div', { class: 'seite-pfeile' }, h('button', { title: 'Nach vorne', disabled: i === 0, onclick: e => { e.stopPropagation(); schiebe(i, -1); } }, '◀'), h('button', { title: 'Nach hinten', disabled: i === P.length - 1, onclick: e => { e.stopPropagation(); schiebe(i, 1); } }, '▶'))));
  });
  const wahlLeiste = seitenWahl
    ? h('div', { class: 'row seiten-wahl' }, h('b', {}, `${seitenWahl.size} von ${P.length} ausgewählt`),
        h('button', { class: 'big', onclick: () => { seitenWahl = new Set(seitenWahl.size === P.length ? [] : P); seitenPop(el); } }, seitenWahl.size === P.length ? 'Keine' : 'Alle'),
        h('button', { class: 'big warn', disabled: !seitenWahl.size, onclick: async () => {
          const n = seitenWahl.size; if (!await frage(`${n} Seite${n === 1 ? '' : 'n'} löschen? (↶ Zurück stellt sie wieder her)`, { ok: '🗑 Löschen' })) return;
          seitenEntfernen([...seitenWahl]); seitenWahl = null; seitenPop(el); } }, `🗑 Ausgewählte löschen`),
        h('button', { class: 'big prim', onclick: () => { seitenWahl = null; seitenPop(el); } }, 'Fertig'))
    : h('div', { class: 'row seiten-wahl' }, h('button', { class: 'big', title: 'Mehrere Seiten antippen und auf einmal löschen', onclick: () => { seitenWahl = new Set(); seitenPop(el); } }, '☑ Seiten auswählen'),
        h('span', { class: 'hint' }, 'Karte antippen = zur Seite · 🗑 an der Karte = Seite löschen'));
  openPop(el, h('h4', {}, '📑 Seiten – Inhaltsverzeichnis'), wahlLeiste, nav, h('div', { class: 'row' },
    h('button', { class: 'big', onclick: () => { T.closePops(); neueSeite(); } }, '＋ Neue Seite'),
    h('button', { class: 'big', onclick: () => { T.closePops(); seiteDuplizieren(); } }, '⧉ Seite duplizieren'),
    h('button', { class: 'big', onclick: () => { T.closePops(); T.resetView(); } }, '⌂ Ansicht 100 %'),
    T.CR && T.CR.teilung ? h('button', { class: 'big' + (T.crAktiv('teilung') ? ' on' : ''), title: 'Tafel in 2 oder 3 Bereiche teilen – mehrere schreiben gleichzeitig', onclick: () => { T.closePops(); T.CR.teilung(); } }, T.crAktiv('teilung') ? '◫ Teilung beenden' : '◫ Geteilte Tafel') : '',
    h('button', { class: 'big', title: 'Diese Seite als Vorlage speichern', onclick: () => { T.closePops(); T.vorlageSpeichern(); } }, '⭐ Als Vorlage'),
    h('button', { class: 'big', title: 'Neue Seite aus einer gespeicherten Vorlage', onclick: () => { T.closePops(); T.vorlageWaehlen(); } }, '📋 Aus Vorlage'),
    h('button', { class: 'big warn', onclick: () => { T.closePops(); seiteLoeschen(); } }, '🗑 Seite löschen')),
  h('h4', { style: { marginTop: '14px' } }, 'Hintergrund dieser Seite'), bgs,
  A ? h('h4', { style: { marginTop: '14px' } }, A.l + ' (bei 100 % Ansicht echte Maße)') : '', A ? abRow : '');
}
// kleines Vorschaubild einer Seite (alles, was darauf steht, eingepasst)
function seitenBild(pg, W = 168, H = 104) {
  const c = h('canvas', { width: W * 2, height: H * 2, style: { width: W + 'px', height: H + 'px' } }), ctx = c.getContext('2d');
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of pg.items) { const b = T.bbox(it); x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1); }
  if (!isFinite(x0)) { x0 = 0; y0 = 0; x1 = 1200; y1 = 750; }
  const m = Math.max(x1 - x0, y1 - y0) * 0.06; x0 -= m; y0 -= m; x1 += m; y1 += m;
  const s = Math.min(W * 2 / (x1 - x0), H * 2 / (y1 - y0)), ox = (W * 2 - (x1 - x0) * s) / 2, oy = (H * 2 - (y1 - y0) * s) / 2;
  ctx.setTransform(s, 0, 0, s, ox - x0 * s, oy - y0 * s);
  try { T.paintPage(ctx, pg, { x0: x0 - ox / s, y0: y0 - oy / s, x1: x1 + ox / s, y1: y1 + oy / s }, 1 / s, { export: true }); } catch (e) {}
  return c;
}
T.seitenBild = seitenBild;
function autoInk() { // Schwarz/Weiß passend zum Hintergrund
  const dark = T.isDark(T.page());
  if (dark && S.farbe.stift === '#1a1a1a') S.farbe.stift = '#ffffff';
  if (!dark && S.farbe.stift === '#ffffff') S.farbe.stift = '#1a1a1a';
  updateToolbar(); T.render();
}

// ---------- Seiten ----------
function gotoPage(i) {
  if (!S.board || i < 0 || i >= S.board.pages.length) return;
  S.page = i; S.sel = null; T.render(); T.renderOver(); updateToolbar(); autoInk(); zoomInfo();
}
T.onPage = () => { updateToolbar(); zoomInfo(); };
T.gotoPage = i => gotoPage(i);
function neueSeite() { T.snap(); const bg = T.page().bg, np = T.newPage(bg); np.abstand = T.page().abstand || null; S.board.pages.splice(S.page + 1, 0, np); gotoPage(S.page + 1); toast('Neue Seite ' + (S.page + 1)); }
function seiteDuplizieren() {
  T.snap(); const p = T.page(), neuId = new Map(p.items.map(it => [it.id, T.uid()]));
  const items = p.items.map(it => ({ ...it, id: neuId.get(it.id), ...(it.an ? { an: T.anMap(it.an, i => neuId.get(i) || i) } : {}) })); // Verbindungspfeile haften an den Kopien
  S.board.pages.splice(S.page + 1, 0, { bg: p.bg, abstand: p.abstand || null, items, view: { ...p.view } }); gotoPage(S.page + 1);
}
let seitenWahl = null; // Auswahlmodus im Seiten-Menü (Set der gewählten Seiten)
function seitenEntfernen(liste) {
  const P = S.board.pages, akt = P[S.page]; T.snap();
  S.board.pages = P.filter(p => !liste.includes(p));
  if (!S.board.pages.length) S.board.pages = [T.newPage(akt ? akt.bg : undefined)]; // eine leere Seite bleibt immer
  const i = S.board.pages.indexOf(akt); gotoPage(i >= 0 ? i : Math.min(S.page, S.board.pages.length - 1)); T.changed && T.changed();
  toast(`🗑 ${liste.length} Seite${liste.length === 1 ? '' : 'n'} gelöscht – ↶ Zurück stellt sie wieder her.`, 2500);
}
async function seiteLoeschen() {
  if (!await frage('Diese Seite löschen? (Rückgängig ist möglich)', { ok: '🗑 Löschen' })) return;
  T.snap(); if (S.board.pages.length === 1) S.board.pages[0] = T.newPage(T.page().bg); else S.board.pages.splice(S.page, 1);
  gotoPage(Math.min(S.page, S.board.pages.length - 1));
}
function wischAnimation() { const w = $('wisch'); w.classList.remove('los'); void w.offsetWidth; w.classList.add('los'); }
// Wischen mit Auswahl: nur Handschrift, nur Bausteine & Bilder oder alles
function tafelWischen(ev) {
  const pg = T.page(), schrift = pg.items.filter(it => it.t === 's').length, objekte = pg.items.length - schrift;
  if (!pg.items.length) { toast('Die Tafel ist schon sauber.'); return; }
  const wische = (filter, text) => { T.closePops(); T.snap(); T.page().items = T.page().items.filter(filter); S.sel = null; wischAnimation();
    setTimeout(() => { T.render(); T.renderOver(); }, 200); toast(text, 5000, [['↶ Zurück', T.undo]]); };
  const knopf = (txt, n, fn) => h('button', { class: 'big', disabled: !n, style: { justifyContent: 'flex-start', textAlign: 'left' }, onclick: fn }, txt, h('span', { class: 'hint', style: { marginLeft: '8px' } }, n ? `(${n})` : '(nichts da)'));
  openPop(ev && ev.currentTarget || $('t_wischen'), h('h4', {}, 'Was soll weggewischt werden?'), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch', minWidth: '280px' } },
    knopf('✍ Nur Handschrift', schrift, () => wische(it => it.t !== 's', 'Handschrift gewischt – Bausteine bleiben stehen.')),
    knopf('🧩 Nur Bausteine & Bilder', objekte, () => wische(it => it.t === 's', 'Bausteine und Bilder entfernt – Handschrift bleibt.')),
    h('button', { class: 'big warn', onclick: () => wische(() => false, 'Seite komplett gewischt.') }, '🗑 Alles')));
}
function seiteLeeren() { if (!T.page().items.length) return; T.snap(); T.page().items = []; S.sel = null; T.render(); T.renderOver(); toast('Seite geleert – mit „Zurück“ wiederherstellbar'); }

// ---------- Zoom-Anzeige ----------
function zoomInfo() { if (!S.board) return; $('zoomInfo').textContent = Math.round(T.page().view.z * 100) + ' %'; }
// Navigation: Zoom um die Mitte der sichtbaren Tafel, „Alles zeigen“, „Start“
const tafelMitte = () => [T.ox + (innerWidth - T.ox) / 2, 56 + (innerHeight - 56 - 100) / 2];
T.allesZeigen = () => {
  const pg = T.page(); if (!pg.items.length) { T.resetView(); return; }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of pg.items) { const b = T.bbox(it); x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1); }
  const aw = innerWidth - T.ox - 120, ah = innerHeight - 56 - 140, v = pg.view;
  v.z = T.clamp(Math.min(aw / Math.max(1, x1 - x0), ah / Math.max(1, y1 - y0), 2), 0.03, 8);
  const [cx, cy] = tafelMitte(); v.x = cx - T.ox - (x0 + x1) / 2 * v.z; v.y = cy - (y0 + y1) / 2 * v.z;
  T.render(); T.renderOver(); zoomInfo();
};
$('navAlles').onclick = T.allesZeigen;
$('navHome').onclick = () => T.resetView();
if ($('navSeite')) $('navSeite').onclick = seiteWechseln;
seiteAnwenden();
$('navPlus').onclick = () => { const [x, y] = tafelMitte(); T.zoomAt(x, y, 1.25); };
$('navMinus').onclick = () => { const [x, y] = tafelMitte(); T.zoomAt(x, y, 0.8); };
T.onZoom = zoomInfo;
$('zoomInfo').onclick = () => { const [x, y] = tafelMitte(); T.zoomAt(x, y, 1 / T.page().view.z); }; // zurück auf 100 %, Mitte bleibt

// ---------- Auswahl-Leiste ----------
const selbar = $('selbar');
// Kontextmenü in Stufen: 0 = nur ☰ neben dem Objekt, 1 = was zum Objekt gehört (Form-Symbole, Baustein, Feld), 2 = alles (Bearbeiten, Kopieren, Anordnen …)
let selStufe = 0, selStufeIds = '';
T.selMenueZu = () => { if (selStufe) { selStufe = 0; selbar.dataset.key = ''; } }; /* Objekt erneut angetippt: Menü wieder klein */
T.placeSelBar = anchor => {
  if (!anchor || !S.sel) { selbar.style.display = 'none'; return; }
  const v = T.page().view, x = (anchor.x0 + anchor.x1) / 2 * v.z + v.x + T.ox, y = anchor.y0 * v.z + v.y;
  const items = T.page().items.filter(it => S.sel.ids.has(it.id)), one = items.length === 1 && items[0].t === 'o' ? items[0] : null;
  const teil = one && S.teil && S.teil.oid === one.id ? S.teil.id : null, Bk = one && T.BAUSTEINE[one.k];
  const alleFest = items.length && items.every(i => i.fest);
  const idsK = items.map(i => i.id).join(); if (idsK !== selStufeIds) { selStufeIds = idsK; selStufe = 0; } /* neue Auswahl: Menü zu */
  if (teil && selStufe < 1) selStufe = 1; /* Feld angetippt: Feld-Menü gleich zeigen */
  const key = items.map(i => i.id + (i.t === 's' ? (i.kw ? 'k' : '') + (i.wk ? 'w' : '') + (i.wkAus ? 'a' : '') : '')).join() + (T.page().winkelAus ? 'W' : '') + (one ? one.k + (one.r ? 'r' : '') + ((one.d && one.d.art) || '') + ((one.d && (one.d.form || one.d.koerper)) || '') : '') + (alleFest ? 'f' : '') + '|' + (teil || '') + '|s' + selStufe;
  if (selbar.dataset.key !== key) {
    selbar.dataset.key = key; selbar.innerHTML = '';
    const akt = () => T.page().items.find(i => i.id === one.id); // immer die aktuelle Fassung des Bausteins
    // Kontextmenü als Liste untereinander, nach Kategorien gruppiert, getrennt durch Linien
    const gruppe = (titel, cls) => { if (selbar.querySelector('.selgruppe')) selbar.append(h('div', { class: 'sel-trenner' })); const g = h('div', { class: 'selgruppe' + (cls ? ' ' + cls : '') }, titel ? h('div', { class: 'sel-titel' }, titel) : ''); selbar.append(g); return g; };
    const knopf = (g, t, fn, title, cls) => { const k = h('button', { onclick: fn, title, class: cls || '' }, t); g.append(k); return k; };
    const stufe = n => { selStufe = n; selbar.dataset.key = ''; T.renderOver(); };
    const linienSel = items.filter(i => i.t === 's' && i.m === 'line' && !i.an);
    const satz = T.page().aufgabenSatz, imSatz = !!(satz && items.some(i => i.ag === satz.ag));
    const istBild = !!(one && one.k === 'bild'), puz = istBild && one.d && (one.d.puzzle || one.d.puzzleRahmen);
    const spezifisch = (!alleFest && !!(linienSel.length || (teil && Bk && Bk.teil) || (Bk && Bk.schnell) || imSatz || istBild)) || !!puz;
    selbar.classList.toggle('zu', selStufe === 0);
    if (selStufe === 0) selbar.append(h('button', { class: 'sel-auf', title: 'Menü öffnen', onclick: () => stufe(spezifisch ? 1 : 2) }, '☰'));
    else {
    selbar.append(h('div', { class: 'sel-kopf' }, /* 🗑 löschen · − klein (☰) · ✕ schließen (Auswahl aufheben) */
      alleFest ? '' : h('button', { class: 'sel-zu sel-weg', title: 'Löschen', onclick: deleteSel }, '🗑'),
      h('button', { class: 'sel-zu', title: 'Menü klein machen (☰)', onclick: () => stufe(0) }, '−'),
      h('button', { class: 'sel-zu', title: 'Schließen – Auswahl aufheben', onclick: () => { S.sel = null; S.teil = null; T.renderOver(); } }, '✕')));
    if (spezifisch) {
    // Formen (Linien, Dreieck, Vierecke, Kreis …): eine Zeile Schaltsymbole ganz oben
    if (linienSel.length && !alleFest) formChips(gruppe('Form', 'chips'), linienSel);
    // Bild: daraus eine Übung machen – bzw. beim Puzzle: mischen, lösen, beenden
    if (puz && T.puzzleAktion) {
      const g = gruppe('🧩 Puzzle', 'schnell'), uid = (one.d.puzzle || one.d.puzzleRahmen).uid;
      knopf(g, '🔀 Neu mischen', () => T.puzzleAktion(uid, 'mischen'), 'Alle Teile wieder gemischt neben den Rahmen legen');
      knopf(g, '💡 Lösen', () => T.puzzleAktion(uid, 'loesen'), 'Alle Teile an ihren Platz');
      knopf(g, '👁 Vorlage im Rahmen ein/aus', () => T.puzzleAktion(uid, 'vorlage'), 'Das blasse Bild im Rahmen zeigen oder verstecken (schwerer)');
      knopf(g, '✕ Puzzle beenden – Bild zurück', () => T.puzzleAktion(uid, 'beenden'));
    } else if (istBild && !alleFest) {
      const g = gruppe('Bild – daraus eine Übung machen', 'schnell');
      if (T.puzzleEchtStart) knopf(g, '🧩 Puzzle zum Zusammensetzen', () => T.puzzleEchtStart(akt()), 'Bild in Puzzleteile schneiden – die Teile an die richtige Stelle schieben');
      if (T.puzzleAus) knopf(g, '🔲 Aufdeck-Kacheln', () => T.puzzleAus(akt()), 'Bild mit nummerierten Kacheln abdecken, die man einzeln aufdeckt – wer erkennt es zuerst?');
      if (T.beschriftenStart) knopf(g, '🏷 Beschriften / Zuordnen', () => T.beschriftenStart(akt()), 'Punkte ins Bild setzen – Begriffe zuordnen lassen (★/★★/★★★)');
    }
    // Baustein: Feld-Menü (wenn ein Feld angetippt ist) oder Schnellknöpfe
    if (teil && Bk && Bk.teil) {
      const g = gruppe('Feld', 'feld');
      for (const a of Bk.teil(akt().d, teil)) knopf(g, a.l, () => T.bausteinAendern(akt(), a), '', a.warn ? 'warn' : '');
      knopf(g, '✕ Feld-Auswahl aufheben', () => { S.teil = null; T.renderOver(); });
    } else if (Bk && Bk.schnell) {
      const g = gruppe(Bk.name || 'Baustein', 'schnell');
      for (const a of typeof Bk.schnell === 'function' ? Bk.schnell({ ...Bk.def, ...akt().d }) : Bk.schnell) { if (a.el) g.append(a.el(akt)); else knopf(g, a.l, () => T.bausteinAendern(akt(), a)); } // a.el: eigenes Bedienelement (z. B. Schieberegler)
      if (Bk.teil) g.append(h('span', { class: 'sellab' }, 'Tipp: ein Feld antippen'));
    }
    if (imSatz) { // Teil eines Aufgabensatzes: neue Zahlen, Lösungen
      const g = gruppe('Aufgaben', 'schnell'), mitL = T.page().items.some(i => i.k === 'loesung');
      knopf(g, '🎲 Neue Aufgaben', neueAufgaben, 'Gleiches Thema, neue Zahlen – an derselben Stelle');
      if (mitL) { knopf(g, '👁 Alle Lösungen', () => alleLoesungen(true)); knopf(g, '🙈 Alle verdecken', () => alleLoesungen(false)); }
    }
    }
    if (selStufe === 1 && spezifisch) knopf(gruppe(), '⋯ Mehr: Bearbeiten, Kopieren, Anordnen …', () => stufe(2), 'Alle Funktionen zeigen', 'sel-mehr');
    else if (alleFest) { // fixiert: nur Lösen anbieten
      knopf(gruppe(), '🔓 Lösen', () => setzeFest(false), 'Wieder verschiebbar machen');
    } else {
      const gb = gruppe('Bearbeiten');
      if (one && ((Bk && Bk.felder.length) || one.k === 'text' || one.k === 'graph')) knopf(gb, one.k === 'graph' ? '📈 Im Plotter öffnen' : '✏️ Bearbeiten', () => T.editObj(akt()));
      knopf(gb, '✨ Animation', e => T.aufPop(e.currentTarget), 'Animation: Effekt, Start und Reihenfolge (öffnet den Animationsbereich)');
      if (items.some(i => i.t === 's' && i.m !== 'hl')) knopf(gb, '🎨 Effekt', e => effektPop(e.currentTarget), 'Schatten, Graffiti oder Neon für die Handschrift');
      deckkraftRegler(gb);
      const gk = gruppe('Kopieren & Verschieben');
      knopf(gk, '⧉ Duplizieren', duplicateSel, 'Duplizieren – ein zweites Exemplar gleich daneben auf dieser Seite');
      knopf(gk, '📋 Kopieren', () => kopierenSel(false), 'Kopieren – auf einer anderen Seite oder Tafel einfügen (Strg+C)');
      knopf(gk, '✂ Ausschneiden', () => kopierenSel(true), 'Ausschneiden – woanders einfügen (Strg+X)');
      if (S.board.pages.length > 0) knopf(gk, '➡ Auf Seite …', e => aufSeitePop(e.currentTarget), 'Auf eine andere Seite verschieben');
      if (T.inNotizen) knopf(gk, '📥 In Notizen', () => T.inNotizen(), 'Von der Tafel in die Ablage-Notiz legen – von dort jederzeit zurückholen');
      if (T.alsVorlage) knopf(gk, '📌 Als Vorlage speichern', () => T.alsVorlage(), 'Das Markierte als eigene Vorlage speichern – später unter Einfügen › 📌 Meine Vorlagen');
      const ga = gruppe('Anordnen');
      knopf(ga, '⬆ Nach vorne', () => orderSel(1)); knopf(ga, '⬇ Nach hinten', () => orderSel(-1));
      if (one && one.r) knopf(ga, '⟲ Drehung 0°', () => { T.snap(); T.replaceItem({ ...akt(), r: 0 }); T.renderOver(); });
      // 🔗 Selbst festlegen, was zusammengehört: verbundene Elemente werden immer gemeinsam gegriffen, verschoben, gedreht
      const gid = items.length > 1 && items[0].grp && items.every(i => i.grp === items[0].grp) ? items[0].grp : null;
      if (items.length > 1 && !gid) knopf(ga, '🔗 Verbinden (als Gruppe)', () => { const g = T.uid(); T.snap(); T.page().items = T.page().items.map(i => S.sel.ids.has(i.id) ? { ...i, grp: g } : i); selbar.dataset.key = ''; T.renderOver(); toast('Verbunden – wird jetzt immer zusammen gegriffen.', 2200); }, 'Die ausgewählten Elemente fest zusammenfassen');
      if (items.some(i => i.grp)) knopf(ga, '⛓ Verbindung lösen', () => { T.snap(); T.page().items = T.page().items.map(i => S.sel.ids.has(i.id) && i.grp ? (({ grp, ...rest }) => rest)(i) : i); selbar.dataset.key = ''; T.renderOver(); toast('Gelöst – Teile lassen sich wieder einzeln greifen.', 2200); }, 'Gruppe wieder auflösen');
      knopf(ga, '🔒 Fixieren', () => { setzeFest(true); toast('Fixiert – verrutscht nicht mehr beim Schreiben. Antippen › 🔓 Lösen.', 2600); }, 'Festmachen: lässt sich nicht mehr versehentlich verschieben');
      knopf(gruppe(), '🗑 Löschen', deleteSel, '', 'warn');
    }
    }
  }
  selbar.style.display = 'flex';
  const w = selbar.offsetWidth, hh = selbar.offsetHeight;
  const pl = document.getElementById('punkteleiste'), oben = pl ? pl.getBoundingClientRect().bottom + 8 : 64; // nicht über die Abstimmungsleiste legen
  // Liste NEBEN dem Element (rechts, sonst links) – so verdeckt sie nichts; oben bündig mit dem Element
  const xr = anchor.x1 * v.z + v.x + T.ox + 70, xl = anchor.x0 * v.z + v.x + T.ox - w - 70, rechtsFrei = innerWidth - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dockR')) || 0) - 8;
  const left = selStufe === 0 ? T.clamp(anchor.x1 * v.z + v.x + T.ox + 14, T.ox + 8, rechtsFrei - w) /* ☰ direkt rechts neben dem Objekt */
    : xr + w <= rechtsFrei ? xr : xl >= T.ox + 8 ? xl : T.clamp(x - w / 2, 8, innerWidth - w - 8);
  selbar.style.left = left + 'px'; selbar.style.top = T.clamp(y, oben, Math.max(oben, innerHeight - hh - 90)) + 'px';
};
function setzeFest(an) { // Bilder, Bausteine, Texte und Handschrift fixieren bzw. lösen
  if (!S.sel) return; T.snap();
  T.page().items = T.page().items.map(it => { if (!S.sel.ids.has(it.id)) return it; const c = { ...it }; if (an) c.fest = true; else delete c.fest; return c; });
  T.render(); T.renderOver();
}
// Deckkraft per Schieberegler (Bilder, Formen, Texte, Handschrift); ein Rückgängig-Schritt je Ziehen
function deckkraftRegler(ziel) {
  const ids = () => S.sel ? S.sel.ids : new Set(), erstes = T.page().items.find(i => ids().has(i.id));
  const wert = Math.round((erstes && erstes.alpha != null ? erstes.alpha : 1) * 100);
  const anz = h('span', { class: 'sellab' }, wert + ' %'); let snapped = false;
  const r = h('input', { type: 'range', min: 10, max: 100, step: 5, value: wert, class: 'deckkraft', title: 'Deckkraft: nach links = durchsichtiger' });
  r.oninput = () => {
    if (!snapped) { T.snap(); snapped = true; }
    const a = +r.value / 100;
    for (const w of document.querySelectorAll('.deckkraft-wrap')) { w.querySelector('input').value = r.value; w.querySelector('.sellab').textContent = r.value + ' %'; } // Menüband und Auswahl-Leiste gleich
    T.page().items = T.page().items.map(it => { if (!ids().has(it.id)) return it; const c = { ...it }; if (a >= 1) delete c.alpha; else c.alpha = a; return c; });
    T.render();
  };
  r.onchange = () => { snapped = false; };
  ziel.append(h('label', { class: 'deckkraft-wrap', title: 'Deckkraft' }, '◐', r, anz));
}
T.deckkraftRegler = deckkraftRegler;
function deleteSel() { if (!S.sel) return; T.snap(); T.page().items = T.page().items.filter(it => !S.sel.ids.has(it.id)); S.sel = null; T.render(); T.renderOver(); }
function neueGruppen(liste) { const m = new Map(); for (const c of liste) if (c.grp) { if (!m.has(c.grp)) m.set(c.grp, T.uid()); c.grp = m.get(c.grp); } return liste; } /* duplizierte Gruppen bilden eine eigene Gruppe */
T.neueGruppen = neueGruppen;
function duplicateSel() {
  if (!S.sel) return; T.snap(); const ids = [], neuId = new Map(), kopien = [];
  for (const it of T.page().items.filter(i => S.sel.ids.has(i.id))) {
    const c = it.t === 's' ? { ...it, id: T.uid(), p: it.p.map(q => [q[0] + 30, q[1] + 30, q[2]]) } : { ...it, id: T.uid(), x: it.x + 30, y: it.y + 30 };
    neuId.set(it.id, c.id); kopien.push(c); ids.push(c.id);
  }
  for (const c of kopien) if (c.an) { const a = c.an.map(i => Array.isArray(i) ? (i.every(j => neuId.has(j)) ? i.map(j => neuId.get(j)) : null) : neuId.get(i)); if (a[0] && a[1]) c.an = a; else delete c.an; } // Pfeile haften an den Kopien
  neueGruppen(kopien);
  T.page().items.push(...kopien);
  T.select(ids); T.render();
}
// ---------- 📋 Kopieren / ✂ Ausschneiden / Einfügen – auch auf eine andere Seite oder in eine andere Tafel ----------
let tafelAblage = null; // { items, box, zeit }
const MARKE = '‹Tafel-App: kopierte Elemente›';
let systemAblageOk = false;
function kopierenSel(ausschneiden) {
  if (!S.sel) return; const pg = T.page(), items = pg.items.filter(i => S.sel.ids.has(i.id)); if (!items.length) return;
  const bb = items.map(T.bbox), x0 = Math.min(...bb.map(b => b.x0)), y0 = Math.min(...bb.map(b => b.y0)), x1 = Math.max(...bb.map(b => b.x1)), y1 = Math.max(...bb.map(b => b.y1));
  tafelAblage = { items: JSON.parse(JSON.stringify(items)), box: { x0, y0, w: x1 - x0, h: y1 - y0 }, zeit: Date.now() };
  systemAblageOk = false; try { navigator.clipboard && navigator.clipboard.writeText(MARKE).then(() => { systemAblageOk = true; }, () => {}); } catch (e) {}
  if (ausschneiden) { T.snap(); pg.items = pg.items.filter(i => !S.sel.ids.has(i.id)); S.sel = null; T.render(); T.renderOver(); T.placeSelBar && T.placeSelBar(); }
  einfuegeKnopf();
  toast((ausschneiden ? '✂ Ausgeschnitten' : '📋 Kopiert') + ` (${items.length}) – auf der Zielseite „📋 Einfügen“ antippen (oder Strg+V).`, 3000);
}
function einfuegenAblage() {
  if (!tafelAblage || !S.board) return;
  const e = tafelAblage, [cx, cy] = T.viewCenter(), dx = cx - (e.box.x0 + e.box.w / 2), dy = cy - (e.box.y0 + e.box.h / 2);
  const neuId = new Map(e.items.map(it => [it.id, T.uid()]));
  const neu = e.items.map(it => { const k = { ...JSON.parse(JSON.stringify(it)), id: neuId.get(it.id) };
    if (k.t === 's') k.p = k.p.map(q => [T.r1(q[0] + dx), T.r1(q[1] + dy), q[2]]); else { k.x += dx; k.y += dy; }
    if (k.an) { const a = k.an.map(i => Array.isArray(i) ? (i.every(j => neuId.has(j)) ? i.map(j => neuId.get(j)) : null) : neuId.get(i)); if (a[0] && a[1]) k.an = a; else delete k.an; } // Pfeile nur zwischen mitkopierten Elementen
    delete k.auf; return k; });
  neueGruppen(neu); T.snap(); T.page().items.push(...neu); T.select(neu.map(i => i.id)); T.render();
  toast('📋 Eingefügt – verschieben am ✥ oder mit dem Finger ziehen.', 2000);
}
// Schwebender Knopf „📋 Einfügen“, solange etwas kopiert ist (× leert die Ablage)
const einfKnopf = h('div', { id: 'einfKnopf' });
document.body.append(einfKnopf);
function einfuegeKnopf() {
  einfKnopf.innerHTML = ''; einfKnopf.style.display = tafelAblage && S.board ? 'flex' : 'none'; if (!tafelAblage) return;
  einfKnopf.append(h('button', { class: 'ek-ein', title: 'Kopierte Elemente in die Mitte dieser Seite einfügen (Strg+V)', onclick: einfuegenAblage }, `📋 Einfügen (${tafelAblage.items.length})`),
    h('button', { class: 'ek-weg', title: 'Ablage leeren', onclick: () => { tafelAblage = null; einfuegeKnopf(); } }, '×'));
}
einfKnopf.addEventListener('pointerdown', e => e.stopPropagation());
T.einfuegeKnopf = einfuegeKnopf;
// ➡ Auf Seite …: Auswahl direkt auf eine andere Seite verschieben (gleiche Stelle) und dorthin wechseln
function aufSeitePop(el) {
  const P = S.board.pages;
  openPop(el, h('h4', {}, '➡ Auf welche Seite verschieben?'), h('div', { class: 'row', style: { maxWidth: '420px' } },
    ...P.map((p, i) => i === S.page ? '' : h('button', { class: 'big', onclick: () => { T.closePops(); aufSeite(i); } }, `Seite ${i + 1}` + (p.titel ? ' – ' + p.titel : ''))),
    h('button', { class: 'big', onclick: () => { T.closePops(); const von = S.page, ids = new Set(S.sel.ids); neueSeite(); aufSeite(S.page, von, ids); /* neue Seite steht direkt hinter der aktuellen */ } }, '＋ Neue Seite')));
}
function aufSeite(i, vonIdx = S.page, ids = S.sel && new Set(S.sel.ids)) {
  const von = S.board.pages[vonIdx], nach = S.board.pages[i]; if (!von || !nach || nach === von || !ids || !ids.size) return;
  T.snap(); const items = von.items.filter(it => ids.has(it.id)); von.items = von.items.filter(it => !ids.has(it.id)); nach.items.push(...items);
  gotoPage(i); T.select(items.map(x => x.id)); T.render(); toast(`➡ Auf Seite ${i + 1} verschoben.`, 1800);
}
function orderSel(dir) {
  T.snap(); const pg = T.page(), sel = pg.items.filter(it => S.sel.ids.has(it.id)), rest = pg.items.filter(it => !S.sel.ids.has(it.id));
  pg.items = dir > 0 ? rest.concat(sel) : sel.concat(rest); T.render();
}

// ---------- Dialoge ----------
const modal = $('modal'), dlg = $('dlg');
function openDlg(content, wide) {
  dlg.innerHTML = ''; dlg.className = 'dlg' + (wide ? ' wide' : ''); dlg.append(...[].concat(content));
  // Bestätigen-Knöpfe (OK, Übernehmen, Fertig …) stehen oben neben dem × – leichter erreichbar am Board.
  // „Abbrechen“ übernimmt das ×; Lösch-Knöpfe (warn) bleiben bewusst unten.
  const h2 = dlg.querySelector(':scope > h2'), acts = dlg.querySelector(':scope > .acts'), oben = h('div', { class: 'dlg-knoepfe' });
  if (acts) { for (const b of [...acts.children]) { if (b.textContent.trim() === 'Abbrechen') b.remove(); else if (!b.classList.contains('warn')) oben.append(b); } if (!acts.children.length) acts.remove(); }
  dlg.prepend(h('div', { class: 'dlg-kopf' }, h2 || h('span', { style: { flex: 1 } }), oben, h('button', { class: 'nzu', title: 'Schließen (Esc)', onclick: closeDlg }, '×')));
  modal.style.display = 'flex'; T.closePops();
}
function closeDlg() { modal.style.display = 'none'; dlg.innerHTML = ''; }
T.closeDlg = closeDlg; T.openDlg = (...a) => openDlg(...a);
// Eigene Rückfragen statt confirm()/prompt(): die Browser-Fenster erscheinen auf manchen Boards (Android, Vollbild, installierte App) gar nicht
const frageBox = h('div', { id: 'frage' }); document.body.append(frageBox);
function frage(text, { ok = 'OK', abbrechen = 'Abbrechen', feld = null } = {}) {
  return new Promise(fertig => {
    const inp = feld ? h('input', { type: 'text', class: 'feld', value: feld.wert || '' }) : null;
    const zu = v => { frageBox.style.display = 'none'; frageBox.innerHTML = ''; fertig(v); };
    const bestaetigt = () => zu(inp ? inp.value : true), nein = () => zu(inp ? null : false);
    frageBox.innerHTML = '';
    frageBox.append(h('div', { class: 'dlg' }, h('p', { class: 'frage-text' }, text), inp || '',
      h('div', { class: 'acts' }, h('button', { class: 'big', onclick: nein }, abbrechen), h('button', { class: 'big prim', onclick: bestaetigt }, ok))));
    frageBox.onkeydown = e => { if (e.key === 'Enter') bestaetigt(); else if (e.key === 'Escape') nein(); else return; e.preventDefault(); e.stopPropagation(); };
    frageBox.style.display = 'flex'; setTimeout(() => (inp || frageBox.querySelector('.prim')).focus(), 50);
  });
}
T.frage = frage;
modal.addEventListener('pointerdown', e => { if (e.target === modal) closeDlg(); });

// Tabellen-/Listen-Eingabe für Bausteine (statt Text mit ; oder =): Zeilen und Spalten wachsen von selbst,
// Enter springt weiter, Einfügen aus Excel/Word (Tabulator/Zeilen) füllt die Tabelle. Ergebnis bleibt das bisherige Textformat.
// f.typ 'tabelle' | 'liste'; f.trenner (Standard ';'), f.kopf [Spaltennamen], f.spalten (Mindestzahl), f.fest (feste Spaltenzahl), f.zeile (nur eine Zeile)
function tabFeld(f, val, d) {
  if (f.kopfAus && d && d[f.kopfAus]) f = { ...f, kopf: String(d[f.kopfAus]).split(';').map(s => s.trim()).filter(Boolean) }; // Spaltennamen aus einem anderen Feld (z. B. Größen)
  const liste = f.typ === 'liste', tr = f.trenner || ';';
  const teile = l => liste ? [l] : tr === ';' ? l.split(';').map(s => s.trim()) : l.split(tr.trim()).map(s => s.trim());
  let R = String(val == null ? '' : val).split(/\r?\n/).filter(l => l.trim() !== '').map(teile);
  if (f.zeile) R = [R.flat()];
  let spalten = liste ? 1 : Math.max(f.fest || 0, f.spalten || 2, f.zeile ? 0 : (f.kopf || []).length, ...R.map(r => r.length)); // f.fest = Mindestzahl, mehr Spalten sind immer möglich
  const box = h('div', { class: 'ft-box' });
  const male = fokus => {
    if (!f.zeile && (!R.length || (R[R.length - 1] || []).some(c => c))) R.push([]);
    if (f.zeile && !R.length) R.push([]);
    box.innerHTML = '';
    const tab = h('table', { class: 'ue-tab ft-tab' });
    if (!liste) tab.append(h('tr', {}, ...Array.from({ length: spalten }, (_, s) => h('th', {}, (f.kopf && f.kopf[s]) || (f.zeile ? String(s + 1) : 'Spalte ' + (s + 1)))), h('th', { class: 'ue-akt' }, '')));
    R.forEach((r, z) => {
      const zeile = h('tr', {});
      for (let s = 0; s < spalten; s++) {
        const inp = h('input', { type: 'text', class: 'ue-feld', value: r[s] || '', 'data-z': z, 'data-s': s, placeholder: z === R.length - 1 && s === 0 && !f.zeile ? '＋ weiter …' : '' });
        inp.addEventListener('input', () => { r[s] = inp.value; if (!f.zeile && z === R.length - 1 && inp.value) { const p = inp.selectionStart; male(); const n = box.querySelector(`[data-z="${z}"][data-s="${s}"]`); n.focus(); n.setSelectionRange(p, p); } });
        inp.addEventListener('keydown', e => { if (e.key !== 'Enter') return; e.preventDefault(); e.stopPropagation(); const n = box.querySelector(`[data-z="${z}"][data-s="${s + 1}"]`) || box.querySelector(`[data-z="${z + 1}"][data-s="0"]`); if (n) n.focus(); });
        inp.addEventListener('paste', e => { e.stopPropagation(); const t = (e.clipboardData || window.clipboardData).getData('text'); if (!/[\n\t;]/.test(t)) return; e.preventDefault();
          t.replace(/\r/g, '').split('\n').filter(l => l.trim()).forEach((l, i) => { const zz = f.zeile ? 0 : z + i, ziel = R[zz] || (R[zz] = []); (liste ? [l] : l.split(/\t|;/)).forEach((v, j) => { const ss = f.zeile ? s + i * 0 + j : s + j; ziel[ss] = v.trim(); }); });
          if (!liste && !f.fest) spalten = Math.max(spalten, ...R.map(x => x.length)); male(); });
        zeile.append(h('td', {}, inp));
      }
      zeile.append(h('td', { class: 'ue-akt' }, !f.zeile && r.some(c => c) ? h('span', { class: 'ue-knoepfe' },
        z > 0 ? h('button', { type: 'button', title: 'nach oben', onclick: () => { [R[z - 1], R[z]] = [R[z], R[z - 1]]; male(); } }, '▲') : '',
        h('button', { type: 'button', title: 'Zeile löschen', onclick: () => { R.splice(z, 1); male(); } }, '🗑')) : ''));
      tab.append(zeile);
    });
    box.append(h('div', { class: 'ft-scroll' }, tab));
    // immer: ＋ Zeile, ＋/− Spalte und Import aus Excel/CSV
    const datei = h('input', { type: 'file', accept: '.csv,.txt,.xlsx', style: { display: 'none' }, onchange: async ev => {
      const fl = ev.target.files[0]; ev.target.value = ''; if (!fl) return;
      try {
        let zz; if (/\.xlsx$/i.test(fl.name)) zz = await xlsxZeilen(await fl.arrayBuffer());
        else { const buf = await fl.arrayBuffer(); let t = new TextDecoder('utf-8').decode(buf); if (t.includes('�')) t = new TextDecoder('windows-1252').decode(buf); zz = csvZeilen(t); }
        zz = zz.map(r => r.map(c => String(c || '').trim())).filter(r => r.some(Boolean)); if (!zz.length) { toast('In der Datei steht nichts.', 2500); return; }
        R = liste ? zz.map(r => [r.filter(Boolean).join(' ')]) : f.zeile ? [zz.flat()] : zz;
        if (!liste) spalten = Math.max(spalten, ...R.map(r => r.length)); male(); toast(`${R.length} Zeile(n) übernommen – bitte kurz prüfen.`, 2500);
      } catch (e) { toast('Datei nicht lesbar: ' + (e.message || e), 4000); }
    } });
    box.append(h('div', { class: 'row', style: { marginTop: '6px' } },
      !f.zeile ? h('button', { type: 'button', class: 'big', title: 'Leere Zeile anhängen', onclick: () => { R.push([]); male(); const l = box.querySelector(`[data-z="${R.length - 1}"][data-s="0"]`); l && l.focus(); } }, '＋ Zeile') : '',
      !liste ? h('button', { type: 'button', class: 'big', title: 'Spalte anhängen', onclick: () => { spalten++; male(); } }, '＋ Spalte') : '',
      !liste && spalten > 1 ? h('button', { type: 'button', class: 'big', title: 'Letzte Spalte entfernen', onclick: () => { spalten--; R.forEach(r => r.length = Math.min(r.length, spalten)); male(); } }, '− Spalte') : '',
      !f.zeile ? h('button', { type: 'button', class: 'big', title: 'Tabelle aus einer Excel- oder CSV-Datei übernehmen (ersetzt den Inhalt)', onclick: () => datei.click() }, '📥 Import (Excel/CSV)') : '', datei));
    if (fokus) { const n = box.querySelector('input'); n && n.focus(); }
  };
  male();
  const get = () => R.map(r => { const c = Array.from({ length: spalten }, (_, i) => String(r[i] || '').trim()); while (c.length > 1 && !c[c.length - 1]) c.pop(); return c; })
    .filter(c => c.some(Boolean)).map(c => c.join(tr === ';' ? ';' : ' ' + tr.trim() + ' ')).join(f.zeile ? ';' : '\n');
  return { el: h('div', { class: 'fld' }, h('span', {}, f.l), box, h('span', { class: 'hint', style: { fontSize: '12px' } }, 'Tipp: Aus Excel oder Word kopieren und in ein Feld einfügen (Strg+V). Enter springt ins nächste Feld.')), get };
}
function feld(f, val, d) {
  let inp;
  if (f.typ === 'tabelle' || f.typ === 'liste') return tabFeld(f, val, d);
  if (f.typ === 'check') { inp = h('input', { type: 'checkbox' }); inp.checked = !!val; return { el: h('label', { class: 'fld check' }, inp, f.l), get: () => inp.checked }; }
  if (f.typ === 'textarea') inp = h('textarea', {}, val || '');
  else if (f.typ === 'auswahl') { inp = h('select', {}, ...f.opts.map(([v, l]) => h('option', { value: v, selected: v === val }, l))); }
  else if (f.typ === 'farbe') inp = h('input', { type: 'color', value: val || '#ff8a65', style: { height: '50px' } });
  else if (f.typ === 'zahl') inp = h('input', { type: 'text', value: String(val ?? '').replace('.', ','), inputmode: 'decimal' });
  else inp = h('input', { type: 'text', value: val == null ? '' : val });
  const get = () => {
    if (f.typ !== 'zahl') return inp.value;
    let v = parseFloat(String(inp.value).replace(',', '.')); if (isNaN(v)) v = val;
    if (f.min != null) v = Math.max(f.min, v); if (f.max != null) v = Math.min(f.max, v); return v;
  };
  return { el: h('label', { class: 'fld' }, f.l, inp), get };
}
function propDialog(k, d, onOk, titel) {
  const B = T.BAUSTEINE[k], felder = B.felder.map(f => ({ f, ...feld(f, d[f.k], d) }));
  const prev = h('img', { class: 'prev' });
  const tabF = B.felder.find(f => f.typ === 'tabelle' && !f.zeile);
  const read = () => {
    const o = { ...d }; for (const x of felder) o[x.f.k] = x.get();
    // Tabelle gewachsen (＋ Zeile / ＋ Spalte / Import): Zeilen- und Spaltenzahl des Bausteins mitziehen
    if (tabF && o[tabF.k]) { const z = String(o[tabF.k]).split('\n').filter(l => l.trim()), sp = Math.max(0, ...z.map(l => l.split(tabF.trenner === '=' ? '=' : ';').length));
      if (B.felder.some(f => f.k === 'zeilen') && typeof o.zeilen === 'number') o.zeilen = Math.max(o.zeilen, z.length);
      if (B.felder.some(f => f.k === 'spalten') && typeof o.spalten === 'number') o.spalten = Math.max(o.spalten, sp); }
    return o;
  };
  const upd = () => { prev.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj(k, read(), false).svg); };
  const grid = h('div', { class: B.felder.length > 4 ? 'grid2' : '' }, felder.map(x => { if (x.f.typ === 'tabelle' || x.f.typ === 'liste' || x.f.typ === 'textarea') x.el.classList.add('volle'); return x.el; }));
  grid.addEventListener('input', upd); grid.addEventListener('change', upd); grid.addEventListener('click', () => setTimeout(upd, 0)); upd();
  openDlg([h('h2', {}, titel || B.name), prev, grid, h('div', { class: 'acts' },
    h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => { const o = read(); closeDlg(); onOk(o); } }, 'Übernehmen'))], !!tabF || B.felder.some(f => f.typ === 'liste')); // mit Tabelle: breites Fenster
}
T.editObj = o => {
  if (o.k === 'text') return T.letzteZeigerArt === 'mouse' && !o.d.karo ? T.textInline(0, 0, '', o) : T.textDialog(o); // am PC direkt im Text weitertippen
  if (o.k === 'graph') return T.plotter(o.d.plot, o.id);
  if (!T.BAUSTEINE[o.k]) return;
  propDialog(o.k, o.d, d => {
    const g = T.genObj(o.k, d, false), w = o.w, hh = w * g.h / g.w, cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    T.snap(); T.replaceItem({ ...o, d, w, h: hh, x: cx - w / 2, y: cy - hh / 2 }); T.renderOver();
  });
};
// sichtbare Tafelbreite – bei offener Seitenleiste in schmalen Fenstern nicht winzig werden lassen
const platzBreite = () => { const r = T.viewRect(); return Math.max(r.x1 - r.x0, innerWidth * 0.5 / T.page().view.z); };
function placeObj(k, d, at, scale) {
  const g = T.genObj(k, d, false), r = T.viewRect(), maxW = platzBreite() * 0.7, maxH = (r.y1 - r.y0) * 0.7;
  let f = scale || Math.min(1, maxW / g.w, maxH / g.h); const w = g.w * f, hh = g.h * f, [cx, cy] = at || T.viewCenter();
  const o = { t: 'o', id: T.uid(), k, d, x: cx - w / 2, y: cy - hh / 2, w, h: hh, r: 0 };
  return o;
}
// Nach dem Einfügen: am Board (Stift/Finger) schreibt der Stift weiter – der Finger greift, verschiebt und öffnet das Objekt;
// am PC (Maus) ist „Auswahl“ aktiv. Das neue Objekt ist markiert.
let letzterZeiger = 'mouse';
document.addEventListener('pointerdown', e => { letzterZeiger = e.pointerType || 'mouse'; }, true);
function nachEinfuegen(ids) { setTool(letzterZeiger === 'mouse' ? 'auswahl' : 'stift'); if (ids && ids.length) T.select(ids); }
T.nachEinfuegen = nachEinfuegen;
function insertObj(k, d, at) { const o = placeObj(k, d, at); T.snap(); T.addItem(o); nachEinfuegen([o.id]); return o; }

// ---------- Textformat: fett, kursiv, unterstrichen, Größe, Farbe (im Tipp-Feld und im Text-Dialog) ----------
const TEXTFARBEN = [['#1a1a1a', 'Schwarz'], ['#d32f2f', 'Rot'], ['#1565c0', 'Blau'], ['#2e7d32', 'Grün'], ['#ef6c00', 'Orange'], ['#7b1fa2', 'Lila']];
function formatKnoepfe(d, neu, mitGroesse) {
  const leiste = h('div', { class: 'format-leiste' });
  let menueAuf = false;
  const zeichne = () => {
    leiste.innerHTML = '';
    const an = (k, txt, title, stil) => h('button', { class: 'fk' + (d[k] ? ' on' : ''), title, style: stil, onclick: () => { if (d[k]) delete d[k]; else d[k] = true; zeichne(); neu(); } }, txt);
    // Schriftart: Knopf mit aufklappender Liste (jede Schrift in ihrem eigenen Aussehen)
    const S0 = T.SCHRIFTEN[d.schrift] || T.SCHRIFTEN.standard;
    const schrift = h('div', { class: 'fk-schrift' }, h('button', { class: 'fk', title: 'Schriftart', style: { fontFamily: S0[1] }, onclick: () => { menueAuf = !menueAuf; zeichne(); } }, 'Aa ' + S0[0] + ' ▾'),
      menueAuf ? h('div', { class: 'fk-menue' }, ...Object.entries(T.SCHRIFTEN).map(([id, [n, css]]) => h('button', { class: (d.schrift || 'standard') === id ? 'on' : '', style: { fontFamily: css },
        onclick: () => { if (id === 'standard') delete d.schrift; else d.schrift = id; menueAuf = false; zeichne(); neu(); } }, n))) : '');
    leiste.append(schrift, h('span', { class: 'fk-trenn' }),
      an('fett', 'B', 'Fett (Strg + B)', { fontWeight: '800' }), an('kursiv', 'I', 'Kursiv (Strg + I)', { fontStyle: 'italic', fontFamily: 'Georgia, serif' }), an('unter', 'U', 'Unterstrichen (Strg + U)', { textDecoration: 'underline' }),
      an('schatten', 'S', 'Schatten', { textShadow: '2px 2px 3px rgba(0,0,0,.55)', fontWeight: '700' }));
    if (mitGroesse) leiste.append(h('span', { class: 'fk-trenn' }),
      h('button', { class: 'fk', title: 'Schrift kleiner (Strg −)', onclick: () => { d.size = Math.max(12, Math.round(d.size / 1.2)); zeichne(); neu(); } }, 'A−'),
      h('span', { class: 'fk-wert', title: 'Schriftgröße' }, String(d.size)),
      h('button', { class: 'fk', title: 'Schrift größer (Strg +)', onclick: () => { d.size = Math.min(200, Math.round(d.size * 1.2)); zeichne(); neu(); } }, 'A+'));
    leiste.append(h('span', { class: 'fk-trenn' }), ...TEXTFARBEN.map(([c, n]) => h('button', { class: 'fk-farbe' + (d.c === c ? ' on' : ''), title: n, style: { background: c }, onclick: () => { d.c = c; zeichne(); neu(); } })));
  };
  zeichne();
  leiste.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); }); // Fokus bleibt im Textfeld
  leiste.neu = zeichne;
  return leiste;
}
const formatVon = d => { const f = {}; for (const k of ['fett', 'kursiv', 'unter', 'schatten']) if (d[k]) f[k] = true; if (d.schrift && d.schrift !== 'standard') f.schrift = d.schrift; return f; };
const schriftCss = d => (T.SCHRIFTEN[d.schrift] || T.SCHRIFTEN.standard)[1];
// für das Menüband und den Word-/PDF-Import (eigene Dateien)
T.ui = { setTool, insertObj, bildEinfuegen, pdfEinfuegen, ladePdfJs, addBild, formatKnoepfe, formatVon, setzeFest, deckkraftRegler, orderSel, duplicateSel, deleteSel,
  neueSeite, seiteDuplizieren, seiteLoeschen, seitenPop, gotoPage, tafelWischen, exportPop, effektPop, stiftPop, formPop, zeigeDock, updateToolbar, platzBreite: () => platzBreite(),
  phasenWidget: () => phasenWidget(), timerWidget: () => timerWidget(), zufallWidget: () => zufallWidget(), wuerfelWidget: () => wuerfelWidget(), hervorPop: el => hervorPop(el) };

// ---------- Mit der Tastatur direkt auf die Tafel schreiben (Vorbereitung am PC) ----------
// Ein durchsichtiges Textfeld liegt genau an der Schreibstelle; beim Beenden (Esc, daneben klicken) wird daraus ein Textelement.
let inline = null;
T.textInline = (wx, wy, start = '', o = null) => {
  if (inline) inline.fertig();
  const d = o ? { ...o.d } : { text: '', size: T.opts.tippGroesse || 36, c: S.farbe.stift, fett: false };
  const f = o ? o.w / T.textMetrics(o.d).w : 1; // war der Text vergrößert, bleibt der Maßstab erhalten
  if (o) { wx = o.x; wy = o.y; T.snap(); T.page().items = T.page().items.filter(i => i.id !== o.id); S.sel = null; T.render(); T.renderOver(); } // alter Text verschwindet, solange getippt wird
  const ta = h('textarea', { class: 'tafel-tippen', spellcheck: 'false', autocomplete: 'off' });
  ta.value = o ? d.text : start;
  const hinweis = h('div', { class: 'tippen-hinweis' }, 'Enter = neue Zeile · Esc oder daneben klicken = fertig');
  // Formatleiste über dem Textfeld: B I U, Größe, Farbe, Fertig
  const leiste = formatKnoepfe(d, () => { if (d.size !== T.opts.tippGroesse) { T.opts.tippGroesse = d.size; T.saveOpts(); } stil(); }, true);
  leiste.classList.add('tippen-leiste');
  const fertigKnopf = h('button', { class: 'fk fk-ok', title: 'Fertig (Esc)', onclick: () => fertig() }, '✓ Fertig');
  const leisteZeigen = () => { if (!fertigKnopf.isConnected) leiste.append(h('span', { class: 'fk-trenn' }), fertigKnopf); };
  const stil = () => {
    const v = T.page().view, s = d.size * f * v.z;
    Object.assign(ta.style, { left: (wx * v.z + v.x + T.ox) + 'px', top: (wy * v.z + v.y) + 'px', font: `${d.kursiv ? 'italic ' : ''}${d.fett ? 700 : 400} ${s}px ${schriftCss(d)}`, lineHeight: '1.3',
      textDecoration: d.unter ? 'underline' : 'none', textShadow: d.schatten ? `${s * 0.05}px ${s * 0.07}px ${s * 0.18}px rgba(0,0,0,.38)` : 'none', padding: `${s * 0.1}px ${s * 0.2}px`, color: T.inkColor(d.c, T.isDark(T.page())), transform: o && o.r ? `rotate(${o.r}deg)` : '', transformOrigin: 'center' });
    ta.style.width = '10px'; ta.style.height = '10px';
    ta.style.width = Math.max(ta.scrollWidth + s * 0.6, s * 2) + 'px'; ta.style.height = ta.scrollHeight + 'px';
    Object.assign(hinweis.style, { left: ta.style.left, top: (ta.offsetTop + ta.offsetHeight + 8) + 'px' });
    leisteZeigen(); const lh = leiste.offsetHeight || 52; let ly = ta.offsetTop - lh - 10; if (ly < 62) ly = ta.offsetTop + ta.offsetHeight + 40; // über dem Text, sonst darunter
    Object.assign(leiste.style, { left: T.clamp(ta.offsetLeft, 8, innerWidth - leiste.offsetWidth - 8) + 'px', top: ly + 'px' });
  };
  const fertig = () => {
    if (!inline) return; inline = null;
    ta.remove(); hinweis.remove(); leiste.remove(); removeEventListener('wheel', fertig, true);
    const text = ta.value.replace(/\s+$/, '');
    if (!text) { T.render(); return; }
    const nd = { text, size: d.size, c: d.c, ...formatVon(d) }, m = T.textMetrics(nd);
    if (!o) T.snap();
    const neu = { ...(o || {}), t: 'o', id: o ? o.id : T.uid(), k: 'text', d: nd, x: wx, y: wy, w: m.w * f, h: m.h * f, r: o ? o.r || 0 : 0 }; // Drehung, Deckkraft, Aufdecken bleiben
    T.addItem(neu); T.render();
    T.schreibmarke = [wx, wy + m.h * f + d.size * f * 0.4]; // nächstes Lostippen beginnt darunter
  };
  ta.addEventListener('input', stil);
  ta.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== ta) fertig(); }, 0));
  ta.addEventListener('keydown', e => {
    e.stopPropagation(); // Tafel-Kürzel (Entf, Bild auf/ab …) gelten nicht beim Tippen
    const c = e.ctrlKey || e.metaKey;
    if (e.key === 'Escape' || (c && e.key === 'Enter')) { e.preventDefault(); fertig(); }
    else if (c && (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd' || e.code === 'BracketRight' || e.code === 'Equal')) { e.preventDefault(); d.size = Math.min(200, Math.round(d.size * 1.2)); T.opts.tippGroesse = d.size; T.saveOpts(); stil(); }
    else if (c && (e.key === '-' || e.code === 'NumpadSubtract' || e.code === 'Slash' || e.code === 'Minus')) { e.preventDefault(); d.size = Math.max(12, Math.round(d.size / 1.2)); T.opts.tippGroesse = d.size; T.saveOpts(); stil(); }
    else if (c && ['b', 'i', 'u'].includes(e.key.toLowerCase())) { e.preventDefault(); const k = { b: 'fett', i: 'kursiv', u: 'unter' }[e.key.toLowerCase()]; if (d[k]) delete d[k]; else d[k] = true; leiste.neu(); stil(); }
    else return;
    if (/[+=-]|Numpad|Bracket|Slash|Minus|Equal/.test(e.key + e.code)) leiste.neu(), stil();
  });
  ta.addEventListener('pointerdown', e => e.stopPropagation());
  addEventListener('wheel', fertig, true); // beim Zoomen/Verschieben fertig, sonst passt die Lage nicht mehr
  document.body.append(ta, hinweis, leiste);
  inline = { fertig };
  stil(); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
};
// Wo das Lostippen beginnt: zuletzt mit der Maus angeklickte Stelle, sonst oben links im sichtbaren Bereich
const schreibstelle = () => { if (T.schreibmarke) return T.schreibmarke; const r = T.viewRect(), z = T.page().view.z; return [r.x0 + 60 / z, r.y0 + 100 / z]; };
T.textDialog = (o, wx, wy) => {
  const d = o ? o.d : { text: '', size: 36, c: S.farbe.stift, fett: false };
  const ta = h('textarea', { style: { fontSize: '26px', minHeight: '160px' } }, d.text);
  let size = d.size;
  const sizes = h('div', { class: 'row' }, ...[[24, 'klein'], [36, 'normal'], [56, 'groß'], [90, 'riesig']].map(([s, l]) => h('button', { class: 'big' + (s === size ? ' on' : ''), onclick: e => { size = s; [...sizes.children].forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); } }, l)));
  const fmt = { c: d.c, ...formatVon(d) }; // fett, kursiv, unterstrichen, Farbe
  const vorschau = () => Object.assign(ta.style, { fontWeight: fmt.fett ? '700' : '400', fontStyle: fmt.kursiv ? 'italic' : 'normal', textDecoration: fmt.unter ? 'underline' : 'none', color: fmt.c === '#1a1a1a' || fmt.c === '#ffffff' ? '' : fmt.c,
    fontFamily: schriftCss(fmt), textShadow: fmt.schatten ? '2px 3px 5px rgba(0,0,0,.38)' : 'none' });
  const fb = formatKnoepfe(fmt, vorschau, false); vorschau();
  const g = T.gridPx(T.page()); let karo = o ? !!d.karo : !!g;
  const kb = h('button', { class: 'big' + (karo ? ' on' : ''), title: 'Jedes Zeichen in ein Kästchen (wie im Rechenheft)', onclick: e => { karo = !karo; e.currentTarget.classList.toggle('on', karo); } }, '▦ In Kästchen');
  openDlg([h('h2', {}, o ? 'Text bearbeiten' : 'Text einfügen'), h('p', { class: 'hint' }, 'Tipp: Auf dem Smartboard öffnet sich die Bildschirmtastatur über das Tastatursymbol in der Taskleiste. Brüche als 3/4 schreiben.'), ta,
    h('div', { class: 'row', style: { marginTop: '10px' } }, sizes, fb, g || d.karo ? kb : ''),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => {
      const text = ta.value.replace(/\s+$/, ''); closeDlg(); if (!text) return;
      const nd = { text, size, c: fmt.c, ...formatVon(fmt) }; if (karo) nd.karo = d.karo || g || 80;
      const m = T.textMetrics(nd), rund = v => nd.karo ? Math.round(v / nd.karo) * nd.karo : v;
      if (o) { const f = karo ? 1 : o.w / T.textMetrics(o.d).w; T.snap(); T.replaceItem({ ...o, d: nd, w: m.w * f, h: m.h * f, x: rund(o.x), y: rund(o.y) }); T.renderOver(); }
      else { const [cx, cy] = wx != null ? [wx + m.w / 2, wy + m.h / 2] : T.viewCenter(); const it = { t: 'o', id: T.uid(), k: 'text', d: nd, x: rund(cx - m.w / 2), y: rund(cy - m.h / 2), w: m.w, h: m.h, r: 0 }; T.snap(); T.addItem(it); }
    } }, 'OK'))]);
  setTimeout(() => ta.focus(), 50);
};

const ladeSkript = src => new Promise((ok, fehler) => { if (document.querySelector(`script[src="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fehler; document.head.append(s); });
function skelettEinfuegen(sk) { // Bild + kleine Quellenangabe darunter
  const r = T.viewRect(), f = Math.min(platzBreite() * 0.55 / sk.w, (r.y1 - r.y0) * 0.6 / sk.h), [cx, cy] = T.viewCenter();
  const w = sk.w * f, hh = sk.h * f, x = cx - w / 2, y = cy - hh / 2 - 20 / T.page().view.z;
  const bild = { t: 'o', id: T.uid(), k: 'bild', d: { src: sk.src }, x, y, w, h: hh, r: 0 };
  const d = { text: `Abb.: ${sk.autor}, ${sk.lizenz}, ${sk.quelle}`, size: Math.max(12, 14 / T.page().view.z), c: '#6b7280', fett: false }, m = T.textMetrics(d);
  const k = Math.min(1, w / m.w); // Quellenzeile nie breiter als das Bild
  T.snap(); T.page().items.push(bild, { t: 'o', id: T.uid(), k: 'text', d, x, y: y + hh + 4, w: m.w * k, h: m.h * k, r: 0 });
  T.render(); nachEinfuegen([bild.id]);
}
// Einfügen (in der Seitenleiste): Kategorien oben, Kacheln darunter – Antippen setzt den Baustein in die Tafelmitte
let einfKat = 'Medien', kartenStil = 'politisch', uebTyp = 'gruppen', uebListenAlle = false, uebListenAuf = false;
T.uebOeffnen = (typ, text, nv) => { uebTyp = typ; uebText[typ] = text; if (nv) uebNv = nv; uebFenster(); }; /* Übung mit vorgegebenem Inhalt im Bearbeiten-Fenster öffnen */
const uebText = {}; // Entwürfe der Übungen je Art (Textformat)
let uebNv = 2; // Niveau beim Einfügen: 1 = ★, 2 = ★★, 3 = ★★★
// Einfügen nach Fach: allgemeine Vorlagen stehen immer da, Fachvorlagen nur im passenden Fach („Alle Fächer“ zeigt alles)
const NAWI = ['NaWi', 'Biologie', 'Chemie', 'Physik', 'Technik'], GESELL = ['Erdkunde', 'Geschichte', 'Politik', 'Wirtschaft'];
const EINF_KAT = [
  ['Medien', '🖼️ Bilder & Text'], ['Vorlagen', '📌 Meine Vorlagen'], ['Emojis', '😀 Emojis'], ['Struktur', '🧠 Strukturieren'], ['Uebungen', '🎲 Übungen'], ['Gebete', '🙏 Gebet / Impuls'],
  ['Mathe', '➗ Mathe', ['Mathe']], ['Körper', '🧊 Körper und Netze', ['Mathe']], ['Formeln', '📐 Formeln', ['Mathe', 'Physik', 'Chemie', 'NaWi', 'Technik']],
  ['Sprachen', '💬 Sprache', ['Deutsch', 'Englisch', 'Französisch']],
  ['NaWi', '🔬 Naturwissenschaft', NAWI], ['Skelette', '🦴 Skelette', ['NaWi', 'Biologie']],
  ['Gesellschaft', '🌍 Erdkunde & Gesellschaft', GESELL], ['Karten', '🗺️ Karten', ['Erdkunde', 'Geschichte', 'Politik']]
];
const EINF_TEILE = { // welche Vorlagen in welcher Kategorie stehen
  Struktur: ['ablauf', 'mindmap', 'wortwolke', 'venn', 'tabelle', 'zuordnung', 'zeitstrahl', 'diagramm'],
  Mathe: ['koord', 'zahlenmauer', 'zahlenstrahl', 'zahlengerade','bruchkreis', 'bruchstreifen', 'rechnen', 'stellenwert', 'hunderter', 'uhr'],
  Körper: ['wuerfelnetz', 'faltnetz:wuerfel', 'koerpernetz:quader', 'faltnetz:quader', 'koerpernetz:prisma', 'faltnetz:prisma', 'koerpernetz:pyramide', 'faltnetz:pyramide',
    'koerpernetz:tetraeder', 'faltnetz:tetraeder', 'koerpernetz:zylinder', 'faltnetz:zylinder', 'koerpernetz:kegel', 'faltnetz:kegel', 'wuerfelgebaeude', 'wuerfel', 'quader', 'pyramide', 'prisma', 'zylinder', 'kegel', 'kugel'],
  Sprachen: ['vokabeln', 'satzbau', 'wortarten', 'silbenboegen', 'satzglieder'],
  NaWi: ['protokoll', 'messwerte', 'periodensystem', 'schaltzeichen', 'nawi_energiefluss','bio_pflanzenzelle', 'bio_tierzelle', 'bio_bluete', 'bio_auge', 'bio_herz', 'bio_mikroskop'],
  Gesellschaft: ['klima', 'bevoelkerung', 'diagramm']
};
const FORMEL_FACH = { Mathe: /^Mathe/, Physik: /^Physik/, Chemie: /^Chemie/, NaWi: /^(Physik|Chemie)/, Technik: /^Physik/ };
// zweigeteilt: links die Kategorien (immer das erste Element), rechts die Inhalte
function einfuegenPanel() { const a = [].concat(einfuegenInhalt()); return { links: [a[0]], rechts: a.slice(1) }; }
const UEB_ICO = { gruppen: '🗂', reihe: '🔢', paare: '↔', luecke: '▭', mc: '☑', memory: '🃏', karten: '🔁', salat: '🔤', fehler: '🔍', aussagen: '✔✘', recht: '💬', tipp: '👆', kaesten: '🧩' };
// 🎲 Übung bearbeiten im großen Fenster (mehr Platz als in der Seitenleiste)
function uebFenster() { const st = dlg.scrollTop; openDlg(uebungInhalt(uebFenster), true); dlg.classList.add('ue-gross'); dlg.scrollTop = st; }
function uebungInhalt(neu) {
    // Eingabe als Tabelle (bzw. Lückentext: Wörter antippen) – Entwürfe je Übungsart bleiben erhalten
    const U = T.UEBUNGEN; if (!U[uebTyp]) uebTyp = 'gruppen';
    if (uebText[uebTyp] == null) uebText[uebTyp] = '';
    const setze = t => { uebText[uebTyp] = t; };
    const ICO = { gruppen: '🗂', reihe: '🔢', paare: '↔', luecke: '▭', mc: '☑', memory: '🃏', karten: '🔁', salat: '🔤', fehler: '🔍', aussagen: '✔✘', recht: '💬', tipp: '👆', kaesten: '🧩' };
    const typen = h('div', { class: 'kats ue-artliste' }, ...Object.entries(U).map(([k, u]) => h('button', { class: 'kat' + (k === uebTyp ? ' on' : ''), onclick: () => { uebTyp = k; neu(); } }, (ICO[k] || '') + ' ' + u.n)));
    const aufTafel = () => { closeDlg(); T.uebungErzeugen(uebTyp, uebText[uebTyp], { nv: uebNv }); };
    // Niveau beim Einfügen (auf der Tafel jederzeit umschaltbar)
    const NV_TEXT = { gruppen: ['je Gruppe liegt ein Beispiel', 'normal', 'Gruppennamen verdeckt'], reihe: ['erster und letzter Schritt liegen', 'normal', 'ohne Nummern'],
      paare: ['ein Paar als Beispiel, höchstens 6', 'normal', 'normal'], luecke: ['Wortkarten mit Anfangsbuchstaben, ohne Ablenker', 'Wortkarten (+ Ablenker)', 'ohne Wortkarten – hineinschreiben'],
      mc: ['Anzahl richtiger Antworten steht dabei', 'normal', 'normal'], memory: ['höchstens 6 Paare', 'höchstens 10 Paare', 'bis 15 Paare'], salat: ['erster Buchstabe liegt', 'normal', 'zwei Buchstaben zu viel'] };
    Object.entries(U).forEach(([k, u]) => { if (u.nv && !NV_TEXT[k]) NV_TEXT[k] = u.nv; }); /* neue Übungsarten bringen ihre Niveau-Texte selbst mit */
    const nvRow = NV_TEXT[uebTyp] ? h('div', { class: 'ue-nv' }, h('span', { class: 'ue-lbl', style: { margin: 0 } }, 'Niveau'),
      ...[1, 2, 3].map(s => h('button', { class: 'big' + (s === uebNv ? ' on' : ''), title: NV_TEXT[uebTyp][s - 1], onclick: () => { uebNv = s; neu(); } }, '★'.repeat(s))),
      h('span', { class: 'hint', style: { margin: 0 } }, NV_TEXT[uebTyp][uebNv - 1])) : '';
    // Vokabel-Trainer: dieselbe Paar-Liste als andere Übung
    const PAAR = ['paare', 'memory', 'karten', 'salat'];
    const umwRow = PAAR.includes(uebTyp) && uebTyp !== 'salat' ? h('div', { class: 'ue-umw' }, h('span', { class: 'ue-lbl', style: { margin: 0 } }, 'Dieselbe Liste als …'),
      ...PAAR.filter(t => t !== uebTyp).map(t => h('button', { class: 'big', title: t === 'salat' ? 'Buchstabensalat aus der linken Spalte' : '', onclick: () => { uebText[t] = T.uebUmwandeln(uebTyp, uebText[uebTyp], t); uebTyp = t; neu(); } }, ICO[t] + ' ' + U[t].n))) : '';
    const alleListen = (T.uebListen ? T.uebListen() : []), tFach = (S.board && S.board.fach) || '';
    const meine = alleListen.filter(l => uebListenAlle || !l.fach || l.fach === tFach); // Listen ohne Fach (ältere) stehen immer da
    const listenBox = alleListen.length ? h('details', { class: 'ue-listen', open: uebListenAuf, ontoggle: e => { uebListenAuf = e.target.open; } }, h('summary', {}, `📂 Meine Listen (${meine.length}${meine.length !== alleListen.length ? ' von ' + alleListen.length : ''})`),
      h('div', { class: 'ue-listen-inhalt' },
        alleListen.some(l => l.fach && l.fach !== tFach) ? h('button', { class: 'big' + (uebListenAlle ? ' on' : ''), title: 'Auch die Listen anderer Fächer zeigen', onclick: () => { uebListenAlle = !uebListenAlle; uebListenAuf = true; neu(); } }, uebListenAlle ? '📚 alle Fächer' : '📚 nur ' + tFach) : '',
        ...meine.map(l => h('div', { class: 'ue-liste' },
        h('button', { class: 'big', title: 'Laden', onclick: () => { uebTyp = U[l.typ] ? l.typ : uebTyp; uebText[uebTyp] = l.text; neu(); } }, (ICO[l.typ] || '') + ' ' + l.name, h('span', { class: 'ue-typ' }, ((U[l.typ] || {}).n || '') + (l.fach && l.fach !== tFach ? ' · ' + l.fach : ''))),
        h('button', { class: 'ue-weg', title: 'Liste löschen', onclick: async () => { if (await T.frage(`Liste „${l.name}“ löschen?`, { ok: 'Löschen' })) { T.uebLoeschen(l.name); neu(); } } }, '🗑'))))) : '';
    const editor = T.uebEditor ? T.uebEditor(uebTyp, uebText[uebTyp], setze) : h('p', {}, '–');
    // Links die Übungsarten untereinander (und „Meine Listen“) – rechts oben kurze Erklärung mit Beispiel, darunter das große Eingabefeld
    const bspZeilen = String(U[uebTyp].bsp || '').split('\n'), bspKurz = bspZeilen.slice(0, 7).join('\n') + (bspZeilen.length > 7 ? '\n…' : '');
    const erklaerung = h('div', { class: 'ue-erkl' }, h('div', { class: 'ue-erkl-text' }, h('b', {}, 'So geht’s'), h('p', { class: 'hint', style: { margin: '4px 0 0' } }, {
      gruppen: 'Erste Spalte: Name der Gruppe. Rechts daneben die Begriffe – je Feld einer. Neue Felder und Zeilen erscheinen von selbst.',
      reihe: 'Schritte in der richtigen Reihenfolge eintragen – auf der Tafel werden sie gemischt.',
      paare: 'Links und rechts das, was zusammengehört. Rechts wird auf der Tafel gemischt.',
      luecke: 'Text schreiben oder einfügen, dann die Wörter antippen, die zur Lücke werden sollen.',
      mc: 'Frage eintragen, dann die Antworten. Richtige Antworten mit ✓ markieren (Kästchen antippen).',
      memory: 'Paare eintragen (z. B. Wort – Übersetzung, Begriff – Bild-Beschreibung). Bis 15 Paare.',
      karten: 'Vorder- und Rückseite eintragen (z. B. Wort – Übersetzung, Frage – Antwort). An der Tafel dreht Antippen die Karte um.',
      salat: 'Ein Wort pro Zeile (bis 8). Die Buchstaben werden gemischt und in die Kästchen gezogen.' }[uebTyp] || U[uebTyp].hilfe || '')),
      U[uebTyp].bsp ? h('div', { class: 'ue-bsp' }, h('b', {}, 'Beispiel'), h('pre', {}, bspKurz),
        h('button', { class: 'big', title: 'Beispiel ins Eingabefeld übernehmen (zum Anpassen)', onclick: () => { uebText[uebTyp] = U[uebTyp].bsp; neu(); } }, '⤵ Beispiel übernehmen')) : '');
    const bildUeb = (txt, title, fn) => h('button', { class: 'kat', title, onclick: () => { closeDlg(); T.mitBild && T.mitBild(fn); } }, txt);
    const links = h('div', { class: 'ue-links' }, h('h3', { style: { marginTop: 0 } }, 'Übungsart'), typen,
      h('h3', {}, 'Mit einem Bild'), h('div', { class: 'kats ue-artliste' },
        T.puzzleEchtStart ? bildUeb('🧩 Bild-Puzzle', 'Bild in Puzzleteile schneiden – zusammenschieben', b => T.puzzleEchtStart(b)) : '',
        T.beschriftenStart ? bildUeb('🏷 Bild beschriften', 'Punkte ins Bild setzen, Begriffe zuordnen lassen', b => T.beschriftenStart(b)) : '',
        T.puzzleAus ? bildUeb('🔲 Aufdeck-Kacheln', 'Bild mit Kacheln abdecken, einzeln aufdecken', b => T.puzzleAus(b)) : ''),
      h('p', { class: 'hint', style: { fontSize: '13px' } }, 'Nimmt das angetippte Bild – sonst wählen Sie eines aus.'), listenBox);
    const rechts = h('div', { class: 'ue-rechts' },
      h('div', { class: 'ue-kopfzeile' }, h('h2', { style: { margin: 0, flex: 1 } }, (ICO[uebTyp] || '') + ' ' + U[uebTyp].n),
        h('button', { class: 'big', title: 'Liste unter einem Namen speichern', onclick: async () => { await T.uebSpeichern(uebTyp, uebText[uebTyp]); neu(); } }, '💾 Speichern'), h('button', { class: 'big prim', onclick: aufTafel }, '⤴ Auf die Tafel')),
      erklaerung, h('div', { class: 'ue-eingabe' }, editor), nvRow, umwRow,
      h('div', { class: 'row', style: { margin: '10px 0' } },
        h('button', { class: 'big prim', onclick: aufTafel }, '⤴ Auf die Tafel'),
        h('button', { class: 'big', title: 'Liste unter einem Namen speichern', onclick: async () => { await T.uebSpeichern(uebTyp, uebText[uebTyp]); neu(); } }, '💾 Speichern'),
        h('button', { class: 'big', title: 'Alles leeren', onclick: () => { uebText[uebTyp] = ''; neu(); } }, '🧹 Leeren')),
      h('p', { class: 'hint' }, 'Tipp: Tabellen aus Word oder Excel einfach in ein Feld einfügen (Strg+V) – Zeilen und Spalten werden übernommen. Enter springt ins nächste Feld. Auf der Tafel: Kärtchen ziehen bzw. antippen, „✓ Prüfen“, „💡 Lösung“.'));
    return [h('div', { class: 'ue-zwei' }, links, rechts)];
  }
function einfuegenInhalt() {
  const fach = S.board ? S.board.fach : '';
  const sichtbar = EINF_KAT; // immer alle Kategorien – kein Filter nach Fach
  if (!sichtbar.some(([id]) => id === einfKat)) einfKat = 'Medien';
  const tile = (img, name, fn) => h('button', { class: 'tile', onclick: fn }, img, name);
  const kats = h('div', { class: 'kats' }, ...sichtbar.map(([id, l]) => h('button', { class: 'kat' + (einfKat === id ? ' on' : ''), onclick: () => { einfKat = id; zeigeDock('einfuegen'); } }, l)));
  let tiles;
  if (einfKat === 'Karten') {
    const stile = h('div', { class: 'kats' }, ...[['politisch', '🗺 Politisch'], ['physisch', '⛰ Physisch'], ['stumm', '◻ Stumm']].map(([v, l]) =>
      h('button', { class: 'kat' + (kartenStil === v ? ' on' : ''), onclick: () => { kartenStil = v; zeigeDock('einfuegen'); } }, l)));
    const kachel = ([id, em]) => h('button', { class: 'tile', onclick: async () => {
      toast('Karte wird geladen …', 1500);
      try { await T.ladeKarte(id); } catch (e) { toast('Kartendaten fehlen (Ordner app/karten).', 4000); return; }
      insertObj('karte', { ...T.BAUSTEINE.karte.def, ...T.KARTEN_STIL_DEF[kartenStil], gebiet: id });
      toast('Eingefügt – oben umschalten: Politisch / Physisch / Stumm, Namen, Flüsse …', 3000);
    } }, h('div', { class: 'em' }, em), T.KARTEN_GEBIETE[id].n);
    const liste = T.KARTEN_LISTE;
    return [kats, h('h3', {}, 'Kartenart'), stile, h('h3', {}, 'Welt & Kontinente'), h('div', { class: 'tiles' }, liste.slice(0, 7).map(kachel)),
      h('h3', {}, 'Deutschland & Bundesländer'), h('div', { class: 'tiles' }, liste.slice(7).map(kachel)),
      h('p', { class: 'hint' }, 'Kartendaten: Natural Earth (naturalearthdata.com, gemeinfrei). Landschaftsnamen in Deutschland: eigene Zusammenstellung.')];
  }
  if (einfKat === 'Uebungen') { // Übungen werden in einem großen Fenster bearbeitet – hier nur die Auswahl
    const U = T.UEBUNGEN; if (!U[uebTyp]) uebTyp = 'gruppen';
    const ICO = UEB_ICO, alleListen = (T.uebListen ? T.uebListen() : []), tFach = (S.board && S.board.fach) || '';
    const meine = alleListen.filter(l => uebListenAlle || !l.fach || l.fach === tFach);
    return [kats, h('h3', {}, 'Übungsart wählen – öffnet das Bearbeiten-Fenster'),
      h('div', { class: 'tiles klein ue-arten' }, ...Object.entries(U).map(([k, u]) => h('button', { class: 'tile', onclick: () => { uebTyp = k; uebFenster(); } }, h('div', { class: 'em' }, ICO[k] || '🎲'), u.n))),
      meine.length ? h('h3', {}, '📂 Meine Listen') : '',
      meine.length ? h('div', { class: 'ue-listen-inhalt' }, ...meine.map(l => h('button', { class: 'big', style: { justifyContent: 'flex-start' }, title: 'Im Bearbeiten-Fenster öffnen', onclick: () => { uebTyp = U[l.typ] ? l.typ : uebTyp; uebText[uebTyp] = l.text; uebFenster(); } }, (ICO[l.typ] || '') + ' ' + l.name))) : '',
      h('p', { class: 'hint' }, 'Inhalt eintragen, Niveau wählen, „⤴ Auf die Tafel“ – alles im großen Fenster. Auf der Tafel: Kärtchen ziehen, antippen, „✓ Prüfen“, „💡 Lösung“.')];
  }  if (einfKat === 'Gebete') return [kats, ...T.gebetPanel()];
  if (einfKat === 'Emojis') return [kats, alsSchwebe(emojiMenue), ...stempelPanel()];
  if (einfKat === 'Formeln') {
    const out = [kats, alsSchwebe(formelMenue)], passt = null; /* alle Formeln zeigen */
    for (const [abschnitt, liste] of Object.entries(T.FORMELN)) {
      if (passt && !passt.test(abschnitt)) continue; // nur die Formeln des Fachs
      out.push(h('h3', {}, abschnitt), h('div', { class: 'formeln' }, ...liste.map(([name, text]) => {
        const g = T.genObj('formel', { text, groesse: 30 }, false);
        return h('button', { class: 'formel', title: name, onclick: () => { const d = { ...T.BAUSTEINE.formel.def, text, name }, gg = T.genObj('formel', d, false), k = 1 / T.page().view.z, [cx, cy] = T.viewCenter();
          T.snap(); const it = T.addItem({ t: 'o', k: 'formel', d, x: cx - gg.w * k / 2, y: cy - gg.h * k / 2, w: gg.w * k, h: gg.h * k, r: 0 }); nachEinfuegen([it.id]); } },
          h('span', {}, name), h('img', { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(g.svg), alt: text }));
      })));
    }
    out.push(h('p', { class: 'hint' }, 'Antippen setzt die Formel auf die Tafel. Mit „✏️ Bearbeiten“ lässt sie sich ändern – Brüche als {Zähler|Nenner}.'));
    return out;
  }
  if (einfKat === 'Vorlagen') return [kats, T.vorlagenPanel ? T.vorlagenPanel() : '']; // 📌 eigene Vorlagen (meineaufgaben.js)
  if (einfKat === 'Skelette') {
    const box = h('div', { class: 'tiles' }, h('p', { class: 'hint' }, 'Wird geladen …'));
    ladeSkript('app/bilder/skelette.js').then(() => {
      box.innerHTML = '';
      for (const sk of T.SKELETTE) box.append(h('button', { class: 'tile', title: `${sk.quelle} – ${sk.autor}, ${sk.lizenz}`, onclick: () => skelettEinfuegen(sk) }, h('img', { src: sk.src, alt: '' }), sk.n));
    }).catch(() => { box.innerHTML = ''; box.append(h('p', { class: 'hint' }, 'Die Datei app/bilder/skelette.js fehlt.')); });
    // Zum Beschriften (selbst gezeichnet): Skelett links, Schädel rechts daneben – Zeile für Zeile
    const besch = h('div', { class: 'tiles' }, ...(T.SKELETT_BILDER || []).flatMap(([id, n]) => [['bio_sk_' + id, n, 'paar-a'], ['bio_sch_' + id, 'Schädel ' + n, 'paar-b']].filter(([k]) => T.BAUSTEINE[k]).map(([k, name, cls]) =>
      h('button', { class: 'tile ' + cls, onclick: () => { insertObj(k, { ...T.BAUSTEINE[k].def }); toast('Eingefügt – im Kontextmenü „✏️ Bearbeiten“: Nummern, Begriffe, leere Kästchen oder Legende', 3000); } },
        h('img', { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj(k, { ...T.BAUSTEINE[k].def }, false).svg), alt: '' }), name))));
    return [kats, h('h3', {}, 'Zum Beschriften'), besch, h('h3', {}, 'Abbildungen'), box, h('p', { class: 'hint' }, 'Abbildungen von Wikimedia Commons, frei lizenziert (überwiegend gemeinfrei). Unter jedem Bild steht die Quelle – beim Hund (CC BY-SA) bitte stehen lassen. Beschriften einfach mit dem Stift.')];
  }
  tiles = kachelListe(einfKat, tile);
  const schwebbar = einfKat === 'Medien' || EINF_TEILE[einfKat];
  return [kats, schwebbar ? alsSchwebe(() => kachelMenue(einfKat)) : '', einfKat === 'Struktur' && T.zettelPanel ? T.zettelPanel() : '', h('div', { class: 'tiles' }, tiles),
    einfKat === 'Medien' ? h('div', { class: 'ue-erkl', style: { marginTop: '12px', display: 'block' } }, h('b', {}, '🖼 Aus einem Bild eine Übung machen'),
      h('p', { class: 'hint', style: { margin: '4px 0 0' } }, 'Bild einfügen, antippen › ☰: 🧩 Puzzle zum Zusammensetzen · 🔲 Aufdeck-Kacheln · 🏷 Beschriften / Zuordnen. Auch unter 🎲 Übungen › „Mit einem Bild“.')) : '', einfKat === 'Karten' ? h('p', { class: 'hint' }, 'Die Karten sind selbst gezeichnet und stark vereinfacht.') : ''];
}
// Kacheln einer Einfügen-Kategorie – im Seitenbereich und im Schwebemenü dieselben
function kachelListe(kat, tile) {
  if (kat === 'Medien') return [
    tile(h('div', { class: 'em' }, '🖼️'), 'Bild', () => bildEinfuegen()),
    tile(h('div', { class: 'em' }, '📄'), 'PDF-Seiten', () => pdfEinfuegen()),
    tile(h('div', { class: 'em' }, '🔤'), 'Text', () => T.textDialog(null)),
    tile(h('img', { src: T.thumb('abdeckung'), alt: '' }), 'Abdeckung', () => insertObj('abdeckung', { ...T.BAUSTEINE.abdeckung.def }))];
  const vorlagen = ((T.GERUEST_VORLAGEN || {})[kat] || []).map(([em, name, d]) => tile(h('div', { class: 'em' }, em), name, () => { /* 📝 Gerüst als bearbeitbare Vorlage */
    insertObj('geruest', { ...T.BAUSTEINE.geruest.def, ...d }); toast('Gerüst eingefügt – mit „✏️ Bearbeiten“ Texte ändern; im Kontextmenü ★ / ★★ / ★★★ für die Hilfen.', 3500); }));
  const KV = T.KACHEL_VARIANTEN || {}; /* „baustein:variante“ = gleicher Baustein mit voreingestellten Werten */
  const varianten = (EINF_TEILE[kat] || []).filter(k => KV[k] && T.BAUSTEINE[k.split(':')[0]]).length;
  if (varianten) { let warPaar = false; return (EINF_TEILE[kat] || []).filter(k => T.BAUSTEINE[k.split(':')[0]]).map(kk => {
    const k = kk.split(':')[0], v = KV[kk], d = { ...T.BAUSTEINE[k].def, ...(v ? v.d : {}) };
    const bild = v ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj(k, { ...d, ...(v.vorschau || {}) }, false).svg) : T.thumb(k);
    const el = tile(h('img', { src: bild, alt: '' }), v ? v.name : T.BAUSTEINE[k].name, () => { insertObj(k, { ...d }); if (T.BAUSTEINE[k].felder.length) toast('Eingefügt – mit „✏️ Bearbeiten“ anpassen (Maße, Inhalte …)', 2600); });
    /* Netz links, animierte Fassung rechts daneben – Zeile für Zeile; danach geht es in einer neuen Zeile weiter */
    const paar = k === 'faltnetz' ? 'paar-b' : (k === 'wuerfelnetz' || k === 'koerpernetz') ? 'paar-a' : (warPaar ? 'nach-paar' : '');
    if (paar && el && el.classList) el.classList.add(paar); warPaar = paar === 'paar-a' || paar === 'paar-b';
    return el;
  }).concat(vorlagen); }
  return (EINF_TEILE[kat] || []).filter(k => T.BAUSTEINE[k]).map(k => tile(h('img', { src: T.thumb(k), alt: '' }), T.BAUSTEINE[k].name, () => {
    if (k === 'schaltzeichen') return schaltzeichenMenue(); /* schwebendes Menü: Bauteile direkt antippen */
    if (k === 'ablauf' && T.ablaufMenue) return T.ablaufMenue(); /* schwebendes Menü: Abläufe */
    const o = insertObj(k, { ...T.BAUSTEINE[k].def });
    if (k === 'wortwolke') T.editObj(o); /* gleich Begriffe sammeln */
    else if (T.BAUSTEINE[k].felder.length) toast('Eingefügt – mit „✏️ Bearbeiten“ anpassen (Maße, Inhalte …)', 2600);
  })).concat(vorlagen);
}
function kachelMenue(kat) {
  const titel = (EINF_KAT.find(([id]) => id === kat) || [, kat])[1];
  const tile = (img, name, fn) => h('button', { class: 'tile', onclick: fn }, img, name);
  schwebeMenue('kat-' + kat, titel, () => [kat === 'Struktur' && T.zettelPanel ? T.zettelPanel() : '', h('div', { class: 'tiles' }, kachelListe(kat, tile)),
    h('p', { class: 'hint' }, 'Antippen setzt das Element auf die Tafel – das Fenster bleibt offen, bis × getippt wird.')], 440);
}
async function fileToDataURL(file, max = 1800) {
  const url = URL.createObjectURL(file); const img = new Image(); img.src = url; await img.decode();
  const f = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * f); c.height = Math.round(img.naturalHeight * f);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
  const png = /png|gif|svg/.test(file.type);
  return { src: c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.88), w: c.width, h: c.height };
}
function addBild(src, w, hh, at, anteil = 0.6, maxF = 1) { // anteil: wie viel der sichtbaren Tafel das Bild höchstens einnimmt
  const r = T.viewRect(), f = Math.min(maxF, platzBreite() * anteil / w, (r.y1 - r.y0) * (anteil === 0.6 ? 0.6 : 0.8) / hh), [cx, cy] = at || T.viewCenter();
  const o = { t: 'o', id: T.uid(), k: 'bild', d: { src }, x: cx - w * f / 2, y: cy - hh * f / 2, w: w * f, h: hh * f, r: 0 };
  T.snap(); T.addItem(o); nachEinfuegen([o.id]);
  toast('Tipp: Bild an die richtige Stelle ziehen, dann „🔒 Fixieren“ – so verrutscht es beim Schreiben nicht.', 4000);
}
async function bildEinfuegen(file) {
  file = file || await T.pickFile('image/*'); if (!file) return;
  try { const b = await fileToDataURL(file); addBild(b.src, b.w, b.h); } catch (e) { toast('Das Bild konnte nicht gelesen werden.'); }
}
let pdfjs = null;
// PDF-Leser (PDF.js 3.11.174, Apache-2.0) liegt in app/pdfjs bzw. ist in der Einzeldatei eingebettet → funktioniert ohne Internet
// und ohne Verbindung zu fremden Servern. Nur wenn beides fehlt: Rückfall auf cdnjs.
async function ladePdfJs() {
  if (pdfjs) return pdfjs;
  const lokal = 'app/pdfjs/', eing = n => document.querySelector(`script[data-src="${lokal + n}"]`);
  const skript = (src, text) => new Promise((res, rej) => { const s = document.createElement('script'); if (text != null) { s.textContent = text; document.head.append(s); res(); } else { s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); } });
  try {
    const e1 = eing('pdf.min.js'), e2 = eing('pdf.worker.min.js');
    if (!window.pdfjsLib) { if (e1) await skript(null, e1.textContent); else await skript(lokal + 'pdf.min.js'); }
    let code = e2 ? e2.textContent : null;
    if (!code) try { const r = await fetch(lokal + 'pdf.worker.min.js'); if (r.ok) code = await r.text(); } catch (e) {}
    if (code) window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    else await skript(lokal + 'pdf.worker.min.js'); // file://: Worker im Hauptthread (pdf.js nutzt dann globalThis.pdfjsWorker)
    return (pdfjs = window.pdfjsLib);
  } catch (e) { /* weiter mit Internet-Rückfall */ }
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = base + 'pdf.min.js'; s.onload = res; s.onerror = rej; document.head.append(s); });
  try { const code = await (await fetch(base + 'pdf.worker.min.js')).text(); window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }
  catch (e) { window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js'; }
  return (pdfjs = window.pdfjsLib);
}
async function pdfEinfuegen() {
  const file = await T.pickFile('application/pdf'); if (!file) return;
  toast('PDF wird geladen …', 8000);
  let lib; try { lib = await ladePdfJs(); } catch (e) { toast('Der PDF-Leser konnte nicht geladen werden. Alternativ: PDF-Seite als Bild (Screenshot) einfügen.', 6000); return; }
  try {
    const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise, max = Math.min(pdf.numPages, 30);
    T.snap(); const start = S.page + 1;
    for (let i = 1; i <= max; i++) {
      const pg = await pdf.getPage(i), vp0 = pg.getViewport({ scale: 1 }), sc = 1600 / vp0.width, vp = pg.getViewport({ scale: sc });
      const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: ctx, viewport: vp }).promise;
      const page = T.newPage('weiss'), w = 1200, hh = w * vp.height / vp.width;
      page.items.push({ t: 'o', id: T.uid(), k: 'bild', d: { src: c.toDataURL('image/jpeg', 0.85) }, x: 40, y: 40, w, h: hh, r: 0 });
      const z = Math.min((innerWidth - 40) / (w + 80), (innerHeight - 160) / (hh + 80)); page.view = { x: 20 - 40 * z + 20, y: 70, z };
      S.board.pages.splice(start + i - 1, 0, page);
    }
    gotoPage(start); toast(`${max} PDF-Seite(n) als neue Tafelseiten eingefügt.`);
  } catch (e) { toast('Die PDF-Datei konnte nicht gelesen werden.'); }
}

// Aufgabengenerator
const bruchHTML = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  .replace(/(\d+)\s*\/\s*(\d+)/g, '<span class="fr"><span>$1</span><span>$2</span></span>');
function aufgabenPanel() {
  // nur die Aufgaben des Fachs: NaWi-Tafel → NaWi, Mathe-Tafel → Mathe, schnelle Tafel → alle
  const fa = fachAufgaben(), nawiTafel = fa !== 'mathe' && fa !== 'alle'; // NaWi/Englisch: nur Aufgaben, ohne Rechenwege/Plotter/GeoGebra
  const passtFach = k => fa === 'alle' || KAT_FACH((T.AUFGABEN[k] || {}).kat || '') === fa;
  let typ = T.AUFGABEN[T.opts.aufTyp] && passtFach(T.opts.aufTyp) ? T.opts.aufTyp : fa === 'nawi' ? 'nwEinheit' : fa === 'englisch' ? 'enVerben' : 'plus', jg = T.opts.aufJg || 0, stufe = 1, anz = 8, loes = T.opts.aufLoes || 'einzeln', platz = T.opts.platz || 'mittel';
  // Jahrgangsfilter + Liste nach Kategorien (untereinander)
  const typen = h('div', { class: 'aufliste' });
  const zeigeTypen = () => {
    typen.innerHTML = '';
    const kats = T.AUFGABEN_KAT.filter(([k]) => fa === 'alle' || KAT_FACH(k) === fa);
    for (const [kat, titel] of kats) {
      const passend = Object.entries(T.AUFGABEN).filter(([, A]) => A.kat === kat && (!jg || (A.jg[0] <= jg && jg <= A.jg[1])));
      if (!passend.length) continue;
      typen.append(h('h4', {}, titel), ...passend.map(([k, A]) => h('button', { class: k === typ ? 'on' : '', 'data-k': k, onclick: () => { typ = k; T.opts.aufTyp = k; T.saveOpts(); typen.querySelectorAll('button').forEach(c => c.classList.toggle('on', c.dataset.k === k)); vorschau(); } },
        h('span', {}, A.name), h('small', {}, 'Jg. ' + (A.jg[0] === A.jg[1] ? A.jg[0] : A.jg[0] + '–' + A.jg[1])))));
    }
  };
  const jgRow = h('div', { class: 'row jgwahl' }, ...[0, 5, 6, 7, 8, 9, 10].map(j => h('button', { class: 'big' + (j === jg ? ' on' : ''), 'data-j': j, onclick: () => { jg = j; T.opts.aufJg = j; T.saveOpts(); [...jgRow.children].forEach(c => c.classList.toggle('on', +c.dataset.j === j)); zeigeTypen(); } }, j ? String(j) : 'Alle')));
  zeigeTypen();
  const sterne = h('div', { class: 'row' }, ...[1, 2, 3].map(s => h('button', { class: 'big' + (s === stufe ? ' on' : ''), 'data-s': s, onclick: () => { stufe = s; [...sterne.children].forEach(c => c.classList.toggle('on', +c.dataset.s === s)); vorschau(); } }, '★'.repeat(s))));
  const anzahl = h('div', { class: 'row' }, ...[4, 6, 8, 10, 12, 16].map(a => h('button', { class: 'big' + (a === anz ? ' on' : ''), 'data-a': a, onclick: () => { anz = a; [...anzahl.children].forEach(c => c.classList.toggle('on', +c.dataset.a === a)); vorschau(); } }, String(a))));
  const lsg = h('select', { class: 'feld', onchange: e => { loes = e.target.value; T.opts.aufLoes = loes; T.saveOpts(); } }, ...[['einzeln', 'neben jeder Aufgabe – einzeln antippen zum Aufdecken'], ['abdeckung', 'alle zusammen unter einer Abdeckung'], ['seite', 'auf neuer Seite'], ['keine', 'ohne Lösungen']]
    .map(([v, l]) => h('option', { value: v, selected: v === loes }, l)));
  const pre = h('div', { class: 'vorschau' });
  let cur = null;
  const vorschau = () => { cur = T.erzeugeAufgaben(typ, stufe, anz); pre.innerHTML = bruchHTML(cur.titel + '\n' + cur.aufgaben.join('\n') + '\n\nLösungen: ' + cur.loesungen.join('   ')); };
  vorschau();
  const PLATZ = [['wenig', 'wenig'], ['mittel', 'mittel'], ['viel', 'viel (schriftlich)']];
  const platzRow = h('div', { class: 'row' }, ...PLATZ.map(([v, l]) => h('button', { class: 'big' + (v === platz ? ' on' : ''), 'data-p': v, onclick: () => { platz = v; T.opts.platz = v; T.saveOpts(); [...platzRow.children].forEach(c => c.classList.toggle('on', c.dataset.p === v)); } }, l)));
  T.dockKopf(h('button', { class: 'big', title: 'Neue Zahlen würfeln', onclick: vorschau }, '🎲'),
    h('button', { class: 'big prim', title: 'Aufgaben (Vorschau unten) auf die Tafel', onclick: () => { aufgabenEinfuegen(cur, loes, platz, { typ, stufe, anz }); vorschau(); if (matheWahl === 'gen') zeigeRechts(); } }, '⤴ Auf die Tafel'));
  const ggb = h('div', { class: 'tiles klein' }, ...[['graphing', '📈', 'Grafik­rechner'], ['geometry', '📐', 'Geometrie'], ['3d', '🧊', '3D'], ['cas', '🧮', 'CAS']].map(([app, em, n]) =>
    h('button', { class: 'tile', onclick: () => { schliesseDock(); T.geogebra(app); } }, h('div', { class: 'em' }, em), n)));
  // links: Erklärungen, GeoGebra und die Themen des Aufgabengenerators – rechts das Gewählte
  const rechts = h('div'), wahlKats = h('div', { class: 'kats' });
  const zeigeRechts = () => {
    rechts.innerHTML = '';
    wahlKats.querySelectorAll('.kat').forEach(b => b.classList.toggle('on', b.dataset.w === matheWahl));
    typen.querySelectorAll('button').forEach(c => c.classList.toggle('on', matheWahl === 'gen' && c.dataset.k === typ));
    if (matheWahl === 'erkl') rechts.append(h('h3', { style: { marginTop: '2px' } }, 'Erklärungen'), h('div', { class: 'tiles klein' }, h('button', { class: 'tile', onclick: () => zeigeDock('mathe-rechenwege') }, h('div', { class: 'em' }, '📘'), 'Rechenwege Schritt für Schritt')));
    else if (matheWahl === 'rechner') rechts.append(h('h3', { style: { marginTop: '2px' } }, 'Rechner'), h('div', { class: 'tiles klein' },
      h('button', { class: 'tile', onclick: () => taschenrechnerAufTafel() }, h('div', { class: 'em' }, '🧮'), 'Taschenrechner'),
      h('button', { class: 'tile', onclick: () => T.teilerFinder() }, h('div', { class: 'em' }, '🔢'), 'Vielfache & Teiler')),
      h('p', { class: 'hint' }, 'Beide öffnen sich als Fenster auf der Tafel – verschieben am Kopf, schließen mit ×. Ergebnisse mit „⤴ … auf die Tafel“ übernehmen.'));
    else if (matheWahl === 'meine' && T.meineAufgabenPanel) {
      const ctx = { einfuegen: (a, art) => aufgabenEinfuegen(a, art || loes, platz), optionen: [h('h3', {}, 'Platz zum Rechnen'), platzRow, h('label', { class: 'fld' }, 'Lösungen', lsg)] };
      const neu = () => { rechts.innerHTML = ''; rechts.append(...T.meineAufgabenPanel(ctx, neu).filter(Boolean)); };
      neu();
    }
    else if (matheWahl === 'ggb') rechts.append(h('h3', { style: { marginTop: '2px' } }, 'GeoGebra (mit Internet)'), ggb);
    else if (matheWahl === 'plot') rechts.append(h('h3', { style: { marginTop: '2px' } }, 'Funktionsplotter'),
      h('div', { class: 'tiles klein' }, h('button', { class: 'tile', onclick: () => T.plotter() }, h('div', { class: 'em' }, '📈'), 'Funktions­plotter öffnen')),
      h('p', { class: 'hint' }, 'Funktionen eingeben (z. B. 2x+1 oder 0,5x^2−3), zeichnen lassen und mit „⤴ Auf die Tafel“ einfügen – auch mit Wertetabelle. Ein Koordinatensystem mit Funktionen gibt es außerdem unter Einfügen › Mathe.'));
    else {
      const satz = T.page().aufgabenSatz, aufTafel = satz && T.page().items.some(i => i.ag === satz.ag);
      rechts.append(h('h2', { style: { margin: '2px 0 4px', fontSize: '20px' } }, T.AUFGABEN[typ].name),
        aufTafel ? h('div', { class: 'row', style: { margin: '6px 0 4px' } }, h('button', { class: 'big', title: 'Die Aufgaben auf der Tafel durch neue Zahlen ersetzen', onclick: () => neueAufgaben() }, '🎲 Neue Aufgaben auf der Tafel'),
          h('button', { class: 'big', onclick: () => alleLoesungen(true) }, '👁 Alle Lösungen'), h('button', { class: 'big', onclick: () => alleLoesungen(false) }, '🙈 Verdecken')) : '',
        h('h3', {}, 'Niveau'), sterne, h('h3', {}, 'Anzahl'), anzahl, h('h3', {}, 'Platz zum Rechnen'), platzRow,
        h('label', { class: 'fld' }, 'Lösungen', lsg),
        h('h3', {}, 'Vorschau  (oben: 🎲 neu würfeln, ⤴ Auf die Tafel)'), pre,
        h('p', { class: 'hint' }, 'Jede Aufgabe ist ein eigenes Element und lässt sich einzeln verschieben. Lösungen „neben jeder Aufgabe“: antippen deckt eine Lösung auf (nochmals: zu). Auf karierten Seiten stehen Zahlen in den Kästchen und rasten beim Verschieben ein.'));
    }
  };
  if (fa === 'eigen') matheWahl = 'meine'; // Fächer ohne Generator: nur eigene Aufgaben
  else if (nawiTafel && matheWahl !== 'meine') matheWahl = 'gen'; // Erklärungen, Plotter, GeoGebra gehören zu Mathe
  const wahlen = fa === 'eigen' ? [['meine', '⭐ Meine Aufgaben']] : nawiTafel ? [['gen', '🎲 Aufgaben'], ['meine', '⭐ Meine Aufgaben']] : [['gen', '🎲 Aufgaben'], ['meine', '⭐ Meine Aufgaben'], ['erkl', '📘 Erklärungen'], ['rechner', '🧮 Rechner'], ['plot', '📈 Funktionsplotter'], ['ggb', '📐 GeoGebra']];
  // „Meine Aufgaben“ hat eigene Knöpfe – beim Wechsel von/zu „Meine“ die Leiste neu aufbauen (Kopfknöpfe 🎲 / ⤴ gehören zum Generator)
  for (const [w, l] of wahlen) wahlKats.append(h('button', { class: 'kat', 'data-w': w, onclick: () => { const neu = (w === 'meine') !== (matheWahl === 'meine'); matheWahl = w; if (neu) zeigeDock('aufgaben'); else zeigeRechts(); } }, l));
  typen.addEventListener('click', e => { if (e.target.closest('button')) { const neu = matheWahl === 'meine'; matheWahl = 'gen'; if (neu) zeigeDock('aufgaben'); else zeigeRechts(); } });
  if (matheWahl === 'meine') T.dockKopf();
  zeigeRechts();
  if (fa === 'eigen') return { links: [wahlKats, h('p', { class: 'hint' }, 'Für dieses Fach gibt es keine automatisch erzeugten Aufgaben – hier legen Sie eigene Sammlungen an, speichern sie und holen sie mit einem Tipp auf die Tafel.')], rechts };
  return { links: [wahlKats, h('h3', {}, 'Jahrgang'), jgRow, h('h3', {}, 'Thema'), typen], rechts };
}
let matheWahl = 'gen';
// 🧮 Taschenrechner als Fenster auf der Tafel (verschiebbar, mit „⤴ Rechnung auf die Tafel“)
function taschenrechnerAufTafel() {
  const alt = document.querySelector('.widget.w-rechner'); if (alt) { alt.style.zIndex = ++wz; return; }
  widget('🧮 Taschenrechner', [T.rechner()], Math.max(20, innerWidth / 2 - 180), 80).classList.add('w-rechner');
}
// Aufgaben einzeln auf die Tafel – auf karierten Seiten in Kästchenschrift, am Raster ausgerichtet
// meta: { typ, stufe, anz } zum Neu-Erzeugen; x0/yTop/ohneSnap beim Ersetzen eines vorhandenen Satzes
function aufgabenEinfuegen(a, loes, platz = 'mittel', meta = null) {
  const PL = { wenig: [1, 3], mittel: [3, 6], viel: [6, 10] }[platz] || [3, 6]; // [freie Kästchenzeilen darunter, freie Kästchen daneben]
  const pg = T.page(), g = T.gridPx(pg), ink = T.isDark(pg) ? '#ffffff' : '#1a1a1a', r = T.viewRect(), u = g || 40;
  const up = v => g ? Math.ceil(v / g - 1e-6) * g : v, snap = v => g ? Math.round(v / g) * g : v;
  const kurz = t => t.replace(/\s{2,}/g, ' ').trim();
  const nurMathe = t => /^[a-z]{1,2}\)\s[0-9xX+\-−·:=()/,.\s]*$/.test(t);
  const obj = (d, x, y) => { const m = T.textMetrics(d); return { t: 'o', id: T.uid(), k: 'text', d, x, y, w: m.w, h: m.h, r: 0 }; };
  const text = (t, x, y, c, fett, gross) => {
    t = kurz(t);
    if (g && t.split('\n').every(nurMathe)) return obj({ text: t, size: g * 0.62, c: c || ink, fett: !!fett, karo: g }, x, y);
    return obj({ text: t, size: gross || (g ? g * 0.55 : 36), c: c || ink, fett: !!fett }, x, y);
  };
  // + − · mit Zahlen: gleich als schriftliche Aufgabe (stellengerecht in Kästchen), sonst als Text
  const aufgabeObj = (t, x, y) => {
    const m = kurz(t).match(/^([a-z]{1,2}\))\s*([\d.]+(?:,\d+)?)\s*([+−·])\s*([\d.]+(?:,\d+)?)\s*=?$/);
    if (!m || (meta && meta.typ === 'einmaleins')) return text(t, x, y); // Einmaleins bleibt Kopfrechnen
    const d = { op: m[3], a: m[2], b: m[4], label: m[1], zelle: g || 48, raster: !g }, gg = T.genObj('schriftlich', d, false);
    return { t: 'o', id: T.uid(), k: 'schriftlich', d, x, y, w: gg.w, h: gg.h, r: 0 };
  };
  if (!meta || !meta.ohneSnap) T.snap();
  const items = [], ag = T.uid(); // ag: Kennung des Aufgabensatzes (für „Neue Aufgaben“ und „Alle Lösungen“)
  // Steht schon etwas auf der Seite, kommt der neue Satz darunter (nicht darüber)
  const belegt = pg.items.filter(i => !(i.t === 'o' && i.k === 'abdeckung')).reduce((m, i) => Math.max(m, T.bbox(i).y1), -Infinity);
  const x0 = meta && meta.x0 != null ? meta.x0 : snap(r.x0 + 2 * u);
  const yTop = meta && meta.yTop != null ? meta.yTop : isFinite(belegt) && belegt > r.y0 + 1.5 * u ? up(belegt + 2 * u) : snap(r.y0 + 1.5 * u);
  const titel = text(a.titel, x0, yTop, '#5b5bd6', true, g ? g * 0.7 : 40); items.push(titel);
  const yStart = up(yTop + titel.h + u * 1.5), proSpalte = Math.ceil(a.aufgaben.length / (a.aufgaben.length > 4 ? 2 : 1));
  const zeile = g || 60; // eine (Kästchen-)Zeile
  const einzeln = loes === 'einzeln' && a.loesungen.length === a.aufgaben.length;
  // Spalten: Aufgaben untereinander; bei „einzeln“ steht jede Lösung auf Höhe ihrer Aufgabe – mit Platz zum Rechnen dazwischen
  const spalten = []; a.aufgaben.forEach((t, i) => { const s = Math.floor(i / proSpalte); (spalten[s] = spalten[s] || []).push(i); });
  let x = x0, maxX = x0 + titel.w;
  for (const sp of spalten) {
    let y = yStart; const obs = sp.map(i => { const o = aufgabeObj(a.aufgaben[i], x, y); y = up(y + o.h + (o.k === 'schriftlich' ? 1 : PL[0]) * zeile); return o; }); // Platz zum Rechnen unter jeder Aufgabe
    const colW = Math.max(...obs.map(o => o.w)); items.push(...obs); let ende = x + colW;
    if (einzeln) {
      const lx = up(x + colW + Math.max(PL[1], 4) * u);
      sp.forEach((i, j) => { const d = { text: kurz(a.loesungen[i]), offen: false, size: g ? g * 0.55 : 36 }, gg = T.genObj('loesung', d, false);
        const mitte = obs[j].k === 'schriftlich' ? T.genObj('schriftlich', obs[j].d, false).ergebnis : obs[j].h / 2; // schriftlich: auf Höhe der Ergebniszeile
        const o = { t: 'o', id: T.uid(), k: 'loesung', d, x: lx, y: obs[j].y + mitte - gg.h / 2, w: gg.w, h: gg.h, r: 0 }; items.push(o); ende = Math.max(ende, lx + gg.w); });
      x = up(ende + 3 * u);
    } else x = up(ende + PL[1] * u);
    maxX = Math.max(maxX, ende);
  }
  maxX = up(maxX + PL[1] * u); // rechts daneben ebenfalls Platz zum Rechnen
  if (a.zeigeGraph && a.graphen) {
    const gr = placeObj('koord', { ...T.BAUSTEINE.koord.def, xmin: -6, xmax: 6, ymin: -6, ymax: 6, einheit: 0.7, ohneTerm: true, funktionen: a.graphen.slice(0, 5).join('\n') }, null, 1);
    gr.x = maxX; gr.y = yStart; items.push(gr); maxX = up(maxX + gr.w + u);
  }
  for (const it of items) pg.items.push(it);
  const lz = a.loesungen.map(kurz).join('\n');
  if (einzeln) {} // Lösungen stehen schon neben den Aufgaben
  else if (loes === 'abdeckung' || loes === 'einzeln') {
    const lk = text('Lösungen', maxX, yTop, '#2e7d32', true, g ? g * 0.55 : 32), l = text(lz, maxX, yStart, '#2e7d32');
    pg.items.push(lk, l); items.push(lk, l);
    // Abdeckung über Überschrift und Lösungen (gleiches Seitenverhältnis wie die Vorlage)
    const bx = maxX - 15, by = yTop - 15, bw = Math.max(l.w, lk.w) + 30, bh = l.y + l.h - yTop + 30;
    const ab = placeObj('abdeckung', { text: 'Lösungen – zum Aufdecken verschieben' }, null, 1);
    ab.w = bw; ab.h = bh; ab.x = bx; ab.y = by; pg.items.push(ab); items.push(ab);
  } else if (loes === 'seite') {
    const p = T.newPage(pg.bg); p.abstand = pg.abstand || null;
    const l = text(lz, snap(2 * u), snap(2 * u), '#2e7d32'); p.items.push(l);
    S.board.pages.splice(S.page + 1, 0, p); toast('Lösungen stehen auf Seite ' + (S.page + 2));
  }
  for (const it of items) it.ag = ag;
  if (meta && meta.typ) pg.aufgabenSatz = { ag, typ: meta.typ, stufe: meta.stufe, anz: meta.anz, loes, platz, x0, yTop };
  if (!(meta && meta.ohneSnap)) nachEinfuegen(); /* Board: Stift schreibt, Finger verschiebt die Aufgaben; PC: Auswahl */
  if (meta && meta.ohneSnap) { T.render(); T.renderOver(); updateToolbar(); return; } // beim Ersetzen bleibt die Ansicht
  // Ansicht so anpassen, dass alle neuen Aufgaben sichtbar sind
  const bb = items.reduce((b, it) => ({ x0: Math.min(b.x0, it.x), y0: Math.min(b.y0, it.y), x1: Math.max(b.x1, it.x + it.w), y1: Math.max(b.y1, it.y + it.h) }), { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
  if (bb.x0 < r.x0 || bb.y0 < r.y0 || bb.x1 > r.x1 || bb.y1 > r.y1 - 2 * u) {
    const v = pg.view, z = Math.min(v.z, (T.W - T.ox - 60) / (bb.x1 - bb.x0), (T.H - 200) / (bb.y1 - bb.y0));
    v.z = T.clamp(z, 0.1, 8); v.x = 30 - bb.x0 * v.z; v.y = 76 - bb.y0 * v.z; T.onZoom && T.onZoom(); T.renderOver();
  }
  T.render(); updateToolbar();
}

// Lösungen: einzeln antippen (eingabe.js), alle auf einmal, neue Aufgaben an derselben Stelle
T.loesungUmschalten = o => { T.snap(); T.replaceItem({ ...o, d: { ...o.d, offen: !o.d.offen } }); T.renderOver(); };
function alleLoesungen(an) {
  const pg = T.page(); if (!pg.items.some(i => i.k === 'loesung')) { toast('Auf dieser Seite gibt es keine Lösungen zum Antippen.'); return; }
  T.snap(); pg.items = pg.items.map(i => i.k === 'loesung' && !!i.d.offen !== an ? { ...i, d: { ...i.d, offen: an } } : i); T.render(); T.renderOver();
}
function neueAufgaben() {
  const pg = T.page(), m = pg.aufgabenSatz;
  if (!m || !pg.items.some(i => i.ag === m.ag) || !T.AUFGABEN[m.typ]) { toast('Auf dieser Seite stehen keine Aufgaben aus dem Generator.'); return; }
  T.snap(); pg.items = pg.items.filter(i => i.ag !== m.ag); S.sel = null;
  aufgabenEinfuegen(T.erzeugeAufgaben(m.typ, m.stufe, m.anz), m.loes, m.platz, { ...m, ohneSnap: true });
  toast('🎲 Neue Aufgaben – gleiches Thema, neue Zahlen.', 1800);
}
T.alleLoesungen = alleLoesungen; T.neueAufgaben = neueAufgaben;

// Winkel genau eingeben (Tippen auf ↻)
T.angleDialog = I => {
  const D = T.INSTR[I.kind]; let deg = Math.round(-I.a * 180 / Math.PI); deg = ((deg % 360) + 360) % 360;
  const inp = h('input', { type: 'text', value: deg, inputmode: 'decimal', style: { fontSize: '30px', width: '160px' } });
  const set = v => { T.setAngleAbout(I, -v * Math.PI / 180, D.center[0], D.center[1]); T.renderOver(); };
  openDlg([h('h2', {}, D.name + ': Winkel und Größe'), h('label', { class: 'fld' }, 'Winkel in Grad (gegen den Uhrzeigersinn)', inp),
    h('div', { class: 'row' }, ...[0, 15, 30, 45, 60, 90, 120, 135, 180, 270].map(v => h('button', { class: 'big', onclick: () => { set(v); closeDlg(); } }, v + '°'))),
    h('h3', {}, 'Größe (auch mit zwei Fingern aufziehen)'),
    h('div', { class: 'row' }, ...[[0.75, '75 %'], [1, '100 %'], [1.5, '150 %'], [2, '200 %'], [3, '300 %']].map(([k, l]) => h('button', { class: 'big' + (Math.abs((I.s || 1) - k) < 0.01 ? ' on' : ''), onclick: () => { T.setScaleAbout(I, k, D.center[0], D.center[1]); T.renderOver(); closeDlg(); } }, l))),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => { const v = parseFloat(String(inp.value).replace(',', '.')); if (!isNaN(v)) set(v); closeDlg(); } }, 'Drehen'))]);
  setTimeout(() => inp.select(), 50);
};

// ---------- Einstellungen ----------
// Farben der Werkzeugleiste auswählen (Stift bzw. Marker), ↺ = Standard
function farbWahl(art, angebot, name) {
  const box = h('div', { class: 'farbwahl' });
  const zeichne = () => {
    const akt = leisteFarben(art); box.innerHTML = '';
    box.append(h('b', {}, name + ':'), ...angebot.map(c => h('button', { class: 'sw' + (akt.includes(c) ? ' on' : ''), style: { background: c }, title: c, onclick: () => {
      let l = leisteFarben(art).slice(); if (l.includes(c)) l = l.filter(x => x !== c); else if (l.length < 8) l.push(c); else { toast('Höchstens 8 Farben in der Leiste.', 1800); return; }
      if (!l.length) { toast('Mindestens eine Farbe bleibt in der Leiste.', 1800); return; }
      T.opts.leisteFarben = { ...(T.opts.leisteFarben || {}), [art]: angebot.filter(x => l.includes(x)) }; T.saveOpts(); zeichne(); updateToolbar(); } })),
      h('button', { class: 'big', title: 'Standardfarben', onclick: () => { if (T.opts.leisteFarben) delete T.opts.leisteFarben[art]; T.saveOpts(); zeichne(); updateToolbar(); } }, '↺'));
  };
  zeichne(); return box;
}
function settingsDialog() {
  const o = T.opts, sel = (k, opts) => h('select', { onchange: e => { o[k] = e.target.value; T.saveOpts(); } }, ...opts.map(([v, l]) => h('option', { value: v, selected: o[k] === v }, l)));
  const chk = (k, l, fn) => { const i = h('input', { type: 'checkbox', onchange: e => { o[k] = e.target.checked; T.saveOpts(); fn && fn(); } }); i.checked = !!o[k]; return h('label', { class: 'fld check' }, i, l); };
  const chk2 = (k, l) => { const i = h('input', { type: 'checkbox', onchange: e => { o[k] = e.target.checked; T.saveOpts(); } }); i.checked = o[k] !== false; return h('label', { class: 'fld check' }, i, l); }; // Standard: an
  const glatt = () => h('input', { type: 'range', min: 0, max: 0.8, step: 0.05, value: o.glatt, oninput: e => { o.glatt = +e.target.value; T.saveOpts(); } });
  const auswahl = (k, liste, std, fn) => h('select', { onchange: e => { const v = typeof std === 'number' ? +e.target.value : e.target.value; if (v === std || v === '' || v === 0) delete o[k]; else o[k] = v; T.saveOpts(); fn && fn(); } },
    ...liste.map(([v, l]) => h('option', { value: v, selected: (o[k] == null ? std : o[k]) === v }, l)));
  const tipp = t => h('p', { class: 'hint', style: { marginTop: '-4px' } }, t);
  const abschnitt = t => h('h3', {}, t);
  // Zweigeteilt: links die Bereiche, rechts die Einstellungen des gewählten Bereichs (entzerrt das lange Fenster)
  const BEREICHE = [
    ['stift', '✒ Stift & Schreiben', () => [
      h('label', { class: 'fld' }, 'Standard-Strichstärke des Stifts', h('select', { onchange: e => { o.stiftStaerke = +e.target.value; S.groesse.stift = o.stiftStaerke; T.saveOpts(); updateToolbar(); } },
        ...[[2, 'S – fein'], [4, 'M – normal'], [8, 'L – kräftig'], [14, 'XL – sehr kräftig']].map(([v, l]) => h('option', { value: v, selected: (o.stiftStaerke || 4) === v }, l)))),
      h('label', { class: 'fld' }, 'Druckstärke des Stifts', sel('druck', [['auto', 'automatisch (Druck oder Tempo)'], ['aus', 'aus – immer gleich dick']])),
      h('label', { class: 'fld' }, 'Stift-Reaktion beim Schreiben', h('select', { onchange: e => { o.stiftTempo = e.target.value; T.saveOpts(); } },
        ...[['schnell', '🏃 Schnell – Tinte direkt am Stift (Standard)'], ['vorhersage', '⚡ Sehr schnell – Tinte direkt am Stift, mit Vorhersage'], ['normal', '🐢 Ruhig – wie früher, Tinte folgt leicht verzögert']]
          .map(([v, l]) => h('option', { value: v, selected: (o.stiftTempo || 'schnell') === v }, l)))),
      tipp('Wirkt nur beim Schreiben; der fertige Strich ist immer gleich. Schießt die Tinte bei „Sehr schnell“ an Kurven übers Ziel hinaus: „Schnell“ wählen.'),
      h('label', { class: 'fld' }, 'Glättung der Handschrift', glatt()),
      (() => { const i = h('input', { type: 'checkbox', onchange: e => { o.formAus = !e.target.checked; T.saveOpts(); } }); i.checked = !o.formAus; return h('label', { class: 'fld check' }, i, '🔷 Formerkennung: Kreis, Dreieck, Rechteck oder Linie zeichnen und den Stift kurz halten → saubere Form'); })(),
      abschnitt('✌ Doppeltipp mit dem Stift'),
      h('label', { class: 'fld' }, 'Zwei kurze Tipper an derselben Stelle schalten …', h('select', { onchange: e => { if (e.target.value) o.doppeltipp = e.target.value; else delete o.doppeltipp; T.saveOpts(); } },
        ...(T.DOPPEL_ZIELE || [['', 'aus']]).map(([v, l]) => h('option', { value: v, selected: (o.doppeltipp || '') === v }, l)))),
      h('label', { class: 'fld' }, 'Geschwindigkeit', auswahl('doppelTempo', [[250, 'schnell (0,25 s)'], [350, 'mittel (0,35 s)'], [500, 'langsam (0,5 s)']], 350)),
      tipp('Schneller umstellen: im Stift-Menü neben der Formerkennung. „🔁 zuletzt benutzt“ nimmt das zuletzt eingeschaltete Hilfsmittel. Löst es beim Schreiben (ä, ö, ü) versehentlich aus: „schnell“ wählen oder ausschalten.')]],
    ['board', '☝ Finger & Board', () => [
      h('label', { class: 'fld' }, 'Finger (Berührung ohne Stift)', sel('finger', [['pan', 'verschieben & zoomen (Stift schreibt)'], ['radieren', 'radieren (2 Finger verschieben)'], ['schreiben', 'schreiben wie der Stift (Board unterscheidet nicht)']])),
      chk2('stiftSchreibt', '✒ Stift schreibt immer – bedient keine Elemente (Lösungen, Uhr, Kärtchen nur mit dem Finger)'),
      chk('nurGriffeAn', '✥ Elemente nur über die Griffe verschieben – ein Finger auf dem Element bewegt dann die Tafel. Standard (aus): Finger greift das Element direkt, zweiter Finger dreht und vergrößert'),
      tipp('1 Finger: Tafel verschieben, Elemente greifen und antippen. 2 Finger: zoomen bzw. Element drehen und vergrößern. Handballen: radieren.'),
      chk('palm', 'Handballen / Schwamm (große Berührfläche) radiert'),
      h('label', { class: 'fld' }, 'Radiergröße für Handballen / Schwamm', auswahl('handRadierer', [[0, 'automatisch (so groß wie die Hand)'], [60, 'klein'], [120, 'mittel'], [200, 'groß'], [320, 'sehr groß']], 0)),
      chk('tastatur', '⌨ Eigene Bildschirmtastatur der Tafel-App (erscheint bei jedem Eingabefeld)', () => T.tastaturUmschalten && T.tastaturUmschalten()),
      abschnitt('Stift-Test'),
      h('p', { class: 'hint', html: 'Oben rechts steht nach jeder Berührung, was die Tafel meldet: <b>✒ Stift</b>, <b>☝ Finger</b> oder <b>🖱 Maus</b>. Erscheint beim Schreiben mit dem SMART-Stift ein „Screenshot“ mit eigener Ink-Leiste, ist SMART Ink aktiv – siehe Anleitung, Abschnitt „SMART Board“.' })]],
    ['formen', '📐 Formen & Messen', () => {
      const box = (an, label, set) => { const i = h('input', { type: 'checkbox', onchange: e => { set(e.target.checked); T.saveOpts(); } }); i.checked = an; return h('label', { class: 'fld check' }, i, label); };
      const nm = () => o.neuMasse || (o.neuMasse = {});
      return [
        box(o.winkelFrage !== false, '❓ Winkel zuerst als „?“ – antippen deckt sie einzeln auf (gilt für neue Seiten mit Formen)', an => { if (an) delete o.winkelFrage; else o.winkelFrage = false; }),
        abschnitt('Neue Formen zeigen automatisch …'),
        box(!!o.neuWinkel, '📐 Winkel', an => { if (an) o.neuWinkel = true; else delete o.neuWinkel; S.winkelZeigen = an; }),
        ...[['ms', '📏 Seitenlängen / Radius'], ['mu', '⭕ Umfang'], ['mf', '▦ Flächeninhalt']].map(([k, l]) => box(!!nm()[k], l, an => { if (an) nm()[k] = 1; else delete nm()[k]; S.masse = { ...nm() }; })),
        tipp('An jeder Form lässt sich das einzeln umschalten: Form antippen › Symbolzeile oben im Kontextmenü (📐 📏 ⭕ ▦ 🪣, ⋯ für mehr).')]; }],
    ['leiste', '🧰 Leiste & Favoriten', () => [
      h('label', { class: 'fld' }, 'Bedienseite (Pult links / rechts) – auch über ⇆ unten bei Zoom', auswahl('seite', SEITEN.map(([v, l]) => [v, l]), 'mitte', seiteAnwenden)),
      chk('palette', '⭐ Favoriten zeigen (schwebende Leiste; auch über „Favoriten“ in der Werkzeugleiste)', () => T.paletteZeigen && T.paletteZeigen()),
      chk('leisteOben', 'Werkzeugleiste oben statt unten', () => document.body.classList.toggle('leisteOben', o.leisteOben)),
      chk('karteImmer', '🗺 Übersichtskarte immer zeigen (sonst nur beim Verschieben und Zoomen)', () => T.render()),
      abschnitt('Farben in der Werkzeugleiste'), tipp('Antippen nimmt eine Farbe in die Leiste auf bzw. heraus (höchstens 8). Alle weiteren Farben gibt es immer über den Regenbogen-Knopf.'),
      farbWahl('stift', MEHR, 'Stift'), farbWahl('marker', MARKER_MEHR, 'Marker'),
      abschnitt('Werkzeugleiste anpassen'), tipp('Mit ◀ ▶ verschieben, × blendet aus – die Leiste ändert sich sofort. Noch einfacher: lange auf die Werkzeugleiste drücken und die Kärtchen ziehen.'),
      (() => { const b = h('div'); leisteAnpassen(b); return b; })()]],
    ['aussehen', '🎨 Darstellung', () => [
      h('label', { class: 'fld' }, 'Farbschema der App', h('select', { onchange: e => T.setThema(e.target.value) }, ...Object.entries(THEMEN).map(([v, [i, l]]) => h('option', { value: v, selected: (o.thema || 'auto') === v }, i + ' ' + l)))),
      chk('tafelNacht', '🌙 Tafel im Nachtmodus dunkel anzeigen (weiße Seiten erscheinen schwarz, gleiches Muster; Export und Druck bleiben weiß)', () => { if (S.board) { autoInk(); T.renderOver(); } })]],
    ['sperre', '🔒 Sperre & PIN', () => [
      tipp('Den PIN legt man auf der Startseite bei der eigenen Lehrkraft fest („🔑 PIN festlegen“).'),
      tipp('Beide Sperren wirken nur mit PIN und zählen die Zeit ohne Bedienung (keine Berührung, Taste, Maus).'),
      h('label', { class: 'fld' }, '📁 Ordner-Sperre nach – die Übersicht „📁 Tafeln“ (Klassen, Fächer, gespeicherte Tafeln) braucht wieder den PIN; die offene Tafel bleibt stehen', auswahl('autoSperre', SPERR_ZEITEN, 0)),
      h('label', { class: 'fld' }, '🖥 Tafel-Sperre nach – die offene Tafel wird abgedeckt (Sperrbildschirm mit PIN)', (() => {
        if (o.autoSperreTafel && !o.autoSperreTafelMin && o.autoSperre) { o.autoSperreTafelMin = o.autoSperre; } delete o.autoSperreTafel; // ältere Einstellung übernehmen
        return auswahl('autoSperreTafelMin', SPERR_ZEITEN, 0); })()),
      h('details', { class: 'pin-hilfe' }, h('summary', {}, '🔑 PIN vergessen?'),
        h('p', { class: 'hint' }, 'Bitte an die Person wenden, die die Tafel-App an Ihrer Schule betreut.'))]],
    ['ablage', '📂 Ablageordner', () => [
      h('p', { class: 'hint' }, F.supported ? (F.root ? 'Verbunden: »' + F.name() + '«' : F.pending ? 'Ordner »' + F.name() + '« muss neu bestätigt werden.' : 'Kein Ordner verbunden – Tafeln werden als Datei heruntergeladen.') : 'Dieser Browser kann keine Ordner verbinden – bitte Microsoft Edge verwenden.'),
      F.supported ? h('div', { class: 'row' }, h('button', { class: 'big', onclick: async () => { try { await F.connect(); await T.persNeuLaden(); closeDlg(); status(); toast('Ordner verbunden: ' + F.name()); } catch (e) {} } }, '📂 Ordner wählen / ändern')) : '',
      tipp((T.opts.lehrkraft ? `Das ist der Ablageordner von ${T.opts.lehrkraft}. ` : '') + 'Jede Lehrkraft wählt ihren eigenen Ordner (z. B. im eigenen OneDrive oder IServ); er wird beim Anmelden – Namen auf der Startseite antippen – automatisch verbunden. Darin liegen ihre Tafeln (Lehrkraft › Klasse › Fach) und als „_einstellungen.json“ alle persönlichen Einstellungen, Favoriten, Vorlagen und Listen.')]]
  ];
  if (!BEREICHE.some(b => b[0] === einstBereich)) einstBereich = 'stift';
  const rechts = h('div', { class: 'einst-rechts' }), links = h('div', { class: 'einst-links' });
  const zeige = id => {
    einstBereich = id; const b = BEREICHE.find(x => x[0] === id);
    links.querySelectorAll('button').forEach(k => k.classList.toggle('on', k.dataset.b === id));
    rechts.innerHTML = ''; rechts.append(h('h3', { style: { marginTop: 0 } }, b[1]), ...b[2]().filter(Boolean)); rechts.scrollTop = 0;
  };
  links.append(...BEREICHE.map(([id, l]) => h('button', { class: 'kat', 'data-b': id, onclick: () => zeige(id) }, l)));
  openDlg([h('h2', {}, '⚙ Einstellungen'), h('div', { class: 'einst' }, links, rechts),
    h('p', { class: 'hint', style: { margin: '8px 0 0' } }, T.opts.lehrkraft ? `Gilt für ${T.opts.lehrkraft} (außer Finger, Handballen, Druck und Bildschirmtastatur – die gehören zum Board).` : 'Tipp: Mit gewählter Lehrkraft werden die Einstellungen in ihrem Ordner gespeichert.'),
    h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: closeDlg }, 'Fertig'))], true);
  zeige(einstBereich);
}
let einstBereich = 'stift'; // zuletzt geöffneter Bereich der Einstellungen
const SPERR_ZEITEN = [[0, 'aus'], [5, '5 Minuten'], [10, '10 Minuten'], [20, '20 Minuten'], [30, '30 Minuten'], [45, '45 Minuten'], [60, '60 Minuten'], [90, '90 Minuten']];
T.onPointerInfo = e => {
  const t = { pen: '✒ Stift', touch: '☝ Finger', mouse: '🖱 Maus' }[e.pointerType] || e.pointerType;
  $('stiftInfo').textContent = t + (e.pointerType === 'pen' && e.pressure && e.pressure !== 0.5 ? ' · Druck' : '');
};

// ---------- Tafel-Infos ----------
function infoDialog() {
  const b = S.board;
  const fs = [{ k: 'lehrkraft', l: 'Lehrkraft', typ: 'text' }, { k: 'fach', l: 'Fach', typ: 'auswahl', opts: T.FAECHER.map(f => [f.id, f.icon + ' ' + f.id]).concat(T.FAECHER.some(f => f.id === b.fach) ? [] : [[b.fach, b.fach]]) }, { k: 'titel', l: 'Titel', typ: 'text' }].map(f => ({ f, ...feld(f, b[f.k]) }));
  const datum = h('input', { type: 'date', value: b.datum }), klasse = h('input', { type: 'text', class: 'feld', value: b.klasse || '', placeholder: 'z. B. 7b (leer = ohne Klasse)' });
  openDlg([h('h2', {}, 'Tafel-Infos'), fs[0].el, h('label', { class: 'fld' }, 'Klasse', klasse), ...fs.slice(1).map(x => x.el), h('label', { class: 'fld' }, 'Datum', datum),
    h('p', { class: 'hint' }, 'Gespeichert wird unter: Ablageordner › Lehrkraft › Klasse › Fach › „Datum Titel.tafel.json“.'),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => {
      for (const x of fs) b[x.f.k] = String(x.get()).trim() || b[x.f.k]; b.datum = datum.value || b.datum;
      const kl = F.safe(klasse.value.trim().replace(/^klasse\s*/i, '')); if (klasse.value.trim()) b.klasse = kl; else delete b.klasse;
      closeDlg(); T.changed(); topInfo(); speichern();
    } }, 'Übernehmen'))]);
}

// ---------- Speichern ----------
let saving = false, lastSaved = null;
function status() {
  const st = $('status'); if (!S.board) return;
  st.classList.remove('warn');
  if (saving) st.textContent = '… speichert';
  else if (F.root && S.file && !S.dirty) st.textContent = '✓ gespeichert ' + (lastSaved || '');
  else if (F.root) st.textContent = S.dirty ? '● ungespeichert' : '';
  else { st.textContent = F.pending ? '⚠ Ordner bestätigen' : '⚠ kein Ablageordner'; st.classList.add('warn'); }
}
T.onChange = () => { status(); updateToolbar(); clearTimeout(backupT); backupT = setTimeout(backup, 2500); };
let backupT = 0;
async function backup() { if (!S.board) return; try { await T.idbSet('backup', { json: JSON.stringify(S.board), dirty: S.dirty, file: S.file, zeit: Date.now() }); } catch (e) {} }
async function speichern(manuell) {
  if (!S.board || saving) return;
  if (!F.root) {
    if (F.pending && manuell) { try { if (await F.reconnect()) return speichern(true); } catch (e) {} }
    if (manuell) { F.download(S.board); S.dirty = false; status(); backup(); toast('Als Datei heruntergeladen (kein Ablageordner verbunden).'); }
    return;
  }
  saving = true; status();
  try {
    const r = await F.save(S.board, S.file); S.file = r.file; S.dirty = false;
    lastSaved = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    if (r.hinweis === 'konflikt') toast('Die Datei wurde zwischenzeitlich woanders geändert – Ihre Fassung liegt als „(Konflikt)“-Kopie daneben.', 6000);
    else if (manuell) toast('Gespeichert: ' + r.file.teacher + ' › ' + (r.file.klasse ? r.file.klasse + ' › ' : '') + r.file.fach + ' › ' + r.file.name);
    backup();
  } catch (e) { toast('Speichern fehlgeschlagen: ' + (e.message || e), 5000); }
  saving = false; status();
}
setInterval(() => { if (S.board && S.dirty && F.root && S.file && !S.drag && !T.live) speichern(false); }, 20000);
addEventListener('beforeunload', e => { if (S.board && S.dirty) { backup(); e.preventDefault(); e.returnValue = ''; } });

function topInfo() {
  const b = S.board; if (!b) return; $('titel').value = b.titel;
  const f = T.fach(b.fach), [y, m, d] = b.datum.split('-');
  $('ablageInfo').textContent = `${f.icon} ${b.fach}${b.klasse ? ' · ' + b.klasse : ''} · ${b.lehrkraft} · ${d}.${m}.${y}`; $('ablageInfo').style.background = f.farbe + '22';
  document.title = b.titel + ' – Tafel-App';
}
$('titel').addEventListener('change', e => { if (!S.board) return; S.board.titel = e.target.value.trim() || 'Tafel'; T.changed(); topInfo(); speichern(); });
$('titel').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });

function ladeTafel(board, file) {
  S.board = T.checkBoard(board); S.file = file || null; S.page = 0; S.sel = null; S.dirty = false; S.inst = [];
  T.hist.u.length = 0; T.hist.r.length = 0;
  $('archiv').style.display = 'none'; topInfo(); updateToolbar(); autoInk(); T.render(); T.renderOver(); status(); zoomInfo(); backup();
  T.onBoardLoaded && T.onBoardLoaded();
}
T.ladeTafel = ladeTafel; // für Tests
async function neueTafel(lehrkraft, fach, titel, klasse) {
  const b = T.newBoard(lehrkraft, fach, titel || 'Tafel ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
  if (klasse) b.klasse = klasse;
  if (fach === 'Mathe') b.pages[0].bg = 'kariert';
  if (fach === 'Musik') b.pages[0].bg = 'noten';
  ladeTafel(b, null); S.dirty = true; if (F.root) await speichern(false); status();
}

// ---------- Tafel-Archiv (Startbildschirm) ----------
let archivFach = null;
// Liste der Lehrkräfte an diesem Gerät (gehört zum Board, nicht zu einer Lehrkraft – daher kein „tafelapp.“-Schlüssel)
const geraetLehrkraefte = () => { try { const l = JSON.parse(localStorage.getItem('tafelgeraet.lehrkraefte') || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
const merkeLehrkraft = n => { const l = new Set(geraetLehrkraefte()); if (!n || l.has(n)) return; l.add(n); try { localStorage.setItem('tafelgeraet.lehrkraefte', JSON.stringify([...l])); } catch (e) {} };
if (T.opts.lehrkraft) merkeLehrkraft(T.opts.lehrkraft);
let archivWahl = null, papierkorbAuf = false; const papierkorbGeprueft = new Set(); // Mehrfachauswahl der Tafeln · Papierkorb offen · schon automatisch geleert
async function archiv() {
  const A = $('archiv'); A.style.display = 'block'; A.innerHTML = ''; T.closePops();
  const name = T.opts.lehrkraft;
  const kopf = h('div', { class: 'kopf' }, h('h1', {}, '🧑‍🏫 Tafel-App'), h('span', { class: 'spacer' }),
    h('button', { class: 'big', title: 'Stift, Finger, Darstellung, Ablageordner …', onclick: settingsDialog }, '⚙ Einstellungen'),
    S.board ? h('button', { class: 'big', onclick: () => { A.style.display = 'none'; } }, '← Zurück zur Tafel') : '');
  A.append(kopf);
  // Schnellstart ganz oben – leere Tafel ohne Lehrkraft/Fach-Auswahl
  A.append(h('button', { class: 'loslegen', onclick: () => neueTafel(T.opts.lehrkraft || 'Lehrkraft', 'Sonstiges', 'Schnelle Tafel') },
    h('span', { class: 'ico' }, '⚡'), h('span', {}, h('b', {}, 'Schnell loslegen'), h('small', {}, 'Leere Tafel öffnen und sofort schreiben'))));
  // Ablage
  const ab = h('div', { class: 'karte' });
  if (F.intern) ab.append(h('p', { class: 'hint' }, '📱 Die Tafeln werden in der App auf diesem Gerät gespeichert (Lehrkraft › Klasse › Fach). Bitte ab und zu „💾 Sicherung exportieren“ – z. B. auf einen USB-Stick oder in IServ. Mit „📥 Sicherung einspielen“ kommen Tafeln von einem anderen Gerät hierher.'));
  else if (!F.supported) ab.append(h('p', { class: 'hint' }, '⚠ Dieser Browser kann keinen Ablageordner verbinden. Bitte die App über „Tafel starten.bat“ in Microsoft Edge öffnen. Bis dahin werden Tafeln als Datei heruntergeladen.'));
  // Knöpfe links (vor dem Text) – dort, wo man sie zuerst sieht und erreicht
  else if (F.root) ab.append(h('div', { class: 'row' }, h('button', { class: 'big', onclick: async () => { try { await F.connect(); archiv(); } catch (e) {} } }, 'Ordner ändern'), h('span', { class: 'hint', style: { flex: 1 } }, '📂 Ablageordner: »' + F.name() + '« (Unterordner: Lehrkraft › Klasse › Fach)')));
  else if (F.pending) ab.append(h('div', { class: 'row' }, h('button', { class: 'big prim', onclick: async () => { try { await F.reconnect(); await T.persNeuLaden(); } catch (e) {} archiv(); status(); } }, '▶ Starten'), h('span', { class: 'hint', style: { flex: 1 } }, 'Gespeicherte Tafeln aus »' + F.name() + '« öffnen: auf „▶ Starten“ tippen und im Browser „Zulassen“ wählen (einmal pro Start).')));
  else ab.append(h('div', { class: 'row' }, h('button', { class: 'big prim', onclick: async () => { try { await F.connect(); await T.persNeuLaden(); archiv(); status(); } catch (e) {} } }, '📂 Ordner wählen'), h('span', { class: 'hint', style: { flex: 1 } }, (T.opts.lehrkraft ? `Noch kein Ablageordner für ${T.opts.lehrkraft}. ` : 'Noch kein Ablageordner. ') + 'Jede Lehrkraft wählt ihren eigenen Ordner, z. B. „Tafeln“ in ihrem OneDrive oder im synchronisierten IServ-Ordner – beim nächsten Anmelden (Namen antippen) wird er automatisch verbunden.')));
  A.append(ab);
  // Wiederherstellen
  try {
    const bk = await T.idbGet('backup');
    if (bk && bk.dirty && (!S.board || JSON.parse(bk.json).id !== S.board.id)) {
      const b = JSON.parse(bk.json);
      A.append(h('div', { class: 'karte warnbox' }, h('div', { class: 'row' },
        h('button', { class: 'big prim', onclick: () => { ladeTafel(b, bk.file); S.dirty = true; status(); speichern(false); } }, 'Wiederherstellen'),
        h('span', { style: { flex: 1, fontSize: '17px' } }, `⚠ Ungesicherte Tafel gefunden: „${b.titel}“ (${b.fach}, ${new Date(bk.zeit).toLocaleString('de-DE')})`))));
    }
  } catch (e) {}
  // Lehrkraft
  const lk = h('div', { class: 'karte' }, h('h3', { style: { marginTop: 0 } }, '1. Lehrkraft'));
  const chips = h('div', { class: 'chips' });
  // Lehrkräfte an diesem Gerät (jede mit eigenem Ablageordner) – plus die im aktuellen Ordner gefundenen
  const namen = new Set([...geraetLehrkraefte(), ...await F.teachers().catch(() => [])]); if (name) namen.add(name);
  if (F.ladeOrdner) await F.ladeOrdner([...namen]);
  const anmelden = async n => {
    if (F.sofortFreigeben) F.sofortFreigeben(n); /* noch im Tipp: nur „Zulassen“ statt Ordner wählen */
    if (n === T.opts.lehrkraft && F.pending && F.freigabe) { const p = await F.freigabe.p; F.freigabe = null; if (p === 'granted') { F.root = F.pending; F.pending = null; await T.persNeuLaden(); } status(); archiv(); return; } /* gleiche Lehrkraft, Ordner nur noch zu bestätigen */
    T.opts.lehrkraft = n; T.saveOptsRoh(); merkeLehrkraft(n); await persWechsel(); T.onLehrkraft && T.onLehrkraft(); status(); archiv(); };
  for (const n of [...namen].sort((a, b) => a.localeCompare(b, 'de'))) chips.append(h('button', { class: 'chip' + (n === name ? ' on' : ''), title: F.hatOrdner && F.hatOrdner(n) ? 'Antippen: anmelden – der gemerkte Ablageordner wird verbunden (Browser fragt nur „Zulassen“)' : 'Antippen: anmelden', onclick: () => anmelden(n) }, n + (F.hatOrdner && F.hatOrdner(n) ? ' 📂' : '')));
  chips.append(h('button', { class: 'chip', onclick: async () => { const n = await frage('Name oder Kürzel der Lehrkraft:', { feld: {} }); if (n && n.trim()) anmelden(F.safe(n.trim())); } }, '＋ Neu'));
  lk.append(chips); A.append(lk);
  if (!name) { A.append(h('p', { class: 'hint' }, 'Bitte zuerst eine Lehrkraft wählen oder anlegen.')); A.append(dateiKarte()); return; }
  // freiwilliger PIN: gesperrt → erst PIN eingeben; entsperrt → „Sperren“ und „PIN ändern“ neben den Namen
  const pin = await F.pinLesen(name).catch(() => null);
  if (pin && !entsperrt.has(name)) { A.append(pinKarte(name)); A.append(dateiKarte()); return; }
  lk.append(h('div', { class: 'row', style: { marginTop: '8px' } }, pin
    ? [h('button', { class: 'big', title: 'Tafeln dieser Lehrkraft wieder sperren', onclick: () => { entsperrt.delete(name); merkeEntsperrt(); archiv(); } }, '🔒 Sperren'),
       h('button', { class: 'big', onclick: () => pinDialog(name, true) }, '🔑 PIN ändern / entfernen')]
    : h('button', { class: 'big', title: 'Freiwillig: Klassen, Fächer und Tafeln dieser Lehrkraft erst nach PIN-Eingabe zeigen', onclick: () => pinDialog(name, false) }, '🔑 PIN festlegen (freiwillig)')));
  // Klasse (gemerkt; „ohne Klasse“ = ältere Tafeln direkt unter Lehrkraft › Fach)
  const klasse = T.opts.klasse || '', wer = F.wer(name, klasse);
  const kk = h('div', { class: 'karte' }, h('h3', { style: { marginTop: 0 } }, '2. Klasse')), kchips = h('div', { class: 'chips' });
  const kn = new Set(await F.klassen(name).catch(() => [])); if (klasse) kn.add(klasse);
  const waehleKlasse = k => { T.opts.klasse = k; T.saveOpts(); archivFach = null; archiv(); };
  kchips.append(h('button', { class: 'chip' + (!klasse ? ' on' : ''), title: 'Tafeln ohne Klassenzuordnung', onclick: () => waehleKlasse('') }, 'ohne Klasse'));
  for (const k of [...kn].sort((a, b) => a.localeCompare(b, 'de', { numeric: true }))) kchips.append(h('button', { class: 'chip' + (k === klasse ? ' on' : ''), onclick: () => waehleKlasse(k) }, k));
  kchips.append(h('button', { class: 'chip', onclick: async () => { const n = await frage('Klasse, z. B. 7b oder 9 E-Kurs:', { feld: {} }); if (n && n.trim()) waehleKlasse(F.safe(n.trim().replace(/^klasse\s*/i, ''))); } }, '＋ Neu'));
  kk.append(kchips); A.append(kk);
  // Fächer + Liste
  const cols = h('div', { class: 'cols' }), links = h('div', { class: 'karte' }, h('h3', { style: { marginTop: 0 } }, '3. Fach')), rechts = h('div', { class: 'karte' });
  const counts = await F.faecher(wer);
  const fg = h('div', { class: 'faecher' });
  const alle = T.FAECHER.map(f => f.id); for (const k of Object.keys(counts)) if (!alle.includes(k)) alle.push(k);
  for (const id of alle) { const f = T.fach(id); fg.append(h('button', { class: 'fach' + (archivFach === id ? ' on' : ''), style: '--fc:' + f.farbe, onclick: () => { archivFach = id; archiv(); } }, h('span', { style: { fontSize: '28px' } }, f.icon), id, counts[id] ? h('span', { class: 'n' }, counts[id] + ' Tafel' + (counts[id] > 1 ? 'n' : '')) : '')); }
  links.append(fg); cols.append(links, rechts); A.append(cols);
  if (!archivFach) rechts.append(h('h3', { style: { marginTop: 0 } }, '4. Tafel'), h('p', { class: 'hint' }, 'Fach antippen – dann neue Tafel anlegen oder eine gespeicherte öffnen.'));
  else {
    rechts.append(h('h3', { style: { marginTop: 0 } }, `4. ${klasse ? klasse + ' · ' : ''}${archivFach}: Tafeln`));
    const ti = h('input', { type: 'text', class: 'feld', placeholder: 'Titel, z. B. „Brüche addieren“', style: { flex: 1, minWidth: '200px' } });
    rechts.append(h('div', { class: 'row', style: { marginBottom: '14px' } }, ti, h('button', { class: 'big prim', onclick: () => neueTafel(name, archivFach, ti.value.trim(), klasse) }, '＋ Neue Tafel')));
    const liste = h('div', { class: 'liste' });
    const boards = await F.boards(wer, archivFach);
    if (!boards.length) liste.append(h('p', { class: 'hint' }, F.root ? 'Noch keine Tafeln in diesem Fach.' : 'Ohne Ablageordner werden hier keine Tafeln angezeigt – „Datei öffnen“ nutzen.'));
    // Mehrere Tafeln markieren und auf einmal löschen (in den Papierkorb)
    const ort = wer.join('/') + '|' + archivFach; if (archivWahl && archivWahl.ort !== ort) archivWahl = null;
    if (boards.length) rechts.append(archivWahl
      ? h('div', { class: 'row archiv-wahl' }, h('b', {}, `${archivWahl.namen.size} von ${boards.length} markiert`),
          h('button', { class: 'big', onclick: () => { archivWahl.namen = new Set(archivWahl.namen.size === boards.length ? [] : boards.map(b => b.name)); archiv(); } }, archivWahl.namen.size === boards.length ? 'Keine' : 'Alle'),
          h('button', { class: 'big warn', disabled: !archivWahl.namen.size, onclick: async () => {
            const n = archivWahl.namen.size; if (!await frage(`${n} Tafel${n === 1 ? '' : 'n'} löschen?\n\nSie kommen in den Papierkorb und können dort wiederhergestellt werden.`, { ok: '🗑 Löschen' })) return;
            let ok = 0; for (const nm of archivWahl.namen) { try { await F.trash(wer, archivFach, nm); ok++; if (S.file && S.file.name === nm && S.file.fach === F.safe(archivFach)) S.file = null; } catch (e) {} }
            archivWahl = null; toast(`${ok} Tafel${ok === 1 ? '' : 'n'} in den Papierkorb gelegt.`, 2500); archiv(); } }, '🗑 Markierte löschen'),
          h('button', { class: 'big prim', onclick: () => { archivWahl = null; archiv(); } }, 'Fertig'))
      : h('div', { class: 'row archiv-wahl' }, h('button', { class: 'big', title: 'Mehrere Tafeln markieren und auf einmal löschen', onclick: () => { archivWahl = { ort, namen: new Set() }; archiv(); } }, '☑ Mehrere auswählen')));
    for (const b of boards) {
      if (archivWahl) { // Auswahlmodus: Zeile antippen = markieren
        const [y, m, d] = (b.datum || '--').split('-'), an = archivWahl.namen.has(b.name);
        liste.append(h('div', { class: 'eintrag wahl' + (an ? ' an' : ''), onclick: () => { an ? archivWahl.namen.delete(b.name) : archivWahl.namen.add(b.name); archiv(); } },
          h('span', { class: 'seite-haken' + (an ? ' an' : ''), style: { position: 'static' } }, an ? '✓' : ''), h('span', { class: 'd' }, d ? `${d}.${m}.${y}` : ''), h('span', { class: 't' }, b.titel)));
        continue;
      }
      const [y, m, d] = (b.datum || '--').split('-');
      const open = async kopie => { try { const r = await F.read(wer, archivFach, b.name); if (kopie) { r.board.id = T.uid(); r.board.datum = T.today(); ladeTafel(r.board, null); S.dirty = true; speichern(false); toast('Neue Tafel mit heutigem Datum angelegt.'); } else ladeTafel(r.board, r.file); } catch (e) { toast('Öffnen fehlgeschlagen: ' + e.message); } };
      const loeschen = async () => {
        if (!await frage(`Tafel „${b.titel}“ löschen?\n\nSie kommt in den Papierkorb und kann dort wiederhergestellt werden.`, { ok: '🗑 Löschen' })) return;
        try {
          await F.trash(wer, archivFach, b.name);
          if (S.file && S.file.name === b.name && S.file.fach === F.safe(archivFach) && S.file.teacher === F.safe(name) && (S.file.klasse || '') === (wer[1] ? F.safe(wer[1]) : '')) S.file = null; // offene Tafel nicht still neu anlegen
          toast(`„${b.titel}“ liegt jetzt im Papierkorb.`); archiv();
        } catch (e) { toast('Löschen fehlgeschlagen: ' + e.message, 5000); }
      };
      liste.append(h('div', { class: 'eintrag' }, h('span', { class: 'd' }, d ? `${d}.${m}.${y}` : ''), h('span', { class: 't' }, b.titel),
        h('button', { class: 'big', title: 'Als neue Tafel mit heutigem Datum öffnen', onclick: () => open(true) }, '⧉ Als Vorlage'), h('button', { class: 'big prim', onclick: () => open(false) }, 'Öffnen'),
        h('button', { class: 'big warn', title: 'Tafel löschen (in den Papierkorb)', onclick: loeschen }, '🗑')));
    }
    rechts.append(liste);
    // 🗑 Papierkorb: automatisch leeren (je Lehrkraft einstellbar) – einmal pro Start und Ablage
    const tage = +T.opts.papierkorbTage || 0;
    if (tage && F.root && !papierkorbGeprueft.has(wer.join('/'))) { papierkorbGeprueft.add(wer.join('/')); const n = await F.trashPurge(wer, tage).catch(() => 0); if (n) toast(`🗑 ${n} Tafel${n === 1 ? '' : 'n'} – länger als ${tage} Tage im Papierkorb – endgültig gelöscht.`, 3500); }
    const pk = (await F.trashList(wer)).filter(x => x.fach === F.safe(archivFach));
    if (pk.length || tage) {
      const pl = h('div', { class: 'liste', style: { display: papierkorbAuf ? 'flex' : 'none', marginTop: '8px' } });
      for (const x of pk) {
        const mm = x.name.match(/^(\d{4})-(\d{2})-(\d{2})\s+(.*?)\.tafel\.json$/), seit = x.zeit ? Math.floor((Date.now() - x.zeit) / 864e5) : null;
        pl.append(h('div', { class: 'eintrag alt' }, h('span', { class: 'd' }, mm ? `${mm[3]}.${mm[2]}.${mm[1]}` : ''), h('span', { class: 't' }, (mm ? mm[4] : x.name) + (seit != null ? ` · gelöscht vor ${seit === 0 ? 'heute' : seit + ' Tag' + (seit === 1 ? '' : 'en')}`.replace('vor heute', 'heute') : '')),
          h('button', { class: 'big', onclick: async () => { try { await F.restore(wer, x.fach, x.name); toast('Wiederhergestellt.'); archiv(); } catch (e) { toast('Fehlgeschlagen: ' + e.message, 5000); } } }, '↩ Wiederherstellen'),
          h('button', { class: 'big warn', title: 'Endgültig löschen – nicht wiederherstellbar', onclick: async () => { if (!await frage(`„${mm ? mm[4] : x.name}“ endgültig löschen? Das lässt sich nicht rückgängig machen.`, { ok: 'Endgültig löschen' })) return; try { await F.trashDelete(wer, x.fach, x.name); archiv(); } catch (e) { toast('Fehlgeschlagen: ' + e.message, 5000); } } }, '✕')));
      }
      if (pk.length) pl.append(h('div', { class: 'row' }, h('button', { class: 'big warn', onclick: async () => {
        if (!await frage(`Papierkorb (${archivFach}) leeren? ${pk.length} Tafel${pk.length === 1 ? '' : 'n'} werden endgültig gelöscht – das lässt sich nicht rückgängig machen.`, { ok: 'Papierkorb leeren' })) return;
        const n = await F.trashPurge(wer, 0, F.safe(archivFach)); toast(`Papierkorb geleert (${n}).`, 2000); archiv(); } }, '🗑 Papierkorb leeren')));
      pl.append(h('label', { class: 'fld', style: { margin: '6px 0 0' } }, 'Automatisch endgültig löschen, was so lange im Papierkorb liegt',
        h('select', { onchange: e => { const v = +e.target.value; if (v) T.opts.papierkorbTage = v; else delete T.opts.papierkorbTage; T.saveOpts(); papierkorbGeprueft.clear(); archiv(); } },
          ...[[0, 'nie (nur von Hand)'], [7, 'nach 7 Tagen'], [14, 'nach 14 Tagen'], [21, 'nach 21 Tagen'], [28, 'nach 28 Tagen']].map(([v, l]) => h('option', { value: v, selected: tage === v }, l)))));
      rechts.append(h('button', { class: 'big', style: { marginTop: '14px' }, onclick: () => { papierkorbAuf = !papierkorbAuf; pl.style.display = papierkorbAuf ? 'flex' : 'none'; } }, `🗑 Papierkorb (${pk.length})`), pl);
    }
  }
  A.append(dateiKarte());
}
// ---------- PIN (freiwillig, pro Lehrkraft) ----------
// Sperre in der App: Wer den Ablageordner direkt öffnet, sieht die Dateien weiterhin. Entsperrt bleibt es bis zum Schließen des Browsers.
const entsperrt = new Set((() => { try { return JSON.parse(sessionStorage.getItem('tafelapp.entsperrt') || '[]'); } catch (e) { return []; } })());
const merkeEntsperrt = () => { try { sessionStorage.setItem('tafelapp.entsperrt', JSON.stringify([...entsperrt])); } catch (e) {} };
// ---------- Automatische Sperre nach Inaktivität (freiwillig, ⚙ Einstellungen, je Lehrkraft) ----------
// autoSperre = Minuten ohne Berührung/Taste (0 = aus); autoSperreTafel = zusätzlich die offene Tafel abdecken (sonst nur die Übersicht).
// Wirkt nur, wenn die Lehrkraft einen PIN hat.
let zuletztAktiv = Date.now(), sperrDeckel = null;
for (const t of ['pointerdown', 'keydown', 'wheel']) addEventListener(t, () => { zuletztAktiv = Date.now(); }, true);
// Ordner-Sperre (autoSperre): Übersicht der Tafeln wieder sperren · Tafel-Sperre (autoSperreTafelMin): offene Tafel abdecken – je eigene Zeit
async function autoSperren() {
  const name = T.opts.lehrkraft, still = Date.now() - zuletztAktiv;
  const ordnerMin = +T.opts.autoSperre || 0, tafelMin = +T.opts.autoSperreTafelMin || (T.opts.autoSperreTafel ? ordnerMin : 0); // ältere Einstellung: Häkchen = gleiche Zeit
  if (!name || sperrDeckel || (!ordnerMin && !tafelMin)) return;
  const ordnerFaellig = ordnerMin && still >= ordnerMin * 60000, tafelFaellig = tafelMin && still >= tafelMin * 60000;
  if (!ordnerFaellig && !tafelFaellig) return;
  if (!await F.pinLesen(name).catch(() => null)) return; // ohne PIN keine Sperre
  if ((ordnerFaellig || tafelFaellig) && entsperrt.has(name)) { entsperrt.delete(name); merkeEntsperrt(); if ($('archiv').style.display === 'block') archiv(); }
  if (tafelFaellig && S.board && $('archiv').style.display !== 'block') sperrbildschirm(name, tafelMin);
}
setInterval(autoSperren, 20000);
T.autoSperrenJetzt = () => { zuletztAktiv = 0; return autoSperren(); }; // für Tests
function sperrbildschirm(name, minuten) {
  T.closePops(); closeDlg && closeDlg();
  const inp = pinFeld('PIN');
  const los = async () => {
    if (await F.pinPruefen(name, inp.value.trim())) { entsperrt.add(name); merkeEntsperrt(); sperrDeckel.remove(); sperrDeckel = null; zuletztAktiv = Date.now(); }
    else { toast('Falscher PIN.', 2000); inp.value = ''; inp.focus(); }
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') los(); });
  sperrDeckel = h('div', { id: 'sperrDeckel' }, h('div', { class: 'karte' }, h('h2', { style: { marginTop: 0 } }, '🔒 Tafel gesperrt'),
    h('p', { class: 'hint' }, `${name} – nach ${minuten || T.opts.autoSperre} Minuten ohne Bedienung gesperrt.`),
    h('div', { class: 'row' }, inp, h('button', { class: 'big prim', onclick: los }, 'Entsperren'))));
  sperrDeckel.addEventListener('pointerdown', e => e.stopPropagation());
  document.body.append(sperrDeckel); setTimeout(() => inp.focus(), 50);
}
const pinFeld = ph => h('input', { type: 'password', class: 'feld', inputmode: 'numeric', autocomplete: 'off', placeholder: ph, style: { fontSize: '26px', width: '220px', letterSpacing: '6px' } });
function pinKarte(name) {
  const inp = pinFeld('PIN');
  const los = async () => {
    if (await F.pinPruefen(name, inp.value.trim())) { entsperrt.add(name); merkeEntsperrt(); archiv(); }
    else { toast('Falscher PIN.', 2000); inp.value = ''; inp.focus(); }
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') los(); });
  setTimeout(() => inp.focus(), 50);
  return h('div', { class: 'karte' }, h('h3', { style: { marginTop: 0 } }, `🔒 Tafeln von ${name} sind gesperrt`),
    h('div', { class: 'row' }, inp, h('button', { class: 'big prim', onclick: los }, 'Entsperren'))); // Hinweis „PIN vergessen?“ steht bewusst nur in ⚙ Einstellungen
}
function pinDialog(name, hatPin) {
  const p1 = pinFeld('neuer PIN'), p2 = pinFeld('wiederholen');
  const setze = async pin => { try { await F.pinSetzen(name, pin); if (pin) entsperrt.add(name); merkeEntsperrt(); closeDlg(); toast(pin ? '🔒 PIN gespeichert – beim nächsten Start wird er abgefragt.' : 'PIN entfernt – keine Sperre mehr.', 3000); archiv(); } catch (e) { toast('Das hat nicht geklappt: ' + (e.message || e), 4000); } };
  const ok = () => {
    const a = p1.value.trim(), b = p2.value.trim();
    if (!/^\d{4,8}$/.test(a)) { toast('Bitte 4 bis 8 Ziffern.', 2200); return; }
    if (a !== b) { toast('Die beiden Eingaben sind verschieden.', 2200); return; }
    setze(a);
  };
  openDlg([h('h2', {}, `🔑 PIN für ${name}`),
    h('p', { class: 'hint' }, 'Freiwillig: Mit PIN zeigt die Startseite Klassen, Fächer und Tafeln dieser Lehrkraft erst nach der Eingabe. Das schützt in der App (z. B. vor Neugierigen am Board) – wer den Ablageordner direkt öffnet, sieht die Dateien trotzdem.'),
    h('label', { class: 'fld' }, 'Neuer PIN (4–8 Ziffern)', p1), h('label', { class: 'fld' }, 'PIN wiederholen', p2),
    hatPin ? h('button', { class: 'big warn', onclick: async () => { if (await frage('PIN entfernen? Danach ist die Sperre aus.', { ok: 'PIN entfernen' })) setze(null); } }, 'PIN entfernen') : '',
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: ok }, 'Speichern'))]);
  setTimeout(() => p1.focus(), 50);
}
function dateiKarte() {
  const oeffnen = async () => {
    try {
      const b = await F.upload(); if (!b) return;
      if (F.istSicherung(b)) {
        if (!F.root) { toast('Zum Einspielen einer Sicherung zuerst einen Ablageordner wählen.', 5000); return; }
        const n = await F.einspielen(b); toast(`Sicherung eingespielt: ${n} Datei(en) neu – vorhandene wurden nicht überschrieben.`, 5000); archiv(); return;
      }
      ladeTafel(b, null); S.dirty = true; toast('Geöffnet. Beim Speichern landet die Tafel in der Ablage.');
    } catch (e) { toast('Diese Datei ist keine Tafel: ' + e.message); }
  };
  return h('div', { class: 'karte' }, h('div', { class: 'row' },
    h('button', { class: 'big', onclick: oeffnen }, '📂 Datei öffnen / 📥 Sicherung einspielen'),
    F.root ? h('button', { class: 'big', title: 'Alle Tafeln und Notizen in einer Datei sichern', onclick: async () => { try { const n = await F.sicherung(); toast(`Sicherung mit ${n} Datei(en) heruntergeladen.`); } catch (e) { toast('Sicherung fehlgeschlagen: ' + e.message, 5000); } } }, '💾 Sicherung exportieren') : '',
    h('span', { class: 'hint', style: { flex: 1, minWidth: '220px' } }, 'Tafel-Datei oder Sicherung von woanders öffnen (z. B. aus IServ oder vom USB-Stick).')));
}

// ---------- Export ----------
function contentRect(pg) {
  if (!pg.items.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of pg.items) { const b = T.bbox(it); x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1); }
  return { x0: x0 - 40, y0: y0 - 40, x1: x1 + 40, y1: y1 + 40 };
}
async function ensureImages(pg) {
  const dark = T.isDark(pg);
  await Promise.all(pg.items.filter(it => it.t === 'o' && it.k !== 'text').map(o => { const img = T.objImage(o, dark); return img.complete ? null : img.decode().catch(() => {}); }));
}
async function renderPage(pg, maxPx = 3000, useView) {
  await ensureImages(pg);
  let r = contentRect(pg);
  if (!r || useView) { const v = pg.view; r = { x0: -v.x / v.z, y0: -v.y / v.z, x1: (innerWidth - v.x) / v.z, y1: (innerHeight - v.y) / v.z }; }
  const w = r.x1 - r.x0, hh = r.y1 - r.y0, s = Math.min(2, maxPx / Math.max(w, hh));
  const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(hh * s);
  const ctx = c.getContext('2d'); ctx.setTransform(s, 0, 0, s, -r.x0 * s, -r.y0 * s);
  T.paintPage(ctx, pg, r, 1 / s, { export: true }); return c;
}
function exportPop(el) {
  const name = () => `${F.safe(S.board.titel)}`;
  openPop(el, h('h4', {}, 'Import'), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch' } },
    h('button', { class: 'big', title: 'Jede Folie wird eine Tafelseite – Text und Bilder verschiebbar, Text bearbeitbar. Originalgetreu: in PowerPoint als PDF speichern und „PDF-Seiten als Bilder“.', onclick: () => { T.closePops(); T.pptImport && T.pptImport(); } }, '📽 PowerPoint (.pptx)'),
    h('button', { class: 'big', title: 'Text wird bearbeitbar und verschiebbar', onclick: () => { T.closePops(); T.dokImport(); } }, '📝 Word / PDF (Text bearbeitbar)'),
    h('button', { class: 'big', onclick: () => { T.closePops(); pdfEinfuegen(); } }, '📄 PDF-Seiten als Bilder'),
    h('button', { class: 'big', onclick: () => { T.closePops(); bildEinfuegen(); } }, '🖼 Bild')),
    h('h4', { style: { marginTop: '14px' } }, 'Export'), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch' } },
    h('button', { class: 'big', onclick: async () => { T.closePops(); const c = await renderPage(T.page()); c.toBlob(b => T.downloadBlob(b, `${name()} – Seite ${S.page + 1}.png`)); } }, '🖼 Diese Seite als PNG'),
    h('button', { class: 'big', onclick: async () => { T.closePops(); const c = await renderPage(T.page(), 3000, true); c.toBlob(b => T.downloadBlob(b, `${name()} – Ausschnitt.png`)); } }, '🖼 Sichtbarer Ausschnitt als PNG'),
    h('button', { class: 'big', onclick: () => { T.closePops(); druckePDF(); } }, '📄 Alle Seiten als PDF (Drucken → „Als PDF speichern“)'),
    h('button', { class: 'big', onclick: () => { T.closePops(); F.download(S.board); } }, '💾 Tafel-Datei herunterladen (.tafel.json)')));
}
async function druckePDF() {
  toast('PDF wird vorbereitet …');
  const d = $('druck'); d.innerHTML = '';
  for (const pg of S.board.pages) { const c = await renderPage(pg, 2200); d.append(h('img', { src: c.toDataURL('image/jpeg', 0.9) })); }
  await Promise.all([...d.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
  window.print(); setTimeout(() => { d.innerHTML = ''; }, 1000);
}

// ---------- Klassen-Werkzeuge (Timer, Zufall, Würfel) ----------
let wz = 15;
// ---------- 🔌 Schaltzeichen als schwebendes Menü: Bauteil antippen = auf die Tafel (neben das zuletzt eingefügte) ----------
let szFenster = null, szLetztes = null;
function schaltzeichenMenue() {
  if (szFenster && szFenster.isConnected) { szFenster.style.zIndex = 9999; return; }
  const B = T.BAUSTEINE.schaltzeichen, arten = B.felder[0].opts;
  const bild = art => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj('schaltzeichen', { art }, false).svg);
  const setze = art => {
    const o = insertObj('schaltzeichen', { art }), alt = szLetztes && T.page().items.find(i => i.id === szLetztes);
    if (o && alt) { T.replaceItem({ ...o, x: alt.x + alt.w, y: alt.y + (alt.h - o.h) / 2 }); T.render(); } // lückenlos rechts daneben – so entsteht ein Stromkreis
    if (o) szLetztes = o.id;
  };
  const gitter = h('div', { class: 'sz-gitter' }, ...arten.map(([art, name]) => h('button', { class: 'sz-k', title: name + ' – antippen: auf die Tafel', onclick: () => setze(art) },
    h('img', { src: bild(art), alt: '' }), h('span', {}, name.replace(/ \(.*\)$/, '')))));
  szFenster = widget('🔌 Schaltzeichen', [gitter, h('p', { class: 'hint', style: { margin: '6px 0 0', maxWidth: '360px' } }, 'Antippen setzt das Bauteil rechts neben das zuletzt eingefügte. Drehen am ↻, Leiter mit ⤡ länger ziehen. Das Fenster bleibt offen, bis × getippt wird.')],
    Math.max(20, innerWidth - 470), 120);
  szFenster.onclose = () => { szFenster = null; szLetztes = null; };
  szFenster.classList.add('schwebemenue'); schwebeMini(szFenster, 'schaltzeichen');
}
T.schaltzeichenMenue = schaltzeichenMenue;
// ---------- Weitere schwebende Menüs (bleiben offen, bis × – so lassen sich Tafelbilder schnell bauen) ----------
const schwebeOffen = {};
function schwebeMenue(id, titel, baue, breite) {
  if (schwebeOffen[id] && schwebeOffen[id].isConnected) { schwebeOffen[id].style.zIndex = 9999; return; }
  const box = h('div', { class: 'schwebe-inhalt', style: { maxWidth: (breite || 420) + 'px' } });
  const neu = () => { const st = box.parentElement ? box.parentElement.scrollTop : 0; box.innerHTML = ''; box.append(...baue(neu).flat().filter(Boolean)); if (box.parentElement) box.parentElement.scrollTop = st; };
  neu();
  const w = widget(titel, [box], Math.max(20, innerWidth - (breite || 420) - 60), 110);
  w.classList.add('schwebemenue'); schwebeOffen[id] = w; w.onclose = () => { delete schwebeOffen[id]; };
  schwebeMini(w, id);
  return w;
}
// „–“ klappt ein Schwebemenü zu einer kleinen Kopfleiste zusammen („▢“ wieder auf) – je Menü gemerkt
function schwebeMini(w, id) {
  const merk = T.opts.schwebeMini || {};
  const k = h('button', { class: 'wk-mini' });
  const setze = an => { w.classList.toggle('mini', an); k.textContent = an ? '▢' : '–'; k.title = an ? 'Wieder aufklappen' : 'Einklappen (kleiner machen)'; };
  k.onclick = () => { const an = !w.classList.contains('mini'); setze(an); const m = { ...(T.opts.schwebeMini || {}) }; if (an) m[id] = 1; else delete m[id]; T.opts.schwebeMini = m; T.saveOpts(); };
  w.kopf(k); setze(!!merk[id]);
}
T.schwebeMini = schwebeMini;
function emojiMenue() {
  schwebeMenue('emoji', '😀 Emojis', neu => [
    ...EMOJIS.flatMap(([titel, liste]) => [h('h3', {}, titel), h('div', { class: 'stempel' }, ...liste.map(s => h('button', { class: 'stbtn' + (S.stempel === s && S.tool === 'stempel' ? ' on' : ''), onclick: () => { S.stempel = s; setTool('stempel'); neu(); } }, s)))]),
    h('p', { class: 'hint' }, 'Emoji wählen, dann auf die Tafel tippen – danach schreibt der Stift wieder. Für ein weiteres Emoji es erneut wählen.')]);
}
function formelSetzen(text, name) {
  const d = { ...T.BAUSTEINE.formel.def, text, name }, gg = T.genObj('formel', d, false), k = 1 / T.page().view.z, [cx, cy] = T.viewCenter();
  T.snap(); const it = T.addItem({ t: 'o', k: 'formel', d, x: cx - gg.w * k / 2, y: cy - gg.h * k / 2, w: gg.w * k, h: gg.h * k, r: 0 }); nachEinfuegen([it.id]);
}
function formelMenue() {
  schwebeMenue('formeln', '📐 Formeln', () => Object.entries(T.FORMELN).flatMap(([abschnitt, liste]) => [h('h3', {}, abschnitt), h('div', { class: 'formeln' }, ...liste.map(([name, text]) =>
    h('button', { class: 'formel', title: name, onclick: () => formelSetzen(text, name) }, h('span', {}, name), h('img', { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj('formel', { text, groesse: 30 }, false).svg), alt: text }))))]), 460);
}
const alsSchwebe = fn => h('button', { class: 'big', title: 'Dieses Menü als schwebendes Fenster öffnen – bleibt offen, während Sie auf der Tafel arbeiten', onclick: () => { fn(); } }, '⧉ Als Schwebemenü');
T.emojiMenue = emojiMenue; T.formelMenue = formelMenue; T.schwebeMenue = schwebeMenue; T.tabFeld = (...a) => tabFeld(...a); T.aufgabenEinfuegen = (...a) => aufgabenEinfuegen(...a);
function widget(title, body, x, y) {
  const w = h('div', { class: 'widget', style: { left: (x || 120) + 'px', top: (y || 120) + 'px' } });
  const knoepfe = h('div', { class: 'wk-knoepfe' }); // Fertig/Übernehmen … oben neben dem × (w.kopf(…))
  const zu = h('button', { class: 'wk-zu', title: 'Schließen', onclick: () => { w.remove(); w.onclose && w.onclose(); } }, '×');
  const head = h('div', { class: 'wk' }, h('span', {}, title), knoepfe, zu);
  if (T._wz && T.widgetInNotizen) { // Classroom-Fenster: – einklappen (nur Titelleiste) und 📝 in die Notizen
    w._wz = T._wz; w.classList.add('cr-fenster');
    const mini = h('button', { class: 'wk-klein', title: 'Kleiner machen (nur die Titelleiste)', onclick: () => { const an = w.classList.toggle('mini'); mini.textContent = an ? '▢' : '–'; mini.title = an ? 'Wieder groß' : 'Kleiner machen (nur die Titelleiste)'; } }, '–');
    head.insertBefore(mini, zu); head.insertBefore(h('button', { class: 'wk-notiz', title: 'In die Notizen legen – läuft dort weiter', onclick: () => { w.classList.remove('mini'); mini.textContent = '–'; T.widgetInNotizen(w); } }, '📝'), zu);
  }
  w.kopf = (...els) => { knoepfe.innerHTML = ''; knoepfe.append(...els.flat().filter(Boolean)); };
  const wb = h('div', { class: 'wb' }, body); Object.assign(w, { _head: head, _knoepfe: knoepfe, _zu: zu, _wb: wb, _titel: title });
  w.append(head, wb); document.body.append(w); w.style.zIndex = ++wz;
  if (w._wz) wzGriffe(w, wb);
  let d = null;
  head.addEventListener('pointerdown', e => { if (e.target.tagName === 'BUTTON') return; d = [e.clientX - w.offsetLeft, e.clientY - w.offsetTop]; head.setPointerCapture(e.pointerId); w.style.zIndex = ++wz; });
  head.addEventListener('pointermove', e => { if (d) { w.style.left = T.clamp(e.clientX - d[0], 0, innerWidth - 80) + 'px'; w.style.top = T.clamp(e.clientY - d[1], 56, innerHeight - 60) + 'px'; } });
  head.addEventListener('pointerup', () => { d = null; });
  return w;
}
// Classroom-Fenster: Größe an rechtem Rand, unterem Rand und Ecke ändern – der ganze Inhalt wird mitskaliert (gemerkt je Werkzeug)
function wzGriffe(w, wb) {
  const em = w._wz, zooms = () => T.opts.wzZoom || {}, setzeZoom = k => { k = T.clamp(k, 0.4, 2.2); wb.style.zoom = String(Math.round(k * 100) / 100); w._k = k; };
  setzeZoom(zooms()[em] || 1);
  for (const art of ['r', 'b', 'rb']) {
    const g = h('div', { class: 'wz-griff ' + art, title: 'Ziehen: Fenster kleiner oder größer machen' }); let st = null;
    g.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { g.setPointerCapture(e.pointerId); } catch (x) {} st = { x: e.clientX, y: e.clientY, w: w.offsetWidth, h: w.offsetHeight, k: w._k || 1 }; w.style.zIndex = ++wz; });
    g.addEventListener('pointermove', e => { if (!st) return;
      const fx = (st.w + e.clientX - st.x) / st.w, fy = (st.h + e.clientY - st.y) / st.h;
      setzeZoom(st.k * (art === 'r' ? fx : art === 'b' ? fy : Math.max(fx, fy))); });
    const ende = () => { if (!st) return; st = null; T.opts.wzZoom = { ...zooms(), [em]: w._k }; T.saveOpts(); };
    g.addEventListener('pointerup', ende); g.addEventListener('pointercancel', ende);
    w.append(g);
  }
}
T.widget = (...a) => widget(...a); T.beep = () => beep(); T.updateToolbar = () => updateToolbar(); T.addBild = (...a) => addBild(...a); T.setTool = id => setTool(id); // für classroom.js / plotter.js
function beep() { try { const a = new AudioContext(); [0, 0.35, 0.7].forEach(t => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(0.25, a.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + t + 0.3); o.start(a.currentTime + t); o.stop(a.currentTime + t + 0.3); }); } catch (e) {} }
// Vorhang: deckt die Tafel ab und lässt sich von jeder Seite Stück für Stück aufziehen
let vorhang = null;
const VH = { l: 0, t: 0, r: 1, b: 1 }; // abgedeckter Bereich als Anteil der Tafelfläche
function vorhangPlatz() {
  if (!vorhang) return;
  const ax = T.ox, ay = 56, aw = innerWidth - T.ox, ah = innerHeight - 56;
  if (VH.r - VH.l < 0.01 || VH.b - VH.t < 0.01) { vorhangUmschalten(false); toast('Vorhang ganz geöffnet.', 1500); return; }
  Object.assign(vorhang.style, { left: ax + VH.l * aw + 'px', top: ay + VH.t * ah + 'px', width: (VH.r - VH.l) * aw + 'px', height: (VH.b - VH.t) * ah + 'px' });
}
T.vorhangPlatz = vorhangPlatz;
T.vorhang = an => vorhangUmschalten(an); T.vorhangAn = () => !!vorhang; // fürs Präsentieren-Menü
function vorhangUmschalten(an) {
  an = an == null ? !vorhang : an;
  if (!an) { if (vorhang) vorhang.remove(); vorhang = null; updateToolbar(); return; }
  if (vorhang) return;
  Object.assign(VH, { l: 0, t: 0, r: 1, b: 1 });
  vorhang = h('div', { id: 'vorhang' });
  const griff = (seite, sym, title) => {
    const g = h('div', { class: 'vgriff ' + seite, title }, h('span', {}, sym));
    let start = null;
    g.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { g.setPointerCapture(e.pointerId); } catch (x) {} start = { x: e.clientX, y: e.clientY, v: { ...VH }, moved: false }; });
    g.addEventListener('pointermove', e => {
      if (!start) return; const dx = (e.clientX - start.x) / (innerWidth - T.ox), dy = (e.clientY - start.y) / (innerHeight - 56);
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) start.moved = true; if (!start.moved) return;
      if (seite === 'oben') VH.t = T.clamp(start.v.t + dy, 0, VH.b);
      if (seite === 'unten') VH.b = T.clamp(start.v.b + dy, VH.t, 1);
      if (seite === 'links') VH.l = T.clamp(start.v.l + dx, 0, VH.r);
      if (seite === 'rechts') VH.r = T.clamp(start.v.r + dx, VH.l, 1);
      vorhangPlatz();
    });
    const ende = () => {
      if (start && !start.moved) { // antippen: ein Stück (10 %) aufziehen
        if (seite === 'oben') VH.t = Math.min(VH.b, VH.t + 0.1); if (seite === 'unten') VH.b = Math.max(VH.t, VH.b - 0.1);
        if (seite === 'links') VH.l = Math.min(VH.r, VH.l + 0.1); if (seite === 'rechts') VH.r = Math.max(VH.l, VH.r - 0.1);
        vorhangPlatz();
      }
      start = null;
    };
    g.addEventListener('pointerup', ende); g.addEventListener('pointercancel', ende);
    return g;
  };
  vorhang.append(griff('oben', '▼', 'Von oben aufziehen (antippen: ein Stück)'), griff('unten', '▲', 'Von unten aufziehen'), griff('links', '▶', 'Von links aufziehen'), griff('rechts', '◀', 'Von rechts aufziehen'),
    h('div', { class: 'vmitte' }, h('button', { class: 'vknopf', title: 'Vorhang wieder ganz schließen', onclick: () => { Object.assign(VH, { l: 0, t: 0, r: 1, b: 1 }); vorhangPlatz(); } }, '↺'),
      h('button', { class: 'vknopf', title: 'Vorhang entfernen', onclick: () => vorhangUmschalten(false) }, '×')));
  vorhang.addEventListener('pointerdown', e => e.stopPropagation());
  document.body.append(vorhang); vorhangPlatz(); updateToolbar();
}
addEventListener('resize', vorhangPlatz);

// Phasentimer: mehrere Phasen laufen nacheinander ab, mit Signal beim Wechsel
const PHASEN_VORLAGEN = {
  'Unterrichtsstunde (45 min)': [['Einstieg', 5], ['Erarbeitung', 20], ['Sicherung', 15], ['Abschluss', 5]],
  'Doppelstunde (90 min)': [['Einstieg', 10], ['Erarbeitung I', 25], ['Pause', 5], ['Erarbeitung II', 25], ['Sicherung', 20], ['Abschluss', 5]],
  'Think – Pair – Share': [['Think: allein', 3], ['Pair: zu zweit', 4], ['Share: Klasse', 5]],
  'Gruppenarbeit': [['Aufgabe lesen', 3], ['Gruppenarbeit', 15], ['Präsentation vorbereiten', 5], ['Präsentation', 10]],
  'Stationenlernen (4 Stationen)': [['Station 1', 8], ['Wechsel', 1], ['Station 2', 8], ['Wechsel', 1], ['Station 3', 8], ['Wechsel', 1], ['Station 4', 8]]
};
const PFARBEN = ['#5b5bd6', '#14b8a6', '#f59e0b', '#ec4899', '#22c55e', '#8b5cf6', '#ef4444', '#0ea5e9'];
// Seiten werden über eine feste Kennung verknüpft (bleibt beim Umsortieren richtig)
const seitenId = p => p.id || (p.id = T.uid());
const seiteZu = id => S.board ? S.board.pages.findIndex(p => p.id === id) : -1;
function phasenWidget() {
  let phasen; try { phasen = JSON.parse(localStorage.getItem('tafelapp.phasen')); } catch (e) {}
  if (S.board && Array.isArray(S.board.phasen) && S.board.phasen.length) phasen = S.board.phasen.map(p => ({ ...p })); // Planung dieser Tafel (mit Seiten)
  if (!Array.isArray(phasen) || !phasen.length) phasen = PHASEN_VORLAGEN['Unterrichtsstunde (45 min)'].map(([n, m]) => ({ n, m }));
  const merke = () => {
    try { localStorage.setItem('tafelapp.phasen', JSON.stringify(phasen.map(({ n, m }) => ({ n, m })))); } catch (e) {}
    if (S.board) { if (phasen.some(p => p.seite)) S.board.phasen = phasen.map(p => ({ ...p })); else delete S.board.phasen; T.changed(); } // mit Seiten verknüpft → in der Tafel speichern
  };
  const zurSeite = p => { const i = p && p.seite ? seiteZu(p.seite) : -1; if (i >= 0 && i !== S.page) { gotoPage(i); toast('📄 ' + (S.board.pages[i].titel || 'Seite ' + (i + 1)), 1800); } };
  const seitenName = id => { const i = seiteZu(id); return i < 0 ? '' : (i + 1) + (S.board.pages[i].titel ? ' · ' + S.board.pages[i].titel : ''); };
  let laeuft = false, pause = false, idx = 0, rest = 0, last = 0, iv = 0, fertig = false;
  const box = h('div', { class: 'phasen' });
  const fmt = s => { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const tick = () => {
    if (pause || fertig) return; const now = performance.now(); rest -= (now - last) / 1000; last = now;
    if (rest <= 0) { beep(); idx++; if (idx >= phasen.length) { fertig = true; clearInterval(iv); } else { rest = phasen[idx].m * 60; zurSeite(phasen[idx]); } zeichne(); }
    else lauf();
  };
  let zeitEl = null, balken = null;
  const lauf = () => {
    if (zeitEl) zeitEl.textContent = fmt(rest);
    if (balken) [...balken.children].forEach((s, i) => { const f = s.firstChild; f.style.width = (i < idx ? 100 : i > idx ? 0 : 100 * (1 - rest / (phasen[i].m * 60))) + '%'; });
  };
  const zeichne = () => {
    box.innerHTML = ''; zeitEl = balken = null; w && w.kopf();
    if (!laeuft) {
      const liste = h('div', { class: 'pliste' });
      phasen.forEach((p, i) => liste.append(h('div', { class: 'prow' },
        h('span', { class: 'pdot', style: { background: PFARBEN[i % PFARBEN.length] } }),
        h('input', { type: 'text', class: 'feld', value: p.n, oninput: e => { p.n = e.target.value; merke(); } }),
        h('input', { type: 'text', class: 'feld pmin', value: String(p.m).replace('.', ','), inputmode: 'decimal', onchange: e => { p.m = Math.max(0.5, parseFloat(String(e.target.value).replace(',', '.')) || 1); merke(); zeichne(); } }),
        h('span', { class: 'hint' }, 'min'),
        S.board ? h('select', { class: 'feld pseite', title: 'Diese Seite zeigen, wenn die Phase beginnt', onchange: e => { if (e.target.value) p.seite = e.target.value; else delete p.seite; merke(); } },
          h('option', { value: '' }, '📄 –'), ...S.board.pages.map(pg => h('option', { value: seitenId(pg), selected: p.seite === pg.id }, '📄 ' + seitenName(pg.id)))) : '',
        h('button', { class: 'pmini', title: 'nach oben', disabled: i === 0, onclick: () => { [phasen[i - 1], phasen[i]] = [phasen[i], phasen[i - 1]]; merke(); zeichne(); } }, '↑'),
        h('button', { class: 'pmini', title: 'Phase löschen', onclick: () => { if (phasen.length > 1) { phasen.splice(i, 1); merke(); zeichne(); } } }, '×'))));
      const summe = phasen.reduce((a, p) => a + p.m, 0);
      const vorlage = h('select', { class: 'feld', onchange: e => { const v = PHASEN_VORLAGEN[e.target.value]; if (v) { phasen = v.map(([n, m]) => ({ n, m })); merke(); zeichne(); } } },
        h('option', { value: '' }, '📋 Vorlage wählen …'), ...Object.keys(PHASEN_VORLAGEN).map(k => h('option', { value: k }, k)));
      // Für jede Phase ohne Seite eine eigene Seite anlegen (Titel = Phasenname) – die Stunde ist dann vorbereitet
      const seitenAnlegen = () => {
        if (!S.board) return; T.snap(); let neu = 0;
        for (const p of phasen) if (!p.seite || seiteZu(p.seite) < 0) {
          const np = T.newPage(T.page().bg); np.abstand = T.page().abstand || null; np.titel = p.n; S.board.pages.push(np); p.seite = seitenId(np); neu++;
        }
        merke(); updateToolbar(); zeichne(); toast(neu ? `${neu} Seite${neu === 1 ? '' : 'n'} angelegt – Titel wie die Phasen. Seiten-Übersicht: unten „Seiten“.` : 'Alle Phasen haben schon eine Seite.', 3500);
      };
      box.append(vorlage, liste, h('div', { class: 'row' },
        h('button', { class: 'big', onclick: () => { phasen.push({ n: 'Phase ' + (phasen.length + 1), m: 5 }); merke(); zeichne(); } }, '＋ Phase'),
        S.board ? h('button', { class: 'big', title: 'Für jede Phase eine Tafelseite anlegen und verknüpfen', onclick: seitenAnlegen }, '📄 Seite je Phase') : '',
        h('span', { class: 'hint', style: { flex: 1 } }, 'Gesamt: ' + T.zahl(summe, 1) + ' min')),
        h('p', { class: 'hint' }, '📄 Mit einer Seite verknüpft, springt die Tafel beim Phasenwechsel automatisch dorthin.'));
      w && w.kopf(h('button', { class: 'big prim', onclick: () => { laeuft = true; pause = false; fertig = false; idx = 0; rest = phasen[0].m * 60; last = performance.now(); clearInterval(iv); iv = setInterval(tick, 200); zurSeite(phasen[0]); zeichne(); } }, '▶ Start'));
      return;
    }
    if (fertig) {
      box.append(h('div', { class: 'pname' }, 'Geschafft! 🎉'), h('div', { class: 'timer ende' }, '00:00'),
        h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'big prim', onclick: () => { laeuft = false; zeichne(); } }, '↺ Zurück zur Planung')));
      return;
    }
    const p = phasen[idx], col = PFARBEN[idx % PFARBEN.length];
    zeitEl = h('div', { class: 'timer', style: { color: col } });
    balken = h('div', { class: 'pbalken' }, ...phasen.map((q, i) => h('div', { class: 'pseg', style: { flex: q.m, background: PFARBEN[i % PFARBEN.length] + '33' }, title: q.n }, h('div', { style: { background: PFARBEN[i % PFARBEN.length] } }))));
    box.append(h('div', { class: 'pname', style: { color: col } }, `${idx + 1}/${phasen.length} · ${p.n}`),
      p.seite && seiteZu(p.seite) >= 0 ? h('div', { class: 'hint', style: { textAlign: 'center', marginTop: '-4px' } }, '📄 Seite ' + seitenName(p.seite)) : '', zeitEl, balken,
      h('div', { class: 'hint', style: { textAlign: 'center', margin: '6px 0' } }, idx + 1 < phasen.length ? 'Danach: ' + phasen[idx + 1].n + ' (' + T.zahl(phasen[idx + 1].m, 1) + ' min)' : 'Letzte Phase'),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'big', onclick: () => { pause = !pause; last = performance.now(); zeichne(); } }, pause ? '▶ Weiter' : '⏸ Pause'),
        h('button', { class: 'big', onclick: () => { rest += 60; lauf(); } }, '+1 min'),
        h('button', { class: 'big', onclick: () => { rest = 0; last = performance.now(); tick(); } }, '⏭ Nächste'),
        h('button', { class: 'big warn', onclick: () => { clearInterval(iv); laeuft = false; zeichne(); } }, '⏹')));
    lauf();
  };
  let w = null;
  w = widget('⏳ Phasentimer', [box], Math.max(20, innerWidth - 680), 80); zeichne();
  w.onclose = () => clearInterval(iv);
}
function timerWidget() {
  let total = 300, rest = 300, run = false, stopp = false, last = 0, iv = 0;
  const disp = h('div', { class: 'timer' }), fmt = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const show = () => { disp.textContent = fmt(rest); disp.classList.toggle('ende', !stopp && rest <= 0); };
  const tick = () => { const now = performance.now(), dt = (now - last) / 1000; last = now; rest += stopp ? dt : -dt; if (!stopp && rest <= 0) { rest = 0; run = false; clearInterval(iv); beep(); startBtn.textContent = '▶ Start'; } show(); };
  const startBtn = h('button', { class: 'big prim', onclick: () => { run = !run; if (run) { if (!stopp && rest <= 0) rest = total; last = performance.now(); iv = setInterval(tick, 200); } else clearInterval(iv); startBtn.textContent = run ? '⏸ Pause' : '▶ Start'; show(); } }, '▶ Start');
  const set = s => { stopp = false; total = rest = s; show(); };
  const w = widget('⏱ Timer', [disp,
    h('div', { class: 'row', style: { justifyContent: 'center', marginBottom: '8px' } }, ...[1, 2, 3, 5, 10, 15, 20].map(m => h('button', { class: 'big', onclick: () => set(m * 60) }, m + ' min'))),
    h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'big', onclick: () => { rest = Math.max(0, rest - 60); show(); } }, '−1'), startBtn, h('button', { class: 'big', onclick: () => { rest += 60; total = Math.max(total, rest); show(); } }, '+1'),
      h('button', { class: 'big', onclick: () => { stopp = false; rest = total; show(); } }, '↺'), h('button', { class: 'big', onclick: () => { stopp = true; rest = 0; show(); } }, 'Stoppuhr'))], innerWidth - 560, 80);
  w.onclose = () => clearInterval(iv); show();
}
// ---------- Namenslisten aus CSV / Excel (.xlsx) – ohne Zusatzbibliothek ----------
function zipLesen(buf) { // kleines ZIP-Lesen (Excel, Word): Dateinamen + lies(name, alsBytes)
  const dv = new DataView(buf), u8 = new Uint8Array(buf); let e = buf.byteLength - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('keine Office-Datei');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const dateien = {};
  for (let i = 0; i < n; i++) {
    const meth = dv.getUint16(p + 10, true), gr = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    dateien[new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl))] = { meth, gr, off }; p += 46 + nl + xl + cl;
  }
  const lies = async (name, bytes) => { const f = dateien[name]; if (!f) return null;
    const start = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true), roh = u8.subarray(start, start + f.gr);
    const r = f.meth === 0 ? new Response(roh) : new Response(new Blob([roh]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
    return bytes ? new Uint8Array(await r.arrayBuffer()) : await r.text(); };
  return { namen: Object.keys(dateien), lies };
}
T.zipLesen = zipLesen;
async function xlsxZeilen(buf) { // liest das erste Tabellenblatt einer .xlsx-Datei als Zeilen mit Zellen
  let z; try { z = zipLesen(buf); } catch (e) { throw new Error('keine Excel-Datei (.xlsx)'); }
  const dateien = Object.fromEntries(z.namen.map(n => [n, 1])), lies = z.lies;
  const xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const ss = await lies('xl/sharedStrings.xml'), strings = ss ? [...xml(ss).getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].map(t => t.textContent).join('')) : [];
  const blatt = Object.keys(dateien).filter(k => /^xl\/worksheets\/sheet\d+\.xml$/.test(k)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)))[0];
  if (!blatt) throw new Error('kein Tabellenblatt gefunden');
  const spalte = r => { let c = 0; for (const z of r.replace(/\d+/g, '')) c = c * 26 + z.charCodeAt(0) - 64; return c - 1; };
  return [...xml(await lies(blatt)).getElementsByTagName('row')].map(row => { const z = [];
    for (const c of row.getElementsByTagName('c')) { const t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0];
      z[spalte(c.getAttribute('r') || 'A')] = t === 's' ? strings[+v.textContent] || '' : t === 'inlineStr' ? [...c.getElementsByTagName('t')].map(x => x.textContent).join('') : v ? v.textContent : ''; }
    return Array.from(z, x => (x || '').trim()); });
}
function csvZeilen(text) {
  const zeilen = text.replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  const trenner = [';', '\t', ','].find(t => zeilen.slice(0, 5).some(l => l.includes(t))) || ';';
  return zeilen.map(l => { const z = []; let feld = '', q = false;
    for (let i = 0; i < l.length; i++) { const c = l[i];
      if (q) { if (c === '"' && l[i + 1] === '"') { feld += '"'; i++; } else if (c === '"') q = false; else feld += c; }
      else if (c === '"') q = true; else if (c === trenner) { z.push(feld.trim()); feld = ''; } else feld += c; }
    z.push(feld.trim()); return z; });
}
// Zeilen → {Klasse: [Namen]}; erkennt Kopfzeilen wie „Vorname“, „Nachname“, „Name“, „Klasse“
function namenAusZeilen(zeilen, standardKlasse) {
  zeilen = zeilen.filter(z => z.some(Boolean)); if (!zeilen.length) return {};
  const kopf = zeilen[0].map(s => s.toLowerCase()), such = re => kopf.findIndex(s => re.test(s));
  let vn = such(/^vorname|rufname|first ?name/), nn = such(/^nachname|familienname|last ?name|^zuname/), nm = such(/^(schüler(in)?|name|namen|schülername)$/), kl = such(/^klasse|^lerngruppe|^gruppe|^kurs/);
  const mitKopf = vn >= 0 || nn >= 0 || nm >= 0 || kl >= 0, daten = mitKopf ? zeilen.slice(1) : zeilen;
  if (!mitKopf) { // ohne Kopfzeile: zwei Textspalten = Nachname, Vorname (typisch für Exporte), sonst erste gefüllte Spalte
    const zwei = daten.every(z => z.filter(Boolean).length >= 2 && !/\d/.test(z[0] + z[1]));
    if (zwei) { nn = 0; vn = 1; } else nm = -2; }
  const roh = daten.map(z => ({ v: vn >= 0 ? z[vn] || '' : '', n: nn >= 0 ? z[nn] || '' : '', name: nm >= 0 ? z[nm] || '' : nm === -2 ? z.find(Boolean) || '' : '', k: kl >= 0 ? z[kl] || standardKlasse : standardKlasse }));
  const vorn = {}; roh.forEach(r => { if (r.v) vorn[r.k + '|' + r.v] = (vorn[r.k + '|' + r.v] || 0) + 1; });
  const listen = {};
  for (const r of roh) { // Vorname genügt; bei gleichen Vornamen in einer Klasse kommt der Anfangsbuchstabe des Nachnamens dazu
    const name = r.v ? (vorn[r.k + '|' + r.v] > 1 && r.n ? `${r.v} ${r.n[0]}.` : r.v) : r.name || r.n;
    if (name) (listen[r.k] = listen[r.k] || []).push(name);
  }
  return listen;
}
async function namenDatei(datei, standardKlasse) {
  const endung = (datei.name.match(/\.(\w+)$/) || [])[1]?.toLowerCase();
  if (endung === 'xls') throw new Error('Bitte in Excel als .xlsx oder als CSV speichern (alte .xls-Dateien werden nicht unterstützt).');
  let zeilen;
  if (endung === 'xlsx') zeilen = await xlsxZeilen(await datei.arrayBuffer());
  else { const buf = await datei.arrayBuffer(); let t = new TextDecoder('utf-8').decode(buf); if (t.includes('�')) t = new TextDecoder('windows-1252').decode(buf); zeilen = csvZeilen(t); }
  return namenAusZeilen(zeilen, standardKlasse);
}
T.namenAusZeilen = namenAusZeilen; T.csvZeilen = csvZeilen; T.namenDatei = namenDatei; // für Tests

// ---------- Persönliche Einstellungen je Lehrkraft (Favoriten, Werkzeugleiste, Farben, Stift …) ----------
// Gespeichert im Browser je Lehrkraft UND – wenn ein Ablageordner verbunden ist – als „_einstellungen.json“ im Ordner der Lehrkraft.
// So hat jede Lehrkraft am selben Board ihre eigenen Favoriten und nimmt sie auf andere Boards mit (gleicher Ablageordner).
// Beim Laden gilt: Datei im Ablageordner vor Browser-Speicher (keine Uhrzeit-Vergleiche zwischen verschiedenen PCs).
// Seit 06.11.: ALLES Persönliche – Grundeinstellungen (T.opts außer Board-Einstellungen), Favoriten, Werkzeugleiste,
// Tafelbild-Vorlagen, Übungslisten, Klassenlisten, eigene Arbeitssymbole/Glücksrad/Phasen/Teams … (alle „tafelapp.*“-Einträge im Browser).
// Die Tafeln selbst liegen ohnehin im Ordner der Lehrkraft.
const GERAET = new Set(['lehrkraft', 'finger', 'palm', 'druck', 'glatt', 'leisteOben', 'tastatur', 'kameraId', 'kameraManuell']); // gehören zum Board, nicht zur Lehrkraft
const lsPersoenlich = k => !!k && ((k.startsWith('tafelapp.') && k !== 'tafelapp.opts' && !k.startsWith('tafelapp.pers.') && !k.startsWith('tafelapp.pin.')) || k === 'tafel-uebungslisten');
const PERS_DATEI = '_einstellungen.json', persKey = n => 'tafelapp.pers.' + F.safe(n);
let persFuer = T.opts.lehrkraft || '', persTimer = 0, persStill = false;
const persDaten = () => {
  const opts = {}; for (const [k, v] of Object.entries(T.opts)) if (!GERAET.has(k)) opts[k] = v;
  const daten = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (lsPersoenlich(k)) daten[k] = localStorage.getItem(k); }
  return { version: 2, opts, daten };
};
async function persSichern(name) {
  if (!name) return; const o = persDaten(), txt = JSON.stringify(o);
  persStill = true; try { localStorage.setItem(persKey(name), txt); } catch (e) {} persStill = false;
  if (F.root) { try { const d = await F.dir([name], true), w = await (await d.getFileHandle(PERS_DATEI, { create: true })).createWritable(); await w.write(txt); await w.close(); } catch (e) {} }
}
async function persLesen(name) {
  let o = null;
  if (F.root) { try { const d = await F.dir([name], false); o = JSON.parse(await (await (await d.getFileHandle(PERS_DATEI)).getFile()).text()); } catch (e) {} }
  if (!o) try { o = JSON.parse(localStorage.getItem(persKey(name)) || 'null'); } catch (e) {}
  return o && !o.version ? { version: 1, opts: o, daten: null } : o; // ältere Fassung: nur Werkzeug-Einstellungen
}
function persAnwenden(o) {
  for (const k of Object.keys(T.opts)) if (!GERAET.has(k)) delete T.opts[k];
  if (o && o.opts) for (const [k, v] of Object.entries(o.opts)) if (!GERAET.has(k)) T.opts[k] = v;
  persStill = true;
  try {
    if (o && o.daten) { // Listen, Vorlagen usw. der Lehrkraft in den Browser-Speicher
      const weg = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (lsPersoenlich(k)) weg.push(k); }
      weg.forEach(k => localStorage.removeItem(k));
      for (const [k, v] of Object.entries(o.daten)) if (lsPersoenlich(k)) localStorage.setItem(k, v);
    } else if (!o) { const weg = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (lsPersoenlich(k)) weg.push(k); } weg.forEach(k => localStorage.removeItem(k)); } // neue Lehrkraft: leer
  } catch (e) {}
  T.saveOptsRoh(); persStill = false;
  if (T.setThema && T.opts.thema) T.setThema(T.opts.thema);
  S.stiftArt = T.opts.stiftArt === 'kalli' ? 'kalli' : 'normal'; S.groesse.stift = T.opts.stiftStaerke || 4;
  if (S.board) { buildToolbar(); updateToolbar(); }
  seiteAnwenden(); T.paletteNeu && T.paletteNeu();
}
// jede Änderung der Einstellungen (kurz verzögert) für die aktuelle Lehrkraft sichern
T.saveOptsRoh = T.saveOpts;
let persOffen = false; // eine Änderung wartet noch aufs Sichern
const persPlanen = () => { if (!persFuer || persStill) return; clearTimeout(persTimer); const n = persFuer; persOffen = true; persTimer = setTimeout(() => { persOffen = false; persSichern(n); }, 800); };
T.saveOpts = () => { T.saveOptsRoh(); persPlanen(); };
// Änderungen an Listen, Vorlagen usw. (direkt im Browser-Speicher) ebenfalls für die Lehrkraft sichern
{ const setz = Storage.prototype.setItem, entf = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) { setz.call(this, k, v); if (this === window.localStorage && lsPersoenlich(k)) persPlanen(); };
  Storage.prototype.removeItem = function (k) { entf.call(this, k); if (this === window.localStorage && lsPersoenlich(k)) persPlanen(); }; }
// Lehrkraft gewechselt: eigene Einstellungen der neuen Lehrkraft laden (neue Lehrkraft = Standard und leere Listen)
async function persWechsel() {
  const neu = T.opts.lehrkraft || ''; if (neu === persFuer) return;
  clearTimeout(persTimer); if (persFuer && persOffen) await persSichern(persFuer); // nur Ungesichertes – sonst würde ein neuerer Stand von einem anderen Board überschrieben
  persOffen = false;
  if (F.wechselLehrkraft) await F.wechselLehrkraft(neu); // eigener Ablageordner der neuen Lehrkraft (erst nach dem Sichern der alten)
  const alt = persFuer; persFuer = neu; if (!neu) return;
  const o = await persLesen(neu);
  if (!o && !alt) { await persSichern(neu); return; } // bisher ohne Lehrkraft gearbeitet: alles Vorhandene gehört der ersten gewählten Lehrkraft
  persAnwenden(o);
}
T.persWechsel = persWechsel;
// Ablageordner (wieder) verbunden: Stand der Lehrkraft aus ihrem Ordner holen
T.persNeuLaden = async () => {
  if (!persFuer || !F.root) return;
  const o = await persLesen(persFuer);
  if (o) { if (JSON.stringify(o.opts) !== JSON.stringify(persDaten().opts) || JSON.stringify(o.daten || {}) !== JSON.stringify(persDaten().daten)) persAnwenden(o); } else persSichern(persFuer);
};
// beim Start: Stand aus dem Ablageordner holen (z. B. an einem anderen Board geändert); ohne Eintrag gehört alles Bisherige dieser Lehrkraft
setTimeout(async () => {
  if (!persFuer) return;
  const o = await persLesen(persFuer);
  if (o && o.version === 2) { const jetzt = persDaten(); if (JSON.stringify(o.opts) !== JSON.stringify(jetzt.opts) || JSON.stringify(o.daten) !== JSON.stringify(jetzt.daten)) persAnwenden(o); }
  else persSichern(persFuer); // noch kein (vollständiger) Eintrag: aktuellen Stand übernehmen
}, 1500);

// ---------- Klassenliste: Klassen anlegen, Namen als Tabelle eintragen oder aus Excel/CSV übernehmen ----------
// Gespeichert wie bisher in localStorage „tafelapp.klassen“ ({Klasse: [Namen]}) – genutzt von Namen ziehen, Glücksrad, Gruppen …
const klLesen = () => { try { const l = JSON.parse(localStorage.getItem('tafelapp.klassen') || '{}'); return l && typeof l === 'object' ? l : {}; } catch (e) { return {}; } };
const klSchreiben = l => { try { localStorage.setItem('tafelapp.klassen', JSON.stringify(l)); } catch (e) { toast('Speichern nicht möglich (Browser-Speicher gesperrt).', 3000); } };
// „fehlt heute“: gilt nur für den heutigen Tag (am nächsten Tag automatisch wieder alle da)
const heute = () => new Date().toISOString().slice(0, 10);
const fehltLesen = () => { try { const f = JSON.parse(localStorage.getItem('tafelapp.fehlt') || '{}'); return f.tag === heute() ? f.k || {} : {}; } catch (e) { return {}; } };
const fehltSchreiben = k => { try { localStorage.setItem('tafelapp.fehlt', JSON.stringify({ tag: heute(), k })); } catch (e) {} };
// Klassenlisten ohne die heute fehlenden Namen (für Namen ziehen, Glücksrad, Gruppen …)
T.klassenAnwesend = () => { const l = klLesen(), f = fehltLesen(); for (const k of Object.keys(l)) if (f[k]) l[k] = l[k].filter(n => !f[k].includes(n)); return l; };
function klassenliste(start, fertig) {
  let listen = klLesen(), klasse = start != null && listen[start] ? start : (S.board && S.board.klasse && listen[S.board.klasse] ? S.board.klasse : Object.keys(listen)[0] || '');
  let namen = (listen[klasse] || []).slice(), geaendert = false;
  const box = h('div', { class: 'kl-box' });
  const sichern = () => { if (!klasse) return; listen[klasse] = namen.map(s => s.trim()).filter(Boolean); klSchreiben(listen); geaendert = false; };
  const wechsel = k => { if (geaendert) sichern(); klasse = k; namen = (listen[k] || []).slice(); male(); };
  const datei = h('input', { type: 'file', accept: '.csv,.txt,.xlsx,.xls', style: { display: 'none' }, onchange: async ev => {
    const f = ev.target.files[0]; ev.target.value = ''; if (!f) return;
    try {
      const neu = await namenDatei(f, klasse || f.name.replace(/\.\w+$/, '')), ks = Object.keys(neu);
      if (!ks.length) { toast('In der Datei wurden keine Namen gefunden.', 4000); return; }
      if (ks.length === 1) { if (!klasse) klasse = ks[0]; namen = neu[ks[0]]; sichern(); male(); toast(`${namen.length} Namen übernommen – bitte kurz prüfen.`, 3500); return; }
      if (!await frage(`Die Datei enthält ${ks.length} Klassen (${ks.join(', ')}). Alle als eigene Listen übernehmen? Gleichnamige Listen werden ersetzt.`)) return;
      Object.assign(listen, neu); klSchreiben(listen); wechsel(ks[0]); toast(`${ks.length} Klassenlisten übernommen.`, 3500);
    } catch (e) { toast('Datei nicht lesbar: ' + e.message, 6000); }
  } });
  const male = (fokus) => {
    box.innerHTML = '';
    const ks = Object.keys(listen).sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));
    const fAlle = fehltLesen();
    box.append(h('div', { class: 'chips' }, ...ks.map(k => h('button', { class: 'chip' + (k === klasse ? ' on' : ''), onclick: () => wechsel(k) }, k + ' (' + (k === klasse ? namen.filter(Boolean).length : (listen[k] || []).length) + ')' + ((fAlle[k] || []).length ? ` · ${fAlle[k].length} fehlt` : ''))),
      h('button', { class: 'chip', onclick: async () => { const n = await frage('Name der Klasse oder Gruppe, z. B. 7b oder Englisch E-Kurs:', { ok: 'Anlegen', feld: {} }); if (!n || !n.trim()) return; if (geaendert) sichern(); klasse = n.trim(); listen[klasse] = listen[klasse] || []; namen = listen[klasse].slice(); klSchreiben(listen); male(); } }, '＋ Neue Klasse')));
    if (!klasse) { box.append(h('p', { class: 'hint' }, 'Noch keine Klasse. „＋ Neue Klasse“ antippen oder gleich eine Excel-/CSV-Datei übernehmen.'),
      h('div', { class: 'row' }, h('button', { class: 'big prim', onclick: () => datei.click() }, '📥 Aus Excel / CSV'), datei)); return; }
    if (!namen.length || namen[namen.length - 1]) namen.push('');
    const fehlt = fehltLesen(), fk = new Set(fehlt[klasse] || []);
    const tab = h('table', { class: 'ue-tab kl-tab' }, h('tr', {}, h('th', { class: 'ue-nr' }, 'Nr.'), h('th', {}, 'Name (Vorname genügt)'), h('th', { class: 'ue-ok', title: 'gilt nur heute' }, 'fehlt heute'), h('th', { class: 'ue-akt' }, '')));
    namen.forEach((n, i) => {
      const inp = h('input', { type: 'text', class: 'ue-feld', value: n, placeholder: i === namen.length - 1 ? '＋ weiterer Name …' : '', 'data-i': i });
      inp.addEventListener('input', () => { namen[i] = inp.value; geaendert = true; if (i === namen.length - 1 && inp.value) { const p = inp.selectionStart; male(); const f = box.querySelector(`[data-i="${i}"]`); f.focus(); f.setSelectionRange(p, p); } });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const nx = box.querySelector(`[data-i="${i + 1}"]`); if (nx) nx.focus(); } });
      inp.addEventListener('paste', e => { e.stopPropagation(); const t = (e.clipboardData || window.clipboardData).getData('text'); if (!/[\n\t;]/.test(t)) return; e.preventDefault();
        const z = T.namenAusZeilen(csvZeilen(t), klasse)[klasse] || Object.values(T.namenAusZeilen(csvZeilen(t), klasse))[0] || []; namen.splice(i, namen[i] ? 0 : 1, ...z); geaendert = true; sichern(); male(); toast(z.length + ' Namen eingefügt.', 2000); });
      tab.append(h('tr', { class: n && fk.has(n) ? 'kl-fehlt' : '' }, h('td', { class: 'ue-nr' }, n ? (i + 1) + '.' : ''), h('td', {}, inp),
        h('td', { class: 'ue-ok' }, n ? h('button', { class: 'ue-haken kl-haken' + (fk.has(n) ? ' on' : ''), title: fk.has(n) ? 'fehlt heute – antippen: ist da' : 'antippen: fehlt heute', onclick: () => {
          fk.has(n) ? fk.delete(n) : fk.add(n); const f = fehltLesen(); f[klasse] = [...fk]; fehltSchreiben(f); male(); } }, fk.has(n) ? '✗' : '') : ''),
        h('td', { class: 'ue-akt' }, n ? h('span', { class: 'ue-knoepfe' }, h('button', { title: 'Name löschen', onclick: () => { namen.splice(i, 1); geaendert = true; male(); } }, '🗑')) : '')));
    });
    box.append(h('div', { class: 'row', style: { margin: '10px 0 6px' } },
      h('button', { class: 'big', onclick: () => datei.click() }, '📥 Aus Excel / CSV'), datei,
      h('button', { class: 'big', title: 'Namen alphabetisch sortieren', onclick: () => { namen = namen.filter(Boolean).sort((a, b) => a.localeCompare(b, 'de')); geaendert = true; male(); } }, '🔤 Sortieren'),
      h('button', { class: 'big', title: 'Klasse umbenennen', onclick: async () => { const n = await frage('Neuer Name der Klasse:', { ok: 'Umbenennen', feld: { wert: klasse } }); if (!n || !n.trim() || n.trim() === klasse) return; delete listen[klasse]; klasse = n.trim(); sichern(); male(); } }, '✏️ Umbenennen'),
      h('button', { class: 'big warn', onclick: async () => { if (!await frage(`Klassenliste „${klasse}“ löschen?`, { ok: 'Löschen' })) return; delete listen[klasse]; klSchreiben(listen); klasse = Object.keys(listen)[0] || ''; namen = (listen[klasse] || []).slice(); geaendert = false; male(); } }, '🗑 Klasse löschen')),
      tab, h('p', { class: 'hint' }, 'Tipp: Namen aus Excel oder Word markieren, kopieren und in ein Feld einfügen (Strg+V). Aus Dateien werden Spalten wie „Vorname“, „Nachname“, „Klasse“ erkannt – übernommen werden nur Vornamen (bei gleichen Vornamen mit Anfangsbuchstaben). Die Listen bleiben nur auf diesem Gerät.'));
    if (fokus) { const f = box.querySelector(`[data-i="${namen.length - 1}"]`); if (f) f.focus(); }
  };
  male();
  openDlg([h('h2', {}, '👥 Klassenliste'), box, h('div', { class: 'acts' },
    h('button', { class: 'big', onclick: () => { sichern(); closeDlg(); zufallWidget(); } }, '🎯 Namen ziehen'),
    h('button', { class: 'big prim', onclick: () => { sichern(); closeDlg(); fertig && fertig(); toast('Klassenliste gespeichert.', 1800); } }, '✓ Fertig'))]);
}
T.klassenliste = klassenliste;
function zufallWidget() {
  const listen = T.klassenAnwesend(); // ohne die heute Fehlenden
  const keys = Object.keys(listen); let klasse = keys[0] || '', gezogen = [];
  const out = h('div', { class: 'zname' }, '?'), info = h('div', { class: 'hint', style: { textAlign: 'center' } });
  const sel = h('select', { style: { fontSize: '18px', padding: '8px' }, onchange: e => { klasse = e.target.value; gezogen = []; info.textContent = ''; } }, ...keys.map(k => h('option', { value: k }, k)));
  const ohne = h('input', { type: 'checkbox', checked: true, style: { width: '26px', height: '26px' } });
  const zieh = () => {
    const alle = (listen[klasse] || []); let pool = ohne.checked ? alle.filter(n => !gezogen.includes(n)) : alle;
    if (!alle.length) { out.textContent = 'Liste anlegen ✏️'; return; }
    if (!pool.length) { gezogen = []; pool = alle; }
    let k = 0; const iv = setInterval(() => { out.textContent = pool[Math.floor(Math.random() * pool.length)]; if (++k > 12) { clearInterval(iv); const n = pool[Math.floor(Math.random() * pool.length)]; out.textContent = n; gezogen.push(n); info.textContent = `${gezogen.length} von ${alle.length} gezogen`; } }, 70);
  };
  const edit = () => klassenliste(klasse, () => { w.remove(); zufallWidget(); }); // Namen pflegen: gemeinsame Klassenliste
  const w = widget('🎯 Zufallsauswahl', [h('div', { class: 'row', style: { justifyContent: 'center' } }, keys.length ? sel : '', h('button', { class: 'big', onclick: edit }, '✏️ Liste')), out, info,
    h('div', { class: 'row', style: { justifyContent: 'center' } }, h('label', { class: 'row' }, ohne, 'ohne Wiederholung'), h('button', { class: 'big prim', onclick: zieh }, '🎲 Ziehen'))], innerWidth - 560, 360);
}
function wuerfelWidget() {
  let anz = 1; const box = h('div', { class: 'wuerfel' });
  const P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[28, 28], [50, 50], [72, 72]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]] };
  const draw = vals => { box.innerHTML = vals.map(v => `<svg viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="#1d2433" stroke-width="5"/>${P[v].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#1d2433"/>`).join('')}</svg>`).join(''); };
  const roll = () => { let k = 0; const iv = setInterval(() => { draw(Array.from({ length: anz }, () => 1 + Math.floor(Math.random() * 6))); if (++k > 9) clearInterval(iv); }, 70); };
  draw([6]);
  widget('🎲 Würfel', [box, h('div', { class: 'row', style: { justifyContent: 'center' } }, ...[1, 2, 3].map(n => h('button', { class: 'big', onclick: () => { anz = n; roll(); } }, n + ' ×')), h('button', { class: 'big prim', onclick: roll }, 'Würfeln'))], 140, 120);
}

// ---------- Tastatur & Einfügen aus Zwischenablage ----------
addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if (e.key === 'Escape') { closeDlg(); T.closePops(); if (S.sel) { S.sel = null; T.renderOver(); } return; }
  if (typing || !S.board || modal.style.display === 'flex') return;
  const c = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  if (c && k === 'z' && !e.shiftKey) { e.preventDefault(); T.undo(); }
  else if (c && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); T.redo(); }
  else if (c && k === 's') { e.preventDefault(); speichern(true); }
  else if (c && k === 'd') { e.preventDefault(); duplicateSel(); }
  else if (c && k === 'c' && S.sel) { e.preventDefault(); kopierenSel(false); }
  else if (c && k === 'x' && S.sel) { e.preventDefault(); kopierenSel(true); }
  else if (c && k === 'v' && tafelAblage && !systemAblageOk) { e.preventDefault(); einfuegenAblage(); } // ohne Zugriff auf die Windows-Zwischenablage
  else if ((e.key === 'Delete' || e.key === 'Backspace') && S.sel) { e.preventDefault(); deleteSel(); }
  else if (e.key === 'Home') T.resetView();
  else if (e.key === 'End') T.allesZeigen();
  else if (e.key === 'PageDown') gotoPage(S.page + 1);
  else if (e.key === 'PageUp') gotoPage(S.page - 1);
  else if ((e.ctrlKey && e.altKey || (!c && !e.altKey)) && e.key.length === 1 && e.key !== ' ' && !S.sel && !document.getElementById('gebet') && ![...document.querySelectorAll('.plot-ov')].some(x => x.style.display !== 'none')) {
    e.preventDefault(); const [x, y] = schreibstelle(); // einfach lostippen (AltGr-Zeichen wie @ € zählen mit)
    const it = T.page().items; // der Mausklick mit dem Stift hat einen Punkt gemalt – weg damit
    const pi = it.findLastIndex((s, i) => i >= it.length - 3 && s.t === 's' && s.p.length <= 3 && Math.hypot(s.p[0][0] - x, s.p[0][1] - y) < 4);
    if (pi >= 0) it.splice(pi, 1);
    T.textInline(x, y, e.key);
  }
});
addEventListener('paste', async e => {
  if (!S.board || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  const f = [...(e.clipboardData && e.clipboardData.files || [])].find(x => x.type.startsWith('image/'));
  if (f) { e.preventDefault(); bildEinfuegen(f); return; }
  const text = e.clipboardData && e.clipboardData.getData('text/plain');
  if (text === MARKE && tafelAblage) { e.preventDefault(); einfuegenAblage(); return; } // in der Tafel-App kopierte Elemente
  if (text && text.trim()) { e.preventDefault(); const [x, y] = schreibstelle(); T.textInline(x, y, text.replace(/\r\n?/g, '\n')); } // Text aus der Zwischenablage (Strg+V) auf die Tafel
});
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (!f || !S.board) return; if (f.type.startsWith('image/')) bildEinfuegen(f); else if (f.name.endsWith('.json')) f.text().then(t => { try { ladeTafel(JSON.parse(t), null); S.dirty = true; } catch (x) { toast('Keine Tafel-Datei.'); } }); });

// ---------- Start ----------
$('bArchiv').onclick = () => { if (S.dirty && F.root) speichern(false); archiv(); };
// 💾 Speichern öffnet das Menü: Tafel speichern, Seite/Auswahl zu „Meine Aufgaben“ (Strg+S speichert weiter direkt)
$('bSave').onclick = e => {
  const n = S.sel && S.sel.ids ? S.sel.ids.size : 0, zu = fn => () => { T.closePops(); fn(); };
  openPop(e.currentTarget, h('div', { class: 'sp-kasten' }, h('h4', {}, '💾 Speichern'), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch' } },
    h('button', { class: 'big', onclick: zu(() => speichern(true)) }, '💾 Tafel speichern (Strg+S)'))),
    h('div', { class: 'ma-kasten' }, /* eigener, farbig eingerahmter Bereich – hebt sich vom normalen Speichern ab */
      h('h4', {}, '⭐ Zu „Meine Aufgaben“ hinzufügen'), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch' } },
        h('button', { class: 'big', title: 'Alles auf dieser Seite (getippte Aufgaben, Bilder, Bausteine, Handschrift)', onclick: zu(() => T.seiteZuMeinenAufgaben(false)) }, '📄 Diese Seite'),
        h('button', { class: 'big', disabled: !n, title: n ? 'Nur die ausgewählten Elemente' : 'Erst auf der Tafel etwas auswählen', onclick: zu(() => T.seiteZuMeinenAufgaben(true)) }, '☑ Auswahl' + (n ? ` (${n})` : ' – erst etwas auswählen'))),
      h('div', { class: 'row', style: { marginTop: '10px' } }, h('button', { class: 'big prim', onclick: zu(() => { matheWahl = 'meine'; zeigeDock('aufgaben'); }) }, '⭐ Meine Aufgaben öffnen'))));
};
$('bExport').onclick = e => exportPop(e.currentTarget);
$('bSettings').onclick = settingsDialog;
$('ablageInfo').onclick = infoDialog;
$('bFull').onclick = () => { // Vollbild – am iPad mit Safari-Präfix; geht es nicht: als App vom Home-Bildschirm starten
  const d = document, el = d.documentElement, voll = d.fullscreenElement || d.webkitFullscreenElement;
  if (voll) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
  const an = el.requestFullscreen || el.webkitRequestFullscreen;
  if (an) { try { const p = an.call(el); if (p && p.catch) p.catch(() => toast('Vollbild geht hier nicht – am iPad: Safari › Teilen › „Zum Home-Bildschirm“, dann von dort starten.', 5000)); } catch (e) {} }
  else toast('Vollbild: am iPad Safari › Teilen › „Zum Home-Bildschirm“ – dann startet die Tafel ohne Leisten.', 5000);
};
// iPad/Safari: kein Seiten-Zoom durch Zwei-Finger-Geste oder Doppeltipp (die Tafel zoomt selbst)
['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
document.addEventListener('dblclick', e => { if (!e.target.closest('input,textarea,[contenteditable]')) e.preventDefault(); }, { passive: false });

// ---------- Hell / Dunkel ----------
const dunkelMQ = matchMedia('(prefers-color-scheme: dark)');
const THEMEN = { auto: ['🌓', 'Automatisch (wie Windows)'], hell: ['☀️', 'Hell'], dunkel: ['🌙', 'Dunkel'] };
T.setThema = t => {
  T.opts.thema = THEMEN[t] ? t : 'auto'; T.saveOpts();
  const dunkel = T.opts.thema === 'dunkel' || (T.opts.thema === 'auto' && dunkelMQ.matches);
  document.documentElement.dataset.theme = dunkel ? 'dark' : 'light';
  if (S.board && T.opts.tafelNacht) { autoInk(); T.renderOver(); } // weiße Tafel folgt dem Nachtmodus (Stift Schwarz ↔ Weiß passend)
  const b = $('bThema'); b.textContent = THEMEN[T.opts.thema][0]; b.title = 'Darstellung: ' + THEMEN[T.opts.thema][1] + ' – antippen zum Wechseln';
};
dunkelMQ.addEventListener('change', () => T.setThema(T.opts.thema));
$('bThema').onclick = () => { const n = { auto: 'hell', hell: 'dunkel', dunkel: 'auto' }[T.opts.thema] || 'auto'; T.setThema(n); toast('Darstellung: ' + THEMEN[n][1], 1500); };

(async function start() {
  T.setThema(T.opts.thema || 'auto');
  document.body.classList.toggle('leisteOben', !!T.opts.leisteOben);
  T.initCanvas(); T.initInput(); buildToolbar();
  await F.init();
  archiv();
})();
})();
