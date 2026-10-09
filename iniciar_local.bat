@echo off
title nexRNC - Servidor de Desenvolvimento Local
color 0A

echo ======================================================================
echo          nexRNC - Inicializacao Local (Desenvolvimento)
echo ======================================================================
echo.

cd /d "%~dp0"

REM Verifica se o Python esta instalado no PATH
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado no sistema!
    echo Instale o Python 3.11 ou 3.12 e marque a opcao "Add Python to PATH".
    echo.
    pause
    exit /b 1
)

echo [OK] Python detectado.
echo Iniciando servidor FastAPI + Frontend integrado na porta 3010...
echo.
echo Acesse no seu navegador: http://localhost:3010
echo (Pressione Ctrl+C ou feche esta janela para encerrar)
echo ======================================================================
echo.

python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 3010 --reload
pause
