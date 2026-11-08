// Tafel-App – flexible Bausteine: Felder/Zellen/Äste einzeln vergrößern, schnell Zeilen, Spalten, Äste, Felder ergänzen.
// Jeder Generator liefert zusätzlich „teile“ (Rechtecke mit fester id). Damit lassen sich Felder antippen und
// Handschrift im Feld wandert mit, wenn sich davor etwas ändert.
'use strict';
(function () {
const { doc, ln, tx, rc, f } = T._svg, CM = T.CM, B = T.BAUSTEINE;
const zeilenRoh = s => { const a = String(s == null ? '' : s).split(/\r?\n/); while (a.length && !a[a.length - 1].trim()) a.pop(); return a; };
const arr = (a, n, def) => Array.from({ length: n }, (_, i) => (Array.isArray(a) && a[i] != null ? a[i] : def));
const ins = (a, i, v) => { a = a.slice(); a.splice(i, 0, v); return a; };
const del = (a, i) => { a = a.slice(); a.splice(i, 1); return a; };
const um = (v, d, min, max) => Math.round(T.clamp(v + d, min, max) * 10) / 10;
const rc2 = id => id.split(',').map(Number);
const textBreite = (t, fs, fett) => { const c = T._mctx || (T._mctx = document.createElement('canvas').getContext('2d')); c.font = `${fett ? 700 : 400} ${fs}px Segoe UI`; return c.measureText(String(t || '')).width; };

// ---------- Tabelle (auch für Satzbau) ----------
const parseTab = s => zeilenRoh(s).map(l => l.split(/;|\t/));
// Zellenschatten: d.schatten = alle Zellen (außer Kopfzeile), d.zs = einzeln gewählte Zellen „Zeile,Spalte“, d.offen = schon aufgedeckte.
// Der Schatten liegt ÜBER der Handschrift (eigene Ebene in kern.js → T.zellSchatten), antippen mit dem Finger deckt auf.
const liste = a => Array.isArray(a) ? a : [];
const zuGedeckt = (d, r, c) => (!!d.schatten && !(d.kopf && r === 0) || liste(d.zs).includes(r + ',' + c)) && !liste(d.offen).includes(r + ',' + c);
T.tabSchatten = (o, id) => { // antippen: Zelle aufdecken
  const d = o.d, offen = liste(d.offen).slice(); if (!offen.includes(id)) offen.push(id);
  T.snap(); T.replaceItem({ ...o, d: { ...d, offen } }); T.render();
};
T.tabVerdeckt = (o, id) => { // Ist diese Zelle gerade verdeckt?
  const [r, c] = rc2(id), d = o.d;
  if (o.k === 'tabelle') return zuGedeckt(d, r, c);
  if (o.k === 'vokabeln') { const t = (zeilenRoh(d.inhalt).map(vokTeilen)[r] || [])[c]; return (!!t && vokVerdeckt(d, r, c)) || (liste(d.zs).includes(id) && !liste(d.offen).includes(id)); }
  return false;
};
const schattenGen = new WeakMap(); // Generator-Ergebnis je Datenstand (d wird bei jeder Änderung ersetzt)
T.hatZellSchatten = o => (o.k === 'tabelle' && (o.d.schatten || liste(o.d.zs).length)) || (o.k === 'vokabeln' && liste(o.d.zs).length);
T.zellSchatten = (ctx, o, dark) => { // Schatten über Inhalt UND Handschrift zeichnen
  let g = schattenGen.get(o.d); if (!g) { g = T.genObj(o.k, o.d, false); schattenGen.set(o.d, g); }
  const fuell = dark ? '#3b4250' : '#cfd6df', ink = dark ? '#e8edf5' : '#1a1a1a';
  for (const t of g.teile || []) {
    if (!T.tabVerdeckt(o, t.id) || (o.k === 'vokabeln' && !liste(o.d.zs).includes(t.id))) continue; // Vokabel-Spalte: zeichnet der Generator
    const e = Math.min(6, t.w / 6, t.h / 6), P = [[t.x + e, t.y + e], [t.x + t.w - e, t.y + e], [t.x + t.w - e, t.y + t.h - e], [t.x + e, t.y + t.h - e]].map(([a, b]) => T.svgZuWelt(o, g, a, b));
    ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = fuell; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.closePath(); ctx.fill();
    const mx = (P[0][0] + P[2][0]) / 2, my = (P[0][1] + P[2][1]) / 2, gr = Math.min(22, t.h * o.h / g.h * 0.45);
    ctx.fillStyle = ink; ctx.font = `700 ${gr}px Segoe UI`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', mx, my); ctx.restore();
  }
};
const zsUm = (d, id) => { const zs = liste(d.zs).slice(), i = zs.indexOf(id), offen = liste(d.offen).filter(x => x !== id); if (i >= 0) zs.splice(i, 1); else zs.push(id); return { d: { ...d, zs, offen } }; };
const serTab = z => z.map(r => (r || []).join(';')).join('\n');
function tabelle(d, P) {
  const nz = T.clamp(Math.round(d.zeilen), 1, 40), ns = T.clamp(Math.round(d.spalten), 1, 20);
  const zInh = parseTab(d.inhalt), fsT = r => Math.min(24, Math.min(arr(d.zh, nz, d.hoehe)[r] * CM, 1.6 * CM) * 0.45);
  const sb = arr(d.sb, ns, d.breite).map((v, c) => Math.max(v * CM, ...zInh.map((row, r) => r < nz ? (row[c] || '').trim() ? textBreite(row[c].trim(), fsT(r), d.kopf && r === 0) + 24 : 0 : 0))), // Spalte mindestens so breit wie ihr Text
    zh = arr(d.zh, nz, d.hoehe).map(v => v * CM), m = 6;
  const xs = [m], ys = [m]; sb.forEach(w => xs.push(xs[xs.length - 1] + w)); zh.forEach(hh => ys.push(ys[ys.length - 1] + hh));
  const W = xs[ns] + m, H = ys[nz] + m, z = parseTab(d.inhalt), teile = [];
  let s = '';
  if (d.kopf) s += d.farben ? d.farben.map((c, i) => rc(xs[i], ys[0], sb[i], zh[0], 'none', c, 0)).join('') : rc(m, m, W - 2 * m, zh[0], 'none', P.head, 0);
  for (let r = 0; r < nz; r++) for (let c = 0; c < ns; c++) {
    teile.push({ id: r + ',' + c, x: xs[c], y: ys[r], w: sb[c], h: zh[r] });
    const t = (z[r] && z[r][c] || '').trim(); if (!t) continue;
    if (zuGedeckt(d, r, c)) continue; // Zellenschatten: Inhalt erst nach Antippen (den Schatten selbst zeichnet T.zellSchatten über allem)
    s += tx(xs[c] + sb[c] / 2, ys[r] + Math.min(zh[r], 1.6 * CM) / 2, t, P.ink, Math.min(24, Math.min(zh[r], 1.6 * CM) * 0.45), 'middle', d.kopf && r === 0 ? 'font-weight="700"' : '');
  }
  ys.forEach((y, r) => { s += ln(m, y, W - m, y, P.ink, (r === 1 && d.kopf) || r === 0 || r === nz ? 3 : 1.6); });
  xs.forEach((x, c) => { s += ln(x, m, x, H - m, P.ink, c === 0 || c === ns ? 3 : 1.6); });
  return { svg: doc(W, H, s), w: W, h: H, teile };
}
// Zeilen-/Spaltenoperationen für Tabellen (r, c = Zeile/Spalte; dz = Versatz der Inhaltszeilen)
const tabOps = {
  zeileEin: (d, r, nachher) => { const at = r + (nachher ? 1 : 0), z = parseTab(d.inhalt), n = Math.round(d.zeilen); while (z.length < n) z.push([]);
    return { d: { ...d, zeilen: n + 1, zh: ins(arr(d.zh, n, d.hoehe), at, arr(d.zh, n, d.hoehe)[r]), inhalt: serTab(ins(z, at, [])) }, map: id => { const [i, j] = rc2(id); return (i >= at ? i + 1 : i) + ',' + j; } }; },
  zeileWeg: (d, r) => { const n = Math.round(d.zeilen); if (n <= 1) return null; const z = parseTab(d.inhalt); while (z.length < n) z.push([]);
    return { d: { ...d, zeilen: n - 1, zh: del(arr(d.zh, n, d.hoehe), r), inhalt: serTab(del(z, r)) }, map: id => { const [i, j] = rc2(id); return i === r ? null : (i > r ? i - 1 : i) + ',' + j; } }; },
  spalteEin: (d, c, nachher) => { const at = c + (nachher ? 1 : 0), ns = Math.round(d.spalten), z = parseTab(d.inhalt).map(row => { const r2 = arr(row, ns, ''); r2.splice(at, 0, ''); return r2; });
    return { d: { ...d, spalten: ns + 1, sb: ins(arr(d.sb, ns, d.breite), at, arr(d.sb, ns, d.breite)[c]), inhalt: serTab(z) }, map: id => { const [i, j] = rc2(id); return i + ',' + (j >= at ? j + 1 : j); } }; },
  spalteWeg: (d, c) => { const ns = Math.round(d.spalten); if (ns <= 1) return null; const z = parseTab(d.inhalt).map(row => del(arr(row, ns, ''), c));
    return { d: { ...d, spalten: ns - 1, sb: del(arr(d.sb, ns, d.breite), c), inhalt: serTab(z) }, map: id => { const [i, j] = rc2(id); return j === c ? null : i + ',' + (j > c ? j - 1 : j); } }; },
  breite: (d, c, dv) => ({ d: { ...d, sb: arr(d.sb, Math.round(d.spalten), d.breite).map((v, i) => i === c ? um(v, dv, 1, 30) : v) } }),
  hoehe: (d, r, dv) => ({ d: { ...d, zh: arr(d.zh, Math.round(d.zeilen), d.hoehe).map((v, i) => i === r ? um(v, dv, 0.8, 20) : v) } })
};
B.tabelle.gen = tabelle;
B.tabelle.schnell = [
  { l: '＋ Zeile', f: d => tabOps.zeileEin(d, Math.round(d.zeilen) - 1, true) },
  { l: '＋ Spalte', f: d => tabOps.spalteEin(d, Math.round(d.spalten) - 1, true) },
  { l: '↕ alle höher', f: d => ({ d: { ...d, zh: arr(d.zh, Math.round(d.zeilen), d.hoehe).map(v => um(v, 1, 0.8, 20)) } }) },
  { l: '↔ alle breiter', f: d => ({ d: { ...d, sb: arr(d.sb, Math.round(d.spalten), d.breite).map(v => um(v, 1, 1, 30)) } }) },
  { l: '🙈 Alle Zellen verdecken', f: d => ({ d: { ...d, schatten: true, offen: [] } }) },
  { l: '↺ Wieder zudecken', f: d => ({ d: { ...d, offen: [] } }) },
  { l: '👁 Schatten aus', f: d => ({ d: { ...d, schatten: false, zs: [], offen: [] } }) }];
B.tabelle.teil = (d, id) => { const [r, c] = rc2(id); return [
  { l: liste(d.zs).includes(id) ? '👁 Schatten weg' : '🙈 Schatten', f: d => zsUm(d, id) },
  { l: '↕ Zeile höher', f: d => tabOps.hoehe(d, r, 1) }, { l: 'Zeile niedriger', f: d => tabOps.hoehe(d, r, -1) },
  { l: '↔ Spalte breiter', f: d => tabOps.breite(d, c, 1) }, { l: 'Spalte schmaler', f: d => tabOps.breite(d, c, -1) },
  { l: '＋ Zeile darunter', f: d => tabOps.zeileEin(d, r, true) }, { l: '＋ Zeile darüber', f: d => tabOps.zeileEin(d, r, false) },
  { l: '＋ Spalte rechts', f: d => tabOps.spalteEin(d, c, true) }, { l: '＋ Spalte links', f: d => tabOps.spalteEin(d, c, false) },
  { l: '🗑 Zeile', f: d => tabOps.zeileWeg(d, r), warn: 1 }, { l: '🗑 Spalte', f: d => tabOps.spalteWeg(d, c), warn: 1 }]; };

// Satzbau: Tabelle mit fester Kopfzeile; d.zeilen = Datenzeilen, d.zh/d.sb gelten für die ganze Tabelle
const SATZ = {
  svopt: [['Subject', '#e3f2fd'], ['Verb', '#ffebee'], ['Object', '#e8f5e9'], ['Place', '#fff8e1'], ['Time', '#f3e5f5']],
  felder: [['Vorfeld', '#e3f2fd'], ['linke Satzklammer', '#ffebee'], ['Mittelfeld', '#e8f5e9'], ['rechte Satzklammer', '#ffebee'], ['Nachfeld', '#f3e5f5']],
  satzglieder: [['Subjekt', '#e3f2fd'], ['Prädikat', '#ffebee'], ['Dativobjekt', '#e8f5e9'], ['Akkusativobjekt', '#fff8e1'], ['Adverbiale', '#f3e5f5']],
  wortarten: [['Nomen', '#e3f2fd'], ['Verben', '#ffebee'], ['Adjektive', '#e8f5e9'], ['Andere', '#f3e5f5']]
};
const satzTab = d => { const M = SATZ[d.art] || SATZ.svopt; return { zeilen: Math.round(d.zeilen) + 1, spalten: M.length, kopf: true, breite: 5.2, hoehe: 1.5, sb: d.sb, zh: d.zh, inhalt: M.map(x => x[0]).join(';') + '\n' + (d.inhalt || '') }; };
const vonTab = (d, t) => ({ ...d, zeilen: t.zeilen - 1, sb: t.sb, zh: t.zh, inhalt: t.inhalt.split('\n').slice(1).join('\n') });
B.satzbau.gen = (d, P) => { const M = SATZ[d.art] || SATZ.svopt; return tabelle({ ...satzTab(d), farben: P.ink === '#1a1a1a' ? M.map(x => x[1]) : null }, P); };
const satzOp = (op, ...a) => d => { const r = tabOps[op](satzTab(d), ...a); return r && { d: vonTab(d, r.d), map: r.map }; };
B.satzbau.schnell = [{ l: '＋ Zeile', f: d => satzOp('zeileEin', Math.round(d.zeilen), true)(d) }, { l: '↕ alle höher', f: d => ({ d: { ...d, zh: arr(d.zh, Math.round(d.zeilen) + 1, 1.5).map((v, i) => i ? um(v, 1, 0.8, 20) : v) } }) }];
B.satzbau.teil = (d, id) => { const [r, c] = rc2(id); const L = [
  { l: '↕ Zeile höher', f: satzOp('hoehe', r, 1) }, { l: 'Zeile niedriger', f: satzOp('hoehe', r, -1) },
  { l: '↔ Spalte breiter', f: satzOp('breite', c, 1) }, { l: 'Spalte schmaler', f: satzOp('breite', c, -1) },
  { l: '＋ Zeile darunter', f: satzOp('zeileEin', r, true) }];
  if (r > 0) L.push({ l: '🗑 Zeile', f: satzOp('zeileWeg', r), warn: 1 }); return L; };

// ---------- Vokabeltabelle ----------
// Spalten: „Wort = Übersetzung = …“ (weitere Spalten, z. B. Beispielsatz). Jede Spalte ist mindestens so breit wie ihr längster Eintrag.
const vokTeilen = l => { if (l.includes('=')) return l.split('=').map(s => s.trim()); const i = l.search(/\s*(–|;|\t)\s*/); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i).replace(/^\s*(–|;|\t)\s*/, '')]; };
const vokVerdeckt = (d, r, i) => ((i === 0 && d.verdecken === 'links') || (i === 1 && d.verdecken === 'rechts')) && !(Array.isArray(d.offen) && d.offen.includes(r + ',' + i)); // antippen deckt einzeln auf
const vokSpalten = d => Math.max(2, ...zeilenRoh(d.inhalt).map(l => vokTeilen(l).length));
B.vokabeln.gen = (d, P) => {
  const z = zeilenRoh(d.inhalt).map(vokTeilen), n = Math.max(Math.round(d.zeilen), z.length), nSp = vokSpalten(d);
  const kopf = [d.links, d.rechts].concat(String(d.weitere || '').split(';').map(s => s.trim())).slice(0, nSp);
  const sb = arr(d.sb, nSp, null).map((v, i) => Math.max((v || (i < 2 ? d.breite : 4)) * CM, textBreite(kopf[i], 24, true) + 40, ...z.map(r => textBreite(r[i], 24) + 36)));
  const zh = arr(d.zh, n, 1.4).map(v => v * CM), nr = 2 * CM, m = 8, kh = 1.4 * CM;
  const xs = [m, m + nr]; sb.forEach(w => xs.push(xs[xs.length - 1] + w));
  const ys = [m + kh]; zh.forEach(v => ys.push(ys[ys.length - 1] + v));
  const W = xs[xs.length - 1] + m, H = ys[n] + m, teile = [];
  let s = rc(m, m, W - 2 * m, kh, 'none', P.head, 0);
  kopf.forEach((t, i) => { if (t) s += tx(xs[i + 1] + sb[i] / 2, m + kh / 2, t, P.ink, 24, 'middle', 'font-weight="700"'); });
  for (let r = 0; r < n; r++) {
    const y = ys[r], hh = zh[r], my = y + Math.min(hh, 1.4 * CM) / 2; if (r % 2) s += rc(m, y, W - 2 * m, hh, 'none', P.soft, 0);
    s += tx(m + nr / 2, my, r + 1, P.grid === '#c9d7e6' ? '#8795a8' : P.grid, 16);
    const zeile = z[r] || [];
    for (let i = 0; i < nSp; i++) {
      const t = zeile[i], x = xs[i + 1], w = sb[i], hide = vokVerdeckt(d, r, i);
      teile.push({ id: r + ',' + i, x, y, w, h: hh });
      if (hide && t) s += rc(x + 10, y + 10, w - 20, Math.min(hh, 1.4 * CM) - 20, 'none', P.ink === '#1a1a1a' ? '#cfd6df' : 'rgba(255,255,255,.3)', 0, 'rx="8"') + tx(x + w / 2, my, '?', P.ink, 22, 'middle', 'font-weight="700"');
      else if (t) s += tx(x + 16, my, t, P.ink, 24, 'start');
    }
  }
  s += ln(m, m, W - m, m, P.ink, 1.5); ys.forEach((y, i) => { s += ln(m, y, W - m, y, P.ink, i === 0 ? 3 : 1.5); });
  xs.forEach((x, i) => { s += ln(x, m, x, H - m, P.ink, i === 2 ? 3 : 1.5); });
  return { svg: doc(W, H, s), w: W, h: H, teile };
};
const vokZeile = (d, at, n0) => { const n = Math.max(Math.round(d.zeilen), zeilenRoh(d.inhalt).length), z = zeilenRoh(d.inhalt); while (z.length < n) z.push('');
  return { d: { ...d, zeilen: n + 1, inhalt: ins(z, at, '').join('\n'), zh: ins(arr(d.zh, n, 1.4), at, arr(d.zh, n, 1.4)[n0 == null ? n - 1 : n0]) }, map: id => { const [i, j] = rc2(id); return (i >= at ? i + 1 : i) + ',' + j; } }; };
