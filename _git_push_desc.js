const { execSync } = require('child_process');
const fs = require('fs');
const cwd = 'D:/pawcritic-next';
const self = cwd + '/_git_push_desc.js';

execSync('git add -A', { cwd, stdio: 'inherit' });
execSync('git commit -m "fix: add missing description fields to 18 articles"', { cwd, stdio: 'inherit' });
execSync('git push origin main', { cwd, stdio: 'inherit' });

try { fs.unlinkSync(self); } catch(e) {}
console.log('DONE');
