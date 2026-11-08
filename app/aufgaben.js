// Tafel-App – Aufgabengenerator Mathematik Jg. 5–10 (Zufallsaufgaben mit Lösungen, Niveau in Sternen)
// Kategorien angelehnt an die Leitideen des Kerncurriculums Mathematik (Niedersachsen, Oberschule):
// Zahlen und Operationen · Größen und Messen · Raum und Form · Funktionaler Zusammenhang · Daten und Zufall
'use strict';
(function () {
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const ggt = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const kgv = (a, b) => a / ggt(a, b) * b;
const n = v => (Math.round(v * 1e6) / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 6 }).replace('-', '−');
const r2 = v => n(Math.round(v * 100) / 100);   // auf 2 Nachkommastellen
const r1 = v => n(Math.round(v * 10) / 10);
const z = v => v < 0 ? '(' + n(v) + ')' : n(v);       // negative Zahl in Klammern
const br = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = ggt(p, q); p /= g; q /= g; return q === 1 ? n(p) : `${p < 0 ? '−' : ''}${Math.abs(p)}/${q}`; };
const gem = (p, q) => { const g = ggt(p, q); p /= g; q /= g; if (q === 1) return n(p); if (Math.abs(p) > q) { const g0 = Math.trunc(p / q), r = Math.abs(p % q); return `${p}/${q} = ${g0} ${r}/${q}`; } return `${p}/${q}`; };
const term = (m, b) => { let s = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? '−x' : n(m) + 'x'; if (b) s += (s ? (b > 0 ? ' + ' : ' − ') + n(Math.abs(b)) : n(b)); return s || '0'; };
// Summe von Termen [[Koeffizient, Variable], …] → „3x² − x + 5“
const poly = teile => { let s = ''; for (const [c, v] of teile) { if (!c) continue; const a = Math.abs(c), k = (a === 1 && v ? '' : n(a)) + v;
  s += s ? (c < 0 ? ' − ' : ' + ') + k : (c < 0 ? '−' : '') + k; } return s || '0'; };
