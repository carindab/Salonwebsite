/* =========================================================
   Salon Beheer - hoofdscript
   Alle data wordt in localStorage opgeslagen.
   ========================================================= */

console.log('%c[Salon Beheer] salon-app.js v27 geladen', 'background:#5fa463; color:white; padding:4px 8px; font-weight:bold;');
const APP_VERSION = 'v27';
/** Seed-bestand op GitHub Pages — automatisch geladen (geen handmatige CSV-import nodig). */
const SALON_SEED_VERSION = '4';
const SALON_SEED_KEY = 'salon-seed-version';
/** v10: negeer v9 (o.a. CSV-upload bij file:// bleef in localStorage hangen). */
const STORAGE_KEY = 'salon-data-v10';

/* ---------- Standaard / echte diensten-data ---------- */
function defaultData() {
  // Behandelcategorieën
  const treatmentCategories = [
    'Plasma behandelingen',
    'Zuurstof behandeling',
    'Elim Huidherstel formule onderzoek',
    'Microdermabrasie',
    'IPL',
    'Elektrisch ontharen',
    'CollageenBooster',
    'Dermapen',
    'Aesthetico Peel',
    'RC test',
    'Biomicroneedling',
    'Overige behandelingen',
    'Aesthetic Injector',
    'Kennismakingsaanbieding',
    'Exilis Protege',
    'Afspraak',
  ];

  // Alle behandelingen met categorie, duur (minuten), BTW%, prijs
  const treatments = [
    // Plasma behandelingen
    { id: 't001', category: 'Plasma behandelingen', name: 'Plasma facial',      duration: 45,  vat: 21, price: 250.00 },
    { id: 't002', category: 'Plasma behandelingen', name: 'Bio Plasma bovenlip', duration: 60,  vat: 21, price: 350.00 },
    { id: 't003', category: 'Plasma behandelingen', name: 'Couperose',           duration: 0,   vat: 21, price: 195.00 },
    { id: 't004', category: 'Plasma behandelingen', name: 'Plasma eye',          duration: 0,   vat: 21, price: 495.00 },

    // Zuurstof behandeling
    { id: 't010', category: 'Zuurstof behandeling', name: 'Carboxy Therapie', duration: 30, vat: 21, price: 109.00 },

    // Elim Huidherstel formule onderzoek
    { id: 't020', category: 'Elim Huidherstel formule onderzoek', name: 'Elim huidherstel formule (SKIN-scan + CollagenElastineBooster behandeling of Vital C peel + RC wangslijmtest)', duration: 60, vat: 21, price: 249.00 },
    { id: 't021', category: 'Elim Huidherstel formule onderzoek', name: 'Wangslijmtest',                                       duration: 5,  vat: 21, price: 149.00 },
    { id: 't022', category: 'Elim Huidherstel formule onderzoek', name: 'Radiance Blueprint Analyse + dag/nachtcrème + serum', duration: 15, vat: 21, price: 99.00  },

    // Microdermabrasie
    { id: 't030', category: 'Microdermabrasie', name: 'Microdermabrasie', duration: 30, vat: 21, price: 155.00 },

    // IPL
    { id: 't040', category: 'IPL', name: 'Ipl Billen volledig + onderrug',          duration: 1,  vat: 21, price: 338.00 },
    { id: 't041', category: 'IPL', name: 'Ipl Billen volledig + rug',               duration: 1,  vat: 21, price: 453.00 },
    { id: 't042', category: 'IPL', name: 'IPL Bikinilijn + oksels + klein deel benen', duration: 1, vat: 21, price: 200.00 },
    { id: 't043', category: 'IPL', name: 'IPL Bikinilijn volledig',                 duration: 1,  vat: 21, price: 169.00 },
    { id: 't044', category: 'IPL', name: 'IPL billen + bilnaad',                    duration: 30, vat: 21, price: 189.00 },
    { id: 't045', category: 'IPL', name: 'IPL Bikinilijn + Oksels',                 duration: 20, vat: 21, price: 99.00  },
    { id: 't046', category: 'IPL', name: 'IPL Bovenlip',                            duration: 10, vat: 21, price: 69.00  },
    { id: 't047', category: 'IPL', name: 'IPL Kin',                                 duration: 10, vat: 21, price: 74.00  },
    { id: 't048', category: 'IPL', name: 'IPL Bovenlip hoekjes',                    duration: 5,  vat: 21, price: 30.00  },
    { id: 't049', category: 'IPL', name: 'IPL bovenlip + stukje kin',               duration: 10, vat: 21, price: 79.00  },
    { id: 't050', category: 'IPL', name: 'Ipl Kin + onderkin',                      duration: 10, vat: 21, price: 69.00  },
    { id: 't051', category: 'IPL', name: 'IPL vinger',                              duration: 0,  vat: 21, price: 43.00  },
    { id: 't052', category: 'IPL', name: 'Ipl Borst stukje',                        duration: 0,  vat: 21, price: 22.00  },
    { id: 't053', category: 'IPL', name: 'IPL Borst',                               duration: 15, vat: 21, price: 135.00 },
    { id: 't054', category: 'IPL', name: 'IPL voeten',                              duration: 0,  vat: 21, price: 40.00  },
    { id: 't055', category: 'IPL', name: 'IPL Bovenbenen',                          duration: 20, vat: 21, price: 255.00 },
    { id: 't056', category: 'IPL', name: 'Ipl bikini onderkant',                    duration: 10, vat: 21, price: 99.00  },
    { id: 't057', category: 'IPL', name: 'Ipl oksel',                               duration: 15, vat: 21, price: 89.50  },
    { id: 't058', category: 'IPL', name: 'Ipl kin + hals',                          duration: 15, vat: 21, price: 79.00  },
    { id: 't059', category: 'IPL', name: 'Ipl Voorkant benen',                      duration: 1,  vat: 21, price: 95.00  },
    { id: 't060', category: 'IPL', name: 'IPL Bovenlip + kin',                      duration: 10, vat: 21, price: 110.00 },
    { id: 't061', category: 'IPL', name: 'Ipl wenkbrauwen',                         duration: 10, vat: 21, price: 39.00  },
    { id: 't062', category: 'IPL', name: 'Ipl half gezicht',                        duration: 1,  vat: 21, price: 169.00 },
    { id: 't063', category: 'IPL', name: 'Ipl buik + armen',                        duration: 1,  vat: 21, price: 228.00 },
    { id: 't064', category: 'IPL', name: 'IPL onder benen',                         duration: 1,  vat: 21, price: 215.00 },
    { id: 't065', category: 'IPL', name: 'Ipl armen volledig',                      duration: 20, vat: 21, price: 295.00 },
    { id: 't066', category: 'IPL', name: 'Ipl buik + deel benen + billen',          duration: 1,  vat: 21, price: 526.00 },
    { id: 't067', category: 'IPL', name: 'PL Billen volledig + onderrug',           duration: 1,  vat: 21, price: 338.00 },
    { id: 't068', category: 'IPL', name: 'Ipl benen',                               duration: 30, vat: 21, price: 316.00 },
    { id: 't069', category: 'IPL', name: 'Ipl armen en voeten',                     duration: 10, vat: 21, price: 127.00 },

    // Elektrisch ontharen
    { id: 't070', category: 'Elektrisch ontharen', name: 'Elektrisch ontharen', duration: 30, vat: 21, price: 70.00 },

    // CollageenBooster
    { id: 't080', category: 'CollageenBooster', name: 'Collagen Booster + Micro',             duration: 45, vat: 21, price: 165.00 },
    { id: 't081', category: 'CollageenBooster', name: 'CollageenElastinebooster',              duration: 30, vat: 21, price: 169.50 },
    { id: 't082', category: 'CollageenBooster', name: 'Collagen booster + elastine + micro',  duration: 45, vat: 21, price: 224.50 },
    { id: 't083', category: 'CollageenBooster', name: 'Photonlaser + booster + elastine + micro', duration: 60, vat: 21, price: 245.00 },

    // Dermapen
    { id: 't090', category: 'Dermapen', name: 'Dermastamp + groeifactoren + peel', duration: 60, vat: 21, price: 449.00 },
    { id: 't091', category: 'Dermapen', name: 'MesoDermapen',                      duration: 30, vat: 21, price: 284.50 },
    { id: 't092', category: 'Dermapen', name: 'MesoDermapen + hals',               duration: 40, vat: 21, price: 384.50 },
    { id: 't093', category: 'Dermapen', name: 'MesoDermapen hals + Decolleté',     duration: 60, vat: 21, price: 375.00 },
    { id: 't094', category: 'Dermapen', name: 'Dermapen Hals',                     duration: 45, vat: 21, price: 51.00  },

    // Aesthetico Peel
    { id: 't100', category: 'Aesthetico Peel', name: 'Peel Acne',       duration: 30, vat: 21, price: 145.00 },
    { id: 't101', category: 'Aesthetico Peel', name: 'Peel Acne extra', duration: 30, vat: 21, price: 159.50 },

    // RC test
    { id: 't110', category: 'RC test', name: 'RC test', duration: 10, vat: 21, price: 199.00 },

    // Biomicroneedling
    { id: 't120', category: 'Biomicroneedling', name: 'Biomicroneedling Pigment',               duration: 40, vat: 21, price: 295.00 },
    { id: 't121', category: 'Biomicroneedling', name: 'Biomicroneedling Acne',                  duration: 40, vat: 21, price: 295.00 },
    { id: 't122', category: 'Biomicroneedling', name: 'Biomicroneedling Huidverjonging + Plasma', duration: 45, vat: 21, price: 395.00 },
    { id: 't123', category: 'Biomicroneedling', name: 'Biomicroneedling Huidverjonging',        duration: 40, vat: 21, price: 295.00 },

    // Overige behandelingen
    { id: 't130', category: 'Overige behandelingen', name: 'Epileren',                     duration: 15, vat: 21, price: 20.50 },
    { id: 't131', category: 'Overige behandelingen', name: 'Verven wenkbrauwen',           duration: 15, vat: 21, price: 17.50 },
    { id: 't132', category: 'Overige behandelingen', name: 'Harsen bovenlip',              duration: 5,  vat: 21, price: 13.50 },
    { id: 't133', category: 'Overige behandelingen', name: 'Harsen bovenlip + kin',        duration: 10, vat: 21, price: 21.50 },
    { id: 't134', category: 'Overige behandelingen', name: 'Harsen bovenlip + onder lip',  duration: 8,  vat: 21, price: 16.50 },
    { id: 't135', category: 'Overige behandelingen', name: 'Verven wimpers + wenkbrauwen', duration: 15, vat: 21, price: 28.50 },
    { id: 't136', category: 'Overige behandelingen', name: 'Verven wimpers',               duration: 10, vat: 21, price: 19.50 },

    // Aesthetic Injector
    { id: 't140', category: 'Aesthetic Injector', name: 'Mesotherapie + hyaluron filler',          duration: 45, vat: 21, price: 450.00 },
    { id: 't141', category: 'Aesthetic Injector', name: 'Mesotherapie Hyaluronzuur + vitamine',    duration: 60, vat: 21, price: 225.00 },
    { id: 't142', category: 'Aesthetic Injector', name: 'Mesotherapie Hyaluronzuur + vitamine + peel', duration: 60, vat: 21, price: 275.00 },

    // Kennismakingsaanbieding
    { id: 't150', category: 'Kennismakingsaanbieding', name: 'SKIN-scan + Microdermabrasie + Collagen Elastine Booster behandeling', duration: 60, vat: 21, price: 149.00 },
    { id: 't151', category: 'Kennismakingsaanbieding', name: 'SKIN-scan + kennismakingsbehandeling',              duration: 45, vat: 21, price: 149.00 },
    { id: 't152', category: 'Kennismakingsaanbieding', name: 'Collagen Elastine Booster + Skin Scan',             duration: 45, vat: 21, price: 99.00  },
    { id: 't153', category: 'Kennismakingsaanbieding', name: 'SkinInsight Analyse + VerjongingsBoost behandeling + serum', duration: 45, vat: 21, price: 149.00 },

    // Exilis Protege
    { id: 't160', category: 'Exilis Protege', name: 'Exilis Elite',          duration: 90, vat: 21, price: 450.00 },
    { id: 't161', category: 'Exilis Protege', name: 'Elixit Elite (50 min)', duration: 50, vat: 21, price: 399.00 },
    { id: 't162', category: 'Exilis Protege', name: 'Elixit Elite (25 min)', duration: 25, vat: 21, price: 165.00 },
    { id: 't163', category: 'Exilis Protege', name: 'Elixit Elite (45 min)', duration: 45, vat: 21, price: 265.00 },
    { id: 't164', category: 'Exilis Protege', name: 'Exilis Elite Handen',   duration: 0,  vat: 21, price: 100.00 },
    { id: 't165', category: 'Exilis Protege', name: 'Exilis Elite Decolleté',duration: 0,  vat: 21, price: 225.00 },

    // Afspraak (bloktijden voor eigen gebruik)
    { id: 't170', category: 'Afspraak', name: 'Stretchen Carinda', duration: 60,  vat: 21, price: 0.00 },
    { id: 't171', category: 'Afspraak', name: 'Nila oppassen',     duration: 180, vat: 21, price: 0.00 },
    { id: 't172', category: 'Afspraak', name: 'Boekhouding',       duration: 60,  vat: 0,  price: 0.00 },
  ];

  return {
    settings: {
      salonName: 'Elim Instituut',
      vat: 21,
      openTime: '08:30',
      closeTime: '18:00',
      workdays: 5,
      seats: 1,
      weekSchemaEnabled: true,
      weekSchemaWorkOdd: true,

      // Bedrijfsgegevens (voor o.a. factuur)
      address: 'Kerksingel 16',
      postal: '2951 GE',
      city: 'Alblasserdam',
      phone: '078 69 11 113',
      email: '',
      website: '',
      kvk: '',
      btwNummer: 'NL24RABO0123949521',
      iban: '',
      bank: '',
      anbosNaam: 'C.A. Brand',
      anbosKernlidNummer: '20430',
      anbosKernlid: '',
      agbZorgverlener: '89-002069',
      agbPraktijk: '89-(0)52182',
      logoUrl: '',
      // Factuurnummer-teller
      invoiceCounter: 10314,
      bccCopy: false,
      /** Klantenlijst: lastName | firstName | importId (Salonware klant_id) */
      klantenSort: 'lastName',
    },
    messageTemplates: defaultMessageTemplates(),
    intakeQuestions: defaultIntakeQuestions(),
    treatmentCategories,
    treatments,
    /* Leeg: eigen klanten (CSV-import of handmatig) */
    clients: [],
    productCategories: [
      'Centrum voor natuurgeneeskunde middelen',
      'Centrum voor natuurgeneeskunde VK',
      'SkinPhilosophy',
      'Elim Instituut Organic',
      'Lygocel verkoop',
    ],
    products: [
      // Centrum voor natuurgeneeskunde middelen
      { id: 'p001', category: 'Centrum voor natuurgeneeskunde middelen', name: 'Middelen',      purchasePrice: 0,     vat: 9,  price: 0,     stock: 0 },
      { id: 'p002', category: 'Centrum voor natuurgeneeskunde middelen', name: 'Middelen Derm', purchasePrice: 0,     vat: 21, price: 0,     stock: 0 },

      // Centrum voor natuurgeneeskunde VK
      { id: 'p010', category: 'Centrum voor natuurgeneeskunde VK', name: 'Source of life gold',       purchasePrice: 0,      vat: 9, price: 145.00, stock: 0 },
      { id: 'p011', category: 'Centrum voor natuurgeneeskunde VK', name: 'RC Omega Complex 250 caps.', purchasePrice: 0,      vat: 9, price: 125.00, stock: 0 },
      { id: 'p012', category: 'Centrum voor natuurgeneeskunde VK', name: 'RC Skin Renewing 150 caps.', purchasePrice: 0,      vat: 9, price: 99.00,  stock: 0 },
      { id: 'p013', category: 'Centrum voor natuurgeneeskunde VK', name: 'RC Skin Control plex rad',   purchasePrice: 112.50, vat: 9, price: 225.00, stock: 0 },
      { id: 'p014', category: 'Centrum voor natuurgeneeskunde VK', name: 'RC Ascorbo plus',            purchasePrice: 112.50, vat: 9, price: 225.00, stock: 0 },
      { id: 'p015', category: 'Centrum voor natuurgeneeskunde VK', name: 'RC cleanse',                 purchasePrice: 0,      vat: 9, price: 62.00,  stock: 0 },
      { id: 'p016', category: 'Centrum voor natuurgeneeskunde VK', name: 'RC ascorbo plus 330',        purchasePrice: 62.50,  vat: 9, price: 125.00, stock: 0 },
      { id: 'p017', category: 'Centrum voor natuurgeneeskunde VK', name: 'Spijsdruppels',              purchasePrice: 0,      vat: 9, price: 85.00,  stock: 0 },
      { id: 'p018', category: 'Centrum voor natuurgeneeskunde VK', name: 'Potentie',                   purchasePrice: 0,      vat: 9, price: 79.00,  stock: 0 },

      // SkinPhilosophy
      { id: 'p020', category: 'SkinPhilosophy', name: 'SkinPhilosophy Time Reset',                  purchasePrice: 16.85, vat: 21, price: 45.00,  stock: 0 },
      { id: 'p021', category: 'SkinPhilosophy', name: 'SkinPhilosophy Pore perfection',             purchasePrice: 16.85, vat: 21, price: 45.00,  stock: 0 },
      { id: 'p022', category: 'SkinPhilosophy', name: 'SkinPhilosophy Ageless Prevention serum',    purchasePrice: 16.85, vat: 21, price: 45.00,  stock: 0 },
      { id: 'p023', category: 'SkinPhilosophy', name: 'SkinPhilosphy Total Balance Cleanser',       purchasePrice: 9.80,  vat: 21, price: 29.50,  stock: 0 },
      { id: 'p024', category: 'SkinPhilosophy', name: 'SkinPhilosphy 24 mpp creme',                 purchasePrice: 13.60, vat: 21, price: 42.50,  stock: 0 },
      { id: 'p025', category: 'SkinPhilosophy', name: 'SkinPhilosophy Caviar dna creme',            purchasePrice: 18.90, vat: 21, price: 66.50,  stock: 0 },
      { id: 'p026', category: 'SkinPhilosophy', name: 'SkinPhilosophy Ageless sun prevention spf 30', purchasePrice: 17.45, vat: 21, price: 69.00, stock: 0 },
      { id: 'p027', category: 'SkinPhilosophy', name: 'SkinPhilosophy Facelift creme',              purchasePrice: 15.80, vat: 21, price: 49.50,  stock: 0 },
      { id: 'p028', category: 'SkinPhilosophy', name: 'SkinPhilosophy Oyster creme',                purchasePrice: 15.50, vat: 21, price: 49.50,  stock: 0 },
      { id: 'p029', category: 'SkinPhilosophy', name: 'SkinPhilosophy eye sensation',               purchasePrice: 16.50, vat: 21, price: 79.00,  stock: 0 },
      { id: 'p030', category: 'SkinPhilosophy', name: 'SkinPhilosophy eye perfection',              purchasePrice: 13.80, vat: 21, price: 45.00,  stock: 0 },
      { id: 'p031', category: 'SkinPhilosophy', name: 'SkinPhilosophy Balance Repair',              purchasePrice: 16.85, vat: 21, price: 45.00,  stock: 0 },
      { id: 'p032', category: 'SkinPhilosophy', name: 'SkinPhilosophy Pure Hyaluronic',             purchasePrice: 16.85, vat: 21, price: 45.00,  stock: 0 },
      { id: 'p033', category: 'SkinPhilosophy', name: 'SkinPhilosophy Spotless Whitening',          purchasePrice: 16.85, vat: 21, price: 45.00,  stock: 0 },
      { id: 'p034', category: 'SkinPhilosophy', name: 'SkinPhilosophy CCP',                         purchasePrice: 16.85, vat: 21, price: 45.00,  stock: 0 },
      { id: 'p035', category: 'SkinPhilosophy', name: 'SkinPhilosophy Absolu Retinol',              purchasePrice: 16.85, vat: 21, price: 45.00,  stock: 0 },
      { id: 'p036', category: 'SkinPhilosophy', name: 'Care Cleanser',                              purchasePrice: 0,     vat: 21, price: 49.00,  stock: 0 },
      { id: 'p037', category: 'SkinPhilosophy', name: '24H creme',                                  purchasePrice: 0,     vat: 21, price: 99.00,  stock: 0 },
      { id: 'p038', category: 'SkinPhilosophy', name: 'All Day Protection Booster',                 purchasePrice: 0,     vat: 21, price: 115.00, stock: 0 },
      { id: 'p039', category: 'SkinPhilosophy', name: 'Elim Cleanser',                              purchasePrice: 58.00, vat: 21, price: 0,      stock: 0 },
      { id: 'p040', category: 'SkinPhilosophy', name: 'Elim Ageless Sun',                           purchasePrice: 0,     vat: 21, price: 79.00,  stock: 0 },
      { id: 'p041', category: 'SkinPhilosophy', name: 'Elim 24H creme',                             purchasePrice: 99.00, vat: 21, price: 0,      stock: 0 },
      { id: 'p042', category: 'SkinPhilosophy', name: 'Elim acne nacht',                            purchasePrice: 0,     vat: 21, price: 89.00,  stock: 0 },
      { id: 'p043', category: 'SkinPhilosophy', name: 'Peel',                                       purchasePrice: 49.50, vat: 21, price: 0,      stock: 0 },
      { id: 'p044', category: 'SkinPhilosophy', name: 'Elim Individual Skin Formula Dag',           purchasePrice: 135.00,vat: 21, price: 0,      stock: 0 },
      { id: 'p045', category: 'SkinPhilosophy', name: 'Elim Individual Skin Formula Beh creme.',   purchasePrice: 135.00,vat: 21, price: 0,      stock: 0 },
      { id: 'p046', category: 'SkinPhilosophy', name: 'Elim Individual Skin Formula Nacht',        purchasePrice: 135.00,vat: 21, price: 0,      stock: 0 },
      { id: 'p047', category: 'SkinPhilosophy', name: 'Calming Masker',                             purchasePrice: 0,     vat: 21, price: 50.00,  stock: 0 },
      { id: 'p048', category: 'SkinPhilosophy', name: 'Elim Skin Balance Rosacea',                  purchasePrice: 99.00, vat: 0,  price: 0,      stock: 0 },
      { id: 'p049', category: 'SkinPhilosophy', name: 'Elim Skin Balance Acne dag',                 purchasePrice: 0,     vat: 0,  price: 89.00,  stock: 0 },
      { id: 'p050', category: 'SkinPhilosophy', name: 'ELIM spf 30 navul',                          purchasePrice: 0,     vat: 21, price: 80.00,  stock: 0 },

      // Elim Instituut Organic
      { id: 'p060', category: 'Elim Instituut Organic', name: 'Elim Hydrating Cleanser', purchasePrice: 0,     vat: 21, price: 59.00, stock: 0 },
      { id: 'p061', category: 'Elim Instituut Organic', name: 'Elim Lotion',             purchasePrice: 0,     vat: 21, price: 50.00, stock: 0 },
      { id: 'p062', category: 'Elim Instituut Organic', name: 'Elim Tinted SPF 30',      purchasePrice: 59.00, vat: 21, price: 0,     stock: 0 },
      { id: 'p063', category: 'Elim Instituut Organic', name: 'Elim SPF 30 150ml',       purchasePrice: 0,     vat: 21, price: 99.00, stock: 0 },
      { id: 'p064', category: 'Elim Instituut Organic', name: 'Elim Balance Cleanser',   purchasePrice: 0,     vat: 21, price: 0,     stock: 0 },
      { id: 'p065', category: 'Elim Instituut Organic', name: 'Elim Balance Lotion',     purchasePrice: 0,     vat: 21, price: 50.00, stock: 0 },
      { id: 'p066', category: 'Elim Instituut Organic', name: 'Elim Botox-like Serum',   purchasePrice: 0,     vat: 21, price: 79.00, stock: 0 },
      { id: 'p067', category: 'Elim Instituut Organic', name: 'Elim vitamine C',         purchasePrice: 0,     vat: 21, price: 79.00, stock: 0 },
      { id: 'p068', category: 'Elim Instituut Organic', name: 'Elim Collageen Cream',    purchasePrice: 0,     vat: 21, price: 99.00, stock: 0 },
      { id: 'p069', category: 'Elim Instituut Organic', name: 'Elim Nourshing cream',    purchasePrice: 0,     vat: 21, price: 99.00, stock: 0 },
      { id: 'p070', category: 'Elim Instituut Organic', name: 'Elim Hyaluronic serum',   purchasePrice: 79.00, vat: 21, price: 0,     stock: 0 },
      { id: 'p071', category: 'Elim Instituut Organic', name: 'Elim Cleansing Balm',     purchasePrice: 59.00, vat: 21, price: 0,     stock: 0 },

      // Lygocel verkoop
      { id: 'p080', category: 'Lygocel verkoop', name: 'Lygogel Taupe',         purchasePrice: 0, vat: 21, price: 67.75, stock: 0 },
      { id: 'p081', category: 'Lygocel verkoop', name: 'Lygogel Honey',         purchasePrice: 0, vat: 21, price: 60.50, stock: 0 },
      { id: 'p082', category: 'Lygocel verkoop', name: 'Lygocel Beige',         purchasePrice: 0, vat: 21, price: 60.50, stock: 0 },
      { id: 'p083', category: 'Lygocel verkoop', name: 'Lygogel Caremel',       purchasePrice: 0, vat: 21, price: 62.10, stock: 0 },
      { id: 'p084', category: 'Lygocel verkoop', name: 'Lycogel Creme',         purchasePrice: 0, vat: 21, price: 60.50, stock: 0 },
      { id: 'p085', category: 'Lygocel verkoop', name: 'Lycogel concealer pink',purchasePrice: 0, vat: 9,  price: 39.75, stock: 0 },
    ],
    /* Leeg: geen demo-afspraken; agenda en historie vullen zelf */
    appointments: [],
    cadeaubonnen: [],
    packages: [],
    /** Alleen als true: demo-klant + bezoeken uit burcu-akcay-appointments.js */
    burcuAkcayDemo: false,
  };
}

/* ---------- Opslag ---------- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const def = defaultData();
      if (!parsed.treatmentCategories) parsed.treatmentCategories = def.treatmentCategories;
      if (!parsed.treatments || !parsed.treatments.length || !parsed.treatments[0].category) {
        parsed.treatments = def.treatments;
        parsed.treatmentCategories = def.treatmentCategories;
      }
      if (!parsed.productCategories) parsed.productCategories = def.productCategories;
      if (!parsed.products || !parsed.products.length || !parsed.products[0].category) {
        parsed.products = def.products;
        parsed.productCategories = def.productCategories;
      }
      migrateSettingsAnbos(parsed.settings, def);
      if (parsed.settings) {
        Object.keys(def.settings).forEach(k => {
          if (parsed.settings[k] === undefined) parsed.settings[k] = def.settings[k];
        });
      }
      if (!Array.isArray(parsed.clients)) parsed.clients = [];
      if (!Array.isArray(parsed.appointments)) parsed.appointments = [];
      if (!Array.isArray(parsed.cadeaubonnen)) parsed.cadeaubonnen = [];
      if (!Array.isArray(parsed.packages)) parsed.packages = [];
      if (!parsed.autoFinalizeLog || typeof parsed.autoFinalizeLog !== 'object') parsed.autoFinalizeLog = {};
      if (parsed.burcuAkcayDemo === undefined) parsed.burcuAkcayDemo = def.burcuAkcayDemo;
      if (pruneBurcuDemoIfOff(parsed)) saveData(parsed);
      return parsed;
    }
  } catch (e) { /* val terug op default */ }
  const fresh = defaultData();
  saveData(fresh);
  return fresh;
}
function migrateSettingsAnbos(s, def) {
  if (!s) return;
  if (!s.anbosNaam && !s.anbosKernlidNummer && s.anbosKernlid) {
    const t = s.anbosKernlid;
    const m = t.match(/^(.+?)\s*ANBOS\s*Kernlidnummer[:\s]*(\d+)\s*$/i);
    if (m) {
      s.anbosNaam = m[1].trim();
      s.anbosKernlidNummer = m[2].trim();
    } else {
      s.anbosNaam = t.trim();
    }
  }
  if (s.anbosKernlidNummer === undefined) s.anbosKernlidNummer = def.settings.anbosKernlidNummer;
  if (s.anbosNaam === undefined) s.anbosNaam = def.settings.anbosNaam;
}

const BURCU_DEMO_CLIENT_ID = 'c_salon_444972';

/** Verwijdert ingebouwde Burcu-demo als die niet actief mag zijn. Returns true als DB gewijzigd. */
function pruneBurcuDemoIfOff(db) {
  if (db.burcuAkcayDemo === true) return false;
  let changed = false;
  const clients = db.clients || [];
  if (clients.some(c => c.id === BURCU_DEMO_CLIENT_ID)) {
    db.clients = clients.filter(c => c.id !== BURCU_DEMO_CLIENT_ID);
    changed = true;
  }
  const apts = db.appointments || [];
  const filteredA = apts.filter(
    a => !(a.clientId === BURCU_DEMO_CLIENT_ID && String(a.id || '').startsWith('a_burcu_'))
  );
  if (filteredA.length !== apts.length) {
    db.appointments = filteredA;
    changed = true;
  }
  if (db.burcuAkcayHistoryV !== undefined) {
    delete db.burcuAkcayHistoryV;
    changed = true;
  }
  return changed;
}

function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

let DB = loadData();

/** Burcu Akcay: klant + bezoekregels uit burcu-akcay-appointments.js. */
function applyBurcuAkcayOverride() {
  try {
    if (DB.burcuAkcayDemo !== true) return;
    const G = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});
    const V = G.BURCU_AKCAE_V;
    const list = G.BURCU_AKCAE_APPOINTMENTS;
    const clientOne = G.BURCU_CLIENT;
    if (V === undefined || !Array.isArray(list) || !list.length) return;
    const cid = BURCU_DEMO_CLIENT_ID;
    const hasOurs = (DB.appointments || []).some(a => a.clientId === cid && String(a.id || '').startsWith('a_burcu_'));
    if (DB.burcuAkcayHistoryV === V && hasOurs) return;
    if (!(DB.clients || []).some(c => c.id === cid)) {
      if (!clientOne) return;
      DB.clients.push(JSON.parse(JSON.stringify(clientOne)));
    }
    DB.appointments = (DB.appointments || []).filter(a => a.clientId !== cid);
    list.forEach(ap => {
      DB.appointments.push(JSON.parse(JSON.stringify(ap)));
    });
    DB.burcuAkcayHistoryV = V;
    saveData(DB);
  } catch (e) { /* */ }
}
applyBurcuAkcayOverride();

/* ---------- Hulpfuncties ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const uid = (prefix = 'x') => prefix + '_' + Math.random().toString(36).slice(2, 9);

/* =========================================================
   AUTOCOMPLETE / Type-ahead helper
   getResults(query) -> [{id, label, sub?, kind?}, ...]
   onSelect(item) -> void
   ========================================================= */
function attachAutocomplete(input, getResults, onSelect, opts = {}) {
  if (!input || input.dataset.acAttached) return;
  input.dataset.acAttached = '1';
  input.setAttribute('autocomplete', 'off');

  const wrap = document.createElement('div');
  wrap.className = 'ac-wrap';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);

  const dropdown = document.createElement('div');
  dropdown.className = 'ac-dropdown';
  dropdown.style.display = 'none';
  wrap.appendChild(dropdown);

  let activeIdx = -1;
  let lastResults = [];

  function renderResults(results) {
    lastResults = results;
    if (!results.length) { dropdown.style.display = 'none'; return; }
    dropdown.innerHTML = results.map((r, i) => `
      <div class="ac-item ${i===activeIdx?'active':''}" data-i="${i}">
        <div class="ac-label">${escapeHtml(r.label)}</div>
        ${r.sub ? `<div class="ac-sub">${escapeHtml(r.sub)}</div>` : ''}
      </div>
    `).join('');
    dropdown.style.display = 'block';
    dropdown.querySelectorAll('.ac-item').forEach(el => {
      el.addEventListener('mousedown', e => {
        e.preventDefault();
        const idx = Number(el.dataset.i);
        choose(idx);
      });
    });
  }
  function choose(idx) {
    const item = lastResults[idx];
    if (!item) return;
    if (opts.clearOnSelect !== false) input.value = '';
    else input.value = item.label;
    dropdown.style.display = 'none';
    activeIdx = -1;
    onSelect(item);
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.style.display = 'none'; return; }
    activeIdx = 0;
    renderResults(getResults(q).slice(0, 30));
  });
  input.addEventListener('focus', () => {
    const q = input.value.trim().toLowerCase();
    if (q) {
      activeIdx = 0;
      renderResults(getResults(q).slice(0, 30));
    } else if (opts.showAllOnFocus) {
      activeIdx = 0;
      renderResults(getResults('').slice(0, 30));
    }
  });
  input.addEventListener('blur', () => setTimeout(() => dropdown.style.display = 'none', 150));
  input.addEventListener('keydown', e => {
    if (dropdown.style.display === 'none') return;
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx+1, lastResults.length-1); renderResults(lastResults); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); activeIdx = Math.max(activeIdx-1, 0); renderResults(lastResults); }
    if (e.key === 'Enter')     { e.preventDefault(); if (activeIdx>=0) choose(activeIdx); }
    if (e.key === 'Escape')    { dropdown.style.display = 'none'; }
  });
}

/* Standaard zoeker: alle behandelingen + producten */
function searchTreatmentsAndProducts(q) {
  const ql = q.toLowerCase();
  const matches = [];
  DB.treatments.forEach(t => {
    if (!ql || t.name.toLowerCase().includes(ql) || (t.category||'').toLowerCase().includes(ql)) {
      matches.push({ id: t.id, kind: 'treatment', label: t.name, sub: `${t.category||''} • ${fmtMoney(t.price)} • ${t.duration||0} min` });
    }
  });
  DB.products.forEach(p => {
    if (!ql || p.name.toLowerCase().includes(ql) || (p.category||'').toLowerCase().includes(ql)) {
      matches.push({ id: p.id, kind: 'product', label: p.name, sub: `${p.category||'Product'} • ${fmtMoney(p.price)}` });
    }
  });
  return matches;
}
function searchClients(q) {
  const ql = q.toLowerCase();
  return DB.clients
    .filter(c => !ql || clientFullName(c).toLowerCase().includes(ql) || (c.email||'').toLowerCase().includes(ql) || (c.phone||'').includes(ql) || (c.mobile||'').includes(ql))
    .slice(0, 20)
    .map(c => ({ id: c.id, kind: 'client', label: clientFullName(c), sub: `${c.email||''}${c.email&&c.mobile?' • ':''}${c.mobile||c.phone||''}` }));
}

/* =========================================================
   MAILTO helpers
   ========================================================= */
function openMailto(to, subject, body, bcc) {
  let qs = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (bcc) qs += `&bcc=${encodeURIComponent(bcc)}`;
  window.location.href = `mailto:${encodeURIComponent(to||'')}?${qs}`;
}
function buildConfirmationBody(client, appointment) {
  const t = getTemplate('appt_confirmation');
  return fillTokens(t.body, { client, appointment });
}
function buildConfirmationSubject(client, appointment) {
  const t = getTemplate('appt_confirmation');
  return fillTokens(t.subject, { client, appointment });
}
function buildIntakeFormBody(client, intakeLink) {
  const t = getTemplate('intake_form_send');
  return fillTokens(t.body, { client, intake_link: intakeLink || '' });
}
function buildIntakeFormSubject(client) {
  const t = getTemplate('intake_form_send');
  return fillTokens(t.subject, { client });
}
function buildReminderBody(client, appointment) {
  const t = getTemplate('appt_reminder');
  return fillTokens(t.body, { client, appointment });
}
function buildReminderSubject(client, appointment) {
  const t = getTemplate('appt_reminder');
  return fillTokens(t.subject, { client, appointment });
}
function buildInvoiceEmail(client, appointment, ctx) {
  const t = getTemplate('invoice');
  return {
    subject: fillTokens(t.subject, { client, appointment, ...ctx }),
    body: fillTokens(t.body, { client, appointment, ...ctx })
  };
}
function logSentMessage(clientId, type, subject) {
  const c = findClient(clientId);
  if (!c) return;
  if (!c.sentMessages) c.sentMessages = [];
  c.sentMessages.unshift({ at: new Date().toISOString(), type, subject });
  saveData(DB);
}
const todayISO = () => new Date().toISOString().slice(0, 10);
/** Lokale kalenderdag YYYY-MM-DD (geen UTC-shift zoals toISOString) */
function toLocalISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayLocalISO() { return toLocalISODate(new Date()); }
function parseLocalYMD(iso) {
  if (!iso || typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return new Date();
  const [y, m, day] = iso.split('-').map(Number);
  return new Date(y, m - 1, day);
}
/** Tel weken (×7 dagen) bij een lokale YYYY-MM-DD, zonder UTC-shift. */
function addWeeksToIsoDate(iso, weeks) {
  const d = parseLocalYMD(iso);
  d.setDate(d.getDate() + (Number(weeks) || 0) * 7);
  return toLocalISODate(d);
}
const fmtMoney = (n) => '€\u00A0' + (Number(n) || 0).toFixed(2).replace('.', ',');
const fmtDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function appointmentTotal(a) {
  return (a.items || []).reduce((sum, it) => sum + (it.qty || 0) * (it.price || 0), 0);
}
function clientFullName(c) {
  if (!c) return '?';
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || c.name || '?';
}
/**
 * Salonware zet soms alleen initialen in voornaam (S., N.). Die lezen natuurlijker als "S. Akacay Tura"
 * dan als "Akacay Tura, S." Bij echte voornamen blijft NL-lijst: "Akcay, Burcu".
 */
function isSalonwareInitialsVoornaam(firstName) {
  const s = String(firstName || '').trim();
  if (!s) return false;
  if (s.length > 14) return false;
  if (/^[A-Za-zÀ-ÖØ-öø-ÿ]\.(\s+[A-Za-zÀ-ÖØ-öø-ÿ]\.)+$/.test(s)) return true;
  if (/^[A-Za-zÀ-ÖØ-öø-ÿ]\.$/.test(s)) return true;
  return false;
}
/** Weergave in klantenlijst / tabel */
function formatKlantNameList(c) {
  const ln = String(c.lastName || '').trim();
  const fn = String(c.firstName || '').trim();
  if (!ln && !fn) return '?';
  if (!ln) return fn;
  if (!fn) return ln;
  if (isSalonwareInitialsVoornaam(fn)) return `${fn} ${ln}`.replace(/\s+/g, ' ').trim();
  return `${ln}, ${fn}`;
}

/** Sorteert gefilterde klanten volgens Instellingen → klantenSort */
function sortKlantenClients(arr) {
  const mode = (DB.settings && DB.settings.klantenSort) || 'lastName';
  const nl = (x, y) => String(x || '').localeCompare(String(y || ''), 'nl', { sensitivity: 'base' });
  return [...arr].sort((a, b) => {
    if (mode === 'firstName') {
      let c = nl(a.firstName, b.firstName);
      if (c !== 0) return c;
      return nl(a.lastName, b.lastName);
    }
    if (mode === 'importId') {
      const ia = parseInt(a.importSourceId, 10);
      const ib = parseInt(b.importSourceId, 10);
      const aOk = !Number.isNaN(ia);
      const bOk = !Number.isNaN(ib);
      if (aOk && bOk && ia !== ib) return ia - ib;
      if (aOk && !bOk) return -1;
      if (!aOk && bOk) return 1;
      return nl(a.lastName, b.lastName) || nl(a.firstName, b.firstName);
    }
    let cmp = nl(a.lastName, b.lastName);
    if (cmp !== 0) return cmp;
    return nl(a.firstName, b.firstName);
  });
}
function findClient(id) { return DB.clients.find(c => c.id === id); }
function findTreatment(id) { return DB.treatments.find(t => t.id === id); }
function findProduct(id) { return DB.products.find(p => p.id === id); }
function describeItem(it) {
  // Gebruik opgeslagen naam als fallback zodat verwijderde items nog zichtbaar zijn in historie
  if (it.kind === 'treatment') {
    if (it.preferSavedName && it.savedName) return it.savedName;
    return findTreatment(it.refId)?.name || it.savedName || '(behandeling)';
  }
  if (it.kind === 'product') {
    if (it.preferSavedName && it.savedName) return it.savedName;
    return findProduct(it.refId)?.name   || it.savedName || '(product)';
  }
  return it.savedName || '';
}
function appointmentSummary(a) {
  return (a.items || []).map(it => `${it.qty} × ${describeItem(it)}`).join(', ');
}
/** Totale minuten (alleen behandelingen) op de afspraak. */
function appointmentDurationMins(a) {
  return (a.items || []).reduce((s, it) => {
    if (it.kind === 'treatment') return s + (findTreatment(it.refId)?.duration || 0) * (it.qty || 1);
    return s;
  }, 0);
}
function timeToMinutes(t) {
  if (!t || typeof t !== 'string') return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
/** Rij-index in de grid voor starttijd (snapt naar 5 min — moet in `slots` zitten, anders dichtstbijzijnde). */
function slotIndexForTime(time, slots) {
  if (!slots.length) return 0;
  const i = slots.indexOf(time);
  if (i >= 0) return i;
  const tmin = timeToMinutes(time);
  if (tmin < timeToMinutes(slots[0])) return 0;
  const tLast = timeToMinutes(slots[slots.length - 1]);
  if (tmin > tLast) return slots.length - 1;
  for (let j = 0; j < slots.length; j++) {
    if (timeToMinutes(slots[j]) >= tmin) return j;
  }
  return slots.length - 1;
}
function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add('hidden'), 2400);
}

