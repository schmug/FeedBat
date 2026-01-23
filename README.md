# FeedBat 🦇

A Chrome extension that discovers RSS, Atom, and JSON feeds on any webpage. Your trusty companion for finding feeds in the wild.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- 🦇 Automatically detects RSS, Atom, and JSON feeds on any webpage
- 🔔 Badge notification when feeds are found
- ⚙️ Configurable settings
- 📋 One-click copy feed URL to clipboard
- 🔗 Open feeds directly in new tab
- 🔍 Probe common feed paths on demand

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/schmug/feedsearch-crawler.git
   cd feedsearch-crawler
   ```

2. Generate icons (first time only):
   - Open `chrome-extension/icons/generate-icons.html` in your browser
   - Click "Download All Icons"
   - Save the PNG files to the `chrome-extension/icons/` folder

3. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

4. Pin the extension for easy access

## Usage

1. Navigate to any website
2. Look for the purple badge showing feed count
3. Click the icon to see detected feeds
4. Copy or open feeds with one click

## Settings

Click ⚙️ in the popup to configure:

| Setting | Description |
|---------|-------------|
| Auto-detect feeds | Scan pages automatically on load |
| Show potential feeds | Display links that might be feeds |
| Show badge count | Display feed count on icon |
| Auto-probe common paths | Check /feed, /rss.xml, etc. automatically |

## How It Works

FeedBat detects feeds using multiple methods:

1. **Link Tags** - Parses `<link rel="alternate">` tags with feed MIME types
2. **Direct Detection** - Checks if the current page is itself a feed
3. **URL Patterns** - Identifies links containing feed-related keywords (rss, atom, feed, etc.)
4. **Common Paths** - Probes standard locations like `/feed`, `/rss.xml`, `/atom.xml`

## Credits

The feed detection logic in this extension is adapted from [**feedsearch-crawler**](https://github.com/DBeath/feedsearch-crawler), an excellent Python library for RSS/Atom/JSON feed discovery by [DBeath](https://github.com/DBeath).

If you need server-side feed discovery with comprehensive crawling, scoring, and metadata extraction, check out the original Python library:

```bash
pip install feedsearch-crawler
```

**Original Project Links:**
- [feedsearch-crawler on GitHub](https://github.com/DBeath/feedsearch-crawler)
- [feedsearch-crawler on PyPI](https://pypi.org/project/feedsearch-crawler/)
- [feedsearch.dev API](https://feedsearch.dev)

## License

MIT License - see [LICENSE](LICENSE)
