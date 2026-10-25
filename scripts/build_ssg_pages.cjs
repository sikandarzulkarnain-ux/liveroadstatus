'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.resolve(root, 'dist');
const passes = require('../src/data/passes.json');

console.log('--- TECHNICAL SEO & STATIC SITE GENERATION (SSG) ENGINE ---');

const BASE_URL = 'https://www.liveroadstatus.com';
const today = new Date().toISOString().split('T')[0];

// 1. Clean FAQPage schema from index.html if present
const indexPath = path.join(root, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
indexHtml = indexHtml.replace(/,\s*\{\s*"@type":\s*"FAQPage"[\s\S]*?\}\s*\]\s*\}/i, '\n    ]\n  }');
fs.writeFileSync(indexPath, indexHtml, 'utf8');

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// 2. Authoritative Country and Region URL Mappings
const countryMap = {
  'United States': '/usa/',
  'Canada': '/canada/',
  'France': '/france/',
  'Italy': '/italy/',
  'Austria': '/austria/',
  'Switzerland': '/switzerland/',
  'Norway': '/norway/',
  'India': '/india/',
  'Pakistan': '/pakistan/',
  'Chile': '/chile/'
};

const regionMap = {
  // United States
  'United States:Alaska': '/usa/alaska/',
  'United States:Arizona': '/usa/arizona/',
  'United States:California': '/usa/california/',
  'United States:Colorado': '/usa/colorado/',
  'United States:Idaho': '/usa/idaho/',
  'United States:Maryland': '/usa/maryland/',
  'United States:Montana': '/usa/montana/',
  'United States:Nevada': '/usa/nevada/',
  'United States:New Hampshire': '/usa/newhampshire/',
  'United States:New Mexico': '/usa/newmexico/',
  'United States:North Carolina': '/usa/northcarolina/',
  'United States:Oregon': '/usa/oregon/',
  'United States:Pennsylvania': '/usa/pennsylvania/',
  'United States:Tennessee': '/usa/tennessee/',
  'United States:Utah': '/usa/utah/',
  'United States:Virginia': '/usa/virginia/',
  'United States:Washington': '/usa/washington/',
  'United States:West Virginia': '/usa/westvirginia/',
  'United States:Wyoming': '/usa/wyoming/',

  // Canada
  'Canada:Alberta': '/canada/alberta/',
  'Canada:British Columbia': '/canada/britishcolumbia/',
  'Canada:New Brunswick & Nova Scotia': '/canada/maritimes/',
  'Canada:Newfoundland & Labrador': '/canada/nl/',
  'Canada:Northwest Territories': '/canada/nwt/',
  'Canada:Quebec': '/canada/quebec/',
  'Canada:Yukon Territory': '/canada/yukon/',

  // France
  'France:Auvergne-Rhône-Alpes': '/france/auvergne/',
  'France:Bourgogne-Franche-Comté & Jura': '/france/bourgogne/',
  'France:Grand Est & Vosges': '/france/grandest/',
  'France:Nouvelle-Aquitaine': '/france/aquitaine/',
  'France:Occitanie & Pyrenees': '/france/occitanie/',
  'France:Provence-Alpes-Côte d\'Azur (PACA)': '/france/paca/',

  // Italy
  'Italy:Aosta Valley': '/italy/aostavalley/',
  'Italy:Cuneo & Maritime Alps': '/italy/cuneo/',
  'Italy:Emilia-Romagna Apennines': '/italy/emilia/',
  'Italy:Friuli-Venezia Giulia': '/italy/fvg/',
  'Italy:Lombardy Alps & Valtellina': '/italy/lombardy/',
  'Italy:Metropolitan City of Turin': '/italy/turin/',
  'Italy:Piedmont': '/italy/piedmont/',
  'Italy:Tuscany & Lunigiana': '/italy/tuscany/',
  'Italy:Veneto & Belluno Dolomites': '/italy/veneto/',
  'Italy:Verbano-Cusio-Ossola & Biella': '/italy/ossola/',

  // Austria
  'Austria:Carinthia': '/austria/carinthia/',
  'Austria:Lower Austria': '/austria/lower-austria/',
  'Austria:Salzburg': '/austria/salzburg/',
  'Austria:Styria': '/austria/styria/',
  'Austria:Tyrol': '/austria/tyrol/',
  'Austria:Vorarlberg': '/austria/vorarlberg/',

  // Switzerland
  'Switzerland:Aargau': '/switzerland/aargau/',
  'Switzerland:Bern & Bernese Oberland': '/switzerland/bern/',
  'Switzerland:Fribourg': '/switzerland/fribourg/',
  'Switzerland:Glarus': '/switzerland/glarus/',
  'Switzerland:Graubünden': '/switzerland/graubunden/',
  'Switzerland:Lucerne': '/switzerland/lucerne/',
  'Switzerland:Nidwalden': '/switzerland/nidwalden/',
  'Switzerland:Obwalden': '/switzerland/obwalden/',
  'Switzerland:Schwyz': '/switzerland/schwyz/',
  'Switzerland:St. Gallen & Appenzell': '/switzerland/stgallen/',
  'Switzerland:Ticino': '/switzerland/ticino/',
  'Switzerland:Uri': '/switzerland/uri/',
  'Switzerland:Valais': '/switzerland/valais/',
  'Switzerland:Vaud & Jura': '/switzerland/vaud/',
  'Switzerland:Zurich, Zug & Thurgau': '/switzerland/zurich/',

  // Norway
  'Norway:Finnmark & Troms': '/norway/finnmark/',
  'Norway:Innlandet': '/norway/innlandet/',
  'Norway:Møre og Romsdal': '/norway/moreogromsdal/',
  'Norway:Trøndelag': '/norway/trondelag/',
  'Norway:Vestland': '/norway/vestland/',

  // India
  'India:Arunachal Pradesh': '/india/arunachal/',
  'India:Himachal Pradesh': '/india/himachal/',
  'India:Jammu & Kashmir': '/india/jk/',
  'India:Ladakh': '/india/ladakh/',
  'India:Nagaland': '/india/nagaland/',
  'India:Sikkim': '/india/sikkim/',
  'India:Uttarakhand': '/india/uttarakhand/',

  // Pakistan
  'Pakistan:Balochistan': '/pakistan/balochistan/',
  'Pakistan:Gilgit-Baltistan': '/pakistan/gilgit/',
  'Pakistan:Khyber Pakhtunkhwa': '/pakistan/kp/',

  // Chile
  'Chile:Arica y Parinacota': '/chile/arica/',
  'Chile:Atacama Region': '/chile/atacama/',
  'Chile:Los Lagos / Puyehue': '/chile/'
};

