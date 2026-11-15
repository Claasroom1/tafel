// Tafel-App – 👥 Gemeinsamer Ordner (zusätzlich zum persönlichen Ablageordner)
//   · Persönlicher Ordner = der bisherige Ablageordner (F.root), z. B. IServ › Eigene Dateien › Tafel-App
//   · Gemeinsamer Ordner (freiwillig) = z. B. IServ-Gruppenordner „Lehrkräfte › Tafel-App“ – dorthin kommt NUR, was ausdrücklich geteilt wird:
//     gemeinsame Vorlagen, geteilte Klassenlisten, Sitzpläne und Tafeln
//   · Ohne gemeinsamen Ordner bleibt alles wie bisher (Geteiltes liegt im persönlichen Ordner)
//   · F.gdir(parts, create) = wie F.dir, aber im gemeinsamen Ordner, falls verbunden
//   · Gemerkt je Lehrkraft auf diesem Gerät (IndexedDB „gemRoot:<Name>“); nach einem Neustart fragt der Browser einmal nach der Erlaubnis
// Laden nach speicher.js und oberflaeche.js (braucht T.ablage, T.openDlg, T.frage, T.ladeTafel).
'use strict';
(function () {
const F = T.ablage; if (!F) return;
const h = T.h, lk = () => (T.opts && T.opts.lehrkraft) || '';
const schluessel = name => name ? 'gemRoot:' + F.safe(name) : 'gemRoot';
const toast = (t, ms) => T.toast && T.toast(t, ms);

/* ---------- Ordner merken, wiederherstellen, freigeben ---------- */
let gemH = null, gemPend = null, gemFuer = null, geladenFuer = null, stand = 0; /* stand: jede Änderung zählt hoch – ein älteres Laden überschreibt sie nicht */
async function laden(name, nr) {
  let hd = null;
  try { hd = await T.idbGet(schluessel(name)); } catch (e) { hd = null; }
  if (nr !== stand) return; /* inzwischen andere Lehrkraft oder neu verbunden */
  let p = null;
  if (hd && hd.queryPermission) { try { p = await hd.queryPermission({ mode: 'readwrite' }); } catch (e) { p = null; } }
  if (nr !== stand || !hd) return;
  if (p === 'granted') gemH = hd; else gemPend = hd;
  auffrischen();
}
const pruefe = () => { const n = lk(); if (geladenFuer === n || !F.supported || F.intern) return; geladenFuer = n; gemH = null; gemPend = null; gemFuer = n; laden(n, ++stand); };
Object.defineProperty(F, 'gemRoot', { configurable: true,
  get() { pruefe(); return gemFuer === lk() ? gemH : null; },
  set(v) { stand++; gemH = v || null; gemPend = null; gemFuer = lk(); geladenFuer = lk(); } });
F.gemPending = () => { pruefe(); return gemFuer === lk() && !gemH ? gemPend : null; };
F.gemName = () => { pruefe(); return gemFuer === lk() ? (gemH || gemPend || {}).name || '' : ''; };
F.gdir = async (parts, create) => {
  let d = F.gemRoot || F.root;
  if (!d) throw new Error('Kein Ordner verbunden.');
  for (const p of parts) d = await d.getDirectoryHandle(F.safe(p), { create });
  return d;
};
F.gemVerbinden = async () => {
  if (!window.showDirectoryPicker) { toast('Dieser Browser kann keine Ordner verbinden – bitte Microsoft Edge verwenden.', 4000); return false; }
  let hd; try { hd = await window.showDirectoryPicker({ id: 'tafelapp-gemeinsam', mode: 'readwrite' }); } catch (e) { return false; }
  /* persönlichen und gemeinsamen Ordner sauber trennen */
  if (F.root) {
    try { if (await hd.isSameEntry(F.root)) { toast('Das ist Ihr persönlicher Ablageordner. Bitte den gemeinsamen Ordner (z. B. IServ-Gruppenordner „Lehrkräfte“) wählen.', 6000); return false; } } catch (e) {}
    try { if (hd.resolve && await hd.resolve(F.root)) { toast('Ihr persönlicher Ablageordner liegt in diesem Ordner – dann sähen alle Ihre Tafeln. Bitte einen anderen Ordner wählen.', 7000); return false; } } catch (e) {}
    try { if (F.root.resolve && await F.root.resolve(hd)) { toast('Dieser Ordner liegt in Ihrem persönlichen Ablageordner. Bitte den gemeinsamen Gruppenordner wählen.', 6000); return false; } } catch (e) {}
  }
  await T.idbSet(schluessel(lk()), hd);
  F.gemRoot = hd; auffrischen();
  toast('👥 Gemeinsamer Ordner verbunden: ' + hd.name, 3000);
  return true;
};
F.gemFreigeben = async () => {
  const p0 = F.gemPending(); if (!p0) return !!F.gemRoot;
  let p = 'denied'; try { p = await p0.requestPermission({ mode: 'readwrite' }); } catch (e) {}
  if (p === 'granted') { stand++; gemH = p0; gemPend = null; auffrischen(); toast('👥 Gemeinsamer Ordner freigegeben: ' + p0.name, 2500); return true; }
  toast('Der gemeinsame Ordner wurde nicht freigegeben.', 3000); return false;
};
F.gemTrennen = async () => {
  try { await T.idbSet(schluessel(lk()), null); } catch (e) {}
  stand++; gemH = null; gemPend = null; gemFuer = lk(); geladenFuer = lk(); auffrischen();
};
T.ordnerInfo = () => ({ persoenlich: F.name(), gemeinsam: F.gemName() });

/* ---------- Abschnitt „👥 Gemeinsamer Ordner“ (Einstellungen und Dialog von der Startseite) ---------- */
function abschnitt(neu) {
  const box = h('div', { class: 'gem-einst' });
  const male = () => {
    box.innerHTML = '';
    const g = F.gemRoot, p = F.gemPending();
    box.append(h('h3', {}, '👥 Gemeinsamer Ordner'),
      h('p', { class: 'gem-status' + (g ? ' an' : '') }, g ? '✔ Verbunden: »' + g.name + '«' : p ? '⚠ »' + p.name + '« ist gemerkt – bitte neu freigeben.' : 'Nicht verbunden – Geteiltes liegt im persönlichen Ablageordner.'),
      h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '8px' } },
        p ? h('button', { class: 'big prim', onclick: async () => { await F.gemFreigeben(); male(); neu && neu(); } }, '👥 Gemeinsamen Ordner freigeben') : '',
        h('button', { class: 'big' + (g || p ? '' : ' prim'), onclick: async () => { if (await F.gemVerbinden()) { male(); neu && neu(); } } }, g || p ? '👥 Anderen Ordner wählen' : '👥 Gemeinsamen Ordner wählen'),
        g || p ? h('button', { class: 'big', onclick: async () => {
          if (!await T.frage('Gemeinsamen Ordner trennen?\n\nIm Ordner wird nichts gelöscht. Danach liegt Geteiltes wieder im persönlichen Ablageordner.', { ok: 'Trennen' })) return;
          await F.gemTrennen(); male(); neu && neu(); } }, 'Trennen') : ''),
      h('p', { class: 'hint' }, h('b', {}, 'Persönlich: '), F.name() ? '»' + F.name() + '« – ' : '', 'Ihre Tafeln, Einstellungen und Listen, z. B. IServ › Eigene Dateien › Tafel-App. Das sehen nur Sie.'),
      h('p', { class: 'hint' }, h('b', {}, 'Gemeinsam: '), 'z. B. der IServ-Gruppenordner „Lehrkräfte“ › Tafel-App. Dorthin kommt nur, was Sie ausdrücklich teilen: gemeinsame Vorlagen, Klassenlisten, Sitzpläne und Tafeln. Nur einen Ordner wählen, den ausschließlich Lehrkräfte sehen – Klassenlisten und Sitzpläne enthalten Vornamen.'));
  };
  male(); return box;
}
T.gemDialog = () => {
  T.openDlg([h('h2', {}, '👥 Gemeinsamer Ordner'), abschnitt(() => { if (T.archiv && T.angemeldet && T.angemeldet() && document.getElementById('archiv').style.display !== 'none') T.archiv(); }),
    h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: T.closeDlg }, 'Fertig'))]);
};

