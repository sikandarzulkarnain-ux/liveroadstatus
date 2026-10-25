'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.resolve(root, 'dist');
const BASE = 'https://www.liveroadstatus.com';

console.log('=== PHASE 10: AUTOMATED TECHNICAL SEO & URL AUDIT ===');

// 1. Read sitemap.xml
const sitemapPath = path.join(dist, 'sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const sitemapLocs = (sitemapContent.match(/<loc>([^<]+)<\/loc>/g) || []).map(l => l.replace(/<\/?loc>/g, ''));
const sitemapSet = new Set(sitemapLocs);
console.log(`Loaded ${sitemapSet.size} URLs from sitemap.xml.`);

// 2. Read robots.txt
const robotsPath = path.join(dist, 'robots.txt');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');
const hasSitemapDirective = robotsContent.includes(`Sitemap: ${BASE}/sitemap.xml`);
console.log(`robots.txt sitemap directive valid: ${hasSitemapDirective}`);

// 3. Collect all HTML files in dist
function getAllHtmlFiles(dir, relativeDir = '') {
  let results = [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = (relativeDir ? `${relativeDir}/${entry}` : entry).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry !== 'assets' && entry !== 'IMAGE') {
        results = results.concat(getAllHtmlFiles(fullPath, relPath));
      }
    } else if (entry.endsWith('.html')) {
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

const htmlFiles = getAllHtmlFiles(dist);
console.log(`Found ${htmlFiles.length} total HTML files in dist.`);

// 4. Analyze each page
const auditResults = [];
let passCount = 0;
let warnCount = 0;
let failCount = 0;
let excludedCount = 0;

htmlFiles.forEach(({ fullPath, relPath }) => {
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Compute URL
  let pageUrl = BASE + '/';
  if (relPath === 'index.html') {
    pageUrl = BASE + '/';
  } else if (relPath.endsWith('/index.html')) {
    pageUrl = BASE + '/' + relPath.replace('/index.html', '/');
  } else {
    pageUrl = BASE + '/' + relPath;
  }

  // Check if legacy redirect stub or intentionally excluded
  const isRedirectStub = content.includes('Redirecting to') || (!relPath.endsWith('/index.html') && relPath.endsWith('.html') && relPath !== 'index.html');
  const is404 = relPath === '404.html';

  if (is404 || isRedirectStub) {
    excludedCount++;
    auditResults.push({
      url: pageUrl,
      file: relPath,
      status: 'EXCLUDED BY DESIGN',
      reason: is404 ? '404 Error Template' : 'Legacy HTML / Redirect stub',
      inSitemap: sitemapSet.has(pageUrl)
    });
    return;
  }

  const issues = [];

  // Title tag
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  if (!title) issues.push('Missing <title> tag');

  // Meta description
  const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    content.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';
  if (!description) issues.push('Missing meta description');

  // Canonical tag
  const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
                         content.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';
  if (!canonical) {
    issues.push('Missing canonical tag');
  } else if (canonical !== pageUrl && canonical !== pageUrl.replace(/\/$/, '')) {
    issues.push(`Canonical mismatch: declared "${canonical}" vs page "${pageUrl}"`);
  }

  // H1 presence
  const h1Matches = content.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  if (h1Matches.length === 0) issues.push('Missing <h1> tag');
  if (h1Matches.length > 1) issues.push(`Multiple <h1> tags (${h1Matches.length})`);

  // Robots meta
  const robotsMeta = content.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const hasNoindex = robotsMeta && robotsMeta[1].toLowerCase().includes('noindex');
  if (hasNoindex) issues.push('Accidental noindex tag detected');

  // Sitemap presence
  const inSitemap = sitemapSet.has(pageUrl);
  if (!inSitemap) {
    issues.push('Valid indexable page missing from sitemap.xml');
  }

  // JSON-LD validation if present
  const jsonLdMatches = content.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  jsonLdMatches.forEach((scriptTag, idx) => {
    const rawJson = scriptTag.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    try {
      JSON.parse(rawJson);
    } catch (e) {
      issues.push(`Invalid JSON-LD syntax in block ${idx + 1}: ${e.message}`);
    }
  });

  // Classification
  let status = 'PASS';
  if (issues.some(i => i.includes('Missing <title>') || i.includes('Invalid JSON-LD') || i.includes('noindex'))) {
    status = 'FAIL';
    failCount++;
  } else if (issues.length > 0) {
    status = 'WARNING';
    warnCount++;
  } else {
    passCount++;
  }

  auditResults.push({
    url: pageUrl,
    file: relPath,
    status,
    title,
    description: description.slice(0, 80) + (description.length > 80 ? '...' : ''),
    canonical,
    h1Count: h1Matches.length,
    inSitemap,
    issues
  });
});

console.log('\n--- AUDIT SUMMARY STATISTICS ---');
console.log(`✅ PASS: ${passCount}`);
console.log(`⚠️  WARNING: ${warnCount}`);
console.log(`❌ FAIL: ${failCount}`);
console.log(`ℹ️  EXCLUDED BY DESIGN: ${excludedCount}`);
console.log(`Total Pages Analyzed: ${auditResults.length}`);

// Save JSON report
const jsonReportPath = path.join(root, 'scripts', 'audit_report.json');
fs.writeFileSync(jsonReportPath, JSON.stringify(auditResults, null, 2), 'utf8');
console.log(`\nWritten full machine-readable report to ${jsonReportPath}`);

// If any warnings or fails, print sample
const problems = auditResults.filter(r => r.status === 'WARNING' || r.status === 'FAIL');
if (problems.length > 0) {
  console.log(`\nDetected ${problems.length} pages with warnings/issues:`);
  problems.slice(0, 15).forEach(p => {
    console.log(`  [${p.status}] ${p.url}: ${p.issues.join(', ')}`);
  });
} else {
  console.log('🎉 100% of indexable pages PASSED all technical SEO checks!');
}