const HOCH = '⁰¹²³⁴⁵⁶⁷⁸⁹', hoch = e => String(e).replace('-', '⁻').replace(/\d/g, d => HOCH[d]);
const mischen = a => { for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const tausend = v => n(v); // de-DE gruppiert große Zahlen mit Punkt
const eur = v => { v = Math.round(v * 100) / 100; return v.toLocaleString('de-DE', Number.isInteger(v) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('-', '−') + ' €'; };
const hm = m => `${Math.floor(m / 60)} h` + (m % 60 ? ` ${m % 60} min` : '');

// Einheiten umrechnen: e = Einheiten (klein → groß), f = Faktoren zur kleinsten Einheit
function umrechnen(e, f, s) {
  let i, j, v;
  if (s === 1) { i = R(1, e.length - 1); j = i - 1; v = R(2, 25); }               // groß → klein, ganze Zahlen
  else if (s === 2) { i = R(0, e.length - 2); j = i + 1; v = R(15, 950); }        // klein → groß, Kommazahl
  else { i = R(0, e.length - 1); do j = R(0, e.length - 1); while (Math.abs(i - j) !== 2); v = j < i ? R(12, 95) / 10 : R(120, 9500); }
  return [`${n(v)} ${e[i]} = ___ ${e[j]}`, `${n(v * f[i] / f[j])} ${e[j]}`];
}

// kat = Kategorie, jg = [von, bis] Jahrgang, frage = Aufgabe ist ein Satz (kein „=“ anhängen)
T.AUFGABEN_KAT = [
  ['zahl', 'Grundrechenarten & natürliche Zahlen'], ['bruch', 'Brüche & Dezimalzahlen'], ['ganz', 'Ganze & rationale Zahlen'],
  ['groesse', 'Größen & Einheiten'], ['geo', 'Geometrie'], ['prozent', 'Zuordnungen, Prozent & Zinsen'],
  ['term', 'Terme & Gleichungen'], ['fkt', 'Funktionen'], ['daten', 'Daten & Zufall']];

T.AUFGABEN = {
  // ---------- Grundrechenarten & natürliche Zahlen ----------
  stellen: { kat: 'zahl', jg: [5, 6], frage: true, name: 'Große Zahlen & Stellenwerte', gen: s => {
    if (s === 1) { const st = [R(1, 9), R(0, 9), R(1, 9), R(0, 9)]; return [`Schreibe als Zahl: ${st[0]} T, ${st[1]} H, ${st[2]} Z, ${st[3]} E`, tausend(st[0] * 1000 + st[1] * 100 + st[2] * 10 + st[3])]; }
    if (s === 2) { const m = R(1, 99), t = R(0, 999), e = R(0, 999); return [`In Ziffern: ${m} Millionen ${t} Tausend ${e}`, tausend(m * 1e6 + t * 1000 + e)]; }
    const zahl = R(10000000, 99999999), stelle = pick([['Zehntausender', 1e4], ['Hunderttausender', 1e5], ['Millionen', 1e6], ['Tausender', 1e3]]);
    return [`Welche Ziffer steht in ${tausend(zahl)} an der ${stelle[0]}stelle?`, String(Math.floor(zahl / stelle[1]) % 10)];
  } },
  runden: { kat: 'zahl', jg: [5, 6], frage: true, name: 'Runden', gen: s => {
    const [a, st] = s === 1 ? [R(1001, 9999), pick([['Zehner', 10], ['Hunderter', 100]])] : s === 2 ? [R(100001, 999999), pick([['Tausender', 1e3], ['Zehntausender', 1e4]])] : [R(10000001, 999999999), pick([['Hunderttausender', 1e5], ['Millionen', 1e6]])];
    return [`Runde ${tausend(a)} auf ${st[0]}:`, tausend(Math.round(a / st[1]) * st[1])];
  } },
  plus: { kat: 'zahl', jg: [5, 6], name: 'Addition', gen: s => { const M = [0, 100, 1000, 1000000][s]; const a = R(M / 10, M * 0.6 | 0), b = R(M / 20 | 1, M - a); return [`${n(a)} + ${n(b)}`, n(a + b)]; } },
  minus: { kat: 'zahl', jg: [5, 6], name: 'Subtraktion', gen: s => { const M = [0, 100, 1000, 1000000][s]; const a = R(M / 4 | 0, M), b = R(1, a); return [`${n(a)} − ${n(b)}`, n(a - b)]; } },
  einmaleins: { kat: 'zahl', jg: [5, 6], name: 'Einmaleins-Reihe', gen: s => { const r = s === 1 ? pick([2, 5, 10]) : s === 2 ? pick([3, 4, 6]) : pick([7, 8, 9]), k = R(1, 10); return pick([[`${k} · ${r}`, n(k * r)], [`${k * r} : ${r}`, n(k)]]); } },
  mal: { kat: 'zahl', jg: [5, 6], name: 'Multiplikation', gen: s => { const [a, b] = s === 1 ? [R(2, 10), R(2, 10)] : s === 2 ? [R(12, 99), R(3, 9)] : [R(101, 999), R(12, 99)]; return [`${n(a)} · ${n(b)}`, n(a * b)]; } },
  geteilt: { kat: 'zahl', jg: [5, 6], name: 'Division', gen: s => {
    if (s === 1) { const b = R(2, 10), q = R(2, 10); return [`${n(b * q)} : ${b}`, n(q)]; }
    if (s === 2) { const b = R(3, 9), q = R(21, 199); return [`${n(b * q)} : ${b}`, n(q)]; }
    const b = R(12, 48), q = R(31, 299), r = R(0, b - 1); return [`${n(b * q + r)} : ${b}`, r ? `${n(q)} Rest ${r}` : n(q)];
  } },
  punkt: { kat: 'zahl', jg: [5, 6], name: 'Punkt vor Strich & Klammern', gen: s => {
    const a = R(2, 20), b = R(2, 9), c = R(2, 9), d = R(1, 30);
    if (s === 1) return [`${a} + ${b} · ${c}`, n(a + b * c)];
    if (s === 2) return [`(${a} + ${b}) · ${c} − ${d}`, n((a + b) * c - d)];
    const e = R(-12, -2); return [`${z(e)} · (${a} − ${b * c}) + ${d}`, n(e * (a - b * c) + d)];
  } },
  potenz: { kat: 'zahl', jg: [5, 6], name: 'Potenzen & Quadratzahlen', gen: s => {
    if (s === 1) { const a = R(2, 20); return [`${a}²`, n(a * a)]; }
    if (s === 2) { const [a, e] = pick([[2, R(3, 8)], [3, R(3, 4)], [4, 3], [5, 3], [10, R(3, 6)]]); return [`${a}${hoch(e)}`, tausend(a ** e)]; }
    const a = R(2, 5), e = R(2, 3), b = R(2, 9); return [`${a}${hoch(e)} + ${b}²`, n(a ** e + b * b)];
  } },
  teiler: { kat: 'zahl', jg: [5, 6], frage: true, name: 'Teiler, ggT, kgV & Primfaktoren', gen: s => {
    if (s === 1) { const a = pick([12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 72]); const t = []; for (let i = 1; i <= a; i++) if (a % i === 0) t.push(i); return [`Alle Teiler von ${a}:`, `T${a} = {${t.join(', ')}}`]; }
    if (s === 2) { const k = R(2, 9), a = k * R(2, 9), b = k * R(2, 9); if (a === b) return T.AUFGABEN.teiler.gen(2); return pick([[`ggT(${a}; ${b})`, n(ggt(a, b))], [`kgV(${a}; ${b})`, n(kgv(a, b))]]); }
    const f = [pick([2, 2, 2, 3]), pick([2, 3, 3, 5]), pick([2, 3, 5, 7]), pick([2, 3, 5, 7, 11])].sort((x, y) => x - y), a = f.reduce((x, y) => x * y, 1);
    const cnt = {}; f.forEach(p => cnt[p] = (cnt[p] || 0) + 1);
    return [`Primfaktorzerlegung von ${a}:`, `${a} = ` + Object.keys(cnt).map(p => p + (cnt[p] > 1 ? hoch(cnt[p]) : '')).join(' · ')];
  } },
  // ---------- Brüche & Dezimalzahlen ----------
  kuerzen: { kat: 'bruch', jg: [5, 6], name: 'Brüche kürzen & erweitern', gen: s => {
    const q = R(2, [0, 6, 12, 25][s]), p = R(1, q - 1), k = R(2, [0, 5, 9, 15][s]);
    if (s === 3 && Math.random() < 0.5) { const g = ggt(p, q), pp = p / g, qq = q / g; return [`Erweitere ${pp}/${qq} auf den Nenner ${qq * k}:`, `${pp * k}/${qq * k}`]; }
    return [`Kürze ${p * k}/${q * k}`, br(p, q)];
  } },
  vergleich: { kat: 'bruch', jg: [5, 6], name: 'Brüche vergleichen (<, >, =)', gen: s => {
    let a, b, c, d;
    if (s === 1) { b = d = R(3, 12); a = R(1, b - 1); do c = R(1, d - 1); while (c === a); }
    else if (s === 2) { a = c = R(1, 5); b = R(a + 1, 12); do d = R(a + 1, 13); while (d === b); }
    else { b = R(3, 12); d = R(3, 12); a = R(1, b - 1); c = R(1, d - 1); }
    const v = a * d - c * b; return [`${a}/${b}  ☐  ${c}/${d}`, `${a}/${b} ${v < 0 ? '<' : v > 0 ? '>' : '='} ${c}/${d}`];
  } },
  umwandeln: { kat: 'bruch', jg: [6, 8], frage: true, name: 'Bruch – Dezimalzahl – Prozent', gen: s => {
    const q = pick(s === 1 ? [2, 4, 5, 10] : [4, 5, 8, 20, 25, 40, 50]), p = R(1, q - 1);
    if (s === 1) return [`${p}/${q} als Dezimalzahl:`, n(p / q)];
    if (s === 2) { const d = R(1, 99) / 100; return [`${n(d)} als Bruch (gekürzt):`, br(Math.round(d * 100), 100)]; }
    const pz = R(1, 199) / 2; return pick([[`${p}/${q} in Prozent:`, n(p / q * 100) + ' %'], [`${n(pz)} % als Dezimalzahl:`, n(pz / 100)]]);
  } },
  bruchteil: { kat: 'bruch', jg: [5, 6], frage: true, name: 'Bruchteile von Größen', gen: s => {
    const q = R(2, s === 1 ? 5 : 12), p = s === 1 ? 1 : R(1, q - 1), [e, k] = pick([['kg', 1], ['m', 1], ['€', 1], ['min', 1], ['l', 1]]);
    const g = q * R(2, s === 3 ? 40 : 12) * k; return [`${p}/${q} von ${n(g)} ${e}`, `${n(g / q * p)} ${e}`];
  } },
  bruchplus: { kat: 'bruch', jg: [6, 7], name: 'Brüche addieren & subtrahieren', gen: s => {
    if (s === 1) { const q = R(3, 12), op = pick(['+', '−']); let a = R(1, q - 1), b = R(1, q - 1); while (op === '−' && a === b) b = R(1, q - 1); if (op === '−' && a < b) [a, b] = [b, a]; return [`${a}/${q} ${op} ${b}/${q}`, op === '+' ? gem(a + b, q) : br(a - b, q)]; }
    let q1 = R(2, s === 2 ? 6 : 12), q2 = R(2, s === 2 ? 6 : 12), a = R(1, q1 * (s === 3 ? 2 : 1) - 1), b = R(1, q2 - 1); const op = pick(['+', '−']);
    while (a * q2 === b * q1) { b = R(1, q2 - 1); if (q2 === 2) q2 = 3; } // keine gleichen Brüche (Ergebnis 0 bzw. trivial)
    if (op === '−' && s < 3 && a * q2 < b * q1) [a, q1, b, q2] = [b, q2, a, q1];
    return [`${a}/${q1} ${op} ${b}/${q2}`, op === '+' ? gem(a * q2 + b * q1, q1 * q2) : br(a * q2 - b * q1, q1 * q2)];
  } },
  bruchmal: { kat: 'bruch', jg: [6, 7], name: 'Brüche multiplizieren & dividieren', gen: s => {
    const q1 = R(2, 4 + 3 * s), q2 = R(2, 4 + 3 * s), a = R(1, q1 + (s === 3 ? 5 : -1)), b = R(1, q2 - 1), op = s === 1 ? '·' : pick(['·', ':']);
    return [`${a}/${q1} ${op} ${b}/${q2}`, op === '·' ? br(a * b, q1 * q2) : br(a * q2, q1 * b)];
  } },
  dezimal: { kat: 'bruch', jg: [5, 6], name: 'Dezimalzahlen addieren & subtrahieren', gen: s => {
    const a = R(10, [0, 99, 999, 9999][s]) / 10 ** R(1, s === 1 ? 1 : 2), b = R(10, [0, 99, 999, 999][s]) / 10 ** R(1, 2), op = pick(['+', '−']);
    const [x, y] = op === '−' && b > a ? [b, a] : [a, b];
    return [`${n(x)} ${op} ${n(y)}`, n(op === '+' ? x + y : x - y)];
  } },
  dezimalmal: { kat: 'bruch', jg: [5, 6], name: 'Dezimalzahlen multiplizieren & dividieren', gen: s => {
    if (s === 1) { const a = R(11, 9999) / 10 ** R(1, 3), k = pick([10, 100, 1000]), op = pick(['·', ':']); return [`${n(a)} ${op} ${tausend(k)}`, n(op === '·' ? a * k : a / k)]; }
    const b = R(2, 9) / (s === 2 ? 10 : pick([10, 100])), q = R(2, s === 2 ? 30 : 250) / 10;
    return pick([[`${n(b)} · ${n(q)}`, n(b * q)], [`${n(Math.round(b * q * 1e6) / 1e6)} : ${n(b)}`, n(q)]]);
  } },
  // ---------- Ganze & rationale Zahlen ----------
  ganz: { kat: 'ganz', jg: [6, 8], name: 'Ganze Zahlen addieren & subtrahieren', gen: s => {
    const M = [0, 20, 100, 1000][s], a = R(-M, M), b = R(-M, M), op = pick(['+', '−']);
    return [`${z(a)} ${op} ${z(b)}`, n(op === '+' ? a + b : a - b)];
  } },
  ganzmal: { kat: 'ganz', jg: [7, 8], name: 'Ganze Zahlen multiplizieren & dividieren', gen: s => {
    const a = R(-12, 12) || 3, b = R(-12, 12) || -4;
    if (s === 1) return [`${z(a)} · ${z(b)}`, n(a * b)];
    if (s === 2) return [`${z(a * b)} : ${z(b)}`, n(a)];
    const c = pick([-3, -2, 2, 3, -5]); return [`${z(a * c)} · ${z(b)} : ${z(c)}`, n(a * b)]; // Ergebnis immer ganzzahlig
  } },
  rational: { kat: 'ganz', jg: [7, 8], name: 'Rationale Zahlen', gen: s => {
    if (s === 1) { const a = R(-99, 99) / 10, b = R(-99, 99) / 10, op = pick(['+', '−']); return [`${z(a)} ${op} ${z(b)}`, n(op === '+' ? a + b : a - b)]; }
    if (s === 2) { const q1 = R(2, 6), q2 = R(2, 6), ok = (v, q) => v % q ? v : v + 1, a = ok(R(-q1 * 2, q1 * 2), q1), b = ok(R(-q2 * 2, q2 * 2), q2), op = pick(['+', '−']);
      const bz = (p, q) => p < 0 ? `(−${-p}/${q})` : `${p}/${q}`; return [`${bz(a, q1)} ${op} ${bz(b, q2)}`, br(op === '+' ? a * q2 + b * q1 : a * q2 - b * q1, q1 * q2)]; }
    const a = R(-60, 60) / 10 || 1.5, b = pick([-0.5, -2, 4, -0.2, 2.5, -4]), op = pick(['·', ':']); return [`${z(a)} ${op} ${z(b)}`, n(op === '·' ? a * b : a / b)];
  } },
  // ---------- Größen & Einheiten ----------
  laengen: { kat: 'groesse', jg: [5, 6], name: 'Längen umrechnen', gen: s => umrechnen(['mm', 'cm', 'dm', 'm', 'km'], [1, 10, 100, 1000, 1e6], s) },
  gewichte: { kat: 'groesse', jg: [5, 6], name: 'Gewichte umrechnen', gen: s => umrechnen(['mg', 'g', 'kg', 't'], [1, 1e3, 1e6, 1e9], s) },
  zeit: { kat: 'groesse', jg: [5, 6], frage: true, name: 'Zeit & Zeitspannen', gen: s => {
    if (s === 1) return pick([(() => { const h = R(2, 12); return [`${h} h = ___ min`, `${h * 60} min`]; })(), (() => { const m = R(2, 15); return [`${m} min = ___ s`, `${m * 60} s`]; })(), (() => { const d = R(2, 7); return [`${d} Tage = ___ h`, `${d * 24} h`]; })()]);
    if (s === 2) { const m = R(61, 400); return [`${m} min = ___ h ___ min`, hm(m)]; }
    const a = R(7 * 12, 12 * 12) * 5, d = R(15, 80) * 5, b = a + d, uhr = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')} Uhr`;
    return [`Zeitspanne von ${uhr(a)} bis ${uhr(b)}?`, d < 60 ? `${d} min` : hm(d)];
  } },
  flaecheneinh: { kat: 'groesse', jg: [5, 6], name: 'Flächeneinheiten umrechnen', gen: s => umrechnen(['mm²', 'cm²', 'dm²', 'm²', 'a', 'ha', 'km²'], [1, 100, 1e4, 1e6, 1e8, 1e10, 1e12], s) },
  volumeneinh: { kat: 'groesse', jg: [5, 6], name: 'Volumeneinheiten umrechnen', gen: s => s === 3 && Math.random() < 0.5
    ? pick([(() => { const v = R(2, 95) / 10; return [`${n(v)} l = ___ cm³`, `${n(v * 1000)} cm³`]; })(), (() => { const v = R(150, 9500); return [`${n(v)} ml = ___ l`, `${n(v / 1000)} l`]; })(), (() => { const v = R(2, 40) / 10; return [`${n(v)} m³ = ___ l`, `${n(v * 1000)} l`]; })()])
    : umrechnen(['mm³', 'cm³', 'dm³', 'm³'], [1, 1e3, 1e6, 1e9], Math.min(s, 2)) },
  massstab: { kat: 'groesse', jg: [5, 7], frage: true, name: 'Maßstab', gen: s => {
    const M = pick([1000, 2000, 5000, 10000, 25000, 50000, 100000]);
    if (s === 1) { const k = R(2, 12); return [`Maßstab 1 : ${tausend(M)}, auf der Karte ${k} cm. Wirklichkeit?`, M * k >= 100000 ? `${n(M * k / 100000)} km` : `${n(M * k / 100)} m`]; }
    if (s === 2) { const k = R(2, 15) / 2, wm = M * k / 100; return [`Maßstab 1 : ${tausend(M)}, in Wirklichkeit ${wm >= 1000 ? n(wm / 1000) + ' km' : n(wm) + ' m'}. Wie lang auf der Karte?`, `${n(k)} cm`]; }
    const k = R(2, 10); return [`${k} cm auf der Karte sind ${n(M * k / 100000)} km in Wirklichkeit. Maßstab?`, `1 : ${tausend(M)}`];
  } },
  // ---------- Geometrie ----------
  rechteck: { kat: 'geo', jg: [5, 6], frage: true, name: 'Umfang & Fläche (Rechteck, Quadrat)', gen: s => {
    const a = R(3, 20), b = R(2, 15);
    if (s === 1) return pick([[`Rechteck a = ${a} cm, b = ${b} cm: U und A?`, `U = ${2 * (a + b)} cm;  A = ${a * b} cm²`], [`Quadrat a = ${a} cm: U und A?`, `U = ${4 * a} cm;  A = ${a * a} cm²`]]);
    if (s === 2) return [`Rechteck A = ${a * b} cm², a = ${a} cm: b und U?`, `b = ${b} cm;  U = ${2 * (a + b)} cm`];
    return [`Rechteck U = ${2 * (a + b)} m, a = ${a} m: b und A?`, `b = ${b} m;  A = ${a * b} m²`];
  } },
  quader: { kat: 'geo', jg: [5, 6], frage: true, name: 'Würfel & Quader (V, O)', gen: s => {
    const a = R(2, 12), b = R(2, 10), c = R(2, 9);
    if (s === 1) return [`Würfel a = ${a} cm: V und O?`, `V = ${a ** 3} cm³;  O = ${6 * a * a} cm²`];
    if (s === 2) return [`Quader a = ${a} cm, b = ${b} cm, c = ${c} cm: V und O?`, `V = ${a * b * c} cm³;  O = ${2 * (a * b + a * c + b * c)} cm²`];
    return [`Quader V = ${a * b * c} cm³, a = ${a} cm, b = ${b} cm: c?`, `c = ${c} cm`];
  } },
  winkel: { kat: 'geo', jg: [5, 8], frage: true, name: 'Winkel berechnen', gen: s => {
    if (s === 1) { const a = R(15, 165); return pick([[`α = ${a}°. Nebenwinkel β?`, `β = ${180 - a}°`], [`α = ${a}°. Scheitelwinkel β?`, `β = ${a}°`]]); }
    if (s === 2) { const a = R(20, 100), b = R(20, 150 - a); return [`Dreieck: α = ${a}°, β = ${b}°. γ?`, `γ = ${180 - a - b}°`]; }
    return pick([(() => { const g = R(10, 70) * 2; return [`Gleichschenkliges Dreieck, Winkel an der Spitze γ = ${g}°. Basiswinkel?`, `α = β = ${(180 - g) / 2}°`]; })(),
      (() => { const a = R(50, 120), b = R(50, 120), c = R(50, 120); return a + b + c < 330 ? [`Viereck: α = ${a}°, β = ${b}°, γ = ${c}°. δ?`, `δ = ${360 - a - b - c}°`] : [`Viereck: α = 90°, β = 90°, γ = ${c}°. δ?`, `δ = ${180 - c}°`]; })()]);
  } },
  flaechen: { kat: 'geo', jg: [7, 8], frage: true, name: 'Dreieck, Parallelogramm, Trapez', gen: s => {
    const g = R(3, 16), hh = R(2, 12);
    if (s === 1) return [`Dreieck g = ${g} cm, h = ${hh} cm: A?`, `A = ${n(g * hh / 2)} cm²`];
    if (s === 2) return pick([[`Parallelogramm g = ${g} cm, h = ${hh} cm: A?`, `A = ${g * hh} cm²`], [`Dreieck A = ${n(g * hh / 2)} cm², g = ${g} cm: h?`, `h = ${hh} cm`]]);
    const a = R(6, 18), c = R(2, a - 2); return [`Trapez a = ${a} cm, c = ${c} cm, h = ${hh} cm: A?`, `A = ${n((a + c) / 2 * hh)} cm²`];
  } },
  kreis: { kat: 'geo', jg: [9, 10], frage: true, name: 'Kreis (Umfang, Fläche)', gen: s => {
    const r = R(2, 15);
    if (s === 1) return [`Kreis r = ${r} cm: U?`, `U = 2πr ≈ ${r2(2 * Math.PI * r)} cm`];
    if (s === 2) return pick([[`Kreis d = ${2 * r} cm: A?`, `A = πr² ≈ ${r2(Math.PI * r * r)} cm²`], [`Kreis r = ${r} m: U und A?`, `U ≈ ${r2(2 * Math.PI * r)} m;  A ≈ ${r2(Math.PI * r * r)} m²`]]);
    const U = R(10, 120); return pick([[`Kreis U = ${U} cm: r?`, `r = U : 2π ≈ ${r2(U / 2 / Math.PI)} cm`], [`Kreis A = ${U * 2} cm²: r?`, `r = √(A : π) ≈ ${r2(Math.sqrt(U * 2 / Math.PI))} cm`]]);
  } },
  pythagoras: { kat: 'geo', jg: [9, 10], frage: true, name: 'Satz des Pythagoras', gen: s => {
    const [a0, b0, c0] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]]), k = s === 1 ? 1 : R(1, 3), [a, b, c] = [a0 * k, b0 * k, c0 * k];
    if (s === 1) return [`Rechtwinkliges Dreieck: a = ${a} cm, b = ${b} cm (Katheten). c?`, `c = √(a² + b²) = ${c} cm`];
    if (s === 2) return [`Rechtwinkliges Dreieck: c = ${c} cm (Hypotenuse), a = ${a} cm. b?`, `b = √(c² − a²) = ${b} cm`];
    const x = R(3, 15), y = R(3, 15); return pick([[`Katheten a = ${x} cm, b = ${y} cm. Hypotenuse c?`, `c = √${x * x + y * y} ≈ ${r2(Math.hypot(x, y))} cm`],
      [`Rechteck ${x} m × ${y} m. Länge der Diagonale?`, `d = √${x * x + y * y} ≈ ${r2(Math.hypot(x, y))} m`]]);
  } },
  koerper: { kat: 'geo', jg: [9, 10], frage: true, name: 'Prisma, Zylinder, Pyramide, Kegel, Kugel', gen: s => {
    const r = R(2, 12), hh = R(3, 20), a = R(2, 12);
    if (s === 1) return pick([[`Zylinder r = ${r} cm, h = ${hh} cm: V?`, `V = πr²h ≈ ${r2(Math.PI * r * r * hh)} cm³`], [`Dreiecksprisma: Grundfläche G = ${a * 3} cm², h = ${hh} cm: V?`, `V = G · h = ${a * 3 * hh} cm³`]]);
    if (s === 2) return pick([[`Zylinder r = ${r} cm, h = ${hh} cm: O?`, `O = 2πr² + 2πrh ≈ ${r2(2 * Math.PI * r * r + 2 * Math.PI * r * hh)} cm²`], [`Quadratische Pyramide a = ${a} cm, h = ${hh} cm: V?`, `V = ⅓ · a² · h = ${r2(a * a * hh / 3)} cm³`]]);
    return pick([[`Kegel r = ${r} cm, h = ${hh} cm: V?`, `V = ⅓πr²h ≈ ${r2(Math.PI * r * r * hh / 3)} cm³`], [`Kugel r = ${r} cm: V und O?`, `V = ⁴⁄₃πr³ ≈ ${r2(4 / 3 * Math.PI * r ** 3)} cm³;  O = 4πr² ≈ ${r2(4 * Math.PI * r * r)} cm²`]]);
  } },
  trigo: { kat: 'geo', jg: [9, 10], frage: true, name: 'Sinus, Kosinus, Tangens', gen: s => {
    const rad = d => d * Math.PI / 180, grad = x => x * 180 / Math.PI, al = R(15, 75), c = R(4, 20), a = R(3, 15), b = R(3, 15);
    if (s === 1) return pick([[`Rechtwinkliges Dreieck (γ = 90°): α = ${al}°, c = ${c} cm. a?`, `a = c · sin α ≈ ${r2(c * Math.sin(rad(al)))} cm`], [`Rechtwinkliges Dreieck (γ = 90°): α = ${al}°, c = ${c} cm. b?`, `b = c · cos α ≈ ${r2(c * Math.cos(rad(al)))} cm`]]);
    if (s === 2) return [`Rechtwinkliges Dreieck (γ = 90°): a = ${a} cm, b = ${b} cm. α?`, `tan α = a : b → α ≈ ${r1(grad(Math.atan(a / b)))}°`];
    return [`Rechtwinkliges Dreieck (γ = 90°): α = ${al}°, b = ${b} cm. a und c?`, `a = b · tan α ≈ ${r2(b * Math.tan(rad(al)))} cm;  c = b : cos α ≈ ${r2(b / Math.cos(rad(al)))} cm`];
  } },
  // ---------- Zuordnungen, Prozent & Zinsen ----------
  dreisatz: { kat: 'prozent', jg: [7, 8], frage: true, name: 'Dreisatz (proportional, antiproportional)', gen: s => {
    const prop = () => { // Stückpreise in Cent (5er-Schritte), realistisch je Ware
      const [mz, von, bis] = pick([['Hefte', 50, 200], ['Brötchen', 30, 80], ['Kinokarten', 600, 1200], ['Liter Saft', 100, 300], ['Kugeln Eis', 100, 200]]), u = R(von / 5, bis / 5) * 5 / 100, a = R(2, 6); let b = R(2, 12); if (b === a) b++;
      return [`${a} ${mz} kosten ${eur(a * u)}. Wie viel kosten ${b} ${mz}?`, eur(b * u)]; };
    const anti = () => { const t = R(2, 12), a = R(2, 8), W = a * t, tl = []; for (let i = 2; i <= W; i++) if (W % i === 0 && i !== a && W / i <= 40) tl.push(i); if (!tl.length) return prop(); const b = pick(tl);
      return [`${a} Personen brauchen ${t} Tage. Wie lange brauchen ${b} Personen (gleiches Tempo)?`, W / b === 1 ? '1 Tag' : `${n(W / b)} Tage`]; };
    return s === 1 ? prop() : s === 2 ? anti() : pick([prop, anti])();
  } },
  prozent: { kat: 'prozent', jg: [7, 8], name: 'Prozentrechnung (W, G, p %)', gen: s => {
    const p = s === 1 ? pick([10, 20, 25, 50, 75]) : R(1, 19) * 5, G = R(2, 40) * (s === 1 ? 20 : 10), W = G * p / 100;
    if (s < 3) return [`${p} % von ${eur(G)}`, eur(W)];
    return pick([[`${eur(W)} sind ${p} %. Grundwert?`, eur(G)], [`${eur(W)} von ${eur(G)} sind wie viel Prozent?`, n(p) + ' %']]);
  } },
  prozentaend: { kat: 'prozent', jg: [7, 8], frage: true, name: 'Prozentuale Änderung, Rabatt, MwSt.', gen: s => {
    const G = R(4, 40) * 10, p = R(1, 8) * 5;
    if (s === 1) return pick([[`Preis ${eur(G)} wird um ${p} % gesenkt. Neuer Preis?`, eur(G * (1 - p / 100))], [`Preis ${eur(G)} wird um ${p} % erhöht. Neuer Preis?`, eur(G * (1 + p / 100))]]);
    if (s === 2) { const up = Math.random() < 0.5; return [`Preis ändert sich von ${eur(G)} auf ${eur(G * (1 + (up ? p : -p) / 100))}. Um wie viel Prozent?`, `${up ? '+' : '−'}${p} %`]; }
    return pick([[`Nach ${p} % Rabatt kostet es ${eur(G * (1 - p / 100))}. Ursprünglicher Preis?`, eur(G)], [`Preis mit 19 % MwSt.: ${eur(G * 1.19)}. Preis ohne MwSt.?`, eur(G)]]);
  } },
  zinsen: { kat: 'prozent', jg: [7, 10], frage: true, name: 'Zinsen & Zinseszins', gen: s => {
    const K = R(5, 100) * 100, p = pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]);
    if (s === 1) return [`Kapital ${eur(K)}, Zinssatz ${n(p)} %. Jahreszinsen?`, `Z = ${eur(K * p / 100)}`];
    if (s === 2) { const m = pick([3, 4, 6, 8, 9]); return [`Kapital ${eur(K)}, Zinssatz ${n(p)} %, ${m} Monate. Zinsen?`, `Z = ${eur(K * p / 100 * m / 12)}`]; }
    const j = R(2, 10); return [`${eur(K)} werden ${j} Jahre mit ${n(p)} % verzinst (Zinseszins). Endkapital?`, `K = ${tausend(K)} · ${n(1 + p / 100)}${hoch(j)} ≈ ${eur(K * (1 + p / 100) ** j)}`];
  } },
  // ---------- Terme & Gleichungen ----------
  terme: { kat: 'term', jg: [7, 8], name: 'Terme zusammenfassen', gen: s => {
    if (s === 1) { const c = [R(1, 9), R(1, 9), -R(1, 5)]; return [poly(c.map(k => [k, 'x'])), poly([[c[0] + c[1] + c[2], 'x']])]; }
    if (s === 2) { const a1 = R(1, 9), b1 = R(1, 9), a2 = R(-6, 6) || 2, b2 = R(-6, 6) || -3; return [poly([[a1, 'a'], [b1, 'b'], [a2, 'a'], [b2, 'b']]), poly([[a1 + a2, 'a'], [b1 + b2, 'b']])]; }
    const q1 = R(-5, 5) || 2, l1 = R(-9, 9), q2 = R(-5, 5) || -1, l2 = R(-9, 9), k = R(-9, 9);
    return [poly([[q1, 'x²'], [l1, 'x'], [q2, 'x²'], [l2, 'x'], [k, '']]), poly([[q1 + q2, 'x²'], [l1 + l2, 'x'], [k, '']])];
  } },
  klammern: { kat: 'term', jg: [7, 8], name: 'Ausmultiplizieren & Ausklammern', gen: s => {
    if (s === 1) { const a = R(2, 9), b = R(1, 12), sg = pick([1, -1]); return [`${a}(x ${sg > 0 ? '+' : '−'} ${b})`, poly([[a, 'x'], [sg * a * b, '']])]; }
    if (s === 2) { const a = -R(2, 9), b = R(2, 6), c = R(1, 9) * pick([1, -1]); return [`${n(a)}(${b}x ${c > 0 ? '+' : '−'} ${Math.abs(c)})`, poly([[a * b, 'x'], [a * c, '']])]; }
    if (Math.random() < 0.5) { const p = R(-9, 9) || 2, q = R(-9, 9) || -3; return [`(x ${p > 0 ? '+' : '−'} ${Math.abs(p)})(x ${q > 0 ? '+' : '−'} ${Math.abs(q)})`, poly([[1, 'x²'], [p + q, 'x'], [p * q, '']])]; }
    const k = R(2, 9), a = R(1, 9), b = R(1, 9); if (ggt(a, b) > 1) return T.AUFGABEN.klammern.gen(3);
    return [`Klammere aus: ${poly([[k * a, 'x'], [k * b, '']])}`, `${k}(${poly([[a, 'x'], [b, '']])})`];
  } },
  binom: { kat: 'term', jg: [9, 10], name: 'Binomische Formeln', gen: s => {
    const a = R(1, 12), b = R(2, 5);
    if (s === 1) return pick([[`(x + ${a})²`, poly([[1, 'x²'], [2 * a, 'x'], [a * a, '']])], [`(x − ${a})²`, poly([[1, 'x²'], [-2 * a, 'x'], [a * a, '']])]]);
    if (s === 2) return pick([[`(${b}x + ${a})²`, poly([[b * b, 'x²'], [2 * a * b, 'x'], [a * a, '']])], [`(${b}x − ${a})(${b}x + ${a})`, poly([[b * b, 'x²'], [-a * a, '']])]]);
    return pick([[`Als Produkt: ${poly([[1, 'x²'], [-a * a, '']])}`, `(x + ${a})(x − ${a})`], [`Als Quadrat: ${poly([[1, 'x²'], [2 * a, 'x'], [a * a, '']])}`, `(x + ${a})²`], [`Als Quadrat: ${poly([[b * b, 'x²'], [-2 * a * b, 'x'], [a * a, '']])}`, `(${b}x − ${a})²`]]);
  } },
  gleichung: { kat: 'term', jg: [7, 8], name: 'Lineare Gleichungen lösen', gen: s => {
    const x = R(-9, 12);
    if (s === 1) { const a = R(2, 30); return [`x + ${a} = ${n(x + a)}`, 'x = ' + n(x)]; }
    const a = pick([2, 3, 4, 5, 6, -2, -3]), b = R(-15, 15);
    if (s === 2) return [`${term(a, b)} = ${n(a * x + b)}`, 'x = ' + n(x)];
    const c = pick([1, 2, -1, 7].filter(v => v !== a)), d = (a - c) * x + b;
    return [`${term(a, b)} = ${term(c, d)}`, 'x = ' + n(x)];
  } },
  lgs: { kat: 'term', jg: [9, 10], frage: true, name: 'Lineare Gleichungssysteme', gen: s => {
    const x = R(-6, 8), y = R(-6, 8);
    const gl = (a, b) => `${poly([[a, 'x'], [b, 'y']])} = ${n(a * x + b * y)}`;
    if (s === 1) { const m = R(-3, 3) || 2, c = y - m * x, a = R(1, 4), b = R(1, 4); return [`I: y = ${term(m, c)}   II: ${gl(a, b)}`, `x = ${n(x)};  y = ${n(y)}`]; }
    let a1, b1, a2, b2; do { const M = s === 2 ? 4 : 9; a1 = R(-M, M); b1 = R(-M, M); a2 = R(-M, M); b2 = R(-M, M); } while (!a1 || !b1 || !a2 || !b2 || a1 * b2 - a2 * b1 === 0 || (s === 2 && Math.abs(a1) !== Math.abs(a2) && Math.abs(b1) !== Math.abs(b2)));
    return [`I: ${gl(a1, b1)}   II: ${gl(a2, b2)}`, `x = ${n(x)};  y = ${n(y)}`];
  } },
  quadgl: { kat: 'term', jg: [9, 10], frage: true, name: 'Quadratische Gleichungen', gen: s => {
    if (s === 1) { const r = R(1, 12), a = pick([1, 1, 2, 3]); return pick([[`x² = ${r * r}`, `x₁ = ${r};  x₂ = −${r}`], [`${a === 1 ? '' : a}x² − ${a * r * r} = 0`, `x₁ = ${r};  x₂ = −${r}`]]); }
    let p, q; do { p = R(-9, 9); q = R(-9, 9); } while (p === q || !p || !q);
    const sol = `x₁ = ${n(Math.max(p, q))};  x₂ = ${n(Math.min(p, q))}`;
    if (s === 2) return [`${poly([[1, 'x²'], [-(p + q), 'x'], [p * q, '']])} = 0`, sol];
    const a = pick([2, 3, -1, -2]); return [`${poly([[a, 'x²'], [-a * (p + q), 'x'], [a * p * q, '']])} = 0`, sol];
  } },
  wurzel: { kat: 'term', jg: [8, 10], name: 'Wurzeln, Potenzen, Zehnerpotenzen', gen: s => {
    if (s === 1) { const a = R(2, 20); return pick([[`√${a * a}`, n(a)], [`√${n(a * a / 100)}`, n(a / 10)]]); }
    if (s === 2) { const m = R(11, 99) / 10, e = Math.random() < 0.5 ? R(3, 9) : -R(2, 4); return pick([[`${n(m * 10 ** e)} in wissenschaftlicher Schreibweise:`, `${n(m)} · 10${hoch(e)}`], [`${n(m)} · 10${hoch(e)} als Dezimalzahl:`, n(m * 10 ** e)]]); }
    const v = pick(['a', 'x', 'y']), p = R(2, 6), q = R(2, 5);
    return pick([[`${v}${hoch(p)} · ${v}${hoch(q)}`, v + hoch(p + q)], [`${v}${hoch(p + q)} : ${v}${hoch(q)}`, v + hoch(p)], [`(${v}${hoch(p)})${hoch(q)}`, v + hoch(p * q)]]);
  } },
  // ---------- Funktionen ----------
  linear: { kat: 'fkt', jg: [7, 8], name: 'Lineare Funktionen', graph: true, gen: s => {
    const m = s === 1 ? R(-3, 3) || 1 : pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]), b = R(-4, 4);
    if (s === 1) return [`f(x) = ${term(m, b)}: Wertetabelle für x = −2 … 2`, [-2, -1, 0, 1, 2].map(x => `f(${n(x)}) = ${n(m * x + b)}`).join(';  '), term(m, b)];
    if (s === 2) return [`Bestimme m und b von {f} (Graph)`, `f(x) = ${term(m, b)}   (m = ${n(m)}, b = ${n(b)})`, term(m, b)];
    const x1 = R(-4, 0), x2 = x1 + R(1, 4); return [`Gerade durch P(${n(x1)} | ${n(m * x1 + b)}) und Q(${n(x2)} | ${n(m * x2 + b)})`, `f(x) = ${term(m, b)}`, term(m, b)];
  } },
  quadfkt: { kat: 'fkt', jg: [9, 10], frage: true, name: 'Quadratische Funktionen (Scheitelpunkt)', gen: s => {
    const d = R(-5, 5), e = R(-6, 6), klam = d === 0 ? 'x²' : `(x ${d > 0 ? '−' : '+'} ${Math.abs(d)})²`;
    if (s === 1) return [`f(x) = ${klam}${e ? (e > 0 ? ' + ' : ' − ') + Math.abs(e) : ''}: Scheitelpunkt?`, `S(${n(d)} | ${n(e)})`];
    if (s === 2) { const c = R(-4, 4); return [`f(x) = x² ${c >= 0 ? '+' : '−'} ${Math.abs(c)}: Wertetabelle für x = −2 … 2`, [-2, -1, 0, 1, 2].map(x => `f(${n(x)}) = ${n(x * x + c)}`).join(';  ')]; }
    return [`f(x) = ${poly([[1, 'x²'], [-2 * d, 'x'], [d * d + e, '']])}: Scheitelpunkt (quadratische Ergänzung)?`, `f(x) = ${klam}${e ? (e > 0 ? ' + ' : ' − ') + Math.abs(e) : ''}  →  S(${n(d)} | ${n(e)})`];
  } },
  wachstum: { kat: 'fkt', jg: [9, 10], frage: true, name: 'Exponentielles Wachstum & Abnahme', gen: s => {
    if (s === 1) { const a = R(1, 9) * 100, t = R(2, 6); return [`Start: ${a} Bakterien, sie verdoppeln sich jede Stunde. Anzahl nach ${t} h?`, `${a} · 2${hoch(t)} = ${tausend(a * 2 ** t)}`]; }
    const a = R(2, 50) * 1000, p = pick([2, 3, 4, 5, 8, 10]), t = R(2, 10);
    if (s === 2) return [`Eine Stadt hat ${tausend(a)} Einwohner und wächst um ${p} % pro Jahr. Einwohner nach ${t} Jahren?`, `${tausend(a)} · ${n(1 + p / 100)}${hoch(t)} ≈ ${tausend(Math.round(a * (1 + p / 100) ** t))}`];
    const w = R(10, 40) * 1000, q = pick([10, 12, 15, 20, 25]); return [`Ein Auto kostet ${tausend(w)} € und verliert jährlich ${q} % an Wert. Wert nach ${t} Jahren?`, `${tausend(w)} · ${n(1 - q / 100)}${hoch(t)} ≈ ${eur(w * (1 - q / 100) ** t)}`];
  } },
  // ---------- Daten & Zufall ----------
  mittelwert: { kat: 'daten', jg: [5, 8], frage: true, name: 'Mittelwert, Median, Spannweite', gen: s => {
    const anz = s === 1 ? 5 : R(6, 8), w = Array.from({ length: anz }, () => R(1, s === 1 ? 10 : 30));
    if (s === 1) { const rest = w.reduce((a, b) => a + b) % anz; if (rest) w[0] += anz - rest; } // glatter Mittelwert
    const sum = w.reduce((a, b) => a + b), sort = w.slice().sort((a, b) => a - b), med = anz % 2 ? sort[(anz - 1) / 2] : (sort[anz / 2 - 1] + sort[anz / 2]) / 2;
    const liste = w.join('; ');
    if (s === 1) return [`Daten: ${liste}. Mittelwert?`, `x̄ = ${sum} : ${anz} = ${n(sum / anz)}`];
    if (s === 2) return [`Daten: ${liste}. Median und Spannweite?`, `Median = ${n(med)};  Spannweite = ${sort[anz - 1] - sort[0]}`];
    return [`Daten: ${liste}. Mittelwert, Median, Spannweite?`, `x̄ ≈ ${r2(sum / anz)};  Median = ${n(med)};  Spannweite = ${sort[anz - 1] - sort[0]}`];
  } },
  wahrsch: { kat: 'daten', jg: [6, 10], frage: true, name: 'Wahrscheinlichkeit', gen: s => {
    if (s === 1) { const [e, k] = pick([['eine 6', 1], ['eine gerade Zahl', 3], ['eine Zahl größer als 4', 2], ['eine Primzahl', 3], ['höchstens eine 2', 2], ['keine 1', 5]]); return [`Würfeln: P(${e})?`, `${br(k, 6)} ≈ ${r1(k / 6 * 100)} %`]; }
    const r = R(2, 8), b = R(1, 6), g = R(1, 5), N = r + b + g;
    if (s === 2) { const [f, k] = pick([['rot', r], ['blau', b], ['grün', g]]); return [`Urne: ${r} rote, ${b} blaue, ${g} grüne Kugeln. P(${f})?`, `${br(k, N)} ≈ ${r1(k / N * 100)} %`]; }
    return pick([[`Urne: ${r} rote, ${b + g} blaue Kugeln. Zweimal ziehen MIT Zurücklegen. P(rot, rot)?`, `${br(r * r, N * N)} ≈ ${r1(r * r / N / N * 100)} %`],
      [`Urne: ${r} rote, ${b + g} blaue Kugeln. Zweimal ziehen OHNE Zurücklegen. P(rot, rot)?`, `${r}/${N} · ${r - 1}/${N - 1} = ${br(r * (r - 1), N * (N - 1))} ≈ ${r1(r * (r - 1) / N / (N - 1) * 100)} %`],
      [`Zweimal würfeln. P(zwei Sechsen)?`, `1/6 · 1/6 = 1/36 ≈ 2,8 %`]]);
  } }
};

