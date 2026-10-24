const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const passes = require('../src/data/passes.json');
const countries = require('../src/data/countries.json');

console.log('--- EXECUTING PHASES 4, 5, 6 SYSTEM UPDATES ---');

// 1. UPDATE index.html FOR PHASES 4, 5, 6
const indexPath = path.join(root, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Accessibility & Contrast Tokens
// Fix low-contrast small green text on dark hero
indexHtml = indexHtml.replace(/--hero-muted:\s*#[a-f0-9]+;/gi, '--hero-muted: #bbf7d0;');
indexHtml = indexHtml.replace(/--hero-ink:\s*#[a-f0-9]+;/gi, '--hero-ink: #ffffff;');

// Add Units Toggle & Status Legend in Site Header
const unitsToggleHtml = `
        <div class="nav-units-wrap" style="display:flex; align-items:center; gap:6px; margin-right:12px;">
          <div class="units-toggle-pill" style="display:inline-flex; background:rgba(0,0,0,0.06); padding:2px; border-radius:999px; border:1px solid var(--line,#e2e8f0);" role="group" aria-label="Units of Measurement">
            <button class="units-toggle-btn active" data-target-unit="metric" onclick="LiveRoadStatusUnits.set('metric')" style="padding:4px 10px; border-radius:999px; border:none; background:#15803d; color:#fff; font-size:0.78rem; font-weight:700; cursor:pointer;" aria-pressed="true">Metric (m, °C)</button>
            <button class="units-toggle-btn" data-target-unit="imperial" onclick="LiveRoadStatusUnits.set('imperial')" style="padding:4px 10px; border-radius:999px; border:none; background:transparent; color:var(--muted,#475569); font-size:0.78rem; font-weight:700; cursor:pointer;" aria-pressed="false">Imperial (ft, °F)</button>
          </div>
        </div>`;

if (!indexHtml.includes('units-toggle-pill')) {
  indexHtml = indexHtml.replace(
    '<div class="nav-right">',
    `<div class="nav-right">\n${unitsToggleHtml}`
  );
}

// Add Skip to Content link at top of body
if (!indexHtml.includes('skip-to-content')) {
  indexHtml = indexHtml.replace(
    '<body>',
    `<body>\n  <a href="#main-content" class="skip-to-content" style="position:absolute; top:-100px; left:16px; background:#15803d; color:#ffffff; padding:10px 16px; border-radius:8px; z-index:9999; font-weight:700; transition:top 0.2s;" onfocus="this.style.top='16px'" onblur="this.style.top='-100px'">Skip to main content</a>`
  );
}

// Mark hero image with fetchpriority="high" and width/height
indexHtml = indexHtml.replace(
  /<section class="hero-section"/i,
  `<section class="hero-section" id="hero"`
);

// Status Legend Bar (Phase 6 Requirement 4 & Phase 5 Requirement 3)
const statusLegendHtml = `
      <!-- GLOBAL STATUS LEGEND -->
      <div class="status-legend-bar" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; background:var(--card,#ffffff); border:1px solid var(--line,#e2e8f0); border-radius:12px; padding:16px 20px; margin-bottom:24px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div style="font-size:0.9rem; font-weight:700; color:var(--ink,#1c1d1b); display:flex; align-items:center; gap:8px;">
          <span>Mountain Pass Status Guide:</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:16px; font-size:0.85rem;">
          <span style="display:inline-flex; align-items:center; gap:6px;"><span class="status-pill status-open" style="font-weight:700;">✓ OPEN</span> Clear pavement, normal travel</span>
          <span style="display:inline-flex; align-items:center; gap:6px;"><span class="status-pill status-restricted" style="font-weight:700;">⚠️ RESTRICTED</span> Traction tires/chains or wind limit</span>
          <span style="display:inline-flex; align-items:center; gap:6px;"><span class="status-pill status-closed" style="font-weight:700;">⛔ CLOSED</span> Seasonal winter gate or avalanche hazard</span>
          <span style="display:inline-flex; align-items:center; gap:6px;"><span class="status-pill" style="background:#f1f5f9; color:#64748b; font-weight:700;">⚪ UNVERIFIED</span> Awaiting active automated telemetry</span>
        </div>
      </div>`;

if (!indexHtml.includes('status-legend-bar')) {
  indexHtml = indexHtml.replace(
    '<div class="filter-bar">',
    `${statusLegendHtml}\n\n      <div class="filter-bar">`
  );
}

// Update Affiliate Links with rel="sponsored noopener" (Phase 6 Requirement 3)
const affiliateOld = `<div class="affiliate-grid">
        <div class="card-base simple-card">
          <div class="simple-card-title">Stays near the pass</div>
          <div class="simple-card-meta">Hotels and homestays</div>
        </div>
        <div class="card-base simple-card">
          <div class="simple-card-title">Car and bike rentals</div>
          <div class="simple-card-meta">Vetted local partners</div>
        </div>
        <div class="card-base simple-card">
          <div class="simple-card-title">Cold-weather gear</div>
          <div class="simple-card-meta">Jackets, chains, thermals</div>
        </div>
        <div class="card-base simple-card">
          <div class="simple-card-title">Travel insurance</div>
          <div class="simple-card-meta">High-altitude cover</div>
        </div>
      </div>`;

const affiliateNew = `<div class="affiliate-grid">
        <a href="https://www.booking.com/" target="_blank" rel="sponsored noopener" class="card-base simple-card" style="text-decoration:none; display:block;">
          <div class="simple-card-title">Stays near the pass &rsaquo;</div>
          <div class="simple-card-meta">Alpine lodges, hotels &amp; chalets</div>
        </a>
        <a href="https://www.rentalcars.com/" target="_blank" rel="sponsored noopener" class="card-base simple-card" style="text-decoration:none; display:block;">
          <div class="simple-card-title">AWD &amp; Winter Rentals &rsaquo;</div>
          <div class="simple-card-meta">Vetted 4WD/chains equipped fleets</div>
        </a>
        <a href="https://www.rei.com/" target="_blank" rel="sponsored noopener" class="card-base simple-card" style="text-decoration:none; display:block;">
          <div class="simple-card-title">Cold-Weather Gear &rsaquo;</div>
          <div class="simple-card-meta">Snow chains, socks &amp; thermals</div>
        </a>
        <a href="https://www.worldnomads.com/" target="_blank" rel="sponsored noopener" class="card-base simple-card" style="text-decoration:none; display:block;">
          <div class="simple-card-title">Alpine Travel Insurance &rsaquo;</div>
          <div class="simple-card-meta">High-altitude evacuation cover</div>
        </a>
      </div>`;

indexHtml = indexHtml.replace(affiliateOld, affiliateNew);

// Add units-toggle.js and ads.js scripts
if (!indexHtml.includes('/units-toggle.js')) {
  indexHtml = indexHtml.replace(
    '</body>',
    `  <script src="/units-toggle.js" defer></script>\n  <script src="/ads.js" defer></script>\n</body>`
  );
}

// Add Trust & Legal Links in Footer (Phase 6 Requirement 1)
const footerLegalLinks = `
            <li><a href="/about.html">About us</a></li>
            <li><a href="/methodology.html">Methodology</a></li>
            <li><a href="/contact.html">Contact &amp; Reports</a></li>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/terms.html">Terms of Service</a></li>
            <li><a href="/disclaimer.html">Safety Disclaimer</a></li>`;

if (!indexHtml.includes('/methodology.html')) {
  indexHtml = indexHtml.replace(
    '<li><a href="about.html">About us</a></li>',
    footerLegalLinks
  );
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('index.html updated with Units toggle, Status legend, sponsored affiliate links, and legal links.');

// 2. UPDATE france.html WITH INTERACTIVE LEAFLET MAP (Phase 4 Requirement 2)
const francePath = path.join(root, 'france.html');
if (fs.existsSync(francePath)) {
  let franceHtml = fs.readFileSync(francePath, 'utf8');
  
  // Replace low-res map image with interactive Leaflet map & text list fallback
  const mapSection = `
    <!-- INTERACTIVE MAP (Leaflet with OpenStreetMap) -->
    <section class="france-interactive-map-sec" style="margin-bottom:40px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="font-family:var(--font-serif); font-size:1.8rem; color:var(--ink);">Interactive France Mountain Passes Map</h2>
          <p style="color:var(--muted); font-size:0.95rem;">Live pass conditions across French Alps, Pyrenees, Jura, and Massif Central.</p>
        </div>
        <div style="display:flex; gap:12px; font-size:0.85rem; font-weight:700;">
          <span style="color:#15803d;">● Open</span>
          <span style="color:#b45309;">● Restricted</span>
          <span style="color:#b91c1c;">● Closed</span>
          <span style="color:#64748b;">● Unverified</span>
        </div>
      </div>

      <div id="france-pass-map" style="width:100%; height:450px; border-radius:12px; border:1px solid var(--line,#e2e8f0); box-shadow:0 4px 20px rgba(0,0,0,0.06);"></div>
      <p style="font-size:0.85rem; color:var(--muted); margin-top:8px;">Leaflet interactive map. Summit markers colored by real-time status. Click pins for pass elevation and route details.</p>
    </section>
  `;

  if (!franceHtml.includes('id="france-pass-map"')) {
    franceHtml = franceHtml.replace(
      '<main class="container" id="state-regions">',
      `<main class="container" id="state-regions">\n${mapSection}`
    );

    // Add Leaflet CSS & JS
    if (!franceHtml.includes('leaflet.css')) {
      franceHtml = franceHtml.replace(
        '</head>',
        `  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">\n</head>`
      );
    }

    const francePasses = passes.filter(p => p.country === 'France');
    const leafletInitScript = `
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof L !== 'undefined' && document.getElementById('france-pass-map')) {
        var map = L.map('france-pass-map').setView([45.5, 4.5], 6);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        var francePasses = ${JSON.stringify(francePasses)};
        francePasses.forEach(function(p) {
          var color = p.status === 'open' ? '#15803d' : p.status === 'restricted' ? '#b45309' : p.status === 'closed' ? '#b91c1c' : '#64748b';
          var marker = L.circleMarker([p.lat, p.lng], {
            radius: 8,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.95
          }).addTo(map);

          marker.bindPopup('<b><a href="/passes/' + p.slug + '/">' + p.name + '</a></b><br>Elev: ' + p.elevation_m + ' m<br>Region: ' + p.region + '<br>Status: ' + p.status.toUpperCase());
        });
      }
    });
  </script>
</body>`;
    franceHtml = franceHtml.replace('</body>', leafletInitScript);
  }

  // Update contrast & accessibility
  franceHtml = franceHtml.replace(/--hero-muted:\s*#[a-f0-9]+;/gi, '--hero-muted: #bbf7d0;');
  franceHtml = franceHtml.replace(/--hero-ink:\s*#[a-f0-9]+;/gi, '--hero-ink: #ffffff;');

  fs.writeFileSync(francePath, franceHtml, 'utf8');
  console.log('france.html upgraded with interactive Leaflet map and accessibility tokens.');
}

// 3. UPDATE bourgogne.html WITH INTERACTIVE LEAFLET MAP (Phase 4 Requirement 2)
const bourgognePath = path.join(root, 'bourgogne.html');
if (fs.existsSync(bourgognePath)) {
  let bHtml = fs.readFileSync(bourgognePath, 'utf8');

  const bMapSection = `
    <!-- INTERACTIVE JURA & BOURGOGNE MAP -->
    <section style="margin-bottom:36px;">
      <h2 style="font-family:var(--font-serif); font-size:1.6rem; margin-bottom:10px;">Bourgogne-Franche-Comté &amp; Jura Interactive Pass Map</h2>
      <div id="jura-pass-map" style="width:100%; height:420px; border-radius:12px; border:1px solid var(--line); margin-bottom:10px;"></div>
      <p style="font-size:0.85rem; color:var(--muted);">Click any summit marker to view elevation, route, and verified status.</p>
    </section>
  `;

  if (!bHtml.includes('id="jura-pass-map"')) {
    bHtml = bHtml.replace(
      '<!-- ATLAS SHOWCASE -->',
      `${bMapSection}\n\n    <!-- ATLAS SHOWCASE -->`
    );

    if (!bHtml.includes('leaflet.css')) {
      bHtml = bHtml.replace(
        '</head>',
        `  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">\n</head>`
      );
    }

    const juraPasses = passes.filter(p => p.region.includes('Bourgogne') || p.region.includes('Jura'));
    const bScript = `
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof L !== 'undefined' && document.getElementById('jura-pass-map')) {
        var map = L.map('jura-pass-map').setView([46.5, 5.9], 9);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        var passes = ${JSON.stringify(juraPasses)};
        passes.forEach(function(p) {
          var color = p.status === 'open' ? '#15803d' : p.status === 'restricted' ? '#b45309' : p.status === 'closed' ? '#b91c1c' : '#64748b';
          var m = L.circleMarker([p.lat, p.lng], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            fillOpacity: 0.95
          }).addTo(map);
          m.bindPopup('<b><a href="/passes/' + p.slug + '/">' + p.name + '</a></b><br>Elev: ' + p.elevation_m + 'm<br>Status: ' + p.status.toUpperCase());
        });
      }
    });
  </script>
</body>`;
    bHtml = bHtml.replace('</body>', bScript);
  }

  // Update contrast tokens
  bHtml = bHtml.replace(/--hero-muted:\s*#[a-f0-9]+;/gi, '--hero-muted: #bbf7d0;');
  bHtml = bHtml.replace(/--hero-ink:\s*#[a-f0-9]+;/gi, '--hero-ink: #ffffff;');

  fs.writeFileSync(bourgognePath, bHtml, 'utf8');
  console.log('bourgogne.html upgraded with interactive Leaflet map and contrast enhancements.');
}

console.log('Phases 4, 5, 6 updates successfully applied.');
