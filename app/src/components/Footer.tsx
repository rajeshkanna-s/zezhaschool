import { Link } from 'react-router-dom';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { FiInstagram, FiLinkedin, FiGlobe } from 'react-icons/fi';

export default function Footer() {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  const socials = [
    { url: settings.social_instagram, icon: <FiInstagram />, label: 'Instagram' },
    { url: settings.social_linkedin, icon: <FiLinkedin />, label: 'LinkedIn' },
    { url: settings.social_website, icon: <FiGlobe />, label: 'Website' },
  ].filter(s => s.url && s.url.trim());

  return (
    <footer className="app-footer">
      <div className="app-footer-left">
        © {year} {settings.site_name}. All rights reserved.
      </div>
      <nav className="app-footer-links">
        <Link to="/terms">Terms &amp; Conditions</Link>
        <Link to="/refund-policy">Refund Policy</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/help">Help</Link>
      </nav>
      {socials.length > 0 && (
        <div className="app-footer-social">
          {socials.map(s => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" title={s.label} aria-label={s.label}>
              {s.icon}
            </a>
          ))}
        </div>
      )}
    </footer>
  );
}
