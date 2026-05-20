/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const CSV = path.join(__dirname, "..", "salonware-download (1).csv");
const OUT = path.join(__dirname, "..", "embedded-seed-data.js");

/** Puntkomma-CSV met "..." velden; newlines binnen quotes blijven één veld. */
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
      } else if (c === '"') {
        q = 0;
      } else {
        field += c;
      }
    } else if (c === '"') {
      q = 1;
    } else if (c === d) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      if (q) {
        field += "\n";
      } else {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      }
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length && r.some((c) => c !== ""));
}

/** Eerste kolom wint (Salonware herhaalt o.a. klant_id, geslacht, voornaam verderop). */
function headerColFirst(headerRow) {
  const m = new Map();
  headerRow.forEach((h, i) => {
    const key = String(h || "")
      .trim()
      .replace(/^"|"$/g, "")
      .toLowerCase();
    if (!m.has(key)) m.set(key, i);
  });
  return m;
}

function parseMoney(s) {
  if (!s || !String(s).trim()) return 0;
  let x = String(s).trim();
  if (x.includes(",")) x = x.replace(/\./g, "").replace(",", ".");
  return Math.round((parseFloat(x) || 0) * 100) / 100;
}

function parseDateYmd(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const m2 = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  return null;
}

const j = (v) => JSON.stringify(v, null, 0);

if (!fs.existsSync(CSV)) {
  console.error("Geen CSV:", CSV);
  console.error("Leg het Salonware-exportbestand (puntkomma) in de projectmap om embedded-seed-data.js te bouwen.");
  process.exit(1);
}
let t = fs.readFileSync(CSV, "utf8");
if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
const R = parseCsv(t, ";");
if (R.length < 2) {
  console.error("Geen data in CSV");
  process.exit(1);
}
const H = headerColFirst(R[0]);
const col = (name) => H.get(name) ?? -1;

const idxId = col("klant_id");
const idxVoorn = col("voornaam");
const idxVoorV = col("voorvoegsel");
const idxAchter = col("achternaam");
const idxGesl = col("geslacht");
const idxGeboorte = col("geboortedatum");
const idxAdr = col("adres");
const idxHuis = col("huisnummer");
const idxPost = col("postcode");
const idxPlaats = col("plaats");
const idxEmail = col("email");
const idxTel = col("telefoon");
const idxMob = col("mobiel");
const idxOp1 = col("opmerkingen");
const idxOp2 = col("opmerkingen_intern");
const idxE1 = col("eersteafspraak");
const idxE2 = col("laatsteafspraak");
const idxAfspOmz = col("afspraakomzet");
const idxProdOmz = col("productomzet");
const idxAantBeh = col("aantalbehandelingen");
const idxAantProd = col("aantalproducten");

function splitAmountCents(total, n) {
  if (n <= 0) return [];
  const c = Math.round(total * 100);
  const each = Math.floor(c / n);
  const rem = c % n;
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push((each + (i < rem ? 1 : 0)) / 100);
  }
  return out;
}

/** Proportioneel verdelen (centen exact), gewichten > 0. */
function splitToTargetCentsByWeights(targetCents, weights) {
  const n = weights.length;
  if (n === 0) return [];
  const w = weights.map((x) => (x > 0 ? x : 0.0001));
  const s = w.reduce((a, b) => a + b, 0) || 1;
  const parts = w.map((x) => Math.floor((targetCents * x) / s));
  let r = targetCents - parts.reduce((a, b) => a + b, 0);
  let j = 0;
  while (r > 0) {
    parts[j % n]++;
    r--;
    j++;
  }
  return parts.map((c) => c / 100);
}

/**
 * Eurobedragen uit lopende tekst (o.a. notities) — in documentvolgorde.
 * NL: 1.234,56 en 12,50; "114 euro"; "128 x 2"; jaren 1900–2100 alleen als € wanneer geen komma-decimalen.
 */
