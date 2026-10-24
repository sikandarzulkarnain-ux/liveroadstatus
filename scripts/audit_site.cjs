const fs = require('fs');
const path = require('path');

const root = 'd:/LIVEROADSTATUS';
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

let brokenLinks = [];
let brokenImgs = [];
let missingMetaDesc = [];
let missingFavicon = [];
let missingTitles = [];
let placeholderTexts = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  
  // 1. Check title
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    missingTitles.push(file);
  }

  // 2. Check meta description
  const metaMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (!metaMatch || !metaMatch[1].trim()) {
    missingMetaDesc.push(file);
  }

  // 3. Check favicon
  if (!content.includes('rel="icon"') && !content.includes("rel='icon'")) {
    missingFavicon.push(file);
  }

  // 4. Check placeholder text
  if (/sample data/i.test(content) || /lorem ipsum/i.test(content)) {
    placeholderTexts.push(file);
  }

  // 5. Check hrefs
  const hrefMatches = content.matchAll(/href=["']([^"'#?]+)["']/g);
  for (const m of hrefMatches) {
    const url = m[1];
    if (/^(https?:\/\/|mailto:|tel:|javascript:|#|data:)/.test(url)) continue;
    try {
      const decoded = decodeURIComponent(url).replace(/^\//, '');
      if (!decoded) continue;
      const targetPath = path.join(root, decoded);
      const targetPublic = path.join(root, 'public', decoded);
      if (!fs.existsSync(targetPath) && !fs.existsSync(targetPublic)) {
        brokenLinks.push({ file, url, decoded });
      }
    } catch(e) {}
  }

  // 6. Check srcs
  const srcMatches = content.matchAll(/src=["']([^"'#?]+)["']/g);
  for (const m of srcMatches) {
    const url = m[1];
    if (/^(https?:\/\/|data:)/.test(url)) continue;
    try {
      const decoded = decodeURIComponent(url).replace(/^\//, '');
      if (!decoded) continue;
      const targetPath = path.join(root, decoded);
      const targetPublic = path.join(root, 'public', decoded);
      if (!fs.existsSync(targetPath) && !fs.existsSync(targetPublic)) {
        brokenImgs.push({ file, url, decoded });
      }
    } catch(e) {}
  }
}

console.log('Total HTML files scanned:', htmlFiles.length);
console.log('Missing titles:', missingTitles.length, missingTitles);
console.log('Missing meta descriptions:', missingMetaDesc.length, missingMetaDesc);
console.log('Missing favicons:', missingFavicon.length, missingFavicon);
console.log('Files with placeholder text:', placeholderTexts.length, placeholderTexts);
console.log('Broken links count:', brokenLinks.length);
if (brokenLinks.length > 0) {
  const linkSummary = {};
  brokenLinks.forEach(b => {
    linkSummary[b.url] = (linkSummary[b.url] || 0) + 1;
  });
  console.log('Broken links summary:', linkSummary);
}
console.log('Broken images count:', brokenImgs.length);
if (brokenImgs.length > 0) {
  const imgSummary = {};
  brokenImgs.forEach(b => {
    imgSummary[b.url] = (imgSummary[b.url] || 0) + 1;
  });
  console.log('Broken images summary:', imgSummary);
}
