// Tafel-App – 🧩 Beschriftungsbilder zum Zuordnen (Kontextmenü „🧩 Zum Zuordnen“):
// leere Kästen liegen genau auf den Beschriftungsfeldern des Bildes, die Begriffe gemischt im Wortspeicher darunter.
// Schüler ziehen die Begriffe in die Kästen, dann „✓ Prüfen“ – gleiche Kärtchen und Knöpfe wie bei den Übungen.
'use strict';
(function () {
if (!T.BESCHRIFTUNG || !T.BAUSTEINE) return;
const { BILD } = T.BESCHRIFTUNG, B = T.BAUSTEINE, LBW = T.BESCHRIFTUNG.LBW || 220, LBH = T.BESCHRIFTUNG.LBH || 56;
const mische = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const objekt = (k, d, x, y, s) => { const g = T.genObj(k, d, false); return { t: 'o', id: T.uid(), k, d, x, y, w: g.w * s, h: g.h * s, r: 0 }; };
const KN = [['✓ Prüfen', 'pruefen', '#16a34a', '#22c55e'], ['↺ Von vorn', 'mischen', '#5b5bd6', '#8e5bd6'], ['💡 Lösung', 'loesung', '#f59e0b', '#f97316']];

function zuordnen(o, id) {
  const pg = T.page(), b = BILD[id], akt = pg.items.find(i => i.id === o.id) || o, uid = T.uid();
  const gAlt = T.genObj(akt.k, akt.d, false), s = akt.w / gAlt.w;
  const d = { ...akt.d, beschr: 'leer', legende: 'aus', zuord: uid }, g = T.genObj(akt.k, d, false);
  const bild = { ...akt, d, w: g.w * s, h: g.h * s };
  T.snap();
  if (akt.d.zuord) pg.items = pg.items.filter(i => !(i.d && i.d.uid === akt.d.zuord)); // alte Zuordnung ersetzen
  pg.items = pg.items.map(i => i.id === akt.id ? bild : i);
  const neu = [];
  // Kästen genau auf die Beschriftungsfelder (weiß gefüllt, verdecken das gestrichelte Feld)
  b.pts.forEach(([, , , seite, ay], i) => {
    const bx = seite === 'l' ? 10 : b.W - 10 - LBW, [x, y] = T.svgZuWelt(bild, g, bx, ay - LBH / 2);
    neu.push({ ...objekt('uziel', { w: LBW, h: LBH, uid, id: 'z' + i, fuell: '#ffffff' }, x, y, s), fest: true });
  });
  // Wortspeicher unter dem Bild
  const x0 = bild.x, breite = bild.w; let y = bild.y + bild.h + 24 * s;
  const tit = objekt('ukarte', { form: 'titel', duenn: true, fs: 24, text: 'Wortspeicher – ziehe die Begriffe in die passenden Kästen.', w: Math.max(600, g.w), uid }, x0, y, s);
  neu.push(tit); y += tit.h + 12 * s;
  const kw = LBW - 8, kh = LBH - 6; let x = x0;
  mische(b.pts.map((p, i) => [p[0], 'z' + i])).forEach(([t, soll]) => {
    if (x + kw * s > x0 + Math.max(breite, 4 * (kw + 16) * s) && x > x0) { x = x0; y += (kh + 16) * s; }
    neu.push(objekt('ukarte', { text: t, w: kw, h: kh, uid, ziehbar: true, soll }, x, y, s)); x += (kw + 16) * s;
  });
  y += (kh + 30) * s;
  KN.forEach(([t, a, c1, c2], i) => neu.push(objekt('uknopf', { text: t, aktion: a, uid, farbe: c1, farbe2: c2, w: 220 }, x0 + i * 240 * s, y, s)));
  neu.forEach(n => pg.items.push(n));
  T.render(); T.renderOver && T.renderOver();
  T.toast('🧩 Begriffe aus dem Wortspeicher in die Kästen ziehen, dann „✓ Prüfen“.', 3500);
}
function entfernen(o) {
  const pg = T.page(), akt = pg.items.find(i => i.id === o.id) || o; if (!akt.d.zuord) return;
  T.snap(); const d = { ...akt.d }; pg.items = pg.items.filter(i => !(i.d && i.d.uid === d.zuord)); delete d.zuord;
  pg.items = pg.items.map(i => i.id === akt.id ? { ...akt, d } : i); T.render(); T.renderOver && T.renderOver();
}
for (const id of Object.keys(BILD)) {
  const Bk = B['bio_' + id]; if (!Bk) continue;
  const alt = Bk.schnell;
  Bk.schnell = d => [{ l: d.zuord ? '🧩 Zuordnung neu' : '🧩 Zum Zuordnen', aus: o => zuordnen(o, id) }].concat(d.zuord ? [{ l: '✕ Zuordnung entfernen', aus: entfernen }] : [])
    .concat(typeof alt === 'function' ? alt(d) : alt || []);
}
})();
