import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mapAuthError } from '../utils/authErrors';

const AUTH_MODE = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT: 'forgot',
};

// --- Clean SVG Icons ---
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function LoginModal() {
  const { isAuthModalOpen, closeAuthModal, modalMessage } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(AUTH_MODE.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const modalRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0 && failedAttempts >= 5) {
      setFailedAttempts(0);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer, failedAttempts]);

  const resetFormState = () => {
    setErrorMsg('');
    setSuccessNotice('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMode(AUTH_MODE.LOGIN);
  };

  const handleClose = () => {
    if (loading) return;
    resetFormState();
    closeAuthModal();
  };

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const focusTimer = setTimeout(() => emailInputRef.current?.focus(), 100);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isAuthModalOpen, mode]);

  const handleOAuth = async (provider) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'OAuth authentication cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      setErrorMsg(`Too many failed attempts. Please wait ${lockoutTimer} seconds.`);
      return;
    }

    setErrorMsg('');
    setSuccessNotice('');

    const normalizedEmail = email.trim().toLowerCase();
    
    if (mode === AUTH_MODE.SIGNUP && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === AUTH_MODE.FORGOT) {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
        if (error) throw error;
        setSuccessNotice('Recovery instructions sent to your email.');
      } else if (mode === AUTH_MODE.SIGNUP) {
        const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });
        if (error) throw error;
        if (data.session) {
          setFailedAttempts(0);
          handleClose();
          navigate('/profile');
        } else {
          setSuccessNotice('Check your email to verify your account.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        setFailedAttempts(0);
        handleClose();
        navigate('/profile');
      }
    } catch (err) {
      if (mode === AUTH_MODE.LOGIN) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutTimer(30);
          setErrorMsg('Too many failed login attempts. Locked for 30 seconds.');
        } else {
          setErrorMsg(`${mapAuthError(err)} (${5 - newAttempts} attempts remaining)`);
        }
      } else {
        setErrorMsg(mapAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const getLoadingLabel = () => {
    if (lockoutTimer > 0) return `Wait ${lockoutTimer}s...`;
    if (loading) {
      return (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      );
    }
    if (mode === AUTH_MODE.LOGIN) return 'Log In';
    if (mode === AUTH_MODE.SIGNUP) return 'Sign Up';
    return 'Send Instructions';
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop - Stronger blur and opacity */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Card - Narrower max-width for compact look */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 8 }} transition={{ duration: 0.2 }}
            className="relative w-full max-w-[400px] my-8 z-10"
          >
            <div className="w-full bg-(--canvas-paper) border border-(--ink-line-strong) rounded-2xl p-6 shadow-2xl text-(--ink) font-sans">
              
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-(--ink-muted) hover:text-(--ink) transition-colors"
              >
                ✕
              </button>

              <div className="mb-5 text-center">
                <img src="/favicon.svg" alt="Logo" className="w-7 h-7 mx-auto mb-2 opacity-90" />
                <h2 className="text-xl font-bold tracking-tight text-(--ink)">
                  {mode === AUTH_MODE.LOGIN && 'Log in to CodeToAnim'}
                  {mode === AUTH_MODE.SIGNUP && 'Create your account'}
                  {mode === AUTH_MODE.FORGOT && 'Reset your password'}
                </h2>
              </div>

              {modalMessage && !successNotice && (
                <div className="p-3 mb-4 text-sm text-(--cobalt) bg-(--cobalt-tint) border border-(--cobalt)/30 rounded-lg font-medium text-center shadow-inner">
                  {modalMessage}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 mb-4 text-sm text-(--vermilion) bg-(--vermilion-tint) border border-(--vermilion)/30 rounded-lg font-medium">
                  {errorMsg}
                </div>
              )}

              {successNotice ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-(--teal-tint) text-(--teal) flex items-center justify-center mx-auto mb-4 border border-(--teal)/30">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-sm text-(--ink-secondary) mb-5 font-medium">{successNotice}</p>
                  <button onClick={handleClose} className="w-full py-2.5 bg-(--canvas-tint) hover:bg-(--canvas-dark) text-(--ink) text-sm font-bold rounded-lg border border-(--ink-line) transition-colors">
                    Close Window
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-sm font-bold text-(--ink) mb-1.5">Email address</label>
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={320}
                        required
                        disabled={loading || lockoutTimer > 0}
                        placeholder="name@gmail.com"
                        className="w-full px-3.5 py-2.5 bg-(--canvas-tint) border border-(--ink-line) focus:border-(--cobalt) focus:ring-1 focus:ring-(--cobalt) rounded-lg text-sm text-(--ink) placeholder-(--ink-muted) outline-none transition-all disabled:opacity-50 shadow-inner"
                      />
                    </div>

                    {mode !== AUTH_MODE.FORGOT && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-sm font-bold text-(--ink)">Password</label>
                          {mode === AUTH_MODE.LOGIN && (
                            <button type="button" onClick={() => { setMode(AUTH_MODE.FORGOT); setErrorMsg(''); }} className="text-xs font-bold text-(--cobalt) hover:text-(--cobalt-dark) transition-colors disabled:opacity-50">
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            maxLength={128}
                            required
                            disabled={loading || lockoutTimer > 0}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 pr-10 bg-(--canvas-tint) border border-(--ink-line) focus:border-(--cobalt) focus:ring-1 focus:ring-(--cobalt) rounded-lg text-sm text-(--ink) placeholder-(--ink-muted) outline-none transition-all disabled:opacity-50 shadow-inner"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading || lockoutTimer > 0} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--ink-muted) hover:text-(--ink) disabled:opacity-50">
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                      </div>
                    )}

                    {mode === AUTH_MODE.SIGNUP && (
                      <div>
                        <label className="block text-sm font-bold text-(--ink) mb-1.5">Confirm password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            maxLength={128}
                            required
                            disabled={loading || lockoutTimer > 0}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 pr-10 bg-(--canvas-tint) border border-(--ink-line) focus:border-(--cobalt) focus:ring-1 focus:ring-(--cobalt) rounded-lg text-sm text-(--ink) placeholder-(--ink-muted) outline-none transition-all disabled:opacity-50 shadow-inner"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading || lockoutTimer > 0} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--ink-muted) hover:text-(--ink) disabled:opacity-50">
                            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || lockoutTimer > 0}
                      className="w-full mt-2 py-2.5 bg-(--cobalt) hover:bg-(--cobalt-dark) text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50 flex justify-center shadow-sm"
                    >
                      {getLoadingLabel()}
                    </button>
                  </form>

                  {/* Compact OAuth Buttons below form */}
                  {mode !== AUTH_MODE.FORGOT && (
                    <>
                      <div className="flex items-center my-5">
                        <div className="flex-1 border-t border-(--ink-line)"></div>
                        <span className="px-3 text-xs text-(--ink-muted) font-semibold uppercase tracking-wider">OR</span>
                        <div className="flex-1 border-t border-(--ink-line)"></div>
                      </div>

                      <div className="text-center mb-2">
                        <p className="text-sm font-bold text-(--ink) mb-3">Or continue with:</p>
                        <div className="flex items-center justify-center gap-4">
                          <button 
                            onClick={() => handleOAuth('github')} 
                            disabled={loading || lockoutTimer > 0}
                            type="button" 
                            className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-900 rounded-xl transition-colors border border-gray-200 shadow-sm disabled:opacity-50"
                            title="Continue with GitHub"
                          >
                            <GithubIcon />
                          </button>
                          <button 
                            onClick={() => handleOAuth('google')} 
                            disabled={loading || lockoutTimer > 0}
                            type="button" 
                            className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 shadow-sm disabled:opacity-50"
                            title="Continue with Google"
                          >
                            <GoogleIcon />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Footer Links */}
              {!successNotice && (
                <div className="mt-5 text-center text-sm font-medium text-(--ink-secondary)">
                  {mode === AUTH_MODE.LOGIN ? (
                    <p>Don't have an account? <button onClick={() => { setMode(AUTH_MODE.SIGNUP); setErrorMsg(''); }} disabled={loading} className="text-(--cobalt) hover:text-(--cobalt-dark) font-bold ml-1 disabled:opacity-50">Sign up</button></p>
                  ) : (
                    <p>Already have an account? <button onClick={() => { setMode(AUTH_MODE.LOGIN); setErrorMsg(''); }} disabled={loading} className="text-(--cobalt) hover:text-(--cobalt-dark) font-bold ml-1 disabled:opacity-50">Log in</button></p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}