import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Course } from '../types';
import { useBookmarks } from '../hooks/useBookmarks';
import { FiBook, FiClock, FiSearch, FiFilter, FiBookmark } from 'react-icons/fi';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const { isBookmarked, toggle, count } = useBookmarks();
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (data) setCourses(data);
    setLoading(false);
  };

  const categories = [...new Set(courses.map(c => c.category))];

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchDifficulty = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
    const matchSaved = !savedOnly || isBookmarked(c.id);
    return matchSearch && matchCategory && matchDifficulty && matchSaved;
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
      <div className="mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Explore Courses</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Discover courses to advance your skills</p>
      </div>

      {/* Filters */}
      <div className="content-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 40, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2">
              <FiFilter style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="col-12 col-md-1">
            <button
              className={`saved-filter-btn ${savedOnly ? 'active' : ''}`}
              onClick={() => setSavedOnly(s => !s)}
              title="Show saved courses"
            >
              <FiBookmark /> {count > 0 ? count : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <FiBook />
          <h3>No courses found</h3>
          <p>{search ? 'Try a different search term' : 'Courses are being prepared. Check back soon!'}</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(course => (
            <div key={course.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
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
                  <button
                    className={`bookmark-btn ${isBookmarked(course.id) ? 'on' : ''}`}
                    title={isBookmarked(course.id) ? 'Remove bookmark' : 'Save course'}
                    onClick={(e) => { e.stopPropagation(); toggle({ item_type: 'course', item_id: course.id, title: course.title, link: `/courses/${course.id}`, icon: '📚' }); }}
                  >
                    <FiBookmark />
                  </button>
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
          ))}
        </div>
      )}
    </div>
  );
}
