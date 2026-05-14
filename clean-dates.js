const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'data', 'posts.json');
const posts = JSON.parse(fs.readFileSync(file, 'utf8'));

let count = 0;
for (const post of posts) {
  if (post.date && post.date.includes(' ')) {
    const before = post.date;
    post.date = post.date.split(' ')[0]; // "2026-05-14 10:00:00" → "2026-05-14"
    count++;
    console.log(`${before} → ${post.date}`);
  }
}

fs.writeFileSync(file, JSON.stringify(posts, null, 2), 'utf8');
console.log(`\nDone! Fixed ${count} date fields.`);
