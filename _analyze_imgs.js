var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));
var dir='D:/pawcritic-next/public/images/products/';
var have=[];
try{have=fs.readdirSync(dir).map(function(f){return f.replace(/\.jpg$/i,'');});}catch(e){}
console.log('Existing product images: '+have.length);

var loremArticles=p.filter(function(a){return a.content && a.content.includes('loremflickr');});
console.log('Articles with loremflickr: '+loremArticles.length);

// For each article, extract ASINs from content (amazon dp/ links)
var asinRe=/dp\/([A-Z0-9]{10})/g;
var matched=0, unmatched=0;
var matchDetail=[];
loremArticles.forEach(function(a){
  var asins={};
  var m;
  while((m=asinRe.exec(a.content))!==null){asins[m[1]]=true;}
  var asinArr=Object.keys(asins);
  var found=asinArr.filter(function(x){return have.indexOf(x)!==-1;});
  if(found.length>0){matched++;matchDetail.push({slug:a.slug,found:found});}
  else{unmatched++;}
});
console.log('Articles matchable to existing product images: '+matched);
console.log('Articles NOT matchable (no product image available): '+unmatched);

// How many loremflickr images total per article (sample)
var totalLoremImgs=0;
loremArticles.forEach(function(a){
  var imgs=a.content.match(/loremflickr\.com\/[^"'\s)]+/g)||[];
  totalLoremImgs+=imgs.length;
});
console.log('Total loremflickr <img> occurrences: '+totalLoremImgs);
console.log('Avg per article: '+(totalLoremImgs/loremArticles.length).toFixed(1));
