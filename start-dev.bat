@echo off
title Algeria Tech — Serveur Local

echo.
echo 🔹 Vérification de Node.js et npm...
where node >nul 2>&1 || (echo ❌ Node.js non trouvé. Installez-le depuis https://nodejs.org/ & pause & exit /b 1)
where npm >nul 2>&1 || (echo ❌ npm non trouvé. Node.js doit être installé avec npm. & pause & exit /b 1)

echo.
echo ✅ Node.js et npm détectés.

echo.
echo 🔹 Démarrage du serveur...
cd /d "e:\algeria-tech"
start "" "http://localhost:3000"

echo.
echo 🚀 Lancement de 'npm start'...
echo → Les logs s'affichent ci-dessous. Appuyez sur Ctrl+C pour arrêter.
echo ===============================================================

:: Lance npm start en premier plan (les logs sont visibles)
npm start

echo.
echo 🔴 Le serveur a été arrêté.
echo ✅ Vous pouvez relancer ce script à tout moment.
pause