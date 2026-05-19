const fs = require('fs');
const https = require('https');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const OUTPUT_FILE = path.join(__dirname, 'revue_presse.json');

async function searchWebDZ(query) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ "q": `${query} site:.dz`, "gl": "dz", "hl": "fr", "tbs": "qdr:d" });
        const options = {
            hostname: 'google.serper.dev',
            path: '/search',
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
            timeout: 15000
        };
        const req = https.request(options, res => {
            let result = '';
            res.on('data', chunk => result += chunk);
            res.on('end', () => { try { resolve(JSON.parse(result)); } catch (e) { resolve({organic:[]}); } });
        });
        req.on('error', () => resolve({organic:[]}));
        req.write(data);
        req.end();
    });
}

async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, topP: 0.95, topK: 40, maxOutputTokens: 2048 }
    });
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function startFouille() {
    console.log("🚀 Lancement de la fouille stratégique...");
    try {
        const results = await Promise.all([
            searchWebDZ("actualité numérique télécom startup Algérie"),
            searchWebDZ("économie numérique Algérie"),
            searchWebDZ("الجزائر تكنولوجيا")
        ]);

        let rawNews = [];
        results.forEach(res => { if(res.organic) res.organic.forEach(item => rawNews.push(item)); });

        const prompt = `Tu es rédacteur en chef. Analyse ces news du web algérien (.dz) : ${JSON.stringify(rawNews.slice(0, 45))}
        1. Rédige une synthèse de 3 phrases sur l'actualité tech/éco en Algérie aujourd'hui.
        2. Sélectionne les 5 articles les plus pertinents. 
        3. Si l'actualité tech est pauvre, prends les news économiques ou nationales importantes des journaux algériens.
        4. Réponds UNIQUEMENT par un objet JSON pur, sans balise markdown, sans texte autour.
        Format : { "date": "${new Date().toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}", "synthese": "...", "articles": [{ "titre": "...", "resume": "...", "categorie": "...", "url": "..." }] }`;

        const aiResponse = await callGemini(prompt);
        if (aiResponse.candidates && aiResponse.candidates[0].content) {
            let text = aiResponse.candidates[0].content.parts[0].text;
            
            // Nettoyage radical du texte pour ne garder que le JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                fs.writeFileSync(OUTPUT_FILE, jsonMatch[0]);
                console.log("✅ Revue de presse sauvegardée.");
            } else { throw new Error("Format JSON introuvable"); }
        }
    } catch (e) {
        console.error("❌ Erreur critique:", e.message);
        const fallback = { "date": new Date().toLocaleDateString('fr-FR'), "synthese": "La revue de presse détaillée arrive. Les journaux algériens traitent actuellement les dossiers prioritaires de la transition numérique.", "articles": [] };
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fallback));
    }
}
startFouille();