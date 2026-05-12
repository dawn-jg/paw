const posts = require('./src/data/posts.json');

// Search dog beds
posts.forEach(p => {
  const t = p.title.toLowerCase();
  if (t.includes('dog bed') || t.includes('large breed') || t.includes('big dog')) {
    console.log('[' + p.slug + '] ' + p.title + ' | chars:' + p.charCount);
  }
});

console.log('---');

// Check by slug
const slug = 'the-10-best-dog-beds-for-large-breeds-in-2026-ultimate-comfort-for-big-dogs';
const p = posts.find(q => q.slug === slug);
console.log('By slug:', p?.title, p?.charCount);
if (p) {
  const m = p.content.match(/amazon\.com\/[^\s<>")]+/g);
  if (m) m.forEach(l => console.log('  ', l));
  else console.log('  NO LINKS');
  console.log('  content start:', p.content.substring(0, 200));
}
