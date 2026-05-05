const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require("@octokit/rest");
const cors = require('cors'); // AJOUTÉ : Pour autoriser Cloudflare

const app = express();
const PORT = process.env.PORT || 3000;

// Autoriser les requêtes venant d'ailleurs (Cloudflare)
app.use(cors()); 

const isCloud = !!process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const OWNER = "bastaps"; 
const REPO = "dz-tech-press";

const storage = isCloud ? multer.memoryStorage() : multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static('.'));

// --- NOUVELLE ROUTE : ENVOYER LA LISTE DES ARTICLES ---
app.get('/api/articles', async (req, res) => {
    try {
        if (isCloud) {
            const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: 'articles' });
            const files = data.filter(f => f.name.endsWith('.md')).map(f => f.name);
            res.json(files);
        } else {
            const files = await fs.readdir('articles');
            res.json(files.filter(f => f.endsWith('.md')));
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- NOUVELLE ROUTE : ENVOYER LE CONTENU D'UN ARTICLE ---
app.get('/api/article-content/:file', async (req, res) => {
    try {
        const fileName = req.params.file;
        if (isCloud) {
            const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: `articles/${fileName}` });
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            res.send(content);
        } else {
            const content = await fs.readFile(path.join('articles', fileName), 'utf-8');
            res.send(content);
        }
    } catch (e) {
        res.status(404).send("Article non trouvé");
    }
});

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

app.post('/api/create-article', upload.single('image'), async (req, res) => {
    try {
        const { id, titre, categorie, date, heure, extrait, tags, contenu } = req.body;
        let fileName = (id && id !== "null") ? `${id}.md` : `${Date.now()}.md`;
        
        let tagsFormatted = "";
        if (tags) {
            tagsFormatted = tags.split(',').map(t => t.trim().replace(/"/g, '')).filter(t => t).map(t => `"${t}"`).join(', ');
        }
        
        let imagePath = req.body.existingImage || "";
        if (req.file) {
            imagePath = isCloud ? `images/${Date.now()}-${req.file.originalname}` : `images/${req.file.filename}`;
        }

        const frontMatter = `---\ntitre: "${titre.replace(/"/g, '\\"')}"\ncategorie: ${categorie}\ndate: ${date}\nheure: ${heure}\nimage: ${imagePath}\nextrait: "${extrait.replace(/"/g, '\\"')}"\ntags: [${tagsFormatted}]\n---\n\n${contenu}\n`;

        if (isCloud) {
            if (req.file) await pushToGithub(imagePath, req.file.buffer, "Upload image", true);
            await pushToGithub(`articles/${fileName}`, frontMatter, `MAJ Article: ${titre}`);
            res.json({ success: true, message: "Enregistré sur GitHub" });
        } else {
            await fs.writeFile(path.join('articles', fileName), frontMatter);
            await generateArticlesList();
            res.json({ success: true, message: "Enregistré localement" });
        }
    } catch (e) {
        console.error("Erreur API:", e);
        res.status(500).json({ message: e.message });
    }
});

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

async function pushToGithub(path, content, message, isImg) {
    let sha;
    try { const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path }); sha = data.sha; } catch (e) { sha = null; }
    await octokit.repos.createOrUpdateFileContents({
        owner: OWNER, repo: REPO, path, message,
        content: isImg ? content.toString('base64') : Buffer.from(content).toString('base64'),
        sha
    });
}

app.listen(PORT, () => console.log(`🚀 Serveur actif sur port ${PORT}`));