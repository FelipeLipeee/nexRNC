@echo off
title nexRNC Enterprise - Servidor de Gestao da Qualidade (Porta 3010)
color 0B

echo ======================================================================
echo       nexRNC ENTERPRISE - PLATAFORMA DE GESTAO DE RNCS
echo ======================================================================
echo.
echo Porta Padrao: 3010
echo Arquitetura: FastAPI + React SPA Integrados
echo.

REM 1. Diretorio de anexos
if not exist "data\uploads" (
    mkdir "data\uploads" 2>nul
)

echo [OK] Diretorio de Anexos: data\uploads
echo [OK] Frontend e Backend integrados na porta 3010.
echo.
echo ======================================================================
echo   O SISTEMA nexRNC ESTA PRONTO PARA INICIAR!
echo.
echo   - Acesso Local:  http://localhost:3010
echo.
echo   [IMPORTANTE] Mantenha esta janela aberta para o sistema continuar no ar.
echo   Para desligar o sistema, basta fechar esta janela ou pressionar Ctrl+C.
echo ======================================================================
echo.

cd /d "%~dp0"
if exist "%~dp0python\python.exe" (
    "%~dp0python\python.exe" -m uvicorn main:app --app-dir "%~dp0backend" --host 0.0.0.0 --port 3010
) else (
    python -m uvicorn main:app --app-dir "%~dp0backend" --host 0.0.0.0 --port 3010
)
