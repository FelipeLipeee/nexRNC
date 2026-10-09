@echo off
title MIGRAR COLUNAS SQL SERVER - NEXRNC
color 0B

echo ======================================================================
echo   MIGRAR COLUNAS DA ETAPA FINANCEIRO E COMERCIAL NO SQL SERVER (10.1.1.8)
echo ======================================================================
echo.

cd /d "%~dp0"

if exist "%~dp0python\python.exe" (
    "%~dp0python\python.exe" "%~dp0backend\migrar_colunas.py"
) else (
    "C:\Users\supti2.TECVIDROSP\AppData\Local\Programs\Python\Python312\python.exe" "%~dp0backend\migrar_colunas.py"
)

echo.
pause
