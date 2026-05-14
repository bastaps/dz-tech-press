/**
 * Algeria Tech Generator — app.js
 * Three.js background · Upload · API · Résultat animé · Export
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
let currentFile  = null;
let reportType   = 'auto';
let currentTheme = 'nuit';
let bgScene      = null;

const ACCENT_COLORS = {
  nuit:      [0xd4a437, 0x2d4a8a, 0x8a4a8a],
  desert:    [0xf97316, 0xdc2626, 0xf59e0b],
  emeraude:  [0x10b981, 0x065f46, 0x34d399],
  ocean:     [0x06b6d4, 0x0e4f9e, 0x38bdf8],
  corporate: [0x1d4ed8, 0x7c3aed, 0x06b6d4],
};

// ─────────────────────────────────────────────────────────────────────────────
// THÈME
// ─────────────────────────────────────────────────────────────────────────────
function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('.theme-dot').forEach(d => {
    d.classList.toggle('active', d.dataset.theme === theme);
  });
  if (bgScene) bgScene.updateColors(ACCENT_COLORS[theme]);
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS — FOND ANIMÉ
// ─────────────────────────────────────────────────────────────────────────────
function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 28);

  // Éclairages
  const ambientLight = new THREE.AmbientLight(0xffffff, .4);
  scene.add(ambientLight);
  const pointA = new THREE.PointLight(0xd4a437, 2, 60);
  pointA.position.set(10, 10, 10);
  scene.add(pointA);
  const pointB = new THREE.PointLight(0x2d4a8a, 1.5, 50);
  pointB.position.set(-10, -8, 5);
  scene.add(pointB);

  // Champ de particules (étoiles)
  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const colors    = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i*3]   = (Math.random() - .5) * 120;
    positions[i*3+1] = (Math.random() - .5) * 120;
    positions[i*3+2] = (Math.random() - .5) * 80 - 10;
    const c = new THREE.Color(0xd4a437).lerp(new THREE.Color(0x2d4a8a), Math.random());
    colors[i*3]   = c.r;
    colors[i*3+1] = c.g;
    colors[i*3+2] = c.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({ size: .12, vertexColors: true, transparent: true, opacity: .7 });
  scene.add(new THREE.Points(pGeo, pMat));

  // Géométries flottantes
  const objs = [];
  const geo1 = new THREE.IcosahedronGeometry(2.5, 1);
  const geo2 = new THREE.TorusGeometry(3, .6, 8, 30);
  const geo3 = new THREE.OctahedronGeometry(2);
  const mat  = new THREE.MeshStandardMaterial({
    color: 0xd4a437, wireframe: true, transparent: true, opacity: .18
  });

  [[geo1, [-8, 3, -5]], [geo2, [7, -4, -8]], [geo3, [3, 5, -3]]].forEach(([g, pos]) => {
    const m = new THREE.Mesh(g, mat.clone());
    m.position.set(...pos);
    scene.add(m);
    objs.push(m);
  });

  // Lignes de connexion
  const lineMat = new THREE.LineBasicMaterial({ color: 0xd4a437, transparent: true, opacity: .07 });
  for (let i = 0; i < 20; i++) {
    const pts = [
      new THREE.Vector3((Math.random()-.5)*60, (Math.random()-.5)*60, (Math.random()-.5)*20 - 10),
      new THREE.Vector3((Math.random()-.5)*60, (Math.random()-.5)*60, (Math.random()-.5)*20 - 10),
    ];
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat.clone()));
  }

  // Resize
  function onResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  window.addEventListener('resize', onResize);
  onResize();

  // Mouse parallax
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth - .5) * 2;
    my = (e.clientY / innerHeight - .5) * 2;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += .005;

    objs[0].rotation.x += .003;
    objs[0].rotation.y += .004;
    objs[1].rotation.x += .002;
    objs[1].rotation.z += .003;
    objs[2].rotation.y += .005;
    objs[2].rotation.x += .002;

    // Légère oscillation
    objs.forEach((o, i) => {
      o.position.y += Math.sin(t + i * 1.2) * .005;
    });

    camera.position.x += (mx * .8 - camera.position.x) * .02;
    camera.position.y += (-my * .5 - camera.position.y) * .02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  bgScene = {
    updateColors(cols) {
      const [c1, c2] = cols;
      pointA.color.setHex(c1);
      pointB.color.setHex(c2);
      objs.forEach(o => o.material.color.setHex(c1));
      lineMat.color.setHex(c1);
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD — Drag & Drop
// ─────────────────────────────────────────────────────────────────────────────
function initUpload() {
  const zone    = document.getElementById('drop-zone');
  const input   = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const genBtn  = document.getElementById('generate-btn');

  browseBtn.addEventListener('click', e => { e.stopPropagation(); input.click(); });
  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('dragging'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('dragging'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragging');
    const file = e.dataTransfer.files[0];
    if (file) setFile(file);
  });

  input.addEventListener('change', () => {
    if (input.files[0]) setFile(input.files[0]);
  });

  function setFile(file) {
    const allowed = ['pdf','ppt','pptx','doc','docx','txt'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      showToast('Format non supporté. Utilisez PDF, PPT, Word ou TXT.', 'error');
      return;
    }
    currentFile = file;
    renderFileList([file]);
    genBtn.disabled = false;
    genBtn.classList.add('ready');
  }

  genBtn.addEventListener('click', startGeneration);
}

function renderFileList(files) {
  const list = document.getElementById('file-list');
  list.hidden = false;
  list.innerHTML = files.map(f => `
    <div class="file-item">
      <span class="file-item-icon">${fileIcon(f.name)}</span>
      <div class="file-item-info">
        <div class="file-item-name">${f.name}</div>
        <div class="file-item-size">${formatSize(f.size)}</div>
      </div>
      <button class="file-item-remove" title="Supprimer" onclick="removeFile()">✕</button>
    </div>
  `).join('');
}

window.removeFile = function() {
  currentFile = null;
  document.getElementById('file-list').hidden = true;
  document.getElementById('file-list').innerHTML = '';
  document.getElementById('generate-btn').disabled = true;
  document.getElementById('file-input').value = '';
};

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  return { pdf:'📄', pptx:'📊', ppt:'📊', docx:'📝', doc:'📝', txt:'📰' }[ext] || '📁';
}
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}

// ─────────────────────────────────────────────────────────────────────────────
// GÉNÉRATION
// ─────────────────────────────────────────────────────────────────────────────
const LOADING_STEPS = [
  [10,  'Lecture du document…'],
  [30,  'Extraction du texte…'],
  [55,  'Analyse des données clés…'],
  [75,  'Détection des statistiques…'],
  [88,  'Préparation des visualisations…'],
  [97,  'Finalisation de l\'infographie…'],
];

async function startGeneration() {
  if (!currentFile) return;

  showScreen('loading');

  // Anime la barre de progression
  let stepIdx = 0;
  const interval = setInterval(() => {
    if (stepIdx < LOADING_STEPS.length) {
      const [pct, msg] = LOADING_STEPS[stepIdx++];
      setProgress(pct, msg);
    }
  }, 800);

  try {
    const formData = new FormData();
    formData.append('file', currentFile);
    formData.append('type', reportType);
    formData.append('theme', currentTheme);

    const resp = await fetch('/api/generate', { method: 'POST', body: formData });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur ${resp.status}`);
    }

    const data = await resp.json();
    clearInterval(interval);
    setProgress(100, 'Infographie prête !');

    await delay(600);
    renderResult(data);

  } catch (e) {
    clearInterval(interval);
    showScreen('upload');
    showToast(e.message || 'Erreur lors de la génération', 'error');
  }
}

function setProgress(pct, msg) {
  document.getElementById('loading-bar').style.width = pct + '%';
  document.getElementById('loading-step').textContent = msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDU DU RÉSULTAT
// ─────────────────────────────────────────────────────────────────────────────
function renderResult(data) {
  const screen = document.getElementById('screen-result');

  const statsHTML = (data.stats || []).map((s, i) => `
    <div class="stat-card" style="animation-delay:${i * .1}s">
      <div class="stat-icon">${s.icon || '📊'}</div>
      <div class="stat-value" data-target="${s.numericValue || s.value}" data-suffix="${s.unit || ''}">${s.value}</div>
      <div class="stat-unit">${s.unit || ''}</div>
      <div class="stat-label">${s.label}</div>
      ${s.trend ? `<div class="stat-trend ${s.trend.startsWith('+') ? 'up' : 'down'}">${s.trend.startsWith('+') ? '▲' : '▼'} ${s.trend}</div>` : ''}
    </div>
  `).join('');

  const findingsHTML = (data.keyPoints || []).slice(0, 9).map((p, i) => `
    <div class="finding-item" style="animation-delay:${i * .07}s">
      <span class="finding-bullet">✦</span>
      <span class="finding-text">${escHtml(p)}</span>
    </div>
  `).join('');

  const sectionsHTML = (data.sections || []).filter(s => s.body).map(s => `
    <div class="text-section-block">
      <div class="text-section-title">${escHtml(s.title)}</div>
      <div class="text-section-body">${escHtml(s.body)}</div>
    </div>
  `).join('');

  const chartLabels = JSON.stringify(data.chartData?.labels || []);
  const chartValues = JSON.stringify(data.chartData?.values || []);

  screen.innerHTML = `
    <!-- Toolbar -->
    <div class="result-toolbar">
      <div class="toolbar-brand">
        <span>✦ Algeria<strong>Tech</strong> Generator</span>
        <span style="opacity:.4">·</span>
        <span>${escHtml(data.typeLabel || 'Rapport')}</span>
      </div>
      <div class="toolbar-actions">
        <button class="tbtn" onclick="backToUpload()">↩ Nouveau</button>
        <button class="tbtn" onclick="copyResultHTML()">📋 Copier HTML</button>
        <button class="tbtn tbtn-accent" onclick="exportPDF()">📥 PDF</button>
      </div>
    </div>

    <!-- Hero 3D -->
    <div class="result-hero">
      <canvas id="hero-3d-canvas"></canvas>
      <div class="result-hero-overlay"></div>
      <div class="result-hero-content">
        <div class="result-tag">${escHtml(data.typeLabel || 'Rapport')} · Algeria Tech Generator</div>
        <h1 class="result-title">${escHtml(data.title || 'Document Analysé')}</h1>
        <p class="result-subtitle">${escHtml(data.subtitle || '')}</p>
        <div class="result-meta">
          <span>📅 ${data.date || new Date().getFullYear()}</span>
          ${data.source ? `<span>📂 ${escHtml(data.source)}</span>` : ''}
          <span>⚙️ Généré par Algeria Tech</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-band">${statsHTML || '<div class="stat-card"><div class="stat-label" style="padding:1rem;color:var(--muted)">Aucune statistique détectée</div></div>'}</div>

    <!-- Charts -->
    <div class="charts-section">
      <div class="chart-card">
        <div class="chart-card-title">Données extraites</div>
        <div class="chart-canvas-wrap"><canvas id="result-chart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-card-title">Vue 3D · Constellation</div>
        <div class="chart-canvas-wrap"><canvas id="mini-3d-canvas"></canvas></div>
      </div>
    </div>

    <!-- Key Points -->
    ${findingsHTML ? `
    <div class="findings-section">
      <h2 class="section-heading">Points clés</h2>
      <p class="section-sub">Éléments essentiels extraits du document</p>
      <div class="findings-grid">${findingsHTML}</div>
    </div>` : ''}

    <!-- Sections texte -->
    ${sectionsHTML ? `
    <div class="text-sections">
      <h2 class="section-heading" style="margin-bottom:1.2rem">Contenu détaillé</h2>
      ${sectionsHTML}
    </div>` : ''}

    <!-- Footer -->
    <div class="result-footer">
      <div class="result-footer-brand">
        Généré par <strong>Algeria Tech Generator</strong> · ${new Date().toLocaleDateString('fr-FR', {day:'2-digit',month:'long',year:'numeric'})}
      </div>
      <div class="toolbar-actions">
        <button class="tbtn tbtn-accent" onclick="exportPDF()">📥 Exporter PDF</button>
      </div>
    </div>
  `;

  // Store chart data for init functions
  screen.dataset.chartLabels = chartLabels;
  screen.dataset.chartValues = chartValues;

  showScreen('result');

  // Init 3D + charts après que le DOM soit rendu
  requestAnimationFrame(() => {
    initHero3D();
    initMini3D();
    initResultChart(data);
    animateCounters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS — HERO 3D (fond animé du résultat)
// ─────────────────────────────────────────────────────────────────────────────
function initHero3D() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const cols = ACCENT_COLORS[currentTheme];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0x000000, .025);
  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1, 14);

  scene.add(new THREE.AmbientLight(0xffffff, .3));
  const pl = new THREE.PointLight(cols[0], 3, 40);
  pl.position.set(5, 5, 8);
  scene.add(pl);
  const pl2 = new THREE.PointLight(cols[1] || 0x2d4a8a, 2, 35);
  pl2.position.set(-6, -4, 5);
  scene.add(pl2);

  // Cristal central
  const crystal = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.2, 2),
    new THREE.MeshStandardMaterial({ color: cols[0], wireframe: false, transparent: true, opacity: .18, metalness: .8, roughness: .2 })
  );
  scene.add(crystal);
  const crystalWire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.25, 2),
    new THREE.MeshBasicMaterial({ color: cols[0], wireframe: true, transparent: true, opacity: .35 })
  );
  scene.add(crystalWire);

  // Orbes orbitaux
  const orbs = [];
  [{ r: 5, speed: .45, phi: 0 }, { r: 7, speed: .28, phi: Math.PI*.66 }, { r: 9, speed: .18, phi: Math.PI*1.3 }].forEach(cfg => {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(.55, 16, 16),
      new THREE.MeshStandardMaterial({ color: cols[0], emissive: cols[0], emissiveIntensity: .4 })
    );
    scene.add(orb);
    orbs.push({ mesh: orb, ...cfg });
  });

  // Particules
  const pPos = new Float32Array(1200 * 3);
  for (let i = 0; i < 1200; i++) {
    pPos[i*3]   = (Math.random()-.5)*50;
    pPos[i*3+1] = (Math.random()-.5)*50;
    pPos[i*3+2] = (Math.random()-.5)*30 - 5;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: cols[0], size: .08, transparent: true, opacity: .5 })));

  const resizeObs = new ResizeObserver(() => {
    if (!canvas.parentElement) return;
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resizeObs.observe(canvas.parentElement);
  renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight, false);

  let t = 0;
  function animate() {
    if (!document.getElementById('hero-3d-canvas')) return;
    requestAnimationFrame(animate);
    t += .01;

    crystal.rotation.y += .003;
    crystal.rotation.x += .001;
    crystalWire.rotation.y += .003;
    crystalWire.rotation.x += .001;

    orbs.forEach(o => {
      o.phi += o.speed * .01;
      o.mesh.position.set(
        Math.cos(o.phi) * o.r,
        Math.sin(o.phi * .7) * 1.5,
        Math.sin(o.phi) * o.r * .5
      );
    });

    renderer.render(scene, camera);
  }
  animate();
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS — MINI 3D (carte droite)
// ─────────────────────────────────────────────────────────────────────────────
function initMini3D() {
  const canvas = document.getElementById('mini-3d-canvas');
  if (!canvas) return;

  const cols = ACCENT_COLORS[currentTheme];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(canvas.parentElement.clientWidth, 240, false);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.parentElement.clientWidth / 240, 0.1, 50);
  camera.position.set(0, 0, 8);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = .05;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.5;

  scene.add(new THREE.AmbientLight(0xffffff, .4));
  scene.add(Object.assign(new THREE.PointLight(cols[0], 3, 30), { position: { x:5, y:5, z:5 } }));

  // Réseau de nœuds
  const nodePositions = [];
  const nodeMeshes    = [];
  for (let i = 0; i < 18; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 2.5 + Math.random() * 1.5;
    const pos   = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    nodePositions.push(pos);
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(.12, 8, 8),
      new THREE.MeshStandardMaterial({ color: cols[0], emissive: cols[0], emissiveIntensity: .6 })
    );
    node.position.copy(pos);
    scene.add(node);
    nodeMeshes.push(node);
  }

  // Lignes entre nœuds proches
  const lineMat = new THREE.LineBasicMaterial({ color: cols[0], transparent: true, opacity: .25 });
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i+1; j < nodePositions.length; j++) {
      if (nodePositions[i].distanceTo(nodePositions[j]) < 3) {
        const geo = new THREE.BufferGeometry().setFromPoints([nodePositions[i], nodePositions[j]]);
        scene.add(new THREE.Line(geo, lineMat.clone()));
      }
    }
  }

  // Sphère centrale
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 24, 24),
    new THREE.MeshStandardMaterial({ color: cols[0], wireframe: true, transparent: true, opacity: .25 })
  ));

  function animate() {
    if (!document.getElementById('mini-3d-canvas')) return;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART.JS
// ─────────────────────────────────────────────────────────────────────────────
function initResultChart(data) {
  const canvas = document.getElementById('result-chart');
  if (!canvas || !window.Chart) return;

  const labels = data.chartData?.labels || [];
  const values = data.chartData?.values || [];

  if (!labels.length || !values.length) {
    canvas.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:.85rem">Données insuffisantes pour le graphique</div>';
    return;
  }

  const cols = ACCENT_COLORS[currentTheme];
  const hexToRGBA = (hex, a) => {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8)  & 255;
    const b = hex & 255;
    return `rgba(${r},${g},${b},${a})`;
  };

  const accentHex = cols[0];
  const accent2Hex = cols[1] || cols[0];

  new Chart(canvas, {
    type: data.chartData.type === 'pie' ? 'doughnut' : 'bar',
    data: {
      labels,
      datasets: [{
        label: data.chartData.label || 'Données',
        data: values,
        backgroundColor: data.chartData.type === 'pie'
          ? labels.map((_, i) => hexToRGBA(i % 2 === 0 ? accentHex : accent2Hex, .8))
          : hexToRGBA(accentHex, .7),
        borderColor: data.chartData.type === 'pie'
          ? labels.map((_, i) => hexToRGBA(i % 2 === 0 ? accentHex : accent2Hex, 1))
          : hexToRGBA(accentHex, 1),
        borderWidth: 1,
        borderRadius: data.chartData.type === 'pie' ? 0 : 6,
        hoverBackgroundColor: hexToRGBA(accentHex, .9),
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: data.chartData.type === 'pie', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#fff', font: { size: 11 } } },
        tooltip: { backgroundColor: 'rgba(0,0,0,.8)', titleColor: '#fff', bodyColor: '#ccc' }
      },
      scales: data.chartData.type === 'pie' ? {} : {
        x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#888', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,.05)' } },
        y: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#888', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,.05)' } }
      },
      animation: { duration: 1000, easing: 'easeOutQuart' }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATEUR DE COMPTEURS
// ─────────────────────────────────────────────────────────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-value[data-target]').forEach(el => {
    const raw    = el.dataset.target;
    const target = parseFloat(raw.replace(/[,\s]/g, '.').replace(/[^\d.]/g, '')) || 0;
    if (target === 0) return;

    const duration = 1400;
    const start    = performance.now();
    const isFloat  = raw.includes('.') || raw.includes(',');

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = target * eased;
      el.textContent = isFloat ? current.toFixed(2).replace('.', ',') : Math.round(current).toLocaleString('fr-FR');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PDF
// ─────────────────────────────────────────────────────────────────────────────
window.exportPDF = async function() {
  const btn = document.querySelector('.tbtn-accent');
  if (btn) btn.textContent = '⏳ Génération…';

  try {
    const { jsPDF } = window.jspdf;
    const resultEl  = document.getElementById('screen-result');

    const canvas = await html2canvas(resultEl, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0a0e1a',
      ignoreElements: el => el.tagName === 'CANVAS' && el.id !== 'result-chart',
    });

    const imgData  = canvas.toDataURL('image/jpeg', .92);
    const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW     = pdf.internal.pageSize.getWidth();
    const pdfH     = (canvas.height * pdfW) / canvas.width;
    const pageH    = pdf.internal.pageSize.getHeight();
    let   posY     = 0;

    while (posY < pdfH) {
      if (posY > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -posY, pdfW, pdfH);
      posY += pageH;
    }

    pdf.save('algeria-tech-infographie.pdf');
  } catch(e) {
    showToast('Erreur export PDF : ' + e.message, 'error');
  } finally {
    if (btn) btn.textContent = '📥 PDF';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COPIER HTML
// ─────────────────────────────────────────────────────────────────────────────
window.copyResultHTML = function() {
  const content = document.getElementById('screen-result').innerHTML;
  const full    = `<!DOCTYPE html><html lang="fr" data-theme="${currentTheme}"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400&family=Manrope:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"><link rel="stylesheet" href="style.css"></head><body>${content}</body></html>`;
  navigator.clipboard.writeText(full).then(
    ()  => showToast('HTML copié dans le presse-papiers !', 'success'),
    ()  => showToast('Impossible de copier', 'error')
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
function showScreen(name) {
  ['upload', 'loading', 'result'].forEach(s => {
    const el = document.getElementById(`screen-${s}`);
    el.hidden = (s !== name);
  });
  if (name !== 'upload') document.getElementById('bg-canvas').style.opacity = '.35';
  else document.getElementById('bg-canvas').style.opacity = '1';
}

window.backToUpload = function() {
  showScreen('upload');
  window.removeFile();
  document.getElementById('bg-canvas').style.opacity = '1';
};

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:1.5rem; right:1.5rem; z-index:9999;
    padding:.75rem 1.4rem; border-radius:10px; font-size:.85rem;
    backdrop-filter:blur(12px); font-family:var(--font-body);
    animation:slide-up .3s ease;
    background:${type === 'error' ? 'rgba(239,68,68,.15)' : 'rgba(var(--accent-rgb),.15)'};
    border:1px solid ${type === 'error' ? 'rgba(239,68,68,.4)' : 'var(--border)'};
    color:var(--text);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initBackground();
  initUpload();

  // Theme picker
  document.querySelectorAll('.theme-dot').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });

  // Type pills
  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      reportType = btn.dataset.type;
    });
  });
});
