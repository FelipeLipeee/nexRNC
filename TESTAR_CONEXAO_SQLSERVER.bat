@echo off
title Diagnostico de Banco de Dados - nexRNC (SQL Server 10.1.1.8)
cls

echo =====================================================================
echo    DIAGNOSTICO DE BANCO DE DADOS - nexRNC (SQL SERVER 10.1.1.8)
echo =====================================================================
echo.
echo Testando comunicacao com 10.1.1.8 (TEC_DESK) e tabelas do modulo RNC...
echo.

if exist "%~dp0python\python.exe" (
    "%~dp0python\python.exe" "%~dp0backend\test_db.py"
) else (
    python "%~dp0backend\test_db.py"
)

echo.
echo =====================================================================
pause
