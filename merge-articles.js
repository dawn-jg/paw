var fs = require('fs');
var postsPath = 'D:/pawcritic-next/src/data/posts.json';

// Load existing posts
var posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
console.log('Existing posts: ' + posts.length);

// Load temp articles
var a1 = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp-articles/article1-dog-collars.json', 'utf8'));
var a2 = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp-articles/article2-cat-collars.json', 'utf8'));
var a3 = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp-articles/article3-small-pet-water-bottles.json', 'utf8'));

// Check duplicates
var slugSet = {};
posts.forEach(function(p) { slugSet[p.slug] = true; });

[a1, a2, a3].forEach(function(a) {
  if (slugSet[a.slug]) {
    console.log('DUPLICATE SLUG: ' + a.slug);
    process.exit(1);
  }
  console.log('OK: ' + a.slug + ' (' + a.category + ')');
});

// Add and sort
posts = posts.concat([a1, a2, a3]);
posts.sort(function(a, b) {
  return new Date(b.date) - new Date(a.date);
});

console.log('Total after merge: ' + posts.length);

// Write
var json = JSON.stringify(posts, null, 2);
fs.writeFileSync(postsPath, json, 'utf8');
console.log('BOM check: ' + (json.charCodeAt(0) === 0xFEFF ? 'FAIL' : 'OK'));
console.log('Merge complete.');
