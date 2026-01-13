import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import './Profile.css';

// Video Card Component - loads only poster, not video
function VideoCard({ video, onClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const posterSrc = video.poster || '/img/video-placeholder.svg';
  const displayTitle = video.title || video.filename?.replace(/\.[^.]+$/, '') || 'Video';

  return (
    <div
      ref={cardRef}
      className="video-card"
      onClick={() => onClick(video)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(video)}
    >
      <div className="video-card__poster">
        {isVisible ? (
          <img
            src={posterSrc}
            alt={displayTitle}
            loading="lazy"
            onError={(e) => {
              e.target.src = '/img/video-placeholder.svg';
            }}
          />
        ) : (
          <div className="video-card__skeleton" />
        )}
        <div className="video-card__play-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="video-card__info">
        <h4 className="video-card__title">{displayTitle}</h4>
        {video.tags && video.tags.length > 0 && (
          <div className="video-card__tags">
            {video.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="video-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Video Modal - only loads video when opened
function VideoModal({ video, onClose }) {
  const videoRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.3;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const displayTitle = video.title || video.filename?.replace(/\.[^.]+$/, '') || 'Video';

  return (
    <div
      className="video-modal"
      ref={modalRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="video-modal__content">
        <button className="video-modal__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="video-modal__video-container">
          <video
            ref={videoRef}
            src={video.src}
            controls
            autoPlay
            preload="metadata"
            playsInline
          />
        </div>

        <div className="video-modal__info">
          <h3>{displayTitle}</h3>
          {video.tags && video.tags.length > 0 && (
            <div className="video-modal__tags">
              {video.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Filter Tags Component
function TagFilter({ tags, activeTag, onTagChange }) {
  return (
    <div className="tag-filter">
      <button
        className={`tag-filter__btn ${!activeTag ? 'active' : ''}`}
        onClick={() => onTagChange(null)}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`tag-filter__btn ${activeTag === tag ? 'active' : ''}`}
          onClick={() => onTagChange(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

// Main Profile Component
function normalizeManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') return null;
  if (manifest.developers && typeof manifest.developers === 'object') return manifest;

  const developers = {};
  const allTags = new Set();

  for (const [slug, legacy] of Object.entries(manifest)) {
    if (!legacy || typeof legacy !== 'object') continue;

    const videos = Array.isArray(legacy.videos)
      ? legacy.videos.map((src, index) => {
          const filename = typeof src === 'string' ? src.split('/').pop() || '' : '';
          const title = filename ? filename.replace(/\.[^.]+$/, '').replace(/_/g, ' ') : 'Video';
          const idBase = filename || `video_${index}`;
          const id = `${slug}_${idBase.replace(/[^a-zA-Z0-9]/g, '_')}`;
          const tags = [slug];
          tags.forEach((tag) => allTags.add(tag));
          return {
            id,
            src,
            filename,
            title,
            tags,
            date: null,
            size: 0,
            poster: null,
            featured: false
          };
        })
      : [];

    const photos = Array.isArray(legacy.photos) ? legacy.photos : [];
    developers[slug] = {
      ...legacy,
      slug,
      videos,
      photos,
      videoCount: videos.length,
      photoCount: photos.length,
      featured: []
    };
  }

  return {
    generated: new Date().toISOString(),
    developers,
    allTags: [...allTags].sort()
  };
}

export default function Profile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);

    fetch('/data/media.json', { cache: 'no-store' })
      .then((r) => r.json())
      .then((manifest) => {
        const normalized = normalizeManifest(manifest);
        const slug = (username || '').toLowerCase().trim();
        const profile = normalized?.developers?.[slug] || normalized?.developers?.[username];

        if (!profile) {
          setData({ error: true });
          setLoading(false);
          return;
        }

        setData({
          ...profile,
          allTags: normalized?.allTags || []
        });
        setLoading(false);
      })
      .catch(() => {
        setData({ error: true });
        setLoading(false);
      });
  }, [username]);

  const handleVideoClick = useCallback((video) => {
    setSelectedVideo(video);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Filter videos
  const filteredVideos = data?.videos?.filter((video) => {
    const matchesTag = !activeTag || video.tags?.includes(activeTag);
    const matchesSearch =
      !searchQuery ||
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.filename?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  }) || [];

  // Get unique tags from videos
  const videoTags = [...new Set(data?.videos?.flatMap((v) => v.tags || []) || [])].sort();

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (data?.error) {
    return <Navigate to="/" replace />;
  }

  const { name, avatar, bio, role, links, friends, subs, photos, featured } = data;

  return (
    <div className={`profile-page theme-${username}`}>
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header__container">
          <Link to="/" className="profile-header__back">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back
          </Link>
        </div>
      </header>

      {/* Profile Info */}
      <section className="profile-info">
        <div className="profile-info__container">
          <img className="profile-info__avatar" src={avatar} alt={name} />

          <div className="profile-info__details">
            <h1 className="profile-info__name">{name}</h1>
            {role && <p className="profile-info__role">{role}</p>}
            {bio && <p className="profile-info__bio">{bio}</p>}

            {links && (
              <div className="profile-info__links">
                {links.github && (
                  <a href={links.github} target="_blank" rel="noopener noreferrer" className="profile-link">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                )}
                {links.telegram && (
                  <a href={links.telegram} target="_blank" rel="noopener noreferrer" className="profile-link">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="profile-info__stats">
            <div className="stat">
              <span className="stat__value">{data.videoCount || 0}</span>
              <span className="stat__label">Videos</span>
            </div>
            <div className="stat">
              <span className="stat__value">{data.photoCount || 0}</span>
              <span className="stat__label">Photos</span>
            </div>
          </div>
        </div>
      </section>

      <div className="profile-content">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          {/* Photos */}
          {photos && photos.length > 0 && (
            <div className="sidebar-card">
              <h3>Photos</h3>
              <div className="photos-grid">
                {photos.slice(0, 6).map((photo, i) => (
                  <img key={i} src={photo} alt="" loading="lazy" />
                ))}
              </div>
            </div>
          )}

          {/* Friends */}
          {friends && friends.length > 0 && (
            <div className="sidebar-card">
              <h3>Friends</h3>
              <div className="friends-list">
                {friends.map((friend, i) => (
                  <Link key={i} to={`/team/${friend.username}`} className="friend-item">
                    <img src={friend.avatar} alt={friend.username} />
                    <span>{friend.username}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Subscriptions */}
          {subs && subs.length > 0 && (
            <div className="sidebar-card">
              <h3>Subscriptions</h3>
              <ul className="subs-list">
                {subs.map((sub, i) => (
                  <li key={i}>{sub}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          {/* Featured Section */}
          {featured && featured.length > 0 && (
            <section className="featured-section">
              <h2>Featured</h2>
              <div className="videos-grid videos-grid--featured">
                {featured.slice(0, 6).map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={handleVideoClick}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Videos */}
          <section className="videos-section">
            <div className="videos-section__header">
              <h2>All Videos ({filteredVideos.length})</h2>

              <div className="videos-section__controls">
                {/* Search */}
                <div className="search-box">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tag Filter */}
            {videoTags.length > 0 && (
              <TagFilter
                tags={videoTags}
                activeTag={activeTag}
                onTagChange={setActiveTag}
              />
            )}

            {/* Videos Grid */}
            {filteredVideos.length > 0 ? (
              <div className="videos-grid">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={handleVideoClick}
                  />
                ))}
              </div>
            ) : (
              <div className="no-videos">
                <p>No videos found</p>
                {(activeTag || searchQuery) && (
                  <button onClick={() => { setActiveTag(null); setSearchQuery(''); }}>
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={handleCloseModal} />
      )}
    </div>
  );
}