B.vokabeln.schnell = [{ l: '＋ Zeile', f: d => vokZeile(d, Math.max(Math.round(d.zeilen), zeilenRoh(d.inhalt).length)) },
  { l: '↕ alle höher', f: d => { const n = Math.max(Math.round(d.zeilen), zeilenRoh(d.inhalt).length); return { d: { ...d, zh: arr(d.zh, n, 1.4).map(v => um(v, 1, 0.8, 20)) } }; } },
  { l: '↺ Wieder zudecken', f: d => ({ d: { ...d, offen: [] } }) }];
B.vokabeln.teil = (d, id) => { const [r, c] = rc2(id), n = Math.max(Math.round(d.zeilen), zeilenRoh(d.inhalt).length); return [
  { l: liste(d.zs).includes(id) ? '👁 Schatten weg' : '🙈 Schatten', f: d => zsUm(d, id) },
  { l: '↕ Zeile höher', f: d => ({ d: { ...d, zh: arr(d.zh, n, 1.4).map((v, i) => i === r ? um(v, 1, 0.8, 20) : v) } }) },
  { l: 'Zeile niedriger', f: d => ({ d: { ...d, zh: arr(d.zh, n, 1.4).map((v, i) => i === r ? um(v, -1, 0.8, 20) : v) } }) },
  { l: '↔ Spalte breiter', f: d => ({ d: { ...d, sb: arr(d.sb, vokSpalten(d), d.breite).map((v, i) => i === c ? um(v || d.breite, 1, 3, 30) : v) } }) },
  { l: 'Spalte schmaler', f: d => ({ d: { ...d, sb: arr(d.sb, vokSpalten(d), d.breite).map((v, i) => i === c ? um(v || d.breite, -1, 3, 30) : v) } }) },
  { l: '＋ Zeile darunter', f: d => vokZeile(d, r + 1, r) }, { l: '＋ Zeile darüber', f: d => vokZeile(d, r, r) },
  { l: '🗑 Zeile', warn: 1, f: d => { if (n <= 1) return null; const z = zeilenRoh(d.inhalt); while (z.length < n) z.push('');
    return { d: { ...d, zeilen: n - 1, inhalt: del(z, r).join('\n'), zh: del(arr(d.zh, n, 1.4), r) }, map: id => { const [i, j] = rc2(id); return i === r ? null : (i > r ? i - 1 : i) + ',' + j; } }; } }]; };

