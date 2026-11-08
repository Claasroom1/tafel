// Tafel-App – Eingabe: Stift, Finger, Maus (Pointer Events)
'use strict';
(function () {
const S = T.S, PI = Math.PI;
const ptrs = new Map();
let cvs;
const view = () => T.page().view;
const world = (sx, sy) => { const v = view(); return [(sx - T.ox - v.x) / v.z, (sy - v.y) / v.z]; };
const px = () => 1 / view().z;
const fx = marker => !marker && T.opts.stiftEffekt ? { fx: T.opts.stiftEffekt } : {}; // Stift-Effekt (Schatten, Graffiti, Neon) für neue Striche

T.initInput = () => {
  cvs = document.getElementById('cOver');
  cvs.style.pointerEvents = 'auto';
  cvs.addEventListener('pointerdown', down);
  cvs.addEventListener('pointermove', move);
  cvs.addEventListener('pointerup', up);
  cvs.addEventListener('pointercancel', cancel);
  cvs.addEventListener('lostpointercapture', e => { if (ptrs.has(e.pointerId)) cancel(e); });
  cvs.addEventListener('contextmenu', e => e.preventDefault());
  cvs.addEventListener('wheel', e => {
    e.preventDefault();
    // Mausrad über Lineal, Geodreieck oder Winkelmesser: Werkzeug vergrößern/verkleinern (um die Mausstelle)
    if (!e.ctrlKey && !e.shiftKey) {
      const [wx, wy] = world(e.clientX, e.clientY);
      for (let i = S.inst.length - 1; i >= 0; i--) {
        const I = S.inst[i], D = T.INSTR[I.kind]; if (!D) continue; // Zirkel: Radius wird gezogen
        const [lx, ly] = T.toLocal(I, wx, wy); if (!D.contains(lx, ly)) continue;
        T.setScaleAbout(I, (I.s || 1) * Math.exp(-e.deltaY * 0.0015), lx, ly); T.renderOver(); return;
      }
    }
    if (e.ctrlKey) T.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0025));
    else { const v = view(); v.x -= e.shiftKey ? e.deltaY : e.deltaX; v.y -= e.shiftKey ? 0 : e.deltaY; T.render(); T.renderOver(); }
  }, { passive: false });
  // Hover-Anzeige für den Radierer
  cvs.addEventListener('pointerleave', () => { if (T.overlay.cursor && !ptrs.size) { T.overlay.cursor = null; T.renderOver(); } });
};

// ✋ Handballen beim Schreiben (iPad mit Apple Pencil, auch Boards mit Stift): solange ein Stift schreibt – und kurz danach –
// zählen Berührungen der Hand nicht (sonst würde die aufliegende Hand die Tafel verschieben oder radieren)
const IPAD = /iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
T.istIpad = IPAD;
let stiftRuheBis = 0;
const stiftAktiv = () => [...ptrs.values()].some(q => q.type === 'pen') || performance.now() < stiftRuheBis;
function down(e) {
  if (!S.board) return;
  e.preventDefault();
  if (!T.teilung && T.opts.finger !== 'schreiben') {
    if (e.pointerType === 'pen') for (const q of ptrs.values()) if (q.type === 'touch' && q.h && q.h.kind !== 'idle') { if (q.h.cancel) q.h.cancel(q); q.h = idle(); } /* Hand lag schon auf: deren Verschieben abbrechen */
    if (e.pointerType === 'touch' && stiftAktiv()) { ptrs.set(e.pointerId, { id: e.pointerId, type: 'touch', sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), h: idle() }); return; }
  }
  T.closePops && T.closePops();
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  try { cvs.setPointerCapture(e.pointerId); } catch (x) {}
  T.onPointerInfo && T.onPointerInfo(e);
  const P = { id: e.pointerId, type: e.pointerType, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), h: null };
  ptrs.set(e.pointerId, P);
  const [wx, wy] = world(e.clientX, e.clientY);
  T.letzteZeigerArt = e.pointerType; if (e.pointerType === 'mouse') T.schreibmarke = [wx, wy]; // hier beginnt Lostippen mit der Tastatur

  // zweiter Finger → Geste (Zoomen/Verschieben bzw. Werkzeug drehen) – nicht bei geteilter Tafel: dort schreibt jeder Finger
  if (P.type === 'touch' && !T.teilung) {
    const others = [...ptrs.values()].filter(q => q !== P && q.type === 'touch');
    if (others.length === 1) {
      const A = others[0];
      if (A.h && A.h.kind === 'stroke' && performance.now() - A.t0 > 400) { P.h = idle(); return; } // es wird gerade geschrieben
      const greift = A.h && A.h.greift;
      if (greift && A.h.up) A.h.up(A); else if (A.h && A.h.cancel) A.h.cancel(); // gegriffenes Element: bisheriges Verschieben übernehmen, dann drehen/vergrößern
      const I = A.h && A.h.inst;
      const g = I && I.kind !== 'zirkel' ? twoFingerInst(I, A, P) : greift && S.sel ? zweiFingerSel(A, P) : pinch(A, P); // Element gegriffen: drehen/vergrößern, sonst Tafel zoomen
      A.h = g; P.h = g; return;
    }
    if (others.length > 1) { P.h = idle(); return; }
  }
  P.h = choose(P, e, wx, wy);
}
function move(e) {
  const P = ptrs.get(e.pointerId);
  if (!P) { hover(e); return; }
  if (e.pointerType === 'pen' && e.buttons === 0 && P.type === 'pen') { /* Pencil schwebt schon wieder über dem Display: Strich ist zu Ende (Schwebepunkt nicht mitnehmen) */
    if (P.h && P.h.kind === 'stroke') { ptrs.delete(e.pointerId); stiftRuheBis = performance.now() + (IPAD ? 900 : 500); P.h.up(P, null); } else up(e);
    return; }
  P.x = e.clientX; P.y = e.clientY;
  if (P.h && P.h.move) P.h.move(P, e);
}
function up(e) {
  const P = ptrs.get(e.pointerId); if (!P) return;
  P.x = e.clientX; P.y = e.clientY; ptrs.delete(e.pointerId);
  if (P.type === 'pen') stiftRuheBis = performance.now() + (IPAD ? 900 : 500); /* Hand hebt meist erst nach dem Stift ab */
  if (P.h && P.h.up) P.h.up(P, e);
}
function cancel(e) {
  const P = ptrs.get(e.pointerId); if (!P) return; ptrs.delete(e.pointerId);
  if (P.h && P.h.cancel) P.h.cancel(P); else if (P.h && P.h.up) P.h.up(P, e);
}
function hover(e) {
  if (S.tool === 'radierer' && e.pointerType !== 'touch') {
    const [x, y] = world(e.clientX, e.clientY); T.overlay.cursor = { x, y, r: S.groesse.radierer / 2 * px() }; T.renderOver();
  }
}
const idle = () => ({ kind: 'idle' });

