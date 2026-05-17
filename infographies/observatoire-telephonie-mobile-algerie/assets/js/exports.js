/**
 * Export CSV / JSON / PDF — Téléphonie mobile T3 2025
 */

import { DATASET } from './data.js';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
  return '\ufeff' + lines.join('\n');
}

// === DATASETS EXPORTABLES ===
const EXPORT_TABLES = {
  operateurs: {
    name: 'Parts_marche_operateurs',
    rows: () => DATASET.operateurs.map(o => ({
      Marque: o.marque,
      Société: o.societe,
      Code: o.code,
      Abonnés: o.abonnes,
      'Part (%)': o.part
    }))
  },
  evolutionParc: {
    name: 'Evolution_parc_global',
    rows: () => DATASET.evolution.parcGlobal.map(d => ({
      Trimestre: d.trimestre,
      Mobilis: d.mobilis,
      Djezzy: d.djezzy,
      Ooredoo: d.ooredoo,
      Total: d.total
    }))
  },
  partsMarcheEvol: {
    name: 'Evolution_parts_marche',
    rows: () => DATASET.evolution.partsMarche.map(d => ({
      Trimestre: d.trimestre,
      'Mobilis (%)': d.mobilis,
      'Djezzy (%)': d.djezzy,
      'Ooredoo (%)': d.ooredoo
    }))
  },
  technologies: {
    name: 'Repartition_technologies',
    rows: () => DATASET.technologies.global.map(t => ({
      Technologie: t.nom,
      Abonnés: t.abonnes,
      'Part (%)': t.part
    }))
  },
  technologiesOperateur: {
    name: 'Technologies_par_operateur',
    rows: () => DATASET.technologies.parOperateur.map(t => ({
      Opérateur: t.operateur,
      'GSM (abonnés)': t.gsm,
      'GSM (%)': t.gsm_pct,
      '3G (abonnés)': t.g3,
      '3G (%)': t.g3_pct,
      '4G (abonnés)': t.g4,
      '4G (%)': t.g4_pct
    }))
  },
  abonnement: {
    name: 'Repartition_abonnement',
    rows: () => DATASET.abonnement.parOperateur.map(t => ({
      Opérateur: t.operateur,
      Prépayé: t.prepaye,
      Postpayé: t.postpaye
    }))
  },
  prepayeIndicateurs: {
    name: 'Prepaye_indicateurs',
    rows: () => [{
      Total_abonnes: DATASET.abonnement.prepaye.total,
      Croissance_trimestrielle_pct: DATASET.abonnement.prepaye.croissanceTrimestrielle,
      Croissance_annuelle_pct: DATASET.abonnement.prepaye.croissanceAnnuelle,
      MOU_minutes: DATASET.abonnement.prepaye.mou,
      ARPU_DA: DATASET.abonnement.prepaye.arpu
    }]
  },
  postpayeIndicateurs: {
    name: 'Postpaye_indicateurs',
    rows: () => [{
      Total_abonnes: DATASET.abonnement.postpaye.total,
      Croissance_trimestrielle_pct: DATASET.abonnement.postpaye.croissanceTrimestrielle,
      Croissance_annuelle_pct: DATASET.abonnement.postpaye.croissanceAnnuelle,
      MOU_minutes: DATASET.abonnement.postpaye.mou,
      ARPU_DA: DATASET.abonnement.postpaye.arpu
    }]
  },
  traficVoix: {
    name: 'Trafic_voix_evolution',
    rows: () => DATASET.trafic.voix.evolution.map(d => ({
      Trimestre: d.trimestre,
      Intra_reseau: d.intra,
      Sortant_national: d.sortantNat,
      Sortant_international: d.sortantInt,
      Entrant_international: d.entrantInt,
      Total: d.total
    }))
  },
  traficSms: {
    name: 'Trafic_sms_evolution',
    rows: () => DATASET.trafic.sms.evolution.map(d => ({
      Trimestre: d.trimestre,
      Intra_reseau: d.intra,
      Sortant_national: d.sortantNat,
      Sortant_international: d.sortantInt,
      Entrant_international: d.entrantInt,
      Total: d.total
    }))
  }
};

export function exportCSV(key) {
  const t = EXPORT_TABLES[key];
  if (!t) { console.warn('Export CSV : clé inconnue', key); return; }
  downloadBlob(new Blob([toCSV(t.rows())], { type: 'text/csv;charset=utf-8' }), `${t.name}.csv`);
  toast(`CSV exporté : ${t.name}`);
}

export function exportAllCSV() {
  const parts = [];
  for (const key in EXPORT_TABLES) {
    const t = EXPORT_TABLES[key];
    parts.push(`# ${t.name}`);
    parts.push(toCSV(t.rows()).replace(/^\ufeff/, ''));
    parts.push('');
  }
  downloadBlob(
    new Blob(['\ufeff' + parts.join('\n')], { type: 'text/csv;charset=utf-8' }),
    'Observatoire_Telephonie_Mobile_T3-2025_complet.csv'
  );
  toast('CSV complet exporté');
}

export function exportJSON() {
  downloadBlob(
    new Blob([JSON.stringify(DATASET, null, 2)], { type: 'application/json' }),
    'Observatoire_Telephonie_Mobile_T3-2025.json'
  );
  toast('JSON complet exporté');
}

export async function exportPDF() {
  if (!window.jspdf || !window.html2canvas) { toast('Module PDF indisponible', true); return; }
  toast('Génération PDF en cours…');
  const { jsPDF } = window.jspdf;
  const target = document.querySelector('main');
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
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * pageW) / canvas.width;
    let heightLeft = imgH; let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH, '', 'FAST');
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH, '', 'FAST');
      heightLeft -= pageH;
    }
    pdf.save('Observatoire_Telephonie_Mobile_Algerie_T3-2025.pdf');
    toast('PDF exporté avec succès');
  } catch (e) {
    console.error(e); toast("Erreur lors de l'export PDF", true);
  } finally {
    if (fabStack) fabStack.style.visibility = '';
  }
}

export async function sharePage() {
  const data = {
    title: DATASET.meta.titre,
    text: `${DATASET.meta.sousTitre} — ${DATASET.vueEnsemble.totalAbonnes}M abonnés, +${DATASET.vueEnsemble.croissanceAnnuelle}%/an`,
    url: location.href
  };
  if (navigator.share) {
    try { await navigator.share(data); return; } catch (e) {}
  }
  try {
    await navigator.clipboard.writeText(location.href);
    toast('Lien copié dans le presse-papier');
  } catch { toast('Partage non disponible', true); }
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen();
}

let toastTimeout;
function toast(message, isError = false) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast'; el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.background = isError ? '#b85042' : '#2d8a5f';
  el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('show'), 2800);
}

export { toast };
