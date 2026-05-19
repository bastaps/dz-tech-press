const fs = require('fs');
const https = require('https');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const OUTPUT_FILE = path.join(__dirname, 'revue_presse.json');

async function searchWebDZ(query) {
    return new Promise((resolve) => {
        const data = JSON.stringify({ "q": `${query}`, "gl": "dz", "hl": "fr", "tbs": "qdr:d" });
        const options = {
            hostname: 'google.serper.dev',
            path: '/search',
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' }
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
        generationConfig: { temperature: 0.7, response_mime_type: "application/json" }
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
    console.log("🔍 Fouille large de la presse algérienne...");
    try {
        // On cherche sur des thèmes très larges pour être sûr d'avoir des résultats
        const results = await Promise.all([
            searchWebDZ("actualité Algérie"),
            searchWebDZ("économie numérique Algérie"),
            searchWebDZ("الجزائر")
        ]);

        let rawNews = [];
        results.forEach(res => { if(res.organic) res.organic.forEach(item => rawNews.push(item)); });

        const prompt = `Tu es rédacteur en chef. Analyse ces news du jour en Algérie : ${JSON.stringify(rawNews.slice(0, 50))}
        1. Rédige une synthèse de 3 phrases sur l'actualité en Algérie. Priorise la Tech, sinon prends l'économie.
        2. Sélectionne obligatoirement les 5 articles les plus importants.
        3. Réponds UNIQUEMENT par un objet JSON pur.
        Format : { "date": "${new Date().toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}", "synthese": "...", "articles": [{ "titre": "...", "resume": "...", "categorie": "...", "url": "..." }] }`;

        const aiResponse = await callGemini(prompt);
        if (aiResponse.candidates && aiResponse.candidates[0].content) {
            let text = aiResponse.candidates[0].content.parts[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                fs.writeFileSync(OUTPUT_FILE, jsonMatch[0]);
                console.log("✅ Revue de presse mise à jour.");
            } else { throw new Error("JSON non détecté"); }
        }
    } catch (e) {
        console.error("❌ Erreur:", e.message);
        // On ne change pas le fichier si l'IA échoue pour garder la version précédente
    }
}
startFouille();