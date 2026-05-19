# Observatoire du Marché de l'Internet en Algérie — T3 2025

> Infographie interactive prête à publier — basée sur les données ARPCE.

Une page web autonome, premium, responsive et 100 % statique qui transforme
le rapport PDF de l'ARPCE (Autorité de Régulation de la Poste et des
Communications Électroniques) en expérience visuelle interactive : graphiques
animés, scène 3D, exports CSV / JSON / PDF.

---

## 🚀 Publication en 3 commandes

Aucune compilation, aucune dépendance à installer. Tout est statique.

```bash
# 1. Copier le dossier sur votre serveur (FTP, rsync, ou via le CMS)
rsync -av observatoire-internet-algerie/ user@serveur:/var/www/site/infographies/observatoire-internet-algerie/

# 2. Coller le bloc vignette dans la grille de votre page "infographie"
#    (voir le snippet HTML dans thumbnail-integration.html)

# 3. Vérifier que les fichiers sont servis avec les bons en-têtes :
#    - .js servi en text/javascript (pour les modules ES6)
#    - .css en text/css ; .jpg/.webp/.svg avec cache long (immutable, 1 an)
```

C'est tout. Ouvrez l'URL — la page interactive se charge avec son loader,
puis affiche l'animation d'entrée.

---

## 📦 Contenu du package

```
observatoire-internet-algerie/
├── index.html                     ← page interactive principale
├── thumbnail-integration.html     ← exemple d'intégration de la vignette
├── thumbnail.jpg                  ← vignette 1200x800 (80 KB)
├── thumbnail.webp                 ← vignette format moderne (34 KB)
├── thumbnail-small.jpg            ← variante 600x400 pour grilles denses
├── thumbnail-small.webp           ← idem WebP (15 KB)
├── README.md                      ← ce fichier
└── assets/
    ├── css/styles.css             ← design system complet
    ├── img/thumbnail.svg          ← source vectorielle (modifiable)
    ├── img/thumbnail.png          ← rendu PNG du SVG
    ├── data/                      ← réservé (placeholder pour datasets futurs)
    └── js/
        ├── main.js                ← orchestration, animations, reveal scroll
        ├── data.js                ← dataset ARPCE T3 2025 (toutes les métriques)
        ├── charts.js              ← graphiques Chart.js (lazy-load)
        ├── scene3d.js             ← scène 3D Three.js
        └── exports.js             ← CSV / JSON / PDF / partage
```

**Poids total**: ~250 KB sur disque (sans les CDN). Premier chargement avec
CDN: ~700 KB compressé (Chart.js, Three.js, jsPDF, html2canvas, fonts).

---

## ✨ Fonctionnalités implémentées

### Interactivité
- **Vignette cliquable** vers la page interactive (lien direct ou iframe)
- **Scène 3D interactive** (Three.js) : cristal central, 3 orbes opérateurs
  qui orbitent, particules, tooltips au survol, glisser-zoomer
- **9 graphiques interactifs** (Chart.js) avec tooltips riches et animations d'entrée
- **Compteurs animés** sur les KPI principaux
- **Reveal au scroll** (IntersectionObserver — pas de bibliothèque externe)
- **Navigation latérale active** suivant la position de scroll
- **Navigation clavier** : ↑↓ entre sections, F pour plein écran

### Exports & partage
- **Export CSV** individuel pour chaque tableau (compatible Excel FR avec BOM UTF-8)
- **Export CSV complet** (tous les tableaux concaténés)
- **Export JSON** du dataset complet
- **Export PDF** de la page entière (html2canvas + jsPDF)
- **Partage natif** (Web Share API) avec fallback presse-papier
- **Mode plein écran** (Fullscreen API)