/* ---------- Weekschema ---------- */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
function isWorkWeek(dateISO) {
  if (!DB.settings.weekSchemaEnabled) return true;
  const date = parseLocalYMD(dateISO);
  const weekNr = getWeekNumber(date);
  const workOdd = DB.settings.weekSchemaWorkOdd !== false;
  return workOdd ? (weekNr % 2 === 1) : (weekNr % 2 === 0);
}

/** Wite slot in de agenda: werkweek-dag én binnen openingstijden (overige tijden = grijs). */
function isAgendaSlotWorkTime(dateISO, slot) {
  if (!isWorkWeek(dateISO)) return false;
  const t = timeToMinutes(slot);
  const o = timeToMinutes(DB.settings.openTime || '08:30');
  const c = timeToMinutes(DB.settings.closeTime || '18:00');
  return t >= o && t <= c;
}

/* ---------- Routing - GEHEEL HERSCHREVEN met INLINE STYLES ---------- */
const VIEW_IDS = ['home','agenda','klanten','beheer','rapportage','instellingen','afspraak-detail','afrekenen','klantdossier','klant-afspraken','intake-form','factuur'];
const BEHEER_PANELS = ['diensten','producten','openingstijden'];
const RAPPORTAGE_PANELS = ['dagrapport','bestedingen','omzetcategorie','omzetdienst'];

/** Mobiel: volledig menu sluiten na navigatie of bij resize naar desktop. */
function closeMobileNav() {
  const app = document.getElementById('appRoot') || document.querySelector('.app');
  if (app) app.classList.remove('menu-open');
  document.body.classList.remove('nav-menu-open');
  const ham = document.getElementById('hamburger');
  if (ham) ham.setAttribute('aria-expanded', 'false');
}
function isMobileNavLayout() {
  return typeof window !== 'undefined' && window.innerWidth <= 900;
}

/** Sluit rechter klantpaneel (schuif); geen vaste witte kolom meer. */
function closeClientDetailDrawer(clearSelection = true) {
  const d = document.getElementById('clientDetailDrawer');
  if (d) {
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('client-drawer-open');
  if (clearSelection && selectedClientId) {
    selectedClientId = null;
    document.querySelectorAll('#clientsBody tr.selected').forEach(tr => tr.classList.remove('selected'));
  }
}

function openClientDetailDrawer() {
  const d = document.getElementById('clientDetailDrawer');
  if (d) {
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
  }
  document.body.classList.add('client-drawer-open');
}

function showView(name) {
  console.log('%c[showView] →', 'color:#b08966; font-weight:bold;', name);
  closeMobileNav();
  if (name !== 'klanten') {
    try { closeClientDetailDrawer(); } catch (e) { /* */ }
  }

  // 1) Verberg ALLE views met inline display
  document.querySelectorAll('.view').forEach(v => {
    v.style.display = (v.dataset.view === name) ? 'block' : 'none';
    v.classList.toggle('hidden', v.dataset.view !== name);
  });

  // 2) Update sidebar active class (alleen primaire items, geen children)
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.classList.contains('nav-child')) return;
    n.classList.toggle('active', n.dataset.view === name);
  });

  // 3) Render functies
  try {
    if (name === 'home')         renderHome();
    if (name === 'agenda')       renderAgenda();
    if (name === 'klanten') {
      renderClients();
      updateSalonwareBundledChrome();
      const ks = $('#klantenSort');
      if (ks) ks.value = (DB.settings && DB.settings.klantenSort) || 'lastName';
    }
    if (name === 'instellingen') renderSettings();
    if (name === 'beheer') {
      const par = document.getElementById('beheerParent'); if (par) par.classList.add('open');
      const sub = document.getElementById('beheerSub');    if (sub) sub.classList.add('open');
      renderBeheer();
      switchBeheerTab('diensten');
    }
    if (name === 'rapportage') {
      const par = document.getElementById('rapportageParent'); if (par) par.classList.add('open');
      const sub = document.getElementById('rapportageSub');    if (sub) sub.classList.add('open');
      switchRapportageTab('dagrapport');
    }
  } catch (e) { console.error('[showView] render error in', name, e); }
}

function switchBeheerTab(tab) {
  console.log('%c[switchBeheerTab] →', 'color:#5fa463; font-weight:bold;', tab);

  // 1) Toon ALLEEN het juiste panel via inline display
  BEHEER_PANELS.forEach(p => {
    const el = document.getElementById('panel-' + p);
    if (!el) { console.warn('paneel niet gevonden: panel-' + p); return; }
    el.style.display = (p === tab) ? 'block' : 'none';
    el.classList.toggle('hidden', p !== tab);
  });

  // 2) Update tab-knoppen bovenin
  document.querySelectorAll('[data-view="beheer"] .beheer-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // 3) Update sidebar sub-items
  document.querySelectorAll('.nav-child[data-view="beheer"]').forEach(n => {
    n.classList.toggle('active', n.dataset.tab === tab);
  });

  // 4) Render specifieke content
  if (tab === 'openingstijden') {
    try { renderOpeningstijden(); } catch(e) { console.error(e); }
  }
}

function switchRapportageTab(tab) {
  console.log('%c[switchRapportageTab] →', 'color:#5fa463; font-weight:bold;', tab);

  RAPPORTAGE_PANELS.forEach(p => {
    const el = document.getElementById('rpanel-' + p);
    if (!el) { console.warn('paneel niet gevonden: rpanel-' + p); return; }
    el.style.display = (p === tab) ? 'block' : 'none';
    el.classList.toggle('hidden', p !== tab);
  });

  document.querySelectorAll('[data-view="rapportage"] .beheer-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  document.querySelectorAll('.nav-child[data-view="rapportage"]').forEach(n => {
    n.classList.toggle('active', n.dataset.tab === tab);
  });

  try {
    if (tab === 'dagrapport')     renderDagrapport();
    if (tab === 'bestedingen')    renderBestedingen();
    if (tab === 'omzetcategorie') renderOmzetCategorie();
    if (tab === 'omzetdienst')    renderOmzetDienst();
  } catch (e) { console.error(e); }
}

/* =========================================================
   HOME
   ========================================================= */
function renderHome() {
  const today = todayISO();
  const todayApps = DB.appointments
    .filter(a => a.date === today && a.status !== 'geannuleerd' && a.status !== 'verwijderd')
    .sort((a,b) => a.time.localeCompare(b.time));

  const tbodyToday = $('#todayReservations');
  tbodyToday.innerHTML = todayApps.length
    ? todayApps.map(a => {
        const c = findClient(a.clientId);
        return `<tr>
          <td>${fmtDate(a.date)} ${escapeHtml(a.time)}</td>
          <td><span class="name-link" data-client="${c?.id||''}">${escapeHtml(clientFullName(c))}</span></td>
          <td>${escapeHtml(appointmentSummary(a))}</td>
          <td class="amount">${fmtMoney(appointmentTotal(a))}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="4" class="empty">Nog geen reserveringen vandaag.</td></tr>`;

  // Open = afgerekend maar niet betaald (Tikkie verzoek, Over te maken, of vergeten)
  const open = DB.appointments
    .filter(a => !a.paid && (a.items||[]).length > 0 && (a.betaalwijze || a.status === 'afgerond'))
    .sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time));

  const tbodyOpen = $('#openAmounts');
  tbodyOpen.innerHTML = open.length
    ? open.map(a => {
        const c = findClient(a.clientId);
        const betaalLbl = a.betaalwijze ? getBetaalwijzeLabel(a.betaalwijze) : 'open';
        return `<tr>
          <td>${fmtDate(a.date)} ${escapeHtml(a.time)}</td>
          <td><span class="name-link" data-client="${c?.id||''}">${escapeHtml(clientFullName(c))}</span></td>
          <td class="amount">${fmtMoney(appointmentTotal(a))} <span style="font-size:11px; color:var(--muted);">(${escapeHtml(betaalLbl)})</span> ${a.notes ? `<br><span style="font-size:11px; color:var(--muted);">${escapeHtml(a.notes)}</span>` : ''}</td>
          <td><button class="row-btn complete" data-mark-paid="${a.id}" title="Markeren als betaald">✓</button></td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="4" class="empty">Geen openstaande bedragen.</td></tr>`;

  // Verjaardagen komende 7 dagen
  const todayD = new Date();
  const weekAhead = [];
  for (let i = 0; i < 7; i++) { const d = new Date(todayD); d.setDate(d.getDate()+i); weekAhead.push(`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`); }
  const bdays = DB.clients
    .filter(c => c.birthday)
    .filter(c => weekAhead.includes(c.birthday.slice(5)))
    .sort((a,b) => a.birthday.slice(5).localeCompare(b.birthday.slice(5)));

  $('#birthdays').innerHTML = bdays.length
    ? bdays.map(c => `<div class="birthday-row">
        <span class="name">${escapeHtml(clientFullName(c))}</span>
        <span class="date">${escapeHtml(c.birthday.slice(5).replace('-','-'))}</span>
      </div>`).join('')
    : `<p class="empty">Geen verjaardagen deze week.</p>`;

  // Bezetting
  const dayMinutes = (() => {
    const [oh, om] = (DB.settings.openTime || '08:30').split(':').map(Number);
    const [ch, cm] = (DB.settings.closeTime || '18:00').split(':').map(Number);
    return Math.max(0, (ch*60+cm) - (oh*60+om));
  })();
  const seats = Math.max(1, Number(DB.settings.seats) || 1);
  const totalMin = todayApps.reduce((sum, a) => {
    return sum + (a.items || []).reduce((s, it) => {
      if (it.kind !== 'treatment') return s;
      const t = findTreatment(it.refId);
      return s + (t?.duration || 0) * (it.qty || 1);
    }, 0);
  }, 0);
  const occ = dayMinutes ? (totalMin / (dayMinutes * seats)) * 100 : 0;
  $('#occupancyToday').textContent = occ.toFixed(2).replace('.', ',') + ' %';

  // Volgende afspraken
  const now = new Date();
  const nowHM = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const upcomingToday = todayApps.filter(a => a.time >= nowHM && a.status === 'gepland');
  $('#appointmentsToday').innerHTML = upcomingToday.length
    ? upcomingToday.map(a => `<div class="birthday-row"><span class="name">${escapeHtml(a.time)} – ${escapeHtml(clientFullName(findClient(a.clientId)))}</span><span class="date">${escapeHtml(appointmentSummary(a))}</span></div>`).join('')
    : `<p class="empty">Er zijn geen afspraken (meer) vandaag.</p>`;

  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); })();
  const tomApps = DB.appointments.filter(a => a.date === tomorrow && a.status !== 'geannuleerd' && a.status !== 'verwijderd').sort((a,b) => a.time.localeCompare(b.time));
  $('#appointmentsTomorrow').innerHTML = tomApps.length
    ? tomApps.map(a => `<div class="birthday-row"><span class="name">${escapeHtml(a.time)} – ${escapeHtml(clientFullName(findClient(a.clientId)))}</span><span class="date">${escapeHtml(appointmentSummary(a))}</span></div>`).join('')
    : `<p class="empty">Er zijn geen afspraken gepland morgen.</p>`;
}

/* =========================================================
   AGENDA – weekweergave
   ========================================================= */
let agendaCurrentDate = todayISO();
/** Rij-hoogte in de week-agenda (5 min); op smal scherm lager zodat de hele week horizontaal past. */
const AGENDA_SLOT_PX_DESKTOP = 26;
function getAgendaSlotPx() {
  if (typeof window === 'undefined') return AGENDA_SLOT_PX_DESKTOP;
  return window.innerWidth <= 900 ? 15 : AGENDA_SLOT_PX_DESKTOP;
}

/** Zes opeenvolgende dagen vanaf de gekozen dagmaand (eerste kolom = geselecteerde datum) */
function getWeekDates(anchorIso) {
  const start = parseLocalYMD(anchorIso);
  const days = [];
  for (let i = 0; i < 6; i++) {
    const dd = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push(toLocalISODate(dd));
  }
  return days;
}

const NL_DAYS_SHORT = ['ma','di','wo','do','vr','za','zo'];
const NL_DAYS = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const NL_MONTHS_SHORT = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];

