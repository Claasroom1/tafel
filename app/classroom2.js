// Tafel-App – Classroom-Werkzeuge, Teil 2: Scheinwerfer, Lupe, Glücksrad, geteilte Tafel, Team-Quiz (Buzzer),
// Bild-Puzzle (Bild kachelweise aufdecken) und Tafelbild-Vorlagen
'use strict';
(function () {
const h = T.h, S = T.S, CR = T.CR = T.CR || {}, B = T.BAUSTEINE;
const klassen = () => { if (T.klassenAnwesend) return T.klassenAnwesend(); try { return JSON.parse(localStorage.getItem('tafelapp.klassen') || '{}'); } catch (e) { return {}; } }; // ohne die heute Fehlenden
const merke = (k, v) => { try { localStorage.setItem('tafelapp.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const lies = (k, d) => { try { const v = JSON.parse(localStorage.getItem('tafelapp.' + k)); return v == null ? d : v; } catch (e) { return d; } };
const flaeche = () => ({ l: T.ox, t: 56, w: innerWidth - T.ox, h: innerHeight - 56 }); // Tafelbereich auf dem Bildschirm
const ziehen = (el, start, bewege, ende) => { // Zeiger festhalten und mitführen
  el.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return; e.preventDefault(); e.stopPropagation();
    try { el.setPointerCapture(e.pointerId); } catch (x) {} const s = start(e); let auf = true;
    const mv = ev => { if (auf) bewege(ev, s); }, up = ev => { auf = false; el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); ende && ende(ev, s); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
};
let sw = null, lupe = null;
T.crAktiv = id => id === 'scheinwerfer' ? !!sw : id === 'lupe' ? !!lupe : id === 'leselineal' ? !!lineal : id === 'schwarz' ? T.schwarzAn() : id === 'teilung' ? !!T.teilung : false;
const leiste = () => T.updateToolbar && T.updateToolbar();

// ---------- Scheinwerfer: Tafel abdunkeln bis auf einen verschiebbaren Lichtkreis ----------
CR.scheinwerfer = () => {
  if (sw) { sw.weg(); return; }
  const A0 = flaeche(), st = { x: A0.w / 2, y: A0.h / 2, r: Math.min(A0.w, A0.h) * 0.22 };
  const dunkel = h('div', { class: 'sw-dunkel' }), fang = h('div', { class: 'sw-fang', title: 'Ins Dunkle tippen oder ziehen: Licht dorthin' });
  const griff = h('div', { class: 'sw-griff', title: 'Größe ändern' }, '⤡');
  const kreuz = h('div', { class: 'sw-kreuz', title: 'Ziehen: Licht verschieben' }, '✥'); // Griff am Rand des Lichts (neben ⤡), damit die Mitte frei bleibt
  const knoepfe = h('div', { class: 'sw-knoepfe' },
    h('button', { title: 'Kleiner', onclick: () => { st.r = Math.max(50, st.r * 0.8); upd(); } }, '−'),
    h('button', { title: 'Größer', onclick: () => { st.r = Math.min(900, st.r * 1.25); upd(); } }, '＋'),
    h('button', { title: 'Scheinwerfer aus', onclick: () => sw.weg() }, '×'));
  const upd = () => {
    const A = flaeche(); st.x = T.clamp(st.x, 0, A.w); st.y = T.clamp(st.y, 0, A.h); const { x, y, r } = st;
    dunkel.style.background = `radial-gradient(circle ${r}px at ${x}px ${y}px, transparent 0, transparent ${r - 4}px, rgba(8,10,16,.88) ${r + 3}px)`;
    fang.style.clipPath = `path(evenodd, 'M0 0H${A.w}V${A.h}H0Z M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z')`;
    griff.style.left = x + r * 0.707 + 'px'; griff.style.top = y + r * 0.707 + 'px'; const wk = Math.PI / 4 - 62 / r; kreuz.style.left = x + r * Math.cos(wk) + 'px'; kreuz.style.top = y + r * Math.sin(wk) + 'px'; // am Rand, ~62 px neben ⤡
    const unten = y + r + 70 < A.h; knoepfe.style.left = x + 'px'; knoepfe.style.top = (unten ? y + r + 14 : Math.max(8, y - r - 66)) + 'px';
  };
  const box = h('div', { id: 'scheinwerfer' }, dunkel, fang, kreuz, griff, knoepfe);
  const lage = e => { const A = flaeche(); return [e.clientX - A.l, e.clientY - A.t]; };
  ziehen(kreuz, e => { const [x, y] = lage(e); return [x - st.x, y - st.y]; }, (e, d) => { const [x, y] = lage(e); st.x = x - d[0]; st.y = y - d[1]; upd(); });
  ziehen(fang, e => { [st.x, st.y] = lage(e); upd(); }, e => { [st.x, st.y] = lage(e); upd(); });
  ziehen(griff, () => null, e => { const [x, y] = lage(e); st.r = T.clamp(Math.hypot(x - st.x, y - st.y), 50, 900); upd(); });
  document.body.append(box); upd();
  const ro = new ResizeObserver(() => requestAnimationFrame(upd)); ro.observe(box); // im nächsten Bild – vermeidet die Browser-Warnung „ResizeObserver loop“
  sw = { weg: () => { ro.disconnect(); box.remove(); sw = null; leiste(); } }; leiste();
  T.toast('Scheinwerfer: am ✥ neben ⤡ verschieben (oder ins Dunkle tippen) – im Licht kann man weiter schreiben.', 3500);
};

// ---------- Tafel schwarz: alles ausblenden (wie Taste B in PowerPoint) – antippen holt die Tafel zurück ----------
let schwarzEl = null;
T.schwarzAn = () => !!schwarzEl;
T.schwarz = an => {
  if (an == null) an = !schwarzEl;
  if (!an) { if (schwarzEl) { schwarzEl.remove(); schwarzEl = null; } leiste(); T.aufLeiste && T.aufLeiste(); return; }
  if (schwarzEl) return;
  T.closePops && T.closePops();
  schwarzEl = h('div', { id: 'schwarz', title: 'Antippen: Tafel wieder zeigen' }, h('span', {}, 'Antippen: Tafel wieder zeigen'));
  schwarzEl.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); T.schwarz(false); });
  document.body.append(schwarzEl); leiste();
};

// ---------- Leselineal:nur ein Streifen (Zeile) bleibt hell, darüber und darunter abgedunkelt ----------
// Hilft beim Lesen langer Texte (LRS, Konzentration): ✥ rechts verschieben, ⤡ Höhe, ▲ ▼ eine Zeile weiter, Farbe für den Streifen
let lineal = null;
CR.leselineal = () => {
  if (lineal) { lineal.weg(); return; }
  const A0 = flaeche(), st = { y: A0.h * 0.35, hh: 90, farbe: 0, dunkel: 0.82 };
  const FARBEN = [['transparent', 'ohne'], ['rgba(255,235,59,.22)', 'gelb'], ['rgba(129,212,250,.22)', 'blau'], ['rgba(165,214,167,.24)', 'grün']];
  const dunkel = h('div', { class: 'sw-dunkel' }), band = h('div', { class: 'll-band' }), fang = h('div', { class: 'sw-fang', title: 'Ins Dunkle tippen oder ziehen: Lineal dorthin' });
  const kreuz = h('div', { class: 'sw-kreuz', title: 'Ziehen: Lineal verschieben' }, '✥'), griff = h('div', { class: 'sw-griff', title: 'Höhe ändern' }, '⤡');
  const fk = h('button', { title: 'Farbe des Streifens (gelb, blau, grün)', onclick: () => { st.farbe = (st.farbe + 1) % FARBEN.length; upd(); } }, '🎨');
  const knoepfe = h('div', { class: 'sw-knoepfe ll-knoepfe' },
    h('button', { title: 'Eine Zeile nach oben', onclick: () => { st.y -= st.hh; upd(); } }, '▲'),
    h('button', { title: 'Eine Zeile nach unten', onclick: () => { st.y += st.hh; upd(); } }, '▼'),
    h('button', { title: 'Schmaler', onclick: () => { st.hh = Math.max(40, st.hh * 0.8); upd(); } }, '−'),
    h('button', { title: 'Breiter (mehr Zeilen)', onclick: () => { st.hh = Math.min(600, st.hh * 1.25); upd(); } }, '＋'),
    h('button', { title: 'Abdunkeln: stark / leicht', onclick: () => { st.dunkel = st.dunkel > 0.6 ? 0.5 : 0.82; upd(); } }, '◐'), fk,
    h('button', { title: 'Leselineal aus', onclick: () => lineal.weg() }, '×'));
  const upd = () => {
    const A = flaeche(); st.y = T.clamp(st.y, 0, Math.max(0, A.h - st.hh)); const o = st.y, u = st.y + st.hh, d = `rgba(8,10,16,${st.dunkel})`;
    dunkel.style.background = `linear-gradient(to bottom, ${d} 0, ${d} ${o}px, transparent ${o}px, transparent ${u}px, ${d} ${u}px, ${d} 100%)`;
    band.style.top = o + 'px'; band.style.height = st.hh + 'px'; band.style.background = FARBEN[st.farbe][0]; fk.title = 'Farbe des Streifens: ' + FARBEN[st.farbe][1];
    fang.style.clipPath = `path(evenodd, 'M0 0H${A.w}V${A.h}H0Z M0 ${o}H${A.w}V${u}H0Z')`;
    // Griffe links: rechts liegen Zoom (%), Notizen/Störungen und die Minikarte
    kreuz.style.left = '40px'; kreuz.style.top = o + Math.min(st.hh / 2, 34) + 'px';
    griff.style.left = '100px'; griff.style.top = u + 'px';
    const unten = u + 76 < A.h; knoepfe.style.left = A.w / 2 + 'px'; knoepfe.style.top = (unten ? u + 12 : Math.max(8, o - 66)) + 'px';
  };
  const box = h('div', { id: 'scheinwerfer', class: 'leselineal' }, dunkel, band, fang, kreuz, griff, knoepfe);
  const lage = e => { const A = flaeche(); return e.clientY - A.t; };
  ziehen(kreuz, e => lage(e) - st.y, (e, d) => { st.y = lage(e) - d; upd(); });
  ziehen(fang, e => { st.y = lage(e) - st.hh / 2; upd(); }, e => { st.y = lage(e) - st.hh / 2; upd(); });
  ziehen(griff, () => null, e => { st.hh = T.clamp(lage(e) - st.y, 40, 600); upd(); });
  const tasten = e => { if (!lineal || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return; if (e.key === 'ArrowDown') { st.y += st.hh; upd(); e.preventDefault(); } else if (e.key === 'ArrowUp') { st.y -= st.hh; upd(); e.preventDefault(); } };
  addEventListener('keydown', tasten);
  document.body.append(box); upd();
  const ro = new ResizeObserver(() => requestAnimationFrame(upd)); ro.observe(box);
  lineal = { weg: () => { ro.disconnect(); removeEventListener('keydown', tasten); box.remove(); lineal = null; leiste(); } }; leiste();
  T.toast('Leselineal: am ✥ links verschieben, ▲ ▼ eine Zeile weiter (auch Pfeiltasten), ⤡ Höhe – im Streifen kann man weiter schreiben.', 4000);
};

// ---------- Lupe: vergrößert die Stelle darunter ----------
CR.lupe = () => {
  if (lupe) { lupe.weg(); return; }
  // Bedienung wie beim Scheinwerfer: ✥ verschieben, ⤡ Größe, darunter − ＋ × (und Vergrößerung)
  let R = 170, fak = 2, x = T.ox + (innerWidth - T.ox) / 2, y = innerHeight / 2, lauf = 0;
  const cv = h('canvas'), ctx = cv.getContext('2d');
  const glas = h('div', { class: 'lupe-glas', title: 'Ziehen: Lupe verschieben' }, cv);
  const griff = h('div', { class: 'lg-griff', title: 'Größe ändern' }, '⤡'), kreuz = h('div', { class: 'lg-griff lg-kreuz', title: 'Ziehen: Lupe verschieben' }, '✥');
  const fakKnopf = v => h('button', { class: v === fak ? 'on' : '', onclick: () => { fak = v; male(); } }, v + '×');
  const knoepfe = h('div', { class: 'lupe-knoepfe' });
  const groesse = r => { R = T.clamp(r, 70, 420); platz(); };
  const male = () => { knoepfe.innerHTML = ''; knoepfe.append(h('button', { title: 'Kleiner', onclick: () => groesse(R * 0.8) }, '−'), h('button', { title: 'Größer', onclick: () => groesse(R * 1.25) }, '＋'), fakKnopf(1.5), fakKnopf(2), fakKnopf(3), h('button', { title: 'Lupe schließen', onclick: () => lupe.weg() }, '×')); };
  const box = h('div', { class: 'lupe-box' }, glas, griff, kreuz, knoepfe);
  const platz = () => {
    const d = T.dpr; if (cv.width !== Math.round(2 * R * d)) { cv.width = cv.height = Math.round(2 * R * d); cv.style.width = cv.style.height = 2 * R + 'px'; }
    Object.assign(glas.style, { width: 2 * R + 'px', height: 2 * R + 'px' }); box.style.width = 2 * R + 'px';
    box.style.left = x - R + 'px'; box.style.top = y - R + 'px';
    const wk = Math.PI / 4 - 62 / R; // ✥ am Rand, gleich neben ⤡
    Object.assign(griff.style, { left: R + R * 0.707 + 'px', top: R + R * 0.707 + 'px' }); Object.assign(kreuz.style, { left: R + R * Math.cos(wk) + 'px', top: R + R * Math.sin(wk) + 'px' });
  };
  ziehen(kreuz, e => [e.clientX - x, e.clientY - y], (e, s) => { x = T.clamp(e.clientX - s[0], 0, innerWidth); y = T.clamp(e.clientY - s[1], 56, innerHeight); platz(); });
  ziehen(griff, () => null, e => groesse(Math.hypot(e.clientX - x, e.clientY - y)));
  const zeichne = () => {
    lauf = requestAnimationFrame(zeichne);
    const d = T.dpr, n = cv.width, q = 2 * R / fak * d, sx = (x - R / fak) * d, sy = (y - R / fak) * d;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, n, n); ctx.imageSmoothingQuality = 'high';
    for (const c of [T.cv.cMain, T.cv.cLive, T.cv.cOver]) ctx.drawImage(c, sx, sy, q, q, 0, 0, n, n);
  };
  ziehen(glas, e => [e.clientX - x, e.clientY - y], (e, s) => { x = T.clamp(e.clientX - s[0], 0, innerWidth); y = T.clamp(e.clientY - s[1], 56, innerHeight); platz(); });
  male(); document.body.append(box); platz(); zeichne();
  lupe = { weg: () => { cancelAnimationFrame(lauf); box.remove(); lupe = null; leiste(); } }; leiste();
};

// ---------- Glücksrad ----------
const RADFARBEN = ['#5b5bd6', '#14b8a6', '#f59e0b', '#ec4899', '#22c55e', '#8b5cf6', '#ef4444', '#0ea5e9', '#f97316', '#84cc16'];
CR.gluecksrad = () => {
  const listen = klassen(), ks = Object.keys(listen);
  let quelle = lies('radQuelle', ks[0] || 'eigene'); if (quelle !== 'eigene' && !listen[quelle]) quelle = ks[0] || 'eigene';
  let eigene = lies('radEigene', ['Aufgabe 1', 'Aufgabe 2', 'Aufgabe 3', 'Aufgabe 4', 'Aufgabe 5', 'Aufgabe 6']);
  const alle = () => quelle === 'eigene' ? eigene : listen[quelle] || [];
  let raus = [], dreh = 0, laeuft = false, bearbeiten = false, w = null;
  const pool = () => alle().filter(n => !raus.includes(n));
  const G = 440, cv = h('canvas', { width: G * T.dpr, height: G * T.dpr, class: 'rad', title: 'Antippen: drehen', onclick: () => drehen() }), ctx = cv.getContext('2d');
  const out = h('div', { class: 'zname rad-name' }, '…'), info = h('div', { class: 'hint', style: { textAlign: 'center' } });
  const ohne = h('input', { type: 'checkbox', style: { width: '26px', height: '26px' } }); ohne.checked = lies('radOhne', true);
  ohne.onchange = () => { merke('radOhne', ohne.checked); if (!ohne.checked) { raus = []; zeichne(); } };
  const male = () => {
    const P = pool(), n = P.length, d = T.dpr, R = G / 2 - 12;
    ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, G, G); ctx.save(); ctx.translate(G / 2, G / 2);
    if (!n) { ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill(); ctx.fillStyle = '#64748b'; ctx.font = '600 20px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(alle().length ? 'Alle gezogen – ↺' : 'Einträge fehlen ✏️', 0, 6); ctx.restore(); return; }
    const seg = 2 * Math.PI / n, fs = T.clamp(300 / n + 6, 13, 28);
    for (let i = 0; i < n; i++) {
      const a = dreh + i * seg - Math.PI / 2;
      ctx.fillStyle = RADFARBEN[i % RADFARBEN.length]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a, a + seg); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.stroke();
      const m = a + seg / 2, links = Math.cos(m) < -0.01; // linke Hälfte: Schrift um 180° drehen, damit nichts auf dem Kopf steht
      ctx.save(); ctx.rotate(links ? m + Math.PI : m); ctx.fillStyle = '#fff'; ctx.font = `700 ${fs}px Segoe UI`; ctx.textAlign = links ? 'left' : 'right'; ctx.textBaseline = 'middle';
      let t = P[i]; while (t.length > 3 && ctx.measureText(t).width > R - 54) t = t.slice(0, -2) + '…';
      ctx.fillText(t, links ? -(R - 14) : R - 14, 0); ctx.restore();
    }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill(); ctx.strokeStyle = '#1b1f2a'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#1b1f2a'; ctx.beginPath(); ctx.moveTo(G / 2 - 16, 2); ctx.lineTo(G / 2 + 16, 2); ctx.lineTo(G / 2, 36); ctx.closePath(); ctx.fill(); // Zeiger oben
  };
  let ton = null;
  const klick = () => { try { ton = ton || new AudioContext(); const o = ton.createOscillator(), g = ton.createGain(); o.frequency.value = 1400; o.connect(g); g.connect(ton.destination); g.gain.setValueAtTime(0.08, ton.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ton.currentTime + 0.03); o.start(); o.stop(ton.currentTime + 0.035); } catch (e) {} };
  const drehen = () => {
    const P = pool(); if (laeuft || bearbeiten || !P.length) { if (!P.length && alle().length) { raus = []; zeichne(); } return; }
    laeuft = true; const n = P.length, seg = 2 * Math.PI / n, ziel = Math.floor(Math.random() * n);
    // Segmentmitte des Ziels soll oben unter dem Zeiger stehen
    const start = dreh, rest = ((-(ziel + 0.5) * seg - start) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI), weg = rest + 2 * Math.PI * (5 + Math.floor(Math.random() * 2));
    const t0 = performance.now(), dauer = 4200; let alt = Math.floor(start / seg);
    out.textContent = '…';
    let fertig = false, zwang = false;
    const schritt = () => {
      if (fertig) return;
      const t = zwang ? 1 : Math.min(1, (performance.now() - t0) / dauer); dreh = start + weg * (1 - Math.pow(1 - t, 4)); male();
      const s = Math.floor(dreh / seg); if (s !== alt) { alt = s; klick(); }
      if (t < 1) requestAnimationFrame(schritt);
      else { fertig = true; laeuft = false; out.textContent = '🎉 ' + P[ziel]; if (ohne.checked) raus.push(P[ziel]); dreh = ((dreh % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); info.textContent = ohne.checked ? `${pool().length} von ${alle().length} übrig` : ''; if (ohne.checked) setTimeout(() => { if (!laeuft) male(); }, 1400); }
    };
    requestAnimationFrame(schritt);
    setTimeout(() => { if (!fertig) { zwang = true; schritt(); } }, dauer + 300); // falls der Browser Animationen pausiert: Ergebnis trotzdem zeigen
  };
  const box = h('div', { class: 'rad-box' });
  const zeichne = () => {
    box.innerHTML = '';
    if (bearbeiten) {
      const ta = h('textarea', { class: 'feld', style: { minHeight: '260px', width: '100%', fontSize: '18px' } }, eigene.join('\n'));
      box.append(h('p', { class: 'hint' }, 'Eigene Einträge – einer pro Zeile (z. B. Aufgaben, Themen, Fragen). Bleiben auf diesem Gerät gespeichert.'), ta);
      w && w.kopf(h('button', { class: 'big prim', onclick: () => { eigene = ta.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean); merke('radEigene', eigene); quelle = 'eigene'; merke('radQuelle', quelle); bearbeiten = false; raus = []; zeichne(); } }, '✓ Fertig'));
      return;
    }
    const sel = h('select', { class: 'feld', onchange: e => { quelle = e.target.value; merke('radQuelle', quelle); raus = []; out.textContent = '…'; zeichne(); } },
      ...ks.map(k => h('option', { value: k, selected: quelle === k }, '👥 ' + k)), h('option', { value: 'eigene', selected: quelle === 'eigene' }, '📝 Eigene Einträge'));
    box.append(h('div', { class: 'row', style: { justifyContent: 'center' } }, sel, h('button', { class: 'big', onclick: () => { bearbeiten = true; zeichne(); } }, '✏️ Eigene')),
      cv, out, info, h('div', { class: 'row', style: { justifyContent: 'center' } }, h('label', { class: 'row' }, ohne, 'Gezogene herausnehmen'), h('button', { class: 'big', title: 'Alle wieder aufs Rad', onclick: () => { raus = []; info.textContent = ''; male(); } }, '↺ Alle')));
    if (!ks.length) box.append(h('p', { class: 'hint', style: { textAlign: 'center' } }, 'Klassenlisten legt man unter „🎯 Namen ziehen“ › ✏️ Liste an.'));
    w && w.kopf(h('button', { class: 'big prim', onclick: () => drehen() }, '🎡 Drehen'));
    male();
  };
  w = T.widget('🎡 Glücksrad', [box], Math.max(20, innerWidth - 600), 70); zeichne();
  Object.assign(cv.style, { width: G + 'px', height: G + 'px' });
};

// ---------- Geteilte Tafel: 2–3 Bereiche nebeneinander, alle schreiben gleichzeitig ----------
const TFARBEN = ['#1a1a1a', '#d32f2f', '#1565c0', '#2e7d32', '#ef6c00', '#6a1b9a'];
let teilBox = null;
T.teilung = null;
T.teilBereich = sx => { const t = T.teilung, A = flaeche(); return t.bereiche[T.clamp(Math.floor((sx - A.l) / (A.w / t.n)), 0, t.n - 1)]; };
function teilungStart(n) {
  const titel = lies('teilTitel', ['Gruppe 1', 'Gruppe 2', 'Gruppe 3']);
  T.teilung = { n, bereiche: Array.from({ length: n }, (_, i) => ({ titel: titel[i] || 'Gruppe ' + (i + 1), farbe: [TFARBEN[0], TFARBEN[2], TFARBEN[1]][i], w: Math.max(4, S.groesse.stift), rad: false })) };
  teilBox = h('div', { id: 'teilung' });
  const male = () => {
    teilBox.innerHTML = '';
    T.teilung.bereiche.forEach((b, i) => {
      const kopf = h('div', { class: 'tkopf' },
        h('input', { type: 'text', class: 'ttitel', value: b.titel, onchange: e => { b.titel = e.target.value; merke('teilTitel', T.teilung.bereiche.map(x => x.titel)); } }),
        ...TFARBEN.slice(0, 4).map(c => h('button', { class: 'tfarbe' + (!b.rad && b.farbe === c ? ' on' : ''), style: { background: c === '#1a1a1a' && T.isDark(T.page()) ? '#f4f4f0' : c }, title: 'Stiftfarbe', onclick: () => { b.farbe = c; b.rad = false; male(); } })),
        h('button', { class: 'twkz' + (b.rad ? ' on' : ''), title: 'Radierer an/aus', onclick: () => { b.rad = !b.rad; male(); } }, '🧽'),
        h('button', { class: 'twkz', title: 'Diesen Bereich leeren', onclick: () => bereichLeeren(i) }, '🗑'),
        i === n - 1 ? h('button', { class: 'twkz tende', title: 'Geteilte Tafel beenden', onclick: teilungEnde }, '×') : '');
      teilBox.append(h('div', { class: 'tbereich' }, kopf));
    });
  };
  male(); document.body.append(teilBox); leiste();
  T.toast(`Geteilte Tafel: ${n} Bereiche – Stifte und Finger schreiben gleichzeitig. Zoomen/Verschieben ist so lange aus.`, 4500);
}
function bereichLeeren(i) {
  const A = flaeche(), v = T.page().view, bw = A.w / T.teilung.n, x0 = (i * bw - v.x) / v.z, x1 = ((i + 1) * bw - v.x) / v.z;
  const pg = T.page(), rest = pg.items.filter(it => { if (it.t !== 's') return true; const b = T.bbox(it), cx = (b.x0 + b.x1) / 2; return cx < x0 || cx >= x1; });
  if (rest.length === pg.items.length) return; T.snap(); pg.items = rest; T.render();
  T.toast('Bereich geleert.', 3000, [['↶ Zurück', T.undo]]);
}
function teilungEnde() { if (teilBox) teilBox.remove(); teilBox = null; T.teilung = null; leiste(); }
CR.teilung = () => {
  if (T.teilung) { teilungEnde(); return; }
  const voll = T.page().items.length > 0, neu = h('input', { type: 'checkbox', style: { width: '30px', height: '30px' } }); neu.checked = voll;
  const los = n => { T.closeDlg(); if (neu.checked) { T.snap(); const np = T.newPage(T.page().bg); np.abstand = T.page().abstand || null; np.titel = 'Geteilte Tafel'; S.board.pages.splice(S.page + 1, 0, np); T.gotoPage(S.page + 1); } teilungStart(n); };
  T.openDlg([h('h2', {}, '◫ Geteilte Tafel'), h('p', { class: 'hint' }, 'Die Tafel wird in Bereiche nebeneinander geteilt. Jeder Bereich hat eigene Farben und einen Radierer – mehrere Kinder schreiben gleichzeitig (so viele Stifte/Finger, wie das Board erkennt).'),
    h('div', { class: 'row', style: { justifyContent: 'center', margin: '14px 0' } }, h('button', { class: 'big', style: { minWidth: '150px', fontSize: '20px' }, onclick: () => los(2) }, '◧ 2 Bereiche'), h('button', { class: 'big', style: { minWidth: '150px', fontSize: '20px' }, onclick: () => los(3) }, '▥ 3 Bereiche')),
    h('label', { class: 'fld check' }, neu, 'Auf einer neuen, leeren Seite beginnen')]);
};

// ---------- Team-Quiz mit Buzzer ----------
const TEAMFARBEN = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
CR.quiz = () => {
  let teams = lies('quizTeams', ['Team Rot', 'Team Blau']).slice(0, 4), punkte = teams.map(() => 0), erster = null, gesperrt = [], bearbeiten = false, w = null;
  const box = h('div', { class: 'quiz' });
  let ton = null;
  const summer = () => { try { ton = ton || new AudioContext(); const o = ton.createOscillator(), g = ton.createGain(); o.type = 'square'; o.frequency.value = 520; o.connect(g); g.connect(ton.destination); g.gain.setValueAtTime(0.12, ton.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ton.currentTime + 0.5); o.start(); o.stop(ton.currentTime + 0.5); } catch (e) {} };
  const zeichne = () => {
    box.innerHTML = '';
    if (bearbeiten) {
      const felder = teams.map((t, i) => h('input', { type: 'text', class: 'feld', value: t, oninput: e => { teams[i] = e.target.value; } }));
      box.append(h('p', { class: 'hint' }, 'Namen der Teams (2–4):'), ...felder.map((f, i) => h('div', { class: 'prow' }, h('span', { class: 'pdot', style: { background: TEAMFARBEN[i] } }), f)),
        h('div', { class: 'row' }, teams.length < 4 ? h('button', { class: 'big', onclick: () => { teams.push('Team ' + (teams.length + 1)); punkte.push(0); zeichne(); } }, '＋ Team') : '',
          teams.length > 2 ? h('button', { class: 'big', onclick: () => { teams.pop(); punkte.pop(); zeichne(); } }, '− Team') : ''));
      w && w.kopf(h('button', { class: 'big prim', onclick: () => { teams = teams.map((t, i) => t.trim() || 'Team ' + (i + 1)); merke('quizTeams', teams); bearbeiten = false; zeichne(); } }, '✓ Fertig'));
      return;
    }
    w && w.kopf(h('button', { class: 'big', onclick: () => { bearbeiten = true; zeichne(); } }, '✏️ Teams'));
    box.append(h('div', { class: 'quiz-buzzer' }, ...teams.map((t, i) => h('button', {
      class: 'buzzer' + (erster === i ? ' zuerst' : '') + (erster != null && erster !== i || gesperrt.includes(i) ? ' aus' : ''), style: '--f:' + TEAMFARBEN[i],
      onpointerdown: e => { e.preventDefault(); if (erster != null || gesperrt.includes(i)) return; erster = i; summer(); zeichne(); } },
      h('span', { class: 'bz-name' }, t), h('span', { class: 'bz-punkte' }, String(punkte[i]))))));
    box.append(h('div', { class: 'quiz-status' }, erster != null ? '🔔 ' + teams[erster] + ' war zuerst!' : 'Frage stellen – wer zuerst drückt, antwortet.'));
    box.append(h('div', { class: 'row', style: { justifyContent: 'center' } },
      h('button', { class: 'big prim', disabled: erster == null, onclick: () => { punkte[erster]++; erster = null; gesperrt = []; zeichne(); } }, '✓ Richtig (+1)'),
      h('button', { class: 'big', disabled: erster == null, title: 'Falsch: die anderen Teams dürfen noch', onclick: () => { gesperrt.push(erster); erster = null; if (gesperrt.length >= teams.length) gesperrt = []; zeichne(); } }, '✗ Falsch'),
      h('button', { class: 'big', onclick: () => { erster = null; gesperrt = []; zeichne(); } }, '↺ Freigeben'),
      h('button', { class: 'big warn', onclick: async () => { if (await T.frage('Alle Punkte auf 0 setzen?')) { punkte = teams.map(() => 0); erster = null; gesperrt = []; zeichne(); } } }, '0')));
  };
  w = T.widget('🔔 Team-Quiz', [box], Math.max(20, innerWidth - 700), 80); zeichne();
};

// ---------- Bild-Puzzle: Bild kachelweise aufdecken ----------
const KFARBEN = ['#5b5bd6', '#7c6fe0', '#8e5bd6', '#14b8a6', '#0ea5e9', '#6366f1'];
B.kacheln = { name: 'Bild-Puzzle', gruppe: 'intern', def: { sp: 4, ze: 3, offen: [], bw: 1000, bh: 750 }, felder: [],
  gen: d => {
    const W = d.bw, H = d.bh, cw = W / d.sp, ch = H / d.ze, offen = new Set(d.offen || []); let s = '';
    for (let r = 0; r < d.ze; r++) for (let c = 0; c < d.sp; c++) {
      const i = r * d.sp + c; if (offen.has(i)) continue;
      const x = c * cw, y = r * ch, fs = Math.min(cw, ch) * 0.38;
      s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}" fill="${KFARBEN[(r + c) % KFARBEN.length]}" stroke="#fff" stroke-width="4"/>`
        + `<text x="${(x + cw / 2).toFixed(1)}" y="${(y + ch / 2).toFixed(1)}" font-size="${fs.toFixed(1)}" font-weight="700" fill="rgba(255,255,255,.9)" text-anchor="middle" dominant-baseline="central">${i + 1}</text>`;
    }
    return { svg: T._svg.doc(W, H, s), w: W, h: H };
  } };
