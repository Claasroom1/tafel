@echo off
rem Startet die Tafel-App und pausiert SMART Ink, solange die Tafel offen ist.
rem Danach wird SMART Ink automatisch wieder gestartet (dafuer wird PowerShell gebraucht).
rem Ist PowerShell auf dem PC gesperrt, wird SMART Ink trotzdem beendet und die Tafel startet -
rem SMART Ink kommt dann erst nach einem Neustart oder Neuanmelden wieder.
setlocal
set "INK="
tasklist /fi "imagename eq SMARTInk.exe" 2>nul | find /i "SMARTInk.exe" >nul && set "INK=-InkLief"
taskkill /f /im SMARTInk.exe >nul 2>&1
call "%~dp0Tafel starten.bat"
if defined TAFEL_TEST_OHNE_PS goto ende
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0app\start-ohne-smartink.ps1" -OhneStart %INK%
:ende
endlocal
