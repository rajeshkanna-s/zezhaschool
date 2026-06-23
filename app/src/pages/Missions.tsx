import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Mission } from '../types';
import { FiZap, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function Missions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [xpTotal, setXpTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('missions').select('*').eq('status', 'published')
        .order('order_index', { ascending: true }).order('created_at', { ascending: true });
      if (data) setMissions(data as Mission[]);

      if (user) {
        const { data: prog } = await supabase
          .from('mission_progress').select('mission_id, xp_earned, completed').eq('user_id', user.id);
        if (prog) {
          setDoneIds(new Set(prog.filter(p => p.completed).map(p => p.mission_id)));
          setXpTotal(prog.reduce((s, p) => s + (p.xp_earned || 0), 0));
        }
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}><div className="spinner" /></div>;
  }

  const completed = missions.filter(m => doneIds.has(m.id)).length;

  return (
    <div>
      <div className="missions-hero">
        <div>
          <h2>🚀 Missions</h2>
          <p>Bite-sized, interactive lessons. Learn, play, take the quiz — earn XP.</p>
        </div>
        <div className="missions-hero-stats">
          <div className="missions-stat"><span className="ms-val">⚡ {xpTotal}</span><span className="ms-label">Total XP</span></div>
          <div className="missions-stat"><span className="ms-val">{completed}/{missions.length}</span><span className="ms-label">Completed</span></div>
        </div>
      </div>

      {missions.length === 0 ? (
        <div className="empty-state">
          <FiZap />
          <h3>No missions yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>New missions are on the way — check back soon.</p>
        </div>
      ) : (
        <div className="row g-3">
          {missions.map((m, i) => {
            const done = doneIds.has(m.id);
            return (
              <div className="col-md-6 col-lg-4" key={m.id}>
                <Link to={`/missions/${m.slug}`} className={`mission-tile ${done ? 'done' : ''}`}>
                  <div className="mission-tile-top">
                    <span className="mission-tile-icon">{m.icon}</span>
                    <span className="mission-tile-no">#{i + 1}</span>
                    {done && <span className="mission-tile-done"><FiCheckCircle /> Done</span>}
                  </div>
                  <div className="mission-tile-title">{m.title}</div>
                  {m.summary && <div className="mission-tile-summary">{m.summary}</div>}
                  <div className="mission-tile-foot">
                    <span className="mission-tile-xp">⚡ +{m.xp} XP</span>
                    <span className="mission-tile-go">{done ? 'Replay' : 'Start'} <FiArrowRight /></span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
