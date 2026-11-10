// Tafel-App – 🎉 Feiern: Konfettiregen über der ganzen Tafel, dazu auf Wunsch ein großes Banner
// (🎂 Happy Birthday · 🎉 Herzlichen Glückwunsch) und Musik (Geburtstagsmelodie – gemeinfrei – bzw. Fanfare), selbst erzeugt
'use strict';
(function () {
const FARBEN = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#26c6da'];
let laeuft = null;
// 🎵 Töne mit WebAudio (kein Download): Dreieck-Klang mit weichem Ein-/Ausklingen
const HZ = n => 440 * Math.pow(2, (n - 69) / 12); /* MIDI-Nummer → Hz */
function spiele(noten, schlag) {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)(); let t = ac.currentTime + 0.05;
    for (const [n, d] of noten) {
      const dauer = d * schlag;
      for (const nn of [].concat(n)) { if (nn == null) continue;
        const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = HZ(nn); o.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dauer * 0.95); o.start(t); o.stop(t + dauer); }
      t += dauer;
    }
    setTimeout(() => ac.close && ac.close(), (t - ac.currentTime + 0.5) * 1000);
  } catch (e) {}
}
/* Geburtstagsmelodie (3/4-Takt, gemeinfrei): G G A G C H | G G A G D C | G G g E C H A | F F E C D C */
const G4 = 67, A4 = 69, B4 = 71, C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79;
const GEBURTSTAG = [[G4, .75], [G4, .25], [A4, 1], [G4, 1], [C5, 1], [B4, 2], [G4, .75], [G4, .25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
  [G4, .75], [G4, .25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2], [F5, .75], [F5, .25], [E5, 1], [C5, 1], [D5, 1], [C5, 3]];
const FANFARE = [[C5, .5], [E5, .5], [G5, .5], [[C5, E5, G5, 84], 2.5]];
// 🎊 Konfetti: Papierstreifen fallen mit Drehung und Schaukeln
function konfetti(sek) {
  if (laeuft) laeuft.ende();
  const cv = document.createElement('canvas'); cv.id = 'konfetti'; document.body.append(cv);
  const ctx = cv.getContext('2d'), dpr = devicePixelRatio || 1; const groesse = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }; groesse();
  const teile = Array.from({ length: Math.min(320, Math.round(innerWidth / 4)) }, () => neu(true));
  function neu(anfang) { return { x: Math.random() * innerWidth, y: anfang ? -Math.random() * innerHeight : -20, w: 7 + Math.random() * 7, h: 10 + Math.random() * 10, vy: 1.6 + Math.random() * 2.6, vx: (Math.random() - .5) * 1.2,
    rot: Math.random() * 6.3, vr: (Math.random() - .5) * .2, phase: Math.random() * 6.3, farbe: FARBEN[Math.floor(Math.random() * FARBEN.length)], rund: Math.random() < .25 }; }
  const start = performance.now(); let raf = 0;
  const schritt = now => {
    const vorbei = now - start > sek * 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    let sichtbar = 0;
    for (const p of teile) {
      p.y += p.vy; p.x += p.vx + Math.sin(now / 400 + p.phase) * .8; p.rot += p.vr;
      if (p.y > innerHeight + 20) { if (vorbei) continue; Object.assign(p, neu(false)); }
      sichtbar++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(now / 300 + p.phase)) * .8 + .2); ctx.fillStyle = p.farbe;
      if (p.rund) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 6.3); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (vorbei && !sichtbar) { laeuft && laeuft.ende(); return; }
    raf = requestAnimationFrame(schritt);
  };
  raf = requestAnimationFrame(schritt); addEventListener('resize', groesse);
  laeuft = { ende: () => { cancelAnimationFrame(raf); removeEventListener('resize', groesse); cv.remove(); const b = document.getElementById('feierBanner'); if (b) b.remove(); laeuft = null; } };
}
function banner(text, unter) {
  const alt = document.getElementById('feierBanner'); if (alt) alt.remove();
  const b = T.h('div', { id: 'feierBanner', title: 'Antippen: schließen' }, T.h('div', { class: 'fb-text' }, text), unter ? T.h('div', { class: 'fb-unter' }, unter) : '');
  b.addEventListener('pointerdown', e => { e.stopPropagation(); laeuft ? laeuft.ende() : b.remove(); });
  document.body.append(b);
}
T.feiern = ({ art = 'konfetti', name = '', musik = true } = {}) => {
  const n = String(name || '').trim();
  if (art === 'geburtstag') { konfetti(14); banner('🎂 Happy Birthday' + (n ? ', ' + n : '') + '! 🎉', 'Alles Gute zum Geburtstag!'); if (musik) spiele(GEBURTSTAG, 0.42); }
  else if (art === 'glueckwunsch') { konfetti(8); banner('🎉 Herzlichen Glückwunsch' + (n ? ', ' + n : '') + '! 🏆', 'Super gemacht!'); if (musik) spiele(FANFARE, 0.32); }
  else konfetti(7);
};
// Auswahl: Anlass, Name, Musik
T.feiernDialog = () => {
  const h = T.h, st = { art: 'geburtstag', musik: true }, name = h('input', { type: 'text', class: 'feld', placeholder: 'Name (freiwillig)', style: { width: '100%' } });
  const zeige = () => {
    const wahl = (v, l) => h('button', { class: 'big' + (st.art === v ? ' on' : ''), onclick: () => { st.art = v; zeige(); } }, l);
    const m = h('input', { type: 'checkbox', onchange: e => { st.musik = e.target.checked; } }); m.checked = st.musik;
    T.openDlg([h('h2', {}, '🎉 Feiern'), h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }, wahl('geburtstag', '🎂 Geburtstag'), wahl('glueckwunsch', '🎉 Herzlichen Glückwunsch'), wahl('konfetti', '🎊 Nur Konfetti')),
      st.art !== 'konfetti' ? h('label', { class: 'fld' }, 'Für wen?', name) : '', st.art !== 'konfetti' ? h('label', { class: 'fld check' }, m, st.art === 'geburtstag' ? '🎵 Geburtstagsmelodie spielen' : '🎺 Fanfare spielen') : '',
      h('p', { class: 'hint' }, 'Konfetti regnet über die ganze Tafel und hört von selbst auf. Antippen des Banners beendet sofort.'),
      h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => { T.closeDlg(); T.feiern({ art: st.art, name: name.value, musik: st.musik }); } }, '🎉 Los!'))]);
  };
  zeige();
};
})();
