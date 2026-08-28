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
      <div className="h-screen w-full flex flex-col items-center justify-center font-mono bg-[#F5F2EB] text-[#202124] overflow-hidden">
        <div className="w-10 h-10 border-4 border-[#E8E3D8] border-t-[#31599B] rounded-full animate-spin"></div>
        <span className="mt-4 text-xs font-bold tracking-widest uppercase text-[#5E5B55] animate-pulse">Loading Profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center font-sans bg-[#F5F2EB] text-[#202124] p-6 overflow-hidden">
        <div className="text-5xl mb-4 opacity-50">📭</div>
        <h1 className="text-2xl font-black mb-2 tracking-tight">Profile Not Found</h1>
        <p className="text-[#817D74] mb-8 font-medium">This user link is invalid or the profile no longer exists.</p>
        <Link to="/" className="px-6 py-3 bg-[#31599B] text-white hover:bg-[#274B85] rounded-xl font-bold transition-colors shadow-sm">
          Return to CodeToAnim
        </Link>
      </div>
    );
  }

  const displayName = profile.display_name || 'CodeToAnim User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const joinYear = new Date(profile.created_at || Date.now()).getFullYear();
  const currentLevel = profile.current_level || 1;
  const xpNeeded = currentLevel * 500;
  const progressPercent = Math.min(100, Math.max(0, ((profile.current_xp || 0) / xpNeeded) * 100));

  return (
    <div className="h-screen w-full bg-[#F5F2EB] flex flex-col items-center justify-center p-4 sm:p-6 font-sans overflow-hidden relative">
      
      {/* Decorative Background Glows matching the warm light mode aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute w-[600px] h-[600px] bg-[#EAF0FA] rounded-full blur-[100px] opacity-80 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute w-[500px] h-[500px] bg-[#FCEFEA] rounded-full blur-[100px] opacity-50 -translate-x-1/3 translate-y-1/4"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* The Profile Card */}
        <div className="bg-[#FFFEFA] border border-[#E8E3D8] rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgba(35,30,20,0.06)] overflow-hidden relative group">
          
          <div className="flex flex-col items-center text-center relative z-10">
            
            {/* Avatar */}
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-[#EAF0FA] blur-xl rounded-full scale-150"></div>
              <div className="relative w-24 h-24 rounded-full border-4 border-[#FFFEFA] bg-[#EAF0FA] flex items-center justify-center text-4xl font-black text-[#31599B] shadow-md">
                {userInitial}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#FFFEFA] p-1 rounded-full shadow-sm">
                <div className="bg-[#31599B] text-[10px] font-bold px-2 py-0.5 rounded-full text-white tracking-wider">
                  Lv. {currentLevel}
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight mb-1">
              {displayName}
            </h1>
            <p className="text-[#817D74] font-mono text-xs sm:text-sm mb-6 font-medium">
              @{displayName.toLowerCase().replace(/\s/g, '')} • Since {joinYear}
            </p>

            {/* Stats Grid */}
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#F8F5EE] border border-[#E8E3D8] rounded-2xl p-3 flex flex-col items-center justify-center transition-colors hover:border-[#D9D1C4] hover:bg-[#F1EEE7]">
                <span className="text-xl mb-1">🧠</span>
                <span className="text-xl font-black text-[#202124]">{profile.algorithms_solved || 0}</span>
                <span className="text-[9px] text-[#817D74] uppercase font-bold tracking-wider mt-0.5 text-center">Algos Solved</span>
              </div>
              
              <div className="bg-[#F8F5EE] border border-[#E8E3D8] rounded-2xl p-3 flex flex-col items-center justify-center transition-colors hover:border-[#D9D1C4] hover:bg-[#F1EEE7]">
                <span className="text-xl mb-1">📚</span>
                <span className="text-xl font-black text-[#202124]">{profile.topics_explored || 0}</span>
                <span className="text-[9px] text-[#817D74] uppercase font-bold tracking-wider mt-0.5 text-center">Topics Learned</span>
              </div>

              <div className="bg-[#F8F5EE] border border-[#E8E3D8] rounded-2xl p-3 flex flex-col items-center justify-center transition-colors hover:border-[#D9D1C4] hover:bg-[#F1EEE7]">
                <span className="text-xl mb-1">▶️</span>
                <span className="text-xl font-black text-[#202124]">{profile.total_executions || 0}</span>
                <span className="text-[9px] text-[#817D74] uppercase font-bold tracking-wider mt-0.5 text-center">Executions</span>
              </div>

              <div className="bg-[#F8F5EE] border border-[#E8E3D8] rounded-2xl p-3 flex flex-col items-center justify-center transition-colors hover:border-[#D9D1C4] hover:bg-[#F1EEE7]">
                <span className="text-xl mb-1">🔥</span>
                <span className="text-xl font-black text-[#202124]">{profile.longest_streak || 0}</span>
                <span className="text-[9px] text-[#817D74] uppercase font-bold tracking-wider mt-0.5 text-center">Day Streak</span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-full text-left">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <span className="text-[#817D74]">XP Progress</span>
                <span className="text-[#31599B]">{profile.current_xp || 0} / {xpNeeded} XP</span>
              </div>
              <div className="h-2.5 w-full bg-[#F5F2EB] border border-[#E8E3D8] rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-[#31599B] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center relative z-10"
        >
          <p className="text-xs text-[#5E5B55] mb-3 font-medium">Want to master Data Structures & Algorithms?</p>
          <Link 
            to="/auth" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FFFEFA] text-[#202124] border border-[#E8E3D8] hover:bg-[#F1EEE7] hover:border-[#D9D1C4] rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            Join CodeToAnim For Free 
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}