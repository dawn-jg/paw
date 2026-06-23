// Fix today's 3 posts: replace remaining loremflickr with picsum (seed-based)
const fs = require('fs');
const posts = require('D:/pawcritic-next/src/data/posts.json');

const slugs = [
  'best-dog-beds-orthopedic-elevated-canine-2026',
  'best-cat-trees-condos-towers-scratching-indoor-2026',
  'best-small-pet-cages-habitats-guinea-pigs-hamsters-rabbits-2026'
];

slugs.forEach(slug => {
  const post = posts.find(p => p.slug === slug);
  if (!post) return;
  
  let replaced = 0;
  let imgIdx = 0;
  
  post.content = post.content.replace(/<img[^>]*src="([^"]*loremflickr\.com[^"]*)"[^>]*>/g, (match) => {
    const seed = slug + '-' + imgIdx;
    const isProductImg = match.includes('/images/products/');
    
    // For images we haven't replaced yet, swap to picsum
    if (!isProductImg && match.includes('loremflickr')) {
      replaced++;
      const p = match.indexOf('"');
      const afterSrc = match.substring(p+1);
      const q = afterSrc.indexOf('"');
      const before = match.substring(0, p+1);
      const after = match.substring(p+1+q);
      return before + `https://picsum.photos/seed/${seed}/600/400` + after;
    }
    return match;
  });
  
  console.log(`${slug}: replaced ${replaced} loremflickr with picsum images`);
});

fs.writeFileSync('D:/pawcritic-next/src/data/posts.json', JSON.stringify(posts, null, 2));
console.log('Saved.');
