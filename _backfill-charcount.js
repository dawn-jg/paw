const fs = require("fs");
const filePath = "D:\\pawcritic-next\\src\\data\\posts.json";
const posts = JSON.parse(fs.readFileSync(filePath, "utf8"));

let filled = 0;
for (const p of posts) {
  if (!("charCount" in p) || typeof p.charCount !== "number") {
    p.charCount = (p.content || "").length;
    filled++;
  }
}
console.log("Filled charCount for: " + filled + " articles");

// Verify
const stillMissing = posts.filter(x => !("charCount" in x));
console.log("Still missing: " + stillMissing.length);

fs.writeFileSync(filePath, JSON.stringify(posts, null, 4), "utf8");
console.log("Saved!");
