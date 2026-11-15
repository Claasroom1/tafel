// Tafel-App – 🪑 Sitzplan (Classroom › Klasse): Klassenraum maßstabsgetreu (cm) mit Smartboard, Pult, Regalen/Schränken.
// Grundlage ist die Klassenliste: jede Schülerin, jeder Schüler bekommt einen Tisch (Name oder Nummer). Tische und Möbel mit dem
// Finger verschieben, Doppeltipp dreht einen Tisch um 90°. Anordnungen auf Knopfdruck: Reihen (links 4, Gang, rechts 3 Tische je Reihe),
// Gruppentische (Anzahl Schülerinnen/Schüler und Gruppen), Sitzkreis in der Mitte (Tische an die Wände geräumt, Stühle im Kreis).
// Die Nummern bleiben in jeder Anordnung gleich – so wissen alle, wohin „ihr“ Tisch kommt. Gespeichert je Klasse (wandert mit den
// persönlichen Einstellungen der Lehrkraft); „⤓ Auf die Tafel“ legt den Plan als Bild auf die Tafel.
'use strict';
(function () {
const h = T.h, KEY = 'tafelapp.sitzplan';
const lesen = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
const schreiben = alle => { try { localStorage.setItem(KEY, JSON.stringify(alle)); } catch (e) {} };
const klassen = () => { try { return JSON.parse(localStorage.getItem('tafelapp.klassen') || '{}') || {}; } catch (e) { return {}; } };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const f1 = v => Math.round(v * 10) / 10;
let klasse = '', plan = null, wahl = null, wahlT = null, groesseNeu = null, aufBox = null, festModus = false, festWahl = null; /* ✋ Gruppen festlegen: gewählter Tisch (Index) */

/* ---------- Grundplan ---------- */
function moebelStandard(R) {
  return [{ id: 'm1', typ: 'board', x: R.b / 2 - 110, y: 0, w: 220, h: 14, l: 'Smartboard' },
    { id: 'm2', typ: 'pult', x: 60, y: 45, w: 140, h: 70, l: 'Pult' },
    { id: 'm3', typ: 'regal', x: 20, y: R.t - 45, w: 200, h: 40, l: 'Regal' },
    { id: 'm4', typ: 'schrank', x: R.b - 150, y: R.t - 60, w: 130, h: 55, l: 'Schrank' }];
}
function neuerPlan(n) {
  const R = { b: 900, t: 800 }, p = { raum: R, tisch: { b: 70, t: 50 }, stuhl: 45, modus: 'reihen', beschriftung: 'namen', reihenfolge: [...Array(n).keys()], gruppen: Math.max(2, Math.round(n / 4)), anzahl: n, moebel: moebelStandard(R), tische: [], kreis: [] };
  anordnen(p, 'reihen'); return p;
}
const stuhlMass = p => p.stuhlMass || { b: 44, t: Math.round((p.stuhl || 45) * 0.8) }; /* Sitzfläche des Stuhls (cm) */
const namenListe = () => (klassen()[klasse] || []).filter(Boolean);
const beschriftung = (p, i) => { const nr = i + 1; if (p.beschriftung === 'nummern') return String(nr); const nm = namenListe()[p.reihenfolge[i] != null ? p.reihenfolge[i] : i]; return nm ? nr + ' ' + nm : String(nr); };

/* ---------- Anordnungen ---------- */
function anordnen(p, modus) {
  p.modus = modus; const R = p.raum, tb = p.tisch.b, tt = p.tisch.t, st = p.stuhl, n = Math.max(1, Math.round(p.anzahl || 1));
  p.reihenfolge = (p.reihenfolge || []).slice(0, n); for (let i = p.reihenfolge.length; i < n; i++) p.reihenfolge.push(i);
  p.kreis = []; const T0 = [], weg = new Set(p.entfernt || []), aktiv = [...Array(n).keys()].filter(i => !weg.has(i)), na = Math.max(1, aktiv.length); /* entfernte Tische bleiben weg */
  if (modus === 'reihen') { /* je Reihe: links 4 Tische, Gang, rechts 3 Tische – Blick nach vorne zum Smartboard */
    const rand = 50, y0 = 190, abstand = tt + st + 35;
    aktiv.forEach((i, kk) => { const r = Math.floor(kk / 7), c = kk % 7, x = c < 4 ? rand + c * tb : R.b - rand - (7 - c) * tb;
      T0.push({ i, x, y: y0 + r * abstand, w: tb, h: tt, stuhl: 'unten' }); });
  } else if (modus === 'gruppen') { /* Gruppentische: je Gruppe zwei Tischreihen gegenüber, Stühle außen */
    const g = T.clamp(Math.round(p.gruppen || 2), 1, na), mitglieder = Array.from({ length: g }, () => []);
    if (p.gruppenFest) { /* ✋ festgelegte Gruppen (je Name gemerkt) – wer noch keine Gruppe hat, kommt in die kleinste */
      const ohne = [];
      for (const i of aktiv) { const k = p.gruppenFest[p.reihenfolge[i]]; if (k >= 1 && k <= g) mitglieder[k - 1].push(i); else ohne.push(i); }
      for (const i of ohne) mitglieder.reduce((a, b) => b.length < a.length ? b : a).push(i);
    } else { const basis = Math.floor(na / g), rest = na % g; let z = 0; for (let k = 0; k < g; k++) for (let j = 0; j < basis + (k < rest ? 1 : 0); j++) mitglieder[k].push(aktiv[z++]); }
    /* Gänge einplanen: Platzbedarf je Gruppe (Tische + Stühle außen) und dazwischen der Gang. Ausprobiert werden Spaltenzahl und Lage der
       Gruppentische (längs: Stühle links/rechts · quer: Stühle oben/unten) – genommen wird, was die breitesten Gänge ergibt */
    const gang = T.clamp(+p.gang || 60, 30, 200), stuhlTiefe = stuhlMass(p).t + 4, groesste = Math.max(...mitglieder.map(l => l.length), 1), reihenMax = Math.ceil(groesste / 2);
    const x0 = 25, x1 = R.b - 25, y0 = 150, y1 = R.t - 50; let best = { gang: -1e9, sp: 1, quer: false };
    for (const quer of [false, true]) { const fw = quer ? reihenMax * tb : 2 * tt + 2 * stuhlTiefe, fh = quer ? 2 * tt + 2 * stuhlTiefe : reihenMax * tb;
      for (let s = 1; s <= g; s++) { const z = Math.ceil(g / s), m = Math.min((x1 - x0) / s - fw, (y1 - y0) / z - fh); if (m > best.gang) best = { gang: m, sp: s, quer }; } }
    const sp = best.sp, zl = Math.ceil(g / sp), cw = (x1 - x0) / sp, ch = (y1 - y0) / zl;
    if (best.gang < gang) T.toast && T.toast(`Achtung: Zwischen den Gruppen bleiben nur etwa ${Math.max(0, Math.round(best.gang))} cm Gang (gewünscht ${gang} cm) – weniger Gruppen, kleinere Tische oder einen größeren Raum eintragen.`, 5000);
    mitglieder.forEach((liste, k) => { const s = liste.length, reihen = Math.max(1, Math.ceil(s / 2)), cx = x0 + (k % sp + 0.5) * cw, cy = y0 + (Math.floor(k / sp) + 0.5) * ch;
      liste.forEach((i, j) => { const a = j % 2 === 0, z = Math.floor(j / 2);
        if (best.quer) { const bw = reihen * tb, bh = 2 * tt; T0.push({ i, x: cx - bw / 2 + z * tb, y: cy - bh / 2 + (a ? 0 : tt), w: tb, h: tt, stuhl: a ? 'oben' : 'unten', g: k + 1 }); }
        else { const bw = 2 * tt, bh = reihen * tb; T0.push({ i, x: cx - bw / 2 + (a ? 0 : tt), y: cy - bh / 2 + z * tb, w: tt, h: tb, stuhl: a ? 'links' : 'rechts', g: k + 1 }); } }); });
  } else { /* Sitzkreis in der Mitte, Tische an die Wände (links, rechts, hinten – vorne bleibt frei für Smartboard und Pult) */
    const cy = 170 + (R.t - 250) / 2, cx = R.b / 2, Rk = Math.max(na * (stuhlMass(p).b + 14) / (2 * Math.PI), 110);
    aktiv.forEach((i, kk) => { const a = -Math.PI / 2 + kk * 2 * Math.PI / na; p.kreis.push({ i, x: cx + Rk * Math.cos(a), y: cy + Rk * Math.sin(a) }); });
    const frei = { x0: cx - Rk - 60, x1: cx + Rk + 60, y0: cy - Rk - 60, y1: cy + Rk + 60 };
    const stoert = r => p.moebel.some(m => r.x < m.x + m.w + 5 && r.x + r.w > m.x - 5 && r.y < m.y + m.h + 5 && r.y + r.h > m.y - 5) || (r.x < frei.x1 && r.x + r.w > frei.x0 && r.y < frei.y1 && r.y + r.h > frei.y0);
    const plaetze = [];
    for (let lage = 0; lage < 3 && plaetze.length < na; lage++) { const off = 5 + lage * (tt + 8);
      for (let y = 150; y + tb <= R.t - 5; y += tb + 4) { plaetze.push({ x: off, y, w: tt, h: tb }); plaetze.push({ x: R.b - off - tt, y, w: tt, h: tb }); }
      for (let x = off + tt + 6; x + tb <= R.b - off - tt - 6; x += tb + 4) plaetze.push({ x, y: R.t - off - tt, w: tb, h: tt }); }
    const ok = plaetze.filter(r => !stoert(r));
    aktiv.forEach((i, kk) => { const r = ok[kk] || { x: cx - tb / 2, y: R.t + 20 + kk * 4, w: tb, h: tt }; T0.push({ i, ...r, stuhl: null }); });
    if (ok.length < na) T.toast && T.toast(`Nicht alle Tische passen an die Wände (${ok.length} von ${na}) – Raum größer eintragen oder Tische von Hand stellen.`, 4500);
  }
  p.tische = T0;
}

/* ---------- Zeichnen (SVG, Maßeinheit cm) ---------- */
const FARBE = { board: ['#263238', '#fff'], pult: ['#8d6e63', '#fff'], regal: ['#a1887f', '#fff'], schrank: ['#795548', '#fff'], tuer: ['#90a4ae', '#fff'], fenster: ['#81d4fa', '#01579b'] };
/* Beschriftung eines Möbelstücks: waagerecht oder – bei gedrehtem, hohem Möbel – senkrecht; zu schmale Teile (Tafel, Tür) daneben */
function moebelText(mo, tx) {
  const hoch = mo.h > mo.w, kurz = Math.min(mo.w, mo.h), lang = Math.max(mo.w, mo.h), gr = Math.min(18, kurz * 0.6, lang / 6), cx = mo.w / 2, cy = mo.h / 2, t = esc(mo.l);
  if (kurz >= 14) return `<text x="${cx}" y="${cy}" font-size="${gr}" text-anchor="middle" dominant-baseline="central" fill="${tx}" font-weight="700"${hoch ? ` transform="rotate(-90 ${cx} ${cy})"` : ''}>${t}</text>`;
  return hoch ? `<text x="${mo.w + 18}" y="${cy}" font-size="16" text-anchor="middle" dominant-baseline="central" fill="#263238" font-weight="700" transform="rotate(-90 ${mo.w + 18} ${cy})">${t}</text>`
    : `<text x="${cx}" y="${mo.h + 18}" font-size="16" text-anchor="middle" fill="#263238" font-weight="700">${t}</text>`;
}
/* freie Drehung (Grad) um die Mitte; Drehgriff über dem gewählten Tisch bzw. Möbelstück */
const dreh = o => o.r ? ` rotate(${o.r} ${o.w / 2} ${o.h / 2})` : '';
/* Fläche „Tisch + Stuhl“ (Einheit) in Tisch-Koordinaten – je nachdem, wo der Stuhl steht */
const einheitBox = (p, t) => { const cd = stuhlMass(p).t + 4; return t.stuhl === 'unten' ? { x: 0, y: 0, w: t.w, h: t.h + cd } : t.stuhl === 'oben' ? { x: 0, y: -cd, w: t.w, h: t.h + cd } : t.stuhl === 'links' ? { x: -cd, y: 0, w: t.w + cd, h: t.h } : t.stuhl === 'rechts' ? { x: 0, y: 0, w: t.w + cd, h: t.h } : { x: 0, y: 0, w: t.w, h: t.h }; };
const griff = (art, id, o, b = { x: 0, y: 0, w: o.w, h: o.h }) => `<g data-dreh="${art}:${id}" style="cursor:grab"><line x1="${o.w / 2}" y1="${Math.min(0, b.y)}" x2="${o.w / 2}" y2="${Math.min(0, b.y) - 34}" stroke="#1565c0" stroke-width="3"/><circle cx="${o.w / 2}" cy="${Math.min(0, b.y) - 48}" r="17" fill="#1565c0" stroke="#fff" stroke-width="3"/><text x="${o.w / 2}" y="${Math.min(0, b.y) - 47}" font-size="18" text-anchor="middle" dominant-baseline="central" fill="#fff">⟳</text>` + (o.r ? `<text x="${o.w / 2 + 26}" y="${Math.min(0, b.y) - 48}" font-size="16" dominant-baseline="central" fill="#1565c0" font-weight="700">${Math.round(o.r)}°</text>` : '') + '</g>' +
  /* Einheit Tisch + Stuhl: gestrichelter Rahmen um beides */
  (b.w !== o.w || b.h !== o.h ? `<rect x="${b.x - 3}" y="${b.y - 3}" width="${b.w + 6}" height="${b.h + 6}" rx="6" fill="none" stroke="#1565c0" stroke-width="2" stroke-dasharray="6 4"/>` : '') +
  /* ⤡ Größengriff unten rechts (wie bei den Formen) und die Maße in cm */
  `<g data-gross="${art}:${id}" style="cursor:nwse-resize"><rect x="${b.x + b.w - 9}" y="${b.y + b.h - 9}" width="24" height="24" rx="5" fill="#1565c0" stroke="#fff" stroke-width="3"/><path d="M ${b.x + b.w - 2} ${b.y + b.h + 8} L ${b.x + b.w + 8} ${b.y + b.h - 2}" stroke="#fff" stroke-width="2.5"/></g>` +
  `<text x="${b.x + b.w / 2}" y="${b.y + b.h + 34}" font-size="15" text-anchor="middle" fill="#1565c0" font-weight="700">${b.w !== o.w || b.h !== o.h ? `Tisch + Stuhl: ${Math.round(b.w)} × ${Math.round(b.h)}` : `${Math.round(Math.max(b.w, b.h))} × ${Math.round(Math.min(b.w, b.h))}`} cm</text>`;
function svgPlan(p, fuerBild) {
  const R = p.raum, m = 40, W = R.b + 2 * m, H = R.t + 2 * m + 30; let s = '';
  s += `<rect x="${m}" y="${m}" width="${R.b}" height="${R.t}" fill="#fafaf7" stroke="#37474f" stroke-width="6"/>`;
  s += `<text x="${m + R.b / 2}" y="${m - 14}" font-size="20" text-anchor="middle" fill="#455a64">${f1(R.b / 100)} m</text><text x="${m - 14}" y="${m + R.t / 2}" font-size="20" text-anchor="middle" fill="#455a64" transform="rotate(-90 ${m - 14} ${m + R.t / 2})">${f1(R.t / 100)} m</text>`;
  s += `<text x="${m + R.b / 2}" y="${m + R.t + 28}" font-size="18" text-anchor="middle" fill="#78909c">vorne = Smartboard · ${p.modus === 'reihen' ? 'Reihen' : p.modus === 'gruppen' ? 'Gruppentische' : 'Sitzkreis'} · Tisch ${p.tisch.b} × ${p.tisch.t} cm · Stuhl ${stuhlMass(p).b} × ${stuhlMass(p).t} cm</text>`;
  for (const mo of p.moebel) { const [fl, tx] = FARBE[mo.typ] || ['#b0bec5', '#000'], on = !fuerBild && wahl === mo.id;
    s += `<g data-m="${mo.id}" transform="translate(${m + mo.x} ${m + mo.y})${dreh(mo)}" style="cursor:move"><rect width="${mo.w}" height="${mo.h}" rx="4" fill="${fl}" stroke="${on ? '#e53935' : '#37474f'}" stroke-width="${on ? 5 : 2}"/>` +
      moebelText(mo, tx) + (on ? griff('m', mo.id, mo) : '') + '</g>';
    if (on) { /* angetippt: ↻ drehen und 🗑 entfernen direkt am Möbelstück */
      const bx = m + mo.x + mo.w + 6, by = m + mo.y - 6;
      s += `<g data-akt="drehen" data-mid="${mo.id}" style="cursor:pointer"><circle cx="${bx + 22}" cy="${by}" r="22" fill="#1565c0"/><text x="${bx + 22}" y="${by + 1}" font-size="24" text-anchor="middle" dominant-baseline="central" fill="#fff">↻</text></g>` +
        `<g data-akt="weg" data-mid="${mo.id}" style="cursor:pointer"><circle cx="${bx + 72}" cy="${by}" r="22" fill="#c62828"/><text x="${bx + 72}" y="${by + 1}" font-size="20" text-anchor="middle" dominant-baseline="central" fill="#fff">🗑</text></g>`; } }
  const gFarben = ['#ffe0b2', '#c8e6c9', '#bbdefb', '#f8bbd0', '#d1c4e9', '#fff9c4', '#b2ebf2', '#ffccbc'];
  for (const t of p.tische) {
    const sm = stuhlMass(p), sb = sm.t, cb = sm.b, chair = t.stuhl === 'unten' ? [t.w / 2 - cb / 2, t.h + 4, cb, sb] : t.stuhl === 'oben' ? [t.w / 2 - cb / 2, -sb - 4, cb, sb] : t.stuhl === 'links' ? [-sb - 4, t.h / 2 - cb / 2, sb, cb] : t.stuhl === 'rechts' ? [t.w + 4, t.h / 2 - cb / 2, sb, cb] : null;
    const txt = beschriftung(p, t.i), gr = Math.max(11, Math.min(17, Math.min(t.w, t.h) / 3.2)), fl = t.g ? gFarben[(t.g - 1) % gFarben.length] : '#efdcb6', gew = !fuerBild && festModus && festWahl === t.i;
    const tw = !fuerBild && !festModus && wahlT === t.i;
    s += `<g data-t="${t.i}" transform="translate(${m + t.x} ${m + t.y})${dreh(t)}" style="cursor:move">` + (chair ? `<rect x="${chair[0]}" y="${chair[1]}" width="${chair[2]}" height="${chair[3]}" rx="8" fill="#90a4ae"/>` : '') +
      `<rect width="${t.w}" height="${t.h}" rx="5" fill="${fl}" stroke="${gew ? '#e53935' : tw ? '#1565c0' : '#6d4c41'}" stroke-width="${gew || tw ? 6 : 2.5}"/>`;
    const teile = txt.split(' '), nr = teile[0], nm = teile.slice(1).join(' ');
    s += nm ? `<text x="${t.w / 2}" y="${t.h / 2 - gr * 0.55}" font-size="${gr}" text-anchor="middle" dominant-baseline="central" fill="#5d4037" font-weight="700">${esc(nr)}</text><text x="${t.w / 2}" y="${t.h / 2 + gr * 0.6}" font-size="${gr * 0.9}" text-anchor="middle" dominant-baseline="central" fill="#3e2723">${esc(nm.length > 10 ? nm.slice(0, 9) + '…' : nm)}</text>`
      : `<text x="${t.w / 2}" y="${t.h / 2}" font-size="${gr * 1.3}" text-anchor="middle" dominant-baseline="central" fill="#5d4037" font-weight="700">${esc(nr)}</text>`;
    s += (tw ? griff('t', t.i, t, p.einheit ? einheitBox(p, t) : undefined) : '') + '</g>';
    if (tw) { const bx = m + t.x + Math.max(t.w, t.h) + 14, by = m + t.y - 6; /* angetippt: 🗑 Tisch entfernen */
      s += `<g data-akt="tischweg" data-tid="${t.i}" style="cursor:pointer"><circle cx="${bx + 22}" cy="${by}" r="22" fill="#c62828"/><text x="${bx + 22}" y="${by + 1}" font-size="20" text-anchor="middle" dominant-baseline="central" fill="#fff">🗑</text></g>`; } }
  if (p.modus === 'gruppen') { /* Gruppennamen über jedem Gruppentisch */
    const gs = {}; for (const t of p.tische) if (t.g) { const a = gs[t.g] || (gs[t.g] = { x0: 1e9, x1: -1e9, y0: 1e9 }); a.x0 = Math.min(a.x0, t.x); a.x1 = Math.max(a.x1, t.x + t.w); a.y0 = Math.min(a.y0, t.y - (t.stuhl === 'oben' ? stuhlMass(p).t + 4 : 0)); }
    for (const [k, a] of Object.entries(gs)) s += `<text x="${m + (a.x0 + a.x1) / 2}" y="${m + a.y0 - 14}" font-size="17" text-anchor="middle" fill="#455a64" font-weight="700">Gruppe ${k}</text>`; }
  for (const k of p.kreis) { const txt = beschriftung(p, k.i), nr = txt.split(' ')[0], nm = txt.split(' ').slice(1).join(' ');
    s += `<g data-k="${k.i}" transform="translate(${m + k.x} ${m + k.y})" style="cursor:move"><circle r="${Math.max(18, stuhlMass(p).b / 2)}" fill="#90a4ae" stroke="#455a64" stroke-width="2"/><text y="${nm ? -5 : 0}" font-size="${nm ? 14 : 18}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="700">${esc(nr)}</text>` +
      (nm ? `<text y="11" font-size="11" text-anchor="middle" dominant-baseline="central" fill="#fff">${esc(nm.length > 8 ? nm.slice(0, 7) + '…' : nm)}</text>` : '') + '</g>'; }
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Segoe UI, Arial, sans-serif">${s}</svg>`, w: W, h: H, m };
}

/* ---------- Fenster ---------- */
function sichern() { const a = lesen(); a[klasse || '-'] = plan; schreiben(a); }
function laden(k) {
  klasse = k; const a = lesen(), n = namenListe().length || 28;
  plan = a[klasse || '-'] || neuerPlan(n);
  if (!a[klasse || '-'] && namenListe().length) { plan.anzahl = n; anordnen(plan, 'reihen'); }
  wahl = null; wahlT = null; festModus = false; festWahl = null;
}
function zeichnen() {
  if (!aufBox) return; const b = aufBox.querySelector('.sp-flaeche'), g = svgPlan(plan, false); b.innerHTML = g.svg;
  const svg = b.querySelector('svg'); svg.style.width = '100%'; svg.style.height = '100%'; svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  leiste();
}
function malen() { if (!aufBox) return; const b = aufBox.querySelector('.sp-flaeche'); b.innerHTML = svgPlan(plan, false).svg; const svg = b.querySelector('svg'); svg.style.width = '100%'; svg.style.height = '100%'; svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); }
function leiste() {
  const l = aufBox.querySelector('.sp-leiste'); l.innerHTML = '';
  const ks = alleKlassen.length ? alleKlassen : sortKl([klasse]);
  const k = (t, fn, on, title) => h('button', { class: 'big' + (on ? ' on' : ''), title: title || '', onclick: fn }, t);
  const tt = aufBox.querySelector('.sp-titel'); if (tt) tt.textContent = '🪑 Sitzplan – Klasse ' + klasse;
  const nf = (wert, min, max, setz, breite = 64) => h('input', { type: 'number', class: 'feld', min, max, value: wert, style: { width: breite + 'px' }, onchange: e => setz(+e.target.value) });
  l.append(
    h('div', { class: 'sp-gruppe' }, h('b', {}, 'Klasse:'), ...ks.map(x => k(x, () => { sichern(); laden(x); zeichnen(); }, x === klasse, (klassen()[x] || []).length ? 'Klassenliste vorhanden' : 'ohne Klassenliste – Tische nummeriert')),
      k('＋ Klasse', async () => { const n = await klasseNeu(); if (n) { sichern(); laden(n); zeichnen(); } }, false, 'Sitzplan für eine weitere Klasse anlegen')),
    h('div', { class: 'sp-gruppe' }, h('b', {}, 'Anordnung:'),
      k('▤ Reihen', () => { festModus = false; anordnen(plan, 'reihen'); sichern(); zeichnen(); }, plan.modus === 'reihen', 'Links 4, Gang, rechts 3 Tische je Reihe'),
      k('⊞ Gruppen', () => { anordnen(plan, 'gruppen'); sichern(); zeichnen(); }, plan.modus === 'gruppen', 'Gruppentische'),
      h('span', { class: 'sp-klein' }, 'SuS'), nf(plan.anzahl, 1, 60, v => { plan.anzahl = T.clamp(v || 1, 1, 60); anordnen(plan, plan.modus); sichern(); zeichnen(); }),
      h('span', { class: 'sp-klein' }, 'Gruppen'), nf(plan.gruppen, 1, 15, v => { plan.gruppen = T.clamp(v || 1, 1, 15); anordnen(plan, 'gruppen'); sichern(); zeichnen(); }),
      k('◯ Sitzkreis', () => { festModus = false; anordnen(plan, 'kreis'); sichern(); zeichnen(); }, plan.modus === 'kreis', 'Stühle im Kreis in der Mitte, Tische an die Wände')),
    plan.modus === 'gruppen' ? h('div', { class: 'sp-gruppe' }, h('b', {}, 'Gruppen:'),
      k(festModus ? '✋ Festlegen beenden' : '✋ Gruppen festlegen', () => { festModus = !festModus; festWahl = null;
        if (festModus && !plan.gruppenFest) { plan.gruppenFest = {}; for (const t of plan.tische) plan.gruppenFest[plan.reihenfolge[t.i]] = t.g; sichern(); }
        zeichnen(); }, festModus, 'Selbst bestimmen, wer in welche Gruppe kommt'),
      festModus ? h('span', { class: 'sp-klein' }, festWahl == null ? 'Einen Tisch antippen …' : `Tisch ${festWahl + 1} → in Gruppe:`) : '',
      ...(festModus && festWahl != null ? Array.from({ length: T.clamp(Math.round(plan.gruppen || 1), 1, 15) }, (_, j) => k('G' + (j + 1), () => inGruppe(festWahl, j + 1))) : []),
      plan.gruppenFest ? k('↺ Der Reihe nach', () => { delete plan.gruppenFest; festModus = false; festWahl = null; anordnen(plan, 'gruppen'); sichern(); zeichnen(); }, false, 'Festgelegte Gruppen aufheben – wieder der Reihe nach aus der Klassenliste') : '') : '',
    h('div', { class: 'sp-gruppe' }, h('b', {}, 'Tische:'), k('👤 Namen', () => { plan.beschriftung = 'namen'; sichern(); zeichnen(); }, plan.beschriftung !== 'nummern'), k('# Nummern', () => { plan.beschriftung = 'nummern'; sichern(); zeichnen(); }, plan.beschriftung === 'nummern'),
      k('🎲 Mischen', () => { const r = plan.reihenfolge; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } if (plan.modus === 'gruppen' && plan.gruppenFest) anordnen(plan, 'gruppen'); sichern(); zeichnen(); }, false, 'Namen zufällig auf die Tische verteilen'),
      k('↺ Liste', () => { plan.reihenfolge = [...Array(plan.tische.length).keys()]; sichern(); zeichnen(); }, false, 'Namen wieder in der Reihenfolge der Klassenliste')),
    h('div', { class: 'sp-gruppe' }, h('b', {}, 'Raum:'), k('📐 Maße: Raum, Tisch, Stuhl', masse), k('＋ Tisch', tischDazu, false, 'Einen Tisch dazu – auf einen freien Platz, dann mit dem Finger verschieben'), k('＋ Regal', () => moebel('regal', 200, 40, 'Regal')), k('＋ Schrank', () => moebel('schrank', 120, 55, 'Schrank')), k('＋ Pult', () => moebel('pult', 140, 70, 'Pult')),
      k('＋ Smartboard', () => moebel('board', 220, 14, 'Smartboard')), k('＋ Tür', () => moebel('tuer', 100, 12, 'Tür')), k('＋ Fenster', () => moebel('fenster', 160, 10, 'Fenster')),
      wahl ? k('↻ Möbel drehen', () => moebelDrehen(wahl), false, 'Um 90° drehen (auch: Doppeltipp auf das Möbelstück)') : '',
      wahl ? k('↻ 15°', () => schritt('m', wahl, 15), false, 'Um 15° weiterdrehen') : '', wahl ? k('⟲ gerade', () => schritt('m', wahl, 0), false, 'Drehung zurück auf 0°') : '',
      wahlT != null ? k(`↻ Tisch ${wahlT + 1}: 15°`, () => schritt('t', wahlT, 15), false, 'Gewählten Tisch um 15° weiterdrehen (oder am Drehgriff ziehen)') : '', wahlT != null ? k('⟲ gerade', () => schritt('t', wahlT, 0), false, 'Drehung zurück auf 0°') : '',
      wahlT != null ? k(`🗑 Tisch ${wahlT + 1} weg`, () => tischWeg(wahlT), false, 'Diesen Tisch aus dem Plan nehmen') : '',
      groesseNeu != null && plan.tische.some(t => t.i === groesseNeu) ? k('📏 Diese Tischgröße für alle', () => fuerAlle(groesseNeu), true, 'Alle Tische bekommen dieselbe Größe (jeder bleibt an seinem Platz und in seiner Richtung)') : '',
      (plan.entfernt || []).length ? k(`↺ Alle Tische (${plan.entfernt.length} weg)`, () => { delete plan.entfernt; anordnen(plan, plan.modus); sichern(); zeichnen(); }, false, 'Entfernte Tische zurückholen') : '',
      wahl ? k('🗑 Möbel weg', () => { plan.moebel = plan.moebel.filter(m => m.id !== wahl); wahl = null; sichern(); zeichnen(); }) : ''),
    teilenGruppe(k),
    h('div', { class: 'sp-gruppe' }, k('⤓ Auf die Tafel', aufTafel, false, 'Den Plan als Bild auf die Tafel legen'), k('✕ Schließen', schliessen)));
}
/* ---------- 👥 Sitzpläne teilen: „_Sitzpläne/<Klasse> – <Lehrkraft>.json“ im gemeinsamen Ordner (gemeinsam.js: F.gdir), sonst im Ablageordner.
   Fremde Dateien werden nie überschrieben oder gelöscht – „Übernehmen“ legt eine eigene Kopie an. ---------- */
