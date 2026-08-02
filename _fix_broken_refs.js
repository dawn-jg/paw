var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));
var dir='D:/pawcritic-next/public/images/products/';
var have=fs.readdirSync(dir).map(function(f){return f.replace(/\.jpg$/i,'');});
var asinRe=/dp\/([A-Z0-9]{10})/g;
var proRe=/src=["']\/images\/products\/([A-Z0-9]{10})\.jpg["']/gi;
var fixed=0, articles=0;
p.forEach(function(a){
  if(!a.content)return;
  var s={},m;asinRe.lastIndex=0;
  while((m=asinRe.exec(a.content))!==null)s[m[1]]=true;
  var avail=Object.keys(s).filter(function(x){return have.indexOf(x)!==-1;});
  if(avail.length===0)avail=have.slice();
  var idx=0,broke=false;
  a.content=a.content.replace(proRe,function(tag,asin){
    if(have.indexOf(asin)===-1){
      var repl=avail[idx%avail.length];idx++;fixed++;broke=true;
      return tag.replace('/images/products/'+asin+'.jpg','/images/products/'+repl+'.jpg');
    }
    return tag;
  });
  if(broke)articles++;
});
fs.writeFileSync('D:/pawcritic-next/src/data/posts.json',JSON.stringify(p,null,2),'utf8');
console.log('Articles fixed: '+articles+', broken refs repaired: '+fixed);
