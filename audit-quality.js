var fs = require('fs');
var p = require('./src/data/posts.json');

console.log('=== Content Quality Audit ===\n');

// 1. Length distribution
var stats = {};
p.forEach(function(x) {
  var len = (x.content || '').length;
  var cat = x.category || 'unknown';
  if (!stats[cat]) stats[cat] = { count: 0, total: 0, min: 999999, max: 0, noAmz: 0, noImages: 0, noList: 0 };
  stats[cat].count++;
  stats[cat].total += len;
  stats[cat].min = Math.min(stats[cat].min, len);
  stats[cat].max = Math.max(stats[cat].max, len);
  if ((x.content || '').indexOf('amazon.com') < 0) stats[cat].noAmz++;
  if ((x.content || '').indexOf('<img ') < 0) stats[cat].noImages++;
  if ((x.content || '').indexOf('<li>') < 0 && (x.content || '').indexOf('<ul>') < 0) stats[cat].noList++;
});

console.log('--- Per-Category ---');
Object.keys(stats).sort().forEach(function(c) {
  var s = stats[c];
  console.log(c + ': ' + s.count + ' articles | avg: ' + Math.round(s.total/s.count) + ' chars | min: ' + s.min + ' | max: ' + s.max);
  console.log('  No Amazon: ' + s.noAmz + ' | No images: ' + s.noImages + ' | No lists: ' + s.noList);
});

// 2. Thin content
var thin = p.filter(function(x) { return (x.content||'').length < 8000; });
console.log('\n--- Thin Articles (<8k chars): ' + thin.length + ' ---');
thin.slice(0,10).forEach(function(x) {
  console.log('  [' + (x.category||'?') + '] ' + x.slug + ' (' + (x.content||'').length + ' chars)');
});

// 3. No Amazon links
var noAmz = p.filter(function(x) { return (x.content||'').indexOf('amazon.com') < 0; });
console.log('\n--- No Amazon Links: ' + noAmz.length + ' ---');
noAmz.forEach(function(x) {
  console.log('  [' + (x.category||'?') + '] ' + x.slug + ' (' + (x.content||'').length + ' chars, date: ' + x.date + ')');
});

// 4. No images
var noImg = p.filter(function(x) { return (x.content||'').indexOf('<img ') < 0; });
console.log('\n--- No Images: ' + noImg.length + ' ---');
noImg.slice(0,10).forEach(function(x) {
  console.log('  [' + (x.category||'?') + '] ' + x.slug);
});

// 5. Check author field
var noAuthor = p.filter(function(x) { return !x.author || x.author.trim() === ''; });
console.log('\n--- No Author: ' + noAuthor.length + ' ---');

// 6. Structure analysis - check if articles have key sections
var noFAQ = p.filter(function(x) { return (x.content||'').toLowerCase().indexOf('faq') < 0 && (x.content||'').toLowerCase().indexOf('frequently asked') < 0; });
var noCompare = p.filter(function(x) { return (x.content||'').toLowerCase().indexOf('compar') < 0 && (x.content||'').indexOf('<table') < 0; });
var noProsCons = p.filter(function(x) { return (x.content||'').toLowerCase().indexOf('pros') < 0 && (x.content||'').toLowerCase().indexOf('cons') < 0; });
console.log('\n--- Missing Structure Elements ---');
console.log('No FAQ section: ' + noFAQ.length + '/' + p.length);
console.log('No comparison/table: ' + noCompare.length + '/' + p.length);
console.log('No pros/cons: ' + noProsCons.length + '/' + p.length);

// 7. Recent article quality
var recent = p.slice(0, 10);
console.log('\n--- Last 10 Articles ---');
recent.forEach(function(x) {
  var c = x.content || '';
  var amzC = (c.match(/amazon\.com\/dp\//g) || []).length;
  var imgC = (c.match(/<img /g) || []).length;
  var hasFAQ = c.toLowerCase().indexOf('faq') >= 0 || c.toLowerCase().indexOf('frequently asked') >= 0;
  var hasTable = c.indexOf('<table') >= 0;
  console.log('  [' + x.date + '] [' + (x.category||'?') + '] ' + c.length + 'chars | ' + amzC + ' amz | ' + imgC + ' img | FAQ:' + hasFAQ + ' | Table:' + hasTable);
});

console.log('\nTotal articles: ' + p.length);