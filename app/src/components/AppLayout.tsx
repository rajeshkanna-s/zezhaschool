import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/courses': 'Courses',
  '/my-learning': 'My Learning',
  '/subscription': 'Subscription Plans',
  '/certificates': 'Certificates',
  '/settings': 'Settings',
  '/help': 'Help & Support',
};

const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const COLLAPSED_WIDTH = 76;
const DEFAULT_WIDTH = 260;

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const [width, setWidth] = useState(() => {
    const saved = parseInt(localStorage.getItem('sidebar-width') || '', 10);
    if (isNaN(saved)) return DEFAULT_WIDTH;
    return Math.min(Math.max(saved, MIN_WIDTH), MAX_WIDTH);
  });
  const [resizing, setResizing] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'ZezhaSchool';

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('sidebar-width', String(width));
  }, [width]);

  // Drag-to-resize handling
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
  }, []);

  useEffect(() => {
    if (!resizing) return;

    const onMove = (e: MouseEvent) => {
      const next = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
      setWidth(next);
    };
    const onUp = () => setResizing(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing]);

  const effectiveWidth = collapsed ? COLLAPSED_WIDTH : width;

  return (
    <div
      className={`app-layout ${resizing ? 'resizing' : ''}`}
      style={{ ['--sidebar-width' as string]: `${effectiveWidth}px` }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div
          className="sidebar-resize-handle"
          onMouseDown={startResize}
          title="Drag to resize"
        />
      )}
      <div className="main-content">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
