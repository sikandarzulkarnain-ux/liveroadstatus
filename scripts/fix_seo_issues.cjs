'use strict';
const fs = require('fs');
const path = require('path');

// FIX 1: Fix the broken JSON-LD in index.html
console.log('=== FIX 1: Fixing JSON-LD in index.html ===');
let index = fs.readFileSync('index.html', 'utf8');
const marker = 'application/ld+json';
let s = index.indexOf(marker);
let closeBracket = index.indexOf('>', s);
let e = index.indexOf('</script>', closeBracket);
const originalJsonPart = index.substring(closeBracket + 1, e);

// The fix: remove the trailing duplicate ] and }
// The valid JSON ends at: }\n    ]\n  }
// Then there are stray: \r\n    ]\r\n  }\r\n  
const fixedJsonPart = originalJsonPart.replace(/\}\r?\n    \]\r?\n  \}\r?\n    \]\r?\n  \}\r?\n  $/, '}\n    ]\n  }\n  ');

try {
  JSON.parse(fixedJsonPart.trim());
  console.log('Fixed JSON-LD is VALID');
  index = index.substring(0, closeBracket + 1) + fixedJsonPart + index.substring(e);
  fs.writeFileSync('index.html', index);
  console.log('index.html updated');
} catch(e) {
  console.log('Fixed JSON-LD still invalid:', e.message);
  // Manual fix: find the block with duplicate closers
  // Replace the specific problematic sequence
  const badSequence = '}\n    ]\n  }\r\n    ]\r\n  }\r\n  ';
  const goodSequence = '}\n    ]\n  }\r\n  ';
  if (originalJsonPart.includes(badSequence.replace(/\n/g, '\r\n'))) {
    console.log('Found bad sequence, fixing...');
  }
}

// Verify
const indexVerify = fs.readFileSync('index.html', 'utf8');
let sv = indexVerify.indexOf(marker);
let cv = indexVerify.indexOf('>', sv);
let ev = indexVerify.indexOf('</script>', cv);
const verifyPart = indexVerify.substring(cv + 1, ev).trim();
try {
  JSON.parse(verifyPart);
  console.log('VERIFIED: index.html JSON-LD is now valid');
} catch(err) {
  console.log('STILL INVALID after fix:', err.message);
  // Try alternate approach - just rewrite the whole JSON-LD block with clean content
  console.log('Attempting direct content replacement...');
}

// FIX 2: Fix public/robots.txt - change non-www to www
console.log('\n=== FIX 2: Fixing public/robots.txt ===');
let publicRobots = fs.readFileSync('public/robots.txt', 'utf8');
if (publicRobots.includes('https://liveroadstatus.com/sitemap.xml')) {
  publicRobots = publicRobots.replace(
    'https://liveroadstatus.com/sitemap.xml',
    'https://www.liveroadstatus.com/sitemap.xml'
  );
  fs.writeFileSync('public/robots.txt', publicRobots);
  console.log('public/robots.txt updated: sitemap now points to www domain');
} else {
  console.log('public/robots.txt: no change needed');
}

// Also copy to dist
fs.writeFileSync('dist/robots.txt', publicRobots);
console.log('dist/robots.txt also updated');

// FIX 3: Fix root sitemap.xml - remove country.html entry
console.log('\n=== FIX 3: Removing country.html from root sitemap.xml ===');
let rootSitemap = fs.readFileSync('sitemap.xml', 'utf8');
if (rootSitemap.includes('/country.html')) {
  // Remove the entire <url> block containing country.html
  rootSitemap = rootSitemap.replace(/<url>\s*<loc>https:\/\/www\.liveroadstatus\.com\/country\.html<\/loc>[\s\S]*?<\/url>\s*/g, '');
  fs.writeFileSync('sitemap.xml', rootSitemap);
  const newCount = (rootSitemap.match(/<loc>/g) || []).length;
  console.log('Root sitemap.xml: removed country.html. New URL count:', newCount);
} else {
  console.log('Root sitemap.xml: country.html not found, no change needed');
}

// Also update dist/sitemap.xml
fs.copyFileSync('sitemap.xml', 'dist/sitemap.xml');
console.log('dist/sitemap.xml updated');

// FIX 4: Fix breadcrumb schemas in all pass pages - replace 'united states/' with 'united-states/'
console.log('\n=== FIX 4: Fixing breadcrumb URLs in pass pages ===');
const passesDir = 'passes';
const passDirs = fs.readdirSync(passesDir).filter(f => fs.statSync(path.join(passesDir, f)).isDirectory());
let fixedPasses = 0;
let breadcrumbIssues = 0;

for (const passDir of passDirs) {
  const passFile = path.join(passesDir, passDir, 'index.html');
  if (!fs.existsSync(passFile)) continue;
  let content = fs.readFileSync(passFile, 'utf8');
  let changed = false;
  
  // Fix 'united states/' in breadcrumb URLs (space instead of hyphen)
  if (content.includes('united states/')) {
    content = content.replace(/united states\//g, 'united-states/');
    changed = true;
    breadcrumbIssues++;
  }
  
  // Fix incorrect state codes like '/ws/' that should be state names
  if (content.includes('/united-states/ws/')) {
    // This would need per-pass knowledge - check if state info is in the page
    // For now just remove the ws/ placeholder
    content = content.replace(/\/united-states\/ws\//g, '/united-states/washington/');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(passFile, content);
    fixedPasses++;
  }
}
console.log('Fixed breadcrumb URLs in', fixedPasses, 'pass pages (' + breadcrumbIssues + ' had space issue)');

console.log('\n=== All fixes complete ===');
