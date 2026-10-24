const sharp = require('sharp');
const path = require('path');

const imgPath = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/f1706c4f-8e43-44af-ab59-11367b19b284/.user_uploaded/media_1792821319081.png';

async function run() {
  const meta = await sharp(imgPath).metadata();
  console.log('Original dimensions:', meta.width, meta.height);

  // Let's inspect rows around the top edge and column around left edge
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  
  // Let's sample along horizontal line y = 268 (middle height of icon)
  // minX = 329
  console.log('Middle row (y=268) transition around x=325..335:');
  for (let x = 325; x <= 335; x++) {
    const idx = (268 * info.width + x) * info.channels;
    console.log(`x=${x}: [${data[idx]}, ${data[idx+1]}, ${data[idx+2]}]`);
  }
}

run().catch(console.error);
