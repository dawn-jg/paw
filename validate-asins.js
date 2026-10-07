/**
 * Validate Amazon ASINs in articles.
 *
 * Usage:
 *   node validate-asins.js                                    # Validate all articles
 *   node validate-asins.js --dry-run                          # Show what would be changed
 *   node validate-asins.js --new "path/to/new-articles.json"  # Validate new batch only
 *
 * ── 2026-10-07 重要变更 ──────────────────────────────────────────
 * 旧版行为：只要 ASIN 不在池里，就**随机**换一个池内 ASIN。
 * 这会直接把正文里描述的商品换成完全不相干的东西（例如"猫窝"→ Echo Dot），
 * 是站内"正文与商品不符"的主要成因之一。**该行为已彻底移除。**
 *
 * 新版行为：
 *   - ASIN 在目录内            → 通过。
 *   - ASIN 不在目录但 HTTP 200 → 保留，只报告（说明它是个真实存在的商品）。
 *   - ASIN 死链(非 200)        → 用"同目录 + 商品名与上下文关键词最匹配"的条目替换；
 *                                若没有任何匹配项，**保持原样不动**，只报告，交人工处理。
 *                                宁可不改，也绝不随机替换。
 */
var fs = require('fs');
var path = require('path');
var https = require('https');

var POSTS_FILE = path.join(__dirname, 'src', 'data', 'posts.json');
var KNOWN_GOOD_FILE = path.join(__dirname, 'known-good-asins.json');
var NAMES_FILE = path.join(__dirname, 'asin-names.json');

// ─── Load data ───────────────────────────────────────
var goodPool = JSON.parse(fs.readFileSync(KNOWN_GOOD_FILE, 'utf8'));
var ASIN_NAMES = {};
try { ASIN_NAMES = JSON.parse(fs.readFileSync(NAMES_FILE, 'utf8')); }
catch (e) { console.warn('WARN: asin-names.json 不可读，商品名匹配将退化为仅按类目:', e.message); }

var asinCats = {};
Object.keys(goodPool).forEach(function (cat) {
  (goodPool[cat] || []).forEach(function (a) {
    if (!asinCats[a]) asinCats[a] = [];
    if (asinCats[a].indexOf(cat) === -1) asinCats[a].push(cat);
  });
});
var GOOD_SET = new Set(Object.keys(asinCats));

// ─── Keyword scoring ─────────────────────────────────
var STOP = new Set(('the a an and or of for with to in on your you it its this that is are be as by from at ' +
  'not no do does best top guide how what when why which pet pets product products ' +
  'amazon com www https http also very more most can will just like one two').split(/\s+/));

function tokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(function (w) { return w.length > 2 && !STOP.has(w); });
}

function matchScore(context, name) {
  var t = new Set(tokens(context));
  var hits = 0;
  tokens(name).forEach(function (w) { if (t.has(w)) hits++; });
  return hits;
}

function bestReplacement(asin, category, context) {
  var pool = (goodPool[category] || []).filter(function (a) { return a !== asin && ASIN_NAMES[a]; });
  if (!pool.length) {
    pool = Object.keys(asinCats).filter(function (a) { return a !== asin && ASIN_NAMES[a]; });
  }
  var best = null;
  pool.forEach(function (a) {
    var s = matchScore(context, ASIN_NAMES[a]);
    if (s > 0 && (!best || s > best.score)) best = { asin: a, score: s };
  });
  // 至少要有 2 个实词吻合，否则视为"没有匹配项"
  return best && best.score >= 2 ? best : null;
}

// ─── Extract ─────────────────────────────────────────
function occurrences(content) {
  var out = [];
  var re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  var m;
  while ((m = re.exec(content)) !== null) {
    var start = Math.max(0, m.index - 300);
    var end = Math.min(content.length, m.index + 300);
    out.push({ asin: m[1], context: content.slice(start, end) });
  }
  return out;
}

