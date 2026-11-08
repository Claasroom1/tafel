// Tafel-App – Eingabe der Übungen als Tabelle statt Textformat:
// Kärtchen sortieren (1. Spalte Gruppe, dann Begriffe), Reihenfolge (nummerierte Liste), Zuordnen / Memory (zwei Spalten),
// Multiple Choice (Frage + Antworten mit Haken), Lückentext (Wörter antippen = Lücke), Buchstabensalat (Wortliste).
// Das Textformat bleibt die gemeinsame Grundlage (T.uebungErzeugen) – Einfügen aus Word/Excel (Tab/Zeilen) füllt die Tabelle.
// Dazu: Listen speichern und wiederverwenden (z. B. „Unit 3 – Vokabeln“).
'use strict';
(function () {
const h = T.h;
const zeilen = s => String(s || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean);

// ---------- Text <-> Modell ----------
const LESEN = {
  gruppen: t => zeilen(t).map(l => { const [k, r] = l.split(/:(.*)/s); return [k.trim()].concat((r || '').split(/[,;]/).map(s => s.trim()).filter(Boolean)); }),
  reihe: t => zeilen(t).map(l => [l]),
  salat: t => zeilen(t).map(l => [l]),
  paare: t => zeilen(t).map(l => { const p = l.split(/\s*=\s*/); return [p[0] || '', p.slice(1).join(' = ')]; }),
  memory: t => zeilen(t).map(l => { const p = l.split(/\s*=\s*/); return [p[0] || '', p.slice(1).join(' = ')]; }),
  karten: t => zeilen(t).map(l => { const p = l.split(/\s*=\s*/); return [p[0] || '', p.slice(1).join(' = ')]; })
};
const SCHREIBEN = {
  gruppen: R => R.filter(r => r[0] || r.slice(1).some(Boolean)).map(r => (r[0] || 'Gruppe') + ': ' + r.slice(1).filter(Boolean).join(', ')).join('\n'),
  reihe: R => R.map(r => r[0]).filter(Boolean).join('\n'),
  salat: R => R.map(r => r[0]).filter(Boolean).join('\n'),
  paare: R => R.filter(r => r[0] || r[1]).map(r => r[0] + ' = ' + r[1]).join('\n'),
  memory: R => R.filter(r => r[0] || r[1]).map(r => r[0] + ' = ' + r[1]).join('\n'),
  karten: R => R.filter(r => r[0] || r[1]).map(r => r[0] + ' = ' + r[1]).join('\n')
};
const KOPF = {
  gruppen: ['Gruppe', 'Begriffe – je Feld einer (das nächste Feld erscheint von selbst)'],
  reihe: ['Schritte in der richtigen Reihenfolge (die App mischt)'],
  salat: ['Wörter (die App würfelt die Buchstaben durcheinander)'],
  paare: ['Links', 'Passt zu …'],
  memory: ['Karte A', 'Passendes Gegenstück B'],
  karten: ['Vorderseite', 'Rückseite'],
  kaesten: ['Begriffe – je Begriff ein leerer Kasten (der Wortspeicher wird gemischt)']
};
// Paar-Listen (Vokabeln, Begriff – Erklärung …) lassen sich in andere Übungen umwandeln
T.uebUmwandeln = (vonTyp, text, nachTyp) => {
  const paare = ['paare', 'memory', 'karten'];
  if (paare.includes(vonTyp) && paare.includes(nachTyp)) return text;
  if (paare.includes(vonTyp) && nachTyp === 'salat') return zeilen(text).map(l => l.split(/\s*=\s*/)[0]).filter(w => w && w.length <= 14).join('\n');
  return text;
};

// ---------- Tabellen-Editor ----------
// R: Zeilen (Arrays); breit = Spaltenzahl wächst (Kärtchen sortieren); nr = Zeilennummern
function tabelle(typ, R, neu) {
  const breit = typ === 'gruppen', zwei = typ === 'paare' || typ === 'memory' || typ === 'karten', nr = typ === 'reihe';
  const spalten = breit ? Math.max(3, ...R.map(r => r.length)) + 1 : zwei ? 2 : 1;
  // immer eine leere Zeile am Ende (und bei „sortieren“ eine leere Spalte) – zum Weiterschreiben
  if (!R.length || R[R.length - 1].some(Boolean)) R.push([]);
  const tab = h('table', { class: 'ue-tab' + (breit ? ' breit' : '') });
  const kopf = h('tr', {}, nr ? h('th', { class: 'ue-nr' }, '') : '', h('th', {}, KOPF[typ][0]), ...(breit ? [h('th', { colspan: spalten - 1 }, KOPF[typ][1])] : zwei ? [h('th', {}, KOPF[typ][1])] : []), h('th', { class: 'ue-akt' }, ''));
  tab.append(kopf);
  const felder = [];
  R.forEach((r, zi) => {
    const tr = h('tr', {});
    if (nr) tr.append(h('td', { class: 'ue-nr' }, (zi + 1) + '.'));
    for (let si = 0; si < spalten; si++) {
      const inp = h('input', { type: 'text', class: 'ue-feld' + (breit && si === 0 ? ' ue-kat' : ''), value: r[si] || '', placeholder: zi === R.length - 1 && si === 0 ? (breit ? '＋ neue Gruppe' : '＋ weiter …') : '' });
      inp.addEventListener('input', () => {
        r[si] = inp.value; neu(false);
        // letzte Zeile / letzte Spalte wird beschrieben → Tabelle wächst (ohne den Fokus zu verlieren)
        if ((zi === R.length - 1 && inp.value) || (breit && si === spalten - 1 && inp.value)) {
          const wurzel = inp.closest('.ue-tabbox'), pos = inp.selectionStart; neu(true);
          const f = wurzel && wurzel.querySelector(`[data-z="${zi}"][data-s="${si}"]`); if (f) { f.focus(); f.setSelectionRange(pos, pos); } }
      });
      inp.addEventListener('keydown', e => { // Enter: nächstes Feld der Zeile, am Zeilenende (oder leer) → nächste Zeile
        if (e.key !== 'Enter') return; e.preventDefault();
        const w = inp.closest('.ue-tabbox'); if (!w) return;
        const rechts = (breit || zwei) && inp.value ? w.querySelector(`[data-z="${zi}"][data-s="${si + 1}"]`) : null;
        const nx = rechts || w.querySelector(`[data-z="${zi + 1}"][data-s="0"]`); if (nx) nx.focus();
      });
      inp.addEventListener('paste', e => { // Mehrzeiliges aus Word/Excel: füllt ab hier Zeilen und Spalten
        e.stopPropagation(); // nicht zusätzlich als Text auf die Tafel einfügen
        const t = (e.clipboardData || window.clipboardData).getData('text'); if (!/[\n\t]/.test(t)) return; e.preventDefault();
        const neuR = t.replace(/\r/g, '').split('\n').filter(l => l.trim()).map(l => l.split('\t').map(s => s.trim()));
        neuR.forEach((nz, i) => { const ziel = R[zi + i] || (R[zi + i] = []); nz.forEach((v, j) => { ziel[si + j] = v; }); });
        neu(true);
      });
      inp.dataset.z = zi; inp.dataset.s = si; felder.push(inp);
      tr.append(h('td', {}, inp));
    }
    const leer = !r.some(Boolean);
    tr.append(h('td', { class: 'ue-akt' }, leer ? '' : h('span', { class: 'ue-knoepfe' },
      nr && zi > 0 ? h('button', { title: 'nach oben', onclick: () => { [R[zi - 1], R[zi]] = [R[zi], R[zi - 1]]; neu(true); } }, '▲') : '',
      h('button', { title: 'Zeile löschen', onclick: () => { R.splice(zi, 1); neu(true); } }, '🗑'))));
    tab.append(tr);
  });
  return tab;
}

// ---------- Multiple Choice ----------
function mcEditor(text, setze) {
  const L = zeilen(text), M = { frage: L[0] || '', a: L.slice(1).map(l => ({ t: l.replace(/^\*\s*/, ''), ok: l.startsWith('*') })) };
  const box = h('div', {});
  const raus = () => setze([M.frage].concat(M.a.filter(a => a.t).map(a => (a.ok ? '*' : '') + a.t)).join('\n'));
  const male = fokus => {
    if (!M.a.length || M.a[M.a.length - 1].t) M.a.push({ t: '', ok: false });
    box.innerHTML = '';
    const frage = h('input', { type: 'text', class: 'ue-feld ue-frage', value: M.frage, placeholder: 'Frage eingeben …', oninput: e => { M.frage = e.target.value; raus(); } });
    const tab = h('table', { class: 'ue-tab' }, h('tr', {}, h('th', { class: 'ue-ok' }, 'richtig?'), h('th', {}, 'Antwort'), h('th', { class: 'ue-akt' }, '')));
    M.a.forEach((a, i) => {
      const inp = h('input', { type: 'text', class: 'ue-feld', value: a.t, placeholder: i === M.a.length - 1 ? '＋ weitere Antwort …' : '', 'data-i': i });
      inp.addEventListener('input', () => { a.t = inp.value; raus(); if (i === M.a.length - 1 && inp.value) { const p = inp.selectionStart; male(); const f = box.querySelector(`[data-i="${i}"]`); f.focus(); f.setSelectionRange(p, p); } });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const n = box.querySelector(`[data-i="${i + 1}"]`); if (n) n.focus(); } });
      tab.append(h('tr', { class: a.ok ? 'ue-richtig' : '' },
        h('td', { class: 'ue-ok' }, a.t ? h('button', { class: 'ue-haken' + (a.ok ? ' on' : ''), title: a.ok ? 'richtig – antippen: falsch' : 'falsch – antippen: richtig', onclick: () => { a.ok = !a.ok; raus(); male(); } }, a.ok ? '✓' : '') : ''),
        h('td', {}, inp), h('td', { class: 'ue-akt' }, a.t ? h('span', { class: 'ue-knoepfe' }, h('button', { title: 'Antwort löschen', onclick: () => { M.a.splice(i, 1); raus(); male(); } }, '🗑')) : '')));
    });
    box.append(h('label', { class: 'ue-lbl' }, 'Frage'), frage, h('label', { class: 'ue-lbl' }, 'Antworten – richtige mit ✓ markieren (Kästchen antippen)'), tab);
    if (fokus === 'frage') frage.focus();
  };
  male(); return box;
}

