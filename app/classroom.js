// Tafel-App – Classroom-Werkzeuge: Uhr, Arbeitssymbole, Ampel, Lautstärke, Umfrage, Punktestand, Gruppen, QR-Code
'use strict';
(function () {
const h = T.h, CR = T.CR = {};
const fenster = (titel, inhalt, x, y) => T.widget(titel, [inhalt], x == null ? Math.max(20, innerWidth - 640) : x, y == null ? 90 : y);
const klassen = () => { if (T.klassenAnwesend) return T.klassenAnwesend(); try { return JSON.parse(localStorage.getItem('tafelapp.klassen') || '{}'); } catch (e) { return {}; } }; // ohne die heute Fehlenden
const merke = (k, v) => { try { localStorage.setItem('tafelapp.' + k, JSON.stringify(v)); } catch (e) {} };
const lies = (k, d) => { try { const v = JSON.parse(localStorage.getItem('tafelapp.' + k)); return v == null ? d : v; } catch (e) { return d; } };

// ---------- Uhr & Datum ----------
CR.uhr = () => {
  const z = h('div', { class: 'cr-uhr' }), dt = h('div', { class: 'cr-datum' });
  const tick = () => { const n = new Date(); z.textContent = n.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }); dt.textContent = n.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
  tick(); const iv = setInterval(tick, 1000);
  const w = fenster('🕘 Uhr', h('div', {}, z, dt)); w.onclose = () => clearInterval(iv);
};

// ---------- Arbeitssymbole ----------
// Frei wählbar: beliebig viele Symbole aus allen Gruppen, dazu eigene (Emoji + Text)
const SYMBOLE = [
  ['Lautstärke', [['🤫', 'Ruhe'], ['💬', 'Flüstern'], ['🗣️', 'Sprechen erlaubt']]],
  ['Arbeitsform', [['👤', 'Einzelarbeit'], ['👥', 'Partnerarbeit'], ['👨‍👩‍👧‍👦', 'Gruppenarbeit'], ['🧑‍🏫', 'Plenum'], ['🔄', 'Stationen'], ['🏃', 'Bewegung']]],
  ['Verhalten', [['🙋', 'Melden'], ['✋', 'Stopp – alle hören zu'], ['👀', 'Nach vorne schauen'], ['🤝', 'Partner fragen'], ['❓', 'Erst 3 fragen, dann mich'], ['🪑', 'Auf den Platz'], ['🧹', 'Aufräumen'], ['📵', 'Handy weg']]],
  ['Material', [['📖', 'Buch'], ['📓', 'Heft'], ['📄', 'Arbeitsblatt'], ['✏️', 'Stift'], ['📐', 'Geodreieck'], ['🧮', 'Taschenrechner'], ['💻', 'Tablet / PC'], ['🎧', 'Kopfhörer']]],
  ['Ablauf', [['⏳', 'Arbeitszeit'], ['✅', 'Fertig? Selbst kontrollieren'], ['➕', 'Fertig? Zusatzaufgabe'], ['📝', 'Hausaufgabe notieren'], ['🏁', 'Stundenende']]]];
CR.arbeit = () => {
  let auswahl = lies('symAuswahl', null), eigene = lies('symEigene', []), wahl = false;
  if (!Array.isArray(auswahl)) { // alte Einstellung (je ein Lautstärke- und ein Arbeitsform-Symbol) übernehmen
    const L = ['Ruhe', 'Flüstern', 'Sprechen erlaubt'], F = ['Einzelarbeit', 'Partnerarbeit', 'Gruppenarbeit', 'Plenum', 'Melden', 'Partner fragen', 'Nach vorne schauen', 'Stopp – alle hören zu'];
    auswahl = [L[lies('symLaut', 0)] || L[0], F[lies('symForm', 0)] || F[0]];
  }
  const alle = () => SYMBOLE.flatMap(g => g[1]).concat(eigene);
  const speichere = () => { merke('symAuswahl', auswahl); merke('symEigene', eigene); };
  const box = h('div', {}); let w = null;
  const zeichne = () => {
    box.innerHTML = '';
    if (w) w.kopf(wahl ? [h('button', { class: 'big', onclick: () => { auswahl = []; speichere(); zeichne(); } }, 'Alle abwählen'), h('button', { class: 'big prim', onclick: () => { wahl = false; zeichne(); } }, '✓ Fertig')] : []);
    if (wahl) {
      const knopf = ([e, n], loeschbar) => h('button', { class: auswahl.includes(n) ? 'on' : '', onclick: () => { auswahl = auswahl.includes(n) ? auswahl.filter(x => x !== n) : auswahl.concat(n); speichere(); zeichne(); } },
        h('span', {}, e), n, loeschbar ? h('b', { class: 'cr-weg', title: 'Eigenes Symbol löschen', onclick: ev => { ev.stopPropagation(); eigene = eigene.filter(x => x[1] !== n); auswahl = auswahl.filter(x => x !== n); speichere(); zeichne(); } }, '×') : '');
      box.append(h('p', { class: 'hint', style: { margin: '0 0 6px' } }, 'Beliebig viele antippen – alle gewählten werden angezeigt.'));
      for (const [titel, liste] of SYMBOLE) box.append(h('h4', {}, titel), h('div', { class: 'cr-symwahl' }, ...liste.map(s => knopf(s))));
      box.append(h('h4', {}, 'Eigene'), h('div', { class: 'cr-symwahl' }, ...eigene.map(s => knopf(s, true)),
        h('button', { onclick: async () => { const t = await T.frage('Text für das Symbol (z. B. „Leise lesen“):', { feld: {} }); if (!t || !t.trim()) return; const e = (await T.frage('Emoji dafür (Windows: Win + . öffnet die Emoji-Auswahl):', { feld: { wert: '⭐' } })) || '⭐';
          if (alle().some(x => x[1] === t.trim())) { T.toast('Diesen Namen gibt es schon.'); return; } eigene = eigene.concat([[e.trim(), t.trim()]]); auswahl = auswahl.concat(t.trim()); speichere(); zeichne(); } }, h('span', {}, '＋'), 'Eigenes Symbol')));
    } else {
      const zeigen = auswahl.map(n => alle().find(x => x[1] === n)).filter(Boolean);
      const gr = zeigen.length <= 2 ? 90 : zeigen.length <= 4 ? 70 : 52;
      box.append(h('div', { class: 'cr-symbole', title: 'Antippen zum Ändern', onclick: () => { wahl = true; zeichne(); } },
        ...(zeigen.length ? zeigen.map(([e, n]) => h('div', { class: 'cr-sym' }, h('span', { style: { fontSize: gr + 'px' } }, e), n)) : [h('div', { class: 'cr-sym' }, h('span', {}, '＋'), 'Symbole wählen')])));
    }
  };
  w = fenster('🤫 Arbeitssymbole', box, Math.max(20, innerWidth - 640), 80); zeichne();
};

// ---------- Ampel ----------
CR.ampel = () => {
  let an = lies('ampel', 2); const box = h('div', { class: 'cr-ampel' });
  const zeichne = () => { box.innerHTML = ''; ['rot', 'gelb', 'gruen'].forEach((f, i) => box.append(h('button', { class: 'cr-licht ' + f + (an === i ? ' an' : ''), title: ['Stopp / leise', 'Achtung / gleich fertig', 'Los / arbeiten'][i], onclick: () => { an = i; merke('ampel', i); zeichne(); } }))); };
  zeichne(); fenster('🚦 Ampel', box, Math.max(20, innerWidth - 260), 90);
};

// ---------- Lautstärke (Mikrofon, nichts wird aufgenommen oder gespeichert) ----------
CR.laut = async () => {
  const balken = h('div', { class: 'cr-pegel' }, h('div', {})), gesicht = h('div', { class: 'cr-gesicht' }, '🙂');
  let grenze = lies('lautGrenze', 60);
  const regler = h('input', { type: 'range', min: 10, max: 95, value: grenze, oninput: e => { grenze = +e.target.value; merke('lautGrenze', grenze); } });
  const box = h('div', {}, gesicht, balken, h('label', { class: 'fld' }, 'Grenze (ab hier wird es rot)', regler), h('p', { class: 'hint' }, 'Das Mikrofon misst nur die Lautstärke. Es wird nichts aufgenommen oder gespeichert.'));
  const w = fenster('🔊 Lautstärke', box);
  let strom, ctx, iv;
  try { strom = await navigator.mediaDevices.getUserMedia({ audio: true }); }
  catch (e) { box.prepend(h('p', { class: 'hint', style: { color: 'var(--danger)' } }, 'Kein Zugriff auf das Mikrofon (Erlaubnis im Browser nötig).')); return; }
  ctx = new AudioContext(); const an = ctx.createAnalyser(); an.fftSize = 1024; ctx.createMediaStreamSource(strom).connect(an);
  const daten = new Uint8Array(an.fftSize); let glatt = 0;
  iv = setInterval(() => {
    an.getByteTimeDomainData(daten); let s = 0; for (const v of daten) s += (v - 128) ** 2;
    const pegel = T.clamp(Math.sqrt(s / daten.length) * 2.2, 0, 100); glatt += (pegel - glatt) * 0.25;
    const b = balken.firstChild; b.style.width = glatt + '%'; const zuLaut = glatt > grenze, fast = glatt > grenze * 0.75;
    b.style.background = zuLaut ? '#ef4444' : fast ? '#f59e0b' : '#22c55e'; gesicht.textContent = zuLaut ? '😣' : fast ? '😐' : '🙂';
  }, 100);
  w.onclose = () => { clearInterval(iv); strom.getTracks().forEach(t => t.stop()); ctx.close(); };
};

// ---------- Umfrage ----------
const UMF = {
  mc: { n: 'Multiple Choice', opts: ['A', 'B', 'C', 'D'] },
  smiley: { n: 'Smileys', opts: ['😀', '🙂', '😐', '🙁', '😞'] },
  wf: { n: 'Wahr / Falsch', opts: ['✅ Wahr', '❌ Falsch'] },
  daumen: { n: 'Daumen', opts: ['👍', '👌', '👎'] }
};
const FARB = ['#5b5bd6', '#14b8a6', '#f59e0b', '#ec4899', '#22c55e', '#8b5cf6'];
CR.umfrage = () => {
  let frage = '', typ = 'mc', opts = UMF.mc.opts.slice(), stimmen = [], zeigen = false, abstimmen = false, verlauf = [];
  const box = h('div', { class: 'cr-umfrage' }); let w = null;
  const zeichne = () => {
    box.innerHTML = '';
    if (w) w.kopf(!abstimmen ? [h('button', { class: 'big prim', onclick: () => { stimmen = opts.map(() => 0); verlauf = []; zeigen = false; abstimmen = true; zeichne(); } }, '▶ Starten')]
      : [h('button', { class: 'big', onclick: () => { abstimmen = false; zeichne(); } }, '✎ Ändern'), h('button', { class: 'big', title: 'Ergebnis als Diagramm auf die Tafel', onclick: () => ergebnisAufTafel(frage, opts, stimmen) }, '⤴ Auf die Tafel')]);
    if (!abstimmen) {
      const typen = h('div', { class: 'row' }, ...Object.entries(UMF).map(([k, u]) => h('button', { class: 'big' + (k === typ ? ' on' : ''), onclick: () => { typ = k; opts = u.opts.slice(); zeichne(); } }, u.n)));
      const liste = h('div', { class: 'pliste' }, ...opts.map((o, i) => h('div', { class: 'prow' }, h('span', { class: 'pdot', style: { background: FARB[i % 6] } }),
        h('input', { type: 'text', class: 'feld', value: o, oninput: e => { opts[i] = e.target.value; } }),
        h('button', { class: 'pmini', onclick: () => { if (opts.length > 2) { opts.splice(i, 1); zeichne(); } } }, '×'))));
      box.append(h('label', { class: 'fld' }, 'Frage (optional)', h('input', { type: 'text', class: 'feld', value: frage, placeholder: 'z. B. Wie gut hast du es verstanden?', oninput: e => { frage = e.target.value; } })),
        typen, liste, h('div', { class: 'row' }, opts.length < 6 ? h('button', { class: 'big', onclick: () => { opts.push(typ === 'mc' ? String.fromCharCode(65 + opts.length) : '…'); zeichne(); } }, '＋ Antwort') : '',
          h('span', { class: 'hint' }, 'Fertig? Oben „▶ Starten“.')));
      return;
    }
    const summe = stimmen.reduce((a, b) => a + b, 0);
    if (frage) box.append(h('div', { class: 'cr-frage' }, frage));
    box.append(h('div', { class: 'cr-optionen' }, ...opts.map((o, i) => h('button', { class: 'cr-opt', style: { borderColor: FARB[i % 6] }, onclick: () => { stimmen[i]++; verlauf.push(i); zeichne(); } },
      h('span', { class: 'cr-optname' }, o), zeigen ? h('span', { class: 'cr-zahl' }, String(stimmen[i])) : ''))));
    if (zeigen) box.append(h('div', { class: 'cr-balken' }, ...opts.map((o, i) => { const p = summe ? stimmen[i] / summe * 100 : 0;
      return h('div', { class: 'cr-bzeile' }, h('span', { class: 'cr-blabel' }, o), h('div', { class: 'cr-bspur' }, h('div', { style: { width: p + '%', background: FARB[i % 6] } })), h('span', {}, Math.round(p) + ' %')); })));
    box.append(h('div', { class: 'hint', style: { textAlign: 'center' } }, `${summe} Stimme${summe === 1 ? '' : 'n'} – antippen = eine Stimme`),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'big', onclick: () => { const i = verlauf.pop(); if (i != null) stimmen[i]--; zeichne(); } }, '↶ Stimme zurück'),
        h('button', { class: 'big' + (zeigen ? ' on' : ''), onclick: () => { zeigen = !zeigen; zeichne(); } }, zeigen ? '🙈 Ergebnis verbergen' : '📊 Ergebnis zeigen'),
        h('button', { class: 'big', onclick: () => { stimmen = opts.map(() => 0); verlauf = []; zeichne(); } }, '↺ Neu')));
  };
  w = fenster('📊 Umfrage', box, Math.max(20, innerWidth / 2 - 300), 80); zeichne();
};
function ergebnisAufTafel(frage, opts, stimmen) {
  const summe = stimmen.reduce((a, b) => a + b, 0) || 1, W = 900, zh = 70, top = frage ? 70 : 20, H = top + opts.length * zh + 20;
  const e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let s = frage ? `<text x="20" y="44" font-size="30" font-weight="700" fill="#1b1f2a">${e(frage)}</text>` : '';
  opts.forEach((o, i) => { const y = top + i * zh, p = stimmen[i] / summe, bw = 520 * p;
    s += `<text x="20" y="${y + 38}" font-size="28" fill="#1b1f2a">${e(o)}</text><rect x="230" y="${y + 12}" width="520" height="40" rx="10" fill="#eef0f6"/>`
      + `<rect x="230" y="${y + 12}" width="${bw.toFixed(1)}" height="40" rx="10" fill="${FARB[i % 6]}"/><text x="770" y="${y + 40}" font-size="26" fill="#1b1f2a">${stimmen[i]} (${Math.round(p * 100)} %)</text>`; });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Arial, sans-serif"><rect width="${W}" height="${H}" rx="16" fill="#fff"/>${s}</svg>`;
  T.addBild('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), W, H); T.toast('Ergebnis steht auf der Tafel.');
}

// ---------- Punktestand ----------
const TFARB = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
CR.punkte = () => {
  let teams = lies('teams', [{ n: 'Team Rot', p: 0 }, { n: 'Team Blau', p: 0 }]);
  const box = h('div', { class: 'cr-punkte' }), sichern = () => merke('teams', teams);
  const zeichne = () => {
    box.innerHTML = '';
    const reihe = h('div', { class: 'cr-teams' }, ...teams.map((t, i) => h('div', { class: 'cr-team', style: { borderColor: TFARB[i % 6] } },
      h('input', { type: 'text', class: 'cr-tname', value: t.n, style: { color: TFARB[i % 6] }, oninput: e => { t.n = e.target.value; sichern(); } }),
      h('div', { class: 'cr-tp' }, String(t.p)),
      h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'big', onclick: () => { t.p--; sichern(); zeichne(); } }, '−1'), h('button', { class: 'big prim', onclick: () => { t.p++; sichern(); zeichne(); } }, '+1'), h('button', { class: 'big', onclick: () => { t.p += 5; sichern(); zeichne(); } }, '+5')))));
    box.append(reihe, h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '8px' } },
      teams.length < 6 ? h('button', { class: 'big', onclick: () => { teams.push({ n: 'Team ' + (teams.length + 1), p: 0 }); sichern(); zeichne(); } }, '＋ Team') : '',
      teams.length > 2 ? h('button', { class: 'big', onclick: () => { teams.pop(); sichern(); zeichne(); } }, '− Team') : '',
      h('button', { class: 'big warn', onclick: async () => { if (await T.frage('Alle Punkte auf 0 setzen?', { ok: '↺ Auf 0' })) { teams.forEach(t => { t.p = 0; }); sichern(); zeichne(); } } }, '↺ Auf 0')));
  };
  zeichne(); fenster('🏆 Punktestand', box, Math.max(20, innerWidth / 2 - 330), 90);
};

