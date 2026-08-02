var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));
var have=fs.readdirSync('D:/pawcritic-next/public/images/products/').map(function(f){return f.replace(/\.jpg$/i,'');});
var broken={};
p.forEach(function(a){
  if(!a.content)return;
  var re=/src=["']\/images\/products\/([A-Z0-9]{10})\.jpg["']/g;
  var m;
  while((m=re.exec(a.content))!==null){
    if(have.indexOf(m[1])===-1){
      broken[a.slug]=(broken[a.slug]||[]);
      broken[a.slug].push(m[1]);
    }
  }
});
console.log('Slugs with broken product img refs: '+Object.keys(broken).length);
Object.keys(broken).forEach(function(s){
  console.log('  '+s+': '+broken[s].join(', '));
});
