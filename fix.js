const fs = require('fs');
const p = 'D:/pawcritic-next/generate-articles.js';
let c = fs.readFileSync(p, 'utf8');
// Replace literal \n sequences (written by tool bug) with actual newlines
c = c.replace(/\\n/g, '\n');
// Fix the JSON.stringify line at the end
// The issue is + quote + line break
c = c.replace(/\+ '\n',/g, "+ '\\n',");
fs.writeFileSync(p, c, 'utf8');
console.log('Fixed. Lines:', c.split('\n').length);
const ok = c.substring(c.length - 50);
console.log('Tail:', JSON.stringify(ok));
