// Global Privacy Control injection - runs at document_start
// This sets navigator.globalPrivacyControl before any page scripts run

(function() {
  'use strict';

  const script = document.createElement('script');
  script.textContent = `
    (function() {
      // Set Global Privacy Control signal
      try {
        Object.defineProperty(navigator, 'globalPrivacyControl', {
          value: true,
          writable: false,
          configurable: false,
          enumerable: true
        });
      } catch (e) {
        // Silently fail if already set
      }

      // Also set the legacy doNotTrack for broader compatibility
      try {
        Object.defineProperty(navigator, 'doNotTrack', {
          value: '1',
          writable: false,
          configurable: false,
          enumerable: true
        });
      } catch (e) {
        // Silently fail if already set
      }
    })();
  `;

  // Inject as early as possible
  const parent = document.head || document.documentElement;
  if (parent) {
    parent.insertBefore(script, parent.firstChild);
    script.remove();
  }
})();
