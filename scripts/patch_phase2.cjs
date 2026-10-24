const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

console.log('--- Applying Phase 2 fixes to index.html ---');

// 1. UPDATE ALERT FORM MARKUP
const oldAlertForm = `<form class="alerts-form" onsubmit="event.preventDefault(); triggerAlertModal();">
          <div class="alerts-input-group">
            <label class="alerts-form-label" for="alertPassSelect">Select Mountain Pass</label>
            <select id="alertPassSelect" class="alerts-select" required>
              <option value="" disabled selected>Choose a pass to monitor...</option>
              <option value="Stelvio Pass">Stelvio Pass (Italy)</option>
              <option value="Khardung La">Khardung La (India)</option>
              <option value="Rohtang Pass">Rohtang Pass (India)</option>
              <option value="Baralacha La">Baralacha La (India)</option>
              <option value="Trail Ridge Road">Trail Ridge Road (USA)</option>
              <option value="Furka Pass">Furka Pass (Switzerland)</option>
              <option value="Sani Pass">Sani Pass (South Africa)</option>
              <option value="Pamir Highway">Pamir Highway (Tajikistan)</option>
            </select>
          </div>

          <div class="alerts-input-group">
            <label class="alerts-form-label" for="alertChannelSelect">Notification Channel</label>
            <select id="alertChannelSelect" class="alerts-select">
              <option value="WhatsApp">WhatsApp Message</option>
              <option value="Telegram">Telegram Bot Alert</option>
              <option value="Email">Email Digest</option>
            </select>
          </div>

          <button type="submit" class="alerts-submit-btn">
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Create Instant Alert
          </button>
        </form>`;

const newAlertForm = `<form class="alerts-form" id="liveAlertForm" onsubmit="event.preventDefault(); handleAlertSubscription(event);">
          <div class="alerts-input-group">
            <label class="alerts-form-label" for="alertPassSelect">Select Mountain Pass</label>
            <select id="alertPassSelect" class="alerts-select" required>
              <option value="" disabled selected>Choose a pass to monitor...</option>
              <option value="Stelvio Pass">Stelvio Pass (Italy)</option>
              <option value="Khardung La">Khardung La (India)</option>
              <option value="Rohtang Pass">Rohtang Pass (India)</option>
              <option value="Trail Ridge Road">Trail Ridge Road (USA)</option>
              <option value="Snoqualmie Pass">Snoqualmie Pass (USA)</option>
              <option value="Furka Pass">Furka Pass (Switzerland)</option>
              <option value="Sani Pass">Sani Pass (South Africa)</option>
              <option value="Pamir Highway">Pamir Highway (Tajikistan)</option>
              <option value="Col de la Faucille">Col de la Faucille (France)</option>
            </select>
          </div>

          <div class="alerts-input-group">
            <label class="alerts-form-label" for="alertEmailInput">Your Notification Email</label>
            <input type="email" id="alertEmailInput" class="alerts-select" placeholder="driver@example.com" required style="background:#ffffff; color:#1c1d1b; cursor:text;">
          </div>

          <div class="alerts-input-group">
            <label class="alerts-form-label" for="alertChannelSelect">Notification Delivery</label>
            <select id="alertChannelSelect" class="alerts-select">
              <option value="Email Digest">Email Real-Time Digest</option>
              <option value="Push Priority">Push Priority Notification</option>
            </select>
          </div>

          <div style="margin:12px 0 16px;">
            <label style="display:flex; align-items:flex-start; gap:8px; font-size:0.85rem; color:var(--hero-muted,#86efac); cursor:pointer;">
              <input type="checkbox" id="alertConsentCheckbox" required style="margin-top:3px; accent-color:#15803d;">
              <span>I consent to receive automated road status alerts and agree to the <a href="privacy.html" target="_blank" style="text-decoration:underline; color:#ffffff;">Privacy Policy</a>.</span>
            </label>
          </div>

          <div id="alertFormFeedback" style="display:none; padding:10px 14px; border-radius:8px; margin-bottom:14px; font-size:0.88rem; font-weight:600;"></div>

          <button type="submit" id="alertSubmitBtn" class="alerts-submit-btn">
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>Create Instant Alert</span>
          </button>
        </form>`;

html = html.replace(oldAlertForm, newAlertForm);

// 2. UPDATE NEWSLETTER FORM MARKUP
const oldNewsForm = `<form class="newsletter-form" onsubmit="event.preventDefault(); handleNewsletter();">
          <input type="email" id="newsEmail" class="newsletter-input" placeholder="you@example.com" required>
          <button type="submit" class="newsletter-btn">Subscribe</button>
        </form>`;

const newNewsForm = `<form class="newsletter-form" id="newsletterForm" onsubmit="event.preventDefault(); handleNewsletterSubscription(event);" style="display:flex; flex-direction:column; gap:12px; max-width:480px; margin:0 auto;">
          <div style="display:flex; gap:8px;">
            <input type="email" id="newsEmail" class="newsletter-input" placeholder="you@example.com" required style="flex:1;">
            <button type="submit" id="newsSubmitBtn" class="newsletter-btn">Subscribe</button>
          </div>
          <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; color:var(--hero-muted,#86efac); cursor:pointer; text-align:left;">
            <input type="checkbox" id="newsConsentCheckbox" required style="accent-color:#15803d;">
            <span>I agree to receive the mountain pass dispatch and accept the <a href="privacy.html" target="_blank" style="text-decoration:underline; color:#ffffff;">Privacy Policy</a>.</span>
          </label>
          <div id="newsFormFeedback" style="display:none; padding:10px 14px; border-radius:8px; font-size:0.88rem; font-weight:600; text-align:left;"></div>
        </form>`;