function fmtDayHeader(iso) {
  const d = parseLocalYMD(iso);
  const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
  return `${NL_DAYS[dayIdx]} ${d.getDate()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function renderAgenda() {
  const weekDates = getWeekDates(agendaCurrentDate);
  $('#agendaDate').value = agendaCurrentDate;

  const weekNr = getWeekNumber(parseLocalYMD(agendaCurrentDate));
  const workWeek = isWorkWeek(agendaCurrentDate);
  const weekLabel = `Week ${weekNr} ${workWeek ? '(werkweek)' : '(vrij)'}`;
  $('#agendaWeekLabel').textContent = weekLabel;
  $('#agendaWeekLabel').style.color = workWeek ? 'var(--accent-dark)' : 'var(--red)';

  const todayStr = todayLocalISO();

  /* Vaste dag-grid 08:00–22:00 (5 min). Buiten openingstijden = grijs (class agenda-slot--closed). */
  const GRID_START_MIN = 8 * 60;
  const GRID_END_MIN   = 22 * 60;
  const slots = [];
  for (let t = GRID_START_MIN; t < GRID_END_MIN; t += 5) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  }

  // Kolomkoppen: alleen dagen
  const thead = $('#agendaThead');
  thead.innerHTML = weekDates.map(d => {
    const isToday = d === todayStr;
    const work = isWorkWeek(d);
    return `<div class="day-col${isToday ? ' today-col' : ''}${!work ? ' free-week-col' : ''}" data-date="${d}">
        ${fmtDayHeader(d)}
        ${!work ? '<div class="free-label">vrij</div>' : ''}
      </div>`;
  }).join('');

  // Verzamel afspraken per dag
  const appsByDay = {};
  weekDates.forEach(d => {
    appsByDay[d] = DB.appointments
      .filter(a => a.date === d && a.status !== 'geannuleerd' && a.status !== 'verwijderd')
      .sort((a,b) => a.time.localeCompare(b.time));
  });

  // Kolommen met vaste 5-min rijen; afspraken als overlay (kruist niet met andere dagen)
  const tbody = $('#agendaTbody');
  const cellTime = (slot) => `<span class="agenda-cell-time" aria-hidden="true">${slot}</span>`;
  const appBlock = (a, topPx, heightPx) => {
    const c = findClient(a.clientId);
    const durMins = appointmentDurationMins(a);
    return `<div class="app-block" data-app-id="${a.id}" data-date="${a.date}" data-time="${a.time}" style="top:${topPx}px;min-height:0;height:${heightPx}px">
          <div class="app-name">${escapeHtml(clientFullName(c))}</div>
          <div class="app-service">${escapeHtml(appointmentSummary(a))}</div>
          ${durMins ? `<div class="app-dur">${durMins} min</div>` : ''}
          <div class="app-actions">
            ${a.status==='gepland' ? `<button class="app-btn complete" data-complete="${a.id}" title="Afronden">✓</button>` : ''}
            ${a.status==='afgerond'&&!a.paid ? `<button class="app-btn paid" data-mark-paid="${a.id}" title="Betaald">€</button>` : ''}
            <button class="app-btn edit" data-edit="${a.id}" title="Bewerken">✎</button>
          </div>
        </div>`;
  };
  const spx = getAgendaSlotPx();
  const baseH = slots.length * spx;
  const cols = weekDates.map(d => {
    const work = isWorkWeek(d);
    const apps = appsByDay[d] || [];
    const slotEls = slots.map(slot => {
      const workSlot = isAgendaSlotWorkTime(d, slot);
      const cls = workSlot ? 'agenda-slot' : 'agenda-slot agenda-slot--closed';
      return `<div class="${cls}" data-date="${d}" data-slot="${slot}">${cellTime(slot)}</div>`;
    }).join('');
    const blocks = apps.map((a) => {
      const idx = slotIndexForTime(a.time, slots);
      const span = Math.max(1, Math.ceil((appointmentDurationMins(a) || 5) / 5));
      const h = span * spx;
      const top = idx * spx;
      return appBlock(a, top, h);
    }).join('');
    let maxH = baseH;
    apps.forEach((a) => {
      const idx = slotIndexForTime(a.time, slots);
      const span = Math.max(1, Math.ceil((appointmentDurationMins(a) || 5) / 5));
      maxH = Math.max(maxH, (idx + span) * spx);
    });
    return `<div class="agenda-day-col${!work ? ' free-day-col' : ''}" data-date="${d}" style="min-height:${maxH}px"><div class="agenda-day-slots">${slotEls}</div><div class="agenda-day-apps">${blocks}</div></div>`;
  }).join('');
  tbody.innerHTML = '<div class="agenda-cols" role="presentation">' + cols + '</div>';

  const weekTotal = weekDates.reduce((n, d) => n + (appsByDay[d]?.length || 0), 0);
  const allTotal = (DB.appointments || []).filter(a => a.status !== 'geannuleerd' && a.status !== 'verwijderd').length;
  let hint = document.getElementById('agendaEmptyHint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'agendaEmptyHint';
    hint.className = 'agenda-empty-hint';
    tbody.parentElement?.insertBefore(hint, tbody);
  }
  if (weekTotal === 0 && allTotal > 0) {
    hint.innerHTML = `<p>Geen afspraken in deze week. Er staan <strong>${allTotal}</strong> afspraken in totaal (meestal historie). Gebruik <strong>◀ Vorige week</strong> of klik op een leeg tijdvak om een <strong>nieuwe afspraak</strong> te maken.</p>`;
    hint.style.display = 'block';
  } else if (allTotal === 0) {
    hint.innerHTML = `<p>Agenda is leeg. Wacht tot klanten geladen zijn, of maak een nieuwe afspraak via <strong>+ Afspraak</strong> of klik in het rooster. Data wordt opgeslagen in deze browser.</p>`;
    hint.style.display = 'block';
  } else {
    hint.style.display = 'none';
  }
}

function openAppointmentModal(existing) {
  const isNew = !existing || !existing.id;
  const a = existing
    ? JSON.parse(JSON.stringify(existing))
    : { id: '', date: agendaCurrentDate, time: '10:00', clientId: '', items: [], status: 'gepland', paid: false, notes: '' };

  // Werk-state
  const working = a;
  let sendConfirm = false;

  function render() {
    const c = findClient(working.clientId);
    const total = appointmentTotal(working);
    const dateStr = `${weekdayName(working.date)} ${fmtDate(working.date)} ${working.time}`;

    // Genereer behandelingenrijen met Van/Tot/Duur
    let cursor = working.time;
    const rows = (working.items||[]).map((it, idx) => {
      const dur = it.kind==='treatment' ? (findTreatment(it.refId)?.duration||0)*(it.qty||1) : 0;
      const start = cursor;
      if (dur) {
        const [h,m] = cursor.split(':').map(Number);
        const t = h*60+m+dur;
        cursor = `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
      }
      return { it, idx, start, end: dur?cursor:'', dur };
    });

    $('#modalTitle').textContent = dateStr;
    $('#modalBox').classList.add('large');

    $('#modalBody').innerHTML = `
      <div class="newappt-tabs">
        <button class="newappt-tab active" data-na-tab="afspraak">Afspraak</button>
        <button class="newappt-tab" data-na-tab="afwezig" disabled style="opacity:.5; cursor:not-allowed;">Afwezigheid</button>
        <button class="newappt-tab" data-na-tab="taak"     disabled style="opacity:.5; cursor:not-allowed;">Taak</button>
      </div>

      <div class="newappt-grid">
        <!-- LEFT: Klant -->
        <div class="newappt-col">
          <h4>Klant</h4>
          ${!c ? `
            <div class="newappt-field">
              <label>Selecteer een klant</label>
              <input type="text" id="naKlantSearch" placeholder="Typ naam, email of telefoon..." />
            </div>
            <div class="newappt-row" style="margin-top:8px; gap:6px;">
              <button type="button" class="btn primary small" id="naNewClient">+ Nieuwe klant maken</button>
            </div>
          ` : `
            <div class="newappt-field"><label>Geslacht</label>
              <select id="naGender">
                <option value="" ${!c.gender?'selected':''}>—</option>
                <option value="V" ${c.gender==='V'?'selected':''}>Mevrouw</option>
                <option value="M" ${c.gender==='M'?'selected':''}>Meneer</option>
              </select>
            </div>
            <div class="newappt-field"><label>Naam</label>
              <div class="newappt-row">
                <input type="text" id="naFirstName" value="${escapeHtml(c.firstName||'')}" placeholder="Voornaam" />
                <input type="text" id="naLastName"  value="${escapeHtml(c.lastName||'')}"  placeholder="Achternaam" />
              </div>
            </div>
            <div class="newappt-field"><label>Telefoon</label><input type="text" id="naPhone"  value="${escapeHtml(c.phone||'')}"  /></div>
            <div class="newappt-field"><label>Mobiel</label>  <input type="text" id="naMobile" value="${escapeHtml(c.mobile||'')}" /></div>
            <div class="newappt-field"><label>Email</label>   <input type="email" id="naEmail" value="${escapeHtml(c.email||'')}"  /></div>
            <div style="margin-top:6px;"><button type="button" class="btn ghost small" id="naClearClient">Andere klant kiezen</button></div>
          `}

          <hr class="newappt-hr" />

          <div class="newappt-field"><label>Status</label>
            <select id="naStatus">
              <option value="gepland"     ${working.status==='gepland'?'selected':''}>Eigen reservering</option>
              <option value="afgerond"    ${working.status==='afgerond'?'selected':''}>Afgerond</option>
              <option value="geannuleerd" ${working.status==='geannuleerd'?'selected':''}>Geannuleerd</option>
            </select>
          </div>
          <div class="newappt-field newappt-field-block"><label>Opmerkingen</label>
            <textarea id="naNotes" rows="3" placeholder="Bijv. tikkie verzoek...">${escapeHtml(working.notes||'')}</textarea>
          </div>

          <div class="newappt-field newappt-field-block">
            <label>Datum / tijd</label>
            <div class="newappt-row">
              <input type="date" id="naDate" value="${working.date}" />
              <input type="time" id="naTime" value="${working.time}" step="300" />
            </div>
          </div>
        </div>

        <!-- RIGHT: Behandelingen -->
        <div class="newappt-col">
          <h4>Behandelingen</h4>
          <div class="newappt-field">
            <label>Toevoegen</label>
            <input type="text" id="naItemSearch" placeholder="Behandeling of product..." />
          </div>

          <div class="newappt-table-wrap">
            <table class="treatments-table newappt-items-table" style="margin-top:14px;">
              <thead><tr><th>Van</th><th>Tot</th><th>Behandeling</th><th>Duur</th><th>Prijs</th><th></th></tr></thead>
              <tbody id="naItemsBody">
                ${rows.length ? rows.map(r => `<tr>
                  <td>${escapeHtml(r.start)}</td>
                  <td>${escapeHtml(r.end)}</td>
                  <td>${escapeHtml(describeItem(r.it))}</td>
                  <td><input type="number" min="0" value="${r.dur||0}" data-na-dur="${r.idx}" style="width:50px; padding:3px 6px; border:1px solid var(--border); border-radius:4px;" /></td>
                  <td><input type="number" min="0" step="0.01" value="${(r.it.price||0).toFixed(2)}" data-na-price="${r.idx}" style="width:70px; padding:3px 6px; border:1px solid var(--border); border-radius:4px;" /></td>
                  <td><button type="button" class="row-btn delete" data-na-remove="${r.idx}">🗑</button></td>
                </tr>`).join('') : `<tr><td colspan="6" class="empty">Nog geen behandelingen.</td></tr>`}
              </tbody>
              <tfoot><tr><td colspan="4" style="text-align:right; font-weight:600;">Totaal:</td><td class="amount" style="font-weight:600;">${fmtMoney(total)}</td><td></td></tr></tfoot>
            </table>
          </div>

          ${working.items.length===0 ? `<div class="newappt-warn">⚠ Voeg een behandeling toe om op te kunnen slaan</div>` : ''}
        </div>
      </div>

      <hr class="newappt-hr" />
      <label class="confirm-mail" style="padding:0 18px;">
        <input type="checkbox" id="naSendConfirm" ${sendConfirm?'checked':''} ${!c?.email?'disabled':''} />
        Automatische bevestigingsmail sturen ${!c?.email ? '<span style="color:var(--muted); font-size:12px;">(geen e-mail bekend)</span>':''}
      </label>

      <div class="newappt-actions">
        ${existing && existing.id ? `<button type="button" class="btn danger" id="naDelete">Verwijderen</button>` : ''}
        <button type="button" class="btn ghost"   id="naCancel">Annuleren</button>
        <button type="button" class="btn primary" id="naSave" ${working.items.length===0||!c?'disabled':''}>Opslaan en naar Agenda</button>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Klant zoeken (autocomplete)
    if ($('#naKlantSearch')) {
      attachAutocomplete($('#naKlantSearch'),
        q => searchClients(q),
        item => { working.clientId = item.id; render(); },
        { showAllOnFocus: false }
      );
    }
    if ($('#naNewClient')) {
      $('#naNewClient').addEventListener('click', () => {
        const newClient = { id: uid('c'), gender:'V', firstName:'', lastName:'', email:'', phone:'', mobile:'', address:'', city:'', notes:'', isNew:true };
        DB.clients.push(newClient);
        saveData(DB);
        working.clientId = newClient.id;
        render();
      });
    }
    if ($('#naClearClient')) {
      $('#naClearClient').addEventListener('click', () => { working.clientId = ''; render(); });
    }

    // Behandeling/product zoeken (autocomplete)
    if ($('#naItemSearch')) {
      attachAutocomplete($('#naItemSearch'),
        q => searchTreatmentsAndProducts(q),
        item => {
          const ref = item.kind==='treatment' ? findTreatment(item.id) : findProduct(item.id);
          if (!ref) return;
          working.items.push({ kind: item.kind, refId: ref.id, savedName: ref.name, qty: 1, price: ref.price });
          render();
        }
      );
    }

    // Items velden bewerken
    $$('[data-na-remove]').forEach(b => b.addEventListener('click', () => { working.items.splice(Number(b.dataset.naRemove),1); render(); }));
    $$('[data-na-price]').forEach(inp => inp.addEventListener('change', () => { working.items[Number(inp.dataset.naPrice)].price = Number(inp.value)||0; render(); }));
    $$('[data-na-dur]').forEach(inp => inp.addEventListener('change', () => {
      const idx = Number(inp.dataset.naDur);
      const it = working.items[idx];
      if (it.kind==='treatment') {
        const ref = findTreatment(it.refId);
        if (ref) ref.duration = Number(inp.value)||0;  // tijdelijk override; zou eigenlijk per-item duur moeten zijn
      }
      render();
    }));

    // Datum/tijd
    $('#naDate')?.addEventListener('change', e => { working.date = e.target.value; render(); });
    $('#naTime')?.addEventListener('change', e => { working.time = e.target.value; render(); });

    // Klantvelden bewerken (live in DB)
    const c = findClient(working.clientId);
    if (c) {
      $('#naGender')?.addEventListener('change', e => { c.gender = e.target.value; saveData(DB); });
      $('#naFirstName')?.addEventListener('change', e => { c.firstName = e.target.value; saveData(DB); });
      $('#naLastName')?.addEventListener('change',  e => { c.lastName  = e.target.value; saveData(DB); });
      $('#naPhone')?.addEventListener('change',     e => { c.phone     = e.target.value; saveData(DB); });
      $('#naMobile')?.addEventListener('change',    e => { c.mobile    = e.target.value; saveData(DB); });
      $('#naEmail')?.addEventListener('change',     e => { c.email     = e.target.value; saveData(DB); render(); });
    }

    // Status / opmerkingen
    $('#naStatus')?.addEventListener('change', e => { working.status = e.target.value; });
    $('#naNotes')?.addEventListener('input',   e => { working.notes  = e.target.value; });

    // Bevestigingsmail
    $('#naSendConfirm')?.addEventListener('change', e => { sendConfirm = e.target.checked; });

    // Knoppen
    $('#naCancel').addEventListener('click', closeModal);
    if ($('#naDelete')) {
      $('#naDelete').addEventListener('click', () => {
        if (!confirm('Afspraak verwijderen?')) return;
        DB.appointments = DB.appointments.filter(x => x.id !== existing.id);
        saveData(DB); closeModal(); renderAgenda(); showToast('Afspraak verwijderd');
      });
    }
    $('#naSave').addEventListener('click', () => saveAppointment());
  }

  function saveAppointment() {
    const c = findClient(working.clientId);
    if (!c) return showToast('Selecteer eerst een klant');
    if (!working.items.length) return showToast('Voeg minimaal één behandeling toe');

    if (isNew) {
      working.id = uid('a');
      DB.appointments.push(working);
    } else {
      const idx = DB.appointments.findIndex(x => x.id === existing.id);
      if (idx>=0) DB.appointments[idx] = working;
    }
    saveData(DB);
    agendaCurrentDate = working.date;
    closeModal();
    renderAgenda();
    showToast(isNew ? 'Afspraak ingepland ✓' : 'Afspraak bijgewerkt ✓');

    // Bevestigingsmail
    if (sendConfirm && c.email) {
      const subject = buildConfirmationSubject(c, working);
      const body    = buildConfirmationBody(c, working);
      logSentMessage(c.id, 'bevestiging', subject);
      openMailto(c.email, subject, body);
    }

    // Nieuwe klant → ook intake formulier voorstellen
    if (c.isNew && c.email) {
      delete c.isNew;
      saveData(DB);
      setTimeout(() => {
        if (confirm('Nieuwe klant. Ook het intake-formulier mailen?')) {
          sendIntakeFormToClient(c);
        }
      }, 400);
    }
  }

  openModal('Nieuwe afspraak', '');
  render();
}

function itemRowHtml(it, idx) {
  let options = '';
  if (it.kind === 'treatment') {
    // Groepeer per categorie
    const cats = DB.treatmentCategories;
    cats.forEach(cat => {
      const items = DB.treatments.filter(t => t.category === cat);
      if (!items.length) return;
      options += `<optgroup label="${escapeHtml(cat)}">`;
      items.forEach(t => {
        options += `<option value="${t.id}" ${t.id===it.refId?'selected':''}>${escapeHtml(t.name)} (${fmtMoney(t.price)})</option>`;
      });
      options += `</optgroup>`;
    });
  } else {
    const pcats = DB.productCategories || [];
    pcats.forEach(cat => {
      const items = DB.products.filter(p => p.category === cat);
      if (!items.length) return;
      options += `<optgroup label="${escapeHtml(cat)}">`;
      items.forEach(p => {
        options += `<option value="${p.id}" ${p.id===it.refId?'selected':''}>${escapeHtml(p.name)} (${fmtMoney(p.price)})</option>`;
      });
      options += `</optgroup>`;
    });
    const uncatProds = DB.products.filter(p => !p.category || !pcats.includes(p.category));
    if (uncatProds.length) {
      options += uncatProds.map(p => `<option value="${p.id}" ${p.id===it.refId?'selected':''}>${escapeHtml(p.name)} (${fmtMoney(p.price)})</option>`).join('');
    }
  }
  return `<div class="item-row" data-item-idx="${idx}" style="display:grid; grid-template-columns:95px 1fr 60px 90px 32px; gap:6px; align-items:center; margin-bottom:6px;">
    <span class="pill ${it.kind==='treatment'?'gepland':'afgerond'}">${it.kind==='treatment'?'Behandeling':'Product'}</span>
    <select name="refId">${options}</select>
    <input type="number" name="qty" min="1" value="${it.qty}" />
    <input type="number" name="price" step="0.01" value="${it.price.toFixed(2)}" />
    <button type="button" class="row-btn delete" data-remove-item title="Verwijderen">✕</button>
  </div>`;
}

function completeAppointment(id) {
  const a = DB.appointments.find(x => x.id === id);
  if (!a) return;
  if (!a.items.length) { showToast('Voeg eerst onderdelen toe aan de afspraak'); return openAppointmentModal(a); }
  a.status = 'afgerond';
  (a.items || []).forEach(it => {
    if (it.kind === 'product') {
      const p = findProduct(it.refId);
      if (p) p.stock = Math.max(0, (p.stock || 0) - (it.qty || 0));
    }
  });
  saveData(DB); renderAgenda(); showToast('Behandeling afgerond en geboekt ✓');
}
function markPaid(id) {
  const a = DB.appointments.find(x => x.id === id);
  if (!a) return;
  a.paid = true;
  saveData(DB); renderAgenda(); renderHome(); showToast('Gemarkeerd als betaald ✓');
}

/* =========================================================
   KLANTEN
   ========================================================= */
let selectedClientId = null;

/** Paginering klantenlijst (grote imports) */
let klantenListPage = 1;
const KLANTEN_PER_PAGE = 50;

function formatClientPhonesForList(c) {
  const p = (c.phone || '').trim();
  const m = (c.mobile || '').trim();
  if (p && m) return `${p}  ${m}`;
  if (p || m) return p || m;
  return '—';
}

function buildKlantenPaginationHtml(total, page, perPage) {
  if (total === 0) return '';
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const info = `<span class="clients-pagination-info"><strong>${from}–${to}</strong> van ${total} klant${total !== 1 ? 'en' : ''}</span>`;
  if (totalPages <= 1) {
    return `<div class="clients-pagination-inner">${info}</div>`;
  }
  const parts = ['<div class="clients-pagination-inner">', info, '<div class="clients-pagination-buttons">'];
  parts.push(`<button type="button" class="btn ghost small" data-klanten-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Vorige</button>`);
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);
  if (start > 1) {
    parts.push(`<button type="button" class="btn ghost small clients-page-btn" data-klanten-page="1">1</button>`);
    if (start > 2) parts.push('<span class="clients-page-ellipsis">…</span>');
  }
  for (let p = start; p <= end; p++) {
    parts.push(`<button type="button" class="btn ghost small clients-page-btn ${p === page ? 'is-current' : ''}" data-klanten-page="${p}">${p}</button>`);
  }
  if (end < totalPages) {
    if (end < totalPages - 1) parts.push('<span class="clients-page-ellipsis">…</span>');
    parts.push(`<button type="button" class="btn ghost small clients-page-btn" data-klanten-page="${totalPages}">${totalPages}</button>`);
  }
  parts.push(`<button type="button" class="btn ghost small" data-klanten-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>Volgende</button>`);
  parts.push('</div></div>');
  return parts.join('');
}

/** Wist klanten, afspraken, cadeaubonnen, pakketten, auto-afboeken-log en zet productvoorraad terug naar standaard. Behaard: instellingen, diensten, producten (prijzen), templates. */
function clearAllTransactionalData() {
  const def = defaultData();
  DB.clients = [];
  DB.appointments = [];
  DB.cadeaubonnen = [];
  DB.packages = [];
  DB.autoFinalizeLog = {};
  delete DB.burcuAkcayHistoryV;
  const defById = Object.fromEntries(def.products.map(p => [p.id, p]));
  (DB.products || []).forEach(p => {
    const d0 = defById[p.id];
    if (d0) p.stock = d0.stock;
  });
  selectedClientId = null;
  saveData(DB);
  applyBurcuAkcayOverride();
}

function renderClients(filter = '') {
  const q = filter.trim().toLowerCase();
  const list = sortKlantenClients(
    DB.clients.filter(c => {
      const name = clientFullName(c).toLowerCase();
      return !q || name.includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.mobile || '').includes(q) || (c.city || '').toLowerCase().includes(q);
    })
  );

  const total = list.length;
  const totalPages = total === 0 ? 0 : Math.max(1, Math.ceil(total / KLANTEN_PER_PAGE));
  if (totalPages > 0 && klantenListPage > totalPages) klantenListPage = totalPages;
  if (klantenListPage < 1) klantenListPage = 1;

  const start = (klantenListPage - 1) * KLANTEN_PER_PAGE;
  const pageList = list.slice(start, start + KLANTEN_PER_PAGE);

  const tbody = $('#clientsBody');
  tbody.innerHTML = pageList.length
    ? pageList.map(c => `<tr data-client="${c.id}" class="${c.id === selectedClientId ? 'selected' : ''}">
        <td class="col-mv">${escapeHtml((c.gender || '').trim() || '—')}</td>
        <td class="col-naam">${escapeHtml(formatKlantNameList(c))}</td>
        <td class="col-adres">${escapeHtml(c.address || '')}</td>
        <td class="col-plaats">${escapeHtml((c.city || '').trim() ? (c.city || '').trim().toUpperCase() : '')}</td>
        <td class="col-tel">${escapeHtml(formatClientPhonesForList(c))}</td>
        <td class="col-mail">${escapeHtml(c.email || '')}</td>
        <td class="col-act"><span class="klanten-row-go" aria-hidden="true">›</span></td>
      </tr>`).join('')
    : `<tr><td colspan="7" class="empty">Geen klanten gevonden.</td></tr>`;

  const pagEl = $('#clientsPagination');
  if (pagEl) {
    if (total === 0) {
      pagEl.hidden = true;
      pagEl.innerHTML = '';
    } else {
      pagEl.hidden = false;
      pagEl.innerHTML = buildKlantenPaginationHtml(total, klantenListPage, KLANTEN_PER_PAGE);
    }
  }

}

function renderClientDetail(id) {
  selectedClientId = id;
  $$('#clientsBody tr').forEach(tr => tr.classList.toggle('selected', tr.dataset.client === id));
  const c = findClient(id);
  if (!c) {
    closeClientDetailDrawer();
    return;
  }

  const history = DB.appointments
    .filter(a => a.clientId === id && a.status === 'afgerond')
    .sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time));

  const total = history.reduce((s, a) => s + appointmentTotal(a), 0);
  const open  = history.filter(a => !a.paid).reduce((s, a) => s + appointmentTotal(a), 0);

  $('#clientDetailTitle').textContent = clientFullName(c);
  $('#clientDetail').innerHTML = `
    <div class="client-meta">
      <div><span>Telefoon</span>${escapeHtml(c.phone||'-')}</div>
      <div><span>Mobiel</span>${escapeHtml(c.mobile||'-')}</div>
      <div><span>E-mail</span>${escapeHtml(c.email||'-')}</div>
      <div><span>Verjaardag</span>${escapeHtml(c.birthday ? fmtDate(c.birthday) : '-')}</div>
      <div><span>Adres</span>${escapeHtml([c.address, c.city].filter(Boolean).join(', ')||'-')}</div>
      <div><span>Bezoeken</span>${history.length}</div>
    </div>
    ${c.notes ? `<p style="font-size:13px; color:var(--muted)"><em>${escapeHtml(c.notes)}</em></p>` : ''}

    <div style="display:flex; gap:8px; margin: 8px 0 14px; flex-wrap:wrap;">
      <button class="btn primary small" id="openDossier">📋 Klantdossier</button>
      <button class="btn ghost small" id="openKaPage">Afspraken & Producten</button>
      <button class="btn ghost small" id="editClient">Snel bewerken</button>
      <button class="btn ghost small" id="newAppForClient">Afspraak inplannen</button>
      <button class="btn danger small" id="deleteClient">Verwijderen</button>
    </div>

    <strong>Historie (${history.length} bezoeken)</strong>
    ${history.length ? `<table class="history-table">
      <thead><tr><th>Datum</th><th>Onderdelen</th><th>Bedrag</th><th>Betaald</th></tr></thead>
      <tbody>
        ${history.map(a => `<tr>
          <td>${fmtDate(a.date)} ${escapeHtml(a.time)}</td>
          <td>${escapeHtml(appointmentSummary(a))}</td>
          <td class="amount">${fmtMoney(appointmentTotal(a))}</td>
          <td>${a.paid ? '<span style="color:var(--green)">✓ betaald</span>' : '<span class="pill openstaand">open</span>'}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<p class="empty">Nog geen historie.</p>'}

    <div class="history-totals">
      <span>Totaal omzet: <strong>${fmtMoney(total)}</strong></span>
      <span>Openstaand: <strong>${fmtMoney(open)}</strong></span>
    </div>
  `;

  openClientDetailDrawer();

  $('#openDossier')?.addEventListener('click', () => openKlantdossier(c.id));
  $('#openKaPage')?.addEventListener('click',  () => openKlantAfspraken(c.id));
  $('#editClient')?.addEventListener('click', () => openClientModal(c));
  $('#deleteClient')?.addEventListener('click', () => {
    if (!confirm(`Klant "${clientFullName(c)}" verwijderen?`)) return;
    DB.clients = DB.clients.filter(x => x.id !== id);
    saveData(DB); selectedClientId = null;
    closeClientDetailDrawer(false);
    $('#clientDetail').innerHTML = '<p class="empty">Selecteer een klant in de lijst.</p>';
    $('#clientDetailTitle').textContent = 'Klantdetail';
    renderClients($('#searchClient').value);
    showToast('Klant verwijderd');
  });
  $('#newAppForClient')?.addEventListener('click', () => {
    showView('agenda');
    openAppointmentModal({ id:'', date: agendaCurrentDate, time:'10:00', clientId: id, items:[], status:'gepland', paid:false, notes:'' });
  });
}

function openClientModal(existing) {
  const c = existing || { id:'', gender:'V', initials:'', firstName:'', lastName:'', address:'', city:'', phone:'', mobile:'', email:'', birthday:'', notes:'', notesInternal:'', mustPayFirst:'standaard' };
  openModal(existing ? 'Klant bewerken' : 'Nieuwe klant', `
    <form id="clientForm" class="form">
      <label>Geslacht
        <select name="gender">
          <option value="V" ${c.gender==='V'?'selected':''}>Mevrouw (V)</option>
          <option value="M" ${c.gender==='M'?'selected':''}>De heer (M)</option>
          <option value="" ${!c.gender?'selected':''}>-</option>
        </select>
      </label>
      <label>Voorletters<input type="text" name="initials" value="${escapeHtml(c.initials||'')}"></label>
      <label>Voornaam<input type="text" name="firstName" required value="${escapeHtml(c.firstName||'')}"></label>
      <label>Achternaam<input type="text" name="lastName" required value="${escapeHtml(c.lastName||'')}"></label>
      <label>Telefoon<input type="text" name="phone" value="${escapeHtml(c.phone||'')}"></label>
      <label>Mobiel<input type="text" name="mobile" value="${escapeHtml(c.mobile||'')}"></label>
      <label>E-mail<input type="email" name="email" value="${escapeHtml(c.email||'')}"></label>
      <label>Geboortedatum<input type="date" name="birthday" value="${c.birthday||''}"></label>
      <label>Adres<input type="text" name="address" value="${escapeHtml(c.address||'')}"></label>
      <label>Plaats<input type="text" name="city" value="${escapeHtml(c.city||'')}"></label>
      <label style="grid-column:1/-1;">Opmerkingen<textarea name="notes" rows="2">${escapeHtml(c.notes||'')}</textarea></label>
      <label style="grid-column:1/-1;">Opmerkingen INTERN<textarea name="notesInternal" rows="2">${escapeHtml(c.notesInternal||'')}</textarea></label>
      <label>Verplicht vooraf betalen
        <select name="mustPayFirst">
          <option value="standaard" ${c.mustPayFirst==='standaard'?'selected':''}>Standaard instelling</option>
          <option value="ja" ${c.mustPayFirst==='ja'?'selected':''}>Ja</option>
          <option value="nee" ${c.mustPayFirst==='nee'?'selected':''}>Nee</option>
        </select>
      </label>
      <div style="grid-column:1/-1; display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
        <button type="button" class="btn ghost" id="cancelClient">Annuleren</button>
        <button type="submit" class="btn primary">${existing ? 'Opslaan' : 'Toevoegen'}</button>
      </div>
    </form>
  `);
  $('#cancelClient').addEventListener('click', closeModal);
  $('#clientForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    if (existing) {
      Object.assign(existing, data);
    } else {
      data.id = uid('c');
      DB.clients.push(data);
      selectedClientId = data.id;
    }
    saveData(DB); closeModal();
    renderClients($('#searchClient').value);
    showToast(existing ? 'Klant bijgewerkt' : 'Klant toegevoegd');
  });
}

/* ---- CSV ---- */
function clientsToCsv() {
  const headers = ['gender','initials','firstName','lastName','address','city','phone','mobile','email','birthday','notes'];
  const lines = [headers.join(',')];
  DB.clients.forEach(c => lines.push(headers.map(h => csvEscape(c[h] || '')).join(',')));
  return lines.join('\n');
}
function csvEscape(v) {
  v = String(v);
  if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}
/** CSV / export (komma of puntkomma, o.a. Salonware). */
function parseCsv(text, delimiter = ',') {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch==='"' && text[i+1]==='"') { field+='"'; i++; }
      else if (ch==='"') inQuotes=false;
      else if (ch==='\r' && text[i+1]==='\n') { field+='\n'; i++; }
      else if (ch==='\n' || ch==='\r') field+=ch;
      else field+=ch;
    } else {
      if (ch==='"') inQuotes=true;
      else if (ch === delimiter) { row.push(field); field=''; }
      else if (ch==='\n') { row.push(field); rows.push(row); row=[]; field=''; }
      else if (ch==='\r') {}
      else field+=ch;
    }
  }
  if (field.length||row.length) { row.push(field); rows.push(row); }
  return rows.filter(r=>r.some(c=>c!==''));
}
function detectCsvDelimiter(text) {
  const t = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  const firstLine = (t.split(/\r?\n/, 1)[0] || '');
  const semi = (firstLine.match(/;/g) || []).length;
  const comma = (firstLine.match(/,/g) || []).length;
  return semi > comma ? ';' : ',';
}
/** Maakt lange Salonware-notities (incl. RTF) leesbaar. Klein houden: localStorage ~5MB totaal. */
function sanitizeImportNotes(s, max = 1500) {
  if (!s) return '';
  let o = String(s).trim();
  if (o.includes('{\\rtf') || o.includes('rtf1')) {
    o = o.replace(/\\'[0-9a-f]{2}/gi, ' ')
      .replace(/\\par ?/gi, '\n')
      .replace(/[{}\\]+/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  }
  if (o.length > max) o = o.slice(0, max) + '…';
  return o.trim();
}
/** Alleen RTF ruis verwijderen voor datumparsing uit notities – niet verkorten. */
function stripRoughRtfForNotes(raw) {
  let o = String(raw || '');
  if (o.includes('{\\rtf') || /\brtf1\b/i.test(o)) {
    o = o.replace(/\\'[0-9a-f]{2}/gi, ' ')
      .replace(/\\par ?/gi, '\n')
      .replace(/[{}\\]+/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  }
  return o;
}
/** Nederlandse maand voor vrije datum "6 april 2010". */
const NL_NOTE_MONTH_FROM_WORD = /** @type {Record<string, number>} */ ({
  jan: 1, januari: 1, feb: 2, februari: 2, mrt: 3, maart: 3,
  apr: 4, april: 4, mei: 5, jun: 6, juni: 6,
  jul: 7, juli: 7, aug: 8, augustus: 8,
  sep: 9, sept: 9, september: 9,
  okt: 10, oct: 10, oktober: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
});
/** Datum uit notities als jjjj-mm-dd (Europees d-m-(jj)jj). */
function isoFromLooseDdMmY(ddStr, mmStr, yyRaw) {
  const d = parseInt(ddStr, 10);
  const mo = parseInt(mmStr, 10);
  let y = parseInt(yyRaw, 10);
  if (Number.isNaN(d) || Number.isNaN(mo) || Number.isNaN(y)) return '';
  if (String(yyRaw).trim().length === 2) y = y <= 49 ? 2000 + y : 1900 + y;
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return '';
  return normalizeDate(`${d}-${mo}-${y}`);
}
/**
 * Unieke datums uit vrije opmerkingen (geschiedenis), o.a. 10-2-15 / 06-04-2010 / “3 mei 2010”.
 */
function extractVisitDatesIsoFromNlNotes(notesRaw) {
  const plain = stripRoughRtfForNotes(notesRaw);
  const today = todayLocalISO();
  const maxIso = `${Number(today.slice(0, 4)) + 2}-12-31`;
  const minIso = '1995-01-01';
  const found = new Set();

  const reDMY = /\b(\d{1,2})\s*[-/](\d{1,2})\s*[-/](\d{2}|\d{4})\b/g;
  let m;
  while ((m = reDMY.exec(plain)) !== null) {
    const iso = isoFromLooseDdMmY(m[1], m[2], m[3]);
    if (iso && iso >= minIso && iso <= maxIso) found.add(iso);
  }

  const reWd = /\b(\d{1,2})\s+([a-zéèïëô]+)\.?\s+(\d{4})\b/gi;
  while ((m = reWd.exec(plain)) !== null) {
    const day = parseInt(m[1], 10);
    const monWord = String(m[2]).toLowerCase().replace(/\.$/, '');
    const yy = parseInt(m[3], 10);
    const mon = NL_NOTE_MONTH_FROM_WORD[monWord];
    if (!mon || !yy || day < 1 || day > 31) continue;
    const iso = normalizeDate(`${day}-${mon}-${yy}`);
    if (iso && iso >= minIso && iso <= maxIso) found.add(iso);
  }

  return [...found].sort();
}
/** Salonware datumkolom: jjjj-mm-dd of met tijd */
function normalizeSalonwareDate(s) {
  if (!s) return '';
  const t = String(s).trim().replace(/^"|"$/g, '');
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return normalizeDate(t);
}
/** Salonware totaalomzet: "214,00" of "1.234,50" */
function parseSalonwareMoney(s) {
  if (s === undefined || s === null) return null;
  const t = String(s).trim().replace(/^"|"$/g, '');
  if (!t) return null;
  const n = parseFloat(t.replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}
/** Vergelijkt CSV-kolomnamen ongeacht spaties, streepje of underscore (o.a. "Eerste afspraak"). */
function normalizeCsvHeaderKey(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/^"|"$/g, '')
    .replace(/[\s_\-]/g, '');
}
/** Eerste kolomindex waar de genormaliseerde naam overeenkomt met een van de kandidaten. */
function firstMatchingColumnIndex(headers, candidates) {
  const want = new Set((candidates || []).map(c => normalizeCsvHeaderKey(c)));
  for (let i = 0; i < headers.length; i++) {
    if (want.has(normalizeCsvHeaderKey(headers[i]))) return i;
  }
  return -1;
}
/**
 * Leest eerste/laatste afspraak + totaalomzet uit een Salonware-rij (flexibele kolomnamen).
 * @returns {Record<string, string|number>} Alleen gezette sleutels
 */
function salonImportPatchFromRow(headers, row) {
  const iE = firstMatchingColumnIndex(headers, ['eersteafspraak', 'eerste afspraak', 'eerste_afspraak', 'datum_eerste_afspraak']);
  const iL = firstMatchingColumnIndex(headers, ['laatsteafspraak', 'laatste afspraak', 'laatste_afspraak', 'datum_laatste_afspraak']);
  const iO = firstMatchingColumnIndex(headers, ['totaalomzet', 'totaal omzet', 'totale omzet', 'totaal_omzet', 'omzet totaal']);
  const salonImport = {};
  if (iE > -1) {
    const v = normalizeSalonwareDate((row[iE] || '').trim());
    if (v) salonImport.eersteAfspraak = v;
  }
  if (iL > -1) {
    const v = normalizeSalonwareDate((row[iL] || '').trim());
    if (v) {
      const today = todayLocalISO();
      if (v > today) salonImport.laatsteAfspraakGepland = v;
      else salonImport.laatsteAfspraak = v;
    }
  }
  const iAO = firstMatchingColumnIndex(headers, ['afspraakomzet', 'afspraak omzet']);
  const iPO = firstMatchingColumnIndex(headers, ['productomzet', 'product omzet']);
  if (iAO > -1) {
    const m = parseSalonwareMoney(row[iAO]);
    if (m !== null) salonImport.afspraakOmzet = m;
  }
  if (iPO > -1) {
    const m = parseSalonwareMoney(row[iPO]);
    if (m !== null) salonImport.productOmzet = m;
  }
  if (iO > -1) {
    const m = parseSalonwareMoney(row[iO]);
    if (m !== null) salonImport.totaalOmzet = m;
  }
  return salonImport;
}
/** Zelfde naamparsing als import (voornaam, achternaam, voorvoegsel). */
function salonImportCsvRowFullNameKey(headers, row) {
  const colVoor = firstMatchingColumnIndex(headers, ['voorvoegsel']);
  const iFn = firstMatchingColumnIndex(headers, ['voornaam', 'firstname', 'naam', 'name']);
  const iLn = firstMatchingColumnIndex(headers, ['achternaam', 'lastname']);
  let fn = iFn > -1 ? String(row[iFn] || '').trim() : '';
  let ln = iLn > -1 ? String(row[iLn] || '').trim() : '';
  if (colVoor > -1) {
    const pref = String(row[colVoor] || '').trim();
    if (pref) ln = [pref, ln].filter(Boolean).join(' ').trim();
  }
  return [fn, ln].filter(Boolean).join(' ').toLowerCase();
}
/**
 * Werkt alleen c.salonImport bij uit een Salonware-export (zelfde als opnieuw importeren, maar zonder andere velden te wijzigen).
 * @returns {number} Aantal klanten waarvan salonImport is bijgewerkt
 */
function mergeSalonwareStatsFromCsvText(text) {
  let raw = text;
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const delimiter = detectCsvDelimiter(raw);
  const rows = parseCsv(raw, delimiter);
  if (rows.length < 2) return 0;
  const headers = rows[0].map(h => String(h || '').trim().toLowerCase().replace(/^"|"$/g, ''));
  const colKlantId = firstMatchingColumnIndex(headers, ['klant_id', 'external_id']);
  let merged = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const patch = salonImportPatchFromRow(headers, r);
    if (!Object.keys(patch).length) continue;
    const extId = colKlantId > -1 ? String((r[colKlantId] || '').trim()) : '';
    const nameKey = salonImportCsvRowFullNameKey(headers, r);
    let existing = extId ? DB.clients.find(c => c.importSourceId === extId) : null;
    if (!existing && nameKey) {
      existing = DB.clients.find(c => clientFullName(c).toLowerCase() === nameKey);
    }
    if (!existing) continue;
    existing.salonImport = { ...(existing.salonImport || {}), ...patch };
    merged++;
  }
  if (merged) saveDataWithImportQuotaFix();
  return merged;
}

/**
 * Werkt klantgegevens bij uit Salonware-CSV: volledige notities + salonImport (ook als klanten al geladen zijn).
 * @returns {{ updated: number, added: number }}
 */
function mergeSalonwareClientsFromCsvText(text, opts = {}) {
  const quiet = !!opts.quiet;
  let raw = text;
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const delimiter = detectCsvDelimiter(raw);
  const rows = parseCsv(raw, delimiter);
  if (rows.length < 2) return { updated: 0, added: 0 };
  const headers = rows[0].map(h => String(h || '').trim().toLowerCase().replace(/^"|"$/g, ''));
  const aliases = {
    firstName: ['firstname','voornaam','naam','name','klant'],
    lastName:  ['lastname','achternaam'],
    phone:     ['phone','telefoon','tel'],
    mobile:    ['mobile','mobiel'],
    email:     ['email','e-mail','mail'],
    birthday:  ['birthday','verjaardag','geboortedatum','geboorte'],
    address:   ['address','adres'],
    city:      ['city','plaats','woonplaats'],
    zip:       ['zip','postcode','postal'],
    gender:    ['gender','geslacht','mv'],
    initials:  ['initials','voorletters'],
    notes:     ['notes','notitie','notities','opmerkingen'],
    notesInternal: ['notesinternal','opmerkingen_intern','opmerkingen intern'],
  };
  function findCol(field) {
    for (const a of aliases[field] || []) { const i = headers.indexOf(a); if (i !== -1) return i; }
    return -1;
  }
  const cols = {};
  Object.keys(aliases).forEach(f => { cols[f] = findCol(f); });
  const colKlantId = firstMatchingColumnIndex(headers, ['klant_id', 'external_id']);
  const colHuis = headers.indexOf('huisnummer');
  const colVoor = headers.indexOf('voorvoegsel');
  const noteMax = 1500;
  const noteIntMax = 800;
  let updated = 0;
  let added = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const obj = {};
    Object.keys(aliases).forEach(f => {
      if (cols[f] > -1) obj[f] = (r[cols[f]] || '').trim();
    });
    if (obj.birthday) obj.birthday = normalizeDate(obj.birthday);
    if (obj.notes) obj.notes = sanitizeImportNotes(obj.notes, noteMax);
    if (obj.notesInternal) obj.notesInternal = sanitizeImportNotes(obj.notesInternal, noteIntMax);
    if (obj.gender) {
      const g = String(obj.gender).toUpperCase().charAt(0);
      obj.gender = g === 'M' ? 'M' : (g === 'V' ? 'V' : obj.gender);
    }

    let fn = (obj.firstName || '').trim();
    let ln = (obj.lastName || '').trim();
    if (colVoor > -1) {
      const pref = (r[colVoor] || '').trim();
      if (pref) ln = [pref, ln].filter(Boolean).join(' ').trim();
    }
    if (!fn && !ln) continue;

    let addr = (obj.address || '').trim();
    if (colHuis > -1) {
      const h = (r[colHuis] || '').trim();
      if (h) addr = [addr, h].filter(Boolean).join(' ').trim();
    }
    obj.firstName = fn;
    obj.lastName = ln;
    obj.address = addr;

    const siMerge = salonImportPatchFromRow(headers, r);
    const extId = colKlantId > -1 ? String((r[colKlantId] || '').trim()) : '';
    if (extId) obj.importSourceId = extId;

    const fullName = [fn, ln].filter(Boolean).join(' ').toLowerCase();
    let existing = extId ? DB.clients.find(c => c.importSourceId === extId) : null;
    if (!existing && fullName) {
      existing = DB.clients.find(c => clientFullName(c).toLowerCase() === fullName);
    }
    if (existing) {
      Object.assign(existing, obj);
      if (siMerge && Object.keys(siMerge).length) {
        existing.salonImport = { ...(existing.salonImport || {}), ...siMerge };
      }
      updated++;
    } else {
      const nc = {
        id: uid('c'),
        gender: 'V',
        initials: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phone: '',
        mobile: '',
        email: '',
        birthday: '',
        zip: '',
        notes: '',
        notesInternal: '',
        mustPayFirst: 'standaard',
        ...obj,
      };
      if (siMerge && Object.keys(siMerge).length) nc.salonImport = siMerge;
      DB.clients.push(nc);
      added++;
    }
  }
  if (updated || added) saveDataWithImportQuotaFix();
  if (!quiet && (updated || added)) {
    showToast(`${added} klanten toegevoegd, ${updated} bijgewerkt (Salonware CSV)`);
  }
  return { updated, added };
}

/** Salonware-export in de map: plant agenda-afspraken (zie importAppointmentsFromAfsprakenKlantenCsv). */
const AFSPRAKEN_KLANTEN_FILENAME = 'Afspraken klanten.csv';
const AFSPRAKEN_IMPORT_TAG = 'afspraken-klanten-csv';

/** Verwijdert verkeerde “laatste afspraak” imports ver in de toekomst (Salonware = vaak onderhoud / geen echte agenda). */
function purgeGhostFutureLaatsteImportedApts() {
  const t = todayLocalISO();
  const n0 = (DB.appointments || []).length;
  DB.appointments = (DB.appointments || []).filter(
    a => !(a.importTag === AFSPRAKEN_IMPORT_TAG && a.importSlot === 'laatste' && a.date > t)
  );
  return n0 - DB.appointments.length;
}

/** Verwijdert alle agenda-items van een eerdere “Afspraken inplannen” CSV-import — daarna kun je hetzelfde bestand opnieuw kiezen (nieuwe datums-/notitielogica, geen “dubbel”-blokkade door oude data). */
function wipeAllImportedAfsprakenKlantenAppointments() {
  const before = (DB.appointments || []).length;
  DB.appointments = (DB.appointments || []).filter(a => a.importTag !== AFSPRAKEN_IMPORT_TAG);
  const rm = before - DB.appointments.length;
  saveData(DB);
  try {
    renderAgenda();
    renderHome();
  } catch (e) { /* */ }
  return rm;
}

/**
 * Kiest een dienst-id op basis van vrije tekst (opmerkingen). Ruwe heuristiek — controleer na import.
 */
function inferTreatmentRefIdFromNotes(notes) {
  const s = String(notes || '').toLowerCase();
  if (/peel\s*acne\s*extra|acne\s*extra/.test(s)) return 't101';
  if (/acne/.test(s)) return 't100';
  if (/ipl/.test(s)) {
    if ((/bovenlip/.test(s) || /boven lip/.test(s)) && /\bkin\b| kin/.test(s)) return 't060';
    if (/bikinilijn|bikini/.test(s)) return 't043';
    if (/oksels?|oksel/.test(s)) return 't045';
    if (/\bkin\b| kin /.test(s) && !/bovenlip|boven lip/.test(s)) return 't047';
    if (/bovenlip|boven lip/.test(s)) return 't046';
    return 't060';
  }
  if (/dermastamp|groeifactoren.*peel|dermastamp/.test(s)) return 't090';
  if (/mesodermapen|meso\s*derma|dermapen/.test(s)) return 't091';
  if (/biomicroneedling|bio\s*micro|bio.?microneedling/.test(s)) {
    if (/pigment/.test(s)) return 't120';
    if (/acne/.test(s)) return 't121';
    if (/plasma|huidverjonging.*\+/.test(s)) return 't122';
    return 't123';
  }
  if (/plasma\s*facial|bio\s*plasma|^plasma\b/.test(s)) return 't001';
  if (/carboxy|zuurstof/.test(s)) return 't010';
  if (/microdermabrasie|microderma/.test(s)) return 't030';
  if (/collageen|collagen|elastine\s*booster/.test(s)) return 't081';
  if (/elim|skin.?scan|huidherstel\s*formule|wanglijm|rc\s*wang/.test(s)) return 't020';
  if (/^\s*micro\s*\d|micro\s+45|microbehandeling/.test(s)) return 't030';
  if (/elektrisch\s*onthar/.test(s)) return 't070';
  if (/epileren/.test(s)) return 't130';
  if (/harsen.*bovenlip.*kin|bovenlip.*kin.*hars/.test(s)) return 't133';
  if (/harsen.*bovenlip/.test(s)) return 't132';
  return 't020';
}

function appointmentItemFromTreatmentRefId(refId) {
  const ref = findTreatment(refId) || findTreatment('t020');
  const r = ref || DB.treatments[0];
  return { kind: 'treatment', refId: r.id, savedName: r.name, qty: 1, price: r.price };
}

/**
 * Leest Salonware-klantenexport (o.a. Afspraken klanten.csv): plant per klant afspraken op
 * (1) eerste registratie, (2) laatste alleen als die ≤ vandaag (kolom laatste is vaak géén echte agenda),
 * (3) losse datums uit opmerkingen (Euro d-m-j jj), bv. oude acne-bezoeken.
 * Toekomstige datums (uit notities) → gepland; verleden → afgerond.
 */
function importAppointmentsFromAfsprakenKlantenCsv(text, opts = {}) {
  const quiet = !!opts.quiet;
  let raw = text;
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const delimiter = detectCsvDelimiter(raw);
  const rows = parseCsv(raw, delimiter);
  if (rows.length < 2) {
    if (!quiet) showToast('Leeg bestand');
    return { created: 0, skipped: 0, noClient: 0, removedFutureLaatste: 0 };
  }
  const headers = rows[0].map(h => String(h || '').trim().toLowerCase().replace(/^"|"$/g, ''));
  const hEerste = firstMatchingColumnIndex(headers, ['eersteafspraak', 'eerste afspraak', 'eerste_afspraak']);
  const hLaatste = firstMatchingColumnIndex(headers, ['laatsteafspraak', 'laatste afspraak', 'laatste_afspraak']);
  const hNotes = firstMatchingColumnIndex(headers, ['opmerkingen', 'notities', 'notes', 'opmerking']);
  if (hLaatste === -1 && hEerste === -1) {
    if (!quiet) showToast('Geen eerste/laatste afspraak-kolommen gevonden');
    return { created: 0, skipped: 0, noClient: 0, removedFutureLaatste: 0 };
  }
  const removedFutureLaatste = purgeGhostFutureLaatsteImportedApts();
  const today = todayLocalISO();
  let created = 0;
  let skipped = 0;
  let noClient = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if ((r?.length || 0) + 20 < headers.length) continue;

    const notesRaw = hNotes > -1 ? String(r[hNotes] || '') : '';
    const refId = inferTreatmentRefIdFromNotes(notesRaw);
    const colKlant = firstMatchingColumnIndex(headers, ['klant_id', 'external_id']);
    const extId = colKlant > -1 ? String((r[colKlant] || '').trim()) : '';
    const nameKey = salonImportCsvRowFullNameKey(headers, r);
    let c = extId ? DB.clients.find(x => x.importSourceId === extId) : null;
    if (!c && nameKey) c = DB.clients.find(x => clientFullName(x).toLowerCase() === nameKey);
    if (!c) {
      noClient++;
      continue;
    }
    const eerste = hEerste > -1 ? normalizeSalonwareDate(String((r[hEerste] || '').trim())) : '';
    const laatsteRaw = hLaatste > -1 ? normalizeSalonwareDate(String((r[hLaatste] || '').trim())) : '';
    const laatstePast = laatsteRaw && laatsteRaw <= today ? laatsteRaw : '';
    const noteDates = extractVisitDatesIsoFromNlNotes(notesRaw);

    const slots = [];
    const seenDates = new Set();
    function pushSlot(date, role) {
      if (!date || seenDates.has(date)) return;
      seenDates.add(date);
      slots.push({ date, role });
    }
    if (eerste) pushSlot(eerste, 'eerste');
    if (laatstePast) pushSlot(laatstePast, 'laatste');
    let nNote = 0;
    for (const dIso of noteDates) {
      if (nNote >= 24) break;
      pushSlot(dIso, 'notitie');
      nNote++;
    }
    slots.sort((a, b) => a.date.localeCompare(b.date));

    if (!slots.length) continue;

    const noteShort = sanitizeImportNotes(notesRaw, 400);
    let sub = 0;
    for (const slot of slots) {
      const isFuture = slot.date >= today;
      const status = isFuture ? 'gepland' : 'afgerond';
      const dup = DB.appointments.some(
        a => a.clientId === c.id && a.date === slot.date && a.importTag === AFSPRAKEN_IMPORT_TAG
      );
      if (dup) {
        skipped++;
        continue;
      }
      const baseMins = 9 * 60 + ((i * 2 + sub) * 19) % (8 * 60);
      sub++;
      const hh = String(Math.floor(baseMins / 60)).padStart(2, '0');
      const mm = String(baseMins % 60).padStart(2, '0');
      const time = `${hh}:${mm}`;
      DB.appointments.push({
        id: uid('a'),
        date: slot.date,
        time,
        clientId: c.id,
        items: [appointmentItemFromTreatmentRefId(refId)],
        status,
        paid: status === 'afgerond',
        notes: `[Import ${AFSPRAKEN_KLANTEN_FILENAME} ${slot.role}]${noteShort ? '\n' + noteShort : ''}`,
        importTag: AFSPRAKEN_IMPORT_TAG,
        importSlot: slot.role,
      });
      created++;
    }
  }
  if (created || removedFutureLaatste) saveData(DB);
  if (!quiet) {
    const parts = [];
    if (removedFutureLaatste) parts.push(`${removedFutureLaatste} toekomst-“laatste” verwijderd`);
    parts.push(`${created} afspraken toegevoegd`);
    if (skipped) parts.push(`${skipped} dubbel overgeslagen`);
    if (noClient) parts.push(`${noClient} rijen zonder match met klant — eerst klanten importeren`);
    showToast(parts.join(' · '));
  }
  renderAgenda();
  renderHome();
  return { created, skipped, noClient, removedFutureLaatste };
}

function saveDataWithImportQuotaFix() {
  try {
    saveData(DB);
    return;
  } catch (e) {
    const q = e && (e.name === 'QuotaExceededError' || e.code === 22);
    if (!q) throw e;
  }
  DB.clients.forEach(c => {
    if (c.notes && c.notes.length > 500) c.notes = c.notes.slice(0, 500) + '…';
    if (c.notesInternal && c.notesInternal.length > 250) c.notesInternal = c.notesInternal.slice(0, 250) + '…';
  });
  try {
    saveData(DB);
    return;
  } catch (e2) { /* laatste redmiddel */ }
  DB.clients.forEach(c => {
    c.notes = (c.notes || '').slice(0, 220);
    c.notesInternal = (c.notesInternal || '').slice(0, 120);
  });
  try {
    saveData(DB);
    showToast('Let op: opslag vol — notities sterk ingekort zodat alle klanten passen.');
  } catch (e3) {
    showToast('Importeren mislukt: browseropslag te klein. Gebruik eerst ↺ om te wissen of importeer in delen.');
  }
}
function importClientsCsv(text) {
  let raw = text;
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const delimiter = detectCsvDelimiter(raw);
  const rows = parseCsv(raw, delimiter);
  if (!rows.length) return showToast('Leeg bestand');
  const headers = rows[0].map(h => String(h || '').trim().toLowerCase().replace(/^"|"$/g, ''));
  const aliases = {
    firstName: ['firstname','voornaam','naam','name','klant'],
    lastName:  ['lastname','achternaam'],
    phone:     ['phone','telefoon','tel'],
    mobile:    ['mobile','mobiel'],
    email:     ['email','e-mail','mail'],
    birthday:  ['birthday','verjaardag','geboortedatum','geboorte'],
    address:   ['address','adres'],
    city:      ['city','plaats','woonplaats'],
    zip:       ['zip','postcode','postal'],
    gender:    ['gender','geslacht','mv'],
    initials:  ['initials','voorletters'],
    notes:     ['notes','notitie','notities','opmerkingen'],
    notesInternal: ['notesinternal','opmerkingen_intern','opmerkingen intern'],
  };
  function findCol(field) {
    for (const a of aliases[field] || []) { const i = headers.indexOf(a); if (i!==-1) return i; }
    return -1;
  }
  const cols = {};
  Object.keys(aliases).forEach(f => { cols[f] = findCol(f); });
  const colKlantId = firstMatchingColumnIndex(headers, ['klant_id', 'external_id']);
  const colHuis = headers.indexOf('huisnummer');
  const colVoor = headers.indexOf('voorvoegsel');
  const isSalonware = delimiter === ';' && colKlantId !== -1;
  const noteMax = isSalonware ? 1500 : 3000;
  const noteIntMax = isSalonware ? 800 : 1500;

  if (cols.firstName === -1) return showToast('CSV mist een naam-kolom (naam / voornaam)');

  let added = 0, updated = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const obj = {};
    Object.keys(aliases).forEach(f => {
      if (cols[f] > -1) obj[f] = (r[cols[f]] || '').trim();
    });
    if (obj.birthday) obj.birthday = normalizeDate(obj.birthday);
    if (obj.notes) obj.notes = sanitizeImportNotes(obj.notes, noteMax);
    if (obj.notesInternal) obj.notesInternal = sanitizeImportNotes(obj.notesInternal, noteIntMax);
    if (obj.gender) {
      const g = String(obj.gender).toUpperCase().charAt(0);
      obj.gender = g === 'M' ? 'M' : (g === 'V' ? 'V' : obj.gender);
    }

    let fn = (obj.firstName || '').trim();
    let ln = (obj.lastName || '').trim();
    if (colVoor > -1) {
      const pref = (r[colVoor] || '').trim();
      if (pref) ln = [pref, ln].filter(Boolean).join(' ').trim();
    }
    if (!fn && !ln) continue;

    let addr = (obj.address || '').trim();
    if (colHuis > -1) {
      const h = (r[colHuis] || '').trim();
      if (h) addr = [addr, h].filter(Boolean).join(' ').trim();
    }
    obj.firstName = fn;
    obj.lastName = ln;
    obj.address = addr;

    const salonImport = salonImportPatchFromRow(headers, r);
    if (Object.keys(salonImport).length) obj.salonImport = salonImport;

    const extId = colKlantId > -1 ? String((r[colKlantId] || '').trim()) : '';
    if (extId) obj.importSourceId = extId;

    const fullName = [fn, ln].filter(Boolean).join(' ').toLowerCase();
    let existing = extId ? DB.clients.find(c => c.importSourceId === extId) : null;
    if (!existing) existing = DB.clients.find(c => clientFullName(c).toLowerCase() === fullName);
    const siMerge = obj.salonImport;
    delete obj.salonImport;
    if (existing) {
      Object.assign(existing, obj);
      if (siMerge && Object.keys(siMerge).length) {
        existing.salonImport = { ...(existing.salonImport || {}), ...siMerge };
      }
      updated++;
    } else {
      const nc = {
        id: uid('c'),
        gender: 'V',
        initials: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phone: '',
        mobile: '',
        email: '',
        birthday: '',
        zip: '',
        notes: '',
        notesInternal: '',
        mustPayFirst: 'standaard',
        ...obj,
      };
      if (siMerge && Object.keys(siMerge).length) nc.salonImport = siMerge;
      DB.clients.push(nc);
      added++;
    }
  }
  saveDataWithImportQuotaFix();
  klantenListPage = 1;
  renderClients($('#searchClient').value);
  renderHome();
  showToast(`${added} toegevoegd, ${updated} bijgewerkt`);
}

/** Salonware-export in de projectmap — alleen in te lezen via http(s); bij file:/// moet je handmatig importeren of een lokale server gebruiken. */
const SALONWARE_BUNDLED_FILENAME = 'salonware-download (2).csv';

function fetchBundledSalonwareCsvText() {
  return fetch(encodeURI(SALONWARE_BUNDLED_FILENAME), { cache: 'no-store' }).then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.text();
  });
}

function fetchBundledSalonwareCsvAndImport() {
  return fetchBundledSalonwareCsvText().then(text => importClientsCsv(text));
}

function fetchAfsprakenKlantenCsvText() {
  return fetch(encodeURI(AFSPRAKEN_KLANTEN_FILENAME), { cache: 'no-store' }).then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.text();
  });
}

/** Na klanten uit de map: laadt Afspraken klanten.csv en plant agenda (idempotent). Alleen http(s), niet file:// */
function tryImportBundledAfsprakenKlantenCsv() {
  if (location.protocol === 'file:') return Promise.resolve(null);
  if ((DB.clients || []).length === 0) return Promise.resolve(null);
  return fetchAfsprakenKlantenCsvText()
    .then(text => {
      if (!text || text.length < 80) throw new Error('Te kort');
      return importAppointmentsFromAfsprakenKlantenCsv(text, { quiet: true });
    })
    .then(res => {
      if (!res) return null;
      const bits = [];
      if (res.removedFutureLaatste > 0) bits.push(`${res.removedFutureLaatste} foute toekomst-afspraken uit oude import verwijderd`);
      if (res.created > 0) bits.push(`${res.created} afspraken uit ${AFSPRAKEN_KLANTEN_FILENAME} (klant + behandeling)`);
      if (bits.length) showToast(bits.join(' · '));
      return res;
    })
    .catch(e => {
      console.warn('[Salon] Auto-import afspraken klanten:', e && e.message);
      return null;
    });
}

function updateSalonwareBundledChrome() {
  const sec = document.querySelector('section[data-view="klanten"]');
  if (!sec) return;
  const n = (DB.clients || []).length;
  const existing = document.getElementById('salonwareBundledBar');
  if (n > 0) {
    existing?.remove();
    return;
  }
  let bar = existing;
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'salonwareBundledBar';
    const toolbar = sec.querySelector('.toolbar');
    if (toolbar) sec.insertBefore(bar, toolbar);
    else sec.prepend(bar);
  }
  const fn = SALONWARE_BUNDLED_FILENAME;
  const isFile = location.protocol === 'file:';
  bar.className = 'card salonware-bundled-bar';
  if (isFile) {
    bar.innerHTML = `<div class="card-body" style="font-size:14px;">
      <p style="margin:0 0 10px 0;"><strong>Klanten zet je er nog steeds in zoals vroeger:</strong> kies het exportbestand <code>${escapeHtml(fn)}</code> op je schijf (het bestand in deze map). Dat gaat met de knop hieronder — het is hetzelfde als <strong>CSV importeren</strong> in de werkbalk.</p>
      <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:10px;">
        <button type="button" class="btn primary" id="bundledSalonwarePickFile">Kies Salonware-CSV…</button>
        <span style="color:var(--muted); font-size:13px;">Daarna worden alle rijen ingelezen.</span>
      </div>
      <p style="margin:0; color:var(--muted); font-size:13px;">Alleen het <em>automatisch</em> inlezen bij openen van de pagina mag je browser niet verbinden met een <code>file:///</code>-pagina — dat is een beveiligingsregel, geen wijziging in jouw import. Wil je wél automatisch? Open de site via <code>http://localhost:8765</code> (in deze map: <code>python3 -m http.server 8765</code>).</p>
    </div>`;
    $('#bundledSalonwarePickFile')?.addEventListener('click', () => {
      $('#csvImport')?.click();
    });
    return;
  }
  bar.innerHTML = `<div class="card-body" style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; font-size:14px;"><span>Klantenlijst is leeg — importeer <code>${escapeHtml(fn)}</code> (staat naast <code>index.html</code>).</span><button type="button" class="btn primary small" id="bundledSalonwareLoad">Automatisch laden</button><button type="button" class="btn ghost small" id="bundledSalonwarePickFileHttp">Bestand kiezen…</button></div>`;
  $('#bundledSalonwareLoad')?.addEventListener('click', () => {
    showToast('Bezig met importeren…');
    fetchBundledSalonwareCsvAndImport()
      .then(() => {
        updateSalonwareBundledChrome();
        renderClients($('#searchClient')?.value || '');
        renderHome();
      })
      .catch(() => showToast('Mislukt: staat het CSV naast index.html?'));
  });
  $('#bundledSalonwarePickFileHttp')?.addEventListener('click', () => $('#csvImport')?.click());
}

