# Observatoire du Marché de la Téléphonie Mobile en Algérie — T3 2025

> Infographie interactive prête à publier — basée sur les données ARPCE.
> Sister-package de « Observatoire du Marché de l'Internet en Algérie ».

Une page web autonome, premium, responsive et 100 % statique qui transforme
le rapport PDF de l'ARPCE (Autorité de Régulation de la Poste et des
Communications Électroniques) sur la téléphonie mobile en expérience visuelle
interactive : 10 graphiques animés, scène 3D « Champ de Signaux », exports
CSV / JSON / PDF.

---

## 🚀 Publication en 3 commandes

Aucune compilation, aucune dépendance à installer. Tout est statique.

```bash
# 1. Copier le dossier sur votre serveur
rsync -av observatoire-telephonie-mobile-algerie/ user@serveur:/var/www/site/infographies/observatoire-telephonie-mobile-algerie/

# 2. Coller le bloc vignette dans la grille de votre page "infographie"
#    (snippet dans thumbnail-integration.html)

# 3. Vérifier que .js est servi en text/javascript (modules ES6),
#    .css en text/css, et que les images ont un cache long.
```

C'est tout.

---

## 📦 Contenu du package

```
observatoire-telephonie-mobile-algerie/
├── index.html                       ← page interactive principale
├── thumbnail-integration.html       ← exemple d'intégration de la vignette
├── thumbnail.jpg                    ← vignette 1200x800 (~79 KB)
├── thumbnail.webp                   ← vignette format moderne (~33 KB)
├── thumbnail-small.jpg              ← variante 600x400 pour grilles denses
├── thumbnail-small.webp             ← idem WebP (~14 KB)
├── README.md                        ← ce fichier
└── assets/
    ├── css/styles.css               ← design system (identique au sister-package)
    ├── img/thumbnail.svg            ← source vectorielle de la vignette
    ├── img/thumbnail.png            ← rendu PNG du SVG
    ├── data/                        ← réservé
    └── js/
        ├── main.js                  ← orchestration, animations, reveal scroll
        ├── data.js                  ← dataset ARPCE T3 2025 (toutes les métriques)
        ├── charts.js                ← 10 graphiques Chart.js
        ├── scene3d.js               ← scène 3D « Champ de Signaux »
        └── exports.js               ← CSV / JSON / PDF / partage
```

**Poids total** : ~340 KB sur disque (sans CDN). Premier chargement avec
CDN ~700 KB compressé (Chart.js, Three.js, jsPDF, html2canvas, fonts).

---

## ✨ Fonctionnalités

### Scène 3D — « Champ de Signaux »
Une métaphore visuelle dédiée à la téléphonie mobile, distincte de la
constellation cosmique du rapport Internet :
- Une **plaine low-poly** stylisée (sol avec relief subtil + grille filaire dorée)
- **3 antennes lumineuses verticales** = les 3 opérateurs (Mobilis / Djezzy / Ooredoo),
  hauteurs proportionnelles à leurs parts de marché
- **Anneaux d'ondes radio** qui émanent de chaque antenne et se propagent au sol
- **24 particules de communication** qui voyagent en arcs paraboliques entre les
  antennes (= appels et SMS qui transitent)
- **Poussière atmosphérique** dorée flottant dans l'air
- Glisser pour faire pivoter, survoler une antenne pour voir l'opérateur

### 10 graphiques interactifs (Chart.js)
| # | Section | Type |
|---|---|---|
| 1 | Parts de marché T3 2025 | Donut |
| 2 | Évolution parc global (5 trimestres) | Line multi-séries |
| 3 | Répartition technologie GSM/3G/4G | Donut |
| 4 | Technologies par opérateur | Barres horizontales empilées |
| 5 | Prépayé vs Postpayé global | Donut |
| 6 | Prépayé vs Postpayé par opérateur | Barres groupées |
| 7 | Répartition trafic voix | Donut |
| 8 | Évolution trafic voix (5 trimestres) | Line avec gradient |
| 9 | Répartition trafic SMS | Donut |
| 10 | Évolution trafic SMS (5 trimestres) | Line avec gradient |

### Exports & partage
- **CSV par tableau** (10 datasets exportables individuellement)
- **CSV complet** (tous les tableaux concaténés, compatible Excel FR)
- **JSON** du dataset complet
- **PDF** de la page entière (jsPDF + html2canvas)
- **Partage natif** Web Share API (fallback presse-papier)
- **Plein écran** (Fullscreen API)

