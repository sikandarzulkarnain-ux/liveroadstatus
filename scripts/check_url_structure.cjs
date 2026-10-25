'use strict';
const fs = require('fs');

// Check if dist/united-states exists
console.log('dist/united-states exists:', fs.existsSync('dist/united-states'));
console.log('dist/usa exists:', fs.existsSync('dist/usa'));
console.log('root/united-states exists:', fs.existsSync('united-states'));
console.log('root/usa exists:', fs.existsSync('usa'));

// Check vercel.json redirects
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const usaRedirects = vercel.redirects.filter(r => 
  r.source.includes('usa') || r.destination.includes('usa') || 
  r.source.includes('united-states') || r.destination.includes('united-states')
);
console.log('USA/United-States redirects in vercel.json:', usaRedirects.slice(0, 5));

// Check sitemap for /usa/ vs /united-states/
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const usaInSitemap = (sitemap.match(/\/usa\//g) || []).length;
const unitedStatesInSitemap = (sitemap.match(/\/united-states\//g) || []).length;
console.log('/usa/ in sitemap:', usaInSitemap);
console.log('/united-states/ in sitemap:', unitedStatesInSitemap);

// Check the dist _redirects
const distRedirects = fs.readFileSync('dist/_redirects', 'utf8');
const usaDistLines = distRedirects.split('\n').filter(l => l.includes('usa') || l.includes('united-states'));
console.log('USA/united-states in dist/_redirects:', usaDistLines.slice(0, 10));

// Check if the root usa dir has index.html
if (fs.existsSync('usa')) {
  console.log('usa dir has index.html:', fs.existsSync('usa/index.html'));
  console.log('usa dir contents:', fs.readdirSync('usa').slice(0, 5));
}

// Does the site serve /united-states/ or /usa/ as live paths?
// Check if there's a redirect from united-states to usa in dist/_redirects
const hasUnitedToUsa = distRedirects.includes('/united-states/') ;
console.log('dist/_redirects contains /united-states/:', hasUnitedToUsa);

// Check what the sitemap passes link to - do they match the actual pass page locations?
const sitemapPassUrls = sitemap.match(/<loc>https:\/\/www\.liveroadstatus\.com\/passes\/([^<]+)<\/loc>/g) || [];
console.log('Total pass URLs in sitemap:', sitemapPassUrls.length);
// Sample some
sitemapPassUrls.slice(0, 3).forEach(u => console.log('  Sample pass URL:', u.replace(/<\/?loc>/g, '')));

// Does dist have an index.html for a pass?
console.log('dist/passes/snoqualmie-pass/index.html exists:', fs.existsSync('dist/passes/snoqualmie-pass/index.html'));
