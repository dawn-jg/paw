const posts = require('./src/data/posts.json');
console.log('Total posts:', posts.length);
console.log('');

const cats = {};
posts.forEach(p => { cats[p.category] = (cats[p.category]||0)+1; });
console.log('Categories:', JSON.stringify(cats));
console.log('');

let totalImgs = 0;
let loremImgs = 0;
let productImgs = 0;
let otherImgs = 0;
const loremPosts = [];

posts.forEach(post => {
  const imgs = [...post.content.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)];
  const loremInPost = [];
  imgs.forEach(m => {
    totalImgs++;
    const src = m[1];
    if (src.includes('loremflickr.com')) { loremImgs++; loremInPost.push(src); }
    else if (src.startsWith('/images/products/')) productImgs++;
    else otherImgs++;
  });
  if (loremInPost.length > 0) {
    loremPosts.push({ slug: post.slug, category: post.category, date: post.date, count: loremInPost.length, total: imgs.length });
  }
});

console.log('=== Image Source Summary ===');
console.log('Total images:', totalImgs);
console.log('Product images (/images/products/):', productImgs, '(' + Math.round(productImgs/totalImgs*100) + '%)');
console.log('Loremflickr images:', loremImgs, '(' + Math.round(loremImgs/totalImgs*100) + '%)');
console.log('Other images:', otherImgs);
console.log('');

if (loremPosts.length > 0) {
  console.log('Posts STILL with loremflickr images (' + loremPosts.length + '):');
  loremPosts.forEach(p => console.log(p.slug + ' | ' + p.category + ' | ' + p.date + ' | ' + p.count + '/' + p.total));
} else {
  console.log('All posts have been migrated - no loremflickr images remain!');
}
