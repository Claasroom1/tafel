// Tafel-App – 🗒 Folie: eine echte Ebene über der Tafel (wie eine Folie auf dem Overheadprojektor).
// Knopf 🗒 bei den Zoom-Knöpfen. Solange die Folie an ist, arbeitet die ganze Tafel-Bedienung auf ihr: Stift, Feder, Textmarker,
// Formen, Text, Einfügen, Auswahl, Schwamm, Rückgängig … Die Tafel liegt darunter und bleibt unverändert.
// Farbe (weiß, schwarz, Tafelgrün) und Durchsichtigkeit per Schieberegler; abgerundete Fläche mit leichtem Schatten am Rand,
// am ⠿ verschieben, an jeder Ecke Größe ändern. „⤓ Auf Tafel“ legt alles von der Folie an genau diese Stelle auf die Tafel – bearbeitbar.
// Die Folie gehört zur Seite (wird mit der Tafel gespeichert) – ✕ blendet sie aus, beim nächsten Öffnen ist der Inhalt wieder da.
'use strict';
(function () {
const h = T.h, S = T.S;
const FARBEN = [['weiss', '⬜', 'weiß', '#ffffff'], ['schwarz', '⬛', 'schwarz', '#1f2328'], ['gruen', '🟩', 'Tafelgrün', '#2d5a3d']];
let aktiv = false, leiste = null, ecken = [];
const o = () => T.opts || {};
const farbe = () => FARBEN.find(f => f[0] === (o().folieFarbe || 'weiss')) || FARBEN[0];
const deck = () => (o().folieDeck != null ? o().folieDeck : 70) / 100; /* Deckkraft der Folie 0 … 1 (Schieberegler) */
const basis = T.page; /* die eigentliche Tafelseite */
T.basisSeite = () => basis();
/* Bereich der Folie auf dem Bildschirm (Pixel), gemerkt */
const bereich = () => { const r = o().folieLage;
  if (!r) { /* zuerst kleiner, über dem 🗒-Knopf in der Werkzeugleiste (bzw. neben der Zoom-Leiste) */
    const w = Math.min(640, Math.round(innerWidth * 0.48)), hh = Math.min(440, Math.round(innerHeight * 0.5));
    const k = document.getElementById('navFolie'), kr = k && k.offsetParent ? k.getBoundingClientRect() : null;
    if (kr && kr.width) { const oben = kr.top > innerHeight / 2; return { x: T.clamp(kr.left + kr.width / 2 - w / 2, T.ox + 10, innerWidth - w - 10), y: oben ? Math.max(66, kr.top - hh - 30) : kr.bottom + 30, w, h: hh }; }
    return { x: Math.round((innerWidth - w) / 2), y: Math.max(66, Math.round((innerHeight - hh) / 2) - 40), w, h: hh }; }
  const w = T.clamp(r.w, 240, innerWidth - 10), hh = T.clamp(r.h, 160, innerHeight - 70); return { x: T.clamp(r.x, 0, innerWidth - 80), y: T.clamp(r.y, 56, innerHeight - 80), w, h: hh }; };
/* Die Folie einer Seite: eigene Elemente – sie SCHWEBT: Koordinaten gelten auf der Folie (0,0 = oben links),
   verschiebt man die Folie, wandert ihr Inhalt mit; Verschieben/Zoomen der Tafel darunter ändert an der Folie nichts */
function folieVon(b) {
  if (!b.folie) b.folie = { items: [] };
  const f = b.folie, B = bereich(); f.view = { x: B.x - T.ox, y: B.y, z: 1 };
  f.bg = deck() >= 0.5 ? farbe()[0] : b.bg; /* Tinte passend: dunkle Folie → helle Schrift (wie an der Tafel) */
  return f;
}
/* Wo getippt wird, entscheidet: auf der Folie → Folie, daneben → die Tafel (dort schreibt man ganz normal weiter) */
let ebene = 'folie', mini = false; /* mini: eingeklappt – nur die Leiste, man schreibt überall auf der Tafel */
T.page = () => { const b = basis(); return aktiv && !mini && b && ebene === 'folie' ? folieVon(b) : b; };
const imBereich = (x, y) => { if (mini) return false; const B = bereich(); return x >= B.x && x <= B.x + B.w && y >= B.y && y <= B.y + B.h; };
function minimieren(an) { mini = an; ebene = an ? 'tafel' : 'folie'; S.sel = null; S.teil = null; if (leiste) leiste.classList.toggle('mini', an); ecken.forEach(e => { e.style.display = an ? 'none' : ''; }); const k = leiste && leiste.querySelector('.fo-mini'); if (k) { k.textContent = an ? '▢' : '–'; k.title = an ? 'Folie wieder aufklappen' : 'Folie einklappen (minimieren) – Inhalt bleibt'; } T.render(); T.renderOver(); }
/* Der erste Stift/Finger einer Berührung entscheidet (isPrimary) – unabhängig davon, ob das Ende des letzten Strichs gemeldet wurde
   (am Board fehlt das manchmal, z. B. wenn der Stift schon wieder schwebt); weitere Finger (Zoomen, Handballen) ändern nichts */
/* Entschieden wird bei JEDEM Aufsetzen, solange kein anderer Kontakt liegt (Stift immer) – ein „hängender“ Finger,
   dessen Ende das Board nicht gemeldet hat, darf nicht dazu führen, dass Striche neben der Folie unsichtbar auf der Folie landen */
const kontakte = new Map(); /* pointerId → Zeitpunkt */
const merkeEnde = e => kontakte.delete(e.pointerId);
document.addEventListener('pointerup', merkeEnde, true); document.addEventListener('pointercancel', merkeEnde, true);
/* Stiftfarbe passend zur Fläche, auf der geschrieben wird: helle Folie → dunkle Schrift, dunkle Tafel bzw. durchsichtige Folie über dunkler Tafel → helle Schrift */
function tinteAnpassen() {
  const dunkel = T.isDark(T.page()), c = S.farbe && S.farbe.stift; if (!c) return;
  if (dunkel && c === '#1a1a1a') S.farbe.stift = '#ffffff'; else if (!dunkel && c === '#ffffff') S.farbe.stift = '#1a1a1a'; else return;
  T.updateToolbar && T.updateToolbar();
}
T.folieTinte = tinteAnpassen;
document.addEventListener('pointerdown', e => {
  if (!aktiv || e.target.id !== 'cOver') return;
  const jetzt = performance.now(); for (const [id, t] of kontakte) if (jetzt - t > 4000) kontakte.delete(id); /* alte, nie beendete Kontakte vergessen */
  const allein = !kontakte.size || e.pointerType === 'pen'; kontakte.set(e.pointerId, jetzt);
  if (!allein) return; /* zweiter Finger (Zoomen, Handballen): Ebene bleibt */
  const neu = imBereich(e.clientX, e.clientY) ? 'folie' : 'tafel'; if (neu !== ebene) { ebene = neu; S.sel = null; S.teil = null; T.renderOver(); }
  tinteAnpassen();
}, true);
/* ✋ Folie greifen: mit dem Finger auf eine leere Stelle der Folie (nicht auf ein Element) – die Folie samt Inhalt verschieben */
document.addEventListener('pointerdown', e => {
  if (!aktiv || mini || e.target.id !== 'cOver' || e.pointerType !== 'touch' || T.opts.finger === 'schreiben' || !imBereich(e.clientX, e.clientY)) return;
  if (kontakte.size > 1) return;
  const B = bereich(), f = basis() && basis().folie, wx = e.clientX - B.x, wy = e.clientY - B.y;
  if (f && f.items.some(it => (it.t === 'o' && T.hitObj(it, wx, wy, 8)) || (it.t === 's' && T.hitStroke && T.hitStroke(it, wx, wy, 14)))) return; /* Element: normal bedienen */
  e.stopImmediatePropagation(); e.preventDefault();
  const st = { x: e.clientX, y: e.clientY, B }, id = e.pointerId;
  const mv = ev => { if (ev.pointerId !== id) return; T.opts.folieLage = { ...st.B, x: st.B.x + ev.clientX - st.x, y: st.B.y + ev.clientY - st.y }; lage(); T.render(); T.renderOver(); };
  const ende = ev => { if (ev.pointerId !== id) return; removeEventListener('pointermove', mv, true); removeEventListener('pointerup', ende, true); removeEventListener('pointercancel', ende, true); kontakte.delete(id); T.opts.folieLage = bereich(); T.saveOpts && T.saveOpts(); };
  addEventListener('pointermove', mv, true); addEventListener('pointerup', ende, true); addEventListener('pointercancel', ende, true);
}, true);
T.folieAktiv = () => aktiv && !!S.board;
/* Zoomen (− 100 % ＋, Strg + Mausrad) gilt immer der Tafel darunter – die Folie schwebt */
{ const zoomAlt = T.zoomAt; if (zoomAlt) T.zoomAt = (...a) => { const alt = ebene; ebene = 'tafel'; try { return zoomAlt(...a); } finally { ebene = alt; T.render(); } }; }
/* Malen: Tafel · abgerundete Folie mit leichtem Randschatten · Inhalt der Folie (auf die Folie begrenzt) */
T.folieMalen = ctx => {
  const b = basis(), f = folieVon(b), vb = b.view, d = T.dpr, B = bereich(), r = 18;
  const rechteck = v => ({ x0: -v.x / v.z, y0: -v.y / v.z, x1: (T.W - T.ox - v.x) / v.z, y1: (T.H - v.y) / v.z });
  ctx.setTransform(d * vb.z, 0, 0, d * vb.z, d * (vb.x + T.ox), d * vb.y); T.paintPage(ctx, b, rechteck(vb), 1 / vb.z); /* die Tafel mit ihrer eigenen Ansicht */
  if (mini) return; /* eingeklappt: nur die Tafel */
  ctx.save(); ctx.setTransform(d, 0, 0, d, 0, 0);
  const pfad = () => { ctx.beginPath(); ctx.moveTo(B.x + r, B.y); ctx.arcTo(B.x + B.w, B.y, B.x + B.w, B.y + B.h, r); ctx.arcTo(B.x + B.w, B.y + B.h, B.x, B.y + B.h, r); ctx.arcTo(B.x, B.y + B.h, B.x, B.y, r); ctx.arcTo(B.x, B.y, B.x + B.w, B.y, r); ctx.closePath(); };
  const tafelDunkel = T.isDark(b);
  pfad(); ctx.shadowColor = tafelDunkel ? 'rgba(0,0,0,.85)' : 'rgba(0,0,0,.5)'; ctx.shadowBlur = 38; ctx.shadowOffsetY = 6; ctx.lineWidth = 6; ctx.strokeStyle = tafelDunkel ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.18)'; ctx.stroke(); /* deutlicher Schatten am Rand – auch bei ganz durchsichtiger Folie */
  ctx.shadowColor = 'transparent'; pfad(); ctx.globalAlpha = deck(); ctx.fillStyle = farbe()[3]; ctx.fill(); ctx.globalAlpha = 1;
  pfad(); ctx.lineWidth = 2.5; ctx.strokeStyle = tafelDunkel ? 'rgba(255,255,255,.55)' : 'rgba(71,85,105,.6)'; ctx.stroke(); /* klarer, aber ruhiger Rand */
  pfad(); ctx.clip();
  const fv = f.view; ctx.setTransform(d * fv.z, 0, 0, d * fv.z, d * (fv.x + T.ox), d * fv.y); /* immer die eigene Ansicht der Folie – nicht die der zuletzt angetippten Ebene (sonst springt sie, wenn die Tafel gezoomt ist) */
  T.paintPage(ctx, f, rechteck(fv), 1, { ohneBg: true });
  ctx.restore();
};
function bedienung() {
  leiste && leiste.remove(); ecken.forEach(e => e.remove()); ecken = [];
  const regler = h('input', { type: 'range', min: 0, max: 100, step: 5, value: Math.round(deck() * 100), class: 'fo-regler', title: 'Durchsichtigkeit der Folie: links = durchsichtig, rechts = deckend',
    oninput: e => { T.opts.folieDeck = +e.target.value; wert.textContent = e.target.value + ' %'; if (ebene === 'folie') tinteAnpassen(); T.render(); T.renderLive(); }, onchange: () => T.saveOpts && T.saveOpts() });
  const wert = h('span', { class: 'fo-wert' }, Math.round(deck() * 100) + ' %');
  const griff = h('div', { class: 'fo-griff', title: 'Ziehen: Folie verschieben (auch an der ganzen Leiste)' }, '⠿');
  leiste = h('div', { id: 'folieLeiste' }, griff, h('b', {}, '🗒 Folie'),
    ...FARBEN.map(([v, s, l]) => h('button', { class: 'fo-k' + (farbe()[0] === v ? ' on' : ''), title: 'Folie ' + l, onclick: () => { T.opts.folieFarbe = v; T.saveOpts && T.saveOpts(); bedienung(); if (ebene === 'folie') tinteAnpassen(); T.render(); } }, s)),
    h('span', { class: 'fo-trenn' }), h('span', { class: 'fo-lbl' }, '◐'), regler, wert, h('span', { class: 'fo-trenn' }),
    h('button', { class: 'fo-k fo-auf', title: 'Alles von der Folie auf die Tafel legen – an genau dieser Stelle, bleibt bearbeitbar', onclick: uebertragen }, '⤓ Auf Tafel'),
    h('button', { class: 'fo-k', title: 'Folie leeren', onclick: leeren }, '🧽'),
    h('button', { class: 'fo-k fo-mini', title: mini ? 'Folie wieder aufklappen' : 'Folie einklappen (minimieren) – Inhalt bleibt', onclick: () => minimieren(!mini) }, mini ? '▢' : '–'),
    h('button', { class: 'fo-k fo-zu', title: 'Folie ausblenden (Inhalt bleibt erhalten)', onclick: () => T.folie(false) }, '✕'));
  leiste.classList.toggle('mini', mini);
  /* an allen vier Ecken greifen: Größe ändern (die gegenüberliegende Ecke bleibt stehen) */
  ecken = ['lo', 'ro', 'lu', 'ru'].map(k => { const el = h('div', { class: 'folieEcke ' + k, title: 'Ziehen: Größe der Folie ändern' }); el.dataset.k = k;
    ziehen(el, (dx, dy, st) => { const B = st.B, li = k[0] === 'l', ob = k[1] === 'o';
      const w = Math.max(240, li ? B.w - dx : B.w + dx), hh = Math.max(160, ob ? B.h - dy : B.h + dy);
      const n = { x: li ? B.x + B.w - w : B.x, y: ob ? B.y + B.h - hh : B.y, w, h: hh };
      /* Inhalt bleibt auf dem Bildschirm stehen, auch wenn sich die linke/obere Kante bewegt */
      const sx = B.x - n.x - (st.sx || 0), sy = B.y - n.y - (st.sy || 0); st.sx = B.x - n.x; st.sy = B.y - n.y;
      const f = basis() && basis().folie; if (f && (sx || sy)) f.items = f.items.map(it => verschiebe(it, sx, sy));
      T.opts.folieLage = n; lage(); T.render(); T.renderOver(); });
    return el; });
  document.body.append(leiste, ...ecken); lage();
  for (const el of [leiste, ...ecken]) el.addEventListener('pointerdown', e => e.stopPropagation());
  ziehen(leiste, (dx, dy, st) => { T.opts.folieLage = { ...st.B, x: st.B.x + dx, y: st.B.y + dy }; lage(); T.render(); T.renderOver(); }); /* an der ganzen Leiste greifen: die Folie samt Inhalt verschieben */
}
const verschiebe = (it, dx, dy) => { const n = { ...it }; if (n.p) n.p = n.p.map(q => [q[0] + dx, q[1] + dy, ...q.slice(2)]); if (n.x != null && n.y != null) { n.x += dx; n.y += dy; } return n; };
function lage() { const B = bereich(); if (leiste) { leiste.style.left = (B.x + B.w / 2) + 'px'; leiste.style.top = Math.max(58, B.y - 22) + 'px'; } for (const el of ecken) { const k = el.dataset.k; el.style.left = (k[0] === 'l' ? B.x - 6 : B.x + B.w - 30) + 'px'; el.style.top = (k[1] === 'o' ? B.y - 6 : B.y + B.h - 30) + 'px'; } }
function ziehen(el, fn) {
  el.addEventListener('pointerdown', e => {
    if (el.id === 'folieLeiste' && e.target.closest && e.target.closest('button, input')) return; /* Knöpfe und Regler bleiben bedienbar */
    e.preventDefault(); e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch (x) {}
    const st = { x: e.clientX, y: e.clientY, B: bereich() };
    const mv = ev => fn(ev.clientX - st.x, ev.clientY - st.y, st);
    const ende = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', ende); el.removeEventListener('pointercancel', ende); T.opts.folieLage = bereich(); T.saveOpts && T.saveOpts(); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', ende); el.addEventListener('pointercancel', ende);
  });
}
/* ⤓ Auf die Tafel: die Elemente behalten ihre Lage (gleiche Koordinaten wie die Tafel) */
function uebertragen() {
  const b = basis(), f = b && b.folie; if (!f || !f.items.length) { T.toast && T.toast('Die Folie ist leer.'); return; }
  T.snap(); const ids = f.items.map(i => i.id);
  /* Folie → Tafel: gleiche Stelle auf dem Bildschirm, umgerechnet in die Ansicht der Tafel (Zoom, Verschiebung) */
  const fv = folieVon(b).view, vb = b.view, s = 1 / vb.z, M = (x, y) => [T.r1((x + fv.x - vb.x) * s), T.r1((y + fv.y - vb.y) * s)];
  const um = it => { const n = JSON.parse(JSON.stringify(it));
    if (n.p) n.p = n.p.map(q => { const [x, y] = M(q[0], q[1]); return q.length > 2 ? [x, y, ...q.slice(2)] : [x, y]; });
    if (n.x != null && n.y != null) { const [x, y] = M(n.x, n.y); n.x = x; n.y = y; if (n.w != null && n.t === 'o') n.w *= s; if (n.h != null) n.h *= s; }
    if (n.t === 's' && n.w) n.w *= s; if (n.fk) n.fk = n.fk.map(v => v * s); return n; };
  b.items = b.items.concat(f.items.map(um)); f.items = [];
  if (f.wkVerdeckt) b.wkVerdeckt = { ...(b.wkVerdeckt || {}), ...f.wkVerdeckt };
  T.folie(false); T.select && T.select(ids); T.changed && T.changed(); T.render(); T.renderOver();
  T.toast && T.toast('Auf die Tafel übertragen – an derselben Stelle, bleibt bearbeitbar.', 2600);
}
function leeren() { const b = basis(), f = b && b.folie; if (!f || !f.items.length) return; T.snap(); f.items = []; S.sel = null; T.changed && T.changed(); T.render(); T.renderOver(); }
const knopfAn = an => { const k = document.getElementById('navFolie'); if (k) k.classList.toggle('on', an); };
T.folie = an => {
  if (an == null) an = !aktiv; if (an && !S.board) return;
  aktiv = !!an; S.sel = null; S.teil = null; ebene = aktiv ? 'folie' : 'tafel'; mini = false; /* neu geöffnet: aufgeklappt */
  setTimeout(tinteAnpassen, 0); /* Stiftfarbe passend zur Folie bzw. wieder zur Tafel */
  if (aktiv) bedienung(); else { leiste && leiste.remove(); ecken.forEach(e => e.remove()); leiste = null; ecken = []; }
  document.body.classList.toggle('folieAn', aktiv); knopfAn(aktiv);
  T.render(); T.renderLive(); T.renderOver(); T.updateToolbar && T.updateToolbar();
  if (aktiv && T.toast) T.toast('🗒 Folie: auf der Folie geschrieben bleibt auf der Folie – daneben schreiben Sie ganz normal auf die Tafel. Mit dem Finger auf einer leeren Stelle greifen = Folie verschieben. ✕ blendet sie aus.', 3600);
};
/* Knopf 🗒 bei den Zoom-Knöpfen */
const nav = document.getElementById('nav');
if (nav) nav.append(h('button', { id: 'navFolie', title: 'Folie: Ebene über der Tafel – hier schreiben, ohne die Tafel zu verändern; „⤓ Auf Tafel“ überträgt', onclick: () => T.folie() }, '🗒'));
addEventListener('resize', () => { if (aktiv) { lage(); T.render(); } });
if (T.buildToolbar && document.getElementById('toolbar') && document.getElementById('toolbar').children.length) T.buildToolbar(); /* 🗒 ins Feld „Seite“ übernehmen */
/* andere Tafel geöffnet / Startseite: Folie aus */
const altOnPage = T.onPage; T.onPage = (...a) => { if (aktiv && !S.board) T.folie(false); return altOnPage && altOnPage(...a); };
})();
