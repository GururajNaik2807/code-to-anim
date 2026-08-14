import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Make sure this path points to your actual client file
import { ThemeProvider } from './context/ThemeContext'; // Import it here

import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';
import LearnPage from './pages/LearnPage';
import LearnHub from './pages/LearnHub';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext.jsx'

export default function App() {
  // 1. Set up the state to track if a user is logged in
  const [session, setSession] = useState(null);

  // 2. Check Supabase for a session when the app loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes (like when they log in or log out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    // Wrap the ThemeProvider inside the AuthProvider
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Pass session to workspace so it knows if it should show the Login Modal */}
            <Route path="/workspace" element={<WorkspacePage session={session} />} />
            
            <Route path="/learn" element={<LearnHub />} />
            <Route path="/algorithms" element={<LearnPage />} />
            
            {/* The single, correct Auth route: Redirects to Profile if already logged in */}
            <Route 
              path="/auth" 
              element={session ? <Navigate to="/profile" /> : <AuthPage />} 
            />
            
            {/* Protect the Profile route: Redirects to Auth if THEY ARE NOT logged in */}
            <Route 
              path="/profile" 
              element={session ? <ProfilePage session={session} /> : <Navigate to="/auth" />} 
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}