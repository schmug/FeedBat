/**
 * Popup Script - Displays detected feeds
 */

// Default settings
const DEFAULT_SETTINGS = {
  autoCheck: true,
  showPotential: false,
  showBadge: true,
  probeCommon: false
};

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    return { ...DEFAULT_SETTINGS, ...result.settings };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Save settings to storage
async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set({ settings });
    // Notify background script of settings change
    chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED', settings });
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    loading: document.getElementById('loading'),
    noFeeds: document.getElementById('no-feeds'),
    feedsSection: document.getElementById('feeds-section'),
    feedsList: document.getElementById('feeds-list'),
    potentialSection: document.getElementById('potential-section'),
    potentialList: document.getElementById('potential-list'),
    siteName: document.getElementById('site-name'),
    siteUrl: document.getElementById('site-url'),
    checkCommon: document.getElementById('check-common'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsPanel: document.getElementById('settings-panel'),
    settingsDone: document.getElementById('settings-done'),
    mainContent: document.getElementById('main-content'),
    // Settings checkboxes
    settingAutoCheck: document.getElementById('setting-auto-check'),
    settingShowPotential: document.getElementById('setting-show-potential'),
    settingBadge: document.getElementById('setting-badge'),
    settingProbeCommon: document.getElementById('setting-probe-common')
  };

  // Load and apply settings
  const settings = await loadSettings();
  elements.settingAutoCheck.checked = settings.autoCheck;
  elements.settingShowPotential.checked = settings.showPotential;
  elements.settingBadge.checked = settings.showBadge;
  elements.settingProbeCommon.checked = settings.probeCommon;

  // Settings button toggle
  elements.settingsBtn.addEventListener('click', () => {
    const isVisible = !elements.settingsPanel.classList.contains('hidden');
    if (isVisible) {
      elements.settingsPanel.classList.add('hidden');
      elements.mainContent.classList.remove('hidden');
    } else {
      elements.settingsPanel.classList.remove('hidden');
      elements.mainContent.classList.add('hidden');
    }
  });

  // Settings done button
  elements.settingsDone.addEventListener('click', async () => {
    const newSettings = {
      autoCheck: elements.settingAutoCheck.checked,
      showPotential: elements.settingShowPotential.checked,
      showBadge: elements.settingBadge.checked,
      probeCommon: elements.settingProbeCommon.checked
    };
    await saveSettings(newSettings);
    elements.settingsPanel.classList.add('hidden');
    elements.mainContent.classList.remove('hidden');
  });

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) {
    showError('Could not get current tab');
    return;
  }

  // Request feeds from content script
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_FEEDS' });
    displayResults(response, elements, settings);
  } catch (error) {
    // Content script might not be loaded (e.g., chrome:// pages)
    elements.loading.classList.add('hidden');
    elements.noFeeds.classList.remove('hidden');
    elements.noFeeds.querySelector('p').textContent =
      'Cannot detect feeds on this page (browser internal page).';
    elements.checkCommon.classList.add('hidden');
  }

  // Handle "Check common paths" button
  elements.checkCommon?.addEventListener('click', async () => {
    elements.checkCommon.disabled = true;
    elements.checkCommon.textContent = 'Checking...';

    try {
      const url = new URL(tab.url);
      const commonPaths = [
        '/feed', '/feed/', '/feed.xml', '/rss', '/rss.xml',
        '/atom.xml', '/index.xml', '/feed.json'
      ];

      const foundFeeds = [];

      for (const path of commonPaths) {
        try {
          const feedUrl = url.origin + path;
          const response = await fetch(feedUrl, { method: 'HEAD' });
          const contentType = response.headers.get('content-type') || '';

          if (response.ok && (
            contentType.includes('xml') ||
            contentType.includes('rss') ||
            contentType.includes('atom') ||
            contentType.includes('json')
          )) {
            foundFeeds.push({
              url: feedUrl,
              title: getFeedTitle(path),
              type: getFeedType(contentType),
              source: 'common-path'
            });
          }
        } catch (e) {
          // Skip failed requests
        }
      }

      if (foundFeeds.length > 0) {
        elements.noFeeds.classList.add('hidden');
        elements.feedsSection.classList.remove('hidden');
        foundFeeds.forEach(feed => {
          elements.feedsList.appendChild(createFeedItem(feed));
        });
      } else {
        elements.checkCommon.textContent = 'No feeds found';
      }
    } catch (error) {
      elements.checkCommon.textContent = 'Error checking';
    }
  });
});

