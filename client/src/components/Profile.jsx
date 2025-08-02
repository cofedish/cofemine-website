// Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './Profile.css';

export default function Profile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const videoRefs = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener('resize', onResize);
    fetch(`/api/profiles/${username}`)
      .then(r => r.json())
      .then(setData);
    return () => window.removeEventListener('resize', onResize);
  }, [username]);

  if (!data) return <div>Загрузка...</div>;
  if (data.error) return <Navigate to="/" replace />;

  const { name, avatar, friends, subs, photos, posts } = data;

  const playPause = idx => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === idx) {
        v.volume = 0.1;
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  };

  return (
    <div className={`profile-container theme-${username}`}>
      <div className="container">
        {/* header */}
        <header className="profile-header">
          <img className="avatar" src={avatar} alt={`${name} Avatar`} />
          <h1 className="username">{name}</h1>
          <div className="actions">
            <Link className="btn" to="/">← Назад</Link>
          </div>
        </header>

        <section className="profile-content">
          <aside className="sidebar">
            {/* Фото */}
            <div className="card photos">
              <h2>Фото</h2>
              <div className="photos-grid">
                {photos.map((p, i) => (
                  <img
                    key={i}
                    src={`/assets/${username}/${p}`}
                    alt=""
                  />
                ))}
              </div>
            </div>
            {/* Друзья */}
            <div className="card friends">
              <h2>Друзья</h2>
              <div className="friends-grid">
                {friends.map((f, i) => (
                  <Link key={i} to={`/team/${f.username}`}>
                    <img
                      src={`/assets/avatars/${f.avatar}`}
                      alt={f.username}
                    />
                  </Link>
                ))}
              </div>
            </div>
            {/* Подписки */}
            <div className="card subs">
              <h2>Подписки</h2>
              <ul>
                {subs.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </aside>

          <main className="posts">
            <div className="posts-header card">
              <h2>Все посты</h2>
            </div>

            {/* Видео-мемы */}
            <div className="card">
              <Swiper
                modules={[Navigation, Keyboard]}
                navigation={!isMobile}
                keyboard={!isMobile}
                slidesPerView={1}
                onSwiper={s => setTimeout(() => playPause(s.activeIndex), 0)}
                onSlideChange={s => playPause(s.activeIndex)}
                className="mySwiper"
              >
                {posts.filter(p => p.type === 'video').map((p, i) => (
                  <SwiperSlide key={i}>
                    <div className="video-wrapper">
                      <video
                        ref={el => videoRefs.current[i] = el}
                        src={p.src}
                        controls
                        onLoadedMetadata={e => {
                          const v = e.target;
                          // если портретное — по высоте, иначе — по ширине
                          if (v.videoHeight > v.videoWidth) {
                            v.style.width = 'auto';
                            v.style.height = '100%';
                          } else {
                            v.style.width = '100%';
                            v.style.height = 'auto';
                          }
                          v.style.objectFit = 'contain';
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Два рандом-поста */}
            <div className="post-list">
              {posts.filter(p => p.type === 'image').map((p, i) => (
                <div key={i} className="card post">
                  <img src={p.src} alt="" />
                </div>
              ))}
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}
