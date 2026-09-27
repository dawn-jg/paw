// 薄内容扩充队列：从 noindex-slugs.json 取文章，LLM 扩充到 2000+ 词，
// 成功后更新 posts.json、从 noindex 队列移除、rebuild、commit、push。
// 用法: node expand-thin.js [--n 3]
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const ARGS = process.argv.slice(2);
const nIdx = ARGS.indexOf('--n');
const BATCH = nIdx !== -1 ? parseInt(ARGS[nIdx + 1], 10) : 3;

const cfg = JSON.parse(fs.readFileSync('C:/Users/D3-AI/.qclaw/openclaw.json', 'utf8'));
const PROVIDERS = [
  { name: 'zai-coding', baseURL: 'https://open.bigmodel.cn/api/coding/paas/v4', apiKey: cfg.models.providers.zai.apiKey, model: 'glm-5.3', reasoning: true },
  { name: 'deepseek', baseURL: (cfg.models.providers.deepseek.baseURL || 'https://api.deepseek.com').replace(/\/$/, ''), apiKey: cfg.models.providers.deepseek.apiKey, model: 'deepseek-v4-flash', reasoning: true },
];

async function callLLM(messages, maxTokens = 64000) {
  let lastErr = null;
  for (const prov of PROVIDERS) {
    try {
      const url = prov.baseURL.replace(/\/$/, '') + '/chat/completions';
      const body = { model: prov.model, messages, max_tokens: maxTokens, temperature: 0.7 };
      if (prov.reasoning) body.thinking = { type: 'disabled' };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + prov.apiKey }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('[' + prov.name + '] HTTP ' + res.status + ': ' + (await res.text()).slice(0, 150));
      const data = await res.json();
      const content = data.choices[0].message.content;
      if (!content || content.trim().length < 200) throw new Error('[' + prov.name + '] empty response');
      console.log('  (provider: ' + prov.name + ')');
      return content;
    } catch (e) { lastErr = e; console.log('  ! ' + prov.name + ' failed: ' + e.message); }
  }
  throw new Error('All providers failed: ' + lastErr.message);
}

function extractJSON(text) {
  let t = text.trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) t = m[1].trim();
  const start = t.indexOf('{');
  let end = t.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in output: ' + t.slice(0, 200));
  const tryParse = (s) => { try { return JSON.parse(s); } catch (e) { return null; } };
  let obj = tryParse(t.slice(start, end + 1));
  if (obj) return obj;
  for (let i = end; i > start; i--) {
    const o = tryParse(t.slice(start, i + 1));
    if (o) return o;
  }
  throw new Error('JSON parse failed: ' + t.slice(0, 300));
}

const AI_TELLS = ['in today\'s fast-paced world', "today's digital age", 'seasoned pet owner', 'let\'s dive in', "let's explore", "let's take a closer look", "it's important to note", "it's worth mentioning", 'in conclusion', 'to sum up', "as we've seen", 'as discussed above', 'without further ado', 'that being said', 'delve into', 'navigate the world of', 'embark on a journey', 'game-changer', 'revolutionary', 'needless to say', 'goes without saying', 'moreover,', 'furthermore,', 'additionally,', 'when it comes to', 'pet parent', 'furry friend', 'look no further', 'unlock', 'elevate', 'in this guide', 'peace of mind', 'robust', 'in this article', 'leverage', 'walk you through'];