function choose(P, e, wx, wy) {
  const isTouch = P.type === 'touch';
  // Radierer am Stift (Rückseite oder Taste)
  if (P.type === 'pen' && (e.button === 5 || (e.buttons & 32) || e.button === 2)) return erase(P, e);
  if (P.type === 'mouse' && (e.button === 1 || e.button === 2)) return pan(P);
  if (isTouch && T.opts.palm && !IPAD && e.width * e.height >= 45 * 45 && e.width > 0) return erase(P, e, T.opts.handRadierer || Math.max(e.width, e.height) * 1.2); // Handballen: feste Größe aus den Einstellungen oder so groß wie die Hand
  if (T.teilung) { // geteilte Tafel: jeder Bereich hat eigene Farbe, Stift und Finger schreiben gleichzeitig
    const b = T.teilBereich(P.sx); if (b.rad) return erase(P, e);
    return stroke(P, e, { c: b.farbe, w: b.w });
  }

  const treatAsPen = !isTouch || T.opts.finger === 'schreiben';
  // Einheitliche Bedienung: Stift schreibt (bedient keine Elemente), Finger bedient. Abschaltbar in den Einstellungen.
  const nurSchreiben = P.type === 'pen' && T.opts.stiftSchreibt !== false && ['stift', 'marker', 'radierer', 'form', 'text', 'stempel'].includes(S.tool);
  // Werkzeuge (Lineal usw.)
  const ih = T.instHit(wx, wy, px());
  if (treatAsPen && (S.tool === 'stift' || S.tool === 'marker')) {
    const ed = T.findEdge(wx, wy, 28 * px());
    if (ed && (!ih || ih.part === 'body')) return ruled(P, ed);
  }
  if (ih) return instAction(P, ih, wx, wy);
  if (nurSchreiben && S.sel) { const eh = eckHit(wx, wy); if (eh) return eh(P); } /* gewählte Form: Ecke auch mit dem Stift ziehen */
  if (nurSchreiben) { if (S.sel) { S.sel = null; T.renderOver(); } return werkzeug(P, e, wx, wy); }
  // Lernuhr: Zeiger anfassen und drehen – auch wenn die Uhr gerade ausgewählt ist
  const uhr = S.tool !== 'radierer' && topObjAt(wx, wy);
  if (uhr && uhr.k === 'uhr') { const g = uhrGriff(P, uhr, wx, wy); if (g) return g; }
  // Auswahl-Griffe
  const sh = selHit(wx, wy); if (sh) return sh(P);
  // 📐 Einzelnen Winkel antippen: Zahl → „?“ → leerer Bogen → Zahl
  const wo = S.tool !== 'radierer' && T.winkelAt && T.winkelAt(wx, wy, px());
  if (wo) return { up(Q) { if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 16) T.winkelUmschalten(wo); } };
  // Übungen: Kärtchen ziehen, Multiple-Choice-Kärtchen und Knöpfe antippen – mit Finger und Stift, egal welches Werkzeug
  const uo = topObjAt(wx, wy);
  if (uo && uo.k === 'kacheln' && S.tool !== 'auswahl' && S.tool !== 'radierer') return { up(Q) { if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 16) T.kachelAufdecken(uo, wx, wy); } }; // Bild-Puzzle
  if (uo && uo.k === 'loesung' && S.tool !== 'auswahl' && S.tool !== 'radierer') return { up(Q) { if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 16) T.loesungUmschalten(uo); } }; // Lösung antippen = auf-/zudecken
  if (uo && T.istSprachtext && T.istSprachtext(uo) && S.tool !== 'auswahl' && S.tool !== 'radierer') return { up(Q) { if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 16) T.sprachTipp(T.page().items.find(i => i.id === uo.id) || uo, wx, wy); } }; // Deutsch: Wörter antippen = einfärben
  if (uo && (uo.k === 'tabelle' || uo.k === 'vokabeln') && S.tool !== 'auswahl' && S.tool !== 'radierer' && T.tabVerdeckt) { // Zellenschatten: verdeckte Zelle antippen = Inhalt zeigen
    const zid = T.teilAt(uo, wx, wy);
    if (zid && T.tabVerdeckt(uo, zid)) return { up(Q) { if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 16) T.tabSchatten(T.page().items.find(i => i.id === uo.id) || uo, zid); } };
  }
  if (T.punkteModus && uo && uo.k === 'zettel') return { up(Q) { if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 16) T.zettelPunkt(uo.id); } }; // Abstimmung: antippen = 1 Punkt
  if (uo && uo.d && S.tool !== 'radierer' && (uo.k === 'uknopf' || (uo.k === 'ukarte' && (uo.d.mc || uo.d.ziehbar || uo.d.memo || uo.d.wende)))) return uebungGriff(P, uo, wx, wy);

  // Verbinden geht auch mit dem Finger (bzw. wenn das Board den Stift als Finger meldet) – sonst würde das Element verschoben
  if (S.tool === 'form' && /^verbinder/.test(S.form || '')) return verbinder(wx, wy);
  if (isTouch && T.opts.finger !== 'schreiben') {
    const o = topObjAt(wx, wy);
    if (o && o.fest) { // fixiert: Hand/Finger verschiebt nichts – nur antippen wählt aus (zum Lösen)
      if (T.opts.finger === 'radieren') return erase(P, e);
      return { kind: 'idle', up(Q) { if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 10 && performance.now() - Q.t0 < 600) select([o.id]); } };
    }
    // Standard: Finger greift das Element direkt – antippen = auswählen (Menü erscheint), ziehen = verschieben, zweiter Finger = drehen/vergrößern
    if (o) { const war = !!(S.sel && S.sel.ids.size === 1 && S.sel.ids.has(o.id)); if (war && T.selMenueZu) T.selMenueZu(); if (nurGriffeAn()) return tippen(P, o, wx, wy, war); if (!war) select([o.id]); return greif(moveSel(P, wx, wy, o, war)); }
    if (T.opts.finger === 'radieren') return erase(P, e);
    const st = itemAt(wx, wy); if (st && st.t === 's') { // Handschrift: schon gewählt → ziehen verschiebt; sonst antippen wählt das Wort, kurz halten + ziehen verschiebt
      if (S.sel && S.sel.ids.has(st.id) && !nurGriffeAn()) { T.selMenueZu && T.selMenueZu(); return greif(moveSel(P, wx, wy)); }
      return langDruck(P, st, wx, wy);
    }
    return pan(P);
  }
  if (S.tool !== 'auswahl' && S.sel) { S.sel = null; T.renderOver(); }
  return werkzeug(P, e, wx, wy);
}
// Finger auf einem Element (Standard „nur über Griffe“): antippen = auswählen (Griffe ✥ ⤡ ↻ und Menü erscheinen),
// lang drücken = ebenso (Kontextmenü), ziehen = Tafel verschieben – so verrutscht beim Navigieren nichts.
function tippen(P, o, wx, wy, war) {
  let pn = null; const t = setTimeout(() => { if (!pn) { select([o.id]); T.toast && T.toast('Ausgewählt – verschieben am ✥, Größe am ⤡, drehen am ↻', 1600); } }, 450);
  return {
    move(Q, ev) { if (!pn && Math.hypot(Q.x - Q.sx, Q.y - Q.sy) > 10) { clearTimeout(t); pn = pan(P); } if (pn) pn.move(Q, ev); },
    up(Q, ev) { clearTimeout(t); if (pn) return; if (!war) { select([o.id]); return; } moveSel(P, wx, wy, o, true).up(Q, ev); }, // schon gewählt: Feld antippen bzw. doppelt tippen = bearbeiten
    cancel() { clearTimeout(t); }
  };
}
// Nach dem Einfügen einer Form, eines Körpers oder Emojis: wieder der Stift – der nächste Stiftstrich schreibt; mit dem Finger greift man das Objekt
/* Am PC (Maus): danach „Auswahl“ und das neue Objekt ist markiert; am Board (Stift/Finger): Stift */
const zumStift = (P, id) => {
  const pc = P && P.type === 'mouse', ziel = pc ? 'auswahl' : 'stift';
  if (T.setTool) T.setTool(ziel); else S.tool = ziel;
  if (pc && id) T.select([id]);
};
function werkzeug(P, e, wx, wy) {
  switch (S.tool) {
    case 'stift': case 'marker': return stroke(P, e);
    case 'radierer': return erase(P, e);
    case 'auswahl': return selectDown(P, wx, wy);
    case 'hand': return pan(P);
    case 'form': return shape(P, wx, wy);
    case 'stempel': return { up(Q) { // Stempel setzen (Emoji als Text-Element, Größe unabhängig vom Zoom)
      if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) > 12 || !S.stempel) return;
      const d = { text: S.stempel, size: Math.round((S.stempelGr || 110) / view().z), c: '#1a1a1a', fett: false }, m = T.textMetrics(d);
      T.snap(); const neuI = T.addItem({ t: 'o', k: 'text', d, x: wx - m.w / 2, y: wy - m.h / 2, w: m.w, h: m.h, r: 0 });
      zumStift(P, neuI.id);
    } };
    case 'text': return { up(Q) { if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 12) { if (P.type === 'mouse') setTimeout(() => T.textInline(wx, wy), 0); else T.textDialog && T.textDialog(null, wx, wy); } } }; // Maus: direkt tippen, Board: Dialog
  }
  return idle();
}

// ---------- Freihand-Strich ----------
function stroke(P, e, ueber) { // ueber: { c, w } – eigene Farbe/Stärke (geteilte Tafel)
  const tool = !ueber && S.tool === 'marker' ? 'marker' : 'stift', hl = tool === 'marker';
  const laser = !ueber && !hl && S.stiftArt === 'laser';
  let live = { t: 's', m: hl ? 'hl' : laser ? 'line' : S.stiftArt === 'kalli' && !ueber ? 'kalli' : 'pen', c: ueber ? ueber.c : S.farbe[tool], w: ueber ? ueber.w : S.groesse[tool], p: [], ...(laser ? {} : fx(hl)) };
  let last = null, pr = 0.55, real = false, lastS = null, erkannt = false, ruhe = 0, anker = [P.x, P.y], winkelLabel = false, bewegtAm = performance.now(), bild = 0;
  const labelWeg = () => { if (winkelLabel) { winkelLabel = false; T.overlay.label = null; T.renderOver(); } };
  // Neu zeichnen höchstens einmal pro Bild (der Apple Pencil liefert sehr viele Punkte pro Sekunde)
  const zeichneBald = () => { if (!bild) bild = requestAnimationFrame(() => { bild = 0; T.renderLive(); }); };
  // Formerkennung: Stift nach dem Zeichnen kurz still halten → saubere Form
  const halten = () => {
    clearTimeout(ruhe); bewegtAm = performance.now(); if (laser || T.opts.formAus || !T.formErkennen) return;
    ruhe = setTimeout(erkenne, 650);
  };
  const erkenne = () => {
    if (erkannt || laser || T.opts.formAus || !T.formErkennen) return;
    {
      const [x, y] = world(P.x, P.y), lp = live.p[live.p.length - 1]; // geglättete Spur hinkt nach: echte Stiftposition als Endpunkt
      const neu = T.formErkennen(lp && Math.hypot(x - lp[0], y - lp[1]) > 0.8 ? { ...live, p: live.p.concat([[T.r1(x), T.r1(y), lp[2]]]) } : live, view().z); if (!neu) return;
      // 📐 Winkel auch bei erkannten Geraden/Dreiecken/Rechtecken aus dem Stift (wie bei den Formen)
      if ((S.winkelZeigen != null ? S.winkelZeigen : !!T.opts.neuWinkel) && neu.m === 'line' && (neu.p.length === 2 || (neu.closed && neu.p.length <= 4))) {
        neu.wk = 1;
        if (neu.p.length === 2) { const [a, b] = neu.p; T.overlay.label = { x: b[0], y: b[1], t: liveWinkel(a[0], a[1], b[0], b[1]) }; winkelLabel = true; T.renderOver(); }
      }
      T.lives.delete(live); live = neu; T.lives.add(live); erkannt = true; T.renderLive();
    }
  };
  const add = ev => {
    const [x, y] = world(ev.clientX, ev.clientY);
    let p = 0.5;
    if (!hl && T.opts.druck !== 'aus') {
      if (ev.pointerType === 'pen' && ev.pressure > 0 && (real || ev.pressure !== 0.5)) { real = true; pr += (ev.pressure - pr) * 0.5; }
      else if (T.opts.druck === 'auto') {
        const sp = lastS ? Math.hypot(ev.clientX - lastS[0], ev.clientY - lastS[1]) : 0;
        pr += (T.clamp(0.85 - sp / 45, 0.3, 0.85) - pr) * 0.25;
      }
      p = pr;
    }
    lastS = [ev.clientX, ev.clientY]; if (tempo !== 'normal') live.spitze = [x, y]; // echte Stiftposition: die Live-Linie reicht bis dorthin
    if (!last) { last = [x, y]; live.p.push([T.r1(x), T.r1(y), T.r2(p)]); return; }
    const k = T.clamp(T.opts.glatt, 0, 0.85);
    const nx = last[0] + (x - last[0]) * (1 - k), ny = last[1] + (y - last[1]) * (1 - k);
    if (Math.hypot(nx - last[0], ny - last[1]) * view().z < 1.1) return;
    last = [nx, ny]; live.p.push([T.r1(nx), T.r1(ny), T.r2(p)]);
  };
  const tempo = T.opts.stiftTempo || 'schnell'; // Einstellungen: normal (geglättet, wie früher), schnell (Spitze direkt am Stift), vorhersage (Spitze eilt etwas voraus)
  add(e);
  if (laser) { T.laserStart(live); return { kind: 'stroke', move(Q, ev) { for (const c of evs(ev)) add(c); T.renderLive(); }, up(Q) { T.laserEnde(live); if (P.type === 'pen') doppeltipp(P, Q, { id: null }); }, cancel() { T.laserEnde(live); } }; }
  T.lives.add(live); T.renderLive(); halten();
  return {
    kind: 'stroke',
    move(Q, ev) {
      if (erkannt) return; // erkannte Form bleibt, wie sie ist
      for (const c of evs(ev)) add(c);
      const vor = tempo === 'vorhersage' && ev.getPredictedEvents ? ev.getPredictedEvents() : []; // Vorhersage: die Spitze eilt ein kleines Stück voraus
      if (vor.length) { const q = vor[vor.length - 1]; live.spitze = world(q.clientX, q.clientY); }
      zeichneBald();
      if (Math.hypot(Q.x - anker[0], Q.y - anker[1]) > 6) { anker = [Q.x, Q.y]; halten(); }
    },
    up(Q, ev) {
      clearTimeout(ruhe); if (bild) { cancelAnimationFrame(bild); bild = 0; }
      if (!erkannt) { const [x, y] = ev ? world(ev.clientX, ev.clientY) : world(Q.x, Q.y), lp = live.p[live.p.length - 1]; /* ohne Ereignis: letzte echte Stiftposition */
        if (lp && Math.hypot(x - lp[0], y - lp[1]) > 0.8) live.p.push([T.r1(x), T.r1(y), lp[2]]); }
      T.lives.delete(live); delete live.spitze; T.renderLive(); labelWeg();
      if (live.p.length) { T.snap(); T.addItem(live); }
      if (P.type === 'pen' && !ueber && ev) doppeltipp(P, Q, live);
    },
    cancel(Q) {
      // iPad/Safari bricht einen still gehaltenen Pencil-Strich gern ab (Geste „lange drücken“): Strich behalten –
      // lag der Stift ruhig, gleich die saubere Form daraus machen (wie beim Halten)
      if (P.type === 'pen' && live.p.length) { if (performance.now() - bewegtAm > 300) erkenne(); this.up(Q || P, null); return; }
      clearTimeout(ruhe); if (bild) { cancelAnimationFrame(bild); bild = 0; } T.lives.delete(live); T.renderLive(); labelWeg();
    }
  };
}
const evs = ev => { const c = ev.getCoalescedEvents ? ev.getCoalescedEvents() : []; return c.length ? c : [ev]; };
// Stift-Doppeltipp (⚙ Einstellungen, Standard: aus): zwei sehr kurze Tipper an derselben Stelle wechseln das Werkzeug
// (z. B. zum Laser, Marker oder zu einer anderen Farbe) – nochmals doppelt tippen: zurück. Die beiden Punkte werden wieder entfernt.
let letzterTipp = null, vorDoppel = null;
// Hilfsmittel, die der Doppeltipp ein- und ausschaltet
const HILFEN = {
  lineal: () => T.toggleInstrument('lineal'), geodreieck: () => T.toggleInstrument('geodreieck'), winkelmesser: () => T.toggleInstrument('winkelmesser'),
  scheinwerfer: () => T.CR && T.CR.scheinwerfer && T.CR.scheinwerfer(), lupe: () => T.CR && T.CR.lupe && T.CR.lupe(), leselineal: () => T.CR && T.CR.leselineal && T.CR.leselineal(),
  vorhang: () => T.vorhang && T.vorhang(), schwarz: () => T.schwarz && T.schwarz()
};
const HILFE_NAME = { lineal: 'Lineal', geodreieck: 'Geodreieck', winkelmesser: 'Winkelmesser', scheinwerfer: 'Scheinwerfer', lupe: 'Lupe', leselineal: 'Leselineal', vorhang: 'Vorhang', schwarz: 'Tafel schwarz', laser: 'Laserpointer' };
// Auswahl für Einstellungen und Stift-Menü
T.DOPPEL_ZIELE = [['', 'aus'], ['zuletzt', '🔁 zuletzt benutztes Hilfsmittel'], ['radierer', '🧽 Radierer'], ['laser', '🔴 Laserpointer'], ['marker', '🖍 Textmarker'],
  ['geodreieck', '📐 Geodreieck'], ['lineal', '📏 Lineal'], ['winkelmesser', '◠ Winkelmesser'], ['scheinwerfer', '🔦 Scheinwerfer'], ['lupe', '🔍 Lupe'],
  ['leselineal', '📖 Leselineal'], ['vorhang', '🎭 Vorhang'], ['schwarz', '⬛ Tafel schwarz'], ['#d32f2f', '🔴 Farbe Rot'], ['#1565c0', '🔵 Farbe Blau'], ['#2e7d32', '🟢 Farbe Grün']];
