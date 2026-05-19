const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { Octokit } = require("@octokit/rest");
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['https://algeria-tech.pages.dev', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

const isCloud = !!process.env.GITHUB_TOKEN;
const octokit = process.env.GITHUB_TOKEN ? new Octokit({ auth: process.env.GITHUB_TOKEN }) : null;
const OWNER = "bastaps";
const REPO = "algeria-tech";

const storage = isCloud ? multer.memoryStorage() : multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = file.mimetype === 'application/pdf' ? 'documents/' : 'images/';
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage }).fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]);

app.use(express.json());

// === [AUTO-MEDIA] Route pour lister dynamiquement les fichiers dans infographies/media ===
app.get('/api/infographies/media', (req, res) => {
    const mediaDir = path.join(__dirname, 'infographies', 'media');
    try {
        if (!fsSync.existsSync(mediaDir)) return res.json([]);
        const files = fsSync.readdirSync(mediaDir);
        const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pptx', '.ppt', '.txt', '.md', '.html', '.htm'];
        
        const mediaList = files
            .filter(f => !f.startsWith('.') && allowedExts.includes(path.extname(f).toLowerCase()))
            .map(f => {
                const ext = path.extname(f).toLowerCase();
                const stat = fsSync.statSync(path.join(mediaDir, f));
                let type = 'file';
                if (['.pdf'].includes(ext)) type = 'pdf';
                else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) type = 'image';
                else if (['.pptx', '.ppt'].includes(ext)) type = 'presentation';
                else if (['.txt', '.md'].includes(ext)) type = 'text';
                else if (['.html', '.htm'].includes(ext)) type = 'interactive';
                
                const baseName = path.basename(f, ext);
                const thumbnail = files.find(file => {
                    const fileExt = path.extname(file).toLowerCase();
                    const fileBase = path.basename(file, fileExt);
                    return (fileExt === '.jpg' || fileExt === '.jpeg' || fileExt === '.png') && fileBase === baseName;
                });
                
                return { 
                    name: f, 
                    url: `/infographies/media/${encodeURIComponent(f)}`, 
                    type, 
                    ext, 
                    size: stat.size, 
                    modified: stat.mtime,
                    thumbnail: thumbnail ? `/infographies/media/${encodeURIComponent(thumbnail)}` : null
                };
            })
            .sort((a, b) => b.modified - a.modified);
        res.json(mediaList);
    } catch (e) { res.status(500).json({ error: e.message }); }
});
// === FIN [AUTO-MEDIA] ===

// === [INTERACTIFS] Route pour lister les dossiers interactifs dans infographies/ ===
app.get('/api/infographies/interactifs', (req, res) => {
    const infographicsDir = path.join(__dirname, 'infographies');
    try {
        if (!fsSync.existsSync(infographicsDir)) return res.json([]);
        const items = fsSync.readdirSync(infographicsDir);
        const interactifs = [];
        
        for (const item of items) {
            const itemPath = path.join(infographicsDir, item);
            const stat = fsSync.statSync(itemPath);
            
            if (stat.isDirectory() && item !== 'media' && !item.startsWith('.')) {
                const indexPath = path.join(itemPath, 'index.html');
                const hasIndex = fsSync.existsSync(indexPath);
                
                if (hasIndex) {
                    const indexStat = fsSync.statSync(indexPath);
                    const title = item
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    
                    const folderFiles = fsSync.readdirSync(itemPath);
                    const thumbnailFile = folderFiles.find(f => {
                        const ext = path.extname(f).toLowerCase();
                        return f.toLowerCase().includes('thumbnail') && (ext === '.jpg' || ext === '.jpeg' || ext === '.png');
                    });
                    
                    interactifs.push({
                        name: item,
                        title: title,
                        url: `/infographies/${item}/`,
                        type: 'interactive-folder',
                        modified: indexStat.mtime,
                        thumbnail: thumbnailFile ? `/infographies/${item}/${thumbnailFile}` : null
                    });
                }
            }
        }
        
        res.json(interactifs.sort((a, b) => b.modified - a.modified));
    } catch (e) { res.status(500).json({ error: e.message }); }
});
// === FIN [INTERACTIFS] ===

