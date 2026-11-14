// Tafel-App – 💶 Geld: Euro-Münzen (1 ct bis 2 €) und Scheine (5 € bis 100 €) als Spielgeld zum Einfügen.
// Selbst gezeichnet und stark vereinfacht (keine Nachbildung echter Münz- oder Scheinmotive), Aufschrift „SPIELGELD“.
// Größenverhältnisse wie beim echten Geld (Durchmesser bzw. Maße in mm), auf der Tafel einheitlich vergrößert.
'use strict';
(function () {
const h = T.h;
const MUENZEN = [ // [Wert, Beschriftung, Durchmesser mm, Metall]
  [0.01, '1', 16.25, 'kupfer'], [0.02, '2', 18.75, 'kupfer'], [0.05, '5', 21.25, 'kupfer'],
  [0.10, '10', 19.75, 'gold'], [0.20, '20', 22.25, 'gold'], [0.50, '50', 24.25, 'gold'],
  [1, '1', 23.25, 'bi1'], [2, '2', 25.75, 'bi2']];
const SCHEINE = [ // [Wert, Breite mm, Höhe mm, Farbe hell, Farbe kräftig]
  [5, 120, 62, '#d9dcd6', '#7d8a78'], [10, 127, 67, '#f6c9c0', '#c0503f'], [20, 133, 72, '#c9d9f2', '#3f67b5'],
  [50, 140, 77, '#f9d8b4', '#d9822b'], [100, 147, 77, '#cfe8c8', '#3f8f4a']];
const METALL = { kupfer: ['#f3b38a', '#b8673a', '#7a3d1d'], gold: ['#fbe7a1', '#d4a72c', '#8a6a12'], silber: ['#f4f5f7', '#b9bec7', '#6b717c'] };
const sterne = (cx, cy, r, s, farbe) => Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6 - Math.PI / 2, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
  const p = Array.from({ length: 10 }, (_, k) => { const rr = k % 2 ? s * 0.42 : s, b = -Math.PI / 2 + k * Math.PI / 5; return (x + rr * Math.cos(b)).toFixed(1) + ',' + (y + rr * Math.sin(b)).toFixed(1); }).join(' ');
  return `<polygon points="${p}" fill="${farbe}"/>`; }).join('');
const verlauf = (id, [hell, mitte, dunkel]) => `<radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${hell}"/><stop offset=".6" stop-color="${mitte}"/><stop offset="1" stop-color="${dunkel}"/></radialGradient>`;
function muenzeSVG([wert, txt, mm, art]) {
  const S = 200, c = S / 2, r = 96, euro = wert >= 1;
  const aussen = art === 'bi1' ? METALL.gold : art === 'bi2' ? METALL.silber : METALL[art], innen = art === 'bi1' ? METALL.silber : art === 'bi2' ? METALL.gold : null;
  const dunkel = (innen || aussen)[2];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}"><defs>${verlauf('a', aussen)}${innen ? verlauf('i', innen) : ''}</defs>
<circle cx="${c}" cy="${c}" r="${r}" fill="url(#a)" stroke="${aussen[2]}" stroke-width="3"/>
<circle cx="${c}" cy="${c}" r="${r - 8}" fill="none" stroke="${aussen[2]}" stroke-opacity=".45" stroke-width="2"/>
${innen ? `<circle cx="${c}" cy="${c}" r="${r * 0.66}" fill="url(#i)" stroke="${innen[2]}" stroke-width="2"/>` : ''}
${sterne(c, c, innen ? r * 0.83 : r * 0.8, 6, aussen[2])}
<text x="${c}" y="${c + (euro ? 8 : 4)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="${txt.length > 1 ? 62 : 78}" fill="${dunkel}">${txt}</text>
<text x="${c}" y="${c + (euro ? 40 : 38)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="${euro ? 20 : 16}" letter-spacing="1" fill="${dunkel}">${euro ? 'EURO' : 'EURO CENT'}</text>
</svg>`;
}
function scheinSVG([wert, bmm, hmm, hell, kraeftig]) {
  const W = bmm * 4, H = hmm * 4, z = String(wert);
  const bogen = Array.from({ length: 4 }, (_, i) => { const x = W * 0.42 + i * W * 0.07, b = W * 0.06, y0 = H * 0.78, y1 = H * 0.3; return `<path d="M${x} ${y0}V${y1 + b / 2}a${b / 2} ${b / 2} 0 0 1 ${b} 0V${y0}" fill="none" stroke="${kraeftig}" stroke-opacity=".35" stroke-width="5"/>`; }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${hell}"/><stop offset="1" stop-color="${kraeftig}" stop-opacity=".55"/></linearGradient></defs>
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="url(#g)" stroke="${kraeftig}" stroke-width="4"/>
<rect x="14" y="14" width="${W * 0.28}" height="${H - 28}" rx="8" fill="#fff" fill-opacity=".45"/>
${sterne(W * 0.14 + 14, H * 0.42, H * 0.17, 6, kraeftig)}
${bogen}
<text x="${W - 22}" y="${H * 0.3}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-weight="900" font-size="${H * 0.26}" fill="${kraeftig}">${z}</text>
<text x="${W * 0.14 + 14}" y="${H * 0.82}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="900" font-size="${H * 0.18}" fill="${kraeftig}">${z}</text>
<text x="${W - 22}" y="${H * 0.5}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="${H * 0.1}" letter-spacing="3" fill="${kraeftig}">EURO</text>
<text x="${W - 22}" y="${H - 22}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="${H * 0.065}" letter-spacing="4" fill="${kraeftig}" fill-opacity=".7">SPIELGELD</text>
</svg>`;
}
const url = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
const FAKTOR = 2.2; /* auf der Tafel: echte Größe × 2,2 (gut sichtbar, Verhältnisse stimmen) */
let versatz = 0;
function setze(src, wmm, hmm) {
  const w = wmm / 10 * T.CM * FAKTOR, hh = hmm / 10 * T.CM * FAKTOR, [cx, cy] = T.viewCenter(), d = (versatz++ % 6) * 18; /* mehrere nacheinander: leicht versetzt */
  const o = { t: 'o', id: T.uid(), k: 'bild', d: { src }, x: cx - w / 2 + d, y: cy - hh / 2 + d, w, h: hh, r: 0 };
  T.snap(); T.addItem(o); T.render(); if (T.nachEinfuegen) T.nachEinfuegen([o.id]);
}
const name = w => w < 1 ? Math.round(w * 100) + ' ct' : w + ' €';
T.geldPanel = () => {
  const kachel = (svg, n, fn) => { const b = h('button', { class: 'tile geld', title: n + ' einfügen', onclick: fn }); b.innerHTML = svg; b.append(h('span', {}, n)); return b; };
  return [h('h3', {}, 'Münzen'), h('div', { class: 'tiles geld-tiles' }, ...MUENZEN.map(m => kachel(muenzeSVG(m), name(m[0]), () => setze(url(muenzeSVG(m)), m[2], m[2])))),
    h('h3', {}, 'Scheine'), h('div', { class: 'tiles geld-tiles scheine' }, ...SCHEINE.map(s => kachel(scheinSVG(s), name(s[0]), () => setze(url(scheinSVG(s)), s[1], s[2])))),
    h('p', { class: 'hint' }, 'Spielgeld, selbst gezeichnet – die Größen passen zueinander wie beim echten Geld. Antippen legt ein Stück auf die Tafel, mehrmals antippen = mehrere.')];
};
})();
