import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FiBell, FiCheck } from 'react-icons/fi';

interface Notification {
  id: string;
  title: string;
  body: string;
  icon: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (data) setItems(data as Notification[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = items.filter(i => !i.read).length;

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    setItems(items.map(i => ({ ...i, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
  };

  const openItem = async (n: Notification) => {
    if (!n.read) {
      setItems(items.map(i => (i.id === n.id ? { ...i, read: true } : i)));
      await supabase.from('notifications').update({ read: true }).eq('id', n.id);
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="header-btn" title="Notifications" onClick={() => { setOpen(o => !o); if (!open) load(); }}>
        <FiBell />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-head">
            <span>Notifications</span>
            {unread > 0 && <button className="notif-markall" onClick={markAllRead}><FiCheck /> Mark all read</button>}
          </div>
          <div className="notif-list">
            {items.length === 0 ? (
              <div className="notif-empty">You're all caught up 🎉</div>
            ) : (
              items.map(n => (
                <button key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => openItem(n)}>
                  <span className="notif-icon">{n.icon}</span>
                  <span className="notif-body">
                    <span className="notif-title">{n.title}</span>
                    {n.body && <span className="notif-text">{n.body}</span>}
                    <span className="notif-time">{timeAgo(n.created_at)}</span>
                  </span>
                  {!n.read && <span className="notif-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
