@echo off
setlocal enabledelayedexpansion
title nexRNC - Diagnostico de Ambiente Local
color 0E

echo ======================================================================
echo          nexRNC ENTERPRISE - DIAGNOSTICO DO SISTEMA LOCAL
echo ======================================================================
echo.

cd /d "%~dp0"

if not exist "%~dp0backend\main.py" (
    echo [FALHA CRITICA] Arquivos do sistema nao encontrados!
    echo Voce precisa EXTRAIR o arquivo ZIP antes de executar.
    echo.
    goto :END_DIAG
)

echo [1] Verificando instalacao do Python:
set "PY_CMD="

if exist "%~dp0python\python.exe" (
    set "PY_CMD=%~dp0python\python.exe"
    echo     - Python embutido: !PY_CMD!
    goto :PY_CHECK_DONE
)

python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=python"
    for /f "tokens=*" %%i in ('python --version') do echo     - Comando "python": %%i
    for /f "tokens=*" %%i in ('where python 2^>nul') do echo     - Localizacao: %%i
    goto :PY_CHECK_DONE
)

py --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=py"
    for /f "tokens=*" %%i in ('py --version') do echo     - Comando "py launcher": %%i
    goto :PY_CHECK_DONE
)

if exist "%LOCALAPPDATA%\Python\bin\python.exe" (
    set "PY_CMD=%LOCALAPPDATA%\Python\bin\python.exe"
    echo     - Encontrado em: !PY_CMD!
    goto :PY_CHECK_DONE
)

for %%V in (Python314 Python313 Python312 Python311 Python310 Python39) do (
    if exist "%LOCALAPPDATA%\Programs\Python\%%V\python.exe" (
        set "PY_CMD=%LOCALAPPDATA%\Programs\Python\%%V\python.exe"
        echo     - Encontrado em: !PY_CMD!
        goto :PY_CHECK_DONE
    )
    if exist "%LOCALAPPDATA%\Python\pythoncore-%%V-64\python.exe" (
        set "PY_CMD=%LOCALAPPDATA%\Python\pythoncore-%%V-64\python.exe"
        echo     - Encontrado em: !PY_CMD!
        goto :PY_CHECK_DONE
    )
    if exist "C:\%%V\python.exe" (
        set "PY_CMD=C:\%%V\python.exe"
        echo     - Encontrado em: !PY_CMD!
        goto :PY_CHECK_DONE
    )
    if exist "C:\Program Files\Python\%%V\python.exe" (
        set "PY_CMD=C:\Program Files\Python\%%V\python.exe"
        echo     - Encontrado em: !PY_CMD!
        goto :PY_CHECK_DONE
    )
)

:PY_CHECK_DONE
if "%PY_CMD%"=="" (
    echo     [FALHA] Python NAO encontrado no sistema!
    echo     --> Instale o Python 3.11 ou 3.12 em https://www.python.org/downloads/
    echo     --> Marque a opcao "Add Python to PATH" durante a instalacao.
    echo.
    goto :END_DIAG
)

echo.
echo [2] Verificando bibliotecas instaladas:
"!PY_CMD!" -c "import fastapi, uvicorn, pydantic; print('    - FastAPI:', fastapi.__version__); print('    - Uvicorn:', uvicorn.__version__); print('    - Pydantic:', pydantic.__version__)" 2>nul
if !errorlevel! neq 0 (
    echo     [ALERTA] Algumas dependencias estao faltando.
    echo     Tentando testar instalacao via pip...
    "!PY_CMD!" -m pip --version
) else (
    echo     [OK] Todas as dependencias essenciais estao presentes!
)

echo.
echo [3] Testando importacao do Backend nexRNC:
"!PY_CMD!" -c "import sys; sys.path.insert(0, r'%~dp0backend'); from app.database import detect_db_mode; print('    - Modo de Banco Detectado:', detect_db_mode())" 2>nul
if !errorlevel! neq 0 (
    echo     [FALHA] Erro ao carregar modulos do backend!
    echo     Detalhes do erro:
    "!PY_CMD!" -c "import sys; sys.path.insert(0, r'%~dp0backend'); from app.database import detect_db_mode"
) else (
    echo     [OK] Modulos do backend carregados com sucesso!
)

echo.
echo [4] Verificando arquivos estaticos do Frontend:
if exist "%~dp0backend\static\index.html" (
    echo     [OK] Frontend React compilado encontrado em backend\static\index.html
) else (
    echo     [ALERTA] backend\static\index.html nao encontrado!
)

:END_DIAG
echo.
echo ======================================================================
echo                     FIM DO DIAGNOSTICO
echo ======================================================================
pause
