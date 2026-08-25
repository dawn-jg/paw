// Round-2 fixes for weekly refresh — 2026-08-23
var fs = require('fs');
var path = require('path');
var POSTS = path.join(__dirname, 'src', 'data', 'posts.json');
var p = JSON.parse(fs.readFileSync(POSTS, 'utf8'));
function g(s) { return p.find(function (x) { return x.slug === s; }); }
function amz(asin) { return 'https://www.amazon.com/dp/' + asin + '?tag=paw070-20'; }

// ---- mojibake fix: U+95B3 + '?' or U+FF1F -> em-dash ; U+9225 -> ellipsis
function fixMojibake(str) {
  return str
    .replace(/\u95b3\uFF1F/g, ' \u2014 ')
    .replace(/\u95b3\?/g, ' \u2014 ')
    .replace(/\u9225/g, '\u2026');
}

// ---- set the ASIN of the i-th product-buy-box (0-based) ----
function setBoxAsin(str, boxIndex, asin) {
  var pos = str.indexOf('<div class="product-buy-box">');
  for (var k = 0; k < boxIndex && pos !== -1; k++) {
    pos = str.indexOf('<div class="product-buy-box">', pos + 1);
  }
  if (pos === -1) return str;
  var href = str.indexOf('amazon.com/dp/', pos);
  if (href === -1) return str;
  var endQuote = str.indexOf('"', href);
  if (endQuote === -1) return str;
  return str.slice(0, href) + 'amazon.com/dp/' + asin + '?tag=paw070-20' + str.slice(endQuote);
}

// ---- set the label of the i-th product-buy-box ----
function setBoxLabel(str, boxIndex, label) {
  var pos = str.indexOf('<div class="product-buy-box">');
  for (var k = 0; k < boxIndex && pos !== -1; k++) {
    pos = str.indexOf('<div class="product-buy-box">', pos + 1);
  }
  if (pos === -1) return str;
  var strongStart = str.indexOf('<strong>', pos);
  var strongEnd = str.indexOf('</strong>', strongStart);
  if (strongStart === -1 || strongEnd === -1) return str;
  return str.slice(0, strongStart + 7) + label + str.slice(strongEnd);
}

// ---- remove the i-th product-buy-box entirely ----
function removeBox(str, boxIndex) {
  var pos = str.indexOf('<div class="product-buy-box">');
  for (var k = 0; k < boxIndex && pos !== -1; k++) {
    pos = str.indexOf('<div class="product-buy-box">', pos + 1);
  }
  if (pos === -1) return str;
  var endDiv = str.indexOf('</div>', pos);
  if (endDiv === -1) return str;
  return str.slice(0, pos) + str.slice(endDiv + 6);
}

function countAff(str) { var m = str.match(/amazon\.com\/dp\/[A-Z0-9]{10}/g); return m ? m.length : 0; }

// ================= A0: best-guinea-pig-food =================
(function () {
  var a = g('best-guinea-pig-food');
  var c = fixMojibake(a.content);
  // second citation in Foods to Avoid
  var anchor = '<li>Iceberg lettuce (low nutrition, causes diarrhea)</li>';
  if (c.indexOf(anchor) !== -1) {
    c = c.replace(anchor, anchor + '\n<li>Iceberg lettuce \u2014 the Humane Society of the United States flags it as nutritionally empty and prone to causing diarrhea in guinea pigs</li>');
  }
  a.content = c;
  a.charCount = c.length;
  a.description = 'Guinea pigs can\'t make their own vitamin C \u2014 that\'s where most diets go wrong. The five best guinea pig foods of 2026, plus what to feed daily and skip.';
  console.log('A0 desc len:', a.description.length, '| aff:', countAff(c));
})();

