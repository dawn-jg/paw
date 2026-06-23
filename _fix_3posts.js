const posts = require("./src/data/posts.json");
const hasImage = {};
require("fs").readdirSync("public/images/products").forEach(f => { hasImage[f.replace(".jpg","")] = true });
console.log("Available images:", Object.keys(hasImage).length);

const slugs = ["best-dog-beds-orthopedic-elevated-canine-2026","best-cat-trees-condos-towers-scratching-indoor-2026","best-small-pet-cages-habitats-guinea-pigs-hamsters-rabbits-2026"];

slugs.forEach(slug => {
  const post = posts.find(p => p.slug === slug);
  if (!post) return;
  const asinMatches = [...post.content.matchAll(/amazon\.com\/dp\/([A-Z0-9]{10})/g)];
  const uniqueAsins = [...new Set(asinMatches.map(m => m[1]))];
  const available = uniqueAsins.filter(a => hasImage[a]).slice(0,2);
  console.log(slug + ": ASINs with images: " + (available.length ? available.join(", ") : "NONE"));
  
  // Replace first 2 loremflickr images with product images
  let imgCount = 0;
  post.content = post.content.replace(/<img[^>]*src="https:\/\/loremflickr\.com\/[^"]*"[^>]*>/g, (match) => {
    imgCount++;
    if (imgCount <= available.length) {
      return match.replace(/src="[^"]*"/, `src="/images/products/${available[imgCount-1]}.jpg"`);
    }
    return match;
  });
  console.log("  Replaced " + Math.min(2, available.length) + " images");
});

require("fs").writeFileSync("src/data/posts.json", JSON.stringify(posts, null, 2));
console.log("\nSaved.");
