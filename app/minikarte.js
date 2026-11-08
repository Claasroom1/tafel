// Tafel-App – Übersichtskarte: Die Tafel ist unendlich groß. Beim Verschieben/Zoomen erscheint unten rechts eine kleine Karte
// mit allem, was auf der Seite steht, und dem sichtbaren Ausschnitt als Rahmen. Antippen oder Ziehen in der Karte springt dorthin.
// ⚙ Einstellungen: „Übersichtskarte immer zeigen“ (T.opts.karteImmer).
'use strict';
(function () {
const S = T.S, W = 220, H = 140, PAD = 8;
const cv = T.h('canvas', { width: W * T.dpr, height: H * T.dpr, style: { width: W + 'px', height: H + 'px' } }), ctx = cv.getContext('2d');
const box = T.h('div', { id: 'minikarte', title: 'Übersicht der Seite – antippen oder ziehen: dorthin springen' }, cv);
document.body.append(box);
let altView = '', ausTimer = 0, skala = null;

// Umfang: alles auf der Seite plus der sichtbare Ausschnitt
function umfang(pg) {
  const r = T.viewRect(); let x0 = r.x0, y0 = r.y0, x1 = r.x1, y1 = r.y1;
  for (const it of pg.items) { const b = T.bbox(it); if (b.x0 < x0) x0 = b.x0; if (b.y0 < y0) y0 = b.y0; if (b.x1 > x1) x1 = b.x1; if (b.y1 > y1) y1 = b.y1; }
  const m = Math.max(x1 - x0, y1 - y0) * 0.04; return { x0: x0 - m, y0: y0 - m, x1: x1 + m, y1: y1 + m, r };
}
function zeichne() {
  const pg = T.page(), u = umfang(pg), d = T.dpr;
  const k = Math.min((W - 2 * PAD) / (u.x1 - u.x0), (H - 2 * PAD) / (u.y1 - u.y0));
  const ox = PAD + ((W - 2 * PAD) - (u.x1 - u.x0) * k) / 2 - u.x0 * k, oy = PAD + ((H - 2 * PAD) - (u.y1 - u.y0) * k) / 2 - u.y0 * k;
  skala = { k, ox, oy };
  const dunkel = T.isDark(pg);
  ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = dunkel ? 'rgba(40,46,56,.92)' : 'rgba(255,255,255,.94)'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(d * k, 0, 0, d * k, d * ox, d * oy);
  const ink = dunkel ? 'rgba(255,255,255,.75)' : 'rgba(30,40,60,.7)';
  for (const it of pg.items) {
    if (it.t === 's') { // Handschrift vereinfacht (jeder n-te Punkt)
      const p = it.p; if (!p.length) continue; const st = Math.max(1, Math.floor(p.length / 12));
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = st; i < p.length; i += st) ctx.lineTo(p[i][0], p[i][1]); ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
      ctx.globalAlpha = it.m === 'hl' ? 0.5 : 1; ctx.strokeStyle = T.inkColor(it.c, dunkel) || ink; ctx.lineWidth = Math.max(it.w, 1.6 / k); ctx.stroke();
    } else { const b = T.bbox(it); ctx.fillStyle = it.k === 'bild' ? 'rgba(91,91,214,.5)' : dunkel ? 'rgba(255,255,255,.38)' : 'rgba(91,91,214,.32)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
  }
  ctx.globalAlpha = 1;
  // sichtbarer Ausschnitt
  const r = u.r; ctx.strokeStyle = '#ff6d00'; ctx.lineWidth = 2.5 / k; ctx.fillStyle = 'rgba(255,109,0,.08)';
  ctx.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); ctx.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
}
function zeigen(an) { box.classList.toggle('auf', an); }
T.miniKarte = () => {
  if (!S.board) { zeigen(false); return; }
  const v = T.page().view, key = S.page + '|' + v.x.toFixed(1) + '|' + v.y.toFixed(1) + '|' + v.z.toFixed(4) + '|' + T.ox;
  const erstes = !altView, bewegt = key !== altView; altView = key;
  if (erstes && !T.opts.karteImmer) return; // beim Öffnen der Tafel nicht aufblitzen
  if (T.opts.karteImmer) { zeichne(); zeigen(true); return; }
  if (!bewegt) { if (box.classList.contains('auf')) zeichne(); return; } // Inhalt geändert, Karte offen: mitzeichnen
  zeichne(); zeigen(true);
  clearTimeout(ausTimer); ausTimer = setTimeout(() => { if (!halten) zeigen(false); }, 2500);
};
// Antippen/Ziehen in der Karte: Ausschnitt dorthin (Mitte des Ausschnitts = angetippte Stelle)
let halten = false;
const springe = e => {
  if (!skala) return; const b = cv.getBoundingClientRect(), wx = (e.clientX - b.left - skala.ox) / skala.k, wy = (e.clientY - b.top - skala.oy) / skala.k;
  const v = T.page().view, bw = T.W - T.ox, bh = T.H;
  v.x = bw / 2 - wx * v.z; v.y = bh / 2 - wy * v.z; T.render(); T.renderOver(); T.onZoom && T.onZoom();
};
box.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); halten = true; try { box.setPointerCapture(e.pointerId); } catch (x) {} springe(e); });
box.addEventListener('pointermove', e => { if (halten) springe(e); });
const los = () => { if (!halten) return; halten = false; clearTimeout(ausTimer); if (!T.opts.karteImmer) ausTimer = setTimeout(() => zeigen(false), 2500); };
box.addEventListener('pointerup', los); box.addEventListener('pointercancel', los);
})();
