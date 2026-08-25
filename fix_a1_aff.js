var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var a = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
var c = a.content;
// Blue Buffalo link is right before the chewy blue-buffalo link. Remove the amazon link there, keep chewy.
var blueAnchor = 'Blue Buffalo Life Protection Large Breed';
var h = c.indexOf(blueAnchor);
var seg = c.slice(h, h + 8000);
var rel = seg.indexOf('amazon.com/dp/');
var endQuote = seg.indexOf('"', rel);
var linkHtml = seg.slice(rel - 12, endQuote + 1); // from <a href=" to "
console.log('Blue Buffalo amazon link html:', JSON.stringify(linkHtml));
// Find the exact <a ...>Check Price on Amazon</a> for Blue Buffalo
var re = /<a href="https:\/\/www\.amazon\.com\/dp\/B000255NCI\?tag=paw070-20"[^>]*>Check Price on Amazon<\/a> \| /g;
var m = re.exec(c);
console.log('match found at', m ? m.index : -1, m ? JSON.stringify(m[0]) : '');
if (m) {
  c = c.slice(0, m.index) + c.slice(m.index + m[0].length);
  console.log('removed. new aff count:', (c.match(/amazon\.com\/dp\//g) || []).length);
}
a.content = c;
a.charCount = c.length;
fs.writeFileSync('D:/pawcritic-next/src/data/posts.json', JSON.stringify(p, null, 2), 'utf8');
console.log('saved');
