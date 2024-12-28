function updateTextColor() {
    const content = document.querySelector('.welcome-content');
    const bgColor = window.getComputedStyle(document.body).backgroundColor;

    const rgb = bgColor.match(/\d+/g).map(Number);
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;

    const textColor = brightness > 128 ? 'black' : 'white';
    content.style.color = textColor;
}

document.addEventListener("DOMContentLoaded", () => {
    const stickyMenu = document.querySelector(".sticky-menu");
    const launcherButton = document.querySelector(".welcome-content .button");

    window.addEventListener("scroll", () => {
        const scrollPosition = window.scrollY;
        const buttonPosition = launcherButton.getBoundingClientRect().bottom + window.scrollY;

        if (scrollPosition > buttonPosition) {
            stickyMenu.classList.add("visible");
            stickyMenu.classList.remove("hidden");
        } else {
            stickyMenu.classList.add("hidden");
            stickyMenu.classList.remove("visible");
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const serverStatus = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');

    // Функция для проверки статуса сервера
    function checkServerStatus() {
        const timeout = setTimeout(() => {
            // Если сервер не отвечает в течение 10 секунд, считаем его оффлайн
            serverStatus.classList.remove('online');
            serverStatus.classList.add('offline');
            statusText.textContent = 'Оффлайн';
        }, 10000); // Таймаут на 10 секунд

        fetch('https://api.mcsrvstat.us/2/cofemine.ru')
            .then(response => response.json())
            .then(data => {
                clearTimeout(timeout); // Очищаем таймаут, если сервер ответил

                if (data.online) {
                    // Сервер онлайн
                    serverStatus.classList.remove('offline');
                    serverStatus.classList.add('online');
                    statusText.textContent = `Онлайн: ${data.players.online} из ${data.players.max}`;
                } else {
                    // Сервер оффлайн
                    serverStatus.classList.remove('online');
                    serverStatus.classList.add('offline');
                    statusText.textContent = 'Оффлайн';
                }
            })
            .catch(() => {
                // В случае ошибки API
                clearTimeout(timeout);
                serverStatus.classList.remove('online');
                serverStatus.classList.add('offline');
                statusText.textContent = 'Оффлайн';
            });
    }

    // Проверяем статус сервера каждые 30 секунд
    checkServerStatus();
    setInterval(checkServerStatus, 30000);
});

document.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('background-music');
    music.volume = 0.1; // Установить громкость на 50%
});






