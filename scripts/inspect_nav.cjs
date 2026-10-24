const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('<body') || line.includes('site-nav') || line.includes('nav-brand') || line.includes('nav-links') || line.includes('nav-item') || line.includes('Disclaimer') || line.includes('Terms')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
