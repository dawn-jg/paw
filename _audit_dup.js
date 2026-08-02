var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));

var dupTitles={
  'Best Aquarium Canister Filters 2026':['best-aquarium-canister-filters-2026','best-aquarium-canister-filters-2026-powerful-filtration-crystal-clear-water'],
  'Best Dog Beds 2026':['best-dog-beds-orthopedic-elevated-canine-2026','best-dog-beds-2026-orthopedic-heated-luxury-beds-every-breed','best-dog-beds-2026-cozy-resting-spots-for-large-and-small-dogs'],
  'Best Small Pet Cages & Habitats 2026':['best-small-pet-cages-habitats-guinea-pigs-hamsters-rabbits-2026','best-small-pet-cages-habitats-2026-rabbit-hutches-guinea-pig-cages-hamster-homes'],
  'Best Reptile Hides & Caves 2026':['best-reptile-hides-caves-safe-comfortable-2026','best-reptile-hides-caves-2026'],
  'Best Cat Water Fountains 2026':['best-cat-water-fountains-2026','best-cat-water-fountains-2026-hydration-for-healthier-cats'],
  'Best Dog Crates 2026':['best-dog-crates-home-travel-2026','best-dog-crates-2026-comfortable-spaces-for-your-canine-companion-2'],
  'Best Cat Grooming Tools 2026':['best-cat-grooming-tools-brushes-2026-deshedding-nail-trimmers-shampoo','best-cat-grooming-tools-2026-brushes-clippers-nail-trimmers']
};

Object.keys(dupTitles).forEach(function(title){
  var slugs=dupTitles[title];
  console.log('TITLE: '+title);
  slugs.forEach(function(s){
    var a=p.find(function(x){return x.slug===s});
    if(a) console.log('  SLUG: '+s+' | DATE: '+a.date+' | CHARS: '+a.content.length+' | CAT: '+a.category);
    else console.log('  SLUG: '+s+' [NOT FOUND]');
  });
  console.log('');
});
