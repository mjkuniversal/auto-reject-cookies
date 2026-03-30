document.addEventListener('DOMContentLoaded', async () => {
  const enabledToggle = document.getElementById('enabledToggle');
  const whitelistBtn = document.getElementById('whitelistBtn');
  const whitelistText = document.getElementById('whitelistText');
  const statsText = document.getElementById('statsText');

  let currentDomain = null;

  // Get current tab's domain
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const url = new URL(tab.url);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        currentDomain = url.hostname;
      }
    }
  } catch (e) {
    console.error('Could not get current tab:', e);
  }

  // Load current settings
  async function loadSettings() {
    const { enabled, whitelist, stats } = await browser.storage.local.get(['enabled', 'whitelist', 'stats']);

    enabledToggle.checked = enabled !== false;

    if (stats?.rejected) {
      statsText.textContent = `Cookies rejected: ${stats.rejected}`;
    }

    if (currentDomain) {
      const isWhitelisted = whitelist?.includes(currentDomain);
      updateWhitelistButton(isWhitelisted);
    } else {
      whitelistBtn.disabled = true;
      whitelistText.textContent = 'Not available';
    }
  }

  function updateWhitelistButton(isWhitelisted) {
    if (isWhitelisted) {
      whitelistBtn.classList.add('active');
      whitelistText.textContent = 'Remove from whitelist';
    } else {
      whitelistBtn.classList.remove('active');
      whitelistText.textContent = 'Whitelist this site';
    }
  }

  // Toggle enabled state
  enabledToggle.addEventListener('change', async () => {
    await browser.storage.local.set({ enabled: enabledToggle.checked });
  });

  // Toggle whitelist for current domain
  whitelistBtn.addEventListener('click', async () => {
    if (!currentDomain) return;

    const { whitelist } = await browser.storage.local.get('whitelist');
    const list = whitelist || [];

    const index = list.indexOf(currentDomain);
    if (index === -1) {
      list.push(currentDomain);
      updateWhitelistButton(true);
    } else {
      list.splice(index, 1);
      updateWhitelistButton(false);
    }

    await browser.storage.local.set({ whitelist: list });
  });

  loadSettings();
});
