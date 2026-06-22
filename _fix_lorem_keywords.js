// Fix loremflickr URLs: replace numeric keywords with descriptive ones from the actual slug
const fs = require('fs');
const posts = require('./src/data/posts.json');
const crypto = require('crypto');

function getKeywords(slug) {
  const cleaned = slug
    .replace(/-\d{4}$/g, '')
    .split('-')
    .filter(w => !['best', 'the', 'and', 'for', 'top'].includes(w))
    .slice(0, 4)
    .join('');
  return cleaned || 'pet';
}

let count = 0;
const changed = [];

for (const [key, post] of Object.entries(posts)) {
  if (!post.content || !post.slug) continue;
  
  const original = post.content;
  let newContent = post.content;
  const keyword = getKeywords(post.slug);
  
  // Match existing loremflickr URLs: https://loremflickr.com/{width}/{height}/{oldkeyword}?lock={lock}
  const loremRegex = /https:\/\/loremflickr\.com\/(\d+)\/(\d+)\/([^?]+)\?lock=([a-f0-9]+)/g;
  
  let match;
  while ((match = loremRegex.exec(original)) !== null) {
    const fullUrl = match[0];
    const width = match[1];
    const height = match[2];
    const oldKeyword = match[3];
    const lock = match[4];
    
    // Only replace if the keyword doesn't already look descriptive (mostly alphabetic)
    if (/^[a-z]{3,}$/.test(oldKeyword) && oldKeyword !== keyword) {
      // Keyword already looks descriptive but different — skip, it was likely intentionally set
      continue;
    }
    
    const newUrl = `https://loremflickr.com/${width}/${height}/${keyword}?lock=${lock}`;
    newContent = newContent.split(fullUrl).join(newUrl);
    count++;
  }
  
  if (newContent !== original) {
    post.content = newContent;
    changed.push(post.slug);
  }
}

fs.writeFileSync('./src/data/posts.json', JSON.stringify(posts, null, 2), 'utf-8');
console.log(`Updated ${count} loremflickr URLs with descriptive keywords across ${changed.length} articles`);
if (changed.length > 0) {
  console.log('Sample:', changed.slice(0, 5).map(s => `${s} → keywords: ${getKeywords(s)}`));
}
