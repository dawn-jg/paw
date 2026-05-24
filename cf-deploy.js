// Cloudflare Pages direct upload using API
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ACCOUNT_ID = '8f8a634cf513b18815c7889124088b0f';
const PROJECT_NAME = 'pawcritic';
const BUILD_DIR = path.join(__dirname, 'out');
const OAUTH_TOKEN = 'N21oWdFFkvAkpNKypQzhNLvZQQm2Mk9a08yOJzLvIe8.gzTvpP2X-e5jjBMWxfRasKCmNB2QHwPgIucPa5zbNGg';

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.cloudflare.com/client/v4${urlPath}`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${OAUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error(`Parse error: ${data.substring(0,200)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function uploadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const content = fs.readFileSync(filePath);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': content.length,
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ success: false, error: e.message, raw: data.substring(0,200) }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Upload timeout')); });
    req.write(content);
    req.end();
  });
}

async function main() {
  console.log('Step 1: Getting upload token...');
  const tokenRes = await api('GET', `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/upload-token`);
  if (!tokenRes.success) {
    console.error('Failed to get upload token:', tokenRes.errors);
    process.exit(1);
  }
  const jwt = tokenRes.result.jwt;
  console.log('Got upload token');

  // Gather all files
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else files.push(fullPath);
    }
  }
  walk(BUILD_DIR);
  console.log(`Step 2: Found ${files.length} files to upload`);

  // Generate manifest
  const manifest = {};
  for (const filePath of files) {
    const relPath = path.relative(BUILD_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    manifest[relPath] = hash;
  }

  // Upload in batches of 50
  const BATCH_SIZE = 50;
  let uploaded = 0;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const body = {};
    for (const filePath of batch) {
      const relPath = path.relative(BUILD_DIR, filePath).replace(/\\/g, '/');
      body[relPath] = fs.readFileSync(filePath).toString('base64');
    }
    
    console.log(`Uploading batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(files.length/BATCH_SIZE)} (${batch.length} files)...`);
    
    try {
      const res = await uploadFile(
        `https://api.cloudflare.com/client/v4/pages/assets/upload?account_id=${ACCOUNT_ID}`,
        null // We'll need to pass the body differently
      );
      console.log(`Upload result:`, res);
    } catch(e) {
      console.error(`Upload error: ${e.message}`);
      // Try one at a time
      console.log('Trying one-at-a-time upload...');
      for (const filePath of batch) {
        // ... fallback
      }
    }
    uploaded += batch.length;
  }

  // Step 3: Create deployment with manifest
  console.log('Step 3: Creating deployment...');
  const deployRes = await api('POST', `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`, {
    manifest: manifest,
    branch: 'main'
  });
  
  if (deployRes.success) {
    console.log('Deployment created successfully!');
    console.log(`URL: https://${deployRes.result.url || 'pawcritic.pages.dev'}`);
    console.log(`Deployment ID: ${deployRes.result.id}`);
  } else {
    console.error('Deployment failed:', JSON.stringify(deployRes.errors, null, 2));
  }
}

main().catch(console.error);
