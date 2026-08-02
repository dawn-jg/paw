var {execSync}=require('child_process');
var fs=require('fs');
var cwd='D:/pawcritic-next';
var self=cwd+'/_git_push_imgs.js';

execSync('git add -A',{cwd,stdio:'inherit'});
execSync('git commit -m "fix: replace 131 articles loremflickr imgs with 102 product images + 59 picsum seed"',{cwd,stdio:'inherit'});
execSync('git push origin main',{cwd,stdio:'inherit'});

['_analyze_imgs.js','_replace_imgs.js','_check_imgs.js','_check_broken.js','_git_push_imgs.js'].forEach(function(f){
  try{fs.unlinkSync(cwd+'/'+f)}catch(e){}
});
console.log('DONE');
