/**
 * Visualisations 2D (Chart.js)
 * Theming sombre éditorial — toutes les charts héritent d'un thème commun.
 */

import { DATASET, fmt } from './data.js';

// === THEME GLOBAL CHART.JS ===
function applyTheme() {
  const C = window.Chart;
  if (!C) return;

  C.defaults.font.family = "'Manrope', sans-serif";
  C.defaults.font.size = 12;
  C.defaults.color = '#94a3b8';
  C.defaults.borderColor = 'rgba(255, 255, 255, 0.06)';
  C.defaults.plugins.legend.labels.color = '#f4ede0';
  C.defaults.plugins.legend.labels.font = { family: "'JetBrains Mono', monospace", size: 11 };
  C.defaults.plugins.tooltip.backgroundColor = 'rgba(17, 23, 41, 0.95)';
  C.defaults.plugins.tooltip.titleColor = '#d4a437';
  C.defaults.plugins.tooltip.bodyColor = '#f4ede0';
  C.defaults.plugins.tooltip.borderColor = 'rgba(212, 164, 55, 0.4)';
  C.defaults.plugins.tooltip.borderWidth = 1;
  C.defaults.plugins.tooltip.padding = 12;
  C.defaults.plugins.tooltip.titleFont = { family: "'JetBrains Mono', monospace", size: 11, weight: '500' };
  C.defaults.plugins.tooltip.bodyFont = { family: "'Manrope', sans-serif", size: 12 };
  C.defaults.plugins.tooltip.cornerRadius = 8;
  C.defaults.plugins.tooltip.titleSpacing = 6;
}

const CHARTS = {};

// === EVOLUTION TRIMESTRIELLE (BARRES EMPILEES + LIGNE) ===
function evolutionChart(ctx) {
  const data = DATASET.evolutionTrimestrielle;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.trimestre),
      datasets: [
        {
          label: 'Mobile (M)',
          data: data.map(d => d.mobile),
          backgroundColor: 'rgba(212, 164, 55, 0.85)',
          borderColor: '#d4a437',
          borderWidth: 0,
          borderRadius: 6,
          stack: 'abonnes',
          order: 2
        },
        {
          label: 'Fixe (M)',
          data: data.map(d => d.fixe),
          backgroundColor: 'rgba(45, 138, 95, 0.85)',
          borderColor: '#2d8a5f',
          borderWidth: 0,
          borderRadius: 6,
          stack: 'abonnes',
          order: 2
        },
        {
          label: 'Total (M)',
          type: 'line',
          data: data.map(d => d.total),
          borderColor: '#f4ede0',
          backgroundColor: 'rgba(244, 237, 224, 0.1)',
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#f4ede0',
          pointBorderColor: '#0a0e1a',
          pointBorderWidth: 2,
          fill: false,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${fmt.millions(ctx.parsed.y)} M`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        },
        y: {
          stacked: true,
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: {
            color: '#94a3b8',
            callback: v => v + 'M'
          },
          beginAtZero: true
        }
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
}

// === DONUT FIXE PAR TECHNOLOGIE ===
function fixeTechnoChart(ctx) {
  const data = DATASET.internetFixe.technologies;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.nom),
      datasets: [{
        data: data.map(d => d.part),
        backgroundColor: data.map(d => d.couleur),
        borderColor: '#111729',
        borderWidth: 3,
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 12, usePointStyle: true, pointStyle: 'circle' }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${fmt.pourcent(ctx.parsed)}`
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1400
      }
    }
  });
}

// === DONUT FIXE PAR SEGMENT (RES vs PRO) ===
function fixeSegmentChart(ctx) {
  const data = DATASET.internetFixe.segments;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.nom),
      datasets: [{
        data: data.map(d => d.part),
        backgroundColor: ['#d4a437', '#5e4a1f'],
        borderColor: '#111729',
        borderWidth: 3,
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.label}: ${fmt.pourcent(ctx.parsed)}` }
        }
      },
      animation: { duration: 1200 }
    }
  });
}

// === DONUT DEBITS RESEAU FIXE ===
function debitsChart(ctx) {
  const data = DATASET.internetFixe.debits;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.palier),
      datasets: [{
        data: data.map(d => d.part),
        backgroundColor: data.map(d => d.couleur),
        borderColor: '#111729',
        borderWidth: 3,
        hoverOffset: 14
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.label}: ${fmt.pourcent(ctx.parsed)}` }
        }
      },
      animation: { duration: 1400 }
    }
  });
}

