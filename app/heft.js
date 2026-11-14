// Tafel-App – 📒 Heft: Hausaufgaben bzw. Aufgaben mit Erinnerung + Notizen (gemeinsam für Lehrkräfte- und Schüler-Version)
// Knopf oben in der Tafel-Leiste und auf der Startseite in der Kopfzeile. Alles bleibt im Browser-Speicher dieses Geräts (💾 Sicherung nimmt es mit).
'use strict';
(function () {
const nachDemZeichnen = [];
new MutationObserver(() => nachDemZeichnen.forEach(fn => fn())).observe(document.body, { childList: true, subtree: true });
// ---------- 📒 Hausaufgabenheft mit Erinnerung ----------
// Einträge (Fach, Aufgabe, bis wann, erledigt) bleiben nur auf diesem Gerät (Browser-Speicher), unabhängig von den Tafeln.
// Erinnerung: beim Öffnen der App und danach alle 30 Minuten – was heute oder morgen fällig und noch offen ist.
// Hat man Benachrichtigungen erlaubt, kommt zusätzlich eine Mitteilung (nur solange die Tafel geöffnet ist).
const HA_KEY = 'tafelapp.hausaufgaben.v1';
// Wörter: Schüler-Version „Hausaufgaben“, Lehrkräfte-Version „Aufgaben“ (z. B. Korrekturen, Elternbriefe, Termine)
const W = T.SCHUELER ? { titel: '📒 Hausaufgabenheft', kurz: '📒 Hausaufgaben', fach: 'Fach', leer: 'Noch keine Hausaufgaben eingetragen.', notiz: 'Notizen – z. B. Sportzeug mitbringen, Geld für den Ausflug …' }
  : { titel: '📒 Aufgaben & Notizen', kurz: '📒 Aufgaben', fach: 'Klasse / Fach', leer: 'Noch keine Aufgaben eingetragen.', notiz: 'Notizen – z. B. Kopien für die 7b, Elterngespräch vorbereiten, Konferenz-Termin …' };
const haLaden = () => { try { return JSON.parse(localStorage.getItem(HA_KEY)) || []; } catch (e) { return []; } };
const haSpeichern = l => { try { localStorage.setItem(HA_KEY, JSON.stringify(l)); } catch (e) { T.toast && T.toast('Speichern nicht möglich (privates Fenster?)', 2600); } document.dispatchEvent(new Event('ha-geaendert')); };
const NZ_KEY = HA_KEY + '.notizen';
const nzLaden = () => { try { return localStorage.getItem(NZ_KEY) || ''; } catch (e) { return ''; } };
const nzSpeichern = v => { try { localStorage.setItem(NZ_KEY, v); } catch (e) { /* privates Fenster */ } };
const notizFeld = () => { const n = T.h('textarea', { class: 'feld ha-notiz', rows: 4, placeholder: W.notiz }, nzLaden());
  n.addEventListener('input', () => { nzSpeichern(n.value); document.dispatchEvent(new Event('nz-geaendert')); }); return n; };
const tag = (plus = 0) => { const d = new Date(); d.setDate(d.getDate() + plus); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const datumText = iso => { if (!iso) return ''; if (iso === tag(0)) return 'heute'; if (iso === tag(1)) return 'morgen'; const [y, m, d] = iso.split('-'); return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][new Date(+y, m - 1, +d).getDay()] + ' ' + (+d) + '.' + (+m) + '.'; };
T.hausaufgabenheft = () => {
  const h = T.h; let liste = haLaden();
  const fach = h('input', { class: 'feld', placeholder: W.fach, style: { width: '9em' } });
  const aufg = h('input', { class: 'feld', placeholder: 'Was ist zu tun?', style: { flex: '1', minWidth: '12em' } });
  const bis = h('input', { class: 'feld', type: 'date', value: tag(1), title: 'Bis wann?' });
  const box = h('div', { class: 'ha-liste' });
  const zeichne = () => {
    box.innerHTML = '';
    const sort = [...liste].sort((a, b) => (a.fertig - b.fertig) || String(a.bis).localeCompare(String(b.bis)));
    if (!sort.length) box.append(h('p', { class: 'hint' }, W.leer));
    for (const e of sort) {
      const faellig = !e.fertig && e.bis && e.bis <= tag(1);
      box.append(h('div', { class: 'ha-zeile' + (e.fertig ? ' fertig' : '') + (faellig ? ' faellig' : '') },
        h('input', { type: 'checkbox', checked: !!e.fertig, title: 'erledigt', onchange: ev => { e.fertig = ev.target.checked; haSpeichern(liste); zeichne(); } }),
        h('b', {}, e.fach || '–'), h('span', { class: 'ha-text' }, e.text), h('span', { class: 'ha-bis' }, datumText(e.bis)),
        h('button', { class: 'ha-weg', title: 'Löschen', onclick: () => { liste = liste.filter(x => x !== e); haSpeichern(liste); zeichne(); } }, '🗑')));
    }
  };
  const neu = () => { if (!aufg.value.trim()) { aufg.focus(); return; }
    liste.push({ id: Date.now(), fach: fach.value.trim(), text: aufg.value.trim(), bis: bis.value, fertig: false }); haSpeichern(liste); aufg.value = ''; zeichne(); };
  aufg.addEventListener('keydown', e => { if (e.key === 'Enter') neu(); });
  const erinn = h('button', { class: 'big', onclick: async () => {
    if (!('Notification' in window)) return T.toast('Dieses Gerät kann keine Mitteilungen – die Erinnerung kommt als Hinweis in der Tafel.', 3500);
    const p = await Notification.requestPermission(); T.toast(p === 'granted' ? '🔔 Mitteilungen an – solange die Tafel offen ist' : 'Mitteilungen nicht erlaubt – die Erinnerung kommt als Hinweis in der Tafel.', 3000); } }, '🔔 Mitteilungen');
  zeichne();
  T.openDlg([h('h2', {}, W.titel),
    h('div', { class: 'row', style: { gap: '8px', flexWrap: 'wrap' } }, fach, aufg, bis, h('button', { class: 'big prim', onclick: neu }, '＋ Eintragen')),
    box,
    h('h3', { style: { margin: '14px 0 6px' } }, '📝 Notizen'), notizFeld(),
    h('p', { class: 'hint' }, 'Erinnerung: Beim Öffnen der Tafel (und alle 30 Minuten) erscheint ein Hinweis, was heute oder morgen fällig ist. Die Einträge bleiben nur auf diesem Gerät.'),
    h('div', { class: 'acts' }, erinn, h('button', { class: 'big', onclick: () => { liste = liste.filter(e => !e.fertig); haSpeichern(liste); zeichne(); } }, '🧹 Erledigte weg'))]);
};
document.head.append(Object.assign(document.createElement('style'), { textContent:
  '.ha-liste{display:flex;flex-direction:column;gap:6px;margin:12px 0;max-height:50vh;overflow:auto}' +
  '.ha-zeile{display:grid;grid-template-columns:32px 8em 1fr auto 40px;align-items:center;gap:10px;padding:8px 10px;border:1.5px solid var(--line);border-radius:12px}' +
  '.ha-zeile input{width:24px;height:24px}.ha-zeile.fertig{opacity:.5}.ha-zeile.fertig .ha-text{text-decoration:line-through}' +
  '.ha-zeile.faellig{border-color:#ef6c00;background:rgba(239,108,0,.08)}.ha-bis{font-weight:600;white-space:nowrap}.ha-weg{border:0;background:none;font-size:20px;cursor:pointer}' +
  '.ha-notiz{width:100%;box-sizing:border-box;font-size:17px;resize:vertical}' +
  /* Startseite: Knopf „📒 Hausaufgaben“ in der Kopfzeile, Zahl der offenen Aufgaben als Punkt (orange = heute/morgen fällig) */
  '.ha-kopf{display:inline-flex;align-items:center;gap:8px;white-space:nowrap}.ha-zahl{min-width:24px;height:24px;padding:0 7px;box-sizing:border-box;border-radius:12px;background:#64748b;color:#fff;font:700 14px/24px system-ui;text-align:center}.ha-zahl.faellig{background:#ef6c00}' }));
// Startseite (auch „Meine Klassen“ nach dem Anmelden): Knopf oben rechts in der Kopfzeile – öffnet Hausaufgabenheft und Notizen
const kopfKnopf = () => {
  const offen = haLaden().filter(e => !e.fertig), faellig = offen.filter(e => e.bis && e.bis <= tag(1)).length;
  const b = T.h('button', { class: 'big ha-kopf', title: faellig ? faellig + ' bis morgen fällig' : W.titel.slice(3), onclick: () => T.hausaufgabenheft() }, W.kurz);
  if (offen.length) b.append(T.h('span', { class: 'ha-zahl' + (faellig ? ' faellig' : '') }, String(offen.length)));
  return b;
};
const startAktualisieren = neu => { const A = document.getElementById('archiv'); if (!A || getComputedStyle(A).display === 'none') return; const kopf = A.querySelector('.kopf'); if (!kopf) return;
  const alt = kopf.querySelector('.ha-kopf'); if (alt && !neu) return; const k = kopfKnopf();
  if (alt) alt.replaceWith(k); else { const sp = kopf.querySelector('.spacer'); if (sp) sp.after(k); else kopf.append(k); } };
nachDemZeichnen.push(() => startAktualisieren(false));
document.addEventListener('ha-geaendert', () => startAktualisieren(true));
document.addEventListener('nz-geaendert', () => document.querySelectorAll('.ha-notiz').forEach(n => { if (n !== document.activeElement) n.value = nzLaden(); }));
const erinnern = () => {
  const heute = tag(0), offen = haLaden().filter(e => !e.fertig && e.bis && e.bis <= tag(1));
  let schon; try { schon = JSON.parse(localStorage.getItem(HA_KEY + '.erinnert')) || {}; } catch (e) { schon = {}; }
  const neu = offen.filter(e => schon[e.id] !== heute); if (!neu.length) return;
  const txt = neu.map(e => (e.fach ? e.fach + ': ' : '') + e.text + ' (' + datumText(e.bis) + ')').join(' · ');
  T.toast && T.toast(W.kurz + ': ' + txt, 8000, [['Öffnen', () => T.hausaufgabenheft()]]);
  if ('Notification' in window && Notification.permission === 'granted') try { new Notification(W.kurz, { body: txt, icon: 'app/icons/icon-192.png' }); } catch (e) { /* iPad: nur der Hinweis in der Tafel */ }
  neu.forEach(e => { schon[e.id] = heute; }); try { localStorage.setItem(HA_KEY + '.erinnert', JSON.stringify(schon)); } catch (e) { /* egal */ }
};
setTimeout(erinnern, 4000); setInterval(erinnern, 30 * 60 * 1000);
// 📒 oben in der Leiste, neben 🌓
{ const ref = document.getElementById('bThema');
  if (ref) ref.before(Object.assign(document.createElement('button'), { className: 'tb', id: 'bHA', title: W.titel.slice(3), textContent: '📒', onclick: () => T.hausaufgabenheft() })); }
})();
