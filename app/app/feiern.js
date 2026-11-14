// Tafel-App – 🎉 Feiern: Konfettiregen über der ganzen Tafel, dazu auf Wunsch ein großes Banner
// (🎂 Happy Birthday · 🎉 Herzlichen Glückwunsch) und Musik (Geburtstagsmelodie – gemeinfrei – bzw. Fanfare), selbst erzeugt
'use strict';
(function () {
const FARBEN = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#26c6da'];
let laeuft = null, ton = null; /* ton: laufende Musik – beim Beenden mit abschalten */
const tonAus = () => { if (ton) { try { ton.close(); } catch (e) {} ton = null; } };
// 🎵 Töne mit WebAudio (kein Download): Dreieck-Klang mit weichem Ein-/Ausklingen
const HZ = n => 440 * Math.pow(2, (n - 69) / 12); /* MIDI-Nummer → Hz */
function spiele(noten, schlag) {
  try {
    tonAus(); const ac = new (window.AudioContext || window.webkitAudioContext)(); ton = ac; let t = ac.currentTime + 0.05;
    for (const [n, d] of noten) {
      const dauer = d * schlag;
      for (const nn of [].concat(n)) { if (nn == null) continue;
        const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = HZ(nn); o.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dauer * 0.95); o.start(t); o.stop(t + dauer); }
      t += dauer;
    }
    setTimeout(() => { if (ton === ac) tonAus(); }, (t - ac.currentTime + 0.5) * 1000);
  } catch (e) {}
}
/* Geburtstagsmelodie (3/4-Takt, gemeinfrei): G G A G C H | G G A G D C | G G g E C H A | F F E C D C */
const G4 = 67, A4 = 69, B4 = 71, C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79;
const GEBURTSTAG = [[G4, .75], [G4, .25], [A4, 1], [G4, 1], [C5, 1], [B4, 2], [G4, .75], [G4, .25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
  [G4, .75], [G4, .25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2], [F5, .75], [F5, .25], [E5, 1], [C5, 1], [D5, 1], [C5, 3]];
const FANFARE = [[C5, .5], [E5, .5], [G5, .5], [[C5, E5, G5, 84], 2.5]];
const GLOCKEN = [[84, .5], [79, .5], [76, .5], [79, .5], [[72, 76, 79, 84], 2.5]]; /* kurzes Glockenspiel (Advent, Weihnachten) */
const FRUEHLING = [[C5, .25], [E5, .25], [G5, .25], [C5 + 12, .5], [G5, .25], [[C5, E5, G5, 84], 1.8]]; /* heller, fröhlicher Lauf */
// 🎊 Konfetti: Papierstreifen fallen mit Drehung und Schaukeln
function konfetti(sek, symbole, langsam) {
  if (laeuft) laeuft.ende();
  const cv = document.createElement('canvas'); cv.id = 'konfetti'; document.body.append(cv);
  const ctx = cv.getContext('2d'), dpr = devicePixelRatio || 1; const groesse = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }; groesse();
  const teile = Array.from({ length: symbole ? Math.min(90, Math.round(innerWidth / 18)) : Math.min(320, Math.round(innerWidth / 4)) }, () => neu(true));
  function neu(anfang) { return { x: Math.random() * innerWidth, y: anfang ? -Math.random() * innerHeight : -20, w: 7 + Math.random() * 7, h: 10 + Math.random() * 10, vy: 1.6 + Math.random() * 2.6, vx: (Math.random() - .5) * 1.2,
    rot: Math.random() * 6.3, vr: (Math.random() - .5) * (symbole ? .05 : .2), phase: Math.random() * 6.3, farbe: FARBEN[Math.floor(Math.random() * FARBEN.length)], rund: Math.random() < .25,
    sym: symbole ? symbole[Math.floor(Math.random() * symbole.length)] : null, gr: 26 + Math.random() * 22, tempo: langsam ? .45 : 1 }; }
  const start = performance.now(); let raf = 0;
  const schritt = now => {
    const vorbei = now - start > sek * 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    let sichtbar = 0;
    for (const p of teile) {
      p.y += p.vy * p.tempo; p.x += (p.vx + Math.sin(now / 400 + p.phase) * .8) * p.tempo; p.rot += p.vr;
      if (p.y > innerHeight + 20) { if (vorbei) continue; Object.assign(p, neu(false)); }
      sichtbar++;
      if (p.sym) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.sin(now / 900 + p.phase) * .35); ctx.font = p.gr + 'px "Segoe UI Emoji","Apple Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.sym, 0, 0); ctx.restore(); continue; } /* Symbole (Ostereier, Sterne, Schneeflocken …) */
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(now / 300 + p.phase)) * .8 + .2); ctx.fillStyle = p.farbe;
      if (p.rund) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 6.3); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (vorbei && !sichtbar) { laeuft && laeuft.ende(); return; }
    raf = requestAnimationFrame(schritt);
  };
  raf = requestAnimationFrame(schritt); addEventListener('resize', groesse);
  laeuft = { ende: () => { cancelAnimationFrame(raf); tonAus(); removeEventListener('resize', groesse); cv.remove(); const b = document.getElementById('feierBanner'); if (b) b.remove(); laeuft = null; } };
}
function banner(text, unter, extra) {
  const alt = document.getElementById('feierBanner'); if (alt) alt.remove();
  const b = T.h('div', { id: 'feierBanner', title: 'Antippen: schließen' }, extra || '', T.h('div', { class: 'fb-text' }, text), unter ? T.h('div', { class: 'fb-unter' }, unter) : '');
  b.addEventListener('pointerdown', e => { e.stopPropagation(); tonAus(); laeuft ? laeuft.ende() : b.remove(); });
  b.append(T.h('button', { class: 'fb-stopp', title: 'Feier beenden (Musik aus)' }, '■ Stopp')); /* gut sichtbar: Stopp */
  document.body.append(b);
}
T.feiern = ({ art = 'konfetti', name = '', musik = true, kerzen = 0 } = {}) => {
  const n = String(name || '').trim();
  if (art === 'geburtstag') { konfetti(14); banner('🎂 Happy Birthday' + (n ? ', ' + n : '') + '! 🎉', 'Alles Gute zum Geburtstag!'); if (musik) spiele(GEBURTSTAG, 0.42); }
  else if (art === 'glueckwunsch') { konfetti(8); banner('🎉 Herzlichen Glückwunsch' + (n ? ', ' + n : '') + '! 🏆', 'Super gemacht!'); if (musik) spiele(FANFARE, 0.32); }
  else if (art === 'ostern') { konfetti(16, ['🥚', '🐣', '🌷', '🐰', '🌼'], true); banner('🐣 Frohe Ostern' + (n ? ', ' + n : '') + '! 🌷', 'Wir wünschen euch schöne Ostertage!'); if (musik) spiele(FRUEHLING, 0.3); }
  else if (art === 'advent') { const k = T.clamp(Math.round(+kerzen || adventHeute() || 1), 1, 4); konfetti(18, ['⭐', '❄️', '✨'], true); banner(k + '. Advent', 'Wir warten auf Weihnachten – jede Woche brennt eine Kerze mehr.', kranz(k)); if (musik) spiele(GLOCKEN, 0.42); }
  else if (art === 'weihnachten') { konfetti(18, ['❄️', '⭐', '🎄', '✨', '🎁'], true); banner('🎄 Frohe Weihnachten' + (n ? ', ' + n : '') + '! ⭐', 'Gesegnete Weihnachten und schöne Ferien!'); if (musik) spiele(GLOCKEN, 0.42); }
  else if (art === 'franziskus') { konfetti(16, ['🕊️', '🐦', '🌿', '🐑', '🦊', '☀️', '🐟'], true); banner('🕊️ Franziskustag – 4. Oktober', 'Franz von Assisi (um 1181–1226): Freund der Armen, der Tiere und der ganzen Schöpfung'); if (musik) spiele(FRUEHLING, 0.34); }
  else konfetti(7);
};
/* 🕯 Adventskranz: Tannenkranz mit vier Kerzen, die ersten k brennen (Flamme flackert) */
function kranz(k) {
  const kerze = (x, an) => `<rect x="${x - 13}" y="52" width="26" height="62" rx="5" fill="#c62828"/><line x1="${x}" y1="52" x2="${x}" y2="44" stroke="#333" stroke-width="2"/>` + (an ? `<g class="flamme"><ellipse cx="${x}" cy="30" rx="9" ry="17" fill="#ffb300"/><ellipse cx="${x}" cy="34" rx="4.5" ry="9" fill="#fff59d"/></g>` : '');
  const svg = `<svg viewBox="0 0 360 170" width="360" height="170"><ellipse cx="180" cy="128" rx="170" ry="36" fill="#2e7d32"/><ellipse cx="180" cy="124" rx="128" ry="20" fill="#1b5e20"/>` +
    [40, 70, 300, 330, 120, 250, 180].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 140 : 116}" r="8" fill="#c62828"/>`).join('') + [70, 145, 215, 290].map((x, i) => kerze(x, i < k)).join('') + '</svg>';
  const el = T.h('div', { class: 'fb-kranz' }); el.innerHTML = svg; return el;
}
/* welcher Advent ist heute? (0 = keiner) – 4. Advent = letzter Sonntag vor dem 25. Dezember */
function adventHeute() {
  const h = new Date(), j = h.getFullYear(), w = new Date(j, 11, 24); const vierter = new Date(j, 11, 24 - w.getDay());
  for (let i = 4; i >= 1; i--) { const so = new Date(vierter); so.setDate(vierter.getDate() - (4 - i) * 7); if (h >= so && h <= new Date(j, 11, 26)) return i; }
  return 0;
}
// 🛎 Buzzer (Classroom): ✅ Richtig / ❌ Falsch – selbst erzeugte Klänge (Quizshow, Arcade, Glocke) und ein kurzer Farbblitz
function klang(richtig, stil) {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)(), t0 = ac.currentTime + 0.02, aus = ac.createGain(); aus.gain.value = 0.9; aus.connect(ac.destination);
    const ton = (typ, f, t, d, laut, f2) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = typ; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(laut, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(aus); o.start(t); o.stop(t + d + 0.02); };
    let ende = 1.2;
    if (richtig) {
      if (stil === 'arcade') { ton('square', HZ(83), t0, 0.08, 0.16); ton('square', HZ(88), t0 + 0.08, 0.45, 0.16); ton('square', HZ(95), t0 + 0.2, 0.35, 0.08); }
      else if (stil === 'glocke') { for (const [m, l] of [[1, .3], [2.76, .12], [5.4, .06]]) ton('sine', 1046 * m, t0, 1.4, l); ton('sine', 1318, t0 + 0.18, 1.3, .22); ende = 1.7; }
      else { [72, 76, 79, 84].forEach((n, i) => ton('triangle', HZ(n), t0 + i * 0.09, 0.5, 0.28)); [[72, 76, 79, 84]].flat().forEach(n => ton('sine', HZ(n), t0 + 0.38, 0.8, 0.09)); }
    } else {
      if (stil === 'jingle') { /* 🎺 Fail-Jingle: traurige Posaune „wah – wah – wah – waaah“ (abwärts, letzter Ton lang mit Vibrato) */
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 4; lp.connect(aus);
        [[67, 0, 0.36], [66, 0.42, 0.36], [65, 0.84, 0.36], [64, 1.26, 1.2]].forEach(([n, s, d], i) => { const o = ac.createOscillator(), g = ac.createGain(), t = t0 + s; o.type = 'sawtooth'; o.frequency.setValueAtTime(HZ(n) * 1.03, t); o.frequency.exponentialRampToValueAtTime(HZ(n), t + 0.08);
          if (i === 3) { const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5.5; lg.gain.value = 6; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t + 0.25); lfo.stop(t + d); o.frequency.linearRampToValueAtTime(HZ(n) * 0.94, t + d); }
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.05); g.gain.setValueAtTime(0.2, t + d - 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(lp); o.start(t); o.stop(t + d + 0.02); });
        ende = 2.7; }
      else if (stil === 'arcade') { ton('square', 420, t0, 0.55, 0.14, 90); ton('square', 300, t0 + 0.05, 0.5, 0.08, 70); }
      else if (stil === 'glocke') { ton('triangle', HZ(64), t0, 0.32, 0.3); ton('triangle', HZ(60), t0 + 0.3, 0.6, 0.3); }
      else { /* „Wrong Buzzer“ wie in der Quizshow: zwei raue Brummtöne – kurz, dann lang und leicht abfallend (verzerrt, tief) */
        const verzerr = ac.createWaveShaper(), kurve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; kurve[i] = Math.tanh(x * 6); } verzerr.curve = kurve;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; verzerr.connect(lp); lp.connect(aus);
        const brumm = (t, d) => { for (const [f, typ] of [[110, 'sawtooth'], [116.5, 'square'], [55, 'sawtooth']]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = typ; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 0.92, t + d);
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.015); g.gain.setValueAtTime(0.16, t + d - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(verzerr); o.start(t); o.stop(t + d + 0.02); } };
        brumm(t0, 0.22); brumm(t0 + 0.3, 0.75); ende = 1.3; }
    }
    setTimeout(() => { try { ac.close(); } catch (e) {} }, ende * 1000 + 300);
  } catch (e) {}
}
function blitz(richtig) {
  const alt = document.getElementById('buzzBlitz'); if (alt) alt.remove();
  const b = T.h('div', { id: 'buzzBlitz', class: richtig ? 'gut' : 'schlecht' }, T.h('span', {}, richtig ? '✓' : '✗')); document.body.append(b);
  setTimeout(() => b.remove(), 1100);
}
/* 🤫 Ruhe! – Gong, dann tief und bestimmt gesprochen (Sprachausgabe des Geräts, offline), groß eingeblendet */
const RUHE_SAETZE = ['Ruhe!']; /* nur „Ruhe!“ */
T.ruhe = satz => {
  try { const ac = new (window.AudioContext || window.webkitAudioContext)(), t = ac.currentTime + 0.02;
    for (const [f, l] of [[98, .5], [196, .35], [294, .18], [392, .1]]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(l, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 1.7); }
    setTimeout(() => { try { ac.close(); } catch (e) {} }, 2000); } catch (e) {}
  const text = satz || RUHE_SAETZE[0]; if (T.opts && T.opts.ruheSatz) delete T.opts.ruheSatz; /* alte Auswahl („Psst …“) nicht mehr verwenden */
  try { if (window.speechSynthesis) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; u.pitch = 0.55; u.rate = 0.82; u.volume = 1;
    const st = speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang)); const m = st.find(v => /male|stefan|conrad|killian|hans|markus/i.test(v.name)) || st[0]; if (m) u.voice = m;
    setTimeout(() => speechSynthesis.speak(u), 350); } } catch (e) {}
  const alt = document.getElementById('buzzBlitz'); if (alt) alt.remove();
  const b = T.h('div', { id: 'buzzBlitz', class: 'ruhe' }, T.h('span', {}, '🤫'), T.h('b', {}, text.replace(/!.*$/, '!').toUpperCase())); document.body.append(b); setTimeout(() => b.remove(), 2200);
};
T.buzzer = (richtig, stil) => { klang(richtig, stil || (T.opts && T.opts.buzzStil) || 'show'); blitz(richtig); };
if (T.CR) T.CR.buzzer = () => {
  const stilWahl = T.h('select', { class: 'feld', title: 'Klang', onchange: e => { T.opts.buzzStil = e.target.value; T.saveOpts && T.saveOpts(); } },
    ...[['show', '🎤 Quizshow'], ['jingle', '🎺 Fail-Jingle (falsch)'], ['arcade', '👾 Arcade'], ['glocke', '🔔 Glocke (sanft)']].map(([v, l]) => T.h('option', { value: v, selected: (T.opts.buzzStil || 'show') === v }, l)));
  const box = T.h('div', { class: 'cr-buzzer' },
    T.h('button', { class: 'bz gut', title: 'Richtig!', onclick: () => T.buzzer(true) }, '✓', T.h('small', {}, 'Richtig')),
    T.h('button', { class: 'bz schlecht', title: 'Falsch!', onclick: () => T.buzzer(false) }, '✗', T.h('small', {}, 'Falsch')));
  T.widget('🛎 Buzzer', [T.h('div', {}, box, T.h('div', { class: 'cr-buzz-fuss' }, stilWahl))], Math.max(20, innerWidth - 420), 90);
};
/* 🤫 Ruhe! als eigener Knopf (eigenes Fenster) */
if (T.CR) T.CR.ruhe = () => {
  T.widget('📢 Ruhe!', [T.h('div', {}, T.h('div', { class: 'cr-buzzer' }, T.h('button', { class: 'bz ruhe', title: 'Ruhe! – laut und bestimmt', onclick: () => T.ruhe() }, '🤫', T.h('small', {}, 'Ruhe!'))))], Math.max(20, innerWidth - 260), 90);
};
// Auswahl: Anlass, Name, Musik
T.feiernDialog = () => {
  const h = T.h, st = { art: 'geburtstag', musik: true, kerzen: adventHeute() || 1 }, name = h('input', { type: 'text', class: 'feld', placeholder: 'Name (freiwillig)', style: { width: '100%' } });
  const zeige = () => {
    const wahl = (v, l) => h('button', { class: 'big' + (st.art === v ? ' on' : ''), onclick: () => { st.art = v; zeige(); } }, l);
    const m = h('input', { type: 'checkbox', onchange: e => { st.musik = e.target.checked; } }); m.checked = st.musik;
    const mitName = ['geburtstag', 'glueckwunsch', 'ostern', 'weihnachten'].includes(st.art);
    T.openDlg([h('h2', {}, '🎉 Feiern'), h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }, wahl('geburtstag', '🎂 Geburtstag'), wahl('glueckwunsch', '🎉 Herzlichen Glückwunsch'), wahl('konfetti', '🎊 Nur Konfetti')),
      h('h4', { style: { margin: '10px 0 4px' } }, 'Feste im Jahr'), h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } }, wahl('franziskus', '🕊️ Franziskustag'), wahl('advent', '🕯 Advent'), wahl('weihnachten', '🎄 Weihnachten'), wahl('ostern', '🐣 Ostern')),
      st.art === 'advent' ? h('div', { class: 'row', style: { gap: '6px', marginTop: '8px' } }, h('span', {}, 'Kerzen:'), ...[1, 2, 3, 4].map(k => h('button', { class: 'big' + (st.kerzen === k ? ' on' : ''), onclick: () => { st.kerzen = k; zeige(); } }, k + '. Advent'))) : '',
      mitName ? h('label', { class: 'fld' }, st.art === 'ostern' || st.art === 'weihnachten' ? 'Für wen? (leer = für alle)' : 'Für wen?', name) : '',
      st.art !== 'konfetti' ? h('label', { class: 'fld check' }, m, st.art === 'geburtstag' ? '🎵 Geburtstagsmelodie spielen' : st.art === 'advent' || st.art === 'weihnachten' ? '🔔 Glockenspiel' : st.art === 'glueckwunsch' ? '🎺 Fanfare spielen' : '🎵 Kurze Melodie') : '',
      h('p', { class: 'hint' }, 'Konfetti regnet über die ganze Tafel und hört von selbst auf. Antippen des Banners beendet sofort.'),
      h('div', { class: 'acts' }, h('button', { class: 'big', onclick: T.closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => { T.closeDlg(); T.feiern({ art: st.art, name: name.value, musik: st.musik, kerzen: st.kerzen }); } }, '🎉 Los!'))]);
  };
  zeige();
};
})();
