# Tafel-App

Digitale Tafel für den Unterricht – fürs **SMART Board**, den **PC** und das **iPad mit Apple Pencil**.
Läuft komplett im Browser, ohne Installation, ohne Anmeldung und ohne Server: Alles wird nur auf dem eigenen Gerät gespeichert.

**Starten:** `Tafel.html` öffnen – oder nach dem Einrichten von GitHub Pages die Adresse des Repositorys aufrufen.

## Was die Tafel kann (Auswahl)

- Schreiben mit Stift oder Finger, Textmarker, Radierer, Formen mit Winkeln, Maßen, Umfang und Fläche
- Geodreieck, Lineal, Winkelmesser, Zirkel, Taschenrechner, Funktionsplotter
- Einfügen: Bilder, PDF, PowerPoint/Word, Emojis, Mathe-Bausteine, 3D-Körper und Netze, Karten, Formeln
- Übungen: Kärtchen sortieren, Reihenfolge, Zuordnen, Lückentext, Memory, Bild-Puzzle, Zuordnungskästen
- Classroom-Werkzeuge: Timer, Zufall, Würfel, Ampel, Gruppen, Umfrage
- Notizen am Rand, Video abspielen und aufnehmen, Präsentationsmodus

Ausführliche Bedienung: [Anleitung.md](Anleitung.md)

## Auf dem iPad mit Apple Pencil

1. Die Seite in **Safari** öffnen.
2. **Teilen › „Zum Home-Bildschirm“** – danach die Tafel über das neue Symbol starten. So läuft sie im Vollbild, auch ohne Internet, und Safari löscht die gespeicherten Tafeln nicht nach einigen Tagen.
3. **Apple Pencil schreibt**, der **Finger** verschiebt die Tafel, zoomt (zwei Finger) und bedient Objekte (antippen, ziehen).
   Liegt die Hand beim Schreiben auf dem Display, wird sie ignoriert.

Hinweise:
- Einen gemeinsamen Ablageordner (z. B. OneDrive/IServ) gibt es nur in Edge oder Chrome am PC. Am iPad werden Tafeln im Browser gespeichert; über **⇅ Import / Export** lassen sie sich als Datei sichern und weitergeben.
- „Fenster als Hintergrund“ (Bildschirm teilen) gibt es am iPad nicht – die Kamera als Hintergrund schon.

## Veröffentlichen mit GitHub Pages

1. Neues Repository anlegen und den Inhalt dieses Ordners hochladen (die Dateien aus `.gitignore` bleiben draußen).
2. Im Repository **Settings › Pages › Build and deployment**: *Deploy from a branch*, Branch `main`, Ordner `/ (root)` – speichern.
3. Nach ein bis zwei Minuten ist die Tafel unter `https://<benutzername>.github.io/<repository>/` erreichbar.

Über https funktioniert die Tafel auch offline und lässt sich installieren (am PC: Edge › „App installieren“, am iPad: „Zum Home-Bildschirm“).

## Eine einzige HTML-Datei bauen (optional)

Für Geräte, auf die man keine Ordner kopieren kann: `Einzeldatei bauen.ps1` (Windows PowerShell) erzeugt daneben `Tafel-App (eine Datei).html` mit allem eingebettet.

## Datenschutz

Keine Anmeldung, kein Tracking, keine Daten an fremde Server. Externe Inhalte (z. B. YouTube-Videos, GeoGebra) werden nur geladen, wenn man sie selbst einfügt.
Karten: Natural Earth (gemeinfrei). PDF-Anzeige: PDF.js (Apache-2.0).
