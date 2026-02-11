# Repository Guidelines

## Project Structure & Module Organization
- `manifest.json`, `background.js`, `content.js`, `gpc-inject.js`, `popup.html/js/css` are the Firefox extension core.
- `chrome/` mirrors the Firefox files for the Chrome build (separate `manifest.json` and assets).
- `icons/` and `chrome/icons/` hold toolbar and badge artwork.
- `landing.css`, `index.html`, `landing-ghl.html` are the landing pages; `AMO_LISTING.md` and `PRIVACY.md` support store submission.
- Versioned zip artifacts (e.g., `auto_reject_cookies-1.2.0.zip`) are release outputs.

## Build, Test, and Development Commands
- `./package.sh` builds the Firefox submission zip in the repo root.
- `./chrome/package.sh` builds the Chrome zip inside `chrome/`.
- Manual run (Firefox): `about:debugging` → "This Firefox" → "Load Temporary Add-on" → select `manifest.json`.
- There is no compiled build step or automated test suite.

## Coding Style & Naming Conventions
- JavaScript uses 2-space indentation, single quotes, and semicolons (match existing files like `content.js`).
- Prefer `const`/`let` over `var`. Keep functions small and self-contained.
- Naming: use descriptive, uppercase constants (`KNOWN_CMPS`, `REJECT_PATTERNS`) and camelCase for functions/variables.
- If adding CMP support, update `KNOWN_CMPS`, `REJECT_PATTERNS`, and `SETTINGS_PATTERNS` in `content.js`.

## Testing Guidelines
- No automated tests are present. Validate changes manually in Firefox.
- Enable logging by setting `DEBUG = true` in `content.js` and watch for `[Auto Reject Cookies]` console output.
- Verify GPC by checking `navigator.globalPrivacyControl === true` and request header `Sec-GPC: 1`.

## Commit & Pull Request Guidelines
- No Git history is available here to infer conventions. Use short, imperative commit messages (e.g., "Add Klaro reject selector").
- PRs should include: summary of changes, test/verification notes, and screenshots for UI or popup changes.
- Link relevant issues and note any sites used for manual verification.

## Security & Configuration Tips
- Keep `data_collection_permissions` as `["none"]` in `manifest.json` for AMO compliance.
- Avoid adding network calls or data collection without updating `PRIVACY.md` and store listing content.
