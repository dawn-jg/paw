var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));
var have=fs.readdirSync('D:/pawcritic-next/public/images/products/').map(function(f){return f.replace(/\.jpg$/i,'');});
var bad=0, total=0;
p.forEach(function(a){
  if(!a.content)return;
  var re=/src=["']\/images\/products\/([A-Z0-9]{10})\.jpg["']/g;
  var m;
  while((m=re.exec(a.content))!==null){
    total++;
    if(have.indexOf(m[1])===-1)bad++;
  }
});
console.log('Total product img refs: '+total);
console.log('Refs pointing to MISSING files: '+bad);
