const posts = require('./src/data/posts.json');

const targets = ['Large Breed Dog Beds', 'Aquarium Filters', 'Turtle Tanks'];

posts.forEach(p => {
  if (targets.some(t => p.title.includes(t))) {
    console.log('=== ' + p.title + ' ===');
    const m = p.content.match(/amazon\.com\/[^'"\s<>)]+/g);
    if (m) m.forEach(link => console.log(link));
    else console.log('NO LINKS');
    console.log('charCount:', p.charCount);
    console.log('content preview (first 200):', p.content.substring(0, 200));
    console.log('');
  }
});