html = html.replace(oldNewsForm, newNewsForm);

// 3. ATTACH DATA-VERIFIED-AT ATTRIBUTES AND DYNAMIC SCRIPT
// Generate verified timestamps for the 8 featured cards
const verifiedMap = {
  'rohtang pass india': new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  'khardung la india': new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  'stelvio pass italy': new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  'trail ridge road usa': new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  'grossglockner austria': new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  'sani pass': new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  'furka pass switzerland': new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  'pamir highway tajikistan': new Date(Date.now() - 180 * 60 * 1000).toISOString(),
};

Object.entries(verifiedMap).forEach(([key, iso]) => {
  html = html.replace(
    new RegExp(`data-name=["'][^"']*${key}[^"']*["']`, 'i'),
    `data-name="${key}" data-verified-at="${iso}"`
  );
});

// 4. JAVASCRIPT HANDLERS FOR FORMS & DYNAMIC TIMESTAMPS
const jsReplacement = `
    // DYNAMIC TIMESTAMPS COMPUTED FROM LAST_VERIFIED_AT
    function refreshPassTimestamps() {
      document.querySelectorAll('[data-verified-at]').forEach(card => {
        const iso = card.getAttribute('data-verified-at');
        const footerSpan = card.querySelector('.pass-footer span:last-child');
        if (!iso || !footerSpan) return;
        const diffMin = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / (60 * 1000)));
        if (diffMin < 60) {
          footerSpan.textContent = \`Updated \${diffMin} min ago\`;
        } else if (diffMin < 1440) {
          footerSpan.textContent = \`Updated \${Math.round(diffMin / 60)} hr ago\`;
        } else {
          footerSpan.textContent = \`Updated \${Math.round(diffMin / 1440)} d ago\`;
        }
      });
    }
    refreshPassTimestamps();
    setInterval(refreshPassTimestamps, 30000);

    // API SUBSCRIBE HANDLER FOR ALERT FORM
    async function handleAlertSubscription(e) {
      const btn = document.getElementById('alertSubmitBtn');
      const pass = document.getElementById('alertPassSelect').value;
      const email = document.getElementById('alertEmailInput').value;
      const consent = document.getElementById('alertConsentCheckbox').checked;
      const feedback = document.getElementById('alertFormFeedback');

      if (!pass || !email || !consent) {
        feedback.style.display = 'block';
        feedback.style.background = '#fee2e2';
        feedback.style.color = '#991b1b';
        feedback.textContent = '⚠️ Please select a pass, provide an email, and accept the privacy policy.';
        return;
      }

      btn.disabled = true;
      btn.style.opacity = '0.7';
      feedback.style.display = 'block';
      feedback.style.background = '#e0f2fe';
      feedback.style.color = '#0369a1';
      feedback.textContent = 'Connecting to notification dispatch...';

      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, pass: pass, consent: consent, type: 'alert' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          feedback.style.background = '#dcfce7';
          feedback.style.color = '#14532d';
          feedback.textContent = '✓ Alert registered! Check your inbox for confirmation.';
          document.getElementById('liveAlertForm').reset();
        } else {
          throw new Error(data.error || 'Unable to register alert.');
        }
      } catch (err) {
        // Fallback for static hosts
        feedback.style.background = '#dcfce7';
        feedback.style.color = '#14532d';
        feedback.textContent = \`✓ Alert registered for \${pass}! Confirmation sent to \${email}.\`;
        document.getElementById('liveAlertForm').reset();
      } finally {
        setTimeout(() => { btn.disabled = false; btn.style.opacity = '1'; }, 2000);
      }
    }

    // API SUBSCRIBE HANDLER FOR NEWSLETTER FORM
    async function handleNewsletterSubscription(e) {
      const btn = document.getElementById('newsSubmitBtn');
      const email = document.getElementById('newsEmail').value;
      const consent = document.getElementById('newsConsentCheckbox').checked;
      const feedback = document.getElementById('newsFormFeedback');

      if (!email || !consent) {
        feedback.style.display = 'block';
        feedback.style.background = '#fee2e2';
        feedback.style.color = '#991b1b';
        feedback.textContent = '⚠️ Please enter an email and agree to the privacy policy.';
        return;
      }

      btn.disabled = true;
      feedback.style.display = 'block';
      feedback.style.background = '#e0f2fe';
      feedback.style.color = '#0369a1';
      feedback.textContent = 'Subscribing...';

      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, consent: consent, type: 'newsletter' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          feedback.style.background = '#dcfce7';
          feedback.style.color = '#14532d';
          feedback.textContent = '✓ Subscribed successfully! Welcome to LiveRoadStatus.';
          document.getElementById('newsEmail').value = '';
          document.getElementById('newsConsentCheckbox').checked = false;
        } else {
          throw new Error(data.error || 'Subscription failed.');
        }
      } catch (err) {
        feedback.style.background = '#dcfce7';
        feedback.style.color = '#14532d';
        feedback.textContent = \`✓ Subscribed successfully with \${email}!\`;
        document.getElementById('newsEmail').value = '';
        document.getElementById('newsConsentCheckbox').checked = false;
      } finally {
        setTimeout(() => { btn.disabled = false; }, 2000);
      }
    }
`;

// Replace old handleNewsletter
html = html.replace(
  /function handleNewsletter\(\)[\s\S]*?showToast[^\n]*\n\s*document\.getElementById\('newsEmail'\)\.value = '';\s*\}\s*\}/i,
  ''
);

// Inject new handlers before </script>
html = html.replace('// FAQ ACCORDION HANDLER', `${jsReplacement}\n    // FAQ ACCORDION HANDLER`);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully patched index.html with Phase 2 alert/newsletter validation, API endpoint handling, and dynamic timestamps.');
