# 🚀 Brief Rapide pour une Autre IA - DZ Tech Press

## En 2 Minutes

Tu vas gérer **DZ Tech Press**, une plateforme de news tech pour l'Algérie.

### 📍 Où c'est?
- **Local:** `E:\dz-tech-press\`
- **GitHub:** https://github.com/bastaps/dz-tech-press
- **Hosting:** https://dz-tech-press.pages.dev (Cloudflare Pages)
- **Domaine:** dz-tech-press.pages.dev

### 🏗️ La Techno
- **Backend:** Node.js + Express (port 3000)
- **Frontend:** HTML/CSS/JavaScript vanilla
- **DB:** Articles stockés en Markdown (dossier `articles/`)
- **Images:** Dossier `images/`

### ▶️ Démarrer
```bash
cd E:\dz-tech-press
npm install
npm start
```
Puis va sur: `http://localhost:3000`

### ❓ Qu'est-ce que ça fait?
- **Affiche** une liste d'articles tech
- **Panel Admin** (bouton en haut à droite) pour créer des articles
- **Tout automatique:** upload image → génère markdown → commit Git → push GitHub → redéploie sur Cloudflare

### 📁 Fichiers Clés
- `server.js` → Backend (gestion articles, images)
- `script.js` → Frontend + panel admin
- `index.html` → Page web
- `articles/` → Tous les articles (Markdown)
- `list.json` → Index des articles
- `package.json` → Dépendances

### 📝 Pour Créer un Article
1. Clique Admin (en haut à droite)
2. Remplis: Titre, Catégorie, Date, Image, Extrait, Tags, Contenu
3. Clique "Créer & Déployer"
4. **Automatique:** L'article est en ligne sur https://dz-tech-press.pages.dev en quelques secondes

### 🔧 Maintenance Basique
```bash
git status                    # Voir l'état
git log --oneline            # Voir l'historique
git push                      # Pousser les changements
npm start                     # Redémarrer le serveur
```

### ⚠️ À Savoir
- Ne touche pas `node_modules/`, `.git/`, `package-lock.json`
- Les modifications automatiques: `server.js` crée et commite les articles
- Cloudflare Pages se redéploie automatiquement au push GitHub
- Les articles sont au format Markdown avec Front Matter YAML

### 📚 Docs Complètes
Voir `HANDOVER.md` dans le repo pour tous les détails

---
**C'est bon? Utilise ce contexte et le repo GitHub pour des questions plus complexes. Go! 🚀**
