const express = require('express');
const multer  = require('multer');
const fs      = require('fs').promises;
const fsSync  = require('fs');
const path    = require('path');
const { Octokit } = require('@octokit/rest');
const cors    = require('cors');
const https   = require('https');

// Parseurs de documents
const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');
const AdmZip   = require('adm-zip');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://algeria-tech.pages.dev', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

const isCloud = !!process.env.GITHUB_TOKEN;
const octokit = process.env.GITHUB_TOKEN ? new Octokit({ auth: process.env.GITHUB_TOKEN }) : null;
const OWNER = 'bastaps';
const REPO  = 'algeria-tech';

const storage = isCloud ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.mimetype === 'application/pdf' ? 'documents/' : 'images/';
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage }).fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]);

app.use(express.json());
app.use(express.static('.'));

// ─── ARTICLES ────────────────────────────────────────────────────────────────
app.get('/api/articles', async (req, res) => {
  try {
    const files = await fs.readdir('articles');
    res.json(files.filter(f => f.endsWith('.md')));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/article-content/:file', async (req, res) => {
  try {
    const content = await fs.readFile(path.join('articles', req.params.file), 'utf-8');
    res.send(content);
  } catch (e) { res.status(404).send('Article non trouvé'); }
});

app.post('/api/create-article', upload, async (req, res) => {
  try {
    const { id, titre, categorie, date, heure, extrait, tags, contenu, video } = req.body;
    let fileName = (id && id !== 'null') ? `${id}.md` : `${Date.now()}.md`;
    let imagePath = req.body.existingImage || '';
    if (req.files && req.files.image) imagePath = `images/${req.files.image[0].filename}`;
    const frontMatter = `---\ntitre: "${titre}"\ncategorie: ${categorie}\ndate: ${date}\nheure: ${heure}\nimage: ${imagePath}\n---\n\n${contenu}\n`;
    await fs.writeFile(path.join('articles', fileName), frontMatter);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── INFOGRAPHIES ─────────────────────────────────────────────────────────────
app.get('/api/infographies-list', async (req, res) => {
  try {
    const baseDir  = path.join(__dirname, 'infographies');
    const mediaDir = path.join(baseDir, 'media');
    let items = [];
    try {
      const entries = await fs.readdir(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !['media','assets','documents','images'].includes(entry.name)) {
          items.push({ type:'interactif', title: entry.name.replace(/-/g,' '), url: `infographies/${entry.name}/index.html`, thumb: `infographies/${entry.name}/thumbnail.jpg` });
        }
      }
    } catch(e) {}
    try {
      const files = await fs.readdir(mediaDir);
      const mediaFiles = files.filter(f => f.endsWith('.pdf') || f.endsWith('.mp4'));
      for (const file of mediaFiles) {
        const nameOnly = path.parse(file).name;
        const thumb = files.find(f => f.startsWith(nameOnly) && (f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp')));
        items.push({ type: file.endsWith('.pdf') ? 'pdf' : 'video', title: nameOnly.replace(/-/g,' '), url: `infographies/media/${file}`, thumb: thumb ? `infographies/media/${thumb}` : null });
      }
    } catch(e) {}
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── VEILLE ───────────────────────────────────────────────────────────────────
const VEILLE_FILE = path.join(__dirname, 'veille_data.json');
app.get('/api/veille', (req, res) => {
  const data = JSON.parse(fsSync.readFileSync(VEILLE_FILE, 'utf-8'));
  res.json(data);
});

// ═════════════════════════════════════════════════════════════════════════════
// GÉNÉRATEUR D'INFOGRAPHIES — /api/generate
// ═════════════════════════════════════════════════════════════════════════════
const genUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
}).single('file');

app.post('/api/generate', (req, res) => {
  genUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: 'Erreur upload : ' + err.message });
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    try {
      const text   = await extractDocumentText(req.file.buffer, req.file.originalname);
      const type   = req.body.type || 'auto';
      const result = analyzeDocument(text, type, req.file.originalname);
      res.json(result);
    } catch (e) {
      console.error('[generate]', e.message);
      res.status(500).json({ error: e.message });
    }
  });
});

// ─── Extraction de texte ──────────────────────────────────────────────────────
async function extractDocumentText(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text || '';
  }

  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  if (ext === '.pptx' || ext === '.ppt') {
    return extractPptxText(buffer);
  }

  // .txt ou autre → UTF-8 brut
  return buffer.toString('utf-8');
}

function extractPptxText(buffer) {
  try {
    const zip  = new AdmZip(buffer);
    let   text = '';
    zip.getEntries().forEach(entry => {
      if (/ppt\/slides\/slide\d+\.xml$/.test(entry.entryName)) {
        const xml = entry.getData().toString('utf-8');
        const matches = xml.match(/<a:t(?:\s[^>]*)?>([^<]*)<\/a:t>/g) || [];
        const slideText = matches.map(m => m.replace(/<[^>]+>/g, '')).filter(Boolean).join(' ');
        text += slideText + '\n';
      }
    });
    return text;
  } catch(e) {
    return '';
  }
}

// ─── Analyse du document ──────────────────────────────────────────────────────
function analyzeDocument(text, reportType, filename) {
  const lines     = text.split('\n').map(l => l.trim()).filter(Boolean);
  const detectedType = reportType === 'auto' ? detectDocType(text) : reportType;

  const title    = extractTitle(lines, filename);
  const subtitle = extractSubtitle(lines, title);
  const date     = extractDate(text);
  const source   = path.basename(filename, path.extname(filename)).replace(/[-_]/g, ' ');
  const stats    = extractStats(text, detectedType);
  const keyPoints= extractKeyPoints(lines);
  const sections = extractSections(lines);
  const chartData= buildChartData(stats, text, detectedType);

  return {
    title,
    subtitle,
    date,
    source,
    typeLabel: getTypeLabel(detectedType),
    stats,
    keyPoints,
    sections,
    chartData
  };
}

// ─── Détection du type de document ───────────────────────────────────────────
function detectDocType(text) {
  const lower = text.toLowerCase();
  const scores = {
    telecom: score(lower, ['abonnés','télécom','mobile','réseau','arpce','opérateur','internet','bande passante','4g','5g','fibre','adsl']),
    startup: score(lower, ['startup','financement','levée de fonds','incubateur','entrepreneurs','innovation','pitch','venture','seed']),
    rapport: score(lower, ['rapport annuel','bilan','résultats','chiffre d\'affaires','ebitda','exercice','trimestre','dividende']),
    presse:  score(lower, ['selon','d\'après','a déclaré','communiqué','annonce','interview','source','rédaction']),
  };
  return Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
}
function score(text, keywords) { return keywords.reduce((s,k) => s + (text.split(k).length - 1), 0); }
function getTypeLabel(type) {
  return { telecom:'Télécommunications', startup:'Startups & Innovation', rapport:'Rapport Officiel', presse:'Article de Presse', auto:'Document Analysé' }[type] || 'Document';
}

// ─── Titre ────────────────────────────────────────────────────────────────────
function extractTitle(lines, filename) {
  // Cherche la première ligne substantielle (> 8 chars, pas juste une date/numéro)
  for (const line of lines.slice(0, 15)) {
    if (line.length > 8 && line.length < 120 && !/^\d{4}$/.test(line) && !/^page\s/i.test(line)) {
      return line;
    }
  }
  return path.basename(filename, path.extname(filename)).replace(/[-_]/g, ' ');
}

function extractSubtitle(lines, title) {
  for (const line of lines.slice(0, 20)) {
    if (line !== title && line.length > 12 && line.length < 160 && !/^\d+$/.test(line)) {
      return line;
    }
  }
  return '';
}

// ─── Date ─────────────────────────────────────────────────────────────────────
function extractDate(text) {
  const m = text.match(/(?:T[1-4]\s*)?(\d{4})/) || text.match(/(\d{1,2})[\/\-](\d{4})/);
  if (m) return m[0].replace(/[_-]/g, ' ');
  return new Date().getFullYear().toString();
}

// ─── Statistiques ─────────────────────────────────────────────────────────────
function extractStats(text, type) {
  const stats = [];
  const seen  = new Set();

  // Patterns selon le type
  const patterns = [
    // "60,46 millions d'abonnés" ou "45 millions abonnés"
    { re: /(\d[\d\s,.']*(?:\.\d+)?)\s*millions?\s+d[''']?\s*(\w+)/gi,
      map: m => ({ label: capitalize(m[2]), value: cleanNum(m[1]), numericValue: parseNum(m[1]), unit: 'Millions', icon: iconFor(m[2]) }) },
    // "X milliards"
    { re: /(\d[\d\s,.']*(?:\.\d+)?)\s*milliards?\s+(?:de\s+)?(\w+)/gi,
      map: m => ({ label: capitalize(m[2]), value: cleanNum(m[1]), numericValue: parseNum(m[1]), unit: 'Milliards', icon: '💰' }) },
    // "+X%" ou "X% de croissance/pénétration/part"
    { re: /([+\-]?\d+(?:[,\.]\d+)?)\s*%\s*(?:de\s+)?([\w\s]{2,30})?/gi,
      map: m => {
        const val = parseFloat((m[1]||'').replace(',','.'));
        if (val < 0.01 || val > 999) return null;
        return { label: m[2] ? capitalize(m[2].trim()) : 'Taux', value: m[1].replace('.',','), numericValue: Math.abs(val), unit: '%', icon: val > 0 ? '📈' : '📉', trend: val > 0 ? `+${m[1]}%` : `${m[1]}%` };
      }},
    // Grands nombres avec contexte : "2 500 startups" / "45 000 emplois"
    { re: /(\d[\d\s]{2,})\s*(startups?|entreprises?|emplois?|projets?|utilisateurs?|clients?|licences?)/gi,
      map: m => ({ label: capitalize(m[2]), value: cleanNum(m[1]), numericValue: parseNum(m[1]), unit: m[2].endsWith('s') ? m[2] : m[2]+'s', icon: iconFor(m[2]) }) },
  ];

  for (const { re, map } of patterns) {
    for (const m of text.matchAll(re)) {
      if (stats.length >= 6) break;
      const s = map(m);
      if (!s) continue;
      const key = `${s.value}-${s.unit}`;
      if (!seen.has(key)) {
        seen.add(key);
        stats.push(s);
      }
    }
    if (stats.length >= 6) break;
  }

  // Fallback : cherche tout nombre >= 1000 avec contexte
  if (stats.length < 2) {
    for (const m of text.matchAll(/(\d[\d\s]{3,})\s{0,2}([a-zéèêàâùûîôA-Z][a-zéèêàâùûîôA-Z\s]{2,20})/g)) {
      if (stats.length >= 4) break;
      const num = parseNum(m[1]);
      if (num < 100) continue;
      const key = `${num}-?`;
      if (!seen.has(key)) {
        seen.add(key);
        stats.push({ label: capitalize(m[2].trim()), value: num.toLocaleString('fr-FR'), numericValue: num, unit: '', icon: '📊' });
      }
    }
  }

  return stats;
}

function cleanNum(s)  { return s.replace(/\s/g,'').replace(',','.'); }
function parseNum(s)  { return parseFloat(s.replace(/[\s']/g,'').replace(',','.')) || 0; }
function capitalize(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''; }
function iconFor(word) {
  const w = (word||'').toLowerCase();
  if (/abonn|utilisat|client/.test(w)) return '👥';
  if (/mobile|téléphone|sim/.test(w)) return '📱';
  if (/internet|web|données/.test(w)) return '🌐';
  if (/startup|entreprise/.test(w))   return '🚀';
  if (/emploi|travail/.test(w))       return '💼';
  if (/budget|financement|invest/.test(w)) return '💰';
  if (/croissance|hausse/.test(w))    return '📈';
  return '📊';
}

// ─── Points clés ──────────────────────────────────────────────────────────────
function extractKeyPoints(lines) {
  const points = [];
  const bulletRe = /^[-•·▪▸➤✓✔►\*]\s+(.+)/;
  const numberedRe = /^\d+[.)]\s+(.+)/;

  for (const line of lines) {
    if (points.length >= 9) break;
    const bm = line.match(bulletRe);
    const nm = line.match(numberedRe);
    if (bm && bm[1].length > 15) { points.push(bm[1]); continue; }
    if (nm && nm[1].length > 15) { points.push(nm[1]); continue; }
  }

  // Si pas assez de bullets, prendre des phrases informatives
  if (points.length < 4) {
    for (const line of lines) {
      if (points.length >= 7) break;
      if (line.length > 40 && line.length < 200 && !points.includes(line)) {
        if (/[.:;]$/.test(line) || /\d/.test(line)) {
          points.push(line);
        }
      }
    }
  }

  return [...new Set(points)].slice(0, 8);
}

// ─── Sections texte ───────────────────────────────────────────────────────────
function extractSections(lines) {
  const sections = [];
  let currentTitle = null;
  let currentBody  = [];

  const headingRe = /^([A-ZÉÈÊÀÂÙÛÎÔ][A-ZÉÈÊÀÂÙÛÎÔA-Z\s]{2,50})$/;

  for (const line of lines) {
    if (line.length > 300) continue;
    const isHeading = headingRe.test(line) || (line.length < 60 && line.endsWith(':'));
    if (isHeading && line.length > 4) {
      if (currentTitle && currentBody.length) {
        sections.push({ title: currentTitle, body: currentBody.join(' ').substring(0, 400) });
      }
      currentTitle = line.replace(/:$/, '');
      currentBody  = [];
    } else if (currentTitle) {
      currentBody.push(line);
    }
    if (sections.length >= 4) break;
  }
  if (currentTitle && currentBody.length) {
    sections.push({ title: currentTitle, body: currentBody.join(' ').substring(0, 400) });
  }
  return sections.slice(0, 4);
}

// ─── Données pour graphique ───────────────────────────────────────────────────
function buildChartData(stats, text, type) {
  // Essaie de trouver une série temporelle (T1/T2/T3/T4 ou années)
  const quarterRe = /T([1-4])\s*[:\-–]\s*(\d[\d,.']*)/g;
  const quarters  = [...text.matchAll(quarterRe)];
  if (quarters.length >= 3) {
    return {
      type:   'bar',
      label:  'Évolution trimestrielle',
      labels: quarters.map(m => `T${m[1]}`),
      values: quarters.map(m => parseNum(m[2]))
    };
  }

  const yearRe = /(20\d{2})\s*[:\-–]\s*(\d[\d,.']+)/g;
  const years  = [...text.matchAll(yearRe)];
  if (years.length >= 3) {
    return {
      type:   'bar',
      label:  'Évolution annuelle',
      labels: years.map(m => m[1]),
      values: years.map(m => parseNum(m[2]))
    };
  }

  // Sinon utilise les stats extraites
  const validStats = stats.filter(s => s.numericValue > 0).slice(0, 6);
  if (validStats.length >= 2) {
    return {
      type:   validStats.length <= 4 ? 'pie' : 'bar',
      label:  'Indicateurs clés',
      labels: validStats.map(s => s.label.substring(0, 20)),
      values: validStats.map(s => s.numericValue)
    };
  }

  return { type:'bar', label:'', labels:[], values:[] };
}

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Algeria Tech · Port ${PORT} · Générateur activé`));
