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
  { to: '/', icon: <FiHome />, label: 'Dashboard' },
  { to: '/courses', icon: <FiBook />, label: 'Courses' },
  { to: '/explore', icon: <FiCompass />, label: 'Explore' },
  { to: '/missions', icon: <FiZap />, label: 'Missions' },
  { to: '/my-learning', icon: <FiBookOpen />, label: 'My Learning' },
  { to: '/subscription', icon: <FiCreditCard />, label: 'Subscription' },
  { to: '/certificates', icon: <FiAward />, label: 'Certificates' },
];

const supportItems = [
  { to: '/help', icon: <FiHelpCircle />, label: 'Help & Support' },
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
                onClick={onClose}
                end={item.to === '/'}
              >
                {item.icon}
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
                onClick={onClose}
              >
                {item.icon}
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
