document.addEventListener('DOMContentLoaded', () => {
  const portal = document.getElementById('portal-wrapper');
  const hint   = document.getElementById('portal-hint');
  const flash  = document.getElementById('white-flash');
  const vc     = document.getElementById('video-congrats');

  const mainV  = document.getElementById('congrats-video');
  const leftV  = document.getElementById('side-left');
  const rightV = document.getElementById('side-right');
  const keyWr  = document.getElementById('cofemine-key');
  const music  = document.getElementById('bday-music');

  // старт по клику на портал
  portal.addEventListener('click', () => {
    if (vc.classList.contains('show')) return;

    portal.style.transform = 'translate(-50%,-50%) scale(8)';
    portal.style.filter    = 'blur(6px) brightness(1.5)';
    hint.style.opacity      = 0;

    setTimeout(()=>{
      flash.style.opacity = 1;
      setTimeout(()=> flash.style.opacity = 0, 400);
    }, 1000);

    setTimeout(()=>{
      portal.style.display = 'none';
      vc.classList.add('show');

      mainV.currentTime = 0;
      mainV.volume      = 0.1;
      mainV.loop = false;
      mainV.play();
      mainV.classList.add('visible');
    }, 1250);
  });

  // по окончании основного видео
  mainV.addEventListener('ended', ()=>{
    // сразу прячем его
    mainV.classList.remove('visible');

    // показываем рамку выше
    setTimeout(()=>{
      keyWr.classList.add('visible');
      music.currentTime = 0;
      music.play();
      music.volume      = 0.05;
    }, 400);

    // после того как рамка отрендерилась
    keyWr.addEventListener('transitionend', ()=>{
      // инициализируем боковые видео
      [leftV, rightV].forEach(v => {
        v.currentTime = 0;
        v.volume      = 0.1;
        v.play();
        v.classList.add('visible');
      });
    }, { once: true });
  });
});
