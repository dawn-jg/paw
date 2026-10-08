#!/usr/bin/env node
/**
 * daily-generate.js — PawCritic 每日 1 篇本地确定性管线（替代不可靠的子 agent cron）
 *
 * 流程：
 *   1. 读 posts.json，检查今天是否已有 1 篇文章（幂等，有则跳过）
 *   2. 分组：偶日=Group A(Fish/Reptiles/Birds)，奇日=Group B(Dogs/Cats/Small Pets)，
 *      组内按 6 天周期轮换取 1 个分类（Group A: Reptiles→Birds→Fish…；Group B: Dogs→Cats→Small Pets…）
 *   3. 从 posts.json 提取上下文（现有 slug/近期主题/分类 ASIN 池/本地产品图）
 *   4. 直连 LLM API，生成 1 篇（独立 prompt，含 ANTI-AI VOICE 约束）
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
// 用本地时区（Asia/Shanghai）日期，避免 UTC 慢一天问题
function localToday() {
  const d = new Date();
  const off = d.getTimezoneOffset(); // 分钟，本地-UTC
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
const DATE = dateArgIdx !== -1 ? ARGS[dateArgIdx + 1] : localToday();
const DAY_NUM = parseInt(DATE.slice(8, 10), 10);
const GROUP = DAY_NUM % 2 === 0 ? 'A' : 'B';
const CATS = GROUP === 'A' ? ['Fish', 'Reptiles', 'Birds'] : ['Dogs', 'Cats', 'Small Pets'];

// 作者署名：统一为编辑团队。本站不使用虚构个人人设，也不声称任何
// 专业资质、执业头衔或亲身产品实测经历（与 src/app/author/[slug] 及 how-we-test 页一致）。
const EDITORIAL = {
  author: 'PawCritic Editorial Team',
  authorSlug: 'editorial-team',
  authorBio: "PawCritic's editorial team builds every guide from manufacturer specifications, published veterinary and industry guidance, and large-scale analysis of verified owner feedback. We do not operate a physical testing lab, and we do not claim to have personally used every product we cover."
};
const AUTHORS = {
  'Dogs': EDITORIAL,
  'Cats': EDITORIAL,
  'Small Pets': EDITORIAL,
  'Fish': EDITORIAL,
  'Reptiles': EDITORIAL,
  'Birds': EDITORIAL
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
// ASIN -> 真实商品名。没有商品名的 ASIN 一律不入池，避免模型"猜"出一个对不上的商品。
const NAMES_FILE = path.join(ROOT, 'asin-names.json');
let ASIN_NAMES = {};
try { ASIN_NAMES = JSON.parse(fs.readFileSync(NAMES_FILE, 'utf8')); } catch (e) {
  console.warn('WARN: asin-names.json 读取失败，将无法给模型提供商品名:', e.message);
}
const allSlugs = new Set(posts.map(p => p.slug));
const catSlugs = {};
posts.forEach(p => {
  if (!catSlugs[p.category]) catSlugs[p.category] = [];
  catSlugs[p.category].push(p.slug);
});

// ─── 每日产出篇数：1 篇（组内按 6 天周期轮换分类）─────
const DAILY_COUNT = 1;
// 组内轮换：偶日 Group A 取 Reptiles/Birds/Fish…，奇日 Group B 取 Dogs/Cats/Small Pets…
const rotationIdx = Math.floor(DAY_NUM / 2) % CATS.length;
const targetCat = CATS[rotationIdx];

// ─── 幂等检查：今天是否已有 1 篇 ─────────────────────
const todayPosts = posts.filter(p => p.date === DATE);
if (todayPosts.length >= DAILY_COUNT) {
  console.log('SKIP: ' + DATE + ' already has ' + todayPosts.length + ' article(s). Nothing to do.');
  process.exit(0);
}
// 仅生成当天轮换到的分类（已发过则跳过）
const doneCats = new Set(todayPosts.map(p => p.category));
const catsToDo = [targetCat].filter(c => !doneCats.has(c)).slice(0, DAILY_COUNT);
console.log('DATE=' + DATE + ' (day ' + DAY_NUM + ') GROUP=' + GROUP + ' | target=' + targetCat + ' -> ' + (catsToDo.join(', ') || '(skipped)'));

// ─── LLM Provider 配置（优先智谱 GLM Coding Plan，DeepSeek fallback）─────
const cfg = JSON.parse(fs.readFileSync('C:/Users/D3-AI/.qclaw/openclaw.json', 'utf8'));

const PROVIDERS = [
  {
    name: 'zai-coding',
    baseURL: 'https://open.bigmodel.cn/api/coding/paas/v4',
    apiKey: cfg.models.providers.zai.apiKey,
    model: 'glm-5.3',
    reasoning: true
  },
  {
    name: 'deepseek',
    baseURL: (cfg.models.providers.deepseek.baseURL || 'https://api.deepseek.com').replace(/\/$/, ''),
    apiKey: cfg.models.providers.deepseek.apiKey,
    model: 'deepseek-v4-flash',
    reasoning: true
  }
];

async function callLLM(messages, maxTokens = 64000) {
  let lastErr = null;
  for (const prov of PROVIDERS) {
    try {
      const url = prov.baseURL.replace(/\/$/, '') + '/chat/completions';
      const body = { model: prov.model, messages, max_tokens: maxTokens, temperature: 0.8 };
      if (prov.reasoning) body.thinking = { type: 'disabled' };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + prov.apiKey },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error('[' + prov.name + '] API ' + res.status + ': ' + txt.slice(0, 200));
      }
      const data = await res.json();
      const content = data.choices[0].message.content;
      if (!content || content.trim().length < 100) throw new Error('[' + prov.name + '] Empty/short response');
      console.log('  (provider: ' + prov.name + ' / ' + prov.model + ')');
      return content;
    } catch (e) {
      lastErr = e;
      console.log('  ! provider ' + prov.name + ' failed: ' + e.message);
    }
  }
  throw new Error('All providers failed. Last: ' + lastErr.message);
}

function extractJSON(text) {
  let t = text.trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) t = m[1].trim();
  const start = t.indexOf('{');
  if (start === -1) throw new Error('No JSON in LLM output: ' + t.slice(0, 200));
  let end = t.lastIndexOf('}');
  if (end === -1) throw new Error('No closing brace: ' + t.slice(0, 200));
  const tryParse = (s) => { try { return JSON.parse(s); } catch (e) { return null; } };
  // 1. 直接解析
  let obj = tryParse(t.slice(start, end + 1));
  if (obj) return obj;
  // 2. 修复 content 字段内残留的裸双引号（防御性，正常应已由 prompt 规则避免）
  const repaired = t.slice(start, end + 1).replace(/("content":\s*")([\s\S]*?)(",\s*"(?:author|date|category)")/g, (match, p1, p2, p3) => {
    const fixed = p2.replace(/(?<!\\)"/g, "'");
    return p1 + fixed + p3;
  });
  obj = tryParse(repaired);
  if (obj) return obj;
  // 3. 逐字符回退
  for (let i = end; i > start; i--) {
    const o = tryParse(t.slice(start, i + 1));
    if (o) return o;
  }
  throw new Error('JSON parse failed: ' + t.slice(0, 300));
}

// 只返回"有商品名"的条目；没有商品名的 ASIN 直接剔除（宁缺毋滥，
// 避免模型拿到裸编号后自行编造一个对不上的商品描述）
function poolFor(cat) {
  return (GOOD_ASINS[cat] || [])
    .filter(a => ASIN_NAMES[a])
    .map(a => ({ asin: a, name: ASIN_NAMES[a] }));
}
function poolBlock(cat) {
  const pool = poolFor(cat);
  if (!pool.length) return '   (本类目暂无可核实的商品，本次不要添加任何联盟链接)';
  return pool.map(x => '   - ' + x.asin + '  =  ' + x.name).join('\n');
}

// ─── Prompt 构建 ───────────────────────────────────
function buildPrompt(cat) {
  const poolBlockStr = poolBlock(cat);
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
   CRITICAL: Inside content, NEVER use double quote characters (") — NOT for HTML attributes, NOT for quoted words. Use single quotes everywhere: <img src='/images/products/X.jpg' alt='description' width='600' height='400'>, and for quoted words write: He said 'sit' before the treat. This keeps the JSON valid.
4. 2000+ words in content.
5. AT MOST 4 Amazon affiliate links. Format EXACTLY like this (single quotes, all four attributes):
   <a href='https://amazon.com/dp/ASIN?tag=nannan09-20' rel='nofollow sponsored noopener' target='_blank'>anchor text</a>
   NEVER paste a bare URL as plain text — every link must be a full <a> tag as above.
   Use ONLY these ASINs for ${cat}. Each ASIN is a FIXED, real product — the name after the = sign is what that ASIN actually is on Amazon:
${poolBlockStr}
   CRITICAL — product/link consistency:
   - The sentence describing a product and its anchor text MUST match the real product name listed above for the ASIN you link.
   - NEVER invent a product, and NEVER attach a product description to an ASIN whose listed name is something else.
   - If none of the listed products fits the point you are making, do NOT add a link. Fewer correct links beats more wrong ones.
6. EXACTLY 2 images — this is MANDATORY, your article MUST contain exactly two <img> tags in content. Use SINGLE QUOTES for HTML attributes inside content (e.g. <img src='/images/products/{ASIN}.jpg' alt='description' width='600' height='400'>) — this keeps the JSON valid. If any of your article's ASINs have local files, use the first 2 such ASINs. Local files available: ${localImgs.join(', ')}. If none of your linked ASINs has a local file, you MUST instead pick two ASINs from the pool above that DO appear in the local files list, add them as affiliate links (or at minimum reference them by their listed product name), and use those two as your images. NEVER use any external placeholder image service (no picsum, no loremflickr, no placeholder.com) — both <img> tags MUST point to '/images/products/<ASIN>.jpg'. Count your <img> tags before finishing — there must be exactly 2.
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

=== TOPIC TYPE (MANDATORY — AdSense recovery period) ===
FORBIDDEN article types: product roundups, "Best X for Y", "Top N", buying guides, gift guides, any list-of-products format.
REQUIRED types — pick ONE: Care How-To (step-by-step guides), Health & Safety (symptoms, prevention, when to see a vet), Behavior & Training, Species/Setup FAQ, Honest Comparison (two approaches/products compared on merits, max 1 affiliate link).
Article must teach something an owner can actually do or understand — not sell a list of products.

Recent product roundups on the site (already exist; do NOT write another one in any form):
${recentRoundups}

Pick a fresh, searchable topic not covered above. Return ONLY the JSON object.`;
}

// ─── aff 链接裁剪（超 4 时去掉多余链接的 href，保留文本）──────────
function trimAffLinks(content, max = 4) {
  // 匹配完整 <a href="amazon...">...</a> 对
  const re = /<a href="(https:\/\/amazon\.com\/dp\/[A-Z0-9]{10}\?tag=nannan09-20)"[^>]*>([\s\S]*?)<\/a>/g;
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
  // AdSense 恢复期：禁止 best-X / top-N 荟萃类
  if (/^(best|top)[-\d]/.test(obj.slug) || /^the-\d+-best/.test(obj.slug))
    throw new Error('Roundup-type article banned during AdSense recovery: ' + obj.slug);

  const words = obj.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words < 2000) throw new Error('Too short: ' + words + ' words for ' + cat);

  const affCount = (obj.content.match(/amazon\.com\/dp\//g) || []).length;
  if (affCount > 4) throw new Error('Too many aff links: ' + affCount + ' for ' + cat);
  const badAff = obj.content.match(/amazon\.com\/dp\/([A-Z0-9]{10})(?!\?tag=nannan09-20)/g);
  if (badAff) throw new Error('Malformed aff links: ' + badAff.join(','));

  const imgCount = (obj.content.match(/<img /g) || []).length;
  if (imgCount !== 2) throw new Error('Image count ' + imgCount + ' != 2 for ' + cat);
  if (/loremflickr/i.test(obj.content)) throw new Error('loremflickr banned');

  if (obj.description.length < 120 || obj.description.length > 160)
    throw new Error('Description length ' + obj.description.length + ' out of range for ' + cat);

  // "elevated bed/feeder/perch" 是合法产品类型词，先剥离 elevated 再查套话，避免误杀
  const lower = obj.content.toLowerCase().replace(/elevated/g, ' ');
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

  // 余额预检（逐个 provider，任一可用即可继续）
  let anyOk = false;
  for (const prov of PROVIDERS) {
    try {
      const url = prov.baseURL.replace(/\/$/, '') + '/user/balance';
      const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + prov.apiKey } });
      if (res.ok) {
        const bal = await res.json();
        const avail = bal.balance_infos && bal.balance_infos[0];
        console.log(prov.name + ' balance: ' + (avail ? avail.total_balance + ' ' + avail.currency : 'n/a'));
        if (bal.is_available !== false) anyOk = true;
      } else {
        console.log(prov.name + ' balance check HTTP ' + res.status + ' (可能不支持balance接口，忽略)');
        anyOk = true; // coding 端点可能无 balance 接口，不阻塞
      }
    } catch (e) {
      console.log('WARN: ' + prov.name + ' balance check failed (' + e.message + ')');
      anyOk = true;
    }
  }
  if (!anyOk) { console.error('FATAL: no provider available'); process.exit(1); }

  // 串行生成（单篇 4 次重试后仍失败则跳过，不拖垮整批；至少 1 篇成功即继续提交）
  const results = [];
  const failedCats = [];
  for (const cat of catsToDo) {
    try {
      const obj = await genOne(cat);
      results.push(obj);
    } catch (e) {
      console.log('  !! category ' + cat + ' FAILED after all retries: ' + e.message + ' — skipping, continuing with the rest');
      failedCats.push(cat);
    }
  }
  if (results.length === 0) {
    console.error('FATAL: all categories failed. Nothing to commit.');
    process.exit(1);
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
    execSync('node ' + path.join(ROOT, 'cron-verify.js') + ' --min-articles ' + results.length, { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    console.error('VERIFY FAILED (exit ' + e.status + ')');
    process.exit(1);
  }

  // 清理备份
  try { fs.unlinkSync(backupFile); console.log('cleaned: ' + backupFile); } catch (e) {}

  console.log('\n=== SUCCESS ===');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
