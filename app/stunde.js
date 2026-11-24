// Tafel-App – 📋 Stunde & Rückmeldung: Vorlagen für Struktur und Rückmeldung (Vorlagen › 📋 Stunde & Rückmeldung)
//   📋 Stundenablauf: Ziel, Schritte zum Abhaken (Zeile antippen), Hausaufgaben – schmal für den Tafelrand
//   👍 Blitzlicht: 👍 👌 👎 (oder Smileys/Ampel) antippen = eine Stimme; Ergebnis erst verdeckt, dann als Balken
//   🚪 Exit-Ticket: Satzanfänge mit Schreiblinien zum Ausfüllen
// Alle drei lassen sich wie jedes Element über das Kontextmenü „📥 In die Notizen“ in die Ablage legen.
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', GRAU = '#64748b', RAND = '#3a6d99';
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const zeilen = s => String(s || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean);
const umbruch = (z, max) => { const out = []; let cur = ''; for (const w of String(z).split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const schreiblinien = (x0, x1, y, n, abst = 40) => { let s = ''; for (let i = 0; i < n; i++) s += `<line x1="${x0}" y1="${y + i * abst}" x2="${x1}" y2="${y + i * abst}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6 6"/>`; return s; };
const rahmen = (W, H, P) => `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>`;

// ---------- 📋 Stundenablauf ----------
B.stundenablauf = { name: 'Stundenablauf', gruppe: 'Struktur',
  def: { titel: 'Unsere Stunde', ziel: '', schritte: 'Einstieg\nErarbeitung\nÜbung\nSicherung', leer: 0, fertig: [], ha: '' },
  felder: [{ k: 'titel', l: 'Überschrift', typ: 'text' }, { k: 'ziel', l: 'Stundenziel (leer = Linie zum Schreiben)', typ: 'text' },
    { k: 'schritte', l: 'Schritte (je Zeile einer)', typ: 'liste' }, { k: 'leer', l: 'Leere Zeilen zum Schreiben mit dem Stift', typ: 'zahl', min: 0, max: 8 }, { k: 'ha', l: 'Hausaufgaben (leer = Linien zum Schreiben)', typ: 'liste' }],
  gen: (d, P) => {
    const W = 440, L = 24, schr = zeilen(d.schritte).concat(Array(Math.round(T.clamp(+d.leer || 0, 0, 8))).fill('')), fertig = new Set(d.fertig || []), teile = [];
    const naechst = schr.findIndex((_, i) => !fertig.has(i));
    let y = 18, s = '';
    s += text(L, y + 22, '📋 ' + (d.titel || 'Unsere Stunde'), 27, P.ink, 'font-weight="700"'); y += 62;
    /* 🎯 Ziel */
    const zl = umbruch(d.ziel || '', 30), zh = 40 + Math.max(1, zl.length) * 32 + 12;
    s += `<rect x="${L - 8}" y="${y}" width="${W - 2 * L + 16}" height="${zh}" rx="10" fill="rgba(46,125,50,.08)" stroke="${GRUEN}" stroke-width="1.5"/>` + text(L + 4, y + 20, '🎯 Ziel', 20, GRUEN, 'font-weight="700"');
    if (zl.length) zl.forEach((z, i) => { s += text(L + 4, y + 52 + i * 32, z, 22, P.ink); }); else s += schreiblinien(L + 4, W - L, y + 66, 1);
    y += zh + 18;
    /* Schritte zum Abhaken – der nächste offene ist hervorgehoben */
    schr.forEach((t, i) => {
      const tl = umbruch(t, 24), rh = Math.max(52, 20 + tl.length * 30), an = fertig.has(i), jetzt = i === naechst;
      if (jetzt) s += `<rect x="${L - 8}" y="${y}" width="${W - 2 * L + 16}" height="${rh}" rx="10" fill="rgba(21,101,192,.10)"/>` + text(W - L - 4, y + rh / 2, '◀ jetzt', 17, BLAU, 'text-anchor="end" font-weight="700"');
      const bx = L, by = y + rh / 2 - 15;
      s += `<rect x="${bx}" y="${by}" width="30" height="30" rx="6" fill="${an ? GRUEN : P.papier}" stroke="${an ? GRUEN : P.ink}" stroke-width="2.5"/>`;
      if (an) s += `<path d="M ${bx + 7} ${by + 15} l 6 7 l 11 -14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (!t) s += text(bx + 46, y + rh / 2, (i + 1) + '.', 23, an ? GRAU : P.ink) + schreiblinien(bx + 74, W - L - (jetzt ? 70 : 8), y + rh / 2 + 14, 1); /* leere Zeile: mit dem Stift hineinschreiben */
      tl.forEach((z, j) => { const ty = y + rh / 2 + (j - (tl.length - 1) / 2) * 30;
        s += text(bx + 46, ty, (j ? '' : (i + 1) + '. ') + z, 23, an ? GRAU : P.ink, (jetzt ? 'font-weight="700" ' : '') + (an ? 'text-decoration="line-through"' : '')); });
      teile.push({ id: 's' + i, x: L - 8, y, w: W - 2 * L + 16, h: rh });
      y += rh + 6;
    });
    y += 14;
    /* 🏠 Hausaufgaben */
    const hl = zeilen(d.ha).flatMap(z => umbruch(z, 30)), hh = 40 + Math.max(2, hl.length) * 34 + 10;
    s += `<rect x="${L - 8}" y="${y}" width="${W - 2 * L + 16}" height="${hh}" rx="10" fill="rgba(239,108,0,.07)" stroke="#ef6c00" stroke-width="1.5"/>` + text(L + 4, y + 20, '🏠 Hausaufgaben', 20, '#b45309', 'font-weight="700"');
    if (hl.length) hl.forEach((z, i) => { s += text(L + 4, y + 54 + i * 34, z, 21, P.ink); }); else s += schreiblinien(L + 4, W - L, y + 70, 2);
    y += hh + 18;
    return { svg: T._svg.doc(W, y, rahmen(W, y, P) + s), w: W, h: y, teile };
  } };
B.stundenablauf.tippen = (o, id) => { const i = +id.slice(1); /* Zeile antippen: abhaken bzw. wieder öffnen */
  T.bausteinAendern(o, { f: dd => { const fe = new Set(dd.fertig || []); fe.has(i) ? fe.delete(i) : fe.add(i); return { d: { ...dd, fertig: [...fe].sort((a, b) => a - b) } }; } }); };

// ---------- 👍 Blitzlicht ----------
const ARTEN = { daumen: [['👍', 'gut'], ['👌', 'geht so'], ['👎', 'schwierig']], smiley: [['😀', ''], ['🙂', ''], ['😐', ''], ['🙁', '']], ampel: [['🟢', 'verstanden'], ['🟡', 'teilweise'], ['🔴', 'noch nicht']] };
const FARB = ['#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
const stimmenVon = d => { const n = (ARTEN[d.art] || ARTEN.daumen).length, st = Array(n).fill(0); for (const i of d.verlauf || []) if (i < n) st[i]++; return st; };
B.blitzlicht = { name: 'Blitzlicht', gruppe: 'Struktur',
  def: { frage: 'Wie war die Stunde für dich?', art: 'daumen', verlauf: [], zeigen: false },
  felder: [{ k: 'frage', l: 'Frage', typ: 'text' }, { k: 'art', l: 'Antworten', typ: 'auswahl', opts: [['daumen', '👍 👌 👎 Daumen'], ['smiley', '😀 🙂 😐 🙁 Smileys'], ['ampel', '🟢 🟡 🔴 Ampel']] }],
  gen: (d, P) => {
    const opts = ARTEN[d.art] || ARTEN.daumen, n = opts.length, bw = 170, gap = 22, W = Math.max(600, n * bw + (n - 1) * gap + 60), st = stimmenVon(d), summe = st.reduce((a, b) => a + b, 0), teile = [];
    let s = text(30, 42, '💡 ' + (d.frage || 'Blitzlicht'), 28, P.ink, 'font-weight="700"');
    const x0 = (W - (n * bw + (n - 1) * gap)) / 2, y0 = 82;
    opts.forEach(([em, l], i) => { const x = x0 + i * (bw + gap);
      s += `<rect x="${x}" y="${y0}" width="${bw}" height="150" rx="18" fill="${P.papier}" stroke="${FARB[i]}" stroke-width="4"/>` + mitte(x + bw / 2, y0 + (l ? 62 : 75), em, 68, P.ink);
      if (l) s += mitte(x + bw / 2, y0 + 124, l, 20, P.ink, 'font-weight="700"');
      if (d.zeigen) s += `<circle cx="${x + bw - 6}" cy="${y0 + 6}" r="22" fill="${FARB[i]}"/>` + mitte(x + bw - 6, y0 + 7, st[i], 22, '#fff', 'font-weight="700"');
      teile.push({ id: 'o' + i, x, y: y0, w: bw, h: 150 }); });
    let y = y0 + 176;
    if (d.zeigen) { opts.forEach(([em], i) => { const p = summe ? st[i] / summe : 0, bx = 120, bl = W - bx - 110;
        s += mitte(80, y + 16, em, 30, P.ink) + `<rect x="${bx}" y="${y}" width="${bl}" height="32" rx="8" fill="rgba(148,163,184,.2)"/><rect x="${bx}" y="${y}" width="${f(bl * p)}" height="32" rx="8" fill="${FARB[i]}"/>` + text(bx + bl + 14, y + 16, Math.round(p * 100) + ' %', 22, P.ink, 'font-weight="700"');
        y += 44; }); y += 6; }
    s += mitte(W / 2, y + 12, summe + (summe === 1 ? ' Stimme' : ' Stimmen') + (d.zeigen ? '' : ' – Ergebnis noch verdeckt') + ' · antippen = eine Stimme', 19, GRAU);
    y += 40;
    return { svg: T._svg.doc(W, y, rahmen(W, y, P) + s), w: W, h: y, teile };
  } };
B.blitzlicht.tippen = (o, id) => { const i = +id.slice(1); /* eine Stimme – ohne Rückgängig-Flut: Stimmen zählen still mit */
  const cur = T.page().items.find(x => x.id === o.id) || o, d = { ...B.blitzlicht.def, ...cur.d, verlauf: [...(cur.d.verlauf || []), i] }, g = T.genObj('blitzlicht', d, false), k = cur.w / T.genObj('blitzlicht', cur.d, false).w;
  T.replaceItem({ ...cur, d, w: g.w * k, h: g.h * k }); T.renderOver && T.renderOver(); T.changed && T.changed();
  T.toast && T.toast('Stimme gezählt' + (d.zeigen ? '' : ' (Ergebnis noch verdeckt)'), 900); };

// ---------- 🚪 Exit-Ticket ----------
B.exitticket = { name: 'Exit-Ticket', gruppe: 'Struktur',
  def: { titel: 'Exit-Ticket', saetze: 'Das habe ich heute gelernt:\nDas ist mir noch unklar:\nDazu habe ich eine Frage:', daumen: true, linien: 2 },
  felder: [{ k: 'titel', l: 'Überschrift', typ: 'text' }, { k: 'saetze', l: 'Satzanfänge (je Zeile einer)', typ: 'liste' }, { k: 'linien', l: 'Schreiblinien je Satz', typ: 'zahl', min: 1, max: 5 }, { k: 'daumen', l: '👍 👌 👎 zum Einkreisen', typ: 'check' }],
  gen: (d, P) => {
    const W = 700, n = Math.round(T.clamp(+d.linien || 2, 1, 5)); let y = 18, s = '';
    s += text(30, y + 24, '🚪 ' + (d.titel || 'Exit-Ticket'), 30, P.ink, 'font-weight="700"'); y += 66;
    if (d.daumen) { s += text(30, y + 20, 'So gut habe ich es verstanden:', 22, P.ink) + text(400, y + 20, '👍     👌     👎', 34, P.ink); y += 58; }
    for (const satz of zeilen(d.saetze)) { s += text(30, y + 18, satz, 23, P.ink, 'font-weight="700"'); y += 30; s += schreiblinien(30, W - 30, y + 36, n, 42); y += n * 42 + 26; }
    y += 6;
    return { svg: T._svg.doc(W, y, rahmen(W, y, P) + s), w: W, h: y };
  } };

// Kachel „zum Schreiben“: nur Nummern, Kästchen und Schreiblinien – alles mit dem Stift eintragen
const KV = T.KACHEL_VARIANTEN = T.KACHEL_VARIANTEN || {};
KV['stundenablauf:leer'] = { name: 'Stundenablauf (leer, zum Schreiben)', d: { schritte: '', leer: 4 } };
// ---------- Kontextmenü ----------
const inNotizen = { l: '📥 In die Notizen', aus: o => { T.S.sel = { ids: new Set([o.id]) }; T.inNotizen && T.inNotizen(); } };
B.stundenablauf.schnell = [{ l: '＋ Leere Zeile zum Schreiben', f: dd => ({ d: { ...dd, leer: Math.min(8, (+dd.leer || 0) + 1) } }) }, { l: '↺ Alle Haken weg', f: dd => ({ d: { ...dd, fertig: [] } }) }, { l: '✔ Nächsten abhaken', f: dd => { const n = zeilen(dd.schritte).length, fe = new Set(dd.fertig || []); for (let i = 0; i < n; i++) if (!fe.has(i)) { fe.add(i); break; } return { d: { ...dd, fertig: [...fe].sort((a, b) => a - b) } }; } }, inNotizen];
B.blitzlicht.schnell = d => [{ l: d.zeigen ? '🙈 Ergebnis verbergen' : '📊 Ergebnis zeigen', f: dd => ({ d: { ...dd, zeigen: !dd.zeigen } }) },
  { l: '↶ Stimme zurück', f: dd => ({ d: { ...dd, verlauf: (dd.verlauf || []).slice(0, -1) } }) }, { l: '↺ Neu (alle Stimmen weg)', f: dd => ({ d: { ...dd, verlauf: [], zeigen: false } }) },
  { l: '🔁 Daumen / Smileys / Ampel', f: dd => ({ d: { ...dd, art: dd.art === 'daumen' ? 'smiley' : dd.art === 'smiley' ? 'ampel' : 'daumen', verlauf: [] } }) }, inNotizen];
B.exitticket.schnell = [{ l: '👍 Daumen ein/aus', f: dd => ({ d: { ...dd, daumen: !dd.daumen } }) }, { l: '＋ Linie je Satz', f: dd => ({ d: { ...dd, linien: Math.min(5, (+dd.linien || 2) + 1) } }) }, { l: '− Linie je Satz', f: dd => ({ d: { ...dd, linien: Math.max(1, (+dd.linien || 2) - 1) } }) }, inNotizen];
})();
