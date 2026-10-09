@echo off
title nexRNC Enterprise - Servidor de Gestao da Qualidade (Porta 3010)
color 0B

echo ======================================================================
echo       nexRNC ENTERPRISE - PLATAFORMA DE GESTAO DE RNCS (v2.0.0)
echo ======================================================================
echo.

cd /d "%~dp0"

REM 1. Identifica o executavel do Python (embutido ou instalado no sistema)
set "PY_CMD="
if exist "%~dp0python\python.exe" (
    set "PY_CMD=%~dp0python\python.exe"
) else (
    python --version >nul 2>&1
    if %errorlevel% equ 0 (
        set "PY_CMD=python"
    )
)

if "%PY_CMD%"=="" (
    echo [ERRO] Python nao encontrado no sistema!
    echo Para rodar o nexRNC, instale o Python 3.11 ou 3.12 (marcando "Add python to PATH").
    echo Download oficial: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM 2. Verifica se as bibliotecas estao instaladas; senao instala automaticamente
"%PY_CMD%" -c "import fastapi, uvicorn" >nul 2>&1
if %errorlevel% neq 0 (
    echo [CONFIGURACAO INICIAL DETECTADA]
    echo Instalando bibliotecas necessarias (FastAPI, Uvicorn, etc)...
    "%PY_CMD%" -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [ALERTA] Tentando instalacao essencial de contingencia...
        "%PY_CMD%" -m pip install fastapi "uvicorn[standard]" pydantic python-multipart
    )
    echo [OK] Bibliotecas instaladas com sucesso!
    echo.
)

REM 3. Diretorio de anexos
if not exist "data\uploads" (
    mkdir "data\uploads" 2>nul
)

echo [OK] Servidor Integrado: Frontend React SPA + Backend FastAPI na porta 3010
echo [OK] Banco de Dados: SQLite Local automatico (pronto para uso imediato)
echo.
echo ======================================================================
echo   O SISTEMA nexRNC ESTA INICIANDO!
echo.
echo   - URL de Acesso: http://localhost:3010
echo.
echo   [DICA] Clique no botao "Modo Demonstracao" na tela de login para
echo          carregar instantaneamente 9 casos industriais reais!
echo.
echo   Para desligar o sistema, basta fechar esta janela ou pressionar Ctrl+C.
echo ======================================================================
echo.

REM Abre o navegador automaticamente apos 2 segundos em segundo plano
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3010"

REM Inicia o servidor FastAPI servindo backend e frontend na porta 3010
"%PY_CMD%" -m uvicorn main:app --app-dir "%~dp0backend" --host 0.0.0.0 --port 3010
pause
