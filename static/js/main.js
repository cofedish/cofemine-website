document.addEventListener('DOMContentLoaded', () => {
  // 1) Текст подскакивает в зависимости от фона
  function updateTextColor() {
    const content = document.querySelector('.welcome-content');
    const bgColor = window.getComputedStyle(document.body).backgroundColor;
    if (!content) return;

    const rgb = bgColor.match(/\d+/g).map(Number);
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    content.style.color = brightness > 128 ? 'black' : 'white';
  }
  updateTextColor();

  // 2) «Липкое» меню появляется при прокрутке ниже кнопки
  const stickyMenu    = document.querySelector('.sticky-menu');
  const launcherButton = document.querySelector('.welcome-content .button');
  if (stickyMenu && launcherButton) {
    window.addEventListener('scroll', () => {
      const scrollY       = window.scrollY;
      const buttonBottom  = launcherButton.getBoundingClientRect().bottom + scrollY;
      if (scrollY > buttonBottom) {
        stickyMenu.classList.add('visible');
        stickyMenu.classList.remove('hidden');
      } else {
        stickyMenu.classList.add('hidden');
        stickyMenu.classList.remove('visible');
      }
    });
  }

  // 3) Подменяем источник фонового видео в зависимости от времени
  const hour = new Date().getHours();
  let src = '';
  if (hour < 6) {
    src = 'static/videos/night.webm';
  } else if (hour < 9) {
    src = 'static/videos/morning.webm';
  } else if (hour < 12) {
    src = 'static/videos/late_morning.webm';
  } else if (hour < 17) {
    src = 'static/videos/day.webm';
  } else if (hour < 21) {
    src = 'static/videos/evening.webm';
  } else {
    src = 'static/videos/late_night.webm';  // ← тут была опечатка
  }
  const video = document.getElementById('bg-video');
  if (video) {
    video.src = src;
    video.load();
  }

    // 4) Проверяем статус сервера (периодически)
   async function updateServerStatus() {
     try {
       const res       = await fetch('/api/status');
       const data      = await res.json();
       const indicator = document.querySelector('.status-indicator');
       const textEl    = document.querySelector('.status-text');
       if (indicator && textEl) {
         if (data.online) {
           indicator.style.background = 'green';
           textEl.textContent = `Сервер онлайн (${data.players}/${data.max})`;
         } else {
           indicator.style.background = 'red';
           textEl.textContent = 'Сервер оффлайн';
         }
       }
     } catch (e) {
       console.error('Не удалось получить статус сервера:', e);
     }
   }

    // Сразу при загрузке
    updateServerStatus();

    // И каждые 30 секунд
    setInterval(updateServerStatus, 5000);


  // 5) Фоновая музыка
  const music = document.getElementById('background-music');
  if (music) {
    music.volume = 0.1;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('.welcome-content');
  if (content) {
    requestAnimationFrame(() => {
      content.classList.add('visible');
    });
  }
});