function tryImportBundledSalonwareCsv() {
  if ((DB.clients || []).length > 0) return Promise.resolve();
  if (location.protocol === 'file:') return Promise.resolve();
  return fetchBundledSalonwareCsvText()
    .then(text => {
      if (!text || text.length < 80) throw new Error('Te kort');
      importClientsCsv(text);
    })
    .catch(e => {
      console.warn('[Salon] Auto-import Salonware CSV:', e && e.message);
    });
}

/** Na seed of bij elke start: volledige notities + omzet/datums uit Salonware-CSV bijwerken. */
function tryMergeBundledSalonwareCsv() {
  if (location.protocol === 'file:') return Promise.resolve(null);
  return fetchBundledSalonwareCsvText()
    .then(text => {
      if (!text || text.length < 80) throw new Error('Te kort');
      return mergeSalonwareClientsFromCsvText(text, { quiet: true });
    })
    .catch(e => {
      console.warn('[Salon] Salonware CSV merge:', e && e.message);
      return null;
    });
}

/**
 * Laadt vooraf gebouwde salon-seed.json (klanten + afspraken) — werkt direct op GitHub Pages.
 * Geen handmatige stappen nodig voor bezoekers.
 */
function bootstrapSalonFromHostedSeed() {
  if (location.protocol === 'file:') return Promise.resolve(false);
  const stored = localStorage.getItem(SALON_SEED_KEY);
  const hasClients = (DB.clients || []).length > 0;
  const hasAppts = (DB.appointments || []).length > 0;
  if (stored === SALON_SEED_VERSION && hasClients && hasAppts) {
    return Promise.resolve(false);
  }
  return fetch(`salon-seed.json?v=${encodeURIComponent(SALON_SEED_VERSION)}`, { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(seed => {
      if (!seed || !Array.isArray(seed.clients) || !seed.clients.length) {
        throw new Error('Leeg seed-bestand');
      }
      DB.clients = seed.clients;
      DB.appointments = Array.isArray(seed.appointments) ? seed.appointments : [];
      saveDataWithImportQuotaFix();
      localStorage.setItem(SALON_SEED_KEY, SALON_SEED_VERSION);
      console.log('[Salon] seed geladen:', seed.clients.length, 'klanten,', DB.appointments.length, 'afspraken');
      return true;
    })
    .catch(e => {
      console.warn('[Salon] Seed bootstrap mislukt:', e && e.message);
      return false;
    });
}

function normalizeDate(s) {
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  return '';
}
function downloadFile(filename, text, type='text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/* =========================================================
   BEHEER
   ========================================================= */
function renderBeheer() {
  // Behandelingen per categorie
  const cats = DB.treatmentCategories;
  $('#treatmentsList').innerHTML = cats.map(cat => {
    const items = DB.treatments.filter(t => t.category === cat);
    return `<div class="cat-block">
      <div class="cat-header">
        <span class="cat-drag">≡</span>
        <strong>${escapeHtml(cat)}</strong>
        <span class="spacer"></span>
        <button class="btn ghost small" data-add-to-cat="${escapeHtml(cat)}">+ Dienst toevoegen</button>
        <button class="row-btn" data-edit-cat="${escapeHtml(cat)}" title="Categorie hernoemen">✎</button>
        <button class="row-btn delete" data-del-cat="${escapeHtml(cat)}" title="Categorie verwijderen">🗑</button>
      </div>
      <table class="data-table">
        <thead><tr><th></th><th>Naam</th><th>Duur</th><th>BTW</th><th>Prijs</th><th></th></tr></thead>
        <tbody>
          ${items.length ? items.map(t => `<tr>
            <td>≡</td>
            <td>${escapeHtml(t.name)}</td>
            <td>${t.duration ? `${String(Math.floor(t.duration/60)).padStart(2,'0')}:${String(t.duration%60).padStart(2,'0')}` : '00:00'}</td>
            <td>${t.vat ?? 21}%</td>
            <td class="amount">${fmtMoney(t.price)}</td>
            <td style="text-align:right;">
              <button class="row-btn" data-edit-t="${t.id}" title="Bewerken">✎</button>
              <button class="row-btn delete" data-del-t="${t.id}" title="Verwijderen">🗑</button>
            </td>
          </tr>`).join('') : `<tr><td colspan="6" class="empty">Nog geen diensten in deze categorie.</td></tr>`}
        </tbody>
      </table>
    </div>`;
  }).join('');

  // Producten per categorie — render direct in panel-producten
  const prodPanel = $('#panel-producten');
  const prodCard = prodPanel.querySelector('.card');
  // Verwijder eerder gegenereerde categorie-blokken
  $$('.prod-cat-block', prodCard).forEach(b => b.remove());
  // Verberg de lege tabel (placeholder)
  const oldTable = prodPanel.querySelector('table');
  if (oldTable) oldTable.style.display = 'none';

  (DB.productCategories || []).forEach(cat => {
    const items = DB.products.filter(p => p.category === cat);
    const block = document.createElement('div');
    block.className = 'cat-block prod-cat-block';
    block.innerHTML = `
      <div class="cat-header">
        <span class="cat-drag">≡</span>
        <strong>${escapeHtml(cat)}</strong>
        <span class="spacer"></span>
        <button class="btn ghost small" data-add-to-pcat="${escapeHtml(cat)}">+ Product toevoegen</button>
        <button class="row-btn" data-edit-pcat="${escapeHtml(cat)}" title="Hernoemen">✎</button>
        <button class="row-btn delete" data-del-pcat="${escapeHtml(cat)}" title="Verwijderen">🗑</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Naam</th><th>Inkoop (excl)</th><th>BTW</th><th>Verkoopprijs</th><th></th></tr></thead>
        <tbody>
          ${items.length ? items.map(p => `<tr>
            <td>${escapeHtml(p.name)}</td>
            <td class="amount">${p.purchasePrice ? fmtMoney(p.purchasePrice) : '-'}</td>
            <td>${p.vat ?? 21}%</td>
            <td class="amount">${fmtMoney(p.price)}</td>
            <td style="text-align:right;">
              <button class="row-btn" data-edit-p="${p.id}" title="Bewerken">✎</button>
              <button class="row-btn delete" data-del-p="${p.id}" title="Verwijderen">🗑</button>
            </td>
          </tr>`).join('') : `<tr><td colspan="5" class="empty">Nog geen producten in deze categorie.</td></tr>`}
        </tbody>
      </table>`;
    prodCard.appendChild(block);
  });
}

function openTreatmentModal(t, defaultCat) {
  const e = t || { id:'', category: defaultCat || DB.treatmentCategories[0] || '', name:'', duration:30, vat:21, price:0 };
  openModal(t ? 'Dienst bewerken' : 'Nieuwe dienst', `
    <form id="tForm" class="form">
      <label style="grid-column:1/-1;">Categorie
        <select name="category">
          ${DB.treatmentCategories.map(c => `<option value="${escapeHtml(c)}" ${c===e.category?'selected':''}>${escapeHtml(c)}</option>`).join('')}
        </select>
      </label>
      <label style="grid-column:1/-1;">Naam<input type="text" name="name" required value="${escapeHtml(e.name)}"></label>
      <label>Duur (min)<input type="number" name="duration" min="0" step="5" value="${e.duration}"></label>
      <label>BTW %<input type="number" name="vat" min="0" max="100" step="1" value="${e.vat??21}"></label>
      <label>Prijs (€)<input type="number" name="price" step="0.01" min="0" value="${Number(e.price).toFixed(2)}"></label>
      <div style="grid-column:1/-1; display:flex; justify-content:flex-end; gap:8px;">
        <button type="button" class="btn ghost" id="cancelT">Annuleren</button>
        <button type="submit" class="btn primary">${t ? 'Opslaan' : 'Toevoegen'}</button>
      </div>
    </form>
  `);
  $('#cancelT').addEventListener('click', closeModal);
  $('#tForm').addEventListener('submit', ev => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const data = { category: fd.get('category'), name: fd.get('name'), duration: Number(fd.get('duration')), vat: Number(fd.get('vat')), price: Number(fd.get('price')) };
    if (t) Object.assign(t, data);
    else DB.treatments.push({ id: uid('t'), ...data });
    saveData(DB); closeModal(); renderBeheer();
    showToast(t ? 'Dienst bijgewerkt' : 'Dienst toegevoegd');
  });
}

function openProductModal(p, defaultCat) {
  const e = p || { id:'', category: defaultCat || (DB.productCategories||[])[0] || '', name:'', purchasePrice:0, vat:21, price:0, stock:0 };
  openModal(p ? 'Product bewerken' : 'Nieuw product', `
    <form id="pForm" class="form">
      <label style="grid-column:1/-1;">Categorie
        <select name="category">
          ${(DB.productCategories||[]).map(c => `<option value="${escapeHtml(c)}" ${c===e.category?'selected':''}>${escapeHtml(c)}</option>`).join('')}
        </select>
      </label>
      <label style="grid-column:1/-1;">Naam<input type="text" name="name" required value="${escapeHtml(e.name)}"></label>
      <label>Inkoopprijs excl. BTW (€)<input type="number" name="purchasePrice" step="0.01" min="0" value="${Number(e.purchasePrice||0).toFixed(2)}"></label>
      <label>BTW %<input type="number" name="vat" min="0" max="100" step="1" value="${e.vat??21}"></label>
      <label>Verkoopprijs (€)<input type="number" name="price" step="0.01" min="0" value="${Number(e.price).toFixed(2)}"></label>
      <label>Voorraad<input type="number" name="stock" min="0" value="${e.stock||0}"></label>
      <div style="grid-column:1/-1; display:flex; justify-content:flex-end; gap:8px;">
        <button type="button" class="btn ghost" id="cancelP">Annuleren</button>
        <button type="submit" class="btn primary">${p ? 'Opslaan' : 'Toevoegen'}</button>
      </div>
    </form>
  `);
  $('#cancelP').addEventListener('click', closeModal);
  $('#pForm').addEventListener('submit', ev => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const data = { category: fd.get('category'), name: fd.get('name'), purchasePrice: Number(fd.get('purchasePrice')), vat: Number(fd.get('vat')), price: Number(fd.get('price')), stock: Number(fd.get('stock')) };
    if (p) Object.assign(p, data);
    else DB.products.push({ id: uid('p'), ...data });
    saveData(DB); closeModal(); renderBeheer();
    showToast(p ? 'Product bijgewerkt' : 'Product toegevoegd');
  });
}

/* =========================================================
   AFSPRAAK BEHEREN (groot modal bij klik op agenda-blok)
   ========================================================= */
function openAppointmentDetail(id) {
  const a = DB.appointments.find(x => x.id === id);
  if (!a) return;
  currentApptId = id;
  showView('afspraak-detail');
  renderAppointmentDetail();
}

let currentApptId = null;
let currentApptTab = 'afspraak';

function renderAppointmentDetail() {
  const id = currentApptId;
  const a = DB.appointments.find(x => x.id === id);
  if (!a) return;
  const c = findClient(a.clientId);

  // Bereken Van/Tot per behandeling op basis van starttijd en duur
  let cursor = a.time;
  const rows = (a.items || []).map((it, idx) => {
    const name = describeItem(it);
    const dur = it.kind === 'treatment' ? (findTreatment(it.refId)?.duration || 0) * (it.qty || 1) : 0;
    const start = cursor;
    if (dur) {
      const [h, m] = cursor.split(':').map(Number);
      const total = h * 60 + m + dur;
      cursor = `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
    }
    return { name, start, end: dur ? cursor : '', dur, price: (it.qty||1)*(it.price||0), idx };
  });
  const total = rows.reduce((s, r) => s + r.price, 0);

  // Klantnaam splits
  const fname = c?.firstName || c?.name?.split(' ')[0] || '';
  const lname = c?.lastName  || c?.name?.split(' ').slice(1).join(' ') || '';

  $('#apptDetailTitle').textContent = 'Afspraak beheren';

  $('#apptDetailContent').innerHTML = `
    <div class="appt-page-grid">
      <div class="appt-page-main">
        <div class="card">
          <div class="appt-modal-tabs">
            <button class="appt-modal-tab ${currentApptTab==='afspraak'?'active':''}" data-modal-tab="afspraak">Afspraak</button>
            <button class="appt-modal-tab ${currentApptTab==='tijden'?'active':''}"  data-modal-tab="tijden">Tijden en reminder</button>
          </div>

          <!-- Tab: Afspraak -->
          <div class="appt-modal-panel ${currentApptTab==='afspraak'?'':'hidden'}" id="mtab-afspraak">
            <div class="appt-two-col">
              <!-- Afspraak kolom -->
              <div class="appt-section">
                <h4>Afspraak</h4>
                <div class="appt-field">
                  <label>Gepland op:</label>
                  <div class="val"><strong>${escapeHtml(weekdayName(a.date))} ${escapeHtml(fmtDate(a.date))} ${escapeHtml(a.time)}</strong></div>
                </div>
                <div class="appt-field">
                  <label>Status:</label>
                  <div class="val">
                    <select id="apptStatus">
                      <option value="gepland" ${a.status==='gepland'?'selected':''}>Eigen reservering</option>
                      <option value="afgerond" ${a.status==='afgerond'?'selected':''}>Afgerond</option>
                      <option value="geannuleerd" ${a.status==='geannuleerd'?'selected':''}>Geannuleerd</option>
                    </select>
                  </div>
                </div>
                <div class="appt-field appt-field-block">
                  <label>Opmerkingen</label>
                  <div class="val"><textarea id="apptNotes" rows="4">${escapeHtml(a.notes||'')}</textarea></div>
                </div>
              </div>

              <!-- Klant kolom -->
              <div class="appt-section">
                <h4>Klant</h4>
                ${c ? `
                ${c.email ? `<div style="margin-bottom:14px;"><span class="email-badge">✉ ${escapeHtml(c.email)}</span></div>` : ''}
                <div class="appt-field"><label>Geslacht:</label><div class="val">
                  <select disabled><option>${(c.gender==='M'?'Man':c.gender==='V'?'Vrouw':'')}</option></select>
                </div></div>
                <div class="appt-field"><label>Naam:</label><div class="val name-grid">
                  <input type="text" value="${escapeHtml(fname)}" placeholder="Voornaam" disabled />
                  <input type="text" value="${escapeHtml(lname)}" placeholder="Achternaam" disabled />
                </div></div>
                <div class="appt-field"><label>Telefoon:</label><div class="val"><input type="text" value="${escapeHtml(c.phone||'')}" disabled /></div></div>
                <div class="appt-field"><label>Mobiel:</label><div class="val"><input type="text" value="${escapeHtml(c.mobile||'')}" disabled /></div></div>
                <div class="appt-field"><label>Email:</label><div class="val"><input type="text" value="${escapeHtml(c.email||'')}" disabled /></div></div>
                ${c.notes ? `<div class="appt-field appt-field-block"><label>Opmerkingen:</label><div class="val client-notes">${escapeHtml(c.notes)}</div></div>` : ''}
                ` : '<p class="empty">Klant niet gevonden.</p>'}
              </div>
            </div>

            <!-- Behandelingen tabel -->
            <div class="appt-section beh-block">
              <div class="beh-header">Behandelingen</div>
              <table class="treatments-table" id="apptItemsTable">
                <thead><tr><th>Van</th><th>Tot</th><th>Behandeling</th><th>Duur</th><th>Prijs</th><th></th></tr></thead>
                <tbody>
                  ${rows.length ? rows.map(r => `<tr>
                    <td>${escapeHtml(r.start)}</td>
                    <td>${escapeHtml(r.end)}</td>
                    <td>${escapeHtml(r.name)}</td>
                    <td>${r.dur ? r.dur : '-'}</td>
                    <td class="amount">${fmtMoney(r.price).replace('€\u00A0','')}</td>
                    <td><button class="row-btn delete" data-remove-idx="${r.idx}">🗑</button></td>
                  </tr>`).join('') : `<tr><td colspan="6" class="empty">Nog geen behandelingen.</td></tr>`}
                </tbody>
                <tfoot><tr><td colspan="4" style="text-align:right; font-weight:600;">Totaal:</td><td class="amount" style="font-weight:600;">${fmtMoney(total)}</td><td></td></tr></tfoot>
              </table>

              <div class="toevoegen-row">
                <span class="toevoeg-label">Toevoegen:</span>
                <input type="text" id="addItemSearch" placeholder="Behandeling of product..." />
              </div>

              <label class="confirm-mail">
                <input type="checkbox" id="apptSendConfirm" /> Automatische bevestigingsmail sturen
              </label>
            </div>

            <div class="appt-actions">
              <button class="btn primary" id="saveApptDetail">Opslaan</button>
              <button class="btn danger" id="sideDelete2">Verwijderen</button>
            </div>
          </div>

          <!-- Tab: Tijden -->
          <div class="appt-modal-panel ${currentApptTab==='tijden'?'':'hidden'}" id="mtab-tijden">
            <div class="appt-section" style="padding:0 18px 18px;">
              <h4>Tijden en reminder</h4>
              <div class="appt-field"><label>Datum:</label><div class="val"><input type="date" id="apptDate2" value="${a.date}" /></div></div>
              <div class="appt-field"><label>Starttijd:</label><div class="val"><input type="time" id="apptTime2" value="${a.time}" /></div></div>
              <p style="margin-top:16px; font-size:13px; color:var(--muted);">Herinneringen worden niet automatisch verstuurd (lokale app).</p>
              <button class="btn primary" id="saveApptTijden" style="margin-top:12px;">Tijden opslaan</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Rechter zijbalk -->
      <aside class="appt-page-side">
        <div class="card">
          <div class="card-title">Afspraak</div>
          <div class="card-body" style="padding:8px;">
            <button class="appt-side-btn primary" id="sideAfrekenen">Afrekenen</button>
            <button class="appt-side-btn" id="sideKopie">Kopie inplannen</button>
            <button class="appt-side-btn" id="sideAfspraakProducten">Afspraken &amp; Producten</button>
            <button class="appt-side-btn" id="sideVerplaatsen">Verplaatsen</button>
            <button class="appt-side-btn" id="sideFactuur">Factuur</button>
            <button class="appt-side-btn" id="sideBericht">Bericht sturen</button>
            <div class="meer-wrap">
              <button class="appt-side-btn" id="sideMeer">Meer.. ▾</button>
              <div class="meer-dropdown hidden" id="meerDropdown">
                <button class="meer-item" id="meerHerhaling">Herhaling instellen</button>
                <button class="meer-item" id="meerDossier">Klantdossier</button>
                <button class="meer-item" id="meerVerzonden">Verzonden berichten</button>
                <button class="meer-item" id="meerFormulier">Formulier versturen</button>
                <button class="meer-item" id="meerHerinnering">Herinnering sturen</button>
                <button class="meer-item danger" id="meerDelete">Verwijderen</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `;

  // Tabs
  $$('.appt-modal-tab').forEach(btn => btn.addEventListener('click', () => {
    currentApptTab = btn.dataset.modalTab;
    renderAppointmentDetail();
  }));

  // Item verwijderen
  $('#apptItemsTable').addEventListener('click', ev => {
    const btn = ev.target.closest('[data-remove-idx]');
    if (!btn) return;
    a.items.splice(Number(btn.dataset.removeIdx), 1);
    saveData(DB);
    renderAppointmentDetail();
  });

  // Item toevoegen via type-ahead zoek
  attachAutocomplete($('#addItemSearch'),
    q => searchTreatmentsAndProducts(q),
    item => {
      const ref = item.kind==='treatment' ? findTreatment(item.id) : findProduct(item.id);
      if (!ref) return;
      a.items.push({ kind: item.kind, refId: ref.id, savedName: ref.name, qty: 1, price: ref.price });
      saveData(DB);
      renderAppointmentDetail();
    }
  );

  // Opslaan
  $('#saveApptDetail').addEventListener('click', () => {
    a.status = $('#apptStatus').value;
    a.notes  = $('#apptNotes').value;
    saveData(DB);
    showToast('Afspraak opgeslagen');
    showView('agenda');
  });

  // Tijden tab opslaan
  if ($('#saveApptTijden')) {
    $('#saveApptTijden').addEventListener('click', () => {
      const nd = $('#apptDate2').value;
      const nt = $('#apptTime2').value;
      if (nd) a.date = nd;
      if (nt) a.time = nt;
      saveData(DB);
      showToast('Tijden opgeslagen');
      showView('agenda');
    });
  }

  // Sidebar acties
  const doDelete = () => {
    if (!confirm('Afspraak verwijderen?')) return;
    DB.appointments = DB.appointments.filter(x => x.id !== id);
    saveData(DB);
    showToast('Verwijderd');
    showView('agenda');
  };
  $('#sideAfrekenen').addEventListener('click', () => openAfrekenen(id));
  $('#sideKopie').addEventListener('click',     () => openKopieModal(id));
  $('#sideAfspraakProducten').addEventListener('click', () => { if (c) openKlantAfspraken(c.id); });
  $('#sideVerplaatsen').addEventListener('click', () => { currentApptTab='tijden'; renderAppointmentDetail(); });
  $('#sideFactuur').addEventListener('click', () => openFactuurModal(id));
  $('#sideBericht').addEventListener('click', () => openBerichtModal(c, a));
  $('#sideDelete2').addEventListener('click',   doDelete);

  // Meer dropdown toggle
  $('#sideMeer').addEventListener('click', e => {
    e.stopPropagation();
    $('#meerDropdown').classList.toggle('hidden');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.meer-wrap')) $('#meerDropdown')?.classList.add('hidden');
  }, { once: true });

  $('#meerHerhaling')?.addEventListener('click', () => openHerhalingModal(id));
  $('#meerDossier')?.addEventListener('click', () => { if (c) openKlantdossier(c.id); });
  $('#meerVerzonden')?.addEventListener('click', () => openVerzondenModal(c));
  $('#meerFormulier')?.addEventListener('click', () => {
    if (c) sendIntakeFormToClient(c);
  });
  $('#meerHerinnering')?.addEventListener('click', () => {
    if (!c?.email) return showToast('Geen e-mailadres bekend');
    const subject = buildReminderSubject(c, a);
    const body    = buildReminderBody(c, a);
    logSentMessage(c.id, 'herinnering', subject);
    openMailto(c.email, subject, body);
  });
  $('#meerDelete')?.addEventListener('click', doDelete);
}

function weekdayName(iso) {
  const days = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
  try { return days[new Date(iso).getDay()] || ''; } catch(e) { return ''; }
}

/* =========================================================
   BERICHT STUREN modal
   ========================================================= */
function openBerichtModal(client, appointment) {
  if (!client) return showToast('Geen klant geselecteerd');
  if (!client.email) return showToast('Geen e-mailadres bekend voor deze klant');
  openModal(`Bericht sturen aan ${clientFullName(client)}`, `
    <div class="form" style="grid-template-columns:1fr;">
      <label>Onderwerp
        <input type="text" id="msgSubject" value="Bericht van ${escapeHtml(DB.settings.salonName)}" />
      </label>
      <label>Bericht
        <textarea id="msgBody" rows="10" placeholder="Typ uw bericht...">Beste ${escapeHtml(client.firstName||clientFullName(client))},

${appointment ? `Met betrekking tot uw afspraak op ${weekdayName(appointment.date)} ${fmtDate(appointment.date)} om ${appointment.time}:

` : ''}
Met vriendelijke groet,
${escapeHtml(DB.settings.salonName)}</textarea>
      </label>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn ghost" id="msgCancel">Annuleren</button>
        <button class="btn primary" id="msgSend">📧 Mail openen</button>
      </div>
    </div>
  `);
  $('#msgCancel').addEventListener('click', closeModal);
  $('#msgSend').addEventListener('click', () => {
    const subject = $('#msgSubject').value;
    const body = $('#msgBody').value;
    logSentMessage(client.id, 'bericht', subject);
    openMailto(client.email, subject, body);
    closeModal();
    showToast('Mailprogramma geopend');
  });
}

/* =========================================================
   VERZONDEN BERICHTEN modal
   ========================================================= */
function openVerzondenModal(client) {
  if (!client) return;
  const msgs = client.sentMessages || [];
  openModal(`Verzonden berichten – ${clientFullName(client)}`, `
    <div style="max-height:400px; overflow-y:auto;">
      ${msgs.length ? `
        <table class="data-table">
          <thead><tr><th>Datum</th><th>Type</th><th>Onderwerp</th></tr></thead>
          <tbody>
            ${msgs.map(m => `<tr>
              <td>${escapeHtml(new Date(m.at).toLocaleString('nl-NL'))}</td>
              <td>${escapeHtml(m.type)}</td>
              <td>${escapeHtml(m.subject)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      ` : '<p class="empty" style="padding:20px;">Nog geen berichten verzonden.</p>'}
    </div>
    <div style="text-align:right; margin-top:12px;">
      <button class="btn ghost" id="vzClose">Sluiten</button>
    </div>
  `);
  $('#vzClose').addEventListener('click', closeModal);
}

/* =========================================================
   HERHALING modal
   ========================================================= */
function openHerhalingModal(apptId) {
  const a = DB.appointments.find(x => x.id === apptId);
  if (!a) return;
  openModal('Herhaling instellen', `
    <div class="form" style="grid-template-columns:1fr;">
      <p style="color:var(--muted); font-size:13px;">Plant deze afspraak meerdere keren in de toekomst.</p>
      <label>Interval
        <select id="hhInterval">
          <option value="1">Wekelijks</option>
          <option value="2">Elke 2 weken</option>
          <option value="3">Elke 3 weken</option>
          <option value="4" selected>Elke 4 weken</option>
          <option value="6">Elke 6 weken</option>
          <option value="8">Elke 8 weken</option>
        </select>
      </label>
      <label>Aantal keer herhalen
        <input type="number" id="hhCount" min="1" max="52" value="6" />
      </label>
      <label style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="hhIncludeProducts" /> Producten ook meekopiëren (standaard alleen behandelingen)
      </label>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn ghost" id="hhCancel">Annuleren</button>
        <button class="btn primary" id="hhConfirm">Inplannen</button>
      </div>
    </div>
  `);
  $('#hhCancel').addEventListener('click', closeModal);
  $('#hhConfirm').addEventListener('click', () => {
    const weeks = Number($('#hhInterval').value)||4;
    const count = Math.max(1, Math.min(52, Number($('#hhCount').value)||1));
    const inclProd = $('#hhIncludeProducts').checked;
    const baseItems = (a.items||[]).filter(it => inclProd || it.kind==='treatment');

    for (let i=1; i<=count; i++) {
      const d = new Date(a.date);
      d.setDate(d.getDate() + weeks*7*i);
      const newApp = {
        id: uid('a'),
        date: d.toISOString().slice(0,10),
        time: a.time,
        clientId: a.clientId,
        items: JSON.parse(JSON.stringify(baseItems)),
        status: 'gepland',
        paid: false,
        notes: a.notes ? `${a.notes} (herhaling ${i})` : `Herhaling ${i}/${count}`,
      };
      DB.appointments.push(newApp);
    }
    saveData(DB);
    closeModal();
    renderAgenda();
    showToast(`${count} herhalingen ingepland`);
  });
}

/* =========================================================
   FACTUUR (volwaardige pagina + bewerken + e-mail)
   ========================================================= */
let currentFacturaApptId = null;
let factuurViewMode = 'view';

function ensureInvoiceNumber(a) {
  if (!a.invoiceNumber) {
    DB.settings.invoiceCounter = (DB.settings.invoiceCounter || 10000) + 1;
    a.invoiceNumber = String(DB.settings.invoiceCounter);
    a.invoiceDate = a.invoiceDate || todayISO();
    saveData(DB);
  }
  return a;
}

function openFactuurModal(apptId) { openFactuur(apptId); }

function openFactuur(apptId) {
  const a = DB.appointments.find(x => x.id === apptId);
  if (!a) return;
  ensureInvoiceNumber(a);
  currentFacturaApptId = apptId;
  factuurViewMode = 'view';
  showView('factuur');
  renderFactuurPage();
}

function computeInvoiceBtwBuckets(a) {
  const buckets = {};
  (a.items||[]).forEach(it => {
    const ref = it.kind==='treatment' ? findTreatment(it.refId) : findProduct(it.refId);
    const vat = ref?.vat ?? DB.settings.vat ?? 21;
    const incl = (it.qty||1)*(it.price||0);
    const excl = incl / (1 + vat/100);
    const btw  = incl - excl;
    if (!buckets[vat]) buckets[vat] = { incl:0, excl:0, btw:0 };
    buckets[vat].incl += incl;
    buckets[vat].excl += excl;
    buckets[vat].btw  += btw;
  });
  return buckets;
}

function getInvoiceProLinesHTML(s) {
  const lines = [];
  if (s.anbosNaam) lines.push(`<div>${escapeHtml(s.anbosNaam)}</div>`);
  if (s.anbosKernlidNummer) lines.push(`<div>ANBOS Kernlidnummer: ${escapeHtml(s.anbosKernlidNummer)}</div>`);
  if (!s.anbosNaam && !s.anbosKernlidNummer && s.anbosKernlid) lines.push(`<div>${escapeHtml(s.anbosKernlid)}</div>`);
  if (s.agbZorgverlener) lines.push(`<div>AGB Zorgverlenercode: ${escapeHtml(s.agbZorgverlener)}</div>`);
  if (s.agbPraktijk) lines.push(`<div>AGB praktijkcode: ${escapeHtml(s.agbPraktijk)}</div>`);
  if (!lines.length) return '';
  return `<div class="factuur-prof">${lines.join('')}</div>`;
}

function getInvoiceDocumentCSS() {
  return `
    body { font-family: Georgia, "Times New Roman", serif; margin: 0; color: #222; }
    .factuur-paper, .factuur-paper--edit { max-width: 720px; margin: 0 auto; background: #fff; padding: 40px 48px; box-sizing: border-box; }
    .factuur-toprow { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 20px; }
    .factuur-header { display: flex; align-items: center; gap: 16px; }
    .factuur-logo { max-height: 64px; max-width: 180px; }
    .factuur-brand-title { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .factuur-aan { text-align: right; font-size: 14px; line-height: 1.45; }
    .factuur-metasingle { font-size: 14px; line-height: 1.55; margin: 0 0 20px; }
    .factuur-metasingle strong { font-weight: 700; }
    .factuur-prof { margin-top: 10px; font-size: 12px; line-height: 1.4; color: #333; }
    .factuur-prof > div { margin-top: 2px; }
    .factuur-tabel { width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; }
    .factuur-tabel th, .factuur-tabel td { padding: 6px 4px; text-align: left; }
    .factuur-tabel th { font-weight: 600; border-bottom: 1px solid #999; }
    .factuur-tabel .amount { text-align: right; }
    .factuur-totals { font-size: 13px; max-width: 360px; margin-left: auto; text-align: right; margin-top: 10px; }
    .factuur-totals-line { display: flex; justify-content: space-between; gap: 20px; padding: 2px 0; }
    .factuur-totals-strong { font-weight: 700; border-top: 2px double #333; padding-top: 6px; margin-top: 4px; }
    .factuur-extra { margin-top: 24px; font-size: 13px; border-top: 1px dashed #aaa; padding-top: 12px; }
    .factuur-footer { text-align: center; font-size: 11px; color: #555; line-height: 1.5; margin-top: 40px; padding-top: 12px; }
  `;
}

function buildDefaultInvoiceHTML(a, c, s) {
  const totaal = appointmentTotal(a) - (a.korting||0);
  const buckets = computeInvoiceBtwBuckets(a);
  const dayName = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'][new Date(a.invoiceDate || a.date).getDay()];
  const datum = `${dayName} ${fmtDate(a.invoiceDate || a.date)}`;
  return `
    <div class="factuur-toprow">
      <div class="factuur-header">
        ${s.logoUrl ? `<img src="${escapeHtml(s.logoUrl)}" alt="Logo" class="factuur-logo" crossorigin="anonymous">` : ''}
        <div class="factuur-brand">
          <div class="factuur-brand-title">${escapeHtml(s.salonName||'')}</div>
        </div>
      </div>
      <div class="factuur-aan">
        <strong>Aan:</strong>
        <div>${escapeHtml(clientFullName(c)||'')}</div>
        ${c?.address ? `<div>${escapeHtml(c.address)}</div>` : ''}
        ${(c?.dossier?.postal || c?.city) ? `<div>${escapeHtml(c?.dossier?.postal||'')} ${escapeHtml((c?.city||'').toString().toUpperCase())}</div>` : ''}
      </div>
    </div>
    <div class="factuur-metasingle">
      <div><strong>Factuurnummer:</strong> ${escapeHtml(a.invoiceNumber)}</div>
      <div><strong>Factuurdatum:</strong> ${escapeHtml(datum)}</div>
      ${getInvoiceProLinesHTML(s)}
    </div>
    <table class="factuur-tabel">
      <thead><tr>
        <th style="width:70px;">Aantal</th>
        <th>Omschrijving</th>
        <th class="amount">Stukprijs</th>
        <th class="amount">Prijs incl. korting</th>
      </tr></thead>
      <tbody>
        ${(a.items||[]).map(it => `<tr>
          <td>${it.qty||1}</td>
          <td>${escapeHtml(describeItem(it))}</td>
          <td class="amount">${fmtMoney(it.price)}</td>
          <td class="amount">${fmtMoney((it.qty||1)*(it.price||0))}</td>
        </tr>`).join('')}
        ${a.korting ? `<tr><td></td><td>Korting</td><td></td><td class="amount">- ${fmtMoney(a.korting)}</td></tr>`:''}
      </tbody>
    </table>
    <div class="factuur-totals">
      <div class="factuur-totals-line factuur-totals-strong"><span>Totaal te betalen:</span><span>${fmtMoney(totaal)}</span></div>
      ${[9,21,0].filter(v => buckets[v]).map(v => `
        <div class="factuur-totals-line"><span>${v}% BTW inbegrepen:</span><span>${fmtMoney(buckets[v].btw)}</span></div>
      `).join('')}
      <div class="factuur-totals-line"><span>Betaalwijze:</span><span>${escapeHtml(getBetaalwijzeLabel(a.betaalwijze||'pin'))}</span></div>
    </div>
    ${a.factuurTekst ? `<div class="factuur-extra">${escapeHtml(a.factuurTekst).replace(/\n/g,'<br>')}</div>` : ''}
    <div class="factuur-footer">
      ${escapeHtml(s.salonName||'')} ${s.address?'- '+escapeHtml(s.address):''} ${s.postal?'- '+escapeHtml(s.postal):''} ${s.city?' - '+escapeHtml(s.city):''} ${s.phone?'- '+escapeHtml(s.phone):''}<br>
      ${s.btwNummer?"BTW nummer: "+escapeHtml(s.btwNummer):''}${s.kvk?((s.btwNummer?" - ":"")+"KvK: "+escapeHtml(s.kvk)):""}${s.iban?" - IBAN: "+escapeHtml(s.iban):""}
    </div>
  `;
}

function downloadFactuurHtmlBijlage(apptId) {
  const a = DB.appointments.find(x => x.id === apptId);
  if (!a) return;
  const c = findClient(a.clientId);
  const inner = a.invoiceHtml || buildDefaultInvoiceHTML(a, c, DB.settings);
  const num = a.invoiceNumber || 'factuur';
  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"><title>Factuur ${num}</title>
  <style>${getInvoiceDocumentCSS()}</style></head>
  <body><div class="factuur-paper">${inner}</div></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const u = URL.createObjectURL(blob);
  const l = document.createElement('a');
  l.href = u;
  l.download = `Factuur-${num}.html`;
  l.click();
  setTimeout(() => URL.revokeObjectURL(u), 2000);
}

function bindFactuurRichToolbar(editor) {
  const bar = $('#facRichToolbar');
  if (!bar) return;
  const run = (cmd, v) => {
    try { document.execCommand(cmd, false, v || null); } catch (e) {}
    editor?.focus();
  };
  bar.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('mousedown', e => e.preventDefault());
    btn.addEventListener('click', () => run(btn.dataset.cmd, btn.dataset.val));
  });
  $('#facSrcToggle')?.addEventListener('click', e => { e.preventDefault(); showToast('Selecteer tekst en gebruik B/I/U. Voor rauwe HTML: F12 → Elements in de browser.'); });
}

function doFactuurPrint() {
  const a = DB.appointments.find(x => x.id === currentFacturaApptId);
  if (!a) return;
  const w = window.open('', '_blank');
  const el = factuurViewMode === 'edit' ? $('#factuurEditor') : $('#factuurPaper');
  const bodyHtml = el ? el.classList.contains('factuur-paper') ? el.outerHTML : `<div class="factuur-paper">${el.innerHTML}</div>` : '';
  w.document.write(`<html><head><meta charset="utf-8"><title>Factuur ${a.invoiceNumber}</title>
    <style>${getInvoiceDocumentCSS()}</style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 200);
}

function renderFactuurPage() {
  const a = DB.appointments.find(x => x.id === currentFacturaApptId);
  if (!a) return;
  const c = findClient(a.clientId);
  const s = DB.settings;
  const totaal = appointmentTotal(a) - (a.korting||0);
  const defaultHtml = buildDefaultInvoiceHTML(a, c, s);
  const baseHtml = a.invoiceHtml || defaultHtml;

  $('#facTitle').textContent = `Factuur ${a.invoiceNumber}`;
  const el = $('#factuurContent');

  if (factuurViewMode === 'edit') {
    el.innerHTML = `
      <div class="factuur-toolbar factuur-toolbar--edit">
        <button class="btn ghost small" type="button" id="facEditCancel">Terug zonder opslaan</button>
        <button class="btn primary small" type="button" id="facEditSave">Factuur opslaan</button>
        <button class="btn ghost small" type="button" id="facEditReset">ALLE aanpassingen ongedaan maken</button>
        <span style="flex:1;"></span>
        <span class="fac-edit-hint">Klik in de factuur, typ, verwijder regels, of selecteer en gebruik B / I / U. Opslaan sluit bewerken.</span>
      </div>
      <div class="fac-rich-toolbar" id="facRichToolbar" role="toolbar">
        <button type="button" class="fac-tb" data-cmd="bold" title="Vet">B</button>
        <button type="button" class="fac-tb" data-cmd="italic" title="Cursief">I</button>
        <button type="button" class="fac-tb" data-cmd="underline" title="Onderstreept">U</button>
        <span class="fac-tb-sep"></span>
        <button type="button" class="fac-tb" data-cmd="insertUnorderedList" title="Lijst">•</button>
        <button type="button" class="fac-tb" data-cmd="insertOrderedList" title="Genummerd">1.</button>
        <span class="fac-tb-sep"></span>
        <button type="button" class="fac-tb" data-cmd="justifyLeft" title="Links">L</button>
        <button type="button" class="fac-tb" data-cmd="justifyCenter" title="Gecentreerd">M</button>
        <span class="fac-tb-sep"></span>
        <button type="button" class="fac-tb" id="facSrcToggle" title="Brontekst">&lt;/&gt;</button>
      </div>
      <div class="factuur-paper factuur-paper--edit" id="factuurEditor" contenteditable="true">${a.invoiceHtml != null ? a.invoiceHtml : defaultHtml}</div>
    `;
    const ed = $('#factuurEditor');
    bindFactuurRichToolbar(ed);
    $('#facEditCancel').addEventListener('click', () => {
      factuurViewMode = 'view';
      // geen a.invoiceHtml save — oude blijft
      renderFactuurPage();
    });
    $('#facEditSave').addEventListener('click', () => {
      a.invoiceHtml = ed.innerHTML;
      saveData(DB);
      factuurViewMode = 'view';
      showToast('Factuur opgeslagen');
      renderFactuurPage();
    });
    $('#facEditReset').addEventListener('click', () => {
      if (!confirm('Weet u zeker? Alle aangepaste factuurtekst wordt teruggezet op de rekening uit de administratie (standaard factuur).')) return;
      delete a.invoiceHtml;
      saveData(DB);
      ed.innerHTML = buildDefaultInvoiceHTML(a, c, s);
    });
    return;
  }

  el.innerHTML = `
    <div class="factuur-toolbar">
      <button class="btn ghost small" type="button" id="facPrint">🖨 Factuur printen</button>
      <button class="btn ghost small" type="button" id="facDownloadBijl">⬇ Download (voor bijlage)</button>
      <button class="btn ghost small" type="button" id="facMail">@ Factuur e-mailen</button>
      <button class="btn ghost small" type="button" id="facEditWysi">📝 Factuur aanpassen</button>
    </div>
    <div class="factuur-paper" id="factuurPaper">${baseHtml}</div>
  `;

  $('#facPrint').addEventListener('click', doFactuurPrint);
  $('#facDownloadBijl')?.addEventListener('click', () => { downloadFactuurHtmlBijlage(a.id); showToast('Factuur opgeslagen als bestand. Open → Afdrukken → PDF, of voeg de HTML zelf als bijlage toe.'); });
  $('#facEditWysi').addEventListener('click', () => {
    factuurViewMode = 'edit';
    renderFactuurPage();
  });

  $('#facMail').addEventListener('click', () => {
    if (!c?.email) { showToast('Geen e-mailadres bekend voor deze klant'); return; }
    downloadFactuurHtmlBijlage(a.id);
    const ctx = { client: c, appointment: a, factuurnummer: a.invoiceNumber, totaal: fmtMoney(totaal), betaalwijze: getBetaalwijzeLabel(a.betaalwijze||'pin') };
    const m = buildInvoiceEmail(c, a, ctx);
    const bcc = s.bccCopy && s.email ? s.email : '';
    logSentMessage(c.id, 'factuur', m.subject);
    openMailto(c.email, m.subject, m.body, bcc);
    showToast('E-mail opent met tekst vóór de afspraak. Het factuurbestand (Factuur-'+a.invoiceNumber+'.html) staat in Downloads — voeg toe als PDF (Afdrukken in browser) of als bijlage.');
  });
}

/* =========================================================
   AFREKENEN / BON  (volwaardige pagina, geen modal)
   ========================================================= */
let currentAfrId = null;
let currentAfrCat = 'vandaag';   // welke categorie geselecteerd in linker lijst
let currentAfrKorting = 0;
let currentAfrBetaalwijze = '';

/* Betaalwijzen onder "Anders ▾" - alleen wat de salon écht gebruikt */
const ANDERS_OPTIONS = [
  { value: 'tikkie-verzoek', label: 'Tikkie verzoek',  paid: false, status: 'gepland'  },
  { value: 'tikkie-betaald', label: 'Tikkie betaald',  paid: true,  status: 'afgerond' },
  { value: 'over-te-maken',  label: 'Over te maken',   paid: false, status: 'gepland'  },
  { value: 'overgemaakt',    label: 'Overgemaakt',     paid: true,  status: 'afgerond' },
  { value: 'contant',        label: 'Contant',         paid: true,  status: 'afgerond' },
];
function getBetaalwijzeLabel(v) {
  if (v === 'pin') return 'Pin';
  if (v === 'overige') return 'Overige (open)';
  const found = ANDERS_OPTIONS.find(o => o.value === v);
  return found ? found.label : (v || '—');
}

/** Maakt productvoorraad ongedaan na betaling (Pin wissen of afspraak verwijderen). */
function unapplyProductStockForAppointment(a) {
  (a.items || []).forEach(it => {
    if (it.kind !== 'product') return;
    const p = findProduct(it.refId);
    if (!p) return;
    if (a.stockApplied && !it.addedAfterCheckout) {
      p.stock = (p.stock || 0) + (it.qty || 1);
    } else if (it.addedAfterCheckout) {
      p.stock = (p.stock || 0) + (it.qty || 1);
    }
  });
  a.stockApplied = false;
}

function applyBonClientNameFromInput(c, raw) {
  const s = (raw || '').trim();
  if (!s) return;
  const parts = s.split(/\s+/);
  if (parts.length === 1) {
    c.firstName = parts[0];
  } else {
    c.lastName = parts.pop();
    c.firstName = parts.join(' ');
  }
}

let andersDocClickBound = false;

function openAfrekenen(id) {
  currentAfrId = id;
  currentAfrCat = 'diensten'; // niet meer 'vandaag'
  currentAfrKorting = 0;
  currentAfrBetaalwijze = '';
  showView('afrekenen');
  renderAfrekenen();
}

function renderAfrekenen() {
  const id = currentAfrId;
  const a = DB.appointments.find(x => x.id === id);
  if (!a) return;
  if (a.status === 'verwijderd') {
    $('#afrTitle').textContent = 'Afrekenen – verwijderde afspraak';
    $('#afrekenenContent').innerHTML = `
      <div class="card" style="max-width:520px; margin:0 auto;">
        <div class="card-body" style="padding:24px;">
          <p>Deze afspraak is gemarkeerd als <strong>verwijderd</strong>${a.verwijderdOp ? ` op ${escapeHtml(fmtDate(a.verwijderdOp))}` : ''} en kan niet meer worden afgerekend.</p>
          <button class="btn primary" id="afrVerwijderdTerug">Naar agenda</button>
        </div>
      </div>`;
    $('#afrVerwijderdTerug').addEventListener('click', () => showView('agenda'));
    return;
  }
  if (currentAfrBetaalwijze === '' && a.betaalwijze) currentAfrBetaalwijze = a.betaalwijze;
  if (currentAfrKorting === 0 && a.korting) currentAfrKorting = a.korting;
  const c = findClient(a.clientId);
  const items = a.items || [];
  const subtotal = items.reduce((s, it) => s + (it.qty||1)*(it.price||0), 0);
  const naTotaal = Math.max(0, subtotal - currentAfrKorting);
  const isAfgerond = a.status === 'afgerond' || a.paid;

  $('#afrTitle').textContent = `Afrekenen – ${clientFullName(c)}` + (isAfgerond ? ' (al afgerekend - bewerken)' : '');

  // Categorieën in linker kolom (geen 'Vandaag' meer)
  const categorieLinks = [
    { key: 'diensten',           label: 'Diensten' },
    { key: 'aanvullend',         label: 'Aanvullende diensten' },
    { key: 'producten',          label: 'Producten' },
    { key: 'pakketten',          label: 'Pakketten' },
    { key: 'cadeaubon',          label: 'Cadeaubon' },
  ];

  // Wat tonen we rechts in het Verkoop-paneel?
  let verkoopRight = '';
  if (currentAfrCat === 'diensten') {
    verkoopRight = DB.treatmentCategories.map(cat => {
      const treatments = DB.treatments.filter(t => t.category === cat);
      if (!treatments.length) return '';
      return `<div class="afr-cat-block">
        <div class="afr-cat-title">${escapeHtml(cat)}</div>
        ${treatments.map(t => `<button class="afr-item-row" data-add="t:${t.id}">
          <span>${escapeHtml(t.name)}</span><span>${fmtMoney(t.price)}</span>
        </button>`).join('')}
      </div>`;
    }).join('') || '<div class="empty" style="padding:24px;">Geen diensten gevonden.</div>';
  } else if (currentAfrCat === 'aanvullend') {
    // Aanvullende diensten = behandelingen met categorie 'Overige behandelingen' of 'Aanvullende diensten'
    const aanvulCats = ['Overige behandelingen','Aanvullende diensten'];
    const ts = DB.treatments.filter(t => aanvulCats.includes(t.category));
    verkoopRight = ts.length ? `<div class="afr-cat-block">
      <div class="afr-cat-title">Aanvullende diensten</div>
      ${ts.map(t => `<button class="afr-item-row" data-add="t:${t.id}">
        <span>${escapeHtml(t.name)}</span><span>${fmtMoney(t.price)}</span>
      </button>`).join('')}
    </div>` : '<div class="empty" style="padding:24px;">Geen aanvullende diensten ingesteld.</div>';
  } else if (currentAfrCat === 'producten') {
    verkoopRight = (DB.productCategories||[]).map(cat => {
      const prods = DB.products.filter(p => p.category === cat);
      if (!prods.length) return '';
      return `<div class="afr-cat-block">
        <div class="afr-cat-title">${escapeHtml(cat)}</div>
        ${prods.map(p => `<button class="afr-item-row" data-add="p:${p.id}">
          <span>${escapeHtml(p.name)}</span><span>${fmtMoney(p.price)}</span>
        </button>`).join('')}
      </div>`;
    }).join('') || '<div class="empty" style="padding:24px;">Geen producten gevonden.</div>';
  } else if (currentAfrCat === 'pakketten') {
    const pakketten = (DB.packages || []);
    verkoopRight = pakketten.length ? `<div class="afr-cat-block">
      <div class="afr-cat-title">Pakketten</div>
      ${pakketten.map(p => `<button class="afr-item-row" data-add="pkg:${p.id}">
        <span>${escapeHtml(p.name)}</span><span>${fmtMoney(p.price)}</span>
      </button>`).join('')}
    </div>` : `<div class="empty" style="padding:24px;">Nog geen pakketten ingesteld.<br><br><button class="btn ghost small" id="afrAddPakket">+ Pakket aanmaken</button></div>`;
  } else if (currentAfrCat === 'cadeaubon') {
    verkoopRight = `<div style="padding:18px;">
      <div class="afr-cat-title" style="margin-bottom:12px;">Cadeaubon verkopen</div>
      <label style="display:block; margin-bottom:8px; font-size:13px; color:var(--muted);">Bedrag (€)</label>
      <input type="number" id="cadeauBedrag" value="50" step="5" min="5" style="width:100%; padding:8px 10px; border:1px solid var(--border); border-radius:6px; margin-bottom:12px;" />
      <label style="display:block; margin-bottom:8px; font-size:13px; color:var(--muted);">Code (optioneel)</label>
      <input type="text" id="cadeauCode" placeholder="Bijv. SALON-2026-XYZ" style="width:100%; padding:8px 10px; border:1px solid var(--border); border-radius:6px; margin-bottom:12px;" />
      <button class="btn primary" id="afrAddCadeau" style="width:100%;">+ Cadeaubon aan bon</button>
    </div>`;
  }

  $('#afrekenenContent').innerHTML = `
    <div class="afr-grid">
      <!-- LINKS: Verkoop -->
      <div class="card">
        <div class="card-title">Verkoop</div>
        <div class="card-body no-pad">
          <div class="afr-search">
            <input type="search" id="afrSearch" placeholder="🔍  Zoek dienst of product..." />
          </div>
          <div class="afr-split">
            <div class="afr-cats">
              ${categorieLinks.map(c => `<button class="afr-cat-link ${currentAfrCat===c.key?'active':''}" data-afr-cat="${c.key}">${escapeHtml(c.label)}</button>`).join('')}
            </div>
            <div class="afr-cat-content" id="afrCatContent">
              ${verkoopRight || '<div class="empty" style="padding:24px;">Selecteer een categorie.</div>'}
            </div>
          </div>
        </div>
      </div>

      <!-- RECHTS: Bon -->
      <div class="card">
        <div class="card-title">Bon</div>
        <div class="card-body no-pad">
          <div class="bon-client-bar">
            <input type="text" value="${escapeHtml(clientFullName(c))}" id="bonClientName" />
            <input type="date" value="${a.date}" id="bonDate" />
          </div>
          <table class="bon-table">
            <thead><tr><th>Aantal</th><th>Product</th><th>Stukprijs</th><th>Totaal</th><th></th></tr></thead>
            <tbody>
              ${items.length ? items.map((it, idx) => `<tr>
                <td><input type="number" min="1" value="${it.qty||1}" data-bon-qty="${idx}" style="width:50px; padding:3px 6px; border:1px solid var(--border); border-radius:4px;" /></td>
                <td>${escapeHtml(describeItem(it))}</td>
                <td><input type="number" step="0.01" value="${(it.price||0).toFixed(2)}" data-bon-price="${idx}" style="width:80px; padding:3px 6px; border:1px solid var(--border); border-radius:4px;" /></td>
                <td class="amount">${fmtMoney((it.qty||1)*(it.price||0))}</td>
                <td><button class="row-btn delete" data-bon-remove="${idx}">✕</button></td>
              </tr>`).join('') : `<tr><td colspan="5" class="empty" style="padding:30px;">Voeg items toe via de Verkoop kolom links.</td></tr>`}
            </tbody>
          </table>
          ${currentAfrKorting > 0 ? `<div class="bon-korting-line">Korting: <span>- ${fmtMoney(currentAfrKorting)}</span></div>` : ''}
          ${a.paid && a.betaalwijze ? `
          <div class="bon-betalingen">
            <div class="bon-betalingen-title">Betalingen</div>
            <div class="bon-pay-line">
              <span class="bon-pay-d">${escapeHtml(fmtDate((a.afgerondAt && a.afgerondAt.length >= 10) ? a.afgerondAt.slice(0, 10) : a.date))}</span>
              <span class="bon-pay-m">${escapeHtml(getBetaalwijzeLabel(a.betaalwijze))}</span>
              <span class="bon-pay-a">${fmtMoney(naTotaal)}</span>
              <button type="button" class="row-btn delete bon-pay-remove" id="bonRemovePayment" title="Betaling verwijderen">✕</button>
            </div>
            <div class="bon-pay-totalline"><span>Totaal</span><strong>${fmtMoney(naTotaal)}</strong></div>
          </div>` : ''}
          <div class="bon-bottom-bar">
            <div class="bon-pay-buttons">
              <button class="pay-btn ${currentAfrBetaalwijze==='overige'?'active':''}" data-pay="overige">Overige</button>
              <button class="pay-btn ${currentAfrBetaalwijze==='pin'?'active':''}" data-pay="pin">Pin</button>
              <div class="anders-wrap">
                <button class="pay-btn ${ANDERS_OPTIONS.some(o=>o.value===currentAfrBetaalwijze)?'active':''}" id="bonAndersBtn">${
                  ANDERS_OPTIONS.find(o=>o.value===currentAfrBetaalwijze)?.label || 'Anders'
                } ▾</button>
                <div class="anders-dropdown hidden" id="andersDropdown">
                  ${ANDERS_OPTIONS.map(o => `<button class="anders-item ${currentAfrBetaalwijze===o.value?'active':''}" data-anders="${o.value}">${escapeHtml(o.label)}${!o.paid?' <span style="color:var(--muted); font-size:11px;">(open)</span>':''}</button>`).join('')}
                </div>
              </div>
            </div>
            <div class="bon-amounts-right">
              <div class="bon-totaal">€ ${(a.paid ? 0 : naTotaal).toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
          <p class="bon-noshow">
            <button type="button" class="link-danger" id="bonMarkVerwijderd">Geen opkomst — afspraak als verwijderd markeren</button>
          </p>
        </div>
      </div>
    </div>
  `;

  function commitBonAfronding() {
    const opt = ANDERS_OPTIONS.find(o => o.value === currentAfrBetaalwijze);
    let isPaid, newStatus;
    if (currentAfrBetaalwijze === 'pin')      { isPaid = true;  newStatus = 'afgerond'; }
    else if (currentAfrBetaalwijze === 'overige') { isPaid = false; newStatus = 'gepland'; }
    else if (opt)                              { isPaid = opt.paid; newStatus = opt.status; }
    else                                       { isPaid = true; newStatus = 'afgerond'; }

    a.status        = newStatus;
    a.paid          = isPaid;
    a.betaalwijze   = currentAfrBetaalwijze;
    a.korting       = currentAfrKorting;
    a.afgerondAt    = isPaid ? new Date().toISOString() : null;

    if (!a.stockApplied) {
      a.items.forEach(it => {
        if (it.kind === 'product' && !it.addedAfterCheckout) {
          const p = findProduct(it.refId);
          if (p) p.stock = Math.max(0, (p.stock||0) - (it.qty||1));
        }
      });
      a.stockApplied = true;
    }

    saveData(DB);
    showToast(`${isPaid ? 'Afgerekend' : 'Bon opgeslagen (open)'}: ${getBetaalwijzeLabel(currentAfrBetaalwijze)} – ${fmtMoney(naTotaal)}`);
    if (isPaid) showAfrondPopup(a.id);
    else renderAfrekenen();
  }

  function removeBonPayment() {
    unapplyProductStockForAppointment(a);
    a.paid = false;
    a.betaalwijze = '';
    a.afgerondAt = null;
    a.status = 'gepland';
    currentAfrBetaalwijze = '';
    saveData(DB);
    renderAfrekenen();
    renderAgenda();
    showToast('Betaling verwijderd — bon staat weer open');
  }

  // ---- Events ----

  // Linker categorie-links
  $$('.afr-cat-link').forEach(btn => btn.addEventListener('click', () => {
    currentAfrCat = btn.dataset.afrCat;
    renderAfrekenen();
  }));

  // Item toevoegen vanuit Verkoop kolom (dienst, product, pakket)
  $$('[data-add]').forEach(btn => btn.addEventListener('click', () => {
    const [kind, refId] = btn.dataset.add.split(':');
    let ref;
    if (kind === 't') ref = findTreatment(refId);
    else if (kind === 'p') ref = findProduct(refId);
    else if (kind === 'pkg') ref = (DB.packages||[]).find(x => x.id === refId);
    if (!ref) return;

    const newItem = {
      kind: kind==='t' ? 'treatment' : (kind==='p' ? 'product' : 'package'),
      refId,
      savedName: ref.name,
      qty: 1,
      price: ref.price,
      addedAfterCheckout: isAfgerond,  // markeer als naderhand toegevoegd
    };
    a.items.push(newItem);

    // Voor afgeronde afspraken: voorraad direct verminderen (anders pas bij afronden)
    if (isAfgerond && newItem.kind === 'product') {
      const p = findProduct(refId);
      if (p) p.stock = Math.max(0, (p.stock||0) - 1);
    }

    saveData(DB);
    renderAfrekenen();
    if (isAfgerond) showToast(`${ref.name} bijgeboekt op afgeronde bon`);
  }));

  // Cadeaubon toevoegen
  $('#afrAddCadeau')?.addEventListener('click', () => {
    const bedrag = Number($('#cadeauBedrag').value) || 0;
    const code = $('#cadeauCode').value.trim() || `BON-${Date.now().toString().slice(-6)}`;
    if (bedrag <= 0) return showToast('Vul een geldig bedrag in');
    a.items.push({
      kind: 'cadeaubon',
      refId: 'cadeau',
      savedName: `Cadeaubon ${code}`,
      qty: 1,
      price: bedrag,
    });
    if (!DB.cadeaubonnen) DB.cadeaubonnen = [];
    DB.cadeaubonnen.push({ code, bedrag, datum: todayISO(), uitgegeven: false, klantId: a.clientId });
    saveData(DB); renderAfrekenen();
    showToast(`Cadeaubon ${code} aan bon toegevoegd`);
  });

  // Pakket aanmaken (snelle prompt)
  $('#afrAddPakket')?.addEventListener('click', () => {
    const name = prompt('Naam van het pakket:'); if (!name?.trim()) return;
    const price = Number(prompt('Prijs (€):', '100')); if (!price || price<=0) return;
    if (!DB.packages) DB.packages = [];
    DB.packages.push({ id: uid('pkg'), name: name.trim(), price });
    saveData(DB); renderAfrekenen();
  });

  // Zoekveld filter
  $('#afrSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      $$('.afr-item-row', $('#afrCatContent')).forEach(row => row.style.display = '');
      return;
    }
    $$('.afr-item-row', $('#afrCatContent')).forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  // Aantal/prijs aanpassen
  $$('[data-bon-qty]').forEach(inp => inp.addEventListener('change', () => {
    a.items[Number(inp.dataset.bonQty)].qty = Math.max(1, Number(inp.value)||1);
    saveData(DB); renderAfrekenen();
  }));
  $$('[data-bon-price]').forEach(inp => inp.addEventListener('change', () => {
    a.items[Number(inp.dataset.bonPrice)].price = Math.max(0, Number(inp.value)||0);
    saveData(DB); renderAfrekenen();
  }));

  // Item verwijderen
  $$('[data-bon-remove]').forEach(btn => btn.addEventListener('click', () => {
    a.items.splice(Number(btn.dataset.bonRemove), 1);
    saveData(DB); renderAfrekenen();
  }));

  // Betaalwijze: Pin / Overige — kies = direct afronden (zelfde als "Afrekenen & afsluiten")
  $$('[data-pay]').forEach(btn => btn.addEventListener('click', () => {
    const prev = currentAfrBetaalwijze;
    currentAfrBetaalwijze = btn.dataset.pay;
    $('#andersDropdown')?.classList.add('hidden');
    if (isAfgerond && prev === currentAfrBetaalwijze) {
      renderAfrekenen();
      return;
    }
    commitBonAfronding();
  }));

  // Anders ▾ dropdown toggle
  $('#bonAndersBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    $('#andersDropdown')?.classList.toggle('hidden');
  });
  // Klik op een Anders-optie — idem: direct afronden
  $$('[data-anders]').forEach(btn => btn.addEventListener('click', () => {
    const prev = currentAfrBetaalwijze;
    currentAfrBetaalwijze = btn.dataset.anders;
    $('#andersDropdown')?.classList.add('hidden');
    if (isAfgerond && prev === currentAfrBetaalwijze) {
      renderAfrekenen();
      return;
    }
    commitBonAfronding();
  }));
  if (!andersDocClickBound) {
    andersDocClickBound = true;
    document.addEventListener('click', e => {
      if (e.target.closest?.('.anders-wrap')) return;
      document.getElementById('andersDropdown')?.classList.add('hidden');
    });
  }

  $('#bonRemovePayment')?.addEventListener('click', removeBonPayment);

  $('#bonMarkVerwijderd')?.addEventListener('click', () => {
    if (!confirm('Weet je zeker? De afspraak wordt als verwijderd gemarkeerd (geen opkomst). In het overzicht bij de klant staat Verwijderd met de datum van vandaag.')) return;
    unapplyProductStockForAppointment(a);
    a.verwijderdOp = todayISO();
    a.status = 'verwijderd';
    a.paid = false;
    a.betaalwijze = '';
    a.afgerondAt = null;
    a.items = [];
    a.korting = 0;
    currentAfrKorting = 0;
    saveData(DB);
    showToast('Afspraak gemarkeerd als verwijderd');
    showView('agenda');
    renderAgenda();
  });

  $('#bonClientName').addEventListener('change', () => {
    applyBonClientNameFromInput(c, $('#bonClientName').value);
    saveData(DB);
    $('#afrTitle').textContent = `Afrekenen – ${clientFullName(c)}` + (isAfgerond ? ' (al afgerekend - bewerken)' : '');
  });
  $('#bonDate').addEventListener('change', () => {
    const nd = $('#bonDate').value;
    if (nd) a.date = nd;
    saveData(DB);
    renderAgenda();
    showToast('Datum opgeslagen');
  });
}

/* Popup na afrekenen — opties zoals in xlAgenda */
function showAfrondPopup(apptId) {
  openModal('De boeking is opgeslagen', `
    <div class="afrond-popup">
      <button class="afrond-opt" data-act="kopie">Kopie inplannen</button>
      <button class="afrond-opt" data-act="factuur">Factuur</button>
      <button class="afrond-opt" data-act="nieuw">Nieuwe afspraak maken</button>
      <button class="afrond-opt" data-act="afrekenen">Naar afrekenen</button>
      <button class="afrond-opt" data-act="agenda">Naar agenda</button>
      <button class="afrond-opt" data-act="reminder">Reminder sturen voor nieuwe afspraak</button>
    </div>
    <div style="text-align:right; margin-top:14px;">
      <button class="btn ghost" id="afrondClose">Sluiten</button>
    </div>
  `);
  $('#afrondClose').addEventListener('click', () => { closeModal(); showView('agenda'); });
  const appt = DB.appointments.find(x => x.id === apptId);
  document.querySelectorAll('.afrond-opt').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.act;
    closeModal();
    if (act === 'kopie')     openKopieModal(apptId);
    else if (act === 'factuur')   openFactuur(apptId);
    else if (act === 'nieuw')     { showView('agenda'); setTimeout(() => openAppointmentModal({ id:'', date: todayISO(), time:'10:00', clientId: appt?.clientId || '', items:[], status:'gepland', paid:false, notes:'' }), 200); }
    else if (act === 'afrekenen') openAfrekenen(apptId);
    else if (act === 'agenda')    showView('agenda');
    else if (act === 'reminder')  sendReminderForNewAppointment(apptId);
  }));
}

function sendReminderForNewAppointment(apptId) {
  const a = DB.appointments.find(x => x.id === apptId);
  if (!a) return;
  const c = findClient(a.clientId);
  if (!c?.email) { showToast('Geen e-mailadres'); return; }
  const tpl = getTemplate('invite_appointment');
  const subject = fillTokens(tpl.subject, { client: c });
  const body    = fillTokens(tpl.body,    { client: c });
  logSentMessage(c.id, 'uitnodiging', subject);
  openMailto(c.email, subject, body);
}

/* =========================================================
   KOPIE INPLANNEN
   ========================================================= */
function openKopieModal(id) {
  const a = DB.appointments.find(x => x.id === id);
  if (!a) return;
  /** Alleen behandelingen — producten en overige regels nooit meenemen. */
  const treatments = (a.items || []).filter(it => it.kind === 'treatment');
  if (!treatments.length) {
    showToast('Geen behandelingen om te kopiëren (alleen producten op deze afspraak).');
    return;
  }
  const weekOptions = [
    '<option value="" selected disabled>Selecteer een week</option>',
    '<option value="0">Dezelfde week</option>',
    ...Array.from({ length: 52 }, (_, i) => {
      const n = i + 1;
      const label = n === 1
        ? '1 week na de originele afspraak'
        : `${n} weken na de originele afspraak`;
      return `<option value="${n}">${label}</option>`;
    })
  ].join('');
  function commitKopie(wekenStr) {
    if (wekenStr === '' || wekenStr == null) return;
    const w = Number(wekenStr);
    if (Number.isNaN(w) || w < 0) return;
    const newDate = addWeeksToIsoDate(a.date, w);
    const newTime = a.time;
    const newApp = {
      id: uid('a'),
      date: newDate,
      time: newTime,
      clientId: a.clientId,
      items: treatments.map(it => ({ ...it })),
      status: 'gepland',
      paid: false,
      notes: a.notes || '',
    };
    DB.appointments.push(newApp);
    saveData(DB);
    agendaCurrentDate = newDate;
    closeModal();
    renderAgenda();
    showToast(`Kopie ingepland op ${fmtDate(newDate)} ${newTime}`);
  }
  openModal('Kopie inplannen', `
    <div class="form kopie-inplan" style="grid-template-columns:1fr;">
      <p class="kopie-intro">Er wordt een kopie van de bestaande reservering gemaakt om deze op een ander tijdstip in te plannen. Wanneer wilt u deze kopie inplannen?</p>
      <p style="font-size:13px; color:var(--muted); margin:0 0 12px;">Alleen behandelingen worden meegenomen (geen producten).</p>
      <ul class="kopie-trt-list">
        ${treatments.map(it => `<li>${escapeHtml(describeItem(it))}</li>`).join('')}
      </ul>
      <div class="kopie-field">
        <label class="kopie-week-label" for="kopieWekenSelect">Week kiezen</label>
        <select id="kopieWekenSelect" class="kopie-week-select kopie-week-select--dropdown" aria-label="Selecteer een week">
          ${weekOptions}
        </select>
      </div>
      <div class="kopie-actions kopie-actions--single">
        <button type="button" class="btn ghost" id="cancelKopie">Annuleren</button>
      </div>
    </div>
  `);
  $('#modalBox')?.classList.add('kopie-modal');
  $('#cancelKopie').addEventListener('click', closeModal);
  $('#kopieWekenSelect')?.addEventListener('change', (e) => {
    const v = e.target.value;
    if (v === '') return;
    commitKopie(v);
  });
}

/* =========================================================
   OPENINGSTIJDEN (beheer tab)
   ========================================================= */
function renderOpeningstijden() {
  const f = $('#openingsForm');
  if (!f) return;
  f.elements['openTime'].value  = DB.settings.openTime  || '08:30';
  f.elements['closeTime'].value = DB.settings.closeTime || '18:00';
  f.elements['weekSchemaEnabled'].checked = !!DB.settings.weekSchemaEnabled;
  f.elements['weekSchemaWorkOdd'].value = DB.settings.weekSchemaWorkOdd !== false ? 'odd' : 'even';
  renderWeekPreview();
}

function renderWeekPreview() {
  const preview = $('#weekSchemaPreview');
  if (!preview) return;
  if (!$('#openingsForm')?.elements['weekSchemaEnabled']?.checked) {
    preview.innerHTML = '<span style="color:var(--muted); font-size:13px;">Week-schema staat uit — je bent elke week beschikbaar.</span>';
    return;
  }
  const workOdd = $('#openingsForm')?.elements['weekSchemaWorkOdd']?.value !== 'even';
  const now = new Date();
  const chips = [];
  for (let i = -2; i <= 8; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i * 7);
    const wn = getWeekNumber(d);
    const isWork = workOdd ? (wn % 2 === 1) : (wn % 2 === 0);
    const label = `Week ${wn}${i === 0 ? ' (nu)' : ''}`;
    chips.push(`<span class="week-chip ${isWork ? 'werk' : 'vrij'}">${label} ${isWork ? '✓' : '–'}</span>`);
  }
  preview.innerHTML = chips.join('');
}

/* =========================================================
   RAPPORTAGE – Dagrapport
   ========================================================= */
let dagDate = todayISO();

/* =========================================================
   RAPPORTAGE – Gedeelde periode-filter helpers
   ========================================================= */
const NL_MONTHS = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];

const reportFilters = {
  bestedingen:    { mode:'month', month: new Date().getMonth(), year: new Date().getFullYear(), quarter: Math.floor(new Date().getMonth()/3), from: '', to: '' },
  omzetcategorie: { mode:'month', month: new Date().getMonth(), year: new Date().getFullYear(), quarter: Math.floor(new Date().getMonth()/3), from: '', to: '', soort:'all' },
  omzetdienst:    { mode:'month', month: new Date().getMonth(), year: new Date().getFullYear(), quarter: Math.floor(new Date().getMonth()/3), from: '', to: '', soort:'all' }
};

function getPeriodRange(f) {
  let start, end;
  if (f.mode === 'month') {
    start = new Date(f.year, f.month, 1);
    end   = new Date(f.year, f.month+1, 0);
  } else if (f.mode === 'quarter') {
    const m = f.quarter * 3;
    start = new Date(f.year, m, 1);
    end   = new Date(f.year, m+3, 0);
  } else if (f.mode === 'year') {
    start = new Date(f.year, 0, 1);
    end   = new Date(f.year, 11, 31);
  } else { // free
    start = f.from ? new Date(f.from) : new Date(new Date().getFullYear(),0,1);
    end   = f.to   ? new Date(f.to)   : new Date();
  }
  return {
    startISO: start.toISOString().slice(0,10),
    endISO: end.toISOString().slice(0,10),
    startNL: fmtDate(start.toISOString().slice(0,10)),
    endNL: fmtDate(end.toISOString().slice(0,10))
  };
}

function periodFilterCardHTML(rep) {
  const f = reportFilters[rep];
  const yearOpts = [];
  const curY = new Date().getFullYear();
  for (let y=curY+1; y>=2018; y--) yearOpts.push(`<option value="${y}" ${y===f.year?'selected':''}>${y}</option>`);
  const monthOpts = NL_MONTHS.map((m,i)=>`<option value="${i}" ${i===f.month?'selected':''}>${m}</option>`).join('');
  const quarterOpts = ['1e Kwartaal','2e Kwartaal','3e Kwartaal','4e Kwartaal'].map((q,i)=>`<option value="${i}" ${i===f.quarter?'selected':''}>${q}</option>`).join('');
  const titles = { bestedingen:'Bestedingen', omzetcategorie:'Omzet per categorie', omzetdienst:'Omzet per dienst of product' };

  const extraSoort = (rep==='omzetcategorie' || rep==='omzetdienst') ? `
    <div class="rap-row">
      <label class="rap-label">Soort:</label>
      <select class="rap-soort" data-rep="${rep}">
        <option value="all" ${f.soort==='all'?'selected':''}>Alles</option>
        <option value="treatment" ${f.soort==='treatment'?'selected':''}>Diensten</option>
        <option value="product" ${f.soort==='product'?'selected':''}>Producten</option>
      </select>
    </div>` : '';

  return `
    <div class="card rap-filter-card">
      <div class="card-title">${titles[rep]}</div>
      <div class="card-body">
        <div class="rap-row">
          <label class="rap-label">Datum bereik:</label>
          <div class="rap-period">
            <label class="rap-radio"><input type="radio" name="rap-mode-${rep}" value="month"   ${f.mode==='month'?'checked':''}> Maand</label>
            <label class="rap-radio"><input type="radio" name="rap-mode-${rep}" value="quarter" ${f.mode==='quarter'?'checked':''}> Kwartaal</label>
            <label class="rap-radio"><input type="radio" name="rap-mode-${rep}" value="year"    ${f.mode==='year'?'checked':''}> Jaar</label>
            <label class="rap-radio"><input type="radio" name="rap-mode-${rep}" value="free"    ${f.mode==='free'?'checked':''}> Vrije selectie</label>
          </div>
        </div>
        <div class="rap-row rap-period-controls">
          <span></span>
          <div class="rap-period-inputs">
            ${f.mode==='month' ? `
              <select class="rap-month" data-rep="${rep}">${monthOpts}</select>
              <select class="rap-year" data-rep="${rep}">${yearOpts.join('')}</select>` : ''}
            ${f.mode==='quarter' ? `
              <select class="rap-quarter" data-rep="${rep}">${quarterOpts}</select>
              <select class="rap-year" data-rep="${rep}">${yearOpts.join('')}</select>` : ''}
            ${f.mode==='year' ? `
              <select class="rap-year" data-rep="${rep}">${yearOpts.join('')}</select>` : ''}
            ${f.mode==='free' ? `
              <input type="date" class="rap-from" data-rep="${rep}" value="${f.from || new Date(f.year,0,1).toISOString().slice(0,10)}">
              <span style="padding:0 4px;">-</span>
              <input type="date" class="rap-to" data-rep="${rep}" value="${f.to || new Date(f.year,11,31).toISOString().slice(0,10)}">` : ''}
          </div>
        </div>
        ${extraSoort}
        <div class="rap-row">
          <label class="rap-label">Medewerker:</label>
          <select class="rap-medewerker"><option>Alle medewerkers</option></select>
        </div>
        <div class="rap-row">
          <span></span>
          <button class="btn primary small rap-zoeken" data-rep="${rep}">🔍 Zoeken</button>
        </div>
      </div>
    </div>`;
}

/* Donut SVG renderer */
function donutSVG(slices, size=240) {
  const total = slices.reduce((s,x)=>s+x.value, 0);
  if (!total) return `<div class="rap-donut-empty">Geen gegevens</div>`;
  const r = size/2 - 18;
  const cx = size/2, cy = size/2;
  let acc = 0;
  const colors = ['#3a7bd5','#f29c3a','#7bb86f','#d97aa6','#9b6bd9','#e8c244','#56b6c2','#c14b4b'];
  const paths = slices.map((s, idx) => {
    const start = acc/total * Math.PI * 2 - Math.PI/2;
    acc += s.value;
    const end   = acc/total * Math.PI * 2 - Math.PI/2;
    const large = (end-start) > Math.PI ? 1 : 0;
    const x1 = cx + Math.cos(start)*r, y1 = cy + Math.sin(start)*r;
    const x2 = cx + Math.cos(end)*r,   y2 = cy + Math.sin(end)*r;
    const pct = Math.round(s.value/total*100);
    const mid = (start+end)/2;
    const lx = cx + Math.cos(mid)*(r-25);
    const ly = cy + Math.sin(mid)*(r-25);
    return `
      <path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z"
            fill="${s.color || colors[idx % colors.length]}" stroke="white" stroke-width="2"></path>
      ${pct >= 4 ? `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="13" fill="white" font-weight="600">${pct}%</text>` : ''}`;
  }).join('');
  const innerR = r * 0.55;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${paths}
    <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="white"></circle>
  </svg>
  <div class="rap-donut-legend">
    ${slices.map((s,idx)=>`<div class="rap-legend-item">
      <span class="rap-legend-dot" style="background:${s.color || colors[idx % colors.length]}"></span>
      <span>${escapeHtml(s.label)}</span>
      <span class="rap-legend-amt">${fmtMoney(s.value)}</span>
    </div>`).join('')}
  </div>`;
}

/* =========================================================
   RAPPORTAGE – Dagrapport
   ========================================================= */
function renderDagrapport() {
  const trans = DB.appointments
    .filter(a => a.date === dagDate && a.status !== 'geannuleerd' && a.status !== 'verwijderd')
    .sort((a,b) => a.time.localeCompare(b.time));

  const totalOmzet     = trans.reduce((s,a) => s + appointmentTotal(a), 0);
  const totalOntvangen = trans.filter(a => a.paid).reduce((s,a) => s + appointmentTotal(a) - (a.korting||0), 0);
  const totalOpen      = trans.filter(a => !a.paid).reduce((s,a) => s + appointmentTotal(a), 0);

  const dayName = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'][new Date(dagDate).getDay()];

  const el = $('#dagContent');
  if (!el) return;

  el.innerHTML = `
    <div class="card rap-filter-card">
      <div class="card-title">Dagrapport</div>
      <div class="card-body">
        <div class="rap-row">
          <label class="rap-label">Datum:</label>
          <div class="rap-period-inputs">
            <button class="btn ghost small" id="dagPrev">‹</button>
            <button class="btn ghost small" id="dagToday">Vandaag</button>
            <input type="date" id="dagDate" value="${dagDate}">
            <button class="btn ghost small" id="dagNext">›</button>
          </div>
        </div>
        <div class="rap-row">
          <label class="rap-label">Medewerker:</label>
          <select class="rap-medewerker"><option>Alle medewerkers</option></select>
        </div>
        <div class="rap-row">
          <span></span>
          <button class="btn ghost small" id="printDag">🖨 Afdrukken</button>
        </div>
      </div>
    </div>

    <div class="card rap-result-card">
      <div class="card-title">Resultaten: ${dayName} ${fmtDate(dagDate)}</div>
      <div class="card-body">
        <div class="rap-stats">
          <div class="rap-stat"><span class="rap-stat-label">Aantal afspraken</span><span class="rap-stat-value">${trans.length}</span></div>
          <div class="rap-stat"><span class="rap-stat-label">Totale omzet</span><span class="rap-stat-value">${fmtMoney(totalOmzet)}</span></div>
          <div class="rap-stat"><span class="rap-stat-label">Ontvangen</span><span class="rap-stat-value">${fmtMoney(totalOntvangen)}</span></div>
          <div class="rap-stat"><span class="rap-stat-label">Openstaand</span><span class="rap-stat-value">${fmtMoney(totalOpen)}</span></div>
        </div>

        ${trans.length ? `
        <table class="data-table rap-table">
          <thead><tr><th>Tijd</th><th>Klant</th><th>Omschrijving</th><th class="amount">Bedrag</th><th>Betaling</th></tr></thead>
          <tbody>
            ${trans.map(a=>{
              const c = findClient(a.clientId);
              const tot = appointmentTotal(a);
              const items = (a.items||[]).map(it=>escapeHtml(describeItem(it))).join(', ');
              return `<tr>
                <td>${a.time}</td>
                <td>${escapeHtml(clientFullName(c))}</td>
                <td style="color:var(--muted); font-size:13px;">${items || '—'}</td>
                <td class="amount">${fmtMoney(tot)}</td>
                <td>${a.paid
                  ? `<span style="color:var(--green)">✓ ${escapeHtml(a.betaalwijze||'pin')}</span>`
                  : `<span class="pill openstaand">Openstaand</span>`}</td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot><tr>
            <td colspan="3" style="font-weight:600;">Totaal:</td>
            <td class="amount" style="font-weight:600;">${fmtMoney(totalOmzet)}</td>
            <td></td>
          </tr></tfoot>
        </table>` : `<div class="empty" style="padding:24px;">Geen afspraken op deze dag.</div>`}
      </div>
    </div>`;
}

/* =========================================================
   RAPPORTAGE – Bestedingen
   ========================================================= */
function renderBestedingen() {
  const f = reportFilters.bestedingen;
  const range = getPeriodRange(f);
  const trans = DB.appointments.filter(a =>
    a.status==='afgerond' &&
    a.date >= range.startISO &&
    a.date <= range.endISO
  );

  const totalOmzet = trans.reduce((s,a) => s + appointmentTotal(a) - (a.korting||0), 0);
  const uniqueClients = new Set(trans.map(a=>a.clientId)).size;

  const allItems = trans.flatMap(a => (a.items||[]).map(it => ({ ...it, _aid:a.id, _cid:a.clientId })));
  const beh = allItems.filter(it=>it.kind==='treatment');
  const prod = allItems.filter(it=>it.kind==='product');
  const omzetBeh  = beh.reduce((s,it)=>s+(it.qty||1)*(it.price||0),0);
  const omzetProd = prod.reduce((s,it)=>s+(it.qty||1)*(it.price||0),0);
  const totalCalc = omzetBeh + omzetProd;

  const behVisits = new Set(beh.map(it=>it._aid)).size;
  const prodVisits = new Set(prod.map(it=>it._aid)).size;
  const behClients = new Set(beh.map(it=>it._cid)).size;
  const prodClients = new Set(prod.map(it=>it._cid)).size;

  const slices = [];
  if (omzetBeh)  slices.push({ label:'Behandelingen', value: omzetBeh,  color:'#3a7bd5' });
  if (omzetProd) slices.push({ label:'Producten',     value: omzetProd, color:'#f29c3a' });

  const el = $('#bestContent');
  if (!el) return;
  el.innerHTML = `
    ${periodFilterCardHTML('bestedingen')}
    <div class="card rap-result-card">
      <div class="card-title">Resultaten: ${range.startNL} t/m ${range.endNL}</div>
      <div class="card-body">
        <div class="rap-stats">
          <div class="rap-stat"><span class="rap-stat-label">Aantal bezoeken</span><span class="rap-stat-value">${trans.length}</span></div>
          <div class="rap-stat"><span class="rap-stat-label">Aantal klanten</span><span class="rap-stat-value">${uniqueClients}</span></div>
          <div class="rap-stat"><span class="rap-stat-label">Omzet</span><span class="rap-stat-value">${fmtMoney(totalCalc)}</span></div>
        </div>
        <table class="data-table rap-table">
          <thead><tr><th>Soort</th><th>Totaal aantal</th><th>Aantal bezoeken</th><th>Aantal klanten</th><th class="amount">Omzet</th></tr></thead>
          <tbody>
            <tr><td>afspraak</td><td>${beh.reduce((s,i)=>s+(i.qty||1),0)}</td><td>${behVisits}</td><td>${behClients}</td><td class="amount">${fmtMoney(omzetBeh)}</td></tr>
            <tr><td>product</td><td>${prod.reduce((s,i)=>s+(i.qty||1),0)}</td><td>${prodVisits}</td><td>${prodClients}</td><td class="amount">${fmtMoney(omzetProd)}</td></tr>
          </tbody>
          <tfoot><tr><td colspan="4" style="font-weight:600;">Totaal:</td><td class="amount" style="font-weight:600;">${fmtMoney(totalCalc)}</td></tr></tfoot>
        </table>
      </div>
    </div>

    <div class="card rap-result-card">
      <div class="card-title">Omzet in behandelingen en producten</div>
      <div class="card-body rap-donut-wrap">
        ${donutSVG(slices)}
      </div>
    </div>`;
}

/* =========================================================
   RAPPORTAGE – Omzet per categorie
   ========================================================= */
function renderOmzetCategorie() {
  const f = reportFilters.omzetcategorie;
  const range = getPeriodRange(f);
  const trans = DB.appointments.filter(a =>
    a.status==='afgerond' &&
    a.date >= range.startISO &&
    a.date <= range.endISO
  );

  const byCat = {};
  let totalQty = 0, totalRev = 0;
  const visitsByCat = {}, clientsByCat = {};
  const btwBuckets = {}; // { 21: {incl, excl, btw}, 9: {...}, 0: {...} }

  trans.forEach(a => {
    (a.items||[]).forEach(it => {
      if (f.soort==='treatment' && it.kind!=='treatment') return;
      if (f.soort==='product'   && it.kind!=='product') return;
      const ref = it.kind==='treatment' ? findTreatment(it.refId) : findProduct(it.refId);
      const cat = ref?.category || 'Onbekend';
      if (!byCat[cat]) byCat[cat] = { qty:0, revenue:0 };
      const lineTotal = (it.qty||1)*(it.price||0);
      byCat[cat].qty += it.qty||1;
      byCat[cat].revenue += lineTotal;
      totalQty += it.qty||1;
      totalRev += lineTotal;
      if (!visitsByCat[cat]) visitsByCat[cat] = new Set();
      if (!clientsByCat[cat]) clientsByCat[cat] = new Set();
      visitsByCat[cat].add(a.id);
      clientsByCat[cat].add(a.clientId);

      const vat = ref?.vat ?? 21;
      const incl = lineTotal;
      const excl = incl / (1 + vat/100);
      const btw  = incl - excl;
      if (!btwBuckets[vat]) btwBuckets[vat] = { incl:0, excl:0, btw:0 };
      btwBuckets[vat].incl += incl;
      btwBuckets[vat].excl += excl;
      btwBuckets[vat].btw  += btw;
    });
  });

  const entries = Object.entries(byCat).sort((x,y)=>y[1].revenue-x[1].revenue);
  const totVisits = new Set(trans.map(a=>a.id)).size;
  const totClients = new Set(trans.map(a=>a.clientId)).size;

  const slices = entries.map(([cat,v]) => ({ label: cat, value: v.revenue }));

  const el = $('#catContent');
  if (!el) return;
  el.innerHTML = `
    ${periodFilterCardHTML('omzetcategorie')}
    <div class="card rap-result-card">
      <div class="card-title">Resultaten: ${range.startNL} t/m ${range.endNL}</div>
      <div class="card-body">
        <div class="rap-stats">
          <div class="rap-stat"><span class="rap-stat-label">Aantal bezoeken</span><span class="rap-stat-value">${totVisits}</span></div>
          <div class="rap-stat"><span class="rap-stat-label">Aantal klanten</span><span class="rap-stat-value">${totClients}</span></div>
          <div class="rap-stat"><span class="rap-stat-label">Omzet</span><span class="rap-stat-value">${fmtMoney(totalRev)}</span></div>
        </div>
        <table class="data-table rap-table">
          <thead><tr><th>Categorie</th><th>Totaal aantal</th><th>Aantal bezoeken</th><th>Aantal klanten</th><th class="amount">Omzet</th></tr></thead>
          <tbody>
            ${entries.length ? entries.map(([cat,v])=>`<tr>
              <td>${escapeHtml(cat)}</td>
              <td>${v.qty}</td>
              <td>${visitsByCat[cat].size}</td>
              <td>${clientsByCat[cat].size}</td>
              <td class="amount">${fmtMoney(v.revenue)}</td>
            </tr>`).join('') : `<tr><td colspan="5" class="empty">Geen gegevens.</td></tr>`}
          </tbody>
          <tfoot><tr><td colspan="4" style="font-weight:600;">Totaal:</td><td class="amount" style="font-weight:600;">${fmtMoney(totalRev)}</td></tr></tfoot>
        </table>

        <div class="rap-btw-block">
          <div class="rap-btw-title">BTW-overzicht</div>
          <table class="data-table rap-table">
            <thead><tr><th>BTW-tarief</th><th class="amount">Omzet excl. BTW</th><th class="amount">BTW-bedrag</th><th class="amount">Omzet incl. BTW</th></tr></thead>
            <tbody>
              ${[21, 9, 0].filter(v => btwBuckets[v]).map(v => `<tr>
                <td>${v}%</td>
                <td class="amount">${fmtMoney(btwBuckets[v].excl)}</td>
                <td class="amount">${fmtMoney(btwBuckets[v].btw)}</td>
                <td class="amount">${fmtMoney(btwBuckets[v].incl)}</td>
              </tr>`).join('') || `<tr><td colspan="4" class="empty">Geen gegevens.</td></tr>`}
            </tbody>
            <tfoot><tr>
              <td style="font-weight:600;">Totaal:</td>
              <td class="amount" style="font-weight:600;">${fmtMoney(Object.values(btwBuckets).reduce((s,b)=>s+b.excl,0))}</td>
              <td class="amount" style="font-weight:600;">${fmtMoney(Object.values(btwBuckets).reduce((s,b)=>s+b.btw,0))}</td>
              <td class="amount" style="font-weight:600;">${fmtMoney(Object.values(btwBuckets).reduce((s,b)=>s+b.incl,0))}</td>
            </tr></tfoot>
          </table>
        </div>
      </div>
    </div>

    <div class="card rap-result-card">
      <div class="card-title">Omzet per categorie</div>
      <div class="card-body rap-donut-wrap">
        ${slices.length ? donutSVG(slices) : `<div class="rap-donut-empty">Geen gegevens</div>`}
      </div>
    </div>`;
}

/* =========================================================
   RAPPORTAGE – Omzet per dienst/product
   ========================================================= */
function renderOmzetDienst() {
  const f = reportFilters.omzetdienst;
  const range = getPeriodRange(f);
  const trans = DB.appointments.filter(a =>
    a.status==='afgerond' &&
    a.date >= range.startISO &&
    a.date <= range.endISO
  );

  const byItem = {};
  let totalRev = 0;
  trans.forEach(a => {
    (a.items||[]).forEach(it => {
      if (f.soort==='treatment' && it.kind!=='treatment') return;
      if (f.soort==='product'   && it.kind!=='product') return;
      const name = describeItem(it);
      const cat = it.kind==='treatment'
        ? (findTreatment(it.refId)?.category || 'Diensten')
        : (findProduct(it.refId)?.category || 'Producten');
      const key = cat+'__'+name;
      if (!byItem[key]) byItem[key] = { cat, name, qty:0, revenue:0, visits:new Set(), clients:new Set() };
      byItem[key].qty += it.qty||1;
      byItem[key].revenue += (it.qty||1)*(it.price||0);
      byItem[key].visits.add(a.id);
      byItem[key].clients.add(a.clientId);
      totalRev += (it.qty||1)*(it.price||0);
    });
  });

  const byCat = {};
  Object.values(byItem).forEach(v => { (byCat[v.cat] = byCat[v.cat] || []).push(v); });

  const totVisits = new Set(trans.map(a=>a.id)).size;
  const totClients = new Set(trans.map(a=>a.clientId)).size;

  const slices = Object.entries(byCat)
    .map(([cat,items]) => ({ label: cat, value: items.reduce((s,i)=>s+i.revenue,0) }))
    .filter(s=>s.value>0);

  const el = $('#dienstContent');
  if (!el) return;
  el.innerHTML = `
    ${periodFilterCardHTML('omzetdienst')}
    <div class="card rap-result-card">
      <div class="card-title">Resultaten: ${range.startNL} t/m ${range.endNL}</div>
      <div class="card-body">
        <div class="rap-stats">
          <div class="rap-stat"><span class="rap-stat-label">Aantal bezoeken</span><span class="rap-stat-value">${totVisits}</span></div>
          <div class="rap-stat"><span class="rap-stat-label">Aantal klanten</span><span class="rap-stat-value">${totClients}</span></div>
          <div class="rap-stat"><span class="rap-stat-label">Omzet</span><span class="rap-stat-value">${fmtMoney(totalRev)}</span></div>
        </div>

        ${Object.entries(byCat).length ? Object.entries(byCat).map(([cat,items]) => {
          const catTotal = items.reduce((s,i)=>s+i.revenue,0);
          return `<div class="rap-cat-block">
            <div class="rap-cat-header">
              <span>${escapeHtml(cat)}</span>
              <span class="amount">${fmtMoney(catTotal)}</span>
            </div>
            <table class="data-table rap-table">
              <thead><tr><th>Dienst / Product</th><th>Totaal aantal</th><th>Aantal bezoeken</th><th>Aantal klanten</th><th class="amount">Omzet</th></tr></thead>
              <tbody>
                ${items.sort((a,b)=>b.revenue-a.revenue).map(i=>`<tr>
                  <td>${escapeHtml(i.name)}</td>
                  <td>${i.qty}</td>
                  <td>${i.visits.size}</td>
                  <td>${i.clients.size}</td>
                  <td class="amount">${fmtMoney(i.revenue)}</td>
                </tr>`).join('')}
              </tbody>
              <tfoot><tr><td colspan="4" style="font-weight:600;">Totaal van ${escapeHtml(cat)}:</td><td class="amount" style="font-weight:600;">${fmtMoney(catTotal)}</td></tr></tfoot>
            </table>
          </div>`;
        }).join('') : `<div class="empty" style="padding:24px;">Geen gegevens voor deze periode.</div>`}
      </div>
    </div>

    <div class="card rap-result-card">
      <div class="card-title">Omzet per dienst/product</div>
      <div class="card-body rap-donut-wrap">
        ${slices.length ? donutSVG(slices) : `<div class="rap-donut-empty">Geen gegevens</div>`}
      </div>
    </div>`;
}

/* =========================================================
   RAPPORTAGE (oud – wordt niet meer direct aangeroepen)
   ========================================================= */
function renderReport() {
  if (!$('#reportMonth').value) {
    const d = new Date();
    $('#reportMonth').value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }
  const month = $('#reportMonth').value;
  const trans = DB.appointments
    .filter(a => a.status === 'afgerond' && a.date.startsWith(month))
    .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));

  const totalRevenue = trans.reduce((s,a) => s + appointmentTotal(a), 0);
  const totalUnpaid  = trans.filter(a => !a.paid).reduce((s,a) => s + appointmentTotal(a), 0);

  $('#reportSummary').innerHTML = `
    <div class="kpi"><div class="label">Totale omzet</div><div class="value">${fmtMoney(totalRevenue)}</div></div>
    <div class="kpi"><div class="label">Transacties</div><div class="value">${trans.length}</div></div>
    <div class="kpi"><div class="label">Openstaand</div><div class="value">${fmtMoney(totalUnpaid)}</div></div>
  `;

  const byTreatment = {}, byProduct = {};
  trans.forEach(a => {
    (a.items||[]).forEach(it => {
      const map = it.kind==='treatment' ? byTreatment : byProduct;
      const key = describeItem(it);
      if (!map[key]) map[key]={qty:0,revenue:0};
      map[key].qty += it.qty||0;
      map[key].revenue += (it.qty||0)*(it.price||0);
    });
  });

  const renderAgg = (map) => {
    const entries = Object.entries(map).sort((a,b) => b[1].revenue - a[1].revenue);
    if (!entries.length) return `<tr><td colspan="3" class="empty">Geen verkopen.</td></tr>`;
    return entries.map(([name, v]) => `<tr><td>${escapeHtml(name)}</td><td>${v.qty}</td><td class="amount">${fmtMoney(v.revenue)}</td></tr>`).join('');
  };
  $('#reportTreatments').innerHTML = renderAgg(byTreatment);
  $('#reportProducts').innerHTML = renderAgg(byProduct);

  $('#reportTransactions').innerHTML = trans.length
    ? trans.map(a => (a.items||[]).map(it => `<tr>
        <td>${fmtDate(a.date)} ${escapeHtml(a.time)}</td>
        <td>${escapeHtml(clientFullName(findClient(a.clientId)))}</td>
        <td>${it.kind==='treatment'?'Behandeling':'Product'}</td>
        <td>${it.qty} × ${escapeHtml(describeItem(it))}</td>
        <td class="amount">${fmtMoney((it.qty||0)*(it.price||0))}</td>
      </tr>`).join('')).join('')
    : `<tr><td colspan="5" class="empty">Geen transacties.</td></tr>`;
}

function exportReportCsv() {
  const month = $('#reportMonth').value;
  const trans = DB.appointments.filter(a => a.status==='afgerond' && a.date.startsWith(month));
  const lines = ['datum,tijd,klant,type,omschrijving,aantal,bedrag'];
  trans.forEach(a => {
    (a.items||[]).forEach(it => {
      lines.push([a.date, a.time, csvEscape(clientFullName(findClient(a.clientId))), it.kind, csvEscape(describeItem(it)), it.qty, ((it.qty||0)*(it.price||0)).toFixed(2)].join(','));
    });
  });
  downloadFile(`rapportage-${month}.csv`, lines.join('\n'), 'text/csv');
}

/* =========================================================
   INSTELLINGEN
   ========================================================= */
const SETTINGS_PANELS = ['bedrijf','berichten','formulier','algemeen','data'];
let currentSettingsTab = 'bedrijf';
let currentTemplateKey = null;
let currentFormGroupIdx = null;
let currentFormFieldIdx = null;

function renderSettings() {
  switchSettingsTab(currentSettingsTab || 'bedrijf');
  $('#brandName').textContent = DB.settings.salonName || 'Salon';
}

function switchSettingsTab(tab) {
  currentSettingsTab = tab;
  SETTINGS_PANELS.forEach(p => {
    const el = document.getElementById('spanel-' + p);
    if (!el) return;
    el.style.display = (p === tab) ? 'block' : 'none';
    el.classList.toggle('hidden', p !== tab);
  });
  document.querySelectorAll('[data-view="instellingen"] .beheer-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.stab === tab)
  );
  if (tab === 'bedrijf')   renderBedrijfsgegevens();
  if (tab === 'berichten') renderBerichtenList();
  if (tab === 'formulier') renderFormulierBuilder();
  if (tab === 'algemeen')  renderAlgemeen();
  if (tab === 'data')      renderDataPanel();
}

/* ---------- Bedrijfsgegevens ---------- */
function renderBedrijfsgegevens() {
  const s = DB.settings;
  const el = $('#spanel-bedrijf');
  el.innerHTML = `
    <div class="card">
      <div class="card-title">Mijn bedrijfsgegevens</div>
      <div class="card-body">
        <form id="bedrijfForm" class="dossier-form">
          <div class="dos-row"><label>Salonnaam</label><input type="text" name="salonName" value="${escapeHtml(s.salonName||'')}"></div>
          <div class="dos-row"><label>Logo URL</label><input type="text" name="logoUrl" placeholder="https://..." value="${escapeHtml(s.logoUrl||'')}"></div>
          <div class="dos-row"><label>Adres</label><input type="text" name="address" value="${escapeHtml(s.address||'')}"></div>
          <div class="dos-row"><label>Postcode</label><input type="text" name="postal" value="${escapeHtml(s.postal||'')}"></div>
          <div class="dos-row"><label>Plaats</label><input type="text" name="city" value="${escapeHtml(s.city||'')}"></div>
          <div class="dos-row"><label>Telefoon</label><input type="text" name="phone" value="${escapeHtml(s.phone||'')}"></div>
          <div class="dos-row"><label>E-mail</label><input type="email" name="email" value="${escapeHtml(s.email||'')}"></div>
          <div class="dos-row"><label>Website</label><input type="text" name="website" value="${escapeHtml(s.website||'')}"></div>

          <h3 class="dos-section-title">Fiscale gegevens</h3>
          <div class="dos-row"><label>KvK-nummer</label><input type="text" name="kvk" value="${escapeHtml(s.kvk||'')}"></div>
          <div class="dos-row"><label>BTW-nummer</label><input type="text" name="btwNummer" value="${escapeHtml(s.btwNummer||'')}"></div>
          <div class="dos-row"><label>IBAN</label><input type="text" name="iban" value="${escapeHtml(s.iban||'')}"></div>
          <div class="dos-row"><label>Bank</label><input type="text" name="bank" value="${escapeHtml(s.bank||'')}"></div>
          <div class="dos-row"><label>Standaard BTW %</label><input type="number" name="vat" value="${s.vat||21}" min="0" max="100" step="0.1"></div>

          <h3 class="dos-section-title">Beroepsregistratie (op factuur)</h3>
          <div class="dos-row"><label>Naam (bijv. C.A. Brand)</label><input type="text" name="anbosNaam" value="${escapeHtml(s.anbosNaam||'')}" placeholder="C.A. Brand"></div>
          <div class="dos-row"><label>ANBOS Kernlidnummer</label><input type="text" name="anbosKernlidNummer" value="${escapeHtml(s.anbosKernlidNummer||'')}" placeholder="20430 (op aparte regel op factuur)"></div>
          <div class="dos-row"><label>AGB Zorgverlenercode</label><input type="text" name="agbZorgverlener" value="${escapeHtml(s.agbZorgverlener||'')}" placeholder="bv. 89-002069"></div>
          <div class="dos-row"><label>AGB Praktijkcode</label><input type="text" name="agbPraktijk" value="${escapeHtml(s.agbPraktijk||'')}" placeholder="bv. 89-(0)52182"></div>

          <h3 class="dos-section-title">Factuurnummering</h3>
          <div class="dos-row"><label>Volgend factuurnr</label><input type="number" name="invoiceCounter" value="${s.invoiceCounter||10000}" min="1"></div>

          <div style="margin-top:18px;">
            <button type="submit" class="btn primary">Opslaan</button>
          </div>
        </form>
      </div>
    </div>`;

  $('#bedrijfForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    Object.assign(DB.settings, {
      salonName: fd.get('salonName')||'',
      logoUrl:   fd.get('logoUrl')||'',
      address:   fd.get('address')||'',
      postal:    fd.get('postal')||'',
      city:      fd.get('city')||'',
      phone:     fd.get('phone')||'',
      email:     fd.get('email')||'',
      website:   fd.get('website')||'',
      kvk:       fd.get('kvk')||'',
      btwNummer: fd.get('btwNummer')||'',
      iban:      fd.get('iban')||'',
      bank:      fd.get('bank')||'',
      vat:       Number(fd.get('vat'))||21,
      anbosNaam:         fd.get('anbosNaam')||'',
      anbosKernlidNummer: fd.get('anbosKernlidNummer')||'',
      anbosKernlid:      '',
      agbZorgverlener: fd.get('agbZorgverlener')||'',
      agbPraktijk:     fd.get('agbPraktijk')||'',
      invoiceCounter:  Number(fd.get('invoiceCounter'))||10000,
    });
    saveData(DB);
    $('#brandName').textContent = DB.settings.salonName;
    showToast('Bedrijfsgegevens opgeslagen');
  });
}

/* ---------- Algemeen (BTW / openingstijden / weekschema) ---------- */
function renderAlgemeen() {
  const s = DB.settings;
  const el = $('#spanel-algemeen');
  el.innerHTML = `
    <div class="card">
      <div class="card-title">Algemene instellingen</div>
      <div class="card-body">
        <form id="algemeenForm" class="dossier-form">
          <div class="dos-row"><label>Openingstijd</label><input type="time" name="openTime" value="${escapeHtml(s.openTime||'08:30')}"></div>
          <div class="dos-row"><label>Sluitingstijd</label><input type="time" name="closeTime" value="${escapeHtml(s.closeTime||'18:00')}"></div>
          <div class="dos-row"><label>Werkdagen per week</label><input type="number" name="workdays" value="${s.workdays||5}" min="1" max="7"></div>
          <div class="dos-row"><label>Behandelplekken / stoelen</label><input type="number" name="seats" value="${s.seats||1}" min="1"></div>
          <div class="dos-row"><label>Week aan/af inschakelen</label>
            <select name="weekSchemaEnabled">
              <option value="true"  ${s.weekSchemaEnabled?'selected':''}>Ja</option>
              <option value="false" ${!s.weekSchemaEnabled?'selected':''}>Nee</option>
            </select>
          </div>
          <div class="dos-row"><label>Werkweek</label>
            <select name="weekSchemaWorkOdd">
              <option value="odd"  ${s.weekSchemaWorkOdd?'selected':''}>Oneven weeknummers (1, 3, 5…)</option>
              <option value="even" ${!s.weekSchemaWorkOdd?'selected':''}>Even weeknummers (2, 4, 6…)</option>
            </select>
          </div>
          <div style="margin-top:18px;">
            <button type="submit" class="btn primary">Opslaan</button>
          </div>
        </form>
      </div>
    </div>`;

  $('#algemeenForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    Object.assign(DB.settings, {
      openTime:  fd.get('openTime')||'08:30',
      closeTime: fd.get('closeTime')||'18:00',
      workdays:  Number(fd.get('workdays'))||5,
      seats:     Number(fd.get('seats'))||1,
      weekSchemaEnabled: fd.get('weekSchemaEnabled')==='true',
      weekSchemaWorkOdd: fd.get('weekSchemaWorkOdd')==='odd',
    });
    saveData(DB);
    showToast('Instellingen opgeslagen');
    renderAgenda();
  });
}

/* ---------- Data & backup ---------- */
function renderDataPanel() {
  const el = $('#spanel-data');
  el.innerHTML = `
    <div class="card">
      <div class="card-title">Data &amp; backup</div>
      <div class="card-body">
        <p>Alle data wordt <strong>lokaal in je browser</strong> opgeslagen (localStorage). Dat werkt op GitHub Pages — je kunt gewoon nieuwe afspraken boeken; die blijven bewaard op deze computer/tablet in deze browser.</p>
        <p style="color:var(--muted); font-size:13px; max-width:42rem; margin:0 0 10px 0;">GitHub host alleen de website, geen database. Voor backup: download regelmatig een JSON-backup. Op een andere computer: backup importeren. Voor sync tussen meerdere apparaten is later een cloud-database nodig (bijv. Supabase).</p>
        <label class="ck-row" style="display:flex; align-items:flex-start; gap:8px; margin-bottom:12px; cursor:pointer;">
          <input type="checkbox" id="burcuAkcayDemo" style="margin-top:2px" ${DB.burcuAkcayDemo ? 'checked' : ''} />
          <span>Testklant Burcu (demo) — klant + afspraken uit bestand inladen</span>
        </label>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn ghost" id="exportAll">📥 Backup downloaden (JSON)</button>
          <label class="btn ghost file-btn" style="cursor:pointer;">
            📤 Backup importeren
            <input type="file" id="importAll" accept="application/json" hidden />
          </label>
          <button class="btn danger" id="wipeData">🗑 Alle data wissen</button>
        </div>
      </div>
    </div>`;
  $('#exportAll').addEventListener('click', () => downloadFile('salon-backup.json', JSON.stringify(DB,null,2), 'application/json'));
  $('#importAll').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.clients) throw new Error('Ongeldig backup');
        DB = data;
        const def0 = defaultData();
        if (DB.burcuAkcayDemo === undefined) DB.burcuAkcayDemo = def0.burcuAkcayDemo;
        pruneBurcuDemoIfOff(DB);
        applyBurcuAkcayOverride();
        saveData(DB);
        showView('home');
        showToast('Backup geïmporteerd');
      } catch(err) { showToast('Importeren mislukt: '+err.message); }
    };
    reader.readAsText(file); e.target.value='';
  });
  const chkBurcu = el.querySelector('#burcuAkcayDemo');
  if (chkBurcu) {
    chkBurcu.addEventListener('change', () => {
      DB.burcuAkcayDemo = !!chkBurcu.checked;
      if (DB.burcuAkcayDemo) {
        delete DB.burcuAkcayHistoryV;
        applyBurcuAkcayOverride();
      } else {
        pruneBurcuDemoIfOff(DB);
        saveData(DB);
      }
      showToast(DB.burcuAkcayDemo ? 'Testklant Burcu ingeschakeld' : 'Burcu-demo uit — data verwijderd');
      renderHome();
      renderAgenda();
      renderClients('');
    });
  }
  $('#wipeData').addEventListener('click', () => {
    if (!confirm('Alle data wissen? Dit kan niet ongedaan worden.')) return;
    if (!confirm('Echt zeker?')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SALON_SEED_KEY);
    DB = loadData();
    applyBurcuAkcayOverride();
    showView('home');
    renderHome();
    renderAgenda();
    renderClients('');
    showToast('Data gewist — klanten worden opnieuw geladen…');
    void bootstrapSalonFromHostedSeed().then(async () => {
      await tryMergeBundledSalonwareCsv();
      await tryImportBundledAfsprakenKlantenCsv();
      renderClients($('#searchClient')?.value || '');
      renderAgenda();
      renderHome();
      showToast(`${DB.clients.length} klanten · ${DB.appointments.length} afspraken geladen`);
    });
  });
}

/* ---------- Berichten / E-mail templates ---------- */
function renderBerichtenList() {
  const tpls = DB.messageTemplates = DB.messageTemplates || defaultMessageTemplates();
  const el = $('#spanel-berichten');
  el.innerHTML = `
    <div class="card">
      <div class="card-title">E-mail berichten</div>
      <div class="card-body">
        <p style="color:var(--muted); font-size:13px;">Pas de standaard e-mailberichten aan. Gebruik <code>{voornaam}</code>, <code>{achternaam}</code>, <code>{datum}</code>, <code>{tijd}</code>, <code>{salon}</code>, <code>{behandeling}</code>, <code>{totaal}</code>, <code>{factuurnummer}</code>, <code>{betaalwijze}</code>, <code>{intake_link}</code>, <code>{salon_adres}</code> enz.</p>
        <div class="dos-row" style="margin-bottom:12px;">
          <label>Kopie e-mails ontvangen?</label>
          <div>
            <label class="ck-row" style="display:inline-flex;"><input type="radio" name="bccCopy" value="ja"  ${DB.settings.bccCopy?'checked':''}> Ja</label>
            <label class="ck-row" style="display:inline-flex; margin-left:18px;"><input type="radio" name="bccCopy" value="nee" ${!DB.settings.bccCopy?'checked':''}> Nee</label>
          </div>
        </div>
        <table class="data-table">
          <thead><tr><th>Bericht</th><th style="width:120px;">BCC ontvangen</th><th style="width:80px;">Bewerk</th></tr></thead>
          <tbody>
            ${tpls.map(t => `<tr>
              <td>${escapeHtml(fillTokens(t.name, {}))}</td>
              <td><input type="checkbox" data-tplbcc="${t.key}" ${t.bcc?'checked':''}></td>
              <td><button class="row-btn" data-tpledit="${t.key}" title="Bewerken">✎</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  el.querySelectorAll('[name="bccCopy"]').forEach(r => r.addEventListener('change', () => {
    DB.settings.bccCopy = el.querySelector('[name="bccCopy"]:checked')?.value === 'ja';
    saveData(DB);
  }));
  el.querySelectorAll('[data-tplbcc]').forEach(c => c.addEventListener('change', () => {
    const tpl = tpls.find(t => t.key === c.dataset.tplbcc);
    if (tpl) { tpl.bcc = c.checked; saveData(DB); }
  }));
  el.querySelectorAll('[data-tpledit]').forEach(b => b.addEventListener('click', () => openTemplateEditor(b.dataset.tpledit)));
}

function openTemplateEditor(key) {
  const tpl = (DB.messageTemplates||[]).find(t => t.key === key);
  if (!tpl) return;
  const tokens = ['{voornaam}','{achternaam}','{volledige_naam}','{salon}','{salon_adres}','{salon_postcode}','{salon_plaats}','{salon_telefoon}','{salon_email}','{datum}','{tijd}','{behandeling}','{totaal}','{factuurnummer}','{betaalwijze}','{intake_link}','{website}'];
  openModal('Bericht bewerken — ' + fillTokens(tpl.name, {}), `
    <div class="form" style="grid-template-columns:1fr;">
      <label>Onderwerp
        <input type="text" id="tplSubject" value="${escapeHtml(tpl.subject)}">
      </label>
      <label>Bericht
        <textarea id="tplBody" rows="14" style="font-family:inherit;">${escapeHtml(tpl.body)}</textarea>
      </label>
      <div style="font-size:12px; color:var(--muted);">
        Beschikbare tokens: ${tokens.map(t => `<code style="cursor:pointer; background:#efe9e0; padding:1px 4px; border-radius:3px; margin-right:3px;" class="tpl-token">${t}</code>`).join(' ')}
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:8px;">
        <button class="btn ghost" id="tplReset">↺ Terug naar standaard</button>
        <div style="display:flex; gap:8px;">
          <button class="btn ghost" id="tplCancel">Annuleren</button>
          <button class="btn primary" id="tplSave">Opslaan</button>
        </div>
      </div>
    </div>
  `);
  document.querySelectorAll('.tpl-token').forEach(c => c.addEventListener('click', () => {
    const ta = $('#tplBody');
    const start = ta.selectionStart; const end = ta.selectionEnd;
    const t = c.textContent;
    ta.value = ta.value.slice(0,start) + t + ta.value.slice(end);
    ta.focus(); ta.selectionStart = ta.selectionEnd = start + t.length;
  }));
  $('#tplCancel').addEventListener('click', closeModal);
  $('#tplReset').addEventListener('click', () => {
    if (!confirm('Terugzetten naar standaardtekst?')) return;
    const def = defaultMessageTemplates().find(d => d.key === key);
    if (def) { Object.assign(tpl, { subject: def.subject, body: def.body }); saveData(DB); closeModal(); renderBerichtenList(); openTemplateEditor(key); }
  });
  $('#tplSave').addEventListener('click', () => {
    tpl.subject = $('#tplSubject').value;
    tpl.body    = $('#tplBody').value;
    saveData(DB);
    closeModal();
    showToast('Bericht opgeslagen');
    renderBerichtenList();
  });
}

/* ---------- Formulier-builder (intake) ---------- */
function renderFormulierBuilder() {
  DB.intakeQuestions = DB.intakeQuestions || defaultIntakeQuestions();
  const groups = DB.intakeQuestions;
  const el = $('#spanel-formulier');
  el.innerHTML = `
    <div class="card">
      <div class="card-title">Huidenquête / Intakeformulier</div>
      <div class="card-body">
        <p style="color:var(--muted); font-size:13px;">Pas de secties en vragen aan. Velden met een <em>autofill</em>-koppeling worden automatisch in de klantkaart bijgewerkt zodra de klant het formulier instuurt.</p>

        <div id="formGroupsList">
          ${groups.map((g,gi) => `
            <div class="form-builder-group">
              <div class="form-builder-group-head">
                <input type="text" data-grp-title="${gi}" value="${escapeHtml(g.title)}" placeholder="Sectienaam">
                <div>
                  <button class="btn ghost small" data-grp-up="${gi}" ${gi===0?'disabled':''}>↑</button>
                  <button class="btn ghost small" data-grp-down="${gi}" ${gi===groups.length-1?'disabled':''}>↓</button>
                  <button class="btn danger small" data-grp-del="${gi}">🗑 Sectie</button>
                </div>
              </div>
              <table class="data-table form-builder-fields">
                <thead><tr><th>Vraag (label)</th><th>Type</th><th>Naam (id)</th><th>Auto-fill</th><th>Opties</th><th></th></tr></thead>
                <tbody>
                  ${(g.fields||[]).map((q,fi) => `<tr>
                    <td><input type="text" data-fld="${gi}.${fi}.label" value="${escapeHtml(q.label)}"></td>
                    <td>
                      <select data-fld="${gi}.${fi}.type">
                        ${['text','textarea','date','email','select','checkbox','checkboxes'].map(o=>`<option value="${o}" ${q.type===o?'selected':''}>${o}</option>`).join('')}
                      </select>
                    </td>
                    <td><input type="text" data-fld="${gi}.${fi}.name" value="${escapeHtml(q.name)}"></td>
                    <td>
                      <select data-fld="${gi}.${fi}.autofill">
                        <option value="">—</option>
                        ${['firstName','lastName','gender','birthday','address','dossier.postal','city','phone','mobile','email'].map(o=>`<option value="${o}" ${q.autofill===o?'selected':''}>${o}</option>`).join('')}
                      </select>
                    </td>
                    <td><input type="text" data-fld="${gi}.${fi}.options" placeholder="Voor select/checkboxes, scheid met |" value="${escapeHtml(stringifyOptions(q.options))}"></td>
                    <td><button class="row-btn delete" data-fld-del="${gi}.${fi}" title="Verwijderen">🗑</button></td>
                  </tr>`).join('')}
                </tbody>
              </table>
              <button class="btn ghost small" data-fld-add="${gi}">+ Vraag toevoegen</button>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:18px; display:flex; gap:8px;">
          <button class="btn ghost" id="addGroup">+ Sectie toevoegen</button>
          <button class="btn ghost" id="resetForm">↺ Terug naar standaardformulier</button>
          <span style="flex:1;"></span>
          <button class="btn primary" id="saveForm">Opslaan</button>
        </div>
      </div>
    </div>`;

  /* Edits */
  el.querySelectorAll('[data-grp-title]').forEach(i => i.addEventListener('input', () => {
    groups[Number(i.dataset.grpTitle)].title = i.value;
  }));
  el.querySelectorAll('[data-fld]').forEach(i => i.addEventListener('input', () => {
    const [gi, fi, prop] = i.dataset.fld.split('.');
    const f = groups[gi].fields[fi];
    if (prop === 'options') f.options = parseOptions(i.value, f.type);
    else f[prop] = i.value;
  }));
  el.querySelectorAll('[data-fld-add]').forEach(b => b.addEventListener('click', () => {
    groups[Number(b.dataset.fldAdd)].fields.push({ name:'veld'+Date.now().toString().slice(-4), label:'Nieuwe vraag', type:'text' });
    saveIntake();
    renderFormulierBuilder();
  }));
  el.querySelectorAll('[data-fld-del]').forEach(b => b.addEventListener('click', () => {
    if (!confirm('Vraag verwijderen?')) return;
    const [gi, fi] = b.dataset.fldDel.split('.').map(Number);
    groups[gi].fields.splice(fi, 1);
    saveIntake(); renderFormulierBuilder();
  }));
  el.querySelectorAll('[data-grp-del]').forEach(b => b.addEventListener('click', () => {
    if (!confirm('Hele sectie verwijderen?')) return;
    groups.splice(Number(b.dataset.grpDel), 1);
    saveIntake(); renderFormulierBuilder();
  }));
  el.querySelectorAll('[data-grp-up]').forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.grpUp);
    if (i<=0) return;
    [groups[i-1], groups[i]] = [groups[i], groups[i-1]];
    saveIntake(); renderFormulierBuilder();
  }));
  el.querySelectorAll('[data-grp-down]').forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.grpDown);
    if (i>=groups.length-1) return;
    [groups[i+1], groups[i]] = [groups[i], groups[i+1]];
    saveIntake(); renderFormulierBuilder();
  }));
  $('#addGroup').addEventListener('click', () => {
    groups.push({ title: 'Nieuwe sectie', fields: [] });
    saveIntake(); renderFormulierBuilder();
  });
  $('#resetForm').addEventListener('click', () => {
    if (!confirm('Hele formulier terugzetten naar standaard? Eigen aanpassingen gaan verloren.')) return;
    DB.intakeQuestions = defaultIntakeQuestions();
    saveData(DB); renderFormulierBuilder();
  });
  $('#saveForm').addEventListener('click', () => {
    saveIntake(); showToast('Formulier opgeslagen');
  });

  function saveIntake() { DB.intakeQuestions = groups; saveData(DB); }
}

function stringifyOptions(opts) {
  if (!opts) return '';
  if (Array.isArray(opts) && opts.every(o => Array.isArray(o))) return opts.map(([v,l]) => `${v}=${l}`).join('|');
  if (Array.isArray(opts)) return opts.join('|');
  return '';
}
function parseOptions(text, type) {
  if (!text) return undefined;
  const parts = text.split('|').map(s=>s.trim()).filter(Boolean);
  if (type === 'select') return parts.map(p => p.includes('=') ? p.split('=').map(s=>s.trim()) : [p,p]);
  return parts; // checkboxes
}

/* =========================================================
   KLANTDOSSIER (volwaardige pagina)
   ========================================================= */
let currentDossierClientId = null;
let currentKlantAfsprakenId = null;
let currentIntakeClientId = null;

function clientSalonwareEersteDatum(c) {
  const si = c.salonImport || {};
  return si.eersteAfspraak || '';
}

function clientSalonwareLaatsteDatum(c) {
  const si = c.salonImport || {};
  const today = todayLocalISO();
  if (si.laatsteAfspraak && si.laatsteAfspraak <= today) return si.laatsteAfspraak;
  const past = (DB.appointments || [])
    .filter(a => a.clientId === c.id && a.date <= today && a.status === 'afgerond')
    .sort((a, b) => a.date.localeCompare(b.date));
  if (past.length) return past[past.length - 1].date;
  return si.laatsteAfspraak || si.laatsteAfspraakGepland || '';
}

function clientSalonwareLaatsteLabel(c) {
  const si = c.salonImport || {};
  const today = todayLocalISO();
  if (si.laatsteAfspraak && si.laatsteAfspraak <= today) return fmtDate(si.laatsteAfspraak);
  const d = clientSalonwareLaatsteDatum(c);
  if (!d) return '—';
  if (si.laatsteAfspraakGepland && d === si.laatsteAfspraakGepland) {
    return `${fmtDate(d)} (gepland in Salonware)`;
  }
  return fmtDate(d);
}

function ensureClientDossier(c) {
  c.dossier = c.dossier || {};
  c.forms = c.forms || [];
  c.contracts = c.contracts || [];
  return c;
}

function openKlantdossier(clientId) {
  currentDossierClientId = clientId;
  showView('klantdossier');
  selectedClientId = clientId;
  renderKlantdossier();
}

function renderKlantdossier() {
  const c = findClient(currentDossierClientId);
  if (!c) { showToast('Klant niet gevonden'); return; }
  ensureClientDossier(c);
  if (c.notes && (c.notes.includes('{\\rtf') || String(c.notes).toLowerCase().includes('rtf1'))) {
    const cleaned = sanitizeImportNotes(c.notes, 9000);
    if (cleaned !== c.notes) {
      c.notes = cleaned;
      saveData(DB);
    }
  }
  const d = c.dossier;
  const forms = c.forms || [];

  const afgerond = (DB.appointments || [])
    .filter(a => a.clientId === c.id && a.status === 'afgerond')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const si = c.salonImport || {};
  const eersteStr = clientSalonwareEersteDatum(c) ? fmtDate(clientSalonwareEersteDatum(c)) : (afgerond.length ? fmtDate(afgerond[0].date) : '—');
  const laatsteStr = clientSalonwareLaatsteLabel(c);
  const totaalSwStr = si.totaalOmzet != null ? fmtMoney(si.totaalOmzet) : '—';
  const behOmzetStr = si.afspraakOmzet != null ? fmtMoney(si.afspraakOmzet) : '—';
  const prodOmzetStr = si.productOmzet != null ? fmtMoney(si.productOmzet) : '—';
  const totaalAppStr = fmtMoney(afgerond.reduce((s, a) => s + appointmentTotal(a), 0));
  const agendaExactStr = String((DB.appointments || []).filter(a => a.clientId === c.id && a.importTag === 'salon-seed-v3').length);

  $('#dossierTitle').textContent = `Klantdossier – ${clientFullName(c)}`;
  const el = $('#dossierContent');

  el.innerHTML = `
    <div class="dossier-grid">
      <div class="dossier-main">

        <div class="card dossier-stats-card">
          <div class="card-title">Bezoeken & omzet (Salonware)</div>
          <div class="card-body">
            <p class="dossier-stats-hint">Eerste en laatste behandeling komen uit je Salonware-export. In de agenda staan alleen bezoeken waar <strong>datum én bedrag</strong> in de notities staan — geen verzonnen afspraken meer.</p>
            <div class="dossier-stats-grid">
              <div><span>Eerste behandeling</span><strong>${escapeHtml(eersteStr)}</strong></div>
              <div><span>Laatste behandeling</span><strong>${escapeHtml(laatsteStr)}</strong></div>
              <div><span>Totaal omzet (Salonware)</span><strong>${totaalSwStr}</strong></div>
              <div><span>Behandelingen omzet</span><strong>${behOmzetStr}</strong></div>
              <div><span>Producten omzet</span><strong>${prodOmzetStr}</strong></div>
              <div><span>Agenda: bezoeken met bedrag uit notitie</span><strong>${agendaExactStr || '0'}</strong></div>
            </div>
            <div class="dossier-stats-sub" style="margin-top:14px;">
              <div class="dossier-stats-grid">
                <div><span>Afgerekend in deze app</span><strong>${afgerond.length}</strong></div>
                <div><span>Omzet in deze app</span><strong>${totaalAppStr}</strong></div>
              </div>
            </div>
            <div class="dossier-stats-actions">
              <button type="button" class="btn ghost small" id="dossierSalonwareStatsMerge">Salonware-CSV opnieuw laden…</button>
              ${typeof location !== 'undefined' && location.protocol !== 'file:' ? `<button type="button" class="btn ghost small" id="dossierSalonwareBundledMerge">Notities bijwerken uit ${escapeHtml(SALONWARE_BUNDLED_FILENAME)}</button>` : ''}
            </div>
            <p class="dossier-stats-filehelp">Notities worden automatisch geladen vanaf GitHub. Bij problemen: <strong>Klanten → CSV importeren</strong> en kies <code>salonware-download (2).csv</code>.</p>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Klant</div>
          <div class="card-body">
            <form id="dossierForm" class="dossier-form">
              <div class="dos-row"><label>Geslacht</label>
                <select name="gender">
                  <option value="" ${!c.gender?'selected':''}>—</option>
                  <option value="V" ${c.gender==='V'?'selected':''}>Mevrouw</option>
                  <option value="M" ${c.gender==='M'?'selected':''}>Meneer</option>
                </select>
              </div>
              <div class="dos-row"><label>Voorletters</label><input type="text" name="initials" value="${escapeHtml(c.initials||'')}"></div>
              <div class="dos-row"><label>Voornaam</label><input type="text" name="firstName" value="${escapeHtml(c.firstName||'')}"></div>
              <div class="dos-row"><label>Tussenvoegsel</label><input type="text" name="tussenvoegsel" value="${escapeHtml(d.tussenvoegsel||'')}"></div>
              <div class="dos-row"><label>Achternaam</label><input type="text" name="lastName" value="${escapeHtml(c.lastName||'')}"></div>
              <div class="dos-row"><label>Geboortedatum</label><input type="date" name="birthday" value="${escapeHtml(c.birthday||'')}"></div>
              <div class="dos-row"><label>Opmerkingen</label><textarea name="notes" rows="3">${escapeHtml(c.notes||'')}</textarea></div>
              <div class="dos-row"><label>Opmerkingen INTERN</label><textarea name="notesInternal" rows="2">${escapeHtml(c.notesInternal||'')}</textarea></div>
              <div class="dos-row"><label>Verplicht vooruit betalen</label>
                <select name="mustPayFirst">
                  <option value="standaard" ${(c.mustPayFirst||'standaard')==='standaard'?'selected':''}>Standaard instelling</option>
                  <option value="ja" ${c.mustPayFirst==='ja'?'selected':''}>Ja</option>
                  <option value="nee" ${c.mustPayFirst==='nee'?'selected':''}>Nee</option>
                </select>
              </div>

              <h3 class="dos-section-title">Adres- en contactgegevens</h3>
              <div class="dos-row"><label>Adres</label><input type="text" name="address" value="${escapeHtml(c.address||'')}"></div>
              <div class="dos-row"><label>Postcode</label><input type="text" name="postal" value="${escapeHtml(d.postal||'')}"></div>
              <div class="dos-row"><label>Plaats</label><input type="text" name="city" value="${escapeHtml(c.city||'')}"></div>
              <div class="dos-row"><label>Telefoon</label><input type="text" name="phone" value="${escapeHtml(c.phone||'')}"></div>
              <div class="dos-row"><label>Mobiel</label><input type="text" name="mobile" value="${escapeHtml(c.mobile||'')}"></div>

              <h3 class="dos-section-title">E-mail en reminders</h3>
              <div class="dos-row"><label>E-mail</label><input type="email" name="email" value="${escapeHtml(c.email||'')}"></div>
              <div class="dos-row"><label>Nieuwsbrief</label>
                <select name="newsletter">
                  <option value="ja" ${(d.newsletter||'ja')==='ja'?'selected':''}>Ja</option>
                  <option value="nee" ${d.newsletter==='nee'?'selected':''}>Nee</option>
                </select>
              </div>
              <div class="dos-row"><label>Type reminder</label>
                <select name="reminderType">
                  <option value="standaard" ${(d.reminderType||'standaard')==='standaard'?'selected':''}>Standaard instelling</option>
                  <option value="email">E-mail</option>
                  <option value="sms">Sms</option>
                  <option value="geen">Geen</option>
                </select>
              </div>
              <div class="dos-row"><label>Tijd van te voren</label>
                <select name="reminderHours">
                  <option value="geen" ${(d.reminderHours||'geen')==='geen'?'selected':''}>geen</option>
                  <option value="24"   ${d.reminderHours==='24'?'selected':''}>24 uur</option>
                  <option value="48"   ${d.reminderHours==='48'?'selected':''}>48 uur</option>
                  <option value="72"   ${d.reminderHours==='72'?'selected':''}>72 uur</option>
                </select>
              </div>

              <h3 class="dos-section-title">Contracten en formulieren</h3>
              <div class="dos-formulieren">
                <div class="dos-formulieren-card">
                  <div class="dos-formulieren-title">Verzonden formulieren</div>
                  ${forms.length ? `
                    <table class="data-table dos-form-table">
                      <thead><tr><th>Titel</th><th>Ingevuld</th><th>Laatste wijziging</th><th></th></tr></thead>
                      <tbody>
                        ${forms.map(f => `<tr>
                          <td>${escapeHtml(f.title)}</td>
                          <td>${f.filledAt ? '✓' : '—'}</td>
                          <td>${f.filledAt ? fmtDate(f.filledAt.slice(0,10)) : (f.sentAt ? fmtDate(f.sentAt.slice(0,10)) : '')}</td>
                          <td><button type="button" class="btn ghost small" data-bekijk-form="${escapeHtml(f.id)}">Bekijken</button></td>
                        </tr>`).join('')}
                      </tbody>
                    </table>
                  ` : `<p class="empty" style="padding:8px 0;">Er zijn nog geen contracten of formulieren verzonden naar deze klant.</p>`}
                  <div style="margin-top:10px; display:flex; gap:8px;">
                    <button type="button" class="btn primary small" id="dosNewForm">Nieuw formulier</button>
                    <button type="button" class="btn ghost small" id="dosNewContract">Nieuw contract</button>
                  </div>
                </div>
              </div>

              <h3 class="dos-section-title">Uitnodiging</h3>
              <div class="dos-row"><label>Klant uitnodigen op</label><input type="date" name="invitedDate" value="${escapeHtml(d.invitedDate||'')}"></div>
              <div class="dos-row"><label>Kies bericht</label>
                <select name="invitedTemplate">
                  <option value="">Geen automatisch bericht — door zelfgekozen aan salon</option>
                  <option value="bevestiging" ${d.invitedTemplate==='bevestiging'?'selected':''}>Bevestiging</option>
                  <option value="herinnering" ${d.invitedTemplate==='herinnering'?'selected':''}>Herinnering</option>
                </select>
              </div>
              <div class="dos-row"><label>Bericht</label><textarea name="invitedMessage" rows="4">${escapeHtml(d.invitedMessage||'')}</textarea></div>

              <h3 class="dos-section-title">Overige gegevens</h3>
              <div class="dos-row"><label>Voorkeurs medewerker</label>
                <select name="preferredEmployee">
                  <option value="" ${!d.preferredEmployee?'selected':''}>Geen voorkeur</option>
                  <option value="salon" ${d.preferredEmployee==='salon'?'selected':''}>Salon-eigenaar</option>
                </select>
              </div>
              <div class="dos-row"><label>Klanttype</label>
                <select name="klantType">
                  <option value="" ${!d.klantType?'selected':''}>—</option>
                  <option value="particulier" ${d.klantType==='particulier'?'selected':''}>Particulier</option>
                  <option value="zakelijk" ${d.klantType==='zakelijk'?'selected':''}>Zakelijk</option>
                </select>
              </div>
              <div class="dos-row"><label>Polisnummer</label><input type="text" name="polisnummer" value="${escapeHtml(d.polisnummer||'')}"></div>
              <div class="dos-row"><label>Debiteurnummer</label><input type="text" name="debiteurnummer" value="${escapeHtml(d.debiteurnummer||'')}"></div>
              <div class="dos-row"><label>Saldo zakelijk (€)</label><input type="number" step="0.01" name="saldoZakelijk" value="${d.saldoZakelijk||0}"></div>
              <div class="dos-row"><label>Saldo prive (€)</label><input type="number" step="0.01" name="saldoPrive" value="${d.saldoPrive||0}"></div>
              <div class="dos-row"><label>WoonzorgID</label><input type="text" name="woonzorgId" value="${escapeHtml(d.woonzorgId||'')}"></div>
              <div class="dos-row"><label>Klant is actief</label>
                <select name="active">
                  <option value="ja" ${(d.active||'ja')==='ja'?'selected':''}>Ja</option>
                  <option value="nee" ${d.active==='nee'?'selected':''}>Nee</option>
                </select>
              </div>

              <div style="margin-top:18px; display:flex; gap:10px;">
                <button type="submit" class="btn primary">Opslaan</button>
                <button type="button" class="btn ghost" id="dosCancel">Annuleren</button>
              </div>
            </form>
          </div>
        </div>

      </div>

      <aside class="dossier-side">
        <div class="card">
          <div class="card-title">Afspraak</div>
          <div class="card-body" style="padding:8px;">
            <button class="appt-side-btn" id="dosAfrekenen">Afrekenen</button>
            <button class="appt-side-btn" id="dosKopie">Kopie inplannen</button>
            <button class="appt-side-btn" id="dosAfspraken">Afspraken & Producten</button>
            <button class="appt-side-btn" id="dosVerplaatsen">Verplaatsen</button>
            <button class="appt-side-btn" id="dosFactuur">Factuur</button>
            <button class="appt-side-btn" id="dosBericht">Bericht sturen</button>
            <button class="appt-side-btn" id="dosMeer">Meer.. ▾</button>
          </div>
        </div>
      </aside>
    </div>
  `;

  $('#dossierSalonwareStatsMerge')?.addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.csv,text/csv';
    inp.addEventListener('change', () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const res = mergeSalonwareClientsFromCsvText(String(reader.result || ''), { quiet: true });
        if (res.updated || res.added) {
          showToast(`${res.updated} klant(en) bijgewerkt — notities & omzet`);
          renderKlantdossier();
        } else {
          showToast('Geen rijen gematcht — gebruik het volledige Salonware-export-CSV; check klant_id of exacte naam');
        }
      };
      reader.readAsText(f, 'utf-8');
    });
    inp.click();
  });
  $('#dossierSalonwareBundledMerge')?.addEventListener('click', () => {
    if (typeof location !== 'undefined' && location.protocol === 'file:') return;
    showToast('Bezig met bijwerken…');
    fetchBundledSalonwareCsvText()
      .then((t) => {
        const res = mergeSalonwareClientsFromCsvText(t, { quiet: true });
        if (res.updated || res.added) {
          showToast(`${res.updated} klant(en) bijgewerkt — notities & omzet`);
          renderKlantdossier();
        } else {
          showToast('Geen match — kies je eigen export via de andere knop');
        }
      })
      .catch(() => showToast('CSV niet bereikbaar (staat het naast index.html?)'));
  });

  $('#dosCancel').addEventListener('click', () => history.length>1 ? history.back() : showView('klanten'));

  $('#dossierForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    c.gender    = fd.get('gender')||'';
    c.initials  = fd.get('initials')||'';
    c.firstName = fd.get('firstName')||'';
    c.lastName  = fd.get('lastName')||'';
    c.birthday  = fd.get('birthday')||'';
    c.notes     = fd.get('notes')||'';
    c.notesInternal = fd.get('notesInternal')||'';
    c.mustPayFirst  = fd.get('mustPayFirst')||'standaard';
    c.address   = fd.get('address')||'';
    c.city      = fd.get('city')||'';
    c.phone     = fd.get('phone')||'';
    c.mobile    = fd.get('mobile')||'';
    c.email     = fd.get('email')||'';

    c.dossier = c.dossier || {};
    Object.assign(c.dossier, {
      tussenvoegsel:    fd.get('tussenvoegsel')||'',
      postal:           fd.get('postal')||'',
      newsletter:       fd.get('newsletter')||'ja',
      reminderType:     fd.get('reminderType')||'standaard',
      reminderHours:    fd.get('reminderHours')||'geen',
      invitedDate:      fd.get('invitedDate')||'',
      invitedTemplate:  fd.get('invitedTemplate')||'',
      invitedMessage:   fd.get('invitedMessage')||'',
      preferredEmployee:fd.get('preferredEmployee')||'',
      klantType:        fd.get('klantType')||'',
      polisnummer:      fd.get('polisnummer')||'',
      debiteurnummer:   fd.get('debiteurnummer')||'',
      saldoZakelijk:    Number(fd.get('saldoZakelijk'))||0,
      saldoPrive:       Number(fd.get('saldoPrive'))||0,
      woonzorgId:       fd.get('woonzorgId')||'',
      active:           fd.get('active')||'ja',
    });

    saveData(DB);
    showToast('Klantdossier opgeslagen');
    renderKlantdossier();
  });

  // Form actions
  $('#dosNewForm')?.addEventListener('click', () => {
    if (!confirm('Een nieuwe huidenquête naar deze klant sturen via e-mail?')) return;
    sendIntakeFormToClient(c);
  });
  $('#dosNewContract')?.addEventListener('click', () => showToast('Contracten komen binnenkort.'));

  // Bekijk formulier
  el.querySelectorAll('[data-bekijk-form]').forEach(b => {
    b.addEventListener('click', () => {
      const f = forms.find(x => x.id === b.dataset.bekijkForm);
      if (!f) return;
      openFormViewerModal(c, f);
    });
  });

  // Sidebar quick actions
  const lastAppt = (DB.appointments||[]).filter(a=>a.clientId===c.id).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time))[0];
  $('#dosAfrekenen').addEventListener('click', () => lastAppt ? openAfrekenen(lastAppt.id) : showToast('Nog geen afspraak'));
  $('#dosKopie').addEventListener('click',     () => lastAppt ? openKopieModal(lastAppt.id) : showToast('Nog geen afspraak'));
  $('#dosAfspraken').addEventListener('click', () => openKlantAfspraken(c.id));
  $('#dosVerplaatsen').addEventListener('click', () => lastAppt ? (openAppointmentDetail(lastAppt.id)) : showToast('Nog geen afspraak'));
  $('#dosFactuur').addEventListener('click',   () => lastAppt ? openFactuurModal(lastAppt.id) : showToast('Nog geen afspraak'));
  $('#dosBericht').addEventListener('click',   () => openBerichtModal(c, lastAppt));
  $('#dosMeer').addEventListener('click',      () => openVerzondenModal(c));
}

