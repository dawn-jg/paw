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

const AI_TELLS = ['in today\'s fast-paced world', 'let\'s dive in', 'game-changer', 'when it comes to', 'pet parent', 'furry friend', 'look no further', 'delve into', 'navigate the world of'];

function wordCount(html) { return (html || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length; }

function buildPrompt(post) {
  const c = post.content || '';
  return `Expand this existing pet-care article to 2400+ words. Keep the same topic, slug, structure, headings order, all existing <img> tags (positions and attributes), all existing affiliate links and the disclosure paragraph exactly as they are. Add depth: step-by-step details, specific numbers, common mistakes, expert-cited context, practical takeaways. Add at most 1-2 NEW short paragraphs only where they genuinely help.

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
