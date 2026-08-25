var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var a = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
var c = a.content;

// The raw pattern for each product's link line:
var re = /<p>(\?\?)? <a href="https:\/\/www\.amazon\.com\/dp\/B0GTV4919Y\?tag=paw070-20" rel="nofollow sponsored">Check Price on Amazon<\/a> \| <a href="https:\/\/www\.chewy\.com\/[^"]*"[^>]*>Check Price on Chewy<\/a><\/p>/g;
var m;
var idx = 0;
while ((m = re.exec(c))) {
  idx++;
  console.log('match', idx, 'at', m.index, JSON.stringify(m[0].slice(0, 120)));
}

// Also try simpler: find each "Check Price on Amazon" preceded by product context
var positions = [];
var re2 = /Check Price on Amazon/g;
while ((m = re2.exec(c))) positions.push(m.index);
console.log('total Check Price on Amazon occurrences:', positions.length);

// show surrounding context of each
positions.forEach(function (pos, i) {
  console.log('--- occ', i + 1, '---');
  console.log(JSON.stringify(c.slice(pos - 160, pos + 60)));
});
