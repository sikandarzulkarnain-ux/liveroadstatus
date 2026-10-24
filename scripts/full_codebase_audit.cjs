const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log('=== FULL CODEBASE AUDIT ===');
console.log('Total root HTML files:', htmlFiles.length);

// 1. Inspect Index.html Hero vs Country cards vs data
const indexContent = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// Hero stats
const heroTextMatch = indexContent.match(/120\+?\s*passes/i);
console.log('Hero text match:', heroTextMatch ? heroTextMatch[0] : 'None');

// Country cards in index.html
const countryCardMatches = [...indexContent.matchAll(/class=["'][^"']*country-card[^"']*["'][\s\S]*?<h3[^>]*>([^<]+)<\/h3>/gi)];
console.log('Country cards count in index.html:', countryCardMatches.length);
console.log('Countries listed in index.html:', countryCardMatches.map(m => m[1].trim()));

// Check Pamir Highway / Tajikistan mentions
const tajikistanMatch = indexContent.match(/Tajikistan/gi);
console.log('Tajikistan occurrences in index.html:', tajikistanMatch ? tajikistanMatch.length : 0);

// France stats in index.html vs france.html
const franceInIndex = indexContent.match(/France[\s\S]*?(\d+)\s+passes/i);
console.log('France in index.html pass count match:', franceInIndex ? franceInIndex[0] : 'None');

let franceHtmlPasses = 0;
if (fs.existsSync(path.join(root, 'france.html'))) {
  const franceContent = fs.readFileSync(path.join(root, 'france.html'), 'utf8');
  const fpMatch = franceContent.match(/(\d+)\s+passes\s+monitored/i);
  console.log('france.html hero passes match:', fpMatch ? fpMatch[0] : 'None');
  franceHtmlPasses = (franceContent.match(/class=["']pass-card/g) || []).length;
  console.log('france.html pass-card count:', franceHtmlPasses);
}

// Check bourgogne.html
if (fs.existsSync(path.join(root, 'bourgogne.html'))) {
  const bContent = fs.readFileSync(path.join(root, 'bourgogne.html'), 'utf8');
  const bPassCards = (bContent.match(/class=["']pass-card/g) || []).length;
  console.log('bourgogne.html pass-card count:', bPassCards);
  const openToday = (bContent.match(/OPEN TODAY/gi) || []).length;
  const openYearRound = (bContent.match(/OPEN YEAR-ROUND/gi) || []).length;
  console.log('bourgogne.html "OPEN TODAY":', openToday, '"OPEN YEAR-ROUND":', openYearRound);
  
  // Switzerland passes
  const marchairuz = bContent.includes('Marchairuz');
  const givrine = bContent.includes('Givrine');
  console.log('bourgogne.html contains Marchairuz:', marchairuz, 'Givrine:', givrine);
}

// Check ad slots
let filesWithAds = 0;
htmlFiles.forEach(f => {
  const c = fs.readFileSync(path.join(root, f), 'utf8');
  if (c.includes('Ad slot') || c.includes('adsbygoogle') || c.includes('AdSense')) {
    filesWithAds++;
  }
});
console.log('HTML files with Ad slots/placeholders:', filesWithAds);

// Check all pass cards across all HTML files
let totalPassesFound = 0;
const passesByFile = {};
htmlFiles.forEach(f => {
  const c = fs.readFileSync(path.join(root, f), 'utf8');
  const count = (c.match(/class=["']pass-card/g) || []).length;
  if (count > 0) {
    passesByFile[f] = count;
    totalPassesFound += count;
  }
});
console.log('Total pass-card elements across all HTML files:', totalPassesFound);
console.log('Files with pass-card counts:', passesByFile);
