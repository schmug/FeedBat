/**
 * Background Service Worker - Manages badge and stores feed data
 */

// Store feed data per tab
const tabFeeds = new Map();

// Current settings
let currentSettings = {
  showBadge: true
};

// Load settings on startup
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    if (result.settings) {
      currentSettings = { ...currentSettings, ...result.settings };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
}

// Initialize settings
loadSettings();

// Update badge for a tab
function updateBadge(tabId, feedCount) {
  if (!currentSettings.showBadge) {
    chrome.action.setBadgeText({ tabId, text: '' });
    chrome.action.setTitle({ tabId, title: 'FeedBat - Click to check for feeds' });
    return;
  }

  if (feedCount > 0) {
    chrome.action.setBadgeText({ tabId, text: String(feedCount) });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#5a4fcf' }); // Purple to match theme
    chrome.action.setTitle({ tabId, title: `${feedCount} feed(s) found` });
  } else {
    chrome.action.setBadgeText({ tabId, text: '' });
    chrome.action.setTitle({ tabId, title: 'FeedBat - No feeds detected' });
  }
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FEEDS_DETECTED' && sender.tab?.id) {
    const tabId = sender.tab.id;
    const data = message.data;

    // Store feed data
    tabFeeds.set(tabId, data);

    // Update badge
    const feedCount = data.feeds.length;
    updateBadge(tabId, feedCount);
  }

  if (message.type === 'GET_TAB_FEEDS') {
    const tabId = message.tabId;
    const data = tabFeeds.get(tabId) || null;
    sendResponse(data);
  }

  if (message.type === 'SETTINGS_UPDATED') {
    currentSettings = { ...currentSettings, ...message.settings };
    // Update all existing tab badges
    tabFeeds.forEach((data, tabId) => {
      updateBadge(tabId, data.feeds.length);
    });
  }

  return true;
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabFeeds.delete(tabId);
});

// Clean up when tab navigates
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabFeeds.delete(tabId);
    updateBadge(tabId, 0);
  }
});

// Handle extension icon click when no popup (for future use)
chrome.action.onClicked.addListener((tab) => {
  // Popup handles this, but we could add fallback behavior here
});
