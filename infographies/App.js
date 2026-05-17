// Fichier: infographies/app.js
document.addEventListener('DOMContentLoaded', function() {
    const foldersContainer = document.getElementById('interactive-folders');
    const filesContainer = document.getElementById('media-files');
    const sectionInteractive = document.getElementById('section-interactive');
    const sectionFiles = document.getElementById('section-files');
    const filterBar = document.getElementById('filterBar');
    const logoBtn = document.getElementById('logoBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let currentFilter = 'all';
    let allFolders = [];
    let allFiles = [];

    // Navigation logo
    if (logoBtn) {
        logoBtn.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
    }

    async function loadData() {
        await Promise.all([loadInteractiveFolders(), loadMediaFiles()]);
    }

    async function loadInteractiveFolders() {
        try {
            const res = await fetch('/api/infographies/interactifs');
            if (!res.ok) throw new Error('Échec chargement interactifs');
            allFolders = await res.json();
            renderFolders();
        } catch (e) {
            console.error('Erreur interactifs:', e);
            if (foldersContainer) {
                foldersContainer.innerHTML = '<div class="media-empty"><i class="fas fa-exclamation-triangle" style="font-size:2rem;color:var(--secondary);margin-bottom:10px;display:block;"></i>Impossible de charger les présentations interactives.</div>';
            }
        }
    }

    async function loadMediaFiles() {
        try {
            const res = await fetch('/api/infographies/media');
            if (!res.ok) throw new Error('Échec chargement médias');
            allFiles = await res.json();
            renderFiles();
        } catch (e) {
            console.error('Erreur médias:', e);
            if (filesContainer) {
                filesContainer.innerHTML = '<div class="media-empty"><i class="fas fa-exclamation-triangle" style="font-size:2rem;color:var(--secondary);margin-bottom:10px;display:block;"></i>Impossible de charger les fichiers.</div>';
            }
        }
    }

    function getIcon(type) {
        const icons = {
            'interactive-folder': 'fa-laptop-code',
            'pdf': 'fa-file-pdf',
            'pptx': 'fa-file-powerpoint',
            'image': 'fa-image',
            'presentation': 'fa-file-powerpoint',
            'text': 'fa-file-alt',
            'interactive': 'fa-globe',
            'file': 'fa-file'
        };
        return icons[type] || 'fa-file';
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' o';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko';
        return (bytes / 1048576).toFixed(1) + ' Mo';
    }

    function createFolderCard(f) {
        const card = document.createElement('div');
        card.className = 'media-card';
        
        const preview = document.createElement('div');
        preview.className = 'media-preview interactive-folder';
        
        if (f.thumbnail) {
            const img = document.createElement('img');
            img.src = f.thumbnail;
            img.alt = f.title;
            img.onerror = function() {
                this.style.display = 'none';
                preview.innerHTML = '<i class="fas ' + getIcon('interactive-folder') + ' icon"></i><span class="badge">Interactif</span>';
            };
            preview.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fas ' + getIcon('interactive-folder') + ' icon';
            preview.appendChild(icon);
        }
        
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = 'Interactif';
        if (!f.thumbnail) preview.appendChild(badge);
        
        const body = document.createElement('div');
        body.className = 'media-body';
        
        const title = document.createElement('h3');
        title.textContent = f.title;
        title.title = f.title;
        
        const meta = document.createElement('div');
        meta.className = 'media-meta';
        
        const dateSpan = document.createElement('span');
        dateSpan.innerHTML = '<i class="fas fa-calendar-alt"></i> ' + new Date(f.modified).toLocaleDateString('fr-FR');
        meta.appendChild(dateSpan);
        
        const btn = document.createElement('a');
        btn.href = f.url;
        btn.target = '_blank';
        btn.className = 'media-btn view';
        btn.innerHTML = '<i class="fas fa-external-link-alt"></i> Ouvrir';
        btn.onclick = function(e) {
            e.stopPropagation();
        };
        
        body.appendChild(title);
        body.appendChild(meta);
        body.appendChild(btn);
        
        card.appendChild(preview);
        card.appendChild(body);
        
        card.addEventListener('click', function() {
            window.open(f.url, '_blank');
        });
        
        return card;
    }

    function createFileCard(f) {
        const card = document.createElement('div');
        card.className = 'media-card';
        
        const displayType = f.type === 'pptx' ? 'pptx' : f.type;
        const preview = document.createElement('div');
        preview.className = 'media-preview ' + displayType;
        
        if (f.thumbnail) {
            const img = document.createElement('img');
            img.src = f.thumbnail;
            img.alt = f.name;
            img.onerror = function() {
                this.style.display = 'none';
                preview.innerHTML = '<i class="fas ' + getIcon(f.type) + ' icon"></i><span class="badge">' + f.ext.replace('.','').toUpperCase() + '</span>';
            };
            preview.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fas ' + getIcon(f.type) + ' icon';
            preview.appendChild(icon);
        }
        
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = f.ext.replace('.','').toUpperCase();
        if (!f.thumbnail) preview.appendChild(badge);
        
        const body = document.createElement('div');
        body.className = 'media-body';
        
        const title = document.createElement('h3');
        title.textContent = f.name;
        title.title = f.name;
        
        const meta = document.createElement('div');
        meta.className = 'media-meta';
        
        const sizeSpan = document.createElement('span');
        sizeSpan.innerHTML = '<i class="fas fa-weight-hanging"></i> ' + formatSize(f.size);
        meta.appendChild(sizeSpan);
        
        const dateSpan = document.createElement('span');
        dateSpan.innerHTML = '<i class="fas fa-calendar-alt"></i> ' + new Date(f.modified).toLocaleDateString('fr-FR');
        meta.appendChild(dateSpan);
        
        const btn = document.createElement('a');
        btn.href = f.url;
        btn.target = '_blank';
        btn.className = 'media-btn view';
        btn.innerHTML = '<i class="fas fa-eye"></i> Voir / Télécharger';
        btn.onclick = function(e) {
            e.stopPropagation();
        };
        
        body.appendChild(title);
        body.appendChild(meta);
        body.appendChild(btn);
        
        card.appendChild(preview);
        card.appendChild(body);
        
        card.addEventListener('click', function() {
            window.open(f.url, '_blank');
        });
        
        return card;
    }

    function renderFolders() {
        if (!foldersContainer) return;
        foldersContainer.innerHTML = '';
        const filtered = currentFilter === 'all' || currentFilter === 'interactive-folder' ? allFolders : [];
        
        if (filtered.length === 0) {
            foldersContainer.innerHTML = '<div class="media-empty">Aucune présentation interactive disponible.</div>';
            return;
        }
        
        filtered.forEach(function(f) {
            foldersContainer.appendChild(createFolderCard(f));
        });
    }

    function renderFiles() {
        if (!filesContainer) return;
        filesContainer.innerHTML = '';
        const filtered = currentFilter === 'all' ? allFiles : allFiles.filter(function(f) { return f.type === currentFilter; });
        
        if (filtered.length === 0) {
            filesContainer.innerHTML = '<div class="media-empty">Aucun fichier dans cette catégorie.</div>';
            return;
        }
        
        filtered.forEach(function(f) {
            filesContainer.appendChild(createFileCard(f));
        });
    }

    function updateSectionsVisibility() {
        if (!sectionInteractive || !sectionFiles) return;
        
        if (currentFilter === 'interactive-folder') {
            sectionInteractive.style.display = 'block';
            sectionFiles.style.display = 'none';
        } else if (['pdf', 'pptx', 'image'].indexOf(currentFilter) !== -1) {
            sectionInteractive.style.display = 'none';
            sectionFiles.style.display = 'block';
        } else {
            sectionInteractive.style.display = 'block';
            sectionFiles.style.display = 'block';
        }
    }

    // Gestion des filtres
    if (filterBtns) {
        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                currentFilter = this.getAttribute('data-filter');
                renderFolders();
                renderFiles();
                updateSectionsVisibility();
            });
        });
    }

    // Initialisation
    loadData();
    updateSectionsVisibility();
});