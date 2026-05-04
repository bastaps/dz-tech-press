// ===== CONFIG =====
let allArticles = [];
const ITEMS_PER_PAGE = 6;
const TOTAL_ARTICLES = 24;
let currentPage = 1;
let currentFilter = 'all';
let currentTag = null;
let articleViews = JSON.parse(localStorage.getItem('articleViews') || '{}');
let currentEditingId = null; // Variable pour suivre l'article en cours de lecture/édition

// ===== CONFIG AUDIO =====
const synth = window.speechSynthesis;
let currentUtterance = null;

// ===== API DISTANTE =====
const REMOTE_API = 'https://dz-tech-press-api.onrender.com'; 

// ===== MOT DE PASSE ADMIN =====
const ADMIN_PASSWORD = 'admin2026';

// ===== INIT =====
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 600);
    loadTheme();
    loadArticles();
});

document.getElementById('currentDate').textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ===== CHARGEMENT =====
async function loadArticles() {
    try {
        let articleFiles = [];
        const listResponse = await fetch('/articles/list.json');
        
        if (listResponse.ok) {
            articleFiles = await listResponse.json();
        } else {
            const apiResponse = await fetch('/api/articles');
            if (apiResponse.ok) {
                articleFiles = await apiResponse.json();
            } else {
                throw new Error('Impossible de récupérer la liste des articles');
            }
        }

        allArticles = []; // Reset local avant chargement
        for (const fileName of articleFiles) {
            const res = await fetch(`articles/${fileName}`);
            if (res.ok) {
                const text = await res.text();
                const art = parseMarkdownFile(text);
                art.id = parseInt(fileName.replace('.md', ''), 10);
                art.views = articleViews[art.id] || Math.floor(Math.random() * 500) + 50;
                allArticles.push(art);
            }
        }

        allArticles.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
        
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
        console.warn('Fallback statique:', e);
        for (let i = 1; i <= TOTAL_ARTICLES; i++) {
            try {
                const res = await fetch(`articles/${i}.md`);
                if (res.ok) {
                    const text = await res.text();
                    const art = parseMarkdownFile(text);
                    art.id = i;
                    art.views = articleViews[i] || Math.floor(Math.random() * 500) + 50;
                    allArticles.push(art);
                }
            } catch (innerError) { console.warn(`Article ${i} missing`, innerError); }
        }
        allArticles.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
        if (allArticles.length) {
            renderHero(allArticles);
            renderGrid(allArticles.slice(0, ITEMS_PER_PAGE));
            renderTicker(allArticles);
            renderTrending();
            renderTags();
            renderPagination(allArticles);
            initCounters();
        }
    }
}

// ===== PARSER =====
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
    const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : [];
    const readingTime = Math.ceil(content.split(/\s+/).length / 200);

    return { 
        titre: get('titre'), 
        date: get('date'), 
        heure: get('heure'), 
        categorie: get('categorie'), 
        image: get('image'), 
        extrait: get('extrait'), 
        contenu: marked.parse(content), 
        rawContent: content.trim(), 
        tags, 
        readingTime 
    };
}

// ===== RENDER HERO =====
function renderHero(arts) {
    const h = arts[0];
    const s = arts.slice(1, 3);
    if(!document.getElementById('heroGrid')) return;
    
    let html = `
        <div class="hero-main" onclick="openArticle(${h.id})">
            <img src="${h.image}" alt="${h.titre}" loading="lazy">
            <div class="hero-overlay">
                <span class="category-tag ${cls(h.categorie)}">${h.categorie}</span>
                <h2>${h.titre}</h2>
                <p>${h.extrait}</p>
            </div>
        </div>
        <div class="hero-side-card">`;

    s.forEach(a => {
        html += `
            <div onclick="openArticle(${a.id})">
                <img src="${a.image}" alt="${a.titre}" loading="lazy">
                <div class="hero-overlay">
                    <span class="category-tag ${cls(a.categorie)}">${a.categorie}</span>
                    <h2>${a.titre}</h2>
                </div>
            </div>`;
    });

    html += '</div>';
    document.getElementById('heroGrid').innerHTML = html;
}

