# 💬 Prompt à Copier-Coller pour une Autre IA

Copie le texte ci-dessous et envoie-le à une autre IA (ChatGPT, Claude, etc.):

---

**CONTEXTE:** Je te confie mon projet **DZ Tech Press**, une plateforme de news technologiques pour l'Algérie.

**LOCALISATIONS:**
- **Local (développement):** E:\dz-tech-press\
- **GitHub (source):** https://github.com/bastaps/dz-tech-press
- **Production (live):** https://dz-tech-press.pages.dev (Cloudflare Pages)
- **Domaine:** dz-tech-press.pages.dev

**TECHNOLOGIE:**
- Backend: Node.js + Express (port 3000)
- Frontend: HTML/CSS/JavaScript vanilla
- Articles stockés en Markdown dans le dossier `articles/`
- Images dans le dossier `images/`

**COMMENT DÉMARRER:**
```bash
cd E:\dz-tech-press
npm install
npm start
```
Puis accède à http://localhost:3000

**FONCTIONNALITÉ PRINCIPALE:**
- Plateforme d'affichage d'articles
- Panel Admin automatisé (bouton en haut à droite) pour créer des articles
- Tout est automatisé: upload image → génération markdown → commit Git → push GitHub → redéploiement automatique sur Cloudflare Pages

**FICHIERS IMPORTANTS:**
- `server.js` = Backend
- `script.js` = Frontend + panel admin
- `index.html` = Page web
- `articles/` = Base de données des articles (Markdown)
- `package.json` = Dépendances (express, multer)

**CE QUE JE BESOIN QUE TU FASSES:**
[Décris ici ce que tu veux que l'autre IA fasse]

**RESSOURCES SUPPLÉMENTAIRES:**
- Voir `HANDOVER.md` pour la documentation complète
- Voir `BRIEF.md` pour le résumé court
- Voir `ADMIN.md` pour les instructions d'utilisation
- Le repo GitHub a l'historique complet des changements

Merci de prendre en charge ce projet!

---

**USAGE:**
1. Copie le texte ci-dessus
2. Ouvre un chat avec une autre IA (ChatGPT, Claude, Copilot, etc.)
3. Colle le prompt
4. Ajoute: "Je veux que tu [fasses quelque chose avec ce projet]"
5. L'IA aura maintenant le contexte complet!

---

**EXEMPLE DE MESSAGE COMPLET:**

"Je te confie mon projet DZ Tech Press [... colle le texte ci-dessus ...]

Je veux que tu m'aides à:
- Ajouter une fonctionnalité de search
- Corriger un bug dans le panel admin
- Optimiser la performance
- [Ton besoin ici]"

---