function sendIntakeFormToClient(c) {
  const f = {
    id: uid('f'),
    title: 'Huidenquête Elim Instituut',
    sentAt: new Date().toISOString(),
    filledAt: null,
    answers: {}
  };
  c.forms = c.forms || [];
  c.forms.unshift(f);
  saveData(DB);

  if (c.email) {
    const link    = `${location.href.split('?')[0].split('#')[0]}#intake=${c.id}&form=${f.id}`;
    const subject = buildIntakeFormSubject(c);
    const body    = buildIntakeFormBody(c, link);
    logSentMessage(c.id, 'intake-form', subject);
    openMailto(c.email, subject, body);
    showToast('Mailprogramma geopend');
  } else {
    showToast('Formulier toegevoegd (geen e-mailadres bekend)');
  }
  if (currentDossierClientId === c.id) renderKlantdossier();
}

function openFormViewerModal(c, f) {
  const a = f.answers || {};
  const rows = INTAKE_QUESTIONS.flatMap(g => g.fields).map(q => {
    const v = a[q.name];
    if (!v && v !== 0) return '';
    let display = v;
    if (Array.isArray(v)) display = v.join(', ');
    return `<tr><td style="vertical-align:top; width:45%;">${escapeHtml(q.label)}</td><td>${escapeHtml(display)}</td></tr>`;
  }).filter(Boolean).join('');
  openModal(`${f.title} – ${clientFullName(c)}`, `
    <div style="max-height:500px; overflow:auto;">
      ${f.filledAt
        ? `<p style="color:var(--muted); font-size:13px;">Ingevuld op ${fmtDate(f.filledAt.slice(0,10))}.</p>
           <table class="data-table">${rows || '<tr><td colspan="2" class="empty">Geen antwoorden.</td></tr>'}</table>`
        : `<p class="empty" style="padding:20px;">Dit formulier is nog niet ingevuld door de klant.</p>`}
    </div>
    <div style="text-align:right; margin-top:12px;">
      <button class="btn ghost" id="fvClose">Sluiten</button>
    </div>
  `);
  $('#fvClose').addEventListener('click', closeModal);
}

