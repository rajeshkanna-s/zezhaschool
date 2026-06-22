import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, mobile: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
    return data;
  };

  const createSessionRecord = async (userId: string) => {
    const sessionToken = uuidv4();
    localStorage.setItem('session_token', sessionToken);

    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId);

    await supabase.from('user_sessions').insert({
      user_id: userId,
      session_token: sessionToken,
      is_active: true,
      last_active_at: new Date().toISOString(),
    });
  };

  const checkSessionValidity = async (userId: string): Promise<boolean> => {
    const localToken = localStorage.getItem('session_token');
    if (!localToken) return false;

    const { data } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_token', localToken)
      .eq('is_active', true)
      .single();

    return !!data;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await fetchProfile(s.user.id);
        const valid = await checkSessionValidity(s.user.id);
        if (!valid) {
          await createSessionRecord(s.user.id);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, mobile: string) => {
    const { data: existingMobile } = await supabase
      .from('profiles')
      .select('id')
      .eq('mobile', mobile)
      .single();

    if (existingMobile) {
      return { error: 'This mobile number is already registered.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, mobile },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'This email is already registered.' };
      }
      return { error: error.message };
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        mobile,
        role: 'student',
        is_active: true,
      });
      await fetchProfile(data.user.id);
      await createSessionRecord(data.user.id);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileData) {
      const { data: activeSessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('is_active', true);

      if (activeSessions && activeSessions.length > 0) {
        const localToken = localStorage.getItem('session_token');
        const isCurrentDevice = activeSessions.some(s => s.session_token === localToken);

        if (!isCurrentDevice) {
          return { error: 'ALREADY_LOGGED_IN' };
        }
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message };

    if (data.user) {
      await fetchProfile(data.user.id);
      await createSessionRecord(data.user.id);
      const p = await supabase.from('profiles').select('full_name, role').eq('id', data.user.id).single();
      await supabase.from('login_history').insert({
        user_id: data.user.id,
        email,
        full_name: p.data?.full_name ?? '',
        role: p.data?.role ?? 'student',
        status: 'success',
      });
    }

    return { error: null };
  };

  const forceSignIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', data.user.id);

      await fetchProfile(data.user.id);
      await createSessionRecord(data.user.id);
      const p = await supabase.from('profiles').select('full_name, role').eq('id', data.user.id).single();
      await supabase.from('login_history').insert({
        user_id: data.user.id,
        email,
        full_name: p.data?.full_name ?? '',
        role: p.data?.role ?? 'student',
        status: 'success',
      });
    }
    return { error: null };
  };

  const signOut = async () => {
    const localToken = localStorage.getItem('session_token');
    if (user && localToken) {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('session_token', localToken);
    }
    localStorage.removeItem('session_token');
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };

    if (updates.mobile) {
      const { data: existingMobile } = await supabase
        .from('profiles')
        .select('id')
        .eq('mobile', updates.mobile)
        .neq('id', user.id)
        .single();

      if (existingMobile) {
        return { error: 'This mobile number is already in use.' };
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) return { error: error.message };
    await fetchProfile(user.id);
    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    forceSignIn,
  };

  return <AuthContext.Provider value={value as AuthContextType}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType & { forceSignIn: (email: string, password: string) => Promise<{ error: string | null }> } {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context as AuthContextType & { forceSignIn: (email: string, password: string) => Promise<{ error: string | null }> };
}
