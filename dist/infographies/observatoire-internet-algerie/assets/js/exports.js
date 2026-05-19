/**
 * Export CSV/PDF des données et du rapport
 */

import { DATASET } from './data.js';

// === Helper : déclencher un téléchargement ===
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// === Helper : convertir tableau d'objets → CSV (compatible Excel FR) ===
function toCSV(rows) {
  if (!rows || !rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[";\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [
    headers.join(';'),
    ...rows.map(r => headers.map(h => escape(r[h])).join(';'))
  ];
  // BOM UTF-8 pour Excel
  return '\ufeff' + lines.join('\n');
}

// === Datasets prêts à exporter ===
const EXPORT_TABLES = {
  evolution: {
    name: 'Evolution_trimestrielle',
    rows: () => DATASET.evolutionTrimestrielle.map(d => ({
      Trimestre: d.trimestre,
      'Mobile (M)': d.mobile,
      'Fixe (M)': d.fixe,
      'Total (M)': d.total
    }))
  },
  fixeTechno: {
    name: 'Internet_fixe_par_technologie',
    rows: () => DATASET.internetFixe.technologies.map(d => ({
      Technologie: d.nom,
      'Part (%)': d.part
    }))
  },
  fixeSegment: {
    name: 'Internet_fixe_par_segment',
    rows: () => DATASET.internetFixe.segments.map(d => ({
      Segment: d.nom,
      'Part (%)': d.part
    }))
  },
  debits: {
    name: 'Debits_reseau_fixe',
    rows: () => DATASET.internetFixe.debits.map(d => ({
      'Palier de débit': d.palier,
      'Part (%)': d.part
    }))
  },
  mobileTechno: {
    name: 'Internet_mobile_par_technologie',
    rows: () => DATASET.internetMobile.technologies.map(d => ({
      Technologie: d.nom,
      'Abonnés (M)': d.abonnes,
      'Part (%)': d.part
    }))
  },
  mobilePaiement: {
    name: 'Internet_mobile_modele_paiement',
    rows: () => DATASET.internetMobile.paiement.map(d => ({
      Modèle: d.type,
      'Part (%)': d.part
    }))
  },
  traficFixe: {
    name: 'Trafic_fixe',
    rows: () => DATASET.trafic.fixe.points.map(p => ({
      Trimestre: p.trimestre,
      'Trafic (M de Go)': p.valeur
    }))
  },
  traficMobile: {
    name: 'Trafic_mobile',
    rows: () => DATASET.trafic.mobile.points.map(p => ({
      Trimestre: p.trimestre,
      'Trafic (M de Go)': p.valeur
    }))
  },
  m2m: {
    name: 'M2M_par_operateur',
    rows: () => DATASET.m2m.operateurs.map(o => ({
      Marque: o.marque,
      Société: o.societe,
      'Unités SIM': o.unites,
      'Part (%)': o.part
    }))
  }
};

// === EXPORT CSV INDIVIDUEL ===
export function exportCSV(key) {
  const t = EXPORT_TABLES[key];
  if (!t) {
    console.warn('Export CSV : clé inconnue', key);
    return;
  }
  const csv = toCSV(t.rows());
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${t.name}.csv`);
  toast(`CSV exporté : ${t.name}`);
}

// === EXPORT JSON COMPLET ===
export function exportJSON() {
  const json = JSON.stringify(DATASET, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), 'Observatoire_ARPCE_T3-2025.json');
  toast('JSON complet exporté');
}

// === EXPORT CSV COMPLET (tous les tableaux concaténés) ===
export function exportAllCSV() {
  const parts = [];
  for (const key in EXPORT_TABLES) {
    const t = EXPORT_TABLES[key];
    parts.push(`# ${t.name}`);
    parts.push(toCSV(t.rows()).replace(/^\ufeff/, ''));
    parts.push('');
  }
  const blob = new Blob(['\ufeff' + parts.join('\n')], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, 'Observatoire_ARPCE_T3-2025_complet.csv');
  toast('CSV complet exporté');
}

// === EXPORT PDF (via jsPDF + html2canvas) ===
export async function exportPDF() {
  if (!window.jspdf || !window.html2canvas) {
    toast("Module PDF indisponible", true);
    return;
  }
  toast('Génération PDF en cours…');
  const { jsPDF } = window.jspdf;

  // Capture du contenu principal
  const target = document.querySelector('main');
  // On masque les FAB pendant la capture
  const fabStack = document.querySelector('.fab-stack');
  if (fabStack) fabStack.style.visibility = 'hidden';

  try {
    const canvas = await html2canvas(target, {
      backgroundColor: '#0a0e1a',
      scale: 1.5,
      useCORS: true,
      logging: false,
      windowWidth: target.scrollWidth
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.85);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * pageW) / canvas.width;

    let heightLeft = imgH;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH, '', 'FAST');
    heightLeft -= pageH;

    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH, '', 'FAST');
      heightLeft -= pageH;
    }

    pdf.save('Observatoire_Internet_Algerie_T3-2025.pdf');
    toast('PDF exporté avec succès');
  } catch (e) {
    console.error(e);
    toast("Erreur lors de l'export PDF", true);
  } finally {
    if (fabStack) fabStack.style.visibility = '';
  }
}

// === PARTAGE ===
export async function sharePage() {
  const data = {
    title: DATASET.meta.titre,
    text: `${DATASET.meta.sousTitre} — ${DATASET.vueEnsemble.totalAbonnes}M abonnés, +${DATASET.vueEnsemble.croissanceAnnuelle}%`,
    url: location.href
  };
  if (navigator.share) {
    try { await navigator.share(data); return; } catch (e) { /* user canceled */ }
  }
  // Fallback : copier l'URL
  try {
    await navigator.clipboard.writeText(location.href);
    toast('Lien copié dans le presse-papier');
  } catch {
    toast('Partage non disponible', true);
  }
}

// === PLEIN ECRAN ===
export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

// === TOAST ===
let toastTimeout;
function toast(message, isError = false) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.background = isError ? '#b85042' : '#2d8a5f';
  el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('show'), 2800);
}

export { toast };
