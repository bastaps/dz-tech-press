const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require("@octokit/rest");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. DÉTECTION DU MODE : On vérifie si on est sur Render ou sur le PC
// Sur Render, GITHUB_TOKEN existe. Sur ton PC, il n'existe pas.
const isCloud = !!process.env.GITHUB_TOKEN;

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const OWNER = "bastaps"; 
const REPO = "dz-tech-press";

// 2. CONFIGURATION DU STOCKAGE
const storage = isCloud ? multer.memoryStorage() : multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static('.'));

// 3. FONCTION POUR GÉNÉRER LA LISTE DES ARTICLES (list.json)
async function generateArticlesList() {
    try {
        const files = await fs.readdir('articles');
        const mdFiles = files
            .filter(f => f.endsWith('.md'))
            .sort((a, b) => parseInt(b) - parseInt(a));
        await fs.writeFile('articles/list.json', JSON.stringify(mdFiles, null, 2));
        return mdFiles;
    } catch (e) { console.error("Erreur liste:", e); }
}

// 4. API : CRÉER OU MODIFIER
app.post('/api/create-article', upload.single('image'), async (req, res) => {
    try {
        const { id, titre, categorie, date, heure, extrait, tags, contenu } = req.body;
        let fileName = (id && id !== "null") ? `${id}.md` : `${Date.now()}.md`;
        
        // Nettoyage des tags
        const tagsFormatted = tags.split(',').map(t => t.trim().replace(/"/g, '')).filter(t => t).map(t => `"${t}"`).join(', ');
        
        let imagePath = req.body.existingImage || "";
        if (req.file) {
            imagePath = isCloud ? `images/${Date.now()}-${req.file.originalname}` : `images/${req.file.filename}`;
        }

        const frontMatter = `---\ntitre: "${titre.replace(/"/g, '\\"')}"\ncategorie: ${categorie}\ndate: ${date}\nheure: ${heure}\nimage: ${imagePath}\nextrait: "${extrait.replace(/"/g, '\\"')}"\ntags: [${tagsFormatted}]\n---\n\n${contenu}\n`;

        if (isCloud) {
            // --- MODE RENDER (GITHUB API) ---
            if (req.file) await pushToGithub(imagePath, req.file.buffer, "Upload image", true);
            await pushToGithub(`articles/${fileName}`, frontMatter, `MAJ Article: ${titre}`);
            res.json({ success: true, message: "Enregistré sur GitHub via Render" });
        } else {
            // --- MODE PC LOCAL (DISQUE DUR E:) ---
            await fs.writeFile(path.join('articles', fileName), frontMatter);
            await generateArticlesList(); // Met à jour list.json localement
            console.log(`✅ Article ${fileName} enregistré sur le disque E:`);
            res.json({ success: true, message: "Enregistré localement sur E:" });
        }
    } catch (e) {
        console.error("Erreur API:", e);
        res.status(500).json({ message: e.message });
    }
});

// 5. API : SUPPRIMER
app.delete('/api/delete-article/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (isCloud) {
            const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: `articles/${id}.md` });
            await octokit.repos.deleteFile({ owner: OWNER, repo: REPO, path: `articles/${id}.md`, message: `Suppr ${id}`, sha: data.sha });
        } else {
            await fs.unlink(path.join('articles', `${id}.md`));
            await generateArticlesList();
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ message: "Erreur suppression" }); }
});

// Helper pour GitHub (utilisé uniquement si isCloud est vrai)
async function pushToGithub(path, content, message, isImg) {
    let sha;
    try { const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path }); sha = data.sha; } catch (e) { sha = null; }
    await octokit.repos.createOrUpdateFileContents({
        owner: OWNER, repo: REPO, path, message,
        content: isImg ? content.toString('base64') : Buffer.from(content).toString('base64'),
        sha
    });
}

app.listen(PORT, () => console.log(`🚀 Serveur actif en mode ${isCloud ? 'CLOUD (GitHub)' : 'LOCAL (Disque E:)'} sur port ${PORT}`));