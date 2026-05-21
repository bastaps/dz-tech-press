const fs = require('fs');
const https = require('https');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const OUTPUT_FILE = path.join(__dirname, 'revue_presse.json');

if (!GEMINI_API_KEY || !SERPER_API_KEY) {
    console.error("❌ Erreur: Les variables d'environnement GEMINI_API_KEY ou SERPER_API_KEY ne sont pas définies.");
    console.log("👉 Utilisez : $env:GEMINI_API_KEY='votre_cle' et $env:SERPER_API_KEY='votre_cle' avant de lancer le script.");
    process.exit(1);
}

// Vérification sommaire du format de la clé Gemini
if (GEMINI_API_KEY && !GEMINI_API_KEY.startsWith("AIza")) {
    console.warn("⚠️ Attention: La clé GEMINI_API_KEY ne semble pas commencer par 'AIza'. Vérifiez votre copie.");
}

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
            searchWebDZ("Algérie actualité tech économie"),
            searchWebDZ("startup Algérie news"),
            searchWebDZ("numérique Algérie 2026")
        ]);

        let rawNews = [];
        results.forEach(res => { if(res.organic) res.organic.forEach(item => rawNews.push(item)); });
        console.log(`📡 Articles bruts trouvés : ${rawNews.length}`);

        const prompt = `Tu es rédacteur en chef. Analyse ces news du jour en Algérie : ${JSON.stringify(rawNews.slice(0, 50))}
        1. Rédige une synthèse de 3 phrases sur l'actualité tech/éco en Algérie.
        2. Sélectionne OBLIGATOIREMENT exactement 5 articles distincts.
        3. Si moins de 5 articles sont pertinents, utilise les informations disponibles pour en créer 5 de qualité.
        4. Réponds UNIQUEMENT par un objet JSON pur, sans markdown.
        Format : { "date": "${new Date().toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}", "synthese": "...", "articles": [{ "titre": "...", "resume": "...", "categorie": "...", "url": "..." }] }`;

        const aiResponse = await callGemini(prompt);
        if (aiResponse.candidates && aiResponse.candidates[0].content) {
            let text = aiResponse.candidates[0].content.parts[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const finalJson = JSON.parse(jsonMatch[0]);
                if (finalJson.articles && finalJson.articles.length >= 5) {
                    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalJson, null, 2));
                    console.log(`✅ Revue de presse mise à jour avec ${finalJson.articles.length} articles.`);
                } else {
                    throw new Error(`Nombre d'articles insuffisant (${finalJson.articles?.length})`);
                }
            } else { throw new Error("JSON non détecté"); }
        }
    } catch (e) {
        console.error("❌ Erreur:", e.message);
        // On arrête le processus avec une erreur pour que GitHub Action devienne rouge
        process.exit(1);
    }
}
startFouille();