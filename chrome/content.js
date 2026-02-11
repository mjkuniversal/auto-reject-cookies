(function() {
  'use strict';

  // Prevent running multiple times
  if (window.__autoRejectCookiesLoaded) return;
  window.__autoRejectCookiesLoaded = true;

  // GPC is now injected by gpc-inject.js at document_start

  const DEBUG = false;
  function log(...args) {
    if (DEBUG) console.log('[Auto Reject Cookies]', ...args);
  }

  const HANDLED_ATTR = 'data-arc-handled';

  // Known CMP (Consent Management Platform) selectors
  // Each entry: { name, selectors[] } where selectors are tried in order
  const KNOWN_CMPS = [
    {
      name: 'Sourcepoint',
      selectors: [
        'button.sp_choice_type_13',  // Reject All
        '.sp_choice_type_13',
        '[class*="sp_choice_type_REJECT_ALL"]',
        'button[title="Reject all"]',
        'button[title="Reject All"]'
      ]
    },
    {
      name: 'OneTrust',
      selectors: [
        '#onetrust-reject-all-handler',
        '.onetrust-close-btn-handler',
        '#onetrust-pc-btn-handler ~ button[class*="reject"]'
      ]
    },
    {
      name: 'CookieBot',
      selectors: [
        '#CybotCookiebotDialogBodyButtonDecline',
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll',
        'a[id*="CybotCookiebotDialog"][id*="Decline"]'
      ]
    },
    {
      name: 'Quantcast',
      selectors: [
        '.qc-cmp2-summary-buttons button[mode="secondary"]',
        'button.qc-cmp2-button[mode="secondary"]',
        '[class*="qc-cmp"] button:not([mode="primary"])'
      ]
    },
    {
      name: 'Didomi',
      selectors: [
        '#didomi-notice-disagree-button',
        'button[class*="didomi"][class*="disagree"]',
        '.didomi-continue-without-agreeing'
      ]
    },
    {
      name: 'TrustArc',
      selectors: [
        '.truste-button2',
        '#truste-consent-required',
        '.pdynamicbutton .decline'
      ]
    },
    {
      name: 'Cookielaw',
      selectors: [
        '#cookielawdialog .btn-reject',
        '.cookielawdialog button[data-action="reject"]'
      ]
    },
    {
      name: 'Termly',
      selectors: [
        '[data-tid="banner-decline"]',
        '.termly-styles-decline-button'
      ]
    },
    {
      name: 'Klaro',
      selectors: [
        '.klaro .cm-btn-decline',
        '.klaro button[class*="decline"]'
      ]
    },
    {
      name: 'Osano',
      selectors: [
        '.osano-cm-deny',
        'button.osano-cm-deny-all'
      ]
    },
    {
      name: 'CookieYes',
      selectors: [
        '.cky-btn-reject',
        '[data-cky-tag="reject-button"]'
      ]
    },
    {
      name: 'Complianz',
      selectors: [
        '.cmplz-deny',
        '#cmplz-deny-all'
      ]
    },
    {
      name: 'CookieNotice',
      selectors: [
        '#cn-refuse-cookie',
        '.cn-refuse-cookie'
      ]
    },
    {
      name: 'GDPR Cookie Consent',
      selectors: [
        '#gdpr-cookie-reject',
        '.gdpr-cookie-reject'
      ]
    },
    {
      name: 'Borlabs',
      selectors: [
        'a[data-cookie-refuse]',
        '.BorlabsCookie ._brlbs-refuse-btn'
      ]
    },
    {
      name: 'Iubenda',
      selectors: [
        '.iubenda-cs-reject-btn',
        '#iubenda-cs-banner .iubenda-cs-reject-btn'
      ]
    },
    {
      name: 'Civic Cookie Control',
      selectors: [
        '#ccc-reject-settings',
        '.ccc-reject-button'
      ]
    },
    {
      name: 'Cookie Script',
      selectors: [
        '#cookiescript_reject',
        '.cookiescript_reject'
      ]
    },
    {
      name: 'Usercentrics',
      selectors: [
        '[data-testid="uc-deny-all-button"]',
        '#uc-btn-deny-banner'
      ]
    },
    {
      name: 'ConsentManager',
      selectors: [
        '.cmpboxbtnno',
        '#cmpbntyestxt ~ #cmpbntnotxt'
      ]
    },
    {
      name: 'EU Cookie Law',
      selectors: [
        '#eucookielaw button.reject',
        '.eupopup-button_decline'
      ]
    },
    {
      name: 'PMWall (El Pais)',
      selectors: [
        '.pmwall-reject-all',
        '[data-testid="reject-all"]',
        '.pmwall button[class*="reject"]',
        '#pmwall-reject'
      ]
    },
    {
      name: 'Google Funding Choices',
      selectors: [
        '.fc-cta-do-not-consent',
        '[data-fc-action="reject"]',
        '.fc-dialog button.fc-secondary-button'
      ]
    }
  ];

  // Generic text patterns for reject buttons (multi-language)
  const REJECT_PATTERNS = [
    // English
    /^reject(\s+all)?$/i,
    /^decline(\s+all)?$/i,
    /^refuse(\s+all)?$/i,
    /^deny(\s+all)?$/i,
    /^no,?\s*thank(s|\s*you)?$/i,
    /^only\s+(necessary|essential|required)$/i,
    /^(necessary|essential|required)\s+only$/i,
    /^use\s+(necessary|essential)\s+cookies?\s+only$/i,
    /^(do\s+)?not\s+(accept|allow|consent)$/i,
    /^disagree(\s+to)?\s+all$/i,
    /^disagree$/i,
    /^opt[\s-]?out(\s+of\s+all)?$/i,
    /^continue\s+without\s+(agreeing|accepting)$/i,
    /^save\s+and\s+(exit|close)$/i,
    /^confirm\s+(my\s+)?choices$/i,
    /^reject\s+and\s+(close|subscribe)$/i,
    /^object\s+to\s+all$/i,
    /^deny\s+all$/i,
    /^refuse\s+all$/i,
    /^reject\s+all\s+and\s+close$/i,
    /^save\s+(settings|preferences)$/i,
    /^save\s+my\s+choices$/i,
    /^save\s+&\s+exit$/i,
    /^legitimate\s+interest\s+only$/i,
    // German
    /^ablehnen$/i,
    /^alle\s+ablehnen$/i,
    /^nur\s+(notwendige|erforderliche)$/i,
    /^auswahl\s+(speichern|bestätigen)$/i,
    /^einstellungen\s+speichern$/i,
    // French
    /^refuser$/i,
    /^tout\s+refuser$/i,
    /^continuer\s+sans\s+accepter$/i,
    // Spanish
    /^rechazar$/i,
    /^rechazar\s+todo$/i,
    /^rechazar\s+todas?$/i,
    /^solo\s+(necesarias|esenciales)$/i,
    /^en\s+desacuerdo(\s+con\s+todo)?$/i,
    /^no\s+estoy\s+de\s+acuerdo$/i,
    /^denegar\s+todo$/i,
    // Italian
    /^rifiuta$/i,
    /^rifiuta\s+tutto$/i,
    // Dutch
    /^weigeren$/i,
    /^alles\s+weigeren$/i,
    // Portuguese
    /^rejeitar$/i,
    /^recusar$/i,
    // Polish
    /^odrzu[cć]$/i,
    // Swedish
    /^avvisa$/i,
    // Norwegian/Danish
    /^avvis$/i,
    /^afvis$/i
  ];

  // Patterns for buttons that open settings/preferences (step 1 of 2-step reject)
  const SETTINGS_PATTERNS = [
    /^preferences$/i,
    /^privacy\s*(center|settings|options)$/i,
    /^cookie\s*(settings|preferences|options)$/i,
    /^manage\s*(cookies?|preferences|settings|options)$/i,
    /^more\s*(options|info|information)$/i,
    /^settings$/i,
    /^configuration$/i,
    /^customize$/i,
    /^customise$/i,
    // German
    /^einstellungen$/i,
    /^mehr\s*optionen$/i,
    /^anpassen$/i,
    // French
    /^param[eè]tres$/i,
    /^personnaliser$/i,
    /^plus\s*d'options$/i,
    // Spanish
    /^configuraci[oó]n$/i,
    /^ajustes$/i,
    /^personalizar$/i,
    // Italian
    /^impostazioni$/i,
    /^personalizza$/i
  ];

  // Known CMP settings button selectors (for two-step rejection)
  // These are clicked first to reveal the reject button
  const KNOWN_CMP_SETTINGS_SELECTORS = [
    '#onetrust-pc-btn-handler',           // OneTrust "Cookie Settings" / "Manage Preferences"
    '.onetrust-pc-btn-handler',
    '#ot-sdk-btn',                         // OneTrust alternative
    '.ot-sdk-show-settings',
    '#CybotCookiebotDialogBodyLevelButtonCustomize', // CookieBot customize
    '.qc-cmp2-summary-buttons button:first-child',   // Quantcast "More Options"
    '#didomi-notice-learn-more-button',    // Didomi "Learn more"
    '.sp_choice_type_11',                  // Sourcepoint "Options"
    '.sp_choice_type_12'                   // Sourcepoint "Manage"
  ];

  // Track if we've already clicked a settings button
  let settingsClicked = false;

  // Generic selectors that often contain reject buttons
  const GENERIC_CONTAINER_SELECTORS = [
    '[class*="cookie"] [class*="banner"]',
    '[class*="cookie"] [class*="consent"]',
    '[class*="consent"] [class*="banner"]',
    '[class*="gdpr"]',
    '[class*="privacy"] [class*="banner"]',
    '[id*="cookie"][id*="banner"]',
    '[id*="cookie"][id*="consent"]',
    '[id*="consent"][id*="banner"]',
    '[aria-label*="cookie" i]',
    '[aria-label*="consent" i]',
    '[role="dialog"][class*="cookie" i]',
    '[role="dialog"][class*="consent" i]'
  ];

  let isEnabled = true;
  let whitelist = [];

  // Check if current domain is whitelisted
  function isWhitelisted() {
    const domain = window.location.hostname;
    return whitelist.some(d => domain === d || domain.endsWith('.' + d));
  }

  // Check extension settings
  async function checkSettings() {
    try {
      const result = await chrome.storage.local.get(['enabled', 'whitelist']);
      isEnabled = result.enabled !== false; // Default to enabled
      whitelist = result.whitelist || [];
    } catch (e) {
      // Storage might not be available in some contexts
      isEnabled = true;
      whitelist = [];
    }
  }

  // Try to click a button and return true if successful
  function tryClick(element) {
    if (!element) {
      log('tryClick: element is null');
      return false;
    }
    if (element.hasAttribute(HANDLED_ATTR)) {
      log('tryClick: already handled');
      return false;
    }

    // Check if element is visible and clickable
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    if (rect.width === 0 || rect.height === 0) {
      log('tryClick: zero dimensions', rect.width, rect.height);
      return false;
    }
    if (style.display === 'none') {
      log('tryClick: display none');
      return false;
    }
    if (style.visibility === 'hidden') {
      log('tryClick: visibility hidden');
      return false;
    }
    if (style.opacity === '0') {
      log('tryClick: opacity 0');
      return false;
    }
    if (element.disabled) {
      log('tryClick: disabled');
      return false;
    }

    element.setAttribute(HANDLED_ATTR, 'true');
    log('tryClick: clicking element');
    element.click();

    // Notify background script
    try {
      log('Sending cookieRejected message to background');
      chrome.runtime.sendMessage({ type: 'cookieRejected', url: window.location.href })
        .then(() => log('Message sent successfully'))
        .catch(err => log('Error sending message:', err));
    } catch (e) {
      log('Exception sending message:', e);
    }

    return true;
  }

  // Try known CMP selectors
  function tryKnownCMPs() {
    for (const cmp of KNOWN_CMPS) {
      for (const selector of cmp.selectors) {
        try {
          const element = document.querySelector(selector);
          if (element && tryClick(element)) {
            console.log(`[Auto Reject Cookies] Rejected via ${cmp.name}`);
            return true;
          }
        } catch (e) {
          // Invalid selector, skip
        }
      }
    }
    return false;
  }

  // Patterns that should be prioritized (buttons that reject ALL at once)
  const PRIORITY_PATTERNS = [
    /all/i,  // Any button containing "all" (reject all, decline all, disagree to all)
    /\btout\b/i,  // French "tout" (all)
    /\balles?\b/i,  // German "alle" (all)
    /\btodo\b/i,  // Spanish "todo" (all)
    /\btutto\b/i,  // Italian "tutto" (all)
  ];

  // Try generic pattern matching
  function tryGenericPatterns() {
    // Search entire document for clickable elements
    const allClickables = document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"], [class*="button"], [class*="btn"]');

    log('Found', allClickables.length, 'clickable elements');

    // First pass: prioritize buttons with "all" in them
    for (const element of allClickables) {
      const text = (element.textContent || element.value || '').trim();
      if (!text || text.length > 50) continue;

      // Check if this is a priority "all" button
      const isPriority = PRIORITY_PATTERNS.some(p => p.test(text));
      if (!isPriority) continue;

      for (const pattern of REJECT_PATTERNS) {
        if (pattern.test(text)) {
          log('Found priority matching button:', text);
          if (tryClick(element)) {
            console.log(`[Auto Reject Cookies] Rejected via generic pattern: "${text}"`);
            return true;
          }
        }
      }
    }

    // Second pass: try any matching button
    for (const element of allClickables) {
      const text = (element.textContent || element.value || '').trim();

      // Skip empty or very long text
      if (!text || text.length > 50) continue;

      for (const pattern of REJECT_PATTERNS) {
        if (pattern.test(text)) {
          log('Found matching button:', text);
          if (tryClick(element)) {
            console.log(`[Auto Reject Cookies] Rejected via generic pattern: "${text}"`);
            return true;
          }
        }
      }
    }

    // Log some button texts for debugging
    if (DEBUG) {
      const buttonTexts = Array.from(allClickables)
        .map(el => (el.textContent || el.value || '').trim())
        .filter(t => t && t.length < 50)
        .slice(0, 10);
      log('Sample button texts:', buttonTexts);
    }

    return false;
  }

  // Check if element is likely part of a cookie consent dialog
  function isInConsentContext(element) {
    let current = element;
    const consentKeywords = /cookie|consent|gdpr|privacy|banner|modal|dialog|overlay|notice|cmp/i;

    // Check up to 10 levels of ancestors
    for (let i = 0; i < 10 && current; i++) {
      const id = current.id || '';
      const className = current.className || '';
      const role = current.getAttribute?.('role') || '';
      const ariaLabel = current.getAttribute?.('aria-label') || '';

      if (consentKeywords.test(id) ||
          consentKeywords.test(className) ||
          role === 'dialog' ||
          role === 'alertdialog' ||
          consentKeywords.test(ariaLabel)) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  // Try to click settings/preferences button (step 1 of 2-step reject)
  function trySettingsButton() {
    if (settingsClicked) return false;

    // Helper function to click a settings button
    function clickSettingsButton(element, source) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      if (rect.width === 0 || rect.height === 0) {
        log('Settings button has zero dimensions:', source);
        return false;
      }
      if (style.display === 'none' || style.visibility === 'hidden') {
        log('Settings button not visible:', source);
        return false;
      }
      if (style.opacity === '0') {
        log('Settings button has zero opacity:', source);
        return false;
      }
      if (element.disabled) {
        log('Settings button is disabled:', source);
        return false;
      }

      log('Settings button tag:', element.tagName, 'href:', element.href || 'none', 'id:', element.id, 'class:', element.className);
      settingsClicked = true;

      // For anchor tags, prevent navigation
      if (element.tagName === 'A' && element.href) {
        log('Preventing default navigation for anchor settings button');
        const handler = (e) => {
          e.preventDefault();
          e.stopPropagation();
        };
        element.addEventListener('click', handler, { once: true, capture: true });
      }

      element.click();
      console.log(`[Auto Reject Cookies] Clicked settings button: "${source}"`);

      // After clicking settings, wait and re-scan for reject buttons
      // Pass false since we don't need to click settings again
      setTimeout(() => rejectCookies(false), 500);
      setTimeout(() => rejectCookies(false), 1000);
      setTimeout(() => rejectCookies(false), 2000);

      return true;
    }

    // First, try known CMP settings selectors (most reliable)
    for (const selector of KNOWN_CMP_SETTINGS_SELECTORS) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          log('Found known CMP settings button:', selector);
          if (clickSettingsButton(element, selector)) {
            return true;
          }
        }
      } catch (e) {
        // Invalid selector, skip
      }
    }

    // Fall back to text-based pattern matching
    const allClickables = document.querySelectorAll('button, a, [role="button"], [class*="button"], [class*="btn"]');

    for (const element of allClickables) {
      const text = (element.textContent || element.value || '').trim();
      if (!text || text.length > 50) continue;

      for (const pattern of SETTINGS_PATTERNS) {
        if (pattern.test(text)) {
          // Only click settings buttons that are in a cookie consent context
          // to avoid clicking navigation links
          if (!isInConsentContext(element)) {
            log('Skipping settings button not in consent context:', text);
            continue;
          }

          log('Found settings button:', text);
          if (clickSettingsButton(element, text)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // Track scan count to delay settings button attempts
  let scanCount = 0;

  // Main rejection logic
  // allowSettingsClick: only try settings buttons after a few scans to avoid clicking too early
  function rejectCookies(allowSettingsClick = false) {
    scanCount++;
    if (!isEnabled || isWhitelisted()) {
      log('Skipping - enabled:', isEnabled, 'whitelisted:', isWhitelisted());
      return;
    }

    log('Scanning for cookie banners... (scan #' + scanCount + ', settings allowed: ' + allowSettingsClick + ')');

    // Try known CMPs first (more reliable)
    if (tryKnownCMPs()) return;

    // Fall back to generic patterns
    if (tryGenericPatterns()) return;

    // If no direct reject button, try clicking settings to access reject options
    // Only attempt this after giving the page time to load (not on first few scans)
    if (allowSettingsClick) {
      trySettingsButton();
    }
  }

  // Run with a small delay to let banners render
  function runWithDelay(delay = 500, allowSettingsClick = false) {
    setTimeout(() => {
      rejectCookies(allowSettingsClick);
    }, delay);
  }

  // Observe DOM for dynamically added banners
  let lastScanTime = 0;
  const MIN_SCAN_INTERVAL = 1000; // Don't scan more than once per second

  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      // Debounce: only run once per batch of mutations
      if (observer._timeout) return;

      // Rate limit scanning
      const now = Date.now();
      const timeSinceLastScan = now - lastScanTime;
      const delay = Math.max(300, MIN_SCAN_INTERVAL - timeSinceLastScan);

      observer._timeout = setTimeout(() => {
        observer._timeout = null;
        lastScanTime = Date.now();
        // Allow settings clicks from mutation observer (page has had time to load)
        rejectCookies(true);
      }, delay);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      isEnabled = changes.enabled.newValue !== false;
    }
    if (changes.whitelist) {
      whitelist = changes.whitelist.newValue || [];
    }
  });

  // Initialize
  async function init() {
    await checkSettings();
    log('Initialized on', window.location.href, 'enabled:', isEnabled, 'whitelisted:', isWhitelisted());

    // Run immediately (no settings clicks - page may not be ready)
    rejectCookies(false);

    // Run again after delays (for slow-loading banners)
    // Early runs: no settings clicks to avoid clicking before page is ready
    runWithDelay(500, false);
    // Later runs: allow settings clicks (page should be loaded by now)
    runWithDelay(1500, true);
    runWithDelay(3000, true);

    // Observe for dynamically added banners
    if (document.body) {
      observeDOM();
    } else {
      document.addEventListener('DOMContentLoaded', observeDOM);
    }
  }

  init();
})();
