@echo off
setlocal

set "PROJECT_DIR=%~dp0"

if not exist "%PROJECT_DIR%backend-laravel\artisan" (
    set "PROJECT_DIR=C:\Users\Dell\Documents\Codex\2026-05-20\files-mentioned-by-the-user-chikermaria\ChikerMaria_JabriRomaissae\"
)

if not exist "%PROJECT_DIR%backend-laravel\artisan" (
    echo Projet introuvable.
    echo Verifiez que le dossier ChikerMaria_JabriRomaissae existe encore.
    pause
    exit /b 1
)

echo ============================================================
echo Systeme de prediction du prix des maisons
echo ============================================================
echo.
echo Avant de continuer, demarrez WAMP/MySQL si ce n'est pas deja fait.
echo.
echo Ce fichier va ouvrir :
echo - le serveur Laravel : http://127.0.0.1:8000
echo - le frontend React : http://127.0.0.1:5173
echo.

if not exist "%PROJECT_DIR%ia\models\house_price_model.joblib" (
    start "IA - Entrainement du modele" /D "%PROJECT_DIR%ia" cmd /k "py -m pip install -r requirements.txt & py train_model.py"
)

start "Backend Laravel" /D "%PROJECT_DIR%backend-laravel" cmd /k "if not exist vendor composer install & if not exist .env copy .env.example .env & php artisan key:generate --force & php artisan migrate & php artisan serve --host=127.0.0.1 --port=8000"

start "Frontend React" /D "%PROJECT_DIR%frontend-react" cmd /k "if not exist node_modules npm install & if not exist .env copy .env.example .env & npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 5 /nobreak >nul
start "" "http://127.0.0.1:5173"

echo Les fenetres de lancement sont ouvertes.
echo Gardez-les ouvertes pendant l'utilisation du projet.
pause
