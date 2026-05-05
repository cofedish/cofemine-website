import React, { useEffect, useState, useCallback } from 'react';
import './DownloadButtons.css';
import useDropdown from './useDropdown';

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
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

const Chevron = ({ open }) => (
  <svg
    className={`dl-chevron ${open ? 'is-open' : ''}`}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <polyline points="6 9 12 15 18 9" />
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
  const { open, setOpen, direction, rootRef } = useDropdown({ desiredHeight: 280 });
  const [packs, setPacks] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

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

  const handlePackClick = useCallback(
    (pack) => {
      setOpen(false);
      const filename = `${(pack.versionName || pack.displayName || 'cofemine').replace(/[^\w.-]+/g, '_')}.mrpack`;
      triggerDownload(pack.mrpackUrl, filename);
    },
    [setOpen],
  );

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
          <a href={`${PANEL_BASE_URL}/api/p/index.json`} target="_blank" rel="noopener noreferrer">
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
              <span className="dl-menu__item-title">
                {pack.displayName || pack.versionName || pack.id}
              </span>
              <span className="dl-menu__item-meta">
                MC {pack.minecraft || '—'} · {formatLoader(pack.loader, pack.loaderVersion)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const menuClass = `dl-menu${direction === 'up' ? ' dl-menu--up' : ''}`;

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
        <span className="dl-trigger-label">{label}</span>
        <Chevron open={open} />
      </button>
      {open && <div className={menuClass}>{renderMenu()}</div>}
    </div>
  );
};

export default DownloadPackButton;
