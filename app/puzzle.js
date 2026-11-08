// Tafel-App – 🧩 Echtes Bild-Puzzle: Bild in Puzzleteile (mit Nasen) schneiden, gemischt neben einen blassen Rahmen legen.
// Teile mit dem Finger an ihren Platz schieben – in der Nähe rasten sie ein und werden festgemacht. Alle drin: 🎉
'use strict';
(function () {
const h = T.h, S = T.S;
const ladeBild = src => new Promise((ok, fehler) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fehler; i.src = src; });

// Kante mit Nase: von P0 nach P1, n = Normale nach außen, s = +1 Nase nach außen, −1 nach innen, 0 gerade
function kante(c, P0, P1, n, s, t) {
  if (!s) { c.lineTo(P1[0], P1[1]); return; }
  const d = [P1[0] - P0[0], P1[1] - P0[1]], p = (u, v) => [P0[0] + d[0] * u + n[0] * s * t * v, P0[1] + d[1] * u + n[1] * s * t * v];
  c.lineTo(...p(0.36, 0));
  c.bezierCurveTo(...p(0.40, 0.5), ...p(0.28, 1), ...p(0.5, 1));
  c.bezierCurveTo(...p(0.72, 1), ...p(0.60, 0.5), ...p(0.64, 0));
  c.lineTo(P1[0], P1[1]);
}
async function bauen(bild, sp, ze) {
  const img = await ladeBild(bild.d.src);
  const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight)), W = Math.round(img.naturalWidth * k), H = Math.round(img.naturalHeight * k);
  const quelle = document.createElement('canvas'); quelle.width = W; quelle.height = H; quelle.getContext('2d').drawImage(img, 0, 0, W, H);
  const cw = W / sp, ch = H / ze, t = Math.min(cw, ch) * 0.22, f = bild.w / W, uid = T.uid();
  const zuf = () => Math.random() < 0.5 ? 1 : -1;
  const waag = [...Array(ze - 1)].map(() => [...Array(sp)].map(zuf)), senk = [...Array(ze)].map(() => [...Array(sp - 1)].map(zuf)); // Nasen zwischen den Teilen
  const teile = [];
  for (let r = 0; r < ze; r++) for (let c = 0; c < sp; c++) {
    const cv = document.createElement('canvas'); cv.width = Math.ceil(cw + 2 * t); cv.height = Math.ceil(ch + 2 * t);
    const x = cv.getContext('2d'), A = [t, t], B = [t + cw, t], C = [t + cw, t + ch], D = [t, t + ch];
    x.beginPath(); x.moveTo(...A);
    kante(x, A, B, [0, -1], r === 0 ? 0 : -waag[r - 1][c], t);       // oben
    kante(x, B, C, [1, 0], c === sp - 1 ? 0 : senk[r][c], t);        // rechts
    kante(x, C, D, [0, 1], r === ze - 1 ? 0 : waag[r][c], t);        // unten
    kante(x, D, A, [-1, 0], c === 0 ? 0 : -senk[r][c - 1], t);       // links
    x.closePath(); x.save(); x.clip();
    x.drawImage(quelle, c * cw - t, r * ch - t, cv.width, cv.height, 0, 0, cv.width, cv.height); x.restore();
    x.lineWidth = 2; x.strokeStyle = 'rgba(0,0,0,.45)'; x.stroke();
    const zx = bild.x + (c * cw - t) * f, zy = bild.y + (r * ch - t) * f;
    teile.push({ t: 'o', id: T.uid(), k: 'bild', d: { src: cv.toDataURL('image/png'), puzzle: { uid, zx, zy, ok: false } }, x: zx, y: zy, w: cv.width * f, h: cv.height * f, r: 0 });
  }
  return { teile, uid, zelle: Math.min(cw, ch) * f };
}
// Teile gemischt rechts neben (bzw. unter) den Rahmen legen
function mischen(teile, rahmen) {
  const rechts = rahmen.w <= rahmen.h * 1.3, bx = rechts ? rahmen.x + rahmen.w + 60 : rahmen.x, by = rechts ? rahmen.y : rahmen.y + rahmen.h + 60;
  const bw = rechts ? rahmen.w * 1.1 : rahmen.w, bh = rechts ? rahmen.h : rahmen.h * 0.9;
  return teile.map(p => ({ ...p, x: bx + Math.random() * Math.max(10, bw - p.w), y: by + Math.random() * Math.max(10, bh - p.h), fest: false, d: { ...p.d, puzzle: { ...p.d.puzzle, ok: false } } }));
}
T.puzzleEchtStart = bild => {
  if (!bild || bild.k !== 'bild') { T.toast('Bitte zuerst ein Bild antippen.'); return; }
  const quer = bild.w >= bild.h;
  const mach = async (a, b) => {
    T.closeDlg(); const [sp, ze] = quer ? [a, b] : [b, a];
    try {
      const gerade = { ...bild, r: 0 }, { teile, uid } = await bauen(gerade, sp, ze);
      const rahmen = { ...gerade, id: T.uid(), alpha: 0.18, fest: true, d: { ...gerade.d, puzzleRahmen: { uid, orig: bild, teile: sp * ze } } }; /* blasse Vorlage als Rahmen */
      T.snap(); const pg = T.page(); pg.items = pg.items.filter(i => i.id !== bild.id); pg.items.push(rahmen, ...mischen(teile, rahmen));
      S.sel = null; T.render(); T.renderOver(); T.allesZeigen && T.allesZeigen();
      T.toast('🧩 Puzzle: Teile mit dem Finger in den Rahmen schieben – passt ein Teil, rastet es ein. Rahmen antippen: mischen, lösen, beenden.', 6000);
    } catch (e) { T.toast('Das Bild ließ sich nicht zerschneiden: ' + (e.message || e), 4000); }
  };
  T.openDlg([h('h2', {}, '🧩 Puzzle zum Zusammensetzen'), h('p', { class: 'hint' }, 'Das Bild wird in Puzzleteile geschnitten und gemischt. Die Kinder schieben die Teile an die richtige Stelle – dort rasten sie ein. Der blasse Rahmen zeigt die Vorlage.'),
    h('div', { class: 'row', style: { justifyContent: 'center' } }, ...[[2, 2, 'leicht'], [3, 2, ''], [3, 3, ''], [4, 3, 'mittel'], [5, 4, ''], [6, 5, 'schwer']].map(([a, b, l]) =>
      h('button', { class: 'big', style: { minWidth: '120px', flexDirection: 'column' }, onclick: () => mach(a, b) }, h('b', {}, (a * b) + ' Teile'), h('span', { class: 'hint', style: { margin: 0 } }, a + ' × ' + b + (l ? ' · ' + l : '')))))]);
};
// 🧲 Magnet: Fangbereich um den richtigen Platz (etwa ein Drittel eines Teils)
const fang = (pg, p, it) => { const rahmen = pg.items.find(i => i.d && i.d.puzzleRahmen && i.d.puzzleRahmen.uid === p.uid); return rahmen ? Math.min(it.w, it.h) * 0.33 : 30; };
// Beim Ziehen: kommt das Teil in die Nähe seines Platzes, springt es schon dorthin (wie ein Magnet)
let magnetAn = null, ton = null;
const klack = () => { try { ton = ton || new AudioContext(); const o = ton.createOscillator(), g = ton.createGain(), t = ton.currentTime; o.frequency.value = 520; o.connect(g); g.connect(ton.destination); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08); o.start(t); o.stop(t + 0.09); } catch (e) {} }; /* kurzes, leises Klack */
T.puzzleMagnet = (it, dx, dy) => {
  const p = it.d && it.d.puzzle; if (!p || p.ok) return null;
  const pg = T.page(), nah = Math.hypot(it.x + dx - p.zx, it.y + dy - p.zy) <= fang(pg, p, it);
  if (nah && magnetAn !== it.id) { magnetAn = it.id; klack(); } else if (!nah && magnetAn === it.id) magnetAn = null;
  return nah ? [p.zx - it.x, p.zy - it.y] : null;
};
// Nach dem Verschieben: Teil an seinem Platz → haften lassen (festmachen)
T.nachVerschieben = ids => {
  const pg = T.page(); let geaendert = false, uidFertig = null; magnetAn = null;
  pg.items = pg.items.map(it => {
    const p = it.d && it.d.puzzle; if (!p || p.ok || !ids.includes(it.id)) return it;
    if (Math.hypot(it.x - p.zx, it.y - p.zy) > fang(pg, p, it)) return it;
    geaendert = true; uidFertig = p.uid; return { ...it, x: p.zx, y: p.zy, fest: true, d: { ...it.d, puzzle: { ...p, ok: true } } };
  });
  if (!geaendert) return;
  S.sel = null; T.render(); T.renderOver();
  const rest = pg.items.filter(i => i.d && i.d.puzzle && i.d.puzzle.uid === uidFertig && !i.d.puzzle.ok).length;
  if (!rest) { T.toast('🎉 Puzzle fertig!', 3500); T.beep && T.beep(); } else T.toast('✔ Passt! Noch ' + rest + (rest === 1 ? ' Teil' : ' Teile'), 1200);
};
// Puzzle: mischen, lösen, beenden (Bild zurück)
T.puzzleAktion = (uid, art) => {
  const pg = T.page(), rahmen = pg.items.find(i => i.d && i.d.puzzleRahmen && i.d.puzzleRahmen.uid === uid); if (!rahmen) return;
  T.snap();
  if (art === 'beenden') { pg.items = pg.items.filter(i => !(i.d && ((i.d.puzzle && i.d.puzzle.uid === uid) || i.id === rahmen.id))); pg.items.push(rahmen.d.puzzleRahmen.orig); }
  else if (art === 'loesen') pg.items = pg.items.map(i => i.d && i.d.puzzle && i.d.puzzle.uid === uid ? { ...i, x: i.d.puzzle.zx, y: i.d.puzzle.zy, fest: true, d: { ...i.d, puzzle: { ...i.d.puzzle, ok: true } } } : i);
  else if (art === 'mischen') { const neu = new Map(mischen(pg.items.filter(i => i.d && i.d.puzzle && i.d.puzzle.uid === uid), rahmen).map(p => [p.id, p])); pg.items = pg.items.map(i => neu.get(i.id) || i); }
  else if (art === 'vorlage') pg.items = pg.items.map(i => i.id === rahmen.id ? { ...i, alpha: (i.alpha || 0) > 0.05 ? 0.03 : 0.18 } : i);
  S.sel = null; T.changed && T.changed(); T.render(); T.renderOver();
};
// Bild für eine Bild-Übung: das angetippte Bild – sonst eines auswählen und einfügen
T.mitBild = async fn => {
  const sel = S.sel && T.page().items.find(i => S.sel.ids.has(i.id) && i.k === 'bild' && !(i.d && (i.d.puzzle || i.d.puzzleRahmen)));
  if (sel) { fn(sel); return; }
  T.toast('Bild auswählen – danach geht es gleich weiter.', 2500);
  if (T.ui && T.ui.bildEinfuegen) await T.ui.bildEinfuegen();
  const neu = S.sel && T.page().items.find(i => S.sel.ids.has(i.id) && i.k === 'bild'); if (neu) fn(neu);
};
})();
