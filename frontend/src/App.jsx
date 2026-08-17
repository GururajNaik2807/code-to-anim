import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';
import LearnPage from './pages/LearnPage';
import LearnHub from './pages/LearnHub';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfileCard from './pages/PublicProfileCard';
import CommunityPage from './pages/CommunityPage';
import LoginModal from './components/LoginModal';
import { AuthProvider, useAuth } from './context/AuthContext.jsx'; // <-- IMPORT useAuth

// 1. NEW COMPONENT: Catches old /auth links and opens the modal instead
function AuthRedirect() {
  const { openAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
    setTimeout(() => {
      openAuthModal('Please log in or sign up to continue.');
    }, 100);
  }, [navigate, openAuthModal]);

  return null; // Renders nothing, just redirects
}

// 404 Page
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center text-center p-6 text-white font-sans">
      <h1 className="text-6xl font-extrabold text-purple-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        The visualization or page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          
          {/* THE LOGIN MODAL IS NOW GLOBAL AND SITS OVER ALL ROUTES */}
          <LoginModal />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/workspace" element={<WorkspacePage session={session} />} />
            <Route path="/learn" element={<LearnHub />} />
            <Route path="/algorithms" element={<LearnPage />} />
            <Route path="/learn/:category/:topic" element={<LessonPage />} />
            <Route path="/p/:userId" element={<PublicProfileCard />} />
            
            {/* 2. THE FIX: Any link to /auth gets caught here and triggers the modal */}
            <Route path="/auth" element={<AuthRedirect />} />

            <Route 
              path="/profile" 
              element={session ? <ProfilePage session={session} /> : <Navigate to="/" />} 
            />

            <Route path="/community" element={<CommunityPage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}