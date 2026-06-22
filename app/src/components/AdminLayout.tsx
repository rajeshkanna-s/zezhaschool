import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiHome, FiBook, FiUsers, FiCreditCard,
  FiSettings, FiLogOut, FiMenu, FiShield
} from 'react-icons/fi';

const adminNav = [
  { to: '/admin', icon: <FiHome />, label: 'Dashboard', end: true },
  { to: '/admin/courses', icon: <FiBook />, label: 'Courses' },
  { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
  { to: '/admin/subscriptions', icon: <FiCreditCard />, label: 'Subscriptions' },
  { to: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Admin Dashboard',
  '/admin/courses': 'Course Management',
  '/admin/courses/new': 'Create Course',
  '/admin/users': 'User Management',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/settings': 'Admin Settings',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Admin';

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <FiShield size={24} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Management</div>
            {adminNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
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

        <div className="sidebar-footer">
          <div
            className="sidebar-link"
            onClick={handleSignOut}
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <FiLogOut />
            <span>Sign Out</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 8 }}>
            Logged in as {profile?.full_name}
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="top-header-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <h1>{title}</h1>
          </div>
          <div className="top-header-right">
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
          <Outlet />
        </div>
      </div>
    </div>
  );
}
