const posts = require('./src/data/posts.json');

// Find Large Breed Dog Beds
const p1 = posts.find(q => q.title.toLowerCase().includes('large breed dog'));
console.log('=== Large Breed Dog Beds ===');
console.log('title:', p1?.title);
console.log('charCount:', p1?.charCount);
if (p1) {
  const m = p1.content.match(/amazon\.com\/[^\s<>\"')]+/g);
  if (m) m.forEach(l => console.log('  ', l));
  else console.log('  NO LINKS');
  console.log('  content start:', p1.content.substring(0, 300));
}
console.log('');

// Check Aquarium Filters links more carefully
const p2 = posts.find(q => q.title === 'Best Aquarium Filters 2026: Complete Guide to Crystal Clear Water');
console.log('=== Aquarium Filters - link check ===');
if (p2) {
  const m = p2.content.match(/href='https?:\/\/www\.amazon\.com\/[^']+'/g);
  if (m) m.forEach(l => console.log('  ', l));
  console.log('  content start:', p2.content.substring(0, 300));
}
console.log('');

// Turtle Tanks content check
const p3 = posts.find(q => q.title.includes('Turtle Tanks') && q.title.includes('Complete Aquatic'));
console.log('=== Turtle Tanks ===');
console.log('title:', p3?.title);
console.log('charCount:', p3?.charCount);
if (p3) {
  console.log('content start:', p3.content.substring(0, 500));
  console.log('...');
  console.log('content end:', p3.content.substring(p3.content.length - 300));
}