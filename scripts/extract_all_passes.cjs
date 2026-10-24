const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log('Auditing pass cards and modal structures across all HTML files...');

let passes = [];
let sampleFiles = ['bourgogne.html', 'colorado.html', 'washington.html', 'paca.html', 'himachal.html'];

for (const sf of sampleFiles) {
  const filePath = path.join(root, sf);
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');

  // Look for openPassModal calls or pass modals
  const modalMatches = content.match(/openPassModal\(['"]([^'"]+)['"]\)/g) || [];
  const passCardMatches = content.match(/class=["']pass-card["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/g) || [];
  console.log(`${sf}: ${passCardMatches.length} pass cards, ${modalMatches.length} modal triggers`);

  // Look for PASS_DATA or modal script objects
  const scriptData = content.match(/const\s+(?:PASS_DATA|PASSES|passData)\s*=\s*(\{[\s\S]*?\});/);
  if (scriptData) {
    console.log(`  Found embedded data object in ${sf}!`);
  }
}
