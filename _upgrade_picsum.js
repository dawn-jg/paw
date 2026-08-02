var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));
var dir='D:/pawcritic-next/public/images/products/';
var have=fs.readdirSync(dir).map(function(f){return f.replace(/\.jpg$/i,'');});
var asinRe=/dp\/([A-Z0-9]{10})/g;
var picsumRe=/<img\b([^>]*?)\bsrc=["']https:\/\/picsum\.photos\/[^"']*["'][^>]*>/gi;
var upgraded=0, kept=0, articles=0;
p.forEach(function(a){
  if(!a.content||a.content.indexOf('picsum.photos')===-1)return;
  articles++;
  var s={},m;asinRe.lastIndex=0;
  while((m=asinRe.exec(a.content))!==null)s[m[1]]=true;
  var avail=Object.keys(s).filter(function(x){return have.indexOf(x)!==-1;});
  var idx=0;
  a.content=a.content.replace(picsumRe,function(tag){
    if(avail.length>0){
      var asin=avail[idx%avail.length];idx++;upgraded++;
      return tag.replace(/src=["']https:\/\/picsum\.photos\/[^"']*["']/i,'src="/images/products/'+asin+'.jpg"');
    }else{kept++;return tag;}
  });
});
fs.writeFileSync('D:/pawcritic-next/src/data/posts.json',JSON.stringify(p,null,2),'utf8');
console.log('Articles with picsum touched: '+articles);
console.log('Picsum imgs upgraded to product image: '+upgraded);
console.log('Picsum imgs kept (no local image): '+kept);