// ===== RENDER GRID =====
function renderGrid(arts) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    if (!arts.length) {
        grid.innerHTML = '<p style="text-align:center;padding:40px;">Aucun article.</p>';
        return;
    }
    grid.innerHTML = arts.map((a, i) => `
        <div class="news-card" style="animation-delay:${i*0.1}s" onclick="openArticle(${a.id})">
            <div class="news-card-img">
                <img src="${a.image}" alt="${a.titre}" loading="lazy">
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

// ===== TICKER =====
function renderTicker(arts) {
    const html = arts.map(a => `<span class="ticker-item">${a.titre}</span>`).join('');
    if(document.getElementById('breakingTicker')) document.getElementById('breakingTicker').innerHTML = html + html;
}

// ===== ARTICLE VIEW =====
window.openArticle = function(id) {
    const art = allArticles.find(a => a.id === id);
    if (!art) return;
    
    // Logique du bouton Admin (✏️ pour modifier)
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
    updateSEO(art);

    let html = `
        <img src="${art.image}" alt="${art.titre}" loading="lazy">
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

    const rel = allArticles.filter(a => a.id !== id && a.categorie === art.categorie).slice(0, 3);
    const relBox = document.getElementById('relatedArticles');
    if (rel.length) {
        relBox.style.display = 'block';
        document.getElementById('relatedGrid').innerHTML = rel.map(a => `
            <div class="related-card" onclick="openArticle(${a.id})">
                <img src="${a.image}" loading="lazy">
                <h4>${a.titre}</h4>
            </div>
        `).join('');
    } else { relBox.style.display = 'none'; }

    document.title = art.titre + ' | DZ Tech Press';
};

// ===== LOGIQUE AUDIO =====
function initAudioReader(textToRead) {
    const playBtn = document.getElementById('listenBtn');
    const stopBtn = document.getElementById('stopBtn');
    const stickyContainer = document.getElementById('stickyAudio');

    const cleanText = textToRead
        .replace(/<[^>]*>/g, '') 
        .replace(/!\[.*?\]\(.*?\)/g, '') 
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') 
        .replace(/[#*`~_]/g, '') 
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') 
        .replace(/\n/g, ' ') 
        .trim();

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
        currentUtterance.rate = 1.0;

        currentUtterance.onstart = () => {
            playBtn.style.display = 'none';
            stopBtn.style.display = 'flex';
            stickyContainer.classList.add('playing');
        };

        currentUtterance.onend = () => resetAudioUI();
        currentUtterance.onerror = () => resetAudioUI();

        synth.speak(currentUtterance);
    }

    playBtn.onclick = startReading;
    stopBtn.onclick = () => {
        synth.cancel();
        resetAudioUI();
    };

    function resetAudioUI() {
        playBtn.style.display = 'flex';
        stopBtn.style.display = 'none';
        stickyContainer.classList.remove('playing');
    }
}

// ===== GO HOME =====
window.goHome = function() {
    if (synth) synth.cancel();
    
    // Logique du bouton Admin (+ pour créer)
    currentEditingId = null;
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.innerHTML = '<i class="fas fa-plus"></i>';
        adminBtn.title = "Ajouter un article";
    }

    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('articlePage').style.display = 'none';
    document.getElementById('searchInput').value = '';
    currentFilter = 'all'; currentTag = null; currentPage = 1;
    document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
    document.getElementById('nav-all').classList.add('active');
    document.getElementById('gridTitle').textContent = 'Dernières Actualités';
    document.getElementById('heroSection').classList.remove('hidden');
    renderHero(allArticles);
    renderGrid(allArticles.slice(0, ITEMS_PER_PAGE));
    renderPagination(allArticles);
    updateSEO(null);
    document.title = 'DZ Tech Press — L\'info Tech & Télécoms en Algérie';
    window.scrollTo({top: 0, behavior: 'smooth'});
};

// ===== PAGINATION =====
function renderPagination(arts) {
    const total = Math.ceil(arts.length / ITEMS_PER_PAGE);
    const pag = document.getElementById('pagination');
    if(!pag) return;
    pag.innerHTML = '';
    if (total <= 1) { 
        if(document.getElementById('loadMoreBtn')) document.getElementById('loadMoreBtn').classList.add('hidden'); 
        return; 
    }
    for (let i = 1; i <= total; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => goToPage(i);
        pag.appendChild(btn);
    }
    if(document.getElementById('loadMoreBtn')) document.getElementById('loadMoreBtn').classList.toggle('hidden', currentPage >= total);
}

