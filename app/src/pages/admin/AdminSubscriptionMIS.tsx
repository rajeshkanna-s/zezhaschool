import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FiDownload, FiSearch, FiCreditCard, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { exportToExcel } from '../../utils/exportExcel';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#16a34a', '#dc2626', '#64748b', '#4f46e5', '#d97706', '#7c3aed'];

interface SubRecord {
  id: string;
  user_id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
  plan: { name: string; price: number; duration_days: number } | null;
  profile: { full_name: string; email: string; mobile: string } | null;
}

export default function AdminSubscriptionMIS() {
  const [subs, setSubs] = useState<SubRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadSubs();
  }, []);

  const loadSubs = async () => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*, plan:subscription_plans(name, price, duration_days), profile:profiles(full_name, email, mobile)')
      .order('created_at', { ascending: false });
    if (data) setSubs(data as SubRecord[]);
    setLoading(false);
  };

  const filtered = subs.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      if (!(s.profile?.full_name?.toLowerCase().includes(q) || s.profile?.email?.toLowerCase().includes(q) || s.plan?.name?.toLowerCase().includes(q))) return false;
    }
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (dateFrom && new Date(s.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(s.created_at) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const activeSubs = subs.filter(s => s.status === 'active').length;
  const expiredSubs = subs.filter(s => s.status === 'expired').length;
  const cancelledSubs = subs.filter(s => s.status === 'cancelled').length;
  const totalRevenue = subs.filter(s => s.status !== 'cancelled').reduce((sum, s) => sum + (s.plan?.price ?? 0), 0);

  const statusPieData = [
    { name: 'Active', value: activeSubs },
    { name: 'Expired', value: expiredSubs },
    { name: 'Cancelled', value: cancelledSubs },
  ].filter(d => d.value > 0);

  const planData = (() => {
    const plans: Record<string, number> = {};
    subs.forEach(s => {
      const name = s.plan?.name ?? 'Unknown';
      plans[name] = (plans[name] || 0) + 1;
    });
    return Object.entries(plans).map(([name, value]) => ({ name, value }));
  })();

  const monthlyRevenue = (() => {
    const months: Record<string, { month: string; revenue: number; count: number }> = {};
    subs.forEach(s => {
      const m = new Date(s.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!months[m]) months[m] = { month: m, revenue: 0, count: 0 };
      months[m].revenue += s.plan?.price ?? 0;
      months[m].count++;
    });
    return Object.values(months).reverse();
  })();

  const handleExport = () => {
    exportToExcel(
      filtered.map((s, i) => ({
        sno: i + 1,
        full_name: s.profile?.full_name ?? 'N/A',
        email: s.profile?.email ?? 'N/A',
        mobile: s.profile?.mobile ?? 'N/A',
        plan_name: s.plan?.name ?? 'N/A',
        price: `₹${s.plan?.price ?? 0}`,
        duration: `${s.plan?.duration_days ?? 0} days`,
        status: s.status,
        starts_at: new Date(s.starts_at).toLocaleString(),
        expires_at: new Date(s.expires_at).toLocaleString(),
        created_at: new Date(s.created_at).toLocaleString(),
      })),
      [
        { key: 'sno', header: 'S.No' },
        { key: 'full_name', header: 'User Name' },
        { key: 'email', header: 'Email' },
        { key: 'mobile', header: 'Mobile' },
        { key: 'plan_name', header: 'Plan Name' },
        { key: 'price', header: 'Price' },
        { key: 'duration', header: 'Duration' },
        { key: 'status', header: 'Status' },
        { key: 'starts_at', header: 'Start Date & Time' },
        { key: 'expires_at', header: 'Expiry Date & Time' },
        { key: 'created_at', header: 'Subscribed On' },
      ],
      `Subscription_MIS_Report_${new Date().toISOString().slice(0, 10)}`,
      'Subscriptions'
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
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Subscription MIS Report</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Showing {filtered.length} of {subs.length} subscriptions
          </p>
        </div>
        <button className="btn btn-success" onClick={handleExport} style={{ width: 'auto' }}>
          <FiDownload style={{ marginRight: 6 }} /> Export Excel
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Subscriptions', value: subs.length, icon: <FiCreditCard />, bg: '#dbeafe', color: '#2563eb' },
          { label: 'Active', value: activeSubs, icon: <FiCheckCircle />, bg: '#dcfce7', color: '#16a34a' },
          { label: 'Expired', value: expiredSubs, icon: <FiXCircle />, bg: '#fee2e2', color: '#dc2626' },
          { label: 'Cancelled', value: cancelledSubs, icon: <FiXCircle />, bg: '#f1f5f9', color: '#64748b' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <FiCreditCard />, bg: '#fef3c7', color: '#d97706' },
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

      {/* Charts */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="content-card" style={{ padding: '16px' }}>
            <h6 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Subscription Status</h6>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-md-4">
          <div className="content-card" style={{ padding: '16px' }}>
            <h6 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Plan Distribution</h6>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {planData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-md-4">
          <div className="content-card" style={{ padding: '16px' }}>
            <h6 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Monthly Revenue</h6>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="content-card mb-4" style={{ padding: '16px 20px' }}>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Search</label>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="form-control" placeholder="User, email, plan..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, fontSize: '0.88rem' }} />
            </div>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'expired' | 'cancelled')} style={{ fontSize: '0.88rem' }}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
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
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state"><FiCreditCard /><h3>No subscriptions found</h3></div>
      ) : (
        <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th>Subscribed On</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.profile?.full_name ?? 'N/A'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.profile?.email}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.plan?.name ?? 'N/A'}</td>
                    <td>₹{s.plan?.price ?? 0}</td>
                    <td>
                      <span style={{
                        background: s.status === 'active' ? '#dcfce7' : s.status === 'expired' ? '#fee2e2' : '#f1f5f9',
                        color: s.status === 'active' ? '#16a34a' : s.status === 'expired' ? '#dc2626' : '#64748b',
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(s.starts_at).toLocaleString()}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(s.expires_at).toLocaleString()}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(s.created_at).toLocaleString()}</td>
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
