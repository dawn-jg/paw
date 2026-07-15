var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:\\pawcritic-next\\src\\data\\posts.json','utf8'));
var n=p.slice(0,3);
n.forEach(function(a){
  var re=/amazon\.com\/dp\/([A-Z0-9]{10})/g;
  var asins=[];
  var m;
  while((m=re.exec(a.content))!==null){
    if(asins.indexOf(m[1])===-1) asins.push(m[1]);
  }
  console.log(a.slug);
  console.log('  ASINs ('+asins.length+'): '+asins.join(', '));
  console.log('  Content length: '+a.content.length);
});
