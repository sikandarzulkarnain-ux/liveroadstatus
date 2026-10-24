const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Replace nav brand
const navBrandOld = `<a href="index.html" class="nav-brand" aria-label="LiveRoadStatus Home">\n          <span class="dot"></span>\n          <span>LiveRoadStatus</span>\n        </a>`;
const navBrandOldCRLF = `<a href="index.html" class="nav-brand" aria-label="LiveRoadStatus Home">\r\n          <span class="dot"></span>\r\n          <span>LiveRoadStatus</span>\r\n        </a>`;

const navBrandNew = `<a href="index.html" class="nav-brand" aria-label="LiveRoadStatus Home">
          <img src="/logo.webp" alt="LiveRoadStatus Logo" width="28" height="28" style="border-radius:6px; object-fit:contain; display:inline-block;" />
          <span>LiveRoadStatus</span>
        </a>`;

if (content.includes(navBrandOld)) {
  content = content.replace(navBrandOld, navBrandNew);
  console.log('Replaced navBrandOld (LF)');
} else if (content.includes(navBrandOldCRLF)) {
  content = content.replace(navBrandOldCRLF, navBrandNew);
  console.log('Replaced navBrandOld (CRLF)');
} else {
  // Regex fallback
  content = content.replace(/<a\s+href="index\.html"\s+class="nav-brand"[^>]*>[\s\S]*?<\/a>/i, navBrandNew);
  console.log('Replaced navBrand with regex');
}

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Updated index.html successfully!');
