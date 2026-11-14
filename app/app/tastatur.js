// Tafel-App – eigene Bildschirmtastatur (optional, Einstellungen ⚙): erscheint bei jedem Text- und Zahlenfeld, groß genug fürs Board
'use strict';
(function () {
const h = T.h;
const an = () => !!(T.opts && T.opts.tastatur);
const LAYOUT = {
  abc: [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß', '⌫'], ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', '↵'], ['⇧', 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-', '⇧'], ['?123', ' ', '←', '→', '▾']],
  sym: [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'], ['+', '-', '*', '/', '=', '(', ')', '^', ',', '.'],
    ['!', '?', ':', ';', '"', '\'', '%', '€', '&', '@', '↵'], ['<', '>', '²', '³', '°', '·', '−', '√', 'π', '≈', '≠'], ['abc', ' ', '←', '→', '▾']]
};
const BREIT = { ' ': 6, '⌫': 1.6, '↵': 1.6, '⇧': 1.6, '?123': 1.8, 'abc': 1.8, '▾': 1.4 };
let box = null, ziel = null, art = 'abc', gross = false, wegT = null;

const editierbar = el => el && !el.readOnly && !el.disabled && !el.closest('#tastatur') &&
  (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search|number|url|email|)$/.test(el.getAttribute('type') || '')));

function zeichne() {
  box.innerHTML = '';
  for (const reihe of LAYOUT[art]) box.append(h('div', { class: 'tast-reihe' }, ...reihe.map(k => {
    const text = k.length === 1 && gross ? k.toUpperCase() : k === ' ' ? 'Leerzeichen' : k === '▾' ? '⌨▾' : k;
    const b = h('button', { class: 'tast' + (k.length > 1 || '⌫↵⇧←→▾'.includes(k) ? ' fn' : '') + (k === '⇧' && gross ? ' on' : ''), style: { flex: BREIT[k] || 1 }, title: k === '▾' ? 'Tastatur ausblenden' : '' }, text);
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); taste(k); }); // Fokus bleibt im Eingabefeld
    return b;
  })));
}
function feuer(el) { el.dispatchEvent(new Event('input', { bubbles: true })); }
function schreibe(t) {
  const el = ziel; if (!el) return;
  try { el.setRangeText(t, el.selectionStart, el.selectionEnd, 'end'); } catch (e) { el.value += t; } // Zahlenfelder kennen keine Schreibmarke
  feuer(el);
}
function taste(k) {
  const el = ziel; if (!el || !document.contains(el)) return weg();
  if (k === '⇧') { gross = !gross; return zeichne(); }
  if (k === '?123' || k === 'abc') { art = k === 'abc' ? 'abc' : 'sym'; return zeichne(); }
  if (k === '▾') { el.blur(); return weg(); }
  if (k === '⌫') {
    try { let a = el.selectionStart, b = el.selectionEnd; if (a === b && a > 0) a -= /[\udc00-\udfff]/.test(el.value[a - 1]) ? 2 : 1; el.setRangeText('', a, b, 'end'); } catch (e) { el.value = el.value.slice(0, -1); }
    return feuer(el);
  }
  if (k === '←' || k === '→') { try { const p = T.clamp(el.selectionStart + (k === '←' ? -1 : 1), 0, el.value.length); el.setSelectionRange(p, p); } catch (e) {} return; }
  if (k === '↵') {
    if (el.tagName === 'TEXTAREA') return schreibe('\n');
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); return;
  }
  schreibe(gross ? k.toUpperCase() : k);
  if (gross) { gross = false; zeichne(); }
}
function zeige(el) {
  clearTimeout(wegT); ziel = el;
  if (!box) { box = h('div', { id: 'tastatur' }); box.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); }); document.body.append(box); }
  art = el.type === 'number' || /decimal|numeric/.test(el.dataset.tastIm || '') ? 'sym' : 'abc'; gross = false; zeichne(); // Zahlenfelder starten mit Ziffern/Zeichen
  box.style.display = 'flex'; document.body.classList.add('tastaturAuf');
  document.documentElement.style.setProperty('--tastH', box.offsetHeight + 'px');
  setTimeout(() => { try { el.scrollIntoView({ block: 'nearest' }); } catch (e) {} }, 60);
}
function weg() {
  ziel = null; if (!box) return;
  box.style.display = 'none'; document.body.classList.remove('tastaturAuf'); document.documentElement.style.setProperty('--tastH', '0px');
}
// Systemtastatur (Windows/Android) unterdrücken, solange die eigene Tastatur an ist
const keineSystemTastatur = el => { if (el.dataset.tastIm == null) el.dataset.tastIm = el.getAttribute('inputmode') || ''; el.setAttribute('inputmode', 'none'); };
document.addEventListener('pointerdown', e => {
  if (!an() || !editierbar(e.target)) return;
  const el = e.target; keineSystemTastatur(el); setTimeout(() => { if (document.activeElement === el && ziel !== el) zeige(el); }, 80); // falls kein focusin kommt
}, true);
document.addEventListener('focusin', e => { if (!an() || !editierbar(e.target)) return; keineSystemTastatur(e.target); zeige(e.target); });
document.addEventListener('focusout', () => { clearTimeout(wegT); wegT = setTimeout(() => { if (!editierbar(document.activeElement)) weg(); }, 120); });
T.tastaturUmschalten = () => {
  if (an()) { if (editierbar(document.activeElement)) { keineSystemTastatur(document.activeElement); zeige(document.activeElement); } return; }
  weg();
  for (const el of document.querySelectorAll('[data-tast-im]')) { if (el.dataset.tastIm) el.setAttribute('inputmode', el.dataset.tastIm); else el.removeAttribute('inputmode'); delete el.dataset.tastIm; }
};
})();
