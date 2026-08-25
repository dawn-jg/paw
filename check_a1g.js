var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var a = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
var c = a.content;
var map = [
  ['Royal Canin Large Breed Adult', 'B001P3NU30'],
  ["Hill&#8217;s Science Diet Large Breed", 'B00020SVDG'],
  ['Purina Pro Plan Large Breed Shredded', 'B0G2LC3SCM'],
  ['Taste of the Wild High Prairie', 'B0B4VJRX7Y'],
  ['Blue Buffalo Life Protection Large Breed', 'B000255NCI'],
];
map.forEach(function (pair) {
  var h = c.indexOf(pair[0]);
  console.log(pair[0], '-> heading at', h);
  if (h !== -1) {
    var seg = c.slice(h, h + 6000);
    var li = seg.indexOf('amazon.com/dp/');
    console.log('   first amazon/dp at rel', li);
    if (li !== -1) {
      var after = seg.slice(li);
      var end = after.indexOf('"');
      console.log('   closing quote at rel', end, '| url:', JSON.stringify(after.slice(0, end)));
    }
  }
});
