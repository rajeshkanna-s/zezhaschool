export interface Profile {
  id: string;
  email: string;
  full_name: string;
  mobile: string;
  avatar_url: string | null;
  role: 'student' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  is_published: boolean;
  is_free: boolean;
  created_by: string;
  approved_by: string | null;
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CourseContent {
  id: string;
  course_id: string;
  title: string;
  content_type: 'video' | 'document' | 'quiz' | 'text';
  content_url: string | null;
  content_text: string | null;
  sort_order: number;
  is_preview: boolean;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  is_active: boolean;
  created_at: string;
  last_active_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  course?: Course;
  progress: number;
  completed: boolean;
  enrolled_at: string;
  updated_at: string;
}
