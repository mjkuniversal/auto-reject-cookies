#!/bin/bash
# Package the Chrome extension for Chrome Web Store submission
#
# Usage: ./package.sh
#
# Before releasing a new version:
# 1. Update VERSION below
# 2. Update version in manifest.json to match
# 3. Run this script
# 4. Upload the generated .zip to Chrome Web Store

# Extension name and version (update version here when releasing)
NAME="auto_reject_cookies"
VERSION="1.3.0"

# Files to include in the package
FILES=(
  "manifest.json"
  "background.js"
  "content.js"
  "gpc-inject.js"
  "gpc_rules.json"
  "popup.html"
  "popup.js"
  "popup.css"
  "icons/icon.svg"
  "icons/icon-success.svg"
  "icons/Store Logo.png"
)

# Output filename
OUTPUT="${NAME}-chrome-${VERSION}.zip"

# Remove old package if exists
rm -f "$OUTPUT"

# Create the zip file (preserving directory structure)
echo "Creating $OUTPUT..."
zip "$OUTPUT" "${FILES[@]}"

# Verify
echo ""
echo "Package contents:"
unzip -l "$OUTPUT"

echo ""
echo "Created: $OUTPUT"
echo "Ready for upload to Chrome Web Store"
