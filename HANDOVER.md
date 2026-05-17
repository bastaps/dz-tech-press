# 📋 Transmission du Projet Algeria Tech

**Document destiné aux autres IAs et développeurs prenant en charge ce projet.**

---

## 🎯 Vue d'ensemble du projet Algeria Tech

**Nom:** Algeria Tech  
**Description:** Plateforme de news technologiques pour l'Algérie avec système d'administration automatisé  
**Type:** Application web full-stack (Node.js + HTML/CSS/JS)  
**Objectif principal:** Publier automatiquement des articles avec gestion Git et déploiement continu

---

## 📍 Localisations du Projet

### 1. **Local - Disque E:**
- **Chemin:** `E:\algeria-tech\`
- **Usage:** Développement, tests locaux
- **Accès:** Répertoire personnel Windows
- **Dossier actif:** Contient `.git` et `node_modules`

### 2. **GitHub Repository**
- **URL:** `https://github.com/bastaps/algeria-tech`
- **Owner:** bastaps
- **Accès:** Git SSH configuré sur la machine
- **Usage:** Versioning, source of truth, collaboration

### 3. **Cloudflare Pages**
- **Project Name:** algeria-tech
- **Domain:** `algeria-tech.pages.dev`
- **Usage:** Production hosting, déploiement continu via GitHub
- **Configuration:** Automatique lors du push sur GitHub

---

## 🏗️ Structure du Projet

```
E:\dz-tech-press\
├── 📄 index.html           # Page web principale
├── 📄 script.js            # JavaScript frontend + panel admin
├── 📄 style.css            # Styles CSS (includes admin panel)
├── 📄 server.js            # Serveur Express Node.js
├── 📄 package.json         # Dépendances npm
├── 📄 package-lock.json    # Lockfile npm
│
├── 📁 articles/            # Base de données articles (Markdown)
│   ├── 1.md
│   ├── 2.md
│   ├── ... XX.md
│   └── list.json           # Index des articles
│
├── 📁 images/              # Stockage des images uploadées
│   ├── image1.png
│   └── ...

├── 📁 vidéos/              # Vidéos MP4 générées par l'outil Python
│   └── video_XXXXXXXXXX.mp4
│
├── 📁 node_modules/        # Dépendances installées (ne pas commiter)
├── 📁 .git/                # Repository Git local
│
├── 📁 .vscode/             # Configuration VS Code
├── 📁 backup_conflicts/    # Fichiers de backup
│
└── 📄 Documentation files  # README.md, ADMIN.md, etc.
```

---

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** v14+ installé
- **Git** configuré (`git config user.name` et `git config user.email`)
- **npm** installé (vient avec Node.js)

### Installation & Lancement

```bash
# 1. Accéder au répertoire
cd E:\dz-tech-press

# 2. Installer les dépendances (première fois seulement)
npm install

# 3. Démarrer le serveur
npm start

# Le serveur démarre sur http://localhost:3000
```

### Options de Démarrage
- **Ligne de commande:** `npm start`
- **Windows batch:** `start.bat`
- **Linux/Mac:** `./start.sh`

---

## 📦 Stack Technologique

| Composant | Technologie | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | 14+ |
| **Framework Web** | Express.js | ^4.18.2 |
| **Upload Fichiers** | Multer | ^1.4.5-lts.1 |
| **Frontend** | HTML5/CSS3/JavaScript | Vanilla |
| **Markdown** | marked.min.js | Inclus |
| **VCS** | Git | v2+ |
| **Hosting** | Cloudflare Pages | dz-tech-press.pages.dev |

---

## ⚙️ Fonctionnalités Clés

### Panel Admin (Interface Web)
- **Accès:** Bouton Admin en haut à droite de `index.html`
- **Formulaire:** Titre, Catégorie, Date, Image, Extrait, Tags, Contenu
- **Actions automatiques:**
  - ✅ Upload image vers `images/`
  - ✅ Génération markdown avec front matter
  - ✅ Numérotation automatique (XX.md)
  - ✅ Mise à jour de `list.json`
  - ✅ Git commit automatique
  - ✅ Push vers GitHub

### Système d'Articles
- **Format:** Markdown + Front Matter YAML
- **Stockage:** `articles/` (1.md, 2.md, 3.md, ... XX.md)
- **Métadonnées:** Titre, auteur, date, catégorie, tags, image
- **Rendu:** Côté client avec `marked.js`

