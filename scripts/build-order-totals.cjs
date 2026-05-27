/* eslint-disable no-console */
/** Compacte orderprijs-map voor Salonware-omzet (api/order-totals.json). */
const fs = require("fs");
const path = require("path");

const SEED = path.join(__dirname, "..", "salon-seed.json");
const OUT = path.join(__dirname, "..", "api", "order-totals.json");

const seed = JSON.parse(fs.readFileSync(SEED, "utf8"));
const map = {};

for (const a of seed.appointments || []) {
  if (a.importOrderId == null || a.orderTotal == null) continue;
  map[String(a.importOrderId)] = Number(a.orderTotal) || 0;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(map));

const kb = fs.statSync(OUT).size / 1024;
console.log("order-totals.json:", Object.keys(map).length, "orders,", kb.toFixed(1), "KB");
