const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const yearMap = {};
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  const matches = txt.match(/©[^<>\n\r]{0,30}\d{4}/g) || txt.match(/&copy;[^<>\n\r]{0,30}\d{4}/g);
  if (matches) {
    matches.forEach(m => {
      yearMap[m.trim()] = (yearMap[m.trim()] || 0) + 1;
    });
  } else {
    // check if file has copyright without year or any footer copyright
    const cMatch = txt.match(/©|&copy;|copyright/i);
    if (!cMatch) console.log(f, 'has NO copyright text at all');
  }
}
console.log('Copyright occurrences:', yearMap);
