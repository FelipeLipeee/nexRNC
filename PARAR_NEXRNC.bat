@echo off
title Parar nexRNC
echo Finalizando processo na porta 3010...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3010') do (
    taskkill /PID %%a /F /T 2>nul
)
echo [OK] nexRNC finalizado.
pause
