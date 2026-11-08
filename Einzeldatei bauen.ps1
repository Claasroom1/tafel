# Baut die ganze Tafel-App in EINE HTML-Datei (für SMART Boards / Geräte, auf die man keine Ordner kopieren kann).
# Ergebnis: ..\Tafel-App (eine Datei).html  – CSS, Skripte, Symbol, Karten und Skelett-Bilder sind eingebettet.
# Aufruf: Rechtsklick > "Mit PowerShell ausführen"  oder  powershell -ExecutionPolicy Bypass -File "Einzeldatei bauen.ps1"
$ErrorActionPreference = 'Stop'
$basis = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
function Lies($rel) { [IO.File]::ReadAllText((Join-Path $basis $rel), [Text.Encoding]::UTF8) }
function Sicher($text) { $text -replace '</(script)', '<\/$1' }   # darf den Skript-Block nicht vorzeitig beenden

# Nachladen (Karten, Skelette): erst im eingebetteten Block suchen, sonst wie gewohnt aus dem Ordner
$alt = "const s = document.createElement('script'); s.src = src;"
$neu = "const e = document.querySelector('script[data-src=`"' + src + '`"]'); if (e) { window.__eingebettet = window.__eingebettet || {}; if (!window.__eingebettet[src]) { const t = document.createElement('script'); t.textContent = e.textContent; document.head.append(t); window.__eingebettet[src] = true; } ok(); return; } " + $alt

$html = Lies 'Tafel.html'
$html = $html -replace '<link rel="manifest"[^>]*>\r?\n?', ''
$html = $html -replace '<script>\s*// Installierbar[\s\S]*?</script>\r?\n?', ''   # Service Worker gibt es bei einer Einzeldatei nicht
$icon = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $basis 'app\icons\icon-192.png')))
$html = $html.Replace('<link rel="icon" href="app/icons/icon-192.png">', "<link rel=`"icon`" href=`"data:image/png;base64,$icon`">")
$html = $html.Replace('<link rel="stylesheet" href="app/tafel.css">', "<style>`n" + (Lies 'app\tafel.css') + "`n</style>")
$geaendert = 0
$html = [regex]::Replace($html, '<script src="(app/[^"]+\.js)"></script>', {
  param($m) $code = Lies ($m.Groups[1].Value -replace '/', '\')
  if ($code.Contains($alt)) { $code = $code.Replace($alt, $neu); $script:geaendert++ }
  "<script>`n" + (Sicher $code) + "`n</script>" })
if ($geaendert -lt 2) { throw "Nachlade-Stellen nicht gefunden ($geaendert von 2) – Skript an die App anpassen." }

# Große Daten erst bei Bedarf ausführen: als Text eingebettet
$daten = New-Object System.Text.StringBuilder
foreach ($d in (Get-ChildItem (Join-Path $basis 'app\karten\*.js')) + (Get-ChildItem (Join-Path $basis 'app\bilder\*.js')) + (Get-ChildItem (Join-Path $basis 'app\pdfjs\*.js'))) {
  $rel = 'app/' + $d.Directory.Name + '/' + $d.Name
  [void]$daten.Append("<script type=`"text/plain`" data-src=`"$rel`">" + (Sicher ([IO.File]::ReadAllText($d.FullName, [Text.Encoding]::UTF8))) + "</script>`n") }
$html = $html.Replace('</body>', $daten.ToString() + '</body>')

$ziel = Join-Path (Split-Path $basis -Parent) 'Tafel-App (eine Datei).html'
[IO.File]::WriteAllText($ziel, $html, $utf8)
"Fertig: $ziel  ({0:N1} MB)" -f ((Get-Item $ziel).Length / 1MB)
