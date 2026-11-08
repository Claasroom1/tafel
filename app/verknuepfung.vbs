' Legt Desktop-Verknuepfungen fuer die Tafel-App an - Ersatzweg, falls PowerShell gesperrt ist.
' Rueckgabe: 0 = geklappt, 1 = nicht geklappt
Option Explicit
Dim fso, ws, ordner, desktop, pf86, pf
Set fso = CreateObject("Scripting.FileSystemObject")
Set ws = CreateObject("WScript.Shell")
ordner = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
desktop = ws.SpecialFolders("Desktop")

Function Lnk(name, ziel, text, symbol)
  Dim s, pfad
  pfad = desktop & "\" & name & ".lnk"
  Set s = ws.CreateShortcut(pfad)
  s.TargetPath = ziel
  s.WorkingDirectory = ordner
  s.WindowStyle = 7
  s.Description = text
  If fso.FileExists(symbol) Then s.IconLocation = symbol & ",0"
  s.Save
  Lnk = fso.FileExists(pfad)
  If Lnk Then WScript.Echo "  Verknuepfung angelegt: " & name
End Function

On Error Resume Next
If Not Lnk("Tafel-App", ordner & "\Tafel starten.bat", "Tafel-App fuer das Smartboard", ordner & "\app\icons\tafel-symbol.ico") Or Err.Number <> 0 Then
  WScript.Echo "  VBScript-Weg fehlgeschlagen: " & Err.Description
  WScript.Quit 1
End If
pf86 = ws.ExpandEnvironmentStrings("%ProgramFiles(x86)%")
pf = ws.ExpandEnvironmentStrings("%ProgramFiles%")
If fso.FileExists(pf86 & "\SMART Technologies\SMART Product Drivers\SMARTInk.exe") Or fso.FileExists(pf & "\SMART Technologies\SMART Product Drivers\SMARTInk.exe") Then
  Lnk "Tafel-App (ohne SMART Ink)", ordner & "\Tafel starten (ohne SMART Ink).bat", "Tafel-App; SMART Ink ist pausiert, solange die Tafel offen ist", ordner & "\app\icons\tafel-ohne-ink.ico"
End If
WScript.Quit 0
