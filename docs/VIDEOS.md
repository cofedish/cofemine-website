# Adding Videos and Media

This guide explains how to add new videos and media to developer profiles.

## Quick Start

1. Add video file to `public/videos/memes/<developer>/`
2. (Optional) Add metadata file next to video
3. Commit and push to `main`
4. CI/CD will rebuild and deploy automatically

## Directory Structure

```
public/
├── videos/
│   ├── memes/
│   │   ├── cofedish/
│   │   │   ├── my_cool_meme.mp4
│   │   │   ├── my_cool_meme.meta.json  # Optional metadata
│   │   │   └── another_video.mp4
│   │   └── bekkel/
│   │       └── ...
│   └── posters/                        # Auto-generated
│       ├── cofedish/
│       └── bekkel/
├── assets/
│   ├── cofedish/
│   │   ├── posts/                      # Photos
│   │   │   ├── 1.jpg
│   │   │   └── 2.jpg
│   └── bekkel/
│       └── posts/
└── data/
    └── media.json                      # Auto-generated manifest
```

## Adding a New Video

### Basic (Just drop the file)

Simply add your video file to the appropriate folder:

```bash
cp my_meme.mp4 public/videos/memes/cofedish/
git add public/videos/memes/cofedish/my_meme.mp4
git commit -m "feat(media): add my_meme video"
git push
```

The title will be auto-generated from the filename.

### With Metadata

Create a `.meta.json` file next to your video:

```bash
# Video: public/videos/memes/cofedish/epic_fail.mp4
# Metadata: public/videos/memes/cofedish/epic_fail.meta.json
```

**epic_fail.meta.json:**
```json
{
  "title": "Epic Fail Compilation #1",
  "tags": ["meme", "fail", "funny"],
  "date": "2026-01-13",
  "featured": true
}
```

### Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Display title (auto-generated from filename if not set) |
| `tags` | array | Tags for filtering (e.g., `["meme", "ctf", "devlife"]`) |
| `date` | string | ISO date or YYYY-MM-DD (defaults to file modification time) |
| `featured` | boolean | Show in "Featured" section on profile |

## Supported Formats

### Video
- `.mp4` (recommended)
- `.webm`
- `.mov`
- `.ogg`

### Images (for photos)
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

## Generating Posters

Posters (thumbnail images) can be auto-generated from videos using ffmpeg.

### Locally (requires ffmpeg installed)

```bash
npm run generate-posters
```

This will:
1. Scan all videos in `public/videos/memes/`
2. Extract frame at 1 second
3. Save as JPEG in `public/videos/posters/<dev>/<video>.jpg`

### In CI/CD

By default, CI only runs `generate-media` (manifest generation).
To enable poster generation in CI, modify `.github/workflows/deploy.yml`:

```yaml
- name: Generate media manifest with posters
  run: npm run generate-posters
```

Note: This requires ffmpeg in the CI environment.

## Adding a New Developer

1. Add developer config in `scripts/generate-media.js`:

```javascript
const DEVELOPERS = {
  // ...existing developers...

  newdev: {
    name: 'New Developer',
    role: 'Full Stack Dev',
    bio: 'Short bio here',
    avatar: '/assets/avatars/avatar-newdev.png',
    links: {
      github: 'https://github.com/newdev',
      telegram: 'https://t.me/newdev'
    },
    subs: ['Channel1', 'Channel2'],
    friends: [{ username: 'cofedish', avatar: '/assets/avatars/avatar-cofedish.png' }],
    theme: 'purple'
  }
};
```

2. Create directories:

```bash
mkdir -p public/videos/memes/newdev
mkdir -p public/assets/newdev/posts
```

3. Add avatar:

```bash
cp avatar.png public/assets/avatars/avatar-newdev.png
```

4. Add videos and photos as usual.

## Best Practices

### Video Optimization

For better performance, compress videos before upload:

```bash
# Compress to 720p with reasonable quality
ffmpeg -i input.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4

# Convert to WebM for better compression
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus -b:a 96k output.webm
```

Recommended settings:
- Resolution: 720p or 1080p max
- Bitrate: 2-5 Mbps
- Format: MP4 (H.264) or WebM (VP9)
- Size: < 50MB per video

### Naming Convention

Use descriptive filenames:
- `epic_minecraft_moment.mp4`
- `debug_at_3am.mp4`

Avoid:
- `IMG_1234.MP4` (not descriptive)
- `video (1).mp4` (spaces and parentheses)
- Very long filenames

### Tags

Common tags:
- `meme` - Funny content
- `clip` - Short clip
- `ctf` - CTF/security related
- `devlife` - Developer life moments
- `minecraft` - Minecraft content
- `fail` - Fail compilations

## Regenerating Manifest Locally

After adding videos, regenerate the manifest:

```bash
npm run generate-media
```

Check output:
```bash
cat public/data/media.json | head -50
```

## Troubleshooting

### Video not appearing?

1. Check file is in correct directory
2. Check file extension is supported
3. Run `npm run generate-media` locally
4. Check `public/data/media.json` includes the video

### Wrong title?

Add a `.meta.json` file with the correct title.

### Poster not generated?

- Ensure ffmpeg is installed: `ffmpeg -version`
- Run with poster flag: `npm run generate-posters`
- Check console for errors

### Large file size warning?

Compress the video (see optimization section above).
