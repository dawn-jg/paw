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
var allSlugs = {};
p.forEach(function (x) { allSlugs[x.slug] = true; });
var banned = ["In today's fast-paced world", "In today's digital age", 'seasoned pet owner', "Let's dive in", "Let's explore", "Let's take a closer look", "It's important to note", "It's worth mentioning", 'In conclusion', 'To sum up', "As we've seen", 'As discussed above', 'Without further ado', 'That being said', 'Delve into', 'Navigate the world of', 'Embark on a journey', 'Game-changer', 'Needless to say', 'Goes without saying', 'Moreover,', 'Furthermore,', 'Additionally,', "ensuring your pet's health and happiness"];

var allPass = true;
slugs.forEach(function (s) {
  var a = p.find(function (x) { return x.slug === s; });
  var errs = [];
  if (a.date !== '2026-08-23') errs.push('date=' + a.date);
  if (a.description.length < 120 || a.description.length > 160) errs.push('desc len ' + a.description.length);
  var aff = a.content.match(/amazon\.com\/dp\/[A-Z0-9]{10}/g) || [];
  if (aff.length > 4 || aff.length < 2) errs.push('aff ' + aff.length);
  var noTag = a.content.match(/amazon\.com\/dp\/[A-Z0-9]{10}(?!\?tag=paw070-20)/g);
  if (noTag) errs.push('untagged aff links');
  var malformed = a.content.match(/amazon\.com\/dp\/[A-Z0-9]{9}([^A-Z0-9]|$)/g);
  if (malformed) errs.push('malformed ASIN');
  var cites = (a.content.match(/According to the (ASPCA|AVMA|Humane Society|American Veterinary Medical Association|American Society for the Prevention|UF\/IFAS|American Pet Products)/g) || []);
  if (cites.length < 1) errs.push('citations ' + cites.length);
  var intRe = /<a href="\/([a-z0-9-]+)"/g;
  var m, missing = [], total = 0;
  while ((m = intRe.exec(a.content))) { total++; if (!allSlugs[m[1]]) missing.push(m[1]); }
  if (missing.length) errs.push('missing internal slugs: ' + missing.join(','));
  var hits = banned.filter(function (b) { return a.content.toLowerCase().indexOf(b.toLowerCase()) !== -1; });
  if (hits.length) errs.push('banned: ' + hits.join('|'));
  var moji = 0;
  for (var i = 0; i < a.content.length; i++) { var cc = a.content.charCodeAt(i); if (cc === 0x95b3 || cc === 0x9225) moji++; }
  if (moji) errs.push('mojibake ' + moji);
  var strong = a.content.match(/<strong[^>]/g);
  if (strong) errs.push('broken strong');
  var hasNew = a.content.indexOf('2026') !== -1 && a.content.length > 5000;
  if (!hasNew) errs.push('too short / no content');
  console.log((errs.length ? 'FAIL ' : 'PASS ') + s + (errs.length ? ' -> ' + errs.join(' | ') : ' | aff=' + aff.length + ' cites=' + cites.length + ' intLinks=' + total));
  if (errs.length) allPass = false;
});
console.log('\n' + (allPass ? 'ALL PASS' : 'SOME FAILED'));
