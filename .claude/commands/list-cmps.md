# List Supported CMPs

Show all currently supported Consent Management Platforms.

## Usage
`/list-cmps`

## Instructions

1. Read `content.js`

2. Parse the `KNOWN_CMPS` array and extract all CMP names

3. Also list the `REJECT_PATTERNS` regex patterns (show the pattern descriptions)

4. Display as a formatted list showing:
   - CMP name
   - Number of selectors for each
