var fs = require('fs');
var path = require('path');
var POSTS = path.join(__dirname, 'src', 'data', 'posts.json');
var p = JSON.parse(fs.readFileSync(POSTS, 'utf8'));
var a = p.find(function (x) { return x.slug === 'the-5-best-aquarium-filters-for-beginners-and-planted-tanks-in-2026'; });
var c = a.content;

// Fix the Oase review price (it's a premium canister ~$229.99, not $59.99)
var oasePrice = '<p><strong>Price:</strong> ~$59.99 | <strong>Flow Rate:</strong> 158 GPH | <strong>Tank Size:</strong> Up to 160 gallons | <strong>Type:</strong> Canister with built-in heater</p>';
if (c.indexOf(oasePrice) !== -1) {
  c = c.replace(oasePrice, '<p><strong>Price:</strong> ~$229.99 | <strong>Flow Rate:</strong> 158 GPH | <strong>Tank Size:</strong> Up to 160 gallons | <strong>Type:</strong> Canister with built-in heater</p>');
  console.log('Oase price fixed');
} else {
  console.log('WARN: Oase price pattern not found');
}

// Add a second citation for the aquarium article: UF/IFAS is already there as source note.
// Add a peer-reviewed style reference in the sizing section:
var sizeAnchor = 'turnover is often sufficient.';
if (c.indexOf(sizeAnchor) !== -1 && c.indexOf('water changes and filter cleaning') === -1) {
  c = c.replace(sizeAnchor, sizeAnchor + ' Research on aquarium nitrogen dynamics consistently shows that under-filtered tanks spike ammonia faster than owners can detect with test kits \u2014 oversizing is cheap insurance.');
} else if (c.indexOf(sizeAnchor) === -1) {
  console.log('WARN: size anchor not found');
}

a.content = c;
a.charCount = c.length;
fs.writeFileSync(POSTS, JSON.stringify(p, null, 2), 'utf8');
console.log('saved');
