import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSidebarLayout } from '../hooks/useSidebarLayout';
import ThemeToggle from './ThemeToggle';
import NotificationsBell from './NotificationsBell';
import AnnouncementBanner from './AnnouncementBanner';
import CommandPalette from './CommandPalette';
import {
  FiHome, FiBook, FiUsers, FiCreditCard,
  FiSettings, FiLogOut, FiMenu, FiShield,
  FiBarChart2, FiClock, FiChevronLeft, FiChevronRight, FiFileText, FiZap, FiSearch
} from 'react-icons/fi';

const adminNav = [
  { to: '/admin', icon: <FiHome />, label: 'Dashboard', end: true, color: '#3b82f6', bgLight: 'rgba(59, 130, 246, 0.12)' },
  { to: '/admin/courses', icon: <FiBook />, label: 'Courses', color: '#f59e0b', bgLight: 'rgba(245, 158, 11, 0.12)' },
  { to: '/admin/pages', icon: <FiFileText />, label: 'Pages', color: '#06b6d4', bgLight: 'rgba(6, 182, 212, 0.12)' },
  { to: '/admin/missions', icon: <FiZap />, label: 'Missions', color: '#a855f7', bgLight: 'rgba(168, 85, 247, 0.12)' },
  { to: '/admin/users', icon: <FiUsers />, label: 'Users', color: '#10b981', bgLight: 'rgba(16, 185, 129, 0.12)' },
  { to: '/admin/subscriptions', icon: <FiCreditCard />, label: 'Subscriptions', color: '#ec4899', bgLight: 'rgba(236, 72, 153, 0.12)' },
  { to: '/admin/documents', icon: <FiFileText />, label: 'Legal & Help', color: '#f43f5e', bgLight: 'rgba(244, 63, 94, 0.12)' },
  { to: '/admin/site-settings', icon: <FiSettings />, label: 'Site Settings', color: '#94a3b8', bgLight: 'rgba(148, 163, 184, 0.12)' },
];

const misNav = [
  { to: '/admin/mis/users', icon: <FiUsers />, label: 'User MIS', color: '#10b981', bgLight: 'rgba(16, 185, 129, 0.12)' },
  { to: '/admin/mis/subscriptions', icon: <FiCreditCard />, label: 'Subscription MIS', color: '#ec4899', bgLight: 'rgba(236, 72, 153, 0.12)' },
  { to: '/admin/mis/login-history', icon: <FiClock />, label: 'Login History MIS', color: '#eab308', bgLight: 'rgba(234, 179, 8, 0.12)' },
  { to: '/admin/mis/courses', icon: <FiBook />, label: 'Courses MIS', color: '#06b6d4', bgLight: 'rgba(6, 182, 212, 0.12)' },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Admin Dashboard',
  '/admin/courses': 'Course Management',
  '/admin/courses/new': 'Create Course',
  '/admin/pages': 'Content Pages',
  '/admin/pages/new': 'New Page',
  '/admin/missions': 'Missions',
  '/admin/missions/new': 'New Mission',
  '/admin/users': 'User Management',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/documents': 'Legal & Help Pages',
  '/admin/site-settings': 'Site Settings',
  '/admin/mis/users': 'User MIS Report',
  '/admin/mis/subscriptions': 'Subscription MIS Report',
  '/admin/mis/login-history': 'Login History MIS',
  '/admin/mis/courses': 'Courses MIS Report',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed, toggleCollapse, resizing, startResize, effectiveWidth } =
    useSidebarLayout('admin-sidebar');
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/admin/pages/') ? 'Page Builder' :
     location.pathname.startsWith('/admin/missions/') ? 'Mission Builder' :
     location.pathname.startsWith('/admin/courses/') ? 'Edit Course' : 'Admin');

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div
      className={`app-layout ${resizing ? 'resizing' : ''}`}
      style={{ ['--sidebar-width' as string]: `${effectiveWidth}px` }}
    >
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar admin-sidebar ${sidebarOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <button
          className="sidebar-collapse-btn"
          onClick={toggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        <div className="sidebar-logo">
          <span className="auth-logo-icon-glowing" style={{ width: 36, height: 36, borderRadius: 10 }}>
            <FiShield size={18} color="#4f46e5" />
          </span>
          <span className="sidebar-logo-text" style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '0.5px' }}>Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Management</div>
            {adminNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                style={{
                  ['--icon-color' as any]: item.color,
                  ['--icon-bg' as any]: item.bgLight,
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-link-icon-container">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-section-title"><FiBarChart2 style={{ marginRight: 4 }} />MIS Reports</div>
            {misNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                style={{
                  ['--icon-color' as any]: item.color,
                  ['--icon-bg' as any]: item.bgLight,
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-link-icon-container">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer sidebar-footer-keep">
          <div
            className="sidebar-link"
            onClick={handleSignOut}
            title={collapsed ? 'Sign Out' : undefined}
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <FiLogOut />
            <span>Sign Out</span>
          </div>
          <div className="sidebar-footer-text" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 8 }}>
            Logged in as {profile?.full_name}
          </div>
        </div>
      </aside>

      {!collapsed && (
        <div
          className="sidebar-resize-handle"
          onMouseDown={startResize}
          title="Drag to resize"
        />
      )}

      <div className="main-content">
        <header className="top-header">
          <div className="top-header-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <h1>{title}</h1>
          </div>
          <div className="top-header-right">
            <button className="header-search" onClick={() => window.dispatchEvent(new Event('open-command-palette'))} title="Search (Ctrl+K)">
              <FiSearch /><span>Search</span><kbd>Ctrl K</kbd>
            </button>
            <ThemeToggle />
            <NotificationsBell />
            <span
              style={{
                background: 'var(--danger)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              ADMIN
            </span>
          </div>
        </header>
        <div className="page-content">
          <AnnouncementBanner />
          <Outlet />
        </div>
      </div>
      <CommandPalette scope="admin" />
    </div>
  );
}
