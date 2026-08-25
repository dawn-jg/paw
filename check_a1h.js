var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var a = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
var c = a.content;

// Step 1: as in refresh script
c = c.split('https://www.amazon.com/dp/B0GTV4919Y?tag=paw070-20').join('https://www.amazon.com/dp/B001P3NU30?tag=paw070-20');

var map = [
  ['Royal Canin Large Breed Adult', 'B001P3NU30'],
  ["Hill&#8217;s Science Diet Large Breed", 'B00020SVDG'],
  ['Purina Pro Plan Large Breed Shredded', 'B0G2LC3SCM'],
  ['Taste of the Wild High Prairie', 'B0B4VJRX7Y'],
  ['Blue Buffalo Life Protection Large Breed', 'B000255NCI'],
];
map.forEach(function (pair) {
  var h = c.indexOf(pair[0]);
  console.log('STEP', pair[0], '| h =', h, '| len =', c.length);
  if (h !== -1) {
    var seg = c.slice(h, h + 6000);
    var li = seg.indexOf('amazon.com/dp/');
    console.log('   li =', li);
    if (li !== -1 && li < 6000) {
      var before = seg.slice(0, li);
      var after = seg.slice(li);
      var end = after.indexOf('"');
      console.log('   end =', end);
      if (end !== -1) {
        var repl = 'amazon.com/dp/' + pair[1] + '?tag=paw070-20';
        // PREVIEW only — don't modify
        var newc = c.slice(0, h + li) + repl + after.slice(end);
        console.log('   new len =', newc.length, '| tail:', JSON.stringify(newc.slice(newc.length - 60)));
      }
    }
  }
});
