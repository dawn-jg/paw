const p = require("./src/data/posts.json");
const slugs = [
  "best-dog-beds-orthopedic-elevated-canine-2026",
  "best-cat-trees-condos-towers-scratching-indoor-2026",
  "best-small-pet-cages-habitats-guinea-pigs-hamsters-rabbits-2026"
];
slugs.forEach(slug => {
  const post = p.find(x => x.slug === slug);
  if (!post) return;
  const asins = [...post.content.matchAll(/amazon\.com\/dp\/([A-Z0-9]{10})/g)].map(m => m[1]);
  const unique = [...new Set(asins)];
  console.log(slug + ": top 3 ASINs " + unique.slice(0,3).join(", ") + " (" + unique.length + " unique, " + asins.length + " total)");
});
