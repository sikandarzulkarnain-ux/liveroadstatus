const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') || f.endsWith('.css') || f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.tsx'));

for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  const idx = txt.search(/button[\s_-]+button/i);
  if (idx !== -1) {
    console.log('Found button-button in', f, txt.slice(Math.max(0, idx - 30), idx + 60));
  }
  const idx2 = txt.search(/\bbuttons\b/i);
  if (idx2 !== -1) {
    const matches = [...txt.matchAll(/\bbuttons\b/gi)];
    console.log('Found "buttons" in', f, matches.length, 'times, snippet:', txt.slice(Math.max(0, idx2 - 30), idx2 + 60));
  }
}