// === [STATIC-GENERATOR] Générer des fichiers JSON statiques pour Cloudflare Pages ===
app.get('/api/generate-static-files', (req, res) => {
    const mediaDir = path.join(__dirname, 'infographies', 'media');
    const infographicsDir = path.join(__dirname, 'infographies');
    
    try {
        // Générer media-list.json
        if (fsSync.existsSync(mediaDir)) {
            const files = fsSync.readdirSync(mediaDir);
            const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pptx', '.ppt', '.txt', '.md', '.html', '.htm'];
            
            const mediaList = files
                .filter(f => !f.startsWith('.') && allowedExts.includes(path.extname(f).toLowerCase()))
                .map(f => {
                    const ext = path.extname(f).toLowerCase();
                    const stat = fsSync.statSync(path.join(mediaDir, f));
                    let type = 'file';
                    if (['.pdf'].includes(ext)) type = 'pdf';
                    else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) type = 'image';
                    else if (['.pptx', '.ppt'].includes(ext)) type = 'presentation';
                    else if (['.txt', '.md'].includes(ext)) type = 'text';
                    else if (['.html', '.htm'].includes(ext)) type = 'interactive';
                    
                    const baseName = path.basename(f, ext);
                    const thumbnail = files.find(file => {
                        const fileExt = path.extname(file).toLowerCase();
                        const fileBase = path.basename(file, fileExt);
                        return (fileExt === '.jpg' || fileExt === '.jpeg' || fileExt === '.png') && fileBase === baseName;
                    });
                    
                    return { 
                        name: f, 
                        url: `/infographies/media/${encodeURIComponent(f)}`, 
                        type, 
                        ext, 
                        size: stat.size, 
                        modified: stat.mtime,
                        thumbnail: thumbnail ? `/infographies/media/${encodeURIComponent(thumbnail)}` : null
                    };
                })
                .sort((a, b) => b.modified - a.modified);
            
            fsSync.writeFileSync(
                path.join(__dirname, 'infographies', 'media-list.json'),
                JSON.stringify(mediaList, null, 2)
            );
            console.log('✅ media-list.json généré avec', mediaList.length, 'fichiers');
        }
        
        // Générer interactifs-list.json
        if (fsSync.existsSync(infographicsDir)) {
            const items = fsSync.readdirSync(infographicsDir);
            const interactifs = [];
            
            for (const item of items) {
                const itemPath = path.join(infographicsDir, item);
                const stat = fsSync.statSync(itemPath);
                
                if (stat.isDirectory() && item !== 'media' && !item.startsWith('.')) {
                    const indexPath = path.join(itemPath, 'index.html');
                    const hasIndex = fsSync.existsSync(indexPath);
                    
                    if (hasIndex) {
                        const indexStat = fsSync.statSync(indexPath);
                        const title = item
                            .replace(/-/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase());
                        
                        const folderFiles = fsSync.readdirSync(itemPath);
                        const thumbnailFile = folderFiles.find(f => {
                            const ext = path.extname(f).toLowerCase();
                            return f.toLowerCase().includes('thumbnail') && (ext === '.jpg' || ext === '.jpeg' || ext === '.png');
                        });
                        
                        interactifs.push({
                            name: item,
                            title: title,
                            url: `/infographies/${item}/`,
                            type: 'interactive-folder',
                            modified: indexStat.mtime,
                            thumbnail: thumbnailFile ? `/infographies/${item}/${thumbnailFile}` : null
                        });
                    }
                }
            }
            
            fsSync.writeFileSync(
                path.join(__dirname, 'infographies', 'interactifs-list.json'),
                JSON.stringify(interactifs.sort((a, b) => b.modified - a.modified), null, 2)
            );
            console.log('✅ interactifs-list.json généré avec', interactifs.length, 'présentations');
        }
        
        res.json({ success: true, message: 'Fichiers statiques générés avec succès' });
    } catch (e) {
        console.error('Erreur génération statique:', e);
        res.status(500).json({ error: e.message });
    }
});
// === FIN [STATIC-GENERATOR] ===

// === SERVIR LES FICHIERS STATIQUES ===
app.use(express.static('.', {
    setHeaders: (res, filepath) => {
        if (filepath.toLowerCase().endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
        }
    }
}));

