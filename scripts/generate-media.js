#!/usr/bin/env node
/**
 * Media Manifest Generator
 *
 * Scans video directories and generates a manifest.json with:
 * - Video metadata (title, tags, date)
 * - Developer profiles
 * - Poster paths (if generated)
 *
 * Usage:
 *   node scripts/generate-media.js
 *   node scripts/generate-media.js --generate-posters  # Requires ffmpeg
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const VIDEOS_DIR = path.join(PUBLIC_DIR, 'videos', 'memes');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
const POSTERS_DIR = path.join(PUBLIC_DIR, 'videos', 'posters');
const DATA_DIR = path.join(PUBLIC_DIR, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'media.json');

const GENERATE_POSTERS = process.argv.includes('--generate-posters');

// Developer profiles configuration
const DEVELOPERS = {
  cofedish: {
    name: 'Cofedish',
    role: 'DevOps Engineer',
    bio: 'DevOps, Сын докер контейнера. Мне завтра на работу какого хуя я делаю это в 4 утра.',
    avatar: '/assets/avatars/avatar-cofedish.png',
    links: {
      github: 'https://github.com/cofedish',
      telegram: 'https://t.me/cofedish'
    },
    subs: ['DevPrikOps', 'CICI/DIDI', 'Bekkel', 'Idi Nahuy', 'ывфыавфы'],
    friends: [{ username: 'bekkel', avatar: '/assets/avatars/avatar-bekkel.png' }],
    theme: 'green'
  },
  bekkel: {
    name: 'Bekkel',
    role: 'Chaos Engineer',
    bio: 'Отец неведомой летающей хуйни. Я конченый, бегите',
    avatar: '/assets/avatars/avatar-bekkel.png',
    links: {
      telegram: 'https://t.me/argis01'
    },
    subs: ['YaEblan', 'Блядей корёжит', 'ЯГном', '#АлисаСтой', 'Helicopter', 'Baracopter'],
    friends: [{ username: 'cofedish', avatar: '/assets/avatars/avatar-cofedish.png' }],
    theme: 'blue'
  }
};

// Video extensions
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|ogg)$/i;
const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp)$/i;

/**
 * Parse video filename to extract title
 */
function parseTitle(filename) {
  // Remove extension
  let title = filename.replace(/\.[^.]+$/, '');
  // Replace underscores with spaces
  title = title.replace(/_/g, ' ');
  // Truncate if too long
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  return title;
}

/**
 * Auto-detect tags from filename
 */
function detectTags(filename, devSlug) {
  const tags = [];
  const lower = filename.toLowerCase();

  // Meme indicators
  if (lower.includes('meme') || lower.includes('мем')) tags.push('meme');
  if (lower.includes('video_') || lower.includes('img_')) tags.push('clip');

  // Content type
  if (/\d{10,}/.test(filename)) tags.push('timestamp');

  // Always add developer tag
  tags.push(devSlug);

  return [...new Set(tags)]; // Dedupe
}

/**
 * Read metadata file if exists
 */
function readMetadata(videoPath) {
  const metaPath = videoPath.replace(/\.[^.]+$/, '.meta.json');
  if (fs.existsSync(metaPath)) {
    try {
      return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch (e) {
      console.warn(`  Warning: Invalid meta file ${metaPath}`);
    }
  }
  return null;
}

/**
 * Get file stats for sorting
 */
function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      mtime: stats.mtime.toISOString(),
      created: stats.birthtime?.toISOString() || stats.mtime.toISOString()
    };
  } catch {
    return { size: 0, mtime: new Date().toISOString() };
  }
}

/**
 * Generate poster image from video using ffmpeg
 */
