import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ContentPage } from '../types';
import { FiCompass, FiArrowRight } from 'react-icons/fi';

export default function Explore() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('content_pages')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (data) setPages(data as ContentPage[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Explore</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Interactive lessons and guides to learn beyond the courses.
        </p>
      </div>

      {pages.length === 0 ? (
        <div className="empty-state">
          <FiCompass />
          <h3>Nothing to explore yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Check back soon — new content is on the way.</p>
        </div>
      ) : (
        <div className="row g-3">
          {pages.map(p => (
            <div className="col-md-6 col-lg-4" key={p.id}>
              <Link to={`/explore/${p.slug}`} className="explore-card">
                {p.cover_image ? (
                  <div className="explore-cover" style={{ backgroundImage: `url(${p.cover_image})` }} />
                ) : (
                  <div className="explore-cover explore-cover-fallback"><span>{p.icon}</span></div>
                )}
                <div className="explore-body">
                  <div className="explore-title">
                    <span className="explore-icon">{p.icon}</span>
                    {p.title}
                  </div>
                  {p.summary && <p className="explore-summary">{p.summary}</p>}
                  <span className="explore-link">Open <FiArrowRight /></span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