### Design & UX
- Direction esthétique : éditorial dark / data journalism premium
- Palette inspirée du désert algérien la nuit : or, vert oasis, terre cuite
- Typographie : Fraunces (display variable) + Manrope (corps) + JetBrains Mono (mono)
- Texture de bruit + auroras subtiles en arrière-plan
- Loader animé avec barre de progression shimmer
- Toasts pour les notifications utilisateur
- Boutons d'action flottants (plein écran, retour en haut)

### Performance & accessibilité
- **Chargement progressif** : graphiques et scène 3D initialisés via IntersectionObserver
- **Lazy loading** des canvas Chart.js
- **Responsive** : breakpoints à 1024px, 900px, 768px, 640px
- **`prefers-reduced-motion`** respecté
- ARIA labels sur les boutons, structure sémantique
- Contrastes WCAG AA
- Fallback `<noscript>` pour les utilisateurs sans JS

---

## 🛠 Choix techniques & justifications

| Choix | Pourquoi |
|---|---|
| **HTML/CSS/JS vanilla** (modules ES6) | Pas de build step, pas de framework lourd, déployable sur n'importe quel hébergement statique. Le code reste lisible et maintenable. |
| **Three.js 0.160** via CDN | Standard de fait pour le 3D web, MIT, performant. Importé en ESM directement depuis unpkg. |
| **Chart.js 4.4** | API simple, animations natives, thémable, ~70 KB gzippé. Plus léger que D3 pour ces usages classiques. |
| **jsPDF + html2canvas** | Export PDF côté client sans serveur — confidentialité totale, aucune donnée n'est envoyée à un tiers. |
| **Google Fonts** | Fraunces et Manrope sont distinctifs et gratuits. Auto-hébergement possible si vous voulez éviter le hit Google (voir section "auto-hébergement des polices"). |
| **Pas de framework** (React/Vue) | La page ne nécessite pas de state management complexe. Vanilla = plus rapide à charger, plus simple à modifier. |
| **CSS variables** | Permettent de re-thèmer toute la page en modifiant `:root` dans `styles.css`. |
| **IntersectionObserver** | API native pour le lazy-init des graphiques et le reveal au scroll — pas besoin de GSAP/AOS pour ces effets. |

### Pourquoi pas GSAP / AOS / framer-motion ?
Les animations utilisées (reveal au scroll, transitions hover, compteurs)
sont réalisables nativement avec CSS transitions + IntersectionObserver. Cela
évite une dépendance de 50–100 KB de plus, sans perte d'effet visible.

