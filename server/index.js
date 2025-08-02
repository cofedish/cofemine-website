// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { status } = require('minecraft-server-util');

const app = express();
const PORT = process.env.PORT || 25577;


const MINECRAFT_HOST = 'cofemine.online';
const MINECRAFT_PORT = 25565;

app.use(cors());
app.use(express.json());

// === Данные профилей ===
const PROFILES = {
  cofedish: {
    name: 'Cofedish',
    avatar: 'avatar-cofedish.png',
    subs: ['HuyOps', 'CICI/DIDI', 'Bekkel', 'Idi Nahuy', 'Karpacho'],
    friends: [
      { username: 'bekkel', avatar: 'avatar-bekkel.png' }
    ]
  },
  bekkel: {
    name: 'Bekkel',
    avatar: 'avatar-bekkel.png',
    subs: ['YaEblan', 'Провоцирую', 'KaktusEnjoyers', '#АлисаСтой', 'Helicopter', 'Baracopter'],
    friends: [
      { username: 'cofedish', avatar: 'avatar-cofedish.png' }
    ]
  }
};

// === Helpers: читаем файлы из public ===
function getAllPhotos(username) {
  const dir = path.join(__dirname, '../client/public/assets', username, 'posts');
  try {
    return fs.readdirSync(dir).filter(f => /\.(png|jpe?g)$/i.test(f));
  } catch {
    return [];
  }
}

function getAllVideos(username) {
  const dir = path.join(__dirname, '../client/public/videos/memes', username);
  try {
    return fs.readdirSync(dir).filter(f => /\.(mp4|webm|ogg)$/i.test(f));
  } catch {
    return [];
  }
}

app.get('/api/status', async (req, res) => {
  try {
    // Передаём host, порт и опции
    const result = await status(MINECRAFT_HOST, MINECRAFT_PORT, {
      enableSRV: true,  // учитываем SRV-записи
      timeout: 5000     // таймаут в миллисекундах
    });

    return res.json({
      online: true,
      players: result.players.online,
      max:    result.players.max,
      version: result.version.name,
    });
  } catch (error) {
    console.error('Ошибка при проверке статуса Minecraft:', error);
    return res.json({
      online: false,
      error:  error.message || String(error),
    });
  }
});


// === API: профиль с фото, видео и постами ===
app.get('/api/profiles/:username', (req, res) => {
  const u = req.params.username;
  const base = PROFILES[u];
  if (!base) return res.status(404).json({ error: 'Profile not found' });

  // все фото
  const photos = getAllPhotos(u);
  // два случайных фото
  const shuffled = photos.sort(() => Math.random() - 0.5);
  const randPhotos = shuffled.slice(0, 2);
  // все видео
  const vids = getAllVideos(u);

  // собираем ленту: сначала видео, потом картинки
  const posts = [
    ...vids.map(v => ({ type: 'video', src: `/videos/memes/${u}/${v}` })),
    ...randPhotos.map(p => ({ type: 'image', src: `/assets/${u}/posts/${p}` }))
  ];

  res.json({
    name: base.name,
    avatar: `/assets/avatars/${base.avatar}`,
    friends: base.friends,
    subs: base.subs,
    photos,        // все 6 фото-имён
    randPhotos,    // 2 случайных имя файла
    videoPosts: vids.map(v => `/videos/memes/${u}/${v}`),
    posts          // готовый массив для ленты
  });
});

// === Статика React ===
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).end();
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
