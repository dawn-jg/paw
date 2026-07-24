const fs = require('fs');
const articles = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp_articles/new-batch.json', 'utf8'));

// Update img tags based on first 2 ASINs with existing images
const imgDir = 'D:/pawcritic-next/public/images/products';
const existing = fs.readdirSync(imgDir).map(x => x.replace('.jpg', ''));

articles.forEach((a, i) => {
  const re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  const order = [];
  let m;
  while ((m = re.exec(a.content)) !== null) order.push(m[1]);
  
  const unique = [...new Set(order)];
  const imgAsins = unique.filter(a => existing.includes(a)).slice(0, 2);
  
  console.log('Article ' + i + ' (images): ' + imgAsins.join(', '));
  
  let c = a.content;
  
  // Replace img tags
  // First replace all existing img tags
  const imgRegex = /<img[^>]*>/g;
  let imgCount = 0;
  c = c.replace(imgRegex, () => {
    imgCount++;
    if (imgCount > imgAsins.length) return '';
    const asin = imgAsins[imgCount - 1];
    const alt = imgCount === 1 ? 'Pet product ' + asin + ' featured in the review' : 'Additional pet product ' + asin + ' shown in detail';
    return '<img src="/images/products/' + asin + '.jpg" alt="' + alt + '" style="max-width:100%;height:auto;display:block;margin:20px auto;" />';
  });
  
  articles[i].content = c;
});

fs.writeFileSync('D:/pawcritic-next/temp_articles/new-batch.json', JSON.stringify(articles, null, 2), 'utf8');
console.log('\nUpdated all img tags');
