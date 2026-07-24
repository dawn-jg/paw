const fs = require('fs');
const articles = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp_articles/new-batch.json', 'utf8'));

// For each article, find first 2 ASINs with existing images, add <img> tags
const imgDir = 'D:/pawcritic-next/public/images/products';
const existing = fs.readdirSync(imgDir).map(x => x.replace('.jpg', ''));

articles.forEach((a, i) => {
  const re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  const order = [];
  let m;
  while ((m = re.exec(a.content)) !== null) order.push(m[1]);
  
  const unique = [...new Set(order)];
  const imgAsins = unique.filter(a2 => existing.includes(a2)).slice(0, 2);
  
  console.log('Article ' + i + ' (' + a.slug + '): using images ' + imgAsins.join(', '));
  
  let c = a.content;
  
  // Remove any existing img tags
  c = c.replace(/<img[^>]*>/g, '');
  
  // Insert img tags after the date paragraph
  const dateRegex = /<p>Published on[^<]*<\/p>/;
  let imgHtml = '';
  if (imgAsins.length >= 1) {
    imgHtml += '\n\n<img src="/images/products/' + imgAsins[0] + '.jpg" alt="Pet product ' + imgAsins[0] + ' featured in this review" style="max-width:100%;height:auto;display:block;margin:20px auto;" />';
  }
  if (imgAsins.length >= 2) {
    imgHtml += '\n\n<img src="/images/products/' + imgAsins[1] + '.jpg" alt="Pet product ' + imgAsins[1] + ' shown in detail" style="max-width:100%;height:auto;display:block;margin:20px auto;" />';
  }
  
  c = c.replace(dateRegex, '$&' + imgHtml);
  articles[i].content = c;
});

fs.writeFileSync('D:/pawcritic-next/temp_articles/new-batch.json', JSON.stringify(articles, null, 2), 'utf8');
console.log('\nDone');
