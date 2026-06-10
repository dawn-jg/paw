const fs = require('fs');
const filePath = 'D:\\pawcritic-next\\src\\data\\posts.json';
const raw = fs.readFileSync(filePath, 'utf8');
const posts = JSON.parse(raw);

let fixed = 0;
for (const p of posts) {
  if (p.content.includes('<img src=\\"')) {
    // Fix: replace \" with " in img tags only
    const oldContent = p.content;
    p.content = p.content.replace(/<img src=\\"/g, '<img src="');
    p.content = p.content.replace(/\\" alt=\\"/g, '" alt="');
    p.content = p.content.replace(/\\" loading=\\"/g, '" loading="');
    p.content = p.content.replace(/\\">/g, '">');
    if (oldContent !== p.content) {
      console.log('Fixed: ' + p.slug);
      console.log('  Before: ' + oldContent.substring(oldContent.indexOf('<img'), oldContent.indexOf('<img') + 150));
      console.log('  After:  ' + p.content.substring(p.content.indexOf('<img'), p.content.indexOf('<img') + 150));
      fixed++;
    }
  }
}

if (fixed === 0) {
  console.log('No broken articles found.');
} else {
  console.log('\nFixed ' + fixed + ' articles. Saving...');
  fs.writeFileSync(filePath, JSON.stringify(posts, null, 4), 'utf8');
  console.log('Saved!');
  
  // Verify
  const verify = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let stillBroken = 0;
  for (const p of verify) {
    if (p.content.includes('<img src=\\"')) stillBroken++;
  }
  console.log('Still broken after fix: ' + stillBroken);
}
