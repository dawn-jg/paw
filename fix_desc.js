var fs = require('fs');
var path = require('path');
var POSTS = path.join(__dirname, 'src', 'data', 'posts.json');
var p = JSON.parse(fs.readFileSync(POSTS, 'utf8'));

var a1 = p.find(function (x) { return x.slug === 'best-dog-food-for-large-breeds-in-2026-top-5-picks-reviewed'; });
a1.description = 'Large breed dogs need food built for their joints and growth. The five best large breed dog foods of 2026, ranked on calcium, joint support, and trials.';
console.log('A1 desc:', a1.description.length);

var a3 = p.find(function (x) { return x.slug === 'best-dog-food-for-puppies-2026-complete-nutrition-guide'; });
a3.description = 'Puppies need growth formulas with controlled calcium and DHA \u2014 adult food won\'t cut it. The best puppy foods of 2026, with feeding schedules and tips.';
console.log('A3 desc:', a3.description.length);

fs.writeFileSync(POSTS, JSON.stringify(p, null, 2), 'utf8');
console.log('saved');
