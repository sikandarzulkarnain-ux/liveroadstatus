const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log('--- PATCHING IMAGES AND LEGAL PAGES ---');

// 1. PATCH IMAGES
let patchedCount = 0;

for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  content = content.replace(/<img\b([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;

    // Check dimensions
    if (!/width=/i.test(newAttrs) && !/height=/i.test(newAttrs)) {
      if (/stelvio-card-bg/i.test(newAttrs)) {
        newAttrs += ' width="800" height="450"';
      } else if (/atlas-img/i.test(newAttrs)) {
        newAttrs += ' width="800" height="450"';
      } else if (/region-map-img/i.test(newAttrs)) {
        newAttrs += ' width="600" height="340"';
      } else {
        newAttrs += ' width="400" height="250"';
      }
      modified = true;
    }

    // Check loading="lazy"
    if (!/loading=/i.test(newAttrs) && !/fetchpriority=["']high["']/i.test(newAttrs)) {
      newAttrs += ' loading="lazy" decoding="async"';
      modified = true;
    }

    return `<img${newAttrs}>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    patchedCount++;
  }
}

console.log(`Patched images in ${patchedCount} HTML files.`);

// 2. CREATE CLEAN DIRECTORY PAGES FOR TRUST & LEGAL (Phase 6 Requirement 1 & Phase 3 Requirement 2)
const legalPages = ['about', 'methodology', 'contact', 'privacy', 'terms', 'disclaimer'];

for (const page of legalPages) {
  const htmlFile = `${page}.html`;
  const dirPath = path.join(root, page);
  const targetIndex = path.join(dirPath, 'index.html');

  if (fs.existsSync(path.join(root, htmlFile))) {
    let pageContent = fs.readFileSync(path.join(root, htmlFile), 'utf8');
    // Ensure canonical points to clean URL
    pageContent = pageContent.replace(
      new RegExp(`https://www.liveroadstatus.com/${page}.html`, 'g'),
      `https://www.liveroadstatus.com/${page}/`
    );

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(targetIndex, pageContent, 'utf8');
    console.log(`Created clean directory page: /${page}/index.html`);
  }
}
