var fs = require('fs');
var raw = fs.readFileSync('src/data/posts.json', 'utf8');

// BOM check
console.log('BOM check: ' + (raw.charCodeAt(0) === 0xFEFF ? 'FAIL - has BOM!' : 'OK - no BOM'));

// Validate JSON
var p;
try {
  p = JSON.parse(raw);
  console.log('JSON valid: OK');
} catch(e) {
  console.log('JSON valid: FAIL - ' + e.message);
  process.exit(1);
}

// Quality checks
var thin = p.filter(function(x) { return (x.content || '').length < 8000; });
console.log('\nStill thin (<8k): ' + thin.length);
if (thin.length > 0) {
  thin.forEach(function(x) {
    console.log('  ' + x.slug + ' (' + (x.content || '').length + ' chars)');
  });
}

var noImg = p.filter(function(x) { return (x.content || '').indexOf('<img ') === -1; });
console.log('No images: ' + noImg.length);

var noAmz = p.filter(function(x) { return (x.content || '').indexOf('amazon.com') === -1; });
console.log('No Amazon links: ' + noAmz.length);

var noAuthor = p.filter(function(x) { return !x.author; });
console.log('No author: ' + noAuthor.length);

var sizes = p.map(function(x) { return (x.content || '').length; }).sort(function(a, b) { return a - b; });
console.log('\nChar range: ' + sizes[0] + ' - ' + sizes[sizes.length - 1]);
console.log('Avg chars: ' + Math.round(sizes.reduce(function(a, b) { return a + b; }, 0) / sizes.length));
console.log('Total posts: ' + p.length);

// Sample one expanded article
var expanded = p.filter(function(x) {
  return x.content.length > 10000 && x.content.indexOf('<img ') >= 0 && x.content.indexOf('amazon.com') >= 0;
})[0];

if (expanded) {
  console.log('\n--- Sample: ' + expanded.slug + ' ---');
  console.log('Title: ' + expanded.title);
  console.log('Author: ' + expanded.author);
  console.log('Chars: ' + expanded.content.length);
  console.log('Images: ' + (expanded.content.match(/<img /g) || []).length);
  console.log('Amazon links: ' + (expanded.content.match(/amazon\.com\/dp\//g) || []).length);
  console.log('Has table: ' + (expanded.content.indexOf('<table') >= 0));
  console.log('Has FAQ: ' + (expanded.content.toLowerCase().indexOf('faq') >= 0));
  console.log('Last 200 chars: ...' + expanded.content.substring(expanded.content.length - 200));
}

// File size
var stats = fs.statSync('src/data/posts.json');
console.log('\nFile size: ' + Math.round(stats.size / 1024) + ' KB');