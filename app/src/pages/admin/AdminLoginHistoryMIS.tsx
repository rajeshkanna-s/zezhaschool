import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FiDownload, FiSearch, FiClock, FiUser, FiShield } from 'react-icons/fi';
import { exportToExcel } from '../../utils/exportExcel';

interface LoginRecord {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  login_at: string;
  status: string;
}

export default function AdminLoginHistoryMIS() {
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('login_history')
      .select('*')
      .order('login_at', { ascending: false })
      .limit(1000);
    if (data) setRecords(data);
    setLoading(false);
  };

  const filtered = records.filter(r => {
    if (search) {
      const s = search.toLowerCase();
      if (!r.full_name.toLowerCase().includes(s) && !r.email.toLowerCase().includes(s)) return false;
    }
    if (roleFilter !== 'all' && r.role !== roleFilter) return false;
    if (dateFrom && new Date(r.login_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(r.login_at) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogins = records.filter(r => r.login_at.slice(0, 10) === todayStr).length;
  const uniqueUsersToday = new Set(records.filter(r => r.login_at.slice(0, 10) === todayStr).map(r => r.user_id)).size;
  const studentLogins = records.filter(r => r.role === 'student').length;
  const adminLogins = records.filter(r => r.role === 'admin').length;

  const handleExport = () => {
    exportToExcel(
      filtered.map((r, i) => ({
        sno: i + 1,
        full_name: r.full_name,
        email: r.email,
        role: r.role,
        login_at: new Date(r.login_at).toLocaleString(),
        status: r.status,
      })),
      [
        { key: 'sno', header: 'S.No' },
        { key: 'full_name', header: 'Full Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
        { key: 'login_at', header: 'Login Date & Time' },
        { key: 'status', header: 'Status' },
      ],
      `Login_History_MIS_${new Date().toISOString().slice(0, 10)}`,
      'Login History'
    );
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
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Login History MIS</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Showing {filtered.length} of {records.length} login records
          </p>
        </div>
        <button className="btn btn-success" onClick={handleExport} style={{ width: 'auto' }}>
          <FiDownload style={{ marginRight: 6 }} /> Export Excel
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Logins', value: records.length, icon: <FiClock />, bg: '#dbeafe', color: '#2563eb' },
          { label: "Today's Logins", value: todayLogins, icon: <FiClock />, bg: '#dcfce7', color: '#16a34a' },
          { label: 'Unique Users Today', value: uniqueUsersToday, icon: <FiUser />, bg: '#f3e8ff', color: '#7c3aed' },
          { label: 'Student Logins', value: studentLogins, icon: <FiUser />, bg: '#fef3c7', color: '#d97706' },
          { label: 'Admin Logins', value: adminLogins, icon: <FiShield />, bg: '#fee2e2', color: '#dc2626' },
        ].map(stat => (
          <div className="col-6 col-md-4 col-lg" key={stat.label}>
            <div className="content-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: stat.bg, color: stat.color, borderRadius: 10, padding: 10, fontSize: '1.2rem' }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="content-card mb-4" style={{ padding: '16px 20px' }}>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Search</label>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="form-control" placeholder="Name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, fontSize: '0.88rem' }} />
            </div>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Role</label>
            <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value as 'all' | 'student' | 'admin')} style={{ fontSize: '0.88rem' }}>
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>From Date</label>
            <input type="date" className="form-control" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ fontSize: '0.88rem' }} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>To Date</label>
            <input type="date" className="form-control" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ fontSize: '0.88rem' }} />
          </div>
          <div className="col-6 col-md-2">
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { setSearch(''); setRoleFilter('all'); setDateFrom(''); setDateTo(''); }}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state"><FiClock /><h3>No login records found</h3></div>
      ) : (
        <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Login Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{r.full_name}</td>
                    <td>{r.email}</td>
                    <td>
                      <span style={{
                        background: r.role === 'admin' ? '#fee2e2' : '#dbeafe',
                        color: r.role === 'admin' ? '#dc2626' : '#2563eb',
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                      }}>
                        {r.role}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.login_at).toLocaleString()}</td>
                    <td>
                      <span style={{
                        background: r.status === 'success' ? '#dcfce7' : '#fee2e2',
                        color: r.status === 'success' ? '#16a34a' : '#dc2626',
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                      }}>
                        {r.status}
                      </span>
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
