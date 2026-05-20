/* eslint-disable no-console */
/** Bouwt salon-seed.json: alle klanten + afspraken — automatisch geladen op GitHub Pages. */
const fs = require("fs");
const path = require("path");

const KLANTEN_CSV = path.join(__dirname, "..", "salonware-download (2).csv");
const AFSPRAKEN_CSV = path.join(__dirname, "..", "Afspraken klanten.csv");
const OUT = path.join(__dirname, "..", "salon-seed.json");
const SEED_VERSION = 1;

function parseCsv(text, d) {
  const rows = [];
  let row = [];
  let field = "";
  let q = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') q = 0;
      else field += c;
    } else if (c === '"') q = 1;
    else if (c === d) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length && r.some((x) => x !== ""));
}

function headerFirst(row) {
  const m = new Map();
  row.forEach((h, i) => {
    const k = String(h || "")
      .trim()
      .replace(/^"|"$/g, "")
      .toLowerCase();
    if (!m.has(k)) m.set(k, i);
  });
  return m;
}

function normKey(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/^"|"$/g, "")
    .replace(/[\s_\-]/g, "");
}

function colFirst(headers, names) {
  const want = new Set(names.map(normKey));
  for (let i = 0; i < headers.length; i++) {
    if (want.has(normKey(headers[i]))) return i;
  }
  return -1;
}

function normalizeDate(s) {
  if (!s) return "";
  const t = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const m2 = t.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  return "";
}

