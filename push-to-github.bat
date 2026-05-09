@echo off
title Algeria Tech — Push vers GitHub

echo.
echo 🔹 Préparation du dépôt Git...
where git >nul 2>&1 || (echo ❌ Git non trouvé. Installez-le depuis https://git-scm.com/ & pause & exit /b 1)

cd /d "e:\algeria-tech"
if not exist ".git" (
    echo ❌ Ce dossier n'est pas un dépôt Git.
    echo ➡️ Exécutez d'abord : git init && git remote add origin https://github.com/bastaps/algeria-tech.git
    pause
    exit /b 1
)

echo.
echo ✅ Dépôt Git détecté.

echo.
echo 🔹 Analyse des modifications...
for /f %%i in ('git status --porcelain ^| findstr /c:"M " ^| wc -l 2^>nul') do set modified=%%i
if %modified% equ 0 (
    echo ⚠️ Aucune modification détectée. Le dépôt est à jour.
    pause
    exit /b 0
)
echo ✅ %modified% fichier(s) modifié(s) trouvé(s).

echo.
echo 🔹 Ajout et commit...
git add .
set /p commitMsg="📝 Entrez le message de commit (ex: 'feat: ajout YouTube dans les partages') : "
if "%commitMsg%"=="" set commitMsg="feat: ajout YouTube dans les partages"

git commit -m "%commitMsg%"

echo.
echo 🔹 Envoi vers GitHub (branche main)...
git push origin main

echo.
echo 🎉 Déploiement lancé !
echo → Cloudflare Pages va détecter la mise à jour et redéployer automatiquement.
echo → Votre site sera mis à jour sous ~30 secondes sur : https://algeria-tech.pages.dev
pause