// ---------- Mindmap ----------
B.mindmap.gen = (d, P) => {
  const n = T.clamp(Math.round(d.aeste), 1, 16), z = zeilenRoh(d.inhalt), gr = arr(d.gr, n, 1), mg = d.mg || 1, teile = [];
  const maxg = Math.max(1, ...gr), rx = (8.5 + 2.3 * (maxg - 1)) * CM + 1.3 * CM * (mg - 1), ry = (5.4 + 0.75 * (maxg - 1)) * CM + 0.6 * CM * (mg - 1);
  const boxes = gr.map((g, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n, w = 4.6 * CM * g, hh = 1.5 * CM * g, cx = Math.cos(a) * rx, cy = Math.sin(a) * ry; return { a, w, h: hh, cx, cy }; });
  const mrx = 3.6 * CM * mg, mry = 1.5 * CM * mg;
  let x0 = -mrx, x1 = mrx, y0 = -mry, y1 = mry;
  boxes.forEach(b => { x0 = Math.min(x0, b.cx - b.w / 2); x1 = Math.max(x1, b.cx + b.w / 2); y0 = Math.min(y0, b.cy - b.h / 2); y1 = Math.max(y1, b.cy + b.h / 2); });
  const m = 20, ox = m - x0, oy = m - y0, W = x1 - x0 + 2 * m, H = y1 - y0 + 2 * m;
  let s = '';
  boxes.forEach((b, i) => {
    const ex = ox + b.cx, ey = oy + b.cy;
    s += `<path d="M ${f(ox)} ${f(oy)} Q ${f(ox + Math.cos(b.a) * rx * 0.55)} ${f(oy + Math.sin(b.a) * ry * 0.4)} ${f(ex)} ${f(ey)}" fill="none" stroke="${P.acc}" stroke-width="5" stroke-linecap="round"/>`;
    s += rc(ex - b.w / 2, ey - b.h / 2, b.w, b.h, P.ink, P.ink === '#1a1a1a' ? '#fff' : P.soft, 2.5, `rx="${f(Math.min(30, b.h / 2))}"`);
    if (z[i]) s += tx(ex, ey, z[i], P.ink, Math.min(22 * gr[i], 34));
    teile.push({ id: 'a' + i, x: ex - b.w / 2, y: ey - b.h / 2, w: b.w, h: b.h });
  });
  s += `<ellipse cx="${f(ox)}" cy="${f(oy)}" rx="${f(mrx)}" ry="${f(mry)}" fill="${P.head}" stroke="${P.ink}" stroke-width="3.5"/>` + tx(ox, oy, d.mitte, P.ink, Math.min(30 * mg, 44), 'middle', 'font-weight="700"');
  teile.push({ id: 'm', x: ox - mrx * 0.7, y: oy - mry * 0.7, w: mrx * 1.4, h: mry * 1.4 });
  return { svg: doc(W, H, s), w: W, h: H, teile };
};
const mmAst = (d, at) => { const n = Math.round(d.aeste), z = zeilenRoh(d.inhalt); while (z.length < n) z.push('');
  return { d: { ...d, aeste: n + 1, inhalt: ins(z, at, '').join('\n'), gr: ins(arr(d.gr, n, 1), at, 1) }, map: id => { if (id === 'm') return id; const i = +id.slice(1); return 'a' + (i >= at ? i + 1 : i); } }; };
