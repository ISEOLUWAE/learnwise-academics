import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const syncProfileFromUser = async (authUser: User) => {
    const googleFullName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      '';

    const googleAvatar =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      '';

    const emailPrefix = authUser.email?.split('@')[0] || 'User';

    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileFetchError) {
      console.error('Error fetching profile:', profileFetchError);
      return;
    }

    const fullNameToSave =
      existingProfile?.full_name?.trim() ||
      googleFullName ||
      emailPrefix;

    const usernameToSave =
      existingProfile?.username?.trim() ||
      googleFullName ||
      emailPrefix;

    const avatarToSave =
      existingProfile?.avatar_url ||
      googleAvatar ||
      null;

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: authUser.id,
      full_name: fullNameToSave,
      username: usernameToSave,
      avatar_url: avatarToSave,
    });

    if (upsertError) {
      console.error('Error syncing profile:', upsertError);
    }
  };

  useEffect(() => {
    const handleSession = async (currentSession: Session | null) => {
      const currentUser = currentSession?.user ?? null;
      setSession(currentSession);
      setUser(currentUser);

      if (currentUser) {
        await syncProfileFromUser(currentUser);
      }

      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      void handleSession(currentSession);
    });

    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      void handleSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const cleanFullName = fullName.trim();
    const cleanUsername = username.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: cleanFullName,
          username: cleanUsername,
        },
      },
    });

    if (
      error?.message?.includes('already registered') ||
      error?.message?.includes('already exists') ||
      error?.message?.includes('User already registered')
    ) {
      return { error: { message: 'This email is already registered. Please login instead.' } };
    }

    if (data?.user && !error) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: cleanFullName,
        username: cleanUsername || cleanFullName || email.split('@')[0],
      });

      if (profileError) {
        console.error('Error creating profile during signup:', profileError);
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};