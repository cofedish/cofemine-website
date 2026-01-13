#!/bin/bash
# Sync media files directly to server (bypassing Git)
# Usage: ./scripts/sync-media.sh

set -e

# Configuration - set these or use environment variables
DEPLOY_HOST="${DEPLOY_HOST:-YOUR_SERVER_IP}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_PATH="${DEPLOY_PATH:-/srv/html/cofemine}"

SSH_OPTS="-p $DEPLOY_PORT"

echo "=== Media Sync Script ==="
echo "Target: $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/shared"
echo ""

# Check if directories exist
if [ ! -d "public/videos" ] && [ ! -d "public/audio" ] && [ ! -d "public/assets" ]; then
    echo "Error: No media directories found in public/"
    exit 1
fi

# Create shared directory on server
echo "Creating shared directory..."
ssh $SSH_OPTS $DEPLOY_USER@$DEPLOY_HOST "mkdir -p $DEPLOY_PATH/shared"

# Sync each media directory
for dir in videos audio assets; do
    if [ -d "public/$dir" ]; then
        echo ""
        echo "Syncing $dir..."
        rsync -avz --progress \
            -e "ssh $SSH_OPTS" \
            "public/$dir/" \
            "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/shared/$dir/"
    fi
done

echo ""
echo "=== Creating symlinks in current release ==="

# Create symlinks (this will be done automatically by deploy script too)
ssh $SSH_OPTS $DEPLOY_USER@$DEPLOY_HOST << EOF
    cd $DEPLOY_PATH

    # Only create symlinks if current exists
    if [ -L current ] || [ -d current ]; then
        for dir in videos audio assets; do
            if [ -d shared/\$dir ]; then
                # Remove existing dir/symlink in current
                rm -rf current/\$dir 2>/dev/null || true
                # Create symlink
                ln -sfn ../shared/\$dir current/\$dir
                echo "Linked: current/\$dir -> shared/\$dir"
            fi
        done
    else
        echo "Warning: current directory doesn't exist yet (run deploy first)"
    fi
EOF

echo ""
echo "=== Done! ==="
echo ""
echo "Media files are now on the server in: $DEPLOY_PATH/shared/"
echo "They are symlinked into the current release."
