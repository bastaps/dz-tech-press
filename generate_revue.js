const fs = require('fs');
const https = require('https');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const OUTPUT_FILE = path.join(__dirname, 'revue_presse.json');

// Fonction pour fouiller tout le web .DZ via Serper (Google Search API)
async function searchWebDZ(query) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ "q": `${query} site:.dz`, "gl": "dz", "hl": "fr", "autocorrect": true });
        const options = {
            hostname: 'google.serper.dev',
            path: '/search',
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' }
        };
        const req = https.request(options, res => {
            let result = '';
            res.on('data', chunk => result += chunk);
            res.on('end', () => resolve(JSON.parse(result)));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
    });
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function startFouilleProfonde() {
    console.log("🔍 Fouille profonde de la presse algérienne lancée...");
    
    try {
        // On lance 3 recherches simultanées pour ratisser large
        const results = await Promise.all([
            searchWebDZ("TIC télécom Algérie news"),
            searchWebDZ("Startup numérique Algérie"),
            searchWebDZ("الرقمنة الجزائر") // Recherche en arabe pour ne rien rater
        ]);

        let allFound = [];
        results.forEach(res => {
            if (res.organic) {
                res.organic.forEach(item => {
                    allFound.push({ title: item.title, snippet: item.snippet, link: item.link });
                });
            }
        });

        const prompt = `Tu es le rédacteur en chef d'Algeria Tech. Analyse ces résultats de recherche du web algérien : ${JSON.stringify(allFound.slice(0, 40))}
        Rédige une revue de presse structurée sur les TIC et le numérique en Algérie.
        1. Synthèse globale de 3-4 phrases (champ "synthese").
        2. Sélectionne les 5 faits les plus pertinents (champ "articles").
        3. Traduis les infos arabes en français pro.
        Format JSON : { "date": "${new Date().toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}", "synthese": "...", "articles": [{"titre": "...", "resume": "...", "categorie": "...", "url": "..."}] }`;

        const aiResponse = await callGemini(prompt);
        let resultText = aiResponse.candidates[0].content.parts[0].text;
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        fs.writeFileSync(OUTPUT_FILE, resultText);
        console.log("✅ Revue de presse profonde générée avec succès !");

    } catch (e) {
        console.error("❌ Erreur:", e.message);
        // Secours
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ "date": "Aujourd'hui", "synthese": "Actualisation en cours...", "articles": [] }));
    }
}

startFouilleProfonde();