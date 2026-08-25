var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var a = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
var c = a.content;
// what comes after the Purina Pros <h4>? Print raw 800 chars from there
var i = c.indexOf('Purina Pro Plan');
var pros = c.indexOf('<h4', i);
console.log('RAW from <h4 after Purina:');
console.log(JSON.stringify(c.slice(pros, pros + 800)));
