import React, { useEffect, useRef, useState, useCallback } from 'react';
import './DownloadButtons.css';

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

// Build a list of installer/portable options derived from release assets.
// Order defines what shows in the dropdown.
const buildOptions = (assets) => {
  if (!assets || assets.length === 0) return [];

  const winInstaller = matchAsset(assets, /-Setup\.exe$/i);
  const winPortable =
    matchAsset(assets, /^CofeMine-Launcher\.exe$/i) ||
    assets.find((a) => /\.exe$/i.test(a.name) && !/Setup/i.test(a.name));
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
  push('windows', 'Windows — установщик', winInstaller, 'рекомендуется');
  push('windows', 'Windows — портативный .exe', winPortable);
  push('macos', 'macOS — .dmg', macDmg);
  push('linux', 'Linux — .deb', linuxDeb, 'Debian / Ubuntu');
  push('linux', 'Linux — .rpm', linuxRpm, 'Fedora / RHEL');
  push('linux', 'Linux — .AppImage', linuxAppImage);
  push('any', 'Java JAR — универсальный', jar, 'нужен JRE 17+');
  push('linux', 'Linux — .sh', sh);
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
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(null);
  const [primary, setPrimary] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef(null);
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

  const handlePrimary = useCallback(
    (e) => {
      // If we don't have data yet, fall through to GitHub releases as href.
      if (!loaded || error || !primary) return;
      e.preventDefault();
      triggerDownload(primary.asset.browser_download_url, primary.asset.name);
    },
    [loaded, error, primary],
  );

  const handleOption = useCallback((opt) => {
    setOpen(false);
    triggerDownload(opt.asset.browser_download_url, opt.asset.name);
  }, []);

  const renderMenu = () => {
    if (!loaded) return <div className="dl-menu__status">Загрузка релиза…</div>;
    if (error || !options || options.length === 0) {
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
      <ul className="dl-menu__list" role="menu">
        {options.map((opt) => {
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
    );
  };

  // Fallback href: GitHub releases page if data is not ready / failed.
  // This keeps right-click "save link as" and crawlers happy.
  const fallbackHref =
    primary && !error ? primary.asset.browser_download_url : RELEASES_PAGE;

  return (
    <div className="dl-root">
      <a
        href={fallbackHref}
        className={className}
        onClick={handlePrimary}
        rel="noopener noreferrer"
        download={primary && !error ? primary.asset.name : undefined}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.12 6 2.12v4.78z" />
        </svg>
        {label}
      </a>
      <span className="dl-launcher-extra" ref={rootRef}>
        <button
          type="button"
          className="dl-link-button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          другие платформы
          <ChevronIcon open={open} />
        </button>
        {open && <div className="dl-menu dl-menu--right">{renderMenu()}</div>}
      </span>
    </div>
  );
};

export default DownloadLauncherButton;