// „Zuletzt benutzt“ merken: wer in der Stunde das Geodreieck oder den Laser nimmt, hat es danach auf dem Doppeltipp
T.merkeHilfe = id => { if (!id || (!HILFEN[id] && id !== 'laser') || T.opts.zuletztHilfe === id) return; T.opts.zuletztHilfe = id; T.saveOpts(); };
function doppeltipp(P, Q, it) {
  const art = T.opts.doppeltipp; if (!art) return;
  const jetzt = performance.now(), kurz = jetzt - Q.t0 < 220 && Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 6;
  if (!kurz) { letzterTipp = null; return; }
  const l = letzterTipp, abstand = T.opts.doppelTempo || 350;
  if (!l || jetzt - l.t > abstand || Math.hypot(Q.x - l.x, Q.y - l.y) > 18) { letzterTipp = { t: jetzt, x: Q.x, y: Q.y, id: it.id }; return; }
  letzterTipp = null;
  const pg = T.page(); pg.items = pg.items.filter(i => i.id !== it.id && i.id !== l.id); T.render(); // die beiden Tipp-Punkte weg
  const ziel = art === 'zuletzt' ? (T.opts.zuletztHilfe || 'laser') : art; // „zuletzt benutzt“: folgt dem, was man in dieser Stunde verwendet
  if (HILFEN[ziel]) { // Hilfsmittel (Geodreieck, Scheinwerfer …): doppelt tippen = ein, nochmals = aus
    HILFEN[ziel](); T.onInst && T.onInst(); T.renderOver(); T.ui && T.ui.updateToolbar && T.ui.updateToolbar();
    T.toast && T.toast('✌ ' + (HILFE_NAME[ziel] || ziel) + ' – nochmals doppelt tippen: wieder aus', 1400); return;
  }
  if (vorDoppel) { // zurück zum vorherigen Werkzeug
    S.tool = vorDoppel.tool; S.stiftArt = vorDoppel.stiftArt; S.farbe.stift = vorDoppel.farbe; vorDoppel = null;
  } else {
    vorDoppel = { tool: S.tool, stiftArt: S.stiftArt, farbe: S.farbe.stift };
    if (art === 'laser') { S.tool = 'stift'; S.stiftArt = 'laser'; }
    else if (art === 'marker') S.tool = 'marker';
    else if (art === 'radierer') S.tool = 'radierer'; /* 🧽 Radierer – nochmals doppelt tippen: zurück zum Stift */
    else { S.tool = 'stift'; if (S.stiftArt === 'laser') S.stiftArt = 'normal'; S.farbe.stift = art; } // eine Farbe
  }
  T.onInst && T.onInst(); T.renderOver(); T.updateToolbar && T.updateToolbar(); /* Werkzeugleiste zeigt das neue Werkzeug */
  T.toast && T.toast(vorDoppel ? (art === 'radierer' ? '✌ Radierer – nochmals doppelt tippen = zurück zum Stift' : '✌ Doppeltipp: Werkzeug gewechselt – nochmals doppelt tippen = zurück') : '✌ Zurück zum vorherigen Werkzeug', 1500);
}

// ---------- Am Lineal/Geodreieck entlang ----------
function ruled(P, ed) {
  const { I, e } = ed, tool = S.tool === 'marker' ? 'marker' : 'stift';
  const live = { t: 's', m: tool === 'marker' ? 'hl' : 'line', g: 1, c: S.farbe[tool], w: S.groesse[tool], p: [], ...fx(tool === 'marker') };
  const [wx, wy] = world(P.x, P.y);
  let t0 = T.edgeParam(I, e, wx, wy), tmin = t0, tmax = t0, tlast = t0;
  const arc = e.t === 'c';
  const upd = () => {
    if (!arc) { const a = T.edgePoint(I, e, tmin), b = T.edgePoint(I, e, tmax); live.p = [[T.r1(a[0]), T.r1(a[1]), .5], [T.r1(b[0]), T.r1(b[1]), .5]]; }
    const len = arc ? Math.abs(tmax - tmin) * 180 / PI : (tmax - tmin) * T.edgeLen(e) / T.CM;
    const pt = T.edgePoint(I, e, tlast);
    T.overlay.label = { x: pt[0], y: pt[1], t: arc ? Math.round(len) + '°' : T.zahl(len, 1) + ' cm' };
    T.live = live; T.renderLive(); T.renderOver();
  };
  if (arc) { const p = T.edgePoint(I, e, t0); live.p.push([T.r1(p[0]), T.r1(p[1]), .5]); }
  upd();
  return {
    move(Q) {
      const [x, y] = world(Q.x, Q.y), t = T.edgeParam(I, e, x, y);
      if (arc) {
        const step = Math.sign(t - tlast) * PI / 360;
        if (step) for (let a = tlast + step; Math.abs(t - a) >= PI / 360 * 0.99 && Math.sign(t - a) === Math.sign(step); a += step) { const p = T.edgePoint(I, e, a); live.p.push([T.r1(p[0]), T.r1(p[1]), .5]); }
        const p = T.edgePoint(I, e, t); live.p.push([T.r1(p[0]), T.r1(p[1]), .5]);
      }
      tlast = t; tmin = Math.min(tmin, t); tmax = Math.max(tmax, t); upd();
    },
    up() {
      T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver();
      const big = arc ? tmax - tmin > 0.004 : (tmax - tmin) * T.edgeLen(e) > 2;
      if (big) { T.snap(); T.addItem(live); }
    },
    cancel() { T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver(); }
  };
}

