import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AnnouncementBanner from './AnnouncementBanner';
import CommandPalette from './CommandPalette';
import MaintenanceScreen from './MaintenanceScreen';
import { useSidebarLayout } from '../hooks/useSidebarLayout';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useAuth } from '../contexts/AuthContext';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/courses': 'Courses',
  '/my-learning': 'My Learning',
  '/subscription': 'Subscription Plans',
  '/certificates': 'Certificates',
  '/settings': 'Settings',
  '/help': 'Help & Support',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed, toggleCollapse, resizing, startResize, effectiveWidth } =
    useSidebarLayout('sidebar');
  const location = useLocation();
  const { settings } = useSiteSettings();
  const { profile } = useAuth();

  const title = pageTitles[location.pathname] || 'ZezhaSchool';

  // Maintenance mode locks out students; admins keep full access.
  if (settings.maintenance_mode && profile?.role !== 'admin') {
    return <MaintenanceScreen />;
  }

  return (
    <div
      className={`app-layout ${resizing ? 'resizing' : ''}`}
      style={{ ['--sidebar-width' as string]: `${effectiveWidth}px` }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
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
          <AnnouncementBanner />
          <Outlet />
        </div>
      </div>
      <CommandPalette />
    </div>
  );
}
