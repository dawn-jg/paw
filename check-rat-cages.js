var fs = require('fs');
var posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));

// Find the rat cage article
var post = posts.find(function(x) { return x.slug === 'best-rat-cages-2026-social-spaces-for-your-pet-rats'; });
if (!post) post = posts.find(function(x) { return x.slug === 'best-rat-cages-2026-social-spaces-for-your-pet-rats-2'; });

console.log('Article found: ' + (post ? 'YES' : 'NO'));
if (post) {
  console.log('Slug: ' + post.slug);
  console.log('Title: ' + post.title);
  console.log('Chars: ' + post.content.length);
  
  // Extract all Amazon links
  var re = /href="https?:\/\/www\.amazon\.com\/dp\/([A-Z0-9]+)\?tag=paw070-20/g;
  var links = [];
  var m;
  while ((m = re.exec(post.content)) !== null) {
    links.push('amazon.com/dp/' + m[1] + '?tag=paw070-20');
  }
  
  console.log('Amazon links found: ' + links.length);
  links.forEach(function(link) {
    console.log('  ' + link);
  });

  // Test each link
  var http = require('http');
  var https = require('https');
  var tested = 0;
  links.forEach(function(link) {
    var asin = link.match(/dp\/([A-Z0-9]+)/)[1];
    var url = 'https://www.amazon.com/dp/' + asin;
    https.get(url, {timeout: 5000}, function(res) {
      var code = res.statusCode;
      var redirect = res.headers.location || '';
      console.log('  ' + asin + ' -> HTTP ' + code + (redirect ? ' -> ' + redirect.substring(0,80) : ''));
      tested++;
      if (tested === links.length) {
        console.log('\nDone testing ' + tested + ' links.');
      }
    }).on('error', function(e) {
      console.log('  ' + asin + ' -> ERROR: ' + e.message);
      tested++;
    });
  });
}

// Count all ASINs with problems (non-uppercase patterns)
var allLinks = [];
posts.forEach(function(p) {
  var c = p.content || '';
  var re2 = /amazon\.com\/dp\/([A-Z0-9]+)/g;
  var m2;
  while ((m2 = re2.exec(c)) !== null) {
    allLinks.push(m2[1]);
  }
});

var asinCounts = {};
allLinks.forEach(function(a) { asinCounts[a] = (asinCounts[a] || 0) + 1; });
var sorted = Object.entries(asinCounts).sort(function(a, b) { return b[1] - a[1]; });
console.log('\nTop 10 ASINs by usage:');
sorted.slice(0, 10).forEach(function(e) { console.log('  ' + e[0] + ': ' + e[1] + ' uses'); });
console.log('Total unique ASINs: ' + sorted.length);