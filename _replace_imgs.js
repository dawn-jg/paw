var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));
var dir='D:/pawcritic-next/public/images/products/';
var have=fs.readdirSync(dir).map(function(f){return f.replace(/\.jpg$/i,'');});

var loremRe=/<img\b([^>]*?)\bsrc=["']https:\/\/loremflickr\.com\/[^"']*["'][^>]*>/gi;
var asinRe=/dp\/([A-Z0-9]{10})/g;

var totalLorem=0, replaced=0, toPicsum=0, articlesTouched=0;

p.forEach(function(a){
  if(!a.content||!a.content.includes('loremflickr'))return;
  articlesTouched++;
  var s={}, m;
  asinRe.lastIndex=0;
  while((m=asinRe.exec(a.content))!==null)s[m[1]]=true;
  var avail=Object.keys(s).filter(function(x){return have.indexOf(x)!==-1;});
  var idx=0;
  a.content=a.content.replace(loremRe,function(tag){
    totalLorem++;
    if(avail.length>0){
      var asin=avail[idx%avail.length];
      idx++;
      replaced++;
      return tag.replace(/src=["']https:\/\/loremflickr\.com\/[^"']*["']/i,'src="/images/products/'+asin+'.jpg"');
    }else{
      var seed=a.slug+'-'+idx;
      idx++;
      toPicsum++;
      return tag.replace(/src=["']https:\/\/loremflickr\.com\/[^"']*["']/i,'src="https://picsum.photos/seed/'+seed+'/600/400"');
    }
  });
});

fs.writeFileSync('D:/pawcritic-next/src/data/posts.json',JSON.stringify(p,null,2),'utf8');
console.log('Articles touched: '+articlesTouched);
console.log('Total loremflickr <img> processed: '+totalLorem);
console.log('Replaced with product image: '+replaced);
console.log('Replaced with picsum seed: '+toPicsum);
