'use strict';
const fs = require('fs');
const path = require('path');

// Count passes
const passesDir = 'passes';
const passes = fs.readdirSync(passesDir).filter(f => fs.statSync(path.join(passesDir, f)).isDirectory());
console.log('Total pass directories:', passes.length);

// Count sitemap URLs in sitemap.xml
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const urls = sitemap.match(/<loc>/g) || [];
console.log('URLs in root sitemap.xml:', urls.length);

// Count URLs in public/sitemap.xml
const publicSitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const publicUrls = publicSitemap.match(/<loc>/g) || [];
console.log('URLs in public/sitemap.xml:', publicUrls.length);

// Check for non-www URLs in root sitemap.xml
const nonWwwUrlsRoot = (sitemap.match(/https:\/\/liveroadstatus\.com/g) || []).length;
const wwwUrlsRoot = (sitemap.match(/https:\/\/www\.liveroadstatus\.com/g) || []).length;
console.log('Non-www URLs in root sitemap.xml:', nonWwwUrlsRoot);
console.log('www URLs in root sitemap.xml:', wwwUrlsRoot);

// Check non-www in public sitemap
const nonWwwPublic = (publicSitemap.match(/https:\/\/liveroadstatus\.com/g) || []).length;
const wwwPublic = (publicSitemap.match(/https:\/\/www\.liveroadstatus\.com/g) || []).length;
console.log('Non-www URLs in public/sitemap.xml:', nonWwwPublic);
console.log('www URLs in public/sitemap.xml:', wwwPublic);

// Check canonical issue in pass pages
const snoqualmie = fs.readFileSync('passes/snoqualmie-pass/index.html', 'utf8');
const canonMatch = snoqualmie.match(/rel="canonical" href="([^"]+)"/);
console.log('Snoqualmie canonical:', canonMatch ? canonMatch[1] : 'NOT FOUND');

// Check BreadcrumbList URL issue (space instead of hyphen)
const breadcrumbIssue = snoqualmie.includes('united states/');
console.log('Breadcrumb space issue in snoqualmie:', breadcrumbIssue);

// Check JSON-LD parse issue in index.html (double close)
const index = fs.readFileSync('index.html', 'utf8');
const jsonLdStart = index.indexOf('<script type="application/ld+json">');
const jsonLdEnd = index.indexOf('</script>', jsonLdStart);
const jsonLd = index.substring(jsonLdStart + '<script type="application/ld+json">'.length, jsonLdEnd);
try {
  JSON.parse(jsonLd);
  console.log('index.html JSON-LD: VALID');
} catch(e) {
  console.log('index.html JSON-LD: INVALID -', e.message);
}

// Check robots.txt content
const rootRobots = fs.readFileSync('robots.txt', 'utf8');
const publicRobots = fs.readFileSync('public/robots.txt', 'utf8');
console.log('Root robots.txt sitemap (www):', rootRobots.includes('www.liveroadstatus.com/sitemap.xml'));
console.log('Public robots.txt sitemap (www):', publicRobots.includes('www.liveroadstatus.com/sitemap.xml'));
console.log('Public robots.txt sitemap (non-www):', publicRobots.includes('https://liveroadstatus.com/sitemap.xml'));

// Check country.html in sitemap
const countryHtmlInSitemap = sitemap.includes('country.html');
const countryHtmlInPublicSitemap = publicSitemap.includes('country.html');
console.log('country.html in root sitemap:', countryHtmlInSitemap);
console.log('country.html in public sitemap:', countryHtmlInPublicSitemap);

// Check vercel.json trailingSlash
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
console.log('Vercel trailingSlash:', vercel.trailingSlash);
console.log('Vercel cleanUrls:', vercel.cleanUrls);

// Check if passes in sitemap use /passes/:slug/ format
const passesSitemapCount = (sitemap.match(/\/passes\//g) || []).length;
console.log('Pass URLs in root sitemap.xml:', passesSitemapCount);
const passesPublicSitemapCount = (publicSitemap.match(/\/passes\//g) || []).length;
console.log('Pass URLs in public/sitemap.xml:', passesPublicSitemapCount);

// Check .github for deployment
if (fs.existsSync('.github')) {
  const workflows = fs.readdirSync('.github');
  console.log('GitHub folder contents:', workflows);
}

// Check wrangler.toml 
const wrangler = fs.readFileSync('wrangler.toml', 'utf8');
console.log('Wrangler.toml:', wrangler.trim());

// Sample some sitemap URLs for issues
const allLocs = sitemap.match(/<loc>([^<]+)<\/loc>/g) || [];
const problematic = allLocs.filter(l => {
  const url = l.replace(/<\/?loc>/g, '');
  // check non-www, check no trailing slash, check special chars unencoded
  return url.includes('//liveroadstatus.com') || 
         url.includes('é') || url.includes('è') || url.includes('ñ') ||
         url.includes('ö') || url.includes('ü') || url.includes('ô') ||
         url.includes('ā') || url.includes('ē');
});
console.log('Problematic sitemap URLs (non-www or unencoded chars):', problematic.length);
if (problematic.length > 0 && problematic.length <= 20) {
  problematic.forEach(u => console.log(' -', u));
} else if (problematic.length > 20) {
  problematic.slice(0, 10).forEach(u => console.log(' -', u));
  console.log(`  ... and ${problematic.length - 10} more`);
}
