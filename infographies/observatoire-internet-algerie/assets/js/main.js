/**
 * Module principal — orchestre tout :
 *  - chargement progressif
 *  - compteurs animés
 *  - reveal au scroll
 *  - navigation latérale active
 *  - événements UI (boutons export, partage, fullscreen)
 *  - initialisation 3D et charts
 */

import { DATASET, fmt } from './data.js';
import { initCharts } from './charts.js';
import { initScene3D } from './scene3d.js';
import {
  exportCSV, exportJSON, exportAllCSV, exportPDF,
  sharePage, toggleFullscreen
} from './exports.js';

// === COMPTEURS ANIMES ===
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const v = target * ease(t);
    el.textContent = v.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + suffix;
    if (t < 1) requestAnimationFrame(step);
    else el.dataset.done = '1';
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.done) {
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => obs.observe(c));
}

// === REVEAL AU SCROLL ===
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  items.forEach(i => obs.observe(i));
}

// === NAVIGATION ACTIVE ===
function initNavigation() {
  const links = document.querySelectorAll('.section-nav a');
  const sections = Array.from(links).map(l => document.querySelector(l.getAttribute('href')));

  function update() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    let active = sections[0];
    for (const s of sections) {
      if (s && s.offsetTop <= scrollY) active = s;
    }
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + (active ? active.id : ''));
    });

    // Compact topbar after scroll
    const top = document.querySelector('.topbar');
    top.classList.toggle('compact', window.scrollY > 100);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// === NAVIGATION CLAVIER ===
function initKeyboard() {
  const sectionIds = ['hero', 'vue-ensemble', 'evolution', 'fixe', 'mobile', 'trafic', 'm2m', 'synthese'];
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const current = sectionIds.findIndex(id => {
      const el = document.getElementById(id);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 100 && rect.bottom > 100;
    });
    if (e.key === 'ArrowDown' && current < sectionIds.length - 1) {
      e.preventDefault();
      document.getElementById(sectionIds[current + 1])?.scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' && current > 0) {
      e.preventDefault();
      document.getElementById(sectionIds[current - 1])?.scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'f' || e.key === 'F') {
      if (!e.ctrlKey && !e.metaKey) toggleFullscreen();
    }
  });
}

// === EVENT BINDINGS ===
function bindEvents() {
  // Boutons d'export CSV individuels
  document.querySelectorAll('[data-export-csv]').forEach(btn => {
    btn.addEventListener('click', () => exportCSV(btn.dataset.exportCsv));
  });

  // Boutons globaux
  document.getElementById('btn-export-all')?.addEventListener('click', exportAllCSV);
  document.getElementById('btn-export-json')?.addEventListener('click', exportJSON);
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF);
  document.getElementById('btn-share')?.addEventListener('click', sharePage);
  document.getElementById('fab-fullscreen')?.addEventListener('click', toggleFullscreen);
  document.getElementById('fab-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// === LOADER ===
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 600);
  }
}

// === INIT ===
window.addEventListener('DOMContentLoaded', async () => {
  // Bind events early
  bindEvents();
  initReveal();
  initNavigation();
  initKeyboard();
  initCounters();

  // Charts (lazy, via IntersectionObserver dans charts.js)
  if (window.Chart) {
    try {
      initCharts();
    } catch (e) {
      console.error('Chart init', e);
    }
  }

  // 3D Scene
  const scene3dEl = document.getElementById('scene3d');
  if (scene3dEl) {
    try {
      initScene3D(scene3dEl);
    } catch (e) {
      console.error('Scene 3D init', e);
      scene3dEl.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:#94a3b8;font-family:monospace;font-size:0.8rem;text-align:center;padding:1rem;">Scène 3D indisponible<br>(WebGL requis)</div>';
    }
  }

  hideLoader();
});
