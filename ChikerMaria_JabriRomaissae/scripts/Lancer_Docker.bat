@echo off
cd /d "%~dp0.."
echo Demarrage du projet avec Docker...
echo.
echo Assurez-vous que Docker Desktop est ouvert avant de continuer.
echo.
docker compose up --build
pause
