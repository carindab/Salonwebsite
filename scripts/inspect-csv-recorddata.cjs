const fs = require("fs");
const path = require("path");

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

const csv = path.join(__dirname, "..", "salonware-download (1).csv");
let t = fs.readFileSync(csv, "utf8");
if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
const R = parseCsv(t, ";");
const H = R[0].map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
const iRec = H.indexOf("recorddata");
const r = R.find((x) => (x[0] || "").replace(/^"|"$/g, "").trim() === "444972");
if (!r) {
  console.error("no row 444972");
  process.exit(1);
}
console.log("columns in row", r.length, "header", H.length);
console.log("recorddata index", iRec, "length", (r[iRec] || "").length);
const rd = r[iRec] || "";
if (rd.length) console.log("recorddata head:", rd.slice(0, 800));
else console.log("recorddata EMPTY");
// any field with JSON or appointment-like
r.forEach((f, j) => {
  const s = (f || "").trim();
  if (s && (s.startsWith("{") || s.startsWith("[")) && s.length > 20) {
    console.log("JSON-like col", j, H[j] || j, "len", s.length, s.slice(0, 120));
  }
});
