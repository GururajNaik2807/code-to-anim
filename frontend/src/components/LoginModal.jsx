import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LoginModal() {
  const { isAuthModalOpen, modalMessage, closeAuthModal } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // --- NEW: SUCCESS TOAST STATE ---
  const [successNotice, setSuccessNotice] = useState('');

  // Don't render anything if the modal shouldn't be open
  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessNotice('');

    try {
      if (isLogin) {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        closeAuthModal();
        navigate('/profile');
        
      } else {
        // Handle Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.session) {
          closeAuthModal();
          navigate('/profile');
        } else {
          // --- REPLACED ALERT WITH A CLEAN UI LAYOUT NOTICE ---
          setSuccessNotice('✨ Verification email sent! Please check your inbox & spam folder.');
        }
      }
      
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
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
            onClick={() => { setSuccessNotice(''); closeAuthModal(); }}
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

          {/* --- NEW: SUCCESS LAYOUT TOAST INSTEAD OF CONSOLE PROMPT/ALERT --- */}
          {successNotice && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-6 text-sm text-center text-emerald-200 border rounded-xl bg-emerald-950/80 border-emerald-500/40 shadow-lg flex flex-col items-center gap-2"
            >
              <span className="text-xl">📬</span>
              <p className="font-medium leading-relaxed">{successNotice}</p>
              <button 
                onClick={() => { setSuccessNotice(''); closeAuthModal(); }}
                className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Got it
              </button>
            </motion.div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 mb-4 text-sm text-red-200 border rounded-lg bg-red-900/30 border-red-500/30">
              {errorMsg}
            </div>
          )}

          {/* Form hidden or visible depending on whether success notice is showing */}
          {!successNotice && (
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
          )}

          {/* Divider */}
          {!successNotice && (
            <>
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-800"></div>
                <span className="px-3 text-xs text-gray-500 uppercase">Or continue with</span>
                <div className="flex-grow border-t border-gray-800"></div>
              </div>

              <div className="mt-6 text-sm text-center text-gray-500">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-purple-400 transition-colors hover:text-purple-300"
                >
                  {isLogin ? 'Sign up for free' : 'Log in here'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}