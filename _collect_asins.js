var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));
var have=fs.readdirSync('D:/pawcritic-next/public/images/products/').map(function(f){return f.replace(/\.jpg$/i,'');});
var asinRe=/dp\/([A-Z0-9]{10})/g;
var all={};
p.forEach(function(a){
  if(!a.content)return;
  var m;asinRe.lastIndex=0;
  while((m=asinRe.exec(a.content))!==null)all[m[1]]=true;
});
var distinct=Object.keys(all);
var missing=distinct.filter(function(x){return have.indexOf(x)===-1;});
console.log('Distinct ASINs referenced in posts: '+distinct.length);
console.log('Already have local image: '+have.length);
console.log('Missing local image: '+missing.length);
console.log('Missing list: '+missing.join(', '));
fs.writeFileSync('D:/pawcritic-next/_missing_asins.json',JSON.stringify(missing));