// ---------- Lückentext: Text schreiben, dann Wörter antippen ----------
const teileWort = w => { const m = w.match(/^([„"'(»«]*)(.*?)([.,;:!?“"')»«]*)$/); return m ? [m[1], m[2], m[3]] : ['', w, '']; };
function lueckeEditor(text, setze) {
  // Modell: Tokens des Klartexts, markierte Wort-Positionen = Lücken (benachbarte werden zu einer Lücke)
  let ablenker = '';
  const L = String(text || '').split(/\r?\n/), rest = [];
  for (const l of L) { const m = l.match(/^\s*ablenker\s*:\s*(.*)$/i); if (m) ablenker = m[1]; else rest.push(l); }
  let roh = ''; const bereiche = []; // [eckige Klammern] → Zeichenbereiche der Lücken im Klartext
  for (const st of rest.join('\n').split(/(\[[^\]]+\])/)) {
    if (/^\[.*\]$/.test(st)) { bereiche.push([roh.length, roh.length + st.length - 2]); roh += st.slice(1, -1); } else roh += st;
  }
  // Lücken über Wortnummer merken (bei Textänderung: Wort + wievieltes Vorkommen)
  const woerter = t => { const out = []; let m; const re = /\S+/g; while ((m = re.exec(t))) out.push({ i: m.index, w: m[0] }); return out; };
  let W = woerter(roh), mark = new Set(W.map((x, n) => bereiche.some(([a, b]) => x.i < b && x.i + x.w.length > a) ? n : -1).filter(n => n >= 0));
  const schluessel = (liste, n) => { const w = teileWort(liste[n].w)[1]; let k = 0; for (let j = 0; j < n; j++) if (teileWort(liste[j].w)[1] === w) k++; return w + '#' + k; };
  const raus = () => {
    let out = '', pos = 0, offen = false;
    W.forEach((x, n) => {
      const zw = roh.slice(pos, x.i), [vor, kern, nach] = teileWort(x.w), an = mark.has(n) && !!kern;
      const nx = W[n + 1], naechste = an && nx && mark.has(n + 1) && !nach && !teileWort(nx.w)[0] && !/\n/.test(roh.slice(x.i + x.w.length, nx.i));
      out += zw;
      if (an) { out += (offen ? '' : vor + '[') + kern + (naechste ? '' : ']' + nach); offen = naechste; }
      else out += x.w;
      pos = x.i + x.w.length;
    });
    out += roh.slice(pos);
    setze(out + (ablenker.trim() ? '\nAblenker: ' + ablenker : ''));
  };
  const box = h('div', {}), chips = h('div', { class: 'ue-chips' });
  const ta = h('textarea', { class: 'feld ue-text', placeholder: 'Text hier eintippen oder einfügen …' }, roh);
  const male = () => {
    chips.innerHTML = '';
    if (!W.length) { chips.append(h('span', { class: 'hint' }, 'Erst oben den Text eingeben – dann erscheinen hier die Wörter zum Antippen.')); return; }
    let pos = 0;
    W.forEach((x, n) => {
      if (/\n/.test(roh.slice(pos, x.i))) chips.append(h('br'));
      const [vor, kern, nach] = teileWort(x.w);
      chips.append(h('button', { class: 'ue-wort' + (mark.has(n) ? ' on' : ''), title: mark.has(n) ? 'Lücke – antippen: wieder Text' : 'antippen: wird zur Lücke', onclick: () => { mark.has(n) ? mark.delete(n) : mark.add(n); raus(); male(); } },
        vor, h('span', {}, kern), nach));
      pos = x.i + x.w.length;
    });
  };
  ta.addEventListener('input', () => {
    const alt = new Set([...mark].map(n => schluessel(W, n)));
    roh = ta.value; W = woerter(roh); mark = new Set(W.map((x, n) => alt.has(schluessel(W, n)) ? n : -1).filter(n => n >= 0));
    raus(); male();
  });
  const abl = h('input', { type: 'text', class: 'ue-feld', value: ablenker, placeholder: 'z. B. Norden, steht (mit Komma trennen)', oninput: e => { ablenker = e.target.value; raus(); } });
  male();
  box.append(h('label', { class: 'ue-lbl' }, '1. Text'), ta, h('label', { class: 'ue-lbl' }, '2. Wörter antippen, die zur Lücke werden (nebeneinander markierte Wörter = eine Lücke)'), chips,
    h('label', { class: 'ue-lbl' }, '3. Falsche Wörter als Ablenker (freiwillig)'), abl);
  return box;
}

// ---------- Gemeinsames für die neuen Übungsarten ----------
const kopfFeld = (label, wert, ph, set) => [h('label', { class: 'ue-lbl' }, label), h('input', { type: 'text', class: 'ue-feld ue-frage', value: wert || '', placeholder: ph, oninput: e => set(e.target.value) })];
const enSchalter = (M, raus) => h('label', { class: 'ue2-check' }, h('input', { type: 'checkbox', checked: !!M.en, onchange: e => { M.en = e.target.checked; raus(); } }), ' Englische Beschriftung an der Tafel (true / false, right / wrong …)');
const istEn = opt => /^(en|englisch|english)/i.test(opt.sprache || '');
const kopfZeilen = M => [M.en ? 'Sprache: en' : '', (M.aufgabe || '').trim() ? 'Aufgabe: ' + M.aufgabe.trim() : ''];
// Zeilen-Tabelle mit „wächst von selbst“, Enter = nächste Zeile, Einfügen mehrerer Zeilen
function zeilenTab(box, M, liste, leer, spalten, raus, male) {
  if (!liste.length || Object.values(liste[liste.length - 1]).some(v => typeof v === 'string' && v)) liste.push(leer());
  const tab = h('table', { class: 'ue-tab' }, h('tr', {}, h('th', { class: 'ue-nr' }, ''), ...spalten.map(s => h('th', { class: s.kl || '' }, s.kopf)), h('th', { class: 'ue-akt' }, '')));
  liste.forEach((z, i) => {
    const voll = Object.values(z).some(v => typeof v === 'string' && v), tr = h('tr', { class: z.f ? 'ue2-fehler' : '' }, h('td', { class: 'ue-nr' }, (i + 1) + '.'));
    spalten.forEach((s, si) => {
      if (s.zelle) { tr.append(h('td', { class: s.kl || '' }, voll ? s.zelle(z, () => { raus(); male(); }) : '')); return; }
      const inp = h('input', { type: 'text', class: 'ue-feld', value: z[s.feld] || '', placeholder: i === liste.length - 1 && si === 0 ? '＋ weiter …' : (s.ph || ''), 'data-i': i, 'data-s': si });
      inp.addEventListener('input', () => { z[s.feld] = inp.value; raus(); if (i === liste.length - 1 && inp.value) { const p = inp.selectionStart; male(); const f2 = box.querySelector(`[data-i="${i}"][data-s="${si}"]`); if (f2) { f2.focus(); f2.setSelectionRange(p, p); } } });
      inp.addEventListener('keydown', e => { if (e.key !== 'Enter') return; e.preventDefault(); const n = box.querySelector(`[data-i="${i + 1}"][data-s="0"]`); if (n) n.focus(); });
      if (si === 0) inp.addEventListener('paste', e => { e.stopPropagation(); const t = (e.clipboardData || window.clipboardData).getData('text'); if (!/\n/.test(t)) return; e.preventDefault();
        const neuZ = t.replace(/\r/g, '').split('\n').filter(l => l.trim()).map(l => { const n = leer(); const teile = l.split('\t'); spalten.filter(x => x.feld).forEach((x, j) => { if (teile[j] != null) n[x.feld] = teile[j].trim(); }); return n; });
        liste.splice(voll ? i + 1 : i, voll ? 0 : 1, ...neuZ); raus(); male(); });
      tr.append(h('td', {}, inp));
    });
    tr.append(h('td', { class: 'ue-akt' }, voll ? h('span', { class: 'ue-knoepfe' }, i > 0 ? h('button', { title: 'nach oben', onclick: () => { [liste[i - 1], liste[i]] = [liste[i], liste[i - 1]]; raus(); male(); } }, '▲') : '',
      h('button', { title: 'Zeile löschen', onclick: () => { liste.splice(i, 1); raus(); male(); } }, '🗑')) : ''));
    tab.append(tr);
  });
  return tab;
}

// ---------- 🔍 Fehler finden: Zeilen, fehlerhafte mit ✗ + richtige Fassung ----------
function fehlerEditor(text, setze) {
  const { opt, rest } = T.uebSteuer(zeilen(text), ['aufgabe', 'sprache']), box = h('div', {});
  const M = { aufgabe: opt.aufgabe || '', en: istEn(opt), Z: rest.map(l => { const t = l.split(/\s*(?:=>|⇒)\s*/); return { t: t[0], f: t.length > 1, k: t.slice(1).join(' => ') }; }) };
  const raus = () => setze(kopfZeilen(M).concat(M.Z.filter(z => z.t.trim()).map(z => z.f ? z.t.trim() + ' => ' + ((z.k || '').trim() || z.t.trim()) : z.t.trim())).filter(Boolean).join('\n'));
  const male = () => {
    box.innerHTML = '';
    const tab = zeilenTab(box, M, M.Z, () => ({ t: '', f: false, k: '' }), [
      { feld: 't', kopf: 'Zeile – so, wie sie an der Tafel steht' },
      { kopf: 'Fehler?', kl: 'ue-ok', zelle: (z, neu) => h('button', { class: 'ue-haken ue2-rot' + (z.f ? ' on' : ''), title: z.f ? 'fehlerhaft – antippen: richtig' : 'richtig – antippen: fehlerhaft', onclick: () => { z.f = !z.f; if (z.f && !z.k) z.k = z.t; neu(); } }, z.f ? '✗' : '') },
      { kopf: 'Richtige Fassung (erscheint mit 💡)', zelle: z => z.f ? h('input', { type: 'text', class: 'ue-feld', value: z.k, placeholder: 'so ist es richtig …', oninput: e => { z.k = e.target.value; raus(); } }) : h('span', { class: 'ue2-leise' }, 'richtig') }
    ], raus, male);
    box.append(...kopfFeld('Aufgabe (freiwillig, steht über der Übung)', M.aufgabe, 'z. B. Ben hat gerechnet. Prüfe jede Zeile.', v => { M.aufgabe = v; raus(); }),
      h('label', { class: 'ue-lbl' }, 'Zeilen (Rechenschritte, Sätze, Protokollzeilen) – fehlerhafte mit ✗ markieren und rechts verbessern'), tab, enSchalter(M, raus));
  };
  male(); return box;
}

// ---------- ✔✘ Aussagen prüfen: Text oder Diagramm + Aussagen mit r / f / n und Beleg ----------
function aussagenEditor(text, setze) {
  const { opt, rest } = T.uebSteuer(zeilen(text), ['aufgabe', 'sprache', 'antworten', 'text', 'diagramm', 'diagrammart']), box = h('div', {});
  const M = { aufgabe: opt.aufgabe || '', en: istEn(opt), ant: (opt.antworten || '').split(/\s*[|;]\s*/).concat(['', '', '']).slice(0, 3), quelle: opt.diagramm != null ? 'diagramm' : 'text',
    titel: opt.diagramm || '', art: opt.diagrammart || 'saeulen', text: opt.text ? [opt.text] : [], daten: [], A: [] };
  rest.forEach(l => { const m = l.match(/^(r|w|t|f|n|ng|\?)\s*[:)]\s*(.+)$/i);
    if (m) { let t = m[2], b = ''; const bm = t.match(/\s*@\s*(.+)$/); if (bm) { b = bm[1].trim(); t = t.slice(0, bm.index).trim(); } const kk = m[1].toLowerCase(); M.A.push({ t, l: 'rwt'.includes(kk) ? 0 : kk === 'f' ? 1 : 2, b }); }
    else if (M.quelle === 'diagramm' && /[;\t]/.test(l)) M.daten.push(l); else M.text.push(l); });
  const raus = () => {
    const out = kopfZeilen(M); if (M.ant.some(a => a.trim())) out.push('Antworten: ' + M.ant.map(a => a.trim()).join(' | '));
    if (M.quelle === 'text' && M.text.some(z => z.trim())) out.push('Text:', ...M.text.filter(z => z.trim()));
    if (M.quelle === 'diagramm') out.push('Diagramm: ' + M.titel, 'Diagrammart: ' + M.art, ...M.daten.filter(z => z.trim()));
    M.A.filter(a => a.t.trim()).forEach(a => out.push('rfn'[a.l] + ': ' + a.t.trim() + (a.b.trim() ? ' @ ' + a.b.trim() : '')));
    setze(out.filter(Boolean).join('\n'));
  };
  const LB = () => M.en ? ['true', 'false', 'not given'] : M.quelle === 'diagramm' ? ['stimmt', 'stimmt nicht', 'nicht ablesbar'] : ['richtig', 'falsch', 'steht nicht im Text'];
  const male = () => {
    box.innerHTML = '';
    const quelle = h('div', { class: 'kats' }, ...[['text', '📄 Text mit Zeilennummern'], ['diagramm', '📊 Diagramm']].map(([q, l]) => h('button', { class: 'kat' + (M.quelle === q ? ' on' : ''), onclick: () => { M.quelle = q; raus(); male(); } }, l)));
    let qFeld;
    if (M.quelle === 'text') qFeld = h('textarea', { class: 'feld ue-text', placeholder: 'Eigenen Text eintippen – jede Zeile bekommt an der Tafel eine Nummer (leer lassen = nur Aussagen) …', oninput: e => { M.text = e.target.value.split(/\r?\n/); raus(); } }, M.text.join('\n'));
    else qFeld = h('div', {}, ...kopfFeld('Überschrift des Diagramms', M.titel, 'z. B. Ausleihen in der Schulbücherei', v => { M.titel = v; raus(); }),
      h('label', { class: 'ue-lbl' }, 'Art'), h('div', { class: 'kats' }, ...[['saeulen', '▮ Säulen'], ['balken', '▬ Balken'], ['linie', '📈 Linie'], ['punkte', '✕ Punkte']].map(([a, l]) => h('button', { class: 'kat' + (M.art === a ? ' on' : ''), onclick: () => { M.art = a; raus(); male(); } }, l))),
      h('label', { class: 'ue-lbl' }, 'Daten: erste Zeile Beschriftungen, darunter je Zeile „x;Wert“'), h('textarea', { class: 'feld ue-text', placeholder: 'Tag;Ausleihen\nMo;24\nDi;30', oninput: e => { M.daten = e.target.value.split(/\r?\n/); raus(); } }, M.daten.join('\n')));
    const tab = zeilenTab(box, M, M.A, () => ({ t: '', l: 0, b: '' }), [
      { feld: 't', kopf: 'Aussage' },
      { kopf: 'Lösung', zelle: (a, neu) => h('span', { class: 'ue2-wahl' }, ...LB().map((t, j) => h('button', { class: 'ue2-opt' + (a.l === j ? ' on' : ''), onclick: () => { a.l = j; neu(); } }, t))) },
      { feld: 'b', kopf: M.quelle === 'text' ? 'Beleg: Zeile' : 'Begründung (freiwillig)', ph: M.quelle === 'text' ? 'z. B. 3' : '' }
    ], raus, male);
    box.append(...kopfFeld('Aufgabe (freiwillig – sonst schreibt die App den Auftrag passend zum Niveau)', M.aufgabe, '', v => { M.aufgabe = v; raus(); }),
      h('label', { class: 'ue-lbl' }, '1. Grundlage'), quelle, qFeld, h('label', { class: 'ue-lbl' }, '2. Aussagen – Lösung antippen; ★ zeigt nur „richtig / falsch“-Aussagen'), tab,
      h('label', { class: 'ue-lbl' }, '3. Beschriftung der drei Felder (freiwillig)'),
      h('div', { class: 'ue2-reihe' }, ...[0, 1, 2].map(j => h('input', { type: 'text', class: 'ue-feld ue-frage', value: M.ant[j], placeholder: LB()[j], oninput: e => { M.ant[j] = e.target.value; raus(); } }))), enSchalter(M, () => { raus(); male(); }));
  };
  male(); return box;
}

// ---------- 💬 Wer hat recht? Sprechblasen mit Lösung + Musterbegründung ----------
function rechtEditor(text, setze) {
  const { opt, rest } = T.uebSteuer(zeilen(text), ['aufgabe', 'sprache', 'frage']), box = h('div', {});
  const M = { aufgabe: opt.aufgabe || '', frage: opt.frage || '', en: istEn(opt), P: rest.map(l => { const m = l.match(/^([+\-−~])?\s*([^:|]{1,40}):\s*(.+)$/); if (!m) return null; const [aus, ...beg] = m[3].split('|');
    return { n: m[2].trim(), t: aus.trim(), l: { '+': 1, '-': 2, '−': 2, '~': 3 }[m[1]] || 1, b: beg.join('|').trim() }; }).filter(Boolean) };
  const raus = () => setze([M.en ? 'Sprache: en' : '', M.frage.trim() ? 'Frage: ' + M.frage.trim() : '', M.aufgabe.trim() ? 'Aufgabe: ' + M.aufgabe.trim() : '']
    .concat(M.P.filter(p => p.t.trim()).map(p => ['', '+', '-', '~'][p.l] + ' ' + ((p.n || '').trim() || 'Person') + ': ' + p.t.trim() + ((p.b || '').trim() ? ' | ' + p.b.trim() : ''))).filter(Boolean).join('\n'));
  const LB = ['', '✓ stimmt', '✗ stimmt nicht', '~ teilweise'];
  const male = () => {
    box.innerHTML = '';
    const tab = zeilenTab(box, M, M.P, () => ({ t: '', n: '', l: 1, b: '' }), [
      { feld: 't', kopf: 'Aussage in der Sprechblase' }, { feld: 'n', kopf: 'Name', ph: 'z. B. Mia' },
      { kopf: 'Lösung', kl: 'ue-akt', zelle: (p, neu) => h('button', { class: 'ue2-opt on', title: 'antippen: umschalten', onclick: () => { p.l = p.l % 3 + 1; neu(); } }, LB[p.l]) },
      { feld: 'b', kopf: 'Musterbegründung (erscheint mit 💡)' }
    ], raus, male);
    box.append(...kopfFeld('Frage / Behauptung (steht groß über den Sprechblasen)', M.frage, 'z. B. Wird das Ergebnis beim Multiplizieren immer größer?', v => { M.frage = v; raus(); }),
      h('label', { class: 'ue-lbl' }, 'Sprechblasen (2–4) – typische Fehlvorstellungen sind gute „stimmt nicht“-Aussagen. ★ zeigt zwei, ★★★ zusätzlich eine leere für eine eigene Aussage.'), tab, enSchalter(M, raus));
  };
  male(); return box;
}

// ---------- 👆 Antipp-Text: Sätze mit [,] und {das|*dass} – oder Wörter in der Vorschau antippen ----------
function tippEditor(text, setze) {
  const { opt, rest } = T.uebSteuer(zeilen(text), ['aufgabe', 'sprache', 'regel']), box = h('div', {});
  const M = { aufgabe: opt.aufgabe || '', regel: opt.regel || '', en: istEn(opt), Z: rest };
  const raus = () => setze(kopfZeilen(M).concat(M.regel.trim() ? ['Regel: ' + M.regel.trim()] : [], M.Z.map(z => z.trim()).filter(Boolean)).filter(Boolean).join('\n'));
  const ta = h('textarea', { class: 'feld ue-text', placeholder: 'Ein Satz pro Zeile, z. B.\nIch glaube[,] dass er kommt.\nIch hoffe, {das|*dass} du kommst.\nBeim {*L|l}aufen bekomme ich Seitenstiche.' }, M.Z.join('\n'));
  const chips = h('div', { class: 'ue-chips' });
  const swap = c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
  const male = () => {
    chips.innerHTML = '';
    const Z = M.Z.filter(z => z.trim()); if (!Z.length) { chips.append(h('span', { class: 'hint' }, 'Erst oben Sätze eintippen – dann hier Stellen antippen.')); return; }
    M.Z = Z;
    Z.forEach((zeile, zi) => {
      if (zi) chips.append(h('br'));
      const ri = zeile.search(/\s+(?:Regel|Rule)\s*:/i), kern = ri >= 0 ? zeile.slice(0, ri) : zeile, suffix = ri >= 0 ? zeile.slice(ri) : '';
      const P = kern.split(/(\[,\]|\{[^{}]+\}|\s+)/).filter(s => s !== '');
      const setzen = () => { M.Z[zi] = P.join('') + suffix; ta.value = M.Z.join('\n'); raus(); male(); };
      P.forEach((p, i) => {
        if (p === '[,]') chips.append(h('button', { class: 'ue-wort on', title: 'Komma gehört hierhin – antippen: weg', onclick: () => { P.splice(i, 1); setzen(); } }, ','));
        else if (/^\{.*\}$/.test(p)) { const o = p.slice(1, -1).split('|'), si = Math.max(0, o.findIndex(x => x.trim().startsWith('*'))), soll = o[si].replace(/^\s*\*\s*/, '');
          chips.append(h('button', { class: 'ue-wort on', title: 'Auswahl – antippen: wieder normales Wort', onclick: () => { P[i] = soll; setzen(); } }, o.map(x => x.replace(/^\s*\*\s*/, '')).join(' | '))); }
        else if (/^\s+$/.test(p)) { const v = P[i - 1] || '';
          if (i > 0 && v !== '[,]' && !/[,.;:!?–-]$/.test(v) && i < P.length - 1) chips.append(h('button', { class: 'ue2-luecke', title: 'Hier gehört ein Komma hin', onclick: () => { P.splice(i, 0, '[,]'); setzen(); } }, '‸')); }
        else chips.append(h('button', { class: 'ue-wort', title: 'antippen: das/dass- bzw. Groß/klein-Auswahl', onclick: () => {
          const m = p.match(/^(\W*)(das|dass|Das|Dass)(\W*)$/);
          if (m) { const gross = m[2][0] === 'D', a = gross ? 'Das' : 'das', b = gross ? 'Dass' : 'dass'; P[i] = m[1] + '{' + (m[2].length === 3 ? '*' + a + '|' + b : a + '|*' + b) + '}' + m[3]; }
          else { const j = p.search(/\p{L}/u); if (j < 0) return; P[i] = p.slice(0, j) + '{*' + p[j] + '|' + swap(p[j]) + '}' + p.slice(j + 1); }
          setzen(); } }, p));
      });
    });
  };
  ta.addEventListener('input', () => { M.Z = ta.value.split(/\r?\n/); raus(); male(); });
  const umbau = fn => { M.Z = M.Z.map(fn); ta.value = M.Z.join('\n'); raus(); male(); };
  male();
  box.append(...kopfFeld('Aufgabe (freiwillig)', M.aufgabe, '', v => { M.aufgabe = v; raus(); }),
    h('label', { class: 'ue-lbl' }, '1. Sätze – je Zeile einer. [,] = hier gehört ein Komma · {das|*dass} = Auswahl, * = richtig · {*G|g}roß = Groß/klein · am Ende „Regel: …“ (freiwillig)'), ta,
    h('div', { class: 'ue2-reihe' }, h('button', { class: 'big', title: 'Alle Kommas mit Leerzeichen danach werden zu Antipp-Stellen (Dezimalzahlen wie 0,5 bleiben)', onclick: () => umbau(z => z.replace(/,(?=\s)/g, '[,]')) }, '„,“ → Komma-Stellen'),
      h('button', { class: 'big', title: 'Jedes „das“ / „dass“ wird zur Auswahl (die vorhandene Schreibung gilt als richtig)', onclick: () => umbau(z => z.replace(/(^|[^\p{L}{|*])(das|dass|Das|Dass)(?![\p{L}|}])/gu, (x, v, w) => v + '{' + (w.length === 3 ? '*' + w + '|' + w + 's' : w.slice(0, 3) + '|*' + w) + '}')) }, 'das/dass → Auswahl')),
    h('label', { class: 'ue-lbl' }, '2. Oder hier antippen: Wort = Auswahl (das/dass bzw. groß/klein) · ‸ = Komma hierhin · markierte Stelle = zurück'), chips,
    ...kopfFeld('Regel für alle Sätze (freiwillig – ★ zeigt sie, ★★★ lässt sie aufschreiben)', M.regel, 'z. B. Ersatzprobe: Passt „dieses“ oder „welches“, schreibt man „das“.', v => { M.regel = v; raus(); }),
    enSchalter(M, raus));
  return box;
}

// ---------- gespeicherte Listen ----------
const LS = 'tafel-uebungslisten';
const listen = () => { try { const l = JSON.parse(localStorage.getItem(LS) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
const listenSetzen = l => { try { localStorage.setItem(LS, JSON.stringify(l)); } catch (e) { T.toast('Speichern nicht möglich (Browser-Speicher voll oder gesperrt).', 3000); } };
T.uebListen = listen;

// Editor für einen Typ; text = aktueller Inhalt im Textformat; setze(text) meldet Änderungen
T.uebEditor = (typ, text, setze) => {
  if (typ === 'mc') return mcEditor(text, setze);
  if (typ === 'luecke') return lueckeEditor(text, setze);
  if (typ === 'fehler') return fehlerEditor(text, setze);
  if (typ === 'aussagen') return aussagenEditor(text, setze);
  if (typ === 'recht') return rechtEditor(text, setze);
  if (typ === 'tipp') return tippEditor(text, setze);
  if (typ === 'kaesten') { // 🧩 Zuordnungskästen: Aufgabe, Begriffe (Tabelle), Ablenker
    let aufg = '', abl = '';
    const rest = String(text || '').split(/\r?\n/).filter(l => { const m = l.match(/^\s*(aufgabe|task)\s*:\s*(.*)$/i), a = l.match(/^\s*ablenker\s*:\s*(.*)$/i);
      if (m && !aufg) { aufg = m[2]; return false; } if (a) { abl = a[1]; return false; } return true; }).join('\n');
    const R = LESEN.reihe(rest), box = h('div', { class: 'ue-tabbox' });
    const raus = () => setze([aufg.trim() ? 'Aufgabe: ' + aufg.trim() : '', SCHREIBEN.reihe(R), abl.trim() ? 'Ablenker: ' + abl.trim() : ''].filter(Boolean).join('\n'));
    const neu = male => { raus(); if (male) { box.innerHTML = ''; box.append(tabelle('kaesten', R, neu)); } };
    box.append(tabelle('kaesten', R, neu));
    return h('div', {}, ...kopfFeld('Aufgabe (freiwillig, steht über der Übung)', aufg, 'z. B. Beschrifte die Blüte.', v => { aufg = v; raus(); }), box,
      ...kopfFeld('Ablenker für ★★★ (freiwillig, mit Komma trennen)', abl, 'z. B. Wurzel, Laubblatt', v => { abl = v; raus(); }));
  }
  if (['gruppen', 'reihe', 'paare'].includes(typ)) { // mit Feld „Aufgabe“; Kärtchen sortieren zusätzlich mit Spalten-Vorlagen
    const aussen = h('div', {});
    const baue = txt => {
      let aufg = ''; const rest = String(txt || '').split(/\r?\n/).filter(l => { const m = l.match(/^\s*(aufgabe|task)\s*:\s*(.*)$/i); if (m && !aufg) { aufg = m[2]; return false; } return true; }).join('\n');
      let innen = rest; const raus = () => setze((aufg.trim() ? 'Aufgabe: ' + aufg.trim() + (innen ? '\n' : '') : '') + innen);
      const R = LESEN[typ](rest), box = h('div', { class: 'ue-tabbox' });
      const neu = male => { innen = SCHREIBEN[typ](R); raus(); if (male) { box.innerHTML = ''; box.append(tabelle(typ, R, neu)); } };
      box.append(tabelle(typ, R, neu));
      aussen.innerHTML = '';
      const V = typ === 'gruppen' && T.UEBUNGEN.gruppen.vorlagen;
      if (V) aussen.append(h('div', { class: 'ue2-reihe' }, h('span', { class: 'ue-lbl', style: { margin: 0 } }, 'Vorlagen:'),
        ...V.map(v => h('button', { class: 'big', title: 'Spalten und Beispiel-Kärtchen übernehmen (danach anpassen)', onclick: () => { setze(v.text); baue(v.text); } }, v.n))));
      aussen.append(...kopfFeld('Aufgabe (freiwillig, steht über der Übung)', aufg, typ === 'gruppen' ? 'z. B. Versuch: … Ordne zu.' : '', v => { aufg = v; raus(); }), box);
    };
    baue(text); return aussen;
  }
  const R = (LESEN[typ] || LESEN.reihe)(text), box = h('div', { class: 'ue-tabbox' });
  const neu = male => { setze((SCHREIBEN[typ] || SCHREIBEN.reihe)(R)); if (male) { box.innerHTML = ''; box.append(tabelle(typ, R, neu)); } };
  box.append(tabelle(typ, R, neu));
  return box;
};
// Speichern / Laden (Liste merkt sich Übungsart + Inhalt)
T.uebSpeichern = async (typ, text, name) => {
  if (!String(text || '').trim()) { T.toast('Erst etwas eintragen – dann speichern.'); return; }
  const n = await T.frage('Name für diese Liste (z. B. „Unit 3 – Vokabeln“ oder „Tiere ordnen“):', { ok: '💾 Speichern', feld: { wert: name || '' } });
  if (!n || !n.trim()) return;
  const l = listen().filter(x => x.name !== n.trim()); l.unshift({ name: n.trim(), typ, text, zeit: Date.now(), fach: (T.S.board && T.S.board.fach) || '' }); /* Fach der Tafel – „Meine Listen“ zeigt zuerst die Listen dieses Fachs */ listenSetzen(l.slice(0, 200));
  T.toast('Gespeichert: „' + n.trim() + '“ – zu finden unter „📂 Meine Listen“.', 3000);
};
T.uebLoeschen = name => listenSetzen(listen().filter(x => x.name !== name));
})();
