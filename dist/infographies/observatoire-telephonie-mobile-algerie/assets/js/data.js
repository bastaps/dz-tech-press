/**
 * Observatoire du Marché de la Téléphonie Mobile en Algérie
 * Données ARPCE — 3ème Trimestre 2025
 * Source : Autorité de Régulation de la Poste et des Communications Electroniques
 */

// Couleurs cohérentes inter-rapports : Mobilis = vert oasis, Ooredoo = or, Djezzy = terre cuite
const COLOR_MOBILIS = "#2D8A5F";
const COLOR_OOREDOO = "#D4A437";
const COLOR_DJEZZY  = "#B85042";

export const DATASET = {
  meta: {
    titre: "Observatoire du Marché de la Téléphonie Mobile en Algérie",
    sousTitre: "Synthèse des indicateurs clés — 3ème Trimestre 2025",
    source: "ARPCE — Autorité de Régulation de la Poste et des Communications Électroniques",
    periode: "T3 2025",
    dateMaj: "T3 2025"
  },

  // === VUE D'ENSEMBLE ===
  vueEnsemble: {
    totalAbonnes: 55.94,           // en millions
    totalAbonnesExact: 55941086,
    croissanceTrimestrielle: 1.94, // % (T2 -> T3 2025)
    croissanceAnnuelle: 4.65,      // % (T3 2024 -> T3 2025)
    partPrepaid: 95.75,            // %
    partPostpaid: 4.25,            // %
    part4G: 89.56,                 // %
    part3G: 6.32,
    partGSM: 4.12
  },

  // === PARC GLOBAL PAR OPERATEUR (T3 2025) ===
  operateurs: [
    {
      code: "ATM",
      marque: "Mobilis",
      societe: "Algérie Télécom Mobile",
      abonnes: 23477942,
      part: 41.97,
      couleur: COLOR_MOBILIS
    },
    {
      code: "OTA",
      marque: "Djezzy",
      societe: "Optimum Télécom Algérie",
      abonnes: 17758639,
      part: 31.75,
      couleur: COLOR_DJEZZY
    },
    {
      code: "WTA",
      marque: "Ooredoo",
      societe: "Wataniya Télécom Algérie",
      abonnes: 14704505,
      part: 26.29,
      couleur: COLOR_OOREDOO
    }
  ],

  // === REPARTITION TECHNOLOGIE GLOBALE ===
  technologies: {
    global: [
      { nom: "GSM (2G)", abonnes: 2304982,  part: 4.12,  couleur: "#5E4A1F" },
      { nom: "3G",       abonnes: 3537285,  part: 6.32,  couleur: COLOR_OOREDOO },
      { nom: "4G",       abonnes: 50098819, part: 89.56, couleur: COLOR_MOBILIS }
    ],
    parOperateur: [
      { operateur: "Mobilis", gsm: 1040619, gsm_pct: 4.43, g3: 2537265, g3_pct: 10.81, g4: 19900058, g4_pct: 84.76 },
      { operateur: "Djezzy",  gsm: 763576,  gsm_pct: 4.30, g3: 424658,  g3_pct: 2.39,  g4: 16570405, g4_pct: 93.31 },
      { operateur: "Ooredoo", gsm: 500787,  gsm_pct: 3.41, g3: 575362,  g3_pct: 3.91,  g4: 13628356, g4_pct: 92.68 }
    ]
  },

  // === PREPAYE vs POSTPAYE (T3 2025) ===
  abonnement: {
    repartition: [
      { type: "Prépayé",  part: 95.75, couleur: COLOR_MOBILIS },
      { type: "Postpayé", part: 4.25,  couleur: COLOR_OOREDOO }
    ],
    parOperateur: [
      { operateur: "Mobilis", prepaye: 22769537, postpaye: 708405 },
      { operateur: "Djezzy",  prepaye: 16958370, postpaye: 800269 },
      { operateur: "Ooredoo", prepaye: 13834087, postpaye: 870418 }
    ],
    prepaye: {
      total: 53561994,
      croissanceTrimestrielle: 1.12,
      croissanceAnnuelle: 4.95,
      partsMarche: [
        { operateur: "Mobilis", part: 42.51, abonnes: 22769537 },
        { operateur: "Djezzy",  part: 31.66, abonnes: 16958370 },
        { operateur: "Ooredoo", part: 25.83, abonnes: 13834078 }
      ],
      technologies: [
        { nom: "GSM", abonnes: 2291512,  part: 4.28 },
        { nom: "3G",  abonnes: 3435845,  part: 6.41 },
        { nom: "4G",  abonnes: 47834637, part: 89.31 }
      ],
      mou: 261,           // minutes mensuelles moyennes
      arpu: 572           // DA
    },
    postpaye: {
      total: 2379092,
      croissanceTrimestrielle: -0.61,
      croissanceAnnuelle: -2.54,
      partsMarche: [
        { operateur: "Mobilis", part: 29.79, abonnes: 708405 },
        { operateur: "Djezzy",  part: 33.64, abonnes: 800269 },
        { operateur: "Ooredoo", part: 36.59, abonnes: 870418 }
      ],
      technologies: [
        { nom: "GSM", abonnes: 13470,   part: 0.57 },
        { nom: "3G",  abonnes: 101440,  part: 4.26 },
        { nom: "4G",  abonnes: 2264182, part: 95.17 }
      ],
      mou: 512,
      arpu: 1602
    }
  },

  // === TRAFIC VOIX (T3 2025, en millions de minutes) ===
  trafic: {
    voix: {
      total: 43620,
      croissanceAnnuelle: 0.96,
      repartition: [
        { type: "Intra-réseau (on-net)",     valeur: 35501, part: 81.39, couleur: COLOR_MOBILIS },
        { type: "Sortant national (off-net)", valeur: 8099,  part: 18.57, couleur: COLOR_OOREDOO },
        { type: "Sortant international",      valeur: 11,    part: 0.02,  couleur: COLOR_DJEZZY },
        { type: "Entrant international",      valeur: 9,     part: 0.02,  couleur: "#94a3b8" }
      ],
      evolution: [
        { trimestre: "T3 2024", intra: 36037, sortantNat: 7143, sortantInt: 14, entrantInt: 11, total: 43205 },
        { trimestre: "T4 2024", intra: 37565, sortantNat: 7414, sortantInt: 12, entrantInt: 11, total: 45002 },
        { trimestre: "T1 2025", intra: 35647, sortantNat: 7109, sortantInt: 11, entrantInt:  9, total: 42776 },
        { trimestre: "T2 2025", intra: 37479, sortantNat: 8068, sortantInt: 12, entrantInt: 10, total: 45569 },
        { trimestre: "T3 2025", intra: 35501, sortantNat: 8099, sortantInt: 11, entrantInt:  9, total: 43620 }
      ]
    },
    sms: {
      total: 3294,
      croissanceAnnuelle: -6.92,
      repartition: [
        { type: "Intra-réseau (on-net)",     valeur: 2746, part: 83.36, couleur: COLOR_MOBILIS },
        { type: "Sortant national (off-net)", valeur: 489,  part: 14.85, couleur: COLOR_OOREDOO },
        { type: "Sortant international",      valeur: 31,   part: 0.94,  couleur: COLOR_DJEZZY },
        { type: "Entrant international",      valeur: 28,   part: 0.85,  couleur: "#94a3b8" }
      ],
      evolution: [
        { trimestre: "T3 2024", intra: 3049, sortantNat: 449, sortantInt:  9, entrantInt: 32, total: 3539 },
        { trimestre: "T4 2024", intra: 2877, sortantNat: 445, sortantInt:  7, entrantInt: 26, total: 3355 },
        { trimestre: "T1 2025", intra: 2568, sortantNat: 431, sortantInt:  8, entrantInt: 25, total: 3032 },
        { trimestre: "T2 2025", intra: 2710, sortantNat: 481, sortantInt:  8, entrantInt: 26, total: 3225 },
        { trimestre: "T3 2025", intra: 2746, sortantNat: 489, sortantInt: 31, entrantInt: 28, total: 3294 }
      ]
    }
  },

  // === EVOLUTION SUR 5 TRIMESTRES ===
  evolution: {
    parcGlobal: [
      { trimestre: "T3 2024", mobilis: 22996731, djezzy: 16235287, ooredoo: 14222887, total: 53454905 },
      { trimestre: "T4 2024", mobilis: 23101816, djezzy: 16469034, ooredoo: 14479856, total: 54050706 },
      { trimestre: "T1 2025", mobilis: 23025515, djezzy: 17003410, ooredoo: 14237668, total: 54266593 },
      { trimestre: "T2 2025", mobilis: 23280698, djezzy: 17361131, ooredoo: 14232531, total: 54874360 },
      { trimestre: "T3 2025", mobilis: 23477942, djezzy: 17758639, ooredoo: 14704505, total: 55941086 }
    ],
    partsMarche: [
      { trimestre: "T3 2024", mobilis: 43.02, djezzy: 30.37, ooredoo: 26.61 },
      { trimestre: "T4 2024", mobilis: 42.74, djezzy: 30.47, ooredoo: 26.79 },
      { trimestre: "T1 2025", mobilis: 42.43, djezzy: 31.33, ooredoo: 26.24 },
      { trimestre: "T2 2025", mobilis: 42.43, djezzy: 31.64, ooredoo: 25.94 },
      { trimestre: "T3 2025", mobilis: 41.97, djezzy: 31.75, ooredoo: 26.29 }
    ]
  },

  // === SYNTHESE ===
  syntheseClé: [
    {
      titre: "Croissance Annuelle Soutenue",
      chiffre: "+4,65%",
      contexte: "Parc global mobile",
      description: "Le parc de téléphonie mobile a progressé de +4,65% en un an pour atteindre 55,94 millions d'abonnés, soutenu par la montée en charge continue de la 4G."
    },
    {
      titre: "Hégémonie de la 4G",
      chiffre: "89,56%",
      contexte: "des abonnés sont en 4G",
      description: "La 4G concentre désormais 89,56% du parc total. Les technologies GSM (4,12%) et 3G (6,32%) deviennent résiduelles."
    },
    {
      titre: "Le Prépayé Reste Roi",
      chiffre: "95,75%",
      contexte: "des abonnés en prépayé",
      description: "Le modèle prépayé domine massivement avec 53,56 millions d'abonnés, contre seulement 2,38 millions pour le postpayé (en léger recul : -2,54%/an)."
    }
  ],

  // Couleurs partagées (export pour scene3d et thumbnail)
  palette: {
    mobilis: COLOR_MOBILIS,
    ooredoo: COLOR_OOREDOO,
    djezzy:  COLOR_DJEZZY
  }
};

// Helpers de formatage
export const fmt = {
  nombre: (n) => n.toLocaleString('fr-FR'),
  nombreEntier: (n) => Math.round(n).toLocaleString('fr-FR'),
  millions: (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  millionsCourt: (n) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' M',
  pourcent: (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%',
  pourcentSimple: (n) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + '%',
  signeKpi: (n) => (n >= 0 ? '+' : '') + n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
};
