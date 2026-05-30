// Cloudflare Pages direct deploy using two-step API
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ACCT = '8f8a634cf513b18815c7889124088b0f';
const PROJ = 'paw2';
const DIR = path.join(__dirname, 'out');
const TOKEN = 'hIONc9WGIIr2buz2HuUIZCWwhRO8hjzTkJZ9U_-Cb9w.uChIsRP-xy6CofSzotMq0rN-SjjYn3eA80C2QWylskA';

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

async function main() {
  console.log(`Building file manifest from: ${DIR}`);
  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) walk(fp);
      else if (e.isFile()) files.push(fp);
    }
  })(DIR);

  console.log(`Files: ${files.length}`);

  // Build manifest (sha256 of each file)
  const manifest = {};
  const fileBufs = {};
  for (const fp of files) {
    const rp = path.relative(DIR, fp).replace(/\\/g, '/');
    const buf = fs.readFileSync(fp);
    manifest[rp] = crypto.createHash('sha256').update(buf).digest('hex');
    fileBufs[rp] = buf;
  }

  // Step 1: Create deployment draft
  console.log('Creating deployment draft...');
  const dep = await request('POST', `/accounts/${ACCT}/pages/projects/${PROJ}/deployments`, { branch: 'main' });
  if (!dep.success) {
    console.error('Create deployment failed:', JSON.stringify(dep.errors, null, 2));
    process.exit(1);
  }

  console.log(`Deployment ID: ${dep.result.id}`);

  // Check if we need to upload files
  const uploadUrls = dep.result.upload_urls || {};
  const jwt = dep.result.jwt || '';
  const requiredHash = dep.result.manifest || {};

  if (jwt && Object.keys(uploadUrls).length > 0) {
    // Two-step: upload files individually, then validate
    const toUpload = Object.keys(requiredHash).filter(k => requiredHash[k] !== manifest[k]);
    console.log(`Files to upload (two-step): ${toUpload.length}`);

    const B = 10;
    for (let i = 0; i < toUpload.length; i += B) {
      const batch = toUpload.slice(i, i + B);
      console.log(`Uploading ${i+1}-${Math.min(i+B, toUpload.length)}/${toUpload.length}...`);
      for (const rp of batch) {
        const url = uploadUrls[rp];
        if (!url) { console.log(`  ${rp}: no upload URL, skipping`); continue; }
        await uploadFile(url, fileBufs[rp], jwt, rp);
      }
    }

    console.log('Files uploaded. Deployment will auto-complete.');
    console.log('URL: https://paw2.pages.dev');
  } else {
    // One-step: upload everything with the deployment
    console.log('Using one-step manifest deployment...');
    const result = await request('POST', `/accounts/${ACCT}/pages/projects/${PROJ}/deployments`, {
      branch: 'main',
      manifest: manifest,
    });
    if (result.success) {
      console.log(`✅ Deployed! ID: ${result.result.id}`);
      console.log(`URL: ${result.result.url || 'https://paw2.pages.dev'}`);
    } else {
      console.error('Deployment failed:', JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }
  }
}

async function uploadFile(url, buf, jwt, fileName) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': buf.length,
      },
      timeout: 30000,
    };
    if (jwt) opts.headers['Authorization'] = `Bearer ${jwt}`;
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { resolve(true); });
    });
    req.on('error', (e) => { console.log(`  ${fileName}: ${e.message}`); resolve(false); });
    req.on('timeout', () => { req.destroy(); console.log(`  ${fileName}: timeout`); resolve(false); });
    req.write(buf);
    req.end();
  });
}

main().catch(console.error);
