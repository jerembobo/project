import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';

export const useAuth = () => {
  const {
    user,
    session,
    profile,
    loading,
    initialized,
    setUser,
    setSession,
    setProfile,
    setLoading,
    setInitialized,
    signOut: storeSignOut,
  } = useAuthStore();

  const { addNotification } = useAppStore();

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          addNotification({
            type: 'error',
            title: 'Erreur d\'authentification',
            message: 'Impossible de récupérer la session utilisateur',
          });
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
          
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Fetch user profile
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching profile:', error);
          return;
        }

        if (mounted && data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
          
          if (event === 'SIGNED_IN') {
            addNotification({
              type: 'success',
              title: 'Connexion réussie',
              message: `Bienvenue ${session.user.email}!`,
            });
          }
        } else {
          setProfile(null);
          
          if (event === 'SIGNED_OUT') {
            addNotification({
              type: 'info',
              title: 'Déconnexion',
              message: 'Vous avez été déconnecté avec succès',
            });
          }
        }

        setLoading(false);
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        addNotification({
          type: 'error',
          title: 'Erreur de connexion',
          message: error.message,
        });
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error signing in:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de connexion',
        message: 'Une erreur inattendue s\'est produite',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        addNotification({
          type: 'error',
          title: 'Erreur d\'inscription',
          message: error.message,
        });
        return { error };
      }

      addNotification({
        type: 'success',
        title: 'Inscription réussie',
        message: 'Vérifiez votre email pour confirmer votre compte',
      });

      return { data };
    } catch (error) {
      console.error('Error signing up:', error);
      addNotification({
        type: 'error',
        title: 'Erreur d\'inscription',
        message: 'Une erreur inattendue s\'est produite',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addNotification({
          type: 'error',
          title: 'Erreur de déconnexion',
          message: error.message,
        });
        return { error };
      }

      storeSignOut();
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de déconnexion',
        message: 'Une erreur inattendue s\'est produite',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<typeof profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          updated_at: new Date().toISOString(),
          ...updates,
        })
        .select()
        .single();

      if (error) {
        addNotification({
          type: 'error',
          title: 'Erreur de mise à jour',
          message: error.message,
        });
        return { error };
      }

      setProfile(data);
      addNotification({
        type: 'success',
        title: 'Profil mis à jour',
        message: 'Vos informations ont été sauvegardées',
      });

      return { data };
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de mise à jour',
        message: 'Une erreur inattendue s\'est produite',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
};