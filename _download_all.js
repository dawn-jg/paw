var https=require('https');
var fs=require('fs');
var missing=JSON.parse(fs.readFileSync('D:/pawcritic-next/_missing_asins.json','utf8'));
var dir='D:/pawcritic-next/public/images/products/';
function get(url,headers){
  return new Promise(function(res){
    var req=https.get(url,{timeout:12000,headers:headers},function(r){
      var chunks=[];r.on('data',function(c){chunks.push(c);});r.on('end',function(){res({status:r.statusCode,ct:r.headers['content-type'],buf:Buffer.concat(chunks)});});
    });
    req.on('timeout',function(){req.destroy();res({status:'TIMEOUT'});});
    req.on('error',function(e){res({status:'ERR '+e.code});});
  });
}
function extract(body,asin){
  var m=body.match(/data-a-dynamic-image="([^"]+)"/i);
  if(m){
    try{var obj=JSON.parse(m[1].replace(/&quot;/g,'"'));var keys=Object.keys(obj);
      if(keys.length)return keys.sort(function(a,b){return obj[b][0]-obj[a][0];})[0];
    }catch(e){}
  }
  var lm=body.match(/id="landingImage"[^>]+src="([^"]+)"/i);
  if(lm)return lm[1];
  var all=body.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[^"'\s]+/g);
  if(all&&all.length)return all[0];
  return null;
}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
(async function(){
  var hdrs={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36','Accept-Language':'en-US,en;q=0.9'};
  var ok=0,skip=0,fail=[];
  for(var i=0;i<missing.length;i++){
    var asin=missing[i];
    if(fs.existsSync(dir+asin+'.jpg')){console.log(asin+' already exists, skip');continue;}
    try{
      var pg=await get('https://www.amazon.com/dp/'+asin,hdrs);
      if(pg.status!==200){console.log(asin+' page '+pg.status+' SKIP');skip++;await sleep(800);continue;}
      var url=extract(pg.buf.toString('utf8'),asin);
      if(!url){console.log(asin+' no img url SKIP');skip++;await sleep(800);continue;}
      var img=await get(url,hdrs);
      if(img.status===200&&img.buf&&img.buf.length>2000&&((img.ct||'').indexOf('image')!==-1||(img.buf[0]===0xFF&&img.buf[1]===0xD8))){
        fs.writeFileSync(dir+asin+'.jpg',img.buf);ok++;console.log(asin+' OK ('+img.buf.length+'b) ['+(i+1)+'/'+missing.length+']');
      }else{console.log(asin+' img '+img.status+' SKIP');skip++;fail.push(asin);}
    }catch(e){console.log(asin+' ERR '+e.message);skip++;fail.push(asin);}
    await sleep(1200);
  }
  console.log('=== DONE ok='+ok+' skip='+skip+' ===');
  console.log('Failed/skipped ASINs: '+fail.join(', '));
  fs.writeFileSync('D:/pawcritic-next/_dl_fail.json',JSON.stringify(fail));
})();
