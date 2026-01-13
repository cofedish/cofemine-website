#!/bin/bash
# Quick script to add new media and deploy
# Usage: ./scripts/add-media.sh [commit message]

set -e

MESSAGE="${1:-feat(media): add new content}"

echo "=== Add Media & Deploy ==="
echo ""

# 1. Generate manifest (+ posters if ffmpeg is available)
if command -v ffmpeg >/dev/null 2>&1; then
  echo "1. Generating media manifest and posters..."
  npm run generate-posters
else
  echo "1. Generating media manifest (ffmpeg not found, posters skipped)..."
  npm run generate-media
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
