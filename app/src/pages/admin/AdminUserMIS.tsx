import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import { FiDownload, FiSearch, FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';
import { exportToExcel } from '../../utils/exportExcel';

export default function AdminUserMIS() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  const filtered = users.filter(u => {
    if (search) {
      const s = search.toLowerCase();
      if (!u.full_name.toLowerCase().includes(s) && !u.email.toLowerCase().includes(s) && !u.mobile.includes(s)) return false;
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.is_active) return false;
    if (statusFilter === 'inactive' && u.is_active) return false;
    if (dateFrom && new Date(u.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(u.created_at) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const totalActive = users.filter(u => u.is_active).length;
  const totalInactive = users.filter(u => !u.is_active).length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  const handleExport = () => {
    exportToExcel(
      filtered.map((u, i) => ({
        sno: i + 1,
        full_name: u.full_name,
        email: u.email,
        mobile: u.mobile,
        role: u.role,
        status: u.is_active ? 'Active' : 'Inactive',
        created_at: new Date(u.created_at).toLocaleString(),
        updated_at: new Date(u.updated_at).toLocaleString(),
      })),
      [
        { key: 'sno', header: 'S.No' },
        { key: 'full_name', header: 'Full Name' },
        { key: 'email', header: 'Email' },
        { key: 'mobile', header: 'Mobile' },
        { key: 'role', header: 'Role' },
        { key: 'status', header: 'Status' },
        { key: 'created_at', header: 'Created Date & Time' },
        { key: 'updated_at', header: 'Last Updated' },
      ],
      `User_MIS_Report_${new Date().toISOString().slice(0, 10)}`,
      'Users'
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
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>User MIS Report</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Showing {filtered.length} of {users.length} users
          </p>
        </div>
        <button className="btn btn-success" onClick={handleExport} style={{ width: 'auto' }}>
          <FiDownload style={{ marginRight: 6 }} /> Export Excel
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Users', value: users.length, icon: <FiUsers />, bg: '#dbeafe', color: '#2563eb' },
          { label: 'Active Users', value: totalActive, icon: <FiUserCheck />, bg: '#dcfce7', color: '#16a34a' },
          { label: 'Inactive Users', value: totalInactive, icon: <FiUserX />, bg: '#fee2e2', color: '#dc2626' },
          { label: 'Students', value: totalStudents, icon: <FiUsers />, bg: '#f3e8ff', color: '#7c3aed' },
          { label: 'Admins', value: totalAdmins, icon: <FiUsers />, bg: '#fef3c7', color: '#d97706' },
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
              <input type="text" className="form-control" placeholder="Name, email, mobile..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, fontSize: '0.88rem' }} />
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
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')} style={{ fontSize: '0.88rem' }}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
          <div className="col-md-1">
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state"><FiUsers /><h3>No users match filters</h3></div>
      ) : (
        <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created Date & Time</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.mobile}</td>
                    <td>
                      <span style={{
                        background: u.role === 'admin' ? '#fee2e2' : '#dbeafe',
                        color: u.role === 'admin' ? '#dc2626' : '#2563eb',
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: u.is_active ? '#dcfce7' : '#fee2e2',
                        color: u.is_active ? '#16a34a' : '#dc2626',
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
                      }}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(u.created_at).toLocaleString()}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(u.updated_at).toLocaleString()}</td>
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
