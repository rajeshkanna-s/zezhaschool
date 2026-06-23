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

/* ---- Content Pages (admin-built learning content) ---- */

export type CalloutVariant = 'info' | 'success' | 'warning' | 'danger';

export interface CardItem {
  icon?: string;
  title: string;
  text?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export type PageBlock =
  | { id: string; type: 'heading'; text: string; level: 1 | 2 | 3 }
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'image'; url: string; caption?: string }
  | { id: string; type: 'video'; url: string }
  | { id: string; type: 'callout'; text: string; variant: CalloutVariant }
  | { id: string; type: 'button'; label: string; href: string }
  | { id: string; type: 'cards'; items: CardItem[] }
  | { id: string; type: 'divider' };

export type PageBlockType = PageBlock['type'];

export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  summary: string;
  cover_image: string | null;
  icon: string;
  blocks: PageBlock[];
  status: 'draft' | 'published';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/* ---- Missions (Learn → Play → Quiz → Done) ---- */

export interface LearnCard {
  icon?: string;
  heading: string;
  text: string;
}
export interface LearnStep {
  id: string;
  type: 'learn';
  title: string;
  cards: LearnCard[];
}

export interface SortBucket {
  label: string;
  emoji?: string;
}
export interface SortItem {
  text: string;
  bucket: number; // index into buckets
}
export interface SortStep {
  id: string;
  type: 'sort';
  title: string;
  prompt: string;
  buckets: SortBucket[];
  items: SortItem[];
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // index of correct option
}
export interface QuizStep {
  id: string;
  type: 'quiz';
  title: string;
  questions: QuizQuestion[];
}

export type MissionStep = LearnStep | SortStep | QuizStep;
export type MissionStepType = MissionStep['type'];

export interface Mission {
  id: string;
  title: string;
  slug: string;
  summary: string;
  icon: string;
  xp: number;
  order_index: number;
  steps: MissionStep[];
  status: 'draft' | 'published';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface MissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  completed: boolean;
  xp_earned: number;
  completed_at: string | null;
  created_at: string;
}
