# 🎉 INSTALLATION & UTILISATION

## 📝 Checklist D'Installation

### ✅ Étape 1: Vérifications Préalables
- [ ] Node.js installé (`node --version`)
- [ ] Git configuré (`git config user.name`)
- [ ] Vous êtes dans le dossier `dz-tech-press`

### ✅ Étape 2: Installer les Dépendances
```bash
npm install
```
Cela installe:
- express (serveur web)
- multer (gestion fichiers)

### ✅ Étape 3: Vérifier la Configuration Git
```bash
git config user.name
git config user.email
```

Si rien n'affiche:
```bash
git config user.email "votre@email.com"
git config user.name "Votre Nom"
```

### ✅ Étape 4: Lancer le Serveur

**Option 1: Ligne de commande**
```bash
npm start
```

**Option 2: Windows (double-cliquez)**
```
start.bat
```

**Option 3: Mac/Linux**
```bash
chmod +x start.sh
./start.sh
```

**Option 4: VS Code (Ctrl+Shift+B)**
- Sélectionnez: "🚀 Démarrer Admin Server"

---

## 🌐 Accéder à l'Application

Ouvrez dans votre navigateur:
```
http://localhost:3000
```

Vous devriez voir:
- La page d'accueil
- Un bouton `+` rouge en bas à droite
- Les articles existants

---

## ✨ Créer un Premier Article

### 1. Cliquez le bouton `+`
Localisé en bas à droite de l'écran

### 2. Remplissez le formulaire
```
Titre: "Mon Premier Article"
Catégorie: Algérie
Date: Aujourd'hui
Heure: Maintenant
Image: Choisir une image (JPG, PNG, WebP, GIF)
Extrait: "Un petit résumé"
Tags: "Innovation, Algérie, Test"
Contenu: "Écrivez votre article en Markdown..."
```

### 3. Cliquez "Créer & Déployer"

### 4. Attendez le message ✅

---

## 🔄 Workflow Automatisé

Quand vous créez un article:

1. **Fichier créé** → `articles/14.md`
2. **Image uploadée** → `images/1712234567.jpg`
3. **Front matter généré**:
```yaml
---
titre: "Mon Premier Article"
categorie: Algérie
date: 2026-04-24
heure: 14:30
image: images/1712234567.jpg
extrait: "Un petit résumé"
tags: [Innovation, Algérie, Test]
---
```
4. **TOTAL_ARTICLES mis à jour** → 14
5. **Git commit** → "✅ Nouvel article: Mon Premier Article"
6. **Git push** → Vers GitHub

**Tout cela automatiquement en 30 secondes!** ⚡

---

## 📁 Fichiers Affectés

Après création d'un article:

```
✅ articles/14.md                    ← Créé
✅ images/1712234567.jpg             ← Uploadé
✅ script.js (TOTAL_ARTICLES)        ← Mis à jour
✅ Git history                       ← Commité & pushé
```

---

## 🛑 Arrêter le Serveur

Dans le terminal:
```
Ctrl + C
```

---

## 🔧 Configuration Avancée

### Changer le port
```bash
PORT=5000 npm start
```

### Désactiver Git auto
Modifiez `server.js` autour de la ligne 95:
```javascript
// Commentez ces 3 lignes:
// execSync('git add -A', ...);
// execSync('git commit -m "..."', ...);
// execSync('git push origin main', ...);
```

### Accepter plus de formats d'image
Modifiez `server.js` ligne 28:
```javascript
const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'  // ← Ajouter SVG
];
```

---

## 🐛 Problèmes Courants

### Le serveur ne démarre pas
```
❌ npm: command not found
```
**Solution:** Node.js n'est pas installé
- Téléchargez de https://nodejs.org
- Redémarrez votre terminal

### Port 3000 déjà utilisé
```
❌ Error: listen EADDRINUSE :::3000
```
**Solution:**
```bash
PORT=5000 npm start
```

### Formulaire n'envoie pas
1. Ouvrez Console (F12)
2. Regardez pour les erreurs rouges
3. Vérifiez que le serveur est lancé

### Git push échoue
- Vérifiez votre connexion Internet
- Vérifiez les credentials Git
- Le système continue même si Git échoue

---

## ✅ Vérification Finale

Avant de commencer:

- [ ] `npm start` affiche "🚀 Serveur Admin lancé"
- [ ] http://localhost:3000 se charge
- [ ] Vous voyez le bouton `+` rouge
- [ ] Le clic ouvre le formulaire
- [ ] Tous les champs se remplissent
- [ ] L'image upload se prévisualise
- [ ] Le bouton "Créer & Déployer" est clickable

---

## 🚀 Vous Êtes Prêt!

```bash
# 1. Installer
npm install

# 2. Lancer
npm start

# 3. Ouvrir
# http://localhost:3000

# 4. Créer
# Cliquez + et remplissez le formulaire!
```

**C'est fait! 🎉 Vous pouvez maintenant créer des articles en 30 secondes.**

---

## 📞 Aide Supplémentaire

### Documentation Complète
- 📖 **README-ADMIN.md** - Guide complet
- 📖 **ADMIN.md** - Documentation technique
- 📖 **QUICKSTART.md** - Démarrage rapide

### Logs
- **Frontend:** F12 → Console
- **Backend:** Terminal Node.js

### Réinitialiser
```bash
rm -rf node_modules
npm install
npm start
```

---

**Version:** 1.0  
**Date:** April 2026  
**Status:** ✅ Ready to Use
