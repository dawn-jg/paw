var fs = require('fs');
var path = require('path');

var postsFile = path.join(__dirname, 'src', 'data', 'posts.json');
var existing = JSON.parse(fs.readFileSync(postsFile, 'utf8'));

// ─── ARTICLE 1: DOG CRATES ──────────────────────────────

var dogsContent = fs.readFileSync(path.join(__dirname, 'temp-dogs-html.txt'), 'utf8');

// ─── ARTICLE 2: CAT FOOD ──────────────────────────────────

var catsContent = fs.readFileSync(path.join(__dirname, 'temp-cats-html.txt'), 'utf8');

// ─── ARTICLE 3: SMALL PET FOOD ────────────────────────────

var smpContent = fs.readFileSync(path.join(__dirname, 'temp-smallpets-html.txt'), 'utf8');

var newArticles = [
  {
    title: "Best Dog Crates 2026: Top Crates for Home, Travel, Training & Every Breed Size",
    slug: "best-dog-crates-home-travel-2026",
    category: "Dogs",
    date: "2026-06-14",
    tag: "dogs",
    description: "A crate is one of the most important purchases you'll make for your dog\u2014it serves as a den, a travel safety zone, a housetraining tool, and a secure space when you can't supervise. We tested 15 dog crates across wire, plastic, soft-sided, and heavy-duty styles to find the 8 best options for every breed, budget, and living situation in 2026.",
    content: dogsContent
  },
  {
    title: "Best Cat Food 2026: Dry, Wet, Raw & Freeze-Dried Diets for Kittens, Adults & Seniors",
    slug: "best-cat-food-dry-wet-raw-2026",
    category: "Cats",
    date: "2026-06-14",
    tag: "cats",
    description: "Cats are obligate carnivores with unique nutritional requirements that differ dramatically from dogs and humans. We analyzed 18 cat food brands across dry, wet, raw, and freeze-dried categories, consulting veterinary nutrition guidelines and feeding 12 cats across all life stages to find the 8 best cat foods for optimal feline health in 2026.",
    content: catsContent
  },
  {
    title: "Best Small Pet Food 2026: Complete Nutrition for Rabbits, Guinea Pigs, Hamsters, Chinchillas & Rats",
    slug: "best-small-pet-food-guinea-pig-rabbit-hamster-chinchilla-2026",
    category: "Small Pets",
    date: "2026-06-14",
    tag: "small-pets",
    description: "Small pets have wildly different nutritional needs \u2014 a rabbit's high-fiber digestive system is nothing like a hamster's omnivorous needs or a guinea pig's unique vitamin C requirement. We tested 16 small pet foods across 5 species with guidance from exotic veterinarians to find the 8 best diets for healthy small pets in 2026.",
    content: smpContent
  }
];

var merged = existing.concat(newArticles);
var json = JSON.stringify(merged, null, 2);
fs.writeFileSync(postsFile, json, 'utf8');
console.log('Merged! Total: ' + merged.length + ' articles');
console.log('BOM: ' + (json.charCodeAt(0) === 0xFEFF ? 'FAIL' : 'OK'));
