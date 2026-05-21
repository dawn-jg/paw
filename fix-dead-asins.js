var fs = require('fs');
var posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));

// Good ASINs (confirmed HTTP 200)
var GOOD_ASINS = [
  'B0B4VJRX7Y', 'B000255NCI', 'B0FX2JZ536', 'B0DRSJYFXW', 
  'B0CBPJNF1G', 'B0D2VQJBXS', 'B0FKSV1146', 'B0DRSL76ZB', 
  'B0D7P7WXTB', 'B01M4REF7Y', 'B003SNCHMA', 'B000VTQM70', 
  'B0G2LC3SCM', 'B001P3NU30', 'B0002DHQIY', 'B07XJ8C8F5', 
  'B087DNHXD4', 'B0CLGPX16G', 'B0B7GXSQVZ', 'B0002AQXTA', 
  'B00020SVDG', 'B07GQM8JM4', 'B0G6D7WSLR', 'B00NLEJWN8', 
  'B0GTV4919Y', 'B0002DJ9OS', 'B004GX47TW', 'B07JH4JHTC', 
  'B081VKRX4Q', 'B00DC2BJWG', 'B00178LI50', 'B004PBCFG2', 
  'B0F3LRD8KK', 'B096FYTVRD', 'B0G5CTR7GC', 'B0DNKGMTDW', 
  'B0FNBFZPGS', 'B09ZPWJJBW'
];

// Bad ASINs (confirmed 404)
var BAD_ASINS = [
  'B07XQXLQ4R', 'B09BX1NKZQ', 'B08744H7HX', 'B0BDK2Q8WL',
  'B01DBXJEHO', 'B0BX1XQG6S', 'B0BZZST1C3', 'B0BY9W6J7F',
  'B00DEF4567', 'B09KVV4H3X', 'B0BZ81QJ8M', 'B001HBKFK4',
  'B00CDSYZV0', 'B00NL6KZI2', 'B07YXQ7XPK', 'B07H8BXY7W',
  'B01H7JZVK4', 'B01N5F3PFU', 'B00176V7N2', 'B07H7XMY5L',
  'B004NIXH9I', 'B00X1RRQ7G', 'B00BMU8MLO', 'B07L9XTLMR',
  'B005U9KCTM', 'B01M0S81XO', 'B08F2Y5X1K', 'B07BJ4P8ZQ',
  'B07D3X5K9P', 'B0002DHVQ2', 'B07GYQVWNZ', 'B0002DHVQ3',
  'B07TJW8N9K', 'B01N5TIWG6', 'B0002DHVQ4', 'B008G1FL0I',
  'B0018CLZNO', 'B00KZ4V92Y', 'B08P53YRN5', 'B00LGTJZR8',
  'B01N5TIWG7', 'B07H8MKK7V', 'B07BKVSGQM', 'B07BHZN1LZ',
  'B08T6QRLZ3', 'B0013BCH9O', 'B01MZ6K8MZ', 'B07BHZKQ9L',
  'B08GZBD4QS', 'B00DJYIUS0', 'B004HHJSKI', 'B000OPBMP8',
  'B0018CXH26', 'B00B2HPO6G', 'B000HHK1M4', 'B001EO5Q7C',
  'B07KJM4KH1', 'B07Y2R4FC3'
];

// Map bad ASINs to which category they're used in
var badToCats = {};
posts.forEach(function(post) {
  var c = post.content || '';
  BAD_ASINS.forEach(function(asin) {
    if (c.indexOf(asin) >= 0) {
      var cat = post.category || 'unknown';
      if (!badToCats[asin]) badToCats[asin] = {};
      badToCats[asin][cat] = (badToCats[asin][cat] || 0) + 1;
    }
  });
});

// Find which good ASINs are already used in each category
var goodInCats = {};
posts.forEach(function(post) {
  var c = post.content || '';
  GOOD_ASINS.forEach(function(asin) {
    if (c.indexOf(asin) >= 0) {
      var cat = post.category || 'unknown';
      if (!goodInCats[cat]) goodInCats[cat] = [];
      if (goodInCats[cat].indexOf(asin) === -1) goodInCats[cat].push(asin);
    }
  });
});

console.log('Good ASINs per category:');
Object.keys(goodInCats).sort().forEach(function(cat) {
  console.log('  ' + cat + ': ' + goodInCats[cat].join(', '));
});

// Build replacement map: for each bad ASIN, pick a good one from its dominant category
var replacement = {};
Object.keys(badToCats).forEach(function(badAsin) {
  // Find dominant category
  var cats = Object.entries(badToCats[badAsin]).sort(function(a, b) { return b[1] - a[1]; });
  var dominantCat = cats[0][0];
  
  // Find a good ASIN from that category
  var goodPool = goodInCats[dominantCat] || GOOD_ASINS;
  // Pick one we haven't already used as a replacement
  var used = Object.values(replacement);
  var chosen = goodPool.find(function(a) { return used.indexOf(a) === -1; });
  if (!chosen) chosen = goodPool[0];
  if (!chosen) chosen = GOOD_ASINS[0];
  replacement[badAsin] = chosen;
});

console.log('\nReplacement map:');
var totalReplaced = 0;
Object.keys(replacement).sort().forEach(function(bad) {
  var occ = Object.values(badToCats[bad]).reduce(function(a, b) { return a + b; }, 0);
  console.log('  ' + bad + ' (' + occ + ' occurences) -> ' + replacement[bad]);
  totalReplaced += occ;
});
console.log('\nTotal replacements to make: ' + totalReplaced);

// Apply replacements site-wide
posts = posts.map(function(post) {
  var content = post.content || '';
  var modified = false;
  
  Object.keys(replacement).forEach(function(bad) {
    var re = new RegExp(bad, 'g');
    var newContent = content.replace(re, replacement[bad]);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    post.content = content;
    console.log('  Fixed: ' + post.slug);
  }
  return post;
});

// Write back
var json = JSON.stringify(posts, null, 2);
fs.writeFileSync('src/data/posts.json', json, 'utf8');
console.log('\nDone! BOM: ' + (json.charCodeAt(0) === 0xFEFF ? 'FAIL' : 'OK'));
console.log('File size: ' + Math.round(json.length / 1024) + ' KB');

// Verify
var verify = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));
var remainingBad = 0;
verify.forEach(function(post) {
  BAD_ASINS.forEach(function(asin) {
    if ((post.content || '').indexOf(asin) >= 0) remainingBad++;
  });
});
console.log('Remaining bad ASIN occurences: ' + remainingBad);

// Verify rat cages article specifically
var rat = verify.find(function(x) { return x.slug === 'best-rat-cages-2026-social-spaces-for-your-pet-rats'; });
if (rat) {
  var re = /amazon\.com\/dp\/([A-Z0-9]+)/g;
  var links = [];
  var m;
  while ((m = re.exec(rat.content)) !== null) links.push(m[1]);
  console.log('\nRat cages article: ' + links.length + ' ASINs');
  links.forEach(function(a) { console.log('  ' + a + (BAD_ASINS.indexOf(a) >= 0 ? ' ❌ BAD' : ' ✅ OK')); });
}