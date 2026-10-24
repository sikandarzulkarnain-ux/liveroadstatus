const fs = require('fs');
const files = ['colorado.html', 'alaska.html', 'washington.html', 'france.html'];
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  const btns = [...txt.matchAll(/<button[^>]*class=["'][^"']*(btn-detail|btn-alert|btn-view)[^"']*["'][^>]*>[\s\S]*?<\/button>/gi)];
  console.log(`=== ${f} has ${btns.length} detail/alert buttons ===`);
  if (btns.length > 0) {
    console.log(btns.slice(0, 3).map(b => b[0]));
  }
}