// === DONUT MOBILE TECHNOLOGIES (3G vs 4G) ===
function mobileTechnoChart(ctx) {
  const data = DATASET.internetMobile.technologies;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => `${d.nom} (${fmt.millions(d.abonnes)}M)`),
      datasets: [{
        data: data.map(d => d.part),
        backgroundColor: data.map(d => d.couleur),
        borderColor: '#111729',
        borderWidth: 3,
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.label.split(' ')[0]}: ${fmt.pourcent(ctx.parsed)}` }
        }
      },
      animation: { duration: 1200 }
    }
  });
}

// === DONUT MODE DE PAIEMENT ===
function mobilePaiementChart(ctx) {
  const data = DATASET.internetMobile.paiement;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.type),
      datasets: [{
        data: data.map(d => d.part),
        backgroundColor: data.map(d => d.couleur),
        borderColor: '#111729',
        borderWidth: 3,
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.label}: ${fmt.pourcent(ctx.parsed)}` }
        }
      },
      animation: { duration: 1200 }
    }
  });
}

// === LIGNES TRAFIC FIXE ===
function traficFixeChart(ctx) {
  const points = DATASET.trafic.fixe.points;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: points.map(p => p.trimestre),
      datasets: [{
        label: 'Trafic Fixe (millions de Go)',
        data: points.map(p => p.valeur),
        borderColor: '#d4a437',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const grad = ctx.createLinearGradient(0, 0, 0, 320);
          grad.addColorStop(0, 'rgba(212, 164, 55, 0.35)');
          grad.addColorStop(1, 'rgba(212, 164, 55, 0)');
          return grad;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 6,
        pointBackgroundColor: '#d4a437',
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${fmt.nombre(ctx.parsed.y)} M de Go`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', callback: v => fmt.nombre(v) },
          beginAtZero: true
        }
      },
      animation: { duration: 1500, easing: 'easeOutQuart' }
    }
  });
}

// === LIGNES TRAFIC MOBILE ===
function traficMobileChart(ctx) {
  const points = DATASET.trafic.mobile.points;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: points.map(p => p.trimestre),
      datasets: [{
        label: 'Trafic Mobile (millions de Go)',
        data: points.map(p => p.valeur),
        borderColor: '#2d8a5f',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const grad = ctx.createLinearGradient(0, 0, 0, 320);
          grad.addColorStop(0, 'rgba(45, 138, 95, 0.35)');
          grad.addColorStop(1, 'rgba(45, 138, 95, 0)');
          return grad;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 6,
        pointBackgroundColor: '#2d8a5f',
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${fmt.nombre(ctx.parsed.y)} M de Go`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', callback: v => fmt.nombre(v) },
          beginAtZero: true
        }
      },
      animation: { duration: 1500, easing: 'easeOutQuart' }
    }
  });
}

// === BARRES HORIZONTALES M2M ===
function m2mChart(ctx) {
  const operators = DATASET.m2m.operateurs;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: operators.map(o => o.marque),
      datasets: [{
        label: 'Unités SIM M2M',
        data: operators.map(o => o.unites),
        backgroundColor: operators.map(o => o.couleur),
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 32
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (ctx) => operators[ctx[0].dataIndex].societe,
            label: (ctx) => {
              const op = operators[ctx.dataIndex];
              return [
                `Unités : ${fmt.nombre(op.unites)}`,
                `Part de marché : ${fmt.pourcent(op.part)}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', callback: v => fmt.nombre(v) },
          beginAtZero: true
        },
        y: {
          grid: { display: false },
          ticks: {
            color: '#f4ede0',
            font: { family: "'JetBrains Mono', monospace", size: 13, weight: '600' }
          }
        }
      },
      animation: { duration: 1400, easing: 'easeOutQuart' }
    }
  });
}

// === INIT TOUS LES CHARTS ===
export function initCharts() {
  applyTheme();

  const targets = [
    { id: 'chart-evolution', fn: evolutionChart },
    { id: 'chart-fixe-techno', fn: fixeTechnoChart },
    { id: 'chart-fixe-segment', fn: fixeSegmentChart },
    { id: 'chart-debits', fn: debitsChart },
    { id: 'chart-mobile-techno', fn: mobileTechnoChart },
    { id: 'chart-mobile-paiement', fn: mobilePaiementChart },
    { id: 'chart-trafic-fixe', fn: traficFixeChart },
    { id: 'chart-trafic-mobile', fn: traficMobileChart },
    { id: 'chart-m2m', fn: m2mChart }
  ];

  // Lazy init via IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.initialized) {
        const id = entry.target.id;
        const target = targets.find(t => t.id === id);
        if (target) {
          try {
            CHARTS[id] = target.fn(entry.target.getContext('2d'));
            entry.target.dataset.initialized = 'true';
          } catch (e) {
            console.error('Chart init error for', id, e);
          }
        }
      }
    });
  }, { threshold: 0.2 });

  targets.forEach(t => {
    const el = document.getElementById(t.id);
    if (el) observer.observe(el);
  });

  return CHARTS;
}
