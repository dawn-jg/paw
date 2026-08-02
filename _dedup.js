var fs=require('fs');
var path='D:/pawcritic-next/src/data/posts.json';
var posts=JSON.parse(fs.readFileSync(path,'utf8'));
console.log('Before: '+posts.length+' posts');

// 8 duplicate slugs to DELETE (keep the longest/most complete per title group)
var deleteSlugs=[
  'best-aquarium-canister-filters-2026',
  'best-dog-beds-orthopedic-elevated-canine-2026',
  'best-dog-beds-2026-cozy-resting-spots-for-large-and-small-dogs',
  'best-small-pet-cages-habitats-2026-rabbit-hutches-guinea-pig-cages-hamster-homes',
  'best-reptile-hides-caves-safe-comfortable-2026',
  'best-cat-water-fountains-2026',
  'best-dog-crates-2026-comfortable-spaces-for-your-canine-companion-2',
  'best-cat-grooming-tools-brushes-2026-deshedding-nail-trimmers-shampoo'
];

// Verify all delete slugs exist
var existing=posts.map(function(p){return p.slug});
var missing=deleteSlugs.filter(function(s){return existing.indexOf(s)===-1});
if(missing.length>0){
  console.log('ERROR: these delete slugs not found: '+missing.join(', '));
  process.exit(1);
}

// Remove duplicates
var removed=[];
posts=posts.filter(function(p){
  if(deleteSlugs.indexOf(p.slug)!==-1){
    removed.push(p.slug+' ('+p.title+')');
    return false;
  }
  return true;
});
console.log('Removed '+removed.length+' duplicates:');
removed.forEach(function(s){console.log('  - '+s);});

// Fill missing charCount
var fixedCount=0;
posts.forEach(function(p){
  if(p.charCount===undefined||p.charCount===null){
    p.charCount=p.content?p.content.length:0;
    fixedCount++;
  }
});
console.log('Filled charCount for '+fixedCount+' posts');

// Save (plain array, no BOM)
fs.writeFileSync(path, JSON.stringify(posts,null,2),'utf8');
console.log('After: '+posts.length+' posts');
console.log('DONE');
