/**
 * Server pour gérer la création automatique d'articles
 * Lance avec: node server.js
 * Accédez à: http://localhost:3000
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration multer pour les uploads d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}${ext}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type d\'image non supporté'));
        }
    }
});

app.use(express.json());
app.use(express.static('.'));

const articlesDir = 'articles';
const listJsonPath = path.join(articlesDir, 'list.json');

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function generateArticlesList() {
    const files = await fs.readdir(articlesDir);
    const mdFiles = files
        .filter(file => file.endsWith('.md'))
        .sort((a, b) => parseInt(a.replace('.md', ''), 10) - parseInt(b.replace('.md', ''), 10));

    await fs.writeFile(listJsonPath, JSON.stringify(mdFiles, null, 2), 'utf-8');
    return mdFiles;
}

/**
 * API pour récupérer automatiquement la liste des articles
 */
app.get('/api/articles', async (req, res) => {
    try {
        if (await fileExists(listJsonPath)) {
            const json = await fs.readFile(listJsonPath, 'utf-8');
            return res.json(JSON.parse(json));
        }

        const mdFiles = await generateArticlesList();
        res.json(mdFiles);
    } catch (error) {
        console.error('Erreur liste articles:', error);
        res.status(500).json({ message: 'Impossible de charger la liste des articles' });
    }
});

/**
 * API pour créer un nouvel article
 */
app.post('/api/create-article', upload.single('image'), async (req, res) => {
    try {
        const { titre, categorie, date, heure, extrait, tags, contenu } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Image manquante' });
        }

        // Valider les champs requis
        const required = [titre, categorie, date, heure, extrait, tags, contenu];
        if (required.some(field => !field)) {
            return res.status(400).json({ message: 'Champs manquants' });
        }

        // Trouver le prochain numéro d'article
        const articlesDir = 'articles';
        const files = await fs.readdir(articlesDir);
        const numbers = files
            .filter(f => f.endsWith('.md'))
            .map(f => parseInt(f.replace('.md', '')))
            .filter(n => !isNaN(n));
        
        const nextNumber = Math.max(...numbers, 0) + 1;
        const articleFileName = `${nextNumber}.md`;
        const articlePath = path.join(articlesDir, articleFileName);

        // Créer le front matter
        const tagsFormatted = tags
            .split(',')
            .map(t => t.trim())
            .filter(t => t)
            .map(t => `"${t}"`)
            .join(', ');

        const imagePath = `images/${req.file.filename}`;
        
        const frontMatter = `---
titre: "${titre.replace(/"/g, '\\"')}"
categorie: ${categorie}
date: ${date}
heure: ${heure}
image: ${imagePath}
extrait: "${extrait.replace(/"/g, '\\"')}"
tags: [${tagsFormatted}]
---

${contenu}
`;

        // Sauvegarder le fichier markdown
        await fs.writeFile(articlePath, frontMatter);

        // Mettre à jour la liste des articles
        await generateArticlesList();

        // Mettre à jour TOTAL_ARTICLES dans script.js
        let scriptContent = await fs.readFile('script.js', 'utf-8');
        const newScript = scriptContent.replace(
            /const TOTAL_ARTICLES = \d+;/,
            `const TOTAL_ARTICLES = ${nextNumber};`
        );
        await fs.writeFile('script.js', newScript);

        // Commit et push automatique
        try {
            execSync('git add -A', { cwd: process.cwd(), stdio: 'pipe' });
            execSync(`git commit -m "✅ Nouvel article: ${titre}"`, { cwd: process.cwd(), stdio: 'pipe' });
            execSync('git push origin main', { cwd: process.cwd(), stdio: 'pipe' });
            console.log('✅ Push GitHub réussi - Cloudflare va se mettre à jour');
        } catch (gitError) {
            console.warn('⚠️ Avertissement Git:', gitError.message);
        }

        res.json({
            success: true,
            message: 'Article créé avec succès',
            article: {
                id: nextNumber,
                titre,
                categorie,
                date,
                heure,
                image: imagePath,
                fileName: articleFileName
            }
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            message: `Erreur: ${error.message}`
        });
    }
});

/**
 * Page d'information
 */
app.get('/admin', (req, res) => {
    res.send(`
<h1>✅ Serveur Admin DZ Tech Press</h1>
<p>Serveur actif sur le port ${PORT}</p>
<h3>🚀 Comment utiliser:</h3>
<ol>
    <li>Allez sur <a href="http://localhost:${PORT}">http://localhost:${PORT}</a></li>
    <li>Cliquez sur le bouton Admin</li>
    <li>Remplissez le formulaire et cliquez sur Créer & Déployer</li>
    <li>L'article sera automatiquement créé et pushé vers GitHub</li>
</ol>
<h3>📋 Fonctionnalités:</h3>
<ul>
    <li>✅ Génération automatique du numéro d'article</li>
    <li>✅ Upload d'image dans images/</li>
    <li>✅ Création du fichier markdown avec front matter</li>
    <li>✅ Mise à jour automatique de TOTAL_ARTICLES</li>
    <li>✅ Commit et push automatique vers GitHub</li>
    <li>✅ Cloudflare Pages se met à jour automatiquement</li>
</ul>
    `);
});

// Créer les dossiers s'ils n'existent pas
if (!fs.existsSync) {
    const fsSync = require('fs');
    if (!fsSync.existsSync('images')) {
        fsSync.mkdirSync('images', { recursive: true });
    }
    if (!fsSync.existsSync('articles')) {
        fsSync.mkdirSync('articles', { recursive: true });
    }
}

generateArticlesList().catch(error => {
    console.warn('Impossible de générer articles/list.json au démarrage:', error.message);
});

app.listen(PORT, () => {
    console.log(`\n🚀 Serveur Admin lancé sur http://localhost:${PORT}`);
    console.log(`📝 Visitez http://localhost:${PORT}/admin pour les infos\n`);
});