B.mindmap.schnell = [{ l: '＋ Ast', f: d => mmAst(d, Math.round(d.aeste)) },
  { l: '⤢ alle Felder größer', f: d => ({ d: { ...d, gr: arr(d.gr, Math.round(d.aeste), 1).map(v => um(v, 0.25, 0.6, 3)) } }) },
  { l: 'alle kleiner', f: d => ({ d: { ...d, gr: arr(d.gr, Math.round(d.aeste), 1).map(v => um(v, -0.25, 0.6, 3)) } }) }];
B.mindmap.teil = (d, id) => {
  if (id === 'm') return [{ l: '⤢ Mitte größer', f: d => ({ d: { ...d, mg: um(d.mg || 1, 0.25, 0.6, 3) } }) }, { l: 'Mitte kleiner', f: d => ({ d: { ...d, mg: um(d.mg || 1, -0.25, 0.6, 3) } }) }];
  const i = +id.slice(1), n = Math.round(d.aeste); return [
    { l: '⤢ Feld größer', f: d => ({ d: { ...d, gr: arr(d.gr, n, 1).map((v, j) => j === i ? um(v, 0.25, 0.6, 3) : v) } }) },
    { l: 'Feld kleiner', f: d => ({ d: { ...d, gr: arr(d.gr, n, 1).map((v, j) => j === i ? um(v, -0.25, 0.6, 3) : v) } }) },
    { l: '＋ Ast daneben', f: d => mmAst(d, i + 1) },
    { l: '🗑 Ast', warn: 1, f: d => { if (n <= 1) return null; const z = zeilenRoh(d.inhalt); while (z.length < n) z.push('');
      return { d: { ...d, aeste: n - 1, inhalt: del(z, i).join('\n'), gr: del(arr(d.gr, n, 1), i) }, map: id => { if (id === 'm') return id; const j = +id.slice(1); return j === i ? null : 'a' + (j > i ? j - 1 : j); } }; } }];
};

