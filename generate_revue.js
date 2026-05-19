const fs = require('fs');
const https = require('https');
const path = require('path');

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_FILE = path.join(__dirname, 'revue_presse.json');

// Liste élargie de la presse algérienne (.dz)
const SOURCES = [
    'https://www.aps.dz/fr/algerie/education-et-technologie?format=feed&type=rss',
    'https://www.tsa-algerie.dz/feed/',
    'https://itmag.dz/feed/',
    'https://lesenjeuxeco.dz/category/tic/feed/',
    'https://dz-tech.news/fr/feed/',
    'https://www.algerie-eco.com/category/actualite/high-tech/feed/',
    'https://www.lesoirdalgerie.com/rss',
    'http://www.elmoudjahid.com/fr/rss',
    'https://www.elwatan-dz.com/feed',
    'https://www.lexpressiondz.com/rubriques/nationale/rss',
    'https://www.horizons.dz/?format=feed&type=rss',
    'https://www.algerie360.com/category/high-tech/feed/',
    'https://www.elkhabar.com/press/rss/14/', 
    'https://www.echoroukonline.com/dz-news/feed'
];

async function httpsGet(url) {
    return new Promise((resolve, reject) => {
        // Utilisation du service public rss2json (sans clé pour le test)
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const request = https.get(apiUrl, { timeout: 15000 }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(new Error("Erreur JSON")); }
            });
        });
        request.on('error', reject);
        request.on('timeout', () => { request.destroy(); reject(new Error("Timeout")); });
    });
}

async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
    });

    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function startFouille() {
    console.log("🚀 L'IA commence la fouille de la presse nationale .DZ...");
    let allNews = [];

    for (const url of SOURCES) {
        try {
            const res = await httpsGet(url);
            if (res && res.status === 'ok') {
                res.items.forEach(item => {
                    allNews.push({
                        title: item.title,
                        desc: (item.description || '').replace(/<[^>]*>/g, '').substring(0, 300),
                        link: item.link,
                        date: item.pubDate
                    });
                });
            }
        } catch (e) { console.log(`⚠️ Source ignorée : ${url.substring(0, 30)}...`); }
    }

    // Création d'un contenu par défaut si rien n'est trouvé
    if (allNews.length === 0) {
        console.log("❌ Aucun article trouvé aujourd'hui.");
        const emptyResult = {
            "date": new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
            "synthese": "Aucune actualité technologique majeure n'a été détectée dans la presse nationale ces dernières 24 heures.",
            "articles": []
        };
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(emptyResult, null, 2));
        return;
    }

    const prompt = `Analyse ces articles algériens : ${JSON.stringify(allNews.slice(0, 50))}. 
    Rédige une revue de presse (synthese + 5 articles max) sur les TIC et le numérique en Algérie. 
    Format JSON : { "date": "...", "synthese": "...", "articles": [{"titre": "...", "resume": "...", "categorie": "...", "url": "..."}] }`;

    try {
        const aiResponse = await callGemini(prompt);
        if (aiResponse.candidates && aiResponse.candidates[0].content) {
            let resultText = aiResponse.candidates[0].content.parts[0].text;
            // Nettoyage au cas où l'IA ajoute des balises markdown
            resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            fs.writeFileSync(OUTPUT_FILE, resultText);
            console.log("✅ Revue de presse générée !");
        }
    } catch (e) {
        console.error("❌ Erreur IA, création d'un fichier de secours.");
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ "date": "Erreur", "synthese": "Service temporairement indisponible", "articles": [] }));
    }
}

startFouille();