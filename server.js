const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const fsSync = require('fs'); // Nécessaire pour la veille (lecture/écriture synchrone)
const path = require('path');
const { Octokit } = require("@octokit/rest");
const cors = require('cors');
const https = require('https'); // Pour les appels API gratuits
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: [
        'https://algeria-tech.pages.dev',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true
}));
const isCloud = !!process.env.GITHUB_TOKEN;
const octokit = process.env.GITHUB_TOKEN 
  ? new Octokit({ auth: process.env.GITHUB_TOKEN }) 
  : null;
const OWNER = "bastaps";
const REPO = "algeria-tech";
const storage = isCloud ? multer.memoryStorage() : multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
app.use(express.json());
app.use(express.static('.'));

// --- ROUTES ARTICLES (CORRIGÉES) ---
app.get('/api/articles', async (req, res) => {
    try {
        if (isCloud && octokit) {
            const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: 'articles' });
            const files = data.filter(f => f.name.endsWith('.md')).map(f => f.name);
            res.json(files);
        } else if (isCloud && !octokit) {
            console.warn('[API] GITHUB_TOKEN non défini → mode local forcé pour /api/articles');
            const files = await fs.readdir('articles');
            res.json(files.filter(f => f.endsWith('.md')));
        } else {
            const files = await fs.readdir('articles');
            res.json(files.filter(f => f.endsWith('.md')));
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/article-content/:file', async (req, res) => {
    try {
        const fileName = req.params.file;
        if (isCloud && octokit) {
            const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: `articles/${fileName}` });
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            res.send(content);
        } else if (isCloud && !octokit) {
            console.warn('[API] GITHUB_TOKEN non défini → mode local forcé pour /api/article-content');
            const content = await fs.readFile(path.join('articles', fileName), 'utf-8');
            res.send(content);
        } else {
            const content = await fs.readFile(path.join('articles', fileName), 'utf-8');
            res.send(content);
        }
    } catch (e) { res.status(404).send("Article non trouvé"); }
});
async function generateArticlesList() {
    try {
        const files = await fs.readdir('articles');
        const mdFiles = files.filter(f => f.endsWith('.md')).sort((a, b) => parseInt(b) - parseInt(a));
        await fs.writeFile('articles/list.json', JSON.stringify(mdFiles, null, 2));
        return mdFiles;
    } catch (e) { console.error("Erreur liste:", e); }
}
app.post('/api/create-article', upload.single('image'), async (req, res) => {
    try {
        const { id, titre, categorie, date, heure, extrait, tags, contenu } = req.body;
        let fileName = (id && id !== "null") ? `${id}.md` : `${Date.now()}.md`;
        let tagsFormatted =  "  ";
        if (tags) { tagsFormatted = tags.split(',').map(t => t.trim().replace(/"/g, '')).filter(t => t).map(t => `"${t}"`).join(', '); }
        let imagePath = req.body.existingImage ||  "  ";
        if (req.file) { imagePath = isCloud ? `images/${Date.now()}-${req.file.originalname}` : `images/${req.file.filename}`; }
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
    } catch (e) { console.error("Erreur API:", e); res.status(500).json({ message: e.message }); }
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

// ==========================================
// [VEILLE] LOGIQUE BACKEND (RSS + CRUD)
// ==========================================
const VEILLE_FILE = path.join(__dirname, 'veille_data.json');
if (!fsSync.existsSync(VEILLE_FILE)) {
    fsSync.writeFileSync(VEILLE_FILE, JSON.stringify({ manual: [], feed: [], lastUpdated: new Date().toISOString() }));
}
function loadVeilleData() {
    try { return JSON.parse(fsSync.readFileSync(VEILLE_FILE, 'utf-8')); }
    catch(e) { return { manual: [], feed: [], lastUpdated: new Date().toISOString() }; }
}
function saveVeilleData(data) { fsSync.writeFileSync(VEILLE_FILE, JSON.stringify(data, null, 2)); }

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function updateVeilleFeeds() {
    const data = loadVeilleData();
    // Sources francophones tech/éco
    const feeds = [
        'https://www.tsa-algerie.com/feed/',
        'https://www.silicon.fr/feed',
        'https://www.zdnet.fr/feed/'
    ];
    let newItems = [];
    
    for (const url of feeds) {
        try {
            const jsonStr = await httpsGet(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
            const json = JSON.parse(jsonStr);
            if (json.status === 'ok' && json.items) {
                json.items.forEach(item => {
                    if (!item.title || !item.link) return;
                    
                    // Filtrage strict : TIC, télécoms, innovation, mobile, startups, communiqués
                    const text = (item.title + ' ' + (item.description || '')).toLowerCase();
                    const techKw = ['tic', 'télécom', 'mobile', 'startup', 'innovation', 'tech', 'numérique', 'internet', 'data', 'ia', 'fibre', 'algerie', '5g', 'réseau', 'opérateur', 'digital', 'numérique', 'presse', 'communiqué'];
                    
                    // Vérification présence mots-clés tech
                    const isTech = techKw.some(k => text.includes(k));
                    
                    // Vérification langue (francophone simple : sources FR + présence mots FR courants si besoin)
                    // Les sources sélectionnées sont 100% FR. On garde isTech comme filtre principal.
                    if (isTech) {
                        newItems.push({
                            id: Buffer.from(item.link).toString('base64').substring(0, 16),
                            title: item.title,
                            url: item.link,
                            tags: isTech ? ['Presse', 'Automatique'] : [],
                            date: item.pubDate || new Date().toISOString(),
                            source: new URL(url).hostname.replace('www.', ''),
                            isManual: false
                        });
                    }
                });
            }
        } catch (e) { console.log(`[VEILLE] Fetch RSS échoué pour ${url}:`, e.message); }
    }
    
    const existingUrls = new Set([...data.feed.map(i => i.url), ...data.manual.map(i => i.url)]);
    const uniqueNew = newItems.filter(i => !existingUrls.has(i.url));
    data.feed = [...data.feed, ...uniqueNew].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 150);
    data.lastUpdated = new Date().toISOString();
    saveVeilleData(data);
    console.log('[VEILLE] Flux actualisés. Nouveautés:', uniqueNew.length);
}
updateVeilleFeeds();
setInterval(updateVeilleFeeds, 4 * 60 * 60 * 1000);

// Routes API Veille
app.get('/api/veille', (req, res) => res.json(loadVeilleData()));
app.post('/api/veille', (req, res) => {
    const { title, url, tag } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'Titre et URL requis' });
    const data = loadVeilleData();
    data.manual.push({ id: Date.now().toString(), title, url, tags: tag ? tag.split(',').map(t => t.trim()) : ['Manuel'], date: new Date().toISOString(), source: 'Ajout manuel', isManual: true });
    saveVeilleData(data);
    res.json({ success: true });
});
app.put('/api/veille/:id', (req, res) => {
    const { id } = req.params;
    const { title, url, tag } = req.body;
    const data = loadVeilleData();
    const idx = data.manual.findIndex(a => a.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Non trouvé' });
    data.manual[idx] = { ...data.manual[idx], title, url, tags: tag ? tag.split(',').map(t => t.trim()) : data.manual[idx].tags };
    saveVeilleData(data);
    res.json({ success: true });
});
app.delete('/api/veille/:id', (req, res) => {
    const { id } = req.params;
    const data = loadVeilleData();
    data.manual = data.manual.filter(a => a.id !== id);
    saveVeilleData(data);
    res.json({ success: true });
});
// FIN [VEILLE] BACKEND

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`🚀 Serveur actif sur port ${PORT}`));