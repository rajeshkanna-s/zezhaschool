import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeMode, Density } from '../contexts/ThemeContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

/**
 * Bridges auth with theme + site settings:
 *  - On login, refetches site settings (so a fresh session sees the current
 *    announcement / maintenance state) and loads THIS user's saved theme,
 *    so appearance is per-account, never shared between accounts.
 *  - Persists the user's theme changes back to their own preferences.
 */
export default function SessionSync() {
  const { user } = useAuth();
  const { mode, accent, density, setMode, setAccentId, setDensity } = useTheme();
  const { refresh } = useSiteSettings();
  const hydratedFor = useRef<string | null>(null);
  const lastSig = useRef<string>('');

  // On login: refetch site settings + apply this user's own theme
  useEffect(() => {
    if (!user) { hydratedFor.current = null; return; }
    refresh();
    if (hydratedFor.current === user.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('theme_mode,theme_accent,theme_density')
        .eq('user_id', user.id).maybeSingle();
      if (cancelled) return;
      // Default to system/indigo/comfortable so a user never inherits the
      // previous account's theme from shared browser storage.
      const m = (data?.theme_mode as ThemeMode) || 'system';
      const a = data?.theme_accent || 'indigo';
      const d = (data?.theme_density as Density) || 'comfortable';
      lastSig.current = `${m}|${a}|${d}`;
      hydratedFor.current = user.id;
      setMode(m); setAccentId(a); setDensity(d);
    })();
    return () => { cancelled = true; };
  }, [user, refresh, setMode, setAccentId, setDensity]);

  // Persist the user's own theme changes (await/.then so the request fires —
  // the supabase query builder is lazy and won't run otherwise)
  useEffect(() => {
    if (!user || hydratedFor.current !== user.id) return;
    const sig = `${mode}|${accent.id}|${density}`;
    if (sig === lastSig.current) return;
    lastSig.current = sig;
    const uid = user.id;
    (async () => {
      await supabase.from('user_preferences').upsert(
        { user_id: uid, theme_mode: mode, theme_accent: accent.id, theme_density: density, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    })();
  }, [mode, accent.id, density, user]);

  return null;
}
