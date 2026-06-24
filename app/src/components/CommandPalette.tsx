import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getRecent, recordRecent } from '../lib/recent';
import { FiSearch, FiClock, FiCornerDownLeft } from 'react-icons/fi';

interface Result { group: string; title: string; subtitle: string; to: string; icon: string }
interface NavItem { label: string; to: string; icon: string }

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: '🏠' },
  { label: 'Courses', to: '/admin/courses', icon: '📚' },
  { label: 'Pages', to: '/admin/pages', icon: '📄' },
  { label: 'Missions', to: '/admin/missions', icon: '🚀' },
  { label: 'Users', to: '/admin/users', icon: '👥' },
  { label: 'Subscriptions', to: '/admin/subscriptions', icon: '💳' },
  { label: 'Site Settings', to: '/admin/site-settings', icon: '⚙️' },
  { label: 'User MIS Report', to: '/admin/mis/users', icon: '📊' },
  { label: 'Subscription MIS Report', to: '/admin/mis/subscriptions', icon: '📊' },
  { label: 'Login History MIS', to: '/admin/mis/login-history', icon: '📊' },
  { label: 'Courses MIS Report', to: '/admin/mis/courses', icon: '📊' },
];

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: '🏠' },
  { label: 'Courses', to: '/courses', icon: '📚' },
  { label: 'Explore', to: '/explore', icon: '🧭' },
  { label: 'Missions', to: '/missions', icon: '🚀' },
  { label: 'My Learning', to: '/my-learning', icon: '📖' },
  { label: 'Subscription', to: '/subscription', icon: '💳' },
  { label: 'Certificates', to: '/certificates', icon: '🏅' },
  { label: 'Settings', to: '/settings', icon: '⚙️' },
  { label: 'Help & Support', to: '/help', icon: '❓' },
];

export default function CommandPalette({ scope }: { scope: 'student' | 'admin' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const nav = scope === 'admin' ? ADMIN_NAV : STUDENT_NAV;

  const close = useCallback(() => { setOpen(false); setQuery(''); setResults([]); setActive(0); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !open)) {
        e.preventDefault(); setOpen(true);
      } else if (e.key === 'Escape' && open) { close(); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen as EventListener);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen as EventListener);
    };
  }, [open, close]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  // Build results: menu navigation always; content search for students.
  useEffect(() => {
    if (!open) return;
    const q = query.trim().toLowerCase();

    const navResults: Result[] = nav
      .filter(n => !q || n.label.toLowerCase().includes(q))
      .map(n => ({ group: 'Go to', title: n.label, subtitle: 'Page', to: n.to, icon: n.icon }));

    if (!q) {
      const recents: Result[] = getRecent().map(r => ({ group: 'Recent', title: r.title, subtitle: 'Recent', to: r.to, icon: r.icon }));
      setResults([...navResults, ...recents]);
      setActive(0);
      return;
    }

    if (scope === 'admin') {
      setResults(navResults);
      setActive(0);
      return;
    }

    // Student: nav + content search
    setLoading(true);
    const t = setTimeout(async () => {
      const like = `%${q}%`;
      const [courses, pages, missions] = await Promise.all([
        supabase.from('courses').select('id,title,category').eq('status', 'published').ilike('title', like).limit(5),
        supabase.from('content_pages').select('id,slug,title,icon').eq('status', 'published').ilike('title', like).limit(5),
        supabase.from('missions').select('id,slug,title,icon').eq('status', 'published').ilike('title', like).limit(5),
      ]);
      const out: Result[] = [...navResults];
      (courses.data ?? []).forEach((c: any) => out.push({ group: 'Courses', title: c.title, subtitle: c.category, to: `/courses/${c.id}`, icon: '📚' }));
      (pages.data ?? []).forEach((p: any) => out.push({ group: 'Explore', title: p.title, subtitle: 'Page', to: `/explore/${p.slug}`, icon: p.icon || '📄' }));
      (missions.data ?? []).forEach((m: any) => out.push({ group: 'Missions', title: m.title, subtitle: 'Mission', to: `/missions/${m.slug}`, icon: m.icon || '🚀' }));
      setResults(out);
      setActive(0);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [query, open, scope, nav]);

  const choose = (r: Result) => {
    if (r.group !== 'Go to') recordRecent({ type: 'page', title: r.title, to: r.to, icon: r.icon });
    close();
    navigate(r.to);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); choose(results[active]); }
  };

  if (!open) return null;

  let lastGroup = '';
  return (
    <div className="cmdk-overlay" onMouseDown={close}>
      <div className="cmdk" onMouseDown={e => e.stopPropagation()}>
        <div className="cmdk-input-row">
          <FiSearch />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={scope === 'admin' ? 'Jump to a page…' : 'Search pages, courses, missions…'}
          />
          <kbd>esc</kbd>
        </div>
        <div className="cmdk-results">
          {results.length === 0 ? (
            <div className="cmdk-empty">{loading ? 'Searching…' : 'No matches found'}</div>
          ) : (
            results.map((r, i) => {
              const showHeader = r.group !== lastGroup && (lastGroup = r.group, true);
              return (
                <div key={r.to + i}>
                  {showHeader && <div className="cmdk-group">{r.group === 'Recent' ? <><FiClock /> Recent</> : r.group}</div>}
                  <button className={`cmdk-item ${i === active ? 'active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => choose(r)}>
                    <span className="cmdk-icon">{r.icon}</span>
                    <span className="cmdk-text">
                      <span className="cmdk-title">{r.title}</span>
                      <span className="cmdk-sub">{r.subtitle}</span>
                    </span>
                    {i === active && <FiCornerDownLeft className="cmdk-enter" />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
