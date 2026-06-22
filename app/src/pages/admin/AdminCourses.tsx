import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../types';
import { FiPlus, FiEdit, FiEye, FiTrash2, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setCourses(data);
    setLoading(false);
  };

  const updateStatus = async (courseId: string, status: string) => {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === 'published') updates.is_published = true;
    if (status === 'draft') updates.is_published = false;

    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    toast.success(`Course ${status.replace('_', ' ')}!`);
    loadCourses();
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    const { error } = await supabase.from('courses').delete().eq('id', courseId);

    if (error) {
      toast.error('Failed to delete course');
      return;
    }

    toast.success('Course deleted');
    loadCourses();
  };

  const filtered = statusFilter === 'all'
    ? courses
    : courses.filter(c => c.status === statusFilter);

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
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Course Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{courses.length} total courses</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/courses/new')} style={{ width: 'auto' }}>
          <FiPlus style={{ marginRight: 6 }} /> Create Course
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['all', 'draft', 'pending_review', 'approved', 'published', 'rejected'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter(s)}
            style={{ textTransform: 'capitalize' }}
          >
            {s.replace('_', ' ')}
            <span
              style={{
                marginLeft: 6,
                background: statusFilter === s ? 'rgba(255,255,255,0.2)' : 'var(--bg-main)',
                padding: '1px 7px',
                borderRadius: 10,
                fontSize: '0.75rem',
              }}
            >
              {s === 'all' ? courses.length : courses.filter(c => c.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Courses Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <FiBook />
          <h3>No courses found</h3>
          <p>Create your first course to get started</p>
        </div>
      ) : (
        <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(course => (
                  <tr key={course.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{course.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {course.duration_hours}h • Created {new Date(course.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{course.category}</td>
                    <td>
                      <span className={`course-badge ${course.difficulty}`}>{course.difficulty}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${course.status}`}>
                        {course.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{course.is_free ? 'Free' : 'Premium'}</td>
                    <td>
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                          onClick={() => navigate(`/admin/courses/${course.id}`)}
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="Preview"
                          onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                        >
                          <FiEye size={14} />
                        </button>

                        {course.status === 'draft' && (
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => updateStatus(course.id, 'pending_review')}
                          >
                            Submit
                          </button>
                        )}
                        {course.status === 'pending_review' && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => updateStatus(course.id, 'approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => updateStatus(course.id, 'rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {course.status === 'approved' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateStatus(course.id, 'published')}
                          >
                            Publish
                          </button>
                        )}
                        {course.status === 'published' && (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateStatus(course.id, 'draft')}
                          >
                            Unpublish
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => deleteCourse(course.id)}
                        >
                          <FiTrash2 size={14} />
                        </button>
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
