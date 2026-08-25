var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var a = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
var c = a.content;
// find where Purina's Pros/Cons lists are and what follows
var i = c.indexOf('Purina Pro Plan');
var pros = c.indexOf('<h4', i);
console.log('--- from Pros heading after Purina: ---');
console.log(c.slice(pros, pros + 1200));
console.log('\n--- total length now:', c.length);