function extractMoneyFromString(plain) {
  const t = String(plain || "");
  const raw = [];
  const re1 = /(\d{1,3}(?:\.\d{3})*,\d{2})/g;
  let m;
  while ((m = re1.exec(t))) {
    const v = parseMoney(m[1]);
    if (v >= 0.5 && v < 200000) {
      raw.push({ i: m.index, len: m[0].length, v });
    }
  }
  const re3 = /(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2}|\b\d{2,4}\b)\s*x\s*(\d{1,2})/gi;
  re3.lastIndex = 0;
  while ((m = re3.exec(t))) {
    const left = String(m[1]);
    let a;
    if (left.includes(",")) a = parseMoney(left);
    else {
      a = parseFloat(left);
      if (a >= 1900 && a <= 2100) continue;
    }
    const k = parseInt(m[2], 10);
    if (!(a > 0) || !(k > 0) || a * k < 0.5) continue;
    raw.push({ i: m.index, len: m[0].length, v: Math.round(a * k * 100) / 100 });
  }
  const re4 = /(?:^|[^\d.])([1-9]\d{1,3})\s*(euro|€|,-\b)/gi;
  re4.lastIndex = 0;
  while ((m = re4.exec(t))) {
    const v0 = parseInt(m[1], 10);
    if (v0 >= 1900 && v0 <= 2100) continue;
    if (v0 >= 1 && v0 < 200000) raw.push({ i: m.index, len: m[0].length, v: v0 });
  }
  raw.sort((a, b) => a.i - b.i || b.len - a.len);
  const used = [];
  const taken = [];
  for (const h of raw) {
    const end = h.i + h.len;
    if (used.some(([s, e]) => h.i < e && end > s)) continue;
    used.push([h.i, end]);
    taken.push(h.v);
  }
  return taken;
}

function takeWeightsOrPad(hints, n) {
  if (n <= 0) return [];
  if (!hints || hints.length === 0) return Array(n).fill(1);
  if (hints.length >= n) return hints.slice(0, n);
  const av = hints.reduce((a, b) => a + b, 0) / hints.length;
  const pad = n - hints.length;
  return hints.concat(Array(pad).fill(Math.max(0.5, av)));
}

function moneyHintsForLines(lines, matchLine) {
  const a = [];
  for (const line of lines) {
    if (!matchLine(line)) continue;
    const inLine = extractMoneyFromString(line);
    for (const v of inLine) a.push(v);
  }
  return a;
}

function isTreatishLine(line) {
  if (!line || line.length < 3) return false;
  if (/^vk[\s,;]/i.test(line) && !/ipl|behandel|acne|facial|huid|peel|onthar|epil|elektrisch|ipl|gelaat|laser|microneed|arm|ben|buik|kin|nek|massage|scrub|mask|intake|consult/i.test(line)) {
    return false;
  }
  return /ipl|acne|facial|behandel|onthar|peel|huid|derma|vital|elektrisch|epil|lift|microneed|gelaat|laser|massage|scrub|mask|intake|consult|intake|wang|nek|arm|ben|buik|lip|kin|ipl|electr/i.test(line);
}

function isProduishLine(line) {
  if (!line || line.length < 3) return false;
  return /vk|verkoop|serum|cr[eè]me|lotion|ampul|navul|bon|supplement|caps|bestell|product|oil|gel|cleanser|omega|spfs|navul|tonic|healing|vital|source of life|demaquest|derma|vitamin|€|euro|spf/i.test(
    line
  );
}

function daysBetweenYmd(s, e) {
  if (!s || !e) return 0;
  const a = new Date(s + "T12:00:00");
  const b = new Date(e + "T12:00:00");
  return Math.round((b - a) / 864e5);
}

function addDaysYmd(ymd, d) {
  const x = new Date(ymd + "T12:00:00");
  x.setDate(x.getDate() + d);
  return x.toISOString().slice(0, 10);
}

/** n datums (YYYY-MM-DD) verdeeld tussen d1 en d2; bij 1 afspraak: laatste; zelfde dag: alles dezelfde dag. */
function spreadDateStrings(d1, d2, n) {
  if (n <= 0) return [];
  const s = d1 || d2;
  const e = d2 || d1;
  if (!s && !e) return Array(n).fill("1970-01-01");
  if (n === 1) return [e || s];
  if (s === e) return Array(n).fill(s);
  const D = daysBetweenYmd(s, e);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i * D) / (n - 1);
    out.push(addDaysYmd(s, Math.round(t)));
  }
  out[0] = s;
  out[n - 1] = e;
  for (let i = 0; i < n; i++) {
    if (i > 0 && out[i] < out[i - 1]) out[i] = out[i - 1];
  }
  return out;
}

