@echo off
REM Script de démarrage pour DZ Tech Press Admin
REM Utilisateurs Windows: double-cliquez ce fichier pour lancer le serveur

echo.
echo ╔════════════════════════════════════════╗
echo ║  DZ Tech Press - Admin Server Launcher ║
echo ╚════════════════════════════════════════╝
echo.

REM Vérifier que Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé!
    echo.
    echo Téléchargez Node.js depuis: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js détecté
echo.

REM Vérifier et installer les dépendances
if not exist "node_modules" (
    echo ⏳ Installation des dépendances...
    call npm install
    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation
        pause
        exit /b 1
    )
    echo ✅ Dépendances installées
    echo.
)

REM Configurer Git (une seule fois)
git config user.name >nul 2>&1
if errorlevel 1 (
    echo ⚙️ Configuration Git première fois...
    setlocal enabledelayedexpansion
    set /p GIT_EMAIL="bastaps@yahoo.fr Git: "
    set /p GIT_NAME="bastaps/dz-tech-press Git: "
    git config user.email "!GIT_EMAIL!"
    git config user.name "!GIT_NAME!"
    echo ✅ Git configuré
    echo.
)

REM Lancer le serveur
echo.
echo 🚀 Lancement du serveur...
echo.
call npm start
pause
