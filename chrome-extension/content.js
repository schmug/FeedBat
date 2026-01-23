/**
 * Content Script - Runs on every page to detect feeds
 */

(function() {
  // Avoid running multiple times
  if (window.__feedDetectorRan) return;
  window.__feedDetectorRan = true;

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

  // Run after DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runDetection();
  } else {
    document.addEventListener('DOMContentLoaded', runDetection);
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_FEEDS') {
      const results = FeedDetector.detectFeeds(document);
      sendResponse({
        url: window.location.href,
        feeds: results.feeds,
        potentialFeeds: results.potentialFeeds,
        siteMetadata: results.siteMetadata,
        isCurrentPageFeed: results.isCurrentPageFeed
      });
    }
    return true;
  });
})();
