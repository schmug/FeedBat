#!/usr/bin/env bash
#
# build.sh — Package FeedBat for Chrome Web Store submission.
#
# Produces dist/feedbat-<version>.zip with manifest.json at the ZIP root
# (the Web Store rejects archives where the manifest is nested in a folder).
# Development-only files (icon generators, the extension README) are excluded
# from the package but kept in the repo.
#
# Usage: ./build.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$ROOT/chrome-extension"
DIST="$ROOT/dist"

VERSION="$(node -p "require('$SRC/manifest.json').version" 2>/dev/null \
  || grep -m1 '"version"' "$SRC/manifest.json" | sed -E 's/.*"version"[^"]*"([^"]+)".*/\1/')"

OUT="$DIST/feedbat-${VERSION}.zip"

echo "FeedBat v${VERSION} → $OUT"

mkdir -p "$DIST"
rm -f "$OUT"

# Zip from inside chrome-extension/ so manifest.json lands at the archive root.
( cd "$SRC" && zip -r -X "$OUT" . \
    -x "icons/generate-icons.html" \
       "icons/generate-icons.js" \
       "README.md" \
       ".DS_Store" \
       "*/.DS_Store" )

echo
echo "Package contents:"
unzip -l "$OUT"

echo
echo "✓ Built $OUT"
echo "  Upload this file at https://chrome.google.com/webstore/devconsole"
