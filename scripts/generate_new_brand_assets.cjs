const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/f1706c4f-8e43-44af-ab59-11367b19b284/.user_uploaded/media_1792821319081.png';

/**
 * Standard ICO builder
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

async function buildAllAssets() {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const distDir = path.resolve(__dirname, '..', 'dist');

  // 1. Extract the icon from the uploaded image
  // minX: 329, maxX: 694, minY: 85, maxY: 451 => 366 x 367
  const crop = { left: 329, top: 85, width: 366, height: 367 };
  const { data, info } = await sharp(imgPath)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // BFS flood fill from 4 corners to remove outer canvas background
  const visited = new Uint8Array(width * height);
  const queue = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
  for (const [x, y] of queue) visited[y * width + x] = 1;

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const idx = (y * width + x) * channels;
    data[idx + 3] = 0; // Transparent

    const neighbors = [
      [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const npos = ny * width + nx;
        if (!visited[npos]) {
          visited[npos] = 1;
          const nidx = npos * channels;
          const nr = data[nidx], ng = data[nidx + 1], nb = data[nidx + 2];
          // Outer mockup canvas is #f8f8f8 (~248) and dark drop shadow edge
          // The orange icon has high red (>240) and low blue (<100)
          // The canvas background has r ~ g ~ b (gray/white)
          const isGrayOrWhite = Math.abs(nr - ng) < 18 && Math.abs(ng - nb) < 18 && (nr > 220 || (nr < 190 && nb > 70));
          if (isGrayOrWhite) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  // Base 512x512 master PNG buffer
  const master512 = await sharp(data, { raw: { width, height, channels: 4 } })
    .resize(512, 512, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Targets in public/
  const sizes = [
    { names: ['favicon-16x16.png', 'favicon-v2-16x16.png'], size: 16 },
    { names: ['favicon-32x32.png', 'favicon-v2-32x32.png'], size: 32 },
    { names: ['favicon-48x48.png', 'favicon-v2-48x48.png', 'favicon.png'], size: 48 },
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
    console.log(`Updated ${item.names.join(', ')} (${item.size}x${item.size})`);

    if ([16, 32, 48].includes(item.size)) {
      icoImages.push({ size: item.size, buffer: pngBuffer });
    }
  }

  icoImages.sort((a, b) => a.size - b.size);
  const icoBuffer = createIco(icoImages);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon-v2.ico'), icoBuffer);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'favicon.ico'), icoBuffer);
    fs.writeFileSync(path.join(distDir, 'favicon-v2.ico'), icoBuffer);
  }
  console.log('Updated favicon.ico & favicon-v2.ico');

  // Generate logo.webp and logo-v2.webp
  const webpBuffer = await sharp(master512)
    .webp({ quality: 95, effort: 6 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'logo.webp'), webpBuffer);
  fs.writeFileSync(path.join(publicDir, 'logo-v2.webp'), webpBuffer);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'logo.webp'), webpBuffer);
    fs.writeFileSync(path.join(distDir, 'logo-v2.webp'), webpBuffer);
  }
  console.log('Updated logo.webp & logo-v2.webp');

  // Generate SVG version (mountain-logo.svg & mountain-logo-v2.svg) containing high-res embedded PNG image
  const base64Png = master512.toString('base64');
  const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${base64Png}" x="0" y="0" width="512" height="512"/>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'mountain-logo.svg'), svgWrapper);
  fs.writeFileSync(path.join(publicDir, 'mountain-logo-v2.svg'), svgWrapper);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'mountain-logo.svg'), svgWrapper);
    fs.writeFileSync(path.join(distDir, 'mountain-logo-v2.svg'), svgWrapper);
  }
  console.log('Updated mountain-logo.svg & mountain-logo-v2.svg');

  console.log('🎉 All brand assets replaced with new logo successfully!');
}

buildAllAssets().catch(err => {
  console.error('Build assets error:', err);
  process.exit(1);
});
