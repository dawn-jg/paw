import fs from 'fs';
const h = fs.readFileSync('D:\\pawcritic-next\\temp-article-fish.html', 'utf8');

const links = [...h.matchAll(/amazon\.com\/dp\/([A-Z0-9]+)\?tag=paw070-20/g)];
console.log('Affiliate links:', links.length);

const asins = [...new Set(links.map(l => l[1]))];
console.log('Unique ASINs:', asins.join(', '));

const text = h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log('Approx word count:', text.split(' ').length);

const cards = h.match(/class="product-card"/g);
console.log('Product cards:', cards ? cards.length : 0);

const disclosures = h.match(/affiliate-disclosure/g);
console.log('Has affiliate-disclosure:', disclosures ? 'Yes' : 'No');

const structural = ['How We Tested', 'Comparison Table', 'FAQ', 'Final Recommendation', 'Why RO/DI'];
structural.forEach(s => {
  console.log('Has "' + s + '":', h.includes(s) ? 'Yes' : 'No');
});
