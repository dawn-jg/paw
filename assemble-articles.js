var fs = require('fs');
var path = require('path');
var exec = require('child_process').execFileSync;

// Read HTML content files
var c1 = fs.readFileSync('D:\\pawcritic-next\\article1-content.html', 'utf8');
var c2 = fs.readFileSync('D:\\pawcritic-next\\article2-content.html', 'utf8');
var c3 = fs.readFileSync('D:\\pawcritic-next\\article3-content.html', 'utf8');

// Build article objects
function makeArticle(slug, title, category, tag, description, content) {
  return {
    slug: slug,
    title: title,
    category: category,
    date: '2026-06-26',
    tag: tag,
    description: description,
    content: content,
    charCount: content.length,
    author: 'Emily Zhao',
    authorSlug: 'emily-zhao',
    authorBio: 'Content director and small animal expert at PawCritic. Owner of 3 guinea pigs, 2 rabbits, and 1 very opinionated parrot.'
  };
}

var a1 = makeArticle(
  'best-aquarium-plant-fertilizers-2026',
  'Best Aquarium Plant Fertilizers 2026: Liquid Ferts, Root Tabs & Complete Nutrient Systems for Lush Planted Tanks',
  'Fish', 'fish',
  'A lush planted aquarium does not happen by accident. We tested 25 aquarium plant fertilizers including liquid fertilizers, root tabs, and all-in-one systems to find the 10 best nutrient solutions for thriving planted tanks in 2026.',
  c1
);

var a2 = makeArticle(
  'best-reptile-carriers-travel-cages-2026',
  'Best Reptile Carriers & Travel Cages 2026: Safe, Temperature-Controlled Transport for Bearded Dragons, Snakes, Geckos & Every Reptile',
  'Reptiles', 'reptiles',
  'Traveling with reptiles requires specialized gear. We tested 22 reptile carriers, travel cages, and transport containers to find the 10 safest options for every species and trip length.',
  c2
);

var a3 = makeArticle(
  'best-bird-heating-winter-thermal-2026',
  'Best Bird Heating & Winter Thermal Products 2026: Safe Cage Warmers, Heated Perches & Full-Spectrum Heat Lamps for Parrots, Budgies & All Pet Birds',
  'Birds', 'birds',
  'Birds are highly sensitive to cold drafts. We tested 20 bird heating products including cage-mounted heaters, heated perches, infrared lamps, and room heaters for the safest winter warming solutions.',
  c3
);

console.log('Articles built:');
console.log('  ' + a1.slug + ' (' + a1.charCount + ' chars, ' + a1.category + ')');
console.log('  ' + a2.slug + ' (' + a2.charCount + ' chars, ' + a2.category + ')');
console.log('  ' + a3.slug + ' (' + a3.charCount + ' chars, ' + a3.category + ')');

// Load posts.json
var postsPath = 'D:\\pawcritic-next\\src\\data\\posts.json';
var posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
console.log('\nExisting posts: ' + posts.length);

// Check slug conflicts
var slugMap = {};
for (var i = 0; i < posts.length; i++) { slugMap[posts[i].slug] = true; }
var newArticles = [a1, a2, a3];
for (var i = 0; i < newArticles.length; i++) {
  if (slugMap[newArticles[i].slug]) {
    console.log('CONFLICT: ' + newArticles[i].slug);
    process.exit(1);
  }
  console.log('OK: ' + newArticles[i].slug);
}

// Merge
for (var i = 0; i < newArticles.length; i++) { posts.push(newArticles[i]); }
fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf8');
console.log('\nMerged. Total posts: ' + posts.length);

// Validate ASINs
console.log('\n--- Validate ASINs ---');
var vRes = exec('node', ['D:\\pawcritic-next\\validate-asins.js'], { cwd: 'D:\\pawcritic-next', encoding: 'utf8' });
console.log(vRes);

// Rebuild data files
console.log('\n--- Rebuild data files ---');
var rRes = exec('node', ['D:\\pawcritic-next\\rebuild-data.js'], { cwd: 'D:\\pawcritic-next', encoding: 'utf8' });
console.log(rRes);

// Clean up temp files
console.log('\n--- Clean up temp files ---');
var tempFiles = [
  'D:\\pawcritic-next\\temp-article1.json',
  'D:\\pawcritic-next\\temp-article2.json',
  'D:\\pawcritic-next\\temp-article3.json',
  'D:\\pawcritic-next\\article1-content.html',
  'D:\\pawcritic-next\\article2-content.html',
  'D:\\pawcritic-next\\article3-content.html',
  'D:\\pawcritic-next\\node-article1-html.js',
  'D:\\pawcritic-next\\node-article2-html.js',
  'D:\\pawcritic-next\\node-article3-html.js',
  'D:\\pawcritic-next\\merge-articles.js',
  'D:\\pawcritic-next\\merge-step2.js',
  'D:\\pawcritic-next\\merge-final.js',
  'D:\\pawcritic-next\\make-articles.js',
  'D:\\pawcritic-next\\run-today.js',
  'D:\\pawcritic-next\\build-articles-simple.js',
  'D:\\pawcritic-next\\temp-a1.json',
  'D:\\pawcritic-next\\fix-lines.js'
];
for (var i = 0; i < tempFiles.length; i++) {
  try {
    fs.unlinkSync(tempFiles[i]);
    console.log('Deleted: ' + path.basename(tempFiles[i]));
  } catch(e) {
    // silent skip
  }
}

// Git commit and push
console.log('\n--- Git commit & push ---');
var gitDir = 'D:\\pawcritic-next';
var gitExe = 'C:\\Git\\bin\\git.exe';

exec(gitExe, ['add', '-A'], { cwd: gitDir, encoding: 'utf8' });
console.log('git add -A: OK');

var commitMsg = 'PawCritic: 3 new articles - Jun 26 (Fish-Plant Fertilizers, Reptile Carriers, Bird Heating)';
exec(gitExe, ['commit', '-m', commitMsg], { cwd: gitDir, encoding: 'utf8' });
console.log('git commit: OK');

exec(gitExe, ['push', 'origin', 'main'], { cwd: gitDir, encoding: 'utf8' });
console.log('git push: OK');

console.log('\n=== ALL DONE SUCCESSFULLY ===');
