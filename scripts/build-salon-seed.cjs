/* eslint-disable no-console */
/**
 * Bouwt salon-seed.json: alle klanten + afspraken met echte behandelingnamen
 * en bedragen uit Salonware-notities (zoals "acne 170", "micro 45 euro").
 * Tijden: Salonware export heeft geen echte tijden → 09:00, 09:15, … per dag.
 */
const fs = require("fs");
const path = require("path");

const KLANTEN_CSV = path.join(__dirname, "..", "salonware-download (2).csv");
const AFSPRAKEN_CSV = path.join(__dirname, "..", "Afspraken klanten.csv");
const OUT = path.join(__dirname, "..", "salon-seed.json");
const SEED_VERSION = 2;
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

function extractMoneyFromString(plain) {
  const t = String(plain || "");
  const raw = [];
  const re1 = /(\d{1,3}(?:\.\d{3})*,\d{2})/g;
  let m;
  while ((m = re1.exec(t))) {
    const v = parseMoney(m[1]);
    if (v >= 0.5 && v < 200000) raw.push({ i: m.index, len: m[0].length, v });
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

function linesFromNotes(...parts) {
  const text = stripRtf(parts.filter(Boolean).join("\n\n"));
  return text
    .split(/[\n\r]+/)
    .map((x) => x.replace(/^[\s|•\-\*]+/, "").trim())
    .filter((x) => x.length > 5);
}

function isTreatishLine(line) {
  if (!line || line.length < 3) return false;
  return /ipl|acne|facial|behandel|onthar|peel|huid|derma|vital|elektrisch|epil|lift|microneed|gelaat|laser|massage|scrub|mask|intake|consult|wang|nek|arm|ben|buik|lip|kin|micro|camou?r?flage|collageen|plasma|biomicroneedling|mesoderma|elim|carboxy|zuurstof|normalizing|herbal|refresh/i.test(
    line
  );
}

function isProduishLine(line) {
  if (!line || line.length < 3) return false;
  return /vk|verzoek|verkoop|serum|cr[eè]me|lotion|cleanser|spf|ampul|navul|product|oil|gel|vitamin|vital c|nivea|loreal|prof|sample|bon|bestell/i.test(
    line
  );
}

function pickTreatmentLabels(lines, n) {
  if (n <= 0) return [];
  const good = lines.filter((l) => isTreatishLine(l) && !isIntakeOrMetaLine(l) && !isSalonwareLogLine(l));
  const pool = good.length ? good : lines.filter((l) => !isProduishLine(l) && !isIntakeOrMetaLine(l));
  if (pool.length === 0) {
    return Array.from({ length: n }, (_, i) => `Behandeling ${i + 1}/${n} (Salonware)`);
  }
  return Array.from({ length: n }, (_, i) => {
    const line = pool[i % pool.length];
    const kw = extractTreatmentKeyword(line);
    const label = kw || (line.length > 90 ? line.slice(0, 87) + "…" : line);
    return label;
  });
}

function pickProductLabels(lines, n) {
  if (n <= 0) return [];
  const good = lines.filter((l) => isProduishLine(l) && !isIntakeOrMetaLine(l) && !/^verzorgingsproducten/i.test(l.trim()));
  const pool = good.length ? good : lines.filter((l) => /vk|verkoop|serum|gel|cr[eè]me|product/i.test(l) && !isIntakeOrMetaLine(l));
  if (pool.length === 0) {
    return Array.from({ length: n }, (_, i) => `Product ${i + 1}/${n} (Salonware)`);
  }
  return Array.from({ length: n }, (_, i) => {
    const line = pool[i % pool.length];
    return line.length > 90 ? line.slice(0, 87) + "…" : line;
  });
}

function takeWeightsOrPad(hints, n) {
  if (n <= 0) return [];
  if (!hints || hints.length === 0) return Array(n).fill(1);
  if (hints.length >= n) return hints.slice(0, n);
  const av = hints.reduce((a, b) => a + b, 0) / hints.length;
  return hints.concat(Array(n - hints.length).fill(Math.max(0.5, av)));
}

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

/** 09:00 + 15 min per afspraak op dezelfde dag (Salonware heeft geen echte tijd). */
function timeForOrder(orderOnDay) {
  const start = 9 * 60;
  const step = 15;
  const m = start + (orderOnDay % 32) * step;
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 18) return "18:00";
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function inferTreatmentRefId(text) {
  const s = String(text || "").toLowerCase();
  if (/peel\s*acne\s*extra|acne\s*extra/.test(s)) return "t101";
  if (/acne/.test(s)) return "t100";
  if (/ipl/.test(s)) return "t060";
  if (/dermapen|mesoderma/.test(s)) return "t091";
  if (/biomicroneedling|bio.?micro/.test(s)) return "t123";
  if (/plasma/.test(s)) return "t001";
  if (/microderma|^\s*micro\b|micro\s+\d/.test(s)) return "t030";
  if (/collageen|collagen/.test(s)) return "t081";
  if (/camou?r?flage/.test(s)) return "t130";
  if (/elektrisch|epil/.test(s)) return "t070";
  if (/carboxy|zuurstof/.test(s)) return "t010";
  if (/elim|huidherstel|skin.?scan/.test(s)) return "t020";
  return T_REF;
}

function makeItem(kind, label, price) {
  const refId = kind === "product" ? P_REF : inferTreatmentRefId(label);
  return {
    kind,
    refId,
    savedName: label,
    preferSavedName: true,
    qty: 1,
    price: price || 0,
  };
}

function extractTreatmentKeyword(text) {
  const kw = String(text || "").match(
    /(acne(?:\s+behandeling)?(?:\s+extra)?|ipl[^,.]{0,30}|micro(?:derma)?[^,.]{0,20}|camou?r?flage[^,.]{0,25}|peel[^,.]{0,25}|facial[^,.]{0,25}|derma[^,.]{0,25}|mesoderma[^,.]{0,25}|biomicroneedling[^,.]{0,25}|collageen[^,.]{0,25}|elektrisch[^,.]{0,25}|carboxy[^,.]{0,25}|zuurstof[^,.]{0,25}|elim[^,.]{0,25}|normalizing[^,.]{0,40}|behandeling[^,.]{0,30})/i
  );
  return kw ? kw[1].trim() : "";
}

function isIntakeOrMetaLine(line) {
  const t = String(line || "").trim();
  if (!t) return true;
  if (/^welke behandeling|^allergie|^roken|^zonnenbank|^verzorgingsproducten|^merk\b|^waar aan werken|^beschrijving|^notities|^nieuwe notitie|^date\t|^author|^bewerk|^verwijder|^alle$/i.test(t)) {
    return true;
  }
  if (/^\d{1,2}\s+[a-zéèïëô]+\.?\s+\d{4}$/i.test(t)) return true;
  if (/^ja vaker geweest|^informatie laviesage/i.test(t) && !/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(t)) return true;
  return false;
}

function isSalonwareLogLine(line) {
  return /\t\d{1,2}-\d{1,2}-\d{4}\t/.test(String(line || ""));
}

function unitPriceFromLine(line) {
  const ux = String(line || "").match(/(\d+(?:,\d{1,2})?)\s*(?:,-|euro|€)?\s*x\s*\d+/i);
  if (ux) return parseMoney(ux[1]);
  const monies = extractMoneyFromString(line);
  return monies.length ? monies[0] : 0;
}

function datesFromLine(line, yearHint) {
  const dates = [];
  const dateRe = /\b(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\b/g;
  let dm;
  while ((dm = dateRe.exec(line)) !== null) {
    const iso = isoFromLooseDdMmY(dm[1], dm[2], dm[3]);
    if (iso && iso >= "1995-01-01" && iso <= "2028-12-31") dates.push(iso);
  }
  const wd = line.match(/\b(\d{1,2})\s+([a-zéèïëô]+)\.?\s+(\d{4})\b/i);
  if (wd) {
    const mon = NL_MONTH[String(wd[2]).toLowerCase().replace(/\.$/, "")];
    if (mon) dates.push(normalizeDate(`${wd[1]}-${mon}-${wd[3]}`));
  }
  if (!dates.length) {
    const partial = line.match(/^(\d{1,2})[-/](\d{1,2})\b(?![-/]\d)/);
    if (partial && yearHint && unitPriceFromLine(line) > 0) {
      const iso = normalizeDate(`${partial[1]}-${partial[2]}-${yearHint}`);
      if (iso && iso <= TODAY) dates.push(iso);
    }
  }
  return dates;
}

function parseSalonwareLogLine(line) {
  if (!isSalonwareLogLine(line)) return [];
  const parts = String(line).split("\t").map((p) => p.trim()).filter(Boolean);
  const datePart = parts.find((p) => /^\d{1,2}-\d{1,2}-\d{4}$/.test(p));
  if (!datePart) return [];
  const [dd, mm, yyyy] = datePart.split("-");
  const iso = isoFromLooseDdMmY(dd, mm, yyyy);
  if (!iso) return [];
  const text = parts[0] || "";
  if (/^date$/i.test(text)) return [];
  const price = unitPriceFromLine(text);
  const keyword = extractTreatmentKeyword(text);
  let label = keyword || text.replace(/\s*(Carinda|bewerk|verwijder).*$/i, "").trim();
  if (label.length > 90) label = label.slice(0, 87) + "…";
  const kind = isProduishLine(text) && !isTreatishLine(text) ? "product" : "treatment";
  if (!keyword && !price && !isProduishLine(text)) return [];
  if (/^informatie\b/i.test(label) && !price) return [];
  const score = (price ? 3 : 0) + (keyword ? 2 : 0) + (isTreatishLine(text) ? 1 : 0);
  return [{ date: iso, label, price, kind, score, source: "log" }];
}

function isDiaryLine(line) {
  const t = String(line || "").trim();
  if (isIntakeOrMetaLine(t) || isSalonwareLogLine(t)) return false;
  const hasFullDate = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(t);
  const hasPartialDate = /^\d{1,2}[-/]\d{1,2}\b/.test(t);
  if (!hasFullDate && !hasPartialDate) return false;
  return isTreatishLine(t) || unitPriceFromLine(t) > 0;
}

function parseDiaryLine(line, yearHint) {
  const dates = datesFromLine(line, yearHint);
  if (!dates.length) return [];
  const price = unitPriceFromLine(line);
  let label = extractTreatmentKeyword(line);
  if (!label) {
    label = line
      .replace(/\b\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?\b/g, " ")
      .replace(/\b\d{1,2}\s+[a-zéèïëô]+\.?\s+\d{4}\b/gi, " ")
      .replace(/\ben\b/gi, " ")
      .replace(/\d+(?:,\d{1,2})?\s*(?:,-|euro|€)?(?:\s*x\s*\d+)?/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (label.length > 90) label = label.slice(0, 87) + "…";
  }
  if (!label || label.length < 3) label = "Behandeling (Salonware notitie)";
  const kind = isProduishLine(line) && !isTreatishLine(line) ? "product" : "treatment";
  const score = (price ? 4 : 0) + (extractTreatmentKeyword(line) ? 3 : 0) + 2;
  return dates.map((date) => ({ date, label, price, kind, score, source: "diary" }));
}

function uniqueNoteLines(notes, notesInternal) {
  const plain = stripRtf([notes, notesInternal].filter(Boolean).join("\n\n"));
  const seen = new Set();
  const out = [];
  for (const line of plain.split(/[\n\r]+/).map((l) => l.trim()).filter((l) => l.length > 4)) {
    const key = line.replace(/\r/g, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function inferYearFromNotes(lines) {
  const years = [];
  for (const line of lines) {
    const re = /\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/g;
    let m;
    while ((m = re.exec(line))) {
      const y = parseInt(m[3], 10);
      if (y >= 1995 && y <= 2100) years.push(y);
    }
  }
  if (!years.length) return undefined;
  years.sort((a, b) => a - b);
  return years[Math.floor(years.length / 2)];
}

function selectDiaryVisits(parsed, nTreat, nProd) {
  const treats = parsed
    .filter((v) => v.kind === "treatment" && v.source === "diary" && v.price > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, Math.max(0, nTreat));
  const prods = parsed
    .filter((v) => v.kind === "product" && v.price > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, Math.max(0, nProd));
  return { treats, prods };
}

/** Haal concrete bezoeken uit notities: dagboekregels + Salonware-log (tab + datum). */
function parseVisitsFromNotes(notes, notesInternal, yearHint) {
  const lines = uniqueNoteLines(notes, notesInternal);
  const visits = [];
  const seen = new Set();

  for (const line of lines) {
    if (isIntakeOrMetaLine(line)) continue;
    let parsed = [];
    if (isSalonwareLogLine(line)) parsed = parseSalonwareLogLine(line);
    else if (isDiaryLine(line)) parsed = parseDiaryLine(line, yearHint);
    else continue;

    for (const v of parsed) {
      const key = `${v.date}|${v.kind}|${v.label}|${v.price}`;
      if (seen.has(key)) continue;
      seen.add(key);
      visits.push(v);
    }
  }
  visits.sort((a, b) => a.date.localeCompare(b.date) || b.score - a.score);
  return visits;
}

function buildAppointmentsForClient(row, H, clientId, extId) {
  const col = (n) => H.get(n) ?? -1;
  const notes = col("opmerkingen") > -1 ? r(row, col("opmerkingen")) : "";
  const notesInternal = col("opmerkingen_intern") > -1 ? r(row, col("opmerkingen_intern")) : "";
  const e1 = col("eersteafspraak") > -1 ? normalizeDate(r(row, col("eersteafspraak"))) : "";
  let e2 = col("laatsteafspraak") > -1 ? normalizeDate(r(row, col("laatsteafspraak"))) : "";
  if (e2 > TODAY) e2 = TODAY;

  const bA = col("afspraakomzet") > -1 ? parseMoney(r(row, col("afspraakomzet"))) : 0;
  const bP = col("productomzet") > -1 ? parseMoney(r(row, col("productomzet"))) : 0;
  const rawAantBeh = col("aantalbehandelingen") > -1 ? parseInt(r(row, col("aantalbehandelingen")) || "0", 10) : 0;
  const rawAantProd = col("aantalproducten") > -1 ? parseInt(r(row, col("aantalproducten")) || "0", 10) : 0;

  const nB = bA > 0 ? (rawAantBeh > 0 ? rawAantBeh : 1) : 0;
  const nP = bP > 0 ? (rawAantProd > 0 ? rawAantProd : 1) : 0;

  const noteLines = linesFromNotes(notes, notesInternal);
  const fullPlain = [notes, notesInternal].filter(Boolean).join("\n\n");
  const allMoney = extractMoneyFromString(fullPlain);
  const treatHints = noteLines.filter(isTreatishLine).flatMap((l) => extractMoneyFromString(l));
  const prodHints = noteLines.filter(isProduishLine).flatMap((l) => extractMoneyFromString(l));

  const yearHint = inferYearFromNotes(noteLines) || parseInt(String(e2 || e1 || TODAY).slice(0, 4), 10) || undefined;
  const parsedVisits = parseVisitsFromNotes(notes, notesInternal, yearHint);
  const selected = selectDiaryVisits(parsedVisits, nB, nP);
  const usedDates = new Set(selected.treats.concat(selected.prods).map((v) => v.date));
  const appts = [];
  const dayOrder = new Map();
  let seq = 0;

  function pushAppt(ymd, item) {
    if (!ymd) return;
    const o = (dayOrder.get(ymd) || 0) + 1;
    dayOrder.set(ymd, o);
    seq++;
    appts.push({
      id: `a_seed_${extId}_${seq}`,
      clientId,
      date: ymd,
      time: timeForOrder(o - 1),
      status: ymd >= TODAY ? "gepland" : "afgerond",
      paid: ymd < TODAY,
      notes: "Salonware import",
      items: [item],
      importTag: "salon-seed-v2",
    });
  }

  for (const v of selected.treats) {
    pushAppt(v.date, makeItem("treatment", v.label, v.price));
  }
  for (const v of selected.prods) {
    pushAppt(v.date, makeItem("product", v.label, v.price));
  }

  const parsedBehSum = selected.treats.reduce((s, v) => s + (v.price || 0), 0);
  const parsedProdSum = selected.prods.reduce((s, v) => s + (v.price || 0), 0);
  const needB = Math.max(0, nB - selected.treats.length);
  const needP = Math.max(0, nP - selected.prods.length);
  const budgetB = Math.max(0, Math.round((bA - parsedBehSum) * 100));
  const budgetP = Math.max(0, Math.round((bP - parsedProdSum) * 100));

  if (needB > 0 && budgetB > 0) {
    const labels = pickTreatmentLabels(noteLines, needB);
    const weights = takeWeightsOrPad(treatHints.length ? treatHints : allMoney, needB);
    const prices = splitToTargetCentsByWeights(budgetB, weights);
    let dates = spreadDateStrings(e1, e2, needB);
    dates = dates.map((d) => {
      if (!usedDates.has(d)) {
        usedDates.add(d);
        return d;
      }
      for (let off = 1; off < 400; off++) {
        const alt = addDaysYmd(d, off);
        if (alt <= TODAY && !usedDates.has(alt)) {
          usedDates.add(alt);
          return alt;
        }
      }
      usedDates.add(d);
      return d;
    });
    for (let k = 0; k < needB; k++) {
      pushAppt(dates[k] || e2 || e1, makeItem("treatment", labels[k], prices[k]));
    }
  }
  if (needP > 0 && budgetP > 0) {
    const labels = pickProductLabels(noteLines, needP);
    const weights = takeWeightsOrPad(prodHints.length ? prodHints : allMoney, needP);
    const prices = splitToTargetCentsByWeights(budgetP, weights);
    let dates = spreadDateStrings(e1, e2, needP);
    dates = dates.map((d) => {
      if (!usedDates.has(d)) {
        usedDates.add(d);
        return d;
      }
      for (let off = 1; off < 400; off++) {
        const alt = addDaysYmd(d, off);
        if (alt <= TODAY && !usedDates.has(alt)) {
          usedDates.add(alt);
          return alt;
        }
      }
      return d;
    });
    for (let k = 0; k < needP; k++) {
      pushAppt(dates[k] || e2 || e1, makeItem("product", labels[k], prices[k]));
    }
  }

  appts.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return appts;
}

function r(row, idx) {
  return idx > -1 ? String(row[idx] || "").trim() : "";
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

// ---- Klanten (volledige lijst) ----
const kRows = readCsv(KLANTEN_CSV);
const kH = headerFirst(kRows[0]);
const col = (n) => kH.get(n) ?? -1;
const rowById = new Map();

const clients = [];
for (let i = 1; i < kRows.length; i++) {
  const row = kRows[i];
  const extId = col("klant_id") > -1 ? r(row, col("klant_id")) : "";
  if (!extId) continue;
  rowById.set(extId, row);

  let fn = col("voornaam") > -1 ? r(row, col("voornaam")) : "";
  let ln = col("achternaam") > -1 ? r(row, col("achternaam")) : "";
  const pref = col("voorvoegsel") > -1 ? r(row, col("voorvoegsel")) : "";
  if (pref) ln = [pref, ln].filter(Boolean).join(" ").trim();
  if (!fn && !ln) continue;

  let addr = col("adres") > -1 ? r(row, col("adres")) : "";
  const huis = col("huisnummer") > -1 ? r(row, col("huisnummer")) : "";
  if (huis) addr = [addr, huis].filter(Boolean).join(" ").trim();

  const g0 = (col("geslacht") > -1 ? r(row, col("geslacht")) : "").toUpperCase().charAt(0);
  const salonImport = {};
  if (col("eersteafspraak") > -1) {
    const v = normalizeDate(r(row, col("eersteafspraak")));
    if (v) salonImport.eersteAfspraak = v;
  }
  if (col("laatsteafspraak") > -1) {
    const v = normalizeDate(r(row, col("laatsteafspraak")));
    if (v) salonImport.laatsteAfspraak = v;
  }
  if (col("totaalomzet") > -1) {
    const m = parseMoney(r(row, col("totaalomzet")));
    if (m) salonImport.totaalOmzet = m;
  }

  const c = {
    id: `c_sw_${extId}`,
    gender: g0 === "M" ? "M" : "V",
    initials: col("voorletters") > -1 ? r(row, col("voorletters")) : "",
    firstName: fn,
    lastName: ln,
    address: addr,
    city: col("plaats") > -1 ? r(row, col("plaats")) : "",
    zip: col("postcode") > -1 ? r(row, col("postcode")) : "",
    phone: col("telefoon") > -1 ? r(row, col("telefoon")) : "",
    mobile: col("mobiel") > -1 ? r(row, col("mobiel")) : "",
    email: col("email") > -1 ? r(row, col("email")) : "",
    birthday: col("geboortedatum") > -1 ? normalizeDate(r(row, col("geboortedatum"))) : "",
    notes: sanitizeNotes(col("opmerkingen") > -1 ? row[col("opmerkingen")] : "", 400),
    notesInternal: sanitizeNotes(col("opmerkingen_intern") > -1 ? row[col("opmerkingen_intern")] : "", 250),
    mustPayFirst: "standaard",
    importSourceId: extId,
  };
  if (Object.keys(salonImport).length) c.salonImport = salonImport;
  clients.push(c);
}

// ---- Afspraken: klanten uit Afspraken klanten.csv, data uit volledige Salonware-rij ----
const aRows = readCsv(AFSPRAKEN_CSV);
const aH = headerFirst(aRows[0]);
const appointments = [];

for (let i = 1; i < aRows.length; i++) {
  const aRow = aRows[i];
  const extId = aH.get("klant_id") > -1 ? r(aRow, aH.get("klant_id")) : "";
  if (!extId) continue;
  const fullRow = rowById.get(extId);
  if (!fullRow) continue;
  const clientId = `c_sw_${extId}`;
  const appts = buildAppointmentsForClient(fullRow, kH, clientId, extId);
  appointments.push(...appts);
}

const seed = { v: SEED_VERSION, clients, appointments };
fs.writeFileSync(OUT, JSON.stringify(seed));
console.log(
  OUT,
  "| klanten:", clients.length,
  "| afspraken:", appointments.length,
  "| MB:", (fs.statSync(OUT).size / 1024 / 1024).toFixed(2)
);

// Sample Rianne
const ri = appointments.filter((a) => a.clientId === "c_sw_445152").slice(0, 5);
console.log("Voorbeeld Rianne Den Hertog (eerste 5):");
ri.forEach((a) => console.log(" ", a.date, a.time, a.items[0].savedName, "€" + a.items[0].price));
