import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Course, Enrollment, UserSubscription } from '../types';
import { FiBook, FiAward, FiClock, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [profile]);

  const loadDashboard = async () => {
    if (!profile) return;

    const [coursesRes, enrollmentsRes, subRes] = await Promise.all([
      supabase.from('courses').select('*').eq('status', 'published').limit(4),
      supabase.from('enrollments').select('*, course:courses(*)').eq('user_id', profile.id),
      supabase.from('user_subscriptions').select('*, plan:subscription_plans(*)').eq('user_id', profile.id).eq('status', 'active').single(),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);
    if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data);
    if (subRes.data) setSubscription(subRes.data);
    setLoading(false);
  };

  const completedCount = enrollments.filter(e => e.completed).length;
  const totalHours = enrollments.reduce((acc, e) => {
    const course = (e as any).course;
    return acc + (course?.duration_hours || 0);
  }, 0);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Continue your learning journey
        </p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon blue"><FiBook /></div>
            <div className="stat-content">
              <h4>Enrolled</h4>
              <div className="stat-number">{enrollments.length}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon green"><FiAward /></div>
            <div className="stat-content">
              <h4>Completed</h4>
              <div className="stat-number">{completedCount}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon purple"><FiClock /></div>
            <div className="stat-content">
              <h4>Hours</h4>
              <div className="stat-number">{totalHours}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon orange"><FiTrendingUp /></div>
            <div className="stat-content">
              <h4>Plan</h4>
              <div className="stat-number" style={{ fontSize: '1.1rem' }}>
                {subscription ? (subscription as any).plan?.name : 'Free'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      {enrollments.length > 0 && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Continue Learning</h3>
            <button className="btn btn-sm btn-link" onClick={() => navigate('/my-learning')}>
              View All <FiArrowRight />
            </button>
          </div>
          <div className="row g-3">
            {enrollments.slice(0, 3).map(enrollment => {
              const course = (enrollment as any).course as Course;
              if (!course) return null;
              return (
                <div key={enrollment.id} className="col-12 col-md-4">
                  <div className="content-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${course.id}`)}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="course-category">{course.category}</span>
                      <span className={`course-badge ${course.difficulty}`}>{course.difficulty}</span>
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>{course.title}</h3>
                    <div style={{ background: 'var(--bg-main)', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${enrollment.progress}%`,
                          background: 'var(--primary)',
                          borderRadius: 8,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {enrollment.progress}% complete
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Courses */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Popular Courses</h3>
          <button className="btn btn-sm btn-link" onClick={() => navigate('/courses')}>
            Browse All <FiArrowRight />
          </button>
        </div>
        <div className="row g-3">
          {courses.length === 0 ? (
            <div className="col-12">
              <div className="empty-state">
                <FiBook />
                <h3>No courses yet</h3>
                <p>New courses are being prepared. Check back soon!</p>
              </div>
            </div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="col-12 col-sm-6 col-lg-3">
                <div className="course-card" onClick={() => navigate(`/courses/${course.id}`)}>
                  <div className="course-thumbnail">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} />
                    ) : (
                      <FiBook />
                    )}
                    <span className={`course-badge ${course.is_free ? 'free' : 'premium'}`}>
                      {course.is_free ? 'Free' : 'Premium'}
                    </span>
                  </div>
                  <div className="course-body">
                    <div className="course-category">{course.category}</div>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                  </div>
                  <div className="course-footer">
                    <span><FiClock style={{ marginRight: 4 }} />{course.duration_hours}h</span>
                    <span className={`course-badge ${course.difficulty}`}>{course.difficulty}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
