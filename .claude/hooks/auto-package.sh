#!/bin/bash
# Auto-version and package hook for Auto Reject Cookies extension
# PostToolUse hook: runs after Edit/Write on source files
# - Bumps version by .1 (debounced: max once per 5 minutes)
# - Archives old zips to archive_versions/
# - Creates new zips in releases/firefox/ and releases/chrome/

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

[ -z "$FILE_PATH" ] && exit 0

PROJECT="/home/mk/projects/extensions/auto-reject-cookies"
STATE_FILE="/tmp/arc-auto-package-state"
DEBOUNCE_SECONDS=300

# Only trigger on source files (not manifests, package scripts, docs, VERSION_NOTES)
is_source_file() {
  case "$1" in
    "$PROJECT"/firefox/content.js|"$PROJECT"/firefox/background.js|"$PROJECT"/firefox/gpc-inject.js)
      echo "yes" ;;
    "$PROJECT"/firefox/popup.js|"$PROJECT"/firefox/popup.html|"$PROJECT"/firefox/popup.css)
      echo "yes" ;;
    "$PROJECT"/chrome/content.js|"$PROJECT"/chrome/background.js|"$PROJECT"/chrome/gpc-inject.js)
      echo "yes" ;;
    "$PROJECT"/chrome/popup.js|"$PROJECT"/chrome/popup.html|"$PROJECT"/chrome/popup.css)
      echo "yes" ;;
    "$PROJECT"/chrome/gpc_rules.json)
      echo "yes" ;;
    *)
      echo "" ;;
  esac
}

[ -z "$(is_source_file "$FILE_PATH")" ] && exit 0

# Bump last segment of a version string by 1 (e.g., 1.7.1 -> 1.7.2, 4.1 -> 4.2)
bump_version() {
  local ver="$1"
  IFS='.' read -ra parts <<< "$ver"
  local last=$(( ${#parts[@]} - 1 ))
  parts[$last]=$(( parts[$last] + 1 ))
  local result="${parts[0]}"
  for (( i=1; i<${#parts[@]}; i++ )); do
    result="$result.${parts[$i]}"
  done
  echo "$result"
}

# Read current versions
FF_VER=$(jq -r '.version' "$PROJECT/firefox/manifest.json")
CR_VER=$(jq -r '.version' "$PROJECT/chrome/manifest.json")

# Check debounce: only bump if >5 min since last package
SHOULD_BUMP=true
if [ -f "$STATE_FILE" ]; then
  LAST_TIME=$(cat "$STATE_FILE")
  NOW=$(date +%s)
  if [ $(( NOW - LAST_TIME )) -lt "$DEBOUNCE_SECONDS" ]; then
    SHOULD_BUMP=false
  fi
fi

if [ "$SHOULD_BUMP" = true ]; then
  NEW_FF=$(bump_version "$FF_VER")
  NEW_CR=$(bump_version "$CR_VER")

  # Update Firefox manifest + package.sh
  sed -i "s/\"version\": \"${FF_VER}\"/\"version\": \"${NEW_FF}\"/" "$PROJECT/firefox/manifest.json"
  sed -i "s/^VERSION=\"${FF_VER}\"/VERSION=\"${NEW_FF}\"/" "$PROJECT/package.sh"

  # Update Chrome manifest + package.sh
  sed -i "s/\"version\": \"${CR_VER}\"/\"version\": \"${NEW_CR}\"/" "$PROJECT/chrome/manifest.json"
  sed -i "s/^VERSION=\"${CR_VER}\"/VERSION=\"${NEW_CR}\"/" "$PROJECT/chrome/package.sh"

  # Archive old zips from all locations
  for zip in "$PROJECT"/auto_reject_cookies-*.zip "$PROJECT"/releases/firefox/auto_reject_cookies-*.zip; do
    [ -f "$zip" ] && mv "$zip" "$PROJECT/archive_versions/"
  done
  for zip in "$PROJECT"/chrome/auto_reject_cookies-chrome-*.zip "$PROJECT"/releases/chrome/auto_reject_cookies-chrome-*.zip; do
    [ -f "$zip" ] && mv "$zip" "$PROJECT/archive_versions/"
  done

  FF_VER="$NEW_FF"
  CR_VER="$NEW_CR"
fi

# Package Firefox
FF_ZIP="auto_reject_cookies-${FF_VER}.zip"
cd "$PROJECT/firefox"
rm -f "$PROJECT/releases/firefox/$FF_ZIP"
zip -q "$PROJECT/releases/firefox/$FF_ZIP" \
  manifest.json background.js content.js gpc-inject.js \
  popup.html popup.js popup.css \
  icons/icon.svg icons/icon-success.svg "icons/Store Logo.png"
[ -f "$PROJECT/VERSION_NOTES.txt" ] && cd "$PROJECT" && zip -q "releases/firefox/$FF_ZIP" VERSION_NOTES.txt

# Package Chrome
CR_ZIP="auto_reject_cookies-chrome-${CR_VER}.zip"
cd "$PROJECT/chrome"
rm -f "$PROJECT/releases/chrome/$CR_ZIP"
zip -q "$PROJECT/releases/chrome/$CR_ZIP" \
  manifest.json background.js content.js gpc-inject.js gpc_rules.json \
  popup.html popup.js popup.css \
  icons/icon.svg icons/icon-success.svg "icons/Store Logo.png"

# Record timestamp
date +%s > "$STATE_FILE"

# Output summary for conversation context
if [ "$SHOULD_BUMP" = true ]; then
  echo "Auto-packaged: Firefox v${FF_VER} -> releases/firefox/${FF_ZIP} | Chrome v${CR_VER} -> releases/chrome/${CR_ZIP} (old zips archived)"
else
  echo "Repackaged (debounce, no version bump): Firefox ${FF_ZIP} | Chrome ${CR_ZIP}"
fi
