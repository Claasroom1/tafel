// Tafel-App – 🧊 Bündeln & Entbündeln animiert (Mathe › 📘 Erklärungen › Schriftlich rechnen)
// Stellenwerttafel mit Hunderterplatten, Zehnerstangen und Einerwürfeln.
// Minus: Reicht es an einer Stelle nicht, wird ENTBÜNDELT – ein Zehner wird größer, zerfällt in 10 Einer, die zu den Einern schweben
//        (ebenso Hunderter → 10 Zehner). Dann werden die abzuziehenden Teile weggenommen.
// Plus: Die Teile der zweiten Zahl kommen dazu; sind es 10 oder mehr, wird GEBÜNDELT – 10 Einer schließen sich zu einem Zehner
//       zusammen, der als Übertrag zu den Zehnern wandert.
// Rechts steht die Rechnung wie im Heft und wächst mit. Zahlen bis 999, Schritt für Schritt oder ganz abspielen.
'use strict';
(function () {
const h = T.h;
const C = 16, GAP = 4;                                  /* Kantenlänge eines Einerwürfels (px) */
const SP = { H: { x: 12, w: 250 }, Z: { x: 276, w: 250 }, E: { x: 540, w: 230 } }, OBEN = 58, BUEHNE_H = 430, BUEHNE_W = 780;
const FARBE = { a: '#60a5fa', b: '#fb923c', ue: '#f87171' }; /* erste Zahl blau, zweite orange, Übertrag rot umrandet */
const NAME = { H: 'Hunderter', Z: 'Zehner', E: 'Einer' }, NAME1 = { H: 'Hunderter', Z: 'Zehner', E: 'Einer' };
const HOEHER = { E: 'Z', Z: 'H' }, TIEFER = { H: 'Z', Z: 'E' };

/* Lage eines Teils i in einer Spalte */
function lage(st, i) {
  if (st === 'E') return { x: SP.E.x + 18 + (i % 5) * (C + GAP), y: OBEN + 4 + Math.floor(i / 5) * (C + GAP) };
  if (st === 'Z') return { x: SP.Z.x + 8 + (i % 10) * (C + GAP + 3), y: OBEN + 4 + Math.floor(i / 10) * (10 * C + 14) };
  return { x: SP.H.x + 10 + i * 7, y: OBEN + 4 + i * 7 };
}
/* ein Teil als Element: Würfel, Stange (10 Würfel) oder Platte (100 Würfel) */
function teil(art, farbe) {
  const b = art === 'E' ? C : art === 'Z' ? C : 10 * C, hh = art === 'E' ? C : 10 * C;
  const gitter = 'rgba(0,0,0,.28)';
  const bg = art === 'E' ? farbe
    : art === 'Z' ? `repeating-linear-gradient(to bottom, ${farbe} 0 ${C - 1}px, ${gitter} ${C - 1}px ${C}px)`
    : `repeating-linear-gradient(to bottom, transparent 0 ${C - 1}px, ${gitter} ${C - 1}px ${C}px), repeating-linear-gradient(to right, ${farbe} 0 ${C - 1}px, ${gitter} ${C - 1}px ${C}px)`;
  return h('div', { class: 'eb-teil', 'data-art': art, style: { width: b + 'px', height: hh + 'px', background: bg } });
}
const warte = ms => new Promise(r => setTimeout(r, ms));
function bewege(el, x, y, ms, verz = 0) {
  const von = { left: el.style.left, top: el.style.top };
  const a = el.animate([von, { left: x + 'px', top: y + 'px' }], { duration: ms, delay: verz, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
  return a.finished.then(() => { el.style.left = x + 'px'; el.style.top = y + 'px'; a.cancel(); }).catch(() => {});
}
const setze = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; };

T.entbuendeln = (start) => {
  const st = { a: 52, b: 27, op: '−', ...(start || {}) };
  const buehne = h('div', { class: 'eb-buehne', style: { width: BUEHNE_W + 'px', height: BUEHNE_H + 'px' } });
  const heft = h('div', { class: 'eb-heft' }), info = h('div', { class: 'eb-info' }), zaehler = {};
  for (const s of ['H', 'Z', 'E']) {
    buehne.append(h('div', { class: 'eb-spalte eb-' + s, style: { left: SP[s].x - 6 + 'px', width: SP[s].w + 'px' } }, h('b', {}, NAME[s])));
    zaehler[s] = h('div', { class: 'eb-zahl', style: { left: SP[s].x - 6 + 'px', width: SP[s].w + 'px' } }); buehne.append(zaehler[s]);
  }
  const fA = h('input', { class: 'feld', type: 'number', min: 0, max: 999, value: st.a, style: { width: '90px' } });
  const fB = h('input', { class: 'feld', type: 'number', min: 0, max: 999, value: st.b, style: { width: '90px' } });
  const fOp = h('select', { class: 'feld' }, h('option', { value: '−' }, '−  minus (entbündeln)'), h('option', { value: '+' }, '+  plus (bündeln)')); fOp.value = st.op;
  const tempo = h('select', { class: 'feld', title: 'Tempo' }, h('option', { value: '1.6' }, 'langsam'), h('option', { value: '1' }, 'normal'), h('option', { value: '0.6' }, 'schnell')); tempo.value = '1';
  const weiter = h('button', { class: 'big prim' }, 'Weiter ▶'), alles = h('button', { class: 'big' }, '▶▶ Alles'), neu = h('button', { class: 'big' }, '↺ Neu');
  const w = T.widget('🧊 Bündeln & Entbündeln', [
    h('div', { class: 'row', style: { gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' } }, fA, fOp, fB, neu, h('span', { style: { flex: 1 } }), tempo, weiter, alles),
    info, h('div', { class: 'eb-wrap' }, buehne, heft)], Math.max(10, innerWidth / 2 - 560), 60);
  /* kleinere Bildschirme (iPad hochkant): Bühne und Heft passend verkleinern */
  const wrap = w.querySelector('.eb-wrap'), passe = () => { const z = Math.min(1, (innerWidth - 40) / (BUEHNE_W + 230), (innerHeight - 230) / BUEHNE_H); wrap.style.zoom = String(Math.max(0.45, z)); };
  passe(); addEventListener('resize', passe); const zuAlt = w.onclose; w.onclose = () => { removeEventListener('resize', passe); zuAlt && zuAlt(); };

  let lauf = null, schritte = [], k = 0, besch = false;
  const t = ms => ms * (+tempo.value || 1);
  const sag = (txt, farbe) => { info.textContent = txt; info.style.borderColor = farbe || 'var(--acc, #4f46e5)'; };

  function aufbau() {
    let a = Math.round(+fA.value || 0), b = Math.round(+fB.value || 0); const op = fOp.value;
    a = T.clamp(a, 0, 999); b = T.clamp(b, 0, 999);
    if (op === '−' && b > a) { sag('Bei Minus muss die obere Zahl größer sein (oder gleich).', '#dc2626'); return false; }
    if (op === '+' && a + b > 999) { sag('Die Summe darf höchstens 999 sein.', '#dc2626'); return false; }
    fA.value = a; fB.value = b;
    lauf = { a, b, op, d: { H: Math.floor(a / 100), Z: Math.floor(a / 10) % 10, E: a % 10 }, e: { H: Math.floor(b / 100), Z: Math.floor(b / 10) % 10, E: b % 10 }, teile: { H: [], Z: [], E: [] }, erg: {}, neuOben: {}, ue: {} };
    buehne.querySelectorAll('.eb-teil, .eb-weg').forEach(x => x.remove());
    for (const s of ['H', 'Z', 'E']) for (let i = 0; i < lauf.d[s]; i++) { const el = teil(s, FARBE.a), p = lage(s, i); setze(el, p.x, p.y); buehne.append(el); lauf.teile[s].push(el); }
    zaehlen(); heftMalen();
    /* Schritte: je Stelle von rechts nach links (nur so weit, wie es Stellen gibt) */
    const stellen = Math.max(String(a).length, String(b).length);
    schritte = ['E', 'Z', 'H'].slice(0, stellen).map(s => () => op === '−' ? minusStelle(s) : plusStelle(s));
    k = 0; weiter.disabled = alles.disabled = false;
    sag(op === '−' ? `${a} − ${b}: Wir rechnen von rechts – zuerst die Einer. „Weiter ▶“ zeigt den nächsten Schritt.` : `${a} + ${b}: Wir rechnen von rechts – zuerst die Einer. „Weiter ▶“ zeigt den nächsten Schritt.`);
    return true;
  }
  /* Ergebnisziffer – eine führende 0 (z. B. 105 − 98 = 7) wird wie im Heft nicht geschrieben */
  const zaehlen = () => { for (const s of ['H', 'Z', 'E']) { const n = lauf ? lauf.teile[s].length : 0; zaehler[s].textContent = n + ' ' + (n === 1 ? NAME1[s] : NAME[s]); } };
  /* Rechnung wie im Heft: H Z E, darüber kleine rote Zahlen beim Entbündeln, Übertrag, Ergebnis */
  function heftMalen() {
    const L = lauf, z = n => String(n);
    const zeile = (zeichen, werte, kl) => h('div', { class: 'eb-zeile' + (kl ? ' ' + kl : '') }, h('span', { class: 'eb-op' }, zeichen), ...['H', 'Z', 'E'].map(s => h('span', {}, werte[s] == null ? '' : werte[s])));
    const zeige = (x, s) => (s === 'H' && x >= 100) || (s === 'Z' && x >= 10) || s === 'E';
    const oben = {}, unten = {}; for (const s of ['H', 'Z', 'E']) { if (zeige(L.a, s)) oben[s] = z(L.d[s]); if (zeige(L.b, s)) unten[s] = z(L.e[s]); }
    heft.innerHTML = '';
    heft.append(h('div', { class: 'eb-zeile eb-kopf' }, h('span', { class: 'eb-op' }), h('span', {}, 'H'), h('span', {}, 'Z'), h('span', {}, 'E')));
    if (L.op === '−') heft.append(zeile('', L.neuOben, 'eb-rot'));
    const ob = zeile('', oben); if (L.op === '−') ['H', 'Z', 'E'].forEach((s, i) => { if (L.neuOben[s] != null) ob.children[i + 1].classList.add('eb-weg-strich'); }); heft.append(ob);
    heft.append(zeile(L.op, unten));
    if (L.op === '+') heft.append(zeile('', L.ue, 'eb-rot eb-ue'));
    heft.append(h('div', { class: 'eb-strich' }), zeile('', L.erg, 'eb-erg'), h('div', { class: 'eb-doppel' }));
  }
  /* ----- Entbündeln: oberstes Teil der Stelle „von“ wird größer, zerfällt in 10 Teile, die zur tieferen Stelle schweben ----- */
  async function entbuendeln(von) {
    const nach = TIEFER[von], L = lauf, el = L.teile[von].pop(); zaehlen();
    sag(`Entbündeln: 1 ${NAME1[von]} wird in 10 ${NAME[nach]} getauscht.`, '#dc2626');
    el.style.zIndex = 5; el.style.boxShadow = '0 0 0 3px #dc2626';
    const gr = el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.45)' }], { duration: t(450), easing: 'ease-out', fill: 'forwards' });
    await gr.finished.catch(() => {}); await warte(t(150));
    const x0 = parseFloat(el.style.left), y0 = parseFloat(el.style.top), stueck = [];
    for (let i = 0; i < 10; i++) { /* Stange → 10 Würfel (übereinander), Platte → 10 Stangen (nebeneinander) – zuerst groß, wie das gewachsene Teil */
      const s = teil(nach, FARBE.a); s.style.zIndex = 6; s.style.boxShadow = '0 0 0 2px #dc2626';
      setze(s, von === 'Z' ? x0 : x0 + i * C, von === 'Z' ? y0 + i * C : y0); s.style.transform = 'scale(1.45)'; s.style.transformOrigin = von === 'Z' ? `${C / 2}px ${C * 5 - i * C}px` : `${C * 5 - i * C}px ${C * 5}px`;
      buehne.append(s); stueck.push(s); }
    el.remove();
    await Promise.all(stueck.map(s => s.animate([{ transform: 'scale(1.45)' }, { transform: 'scale(1)' }], { duration: t(350), fill: 'forwards' }).finished.then(() => { s.style.transform = ''; }).catch(() => {})));
    await warte(t(120));
    const basis = L.teile[nach].length;
    await Promise.all(stueck.map((s, i) => { const p = lage(nach, basis + i); return bewege(s, p.x, p.y, t(800), t(i * 70)); }));
    stueck.forEach(s => { s.style.boxShadow = ''; s.style.zIndex = ''; }); L.teile[nach].push(...stueck); zaehlen();
    /* im Heft: oben klein die neuen Zahlen (z. B. 4 statt 5 Zehner, 12 statt 2 Einer) */
    L.neuOben[von] = String(L.teile[von].length); L.neuOben[nach] = String(L.teile[nach].length); heftMalen();
  }
  /* ----- Bündeln: 10 Teile kommen zusammen, werden zu einem Teil der höheren Stelle, das als Übertrag hinüberwandert ----- */
  async function buendeln(von) {
    const nach = HOEHER[von], L = lauf, zehn = L.teile[von].splice(L.teile[von].length - 10, 10); zaehlen();
    sag(`Bündeln: 10 ${NAME[von]} werden zu 1 ${NAME1[nach]} – das ist der Übertrag.`, '#dc2626');
    const gx = SP[von].x + SP[von].w - (von === 'E' ? 40 : 10 * C + 30), gy = OBEN + (von === 'E' ? 120 : 200);
    await Promise.all(zehn.map((s, i) => { s.style.zIndex = 6; s.style.boxShadow = '0 0 0 2px #dc2626'; return bewege(s, von === 'E' ? gx : gx + i * C, von === 'E' ? gy + i * C - 120 : gy - 190, t(700), t(i * 50)); }));
    await warte(t(200));
    const neu = teil(nach, FARBE.a); neu.style.zIndex = 7; neu.style.boxShadow = '0 0 0 3px ' + FARBE.ue;
    setze(neu, von === 'E' ? gx : gx, von === 'E' ? gy - 120 : gy - 190); buehne.append(neu); zehn.forEach(s => s.remove());
    await neu.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: t(500) }).finished.catch(() => {});
    const p = lage(nach, L.teile[nach].length); await bewege(neu, p.x, p.y, t(900));
    neu.style.zIndex = ''; L.teile[nach].push(neu); zaehlen();
    L.ue[nach] = '1'; heftMalen();
  }
  /* ----- eine Stelle bei Minus ----- */
  async function minusStelle(s) {
    const L = lauf, weg = L.e[s];
    if (L.teile[s].length < weg) {
      sag(`${NAME[s]}: ${L.teile[s].length} − ${weg} geht nicht – es reicht nicht. Wir holen uns 1 ${NAME1[HOEHER[s]]}.`, '#dc2626'); await warte(t(1400));
      if (!L.teile[HOEHER[s]].length && HOEHER[HOEHER[s]]) { await entbuendeln(HOEHER[HOEHER[s]]); await warte(t(500)); } /* z. B. 302 − 7: erst Hunderter → Zehner */
      await entbuendeln(HOEHER[s]); await warte(t(600));
    }
    sag(`${NAME[s]}: ${L.teile[s].length} − ${weg} = ${L.teile[s].length - weg}. Wir nehmen ${weg} ${weg === 1 ? NAME1[s] : NAME[s]} weg.`);
    const wegT = L.teile[s].splice(L.teile[s].length - weg, weg);
    await Promise.all(wegT.map((el, i) => { el.style.boxShadow = '0 0 0 2px #dc2626'; return el.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(70px) rotate(20deg)' }], { duration: t(700), delay: t(i * 60), fill: 'forwards' }).finished.catch(() => {}); }));
    wegT.forEach(el => el.remove()); zaehlen();
    L.erg[s] = String(L.teile[s].length); heftMalen();
  }
  /* ----- eine Stelle bei Plus ----- */
  async function plusStelle(s) {
    const L = lauf, dazu = L.e[s];
    sag(`${NAME[s]}: Die ${dazu} ${dazu === 1 ? NAME1[s] : NAME[s]} der zweiten Zahl kommen dazu.`, FARBE.b);
    const neu = []; for (let i = 0; i < dazu; i++) { const el = teil(s, FARBE.b), p = lage(s, 0); setze(el, p.x + (s === 'E' ? 40 : 0), BUEHNE_H - (s === 'E' ? C : s === 'Z' ? 10 * C : 10 * C) - 4); el.style.opacity = '0'; buehne.append(el); neu.push(el); }
    await Promise.all(neu.map((el, i) => { const p = lage(s, L.teile[s].length + i); el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: t(250), delay: t(i * 70), fill: 'forwards' }).finished.then(() => { el.style.opacity = '1'; }).catch(() => {}); return bewege(el, p.x, p.y, t(800), t(i * 70)); }));
    L.teile[s].push(...neu); zaehlen(); await warte(t(500));
    const n = L.teile[s].length;
    if (n >= 10 && HOEHER[s]) { sag(`${NAME[s]}: zusammen ${n} – das sind 10 oder mehr. Wir bündeln!`, '#dc2626'); await warte(t(1300)); await buendeln(s); await warte(t(400)); }
    sag(`${NAME[s]}: Es bleiben ${L.teile[s].length} ${L.teile[s].length === 1 ? NAME1[s] : NAME[s]} – ins Ergebnis.`);
    L.erg[s] = String(L.teile[s].length); heftMalen();
  }
  async function naechster() {
    if (besch || !lauf) return; if (k >= schritte.length) return;
    besch = true; weiter.disabled = alles.disabled = true;
    try { await schritte[k++](); } finally { besch = false; }
    if (k >= schritte.length) { for (const s of ['H', 'Z']) { if (lauf.erg[s] === '0') lauf.erg[s] = ''; else if (lauf.erg[s]) break; } heftMalen(); /* führende Nullen schreibt man nicht */
      const erg = lauf.op === '−' ? lauf.a - lauf.b : lauf.a + lauf.b; sag(`Fertig: ${lauf.a} ${lauf.op} ${lauf.b} = ${erg}. ` + (lauf.op === '−' ? `Probe: ${erg} + ${lauf.b} = ${lauf.a} ✓` : `Probe: ${erg} − ${lauf.b} = ${lauf.a} ✓`), '#16a34a'); }
    else weiter.disabled = alles.disabled = false;
  }
  weiter.onclick = () => naechster();
  alles.onclick = async () => { while (k < schritte.length && w.isConnected) { await naechster(); await warte(t(500)); } };
  neu.onclick = () => { if (!besch) aufbau(); };
  [fA, fB, fOp].forEach(f => f.addEventListener('change', () => { if (!besch) aufbau(); }));
  fOp.addEventListener('change', () => { if (besch) return; if (fOp.value === '+' && +fA.value === 52 && +fB.value === 27) { fA.value = 38; fB.value = 25; aufbau(); } });
  aufbau();
  return w;
};

document.head.append(Object.assign(document.createElement('style'), { textContent:
  '.eb-wrap{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}'
  + '.eb-buehne{position:relative;background:#fff;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;flex:0 0 auto}'
  + '.eb-spalte{position:absolute;top:0;bottom:0;border-right:2px dashed #cbd5e1;text-align:center;padding-top:10px;color:#334155;font:700 20px system-ui}'
  + '.eb-E{border-right:none}.eb-H b{color:#ea580c}.eb-Z b{color:#16a34a}.eb-E b{color:#2563eb}'
  + '.eb-zahl{position:absolute;bottom:8px;text-align:center;font:600 18px system-ui;color:#475569}'
  + '.eb-teil{position:absolute;border:1.5px solid rgba(0,0,0,.55);border-radius:2px;box-sizing:border-box;will-change:transform,left,top}'
  + '.eb-info{margin:0 0 8px;padding:8px 12px;border-left:5px solid var(--acc,#4f46e5);background:var(--surface2,#f1f5f9);border-radius:8px;font:600 19px system-ui;min-height:28px}'
  + '.eb-heft{background:#fff;color:#111;border:1px solid #cbd5e1;border-radius:14px;padding:12px 16px;font:600 30px "Segoe UI",system-ui;min-width:170px}'
  + '.eb-zeile{display:grid;grid-template-columns:34px repeat(3,40px);text-align:center;line-height:1.35;min-height:1.35em}'
  + '.eb-kopf{font-size:16px;color:#64748b}.eb-rot{color:#dc2626;font-size:20px;min-height:1.2em}.eb-erg{color:#16a34a}'
  + '.eb-weg-strich{text-decoration:line-through;text-decoration-color:#dc2626;text-decoration-thickness:3px}'
  + '.eb-strich{border-top:4px solid #111;margin:2px 0}.eb-doppel{border-top:2.5px solid #111;border-bottom:2.5px solid #111;height:3px;margin-top:2px}' }));
})();
