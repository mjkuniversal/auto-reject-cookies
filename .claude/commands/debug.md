# Toggle Debug Mode

Enable or disable debug logging in the extension.

## Usage
`/debug on` or `/debug off`

## Instructions

1. Read `content.js` and find the `DEBUG` constant (line 8)

2. If user wants debug on:
   - Set `const DEBUG = true;`

3. If user wants debug off:
   - Set `const DEBUG = false;`

4. Remind user to:
   - Reload extension in `about:debugging`
   - Open browser console (F12) to see `[Auto Reject Cookies]` messages
