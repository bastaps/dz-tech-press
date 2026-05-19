const fs = require('fs');
const https = require('https');
const path = require('path');

const VEILLE_FILE = path.join(__dirname, 'veille_data.json');

function loadVeilleData() {
    try {
        return JSON.parse(fs.readFileSync(VEILLE_FILE, 'utf-8'));
    } catch (e) {
        return { manual: [], feed: [], lastUpdated: new Date().toISOString() };
    }
}

function saveVeilleData(data) {
    fs.writeFileSync(VEILLE_FILE, JSON.stringify(data, null, 2));
}

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function updateVeilleFeeds() {
    console.log('--- DÉBUT DE LA MISE À JOUR RSS ---');
    const data = loadVeilleData();
    const feeds = [
        'https://www.tsa-algerie.com/feed/',
        'https://www.silicon.fr/feed',
        'https://www.zdnet.fr/feed/'
    ];
    let newItems = [];
    
    for (const url of feeds) {
        try {
            console.log(`Récupération de : ${url}`);
            const jsonStr = await httpsGet(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
            const json = JSON.parse(jsonStr);
            if (json.status === 'ok' && json.items) {
                json.items.forEach(item => {
                    const text = (item.title + ' ' + (item.description || '')).toLowerCase();
                    const techKw = ['tic', 'télécom', 'mobile', 'startup', 'innovation', 'tech', 'numérique', 'internet', 'data', 'ia', 'fibre', 'algerie', '5g', 'réseau', 'opérateur', 'digital'];
                    if (techKw.some(k => text.includes(k))) {
                        newItems.push({
                            id: Buffer.from(item.link).toString('base64').substring(0, 16),
                            title: item.title,
                            url: item.link,
                            tags: ['Presse', 'Automatique'],
                            date: item.pubDate || new Date().toISOString(),
                            source: new URL(url).hostname.replace('www.', ''),
                            isManual: false
                        });
                    }
                });
            }
        } catch (e) {
            console.log(`Erreur pour ${url}:`, e.message);
        }
    }

    const existingUrls = new Set([...data.feed.map(i => i.url), ...data.manual.map(i => i.url)]);
    const uniqueNew = newItems.filter(i => !existingUrls.has(i.url));
    
    data.feed = [...uniqueNew, ...data.feed].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 150);
    data.lastUpdated = new Date().toISOString();
    
    saveVeilleData(data);
    console.log(`TERMINÉ. Nouveaux articles ajoutés : ${uniqueNew.length}`);
}

updateVeilleFeeds();