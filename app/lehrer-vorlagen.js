// Tafel-App (Lehrkräfte-Version) – 📝 Protokollvorlage (Konferenz, Dienstbesprechung, Fachgruppe, Elterngespräch …)
// Einfügen › 📋 Stunde & Rückmeldung (vorn). Braucht vorlagen-kern.js (T.VL). Unten ziehen = mehr Tagesordnungspunkte, rechts = breiter.
'use strict';
(function () {
const B = T.BAUSTEINE, VL = T.VL; if (!B || !VL) return;
const { f, t, fett, linien, kasten, blatt, ABST, breite, kopfFelder, einfuegen, bild, nachDemZeichnen, dehnen } = VL, { TINTE, BLAU, GRUEN, ORANGE, LILA, LINIE, RAND } = VL.farben;
const zeilenText = s => String(s || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean);

B.ms_protokoll = { name: 'Protokoll (Konferenz, Besprechung)', gruppe: 'Struktur',
  def: { anlass: '', tops: '', zeilen: 4, aufgaben: 3 },
  felder: [{ k: 'anlass', l: 'Anlass (z. B. Fachkonferenz Mathe; leer = Linie zum Schreiben)', typ: 'text' },
    { k: 'tops', l: 'Tagesordnung (je Zeile ein TOP; leer = zum Schreiben)', typ: 'liste' },
    { k: 'zeilen', l: 'Anzahl TOPs', typ: 'zahl', min: 1, max: 15 }, { k: 'aufgaben', l: 'Zeilen für Aufgaben (Wer macht was bis wann?)', typ: 'zahl', min: 0, max: 10 }],
  gen: d => {
    const W = breite(d, 1100), tops = zeilenText(d.tops), n = Math.max(tops.length, Math.round(T.clamp(+d.zeilen || 4, 1, 15))), na = Math.round(T.clamp(d.aufgaben == null ? 3 : +d.aufgaben, 0, 10));
    let s = t(30, 40, '📝 PROTOKOLL', 20, RAND, fett);
    s += t(30, 90, 'Anlass:', 24, TINTE, fett) + (d.anlass ? t(124, 90, d.anlass, 26, TINTE, fett) : `<line x1="124" y1="106" x2="${W - 30}" y2="106" stroke="${LINIE}" stroke-width="1.5"/>`);
    const kf = kopfFelder(W, 146, ['Datum', 'Zeit (von – bis)', 'Ort', 'Leitung', 'Protokoll', 'Nächster Termin']); s += kf.s;
    let y = kf.y;
    /* Anwesend / entschuldigt */
    s += kasten(20, y, W - 40, 50 + 2 * ABST, '#64748b') + t(36, y + 26, '👥 Anwesend', 21, '#475569', fett) + linien(36, W / 2 - 20, y + 50 + ABST * 0.8, 2, ABST);
    s += `<line x1="${W / 2}" y1="${y + 10}" x2="${W / 2}" y2="${y + 40 + 2 * ABST}" stroke="#cbd5e1" stroke-width="1.5"/>` + t(W / 2 + 16, y + 26, 'Entschuldigt', 21, '#475569', fett) + linien(W / 2 + 16, W - 36, y + 50 + ABST * 0.8, 2, ABST);
    y += 50 + 2 * ABST + 18;
    /* Tagesordnung: TOP | Thema | Ergebnis / Beschluss */
    const xT = 90, xE = Math.round(W * 0.42), zh = 2 * ABST + 10;
    s += kasten(20, y, W - 40, 50 + n * zh, BLAU) + `<rect x="20" y="${y}" width="${W - 40}" height="50" rx="12" fill="${BLAU}" opacity=".12"/>`;
    s += t(36, y + 25, 'TOP', 21, BLAU, fett) + t(xT + 14, y + 25, 'Thema', 21, BLAU, fett) + t(xE + 14, y + 25, 'Ergebnis / Beschluss', 21, BLAU, fett);
    s += `<line x1="${xT}" y1="${y}" x2="${xT}" y2="${y + 50 + n * zh}" stroke="${BLAU}" stroke-width="1.5"/><line x1="${xE}" y1="${y}" x2="${xE}" y2="${y + 50 + n * zh}" stroke="${BLAU}" stroke-width="1.5"/>`;
    for (let i = 0; i < n; i++) { const yy = y + 50 + i * zh;
      if (i) s += `<line x1="20" y1="${yy}" x2="${W - 20}" y2="${yy}" stroke="${BLAU}" stroke-width="1" opacity=".45"/>`;
      s += t(55, yy + 30, String(i + 1), 22, TINTE, 'text-anchor="middle" ' + fett);
      if (tops[i]) s += t(xT + 14, yy + 30, tops[i], 21, TINTE); else s += linien(xT + 14, xE - 14, yy + ABST * 0.9, 2, ABST);
      s += linien(xE + 14, W - 36, yy + ABST * 0.9, 2, ABST); }
    y += 50 + n * zh + 18;
    /* Aufgaben: Was | Wer | Bis wann */
    if (na) { const xW = Math.round(W * 0.62), xB = Math.round(W * 0.8);
      s += kasten(20, y, W - 40, 50 + na * ABST, ORANGE, 'rgba(239,108,0,.05)') + t(36, y + 25, '✅ Aufgaben – Was?', 21, '#b45309', fett) + t(xW + 14, y + 25, 'Wer?', 21, '#b45309', fett) + t(xB + 14, y + 25, 'Bis wann?', 21, '#b45309', fett);
      s += `<line x1="${xW}" y1="${y + 8}" x2="${xW}" y2="${y + 42 + na * ABST}" stroke="#f0b27a" stroke-width="1.5"/><line x1="${xB}" y1="${y + 8}" x2="${xB}" y2="${y + 42 + na * ABST}" stroke="#f0b27a" stroke-width="1.5"/>`;
      s += linien(36, W - 36, y + 50 + ABST * 0.8, na, ABST); y += 50 + na * ABST + 18; }
    /* Unterschriften */
    s += `<line x1="40" y1="${y + 60}" x2="${W / 2 - 40}" y2="${y + 60}" stroke="${TINTE}" stroke-width="1.5"/><line x1="${W / 2 + 40}" y1="${y + 60}" x2="${W - 40}" y2="${y + 60}" stroke="${TINTE}" stroke-width="1.5"/>`;
    s += t(40, y + 82, 'Leitung', 18, '#64748b') + t(W / 2 + 40, y + 82, 'Protokoll', 18, '#64748b');
    const H = y + 110; void GRUEN; void LILA; void f;
    return { svg: blatt(W, H, s), w: W, h: H };
  } };
B.ms_protokoll.schnell = [{ l: '＋ TOP', f: dd => ({ d: { ...dd, zeilen: Math.min(15, (+dd.zeilen || 4) + 1) } }) }, { l: '− TOP', f: dd => ({ d: { ...dd, zeilen: Math.max(1, (+dd.zeilen || 4) - 1) } }) },
  { l: '＋ Aufgabe', f: dd => ({ d: { ...dd, aufgaben: Math.min(10, (dd.aufgaben == null ? 3 : +dd.aufgaben) + 1) } }) }];
dehnen.ms_protokoll = (d, dy) => ({ zeilen: Math.round(T.clamp((+d.zeilen || 4) + Math.round(dy / (2 * ABST + 10)), 1, 15)) }); /* unten ziehen = mehr TOPs */

// Kachel vorn in Einfügen › 📋 Stunde & Rückmeldung
nachDemZeichnen.push(() => document.querySelectorAll('.tiles').forEach(box => {
  if (box.querySelector('.lv-tile') || ![...box.children].some(c => /^(Blitzlicht|Exit-Ticket)/.test(c.textContent.trim()))) return;
  const b = document.createElement('button'); b.className = 'tile lv-tile'; b.onclick = () => einfuegen('ms_protokoll');
  const img = document.createElement('img'); img.src = bild('ms_protokoll'); img.alt = ''; b.append(img, B.ms_protokoll.name);
  box.prepend(b); /* „📒 Aufgaben & Notizen“ und die übrigen Vorlagen setzt mitschrift.js davor */
}));
})();