// ---------- Mehrere Stoppuhren: alle gleichzeitig starten, jede einzeln stoppen (z. B. eine je Team) ----------
const SFARB = TFARB.concat(['#14b8a6', '#64748b']);
CR.stoppuhren = () => {
  let anz = T.clamp(lies('stoppAnz', 4), 2, 8), namen = lies('stoppNamen', []), start = null, zeiten = [], iv = 0;
  const box = h('div', { class: 'cr-stopp' });
  const fmt = ms => { const z = Math.floor(ms / 100), s = Math.floor(z / 10); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0') + ',' + (z % 10); };
  const laeuft = () => start != null && zeiten.some(z => z == null);
  const takt = () => { clearInterval(iv); if (laeuft()) iv = setInterval(aktualisiere, 100); };
  let anzeigen = [];
  const aktualisiere = () => { const jetzt = performance.now(); anzeigen.forEach((d, i) => { d.textContent = fmt(start == null ? 0 : zeiten[i] != null ? zeiten[i] : jetzt - start); }); if (!laeuft()) clearInterval(iv); };
  const platz = i => zeiten[i] == null ? '' : ['🥇', '🥈', '🥉'][zeiten.filter(z => z != null && z < zeiten[i]).length] || (zeiten.filter(z => z != null && z < zeiten[i]).length + 1) + '.';
  const zeichne = () => {
    box.innerHTML = ''; anzeigen = [];
    const karten = h('div', { class: 'cr-stoppuhren' }, ...Array.from({ length: anz }, (_, i) => {
      const farbe = SFARB[i], d = h('div', { class: 'cr-szeit' }); anzeigen.push(d);
      const gestoppt = start != null && zeiten[i] != null;
      return h('div', { class: 'cr-suhr' + (gestoppt ? ' aus' : ''), style: { borderColor: farbe } },
        h('div', { class: 'cr-skopf' }, h('span', { class: 'cr-snr', style: { background: farbe } }, String(i + 1)),
          h('input', { type: 'text', class: 'cr-sname', value: namen[i] || '', placeholder: 'Team …', oninput: e => { namen[i] = e.target.value; merke('stoppNamen', namen); } }),
          h('span', { class: 'cr-splatz' }, platz(i))),
        d,
        start == null ? h('div', { class: 'cr-shint' }, 'bereit') :
          gestoppt ? h('button', { class: 'big', title: 'Versehentlich gestoppt? Weiterlaufen lassen', onclick: () => { zeiten[i] = null; takt(); zeichne(); } }, '↩ weiter')
            : h('button', { class: 'big prim cr-sstopp', style: { background: farbe }, onclick: () => { zeiten[i] = performance.now() - start; zeichne(); } }, '⏹ Stopp'));
    }));
    box.append(karten, h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '10px' } },
      h('button', { class: 'big prim', onclick: () => { start = performance.now(); zeiten = Array(anz).fill(null); takt(); zeichne(); } }, start == null ? '▶ Alle starten' : '▶ Neu starten'),
      laeuft() ? h('button', { class: 'big', onclick: () => { const t = performance.now() - start; zeiten = zeiten.map(z => z == null ? t : z); zeichne(); } }, '⏹ Alle stoppen') : '',
      h('button', { class: 'big', onclick: () => { start = null; zeiten = []; clearInterval(iv); zeichne(); } }, '↺ Zurück'),
      anz < 8 && start == null ? h('button', { class: 'big', onclick: () => { anz++; merke('stoppAnz', anz); zeichne(); } }, '＋ Uhr') : '',
      anz > 2 && start == null ? h('button', { class: 'big', onclick: () => { anz--; merke('stoppAnz', anz); zeichne(); } }, '− Uhr') : ''));
    aktualisiere();
  };
  zeichne();
  const w = fenster('⏱ Stoppuhren', box, Math.max(20, innerWidth / 2 - 420), 80);
  w.onclose = () => clearInterval(iv);
};

