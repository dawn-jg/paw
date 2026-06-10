const posts = require('D:\\pawcritic-next\\src\\data\\posts.json');
const recent = posts.filter(p => p.date && p.date.startsWith('2026-06'));
console.log('=== Recent articles (June 2026) ===');
for (const p of recent) {
  const imgCount = (p.content.match(/<img /gi) || []).length;
  const altCount = (p.content.match(/alt=/gi) || []).length;
  const srcCount = (p.content.match(/src=/gi) || []).length;
  console.log(p.date + ' | ' + p.slug.slice(0,55) + ' | imgs:' + imgCount + ' | alt:' + altCount + ' | src:' + srcCount);
}
console.log('\n=== Image src patterns in recent articles ===');
for (const p of recent.slice(0,6)) {
  const imgs = p.content.match(/<img[^>]+>/gi) || [];
  for (const img of imgs.slice(0,2)) {
    const srcMatch = img.match(/src="([^"]+)"/);
    const src = srcMatch ? srcMatch[1].slice(0,80) : 'NO_SRC';
    console.log(p.slug.slice(0,40) + ' | ' + src);
  }
}

// Also check May 31 and late May articles for comparison
console.log('\n=== Late May articles ===');
const lateMay = posts.filter(p => p.date && p.date >= '2026-05-25' && p.date < '2026-06-01');
for (const p of lateMay) {
  const imgCount = (p.content.match(/<img /gi) || []).length;
  const srcCount = (p.content.match(/src=/gi) || []).length;
  console.log(p.date + ' | ' + p.slug.slice(0,55) + ' | imgs:' + imgCount + ' | src:' + srcCount);
  const imgs = p.content.match(/<img[^>]+>/gi) || [];
  for (const img of imgs.slice(0,1)) {
    const srcMatch = img.match(/src="([^"]+)"/);
    const src = srcMatch ? srcMatch[1].slice(0,80) : 'NO_SRC';
    console.log('  -> ' + src);
  }
}
