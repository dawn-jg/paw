var https=require('https');
var asin='B0CLGPX16G';
var pageUrl='https://www.amazon.com/dp/'+asin;
function get(url,headers){
  return new Promise(function(res){
    var req=https.get(url,{timeout:10000,headers:headers},function(r){
      var data='';r.on('data',function(c){data+=c;});r.on('end',function(){res({status:r.statusCode,body:data,ct:r.headers['content-type']});});
    });
    req.on('timeout',function(){req.destroy();res({status:'TIMEOUT'});});
    req.on('error',function(e){res({status:'ERR '+e.code});});
  });
}
(async function(){
  var hdrs={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36','Accept-Language':'en-US,en;q=0.9'};
  var pg=await get(pageUrl,hdrs);
  console.log('PAGE status: '+pg.status+' len='+(pg.body?pg.body.length:0)+' ct='+(pg.ct||''));
  if(pg.status===200 && pg.body){
    var m=pg.body.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
         || pg.body.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if(m){console.log('og:image = '+m[1]);
      var img=await get(m[1],hdrs);
      console.log('IMAGE status: '+img.status+' ct='+(img.ct||'')+' len='+(img.body?img.body.length:0));
    } else {
      console.log('No og:image found. Body snippet:');
      console.log(pg.body.substring(0,300));
    }
  } else if(pg.body){
    console.log('Body snippet: '+pg.body.substring(0,300));
  }
})();