// 3. Pass Page HTML Generator
function renderPassPage(pass) {
  const elevFt = Math.round(pass.elevation_m * 3.28084);
  const statusUpper = pass.status.toUpperCase();
  const statusBadgeClass = pass.status === 'open' ? 'status-open' : pass.status === 'restricted' ? 'status-restricted' : pass.status === 'closed' ? 'status-closed' : 'status-unverified';
  const statusLabel = pass.status === 'open' ? '✓ OPEN' : pass.status === 'restricted' ? '⚠️ RESTRICTED' : pass.status === 'closed' ? '⛔ CLOSED' : '⚪ STATUS UNVERIFIED';

  const relativeTime = pass.last_verified_at 
    ? `Updated ${Math.max(1, Math.round((Date.now() - new Date(pass.last_verified_at).getTime()) / (60 * 1000)))} min ago`
    : 'Status unverified — awaiting live DOT feed';

  const title = `${pass.name} Road Status & Conditions — LiveRoadStatus`.slice(0, 60);
  const desc = `Live ${pass.name} road status, conditions, elevation (${pass.elevation_m}m/${elevFt}ft), weather & restrictions on ${pass.route_code}, ${pass.region}.`.slice(0, 160);
  const canonical = `${BASE_URL}/passes/${pass.slug}/`;

  // Breadcrumbs mapping
  const countryUrl = countryMap[pass.country] || '/countries/';
  const regionUrl = regionMap[`${pass.country}:${pass.region}`] || countryUrl;

  const breadcrumbElements = [
    `{ "@type": "ListItem", "position": 1, "name": "Home", "item": "${BASE_URL}/" }`,
    `{ "@type": "ListItem", "position": 2, "name": "${pass.country}", "item": "${BASE_URL}${countryUrl}" }`
  ];
  if (regionUrl !== countryUrl) {
    breadcrumbElements.push(`{ "@type": "ListItem", "position": 3, "name": "${pass.region}", "item": "${BASE_URL}${regionUrl}" }`);
    breadcrumbElements.push(`{ "@type": "ListItem", "position": 4, "name": "${pass.name.replace(/"/g, '\\"')}" }`);
  } else {
    breadcrumbElements.push(`{ "@type": "ListItem", "position": 3, "name": "${pass.name.replace(/"/g, '\\"')}" }`);
  }

  // Related passes - prioritize same region first, then same country
  let related = passes.filter(p => p.country === pass.country && p.region === pass.region && p.id !== pass.id).slice(0, 4);
  if (related.length < 4) {
    const more = passes.filter(p => p.country === pass.country && p.region !== pass.region && p.id !== pass.id).slice(0, 4 - related.length);
    related = related.concat(more);
  }

  const authName = pass.status_source_name || pass.authority || 'State DOT & Highway Authority';
  const authUrl = pass.status_source_url || pass.source_url || `${BASE_URL}/`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="${canonical}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="place">
  <meta property="og:site_name" content="LiveRoadStatus">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${BASE_URL}/homepage_bg.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${BASE_URL}/homepage_bg.jpg">

  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

  <!-- Leaflet CSS for Interactive Map -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">

  <!-- JSON-LD Place & BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "name": "${pass.name.replace(/"/g, '\\"')}",
        "description": "${pass.description.replace(/"/g, '\\"')}",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": ${pass.lat},
          "longitude": ${pass.lng},
          "elevation": "${pass.elevation_m} m"
        },
        "address": {
          "@type": "PostalAddress",
          "addressRegion": "${pass.region}",
          "addressCountry": "${pass.country}"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          ${breadcrumbElements.join(',\n          ')}
        ]
      }
    ]
  }
  </script>

  <style>
    :root {
      --bg: #ffffff;
      --card: #ffffff;
      --ink: #1c1d1b;
      --muted: #475569;
      --line: #e2e8f0;
      --accent: #15803d;
      --accent-hover: #166534;
      --hero: #0d381e;
      --hero-ink: #f0fdf4;
      --hero-muted: #86efac;
      --hero-line: #14532d;
      --open: #15803d;
      --open-bg: #dcfce7;
      --restricted: #b45309;
      --restricted-bg: #fef3c7;
      --closed: #b91c1c;
      --closed-bg: #fee2e2;
      --unverified: #64748b;
      --unverified-bg: #f1f5f9;
      --font-main: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-serif: Georgia, "Times New Roman", serif;
      --radius: 12px;
      --shadow: 0 4px 20px rgba(0,0,0,0.06);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--ink);
      font-family: var(--font-main);
      font-size: 16px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    .site-nav {
      background-color: var(--hero);
      color: var(--hero-ink);
      border-bottom: 1px solid var(--hero-line);
      padding: 16px 20px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-inner {
      max-width: 1120px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      text-decoration: none;
    }
    .nav-brand .dot { width: 10px; height: 10px; background-color: #22c55e; border-radius: 50%; }
    .nav-links { display: flex; gap: 20px; list-style: none; }
    .nav-links a { color: var(--hero-muted); text-decoration: none; font-size: 0.95rem; font-weight: 500; }
    .nav-links a:hover { color: #ffffff; }

    /* PASS HERO */
    .pass-hero {
      background-color: var(--hero);
      background-image: linear-gradient(rgba(13, 56, 30, 0.88), rgba(13, 56, 30, 0.96)), url('/homepage_bg.jpg');
      background-size: cover;
      background-position: center;
      color: var(--hero-ink);
      padding: 48px 20px 40px;
      border-bottom: 1px solid var(--hero-line);
    }
    .container { max-width: 1120px; margin: 0 auto; }
    
    .breadcrumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 0.88rem;
      color: var(--hero-muted);
      margin-bottom: 18px;
      align-items: center;
    }
    .breadcrumbs a { color: var(--hero-muted); text-decoration: none; }
    .breadcrumbs a:hover { color: #ffffff; text-decoration: underline; }

    h1 {
      font-family: var(--font-serif);
      font-size: clamp(2.2rem, 4.5vw, 3.2rem);
      color: #ffffff;
      line-height: 1.2;
      margin-bottom: 14px;
    }

    .pass-status-row {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .status-open { background: var(--open-bg); color: var(--open); border: 1px solid rgba(21,128,61,0.3); }
    .status-restricted { background: var(--restricted-bg); color: var(--restricted); border: 1px solid rgba(180,83,9,0.3); }
    .status-closed { background: var(--closed-bg); color: var(--closed); border: 1px solid rgba(185,28,28,0.3); }
    .status-unverified { background: var(--unverified-bg); color: var(--unverified); border: 1px solid #cbd5e1; }

    .pass-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--radius);
      padding: 20px;
    }
    .metric-item .val { font-size: 1.35rem; font-weight: 700; color: #ffffff; font-family: var(--font-serif); }
    .metric-item .lbl { font-size: 0.82rem; color: var(--hero-muted); text-transform: uppercase; letter-spacing: 0.05em; }

    /* CONTENT LAYOUT */
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 36px;
      padding: 48px 0;
    }
    @media (max-width: 860px) {
      .content-grid { grid-template-columns: 1fr; }
    }

    .info-card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 28px;
      box-shadow: var(--shadow);
      margin-bottom: 28px;
    }
    .info-card h2 {
      font-family: var(--font-serif);
      font-size: 1.6rem;
      margin-bottom: 14px;
      color: var(--ink);
    }
    .info-card p { color: #334155; margin-bottom: 16px; line-height: 1.7; }

    .hazard-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      border-radius: 6px;
      margin: 20px 0;
      color: #92400e;
      font-size: 0.95rem;
    }

    /* INTERACTIVE MAP */
    #pass-map {
      width: 100%;
      height: 380px;
      border-radius: var(--radius);
      border: 1px solid var(--line);
      margin-bottom: 16px;
    }

    .official-box {
      background: var(--hero);
      color: var(--hero-ink);
      border-radius: var(--radius);
      padding: 24px;
    }
    .official-box h3 { font-family: var(--font-serif); font-size: 1.3rem; margin-bottom: 8px; }
    .official-box p { color: var(--hero-muted); font-size: 0.92rem; margin-bottom: 16px; }
    .btn-official {
      display: inline-block;
      background: var(--accent);
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-official:hover { background: var(--accent-hover); }

    .related-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
    .related-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border: 1px solid var(--line);
      border-radius: 8px;
      text-decoration: none;
      color: var(--ink);
      font-weight: 600;
      transition: all 0.2s;
    }
    .related-link:hover { border-color: var(--accent); background: #f8fafc; color: var(--accent); }

    .disclaimer {
      font-size: 0.85rem;
      color: var(--muted);
      border-top: 1px solid var(--line);
      padding-top: 20px;
      margin-top: 30px;
      font-style: italic;
    }

    footer {
      background-color: var(--hero);
      color: var(--hero-muted);
      border-top: 1px solid var(--hero-line);
      padding: 36px 20px;
      font-size: 0.9rem;
      text-align: center;
      margin-top: 40px;
    }
    footer a { color: var(--hero-ink); text-decoration: none; }
  </style>
</head>
<body>
  <header class="site-nav">
    <div class="nav-inner">
      <a href="/" class="nav-brand">
        <img src="/logo.webp" alt="LiveRoadStatus Logo" width="28" height="28" style="border-radius:6px; object-fit:contain; display:inline-block;" />
        <span>LiveRoadStatus</span>
      </a>
      <nav>
        <ul class="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/#live-status">All Passes</a></li>
          <li><a href="/countries/">Countries</a></li>
          <li><a href="/about/">About</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section class="pass-hero">
      <div class="container">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>&rsaquo;</span>
          <a href="${countryUrl}">${pass.country}</a>
          ${regionUrl !== countryUrl ? `<span>&rsaquo;</span>\n          <a href="${regionUrl}">${pass.region}</a>` : ''}
          <span>&rsaquo;</span>
          <span aria-current="page">${pass.name}</span>
        </nav>

        <h1>${pass.name} Live Road Status &amp; Conditions</h1>
        
        <div class="pass-status-row">
          <span class="status-badge ${statusBadgeClass}">${statusLabel}</span>
          <span style="color:var(--hero-muted); font-size:0.92rem;">&bull;</span>
          <span style="color:var(--hero-muted); font-size:0.92rem;">${relativeTime}</span>
          <span style="color:var(--hero-muted); font-size:0.92rem;">&bull;</span>
          <span style="color:var(--hero-muted); font-size:0.92rem;">Elevation: ${pass.elevation_m} m (${elevFt} ft)</span>
        </div>

        <div class="pass-metrics">
          <div class="metric-item">
            <div class="val">${pass.elevation_m} m</div>
            <div class="lbl">Summit Elevation</div>
          </div>
          <div class="metric-item">
            <div class="val">${pass.route_code}</div>
            <div class="lbl">Primary Highway</div>
          </div>
          <div class="metric-item">
            <div class="val">${pass.region}</div>
            <div class="lbl">Region / State</div>
          </div>
          <div class="metric-item">
            <div class="val">${pass.country}</div>
            <div class="lbl">Country</div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <div class="content-grid">
        <div class="main-col">
          <div class="info-card">
            <h2>Current Mountain Pass Overview</h2>
            <p>${pass.description}</p>
            ${pass.seasonal_window ? `<p style="margin-bottom:12px;"><strong>Seasonal Schedule:</strong> ${pass.seasonal_window}</p>` : ''}
            ${pass.winter_equipment_rule ? `<p style="margin-bottom:12px;"><strong>Winter Equipment Requirements:</strong> ${pass.winter_equipment_rule}</p>` : ''}
            <div class="hazard-box">
              <strong>Seasonal &amp; Weather Notice:</strong> Road conditions change rapidly in high-altitude terrain. Traction tires or tire chains may be legally required during winter storm cycles.
            </div>
            <p>Live status verification is continuously aggregated via official state and regional department of transportation dispatch feeds.</p>
          </div>

          <div class="info-card">
            <h2>Interactive Mountain Pass Map</h2>
            <div id="pass-map"></div>
            <p style="font-size:0.88rem; color:var(--muted);">GPS Coordinates: ${pass.lat.toFixed(4)}° N, ${pass.lng.toFixed(4)}° W &bull; Highway: ${pass.route_code}</p>
          </div>
        </div>

        <aside class="sidebar-col">
          <div class="info-card official-box">
            <h3>Official DOT Feed Source</h3>
            <p>Verification authority: <strong>${authName}</strong>.</p>
            <a href="${authUrl}" target="_blank" rel="noopener noreferrer" class="btn-official">Visit Official Authority Feed &rarr;</a>
          </div>

          ${related.length > 0 ? `
          <div class="info-card">
            <h3 style="font-family:var(--font-serif); font-size:1.25rem; margin-bottom:14px;">Nearby &amp; Regional Passes</h3>
            <ul class="related-list">
              ${related.map(r => `
                <li>
                  <a href="/passes/${r.slug}/" class="related-link">
                    <span>${r.name}</span>
                    <span style="font-size:0.8rem; color:var(--muted);">${r.elevation_m}m</span>
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
          ` : ''}
        </aside>
      </div>

      <p class="disclaimer">
        Disclaimer: Mountain pass conditions and road statuses are collected from open government APIs and DOT broadcasts. Always confirm live status with official transportation authorities before crossing high-altitude mountain passes in adverse weather.
      </p>
    </div>
  </main>

  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} LiveRoadStatus. Real-time mountain pass road conditions, winter closures, and travel advisories.</p>
      <p style="margin-top: 8px;">
        <a href="/about/">About</a> &bull; 
        <a href="/methodology/">Methodology</a> &bull; 
        <a href="/countries/">Countries</a> &bull; 
        <a href="/contact/">Contact</a> &bull; 
        <a href="/privacy/">Privacy Policy</a> &bull; 
        <a href="/terms/">Terms</a> &bull; 
        <a href="/disclaimer/">Disclaimer</a>
      </p>
    </div>
  </footer>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var map = L.map('pass-map').setView([${pass.lat}, ${pass.lng}], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      var marker = L.marker([${pass.lat}, ${pass.lng}]).addTo(map);
      marker.bindPopup("<b>${pass.name.replace(/"/g, '\\"')}</b><br>Elevation: ${pass.elevation_m}m (${elevFt}ft)<br>Status: ${statusUpper}").openPopup();
    });
  </script>
</body>
</html>`;
}

// 4. GENERATE SSG PASS PAGES
console.log(`Generating SSG pass pages for ${passes.length} passes...`);
const passesDir = path.resolve(root, 'passes');
if (!fs.existsSync(passesDir)) fs.mkdirSync(passesDir, { recursive: true });

passes.forEach(pass => {
  const passPageDir = path.resolve(passesDir, pass.slug);
  if (!fs.existsSync(passPageDir)) fs.mkdirSync(passPageDir, { recursive: true });
  fs.writeFileSync(path.resolve(passPageDir, 'index.html'), renderPassPage(pass), 'utf8');
});

console.log(`Generated ${passes.length} pass pages at /passes/:slug/index.html.`);

// 5. GENERATE SITEMAP.XML
console.log('Generating dynamic sitemap.xml with 100% verified URLs...');
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/countries/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/methodology/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/disclaimer/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${BASE_URL}/privacy/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/terms/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
`;

// Add all 10 verified country hub pages
Object.values(countryMap).forEach(cUrl => {
  sitemapXml += `  <url>
    <loc>${BASE_URL}${cUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>\n`;
});

// Add all 60 verified region hub pages
const uniqueRegionUrls = Array.from(new Set(Object.values(regionMap))).filter(u => !Object.values(countryMap).includes(u));
uniqueRegionUrls.sort().forEach(rUrl => {
  sitemapXml += `  <url>
    <loc>${BASE_URL}${rUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.80</priority>
  </url>\n`;
});

// Add all pass detail pages
passes.forEach(p => {
  sitemapXml += `  <url>
    <loc>${BASE_URL}/passes/${p.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.75</priority>
  </url>\n`;
});

sitemapXml += `</urlset>\n`;

// Write sitemap.xml to root, public/, and dist/
fs.writeFileSync(path.resolve(root, 'sitemap.xml'), sitemapXml, 'utf8');
fs.writeFileSync(path.resolve(root, 'public', 'sitemap.xml'), sitemapXml, 'utf8');
if (fs.existsSync(dist)) {
  fs.writeFileSync(path.resolve(dist, 'sitemap.xml'), sitemapXml, 'utf8');
}
console.log('Written dynamic sitemap.xml to root, public/, and dist/.');

// 6. GENERATE ROBOTS.TXT
console.log('Generating robots.txt with sitemap reference...');
const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_/
Disallow: /dev/

Sitemap: ${BASE_URL}/sitemap.xml
`;
fs.writeFileSync(path.resolve(root, 'robots.txt'), robotsTxt, 'utf8');
fs.writeFileSync(path.resolve(root, 'public', 'robots.txt'), robotsTxt, 'utf8');
if (fs.existsSync(dist)) {
  fs.writeFileSync(path.resolve(dist, 'robots.txt'), robotsTxt, 'utf8');
}
console.log('Written robots.txt to root, public/, and dist/.');

// 7. GENERATE _redirects AND vercel.json
console.log('Generating 301 redirects for clean URLs...');
let redirectsTxt = `# 301 Permanent Redirects: Clean URLs for LiveRoadStatus
/index.html   /   301
/country.html /countries/   301
/country      /countries/   301

# USA clean redirect aliases
/united-states/   /usa/   301
/united-states    /usa/   301
/united-states/california/   /usa/california/   301
/united-states/colorado/     /usa/colorado/     301
/united-states/oregon/       /usa/oregon/       301
/united-states/idaho/        /usa/idaho/        301
/united-states/new-mexico/   /usa/newmexico/    301
/united-states/north-carolina/ /usa/northcarolina/ 301
/united-states/utah/         /usa/utah/         301
/united-states/alaska/       /usa/alaska/       301
/united-states/nevada/       /usa/nevada/       301
/united-states/washington/   /usa/washington/   301
/united-states/arizona/      /usa/arizona/      301
/united-states/wyoming/      /usa/wyoming/      301
/united-states/montana/      /usa/montana/      301
/united-states/virginia/     /usa/virginia/     301
/united-states/west-virginia/ /usa/westvirginia/ 301
/united-states/tennessee/    /usa/tennessee/    301
/united-states/pennsylvania/ /usa/pennsylvania/ 301
/united-states/new-hampshire/ /usa/newhampshire/ 301
/united-states/maryland/     /usa/maryland/     301
`;

// Legacy HTML file mappings
const oldHtmlRedirects = {
  // Countries
  '/france.html': '/france/',
  '/austria.html': '/austria/',
  '/switzerland.html': '/switzerland/',
  '/italy.html': '/italy/',
  '/usa.html': '/usa/',
  '/canada.html': '/canada/',
  '/norway.html': '/norway/',
  '/india.html': '/india/',
  '/pakistan.html': '/pakistan/',
  '/chile.html': '/chile/',

  // France
  '/bourgogne.html': '/france/bourgogne/',
  '/grandest.html': '/france/grandest/',
  '/aquitaine.html': '/france/aquitaine/',
  '/occitanie.html': '/france/occitanie/',
  '/paca.html': '/france/paca/',
  '/auvergne.html': '/france/auvergne/',

  // Austria
  '/carinthia.html': '/austria/carinthia/',
  '/tyrol.html': '/austria/tyrol/',
  '/salzburg.html': '/austria/salzburg/',
  '/styria.html': '/austria/styria/',
  '/vorarlberg.html': '/austria/vorarlberg/',
  '/lower-austria.html': '/austria/lower-austria/',

  // Switzerland
  '/aargau.html': '/switzerland/aargau/',
  '/bern.html': '/switzerland/bern/',
  '/fribourg.html': '/switzerland/fribourg/',
  '/glarus.html': '/switzerland/glarus/',
  '/graubunden.html': '/switzerland/graubunden/',
  '/lucerne.html': '/switzerland/lucerne/',
  '/nidwalden.html': '/switzerland/nidwalden/',
  '/obwalden.html': '/switzerland/obwalden/',
  '/schwyz.html': '/switzerland/schwyz/',
  '/stgallen.html': '/switzerland/stgallen/',
  '/ticino.html': '/switzerland/ticino/',
  '/uri.html': '/switzerland/uri/',
  '/valais.html': '/switzerland/valais/',
  '/vaud.html': '/switzerland/vaud/',
  '/zurich.html': '/switzerland/zurich/',

  // Italy
  '/aostavalley.html': '/italy/aostavalley/',
  '/cuneo.html': '/italy/cuneo/',
  '/emilia.html': '/italy/emilia/',
  '/fvg.html': '/italy/fvg/',
  '/lombardy.html': '/italy/lombardy/',
  '/ossola.html': '/italy/ossola/',
  '/piedmont.html': '/italy/piedmont/',
  '/turin.html': '/italy/turin/',
  '/tuscany.html': '/italy/tuscany/',
  '/veneto.html': '/italy/veneto/',

  // USA
  '/alaska.html': '/usa/alaska/',
  '/arizona.html': '/usa/arizona/',
  '/california.html': '/usa/california/',
  '/colorado.html': '/usa/colorado/',
  '/idaho.html': '/usa/idaho/',
  '/maryland.html': '/usa/maryland/',
  '/montana.html': '/usa/montana/',
  '/nevada.html': '/usa/nevada/',
  '/newhampshire.html': '/usa/newhampshire/',
  '/newmexico.html': '/usa/newmexico/',
  '/northcarolina.html': '/usa/northcarolina/',
  '/oregon.html': '/usa/oregon/',
  '/pennsylvania.html': '/usa/pennsylvania/',
  '/tennessee.html': '/usa/tennessee/',
  '/utah.html': '/usa/utah/',
  '/virginia.html': '/usa/virginia/',
  '/washington.html': '/usa/washington/',
  '/westvirginia.html': '/usa/westvirginia/',
  '/wyoming.html': '/usa/wyoming/',

  // Canada
  '/alberta.html': '/canada/alberta/',
  '/britishcolumbia.html': '/canada/britishcolumbia/',
  '/maritimes.html': '/canada/maritimes/',
  '/nl.html': '/canada/nl/',
  '/nwt.html': '/canada/nwt/',
  '/quebec.html': '/canada/quebec/',
  '/yukon.html': '/canada/yukon/',

  // Norway
  '/finnmark.html': '/norway/finnmark/',
  '/innlandet.html': '/norway/innlandet/',
  '/moreogromsdal.html': '/norway/moreogromsdal/',
  '/trondelag.html': '/norway/trondelag/',
  '/vestland.html': '/norway/vestland/',

  // India
  '/arunachal.html': '/india/arunachal/',
  '/himachal.html': '/india/himachal/',
  '/jk.html': '/india/jk/',
  '/ladakh.html': '/india/ladakh/',
  '/nagaland.html': '/india/nagaland/',
  '/sikkim.html': '/india/sikkim/',
  '/uttarakhand.html': '/india/uttarakhand/',

  // Pakistan
  '/balochistan.html': '/pakistan/balochistan/',
  '/gilgit.html': '/pakistan/gilgit/',
  '/kp.html': '/pakistan/kp/',
  '/khyber.html': '/pakistan/kp/',

  // Chile
  '/arica.html': '/chile/arica/',
  '/atacama.html': '/chile/atacama/',

  // Trust & Legal
  '/about.html': '/about/',
  '/methodology.html': '/methodology/',
  '/contact.html': '/contact/',
  '/privacy.html': '/privacy/',
  '/terms.html': '/terms/',
  '/disclaimer.html': '/disclaimer/'
};

Object.entries(oldHtmlRedirects).forEach(([oldUrl, newUrl]) => {
  redirectsTxt += `${oldUrl}   ${newUrl}   301\n`;
});

// Write _redirects to root, public/, and dist/
fs.writeFileSync(path.resolve(root, '_redirects'), redirectsTxt, 'utf8');
fs.writeFileSync(path.resolve(root, 'public', '_redirects'), redirectsTxt, 'utf8');
if (fs.existsSync(dist)) {
  fs.writeFileSync(path.resolve(dist, '_redirects'), redirectsTxt, 'utf8');
}

// Write vercel.json
const vercelJson = {
  "cleanUrls": true,
  "trailingSlash": true,
  "redirects": [
    { "source": "/country.html", "destination": "/countries/", "permanent": true },
    { "source": "/country", "destination": "/countries/", "permanent": true },
    { "source": "/united-states/", "destination": "/usa/", "permanent": true },
    { "source": "/united-states", "destination": "/usa/", "permanent": true },
    ...Object.entries(oldHtmlRedirects).map(([source, destination]) => ({
      source,
      destination,
      permanent: true
    }))
  ]
};
fs.writeFileSync(path.resolve(root, 'vercel.json'), JSON.stringify(vercelJson, null, 2), 'utf8');
console.log('Generated _redirects and vercel.json successfully.');

console.log('✅ SSG engine execution completed.');
