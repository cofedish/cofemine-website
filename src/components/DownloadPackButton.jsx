import React, { useEffect, useRef, useState, useCallback } from 'react';
import './DownloadButtons.css';

const PANEL_BASE_URL =
  process.env.REACT_APP_PANEL_BASE_URL || 'https://panel.cofemine.ru';

const LOADER_LABELS = {
  neoforge: 'NeoForge',
  forge: 'Forge',
  fabric: 'Fabric',
  quilt: 'Quilt',
};

const formatLoader = (loader, version) => {
  if (!loader) return 'Vanilla';
  const name = LOADER_LABELS[loader] || loader;
  return version ? `${name} ${version}` : name;
};

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    className={`dl-chevron ${open ? 'is-open' : ''}`}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M7 10l5 5 5-5H7z" />
  </svg>
);

const triggerDownload = (url, suggestedName) => {
  const a = document.createElement('a');
  a.href = url;
  if (suggestedName) a.download = suggestedName;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const DownloadPackButton = ({ className = 'button', label = 'Скачать сборку', showIcon = true }) => {
  const [open, setOpen] = useState(false);
  const [packs, setPacks] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${PANEL_BASE_URL}/api/p/index.json`, {
          credentials: 'omit',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setPacks(Array.isArray(data?.packs) ? data.packs : []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'fetch failed');
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handlePackClick = useCallback((pack) => {
    setOpen(false);
    const filename = `${(pack.versionName || pack.displayName || 'cofemine').replace(/[^\w.-]+/g, '_')}.mrpack`;
    triggerDownload(pack.mrpackUrl, filename);
  }, []);

  const renderMenu = () => {
    if (!loaded) {
      return (
        <div className="dl-menu__loading" aria-busy="true" aria-label="Загрузка списка сборок">
          <div className="dl-menu__skeleton" />
          <div className="dl-menu__skeleton" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="dl-menu__status dl-menu__status--error">
          Не удалось получить список сборок.
          <a
            href={`${PANEL_BASE_URL}/api/p/index.json`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть напрямую
          </a>
        </div>
      );
    }
    if (!packs || packs.length === 0) {
      return <div className="dl-menu__status">Сборок пока нет.</div>;
    }
    return (
      <ul className="dl-menu__list" role="menu">
        {packs.map((pack) => (
          <li key={pack.id} role="none">
            <button
              type="button"
              role="menuitem"
              className="dl-menu__item"
              onClick={() => handlePackClick(pack)}
            >
              <span className="dl-menu__item-title">{pack.displayName || pack.versionName || pack.id}</span>
              <span className="dl-menu__item-meta">
                MC {pack.minecraft || '—'} · {formatLoader(pack.loader, pack.loaderVersion)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="dl-root" ref={rootRef}>
      <button
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {showIcon && <DownloadIcon />}
        {label}
        <ChevronIcon open={open} />
      </button>
      {open && <div className="dl-menu">{renderMenu()}</div>}
    </div>
  );
};

export default DownloadPackButton;
