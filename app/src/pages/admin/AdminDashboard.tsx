import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiUsers, FiBook, FiCreditCard, FiTrendingUp, FiPlus, FiArrowRight,
  FiUserCheck, FiBarChart2, FiActivity, FiAward,
} from 'react-icons/fi';

interface Stats {
  totalUsers: number;
  students: number;
  admins: number;
  activeStudents: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  pendingCourses: number;
  approvedCourses: number;
  rejectedCourses: number;
  freeCourses: number;
  activeSubscriptions: number;
  revenue: number;
  enrollments: number;
  todayLogins: number;
}

const emptyStats: Stats = {
  totalUsers: 0, students: 0, admins: 0, activeStudents: 0,
  totalCourses: 0, publishedCourses: 0, draftCourses: 0, pendingCourses: 0,
  approvedCourses: 0, rejectedCourses: 0, freeCourses: 0,
  activeSubscriptions: 0, revenue: 0, enrollments: 0, todayLogins: 0,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [profilesRes, coursesRes, subsRes, enrollRes, loginsRes] = await Promise.all([
      supabase.from('profiles').select('id, role, is_active'),
      supabase.from('courses').select('id, title, category, status, is_free, created_at').order('created_at', { ascending: false }),
      supabase.from('user_subscriptions').select('id, plan:subscription_plans(price)').eq('status', 'active'),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      supabase.from('login_history').select('id', { count: 'exact', head: true }).gte('login_at', todayStart.toISOString()),
    ]);

    const profiles = profilesRes.data ?? [];
    const courses = coursesRes.data ?? [];
    const subs = (subsRes.data ?? []) as any[];

    const byStatus = (s: string) => courses.filter(c => c.status === s).length;
    const revenue = subs.reduce((sum, s) => sum + (s.plan?.price ?? 0), 0);

    setStats({
      totalUsers: profiles.length,
      students: profiles.filter(p => p.role === 'student').length,
      admins: profiles.filter(p => p.role === 'admin').length,
      activeStudents: profiles.filter(p => p.role === 'student' && p.is_active).length,
      totalCourses: courses.length,
      publishedCourses: byStatus('published'),
      draftCourses: byStatus('draft'),
      pendingCourses: byStatus('pending_review'),
      approvedCourses: byStatus('approved'),
      rejectedCourses: byStatus('rejected'),
      freeCourses: courses.filter(c => c.is_free).length,
      activeSubscriptions: subs.length,
      revenue,
      enrollments: enrollRes.count ?? 0,
      todayLogins: loginsRes.count ?? 0,
    });

    setRecentCourses(courses.slice(0, 5));
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Admin';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const kpis = [
    {
      label: 'Total Users', value: stats.totalUsers, icon: <FiUsers />, accent: 'blue',
      sub: `${stats.students} student${stats.students === 1 ? '' : 's'} · ${stats.admins} admin${stats.admins === 1 ? '' : 's'}`,
    },
    {
      label: 'Courses', value: stats.totalCourses, icon: <FiBook />, accent: 'green',
      sub: `${stats.publishedCourses} published · ${stats.pendingCourses} pending`,
    },
    {
      label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: <FiCreditCard />, accent: 'purple',
      sub: `₹${stats.revenue.toLocaleString()} active revenue`,
    },
    {
      label: 'Enrollments', value: stats.enrollments, icon: <FiTrendingUp />, accent: 'orange',
      sub: `${stats.activeStudents} active learner${stats.activeStudents === 1 ? '' : 's'}`,
    },
  ];

  const pipeline = [
    { label: 'Published', value: stats.publishedCourses, color: '#16a34a' },
    { label: 'Approved', value: stats.approvedCourses, color: '#0891b2' },
    { label: 'Pending Review', value: stats.pendingCourses, color: '#d97706' },
    { label: 'Draft', value: stats.draftCourses, color: '#64748b' },
    { label: 'Rejected', value: stats.rejectedCourses, color: '#dc2626' },
  ];
  const pipelineTotal = stats.totalCourses || 1;

  const quickActions = [
    { label: 'New Course', icon: <FiPlus />, to: '/admin/courses/new', primary: true },
    { label: 'Manage Users', icon: <FiUsers />, to: '/admin/users' },
    { label: 'Subscriptions', icon: <FiCreditCard />, to: '/admin/subscriptions' },
    { label: 'View Reports', icon: <FiBarChart2 />, to: '/admin/mis/users' },
  ];

  const snapshot = [
    { label: 'Active students', value: stats.activeStudents, icon: <FiUserCheck />, color: '#16a34a' },
    { label: 'Logins today', value: stats.todayLogins, icon: <FiActivity />, color: '#4f46e5' },
    { label: 'Free courses', value: stats.freeCourses, icon: <FiAward />, color: '#d97706' },
  ];

  return (
    <div>
      {/* Greeting header */}
      <div className="dashboard-header">
        <div>
          <h2>Welcome back, {firstName} 👋</h2>
          <p>{today}</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/admin/courses/new')}>
          <FiPlus style={{ marginRight: 6 }} /> New Course
        </button>
      </div>

      {/* KPI cards */}
      <div className="row g-3 mb-4">
        {kpis.map(kpi => (
          <div className="col-6 col-xl-3" key={kpi.label}>
            <div className={`stat-card stat-card-accent ${kpi.accent}`}>
              <div className={`stat-icon ${kpi.accent}`}>{kpi.icon}</div>
              <div className="stat-content">
                <h4>{kpi.label}</h4>
                <div className="stat-number">{kpi.value.toLocaleString()}</div>
                <div className="stat-sub">{kpi.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Recent courses */}
        <div className="col-lg-8">
          <div className="content-card" style={{ height: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Recent Courses</h3>
              <button className="btn-link-arrow" onClick={() => navigate('/admin/courses')}>
                View all <FiArrowRight />
              </button>
            </div>

            {recentCourses.length === 0 ? (
              <div className="dash-empty">
                <FiBook />
                <h4>No courses yet</h4>
                <p>Create your first course to get started.</p>
                <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => navigate('/admin/courses/new')}>
                  <FiPlus style={{ marginRight: 6 }} /> Create Course
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCourses.map(course => (
                      <tr
                        key={course.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/courses/${course.id}`)}
                      >
                        <td style={{ fontWeight: 600 }}>{course.title}</td>
                        <td>{course.category}</td>
                        <td>
                          <span className={`status-badge ${course.status}`}>
                            {course.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(course.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="col-lg-4">
          {/* Quick actions */}
          <div className="content-card mb-3">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }}>Quick Actions</h3>
            <div className="quick-actions">
              {quickActions.map(a => (
                <button
                  key={a.label}
                  className={`quick-action ${a.primary ? 'primary' : ''}`}
                  onClick={() => navigate(a.to)}
                >
                  <span className="quick-action-icon">{a.icon}</span>
                  <span>{a.label}</span>
                  <FiArrowRight className="quick-action-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Platform snapshot */}
          <div className="content-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }}>Platform Snapshot</h3>
            <div className="snapshot-list">
              {snapshot.map(s => (
                <div className="snapshot-row" key={s.label}>
                  <span className="snapshot-icon" style={{ background: `${s.color}18`, color: s.color }}>
                    {s.icon}
                  </span>
                  <span className="snapshot-label">{s.label}</span>
                  <span className="snapshot-value">{s.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course pipeline */}
      <div className="content-card mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Course Pipeline</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {stats.totalCourses} total
          </span>
        </div>

        {stats.totalCourses === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            No course data yet — the pipeline fills as courses are created.
          </p>
        ) : (
          <>
            <div className="pipeline-bar">
              {pipeline.filter(p => p.value > 0).map(p => (
                <div
                  key={p.label}
                  className="pipeline-seg"
                  style={{ width: `${(p.value / pipelineTotal) * 100}%`, background: p.color }}
                  title={`${p.label}: ${p.value}`}
                />
              ))}
            </div>
            <div className="pipeline-legend">
              {pipeline.map(p => (
                <div className="pipeline-legend-item" key={p.label}>
                  <span className="dot" style={{ background: p.color }} />
                  <span className="pl-label">{p.label}</span>
                  <span className="pl-value">{p.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
