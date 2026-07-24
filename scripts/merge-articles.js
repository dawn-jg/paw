const fs = require('fs');
const POSTS_FILE = 'D:/pawcritic-next/src/data/posts.json';
const TEMP_DIR = 'D:/pawcritic-next/temp_articles';

// Read existing posts
const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
console.log('Existing posts:', posts.length);

// Read and merge temp articles
let added = 0;
for (let i = 1; i <= 3; i++) {
  const jsonPath = TEMP_DIR + '/article_' + i + '.json';
  const article = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // Check for slug conflict
  const exists = posts.find(p => p.slug === article.slug);
  if (exists) {
    console.log('Slug collision: ' + article.slug + ' already exists! Skipping.');
    continue;
  }
  
  posts.push(article);
  added++;
  console.log('Added: ' + article.slug + ' (' + article.category + ')');
}

// Write updated posts.json
fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
console.log('\nposts.json written with ' + posts.length + ' total posts (' + added + ' new)');
