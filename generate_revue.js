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
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' }
        };
        const req = https.request(options, res => {
            let result = '';
            res.on('data', chunk => result += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(result)); } catch (e) { reject(e); }
            });
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
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function startFouilleProfonde() {
    console.log("🔍 Début de la fouille profonde...");
    try {
        if (!SERPER_API_KEY || !GEMINI_API_KEY) throw new Error("Clés API manquantes");

        const results = await Promise.all([
            searchWebDZ("actualité numérique télécom Algérie"),
            searchWebDZ("startup innovation Algérie"),
            searchWebDZ("الرقمية تكنولوجيا الجزائر")
        ]);

        let allFound = [];
        results.forEach(res => {
            if (res.organic) {
                res.organic.forEach(item => {
                    allFound.push({ title: item.title, snippet: item.snippet, link: item.link });
                });
            }
        });

        if (allFound.length === 0) {
            throw new Error("Aucun article trouvé par Serper aujourd'hui");
        }

        const prompt = `Tu es le rédacteur en chef d'Algeria Tech. Analyse ces résultats du web algérien : ${JSON.stringify(allFound.slice(0, 40))}
        Rédige une revue de presse structurée sur la tech en Algérie.
        Format JSON STRICT : { 
          "date": "${new Date().toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}", 
          "synthese": "Résumé global en 3 phrases", 
          "articles": [{ "titre": "...", "resume": "...", "categorie": "...", "url": "..." }] 
        }`;

        const aiResponse = await callGemini(prompt);
        if (aiResponse.candidates && aiResponse.candidates[0].content) {
            let resultText = aiResponse.candidates[0].content.parts[0].text;
            // Nettoyage de sécurité pour le JSON
            resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            fs.writeFileSync(OUTPUT_FILE, resultText);
            console.log("✅ Revue de presse générée !");
        } else {
            throw new Error("Gemini n'a pas pu générer de contenu");
        }

    } catch (e) {
        console.error("❌ Erreur:", e.message);
        const errorData = {
            "date": new Date().toLocaleDateString('fr-FR'),
            "synthese": "La revue de presse est en cours de préparation. Elle sera disponible sous peu.",
            "articles": []
        };
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(errorData, null, 2));
    }
}

startFouilleProfonde();