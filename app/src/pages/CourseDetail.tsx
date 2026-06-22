import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Course, CourseContent } from '../types';
import {
  FiClock, FiBarChart2, FiBook, FiPlay, FiFileText,
  FiCheckCircle, FiLock, FiArrowLeft
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCourse();
  }, [id]);

  const loadCourse = async () => {
    const [courseRes, contentRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', id).single(),
      supabase.from('course_content').select('*').eq('course_id', id).order('sort_order'),
    ]);

    if (courseRes.data) setCourse(courseRes.data);
    if (contentRes.data) setContents(contentRes.data);

    if (profile) {
      const [enrollRes, subRes] = await Promise.all([
        supabase.from('enrollments').select('id').eq('user_id', profile.id).eq('course_id', id).single(),
        supabase.from('user_subscriptions').select('id').eq('user_id', profile.id).eq('status', 'active').single(),
      ]);
      setEnrolled(!!enrollRes.data);
      setHasSubscription(!!subRes.data);
    }

    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!profile) return;

    if (!course?.is_free && !hasSubscription) {
      toast.error('You need an active subscription to enroll in premium courses');
      navigate('/subscription');
      return;
    }

    const { error } = await supabase.from('enrollments').insert({
      user_id: profile.id,
      course_id: id,
      progress: 0,
      completed: false,
    });

    if (error) {
      toast.error('Failed to enroll');
      return;
    }

    setEnrolled(true);
    toast.success('Successfully enrolled!');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="empty-state">
        <FiBook />
        <h3>Course not found</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/courses')}>
          Browse Courses
        </button>
      </div>
    );
  }

  const contentIcon = (type: string) => {
    switch (type) {
      case 'video': return <FiPlay />;
      case 'document': return <FiFileText />;
      case 'quiz': return <FiCheckCircle />;
      default: return <FiBook />;
    }
  };

  return (
    <div>
      <button
        className="btn btn-link mb-3 p-0"
        onClick={() => navigate('/courses')}
        style={{ textDecoration: 'none' }}
      >
        <FiArrowLeft style={{ marginRight: 6 }} /> Back to Courses
      </button>

      <div className="row g-4">
        {/* Course Info */}
        <div className="col-12 col-lg-8">
          <div className="content-card mb-4">
            <div
              style={{
                height: 240,
                borderRadius: 'var(--radius-md)',
                background: course.thumbnail_url
                  ? `url(${course.thumbnail_url}) center/cover`
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '3rem',
                marginBottom: 24,
              }}
            >
              {!course.thumbnail_url && <FiBook />}
            </div>

            <div className="d-flex gap-2 mb-2">
              <span className={`course-badge ${course.is_free ? 'free' : 'premium'}`}>
                {course.is_free ? 'Free' : 'Premium'}
              </span>
              <span className={`course-badge ${course.difficulty}`}>{course.difficulty}</span>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>{course.title}</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{course.description}</p>

            <div className="d-flex gap-4 mt-3" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <span><FiClock style={{ marginRight: 4 }} /> {course.duration_hours} hours</span>
              <span><FiBarChart2 style={{ marginRight: 4 }} /> {course.category}</span>
            </div>
          </div>

          {/* Course Content */}
          <div className="content-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>
              Course Content ({contents.length} lessons)
            </h3>
            {contents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Content is being prepared...</p>
            ) : (
              <div>
                {contents.map((item, idx) => (
                  <div
                    key={item.id}
                    className="d-flex align-items-center gap-3 p-3"
                    style={{
                      borderBottom: idx < contents.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: enrolled || item.is_preview ? 'pointer' : 'default',
                      opacity: enrolled || item.is_preview ? 1 : 0.6,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}
                    >
                      {contentIcon(item.content_type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {item.content_type}
                        {item.is_preview && ' • Preview'}
                      </div>
                    </div>
                    {!enrolled && !item.is_preview && <FiLock style={{ color: 'var(--text-muted)' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="content-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 28px)' }}>
            {enrolled ? (
              <>
                <div className="text-center mb-3">
                  <FiCheckCircle size={40} style={{ color: 'var(--success)' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: 8 }}>You're Enrolled!</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Continue learning at your own pace
                  </p>
                </div>
                <button className="btn btn-primary w-100">
                  Continue Learning
                </button>
              </>
            ) : (
              <>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
                  {course.is_free ? 'Free Course' : 'Premium Course'}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  {course.is_free
                    ? 'Enroll now and start learning for free!'
                    : 'Active subscription required to access this course.'}
                </p>
                <button className="btn btn-primary w-100" onClick={handleEnroll}>
                  {course.is_free ? 'Enroll for Free' : 'Enroll Now'}
                </button>
                {!course.is_free && !hasSubscription && (
                  <button
                    className="btn btn-outline-primary w-100 mt-2"
                    onClick={() => navigate('/subscription')}
                  >
                    View Subscription Plans
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
