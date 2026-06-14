const fs = require('fs');
const path = 'D:\\pawcritic-next\\temp-article-birds.html';
const content = fs.readFileSync(path, 'utf8');

const affLinks = content.match(/amazon\.com\/dp\//g);
console.log('Affiliate links:', affLinks ? affLinks.length : 0);

const h2s = content.match(/<h2>/g);
console.log('H2 sections:', h2s ? h2s.length : 0);

const h3s = content.match(/<h3>/g);
console.log('H3 headings:', h3s ? h3s.length : 0);

const productCards = content.match(/class="product-card"/g);
console.log('Product cards:', productCards ? productCards.length : 0);

const faqItems = content.match(/class="faq-item"/g);
console.log('FAQ items:', faqItems ? faqItems.length : 0);

const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const words = text.split(' ').length;
console.log('Approx word count:', words);

const firstBytes = content.charCodeAt(0).toString(16) + ' ' + content.charCodeAt(1).toString(16);
console.log('First bytes hex:', firstBytes);
console.log('BOM check (no BOM = ok):', content.charCodeAt(0) !== 0xFEFF);

const stats = fs.statSync(path);
console.log('File size:', stats.size, 'bytes');
console.log('File exists:', fs.existsSync(path));

// Check each product has at least 1 affiliate link
const productSections = content.split(/class="product-card"/g).slice(1);
productSections.forEach((s, i) => {
  const links = (s.match(/amazon\.com\/dp\//g) || []).length;
  console.log('Product ' + (i+1) + ' links:', links);
});
