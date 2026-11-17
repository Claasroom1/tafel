@echo off
rem Startet die Tafel-App von der Internetadresse (dieselbe wie die ueber GitHub installierte App - gleiche Tafeln,
rem gleiche Einstellungen, gleicher Ablageordner) und pausiert SMART Ink, solange die Tafel offen ist.
rem Danach wird SMART Ink automatisch wieder gestartet (dafuer wird PowerShell gebraucht).
rem Ist PowerShell gesperrt, wird SMART Ink trotzdem beendet - es kommt dann erst nach Neustart/Neuanmelden wieder.
setlocal
set "ADRESSE=https://claasroom1.github.io/tafel/"
set "INK="
tasklist /fi "imagename eq SMARTInk.exe" 2>nul | find /i "SMARTInk.exe" >nul && set "INK=-InkLief"
taskkill /f /im SMARTInk.exe >nul 2>&1
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --app="%ADRESSE%" --start-maximized
) else (
  start "" msedge --app="%ADRESSE%" --start-maximized
)
if defined TAFEL_TEST_OHNE_PS goto ende
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0app\start-ohne-smartink.ps1" -OhneStart %INK%
:ende
endlocal
