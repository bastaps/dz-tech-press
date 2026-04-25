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

        // Commit et push automatique (optionnel)
        try {
            execSync('git add -A', { cwd: process.cwd(), stdio: 'pipe' });
            execSync(`git commit -m "✅ Nouvel article: ${titre}"`, { cwd: process.cwd(), stdio: 'pipe' });
            execSync('git push origin main', { cwd: process.cwd(), stdio: 'pipe' });
        } catch (gitError) {
            console.warn('Avertissement Git:', gitError.message);
            // On continue même si git échoue
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
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin DZ Tech Press</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; background: #f4f5f7; padding: 40px 20px; }
                .container { max-width: 800px; margin: 0 auto; }
                .admin-header { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 30px; }
                .admin-header h1 { color: #006233; margin-bottom: 10px; }
                .admin-header p { color: #666; margin-bottom: 20px; }
                .status { background: #e8f5e9; border-left: 4px solid #006233; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
                .status.error { background: #ffebee; border-left-color: #d21034; }
                .status-icon { margin-right: 10px; }
                a { color: #006233; text-decoration: none; font-weight: 600; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="admin-header">
                    <h1>✅ Serveur Admin DZ Tech Press</h1>
                    <p>Serveur actif sur le port <strong>${PORT}</strong></p>
                    
                    <div class="status">
                        <span class="status-icon">✅</span>
                        Le serveur fonctionne correctement
                    </div>
                    
                    <h3 style="margin-top: 25px; margin-bottom: 15px;">🚀 Comment utiliser:</h3>
                    <ol style="padding-left: 20px; line-height: 1.8;">
                        <li>Allez sur <a href="http://localhost:${PORT}" target="_blank">http://localhost:${PORT}</a></li>
                        <li>Cliquez sur le bouton <strong>+</strong> rouge (en bas à droite)</li>
                        <li>Remplissez le formulaire et cliquez sur <strong>Créer & Déployer</strong></li>
                        <li>L'article sera automatiquement créé et pushé vers GitHub</li>
                    </ol>
                    
                    <h3 style="margin-top: 25px; margin-bottom: 15px;">📋 Fonctionnalités:</h3>
                    <ul style="padding-left: 20px; line-height: 1.8;">
                        <li>✅ Génération automatique du numéro d'article</li>
                        <li>✅ Upload d'image dans <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">images/</code></li>
                        <li>✅ Création du fichier markdown avec front matter</li>
                        <li>✅ Mise à jour automatique de <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">TOTAL_ARTICLES</code></li>
                        <li>✅ Commit et push automatique vers GitHub</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
    `);
});

generateArticlesList().catch(error => {
    console.warn('Impossible de générer articles/list.json au démarrage:', error.message);
});

app.listen(PORT, () => {
    console.log(`\n🚀 Serveur Admin lancé sur http://localhost:${PORT}`);
    console.log(`📝 Visitez http://localhost:${PORT}/admin pour les infos\n`);
});
