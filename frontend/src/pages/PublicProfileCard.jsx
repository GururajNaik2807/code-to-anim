import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

export default function PublicProfileCard() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, current_level, current_xp, algorithms_solved, topics_explored, total_executions, longest_streak, created_at')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchPublicProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090B10] flex items-center justify-center font-mono text-purple-400">
        <span className="animate-pulse">Loading Profile Card...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#090B10] flex flex-col items-center justify-center font-sans text-white">
        <div className="text-6xl mb-4">📭</div>
        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
        <p className="text-gray-400 mb-6">This user link is invalid or the profile no longer exists.</p>
        <Link to="/" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors">
          Return to CodeAnim
        </Link>
      </div>
    );
  }

  const displayName = profile.display_name || 'CodeToAnim User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const joinYear = new Date(profile.created_at || Date.now()).getFullYear();

  return (
    <div className="min-h-screen bg-[#090B10] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#090B10] to-[#090B10] flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* The Card */}
        <div className="relative bg-[#121620]/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-900/20 overflow-hidden group">
          
          {/* Animated Card Border Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-purple-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <div className="flex flex-col items-center text-center">
            
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-40 rounded-full"></div>
              <div className="relative w-28 h-28 rounded-full border-4 border-purple-500 bg-gray-900 flex items-center justify-center text-5xl font-black text-white shadow-inner">
                {userInitial}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 border-2 border-[#121620] text-xs font-bold px-2 py-1 rounded-full text-white">
                Lv. {profile.current_level || 1}
              </div>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              {displayName}
            </h1>
            <p className="text-purple-400 font-mono text-sm mb-8">
              @{displayName.toLowerCase().replace(/\s/g, '')} • Member since {joinYear}
            </p>

            {/* Stats Grid */}
            <div className="w-full grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center transition-colors hover:border-purple-500/50">
                <span className="text-2xl mb-1">🧠</span>
                <span className="text-2xl font-black text-white">{profile.algorithms_solved || 0}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Algos Solved</span>
              </div>
              
              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center transition-colors hover:border-indigo-500/50">
                <span className="text-2xl mb-1">📚</span>
                <span className="text-2xl font-black text-white">{profile.topics_explored || 0}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Topics Learned</span>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center transition-colors hover:border-emerald-500/50">
                <span className="text-2xl mb-1">▶️</span>
                <span className="text-2xl font-black text-white">{profile.total_executions || 0}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Code Executions</span>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center transition-colors hover:border-orange-500/50">
                <span className="text-2xl mb-1">🔥</span>
                <span className="text-2xl font-black text-white">{profile.longest_streak || 0}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Day Streak</span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-full text-left mb-2">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                <span>XP Progress</span>
                <span className="text-purple-400">{profile.current_xp || 0} XP</span>
              </div>
              <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  style={{ width: `${Math.min(100, Math.max(0, ((profile.current_xp || 0) / ((profile.current_level || 1) * 500)) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-400 mb-4">Want to master Data Structures & Algorithms?</p>
          <Link 
            to="/auth" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-extrabold text-lg transition-transform hover:scale-105 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          >
            Join CodeToAnim Free 🚀
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}