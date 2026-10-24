const fs = require('fs');
const path = require('path');

const root = 'd:/LIVEROADSTATUS';
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log('=== DEEP AUDIT FOR USER REQUEST ===\n');

// 1. Check copyright year
let copyrightIssues = [];
// 2. Check broken links
let brokenLinks = [];
// 3. Check broken images
let brokenImages = [];
// 4. Check meta description
let missingMetaDesc = [];
// 5. Check titles
let titleIssues = [];
// 6. Check favicons
let faviconIssues = [];
// 7. Check placeholder text
let placeholderIssues = [];
// 8. Check footer links
let footerLinkIssues = [];
// 9. Check "button" issues (e.g. "button buttons", double words, button styling, invalid buttons)
let buttonIssues = [];
// 10. Check mobile menu / hamburger
let missingMobileMenu = [];
// 11. Check horizontal scroll / overflow
let overflowIssues = [];
// 12. Check error message / success image references
let errorMsgIssues = [];

const currentYear = new Date().getFullYear();

for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check copyright
  const copyMatches = content.match(/©\s*(\d{4})/g) || content.match(/&copy;\s*(\d{4})/g);
  if (copyMatches) {
    for (const cm of copyMatches) {
      if (!cm.includes('2026') && !cm.includes('2025')) {
        copyrightIssues.push({ file, match: cm });
      }
    }
  }

  // Check titles
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    titleIssues.push({ file, issue: 'Missing title' });
  } else if (titleMatch[1].includes('Untitled') || titleMatch[1].includes('Document') || titleMatch[1].length < 5) {
    titleIssues.push({ file, title: titleMatch[1] });
  }

  // Check meta description
  const metaDescMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (!metaDescMatch || !metaDescMatch[1].trim()) {
    missingMetaDesc.push(file);
  }

  // Check favicon
  if (!content.includes('rel="icon"') && !content.includes("rel='icon'")) {
    faviconIssues.push(file);
  }

  // Check placeholder text
  const placeholderRegex = /(sample data|lorem ipsum|placeholder|todo|coming soon|dummy text|example text|insert text)/i;
  const pm = content.match(placeholderRegex);
  if (pm) {
    placeholderIssues.push({ file, match: pm[0] });
  }

  // Check "button button" or similar weird button text
  const btnBtn = content.match(/button\s+button/i);
  if (btnBtn) {
    buttonIssues.push({ file, match: btnBtn[0] });
  }

  // Check mobile menu presence
  if (!content.includes('hamburger') && !content.includes('mobile-menu')) {
    missingMobileMenu.push(file);
  }

  // Check footer links specifically
  const footerMatch = content.match(/<footer[\s\S]*?<\/footer>/i);
  if (footerMatch) {
    const footerContent = footerMatch[0];
    const footerHrefs = footerContent.matchAll(/href=["']([^"'#?]+)["']/g);
    for (const fh of footerHrefs) {
      const url = fh[1];
      if (/^(https?:\/\/|mailto:|tel:|javascript:|data:)/.test(url)) continue;
      const decoded = decodeURIComponent(url).replace(/^\//, '');
      if (!decoded) continue;
      if (!fs.existsSync(path.join(root, decoded)) && !fs.existsSync(path.join(root, 'public', decoded))) {
        footerLinkIssues.push({ file, url });
      }
    }
  }
}

console.log('1. Copyright Year Issues (Found in files):', copyrightIssues.length);
if (copyrightIssues.length > 0) console.log(copyrightIssues.slice(0, 5));

console.log('\n2. Broken Footer Links:', footerLinkIssues.length, footerLinkIssues);

console.log('\n3. Missing Meta Descriptions:', missingMetaDesc.length, missingMetaDesc);

console.log('\n4. Title Issues:', titleIssues.length, titleIssues);

console.log('\n5. Missing Favicons:', faviconIssues.length, faviconIssues);

console.log('\n6. Placeholder Text Found:', placeholderIssues.length);
if (placeholderIssues.length > 0) console.log(placeholderIssues.slice(0, 10));

console.log('\n7. "button button" or Button Issues:', buttonIssues.length, buttonIssues);

console.log('\n8. Missing Mobile Menu files count:', missingMobileMenu.length);
console.log('Sample files without mobile menu:', missingMobileMenu.slice(0, 5));
