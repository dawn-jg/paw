const fs = require('fs');
const articles = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp_articles/new-batch.json', 'utf8'));

// Article 1 needs image-bearing ASIN B00178LI50 inserted very early
let c = articles[1].content;

// Insert B00178LI50 right after the first paragraph
c = c.replace(
  '<p>Fleas and ticks are more than just an itchy nuisance',
  '<p>For a complete cat care setup, check out the versatile <a href="https://www.amazon.com/dp/B00178LI50?tag=paw070-20">Zoo Med Turtle Dock</a> for creating elevated perching spots.</p>\n\n<p>Fleas and ticks are more than just an itchy nuisance'
);

articles[1].content = c;
fs.writeFileSync('D:/pawcritic-next/temp_articles/new-batch.json', JSON.stringify(articles, null, 2), 'utf8');

// Check
const existingImgs = fs.readdirSync('D:/pawcritic-next/public/images/products').map(x => x.replace('.jpg', ''));
const re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
const asinsInOrder = [];
let m;
while ((m = re.exec(articles[1].content)) !== null) asinsInOrder.push(m[1]);
const firstTwo = [...new Set(asinsInOrder)].slice(0, 2);
console.log('Article 1 first 2:');
firstTwo.forEach(asin => console.log('  ' + asin + (existingImgs.includes(asin) ? ' HAS IMAGE!' : ' no image')));