// ---------- Gruppen bilden ----------
CR.gruppen = () => {
  const K = klassen(), namen = Object.keys(K); let klasse = lies('grKlasse', namen[0]); if (!K[klasse]) klasse = namen[0];
  let modus = 'groesse', zahl = 4, gruppen = [];
  const box = h('div', { class: 'cr-gruppen' }); let w = null;
  const mische = () => {
    const a = (K[klasse] || []).slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    const n = modus === 'groesse' ? Math.max(1, Math.ceil(a.length / zahl)) : Math.max(1, Math.min(zahl, a.length));
    gruppen = Array.from({ length: n }, () => []); a.forEach((s, i) => gruppen[i % n].push(s)); zeichne();
  };
  const zeichne = () => {
    box.innerHTML = '';
    if (!namen.length) { box.append(h('p', { class: 'hint' }, 'Zuerst unter „Namen ziehen“ eine Klassenliste anlegen (✏️ Liste).')); return; }
    box.append(h('div', { class: 'row' },
      h('select', { class: 'feld', onchange: e => { klasse = e.target.value; merke('grKlasse', klasse); gruppen = []; zeichne(); } }, ...namen.map(k => h('option', { value: k, selected: k === klasse }, k))),
      h('select', { class: 'feld', onchange: e => { modus = e.target.value; } }, h('option', { value: 'groesse', selected: modus === 'groesse' }, 'Personen pro Gruppe'), h('option', { value: 'anzahl', selected: modus === 'anzahl' }, 'Anzahl Gruppen')),
      h('input', { type: 'number', class: 'feld', value: zahl, min: 1, max: 30, style: { width: '80px' }, onchange: e => { zahl = Math.max(1, +e.target.value || 1); } }),
      h('button', { class: 'big prim', onclick: mische }, gruppen.length ? '🔀 Neu mischen' : '🔀 Gruppen bilden')));
    if (gruppen.length) box.append(h('div', { class: 'cr-glist' }, ...gruppen.map((g, i) => h('div', { class: 'cr-gkarte', style: { borderColor: TFARB[i % 6] } }, h('b', { style: { color: TFARB[i % 6] } }, 'Gruppe ' + (i + 1)), ...g.map(n => h('div', {}, n))))));
    if (w) w.kopf(gruppen.length ? h('button', { class: 'big', onclick: () => {
        const text = gruppen.map((g, i) => `Gruppe ${i + 1}: ${g.join(', ')}`).join('\n'), d = { text, size: Math.round(30 / T.page().view.z), c: T.isDark(T.page()) ? '#ffffff' : '#1a1a1a', fett: false }, m = T.textMetrics(d), [cx, cy] = T.viewCenter();
        T.snap(); T.addItem({ t: 'o', k: 'text', d, x: cx - m.w / 2, y: cy - m.h / 2, w: m.w, h: m.h, r: 0 }); T.toast('Gruppen stehen auf der Tafel.');
      } }, '⤴ Auf die Tafel') : []);
  };
  w = fenster('👥 Gruppen bilden', box, Math.max(20, innerWidth / 2 - 330), 80); zeichne();
};

