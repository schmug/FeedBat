# FeedBat 🦇 - Chrome Extension

A Chrome extension that discovers RSS, Atom, and JSON feeds on any webpage. Your trusty companion for finding feeds in the wild.

## About

FeedBat is a browser-based companion to your RSS reader. It detects feeds on any webpage and notifies you with a badge count, making it easy to subscribe to new content.

The feed detection logic is adapted from [**feedsearch-crawler**](https://github.com/DBeath/feedsearch-crawler), a Python library for RSS/Atom/JSON feed discovery by DBeath.

## Features

- 🦇 Automatically detects RSS, Atom, and JSON feeds on any webpage
- 🔔 Purple badge notification when feeds are found
- ⚙️ Configurable settings
- 📋 One-click copy feed URL to clipboard
- 🔗 Open feeds directly in new tab
- 🔍 Probe common feed paths on demand
- 🎨 Clean, modern UI

## Installation

### From Source (Developer Mode)

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/schmug/FeedBat.git
   cd FeedBat/chrome-extension
   ```

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
   - Click the pin icon next to "FeedBat"

## Usage

1. Navigate to any website
2. Look for the purple badge on the FeedBat icon showing the number of feeds found
3. Click the extension icon to see detected feeds
4. Click 📋 to copy a feed URL to clipboard
5. Click ↗️ to open the feed in a new tab

## Settings

Click the ⚙️ button in the popup to access settings:

| Setting | Description |
|---------|-------------|
| Auto-detect feeds | Automatically scan pages on load |
| Show potential feeds | Display links that might be feeds |
| Show badge count | Display feed count on extension icon |
| Auto-probe common paths | Automatically check `/feed`, `/rss.xml`, etc. |

## How It Works

FeedBat uses the same detection strategies as the original feedsearch-crawler library:

### Feed Detection Methods

1. **Link Tags**: Parses `<link rel="alternate">` tags with feed MIME types
   ```html
   <link rel="alternate" type="application/rss+xml" href="/feed.xml">
   ```

2. **Direct Feed Detection**: Checks if the current page is itself a feed

3. **URL Pattern Matching**: Identifies links containing feed-related keywords
   ```javascript
   /\b(rss|feeds?|atom|json|xml|rdf|blogs?|subscribe)\b/i
   ```

4. **Common Path Probing**: Checks standard feed locations like `/feed`, `/rss.xml`, `/atom.xml`

## Feed Types Detected

- RSS 2.0 / RSS 1.0
- Atom
- JSON Feed
- RDF

## Project Structure

```
chrome-extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── feed-detector.js    # Core detection logic
├── content.js          # Content script - runs on every page
├── background.js       # Service worker - badge updates
├── popup.html          # Extension popup UI
├── popup.css           # Popup styles (purple theme)
├── popup.js            # Popup functionality + settings
├── icons/              # Extension icons
│   ├── generate-icons.html  # Browser-based icon generator
│   ├── generate-icons.js    # Node.js icon generator
│   └── icon*.png
└── README.md
```

## Credits

Feed detection logic adapted from [**feedsearch-crawler**](https://github.com/DBeath/feedsearch-crawler) by DBeath.

## License

MIT License

## Links

- [FeedBat on GitHub](https://github.com/schmug/FeedBat)
- [Original feedsearch-crawler](https://github.com/DBeath/feedsearch-crawler)
