// Tafel-App – 📝 Gerüste als bearbeitbare Vorlagen (Einfügen › Mathe, Sprache, Naturwissenschaft)
// Ein Gerüst: Titel, Situation/Aufgabe, Zeilen „Schritt | Leitfrage | Satzanfang“ mit Schreibfeld, Wortspeicher und Checkliste.
// Alles lässt sich mit „✏️ Bearbeiten“ ändern; Hilfen wählbar (★ Satzanfänge · ★★ Leitfragen · ★★★ ohne Hilfen).
// In die Schreibfelder schreibt man mit dem Stift – die Schrift wandert beim Ändern mit (Felder = „teile“).
'use strict';
(function () {
const { doc, tx, f, esc } = T._svg, CM = T.CM, B = T.BAUSTEINE;
const mctx = document.createElement('canvas').getContext('2d');
const breite = (t, fs, fett) => { mctx.font = `${fett ? 700 : 400} ${fs}px Segoe UI`; return mctx.measureText(t).width; };
function umbruch(text, maxW, fs, fett) {
  const out = [];
  for (const abs of String(text || '').split(/\n|\|/)) { let z = ''; for (const w of abs.split(/\s+/).filter(Boolean)) { const n = z ? z + ' ' + w : w; if (z && breite(n, fs, fett) > maxW) { out.push(z); z = w; } else z = n; } out.push(z); }
  return out.filter((z, i) => z || i === 0);
}
const block = (x, y, zeilen, fs, farbe, fett, lh) => zeilen.map((z, i) => tx(x, y + i * lh, z, farbe, fs, 'start', fett ? 'font-weight="700"' : '')).join('');
const kasten = (x, y, w, h, fill, rand, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="10" fill="${fill}" stroke="${rand}" stroke-width="2" ${extra}/>`;
const zeilenVon = s => String(s || '').split(/\r?\n/).filter(l => l.trim()).map(l => l.split(';').map(x => x.trim()));

// Modus je Hilfe-Feld: 's' Satzanfang, 'f' Leitfrage, '' leer (selbst ausfüllen). d.hz[i] überschreibt die Grundeinstellung d.hilfe.
const modus = (d, i) => { const h = d.hz && d.hz[i] != null ? d.hz[i] : d.hilfe === 'satz' ? 's' : d.hilfe === 'frage' ? 'f' : ''; return h; };
B.geruest = { name: 'Gerüst', gruppe: 'Struktur',
  def: { titel: 'Schreibplan', situation: '', aufgaben: '', zeilen: 'Einleitung;Worum geht es?;Es geht um …\nHauptteil;Was ist wichtig?;Zuerst … dann …\nSchluss;Was ist meine Meinung?;Insgesamt …', hilfe: 'leer', hz: {}, wort: '', zeigeWort: false, check: '', zeigeCheck: false, notiz: 13 },
  felder: [{ k: 'titel', l: 'Titel', typ: 'text' }, { k: 'situation', l: 'Aufgabe / Situation (leer = Feld zum Hineinschreiben; | = neue Zeile)', typ: 'text' },
    { k: 'aufgaben', l: 'Aufgaben zur Auswahl (je Zeile eine – im Menü „📋 Aufgabe wählen“)', typ: 'liste' },
    { k: 'zeilen', l: 'Schritte', typ: 'tabelle', kopf: ['Schritt', 'Leitfrage (★★)', 'Satzanfang (★)'], spalten: 3, fest: 3 },
    { k: 'hilfe', l: 'Hilfen (alle Felder)', typ: 'auswahl', opts: [['leer', '◻ leer – selbst ausfüllen'], ['satz', '★ Satzanfänge'], ['frage', '★★ Leitfragen'], ['ohne', '★★★ ohne Hilfe-Spalte']] },
    { k: 'zeigeWort', l: 'Wortspeicher zeigen', typ: 'check' }, { k: 'wort', l: 'Wortspeicher', typ: 'text' },
    { k: 'zeigeCheck', l: 'Checkliste zeigen', typ: 'check' }, { k: 'check', l: 'Checkliste', typ: 'liste' },
    { k: 'notiz', l: 'Breite des Schreibfelds (cm)', typ: 'zahl', min: 5, max: 30 }],
  gen: (d, P) => {
    P = T.palette(false); // Vorlagen immer weiß hinterlegt, auch auf dunkler Tafel
    const hell = P.ink === '#1a1a1a', ink = P.ink, grau = hell ? '#9aa3b2' : '#aab', m = 8, fs = 21, lh = fs * 1.3;
    const zeilen = zeilenVon(d.zeilen), hilfe = d.hilfe || 'leer';
    const wS = 230, wH = hilfe === 'ohne' ? 0 : 380, wN = T.clamp(+d.notiz || 13, 3, 40) * CM, gap = 12;
    const check = d.zeigeCheck ? String(d.check || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [], wC = check.length ? 400 : 0;
    const W = m * 2 + wS + (wH ? wH + gap : 0) + gap + wN + (wC ? 24 + wC : 0);
    let s = '', y = m; const teile = [];
    const titel = umbruch(d.titel || 'Titel', W - 2 * m, 30, true); s += block(m, y + 18, titel, 30, hell ? '#3c3cb4' : '#c7c7ff', true, 38); y += titel.length * 38 + 10;
    { // Aufgabe: gewählt/eingetippt – oder leeres Feld zum Hineinschreiben
      const txt = String(d.situation || '').trim(), z = txt ? umbruch(txt, W - 2 * m - 24, fs) : [], hh = txt ? z.length * lh + 46 : 120;
      s += kasten(m, y, W - 2 * m, hh, txt ? (hell ? '#e3f2fd' : 'rgba(100,160,255,.15)') : 'none', hell ? '#90caf9' : 'rgba(255,255,255,.35)', txt ? '' : 'stroke-dasharray="7 6"');
      s += tx(m + 12, y + 18, 'Aufgabe', hell ? '#1565c0' : '#9cc8ff', 17, 'start', 'font-weight="700"');
      s += txt ? block(m + 12, y + 44, z, fs, ink, false, lh) : tx(m + 12, y + 46, '✎ hineinschreiben – oder antippen › „📋 Aufgabe wählen“', grau, 17, 'start');
      teile.push({ id: 'sit', x: m, y, w: W - 2 * m, h: hh }); y += hh + 12;
    }
    if (d.zeigeWort && String(d.wort || '').trim()) {
      const z = umbruch('Wortspeicher: ' + d.wort, W - 2 * m - 24, 19), hh = z.length * 25 + 20;
      s += kasten(m, y, W - 2 * m, hh, hell ? '#fff8e1' : 'rgba(255,220,120,.15)', hell ? '#ffe082' : 'rgba(255,255,255,.35)', 'stroke-dasharray="6 5"') + block(m + 12, y + 22, z, 19, ink, false, 25); y += hh + 12;
    }
    const y0 = y, xH = m + wS + gap, xN = xH + (wH ? wH + gap : 0);
    zeilen.forEach((r, i) => {
      const mo = modus(d, i), sch = umbruch(r[0] || '', wS - 24, fs, true), hTxt = mo === 's' ? (r[2] || '') : mo === 'f' ? (r[1] || '') : '', hz = hTxt ? umbruch(hTxt, wH - 24, 20) : [];
      const hh = Math.max(96, sch.length * lh + 28, hz.length * 26 + 28);
      s += kasten(m, y, wS, hh, hell ? '#ede7f6' : 'rgba(180,140,255,.18)', hell ? '#b39ddb' : 'rgba(255,255,255,.35)') + block(m + 12, y + 26, sch, fs, ink, true, lh);
      if (wH) {
        s += kasten(xH, y, wH, hh, mo === 's' ? (hell ? '#fffde7' : 'rgba(255,240,150,.12)') : mo === 'f' ? (hell ? '#f1f3f5' : 'rgba(255,255,255,.08)') : 'none', hell ? '#d6d9de' : 'rgba(255,255,255,.3)', mo ? '' : 'stroke-dasharray="4 5"');
        s += hTxt ? block(xH + 12, y + 26, hz, 20, hell ? '#444' : '#ddd', false, 26) : tx(xH + 12, y + 20, '✎', grau, 18, 'start');
        teile.push({ id: 'h' + i, x: xH, y, w: wH, h: hh });
      }
      s += kasten(xN, y, wN, hh, 'none', ink, 'stroke-dasharray="7 6"') + tx(xN + 12, y + 20, '✎', grau, 18, 'start');
      teile.push({ id: 'z' + i, x: xN, y, w: wN, h: hh });
      y += hh + 10;
    });
    let yc = y0;
    if (wC) {
      const xc = W - m - wC; s += tx(xc, yc + 16, '✔ Checkliste', hell ? '#2e7d32' : '#9be7a0', 22, 'start', 'font-weight="700"'); yc += 36;
      check.forEach(t => { const z = umbruch(t, wC - 44, 19); s += `<rect x="${f(xc)}" y="${f(yc)}" width="22" height="22" rx="4" fill="none" stroke="${ink}" stroke-width="2"/>` + block(xc + 32, yc + 12, z, 19, ink, false, 24); yc += Math.max(30, z.length * 24 + 8); });
    }
    const H = Math.max(y, yc) + m;
    return { svg: doc(W, H, `<rect x="0" y="0" width="${f(W)}" height="${f(H)}" rx="12" fill="#ffffff"/>` + s), w: W, h: H, teile };
  } };
// 📋 Aufgabe aus der Liste wählen (oder leer lassen = mit dem Stift hineinschreiben)
function aufgabeWaehlen(o) {
  const d = { ...B.geruest.def, ...o.d }, liste = String(d.aufgaben || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const setze = txt => { T.closeDlg(); T.bausteinAendern(T.page().items.find(i => i.id === o.id) || o, { f: dd => ({ d: { ...dd, situation: txt } }) }); };
  const eigene = h('input', { class: 'feld', placeholder: 'Eigene Aufgabe eintippen …', style: { width: '100%' } });
  T.openDlg([h('h2', {}, '📋 Aufgabe wählen'),
    liste.length ? h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch' } }, ...liste.map(a => h('button', { class: 'big', style: { textAlign: 'left', justifyContent: 'flex-start', whiteSpace: 'normal', height: 'auto', padding: '10px 14px' }, onclick: () => setze(a) }, a.replace(/\|/g, ' – ')))) : h('p', { class: 'hint' }, 'Für dieses Gerüst sind noch keine Aufgaben hinterlegt – unter „✏️ Bearbeiten › Aufgaben zur Auswahl“ ergänzen.'),
    h('label', { class: 'fld' }, 'Oder selbst', eigene),
    h('div', { class: 'acts' }, h('button', { class: 'big', title: 'Feld leer lassen – mit dem Stift hineinschreiben', onclick: () => setze('') }, '✎ Leer (Stift)'), h('button', { class: 'big prim', onclick: () => { if (eigene.value.trim()) setze(eigene.value.trim()); } }, '✔ Übernehmen'))], true);
}
const h = T.h;
const alleHz = (d, wert) => { const n = zeilenVon(d.zeilen).length, hz = {}; for (let i = 0; i < n; i++) hz[i] = wert; return hz; };
B.geruest.schnell = [
  { l: '📋 Aufgabe wählen', aus: o => aufgabeWaehlen(o) },
  { l: '★ alle Satzanfänge', f: d => ({ d: { ...d, hilfe: 'satz', hz: {} } }) }, { l: '★★ alle Leitfragen', f: d => ({ d: { ...d, hilfe: 'frage', hz: {} } }) },
  { l: '◻ Hilfen leer', f: d => ({ d: { ...d, hilfe: 'leer', hz: {} } }) }, { l: '★★★ ohne Hilfe-Spalte', f: d => ({ d: { ...d, hilfe: 'ohne', hz: {} } }) },
  { l: '📝 Wortspeicher ein/aus', f: d => ({ d: { ...d, zeigeWort: !d.zeigeWort } }) }, { l: '✔ Checkliste ein/aus', f: d => ({ d: { ...d, zeigeCheck: !d.zeigeCheck } }) }];
// Feld für Feld: Hilfe-Feld antippen › Satzanfang / Leitfrage / leer; Aufgaben-Feld antippen › Aufgabe wählen
B.geruest.teil = (d, id) => {
  if (id === 'sit') return [{ l: '📋 Aufgabe wählen …', aus: o => aufgabeWaehlen(o) }, { l: '✎ Aufgabe leeren', f: dd => ({ d: { ...dd, situation: '' } }) }];
  if (id[0] === 'h') { const i = +id.slice(1), mit = v => dd => ({ d: { ...dd, hz: { ...(dd.hz || {}), [i]: v } } });
    return [{ l: '★ Satzanfang', f: mit('s') }, { l: '★★ Leitfrage', f: mit('f') }, { l: '◻ leer', f: mit('') }]; }
  return [];
};
// ---------- Vorlagen je Fach (alles selbst formuliert, frei änderbar) ----------
const Z = a => a.map(r => r.join(';')).join('\n'), C = a => a.join('\n');
const FORMELL = (haupt, satz) => [['Betreff', 'Worum geht es – in wenigen Wörtern?', 'Anfrage: … / Bitte um …'], ['Anrede', 'Wie spreche ich jemanden an, den ich nicht kenne?', 'Sehr geehrte Damen und Herren, / Sehr geehrte Frau …,'],
  ['Einleitung', 'Wer bin ich? Warum schreibe ich?', 'Ich bin Schülerin/Schüler der Klasse … und schreibe Ihnen, weil …'], ['Hauptteil', haupt, satz],
  ['Schluss', 'Was erwarte ich? Wie bedanke ich mich?', 'Über eine baldige Antwort würden wir uns sehr freuen.'], ['Grußformel', 'Wie verabschiede ich mich formell?', 'Mit freundlichen Grüßen …']];
const FORMELL_CHECK = ['Der Betreff passt zum Anliegen.', 'Anrede und Gruß sind formell.', '„Sie“, „Ihnen“, „Ihr“ sind großgeschrieben.', 'Alle Punkte aus der Situation kommen vor.', 'Jeder Gedanke hat einen eigenen Absatz.'];
T.GERUEST_VORLAGEN = {
  Mathe: [
    ['🧮', 'Fermi-Aufgabe (Gerüst)', { titel: 'Fermi-Frage: Wie viele Liter Wasser trinkt eure Klasse in einem Schuljahr?', situation: 'Stützwerte: Ein Glas fasst etwa 0,2 l. Ein Schuljahr hat etwa 190 Schultage.',
      zeilen: Z([['1. Frage klären', 'Was genau soll ich schätzen? In welcher Einheit?', 'Gesucht ist …'], ['2. Annahmen', 'Welche Zahlen weiß oder schätze ich?', 'Ich nehme an, dass …'], ['3. Rechnen', 'Wie hängen meine Zahlen zusammen?', 'Ich rechne: … · … = …'], ['4. Ergebnis', 'Wie lautet die Antwort, sinnvoll gerundet?', 'Es sind ungefähr …'], ['5. Prüfen', 'Ist das realistisch? Was ändert sich bei anderen Annahmen?', 'Das ist realistisch, weil …']]),
      wort: 'ungefähr · etwa · Annahme · pro · insgesamt · runden · realistisch', check: C(['Meine Annahmen stehen da – mit Einheit.', 'Jeder Rechenschritt ist nachvollziehbar.', 'Das Ergebnis ist sinnvoll gerundet.', 'Ich habe geprüft, ob es realistisch ist.']) }],
    ['📝', 'Sachaufgabe (Gerüst)', { titel: 'Sachaufgabe: Frage – Rechnung – Antwortsatz', situation: 'Tim fährt mit dem Rad zu seiner Oma. Die Strecke ist 12 km lang. Er fährt im Durchschnitt 15 km pro Stunde. Wie lange braucht Tim?',
      zeilen: Z([['Frage', 'Was ist gesucht? Mit welcher Einheit?', 'Gesucht ist, …'], ['Angaben', 'Welche Angaben brauche ich?', 'Ich weiß: …'], ['Rechnung', 'Welche Schritte? In welcher Reihenfolge?', 'Zuerst rechne ich …, dann …'], ['Ergebnis', 'Was kommt heraus – mit Einheit?', 'Das Ergebnis ist …'], ['Antwortsatz', 'Passt der Satz zur Frage?', 'Tim braucht …'], ['Probe', 'Ist das Ergebnis sinnvoll? Überschlag?', 'Überschlag: …']]),
      wort: 'gesucht · gegeben · insgesamt · pro · je · zusammen · übrig · Überschlag', check: C(['Ich habe die Frage unterstrichen.', 'Jede Zahl hat eine Einheit.', 'Der Antwortsatz beantwortet die Frage.', 'Ich habe das Ergebnis geprüft.']) }]],
  Sprachen: [
    ['⚖', 'Schreibplan Erörterung', { titel: 'Schreibplan Erörterung: Sollen Handys in den Pausen verboten werden?',
      zeilen: Z([['Einleitung', 'Worum geht es? Warum ist das Thema wichtig?', 'Immer wieder wird diskutiert, ob …'], ['Argument 1', 'Behauptung – Begründung – Beispiel', 'Ein wichtiges Argument dafür ist, dass …'], ['Argument 2', 'Was spricht noch dafür oder dagegen?', 'Außerdem spricht dafür, dass …'], ['Gegenargument', 'Was sagen die anderen? Wie entkräfte ich das?', 'Zwar …, aber …'], ['Schluss', 'Was ist meine Meinung? Was schlage ich vor?', 'Insgesamt bin ich der Meinung, dass …']]),
      wort: 'außerdem · zudem · deshalb · folglich · zum Beispiel · einerseits – andererseits · zwar – aber · meiner Meinung nach', check: C(['Die Einleitung nennt das Thema.', 'Jedes Argument hat eine Begründung und ein Beispiel.', 'Ich habe ein Gegenargument entkräftet.', 'Der Schluss nennt meine Meinung.', 'Ich habe Absätze und Verknüpfungswörter benutzt.']) }],
    ['✉', 'Schreibplan formelle E-Mail', { titel: 'Schreibplan: formelle E-Mail (Anfrage)', situation: 'Eure Klasse (24 Kinder, 2 Lehrkräfte) möchte im Mai drei Nächte in einer Jugendherberge verbringen. Schreibe im Namen der Klasse eine E-Mail und frage nach freien Zimmern, Preisen und Freizeitangeboten.',
      zeilen: Z(FORMELL('Welche Fragen habe ich? (je Frage ein Satz oder Absatz)', 'Könnten Sie uns bitte mitteilen, … · Außerdem möchten wir wissen, …')), wort: 'Sie/Ihnen/Ihr (groß) · Könnten Sie … · Wir würden gern … · Vielen Dank im Voraus · Mit freundlichen Grüßen', check: C(FORMELL_CHECK) }],
    ['📮', 'Schreibplan formeller Brief', { titel: 'Schreibplan: formeller Brief (Bitte an die Bürgermeisterin)', situation: 'Vor eurer Schule gibt es keinen Radweg. Morgens wird es dort oft gefährlich. Beschreibe das Problem und bitte darum, etwas zu ändern.',
      zeilen: Z(FORMELL('Was ist das Problem? Welche Gründe und Beispiele habe ich? Was schlage ich vor?', 'Jeden Morgen beobachten wir, dass … · Deshalb bitten wir Sie, …')), wort: 'Sie/Ihnen/Ihr (groß) · Wir bitten Sie, … · Es wäre sehr hilfreich, wenn … · Gefahr · Sicherheit', check: C(FORMELL_CHECK) }],
    ['💌', 'Schreibplan persönliche E-Mail', { titel: 'Schreibplan: persönliche E-Mail', situation: 'Du bist umgezogen. Schreibe deiner besten Freundin oder deinem besten Freund aus der alten Klasse: Wie ist es in der neuen Schule? Was vermisst du?',
      zeilen: Z([['Anrede', 'Wie begrüße ich jemanden, den ich gut kenne?', 'Hallo …, / Liebe …,'], ['Einstieg', 'Wie fange ich persönlich an?', 'Lange nichts gehört! Wie geht es dir?'], ['Neuigkeiten', 'Was ist passiert? Wie fühle ich mich?', 'Stell dir vor, … · Am besten gefällt mir …'], ['Fragen', 'Was möchte ich wissen?', 'Wie ist es bei euch …?'], ['Schluss', 'Was wünsche oder plane ich?', 'Schreib mir bald zurück!'], ['Gruß', 'Wie verabschiede ich mich persönlich?', 'Liebe Grüße …']]),
      wort: 'du/dich/dein · Stell dir vor · Ich vermisse … · Am liebsten … · Bis bald', check: C(['Anrede und Gruß sind persönlich.', 'Ich erzähle von mindestens zwei Erlebnissen.', 'Ich schreibe, wie ich mich fühle.', 'Ich stelle mindestens eine Frage.']) }],
    ['🌐', 'Schreibplan Blogbeitrag', { titel: 'Schreibplan: Blogbeitrag für die Schulhomepage', situation: '„Tipps für die neuen Fünftklässler“ – schreibe so, dass sich die neuen Kinder angesprochen fühlen und gut informiert sind.',
      zeilen: Z([['Überschrift', 'Was macht neugierig?', 'So klappt der Start: …'], ['Einstieg', 'Wie spreche ich die Leser an?', 'Ihr seid neu an unserer Schule? Dann …'], ['Tipp 1', 'Was ist am wichtigsten? Warum?', 'Mein erster Tipp: … Denn …'], ['Tipp 2 und 3', 'Was hilft noch? Ein Beispiel?', 'Außerdem solltet ihr … Ich habe erlebt, dass …'], ['Schluss', 'Wie ende ich freundlich?', 'Probiert es aus und …']]),
      wort: 'ihr/euch · zum Beispiel · deshalb · außerdem · am wichtigsten ist', check: C(['Die Überschrift macht neugierig.', 'Ich spreche die Leser direkt an.', 'Jeder Tipp hat eine Begründung.', 'Die Sprache passt zu den Lesern.']) }],
    ['🇬🇧', 'Writing frame (email)', { titel: 'Writing frame: an email to a friend', situation: 'Write an email to your English friend Sam about your last weekend. (60–80 words)',
      zeilen: Z([['Greeting', 'How do you start?', 'Hi Sam,'], ['Opening', 'Why are you writing?', 'Thanks for your email! I want to tell you about …'], ['What did you do?', 'Where? Who with?', 'On Saturday I … · After that we …'], ['How did you like it?', 'great · fun · boring – why?', 'It was great because …'], ['Question', 'What do you want to know?', 'What did you do at the weekend?'], ['Closing', 'How do you end?', 'Write back soon! Love, …']]),
      wort: 'went · played · visited · saw · because · after that · then', check: C(['greeting and sign-off', 'simple past: went, played, saw …', 'I said how I felt – and why.', 'a question for Sam', '60–80 words']) }]],
  NaWi: [
    ['🔬', 'Versuch planen (Gerüst)', { titel: 'Versuch planen: Löst sich Zucker in warmem Wasser schneller als in kaltem?',
      zeilen: Z([['Frage', 'Was will ich herausfinden?', 'Ich will herausfinden, ob …'], ['Vermutung', 'Was erwarte ich – und warum?', 'Ich vermute, dass …, weil …'], ['Variablen', 'Was verändere ich, was messe ich, was halte ich gleich?', 'Ich verändere … · Ich messe … · Gleich bleibt …'], ['Durchführung', 'Welche Schritte? Welche Geräte?', 'Zuerst … · Dann … · Zum Schluss …'], ['Beobachtung', 'Was sehe oder messe ich? (noch ohne Erklärung)', 'Ich beobachte, dass …'], ['Auswertung', 'Stimmt die Vermutung? Wie erkläre ich das?', 'Die Vermutung stimmt (nicht), denn …']]),
      wort: 'verändern · messen · gleich halten · Messgerät · Stoppuhr · Thermometer · wiederholen · Vermutung · Beobachtung', check: C(['Ich verändere nur eine Größe.', 'Ich weiß, was ich messe – mit Einheit und Messgerät.', 'Alles andere halte ich gleich.', 'Ich wiederhole die Messung.', 'Beobachtung und Deutung sind getrennt.']) }]]
};
// Vorlagen kommen (nahezu) LEER auf die Tafel: Aufgaben stehen nur zur Auswahl bereit („📋 Aufgabe wählen“), Hilfen leer, Wortspeicher/Checkliste aus.
const MEHR = {
  'Fermi-Aufgabe (Gerüst)': ['Wie viele Liter Wasser trinkt eure Klasse in einem Schuljahr? | Stützwerte: Ein Glas fasst etwa 0,2 l. Ein Schuljahr hat etwa 190 Schultage.',
    'Wie viele Schritte gehst du in einem Schuljahr auf deinem Schulweg? | Stützwerte: Ein Schritt ist etwa 60 cm lang. Ein Schuljahr hat etwa 190 Schultage.',
    'Wie viele Autos stehen in einem 10 km langen Stau auf einer dreispurigen Autobahn? | Stützwerte: Ein Auto ist etwa 4,5 m lang, dazwischen etwa 2 m Platz.',
    'Wie viele Blätter Papier verbraucht eure Klasse in einem Schuljahr? | Stützwerte: Ein Heft hat etwa 16 Blätter, ein Block etwa 80.',
    'Wie viele Stunden hast du in deinem Leben schon geschlafen? | Stützwerte: Schulkinder schlafen etwa 10 Stunden am Tag.'],
  'Sachaufgabe (Gerüst)': ['Tim fährt mit dem Rad zu seiner Oma. Die Strecke ist 12 km lang. Er fährt im Durchschnitt 15 km pro Stunde. Wie lange braucht Tim?',
    'Lena kauft 4 Hefte zu je 1,20 € und einen Füller für 8,50 €. Sie bezahlt mit einem 20-€-Schein. Wie viel Wechselgeld bekommt sie?',
    'Mia möchte ein Spiel für 59,99 € kaufen. Sie hat 25 € gespart und legt jede Woche 7,50 € dazu. Nach wie vielen Wochen kann sie es kaufen?'],
  'Schreibplan Erörterung': ['Sollen Handys in den Pausen verboten werden?', 'Sollte es an unserer Schule eine einheitliche Schulkleidung geben?', 'Sollen Hausaufgaben abgeschafft werden?', 'Sollte der Unterricht erst um 9 Uhr beginnen?'],
  'Versuch planen (Gerüst)': ['Löst sich Zucker in warmem Wasser schneller als in kaltem?', 'Hängt die Schwingungsdauer eines Pendels von der Fadenlänge ab?', 'Welcher Stoff hält heißes Wasser am längsten warm: Alufolie, Wolle oder Zeitungspapier?', 'Brauchen Kressesamen Wasser zum Keimen?']
};
for (const liste of Object.values(T.GERUEST_VORLAGEN)) for (const v of liste) {
  const d = v[2], frage = (d.titel.match(/^[^:]+:\s*(.+\?)$/) || [])[1];
  if (frage) d.titel = d.titel.replace(/:\s*.+\?$/, '');
  const auswahl = MEHR[v[1]] || [d.situation || frage].filter(Boolean);
  d.aufgaben = auswahl.join('\n'); d.situation = ''; d.hilfe = 'leer'; d.hz = {}; d.zeigeWort = false; d.zeigeCheck = false;
}
})();
