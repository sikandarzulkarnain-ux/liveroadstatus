const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const canonicalMap = {
  'canada.html': 'https://www.liveroadstatus.com/canada/',
  'country.html': 'https://www.liveroadstatus.com/countries/',
  'france.html': 'https://www.liveroadstatus.com/france/',
  'india.html': 'https://www.liveroadstatus.com/india/',
  'italy.html': 'https://www.liveroadstatus.com/italy/',
  'switzerland.html': 'https://www.liveroadstatus.com/switzerland/',
  'usa.html': 'https://www.liveroadstatus.com/united-states/'
};

Object.entries(canonicalMap).forEach(([file, canonicalUrl]) => {
  const filePath = path.join(root, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('rel="canonical"')) {
      content = content.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}">\n</head>`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Added canonical link to ${file}: ${canonicalUrl}`);
    }
  }
});

// Fix khyber.html H1
const khyberPath = path.join(root, 'khyber.html');
if (fs.existsSync(khyberPath)) {
  let content = fs.readFileSync(khyberPath, 'utf8');
  if (!content.includes('<h1')) {
    content = content.replace('<body>', '<body>\n  <h1 style="font-size:1.2rem; margin:20px 0;">Khyber Pakhtunkhwa Mountain Passes</h1>');
    fs.writeFileSync(khyberPath, content, 'utf8');
    console.log('Added H1 to khyber.html');
  }
}
