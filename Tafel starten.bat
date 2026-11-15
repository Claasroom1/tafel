@echo off
rem Startet die Tafel-App in Microsoft Edge als eigenes Fenster (ohne Adressleiste).
setlocal
set "SEITE=%~dp0Tafel.html"
set "SEITE=%SEITE:\=/%"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --app="file:///%SEITE%" --start-maximized
) else (
  start "" msedge --app="file:///%SEITE%" --start-maximized
)
endlocal
