// Tafel-App – Brüche animiert (Mathe › 📘 Erklärungen › Brüche & Dezimalzahlen)
// 🍰 Erweitern & Kürzen: Streifen oder Kreis. Erweitern – in jedes Teil zeichnen sich neue Trennlinien (mehr, kleinere Teile);
//    Kürzen – je k Teile verschmelzen (weniger, größere Teile). Groß darüber die Rechnung mit Bögen „· k“ bzw. „: k“.
// 📏 Zahlenstrahl: Strahl wird gezogen, Einteilung = Hauptnenner (Teilstriche erscheinen nacheinander), dann hüpft für jeden Bruch
//    ein Punkt Teil für Teil von 0 bis zu seiner Stelle – auch über 1 hinaus (gemischte Zahl). Gleiche Stelle → Brüche übereinander.
'use strict';
(function () {
const h = T.h, NS = 'http://www.w3.org/2000/svg';
const warte = ms => new Promise(r => setTimeout(r, ms));
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const kgV = (a, b) => a / ggT(a, b) * b;
const FARBEN = ['#2563eb', '#dc2626', '#16a34a', '#ea580c', '#7c3aed', '#0891b2'];
const svgEl = (tag, attr, kinder) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attr || {})) e.setAttribute(k, v); if (kinder != null) e.textContent = kinder; return e; };
const anim = (el, frames, ms, verz = 0) => el.animate(frames, { duration: ms, delay: verz, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {});
/* Bruch als SVG-Gruppe (Zähler, Strich, Nenner), Mitte x, Bruchstrich auf Höhe y */
function bruchSvg(x, y, z, n, farbe = '#111', g = 64) {
  const gr = svgEl('g'), b = Math.max(String(z).length, String(n).length) * g * 0.32 + 12;
  gr.append(svgEl('text', { x, y: y - g * 0.18, 'text-anchor': 'middle', 'font-size': g, 'font-weight': 800, fill: farbe, 'font-family': 'Segoe UI, system-ui' }, String(z)),
    svgEl('line', { x1: x - b, y1: y, x2: x + b, y2: y, stroke: farbe, 'stroke-width': 5, 'stroke-linecap': 'round' }),
    svgEl('text', { x, y: y + g * 0.86, 'text-anchor': 'middle', 'font-size': g, 'font-weight': 800, fill: farbe, 'font-family': 'Segoe UI, system-ui' }, String(n)));
  return gr;
}
/* gemeinsame Teile der Fenster: Kopfzeile groß, Erklärzeile, Bühne */
function rahmen(titel, steuer, B, H) {
  const aufgabe = h('span', { class: 'ba-aufgabe' }), jetzt = h('span', { class: 'ba-jetzt' }), info = h('div', { class: 'ba-info' });
  const svg = svgEl('svg', { viewBox: `0 0 ${B} ${H}`, width: B, height: H, class: 'ba-svg' });
  const w = T.widget(titel, [h('div', { class: 'row', style: { gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' } }, ...steuer),
    h('div', { class: 'ba-gross' }, aufgabe, jetzt), info, h('div', { class: 'ba-wrap' }, svg)], Math.max(10, innerWidth / 2 - 480), 60);
  const wrap = w.querySelector('.ba-wrap'), passe = () => { wrap.style.zoom = String(Math.max(0.45, Math.min(1, (innerWidth - 40) / (B + 30), (innerHeight - 300) / H))); };
  passe(); addEventListener('resize', passe); const alt = w.onclose; w.onclose = () => { removeEventListener('resize', passe); alt && alt(); };
  return { w, svg, aufgabe, jetzt, info, sag: (t, f) => { info.textContent = t; info.style.borderColor = f || 'var(--acc,#4f46e5)'; }, zeig: (t, f) => { jetzt.textContent = t; jetzt.style.color = f || '#1d4ed8'; } };
}
const tempoWahl = () => { const s = h('select', { class: 'feld', title: 'Tempo' }, h('option', { value: '1.6' }, 'langsam'), h('option', { value: '1' }, 'normal'), h('option', { value: '0.6' }, 'schnell')); s.value = '1'; return s; };

/* ================= 🍰 Erweitern & Kürzen ================= */
T.bruchErweitern = () => {
  const B = 920, H = 530;
  const fZ = h('input', { class: 'feld', type: 'number', min: 0, max: 24, value: 2, style: { width: '70px' } });
  const fN = h('input', { class: 'feld', type: 'number', min: 1, max: 24, value: 3, style: { width: '70px' } });
  const fK = h('input', { class: 'feld', type: 'number', min: 2, max: 8, value: 4, style: { width: '64px' } });
  const form = h('select', { class: 'feld' }, h('option', { value: 'streifen' }, '▭ Streifen'), h('option', { value: 'kreis' }, '◔ Kreis'));
  const tempo = tempoWahl();
  const bErw = h('button', { class: 'big prim' }, '· Erweitern'), bKue = h('button', { class: 'big prim' }, ': Kürzen'), bMax = h('button', { class: 'big', title: 'Mit dem größten gemeinsamen Teiler kürzen' }, 'ganz kürzen'), bNeu = h('button', { class: 'big' }, '↺');
  const R = rahmen('🍰 Erweitern & Kürzen', [h('b', {}, 'Bruch'), fZ, h('span', {}, '/'), fN, form, bNeu, h('span', { style: { flex: 1 } }), h('b', {}, 'mit'), fK, bErw, bKue, bMax, tempo], B, H);
  const t = ms => ms * (+tempo.value || 1);
  let z = 2, n = 3, besch = false;
  const kopf = svgEl('g'), bild = svgEl('g'); R.svg.append(kopf, bild);
  const SX = 80, SY = 300, SW = 760, SH = 120, CX = 460, CY = 380, CR = 118;
  /* Form zeichnen: n Teile, z gefärbt; liefert die Trennlinien */
  function male(nn, zz) {
    bild.innerHTML = '';
    if (form.value === 'streifen') {
      for (let i = 0; i < nn; i++) bild.append(svgEl('rect', { x: SX + i * SW / nn, y: SY, width: SW / nn, height: SH, fill: i < zz ? '#93c5fd' : '#fff' }));
      for (let i = 1; i < nn; i++) bild.append(svgEl('line', { x1: SX + i * SW / nn, y1: SY, x2: SX + i * SW / nn, y2: SY + SH, stroke: '#1f2937', 'stroke-width': 3 }));
      bild.append(svgEl('rect', { x: SX, y: SY, width: SW, height: SH, fill: 'none', stroke: '#1f2937', 'stroke-width': 4 }));
    } else {
      const P = a => [CX + CR * Math.sin(a), CY - CR * Math.cos(a)];
      for (let i = 0; i < nn; i++) { const a0 = i / nn * 2 * Math.PI, a1 = (i + 1) / nn * 2 * Math.PI, [x0, y0] = P(a0), [x1, y1] = P(a1);
        bild.append(nn === 1 ? svgEl('circle', { cx: CX, cy: CY, r: CR, fill: zz ? '#93c5fd' : '#fff' }) : svgEl('path', { d: `M${CX} ${CY}L${x0} ${y0}A${CR} ${CR} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}Z`, fill: i < zz ? '#93c5fd' : '#fff' })); }
      if (nn > 1) for (let i = 0; i < nn; i++) { const [x, y] = P(i / nn * 2 * Math.PI); bild.append(svgEl('line', { x1: CX, y1: CY, x2: x, y2: y, stroke: '#1f2937', 'stroke-width': 3 })); }
      bild.append(svgEl('circle', { cx: CX, cy: CY, r: CR, fill: 'none', stroke: '#1f2937', 'stroke-width': 4 }));
    }
    const txt = svgEl('text', { x: B / 2, y: H - 14, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 700, fill: '#475569', 'font-family': 'Segoe UI, system-ui' }, `${zz} von ${nn} Teilen gefärbt`);
    bild.append(txt); return txt;
  }
  /* neue Trennlinien (Erweitern) bzw. wegfallende (Kürzen) – Positionen bei nn Teilen, ohne die der groben Einteilung (alle k) */
  function linien(nn, k, farbe) {
    const out = [];
    for (let i = 1; i < nn; i++) { if (i % k === 0) continue;
      let el;
      if (form.value === 'streifen') { const x = SX + i * SW / nn; el = svgEl('line', { x1: x, y1: SY, x2: x, y2: SY + SH, stroke: farbe, 'stroke-width': 4, 'stroke-dasharray': SH, 'stroke-dashoffset': SH }); }
      else { const a = i / nn * 2 * Math.PI; el = svgEl('line', { x1: CX, y1: CY, x2: CX + CR * Math.sin(a), y2: CY - CR * Math.cos(a), stroke: farbe, 'stroke-width': 4, 'stroke-dasharray': CR, 'stroke-dashoffset': CR }); }
      bild.append(el); out.push(el); }
    return out;
  }
  function kopfMalen(z1, n1, z2, n2, op, k) {
    kopf.innerHTML = ''; kopf.append(bruchSvg(z2 == null ? B / 2 : 300, 120, z1, n1));
    if (z2 == null) return;
    const farbe = op === '·' ? '#2563eb' : '#16a34a';
    const bogen = (oben) => { const y = oben ? 40 : 205, q = oben ? -6 : 251; const p = svgEl('path', { d: `M345 ${y} Q450 ${q} 555 ${y}`, fill: 'none', stroke: farbe, 'stroke-width': 4, 'marker-end': 'url(#baPfeil' + farbe.slice(1) + ')' });
      const tx = svgEl('text', { x: 450, y: oben ? 78 : 196, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, fill: farbe, 'font-family': 'Segoe UI, system-ui' }, `${op} ${k}`); return [p, tx]; };
    if (!R.svg.querySelector('#baPfeil' + farbe.slice(1))) { const d = svgEl('defs'); const m = svgEl('marker', { id: 'baPfeil' + farbe.slice(1), viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }); m.append(svgEl('path', { d: 'M0 0L10 5L0 10z', fill: farbe })); d.append(m); R.svg.prepend(d); }
    const teile = [...bogen(true), ...bogen(false), svgEl('text', { x: 450, y: 140, 'text-anchor': 'middle', 'font-size': 64, 'font-weight': 800, fill: '#111' }, '=')];
    const neuB = bruchSvg(600, 120, z2, n2, farbe);
    kopf.append(...teile, neuB);
    return { teile, neuB };
  }
  function start() {
    if (besch) return;
    n = T.clamp(Math.round(+fN.value || 1), 1, 24); z = T.clamp(Math.round(+fZ.value || 0), 0, n); fN.value = n; fZ.value = z;
    kopfMalen(z, n); male(n, z); R.aufgabe.textContent = `${z}/${n}`; R.zeig('Erweitern oder kürzen?', '#475569');
    R.sag('Erweitern: Zähler und Nenner mit derselben Zahl malnehmen. Kürzen: beide durch dieselbe Zahl teilen. Der Wert bleibt gleich.');
  }
  async function erweitern() {
    const k = T.clamp(Math.round(+fK.value || 2), 2, 8); if (n * k > 48) { R.sag('Das werden zu viele Teile (höchstens 48). Kleinere Zahl wählen.', '#dc2626'); return; }
    besch = true;
    R.zeig(`Erweitern mit ${k}: ${z}·${k} / ${n}·${k}`, '#2563eb');
    R.sag(`Jedes der ${n} Teile wird in ${k} gleiche Teile geteilt – es entstehen mehr, aber kleinere Teile.`);
    const k2 = kopfMalen(z, n, z * k, n * k, '·', k); k2.teile.forEach(e => { e.style.opacity = 0; }); k2.neuB.style.opacity = 0;
    await Promise.all(k2.teile.map((e, i) => anim(e, [{ opacity: 0 }, { opacity: 1 }], t(400), t(i * 120))));
    const neu = linien(n * k, k, '#2563eb');
    await Promise.all(neu.map((e, i) => anim(e, [{ strokeDashoffset: e.getAttribute('stroke-dasharray') }, { strokeDashoffset: 0 }], t(500), t(i * Math.max(40, 500 / neu.length)))));
    await anim(k2.neuB, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], t(500));
    z *= k; n *= k; await warte(t(300)); male(n, z);
    R.aufgabe.textContent = `${z / k}/${n / k} = ${z}/${n}`; R.zeig('✓ gleich viel gefärbt – Wert gleich', '#16a34a');
    R.sag(`Gleich viel gefärbt: ${z / k} von ${n / k} Teilen = ${z} von ${n} Teilen. Der Wert bleibt gleich.`, '#16a34a');
    fZ.value = z; fN.value = n; besch = false;
  }
  async function kuerzen(kWahl) {
    const k = kWahl || T.clamp(Math.round(+fK.value || 2), 2, 24);
    if (n % k || z % k) { R.zeig(`Durch ${k} geht nicht!`, '#dc2626'); R.sag(`${z} und ${n} sind nicht beide durch ${k} teilbar. ` + (ggT(z, n) > 1 ? `Ein gemeinsamer Teiler ist z. B. ${ggT(z, n)}.` : `${z}/${n} lässt sich gar nicht kürzen – er ist schon ganz gekürzt.`), '#dc2626'); return; }
    besch = true;
    R.zeig(`Kürzen durch ${k}: ${z}:${k} / ${n}:${k}`, '#16a34a');
    R.sag(`Je ${k} Teile werden zu einem Teil zusammengefasst – es entstehen weniger, aber größere Teile.`);
    const k2 = kopfMalen(z, n, z / k, n / k, ':', k); k2.teile.forEach(e => { e.style.opacity = 0; }); k2.neuB.style.opacity = 0;
    await Promise.all(k2.teile.map((e, i) => anim(e, [{ opacity: 0 }, { opacity: 1 }], t(400), t(i * 120))));
    const weg = linien(n, k, '#dc2626'); weg.forEach(e => e.setAttribute('stroke-dashoffset', 0));
    await Promise.all(weg.map(e => anim(e, [{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }], t(500))));
    await warte(t(300));
    await Promise.all(weg.map((e, i) => anim(e, [{ opacity: 1 }, { opacity: 0 }], t(500), t(i * Math.max(30, 400 / weg.length)))));
    await anim(k2.neuB, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], t(500));
    z /= k; n /= k; await warte(t(300)); male(n, z);
    R.aufgabe.textContent = `${z * k}/${n * k} = ${z}/${n}`; R.zeig('✓ gleich viel gefärbt – Wert gleich', '#16a34a');
    R.sag(ggT(z, n) === 1 ? `Gleich viel gefärbt: ${z * k}/${n * k} = ${z}/${n}. ${z}/${n} ist ganz gekürzt (kein gemeinsamer Teiler außer 1).` : `Gleich viel gefärbt. ${z}/${n} lässt sich noch weiter kürzen (z. B. durch ${ggT(z, n)}).`, '#16a34a');
    fZ.value = z; fN.value = n; besch = false;
  }
  bErw.onclick = () => { if (!besch) erweitern(); };
  bKue.onclick = () => { if (!besch) kuerzen(); };
  bMax.onclick = () => { if (besch) return; const g = ggT(z, n); if (g < 2) { R.zeig(`${z}/${n} ist schon ganz gekürzt`, '#16a34a'); R.sag('Zähler und Nenner haben keinen gemeinsamen Teiler außer 1.'); return; } fK.value = g; kuerzen(g); };
  bNeu.onclick = start; [fZ, fN].forEach(f => f.addEventListener('change', start)); form.addEventListener('change', () => { if (!besch) male(n, z); });
  start();
  return R.w;
};

/* ================= 📏 Brüche am Zahlenstrahl ================= */
T.bruchStrahlAnim = () => {
  const B = 940, H = 430;
  const fB = h('input', { class: 'feld', value: '3/4; 1/2; 5/4', style: { width: '240px', fontSize: '20px' }, placeholder: 'z. B. 1/3; 3/4; 1 1/2' });
  const tempo = tempoWahl(), weiter = h('button', { class: 'big prim' }, 'Weiter ▶'), alles = h('button', { class: 'big' }, '▶▶ Alles'), neu = h('button', { class: 'big' }, '↺ Neu');
  const R = rahmen('📏 Brüche am Zahlenstrahl', [h('b', {}, 'Brüche'), fB, neu, h('span', { style: { flex: 1 } }), tempo, weiter, alles], B, H);
  const t = ms => ms * (+tempo.value || 1);
  let L = null, k = 0, besch = false;
  const X0 = 60, YA = 300;
  function lies() {
    const out = [];
    for (const roh of fB.value.split(/[;,]/)) { const s = roh.trim(); if (!s) continue; let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/), zz, nn;
      if (m) { nn = +m[3]; zz = +m[1] * nn + +m[2]; } else if ((m = s.match(/^(\d+)\s*\/\s*(\d+)$/))) { zz = +m[1]; nn = +m[2]; } else if ((m = s.match(/^(\d+)$/))) { zz = +m[1]; nn = 1; } else continue;
      if (nn >= 1 && nn <= 24 && zz / nn <= 5) out.push({ z: zz, n: nn }); }
    return out.slice(0, 6);
  }
  function start() {
    if (besch) return;
    const br = lies(); if (!br.length) { R.sag('Bitte Brüche eingeben, z. B. 3/4; 1/2; 5/4 (gemischt: 1 1/2).', '#dc2626'); return; }
    const HN = br.reduce((a, b) => kgV(a, b.n), 1), E = Math.max(1, Math.ceil(Math.max(...br.map(b => b.z / b.n)) - 1e-9)), U = Math.min(400, (B - X0 - 80) / E);
    L = { br, HN, E, U, stapel: {} }; k = 0; R.svg.innerHTML = '';
    R.aufgabe.textContent = br.map(b => `${b.z}/${b.n}`).join('   '); R.zeig('am Zahlenstrahl eintragen', '#475569');
    R.sag('„Weiter ▶“: Schritt für Schritt – Strahl zeichnen, einteilen, Brüche abzählen.');
    weiter.disabled = alles.disabled = false;
  }
  const X = v => X0 + v * L.U;
  const text = (x, y, s, gr, f, fett = 700) => svgEl('text', { x, y, 'text-anchor': 'middle', 'font-size': gr, 'font-weight': fett, fill: f || '#111', 'font-family': 'Segoe UI, system-ui' }, s);
  /* Schritte */
  async function strahl() {
    R.zeig('1. Zahlenstrahl mit den Ganzen', '#1d4ed8'); R.sag(`Von 0 bis ${L.E}: Ein Ganzes ist der Abstand von 0 bis 1.`);
    const linie = svgEl('line', { x1: X0, y1: YA, x2: X(L.E) + 40, y2: YA, stroke: '#111', 'stroke-width': 4, 'stroke-linecap': 'round' }); R.svg.append(linie);
    const len = X(L.E) + 40 - X0; linie.setAttribute('stroke-dasharray', len); await anim(linie, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], t(800));
    R.svg.append(svgEl('path', { d: `M${X(L.E) + 52} ${YA} l-16 -9 v18 z`, fill: '#111' }));
    for (let v = 0; v <= L.E; v++) { const g = svgEl('g'); g.append(svgEl('line', { x1: X(v), y1: YA - 20, x2: X(v), y2: YA + 20, stroke: '#111', 'stroke-width': 4 }), text(X(v), YA + 56, String(v), 34)); R.svg.append(g); await anim(g, [{ opacity: 0 }, { opacity: 1 }], t(300)); }
    const band = svgEl('rect', { x: X(0), y: YA - 14, width: L.U, height: 28, fill: '#fde68a', opacity: 0.6, rx: 6 }); R.svg.insertBefore(band, R.svg.firstChild);
    await anim(band, [{ opacity: 0 }, { opacity: 0.6 }, { opacity: 0.6 }, { opacity: 0 }], t(1400));
  }
  async function einteilen() {
    const nn = [...new Set(L.br.map(b => b.n))].sort((a, b) => a - b);
    R.zeig(nn.length > 1 ? `2. Nenner ${nn.join(', ')} → Hauptnenner ${L.HN}` : `2. Nenner ${nn[0]} → ${L.HN} Teile`, '#7c3aed');
    R.sag(`Jedes Ganze wird in ${L.HN} gleiche Teile geteilt. 1 Teil = 1/${L.HN}.` + (nn.length > 1 ? ` (${L.HN} ist die kleinste Zahl, in der ${nn.slice(0, -1).join(', ')} und ${nn[nn.length - 1]} aufgehen.)` : ''), '#7c3aed');
    if (L.HN === 1) return;
    for (let v = 0; v < L.E; v++) for (let i = 1; i < L.HN; i++) {
      const x = X(v + i / L.HN), g = svgEl('g'); g.append(svgEl('line', { x1: x, y1: YA - 11, x2: x, y2: YA + 11, stroke: '#7c3aed', 'stroke-width': 3 }));
      if (v === 0 && L.U / L.HN >= 34) g.append(text(x, YA + 40, `${i}/${L.HN}`, 15, '#7c3aed', 600)); /* nur, wenn genug Platz */
      R.svg.append(g); anim(g, [{ opacity: 0, transform: `translateY(-12px)` }, { opacity: 1, transform: 'translateY(0)' }], t(250)); await warte(t(Math.max(25, 260 / L.HN)));
    }
    await warte(t(400));
  }
  async function eintragen(i) {
    const b = L.br[i], f = FARBEN[i % FARBEN.length], schritte = b.z * (L.HN / b.n), x1 = X(b.z / b.n);
    const ganz = Math.floor(b.z / b.n), rest = b.z % b.n, gem = b.z > b.n && b.n > 1 && rest ? ` = ${ganz} ${rest}/${b.n}` : b.z % b.n === 0 && b.n > 1 ? ` = ${b.z / b.n}` : '';
    R.zeig(`${b.z}/${b.n}` + (b.n !== L.HN ? ` = ${schritte}/${L.HN}` : '') + `  →  ${schritte} Teile weit` + gem, f);
    R.sag(`${b.z}/${b.n}: Von 0 aus ${schritte} kleine Teile weit hüpfen` + (b.n !== L.HN ? ` (${b.z}/${b.n} = ${schritte}/${L.HN}, erweitert mit ${L.HN / b.n})` : '') + (b.z > b.n ? ' – über die 1 hinaus.' : '.'), f);
    const punkt = svgEl('circle', { cx: X(0), cy: YA, r: 11, fill: f, stroke: '#fff', 'stroke-width': 3 }); R.svg.append(punkt);
    const zahl = text(X(0), YA - 62, '0', 26, f, 800); R.svg.append(zahl);
    const dt = Math.max(90, Math.min(380, 2600 / schritte));
    for (let s = 1; s <= schritte; s++) {
      const xa = X((s - 1) / L.HN), xb = X(s / L.HN), bog = svgEl('path', { d: `M${xa} ${YA - 8} Q${(xa + xb) / 2} ${YA - 44} ${xb} ${YA - 8}`, fill: 'none', stroke: f, 'stroke-width': 2.5, opacity: 0.7 });
      R.svg.append(bog);
      await anim(punkt, [{ transform: `translate(${xa - X(0)}px,0)` }, { transform: `translate(${(xa + xb) / 2 - X(0)}px,-30px)` }, { transform: `translate(${xb - X(0)}px,0)` }], t(dt));
      zahl.textContent = `${s}/${L.HN}`; zahl.setAttribute('x', xb);
    }
    await warte(t(300)); zahl.remove();
    /* Beschriftung: gleiche Stelle → übereinander */
    const key = b.z * (L.HN / b.n), ebene = L.stapel[key] || 0; L.stapel[key] = ebene + 1;
    const lab = bruchSvg(x1, YA - 120 - ebene * 92, b.z, b.n, f, 34); R.svg.append(lab);
    if (gem) R.svg.append(text(x1 + 70, YA - 98 - ebene * 92, gem.slice(3), 26, f, 800));
    R.svg.append(svgEl('line', { x1: x1, y1: YA - 14, x2: x1, y2: YA - 82 - ebene * 92 + 40, stroke: f, 'stroke-width': 2, 'stroke-dasharray': '5 5' }));
    await anim(lab, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], t(400));
    if (ebene) R.sag(`${b.z}/${b.n} liegt an derselben Stelle wie ein anderer Bruch – sie sind gleichwertig (gleich groß).`, f);
  }
  async function naechster() {
    if (besch || !L) return; const n = 2 + L.br.length; if (k >= n) return;
    besch = true; weiter.disabled = alles.disabled = true;
    try { if (k === 0) await strahl(); else if (k === 1) await einteilen(); else await eintragen(k - 2); k++; } finally { besch = false; }
    if (k >= n) { R.zeig('✓ alle eingetragen', '#16a34a'); R.sag('Merke: Der Nenner sagt, in wie viele Teile ein Ganzes geteilt wird – der Zähler, wie viele Teile man weitergeht.', '#16a34a'); }
    else weiter.disabled = alles.disabled = false;
  }
  weiter.onclick = () => naechster();
  alles.onclick = async () => { while (L && k < 2 + L.br.length && R.w.isConnected) { await naechster(); await warte(t(400)); } };
  neu.onclick = start; fB.addEventListener('change', start);
  start();
  return R.w;
};

document.head.append(Object.assign(document.createElement('style'), { textContent:
  '.ba-gross{display:flex;align-items:baseline;gap:24px;flex-wrap:wrap;margin:0 0 6px;padding:6px 14px;background:#fff;color:#111;border:1px solid #cbd5e1;border-radius:14px}'
  + '.ba-aufgabe{font:800 40px "Segoe UI",system-ui}.ba-jetzt{font:700 32px "Segoe UI",system-ui}'
  + '.ba-info{margin:0 0 8px;padding:8px 12px;border-left:5px solid var(--acc,#4f46e5);background:var(--surface2,#f1f5f9);border-radius:8px;font:600 19px system-ui;min-height:28px}'
  + '.ba-svg{background:#fff;border:1px solid #cbd5e1;border-radius:14px;display:block}.ba-svg g,.ba-svg circle,.ba-svg text{transform-box:fill-box;transform-origin:center}' }));
})();
