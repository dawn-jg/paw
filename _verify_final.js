const posts = require('./src/data/posts.json');
const text = JSON.stringify(posts);

console.log('=== Image URL Summary ===');
console.log(`loremflickr URLs: ${(text.match(/loremflickr/g)||[]).length}`);
console.log(`picsum.photos URLs: ${(text.match(/picsum/g)||[]).length}`);
console.log(`?lock= parameters: ${(text.match(/\?lock=/g)||[]).length}`);

// Sample first article's images
const first = posts[Object.keys(posts)[0]];
const imgs = first.content.match(/src="https:[^"]+"/g) || [];
console.log('\n=== First article image URLs ===');
imgs.slice(0, 4).forEach(u => console.log(u));

// Check duplicate image URLs
const allUrls = text.match(/https:\/\/loremflickr\.com\/[^\s"'<>]+/g) || [];
const uniqueUrls = new Set(allUrls);
console.log(`\nTotal loremflickr URLs: ${allUrls.length}`);
console.log(`Unique loremflickr URLs: ${uniqueUrls.size}`);
console.log(`Duplicates: ${allUrls.length - uniqueUrls.size}`);

if (allUrls.length - uniqueUrls.size > 0) {
  // Show which ones are duplicated
  const seen = {};
  allUrls.forEach(u => { seen[u] = (seen[u]||0) + 1; });
  const dups = Object.entries(seen).filter(([k,v]) => v > 1);
  console.log('Duplicate URLs (first 10):');
  dups.slice(0, 10).forEach(([url, count]) => console.log(`  ×${count}: ${url}`));
}
