# Feedsearch - Chrome Extension

A Chrome extension that discovers RSS, Atom, and JSON feeds on any webpage and notifies you when feeds are available.

## About

This extension is a browser-based port of [**feedsearch-crawler**](https://github.com/DBeath/feedsearch-crawler), a Python library for RSS/Atom/JSON feed discovery. The core detection algorithms, regex patterns, and URL filtering heuristics have been adapted from the original Python implementation to run client-side in the browser.

### Original Project

**feedsearch-crawler** is an asyncio-based web crawler that discovers RSS feeds on websites. It powers [feedsearch.dev](https://feedsearch.dev) and is available on PyPI:

```bash
pip install feedsearch-crawler
```

The Python library provides:
- Concurrent feed discovery across multiple pages
- Feed scoring and ranking
- Site metadata extraction
- OPML export

This Chrome extension brings the feed detection logic directly to your browser for instant, per-page feed discovery.

## Features

- Automatically detects RSS, Atom, and JSON feeds on any webpage
- Shows orange badge notification when feeds are found
- Clean popup UI displaying feed title, type, and URL
- One-click copy feed URL to clipboard
- Open feeds directly in new tab
- Probe common feed paths (`/feed`, `/rss.xml`, `/atom.xml`) on demand
- Works on most websites

## Installation

### From Source (Developer Mode)

1. **Clone or download** this repository

2. **Generate icons** (first time only):
   - Open `icons/generate-icons.html` in your browser
   - Click "Download All Icons"
   - Save the PNG files to the `icons/` folder

3. **Load the extension**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

4. **Pin the extension**:
   - Click the puzzle piece icon in Chrome toolbar
   - Click the pin icon next to "Feedsearch"

## Usage

1. Navigate to any website
2. Look for the orange badge on the extension icon showing the number of feeds found
3. Click the extension icon to see detected feeds
4. Click 📋 to copy a feed URL to clipboard
5. Click ↗️ to open the feed in a new tab

## How It Works

The extension uses the same detection strategies as feedsearch-crawler:

### Feed Detection Methods

1. **Link Tags**: Parses `<link rel="alternate">` tags with feed MIME types
   ```html
   <link rel="alternate" type="application/rss+xml" href="/feed.xml">
   <link rel="alternate" type="application/atom+xml" href="/atom.xml">
   ```

2. **Direct Feed Detection**: Checks if the current page is itself a feed by looking for `<rss>`, `<feed>`, or `<rdf>` root elements

3. **URL Pattern Matching**: Identifies links containing feed-related keywords using regex patterns from feedsearch-crawler:
   ```javascript
   /\b(rss|feeds?|atom|json|xml|rdf|blogs?|subscribe)\b/i
   ```

4. **Common Path Probing**: Checks standard feed locations like `/feed`, `/rss.xml`, `/atom.xml`, `/index.xml`

### Ported from feedsearch-crawler

The following components were adapted from the Python library:

| Python Module | JavaScript File | Purpose |
|---------------|-----------------|---------|
| `regexes.py` | `feed-detector.js` | Feed URL patterns, RSS/Atom detection |
| `link_filter.py` | `feed-detector.js` | URL filtering, invalid pattern exclusion |
| `site_meta_parser.py` | `feed-detector.js` | Site metadata extraction |
| `feed_info_parser.py` | `feed-detector.js` | Feed type detection |

## Feed Types Detected

- RSS 2.0 / RSS 1.0
- Atom
- JSON Feed
- RDF

## Permissions

| Permission | Purpose |
|------------|---------|
| `activeTab` | Analyze the current page for feeds |
| `storage` | Cache feed results per tab |
| `<all_urls>` | Probe common feed paths |

## Project Structure

```
chrome-extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── feed-detector.js    # Core detection logic (ported from Python)
├── content.js          # Content script - runs on every page
├── background.js       # Service worker - badge updates
├── popup.html          # Extension popup UI
├── popup.css           # Popup styles
├── popup.js            # Popup functionality
├── icons/              # Extension icons
│   ├── generate-icons.html
│   ├── generate-icons.js
│   └── icon*.png
└── README.md
```

## Differences from feedsearch-crawler

| Feature | Python Library | Chrome Extension |
|---------|----------------|------------------|
| Scope | Multi-page crawling | Single page |
| Execution | Server-side | Client-side |
| Feed validation | Full parsing with feedparser | Header/pattern detection |
| Feed scoring | Comprehensive scoring system | Basic type detection |
| Performance | Async concurrent requests | Instant, no network overhead |

## Credits

This extension is based on [**feedsearch-crawler**](https://github.com/DBeath/feedsearch-crawler) by [DBeath](https://github.com/DBeath).

The original Python library is an excellent tool for server-side feed discovery and powers the [feedsearch.dev](https://feedsearch.dev) API. If you need comprehensive feed discovery with scoring, metadata extraction, and multi-page crawling, use the Python library.

## License

MIT License - Same as feedsearch-crawler

## Links

- [feedsearch-crawler on GitHub](https://github.com/DBeath/feedsearch-crawler)
- [feedsearch-crawler on PyPI](https://pypi.org/project/feedsearch-crawler/)
- [feedsearch.dev API](https://feedsearch.dev)