function generatePoster(videoPath, posterPath) {
  if (!GENERATE_POSTERS) return false;

  try {
    // Check if ffmpeg is available
    execSync('ffmpeg -version', { stdio: 'ignore' });
  } catch {
    console.warn('  Warning: ffmpeg not found, skipping poster generation');
    return false;
  }

  if (fs.existsSync(posterPath)) {
    return true; // Already exists
  }

  try {
    fs.mkdirSync(path.dirname(posterPath), { recursive: true });

    // Extract frame at 1 second or first frame
    execSync(
      `ffmpeg -y -i "${videoPath}" -ss 00:00:01 -vframes 1 -q:v 5 -vf "scale=480:-1" "${posterPath}"`,
      { stdio: 'ignore', timeout: 30000 }
    );

    console.log(`  Generated poster: ${path.basename(posterPath)}`);
    return true;
  } catch (e) {
    console.warn(`  Warning: Failed to generate poster for ${path.basename(videoPath)}`);
    return false;
  }
}

/**
 * List files in directory with filter
 */
function listFiles(dir, filter) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => filter.test(file))
    .map(file => path.join(dir, file));
}

/**
 * Main function
 */
function main() {
  console.log('Generating media manifest...\n');

  const result = {
    generated: new Date().toISOString(),
    developers: {},
    allTags: new Set()
  };

  // Process each developer
  for (const [slug, profile] of Object.entries(DEVELOPERS)) {
    console.log(`Processing developer: ${slug}`);

    const videosPath = path.join(VIDEOS_DIR, slug);
    const photosPath = path.join(ASSETS_DIR, slug, 'posts');

    // Get videos
    const videoFiles = listFiles(videosPath, VIDEO_EXTENSIONS);
    const videos = [];

    for (const videoPath of videoFiles) {
      const filename = path.basename(videoPath);
      const meta = readMetadata(videoPath);
      const stats = getFileStats(videoPath);

      // Generate poster path
      const posterFilename = filename.replace(/\.[^.]+$/, '.jpg');
      const posterPath = path.join(POSTERS_DIR, slug, posterFilename);
      const posterUrl = `/videos/posters/${slug}/${posterFilename}`;

      // Prefer existing posters; generate when enabled
      const posterExists = fs.existsSync(posterPath);
      const hasPoster = posterExists || generatePoster(videoPath, posterPath);

      // Build video object
      const video = {
        id: `${slug}_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`,
        src: `/videos/memes/${slug}/${filename}`,
        filename,
        title: meta?.title || parseTitle(filename),
        tags: meta?.tags || detectTags(filename, slug),
        date: meta?.date || stats.mtime,
        size: stats.size,
        poster: hasPoster ? posterUrl : null,
        featured: meta?.featured || false
      };

      videos.push(video);
      video.tags.forEach(tag => result.allTags.add(tag));
    }

    // Sort videos: featured first, then by date
    videos.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured - a.featured;
      return new Date(b.date) - new Date(a.date);
    });

    // Get photos
    const photoFiles = listFiles(photosPath, IMAGE_EXTENSIONS);
    const photos = photoFiles.map(p => `/assets/${slug}/posts/${path.basename(p)}`);

    // Build developer profile
    result.developers[slug] = {
      ...profile,
      slug,
      videos,
      photos,
      videoCount: videos.length,
      photoCount: photos.length,
      featured: videos.filter(v => v.featured).slice(0, 6)
    };

    console.log(`  Found ${videos.length} videos, ${photos.length} photos\n`);
  }

  // Convert Set to Array
  result.allTags = [...result.allTags].sort();

  // Write output
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

  console.log(`\nManifest generated: ${OUTPUT_FILE}`);
  console.log(`Total developers: ${Object.keys(result.developers).length}`);
  console.log(`Total tags: ${result.allTags.length}`);

  // Generate legacy format for backward compatibility
  const legacyResult = {};
  for (const [slug, dev] of Object.entries(result.developers)) {
    legacyResult[slug] = {
      name: dev.name,
      avatar: dev.avatar,
      subs: dev.subs,
      friends: dev.friends,
      photos: dev.photos,
      videos: dev.videos.map(v => v.src) // Just paths for legacy
    };
  }

  // Keep backward compatibility
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log('\nDone!');
}

// Run
main();
