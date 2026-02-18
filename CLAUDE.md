# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Firefox WebExtension that automatically rejects cookie consent banners and sends Global Privacy Control (GPC) signals. Supports 26+ known CMPs (Consent Management Platforms), generic pattern matching in 10+ languages, and two-step rejection for hidden options.

## Key Features

- **Automatic cookie banner rejection** via CMP selectors and text pattern matching
- **Global Privacy Control (GPC)** - sends `Sec-GPC: 1` header and sets `navigator.globalPrivacyControl`
- **Multi-language support** - English, German, French, Spanish, Italian, Dutch, Portuguese, Polish, Swedish, Norwegian, Danish
- **Two-step rejection** - clicks "Settings" then "Reject" for sites that hide the option
- **Priority matching** - always prefers "Reject All" over individual toggles

## Development

### Loading the Extension
```bash
# In Firefox:
# 1. Navigate to about:debugging
# 2. Click "This Firefox" → "Load Temporary Add-on"
# 3. Select manifest.json
```

### Debug Mode
Set `DEBUG = true` in `content.js` (line 10) to enable console logging. Look for `[Auto Reject Cookies]` messages.

### Verifying GPC
```javascript
// In browser console:
navigator.globalPrivacyControl  // Should return true

// In Network tab, check request headers for:
Sec-GPC: 1
```

### Testing Sites
- **elpais.com** - PMWall with two-step rejection (Configuration → Disagree to all)
- **EU news sites** - Most show consent banners
- **US sites** - Many only have "Accept" (GPC handles these)

## Architecture

```
├── manifest.json       # Extension manifest (Manifest V2)
├── gpc-inject.js       # Runs at document_start, sets navigator.globalPrivacyControl
├── content.js          # Runs at document_end, detects and clicks reject buttons
│   ├── KNOWN_CMPS[]              # 25+ CMP-specific selectors
│   ├── CUSTOM_CMP_HANDLERS{}     # Special handlers for complex CMPs (e.g., GitHub)
│   ├── REJECT_PATTERNS[]         # Regex patterns for reject button text
│   ├── SETTINGS_PATTERNS[]       # Patterns for settings/preferences buttons
│   ├── PRIORITY_PATTERNS[]       # Patterns containing "all" (prioritized)
│   ├── isInConsentContext()      # Prevents clicking navigation links
│   └── MutationObserver          # Catches dynamically loaded banners
├── background.js       # GPC header injection, settings, icon updates
├── popup.html/js/css   # Toggle UI + whitelist button
├── icons/              # Default and success state icons
├── VERSION_NOTES.txt   # Release notes for current version
└── archive_versions/   # Previous release zip files
```

## Adding Support for New CMPs

### Standard CMPs (selector-based)

For CMPs that use a single reject button:

#### 1. Add to KNOWN_CMPS array (content.js ~line 48)
```javascript
{
  name: 'NewCMP',
  selectors: [
    '#reject-button-id',
    '.reject-button-class',
    'button[data-action="reject"]'
  ]
}
```

#### 2. Add text patterns for reject buttons (content.js ~line 224)
```javascript
/^new\s+reject\s+text$/i,
```

#### 3. Add settings button patterns if needed (content.js ~line 287)
```javascript
/^open\s+preferences$/i,
```

### Custom CMP Handlers (complex logic)

For CMPs that require special handling (e.g., radio buttons, multi-step processes):

#### 1. Add entry to KNOWN_CMPS with empty selectors
```javascript
{
  name: 'CustomCMP',
  // Handled by custom handler below
  selectors: []
}
```

#### 2. Add handler to CUSTOM_CMP_HANDLERS (content.js ~line 227)
```javascript
const CUSTOM_CMP_HANDLERS = {
  'CustomCMP': function() {
    // Domain check (optional but recommended)
    const hostname = window.location.hostname;
    if (!hostname.includes('example.com')) {
      return false;
    }

    // Custom logic here (click radios, fill forms, etc.)
    // ...

    // Notify background script on success
    try {
      browser.runtime.sendMessage({ type: 'cookieRejected', url: window.location.href });
    } catch (e) {}

    return true; // Return true if handled, false otherwise
  }
};
```