const kachelSetze = (o, offen) => { T.snap(); T.replaceItem({ ...o, d: { ...o.d, offen } }); T.renderOver(); };
B.kacheln.schnell = [{ l: '🎲 Zufällige', aus: o => { const n = o.d.sp * o.d.ze, zu = [...Array(n).keys()].filter(i => !o.d.offen.includes(i)); if (zu.length) kachelSetze(o, o.d.offen.concat(zu[Math.floor(Math.random() * zu.length)])); } },
  { l: '👁 Alle auf', aus: o => kachelSetze(o, [...Array(o.d.sp * o.d.ze).keys()]) }, { l: '↺ Alle zu', aus: o => kachelSetze(o, []) },
  { l: '✕ Puzzle weg', aus: o => { T.snap(); T.page().items = T.page().items.filter(i => i.id !== o.id); S.sel = null; T.render(); T.renderOver(); } }];
T.kachelAufdecken = (o, x, y) => { // eine Kachel antippen: aufdecken (nochmals: wieder zudecken)
  const [lx, ly] = T.objLocal(o, x, y), c = T.clamp(Math.floor((lx + o.w / 2) / (o.w / o.d.sp)), 0, o.d.sp - 1), r = T.clamp(Math.floor((ly + o.h / 2) / (o.h / o.d.ze)), 0, o.d.ze - 1), i = r * o.d.sp + c;
  kachelSetze(o, o.d.offen.includes(i) ? o.d.offen.filter(k => k !== i) : o.d.offen.concat(i));
};
T.puzzleAus = bild => {
  const mach = (sp, ze) => {
    T.closeDlg(); const k = { t: 'o', id: T.uid(), k: 'kacheln', d: { ...B.kacheln.def, sp, ze, offen: [], bh: Math.round(1000 * bild.h / bild.w) }, x: bild.x, y: bild.y, w: bild.w, h: bild.h, r: bild.r || 0, fest: true };
    T.snap(); const pg = T.page(); pg.items = pg.items.map(i => i.id === bild.id ? { ...i, fest: true } : i); pg.items.push(k); S.sel = null; T.render(); T.renderOver();
    T.toast('Bild-Puzzle: Kachel antippen = aufdecken (nochmals = zudecken). Mit „Auswahl“ antippen: Zufällige, Alle auf …', 5000);
  };
  T.openDlg([h('h2', {}, '🧩 Bild-Puzzle'), h('p', { class: 'hint' }, 'Das Bild wird mit nummerierten Kacheln abgedeckt. Die Klasse wählt Kacheln – wer erkennt das Bild zuerst?'),
    h('div', { class: 'row', style: { justifyContent: 'center' } }, ...[[3, 2], [3, 3], [4, 3], [4, 4], [5, 4], [6, 5]].map(([a, b]) => h('button', { class: 'big', style: { minWidth: '110px' }, onclick: () => mach(a, b) }, a + ' × ' + b)))]);
};

