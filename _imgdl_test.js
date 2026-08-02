var https=require('https');
var fs=require('fs');
var asin='B0CLGPX16G';
var pageUrl='https://www.amazon.com/dp/'+asin;
var out='D:/pawcritic-next/public/images/products/'+asin+'.jpg';
function get(url,headers,bin){
  return new Promise(function(res){
    var req=https.get(url,{timeout:12000,headers:headers},function(r){
      var chunks=[];r.on('data',function(c){chunks.push(c);});r.on('end',function(){
        var buf=Buffer.concat(chunks);
        res({status:r.statusCode,ct:r.headers['content-type'],buf:buf});
      });
    });
    req.on('timeout',function(){req.destroy();res({status:'TIMEOUT'});});
    req.on('error',function(e){res({status:'ERR '+e.code});});
  });
}
function extractImgUrl(body){
  var m=body.match(/id="landingImage"[^>]+src="([^"]+)"/i)
      || body.match(/data-a-dynamic-image="([^"]+)"/i)
      || body.match(/<img[^>]+id="imgBlkFront"[^>]+src="([^"]+)"/i);
  if(m){
    var raw=m[1];
    if(raw.indexOf('data-a-dynamic-image')!==-1 || raw.indexOf('media-amazon')!==-1 && raw.indexOf('&quot;')!==-1){
      try{var obj=JSON.parse(raw.replace(/&quot;/g,'"'));var keys=Object.keys(obj);return keys.sort(function(a,b){return obj[b][0]-obj[a][0];})[0];}catch(e){}
    }
    return raw;
  }
  var all=body.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[^"'\s]+/g);
  if(all&&all.length)return all[0];
  return null;
}
(async function(){
  var hdrs={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36','Accept-Language':'en-US,en;q=0.9'};
  var pg=await get(pageUrl,hdrs);
  console.log('PAGE: '+pg.status+' len='+(pg.buf?pg.buf.length:0));
  if(pg.status!==200){console.log('FAILED');return;}
  var url=extractImgUrl(pg.buf.toString('utf8'));
  console.log('IMG URL: '+(url||'NONE'));
  if(!url){fs.writeFileSync('D:/pawcritic-next/_pagedump.html',pg.buf);console.log('dumped page');return;}
  var img=await get(url,hdrs);
  console.log('IMG: '+img.status+' ct='+(img.ct||'')+' bytes='+(img.buf?img.buf.length:0));
  if(img.status===200 && img.buf && img.buf.length>1000){
    fs.writeFileSync(out,img.buf);
    console.log('SAVED '+out);
  }
})();
