var https=require('https');
var asin='B0CLGPX16G';
var variants=[
 'https://images-na.ssl.images-amazon.com/images/I/'+asin+'.jpg',
 'https://images-na.ssl.images-amazon.com/images/I/'+asin+'._AC_.jpg',
 'https://images-na.ssl.images-amazon.com/images/I/'+asin+'._AC_SL300_.jpg',
 'https://m.media-amazon.com/images/I/'+asin+'._AC_.jpg',
 'https://m.media-amazon.com/images/I/'+asin+'._SL160_.jpg'
];
function test(name,url){
  return new Promise(function(res){
    var req=https.get(url,{timeout:8000,headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}},function(r){
      var len=0;r.on('data',function(c){len+=c.length});r.on('end',function(){
        res(name+' => '+r.statusCode+' type='+(r.headers['content-type']||'')+' bytes='+len);
      });
    });
    req.on('timeout',function(){req.destroy();res(name+' => TIMEOUT');});
    req.on('error',function(e){res(name+' => ERR '+e.code);});
  });
}
(async function(){
  for(var i=0;i<variants.length;i++){
    console.log(await test(variants[i],variants[i]));
  }
})();
