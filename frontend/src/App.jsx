import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';
import LearnPage from './pages/LearnPage';
import LearnHub from './pages/LearnHub';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext.jsx';
import CommunityPage from './pages/CommunityPage';

// Built-in 404 Component to pass SEO Audit Custom 404 Test
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
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/workspace" element={<WorkspacePage session={session} />} />
            <Route path="/learn" element={<LearnHub />} />
            <Route path="/algorithms" element={<LearnPage />} />
            
            <Route 
              path="/auth" 
              element={session ? <Navigate to="/profile" /> : <AuthPage />} 
            />
            
            <Route 
              path="/profile" 
              element={session ? <ProfilePage session={session} /> : <Navigate to="/auth" />} 
            />

            {/* Catch-all 404 Route for unmatched paths */}
            <Route path="*" element={<NotFoundPage />} />
            {/* community page route  */}
            <Route path="/community" element={<CommunityPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}