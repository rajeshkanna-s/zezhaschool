import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import { FiUsers, FiSearch } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setUsers(data);
    setLoading(false);
  };

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile.includes(search)
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>User Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{users.length} registered users</p>
        </div>
        <div style={{ position: 'relative', minWidth: 260 }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FiUsers />
          <h3>No users found</h3>
        </div>
      ) : (
        <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 600 }}>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.mobile}</td>
                    <td>
                      <span
                        style={{
                          background: user.role === 'admin' ? '#fee2e2' : '#dbeafe',
                          color: user.role === 'admin' ? '#dc2626' : '#2563eb',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: user.is_active ? '#dcfce7' : '#fee2e2',
                          color: user.is_active ? '#16a34a' : '#dc2626',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
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
