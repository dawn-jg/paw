var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
function g(s) { return p.find(function (x) { return x.slug === s; }); }
var a = g('best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed');
var c = a.content;
var re = /<a href="([^"]*amazon[^"]*)"[^>]*>([^<]*)<\/a>/g;
var m;
while ((m = re.exec(c))) { console.log('AMZ:', JSON.stringify(m[2]), '->', m[1]); }
var re2 = /<a href="([^"]*chewy[^"]*)"[^>]*>([^<]*)<\/a>/g;
while ((m = re2.exec(c))) { console.log('CHEWY:', JSON.stringify(m[2]), '->', m[1]); }
console.log('--- total amazon count:', (c.match(/amazon\.com\/dp\//g) || []).length);
// also check the product sections still intact
['Royal Canin Large Breed Adult', "Hill&#8217;s Science Diet Large Breed", 'Purina Pro Plan Large Breed Shredded', 'Taste of the Wild High Prairie', 'Blue Buffalo Life Protection Large Breed'].forEach(function (h) {
  console.log('heading', h, 'present:', c.indexOf(h) !== -1);
});
