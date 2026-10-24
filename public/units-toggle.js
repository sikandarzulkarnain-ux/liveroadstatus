/**
 * LiveRoadStatus - Global Units Toggle (Metric / Imperial) & Accessibility Enhancements
 */
(function() {
  var UNIT_KEY = 'lrs_preferred_units'; // 'metric' or 'imperial'

  function getUnitPref() {
    try {
      return localStorage.getItem(UNIT_KEY) || 'metric';
    } catch(e) {
      return 'metric';
    }
  }

  function setUnitPref(unit) {
    try {
      localStorage.setItem(UNIT_KEY, unit);
    } catch(e) {}
    applyUnits(unit);
  }

  function applyUnits(unit) {
    document.documentElement.setAttribute('data-units', unit);
    
    // Update all toggle buttons
    var btns = document.querySelectorAll('.units-toggle-btn');
    btns.forEach(function(b) {
      if (b.getAttribute('data-target-unit') === unit) {
        b.classList.add('active');
        b.setAttribute('aria-pressed', 'true');
      } else {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      }
    });

    // Broadcast change
    window.dispatchEvent(new CustomEvent('unitsChanged', { detail: { unit: unit } }));
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    var current = getUnitPref();
    applyUnits(current);

    // Setup skip link if not present
    if (!document.querySelector('.skip-to-content')) {
      var skip = document.createElement('a');
      skip.href = '#main-content';
      skip.className = 'skip-to-content';
      skip.textContent = 'Skip to main content';
      skip.style.cssText = 'position:absolute; top:-100px; left:16px; background:#15803d; color:#fff; padding:10px 16px; border-radius:6px; z-index:9999; font-weight:700; transition:top 0.2s;';
      skip.addEventListener('focus', function() { skip.style.top = '16px'; });
      skip.addEventListener('blur', function() { skip.style.top = '-100px'; });
      document.body.insertBefore(skip, document.body.firstChild);
    }

    // Attach target ID to main container if missing
    var main = document.querySelector('main') || document.querySelector('#live-status');
    if (main && !main.id) {
      main.id = 'main-content';
    }
  });

  window.LiveRoadStatusUnits = {
    get: getUnitPref,
    set: setUnitPref
  };
})();
