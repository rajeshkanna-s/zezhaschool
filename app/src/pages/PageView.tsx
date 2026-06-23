import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ContentPage } from '../types';
import PageRenderer from '../components/PageRenderer';
import { FiArrowLeft } from 'react-icons/fi';

export default function PageView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error || !data) setNotFound(true);
      else setPage(data as ContentPage);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="empty-state">
        <h3>Page not found</h3>
        <p style={{ color: 'var(--text-muted)' }}>This page may have been unpublished or moved.</p>
        <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => navigate('/explore')}>
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="page-view">
      <button className="btn-link-arrow" style={{ marginBottom: 12 }} onClick={() => navigate('/explore')}>
        <FiArrowLeft /> Explore
      </button>

      <div className="page-view-shell">
        <div className="page-view-header">
          <div className="page-view-icon">{page.icon}</div>
          <h1>{page.title}</h1>
          {page.summary && <p>{page.summary}</p>}
        </div>
        {page.cover_image && <img src={page.cover_image} alt="" className="page-view-cover" />}
        <PageRenderer blocks={page.blocks} />
      </div>
    </div>
  );
}
