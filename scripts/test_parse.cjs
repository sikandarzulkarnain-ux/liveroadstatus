const fs = require('fs');

const filesToTest = ['himachal.html', 'britishcolumbia.html', 'valais.html', 'lombardy.html'];

for (const file of filesToTest) {
  const content = fs.readFileSync(file, 'utf8');
  // Match either <article ... class="...pass-card..." ...> ... </article>
  // OR <div ... class="...pass-card..." ...>
  // A robust way to extract card blocks: split by 'class="pass-card' or regex with tag matching:
  const cardRegex = /<(article|div)[^>]*class=["'][^"']*pass-card[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi;
  const matches = [...content.matchAll(cardRegex)];
  console.log(`${file}: found ${matches.length} pass-cards via tag-matched regex`);
  matches.slice(0, 3).forEach((m, i) => {
    const nameMatch = m[2].match(/<h[234][^>]*class=["'][^"']*pass-name[^"']*["'][^>]*>([^<]+)<\/h[234]>/i) ||
                      m[2].match(/<h[234][^>]*>([^<]+)<\/h[234]>/i);
    console.log(`  Card ${i+1}: ${nameMatch ? nameMatch[1].trim() : 'NO NAME'}`);
  });
}
