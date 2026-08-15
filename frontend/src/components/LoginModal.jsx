import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginModal() {
  const { isAuthModalOpen, modalMessage, closeAuthModal } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Don't render anything if the modal shouldn't be open
  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Handle Signup
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email in the Spam Folder for the confirmation link!');
      }
      
      // If successful, close the modal
      closeAuthModal();
      
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleLogin = async () => {
    try {
      setErrorMsg('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Redirect back to current domain after login
        },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md p-8 bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl"
        >
          {/* Close Button */}
          <button 
            onClick={closeAuthModal}
            className="absolute p-2 text-gray-400 transition-colors top-4 right-4 hover:text-white"
          >
            ✕
          </button>

          <h2 className="mb-2 text-2xl font-bold text-center text-white">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          
          {/* Custom Trigger Message */}
          {modalMessage && (
            <div className="p-3 mb-6 text-sm text-center text-purple-200 border rounded-lg bg-purple-900/30 border-purple-500/30">
              {modalMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 mb-4 text-sm text-red-200 border rounded-lg bg-red-900/30 border-red-500/30">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 text-white bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 text-white bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 font-bold text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="px-3 text-xs text-gray-500 uppercase">Or continue with</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          {/* Google Sign-in Button */}
          {/* <button
            onClick={handleGoogleLogin}
            type="button"
            className="flex items-center justify-center w-full gap-3 py-2.5 font-medium text-gray-200 transition-colors bg-gray-950 border border-gray-800 rounded-lg hover:bg-gray-800 hover:text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button> */}

          <div className="mt-6 text-sm text-center text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-purple-400 transition-colors hover:text-purple-300"
            >
              {isLogin ? 'Sign up for free' : 'Log in here'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}