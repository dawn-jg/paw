const { execSync } = require('child_process');
const fs = require('fs');
const cwd = 'D:/pawcritic-next';

// Clean temp scripts
['_fix_titles.js'].forEach(f => {
  const p = cwd + '/' + f;
  if (fs.existsSync(p)) { fs.unlinkSync(p); console.log('Cleaned:', f); }
});

// Git
execSync('git add -A', { cwd, stdio: 'inherit' });
execSync('git status --short', { cwd, stdio: 'inherit' });
execSync('git commit -m "SEO: truncate all 280 article titles to 60 chars (Google SERP display limit)" --allow-empty', { cwd, stdio: 'inherit' });
execSync('git push origin main', { cwd, stdio: 'inherit' });
console.log('DONE');