/** 09:00 + 12 minuten per afspraak binnen dezelfde dag (1–40 op één dag). */
function timeForOrder(orderOnDay) {
  const start = 9 * 60;
  const step = 12;
  const m = start + (orderOnDay % 40) * step;
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 18) {
    return "18:00";
  }
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function stripRtf(s) {
  let o = String(s || "");
  if (!o.includes("{\\rtf") && !o.toLowerCase().includes("rtf1")) return o;
  return o
    .replace(/\\'[0-9a-f]{2}/gi, " ")
    .replace(/\\par ?/gi, "\n")
    .replace(/[{}\\]+/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function linesFromNotes(...parts) {
  const text = stripRtf(parts.filter(Boolean).join("\n\n"));
  return text
    .split(/[\n\r]+/)
    .map((x) => x.replace(/^[\s|•\-\*]+/, "").trim())
    .filter((x) => x.length > 5);
}

/** Labels uit notities; anders generiek nummer. refId in app blijft t130/p020 voor BTW, maar de zichtbare naam komt uit het document. */
function pickTreatmentLabels(lines, n) {
  if (n <= 0) return [];
  const kw =
    /ipl|acne|facial|behandel|onthar|peel|microneed|huid|derma|vital|elektrisch|epil|lift|scrub|masker|massage|inject|hydr|reinig|laser|intake|consult|gelaat|wang|nek|arm|ben|buik|lip|kin|oren/i;
  const good = lines.filter((l) => kw.test(l));
  const pool = good.length ? good : lines;
  if (pool.length === 0) {
    return Array.from(
      { length: n },
      (_, i) => `Behandeling ${i + 1}/${n} (Salonware, geen regels in notities)`
    );
  }
  return Array.from({ length: n }, (_, i) => {
    const line = pool[i % pool.length];
    const short = line.length > 90 ? line.slice(0, 87) + "…" : line;
    return `${short} — ${i + 1}/${n}`;
  });
}

function pickProductLabels(lines, n) {
  if (n <= 0) return [];
  const kw =
    /vk|verkoop|serum|cr[eè]me|lotion|cleanser|sun|spf|ampul|navul|product|oil|gel|€|euro|bon|bestell|aankoop|supplement|caps|vitamin/i;
  const good = lines.filter((l) => kw.test(l));
  const pool = good.length ? good : lines;
  if (pool.length === 0) {
    return Array.from(
      { length: n },
      (_, i) => `Product ${i + 1}/${n} (Salonware, geen regels in notities)`
    );
  }
  return Array.from({ length: n }, (_, i) => {
    const line = pool[i % pool.length];
    const short = line.length > 90 ? line.slice(0, 87) + "…" : line;
    return `${short} — ${i + 1}/${n}`;
  });
}

const tRef = "t130";
const pRef = "p020";
const n = 10;
const clients = [];
const appointments = [];
let aid = 0;

for (let i = 1; i <= n; i++) {
  const r = R[i] || [];
  if (!r.length) break;
  const id = idxId > -1 ? String((r[idxId] || "").trim()) : "";
  if (!id) break;

  let fn = idxVoorn > -1 ? (r[idxVoorn] || "").trim() : "";
  const prefix = idxVoorV > -1 ? (r[idxVoorV] || "").trim() : "";
  let ln = idxAchter > -1 ? (r[idxAchter] || "").trim() : "";
  if (prefix) ln = [prefix, ln].filter(Boolean).join(" ").trim();
  if (!fn && !ln) {
    fn = "Klant";
    ln = "Onbekend";
  }

  const g0 = (idxGesl > -1 ? (r[idxGesl] || "").trim() : "")
    .toUpperCase()
    .charAt(0);
  const gender = g0 === "M" ? "M" : g0 === "V" ? "V" : "V";

  const bday = idxGeboorte > -1 ? parseDateYmd((r[idxGeboorte] || "").trim()) : "";
  const straat = idxAdr > -1 ? (r[idxAdr] || "").trim() : "";
  const hnr = idxHuis > -1 ? (r[idxHuis] || "").trim() : "";
  const addr = [straat, hnr].filter(Boolean).join(" ").trim();
  const zip = idxPost > -1 ? (r[idxPost] || "").trim() : "";
  const city = idxPlaats > -1 ? (r[idxPlaats] || "").trim() : "";
  const email = idxEmail > -1 ? (r[idxEmail] || "").trim() : "";
  const phone = idxTel > -1 ? (r[idxTel] || "").trim() : "";
  const mobile = idxMob > -1 ? (r[idxMob] || "").trim() : "";
  const notes1 = idxOp1 > -1 ? r[idxOp1] || "" : "";
  const notes2 = idxOp2 > -1 ? r[idxOp2] || "" : "";
  const notes = (notes1 || "").trim();
  const notesInternal = (notes2 || "").trim();

  const e1 = idxE1 > -1 ? parseDateYmd((r[idxE1] || "").trim()) : null;
  const e2 = idxE2 > -1 ? parseDateYmd((r[idxE2] || "").trim()) : null;
  const bA = idxAfspOmz > -1 ? parseMoney(r[idxAfspOmz]) : 0;
  const bP = idxProdOmz > -1 ? parseMoney(r[idxProdOmz]) : 0;
  const rawAantBeh = idxAantBeh > -1 ? parseInt(String((r[idxAantBeh] || "").trim() || "0"), 10) : 0;
  const rawAantProd = idxAantProd > -1 ? parseInt(String((r[idxAantProd] || "").trim() || "0"), 10) : 0;

  const cid = `c_salon_${id}`;

  const nB = bA > 0 ? (Number.isFinite(rawAantBeh) && rawAantBeh > 0 ? rawAantBeh : 1) : 0;
  const nP = bP > 0 ? (Number.isFinite(rawAantProd) && rawAantProd > 0 ? rawAantProd : 1) : 0;
  const noteLines = linesFromNotes(notes, notesInternal);
  const fullPlain = [notes, notesInternal].filter(Boolean).join("\n\n");
  const allGlobalMoney = extractMoneyFromString(fullPlain);
  let treatMoneyHints = moneyHintsForLines(noteLines, (l) => isTreatishLine(l));
  if (treatMoneyHints.length === 0) treatMoneyHints = allGlobalMoney.slice();
  let prodMoneyHints = moneyHintsForLines(noteLines, (l) => isProduishLine(l));
  if (prodMoneyHints.length === 0) prodMoneyHints = allGlobalMoney.slice();
  const tLabels = nB > 0 ? pickTreatmentLabels(noteLines, nB) : [];
  const pLabels = nP > 0 ? pickProductLabels(noteLines, nP) : [];

  const treatLine = (price, label) => ({
    kind: "treatment",
    refId: tRef,
    savedName: label,
    preferSavedName: true,
    qty: 1,
    price,
  });
  const prodLine = (price, label) => ({
    kind: "product",
    refId: pRef,
    savedName: label,
    preferSavedName: true,
    qty: 1,
    price,
  });

  /** Per dag oplopende tijd zodat meerdere afspraken op dezelfde dag niet over elkaar vallen. */
  const dayOrder = new Map();
  const appts = [];
  function pushAfspraak(ymd, line) {
    if (!ymd) return;
    const o = (dayOrder.get(ymd) || 0) + 1;
    dayOrder.set(ymd, o);
    const tm = timeForOrder(o - 1);
    appts.push({ d: ymd, time: tm, items: [line] });
  }

  if (bA > 0) {
    const wB = takeWeightsOrPad(treatMoneyHints, nB);
    const pBeh = splitToTargetCentsByWeights(
      Math.round(bA * 100),
      wB
    );
    const dBeh = spreadDateStrings(e1, e2, nB);
    for (let k = 0; k < nB; k++) {
      pushAfspraak(
        dBeh[k] || e2 || e1,
        treatLine(pBeh[k], tLabels[k] || `Behandeling ${k + 1}/${nB} (Salonware)`)
      );
    }
  }
  if (bP > 0) {
    const wP = takeWeightsOrPad(prodMoneyHints, nP);
    const pProd = splitToTargetCentsByWeights(
      Math.round(bP * 100),
      wP
    );
    const dProd = spreadDateStrings(e1, e2, nP);
    for (let k = 0; k < nP; k++) {
      pushAfspraak(
        dProd[k] || e2 || e1,
        prodLine(pProd[k], pLabels[k] || `Product ${k + 1}/${nP} (Salonware)`)
      );
    }
  }

  appts.sort(
    (a, b) => a.d.localeCompare(b.d) || a.time.localeCompare(b.time)
  );

  clients.push({
    id: cid,
    gender: gender,
    initials: "",
    firstName: fn,
    lastName: ln,
    address: addr,
    city,
    zip,
    phone,
    mobile,
    email,
    birthday: bday || "",
    notes: notes,
    notesInternal: notesInternal,
    mustPayFirst: "standaard",
    importSourceId: id,
  });

  for (const ap of appts) {
    aid += 1;
    const d = ap.d;
    const tm = ap.time || "10:00";
    const [h0, m0] = String(tm).split(":");
    const hh = String(Math.min(23, parseInt(h0, 10) || 10)).padStart(2, "0");
    const mm = String(Math.min(59, parseInt(m0, 10) || 0)).padStart(2, "0");
    const apId = `a_embed_${id}_${aid}`;
    const afgerondAt = `${d}T${hh}:${mm}:00.000Z`;
    appointments.push({
      id: apId,
      clientId: cid,
      date: d,
      time: tm,
      status: "afgerond",
      notes: "Geïmporteerd uit Salonware (CSV); betaling in het verleden — afrekenen naar wens aanpassen.",
      items: ap.items,
      paid: true,
      betaalwijze: "overgemaakt",
      afgerondAt: afgerondAt,
      stockApplied: true,
    });
  }
}

const header = `// Geautomatiseerd: eerste 10 rijen — bedragen o.b.v. notities (gewogen), som = afspraakomzet/productomzet; datums 1e..laatste afspraak.
// Opnieuw genereren: node scripts/build-salon-embed-10.cjs
const SALON_EMBEDDED_10 = `;
const body = j({ v: 4, clients, appointments });
fs.writeFileSync(OUT, header + body + ";\n", "utf8");
console.log(OUT, "clients", clients.length, "appts", appointments.length, "bytes", fs.statSync(OUT).size);
