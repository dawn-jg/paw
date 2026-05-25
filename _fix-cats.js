var fs = require("fs");
var p = require("./src/data/posts.json");
var l = require("./src/data/latest.json");
var cats = require("./src/data/categories.json");

function fixCat(slug, newCat) {
  var found = false;
  for (var i = 0; i < p.length; i++) {
    if (p[i].slug === slug) {
      console.log("posts: " + p[i].category + " -> " + newCat);
      p[i].category = newCat;
      found = true;
      break;
    }
  }
  for (var i = 0; i < l.length; i++) {
    if (l[i].slug === slug) {
      console.log("latest: " + l[i].category + " -> " + newCat);
      l[i].category = newCat;
      break;
    }
  }
  for (var key in cats) {
    if (key === slug) {
      console.log("cats: " + cats[key] + " -> " + newCat);
      cats[key] = newCat;
      break;
    }
  }
  if (!found) console.log("NOT FOUND: " + slug);
}

fixCat("best-bird-stands-2026-play-gyms-and-perch-stations", "Birds");
fixCat("best-bird-vitamins-2026-supplements-for-vibrant-plumage", "Birds");

fs.writeFileSync("./src/data/posts.json", JSON.stringify(p, null, 2), "utf8");
fs.writeFileSync("./src/data/latest.json", JSON.stringify(l, null, 2), "utf8");
fs.writeFileSync("./src/data/categories.json", JSON.stringify(cats, null, 2), "utf8");
console.log("Saved.");
