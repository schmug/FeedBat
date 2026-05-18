# FeedBat — Chrome Web Store Submission Guide

Everything below is in this repo. Follow it top to bottom; it takes ~20 minutes.

---

## 0. One-time prerequisites

- A Chrome Web Store developer account (you have this).
- The **$5 one-time** developer registration fee paid (required before your
  first item can be published — pay it at the dashboard if you haven't).

---

## 1. Publish the privacy policy (GitHub Pages)

Chrome will not approve the listing without a reachable privacy policy URL.

1. Commit & push the `docs/` folder (done as part of the PR for this work).
2. On GitHub: **Settings → Pages**.
3. **Source:** `Deploy from a branch` → Branch: **`master`** → Folder:
   **`/docs`** → **Save**.
4. Wait ~1–3 minutes for the first deploy.
5. **Verify it returns HTTP 200 before continuing:**
   ```bash
   curl -sI https://schmug.github.io/FeedBat/privacy.html | head -1
   # expect: HTTP/2 200
   ```
   The landing page also lives at https://schmug.github.io/FeedBat/ .

> The submission form rejects an unreachable privacy URL. Don't skip the curl
> check — Pages has a deploy lag.

---

## 1b. Smoke-test the unpacked extension (DO NOT SKIP)

The manifest was tightened (no `host_permissions`); `activeTab` + statically
declared content scripts should cover everything, but this must be confirmed in
a real browser before submission — a broken extension can still pass review.

1. `chrome://extensions/` → enable **Developer mode** → **Load unpacked** →
   select the `chrome-extension/` folder.
2. Run each check:
   - Visit a site with a declared feed (e.g. `theverge.com`) → feeds appear in
     the popup; badge shows a count.
   - Visit a site with no `<link>` feed → click **Check common paths** → it
     finds the feed (this exercises the `activeTab` cross-origin HEAD probe —
     the part most sensitive to the permission change).
   - Visit a YouTube video or channel → the channel RSS feed appears.
   - Open Settings, toggle a checkbox, reopen the popup → the setting persisted.
3. If the **Check common paths** probe fails with a permission error, re-add a
   narrower `host_permissions` (or `<all_urls>` with the written justification)
   to `manifest.json`, rebuild, and re-test.

## 2. Build the upload package

```bash
./build.sh
```

Produces `dist/feedbat-1.0.0.zip` with `manifest.json` at the archive root and
dev-only files excluded. The script prints `unzip -l` so you can confirm the
layout before uploading.

---

## 3. Generate the listing images

1. Open `store-assets/screenshot-studio.html` in **Chrome** (File → Open).
2. For each panel, click **Download PNG**:
   - `marketing-screenshot-1.png` (1280×800) — **required, at least this one**
   - `marketing-screenshot-2.png`, `marketing-screenshot-3.png` (optional)
   - `promo-small-440x280.png` (recommended)
   - `promo-marquee-1400x560.png` (optional)
3. If a download looks off in your browser, use the fallback: DevTools →
   right-click the framed element → **Capture node screenshot**, or your OS
   screenshot tool on the framed area.

---

## 4. Create the item in the Developer Dashboard

Go to **https://chrome.google.com/webstore/devconsole** → **Add new item**.

### a. Package
- Upload `dist/feedbat-1.0.0.zip`.

### b. Store listing tab
Fill from `store-assets/STORE_LISTING.md`:
- **Product name:** FeedBat
- **Summary:** the ≤132-char line
- **Description:** the detailed description block
- **Category:** Productivity
- **Language:** English (United States)
- **Icon:** auto-pulled from the package (128×128) — confirm it shows
- **Screenshots:** upload the 1280×800 PNG(s)
- **Promo tiles:** upload small (440×280) and marquee (1400×560) if you made them

### c. Privacy practices tab
- **Single purpose:** paste the single-purpose statement
- **Permission justifications:** paste the `activeTab`, `storage`, and host /
  content-script justifications
- **Remote code:** select **No, I am not using remote code**
- **Data usage:** set all 9 categories to **NOT collected**, then check **all
  three** certification boxes (see the table in `STORE_LISTING.md`)
- **Privacy policy URL:** `https://schmug.github.io/FeedBat/privacy.html`

### d. Distribution
- **Visibility:** Public (or Unlisted if you want to test first)
- **Regions:** All regions (default)
- Pricing: Free

---

## 5. Submit for review

Click **Submit for review**. First reviews typically take a few hours to a few
business days. You'll get an email on approval or with rejection reasons.

---

## 6. If it gets rejected — likely causes & fixes

| Rejection reason | Fix |
|---|---|
| Privacy policy URL unreachable | Re-run the `curl` check; confirm Pages source is `master` `/docs`. |
| "Broad host permissions not justified" | We already minimized to `activeTab`; ensure the justification text was pasted verbatim. |
| Missing/incorrect data disclosures | Re-check all 9 categories = NOT collected + 3 certifications ticked. |
| Screenshot wrong size | Must be exactly 1280×800 or 640×400. Re-export from the studio. |
| Single purpose unclear | Use the one-sentence statement exactly as written. |

---

## Known limitations (not blockers, good to know)

- `activeTab` is granted when the popup opens. If the user navigates the tab
  while the popup is still open, the **Check common paths** probe will fail with
  a "Reopen FeedBat and try again" message — by design, not a bug.
- Feed detection reads the live DOM, so on heavy single-page apps a feed that
  loads after detection runs may require reopening the popup (YouTube is handled
  specially via SPA navigation events).

---

## Post-approval

- Tag the release: `git tag v1.0.0 && git push --tags`.
- Future updates: bump `"version"` in `chrome-extension/manifest.json`, re-run
  `./build.sh`, upload the new zip, submit again.
