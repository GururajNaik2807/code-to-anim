import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LoginModal() {
  const { isAuthModalOpen, modalMessage, closeAuthModal } = useAuth();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- NEW: Confirm password & visibility states ---
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isAuthModalOpen) return null;

  const resetState = () => {
    setErrorMsg('');
    setSuccessNotice('');
    setEmail('');
    setPassword('');
    setConfirmPassword(''); // Reset confirm password[cite: 2]
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMode('login');
  };

  const handleClose = () => {
    resetState();
    closeAuthModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessNotice('');

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessNotice('✨ Code sent! Click below to enter your OTP and choose a new password.');
        
      } else if (mode === 'signup') {
        // --- NEW: Password Match Guard ---
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.session) {
          handleClose();
          navigate('/profile');
        } else {
          setSuccessNotice('✨ Verification email sent! Please check your inbox & spam folder.');
        }
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        handleClose();
        navigate('/profile');
      }
      
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reusable Eye Icons
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  
  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md p-6 overflow-y-auto border shadow-2xl sm:p-8 bg-gray-900 border-gray-800 rounded-2xl max-h-[95vh]"
        >
          <button 
            onClick={handleClose}
            className="absolute p-2 text-gray-400 transition-colors top-4 right-4 hover:text-white"
          >
            ✕
          </button>

          <h2 className="mb-2 text-2xl font-bold text-center text-white">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create an Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          
          {modalMessage && (
            <div className="p-3 mb-6 text-sm text-center text-purple-200 border rounded-lg bg-purple-900/30 border-purple-500/30">
              {modalMessage}
            </div>
          )}

          {successNotice && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 p-4 mb-6 text-sm text-center border shadow-lg text-emerald-200 rounded-xl bg-emerald-950/80 border-emerald-500/40"
            >
              <span className="text-xl">📬</span>
              <p className="font-medium leading-relaxed">{successNotice}</p>
              <button 
                onClick={() => {
                  if (mode === 'forgot') {
                    closeAuthModal();
                    navigate('/reset-password');
                  } else {
                    handleClose();
                  }
                }}
                className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
              >
                {mode === 'forgot' ? 'Enter Code' : 'Got it'}
              </button>
            </motion.div>
          )}

          {errorMsg && (
            <div className="p-3 mb-4 text-sm text-red-200 border rounded-lg bg-red-900/30 border-red-500/30">
              {errorMsg}
            </div>
          )}

          {!successNotice && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 text-white border rounded-lg bg-gray-950 border-gray-800 focus:outline-none focus:border-purple-500"
                  placeholder="you@example.com"
                />
              </div>
              
              {mode !== 'forgot' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-400">Password</label>
                      {mode === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => setMode('forgot')}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    {/* --- NEW: Relative wrapper with eye icon toggle --- */}
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-2 pr-10 text-white border rounded-lg bg-gray-950 border-gray-800 focus:outline-none focus:border-purple-500"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-200"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {/* --- NEW: Confirm Password Field (Only on Signup) --- */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-400">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full px-4 py-2 pr-10 text-white border rounded-lg bg-gray-950 border-gray-800 focus:outline-none focus:border-purple-500"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-200"
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 font-bold text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  mode === 'login' ? 'Log In' : 
                  mode === 'signup' ? 'Sign Up' : 'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {!successNotice && (
            <div className="mt-6 text-sm text-center text-gray-500">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErrorMsg('');
                  setConfirmPassword(''); // Reset confirm field on switch[cite: 2]
                }}
                className="font-medium text-purple-400 transition-colors hover:text-purple-300"
              >
                {mode === 'login' ? 'Sign up for free' : 'Log in here'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}