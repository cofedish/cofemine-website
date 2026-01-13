import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Contacts.css';

export default function Contacts() {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="contacts-page">
      {/* Header */}
      <header className="sticky-menu visible">
        <div className="sticky-menu__logo">
          <Link to="/">
            {!logoError ? (
              <img
                src="/assets/logo.svg"
                alt="CofeMine"
                className="sticky-menu__logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="sticky-menu__logo-text">CofeMine</span>
            )}
          </Link>
        </div>
        <div className="buttons-container">
          <Link to="/" className="button">На главную</Link>
          <ThemeToggle className="theme-toggle--compact" />
        </div>
      </header>

      {/* Contacts Section */}
      <section className="contacts">
        <h2>Свяжитесь с нами</h2>
        <div className="contacts-container">
          <a
            href="https://vk.com/cofedish"
            className="contact-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/vk-icon.png" alt="VK" />
            <h3>ВКонтакте</h3>
            <p>Напишите нам в ВК</p>
          </a>
          <a
            href="https://t.me/COFEDISH"
            className="contact-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/telegram-icon.png" alt="Telegram" />
            <h3>Telegram</h3>
            <p>Напишите нам в телеграм</p>
          </a>
          <a
            href="https://discord.gg/vPuRkNMxmw"
            className="contact-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/discord-icon.png" alt="Discord" />
            <h3>Discord</h3>
            <p>Присоединяйтесь к нашему серверу</p>
          </a>
          <a
            href="https://github.com/cofedish"
            className="contact-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/github-icon.png" alt="GitHub" />
            <h3>GitHub</h3>
            <p>Посмотрите наш код</p>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>
          © 2026 CofeMine. Все права защищены Беккелем. <Link to="/">На главную</Link>
        </p>
      </footer>
    </div>
  );
}
