var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
var slugs = [
  'best-guinea-pig-food',
  'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed',
  'best-cat-trees-for-small-apartments-2026',
  'best-dog-food-for-puppies-2026-complete-nutrition-guide',
  'best-dog-shampoos-2026-gentle-care-for-every-coat',
  'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026'
];
slugs.forEach(function (s) {
  var a = p.find(function (x) { return x.slug === s; });
  var c = a.content;
  var problems = [];
  // broken tags: <tagX without >
  var bt = c.match(/<strong[^>]>/g) || [];
  if (bt.length) problems.push('broken <strong>: ' + bt.length);
  // unmatched tags count
  function cnt(tag) {
    var open = (c.match(new RegExp('<' + tag + '(\\s|>)', 'g')) || []).length;
    var close = (c.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    return { open: open, close: close };
  }
  ['p', 'h2', 'h3', 'h4', 'ul', 'li', 'table', 'tr', 'td', 'th', 'div', 'strong', 'em', 'a'].forEach(function (t) {
    var r = cnt(t);
    if (r.open !== r.close) problems.push(t + ' ' + r.open + '/' + r.close);
  });
  // leftover AI-template text
  var tmpl = c.match(/This is an excellent choice for pet owners who value|delivers on its promises/g);
  if (tmpl) problems.push('template text: ' + tmpl.length);
  // double spaces in href
  var dbl = c.match(/href="\s+/g);
  if (dbl) problems.push('href whitespace');
  console.log(s, problems.length ? 'PROBLEMS: ' + problems.join(' | ') : 'OK');
});
