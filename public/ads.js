// LiveRoadStatus AdSense Loader
// Ad slots are strictly dormant unless VITE_ADS_ENABLED is explicitly enabled
(function() {
  var adsEnabled = false;
  try {
    if (typeof window !== 'undefined') {
      if (window.VITE_ADS_ENABLED === true || window.VITE_ADS_ENABLED === 'true') adsEnabled = true;
      if (localStorage.getItem('VITE_ADS_ENABLED') === 'true') adsEnabled = true;
    }
  } catch(e) {}

  if (adsEnabled) {
    document.addEventListener('DOMContentLoaded', function() {
      var slots = document.querySelectorAll('[data-ad-container]');
      slots.forEach(function(s) {
        s.style.display = 'block';
      });
    });
  }
})();