// ---------- Versuchsprotokoll / Felder ----------
B.protokoll.def = { ...B.protokoll.def, sp: 2 };
B.protokoll.gen = (d, P) => {
  const z = zeilenRoh(d.felder), n = Math.max(1, z.length), hf = arr(d.hf, n, 4.4).map(v => v * CM), cols = +d.sp === 1 ? 1 : 2;
  const W = 24 * CM, bw = (W - 10 - 10 * cols) / cols, top = 70, teile = [];
  let s = tx(W / 2, 34, d.titel, P.ink, 32, 'middle', 'font-weight="700"'), y = top;
  for (let r = 0; r < Math.ceil(n / cols); r++) {
    const idx = Array.from({ length: cols }, (_, c) => r * cols + c).filter(i => i < n), rh = Math.max(...idx.map(i => hf[i]));
    idx.forEach((i, c) => {
      const x = 10 + c * (bw + 10);
      s += rc(x, y, bw, rh, P.ink, 'none', 2.5, 'rx="12"') + rc(x, y, bw, 44, 'none', P.head, 0, 'rx="12"') + tx(x + 16, y + 22, z[i] || '', P.ink, 22, 'start', 'font-weight="600"');
      teile.push({ id: 'f' + i, x, y, w: bw, h: rh });
    });
    y += rh + 12;
  }
  return { svg: doc(W, y, s), w: W, h: y, teile };
};
B.protokoll.felder = B.protokoll.felder.concat([{ k: 'sp', l: 'Spalten', typ: 'auswahl', opts: [[1, '1 Spalte'], [2, '2 Spalten']] }]);
const pfEin = (d, at, n0) => { const z = zeilenRoh(d.felder), n = z.length;
  return { d: { ...d, felder: ins(z, at, 'Neues Feld').join('\n'), hf: ins(arr(d.hf, n, 4.4), at, arr(d.hf, n, 4.4)[n0 == null ? n - 1 : n0] || 4.4) }, map: id => { const i = +id.slice(1); return 'f' + (i >= at ? i + 1 : i); } }; };
B.protokoll.schnell = [{ l: '＋ Feld', f: d => pfEin(d, zeilenRoh(d.felder).length) },
  { l: '▥ 1 / 2 Spalten', f: d => ({ d: { ...d, sp: +d.sp === 1 ? 2 : 1 } }) },
  { l: '↕ alle höher', f: d => ({ d: { ...d, hf: arr(d.hf, zeilenRoh(d.felder).length, 4.4).map(v => um(v, 1.5, 2, 30)) } }) }];
B.protokoll.teil = (d, id) => { const i = +id.slice(1), n = zeilenRoh(d.felder).length; return [
  { l: '↕ Feld höher', f: d => ({ d: { ...d, hf: arr(d.hf, n, 4.4).map((v, j) => j === i ? um(v, 1.5, 2, 30) : v) } }) },
  { l: 'Feld niedriger', f: d => ({ d: { ...d, hf: arr(d.hf, n, 4.4).map((v, j) => j === i ? um(v, -1.5, 2, 30) : v) } }) },
  { l: '＋ Feld danach', f: d => pfEin(d, i + 1, i) },
  { l: '🗑 Feld', warn: 1, f: d => { if (n <= 1) return null; const z = zeilenRoh(d.felder);
    return { d: { ...d, felder: del(z, i).join('\n'), hf: del(arr(d.hf, n, 4.4), i) }, map: id => { const j = +id.slice(1); return j === i ? null : 'f' + (j > i ? j - 1 : j); } }; } }]; };

// ---------- Zuordnung ----------
B.zuordnung.gen = (d, P) => {
  const L = zeilenRoh(d.links), R = zeilenRoh(d.rechts);
  const n = Math.max(L.length, R.length, Math.round(d.paare || 0), 1); while (L.length < n) L.push(''); while (R.length < n) R.push('');
  const RR = R.slice();
  if (d.mischen) { let seed = R.join('').length * 7 + 3; for (let i = RR.length - 1; i > 0; i--) { seed = (seed * 9301 + 49297) % 233280; const j = Math.floor(seed / 233280 * (i + 1)); [RR[i], RR[j]] = [RR[j], RR[i]]; } }
  const bw = (d.kb || 7) * CM, bh = (d.kh || 1.6) * CM, gap = 0.5 * CM, mid = 6 * CM, m = 14, top = d.titel ? 60 : 0, teile = [];
  const W = 2 * bw + mid + 2 * m, H = top + n * (bh + gap) - gap + 2 * m;
  let s = d.titel ? tx(W / 2, m + 22, d.titel, P.ink, 28, 'middle', 'font-weight="700"') : '';
  const card = (x, y, t, dotX) => rc(x, y, bw, bh, P.ink, P.soft, 2.5, 'rx="14"') + (t ? tx(x + bw / 2, y + bh / 2, t, P.ink, Math.min(24, bh * 0.4)) : '') + `<circle cx="${f(dotX)}" cy="${f(y + bh / 2)}" r="9" fill="${P.acc}"/>`;
  for (let i = 0; i < n; i++) {
    const y = m + top + i * (bh + gap);
    s += card(m, y, L[i], m + bw + 14) + card(m + bw + mid, y, RR[i], m + bw + mid - 14);
    teile.push({ id: 'l' + i, x: m, y, w: bw, h: bh }, { id: 'r' + i, x: m + bw + mid, y, w: bw, h: bh });
  }
  return { svg: doc(W, H, s), w: W, h: H, teile };
};
const zuPaar = (d, at) => { const L = zeilenRoh(d.links), R = zeilenRoh(d.rechts), n = Math.max(L.length, R.length, Math.round(d.paare || 0), 1); while (L.length < n) L.push(''); while (R.length < n) R.push('');
  return { d: { ...d, paare: n + 1, links: ins(L, at, '').join('\n'), rechts: ins(R, at, '').join('\n') }, map: id => { const i = +id.slice(1); return id[0] + (i >= at ? i + 1 : i); } }; };