const SP_ORDNER = '_Sitzpläne';
const spKann = () => { const F = T.ablage; return !!(F && (F.root || F.gemRoot) && T.opts.lehrkraft); };
const spDir = create => { const F = T.ablage; return (F.gdir || F.dir)([SP_ORDNER], create); };
const spDatei = k => T.ablage.safe(k) + ' – ' + T.ablage.safe(T.opts.lehrkraft) + '.json';
const spOrt = () => { const F = T.ablage; return F.gemRoot ? 'den gemeinsamen Ordner »' + F.gemName() + '«' : 'den Ablageordner »' + F.name() + '«'; };
let geteilt = { klasse: null, liste: [] };
async function spGeteiltLesen(k) {
  const out = []; if (!spKann()) return out; let d; try { d = await spDir(false); } catch (e) { return out; }
  for await (const [n, fh] of d.entries()) { if (fh.kind !== 'file' || !n.endsWith('.json')) continue;
    try { const j = JSON.parse(await (await fh.getFile()).text()); if (j && j.plan && Array.isArray(j.plan.tische) && j.klasse === k) out.push({ ...j, datei: n }); } catch (e) {} }
  return out.sort((a, b) => String(a.lehrkraft).localeCompare(String(b.lehrkraft), 'de'));
}
T._sitzplanGeteilt = spGeteiltLesen; /* für Tests */
function spNeuLesen() { const k = klasse; geteilt = { klasse: k, liste: geteilt.klasse === k ? geteilt.liste : [] };
  spGeteiltLesen(k).then(l => { if (klasse !== k) return; geteilt = { klasse: k, liste: l }; if (aufBox) leiste(); }).catch(() => {}); }
