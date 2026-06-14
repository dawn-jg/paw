var fs = require('fs');
var s = fs.readFileSync('temp-article-dogs.json', 'utf8');
console.log('char at 19211:', s.charCodeAt(19211), 'char at 19212:', s.charCodeAt(19212));
// Find where the content string ends prematurely
var contentStart = s.indexOf('"content": "');
contentStart += 12; // skip "content": "
console.log('Content starts at:', contentStart);
// Find the first unescaped " after contentStart that would end the string
var i = contentStart;
var depth = 0;
while (i < s.length) {
  if (s[i] === '"' && (i === 0 || s[i-1] !== '\\')) {
    depth++;
    if (depth === 2) {
      console.log('String ends at:', i, 'context:', s.substring(Math.max(0,i-20), i+20));
      break;
    }
  }
  i++;
}
