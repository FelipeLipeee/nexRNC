@echo off
title Liberar Porta 3010 no Firewall
echo ======================================================================
echo   LIBERANDO PORTA 3010 (nexRNC) NO FIREWALL DO WINDOWS
echo ======================================================================
echo.
netsh advfirewall firewall delete rule name="nexRNC Esteira (Porta 3010)" >nul 2>&1
netsh advfirewall firewall add rule name="nexRNC Esteira (Porta 3010)" dir=in action=allow protocol=TCP localport=3010 profile=domain,private,public
echo.
echo [OK] Porta 3010 liberada com sucesso!
echo.
pause
