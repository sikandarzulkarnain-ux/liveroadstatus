import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('🔍 Running Local Screaming-Frog-Equivalent Full Site Audit...\n');

const sitemapPath = path.resolve(distDir, 'sitemap.xml');
const robotsPath = path.resolve(distDir, 'robots.txt');
const headersPath = path.resolve(distDir, '_headers');

if (!fs.existsSync(sitemapPath)) {
  console.error('❌ dist/sitemap.xml not found!');
  process.exit(1);
}

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const sitemapUrls = [...sitemapContent.matchAll(/<loc>(https:\/\/www\.livepasswatch\.info[^<]*)<\/loc>/g)].map(m => m[1]);

console.log(`📄 Discovered ${sitemapUrls.length} Canonical URLs in Sitemap:\n`);

const results = [];
let totalInternalLinksDiscovered = 0;
const allDiscoveredPaths = new Set();
const linkErrors = [];

sitemapUrls.forEach(fullUrl => {
  const urlPath = fullUrl.replace('https://www.livepasswatch.info', '') || '/';
  const filePath = urlPath === '/' 
    ? path.resolve(distDir, 'index.html') 
    : path.resolve(distDir, urlPath.replace(/^\//, ''), 'index.html');

  if (!fs.existsSync(filePath)) {
    linkErrors.push(`Missing HTML file for sitemap URL: ${fullUrl} -> ${filePath}`);
    return;
  }

  const html = fs.readFileSync(filePath, 'utf8');

  // 1. Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  const titleLength = title.length;

  // 2. Meta description
  const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const metaDesc = metaDescMatch ? metaDescMatch[1] : '';

  // 3. Meta keywords
  const hasMetaKeywords = /<meta\s+name=["']keywords["']/i.test(html);

  // 4. Canonical
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : '';

  // 5. Headings
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]*>/g, '').trim());
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]*>/g, '').trim());

  // 6. Schema JSON-LD
  const schemaMatches = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  let parsedSchemas = [];
  schemaMatches.forEach(sm => {
    try {
      const parsed = JSON.parse(sm[1]);
      if (parsed['@graph']) {
        parsedSchemas.push(...parsed['@graph'].map(g => g['@type']));
      } else if (parsed['@type']) {
        parsedSchemas.push(parsed['@type']);
      }
    } catch (e) {
      linkErrors.push(`Malformed JSON-LD in ${urlPath}: ${e.message}`);
    }
  });

  // 7. Internal Outlinks
  const hrefMatches = [...html.matchAll(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>/gi)].map(m => m[1]);
  const internalOutlinks = hrefMatches.filter(href => {
    return href.startsWith('/') || href.startsWith('https://www.livepasswatch.info');
  });

  internalOutlinks.forEach(href => {
    const cleanHref = href.replace('https://www.livepasswatch.info', '').split('#')[0].split('?')[0] || '/';
    allDiscoveredPaths.add(cleanHref);
  });

  totalInternalLinksDiscovered += internalOutlinks.length;

  // 8. Word Count in body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const wordCount = bodyText ? bodyText.split(' ').length : 0;

  results.push({
    url: fullUrl,
    path: urlPath,
    title,
    titleLength,
    h1Count: h1Matches.length,
    h1Text: h1Matches[0] || 'NONE',
    h2Count: h2Matches.length,
    h2List: h2Matches,
    wordCount,
    outlinksCount: internalOutlinks.length,
    schemas: parsedSchemas,
    hasKeywords: hasMetaKeywords,
    canonicalMatch: canonical === fullUrl
  });
});

console.log('--------------------------------------------------');
console.log('📊 AUDIT SUMMARY PER URL:');
console.log('--------------------------------------------------\n');

results.forEach(r => {
  console.log(`URL: ${r.url}`);
  console.log(`  • Title: "${r.title}" (${r.titleLength} chars)`);
  console.log(`  • H1 (${r.h1Count}): "${r.h1Text}"`);
  console.log(`  • H2s (${r.h2Count}): ${r.h2List.slice(0, 3).join(' | ')}${r.h2Count > 3 ? ' ...' : ''}`);
  console.log(`  • Word Count: ${r.wordCount} words`);
  console.log(`  • Outlinks in HTML: ${r.outlinksCount}`);
  console.log(`  • Schemas: [${r.schemas.join(', ')}]`);
  console.log(`  • Canonical OK: ${r.canonicalMatch ? '✅' : '❌'}`);
  console.log(`  • Meta Keywords: ${r.hasKeywords ? '⚠️ PRESENT' : '✅ REMOVED'}`);
  console.log('');
});

// Security Headers Inspection
console.log('--------------------------------------------------');
console.log('🔒 SECURITY HEADERS AUDIT (_headers):');
console.log('--------------------------------------------------\n');
const headersContent = fs.readFileSync(headersPath, 'utf8');
const hasHsts = /Strict-Transport-Security/i.test(headersContent);
const hasCsp = /Content-Security-Policy/i.test(headersContent);
const hasXcto = /X-Content-Type-Options/i.test(headersContent);
const hasXfo = /X-Frame-Options/i.test(headersContent);
const hasReferrer = /Referrer-Policy/i.test(headersContent);

console.log(`  • HSTS Header: ${hasHsts ? '✅ PRESENT' : '❌ MISSING'}`);
console.log(`  • CSP Header: ${hasCsp ? '✅ PRESENT' : '❌ MISSING'}`);
console.log(`  • X-Content-Type-Options: ${hasXcto ? '✅ PRESENT' : '❌ MISSING'}`);
console.log(`  • X-Frame-Options: ${hasXfo ? '✅ PRESENT' : '❌ MISSING'}`);
console.log(`  • Referrer-Policy: ${hasReferrer ? '✅ PRESENT' : '❌ MISSING'}`);

// Robots.txt Inspection
console.log('\n--------------------------------------------------');
console.log('🤖 ROBOTS.TXT AUDIT:');
console.log('--------------------------------------------------\n');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');
const hasSitemapInRobots = /Sitemap:\s*https:\/\/www\.livepasswatch\.info\/sitemap\.xml/i.test(robotsContent);
console.log(`  • Sitemap linked in robots.txt: ${hasSitemapInRobots ? '✅ YES' : '❌ NO'}`);

console.log('\n==================================================');
console.log(`TOTAL CANONICAL PAGES AUDITED: ${results.length}`);
console.log(`TOTAL INTERNAL LINKS DISCOVERED: ${totalInternalLinksDiscovered}`);
console.log(`UNIQUE INTERNAL PATHS ACCESSIBLE: ${allDiscoveredPaths.size}`);
console.log(`ERRORS/MALFORMED JSON: ${linkErrors.length}`);
console.log('==================================================\n');