// ---------- Werkzeug bewegen/drehen, Zirkel ----------
function instAction(P, ih, wx, wy) {
  const I = ih.I;
  if (ih.part === 'close') return { up() { const i = S.inst.indexOf(I); if (i >= 0) S.inst.splice(i, 1); T.renderOver(); T.onInst && T.onInst(); } };
  if (ih.part === 'kreis') return { up() { zirkelArc(I, I.a, I.a + 2 * PI, true); } };
  if (ih.part === 'move') {
    const x0 = I.x, y0 = I.y;
    return { inst: I, move(Q) { const [x, y] = world(Q.x, Q.y); I.x = x0 + x - wx; I.y = y0 + y - wy; T.renderOver(); } };
  }
  if (ih.part === 'radius') {
    return { inst: I, move(Q) { const [x, y] = world(Q.x, Q.y); I.r = Math.max(8, Math.round(Math.hypot(x - I.x, y - I.y) / 2) * 2); I.a = Math.atan2(y - I.y, x - I.x); T.renderOver(); } };
  }
  if (ih.part === 'dreh') { // Zirkel drehen → Kreisbogen zeichnen
    const a0 = I.a, p0 = Math.atan2(wy - I.y, wx - I.x);
    let prev = p0, acc = 0;
    const live = { t: 's', m: 'line', g: 1, c: S.farbe.stift, w: S.groesse.stift, p: [], ...fx() };
    const pt = a => [T.r1(I.x + I.r * Math.cos(a)), T.r1(I.y + I.r * Math.sin(a)), .5];
    live.p.push(pt(a0)); T.live = live;
    return {
      inst: I,
      move(Q) {
        const [x, y] = world(Q.x, Q.y), cur = Math.atan2(y - I.y, x - I.x);
        let d = cur - prev; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI; prev = cur;
        const n = Math.ceil(Math.abs(d) / (PI / 180));
        for (let k = 1; k <= n; k++) live.p.push(pt(a0 + acc + d * k / n));
        acc += d; I.a = a0 + acc;
        T.overlay.label = { x: I.x, y: I.y, t: Math.round(Math.abs(acc) * 180 / PI) + '°' };
        T.renderLive(); T.renderOver();
      },
      up() { T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver(); if (Math.abs(acc) > PI / 180) { T.snap(); T.addItem(live); } },
      cancel() { T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver(); }
    };
  }
  const D = T.INSTR[I.kind];
  if (ih.part === 'knob') {
    const [lx, ly] = T.toLocal(I, wx, wy), off = Math.atan2(D.knob[1] - D.center[1], D.knob[0] - D.center[0]);
    void lx; void ly; let moved = false;
    return {
      inst: I,
      move(Q) {
        if (!moved && Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 8) return; moved = true;
        const [x, y] = world(Q.x, Q.y), [cx, cy] = T.toWorld(I, D.center[0], D.center[1]);
        T.setAngleAbout(I, T.snapAngle(Math.atan2(y - cy, x - cx) - off), D.center[0], D.center[1]); T.renderOver();
      },
      up() { if (!moved && T.angleDialog) T.angleDialog(I); }
    };
  }
  // Körper verschieben
  const x0 = I.x, y0 = I.y;
  return { inst: I, move(Q) { const [x, y] = world(Q.x, Q.y); I.x = x0 + x - wx; I.y = y0 + y - wy; T.renderOver(); } };
}
function zirkelArc(I, a0, a1) {
  const n = 180, p = [];
  for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; p.push([T.r1(I.x + I.r * Math.cos(a)), T.r1(I.y + I.r * Math.sin(a)), .5]); }
  T.snap(); T.addItem({ t: 's', m: 'line', g: 1, c: S.farbe.stift, w: S.groesse.stift, p, closed: true });
}

function twoFingerInst(I, A, B) {
  const ang = () => Math.atan2(B.y - A.y, B.x - A.x), mid = () => world((A.x + B.x) / 2, (A.y + B.y) / 2);
  const dist = () => Math.hypot(B.x - A.x, B.y - A.y) || 1;
  const g0 = ang(), a0 = I.a, s0 = I.s || 1, d0 = dist(), [mx, my] = mid(), L = T.toLocal(I, mx, my);
  return {
    kind: 'gesture', inst: I,
    move() { // zwei Finger: drehen, verschieben und vergrößern/verkleinern
      const [x, y] = mid();
      I.a = T.snapAngle(a0 + ang() - g0); let k = s0 * dist() / d0; if (Math.abs(k - 1) < 0.06) k = 1; I.s = T.clamp(k, 0.5, 4);
      const c = Math.cos(I.a), s = Math.sin(I.a);
      I.x = x - (L[0] * c - L[1] * s) * I.s; I.y = y - (L[0] * s + L[1] * c) * I.s; T.renderOver();
    },
    up(Q) { const other = Q === A ? B : A; other.h = idle(); }
  };
}
function pinch(A, B) {
  const v = view(), d0 = Math.hypot(B.x - A.x, B.y - A.y) || 1, z0 = v.z;
  const c0 = [(A.x + B.x) / 2 - T.ox, (A.y + B.y) / 2], w0 = [(c0[0] - v.x) / v.z, (c0[1] - v.y) / v.z];
  return {
    kind: 'gesture',
    move() {
      const d = Math.hypot(B.x - A.x, B.y - A.y), c = [(A.x + B.x) / 2 - T.ox, (A.y + B.y) / 2];
      v.z = T.clamp(z0 * d / d0, 0.03, 8); v.x = c[0] - w0[0] * v.z; v.y = c[1] - w0[1] * v.z;
      T.render(); T.renderOver(); T.onZoom && T.onZoom();
    },
    up(Q) { const other = Q === A ? B : A; other.h = pan(other); }
  };
}
function pan(P) {
  const v = view(), x0 = v.x, y0 = v.y, sx = P.x, sy = P.y;
  return { kind: 'pan', move(Q) { v.x = x0 + Q.x - sx; v.y = y0 + Q.y - sy; T.render(); T.renderOver(); } };
}

// ---------- Radierer ----------
function erase(P, e, diam) {
  let snapped = false, last = null;
  const r = () => (diam || S.groesse.radierer) / 2 * px();
  const at = (x, y) => {
    const res = T.eraseAt(T.page().items, x, y, r(), S.radModus === 'strich');
    if (res) { if (!snapped) { T.snap(); snapped = true; } T.page().items = res; T.render(); }
  };
  const go = Q => {
    const [x, y] = world(Q.x, Q.y);
    if (last) { const d = Math.hypot(x - last[0], y - last[1]), n = Math.ceil(d / (r() / 2)); for (let k = 1; k <= n; k++) at(last[0] + (x - last[0]) * k / n, last[1] + (y - last[1]) * k / n); }
    else at(x, y);
    last = [x, y]; T.overlay.cursor = { x, y, r: r() }; T.renderOver();
  };
  go(P);
  return { kind: 'erase', move: go, up(Q) { T.overlay.cursor = null; T.renderOver();
      if (P.type === 'pen' && S.tool === 'radierer' && !diam && Q) doppeltipp(P, Q, { id: null }); }, /* ✌ auch mit dem Radierer: doppelt tippen = zurück zum Stift */
    cancel() { T.overlay.cursor = null; T.renderOver(); } };
}

// ---------- Formen ----------
// 📐 Winkel schon beim Zeichnen: zur Linie, an deren Ende man ansetzt (oder die man trifft) – sonst zur Waagerechten
function liveWinkel(ax, ay, bx, by) {
  const tol = 16 * px(), linien = T.page().items.filter(i => i.t === 's' && i.m === 'line' && !i.an && i.p && i.p.length === 2 && !i.closed);
  const grad = (V, A, B) => { let d = Math.atan2(B[1] - V[1], B[0] - V[0]) - Math.atan2(A[1] - V[1], A[0] - V[0]); while (d <= -PI) d += 2 * PI; while (d > PI) d -= 2 * PI; return Math.round(Math.abs(d) * 180 / PI); };
  for (const l of linien) for (const j of [0, 1]) {
    const E = l.p[j], F = l.p[1 - j];
    if (Math.hypot(E[0] - ax, E[1] - ay) < tol) return grad([ax, ay], F, [bx, by]) + '°';
    if (Math.hypot(E[0] - bx, E[1] - by) < tol) return grad([bx, by], F, [ax, ay]) + '°';
  }
  let w = Math.round(Math.atan2(-(by - ay), bx - ax) * 180 / PI); if (w < 0) w += 360; if (w > 180) w -= 180;
  return w + '° zur Waagerechten';
}
function shape(P, ax, ay) {
  if (/^verbinder/.test(S.form)) return verbinder(ax, ay);
  if (/^3d:/.test(S.form)) return koerperZiehen(ax, ay, S.form.slice(3), P);
  const live = { t: 's', m: 'line', g: 1, c: S.farbe.stift, w: S.groesse.stift, p: [], arrow: S.form === 'pfeil', ...fx(),
    ...(S.linienArt && S.linienArt !== 'voll' ? { ls: S.linienArt } : {}), ...((S.winkelZeigen != null ? S.winkelZeigen : !!T.opts.neuWinkel) && !/kreis|ellipse/.test(S.form) ? { wk: 1 } : {}) }; /* Linienart, 📐 Winkel anzeigen */
  if (S.form === 'strecke') live.pkt = 'beide'; else if (S.form === 'strahl') live.pkt = 'anfang'; // Endpunkte markiert
  const build = (bx, by) => {
    const f = S.form, q = (x, y) => [T.r1(x), T.r1(y), .5];
    if (f === 'linie' || f === 'pfeil' || f === 'strecke' || f === 'strahl') {
      const d = Math.hypot(bx - ax, by - ay), a = Math.atan2(by - ay, bx - ax), s = T.snapAngle(a);
      if (Math.abs(s - a) < 4 * PI / 180 && Math.round(s * 180 / PI) % 45 === 0) { bx = ax + d * Math.cos(s); by = ay + d * Math.sin(s); }
      live.p = [q(ax, ay), q(bx, by)];
      T.overlay.label = { x: bx, y: by, t: T.zahl(d / T.CM, 1) + ' cm' + (S.winkelZeigen ? ' · ' + liveWinkel(ax, ay, bx, by) : '') };
    } else if (f === 'rechteck') { live.p = [q(ax, ay), q(bx, ay), q(bx, by), q(ax, by)]; live.closed = true; }
    else if (f === 'ellipse') {
      const cx = (ax + bx) / 2, cy = (ay + by) / 2, rx = Math.abs(bx - ax) / 2, ry = Math.abs(by - ay) / 2; live.p = [];
      for (let k = 0; k < 96; k++) { const a = k / 96 * 2 * PI; live.p.push(q(cx + rx * Math.cos(a), cy + ry * Math.sin(a))); }
      live.closed = true; live.fz = 'ellipse'; /* antippen › orangen Randpunkt ziehen = Winkel in der Ellipse */
    } else if (f === 'kreis') { // Mittelpunkt antippen, zum Radius ziehen
      const r = Math.hypot(bx - ax, by - ay); live.p = [];
      for (let k = 0; k < 120; k++) { const a = k / 120 * 2 * PI; live.p.push(q(ax + r * Math.cos(a), ay + r * Math.sin(a))); }
      live.closed = true; live.fz = 'kreis'; T.overlay.label = { x: bx, y: by, t: 'r = ' + T.zahl(r / T.CM, 1) + ' cm' };
    } else if (f === 'dreieck') { live.p = [q((ax + bx) / 2, ay), q(bx, by), q(ax, by)]; live.closed = true; }
    else if (f === 'trapez' || f === 'parallelogramm' || f === 'raute') { // A unten links, B unten rechts, C oben rechts, D oben links
      const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), y0 = Math.min(ay, by), y1 = Math.max(ay, by), w = x1 - x0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      live.p = f === 'trapez' ? [q(x0, y1), q(x1, y1), q(x1 - w * 0.2, y0), q(x0 + w * 0.3, y0)]
        : f === 'parallelogramm' ? [q(x0, y1), q(x1 - w * 0.25, y1), q(x1, y0), q(x0 + w * 0.25, y0)]
        : [q(cx, y1), q(x1, cy), q(cx, y0), q(x0, cy)];
      live.closed = true;
    }
    else if (f === 'kreiswinkel') { // Mittelpunkt antippen, zum Radius ziehen – startet mit 90° (¼ Kreis)
      const r = Math.hypot(bx - ax, by - ay); live.kw = { th: 90 }; delete live.wk;
      live.p = T.kreisWinkelPunkte([ax, ay], Math.max(r, 1), 0, 90).map(p => q(p[0], p[1]));
      T.overlay.label = { x: bx, y: by, t: 'r = ' + T.zahl(r / T.CM, 1) + ' cm' };
    }
    if (/^(rechteck|dreieck|trapez|parallelogramm|raute)$/.test(f)) live.fz = f;
    if (S.formFuell && (live.closed || live.kw)) live.fl = S.formFuell; else delete live.fl; /* 🪣 Füllung, 📐 Winkelfarbe */
    if (S.winkelFarbe) live.wc = S.winkelFarbe;
    for (const k of ['ms', 'mu', 'mf']) if ((S.masse || T.opts.neuMasse || {})[k]) live[k] = 1; else delete live[k]; /* 📏 Maße, Umfang, Fläche */ /* Figurart: beim Ziehen an den Ecken bleibt sie erhalten */
    T.live = live; T.renderLive(); T.renderOver();
  };
  build(ax, ay);
  return {
    move(Q) { const [x, y] = world(Q.x, Q.y); build(x, y); },
    up(Q) {
      const [x, y] = world(Q.x, Q.y); T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver();
      if (Math.hypot(x - ax, y - ay) > 4) { T.snap(); T.addItem(live); zumStift(P, live.id); }
    },
    cancel() { T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver(); }
  };
}

