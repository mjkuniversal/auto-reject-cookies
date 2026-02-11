# Privacy Policy

**Auto Reject Cookies** is designed with privacy as its core mission. This policy explains how the extension handles your data.

## Data Collection

**We do not collect any data.**

This extension:
- Does NOT collect personal information
- Does NOT track your browsing history
- Does NOT send any data to external servers
- Does NOT use analytics or telemetry
- Does NOT contain advertisements

## Local Storage

The extension stores the following data **locally in your browser only**:

| Data | Purpose |
|------|---------|
| Enabled state | Remember if you've turned the extension on/off |
| Whitelist | Sites where you've disabled automatic rejection |
| Rejection count | Simple counter of banners rejected (for statistics display) |
| Handled domains | Domains where cookies were recently rejected (auto-expires after 1 hour) |

This data:
- Never leaves your browser
- Is not synced to any cloud service
- Is deleted when you uninstall the extension
- Can be cleared via Firefox's extension data settings

## Permissions

The extension requires certain permissions to function. Here's why:

### `<all_urls>`
Required to detect and reject cookie banners on any website you visit. The extension only reads the page to find consent buttons - it does not read, store, or transmit any page content.

### `webRequest` and `webRequestBlocking`
Required to add the Global Privacy Control (GPC) header to your HTTP requests. This header tells websites you do not consent to data collection. The extension only adds headers - it does not read, log, or transmit your request data.

### `storage`
Required to save your preferences (enabled state, whitelist) locally in your browser.

### `tabs` and `activeTab`
Required to update the toolbar icon when cookies are rejected and to show whitelist status for the current site.

## Third-Party Services

This extension does not use any third-party services, APIs, or analytics platforms.

## Global Privacy Control

The extension sends a Global Privacy Control (GPC) signal with every request. This is a standardized privacy signal (see [globalprivacycontrol.org](https://globalprivacycontrol.org/)) that tells websites you do not consent to having your personal data sold or shared. Under laws like CCPA, businesses are required to honor this signal.

## Open Source

This extension is open source. You can review the complete source code to verify these privacy claims.

## Contact

For privacy questions or concerns, please open an issue on the project repository.

## Changes to This Policy

Any changes to this privacy policy will be documented in the extension's changelog and repository.

---

*Last updated: February 2026*
