import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // --- NEW: Confirm state[cite: 3] ---
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    
    // --- NEW: Password Match Guard ---
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });

      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;
      
      setMessage('✨ Password updated successfully! Redirecting...');
      setTimeout(() => navigate('/profile'), 2000);
      
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
    <div className="flex items-center justify-center min-h-screen p-4 bg-black">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 border shadow-2xl bg-gray-900 border-gray-800 rounded-2xl"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-white">Reset Password</h2>
        
        {message && (
          <div className="p-3 mb-4 text-sm text-center border text-emerald-200 rounded-lg bg-emerald-900/30 border-emerald-500/30">
            {message}
          </div>
        )}
        
        {errorMsg && (
          <div className="p-3 mb-4 text-sm text-center border text-red-200 rounded-lg bg-red-900/30 border-red-500/30">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-4">
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

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-400">8-Digit Code</label>
            {/* --- UPDATED: 8-digit OTP format[cite: 3] --- */}
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={8}
              className="w-full px-4 py-2 text-white border rounded-lg tracking-[0.5em] bg-gray-950 border-gray-800 focus:outline-none focus:border-purple-500"
              placeholder="12345678"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-400">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          {/* --- NEW: Confirm Password Field[cite: 3] --- */}
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

          <button
            type="submit"
            disabled={loading || message}
            className="w-full py-2.5 mt-2 font-bold text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Set New Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}