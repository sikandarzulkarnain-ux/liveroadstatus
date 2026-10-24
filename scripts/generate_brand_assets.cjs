const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgPath = path.resolve(__dirname, '..', 'public', 'clean_squircle_512.png');

/**
 * Creates a standard Windows ICO buffer containing multiple PNG images.
 */
function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const dirEntrySize = 16;
  const dirSize = images.length * dirEntrySize;
  let currentOffset = 6 + dirSize;

  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(currentOffset, 12);
    entries.push(entry);
    currentOffset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map(img => img.buffer)]);
}

async function generateAssets() {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const distDir = path.resolve(__dirname, '..', 'dist');

  if (!fs.existsSync(imgPath)) {
    console.error('Source icon not found:', imgPath);
    process.exit(1);
  }

  const master512 = await sharp(imgPath)
    .resize(512, 512, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 1. Generate PNG sizes
  const sizes = [
    { names: ['favicon-16x16.png', 'favicon-v2-16x16.png'], size: 16 },
    { names: ['favicon-32x32.png', 'favicon-v2-32x32.png'], size: 32 },
    { names: ['favicon-48x48.png', 'favicon-v2-48x48.png', 'favicon.png'], size: 48 }, // Google Search favorite 48x48
    { names: ['apple-touch-icon.png', 'apple-touch-icon-v2.png'], size: 180 },
    { names: ['favicon-192x192.png', 'favicon-v2-192x192.png'], size: 192 },
    { names: ['favicon-512x512.png', 'favicon-v2-512x512.png', 'logo.png'], size: 512 },
  ];

  const icoImages = [];

  for (const item of sizes) {
    const pngBuffer = item.size === 512 ? master512 : await sharp(master512)
      .resize(item.size, item.size, { kernel: 'lanczos3' })
      .png({ compressionLevel: 9 })
      .toBuffer();

    for (const n of item.names) {
      fs.writeFileSync(path.join(publicDir, n), pngBuffer);
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, n), pngBuffer);
      }
    }
    console.log(`Generated ${item.names.join(', ')} (${item.size}x${item.size})`);

    if ([16, 32, 48].includes(item.size)) {
      icoImages.push({ size: item.size, buffer: pngBuffer });
    }
  }

  icoImages.sort((a, b) => a.size - b.size);

  // 2. Generate favicon.ico and favicon-v2.ico
  const icoBuffer = createIco(icoImages);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon-v2.ico'), icoBuffer);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'favicon.ico'), icoBuffer);
    fs.writeFileSync(path.join(distDir, 'favicon-v2.ico'), icoBuffer);
  }
  console.log('Generated favicon.ico and favicon-v2.ico with 16, 32, 48');

  // 3. Generate logo.webp and logo-v2.webp
  const webpBuffer = await sharp(master512)
    .webp({ quality: 95, effort: 6 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'logo.webp'), webpBuffer);
  fs.writeFileSync(path.join(publicDir, 'logo-v2.webp'), webpBuffer);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'logo.webp'), webpBuffer);
    fs.writeFileSync(path.join(distDir, 'logo-v2.webp'), webpBuffer);
  }
  console.log('Generated logo.webp and logo-v2.webp');

  // 4. Generate mountain-logo.svg & mountain-logo-v2.svg with embedded high-res PNG
  const base64Png = master512.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${base64Png}" x="0" y="0" width="512" height="512"/>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'mountain-logo.svg'), svgContent);
  fs.writeFileSync(path.join(publicDir, 'mountain-logo-v2.svg'), svgContent);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'mountain-logo.svg'), svgContent);
    fs.writeFileSync(path.join(distDir, 'mountain-logo-v2.svg'), svgContent);
  }
  console.log('Generated mountain-logo.svg & mountain-logo-v2.svg');

  console.log('All brand assets updated successfully!');
}

generateAssets().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
