/**
 * rebuild-data.js — Rebuild categories.json and latest.json from posts.json
 *
 * Call this AFTER adding new articles to posts.json.
 *
 * Usage: node rebuild-data.js
 */

var fs = require("fs");
var path = require("path");

var DATA_DIR = path.join(__dirname, "src", "data");
var POSTS_FILE = path.join(DATA_DIR, "posts.json");
var CATS_FILE = path.join(DATA_DIR, "categories.json");
var LATEST_FILE = path.join(DATA_DIR, "latest.json");

// ── Load posts ─────────────────────────────────────────
var posts = JSON.parse(fs.readFileSync(POSTS_FILE, "utf8"));
console.log("Posts loaded: " + posts.length);

// ── Rebuild categories.json ────────────────────────────
var categories = {};
posts.forEach(function(p) {
  if (!categories[p.category]) {
    categories[p.category] = { name: p.category, posts: [] };
  }
  categories[p.category].posts.push({
    title: p.title,
    slug: p.slug,
    date: p.date,
    description: (p.description || "").substring(0, 200)
  });
});

fs.writeFileSync(CATS_FILE, JSON.stringify(categories, null, 2) + "\n", "utf8");
console.log("categories.json rebuilt: " + Object.keys(categories).length + " categories");
Object.keys(categories).forEach(function(k) {
  console.log("  " + k + ": " + categories[k].posts.length + " posts");
});

// ── Rebuild latest.json (6 newest) ─────────────────────
var sorted = posts.slice().sort(function(a, b) {
  return new Date(b.date) - new Date(a.date);
});
var latest = sorted.slice(0, 6).map(function(p) {
  return {
    title: p.title,
    slug: p.slug,
    category: p.category,
    date: p.date,
    charCount: p.charCount || 0,
    description: p.description || "",
    content: p.content || ""
  };
});

fs.writeFileSync(LATEST_FILE, JSON.stringify(latest, null, 2) + "\n", "utf8");
console.log("latest.json rebuilt: " + latest.length + " newest posts");
latest.forEach(function(l) {
  console.log("  " + l.date + " - " + l.slug);
});

// ── BOM check ──────────────────────────────────────────
var catsRaw = fs.readFileSync(CATS_FILE, "utf8");
var latRaw = fs.readFileSync(LATEST_FILE, "utf8");
var catsBom = catsRaw.charCodeAt(0) === 0xFEFF;
var latBom = latRaw.charCodeAt(0) === 0xFEFF;
console.log("\nBOM check — categories.json: " + (catsBom ? "FAIL" : "OK"));
console.log("BOM check — latest.json:       " + (latBom ? "FAIL" : "OK"));
console.log("Done.");
