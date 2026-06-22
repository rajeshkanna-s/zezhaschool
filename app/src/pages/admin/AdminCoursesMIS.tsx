import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../types';
import { FiDownload, FiSearch, FiBook, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { exportToExcel } from '../../utils/exportExcel';

interface CourseWithStats extends Course {
  enrollment_count: number;
  creator_name: string;
}

export default function AdminCoursesMIS() {
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (!coursesData) { setLoading(false); return; }

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id');

    const enrollmentCounts: Record<string, number> = {};
    enrollments?.forEach(e => {
      enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1;
    });

    const creatorIds = [...new Set(coursesData.map(c => c.created_by).filter(Boolean))];
    let creatorsMap: Record<string, string> = {};
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds);
      profiles?.forEach(p => { creatorsMap[p.id] = p.full_name; });
    }

    const enriched: CourseWithStats[] = coursesData.map(c => ({
      ...c,
      enrollment_count: enrollmentCounts[c.id] || 0,
      creator_name: creatorsMap[c.created_by] || 'Unknown',
    }));

    setCourses(enriched);
    setLoading(false);
  };

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];

  const filtered = courses.filter(c => {
    if (search) {
      const s = search.toLowerCase();
      if (!c.title.toLowerCase().includes(s) && !c.category.toLowerCase().includes(s) && !c.creator_name.toLowerCase().includes(s)) return false;
    }
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (dateFrom && new Date(c.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(c.created_at) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const published = courses.filter(c => c.status === 'published').length;
  const draft = courses.filter(c => c.status === 'draft').length;
  const pending = courses.filter(c => c.status === 'pending_review').length;
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollment_count, 0);
  const freeCourses = courses.filter(c => c.is_free).length;

  const handleExport = () => {
    exportToExcel(
      filtered.map((c, i) => ({
        sno: i + 1,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        duration: `${c.duration_hours}h`,
        status: c.status.replace('_', ' '),
        type: c.is_free ? 'Free' : 'Premium',
        enrollments: c.enrollment_count,
        created_by: c.creator_name,
        created_at: new Date(c.created_at).toLocaleString(),
        updated_at: new Date(c.updated_at).toLocaleString(),
      })),
      [
        { key: 'sno', header: 'S.No' },
        { key: 'title', header: 'Course Title' },
        { key: 'category', header: 'Category' },
        { key: 'difficulty', header: 'Difficulty' },
        { key: 'duration', header: 'Duration' },
        { key: 'status', header: 'Status' },
        { key: 'type', header: 'Type' },
        { key: 'enrollments', header: 'Enrollments' },
        { key: 'created_by', header: 'Created By' },
        { key: 'created_at', header: 'Created Date & Time' },
        { key: 'updated_at', header: 'Last Updated' },
      ],
      `Courses_MIS_Report_${new Date().toISOString().slice(0, 10)}`,
      'Courses'
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
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Courses MIS Report</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Showing {filtered.length} of {courses.length} courses
          </p>
        </div>
        <button className="btn btn-success" onClick={handleExport} style={{ width: 'auto' }}>
          <FiDownload style={{ marginRight: 6 }} /> Export Excel
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Courses', value: courses.length, icon: <FiBook />, bg: '#dbeafe', color: '#2563eb' },
          { label: 'Published', value: published, icon: <FiCheckCircle />, bg: '#dcfce7', color: '#16a34a' },
          { label: 'Draft', value: draft, icon: <FiClock />, bg: '#fef3c7', color: '#d97706' },
          { label: 'Pending Review', value: pending, icon: <FiClock />, bg: '#f3e8ff', color: '#7c3aed' },
          { label: 'Free Courses', value: freeCourses, icon: <FiXCircle />, bg: '#f1f5f9', color: '#64748b' },
          { label: 'Total Enrollments', value: totalEnrollments, icon: <FiBook />, bg: '#fee2e2', color: '#dc2626' },
        ].map(stat => (
          <div className="col-6 col-md-4 col-lg-2" key={stat.label}>
            <div className="content-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: stat.bg, color: stat.color, borderRadius: 10, padding: 10, fontSize: '1.2rem' }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stat.value}</div>
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
              <input type="text" className="form-control" placeholder="Title, category, creator..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, fontSize: '0.88rem' }} />
            </div>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: '0.88rem' }}>
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category</label>
            <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ fontSize: '0.88rem' }}>
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); setDateFrom(''); setDateTo(''); }}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state"><FiBook /><h3>No courses match filters</h3></div>
      ) : (
        <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Course Title</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Enrollments</th>
                  <th>Created By</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td>{c.category}</td>
                    <td><span className={`course-badge ${c.difficulty}`}>{c.difficulty}</span></td>
                    <td>{c.duration_hours}h</td>
                    <td><span className={`status-badge ${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                    <td>
                      <span style={{
                        background: c.is_free ? '#dcfce7' : '#fef3c7',
                        color: c.is_free ? '#16a34a' : '#d97706',
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
                      }}>
                        {c.is_free ? 'Free' : 'Premium'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.enrollment_count}</td>
                    <td>{c.creator_name}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleString()}</td>
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
