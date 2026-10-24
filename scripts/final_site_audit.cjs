const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log('--- EXECUTING PHASE 7 AUTOMATED QUALITY AUDIT ---');

const titles = new Map();
const descriptions = new Map();
let duplicateTitles = 0;
let duplicateDesc = 0;
let missingCanonical = [];
let missingH1 = [];
let missingAlt = [];
let brokenInternalLinks = [];

const allKnownPaths = new Set(htmlFiles.map(f => '/' + f));
htmlFiles.forEach(f => {
  allKnownPaths.add('/' + f.replace(/\.html$/, '/'));
});

// Add all generated pass pages
const passes = require('../src/data/passes.json');
passes.forEach(p => {
  allKnownPaths.add(`/passes/${p.slug}/`);
});

// Add clean routes
['about', 'methodology', 'contact', 'privacy', 'terms', 'disclaimer'].forEach(p => {
  allKnownPaths.add(`/${p}/`);
});

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(root, file), 'utf8');

  // Title check
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) {
    const t = titleMatch[1].trim();
    if (titles.has(t)) {
      titles.get(t).push(file);
      duplicateTitles++;
    } else {
      titles.set(t, [file]);
    }
  }

  // Meta description check
  const metaMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (metaMatch) {
    const d = metaMatch[1].trim();
    if (descriptions.has(d)) {
      descriptions.get(d).push(file);
      duplicateDesc++;
    } else {
      descriptions.set(d, [file]);
    }
  }

  // Canonical tag check
  if (!content.includes('rel="canonical"') && !content.includes("rel='canonical'")) {
    missingCanonical.push(file);
  }

  // H1 tag check
  const h1Match = content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match || !h1Match[1].trim()) {
    missingH1.push(file);
  }

  // Alt text check on images
  const imgs = content.match(/<img\b[^>]*>/gi) || [];
  imgs.forEach(img => {
    if (!/alt=["'][^"']+["']/i.test(img)) {
      missingAlt.push({ file, img });
    }
  });
});

console.log('Total root HTML files scanned:', htmlFiles.length);
console.log('Duplicate titles detected:', duplicateTitles);
console.log('Duplicate descriptions detected:', duplicateDesc);
console.log('Pages missing canonical:', missingCanonical.length, missingCanonical);
console.log('Pages missing H1:', missingH1.length, missingH1);
console.log('Images missing alt text:', missingAlt.length);

if (missingCanonical.length === 0 && missingH1.length === 0 && missingAlt.length === 0) {
  console.log('✅ ALL PAGES COMPLY 100% WITH CANONICAL, H1, AND ACCESSIBLE ALT TEXT RULES!');
}
