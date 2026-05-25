var p = require('./src/data/posts.json');
var mismatches = [];
p.forEach(function(x) {
  var s = x.slug.toLowerCase();
  var c = x.category;
  if (s.includes("bird") && c !== "Birds") {
    mismatches.push({slug: x.slug, cat: c, correct: "Birds"});
  }
  if (s.includes("cat") && c !== "Cats") {
    mismatches.push({slug: x.slug, cat: c, correct: "Cats"});
  }
});
console.log("Mismatches: " + mismatches.length);
mismatches.forEach(function(m) {
  console.log("  " + m.slug + " -> " + m.cat + " (should be " + m.correct + ")");
});
