const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

const found = [];
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  const navMatch = content.match(/<ul\s+class=["']nav-links["']>([\s\S]*?)<\/ul>/i);
  if (navMatch) {
    if (navMatch[1].includes('disclaimer') || navMatch[1].includes('terms') || navMatch[1].includes('privacy')) {
      found.push(file);
    }
  }
}

console.log('Files with legal links in nav-links:', found);
