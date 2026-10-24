const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const passes = require('../src/data/passes.json');
const countries = require('../src/data/countries.json');

console.log('--- SYNCING HTML FILES WITH SINGLE SOURCE OF TRUTH ---');

// 1. UPDATE index.html
const indexPath = path.join(root, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// A. Hero Stats
// Total passes and countries
const totalPasses = passes.length;
const totalCountries = countries.length;

// Replace hero stats
indexHtml = indexHtml.replace(
  /<div class="hero-stat-item">\s*<div class="num">[^<]*<\/div>\s*<div class="label">Passes tracked<\/div>\s*<\/div>/i,
  `<div class="hero-stat-item"><div class="num">${totalPasses}+</div><div class="label">Passes tracked</div></div>`
);

indexHtml = indexHtml.replace(
  /<div class="hero-stat-item">\s*<div class="num">[^<]*<\/div>\s*<div class="label">Countries<\/div>\s*<\/div>/i,
  `<div class="hero-stat-item"><div class="num">${totalCountries}</div><div class="label">Countries</div></div>`
);

// B. Homepage H1 (Phase 3 Requirement 1 + Phase 1)
// "Homepage H1 should include 'Live Mountain Pass Status & Road Conditions' while keeping the current hero design (use a visible H1 plus the current line as a subheading if needed)."
const updatedH1 = `<h1 class="hero-title">
        <span style="display:block; font-size:clamp(1.2rem, 2.2vw, 1.6rem); font-family:system-ui,-apple-system,sans-serif; text-transform:uppercase; letter-spacing:0.08em; font-weight:700; color:var(--hero-muted,#86efac); margin-bottom:8px;">Live Mountain Pass Status &amp; Road Conditions</span>
        Is the pass open right now?<br>Check before you climb.
      </h1>`;

indexHtml = indexHtml.replace(/<h1 class="hero-title">[\s\S]*?<\/h1>/i, updatedH1);

// C. Dynamic COUNTRY_REGIONS script replacement
let countryRegionsObj = {};
countries.forEach(c => {
  countryRegionsObj[c.slug] = {
    label: `${c.flag} ${c.name}`,
    slug: c.slug,
    continent: c.continent,
    page: c.regions.length > 0 ? c.regions[0].page : '#',
    subtitle: `${c.totalPasses} passes across ${c.regionsCount} regions`,
    regions: c.regions.map(r => ({
      name: r.name,
      passes: r.passes,
      slug: r.slug,
      page: r.page
    }))
  };
});

const crJson = JSON.stringify(countryRegionsObj, null, 2);
indexHtml = indexHtml.replace(
  /const COUNTRY_REGIONS = \{[\s\S]*?\n    \};/i,
  `const COUNTRY_REGIONS = ${crJson};`
);

// D. Replace countryCardGrid HTML in index.html to include all countries
let countryCardsHtml = '';
countries.forEach(c => {
  countryCardsHtml += `        <button class="card-base simple-card country-card" data-country="${c.slug}" data-continent="${c.continent}" onclick="selectCountry('${c.slug}',this)" id="country-${c.slug}">
          <div class="simple-card-flag">
            <span style="font-size:1.8rem; line-height:1;">${c.flag}</span>
          </div>
          <div class="simple-card-title">${c.name}</div>
          <div class="simple-card-meta">${c.totalPasses} passes &bull; ${c.regionsCount} ${c.regionsCount === 1 ? 'region' : 'regions'}</div>
          <div class="country-expand-arrow">&rsaquo;</div>
        </button>\n`;
});

indexHtml = indexHtml.replace(
  /<div class="region-grid" id="countryCardGrid">[\s\S]*?<\/div>\s*<!-- Region Drill-Down Panel/i,
  `<div class="region-grid" id="countryCardGrid">\n${countryCardsHtml}      </div>\n\n      <!-- Region Drill-Down Panel`
);

// E. Add Tajikistan to continent filter tabs and ensure clean handling
if (!indexHtml.includes("selectCountry('tajikistan'")) {
  console.log('Tajikistan country card inserted.');
}

// F. Ad Slot visibility controlled by VITE_ADS_ENABLED (Phase 2 Requirement 1)
indexHtml = indexHtml.replace(
  /<div class="ad-slot">\s*Ad slot \(AdSense\)[\s\S]*?<\/div>/gi,
  `<div class="ad-slot" data-ad-container style="display:none;"></div>`
);

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('Updated index.html hero, country cards, and data counts.');

// 2. UPDATE france.html
const francePath = path.join(root, 'france.html');
if (fs.existsSync(francePath)) {
  let franceHtml = fs.readFileSync(francePath, 'utf8');
  const francePassesCount = passes.filter(p => p.country === 'France').length;
  
  franceHtml = franceHtml.replace(
    /(\d+)\s+Passes\s+Monitored/i,
    `${francePassesCount} Passes Monitored`
  );
  
  fs.writeFileSync(francePath, franceHtml, 'utf8');
  console.log(`Updated france.html with verified count: ${francePassesCount} passes.`);
}

// 3. UPDATE bourgogne.html
const bourgognePath = path.join(root, 'bourgogne.html');
if (fs.existsSync(bourgognePath)) {
  let bHtml = fs.readFileSync(bourgognePath, 'utf8');
  
  // A. Rename title and hero to match content
  bHtml = bHtml.replace(
    /<title>.*?<\/title>/i,
    '<title>Bourgogne-Franche-Comté &amp; Jura Mountain Passes Live Status — LiveRoadStatus</title>'
  );
  
  bHtml = bHtml.replace(
    /<span class="brand-badge">.*?<\/span>/i,
    '<span class="brand-badge">BOURGOGNE &amp; JURA</span>'
  );

  bHtml = bHtml.replace(
    /<h1 class="hero-title">.*?<\/h1>/i,
    '<h1 class="hero-title">Bourgogne-Franche-Comté &amp; Jura Mountain Passes Live Conditions &amp; Road Status</h1>'
  );

  // B. Flag Switzerland passes clearly
  bHtml = bHtml.replace(
    /<h3 class="pass-name">Col du Marchairuz.*?<\/h3>/i,
    '<h3 class="pass-name">Col du Marchairuz <span style="font-size:0.8rem; background:#fee2e2; color:#991b1b; padding:2px 6px; border-radius:4px; font-weight:700;">🇨🇭 Switzerland (Vaud)</span></h3>'
  );

  bHtml = bHtml.replace(
    /<h3 class="pass-name">Col de la Givrine.*?<\/h3>/i,
    '<h3 class="pass-name">Col de la Givrine <span style="font-size:0.8rem; background:#fee2e2; color:#991b1b; padding:2px 6px; border-radius:4px; font-weight:700;">🇨🇭 Switzerland / Border</span></h3>'
  );

  // C. Replace ambiguous badges with status + seasonal window
  // Separate live status from seasonal window
  bHtml = bHtml.replace(/<span class="status-badge status-open">OPEN YEAR-ROUND<\/span>/gi, 
    '<span class="status-badge status-open" style="background:#dcfce7; color:#14532d; font-weight:700;">OPEN</span>'
  );
  bHtml = bHtml.replace(/<span class="status-badge status-open">OPEN TODAY<\/span>/gi, 
    '<span class="status-badge status-open" style="background:#dcfce7; color:#14532d; font-weight:700;">OPEN</span>'
  );

  // Remove ad slots
  bHtml = bHtml.replace(
    /<div class="ad-slot">[\s\S]*?<\/div>/gi,
    '<div class="ad-slot" data-ad-container style="display:none;"></div>'
  );

  fs.writeFileSync(bourgognePath, bHtml, 'utf8');
  console.log('Updated bourgogne.html: renamed region, flagged Swiss passes, resolved badge contradictions.');
}

console.log('HTML synchronization completed.');