// --- ROUTES ARTICLES ---
app.get('/api/articles', async (req, res) => {
    try {
        if (isCloud && octokit) {
            const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: 'articles' });
            res.json(data.filter(f => f.name.endsWith('.md')).map(f => f.name));
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
            res.send(Buffer.from(data.content, 'base64').toString('utf-8'));
        } else {
            res.send(await fs.readFile(path.join('articles', fileName), 'utf-8'));
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

app.post('/api/create-article', upload, async (req, res) => {
    try {
        const { id, titre, categorie, date, heure, extrait, tags, contenu, video } = req.body;
        let fileName = (id && id !== "null") ? `${id}.md` : `${Date.now()}.md`;
        let tagsFormatted = "";
        if (tags) tagsFormatted = tags.split(',').map(t => t.trim().replace(/"/g, '')).filter(t => t).map(t => `"${t}"`).join(', ');
        
        let imagePath = req.body.existingImage || "";
        if (req.files && req.files.image) imagePath = isCloud ? `images/${Date.now()}-${req.files.image[0].originalname}` : `images/${req.files.image[0].filename}`;
        
        let pdfPath = req.body.existingPdf || "";
        if (req.files && req.files.pdf) pdfPath = isCloud ? `documents/${Date.now()}-${req.files.pdf[0].originalname}` : `documents/${req.files.pdf[0].filename}`;

        const frontMatter = `---\ntitre: "${titre.replace(/"/g, '\\"')}"\ncategorie: ${categorie}\ndate: ${date}\nheure: ${heure}\nimage: ${imagePath}\npdf: "${pdfPath}"\nvideo: "${video || ''}"\nextrait: "${extrait.replace(/"/g, '\\"')}"\ntags: [${tagsFormatted}]\n---\n\n${contenu}\n`;
        
        if (isCloud) {
            if (req.files && req.files.image) await pushToGithub(imagePath, req.files.image[0].buffer, "Upload image", true);
            if (req.files && req.files.pdf) await pushToGithub(pdfPath, req.files.pdf[0].buffer, "Upload PDF", true);
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

async function pushToGithub(filePath, content, message, isImg) {
    let sha;
    try { const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: filePath }); sha = data.sha; } catch (e) { sha = null; }
    await octokit.repos.createOrUpdateFileContents({
        owner: OWNER, repo: REPO, path: filePath, message,
        content: isImg ? content.toString('base64') : Buffer.from(content).toString('base64'),
        sha
    });
}

// ==========================================
// [VEILLE] LOGIQUE BACKEND (RSS + CRUD)
// ==========================================
const VEILLE_FILE = path.join(__dirname, 'veille_data.json');
if (!fsSync.existsSync(VEILLE_FILE)) fsSync.writeFileSync(VEILLE_FILE, JSON.stringify({ manual: [], feed: [], lastUpdated: new Date().toISOString() }));

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
    const feeds = [
    'https://www.tsa-algerie.dz/feed/',
    'https://lesenjeuxeco.dz/category/tic/feed/',
    'https://www.algerie360.com/category/high-tech/feed/',
    'https://www.aps.dz/fr/algerie/education-et-technologie?format=feed&type=rss',
    'https://itmag.dz/feed/',
    'https://www.silicon.fr/feed',
    'https://www.zdnet.fr/feed/',
    'https://techcrunch.com/feed/',
    'https://www.lemonde.fr/pixels/rss_full.xml',
    'https://www.wired.com/feed/rss'
];
    let newItems = [];
    
    for (const url of feeds) {
        try {updateVeilleFeeds()
            const jsonStr = await httpsGet(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
            const json = JSON.parse(jsonStr);
            if (json.status === 'ok' && json.items) {
                json.items.forEach(item => {
                    if (!item.title || !item.link) return;
                    const text = (item.title + ' ' + (item.description || '')).toLowerCase();
                    const techKw = ['tic', 'télécom', 'mobile', 'startup', 'innovation', 'tech', 'numérique', 'internet', 'data', 'ia', 'fibre', 'algerie', '5g', 'réseau', 'opérateur', 'digital', 'presse', 'communiqué'];
                    if (techKw.some(k => text.includes(k))) {
                        newItems.push({
                            id: Buffer.from(item.link).toString('base64').substring(0, 16),
                            title: item.title, url: item.link, tags: ['Presse', 'Automatique'],
                            date: item.pubDate || new Date().toISOString(), source: new URL(url).hostname.replace('www.', ''), isManual: false
                        });
                    }
                });
            }
        } catch (e) { console.log(`[VEILLE] RSS échoué pour ${url}:`, e.message); }
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

app.get('/api/veille', (req, res) => res.json(loadVeilleData()));

app.post('/api/veille', (req, res) => {
    const { title, url, tag } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'Titre et URL requis' });
    const data = loadVeilleData();
    data.manual.push({ id: Date.now().toString(), title, url, tags: tag ? tag.split(',').map(t => t.trim()) : ['Manuel'], date: new Date().toISOString(), source: 'Ajout manuel', isManual: true });
    saveVeilleData(data); res.json({ success: true });
});

app.put('/api/veille/:id', (req, res) => {
    const { id } = req.params; const { title, url, tag } = req.body;
    const data = loadVeilleData();
    const idx = data.manual.findIndex(a => a.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Non trouvé' });
    data.manual[idx] = { ...data.manual[idx], title, url, tags: tag ? tag.split(',').map(t => t.trim()) : data.manual[idx].tags };
    saveVeilleData(data); res.json({ success: true });
});

app.delete('/api/veille/:id', (req, res) => {
    const { id } = req.params;
    const data = loadVeilleData();
    data.manual = data.manual.filter(a => a.id !== id);
    saveVeilleData(data); res.json({ success: true });
});

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`🚀 Serveur actif sur port ${PORT}`));