// Tafel-App – 🙈 Erarbeiten: Bildtafeln (Wirtschaft, Klassenleben & Lernen, Präsentieren, Arbeits-/Sozialverhalten, Dreiecke, Geodreieck, Schrägbild)
// mit der Klasse erarbeiten. Kontextmenü „🙈 Erarbeiten“: Alle Texte außer der Überschrift verschwinden (nur eine zarte Linie bleibt – Platz zum Hineinschreiben);
// mit dem Finger antippen deckt ein Feld auf (nochmals = wieder zu), „➡ Nächstes“ deckt der Reihe nach auf, „👁 Alles aufdecken“ zeigt alles.
'use strict';
(function () {
const B = T.BAUSTEINE;
const ZIELE = k => /^(wi_|kl_|de_|en_|ma_|nw_|it_|ge_|re_|me_|be_|mu_notenwerte|mu_takt|mu_instrumente|ku_)/.test(k) || ['dreieckerkl', 'geoerkl', 'schraegerkl'].includes(k);
const attr = (a, n) => { const m = a.match(new RegExp('(?:^|\\s)' + n + '="([^"]*)"')); return m ? m[1] : null; };
const ent = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
/* Texte im SVG finden (der erste ist die Überschrift und bleibt stehen) und ihre ungefähre Fläche schätzen */
function texte(svg) {
  const out = [], re = /<text ([^>]*)>([^<]*)<\/text>/g; let m;
  while ((m = re.exec(svg))) {
    const a = m[1], t = ent(m[2]); if (!t.trim()) continue;
    const x = +attr(a, 'x') || 0, y = +attr(a, 'y') || 0, gr = +attr(a, 'font-size') || 20, anker = attr(a, 'text-anchor') || 'start', fett = /font-weight="(700|bold)"/.test(a);
    const w = Math.max(gr, [...t].length * gr * (fett ? 0.6 : 0.55)), hh = gr * 1.25, x0 = anker === 'middle' ? x - w / 2 : anker === 'end' ? x - w : x;
    const tr = attr(a, 'transform'), quer = !!(tr && /rotate\(\s*-?90/.test(tr));
    out.push({ start: m.index, ende: m.index + m[0].length, x0, y0: y - hh / 2, w, h: hh, tr, quer, x, y, gr });
  }
  return out;
}
function verdeckt(g, d) {
  const T0 = texte(g.svg); if (T0.length < 2) return g;
  const offen = new Set(d.offen || []), teile = []; let svg = '', pos = 0;
  T0.forEach((t, i) => {
    if (i === 0) return; /* Überschrift */
    const id = 't' + i; if (!offen.has(i)) {
      svg += g.svg.slice(pos, t.start); pos = t.ende;
      /* frei zum Hineinschreiben: nur eine zarte gepunktete Linie zeigt, wo der Text hingehört */
      const trans = t.tr ? ` transform="${t.tr}"` : '';
      svg += `<line x1="${t.x0}" y1="${t.y0 + t.h - 2}" x2="${t.x0 + t.w}" y2="${t.y0 + t.h - 2}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 5" opacity=".7"${trans}/>`;
    }
    /* Tippfläche (bei senkrechtem Text um 90° gedreht um x/y) */
    teile.push(t.quer ? { id, x: t.x - t.h / 2, y: t.y - t.w / 2, w: t.h, h: t.w } : { id, x: t.x0 - 4, y: t.y0, w: t.w + 8, h: t.h });
  });
  svg += g.svg.slice(pos);
  return { ...g, svg, teile: (g.teile || []).concat(teile) };
}
const alleNr = (k, d) => { const g = B[k].__gen(d, T.palette ? T.palette(false) : {}); return texte(g.svg).map((_, i) => i).slice(1); };
function einrichten(k) {
  const Bk = B[k]; if (!Bk || Bk.__gen) return;
  Bk.__gen = Bk.gen;
  Bk.gen = (d, P) => { const g = Bk.__gen(d, P); return d.erarbeiten ? verdeckt(g, d) : g; };
  const tipAlt = Bk.tippen;
  Bk.tippen = (o, id) => {
    if (!o.d.erarbeiten || !/^t\d+$/.test(id)) return tipAlt && tipAlt(o, id);
    const i = +id.slice(1); T.bausteinAendern(o, { f: dd => { const s = new Set(dd.offen || []); s.has(i) ? s.delete(i) : s.add(i); return { d: { ...dd, offen: [...s] } }; } });
  };
  const sAlt = Bk.schnell;
  Bk.schnell = d => {
    const eigen = typeof sAlt === 'function' ? sAlt(d) : (sAlt || []);
    const knoepfe = d.erarbeiten
      ? [{ l: '➡ Nächstes aufdecken', f: dd => { const alle = alleNr(k, { ...dd, erarbeiten: false }), s = new Set(dd.offen || []), n = alle.find(i => !s.has(i)); if (n == null) { T.toast && T.toast('Alles ist aufgedeckt.', 1500); return { d: dd }; } s.add(n); return { d: { ...dd, offen: [...s] } }; } },
         { l: '👁 Alles aufdecken', f: dd => ({ d: { ...dd, erarbeiten: false, offen: [] } }) },
         { l: '🙈 Alles wieder verdecken', f: dd => ({ d: { ...dd, offen: [] } }) }]
      : [{ l: '🙈 Erarbeiten (alles verdecken)', f: dd => ({ d: { ...dd, erarbeiten: true, offen: [] } }) }];
    return knoepfe.concat(eigen);
  };
}
Object.keys(B).filter(ZIELE).forEach(einrichten);
T.erarbeitenEinrichten = einrichten; /* für später hinzukommende Vorlagen */
})();