// 🧊 3D-Körper (Formen-Menü): Rahmen aufziehen – der Körper (Baustein) füllt ihn im richtigen Seitenverhältnis
function koerperZiehen(ax, ay, k, P0) {
  const B = T.BAUSTEINE[k]; if (!B) return { up() {} };
  const d = JSON.parse(JSON.stringify(B.def)), g = T.genObj(k, d, false);
  const rahmen = (bx, by) => {
    const dw = Math.abs(bx - ax), dh = Math.abs(by - ay), s = Math.max(dw / g.w, dh / g.h, 1e-6), w = g.w * s, h = g.h * s;
    return { x0: bx < ax ? ax - w : ax, y0: by < ay ? ay - h : ay, w, h };
  };
  const zeige = (bx, by) => { const r = rahmen(bx, by); T.overlay.band = { x0: r.x0, y0: r.y0, x1: r.x0 + r.w, y1: r.y0 + r.h }; T.renderOver(); };
  return {
    move(Q) { const [x, y] = world(Q.x, Q.y); zeige(x, y); },
    up(Q) {
      const [x, y] = world(Q.x, Q.y); T.overlay.band = null; T.renderOver();
      let r = rahmen(x, y); if (r.w < 30 && r.h < 30) { const s = 1 / T.page().view.z; r = { x0: ax, y0: ay, w: g.w * s, h: g.h * s }; } /* nur angetippt: Standardgröße */
      T.snap(); const it = T.addItem({ t: 'o', k, d, x: T.r1(r.x0), y: T.r1(r.y0), w: r.w, h: r.h, r: 0 }); zumStift(P0); T.select([it.id]);
    },
    cancel() { T.overlay.band = null; T.renderOver(); }
  };
}
// Verbindung (Concept-Map), haftet an beiden Elementen und wandert beim Verschieben mit.
// Am einfachsten: erstes Element antippen, dann das zweite. Ziehen von Element zu Element geht auch.
// Arten: 'verbinder' = Pfeil, 'verbinderLinie' = nur Linie, 'verbinderPunkte' = Linie mit Punkten an beiden Enden
let verbStart = null; // beim Antippen: erstes Ende
T.verbinderZuruecksetzen = () => { verbStart = null; T.overlay.ziel = null; T.renderOver(); };
// Was liegt hier zum Verbinden? Element (Zettel, Text, Baustein, Bild), handgeschriebenes Wort (ganze Gruppe) oder gezeichnete Form (auch innen antippen)
function verbZiel(x, y) {
  const o = topObjAt(x, y); if (o) return { ref: o.id, rect: o };
  const it = T.page().items, r = 14 * px(); let st = null;
  for (let i = it.length - 1; i >= 0 && !st; i--) if (it[i].t === 's' && !it[i].an && sichtbar(it[i]) && T.hitStroke(it[i], x, y, r)) st = it[i];
  for (let i = it.length - 1; i >= 0 && !st; i--) { const s = it[i]; if (s.t !== 's' || !s.closed || s.an || !sichtbar(s)) continue; const b = T.bbox(s); if (x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1) st = s; }
  if (!st) return null;
  const ids = st.closed ? [st.id] : wortGruppe(st);
  return { ref: ids, rect: T.verbinderEnde(T.page(), ids) };
}
const gleich = (a, b) => JSON.stringify([].concat(a).sort()) === JSON.stringify([].concat(b).sort());
function verbinder(ax, ay) {
  const A = verbZiel(ax, ay), q = (x, y) => [T.r1(x), T.r1(y), .5], art = S.form;
  const basis = { t: 's', m: 'line', g: 1, c: S.farbe.stift, w: Math.max(3, S.groesse.stift), arrow: art === 'verbinder', ...(art === 'verbinderPunkte' ? { pkt: 'beide' } : {}), ...(S.linienArt && S.linienArt !== 'voll' ? { ls: S.linienArt } : {}) };
  const live = { ...basis, p: [q(ax, ay), q(ax, ay)] };
  let gezogen = false;
  const verbinde = (a, b) => { const it = { ...basis, p: live.p, an: [a, b] }; const p = T.verbinderPunkte(T.page(), it); if (p) it.p = p; T.snap(); T.addItem(it); };
  const ende = () => { T.lives.delete(live); T.renderLive(); T.renderOver(); };
  return {
    move(Q) {
      if (!gezogen && Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 14) return; // kurzer Tipp: kein Ziehen
      if (!gezogen) { gezogen = true; verbStart = null; T.lives.add(live); }
      const [x, y] = world(Q.x, Q.y), B = verbZiel(x, y);
      live.p = [q(ax, ay), q(x, y)]; T.overlay.ziel = B && !(A && gleich(A.ref, B.ref)) ? B.rect : null; T.renderLive(); T.renderOver();
    },
    up(Q) {
      const [x, y] = world(Q.x, Q.y), B = verbZiel(x, y); ende();
      if (gezogen) {
        T.overlay.ziel = null;
        if (A && B && !gleich(A.ref, B.ref)) { verbinde(A.ref, B.ref); return; }
        T.snap(); T.addItem({ ...basis, p: [q(ax, ay), q(x, y)] }); // im Leeren: normale Linie bzw. Pfeil
        return;
      }
      // Antippen: erstes Ende merken (lila markiert), beim zweiten verbinden
      if (!A) { T.toast(verbStart ? 'Abgebrochen – zuerst etwas antippen: Zettel, Text, Bild, Handschrift oder Form.' : 'Zuerst etwas antippen (Zettel, Text, Bild, Handschrift oder Form), dann das zweite.', 2600); T.verbinderZuruecksetzen(); return; }
      if (verbStart && T.verbinderEnde(T.page(), verbStart) && !gleich(verbStart, A.ref)) { verbinde(verbStart, A.ref); T.verbinderZuruecksetzen(); return; }
      verbStart = A.ref; T.overlay.ziel = A.rect; T.renderOver(); T.toast('Jetzt das zweite antippen.', 2000);
    },
    cancel() { ende(); }
  };
}