// ---------- QR-Code (eigener Generator, funktioniert offline) ----------
CR.qr = () => {
  const inp = h('input', { type: 'text', class: 'feld', placeholder: 'Link oder Text, z. B. https://…', style: { width: '100%' } });
  const bild = h('div', { class: 'cr-qr' }), info = h('div', { class: 'hint', style: { textAlign: 'center', wordBreak: 'break-all' } });
  let svg = null;
  const neu = () => {
    const t = inp.value.trim(); bild.innerHTML = ''; info.textContent = ''; svg = null; if (!t) return;
    try { svg = T.qrSVG(t, 10); bild.innerHTML = svg; info.textContent = t; } catch (e) { info.textContent = 'Zu lang für einen QR-Code (bitte kürzeren Link verwenden).'; }
  };
  inp.addEventListener('input', neu);
  const box = h('div', { style: { width: 'min(520px, 86vw)' } }, inp, bild, info, h('div', { class: 'row', style: { justifyContent: 'center' } },
    h('button', { class: 'big prim', onclick: () => { if (!svg) return; const n = T.qrMatrix(inp.value.trim()).length + 8, s = n * 10; T.addBild('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), s, s); T.toast('QR-Code steht auf der Tafel.'); } }, '⤴ Auf die Tafel')));
  fenster('🔳 QR-Code', box, Math.max(20, innerWidth / 2 - 280), 80); setTimeout(() => inp.focus(), 50);
};

// QR-Kodierung (Byte-Modus, Fehlerkorrektur M, Version 1–15) nach ISO/IEC 18004
const ECC_M = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24], BLOECKE_M = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10];
const gfMul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 255; };
const rsDivisor = grad => { const r = new Array(grad).fill(0); r[grad - 1] = 1; let w = 1; for (let i = 0; i < grad; i++) { for (let j = 0; j < r.length; j++) { r[j] = gfMul(r[j], w); if (j + 1 < r.length) r[j] ^= r[j + 1]; } w = gfMul(w, 2); } return r; };
const rsRest = (daten, div) => { const r = div.map(() => 0); for (const b of daten) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= gfMul(c, f); }); } return r; };
const rohModule = v => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const na = Math.floor(v / 7) + 2; r -= (25 * na - 10) * na - 55; if (v >= 7) r -= 36; } return r; };
const datenWorte = v => Math.floor(rohModule(v) / 8) - ECC_M[v] * BLOECKE_M[v];
T.qrMatrix = text => {
  const bytes = Array.from(new TextEncoder().encode(text));
  let v = 1; for (; v <= 15; v++) if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= datenWorte(v) * 8) break;
  if (v > 15) throw new Error('zu lang');
  // Bitfolge
  const bits = []; const put = (wert, n) => { for (let i = n - 1; i >= 0; i--) bits.push((wert >>> i) & 1); };
  put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
  const kap = datenWorte(v) * 8; put(0, Math.min(4, kap - bits.length)); put(0, (8 - bits.length % 8) % 8);
  for (let p = 0xEC; bits.length < kap; p ^= 0xEC ^ 0x11) put(p, 8);
  const daten = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; daten.push(b); }
  // Fehlerkorrektur und Verschachtelung
  const nb = BLOECKE_M[v], ecc = ECC_M[v], roh = Math.floor(rohModule(v) / 8), kurz = nb - roh % nb, kurzLen = Math.floor(roh / nb), div = rsDivisor(ecc);
  const bloecke = []; for (let i = 0, k = 0; i < nb; i++) { const d = daten.slice(k, k + kurzLen - ecc + (i < kurz ? 0 : 1)); k += d.length; const e = rsRest(d, div); if (i < kurz) d.push(0); bloecke.push(d.concat(e)); }
  const worte = []; for (let i = 0; i < bloecke[0].length; i++) bloecke.forEach((b, j) => { if (i !== kurzLen - ecc || j >= kurz) worte.push(b[i]); });
  // Module
  const n = v * 4 + 17, M = Array.from({ length: n }, () => new Array(n).fill(false)), F = Array.from({ length: n }, () => new Array(n).fill(false));
  const setz = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
  for (let i = 0; i < n; i++) { setz(6, i, i % 2 === 0); setz(i, 6, i % 2 === 0); }
  const finder = (x, y) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy; if (xx >= 0 && xx < n && yy >= 0 && yy < n) setz(xx, yy, d !== 2 && d !== 4); } };
  finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
  if (v > 1) {
    const na = Math.floor(v / 7) + 2, schritt = Math.ceil((v * 4 + 4) / (na * 2 - 2)) * 2, pos = [6];
    for (let p = n - 7; pos.length < na; p -= schritt) pos.splice(1, 0, p);
    pos.forEach((a, i) => pos.forEach((b, j) => { if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setz(a + dx, b + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }));
  }
  const format = maske => { const d = (0 << 3) | maske; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); const b = ((d << 10) | r) ^ 0x5412, bit = i => ((b >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) setz(8, i, bit(i)); setz(8, 7, bit(6)); setz(8, 8, bit(7)); setz(7, 8, bit(8)); for (let i = 9; i < 15; i++) setz(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) setz(n - 1 - i, 8, bit(i)); for (let i = 8; i < 15; i++) setz(8, n - 15 + i, bit(i)); setz(8, n - 8, true); };
  format(0);
  if (v >= 7) { let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25); const b = (v << 12) | r;
    for (let i = 0; i < 18; i++) { const bit = ((b >>> i) & 1) === 1, a = n - 11 + i % 3, c = Math.floor(i / 3); setz(a, c, bit); setz(c, a, bit); } }
  let i = 0;
  for (let rechts = n - 1; rechts >= 1; rechts -= 2) {
    if (rechts === 6) rechts = 5;
    for (let s = 0; s < n; s++) for (let j = 0; j < 2; j++) {
      const x = rechts - j, hoch = ((rechts + 1) & 2) === 0, y = hoch ? n - 1 - s : s;
      if (!F[y][x] && i < worte.length * 8) { M[y][x] = ((worte[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
    }
  }
  const MASKEN = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => x * y % 2 + x * y % 3 === 0, (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
  const anwenden = m => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!F[y][x] && MASKEN[m](x, y)) M[y][x] = !M[y][x]; };
  const strafe = () => { let p = 0, dunkel = 0;
    for (let y = 0; y < n; y++) { let lauf = 1, lx = 1; for (let x = 0; x < n; x++) { if (M[y][x]) dunkel++;
      if (x) { if (M[y][x] === M[y][x - 1]) { lauf++; if (lauf === 5) p += 3; else if (lauf > 5) p++; } else lauf = 1; }
      if (y) { if (M[y][x] === M[y - 1][x]) { lx++; } } } }
    for (let x = 0; x < n; x++) { let lauf = 1; for (let y = 1; y < n; y++) { if (M[y][x] === M[y - 1][x]) { lauf++; if (lauf === 5) p += 3; else if (lauf > 5) p++; } else lauf = 1; } }
    for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) { const c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3; }
    p += Math.floor(Math.abs(dunkel * 20 - n * n * 10) / (n * n)) * 10; return p; };
  let beste = 0, besteP = Infinity;
  for (let m = 0; m < 8; m++) { anwenden(m); format(m); const p = strafe(); if (p < besteP) { besteP = p; beste = m; } anwenden(m); }
  anwenden(beste); format(beste);
  return M;
};
T.qrSVG = (text, modul = 10) => {
  const M = T.qrMatrix(text), n = M.length, r = 4, s = (n + 2 * r) * modul; let p = '';
  M.forEach((zeile, y) => zeile.forEach((d, x) => { if (d) p += `M${(x + r) * modul} ${(y + r) * modul}h${modul}v${modul}h-${modul}z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges"><rect width="${s}" height="${s}" fill="#fff"/><path d="${p}" fill="#000"/></svg>`;
};
})();
