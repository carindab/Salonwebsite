#!/usr/bin/env node
/**
 * Bouwt de deploy-map voor Hostinger (Git / Node.js Web App → output: dist).
 * Kopieert alleen wat live nodig is — geen CSV's of dev-scripts.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist");

const FILES = ["index.html", "index.php", "salon-app.js", "styles.css", "salon-seed.json", ".htaccess", "VERSION"];
const DIRS = ["api", "database", "lib"];

function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (name === "config.php") continue;
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else copyFile(s, d);
  }
}

rmrf(OUT);
fs.mkdirSync(OUT, { recursive: true });

require("child_process").execSync("node scripts/build-order-totals.cjs", {
  cwd: ROOT,
  stdio: "inherit",
});

for (const f of FILES) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) copyFile(src, path.join(OUT, f));
}

for (const d of DIRS) {
  copyDir(path.join(ROOT, d), path.join(OUT, d));
}

const scriptsDir = path.join(ROOT, "scripts");
if (fs.existsSync(path.join(scriptsDir, "send-reminders.sh"))) {
  const outScripts = path.join(OUT, "scripts");
  fs.mkdirSync(outScripts, { recursive: true });
  copyFile(path.join(scriptsDir, "send-reminders.sh"), path.join(outScripts, "send-reminders.sh"));
}

copyFile(path.join(ROOT, "api", "config.example.php"), path.join(OUT, "api", "config.example.php"));

const mb = fs.statSync(path.join(OUT, "salon-seed.json")).size / 1024 / 1024;
console.log("Hostinger build klaar:", OUT);
console.log("| bestanden:", FILES.join(", "), "+ api/ + database/");
console.log("| seed MB:", mb.toFixed(2));
