@echo off
title TEC VIDRO - SISTEMA DE RNCS (Porta 3010)
color 0B

echo ======================================================================
echo       TEC VIDRO - SISTEMA DE GESTAO DE RNCS (SERVIDOR 10.1.1.7)
echo ======================================================================
echo.
echo Host: 10.1.1.7 ^| Porta: 3010
echo Banco de Dados: SQL Server 10.1.1.8 (TEC_DESK) - Schema rnc.*
echo.

REM 1. Desacoplamento de dados: fotos e videos ficam em pasta permanente fora do app
if not exist "C:\nexrnc_dados\uploads" (
    mkdir "C:\nexrnc_dados\uploads" 2>nul
)
set "UPLOADS_DIR=C:\nexrnc_dados\uploads"



echo [OK] Diretorio de Anexos Permanente: C:\nexrnc_dados\uploads
echo [OK] Python Portatil embutido pronto.
echo [OK] Frontend e Backend integrados na porta 3010.
echo.
echo ======================================================================
echo   O SISTEMA DE RNCS ESTA ATIVO E PRONTO PARA ACESSO!
echo.
echo   - Acesso Local no Servidor:  http://localhost:3010
echo   - Acesso na Rede da Empresa: http://10.1.1.7:3010
echo.
echo   [DICA] Para testar a conexao com o SQL Server 10.1.1.8, execute:
echo          TESTAR_CONEXAO_SQLSERVER.bat
echo.
echo   [IMPORTANTE] Mantenha esta janela aberta para o sistema continuar no ar.
echo   Para desligar o sistema, basta fechar esta janela.
echo ======================================================================
echo.

cd /d "%~dp0"
"%~dp0python\python.exe" -m uvicorn main:app --app-dir "%~dp0backend" --host 0.0.0.0 --port 3010
