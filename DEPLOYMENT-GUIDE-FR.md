# 🚀 Guide de déploiement — Algeria Tech (français)

Ce guide vous accompagne pas à pas pour déployer vos dernières corrections sur **Render** et **Cloudflare Pages**, avec zéro temps d’attente et une fiabilité maximale.

---

## ✅ Prérequis
- Vous avez déjà un compte [Render](https://render.com/) et [Cloudflare Pages](https://pages.cloudflare.com/)
- Votre repo GitHub est : [`bastaps/algeria-tech`](https://github.com/bastaps/algeria-tech)
- Vous avez déjà poussé les modifications (`server.js`, `script.js`) dans votre branche `main`

---

## 🔧 Étape 1 : Déployer `server.js` sur Render

### 1.1. Accédez à votre service Render
- Allez sur [https://dashboard.render.com/web/services](https://dashboard.render.com/web/services)
- Cliquez sur votre service `dz-tech-press-api`

### 1.2. Ajoutez la variable d’environnement `GITHUB_TOKEN`
> ⚠️ **Essentiel** : sans cela, GitHub Sync ne marchera pas.

| Champ | Valeur |
|--------|---------|
| `Key` | `GITHUB_TOKEN` |
| `Value` | `ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` *(votre token personnel GitHub)* |

➡️ **Comment générer un token valide ?**
1. Allez sur GitHub → `Settings` → `Developer settings` → `Personal access tokens` → `Tokens (classic)`
2. Cliquez sur `Generate new token` → `Generate new token (classic)`
3. Donnez-lui un nom (ex: `algeria-tech-render`)
4. Cochez uniquement : `public_repo` et `workflow`
5. Générez → copiez-le **immédiatement** (vous ne le reverrez plus !)

✅ Enregistrez la variable → Render redémarre automatiquement.

### 1.3. Vérifiez `/health` sur Render
Une fois redémarré, ouvrez dans votre navigateur :

🔗 `https://dz-tech-press-api.onrender.com/health`

→ Vous devez voir exactement la même réponse que localement :
```json
{"status":"ok","uptime":...,"timestamp":"..."}
```

---

## 🌐 Étape 2 : Configurer Cloudflare Pages

### 2.1. Redéployez votre frontend
- Allez sur [Cloudflare Pages](https://pages.cloudflare.com/) → votre projet `algeria-tech`
- Cliquez sur `Edit project` → `Edit variables`
- Vérifiez que `API_BASE` n’est **pas définie** (votre `script.js` gère tout côté client)
- Lancez un nouveau déploiement manuel (`Deploy project`)

✅ Votre site sera mis à jour en < 2 min.

### 2.2. Testez la connexion API
Ouvrez votre site : `https://algeria-tech.pages.dev` → puis la console du navigateur (**F12 → Console**) → rafraîchissez.

Vous devriez voir :
- ✅ `Chargement des derniers articles…` (affiché immédiatement)
- ✅ Puis les articles, sans message d’erreur rouge
- ✅ Aucun `CORS error` dans l’onglet *Network*

---

## 🕒 Étape 3 : Garder Render toujours éveillé (UptimeRobot)

### 3.1. Créez un compte gratuit
- Allez sur [https://uptimerobot.com/](https://uptimerobot.com/)
- Cliquez sur `Create Free Account`

### 3.2. Ajoutez un monitor
1. Une fois connecté, cliquez sur `Add New Monitor`
2. Choisissez `HTTP(s)`
3. Remplissez :
   - **Friendly Name** : `Algeria Tech API Health`
   - **URL** : `https://dz-tech-press-api.onrender.com/health`
   - **Monitoring Interval** : `5 minutes`
4. Cliquez sur `Create Monitor`

✅ Dès maintenant, UptimeRobot pingera votre API toutes les 5 min → **plus jamais de "cold start"**.

---

## 🧪 Checklist finale (avant de prévenir vos lecteurs)

| ✅ À vérifier | Statut |
|--------------|--------|
| `/health` répond en < 1s sur Render ? | ☐ |
| `GITHUB_TOKEN` est bien défini dans Render ? | ☐ |
| `https://algeria-tech.pages.dev` affiche des articles sans délai ? | ☐ |
| Aucune erreur `CORS` ni `Network Error` dans la console ? | ☐ |
| Les articles créés via l’admin panel se publient bien sur GitHub ? | ☐ |

---

## 💡 Astuce pro
Si vous voulez tester une mise à jour **sans impacter vos lecteurs**, utilisez une branche `staging` sur GitHub + un sous-domaine `staging.algeria-tech.pages.dev`. Je peux vous générer ce workflow aussi — dites-moi !

---

✅ **Vous êtes prêt.** Votre site est désormais rapide, fiable, et entièrement automatisé. 

Besoin d’un script PowerShell pour automatiser les déploiements ? Ou d’une capture d’écran annotée pas-à-pas ? Je suis là ! 😊