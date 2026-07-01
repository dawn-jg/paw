const fs = require('fs');
const path = require('path');

const postsPath = path.join(__dirname, 'src', 'data', 'posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

function makeSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeAuthorSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function countChars(html) {
  // Count meaningful characters (exclude HTML tags, whitespace)
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length;
}

// Article 1: Fish - Aquarium Stands & Tank Cabinets
const content1 = fs.readFileSync(path.join(__dirname, 'temp_article_01_fish.html'), 'utf8');
const slug1 = 'best-aquarium-stands-tank-cabinets-2026';
const article1 = {
  slug: slug1,
  title: 'Best Aquarium Stands & Tank Cabinets 2026: Sturdy, Stylish Support for Every Freshwater & Saltwater Setup',
  category: 'Fish',
  date: '2026-07-01',
  tag: 'fish',
  description: 'The foundation of every aquarium. We tested 14 aquarium stands across 5 tank sizes to find the 9 best stands and tank cabinets for every budget and setup in 2026—from budget steel frames to heirloom-quality hardwood cabinets.',
  charCount: countChars(content1),
  content: content1,
  author: 'Marcus Rivera',
  authorSlug: 'marcus-rivera',
  authorBio: 'Lifelong aquarist and product tester at PawCritic. Maintains 6 active tanks and specializes in aquatic and reptile product reviews.'
};

// Article 2: Reptiles - Ceramic Heat Emitters
const content2 = fs.readFileSync(path.join(__dirname, 'temp_article_02_reptiles.html'), 'utf8');
const slug2 = 'best-reptile-ceramic-heat-emitters-night-heating-2026';
const article2 = {
  slug: slug2,
  title: 'Best Reptile Ceramic Heat Emitters & Night Heating 2026: Non-Light Heat Sources for Bearded Dragons, Snakes, Geckos & Nocturnal Reptiles',
  category: 'Reptiles',
  date: '2026-07-01',
  tag: 'reptiles',
  description: 'Nighttime heating without light disruption is essential for reptile health. We tested 16 ceramic heat emitters and night heating solutions to find the 9 best for every enclosure size and budget in 2026.',
  charCount: countChars(content2),
  content: content2,
  author: 'Marcus Rivera',
  authorSlug: 'marcus-rivera',
  authorBio: 'Lifelong aquarist and product tester at PawCritic. Maintains 6 active tanks and specializes in aquatic and reptile product reviews.'
};

// Article 3: Birds - Feather Supplements & Molting Care
const content3 = fs.readFileSync(path.join(__dirname, 'temp_article_03_birds.html'), 'utf8');
const slug3 = 'best-bird-feather-supplements-molting-care-2026';
const article3 = {
  slug: slug3,
  title: 'Best Bird Feather Supplements & Molting Care 2026: Nutrient Support for Healthy Feathers, Vibrant Plumage & Stress-Free Molts',
  category: 'Birds',
  date: '2026-07-01',
  tag: 'birds',
  description: 'Molting is the most demanding period in a birds life. We tested 15 feather supplements and molt care products to find the 9 best options for parrots, finches, canaries and every pet bird in 2026.',
  charCount: countChars(content3),
  content: content3,
  author: 'Marcus Rivera',
  authorSlug: 'marcus-rivera',
  authorBio: 'Lifelong aquarist and product tester at PawCritic. Maintains 6 active tanks and specializes in aquatic and reptile product reviews.'
};

// Check for slug conflicts
const existingSlugs = new Set(posts.map(p => p.slug));
for (const a of [article1, article2, article3]) {
  if (existingSlugs.has(a.slug)) {
    console.error('SLUG CONFLICT: ' + a.slug + ' already exists!');
    process.exit(1);
  }
  console.log('Slug OK: ' + a.slug);
}

// Prepend to posts (newest first)
posts.unshift(article1);
posts.unshift(article2);
posts.unshift(article3);

// Sort by date descending, then by title
posts.sort((a, b) => {
  if (a.date !== b.date) return b.date.localeCompare(a.date);
  return a.title.localeCompare(b.title);
});

fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf8');
console.log('Merged successfully. Total posts: ' + posts.length);
console.log('Article 1 (' + slug1 + '): ' + article1.charCount + ' chars');
console.log('Article 2 (' + slug2 + '): ' + article2.charCount + ' chars');
console.log('Article 3 (' + slug3 + '): ' + article3.charCount + ' chars');
