# Contributing to Auto Reject Cookies

Thanks for your interest in contributing! This extension helps users automatically reject cookie consent banners, and community contributions make it better for everyone.

## Reporting Unhandled Cookie Banners

The most common contribution is reporting a cookie banner that the extension doesn't handle. To file a good report:

1. Open the browser console (F12) and look for `[Auto Reject Cookies]` messages
2. Note the website URL
3. Note the text on the reject/decline button
4. Check if the banner is inside an iframe (look at the console's context selector)
5. Open an issue with this information

## Adding Support for a New CMP

If you want to add support for a new Consent Management Platform:

### Simple CMP (single reject button)

Add an entry to the `KNOWN_CMPS` array in `content.js`:

```javascript
{
  name: 'NewCMP',
  selectors: [
    '#reject-button-id',
    '.reject-button-class',
    'button[data-action="reject"]'
  ]
}
```

### Complex CMP (multi-step or special logic)

Add an entry to `KNOWN_CMPS` with empty selectors and a handler in `CUSTOM_CMP_HANDLERS`. See the GitHub handler in `content.js` for an example.

### Text patterns

If the CMP uses a standard button with reject-like text in a new language, add a regex to `REJECT_PATTERNS` or `SETTINGS_PATTERNS`.

## Development Setup

1. Clone the repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" > "Load Temporary Add-on"
4. Select `manifest.json`

### Debug Mode

Set `DEBUG = true` in `content.js` (line 10) to enable console logging. Messages are prefixed with `[Auto Reject Cookies]`.

## Pull Request Guidelines

- Keep changes focused on a single feature or fix
- Test on at least one site that uses the CMP you're adding/fixing
- Include the test URL in your PR description
- Don't modify unrelated code

## Code Style

- Plain JavaScript, no build tools or transpilation
- No external dependencies
- Use `log()` for debug messages (only visible when `DEBUG = true`)
- Set `DEBUG = false` before submitting

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