/* =========================================================
   AFSPRAKEN & PRODUCTEN (volwaardige pagina)
   ========================================================= */
let kaFilter = 'all'; // all | treatment | product
let kaSearch = '';

function openKlantAfspraken(clientId) {
  currentKlantAfsprakenId = clientId;
  kaFilter = 'all';
  kaSearch = '';
  showView('klant-afspraken');
  renderKlantAfspraken();
}

function renderKlantAfspraken() {
  const c = findClient(currentKlantAfsprakenId);
  if (!c) return;
  $('#kaTitle').textContent = `Afspraken en producten – ${clientFullName(c)}`;
  const el = $('#kaContent');

  const today = new Date();
  const allAppts = (DB.appointments||[])
    .filter(a => a.clientId === c.id && a.status !== 'geannuleerd')
    .sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));

  // Build flat rows: 1 row per appointment
  let rows = allAppts.map(a => {
    if (a.status === 'verwijderd') {
      if (kaFilter !== 'all') return null;
      const dt = new Date(a.date);
      const days = Math.round((today - dt)/86400000);
      return {
        a, days, status: 'Verwijderd', totaal: 0, itemsTxt: '', prijzen: '', isVerwijderd: true,
      };
    }
    const items = a.items || [];
    let filteredItems = items;
    if (kaFilter === 'treatment') filteredItems = items.filter(i=>i.kind==='treatment');
    if (kaFilter === 'product')   filteredItems = items.filter(i=>i.kind==='product');
    if (!filteredItems.length && kaFilter !== 'all') return null;

    const dt = new Date(a.date);
    const days = Math.round((today - dt)/86400000);
    const status = a.status === 'afgerond' ? (a.betaalwijze && a.betaalwijze !== 'pin' ? 'anders' : 'Eigen reservering') : 'Eigen reservering';
    const totaal = items.reduce((s,it)=>s+(it.qty||1)*(it.price||0),0);
    const itemsTxt = items.map(it => describeItem(it)).join('\n');
    const prijzen = items.map(it => fmtMoney((it.qty||1)*(it.price||0))).join('\n');

    return { a, days, status, totaal, itemsTxt, prijzen, isVerwijderd: false };
  }).filter(Boolean);

  // Search filter
  if (kaSearch) {
    const q = kaSearch.toLowerCase();
    rows = rows.filter(r =>
      (r.itemsTxt || '').toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      (r.isVerwijderd && r.a.verwijderdOp && fmtDate(r.a.verwijderdOp).toLowerCase().includes(q))
    );
  }

  el.innerHTML = `
    <div class="ka-layout">
      <div class="card ka-card">
        <div class="card-title">Afspraken en producten</div>
        <div class="card-body">
          <div class="ka-toolbar">
            <label>Search: <input type="text" id="kaSearch" value="${escapeHtml(kaSearch)}" placeholder=""></label>
            <div class="ka-filters">
              <button class="ka-filter ${kaFilter==='all'?'active':''}" data-kaf="all">Alles</button>
              <button class="ka-filter ${kaFilter==='treatment'?'active':''}" data-kaf="treatment">Diensten</button>
              <button class="ka-filter ${kaFilter==='product'?'active':''}" data-kaf="product">Producten</button>
            </div>
          </div>
          <table class="data-table ka-table">
            <thead><tr><th>Datum</th><th>Onderdelen</th><th>Status</th><th class="amount">Prijs</th><th class="amount">Totaal</th><th></th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(r => `<tr>
                <td>
                  <div>${weekdayName(r.a.date)} ${fmtDate(r.a.date)} ${r.a.time}</div>
                  <div style="color:var(--muted); font-size:12px;">[${r.days} dg]</div>
                  ${r.isVerwijderd && r.a.verwijderdOp ? `<div style="color:var(--muted); font-size:12px;">Verwijderd op ${escapeHtml(fmtDate(r.a.verwijderdOp))}</div>` : ''}
                </td>
                <td><pre class="ka-items">${r.isVerwijderd ? '' : escapeHtml(r.itemsTxt)}</pre></td>
                <td>${escapeHtml(r.status)}</td>
                <td class="amount"><pre class="ka-items amount">${r.isVerwijderd ? '' : escapeHtml(r.prijzen)}</pre></td>
                <td class="amount">${fmtMoney(r.totaal)}</td>
                <td>${r.isVerwijderd ? '' : `<button class="row-btn" data-open-appt="${r.a.id}" title="Openen">📋</button>`}</td>
              </tr>`).join('') : `<tr><td colspan="6" class="empty" style="padding:20px;">Geen afspraken gevonden.</td></tr>`}
            </tbody>
          </table>
          <div class="ka-footer">
            <div class="ka-export">
              <button class="btn ghost small" id="kaCsv">📄 CSV</button>
              <button class="btn ghost small" id="kaExcel">📊 Excel</button>
            </div>
            <div style="color:var(--muted); font-size:13px;">${rows.length} regel(s)</div>
          </div>
        </div>
      </div>

      <aside class="ka-side">
        <div class="card">
          <div class="card-title">Afspraak</div>
          <div class="card-body" style="padding:8px;">
            <button class="appt-side-btn" id="kaAfrekenen">Afrekenen</button>
            <button class="appt-side-btn" id="kaKopie">Kopie inplannen</button>
            <button class="appt-side-btn primary" id="kaAfspraken">Afspraken & Producten</button>
            <button class="appt-side-btn" id="kaVerplaatsen">Verplaatsen</button>
            <button class="appt-side-btn" id="kaFactuur">Factuur</button>
            <button class="appt-side-btn" id="kaBericht">Bericht sturen</button>
            <button class="appt-side-btn" id="kaMeer">Meer.. ▾</button>
          </div>
        </div>
      </aside>
    </div>
  `;

  $('#kaSearch').addEventListener('input', e => { kaSearch = e.target.value; renderKlantAfspraken(); });
  el.querySelectorAll('.ka-filter').forEach(b => b.addEventListener('click', () => { kaFilter = b.dataset.kaf; renderKlantAfspraken(); }));
  el.querySelectorAll('[data-open-appt]').forEach(b => b.addEventListener('click', () => openAppointmentDetail(b.dataset.openAppt)));

  $('#kaCsv').addEventListener('click', () => exportKlantAfsprakenCsv(c, rows));
  $('#kaExcel').addEventListener('click', () => exportKlantAfsprakenCsv(c, rows, true));

  const lastAppt = allAppts[0];
  $('#kaAfrekenen').addEventListener('click', () => lastAppt ? openAfrekenen(lastAppt.id) : showToast('Nog geen afspraak'));
  $('#kaKopie').addEventListener('click',     () => lastAppt ? openKopieModal(lastAppt.id) : showToast('Nog geen afspraak'));
  $('#kaAfspraken').addEventListener('click', () => renderKlantAfspraken());
  $('#kaVerplaatsen').addEventListener('click', () => lastAppt ? openAppointmentDetail(lastAppt.id) : showToast('Nog geen afspraak'));
  $('#kaFactuur').addEventListener('click',   () => lastAppt ? openFactuurModal(lastAppt.id) : showToast('Nog geen afspraak'));
  $('#kaBericht').addEventListener('click',   () => openBerichtModal(c, lastAppt));
  $('#kaMeer').addEventListener('click',      () => openVerzondenModal(c));
}

