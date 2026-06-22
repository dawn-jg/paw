// Switch from picsum.photos to loremflickr.com with ?lock= unique parameter
// Uses the article's actual slug as keyword for better relevance
const fs = require('fs');
const posts = require('./src/data/posts.json');
const crypto = require('crypto');

let count = 0;
const changed = [];

// Extract meaningful keywords from the slug for loremflickr search
function getKeywords(slug) {
  // Remove year numbers and common suffixes, use the core topic
  const cleaned = slug
    .replace(/-\d{4}$/g, '')  // remove -2026 etc
    .split('-')
    .filter(w => !['best', 'the', 'and', 'for', 'top'].includes(w))
    .slice(0, 4)  // max 4 words
    .join('');
  return cleaned || 'pet';
}

for (const [key, post] of Object.entries(posts)) {
  if (!post.content || !post.slug) continue;
  
  const original = post.content;
  let newContent = post.content;
  
  // Find all picsum.photos URLs
  const picsumRegex = /https:\/\/picsum\.photos\/seed\/[^\s"'<>]+/g;
  let match;
  let imgIndex = 0;
  
  while ((match = picsumRegex.exec(original)) !== null) {
    const oldUrl = match[0];
    // Parse: /seed/{keyword}/{width}/{height}
    const parts = oldUrl.replace('https://picsum.photos', '').split('/');
    const seed = parts[2] || 'default';
    const width = parts[3] || '800';
    const height = parts[4] || '600';
    
    // Create unique lock value for each image position
    const lockInput = `${post.slug}-img-${imgIndex}-${seed}`;
    const lock = crypto.createHash('md5').update(lockInput).digest('hex').substring(0, 8);
    
    // Use the real slug (descriptive) as keyword, not the numeric key
    const keyword = getKeywords(post.slug);
    
    const newUrl = `https://loremflickr.com/${width}/${height}/${keyword}?lock=${lock}`;
    newContent = newContent.split(oldUrl).join(newUrl);
    imgIndex++;
    count++;
  }
  
  if (newContent !== original) {
    post.content = newContent;
    changed.push(post.slug);
  }
}

fs.writeFileSync('./src/data/posts.json', JSON.stringify(posts, null, 2), 'utf-8');
console.log(`Replaced ${count} images across ${changed.length} articles`);
console.log('Sample slugs:', changed.slice(0, 5));
console.log('Sample keywords:', changed.slice(0, 5).map(s => getKeywords(s)));
