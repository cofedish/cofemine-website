import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contacts.css';

export default function Contacts() {
  const [logoError, setLogoError] = useState(false);
  const logoSrc = '/assets/logo.png';

  return (
    <div>
      {/* Фиксированное меню */}
      <div className="sticky-menu visible">
        <h1>
          <Link to="/">
            {!logoError ? (
              <img
                src={logoSrc}
                alt="CofeMine"
                className="logo"
                onError={() => setLogoError(true)}
              />
            ) : (
              'CofeMine'
            )}
          </Link>
        </h1>
      </div>

      {/* Страница контактов */}
      <section className="contacts">
        <h2>📬 Свяжитесь с нами</h2>
        <div className="contacts-container">
          <a
            href="https://vk.com/cofedish"
            className="contact-card vk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/vk-icon.png" alt="VK" />
            <h3>ВКонтакте</h3>
            <p>Напишите нам в ВК</p>
          </a>
          <a
            href="https://t.me/COFEDISH"
            className="contact-card tg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/telegram-icon.png" alt="Telegram" />
            <h3>Telegram</h3>
            <p>Напишите нам в телеграм</p>
          </a>
          <a
            href="https://discord.gg/vPuRkNMxmw"
            className="contact-card dc"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/discord-icon.png" alt="Discord" />
            <h3>Discord</h3>
            <p>Присоединяйтесь к нашему серверу</p>
          </a>
          <a
            href="https://github.com/cofedish"
            className="contact-card gh"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/github-icon.png" alt="GitHub" />
            <h3>GitHub</h3>
            <p>Посмотрите наш код</p>
          </a>
        </div>
      </section>

      {/* Подвал */}
      <footer>
        <p>
          © 2025 CofeMine. Все права защищены Беккелем. <Link to="/">На главную</Link>
        </p>
      </footer>
    </div>
  );
}