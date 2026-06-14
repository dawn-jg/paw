import fs from 'fs';

const POSTS_FILE = 'D:\\pawcritic-next\\src\\data\\posts.json';
const DATA_DIR = 'D:\\pawcritic-next\\temp-article-';
const TODAY = '2026-06-13';

// Load existing posts
const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));

// Define articles: category, tag, fileSuffix
const articles = [
  {
    category: 'Fish',
    tag: 'fish',
    file: DATA_DIR + 'fish.html',
    title: 'Best Aquarium RO/DI Filtration Systems 2026: Pure Water for Reef Tanks, Planted Aquariums & Sensitive Species',
    slug: 'best-aquarium-ro-di-filtration-systems-pure-water-reef-planted-2026'
  },
  {
    category: 'Reptiles',
    tag: 'reptiles',
    file: DATA_DIR + 'reptiles.html',
    title: 'Best Leopard Gecko Terrarium Supplies & Starter Kits 2026: Complete Habitat Setup for Happy, Healthy Leos',
    slug: 'best-leopard-gecko-terrarium-supplies-starter-kits-complete-habitat-2026'
  },
  {
    category: 'Birds',
    tag: 'birds',
    file: DATA_DIR + 'birds.html',
    title: 'Best Budgie & Parakeet Cages & Accessories 2026: Complete Habitat Guide for Happy Little Birds',
    slug: 'best-budgie-parakeet-cages-accessories-complete-habitat-guide-2026'
  }
];

let added = 0;

articles.forEach(article => {
  const content = fs.readFileSync(article.file, 'utf8');
  
  // Extract description: first non-header paragraph text (strip HTML tags)
  const stripped = content.replace(/<[^>]*>/g, ' ');
  const firstParas = stripped.split(/\n\s*\n/).filter(s => s.trim().length > 80);
  const description = firstParas.length > 0 
    ? firstParas[0].replace(/\s+/g, ' ').trim().substring(0, 200)
    : `Best ${article.category.toLowerCase()} products reviewed and tested for 2026.`;

  const newPost = {
    slug: article.slug,
    title: article.title,
    category: article.category,
    date: TODAY,
    tag: article.tag,
    description: description,
    content: content
  };

  posts.push(newPost);
  added++;
  console.log(`Added: ${article.category} - ${article.title.substring(0, 60)}... (${content.length} chars)`);
});

// Write back
const json = JSON.stringify(posts, null, 2);
fs.writeFileSync(POSTS_FILE, json, 'utf8');
console.log(`\nTotal posts now: ${posts.length} (added ${added})`);
console.log('BOM check: ' + (json.charCodeAt(0) === 0xFEFF ? 'FAIL' : 'OK'));
