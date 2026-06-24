import { useState } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { FiInfo, FiX } from 'react-icons/fi';

export default function AnnouncementBanner() {
  const { settings } = useSiteSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!settings.announcement_active || !settings.announcement.trim() || dismissed) return null;

  // Dismiss is remembered per-message so a new announcement reappears
  const key = `announce-dismissed:${settings.announcement}`;
  if (localStorage.getItem(key) === '1') return null;

  const dismiss = () => { localStorage.setItem(key, '1'); setDismissed(true); };

  return (
    <div className={`announce-banner ${settings.announcement_variant}`}>
      <FiInfo />
      <span>{settings.announcement}</span>
      <button className="announce-close" onClick={dismiss} aria-label="Dismiss"><FiX /></button>
    </div>
  );
}
