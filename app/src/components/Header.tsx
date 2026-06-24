import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiBell, FiSettings, FiUser, FiLogOut } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
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

  return (
    <header className="top-header">
      <div className="top-header-left">
        <button className="hamburger-btn" onClick={onMenuClick}>
          <FiMenu />
        </button>
        <h1>{title}</h1>
      </div>

      <div className="top-header-right">
        <ThemeToggle />
        <button className="header-btn" title="Notifications">
          <FiBell />
        </button>

        <div className="profile-dropdown" ref={menuRef}>
          <div
            className="profile-avatar"
            onClick={() => setMenuOpen(!menuOpen)}
          >
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
              <button className="profile-menu-item danger" onClick={handleSignOut}>
                <FiLogOut /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
