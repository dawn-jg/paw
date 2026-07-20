var fs = require('fs');
var path = require('path');

var base = 'D:/pawcritic-next';
var files = [
  path.join(base, 'temp-article-fish-2026-07-21.json'),
  path.join(base, 'temp-article-bird-2026-07-21.json'),
  path.join(base, 'temp-article-reptile-2026-07-21.json'),
  path.join(base, 'merge-articles.cjs'),
  path.join(base, 'generate-bird.cjs')
];

files.forEach(function(f) {
  try {
    fs.unlinkSync(f);
    console.log('Deleted: ' + path.basename(f));
  } catch(e) {
    console.log('Error deleting ' + path.basename(f) + ': ' + e.message);
  }
});
