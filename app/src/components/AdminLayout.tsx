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
  { to: '/admin', icon: <FiHome />, label: 'Dashboard', end: true },
  { to: '/admin/courses', icon: <FiBook />, label: 'Courses' },
  { to: '/admin/pages', icon: <FiFileText />, label: 'Pages' },
  { to: '/admin/missions', icon: <FiZap />, label: 'Missions' },
  { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
  { to: '/admin/subscriptions', icon: <FiCreditCard />, label: 'Subscriptions' },
  { to: '/admin/site-settings', icon: <FiSettings />, label: 'Site Settings' },
];

const misNav = [
  { to: '/admin/mis/users', icon: <FiUsers />, label: 'User MIS' },
  { to: '/admin/mis/subscriptions', icon: <FiCreditCard />, label: 'Subscription MIS' },
  { to: '/admin/mis/login-history', icon: <FiClock />, label: 'Login History MIS' },
  { to: '/admin/mis/courses', icon: <FiBook />, label: 'Courses MIS' },
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
          <FiShield size={24} />
          <span className="sidebar-logo-text" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Admin Panel</span>
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
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
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
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
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
