var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var a = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
var c = a.content;
console.log('aff count:', (c.match(/amazon\.com\/dp\//g) || []).length);
// Show all amazon links with 120 chars context
var re = /amazon\.com\/dp\/[A-Z0-9]{10}[^"']*/g;
var m;
while ((m = re.exec(c))) {
  console.log('---', JSON.stringify(c.slice(m.index - 80, m.index + m[0].length + 30)));
}
