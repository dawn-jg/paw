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

var banned = [
  "In today's fast-paced world", "In today's digital age",
  "seasoned pet owner", "Let's dive in", "Let's explore", "Let's take a closer look",
  "It's important to note", "It's worth mentioning", "In conclusion",
  "To sum up", "As we've seen", "As discussed above", "Without further ado",
  "That being said", "Delve into", "Navigate the world of", "Embark on a journey",
  "Game-changer", "Needless to say", "Goes without saying",
  "Moreover,", "Furthermore,", "Additionally,",
  "ensuring your pet's health and happiness"
];

slugs.forEach(function (s) {
  var a = p.find(function (x) { return x.slug === s; });
  console.log('===== ' + s + ' =====');
  console.log('date:', a.date, '| category:', a.category);
  console.log('charCount:', a.charCount, '(content len:', a.content.length + ')');
  console.log('desc len:', a.description.length);

  // 1. affiliate links
  var aff = a.content.match(/amazon\.com\/dp\/[A-Z0-9]{10}/g) || [];
  console.log('affiliate links:', aff.length, aff.join(', '));
  var badAff = a.content.match(/amazon\.com\/dp\/[A-Z0-9]{9}(?:[^A-Z0-9]|$)/g);
  if (badAff) console.log('MALFORMED ASIN:', badAff);
  var noTag = a.content.match(/amazon\.com\/dp\/[A-Z0-9]{10}(?!\?tag=paw070-20)/g);
  if (noTag) console.log('NO TAG:', noTag);

  // 2. citations
  var cites = a.content.match(/According to the (ASPCA|AVMA|Humane Society[^,]*|American Veterinary Medical Association|American Society for the Prevention)/g) || [];
  var studies = a.content.match(/A study by [^.]*\./g) || [];
  console.log('citations:', cites.length, '| study refs:', studies.length);

  // 3. internal links — check they exist as slugs
  var intRe = /<a href="\/([a-z0-9-]+)"/g;
  var m, ints = [], missing = [];
  while ((m = intRe.exec(a.content))) {
    ints.push(m[1]);
    if (!allSlugs[m[1]]) missing.push(m[1]);
  }
  console.log('internal links:', ints.length, ints.join(', '));
  if (missing.length) console.log('MISSING SLUGS:', missing.join(', '));

  // 4. banned phrases
  var hits = banned.filter(function (b) { return a.content.toLowerCase().indexOf(b.toLowerCase()) !== -1; });
  if (hits.length) console.log('BANNED PHRASES:', hits.join(' | '));

  // 5. mojibake
  var moji = [];
  for (var i = 0; i < a.content.length; i++) {
    var cc = a.content.charCodeAt(i);
    if (cc === 0x95b3 || cc === 0x9225 || cc === 0xff1f) moji.push(cc.toString(16));
  }
  var mojiD = [];
  for (var j = 0; j < a.description.length; j++) {
    var cd = a.description.charCodeAt(j);
    if (cd === 0x95b3 || cd === 0x9225 || cd === 0xff1f) mojiD.push(cd.toString(16));
  }
  if (moji.length) console.log('MOJIBAKE in content:', moji.join(','));
  if (mojiD.length) console.log('MOJIBAKE in desc:', mojiD.join(','));

  // 6. AI-template fragments
  var templ = a.content.match(/delivers on its promises|Premium Choice Product|Budget Friendly Option|Top Rated Pick|Deluxe Pro Model|check the specific return policy/g);
  if (templ) console.log('TEMPLATE FRAGMENTS:', templ.join(' | '));

  // 7. bare amazon URLs
  var bare = a.content.match(/<p>https:\/\/www\.amazon\.com/g);
  if (bare) console.log('BARE AMAZON URL:', bare.length);

  console.log('');
});
