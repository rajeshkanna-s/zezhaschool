import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import DocRenderer, { docSlug } from '../components/DocRenderer';
import { FiFileText, FiRotateCcw, FiHelpCircle, FiShield, FiList } from 'react-icons/fi';

interface Doc { title: string; content: string; updated_at: string }
interface Heading { level: number; text: string; id: string }

const META: Record<string, { icon: React.ReactNode; tag: string }> = {
  terms: { icon: <FiShield />, tag: 'Legal' },
  'refund-policy': { icon: <FiRotateCcw />, tag: 'Legal' },
  faq: { icon: <FiHelpCircle />, tag: 'Support' },
  help: { icon: <FiHelpCircle />, tag: 'Support' },
};

function extractHeadings(content: string): Heading[] {
  return content.replace(/\r\n/g, '\n').split('\n').map(l => l.trim())
    .filter(l => l.startsWith('# ') || l.startsWith('## '))
    .map(l => {
      const level = l.startsWith('## ') ? 2 : 1;
      const text = l.replace(/^#+\s/, '');
      return { level, text, id: docSlug(text) };
    });
}

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
  const headings = extractHeadings(doc.content);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="doc-shell">
      <header className="doc-header">
        <div className="doc-header-icon">{meta.icon}</div>
        <div>
          <span className="doc-eyebrow">{meta.tag}</span>
          <h1>{doc.title}</h1>
          <p className="doc-meta">{settings.site_name} · Last updated {updated}</p>
        </div>
      </header>

      <div className={`doc-grid ${headings.length > 1 ? '' : 'no-toc'}`}>
        {headings.length > 1 && (
          <aside className="doc-toc">
            <div className="doc-toc-title"><FiList /> On this page</div>
            <nav>
              {headings.map(h => (
                <button key={h.id} className={`doc-toc-link lvl${h.level}`} onClick={() => jump(h.id)}>
                  {h.text}
                </button>
              ))}
            </nav>
          </aside>
        )}

        <article className="content-card doc-content">
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
    </div>
  );
}
