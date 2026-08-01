const {execSync}=require('child_process'),fs=require('fs'),cwd='D:/pawcritic-next',self=cwd+'/_cleanup.js';
execSync('git add -A',{cwd,stdio:'inherit'});
execSync('git commit -m "chore: remove temp script"',{cwd,stdio:'inherit'});
execSync('git push origin main',{cwd,stdio:'inherit'});
try{fs.unlinkSync(self)}catch(e){}
console.log('OK');
