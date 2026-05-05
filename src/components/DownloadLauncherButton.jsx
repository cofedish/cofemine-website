import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import './DownloadButtons.css';
import useDropdown from './useDropdown';

const RELEASES_API =
  'https://api.github.com/repos/cofedish/cofemine_launcher/releases/latest';
const RELEASES_PAGE =
  'https://github.com/cofedish/cofemine_launcher/releases/latest';

const detectOS = () => {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  const platformRaw =
    (navigator.userAgentData && navigator.userAgentData.platform) ||
    navigator.platform ||
    '';
  const platform = platformRaw.toLowerCase();
  if (/Android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (platform.includes('mac') || /Mac OS X/i.test(ua)) return 'macos';
  if (platform.includes('win') || /Windows/i.test(ua)) return 'windows';
  if (platform.includes('linux') || /Linux/i.test(ua)) return 'linux';
  return 'unknown';
};

const matchAsset = (assets, regex) =>
  assets.find((a) => regex.test(a.name) && !/\.sha256$/i.test(a.name));

const buildOptions = (assets) => {
  if (!assets || assets.length === 0) return [];

  const winInstaller = matchAsset(assets, /-Setup\.exe$/i);
  const winPortable =
    matchAsset(assets, /^CofeMine-Launcher\.exe$/i) ||
    assets.find((a) => /\.exe$/i.test(a.name) && !/Setup/i.test(a.name) && !/\.sha256$/i.test(a.name));
  const macDmg = matchAsset(assets, /\.dmg$/i);
  const linuxDeb = matchAsset(assets, /\.deb$/i);
  const linuxRpm = matchAsset(assets, /\.rpm$/i);
  const linuxAppImage = matchAsset(assets, /\.AppImage$/i);
  const jar = matchAsset(assets, /\.jar$/i);
  const sh = matchAsset(assets, /\.sh$/i);

  const opts = [];
  const push = (os, label, asset, hint) => {
    if (asset) opts.push({ os, label, asset, hint });
  };
  push('windows', 'Установщик (Setup.exe)', winInstaller, 'рекомендуется');
  push('windows', 'Портативный .exe', winPortable, 'без установки');
  push('macos', 'Образ диска (.dmg)', macDmg);
  push('linux', '.deb пакет', linuxDeb, 'Debian, Ubuntu, Mint');
  push('linux', '.rpm пакет', linuxRpm, 'Fedora, RHEL, openSUSE');
  push('linux', '.AppImage', linuxAppImage, 'без установки');
  push('linux', 'Shell-скрипт (.sh)', sh, 'ручной запуск');
  push('any', 'Java JAR', jar, 'требуется JRE 17+');
  return opts;
};

const pickPrimary = (options, os) => {
  const byOs = (target, predicate) =>
    options.find((o) => o.os === target && predicate(o));
  if (os === 'windows') return byOs('windows', (o) => /Setup/i.test(o.asset.name)) || byOs('windows', () => true);
  if (os === 'macos') return byOs('macos', () => true);
  if (os === 'linux') return byOs('linux', (o) => /\.deb$/i.test(o.asset.name)) || byOs('linux', () => true);
  return options.find((o) => o.os === 'any') || options[0] || null;
};

const ShieldIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.12 6 2.12v4.78z" />
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

const triggerDownload = (url, name) => {
  const a = document.createElement('a');
  a.href = url;
  if (name) a.download = name;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const DownloadLauncherButton = ({ className = 'button', label = 'Скачать лаунчер' }) => {
  const { open, setOpen, direction, rootRef } = useDropdown({ desiredHeight: 440 });
  const [options, setOptions] = useState(null);
  const [primary, setPrimary] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const osRef = useRef(detectOS());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(RELEASES_API, {
          credentials: 'omit',
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const opts = buildOptions(data?.assets);
        if (cancelled) return;
        setOptions(opts);
        setPrimary(pickPrimary(opts, osRef.current));
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

  const handleOption = useCallback(
    (opt) => {
      setOpen(false);
      triggerDownload(opt.asset.browser_download_url, opt.asset.name);
    },
    [setOpen],
  );

  const groups = useMemo(() => {
    if (!options) return null;
    const labels = {
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux',
      any: 'Универсальные',
    };
    const order = ['windows', 'macos', 'linux', 'any'];
    return order
      .map((os) => ({ os, label: labels[os], items: options.filter((o) => o.os === os) }))
      .filter((g) => g.items.length > 0);
  }, [options]);

  // Reorder: place the recommended item at the top of its section so it's
  // visible without scrolling, and so "для вашей ОС" lands above the fold.
  const orderedGroups = useMemo(() => {
    if (!groups || !primary) return groups;
    return groups.map((g) => {
      if (!g.items.includes(primary)) return g;
      const rest = g.items.filter((i) => i !== primary);
      return { ...g, items: [primary, ...rest] };
    });
  }, [groups, primary]);

  const renderMenu = () => {
    if (!loaded) {
      return (
        <div className="dl-menu__loading" aria-busy="true" aria-label="Загрузка релиза">
          <div className="dl-menu__skeleton" />
          <div className="dl-menu__skeleton" />
          <div className="dl-menu__skeleton" />
        </div>
      );
    }
    if (error || !orderedGroups || orderedGroups.length === 0) {
      return (
        <div className="dl-menu__status dl-menu__status--error">
          Не удалось получить релиз.
          <a href={RELEASES_PAGE} target="_blank" rel="noopener noreferrer">
            Открыть на GitHub
          </a>
        </div>
      );
    }
    return (
      <div role="menu">
        {orderedGroups.map((group) => (
          <div className="dl-menu__section" key={group.os}>
            <div className="dl-menu__section-title">{group.label}</div>
            <ul className="dl-menu__list">
              {group.items.map((opt) => {
                const recommended = opt === primary;
                return (
                  <li key={opt.asset.id} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={`dl-menu__item ${recommended ? 'is-recommended' : ''}`}
                      onClick={() => handleOption(opt)}
                    >
                      <span className="dl-menu__item-title">
                        {opt.label}
                        {recommended && <span className="dl-menu__badge">для вашей ОС</span>}
                      </span>
                      {opt.hint && <span className="dl-menu__item-meta">{opt.hint}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
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
        <ShieldIcon />
        <span className="dl-trigger-label">{label}</span>
        <Chevron open={open} />
      </button>
      {open && <div className={menuClass}>{renderMenu()}</div>}
    </div>
  );
};

export default DownloadLauncherButton;