const spMein = () => geteilt.klasse === klasse ? geteilt.liste.find(g => g.datei === spDatei(klasse)) : null;
async function spSchreiben() {
  sichern();
  const inhalt = JSON.stringify({ app: 'Tafel-App-Sitzplan', klasse, lehrkraft: T.opts.lehrkraft, datum: new Date().toISOString(), namen: namenListe(), plan }), datei = spDatei(klasse);
  const d = await spDir(true), w = await (await d.getFileHandle(datei, { create: true })).createWritable();
  await w.write(inhalt); await w.close();
}
function teilenGruppe(k) {
  if (!spKann()) return '';
  if (geteilt.klasse !== klasse) spNeuLesen();
  const mein = spMein(), fremde = geteilt.klasse === klasse ? geteilt.liste.filter(g => g.datei !== spDatei(klasse)) : [];
  return h('div', { class: 'sp-gruppe' }, h('b', {}, 'Teilen:'),
    mein ? k('👥 Geteilt ✓', spGeteiltDialog, true, 'Dieser Plan liegt als Kopie für Kolleginnen und Kollegen bereit – antippen: neuen Stand teilen oder Teilen beenden')
      : k('👥 Teilen', spTeilen, false, 'Eine Kopie dieses Sitzplans für Kolleginnen und Kollegen bereitlegen'),
    fremde.length ? k(`📥 Geteilte Sitzpläne (${fremde.length})`, spFremdeDialog, false, 'Sitzpläne dieser Klasse von Kolleginnen und Kollegen') : '');
}
async function spTeilen() {
  if (!await T.frage(`Sitzplan der Klasse ${klasse} mit Kolleginnen und Kollegen teilen?\n\nEine Kopie kommt in ${spOrt()} (Unterordner „${SP_ORDNER}“). Der Plan enthält die Vornamen der Klassenliste – bitte nur teilen, wenn diesen Ordner ausschließlich Lehrkräfte sehen.`, { ok: '👥 Teilen' })) return;
  try { await spSchreiben(); T.toast && T.toast(`👥 Sitzplan ${klasse} ist geteilt. Neuer Stand: beim Schließen des Sitzplans oder über „👥 Geteilt ✓“.`, 3500); } catch (e) { T.toast && T.toast('Teilen fehlgeschlagen: ' + (e.message || e), 5000); }
  spNeuLesen();
}
function spGeteiltDialog() {
  const m = spMein();
  T.openDlg([h('h2', {}, `👥 Sitzplan ${klasse} – geteilt`),
    h('p', { class: 'hint' }, `Liegt in ${spOrt()}${m && m.datum ? ', Stand ' + new Date(m.datum).toLocaleString('de-DE') : ''}. Beim Schließen des Sitzplans wird der geteilte Stand automatisch aktualisiert.`),
    h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '8px' } },
      h('button', { class: 'big prim', onclick: async () => { try { await spSchreiben(); T.closeDlg(); T.toast && T.toast('👥 Neuer Stand geteilt.', 2000); } catch (e) { T.toast && T.toast('Fehlgeschlagen: ' + (e.message || e), 5000); } spNeuLesen(); } }, '🔄 Neuen Stand teilen'),
      h('button', { class: 'big warn', onclick: async () => {
        if (!await T.frage(`Sitzplan ${klasse} nicht mehr teilen?\n\nDie geteilte Kopie wird entfernt, Ihr eigener Plan bleibt.`, { ok: 'Teilen beenden' })) return;
        try { const d = await spDir(false); await d.removeEntry(spDatei(klasse)); T.closeDlg(); T.toast && T.toast('Wird nicht mehr geteilt.', 2000); } catch (e) { T.toast && T.toast('Fehlgeschlagen: ' + (e.message || e), 4000); }
        spNeuLesen(); } }, 'Teilen beenden'))]);
}
/* Namen der Kollegin auf die eigene Klassenliste abbilden (gleiche Vornamen = gleicher Platz); ohne eigene Liste bleibt die Reihenfolge */
function umordnen(p, alt, neu) {
  if (!Array.isArray(alt) || !alt.length || !neu.length) return p;
  const frei = new Map(); neu.forEach((n, j) => { if (!frei.has(n)) frei.set(n, []); frei.get(n).push(j); });
  const map = {}, benutzt = new Set();
  alt.forEach((n, i) => { const l = frei.get(n); if (l && l.length) { const j = l.shift(); map[i] = j; benutzt.add(j); } });
  const rest = [...Array(Math.max(neu.length, (p.reihenfolge || []).length)).keys()].filter(j => !benutzt.has(j));
  p.reihenfolge = (p.reihenfolge || []).map(i => map[i] != null ? map[i] : rest.length ? rest.shift() : i);
  if (p.gruppenFest) { const g = {}; for (const [i, v] of Object.entries(p.gruppenFest)) if (map[i] != null) g[map[i]] = v; p.gruppenFest = g; }
  return p;
}
function spFremdeDialog() {
  const fremde = geteilt.liste.filter(g => g.datei !== spDatei(klasse));
  const uebernehmen = async g => {
    if (lesen()[klasse || '-'] && !await T.frage(`Sie haben schon einen eigenen Sitzplan für ${klasse}.\n\nDurch den Plan von ${g.lehrkraft} ersetzen? Ihr bisheriger Plan geht dabei verloren.`, { ok: 'Ersetzen', abbrechen: 'Abbrechen' })) return;
    const p = umordnen(JSON.parse(JSON.stringify(g.plan)), g.namen, namenListe());
    plan = p; wahl = null; wahlT = null; festModus = false; festWahl = null; sichern(); T.closeDlg(); zeichnen();
    T.toast && T.toast(`📥 Sitzplan von ${g.lehrkraft} übernommen – das ist jetzt Ihre eigene Kopie.` + (namenListe().length ? '' : ' Für Namen: Classroom › 📋 Klassenliste.'), 4000);
  };
  T.openDlg([h('h2', {}, `📥 Geteilte Sitzpläne der Klasse ${klasse}`),
    h('p', { class: 'hint' }, '„Übernehmen“ legt eine eigene Kopie an. Die geteilten Pläne bleiben unverändert.'),
    h('div', { class: 'liste' }, ...fremde.map(g => h('div', { class: 'eintrag' },
      h('span', { class: 'd' }, g.datum ? new Date(g.datum).toLocaleDateString('de-DE') : ''),
      h('span', { class: 't' }, 'von ' + (g.lehrkraft || '?') + ' · ' + (g.plan.modus === 'gruppen' ? 'Gruppentische' : g.plan.modus === 'kreis' ? 'Sitzkreis' : 'Reihen') + ' · ' + g.plan.tische.length + ' Tische'),
      h('button', { class: 'big prim', onclick: () => uebernehmen(g) }, '📥 Übernehmen'))))]);
}
/* ✋ Tisch (mit seinem Namen) in eine Gruppe setzen – die Gruppentische ordnen sich neu */
function inGruppe(i, g) {
  if (!plan.gruppenFest) plan.gruppenFest = {};
  plan.gruppenFest[plan.reihenfolge[i]] = g; festWahl = null; anordnen(plan, 'gruppen'); sichern(); zeichnen();
}
/* 📏 Größe eines (gezogenen) Tisches für alle übernehmen: Breite = lange Seite, Tiefe = kurze Seite; jeder Tisch behält Mitte und Richtung */
function fuerAlle(i) {
  const v = plan.tische.find(x => x.i === i); if (!v) return;
  const b = Math.max(v.w, v.h), t = Math.min(v.w, v.h); plan.tisch = { b, t };
  for (const x of plan.tische) { const cx = x.x + x.w / 2, cy = x.y + x.h / 2, hoch = x.h > x.w; x.w = hoch ? t : b; x.h = hoch ? b : t; x.x = Math.round(cx - x.w / 2); x.y = Math.round(cy - x.h / 2); }
  groesseNeu = null; sichern(); zeichnen(); T.toast && T.toast(`Alle Tische jetzt ${b} × ${t} cm. Eine neue Anordnung (Reihen, Gruppen, Sitzkreis) rechnet mit dieser Größe.`, 3500);
}
/* ＋ Tisch: holt zuerst einen entfernten Tisch (dessen Nummer) zurück, sonst ein Tisch mehr; steht auf einem freien Platz, die anderen bleiben, wo sie sind */
function tischDazu() {
  const weg = (plan.entfernt || []).slice().sort((a, b) => a - b); let i;
  if (weg.length) { i = weg[0]; plan.entfernt = weg.slice(1); if (!plan.entfernt.length) delete plan.entfernt; }
  else { if (plan.anzahl >= 60) { T.toast && T.toast('Höchstens 60 Tische.', 2000); return; } i = Math.round(plan.anzahl); plan.anzahl = i + 1; plan.reihenfolge = plan.reihenfolge || []; while (plan.reihenfolge.length <= i) plan.reihenfolge.push(plan.reihenfolge.length); }
  const R = plan.raum, w = plan.tisch.b, hT = plan.tisch.t, st = plan.stuhl, platz = [];
  for (const t of plan.tische) platz.push({ x: t.x - 10, y: t.y - 10, w: t.w + 20, h: t.h + (t.stuhl ? st : 0) + 20 });
  for (const m of plan.moebel) platz.push({ x: m.x - 10, y: m.y - 10, w: m.w + 20, h: m.h + 20 });
  const frei = (x, y) => !platz.some(q => x < q.x + q.w && x + w > q.x && y < q.y + q.h && y + hT + st > q.y);
  let pos = null;
  for (let y = R.t - hT - st - 20; y >= 120 && !pos; y -= 10) for (let x = Math.round(R.b / 2 - w / 2), d = 0; d <= R.b / 2; d += 10) { /* von hinten nach vorne, von der Mitte nach außen */
    const a = x - d, b = x + d; if (a >= 10 && frei(a, y)) { pos = [a, y]; break; } if (b + w <= R.b - 10 && frei(b, y)) { pos = [b, y]; break; } }
  if (!pos) pos = [Math.round(R.b / 2 - w / 2), Math.round(R.t / 2)];
  plan.tische.push({ i, x: pos[0], y: pos[1], w, h: hT, stuhl: 'unten', g: 0, r: 0 });
  wahlT = i; sichern(); zeichnen();
  T.toast && T.toast(`Tisch ${i + 1} dazu – mit dem Finger an seinen Platz schieben.`, 2500);
}
/* 🗑 Tisch aus dem Plan nehmen – die Nummern der anderen bleiben; auch bei einer neuen Anordnung bleibt er weg („↺ Alle Tische“ holt ihn zurück) */
function tischWeg(i) {
  if (!plan.tische.some(x => x.i === i)) return;
  plan.tische = plan.tische.filter(x => x.i !== i); plan.kreis = plan.kreis.filter(x => x.i !== i);
  plan.entfernt = [...new Set([...(plan.entfernt || []), i])]; wahlT = null; sichern(); zeichnen();
  T.toast && T.toast(`Tisch ${i + 1} entfernt – bleibt auch bei einer neuen Anordnung weg. „↺ Alle Tische“ holt ihn zurück.`, 3500);
}
/* in 15-Grad-Schritten weiterdrehen bzw. (Schritt 0) wieder gerade stellen */
function schritt(art, id, grad) { const o = art === 't' ? plan.tische.find(x => x.i === id) : plan.moebel.find(x => x.id === id); if (!o) return; o.r = grad ? ((o.r || 0) + grad) % 360 : 0; sichern(); zeichnen(); }
/* ↻ Möbelstück um 90° drehen – um seine Mitte, bleibt im Raum */
function moebelDrehen(id) {
  const mo = plan.moebel.find(x => x.id === id); if (!mo) return;
  const cx = mo.x + mo.w / 2, cy = mo.y + mo.h / 2; [mo.w, mo.h] = [mo.h, mo.w];
  mo.x = Math.round(T.clamp(cx - mo.w / 2, 0, Math.max(0, plan.raum.b - mo.w))); mo.y = Math.round(T.clamp(cy - mo.h / 2, 0, Math.max(0, plan.raum.t - mo.h)));
  wahl = id; sichern(); zeichnen();
}
function moebel(typ, w, hh, l) { const id = 'm' + Date.now().toString(36); plan.moebel.push({ id, typ, x: plan.raum.b / 2 - w / 2, y: plan.raum.t / 2 - hh / 2, w, h: hh, l }); wahl = id; sichern(); zeichnen(); T.toast && T.toast(l + ' steht in der Mitte – mit dem Finger an seinen Platz ziehen.', 2600); }
function masse() {
  const p = plan, f = (l, w, set) => { const i = h('input', { type: 'number', class: 'feld', value: w, style: { width: '110px' } }); i.addEventListener('change', () => set(+i.value)); return h('label', { class: 'fld' }, l, i); };
  const sm = stuhlMass(p), neu = { rb: p.raum.b, rt: p.raum.t, tb: p.tisch.b, tt: p.tisch.t, st: p.stuhl, ga: p.gang || 60, sb: sm.b, sti: sm.t, einheit: !!p.einheit, eb: p.tisch.b, et: p.tisch.t + p.stuhl };
  /* zwei Arten der Eingabe: Tisch und Stuhl einzeln – oder als Einheit (zusammen ausgemessen: Breite und Tiefe vom Tisch vorne bis hinter den Stuhl) */
  const einzeln = h('div', {}, f('Tisch: Breite', neu.tb, v => neu.tb = v), f('Tisch: Tiefe', neu.tt, v => neu.tt = v), f('Platz für Stuhl und Sitzen (Tischkante bis hinter den Stuhl)', neu.st, v => neu.st = v));
  const zusammen = h('div', {}, f('Tisch + Stuhl zusammen: Breite', neu.eb, v => neu.eb = v), f('Tisch + Stuhl zusammen: Tiefe (Tisch vorne bis hinter den Stuhl)', neu.et, v => neu.et = v),
    h('p', { class: 'hint' }, 'So messen: Stuhl an den Tisch stellen, wie beim Sitzen – dann die Breite und die gesamte Tiefe messen.'));
  const zeige = () => { einzeln.style.display = neu.einheit ? 'none' : ''; zusammen.style.display = neu.einheit ? '' : 'none'; };
  const cb = h('input', { type: 'checkbox', checked: neu.einheit, onchange: e => { neu.einheit = e.target.checked; zeige(); } });
  zeige();
  T.openDlg([h('h2', {}, '📐 Raum und Möbel (in cm)'),
    f('Raum: Breite (Wand mit Smartboard)', neu.rb, v => neu.rb = v), f('Raum: Tiefe (bis zur Rückwand)', neu.rt, v => neu.rt = v),
    h('label', { class: 'fld check' }, cb, 'Tisch und Stuhl als Einheit (zusammen ausgemessen)'), einzeln, zusammen,
    f('Stuhl: Breite', neu.sb, v => neu.sb = v), f('Stuhl: Tiefe', neu.sti, v => neu.sti = v), f('Gang zwischen den Gruppentischen (mindestens)', neu.ga, v => neu.ga = v),
    h('p', { class: 'hint' }, 'Übliche Maße: Einzeltisch 70 × 50 cm, Zweiertisch 130 × 50 cm, Schulstuhl etwa 44 × 40 cm, Platz für Stuhl und Sitzen 60–75 cm. Nach „Übernehmen“ wird die aktuelle Anordnung neu aufgebaut.'),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => {
      const c = (v, a, b, d) => T.clamp(+v || d, a, b);
      const alt = { ...p.raum }; p.raum = { b: c(neu.rb, 300, 3000, 900), t: c(neu.rt, 300, 3000, 800) }; p.gang = c(neu.ga, 30, 200, 60); p.stuhlMass = { b: c(neu.sb, 25, 80, 44), t: c(neu.sti, 25, 80, 40) };
      p.einheit = !!neu.einheit;
      if (p.einheit) { /* Einheit: der Stuhl steht direkt hinter dem Tisch – Tischtiefe = Gesamttiefe − Stuhltiefe */
        const eb = c(neu.eb, 30, 250, 70), et = c(neu.et, 60, 250, 100), tt = Math.max(30, et - p.stuhlMass.t - 4);
        p.tisch = { b: eb, t: tt }; p.stuhl = et - tt;
      } else { p.tisch = { b: c(neu.tb, 30, 250, 70), t: c(neu.tt, 30, 150, 50) }; p.stuhl = c(neu.st, 20, 150, 45); if (p.stuhl < p.stuhlMass.t) p.stuhl = p.stuhlMass.t + 10; }
      /* Möbel an Rück- und Seitenwand mitnehmen */
      for (const m of p.moebel) { if (m.y + m.h >= alt.t - 70) m.y += p.raum.t - alt.t; if (m.x + m.w >= alt.b - 70) m.x += p.raum.b - alt.b; if (m.typ === 'board' && m.y < 5) m.x = p.raum.b / 2 - m.w / 2; }
      T.closeDlg(); anordnen(p, p.modus); sichern(); zeichnen(); } }, 'Übernehmen'))]);
}
function aufTafel() {
  const g = svgPlan(plan, true), r = T.viewRect ? T.viewRect() : { x0: 0, y0: 0, x1: 1200, y1: 800 }, fz = Math.min((r.x1 - r.x0) * 0.85 / g.w, (r.y1 - r.y0) * 0.85 / g.h);
  const [cx, cy] = T.viewCenter ? T.viewCenter() : [600, 400];
  T.snap && T.snap(); T.addItem({ t: 'o', id: T.uid(), k: 'sitzplanbild', d: { svg: g.svg, w: g.w, h: g.h, klasse }, x: cx - g.w * fz / 2, y: cy - g.h * fz / 2, w: g.w * fz, h: g.h * fz, r: 0 });
  T.render && T.render(); schliessen(); T.toast && T.toast('Sitzplan liegt auf der Tafel.', 2000);
}
T.BAUSTEINE.sitzplanbild = { name: 'Sitzplan (Bild)', gruppe: 'Struktur', def: { svg: '', w: 400, h: 300 }, felder: [],
  gen: d => d.svg ? { svg: d.svg, w: d.w, h: d.h } : { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#fafaf7" stroke="#37474f" stroke-width="4"/><text x="200" y="150" text-anchor="middle" font-size="28">🪑 Sitzplan</text></svg>', w: 400, h: 300 } };
function schliessen() { sichern(); if (spKann() && spMein()) spSchreiben().catch(() => {}); geteilt = { klasse: null, liste: [] }; /* geteilter Plan: neuen Stand mitnehmen */
  if (aufBox) { aufBox.remove(); aufBox = null; } document.removeEventListener('keydown', tasten); }

/* ---------- Ziehen mit dem Finger (auch Stift/Maus); Doppeltipp dreht einen Tisch ---------- */
function ziehenEinrichten(flaeche) {
  const kontakte = new Set();
  let zug = null, letzterTipp = { t: 0, id: null };
  flaeche.addEventListener('pointerdown', e => {
    const akt = e.target.closest('[data-akt]'); /* ↻ / 🗑 am gewählten Möbelstück */
    if (akt && akt.dataset.akt === 'tischweg') { e.preventDefault(); tischWeg(+akt.dataset.tid); return; }
    if (akt) { e.preventDefault(); const id = akt.dataset.mid; if (akt.dataset.akt === 'drehen') moebelDrehen(id); else { plan.moebel = plan.moebel.filter(x => x.id !== id); wahl = null; sichern(); zeichnen(); T.toast && T.toast('Möbelstück entfernt.', 1500); } return; }
    kontakte.add(e.pointerId);
    const dg = e.target.closest('[data-dreh]'); /* Drehgriff: ziehen dreht in 15-Grad-Schritten, mit einem zweiten Finger auf der Flaeche frei */
    if (dg) { e.preventDefault(); const [a, id] = dg.dataset.dreh.split(':'), obj = a === 't' ? plan.tische.find(x => String(x.i) === id) : plan.moebel.find(x => x.id === id); if (!obj) return;
      zug = { dreh: true, obj, art: a, pid: e.pointerId }; try { flaeche.setPointerCapture(e.pointerId); } catch (x) {} return; }
    const gg = e.target.closest('[data-gross]'); /* ⤡ Größe ziehen – entlang der (gedrehten) Kanten */
    if (gg) { e.preventDefault(); const [a, id] = gg.dataset.gross.split(':'), obj = a === 't' ? plan.tische.find(x => String(x.i) === id) : plan.moebel.find(x => x.id === id); const svg = flaeche.querySelector('svg'), ctm = svg && svg.getScreenCTM(); if (!obj || !ctm) return;
      zug = { gross: true, obj, art: a, pid: e.pointerId, x0: e.clientX, y0: e.clientY, w0: obj.w, h0: obj.h, k: 1 / ctm.a, einheit: a === 't' && plan.einheit && obj.stuhl ? einheitBox(plan, obj) : null }; try { flaeche.setPointerCapture(e.pointerId); } catch (x) {} return; }
    if (zug && zug.dreh) return; /* zweiter Finger beim Drehen: schaltet nur auf frei */
    const g = e.target.closest('[data-t],[data-m],[data-k]'); if (!g) { if (wahl || wahlT != null) { wahl = null; wahlT = null; zeichnen(); } return; }
    e.preventDefault(); const svg = flaeche.querySelector('svg'), ctm = svg.getScreenCTM(); if (!ctm) return;
    const art = g.dataset.t != null ? 't' : g.dataset.m != null ? 'm' : 'k', id = g.dataset.t ?? g.dataset.m ?? g.dataset.k;
    const obj = art === 't' ? plan.tische.find(x => String(x.i) === id) : art === 'm' ? plan.moebel.find(x => x.id === id) : plan.kreis.find(x => String(x.i) === id); if (!obj) return;
    if (festModus && art === 't') { /* ✋ Gruppen festlegen: Tisch antippen, dann einen Tisch der Zielgruppe (oder oben G1, G2 …) */
      const i = obj.i; if (festWahl == null) festWahl = i; else if (festWahl === i) festWahl = null; else { inGruppe(festWahl, obj.g); return; }
      zeichnen(); return; }
    const jetzt = performance.now();
    if (art === 't' && letzterTipp.id === id && jetzt - letzterTipp.t < 380) { /* Doppeltipp: Tisch um 90° drehen */
      const cx = obj.x + obj.w / 2, cy = obj.y + obj.h / 2; [obj.w, obj.h] = [obj.h, obj.w]; obj.x = cx - obj.w / 2; obj.y = cy - obj.h / 2;
      obj.stuhl = { unten: 'links', links: 'oben', oben: 'rechts', rechts: 'unten' }[obj.stuhl] || obj.stuhl; letzterTipp = { t: 0, id: null }; sichern(); zeichnen(); return; }
    if (art === 'm' && letzterTipp.id === 'm:' + id && jetzt - letzterTipp.t < 380) { moebelDrehen(id); letzterTipp = { t: 0, id: null }; return; } /* Doppeltipp: Möbel um 90° drehen */
    letzterTipp = { t: jetzt, id: art === 'm' ? 'm:' + id : id };
    if (art === 'm') { wahl = id; wahlT = null; leiste(); g.querySelector('rect').setAttribute('stroke', '#e53935'); }
    zug = { g, obj, art, x0: e.clientX, y0: e.clientY, ox: obj.x, oy: obj.y, k: 1 / ctm.a, pid: e.pointerId, bewegt: false };
    try { flaeche.setPointerCapture(e.pointerId); } catch (x) {}
  });
  flaeche.addEventListener('pointermove', e => {
    if (zug && zug.gross && e.pointerId === zug.pid) { const dx = (e.clientX - zug.x0) * zug.k, dy = (e.clientY - zug.y0) * zug.k, a = (zug.obj.r || 0) * Math.PI / 180;
      const lx = dx * Math.cos(a) + dy * Math.sin(a), ly = -dx * Math.sin(a) + dy * Math.cos(a);
      if (zug.einheit) { /* Einheit: Gesamtmaß ziehen – der Stuhl behält seine Größe, der Tisch passt sich an */
        const cd = stuhlMass(plan).t + 4, bw = Math.max(20, Math.round(zug.einheit.w + lx)), bh = Math.max(20, Math.round(zug.einheit.h + ly)), quer = zug.obj.stuhl === 'links' || zug.obj.stuhl === 'rechts';
        zug.obj.w = Math.max(10, quer ? bw - cd : bw); zug.obj.h = Math.max(8, quer ? bh : bh - cd); malen(); return; }
      zug.obj.w = Math.max(10, Math.round(zug.w0 + lx)); zug.obj.h = Math.max(8, Math.round(zug.h0 + ly)); malen(); return; }
    if (zug && zug.dreh && e.pointerId === zug.pid) { const svg = flaeche.querySelector('svg'), ctm = svg && svg.getScreenCTM(); if (!ctm) return;
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(ctm.inverse()), o = zug.obj, cx = 40 + o.x + o.w / 2, cy = 40 + o.y + o.h / 2;
      let w = Math.atan2(q.y - cy, q.x - cx) * 180 / Math.PI + 90; const frei = kontakte.size > 1; w = frei ? Math.round(w) : Math.round(w / 15) * 15; o.r = ((w % 360) + 360) % 360; malen(); return; }
    if (!zug || e.pointerId !== zug.pid) return; const dx = (e.clientX - zug.x0) * zug.k, dy = (e.clientY - zug.y0) * zug.k;
    if (!zug.bewegt && Math.hypot(dx, dy) < 4) return; zug.bewegt = true;
    zug.obj.x = Math.round(zug.ox + dx); zug.obj.y = Math.round(zug.oy + dy);
    const m = 40; zug.g.setAttribute('transform', `translate(${m + zug.obj.x} ${m + zug.obj.y})${dreh(zug.obj)}`);
  });
  const ende = e => { kontakte.delete(e.pointerId); if (!zug || e.pointerId !== zug.pid) return;
    if (zug.dreh) { zug = null; sichern(); zeichnen(); return; }
    if (zug.gross) { if (zug.art === 't') groesseNeu = zug.obj.i; zug = null; sichern(); zeichnen(); return; } /* Tisch: „für alle übernehmen“ anbieten */
    const b = zug.bewegt, art = zug.art, obj = zug.obj; zug = null; if (b) sichern();
    if (art === 'm') zeichnen(); /* Möbel: Knöpfe und Drehgriff zeigen */
    else if (art === 't' && !b) { wahlT = wahlT === obj.i ? null : obj.i; wahl = null; zeichnen(); } }; /* Tisch angetippt: Drehgriff zeigen */
  flaeche.addEventListener('pointerup', ende); flaeche.addEventListener('pointercancel', ende);
}
/* Jeder Sitzplan gehört zu einer Klasse: Klassen aus den Klassenlisten, aus der Ablage (Lehrkraft › Klasse …), der Klasse der Tafel
   und den schon gespeicherten Sitzplänen. Ohne Klasse wird zuerst gefragt. */
let alleKlassen = [];
const sortKl = a => [...new Set(a.filter(Boolean))].sort((x, y) => x.localeCompare(y, 'de', { numeric: true }));
async function klassenSammeln() {
  const F = T.ablage; let abl = [];
  try { if (F && F.root && T.opts.lehrkraft) abl = await F.klassen(T.opts.lehrkraft); } catch (e) {}
  alleKlassen = sortKl([...Object.keys(klassen()), ...abl, ...Object.keys(lesen()).filter(k => k !== '-'), (T.S.board && T.S.board.klasse) || '', klasse]);
  return alleKlassen;
}
async function klasseNeu() {
  const n = await T.frage('Für welche Klasse ist der Sitzplan?', { feld: { wert: '', platzhalter: 'z. B. 7a' }, ok: '✔ Weiter' });
  if (!n || !String(n).trim()) return null;
  const k = String(n).trim().replace(/^Klasse\s+/i, ''); alleKlassen = sortKl([...alleKlassen, k]); return k;
}
function tasten(e) { if (e.key === 'Escape' && aufBox && !document.querySelector('#modal.auf, #modal[open]')) schliessen(); }
T.sitzplan = async () => {
  if (aufBox) { aufBox.remove(); aufBox = null; }
  const ks = await klassenSammeln();
  let start = (T.S.board && T.S.board.klasse) || (ks.includes(klasse) ? klasse : '') || (ks.length === 1 ? ks[0] : '');
  if (!start) { start = await klasseNeu(); if (!start) return; }
  laden(start);
  aufBox = h('div', { id: 'sitzplanBox' }, h('div', { class: 'sp-kopf' }, h('b', { class: 'sp-titel' }, ''), h('span', { class: 'sp-hinweis' }, 'Verschieben mit dem Finger · antippen: ⟳-Griff zum Drehen (15°-Schritte, mit zweitem Finger frei) · Doppeltipp = 90° · Möbel: 🗑 entfernen'),
    h('span', { style: { flex: 1 } }), h('button', { class: 'nzu sp-x', title: 'Sitzplan schließen (wird gespeichert) – auch mit Esc', onclick: schliessen }, '✕')), h('div', { class: 'sp-leiste' }), h('div', { class: 'sp-flaeche' }));
  aufBox.addEventListener('pointerdown', e => e.stopPropagation());
  document.body.append(aufBox); ziehenEinrichten(aufBox.querySelector('.sp-flaeche')); zeichnen();
  document.removeEventListener('keydown', tasten); document.addEventListener('keydown', tasten);
  if (!namenListe().length) T.toast && T.toast(`Für Klasse ${klasse} gibt es noch keine Klassenliste – die Tische sind nummeriert. Namen: Classroom › 📋 Klassenliste.`, 4500);
};
T._sitzplan = { anordnen, neuerPlan, svgPlan, get plan() { return plan; } }; /* für Tests */
})();
