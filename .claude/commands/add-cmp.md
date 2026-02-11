# Add CMP Support

Add support for a new Consent Management Platform (CMP) to the extension.

## Usage
`/add-cmp <CMP Name> <selector1> [selector2] ...`

## Instructions

When the user provides a CMP name and selectors:

1. Read `content.js` and locate the `KNOWN_CMPS` array (around line 17)

2. Add a new entry to the array in the format:
```javascript
{
  name: '<CMP Name>',
  selectors: [
    '<selector1>',
    '<selector2>'
  ]
}
```

3. Place it alphabetically or at the beginning if it's a major CMP

4. If the user also provides button text patterns, add them to `REJECT_PATTERNS` array (around line 176)

5. Report what was added and remind user to reload the extension in `about:debugging`
