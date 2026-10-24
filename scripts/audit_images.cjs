const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

let totalImages = 0;
let missingAlt = 0;
let missingDimensions = 0;
let missingLazy = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  const imgTags = content.match(/<img[^>]+>/gi) || [];
  totalImages += imgTags.length;

  for (const img of imgTags) {
    if (!/alt=["'][^"']*["']/i.test(img)) {
      missingAlt++;
    }
    if (!/width=/i.test(img) || !/height=/i.test(img)) {
      missingDimensions++;
    }
    if (!/loading=["']lazy["']/i.test(img) && !/fetchpriority=["']high["']/i.test(img)) {
      missingLazy++;
    }
  }
}

console.log('Total images scanned:', totalImages);
console.log('Missing alt tags:', missingAlt);
console.log('Missing dimensions (width/height):', missingDimensions);
console.log('Missing loading=lazy or fetchpriority:', missingLazy);
