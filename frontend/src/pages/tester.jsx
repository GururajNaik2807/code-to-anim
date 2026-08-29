import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function TesterEnrollment({ user, bgPanel, bgMain, metallicBorder, accentBg, accentText, textPrimary, textSecondary }) {
  const [isEnrolled, setIsEnrolled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEnrollmentStatus = async () => {
      if (!user?.id) return;

      try {
        setFetchError(null);
        // Updated to .maybeSingle() to prevent single row lookup crashes for new accounts
        const { data, error } = await supabase
          .from('profiles')
          .select('is_tester')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (isMounted && data) {
          setIsEnrolled(data.is_tester === true);
        } else if (isMounted) {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error("🚨 Tester Fetch Error:", error.message, error.details);
        if (isMounted) setFetchError(error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEnrollmentStatus();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleEnrollClick = async () => {
    if (!user?.id || isEnrolled) return;
    
    setEnrolling(true);
    
    try {
      const { error } = await supabase.rpc('enroll_as_tester');
      if (error) throw error;
      setIsEnrolled(true);
    } catch (error) {
      console.error("🚨 Enrollment Error:", error);
      alert("Something went wrong during enrollment. Check the console.");
    } finally {
      setEnrolling(false);
    }
  };

  if (!user?.id) return null;

  if (loading) {
    return (
      <div className={`w-full p-6 border ${metallicBorder} ${bgPanel} rounded-3xl shadow-sm flex flex-col justify-center items-center h-40`}>
        <div className={`w-6 h-6 border-2 border-t-transparent ${metallicBorder} rounded-full animate-spin mb-2`}></div>
        <span className={`text-xs ${textSecondary}`}>Loading Tester Status...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full p-6 border border-red-500/50 bg-red-500/10 rounded-3xl shadow-sm flex flex-col items-center text-center">
        <span className="text-2xl mb-2">⚠️</span>
        <h3 className="text-sm font-bold text-red-400">Could not load Tester component</h3>
        <p className="text-[10px] text-red-400/70 mt-1">{fetchError}</p>
        <p className="text-[9px] text-red-400/50 mt-2">Did you run the SQL to add the is_tester column?</p>
      </div>
    );
  }

  return (
    <div className={`w-full p-6 border ${metallicBorder} ${bgPanel} rounded-3xl shadow-sm flex flex-col items-center text-center relative overflow-hidden`}>
      {/* Background glow using theme accent color */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${accentBg} rounded-full blur-[60px] opacity-20 pointer-events-none`}></div>
      
      <div className={`w-12 h-12 rounded-2xl ${bgMain} border ${metallicBorder} flex items-center justify-center text-xl shadow-sm mb-4`}>
        🧪
      </div>
      
      <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Become a CodeToAnim Tester</h3>
      <p className={`text-sm font-medium ${textSecondary} mb-6 max-w-md`}>
        Help shape the future of algorithm visualization. Join our testing program and unlock exclusive lifetime perks!
      </p>

      <div className="flex flex-col gap-2 mb-6 w-full max-w-xs text-left">
        <div className={`flex items-center gap-2 text-sm ${textPrimary}`}><span className={`${accentText} font-black`}>✓</span> Unlimited access time</div>
        <div className={`flex items-center gap-2 text-sm ${textPrimary}`}><span className={`${accentText} font-black`}>✓</span> Unlimited lifetime execution</div>
        <div className={`flex items-center gap-2 text-sm ${textPrimary}`}><span className={`${accentText} font-black`}>✓</span> Early access to new algorithms</div>
      </div>

      <div className="h-[48px] w-full flex justify-center z-10">
        <AnimatePresence mode="wait">
          {isEnrolled ? (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full max-w-xs py-3 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center"
            >
              ✅ You are already enrolled!
            </motion.div>
          ) : (
            <motion.button
              key="enroll-button"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={handleEnrollClick}
              disabled={enrolling}
              className={`w-full max-w-xs py-3 ${accentBg} hover:opacity-80 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {isEnrolled && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-[10px] uppercase tracking-wider ${textSecondary} mt-4 font-bold`}
          >
            Manual access will be granted shortly.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}