---

## 🔄 Flux de Travail Git

1. **Création article via panel admin**
2. **Fichier créé:** `articles/XX.md`
3. **Git automatique:**
   ```bash
   git add .
   git commit -m "Article XX: [titre]"
   git push origin main
   ```
4. **Webhook Cloudflare:** Détecte le push → rebuild → déploiement
5. **En ligne sur:** `https://dz-tech-press.pages.dev`

---

## 🛠️ Tâches de Maintenance Courantes

### Ajouter un Article
```bash
# Accéder à http://localhost:3000 → Admin Panel → Formulaire
# L'ajout est complètement automatisé
```

### Modifier un Article
```bash
# Éditer directement : E:\dz-tech-press\articles\XX.md
# Puis commiter et pusher
git add articles/XX.md
git commit -m "Mise à jour article XX"
git push
```

### Vérifier l'État du Repo
```bash
git status                    # État actuel
git log --oneline            # Historique des commits
git branch -a                # Branches disponibles
```

### Redéployer sur Cloudflare Pages
```bash
# Redéploiement automatique au push GitHub
# Ou: allez sur https://dash.cloudflare.com/ → Pages → dz-tech-press → Redeploy
```

---

## 🔑 Configuration Requise

### Git Configuration (une fois)
```bash
git config user.email "votre@email.com"
git config user.name "Votre Nom"
```

### GitHub SSH Keys
- Les clés SSH doivent être configurées sur la machine locale
- Vérifie avec: `ssh -T git@github.com`

### Cloudflare Pages Setup
- **Build command:** (Cloudflare Pages n'a pas besoin, c'est du contenu statique)
- **Framework preset:** None
- **Branch:** main
- **Production branch:** main

---

## 📊 Données Importantes

### Variables Globales
- **TOTAL_ARTICLES:** Nombre total d'articles (mis à jour automatiquement)
- **articles/list.json:** Index JSON de tous les articles

### Format Article Markdown
```markdown
---
title: Titre de l'Article
author: Auteur
date: 2024-04-26
category: Tech
tags: tag1, tag2
image: image-filename.png
---

# Titre

Contenu de l'article en Markdown...
```

---

## ⚠️ Points d'Attention

### Fichiers à NE PAS MODIFIER
- `node_modules/` → Regénérer avec `npm install`
- `.git/` → Git management automatique
- `package-lock.json` → Versionning des dépendances

### Fichiers Critiques (à protéger)
- `articles/list.json` → Doit rester synchronisé
- `server.js` → Logique backend
- `script.js` → Logique frontend + admin

### Commandes À ÉVITER
- `npm install --save` → Utiliser `npm install package-name` ou modifier `package.json`
- Force push (`git push -f`) → Risque de perte de données
- Supprimer articles sans backup

---

## 📞 Contacts & Ressources

- **Repository GitHub:** https://github.com/bastaps/dz-tech-press
- **Domain Cloudflare:** dz-tech-press.pages.dev
- **Local Development:** http://localhost:3000
- **Git:** Voir `.git/` pour l'historique complet

---

## 🎓 Pour les Autres IAs

### Si vous prenez en charge ce projet:

1. **Vérifier les prérequis:**
   ```bash
   node --version      # Doit être v14+
   npm --version       # Doit être installé
   git --version       # Doit être installé
   git config --list   # Vérifier user.name et user.email
   ```

2. **Cloner et installer** (si besoin):
   ```bash
   git clone https://github.com/bastaps/dz-tech-press.git
   cd dz-tech-press
   npm install
   ```

3. **Lancer le serveur:**
   ```bash
   npm start
   ```

4. **Consulter les fichiers de documentation:**
   - `README.md` → Guide utilisateur
   - `ADMIN.md` → Utilisation du panel admin
   - `INSTALLATION.md` → Instructions d'installation
   - `HANDOVER.md` → Ce fichier (transmission)

5. **Pour modifier le code:**
   - Éditer les fichiers dans le repo local
   - Tester sur `http://localhost:3000`
   - Commiter et pousser vers GitHub
   - Cloudflare Pages se met à jour automatiquement

---

**Dernière mise à jour:** 26 avril 2026  
**État:** Production  
**Responsable actuel:** Vous (l'autre IA)  

✅ Prêt à être repris par une autre IA/développeur
