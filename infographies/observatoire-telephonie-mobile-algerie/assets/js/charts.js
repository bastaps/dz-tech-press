/**
 * Visualisations 2D — Chart.js
 * Téléphonie mobile T3 2025 (ARPCE)
 */

import { DATASET, fmt } from './data.js';

// === THEME GLOBAL ===
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
}

const CHARTS = {};

// ─── 1. PARTS DE MARCHE OPERATEURS (DONUT) ───
function partsMarcheChart(ctx) {
  const ops = DATASET.operateurs;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ops.map(o => `${o.marque} (${o.code})`),
      datasets: [{
        data: ops.map(o => o.part),
        backgroundColor: ops.map(o => o.couleur),
        borderColor: '#111729',
        borderWidth: 3,
        hoverOffset: 14
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } },
        tooltip: {
          callbacks: {
            label: (c) => {
              const op = ops[c.dataIndex];
              return [
                `${fmt.pourcent(c.parsed)}`,
                `${fmt.nombre(op.abonnes)} abonnés`,
                op.societe
              ];
            }
          }
        }
      },
      animation: { animateRotate: true, animateScale: true, duration: 1400 }
    }
  });
}

// ─── 2. EVOLUTION PARC GLOBAL (LINE) ───
function evolutionParcChart(ctx) {
  const data = DATASET.evolution.parcGlobal;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.trimestre),
      datasets: [
        {
          label: 'Mobilis',
          data: data.map(d => d.mobilis / 1e6),
          borderColor: DATASET.palette.mobilis,
          backgroundColor: 'rgba(45, 138, 95, 0.15)',
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: DATASET.palette.mobilis,
          pointBorderColor: '#0a0e1a',
          pointBorderWidth: 2,
          fill: false
        },
        {
          label: 'Djezzy',
          data: data.map(d => d.djezzy / 1e6),
          borderColor: DATASET.palette.djezzy,
          backgroundColor: 'rgba(184, 80, 66, 0.15)',
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: DATASET.palette.djezzy,
          pointBorderColor: '#0a0e1a',
          pointBorderWidth: 2,
          fill: false
        },
        {
          label: 'Ooredoo',
          data: data.map(d => d.ooredoo / 1e6),
          borderColor: DATASET.palette.ooredoo,
          backgroundColor: 'rgba(212, 164, 55, 0.15)',
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: DATASET.palette.ooredoo,
          pointBorderColor: '#0a0e1a',
          pointBorderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
        tooltip: {
          callbacks: { label: (c) => `${c.dataset.label}: ${fmt.millions(c.parsed.y)} M abonnés` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', callback: v => v + 'M' },
          beginAtZero: false
        }
      },
      animation: { duration: 1400, easing: 'easeOutQuart' }
    }
  });
}

// ─── 3. TECHNOLOGIES GLOBALES (DONUT) ───
function technologiesChart(ctx) {
  const data = DATASET.technologies.global;
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
      responsive: true, maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } },
        tooltip: {
          callbacks: {
            label: (c) => {
              const t = data[c.dataIndex];
              return [`${fmt.pourcent(t.part)}`, `${fmt.nombre(t.abonnes)} abonnés`];
            }
          }
        }
      },
      animation: { duration: 1400 }
    }
  });
}

// ─── 4. TECHNOLOGIES PAR OPERATEUR (STACKED BAR HORIZONTAL) ───
function technologiesParOperateurChart(ctx) {
  const data = DATASET.technologies.parOperateur;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.operateur),
      datasets: [
        {
          label: 'GSM',
          data: data.map(d => d.gsm_pct),
          backgroundColor: '#5E4A1F',
          borderRadius: 4
        },
        {
          label: '3G',
          data: data.map(d => d.g3_pct),
          backgroundColor: DATASET.palette.ooredoo,
          borderRadius: 4
        },
        {
          label: '4G',
          data: data.map(d => d.g4_pct),
          backgroundColor: DATASET.palette.mobilis,
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, padding: 14 } },
        tooltip: {
          callbacks: {
            label: (c) => `${c.dataset.label}: ${fmt.pourcent(c.parsed.x)}`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', callback: v => v + '%' },
          max: 100
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: {
            color: '#f4ede0',
            font: { family: "'JetBrains Mono', monospace", size: 13, weight: '600' }
          }
        }
      },
      animation: { duration: 1300 }
    }
  });
}

// ─── 5. PREPAYE vs POSTPAYE (DONUT) ───
function abonnementChart(ctx) {
  const data = DATASET.abonnement.repartition;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.type),
      datasets: [{
        data: data.map(d => d.part),
        backgroundColor: data.map(d => d.couleur),
        borderColor: '#111729',
        borderWidth: 3,
        hoverOffset: 14
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } },
        tooltip: {
          callbacks: { label: (c) => `${c.label}: ${fmt.pourcent(c.parsed)}` }
        }
      },
      animation: { duration: 1300 }
    }
  });
}

