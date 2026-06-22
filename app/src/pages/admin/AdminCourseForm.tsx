import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { CourseContent } from '../../types';
import {
  FiArrowLeft, FiSave, FiPlus, FiTrash2,
  FiPlay, FiFileText, FiBook, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminCourseForm() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [durationHours, setDurationHours] = useState(1);
  const [isFree, setIsFree] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [contents, setContents] = useState<Partial<CourseContent>[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) loadCourse();
  }, [id]);

  const loadCourse = async () => {
    const [courseRes, contentRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', id).single(),
      supabase.from('course_content').select('*').eq('course_id', id).order('sort_order'),
    ]);

    if (courseRes.data) {
      const c = courseRes.data;
      setTitle(c.title);
      setDescription(c.description || '');
      setCategory(c.category);
      setDifficulty(c.difficulty);
      setDurationHours(c.duration_hours);
      setIsFree(c.is_free);
      setThumbnailUrl(c.thumbnail_url || '');
    }

    if (contentRes.data) setContents(contentRes.data);
    setLoading(false);
  };

  const addContent = () => {
    setContents([...contents, {
      title: '',
      content_type: 'text',
      content_url: '',
      content_text: '',
      sort_order: contents.length,
      is_preview: false,
    }]);
  };

  const updateContent = (index: number, updates: Partial<CourseContent>) => {
    const updated = [...contents];
    updated[index] = { ...updated[index], ...updates };
    setContents(updated);
  };

  const removeContent = (index: number) => {
    setContents(contents.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Course title is required');
      return;
    }

    setSaving(true);

    if (isEditing) {
      const { error } = await supabase
        .from('courses')
        .update({
          title, description, category, difficulty,
          duration_hours: durationHours, is_free: isFree,
          thumbnail_url: thumbnailUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        toast.error('Failed to update course');
        setSaving(false);
        return;
      }

      await supabase.from('course_content').delete().eq('course_id', id);

      if (contents.length > 0) {
        const contentRows = contents.map((c, i) => ({
          course_id: id,
          title: c.title || `Lesson ${i + 1}`,
          content_type: c.content_type || 'text',
          content_url: c.content_url || null,
          content_text: c.content_text || null,
          sort_order: i,
          is_preview: c.is_preview || false,
        }));

        await supabase.from('course_content').insert(contentRows);
      }

      toast.success('Course updated!');
    } else {
      const { data: courseData, error } = await supabase
        .from('courses')
        .insert({
          title, description, category, difficulty,
          duration_hours: durationHours, is_free: isFree,
          thumbnail_url: thumbnailUrl || null,
          created_by: profile?.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error || !courseData) {
        toast.error('Failed to create course');
        setSaving(false);
        return;
      }

      if (contents.length > 0) {
        const contentRows = contents.map((c, i) => ({
          course_id: courseData.id,
          title: c.title || `Lesson ${i + 1}`,
          content_type: c.content_type || 'text',
          content_url: c.content_url || null,
          content_text: c.content_text || null,
          sort_order: i,
          is_preview: c.is_preview || false,
        }));

        await supabase.from('course_content').insert(contentRows);
      }

      toast.success('Course created!');
      navigate(`/admin/courses/${courseData.id}`);
    }

    setSaving(false);
  };

  const contentIcon = (type: string) => {
    switch (type) {
      case 'video': return <FiPlay />;
      case 'document': return <FiFileText />;
      case 'quiz': return <FiCheckCircle />;
      default: return <FiBook />;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <button
        className="btn btn-link mb-3 p-0"
        onClick={() => navigate('/admin/courses')}
        style={{ textDecoration: 'none' }}
      >
        <FiArrowLeft style={{ marginRight: 6 }} /> Back to Courses
      </button>

      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 24 }}>
        {isEditing ? 'Edit Course' : 'Create New Course'}
      </h2>

      {/* Course Details */}
      <div className="settings-section">
        <h3>Course Details</h3>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Title *</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Python Programming"
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div className="col-12">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Description</label>
            <textarea
              className="form-control"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what students will learn..."
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Category</label>
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            >
              <option>General</option>
              <option>Programming</option>
              <option>Web Development</option>
              <option>Data Science</option>
              <option>Design</option>
              <option>Business</option>
              <option>Marketing</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>Language</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Difficulty</label>
            <select
              className="form-select"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as any)}
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Duration (hours)</label>
            <input
              type="number"
              className="form-control"
              value={durationHours}
              onChange={e => setDurationHours(Number(e.target.value))}
              min={0.5}
              step={0.5}
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Thumbnail URL</label>
            <input
              type="url"
              className="form-control"
              value={thumbnailUrl}
              onChange={e => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isFree"
                checked={isFree}
                onChange={e => setIsFree(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isFree" style={{ fontWeight: 600 }}>
                Free Course (no subscription needed)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="settings-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Course Content</h3>
          <button className="btn btn-sm btn-outline-primary" onClick={addContent} style={{ width: 'auto' }}>
            <FiPlus style={{ marginRight: 4 }} /> Add Lesson
          </button>
        </div>

        {contents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
            No content yet. Click "Add Lesson" to start building your course.
          </p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {contents.map((content, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    {contentIcon(content.content_type || 'text')}
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Lesson {idx + 1}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeContent(idx)}
                    style={{ width: 'auto' }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>

                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Lesson title"
                      value={content.title || ''}
                      onChange={e => updateContent(idx, { title: e.target.value })}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={content.content_type || 'text'}
                      onChange={e => updateContent(idx, { content_type: e.target.value as any })}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <option value="text">Text</option>
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="form-check mt-1">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={content.is_preview || false}
                        onChange={e => updateContent(idx, { is_preview: e.target.checked })}
                        id={`preview-${idx}`}
                      />
                      <label className="form-check-label" htmlFor={`preview-${idx}`} style={{ fontSize: '0.82rem' }}>
                        Preview
                      </label>
                    </div>
                  </div>
                  {(content.content_type === 'video' || content.content_type === 'document') && (
                    <div className="col-12">
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="Content URL"
                        value={content.content_url || ''}
                        onChange={e => updateContent(idx, { content_url: e.target.value })}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      />
                    </div>
                  )}
                  {(content.content_type === 'text' || content.content_type === 'quiz') && (
                    <div className="col-12">
                      <textarea
                        className="form-control form-control-sm"
                        rows={3}
                        placeholder="Content text..."
                        value={content.content_text || ''}
                        onChange={e => updateContent(idx, { content_text: e.target.value })}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="d-flex gap-2 justify-content-end mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/courses')} style={{ width: 'auto' }}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ width: 'auto' }}>
          <FiSave style={{ marginRight: 6 }} />
          {saving ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </div>
  );
}
