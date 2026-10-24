const fs = require('fs');
const path = require('path');

const root = 'd:/LIVEROADSTATUS';
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log('--- 1. OVERFLOW & HORIZONTAL SCROLL CHECKS ---');
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  if (content.includes('100vw')) {
    // 100vw causes horizontal scrollbars!
  }
}
console.log('Total files using 100vw:', htmlFiles.filter(f => fs.readFileSync(path.join(root, f), 'utf8').includes('100vw')).length);

console.log('\n--- 2. BROKEN LINKS AUDIT ---');
let brokenLinks = [];
let totalHrefs = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  const matches = content.matchAll(/href=["']([^"'#?]+)["']/g);
  for (const m of matches) {
    const raw = m[1];
    totalHrefs++;
    if (/^(https?:\/\/|mailto:|tel:|javascript:|#|data:)/i.test(raw)) continue;
    const clean = decodeURIComponent(raw).replace(/^\//, '');
    if (!clean) continue;
    const p1 = path.join(root, clean);
    const p2 = path.join(root, 'public', clean);
    if (!fs.existsSync(p1) && !fs.existsSync(p2)) {
      brokenLinks.push({ file, link: raw });
    }
  }
}
console.log(`Scanned ${totalHrefs} internal/external hrefs. Broken links count: ${brokenLinks.length}`);
if (brokenLinks.length > 0) {
  console.log('Broken links sample:', brokenLinks.slice(0, 10));
}

console.log('\n--- 3. MOBILE MENU & JS HANDLER AUDIT ---');
let filesWithoutHamburger = [];
let filesWithoutScript = [];
for (const file of htmlFiles) {
  if (file === 'khyber.html') continue;
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  if (!content.includes('hamburger-btn') && !content.includes('lrs-hamburger')) {
    filesWithoutHamburger.push(file);
  }
  if (!content.includes('lrs-hamburger') || !content.includes('.addEventListener')) {
    // check if hamburger has click handler
    if (!content.includes('lrs-hamburger') || !content.includes('mobile-open')) {
      filesWithoutScript.push(file);
    }
  }
}
console.log('Files missing hamburger button:', filesWithoutHamburger.length, filesWithoutHamburger);
console.log('Files missing hamburger click handler:', filesWithoutScript.length, filesWithoutScript);

console.log('\n--- 4. FAVICON AUDIT ---');
let missingFavicon = [];
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  if (!content.includes('favicon.ico') && !content.includes('rel="icon"')) {
    missingFavicon.push(file);
  }
}
console.log('Files missing favicon:', missingFavicon.length, missingFavicon);

console.log('\n--- 5. PAGE TITLES & META DESCRIPTIONS ---');
let missingTitles = [];
let badTitles = [];
let missingMeta = [];
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  const t = content.match(/<title>([^<]*)<\/title>/i);
  if (!t || !t[1].trim()) missingTitles.push(file);
  else if (t[1].length < 10) badTitles.push({ file, title: t[1] });

  const m = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (!m || !m[1].trim()) missingMeta.push(file);
}
console.log('Missing titles:', missingTitles);
console.log('Suspicious titles:', badTitles);
console.log('Missing meta descriptions:', missingMeta);

console.log('\n--- 6. FOOTER LINKS AUDIT ---');
let brokenFooterLinks = [];
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  const fMatch = content.match(/<footer[\s\S]*?<\/footer>/i);
  if (fMatch) {
    const links = fMatch[0].matchAll(/href=["']([^"'#?]+)["']/g);
    for (const l of links) {
      const u = l[1];
      if (/^(https?:\/\/|mailto:|tel:|javascript:|#)/i.test(u)) continue;
      const clean = decodeURIComponent(u).replace(/^\//, '');
      if (!clean) continue;
      if (!fs.existsSync(path.join(root, clean)) && !fs.existsSync(path.join(root, 'public', clean))) {
        brokenFooterLinks.push({ file, link: u });
      }
    }
  }
}
console.log('Broken footer links count:', brokenFooterLinks.length, brokenFooterLinks);

console.log('\n--- 7. CUSTOM 404 PAGE AUDIT ---');
console.log('Root 404.html exists?', fs.existsSync(path.join(root, '404.html')));
console.log('Public 404.html exists?', fs.existsSync(path.join(root, 'public', '404.html')));
console.log('Dist 404.html exists?', fs.existsSync(path.join(root, 'dist', '404.html')));

console.log('\n--- 8. COPYRIGHT YEAR AUDIT ---');
let badYearFiles = [];
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  const matches = content.match(/(©|&copy;|Copyright)\s*(\d{4})/gi);
  if (matches) {
    for (const m of matches) {
      if (m.includes('2024') || m.includes('2023') || m.includes('2022') || m.includes('2025')) {
        badYearFiles.push({ file, match: m });
      }
    }
  }
}
console.log('Files with outdated copyright years:', badYearFiles.length);
if (badYearFiles.length > 0) console.log(badYearFiles.slice(0, 10));

console.log('\n--- 9. BUTTON BUTTONS & BUTTON ISSUES ---');
let btnIssues = [];
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  // Check literal "button button" or class="btn button" or <button ...>button</button> or empty buttons
  if (/button\s+button/i.test(content)) {
    btnIssues.push({ file, type: 'button button text' });
  }
  const emptyBtns = content.match(/<button[^>]*>\s*<\/button>/gi);
  if (emptyBtns) {
    // filter out buttons that have aria-label or svg/spans inside
    const trulyEmpty = emptyBtns.filter(b => !b.includes('aria-label'));
    if (trulyEmpty.length > 0) {
      btnIssues.push({ file, type: 'empty button without label', buttons: trulyEmpty });
    }
  }
}
console.log('Button issues found:', btnIssues.length, btnIssues);

console.log('\n--- 10. SUCCESS IMAGE & ERROR MESSAGE AUDIT ---');
console.log('Public success images:', fs.readdirSync(path.join(root, 'public')).filter(f => /success/i.test(f)));
console.log('Public error images/svgs:', fs.readdirSync(path.join(root, 'public')).filter(f => /error/i.test(f)));

console.log('\n--- 11. PLACEHOLDER TEXT AUDIT ---');
let placeholderFound = [];
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  // strip input placeholder attributes: placeholder="..."
  const stripped = content.replace(/placeholder=["'][^"']*["']/gi, '');
  const m = stripped.match(/(lorem ipsum|sample data|insert pass name|your name here|placeholder text|dummy data)/i);
  if (m) {
    placeholderFound.push({ file, match: m[0] });
  }
}
console.log('Real placeholder text (excluding input placeholder attributes):', placeholderFound.length, placeholderFound);

console.log('\n--- 12. LARGE UNCOMPRESSED IMAGES AUDIT ---');
function checkImages(dir) {
  const list = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) continue;
    if (/\.(jpg|jpeg|png|webp)$/i.test(f)) {
      const size = fs.statSync(full).size;
      if (size > 1024 * 1024) { // > 1MB
        list.push({ file: path.relative(root, full), sizeMB: (size / (1024 * 1024)).toFixed(2) });
      }
    }
  }
  return list;
}
const largeImages = [...checkImages(path.join(root, 'public')), ...checkImages(path.join(root, 'IMAGE'))];
console.log('Images > 1MB that should be compressed:', largeImages.length);
console.log(largeImages.slice(0, 10));
