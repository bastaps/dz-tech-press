// ===== CONFIGURATION GLOBALE =====
let allArticles = [];
const ITEMS_PER_PAGE = 6;
let currentPage = 1;
let currentFilter = 'all';
let currentTag = null;
let articleViews = JSON.parse(localStorage.getItem('articleViews') || '{}');
let currentEditingId = null; 

// Configuration Audio
const synth = window.speechSynthesis;
let currentUtterance = null;

// Détection automatique de l'adresse du serveur (Backend)
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const REMOTE_API = 'https://dz-tech-press-api.onrender.com';
const API_BASE = isLocal ? '' : REMOTE_API;

// Mot de passe Admin
const ADMIN_PASSWORD = 'admin2026';

// ===== INITIALISATION AU CHARGEMENT =====
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden');
    }, 600);
    
    loadTheme();
    loadArticles();
});

const dateSpan = document.getElementById('currentDate');
if(dateSpan) {
    dateSpan.textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ===== CHARGEMENT DES ARTICLES (OPTIMISÉ - PARALLÈLE) =====
async function loadArticles() {
    try {
        const listResponse = await fetch(`${API_BASE}/api/articles`);
        if (!listResponse.ok) throw new Error('Impossible de charger la liste');
        const articleFiles = await listResponse.json();

        allArticles = [];
        
        const articlePromises = articleFiles.map(async (fileName) => {
            const res = await fetch(`${API_BASE}/api/article-content/${fileName}`);
            if (res.ok) {
                const text = await res.text();
                const art = parseMarkdownFile(text);
                art.id = fileName.replace('.md', '');
                
                if (!isLocal && art.image && !art.image.startsWith('http')) {
                    art.image = `https://raw.githubusercontent.com/bastaps/dz-tech-press/main/${art.image}`;
                }

                art.views = articleViews[art.id] || Math.floor(Math.random() * 500) + 50;
                return art;
            }
            return null;
        });

        const results = await Promise.all(articlePromises);
        allArticles = results.filter(a => a !== null);

        allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (allArticles.length) {
            renderHero(allArticles);
            renderGrid(allArticles.slice(0, ITEMS_PER_PAGE));
            renderTicker(allArticles);
            renderTrending();
            renderTags();
            renderPagination(allArticles);
            initCounters();
        }
    } catch (e) {
        console.error('Erreur de chargement:', e);
    }
}

// Parser Markdown
function parseMarkdownFile(text) {
    if (typeof marked === 'undefined') return { titre: 'Erreur', contenu: 'Librairie manquante', tags: [], readingTime: 0 };
    const parts = text.split('---');
    if (parts.length < 3) return { titre: 'Erreur', contenu: text, tags: [], readingTime: 0 };

    const fm = parts[1];
    const content = parts.slice(2).join('---');

    const get = (k) => { 
        const m = fm.match(new RegExp(`${k}:\\s*(.*)`)); 
        return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''; 
    };

    const tagsMatch = fm.match(/tags:\s*\[(.*)\]/);
    const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, '')) : [];
    const readingTime = Math.ceil(content.split(/\s+/).length / 200);

    return { 
        titre: get('titre'), 
        date: get('date'), 
        heure: get('heure'), 
        categorie: get('categorie'), 
        image: get('image'), 
        extrait: get('extrait'), 
        contenu: marked.parse(content, { breaks: true, gfm: true }), 
        rawContent: content.trim(), 
        tags, 
        readingTime 
    };
}

// ===== FONCTIONS D'AFFICHAGE =====

function renderHero(arts) {
    const h = arts[0];
    const s = arts.slice(1, 3);
    const grid = document.getElementById('heroGrid');
    if(!grid || !h) return;
    
    let html = `
        <div class="hero-main" onclick="openArticle('${h.id}')">
            <img src="${h.image}" alt="${h.titre}" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Indisponible'">
            <div class="hero-overlay">
                <span class="category-tag ${cls(h.categorie)}">${h.categorie}</span>
                <h2>${h.titre}</h2>
                <p>${h.extrait}</p>
            </div>
        </div>
        <div class="hero-side-card">`;

    s.forEach(a => {
        html += `
            <div onclick="openArticle('${a.id}')">
                <img src="${a.image}" alt="${a.titre}" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Indisponible'">
                <div class="hero-overlay">
                    <span class="category-tag ${cls(a.categorie)}">${a.categorie}</span>
                    <h2>${a.titre}</h2>
                </div>
            </div>`;
    });

    html += '</div>';
    grid.innerHTML = html;
}

