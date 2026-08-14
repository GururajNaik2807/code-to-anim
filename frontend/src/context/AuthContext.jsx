// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    // Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const openAuthModal = (message = '') => {
    setModalMessage(message);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setModalMessage('');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthModalOpen, modalMessage, openAuthModal, closeAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);