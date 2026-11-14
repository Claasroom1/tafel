// Tafel-App – wissenschaftlicher Taschenrechner (für die Seitenleiste)
'use strict';
(function () {
const fak = n => { n = Math.round(n); if (n < 0 || n > 170) return NaN; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const fmt = v => {
  if (!isFinite(v)) return 'Fehler';
  const r = Math.abs(v) >= 1e12 || (Math.abs(v) < 1e-7 && v !== 0) ? v.toExponential(6) : String(+v.toPrecision(12));
  return r.replace('.', ',').replace('e+', ' · 10^').replace('e-', ' · 10^-');
};
T.rechner = () => {
  const h = T.h; let ausdruck = '', ans = 0, grad = true, verlauf = '';
  const anzeige = h('div', { class: 'rz' }), oben = h('div', { class: 'rv' });
  let erg = '';
  const zeig = () => { anzeige.textContent = erg || ausdruck || '0'; oben.textContent = verlauf; modus.textContent = grad ? 'DEG' : 'RAD'; };
  const rechne = () => {
    let js = ausdruck.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.').replace(/π/g, '(PI)').replace(/Ans/g, '(ANS)')
      .replace(/√\(/g, 'sqrt(').replace(/²/g, '^2').replace(/%/g, '/100').replace(/!/g, '!');
    if (/[^0-9+\-*/().^!a-zA-Z\s]/.test(js)) throw new Error('Zeichen');
    js = js.replace(/(\d|\))\s*\(/g, '$1*(').replace(/\)(\d)/g, ')*$1').replace(/(\d)(sin|cos|tan|ln|log|sqrt|PI|ANS)/g, '$1*$2');
    js = js.replace(/(\d+(?:\.\d+)?|\))!/g, (m, a) => a === ')' ? ')|FAK|' : `fak(${a})`);
    if (js.includes('|FAK|')) throw new Error('n! bitte direkt hinter eine Zahl');
    js = js.replace(/(^|\()-/g, '$10-').replace(/\^/g, '**');
    const words = js.match(/[a-zA-Z]+/g) || [];
    if (words.some(w => !/^(sin|cos|tan|asin|acos|atan|ln|log|sqrt|PI|ANS|fak)$/.test(w))) throw new Error('Wort');
    const k = grad ? Math.PI / 180 : 1;
    const f = new Function('sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'sqrt', 'PI', 'ANS', 'fak', 'return (' + js + ');');
    return f(x => Math.sin(x * k), x => Math.cos(x * k), x => { const r = Math.tan(x * k); return Math.abs(r) > 1e15 ? NaN : r; },
      x => Math.asin(x) / k, x => Math.acos(x) / k, x => Math.atan(x) / k, Math.log, Math.log10, Math.sqrt, Math.PI, ans, fak);
  };
  let frisch = false; // nach „=“ beginnt eine Zahl eine neue Rechnung, ein Operator rechnet weiter
  const taste = t => {
    erg = ''; if (frisch && /^([0-9,(π]|sin|cos|tan|ln|log|√)$/.test(t)) ausdruck = ''; frisch = t === '=';
    if (t === 'C') { ausdruck = ''; verlauf = ''; }
    else if (t === '⌫') ausdruck = ausdruck.replace(/(sin\(|cos\(|tan\(|ln\(|log\(|√\(|Ans|.)$/, '');
    else if (t === '=') {
      if (!ausdruck) return;
      try {
        const v = rechne(); verlauf = ausdruck + ' ='; letztes = { a: verlauf, e: fmt(v) }; erg = fmt(v);
        // lange Ergebnisse exakt über „Ans“ weiterverwenden
        if (isFinite(v)) { ans = v; const p = String(+v.toPrecision(12)); ausdruck = /e/.test(p) || p.length > 10 ? 'Ans' : p.replace('.', ',').replace('-', '−'); } else ausdruck = '';
      } catch (e) { verlauf = 'Eingabe prüfen'; }
      zeig(); return;
    }
    else if (t === 'DEG') grad = !grad;
    else if (t === '±') ausdruck = ausdruck ? '−(' + ausdruck + ')' : '−';
    else if (t === '1/x') ausdruck = '1÷(' + (ausdruck || '0') + ')';
    else if (['sin', 'cos', 'tan', 'ln', 'log'].includes(t)) ausdruck += t + '(';
    else if (t === '√') ausdruck += '√(';
    else if (t === 'x²') ausdruck += '²';
    else if (t === 'xʸ') ausdruck += '^';
    else if (t === 'n!') ausdruck += '!';
    else ausdruck += t;
    zeig();
  };
  let letztes = null;
  const modus = h('button', { class: 'rt fn', onclick: () => taste('DEG') }, 'DEG');
  const T5 = [['C', 'rt warn'], ['(', 'rt fn'], [')', 'rt fn'], ['⌫', 'rt fn'], null,
    ['sin', 'rt fn'], ['cos', 'rt fn'], ['tan', 'rt fn'], ['π', 'rt fn'], ['xʸ', 'rt fn'],
    ['√', 'rt fn'], ['x²', 'rt fn'], ['ln', 'rt fn'], ['log', 'rt fn'], ['n!', 'rt fn'],
    ['7'], ['8'], ['9'], ['÷', 'rt op'], ['%', 'rt fn'],
    ['4'], ['5'], ['6'], ['×', 'rt op'], ['1/x', 'rt fn'],
    ['1'], ['2'], ['3'], ['−', 'rt op'], ['Ans', 'rt fn'],
    ['0'], [','], ['±', 'rt fn'], ['+', 'rt op'], ['=', 'rt gleich']];
  const tasten = h('div', { class: 'rtasten' }, ...T5.map(x => x ? h('button', { class: x[1] || 'rt', onclick: () => taste(x[0]) }, x[0]) : modus));
  const aufTafel = h('button', { class: 'big prim', onclick: () => {
    if (!T.S.board) return;
    if (ausdruck && !frisch) taste('='); // noch nicht ausgerechnet → jetzt ausrechnen
    if (!letztes) { T.toast('Erst eine Rechnung eintippen.'); return; }
    // gut lesbar in der Mitte der sichtbaren Tafel, gleich ausgewählt zum Verschieben
    const pg = T.page(), z = pg.view.z, d = { text: letztes.a + ' ' + letztes.e, size: Math.round(40 / z), c: T.isDark(pg) ? '#ffffff' : '#1a1a1a', fett: false }, m = T.textMetrics(d), [cx, cy] = T.viewCenter();
    T.snap(); const it = T.addItem({ t: 'o', k: 'text', d, x: cx - m.w / 2, y: cy - m.h / 2, w: m.w, h: m.h, r: 0 });
    T.S.tool = 'auswahl'; T.select([it.id]); T.onInst && T.onInst();
    T.toast('Rechnung steht auf der Tafel – zum Verschieben anfassen.', 2200);
  } }, '⤴ Rechnung auf die Tafel');
  zeig();
  return h('div', { class: 'rechner' }, h('div', { class: 'ranz' }, oben, anzeige), tasten, aufTafel);
};
})();
