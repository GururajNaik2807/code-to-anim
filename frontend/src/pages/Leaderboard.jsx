import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

// --- Animated Particle Component ---
const FloatingParticles = ({ isMobile }) => {
  const particleCount = isMobile ? 40 : 175; 
  const particleColors = ["#A855F7", "#22D3EE", "#EC4899"];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(particleCount)].map((_, i) => {
        const size = Math.random() * (isMobile ? 3 : 6) + 2;
        const color = particleColors[i % particleColors.length];
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -300 - 100],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, Math.random() * 0.5 + 0.2, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + (isMobile ? 8 : 5),
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        );
      })}
    </div>
  );
};

// --- Level System Definitions ---
const HONORS = [
  "Novice", "Beginner", "Apprentice", "Coder", "Scripter", 
  "Programmer", "Developer", "Engineer", "Architect", "Master", 
  "Grandmaster", "Algorithmist", "Code Weaver", "Logic Lord", "Byte Sorcerer", 
  "System Sage", "Kernel Knight", "Tech Titan", "Silicon Deity", "CodeAnim Legend"
];

const calculateLevelInfo = (totalXP) => {
  let level = 1;
  const maxLevel = 20;
  for (let i = 1; i <= maxLevel; i++) {
    const reqXP = (i - 1) * i * 250;
    if (totalXP >= reqXP) level = i;
    else break;
  }
  return {
    level,
    honor: HONORS[level - 1] || "Legend",
    totalXP
  };
};

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Responsive States
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const { currentTheme, changeTheme } = useTheme(); 
  const isDark = currentTheme === 'dark';

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    checkMobile(); 
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUser(session.user);

    try {
      // Fetch Top 50 Users ordered by XP
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, current_xp, created_at')
        .order('current_xp', { ascending: false })
        .limit(50);
      
      setLeaderboard(data || []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate('/');
    }, 2000);
  };

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    changeTheme(newTheme);
    if (user?.id) {
      await supabase.from('profiles').update({ selected_theme: newTheme }).eq('id', user.id);
    }
  };

  // Professional Theme Variables
  const bgMain = isDark ? 'bg-[#0A0D14]' : 'bg-[#F4F6F8]';
  const bgPanel = isDark ? 'bg-[#10141D]' : 'bg-[#FFFFFF]';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  
  const metallicBorder = isDark 
    ? 'border border-slate-800/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)]' 
    : 'border border-slate-200/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.05)]';
  
  const hoverBg = isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50';

  const scrollbarStyles = `
    [&::-webkit-scrollbar]:w-1.5 
    [&::-webkit-scrollbar-track]:bg-transparent 
    [&::-webkit-scrollbar-thumb]:rounded-full 
    ${isDark 
      ? '[&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-slate-700' 
      : '[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'
    }
  `;

  const navLinks = [
    { section: 'WORKSPACE', links: [{ name: 'Workspace', path: '/workspace', icon: '⚡' }] },
    { section: 'ALGORITHMS', links: [{ name: 'My Algorithms', path: '/profile', icon: '📂' }] },
    { section: 'COMMUNITY', links: [
      { name: 'Leaderboard', path: '/leaderboard', icon: '🏆', active: true },
      { name: 'Discussions', path: '#', icon: '💬', tag: 'Soon', tagColor: isDark ? 'bg-indigo-900/40 text-indigo-400 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-300' }
    ]}
  ];

  if (loading) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center font-mono gap-4 ${bgMain} ${textPrimary}`}>
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm tracking-widest text-indigo-400 uppercase font-bold animate-pulse">Loading Rankings...</p>
      </div>
    );
  }

  // Extract Top 3 for Podium
  const top3 = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  // Helper to render podium cards
  const renderPodiumCard = (player, rank) => {
    if (!player) return null;
    const { level, honor, totalXP } = calculateLevelInfo(player.current_xp || 0);
    const initial = (player.display_name || 'U').charAt(0).toUpperCase();
    
    // Podium Styling based on rank
    let rankColors = '';
    let glow = '';
    let badge = '';
    
    if (rank === 1) {
      rankColors = 'from-amber-400 to-yellow-600 border-yellow-500/50 text-yellow-900';
      glow = 'shadow-[0_0_30px_rgba(251,191,36,0.3)]';
      badge = '🥇';
    } else if (rank === 2) {
      rankColors = 'from-slate-300 to-slate-500 border-slate-400/50 text-slate-900';
      glow = 'shadow-[0_0_20px_rgba(148,163,184,0.2)]';
      badge = '🥈';
    } else if (rank === 3) {
      rankColors = 'from-orange-400 to-amber-700 border-orange-500/50 text-orange-950';
      glow = 'shadow-[0_0_20px_rgba(217,119,6,0.2)]';
      badge = '🥉';
    }

    return (
      <div className={`podium-card flex flex-col items-center p-6 rounded-3xl ${metallicBorder} ${bgPanel}/90 backdrop-blur-md ${glow} relative overflow-hidden flex-1 max-w-[280px] hover:-translate-y-2 transition-transform duration-300 ${rank === 1 ? 'md:-mt-8 z-10 scale-105' : 'opacity-95'}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${rankColors} rounded-full blur-3xl opacity-20 pointer-events-none`}></div>
        
        <div className="absolute top-4 right-4 text-2xl drop-shadow-md">{badge}</div>
        <div className="absolute top-4 left-4 text-xs font-black text-slate-400">#{rank}</div>
        
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${rankColors} flex items-center justify-center text-3xl font-black shadow-lg mb-4 mt-2 border-2 ${isDark ? 'border-[#10141D]' : 'border-white'}`}>
          {initial}
        </div>
        
        <h3 className="font-bold text-lg tracking-tight truncate w-full text-center">{player.display_name || 'Anonymous'}</h3>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${textSecondary} mt-1 mb-4`}>{honor}</p>
        
        <div className={`w-full py-2 px-3 rounded-xl ${metallicBorder} ${isDark ? 'bg-slate-900/60' : 'bg-slate-50'} flex justify-between items-center shadow-inner`}>
          <span className={`text-xs font-bold ${textSecondary}`}>Lv. {level}</span>
          <span className="text-sm font-black text-indigo-500">{totalXP.toLocaleString()} XP</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-screen w-screen font-sans ${bgMain} ${textPrimary} overflow-hidden relative`}>
      
      {/* Dynamic Background Particles */}
      <FloatingParticles isMobile={isMobile} />

      {/* MOBILE-ONLY CSS OVERRIDES: Guarantees PC View Remains Untouched */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-container {
            position: absolute !important;
            height: 100% !important;
            z-index: 50 !important;
            box-shadow: 5px 0 20px rgba(0,0,0,0.5) !important;
          }
          
          .mobile-header {
            height: auto !important;
            padding: 12px 16px !important;
          }
          
          .podium-container {
            flex-direction: column !important;
            gap: 20px !important;
            align-items: center !important;
            padding-bottom: 24px !important;
          }
          
          .podium-card {
            width: 100% !important;
            max-width: 100% !important;
            margin-top: 0 !important;
            transform: none !important;
          }

          .table-container {
            padding: 12px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>

      {isLoggingOut && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className={`relative w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center transform transition-all ${metallicBorder} ${isDark ? 'bg-[#10141D] text-white' : 'bg-white text-slate-900'}`}>
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-3xl mb-4 border border-emerald-500/30 shadow-inner">👋</div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">Successfully Logged Out</h2>
            <p className={`text-sm leading-relaxed mb-6 ${textSecondary}`}>Redirecting you to home...</p>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'} ${metallicBorder} shadow-none`}>
              <div className="h-full bg-emerald-500 w-full animate-[pulse_1s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Matches ProfilePage) */}
      <div className={`sidebar-container transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden relative z-20 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        <aside className={`w-64 h-full ${metallicBorder} border-y-0 border-l-0 ${bgPanel}/95 backdrop-blur-md flex flex-col justify-between overflow-y-auto ${scrollbarStyles}`}>
          <div>
            <div className="h-16 flex items-center px-6 font-extrabold text-xl tracking-tight border-b border-transparent">
              <img src="/favicon.svg" alt="CodeToAnim Logo" className="w-7 h-7 mr-2 rounded-md object-contain" />
              <span className={isDark ? 'text-white' : 'text-slate-900'}>CodeTo</span>
              <span className="text-indigo-500 ml-1">Anim</span>
            </div>
            <div className="px-4 py-4">
              <Link to="/profile" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${hoverBg}`}>
                <span className="opacity-80">🏠</span> Dashboard
              </Link>
            </div>
            <div className="px-4 pb-6">
              {navLinks.map((group, idx) => (
                <div key={idx} className="mt-6">
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 px-4 ${textSecondary}`}>{group.section}</h4>
                  <div className="space-y-1">
                    {group.links.map((link, lIdx) => (
                      <Link key={lIdx} to={link.path} className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${link.active ? (isDark ? 'text-white bg-slate-800/40 shadow-inner border border-slate-700/50' : 'text-slate-900 bg-slate-100 shadow-sm border border-slate-200') : `${textSecondary} ${hoverBg}`}`}>
                        <span className="opacity-80">{link.icon}</span>{link.name}
                        {link.tag && (
                          <span className={`ml-auto text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${link.tagColor}`}>
                            {link.tag}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`p-4 ${metallicBorder} border-x-0 border-b-0`}>
            <button onClick={toggleTheme} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl ${metallicBorder} ${hoverBg} transition-colors shadow-sm`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <span>{isDark ? '🌙' : '☀️'}</span>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Theme</span>
              </div>
              <span className={`text-xs font-medium ${textSecondary}`}>{isDark ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className={`h-16 flex-shrink-0 ${metallicBorder} border-x-0 border-t-0 ${bgPanel}/80 backdrop-blur-md flex items-center justify-between px-8 z-10 transition-all mobile-header`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl ${metallicBorder} ${hoverBg} transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm group`}
              aria-label="Toggle Sidebar"
            >
              <svg 
                className={`w-5 h-5 ${textSecondary} group-hover:text-indigo-500 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/workspace" className={`flex items-center gap-2 px-4 py-1.5 ${metallicBorder} rounded-xl text-sm font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-500 transition-colors ${isDark ? 'bg-slate-900/60' : 'bg-white'}`}>
              ⚡ <span className="hidden sm:inline">Workspace</span>
            </Link>
            <div className={`flex items-center gap-3 cursor-pointer pl-4 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`} onClick={handleLogout}>
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm ${metallicBorder} shadow-md`}>
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 ${scrollbarStyles}`}>
          <div className="max-w-5xl mx-auto space-y-12 pb-10">
            
            {/* Header Title */}
            <div className="text-center space-y-3 mt-4">
              <h1 className="text-4xl font-black tracking-tight drop-shadow-md">Global Rankings</h1>
              <p className={`text-sm font-medium ${textSecondary}`}>Top 50 developers by total XP across CodeToAnim.</p>
            </div>

            {/* Podium Section (Top 3) */}
            {top3.length > 0 && (
              <div className="podium-container flex flex-col md:flex-row justify-center items-end gap-6 pt-4 pb-8">
                {/* 2nd Place */}
                {top3.length > 1 && renderPodiumCard(top3[1], 2)}
                
                {/* 1st Place */}
                {renderPodiumCard(top3[0], 1)}
                
                {/* 3rd Place */}
                {top3.length > 2 && renderPodiumCard(top3[2], 3)}
              </div>
            )}

            {/* Leaderboard List (Rank 4+) */}
            {restOfLeaderboard.length > 0 && (
              <div className={`table-container ${bgPanel}/90 backdrop-blur-md ${metallicBorder} rounded-3xl p-6 shadow-sm`}>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                        <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Rank</th>
                        <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Developer</th>
                        <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Level</th>
                        <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${textSecondary} text-right`}>Total XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restOfLeaderboard.map((player, index) => {
                        const rank = index + 4;
                        const { level, honor, totalXP } = calculateLevelInfo(player.current_xp || 0);
                        const isCurrentUser = user && player.id === user.id;

                        return (
                          <tr 
                            key={player.id} 
                            className={`border-b last:border-b-0 transition-colors ${
                              isCurrentUser 
                                ? (isDark ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200') 
                                : (isDark ? 'border-slate-800 hover:bg-slate-900/50' : 'border-slate-200 hover:bg-slate-50')
                            }`}
                          >
                            <td className="py-4 px-6">
                              <span className={`text-sm font-bold ${textSecondary}`}>#{rank}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                                  isCurrentUser ? 'bg-indigo-500' : 'bg-slate-500'
                                }`}>
                                  {(player.display_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className={`font-bold text-sm flex items-center gap-2 ${isCurrentUser ? 'text-indigo-500' : textPrimary}`}>
                                    {player.display_name || 'Anonymous'}
                                    {isCurrentUser && <span className={`text-[9px] px-1.5 py-0.5 rounded border ${isDark ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-indigo-100 border-indigo-300 text-indigo-700'}`}>YOU</span>}
                                  </div>
                                  <div className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>{honor}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${metallicBorder} ${isDark ? 'bg-slate-900/60 text-slate-300' : 'bg-white text-slate-700'}`}>
                                Lv. {level}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="text-sm font-black text-indigo-500">{totalXP.toLocaleString()} XP</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}