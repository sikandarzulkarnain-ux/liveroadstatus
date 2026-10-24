const fs = require('fs');
const path = require('path');

function replaceNavBrand(html) {
  // Replace schema logo
  html = html.replace(
    /"logo":\s*"https:\/\/www\.liveroadstatus\.com\/homepage_bg\.jpg"/g,
    '"logo": "https://www.liveroadstatus.com/logo.png"'
  );

  // Replace nav brand with new logo if it has the old .dot pattern
  const navBrandPattern = /<a\s+([^>]*?)class="nav-brand"([^>]*?)>\s*<span\s+class="dot"><\/span>\s*<span>LiveRoadStatus<\/span>\s*<\/a>/gi;
  html = html.replace(navBrandPattern, (match, p1, p2) => {
    return `<a ${p1}class="nav-brand"${p2}>\n          <img src="/logo.webp" alt="LiveRoadStatus Logo" width="28" height="28" style="border-radius:6px; object-fit:contain; display:inline-block;" />\n          <span>LiveRoadStatus</span>\n        </a>`;
  });

  return html;
}

let modifiedCount = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const orig = fs.readFileSync(fullPath, 'utf8');
      const updated = replaceNavBrand(orig);
      if (updated !== orig) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        modifiedCount++;
      }
    }
  }
}

walk(path.resolve(__dirname, '..'));
console.log(`Updated nav-brand and logo schema in ${modifiedCount} HTML files.`);