function verifyASIN(asin) {
  return new Promise(function (resolve) {
    var req = https.get('https://www.amazon.com/dp/' + asin, { timeout: 8000 }, function (res) {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', function () { resolve(false); });
    req.on('timeout', function () { req.destroy(); resolve(false); });
  });
}

// ─── Main validation ─────────────────────────────────
async function validate(posts, options) {
  var stats = { checked: 0, okInCatalog: 0, outsideButAlive: [], dead: [], replaced: [], unfixable: [] };

  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    var content = post.content || '';
    var occ = occurrences(content);
    if (!occ.length) continue;
    var cat = post.category || 'unknown';

    var unique = [];
    occ.forEach(function (o) { if (unique.indexOf(o.asin) === -1) unique.push(o.asin); });

    for (var u = 0; u < unique.length; u++) {
      var asin = unique[u];
      stats.checked++;

      if (GOOD_SET.has(asin)) { stats.okInCatalog++; continue; }

      var alive = await verifyASIN(asin);
      if (alive) {
        stats.outsideButAlive.push({ slug: post.slug, asin: asin });
        continue;
      }

      stats.dead.push({ slug: post.slug, asin: asin });
      var ctx = occ.filter(function (o) { return o.asin === asin; }).map(function (o) { return o.context; }).join(' ');
      var repl = bestReplacement(asin, cat, ctx);

      if (repl) {
        stats.replaced.push({ slug: post.slug, from: asin, to: repl.asin, score: repl.score });
        if (!options.dryRun) {
          content = content.split(asin).join(repl.asin);
        }
      } else {
        stats.unfixable.push({ slug: post.slug, asin: asin });
      }
    }
    if (!options.dryRun) post.content = content;
  }

  return stats;
}

// ─── CLI entry ───────────────────────────────────────
async function main() {
  var args = process.argv.slice(2);
  var dryRun = args.indexOf('--dry-run') >= 0;
  var newFileIdx = args.indexOf('--new');

  var posts, targetFile = POSTS_FILE;
  if (newFileIdx >= 0 && args[newFileIdx + 1]) {
    targetFile = args[newFileIdx + 1];
    posts = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    console.log('Validating new batch: ' + posts.length + ' article(s)');
  } else {
    posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    console.log('Validating all articles: ' + posts.length + ' total');
  }

  console.log('Mode: ' + (dryRun ? 'DRY RUN (no changes)' : 'LIVE'));
  console.log('Catalog: ' + GOOD_SET.size + ' ASINs, ' + Object.keys(ASIN_NAMES).length + ' named\n');

  var s = await validate(posts, { dryRun: dryRun });

  console.log('ASIN 检查数: ' + s.checked);
  console.log('目录内(通过): ' + s.okInCatalog);
  console.log('目录外但可访问(保留/报告): ' + s.outsideButAlive.length);
  s.outsideButAlive.forEach(function (x) { console.log('   ? ' + x.slug + ' :: ' + x.asin + '  不在目录但 HTTP 200'); });

  console.log('死链: ' + s.dead.length);
  console.log('已替换(名称最匹配): ' + s.replaced.length);
  s.replaced.forEach(function (x) { console.log('   + ' + x.slug + ' :: ' + x.from + ' -> ' + x.to + ' (匹配分 ' + x.score + ')'); });

  console.log('无法自动修复(保持原样，需人工): ' + s.unfixable.length);
  s.unfixable.forEach(function (x) { console.log('   ! ' + x.slug + ' :: ' + x.asin); });

  if (dryRun) { console.log('\nDRY RUN — 未写入任何文件。'); return; }

  var json = JSON.stringify(posts, null, 2);
  fs.writeFileSync(targetFile, json, 'utf8');
  console.log('\nUpdated: ' + targetFile);
  console.log('BOM: ' + (json.charCodeAt(0) === 0xFEFF ? 'FAIL' : 'OK'));
}

main().catch(function (e) { console.error('Error:', e.message); process.exit(1); });
