#!/bin/bash
# Package the extension for Firefox Add-ons submission
#
# Usage: ./package.sh
#
# Before releasing a new version:
# 1. Update VERSION below
# 2. Update version in manifest.json to match
# 3. Run this script
# 4. Upload the generated .zip to addons.mozilla.org

# Extension name and version (update version here when releasing)
NAME="auto_reject_cookies"
VERSION="1.7.3"

# Firefox source directory
SRCDIR="firefox"

# Files to include in the package (relative to SRCDIR)
FILES=(
  "manifest.json"
  "background.js"
  "content.js"
  "gpc-inject.js"
  "popup.html"
  "popup.js"
  "popup.css"
  "icons/icon.svg"
  "icons/icon-success.svg"
  "icons/Store Logo.png"
)

# Output filename
OUTPUT="${NAME}-${VERSION}.zip"

# Remove old package if exists
rm -f "$OUTPUT"

# Create the zip file from the firefox/ directory (flat structure for AMO)
echo "Creating $OUTPUT..."
cd "$SRCDIR"
zip "../$OUTPUT" "${FILES[@]}"
cd ..

# Verify
echo ""
echo "Package contents:"
unzip -l "$OUTPUT"

echo ""
echo "Created: $OUTPUT"
echo "Ready for upload to addons.mozilla.org"
