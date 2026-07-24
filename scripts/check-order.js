const fs = require('fs');

// Load the validated new batch
const articles = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp_articles/new-batch.json', 'utf8'));
const existingImgs = fs.readdirSync('D:/pawcritic-next/public/images/products').map(x => x.replace('.jpg', ''));

// For each article, find the first 2 ASINs and check images
articles.forEach((a, i) => {
  const re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  const asinsInOrder = [];
  let m;
  while ((m = re.exec(a.content)) !== null) {
    asinsInOrder.push(m[1]);
  }
  const firstTwo = [...new Set(asinsInOrder)].slice(0, 2);
  
  let hasImg = 0;
  firstTwo.forEach(asin => {
    if (existingImgs.includes(asin)) {
      console.log('  HAS IMAGE: ' + asin);
      hasImg++;
    } else {
      console.log('  NO IMAGE: ' + asin);
    }
  });
  
  console.log('Article ' + i + ': first 2 ASINs -> ' + hasImg + '/2 images available\n');
});
