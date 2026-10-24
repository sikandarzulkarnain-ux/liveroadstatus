const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.resolve(root, 'dist');
const passes = require('../src/data/passes.json');
const countries = require('../src/data/countries.json');

console.log('--- PHASE 3: TECHNICAL SEO & STATIC SITE GENERATION (SSG) ---');

const BASE_URL = 'https://www.liveroadstatus.com';
const today = new Date().toISOString().split('T')[0];

// 1. Remove FAQPage schema from index.html (Prompt requirement: "Do NOT add FAQPage markup for rich results; keep the FAQ section as normal HTML")
const indexPath = path.join(root, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Find and strip FAQPage schema from JSON-LD graph
indexHtml = indexHtml.replace(/,\s*\{\s*"@type":\s*"FAQPage"[\s\S]*?\}\s*\]\s*\}/i, '\n    ]\n  }');
fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('Removed FAQPage schema markup from index.html JSON-LD (FAQ HTML remains intact).');

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// 2. Generate SSG Pass Pages
// Template for individual pass page
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

  // Find related passes in the same country/region
  const related = passes.filter(p => p.country === pass.country && p.id !== pass.id).slice(0, 4);

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
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "${BASE_URL}/" },
          { "@type": "ListItem", "position": 2, "name": "${pass.country}", "item": "${BASE_URL}/${pass.country.toLowerCase().replace(/\\s+/g, '-')}/" },
          { "@type": "ListItem", "position": 3, "name": "${pass.region}", "item": "${BASE_URL}/${pass.country.toLowerCase().replace(/\\s+/g, '-')}/${pass.region.toLowerCase().replace(/[^\\w\\s-]/g, '').replace(/\\s+/g, '-')}/" },
          { "@type": "ListItem", "position": 4, "name": "${pass.name.replace(/"/g, '\\"')}" }
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
          <li><a href="/country.html">Countries</a></li>
          <li><a href="/about.html">About</a></li>
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
          <a href="/${slugify(pass.country)}/">${pass.country}</a>
          <span>&rsaquo;</span>
          <a href="/${slugify(pass.country)}/${slugify(pass.region)}/">${pass.region}</a>
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

    <div class="container content-grid">
      <div>
        <div class="info-card">
          <h2>Pass Overview &amp; Driving Conditions</h2>
          <p>${pass.description}</p>
          <div class="hazard-box">
            <strong>⚠️ Alpine Driving Hazard Notice:</strong> High mountain passes are subject to rapid weather shifts, sudden freezing precipitation, dense fog, and black ice. Check weather forecasts and vehicle traction equipment before ascending.
          </div>
          
          <h3 style="font-size:1.2rem; margin:24px 0 10px;">Seasonal Operating Window</h3>
          <p>${pass.seasonal_window}</p>

          <h3 style="font-size:1.2rem; margin:24px 0 10px;">Winter Equipment &amp; Traction Rules</h3>
          <p>${pass.winter_equipment_rule}</p>

          <h3 style="font-size:1.2rem; margin:24px 0 10px;">Nearest Fuel &amp; Services</h3>
          <p>Summit regions feature limited emergency fuel and recovery assistance. Drivers should ensure minimum half a tank of fuel or 50% battery before commencing the alpine ascent. Cellular coverage may be intermittent.</p>
        </div>

        <div class="info-card">
          <h2>Interactive Mountain Pass Map</h2>
          <div id="pass-map" role="region" aria-label="Pass location map"></div>
          <p style="font-size:0.88rem; color:var(--muted);">Summit Coordinates: Latitude ${pass.lat}, Longitude ${pass.lng}. OpenStreetMap cartography.</p>
        </div>

        <div class="disclaimer">
          <strong>Official Travel Disclaimer:</strong> Mountain pass road conditions change rapidly due to alpine snow, rockfall, and avalanche mitigation. Always confirm current status with local transportation authorities and law enforcement before travelling. LiveRoadStatus compiles official feeds and verified reports for navigational planning.
        </div>
      </div>

      <aside>
        <div class="official-box" style="margin-bottom:28px;">
          <h3>Official Source</h3>
          <p>Road status verified via <strong>${pass.status_source_name}</strong>.</p>
          <a href="${pass.status_source_url}" target="_blank" rel="noopener noreferrer" class="btn-official">Visit Official Source &rsaquo;</a>
        </div>

        <div class="info-card">
          <h3 style="font-family:var(--font-serif); font-size:1.25rem; margin-bottom:14px;">Related Passes in ${pass.country}</h3>
          <ul class="related-list">
            ${related.map(r => `<li><a href="/passes/${r.slug}/" class="related-link"><span>${r.name}</span><span style="font-size:0.85rem; color:var(--muted);">${r.elevation_m}m</span></a></li>`).join('')}
          </ul>
        </div>
      </aside>
    </div>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2026 LiveRoadStatus. Real-time mountain pass conditions worldwide. <a href="/about.html">About</a> &bull; <a href="/privacy.html">Privacy Policy</a> &bull; <a href="/terms.html">Terms of Service</a> &bull; <a href="/contact.html">Contact</a></p>
    </div>
  </footer>

  <!-- Leaflet JS for map -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof L !== 'undefined') {
        var map = L.map('pass-map').setView([${pass.lat}, ${pass.lng}], 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        var statusColor = '${pass.status === 'open' ? '#15803d' : pass.status === 'restricted' ? '#b45309' : pass.status === 'closed' ? '#b91c1c' : '#64748b'}';
        var marker = L.circleMarker([${pass.lat}, ${pass.lng}], {
          radius: 9,
          fillColor: statusColor,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(map);

        marker.bindPopup('<b>${pass.name.replace(/'/g, "\\'")}</b><br>Elevation: ${pass.elevation_m} m<br>Status: ${statusUpper}').openPopup();
      }
    });
  </script>
