import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteSettings {
  site_name: string;
  tagline: string;
  contact_email: string;
  support_url: string;
  announcement: string;
  announcement_active: boolean;
  announcement_variant: 'info' | 'success' | 'warning' | 'danger';
  social_instagram: string;
  social_linkedin: string;
  social_website: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

const DEFAULTS: SiteSettings = {
  site_name: 'ZezhaSchool', tagline: 'Learn & Grow', contact_email: '', support_url: '',
  announcement: '', announcement_active: false, announcement_variant: 'info',
  social_instagram: '', social_linkedin: '', social_website: '',
  maintenance_mode: false,
  maintenance_message: "We're performing scheduled maintenance. Please check back soon.",
};

interface Ctx {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<Ctx | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (data) setSettings({ ...DEFAULTS, ...data });
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
