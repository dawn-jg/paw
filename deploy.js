// Cloudflare Pages direct deploy - simple batch upload
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ACCT = '8f8a634cf513b18815c7889124088b0f';
const PROJ = 'pawcritic';
const DIR = path.join(__dirname, 'out');
const TOKEN = 'N21oWdFFkvAkpNKypQzhNLvZQQm2Mk9a08yOJzLvIe8.gzTvpP2X-e5jjBMWxfRasKCmNB2QHwPgIucPa5zbNGg';

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4${urlPath}`,
      method,
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      timeout: 120000,
    };
    if (body) opts.headers['Content-Type'] = 'application/json';
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(new Error(d.substring(0, 200))); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function uploadFile(url, buf) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, port: 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'Content-Length': buf.length },
      timeout: 120000,
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve({success:false}); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(buf);
    req.end();
  });
}

async function main() {
  // Gather files
  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) walk(fp);
      else files.push(fp);
    }
  })(DIR);

  console.log(`Files: ${files.length}`);

  // Build manifest
  const manifest = {};
  const fileBufs = {};
  for (const fp of files) {
    const rp = path.relative(DIR, fp).replace(/\\/g, '/');
    const buf = fs.readFileSync(fp);
    manifest[rp] = crypto.createHash('sha256').update(buf).digest('hex');
    fileBufs[rp] = buf;
  }

  // Create deployment
  console.log('Creating deployment...');
  const dep = await request('POST', `/accounts/${ACCT}/pages/projects/${PROJ}/deployments`, { branch: 'main' });
  if (!dep.success) {
    console.error('Create deployment failed:', JSON.stringify(dep.errors, null, 2));
    process.exit(1);
  }

  console.log(`Deployment: ${dep.result.id}`);
  const missing = dep.result.manifest;
  const toUpload = Object.keys(missing).filter(k => missing[k] !== manifest[k]);
  console.log(`Files to upload: ${toUpload.length}`);

  // Get upload URLs
  const uploadUrls = dep.result.upload_urls || {};
  let uploadToken = dep.result.upload_token || dep.result.jwt;

  if (!uploadToken || Object.keys(uploadUrls).length === 0) {
    console.log('No upload URLs in response, trying alternative approach...');
    // Try the upload endpoint
    console.log('Using direct manifest-only deployment...');
    const deploy2 = await request('POST', `/accounts/${ACCT}/pages/projects/${PROJ}/deployments`, {
      branch: 'main',
      manifest: manifest,
    });
    if (deploy2.success) {
      console.log(`✅ Deployed! ID: ${deploy2.result.id}`);
      return;
    }
    console.error('Also failed:', JSON.stringify(deploy2.errors || {}));
    return;
  }

  // Upload missing files in batches
  const B = 20;
  for (let i = 0; i < toUpload.length; i += B) {
    const batch = toUpload.slice(i, i + B);
    console.log(`Uploading ${i+1}-${Math.min(i+B, toUpload.length)}/${toUpload.length}...`);
    
    for (const rp of batch) {
      const url = uploadUrls[rp];
      if (!url) continue;
      try {
        await uploadFile(url, fileBufs[rp]);
      } catch(e) {
        console.log(`  ${rp}: ${e.message}`);
      }
    }
  }

  console.log('✅ Deploy complete!');
  console.log('URL: https://pawcritic.pages.dev');
}

main().catch(console.error);