// 第一人称实测声称：PawCritic 不做 hands-on 实测（见 /how-we-test），
// 任何 "we tested / 红外测温 / N个月实测" 都是虚构，必须清除。
const CLAIM_TELLS = [
  /\bwe(?:'ve| have)?\s+(?:tested|measured|tried|purchased|bought|used|submerged|soaked|weighed|timed|logged|tracked)\b/i,
  /\bour\s+(?:team|testing)\s+(?:tested|measured|tried|used|handled|protocol|methodology)\b/i,
  /\bhow\s+we\s+(?:tested|test|evaluated|reviewed|rate)\b/i,
  /\b(?:weeks?|months?)\s+of\s+(?:hands-?on\s+)?(?:testing|use)\b/i,
  /\bwe\s+ran\s+(?:our\s+own\s+)?test/i,
  /\bin\s+our\s+(?:own\s+)?(?:testing|tests|lab)\b/i,
  /\binfrared\s+thermometer/i,
  /\bcalibrated\s+(?:scale|meter|thermometer)\b/i,
  /\blab(?:oratory)?\s+test(?:ing|s)?\b/i,
];

const TEMPLATE_MARKERS = [
  /After extensive research and testing, we've compiled our top picks for/i,
  /When shopping for [^<]{5,200}, consider these key factors to ensure you are getting the best value/i,
  /Look for durable materials and reputable brands/i,
  /Prices vary widely depending on brand and features\. Budget options start around/i,
  /Focus on quality, safety, and suitability for your specific pet\./i,
  /Check Latest Price on Amazon/i,
];

function wordCount(html) { return (html || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length; }

// 纯模板填空文（mad-libs 产物）需要整篇重写，扩充只会把模板骨架撑得更长
function isTemplateArticle(post) {
  const c = post.content || '';
  return TEMPLATE_MARKERS.filter(re => re.test(c)).length >= 3;
}

function buildPrompt(post) {
  const c = post.content || '';
  const imgCount = (c.match(/<img /g) || []).length;

  if (isTemplateArticle(post)) {
    return `Rewrite this page completely as a genuine, useful pet-care article of 2400+ words. What you are given is a machine-generated placeholder: every paragraph is a fill-in-the-blank skeleton with the product category substituted in, and it carries no real information. Do NOT preserve its structure, headings, or wording. Throw the skeleton away and write a real article from scratch on the same topic.

Keep: the slug's topic and search intent, every existing <img> tag (exactly ${imgCount} of them), every existing amazon.com/dp/ link (do not add or remove any), and the disclosure paragraph if present.

The new article must be genuinely informative and specific: what to look for and why, real trade-offs, materials and specs that matter, sizing, safety and species-specific concerns, common mistakes, maintenance, and honest limitations. Attribution must be honest — cite published guidance, manufacturer specs, and owner reports. Do NOT claim PawCritic performed hands-on testing, used instruments, or ran any test period.

HARD RULES:
1. Output JSON ONLY, fields: content (the full rewritten HTML).
2. HTML fragment only (h2/h3/p/ul/table), no doctype/html/head/body wrapper.
3. NEVER use double quote characters (") inside content — single quotes everywhere (HTML attributes and quoted words).
4. Keep EVERY existing <img> tag: the article must contain exactly ${imgCount} img tags.
5. Keep EVERY existing amazon.com/dp/ link. Do not add new affiliate links. Do not add internal links.
6. Keep the Disclosure paragraph if present.
7. No AI boilerplate phrases.
8. No first-person testing claims of any kind: never write 'we tested', 'we measured', 'our team tested', 'How We Tested', 'in our testing', 'N weeks of testing', or mention infrared thermometers / calibrated instruments / lab testing. Write as a research-based publication that synthesises published information.
9. 2400+ words.

PLACEHOLDER PAGE TO REPLACE:
${c}

Return ONLY the JSON object.`;
  }

  return `Expand this existing pet-care article to 2400+ words. Keep the same topic, slug, structure, headings order, all existing <img> tags (positions and attributes), all existing affiliate links and the disclosure paragraph exactly as they are. Add depth: step-by-step details, specific numbers, common mistakes, expert-cited context, practical takeaways. Add at most 1-2 NEW short paragraphs only where they genuinely help.

IMPORTANT — remove any first-person testing claims: PawCritic is a research-based publication and does not perform hands-on product testing. If the original text says 'we tested', 'we measured', 'our team tested', 'How We Tested', 'in our testing', 'over N weeks of testing', or mentions infrared thermometers or calibrated instruments, rewrite those passages to attribute the information honestly to published guidance, manufacturer specifications, and verified owner reports instead.

HARD RULES:
1. Output JSON ONLY, fields: content (the full expanded HTML).
2. HTML fragment only (h2/p/ul/table), no doctype/html/head/body wrapper.
3. NEVER use double quote characters (") inside content — single quotes everywhere (HTML attributes and quoted words).
4. Keep EVERY existing <img> tag: the article must contain exactly ${ (c.match(/<img /g) || []).length } img tags.
5. Keep EVERY existing amazon.com/dp/ link. Do not add new affiliate links. Do not add internal links.
6. Keep the Disclosure paragraph if present.
7. No AI boilerplate phrases.
8. 2400+ words.

ORIGINAL ARTICLE:
${c}

Return ONLY the JSON object.`;
}

(async () => {
  const queueFile = path.join(ROOT, 'src/data/noindex-slugs.json');
  const postsFile = path.join(ROOT, 'src/data/posts.json');
  const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  if (queue.length === 0) { console.log('SKIP: noindex queue is empty — all thin articles expanded.'); return; }

  const postsData = JSON.parse(fs.readFileSync(postsFile, 'utf8'));
  const isArr = Array.isArray(postsData);
  const posts = isArr ? postsData : Object.values(postsData);
  const bySlug = new Map(posts.map(p => [p.slug, p]));

  const batch = queue.slice(0, BATCH);
  const done = [];
  const failed = [];

  for (const slug of batch) {
    const post = bySlug.get(slug);
    if (!post) { console.log('!! slug not found in posts.json: ' + slug); failed.push(slug); continue; }
    const before = wordCount(post.content);
    process.stdout.write('Expanding ' + slug + ' (' + before + ' words) ... ');
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const out = await callLLM([{ role: 'user', content: buildPrompt(post) }]);
        const obj = extractJSON(out);
        const c = obj.content || (obj.choices && obj.choices[0].content);
        if (!c || typeof c !== 'string') throw new Error('no content field');
        const wc = wordCount(c);
        if (wc < 2000) throw new Error('still too short: ' + wc);
        const imgs = (c.match(/<img /g) || []).length;
        const imgsBefore = (post.content.match(/<img /g) || []).length;
        if (imgs !== imgsBefore) throw new Error('img count changed: ' + imgs + ' != ' + imgsBefore);
        const affs = (c.match(/amazon\.com\/dp\//g) || []).length;
        const affsBefore = (post.content.match(/amazon\.com\/dp\//g) || []).length;
        if (affs > affsBefore) throw new Error('aff links added: ' + affs + ' > ' + affsBefore);
        if (/<!DOCTYPE|<html|<head/i.test(c)) throw new Error('wrapper tags');
        const lower = c.toLowerCase().replace(/elevated/g, ' ');
        const hits = AI_TELLS.filter(t => lower.includes(t));
        if (hits.length) throw new Error('AI tells: ' + hits.join(';'));
        // 第一人称实测声称：与 /how-we-test 的 research-based 声明冲突，必须清零
        const claimPlain = c.replace(/<[^>]+>/g, ' ');
        const claimHits = CLAIM_TELLS.filter(re => re.test(claimPlain));
        if (claimHits.length) throw new Error('fabricated testing claims: ' + claimHits.map(r => r.source).join(' | ').slice(0, 180));
        // 模板骨架残留
        const tplLeft = TEMPLATE_MARKERS.filter(re => re.test(c)).length;
        if (isTemplateArticle(post) && tplLeft >= 2) throw new Error('template skeleton still present (' + tplLeft + ' markers)');
        post.content = c;
        post.date = new Date().toISOString().slice(0, 10); // 扩充即更新，sitemap lastmod 跟随
        done.push(slug + ' (' + before + '→' + wc + ' words)');
        console.log('OK ' + before + '→' + wc);
        ok = true;
      } catch (e) {
        console.log('attempt ' + attempt + ' failed: ' + e.message);
      }
    }
    if (!ok) { failed.push(slug); console.log('!! FAILED after retries: ' + slug); }
  }

  if (done.length === 0) { console.log('FATAL: no articles expanded this run.'); process.exit(1); }

  // 从队列移除已完成的
  const remainingClean = queue.filter(s => !done.some(d => d.startsWith(s + ' ')));
  fs.writeFileSync(queueFile, JSON.stringify(remainingClean, null, 2));
  fs.writeFileSync(postsFile, JSON.stringify(postsData, null, 2));

  execSync('node ' + path.join(ROOT, 'rebuild-data.js'), { cwd: ROOT, stdio: 'inherit' });
  execSync('git add src/data/posts.json src/data/latest.json src/data/noindex-slugs.json && git commit -m "Expand ' + done.length + ' thin article(s) to 2000+ words and restore indexing: ' + done.map(d => d.split(' ')[0]).join(', ') + '" && git push origin main', { cwd: ROOT, stdio: 'inherit' });

  console.log('\n=== EXPAND SUCCESS ===');
  console.log('Expanded: ' + done.join('; '));
  if (failed.length) console.log('Failed (left in queue): ' + failed.join(', '));
  console.log('Queue remaining: ' + remainingClean.length);
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
