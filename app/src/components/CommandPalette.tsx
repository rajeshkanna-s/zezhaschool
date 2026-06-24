import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getRecent, recordRecent } from '../lib/recent';
import { FiSearch, FiClock, FiCornerDownLeft } from 'react-icons/fi';

interface Result { type: 'course' | 'page' | 'mission'; title: string; subtitle: string; to: string; icon: string }

const typeLabel: Record<string, string> = { course: 'Courses', page: 'Explore', mission: 'Missions' };

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => { setOpen(false); setQuery(''); setResults([]); setActive(0); }, []);

  // Open via shortcut, "/", or custom event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !open)) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape' && open) {
        close();
      }
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

  // Search (debounced)
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setResults(getRecent().map(r => ({ type: r.type, title: r.title, subtitle: 'Recent', to: r.to, icon: r.icon })));
      setActive(0);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const like = `%${q}%`;
      const [courses, pages, missions] = await Promise.all([
        supabase.from('courses').select('id,title,category').eq('status', 'published').ilike('title', like).limit(5),
        supabase.from('content_pages').select('id,slug,title,icon').eq('status', 'published').ilike('title', like).limit(5),
        supabase.from('missions').select('id,slug,title,icon').eq('status', 'published').ilike('title', like).limit(5),
      ]);
      const out: Result[] = [];
      (courses.data ?? []).forEach((c: any) => out.push({ type: 'course', title: c.title, subtitle: c.category, to: `/courses/${c.id}`, icon: '📚' }));
      (pages.data ?? []).forEach((p: any) => out.push({ type: 'page', title: p.title, subtitle: 'Explore', to: `/explore/${p.slug}`, icon: p.icon || '📄' }));
      (missions.data ?? []).forEach((m: any) => out.push({ type: 'mission', title: m.title, subtitle: 'Mission', to: `/missions/${m.slug}`, icon: m.icon || '🚀' }));
      setResults(out);
      setActive(0);
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [query, open]);

  const choose = (r: Result) => {
    recordRecent({ type: r.type, title: r.title, to: r.to, icon: r.icon });
    close();
    navigate(r.to);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); choose(results[active]); }
  };

  if (!open) return null;

  let lastType = '';
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
            placeholder="Search courses, pages, missions…"
          />
          <kbd>esc</kbd>
        </div>
        <div className="cmdk-results">
          {results.length === 0 ? (
            <div className="cmdk-empty">{loading ? 'Searching…' : query ? 'No matches found' : 'Type to search'}</div>
          ) : (
            results.map((r, i) => {
              const showHeader = r.subtitle === 'Recent' ? (lastType !== 'recent' && (lastType = 'recent', true)) : (lastType !== r.type && (lastType = r.type, true));
              return (
                <div key={r.to + i}>
                  {showHeader && <div className="cmdk-group">{r.subtitle === 'Recent' ? <><FiClock /> Recent</> : typeLabel[r.type]}</div>}
                  <button
                    className={`cmdk-item ${i === active ? 'active' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(r)}
                  >
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
