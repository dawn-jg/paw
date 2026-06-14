const posts = require("D:\\pawcritic-next\\src\\data\\posts.json");
const have = posts.filter(x => "charCount" in x);
console.log("Articles WITH charCount:", have.length);
const oldest = posts.filter(x => "charCount" in x).reverse();
oldest.slice(0,3).forEach(x => console.log(x.date + " | charCount=" + x.charCount + " | " + (x.slug||"").substr(0,60)));
console.log("---");
const missing = posts.filter(x => !("charCount" in x));
console.log("Articles WITHOUT charCount:", missing.length);
// Show by date
const byDate = {};
missing.forEach(x => { const d = x.date||"nodate"; if(!byDate[d]) byDate[d]=0; byDate[d]++; });
Object.keys(byDate).sort().forEach(d => console.log("  " + d + ": " + byDate[d] + " missing"));
