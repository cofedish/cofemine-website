#!/bin/bash
# Quick script to add new media and deploy
# Usage: ./scripts/add-media.sh [commit message]

set -e

MESSAGE="${1:-feat(media): add new content}"
NODE_BIN="node"

if "$NODE_BIN" -p "process.platform" 2>/dev/null | grep -qi "win32"; then
  if [ -x /usr/bin/node ]; then
    NODE_BIN="/usr/bin/node"
  else
    echo "Warning: Windows node detected in WSL. Install node in WSL to enable ffmpeg posters."
  fi
fi

echo "=== Add Media & Deploy ==="
echo ""

# 1. Generate manifest (+ posters if ffmpeg is available for the same node env)
if "$NODE_BIN" -e "require('child_process').execSync('ffmpeg -version', {stdio:'ignore'})" >/dev/null 2>&1; then
  echo "1. Generating media manifest and posters..."
  "$NODE_BIN" scripts/generate-media.js --generate-posters
else
  echo "1. Generating media manifest (ffmpeg not found for $NODE_BIN, posters skipped)..."
  "$NODE_BIN" scripts/generate-media.js
fi

# 2. Commit and push
echo ""
echo "2. Committing and pushing..."
git add -A
git commit -m "$MESSAGE" || echo "Nothing to commit"
git push

# 3. Sync media to server
echo ""
echo "3. Syncing media to server..."
./scripts/sync-media.sh

echo ""
echo "=== Done! ==="
echo "Code deployed via CI/CD, media synced directly."
