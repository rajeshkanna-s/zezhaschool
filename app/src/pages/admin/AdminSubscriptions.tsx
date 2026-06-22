import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FiCreditCard } from 'react-icons/fi';

interface SubData {
  id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
  plan: { name: string; price: number } | null;
  profile: { full_name: string; email: string } | null;
}

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<SubData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubs();
  }, []);

  const loadSubs = async () => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*, plan:subscription_plans(name, price), profile:profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (data) setSubs(data as any);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 20 }}>Subscription Management</h2>

      {subs.length === 0 ? (
        <div className="empty-state">
          <FiCreditCard />
          <h3>No subscriptions yet</h3>
        </div>
      ) : (
        <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(sub => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sub.profile?.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub.profile?.email}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{sub.plan?.name || 'N/A'}</td>
                    <td>₹{sub.plan?.price || 0}</td>
                    <td>
                      <span
                        style={{
                          background: sub.status === 'active' ? '#dcfce7' : sub.status === 'expired' ? '#fee2e2' : '#f1f5f9',
                          color: sub.status === 'active' ? '#16a34a' : sub.status === 'expired' ? '#dc2626' : '#64748b',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td>{new Date(sub.starts_at).toLocaleDateString()}</td>
                    <td>{new Date(sub.expires_at).toLocaleDateString()}</td>
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
