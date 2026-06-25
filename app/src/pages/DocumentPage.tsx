import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import DocRenderer from '../components/DocRenderer';

interface Doc { title: string; content: string; updated_at: string }

export default function DocumentPage({ slug }: { slug: string }) {
  const { settings } = useSiteSettings();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('site_documents').select('title, content, updated_at').eq('slug', slug).maybeSingle();
      if (!cancelled) { setDoc(data ?? null); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}><div className="spinner" /></div>;
  }
  if (!doc) {
    return <div className="empty-state"><h3>Page not available</h3></div>;
  }

  const updated = new Date(doc.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="legal-page">
      <div className="content-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{doc.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 18 }}>
          {settings.site_name} · Last updated {updated}
        </p>
        <div className="legal-body">
          <DocRenderer content={doc.content} />
        </div>
        {settings.contact_email && (
          <p style={{ marginTop: 18, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Questions? Contact us at <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>.
          </p>
        )}
      </div>
    </div>
  );
}
