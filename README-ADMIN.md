# 📰 DZ Tech Press - Système Automatisé d'Articles

> **Créez et déployez des articles en 3 clics!** ✨

Un système complet pour **créer, héberger et déployer automatiquement** des articles de blog sans copier-coller manuel.

---

## 🎯 Le Problème Résolu

Avant ❌:
```
1. Créer article.md
2. Copier-coller front matter
3. Uploader image manuellement
4. Modifier TOTAL_ARTICLES
5. Commit et push
= 5 opérations, 10+ minutes ⏱️
```

Maintenant ✅:
```
1. Cliquez bouton +
2. Remplissez formulaire
3. Cliquez "Créer & Déployer"
= 1 opération, 30 secondes 🚀
```

---

## 🚀 Démarrage rapide

### Windows (Recommandé)
**Double-cliquez:** `start.bat`

### Mac/Linux
```bash
chmod +x start.sh
./start.sh
```

### VS Code
`Ctrl+Shift+B` → `🚀 Démarrer Admin Server`

---

## 📂 Qu'est-ce qui a été créé?

### Fichiers Core
| Fichier | Description |
|---------|------------|
| `server.js` | Serveur Node.js pour gérer les articles |
| `package.json` | Dépendances npm |
| `.vscode/tasks.json` | Tâches VS Code |
| `.vscode/launch.json` | Configuration de débogage |
| `.gitignore` | Fichiers à ignorer dans Git |

### Scripts Lanceurs
| Fichier | Usage |
|---------|-------|
| `start.bat` | 🪟 Pour Windows |
| `start.sh` | 🍎 Pour Mac/Linux |
| `QUICKSTART.md` | Guide rapide |
| `ADMIN.md` | Documentation complète |

### Modifications du Frontend
| Fichier | Modification |
|---------|------------|
| `index.html` | + Modale popup + Bouton admin |
| `script.js` | + Gestion de la modale + Submit |
| `style.css` | + Styles modale et formulaire |

---

## 🎬 Workflow Complet

### Étape 1: Lancer le serveur
```bash
npm start
# ou double-cliquez start.bat
```

### Étape 2: Ouvrir la page
Allez à: **http://localhost:3000**

### Étape 3: Créer un article
1. **Cliquez** le bouton `+` rouge (bas à droite)
2. **Remplissez** le formulaire:
   - Titre
   - Catégorie
   - Date & Heure
   - Image
   - Extrait
   - Tags
   - Contenu (Markdown)
3. **Cliquez** "Créer & Déployer"

### Étape 4: Voilà! ✨
L'article est automatiquement:
- ✅ Créé dans `articles/XX.md`
- ✅ Image uploadée dans `images/`
- ✅ `TOTAL_ARTICLES` mis à jour
- ✅ Commité dans Git
- ✅ Pushé vers GitHub

---

## 📋 Fonctionnalités Automatisées

### 🔢 Numérotation automatique
```
articles/1.md
articles/2.md  
articles/3.md → nouveau article
articles/4.md → le prochain
```

### 🖼️ Gestion d'images
```
Pour chaque upload:
- Validation du type (JPG, PNG, WebP, GIF)
- Sauvegarde dans images/
- Nom unique avec timestamp
```

### ⚙️ Mise à jour TOTAL_ARTICLES
```javascript
// Avant
const TOTAL_ARTICLES = 13;

// Après avoir créé 1 article
const TOTAL_ARTICLES = 14;  // ← Mis à jour automatiquement!
```

### 📦 Commit & Push Git
```bash
git add -A
git commit -m "✅ Nouvel article: Titre de l'article"
git push origin main
```

---

## 📝 Format du Front Matter

Chaque article utilise ce format:

```yaml
---
titre: "Mon Article"
categorie: Algérie
date: 2026-04-24
heure: 10:30
image: images/1234567890.jpg
extrait: "Résumé court de l'article"
tags: [Tag1, Tag2, Tag3]
---

# Contenu en Markdown

Du texte normal, **gras**, *italique*, etc.
```

