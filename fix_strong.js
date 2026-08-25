// fix broken <strong> tags (missing >) from setBoxLabel
var fs = require('fs');
var path = require('path');
var POSTS = path.join(__dirname, 'src', 'data', 'posts.json');
var p = JSON.parse(fs.readFileSync(POSTS, 'utf8'));
function g(s) { return p.find(function (x) { return x.slug === s; }); }
var fixed = 0;
['best-dog-food-for-puppies-2026-complete-nutrition-guide', 'best-dog-shampoos-2026-gentle-care-for-every-coat', 'best-cat-trees-for-small-apartments-2026'].forEach(function (slug) {
  var a = g(slug);
  var c = a.content;
  var re = /<strong([^>])/g; // <strongX -> <strong>X
  c = c.replace(re, function (m, ch) { fixed++; return '<strong>' + ch; });
  a.content = c;
  a.charCount = c.length;
  console.log(slug, 'fixed strong tags');
});
fs.writeFileSync(POSTS, JSON.stringify(p, null, 2), 'utf8');
console.log('total fixed:', fixed, '| saved');
