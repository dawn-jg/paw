const https = require('https');

// Known working Amazon product image patterns
// Main: https://m.media-amazon.com/images/I/XXXXX._AC_SS450_.jpg (or _SL1500_, _AC_SX679_)
async function fetchAmazonImageUrl(asin) {
  return new Promise((resolve, reject) => {
    const url = `https://www.amazon.com/dp/${asin}`;
    https.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    }, (res) => {
      if (res.statusCode === 404 || res.statusCode === 503) {
        resolve(null);
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Try different patterns for image URL
        const patterns = [
          /"hiRes":"([^"]+)"/,
          /data-old-hires="([^"]+)"/,
          /"large":"([^"]+)"/, 
          /"mainUrl":"([^"]+)"/,
          /https:\\\/\\\/m\.media-amazon\.com\\\/images\\\/I\\\/[^"]+_AC_SL[0-9]+_/
        ];
        
        for (const pat of patterns) {
          const match = data.match(pat);
          if (match) {
            resolve(match[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&'));
            return;
          }
        }
        
        // Fallback: try to find any media-amazon image URL
        const imgMatch = data.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9]+\._AC_SL[0-9]+_\.jpg/);
        if (imgMatch) {
          resolve(imgMatch[0]);
          return;
        }
        
        resolve(null);
      });
    }).on('error', (e) => {
      resolve(null);
    }).on('timeout', function() { this.destroy(); resolve(null); });
  });
}

async function main() {
  const asins = ['B0002DJ9OS', 'B00NLEJWN8', 'B0CBPJNF1G', 'B0FX2JZ536', 'B07JH4JHTC'];
  for (const asin of asins) {
    console.log(`Fetching ${asin}...`);
    const url = await fetchAmazonImageUrl(asin);
    if (url) {
      console.log(`  ✅ ${url.substring(0, 120)}`);
    } else {
      console.log(`  ❌ No image found`);
    }
  }
}

main().catch(console.error);
