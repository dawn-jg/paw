var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
function g(s) { return p.find(function (x) { return x.slug === s; }); }

// Verify key new content markers for each article
var checks = [
  ['A0 new intro', 'best-guinea-pig-food', "can't make their own vitamin C, and the deficiency builds slowly"],
  ['A0 HSUS citation', 'best-guinea-pig-food', 'According to the Humane Society of the United States'],
  ['A0 2026 trends', 'best-guinea-pig-food', "What's changed in 2026"],
  ['A0 internal vits', 'best-guinea-pig-food', '/best-guinea-pig-vitamin-c-supplements-2026'],
  ['A0 internal first-pet', 'best-guinea-pig-food', '/how-to-choose-first-small-pet-buying-guide'],
  ['A0 2nd HSUS citation', 'best-guinea-pig-food', 'the Humane Society of the United States flags it as nutritionally empty'],
  ['A1 2026 para', 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed', "What's new for large breeds in 2026"],
  ['A1 JVIM study', 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed', 'Journal of Veterinary Internal Medicine'],
  ['A1 AVMA cite', 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed', 'According to the American Veterinary Medical Association (AVMA), weight management'],
  ['A1 internal puppy', 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed', '/best-dog-food-for-puppies-2026-complete-nutrition-guide'],
  ['A1 internal bloat', 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed', '/dog-bloat-gdv-symptoms-prevention-guide'],
  ['A1 internal wetdry', 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed', '/wet-vs-dry-dog-food-which-is-better'],
  ['A1 updated line', 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed', 'Last updated: August 2026'],
  ['A2 new intro', 'best-cat-trees-for-small-apartments-2026', 'Cat trees got better at being small in 2026'],
  ['A2 AVMA cite', 'best-cat-trees-for-small-apartments-2026', 'According to the American Veterinary Medical Association (AVMA), vertical space'],
  ['A2 ASPCA cite', 'best-cat-trees-for-small-apartments-2026', 'According to the ASPCA, cats scratch to mark territory'],
  ['A2 internal trees', 'best-cat-trees-for-small-apartments-2026', '/best-cat-trees-2026-scratching-posts-condo-towers-activity-centers'],
  ['A2 internal myths', 'best-cat-trees-for-small-apartments-2026', '/cat-myths-debunked-common-misconceptions'],
  ['A2 internal window', 'best-cat-trees-for-small-apartments-2026', '/best-cat-window-perches-2026-sunny-spots-for-your-kitty-to-lounge'],
  ['A2 human conclusion', 'best-cat-trees-for-small-apartments-2026', 'measure your corner before you buy'],
  ['A2 fixed affordable', 'best-cat-trees-for-small-apartments-2026', 'Affordable \u2014 usually under $70'],
  ['A3 new intro', 'best-dog-food-for-puppies-2026-complete-nutrition-guide', 'The biggest puppy food news in 2026'],
  ['A3 AVMA cite', 'best-dog-food-for-puppies-2026-complete-nutrition-guide', 'According to the American Veterinary Medical Association (AVMA), puppies should stay on a growth formula'],
  ['A3 AVMA meals', 'best-dog-food-for-puppies-2026-complete-nutrition-guide', 'According to the American Veterinary Medical Association (AVMA), young puppies need three to four small meals'],
  ['A3 AAFCO cite', 'best-dog-food-for-puppies-2026-complete-nutrition-guide', 'the Association of American Feed Control Officials sets the minimums'],
  ['A3 internal large', 'best-dog-food-for-puppies-2026-complete-nutrition-guide', '/best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'],
  ['A3 internal crate', 'best-dog-food-for-puppies-2026-complete-nutrition-guide', '/how-to-crate-train-a-dog'],
  ['A4 new intro', 'best-dog-shampoos-2026-gentle-care-for-every-coat', 'Dog shampoo is having a mild ingredient arms race in 2026'],
  ['A4 AVMA cite', 'best-dog-shampoos-2026-gentle-care-for-every-coat', 'According to the American Veterinary Medical Association (AVMA), most healthy dogs only need a bath'],
  ['A4 AVMA flea cite', 'best-dog-shampoos-2026-gentle-care-for-every-coat', 'according to the AVMA, flea shampoos are not safe for puppies under 12 weeks'],
  ['A4 internal nail', 'best-dog-shampoos-2026-gentle-care-for-every-coat', '/best-dog-nail-grinders-clippers-2026-safe-quiet-professional-grooming'],
  ['A4 internal sensitive', 'best-dog-shampoos-2026-gentle-care-for-every-coat', '/best-dog-shampoo-2026-gentle-cleansing-for-sensitive-skin'],
  ['A5 new intro', 'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026', 'What changed in 2026: canister filters got quieter'],
  ['A5 UF cite', 'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026', 'according to the UF/IFAS Extension'],
  ['A5 AVMA cite', 'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026', 'According to the American Veterinary Medical Association (AVMA), ammonia toxicity'],
  ['A5 internal cycle', 'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026', '/how-to-cycle-aquarium-nitrogen-cycle-guide'],
  ['A5 internal water', 'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026', '/how-often-change-aquarium-water-schedule-guide'],
  ['A5 internal hob', 'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026', '/best-aquarium-power-filters-hob-2026'],
  ['A5 price fixed', 'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026', '$59.99'],
  ['A5 no Oase box', 'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026', 'Oase BioMaster 600 \u2014 Best Premium'],
];
var fail = 0;
checks.forEach(function (c) {
  var a = g(c[1]);
  var ok = a && a.content.indexOf(c[2]) !== -1;
  if (!ok) { fail++; console.log('MISS:', c[0], '->', c[2]); }
});
console.log(fail === 0 ? 'ALL ' + checks.length + ' CONTENT CHECKS PASS' : fail + ' CHECKS MISSING');
