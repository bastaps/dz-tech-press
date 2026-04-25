# 🚀 DZ Tech Press - Système Automatisé d'Articles

## 📌 Vue d'ensemble

Ce système permet de **créer et déployer automatiquement** des articles en une seule opération, sans copier-coller manuel.

### ✨ Fonctionnalités

✅ **Modale popup** pour créer des articles  
✅ **Upload automatique** des images  
✅ **Génération du markdown** avec front matter  
✅ **Mise à jour automatique** de `TOTAL_ARTICLES`  
✅ **Commit et push** automatique vers GitHub  

---

## 🛠️ Installation

### 1. Installer les dépendances

```bash
npm install
```

Cela installe:
- `express` (serveur web)
- `multer` (gestion des uploads)

### 2. Configurer Git (une seule fois)

```bash
git config user.email "votre@email.com"
git config user.name "Votre Nom"
```

### 3. Lancer le serveur

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 🎯 Utilisation

### Depuis le navigateur

1. **Allez sur** `http://localhost:3000`
2. **Cliquez le bouton rouge** `+` (en bas à droite)
3. **Remplissez le formulaire:**
   - ✏️ Titre
   - 📁 Catégorie
   - 📅 Date et heure
   - 🖼️ Image
   - 📝 Extrait (résumé)
   - 🏷️ Tags (séparés par des virgules)
   - 📄 Contenu (Markdown supporté)
4. **Cliquez** `Créer & Déployer`

**Voilà!** ✅ L'article est automatiquement:
- Sauvegardé dans `articles/XX.md`
- L'image est uploadée dans `images/`
- Le `TOTAL_ARTICLES` est mis à jour
- Tout est commité et pushé vers GitHub

---

## 📁 Structure des fichiers

```
dz-tech-press/
├── server.js              ← Serveur Node.js
├── package.json           ← Dépendances npm
├── index.html             ← Page web
├── script.js              ← JavaScript frontend + admin
├── style.css              ← Styles (avec styles admin)
├── articles/
│   ├── 1.md
│   ├── 2.md
│   └── ...
└── images/
    ├── 1.jpg
    ├── 2.jpg
    └── ...
```

---

## 🔧 Configuration avancée

### Changer le port
```bash
PORT=5000 npm start
```

### Désactiver le push Git automatique
Modifiez `server.js` ligne 97-103 et commentez les appels `execSync` pour Git.

### Format du front matter

Chaque article a ce format:
```yaml
---
titre: "Mon Article"
categorie: Algérie
date: 2026-04-24
heure: 10:30
image: images/1234567890.jpg
extrait: "Résumé court..."
tags: [Tag1, Tag2, Tag3]
---

Contenu en Markdown...
```

---

## 🐛 Dépannage

### Le formulaire n'apparaît pas?
- Vérifiez que le serveur est lancé (`npm start`)
- Attendez que la page se charge complètement
- Cherchez le bouton `+` rouge en bas à droite

### L'image ne s'upload pas?
- Assurez-vous que le dossier `images/` existe
- Vérifiez que le fichier est une image valide (JPG, PNG, WebP, GIF)

### Git error?
- Vérifiez votre configuration Git:
  ```bash
  git config --list
  ```
- Vérifiez votre connexion Internet
- Le système continue même si Git échoue

---

## 📱 Version mobile

L'interface s'adapte automatiquement aux petits écrans. Le formulaire sera responsive sur mobile.

---

## 🔒 Sécurité

⚠️ **Important:** Ce serveur est prévu pour un usage **local uniquement**.

Pour un déploiement en production:
1. Ajoutez une authentification
2. Validez les uploads d'images
3. Limitez la taille des fichiers
4. Configurez HTTPS
5. Ajoutez des rate limits

---

## 📞 Support

En cas de problème:
1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs du serveur terminal
3. Assurez-vous que Node.js est bien installé: `node --version`

---

## 📝 Exemple de formulaire rempli

```
Titre: "Algérie lance un projet IoT revolutionnaire"
Catégorie: Innovation
Date: 2026-04-24
Heure: 14:30
Image: [admin]
Extrait: "Un projet pilote pour connecter les villes intelligentes"
Tags: "Innovation, IoT, Gouvernance, Algérie, 5G"
Contenu: "Texte de l'article..."
```

---

## 🎉 Vous êtes prêt!

Lancez votre serveur et commencez à créer des articles. Le système prend soin de tout le reste! 🚀

```bash
npm start
# Puis ouvrez http://localhost:3000
```

Bonne chance! 📰
