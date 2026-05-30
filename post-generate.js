#!/usr/bin/env node
/**
 * post-generate.js — Run AFTER cron generates new articles.
 * - Injects loremflickr images into image-less articles
 * - Rebuilds categories.json and latest.json
 * 
 * Usage: node post-generate.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;

console.log('=== Post-Generation Pipeline ===\n');

// Step 1: Fix images + Amazon links for new articles
console.log('[1/3] Running fix-all.js (images, author, Amazon links)...');
execSync('node fix-all.js', { cwd: ROOT, stdio: 'inherit' });

// Step 2: Rebuild data files
console.log('\n[2/3] Running rebuild-data.js...');
execSync('node rebuild-data.js', { cwd: ROOT, stdio: 'inherit' });

// Step 3: Build site
console.log('\n[3/3] Building site...');
execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

console.log('\n=== Done! Push to GitHub to trigger CF Pages deployment ===');
console.log('Run: git add src/data/posts.json src/data/categories.json src/data/latest.json');
console.log('     git commit -m "New articles with images"');
console.log('     git push origin main');
