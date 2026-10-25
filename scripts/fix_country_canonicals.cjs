'use strict';
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.liveroadstatus.com';

const countryDirs = ['usa', 'canada', 'france', 'italy', 'austria', 'switzerland', 'norway', 'india', 'pakistan', 'chile'];

console.log('=== FIXING CANONICAL TAGS ON ALL REGIONAL AND COUNTRY HUBS ===');

function fixCanonicalInHtml(filePath, expectedCanonical) {
  let content = fs.readFileSync(filePath, 'utf8');
  const canonicalTag = `<link rel="canonical" href="${expectedCanonical}">`;
  
  if (content.includes('rel="canonical"')) {
    content = content.replace(/<link[^>]*rel=["']canonical["'][^>]*href=["'][^"']*["'][^>]*>/i, canonicalTag);
    content = content.replace(/<link[^>]*href=["'][^"']*["'][^>]*rel=["']canonical["'][^>]*>/i, canonicalTag);
  } else {
    // Insert before </head> or after <title>
    if (content.includes('</head>')) {
      content = content.replace('</head>', `  ${canonicalTag}\n</head>`);
    } else if (content.includes('</title>')) {
      content = content.replace('</title>', `</title>\n  ${canonicalTag}`);
    }
  }

  // Also ensure trailing slash on canonical
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Fix Country hubs in root and dist
countryDirs.forEach(c => {
  const rootIndex = path.join(c, 'index.html');
  const expectedUrl = `${BASE}/${c}/`;
  if (fs.existsSync(rootIndex)) {
    fixCanonicalInHtml(rootIndex, expectedUrl);
    console.log(`Updated canonical for ${rootIndex} -> ${expectedUrl}`);
  }
  const distIndex = path.join('dist', c, 'index.html');
  if (fs.existsSync(distIndex)) {
    fixCanonicalInHtml(distIndex, expectedUrl);
    console.log(`Updated canonical for ${distIndex} -> ${expectedUrl}`);
  }

  // Sub-regions
  const subEntries = fs.readdirSync(c);
  subEntries.forEach(sub => {
    const subPath = path.join(c, sub);
    if (fs.statSync(subPath).isDirectory()) {
      const subIndex = path.join(subPath, 'index.html');
      const expectedSubUrl = `${BASE}/${c}/${sub}/`;
      if (fs.existsSync(subIndex)) {
        fixCanonicalInHtml(subIndex, expectedSubUrl);
      }
      const distSubIndex = path.join('dist', c, sub, 'index.html');
      if (fs.existsSync(distSubIndex)) {
        fixCanonicalInHtml(distSubIndex, expectedSubUrl);
      }
    }
  });
});

// 2. Remove obsolete dist/country directory to prevent duplicate pages
const distCountryDir = path.join('dist', 'country');
if (fs.existsSync(distCountryDir)) {
  fs.rmSync(distCountryDir, { recursive: true, force: true });
  console.log('Removed obsolete dist/country/ directory. Requests will be 301 redirected via _redirects.');
}

console.log('✅ All country and region canonicals updated successfully.');
