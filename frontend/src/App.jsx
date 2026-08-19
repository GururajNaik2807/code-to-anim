import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext.jsx'; 
import { HelmetProvider } from 'react-helmet-async';

import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';
import LearnPage from './pages/LearnPage';
import LearnHub from './pages/LearnHub';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfileCard from './pages/PublicProfileCard';
import CommunityPage from './pages/CommunityPage';
import Leaderboard from './pages/Leaderboard'; 
import LoginModal from './components/LoginModal';
import ResetPassword from './pages/ResetPassword';

import { useLearningTracker } from './hooks/useLearningTracker'; 

// Wrapper component to activate tracking when Auth is ready
function GlobalTracker() {
  useLearningTracker();
  return null;
}

// Catches old /auth links and opens the modal instead
function AuthRedirect() {
  const { openAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
    setTimeout(() => { openAuthModal('Please log in or sign up to continue.'); }, 100);
  }, [navigate, openAuthModal]);

  return null; 
}

// 404 Page
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center text-center p-6 text-white font-sans">
      <h1 className="text-6xl font-extrabold text-purple-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md">The visualization or page you are looking for doesn't exist.</p>
      <Link to="/" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Return to Home</Link>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      triggerDailyStreak(session?.user?.id); // <-- Trigger on initial load
    });

    // 2. Auth State Listener (Catches logins and logouts)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        triggerDailyStreak(session?.user?.id); // <-- Trigger exactly on login
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- NEW: Fire-and-forget RPC call to update streak ---
  const triggerDailyStreak = async (userId) => {
    if (!userId) return;
    try {
      await supabase.rpc('update_user_streak', { user_id_param: userId });
    } catch (err) {
      console.error("Streak calculation failed:", err);
    }
  };

  return (
  <HelmetProvider>
    <AuthProvider>
      <ThemeProvider>
        <Router>
          
          {/* INITIALIZE TIME TRACKER HERE */}
          <GlobalTracker />
          
          <LoginModal />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Public SEO-Indexed Workspace */}
            <Route path="/workspace" element={<WorkspacePage />} />
            
            <Route path="/learn" element={<LearnHub />} />
            <Route path="/algorithms" element={<LearnPage />} />
            <Route path="/learn/:category/:topic" element={<LessonPage />} />
            <Route path="/p/:userId" element={<PublicProfileCard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/auth" element={<AuthRedirect />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Private Profile (Hosts the Embedded Workspace) */}
            <Route path="/profile" element={session ? <ProfilePage /> : <Navigate to="/" />} />
            
            <Route path="/community" element={<CommunityPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  </HelmetProvider>
  );
}