// ─── 6. PREPAYE vs POSTPAYE PAR OPERATEUR (GROUPED BAR) ───
function abonnementParOperateurChart(ctx) {
  const data = DATASET.abonnement.parOperateur;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.operateur),
      datasets: [
        {
          label: 'Prépayé',
          data: data.map(d => d.prepaye / 1e6),
          backgroundColor: DATASET.palette.mobilis,
          borderRadius: 6
        },
        {
          label: 'Postpayé',
          data: data.map(d => d.postpaye / 1e6),
          backgroundColor: DATASET.palette.ooredoo,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, padding: 14 } },
        tooltip: {
          callbacks: {
            label: (c) => `${c.dataset.label}: ${fmt.millions(c.parsed.y)} M`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#f4ede0', font: { family: "'JetBrains Mono', monospace", size: 12 } } },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', callback: v => v + 'M' },
          beginAtZero: true
        }
      },
      animation: { duration: 1300, easing: 'easeOutQuart' }
    }
  });
}

// ─── 7. REPARTITION TRAFIC VOIX (DONUT) ───
function traficVoixRepartChart(ctx) {
  const data = DATASET.trafic.voix.repartition;
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
      responsive: true, maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          callbacks: {
            label: (c) => {
              const t = data[c.dataIndex];
              return [`${fmt.pourcent(t.part)}`, `${fmt.nombre(t.valeur)} M minutes`];
            }
          }
        }
      },
      animation: { duration: 1300 }
    }
  });
}

// ─── 8. EVOLUTION TRAFIC VOIX (LINE) ───
function traficVoixEvolChart(ctx) {
  const data = DATASET.trafic.voix.evolution;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.trimestre),
      datasets: [{
        label: 'Trafic voix (M de minutes)',
        data: data.map(d => d.total),
        borderColor: DATASET.palette.mobilis,
        backgroundColor: (context) => {
          const c = context.chart.ctx;
          const g = c.createLinearGradient(0, 0, 0, 320);
          g.addColorStop(0, 'rgba(45, 138, 95, 0.35)');
          g.addColorStop(1, 'rgba(45, 138, 95, 0)');
          return g;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 6,
        pointBackgroundColor: DATASET.palette.mobilis,
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (c) => `${fmt.nombre(c.parsed.y)} M minutes` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', callback: v => fmt.nombre(v) },
          beginAtZero: false
        }
      },
      animation: { duration: 1400, easing: 'easeOutQuart' }
    }
  });
}

// ─── 9. REPARTITION TRAFIC SMS (DONUT) ───
function traficSmsRepartChart(ctx) {
  const data = DATASET.trafic.sms.repartition;
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
      responsive: true, maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          callbacks: {
            label: (c) => {
              const t = data[c.dataIndex];
              return [`${fmt.pourcent(t.part)}`, `${fmt.nombre(t.valeur)} M SMS`];
            }
          }
        }
      },
      animation: { duration: 1300 }
    }
  });
}

// ─── 10. EVOLUTION TRAFIC SMS (LINE) ───
function traficSmsEvolChart(ctx) {
  const data = DATASET.trafic.sms.evolution;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.trimestre),
      datasets: [{
        label: 'Trafic SMS (M)',
        data: data.map(d => d.total),
        borderColor: DATASET.palette.djezzy,
        backgroundColor: (context) => {
          const c = context.chart.ctx;
          const g = c.createLinearGradient(0, 0, 0, 320);
          g.addColorStop(0, 'rgba(184, 80, 66, 0.35)');
          g.addColorStop(1, 'rgba(184, 80, 66, 0)');
          return g;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 6,
        pointBackgroundColor: DATASET.palette.djezzy,
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (c) => `${fmt.nombre(c.parsed.y)} M SMS` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', callback: v => fmt.nombre(v) },
          beginAtZero: false
        }
      },
      animation: { duration: 1400, easing: 'easeOutQuart' }
    }
  });
}

// === INIT ===
export function initCharts() {
  applyTheme();

  const targets = [
    { id: 'chart-parts-marche',          fn: partsMarcheChart },
    { id: 'chart-evolution-parc',        fn: evolutionParcChart },
    { id: 'chart-technologies',          fn: technologiesChart },
    { id: 'chart-techs-operateur',       fn: technologiesParOperateurChart },
    { id: 'chart-abonnement',            fn: abonnementChart },
    { id: 'chart-abonnement-operateur',  fn: abonnementParOperateurChart },
    { id: 'chart-trafic-voix-repart',    fn: traficVoixRepartChart },
    { id: 'chart-trafic-voix-evol',      fn: traficVoixEvolChart },
    { id: 'chart-trafic-sms-repart',     fn: traficSmsRepartChart },
    { id: 'chart-trafic-sms-evol',       fn: traficSmsEvolChart }
  ];

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
