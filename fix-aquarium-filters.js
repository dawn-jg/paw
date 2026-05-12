const posts = require('./src/data/posts.json');
const fs = require('fs');

const p = posts.find(q => q.title === 'Best Aquarium Filters 2026: Complete Guide to Crystal Clear Water');
if (!p) { console.log('NOT FOUND'); process.exit(1); }

const replacements = [
  ['B0002AT3EW', 'B00DJYIUS0'],
  ['B0D3T1Z6XM', 'B0002AQXTA'],
  ['B00ABC4567', 'B00020SVDG'],
  ['B001DEF890', 'B004HHJSKI'],
  ['B07GHI1234', 'B07GQM8JM4'],
  ['B0G1XBKH62', 'B0G6D7WSLR'],
  ['B001ABC890', 'B00NLEJWN8'],
  ['B07DEF5678', 'B0GTV4919Y'],
  ['B07JKL8901', 'B0002DJ9OS'],
  ['B0F3LN7ZBG', 'B000OPBMP8'],
];

let count = 0;
replacements.forEach(([old, asin]) => {
  if (p.content.includes(old)) {
    p.content = p.content.split(old).join(asin);
    console.log('OK ' + old + ' -> ' + asin);
    count++;
  } else {
    console.log('MISS ' + old);
  }
});

console.log('\nReplaced: ' + count + '/10');
fs.writeFileSync('./src/data/posts.json', JSON.stringify(posts, null, 2));
console.log('Saved');