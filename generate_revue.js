const fs = require('fs');
const https = require('https');
const path = require('path');

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Sera configuré dans GitHub
const OUTPUT_FILE = path.join(__dirname, 'revue_presse.json');

// Sources pour la fouille (Journaux généralistes et spécialisés .dz)
const SOURCES = [
    'https://www.aps.dz/fr/algerie/education-et-technologie?format=feed&type=rss',
    'https://www.tsa-algerie.dz/feed/',
    'https://www.algerie-eco.com/category/actualite/high-tech/feed/',
    'https://www.algerie360.com/category/high-tech/feed/',
    'https://itmag.dz/feed/',
    'https://lesenjeuxeco.dz/category/tic/feed/',
    'https://www.elwatan-dz.com/feed',
    'https://dz-tech.news/fr/feed/'
];

async function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
    });

    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function startFouille() {
    console.log("🚀 L'IA commence la fouille de la presse .DZ...");
    let allNews = [];

    // 1. Collecte des données brute
    for (const url of SOURCES) {
        try {
            const res = await httpsGet(url);
            if (res.status === 'ok') {
                res.items.forEach(item => {
                    allNews.push({
                        title: item.title,
                        desc: item.description.replace(/<[^>]*>/g, '').substring(0, 200),
                        link: item.link,
                        date: item.pubDate
                    });
                });
            }
        } catch (e) { console.log(`Erreur source: ${url}`); }
    }

    // 2. Préparation du Prompt pour l'IA
    const prompt = `
    En tant que rédacteur en chef d'Algeria Tech, rédige une revue de presse des dernières 24h.
    Voici les articles trouvés : ${JSON.stringify(allNews)}
    
    Instructions strictes :
    1. Ne garde que ce qui concerne : TIC, Télécoms, Startups, Digital, Numérique, IA en Algérie.
    2. Rédige une synthèse globale de 3-4 phrases en introduction (champ "synthese").
    3. Regroupe les faits marquants en 5 articles maximum (champ "articles").
    4. Pour chaque article : un titre percutant, un résumé court, la catégorie, et l'URL source.
    5. Langue : Français de haut niveau.
    
    Format JSON attendu :
    {
      "date": "${new Date().toLocaleDateString('fr-FR')}",
      "synthese": "...",
      "articles": [
        { "titre": "...", "resume": "...", "categorie": "...", "url": "..." }
      ]
    }`;

    // 3. Appel de l'intelligence artificielle
    try {
        const aiResponse = await callGemini(prompt);
        const resultText = aiResponse.candidates[0].content.parts[0].text;
        
        // 4. Sauvegarde du résultat
        fs.writeFileSync(OUTPUT_FILE, resultText);
        console.log("✅ Revue de presse générée avec succès !");
    } catch (e) {
        console.error("❌ Erreur IA:", e);
    }
}

startFouille();