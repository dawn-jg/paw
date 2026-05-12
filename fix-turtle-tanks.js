const posts = require('./src/data/posts.json');
const fs = require('fs');

const p = posts.find(q => q.title === 'Best Turtle Tanks 2026: Complete Aquatic Habitats for Your Shelled Friend');
if (!p) { console.log('NOT FOUND'); process.exit(1); }

let c = p.content;

console.log('=== Pre-conversion checks ===');
console.log('Length:', c.length);
console.log('?? marks:', (c.match(/\?\?/g)||[]).length);
console.log('## headings:', (c.match(/^## /gm)||[]).length);
console.log('### headings:', (c.match(/^### /gm)||[]).length);
console.log('- list items:', (c.match(/^- /gm)||[]).length);
console.log('--- rules:', (c.match(/^---$/gm)||[]).length);
console.log('** bold:', (c.match(/\*\*/g)||[]).length);
console.log('** link patterns:', (c.match(/\*\*\(https?:\/\/[^*]+\)\*\*/g)||[]).length);

// Replace ?? encoding → em dash
c = c.replace(/\?\?/g, '—');

// Replace Amazon search links with product ASINs
const linkReplacements = [
  // Product 1: Aqueon LED Kit
  ['**(https://www.amazon.com/s?k=Aqueon+Aquarium+LED+Kit&tag=paw070-20', '**(https://www.amazon.com/dp/B004GX47TW?tag=paw070-20'],
  // Product 2: Fluval Flex
  ['**(https://www.amazon.com/s?k=Fluval+Flex+Aquarium&tag=paw070-20', '**(https://www.amazon.com/dp/B07JH4JHTC?tag=paw070-20'],
  // Product 3: Marineland BiOrb
  ['**(https://www.amazon.com/s?k=Marineland+BiOrb+Aquarium&tag=paw070-20', '**(https://www.amazon.com/dp/B081VKRX4Q?tag=paw070-20'],
  // Product 4: API Fish Tank
  ['**(https://www.amazon.com/s?k=API+Fish+Tank+Aquarium&tag=paw070-20', '**(https://www.amazon.com/dp/B00DC2BJWG?tag=paw070-20'],
  // Product 5: Zoo Med
  ['**(https://www.amazon.com/s?k=Zoo+Med+AquaTurtle+Habitat+Deluxe+Kit&tag=paw070-20', '**(https://www.amazon.com/dp/B00178LI50?tag=paw070-20'],
  // Product 6: Penn Plax
  ['**(https://www.amazon.com/s?k=Penn+Plax+Turtle+Tank&tag=paw070-20', '**(https://www.amazon.com/dp/B004PBCFG2?tag=paw070-20'],
  // Product 7: OASE
  ['**(https://www.amazon.com/s?k=OASE+BioMaster+Thermo+Canister+Filter&tag=paw070-20', '**(https://www.amazon.com/dp/B0F3LRD8KK?tag=paw070-20'],
];

for (const [old, nu] of linkReplacements) {
  if (c.includes(old)) {
    c = c.split(old).join(nu);
    console.log('Link replaced: ' + old.substring(11, 50));
  } else {
    console.log('MISS link: ' + old.substring(11, 50));
  }
}

// Now convert to HTML
let out = [];

// Split by sections using --- as major section breaks
const sections = c.split(/\n---+\n/);

for (const section of sections) {
  const lines = section.split('\n');
  
  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    
    // Replace link pattern **(https://...)** → <a href="...">Check Price on Amazon</a>
    let html = l.replace(/\*\*\(https:\/\/[^*)]+\)\*\*/g, 
      m => `<a href="${m.slice(3,-3)}" target="_blank">Check Price on Amazon</a>`);
    
    // h2
    if (l.startsWith('## ')) {
      out.push(`<h2>${inline(l.substring(3))}</h2>`);
    }
    // h3
    else if (l.startsWith('### ')) {
      out.push(`<h3>${inline(l.substring(4))}</h3>`);
    }
    // h4 (### 1. Product)
    else if (/^### \d+\./.test(l)) {
      // Already handled above
      out.push(`<h4>${inline(l.substring(4))}</h4>`);
    }
    // list
    else if (l.startsWith('- ')) {
      out.push(`<li>${inline(l.substring(2))}</li>`);
    }
    // table row
    else if (l.startsWith('|')) {
      out.push(l); // pass through tables as-is for now
    }
    // h3 like "### 1. Product Name"
    else if (/^### \d+\. /.test(l)) {
      out.push(`<h3>${inline(l.substring(4))}</h3>`);
    }
    // paragraph with bold label (like **Price:** $129.99...)
    else {
      out.push(`<p>${inline(html)}</p>`);
    }
  }
  
  // Add section divider
  out.push('<hr>');
}

// Wrap consecutive <li> items in <ul>
let final = out.join('\n');

// Fix consecutive list items
final = final.replace(/<\/li>\n<li>/g, '</li>\n<li>');

// Wrap list items in ul tags
const lines2 = final.split('\n');
let final2 = [];
let inUl = false;
for (const l of lines2) {
  if (l.startsWith('<li>')) {
    if (!inUl) { final2.push('<ul>'); inUl = true; }
  } else {
    if (inUl) { final2.push('</ul>'); inUl = false; }
  }
  final2.push(l);
}
if (inUl) final2.push('</ul>');

final = final2.join('\n');

// Fix remaining ??
final = final.replace(/\?\?/g, '—');

// Fix # → &amp;
final = final.replace(/&#(\d+);/g, (m, n) => '&#' + n + ';');
final = final.replace(/&amp;(\w+;)/g, (m, n) => '&#38;' + n);

console.log('\n=== Post-conversion checks ===');
const mdCheck = final.match(/^## |\*\*|\?\?/gm);
console.log('Remaining ##:', (final.match(/## /g)||[]).length);
console.log('Remaining **:', (final.match(/\*\*/g)||[]).length);
console.log('Remaining ??:', (final.match(/\?\?/g)||[]).length);
console.log('Has <h2>:', final.includes('<h2>'));
console.log('Has <p>:', final.includes('<p>'));
console.log('Has <a href=', final.includes('<a href='));
console.log('Has amazon.com/dp:', final.includes('amazon.com/dp'));

p.content = final;

fs.writeFileSync('./src/data/posts.json', JSON.stringify(posts, null, 2));
console.log('\nSaved! New length:', final.length);

function inline(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // JSX escape
  text = text.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
  return text;
}