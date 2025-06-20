// profiles.js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-like').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = btn.querySelector('span');
      count.textContent = +count.textContent + 1;
      btn.classList.add('liked');
      setTimeout(() => btn.classList.remove('liked'), 300);
    });
  });
});
