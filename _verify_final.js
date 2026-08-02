var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));
var have=fs.readdirSync('D:/pawcritic-next/public/images/products/').map(function(f){return f.replace(/\.jpg$/i,'');});
var lorem=0,picsum=0,prodRefs=0,broken=0,articlesBroken={};
p.forEach(function(a){
  if(!a.content)return;
  if(a.content.indexOf('loremflickr')!==-1)lorem++;
  if(a.content.indexOf('picsum.photos')!==-1)picsum++;
  var re=/src=["']\/images\/products\/([A-Z0-9]{10})\.jpg["']/g,m;
  while((m=re.exec(a.content))!==null){prodRefs++;if(have.indexOf(m[1])===-1){broken++;articlesBroken[a.slug]=(articlesBroken[a.slug]||0)+1;}}
});
console.log('loremflickr articles: '+lorem);
console.log('picsum articles: '+picsum);
console.log('product img refs: '+prodRefs);
console.log('BROKEN product refs (file missing): '+broken);
console.log('Articles with broken refs: '+Object.keys(articlesBroken).length);
Object.keys(articlesBroken).forEach(function(s){console.log('  '+s+': '+articlesBroken[s]);});
console.log('Local product images total: '+have.length);
