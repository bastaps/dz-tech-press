const fs = require('fs');
const https = require('https');
const path = require('path');

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_FILE = path.join(__dirname, 'revue_presse.json');

// Liste élargie de la presse algérienne (.dz) - Français et Arabe
const SOURCES = [
    // Spécialisés & Agences
    'https://www.aps.dz/fr/algerie/education-et-technologie?format=feed&type=rss',
    'https://www.tsa-algerie.dz/feed/',
    'https://itmag.dz/feed/',
    'https://lesenjeuxeco.dz/category/tic/feed/',
    'https://dz-tech.news/fr/feed/',
    'https://www.algerie-eco.com/category/actualite/high-tech/feed/',
    
    // Grands Quotidiens Nationaux (Français)
    'https://www.lesoirdalgerie.com/rss',
    'http://www.elmoudjahid.com/fr/rss',
    'https://www.elwatan-dz.com/feed',
    'https://www.lexpressiondz.com/rubriques/nationale/rss',
    'https://www.horizons.dz/?format=feed&type=rss',
    'https://www.algerie360.com/category/high-tech/feed/',
    
    // Grands Quotidiens Nationaux (Arabe - Gemini gère la traduction)
    'https://www.elkhabar.com/press/rss/14/', 
    'https://www.echoroukonline.com/dz-news/feed'
];

async function httpsGet(url) {
    return new Promise((resolve, reject) => {
        // Utilisation de rss2json pour normaliser les différents formats RSS/Atom
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=oy2px0m1pndq8y6y6j6y6j6j6j6j6j6j`; // Clé publique limitée
        
        const request = https.get(apiUrl, { timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    reject(new Error("Format invalide"));
                }
            });
        });

        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error("Timeout"));
        });
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
                console.log(`✅ ${res.feed.title || url} : ${res.items.length} articles`);
                res.items.forEach(item => {
                    allNews.push({
                        title: item.title,
                        desc: (item.description || '').replace(/<[^>]*>/g, '').substring(0, 300),
                        link: item.link,
                        date: item.pubDate
                    });
                });
            }
        } catch (e) {
            console.log(`⚠️ Source ignorée : ${url.substring(0, 40)}... (${e.message})`);
        }
    }

    if (allNews.length === 0) {
        console.log("❌ Aucun article trouvé dans les sources .DZ.");
        return;
    }

    // On limite pour ne pas dépasser les capacités de l'IA (Gemini 1.5 Flash supporte beaucoup, mais restons efficaces)
    const recentNews = allNews.slice(0, 60);

    const prompt = `
    Tu es le rédacteur en chef expert d'Algeria Tech. Analyse ces articles de la presse algérienne : ${JSON.stringify(recentNews)}
    
    TA MISSION :
    1. Identifie uniquement les informations concernant : Télécoms, Startups, Digital, Économie Numérique, IA, Cybersécurité et Innovation en Algérie.
    2. Ignore tout ce qui n'est pas lié à la tech ou à l'actualité numérique.
    3. Si un article est en arabe, traduis les points clés pour ta synthèse.
    4. Rédige une synthèse de 3-4 phrases (champ "synthese") qui résume la tendance du jour.
    5. Sélectionne les 5 faits les plus importants (champ "articles").
    6. Pour chaque article retenu : titre pro, résumé de 2 phrases, catégorie précise, et URL source originale.
    
    FORMAT JSON STRICT :
    {
      "date": "${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}",
      "synthese": "...",
      "articles": [
        { "titre": "...", "resume": "...", "categorie": "...", "url": "..." }
      ]
    }`;

    try {
        const aiResponse = await callGemini(prompt);
        if (aiResponse.candidates && aiResponse.candidates[0].content) {
            const resultText = aiResponse.candidates[0].content.parts[0].text;
            fs.writeFileSync(OUTPUT_FILE, resultText);
            console.log("✅ Revue de presse générée avec succès !");
        }
    } catch (e) {
        console.error("❌ Erreur finale IA:", e.message);
    }
}

startFouille();