function renderGrid(arts) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    grid.innerHTML = arts.map((a, i) => `
        <div class="news-card" style="animation-delay:${i*0.1}s" onclick="openArticle('${a.id}')">
            <div class="news-card-img">
                <img src="${a.image}" alt="${a.titre}" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Indisponible'">
                <span class="category-tag ${cls(a.categorie)}">${a.categorie}</span>
            </div>
            <div class="news-card-body">
                <h3>${a.titre}</h3>
                <p>${a.extrait}</p>
                <div class="card-meta">
                    <span><i class="far fa-calendar"></i> ${a.date}</span>
                    <span><i class="far fa-eye"></i> ${a.views}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderTicker(arts) {
    const html = arts.map(a => `<span class="ticker-item">${a.titre}</span>`).join('');
    const ticker = document.getElementById('breakingTicker');
    if(ticker) ticker.innerHTML = html + html;
}

// ===== OUVERTURE D'UN ARTICLE =====
window.openArticle = function(id) {
    const art = allArticles.find(a => a.id == id);
    if (!art) return;
    
    currentEditingId = id;
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        adminBtn.title = "Modifier cet article";
    }

    art.views++;
    articleViews[id] = art.views;
    localStorage.setItem('articleViews', JSON.stringify(articleViews));

    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('articlePage').style.display = 'block';
    window.scrollTo({top:0, behavior:'smooth'});

    let html = `
        <img src="${art.image}" alt="${art.titre}" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Indisponible'">
        <div class="article-body">
            <div class="article-meta">
                <span class="category-tag ${cls(art.categorie)}">${art.categorie}</span>
                <span><i class="far fa-calendar"></i> ${art.date}</span>
                <span><i class="far fa-clock"></i> ${art.heure}</span>
                <span class="reading-time"><i class="fas fa-book-open"></i> ${art.readingTime} min</span>
                <span><i class="far fa-eye"></i> ${art.views} vues</span>
                <button class="meta-audio-btn" onclick="triggerAudio()">
                    <i class="fas fa-volume-up"></i> Écouter
                </button>
            </div>
            <h1>${art.titre}</h1>
            <div class="article-text">${art.contenu}</div>`;

    if (art.tags && art.tags.length) {
        html += `
            <div style="margin:30px 0;padding-top:20px;border-top:1px solid var(--border)">
                <strong>Tags:</strong> 
                ${art.tags.map(t => `<span class="tag-filter" style="margin-left:8px" onclick="filterByTag('${t}');goHome()">${t}</span>`).join('')}
            </div>`;
    }

    html += `
        <div class="share-buttons">
            <button class="share-btn facebook" onclick="share('facebook')"><i class="fab fa-facebook-f"></i> Facebook</button>
            <button class="share-btn twitter" onclick="share('twitter')"><i class="fab fa-twitter"></i> Twitter</button>
            <button class="share-btn whatsapp" onclick="share('whatsapp')"><i class="fab fa-whatsapp"></i> WhatsApp</button>
            <button class="share-btn linkedin" onclick="share('linkedin')"><i class="fab fa-linkedin-in"></i> LinkedIn</button>
            <button class="share-btn copy" onclick="copyLink()"><i class="fas fa-link"></i> Copier</button>
        </div>`;

    document.getElementById('articleContent').innerHTML = html;
    
    initAudioReader(art.titre + ". " + art.rawContent);

    const rel = allArticles.filter(a => a.id != id && a.categorie === art.categorie).slice(0, 3);
    const relBox = document.getElementById('relatedArticles');
    const relGrid = document.getElementById('relatedGrid');
    
    if (rel.length > 0 && relBox && relGrid) {
        relBox.style.display = 'block';
        relGrid.innerHTML = rel.map(a => `
            <div class="related-card" onclick="openArticle('${a.id}')">
                <img src="${a.image}" onerror="this.src='https://via.placeholder.com/400x200?text=Indisponible'">
                <h4>${a.titre}</h4>
            </div>
        `).join('');
    } else if (relBox) {
        relBox.style.display = 'none';
    }
};

// ===== LOGIQUE AUDIO =====
function initAudioReader(textToRead) {
    const playBtn = document.getElementById('listenBtn');
    const stopBtn = document.getElementById('stopBtn');
    const stickyContainer = document.getElementById('stickyAudio');
    
    const cleanText = textToRead.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim();

    function resetAudioUI() {
        if(playBtn) playBtn.style.display = 'flex';
        if(stopBtn) stopBtn.style.display = 'none';
        if(stickyContainer) stickyContainer.classList.remove('playing');
    }

    window.triggerAudio = () => {
        if (synth.speaking) {
            synth.cancel();
            resetAudioUI();
        } else {
            startReading();
        }
    };

    function startReading() {
        synth.cancel();
        currentUtterance = new SpeechSynthesisUtterance(cleanText);
        currentUtterance.lang = 'fr-FR';
        
        currentUtterance.onstart = () => {
            if(playBtn) playBtn.style.display = 'none';
            if(stopBtn) stopBtn.style.display = 'flex';
            if(stickyContainer) stickyContainer.classList.add('playing');
        };

        currentUtterance.onend = resetAudioUI;
        currentUtterance.onerror = resetAudioUI;

        synth.speak(currentUtterance);
    }

    if(playBtn) playBtn.onclick = startReading;
    if(stopBtn) stopBtn.onclick = () => { synth.cancel(); resetAudioUI(); };
}

// ===== RETOUR ACCUEIL =====
window.goHome = function() {
    if (synth) synth.cancel();
    currentEditingId = null;
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) adminBtn.innerHTML = '<i class="fas fa-plus"></i>';

    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('articlePage').style.display = 'none';
    document.getElementById('heroSection').classList.remove('hidden');
    window.scrollTo({top: 0, behavior: 'smooth'});
};

// ===== PAGINATION ET FILTRES =====
function renderPagination(arts) {
    const total = Math.ceil(arts.length / ITEMS_PER_PAGE);
    const pag = document.getElementById('pagination');
    if(!pag) return;
    pag.innerHTML = '';
    for (let i = 1; i <= total; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => {
            currentPage = i;
            const start = (i-1) * ITEMS_PER_PAGE;
            renderGrid(arts.slice(start, start + ITEMS_PER_PAGE));
            renderPagination(arts);
            window.scrollTo({top: 400, behavior: 'smooth'});
        };
        pag.appendChild(btn);
    }
}

window.filterByCategory = function(cat, ev) {
    if(ev) ev.preventDefault();
    currentFilter = cat;
    currentPage = 1;
    document.getElementById('heroSection').classList.add('hidden');
    const filtered = cat === 'all' ? allArticles : allArticles.filter(a => a.categorie === cat);
    renderGrid(filtered.slice(0, ITEMS_PER_PAGE));
    renderPagination(filtered);
};

window.filterByTag = function(tag) {
    currentTag = tag;
    document.getElementById('heroSection').classList.add('hidden');
    const filtered = allArticles.filter(a => a.tags && a.tags.includes(tag));
    renderGrid(filtered.slice(0, ITEMS_PER_PAGE));
    renderPagination(filtered);
};

// ===== SIDEBAR WIDGETS =====
function renderTrending() {
    const sorted = [...allArticles].sort((a,b) => b.views - a.views).slice(0, 5);
    const list = document.getElementById('trendingList');
    if(list) {
        list.innerHTML = sorted.map((a,i) => 
            `<li class="trending-item" onclick="openArticle('${a.id}')">
                <span class="trending-number">${i+1}</span>
                <div class="trending-content">
                    <h4>${a.titre}</h4>
                    <span>${a.views} vues</span>
                </div>
            </li>`
        ).join('');
    }
}

function renderTags() {
    const counts = {};
    allArticles.forEach(a => a.tags?.forEach(t => counts[t] = (counts[t] || 0) + 1));
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10);
    const cloud = document.getElementById('tagCloud');
    if(cloud) {
        cloud.innerHTML = sorted.map(([t,c]) => `<span class="tag-cloud-item" onclick="filterByTag('${t}')">${t} (${c})</span>`).join('');
    }
}

// ===== THEME ET SCROLL =====
window.toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};

function loadTheme() {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
}

window.addEventListener('scroll', () => {
    if (document.getElementById('articlePage').style.display !== 'none') {
        const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = document.getElementById('readingProgress');
        if(progress) progress.style.width = ((window.scrollY / h) * 100) + '%';
    }
    const btt = document.getElementById('backToTop');
    if(btt) btt.classList.toggle('visible', window.scrollY > 500);
});

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function cls(c) {
    const maps = { 'Algérie':'tag-algerie','Télécoms':'tag-telecoms','Mobile':'tag-mobile','Startups':'tag-startups','Innovation':'tag-innovation' };
    return maps[c] || 'tag-telecoms';
}

function initCounters() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target; const target = +el.dataset.target;
                let cur = 0;
                const up = () => { 
                    cur += target/100; 
                    if(cur < target) { el.textContent = Math.floor(cur); requestAnimationFrame(up); } 
                    else { el.textContent = target; } 
                };
                up(); obs.unobserve(el);
            }
        });
    });
    document.querySelectorAll('.stat-number').forEach(c => obs.observe(c));
}

// ===== GESTION ADMIN (CORRECTIONS IMAGE INCLUSES) =====

window.toggleAdminPanel = function() {
    const pass = prompt('🔒 Mot de passe Admin:');
    if (pass !== ADMIN_PASSWORD) return showToast('❌ Accès refusé');

    const modal = document.getElementById('adminModal');
    modal.classList.add('show');

    if (currentEditingId) {
        const art = allArticles.find(a => a.id == currentEditingId);
        document.getElementById('titre').value = art.titre;
        document.getElementById('categorie').value = art.categorie;
        document.getElementById('date').value = art.date;
        document.getElementById('heure').value = art.heure;
        document.getElementById('extrait').value = art.extrait;
        document.getElementById('tags').value = art.tags.join(', ');
        document.getElementById('contenu').value = art.rawContent;
        
        // --- AFFICHAGE DE L'IMAGE ACTUELLE ---
        if (document.getElementById('imagePreview')) {
            document.getElementById('imagePreview').innerHTML = `<p style="font-size:0.8rem;margin-bottom:5px;">Image actuelle :</p><img src="${art.image}" style="max-width:100%; border-radius:8px;">`;
        }
        
        if(!document.getElementById('delBtn')) {
            const delBtn = document.createElement('button');
            delBtn.id = 'delBtn';
            delBtn.type = 'button';
            delBtn.className = 'btn-secondary';
            delBtn.style.background = '#D21034';
            delBtn.style.color = 'white';
            delBtn.innerHTML = '<i class="fas fa-trash"></i> Supprimer';
            delBtn.onclick = deleteArticle;
            document.querySelector('.form-actions').prepend(delBtn);
        }
    }
};

window.closeAdminPanel = () => {
    document.getElementById('adminModal').classList.remove('show');
    document.getElementById('delBtn')?.remove();
    document.getElementById('imagePreview').innerHTML = '';
};

window.submitArticle = async function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titre', document.getElementById('titre').value);
    formData.append('categorie', document.getElementById('categorie').value);
    formData.append('date', document.getElementById('date').value);
    formData.append('heure', document.getElementById('heure').value);
    formData.append('extrait', document.getElementById('extrait').value);
    formData.append('tags', document.getElementById('tags').value);
    formData.append('contenu', document.getElementById('contenu').value);
    
    const imgFile = document.getElementById('image').files[0];
    if (imgFile) {
        formData.append('image', imgFile);
    } else if (currentEditingId) {
        // --- CONSERVER L'IMAGE EXISTANTE SI AUCUN NOUVEAU FICHIER ---
        const art = allArticles.find(a => a.id == currentEditingId);
        formData.append('existingImage', art.image);
    }

    if (currentEditingId) formData.append('id', currentEditingId);

    try {
        showToast('⏳ Envoi au serveur...');
        const response = await fetch(`${API_BASE}/api/create-article`, { method: 'POST', body: formData });
        if (response.ok) { 
            showToast('✅ Article enregistré !'); 
            setTimeout(() => window.location.reload(), 2000); 
        }
    } catch (error) { showToast('❌ Erreur réseau'); }
};

async function deleteArticle() {
    if (!confirm("⚠️ Supprimer définitivement cet article ?")) return;
    try {
        showToast('⏳ Suppression...');
        const response = await fetch(`${API_BASE}/api/delete-article/${currentEditingId}`, { method: 'DELETE' });
        if (response.ok) {
            showToast('✅ Supprimé !');
            setTimeout(() => window.location.reload(), 2000);
        }
    } catch (e) { showToast('❌ Erreur réseau'); }
}

window.previewImage = function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('imagePreview').innerHTML = `<p style="font-size:0.8rem;margin-bottom:5px;">Nouvelle image :</p><img src="${ev.target.result}" style="max-width:100%; border-radius:8px;">`;
        };
        reader.readAsDataURL(file);
    }
};

window.share = (p) => {
    const u = encodeURIComponent(window.location.href);
    const t = encodeURIComponent(document.title);
    const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        twitter: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
        whatsapp: `https://wa.me/?text=${t}%20${u}`
    };
    if(urls[p]) window.open(urls[p], '_blank');
};

window.copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Lien copié !');
};