</body>
</html>`;
}

// Generate static pass pages
console.log(`Generating SSG pass pages for ${passes.length} passes...`);
const passesDir = path.resolve(root, 'passes');
if (!fs.existsSync(passesDir)) fs.mkdirSync(passesDir, { recursive: true });

passes.forEach(pass => {
  const passPageDir = path.resolve(passesDir, pass.slug);
  if (!fs.existsSync(passPageDir)) fs.mkdirSync(passPageDir, { recursive: true });
  fs.writeFileSync(path.resolve(passPageDir, 'index.html'), renderPassPage(pass), 'utf8');
});

console.log(`Generated ${passes.length} pass pages at /passes/:slug/index.html.`);

// 3. GENERATE SITEMAP.XML
console.log('Generating dynamic sitemap.xml with lastmod dates...');
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/country.html</loc>
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

// Add country pages
countries.forEach(c => {
  sitemapXml += `  <url>
    <loc>${BASE_URL}/${c.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>\n`;

  // Add region pages
  c.regions.forEach(r => {
    sitemapXml += `  <url>
    <loc>${BASE_URL}/${c.slug}/${r.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.80</priority>
  </url>\n`;
  });
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

fs.writeFileSync(path.resolve(root, 'sitemap.xml'), sitemapXml, 'utf8');
console.log('Written dynamic sitemap.xml with full pass and country coverage.');

// 4. GENERATE ROBOTS.TXT
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
console.log('Written robots.txt successfully.');

// 5. GENERATE _redirects AND vercel.json
console.log('Generating 301 redirects for clean URLs...');
let redirectsTxt = `# 301 Permanent Redirects: Clean URLs for LiveRoadStatus
/index.html   /   301
/country.html /countries/   301
`;

// Map old HTML files to clean URLs
const oldHtmlRedirects = {
  '/france.html': '/france/',
  '/bourgogne.html': '/france/bourgogne-franche-comte/',
  '/grandest.html': '/france/grand-est/',
  '/aquitaine.html': '/france/nouvelle-aquitaine/',
  '/occitanie.html': '/france/occitanie/',
  '/paca.html': '/france/paca/',
  '/auvergne.html': '/france/auvergne-rhone-alpes/',

  '/austria.html': '/austria/',
  '/carinthia.html': '/austria/carinthia/',
  '/tyrol.html': '/austria/tyrol/',
  '/salzburg.html': '/austria/salzburg/',
  '/styria.html': '/austria/styria/',
  '/vorarlberg.html': '/austria/vorarlberg/',
  '/lower-austria.html': '/austria/lower-austria/',

  '/switzerland.html': '/switzerland/',
  '/graubunden.html': '/switzerland/graubunden/',
  '/valais.html': '/switzerland/valais/',
  '/bern.html': '/switzerland/bern/',
  '/uri.html': '/switzerland/uri/',
  '/ticino.html': '/switzerland/ticino/',

  '/italy.html': '/italy/',
  '/lombardy.html': '/italy/lombardy/',
  '/veneto.html': '/italy/veneto/',
  '/piedmont.html': '/italy/piedmont/',
  '/tuscany.html': '/italy/tuscany/',

  '/usa.html': '/united-states/',
  '/colorado.html': '/united-states/colorado/',
  '/washington.html': '/united-states/washington/',
  '/california.html': '/united-states/california/',
  '/oregon.html': '/united-states/oregon/',
  '/montana.html': '/united-states/montana/',

  '/canada.html': '/canada/',
  '/britishcolumbia.html': '/canada/british-columbia/',
  '/alberta.html': '/canada/alberta/',

  '/norway.html': '/norway/',
  '/india.html': '/india/',
  '/himachal.html': '/india/himachal-pradesh/',
  '/ladakh.html': '/india/ladakh/',
  '/pakistan.html': '/pakistan/',
  '/chile.html': '/chile/',
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

fs.writeFileSync(path.resolve(root, '_redirects'), redirectsTxt, 'utf8');

// Also update vercel.json
const vercelJson = {
  "cleanUrls": true,
  "trailingSlash": true,
  "redirects": Object.entries(oldHtmlRedirects).map(([source, destination]) => ({
    source,
    destination,
    permanent: true
  }))
};
fs.writeFileSync(path.resolve(root, 'vercel.json'), JSON.stringify(vercelJson, null, 2), 'utf8');
console.log('Generated _redirects and vercel.json 301 redirects successfully.');

// 6. UPDATE prerender.mjs to copy passes/ directory to dist/
const prerenderPath = path.resolve(root, 'scripts', 'prerender.mjs');
let prerenderContent = fs.readFileSync(prerenderPath, 'utf8');
if (!prerenderContent.includes("dist/passes")) {
  prerenderContent = prerenderContent.replace(
    "// Copy country/ directory recursively to dist/country",
    `// Copy passes/ directory recursively to dist/passes
const passesSrcDir = path.resolve(rootDir, 'passes');
const passesDestDir = path.resolve(distDir, 'passes');
if (fs.existsSync(passesSrcDir)) {
  fs.cpSync(passesSrcDir, passesDestDir, { recursive: true });
  console.log('🏔️  Copied passes/ SSG pages to dist/passes/');
}

// Copy country/ directory recursively to dist/country`
  );
  fs.writeFileSync(prerenderPath, prerenderContent, 'utf8');
  console.log('Updated scripts/prerender.mjs to bundle passes/ directory into dist/.');
}

console.log('Phase 3 technical SEO & SSG engine execution completed.');
