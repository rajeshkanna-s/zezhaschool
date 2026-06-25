import { useEffect, useState } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FiInfo, FiX } from 'react-icons/fi';

export default function AnnouncementBanner() {
  const { settings } = useSiteSettings();
  const { user, profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [hasSub, setHasSub] = useState<boolean | null>(null);

  const targeted = settings.announcement_audience !== 'all';

  // Look up subscription status only when the announcement targets a category
  useEffect(() => {
    if (!settings.announcement_active || !targeted || !user) { setHasSub(null); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('user_subscriptions').select('id')
        .eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle();
      if (!cancelled) setHasSub(!!data);
    })();
    return () => { cancelled = true; };
  }, [settings.announcement_active, settings.announcement_audience, targeted, user]);

  if (!settings.announcement_active || !settings.announcement.trim() || dismissed) return null;

  // Audience filtering (admins always see active announcements)
  const isAdmin = profile?.role === 'admin';
  if (!isAdmin && targeted) {
    if (hasSub === null) return null; // status unknown yet — don't flash
    if (settings.announcement_audience === 'subscribers' && !hasSub) return null;
    if (settings.announcement_audience === 'free' && hasSub) return null;
  }

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
