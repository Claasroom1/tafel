// Tafel-App – 💼 Wirtschaft: Bildtafeln für den Wirtschaftsunterricht (Einfügen › 💼 Wirtschaft)
// Maslowsche Bedürfnispyramide · Bedürfnis – Bedarf – Nachfrage · Güterarten · Ökonomisches Prinzip ·
// Einfacher Wirtschaftskreislauf · Preisbildung am Markt · Haushaltsplan. Alles selbst gezeichnet (SVG), Texte unter ✏️ Bearbeiten bzw. Optionen.
'use strict';
(function () {
const B = T.BAUSTEINE;
const f = v => Math.round(v * 10) / 10, esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BLAU = '#1565c0', GRUEN = '#2e7d32', ORANGE = '#ef6c00', ROT = '#c62828', LILA = '#6a1b9a', GRAU = '#64748b', RAND = '#3a6d99';
const text = (x, y, t, size, col, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${col}" dominant-baseline="central" ${extra}>${esc(t)}</text>`;
const mitte = (x, y, t, size, col, extra = '') => text(x, y, t, size, col, 'text-anchor="middle" ' + extra);
const fett = 'font-weight="700"';
const box = (x, y, w, h, rand, fuell, r = 14, sw = 2.5) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fuell}" stroke="${rand}" stroke-width="${sw}"/>`;
const pfeil = (x1, y1, x2, y2, col, w = 4) => { const a = Math.atan2(y2 - y1, x2 - x1), k = 16, ax = x2 - k * Math.cos(a), ay = y2 - k * Math.sin(a);
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(ax)}" y2="${f(ay)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${f(x2)} ${f(y2)} L ${f(ax + 9 * Math.sin(a))} ${f(ay - 9 * Math.cos(a))} L ${f(ax - 9 * Math.sin(a))} ${f(ay + 9 * Math.cos(a))} Z" fill="${col}"/>`; };
const umbruch = (z, max) => { const out = []; let cur = ''; for (const w of String(z).split(' ')) { if ((cur + ' ' + w).length > max && cur) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const zeilenText = (x, y, t, max, size, col, abst, extra = '', mittig = false) => umbruch(t, max).map((z, i) => (mittig ? mitte : text)(x, y + i * abst, z, size, col, extra)).join('');
function tafel(titel, W, H, inhalt, P) {
  return { svg: T._svg.doc(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${P.papier}" stroke="${RAND}" stroke-width="2"/>` + text(30, 42, '💼 ' + titel, 32, P.ink, fett) + inhalt), w: W, h: H };
}

// ---------- Maslowsche Bedürfnispyramide ----------
const STUFEN = [ /* von unten nach oben */
  ['Physiologische Bedürfnisse', 'Essen, Trinken, Schlaf, Wärme', '#a5d6a7'],
  ['Sicherheitsbedürfnisse', 'Wohnung, Gesundheit, Arbeit, Schutz', '#90caf9'],
  ['Soziale Bedürfnisse', 'Familie, Freunde, Zugehörigkeit', '#ffe082'],
  ['Individualbedürfnisse', 'Anerkennung, Lob, Erfolg, Ansehen', '#ffcc80'],
  ['Selbstverwirklichung', 'Talente entfalten, Träume verwirklichen', '#ce93d8']];
B.wi_maslow = { name: 'Bedürfnispyramide (Maslow)', gruppe: 'Gesellschaft', def: { stufen: true, beispiele: true },
  felder: [{ k: 'stufen', l: 'Namen der Stufen zeigen (aus = leer zum Beschriften)', typ: 'check' }, { k: 'beispiele', l: 'Beispiele rechts zeigen', typ: 'check' }],
  gen: (d, P) => {
    const W = 1000, H = 720, cx = 410, yTop = 90, yBot = 590, hw = y => 70 + 320 * (y - yTop) / (yBot - yTop);
    let s = '';
    STUFEN.forEach(([name, bsp, farbe], i) => {
      const yb = yBot - i * 100, yt = yb - 100, ym = (yt + yb) / 2;
      s += `<path d="M ${f(cx - hw(yb))} ${yb} L ${f(cx + hw(yb))} ${yb} L ${f(cx + hw(yt))} ${yt} L ${f(cx - hw(yt))} ${yt} Z" fill="${farbe}" stroke="#37474f" stroke-width="2.5"/>`;
      s += mitte(cx - hw(ym) + 22, ym, String(i + 1), 22, '#37474f', fett);
      if (d.stufen) s += mitte(cx + 8, ym, name, i === 4 ? 19 : 22, '#1b1f2a', fett);
      if (d.beispiele) s += `<line x1="${f(cx + hw(ym) + 8)}" y1="${ym}" x2="790" y2="${ym}" stroke="${GRAU}" stroke-width="1.5" stroke-dasharray="5 5"/>` + zeilenText(800, ym - 11, bsp, 22, 18, P.ink, 24);
    });
    s += `<path d="M 36 ${yBot} L 36 ${yBot - 400} M 28 ${yBot} L 44 ${yBot} M 28 ${yBot - 400} L 44 ${yBot - 400}" stroke="${BLAU}" stroke-width="3" fill="none"/>`;
    s += `<text x="22" y="${yBot - 200}" font-size="18" fill="${BLAU}" text-anchor="middle" font-weight="700" transform="rotate(-90 22 ${yBot - 200})">Defizitbedürfnisse (Stufe 1–4)</text>`;
    s += `<text x="22" y="${yTop + 50}" font-size="16" fill="${LILA}" text-anchor="middle" font-weight="700" transform="rotate(-90 22 ${yTop + 50})">Wachstum</text>`;
    s += text(30, 628, 'Erst wenn die unteren Bedürfnisse erfüllt sind, werden die höheren wichtig.', 22, P.ink);
    s += text(30, 664, 'Stufe 1–4: Defizitbedürfnisse (Mangel) · Stufe 5: Wachstumsbedürfnis (nach Abraham Maslow)', 18, GRAU);
    return tafel('Bedürfnispyramide nach Maslow', W, H, s, P);
  } };
B.wi_maslow.schnell = [{ l: '🏷 Namen ein/aus', f: dd => ({ d: { ...dd, stufen: !dd.stufen } }) }, { l: '💡 Beispiele ein/aus', f: dd => ({ d: { ...dd, beispiele: !dd.beispiele } }) }];

// ---------- Bedürfnis – Bedarf – Nachfrage ----------
B.wi_bedarf = { name: 'Bedürfnis – Bedarf – Nachfrage', gruppe: 'Gesellschaft', def: {}, felder: [],
  gen: (d, P) => {
    const W = 1000, H = 560, K = [['Bedürfnis', 'Wunsch, einen Mangel zu beseitigen', 'Ich habe Hunger.', '#fff3e0', ORANGE],
      ['Bedarf', 'Bedürfnis, für das Geld (Kaufkraft) vorhanden ist', 'Ich habe 2 € für ein Brötchen.', '#e3f2fd', BLAU],
      ['Nachfrage', 'Bedarf, der am Markt wirksam wird – man kauft', 'Ich kaufe das Brötchen beim Bäcker.', '#e8f5e9', GRUEN]];
    let s = '';
    K.forEach(([n, erkl, bsp, fuell, col], i) => { const x = 40 + i * 320;
      s += box(x, 100, 280, 330, col, fuell) + mitte(x + 140, 140, n, 30, col, fett) + zeilenText(x + 140, 200, erkl, 22, 21, P.ink === '#ffffff' ? '#1b1f2a' : '#1b1f2a', 28, '', true);
      s += `<line x1="${x + 20}" y1="300" x2="${x + 260}" y2="300" stroke="${col}" stroke-width="1.5" stroke-dasharray="6 5"/>` + mitte(x + 140, 326, 'Beispiel:', 18, col, fett) + zeilenText(x + 140, 358, bsp, 22, 20, '#1b1f2a', 26, 'font-style="italic"', true);
      if (i < 2) s += pfeil(x + 284, 265, x + 316, 265, GRAU, 5); });
    s += text(40, 480, 'Nicht jedes Bedürfnis wird zum Bedarf – und nicht jeder Bedarf zur Nachfrage.', 22, P.ink);
    return tafel('Bedürfnis – Bedarf – Nachfrage', W, H, s, P);
  } };

// ---------- Güterarten ----------
B.wi_gueter = { name: 'Güterarten', gruppe: 'Gesellschaft', def: {}, felder: [],
  gen: (d, P) => {
    const W = 1000, H = 620; let s = '';
    const k = (x, y, w, n, bsp, col, fuell) => box(x, y, w, 96, col, fuell, 12) + mitte(x + w / 2, y + 30, n, 22, col, fett) + zeilenText(x + w / 2, y + 62, bsp, Math.round(w / 10), 16, '#1b1f2a', 20, '', true);
    s += box(380, 80, 240, 60, RAND, '#eef2f7', 12) + mitte(500, 110, 'Güter', 26, RAND, fett);
    s += `<path d="M 500 140 L 500 165 M 230 165 L 770 165 M 230 165 L 230 185 M 770 165 L 770 185" stroke="${GRAU}" stroke-width="2.5" fill="none"/>`;
    s += k(90, 185, 280, 'Freie Güter', 'kostenlos, genug für alle: Luft, Sonnenlicht', GRUEN, '#e8f5e9');
    s += k(630, 185, 280, 'Wirtschaftliche Güter', 'knapp, haben einen Preis', ORANGE, '#fff3e0');
    s += `<path d="M 770 281 L 770 310 M 200 310 L 840 310 M 200 310 L 200 330 M 520 310 L 520 330 M 840 310 L 840 330" stroke="${GRAU}" stroke-width="2.5" fill="none"/>`;
    s += k(60, 330, 280, 'Sachgüter', 'körperlich, zum Anfassen: Brot, Fahrrad', BLAU, '#e3f2fd');
    s += k(380, 330, 280, 'Dienstleistungen', 'nicht körperlich: Haarschnitt, Busfahrt', LILA, '#f3e5f5');
    s += k(700, 330, 280, 'Rechte', 'Patente, Lizenzen, Urheberrechte', ROT, '#ffebee');
    s += `<path d="M 200 426 L 200 450 M 110 450 L 290 450 M 110 450 L 110 470 M 290 450 L 290 470" stroke="${GRAU}" stroke-width="2.5" fill="none"/>`;
    s += k(20, 470, 180, 'Konsumgüter', 'für den Verbrauch: Brot, Kleidung', BLAU, '#e3f2fd');
    s += k(210, 470, 180, 'Investitionsgüter', 'zum Herstellen: Maschinen', BLAU, '#e3f2fd');
    s += text(420, 520, 'Knappheit zwingt dazu, zu wirtschaften:', 20, P.ink, fett) + text(420, 550, 'Wir müssen auswählen, was wir kaufen.', 20, P.ink);
    return tafel('Güterarten', W, H, s, P);
  } };

// ---------- Ökonomisches Prinzip ----------
B.wi_prinzip = { name: 'Ökonomisches Prinzip', gruppe: 'Gesellschaft', def: {}, felder: [],
  gen: (d, P) => {
    const W = 1000, H = 560; let s = '';
    const spalte = (x, n, regel, bsp, col, fuell) => box(x, 90, 440, 380, col, fuell) + mitte(x + 220, 130, n, 28, col, fett) +
      zeilenText(x + 220, 185, regel, 34, 21, '#1b1f2a', 28, '', true) + `<line x1="${x + 30}" y1="290" x2="${x + 410}" y2="290" stroke="${col}" stroke-width="1.5" stroke-dasharray="6 5"/>` +
      mitte(x + 220, 318, 'Beispiel:', 18, col, fett) + zeilenText(x + 220, 352, bsp, 36, 20, '#1b1f2a', 27, 'font-style="italic"', true);
    s += spalte(40, 'Maximalprinzip', 'Mit gegebenen Mitteln einen möglichst großen Nutzen erreichen.', 'Ich habe 20 € und kaufe davon möglichst viele Schulsachen.', BLAU, '#e3f2fd');
    s += spalte(520, 'Minimalprinzip', 'Ein festes Ziel mit möglichst geringen Mitteln erreichen.', 'Ich brauche einen Füller und suche das günstigste Angebot.', GRUEN, '#e8f5e9');
    s += text(40, 505, 'Beides zusammen heißt ökonomisches Prinzip: vernünftig mit knappen Mitteln umgehen.', 21, P.ink);
    return tafel('Ökonomisches Prinzip', W, H, s, P);
  } };

// ---------- Einfacher Wirtschaftskreislauf ----------
B.wi_kreislauf = { name: 'Einfacher Wirtschaftskreislauf', gruppe: 'Gesellschaft', def: {}, felder: [],
  gen: (d, P) => {
    const W = 1000, H = 600; let s = '';
    s += box(50, 220, 240, 130, ORANGE, '#fff3e0', 18, 3) + mitte(170, 265, '🏠', 38, '#000') + mitte(170, 315, 'Private Haushalte', 22, ORANGE, fett);
    s += box(710, 220, 240, 130, BLAU, '#e3f2fd', 18, 3) + mitte(830, 265, '🏭', 38, '#000') + mitte(830, 315, 'Unternehmen', 22, BLAU, fett);
    /* oben: Arbeit → Unternehmen (Güterstrom), Lohn → Haushalte (Geldstrom) */
    s += `<path d="M 200 220 Q 200 110 400 110 L 600 110 Q 800 110 800 200" fill="none" stroke="${LILA}" stroke-width="4"/>` + pfeil(800, 190, 800, 218, LILA);
    s += mitte(500, 92, 'Arbeitskraft (Güterstrom)', 20, LILA, fett);
    s += `<path d="M 860 220 Q 860 160 760 160 L 240 160 Q 140 160 140 205" fill="none" stroke="${GRUEN}" stroke-width="4"/>` + pfeil(140, 196, 140, 218, GRUEN);
    s += mitte(500, 180, 'Lohn, Gehalt = Einkommen (Geldstrom €)', 20, GRUEN, fett);
    /* unten: Güter → Haushalte (Güterstrom), Konsumausgaben → Unternehmen (Geldstrom) */
    s += `<path d="M 800 350 Q 800 460 600 460 L 400 460 Q 200 460 200 370" fill="none" stroke="${LILA}" stroke-width="4"/>` + pfeil(200, 380, 200, 352, LILA);
    s += mitte(500, 480, 'Güter und Dienstleistungen (Güterstrom)', 20, LILA, fett);
    s += `<path d="M 140 350 Q 140 410 240 410 L 760 410 Q 860 410 860 365" fill="none" stroke="${GRUEN}" stroke-width="4"/>` + pfeil(860, 374, 860, 352, GRUEN);
    s += mitte(500, 392, 'Konsumausgaben (Geldstrom €)', 20, GRUEN, fett);
    s += text(40, 535, 'Güterstrom und Geldstrom fließen in entgegengesetzte Richtungen.', 21, P.ink);
    s += text(40, 565, 'Violett = Güterstrom · Grün = Geldstrom', 18, GRAU);
    return tafel('Einfacher Wirtschaftskreislauf', W, H, s, P);
  } };

// ---------- Preisbildung am Markt ----------
/* Preislinie: preis 0 … 100 (5er-Schritte), 50 = Gleichgewichtspreis; leer = keine Linie. Höhe über der Mengenachse = 40 + 3,6 · preis */
const MK_Y0 = 540, mkPreis = d => { if (d.preis == null || String(d.preis).trim() === '') return null; const p = parseFloat(String(d.preis).replace(',', '.')); return isFinite(p) ? T.clamp(Math.round(p / 5) * 5, 0, 100) : null; };
B.wi_markt = { name: 'Preisbildung am Markt', gruppe: 'Gesellschaft', def: { beschriftung: true, preis: '' },
  felder: [{ k: 'beschriftung', l: 'Überhänge beschriften', typ: 'check' }, { k: 'preis', l: 'Preislinie (0–100, 50 = GP; leer = keine Linie)', typ: 'text' }],
  gen: (d, P) => {
    const W = 1000, H = 640, x0 = 100, y0 = MK_Y0, xw = 500, yh = 430, pr = mkPreis(d); let s = '';
    s += pfeil(x0, y0, x0 + xw + 30, y0, P.ink, 3) + pfeil(x0, y0, x0, y0 - yh - 30, P.ink, 3);
    s += text(x0 + xw + 10, y0 + 30, 'Menge', 20, P.ink, fett) + text(x0 - 10, y0 - yh - 40, 'Preis', 20, P.ink, 'text-anchor="end" ' + fett);
    const N = t => [x0 + 30 + t * 400, y0 - 400 + t * 360], A = t => [x0 + 30 + t * 400, y0 - 40 - t * 360];
    s += `<line x1="${N(0)[0]}" y1="${N(0)[1]}" x2="${N(1)[0]}" y2="${N(1)[1]}" stroke="${BLAU}" stroke-width="5" stroke-linecap="round"/>` + text(N(1)[0] - 4, N(1)[1] + 26, 'Nachfrage (N)', 20, BLAU, 'text-anchor="middle" ' + fett);
    s += `<line x1="${A(0)[0]}" y1="${A(0)[1]}" x2="${A(1)[0]}" y2="${A(1)[1]}" stroke="${ORANGE}" stroke-width="5" stroke-linecap="round"/>` + text(A(1)[0] - 4, A(1)[1] - 22, 'Angebot (A)', 20, ORANGE, 'text-anchor="middle" ' + fett);
    const G = [x0 + 30 + 0.5 * 400, y0 - 220];
    s += `<line x1="${x0}" y1="${G[1]}" x2="${G[0]}" y2="${G[1]}" stroke="${ROT}" stroke-width="2.5" stroke-dasharray="8 6"/><line x1="${G[0]}" y1="${G[1]}" x2="${G[0]}" y2="${y0}" stroke="${ROT}" stroke-width="2.5" stroke-dasharray="8 6"/><circle cx="${G[0]}" cy="${G[1]}" r="9" fill="${ROT}"/>`;
    s += text(x0 - (pr == null ? 10 : 26), G[1], 'GP', 20, ROT, 'text-anchor="end" ' + fett) + mitte(G[0], y0 + 26, 'GM', 20, ROT, fett);
    let teile;
    if (pr != null) { /* 🎚 Preislinie mit Griff an der Preisachse: Angebots- und Nachfragemenge bei diesem Preis, Überhang als Strecke */
      const yp = y0 - 40 - 3.6 * pr, xN = x0 + 30 + 400 * (1 - pr / 100), xA = x0 + 30 + 4 * pr;
      s += `<line x1="${x0}" y1="${f(yp)}" x2="${x0 + xw}" y2="${f(yp)}" stroke="${LILA}" stroke-width="3"/>`;
      if (pr === 50) s += text(G[0] + 140, yp - 22, 'Gleichgewicht', 20, ROT, fett) + text(G[0] + 140, yp + 22, 'Angebot = Nachfrage', 17, ROT);
      else {
        const senk = (x, col) => `<line x1="${f(x)}" y1="${f(yp)}" x2="${f(x)}" y2="${y0}" stroke="${col}" stroke-width="2.5" stroke-dasharray="6 5"/><circle cx="${f(x)}" cy="${f(yp)}" r="8" fill="${col}"/>`;
        s += senk(xN, BLAU) + senk(xA, ORANGE);
        s += mitte(xN, y0 + (xN < xA ? 52 : 76), 'Nachfragemenge', 17, BLAU, fett) + mitte(xA, y0 + (xN < xA ? 76 : 52), 'Angebotsmenge', 17, ORANGE, fett);
        const ueber = pr > 50, xl = Math.min(xN, xA), xr = Math.max(xN, xA), col = ueber ? ORANGE : BLAU, oben = ueber || yp + 64 > y0, yt = oben ? yp - 22 : yp + 24;
        s += `<line x1="${f(xl)}" y1="${f(yp)}" x2="${f(xr)}" y2="${f(yp)}" stroke="${col}" stroke-width="9" stroke-opacity=".55" stroke-linecap="round"/>`;
        s += `<path d="M ${f(xl)} ${f(yt - 8)} L ${f(xl)} ${f(yt + 8)} M ${f(xr)} ${f(yt - 8)} L ${f(xr)} ${f(yt + 8)} M ${f(xl)} ${f(yt)} L ${f(xr)} ${f(yt)}" stroke="${col}" stroke-width="2.5" fill="none"/>`;
        s += mitte((xl + xr) / 2, oben ? yt - 22 : yt + 22, ueber ? 'Angebotsüberhang' : 'Nachfrageüberhang', 20, col, fett);
      }
      s += `<circle cx="${x0}" cy="${f(yp)}" r="22" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="${x0}" cy="${f(yp)}" r="20" fill="${LILA}" stroke="#ffffff" stroke-width="3"/>` +
        `<path d="M ${x0} ${f(yp - 11)} L ${x0} ${f(yp + 11)} M ${x0 - 5} ${f(yp - 5)} L ${x0} ${f(yp - 11)} L ${x0 + 5} ${f(yp - 5)} M ${x0 - 5} ${f(yp + 5)} L ${x0} ${f(yp + 11)} L ${x0 + 5} ${f(yp + 5)}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      teile = [{ id: 'preis', x: x0 - 22, y: yp - 22, w: 44, h: 44, zieh: true }];
    }
    if (d.beschriftung && pr == null) { s += mitte(G[0], G[1] - 120, 'Angebotsüberhang', 18, GRAU, 'font-style="italic"') + mitte(G[0], G[1] - 98, '(Preis zu hoch)', 16, GRAU);
      s += mitte(G[0], G[1] + 110, 'Nachfrageüberhang', 18, GRAU, 'font-style="italic"') + mitte(G[0], G[1] + 132, '(Preis zu niedrig)', 16, GRAU); }
    const L = ['Je höher der Preis, desto weniger wird nachgefragt.', 'Je höher der Preis, desto mehr wird angeboten.', 'Im Schnittpunkt treffen sich Angebot und Nachfrage:',
      'GP = Gleichgewichtspreis', 'GM = Gleichgewichtsmenge', 'Hier wird am meisten verkauft – der Markt ist „geräumt“.'];
    let yL = 110; L.forEach((z, i) => { const rot = i >= 3 && i <= 4; s += zeilenText(660, yL, z, 30, 19, rot ? ROT : P.ink, 25, rot ? fett : ''); yL += umbruch(z, 30).length * 25 + (i === 2 || i === 4 ? 26 : 12); });
    const t = tafel('Preisbildung am Markt', W, H, s, P);
    if (teile) t.teile = teile;
    return t;
  },
  /* Preislinie senkrecht ziehen: 5er-Schritte von 0 bis 100 */
  ziehen: (d, id, sx, sy) => {
    if (id !== 'preis') return null;
    const p = T.clamp(Math.round((MK_Y0 - 40 - sy) / 3.6 / 5) * 5, 0, 100);
    return p === mkPreis(d) ? null : { ...d, preis: p };
  } };
B.wi_markt.schnell = [{ l: '🏷 Überhänge ein/aus', f: dd => ({ d: { ...dd, beschriftung: !dd.beschriftung } }) },
  { l: '🎚 Preislinie ein/aus', f: dd => ({ d: { ...dd, preis: mkPreis(dd) == null ? 75 : '' } }) }];

// ---------- Haushaltsplan ----------
B.wi_haushalt = { name: 'Haushaltsplan (Einnahmen / Ausgaben)', gruppe: 'Gesellschaft', def: { titel: 'Mein Taschengeld im Monat', zeilen: 6 },
  felder: [{ k: 'titel', l: 'Überschrift', typ: 'text' }, { k: 'zeilen', l: 'Zeilen je Seite', typ: 'zahl', min: 3, max: 12 }],
  gen: (d, P) => {
    const n = Math.round(T.clamp(+d.zeilen || 6, 3, 12)), W = 1000, zh = 46, y0 = 90, H = y0 + (n + 3) * zh + 120; let s = '';
    for (const [x, t, col] of [[30, 'Einnahmen', GRUEN], [515, 'Ausgaben', ROT]]) {
      s += box(x, y0, 455, (n + 2) * zh, col, 'none', 12) + `<rect x="${x}" y="${y0}" width="455" height="${zh}" rx="12" fill="${col}" opacity=".15"/>` + text(x + 16, y0 + zh / 2, t, 22, col, fett) + text(x + 440, y0 + zh / 2, '€', 22, col, 'text-anchor="end" ' + fett);
      for (let i = 1; i <= n + 1; i++) s += `<line x1="${x}" y1="${y0 + i * zh}" x2="${x + 455}" y2="${y0 + i * zh}" stroke="${GRAU}" stroke-width="${i === n + 1 ? 2.5 : 1}"/>`;
      s += `<line x1="${x + 340}" y1="${y0}" x2="${x + 340}" y2="${y0 + (n + 2) * zh}" stroke="${GRAU}" stroke-width="1.5"/>` + text(x + 16, y0 + (n + 1.5) * zh, 'Summe', 21, col, fett);
    }
    const yS = y0 + (n + 2) * zh + 30;
    s += box(30, yS, 940, 64, BLAU, '#e3f2fd', 12) + text(50, yS + 32, 'Einnahmen − Ausgaben =', 22, '#1b1f2a', fett) + `<line x1="360" y1="${yS + 44}" x2="560" y2="${yS + 44}" stroke="${GRAU}" stroke-width="1.5" stroke-dasharray="6 5"/>` + text(575, yS + 32, '€   (übrig zum Sparen?)', 20, '#1b1f2a');
    return tafel(d.titel || 'Haushaltsplan', W, H, s, P);
  } };
B.wi_haushalt.schnell = [{ l: '＋ Zeile', f: dd => ({ d: { ...dd, zeilen: Math.min(12, (+dd.zeilen || 6) + 1) } }) }, { l: '− Zeile', f: dd => ({ d: { ...dd, zeilen: Math.max(3, (+dd.zeilen || 6) - 1) } }) }];
})();
