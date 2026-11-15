// Tafel-App – 🔒 Datenschutz & Lizenz (⚙ Einstellungen): kurzer Datenschutzhinweis, Lizenzen, Hinweis zu den Belehrungen.
// Gemeinsam für Lehrkräfte- und Schüler-Version. Ausführlich in DATENSCHUTZ.md und LIZENZEN.md im GitHub-Repository.
'use strict';
(function () {
const h = T.h;
const absatz = (titel, ...teile) => h('div', { style: { margin: '10px 0' } }, h('h3', { style: { margin: '0 0 4px' } }, titel), ...teile.map(t => h('p', { style: { margin: '4px 0' } }, t)));
T.rechtliches = () => T.openDlg([h('h2', {}, '🔒 Datenschutz & Lizenz'),
  h('div', { style: { maxHeight: '64vh', overflowY: 'auto' } },
    absatz('Datenschutz – kurz',
      'Die Tafel-App läuft vollständig im Browser: kein eigener Server, keine Anmeldung bei uns, kein Tracking, keine Werbung.',
      'Tafeln, Notizen, Einstellungen, Klassenlisten, Sitzpläne, Vorlagen und Hausaufgaben bleiben auf diesem Gerät bzw. in dem Ordner, den Sie selbst verbinden (z. B. in IServ). Die Entwickler erhalten keine Daten.',
      'Geteilt wird nur, was Sie ausdrücklich teilen – als Kopie im gemeinsamen Ordner.',
      'Beim Aufruf über das Internet (github.io) stellt GitHub (USA) die Dateien bereit und verarbeitet dabei technisch notwendige Verbindungsdaten (z. B. IP-Adresse). Danach läuft die App offline.',
      'Externe Inhalte (YouTube über youtube-nocookie.com, Vimeo, GeoGebra) werden nur geladen, wenn Sie sie selbst einfügen.'),
    T.SCHUELER ? '' : absatz('Schülerdaten',
      'Klassenlisten und Sitzpläne enthalten Vornamen und bleiben lokal. Die Verarbeitung von Schülerdaten auf privaten Geräten bedarf in Niedersachsen der Genehmigung der Schulleitung – den Einsatz bitte mit der Schule abstimmen. Lernvideos zeigen nur erfundene Namen.'),
    absatz('Belehrungen – ohne Gewähr',
      'Die Belehrungs-Tafeln sind sorgfältig erstellt, ersetzen aber nicht die gültigen Erlasse, Gesetze und Regeln der Schule. Maßgeblich ist immer die aktuelle Fassung.'),
    absatz('Lizenz',
      'Tafel-App: MIT-Lizenz (Nutzen, Ändern und Weitergeben erlaubt, Lizenzhinweis behalten, ohne Gewähr).',
      'Bestandteile Dritter: PDF.js (Mozilla, Apache-2.0) · Kartendaten Natural Earth (gemeinfrei) · Abbildungen von Wikimedia Commons (Quelle und Lizenz stehen unter jedem Bild) · Gebete nur gemeinfrei oder selbst formuliert · Melodien gemeinfrei, in der App erzeugt.',
      'Ausführlich: DATENSCHUTZ.md und LIZENZEN.md im GitHub-Repository der App.'),
    absatz('Rechte Dritter',
      'Alle Inhalte wurden nach bestem Wissen selbst erstellt oder stammen aus freien Quellen. Sollten Sie dennoch Rechte an einem Inhalt haben und mit der Verwendung nicht einverstanden sein, melden Sie sich bitte über das GitHub-Repository der App (Bereich „Issues“) – der Inhalt wird dann umgehend geprüft und gegebenenfalls entfernt.')),
  h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: T.closeDlg }, 'Schließen'))]);
})();
