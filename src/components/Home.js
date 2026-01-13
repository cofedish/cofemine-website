import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

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
      {/* Background music */}
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
      </audio>

      {/* Sticky Header */}
      <header className={`sticky-menu ${stickyMenuVisible ? 'visible' : 'hidden'}`}>
        <div className="sticky-menu__logo">
          <Link to="/">
            <img
              src="/assets/logo.svg"
              alt="CofeMine"
              className="sticky-menu__logo-img"
              onError={(e) => {
                // Fallback to text if logo doesn't load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="sticky-menu__logo-text" style={{ display: 'none' }}>CofeMine</span>
          </Link>
        </div>
        <div className="buttons-container">
          <a href="https://disk.yandex.ru/d/hodbEP83a9fu_g" className="button">Скачать сборку</a>
          <a href="https://github.com/cofedish/cofemine_launcher/releases" className="button">Скачать лаунчер</a>
          <ThemeToggle className="theme-toggle--compact" />
        </div>
      </header>

      {/* Welcome Screen */}
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
          {/* Logo image */}
          <img
            src="/assets/logo.svg"
            alt="CofeMine"
            className="welcome-content__logo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1>CofeMine</h1>
          <p>Добро пожаловать в конченый мир Minecraft!</p>
          <div className="welcome-content__buttons">
            <a href="https://disk.yandex.ru/d/hodbEP83a9fu_g" className="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Скачать сборку
            </a>
            <a href="https://github.com/cofedish/cofemine_launcher/releases" className="button button--secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.12 6 2.12v4.78z"/>
              </svg>
              Скачать лаунчер
            </a>
          </div>
          {/* Theme toggle for welcome screen */}
          <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
            <ThemeToggle />
          </div>
        </div>
      </section>

      {/* Why Us Section */}
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
              <video autoPlay loop muted playsInline>
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
              <video autoPlay loop muted playsInline>
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

      {/* Server Details */}
      <section className="server-details">
        <h2>Наш сервер</h2>
        <div className="server-card">
          <div className="server-info">
            <h3>CofeMine</h3>
            <p><strong>IP:</strong> server.cofemine.ru</p>
            <div className="server-status">
              <span className={`status-indicator ${serverStatus.online ? 'online' : 'offline'}`}></span>
              <p className="status-text">
                {serverStatus.online
                  ? `Сервер онлайн (${serverStatus.players}/${serverStatus.max})`
                  : 'Сервер оффлайн'}
              </p>
            </div>
            <a href="https://disk.yandex.ru/d/hodbEP83a9fu_g" className="button download-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Скачать сборку
            </a>
          </div>
          <div className="server-image">
            <img src="/img/cofemine-server.jpg" alt="CofeMine Server" />
          </div>
        </div>
      </section>

      {/* Team Section */}
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

      {/* Footer */}
      <footer>
        <p>© 2026 CofeMine. Все права защищены Беккелем. <Link to="/contacts">Контакты</Link></p>
      </footer>
    </div>
  );
};

export default Home;
