const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Clean Header Navigation
const cleanHeaderNav = `        <nav>
          <ul class="nav-links">
            <li><a href="#live-status">Live status</a></li>
            <li><a href="#regions">Regions</a></li>
            <li><a href="country.html">Country Directory</a></li>
            <li><a href="#routes">Routes</a></li>
            <li><a href="/about/">About us</a></li>
          </ul>
        </nav>`;

html = html.replace(/<nav>\s*<ul class="nav-links">[\s\S]*?<\/ul>\s*<\/nav>/i, cleanHeaderNav);

// 2. Enhance Footer with Trust, Legal, Disclaimer, Terms, Privacy, Methodology, Contact
const newFooterColumns = `      <div class="footer-columns">
        <div class="footer-col-brand">
          <div class="brand-name">LiveRoadStatus</div>
          <p>Live status of the world's high mountain passes. Sourced, timestamped and checked.</p>
        </div>
        <div>
          <div class="footer-col-title">Explore</div>
          <ul class="footer-links">
            <li><a href="#live-status">Live status</a></li>
            <li><a href="#regions">Regions</a></li>
            <li><a href="country.html">Countries</a></li>
            <li><a href="#routes">Routes</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Tools &amp; Resources</div>
          <ul class="footer-links">
            <li><a href="#alerts">Alerts</a></li>
            <li><a href="#open-this-month">Seasonal calendar</a></li>
            <li><a href="/methodology/">Methodology &amp; Verification</a></li>
            <li><a href="/contact/">Pass condition reports</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Trust &amp; Legal</div>
          <ul class="footer-links">
            <li><a href="/about/">About us</a></li>
            <li><a href="/methodology/">Methodology</a></li>
            <li><a href="/disclaimer/">Safety Disclaimer</a></li>
            <li><a href="/privacy/">Privacy Policy</a></li>
            <li><a href="/terms/">Terms of Service</a></li>
            <li><a href="/contact/">Contact &amp; Reports</a></li>
          </ul>
        </div>
      </div>`;

html = html.replace(/<div class="footer-columns">[\s\S]*?<\/div>\s*<\/div>/i, newFooterColumns);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully cleaned header nav and updated footer in index.html!');