// ---------- NaWi / Physik / Chemie: Einheiten umrechnen und Formeln anwenden (Lösung mit Rechenweg) ----------
T.AUFGABEN_KAT.push(['nawi-e', 'NaWi: Einheiten umrechnen'], ['nawi-f', 'NaWi: Formeln anwenden']);
const NAWI = {
  nwEinheit: { kat: 'nawi-e', jg: [5, 10], name: 'Einheiten (Länge, Masse, Zeit, Volumen)', gen: s => {
    if (s === 1) { const [e, f] = pick([[['mm', 'cm', 'm', 'km'], [1, 10, 1000, 1e6]], [['g', 'kg', 't'], [1, 1000, 1e6]], [['s', 'min', 'h'], [1, 60, 3600]]]);
      if (e[0] === 's') { const i = R(1, 2), v = R(2, 12); return [`${v} ${e[i]} = ___ ${e[i - 1]}`, `${n(v * f[i] / f[i - 1])} ${e[i - 1]}`]; }
      return umrechnen(e, f, 1); }
    if (s === 2) return pick([() => umrechnen(['ml', 'l'], [1, 1000], R(1, 2)), () => umrechnen(['cm³', 'dm³', 'm³'], [1, 1000, 1e6], R(1, 2)),
      () => { const v = R(2, 40) * 100; return [`${n(v)} ml = ___ cm³`, `${n(v)} cm³  (1 ml = 1 cm³)`]; }, () => { const m = R(3, 30) * 10; return [`${m} s = ___ min`, `${n(m / 60)} min`]; },
      () => { const v = R(5, 95) / 10; return [`${n(v)} l = ___ dm³`, `${n(v)} dm³  (1 l = 1 dm³)`]; }])();
    return pick([() => { const v = pick([18, 36, 54, 72, 90, 108, 126]); return [`${v} km/h = ___ m/s`, `${v} : 3,6 = ${n(v / 3.6)} m/s`]; },
      () => { const v = R(2, 30); return [`${v} m/s = ___ km/h`, `${v} · 3,6 = ${n(v * 3.6)} km/h`]; },
      () => { const c = R(-40, 120); return [`${n(c)} °C = ___ K`, `${n(c)} + 273 = ${n(c + 273)} K`]; },
      () => { const k = R(200, 400); return [`${k} K = ___ °C`, `${k} − 273 = ${n(k - 273)} °C`]; },
      () => { const d = pick([0.8, 1, 2.7, 7.9, 8.9, 11.3, 19.3]); return [`${n(d)} g/cm³ = ___ kg/m³`, `${n(d)} · 1000 = ${tausend(d * 1000)} kg/m³`]; }])();
  } },
  nwGeschw: { kat: 'nawi-f', jg: [6, 10], frage: true, name: 'Geschwindigkeit  v = s : t', gen: s => {
    if (s === 1) { const v = R(2, 12), t = R(2, 20) * 5; return [`Ein Radfahrer fährt ${v * t} m in ${t} s. Wie schnell ist er?`, `v = s : t = ${v * t} m : ${t} s = ${v} m/s`]; }
    if (s === 2) return pick([() => { const v = R(4, 25), t = R(2, 12); return [`Ein Zug fährt ${t} h lang mit ${v * 10} km/h. Welche Strecke legt er zurück?`, `s = v · t = ${v * 10} km/h · ${t} h = ${v * 10 * t} km`]; },
      () => { const v = R(3, 9) * 10, t = R(2, 6); return [`Für ${v * t} km braucht ein Auto mit ${v} km/h wie lange?`, `t = s : v = ${v * t} km : ${v} km/h = ${t} h`]; }])();
    const vk = pick([36, 54, 72, 90, 108]), t = R(5, 30); return [`Ein Auto fährt ${t} s lang mit ${vk} km/h. Wie viele Meter legt es zurück?`, `v = ${vk} : 3,6 = ${n(vk / 3.6)} m/s;  s = v · t = ${n(vk / 3.6)} m/s · ${t} s = ${n(vk / 3.6 * t)} m`];
  } },
  nwDichte: { kat: 'nawi-f', jg: [6, 10], frage: true, name: 'Dichte  ρ = m : V', gen: s => {
    const STOFF = [['Holz (Kiefer)', 0.5], ['Eis', 0.9], ['Wasser', 1], ['Aluminium', 2.7], ['Eisen', 7.9], ['Kupfer', 8.9], ['Blei', 11.3], ['Gold', 19.3]];
    const [st, d] = pick(STOFF.slice(s === 1 ? 2 : 0)), V = s === 1 ? pick([10, 20, 50, 100]) : R(4, 60), m = Math.round(d * V * 10) / 10;
    if (s === 1) return [`Ein Körper hat die Masse ${n(m)} g und das Volumen ${V} cm³. Berechne die Dichte.`, `ρ = m : V = ${n(m)} g : ${V} cm³ = ${n(d)} g/cm³`];
    if (s === 2) return pick([[`Ein Würfel aus ${st} (ρ = ${n(d)} g/cm³) hat das Volumen ${V} cm³. Welche Masse hat er?`, `m = ρ · V = ${n(d)} g/cm³ · ${V} cm³ = ${n(m)} g`],
      [`Ein Stück ${st} (ρ = ${n(d)} g/cm³) wiegt ${n(m)} g. Welches Volumen hat es?`, `V = m : ρ = ${n(m)} g : ${n(d)} g/cm³ = ${V} cm³`]]);
    return [`Ein Körper: m = ${n(m)} g, V = ${V} cm³. Aus welchem Stoff ist er? (Holz 0,5 · Eis 0,9 · Wasser 1 · Alu 2,7 · Eisen 7,9 · Kupfer 8,9 · Blei 11,3 · Gold 19,3 g/cm³)`, `ρ = ${n(m)} g : ${V} cm³ ≈ ${n(Math.round(m / V * 10) / 10)} g/cm³ → ${st}${d < 1 ? ' (schwimmt in Wasser)' : ''}`];
  } },
  nwKraft: { kat: 'nawi-f', jg: [7, 10], frage: true, name: 'Kraft  F = m · g  und  F = m · a', gen: s => {
    if (s === 1) { const m = R(2, 80); return [`Welche Gewichtskraft wirkt auf ${m} kg auf der Erde? (g ≈ 10 N/kg)`, `F = m · g = ${m} kg · 10 N/kg = ${m * 10} N`]; }
    if (s === 2) return pick([() => { const g = R(1, 99) * 10; return [`Welche Gewichtskraft wirkt auf ${g} g? (g = 9,81 N/kg)`, `m = ${n(g / 1000)} kg;  F = ${n(g / 1000)} kg · 9,81 N/kg ≈ ${r2(g / 1000 * 9.81)} N`]; },
      () => { const m = R(2, 90); return [`Ein Astronaut (${m} kg) auf dem Mond (g = 1,62 N/kg): Gewichtskraft?`, `F = ${m} kg · 1,62 N/kg = ${r2(m * 1.62)} N`]; }])();
    const m = R(2, 20) * 50, a = pick([0.5, 1, 1.5, 2, 2.5, 3]); return pick([[`Ein Auto (${m} kg) beschleunigt mit ${n(a)} m/s². Welche Kraft ist nötig?`, `F = m · a = ${m} kg · ${n(a)} m/s² = ${tausend(m * a)} N`],
      [`Eine Kraft von ${tausend(m * a)} N beschleunigt ${m} kg. Wie groß ist die Beschleunigung?`, `a = F : m = ${tausend(m * a)} N : ${m} kg = ${n(a)} m/s²`]]);
  } },
  nwStrom: { kat: 'nawi-f', jg: [8, 10], frage: true, name: 'Elektrik  U = R · I  und  P = U · I', gen: s => {
    const R0 = pick([5, 10, 20, 25, 50, 100]), I = pick([0.1, 0.2, 0.5, 1, 2]), U = R0 * I;
    if (s === 1) return [`Ein Widerstand von ${R0} Ω wird von ${n(I)} A durchflossen. Welche Spannung liegt an?`, `U = R · I = ${R0} Ω · ${n(I)} A = ${n(U)} V`];
    if (s === 2) return pick([[`An ${R0} Ω liegen ${n(U)} V. Wie groß ist die Stromstärke?`, `I = U : R = ${n(U)} V : ${R0} Ω = ${n(I)} A`], [`Bei ${n(U)} V fließen ${n(I)} A. Wie groß ist der Widerstand?`, `R = U : I = ${n(U)} V : ${n(I)} A = ${R0} Ω`]]);
    const Pw = pick([40, 60, 100, 230, 460, 1150, 2300]), t = R(2, 6);
    return pick([[`Ein Gerät an 230 V hat die Leistung ${Pw} W. Welcher Strom fließt?`, `I = P : U = ${Pw} W : 230 V ≈ ${r2(Pw / 230)} A`],
      [`Ein Wasserkocher (2000 W) läuft ${t} Minuten. Wie viel Energie braucht er in kWh?`, `E = P · t = 2 kW · ${t}/60 h ≈ ${r2(2 * t / 60)} kWh`]]);
  } },
  nwArbeit: { kat: 'nawi-f', jg: [8, 10], frage: true, name: 'Arbeit & Leistung  W = F · s,  P = W : t', gen: s => {
    const F = R(2, 40) * 10, sw = R(2, 20), W = F * sw;
    if (s === 1) return [`Eine Kiste wird mit ${F} N über ${sw} m geschoben. Welche Arbeit wird verrichtet?`, `W = F · s = ${F} N · ${sw} m = ${tausend(W)} J`];
    const t = R(2, 20); if (s === 2) return [`Für ${tausend(W)} J Arbeit braucht man ${t} s. Wie groß ist die Leistung?`, `P = W : t = ${tausend(W)} J : ${t} s = ${r2(W / t)} W`];
    const m = R(40, 90), h = R(3, 15), tt = R(5, 30); return [`${m} kg werden in ${tt} s ${h} m hoch getragen (g ≈ 10 N/kg). Leistung?`, `F = ${m * 10} N;  W = ${m * 10} N · ${h} m = ${tausend(m * 10 * h)} J;  P = ${tausend(m * 10 * h)} J : ${tt} s ≈ ${r2(m * 10 * h / tt)} W`];
  } },
  nwStoff: { kat: 'nawi-f', jg: [9, 10], frage: true, name: 'Chemie: Stoffmenge  n = m : M', gen: s => {
    const ST = [['Wasser H₂O', 18], ['Kohlenstoffdioxid CO₂', 44], ['Sauerstoff O₂', 32], ['Natriumchlorid NaCl', 58.5], ['Methan CH₄', 16], ['Kohlenstoff C', 12]];
    const [st, M] = pick(ST), nn = s === 1 ? R(1, 5) : R(2, 40) / 10, m = Math.round(M * nn * 10) / 10;
    if (s === 1) return [`Wie viel mol sind ${n(m)} g ${st}? (M = ${n(M)} g/mol)`, `n = m : M = ${n(m)} g : ${n(M)} g/mol = ${n(nn)} mol`];
    if (s === 2) return [`Welche Masse haben ${n(nn)} mol ${st}? (M = ${n(M)} g/mol)`, `m = n · M = ${n(nn)} mol · ${n(M)} g/mol = ${n(m)} g`];
    return [`Berechne die molare Masse von ${st} (H = 1, C = 12, O = 16, Na = 23, Cl = 35,5) und die Stoffmenge in ${n(m)} g.`, `M = ${n(M)} g/mol;  n = ${n(m)} g : ${n(M)} g/mol = ${n(nn)} mol`];
  } }
};
Object.assign(T.AUFGABEN, NAWI);

