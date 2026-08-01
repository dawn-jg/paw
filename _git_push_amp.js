const { execSync } = require('child_process');
const fs = require('fs');
const cwd = 'D:/pawcritic-next';

// Clean self
const self = cwd + '/_git_push_amp.js';

// Git
execSync('git add -A', { cwd, stdio: 'inherit' });
execSync('git commit -m "fix: decode HTML entities (&amp;) in 5 article titles"', { cwd, stdio: 'inherit' });
execSync('git push origin main', { cwd, stdio: 'inherit' });

// Delete self after push
try { fs.unlinkSync(self); console.log('Cleaned temp script'); } catch(e) {}
console.log('DONE');