// Lernuhr: Zeiger anfassen und drehen (Minuten rasten ein; über die 12 wird die Stunde mitgenommen). Sonst wie immer (verschieben usw.).
function uhrGriff(P, o, wx, wy) {
  if (o.d.zeiger === false) return null;
  const W = 10 * T.CM + 28, R = 5 * T.CM, k = o.w / W, cx = o.x + o.w / 2, cy = o.y + o.h / 2, a = -(o.r || 0) * PI / 180;
  const zy = W / 2 - (o.h / k) / 2; // Mitte des Zifferblatts relativ zur Elementmitte (Digitaluhr darunter macht das Element höher)
  const lokal = (x, y) => { const dx = (x - cx) / k, dy = (y - cy) / k, rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a); return [rx, ry - zy]; };
  const d0 = { ...T.BAUSTEINE.uhr.def, ...o.d }, mm = T.clamp(Math.round(d0.m), 0, 59), hw = ((Math.round(d0.h) % 12) + mm / 60) * PI / 6, mw = mm * PI / 30;
  const [lx, ly] = lokal(wx, wy), abst = (w, len) => T.distSeg(lx, ly, 0, 0, Math.sin(w) * len, -Math.cos(w) * len);
  // Sonne/Mond antippen: Tag ↔ Nacht (gleiche Uhrzeit, 12 Stunden weiter)
  if (d0.tag && Math.hypot(lx, ly - R * 0.33) < R * 0.2) return {
    up(Q) {
      if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) > 12) return;
      const cur = T.page().items.find(i => i.id === o.id); if (!cur) return;
      T.snap(); T.replaceItem({ ...cur, d: { ...cur.d, h: (Math.round({ ...T.BAUSTEINE.uhr.def, ...cur.d }.h) + 12) % 24 } }); T.renderOver();
    }
  };
  const dm = abst(mw, R * 0.78), dh = abst(hw, R * 0.5), grenze = R * 0.12 + 14 * px() / k;
  if (Math.min(dm, dh) > grenze) return null;
  const welcher = dm <= dh ? 'm' : 'h'; let snapped = false;
  return {
    move(Q) {
      const [x, y] = world(Q.x, Q.y), [qx, qy] = lokal(x, y); let w = Math.atan2(qx, -qy); if (w < 0) w += 2 * PI;
      const cur = T.page().items.find(i => i.id === o.id); if (!cur) return;
      const d = { ...T.BAUSTEINE.uhr.def, ...cur.d }; let h = Math.round(d.h), m = Math.round(d.m);
      if (welcher === 'm') {
        const nm = Math.round(w / (2 * PI) * 60) % 60;
        if (m > 45 && nm < 15) h = (h + 1) % 24; else if (m < 15 && nm > 45) h = (h + 23) % 24; // über die 12: Stunde mit
        m = nm;
      } else { // Stundenzeiger: wie eine echte Uhr weiterzählen – über die 12 geht es von 11 auf 12 (bzw. 23 auf 0), nicht zurück an den Tagesanfang
        const h12 = Math.floor(w / (2 * PI) * 12 + 1e-6) % 12; let schritt = h12 - (h % 12);
        if (schritt > 6) schritt -= 12; else if (schritt < -6) schritt += 12;
        h = ((h + schritt) % 24 + 24) % 24;
      }
      if (h === Math.round(d.h) && m === Math.round(d.m)) return;
      if (!snapped) { T.snap(); snapped = true; }
      T.replaceItem({ ...cur, d: { ...cur.d, h, m } }); T.renderOver();
    }
  };
}
function uebungGriff(P, o, wx, wy) {
  let bewegt = false; const x0 = o.x, y0 = o.y;
  return {
    move(Q) {
      if (!o.d.ziehbar || (!bewegt && Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 6)) return;
      if (!bewegt) { T.snap(); bewegt = true; const pg = T.page(); pg.items = pg.items.filter(i => i.id !== o.id).concat([o]); } // Kärtchen nach vorne holen
      const [x, y] = world(Q.x, Q.y); T.replaceItem({ ...o, x: x0 + x - wx, y: y0 + y - wy, d: o.d.status ? { ...o.d, status: null } : o.d });
    },
    up() {
      if (bewegt) { T.uebungEinrasten(T.page().items.find(i => i.id === o.id)); T.render(); return; }
      if (o.k === 'uknopf') T.uebungAktion(o);
      else if (o.d.memo) T.memoryTipp(T.page().items.find(i => i.id === o.id) || o);
      else if (o.d.wende) T.karteWenden(T.page().items.find(i => i.id === o.id) || o);
      else if (o.d.mc) { T.snap(); T.replaceItem({ ...o, d: { ...o.d, gewaehlt: !o.d.gewaehlt, status: null } }); }
    }
  };
}

// ---------- Auswahl ----------
const sichtbar = it => !(it.auf && T.aufZustand && T.aufZustand(T.page(), it) === false); // noch nicht aufgedeckte Teile lassen sich nicht antippen
function topObjAt(x, y) {
  const it = T.page().items;
  for (let i = it.length - 1; i >= 0; i--) if (it[i].t === 'o' && it[i].k === 'abdeckung' && sichtbar(it[i]) && T.hitObj(it[i], x, y)) return it[i];
  for (let i = it.length - 1; i >= 0; i--) if (it[i].t === 'o' && sichtbar(it[i]) && T.hitObj(it[i], x, y)) return it[i];
  return null;
}
function itemAt(x, y) {
  const it = T.page().items, r = 10 * px();
  for (let i = it.length - 1; i >= 0; i--) if (it[i].t === 's' && sichtbar(it[i]) && T.hitStroke(it[i], x, y, r)) return it[i];
  return topObjAt(x, y);
}
function select(ids) { S.sel = { ids: new Set(ids) }; S.teil = null; T.renderOver(); }
T.select = select;