// ---------- Englisch: Verben, Zeitformen, Fragen, Steigerung (eigene Wortlisten, Lösungen dabei) ----------
T.AUFGABEN_KAT.push(['eng-v', 'Englisch: Verben & Zeitformen'], ['eng-s', 'Englisch: Sätze & Fragen']);
// unregelmäßige Verben: [Infinitiv, simple past, past participle, Deutsch]
const IRR = [['be', 'was / were', 'been', 'sein'], ['begin', 'began', 'begun', 'beginnen'], ['break', 'broke', 'broken', 'brechen'], ['bring', 'brought', 'brought', 'bringen'],
  ['buy', 'bought', 'bought', 'kaufen'], ['catch', 'caught', 'caught', 'fangen'], ['choose', 'chose', 'chosen', 'wählen'], ['come', 'came', 'come', 'kommen'], ['do', 'did', 'done', 'tun, machen'],
  ['drink', 'drank', 'drunk', 'trinken'], ['drive', 'drove', 'driven', 'fahren (Auto)'], ['eat', 'ate', 'eaten', 'essen'], ['fall', 'fell', 'fallen', 'fallen'], ['feel', 'felt', 'felt', 'fühlen'],
  ['find', 'found', 'found', 'finden'], ['fly', 'flew', 'flown', 'fliegen'], ['forget', 'forgot', 'forgotten', 'vergessen'], ['get', 'got', 'got', 'bekommen'], ['give', 'gave', 'given', 'geben'],
  ['go', 'went', 'gone', 'gehen'], ['have', 'had', 'had', 'haben'], ['hear', 'heard', 'heard', 'hören'], ['know', 'knew', 'known', 'wissen, kennen'], ['leave', 'left', 'left', 'verlassen'],
  ['lose', 'lost', 'lost', 'verlieren'], ['make', 'made', 'made', 'machen'], ['meet', 'met', 'met', 'treffen'], ['pay', 'paid', 'paid', 'bezahlen'], ['put', 'put', 'put', 'legen, stellen'],
  ['read', 'read', 'read', 'lesen'], ['ride', 'rode', 'ridden', 'reiten, Rad fahren'], ['run', 'ran', 'run', 'rennen'], ['say', 'said', 'said', 'sagen'], ['see', 'saw', 'seen', 'sehen'],
  ['sell', 'sold', 'sold', 'verkaufen'], ['send', 'sent', 'sent', 'schicken'], ['sing', 'sang', 'sung', 'singen'], ['sit', 'sat', 'sat', 'sitzen'], ['sleep', 'slept', 'slept', 'schlafen'],
  ['speak', 'spoke', 'spoken', 'sprechen'], ['stand', 'stood', 'stood', 'stehen'], ['swim', 'swam', 'swum', 'schwimmen'], ['take', 'took', 'taken', 'nehmen'], ['teach', 'taught', 'taught', 'unterrichten'],
  ['tell', 'told', 'told', 'erzählen'], ['think', 'thought', 'thought', 'denken'], ['throw', 'threw', 'thrown', 'werfen'], ['understand', 'understood', 'understood', 'verstehen'],
  ['wear', 'wore', 'worn', 'tragen (Kleidung)'], ['win', 'won', 'won', 'gewinnen'], ['write', 'wrote', 'written', 'schreiben']];