function displayResults(data, elements, settings) {
  elements.loading.classList.add('hidden');

  if (!data) {
    elements.noFeeds.classList.remove('hidden');
    return;
  }

  // Update site info
  if (data.siteMetadata) {
    const meta = data.siteMetadata;
    elements.siteName.textContent = meta.siteName || 'FeedBat';
    elements.siteUrl.textContent = truncateUrl(data.url || meta.siteUrl);
  }

  // Display feeds
  if (data.feeds && data.feeds.length > 0) {
    elements.feedsSection.classList.remove('hidden');
    data.feeds.forEach(feed => {
      elements.feedsList.appendChild(createFeedItem(feed, data.isCurrentPageFeed));
    });
  }

  // Display potential feeds (if setting enabled)
  if (settings.showPotential && data.potentialFeeds && data.potentialFeeds.length > 0) {
    elements.potentialSection.classList.remove('hidden');
    data.potentialFeeds.slice(0, 5).forEach(feed => {
      elements.potentialList.appendChild(createFeedItem(feed));
    });
  }

  // Show no feeds message if nothing found
  if ((!data.feeds || data.feeds.length === 0) &&
      (!settings.showPotential || !data.potentialFeeds || data.potentialFeeds.length === 0)) {
    elements.noFeeds.classList.remove('hidden');
  }
}

function createFeedItem(feed, isCurrentPage = false) {
  const li = document.createElement('li');
  li.className = 'feed-item';

  const icon = getFeedIcon(feed.type);
  const typeClass = feed.type?.toLowerCase().includes('atom') ? 'atom' :
                    feed.type?.toLowerCase().includes('json') ? 'json' :
                    feed.type?.toLowerCase().includes('rss') ? 'rss' : '';

  li.innerHTML = `
    <span class="feed-icon">${icon}</span>
    <div class="feed-info">
      <span class="feed-title">${escapeHtml(feed.title || 'Feed')}${
        feed.source === 'current-page' ? '<span class="current-page-badge">This Page</span>' : ''
      }</span>
      <span class="feed-url">${escapeHtml(truncateUrl(feed.url))}</span>
    </div>
    <span class="feed-type ${typeClass}">${escapeHtml(feed.type || 'Feed')}</span>
    <div class="feed-actions">
      <button class="btn-icon copy-btn" title="Copy URL" data-url="${escapeHtml(feed.url)}">📋</button>
      <button class="btn-icon open-btn" title="Open feed" data-url="${escapeHtml(feed.url)}">↗️</button>
    </div>
  `;

  // Add event listeners
  li.querySelector('.copy-btn').addEventListener('click', async (e) => {
    const url = e.currentTarget.dataset.url;
    await navigator.clipboard.writeText(url);
    e.currentTarget.textContent = '✓';
    e.currentTarget.classList.add('copied');
    setTimeout(() => {
      e.currentTarget.textContent = '📋';
      e.currentTarget.classList.remove('copied');
    }, 1500);
  });

  li.querySelector('.open-btn').addEventListener('click', (e) => {
    const url = e.currentTarget.dataset.url;
    chrome.tabs.create({ url });
  });

  return li;
}

function getFeedIcon(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('json')) return '📄';
  if (t.includes('atom')) return '⚛️';
  if (t.includes('rss') || t.includes('rdf')) return '📡';
  return '🦇';
}

function getFeedType(contentType) {
  if (contentType.includes('atom')) return 'Atom';
  if (contentType.includes('rss')) return 'RSS';
  if (contentType.includes('json')) return 'JSON';
  return 'XML';
}

function getFeedTitle(path) {
  if (path.includes('atom')) return 'Atom Feed';
  if (path.includes('rss')) return 'RSS Feed';
  if (path.includes('json')) return 'JSON Feed';
  return 'Site Feed';
}

function truncateUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    return display.length > 40 ? display.substring(0, 40) + '...' : display;
  } catch {
    return url.length > 40 ? url.substring(0, 40) + '...' : url;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError(message) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('no-feeds').classList.remove('hidden');
  document.querySelector('#no-feeds p').textContent = message;
}