window.goToPage = function(p) {
    currentPage = p;
    const filtered = getFiltered();
    const start = (p-1) * ITEMS_PER_PAGE;
    renderGrid(filtered.slice(start, start + ITEMS_PER_PAGE));
    renderPagination(filtered);
    document.getElementById('newsGrid').scrollIntoView({behavior:'smooth'});
};

window.loadMoreArticles = function() {
    currentPage++;
    const filtered = getFiltered();
    renderGrid(filtered.slice(0, currentPage * ITEMS_PER_PAGE));
    renderPagination(filtered);
};

function getFiltered() {
    let f = allArticles;
    if (currentFilter !== 'all') f = f.filter(a => a.categorie === currentFilter);
    if (currentTag) f = f.filter(a => a.tags && a.tags.includes(currentTag));
    return f;
}

// ===== SEARCH & FILTER =====
document.getElementById('searchInput')?.addEventListener('input', e => {
    const v = e.target.value.toLowerCase();
    if (!v) { goHome(); return; }
    document.getElementById('heroSection').classList.add('hidden');
    const res = allArticles.filter(a => 
        a.titre.toLowerCase().includes(v) || 
        a.extrait.toLowerCase().includes(v) || 
        (a.tags && a.tags.some(t => t.toLowerCase().includes(v)))
    );
    currentPage = 1;
    document.getElementById('gridTitle').textContent = `Résultats pour "${v}" (${res.length})`;
    renderGrid(res.slice(0, ITEMS_PER_PAGE));
    renderPagination(res);
});

window.filterByCategory = function(cat, ev) {
    if(ev) {
        ev.preventDefault();
        document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
        ev.currentTarget.classList.add('active');
    }
    currentFilter = cat; currentTag = null; currentPage = 1;
    document.getElementById('heroSection').classList.add('hidden');
    document.getElementById('searchInput').value = '';
    const f = cat === 'all' ? allArticles : allArticles.filter(a => a.categorie === cat);
    document.getElementById('gridTitle').textContent = cat === 'all' ? 'Dernières Actualités' : `Rubrique : ${cat}`;
    renderGrid(f.slice(0, ITEMS_PER_PAGE)); renderPagination(f);
};

window.filterByTag = function(tag) {
    if (tag === 'all') { goHome(); return; }
    currentTag = tag; currentFilter = 'all'; currentPage = 1;
    document.getElementById('heroSection').classList.add('hidden');
    const f = allArticles.filter(a => a.tags && a.tags.includes(tag));
    document.getElementById('gridTitle').textContent = `Tag : ${tag} (${f.length})`;
    renderGrid(f.slice(0, ITEMS_PER_PAGE)); renderPagination(f);
};

// ===== SIDEBAR WIDGETS =====
function renderTrending() {
    const sorted = [...allArticles].sort((a,b) => b.views - a.views).slice(0, 5);
    document.getElementById('trendingList').innerHTML = sorted.map((a,i) => 
        `<li class="trending-item" onclick="openArticle(${a.id})">
            <span class="trending-number">${String(i+1).padStart(2,'0')}</span>
            <div class="trending-content">
                <h4>${a.titre}</h4>
                <span><i class="far fa-eye"></i> ${a.views} lectures</span>
            </div>
        </li>`
    ).join('');
}

function renderTags() {
    const counts = {};
    allArticles.forEach(a => { if (a.tags) { a.tags.forEach(t => counts[t] = (counts[t] || 0) + 1); } });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 15);
    if(document.getElementById('tagCloud')) {
        document.getElementById('tagCloud').innerHTML = sorted.map(([t,c]) => `<span class="tag-cloud-item" onclick="filterByTag('${t}')">${t} (${c})</span>`).join('');
    }
    if(document.getElementById('tagFilters')) {
        document.getElementById('tagFilters').innerHTML = `<span class="tag-filter active" onclick="filterByTag('all')">Tous</span>` + 
            sorted.slice(0, 5).map(([t]) => `<span class="tag-filter" onclick="filterByTag('${t}')">${t}</span>`).join('');
    }
}

// ===== SHARE & UTILS =====
window.share = function(p) {
    const u = encodeURIComponent(window.location.href);
    const t = encodeURIComponent(document.title);
    const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
        whatsapp: `https://wa.me/?text=${t}%20${u}`
    };
    if(urls[p]) window.open(urls[p], '_blank', 'width=600,height=400');
};

