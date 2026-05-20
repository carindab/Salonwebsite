const fs = require("fs");
const p = require("path");

const t = fs.readFileSync(p.join(__dirname, "..", "salonware-download (1).csv"), "utf8");
if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);

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

function parseMoney(s) {
  if (!s) return 0;
  let x = String(s).trim();
  if (x.includes(",")) x = x.replace(/\./g, "").replace(",", ".");
  return Math.round((parseFloat(x) || 0) * 100) / 100;
}

const R = parseCsv(t, ";");
const js = fs.readFileSync(p.join(__dirname, "..", "embedded-seed-data.js"), "utf8");
const m = js.match(/const SALON_EMBEDDED_10 = (\{[\s\S]*\});\s*$/m);
if (!m) {
  console.error("parse seed fail");
  process.exit(1);
}
const j = JSON.parse(m[1]);
let err = 0;
for (let i = 1; i <= 10; i++) {
  const r = R[i] || [];
  const id = (r[0] || "").trim();
  if (!id) break;
  const bA = parseMoney(r[65]);
  const bP = parseMoney(r[67]);
  let sA = 0;
  let sP = 0;
  for (const a of j.appointments) {
    if (a.clientId !== "c_salon_" + id) continue;
    for (const it of a.items || []) {
      const x = (it.qty || 1) * (it.price || 0);
      if (it.kind === "treatment") sA += x;
      else sP += x;
    }
  }
  if (Math.abs(sA - bA) > 0.02 || Math.abs(sP - bP) > 0.02) {
    console.error("Mismatch", id, "bA", bA, "sA", sA, "bP", bP, "sP", sP);
    err++;
  } else {
    console.log("OK", id, "A", bA, "P", bP);
  }
}
if (err) process.exit(1);
console.log("All 10 match CSV afspraakomzet + productomzet.");
