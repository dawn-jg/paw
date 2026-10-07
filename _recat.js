/**
 * 依据真实商品名，重建 known-good-asins.json 的类目归属。
 * - 按关键词规则给每个 ASIN 分配类目（可多归属）
 * - 与宠物无关 / 无法匹配的条目直接剔除
 * - 打印 移动 / 剔除 / 保留 明细，供人工复核
 *
 * 用法：node _recat.js [--write]
 */
const fs = require('fs');
const path = require('path');

const NAMES_FILE = 'asin-names.json';
const POOL_FILE = 'known-good-asins.json';
const WRITE = process.argv.includes('--write');

const names = JSON.parse(fs.readFileSync(NAMES_FILE, 'utf8'));
const oldPool = JSON.parse(fs.readFileSync(POOL_FILE, 'utf8'));

const RULES = [
  ['Dogs', /\bdogs?\b|canine|puppy|\bk9\b|leash|dental chew|orthopedic|dog bed|dog crate|dog food|dog treat|puppy pad/i],
  ['Cats', /\bcats?\b|feline|kitten|cat litter|litter box|scratching post|catnip|cat tree|cat toy|cat cave|litter/i],
  ['Birds', /\bbirds?\b|birdcage|bird cage|parrot|cockatiel|parakeet|budgie|finch|aviary|conure|lovebird|canary/i],
  ['Reptiles', /reptile|terrarium|gecko|snake|bearded dragon|tortoise|turtle|iguana|chameleon|vivarium|basking|uvb|heat lamp|ball python|leopard gecko|crested|arboreal|temperature controller|thermostat outlet/i],
  ['Fish', /aquarium|fish tank|fish filter|canister filter|water test|\btds\b|nitrate|nitrite|ammonia|\bph test\b|kh test|aquarium salt|power filter|hang on back|hob filter|filter media|filter pads|algae|water conditioner|submersible|biOrb|betta|goldfish|koi|phosphate remover/i],
  ['Small Pets', /hamster|rabbit|guinea pig|small animal|chinchilla|gerbil|ferret|timothy|\bhay\b|hutch|playpen/i],
];

function classify(name) {
  return RULES.filter(([, re]) => re.test(name)).map(([c]) => c);
}

// 人工覆盖（商品名含歧义词 / 规则误判时使用）
const OVERRIDE = {
  // 例：'B0XXXXXXX': ['Reptiles'],
};

const allAsins = new Set();
Object.values(oldPool).forEach(a => a.forEach(x => allAsins.add(x)));

const moved = [], dropped = [], kept = [], noName = [];
const newPool = {};
Object.keys(oldPool).forEach(c => { newPool[c] = []; });

allAsins.forEach(asin => {
  const name = names[asin];
  if (!name) { noName.push(asin); return; }
  const oldCats = Object.keys(oldPool).filter(c => oldPool[c].indexOf(asin) !== -1);
  const cats = OVERRIDE[asin] || classify(name);
  if (!cats.length) { dropped.push({ asin, name, oldCats }); return; }
  cats.forEach(c => { if (newPool[c].indexOf(asin) === -1) newPool[c].push(asin); });
  const same = oldCats.length === cats.length && oldCats.every(c => cats.indexOf(c) !== -1);
  (same ? kept : moved).push({ asin, name, oldCats, cats });
});

console.log('=== 剔除（与宠物无关 / 无法归类）：' + dropped.length + ' ===');
dropped.forEach(d => console.log('  ✗ ' + d.asin + '  ' + d.name.slice(0, 80) + '   [原: ' + d.oldCats.join(',') + ']'));

console.log('\n=== 类目调整：' + moved.length + ' ===');
moved.forEach(m => console.log('  ~ ' + m.asin + '  ' + m.oldCats.join(',') + ' -> ' + m.cats.join(',') + '   ' + m.name.slice(0, 70)));

console.log('\n=== 归属不变：' + kept.length + ' ===');

if (noName.length) console.log('\n=== 无商品名（需补抓）：' + noName.length + ' -> ' + noName.join(' ') + ' ===');

console.log('\n=== 新池规模 ===');
Object.keys(newPool).forEach(c => console.log('  ' + c + ': ' + newPool[c].length));

if (WRITE) {
  fs.writeFileSync(POOL_FILE + '.new', JSON.stringify(newPool, null, 2) + '\n', 'utf8');
  console.log('\n已写入 ' + POOL_FILE + '.new（未覆盖原文件）');
}
