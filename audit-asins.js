var https = require('https');
var fs = require('fs');
var posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));

// Collect all unique ASINs
var allAsins = {};
posts.forEach(function(post) {
  var c = post.content || '';
  var re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  var m;
  while ((m = re.exec(c)) !== null) {
    if (!allAsins[m[1]]) allAsins[m[1]] = { count: 0, cats: {} };
    allAsins[m[1]].count++;
    var cat = post.category || 'unknown';
    allAsins[m[1]].cats[cat] = (allAsins[m[1]].cats[cat] || 0) + 1;
  }
});

var asinList = Object.keys(allAsins);
console.log('Total unique ASINs: ' + asinList.length);

var results = [];
var completed = 0;

function testNext(idx) {
  if (idx >= asinList.length) {
    console.log('\n=== RESULTS ===');
    var good = results.filter(function(r) { return r.status === 200; });
    var bad = results.filter(function(r) { return r.status !== 200; });
    console.log('Good (200): ' + good.length);
    console.log('Bad: ' + bad.length);
    bad.forEach(function(r) { console.log('  ' + r.asin + ': HTTP ' + r.status + (r.name ? ' (' + r.name + ')' : '')); });
    
    // Generate summary
    var summary = { good: good.map(function(r) { return r.asin; }), bad: bad.map(function(r) { return r.asin; }) };
    fs.writeFileSync('asin-audit.json', JSON.stringify(summary, null, 2), 'utf8');
    console.log('\nSaved to asin-audit.json');
    process.exit(0);
  }

  var asin = asinList[idx];
  var url = 'https://www.amazon.com/dp/' + asin;
  
  var req = https.get(url, { timeout: 8000 }, function(res) {
    var status = res.statusCode;
    var location = res.headers.location || '';
    // Follow redirects
    if (status >= 300 && status < 400 && location) {
      results.push({ asin: asin, status: 302, redirect: location.substring(0, 80) });
    } else {
      results.push({ asin: asin, status: status });
    }
    process.stdout.write('\rTesting ' + (idx + 1) + '/' + asinList.length + ' (' + asin + ' -> ' + status + ')       ');
    // Small delay to avoid rate limiting
    setTimeout(function() { testNext(idx + 1); }, 200);
  });
  
  req.on('error', function(e) {
    results.push({ asin: asin, status: 'ERROR', error: e.message.substring(0, 30) });
    process.stdout.write('\rTesting ' + (idx + 1) + '/' + asinList.length + ' (' + asin + ' -> ERROR)       ');
    setTimeout(function() { testNext(idx + 1); }, 200);
  });
}

testNext(0);

// Timeout protection
setTimeout(function() {
  console.log('\nTimeout - reporting partial results');
  var done = results.length;
  var remaining = asinList.length - done;
  console.log('Tested: ' + done + ', Remaining: ' + remaining);
  var good = results.filter(function(r) { return r.status === 200; });
  var bad = results.filter(function(r) { return r.status !== 200; });
  console.log('Good: ' + good.length + ', Bad: ' + bad.length);
  fs.writeFileSync('asin-audit-partial.json', JSON.stringify({ good: good.map(function(r) { return r.asin; }), bad: bad.map(function(r) { return r.asin; }) }), 'utf8');
  process.exit(0);
}, 120000);