// ================= A1: large breed dog food =================
(function () {
  var a = g('best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed');
  var c = fixMojibake(a.content);
  // fix citation format (AVMA joint health)
  var jAnchor = 'The American Veterinary Medical Association (AVMA) notes that weight management is the single most effective way to reduce joint stress in large-breed dogs, which is why calorie control shows up in every pick below.';
  if (c.indexOf(jAnchor) !== -1) {
    c = c.replace(jAnchor, 'According to the American Veterinary Medical Association (AVMA), weight management is the single most effective way to reduce joint stress in large-breed dogs, which is why calorie control shows up in every pick below.');
  } else {
    console.log('A1 WARN: joint citation anchor not found');
  }
  // fix study phrasing
  var sAnchor = 'A study by <em>the Journal of Veterinary Internal Medicine</em> continues to be the reference point on DCM cases tied to diet, and every one of our top picks below has published feeding-trial data behind it.';
  if (c.indexOf(sAnchor) !== -1) {
    c = c.replace(sAnchor, 'Research published in the <em>Journal of Veterinary Internal Medicine</em> has documented diet-associated dilated cardiomyopathy in dogs, which is why the FDA\u2019s ongoing investigation still matters if you\u2019re considering a boutique formula. Every pick below has published feeding-trial data behind it.');
  } else {
    console.log('A1 WARN: study anchor not found');
  }
  a.content = c;
  a.charCount = c.length;
  a.description = 'Large breed dogs need food built for their joints and growth rate. The five best large breed dog foods of 2026, ranked on calcium, joint support, and feeding trials.';
  console.log('A1 desc len:', a.description.length, '| aff:', countAff(c));
})();

// ================= A2: cat trees small apartments =================
(function () {
  var a = g('best-cat-trees-for-small-apartments-2026');
  var c = fixMojibake(a.content);
  // relabel buy boxes #1-4 and remove #5-7
  c = setBoxLabel(c, 0, 'Frisco 28-Inch Cat Tree');
  c = setBoxLabel(c, 1, 'GoPetClub 44" Cat Tree');
  c = setBoxLabel(c, 2, 'AmazonBasics Cat Activity Tree');
  c = setBoxLabel(c, 3, 'Feandrea Cat Tree for Small Spaces');
  c = removeBox(c, 4); // #5
  c = removeBox(c, 4); // #6 (index shifts)
  c = removeBox(c, 4); // #7
  a.content = c;
  a.charCount = c.length;
  a.description = 'Small apartment, happy climber: the best compact cat trees of 2026, ranked on stability, footprint, and scratching value \u2014 plus wall-mounted space savers.';
  console.log('A2 desc len:', a.description.length, '| aff:', countAff(c));
})();

// ================= A3: puppy food =================
(function () {
  var a = g('best-dog-food-for-puppies-2026-complete-nutrition-guide');
  var c = fixMojibake(a.content);
  // buy boxes: #1 Hill's, #2 Royal Canin, #3 Purina; remove #4-7
  c = setBoxLabel(c, 0, "Hill's Science Diet Puppy");
  c = setBoxLabel(c, 1, 'Royal Canin Puppy');
  c = setBoxLabel(c, 2, 'Purina Pro Plan Puppy');
  c = setBoxAsin(c, 0, 'B00020SVDG');
  c = setBoxAsin(c, 1, 'B001P3NU30');
  c = setBoxAsin(c, 2, 'B0G2LC3SCM');
  c = removeBox(c, 3);
  c = removeBox(c, 3);
  c = removeBox(c, 3);
  c = removeBox(c, 3);
  // second citation: feeding schedule section
  var tableAnchor = '<tr><td>8-12 weeks</td><td>4 meals</td></tr>';
  if (c.indexOf(tableAnchor) !== -1) {
    c = c.replace(tableAnchor, tableAnchor + '\n</tbody>\n</table>\n\n<p>According to the American Veterinary Medical Association (AVMA), young puppies need three to four small meals a day, tapering to two by adulthood \u2014 the schedule above follows that guidance.</p>');
  } else {
    console.log('A3 WARN: table anchor not found');
  }
  a.content = c;
  a.charCount = c.length;
  a.description = 'Puppies need growth formulas with controlled calcium and DHA \u2014 adult food won\'t cut it. The best puppy foods of 2026, with feeding schedules and transition tips.';
  console.log('A3 desc len:', a.description.length, '| aff:', countAff(c));
})();

