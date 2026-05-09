# 📄 start-dev.ps1 — Version stable & bloquée (Windows 25H2)
# ✅ Exécutez-le avec un clic droit → "Exécuter avec PowerShell"
# ⚠️ Ne double-cliquez pas — utilisez toujours "Exécuter avec PowerShell"

$ErrorActionPreference = "Stop"
Clear-Host

Write-Host "`n🔵 DÉMARRAGE LOCAL ALGERIA TECH — MODE DÉVELOPPEMENT" -ForegroundColor Blue
Write-Host "=========================================================" -ForegroundColor DarkGray

# Vérification Node.js/npm
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERREUR : Node.js non installé." -ForegroundColor Red
    Write-Host "➡️ Téléchargez-le depuis https://nodejs.org/ (version LTS)" -ForegroundColor Yellow
    Read-Host "`nAppuyez sur Entrée pour fermer..."
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERREUR : npm non trouvé. Node.js doit être installé avec npm." -ForegroundColor Red
    Read-Host "`nAppuyez sur Entrée pour fermer..."
    exit 1
}
Write-Host "✅ Node.js $(node --version) et npm $(npm --version) détectés." -ForegroundColor Green

# Accès au dossier
Set-Location "e:\algeria-tech"
Write-Host "📁 Dossier projet : e:\algeria-tech" -ForegroundColor Green

# Ouvre les URLs avant de lancer le serveur (pour ne pas bloquer)
Write-Host "`n🌐 Ouverture des pages de test..." -ForegroundColor Cyan
Start-Process "http://localhost:3000" -ErrorAction SilentlyContinue
Start-Process "http://localhost:3000/health" -ErrorAction SilentlyContinue

# Lance le serveur EN PREMIER PLAN (logs visibles en direct)
Write-Host "`n🚀 Lancement du serveur Express (npm start)..." -ForegroundColor Cyan
Write-Host "→ Les logs apparaîtront ci-dessous. Appuyez sur Ctrl+C pour arrêter." -ForegroundColor Yellow
Write-Host "=========================================================`n" -ForegroundColor DarkGray

# Exécute npm start en premier plan — la console reste ouverte tant que le serveur tourne
npm start

# Message final (ne s'affiche que si le serveur est arrêté)
Write-Host "`n🔴 Le serveur a été arrêté." -ForegroundColor Red
Write-Host "✅ Vous pouvez relancer ce script à tout moment." -ForegroundColor Green
Read-Host "`nAppuyez sur Entrée pour fermer cette fenêtre..."