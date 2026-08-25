var fs = require('fs');
var p = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
function g(s) { return p.find(function (x) { return x.slug === s; }); }

var a3 = g('best-dog-food-for-puppies-2026-complete-nutrition-guide');
var bb3 = a3.content.indexOf('product-buy-box');
console.log('===== A3 buy boxes section =====');
console.log(a3.content.slice(bb3 - 100, bb3 + 1500));
console.log('\nA3 citation AVMA:', a3.content.indexOf('According to the American Veterinary Medical Association (AVMA), young puppies need three to four') !== -1);
console.log('A3 citation AAFCO:', a3.content.indexOf('the Association of American Feed Control Officials sets the minimums') !== -1);

var a4 = g('best-dog-shampoos-2026-gentle-care-for-every-coat');
var bb4 = a4.content.indexOf('product-buy-box');
console.log('\n===== A4 buy boxes section =====');
console.log(a4.content.slice(bb4 - 100, bb4 + 1500));
console.log('\nA4 citation AVMA:', a4.content.indexOf('According to the American Veterinary Medical Association (AVMA), most healthy dogs only need a bath') !== -1);
console.log('A4 citation AVMA flea:', a4.content.indexOf('according to the AVMA, flea shampoos are not safe for puppies under 12 weeks') !== -1);
