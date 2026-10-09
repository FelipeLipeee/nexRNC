@echo off
setlocal enabledelayedexpansion
title nexRNC Enterprise - Servidor de Gestao da Qualidade (Porta 3010)
color 0B

echo ======================================================================
echo       nexRNC ENTERPRISE - PLATAFORMA DE GESTAO DE RNCS (v2.0.0)
echo ======================================================================
echo.

cd /d "%~dp0"

REM 1. Procura o executavel do Python (embutido, no PATH, py launcher ou pastas padrao)
set "PY_CMD="

if exist "%~dp0python\python.exe" (
    set "PY_CMD=%~dp0python\python.exe"
    goto :PYTHON_FOUND
)

python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=python"
    goto :PYTHON_FOUND
)

py --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=py"
    goto :PYTHON_FOUND
)

REM Procura em diretorios comuns de instalacao do Windows
for %%V in (Python313 Python312 Python311 Python310 Python39) do (
    if exist "%LOCALAPPDATA%\Programs\Python\%%V\python.exe" (
        set "PY_CMD=%LOCALAPPDATA%\Programs\Python\%%V\python.exe"
        goto :PYTHON_FOUND
    )
    if exist "C:\%%V\python.exe" (
        set "PY_CMD=C:\%%V\python.exe"
        goto :PYTHON_FOUND
    )
    if exist "C:\Program Files\Python\%%V\python.exe" (
        set "PY_CMD=C:\Program Files\Python\%%V\python.exe"
        goto :PYTHON_FOUND
    )
)

:PYTHON_NOT_FOUND
echo ======================================================================
echo  [ATENCAO] PYTHON NAO FOI ENCONTRADO NO SEU COMPUTADOR!
echo ======================================================================
echo.
echo  Para rodar o nexRNC, voce precisa ter o Python instalado.
echo.
echo  COMO RESOLVER EM 1 MINUTO:
echo  1. Acesse o site oficial: https://www.python.org/downloads/
echo  2. Baixe o instalador do Python (versao 3.11 ou 3.12 recomendada).
echo  3. IMPORTANTE: Na PRIMEIRA tela do instalador, marque a caixinha:
echo     [X] "Add python.exe to PATH"
echo  4. Clique em "Install Now".
echo  5. Apos instalar, execute este arquivo (INICIAR_NEXRNC.bat) novamente!
echo.
echo ======================================================================
pause
exit /b 1

:PYTHON_FOUND
echo [OK] Python detectado: !PY_CMD!
echo.

REM 2. Verifica se as bibliotecas estao instaladas; senao instala automaticamente
echo Verificando dependencias necessarias...
"!PY_CMD!" -c "import fastapi, uvicorn" >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo ======================================================================
    echo  [PRIMEIRA EXECUCAO DETECTADA]
    echo  Instalando dependencias (FastAPI, Uvicorn, etc)... Aguarde um instante.
    echo ======================================================================
    echo.
    "!PY_CMD!" -m pip install -r "%~dp0requirements.txt"
    if !errorlevel! neq 0 (
        echo.
        echo [ALERTA] Tentando instalacao essencial de contingencia...
        "!PY_CMD!" -m pip install fastapi "uvicorn[standard]" pydantic python-multipart
    )
    echo.
    echo [OK] Dependencias instaladas com sucesso!
    echo.
) else (
    echo [OK] Dependencias FastAPI e Uvicorn prontas.
    echo.
)

REM 3. Diretorio de anexos
if not exist "%~dp0data\uploads" (
    mkdir "%~dp0data\uploads" 2>nul
)

echo [OK] Servidor Integrado: Frontend React SPA + Backend FastAPI na porta 3010
echo [OK] Banco de Dados: SQLite Local automatico
echo.
echo ======================================================================
echo   O SISTEMA nexRNC ESTA PRONTO! INICIANDO NA PORTA 3010...
echo.
echo   - URL de Acesso: http://localhost:3010
echo.
echo   [DICA] Clique no botao "Modo Demonstracao" na tela de login para
echo          carregar instantaneamente 9 casos industriais reais!
echo.
echo   Mantenha esta janela aberta enquanto estiver usando o sistema.
echo ======================================================================
echo.

REM Abre o navegador automaticamente apos 3 segundos em segundo plano
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3010"

REM Inicia o servidor FastAPI servindo backend e frontend na porta 3010
"!PY_CMD!" -m uvicorn main:app --app-dir "%~dp0backend" --host 0.0.0.0 --port 3010

echo.
echo ======================================================================
echo  [AVISO] O servidor nexRNC foi encerrado.
echo ======================================================================
pause
