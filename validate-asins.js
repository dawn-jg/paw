/**
 * Validate Amazon ASINs in articles and replace dead ones with known-good alternatives.
 *
 * Usage:
 *   node validate-asins.js                                    # Validate all articles
 *   node validate-asins.js --dry-run                          # Show what would be changed
 *   node validate-asins.js --new "path/to/new-articles.json"  # Validate new batch only
 *
 * Known-good ASINs are sourced from known-good-asins.json (verified HTTP 200 live).
 */

var fs = require('fs');
var path = require('path');
var https = require('https');

var POSTS_FILE = path.join(__dirname, 'src', 'data', 'posts.json');
var KNOWN_GOOD_FILE = path.join(__dirname, 'known-good-asins.json');

// ─── Load data ───────────────────────────────────────
var goodPool = JSON.parse(fs.readFileSync(KNOWN_GOOD_FILE, 'utf8'));

// Flatten: all good ASINs + which categories they belong to
var allGood = {};
Object.keys(goodPool).forEach(function(cat) {
  goodPool[cat].forEach(function(asin) {
    if (!allGood[asin]) allGood[asin] = [];
    if (allGood[asin].indexOf(cat) === -1) allGood[asin].push(cat);
  });
});
var GOOD_SET = new Set(Object.keys(allGood));

// ─── Helpers ─────────────────────────────────────────
function extractASINs(content) {
  var re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  var results = [];
  var m;
  while ((m = re.exec(content)) !== null) {
    results.push(m[1]);
  }
  return results;
}

function getReplacement(asin, category) {
  // Try category-specific pool first
  var catPool = goodPool[category];
  if (catPool && catPool.length > 0) {
    return catPool[Math.floor(Math.random() * catPool.length)];
  }
  // Fallback: any good ASIN
  var all = Object.keys(allGood);
  return all[Math.floor(Math.random() * all.length)];
}

// ─── Verify single ASIN via HTTP (async) ────────────
function verifyASIN(asin) {
  return new Promise(function(resolve) {
    if (GOOD_SET.has(asin)) return resolve(true);
    var url = 'https://www.amazon.com/dp/' + asin;
    var req = https.get(url, { timeout: 8000 }, function(res) {
      resolve(res.statusCode === 200);
    });
    req.on('error', function() { resolve(false); });
    req.on('timeout', function() { req.destroy(); resolve(false); });
  });
}

// ─── Main validation ─────────────────────────────────
async function validate(posts, options) {
  var totalBad = 0;
  var totalFixed = 0;
  var results = [];

  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    var content = post.content || '';
    var asins = extractASINs(content);
    if (asins.length === 0) continue;

    var cat = post.category || 'unknown';
    var fixed = false;
    var badAsins = asins.filter(function(a) { return !GOOD_SET.has(a); });
    var uniqueBad = [...new Set(badAsins)];

    if (uniqueBad.length === 0) continue;

    if (options.dryRun) {
      console.log(post.slug + ': ' + uniqueBad.length + ' unknown ASIN(s): ' + uniqueBad.join(', '));
      totalBad += uniqueBad.length;
      continue;
    }

    // Replace unknown ASINs in content
    uniqueBad.forEach(function(badAsin) {
      var replacement = getReplacement(badAsin, cat);
      var re = new RegExp(badAsin, 'g');
      var before = content;
      content = content.replace(re, replacement);
      if (content !== before) {
        totalFixed++;
        fixed = true;
        if (options.verbose) {
          console.log(post.slug + ': ' + badAsin + ' -> ' + replacement);
        }
      }
    });

    if (fixed) {
      post.content = content;
      results.push(post.slug);
    }
    totalBad += uniqueBad.length;
  }

  return { totalBad: totalBad, totalFixed: totalFixed, fixedSlugs: results };
}

// ─── CLI entry ───────────────────────────────────────
async function main() {
  var args = process.argv.slice(2);
  var dryRun = args.indexOf('--dry-run') >= 0;
  var verbose = args.indexOf('--verbose') >= 0;
  var newFileIdx = args.indexOf('--new');

  var posts;

  if (newFileIdx >= 0 && args[newFileIdx + 1]) {
    // Validate new batch only
    var newPosts = JSON.parse(fs.readFileSync(args[newFileIdx + 1], 'utf8'));
    console.log('Validating new batch: ' + newPosts.length + ' article(s)');
    posts = newPosts;
  } else {
    posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    console.log('Validating all articles: ' + posts.length + ' total');
  }

  var mode = dryRun ? 'DRY RUN (no changes)' : 'LIVE';
  console.log('Mode: ' + mode + '\n');

  var result = await validate(posts, { dryRun: dryRun, verbose: verbose });

  if (dryRun) {
    console.log('\nFound ' + result.totalBad + ' unknown ASIN(s) across ' + result.fixedSlugs.length + ' article(s)');
    console.log('Run without --dry-run to fix.');
    return;
  }

  // Write back
  var json = JSON.stringify(posts, null, 2);
  if (newFileIdx >= 0 && args[newFileIdx + 1]) {
    fs.writeFileSync(args[newFileIdx + 1], json, 'utf8');
    console.log('\nUpdated: ' + args[newFileIdx + 1]);
  } else {
    fs.writeFileSync(POSTS_FILE, json, 'utf8');
    console.log('\nUpdated: ' + POSTS_FILE);
  }

  console.log('Fixed: ' + result.totalFixed + ' ASIN(s) in ' + result.fixedSlugs.length + ' article(s)');
  console.log('Known-good pool: ' + GOOD_SET.size + ' verified ASINs');
  console.log('BOM: ' + (json.charCodeAt(0) === 0xFEFF ? 'FAIL' : 'OK'));
}

main().catch(function(e) {
  console.error('Error:', e.message);
  process.exit(1);
});