window.copyLink = () => { navigator.clipboard.writeText(window.location.href); showToast('Lien copié !'); };
window.subscribeNewsletter = (e) => { e.preventDefault(); showToast('Merci !'); e.target.reset(); };
window.showToast = (msg) => {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
};

function cls(c) {
    return { 'Algérie':'tag-algerie','Télécoms':'tag-telecoms','Mobile':'tag-mobile','Startups':'tag-startups','Innovation':'tag-innovation' }[c] || 'tag-telecoms';
}

function updateSEO(a) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = a ? a.extrait : 'Actualités télécoms en Algérie';
}

window.toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('.theme-toggle i');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
};

function loadTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.theme-toggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

window.addEventListener('scroll', () => {
    if (document.getElementById('articlePage').style.display !== 'none') {
        const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        document.getElementById('readingProgress').style.width = ((window.scrollY / h) * 100) + '%';
    }
    if(document.getElementById('backToTop')) document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 500);
});

function initCounters() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target; const target = +el.dataset.target;
                const step = target / 125; let cur = 0;
                const up = () => { cur += step; if(cur < target) { el.textContent = Math.floor(cur); requestAnimationFrame(up); } else { el.textContent = target; } };
                up(); obs.unobserve(el);
            }
        });
    }, {threshold: 0.5});
    document.querySelectorAll('.stat-number').forEach(c => obs.observe(c));
}

// ===== GESTION ADMIN MODIFIÉE =====
window.toggleAdminPanel = function() {
    const password = prompt('🔒 Mot de passe:');
    if (password === ADMIN_PASSWORD) {
        const modal = document.getElementById('adminModal');
        if (!modal) return;
        
        modal.classList.add('show');
        const now = new Date();
        
        // Logique Différenciée : Modification vs Création
        if (currentEditingId) {
            const art = allArticles.find(a => a.id === currentEditingId);
            if (art) {
                document.getElementById('titre').value = art.titre;
                document.getElementById('categorie').value = art.categorie;
                document.getElementById('date').value = art.date;
                document.getElementById('heure').value = art.heure;
                document.getElementById('extrait').value = art.extrait;
                document.getElementById('tags').value = art.tags.join(', ');
                document.getElementById('contenu').value = art.rawContent;
                document.querySelector('#adminModal h2').innerHTML = '<i class="fas fa-pencil-alt"></i> Modifier l\'article';
            }
        } else {
            // Nouveau formulaire vide
            document.getElementById('articleForm').reset();
            document.getElementById('imagePreview').innerHTML = '';
            if (document.getElementById('date')) document.getElementById('date').valueAsDate = now;
            if (document.getElementById('heure')) document.getElementById('heure').value = now.toTimeString().slice(0, 5);
            document.querySelector('#adminModal h2').innerHTML = '<i class="fas fa-newspaper"></i> Créer un nouvel article';
        }
    } else if (password !== null) showToast('❌ Incorrect');
};

window.closeAdminPanel = function() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => { 
            if (document.getElementById('articleForm')) document.getElementById('articleForm').reset(); 
            if (document.getElementById('imagePreview')) document.getElementById('imagePreview').innerHTML = ''; 
        }, 300);
    }
};

window.previewImage = function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => { if (document.getElementById('imagePreview')) document.getElementById('imagePreview').innerHTML = `<img src="${ev.target.result}" alt="Aperçu">`; };
        reader.readAsDataURL(file);
    }
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
    formData.append('image', document.getElementById('image').files[0]);

    try {
        showToast('⏳ Traitement...');
        const isCloudflare = window.location.hostname.includes('pages.dev');
        const apiUrl = isCloudflare ? `${REMOTE_API}/api/create-article` : '/api/create-article';
        const response = await fetch(apiUrl, { method: 'POST', body: formData });
        if (response.ok) { 
            showToast('✅ Déployé !'); 
            setTimeout(() => { 
                allArticles = []; 
                loadArticles(); 
                closeAdminPanel(); 
            }, 2000); 
        }
        else { const error = await response.json(); showToast(`❌ ${error.message}`); }
    } catch (error) { showToast(`❌ Erreur`); }
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('adminModal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target.id === 'adminModal') closeAdminPanel(); });
});