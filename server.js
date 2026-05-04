/**
 * Server pour DZ Tech Press - Version Render & GitHub
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
// Importation de l'outil pour parler à GitHub (Octokit)
const { Octokit } = require("@octokit/rest");

const app = express();
const PORT = process.env.PORT || 3000;

// CONFIGURATION GITHUB (Utilise le Token que tu as mis dans Render)
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const OWNER = "bastaps"; 
const REPO = "dz-tech-press"; // Ton nom de dépôt corrigé ici

// Stockage en mémoire vive (nécessaire pour Render)
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static('.'));

/**
 * Fonction pour envoyer les fichiers vers GitHub
 */
async function pushToGithub(filePath, content, message, isImage = false) {
    try {
        let currentSha;
        try {
            const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: filePath });
            currentSha = data.sha;
        } catch (e) { currentSha = null; }

        await octokit.repos.createOrUpdateFileContents({
            owner: OWNER,
            repo: REPO,
            path: filePath,
            message: message,
            content: isImage ? content.toString('base64') : Buffer.from(content).toString('base64'),
            sha: currentSha
        });
        return true;
    } catch (error) {
        console.error("Erreur GitHub API:", error);
        return false;
    }
}

/**
 * API pour créer ou MODIFIER un article
 */
app.post('/api/create-article', upload.single('image'), async (req, res) => {
    try {
        const { id, titre, categorie, date, heure, extrait, tags, contenu } = req.body;
        
        let articleFileName = (id && id !== "null") ? `${id}.md` : `${Date.now()}.md`;

        let imagePath = req.body.existingImage || "";
        if (req.file) {
            imagePath = `images/${Date.now()}-${req.file.originalname}`;
            await pushToGithub(imagePath, req.file.buffer, "Upload image via Render", true);
        }

        const tagsFormatted = tags.split(',').map(t => t.trim()).filter(t => t).map(t => `"${t}"`).join(', ');
        const frontMatter = `---\ntitre: "${titre.replace(/"/g, '\\"')}"\ncategorie: ${categorie}\ndate: ${date}\nheure: ${heure}\nimage: ${imagePath}\nextrait: "${extrait.replace(/"/g, '\\"')}"\ntags: [${tagsFormatted}]\n---\n\n${contenu}\n`;

        // Envoi du texte vers GitHub
        const success = await pushToGithub(`articles/${articleFileName}`, frontMatter, `Article: ${titre}`);

        if (success) res.json({ success: true });
        else res.status(500).json({ message: "Erreur synchro GitHub" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * API POUR SUPPRIMER UN ARTICLE
 */
app.delete('/api/delete-article/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filePath = `articles/${id}.md`;
        const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: filePath });
        
        await octokit.repos.deleteFile({
            owner: OWNER, repo: REPO, path: filePath,
            message: `Suppression article ${id}`,
            sha: data.sha
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Erreur suppression GitHub" });
    }
});

app.get('/admin', (req, res) => {
    res.send(`<h1>✅ Serveur Admin DZ Tech Press en ligne</h1>`);
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur actif sur le port ${PORT}`);
});