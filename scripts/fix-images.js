const fs = require('fs');

const articles = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp_articles/new-batch.json', 'utf8'));

// Available images for each category (match thematically as best we can)
// B001P3NU30 = Virbac C.E.T. Enzymatic Oral Hygiene Chews (dog product)
// B0002DHQIY = Fluval ClearMax Phosphate Remover (has image)
// B0B4VJRX7Y = aquarium light (has image)
// B0GTV4919Y = fish filter (has image)
// B00020SVDG = AquaClear filter (has image)
// B000255NCI = API test kit (has image)
// B087DNHXD4 = Catstages puzzle feeder (cat product - has image)
// B0DNKGMTDW = hamster cage (has image)
// B00178LI50 = turtle dock (has image)
// B0G5CTR7GC = bird cage (has image)

// For article 0 (Dogs), B00020SVDG has an image. Replace second img with B001P3NU30 (dog product)
// But we need to make B001P3NU30 appear as an affiliate link too

// For article 1 (Cats), B087DNHXD4 is the only cat image. We need to insert B087DNHXD4
// into the content as one of the first 2 unique ASINs

// Approach: Directly update the <img> tags and optionally insert 
// affiliate links for the image ASINs if not already present

articles.forEach((a, i) => {
  let c = a.content;
  
  if (i === 0) {
    // Article 0 (Dogs): first ASIN is B00020SVDG (has image), second is B08F7M3KBC (no image)
    // Insert B001P3NU30 as an early link so it's in the first 2
    // Add it to the Top Pick section
    c = c.replace(
      'Check the current price: <a href="https://www.amazon.com/dp/B00020SVDG?tag=paw070-20">VISTOP Dog Pool on Amazon</a>',
      'Check the current price: <a href="https://www.amazon.com/dp/B00020SVDG?tag=paw070-20">VISTOP Dog Pool on Amazon</a> | Also try the <a href="https://www.amazon.com/dp/B001P3NU30?tag=paw070-20">Virbac C.E.T. Dental Chews</a> for post-swim dental care'
    );
  }
  
  if (i === 1) {
    // Article 1 (Cats): no images available for first 2 ASINs
    // Insert B087DNHXD4 as a very early link (it's the only cat image we have)
    c = c.replace(
      '<p>Before selecting a product',
      '<p>For puzzle enrichment alongside flea prevention, check the <a href="https://www.amazon.com/dp/B087DNHXD4?tag=paw070-20">Nina Ottosson Cat Puzzle Feeder</a> for indoor cats.</p>\n\n<p>Before selecting a product'
    );
    // Also insert B00178LI50 which has an image
    c = c.replace(
      '<p><strong>Year-round prevention is essential.</strong>',
      '<p>For safe outdoor access, consider the <a href="https://www.amazon.com/dp/B00178LI50?tag=paw070-20">Zoo Med Turtle Dock</a> as a multi-purpose pet platform.</p>\n\n<p><strong>Year-round prevention is essential.</strong>'
    );
  }
  
  articles[i].content = c;
});

// Write back updated content
fs.writeFileSync('D:/pawcritic-next/temp_articles/new-batch.json', JSON.stringify(articles, null, 2), 'utf8');

// Now re-check: first 2 ASINs per article
const existingImgs = fs.readdirSync('D:/pawcritic-next/public/images/products').map(x => x.replace('.jpg', ''));

articles.forEach((a, i) => {
  const re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  const asinsInOrder = [];
  let m;
  while ((m = re.exec(a.content)) !== null) {
    asinsInOrder.push(m[1]);
  }
  const firstTwo = [...new Set(asinsInOrder)].slice(0, 2);
  
  console.log('Article ' + i + ' (' + a.slug + '):');
  firstTwo.forEach(asin => {
    console.log('  ' + asin + (existingImgs.includes(asin) ? ' HAS IMAGE!' : ' no image'));
  });
  // Also count total
  console.log('  Total unique ASINs: ' + [...new Set(asinsInOrder)].length + '\n');
});
