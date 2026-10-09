@echo off
title Diagnostico de Banco de Dados - nexRNC Enterprise
cls

echo =====================================================================
echo    DIAGNOSTICO DE BANCO DE DADOS - nexRNC ENTERPRISE
echo =====================================================================
echo.
echo Testando comunicacao com o banco de dados configurado no .env...
echo.

if exist "%~dp0python\python.exe" (
    "%~dp0python\python.exe" "%~dp0backend\test_db.py"
) else (
    python "%~dp0backend\test_db.py"
)

echo.
echo =====================================================================
pause
