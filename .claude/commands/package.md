# Package Extension

Create a distributable .zip file for Firefox AMO (addons.mozilla.org) submission.

## Usage
`/package`

## Instructions

### 1. Pre-release Checks
- Ensure `DEBUG = false` in content.js (line 10)
- Verify version number is updated in both `manifest.json` and `package.sh`
- Confirm all changes are tested

### 2. Create/Update VERSION_NOTES.txt
Create or update VERSION_NOTES.txt with the following format:

```
Version X.Y.Z - Brief Title

New Features:
- Feature 1 description
- Feature 2 description

Bug Fixes:
- Fix 1 description (if applicable)

Technical Changes:
- Technical change 1
- Technical change 2

---

Notes to Reviewer:

No account required for testing.

Testing instructions:
1. Step 1
2. Step 2
3. Step 3

The extension requires no external services or accounts - it operates entirely client-side by detecting and clicking cookie consent UI elements.
```

### 3. Run Package Script
```bash
cd /home/mk/projects/auto_reject_cookies
./package.sh
```

### 4. Add VERSION_NOTES.txt to the zip
```bash
zip auto_reject_cookies-X.Y.Z.zip VERSION_NOTES.txt
```

### 5. Archive Old Versions
Move any previous version zip files to `archive_versions/`:
```bash
mv auto_reject_cookies-OLD_VERSION.zip archive_versions/
```

### 6. Verify Package Contents
```bash
unzip -l auto_reject_cookies-X.Y.Z.zip
```

Confirm it contains:
- manifest.json
- content.js
- background.js
- gpc-inject.js
- popup.html, popup.js, popup.css
- icons/
- VERSION_NOTES.txt

### 7. Report to User
- Zip file location and size
- Version number
- Remind about AMO submission at https://addons.mozilla.org/developers/
- Note: Copy VERSION_NOTES.txt content into "Version Notes" and "Notes to Reviewer" fields during submission
