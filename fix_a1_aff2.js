var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var a = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
var c = a.content;
// Remove the bare URL for Blue Buffalo (not wrapped in an <a> tag)
var bare = 'https://www.amazon.com/dp/B000255NCI?tag=paw070-20 |  <a href="https://www.chewy.com/blue-buffalo-life-protection-large/dp/36067"';
var repl = '<a href="https://www.chewy.com/blue-buffalo-life-protection-large/dp/36067"';
if (c.indexOf(bare) !== -1) {
  c = c.replace(bare, repl);
  console.log('replaced bare URL. aff count now:', (c.match(/amazon\.com\/dp\//g) || []).length);
} else {
  // fallback: regex remove bare amazon URL followed by pipe
  c = c.replace(/<p>https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}\?tag=paw070-20 \| {1,2}/g, '<p>');
  console.log('fallback. aff count now:', (c.match(/amazon\.com\/dp\//g) || []).length);
}
a.content = c;
a.charCount = c.length;
fs.writeFileSync('D:/pawcritic-next/src/data/posts.json', JSON.stringify(p, null, 2), 'utf8');
console.log('saved');