// ◉ Ecken einer gewählten Form (Dreieck, Viereck, Strecke) anfassen und ziehen – die Winkel ändern sich mit.
// Trapez bleibt Trapez (Grund- und Deckseite parallel), Parallelogramm/Raute/Rechteck behalten ihre Eigenschaften.
T.eckForm = () => {
  if (!S.sel || S.sel.ids.size !== 1) return null;
  const it = T.page().items.find(i => S.sel.ids.has(i.id));
  return it && it.t === 's' && it.m === 'line' && !it.an && !it.fest && it.p && (it.kw ? it.p.length === 123 : istKreis(it) || (it.closed ? it.p.length >= 3 && it.p.length <= 4 : it.p.length === 2)) ? it : null;
};
const istKreis = it => it.closed && ((it.fz === 'kreis' && it.p.length === 120) || (it.fz === 'ellipse' && it.p.length === 96)); /* Kreis oder Ellipse */
const halbachsen = P => { const xs = P.map(q => q[0]), ys = P.map(q => q[1]); return [(Math.max(...xs) - Math.min(...xs)) / 2, (Math.max(...ys) - Math.min(...ys)) / 2]; };
const kreisMitte = it => [it.p.reduce((s, q) => s + q[0], 0) / it.p.length, it.p.reduce((s, q) => s + q[1], 0) / it.p.length];
/* Griffe: Kreiswinkel = B (Winkel, orange), M (verschieben), A (Größe/Drehung); Kreis = Mitte und ◔ Randpunkt (öffnet den Kreiswinkel) */
T.eckGriffe = it => it.kw ? it.p.slice(0, 3) : istKreis(it) ? [kreisMitte(it), it.p[0]] : it.p;
T.eckGriffFarbe = (it, i) => it.kw ? ['#ea580c', '#64748b', '#1e6fd9'][i] : istKreis(it) ? ['#64748b', '#ea580c'][i] : '#1e6fd9';
function eckHit(x, y) {
  const it = T.eckForm(); if (!it) return null;
  const r = 24 * px(); let best = -1, bd = r;
  T.eckGriffe(it).forEach((q, i) => { const d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = i; } });
  if (best < 0) return null;
  if (istKreis(it)) return P => best === 0 ? kreisSchieben(P, it) : kwZiehen(P, alsKreisWinkel(it), 0);
  return P => it.kw ? kwZiehen(P, it, best) : eckZiehen(P, it, best);
}
// Kreis → Kreiswinkel (gleiche id, Farbe, Füllung): Randpunkt ziehen öffnet den Winkel ab 0°
function alsKreisWinkel(it) {
  const M = kreisMitte(it), A = it.p[0], aA = Math.atan2(M[1] - A[1], A[0] - M[0]) * 180 / PI, el = it.fz === 'ellipse';
  const [rx, ry] = el ? halbachsen(it.p) : [Math.hypot(A[0] - M[0], A[1] - M[1])];
  const o = { ...it, kw: el ? { th: 0, el: 1 } : { th: 0 }, p: T.kreisWinkelPunkte(M, rx, el ? 0 : aA, 0, el ? ry : undefined).map(q => [T.r1(q[0]), T.r1(q[1]), 0.5]) }; delete o.closed; delete o.fz;
  return o;
}
function kreisSchieben(P0, o) {
  const [sx, sy] = world(P0.sx, P0.sy); let snapped = false;
  return { kind: 'move', greift: true,
    move(Q) { const [x, y] = world(Q.x, Q.y); if (!snapped) { T.snap(); snapped = true; }
      T.replaceItem({ ...o, p: o.p.map(q => [T.r1(q[0] + x - sx), T.r1(q[1] + y - sy), q[2]]) }); T.render(); T.renderOver(); },
    up() { if (snapped) T.changed && T.changed(); } };
}
// ◔ Kreiswinkel ziehen: B dreht den zweiten Radius (rastet bei Bruchteilen wie ¼, ⅓, ⅛ ein), A dreht/vergrößert den Kreis, M verschiebt ihn
function kwZiehen(P0, o, i) {
  const [B0, M0, A0] = o.p, el = !!o.kw.el, aA0 = Math.atan2(M0[1] - A0[1], A0[0] - M0[0]) * 180 / PI;
  const [r0, ry0] = el ? halbachsen(o.p.slice(2)) : [Math.hypot(A0[0] - M0[0], A0[1] - M0[1])]; /* Ellipse: Halbachsen bleiben, A dreht nur den ersten Schenkel */
  let th = o.kw.th, snapped = false;
  const [sx, sy] = world(P0.sx, P0.sy);
  return { kind: 'move', greift: true,
    move(Q) {
      const [x, y] = world(Q.x, Q.y);
      if (!snapped) { T.snap(); snapped = true; }
      let M = [M0[0], M0[1]], r = r0, aA = aA0;
      if (i === 1) M = [M0[0] + x - sx, M0[1] + y - sy];
      else if (i === 2) { if (!el) r = Math.max(10, Math.hypot(x - M0[0], y - M0[1])); aA = Math.atan2(M0[1] - y, x - M0[0]) * 180 / PI; }
      else {
        let g = Math.atan2(M0[1] - y, x - M0[0]) * 180 / PI - aA0; g = ((g % 360) + 360) % 360;
        if (th > 270 && g < 90) g = 360; else if (th < 90 && g > 270) g = 0; /* über die Startlinie hinaus: bei 0° bzw. 360° anhalten */
        const m = [0, 30, 36, 45, 60, 72, 90, 120, 135, 144, 180, 216, 225, 240, 270, 288, 300, 315, 360].find(w => Math.abs(w - g) < 2.5);
        th = m != null ? m : Math.round(g);
      }
      T.replaceItem({ ...o, kw: { ...o.kw, th }, p: T.kreisWinkelPunkte(M, r, aA, th, el ? ry0 : undefined).map(q => [T.r1(q[0]), T.r1(q[1]), 0.5]) });
      T.overlay.label = i === 0 ? { x, y, t: T.kreisWinkelText(th, el) } : i === 2 && !el ? { x, y, t: 'r = ' + T.zahl(r / T.CM, 1) + ' cm' } : null;
      T.render(); T.renderOver();
    },
    up() { T.overlay.label = null; T.renderOver(); if (snapped) T.changed && T.changed(); },
    cancel() { T.overlay.label = null; T.renderOver(); }
  };
}
function eckPunkte(o, i, N) {
  const P = o.p.map(q => [q[0], q[1]]), n = P.length, j = (i + 2) % n, fz = n === 4 ? o.fz : null;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], dot = (a, b) => a[0] * b[0] + a[1] * b[1], norm = a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
  if (fz === 'rechteck') { // gegenüberliegende Ecke bleibt, Seiten behalten ihre Richtung
    const u = norm(sub(P[1], P[0])), v = [-u[1], u[0]], d = sub(N, P[j]), a = dot(d, u), b = dot(d, v), k = (j + 1) % n, m = (j + 3) % n;
    const ku = Math.abs(dot(sub(P[k], P[j]), u)) > Math.abs(dot(sub(P[k], P[j]), v));
    P[i] = [P[j][0] + a * u[0] + b * v[0], P[j][1] + a * u[1] + b * v[1]];
    P[ku ? k : m] = [P[j][0] + a * u[0], P[j][1] + a * u[1]]; P[ku ? m : k] = [P[j][0] + b * v[0], P[j][1] + b * v[1]];
  } else if (fz === 'parallelogramm') { // Nachbarecken bleiben, die gegenüberliegende Ecke wandert mit
    const A = P[(i + n - 1) % n], C = P[(i + 1) % n]; P[i] = N; P[j] = [A[0] + C[0] - N[0], A[1] + C[1] - N[1]];
  } else if (fz === 'raute') { // gegenüberliegende Ecke bleibt; die andere Diagonale steht senkrecht in der Mitte, Länge bleibt
    const M = [(N[0] + P[j][0]) / 2, (N[1] + P[j][1]) / 2], e = norm([-(N[1] - P[j][1]), N[0] - P[j][0]]), k = (i + 1) % n, m = (i + 3) % n;
    const hl = Math.hypot(P[k][0] - P[m][0], P[k][1] - P[m][1]) / 2, s = dot(sub(P[k], M), e) >= 0 ? 1 : -1;
    P[i] = N; P[k] = [M[0] + s * hl * e[0], M[1] + s * hl * e[1]]; P[m] = [M[0] - s * hl * e[0], M[1] - s * hl * e[1]];
  } else if (fz === 'trapez') { // AB ∥ CD: die Partnerecke derselben Seite rückt senkrecht nach, damit die Seiten parallel bleiben
    const k = i ^ 1, g = i < 2 ? [P[2], P[3]] : [P[0], P[1]], u = norm(sub(g[1], g[0])), nv = [-u[1], u[0]], t = dot(sub(P[k], N), nv);
    P[i] = N; P[k] = [P[k][0] - t * nv[0], P[k][1] - t * nv[1]];
  } else P[i] = N; // Dreieck, Strecke, freie Form
  return P;
}
function eckZiehen(P0, o, i) {
  let snapped = false;
  return { kind: 'move', greift: true,
    move(Q) {
      const [x, y] = world(Q.x, Q.y), N = [x, y];
      if (!snapped) { T.snap(); snapped = true; }
      const neu = eckPunkte(o, i, N);
      T.replaceItem({ ...o, p: neu.map((q, k) => [T.r1(q[0]), T.r1(q[1]), o.p[k][2] != null ? o.p[k][2] : 0.5]) });
      T.render(); T.renderOver();
    },
    up() { if (snapped) T.changed && T.changed(); }
  };
}
function selHit(x, y) {
  const sb = T.selBounds(); if (!sb) return null;
  const eh = eckHit(x, y); if (eh) return eh;
  const p = px(), hr = 26 * p;
  if (sb.obj) {
    const o = sb.obj, h = T.objHandles(o, p);
    if (o.fest) return T.hitObj(o, x, y) ? P => moveSel(P, x, y, o, true) : null; // fixiert: nur antippen, nicht ziehen/drehen
    const kg = T.koerperGriffAt && T.koerperGriffAt(o, x, y, 22 * p); /* 🧊 3D-Körper: orange Griffe ändern die Maße */
    if (kg) return () => { const z = T.koerperGriffZiehen(o, kg); return { kind: 'move', greift: true, move(Q) { const [wx, wy] = world(Q.x, Q.y); z.move(wx, wy); }, up() { z.up(); }, cancel() { z.up(); } }; };
    if (Math.hypot(x - h.scale[0], y - h.scale[1]) <= hr) return P => scaleObj(P, o);
    if (Math.hypot(x - h.rot[0], y - h.rot[1]) <= hr) return P => rotObj(P, o);
    if (Math.hypot(x - h.move[0], y - h.move[1]) <= hr) return P => greif(moveSel(P, x, y, o, true)); // ✥ verschieben
    if (T.hitObj(o, x, y)) return P => { T.selMenueZu && T.selMenueZu(); return fingerNurGriffe(P) ? tippen(P, o, x, y, true) : greif(moveSel(P, x, y, o, true)); };
  } else {
    const fest = T.page().items.some(it => it.fest && S.sel.ids.has(it.id)), h = T.groupHandles(sb, p);
    if (!fest && Math.hypot(x - h.scale[0], y - h.scale[1]) <= hr) return P => scaleGroup(P, sb);
    if (!fest && Math.hypot(x - h.rot[0], y - h.rot[1]) <= hr) return P => rotGroup(P, sb);
    if (!fest && Math.hypot(x - h.move[0], y - h.move[1]) <= hr) return P => greif(moveSel(P, x, y)); // ✥ verschieben
    if (x >= sb.x0 && x <= sb.x1 && y >= sb.y0 && y <= sb.y1) return P => { T.selMenueZu && T.selMenueZu(); return fingerNurGriffe(P) ? pan(P) : greif(moveSel(P, x, y)); };
  }
  return null;
}
// „nur über Griffe“ ist jetzt eine Wahl in den Einstellungen (Standard aus): dann verschiebt ein Finger auf dem Element die Tafel
const nurGriffeAn = () => T.opts.nurGriffeAn === true;
const fingerNurGriffe = P => P.type === 'touch' && nurGriffeAn() && T.opts.finger !== 'schreiben';
// Markiert einen Handler als „hält die Auswahl“ – kommt ein zweiter Finger dazu, wird gedreht/vergrößert statt gezoomt
const greif = hd => { hd.greift = true; return hd; };
// Zwei Finger auf der Auswahl: drehen (in 15°-Schritten magnetisch), vergrößern/verkleinern und verschieben – um die Mitte zwischen den Fingern
function zweiFingerSel(A, B) {
  const pg = T.page(), orig = new Map(pg.items.filter(it => S.sel.ids.has(it.id) && !it.fest).map(it => [it.id, it]));
  if (!orig.size) return pinch(A, B);
  const ang = () => Math.atan2(B.y - A.y, B.x - A.x), dist = () => Math.hypot(B.x - A.x, B.y - A.y) || 1, mid = () => world((A.x + B.x) / 2, (A.y + B.y) / 2);
  const g0 = ang(), d0 = dist(), m0 = mid(); let snapped = false;
  const einzeln = orig.size === 1 && [...orig.values()][0].t === 'o', min = 30 / Math.max(1, ...[...orig.values()].map(it => it.t === 'o' ? Math.min(it.w, it.h) : 60));
  return {
    kind: 'gesture',
    move() {
      if (!snapped) { T.snap(); snapped = true; }
      let f = dist() / d0; if (Math.abs(f - 1) < 0.04) f = 1; f = Math.max(f, min);
      let deg = (ang() - g0) * 180 / PI; const m15 = Math.round(deg / 15) * 15; deg = Math.abs(deg - m15) < 4 ? m15 : Math.round(deg);
      const [mx, my] = mid(), a = deg * PI / 180, co = Math.cos(a), si = Math.sin(a);
      const tr = (x, y) => { const dx = (x - m0[0]) * f, dy = (y - m0[1]) * f; return [mx + dx * co - dy * si, my + dx * si + dy * co]; };
      T.page().items = T.page().items.map(it => {
        const o = orig.get(it.id); if (!o) return it;
        if (o.t === 's') return { ...o, w: o.w * f, p: o.p.map(q => { const [x, y] = tr(q[0], q[1]); return [T.r1(x), T.r1(y), q[2]]; }) };
        const [cx, cy] = tr(o.x + o.w / 2, o.y + o.h / 2), w = o.w * f, h = o.h * f, r = ((Math.round((o.r || 0) + deg) % 360) + 360) % 360;
        return { ...o, x: T.r1(cx - w / 2), y: T.r1(cy - h / 2), w, h, r };
      });
      T.overlay.rotDeg = einzeln && deg ? ((Math.round(([...orig.values()][0].r || 0) + deg) % 360) + 360) % 360 : null;
      T.render(); T.renderOver();
    },
    up(Q) { T.overlay.rotDeg = null; T.renderOver(); const other = Q === A ? B : A; other.h = idle(); }
  };
}
// Handschrift: nahe Striche (Wort/Zeile) gehören zusammen
function wortGruppe(st) {
  if (st.grp) return T.page().items.filter(i => i.grp === st.grp).map(i => i.id); // selbst verbundene Gruppe („🔗 Verbinden“)
  if (st.g) return [st.id]; // Formen (Linie, Strecke, Dreieck …) einzeln greifen – nicht mit Nachbarn zusammenfassen
  const alle = T.page().items.filter(i => i.t === 's' && !i.an && !i.g && !i.grp && sichtbar(i) && !!i.fest === !!st.fest), m = 14 * px(), drin = new Set([st]); /* Verbindungslinien und Formen gehören nicht zum Wort */
  let b = T.bbox(st), neu = true;
  const nah = c => b.x0 - m <= c.x1 && c.x0 <= b.x1 + m && b.y0 - m <= c.y1 && c.y0 <= b.y1 + m;
  while (neu) {
    neu = false;
    for (const s of alle) {
      if (drin.has(s)) continue; const c = T.bbox(s);
      if (nah(c)) { drin.add(s); b = { x0: Math.min(b.x0, c.x0), y0: Math.min(b.y0, c.y0), x1: Math.max(b.x1, c.x1), y1: Math.max(b.y1, c.y1) }; neu = true; }
    }
  }
  return [...drin].map(s => s.id);
}
// Finger auf Handschrift: ½ s halten wählt das Wort und verschiebt es; sofort wischen verschiebt wie bisher die Tafel
// Handschrift mit dem Finger: kurz antippen = Wort auswählen (Menü erscheint), ½ s halten = auswählen und gleich ziehen,
// sofort wischen = Tafel verschieben (so bleibt eine vollgeschriebene Tafel verschiebbar)
function langDruck(P, st, wx, wy) {
  let aktiv = null; const pn = pan(P), h = { kind: 'ink' };
  const t = setTimeout(() => {
    if (aktiv) return; select(wortGruppe(st)); aktiv = nurGriffeAn() ? idle() : moveSel(P, wx, wy); h.greift = !nurGriffeAn(); // zweiter Finger dreht/vergrößert dann
    T.toast && T.toast(st.fest ? 'Fixiert – zum Lösen 🔓 antippen' : (nurGriffeAn() ? 'Handschrift gewählt – verschieben am ✥' : 'Handschrift gewählt – jetzt ziehen (zwei Finger: drehen/vergrößern)'), 1400);
  }, 450);
  return Object.assign(h, {
    move(Q, ev) { if (aktiv) return aktiv.move(Q, ev); if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) > 10) { clearTimeout(t); aktiv = pn; pn.move(Q, ev); } },
    up(Q, ev) { clearTimeout(t); if (aktiv && aktiv.up) return aktiv.up(Q, ev); if (!aktiv && Math.hypot(Q.x - Q.sx, Q.y - Q.sy) <= 10) select(wortGruppe(st)); }, // kurz angetippt: Wort auswählen
    cancel(Q) { clearTimeout(t); if (aktiv && aktiv.cancel) aktiv.cancel(Q); }
  });
}
// Gruppe (auch mit Handschrift) vergrößern/verkleinern und drehen – um die Mitte der Auswahl
function gruppeUmformen(sb, fn) {
  const pg = T.page(), orig = new Map(pg.items.filter(it => S.sel.ids.has(it.id)).map(it => [it.id, it]));
  const c = [(sb.x0 + sb.x1) / 2, (sb.y0 + sb.y1) / 2]; let snapped = false;
  return (...a) => {
    if (!snapped) { T.snap(); snapped = true; }
    const f = fn(c, ...a); T.page().items = T.page().items.map(it => orig.has(it.id) ? f(orig.get(it.id)) : it);
    T.render(); T.renderOver();
  };
}
function scaleGroup(P, sb) {
  const c = [(sb.x0 + sb.x1) / 2, (sb.y0 + sb.y1) / 2], [wx, wy] = world(P.x, P.y), d0 = Math.hypot(wx - c[0], wy - c[1]) || 1;
  const min = 30 / Math.max(1, Math.min(sb.x1 - sb.x0, sb.y1 - sb.y0));
  const setze = gruppeUmformen(sb, (c, f) => it => {
    const s = (x, y) => [T.r1(c[0] + (x - c[0]) * f), T.r1(c[1] + (y - c[1]) * f)];
    if (it.t === 's') return { ...it, w: it.w * f, p: it.p.map(q => [...s(q[0], q[1]), q[2]]) };
    const [x, y] = s(it.x, it.y); return { ...it, x, y, w: it.w * f, h: it.h * f };
  });
  return { move(Q) { const [x, y] = world(Q.x, Q.y); setze(Math.max(Math.hypot(x - c[0], y - c[1]) / d0, min)); } };
}
const drehen = (c, deg) => it => {
  const a = deg * PI / 180, co = Math.cos(a), si = Math.sin(a);
  const d = (x, y) => [c[0] + (x - c[0]) * co - (y - c[1]) * si, c[1] + (x - c[0]) * si + (y - c[1]) * co];
  if (it.t === 's') return { ...it, p: it.p.map(q => { const [x, y] = d(q[0], q[1]); return [T.r1(x), T.r1(y), q[2]]; }) };
  const [mx, my] = d(it.x + it.w / 2, it.y + it.h / 2), r = ((Math.round((it.r || 0) + deg) % 360) + 360) % 360;
  return { ...it, x: T.r1(mx - it.w / 2), y: T.r1(my - it.h / 2), r };
};
function rotGroup(P, sb) {
  const c = [(sb.x0 + sb.x1) / 2, (sb.y0 + sb.y1) / 2];
  const setze = gruppeUmformen(sb, drehen);
  return {
    move(Q) {
      const [x, y] = world(Q.x, Q.y); let deg = Math.round(T.snapAngle(Math.atan2(y - c[1], x - c[0]) + PI / 2) * 180 / PI);
      deg = ((deg % 360) + 360) % 360; T.overlay.rotDeg = deg; setze(deg);
    },
    up() { T.overlay.rotDeg = null; T.renderOver(); }
  };
}
let lastTap = { id: null, t: 0 };
function moveSel(P, wx, wy, single, warSchon) {
  const fest = T.page().items.some(it => it.fest && S.sel.ids.has(it.id)); // fixierte Bilder/Bausteine verrutschen nicht
  S.drag = fest ? null : { dx: 0, dy: 0 }; let moved = false;
  // Handschrift, die auf einem Baustein steht, wandert beim Verschieben mit
  S.dragMit = null;
  if (single && single.k !== 'abdeckung' && single.k !== 'text') {
    const ob = T.bbox(single), mit = T.page().items.filter(it => { if (it.t !== 's' || S.sel.ids.has(it.id)) return false; const b = T.bbox(it); return b.x0 >= ob.x0 - 4 && b.x1 <= ob.x1 + 4 && b.y0 >= ob.y0 - 4 && b.y1 <= ob.y1 + 4; });
    if (mit.length) S.dragMit = new Set(mit.map(it => it.id));
  }
  const mitDabei = it => S.sel.ids.has(it.id) || (S.dragMit && S.dragMit.has(it.id));
  return {
    move(Q) {
      if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) > 4) moved = true;
      if (fest) return;
      const [x, y] = world(Q.x, Q.y); S.drag.dx = x - wx; S.drag.dy = y - wy;
      if (single && T.puzzleMagnet) { const m = T.puzzleMagnet(single, S.drag.dx, S.drag.dy); if (m) { S.drag.dx = m[0]; S.drag.dy = m[1]; } } /* 🧩 Teil wird in die Lücke gezogen */
      T.render(); T.renderOver();
    },
    up() {
      const { dx, dy } = S.drag || { dx: 0, dy: 0 }; S.drag = null;
      if (moved && (dx || dy)) {
        T.snap(); const pg = T.page(), g = T.gridPx(pg);
        const rast = (it, x, y) => { const k = g || (it.d && it.d.karo); return k && it.k === 'text' && it.d.karo ? [Math.round(x / k) * k, Math.round(y / k) * k] : [x, y]; }; // Kästchenschrift rastet ein
        pg.items = pg.items.map(it => { if (!mitDabei(it)) return it;
          if (it.t === 's') return { ...it, p: it.p.map(q => [T.r1(q[0] + dx), T.r1(q[1] + dy), q[2]]) };
          const [x, y] = rast(it, it.x + dx, it.y + dy); return { ...it, x, y }; });
        if (T.nachVerschieben) T.nachVerschieben([...S.sel.ids]); /* 🧩 Puzzleteile rasten ein */
      } else if (single) {
        const now = performance.now();
        if (lastTap.id === single.id && now - lastTap.t < 450) T.editObj && T.editObj(single);
        else if (warSchon && T.teilAt) { // bereits gewählter Baustein: einzelnes Feld antippen → Feld-Menü
          const id = T.teilAt(single, wx, wy);
          S.teil = id != null && !(S.teil && S.teil.oid === single.id && S.teil.id === id) ? { oid: single.id, id } : null;
          T.onSelChange && T.onSelChange();
        }
        lastTap = { id: single.id, t: now };
      }
      S.dragMit = null; T.render(); T.renderOver();
    },
    cancel() { S.drag = null; S.dragMit = null; T.render(); T.renderOver(); }
  };
}
function scaleObj(P, o) {
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2, [wx, wy] = world(P.x, P.y), d0 = Math.hypot(wx - cx, wy - cy) || 1;
  let snapped = false;
  return {
    move(Q) {
      const [x, y] = world(Q.x, Q.y), f = Math.max(Math.hypot(x - cx, y - cy) / d0, 30 / Math.min(o.w, o.h));
      if (!snapped) { T.snap(); snapped = true; }
      const w = o.w * f, h = o.h * f; T.replaceItem({ ...o, x: cx - w / 2, y: cy - h / 2, w, h }); T.renderOver();
    }
  };
}
function rotObj(P, o) {
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2; let snapped = false;
  return {
    move(Q) {
      const [x, y] = world(Q.x, Q.y); if (!snapped) { T.snap(); snapped = true; }
      let d = Math.round(T.snapAngle(Math.atan2(y - cy, x - cx) + PI / 2) * 180 / PI); d = ((d % 360) + 360) % 360;
      T.overlay.rotDeg = d; T.replaceItem({ ...o, r: d }); T.renderOver();
    },
    up() { T.overlay.rotDeg = null; T.renderOver(); }
  };
}
function selectDown(P, wx, wy) {
  const hit = itemAt(wx, wy);
  if (hit) { const war = !!(S.sel && S.sel.ids.has(hit.id)); if (!war) select(hit.t === 's' ? wortGruppe(hit) : hit.grp ? T.page().items.filter(i => i.grp === hit.grp).map(i => i.id) : [hit.id]); return moveSel(P, wx, wy, hit.t === 'o' && !hit.grp ? hit : null, war); }
  S.sel = null; T.overlay.band = { x0: wx, y0: wy, x1: wx, y1: wy }; T.renderOver();
  return {
    move(Q) { const [x, y] = world(Q.x, Q.y); T.overlay.band = { x0: Math.min(wx, x), y0: Math.min(wy, y), x1: Math.max(wx, x), y1: Math.max(wy, y) }; T.renderOver(); },
    up() {
      const b = T.overlay.band; T.overlay.band = null;
      const ids = T.page().items.filter(it => {
        if (!sichtbar(it)) return false;
        if (it.t === 'o') { if (it.fest) return false; const c = [it.x + it.w / 2, it.y + it.h / 2]; return c[0] >= b.x0 && c[0] <= b.x1 && c[1] >= b.y0 && c[1] <= b.y1; }
        return !it.fest && it.p.some(q => q[0] >= b.x0 && q[0] <= b.x1 && q[1] >= b.y0 && q[1] <= b.y1);
      }).map(it => it.id);
      S.sel = ids.length ? { ids: new Set(ids) } : null; T.renderOver();
    },
    cancel() { T.overlay.band = null; T.renderOver(); }
  };
}
})();
