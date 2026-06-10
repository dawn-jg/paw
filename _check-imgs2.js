const posts = require('D:\\pawcritic-next\\src\\data\\posts.json');

// Find articles with images missing src
const problematic = [];
for (const p of posts) {
  const imgs = p.content.match(/<img[^>]+>/gi) || [];
  for (const img of imgs) {
    if (!img.includes('src=') && !img.includes('src =')) {
      problematic.push({ slug: p.slug, img: img.slice(0,200), date: p.date });
    }
  }
}

console.log('=== Images MISSING src attribute ===');
if (problematic.length === 0) {
  console.log('None found!');
} else {
  for (const p of problematic) {
    console.log(p.date + ' | ' + p.slug.slice(0,50));
    console.log('  ' + p.img);
    console.log('---');
  }
}

// Also check June 9 articles more carefully
console.log('\n=== June 9 articles - full img tags ===');
const june9 = posts.filter(p => p.date && p.date.startsWith('2026-06-09'));
for (const p of june9) {
  console.log('\n--- ' + p.slug + ' ---');
  const imgs = p.content.match(/<img[^>]*>/gi) || [];
  for (const img of imgs) {
    console.log(img.slice(0,250));
  }
}
