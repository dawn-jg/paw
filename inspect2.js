var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
function g(s) { return p.find(function (x) { return x.slug === s; }); }

// Article 0 tail — check HTML balance after buy box removal
var a0 = g('best-guinea-pig-food');
console.log('===== A0 tail (last 800 chars) =====');
console.log(a0.content.slice(-800));

// Article 5 mojibake context
var a5 = g('the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026');
var idx = a5.content.indexOf('\u95b3');
console.log('\n===== A5 mojibake context =====');
console.log('first 95b3 at', idx, JSON.stringify(a5.content.slice(idx - 30, idx + 20)));

// Article 5 buy box section
var bb = a5.content.indexOf('product-buy-box');
console.log('\n===== A5 buy boxes =====');
console.log(a5.content.slice(bb, bb + 2200));
