import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';

export interface Accent {
  id: string;
  name: string;
  primary: string;
  hover: string;
  light: string;     // tint used in light mode
  lightDark: string; // tint used in dark mode
}

export const ACCENTS: Accent[] = [
  { id: 'indigo', name: 'Indigo', primary: '#4f46e5', hover: '#4338ca', light: '#eef2ff', lightDark: '#1e1b4b' },
  { id: 'blue', name: 'Blue', primary: '#2563eb', hover: '#1d4ed8', light: '#eff6ff', lightDark: '#172554' },
  { id: 'violet', name: 'Violet', primary: '#7c3aed', hover: '#6d28d9', light: '#f5f3ff', lightDark: '#2e1065' },
  { id: 'emerald', name: 'Emerald', primary: '#059669', hover: '#047857', light: '#ecfdf5', lightDark: '#064e3b' },
  { id: 'rose', name: 'Rose', primary: '#e11d48', hover: '#be123c', light: '#fff1f2', lightDark: '#4c0519' },
  { id: 'amber', name: 'Amber', primary: '#d97706', hover: '#b45309', light: '#fffbeb', lightDark: '#451a03' },
];

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  accent: Accent;
  density: Density;
  setMode: (m: ThemeMode) => void;
  setAccentId: (id: string) => void;
  setDensity: (d: Density) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyToDocument(resolved: 'light' | 'dark', accent: Accent, density: Density) {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-density', density);
  root.style.setProperty('--primary', accent.primary);
  root.style.setProperty('--primary-hover', accent.hover);
  root.style.setProperty('--primary-light', resolved === 'dark' ? accent.lightDark : accent.light);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(
    () => (localStorage.getItem('theme-mode') as ThemeMode) || 'system'
  );
  const [accentId, setAccentIdState] = useState<string>(
    () => localStorage.getItem('theme-accent') || 'indigo'
  );
  const [density, setDensityState] = useState<Density>(
    () => (localStorage.getItem('theme-density') as Density) || 'comfortable'
  );
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  const accent = ACCENTS.find(a => a.id === accentId) ?? ACCENTS[0];
  const resolved: 'light' | 'dark' = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  // React to OS theme changes when in "system" mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Apply + persist
  useEffect(() => { applyToDocument(resolved, accent, density); }, [resolved, accent, density]);
  useEffect(() => { localStorage.setItem('theme-mode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('theme-accent', accentId); }, [accentId]);
  useEffect(() => { localStorage.setItem('theme-density', density); }, [density]);

  const setMode = useCallback((m: ThemeMode) => setModeState(m), []);
  const setAccentId = useCallback((id: string) => setAccentIdState(id), []);
  const setDensity = useCallback((d: Density) => setDensityState(d), []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, accent, density, setMode, setAccentId, setDensity }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
