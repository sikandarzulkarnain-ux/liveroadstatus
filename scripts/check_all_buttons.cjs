const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'index.html');
const buttonMap = {};
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  const btns = [...txt.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)];
  if (btns.length > 0) {
    btns.forEach(b => {
      const cls = (b[0].match(/class=["']([^"']*)["']/) || [])[1] || 'no-class';
      buttonMap[cls] = (buttonMap[cls] || 0) + 1;
    });
  }
}
console.log('Button classes across regional HTML files:', buttonMap);
