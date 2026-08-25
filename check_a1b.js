var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var a = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
var c = a.content;
var i = c.indexOf('Purina Pro Plan');
console.log('--- after Purina section (from Purina heading): ---');
console.log(c.slice(i, i + 3500));
