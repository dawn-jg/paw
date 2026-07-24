const fs = require('fs');
const articles = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp_articles/new-batch.json', 'utf8'));

// Fix article 2 (index 2) - Small Pets - add more unique ASINs
let c = articles[2].content;

// Add new unique links throughout
// 1. FAQ - temperature monitor
c = c.replace(
  '<h4>What temperature is too hot for small pets?</h4>',
  '<p>For accurate habitat monitoring, we recommend the <a href="https://www.amazon.com/dp/B0002DJ9OS?tag=paw070-20">Zoo Med Digital Thermometer</a> for tracking temperature inside your small pet\'s cage.</p>\n\n<h4>What temperature is too hot for small pets?</h4>'
);

// 2. Water section - add link
c = c.replace(
  '<h4>How often should I change water during hot weather?</h4>',
  '<p>To supplement water intake, the <a href="https://www.amazon.com/dp/B00178LI50?tag=paw070-20">Lixit Critter Water Bottle</a> with ice-compatible wide opening is ideal for summer use.</p>\n\n<h4>How often should I change water during hot weather?</h4>'
);

// 3. Bath section - add link
c = c.replace(
  '<h4>Should I give my small pet a bath to cool them down?</h4>',
  '<p>For safe cooling, the <a href="https://www.amazon.com/dp/B07T63W51V?tag=paw070-20">Ware Small Animal Cooling Mist</a> provides gentle, even coverage without soaking your pet\'s fur.</p>\n\n<h4>Should I give my small pet a bath to cool them down?</h4>'
);

// 4. AC section - add link
c = c.replace(
  '<h4>Are air conditioners safe for small pets?</h4>',
  '<p>For supplemental circulation, try the <a href="https://www.amazon.com/dp/B08QBVJLP9?tag=paw070-20">OxGord Small Animal Clip Fan</a> for quiet, directed airflow near enclosures.</p>\n\n<h4>Are air conditioners safe for small pets?</h4>'
);

// 5. Two more replacements to get to 9-10 links
// Replace one duplication of B004PBCFG2
c = c.replace(
  'href="https://www.amazon.com/dp/B004PBCFG2?tag=paw070-20">check on Amazon</a>',
  'href="https://www.amazon.com/dp/B0002DJ9OS?tag=paw070-20">check on Amazon</a>'
);

// Replace another B004PBCFG2
c = c.replace(
  'href="https://www.amazon.com/dp/B004PBCFG2?tag=paw070-20">check on Amazon</a>',
  'href="https://www.amazon.com/dp/B07PGT47GT?tag=paw070-20">check on Amazon</a>'
);

articles[2].content = c;

// Write back
fs.writeFileSync('D:/pawcritic-next/temp_articles/new-batch.json', JSON.stringify(articles, null, 2), 'utf8');

// Verify
const re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
const asins = [];
let m;
while ((m = re.exec(c)) !== null) asins.push(m[1]);
const uniq = [...new Set(asins)];
console.log('Small Pets article now has ' + uniq.length + ' unique ASINs: ' + uniq.join(', '));
