const fs = require('fs');
const path = require('path');

// Read existing posts
const postsPath = path.join(__dirname, 'src', 'data', 'posts.json');
const currentPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

// Read new articles
const fishPosts = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp-article-fish.json'), 'utf8'));
const reptilePosts = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp-article-reptiles.json'), 'utf8'));
const birdPosts = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp-article-birds.json'), 'utf8'));

// Calculate charCount for each new article
function calcCharCount(post) {
  let total = post.title.length + post.description.length + post.content.length;
  // Remove HTML tags for rough text count
  const textOnly = post.content.replace(/<[^>]+>/g, '');
  return textOnly.length + post.title.length + post.description.length;
}

fishPosts[0].charCount = calcCharCount(fishPosts[0]);
reptilePosts[0].charCount = calcCharCount(reptilePosts[0]);
birdPosts[0].charCount = calcCharCount(birdPosts[0]);

console.log('Fish article charCount:', fishPosts[0].charCount);
console.log('Reptile article charCount:', reptilePosts[0].charCount);
console.log('Bird article charCount:', birdPosts[0].charCount);

// Prepend new articles (newest first)
const allPosts = [...fishPosts, ...reptilePosts, ...birdPosts, ...currentPosts];

// Write posts.json WITHOUT BOM
const json = JSON.stringify(allPosts, null, 2);
fs.writeFileSync(postsPath, json, 'utf8');
console.log('Written posts.json with', allPosts.length, 'articles total');
console.log('BOM check:', json.charCodeAt(0) === 0xFEFF ? 'FAIL (has BOM)' : 'OK (no BOM)');

// Update categories.json
const categoriesPath = path.join(__dirname, 'src', 'data', 'categories.json');
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

// Add Fish entry
categories.Fish.posts.unshift({
  title: fishPosts[0].title,
  slug: fishPosts[0].slug,
  date: fishPosts[0].date,
  description: fishPosts[0].description.substring(0, 100)
});
categories.Fish.count = categories.Fish.posts.length;

// Add Reptiles entry
categories.Reptiles.posts.unshift({
  title: reptilePosts[0].title,
  slug: reptilePosts[0].slug,
  date: reptilePosts[0].date,
  description: reptilePosts[0].description.substring(0, 100)
});
categories.Reptiles.count = categories.Reptiles.posts.length;

// Add Birds entry
categories.Birds.posts.unshift({
  title: birdPosts[0].title,
  slug: birdPosts[0].slug,
  date: birdPosts[0].date,
  description: birdPosts[0].description.substring(0, 100)
});
categories.Birds.count = categories.Birds.posts.length;

const catJson = JSON.stringify(categories, null, 2);
fs.writeFileSync(categoriesPath, catJson, 'utf8');
console.log('Updated categories.json');
console.log('BOM check (categories):', catJson.charCodeAt(0) === 0xFEFF ? 'FAIL' : 'OK');

// Clean up temp files
fs.unlinkSync(path.join(__dirname, 'temp-article-fish.json'));
fs.unlinkSync(path.join(__dirname, 'temp-article-reptiles.json'));
fs.unlinkSync(path.join(__dirname, 'temp-article-birds.json'));
console.log('Temp files cleaned up');

console.log('\n✓ Merge complete!');