B.zuordnung.schnell = [{ l: '＋ Paar', f: d => { const n = Math.max(zeilenRoh(d.links).length, zeilenRoh(d.rechts).length, Math.round(d.paare || 0), 1); return zuPaar(d, n); } },
  { l: '↔ Karten breiter', f: d => ({ d: { ...d, kb: um(d.kb || 7, 1, 3, 20) } }) }, { l: '↕ Karten höher', f: d => ({ d: { ...d, kh: um(d.kh || 1.6, 0.8, 1, 10) } }) },
  { l: 'Karten kleiner', f: d => ({ d: { ...d, kb: um(d.kb || 7, -1, 3, 20), kh: um(d.kh || 1.6, -0.8, 1, 10) } }) }];
B.zuordnung.teil = (d, id) => { const i = +id.slice(1); return [
  { l: '＋ Paar darunter', f: d => zuPaar(d, i + 1) },
  { l: '🗑 Paar', warn: 1, f: d => { const L = zeilenRoh(d.links), R = zeilenRoh(d.rechts), n = Math.max(L.length, R.length, Math.round(d.paare || 0), 1); if (n <= 1) return null; while (L.length < n) L.push(''); while (R.length < n) R.push('');
    return { d: { ...d, paare: n - 1, links: del(L, i).join('\n'), rechts: del(R, i).join('\n') }, map: id2 => { const j = +id2.slice(1); return j === i ? null : id2[0] + (j > i ? j - 1 : j); } }; } }]; };

// ---------- Schnellknöpfe für weitere Bausteine ----------
const q = (l, fn) => ({ l, f: d => ({ d: fn({ ...d }) }) });
B.zahlenstrahl.schnell = B.zeitstrahl.schnell = [
  q('＋ Schritt', d => { d.ende = +d.ende + +d.schritt; return d; }), q('− Schritt', d => { if (+d.ende - +d.schritt > +d.start) d.ende = +d.ende - +d.schritt; return d; }),
  q('↔ Abstand größer', d => { d.abstand = um(+d.abstand, 0.5, 0.5, 10); return d; }), q('Abstand kleiner', d => { d.abstand = um(+d.abstand, -0.5, 0.5, 10); return d; })];
if (B.zahlengerade) B.zahlengerade.schnell = [ // Zahlengerade: nach beiden Seiten erweitern
  q('↔ Bereich größer', d => { d.start = +d.start - +d.schritt; d.ende = +d.ende + +d.schritt; return d; }),
  q('Bereich kleiner', d => { if (+d.ende - +d.start > 2 * +d.schritt) { d.start = +d.start + +d.schritt; d.ende = +d.ende - +d.schritt; } return d; }),
  q('↔ Abstand größer', d => { d.abstand = um(+d.abstand, 0.5, 0.5, 10); return d; }), q('Abstand kleiner', d => { d.abstand = um(+d.abstand, -0.5, 0.5, 10); return d; }),
  q('🔴🔵 Farbig ein/aus', d => { d.farbig = !d.farbig; return d; })];
B.koord.schnell = [
  q('＋ Bereich', d => { d.xmin--; d.xmax++; d.ymin--; d.ymax++; return d; }), q('− Bereich', d => { if (d.xmax - d.xmin > 2) { d.xmin++; d.xmax--; } if (d.ymax - d.ymin > 2) { d.ymin++; d.ymax--; } return d; }),
  q('⤢ Einheit größer', d => { d.einheit = um(+d.einheit, 0.5, 0.5, 5); return d; }), q('Einheit kleiner', d => { d.einheit = um(+d.einheit, -0.5, 0.5, 5); return d; }),
  q('▦ Raster ein/aus', d => { d.raster = !d.raster; return d; })];
B.bruchkreis.schnell = [q('◔ ▦ Kreis / Kästchen / beide', d => { d.darst = { kreis: 'kaestchen', kaestchen: 'beide', beide: 'kreis' }[d.darst || 'kreis']; return d; }),
  q('⇄ neben / unter', d => { d.lage = d.lage === 'unter' ? 'neben' : 'unter'; return d; }),
  q('＋ Teil', d => { d.n = Math.min(100, d.n + 1); return d; }), q('− Teil', d => { d.n = Math.max(1, d.n - 1); d.k = Math.min(d.k, d.n); return d; }),
  q('＋ färben', d => { d.k = Math.min(d.n, d.k + 1); return d; }), q('− färben', d => { d.k = Math.max(0, d.k - 1); return d; }), q('Bruch zeigen', d => { d.zeigen = !d.zeigen; return d; })];
B.bruchstreifen.schnell = [q('＋ Teil', d => { d.n = Math.min(40, d.n + 1); return d; }), q('− Teil', d => { d.n = Math.max(1, d.n - 1); d.k = Math.min(d.k, d.n); return d; }),
  q('＋ färben', d => { d.k = Math.min(d.n, d.k + 1); return d; }), q('− färben', d => { d.k = Math.max(0, d.k - 1); return d; }), q('Bruch zeigen', d => { d.zeigen = !d.zeigen; return d; })];
B.loesung.schnell = [q('👁 Aufdecken / zudecken', d => { d.offen = !d.offen; return d; })];
B.uhr.schnell = [q('+5 min', d => { let t = d.h * 60 + d.m + 5; t = (t + 1440) % 1440; d.h = Math.floor(t / 60); d.m = t % 60; return d; }), q('−5 min', d => { let t = d.h * 60 + d.m - 5; t = (t + 1440) % 1440; d.h = Math.floor(t / 60); d.m = t % 60; return d; }),
  q('+1 h', d => { d.h = (d.h + 1) % 24; return d; }), q('☀️/🌙 +12 h', d => { d.h = (d.h + 12) % 24; return d; }), q('Zeiger ein/aus', d => { d.zeiger = !d.zeiger; return d; }), q('🔢 Digitaluhr ein/aus', d => { d.digital = !d.digital; return d; })];
B.stellenwert.schnell = [q('＋ Zeile', d => { d.zeilen = Math.min(12, d.zeilen + 1); return d; }), q('− Zeile', d => { d.zeilen = Math.max(1, d.zeilen - 1); return d; })];
// Schriftlich rechnen: Schnellknöpfe passend zur Rechenart (eine Funktion statt fester Liste)
B.rechnen.schnell = d => [q('＋ Stelle', d => { d.stellen = Math.min(9, d.stellen + 1); return d; }), q('− Stelle', d => { d.stellen = Math.max(2, d.stellen - 1); return d; })].concat(
  d.art === 'geteilt' ? [q('＋ Teiler-Stelle', d => { d.teiler = Math.min(4, (d.teiler || 1) + 1); return d; }), q('− Teiler-Stelle', d => { d.teiler = Math.max(1, (d.teiler || 1) - 1); return d; })]
  : d.art === 'mal' ? [q('＋ Stelle 2. Faktor', d => { d.faktor2 = Math.min(4, (d.faktor2 || 2) + 1); return d; }), q('− Stelle 2. Faktor', d => { d.faktor2 = Math.max(1, (d.faktor2 || 2) - 1); return d; })]
  : [q('＋ Zeile', d => { d.zeilen = Math.min(8, d.zeilen + 1); return d; }), q('− Zeile', d => { d.zeilen = Math.max(2, d.zeilen - 1); return d; })]);
