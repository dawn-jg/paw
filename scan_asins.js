const posts = require('D:/pawcritic-next/src/data/posts.json');
const hasImage = {};
require('fs').readdirSync('D:/pawcritic-next/public/images/products').forEach(f => { 
  hasImage[f.replace('.jpg','')] = true; 
});

const todaySlugs = [
  'best-dog-beds-orthopedic-elevated-canine-2026',
  'best-cat-trees-condos-towers-scratching-indoor-2026',
  'best-small-pet-cages-habitats-guinea-pigs-hamsters-rabbits-2026'
];

todaySlugs.forEach(slug => {
  const post = posts.find(p => p.slug === slug);
  if (!post) return;
  
  const asinMatches = [...post.content.matchAll(/amazon\.com\/dp\/([A-Z0-9]{10})/g)];
  const uniqueAsins = [...new Set(asinMatches.map(m => m[1]))];
  
  console.log('=== ' + slug + ' ===');
  const imgCount = [...post.content.matchAll(/<img[^>]*src="[^"]*"[^>]*>/g)].length;
  console.log('Total images:', imgCount);
  uniqueAsins.forEach(a => {
    console.log('  ASIN: ' + a + (hasImage[a] ? ' ✅' : ' ❌ no image'));
  });
  console.log('');
});

// Count sites-wide: need images for which ASINs?
const allAsins = new Set();
posts.forEach(post => {
  [...post.content.matchAll(/amazon\.com\/dp\/([A-Z0-9]{10})/g)].forEach(m => allAsins.add(m[1]));
});
const missing = [...allAsins].filter(a => !hasImage[a]);
console.log('Unique ASINs total:', allAsins.size);
console.log('ASINs WITHOUT product image:', missing.length);
console.log('Missing list:', missing.join(', '));
