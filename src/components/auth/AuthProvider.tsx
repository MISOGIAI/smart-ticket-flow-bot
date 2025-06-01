
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'support_agent' | 'manager' | 'super_admin';
  department_id?: string;
  job_title?: string;
  expertise_areas?: string[];
  reports_to?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // If no profile found, return early
      if (!data) {
        console.log('No user profile found for auth_id:', authId);
        setUserProfile(null);
        return;
      }
      
      // Type cast the role to ensure it matches our UserProfile interface
      const profileData: UserProfile = {
        ...data,
        role: data.role as 'employee' | 'support_agent' | 'manager' | 'super_admin'
      };
      
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signUp = async (userData: any) => {
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      });

      if (authError) throw authError;

      // If auth user was created successfully, create the user profile
      if (authData.user) {
        const profileData = {
          auth_id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          job_title: userData.job_title,
          department_id: userData.department_id && userData.department_id !== '' ? userData.department_id : null,
          expertise_areas: userData.expertise_areas || [],
          reports_to: userData.reports_to || null,
        };

        console.log('🔍 AuthProvider - Received userData:', userData);
        console.log('🔍 AuthProvider - userData.department_id:', userData.department_id, 'Type:', typeof userData.department_id);
        console.log('🔍 AuthProvider - userData.department_id length:', userData.department_id?.length);
        console.log('🔍 AuthProvider - userData.department_id === "":', userData.department_id === '');
        console.log('🔍 AuthProvider - userData.department_id === null:', userData.department_id === null);
        console.log('🔍 AuthProvider - userData.department_id === undefined:', userData.department_id === undefined);
        console.log('🔍 AuthProvider - Creating user profile with data:', profileData);
        console.log('🔍 AuthProvider - profileData.department_id:', profileData.department_id, 'Type:', typeof profileData.department_id);
        console.log('🔍 AuthProvider - Final department_id check before insert:', {
          original: userData.department_id,
          processed: profileData.department_id,
          isValid: !!(userData.department_id && userData.department_id !== ''),
          willBeNull: !(userData.department_id && userData.department_id !== '')
        });

        // Check if profile already exists to prevent duplicates
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', authData.user.id)
          .maybeSingle();

        if (existingProfile) {
          console.log('User profile already exists, updating with new data');
          console.log('🔄 Updating existing profile with profileData:', profileData);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({
              department_id: profileData.department_id,
              job_title: profileData.job_title,
              expertise_areas: profileData.expertise_areas,
              reports_to: profileData.reports_to
            })
            .eq('auth_id', authData.user.id);

          if (updateError) {
            console.error('❌ Error updating user profile:', updateError);
            throw updateError;
          }
          
          console.log('✅ User profile updated successfully');
          return {};
        }

        const { data: insertResult, error: profileError } = await supabase
          .from('users')
          .insert([profileData])
          .select();

        if (profileError) {
          console.error('❌ Error creating user profile:', profileError);
          console.error('❌ Profile data that failed to insert:', profileData);
          // If profile creation fails, we should clean up the auth user
          // But for now, we'll just throw the error
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        console.log('✅ User profile created successfully');
        console.log('✅ Inserted profile data:', insertResult);
        
        // Verify the department_id was actually saved
        if (insertResult && insertResult[0]) {
          console.log('✅ Confirmed department_id in database:', insertResult[0].department_id);
        }
      }

      return {};
    } catch (error: any) {
      console.error('SignUp error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchUserProfile(user.id);
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
