/**
 * Server pour gérer la création, la modification et la suppression d'articles
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
 * API pour créer ou MODIFIER un article
 */
app.post('/api/create-article', upload.single('image'), async (req, res) => {
    try {
        const { id, titre, categorie, date, heure, extrait, tags, contenu } = req.body;
        
        // Image obligatoire uniquement si c'est un nouvel article (pas d'ID)
        if (!id && !req.file) {
            return res.status(400).json({ message: 'Image manquante' });
        }

        let articleFileName;
        let isUpdate = false;

        if (id && id !== "null") {
            // MODE MODIFICATION : On utilise l'ID existant
            articleFileName = `${id}.md`;
            isUpdate = true;
        } else {
            // MODE CRÉATION : On calcule le prochain numéro
            const files = await fs.readdir(articlesDir);
            const numbers = files
                .filter(f => f.endsWith('.md'))
                .map(f => parseInt(f.replace('.md', '')))
                .filter(n => !isNaN(n));
            const nextNumber = Math.max(...numbers, 0) + 1;
            articleFileName = `${nextNumber}.md`;
        }

        const articlePath = path.join(articlesDir, articleFileName);

        // Récupération du chemin de l'image (nouvelle ou ancienne)
        let imagePath;
        if (req.file) {
            imagePath = `images/${req.file.filename}`;
        } else {
            // Si modification sans nouvelle image, on garde l'ancienne (logique simplifiée)
            const oldContent = await fs.readFile(articlePath, 'utf-8');
            const match = oldContent.match(/image:\s*(.*)/);
            imagePath = match ? match[1].trim().replace(/^["']|["']$/g, '') : "";
        }

        const tagsFormatted = tags.split(',').map(t => t.trim()).filter(t => t).map(t => `"${t}"`).join(', ');

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

        await fs.writeFile(articlePath, frontMatter);
        await generateArticlesList();

        // Mise à jour de TOTAL_ARTICLES si c'est une création
        if (!isUpdate) {
            let scriptContent = await fs.readFile('script.js', 'utf-8');
            const newScript = scriptContent.replace(/const TOTAL_ARTICLES = \d+;/, `const TOTAL_ARTICLES = ${articleFileName.replace('.md', '')};`);
            await fs.writeFile('script.js', newScript);
        }

        // Commit et push automatique
        try {
            execSync('git add -A', { cwd: process.cwd(), stdio: 'pipe' });
            execSync(`git commit -m "✅ ${isUpdate ? 'MAJ' : 'Nouveau'}: ${titre}"`, { cwd: process.cwd(), stdio: 'pipe' });
            execSync('git push origin main', { cwd: process.cwd(), stdio: 'pipe' });
        } catch (gitError) { console.warn('Git sync error:', gitError.message); }

        res.json({ success: true, message: isUpdate ? 'Modifié' : 'Créé' });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: `Erreur: ${error.message}` });
    }
});

/**
 * API POUR SUPPRIMER UN ARTICLE (Corrige l'erreur réseau)
 */
app.delete('/api/delete-article/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const articlePath = path.join(articlesDir, `${id}.md`);
        
        await fs.unlink(articlePath);
        await generateArticlesList();

        // Synchro GitHub pour informer Cloudflare de la suppression
        try {
            execSync('git add -A', { cwd: process.cwd(), stdio: 'pipe' });
            execSync(`git commit -m "🗑️ Suppression article ${id}"`, { cwd: process.cwd(), stdio: 'pipe' });
            execSync('git push origin main', { cwd: process.cwd(), stdio: 'pipe' });
        } catch (gitError) { console.warn('Git sync error:', gitError.message); }

        res.json({ success: true, message: 'Article supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

/**
 * Page d'information
 */
app.get('/admin', (req, res) => {
    res.send(`<h1>✅ Serveur Admin Actif</h1><p>Prêt pour Création, Modification et Suppression.</p>`);
});

generateArticlesList().catch(error => {
    console.warn('Impossible de générer articles/list.json au démarrage:', error.message);
});

app.listen(PORT, () => {
    console.log(`\n🚀 Serveur Admin lancé sur http://localhost:${PORT}\n`);
});