#### Example: GitHub (radio button based)
GitHub uses radio buttons for each cookie category instead of a single reject button. The custom handler:
1. Clicks all `input[type="radio"][value="reject"]` elements
2. Polls for the "Save changes" button to become enabled
3. Clicks the save button

## Key Functions

| Function | Purpose |
|----------|---------|
| `tryKnownCMPs()` | Try clicking buttons using CMP-specific selectors |
| `tryGenericPatterns()` | Search for buttons matching reject text patterns |
| `trySettingsButton()` | Click settings/preferences to reveal reject option |
| `tryClick()` | Validate visibility and click a button |
| `isInConsentContext()` | Check if button is in a cookie consent container |
| `observeDOM()` | Watch for dynamically added banners |

## Debugging Tips

1. **Check content script loads**: Look for `Initialized on <url>` in console
2. **Check GPC injection**: `navigator.globalPrivacyControl` should be `true`
3. **Check header injection**: Network tab → Request headers → `Sec-GPC: 1`
4. **Check iframe access**: Banner might be in iframe (all_frames: true handles this)
5. **Check button visibility**: `tryClick` logs why buttons fail visibility checks
6. **Test selector**: `document.querySelector('your-selector')` in console

## Files for AMO Submission

- `README.md` - User-facing documentation
- `LICENSE` - MIT license
- `PRIVACY.md` - Privacy policy
- `AMO_LISTING.md` - Listing description and metadata for addons.mozilla.org
- `package.sh` - Script to create submission zip file

## AMO Submission Requirements (as of November 2025)

### data_collection_permissions (Required)
Mozilla requires all new extensions to declare data collection practices:

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

**Important**:
- Use `["none"]` for extensions that don't collect data (not `false` or `[]`)
- Include `gecko_android` for Firefox Android support
- The extension ID must remain consistent across all updates

### Submission Checklist
- Source code: **Not required** (plain unminified JS, no build process)
- License: MIT
- Privacy Policy: Required (use PRIVACY.md content)
- Categories: Privacy & Security

### Creating the Package

Use the `/package` skill to create a release package. This will:
1. Verify DEBUG is disabled
2. Update version numbers
3. Create/update VERSION_NOTES.txt with release notes and reviewer instructions
4. Run package.sh to create the zip
5. Add VERSION_NOTES.txt to the zip
6. Archive old versions

```bash
./package.sh
# Creates auto_reject_cookies-X.Y.Z.zip ready for upload
```

### VERSION_NOTES.txt Format
Every release must include VERSION_NOTES.txt with:
- Version number and title
- New features list
- Bug fixes (if applicable)
- Technical changes
- Notes to Reviewer section with testing instructions

## Available Skills

| Skill | Description |
|-------|-------------|
| `/package` | Create release zip for AMO submission with version notes |
| `/add-cmp` | Add support for a new Consent Management Platform |
| `/analyze-site` | Analyze a site's cookie banner for CMP detection |
| `/debug` | Toggle debug mode in content.js |
| `/list-cmps` | List all supported CMPs |

## Testing with a Parallel Test Extension

To test changes without affecting your production extension:

```bash
# Create test extension directory
mkdir -p /home/mk/projects/test-auto-reject-cookies
cp content.js background.js gpc-inject.js manifest.json popup.* /home/mk/projects/test-auto-reject-cookies/
cp -r icons /home/mk/projects/test-auto-reject-cookies/

# Edit test manifest.json:
# - Change name to "[TEST] Auto Reject Cookies"
# - Change id to "test-auto-reject-cookies@example.com"
# - Remove gecko_android and data_collection_permissions (not needed for local testing)

# Enable debug in test content.js:
# Set DEBUG = true

# Load in Firefox via about:debugging
```

## Hive Teams

Agents from [Hive](~/projects/tools/hive) are installed globally at `~/.claude/agents/`. Use these teams for complex tasks:

| Team | Lead | Use For |
|------|------|---------|
| Extensions | extension-lead | CMP handler development, DOM selectors, Manifest V2 architecture |
| QA & Security | qa-lead | Cross-site testing, GPC verification, AMO submission compliance |
| Research | research-lead | Identifying new CMPs, analyzing cookie banner patterns across sites |