### UX
- Compteurs animés sur les KPI principaux
- Reveal au scroll (IntersectionObserver)
- Navigation latérale active suivant la position
- Navigation clavier : ↑↓ entre sections, F pour plein écran
- Lazy-init des graphiques et de la 3D
- Loader animé + toasts de confirmation
- Responsive : breakpoints à 1024px, 900px, 768px, 640px

---

## 🛠 Cohérence avec le sister-package

Ce rapport partage **strictement le même design system** que l'observatoire
de l'Internet :
- Mêmes CSS variables (palette désert algérien, typographies Fraunces /
  Manrope / JetBrains Mono)
- Mêmes composants UI (KPI cards, data-blocks, topbar, FAB, toasts, loader)
- Mêmes patterns d'animation (reveal, compteurs, transitions)
- Mêmes choix techniques (vanilla JS modules, lazy-init, CDN)

**Ce qui change** :
- La scène 3D : *Champ de Signaux* (antennes + ondes) au lieu de *Constellation*
  (cristal + orbes orbitants)
- Les sections de données : opérateurs, technologies, prépayé/postpayé, trafic
  voix & SMS au lieu de fixe/mobile, débits, M2M
- Le code projet en haut à droite : **02** au lieu de **07**

Cela permet de publier les deux rapports côte à côte dans la grille
« Infographies » avec une **identité visuelle commune et reconnaissable**.

---

## 🌐 Compatibilité navigateurs

| Navigateur | Version min |
|---|---|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ (incl. iOS) |
| Mobile | iOS 14+, Android 10+ |

WebGL 1.0 requis pour la scène 3D. Repli automatique sinon (le reste fonctionne).

---

## 🎨 Personnalisation rapide

### Modifier les données (T4 ou trimestres suivants)
Un seul fichier à éditer : `assets/js/data.js`. Toutes les visualisations,
le tableau récapitulatif et les exports sont automatiquement re-câblés.

### Modifier la palette
Tout est dans le bloc `:root` de `assets/css/styles.css`. Modifiez
`--gold-500`, `--emerald-500`, `--crimson-500` pour re-thèmer.

### Re-générer la vignette
La vignette source est `assets/img/thumbnail.svg` (modifiable au texte ou
dans Figma/Inkscape). Pour la re-rasterizer :
```bash
cairosvg assets/img/thumbnail.svg -o assets/img/thumbnail.png -W 1200
convert assets/img/thumbnail.png -quality 85 thumbnail.jpg
convert assets/img/thumbnail.png -quality 80 thumbnail.webp
```

---

## 🔒 Confidentialité

- **Aucune clé API requise** — tout fonctionne avec des bibliothèques open-source.
- **Aucune donnée utilisateur collectée** — pas de tracker, pas d'analytics.
- **Exports 100% côté client** — vos données ne quittent jamais le navigateur.
- **CDN externes** : `cdn.jsdelivr.net`, `unpkg.com`, `fonts.googleapis.com`.

Pour ne pas dépendre des CDN tiers en production, voir la procédure
d'auto-hébergement dans le README du package « Internet ».

---

## ⚠️ Limitations connues

1. **WebGL 1.0 requis** pour la scène 3D. Sinon repli automatique sur message texte.
2. **Export PDF** : rendu rasterizé via html2canvas (fidèle à l'écran mais non
   sélectionnable). Pour un PDF vectoriel, prévoir une génération côté serveur.
3. **Web Share API** : limitée sur desktop. Fallback copie presse-papier.
4. **Google Fonts** : nécessitent accès à `fonts.googleapis.com`. Fallback
   Georgia / system-ui sinon.

---

## 📄 Source des données

Toutes les données proviennent du rapport public de l'**ARPCE — Autorité de
Régulation de la Poste et des Communications Électroniques** sur le marché
de la **téléphonie mobile** en Algérie au 3<sup>ème</sup> trimestre 2025.

Les données couvrent : parc global par opérateur, technologies (GSM/3G/4G),
modèle d'abonnement (prépayé/postpayé), trafic voix et SMS, MOU/ARPU, et
l'évolution sur 5 trimestres (T3 2024 → T3 2025).

---

## 📞 Contact & maintenance

Pour mettre à jour les données chaque trimestre : modifier `assets/js/data.js`
suffit dans 95% des cas. Le code est largement commenté et organisé en modules
indépendants.

---

*Conçu pour la section infographie · 100% statique · Premium · Responsive*
*Sister-package : « Observatoire du Marché de l'Internet en Algérie »*
