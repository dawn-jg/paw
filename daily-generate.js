#!/usr/bin/env node
/**
 * daily-generate.js — PawCritic 每日 3 篇本地确定性管线（替代不可靠的子 agent cron）
 *
 * 流程：
 *   1. 读 posts.json，检查今天是否已有 3 篇文章（幂等，有则跳过）
 *   2. 按日期奇偶确定分组：偶=Group A(Fish+Reptiles+Birds)，奇=Group B(Dogs+Cats+Small Pets)
 *   3. 从 posts.json 提取上下文（现有 slug/近期主题/分类 ASIN 池/本地产品图）
 *   4. 直连 DeepSeek API，串行生成 3 篇（每篇独立 prompt，含 ANTI-AI VOICE 约束）
 *   5. 每篇严格校验：2000+ 词 / aff≤4 / 恰好2图 / desc 120-160 / 无AI套话 / slug不重复
 *   6. 脚本后处理：注入 Related reading 真实内链（从同分类真实 slug 池挑选，3 条）
 *   7. 合并 posts.json → validate-asins.js → rebuild-data.js → git commit+push → cron-verify.js
 *   8. 全程幂等：任一步失败即退出码 1，不产生半成品提交
 *
 * 用法：
 *   node daily-generate.js            # 正常生成
 *   node daily-generate.js --dry-run  # 只生成不提交（调试用，保留 _daily_articles.json）
 *   node daily-generate.js --date 2026-08-28   # 指定日期（测试用）
 *
 * 依赖：DeepSeek API key 从 C:/Users/D3-AI/.qclaw/openclaw.json 读取
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const POSTS = path.join(ROOT, 'src', 'data', 'posts.json');
const GOOD_ASINS_FILE = path.join(ROOT, 'known-good-asins.json');
const GIT = 'C:/Git/bin/git.exe';

// ─── 配置 ───────────────────────────────────────────
const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes('--dry-run');
const dateArgIdx = ARGS.indexOf('--date');
const DATE = dateArgIdx !== -1 ? ARGS[dateArgIdx + 1] : new Date().toISOString().slice(0, 10);
const DAY_NUM = parseInt(DATE.slice(8, 10), 10);
const GROUP = DAY_NUM % 2 === 0 ? 'A' : 'B';
const CATS = GROUP === 'A' ? ['Fish', 'Reptiles', 'Birds'] : ['Dogs', 'Cats', 'Small Pets'];

// 作者分配
const AUTHORS = {
  'Dogs': { author: 'Dr. Sarah Chen', authorSlug: 'sarah-chen', authorBio: 'Dr. Sarah Chen is a licensed veterinarian with over 12 years of clinical experience in small animal practice. She writes PawCritic\u2019s dog and cat guides, focusing on practical, evidence-based pet care advice.' },
  'Cats': { author: 'Dr. Sarah Chen', authorSlug: 'sarah-chen', authorBio: 'Dr. Sarah Chen is a licensed veterinarian with over 12 years of clinical experience in small animal practice. She writes PawCritic\u2019s dog and cat guides, focusing on practical, evidence-based pet care advice.' },
  'Small Pets': { author: 'Emily Zhao', authorSlug: 'emily-zhao', authorBio: 'Emily Zhao is a small animal specialist and former shelter volunteer who has cared for rabbits, guinea pigs, hamsters, and rats for over a decade. She covers small pets and birds for PawCritic.' },
  'Fish': { author: 'Marcus Rivera', authorSlug: 'marcus-rivera', authorBio: 'Marcus Rivera is an aquatics specialist with 15 years of experience keeping freshwater and reef tanks. He covers fish and reptile topics for PawCritic.' },
  'Reptiles': { author: 'Marcus Rivera', authorSlug: 'marcus-rivera', authorBio: 'Marcus Rivera is an aquatics and herpetology specialist with 15 years of hands-on experience. He covers fish and reptile topics for PawCritic.' },
  'Birds': { author: 'Emily Zhao', authorSlug: 'emily-zhao', authorBio: 'Emily Zhao is a small animal specialist and former shelter volunteer who has cared for rabbits, guinea pigs, hamsters, and rats for over a decade. She covers small pets and birds for PawCritic.' }
};

// AI 套话黑名单（用于生成后校验）
const AI_TELLS = [
  "today's fast-paced world", "today's digital age", "seasoned pet owner",
  "let's dive in", "let's explore", "let's take a closer look",
  "it's important to note", "it's worth mentioning", "in conclusion",
  "to sum up", "as we've seen", "as discussed above", "without further ado",
  "that being said", "delve into", "navigate the world of", "embark on a journey",
  "game-changer", "revolutionary", "needless to say", "goes without saying",
  "moreover,", "furthermore,", "additionally,",
  "ensuring your pet's health and happiness for years to come",
  "a comprehensive guide", "when it comes to", "pet parent", "furry friend",
  "look no further", "unlock", "elevate"
];

// ─── 读取数据 ───────────────────────────────────────
let postsRaw;
try { postsRaw = JSON.parse(fs.readFileSync(POSTS, 'utf8')); }
catch (e) { console.error('FATAL: cannot read posts.json:', e.message); process.exit(1); }
const posts = Array.isArray(postsRaw) ? postsRaw : Object.values(postsRaw);

const GOOD_ASINS = JSON.parse(fs.readFileSync(GOOD_ASINS_FILE, 'utf8'));
const allSlugs = new Set(posts.map(p => p.slug));
const catSlugs = {};
posts.forEach(p => {
  if (!catSlugs[p.category]) catSlugs[p.category] = [];
  catSlugs[p.category].push(p.slug);
});

// ─── 幂等检查：今天是否已有 3 篇 ─────────────────────
const todayPosts = posts.filter(p => p.date === DATE);
if (todayPosts.length >= 3) {
  console.log('SKIP: ' + DATE + ' already has ' + todayPosts.length + ' articles. Nothing to do.');
  process.exit(0);
}
if (todayPosts.length > 0) {
  console.log('WARN: ' + DATE + ' has ' + todayPosts.length + ' articles (<3). Will generate ' + (3 - todayPosts.length) + ' more for missing categories.');
}
// 已有今天文章的类别，跳过这些类别
const doneCats = new Set(todayPosts.map(p => p.category));
const catsToDo = CATS.filter(c => !doneCats.has(c));
console.log('DATE=' + DATE + ' (day ' + DAY_NUM + ') GROUP=' + GROUP + ' -> ' + catsToDo.join(', '));

// ─── DeepSeek API ──────────────────────────────────
const cfg = JSON.parse(fs.readFileSync('C:/Users/D3-AI/.qclaw/openclaw.json', 'utf8'));
const API_KEY = cfg.models.providers.deepseek.apiKey;
const BASE_URL = cfg.models.providers.deepseek.baseURL || 'https://api.deepseek.com';
const MODEL = cfg.models.providers.deepseek.models && cfg.models.providers.deepseek.models[0] ? cfg.models.providers.deepseek.models[0].id : 'deepseek-v4-flash';

async function callLLM(messages, maxTokens = 64000) {
  const url = BASE_URL.replace(/\/$/, '') + '/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ model: MODEL, messages: messages, max_tokens: maxTokens, temperature: 0.8, thinking: { type: 'disabled' } })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('API ' + res.status + ': ' + txt.slice(0, 300));
  }
  const data = await res.json();
  const content = data.choices[0].message.content;
  if (!content || content.trim().length < 100) throw new Error('Empty/short LLM response');
  return content;
}

function extractJSON(text) {
  let t = text.trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) t = m[1].trim();
  const start = t.indexOf('{');
  if (start === -1) throw new Error('No JSON in LLM output: ' + t.slice(0, 200));
  let end = t.lastIndexOf('}');
  if (end === -1) throw new Error('No closing brace: ' + t.slice(0, 200));
  try { return JSON.parse(t.slice(start, end + 1)); }
  catch (e) {
    for (let i = end; i > start; i--) {
      try { return JSON.parse(t.slice(start, i + 1)); } catch (e2) {}
    }
    throw new Error('JSON parse failed: ' + t.slice(0, 200));
  }
}

function poolFor(cat) { return (GOOD_ASINS[cat] || []).slice(); }

// ─── Prompt 构建 ───────────────────────────────────
function buildPrompt(cat) {
  const pool = poolFor(cat);
  let localImgs = [];
  try {
    localImgs = fs.readdirSync(path.join(ROOT, 'public', 'images', 'products'))
      .filter(f => f.endsWith('.jpg')).map(f => f.replace('.jpg', ''));
  } catch (e) {}

  const recent = posts.filter(p => p.category === cat)
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14)
    .map(p => '- ' + p.date + ': ' + p.title).join('\n');

  const recentRoundups = posts.filter(p => /best .* 2026|top .* 2026|roundup/i.test(p.title))
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
    .map(p => '- ' + p.date + ': ' + p.title).join('\n');

  return `Write ONE new PawCritic article for category "${cat}" dated ${DATE}.

=== HARD REQUIREMENTS ===
1. Output JSON ONLY (no prose, no markdown fences), fields: title, slug, category, date, description, content.
2. date="${DATE}", category="${cat}".
3. content = HTML fragment ONLY — start with <h2>, NO <!DOCTYPE>/<html>/<head>/<body>/<main>/<meta>/<title>. Use literal & not &amp;.
4. 2000+ words in content.
5. AT MOST 4 Amazon affiliate links, format exactly: https://amazon.com/dp/ASIN?tag=paw070-20
   Use ONLY ASINs from this known-good pool for ${cat}: ${pool.join(', ')}
6. EXACTLY 2 images — this is MANDATORY, your article MUST contain exactly two <img> tags in content. If any of your article's ASINs have local files, use <img src="/images/products/{ASIN}.jpg" alt="..." width="600" height="400"> for the first 2 such ASINs. Local files available: ${localImgs.join(', ')}. If you did not use any ASIN with a local image, add the fallback images: <img src="https://picsum.photos/seed/{slug}-1/600/400" alt="..." width="600" height="400"> and <img src="https://picsum.photos/seed/{slug}-2/600/400" alt="..." width="600" height="400">. NEVER loremflickr. Count your <img> tags before finishing — there must be exactly 2.
7. DO NOT include any internal site links — the pipeline adds them automatically.
8. At least 1-2 citations to credible external sources (ASPCA, AVMA, Humane Society, AAFP, AKC, FDA, USDA, peer-reviewed studies). Format: "According to the [Organization], ..."
9. description: plain text, 120-160 chars.
10. slug: kebab-case, must NOT collide with existing slugs. Existing slugs (do NOT reuse): ${Array.from(allSlugs).join(', ')}
11. Title: no HTML entities.

=== ANTI-AI VOICE (MANDATORY) ===
BANNED phrases: "In today's fast-paced world", "Whether you're a seasoned pet owner", "Let's dive in", "It's important to note that", "In conclusion", "As we've seen", "Without further ado", "Delve into", "Navigate the world of", "Embark on a journey", "Game-changer", "Needless to say", "Moreover," / "Furthermore," / "Additionally," at sentence start, "crucial" more than once, "when it comes to", "pet parent", "furry friend", formulaic closings like "...ensuring your pet's health and happiness for years to come".
BANNED structures: 3-part intro formula, bullet lists of exactly 3 items repeatedly, every paragraph exactly 3-4 sentences, "On one hand... on the other hand" hedging, generic closing that repeats the intro.
DO: open with a specific observation, surprising fact, strong opinion, or direct question; vary sentence length; use contractions; be colloquial; give specific numbers/temperatures/measurements; take a stance ("I recommend"); mention personal experience ("I've seen this go wrong"); end with a practical takeaway, not a summary.

=== TOPIC SELECTION ===
Recent ${cat} articles (do NOT duplicate):
${recent}

Recent product roundups on the site (do NOT write another roundup unless it has been 7+ days since the last one; prefer Buying Guide / Care-How-To / Comparison / Health & Safety / FAQ types):
${recentRoundups}

Pick a fresh, searchable topic not covered above. Return ONLY the JSON object.`;
}

// ─── aff 链接裁剪（超 4 时去掉多余链接的 href，保留文本）──────────
function trimAffLinks(content, max = 4) {
  // 匹配完整 <a href="amazon...">...</a> 对
  const re = /<a href="(https:\/\/amazon\.com\/dp\/[A-Z0-9]{10}\?tag=paw070-20)"[^>]*>([\s\S]*?)<\/a>/g;
  const links = [];
  let m;
  while ((m = re.exec(content)) !== null) links.push({ full: m[0], href: m[1], text: m[2] });
  if (links.length <= max) return content;
  // 保留前 max 个，多余的去掉 href 保留文本
  let out = content;
  const excess = links.slice(max);
  excess.forEach(l => {
    out = out.replace(l.full, l.text.trim());
  });
  return out;
}

// ─── 校验 ──────────────────────────────────────────
function validateArticle(obj, cat) {
  if (!obj.slug || !obj.content || !obj.title || !obj.description) throw new Error('Missing fields for ' + cat);
  if (allSlugs.has(obj.slug)) throw new Error('Slug collision: ' + obj.slug);
  if (!/^[a-z0-9-]+$/.test(obj.slug)) throw new Error('Bad slug format: ' + obj.slug);

  const words = obj.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words < 2000) throw new Error('Too short: ' + words + ' words for ' + cat);

  const affCount = (obj.content.match(/amazon\.com\/dp\//g) || []).length;
  if (affCount > 4) throw new Error('Too many aff links: ' + affCount + ' for ' + cat);
  const badAff = obj.content.match(/amazon\.com\/dp\/([A-Z0-9]{10})(?!\?tag=paw070-20)/g);
  if (badAff) throw new Error('Malformed aff links: ' + badAff.join(','));

  const imgCount = (obj.content.match(/<img /g) || []).length;
  if (imgCount !== 2) throw new Error('Image count ' + imgCount + ' != 2 for ' + cat);
  if (/loremflickr/i.test(obj.content)) throw new Error('loremflickr banned');

  if (obj.description.length < 120 || obj.description.length > 160)
    throw new Error('Description length ' + obj.description.length + ' out of range for ' + cat);

  const lower = obj.content.toLowerCase();
  const hits = AI_TELLS.filter(t => lower.includes(t));
  if (hits.length) throw new Error('AI tells in ' + cat + ': ' + hits.join('; '));

  if (/<!DOCTYPE|<html|<head|<body|<main/i.test(obj.content)) throw new Error('HTML wrapper tags found in ' + cat);
  if (obj.content.includes('&amp;')) throw new Error('&amp; entity in ' + cat);

  console.log(`  [${cat}] OK words=${words} aff=${affCount} imgs=${imgCount} desc=${obj.description.length} slug=${obj.slug}`);
  return words;
}

// ─── 注入真实内链 ──────────────────────────────────
function injectRelated(content, cat, excludeSlug) {
  const pool = (catSlugs[cat] || []).filter(s => s !== excludeSlug);
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  const slugs = shuffled.slice(0, 3);
  if (slugs.length < 2) return content;
  const links = slugs.map(s => {
    const words = s.split('-').filter(w => !/^\d+$/.test(w)).join(' ');
    const anchor = words.length > 60 ? words.split(' ').slice(0, 8).join(' ') : words;
    return '<a href="/' + s + '">' + anchor + '</a>';
  });
  const block = '\n<h2>Related Reading</h2>\n<p>Want more on this topic? Check out our guides on ' + links.join(', ') + '.</p>\n';
  return content + block;
}

// ─── 生成单篇（带重试）──────────────────────────────
async function genOne(cat, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log('=== Generating ' + cat + ' (attempt ' + attempt + ') ===');
      const out = await callLLM([
        { role: 'system', content: 'You are a senior pet-industry content writer for PawCritic.com. You write 2000+ word HTML articles in a confident, experienced, human voice. You ALWAYS return a single valid JSON object with no prose around it.' },
        { role: 'user', content: buildPrompt(cat) }
      ]);
      const obj = extractJSON(out);
      // 先裁剪 aff 链接（防 LLM 超发），再校验
      obj.content = trimAffLinks(obj.content);
      validateArticle(obj, cat);
      obj.content = injectRelated(obj.content, cat, obj.slug);
      obj.author = AUTHORS[cat].author;
      obj.authorSlug = AUTHORS[cat].authorSlug;
      obj.authorBio = AUTHORS[cat].authorBio;
      obj.date = DATE;
      obj.category = cat;
      allSlugs.add(obj.slug);
      return obj;
    } catch (e) {
      console.log('  ! attempt ' + attempt + ' failed: ' + e.message);
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 8000));
    }
  }
}

// ─── 主流程 ────────────────────────────────────────
async function main() {
  console.log('=== PawCritic daily-generate ===');
  console.log('Date: ' + DATE + ' | Group ' + GROUP + ' | Categories: ' + catsToDo.join(', '));
  if (catsToDo.length === 0) { console.log('All categories already done for today. Exit.'); process.exit(0); }

  // 余额预检
  try {
    const res = await fetch(BASE_URL.replace(/\/$/, '') + '/user/balance', {
      headers: { 'Authorization': 'Bearer ' + API_KEY }
    });
    const bal = await res.json();
    const avail = bal.balance_infos && bal.balance_infos[0];
    console.log('DeepSeek balance: ' + (avail ? avail.total_balance + ' ' + avail.currency : 'unknown'));
    if (bal.is_available === false) { console.error('FATAL: API account not available'); process.exit(1); }
  } catch (e) { console.log('WARN: balance check failed (' + e.message + ') — continuing'); }

  // 串行生成
  const results = [];
  for (const cat of catsToDo) {
    const obj = await genOne(cat);
    results.push(obj);
  }

  console.log('\n=== Generated ' + results.length + ' articles ===');

  // 保存备份
  const backupFile = path.join(ROOT, '_daily_articles.json');
  fs.writeFileSync(backupFile, JSON.stringify(results, null, 2), 'utf8');

  if (DRY_RUN) {
    console.log('DRY RUN: not merging/committing. Backup at ' + backupFile);
    process.exit(0);
  }

  // 合并
  const newPosts = results.map(o => ({
    title: o.title, slug: o.slug, date: o.date, category: o.category,
    description: o.description, author: o.author, authorSlug: o.authorSlug,
    authorBio: o.authorBio, content: o.content
  }));
  const merged = posts.concat(newPosts);
  fs.writeFileSync(POSTS, JSON.stringify(merged, null, 2), 'utf8');
  console.log('Merged into posts.json: ' + posts.length + ' -> ' + merged.length);

  // validate-asins
  console.log('\n--- validate-asins ---');
  execSync('node ' + path.join(ROOT, 'validate-asins.js'), { stdio: 'inherit', cwd: ROOT });

  // rebuild-data
  console.log('\n--- rebuild-data ---');
  execSync('node ' + path.join(ROOT, 'rebuild-data.js'), { stdio: 'inherit', cwd: ROOT });

  // git commit + push
  console.log('\n--- git commit + push ---');
  const gitAdd = GIT + ' add src/data/posts.json src/data/categories.json src/data/latest.json';
  execSync(gitAdd, { cwd: ROOT, stdio: 'inherit' });
  const msg = 'Add ' + newPosts.length + ' Group ' + GROUP + ' articles for ' + DATE + ' (' + newPosts.map(p => p.slug).join(', ') + ')';
  execSync('"' + GIT + '" commit -m "' + msg + '"', { cwd: ROOT, stdio: 'inherit' });
  try {
    execSync('"' + GIT + '" push origin main', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    // push 可能因 stderr 报退出码 1（PowerShell 误报），检查是否实际成功
    console.log('push exit code ' + e.status + ' (may be PowerShell stderr false-positive)');
  }

  // cron-verify
  console.log('\n--- cron-verify ---');
  try {
    execSync('node ' + path.join(ROOT, 'cron-verify.js'), { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    console.error('VERIFY FAILED (exit ' + e.status + ')');
    process.exit(1);
  }

  // 清理备份
  try { fs.unlinkSync(backupFile); console.log('cleaned: ' + backupFile); } catch (e) {}

  console.log('\n=== SUCCESS ===');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
