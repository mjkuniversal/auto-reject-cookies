// Background script for Auto Reject Cookies extension
console.log('[Auto Reject Cookies] Background script loaded');

// Global Privacy Control (GPC) - Add Sec-GPC header to all requests
browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    // Add the Sec-GPC header
    details.requestHeaders.push({
      name: 'Sec-GPC',
      value: '1'
    });
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'requestHeaders']
);

console.log('[Auto Reject Cookies] Global Privacy Control header enabled');

// Track tabs where cookies were rejected (to prevent resetting icon)
const rejectedTabs = new Set();

// Initialize default settings
browser.runtime.onInstalled.addListener(async () => {
  const existing = await browser.storage.local.get(['enabled', 'whitelist', 'stats']);

  if (existing.enabled === undefined) {
    await browser.storage.local.set({ enabled: true });
  }
  if (!existing.whitelist) {
    await browser.storage.local.set({ whitelist: [] });
  }
  if (!existing.stats) {
    await browser.storage.local.set({ stats: { rejected: 0 } });
  }
});

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'cookieRejected') {
    console.log('[Auto Reject Cookies] Received cookieRejected message from tab:', sender.tab?.id);

    // Increment rejection counter
    browser.storage.local.get('stats').then(({ stats }) => {
      const newStats = { ...stats, rejected: (stats?.rejected || 0) + 1 };
      browser.storage.local.set({ stats: newStats });
    });

    // Update icon to green checkmark version
    if (sender.tab?.id) {
      const tabId = sender.tab.id;
      console.log('[Auto Reject Cookies] Setting success icon for tab:', tabId);

      // Mark this tab as having rejected cookies
      rejectedTabs.add(tabId);

      browser.browserAction.setIcon({
        path: {
          "16": "icons/icon-success.svg",
          "32": "icons/icon-success.svg",
          "48": "icons/icon-success.svg",
          "96": "icons/icon-success.svg"
        },
        tabId: tabId
      }).then(() => {
        console.log('[Auto Reject Cookies] Icon updated successfully');
      }).catch(err => {
        console.error('[Auto Reject Cookies] Error setting icon:', err);
      });

      // Also set badge as backup visual indicator
      browser.browserAction.setBadgeText({ text: '✓', tabId: tabId });
      browser.browserAction.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tabId });

      browser.browserAction.setTitle({
        title: 'Cookies rejected!',
        tabId: tabId
      });
    } else {
      console.log('[Auto Reject Cookies] No tab id available, sender:', sender);
    }
    return false; // Synchronous response
  }

  if (message.type === 'getSettings') {
    browser.storage.local.get(['enabled', 'whitelist', 'stats']).then(sendResponse);
    return true; // Async response
  }

  if (message.type === 'toggleEnabled') {
    browser.storage.local.get('enabled').then(({ enabled }) => {
      browser.storage.local.set({ enabled: !enabled }).then(() => {
        sendResponse({ enabled: !enabled });
      });
    });
    return true;
  }

  if (message.type === 'toggleWhitelist') {
    const domain = message.domain;
    browser.storage.local.get('whitelist').then(({ whitelist }) => {
      const list = whitelist || [];
      const index = list.indexOf(domain);
      if (index === -1) {
        list.push(domain);
      } else {
        list.splice(index, 1);
      }
      browser.storage.local.set({ whitelist: list }).then(() => {
        sendResponse({ whitelist: list, isWhitelisted: index === -1 });
      });
    });
    return true;
  }

  if (message.type === 'isWhitelisted') {
    const domain = message.domain;
    browser.storage.local.get('whitelist').then(({ whitelist }) => {
      const list = whitelist || [];
      sendResponse({ isWhitelisted: list.includes(domain) });
    });
    return true;
  }
});

// Update badge when tab changes to show if site is whitelisted
browser.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await browser.tabs.get(activeInfo.tabId);
    if (tab.url) {
      const url = new URL(tab.url);
      const { whitelist, enabled } = await browser.storage.local.get(['whitelist', 'enabled']);

      if (!enabled) {
        browser.browserAction.setBadgeText({ text: 'OFF', tabId: activeInfo.tabId });
        browser.browserAction.setBadgeBackgroundColor({ color: '#9E9E9E', tabId: activeInfo.tabId });
      } else if (whitelist?.includes(url.hostname)) {
        browser.browserAction.setBadgeText({ text: '⏸', tabId: activeInfo.tabId });
        browser.browserAction.setBadgeBackgroundColor({ color: '#FF9800', tabId: activeInfo.tabId });
      } else {
        browser.browserAction.setBadgeText({ text: '', tabId: activeInfo.tabId });
      }
    }
  } catch (e) {
    // Tab might not have a valid URL
  }
});

// Reset icon only when navigating to a NEW page (not same page)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    // Only reset if actually navigating to a new URL
    console.log('[Auto Reject Cookies] Tab navigating to new URL:', changeInfo.url);
    rejectedTabs.delete(tabId);
    browser.browserAction.setIcon({
      path: {
        "16": "icons/icon.svg",
        "32": "icons/icon.svg",
        "48": "icons/icon.svg",
        "96": "icons/icon.svg"
      },
      tabId: tabId
    });
    browser.browserAction.setBadgeText({ text: '', tabId: tabId });
    browser.browserAction.setTitle({
      title: 'Auto Reject Cookies',
      tabId: tabId
    });
  }
});

// Clean up when tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
  rejectedTabs.delete(tabId);
});
