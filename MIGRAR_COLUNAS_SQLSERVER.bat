@echo off
title MIGRAR COLUNAS SQL SERVER - NEXRNC ENTERPRISE
color 0B

echo ======================================================================
echo   MIGRAR COLUNAS DO BANCO DE DADOS - NEXRNC ENTERPRISE
echo ======================================================================
echo.

cd /d "%~dp0"

if exist "%~dp0python\python.exe" (
    "%~dp0python\python.exe" "%~dp0backend\migrar_colunas.py"
) else (
    python "%~dp0backend\migrar_colunas.py"
)

echo.
pause
