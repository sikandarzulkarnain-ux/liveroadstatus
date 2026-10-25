'use strict';
const fs = require('fs');
// Check the index.html JSON-LD 
const index = fs.readFileSync('index.html', 'utf8');
const marker = 'application/ld+json';
let start = 0;
let count = 0;
while(true) {
  let s = index.indexOf(marker, start);
  if (s === -1) break;
  // find closing >
  let closeBracket = index.indexOf('>', s);
  let e = index.indexOf('</script>', closeBracket);
  const jsonPart = index.substring(closeBracket + 1, e).trim();
  count++;
  console.log('JSON-LD block', count, '- length:', jsonPart.length);
  try {
    JSON.parse(jsonPart);
    console.log('  -> VALID JSON');
  } catch(err) {
    console.log('  -> INVALID:', err.message);
    // show context around error
    const posMatch = err.message.match(/position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      console.log('  Before error:', JSON.stringify(jsonPart.substring(Math.max(0,pos-50), pos)));
      console.log('  After error:', JSON.stringify(jsonPart.substring(pos, pos+50)));
    }
    // show lines 30-70 of the JSON
    const lines = jsonPart.split('\n');
    console.log('  Lines 60-75:');
    lines.slice(59, 75).forEach((l, i) => console.log('   ', (60+i) + ':', l));
  }
  start = e + 9;
}
console.log('Total JSON-LD blocks in index.html:', count);

// Also check wrangler deployment vs vercel
console.log('\nDeployment configuration:');
console.log('wrangler.toml exists:', fs.existsSync('wrangler.toml'));
console.log('vercel.json exists:', fs.existsSync('vercel.json'));
console.log('dist dir exists:', fs.existsSync('dist'));
if (fs.existsSync('dist')) {
  const distFiles = fs.readdirSync('dist');
  console.log('dist root files:', distFiles.filter(f => !fs.statSync('dist/' + f).isDirectory()).join(', '));
  const distDirs = distFiles.filter(f => fs.statSync('dist/' + f).isDirectory());
  console.log('dist subdirs:', distDirs.join(', '));
}
