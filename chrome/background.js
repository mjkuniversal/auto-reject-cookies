// Background service worker for Auto Reject Cookies extension (Chrome)
console.log('[Auto Reject Cookies] Background service worker loaded');

// GPC header is handled by declarativeNetRequest rules (gpc_rules.json)
console.log('[Auto Reject Cookies] Global Privacy Control header enabled via declarativeNetRequest');

// Track tabs where cookies were rejected (to prevent resetting icon)
const rejectedTabs = new Set();

// Initialize default settings
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(['enabled', 'whitelist', 'stats']);

  if (existing.enabled === undefined) {
    await chrome.storage.local.set({ enabled: true });
  }
  if (!existing.whitelist) {
    await chrome.storage.local.set({ whitelist: [] });
  }
  if (!existing.stats) {
    await chrome.storage.local.set({ stats: { rejected: 0 } });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'cookieRejected') {
    console.log('[Auto Reject Cookies] Received cookieRejected message from tab:', sender.tab?.id);

    // Increment rejection counter
    chrome.storage.local.get('stats').then(({ stats }) => {
      const newStats = { ...stats, rejected: (stats?.rejected || 0) + 1 };
      chrome.storage.local.set({ stats: newStats });
    });

    // Update icon to green checkmark version
    if (sender.tab?.id) {
      const tabId = sender.tab.id;
      console.log('[Auto Reject Cookies] Setting success icon for tab:', tabId);

      // Mark this tab as having rejected cookies
      rejectedTabs.add(tabId);

      chrome.action.setIcon({
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
      chrome.action.setBadgeText({ text: '✓', tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tabId });

      chrome.action.setTitle({
        title: 'Cookies rejected!',
        tabId: tabId
      });
    } else {
      console.log('[Auto Reject Cookies] No tab id available, sender:', sender);
    }
    return false; // Synchronous response
  }

  if (message.type === 'getSettings') {
    chrome.storage.local.get(['enabled', 'whitelist', 'stats']).then(sendResponse);
    return true; // Async response
  }

  if (message.type === 'toggleEnabled') {
    chrome.storage.local.get('enabled').then(({ enabled }) => {
      chrome.storage.local.set({ enabled: !enabled }).then(() => {
        sendResponse({ enabled: !enabled });
      });
    });
    return true;
  }

  if (message.type === 'toggleWhitelist') {
    const domain = message.domain;
    chrome.storage.local.get('whitelist').then(({ whitelist }) => {
      const list = whitelist || [];
      const index = list.indexOf(domain);
      if (index === -1) {
        list.push(domain);
      } else {
        list.splice(index, 1);
      }
      chrome.storage.local.set({ whitelist: list }).then(() => {
        sendResponse({ whitelist: list, isWhitelisted: index === -1 });
      });
    });
    return true;
  }

  if (message.type === 'isWhitelisted') {
    const domain = message.domain;
    chrome.storage.local.get('whitelist').then(({ whitelist }) => {
      const list = whitelist || [];
      sendResponse({ isWhitelisted: list.includes(domain) });
    });
    return true;
  }
});

// Update badge when tab changes to show if site is whitelisted
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      const url = new URL(tab.url);
      const { whitelist, enabled } = await chrome.storage.local.get(['whitelist', 'enabled']);

      if (!enabled) {
        chrome.action.setBadgeText({ text: 'OFF', tabId: activeInfo.tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#9E9E9E', tabId: activeInfo.tabId });
      } else if (whitelist?.includes(url.hostname)) {
        chrome.action.setBadgeText({ text: '⏸', tabId: activeInfo.tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#FF9800', tabId: activeInfo.tabId });
      } else {
        chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
      }
    }
  } catch (e) {
    // Tab might not have a valid URL
  }
});

// Reset icon only when navigating to a NEW page (not same page)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    // Only reset if actually navigating to a new URL
    console.log('[Auto Reject Cookies] Tab navigating to new URL:', changeInfo.url);
    rejectedTabs.delete(tabId);
    chrome.action.setIcon({
      path: {
        "16": "icons/icon.svg",
        "32": "icons/icon.svg",
        "48": "icons/icon.svg",
        "96": "icons/icon.svg"
      },
      tabId: tabId
    });
    chrome.action.setBadgeText({ text: '', tabId: tabId });
    chrome.action.setTitle({
      title: 'Auto Reject Cookies',
      tabId: tabId
    });
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  rejectedTabs.delete(tabId);
});
