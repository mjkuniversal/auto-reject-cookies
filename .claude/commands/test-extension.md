# Create Test Extension

Create a parallel test version of the extension for development testing.

## Usage
`/test-extension`

## Instructions

### 1. Create Test Directory
```bash
mkdir -p /home/mk/projects/test-auto-reject-cookies
```

### 2. Copy Extension Files
```bash
cp /home/mk/projects/extensions/auto-reject-cookies/{content.js,background.js,gpc-inject.js,manifest.json,popup.html,popup.js,popup.css} /home/mk/projects/test-auto-reject-cookies/
cp -r /home/mk/projects/extensions/auto-reject-cookies/icons /home/mk/projects/test-auto-reject-cookies/
```

### 3. Modify Test manifest.json
Update the following in `/home/mk/projects/test-auto-reject-cookies/manifest.json`:

```json
{
  "name": "[TEST] Auto Reject Cookies",
  "version": "X.Y.Z",
  "browser_specific_settings": {
    "gecko": {
      "id": "test-auto-reject-cookies@example.com",
      "strict_min_version": "91.0"
    }
  },
  ...
}
```

Remove `gecko_android` and `data_collection_permissions` sections (not needed for local testing).

### 4. Enable Debug Mode
In `/home/mk/projects/test-auto-reject-cookies/content.js`, set:
```javascript
const DEBUG = true;  // Enabled for test version
```

### 5. Update Test popup.html (optional)
Change the title to make it clear this is the test version:
```html
<h1>TEST Version</h1>
```

### 6. Report to User
- Test extension location: `/home/mk/projects/test-auto-reject-cookies/`
- Instructions to load:
  1. Go to `about:debugging` in Firefox
  2. Click "This Firefox" → "Load Temporary Add-on"
  3. Select `/home/mk/projects/test-auto-reject-cookies/manifest.json`
- Debug output will appear in browser console with `[Auto Reject Cookies]` prefix
