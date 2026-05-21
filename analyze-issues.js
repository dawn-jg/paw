var fs = require('fs');
var p = require('./src/data/posts.json');

// Category breakdown
var cats = {};
p.forEach(function(x) {
  var c = x.category || 'unknown';
  if (!cats[c]) cats[c] = [];
  cats[c].push(x);
});

Object.keys(cats).sort().forEach(function(c) {
  var a = cats[c];
  var noAmz = a.filter(function(x) { return (x.content || '').indexOf('amazon.com') === -1; }).length;
  var thin = a.filter(function(x) { return (x.content || '').length < 8000; }).length;
  console.log(c + ': ' + a.length + ' posts | noAmz: ' + noAmz + ' | thin: ' + thin);
});

// ASIN analysis
var txt = fs.readFileSync('src/data/posts.json', 'utf8');
var asins = {};
var re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
var m;
while ((m = re.exec(txt)) !== null) {
  asins[m[1]] = (asins[m[1]] || 0) + 1;
}
var top = Object.entries(asins).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 30);
console.log('\nUnique ASINs: ' + Object.keys(asins).length);
console.log('Top ASINs:');
top.forEach(function(e) {
  console.log('  ' + e[0] + ': ' + e[1] + ' uses');
});

// Thin article details
var thinArticles = p.filter(function(x) { return (x.content || '').length < 8000; });
console.log('\n=== Thin Articles (' + thinArticles.length + ') ===');
thinArticles.forEach(function(x) {
  var c = x.content || '';
  var amzC = (c.match(/amazon\.com\/dp\//g) || []).length;
  console.log('  [' + x.date + '] [' + (x.category || '?') + '] ' + x.slug + ' (' + c.length + ' chars, ' + amzC + ' amz)');
});

// Also list all ASINs with tag=paw070-20 check
var tagCheck = (txt.match(/tag=paw070-20/g) || []).length;
var totalLinks = (txt.match(/amazon\.com\/dp\//g) || []).length;
console.log('\nTotal Amazon links: ' + totalLinks + ', with tag: ' + tagCheck + ', missing tag: ' + (totalLinks - tagCheck));