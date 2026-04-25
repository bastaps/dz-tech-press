const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Route pour créer un article
app.post('/api/create-article', upload.single('image'), (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    // Générer le numéro d'article suivant
    const articlesDir = path.join(__dirname, 'articles');
    const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));
    const nextNumber = files.length + 1;

    // Créer le front matter
    const frontMatter = `---
title: "${title}"
date: "${new Date().toISOString().split('T')[0]}"
category: "${category || 'Tech'}"
tags: [${tags ? tags.split(',').map(tag => `"${tag.trim()}"`).join(', ') : ''}]
image: "${imagePath || ''}"
---

`;

    // Créer le fichier markdown
    const fileName = `${nextNumber}.md`;
    const filePath = path.join(articlesDir, fileName);
    fs.writeFileSync(filePath, frontMatter + content);

    // Commit et push automatique
    exec('git add . && git commit -m "Ajout de l\'article: ' + title + '" && git push', (error, stdout, stderr) => {
      if (error) {
        console.error('Erreur Git:', error);
        return res.status(500).json({ error: 'Erreur lors du commit Git' });
      }
      console.log('Git commit réussi');
    });

    res.json({
      success: true,
      message: 'Article créé avec succès',
      articleNumber: nextNumber,
      fileName: fileName
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'article' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});