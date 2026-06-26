import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { 
  FiMenu, 
  FiSettings, 
  FiUser, 
  FiLogOut, 
  FiSearch, 
  FiChevronDown, 
  FiX, 
  FiActivity, 
  FiHeart, 
  FiSmile, 
  FiBookOpen, 
  FiCompass, 
  FiZap, 
  FiAward,
  FiCreditCard
} from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import NotificationsBell from './NotificationsBell';

const openSearch = () => window.dispatchEvent(new Event('open-command-palette'));

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  const isPathwaysActive = location.pathname.startsWith('/courses') && categoryParam !== null;
  const isLearningActive = location.pathname === '/explore' || 
                           location.pathname.startsWith('/explore/') || 
                           location.pathname.startsWith('/missions') || 
                           (location.pathname.startsWith('/courses') && categoryParam === null);
  const isProgressActive = location.pathname === '/my-learning' || 
                           location.pathname === '/certificates';

  return (
    <header className="student-header">
      <div className="student-header-container">
        
        {/* Left Section: Logo */}
        <Link className="student-header-logo" to="/dashboard">
          <img src="/logo-icon.png" alt={settings.site_name || 'ZezhaSchool'} />
          <span className="student-header-logo-text">{settings.site_name || 'ZezhaSchool'}</span>
        </Link>
        
        {/* Center Section: Capsule Navigation Menu */}
        <nav className="student-header-nav">
          <Link className={`student-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">
            Dashboard
          </Link>
          
          {/* Mega Menu Dropdown */}
          <div className="student-nav-dropdown-trigger">
            <span className={`student-nav-link ${isPathwaysActive ? 'active' : ''}`}>
              Pathways <FiChevronDown style={{ marginLeft: '4px', fontSize: '0.85rem' }} />
            </span>
            
            <div className="student-mega-menu">
              <div className="student-mega-menu-grid">
                <div className="student-mega-column">
                  <div className="student-mega-column-title">Fundamental Pathways</div>
                  
                  <Link className="student-mega-item item-blue" to="/courses?category=Discipline">
                    <div className="student-mega-item-icon"><FiActivity /></div>
                    <div>
                      <div className="student-mega-item-title">Discipline &amp; Habits</div>
                      <div className="student-mega-item-desc">Master emotional regulation, self-control, and daily consistency.</div>
                    </div>
                  </Link>
                  
                  <Link className="student-mega-item item-purple" to="/courses?category=Emotional%20IQ">
                    <div className="student-mega-item-icon"><FiSmile /></div>
                    <div>
                      <div className="student-mega-item-title">Emotional Intelligence</div>
                      <div className="student-mega-item-desc">Understand feelings, build resilience, and develop empathy.</div>
                    </div>
                  </Link>
                </div>
                
                <div className="student-mega-column">
                  <div className="student-mega-column-title">Growth Pathways</div>
                  
                  <Link className="student-mega-item item-gold" to="/courses?category=Finance">
                    <div className="student-mega-item-icon"><FiZap /></div>
                    <div>
                      <div className="student-mega-item-title">Money &amp; Finance</div>
                      <div className="student-mega-item-desc">Learn budgeting, saving basics, and smart financial thinking.</div>
                    </div>
                  </Link>
                  
                  <Link className="student-mega-item item-cyan" to="/courses?category=Personality">
                    <div className="student-mega-item-icon"><FiHeart /></div>
                    <div>
                      <div className="student-mega-item-title">Personality &amp; Behavior</div>
                      <div className="student-mega-item-desc">Cultivate confidence, presentation skills, and active listening.</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Learning Dropdown */}
          <div className="student-nav-dropdown-trigger">
            <span className={`student-nav-link ${isLearningActive ? 'active' : ''}`}>
              Learning <FiChevronDown style={{ marginLeft: '4px', fontSize: '0.85rem' }} />
            </span>
            
            <div className="student-standard-dropdown">
              <Link className="student-dropdown-item" to="/courses">
                <FiBookOpen style={{ color: 'var(--primary)' }} />
                <div>
                  <div className="title">All Courses</div>
                  <div className="desc">Browse our educational curriculum</div>
                </div>
              </Link>
              
              <Link className="student-dropdown-item" to="/explore">
                <FiCompass style={{ color: 'var(--accent)' }} />
                <div>
                  <div className="title">Explore Articles</div>
                  <div className="desc">Read fundamental life skill articles</div>
                </div>
              </Link>
              
              <Link className="student-dropdown-item" to="/missions">
                <FiZap style={{ color: 'var(--warning)' }} />
                <div>
                  <div className="title">Missions &amp; Tasks</div>
                  <div className="desc">Complete interactive challenges</div>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Progress Dropdown */}
          <div className="student-nav-dropdown-trigger">
            <span className={`student-nav-link ${isProgressActive ? 'active' : ''}`}>
              Progress <FiChevronDown style={{ marginLeft: '4px', fontSize: '0.85rem' }} />
            </span>
            
            <div className="student-standard-dropdown">
              <Link className="student-dropdown-item" to="/my-learning">
                <FiActivity style={{ color: 'var(--success)' }} />
                <div>
                  <div className="title">My Learning</div>
                  <div className="desc">Track your active courses</div>
                </div>
              </Link>
              
              <Link className="student-dropdown-item" to="/certificates">
                <FiAward style={{ color: 'var(--warning)' }} />
                <div>
                  <div className="title">Certificates</div>
                  <div className="desc">View your earned achievements</div>
                </div>
              </Link>
            </div>
          </div>
        </nav>
        
        {/* Right Section: Actions & Profile */}
        <div className="student-header-right">
          <button className="header-search" onClick={openSearch} title="Search (Ctrl+K)">
            <FiSearch />
            <span>Search</span>
            <kbd>Ctrl K</kbd>
          </button>
          
          <ThemeToggle />
          <NotificationsBell />
          
          <div className="profile-dropdown" ref={menuRef}>
            <div className="profile-avatar" onClick={() => setMenuOpen(!menuOpen)}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} />
              ) : (
                initials
              )}
            </div>
            
            {menuOpen && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="name">{profile?.full_name}</div>
                  <div className="email">{profile?.email}</div>
                </div>
                <button
                  className="profile-menu-item"
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                >
                  <FiUser /> My Profile
                </button>
                <button
                  className="profile-menu-item"
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                >
                  <FiSettings /> Settings
                </button>
                <button
                  className="profile-menu-item"
                  onClick={() => { setMenuOpen(false); navigate('/subscription'); }}
                >
                  <FiCreditCard /> Subscription
                </button>
                <button className="profile-menu-item danger" onClick={handleSignOut}>
                  <FiLogOut /> Sign Out
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu hamburger toggle */}
          <button className="student-mobile-toggle" onClick={() => setMobileOpen(true)}>
            <FiMenu />
          </button>
        </div>
      </div>
      
      {/* Mobile Drawer Overlay & Panel */}
      <div className={`student-mobile-drawer-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="student-mobile-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="student-mobile-drawer-header">
            <Link className="student-header-logo" to="/dashboard" onClick={() => setMobileOpen(false)}>
              <img src="/logo-icon.png" alt={settings.site_name || 'ZezhaSchool'} />
              <span className="student-header-logo-text">{settings.site_name || 'ZezhaSchool'}</span>
            </Link>
            <button className="student-mobile-drawer-close" onClick={() => setMobileOpen(false)}>
              <FiX />
            </button>
          </div>
          
          <nav className="student-mobile-drawer-nav">
            <Link className={`student-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            
            <div className="student-mobile-section-header">Pathways</div>
            <Link className="student-nav-link" to="/courses?category=Discipline" onClick={() => setMobileOpen(false)}>
              Discipline &amp; Habits
            </Link>
            <Link className="student-nav-link" to="/courses?category=Emotional%20IQ" onClick={() => setMobileOpen(false)}>
              Emotional Intelligence
            </Link>
            <Link className="student-nav-link" to="/courses?category=Finance" onClick={() => setMobileOpen(false)}>
              Money &amp; Finance
            </Link>
            <Link className="student-nav-link" to="/courses?category=Personality" onClick={() => setMobileOpen(false)}>
              Personality &amp; Behavior
            </Link>
            
            <div className="student-mobile-section-header">Learning</div>
            <Link className="student-nav-link" to="/courses" onClick={() => setMobileOpen(false)}>
              All Courses
            </Link>
            <Link className="student-nav-link" to="/explore" onClick={() => setMobileOpen(false)}>
              Explore Articles
            </Link>
            <Link className="student-nav-link" to="/missions" onClick={() => setMobileOpen(false)}>
              Missions
            </Link>
            
            <div className="student-mobile-section-header">Progress</div>
            <Link className="student-nav-link" to="/my-learning" onClick={() => setMobileOpen(false)}>
              My Learning
            </Link>
            <Link className="student-nav-link" to="/certificates" onClick={() => setMobileOpen(false)}>
              Certificates
            </Link>
            
            <div className="student-mobile-section-header">Account</div>
            <Link className="student-nav-link" to="/subscription" onClick={() => setMobileOpen(false)}>
              Subscription
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