const IRR_LEICHT = ['be', 'come', 'do', 'eat', 'get', 'give', 'go', 'have', 'make', 'meet', 'read', 'run', 'say', 'see', 'sit', 'swim', 'take', 'write', 'buy', 'drink'];
// Verben für Sätze: [Infinitiv, 3. Person, simple past, -ing, Ergänzung]
const VB = [['play', 'plays', 'played', 'playing', 'football'], ['watch', 'watches', 'watched', 'watching', 'TV'], ['like', 'likes', 'liked', 'liking', 'pizza'],
  ['live', 'lives', 'lived', 'living', 'in a big house'], ['work', 'works', 'worked', 'working', 'in a shop'], ['help', 'helps', 'helped', 'helping', 'my mum'],
  ['cook', 'cooks', 'cooked', 'cooking', 'dinner'], ['clean', 'cleans', 'cleaned', 'cleaning', 'the kitchen'], ['visit', 'visits', 'visited', 'visiting', 'grandma'],
  ['tidy', 'tidies', 'tidied', 'tidying', 'the room'], ['carry', 'carries', 'carried', 'carrying', 'a heavy bag'], ['study', 'studies', 'studied', 'studying', 'for the test'],
  ['wash', 'washes', 'washed', 'washing', 'the car'], ['finish', 'finishes', 'finished', 'finishing', 'the homework'], ['dance', 'dances', 'danced', 'dancing', 'at the party'],
  ['listen', 'listens', 'listened', 'listening', 'to music'], ['stop', 'stops', 'stopped', 'stopping', 'at the corner'], ['shop', 'shops', 'shopped', 'shopping', 'in town'],
  ['go', 'goes', 'went', 'going', 'to school'], ['do', 'does', 'did', 'doing', 'the dishes'], ['have', 'has', 'had', 'having', 'breakfast'], ['eat', 'eats', 'ate', 'eating', 'an apple'],
  ['drink', 'drinks', 'drank', 'drinking', 'milk'], ['write', 'writes', 'wrote', 'writing', 'a letter'], ['read', 'reads', 'read', 'reading', 'a comic'], ['swim', 'swims', 'swam', 'swimming', 'in the lake'],
  ['ride', 'rides', 'rode', 'riding', 'a bike'], ['buy', 'buys', 'bought', 'buying', 'new shoes'], ['see', 'sees', 'saw', 'seeing', 'a film'], ['meet', 'meets', 'met', 'meeting', 'friends'],
  ['make', 'makes', 'made', 'making', 'a cake'], ['run', 'runs', 'ran', 'running', 'in the park'], ['sing', 'sings', 'sang', 'singing', 'a song']];
