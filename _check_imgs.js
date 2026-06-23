const p = require("./src/data/posts.json");
const slugs = [
  "best-dog-beds-orthopedic-elevated-canine-2026",
  "best-cat-trees-condos-towers-scratching-indoor-2026",
  "best-small-pet-cages-habitats-guinea-pigs-hamsters-rabbits-2026"
];
slugs.forEach(slug => {
  const post = p.find(x => x.slug === slug);
  if (!post) { console.log("NOT FOUND:", slug); return; }
  const imgs = [...post.content.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)];
  console.log("\n--- " + slug + " ---");
  imgs.forEach((m, i) => {
    const src = m[1];
    const amz = src.includes("images/products/") ? "AMAZON" : src.includes("loremflickr") ? "LOREMFLICKR" : "OTHER";
    console.log((i+1) + ": " + src.substring(0, 80) + "  [" + amz + "]");
  });
});
