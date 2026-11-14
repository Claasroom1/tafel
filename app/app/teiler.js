// Tafel-App – Vielfachen- und Teiler-Finder (Mathe-Tafel): übersichtlich, immer nur EIN Thema –
// Teiler (als Paare) | Vielfache (erste 10, „weitere“) | ggT / kgV. Hundertertafel nur auf Wunsch. Eine Akzentfarbe, große Schrift.
'use strict';
(function () {
const h = T.h;
const lies = (k, d) => { try { const v = JSON.parse(localStorage.getItem('tafelapp.' + k)); return v == null ? d : v; } catch (e) { return d; } };
const merke = (k, v) => { try { localStorage.setItem('tafelapp.' + k, JSON.stringify(v)); } catch (e) {} };

// ---------- Mathematik ----------
const teiler = n => { const klein = [], gross = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) { klein.push(i); if (i !== n / i) gross.unshift(n / i); } return klein.concat(gross); };
const ggT = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
const kgV = (a, b) => a / ggT(a, b) * b;
const vielfache = (n, k) => Array.from({ length: k }, (_, i) => n * (i + 1));
const zahl = s => { s = String(s).trim(); if (!/^\d+$/.test(s)) return null; const v = +s; return v >= 1 && v <= 9999 ? v : null; };
T.TEILER = { teiler, ggT, kgV }; // zum Testen

// ---------- Bild (SVG-Karte wie bei den Rechenwegen) ----------
const AKZENT = '#4f46e5', HELL = '#e0e7ff', INK = '#1f2937', GRAU = '#6b7280';
// Kästchen-Reihen, zentriert: liste von Texten
function kaestchen(liste, proReihe, bw, bh, g, y0, W, hervor) {
  const gap = 22; let s = '', y = y0;
  for (let i = 0; i < liste.length; i += proReihe) {
    const reihe = liste.slice(i, i + proReihe), breite = reihe.length * bw + (reihe.length - 1) * gap;
    reihe.forEach((t, j) => {
      const x = (W - breite) / 2 + j * (bw + gap), an = hervor && hervor(t);
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="16" fill="${an ? AKZENT : HELL}" stroke="${AKZENT}" stroke-width="2"/>` +
        T.rwSvg.tx(x + bw / 2, y + bh / 2 + 1, t, { g, a: 'middle', w: 700, f: an ? '#ffffff' : INK });
    });
    y += bh + gap;
  }
  return { s, y };
}
// Liste zentriert in mehrere Zeilen umbrechen (grobe Breitenschätzung je Zeichen); gibt { s, y } zurück
function zeilen(teile, trenner, g, y, W, o) {
  const max = W - 120, out = []; let z = '';
  for (const t of teile) { const neu = z ? z + trenner + t : String(t); if (z && neu.length * g * 0.56 > max) { out.push(z); z = String(t); } else z = neu; }
  if (z) out.push(z);
  let s = ''; for (const l of out) { s += T.rwSvg.tx(W / 2, y, l, { g, a: 'middle', ...o }); y += g * 1.35; }
  return { s, y };
}
function hundertertafel(markiert, y0, W, legende) {
  const { tx } = T.rwSvg, C = 52, x0 = (W - 10 * C) / 2;
  let s = '';
  for (let n = 1; n <= 100; n++) {
    const x = x0 + ((n - 1) % 10) * C, y = y0 + Math.floor((n - 1) / 10) * C, m = markiert(n);
    s += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="${m ? AKZENT : '#ffffff'}" stroke="#cbd5e1" stroke-width="1.5"/>` + tx(x + C / 2, y + C / 2 + 1, n, { g: 22, a: 'middle', w: m ? 700 : 400, f: m ? '#ffffff' : INK });
  }
  s += `<rect x="${x0}" y="${y0}" width="${10 * C}" height="${10 * C}" fill="none" stroke="#94a3b8" stroke-width="2"/>` + tx(W / 2, y0 + 10 * C + 30, legende, { g: 22, a: 'middle', f: GRAU });
  return { s, y: y0 + 10 * C + 60 };
}
function bauen(st) {
  const { karte, tx, W } = T.rwSvg;
  const { a, b, modus, anz, tafel } = st;
  let titel, kurz, inhalt = '', y = 120, markiert = null, legende = '';
  if (modus === 'teiler') {
    const t = teiler(a), paare = t.filter(d => d * d <= a).map(d => `${d} · ${a / d}`);
    titel = `Teiler von ${a}`; kurz = titel;
    inhalt += tx(W / 2, y, 'Teilerpaare', { g: 26, a: 'middle', f: GRAU }); y += 34;
    const k = kaestchen(paare, 4, 210, 84, 40, y, W); inhalt += k.s; y = k.y + 16;
    const z = zeilen(t, '   ', 36, y, W, { w: 700, f: AKZENT }); inhalt += z.s; y = z.y + 4;
    const info = a === 1 ? '1 Teiler – 1 ist keine Primzahl' : t.length === 2 ? `2 Teiler – ${a} ist eine Primzahl` : `${t.length} Teiler`;
    inhalt += tx(W / 2, y, info, { g: 24, a: 'middle', f: GRAU }); y += 50;
    const ts = new Set(t); markiert = n => ts.has(n); legende = `markiert: Teiler von ${a}`;
  } else if (modus === 'vielfache') {
    titel = `Vielfache von ${a}`; kurz = titel;
    const k = kaestchen(vielfache(a, anz).map(String), 5, 160, 84, 40, y, W); inhalt += k.s; y = k.y + 6;
    inhalt += tx(W / 2, y, `die ersten ${anz} Vielfachen – es geht immer weiter …`, { g: 24, a: 'middle', f: GRAU }); y += 50;
    markiert = n => n % a === 0; legende = `markiert: Vielfache von ${a}`;
  } else {
    const g = ggT(a, b), k = kgV(a, b), gemT = teiler(g), gemV = vielfache(k, 4);
    titel = `ggT und kgV von ${a} und ${b}`; kurz = `ggT/kgV ${a} & ${b}`;
    const block = (name, wert, vorne, liste, hinten) => {
      let s = `<rect x="80" y="${y}" width="${W - 160}" height="96" rx="18" fill="${HELL}" stroke="${AKZENT}" stroke-width="2"/>` +
        tx(W / 2, y + 48, `${name}(${a}, ${b}) = ${wert}`, { g: 46, a: 'middle', w: 700, f: AKZENT });
      y += 124; const z = zeilen([vorne + liste[0]].concat(liste.slice(1)), ', ', 24, y, W, { f: GRAU }); y = z.y;
      s += z.s + tx(W / 2, y, '→ ' + hinten, { g: 24, a: 'middle', w: 700, f: AKZENT }); y += 52; return s;
    };
    inhalt += block('ggT', g, 'gemeinsame Teiler: ', gemT, `der größte ist ${g}`);
    inhalt += block('kgV', k, 'gemeinsame Vielfache: ', gemV.concat('…'), `das kleinste ist ${k}`);
    markiert = n => n % a === 0 && n % b === 0; legende = `markiert: gemeinsame Vielfache von ${a} und ${b}`;
  }
  if (tafel) { const ht = hundertertafel(markiert, y, W, legende); inhalt += ht.s; y = ht.y; }
  const hh = y + 10;
  return { titel, kurz, svg: karte(titel, 'Klasse 5/6', hh, inhalt), w: W, h: hh };
}
const url = r => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(r.svg);

// ---------- Fenster ----------
T.teilerFinder = () => {
  const st = { a: zahl(lies('tfA', 24)) || 24, b: zahl(lies('tfB', 18)) || 18, modus: lies('tfModus', 'teiler'), anz: 10, tafel: false };
  if (!['teiler', 'vielfache', 'ggt'].includes(st.modus)) st.modus = 'teiler';
  const eingabe = (wert, key) => {
    const inp = h('input', { type: 'text', inputmode: 'numeric', class: 'feld tf-zahl', value: String(wert) });
    inp.addEventListener('input', () => { const v = zahl(inp.value); inp.classList.toggle('falsch', !v); if (v) { st[key] = v; merke(key === 'a' ? 'tfA' : 'tfB', v); st.anz = 10; zeige(); } });
    const plus = d => { const v = T.clamp((zahl(inp.value) || st[key]) + d, 1, 9999); inp.value = String(v); inp.dispatchEvent(new Event('input')); };
    return { inp, el: h('div', { class: 'tf-eingabe' }, h('button', { class: 'big tf-pm', onclick: () => plus(-1) }, '−'), inp, h('button', { class: 'big tf-pm', onclick: () => plus(1) }, '＋')) };
  };
  const A = eingabe(st.a, 'a'), B = eingabe(st.b, 'b');
  const zweite = h('div', { class: 'tf-zweite' }, h('span', { class: 'tf-und' }, 'und'), B.el);
  const modi = h('div', { class: 'tf-modi' }), bild = h('img', { class: 'tf-bild', alt: '' }), extra = h('div', { class: 'row tf-extra' });
  let cur = null;
  function zeige() {
    modi.innerHTML = '';
    for (const [m, l] of [['teiler', 'Teiler'], ['vielfache', 'Vielfache'], ['ggt', 'ggT / kgV']])
      modi.append(h('button', { class: 'tf-modus' + (st.modus === m ? ' on' : ''), onclick: () => { st.modus = m; st.anz = 10; merke('tfModus', m); zeige(); } }, l));
    zweite.style.display = st.modus === 'ggt' ? '' : 'none';
    extra.innerHTML = '';
    if (st.modus === 'vielfache') extra.append(h('button', { class: 'big', onclick: () => { st.anz = Math.min(st.anz + 10, 50); zeige(); } }, '＋ weitere'), st.anz > 10 ? h('button', { class: 'big', onclick: () => { st.anz = 10; zeige(); } }, 'nur 10') : '');
    extra.append(h('button', { class: 'big' + (st.tafel ? ' on' : ''), title: 'Zahlen in der Hundertertafel markieren', onclick: () => { st.tafel = !st.tafel; zeige(); } }, '▦ Hundertertafel'));
    cur = bauen(st); bild.src = url(cur);
  }
  zeige();
  const w = T.widget('🔢 Vielfache & Teiler', [h('div', { class: 'tf-kopf' }, A.el, zweite), modi, bild, extra], Math.max(20, innerWidth / 2 - 380), 70);
  w.kopf(h('button', { class: 'big prim', title: 'Groß auf die Tafel', onclick: () => cur && T.addBild(url(cur), cur.w, cur.h, null, 0.92, 1.6) }, '⤴ Auf die Tafel'),
    h('button', { class: 'big', title: 'In die Notizen legen – dort ein- und ausblenden', onclick: () => cur && T.notizHilfe(cur.kurz, url(cur), cur.w, cur.h) }, '📝 Notizen'));
};
})();
