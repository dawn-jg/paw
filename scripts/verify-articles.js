const fs = require('fs');
const a = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp_articles/new-batch.json', 'utf8'));
a.forEach((x, i) => {
  const imgs = x.content.match(/<img/g);
  const re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  const asins = [];
  let m;
  while ((m = re.exec(x.content)) !== null) asins.push(m[1]);
  const uniq = [...new Set(asins)];
  console.log('Article ' + i + ': ' + uniq.length + ' ASINs, ' + (imgs ? imgs.length : 0) + ' images');
  uniq.forEach(u => console.log('  ' + u));
});
