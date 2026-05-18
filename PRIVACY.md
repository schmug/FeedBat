# FeedBat Privacy Policy

**Last updated: May 18, 2026**

**Summary: FeedBat does not collect, store, or transmit any of your data to us
or any third party. It has no servers, no analytics, and no tracking.**

The canonical, hosted version of this policy is at:
**https://schmug.github.io/FeedBat/privacy.html**

FeedBat is a Chrome extension that detects RSS, Atom, and JSON feeds on the page
you are viewing.

## What the extension accesses

- **The current page's content and URL.** FeedBat reads the page's HTML —
  `<link>` tags, `<a>` links, meta tags, and (on YouTube) embedded script text —
  to find feed URLs. This analysis happens entirely in your browser. The page
  content is never sent anywhere.
- **"Check common paths" network requests.** When you click the *Check common
  paths* button, FeedBat issues HTTP `HEAD` requests to standard feed locations
  (e.g. `/feed`, `/rss.xml`) **on the website you are currently viewing only**.
  These go directly from your browser to that site; no data passes through us.
- **Your settings.** Four on/off preferences are saved via Chrome's
  `storage.sync` API. Chrome may sync them across your own signed-in browsers.
  They contain no personal information and are never sent to the developer.

## What we do NOT do

- No personally identifiable information collected, stored, or transmitted.
- No analytics, telemetry, or tracking.
- No developer-operated server receives your data.
- No selling or sharing of data with third parties.
- No reading or storing of browsing history.

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | Read / probe the current page only when you interact with the extension. |
| `storage` | Save your four settings locally / via Chrome sync. |
| Content script on all sites | Feed detection must run on whatever site you visit. It only reads the page. |

## Contact

Open an issue at https://github.com/schmug/FeedBat/issues
