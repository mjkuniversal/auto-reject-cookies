# Firefox Add-ons (AMO) Listing Information

Use this information when submitting to addons.mozilla.org

---

## Name
Auto Reject Cookies

## Summary (Max 250 characters)
Automatically rejects cookie consent banners and sends Global Privacy Control signals. Supports 26+ consent platforms in 10+ languages. No data collection.

## Description

### Tired of clicking "Reject" on every website?

**Auto Reject Cookies** automatically handles cookie consent banners so you don't have to. It also sends Global Privacy Control (GPC) signals to legally opt you out of data collection.

### Features

**Automatic Banner Rejection**
- Supports 26+ Consent Management Platforms (OneTrust, CookieBot, Sourcepoint, Quantcast, Didomi, Shopify, and more)
- Recognizes reject buttons in 10+ languages (English, German, French, Spanish, Italian, Dutch, and more)
- Handles tricky "two-step" banners that hide the reject option behind Settings
- Prioritizes "Reject All" over individual toggles

**Global Privacy Control (GPC)**
- Sends the `Sec-GPC: 1` header with every request
- Sets `navigator.globalPrivacyControl` for JavaScript detection
- Legally binding under CCPA and other privacy laws
- Sites must honor this signal as an opt-out request

**User Control**
- Toggle on/off with one click
- Whitelist sites you want to exclude
- Visual indicator shows when rejection succeeded
- View statistics of rejected banners

**Privacy First**
- No data collection whatsoever
- No external servers or analytics
- All processing happens locally
- Open source and auditable

### How It Works

1. Before pages load, the extension injects the GPC signal
2. When consent banners appear, it automatically clicks "Reject All"
3. For hidden options, it clicks "Settings" then "Reject"
4. A green checkmark badge confirms success

### Permissions Explained

- **Access your data for all websites**: Needed to detect cookie banners on any site
- **Access browser tabs**: Update the toolbar icon based on the active tab
- **Monitor and modify web requests**: Add the GPC privacy header to requests

### Support

Found a banner that isn't rejected? Report it! Include the website URL and button text.

---

## Categories
- Privacy & Security

## Tags
cookies, privacy, gdpr, consent, gpc, global privacy control, cookie banner, reject cookies, ccpa, do not track

## Support Email
[Your email]

## Support Website
[Your repository URL]

## License
MIT

---

## Screenshots Suggestions

1. **Before/After**: Show a cookie banner being automatically rejected
2. **Popup UI**: Show the extension popup with toggle and statistics
3. **GPC Working**: Console showing `navigator.globalPrivacyControl = true`
4. **Icon States**: Show the default icon and green checkmark badge

---

## Reviewer Notes

```
This extension automatically rejects cookie consent banners and implements Global Privacy Control (GPC).

TECHNICAL NOTES

• All code is plain, unminified JavaScript - no build process
• Uses Manifest V2 for broader Firefox compatibility
• webRequestBlocking permission is used solely to add the Sec-GPC header to requests (privacy feature, not data collection)
• gpc-inject.js runs at document_start to set navigator.globalPrivacyControl before page scripts execute
• Content script injection into page context is required because content scripts run in an isolated world and cannot modify navigator directly

HOW TO TEST

1. Visit a site with cookie banners (e.g., elpais.com in a private window)
2. The extension will automatically click "Reject" or "Configuration" then "Reject All"
3. Green checkmark badge appears on success
4. Verify GPC: Open console and type navigator.globalPrivacyControl (should return true)
5. Verify header: Network tab → any request → Headers → look for "Sec-GPC: 1"

NO DATA COLLECTION

This extension makes no external network requests. All processing happens locally. The only storage used is browser.storage.local for user preferences (enabled state, whitelist, rejection count).
```

---

## AMO Submission Checklist

- [ ] Upload `auto_reject_cookies-1.5.0.zip`
- [ ] Source code submission: **No** (plain unminified JS, no build process)
- [ ] License: **MIT License**
- [ ] Privacy Policy: Paste content from `PRIVACY.md` or host on GitHub
- [ ] Categories: Privacy & Security
- [ ] Tags: cookies, privacy, gdpr, consent, gpc, global privacy control, cookie banner, reject cookies, ccpa, do not track

---

## Manifest Requirements (as of November 2025)

Mozilla requires `data_collection_permissions` in the manifest:

```json
"browser_specific_settings": {
  "gecko": {
    "id": "your-extension-id@example.com",
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

**Important**: Use `["none"]` (not `false` or `[]`) to indicate no data collection.

---

## Version Notes (for v1.5.0)

New in this version:
- Added Shopify native cookie consent banner support
- Fixed page scrolling to bottom after banner dismissal
- Added domain-level tracking to prevent repeated processing on same site
- Handled domains remembered for 1 hour across page navigations