---

## ⚙️ Configuration

### Changer le port
```bash
PORT=5000 npm start
```

### Désactiver Git automatique
Modifiez `server.js` ligne 95-101:
```javascript
// Commentez ces lignes:
// try {
//     execSync('git add -A', { ... });
// }
```

### Ajouter des catégories
Dans `index.html`, modale:
```html
<select id="categorie">
    <option value="Nouvelle Catégorie">Nouvelle Catégorie</option>
</select>
```

---

## 🔍 Vérification

**Tout fonctionne si:**
- ✅ `npm start` ne montre pas d'erreur
- ✅ http://localhost:3000 se charge
- ✅ Bouton `+` visible en bas à droite
- ✅ Formulaire s'ouvre au clic

**Problème?** Consultez les logs du terminal.

---

## 🐛 Dépannage

### Port 3000 déjà utilisé
```bash
PORT=5000 npm start
```

### Node.js pas trouvé
```bash
node --version
# Si erreur: installez depuis https://nodejs.org
```

### Git error (mais article créé)
Le système continue même si Git échoue. L'article est créé localement.

### Le formulaire n'envoie pas
- Serveur lancé? ✓
- Console affiche une erreur? (F12)
- Tous les champs remplis?

---

## 📊 Structure Finale

```
dz-tech-press/
│
├── 🎨 Frontend
│   ├── index.html
│   ├── script.js (+ admin panel)
│   └── style.css (+ admin styles)
│
├── 🚀 Backend
│   ├── server.js
│   └── package.json
│
├── 📝 Articles
│   └── articles/
│       ├── 1.md
│       ├── 2.md
│       └── ...
│
├── 🖼️ Images
│   └── images/
│       ├── 1.jpg
│       ├── 2.jpg
│       └── ...
│
├── 📖 Docs
│   ├── QUICKSTART.md
│   ├── ADMIN.md
│   └── README.md (ce fichier)
│
├── ⚙️ Config
│   └── .vscode/
│       ├── tasks.json
│       └── launch.json
│
└── 🚀 Lanceurs
    ├── start.bat (Windows)
    └── start.sh (Mac/Linux)
```

---

## 🔒 Sécurité

⚠️ **Ce système est conçu pour usage LOCAL uniquement.**

Pour production:
1. Ajouter authentification
2. Valider les uploads
3. Limiter taille fichiers
4. Configurer HTTPS
5. Ajouter rate limiting

---

## 📞 Support

### Vérifications
1. `npm -v` → Doit afficher une version
2. `node -v` → Doit afficher une version
3. `git --version` → Doit afficher une version

### Logs
- **Frontend:** Ouvrez Console (F12)
- **Backend:** Regardez le terminal

### Réinstaller
```bash
rm -rf node_modules
npm install
npm start
```

---

## 🎓 Comment ça fonctionne?

### Client (Browser)
```javascript
1. Utilisateur remplit formulaire
2. Clique "Créer & Déployer"
3. JavaScript envoie les données au serveur
4. Interface montre un message d'attente
5. Page se recharge avec le nouvel article
```

### Serveur (Node.js)
```javascript
1. Reçoit les données POST
2. Valide les champs
3. Sauvegarde l'image → images/
4. Crée le markdown → articles/
5. Met à jour script.js
6. Commit → Git
7. Push → GitHub
8. Envoie confirmation au client
```

---

## ✨ Prochaines Améliorations Possibles

- [ ] Éditeur markdown WYSIWYG
- [ ] Prévisualisation en temps réel
- [ ] Galerie d'images pour sélectionner
- [ ] Gestion des brouillons
- [ ] Planification de publication
- [ ] Authentification utilisateur
- [ ] Système de commentaires

---

## 📜 License

MIT

---

## 🎉 Vous êtes Prêt!

```bash
# Lancez le serveur
npm start

# Ouvrez le navigateur
# http://localhost:3000

# Créez votre premier article! 🚀
```

**Bon blogging!** 📰✨
