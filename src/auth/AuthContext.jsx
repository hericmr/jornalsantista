import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

const loadAdminProfile = async (authUser) => {
  if (!authUser) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', authUser.id)
    .single();

  if (error || !data || data.role !== 'admin') {
    return null;
  }

  return {
    id: authUser.id,
    email: authUser.email,
    role: data.role
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const profile = await loadAdminProfile(session?.user);
      if (active) {
        setUser(profile);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = await loadAdminProfile(session?.user);
      if (active) setUser(profile);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: 'Credenciais inválidas' };
    }

    const profile = await loadAdminProfile(data.user);
    if (!profile) {
      await supabase.auth.signOut();
      return { success: false, error: 'Usuário sem permissão de administrador' };
    }

    setUser(profile);
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
