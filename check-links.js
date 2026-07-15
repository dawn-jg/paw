const fs = require('fs');
const posts = JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json', 'utf8'));
const newPosts = posts.filter(p => p.date === '2026-07-15');
newPosts.forEach(p => {
  const regex = /amazon\.com\/dp\/([A-Z0-9]+)\?tag=paw070-20/g;
  const matches = p.content.match(regex);
  console.log(p.slug + ': ' + matches.length + ' links');
  matches.forEach(m => console.log('  ' + m));
});
console.log('\nTotal posts:', posts.length);
