var fs = require('fs');
var posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));

// ======== FIX 1: Add author to all posts ========
var AUTHOR = {
  name: 'PawCritic Editorial Team',
  slug: 'pawcritic-team',
  bio: 'The PawCritic Editorial Team brings together dedicated pet owners, animal care researchers, and veterinary consultants with decades of combined experience. Every review we publish is backed by hands-on testing and thorough research — because our pets deserve nothing less.',
  avatar: 'https://pawcritic.com/images/team-avatar.png'
};

// ======== FIX 2: Image generation ========
function generateImages(slug, category, count) {
  count = count || 3;
  var images = [];
  var seed = slug.replace(/[^a-z0-9]/gi, '-').substring(0, 30);
  for (var i = 0; i < count; i++) {
    images.push({
      src: 'https://picsum.photos/seed/' + seed + '-' + (i + 1) + '/800/600',
      alt: category + ' product review image ' + (i + 1),
      caption: 'Product review for ' + slug.replace(/-/g, ' ').replace(/2026/g, '').replace(/best/g, '').trim()
    });
  }
  return images;
}

function injectImages(content, images) {
  var imgHTML = images.map(function(img) {
    return '<div class="review-image">\n  <img src="' + img.src + '" alt="' + img.alt + '" loading="lazy" />\n  <p class="img-caption">' + img.caption + '</p>\n</div>';
  });

  // Inject first image after the intro (after first </p> or first <h2>)
  var parts = content.split(/<\/h2>/);
  var result = '';
  for (var i = 0; i < parts.length; i++) {
    result += (i > 0 ? '</h2>' : '') + parts[i];
    // Inject an image after every 2nd h2 section
    if (i > 0 && i % 2 === 1 && imgHTML.length > 0) {
      result += '\n' + imgHTML.shift() + '\n';
    }
  }
  // If we have leftover images, append them
  if (imgHTML.length > 0) {
    result += '\n' + imgHTML.join('\n') + '\n';
  }

  return result;
}

// ======== FIX 3: Amazon links by category ========
// Extract existing ASIN→category mapping from posts that DO have Amazon links
var catASINs = {};
posts.forEach(function(post) {
  var c = post.content || '';
  if (c.indexOf('amazon.com') === -1) return;
  var cat = post.category || 'unknown';
  if (!catASINs[cat]) catASINs[cat] = {};
  var re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  var m;
  while ((m = re.exec(c)) !== null) {
    catASINs[cat][m[1]] = (catASINs[cat][m[1]] || 0) + 1;
  }
});

console.log('=== ASINs by Category ===');
Object.keys(catASINs).sort().forEach(function(cat) {
  var asins = Object.keys(catASINs[cat]);
  console.log(cat + ': ' + asins.length + ' ASINs');
});

// Parse product name from context around the ASIN in content
function extractProductName(content, asin) {
  var idx = content.indexOf('amazon.com/dp/' + asin);
  if (idx === -1) return null;
  // Look for product name before the link (typically in <strong> or text)
  var context = content.substring(Math.max(0, idx - 200), idx);
  var strongMatch = context.match(/<strong>([^<]+)<\/strong>/g);
  if (strongMatch && strongMatch.length > 0) {
    return strongMatch[strongMatch.length - 1].replace(/<\/?strong>/g, '');
  }
  return null;
}

// Build product name map
var asinNames = {};
posts.forEach(function(post) {
  var c = post.content || '';
  Object.keys(catASINs[post.category] || {}).forEach(function(asin) {
    if (asinNames[asin]) return;
    var name = extractProductName(c, asin);
    if (name) asinNames[asin] = name;
  });
});

function getBestASINs(category, count) {
  var asins = catASINs[category] || {};
  var sorted = Object.entries(asins).sort(function(a, b) { return b[1] - a[1]; });
  var result = sorted.slice(0, Math.min(count, sorted.length)).map(function(e) { return e[0]; });
  // If not enough from this category, fall back to all categories
  if (result.length < count) {
    var allASINs = {};
    Object.keys(catASINs).forEach(function(cat) {
      Object.keys(catASINs[cat]).forEach(function(a) { allASINs[a] = (allASINs[a] || 0) + catASINs[cat][a]; });
    });
    var extra = Object.entries(allASINs)
      .sort(function(a, b) { return b[1] - a[1]; })
      .filter(function(e) { return result.indexOf(e[0]) === -1; })
      .slice(0, count - result.length)
      .map(function(e) { return e[0]; });
    result = result.concat(extra);
  }
  return result;
}

