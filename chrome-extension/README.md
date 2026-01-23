# RSS Feed Detector - Chrome Extension

A Chrome extension that detects RSS, Atom, and JSON feeds on web pages and notifies you when feeds are available.

Powered by the feed detection logic from [feedsearch-crawler](https://github.com/DBeath/feedsearch-crawler).

## Features

- Automatically detects RSS, Atom, and JSON feeds on any webpage
- Shows badge notification when feeds are found
- Displays feed title, type, and URL in a clean popup UI
- Copy feed URLs to clipboard with one click
- Open feeds in new tab
- Check common feed paths when no feeds are auto-detected
- Works on most websites

## Installation

### From Source (Developer Mode)

1. **Generate icons** (required first time):
   - Open `icons/generate-icons.html` in your browser
   - Click "Download All Icons"
   - Save the downloaded PNG files to the `icons/` folder

2. **Load the extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

3. **Pin the extension**:
   - Click the puzzle piece icon in Chrome toolbar
   - Click the pin icon next to "RSS Feed Detector"

## Usage

1. Navigate to any website
2. Look for the orange badge on the extension icon showing the number of feeds found
3. Click the extension icon to see detected feeds
4. Click the copy button (📋) to copy a feed URL
5. Click the open button (↗️) to open the feed in a new tab

## How It Works

The extension uses pattern matching and HTML parsing to detect feeds:

1. **Link Tags**: Looks for `<link rel="alternate" type="application/rss+xml">` and similar tags
2. **Page Content**: Checks if the current page itself is a feed (RSS, Atom, or JSON Feed)
3. **URL Patterns**: Identifies links containing feed-related keywords (rss, atom, feed, etc.)
4. **Common Paths**: Can probe common feed paths like `/feed`, `/rss.xml`, `/atom.xml`

## Feed Types Detected

- RSS 2.0 / RSS 1.0
- Atom
- JSON Feed
- RDF

## Permissions

- `activeTab`: Required to detect feeds on the current page
- `storage`: For caching feed results
- `<all_urls>`: Required to check common feed paths

## Development

### Project Structure

```
chrome-extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker for badge updates
├── content.js          # Content script loader
├── feed-detector.js    # Core feed detection logic
├── popup.html          # Extension popup UI
├── popup.css           # Popup styles
├── popup.js            # Popup functionality
├── icons/              # Extension icons
│   ├── generate-icons.html  # Icon generator
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Key Files

- **feed-detector.js**: Contains all the feed detection logic ported from the Python feedsearch-crawler library. This includes regex patterns, URL filtering, and HTML parsing.

- **content.js**: Runs on every page, calls FeedDetector, and sends results to the background script.

- **background.js**: Manages the badge count and stores feed data per tab.

- **popup.js**: Displays the detected feeds when the user clicks the extension icon.

## Credits

Feed detection logic adapted from [feedsearch-crawler](https://github.com/DBeath/feedsearch-crawler) by DBeath.

## License

MIT License - Same as feedsearch-crawler
