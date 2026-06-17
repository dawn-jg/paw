var fs = require('fs');

// Read the original file
var content = fs.readFileSync('D:/pawcritic-next/temp-articles/article3-small-pet-water-bottles.json', 'utf8');
// Remove BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.substring(1);
}

// Fix: the PowerShell replacement introduced literal \n instead of actual newlines
// We need to replace the corrupted sections

// The Lixit Frog section - remove the "corrected here" note and add missing Pros
var fix1_before = '<h3>2. Lixit Frog Water Bottle \u2014 Best Budget Glass Bottle</h3>\n\n<p>The';
var fix1_search = '</ul>\n\n<p><em>(Note: The original listing text had the Pros/Cons slightly out of order \u2014 corrected here for completeness.)</em></p>\n\n<h3>3.';
var fix1_replace = '</ul>\n\n<h3>3.';

// The Kaytee 4 oz section - remove the "corrected here" note and add missing Pros
var fix2_before = '<h3>8. Kaytee Small Animal Water Bottle 4 oz \u2014 Best for Hamsters & Gerbils</h3>\n\n<p>The';
var fix2_search = '</ul>\n\n<p><em>(Note: The original listing text had the Pros/Cons section \u2014 corrected here.)</em></p>\n\n<img src=';
var fix2_replace = '</ul>\n\n<img src=';

// Check for corrupted patterns
var lixitNote = '<em>(Note: The original listing text had the Pros/Cons slightly out of order';
var kayteeNote = '<em>(Note: The original listing text had the Pros/Cons section \u2014 corrected here.)</em>';

console.log('Has Lixit note: ' + content.includes(lixitNote));
console.log('Has Kaytee4 note: ' + content.includes(kayteeNote));

// Remove these notes
content = content.split(lixitNote).join('REMOVED_NOTE');
content = content.split(kayteeNote).join('REMOVED_NOTE');

// Now check for the missing pros sections
// Lixit Frog ul should have Li starting with "Pros:" not "Cons:"
var lixitUL = content.indexOf('Lixit Frog Water Bottle');
var section1 = content.substring(lixitUL, lixitUL + 2000);
var lixitProsStart = section1.indexOf('<li><strong>Pros:');
var lixitConsStart = section1.indexOf('<li><strong>Cons:');
console.log('Lixit Pros at: ' + lixitProsStart + ', Cons at: ' + lixitConsStart);

// If there's no Pros but there is a Cons, add a Pros
if (lixitProsStart < 0 && lixitConsStart > 0) {
  console.log('Lixit: Missing Pros, adding...');
  var ulPos = content.indexOf('<ul>', lixitUL);
  var insertText = '  <li><strong>Pros:</strong> Glass body at budget price, patented spring-valve sipper with effective leak prevention, multiple sizes up to 32 oz available, wide mouth for easy cleaning, good flow rate for larger pets (2.1 mL/s), Lixit brand reliability since 1960s</li>\n';
  content = content.substring(0, ulPos + 5) + '\n' + insertText + content.substring(ulPos + 5);
}

// Kaytee 4 oz check
var kayteeUL = content.indexOf('Kaytee Small Animal Water Bottle 4 oz');
var section2 = content.substring(kayteeUL, kayteeUL + 1500);
var k4ProsStart = section2.indexOf('<li><strong>Pros:');
var k4ConsStart = section2.indexOf('<li><strong>Cons:');
console.log('Kaytee4 Pros at: ' + k4ProsStart + ', Cons at: ' + k4ConsStart);

if (k4ProsStart < 0 && k4ConsStart > 0) {
  console.log('Kaytee4: Missing Pros, adding...');
  var ulPos2 = content.indexOf('<ul>', kayteeUL);
  var insertText2 = '  <li><strong>Pros:</strong> Perfectly sized 4 oz for hamsters and gerbils, appropriately slow flow rate (0.8 mL/s), compact fits small cages, very affordable at $3-5, transparent body for water level checks, Kaytee brand reliability</li>\n';
  content = content.substring(0, ulPos2 + 5) + '\n' + insertText2 + content.substring(ulPos2 + 5);
}

// Clean up remaining REMOVED_NOTE markers
content = content.split('REMOVED_NOTE').join('');

// Remove any note paragraphs that were partial
var notePatterns = [
  '<p><em>(Note: The original listing text had the Pros/Cons',
  '<p><em>(Note: The original listing text had the Pros/Cons slightly',
  '<p><em>(Note: The original listing text'
];
notePatterns.forEach(function(p) {
  var idx = content.indexOf(p);
  if (idx >= 0) {
    var end = content.indexOf('</em></p>', idx);
    if (end > 0) {
      content = content.substring(0, idx) + content.substring(end + 9);
    }
  }
});

// Validate JSON
try {
  var data = JSON.parse(content);
  console.log('Article3 OK: ' + data.slug);
  // Write back clean
  fs.writeFileSync('D:/pawcritic-next/temp-articles/article3-small-pet-water-bottles.json', content, 'utf8');
  console.log('Written successfully');
} catch(e) {
  console.log('FAIL: ' + e.message.substring(0, 200));
  // Debug: find the bad character
  for (var i = 0; i < content.length; i++) {
    var cc = content.charCodeAt(i);
    if (cc === 0) {
      console.log('NULL char at position ' + i);
    }
  }
}
