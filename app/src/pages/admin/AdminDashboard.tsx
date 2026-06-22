import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiUsers, FiBook, FiCreditCard, FiTrendingUp } from 'react-icons/fi';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  pendingCourses: number;
  activeSubscriptions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    publishedCourses: 0,
    pendingCourses: 0,
    activeSubscriptions: 0,
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [usersRes, coursesRes, publishedRes, pendingRes, subsRes, recentRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('courses').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      totalCourses: coursesRes.count || 0,
      publishedCourses: publishedRes.count || 0,
      pendingCourses: pendingRes.count || 0,
      activeSubscriptions: subsRes.count || 0,
    });

    if (recentRes.data) setRecentCourses(recentRes.data);
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
      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon blue"><FiUsers /></div>
            <div className="stat-content">
              <h4>Total Users</h4>
              <div className="stat-number">{stats.totalUsers}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon green"><FiBook /></div>
            <div className="stat-content">
              <h4>Courses</h4>
              <div className="stat-number">{stats.totalCourses}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon orange"><FiTrendingUp /></div>
            <div className="stat-content">
              <h4>Pending Review</h4>
              <div className="stat-number">{stats.pendingCourses}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon purple"><FiCreditCard /></div>
            <div className="stat-content">
              <h4>Active Subs</h4>
              <div className="stat-number">{stats.activeSubscriptions}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Courses</h3>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/courses/new')}>
            + New Course
          </button>
        </div>

        {recentCourses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No courses yet</p>
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
                    <td>{new Date(course.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
