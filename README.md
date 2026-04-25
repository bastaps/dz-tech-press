# DZ Tech Press - Installation et Utilisation

## 🚀 Installation Rapide

### ✅ Étape 1: Vérifications Préalables
- **Node.js** installé (version 14+ recommandée)
- **Git** configuré avec vos identifiants
- **Navigateur web** moderne

### ✅ Étape 2: Installation des Dépendances
```bash
npm install
```

### ✅ Étape 3: Démarrage du Serveur
**Windows:**
```bash
start.bat
```
**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```
**Ou directement:**
```bash
npm start
```

### ✅ Étape 4: Accès à l'Application
Ouvrez votre navigateur et allez sur : `http://localhost:3000`

## 📝 Utilisation

### Création d'un Article
1. Cliquez sur le bouton **"Admin"** en haut à droite
2. Remplissez le formulaire :
   - **Titre** : Le titre de votre article
   - **Contenu** : Le contenu en Markdown
   - **Catégorie** : (optionnel) Catégorie de l'article
   - **Tags** : (optionnel) Tags séparés par des virgules
   - **Image** : (optionnel) Image à uploader
3. Cliquez sur **"Créer l'Article"**

### Fonctionnalités Automatiques
- ✅ **Numérotation automatique** des articles
- ✅ **Front matter automatique** avec métadonnées
- ✅ **Upload d'images** vers le dossier `images/`
- ✅ **Commit Git automatique** avec message descriptif
- ✅ **Push automatique** vers le repository

## 📁 Structure des Fichiers

```
dz-tech-press/
├── index.html          # Page principale
├── script.js           # JavaScript frontend
├── style.css           # Styles CSS
├── server.js           # Serveur backend Node.js
├── package.json        # Configuration npm
├── start.bat           # Script démarrage Windows
├── start.sh            # Script démarrage Linux/Mac
├── articles/           # Articles en Markdown
│   ├── 1.md
│   ├── 2.md
│   └── ...
└── images/             # Images des articles
    ├── image1.jpg
    ├── image2.png
    └── ...
```

## 🔧 Configuration

### Port du Serveur
Par défaut, le serveur démarre sur le port 3000. Pour changer :
```bash
PORT=8080 npm start
```

### Configuration Git
Assurez-vous que Git est configuré :
```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

## 🐛 Dépannage

### Erreur "npm install"
- Vérifiez que Node.js est installé : `node -v`
- Vérifiez que npm est installé : `npm -v`
- Supprimez `node_modules` et `package-lock.json` puis réessayez

### Erreur "Port déjà utilisé"
- Changez le port : `PORT=8080 npm start`
- Ou trouvez le processus : `netstat -ano | findstr :3000`

### Erreur Git
- Vérifiez la configuration Git
- Assurez-vous d'avoir les droits push sur le repository

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de la console du navigateur (F12)
2. Vérifiez les logs du serveur dans le terminal
3. Consultez les erreurs npm/git

---

**DZ Tech Press** - Plateforme de news tech en Algérie 🇩🇿