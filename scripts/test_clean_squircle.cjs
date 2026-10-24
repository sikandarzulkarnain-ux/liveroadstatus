const sharp = require('sharp');
const fs = require('fs');

const imgPath = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/f1706c4f-8e43-44af-ab59-11367b19b284/.user_uploaded/media_1792821319081.png';

async function testCleanSquircle() {
  // Let's crop slightly inside the shadow:
  // minX: 329 -> 331, maxX: 694 -> 692, minY: 85 -> 87, maxY: 451 -> 449
  // That cuts the 2px shadow border!
  const crop = { left: 331, top: 87, width: 362, height: 362 };

  // Generate a standard squircle path mask at 512x512
  // For a 512x512 iOS-style squircle, radius is ~115px (or smooth SVG rect rx="115" ry="115")
  const size = 512;
  const radius = 115;
  const maskSvg = Buffer.from(`<svg width="${size}" height="${size}">
    <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#ffffff"/>
  </svg>`);

  const cropped = await sharp(imgPath)
    .extract(crop)
    .resize(size, size, { kernel: 'lanczos3' })
    .toBuffer();

  const masked = await sharp(cropped)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp(masked).toFile('d:/LIVEROADSTATUS/public/clean_squircle_512.png');
  console.log('Saved clean_squircle_512.png');
}

testCleanSquircle().catch(console.error);
