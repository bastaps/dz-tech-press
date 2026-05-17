@echo off
chcp 65001 >nul
REM Script de démarrage pour Algeria Tech Admin
REM Utilisateurs Windows: double-cliquez ce fichier pour lancer le serveur

echo.
echo ╔════════════════════════════════════════╗
echo ║   Algeria Tech - Admin Server Launcher  ║
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

REM --- CONFIGURATION FFMPEG (FORCAGE ET VERIFICATION REELLE) ---
set "PATH=E:\ffmpeg\bin;%PATH%"

ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR : FFmpeg est introuvable ou ne peut pas s'exécuter.
    echo Vérifiez que le fichier existe bien ici : E:\ffmpeg\bin\ffmpeg.exe
    pause
    exit /b 1
)
echo ✅ FFmpeg opérationnel (E:\ffmpeg\bin)
echo ✅ Node.js détecté
echo.

REM --- CONFIGURATION PYTHON (ENVIRONNEMENT LOCAL SUR E:) ---
echo ⚙️ Vérification de l'environnement Python sur E:...
if not exist "venv" (
    echo ⏳ Création de l'environnement virtuel sur E:\algeria-tech\venv...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Erreur : Python n'est pas installé ou n'est pas dans le PATH.
        echo Téléchargez Python sur https://www.python.org/
        pause
        exit /b 1
    )
    echo ✅ Environnement virtuel créé.
)

echo ⏳ Synchronisation des outils vidéo sur E:...
call venv\Scripts\activate
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des outils Python.
    pause
    exit /b 1
)
echo ✅ Environnement Python prêt.
echo.

REM --- LANCEMENT DIRECT DU PROCESSEUR ---
echo 🚀 Lancement de l'outil Algeria Tech Infographie Pro...
call venv\Scripts\activate
python processor.py
pause
