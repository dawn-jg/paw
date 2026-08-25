var fs = require('fs');
var cp = require('child_process');
var orig = JSON.parse(cp.execSync('git show HEAD:src/data/posts.json', { cwd: 'D:/pawcritic-next', encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 }));
var slugs = [
  'best-guinea-pig-food',
  'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed',
  'best-cat-trees-for-small-apartments-2026',
  'best-dog-food-for-puppies-2026-complete-nutrition-guide',
  'best-dog-shampoos-2026-gentle-care-for-every-coat',
  'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026'
];
function counts(c) {
  var r = {};
  function cnt(tag) {
    var open = (c.match(new RegExp('<' + tag + '(\\s|>)', 'g')) || []).length;
    var close = (c.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    return open - close;
  }
  ['p', 'div', 'strong', 'table', 'li', 'ul', 'td'].forEach(function (t) { r[t] = cnt(t); });
  return r;
}
slugs.forEach(function (s) {
  var o = orig.find(function (x) { return x.slug === s; });
  var n = fs.existsSync('D:/pawcritic-next/src/data/posts.json') ? JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8')).find(function (x) { return x.slug === s; }) : null;
  console.log('===== ' + s + ' =====');
  console.log('ORIGINAL:', JSON.stringify(counts(o.content)));
  console.log('NEW     :', JSON.stringify(counts(n.content)));
});
