var https=require('https');
function test(name,url){
  return new Promise(function(res){
    var req=https.get(url,{timeout:8000,headers:{'User-Agent':'Mozilla/5.0'}},function(r){
      var len=0;r.on('data',function(c){len+=c.length});r.on('end',function(){res(name+' => status '+r.statusCode+' bytes '+len);});
    });
    req.on('timeout',function(){req.destroy();res(name+' => TIMEOUT');});
    req.on('error',function(e){res(name+' => ERR '+e.code+' '+e.message);});
  });
}
(async function(){
  console.log(await test('example.com','https://example.com'));
  console.log(await test('amazon-image','https://m.media-amazon.com/images/I/B0CLGPX16G.jpg'));
  console.log(await test('amazon-paapi-host','https://webservices.amazon.com/paapi5/searchitems'));
  console.log(await test('picsum','https://picsum.photos/seed/test/600/400'));
})();
