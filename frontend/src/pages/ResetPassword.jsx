import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const validatePasswordStrength = (pass) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(pass);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedOtp = otp.trim();

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    
    if (!validatePasswordStrength(newPassword)) {
      setErrorMsg('Password must be at least 8 chars, containing an uppercase, lowercase, number, and special character.');
      return;
    }
    
    if (sanitizedOtp.length !== 8) {
      setErrorMsg('Please enter a valid 8-digit recovery code.');
      return;
    }
    
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email: sanitizedEmail, token: sanitizedOtp, type: 'recovery' });
      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      
      setMessage('Password updated successfully. Redirecting to workspace...');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to update password. The code may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-(--canvas) font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] p-8 border border-(--ink-line-strong) shadow-2xl bg-(--canvas-paper) rounded-2xl"
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-(--ink)">Secure New Password</h2>
          <p className="text-sm font-medium text-(--ink-secondary) mt-2">Enter your recovery code and new credentials below.</p>
        </div>
        
        {message && (
          <div className="p-3 mb-5 text-sm text-(--teal) bg-(--teal-tint) border border-(--teal)/30 rounded-lg font-medium">
            {message}
          </div>
        )}
        
        {errorMsg && (
          <div className="p-3 mb-5 text-sm text-(--vermilion) bg-(--vermilion-tint) border border-(--vermilion)/30 rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-(--ink) mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-(--canvas-tint) border border-(--ink-line) focus:border-(--cobalt) focus:ring-1 focus:ring-(--cobalt) rounded-lg text-sm text-(--ink) placeholder-(--ink-muted) outline-none transition-all shadow-inner"
              placeholder="name@work-email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-(--ink) mb-1.5">Recovery code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              maxLength={8}
              className="w-full px-3.5 py-2.5 bg-(--canvas-tint) border border-(--ink-line) focus:border-(--cobalt) focus:ring-1 focus:ring-(--cobalt) rounded-lg text-sm text-(--ink) placeholder-(--ink-muted) tracking-[0.5em] outline-none transition-all shadow-inner font-mono"
              placeholder="12345678"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-(--ink) mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 pr-10 bg-(--canvas-tint) border border-(--ink-line) focus:border-(--cobalt) focus:ring-1 focus:ring-(--cobalt) rounded-lg text-sm text-(--ink) placeholder-(--ink-muted) outline-none transition-all shadow-inner"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--ink-muted) hover:text-(--ink)">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p className="mt-2 text-xs font-medium text-(--ink-secondary)">Min 8 chars, include uppercase, lowercase, number & symbol.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-(--ink) mb-1.5">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 pr-10 bg-(--canvas-tint) border border-(--ink-line) focus:border-(--cobalt) focus:ring-1 focus:ring-(--cobalt) rounded-lg text-sm text-(--ink) placeholder-(--ink-muted) outline-none transition-all shadow-inner"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--ink-muted) hover:text-(--ink)">
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(message)}
            className="w-full mt-4 py-3 bg-(--cobalt) hover:bg-(--cobalt-dark) text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50 flex justify-center shadow-sm"
          >
            {loading ? 'Securing Account...' : 'Set New Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}