function parseMoney(s) {
  if (!s) return null;
  const t = String(s).trim().replace(/^"|"$/g, "");
  if (!t) return null;
  const n = parseFloat(t.replace(/\./g, "").replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

function sanitizeNotes(s, max = 400) {
  if (!s) return "";
  let o = String(s).trim();
  if (o.includes("{\\rtf") || /\brtf1\b/i.test(o)) {
    o = o
      .replace(/\\'[0-9a-f]{2}/gi, " ")
      .replace(/\\par ?/gi, "\n")
      .replace(/[{}\\]+/g, " ")
      .replace(/ +/g, " ")
      .replace(/\n{3,}/g, "\n\n");
  }
  if (o.length > max) o = o.slice(0, max) + "…";
  return o.trim();
}

const NL_MONTH = {
  jan: 1, januari: 1, feb: 2, februari: 2, mrt: 3, maart: 3,
  apr: 4, april: 4, mei: 5, jun: 6, juni: 6,
  jul: 7, juli: 7, aug: 8, augustus: 8,
  sep: 9, sept: 9, september: 9,
  okt: 10, oct: 10, oktober: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

function isoFromLooseDdMmY(ddStr, mmStr, yyRaw) {
  const d = parseInt(ddStr, 10);
  const mo = parseInt(mmStr, 10);
  let y = parseInt(yyRaw, 10);
  if (Number.isNaN(d) || Number.isNaN(mo) || Number.isNaN(y)) return "";
  if (String(yyRaw).trim().length === 2) y = y <= 49 ? 2000 + y : 1900 + y;
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return "";
  return normalizeDate(`${d}-${mo}-${y}`);
}

function extractVisitDatesIsoFromNlNotes(notesRaw) {
  const plain = sanitizeNotes(notesRaw, 8000);
  const maxIso = "2028-12-31";
  const minIso = "1995-01-01";
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
    const monWord = String(m[2]).toLowerCase().replace(/\.$/, "");
    const yy = parseInt(m[3], 10);
    const mon = NL_MONTH[monWord];
    if (!mon || !yy || day < 1 || day > 31) continue;
    const iso = normalizeDate(`${day}-${mon}-${yy}`);
    if (iso && iso >= minIso && iso <= maxIso) found.add(iso);
  }
  return [...found].sort();
}

function inferTreatmentRefId(notes) {
  const s = String(notes || "").toLowerCase();
  if (/peel\s*acne\s*extra|acne\s*extra/.test(s)) return "t101";
  if (/acne/.test(s)) return "t100";
  if (/ipl/.test(s)) {
    if ((/bovenlip/.test(s) || /boven lip/.test(s)) && /\bkin\b| kin/.test(s)) return "t060";
    if (/bikinilijn|bikini/.test(s)) return "t043";
    if (/oksels?|oksel/.test(s)) return "t045";
    if (/\bkin\b| kin /.test(s) && !/bovenlip|boven lip/.test(s)) return "t047";
    if (/bovenlip|boven lip/.test(s)) return "t046";
    return "t060";
  }
  if (/dermastamp|groeifactoren.*peel/.test(s)) return "t090";
  if (/mesodermapen|meso\s*derma|dermapen/.test(s)) return "t091";
  if (/biomicroneedling|bio\s*micro/.test(s)) {
    if (/pigment/.test(s)) return "t120";
    if (/acne/.test(s)) return "t121";
    return "t123";
  }
  if (/plasma\s*facial|bio\s*plasma|^plasma\b/.test(s)) return "t001";
  if (/microdermabrasie|microderma|^\s*micro\s*\d|micro\s+45/.test(s)) return "t030";
  if (/collageen|collagen|elastine\s*booster/.test(s)) return "t081";
  if (/elim|skin.?scan|huidherstel\s*formule|wanglijm/.test(s)) return "t020";
  if (/elektrisch\s*onthar/.test(s)) return "t070";
  return "t020";
}

const TREATMENT_NAMES = {
  t020: "Elim huidherstel formule (SKIN-scan + CollagenElastineBooster behandeling of Vital C peel + RC wangslijmtest)",
  t100: "Peel Acne",
  t101: "Peel Acne extra",
  t060: "IPL Bovenlip + kin",
  t043: "IPL Bikinilijn volledig",
  t045: "IPL Bikinilijn + Oksels",
  t047: "IPL Kin",
  t046: "IPL Bovenlip",
  t090: "Dermastamp + groeifactoren + peel",
  t091: "MesoDermapen",
  t120: "Biomicroneedling Pigment",
  t121: "Biomicroneedling Acne",
  t123: "Biomicroneedling Huidverjonging",
  t001: "Plasma facial",
  t030: "Microdermabrasie",
  t081: "CollageenElastinebooster",
  t070: "Elektrisch ontharen",
};

const TREATMENT_PRICES = {
  t020: 249, t100: 145, t101: 159.5, t060: 110, t043: 169, t045: 99, t047: 74, t046: 69,
  t090: 449, t091: 284.5, t120: 295, t121: 295, t123: 295, t001: 250, t030: 155, t081: 169.5, t070: 70,
};

function treatmentItem(refId) {
  return {
    kind: "treatment",
    refId,
    savedName: TREATMENT_NAMES[refId] || "Behandeling",
    qty: 1,
    price: TREATMENT_PRICES[refId] || 0,
  };
}

function readCsv(file) {
  if (!fs.existsSync(file)) {
    console.error("Ontbreekt:", file);
    process.exit(1);
  }
  let t = fs.readFileSync(file, "utf8");
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
  return parseCsv(t, ";");
}

// ---- Klanten ----
const kRows = readCsv(KLANTEN_CSV);
const kH = headerFirst(kRows[0]);
const col = (n) => kH.get(n) ?? -1;

const clients = [];
const clientByImportId = new Map();

for (let i = 1; i < kRows.length; i++) {
  const r = kRows[i];
  const extId = col("klant_id") > -1 ? String((r[col("klant_id")] || "").trim()) : "";
  if (!extId) continue;

  let fn = col("voornaam") > -1 ? (r[col("voornaam")] || "").trim() : "";
  let ln = col("achternaam") > -1 ? (r[col("achternaam")] || "").trim() : "";
  const pref = col("voorvoegsel") > -1 ? (r[col("voorvoegsel")] || "").trim() : "";
  if (pref) ln = [pref, ln].filter(Boolean).join(" ").trim();
  if (!fn && !ln) continue;

  let addr = col("adres") > -1 ? (r[col("adres")] || "").trim() : "";
  const huis = col("huisnummer") > -1 ? (r[col("huisnummer")] || "").trim() : "";
  if (huis) addr = [addr, huis].filter(Boolean).join(" ").trim();

  const g0 = (col("geslacht") > -1 ? (r[col("geslacht")] || "").trim() : "").toUpperCase().charAt(0);
  const gender = g0 === "M" ? "M" : g0 === "V" ? "V" : "V";

  const salonImport = {};
  if (col("eersteafspraak") > -1) {
    const v = normalizeDate((r[col("eersteafspraak")] || "").trim());
    if (v) salonImport.eersteAfspraak = v;
  }
  if (col("laatsteafspraak") > -1) {
    const v = normalizeDate((r[col("laatsteafspraak")] || "").trim());
    if (v) salonImport.laatsteAfspraak = v;
  }
  if (col("totaalomzet") > -1) {
    const m = parseMoney(r[col("totaalomzet")]);
    if (m !== null) salonImport.totaalOmzet = m;
  }

  const c = {
    id: `c_sw_${extId}`,
    gender,
    initials: col("voorletters") > -1 ? (r[col("voorletters")] || "").trim() : "",
    firstName: fn,
    lastName: ln,
    address: addr,
    city: col("plaats") > -1 ? (r[col("plaats")] || "").trim() : "",
    zip: col("postcode") > -1 ? (r[col("postcode")] || "").trim() : "",
    phone: col("telefoon") > -1 ? (r[col("telefoon")] || "").trim() : "",
    mobile: col("mobiel") > -1 ? (r[col("mobiel")] || "").trim() : "",
    email: col("email") > -1 ? (r[col("email")] || "").trim() : "",
    birthday: col("geboortedatum") > -1 ? normalizeDate((r[col("geboortedatum")] || "").trim()) : "",
    notes: sanitizeNotes(col("opmerkingen") > -1 ? r[col("opmerkingen")] : "", 400),
    notesInternal: sanitizeNotes(col("opmerkingen_intern") > -1 ? r[col("opmerkingen_intern")] : "", 250),
    mustPayFirst: "standaard",
    importSourceId: extId,
  };
  if (Object.keys(salonImport).length) c.salonImport = salonImport;
  clients.push(c);
  clientByImportId.set(extId, c);
}

// ---- Afspraken (Afspraken klanten.csv) ----
const aRows = readCsv(AFSPRAKEN_CSV);
const aHeaders = aRows[0].map((h) => String(h || "").trim().toLowerCase().replace(/^"|"$/g, ""));
const hEerste = colFirst(aHeaders, ["eersteafspraak"]);
const hLaatste = colFirst(aHeaders, ["laatsteafspraak"]);
const hNotes = colFirst(aHeaders, ["opmerkingen"]);
const hKlant = colFirst(aHeaders, ["klant_id"]);

const TODAY = new Date().toISOString().slice(0, 10);
const appointments = [];
let aid = 0;

for (let i = 1; i < aRows.length; i++) {
  const r = aRows[i];
  if ((r?.length || 0) + 20 < aHeaders.length) continue;

  const extId = hKlant > -1 ? String((r[hKlant] || "").trim()) : "";
  const c = clientByImportId.get(extId);
  if (!c) continue;

  const notesRaw = hNotes > -1 ? String(r[hNotes] || "") : "";
  const refId = inferTreatmentRefId(notesRaw);
  const eerste = hEerste > -1 ? normalizeDate(String((r[hEerste] || "").trim())) : "";
  const laatsteRaw = hLaatste > -1 ? normalizeDate(String((r[hLaatste] || "").trim())) : "";
  const laatstePast = laatsteRaw && laatsteRaw <= TODAY ? laatsteRaw : "";
  const noteDates = extractVisitDatesIsoFromNlNotes(notesRaw);

  const slots = [];
  const seen = new Set();
  function push(date, role) {
    if (!date || seen.has(date)) return;
    seen.add(date);
    slots.push({ date, role });
  }
  if (eerste) push(eerste, "eerste");
  if (laatstePast) push(laatstePast, "laatste");
  let nNote = 0;
  for (const d of noteDates) {
    if (nNote >= 24) break;
    push(d, "notitie");
    nNote++;
  }
  slots.sort((a, b) => a.date.localeCompare(b.date));

  const noteShort = sanitizeNotes(notesRaw, 200);
  let sub = 0;
  for (const slot of slots) {
    const isFuture = slot.date >= TODAY;
    const status = isFuture ? "gepland" : "afgerond";
    const baseMins = 9 * 60 + ((i * 2 + sub) * 19) % (8 * 60);
    sub++;
    const hh = String(Math.floor(baseMins / 60)).padStart(2, "0");
    const mm = String(baseMins % 60).padStart(2, "0");
    aid++;
    appointments.push({
      id: `a_seed_${extId}_${aid}`,
      date: slot.date,
      time: `${hh}:${mm}`,
      clientId: c.id,
      items: [treatmentItem(refId)],
      status,
      paid: status === "afgerond",
      notes: `[Seed Afspraken klanten.csv ${slot.role}]${noteShort ? "\n" + noteShort : ""}`,
      importTag: "afspraken-klanten-csv",
      importSlot: slot.role,
    });
  }
}

const seed = { v: SEED_VERSION, clients, appointments };
fs.writeFileSync(OUT, JSON.stringify(seed));
console.log(
  OUT,
  "| klanten:", clients.length,
  "| afspraken:", appointments.length,
  "| MB:", (fs.statSync(OUT).size / 1024 / 1024).toFixed(2)
);
