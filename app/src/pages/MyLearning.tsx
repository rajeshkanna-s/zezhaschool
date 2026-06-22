import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Enrollment, Course } from '../types';
import { FiBook, FiClock, FiCheckCircle } from 'react-icons/fi';

export default function MyLearning() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    if (profile) loadEnrollments();
  }, [profile]);

  const loadEnrollments = async () => {
    const { data } = await supabase
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('user_id', profile!.id)
      .order('updated_at', { ascending: false });

    if (data) setEnrollments(data);
    setLoading(false);
  };

  const filtered = enrollments.filter(e => {
    if (filter === 'completed') return e.completed;
    if (filter === 'in-progress') return !e.completed;
    return true;
  });

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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>My Learning</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{enrollments.length} course(s) enrolled</p>
        </div>
        <div className="btn-group">
          {(['all', 'in-progress', 'completed'] as const).map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter(f)}
              style={{ textTransform: 'capitalize' }}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FiBook />
          <h3>{filter === 'all' ? 'No courses enrolled yet' : `No ${filter.replace('-', ' ')} courses`}</h3>
          <p>Browse our course catalog and start learning!</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/courses')}>
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(enrollment => {
            const course = (enrollment as any).course as Course;
            if (!course) return null;
            return (
              <div key={enrollment.id} className="col-12 col-md-6 col-lg-4">
                <div className="course-card" onClick={() => navigate(`/courses/${course.id}`)}>
                  <div className="course-thumbnail">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} />
                    ) : (
                      <FiBook />
                    )}
                    {enrollment.completed && (
                      <span className="course-badge free">
                        <FiCheckCircle style={{ marginRight: 3 }} /> Completed
                      </span>
                    )}
                  </div>
                  <div className="course-body">
                    <div className="course-category">{course.category}</div>
                    <h3>{course.title}</h3>
                    <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                      <div
                        style={{
                          background: 'var(--bg-main)',
                          borderRadius: 8,
                          height: 8,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${enrollment.progress}%`,
                            background: enrollment.completed ? 'var(--success)' : 'var(--primary)',
                            borderRadius: 8,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          marginTop: 4,
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{enrollment.progress}% complete</span>
                        <span><FiClock style={{ marginRight: 3 }} />{course.duration_hours}h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
