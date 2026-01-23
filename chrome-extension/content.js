/**
 * Content Script - Runs on every page to detect feeds
 */

(function() {
  // Avoid running multiple times
  if (window.__feedDetectorRan) return;
  window.__feedDetectorRan = true;

  // Check if this is a YouTube page
  function isYouTubePage() {
    const url = window.location.href;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  // Wait for YouTube's dynamic content to load
  function waitForYouTubeContent(maxWaitMs = 5000) {
    return new Promise((resolve) => {
      // Selectors that indicate YouTube has loaded its dynamic content
      const youtubeSelectors = [
        'ytd-video-owner-renderer',           // Video page owner info
        'ytd-channel-name',                   // Channel name element
        'meta[itemprop="channelId"]',         // Channel ID meta tag
        'ytd-reel-player-overlay-renderer',   // Shorts player
        '#channel-header'                     // Channel page header
      ];

      // Check if any YouTube element is already present
      function hasYouTubeContent() {
        return youtubeSelectors.some(selector => document.querySelector(selector));
      }

      // Also check for channelId in scripts
      function hasChannelIdInScripts() {
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
          const text = script.textContent;
          if (text && text.includes('"channelId":"UC')) {
            return true;
          }
        }
        return false;
      }

      if (hasYouTubeContent() || hasChannelIdInScripts()) {
        resolve();
        return;
      }

      const startTime = Date.now();

      // Use MutationObserver to watch for YouTube elements
      const observer = new MutationObserver((mutations, obs) => {
        if (hasYouTubeContent() || hasChannelIdInScripts()) {
          obs.disconnect();
          resolve();
        } else if (Date.now() - startTime > maxWaitMs) {
          obs.disconnect();
          resolve(); // Timeout - proceed anyway
        }
      });

      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });

      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, maxWaitMs);
    });
  }

  // Run detection
  function runDetection() {
    const results = FeedDetector.detectFeeds(document);

    // Send results to background script
    chrome.runtime.sendMessage({
      type: 'FEEDS_DETECTED',
      data: {
        url: window.location.href,
        feeds: results.feeds,
        potentialFeeds: results.potentialFeeds,
        siteMetadata: results.siteMetadata,
        isCurrentPageFeed: results.isCurrentPageFeed,
        timestamp: Date.now()
      }
    });
  }

  // Main initialization
  async function init() {
    if (isYouTubePage()) {
      // YouTube is an SPA - wait for dynamic content to load
      await waitForYouTubeContent();
    }
    runDetection();
  }

  // Run after DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_FEEDS') {
      // Handle async for YouTube pages
      (async () => {
        if (isYouTubePage()) {
          await waitForYouTubeContent(3000); // Shorter timeout for popup requests
        }
        const results = FeedDetector.detectFeeds(document);
        sendResponse({
          url: window.location.href,
          feeds: results.feeds,
          potentialFeeds: results.potentialFeeds,
          siteMetadata: results.siteMetadata,
          isCurrentPageFeed: results.isCurrentPageFeed
        });
      })();
      return true; // Indicates async response
    }
    return true;
  });

  // Handle YouTube SPA navigation (YouTube doesn't do full page reloads)
  if (isYouTubePage()) {
    // Track current URL to detect navigation
    let lastUrl = window.location.href;

    // YouTube fires this custom event when navigation completes
    document.addEventListener('yt-navigate-finish', async () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        await waitForYouTubeContent();
        runDetection();
      }
    });

    // Fallback: watch for URL changes via popstate
    window.addEventListener('popstate', async () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        await waitForYouTubeContent();
        runDetection();
      }
    });
  }
})();
