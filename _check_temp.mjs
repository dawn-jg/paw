import fs from 'fs';

['fish','reptiles','birds'].forEach(cat => {
  const c = fs.readFileSync(`D:\\pawcritic-next\\temp-article-${cat}.html`, 'utf8');
  const stripped = c.replace(/<[^>]*>/g, ' ');
  const wc = stripped.split(/\s+/).filter(Boolean).length;
  const links = c.match(/amazon\.com\/dp\/[A-Z0-9]{10}/g) || [];
  const unique = [...new Set(links)];
  console.log(`${cat}: ${wc} words, ${links.length} links, ${unique.length} unique ASINs`);
  console.log(`  Affiliate tag: ${c.includes('tag=paw070-20') ? 'OK' : 'MISSING!'}`);
  console.log(`  Pros/cons: ${c.includes('<li><strong>Pros:</strong>') ? 'OK' : 'CHECK'}`);
  console.log(`  Disclosure: ${c.includes('affiliate-disclosure') ? 'OK' : 'MISSING!'}`);
  console.log(`  Table: ${c.includes('<table>') ? 'OK' : 'MISSING!'}`);
  console.log(`  FAQ: ${c.toLowerCase().includes('faq') ? 'OK' : 'MISSING!'}`);
  console.log(`  BOM: ${c.charCodeAt(0) === 0xFEFF ? 'FAIL' : 'OK'}`);
  console.log('---');
});