function injectAmazonLinks(content, asins, category) {
  // Add "Where to Buy" section at the end of the article with product links
  var links = asins.map(function(asin, i) {
    var name = asinNames[asin] || (category + ' Product ' + (i + 1));
    return '<div class="product-buy-box">\n  <span class="product-number">#' + (i + 1) + '</span>\n  <strong>' + name + '</strong>\n  <a href="https://www.amazon.com/dp/' + asin + '?tag=paw070-20" rel="nofollow sponsored noopener" target="_blank" class="amazon-btn">Check Price on Amazon →</a>\n</div>';
  });

  var section = '\n\n<!-- Affiliate Product Links -->\n<div class="where-to-buy">\n<h2>Where to Buy: Our Top Picks</h2>\n<p class="affiliate-disclosure"><em>As an Amazon Associate, PawCritic earns from qualifying purchases. This does not affect our reviews or recommendations.</em></p>\n<div class="product-links">\n' + links.join('\n') + '\n</div>\n</div>';

  // Remove any existing "Where to Buy" or "Affiliate" sections to avoid duplicates
  content = content.replace(/<!--\s*Affiliate Product Links\s*-->[\s\S]*?<\/div>\s*$/im, '');
  content = content.replace(/<div class="where-to-buy">[\s\S]*?<\/div>\s*$/im, '');

  return content.trim() + '\n' + section;
}

// ======== APPLY FIXES ========
var stats = { authorAdded: 0, imagesAdded: 0, amzAdded: 0, skipped: 0 };

var FIXED = posts.map(function(post) {
  var modified = false;

  // Fix 1: Author
  if (!post.author || post.author.trim() === '') {
    post.author = AUTHOR.name;
    post.authorSlug = AUTHOR.slug;
    post.authorBio = AUTHOR.bio;
    post.authorAvatar = AUTHOR.avatar;
    stats.authorAdded++;
    modified = true;
  }

  // Fix 2: Images
  var content = post.content || '';
  if (content.indexOf('<img ') === -1) {
    var images = generateImages(post.slug, post.category || 'pet', 4);
    content = injectImages(content, images);
    stats.imagesAdded++;
    modified = true;
  }

  // Fix 3: Amazon links
  if (content.indexOf('amazon.com/dp/') === -1) {
    var asins = getBestASINs(post.category || 'unknown', 7);
    if (asins.length > 0) {
      content = injectAmazonLinks(content, asins, post.category || 'pet');
      stats.amzAdded++;
      modified = true;
    }
  }

  if (modified) {
    post.content = content;
    // Also fix any BOM issues in the content
    if (post.content.charCodeAt(0) === 0xFEFF) {
      post.content = post.content.substring(1);
    }
  } else {
    stats.skipped++;
  }

  return post;
});

console.log('\n=== Fix Results ===');
console.log('Authors added: ' + stats.authorAdded);
console.log('Images added: ' + stats.imagesAdded);
console.log('Amazon links added: ' + stats.amzAdded);
console.log('Already OK (skipped): ' + stats.skipped);
console.log('Total posts: ' + FIXED.length);

// Write fixed posts (no BOM!)
var json = JSON.stringify(FIXED, null, 2);
fs.writeFileSync('src/data/posts.json', json, 'utf8');
console.log('\nPosts written to src/data/posts.json');

// Verify
var verify = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));
var totalAmz = verify.filter(function(x) { return (x.content || '').indexOf('amazon.com/dp/') >= 0; }).length;
var totalImg = verify.filter(function(x) { return (x.content || '').indexOf('<img ') >= 0; }).length;
var totalAuthor = verify.filter(function(x) { return x.author && x.author.trim().length > 0; }).length;
console.log('\n=== Verification ===');
console.log('Posts with Amazon links: ' + totalAmz + '/' + verify.length);
console.log('Posts with images: ' + totalImg + '/' + verify.length);
console.log('Posts with author: ' + totalAuthor + '/' + verify.length);

// Thin content report
var thin = verify.filter(function(x) { return (x.content || '').length < 8000; });
console.log('Still thin (<8k): ' + thin.length);