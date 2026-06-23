import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { ContentPage } from '../../types';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFileText, FiSearch } from 'react-icons/fi';

export default function AdminPages() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase
      .from('content_pages')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) setPages(data as ContentPage[]);
    setLoading(false);
  };

  const remove = async (page: ContentPage) => {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('content_pages').delete().eq('id', page.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Page deleted');
    setPages(p => p.filter(x => x.id !== page.id));
  };

  const filtered = pages.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!p.title.toLowerCase().includes(s) && !p.slug.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const published = pages.filter(p => p.status === 'published').length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Content Pages</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            {pages.length} page{pages.length === 1 ? '' : 's'} · {published} published
          </p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/admin/pages/new')}>
          <FiPlus style={{ marginRight: 6 }} /> New Page
        </button>
      </div>

      {/* Filters */}
      <div className="content-card mb-3" style={{ padding: '14px 18px' }}>
        <div className="row g-2 align-items-end">
          <div className="col-md-8">
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-control" placeholder="Search title or slug…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
            </div>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="content-card dash-empty">
          <FiFileText />
          <h4>No pages found</h4>
          <p>Create a content page to build out your learning platform.</p>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => navigate('/admin/pages/new')}>
            <FiPlus style={{ marginRight: 6 }} /> New Page
          </button>
        </div>
      ) : (
        <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Slug</th>
                  <th>Blocks</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                        <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>/explore/{p.slug}</td>
                    <td>{Array.isArray(p.blocks) ? p.blocks.length : 0}</td>
                    <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(p.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {p.status === 'published' && (
                          <button className="row-action" title="View live" onClick={() => window.open(`/explore/${p.slug}`, '_blank')}><FiEye /></button>
                        )}
                        <button className="row-action" title="Edit" onClick={() => navigate(`/admin/pages/${p.id}`)}><FiEdit2 /></button>
                        <button className="row-action danger" title="Delete" onClick={() => remove(p)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
