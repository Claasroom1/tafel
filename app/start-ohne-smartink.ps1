# Tafel-App starten und SMART Ink währenddessen pausieren.
# SMART Ink wird nur für die Dauer der Tafel-App beendet und danach wieder gestartet.
# Es werden keine Einstellungen geändert und keine Admin-Rechte benötigt.
# Protokoll: %LOCALAPPDATA%\Tafel-App\start.log
# -Probe: nur anzeigen, was passieren würde
# -OhneStart: die .bat hat Edge schon gestartet und SMART Ink schon beendet; -InkLief: SMART Ink lief vorher
param([switch]$Probe, [switch]$OhneStart, [switch]$InkLief)

$ErrorActionPreference = 'SilentlyContinue'
$ordner = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$seite = 'file:///' + ((Join-Path $ordner 'Tafel.html') -replace '\\', '/')
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
$inkPfad = @("${env:ProgramFiles(x86)}\SMART Technologies\SMART Product Drivers\SMARTInk.exe", "$env:ProgramFiles\SMART Technologies\SMART Product Drivers\SMARTInk.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1

$logOrdner = Join-Path $env:LOCALAPPDATA 'Tafel-App'; New-Item -ItemType Directory -Force $logOrdner | Out-Null
$log = Join-Path $logOrdner 'start.log'
if ((Test-Path $log) -and (Get-Item $log).Length -gt 200KB) { Remove-Item $log }
function Log($t) { Add-Content -Path $log -Value ("{0:dd.MM. HH:mm:ss}  {1}" -f (Get-Date), $t) }

# Alle sichtbaren Fenster durchsuchen – Edge-Prozesse verraten sonst nur den Titel EINES Fensters
# (z. B. wenn Edge schon offen ist oder im Hintergrund läuft)
Add-Type -Namespace TafelApp -Name Fenster -MemberDefinition @'
[DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb, IntPtr p);
[DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
[DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(IntPtr h, System.Text.StringBuilder s, int n);
[DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(IntPtr h, System.Text.StringBuilder s, int n);
delegate bool EnumProc(IntPtr h, IntPtr p);
// nur Browserfenster (Edge/Chrome), deren Titel „Tafel-App“ ist oder auf „– Tafel-App“ endet – kein Explorer-Ordner „Tafel-App“
public static bool Offen(string name) {
  bool da = false;
  EnumWindows((h, p) => {
    if (!IsWindowVisible(h)) return true;
    var k = new System.Text.StringBuilder(256); GetClassName(h, k, 256);
    if (k.ToString() != "Chrome_WidgetWin_1") return true;
    var s = new System.Text.StringBuilder(512); GetWindowText(h, s, 512);
    string t = s.ToString();
    if (t == name || t.EndsWith(" – " + name) || t.EndsWith(" - " + name)) { da = true; return false; }
    return true;
  }, IntPtr.Zero);
  return da;
}
'@
$offen = { [TafelApp.Fenster]::Offen('Tafel-App') }

$lief = Get-Process -Name SMARTInk
if ($lief -and $lief[0].Path) { $inkPfad = $lief[0].Path }
$warAn = [bool]$lief -or $InkLief

if ($Probe) {
  "Tafel:        $seite"
  "Edge:         $edge"
  "SMART Ink:    $inkPfad (läuft gerade: $([bool]$lief))"
  "Tafel offen:  $(& $offen)"
  "Protokoll:    $log"
  return
}
Log "Start aus $ordner | Edge: $edge | SMART Ink lief: $warAn | über .bat gestartet: $OhneStart"

# 1. SMART Ink anhalten
if ($lief) { $lief | Stop-Process -Force; Start-Sleep -Milliseconds 300; Log "SMART Ink beendet: $(-not (Get-Process -Name SMARTInk))" }

# 2. Tafel-App starten (eigenes Fenster ohne Adressleiste) – entfällt, wenn die .bat das schon getan hat
if (-not $OhneStart) {
  if ($edge) { Start-Process -FilePath $edge -ArgumentList "--app=`"$seite`"", '--start-maximized' }
  else { Start-Process -FilePath 'msedge' -ArgumentList "--app=`"$seite`"", '--start-maximized' }
}

# 3. Warten, bis das Fenster „… – Tafel-App“ da ist (max. 60 s), dann solange es offen ist
$t = 0; while (-not (& $offen) -and $t -lt 60) { Get-Process -Name SMARTInk | Stop-Process -Force; Start-Sleep -Seconds 1; $t++ }
if (& $offen) { Log "Tafel-Fenster gefunden nach $t s" } else { Log 'Tafel-Fenster NICHT gefunden (60 s) – Abbruch' }
$neu = 0
while (& $offen) {
  # Die SMART-Treiber starten SMART Ink z. B. beim Aufnehmen eines Stifts neu: dann gleich wieder anhalten
  $p = Get-Process -Name SMARTInk
  if ($p) { $p | Stop-Process -Force; $neu++; if ($neu -le 20) { Log "SMART Ink wurde neu gestartet – wieder beendet ($neu)" } }
  Start-Sleep -Milliseconds 700
}

# 4. SMART Ink wieder starten (nur wenn es vorher lief)
Log 'Tafel-Fenster geschlossen'
if ($warAn -and $inkPfad -and -not (Get-Process -Name SMARTInk)) { Start-Process -FilePath $inkPfad; Log 'SMART Ink wieder gestartet' }
