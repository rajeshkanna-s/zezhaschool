import { useState, useEffect, useCallback } from 'react';

const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const COLLAPSED_WIDTH = 76;
const DEFAULT_WIDTH = 260;

/**
 * Collapsible + drag-resizable sidebar behaviour, persisted to localStorage.
 * Pass a unique storageKey per layout (e.g. 'sidebar', 'admin-sidebar') so each
 * sidebar remembers its own width / collapsed state independently.
 */
export function useSidebarLayout(storageKey: string) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(`${storageKey}-collapsed`) === 'true'
  );
  const [width, setWidth] = useState(() => {
    const saved = parseInt(localStorage.getItem(`${storageKey}-width`) || '', 10);
    if (isNaN(saved)) return DEFAULT_WIDTH;
    return Math.min(Math.max(saved, MIN_WIDTH), MAX_WIDTH);
  });
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    localStorage.setItem(`${storageKey}-collapsed`, String(collapsed));
  }, [collapsed, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}-width`, String(width));
  }, [width, storageKey]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
  }, []);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      setWidth(Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH));
    };
    const onUp = () => setResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing]);

  const toggleCollapse = useCallback(() => setCollapsed(c => !c), []);
  const effectiveWidth = collapsed ? COLLAPSED_WIDTH : width;

  return { collapsed, toggleCollapse, resizing, startResize, effectiveWidth };
}
