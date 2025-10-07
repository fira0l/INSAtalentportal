import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  gender?: string;
  batch?: string;
  profile_picture_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'deactivated';
  role: 'admin' | 'student';
  created_at: string;
  updated_at: string;
};

export type Certificate = {
  id: string;
  student_id: string;
  certificate_number: string;
  title: string;
  description?: string;
  issue_date: string;
  issued_by?: string;
  template_data?: Record<string, any>;
  status: 'active' | 'revoked';
  created_at: string;
};

export type NewsItem = {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_id?: string;
  category: 'announcement' | 'update' | 'achievement' | 'partnership';
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  link?: string;
  category: 'workshop' | 'hackathon' | 'ceremony' | 'training' | 'meeting';
  max_attendees?: number;
  created_by?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  student_id: string;
  registered_at: string;
  status: 'registered' | 'attended' | 'cancelled';
};
