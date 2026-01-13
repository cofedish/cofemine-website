import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [serverStatus, setServerStatus] = useState({ online: false, players: 0, max: 0 });
  const [stickyMenuVisible, setStickyMenuVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
      audioRef.current.muted = false;
    }

    const welcomeTimer = setTimeout(() => setWelcomeVisible(true), 100);

    const handleScroll = () => {
      const button = document.querySelector('.welcome-content .button');
      if (button) {
        const { bottom } = button.getBoundingClientRect();
        setStickyMenuVisible(window.scrollY > bottom + window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll);

    const fetchServerStatus = async () => {
      try {
        const res = await fetch(`https://api.mcsrvstat.us/2/server.cofemine.ru`);
        const data = await res.json();
        if (data.online) {
          setServerStatus({
            online: true,
            players: data.players.online,
            max: data.players.max,
            version: data.version
          });
        } else {
          setServerStatus({ online: false });
        }
      } catch {
        setServerStatus({ online: false });
      }
    };
    fetchServerStatus();
    const statusInterval = setInterval(fetchServerStatus, 5000);

    const hour = new Date().getHours();
    let videoSrc;
    if (hour < 6) videoSrc = '/videos/compressed/night_compressed.webm';
    else if (hour < 9) videoSrc = '/videos/compressed/morning_compressed.webm';
    else if (hour < 12) videoSrc = '/videos/compressed/late_morning_compressed.webm';
    else if (hour < 17) videoSrc = '/videos/compressed/day_compressed.webm';
    else if (hour < 21) videoSrc = '/videos/compressed/evening_compressed.webm';
    else videoSrc = '/videos/compressed/late_night_compressed.webm';

    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) {
      bgVideo.src = videoSrc;
      bgVideo.load();
    }

    return () => {
      clearTimeout(welcomeTimer);
      clearInterval(statusInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="home">
      {/* Фоновая музыка */}
      <audio
        id="background-music"
        ref={audioRef}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => {
          if (audioRef.current) audioRef.current.volume = 0.1;
        }}
      >
        <source src="/audio/background-music.mp3" type="audio/mpeg" />
        Ваш браузер не поддерживает аудио.
      </audio>

      {/* Фиксированное меню */}
      <div className={`sticky-menu ${stickyMenuVisible ? 'visible' : 'hidden'}`}>
        <h1><Link to="/">CofeMine</Link></h1>
        <div className="buttons-container">
          <a href="https://disk.yandex.ru/d/hodbEP83a9fu_g" className="button">Скачать сборку</a>
          <a href="https://github.com/cofedish/cofemine_launcher/releases" className="button">Скачать лаунчер</a>
        </div>
      </div>

      {/* Экран приветствия */}
      <section id="welcome" className="welcome-screen">
        <video
          id="bg-video"
          className="welcome-screen__video"
          poster="/img/poster.png"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className={`welcome-content ${welcomeVisible ? 'visible' : ''}`}>
          <h1>CofeMine</h1>
          <p>Добро пожаловать в конченый мир Minecraft!</p>
          <a href="https://disk.yandex.ru/d/hodbEP83a9fu_g" className="button">Скачать сборку</a>
          <a href="https://github.com/cofedish/cofemine_launcher/releases" className="button">Скачать лаунчер</a>
        </div>
      </section>

      {/* Раздел "Почему мы?" */}
      <section className="why-us">
        <h2>Почему мы?</h2>
        <div className="why-us-container">
          <div className="why-us-card">
            <div className="card-image">
              <img src="/img/server-icon.png" alt="Более 0 серверов" />
            </div>
            <div className="card-text">
              <h3>Более 0 серверов</h3>
              <p>Играй на любом сервере и находи новых друзей!</p>
            </div>
          </div>
          <div className="why-us-card">
            <div className="card-image">
              <img src="/img/nodonate-icon.png" alt="Нет донат вещей" />
            </div>
            <div className="card-text">
              <h3>Нет донат вещей</h3>
              <p>У нас нет доната — честно и свободно для всех.</p>
            </div>
          </div>
          <div className="why-us-card">
            <div className="card-image">
              <img src="/img/mods-icon.png" alt="Много модов" />
            </div>
            <div className="card-text">
              <h3>Много модов</h3>
              <p>Широкий выбор модификаций для любого вкуса.</p>
            </div>
          </div>
          <div className="why-us-card">
            <div className="card-video">
              <video autoPlay loop muted>
                <source src="/videos/sneaky_compressed.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="card-text">
              <h3>Секретные механики</h3>
              <p>Уникальные фичи и неожиданные возможности.</p>
            </div>
          </div>
          <div className="why-us-card">
            <div className="card-image">
              <img src="/img/economy-icon.png" alt="Развитая экономика" />
            </div>
            <div className="card-text">
              <h3>Развитая экономика</h3>
              <p>Баланс и честная система торговли.</p>
            </div>
          </div>
          <div className="why-us-card">
            <div className="card-image">
              <img src="/img/bekkel.png" alt="Новые возможности" />
            </div>
            <div className="card-text">
              <h3>Новые возможности</h3>
              <p>Постоянные обновления и расширение функционала.</p>
            </div>
          </div>
          <div className="why-us-card">
            <div className="card-video">
              <video autoPlay loop muted>
                <source src="/videos/beholder.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="card-text">
              <h3>Полный контроль</h3>
              <p>Безопасность и стабильность превыше всего.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Блок "Наш сервер" */}
      <section className="server-details">
        <h2>Наш сервер</h2>
        <div className="server-card">
          <div className="server-info">
            <h3>CofeMine</h3>
            <p><strong>IP:</strong> cofemine.online</p>
            <div className="server-status">
              <span className={`status-indicator ${serverStatus.online ? 'online' : 'offline'}`}></span>
              <p className="status-text">
                {serverStatus.online
                  ? `Сервер онлайн (${serverStatus.players}/${serverStatus.max})`
                  : 'Сервер оффлайн'}
              </p>
            </div>
            <a href="https://disk.yandex.ru/d/SMmbn7lTqUOT_A" className="button download-button">Скачать сборку</a>
          </div>
          <div className="server-image">
            <img src="/img/cofemine-server.jpg" alt="CofeMine Server" />
          </div>
        </div>
      </section>

      {/* Блок "Наша команда" */}
      <section className="team">
        <h2>Наша команда</h2>
        <div className="team-container">
          <Link to="/team/cofedish" className="team-member-link">
            <div className="team-member">
              <img src="/assets/avatars/avatar-cofedish.png" alt="COFEDISH" />
              <h3>COFEDISH</h3>
              <p>DevOps курильщика, Сын докер контейнера</p>
            </div>
          </Link>
          <Link to="/team/bekkel" className="team-member-link">
            <div className="team-member">
              <img src="/assets/avatars/avatar-bekkel.png" alt="Беккель" />
              <h3>Беккель</h3>
              <p>Отец неведомой летающей хуйни</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Подвал */}
      <footer>
        <p>© 2026 CofeMine. Все права защищены Беккелем. <Link to="/contacts">Контакты</Link></p>
      </footer>
    </div>
  );
};

export default Home;
