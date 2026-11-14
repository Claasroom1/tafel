// Tafel-App – Vorlagen-Grundlagen (gemeinsam für Lehrkräfte- und Schüler-Version): Zeichenhilfen für Schreib-Vorlagen,
// ↔ ↕ Seitengriffe (Vorlage breiter/höher ziehen, Felder wachsen mit) und Einfügen. Vorlagen melden sich mit T.VL.dehnen[k] = (d, dy) => {…} an.
'use strict';
(function () {
const B = T.BAUSTEINE; if (!B || !T._svg) return;
const { doc } = T._svg;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nachDemZeichnen = [];
new MutationObserver(() => nachDemZeichnen.forEach(fn => fn())).observe(document.body, { childList: true, subtree: true });
const TINTE = '#1a1a1a', BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', LILA = '#6a1b9a', LINIE = '#94a3b8', RAND = '#3a6d99';
const t = (x, y, s, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(s)}</text>`;
const fett = 'font-weight="700"';
const linien = (x0, x1, y, n, abst) => { let s = ''; for (let i = 0; i < n; i++) s += `<line x1="${f(x0)}" y1="${f(y + i * abst)}" x2="${f(x1)}" y2="${f(y + i * abst)}" stroke="${LINIE}" stroke-width="1.5"/>`; return s; };
const kasten = (x, y, w, h, col, fuell = 'none', r = 12) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${col}" stroke-width="2.5"/>`;
const blatt = (W, H, inhalt) => doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="#ffffff" stroke="${RAND}" stroke-width="2"/>` + inhalt);
// Kopf: Thema (getippt oder Linie) und Datum (Linie)
const kopf = (d, W, art) => t(30, 40, art, 20, RAND, fett) +
  t(30, 88, 'Thema:', 24, TINTE, fett) + (d.thema ? t(122, 88, d.thema, 26, TINTE, fett) : `<line x1="122" y1="104" x2="${W - 290}" y2="104" stroke="${LINIE}" stroke-width="1.5"/>`) +
  t(W - 270, 88, 'Datum:', 24, TINTE, fett) + `<line x1="${W - 180}" y1="104" x2="${W - 30}" y2="104" stroke="${LINIE}" stroke-width="1.5"/>`;
const ABST = 46; /* Zeilenabstand zum Schreiben mit Stift oder Finger */
const anz = (d, lo, hi, std) => Math.round(T.clamp(+d.zeilen || std, lo, hi));
const breite = (d, std) => Math.round(T.clamp(+d.bw || std, 700, 2600)); /* an der rechten Seite ziehen = breiter (Felder wachsen mit) */
const THEMA = { k: 'thema', l: 'Thema (leer = Linie zum Schreiben)', typ: 'text' };

// Bausteine aus Abschnitten: je Abschnitt Überschrift + Schreiblinien (oder ein leeres Feld zum Zeichnen)
const abschnitte = (W, y, liste) => { let s = '';
  for (const [titel, col, n, leerHoehe] of liste) {
    const hh = leerHoehe || 50 + n * ABST;
    s += kasten(20, y, W - 40, hh, col) + t(36, y + 26, titel, 21, col, fett);
    if (!leerHoehe) s += linien(36, W - 36, y + 50 + ABST * 0.8, n, ABST);
    y += hh + 16; }
  return { s, y }; };
const kopfFelder = (W, y, felder) => { let s = ''; /* „Beschriftung: ______“ in Reihen zu zwei */
  felder.forEach((l, i) => { const x = i % 2 ? W / 2 + 10 : 30, yy = y + Math.floor(i / 2) * 52, xe = i % 2 ? W - 30 : W / 2 - 20, lw = l.length * 12 + 18;
    s += t(x, yy, l + ':', 22, TINTE, fett) + `<line x1="${f(x + lw)}" y1="${yy + 16}" x2="${f(xe)}" y2="${yy + 16}" stroke="${LINIE}" stroke-width="1.5"/>`; });
  return { s, y: y + Math.ceil(felder.length / 2) * 52 + 10 }; };
const vorlage = (k, name, art, felder, teile) => {
  B[k] = { name, gruppe: 'Struktur', def: {}, felder: [],
    gen: d => { const W = breite(d, 1000); let s = t(30, 40, art, 20, RAND, fett); const kf = kopfFelder(W, 84, felder); s += kf.s;
      const mehr = Math.max(0, Math.round(+d.mehr || 0)), gross = teile.reduce((m, x, i) => x[2] > teile[m][2] ? i : m, 0); /* unten ziehen = mehr Zeilen im größten Abschnitt */
      const a = abschnitte(W, kf.y, teile.map((x, i) => i === gross ? [x[0], x[1], x[2] + mehr, x[3]] : x)); s += a.s; const H = a.y + 4; return { svg: blatt(W, H, s), w: W, h: H }; } }; };

// ↔ ↕ Seitengriffe: Vorlage gewählt → rechts ziehen = breiter, unten ziehen = höher (mehr Zeilen bzw. größere Felder).
// Die Vorlage wird dabei neu gezeichnet, nicht gezoomt – Schrift und Linien behalten ihre Größe, die Felder wachsen.
const zeilenNeu = (lo, hi, std, px) => (d, dy) => ({ zeilen: Math.round(T.clamp((+d.zeilen || std) + Math.round(dy / px), lo, hi)) });
const DEHNEN = {};
{
  const griff = (sym, cur, titel) => Object.assign(document.createElement('div'), { className: 'ms-griff', textContent: sym, title: titel, style: `cursor:${cur}` });
  const gR = griff('↔', 'ew-resize', 'Breiter / schmaler ziehen'), gU = griff('↕', 'ns-resize', 'Höher / niedriger ziehen'), rahmen = Object.assign(document.createElement('div'), { className: 'ms-rahmen' });
  document.body.append(gR, gU, rahmen);
  document.head.append(Object.assign(document.createElement('style'), { textContent:
    '.ms-griff{position:fixed;z-index:30;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:#1565c0;color:#fff;font:700 22px system-ui;display:none;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);touch-action:none;user-select:none}' +
    '.ms-rahmen{position:fixed;z-index:29;display:none;border:3px dashed #1565c0;border-radius:12px;pointer-events:none}' }));
  let ziehe = null;
  const gewaehlt = () => { const S = T.S; if (!S || !S.board) return null; let pg = null; try { pg = T.page(); } catch (e) { return null; } if (!S || !S.sel || !S.sel.ids || S.sel.ids.size !== 1 || !pg) return null;
    const id = [...S.sel.ids][0], o = pg.items.find(i => i.id === id); return o && o.t === 'o' && o.k in DEHNEN && !o.r && !o.fest ? o : null; };
  const schirm = (x, y) => { const v = T.page().view; return [x * v.z + v.x + T.ox, y * v.z + v.y]; };
  const platzieren = () => {
    const o = ziehe ? null : gewaehlt();
    for (const g of [gR, gU]) if (!ziehe) g.style.display = o ? 'flex' : 'none';
    if (!o) return;
    const [rx, ry] = schirm(o.x + o.w, o.y + o.h / 2), [ux, uy] = schirm(o.x + o.w / 2, o.y + o.h);
    gR.style.left = rx + 'px'; gR.style.top = ry + 'px'; gU.style.left = ux + 'px'; gU.style.top = uy + 'px';
  };
  let geplant = 0; const bald = () => { if (!geplant) geplant = requestAnimationFrame(() => { geplant = 0; platzieren(); }); };
  for (const n of ['render', 'renderOver']) { const alt = T[n]; if (alt) T[n] = (...a) => { const r = alt(...a); bald(); return r; }; }
  addEventListener('pointerup', bald); addEventListener('wheel', bald, { passive: true }); addEventListener('resize', bald);
  const start = (art, e) => {
    const o = gewaehlt(); if (!o) return; e.preventDefault(); e.stopPropagation(); e.target.setPointerCapture(e.pointerId);
    const g0 = T.genObj(o.k, { ...B[o.k].def, ...o.d }, false), z = T.page().view.z;
    ziehe = { art, o, g0, k: o.w / g0.w, z, sx: e.clientX, sy: e.clientY, el: e.target };
    const [x0, y0] = schirm(o.x, o.y); Object.assign(rahmen.style, { display: 'block', left: x0 + 'px', top: y0 + 'px', width: o.w * z + 'px', height: o.h * z + 'px' });
  };
  const bewege = e => { if (!ziehe) return; e.stopPropagation(); const { art, o, z } = ziehe;
    if (art === 'r') { const w = Math.max(80, o.w * z + e.clientX - ziehe.sx); rahmen.style.width = w + 'px'; ziehe.el.style.left = (parseFloat(rahmen.style.left) + w) + 'px'; }
    else { const hgt = Math.max(80, o.h * z + e.clientY - ziehe.sy); rahmen.style.height = hgt + 'px'; ziehe.el.style.top = (parseFloat(rahmen.style.top) + hgt) + 'px'; } };
  const ende = e => { if (!ziehe) return; e.stopPropagation(); const { art, o, g0, k, z } = ziehe; ziehe = null; rahmen.style.display = 'none';
    const dPx = (art === 'r' ? (parseFloat(rahmen.style.width) - o.w * z) : (parseFloat(rahmen.style.height) - o.h * z)) / z / k; /* Änderung in Vorlagen-Pixeln */
    if (Math.abs(dPx) < 8) { bald(); return; }
    const patch = art === 'r' ? { bw: Math.round(T.clamp(g0.w + dPx, 700, 2600)) } : DEHNEN[o.k]({ ...B[o.k].def, ...o.d }, dPx);
    T.bausteinAendern(T.page().items.find(i => i.id === o.id) || o, { f: dd => ({ d: { ...dd, ...patch } }) }); T.changed && T.changed(); bald(); };
  for (const [g, art] of [[gR, 'r'], [gU, 'u']]) { g.addEventListener('pointerdown', e => start(art, e)); g.addEventListener('pointermove', bewege); g.addEventListener('pointerup', ende); g.addEventListener('pointercancel', ende); }
}

const einfuegen = k => {
  const d = { ...B[k].def }, g = T.genObj(k, d, false), z = 1 / T.page().view.z, [cx, cy] = T.viewCenter();
  T.snap(); const it = T.addItem({ t: 'o', k, d, x: cx - g.w * z / 2, y: cy - g.h * z / 2, w: g.w * z, h: g.h * z, r: 0 });
  T.nachEinfuegen && T.nachEinfuegen([it.id]); T.toast && T.toast('Eingefügt – mit dem Stift hineinschreiben; „✏️ Bearbeiten“: Thema, Zeilen', 2600);
};
const bild = k => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj(k, { ...B[k].def }, false).svg);
T.VL = { f, esc, t, fett, linien, kasten, blatt, kopf, ABST, anz, breite, THEMA, kopfFelder, abschnitte, vorlage, zeilenNeu, dehnen: DEHNEN, einfuegen, bild, nachDemZeichnen,
  farben: { TINTE, BLAU, GRUEN, ORANGE, LILA, LINIE, RAND } };
})();
