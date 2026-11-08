# Legt Desktop-Verknüpfungen für die Tafel-App an (keine Admin-Rechte nötig).
# Rückgabe: 0 = geklappt, 1 = nicht geklappt (dann versucht die .bat einen anderen Weg)
$ErrorActionPreference = 'Stop'
try {
  $ordner = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
  $desktop = [Environment]::GetFolderPath('Desktop')
  $ws = New-Object -ComObject WScript.Shell

  # Tafel-Symbole: normale Tafel und Tafel mit Stift-Abzeichen (ohne SMART Ink)
  $ico = Join-Path $ordner 'app\icons\tafel-symbol.ico'
  $icoInk = Join-Path $ordner 'app\icons\tafel-ohne-ink.ico'

  function Verknuepfung($name, $ziel, $text, $symbol) {
    $pfad = Join-Path $desktop "$name.lnk"
    $s = $ws.CreateShortcut($pfad)
    $s.TargetPath = $ziel; $s.WorkingDirectory = $ordner; $s.WindowStyle = 7; $s.Description = $text
    if (Test-Path $symbol) { $s.IconLocation = "$symbol,0" }
    $s.Save()
    if (-not (Test-Path $pfad)) { throw "Verknuepfung wurde nicht gespeichert: $pfad" }
    Write-Host "  Verknuepfung angelegt: $name"
  }
  Verknuepfung 'Tafel-App' (Join-Path $ordner 'Tafel starten.bat') 'Tafel-App fuer das Smartboard' $ico
  $smart = @("${env:ProgramFiles(x86)}\SMART Technologies\SMART Product Drivers\SMARTInk.exe", "$env:ProgramFiles\SMART Technologies\SMART Product Drivers\SMARTInk.exe") | Where-Object { Test-Path $_ }
  if ($smart) { Verknuepfung 'Tafel-App (ohne SMART Ink)' (Join-Path $ordner 'Tafel starten (ohne SMART Ink).bat') 'Tafel-App; SMART Ink ist pausiert, solange die Tafel offen ist' $icoInk }

  # Windows zeigt sonst evtl. noch das alte Symbol aus dem Zwischenspeicher
  try { & ie4uinit.exe -show } catch {}
  exit 0
} catch {
  Write-Host "  PowerShell-Weg fehlgeschlagen: $($_.Exception.Message)"
  exit 1
}
