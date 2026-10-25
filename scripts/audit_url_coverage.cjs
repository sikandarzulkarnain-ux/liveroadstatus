'use strict';
/**
 * COMPREHENSIVE SITEMAP URL AUDIT AND FIX
 * Compare sitemap.xml URLs against actual dist directory structure
 * and fix all mismatches.
 */

const fs = require('fs');
const path = require('path');

// Read current sitemap
let sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const allLocs = sitemap.match(/<loc>([^<]+)<\/loc>/g) || [];
const allUrls = allLocs.map(l => l.replace(/<\/?loc>/g, '').replace('https://www.liveroadstatus.com', ''));

const BASE = 'https://www.liveroadstatus.com';

// Build inventory of actual pages from dist directory
function getActualPages(dir, urlPrefix) {
  const pages = [];
  if (!fs.existsSync(dir)) return pages;
  
  // Check if index.html exists at this level
  if (fs.existsSync(path.join(dir, 'index.html'))) {
    pages.push(urlPrefix + '/');
  }
  
  // Check subdirectories
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const entryPath = path.join(dir, entry);
      try {
        if (fs.statSync(entryPath).isDirectory()) {
          const subPages = getActualPages(entryPath, urlPrefix + '/' + entry);
          pages.push(...subPages);
        }
      } catch(e) {}
    }
  } catch(e) {}
  
  return pages;
}

// Build full inventory of country/state pages from dist
const actualPagesByPath = new Set();

// Country and state directories
const countryDirs = ['usa', 'canada', 'france', 'italy', 'austria', 'switzerland', 
                      'norway', 'india', 'pakistan', 'chile'];

for (const country of countryDirs) {
  const pages = getActualPages('dist/' + country, '/' + country);
  pages.forEach(p => actualPagesByPath.add(p));
}

// Other directories
const otherDirs = ['about', 'contact', 'methodology', 'disclaimer', 'privacy', 'terms', 'countries'];
for (const dir of otherDirs) {
  if (fs.existsSync('dist/' + dir + '/index.html')) {
    actualPagesByPath.add('/' + dir + '/');
  }
}

// Homepage
actualPagesByPath.add('/');

// Pass pages
const passDirs = fs.readdirSync('dist/passes');
for (const p of passDirs) {
  if (fs.existsSync('dist/passes/' + p + '/index.html')) {
    actualPagesByPath.add('/passes/' + p + '/');
  }
}

console.log('Total actual pages in dist:', actualPagesByPath.size);

// Now compare sitemap URLs against actual pages
const sitemapUrls = new Set(allUrls);
const missing = [];  // In sitemap but not in dist
const extra = [];    // In dist but not in sitemap

for (const url of sitemapUrls) {
  if (!actualPagesByPath.has(url)) {
    missing.push(url);
  }
}

for (const url of actualPagesByPath) {
  if (!sitemapUrls.has(url)) {
    extra.push(url);
  }
}

console.log('\nURLs in sitemap but NOT found in dist:', missing.length);
if (missing.length > 0 && missing.length <= 50) {
  missing.forEach(u => console.log('  MISSING:', u));
} else {
  missing.slice(0, 30).forEach(u => console.log('  MISSING:', u));
  if (missing.length > 30) console.log('  ... and', missing.length - 30, 'more');
}

console.log('\nURLs in dist but NOT in sitemap (excluding passes already counted):', extra.length);
if (extra.length > 0 && extra.length <= 30) {
  extra.forEach(u => console.log('  EXTRA:', u));
}
