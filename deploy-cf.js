// Cloudflare Pages direct API deploy - reliable batch upload
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ACCOUNT_ID = '8f8a634cf513b18815c7889124088b0f';
const PROJECT_NAME = 'pawcritic';
const BUILD_DIR = path.join(__dirname, 'out');
const OAUTH_TOKEN = 'N21oWdFFkvAkpNKypQzhNLvZQQm2Mk9a08yOJzLvIe8.gzTvpP2X-e5jjBMWxfRasKCmNB2QHwPgIucPa5zbNGg';

function api(method, urlPath, body, raw) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.cloudflare.com/client/v4${urlPath}`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Authorization': `Bearer ${OAUTH_TOKEN}` },
      timeout: 60000,
    };
    if (body && !raw) {
      options.headers['Content-Type'] = 'application/json';
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (raw) return resolve(data);
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error(`Parse: ${data.substring(0,200)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(raw ? body : JSON.stringify(body));
    req.end();
  });
}

async function uploadForm(urlPath, files) {
  // Use multipart/form-data for file uploads
  const boundary = '----boundary' + Date.now();
  let body = Buffer.from('');
  
  for (const [relPath, content] of Object.entries(files)) {
    const header = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="${relPath}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
    body = Buffer.concat([body, Buffer.from(header), content]);
  }
  body = Buffer.concat([body, Buffer.from(`\r\n--${boundary}--\r\n`)]);

  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.cloudflare.com/client/v4${urlPath}`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OAUTH_TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
      timeout: 120000,
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ success: false, error: e.message }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== CF Direct Deploy ===');
  
  // Gather files
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) walk(fp);
      else files.push(fp);
    }
  }
  walk(BUILD_DIR);
  console.log(`Files: ${files.length}`);

  // Build manifest
  const manifest = {};
  const fileData = {};
  for (const fp of files) {
    const rp = path.relative(BUILD_DIR, fp).replace(/\\/g, '/');
    const buf = fs.readFileSync(fp);
    manifest[rp] = crypto.createHash('sha256').update(buf).digest('hex');
    fileData[rp] = buf;
  }

  // Upload in batches of 30
  const entries = Object.entries(fileData);
  const BATCH = 30;
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = Object.fromEntries(entries.slice(i, i + BATCH));
    console.log(`Uploading batch ${Math.floor(i/BATCH)+1}/${Math.ceil(entries.length/BATCH)}...`);
    
    let retries = 3;
    while (retries > 0) {
      try {
        const r = await api('POST', `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/upload`, {
          headers: { 'Content-Type': 'application/json' }
        }, null);
        // Actually use the real upload endpoint
        const result = await uploadForm(
          `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/upload`, 
          batch
        );
        if (result.success) {
          console.log(`  OK (${Object.keys(batch).length} files)`);
          break;
        } else {
          console.log(`  Retry ${retries}: ${JSON.stringify(result.errors || result)}`);
          retries--;
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch(e) {
        console.log(`  Error: ${e.message}, retries left: ${retries-1}`);
        retries--;
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  // Create deployment
  console.log('Creating deployment...');
  const result = await api('POST', `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`, {
    manifest: manifest,
    branch: 'main'
  });

  if (result.success) {
    console.log(`\n✅ Deployed!`);
    console.log(`   Deploy ID: ${result.result.id}`);
    console.log(`   URL: https://pawcritic.pages.dev`);
  } else {
    console.error(`\n❌ Failed:`, JSON.stringify(result.errors, null, 2));
  }
}

main().catch(console.error);
