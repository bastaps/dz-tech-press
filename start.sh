#!/bin/bash

# Script de démarrage pour DZ Tech Press Admin
# Utilisateurs Linux/Mac: exécutez: chmod +x start.sh && ./start.sh

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  DZ Tech Press - Admin Server Launcher ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé!"
    echo ""
    echo "Téléchargez Node.js depuis: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js détecté"
echo ""

# Vérifier et installer les dépendances
if [ ! -d "node_modules" ]; then
    echo "⏳ Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation"
        exit 1
    fi
    echo "✅ Dépendances installées"
    echo ""
fi

# Configurer Git (une seule fois)
if ! git config user.name > /dev/null 2>&1; then
    echo "⚙️ Configuration Git première fois..."
    read -p "Entrez votre email Git: " GIT_EMAIL
    read -p "Entrez votre nom Git: " GIT_NAME
    git config user.email "$GIT_EMAIL"
    git config user.name "$GIT_NAME"
    echo "✅ Git configuré"
    echo ""
fi

# Lancer le serveur
echo ""
echo "🚀 Lancement du serveur..."
echo ""
npm start
