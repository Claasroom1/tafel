// Tafel-App – Karten aus Natural Earth (gemeinfrei, naturalearthdata.com): politisch, physisch, stumm
// Daten liegen in app/karten/*.js und werden erst bei Bedarf geladen.
'use strict';
(function () {
const { doc, f } = T._svg;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
T.KARTEN_DATEN = T.KARTEN_DATEN || {}; T.KARTEN_RELIEF = T.KARTEN_RELIEF || {};

// Gebiete: Ausschnitt [lon0, lat0, lon1, lat1], Bezugsbreite, Breite in px (wie beim Zuschnitt des Reliefs)
const G = {
  welt: { n: 'Welt', b: [-180, -60, 180, 84], z: 0, W: 2400, d: 'welt', rel: 'welt' },
  eu: { n: 'Europa', b: [-25, 34, 45, 72], z: 52, W: 1600, d: 'welt', rel: 'eu', k: 'Europe' },
  af: { n: 'Afrika', b: [-20, -36, 55, 39], z: 0, W: 1400, d: 'welt', rel: 'af', k: 'Africa' },
  as: { n: 'Asien', b: [25, -12, 150, 78], z: 40, W: 1800, d: 'welt', rel: 'as', k: 'Asia' },
  na: { n: 'Nordamerika', b: [-170, 7, -50, 84], z: 45, W: 1600, d: 'welt', rel: 'na', k: 'North America' },
  sa: { n: 'Südamerika', b: [-92, -57, -32, 14], z: -20, W: 1200, d: 'welt', rel: 'sa', k: 'South America' },
  oz: { n: 'Australien & Ozeanien', b: [105, -50, 180, 0], z: -25, W: 1500, d: 'welt', rel: 'oz', k: 'Oceania' },
  de: { n: 'Deutschland', b: [5.3, 47.0, 15.5, 55.2], z: 51, W: 900, d: 'de', rel: 'de' }
};
const LAENDER = [['DE-SH', 'Schleswig-Holstein'], ['DE-HH', 'Hamburg'], ['DE-NI', 'Niedersachsen'], ['DE-HB', 'Bremen'], ['DE-MV', 'Mecklenburg-Vorpommern'], ['DE-BB', 'Brandenburg'],
  ['DE-BE', 'Berlin'], ['DE-ST', 'Sachsen-Anhalt'], ['DE-SN', 'Sachsen'], ['DE-TH', 'Thüringen'], ['DE-HE', 'Hessen'], ['DE-NW', 'Nordrhein-Westfalen'], ['DE-RP', 'Rheinland-Pfalz'],
  ['DE-SL', 'Saarland'], ['DE-BW', 'Baden-Württemberg'], ['DE-BY', 'Bayern']];
for (const [id, n] of LAENDER) G[id] = { n, d: 'de', rel: 'de', land: id }; // Ausschnitt wird aus dem Umriss berechnet
T.KARTEN_GEBIETE = G;
const LFARBE = { 'DE-SH': 0, 'DE-HH': 1, 'DE-NI': 2, 'DE-HB': 3, 'DE-MV': 3, 'DE-BB': 1, 'DE-BE': 0, 'DE-ST': 4, 'DE-SN': 0, 'DE-TH': 5, 'DE-HE': 3, 'DE-NW': 1, 'DE-RP': 4, 'DE-SL': 2, 'DE-BW': 0, 'DE-BY': 1 };
const PASTELL = ['#f6d8a8', '#cde8b5', '#f7c6c7', '#c9d9f2', '#f3e7a1', '#d9c9ef', '#bfe3df'];

// Deutsche Namen für Städte, die in den Daten englisch heißen
const DT = { Munich: 'München', Cologne: 'Köln', Nuremberg: 'Nürnberg', Hanover: 'Hannover', Brunswick: 'Braunschweig', Vienna: 'Wien', Prague: 'Prag', Warsaw: 'Warschau', Rome: 'Rom',
  Lisbon: 'Lissabon', Brussels: 'Brüssel', Copenhagen: 'Kopenhagen', Moscow: 'Moskau', Kiev: 'Kyjiw', Kyiv: 'Kyjiw', Athens: 'Athen', Bucharest: 'Bukarest', Belgrade: 'Belgrad',
  Luxembourg: 'Luxemburg', Nicosia: 'Nikosia', Reykjavik: 'Reykjavík', Chisinau: 'Chișinău', Beijing: 'Peking', Tokyo: 'Tokio', 'New Delhi': 'Neu-Delhi', Cairo: 'Kairo',
  'Mexico City': 'Mexiko-Stadt', 'Washington, D.C.': 'Washington', Algiers: 'Algier', Riyadh: 'Riad', Tehran: 'Teheran', Baghdad: 'Bagdad', Damascus: 'Damaskus', Pyongyang: 'Pjöngjang',
  Brasilia: 'Brasília', Bogota: 'Bogotá', Havana: 'Havanna', 'Addis Ababa': 'Addis Abeba', Khartoum: 'Khartum', Tbilisi: 'Tiflis', Yerevan: 'Jerewan', Tashkent: 'Taschkent',
  Ulaanbaatar: 'Ulan-Bator', 'Cape Town': 'Kapstadt', Muscat: 'Maskat', 'Hong Kong': 'Hongkong', Singapore: 'Singapur', Bern: 'Bern', Tallinn: 'Tallinn', 'Kuwait City': 'Kuwait',
  Sofia: 'Sofia', Vilnius: 'Vilnius', Minsk: 'Minsk', Skopje: 'Skopje', Tirana: 'Tirana', Sarajevo: 'Sarajevo', Podgorica: 'Podgorica', Ljubljana: 'Ljubljana', Zagreb: 'Zagreb',
  Bratislava: 'Bratislava', Budapest: 'Budapest', Belgrad: 'Belgrad', Dublin: 'Dublin', London: 'London', Paris: 'Paris', Madrid: 'Madrid', Amsterdam: 'Amsterdam', Oslo: 'Oslo',
  Stockholm: 'Stockholm', Helsinki: 'Helsinki', Riga: 'Riga', Ankara: 'Ankara', Valletta: 'Valletta', 'Vatican City': 'Vatikanstadt', 'San Marino': 'San Marino', Andorra: 'Andorra la Vella',
  Monaco: 'Monaco', Vaduz: 'Vaduz', Pristina: 'Priština', Jerusalem: 'Jerusalem', Beirut: 'Beirut', Amman: 'Amman', Kabul: 'Kabul', 'Kuala Lumpur': 'Kuala Lumpur' };
const dt = n => DT[n] || n;
// Landschaften und Gipfel in Deutschland (eigene Liste, ungefähre Lage)
const LANDSCHAFT_DE = [['Norddeutsches Tiefland', 10.2, 52.9, 1], ['Lüneburger Heide', 10.0, 53.05], ['Harz', 10.65, 51.75], ['Thüringer Wald', 10.75, 50.62], ['Erzgebirge', 13.0, 50.55],
  ['Schwarzwald', 8.15, 48.15], ['Schwäbische Alb', 9.45, 48.4], ['Bayerischer Wald', 13.25, 48.95], ['Alpen', 11.2, 47.5, 1], ['Alpenvorland', 11.4, 47.95], ['Eifel', 6.75, 50.3],
  ['Hunsrück', 7.2, 49.85], ['Taunus', 8.35, 50.25], ['Westerwald', 7.9, 50.6], ['Sauerland', 8.1, 51.2], ['Rhön', 10.0, 50.45], ['Vogelsberg', 9.2, 50.52], ['Spessart', 9.45, 50.0],
  ['Odenwald', 9.0, 49.6], ['Fichtelgebirge', 11.9, 50.05], ['Fränkische Alb', 11.25, 49.35], ['Oberrheinisches Tiefland', 8.25, 49.05], ['Mecklenburgische Seenplatte', 12.8, 53.4],
  ['Sächsische Schweiz', 14.1, 50.9], ['Weserbergland', 9.4, 52.0], ['Teutoburger Wald', 8.6, 52.05], ['Pfälzerwald', 7.85, 49.3], ['Bayerisches Alpenvorland', 0, 0, 2]].filter(x => x[3] !== 2);
const GIPFEL_DE = [['Zugspitze', 10.985, 47.421, 2962], ['Feldberg', 8.004, 47.874, 1493], ['Großer Arber', 13.135, 49.113, 1456], ['Fichtelberg', 12.954, 50.429, 1215], ['Brocken', 10.617, 51.8, 1141], ['Wasserkuppe', 9.937, 50.498, 950]];
const MEERE = {
  de: [['Nordsee', 7.0, 54.6], ['Ostsee', 12.6, 54.75]],
  eu: [['Nordsee', 3.5, 56.0], ['Ostsee', 19.0, 56.0], ['Mittelmeer', 18.0, 35.3], ['Atlantischer Ozean', -15, 46], ['Schwarzes Meer', 34.0, 43.3], ['Europäisches Nordmeer', 2, 67], ['Barentssee', 38, 71]],
  welt: [['Pazifischer Ozean', -145, 5], ['Pazifischer Ozean', 165, 15], ['Atlantischer Ozean', -35, 20], ['Indischer Ozean', 78, -22], ['Nordpolarmeer', 20, 80], ['Südlicher Ozean', -100, -55]],
  af: [['Atlantischer Ozean', -12, 0], ['Indischer Ozean', 62, -15], ['Mittelmeer', 18, 35.5]], as: [['Indischer Ozean', 75, -5], ['Pazifischer Ozean', 145, 25], ['Nordpolarmeer', 100, 77]],
  na: [['Pazifischer Ozean', -140, 30], ['Atlantischer Ozean', -55, 32], ['Golf von Mexiko', -90, 25]], sa: [['Pazifischer Ozean', -85, -25], ['Atlantischer Ozean', -40, -30]],
  oz: [['Pazifischer Ozean', 172, -20], ['Indischer Ozean', 108, -32], ['Tasmansee', 160, -38]]
};
const KONTINENTE = [['Nordamerika', -100, 45], ['Südamerika', -58, -12], ['Europa', 15, 52], ['Afrika', 20, 5], ['Asien', 90, 50], ['Australien', 134, -25]];

// ---------- Laden ----------
const laden = {};
const skript = src => laden[src] || (laden[src] = new Promise((ok, fehler) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fehler; document.head.append(s); }));
T.ladeKarte = async gebiet => {
  const g = G[gebiet] || G.de; await skript('app/karten/' + g.d + '.js');
  if (g.rel) await skript('app/karten/relief-' + g.rel + '.js').catch(() => {});
  dekodiere(T.KARTEN_DATEN[g.d]);
};
function dekodiere(D) {
  if (!D || D._ok) return; const q = D.q;
  const ring = a => { const p = []; let x = 0, y = 0; for (let i = 0; i < a.length; i += 2) { x += a[i]; y += a[i + 1]; p.push([x / q, y / q]); } return p; };
  const bb = ps => { let x0 = 999, y0 = 999, x1 = -999, y1 = -999; for (const r of ps) for (const [x, y] of r) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
  for (const L of ['laender', 'nachbarn', 'seen']) for (const o of D[L] || []) { o.r = o.r.map(ring); o.bb = bb(o.r); }
  for (const o of D.fluesse || []) { o.l = o.l.map(ring); o.bb = bb(o.l); }
  D._ok = true;
}
// nach dem Laden alle Karten neu zeichnen (neues d-Objekt = neues Bild)
T.kartenAuffrischen = () => { for (const p of (T.S.board ? T.S.board.pages : [])) for (const it of p.items) if (it.k === 'karte') it.d = { ...it.d }; T.render(); };

// ---------- Zeichnen ----------
function rahmen(g, D) {
  if (!g.land) return { b: g.b, z: g.z, W: g.W };
  const L = (D.laender || []).find(x => x.i === g.land); if (!L) return { b: G.de.b, z: 51, W: 900 };
  const [x0, y0, x1, y1] = L.bb, mx = Math.max(0.25, (x1 - x0) * 0.12), my = Math.max(0.18, (y1 - y0) * 0.12);
  return { b: [x0 - mx, y0 - my, x1 + mx, y1 + my], z: (y0 + y1) / 2, W: 1100 };
}
T.karte2SVG = (d, P) => {
  const g = G[d.gebiet] || G.de, D = T.KARTEN_DATEN[g.d];
  if (!D || !D._ok) { T.ladeKarte(d.gebiet).then(T.kartenAuffrischen).catch(() => T.toast('Kartendaten konnten nicht geladen werden.')); return { svg: doc(800, 500, `<rect width="800" height="500" fill="#eef3f8"/><text x="400" y="250" font-size="28" text-anchor="middle" fill="#557">Karte „${esc(g.n)}“ wird geladen …</text>`), w: 800, h: 500 }; }
  const R = rahmen(g, D), [lo0, la0, lo1, la1] = R.b, cs = Math.cos(R.z * Math.PI / 180), s = R.W / ((lo1 - lo0) * cs), W = R.W, H = (la1 - la0) * s;
  const X = lo => (lo - lo0) * cs * s, Y = la => (la1 - la) * s;
  const imBild = bb => !(bb[2] < lo0 || bb[0] > lo1 || bb[3] < la0 || bb[1] > la1);
  const pfad = (ringe, zu) => ringe.map(r => 'M' + r.map(([x, y]) => f(X(x)) + ' ' + f(Y(y))).join('L') + (zu ? 'Z' : '')).join('');
  const dunkel = P.ink !== '#1a1a1a', stil = d.stil || 'politisch', massstab = W / ((lo1 - lo0) * cs); // px pro Grad
  const MEER = stil === 'physisch' ? '#a9cfe6' : dunkel ? '#1d3a52' : '#d4e8f6', SEE = stil === 'physisch' ? '#8fc0e0' : MEER;
  const FLUSS = dunkel ? '#7cc4ff' : '#2f7fd0', GRENZE = stil === 'physisch' ? 'rgba(70,40,40,.75)' : dunkel ? '#c9d2dc' : '#6b6b6b';
  let o = `<defs><clipPath id="kr"><rect width="${f(W)}" height="${f(H)}"/></clipPath></defs><g clip-path="url(#kr)">`;
  // Hintergrund / Relief
  const rel = T.KARTEN_RELIEF[g.rel];
  if (stil === 'physisch' && rel) {
    const gb = G[g.rel].b, gcs = Math.cos(G[g.rel].z * Math.PI / 180); // Reliefbild auf den Ausschnitt legen
    const rx = (gb[0] - lo0) * cs * s, ry = (la1 - gb[3]) * s, rw = (gb[2] - gb[0]) * cs * s, rh = (gb[3] - gb[1]) * s; void gcs;
    o += `<rect width="${f(W)}" height="${f(H)}" fill="${MEER}"/><image href="${rel}" x="${f(rx)}" y="${f(ry)}" width="${f(rw)}" height="${f(rh)}" preserveAspectRatio="none"/>`;
  } else o += `<rect width="${f(W)}" height="${f(H)}" fill="${MEER}"/>`;
  const fuell = (farbe, dimm) => stil === 'physisch' ? 'none' : stil === 'stumm' ? (dunkel ? 'rgba(255,255,255,.12)' : (dimm ? '#ebe7dc' : '#f7f3e8')) : (dimm ? (dunkel ? 'rgba(255,255,255,.08)' : '#e9e9e9') : farbe);
  const sw = Math.max(0.6, Math.min(1.6, massstab / 60));
  if (g.d === 'welt') {
    for (const L of D.laender) { if (!imBild(L.bb)) continue; const dimm = g.k && L.k !== g.k && !(g.k === 'Oceania' && L.k === 'Oceania');
      o += `<path d="${pfad(L.r, true)}" fill="${fuell(PASTELL[(L.c - 1) % 7], dimm)}" stroke="${GRENZE}" stroke-width="${f(sw)}" stroke-linejoin="round"/>`; }
  } else {
    for (const L of D.nachbarn) if (imBild(L.bb)) o += `<path d="${pfad(L.r, true)}" fill="${fuell('#e9e9e9', true)}" stroke="${GRENZE}" stroke-width="1.2" stroke-linejoin="round"/>`;
    for (const L of D.laender) { const fokus = !g.land || g.land === L.i;
      o += `<path d="${pfad(L.r, true)}" fill="${fuell(PASTELL[LFARBE[L.i] || 0], !fokus)}" stroke="${GRENZE}" stroke-width="${g.land ? 1.6 : 1.1}" stroke-linejoin="round" ${stil === 'physisch' ? 'stroke-dasharray="6 4"' : ''}/>`; }
    if (g.land && stil !== 'politisch') { const L = D.laender.find(x => x.i === g.land); if (L) o += `<path d="${pfad(L.r, true)}" fill="none" stroke="${dunkel ? '#ffd166' : '#c0392b'}" stroke-width="3"/>`; }
  }
  // Seen und Flüsse
  for (const S of D.seen || []) if (imBild(S.bb) && (g.d === 'de' || S.s <= (d.gebiet === 'welt' ? 2 : 4))) o += `<path d="${pfad(S.r, true)}" fill="${SEE}" stroke="${FLUSS}" stroke-width="0.8"/>`;
  if (d.fluesse) {
    const maxS = g.d === 'de' ? (g.land ? 12 : 9) : d.gebiet === 'welt' ? 3 : 5;
    for (const F of D.fluesse || []) if (F.s <= maxS && imBild(F.bb)) o += `<path d="${pfad(F.l, false)}" fill="none" stroke="${FLUSS}" stroke-width="${f(Math.max(0.8, 2.6 - F.s * 0.2))}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  if (d.gradnetz) {
    const st = g.d === 'de' ? 1 : d.gebiet === 'welt' ? 30 : 10; let gr = '';
    for (let lo = Math.ceil(lo0 / st) * st; lo <= lo1; lo += st) gr += `M${f(X(lo))} 0V${f(H)}`;
    for (let la = Math.ceil(la0 / st) * st; la <= la1; la += st) gr += `M0 ${f(Y(la))}H${f(W)}`;
    o += `<path d="${gr}" stroke="${dunkel ? 'rgba(255,255,255,.3)' : 'rgba(40,60,90,.35)'}" stroke-width="1" fill="none"/>`;
    if (d.gebiet === 'welt') for (const [la, c, da] of [[0, '#c0392b', ''], [23.44, '#2f7fd0', '10 6'], [-23.44, '#2f7fd0', '10 6'], [66.56, '#2f7fd0', '4 6'], [-66.56, '#2f7fd0', '4 6']]) o += `<line x1="0" x2="${f(W)}" y1="${f(Y(la))}" y2="${f(Y(la))}" stroke="${c}" stroke-width="2" ${da ? `stroke-dasharray="${da}"` : ''}/>`;
  }
  // Beschriftung
  const halo = dunkel ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.85)';
  const txt = (t, x, y, fs, farbe, extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${f(fs)}" text-anchor="middle" dominant-baseline="central" fill="${farbe}" paint-order="stroke" stroke="${halo}" stroke-width="${f(fs * 0.22)}" ${extra}>${esc(t)}</text>`;
  const fsBasis = g.d === 'de' ? (g.land ? 20 : 15) : d.gebiet === 'welt' ? 13 : 14;
  if (d.landschaften) {
    if (g.d === 'de') {
      for (const [n, x, y, gross] of LANDSCHAFT_DE) if (x >= lo0 && x <= lo1 && y >= la0 && y <= la1) o += txt(n, X(x), Y(y), fsBasis * (gross ? 1.15 : 0.85), dunkel ? '#e8c9a0' : '#7a4a1e', 'font-style="italic"');
      for (const [n, x, y, hm] of GIPFEL_DE) if (x >= lo0 && x <= lo1 && y >= la0 && y <= la1) { const px = X(x), py = Y(y);
        o += `<polygon points="${f(px)},${f(py - 9)} ${f(px - 8)},${f(py + 6)} ${f(px + 8)},${f(py + 6)}" fill="#5a3b1e"/>` + txt(`${n} (${hm} m)`, px, py + 18, fsBasis * 0.72, dunkel ? '#f0d6b8' : '#5a3b1e'); }
    } else for (const Rg of D.regionen || []) {
      if (Rg.s > (d.gebiet === 'welt' ? 1 : d.gebiet === 'eu' ? 4 : 3) || !(Rg.x >= lo0 && Rg.x <= lo1 && Rg.y >= la0 && Rg.y <= la1)) continue;
      if (!/Range|Desert|Plain|Plateau|Basin|Peninsula|Lowland/i.test(Rg.t)) continue;
      o += txt(Rg.n, X(Rg.x), Y(Rg.y), fsBasis * 0.85, dunkel ? '#e8c9a0' : '#7a4a1e', 'font-style="italic"');
    }
  }
  if (d.namen) {
    if (g.d === 'welt') {
      if (d.gebiet === 'welt') for (const [n, x, y] of KONTINENTE) o += txt(n, X(x), Y(y), 30, dunkel ? '#fff' : '#26324a', 'font-weight="700" letter-spacing="2"');
      else for (const L of D.laender) {
        if (!(L.x >= lo0 && L.x <= lo1 && L.y >= la0 && L.y <= la1)) continue;
        const breite = Math.max(...L.r.map(r => { let a = 999, b = -999; for (const [x] of r) { if (x < a) a = x; if (x > b) b = x; } return b - a; })) * cs * s;
        const fs = T.clamp(breite / Math.max(4, L.n.length) * 1.1, 9, fsBasis * 1.3); if (breite < 22) continue;
        o += txt(L.n, X(L.x), Y(L.y), fs, dunkel ? '#fff' : '#26324a', 'font-weight="600"');
      }
    } else {
      for (const L of D.laender) if (!g.land || L.i === g.land || imBild(L.bb)) o += txt(L.n, X(L.x), Y(L.y), (L.i === g.land ? 1.3 : ['DE-BE', 'DE-HH', 'DE-HB', 'DE-SL'].includes(L.i) && !g.land ? 0.7 : 1) * fsBasis, dunkel ? '#fff' : '#26324a', 'font-weight="600"');
      if (!g.land) for (const L of D.nachbarn) if (L.x >= lo0 && L.x <= lo1 && L.y >= la0 && L.y <= la1) o += txt(L.n, X(L.x), Y(L.y), fsBasis * 0.85, dunkel ? '#bbb' : '#777');
    }
    for (const [n, x, y] of (MEERE[g.d === 'de' ? 'de' : d.gebiet] || [])) if (x >= lo0 && x <= lo1 && y >= la0 && y <= la1) o += txt(n, X(x), Y(y), fsBasis * 0.95, dunkel ? '#9cc7ff' : '#1f5f9f', 'font-style="italic"');
  }
  if (d.staedte) {
    const liste = g.d === 'welt' ? (D.staedte || []).filter(c => c.h === 1) : (D.staedte || []).filter(c => g.land ? true : (c.a === 'DEU' ? (c.h >= 1 || c.p >= 500000) : c.h === 2));
    for (const c of liste) {
      if (!(c.x >= lo0 && c.x <= lo1 && c.y >= la0 && c.y <= la1)) continue;
      const px = X(c.x), py = Y(c.y), haupt = g.d === 'welt' ? true : c.h >= 1, r = haupt ? 5 : 3.5, fs = fsBasis * (g.d === 'welt' ? 0.75 : 0.8);
      o += (haupt ? `<rect x="${f(px - r)}" y="${f(py - r)}" width="${f(2 * r)}" height="${f(2 * r)}" fill="#c0392b" stroke="#fff" stroke-width="1.5"/>` : `<circle cx="${f(px)}" cy="${f(py)}" r="${f(r)}" fill="#26324a" stroke="#fff" stroke-width="1.2"/>`)
        + `<text x="${f(px + r + 4)}" y="${f(py)}" font-size="${f(fs)}" dominant-baseline="central" fill="${dunkel ? '#fff' : '#1b1f2a'}" paint-order="stroke" stroke="${halo}" stroke-width="${f(fs * 0.22)}">${esc(dt(c.n))}</text>`;
    }
  }
  o += '</g>' + `<text x="${f(W - 8)}" y="${f(H - 8)}" font-size="11" text-anchor="end" fill="${dunkel ? '#ccc' : '#556'}" opacity=".8">Daten: Natural Earth</text>`;
  return { svg: doc(W, H, o), w: W, h: H };
};

// ---------- Baustein ----------
const GEB_OPTS = [['welt', 'Welt'], ['eu', 'Europa'], ['af', 'Afrika'], ['as', 'Asien'], ['na', 'Nordamerika'], ['sa', 'Südamerika'], ['oz', 'Australien & Ozeanien'], ['de', 'Deutschland']].concat(LAENDER.map(([i, n]) => [i, 'Bundesland: ' + n]));
T.BAUSTEINE.karte = {
  name: 'Karte', gruppe: 'KartenNE', def: { gebiet: 'de', stil: 'politisch', namen: true, staedte: true, fluesse: false, landschaften: false, gradnetz: false },
  felder: [{ k: 'gebiet', l: 'Gebiet', typ: 'auswahl', opts: GEB_OPTS }, { k: 'stil', l: 'Kartenart', typ: 'auswahl', opts: [['politisch', 'politisch (Staaten/Länder farbig)'], ['physisch', 'physisch (Relief, Gebirge, Flüsse)'], ['stumm', 'stumm (nur Umrisse)']] },
    { k: 'namen', l: 'Namen (Staaten/Länder, Meere)', typ: 'check' }, { k: 'staedte', l: 'Hauptstädte / Städte', typ: 'check' }, { k: 'fluesse', l: 'Flüsse', typ: 'check' },
    { k: 'landschaften', l: 'Landschaften und Gebirge', typ: 'check' }, { k: 'gradnetz', l: 'Gradnetz', typ: 'check' }],
  gen: (d, P) => T.karte2SVG(d, P)
};
const q = (l, fn) => ({ l, f: d => ({ d: fn({ ...d }) }) });
T.BAUSTEINE.karte.schnell = [
  q('🗺 Politisch', d => { d.stil = 'politisch'; return d; }), q('⛰ Physisch', d => { d.stil = 'physisch'; return d; }), q('◻ Stumm', d => { d.stil = 'stumm'; return d; }),
  q('Namen', d => { d.namen = !d.namen; return d; }), q('Städte', d => { d.staedte = !d.staedte; return d; }), q('Flüsse', d => { d.fluesse = !d.fluesse; return d; }),
  q('Landschaften', d => { d.landschaften = !d.landschaften; return d; }), q('Gradnetz', d => { d.gradnetz = !d.gradnetz; return d; })];
T.KARTEN_STIL_DEF = {
  politisch: { stil: 'politisch', namen: true, staedte: true, fluesse: false, landschaften: false },
  physisch: { stil: 'physisch', namen: false, staedte: false, fluesse: true, landschaften: true },
  stumm: { stil: 'stumm', namen: false, staedte: false, fluesse: false, landschaften: false }
};
T.KARTEN_LISTE = [['welt', '🌍'], ['eu', '🇪🇺'], ['af', '🌍'], ['as', '🌏'], ['na', '🌎'], ['sa', '🌎'], ['oz', '🌏'], ['de', '🇩🇪']].concat(LAENDER.map(([i]) => [i, '📍']));
// alte, selbst gezeichnete Karten bleiben für vorhandene Tafeln erhalten, erscheinen aber nicht mehr beim Einfügen
for (const k of ['karte_de', 'karte_eu', 'karte_welt']) if (T.BAUSTEINE[k]) T.BAUSTEINE[k].gruppe = 'alt';
})();
