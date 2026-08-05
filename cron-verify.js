// cron-verify.js — 校验 cron 是否真正产出（防虚报）
// 检查: 1) 今天是否有 git 提交  2) 今日文章数是否达标
// 用法:
//   node cron-verify.js                     # 默认检查今天, 至少 3 篇
//   node cron-verify.js --min-articles 6    # 指定最少文章数
//   node cron-verify.js --date 2026-08-05   # 指定日期
// 退出码: 0 = PASS, 1 = FAIL
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = 'D:/pawcritic-next';
const POSTS = path.join(REPO, 'src/data/posts.json');

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return '';
  }
}

function localToday() {
  const d = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(d);
}

const args = process.argv.slice(2);
let date = localToday();
let minArticles = 3;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--date' && args[i + 1]) date = args[i + 1];
  if (args[i] === '--min-articles' && args[i + 1]) minArticles = parseInt(args[i + 1], 10);
}

// 1. 今天的 git 提交
const head = sh('git rev-parse HEAD');
const commitsToday = sh(`git log --since=${date}T00:00:00 --until=${date}T23:59:59 --oneline`)
  .split('\n').filter(Boolean);

// 2. 今日文章（date 字段 == 今天）
let posts = [];
try {
  posts = JSON.parse(fs.readFileSync(POSTS, 'utf8'));
  if (!Array.isArray(posts)) posts = Object.values(posts);
} catch (e) { /* posts stays empty */ }
const articlesToday = posts.filter(p => p.date === date);
const articleSlugs = articlesToday.map(a => a.slug);

const issues = [];
if (commitsToday.length === 0) issues.push(`今日无 git 提交 (HEAD=${head})`);
if (articlesToday.length < minArticles) issues.push(`今日文章 ${articlesToday.length} 篇 < 要求 ${minArticles} 篇`);

const pass = issues.length === 0;
const result = {
  date,
  head,
  pass,
  issues,
  commitsToday: commitsToday.length,
  articlesToday: articlesToday.length,
  minArticles,
  articleSlugs
};

console.log(JSON.stringify(result, null, 2));
process.exit(pass ? 0 : 1);