const REGEL = VB.slice(0, 18); // regelmäßige Verben (simple past mit -ed)
// Subjekte: [Text, 3. Person Singular?, Name/Eigenname (bleibt groß), be-Form]
const SUBJ = [['I', false, true, 'am'], ['You', false, false, 'are'], ['He', true, false, 'is'], ['She', true, false, 'is'], ['We', false, false, 'are'], ['They', false, false, 'are'],
  ['Tom', true, true, 'is'], ['Anna', true, true, 'is'], ['My sister', true, false, 'is'], ['My friends', false, false, 'are'], ['Ben and Mia', false, true, 'are'], ['Our teacher', true, false, 'is']];
const klein = sj => sj[2] ? sj[0] : sj[0][0].toLowerCase() + sj[0].slice(1);
const NAMEN = ['Tom', 'Anna', 'Ben', 'Mia', 'Leon', 'Emma', 'Paul', 'Lena', 'Jonas', 'Sara'];
const ADJ_KURZ = [['tall', 'taller', 'tallest'], ['small', 'smaller', 'smallest'], ['old', 'older', 'oldest'], ['young', 'younger', 'youngest'], ['fast', 'faster', 'fastest'], ['long', 'longer', 'longest'],
  ['cheap', 'cheaper', 'cheapest'], ['big', 'bigger', 'biggest'], ['hot', 'hotter', 'hottest'], ['thin', 'thinner', 'thinnest'], ['easy', 'easier', 'easiest'], ['happy', 'happier', 'happiest'],
  ['funny', 'funnier', 'funniest'], ['nice', 'nicer', 'nicest'], ['large', 'larger', 'largest'], ['cold', 'colder', 'coldest']];
