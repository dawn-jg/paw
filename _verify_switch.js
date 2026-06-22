const fs = require('fs');
const posts = require('./src/data/posts.json');

let loremCount = 0;
let picsumCount = 0;
let lockCount = 0;
const slugsWithLock = [];

for (const [slug, post] of Object.entries(posts)) {
  if (!post.content) continue;
  const lorem = post.content.match(/https:\/\/loremflickr\.com\/[^\s"'<>]+/g) || [];
  const picsum = post.content.match(/https:\/\/picsum\.photos\/[^\s"'<>]+/g) || [];
  const locks = post.content.match(/\?lock=[a-f0-9]+/g) || [];
  
  loremCount += lorem.length;
  picsumCount += picsum.length;
  lockCount += locks.length;
  
  if (lorem.length > 0 || locks.length > 0) slugsWithLock.push(slug);
}

console.log(`loremflickr URLs: ${loremCount}`);
console.log(`picsum.photos URLs: ${picsumCount}`);
console.log(`?lock= parameters: ${lockCount}`);
console.log(`Articles with loremflickr: ${slugsWithLock.length}`);
console.log(`Total articles: ${Object.keys(posts).length}`);

// Sample a few URLs
let samples = 0;
for (const [slug, post] of Object.entries(posts)) {
  if (!post.content) continue;
  const m = post.content.match(/src="https:\/\/loremflickr\.com[^"]+"/g);
  if (m && samples < 3) {
    m.slice(0, 3).forEach(u => console.log(`  ${slug}: ${u}`));
    samples++;
  }
}
