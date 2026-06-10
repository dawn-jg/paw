const fs = require('fs');
const posts = require('D:\\pawcritic-next\\src\\data\\posts.json');

// Check for escaped quotes in image tags (backslash before quote inside HTML)
console.log('=== Articles with escaped quotes (backslash before quote) in img tags ===');
let count = 0;
for (const p of posts) {
  // Look for img tags with \ before quotes
  const imgs = p.content.match(/<img[^>]*>/gi) || [];
  for (const img of imgs) {
    if (img.includes('\\"') || img.includes("\\'")) {
      count++;
      if (count <= 20) {
        console.log(p.date + ' | ' + p.slug.slice(0,55) + ' | ' + img.slice(0,150));
      }
      break;
    }
  }
}
console.log('Total articles with escaped quotes in images: ' + count);

// Check which articles DON'T have this issue
console.log('\n=== June articles WITHOUT escaped quotes in images ===');
const juneArticles = posts.filter(p => p.date && p.date.startsWith('2026-06'));
for (const p of juneArticles) {
  const imgs = p.content.match(/<img[^>]*>/gi) || [];
  let hasEscape = false;
  for (const img of imgs) {
    if (img.includes('\\"')) { hasEscape = true; break; }
  }
  if (!hasEscape) {
    console.log(p.date + ' | ' + p.slug.slice(0,55) + ' | OK (no escapes)');
  }
}

// Check how JSON stores the escaped quotes vs normal quotes for an example
console.log('\n=== Raw JSON inspection (best-crested-gecko) ===');
const raw = fs.readFileSync('D:\\pawcritic-next\\src\\data\\posts.json', 'utf8');
const match = raw.match(/best-crested-gecko-food-diet-2026[^}]+<img[^>]+>/);
if (match) {
  console.log('In raw JSON file:');
  console.log(match[0].substring(0, 250));
}

// Also check for correct articles (May 31) to compare
console.log('\n=== May 31 article - raw JSON comparison ===');
const match2 = raw.match(/best-reef-tank-starter-kits-2026[^}]+<img[^>]+>/);
if (match2) {
  console.log(match2[0].substring(0, 250));
}
