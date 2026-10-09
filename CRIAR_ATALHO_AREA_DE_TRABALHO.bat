@echo off
title Criar Atalho nexRNC na Area de Trabalho
set "SHORTCUT=%USERPROFILE%\Desktop\nexRNC Enterprise.url"
echo [InternetShortcut] > "%SHORTCUT%"
echo URL=http://localhost:3010 >> "%SHORTCUT%"
echo IconIndex=0 >> "%SHORTCUT%"
echo IconFile=%SystemRoot%\system32\shell32.dll >> "%SHORTCUT%"
echo.
echo ======================================================================
echo   [OK] Atalho criado na sua Area de Trabalho:
echo        "nexRNC Enterprise" (http://localhost:3010)
echo ======================================================================
echo.
pause
