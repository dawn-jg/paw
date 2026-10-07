/**
 * 审计站内每一条亚马逊链接：正文描述的商品 vs 链接实际商品，是否一致。
 *
 * 用法：node audit-link-relevance.js [--md]
 *   输出控制台摘要，并写入 link-relevance-report.md
 *
 * 依赖：asin-names.json（ASIN -> 真实商品名）
 */
const fs = require('fs');
const path = require('path');

const POSTS_FILE = path.join(__dirname, 'src', 'data', 'posts.json');
const NAMES_FILE = path.join(__dirname, 'asin-names.json');

const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
const ASIN_NAMES = JSON.parse(fs.readFileSync(NAMES_FILE, 'utf8'));

const STOP = new Set(('the a an and or of for with to in on your you it its this that is are be as by from at ' +
  'not no do does best top guide how what when why which pet pets product products ' +
  'amazon com www https http also very more most can will just like one two ' +
  'href rel nofollow sponsored noopener blank target').split(/\s+/));

function tokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(w => w.length > 2 && !STOP.has(w));
}

// 取链接所在句子 + 前一句
function claimAround(content, idx) {
  const before = content.slice(Math.max(0, idx - 700), idx);
  const after = content.slice(idx, Math.min(content.length, idx + 320));
  const stripped = (before + after).replace(/<[^>]*>/g, ' ');
  const parts = stripped.split(/(?<=[.!?])\s+/);
  let k = parts.findIndex(s => /amazon\.com\/dp/i.test(s));
  if (k < 0) k = Math.max(0, parts.length - 1);
  return parts.slice(Math.max(0, k - 1), k + 1).join(' ');
}

// 商品类名词：出现这些词说明正文在指代某个具体商品
const NOUNS = new Set(('filter kit tank cage litter clipper scissors spray thermometer hygrometer light lamp pump heater bed toy food supplement ' +
  'lock latch dock platform bowl conditioner salt test meter controller hide substrate brush shampoo harness leash carrier crate perch ' +
  'playpen wheel bottle dispenser wipe pad mat stand fountain feeder treat chew brush comb nail cage terrarium enclosure tank ' +
  'bacteria starter cleanup saltwater freshwater aquarium fish dog cat bird hamster rabbit').split(/\s+/));

function score(claim, name) {
  const nameT = new Set(tokens(name));
  const claimT = tokens(claim);
  const claimNouns = claimT.filter(w => NOUNS.has(w));
  const nameNouns = [...nameT].filter(w => NOUNS.has(w));
  const overlap = claimNouns.filter(w => nameT.has(w));
  return { claimNouns, nameNouns, overlap };
}

const rows = [];
posts.forEach(p => {
  const c = p.content || '';
  const re = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  let m;
  while ((m = re.exec(c)) !== null) {
    const asin = m[1];
    const name = ASIN_NAMES[asin];
    if (!name) { rows.push({ slug: p.slug, cat: p.category, asin, name: '(未知)', verdict: 'UNKNOWN' }); continue; }
    const claim = claimAround(c, m.index);
    const s = score(claim, name);
    let verdict;
    if (!s.claimNouns.length) verdict = 'WEAK';                 // 正文没提具体商品，无从判断
    else if (s.overlap.length) verdict = 'OK';                  // 提了，且与所链商品对得上
    else verdict = 'MISMATCH';                                  // 提了，但和所链商品是两类东西
    rows.push({ slug: p.slug, cat: p.category, asin, name, verdict, claim: claim.trim().slice(0, 170), claimNouns: s.claimNouns.join(' ') });
  }
});

const byVerdict = { OK: 0, WEAK: 0, MISMATCH: 0, UNKNOWN: 0 };
rows.forEach(r => byVerdict[r.verdict]++);
console.log('链接总数: ' + rows.length);
Object.entries(byVerdict).forEach(([k, v]) => console.log('  ' + k + ': ' + v));

const bad = rows.filter(r => r.verdict === 'MISMATCH' || r.verdict === 'UNKNOWN');
const bySlug = {};
bad.forEach(r => { (bySlug[r.slug] = bySlug[r.slug] || []).push(r); });

let md = '# PawCritic 链接一致性审计报告\n\n';
md += '生成时间：' + new Date().toISOString().replace('T', ' ').slice(0, 19) + ' (UTC)\n\n';
md += '## 总体\n\n| 判定 | 数量 |\n|---|---|\n';
md += `| ✅ 一致 (OK) | ${byVerdict.OK} |\n| ⚠️ 弱匹配 (WEAK) | ${byVerdict.WEAK} |\n| ❌ 不符 (MISMATCH) | ${byVerdict.MISMATCH} |\n| ❓ 无商品名 (UNKNOWN) | ${byVerdict.UNKNOWN} |\n| **合计** | **${rows.length}** |\n\n`;
md += '## 不符 / 未知明细（按文章）\n\n';
Object.keys(bySlug).sort().forEach(slug => {
  md += `### ${slug}  (${bySlug[slug][0].cat})\n\n`;
  md += '| ASIN | 实际商品 | 正文却描述成 |\n|---|---|---|\n';
  bySlug[slug].forEach(r => {
    md += `| \`${r.asin}\` | ${r.name} | ${(r.claim || '').replace(/\|/g, '/')} |\n`;
  });
  md += '\n';
});

fs.writeFileSync('link-relevance-report.md', md, 'utf8');
console.log('\n受影响文章数: ' + Object.keys(bySlug).length);
console.log('已写入 link-relevance-report.md');