const ADJ_LANG = ['beautiful', 'expensive', 'interesting', 'dangerous', 'difficult', 'important', 'comfortable', 'exciting', 'boring', 'famous'];
const ADJ_IRR = [['good', 'better', 'best'], ['bad', 'worse', 'worst'], ['many', 'more', 'most'], ['much', 'more', 'most'], ['little', 'less', 'least'], ['far', 'further', 'furthest']];
const ENGLISCH = {
  enVerben: { kat: 'eng-v', jg: [5, 8], frage: true, name: 'Unregelmäßige Verben', gen: s => {
    const v = s === 1 ? pick(IRR.filter(x => IRR_LEICHT.includes(x[0]))) : pick(IRR);
    if (s === 1) return [`${v[0]} → simple past: ___`, v[1]];
    if (s === 2) return [`${v[0]} → ___ → ___`, `${v[0]} – ${v[1]} – ${v[2]}`];
    return [`„${v[3]}“: alle drei Formen`, `${v[0]} – ${v[1]} – ${v[2]}`];
  } },
  enPresent: { kat: 'eng-v', jg: [5, 6], frage: true, name: 'Simple present (s, doesn’t, Does …?)', gen: s => {
    const sj = pick(SUBJ), v = pick(VB), form = sj[1] ? v[1] : v[0];
    if (s === 1) return [`${sj[0]} ___ (${v[0]}) ${v[4]}.`, `${sj[0]} ${form} ${v[4]}.`];
    if (s === 2) return [`Verneine: ${sj[0]} ${form} ${v[4]}.`, `${sj[0]} ${sj[1] ? 'doesn’t' : 'don’t'} ${v[0]} ${v[4]}.`];
    return [`Frage: ${sj[0]} ${form} ${v[4]}.`, `${sj[1] ? 'Does' : 'Do'} ${klein(sj)} ${v[0]} ${v[4]}?`];
  } },
  enPast: { kat: 'eng-v', jg: [6, 7], frage: true, name: 'Simple past (-ed, didn’t, Did …?)', gen: s => {
    const sj = pick(SUBJ);
    if (s === 1) { const v = pick(REGEL); return [`Yesterday ${klein(sj)} ___ (${v[0]}) ${v[4]}.`, `Yesterday ${klein(sj)} ${v[2]} ${v[4]}.`]; }
    const v = pick(VB);
    if (s === 2) return pick([[`Yesterday ${klein(sj)} ___ (${v[0]}) ${v[4]}.`, `Yesterday ${klein(sj)} ${v[2]} ${v[4]}.`], [`Verneine: ${sj[0]} ${v[2]} ${v[4]} yesterday.`, `${sj[0]} didn’t ${v[0]} ${v[4]} yesterday.`]]);
    return pick([[`Frage: ${sj[0]} ${v[2]} ${v[4]} yesterday.`, `Did ${klein(sj)} ${v[0]} ${v[4]} yesterday?`], [`Verneine: ${sj[0]} ${v[2]} ${v[4]} last week.`, `${sj[0]} didn’t ${v[0]} ${v[4]} last week.`]]);
  } },
  enProgressive: { kat: 'eng-v', jg: [5, 6], frage: true, name: 'Present progressive (-ing)', gen: s => {
    const sj = pick(SUBJ), v = pick(VB);
    if (s === 1) return [`${v[0]} → -ing-Form: ___`, v[3]];
    if (s === 2) return [`Look! ${sj[0]} ___ (${v[0]}) ${v[4]}.`, `Look! ${sj[0]} ${sj[3]} ${v[3]} ${v[4]}.`];
    return pick([[`Frage: ${sj[0]} ${sj[3]} ${v[3]} ${v[4]} now.`, `${sj[3][0].toUpperCase() + sj[3].slice(1)} ${klein(sj)} ${v[3]} ${v[4]} now?`],
      [`Verneine: ${sj[0]} ${sj[3]} ${v[3]} ${v[4]} now.`, `${sj[0]} ${sj[3] === 'am' ? 'am not' : sj[3] === 'is' ? 'isn’t' : 'aren’t'} ${v[3]} ${v[4]} now.`]]);
  } },
  enFragen: { kat: 'eng-s', jg: [5, 7], frage: true, name: 'Fragen mit Fragewort (be, do/does, did)', gen: s => {
    const n = pick(NAMEN), m = pick(NAMEN.filter(x => x !== n));
    if (s === 1) return pick([[`${n} is twelve. (How old …?)`, `How old is ${n}?`], [`${n} is in the garden. (Where …?)`, `Where is ${n}?`], [`${n} and ${m} are at school. (Where …?)`, `Where are ${n} and ${m}?`],
      [`${n}’s favourite colour is blue. (What …?)`, `What is ${n}’s favourite colour?`], [`The party is on Friday. (When …?)`, `When is the party?`], [`${n} is happy because it’s sunny. (Why …?)`, `Why is ${n} happy?`]]);
    if (s === 2) return pick([[`${n} lives in Hanover. (Where …?)`, `Where does ${n} live?`], [`${n} likes pizza. (What …?)`, `What does ${n} like?`], [`${n} and ${m} play football on Mondays. (When …?)`, `When do ${n} and ${m} play football?`],
      [`${n} goes to school by bus. (How …?)`, `How does ${n} go to school?`], [`${n} gets up at seven. (When …?)`, `When does ${n} get up?`], [`${n} and ${m} watch films at the weekend. (What …?)`, `What do ${n} and ${m} watch at the weekend?`]]);
    return pick([[`${n} went to London last summer. (Where …?)`, `Where did ${n} go last summer?`], [`${n} bought a new bike. (What …?)`, `What did ${n} buy?`], [`${n} met ${m} at the station. (Who …?)`, `Who did ${n} meet at the station?`],
      [`${n} came home at six. (When …?)`, `When did ${n} come home?`], [`${n} was tired because he ran ten kilometres. (Why …?)`, `Why was ${n} tired?`], [`${n} and ${m} saw a film yesterday. (What …?)`, `What did ${n} and ${m} see yesterday?`]]);
  } },
  enSteigerung: { kat: 'eng-s', jg: [6, 7], frage: true, name: 'Steigerung (taller, more …, better)', gen: s => {
    const n = pick(NAMEN), m = pick(NAMEN.filter(x => x !== n));
    if (s === 1) { const a = pick(ADJ_KURZ); return [`${a[0]} → ___ → ___`, `${a[0]} – ${a[1]} – ${a[2]}`]; }
    if (s === 2) { const a = pick(ADJ_LANG); return pick([[`${a} → ___ → ___`, `${a} – more ${a} – most ${a}`], [`This book is ___ (${a}) than that one.`, `This book is more ${a} than that one.`]]); }
    const gb = pick(ADJ_IRR.slice(0, 2)), tag = pick([ADJ_KURZ[8], ADJ_KURZ[15], ADJ_KURZ[13], ADJ_IRR[0], ADJ_IRR[1]]), lang = pick(ADJ_LANG);
    return pick([[`${n} is ___ (${gb[0]}) at maths than ${m}.`, `${n} is ${gb[1]} at maths than ${m}.`],
      [`Today is the ___ (${tag[0]}) day of the year.`, `Today is the ${tag[2]} day of the year.`],
      [`This is the ___ (${lang}) film I know.`, `This is the most ${lang} film I know.`]]);
  } }
};
Object.assign(T.AUFGABEN, ENGLISCH);

