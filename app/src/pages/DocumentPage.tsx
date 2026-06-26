import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import DocRenderer from '../components/DocRenderer';
import { FiFileText, FiRotateCcw, FiHelpCircle, FiShield } from 'react-icons/fi';

interface Doc { title: string; content: string; updated_at: string }

const META: Record<string, { icon: React.ReactNode; tag: string }> = {
  terms: { icon: <FiShield />, tag: 'Legal' },
  'refund-policy': { icon: <FiRotateCcw />, tag: 'Legal' },
  faq: { icon: <FiHelpCircle />, tag: 'Support' },
  help: { icon: <FiHelpCircle />, tag: 'Support' },
};

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

  const meta = META[slug] ?? { icon: <FiFileText />, tag: 'Info' };
  const updated = new Date(doc.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="doc-page">
      <header className="doc-hero">
        <div className="doc-hero-icon">{meta.icon}</div>
        <span className="doc-hero-tag">{meta.tag}</span>
        <h1>{doc.title}</h1>
        <p className="doc-hero-meta">{settings.site_name} · Last updated {updated}</p>
      </header>

      <article className="content-card doc-article">
        <div className="legal-body">
          <DocRenderer content={doc.content} />
        </div>
        {settings.contact_email && (
          <div className="doc-contact">
            Still need help? Email <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>.
          </div>
        )}
      </article>
    </div>
  );
}
