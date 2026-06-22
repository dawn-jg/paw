const posts = require('./src/data/posts.json');
const keys = Object.keys(posts);
const numeric = keys.filter(k => /^\d+$/.test(k));
const named = keys.filter(k => !/^\d+$/.test(k));
console.log(`Total keys: ${keys.length}`);
console.log(`Numeric keys: ${numeric.length} (${numeric[0]}..${numeric[numeric.length-1]})`);
console.log(`Named keys: ${named.length}`);
console.log(`First 5 named:`, named.slice(0,5));
console.log(`Last 5 named:`, named.slice(-5));
// Check if numeric keys have content
if (numeric.length > 0) {
  const p = posts[numeric[0]];
  console.log(`Numeric key '${numeric[0]}' has content: ${(p.content||'').length > 0}, title: ${p.title}`);
}