function exportKlantAfsprakenCsv(c, rows, excel=false) {
  const header = ['Datum','Tijd','Onderdelen','Status','Prijs','Totaal'];
  const lines = [header.join(';')];
  rows.forEach(r => {
    lines.push([r.a.date, r.a.time, '"'+r.itemsTxt.replace(/\n/g,' / ').replace(/"/g,'""')+'"', r.status, r.prijzen.replace(/\n/g,' / '), r.totaal.toFixed(2)].join(';'));
  });
  const filename = `afspraken-${(c.lastName||c.firstName||c.id).toLowerCase()}.${excel?'xls':'csv'}`;
  downloadFile(filename, lines.join('\n'), excel ? 'application/vnd.ms-excel' : 'text/csv');
}

/* =========================================================
   INTAKE-FORMULIER (huidenquête) - publieke pagina via #intake=clientId
   ========================================================= */
function getIntakeQuestions() { return DB.intakeQuestions || defaultIntakeQuestions(); }

function defaultIntakeQuestions() { return [
  {
    title: 'Persoonsgegevens',
    fields: [
      { name:'firstName',  label:'Voornaam',          type:'text',     autofill:'firstName' },
      { name:'lastName',   label:'Achternaam',        type:'text',     autofill:'lastName' },
      { name:'gender',     label:'Geslacht',          type:'select',   options:[['','—'],['V','Mevrouw'],['M','Meneer']], autofill:'gender' },
      { name:'birthday',   label:'Geboortedatum',     type:'date',     autofill:'birthday' },
      { name:'address',    label:'Adres',             type:'text',     autofill:'address' },
      { name:'postal',     label:'Postcode',          type:'text',     autofill:'dossier.postal' },
      { name:'city',       label:'Plaats',            type:'text',     autofill:'city' },
      { name:'phone',      label:'Telefoon',          type:'text',     autofill:'phone' },
      { name:'mobile',     label:'Mobiel',            type:'text',     autofill:'mobile' },
      { name:'email',      label:'E-mailadres',       type:'email',    autofill:'email' },
      { name:'beroep',     label:'Beroep',            type:'text' }
    ]
  },
  {
    title: 'Hoe heeft u ons gevonden?',
    fields: [
      { name:'doorverwezen', label:'Door wie of waardoor bent u bij ons terechtgekomen?', type:'select',
        options:[['','—'],['google','Google'],['social','Social media'],['vriend','Vriend / familie'],['krant','Krant / advertentie'],['anders','Anders']] }
    ]
  },
  {
    title: 'Doelstelling',
    fields: [
      { name:'doel', label:'Wat wilt u bereiken met de behandeling?', type:'textarea' }
    ]
  },
  {
    title: 'Huidvragen',
    fields: [
      { name:'huidtype',     label:'Wat is uw huidtype?', type:'select',
        options:[['','—'],['normaal','Normaal'],['droog','Droog'],['vet','Vet'],['gemengd','Gemengd'],['gevoelig','Gevoelig']] },
      { name:'huidproblemen', label:'Welke huidproblemen ervaart u? (meerdere mogelijk)', type:'checkboxes',
        options:['Acne','Couperose','Pigmentvlekken','Rimpels / verouderingsverschijnselen','Wallen / donkere kringen','Roodheid','Eczeem / psoriasis','Littekens','Geen'] },
      { name:'producten', label:'Welke verzorgingsproducten gebruikt u thuis?', type:'textarea' },
      { name:'zonbescherming', label:'Gebruikt u dagelijks zonbescherming (SPF)?', type:'select',
        options:[['','—'],['ja','Ja'],['nee','Nee'],['soms','Soms']] }
    ]
  },
  {
    title: 'Medische gegevens',
    fields: [
      { name:'allergie',  label:'Heeft u allergieën / intoleranties?', type:'textarea' },
      { name:'medicijnen',label:'Gebruikt u medicijnen? Zo ja, welke?', type:'textarea' },
      { name:'condities', label:'Heeft u (gehad) één van onderstaande condities?', type:'checkboxes',
        options:['Zwangerschap','Borstvoeding','Diabetes','Hartklachten','Kanker (afgelopen 5 jaar)','Herpes / koortslip','Epilepsie','Pacemaker','Bloedverdunners','Hoge bloeddruk','Schildklier','Geen van bovenstaande'] },
      { name:'huidaandoeningen', label:'Specifieke huidaandoeningen?', type:'textarea' },
      { name:'eerdereBehandelingen', label:'Heeft u eerder cosmetische behandelingen ondergaan?', type:'textarea' }
    ]
  },
  {
    title: 'Levensstijl',
    fields: [
      { name:'roken',   label:'Rookt u?',           type:'select', options:[['','—'],['nee','Nee'],['soms','Soms'],['ja','Ja, dagelijks']] },
      { name:'alcohol', label:'Drinkt u alcohol?',  type:'select', options:[['','—'],['nooit','Nooit'],['weekend','In het weekend'],['regelmatig','Regelmatig'],['dagelijks','Dagelijks']] },
      { name:'water',   label:'Hoeveel water drinkt u per dag?', type:'select', options:[['','—'],['<1','Minder dan 1 liter'],['1-2','1–2 liter'],['>2','Meer dan 2 liter']] },
      { name:'slaap',   label:'Hoeveel uur slaapt u gemiddeld?', type:'select', options:[['','—'],['<6','Minder dan 6 uur'],['6-8','6–8 uur'],['>8','Meer dan 8 uur']] },
      { name:'stress',  label:'Stressniveau', type:'select', options:[['','—'],['laag','Laag'],['midden','Gemiddeld'],['hoog','Hoog']] }
    ]
  },
  {
    title: 'Akkoord',
    fields: [
      { name:'akkoordPrivacy',  label:'Ik ga akkoord met het privacybeleid', type:'checkbox' },
      { name:'akkoordVoorwaarden', label:'Ik ga akkoord met de behandelvoorwaarden', type:'checkbox' },
      { name:'handtekening', label:'Naam (digitale handtekening)', type:'text' }
    ]
  }
]; }

/* =========================================================
   E-MAIL TEMPLATES (default)
   ========================================================= */
function defaultMessageTemplates() {
  const tk = '\n\nMet vriendelijke groet,\n{salon}';
  return [
    {
      id: 'booking_thanks',
      key: 'booking_thanks',
      name: 'Bedankt voor uw reservering bij {salon}',
      subject: 'Bedankt voor uw reservering bij {salon}',
      body: 'Beste {voornaam},\n\nHartelijk dank voor uw reservering bij {salon}. Wij zien u graag op {datum} om {tijd} voor: {behandeling}.\n\nMocht u verhinderd zijn, geef het ons dan minstens 24 uur van tevoren door.' + tk,
      bcc: true
    },
    {
      id: 'appt_confirmation',
      key: 'appt_confirmation',
      name: 'Bevestiging van uw afspraak bij {salon}',
      subject: 'Bevestiging van uw afspraak bij {salon}',
      body: 'Beste {voornaam},\n\nHierbij bevestigen wij uw afspraak op {datum} om {tijd} voor:\n{behandeling}\n\nAdres:\n{salon}\n{salon_adres}\n{salon_postcode} {salon_plaats}' + tk,
      bcc: true
    },
    {
      id: 'appt_reminder',
      key: 'appt_reminder',
      name: 'Herinnering aan uw afspraak bij {salon}',
      subject: 'Herinnering aan uw afspraak bij {salon}',
      body: 'Beste {voornaam},\n\nDit is een vriendelijke herinnering aan uw afspraak op {datum} om {tijd}: {behandeling}.\n\nWij zien u graag!' + tk,
      bcc: true
    },
    {
      id: 'generic_message',
      key: 'generic_message',
      name: 'Een bericht van {salon}',
      subject: 'Een bericht van {salon}',
      body: 'Beste {voornaam},\n\n[uw bericht hier]' + tk,
      bcc: true
    },
    {
      id: 'invitation',
      key: 'invitation',
      name: 'Uitnodiging om een afspraak te maken bij {salon}',
      subject: 'Uitnodiging om een afspraak te maken bij {salon}',
      body: 'Beste {voornaam},\n\nHet is alweer even geleden dat we u zagen. Wij willen u graag uitnodigen om een nieuwe afspraak te plannen.' + tk,
      bcc: true
    },
    {
      id: 'birthday',
      key: 'birthday',
      name: 'Gefeliciteerd met uw verjaardag!',
      subject: 'Gefeliciteerd met uw verjaardag!',
      body: 'Beste {voornaam},\n\nNamens het hele team bij {salon} feliciteren wij u van harte met uw verjaardag! Wij wensen u een geweldige dag toe.' + tk,
      bcc: true
    },
    {
      id: 'invoice',
      key: 'invoice',
      name: 'Uw factuur van {salon}',
      subject: 'Uw Factuur van {salon}',
      body: 'Beste {volledige_naam},\n\nIn de bijlage ontvangt u de factuur ({factuurnummer}) voor de volgende afspraak:\n\nDatum: {datum_lang}\nVan: {tijd}\nTot: {tijd_tot}\n\nVriendelijke groeten,\n\n{salon}\n{salon_adres}\n{salon_postcode} {salon_plaats}\n\n{salon_telefoon}\n{salon_email}',
      bcc: true
    },
    {
      id: 'new_booking',
      key: 'new_booking',
      name: 'Een nieuwe reservering',
      subject: 'Een nieuwe reservering',
      body: 'Er is een nieuwe reservering binnengekomen voor {volledige_naam} op {datum} om {tijd}: {behandeling}.',
      bcc: true
    },
    {
      id: 'invite_appointment',
      key: 'invite_appointment',
      name: 'Maak een nieuwe afspraak bij {salon}',
      subject: 'Maak een nieuwe afspraak bij {salon}',
      body: 'Beste {voornaam},\n\nHet is tijd voor een vervolgafspraak. Plan eenvoudig een afspraak in via {website}.' + tk,
      bcc: false
    },
    {
      id: 'thank_visit',
      key: 'thank_visit',
      name: 'Bedankt voor uw bezoek bij {salon}',
      subject: 'Bedankt voor uw bezoek bij {salon}',
      body: 'Beste {voornaam},\n\nHartelijk dank voor uw bezoek vandaag. Wij hopen u snel weer te mogen verwelkomen!' + tk,
      bcc: false
    },
    {
      id: 'form_filled',
      key: 'form_filled',
      name: 'Formulier ingevuld bij {salon}',
      subject: 'Formulier ingevuld door {volledige_naam}',
      body: '{volledige_naam} heeft op {datum} het formulier ingevuld.',
      bcc: false
    },
    {
      id: 'intake_form_send',
      key: 'intake_form_send',
      name: 'Huidenquête / intakeformulier toesturen',
      subject: 'Huidenquête – {salon}',
      body: 'Beste {voornaam},\n\nGraag ontvangen wij vóór uw eerste behandeling de ingevulde huidenquête. Open onderstaande link en vul het formulier in:\n\n{intake_link}' + tk,
      bcc: true
    }
  ];
}

function getAppointmentEndHM(appointment) {
  if (!appointment) return '';
  const t0 = appointment.time || '00:00';
  const p = t0.split(':');
  const h = parseInt(p[0], 10) || 0;
  const m = parseInt(p[1], 10) || 0;
  let totalMin = h * 60 + m;
  let added = 0;
  (appointment.items || []).forEach(it => {
    if (it.kind === 'treatment') {
      const tr = findTreatment(it.refId);
      if (tr) { totalMin += Number(tr.duration) || 0; added += Number(tr.duration) || 0; }
    }
  });
  if (!added) totalMin += 5;
  const eH = (Math.floor(totalMin / 60) % 24);
  const eM = totalMin % 60;
  return String(eH).padStart(2, '0') + ':' + String(eM).padStart(2, '0');
}

function getTemplate(key) {
  const all = DB.messageTemplates || defaultMessageTemplates();
  return all.find(t => t.key === key) || defaultMessageTemplates().find(t => t.key === key);
}

function fillTokens(text, ctx) {
  const s = DB.settings || {};
  const tokens = {
    salon:           s.salonName || 'Salon',
    salon_adres:     s.address || '',
    salon_postcode:  s.postal || '',
    salon_plaats:    s.city || '',
    salon_telefoon:  s.phone || '',
    salon_email:     s.email || '',
    website:         s.website || '',
    kvk:             s.kvk || '',
    btw_nummer:      s.btwNummer || '',
    iban:            s.iban || '',
    voornaam:        ctx?.client?.firstName || '',
    achternaam:      ctx?.client?.lastName || '',
    volledige_naam:  ctx?.client ? clientFullName(ctx.client) : '',
    email:           ctx?.client?.email || '',
    datum:           ctx?.appointment ? fmtDate(ctx.appointment.date) : (ctx?.datum || ''),
    datum_lang:      ctx?.datum_lang || (ctx?.appointment ? `${weekdayName(ctx.appointment.date)} ${fmtDate(ctx.appointment.date)}` : ''),
    tijd:            ctx?.tijd != null && ctx.tijd !== '' ? ctx.tijd : (ctx?.appointment?.time || ''),
    tijd_tot:        ctx?.tijd_tot != null && ctx.tijd_tot !== '' ? ctx.tijd_tot : (ctx?.appointment ? getAppointmentEndHM(ctx.appointment) : ''),
    behandeling:     ctx?.appointment ? appointmentSummary(ctx.appointment) : (ctx?.behandeling || ''),
    totaal:          ctx?.totaal || '',
    betaalwijze:     ctx?.betaalwijze || '',
    factuurnummer:   ctx?.factuurnummer || '',
    intake_link:     ctx?.intake_link || ''
  };
  return (text || '').replace(/\{([a-z_]+)\}/g, (_, k) => tokens[k] !== undefined ? tokens[k] : '{'+k+'}');
}

function openIntakeForm(clientId, formId) {
  currentIntakeClientId = clientId;
  const c = findClient(clientId);
  if (!c) { showToast('Klant niet gevonden'); return; }
  ensureClientDossier(c);
  let form = (c.forms||[]).find(f => f.id === formId);
  if (!form) {
    form = { id: formId || uid('f'), title:'Huidenquête Elim Instituut', sentAt:new Date().toISOString(), filledAt:null, answers:{} };
    c.forms.unshift(form);
    saveData(DB);
  }
  showView('intake-form');
  renderIntakeForm(form.id);
}

function renderIntakeForm(formId) {
  const c = findClient(currentIntakeClientId);
  if (!c) return;
  const form = (c.forms||[]).find(f => f.id === formId);
  if (!form) return;

  $('#intakeTitle').textContent = `${form.title} – ${clientFullName(c) || 'nieuwe klant'}`;
  const el = $('#intakeContent');
  const a = form.answers || {};
  // Pre-fill from client when no answer yet
  function defaultVal(q) {
    if (a[q.name] !== undefined) return a[q.name];
    if (!q.autofill) return q.type === 'checkboxes' ? [] : '';
    if (q.autofill.startsWith('dossier.')) return (c.dossier||{})[q.autofill.slice(8)] || '';
    return c[q.autofill] || '';
  }

  function fieldHtml(q) {
    const v = defaultVal(q);
    if (q.type === 'textarea') return `<textarea name="${q.name}" rows="3">${escapeHtml(v)}</textarea>`;
    if (q.type === 'select')   return `<select name="${q.name}">${q.options.map(o => `<option value="${escapeHtml(o[0])}" ${v===o[0]?'selected':''}>${escapeHtml(o[1])}</option>`).join('')}</select>`;
    if (q.type === 'checkbox') return `<label class="ck-row"><input type="checkbox" name="${q.name}" ${v?'checked':''}> ${escapeHtml(q.label)}</label>`;
    if (q.type === 'checkboxes') {
      const arr = Array.isArray(v) ? v : (v ? String(v).split(',') : []);
      return `<div class="ck-grid">${q.options.map(o => `
        <label class="ck-row"><input type="checkbox" name="${q.name}" value="${escapeHtml(o)}" ${arr.includes(o)?'checked':''}> ${escapeHtml(o)}</label>
      `).join('')}</div>`;
    }
    return `<input type="${q.type}" name="${q.name}" value="${escapeHtml(v)}">`;
  }

  el.innerHTML = `
    <div class="card intake-card">
      <div class="card-title">${form.title}</div>
      <div class="card-body">
        ${form.filledAt ? `<p style="color:var(--green);">✓ Eerder ingevuld op ${fmtDate(form.filledAt.slice(0,10))}. U kunt antwoorden bijwerken.</p>` : ''}
        <p style="color:var(--muted); font-size:13px; margin-bottom:18px;">Vul dit formulier zo volledig mogelijk in. Uw gegevens worden vertrouwelijk behandeld en automatisch in uw klantkaart bijgewerkt.</p>
        <form id="intakeForm">
          ${INTAKE_QUESTIONS.map(group => `
            <h3 class="intake-section">${escapeHtml(group.title)}</h3>
            <div class="intake-grid">
              ${group.fields.map(q => q.type === 'checkbox'
                ? `<div class="intake-row full">${fieldHtml(q)}</div>`
                : `<div class="intake-row ${q.type==='textarea'||q.type==='checkboxes'?'full':''}">
                    <label>${escapeHtml(q.label)}</label>
                    ${fieldHtml(q)}
                   </div>`
              ).join('')}
            </div>
          `).join('')}
          <div style="margin-top:20px; display:flex; gap:10px;">
            <button type="submit" class="btn primary">Formulier versturen</button>
            <button type="button" class="btn ghost" id="intakeCancel">Annuleren</button>
          </div>
        </form>
      </div>
    </div>
  `;

  $('#intakeCancel').addEventListener('click', () => history.length>1 ? history.back() : showView('klanten'));
  $('#intakeForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const answers = {};
    INTAKE_QUESTIONS.forEach(g => g.fields.forEach(q => {
      if (q.type === 'checkboxes') answers[q.name] = fd.getAll(q.name);
      else if (q.type === 'checkbox') answers[q.name] = !!fd.get(q.name);
      else answers[q.name] = fd.get(q.name) || '';
    }));
    form.answers = answers;
    form.filledAt = new Date().toISOString();

    // Auto-fill client fields
    INTAKE_QUESTIONS.forEach(g => g.fields.forEach(q => {
      if (!q.autofill) return;
      const val = answers[q.name];
      if (val === '' || val === undefined || val === null) return;
      if (q.autofill.startsWith('dossier.')) {
        c.dossier = c.dossier || {};
        c.dossier[q.autofill.slice(8)] = val;
      } else {
        c[q.autofill] = val;
      }
    }));

    saveData(DB);
    showToast('Bedankt! Het formulier is opgeslagen.');
    if (currentDossierClientId === c.id) renderKlantdossier();
    else showView('klanten');
  });
}

/* Hash router for public intake links (?#intake=clientId&form=formId) */
function checkIntakeHash() {
  const h = location.hash || '';
  const m = h.match(/intake=([^&]+)(?:&form=([^&]+))?/);
  if (m) {
    const clientId = m[1];
    const formId   = m[2];
    setTimeout(() => openIntakeForm(clientId, formId), 50);
  }
}

/* =========================================================
   MODAL
   ========================================================= */
function openModal(title, html) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modalBackdrop').classList.remove('hidden');
}
function closeModal() {
  $('#modalBackdrop').classList.add('hidden');
  $('#modalBody').innerHTML = '';
  $('#modalBox')?.classList.remove('large', 'kopie-modal');
}

/* =========================================================
   AUTO-AFBOEKEN OM 21:00 NL TIJD
   Vergeten op Pin te drukken? Aan eind van de dag boeken we
   automatisch alle 'gepland'-afspraken van vandaag op Pin.
   ========================================================= */
function getAmsterdamNow() {
  const fmt = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  return {
    iso:  `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    min:  Number(parts.minute),
  };
}
function autoFinalizeForgotten() {
  const nl = getAmsterdamNow();
  if (nl.hour < 21) return;
  // Markeer dat we auto-finalize voor deze datum hebben gedaan zodat we het niet dubbel doen
  if (!DB.autoFinalizeLog) DB.autoFinalizeLog = {};
  if (DB.autoFinalizeLog[nl.iso]) return;

  const todays = (DB.appointments || []).filter(a =>
    a.date === nl.iso &&
    a.status === 'gepland' &&
    !a.paid &&
    (a.items || []).length > 0
  );
  if (!todays.length) {
    DB.autoFinalizeLog[nl.iso] = { count: 0, at: new Date().toISOString() };
    saveData(DB);
    return;
  }

  let count = 0;
  todays.forEach(a => {
    a.status        = 'afgerond';
    a.paid          = true;
    a.betaalwijze   = 'pin';
    a.afgerondAt    = new Date().toISOString();
    a.autoFinalized = true;
    if (!a.stockApplied) {
      (a.items||[]).forEach(it => {
        if (it.kind === 'product') {
          const p = findProduct(it.refId);
          if (p) p.stock = Math.max(0, (p.stock||0) - (it.qty||1));
        }
      });
      a.stockApplied = true;
    }
    count++;
  });

  DB.autoFinalizeLog[nl.iso] = { count, at: new Date().toISOString() };
  saveData(DB);

  if (count > 0) {
    showToast(`${count} vergeten afspraak/-en automatisch op Pin geboekt (21:00 regel)`);
    try { renderAgenda(); renderHome(); } catch(e) {}
  }
}

/* =========================================================
   EVENTS
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  console.log('%c✓ DOMContentLoaded — handlers worden aangekoppeld', 'color:#5fa463;');

  // ---- ULTRA-DIRECTE nav-handler ----
  // Iedere link in de sidebar krijgt een eigen handler. Geen delegation magie.
  function flashFeedback(el) {
    if (!el) return;
    const orig = el.style.background;
    el.style.background = '#f0c36d';
    setTimeout(() => { el.style.background = orig; }, 180);
  }

  // Alle nav-children (sub-items) direct binden
  document.querySelectorAll('.nav-child').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      flashFeedback(el);
      const view = el.dataset.view;
      const tab  = el.dataset.tab;
      console.log('%c⌘ klik op SUB-knop:', 'background:#5fa463; color:white; padding:2px 6px;', view, '→', tab);
      showView(view);
      if (view === 'beheer')     switchBeheerTab(tab);
      if (view === 'rapportage') switchRapportageTab(tab);
    });
  });

  // Parent toggles (Beheer / Rapportages): alleen submenu open/dicht klappen
  document.querySelectorAll('.nav-parent').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      flashFeedback(el);
      const isOpen = el.classList.toggle('open');
      const sub = el.nextElementSibling;
      if (sub && sub.classList.contains('nav-sub')) sub.classList.toggle('open', isOpen);
      console.log('%c⌘ klik op PARENT:', 'background:#b08966; color:white; padding:2px 6px;', el.id, isOpen ? 'open' : 'dicht');
    });
  });

  // Gewone primaire nav-items (Home, Agenda, Klanten, Instellingen)
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.classList.contains('nav-parent') || el.classList.contains('nav-child')) return;
    el.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      flashFeedback(el);
      const view = el.dataset.view;
      console.log('%c⌘ klik op TOP-knop:', 'background:#2d2a26; color:white; padding:2px 6px;', view);
      if (view) showView(view);
    });
  });

  $('#hamburger').addEventListener('click', (e) => {
    e.stopPropagation();
    if (isMobileNavLayout()) {
      const app = $('#appRoot') || $('.app');
      const on = !app.classList.contains('menu-open');
      app.classList.toggle('menu-open', on);
      document.body.classList.toggle('nav-menu-open', on);
      $('#hamburger')?.setAttribute('aria-expanded', on ? 'true' : 'false');
    } else {
      $('.app').classList.toggle('collapsed');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const dr = document.getElementById('clientDetailDrawer');
    if (dr?.classList.contains('is-open')) {
      closeClientDetailDrawer();
      e.preventDefault();
      return;
    }
    const m = $('#modalBackdrop');
    if (m && !m.classList.contains('hidden')) return;
    if (isMobileNavLayout() && $('.app')?.classList.contains('menu-open')) closeMobileNav();
  });
  let _agendaResizeTimer;
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMobileNav();
    clearTimeout(_agendaResizeTimer);
    _agendaResizeTimer = setTimeout(() => {
      const ag = document.querySelector('section.view[data-view="agenda"]');
      if (ag && !ag.classList.contains('hidden')) renderAgenda();
    }, 200);
  });

  // Modal
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalBackdrop').addEventListener('click', e => { if (e.target===$('#modalBackdrop')) closeModal(); });

  // Terug-knoppen op afspraak-detail en afrekenen pagina
  $('#apptBack')?.addEventListener('click', () => showView('agenda'));
  $('#afrBack')?.addEventListener('click',  () => {
    if (currentApptId) { openAppointmentDetail(currentApptId); }
    else { showView('agenda'); }
  });
  $('#dossierBack')?.addEventListener('click', () => showView('klanten'));
  $('#kaBack')?.addEventListener('click', () => {
    if (currentDossierClientId) openKlantdossier(currentDossierClientId);
    else showView('klanten');
  });
  $('#intakeBack')?.addEventListener('click', () => showView('klanten'));
  $('#facBack')?.addEventListener('click', () => {
    if (currentFacturaApptId) openAfrekenen(currentFacturaApptId);
    else showView('agenda');
  });

  // Hash router voor publieke intake-link (#intake=clientId&form=formId)
  checkIntakeHash();
  window.addEventListener('hashchange', checkIntakeHash);

  // Tab-knoppen bovenin de Rapportage en Beheer views
  document.addEventListener('click', e => {
    const tab = e.target.closest('.beheer-tab[data-tab]');
    if (!tab) return;
    const inRap = tab.closest('[data-view="rapportage"]');
    const inBeh = tab.closest('[data-view="beheer"]');
    if (inRap) switchRapportageTab(tab.dataset.tab);
    if (inBeh) switchBeheerTab(tab.dataset.tab);
  });

  // Reset: alles wissen (klanten / afspraken / betalingen) behalve catalogus & instellingen
  $('#resetDemo').addEventListener('click', () => {
    if (!confirm('Alle klanten, afspraken, cadeaubonnen en geboekte data wissen? Diensten en productprijzen blijven; productvoorraad = start. Zeker weten?')) return;
    clearAllTransactionalData();
    showView('home');
    renderHome();
    renderAgenda();
    renderClients('');
    const det = document.getElementById('clientDetail');
    if (det) { det.innerHTML = '<p class="empty">Selecteer een klant in de lijst.</p>'; }
    const t = document.getElementById('clientDetailTitle');
    if (t) t.textContent = 'Klantdetail';
    closeClientDetailDrawer(false);
    showToast('Alles leeggemaakt (klanten & agenda)');
  });
  $('#quickSettings').addEventListener('click', () => showView('instellingen'));

  // Home: klik op klantnaam / betaald
  document.addEventListener('click', e => {
    const link = e.target.closest('.name-link[data-client]');
    if (link?.dataset.client) { openKlantdossier(link.dataset.client); return; }
    const mpBtn = e.target.closest('[data-mark-paid]');
    if (mpBtn) markPaid(mpBtn.dataset.markPaid);
  });

  /* ---- Agenda ---- */
  $('#agendaDate').addEventListener('change', e => { agendaCurrentDate = e.target.value; renderAgenda(); });
  $('#prevWeek').addEventListener('click', () => {
    const d = parseLocalYMD(agendaCurrentDate);
    d.setDate(d.getDate() - 7);
    agendaCurrentDate = toLocalISODate(d);
    renderAgenda();
  });
  $('#nextWeek').addEventListener('click', () => {
    const d = parseLocalYMD(agendaCurrentDate);
    d.setDate(d.getDate() + 7);
    agendaCurrentDate = toLocalISODate(d);
    renderAgenda();
  });
  $('#todayBtn').addEventListener('click', () => { agendaCurrentDate = todayLocalISO(); renderAgenda(); });
  $('#newAppointment').addEventListener('click', () => openAppointmentModal(null));

  // Klik op lege cel = nieuwe afspraak
  $('#agendaTbody').addEventListener('click', e => {
    const completeBtn = e.target.closest('[data-complete]'); if (completeBtn) return completeAppointment(completeBtn.dataset.complete);
    const paidBtn = e.target.closest('[data-mark-paid]'); if (paidBtn) return markPaid(paidBtn.dataset.markPaid);
    const editBtn = e.target.closest('[data-edit]'); if (editBtn) return openAppointmentModal(DB.appointments.find(a=>a.id===editBtn.dataset.edit));
    const cell = e.target.closest('.agenda-slot');
    if (cell) {
      agendaCurrentDate = cell.dataset.date || agendaCurrentDate;
      openAppointmentModal({ id:'', date: cell.dataset.date||agendaCurrentDate, time: cell.dataset.slot||'10:00', clientId:'', items:[], status:'gepland', paid:false, notes:'' });
    }
  });

  // Klik op app-blokje (niet op knopje) → open detail-pagina
  $('#agendaTbody').addEventListener('click', e => {
    const block = e.target.closest('.app-block');
    if (block && !e.target.closest('.app-btn')) {
      openAppointmentDetail(block.dataset.appId);
    }
  });

  /* ---- Klanten ---- */
  $('#searchClient').addEventListener('input', e => {
    klantenListPage = 1;
    renderClients(e.target.value);
  });
  const klantenSortEl = $('#klantenSort');
  if (klantenSortEl) {
    klantenSortEl.value = (DB.settings && DB.settings.klantenSort) || 'lastName';
    klantenSortEl.addEventListener('change', () => {
      DB.settings.klantenSort = klantenSortEl.value;
      saveData(DB);
      klantenListPage = 1;
      renderClients($('#searchClient')?.value || '');
    });
  }
  $('#clientsPagination')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-klanten-page]');
    if (!btn || btn.disabled) return;
    e.preventDefault();
    const p = parseInt(btn.dataset.klantenPage, 10);
    if (Number.isNaN(p) || p < 1) return;
    klantenListPage = p;
    renderClients($('#searchClient')?.value || '');
    document.querySelector('.klanten-table-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('#newClient').addEventListener('click', () => openClientModal(null));
  $('#clientsBody').addEventListener('click', e => {
    const tr = e.target.closest('tr[data-client]');
    if (tr) openKlantdossier(tr.dataset.client);
  });
  $('#csvImport').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => importClientsCsv(ev.target.result);
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  });
  $('#csvExport').addEventListener('click', () => downloadFile('klanten.csv', clientsToCsv(), 'text/csv'));
  $('#csvTemplate').addEventListener('click', () => {
    downloadFile('klanten-voorbeeld.csv', 'voornaam,achternaam,telefoon,mobiel,email,verjaardag,adres,plaats\nTruus,Alblas Kroos,078-6813622,06-24460669,truus@voorbeeld.nl,14-01-1957,Notenbogert 21,HI AMBACHT', 'text/csv');
    showToast('Voorbeeld gedownload');
  });
  $('#afsprakenKlantenImport')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => importAppointmentsFromAfsprakenKlantenCsv(String(ev.target.result || ''));
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  });
  $('#afsprakenKlantenBundled')?.addEventListener('click', () => {
    if (location.protocol === 'file:') {
      showToast('Gebruik hiernaast “Afspraken inplannen” om het CSV te kiezen, of open de site via http://localhost');
      return;
    }
    showToast('Afspraken inlezen…');
    fetchAfsprakenKlantenCsvText()
      .then(t => importAppointmentsFromAfsprakenKlantenCsv(t))
      .catch(() => showToast('Afspraken klanten.csv niet gevonden naast index.html'));
  });
  if ($('#afsprakenKlantenBundled') && location.protocol === 'file:') {
    $('#afsprakenKlantenBundled').hidden = true;
  }
  $('#wipeImportedAfspraken')?.addEventListener('click', () => {
    if (!confirm(
      'Alle agenda-items wissen die ooit zijn ingelezen met “Afspraken inplannen”?\n'
      + 'Eigen afspraken die je los in de agenda hebt gezet blijven staan.\n\n'
      + 'Daarna: kies opnieuw je CSV-bestand onder “Afspraken inplannen”.'
    )) return;
    const n = wipeAllImportedAfsprakenKlantenAppointments();
    showToast(n ? `${n} import-afspraken verwijderd — nu opnieuw CSV kiezen` : 'Niets verwijderd (geen import-afspraken)');
  });
  $('#clientDetailDrawerClose')?.addEventListener('click', () => closeClientDetailDrawer());
  $('#clientDetailDrawerBackdrop')?.addEventListener('click', () => closeClientDetailDrawer());

  /* ---- Beheer tabs – handled by delegated document listener above ---- */

  // Openingstijden form
  document.addEventListener('change', e => {
    if (e.target.name === 'weekSchemaEnabled' || e.target.name === 'weekSchemaWorkOdd') renderWeekPreview();
  });
  $('#openingsForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    DB.settings.openTime  = fd.get('openTime') || '08:30';
    DB.settings.closeTime = fd.get('closeTime') || '18:00';
    DB.settings.weekSchemaEnabled = fd.get('weekSchemaEnabled') === 'on';
    DB.settings.weekSchemaWorkOdd = fd.get('weekSchemaWorkOdd') !== 'even';
    saveData(DB);
    renderAgenda();
    showToast('Openingstijden opgeslagen');
  });

  /* ---- Beheer ---- */
  $('#searchTreatment').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $$('.cat-block').forEach(block => {
      let anyVisible = false;
      block.querySelectorAll('tbody tr:not(.empty-row)').forEach(tr => {
        const match = !q || tr.textContent.toLowerCase().includes(q);
        tr.style.display = match ? '' : 'none';
        if (match) anyVisible = true;
      });
      block.style.display = (!q || anyVisible) ? '' : 'none';
    });
  });

  $('#addCategory').addEventListener('click', () => {
    const name = prompt('Naam van nieuwe categorie:');
    if (!name || !name.trim()) return;
    if (DB.treatmentCategories.includes(name.trim())) return showToast('Categorie bestaat al');
    DB.treatmentCategories.push(name.trim());
    saveData(DB); renderBeheer(); showToast('Categorie toegevoegd');
  });
  $('#newProduct').addEventListener('click', () => openProductModal(null));

  $('#treatmentsList').addEventListener('click', e => {
    const addBtn = e.target.closest('[data-add-to-cat]'); if (addBtn) return openTreatmentModal(null, addBtn.dataset.addToCat);
    const editCat = e.target.closest('[data-edit-cat]');
    if (editCat) {
      const old = editCat.dataset.editCat;
      const newName = prompt('Nieuwe naam voor categorie:', old);
      if (!newName || !newName.trim() || newName.trim()===old) return;
      const idx = DB.treatmentCategories.indexOf(old);
      if (idx>-1) DB.treatmentCategories[idx] = newName.trim();
      DB.treatments.forEach(t => { if (t.category===old) t.category=newName.trim(); });
      saveData(DB); renderBeheer(); return;
    }
    const delCat = e.target.closest('[data-del-cat]');
    if (delCat) {
      const cat = delCat.dataset.delCat;
      if (!confirm(`Categorie "${cat}" en alle diensten erin verwijderen?`)) return;
      DB.treatmentCategories = DB.treatmentCategories.filter(c=>c!==cat);
      DB.treatments = DB.treatments.filter(t=>t.category!==cat);
      saveData(DB); renderBeheer(); return;
    }
    const editT = e.target.closest('[data-edit-t]'); if (editT) return openTreatmentModal(findTreatment(editT.dataset.editT));
    const delT = e.target.closest('[data-del-t]');
    if (delT) {
      if (!confirm('Dienst verwijderen?')) return;
      DB.treatments = DB.treatments.filter(t=>t.id!==delT.dataset.delT);
      saveData(DB); renderBeheer(); showToast('Dienst verwijderd');
    }
  });

  // Product categorie toevoegen
  $('#addProductCategory').addEventListener('click', () => {
    const name = prompt('Naam van nieuwe productcategorie:');
    if (!name?.trim()) return;
    if ((DB.productCategories||[]).includes(name.trim())) return showToast('Categorie bestaat al');
    if (!DB.productCategories) DB.productCategories = [];
    DB.productCategories.push(name.trim());
    saveData(DB); renderBeheer(); showToast('Categorie toegevoegd');
  });

  // Producten delegated clicks (category blocks worden dynamisch aangemaakt)
  $('#panel-producten').addEventListener('click', e => {
    const addBtn = e.target.closest('[data-add-to-pcat]'); if (addBtn) return openProductModal(null, addBtn.dataset.addToPcat);
    const editCat = e.target.closest('[data-edit-pcat]');
    if (editCat) {
      const old = editCat.dataset.editPcat;
      const newName = prompt('Nieuwe naam:', old);
      if (!newName?.trim() || newName.trim()===old) return;
      const idx = (DB.productCategories||[]).indexOf(old);
      if (idx>-1) DB.productCategories[idx] = newName.trim();
      DB.products.forEach(p => { if (p.category===old) p.category=newName.trim(); });
      saveData(DB); renderBeheer(); return;
    }
    const delCat = e.target.closest('[data-del-pcat]');
    if (delCat) {
      const cat = delCat.dataset.delPcat;
      if (!confirm(`Categorie "${cat}" en alle producten erin verwijderen?`)) return;
      DB.productCategories = (DB.productCategories||[]).filter(c=>c!==cat);
      DB.products = DB.products.filter(p=>p.category!==cat);
      saveData(DB); renderBeheer(); return;
    }
    const editP = e.target.closest('[data-edit-p]'); if (editP) return openProductModal(findProduct(editP.dataset.editP));
    const delP = e.target.closest('[data-del-p]');
    if (delP) {
      if (!confirm('Product verwijderen?')) return;
      DB.products = DB.products.filter(p=>p.id!==delP.dataset.delP);
      saveData(DB); renderBeheer(); showToast('Product verwijderd');
    }
  });

  /* ---- Rapportage ---- */
  const repRender = { bestedingen: renderBestedingen, omzetcategorie: renderOmzetCategorie, omzetdienst: renderOmzetDienst };

  document.addEventListener('click', e => {
    if (e.target.id==='dagPrev')   { const d=new Date(dagDate); d.setDate(d.getDate()-1); dagDate=d.toISOString().slice(0,10); renderDagrapport(); }
    if (e.target.id==='dagNext')   { const d=new Date(dagDate); d.setDate(d.getDate()+1); dagDate=d.toISOString().slice(0,10); renderDagrapport(); }
    if (e.target.id==='dagToday')  { dagDate=todayISO(); renderDagrapport(); }
    if (e.target.id==='printDag')  { window.print(); }

    const zoek = e.target.closest('.rap-zoeken');
    if (zoek) { const r = zoek.dataset.rep; if (repRender[r]) repRender[r](); }
  });

  document.addEventListener('change', e => {
    if (e.target.id==='dagDate') { dagDate=e.target.value; renderDagrapport(); }

    /* periode-radio */
    const m = e.target.name && e.target.name.match(/^rap-mode-(.+)$/);
    if (m && e.target.checked) {
      const rep = m[1];
      reportFilters[rep].mode = e.target.value;
      repRender[rep] && repRender[rep]();
      return;
    }

    /* periode-controls */
    const rep = e.target.dataset && e.target.dataset.rep;
    if (rep && reportFilters[rep]) {
      const f = reportFilters[rep];
      if (e.target.classList.contains('rap-month'))    f.month   = parseInt(e.target.value,10);
      if (e.target.classList.contains('rap-quarter'))  f.quarter = parseInt(e.target.value,10);
      if (e.target.classList.contains('rap-year'))     f.year    = parseInt(e.target.value,10);
      if (e.target.classList.contains('rap-from'))     f.from    = e.target.value;
      if (e.target.classList.contains('rap-to'))       f.to      = e.target.value;
      if (e.target.classList.contains('rap-soort'))    f.soort   = e.target.value;
      repRender[rep] && repRender[rep]();
    }
  });

  /* ---- Instellingen tabs ---- */
  document.addEventListener('click', e => {
    const tab = e.target.closest('[data-view="instellingen"] .beheer-tab[data-stab]');
    if (tab) switchSettingsTab(tab.dataset.stab);
  });

  // Init
  $('#brandName').textContent = DB.settings.salonName || 'Salon';
  showView('home');

  void bootstrapSalonFromHostedSeed().then(async seeded => {
    const merged = await tryMergeBundledSalonwareCsv();
    if (!seeded && (DB.clients || []).length === 0) {
      await tryImportBundledSalonwareCsv();
    }
    await tryImportBundledAfsprakenKlantenCsv();
    if (seeded || merged) {
      const bits = [`${DB.clients.length} klanten`, `${DB.appointments.length} afspraken`];
      if (merged && (merged.updated || merged.added)) bits.push(`${merged.updated} notities bijgewerkt`);
      showToast(bits.join(' · '));
    }
    try { updateSalonwareBundledChrome(); } catch (e) { /* */ }
    try {
      renderClients($('#searchClient')?.value || '');
      renderAgenda();
      renderHome();
    } catch (e) { /* */ }
  });

  // ---- AUTO-AFBOEKEN OM 21:00 NL TIJD ----
  // Run direct bij laden (mocht je het na 21:00 openen)
  try { autoFinalizeForgotten(); } catch(e) { console.error(e); }
  // En elke minuut checken of het 21:00 is geworden
  setInterval(() => {
    try { autoFinalizeForgotten(); } catch(e) { console.error(e); }
  }, 60 * 1000);
});
