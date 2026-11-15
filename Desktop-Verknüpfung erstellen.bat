@echo off
rem Legt auf dem Desktop die Verknuepfung "Tafel-App" an (keine Admin-Rechte noetig).
rem Ist SMART installiert, zusaetzlich "Tafel-App (ohne SMART Ink)".
rem Weg 1: PowerShell - Weg 2: VBScript - Weg 3: einfache Verknuepfung (.url), falls Skripte gesperrt sind.
setlocal EnableDelayedExpansion
set "ORDNER=%~dp0"
set "ORDNER=%ORDNER:~0,-1%"
echo.
echo  Tafel-App: Desktop-Verknuepfungen werden angelegt ...
echo  Ordner: %ORDNER%
echo.

if defined TAFEL_TEST_OHNE_PS goto vbs
echo  [1] PowerShell ...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ORDNER%\app\verknuepfung.ps1"
if not errorlevel 1 goto fertig
echo      PowerShell ist auf diesem PC gesperrt oder hat nicht geklappt.

:vbs
if defined TAFEL_TEST_OHNE_VBS goto url
echo  [2] VBScript ...
cscript //nologo "%ORDNER%\app\verknuepfung.vbs"
if not errorlevel 1 goto fertig
echo      VBScript ist auf diesem PC gesperrt oder hat nicht geklappt.

:url
echo  [3] Einfache Verknuepfung ...
rem Desktop-Ordner aus der Registry (auch wenn er z. B. in OneDrive liegt)
set "DESKTOP="
for /f "tokens=2,*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v Desktop 2^>nul ^| find /i "Desktop"') do set "DESKTOP=%%b"
if defined DESKTOP call set "DESKTOP=%DESKTOP%"
if not defined DESKTOP set "DESKTOP=%USERPROFILE%\Desktop"
rem file:-Adresse: \ wird /, Leerzeichen wird %20; Netzwerkpfade (\\server\...) beginnen mit file:
set "U=%ORDNER:\=/%"
set "U=!U: =%%20!"
if "%ORDNER:~0,2%"=="\\" (set "U=file:!U!") else (set "U=file:///!U!")
> "%DESKTOP%\Tafel-App.url" echo [InternetShortcut]
>> "%DESKTOP%\Tafel-App.url" echo URL=!U!/Tafel%%20starten.bat
>> "%DESKTOP%\Tafel-App.url" echo IconFile=%ORDNER%\app\icons\tafel-symbol.ico
>> "%DESKTOP%\Tafel-App.url" echo IconIndex=0
set "INK="
if exist "%ProgramFiles(x86)%\SMART Technologies\SMART Product Drivers\SMARTInk.exe" set "INK=1"
if exist "%ProgramFiles%\SMART Technologies\SMART Product Drivers\SMARTInk.exe" set "INK=1"
if defined INK (
  > "%DESKTOP%\Tafel-App (ohne SMART Ink).url" echo [InternetShortcut]
  >> "%DESKTOP%\Tafel-App (ohne SMART Ink).url" echo URL=!U!/Tafel%%20starten%%20^(ohne%%20SMART%%20Ink^).bat
  >> "%DESKTOP%\Tafel-App (ohne SMART Ink).url" echo IconFile=%ORDNER%\app\icons\tafel-ohne-ink.ico
  >> "%DESKTOP%\Tafel-App (ohne SMART Ink).url" echo IconIndex=0
)
if exist "%DESKTOP%\Tafel-App.url" (
  echo   Verknuepfung angelegt: Tafel-App
  if defined INK echo   Verknuepfung angelegt: Tafel-App ^(ohne SMART Ink^)
  echo.
  echo  Hinweis: Beim ersten Start fragt Windows evtl. "Moechten Sie diese Datei oeffnen?" - mit "Oeffnen" bestaetigen.
  goto fertig
)
echo.
echo  Es konnte keine Verknuepfung angelegt werden (Desktop: %DESKTOP%).
echo  Bitte die Tafel direkt mit "Tafel starten.bat" im Ordner starten
echo  und ein Foto dieses Fensters an die Person schicken, die die App betreut.
goto ende

:fertig
echo.
echo  Fertig - die Tafel-App liegt jetzt auf dem Desktop.
:ende
echo.
pause
endlocal
