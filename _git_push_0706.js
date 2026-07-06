const { execSync } = require('child_process');
const cwd = 'D:/pawcritic-next';

// Clean up stale temp files first
const fs = require('fs');
const stale = ['_check_0706.js', '_gen_3_articles_0706.js', '_used_slugs.json',
  'gen-article.js', 'verify-article.js',
  'temp-article-cats.json', 'temp-article-dogs.json', 'temp-article-smallpets.json',
  'pawcritic_articles_20260705.md'];
stale.forEach(f => { const p = cwd + '/' + f; if (fs.existsSync(p)) { fs.unlinkSync(p); console.log('Cleaned:', f); }});
if (fs.existsSync(cwd + '/temp_articles')) {
  fs.readdirSync(cwd + '/temp_articles').forEach(f => fs.unlinkSync(cwd + '/temp_articles/' + f));
  fs.rmdirSync(cwd + '/temp_articles');
}

execSync('git add -A', { cwd, stdio: 'inherit' });
execSync('git status --short', { cwd, stdio: 'inherit' });
execSync('git commit -m "Add 3 PawCritic articles: Powerheads, Reptile Calcium, Bird Flight Suits (Jul 6)"', { cwd, stdio: 'inherit' });
execSync('git push origin main', { cwd, stdio: 'inherit' });
console.log('ALL DONE');
