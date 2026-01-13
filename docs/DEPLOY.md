# Deployment Guide - cofemine.ru

## Overview

Deployment is fully automated via GitHub Actions. On every push to `main`, the pipeline:

**Important:** Media files (videos, audio, assets) are NOT stored in Git due to size limits. They are synced separately to the server's `shared/` directory and symlinked into each release.
1. Builds the React application
2. Generates video manifest
3. Deploys to server via SSH/rsync
4. Performs atomic symlink switch
5. Runs healthcheck
6. Cleans up old releases (keeps last 3)

## First-Time Server Setup

### 1. Create Deploy User

```bash
# On your server (as root)
sudo useradd -m -s /bin/bash deploy
sudo mkdir -p /srv/html/cofemine/{releases,shared}
sudo chown -R deploy:deploy /srv/html/cofemine
```

### 2. Setup SSH Key Authentication

```bash
# On your LOCAL machine - generate a new key pair
ssh-keygen -t ed25519 -C "github-deploy-cofemine" -f ~/.ssh/cofemine_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/cofemine_deploy.pub deploy@YOUR_SERVER_IP

# Test connection
ssh -i ~/.ssh/cofemine_deploy deploy@YOUR_SERVER_IP "echo 'SSH works!'"
```

### 3. (Recommended) Restrict Deploy User

```bash
# On server, edit /etc/sudoers.d/deploy or use visudo
# Only allow specific commands if needed
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload caddy
```

### 4. Get Known Hosts

```bash
# Run this and save output for DEPLOY_KNOWN_HOSTS secret
ssh-keyscan -p YOUR_SSH_PORT YOUR_SERVER_IP
```

## GitHub Secrets Configuration

Go to your repository: **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**

Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DEPLOY_HOST` | Server IP or hostname | `123.45.67.89` or `cofemine.ru` |
| `DEPLOY_PORT` | SSH port (optional, default: 22) | `22` |
| `DEPLOY_USER` | SSH username | `deploy` |
| `DEPLOY_SSH_KEY` | Private SSH key (entire content) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PATH` | Deployment path (optional) | `/srv/html/cofemine` |
| `DEPLOY_KNOWN_HOSTS` | SSH known_hosts entry (optional) | Output from `ssh-keyscan` |

### How to Add SSH Key Secret

1. Copy entire private key content:
```bash
cat ~/.ssh/cofemine_deploy
```

2. Paste into GitHub secret `DEPLOY_SSH_KEY` (including `-----BEGIN...` and `-----END...` lines)

## Caddy Configuration Update

Update your Caddyfile to point to the `current` symlink:

```caddyfile
cofemine.ru {
    import cofe-common
    root * /srv/html/cofemine/current
    try_files {path} /index.html
    file_server
    tls cofedish@gmail.com

    # Recommended: Cache static assets
    @static {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.webp *.svg *.woff *.woff2 *.mp4 *.webm
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    # Don't cache HTML for SPA
    @html {
        path *.html /
    }
    header @html Cache-Control "no-cache, no-store, must-revalidate"
}
```

After editing, reload Caddy:
```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
# or if using docker-compose:
docker-compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## Directory Structure After Deploy

```
/srv/html/cofemine/
├── current -> releases/20260113_143052_abc1234/  # Symlink to active release
│   ├── index.html, static/, ...                  # Built React app
│   ├── videos -> ../shared/videos                # Symlink to shared media
│   ├── audio -> ../shared/audio
│   └── assets -> ../shared/assets
├── releases/
│   ├── 20260113_143052_abc1234/
│   ├── 20260112_091522_def5678/
│   └── 20260111_170033_ghi9012/
└── shared/                        # Persistent media files
    ├── videos/memes/cofedish/...
    ├── videos/memes/bekkel/...
    ├── audio/
    └── assets/
```

## Syncing Media Files

Media files (videos, audio, assets) are too large for Git. They must be synced separately.

### First time setup

```bash
# From your local machine, sync all media to server
./scripts/sync-media.sh

# Or manually with rsync:
rsync -avz --progress \
  public/videos/ public/audio/ public/assets/ \
  deploy@YOUR_SERVER:/srv/html/cofemine/shared/
```

### Adding new media

```bash
# 1. Add files locally to public/videos/memes/<dev>/
# 2. Sync to server
./scripts/sync-media.sh

# Or sync just one directory:
rsync -avz public/videos/memes/cofedish/ \
  deploy@YOUR_SERVER:/srv/html/cofemine/shared/videos/memes/cofedish/
```

### Environment variables for sync script

```bash
export DEPLOY_HOST="your-server-ip"
export DEPLOY_PORT="22"
export DEPLOY_USER="deploy"
./scripts/sync-media.sh
```

## Manual Operations

### Trigger Deploy Manually

1. Go to Actions tab in GitHub
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Optionally check "Skip build step" to redeploy existing build

### Manual Rollback

```bash
# SSH to server
ssh deploy@YOUR_SERVER

# List available releases
ls -la /srv/html/cofemine/releases/

# Switch to previous release
cd /srv/html/cofemine
ln -sfn releases/RELEASE_NAME current_new
mv -Tf current_new current

# Verify
readlink current
```

### Check Current Release

```bash
ssh deploy@YOUR_SERVER "readlink /srv/html/cofemine/current"
```

## Troubleshooting

### Deploy Fails at SSH Step

- Check `DEPLOY_SSH_KEY` format (must include header/footer lines)
- Verify user exists on server
- Check SSH port is correct
- Test manually: `ssh -i key -p PORT USER@HOST`

### Healthcheck Fails

- Site may need more time to propagate
- Check Caddy logs: `docker logs caddy`
- Verify symlink: `ls -la /srv/html/cofemine/current`

### Permission Denied

```bash
# On server, fix permissions
sudo chown -R deploy:deploy /srv/html/cofemine
chmod 755 /srv/html/cofemine
```

## Adding New Videos

See [VIDEOS.md](./VIDEOS.md) for detailed instructions on adding new videos and media.

Quick summary:
1. Add video file to `public/videos/memes/<developer>/`
2. (Optional) Add metadata file `<video>.meta.json`
3. Commit and push to `main`
4. CI/CD will rebuild and deploy automatically

## Security Notes

- Never commit secrets to the repository
- Use deploy keys with minimal permissions
- Consider IP allowlisting on server firewall
- Regularly rotate SSH keys
- Deploy user should have minimal sudo access
