const fs = require('fs');
const c = JSON.parse(fs.readFileSync('D:/pawcritic-next/temp_articles/new-batch.json', 'utf8'))[0].content;
console.log('Has img tag:', c.includes('<img'));
console.log('First 300 chars:', JSON.stringify(c.substring(0, 300)));
