var {execSync}=require('child_process');
var fs=require('fs');
var cwd='D:/pawcritic-next';
execSync('git add -A',{cwd,stdio:'inherit'});
execSync('git commit -m "feat: download 23 real Amazon product images, replace all loremflickr/picsum with product images, fix broken refs"',{cwd,stdio:'inherit'});
execSync('git push origin main',{cwd,stdio:'inherit'});
['_nettest.js','_imgfmt.js','_ogimg.js','_imgdl_test.js','_collect_asins.js','_download_all.js','_upgrade_picsum.js','_verify_final.js','_fix_broken_refs.js','_git_push_final.js','_pagedump.html'].forEach(function(f){
  try{fs.unlinkSync(cwd+'/'+f)}catch(e){}
});
console.log('DONE');
