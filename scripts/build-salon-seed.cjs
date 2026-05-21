/* eslint-disable no-console */
/**
 * Bouwt salon-seed.json uit Elim klanten + Salonware stats + v2 orders (echte agenda).
 */
const fs = require("fs");
const path = require("path");

const ELIM_CSV = path.join(__dirname, "..", "Elim klanten volledig.csv");
const V2_CSV = path.join(__dirname, "..", "v2.csv");
const SALONWARE_CSV = path.join(__dirname, "..", "salonware-download (2).csv");
const OUT = path.join(__dirname, "..", "salon-seed.json");
const SEED_VERSION = 6;
const TODAY = new Date().toISOString().slice(0, 10);
const T_REF = "t130";
const P_REF = "p020";

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

function r(row, H, name) {
  const i = H.get(name);
  return i > -1 ? String(row[i] || "").trim() : "";
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
  if (s === undefined || s === null) return 0;
  let x = String(s).trim().replace(/^"|"$/g, "");
  if (!x) return 0;
  if (x.includes(",")) x = x.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(x);
  return Number.isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function sanitizeNotes(s, max = 1500) {
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

function dateTimeParts(s) {
  const t = String(s || "").trim();
  const m = t.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return { date: "", time: "" };
  const hh = m[2] != null ? String(m[2]).padStart(2, "0") : "";
  const mm = m[3] != null ? String(m[3]).padStart(2, "0") : "";
  return { date: m[1], time: hh && mm ? `${hh}:${mm}` : "" };
}

function dateTimeToMinutes(s) {
  const t = String(s || "").trim();
  const m = t.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** Behandelduur uit duur_minuten, anders vantijd→tottijd, anders 30 min. */
function treatmentDurationMins(row, H) {
  const dm = parseInt(r(row, H, "duur_minuten") || "0", 10) || 0;
  if (dm > 1) return dm;
  const a = dateTimeToMinutes(r(row, H, "vantijd"));
  const b = dateTimeToMinutes(r(row, H, "tottijd"));
  if (a != null && b != null && b > a) return b - a;
  return 30;
}

function isTreatmentLine(row, H) {
  const vt = r(row, H, "vantijd");
  const dur = parseInt(r(row, H, "duur_minuten") || "0", 10);
  if (vt) return true;
  if (dur > 0) return true;
  const cat = r(row, H, "naam").toLowerCase();
  const desc = r(row, H, "omschrijving").toLowerCase();
  if (/verkoop|diversen|image verkoop|laviesage verkoop|dermaquest verkoop|aesthetico verkoop|mukti organics/i.test(cat)) {
    return false;
  }
  return /peel|ipl|kennismaking|dermapen|collageen|plasma|micro|acne|facial|epil|zuurstof|elim|behandel|lift|scan|therapie|needling|carboxy|massage|wax|hars|verven|brow|wimper/i.test(desc + " " + cat);
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

// ---- Salonware stats ----
const swRows = fs.existsSync(SALONWARE_CSV) ? readCsv(SALONWARE_CSV) : [];
const swH = swRows.length ? headerFirst(swRows[0]) : new Map();
const swById = new Map();
for (let i = 1; i < swRows.length; i++) {
  const row = swRows[i];
  const id = r(row, swH, "klant_id");
  if (!id) continue;
  const si = {};
  const e1 = normalizeDate(r(row, swH, "eersteafspraak"));
  const e2 = normalizeDate(r(row, swH, "laatsteafspraak"));
  if (e1) si.eersteAfspraak = e1;
  if (e2) {
    if (e2 > TODAY) si.laatsteAfspraakGepland = e2;
    else si.laatsteAfspraak = e2;
  }
  const to = parseMoney(r(row, swH, "totaalomzet"));
  const ao = parseMoney(r(row, swH, "afspraakomzet"));
  const po = parseMoney(r(row, swH, "productomzet"));
  if (to) si.totaalOmzet = to;
  if (ao) si.afspraakOmzet = ao;
  if (po) si.productOmzet = po;
  if (Object.keys(si).length) swById.set(id, si);
}

// ---- Klanten uit Elim (2403 uniek, geen dubbelen op klant_id) ----
const eRows = readCsv(ELIM_CSV);
const eH = headerFirst(eRows[0]);
const clientsById = new Map();

for (let i = 1; i < eRows.length; i++) {
  const row = eRows[i];
  const extId = r(row, eH, "klant_id");
  if (!extId) continue;
  if (clientsById.has(extId)) continue;

  let fn = r(row, eH, "voornaam");
  let ln = r(row, eH, "achternaam");
  const pref = r(row, eH, "voorvoegsel");
  if (pref) ln = [pref, ln].filter(Boolean).join(" ").trim();
  if (!fn && !ln) {
    fn = "Klant";
    ln = extId;
  }

  let addr = r(row, eH, "adres");
  const huis = r(row, eH, "huisnummer");
  if (huis) addr = [addr, huis].filter(Boolean).join(" ").trim();

  const g0 = r(row, eH, "geslacht").toUpperCase().charAt(0);
  const c = {
    id: `c_sw_${extId}`,
    gender: g0 === "M" ? "M" : "V",
    initials: r(row, eH, "voorletters"),
    firstName: fn,
    lastName: ln,
    address: addr,
    city: r(row, eH, "plaats"),
    zip: r(row, eH, "postcode"),
    phone: r(row, eH, "telefoon"),
    mobile: r(row, eH, "mobiel"),
    email: r(row, eH, "email"),
    birthday: normalizeDate(r(row, eH, "geboortedatum")),
    notes: sanitizeNotes(row[eH.get("opmerkingen")] || "", 900),
    notesInternal: sanitizeNotes(row[eH.get("opmerkingen_intern")] || "", 400),
    mustPayFirst: "standaard",
    importSourceId: extId,
  };
  const si = swById.get(extId);
  if (si) c.salonImport = { ...si };
  clientsById.set(extId, c);
}

// ---- v2 orders → afspraken (per order_id, alle regels = items) ----
const vRows = readCsv(V2_CSV);
const vH = headerFirst(vRows[0]);
const orders = new Map();

for (let i = 1; i < vRows.length; i++) {
  const row = vRows[i];
  const oid = r(row, vH, "order_id");
  const kid = r(row, vH, "klant_id");
  if (!oid || !kid) continue;

  if (!orders.has(oid)) {
    orders.set(oid, { oid, kid, rows: [] });
  }
  orders.get(oid).rows.push(row);

  if (!clientsById.has(kid)) {
    let fn = r(row, vH, "voornaam");
    let ln = r(row, vH, "achternaam");
    const pref = r(row, vH, "voorvoegsel");
    if (pref) ln = [pref, ln].filter(Boolean).join(" ").trim();
    if (fn || ln) {
      let addr = r(row, vH, "adres");
      const huis = r(row, vH, "huisnummer");
      if (huis) addr = [addr, huis].filter(Boolean).join(" ").trim();
      const g0 = r(row, vH, "geslacht").toUpperCase().charAt(0);
      const c = {
        id: `c_sw_${kid}`,
        gender: g0 === "M" ? "M" : "V",
        initials: r(row, vH, "voorletters"),
        firstName: fn || "Klant",
        lastName: ln || kid,
        address: addr,
        city: r(row, vH, "plaats"),
        zip: r(row, vH, "postcode"),
        phone: r(row, vH, "telefoon"),
        mobile: r(row, vH, "mobiel"),
        email: r(row, vH, "email"),
        birthday: normalizeDate(r(row, vH, "geboortedatum")),
        notes: "",
        notesInternal: "",
        mustPayFirst: "standaard",
        importSourceId: kid,
      };
      const si = swById.get(kid);
      if (si) c.salonImport = { ...si };
      clientsById.set(kid, c);
    }
  }
}

const appointments = [];
let seq = 0;

for (const order of orders.values()) {
  const clientId = `c_sw_${order.kid}`;
  if (!clientsById.has(order.kid)) continue;

  let date = "";
  let time = "";
  for (const row of order.rows) {
    const vt = dateTimeParts(r(row, vH, "vantijd"));
    if (vt.date) {
      date = vt.date;
      if (vt.time) time = vt.time;
      break;
    }
  }
  if (!date) {
    const dt = dateTimeParts(r(order.rows[0], vH, "datumtijd"));
    date = dt.date;
    time = dt.time || "10:00";
  }
  if (!date) continue;
  if (!time) time = "10:00";
  if (time === "00:00") time = "10:00";

  const items = [];
  for (const row of order.rows) {
    const label = r(row, vH, "omschrijving") || r(row, vH, "naam") || "Regel";
    const price = parseMoney(r(row, vH, "regelprijs")) || parseMoney(r(row, vH, "stukprijs"));
    const qty = Math.max(1, parseInt(r(row, vH, "aantal") || "1", 10) || 1);
    const kind = isTreatmentLine(row, vH) ? "treatment" : "product";
    const item = {
      kind,
      refId: kind === "product" ? P_REF : T_REF,
      savedName: label,
      preferSavedName: true,
      qty,
      price,
      category: r(row, vH, "naam"),
    };
    if (kind === "treatment") item.duration = treatmentDurationMins(row, vH);
    items.push(item);
  }
  if (!items.length) continue;

  seq++;
  const isFuture = date >= TODAY;
  appointments.push({
    id: `a_v2_${order.oid}`,
    clientId,
    date,
    time,
    status: isFuture ? "gepland" : "afgerond",
    paid: !isFuture,
    notes: r(order.rows[0], vH, "opmerkingen") || "Elim v2 import",
    items,
    importTag: "elim-v2",
    importOrderId: order.oid,
  });
}

appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

const clients = [...clientsById.values()];
const seed = { v: SEED_VERSION, clients, appointments };
fs.writeFileSync(OUT, JSON.stringify(seed));

const mb = fs.statSync(OUT).size / 1024 / 1024;
console.log(OUT);
console.log("| klanten:", clients.length, "| uniek klant_id (geen dubbelen)");
console.log("| afspraken (orders):", appointments.length);
console.log("| MB:", mb.toFixed(2));

const byYear = {};
appointments.forEach((a) => {
  const y = a.date.slice(0, 4);
  byYear[y] = (byYear[y] || 0) + 1;
});
console.log("| per jaar:", Object.entries(byYear).sort().map(([y, n]) => `${y}:${n}`).join(" "));

const ri = appointments.filter((a) => a.clientId === "c_sw_445152").slice(0, 3);
console.log("Voorbeeld Rianne:", ri.map((a) => `${a.date} ${a.time} ${a.items.map((i) => i.savedName).join("+")}`).join(" | "));