/* ---------- 👥 Tafel teilen (📁-Menü) ---------- */
const GT = '_Geteilte Tafeln', TRENN = ' – ';
const gtDatei = titel => F.safe(lk()) + TRENN + F.safe(titel) + '.tafel.json';
const kannTeilen = () => !!((F.root || F.gemRoot) && lk());
const ortText = () => F.gemRoot ? 'den gemeinsamen Ordner »' + F.gemName() + '«' : 'den Ablageordner »' + F.name() + '«';
const existiert = async (d, n) => { try { await d.getFileHandle(n); return true; } catch (e) { return false; } };
T.tafelTeilen = () => {
  const b = T.S.board; if (!b) return;
  if (!kannTeilen()) { toast('Zum Teilen zuerst anmelden und einen Ablageordner oder gemeinsamen Ordner verbinden.', 4000); return; }
  const name = h('input', { class: 'feld', value: b.titel || '', placeholder: 'z. B. „Brüche addieren – Einstieg“' });
  const hinweis = h('textarea', { class: 'feld', rows: 3, placeholder: 'Freiwillig: kurzer Hinweis, z. B. „für Klasse 6, ca. 20 Minuten“', style: { width: '100%', resize: 'vertical' } });
  const los = async () => {
    const titel = name.value.trim(); if (!titel) { toast('Bitte einen Namen eingeben.'); name.focus(); return; }
    try {
      const d = await F.gdir([GT, b.fach || 'Sonstiges'], true), datei = gtDatei(titel);
      if (await existiert(d, datei) && !await T.frage(`Sie haben schon eine Tafel „${titel}“ geteilt. Durch diesen Stand ersetzen?`, { ok: 'Ersetzen' })) return;
      const kopie = JSON.parse(JSON.stringify(b));
      kopie.titel = titel; kopie.geteiltVon = lk(); kopie.geteiltAm = new Date().toISOString(); delete kopie.klasse;
      if (hinweis.value.trim()) kopie.hinweis = hinweis.value.trim(); else delete kopie.hinweis;
      const w = await (await d.getFileHandle(datei, { create: true })).createWritable(); await w.write(JSON.stringify(kopie)); await w.close();
      T.closeDlg(); toast(`👥 „${titel}“ ist geteilt – Kolleginnen und Kollegen finden die Tafel auf ihrer Startseite unter „👥 Geteilte Tafeln“.`, 4500);
    } catch (e) { toast('Teilen fehlgeschlagen: ' + (e.message || e), 5000); }
  };
  T.openDlg([h('h2', {}, '👥 Tafel teilen'),
    h('p', { class: 'hint' }, `Eine Kopie dieser Tafel kommt in ${ortText()} (Ordner „${GT}“ › ${b.fach || 'Sonstiges'}). Ihre eigene Tafel bleibt, wie sie ist.`),
    h('label', { class: 'fld' }, 'Name', name), h('label', { class: 'fld' }, 'Hinweis für die anderen', hinweis),
    h('p', { class: 'hint' }, '🔒 Datenschutz: Bitte vorher prüfen – keine Namen, Fotos oder Noten von Schülerinnen und Schülern auf der Tafel.'),
    h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: los }, '👥 Teilen'))]);
  setTimeout(() => name.focus(), 50);
};
async function geteilteTafeln() {
  const out = []; if (!kannTeilen()) return out;
  let d; try { d = await F.gdir([GT], false); } catch (e) { return out; }
  for await (const [fach, fd] of d.entries()) {
    if (fd.kind !== 'directory') continue;
    for await (const [n, fh] of fd.entries()) {
      if (fh.kind !== 'file' || !n.endsWith('.tafel.json')) continue;
      const i = n.indexOf(TRENN), von = i > 0 ? n.slice(0, i) : '?', titel = (i > 0 ? n.slice(i + TRENN.length) : n).replace(/\.tafel\.json$/, '');
      let mod = 0; try { mod = (await fh.getFile()).lastModified; } catch (e) {}
      out.push({ fach, datei: n, von, titel, mod, mein: von === F.safe(lk()) && i > 0 });
    }
  }
  return out.sort((a, b) => a.fach.localeCompare(b.fach, 'de') || b.mod - a.mod);
}
T.geteilteTafeln = geteilteTafeln; /* für Tests */
async function lesen(g) { const d = await F.gdir([GT, g.fach], false); return JSON.parse(await (await (await d.getFileHandle(g.datei)).getFile()).text()); }
/* geteilte Tafel antippen: eigene Kopie – Klasse und Fach wählbar, dann im eigenen Ordner speichern und öffnen */
async function kopieOeffnen(g) {
  let b; try { b = T.checkBoard(await lesen(g)); } catch (e) { toast('Öffnen fehlgeschlagen: ' + (e.message || e), 5000); return; }
  const ks = F.root ? await F.klassen(lk()).catch(() => []) : [];
  const vorKl = T.opts.klasse && (ks.includes(T.opts.klasse) || !ks.length) ? T.opts.klasse : '';
  if (vorKl && !ks.includes(vorKl)) ks.push(vorKl);
  const kl = h('select', { class: 'feld' }, h('option', { value: '' }, 'Sonstige / ohne Klasse'), ...ks.map(k => h('option', { value: k, selected: k === vorKl }, k)), h('option', { value: '+' }, '＋ Neue Klasse …'));
  kl.onchange = async () => { if (kl.value !== '+') return; const n = await T.frage('Klasse, z. B. 7b:', { feld: {} }); const k = n && F.safe(n.trim().replace(/^klasse\s*/i, ''));
    if (k && n.trim()) { kl.insertBefore(h('option', { value: k }, k), kl.lastChild); kl.value = k; } else kl.value = vorKl; };
  const faecher = (T.FAECHER || []).map(f => f.id); if (!faecher.includes(b.fach)) faecher.push(b.fach);
  const fa = h('select', { class: 'feld' }, ...faecher.map(f => h('option', { value: f, selected: f === b.fach }, (T.fach ? T.fach(f).icon + ' ' : '') + f)));
  const los = async () => {
    const k = kl.value === '+' ? '' : kl.value;
    b.id = T.uid(); b.lehrkraft = lk(); b.fach = fa.value; b.datum = T.today(); if (k) b.klasse = k; else delete b.klasse;
    b.uebernommenVon = b.geteiltVon || g.von; delete b.geteiltVon; delete b.geteiltAm;
    T.closeDlg();
    if (F.root) {
      try { const r = await F.save(b, null); T.ladeTafel(b, r.file); toast(`📥 Eigene Kopie von „${b.titel}“ gespeichert (${k ? k + ' › ' : ''}${b.fach}).`, 3500); return; }
      catch (e) { toast('Speichern fehlgeschlagen: ' + (e.message || e), 5000); }
    }
    T.ladeTafel(b, null); T.S.dirty = true; toast('📥 Eigene Kopie geöffnet – beim Speichern landet sie in Ihrer Ablage.', 3500);
  };
  T.openDlg([h('h2', {}, '📥 Eigene Kopie öffnen'),
    h('p', {}, `„${b.titel}“ von ${g.von}`), b.hinweis ? h('p', { class: 'hint' }, '💬 ' + b.hinweis) : '',
    h('label', { class: 'fld' }, 'Klasse', kl), h('label', { class: 'fld' }, 'Fach', fa),
    h('p', { class: 'hint' }, 'Die Kopie gehört Ihnen und liegt in Ihrem persönlichen Ordner. Die geteilte Tafel bleibt unverändert.'),
    h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: los }, '📥 Kopie öffnen'))]);
}
async function teilenBeenden(g) {
  if (!g.mein) return; /* nur die eigene Datei */
  if (!await T.frage(`„${g.titel}“ nicht mehr teilen?\n\nDie geteilte Kopie wird entfernt. Ihre eigene Tafel bleibt erhalten.`, { ok: 'Teilen beenden' })) return;
  try { const d = await F.gdir([GT, g.fach], false); await d.removeEntry(g.datei); toast('Wird nicht mehr geteilt.', 2200); } catch (e) { toast('Fehlgeschlagen: ' + (e.message || e), 4000); }
  if (T.archiv) T.archiv();
}

