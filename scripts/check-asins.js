const fs = require('fs');
const articles = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp_articles/new-batch.json', 'utf8'));
articles.forEach((a, i) => {
  const re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  const asins = [];
  let m;
  while ((m = re.exec(a.content)) !== null) {
    asins.push(m[1]);
  }
  const uniq = [...new Set(asins)];
  console.log('Article ' + i + ': ' + a.slug + ' - ' + uniq.length + ' unique ASINs: ' + uniq.join(', '));
});
