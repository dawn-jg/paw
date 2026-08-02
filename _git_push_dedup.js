var {execSync}=require('child_process');
var fs=require('fs');
var cwd='D:/pawcritic-next';
var self=cwd+'/_git_push_dedup.js';

execSync('git add -A',{cwd,stdio:'inherit'});
execSync('git commit -m "fix: remove 8 duplicate-title articles, backfill 24 missing charCount"',{cwd,stdio:'inherit'});
execSync('git push origin main',{cwd,stdio:'inherit'});

// cleanup temp scripts
['_audit.js','_audit_dup.js','_dedup.js','_git_push_dedup.js'].forEach(function(f){
  try{fs.unlinkSync(cwd+'/'+f)}catch(e){}
});
console.log('DONE');
