/**
 * Feed Detector - Core detection logic
 * Ported from feedsearch-crawler Python library
 */

const FeedDetector = {
  // Regex patterns from feedsearch-crawler/src/feedsearch_crawler/feed_spider/regexes.py
  patterns: {
    // Detects RSS/Atom/RDF feed content
    rss: /(<rss|<rdf|<feed)/i,

    // Feed-like URL patterns
    feedlike: /\b(rss|feeds?|atom|json|xml|rdf|blogs?|subscribe)\b/i,

    // Podcast patterns
    podcast: /\b(podcasts?)\b/i,

    // Author/journalist pages (lower priority)
    author: /(authors?|journalists?|writers?|contributors?)/i,

    // Date patterns in URLs (article pages, low priority)
    date: /\/(\d{4}\/\d{2})\//
  },

  // Feed MIME types to detect
  feedTypes: [
    'application/rss+xml',
    'application/atom+xml',
    'application/feed+json',
    'application/json',
    'text/xml',
    'application/xml',
    'application/rdf+xml'
  ],

  // Common feed paths to probe
  commonFeedPaths: [
    '/feed',
    '/feed/',
    '/feed.xml',
    '/feeds',
    '/rss',
    '/rss/',
    '/rss.xml',
    '/atom',
    '/atom.xml',
    '/index.xml',
    '/feed.json',
    '/blog/feed',
    '/blog/rss',
    '/blog/atom.xml',
    '/.rss',
    '/rss2',
    '/feed/rss',
    '/feed/atom'
  ],

  // Invalid URL patterns to skip
  invalidPatterns: [
    /wp-includes/i,
    /wp-content/i,
    /wp-json/i,
    /xmlrpc/i,
    /wp-admin/i,
    /\/amp\//i,
    /mailto:/i,
    /javascript:/i,
    /^#/
  ],

  // Invalid file extensions
  invalidExtensions: [
    'jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp', 'svg',
    'mp4', 'mp3', 'wav', 'ogg', 'webm',
    'css', 'js', 'woff', 'woff2', 'ttf', 'eot',
    'pdf', 'doc', 'docx', 'zip', 'tar', 'gz'
  ],

  /**
   * Extract feed links from <link> tags in the document
   * @param {Document} doc - The document to analyze
   * @returns {Array} Array of feed objects
   */
  extractFeedLinks(doc) {
    const feeds = [];
    const seen = new Set();

    // Find all <link rel="alternate"> tags with feed types
    doc.querySelectorAll('link[rel="alternate"]').forEach(link => {
      const type = link.getAttribute('type') || '';
      const href = link.getAttribute('href');
      const title = link.getAttribute('title') || '';

      if (!href) return;

      // Check if this is a feed type
      const isFeed = this.feedTypes.some(feedType =>
        type.toLowerCase().includes(feedType.split('/')[1])
      );

      if (isFeed || this.patterns.feedlike.test(type)) {
        try {
          const absoluteUrl = new URL(href, doc.location.href).href;
          if (!seen.has(absoluteUrl)) {
            seen.add(absoluteUrl);
            feeds.push({
              url: absoluteUrl,
              title: title || this.getTitleFromUrl(absoluteUrl),
              type: this.getFeedType(type),
              source: 'link-tag'
            });
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    return feeds;
  },

  /**
   * Extract potential feed URLs from all links on the page
   * @param {Document} doc - The document to analyze
   * @returns {Array} Array of potential feed URLs
   */
  extractPotentialFeeds(doc) {
    const potentialFeeds = [];
    const seen = new Set();

    doc.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Skip invalid patterns
      if (this.invalidPatterns.some(pattern => pattern.test(href))) {
        return;
      }

      // Skip invalid extensions
      const extension = href.split('.').pop()?.toLowerCase().split('?')[0];
      if (this.invalidExtensions.includes(extension)) {
        return;
      }

      // Check if URL matches feed-like patterns
      if (this.patterns.feedlike.test(href)) {
        try {
          const absoluteUrl = new URL(href, doc.location.href).href;
          if (!seen.has(absoluteUrl)) {
            seen.add(absoluteUrl);
            potentialFeeds.push({
              url: absoluteUrl,
              title: link.textContent?.trim() || this.getTitleFromUrl(absoluteUrl),
              type: 'unknown',
              source: 'link-pattern'
            });
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    return potentialFeeds;
  },

  /**
   * Check if the current page itself is a feed
   * @param {Document} doc - The document to check
   * @returns {Object|null} Feed info if page is a feed, null otherwise
   */
  checkIfPageIsFeed(doc) {
    const html = doc.documentElement.outerHTML;
    const first1000 = html.substring(0, 1000);

    // Check for RSS/Atom/RDF tags
    if (this.patterns.rss.test(first1000)) {
      return {
        url: doc.location.href,
        title: doc.title || 'Current Page Feed',
        type: this.detectFeedTypeFromContent(first1000),
        source: 'current-page'
      };
    }

    // Check for JSON feed
    try {
      const pre = doc.querySelector('pre');
      if (pre) {
        const json = JSON.parse(pre.textContent);
        if (json.version?.includes('jsonfeed.org') && json.items) {
          return {
            url: doc.location.href,
            title: json.title || 'JSON Feed',
            type: 'JSON Feed',
            source: 'current-page'
          };
        }
      }
    } catch (e) {
      // Not valid JSON, continue
    }

    return null;
  },

  /**
   * Generate common feed URLs to probe for the current site
   * @param {string} baseUrl - The base URL of the site
   * @returns {Array} Array of URLs to check
   */
  generateCommonFeedUrls(baseUrl) {
    try {
      const url = new URL(baseUrl);
      const origin = url.origin;

      return this.commonFeedPaths.map(path => origin + path);
    } catch (e) {
      return [];
    }
  },

  /**
   * Extract site metadata
   * @param {Document} doc - The document to analyze
   * @returns {Object} Site metadata
   */
  extractSiteMetadata(doc) {
    const canonical = doc.querySelector('link[rel="canonical"]');
    const siteUrl = canonical?.href || doc.location.href;

    const siteName =
      doc.querySelector('meta[property="og:site_name"]')?.content ||
      doc.querySelector('meta[property="og:title"]')?.content ||
      doc.querySelector('meta[name="application-name"]')?.content ||
      doc.title ||
      new URL(siteUrl).hostname;

    const favicon =
      doc.querySelector('link[rel="icon"]')?.href ||
      doc.querySelector('link[rel="shortcut icon"]')?.href ||
      new URL('/favicon.ico', siteUrl).href;

    return { siteUrl, siteName, favicon };
  },

  /**
   * Detect feed type from content
   * @param {string} content - Feed content (first 1000 chars)
   * @returns {string} Feed type
   */
  detectFeedTypeFromContent(content) {
    if (/<rss/i.test(content)) return 'RSS';
    if (/<feed/i.test(content)) return 'Atom';
    if (/<rdf/i.test(content)) return 'RDF';
    return 'XML Feed';
  },

  /**
   * Get feed type from MIME type
   * @param {string} mimeType - The MIME type
   * @returns {string} Human-readable feed type
   */
  getFeedType(mimeType) {
    const type = mimeType.toLowerCase();
    if (type.includes('rss')) return 'RSS';
    if (type.includes('atom')) return 'Atom';
    if (type.includes('json')) return 'JSON Feed';
    if (type.includes('rdf')) return 'RDF';
    return 'Feed';
  },

  /**
   * Extract a title from URL path
   * @param {string} url - The URL
   * @returns {string} A title derived from the URL
   */
  getTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;

      // Common feed paths get descriptive names
      if (/\/atom/i.test(path)) return 'Atom Feed';
      if (/\/rss/i.test(path)) return 'RSS Feed';
      if (/\/feed\.json/i.test(path)) return 'JSON Feed';
      if (/\/feed/i.test(path)) return 'Site Feed';
      if (/\/index\.xml/i.test(path)) return 'Site Feed';

      // Extract last path segment
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 0) {
        const last = segments[segments.length - 1]
          .replace(/\.(xml|rss|atom|json)$/i, '')
          .replace(/[-_]/g, ' ');
        return last.charAt(0).toUpperCase() + last.slice(1) + ' Feed';
      }

      return 'Feed';
    } catch (e) {
      return 'Feed';
    }
  },

  /**
   * Main detection function - finds all feeds on the page
   * @param {Document} doc - The document to analyze
   * @returns {Object} Detection results
   */
  detectFeeds(doc) {
    const results = {
      feeds: [],
      potentialFeeds: [],
      siteMetadata: this.extractSiteMetadata(doc),
      isCurrentPageFeed: false
    };

    // Check if current page is a feed
    const pageFeed = this.checkIfPageIsFeed(doc);
    if (pageFeed) {
      results.feeds.push(pageFeed);
      results.isCurrentPageFeed = true;
    }

    // Extract declared feed links
    const declaredFeeds = this.extractFeedLinks(doc);
    results.feeds.push(...declaredFeeds);

    // Extract potential feeds from page links
    const potentialFeeds = this.extractPotentialFeeds(doc);
    results.potentialFeeds.push(...potentialFeeds);

    // Deduplicate feeds
    const seenUrls = new Set();
    results.feeds = results.feeds.filter(feed => {
      if (seenUrls.has(feed.url)) return false;
      seenUrls.add(feed.url);
      return true;
    });

    results.potentialFeeds = results.potentialFeeds.filter(feed => {
      if (seenUrls.has(feed.url)) return false;
      seenUrls.add(feed.url);
      return true;
    });

    return results;
  }
};

// Make available globally for content script
if (typeof window !== 'undefined') {
  window.FeedDetector = FeedDetector;
}