### Pourquoi pas un bundler (Vite/webpack) ?
Tous les modules sont en ES6 natif et chargés via `<script type="module">`.
Les navigateurs modernes (>95% d'usage) le supportent. Pas de transpilation
requise = pas de pipeline à maintenir.

---

## 🌐 Compatibilité navigateurs

| Navigateur | Version min | Notes |
|---|---|---|
| Chrome / Edge | 90+ | Support complet |
| Firefox | 88+ | Support complet |
| Safari | 14+ | Support complet (incl. iOS) |
| Mobile Chrome / Safari | iOS 14+, Android 10+ | Scène 3D peut être désactivée sur très anciens GPU |

WebGL 1.0 est requis pour la scène 3D. En cas d'indisponibilité, un message
de repli s'affiche automatiquement et le reste de la page fonctionne normalement.

---

## 🎨 Personnalisation rapide

### Modifier la palette de couleurs
Toutes les couleurs sont des CSS variables dans `assets/css/styles.css` (bloc `:root`).
Modifiez `--gold-500`, `--emerald-500`, `--crimson-500`, `--ink-*` pour
re-thèmer en quelques secondes.

### Mettre à jour les données (nouveau trimestre)
Un seul fichier à éditer : `assets/js/data.js`. Toutes les visualisations
sont rebranchées automatiquement.

### Re-générer la vignette
La vignette est `assets/img/thumbnail.svg` (modifiable au texte ou dans Figma/Inkscape).
Pour la re-rasterizer :
```bash
cairosvg assets/img/thumbnail.svg -o assets/img/thumbnail.png -W 1200
convert assets/img/thumbnail.png -quality 85 thumbnail.jpg
convert assets/img/thumbnail.png -quality 80 thumbnail.webp
```

---

## 🔒 Confidentialité & dépendances externes

- **Aucune clé API requise** — tout fonctionne avec des bibliothèques open-source.
- **Aucune donnée utilisateur collectée** — pas de tracker, pas d'analytics.
- **Exports 100 % côté client** — vos données ne quittent jamais le navigateur.
- **CDN externes utilisés** : `cdn.jsdelivr.net`, `unpkg.com`, `fonts.googleapis.com`.

### Auto-hébergement des dépendances (optionnel, recommandé pour production)
Pour ne pas dépendre des CDN tiers, téléchargez :
- Chart.js → https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js
- Three.js (+ OrbitControls) → https://unpkg.com/three@0.160.0/
- jsPDF → https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js
- html2canvas → https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
- Fonts → https://google-webfonts-helper.herokuapp.com/

Placez-les dans `assets/js/vendor/` et `assets/fonts/`, puis ajustez les
chemins dans `index.html` et `assets/js/scene3d.js`.

---

## 💸 Options payantes : aucune

Aucune dépendance payante n'a été utilisée. Les seules options payantes qu'on
*pourrait* envisager pour une version future :

- Hébergement CDN propre (Cloudflare R2, AWS S3 + CloudFront) — non nécessaire
  ici, n'importe quel hébergement statique suffit.
- Polices premium (Adobe Fonts, MyFonts) — non utilisées, Google Fonts gratuits
  font le travail.
- Plausible/Fathom Analytics si vous souhaitez tracker le trafic — non inclus.

---

## ⚠️ Limitations connues

1. **WebGL 1.0 requis pour la scène 3D**. Sur les navigateurs qui ne le supportent
   pas (très rare en 2026), un message de repli s'affiche. Le reste de la page
   fonctionne normalement.
2. **Export PDF** : le rendu PDF utilise `html2canvas`, qui rasterize la page.
   Le PDF résultant est donc une image (non sélectionnable) mais reste fidèle
   au rendu écran. Pour un PDF vectoriel/sélectionnable, il faudrait pré-générer
   une version statique côté serveur.
3. **Web Share API** : sur desktop, le partage natif est limité (Chrome OK,
   Firefox non). Le fallback copie le lien dans le presse-papier.
4. **Polices Google Fonts** : nécessitent un accès à `fonts.googleapis.com`.
   Si bloqué par firewall, la page utilisera Georgia / system-ui en fallback
   (toujours lisible mais moins distinctif). Voir section auto-hébergement.
5. **Compteurs animés** : se déclenchent à 40% de visibilité. Sur écrans très
   hauts, certains peuvent rester à 0 si jamais scrollés assez.

---

## 🧪 Tests recommandés avant publication

```bash
# Test local rapide
cd observatoire-internet-algerie
python3 -m http.server 8000
# Puis ouvrir http://localhost:8000/

# Test responsive
# Chrome DevTools > Toggle device toolbar > iPhone 12 / iPad / Desktop

# Audit Lighthouse
# Chrome DevTools > Lighthouse > Generate report
# Cibles : Performance > 85, Accessibility > 95, Best Practices > 95
```

---

## 📄 Source des données

Toutes les données proviennent du rapport public de l'**ARPCE — Autorité de
Régulation de la Poste et des Communications Électroniques** sur le marché
de l'internet en Algérie au 3<sup>ème</sup> trimestre 2025.

Aucune donnée personnelle ou confidentielle n'est utilisée — il s'agit
exclusivement d'agrégats statistiques publics.

---

## 📞 Support & contact

Pour toute question technique sur ce package : consultez d'abord ce README,
puis le code source (largement commenté).

Pour mettre à jour les données chaque trimestre, modifier `assets/js/data.js`
suffit dans 95% des cas.

---

*Conçu pour la section infographie · 100% statique · Premium · Responsive*
