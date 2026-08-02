var fs=require('fs');
var p=JSON.parse(fs.readFileSync('D:/pawcritic-next/src/data/posts.json','utf8'));
var issues=[];

// 1. Duplicate slugs
var slugCount={};
p.forEach(function(a){slugCount[a.slug]=(slugCount[a.slug]||0)+1});
Object.keys(slugCount).filter(function(k){return slugCount[k]>1}).forEach(function(k){issues.push({t:'DUP_SLUG',s:k,c:slugCount[k]})});

// 2. Missing/empty fields
p.forEach(function(a){
  if(!a.description||!a.description.trim())issues.push({t:'MISSING_DESC',s:a.slug});
  if(!a.content||!a.content.trim())issues.push({t:'MISSING_CONTENT',s:a.slug});
  if(a.content&&a.content.length<800)issues.push({t:'SHORT_CONTENT',s:a.slug,l:a.content.length});
  if(a.title&&a.title.includes('&amp;'))issues.push({t:'HTML_ENTITY',s:a.slug});
  if(a.charCount===undefined)issues.push({t:'MISSING_CHARCOUNT',s:a.slug});
});

// 3. loremflickr images
p.forEach(function(a){
  if(a.content&&a.content.includes('loremflickr'))issues.push({t:'LOREMFLICKR_IMG',s:a.slug});
});

// 4. picsum images
p.forEach(function(a){
  if(a.content&&a.content.includes('picsum.photos'))issues.push({t:'PICSUM_IMG',s:a.slug});
});

// 5. Duplicate titles
var titleCount={};
p.forEach(function(a){titleCount[a.title]=(titleCount[a.title]||[]);titleCount[a.title].push(a.slug)});
Object.keys(titleCount).filter(function(k){return titleCount[k].length>1}).forEach(function(k){issues.push({t:'DUP_TITLE',title:k,slugs:titleCount[k].join(', ')})});

console.log('Total issues: '+issues.length);

// Group by type
var byType={};
issues.forEach(function(i){byType[i.t]=(byType[i.t]||[]);byType[i.t].push(i)});

Object.keys(byType).sort().forEach(function(t){
  console.log('\n['+t+'] '+byType[t].length+':');
  byType[t].slice(0,15).forEach(function(i){
    if(i.t==='DUP_TITLE'){console.log('  TITLE: '+i.title);console.log('  SLUGS: '+i.slugs);}
    else{console.log('  '+(i.s||i.title||'')+(i.l?' len='+i.l:'')+(i.c?' count='+i.c:''))}
  });
  if(byType[t].length>15)console.log('  ... and '+(byType[t].length-15)+' more');
});
