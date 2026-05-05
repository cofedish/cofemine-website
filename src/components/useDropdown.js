import { useEffect, useRef, useState } from 'react';

// Tracks open state, click-outside / Escape closing, and computes whether the
// menu should drop down or up based on available viewport space.
export default function useDropdown({ desiredHeight = 440 } = {}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState('down');
  const rootRef = useRef(null);

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

  useEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setDirection(spaceBelow < desiredHeight && spaceAbove > spaceBelow ? 'up' : 'down');
  }, [open, desiredHeight]);

  return { open, setOpen, direction, rootRef };
}
