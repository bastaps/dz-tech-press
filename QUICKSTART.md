# ⚡ Quick Start

## Pour Windows (recommandé)

### 1️⃣ Double-cliquez `start.bat`

C'est tout! Le serveur va:
- ✅ Installer les dépendances automatiquement
- ✅ Configurer Git si nécessaire  
- ✅ Lancer le serveur

### 2️⃣ Ouvrez http://localhost:3000

### 3️⃣ Cliquez le bouton `+` rouge (bas à droite)

---

## Pour Mac/Linux

```bash
chmod +x start.sh
./start.sh
```

Puis ouvrez http://localhost:3000

---

## 🎬 Workflow complet

### Avant (sans le système)
1. Créer un fichier `XX.md` manuellement
2. Copier-coller le front matter
3. Écrire le contenu
4. Uploader l'image manuellement
5. Modifier `TOTAL_ARTICLES`
6. Commit et push

### Maintenant (avec le système) ✨
1. Cliquez `+`
2. Remplissez le formulaire
3. Cliquez `Créer & Déployer`

**Fini!** ✅ Tout est automatisé

---

## ✨ Le système fait automatiquement:

- 📝 Génère le fichier markdown
- 🖼️ Upload l'image
- 🔢 Attribue le bon numéro
- ⚙️ Met à jour TOTAL_ARTICLES
- 📦 Commit avec un message
- 🚀 Push vers GitHub

---

## ❓ FAQ

**Q: Ça fonctionne sans serveur?**
R: Non, vous devez lancer le serveur avec `start.bat` ou `npm start`

**Q: Peut-on ajouter plusieurs articles à la fois?**
R: Oui, chaque article est indépendant. Créez-les un par un.

**Q: Comment arrêter le serveur?**
R: Appuyez sur `Ctrl+C` dans le terminal

**Q: L'article apparaît immédiatement?**
R: Oui, la page se recharge automatiquement après 1 seconde

---

## 🔍 Vérifier que tout fonctionne

1. Serveur lancé? → http://localhost:3000 doit charger
2. Bouton `+` visible? → Bas à droite de la page
3. Formulaire s'ouvre? → Cliquez sur le bouton `+`

Si problème → Consultez le terminal pour les erreurs

---

## 📞 Support

- Terminal affiche une erreur? → Copier le message d'erreur
- Port 3000 déjà utilisé? → `PORT=5000 npm start`
- Node.js pas trouvé? → Installez depuis https://nodejs.org

---

## 🎉 Vous êtes prêt!

```bash
# Pour Windows: double-cliquez start.bat
# Pour Mac/Linux: chmod +x start.sh && ./start.sh

# Puis ouvrez: http://localhost:3000
```

**Commencez à créer des articles! 🚀**
