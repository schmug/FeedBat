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

### From the Chrome Web Store

Once published, install FeedBat directly from the Chrome Web Store. (Submission
materials live in [`store-assets/`](store-assets/) — see
[`STORE_SUBMISSION.md`](store-assets/STORE_SUBMISSION.md).)

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/schmug/FeedBat.git
   cd FeedBat
   ```

2. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

3. Pin the extension for easy access

Icons are already committed to `chrome-extension/icons/`. To regenerate them,
open `chrome-extension/icons/generate-icons.html` in a browser.

## Packaging for the Chrome Web Store

```bash
./build.sh
```

Produces `dist/feedbat-<version>.zip` with `manifest.json` at the archive root
and development-only files excluded. Full submission walkthrough (privacy
policy, store listing copy, screenshots, dashboard steps) is in
[`store-assets/STORE_SUBMISSION.md`](store-assets/STORE_SUBMISSION.md).

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
5. **YouTube Channels** - Automatically extracts RSS feeds from YouTube videos, shorts, and channel pages

### YouTube RSS Detection

YouTube doesn't advertise RSS feeds, but every channel has one. FeedBat automatically detects YouTube pages and extracts the channel's RSS feed URL:

- **Video pages** (`/watch?v=...`) - Extracts the channel ID from the video owner
- **Shorts** (`/shorts/...`) - Extracts from the shorts player overlay
- **Channel pages** (`/@username`, `/channel/...`, `/c/...`) - Extracts from the channel header

Since YouTube is a Single Page Application (SPA), FeedBat waits for YouTube's dynamic content to load before detecting feeds. It also listens for navigation events to update the feed when you browse between videos.

## Credits

The feed detection logic in this extension is adapted from [**feedsearch-crawler**](https://github.com/DBeath/feedsearch-crawler), an excellent Python library for RSS/Atom/JSON feed discovery by [DBeath](https://github.com/DBeath).

**Original Library:**
- [feedsearch-crawler on GitHub](https://github.com/DBeath/feedsearch-crawler)
- [feedsearch-crawler on PyPI](https://pypi.org/project/feedsearch-crawler/)

## Privacy

FeedBat has no servers, no analytics, and no tracking. Page analysis happens
entirely in your browser. See [PRIVACY.md](PRIVACY.md) (hosted at
https://schmug.github.io/FeedBat/privacy.html).

## License

MIT License - see [LICENSE](LICENSE)