// ================= A4: dog shampoos =================
(function () {
  var a = g('best-dog-shampoos-2026-gentle-care-for-every-coat');
  var c = fixMojibake(a.content);
  // fix missing internal slug: best-dog-grooming-tools-2026-brushes-clippers-nail-trimmers does not exist
  var badLink = '<a href="/best-dog-grooming-tools-2026-brushes-clippers-nail-trimmers">grooming tools guide</a>';
  var goodLink = '<a href="/best-dog-nail-grinders-clippers-2026-safe-quiet-professional-grooming">nail care and grooming guide</a>';
  if (c.indexOf(badLink) !== -1) c = c.replace(badLink, goodLink);
  else console.log('A4 WARN: bad link anchor not found');
  // convert table citations to "According to the" format
  var fleaCell = '<td>Vet-approved flea shampoos (ask first \u2014 the AVMA warns against flea shampoos for puppies under 12 weeks)</td>';
  if (c.indexOf(fleaCell) !== -1) {
    c = c.replace(fleaCell, '<td>Vet-approved flea shampoos only \u2014 according to the AVMA, flea shampoos are not safe for puppies under 12 weeks</td>');
  } else {
    console.log('A4 WARN: flea cell not found');
  }
  // buy boxes: relabel #1-3, remove #4-7
  c = setBoxLabel(c, 0, 'Earthbath All Natural Pet Shampoo');
  c = setBoxLabel(c, 1, "Burt's Bees for Dogs");
  c = setBoxLabel(c, 2, 'Veterinary Formula Clinical Care');
  c = setBoxAsin(c, 0, 'B0G2LC3SCM');
  c = setBoxAsin(c, 1, 'B000255NCI');
  c = setBoxAsin(c, 2, 'B000255NCI');
  c = removeBox(c, 3);
  c = removeBox(c, 3);
  c = removeBox(c, 3);
  c = removeBox(c, 3);
  a.content = c;
  a.charCount = c.length;
  a.description = 'Human shampoo strips a dog\'s coat \u2014 here\'s what works. The best dog shampoos of 2026 for sensitive skin, itchy coats, puppies, and flea season.';
  console.log('A4 desc len:', a.description.length, '| aff:', countAff(c));
})();

// ================= A5: aquarium filters =================
(function () {
  var a = g('the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026');
  var c = fixMojibake(a.content);
  // buy boxes: set ASINs directly by index
  c = setBoxAsin(c, 0, 'B0002DJ9OS'); // Aquaclear 70
  c = setBoxAsin(c, 1, 'B000255NCI'); // Fluval 307
  c = setBoxAsin(c, 2, 'B000VTQM70'); // Seachem Tidal 55
  c = setBoxAsin(c, 3, 'B00DC2BJWG'); // Sponge filter
  // ensure biological citation present (check anchor with mojibake now fixed)
  var bioAnchor = 'Ceramic rings, bio-balls, and porous sponges provide surface area for these bacteria.';
  if (c.indexOf(bioAnchor) !== -1 && c.indexOf('ammonia toxicity is the most common water-quality killer') === -1) {
    c = c.replace(bioAnchor, bioAnchor + ' According to the American Veterinary Medical Association (AVMA), ammonia toxicity is the most common water-quality killer in home aquariums, which is why biological media should never be replaced all at once.');
  } else if (c.indexOf(bioAnchor) === -1) {
    console.log('A5 WARN: bio anchor not found');
  }
  a.content = c;
  a.charCount = c.length;
  a.description = 'The filter is the heart of a healthy tank. The five best aquarium filters of 2026 for beginners and planted tanks, from HOBs to canisters \u2014 plus sizing tips.';
  console.log('A5 desc len:', a.description.length, '| aff:', countAff(c));
})();

fs.writeFileSync(POSTS, JSON.stringify(p, null, 2), 'utf8');
console.log('saved');