/* ---------- Startseite: Kopf-Knopf „👥 Gemeinsam“, Freigabe-Hinweis, „👥 Geteilte Tafeln“ ---------- */
function karteFuellen(karte) {
  const p = F.gemPending();
  if (p) karte.append(h('div', { class: 'row' }, h('button', { class: 'big prim', onclick: async () => { if (await F.gemFreigeben() && T.archiv) T.archiv(); } }, '👥 Gemeinsamen Ordner freigeben'),
    h('span', { class: 'hint', style: { flex: 1 } }, `Der gemeinsame Ordner »${p.name}« ist gemerkt. Der Browser fragt nach einem Neustart einmal nach der Erlaubnis – antippen und „Zulassen“ wählen.`)));
  geteilteTafeln().then(liste => {
    if (!karte.isConnected) return;
    if (liste.length) {
      const faecher = [...new Set(liste.map(g => g.fach))], offen = liste.length <= 8;
      karte.append(h('h3', { style: { marginTop: p ? '12px' : 0 } }, '👥 Geteilte Tafeln'),
        h('p', { class: 'hint' }, 'Antippen öffnet eine eigene Kopie – die geteilte Tafel bleibt unverändert.'),
        ...faecher.map(fa => {
          const f = T.fach ? T.fach(fa) : { icon: '' }, l = liste.filter(g => g.fach === fa);
          const det = h('details', { class: 'gt-fach' }, h('summary', {}, `${f.icon || ''} ${fa} (${l.length})`),
            h('div', { class: 'liste' }, ...l.map(g => h('div', { class: 'eintrag' },
              h('span', { class: 'd' }, g.mod ? new Date(g.mod).toLocaleDateString('de-DE') : ''),
              h('span', { class: 't' }, g.titel, h('span', { class: 'gt-von' }, g.mein ? ' · von mir' : ' · von ' + g.von)),
              h('button', { class: 'big prim', title: 'Eigene Kopie in Ihrem Ordner anlegen und öffnen', onclick: () => kopieOeffnen(g) }, '📥 Kopie öffnen'),
              g.mein ? h('button', { class: 'big warn', title: 'Geteilte Kopie entfernen (Ihre eigene Tafel bleibt)', onclick: () => teilenBeenden(g) }, 'Teilen beenden') : ''))));
          if (offen) det.open = true; return det; }));
    } else if (!p) { /* Bereich immer zeigen – mit Erklärung, was fehlt */
      const verbunden = !!F.gemRoot;
      karte.append(h('h3', { style: { marginTop: 0 } }, '👥 Geteilte Tafeln'),
        h('p', { class: 'hint' }, verbunden
          ? `Im gemeinsamen Ordner »${F.gemName ? F.gemName() : ''}« liegt noch keine geteilte Tafel. Teilen geht so: Tafel öffnen › 📁 › „👥 Tafel teilen …“ – dann erscheint sie hier bei allen, die denselben Ordner verbunden haben.`
          : 'Noch kein gemeinsamer Ordner verbunden. Wählen Sie den Ordner, den auch Ihre Kolleginnen und Kollegen nutzen (z. B. einen IServ-Gruppenordner) – dann erscheinen hier deren geteilte Tafeln.'),
        verbunden ? '' : h('div', { class: 'row' }, h('button', { class: 'big prim', onclick: () => T.gemDialog() }, '👥 Gemeinsamen Ordner wählen')));
    }
    karte.style.display = karte.childNodes.length ? '' : 'none';
  }).catch(() => { karte.style.display = karte.childNodes.length ? '' : 'none'; });
}
function startseite() {
  const A = document.getElementById('archiv'); if (!A || A.style.display === 'none') return;
  if (!T.angemeldet || !T.angemeldet() || !F.supported || F.intern) return;
  const kopf = A.querySelector(':scope > .kopf');
  if (kopf && kopf.querySelector('.name-wahl') && !kopf.querySelector('.gem-kopf')) {
    const b = h('button', { class: 'big gem-kopf', title: 'Gemeinsamer Ordner für Geteiltes (Vorlagen, Klassenlisten, Sitzpläne, Tafeln)', onclick: () => T.gemDialog() }, '👥 Gemeinsam');
    if (F.gemPending()) b.append(h('span', { class: 'sich-punkt', title: 'Bitte freigeben' }, '!'));
    const nach = kopf.querySelector('.sich-kopf') || kopf.querySelector('.spacer'); if (nach) nach.after(b); else kopf.append(b);
  }
  const cols = A.querySelector(':scope > .cols');
  if (cols && !A.querySelector('.gt-karte')) { const karte = h('div', { class: 'karte gt-karte', style: { display: 'none' } }); cols.after(karte); karteFuellen(karte); }
}
function einstellungen() {
  const r = document.querySelector('.einst-rechts'); if (!r || r.querySelector('.gem-einst')) return;
  const t = r.querySelector('h3'); if (!t || t.textContent.trim() !== '📂 Ablageordner') return;
  r.append(abschnitt());
}
/* nach Verbinden, Freigeben, Trennen: Startseite und Einstellungen neu aufbauen */
function auffrischen() {
  document.querySelectorAll('.gt-karte, .gem-kopf').forEach(e => e.remove());
  const alt = document.querySelector('.einst-rechts .gem-einst'); if (alt) alt.replaceWith(abschnitt());
  const A = document.getElementById('archiv');
  if (A && A.style.display !== 'none' && T.archiv && T.angemeldet && T.angemeldet() && A.querySelector('.cols')) T.archiv(); else startseite();
}
new MutationObserver(() => { startseite(); einstellungen(); }).observe(document.body, { childList: true, subtree: true });
document.head.append(Object.assign(document.createElement('style'), { textContent:
  '.gem-kopf{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;margin-left:8px}' +
  '.gem-einst{margin-top:18px;padding-top:6px;border-top:1px solid var(--line)}.gem-status{font-size:17px;color:var(--text)}.gem-status.an{color:var(--ok);font-weight:600}' +
  '.gt-fach{margin:6px 0}.gt-fach>summary{cursor:pointer;font-size:18px;font-weight:600;padding:8px 4px;color:var(--text)}.gt-von{color:var(--muted);font-size:15px}' }));
})();