T.erzeugeAufgaben = (typ, stufe, anzahl) => {
  const A = T.AUFGABEN[typ], out = [], seen = new Set();
  if (A.graph && stufe === 2) anzahl = Math.min(anzahl, 5); // mehr Geraden passen nicht übersichtlich in ein Koordinatensystem
  for (let i = 0; out.length < anzahl && i < anzahl * 30; i++) { const a = A.gen(stufe), key = a[0] + '|' + a[1]; if (seen.has(key)) continue; seen.add(key); out.push(a); }
  const fn = i => out.length > 1 ? 'f' + '₁₂₃₄₅₆₇₈₉'[i % 9] : 'f';
  out.forEach((a, i) => { a[0] = a[0].replace('{f}', fn(i)); });
  const buch = i => (i < 26 ? String.fromCharCode(97 + i) : 'a' + String.fromCharCode(97 + i - 26)) + ')';
  const offen = t => A.frage || /[?:]$|___|☐|Wertetabelle|Bestimme|Gerade/.test(t);
  const zeile = (a, i) => `${buch(i)}  ${a[0]}${offen(a[0]) ? '' : ' = '}`;
  return {
    titel: `${A.name}  ${'★'.repeat(stufe)}`,
    aufgaben: out.map(zeile), loesungen: out.map((a, i) => `${buch(i)}  ${a[1]}`),
    graphen: A.graph ? out.map(a => a[2]) : null, zeigeGraph: A.graph && stufe === 2
  };
};
})();
