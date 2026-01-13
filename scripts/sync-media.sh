#!/bin/bash
# Sync media files directly to server (bypassing Git)
# Usage: ./scripts/sync-media.sh
#
# Works with both rsync (preferred) and scp (fallback)

set -e

# Configuration - set these or use environment variables
DEPLOY_HOST="${DEPLOY_HOST:-YOUR_SERVER_IP}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_PATH="${DEPLOY_PATH:-/srv/html/cofemine}"

# SSH key (optional - if not using default)
SSH_KEY="${SSH_KEY:-}"

# Build SSH options
SSH_OPTS="-p $DEPLOY_PORT"
if [ -n "$SSH_KEY" ]; then
    SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
fi

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

# Check if rsync is available
if command -v rsync &> /dev/null; then
    echo "Using rsync..."
    SYNC_CMD="rsync"
else
    echo "rsync not found, using scp (slower, no delta sync)..."
    SYNC_CMD="scp"
fi

# Sync each media directory
for dir in videos audio assets; do
    if [ -d "public/$dir" ]; then
        echo ""
        echo "Syncing $dir..."

        if [ "$SYNC_CMD" = "rsync" ]; then
            rsync -avz --progress \
                -e "ssh $SSH_OPTS" \
                "public/$dir/" \
                "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/shared/$dir/"
        else
            # scp fallback - recursive copy
            # First create target dir
            ssh $SSH_OPTS $DEPLOY_USER@$DEPLOY_HOST "mkdir -p $DEPLOY_PATH/shared/$dir"
            # Then copy
            scp -r $SSH_OPTS "public/$dir/"* "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/shared/$dir/"
        fi
    fi
done

echo ""
echo "=== Creating symlinks in current release ==="

# Create symlinks
ssh $SSH_OPTS $DEPLOY_USER@$DEPLOY_HOST << EOF
    cd $DEPLOY_PATH

    # Only create symlinks if current exists
    if [ -L current ] || [ -d current ]; then
        # Get the actual release directory name
        RELEASE_DIR=\$(readlink current)

        for dir in videos audio assets; do
            if [ -d shared/\$dir ]; then
                # Symlinks need ../../shared because they're in releases/<name>/
                rm -rf \$RELEASE_DIR/\$dir 2>/dev/null || true
                ln -sfn ../../shared/\$dir \$RELEASE_DIR/\$dir
                echo "Linked: \$RELEASE_DIR/\$dir -> ../../shared/\$dir"
            fi
        done
    else
        echo "Warning: current directory doesn't exist yet (run deploy first)"
    fi
EOF

echo ""
echo "=== Done! ==="
