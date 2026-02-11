# Auto Reject Cookies

A Firefox extension that automatically rejects cookie consent banners and sends Global Privacy Control (GPC) signals to protect your privacy.

## Features

### Automatic Cookie Banner Rejection
- **26+ Consent Management Platforms (CMPs)** supported including OneTrust, CookieBot, Sourcepoint, Quantcast, Didomi, Shopify, and more
- **Multi-language support** for reject buttons in English, German, French, Spanish, Italian, Dutch, Portuguese, Polish, Swedish, Norwegian, and Danish
- **Two-step rejection** for sites that hide the reject option behind a "Settings" or "Preferences" button
- **Smart prioritization** - always clicks "Reject All" over individual category rejections

### Global Privacy Control (GPC)
- Sends the `Sec-GPC: 1` HTTP header with every request
- Sets `navigator.globalPrivacyControl = true` in every page
- Sets `navigator.doNotTrack = '1'` for legacy compatibility
- Legally binding under CCPA (California) and other privacy regulations

### User Controls
- **Enable/Disable** the extension globally
- **Whitelist sites** where you don't want automatic rejection
- **Visual indicator** shows when cookies have been rejected (green checkmark badge)
- **Statistics** track how many banners have been rejected

## How It Works

1. **GPC Signal**: Before any page loads, the extension injects the Global Privacy Control signal. Sites legally required to honor GPC will automatically respect your opt-out.

2. **CMP Detection**: When a page loads, the extension checks for known Consent Management Platforms using specific CSS selectors.

3. **Pattern Matching**: If no known CMP is found, it searches for buttons with reject-related text ("Reject All", "Decline", "Refuse", etc.) in multiple languages.

4. **Two-Step Rejection**: For sites that hide the reject option, it clicks "Settings" or "Preferences" first, then finds and clicks the reject button in the opened panel.

5. **Continuous Monitoring**: A MutationObserver watches for dynamically loaded consent banners.

## Supported Consent Management Platforms

- Sourcepoint
- OneTrust
- CookieBot
- Quantcast
- Didomi
- TrustArc
- Cookielaw
- Termly
- Klaro
- Osano
- CookieYes
- Complianz
- CookieNotice
- GDPR Cookie Consent
- Borlabs
- Iubenda
- Civic Cookie Control
- Cookie Script
- Usercentrics
- ConsentManager
- EU Cookie Law
- PMWall
- Google Funding Choices
- Shopify (native cookie consent banner)
- GitHub (radio-button based consent)

## Installation

### From Firefox Add-ons (Recommended)
Visit the [Firefox Add-ons page](#) and click "Add to Firefox".

### Manual Installation (Development)
1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the sidebar
4. Click "Load Temporary Add-on"
5. Select any file in the extension folder (e.g., `manifest.json`)

## Usage

Once installed, the extension works automatically:

1. **Green checkmark badge** appears on the toolbar icon when cookies are rejected
2. Click the **toolbar icon** to:
   - Toggle the extension on/off
   - Whitelist the current site
   - View rejection statistics

## Privacy

This extension:
- **Does NOT collect any personal data**
- **Does NOT track your browsing**
- **Does NOT communicate with external servers**
- Stores only local settings (enabled state, whitelist, statistics)
- All processing happens locally in your browser

## Permissions Explained

| Permission | Why It's Needed |
|------------|-----------------|
| `storage` | Save settings, whitelist, and statistics locally |
| `tabs` | Update toolbar icon based on active tab |
| `activeTab` | Access current tab to show whitelist status |
| `webRequest` | Add GPC header to HTTP requests |
| `webRequestBlocking` | Modify request headers before they're sent |
| `<all_urls>` | Run on all websites to detect cookie banners |

## Technical Details

### Files
- `manifest.json` - Extension configuration (Manifest V2)
- `background.js` - GPC header injection, icon management, settings
- `content.js` - Cookie banner detection and rejection logic
- `gpc-inject.js` - Early GPC property injection (runs at document_start)
- `popup.html/js/css` - Toolbar popup UI

### Global Privacy Control
The extension implements [GPC](https://globalprivacycontrol.org/) as specified by the W3C Community Group. Under CCPA, businesses must treat the GPC signal as a valid opt-out request.

### Firefox Add-ons (AMO) Requirements

The manifest includes Mozilla-specific settings required for AMO submission:

```json
"browser_specific_settings": {
  "gecko": {
    "id": "auto-reject-cookies@example.com",
    "strict_min_version": "91.0",
    "data_collection_permissions": {
      "required": ["none"]
    }
  },
  "gecko_android": {
    "strict_min_version": "113.0",
    "data_collection_permissions": {
      "required": ["none"]
    }
  }
}
```

- **data_collection_permissions**: Required since November 2025. Use `["none"]` to indicate no data collection.
- **gecko_android**: Enables Firefox for Android support (v113+).

## Contributing

Contributions are welcome! If you find a cookie banner that isn't being rejected:

1. Open the browser console (F12)
2. Look for `[Auto Reject Cookies]` messages
3. Note the button text that should be clicked
4. Open an issue or submit a PR adding the pattern

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Changelog

### v1.5.0
- Added Shopify native cookie consent banner support (goodr.com, other Shopify stores)
- Fixed page scrolling to bottom after banner dismissal — scroll position is now preserved
- Added domain-level tracking to prevent repeated banner processing on the same site
- Handled domains are remembered for 1 hour across page navigations

### v1.4.0
- Added GitHub cookie consent support (radio-button based system)
- Added custom CMP handler system for sites requiring special logic
- Implemented polling mechanism for dynamically enabled buttons

### v1.3.0
- Improved two-step rejection timing
- Bug fixes and stability improvements

### v1.2.0
- Added more CMP selectors
- Improved reload loop detection

### v1.1.0
- Added Global Privacy Control (GPC) support
- Added `Sec-GPC` header to all requests
- Added `navigator.globalPrivacyControl` property
- Added `navigator.doNotTrack` for legacy compatibility

### v1.0.0
- Initial release
- Support for 25+ CMPs
- Multi-language reject button detection
- Two-step rejection for hidden options
- Whitelist functionality
- Statistics tracking
