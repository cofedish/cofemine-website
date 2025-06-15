const portal = document.getElementById('portal-img');
const flash = document.getElementById('flash-overlay');
const video = document.getElementById('final-video');
const wrapper = document.getElementById('portal-wrapper');

portal.addEventListener('click', () => {
  portal.classList.add('flyin');
  setTimeout(() => {
    flash.style.opacity = 1;
    setTimeout(() => {
      wrapper.style.opacity = 0;
      flash.style.opacity = 0;
      video.classList.add('show');
      video.play();
      document.body.style.overflow = "auto";
    }, 650); // длительность вспышки
  }, 900); // длительность flyin
});
