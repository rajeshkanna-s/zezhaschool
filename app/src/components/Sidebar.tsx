import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome, FiBook, FiCreditCard, FiBookOpen,
  FiAward, FiHelpCircle, FiChevronLeft, FiChevronRight, FiCompass, FiZap
} from 'react-icons/fi';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { to: '/dashboard', icon: <FiHome />, label: 'Dashboard', color: '#3b82f6', bgLight: 'rgba(59, 130, 246, 0.12)' },
  { to: '/courses', icon: <FiBook />, label: 'Courses', color: '#f59e0b', bgLight: 'rgba(245, 158, 11, 0.12)' },
  { to: '/explore', icon: <FiCompass />, label: 'Explore', color: '#06b6d4', bgLight: 'rgba(6, 182, 212, 0.12)' },
  { to: '/missions', icon: <FiZap />, label: 'Missions', color: '#a855f7', bgLight: 'rgba(168, 85, 247, 0.12)' },
  { to: '/my-learning', icon: <FiBookOpen />, label: 'My Learning', color: '#10b981', bgLight: 'rgba(16, 185, 129, 0.12)' },
  { to: '/subscription', icon: <FiCreditCard />, label: 'Subscription', color: '#ec4899', bgLight: 'rgba(236, 72, 153, 0.12)' },
  { to: '/certificates', icon: <FiAward />, label: 'Certificates', color: '#eab308', bgLight: 'rgba(234, 179, 8, 0.12)' },
];

const supportItems = [
  { to: '/help', icon: <FiHelpCircle />, label: 'Help & Support', color: '#f43f5e', bgLight: 'rgba(244, 63, 94, 0.12)' },
];

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        <div className="sidebar-logo">
          <img src="/logo-icon.svg" alt="ZezhaSchool" />
          <span className="sidebar-logo-text" style={{ fontWeight: 700, fontSize: '1.1rem' }}>ZezhaSchool</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Main Menu</div>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `sidebar-link ${isActive && location.pathname === item.to ? 'active' : ''}`
                }
                style={{
                  ['--icon-color' as any]: item.color,
                  ['--icon-bg' as any]: item.bgLight,
                }}
                onClick={onClose}
                end={item.to === '/dashboard'}
              >
                <span className="sidebar-link-icon-container">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Support</div>
            {supportItems.map(item => (
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
                onClick={onClose}
              >
                <span className="sidebar-link-icon-container">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            © {new Date().getFullYear()} ZezhaSchool
          </div>
        </div>
      </aside>
    </>
  );
}
