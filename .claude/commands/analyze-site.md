# Analyze Site Cookie Banner

Research a website's cookie consent implementation and suggest selectors.

## Usage
`/analyze-site <website-url>`

## Instructions

1. Search the web for information about the site's CMP:
   - Search: `"<domain>" cookie consent CMP selectors`
   - Search: `"<domain>" sourcepoint OR onetrust OR cookiebot`

2. Check Consent-O-Matic rules for existing selectors:
   - Fetch: `https://raw.githubusercontent.com/cavi-au/Consent-O-Matic/master/Rules.json`
   - Look for the CMP name in the rules

3. Report findings:
   - Which CMP the site uses
   - Suggested selectors for reject button
   - Any special considerations (iframes, shadow DOM, etc.)

4. Offer to add the CMP using `/add-cmp` skill