for (const k of ['karte_de', 'karte_eu', 'karte_welt']) B[k].schnell = [q('Namen ein/aus', d => { d.namen = !d.namen; return d; })].concat(k === 'karte_welt' ? [q('Gradnetz ein/aus', d => { d.gradnetz = !d.gradnetz; return d; })] : [q('Städte ein/aus', d => { d.staedte = !d.staedte; return d; })]);

// ---------- Teile antippen, Änderungen anwenden (Handschrift wandert mit) ----------
T.svgZuWelt = (o, g, sx, sy) => {
  const lx = sx * o.w / g.w - o.w / 2, ly = sy * o.h / g.h - o.h / 2, a = (o.r || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [o.x + o.w / 2 + lx * c - ly * s, o.y + o.h / 2 + lx * s + ly * c];
};
T.teilAt = (o, x, y) => {
  const Bk = B[o.k]; if (!Bk || !Bk.teil) return null;
  const g = T.genObj(o.k, o.d, false); if (!g.teile) return null;
  const [lx, ly] = T.objLocal(o, x, y), sx = (lx + o.w / 2) * g.w / o.w, sy = (ly + o.h / 2) * g.h / o.h;
  for (let i = g.teile.length - 1; i >= 0; i--) { const t = g.teile[i]; if (sx >= t.x && sx <= t.x + t.w && sy >= t.y && sy <= t.y + t.h) return t.id; }
  return null;
};
T.teilEcken = o => {
  if (!T.S.teil || T.S.teil.oid !== o.id) return null;
  const g = T.genObj(o.k, o.d, false), t = (g.teile || []).find(x => x.id === T.S.teil.id); if (!t) return null;
  return [[t.x, t.y], [t.x + t.w, t.y], [t.x + t.w, t.y + t.h], [t.x, t.y + t.h]].map(([a, b]) => T.svgZuWelt(o, g, a, b));
};
T.bausteinAendern = (o, akt) => {
  if (akt.aus) { akt.aus(o); return; } // Aktion mit eigener Wirkung (z. B. Diagramm aus Messwerttabelle)
  const r = akt.f(JSON.parse(JSON.stringify({ ...B[o.k].def, ...o.d }))); if (!r) { T.toast('Das geht hier nicht (mindestens ein Feld muss bleiben).'); return; }
  const gAlt = T.genObj(o.k, o.d, false), gNeu = T.genObj(o.k, r.d, false), k = o.w / gAlt.w;
  const neu = { ...o, d: r.d, w: gNeu.w * k, h: gNeu.h * k }; // gleicher Maßstab, obere linke Ecke bleibt
  const map = r.map || (id => id), pg = T.page();
  T.snap();
  // Handschrift in Feldern um die Verschiebung „ihres“ Feldes mitnehmen
  if (gAlt.teile && gNeu.teile) {
    pg.items = pg.items.map(it => {
      if (it.t !== 's') return it; const b = T.bbox(it), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
      if (!T.hitObj(o, cx, cy)) return it;
      const [lx, ly] = T.objLocal(o, cx, cy), sx = (lx + o.w / 2) * gAlt.w / o.w, sy = (ly + o.h / 2) * gAlt.h / o.h;
      const tAlt = gAlt.teile.slice().reverse().find(t => sx >= t.x && sx <= t.x + t.w && sy >= t.y && sy <= t.y + t.h); if (!tAlt) return it;
      const nid = map(tAlt.id), tNeu = nid != null && gNeu.teile.find(t => t.id === nid); if (!tNeu) return it;
      const [ax, ay] = T.svgZuWelt(o, gAlt, tAlt.x, tAlt.y), [bx, by] = T.svgZuWelt(neu, gNeu, tNeu.x, tNeu.y), dx = bx - ax, dy = by - ay;
      return dx || dy ? { ...it, p: it.p.map(q => [T.r1(q[0] + dx), T.r1(q[1] + dy), q[2]]) } : it;
    });
  }
  T.replaceItem(neu);
  if (T.S.teil && T.S.teil.oid === o.id) { const nid = map(T.S.teil.id); T.S.teil = nid != null && (gNeu.teile || []).some(t => t.id === nid) ? { oid: o.id, id: nid } : null; }
  T.renderOver(); T.onSelChange && T.onSelChange();
};

// ---------- 🧱 Zahlenmauer (Einfügen › Mathe) ----------
// Jeder Stein ist die Summe der beiden darunter. Grundsteine eintragen (leer = alles frei zum Ausfüllen), Anzeige wählen;
// einzelne Steine antippen › „Stein leer / zeigen“. In jeden Stein lässt sich mit dem Stift schreiben (wandert mit).
const zahl = s => { const v = parseFloat(String(s).replace(',', '.')); return isFinite(v) ? v : null; };
const zText = v => v == null ? '' : String(Math.round(v * 1000) / 1000).replace('.', ',');
function mauerWerte(d) {
  const n = T.clamp(Math.round(d.anzahl || 4), 2, 8), g = String(d.steine || '').split(/[;\s]+/).filter(Boolean).map(zahl);
  const eig = d.eig || {}, reihen = [Array.from({ length: n }, (_, i) => g[i] != null ? g[i] : zahl(eig['0,' + i]))]; /* eingetragene Grundsteine rechnen mit */
  for (let k = 1; k < n; k++) { const u = reihen[k - 1]; reihen.push(Array.from({ length: n - k }, (_, i) => u[i] != null && u[i + 1] != null ? u[i] + u[i + 1] : null)); }
  return reihen; // reihen[0] = unten
}
B.zahlenmauer = { name: 'Zahlenmauer', gruppe: 'Mathe', def: { anzahl: 4, steine: '', zeigen: 'grund', breite: 2.4, wechsel: [], eig: {} }, /* leer: Zahlen per 🎲, im Fenster oder Stein für Stein */
  felder: [{ k: 'anzahl', l: 'Steine in der untersten Reihe', typ: 'zahl', min: 2, max: 8 },
    { k: 'steine', l: 'Grundsteine (mit ; trennen – leer lassen = freie Mauer)', typ: 'text' },
    { k: 'zeigen', l: 'Sichtbar', typ: 'auswahl', opts: [['grund', 'nur die unterste Reihe'], ['spitze', 'unterste Reihe und Spitze'], ['leer', 'alle Steine leer'], ['alle', 'alle Steine (Lösung)']] },
    { k: 'breite', l: 'Steinbreite (cm)', typ: 'zahl', min: 1.5, max: 6 }],
  gen: (d, P) => {
    P = T.palette(false); // immer weiß hinterlegt
    const R = mauerWerte(d), n = R[0].length, sw = T.clamp(+d.breite || 2.4, 1, 8) * CM, sh = Math.max(1.3 * CM, sw * 0.55), m = 6;
    const W = n * sw + 2 * m, H = n * sh + 2 * m, wechsel = new Set(Array.isArray(d.wechsel) ? d.wechsel : []), teile = []; let s = rc(0, 0, W, H, 'none', '#ffffff', 0);
    for (let k = 0; k < n; k++) for (let i = 0; i < n - k; i++) {
      const x = m + k * sw / 2 + i * sw, y = m + (n - 1 - k) * sh, id = k + ',' + i;
      let sicht = d.zeigen === 'alle' || (d.zeigen === 'grund' && k === 0) || (d.zeigen === 'spitze' && (k === 0 || k === n - 1));
      if (wechsel.has(id)) sicht = !sicht;
      const eigen = (d.eig || {})[id], v = R[k][i], gefuellt = (eigen != null && eigen !== '') || (sicht && v != null);
      s += rc(x, y, sw, sh, P.ink, gefuellt ? P.soft : 'none', 2.5);
      if (gefuellt) s += tx(x + sw / 2, y + sh / 2, eigen != null && eigen !== '' ? String(eigen) : zText(v), P.ink, Math.min(30, sh * 0.5), 'middle', k === 0 ? 'font-weight="700"' : '');
      teile.push({ id, x, y, w: sw, h: sh });
    }
    return { svg: doc(W, H, s), w: W, h: H, teile };
  } };
// 🔢 Zahlen antippen statt tippen (am Board gibt es keine Tastatur): oben die Steine, darunter die Zahlen.
// Gewählte Zahl springt automatisch zum nächsten Stein; Grundsteine aus „steine“ werden dazu einzeln übernommen.
const MZ = [...Array.from({ length: 21 }, (_, i) => i), 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];
function mauerWahl(o, start) {
  const h = T.h, akt = () => T.page().items.find(i => i.id === o.id) || o;
  const d0 = { ...B.zahlenmauer.def, ...akt().d }, n = T.clamp(Math.round(d0.anzahl || 4), 2, 8);
  if (String(d0.steine || '').trim()) {
    const e = { ...(d0.eig || {}) }; mauerWerte({ ...d0, eig: {} })[0].forEach((v, i) => { if (v != null) e['0,' + i] = zText(v); });
    T.bausteinAendern(akt(), { f: dd => ({ d: { ...dd, steine: '', eig: e } }) });
  }
  const ids = start && start[0] !== '0' ? [start] : Array.from({ length: n }, (_, i) => '0,' + i);
  let sel = start && ids.includes(start) ? start : ids[0];
  const reihe = h('div', { class: 'zm-reihe' }), zahlen = h('div', { class: 'zm-zahlen' });
  const zeichne = () => {
    const e = akt().d.eig || {}; reihe.innerHTML = '';
    ids.forEach(id => reihe.append(h('button', { class: 'zm-stein' + (id === sel ? ' an' : ''), onclick: () => { sel = id; zeichne(); } }, e[id] != null && e[id] !== '' ? String(e[id]) : '?')));
  };
  const setze = v => {
    T.bausteinAendern(akt(), { f: dd => { const e = { ...(dd.eig || {}) }; if (v === '') delete e[sel]; else e[sel] = String(v); return { d: { ...dd, eig: e } }; } });
    const i = ids.indexOf(sel); if (v !== '' && i < ids.length - 1) sel = ids[i + 1]; zeichne();
  };
  zahlen.append(...MZ.map(v => h('button', { class: 'zm-z', onclick: () => setze(v) }, String(v))),
    h('button', { class: 'zm-z', onclick: () => setze('x') }, 'x'), h('button', { class: 'zm-z zm-leer', onclick: () => setze('') }, '✕ leer'));
  zeichne();
  T.openDlg([h('h2', {}, ids.length > 1 ? '🔢 Unterste Reihe: Zahlen wählen' : '🔢 Zahl für diesen Stein'),
    h('p', { class: 'hint' }, ids.length > 1 ? 'Stein antippen, dann Zahl antippen – es geht automatisch zum nächsten Stein.' : 'Zahl antippen.'),
    reihe, zahlen, h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: T.closeDlg }, '✔ Fertig'))]);
}
B.zahlenmauer.schnell = [
  { l: '🔢 Zahlen wählen', aus: o => mauerWahl(o) },
  { l: '🎲 Neue Zahlen', f: d => { const n = T.clamp(Math.round(d.anzahl || 4), 2, 8), max = n <= 3 ? 20 : n <= 5 ? 12 : 6, e = { ...(d.eig || {}) }; Object.keys(e).forEach(k => { if (k.startsWith('0,')) delete e[k]; }); return { d: { ...d, eig: e, steine: Array.from({ length: n }, () => 1 + Math.floor(Math.random() * max)).join('; '), wechsel: [] } }; } },
  { l: '👁 Lösung', f: d => ({ d: { ...d, zeigen: 'alle', wechsel: [] } }) },
  { l: '🙈 Wieder leer', f: d => ({ d: { ...d, zeigen: 'grund', wechsel: [] } }) },
  { l: '🧹 Alles leeren', f: d => ({ d: { ...d, steine: '', eig: {}, zeigen: 'grund', wechsel: [] } }) },
  { l: '＋ Reihe', f: d => ({ d: { ...d, anzahl: Math.min(8, Math.round(d.anzahl || 4) + 1), wechsel: [] } }) },
  { l: '− Reihe', f: d => ({ d: { ...d, anzahl: Math.max(2, Math.round(d.anzahl || 4) - 1), wechsel: [] } }) }];
B.zahlenmauer.teil = (d, id) => [
  { l: '🔢 Zahl wählen', aus: o => mauerWahl(o, id) },
  { l: '✕ Eintrag löschen', f: d => { const e = { ...(d.eig || {}) }; delete e[id]; return { d: { ...d, eig: e } }; } },
  { l: '👁/🙈 Ergebnis zeigen oder leer', f: d => { const w = new Set(Array.isArray(d.wechsel) ? d.wechsel : []); if (w.has(id)) w.delete(id); else w.add(id); return { d: { ...d, wechsel: [...w] } }; } }];
})();
