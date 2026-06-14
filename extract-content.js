var fs = require('fs');

function extractFromFile(src, dst) {
  var raw = fs.readFileSync(src, 'utf8');
  // Find the content field value (after "content": ")
  var start = raw.indexOf('"content": "');
  if (start === -1) { console.log('content not found in ' + src); return; }
  start += 12; // skip past "content": "
  
  // Now extract the string content handling escapes
  var result = '';
  var i = start;
  while (i < raw.length) {
    var c = raw[i];
    if (c === '\\' && i + 1 < raw.length) {
      result += raw[i + 1];
      i += 2;
    } else if (c === '"') {
      // Check if this ends the content value
      // Next char should be " (end of content field) or comma/newline
      var rest = raw.substring(i + 1).trim();
      if (rest.startsWith('"') || rest.startsWith(',') || rest.startsWith(']') || rest.startsWith('}') || rest.startsWith('\n') || rest.startsWith('\r')) {
        break;
      }
      result += c;
      i++;
    } else {
      result += c;
      i++;
    }
  }
  
  fs.writeFileSync(dst, result, 'utf8');
  console.log('Extracted ' + dst + ': ' + result.length + ' chars');
}

extractFromFile('temp-article-dogs.json', 'article-dogs-content.html');
extractFromFile('temp-article-cats.json', 'article-cats-content.html');
extractFromFile('temp-article-smallpets.json', 'article-smallpets-content.html');