// ---------- Tafelbild-Vorlagen: Seite speichern und wiederverwenden ----------
T.vorlageSpeichern = async () => {
  const pg = T.page(); if (!pg.items.length) { T.toast('Diese Seite ist leer.'); return; }
  const name = await T.frage('Name der Vorlage:', { feld: { wert: pg.titel || (S.board.titel || 'Tafelbild') }, ok: '⭐ Speichern' }); if (!name || !name.trim()) return;
  const liste = lies('vorlagen', []); liste.unshift({ name: name.trim(), datum: T.today(), bg: pg.bg, abstand: pg.abstand || null, items: pg.items });
  if (!merke('vorlagen', liste)) { T.toast('Zu groß zum Speichern (Bilder?). Tipp: Vorlage ohne große Bilder speichern.', 6000); return; }
  T.toast('Vorlage „' + name.trim() + '“ gespeichert – Seiten › 📋 Aus Vorlage.', 3500);
};
T.vorlageWaehlen = () => {
  const liste = lies('vorlagen', []);
  const karte = (v, i) => h('div', { class: 'seite-karte vorlage-karte' },
    h('div', { class: 'seite-bild', onclick: () => einsetzen(v) }, T.seitenBild({ bg: v.bg, abstand: v.abstand, items: v.items, view: { x: 0, y: 0, z: 1 } })),
    h('b', { class: 'vorlage-name', onclick: () => einsetzen(v) }, v.name), h('span', { class: 'hint' }, v.datum),
    h('button', { class: 'big warn', title: 'Vorlage löschen', onclick: async () => { if (!await T.frage('Vorlage „' + v.name + '“ löschen?', { ok: '🗑 Löschen' })) return; liste.splice(i, 1); merke('vorlagen', liste); T.vorlageWaehlen(); } }, '🗑'));
  const einsetzen = v => {
    T.closeDlg(); T.snap(); const neuId = new Map(v.items.map(it => [it.id, T.uid()]));
    const items = v.items.map(it => ({ ...it, id: neuId.get(it.id), ...(it.an ? { an: T.anMap(it.an, x => neuId.get(x) || x) } : {}) }));
    const np = { ...T.newPage(v.bg), abstand: v.abstand || null, titel: v.name, items }; S.board.pages.splice(S.page + 1, 0, np); T.gotoPage(S.page + 1);
    T.toast('Neue Seite aus Vorlage „' + v.name + '“.', 3000);
  };
  T.openDlg([h('h2', {}, '📋 Tafelbild-Vorlagen'),
    liste.length ? h('div', { class: 'vorlagen' }, ...liste.map(karte)) : h('p', { class: 'hint' }, 'Noch keine Vorlagen. Ein fertiges Tafelbild speichert man über Seiten › ⭐ Als Vorlage speichern.'),
    h('p', { class: 'hint' }, 'Antippen fügt die Vorlage als neue Seite hinter dieser ein. Vorlagen bleiben auf diesem Gerät (im Browser) gespeichert.')], true);
};
})();
