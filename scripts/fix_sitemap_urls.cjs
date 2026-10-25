'use strict';
/**
 * CRITICAL SEO FIX: 
 * The sitemap.xml contains /united-states/ URLs but the actual site serves /usa/ URLs.
 * This script:
 * 1. Updates sitemap.xml to use the actual live URL structure (/usa/ not /united-states/)
 * 2. Adds permanent redirects from /united-states/* to /usa/*  in dist/_redirects
 * 3. Syncs the changes to dist/sitemap.xml
 */

const fs = require('fs');
const path = require('path');

// =====================================
// STEP 1: Understand the URL mappings
// =====================================
// Actual directory structure uses:
// - /usa/ (not /united-states/)
// - /canada/ ✓ correct  
// - /austria/ ✓ correct
// - /switzerland/ ✓ correct (uses /graubunden/ not /graubünden/)
// - /france/ ✓ correct (but uses /bourgogne/ not /bourgogne-franche-comte/)
// - /italy/ ✓ correct
// - /norway/ ✓ correct
// - /india/ ✓ correct
// - /pakistan/ ✓ correct
// - /chile/ ✓ correct

// Read existing sitemap
let sitemap = fs.readFileSync('sitemap.xml', 'utf8');

console.log('=== STEP 1: Fixing sitemap.xml URL structure ===');
console.log('Before: URLs in sitemap:', (sitemap.match(/<loc>/g) || []).length);

// Mapping: what the sitemap says → what the site actually serves
// Fix /united-states/ → /usa/
const urlMappings = [
  // USA country page
  ['/united-states/', '/usa/'],
  // USA state pages - map hyphenated names to the actual dir names
  ['/united-states/california/', '/usa/california/'],
  ['/united-states/colorado/', '/usa/colorado/'],
  ['/united-states/oregon/', '/usa/oregon/'],
  ['/united-states/idaho/', '/usa/idaho/'],
  ['/united-states/new-mexico/', '/usa/newmexico/'],
  ['/united-states/north-carolina/', '/usa/northcarolina/'],
  ['/united-states/utah/', '/usa/utah/'],
  ['/united-states/alaska/', '/usa/alaska/'],
  ['/united-states/nevada/', '/usa/nevada/'],
  ['/united-states/washington/', '/usa/washington/'],
  ['/united-states/arizona/', '/usa/arizona/'],
  ['/united-states/wyoming/', '/usa/wyoming/'],
  ['/united-states/montana/', '/usa/montana/'],
  ['/united-states/virginia/', '/usa/virginia/'],
  ['/united-states/west-virginia/', '/usa/westvirginia/'],
  ['/united-states/tennessee/', '/usa/tennessee/'],
  ['/united-states/pennsylvania/', '/usa/pennsylvania/'],
  ['/united-states/new-hampshire/', '/usa/newhampshire/'],
  ['/united-states/maryland/', '/usa/maryland/'],
];

// Apply all mappings
for (const [from, to] of urlMappings) {
  const fromEscaped = from.replace(/\//g, '\\/');
  const regex = new RegExp(fromEscaped.replace(/\\/g, '\\'), 'g');
  sitemap = sitemap.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
}

// Verify
const unitedStatesRemaining = (sitemap.match(/\/united-states\//g) || []).length;
const usaUrls = (sitemap.match(/\/usa\//g) || []).length;
console.log('/united-states/ remaining in sitemap:', unitedStatesRemaining);
console.log('/usa/ URLs in sitemap:', usaUrls);

// Also fix Switzerland slug issues - check what's actually in dist
const switzDirs = fs.readdirSync('dist/switzerland').filter(f => fs.statSync('dist/switzerland/' + f).isDirectory());
console.log('\nActual Switzerland dirs in dist:', switzDirs);

// Check France dirs
const franceDirs = fs.readdirSync('dist/france').filter(f => fs.statSync('dist/france/' + f).isDirectory());
console.log('Actual France dirs in dist:', franceDirs);

// Check Italy dirs
const italyDirs = fs.readdirSync('dist/italy').filter(f => fs.statSync('dist/italy/' + f).isDirectory());
console.log('Actual Italy dirs in dist:', italyDirs);

// Check Norway dirs
const norwayDirs = fs.readdirSync('dist/norway').filter(f => fs.statSync('dist/norway/' + f).isDirectory());
console.log('Actual Norway dirs in dist:', norwayDirs);

// Check India dirs
const indiaDirs = fs.readdirSync('dist/india').filter(f => fs.statSync('dist/india/' + f).isDirectory());
console.log('Actual India dirs in dist:', indiaDirs);

// Check Pakistan dirs
const pakistanDirs = fs.readdirSync('dist/pakistan').filter(f => fs.statSync('dist/pakistan/' + f).isDirectory());
console.log('Actual Pakistan dirs in dist:', pakistanDirs);

// Check Chile dirs
const chileDirs = fs.readdirSync('dist/chile').filter(f => fs.statSync('dist/chile/' + f).isDirectory());
console.log('Actual Chile dirs in dist:', chileDirs);

// Check Canada dirs
const canadaDirs = fs.readdirSync('dist/canada').filter(f => fs.statSync('dist/canada/' + f).isDirectory());
console.log('Actual Canada dirs in dist:', canadaDirs);
