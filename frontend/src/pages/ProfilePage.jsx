import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// 1. IMPORT YOUR FULL ALGORITHM DATABASE HERE:
import { ALGORITHMS_DATABASE } from './LearnPage';

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
  
  const isMax = level === maxLevel;
  const currentLevelBaseXP = (level - 1) * level * 250;
  const nextLevelXP = isMax ? currentLevelBaseXP : level * (level + 1) * 250;
  
  const xpIntoLevel = totalXP - currentLevelBaseXP;
  const xpNeededForLevel = nextLevelXP - currentLevelBaseXP;
  const progressPercent = isMax ? 100 : Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpNeededForLevel) * 100)));
  const xpRemaining = isMax ? 0 : nextLevelXP - totalXP;
  
  return { level, honor: HONORS[level - 1] || "Legend", totalXP, nextLevelXP, progressPercent, xpRemaining, isMax };
};

export default function ProfilePage() {
  const hasLoadedBefore = sessionStorage.getItem('profile_loaded') === 'true';

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedCodes, setSavedCodes] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]); 
  
  // View Toggle State: 'dashboard' | 'leaderboard' | 'library'
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Sidebar Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Library States
  const [libSearchTerm, setLibSearchTerm] = useState('');
  const [libCategory, setLibCategory] = useState('All');
  const [libDifficulty, setLibDifficulty] = useState('All');

  const [loading, setLoading] = useState(!hasLoadedBefore);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [shareText, setShareText] = useState('Share Profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  const { currentTheme, changeTheme } = useTheme(); 
  const { openAuthModal } = useAuth();
  const isDark = currentTheme === 'dark';

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);

    try {
      const [
        { data: profileData },
        { data: codesData },
        { data: progData },
        { data: actData },
        { data: logData },
        { data: topPlayersData } 
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('saved_algorithms').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }).limit(20),
        supabase.from('user_progress').select('*').eq('user_id', session.user.id).order('last_accessed', { ascending: false }).limit(200),
        supabase.from('daily_activity').select('*').eq('user_id', session.user.id).order('activity_date', { ascending: false }).limit(84),
        supabase.from('activity_logs').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id, display_name, current_xp').order('current_xp', { ascending: false }).limit(50)
      ]);

      setProfile(profileData || {});
      setSavedCodes(codesData || []);
      setProgressData(progData || []);
      setDailyActivity(actData || []);
      setRecentActivities(logData || []);
      setLeaderboardData(topPlayersData || []);

      sessionStorage.setItem('profile_loaded', 'true');
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    sessionStorage.removeItem('profile_loaded');
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

  const handleEditClick = () => {
    setEditName(profile?.display_name || user?.email?.split('@')[0] || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    const { error } = await supabase.from('profiles').update({ display_name: editName }).eq('id', user.id);
    if (!error) {
      setProfile({ ...profile, display_name: editName });
      setIsEditing(false);
    }
  };

  const handleShareProfile = () => {
    if (!user?.id) return;
    const shareUrl = `${window.location.origin}/p/${user.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareText('Link Copied! 🔗');
      setTimeout(() => setShareText('Share Profile'), 2000);
    });
  };

  // --- LIBRARY LOGIC & MEMOIZATION ---
  const completedAlgos = useMemo(() => {
    return new Set(progressData.filter(p => p.progress_percent === 100).map(p => p.algorithm_id));
  }, [progressData]);

  const libCategories = useMemo(() => {
    const cats = new Set(ALGORITHMS_DATABASE.map(algo => algo.category));
    return ['All', ...Array.from(cats)].sort();
  }, []);
  const libDifficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredLibrary = useMemo(() => {
    return ALGORITHMS_DATABASE.filter((algo) => {
      const searchStr = libSearchTerm.toLowerCase();
      const matchesSearch = 
        algo.title.toLowerCase().includes(searchStr) ||
        algo.description.toLowerCase().includes(searchStr) ||
        algo.category.toLowerCase().includes(searchStr);
      const matchesCategory = libCategory === 'All' || algo.category === libCategory;
      const matchesDifficulty = libDifficulty === 'All' || algo.difficulty === libDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [libSearchTerm, libCategory, libDifficulty]);

  const handleOpenInTracer = (algo) => {
    navigate('/workspace', { 
      state: { 
        presetCode: algo.code,
        metadata: {
          id: algo.id,
          type: 'algorithm',
          algorithmTitle: algo.title,
          strategy: algo.category,
          category: algo.category,
          difficulty: algo.difficulty,
          description: algo.description,
          language: 'Python 3',
          complexityTime: algo.timeComplexity,
          complexitySpace: algo.spaceComplexity
        }
      } 
    });
  };

  // --- DASHBOARD HELPERS ---
  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const generateHeatmap = () => {
    const today = new Date();
    return Array.from({ length: 84 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (83 - i));
      const dateStr = d.toISOString().split('T')[0];
      const activity = dailyActivity.find(a => a.activity_date === dateStr);
      const count = activity ? activity.execution_count : 0;
      let bgClass = isDark ? 'bg-slate-800' : 'bg-slate-200';
      if (count > 0 && count <= 2) bgClass = 'bg-indigo-500/40';
      if (count > 2 && count <= 5) bgClass = 'bg-indigo-500/70';
      if (count > 5) bgClass = 'bg-indigo-500';
      return <div key={i} className={`w-full aspect-square rounded-[2px] ${bgClass} transition-colors`} title={`${dateStr}: ${count} executions`}></div>;
    });
  };

  const getActivityFormatting = (type, details) => {
    switch (type) {
      case 'EXECUTE': return { icon: '▶️', action: `Executed ${details}` };
      case 'CREATE': return { icon: '➕', action: `Created "${details}"` };
      case 'FAVORITE': return { icon: '❤️', action: `Favorited ${details}` };
      case 'ACHIEVEMENT': return { icon: '🏆', action: `Earned "${details}" achievement` };
      case 'STREAK': return { icon: '🔥', action: `Reached ${details} streak` };
      default: return { icon: '📝', action: details };
    }
  };

  const calculateCategoryProgress = (categoryName) => {
    const categoryAlgos = progressData.filter(p => p.category?.toLowerCase() === categoryName.toLowerCase());
    if (categoryAlgos.length === 0) return 0;
    const totalProgressPercent = categoryAlgos.reduce((sum, item) => sum + (item.progress_percent || 0), 0);
    return Math.min(100, Math.round((totalProgressPercent / 500) * 100));
  };

  const algoProgressStats = [
    { name: 'Sorting', icon: '📊', prog: calculateCategoryProgress('Sorting') },
    { name: 'Searching', icon: '🔍', prog: calculateCategoryProgress('Searching') },
    { name: 'Linked Lists', icon: '🔗', prog: calculateCategoryProgress('Linked Lists') },
    { name: 'Strings', icon: '📝', prog: calculateCategoryProgress('Strings') },
    { name: 'Trees', icon: '🌲', prog: calculateCategoryProgress('Trees') }
  ];

  const recentAlgo = progressData.find(algo => algo.progress_percent < 100) || null;

  // Professional Theme Variables
  const bgMain = isDark ? 'bg-[#0A0D14]' : 'bg-[#F4F6F8]';
  const bgPanel = isDark ? 'bg-[#10141D]' : 'bg-[#FFFFFF]';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  
  const metallicBorder = isDark 
    ? 'border border-slate-800/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)]' 
    : 'border border-slate-200/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.05)]';
  
  const hoverBg = isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50';
  const focusBorder = 'focus:ring-2 focus:ring-indigo-500/50 outline-none';

  const scrollbarStyles = `
    [&::-webkit-scrollbar]:w-1.5 
    [&::-webkit-scrollbar-track]:bg-transparent 
    [&::-webkit-scrollbar-thumb]:rounded-full 
    ${isDark ? '[&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-slate-700' : '[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'}
  `;

  if (loading) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center font-mono gap-4 ${bgMain} ${textPrimary}`}>
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm tracking-widest text-indigo-400 uppercase font-bold animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const userHandle = `@${displayName.toLowerCase().replace(/\s/g, '')}`;
  const userInitial = displayName.charAt(0).toUpperCase();
  const joinDate = new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', {month:'short', year:'numeric'});
  const learningSeconds = profile?.learning_time_seconds || 0;
  const hours = Math.floor(learningSeconds / 3600);
  const minutes = Math.floor((learningSeconds % 3600) / 60);
  const streakCount = profile?.longest_streak || profile?.streak_count || 0;
  
  const levelInfo = calculateLevelInfo(profile?.current_xp || 0);

  const quickStats = [
    { label: 'Total Learning Time', val: `${hours}h ${minutes}m`, icon: '⏱️', trend: '+12%', color: 'text-blue-500' },
    { label: 'Executions', val: profile?.total_executions || 0, icon: '▶️', trend: '+18%', color: 'text-emerald-500' },
    { label: 'Algorithms Solved', val: profile?.algorithms_solved || 0, icon: '🧠', trend: '+8%', color: 'text-purple-500' },
    { label: 'Success Rate', val: `${profile?.success_rate || 0}%`, icon: '🎯', trend: '+5%', color: 'text-orange-500' },
    { label: 'Topics Explored', val: profile?.topics_explored || 0, icon: '📁', trend: 'Docs Read', color: 'text-blue-400' },
    { label: 'Longest Streak', val: `${streakCount} ${streakCount === 1 ? 'day' : 'days'}`, icon: '🔥', trend: 'Best Record', color: 'text-red-500' }
  ];

  const navLinks = [
    { section: 'WORKSPACE', links: [{ name: 'Workspace', path: '/workspace', icon: '⚡' }] },
    { section: 'LEARNING', links: [
      { name: 'Learning Path', path: '#', icon: '🎓', tag: 'Building', tagColor: isDark ? 'bg-amber-900/40 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-300' }, 
      { name: 'Algorithm Library', action: () => setCurrentView('library'), icon: '📚', isActive: currentView === 'library' }
    ] },
    { section: 'COMMUNITY', links: [
      { name: 'Leaderboard', action: () => setCurrentView('leaderboard'), icon: '🏆', isActive: currentView === 'leaderboard' },
      // { name: 'Discussions', path: '#', icon: '💬', tag: 'Soon', tagColor: isDark ? 'bg-indigo-900/40 text-indigo-400 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-300' }
    ] }
  ];

  // --- LEADERBOARD HELPERS ---
  const top3 = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  const renderPodiumCard = (player, rank) => {
    if (!player) return null;
    const { level, honor, totalXP } = calculateLevelInfo(player.current_xp || 0);
    const initial = (player.display_name || 'U').charAt(0).toUpperCase();
    
    let rankColors = '', glow = '', badge = '';
    if (rank === 1) {
      rankColors = 'from-amber-400 to-yellow-600 border-yellow-500/50 text-yellow-900'; glow = 'shadow-[0_0_30px_rgba(251,191,36,0.3)]'; badge = '🥇';
    } else if (rank === 2) {
      rankColors = 'from-slate-300 to-slate-500 border-slate-400/50 text-slate-900'; glow = 'shadow-[0_0_20px_rgba(148,163,184,0.2)]'; badge = '🥈';
    } else if (rank === 3) {
      rankColors = 'from-orange-400 to-amber-700 border-orange-500/50 text-orange-950'; glow = 'shadow-[0_0_20px_rgba(217,119,6,0.2)]'; badge = '🥉';
    }

    return (
      <div className={`flex flex-col items-center p-6 rounded-3xl ${metallicBorder} ${bgPanel} ${glow} relative overflow-hidden flex-1 max-w-[280px] hover:-translate-y-2 transition-transform duration-300 ${rank === 1 ? 'md:-mt-8 z-10 scale-105' : 'opacity-90'}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${rankColors} rounded-full blur-3xl opacity-20 pointer-events-none`}></div>
        <div className="absolute top-4 right-4 text-2xl drop-shadow-md">{badge}</div>
        <div className="absolute top-4 left-4 text-xs font-black text-slate-400">#{rank}</div>
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${rankColors} flex items-center justify-center text-3xl font-black shadow-lg mb-4 mt-2 border-2 ${isDark ? 'border-[#10141D]' : 'border-white'}`}>{initial}</div>
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
    <div className={`flex h-screen w-screen font-sans ${bgMain} ${textPrimary} overflow-hidden`}>
      {isLoggingOut && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className={`relative w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center transform transition-all ${metallicBorder} ${isDark ? 'bg-[#10141D] text-white' : 'bg-white text-slate-900'}`}>
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-3xl mb-4 border border-emerald-500/30 shadow-inner">👋</div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">Successfully Logged Out</h2>
            <p className={`text-sm leading-relaxed mb-6 ${textSecondary}`}>Your progress has been securely saved. Redirecting you to home...</p>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'} ${metallicBorder} shadow-none`}>
              <div className="h-full bg-emerald-500 w-full animate-[pulse_1s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Container with Animation */}
      <div className={`transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        <aside className={`w-64 h-full ${metallicBorder} border-y-0 border-l-0 ${bgPanel} flex flex-col justify-between overflow-y-auto ${scrollbarStyles} z-20`}>
          <div>
            <div className="h-16 flex items-center px-6 font-extrabold text-xl tracking-tight border-b border-transparent">
              {/* Replaced </> with Logo */}
              <img src="/favicon.svg" alt="CodeToAnim Logo" className="w-7 h-7 mr-2 rounded-md object-contain" />
              <span className={isDark ? 'text-white' : 'text-slate-900'}>CodeTo</span>
              <span className="text-indigo-500 ml-1">Anim</span>
            </div>
            <div className="px-4 py-4">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'dashboard' ? (isDark ? 'text-white bg-slate-800/80 shadow-inner border border-slate-700/50' : 'text-slate-900 bg-slate-100 shadow-sm border border-slate-200') : `${textSecondary} ${hoverBg}`
                }`}
              >
                <span className="opacity-80">🏠</span> Dashboard
              </button>
            </div>
            <div className="px-4 pb-6">
              {navLinks.map((group, idx) => (
                <div key={idx} className="mt-6">
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 px-4 ${textSecondary}`}>{group.section}</h4>
                  <div className="space-y-1">
                    {group.links.map((link, lIdx) => {
                      const activeClasses = (link.isActive) 
                        ? (isDark ? 'text-white bg-slate-800/40 shadow-inner border border-slate-700/50' : 'text-slate-900 bg-slate-100 shadow-sm border border-slate-200') 
                        : `${textSecondary} ${hoverBg} border border-transparent`;

                      return link.action ? (
                        <button key={lIdx} onClick={link.action} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeClasses}`}>
                          <span className="opacity-80">{link.icon}</span>{link.name}
                          {link.tag && <span className={`ml-auto text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${link.tagColor}`}>{link.tag}</span>}
                        </button>
                      ) : (
                        <Link key={lIdx} to={link.path} className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeClasses}`}>
                          <span className="opacity-80">{link.icon}</span>{link.name}
                          {link.tag && <span className={`ml-auto text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${link.tagColor}`}>{link.tag}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`p-4 ${metallicBorder} border-x-0 border-b-0`}>
            <button onClick={toggleTheme} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl ${metallicBorder} ${hoverBg} transition-colors shadow-sm`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <span>{isDark ? '🌙' : '☀️'}</span><span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Theme</span>
              </div>
              <span className={`text-xs font-medium ${textSecondary}`}>{isDark ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </aside>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`h-16 flex-shrink-0 ${metallicBorder} border-x-0 border-t-0 ${bgPanel} flex items-center justify-between px-8 z-10 transition-all`}>
          
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
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

            {/* Search Bar */}
            <div className={`flex items-center w-80 lg:w-96 ${metallicBorder} rounded-xl px-3 py-1.5 transition-shadow focus-within:ring-2 focus-within:ring-indigo-500/30 ${isDark ? 'bg-[#0A0D14]' : 'bg-slate-50'}`}>
              <span className="text-slate-400 text-sm">🔍</span>
              <input type="text" placeholder="Search algorithms, topics, users..." className={`bg-transparent border-none outline-none text-sm font-medium w-full ml-2 placeholder-slate-400/70 ${textPrimary}`} />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/workspace" className={`flex items-center gap-2 px-4 py-1.5 ${metallicBorder} rounded-xl text-sm font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-500 transition-colors ${isDark ? 'bg-slate-900' : 'bg-white'}`}>⚡ Workspace</Link>
            <div className={`flex items-center gap-3 cursor-pointer pl-4 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`} onClick={handleLogout}>
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm ${metallicBorder} shadow-md`}>{userInitial}</div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-sm font-bold leading-tight">{displayName}</span>
                <span className="text-[10px] font-medium text-slate-500 leading-tight">Log Out</span>
              </div>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-8 ${scrollbarStyles}`}>
          
          {/* ===================== */}
          {/*    DASHBOARD VIEW     */}
          {/* ===================== */}
          {currentView === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className={`${bgPanel} ${metallicBorder} rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center shadow-sm relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                  <div className="relative group">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 ${metallicBorder} border-4 border-transparent flex items-center justify-center text-4xl text-white font-black shadow-xl group-hover:scale-105 transition-transform`}>{userInitial}</div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-slate-800 rounded-full border-2 border-slate-900 text-xs shadow-md hover:bg-slate-700 transition-colors">✏️</button>
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-3 mb-1">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={`text-2xl font-black bg-transparent border-b-2 border-indigo-500 w-48 ${focusBorder} ${textPrimary}`} autoFocus />
                        <button onClick={handleSaveProfile} className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-indigo-500 transition-colors">Save</button>
                        <button onClick={() => setIsEditing(false)} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${metallicBorder} ${hoverBg} transition-colors`}>Cancel</button>
                      </div>
                    ) : (
                      <h1 className="text-3xl font-black tracking-tight">{displayName}</h1>
                    )}
                    <p className={`text-sm font-medium ${textSecondary}`}>{userHandle}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`text-xs px-2.5 py-1 rounded-md ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} ${metallicBorder} font-bold shadow-sm flex items-center gap-1.5`}>
                        <span className="text-[10px] uppercase text-slate-500">Lv. {levelInfo.level}</span>{levelInfo.honor}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold shadow-sm`}>Algorithm Explorer</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-5 mt-6 md:mt-0 w-full md:w-1/3 relative z-10">
                  <div className="w-full bg-slate-900/5 dark:bg-black/20 p-4 rounded-2xl border border-slate-500/10">
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-indigo-500">Level {levelInfo.level}</span>
                      <span className={textSecondary}>{levelInfo.totalXP.toLocaleString()} <span className="opacity-50">/ {levelInfo.nextLevelXP.toLocaleString()} XP</span></span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${metallicBorder} ${isDark ? 'bg-slate-800/80' : 'bg-slate-200/80'} overflow-hidden shadow-inner`}>
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${levelInfo.progressPercent}%` }}></div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-2 text-right">{levelInfo.isMax ? "Max Level Reached!" : `${levelInfo.xpRemaining.toLocaleString()} XP to level up`}</p>
                  </div>
                  <div className="flex gap-3 w-full justify-end">
                    <button onClick={handleEditClick} className={`px-4 py-2 text-sm font-bold rounded-xl shadow-sm ${metallicBorder} ${hoverBg} transition-colors flex-1 md:flex-none`}>Edit Profile</button>
                    <button onClick={handleShareProfile} className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none w-36">{shareText}</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickStats.map((stat, i) => (
                  <div key={i} className={`${bgPanel} ${metallicBorder} p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 group`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2.5 rounded-xl shadow-inner ${metallicBorder} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</div>
                    </div>
                    <div>
                      <h4 className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>{stat.label}</h4>
                      <div className="text-2xl font-black mt-1 tracking-tight">{stat.val}</div>
                      <div className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1">{stat.trend}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className={`lg:col-span-1 ${bgPanel} ${metallicBorder} p-6 rounded-3xl shadow-sm flex flex-col`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Learning Activity</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${metallicBorder} ${isDark ? 'bg-slate-800' : 'bg-slate-100'} ${textSecondary}`}>12 Weeks</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1.5 mb-6 flex-1 items-center">{generateHeatmap()}</div>
                </div>

                <div className={`lg:col-span-1 ${bgPanel} ${metallicBorder} p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Continue Learning</h3>
                    <p className={`text-xs font-medium ${textSecondary}`}>Pick up where you left off</p>
                  </div>
                  {recentAlgo ? (
                    <>
                      <div className="flex items-center gap-4 mt-6">
                        <div className={`w-14 h-14 rounded-2xl ${metallicBorder} shadow-inner ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'} flex items-center justify-center text-2xl`}>🧱</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm leading-tight">{recentAlgo.title}</h4>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mt-1`}>{recentAlgo.category} • {recentAlgo.difficulty}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-500 py-10">No pending lessons.</div>
                  )}
                  <button onClick={() => setCurrentView('library')} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-md transition-all mt-6">Explore Library</button>
                </div>

                <div className={`lg:col-span-1 ${bgPanel} ${metallicBorder} p-6 rounded-3xl shadow-sm flex flex-col`}>
                  <h3 className="font-bold text-lg mb-1">Topic Mastery</h3>
                  <p className={`text-xs font-medium ${textSecondary} mb-6`}>Progress across categories</p>
                  <div className="space-y-5 flex-1">
                    {algoProgressStats.map((topic, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 w-1/3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${metallicBorder} ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>{topic.icon}</span>
                          <span className={`text-xs font-bold ${textSecondary}`}>{topic.name}</span>
                        </div>
                        <div className="w-[45%]">
                          <div className={`h-1.5 w-full rounded-full ${metallicBorder} ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${topic.prog}%` }}></div>
                          </div>
                        </div>
                        <span className="text-xs font-black w-10 text-right">{topic.prog}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className={`lg:col-span-2 ${bgPanel} ${metallicBorder} p-6 rounded-3xl shadow-sm flex flex-col`}>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">Saved Algorithms</h3>
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${metallicBorder} ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>{savedCodes.length}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className={`flex items-center ${metallicBorder} rounded-xl px-3 py-2 flex-1 min-w-[200px] ${isDark ? 'bg-[#0A0D14]' : 'bg-white'}`}>
                      <span className="text-sm mr-2 text-slate-400">🔍</span>
                      <input type="text" placeholder="Search saved algorithms..." className="bg-transparent border-none outline-none text-sm font-medium w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                  </div>

                  {savedCodes.length === 0 ? (
                    <div className={`flex-1 flex flex-col items-center justify-center text-center py-10 ${textSecondary}`}>
                      <p className="text-sm font-medium">No algorithms saved yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedCodes.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())).slice(0,4).map((item) => (
                        <div key={item.id} className={`${metallicBorder} rounded-2xl p-5 hover:border-indigo-500/50 cursor-pointer ${isDark ? 'bg-slate-900/30' : 'bg-slate-50'}`} onClick={() => navigate('/workspace', { state: { presetCode: item.code_content } })}>
                          <h4 className="font-bold text-sm tracking-tight mb-3">{item.title}</h4>
                          <div className={`text-xs font-mono p-2 rounded-lg ${metallicBorder} ${isDark ? 'bg-[#0A0D14] text-slate-400' : 'bg-white text-slate-600'} line-clamp-2 h-10 mb-4 shadow-inner`}>
                            {item.code_content?.substring(0, 50) || "Code snippet..."}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  
                  {/* --- MINI LEADERBOARD INSTALLED HERE --- */}
                  <div className={`${bgPanel} ${metallicBorder} p-6 rounded-3xl shadow-sm`}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">Top Ranked</h3>
                        <span className="text-amber-500 text-sm drop-shadow-md">🏆</span>
                      </div>
                      <button onClick={() => setCurrentView('leaderboard')} className={`text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors`}>View All</button>
                    </div>
                    
                    <div className="space-y-3">
                      {leaderboardData.length === 0 ? (
                        <div className={`text-sm font-medium ${textSecondary} text-center py-4`}>Loading ranks...</div>
                      ) : (
                        leaderboardData.slice(0, 3).map((player, idx) => {
                          const rank = idx + 1;
                          const pLevel = calculateLevelInfo(player.current_xp || 0).level;
                          return (
                            <div 
                              key={player.id} 
                              onClick={() => setCurrentView('leaderboard')}
                              className={`flex items-center justify-between p-3 rounded-2xl ${metallicBorder} transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${isDark ? 'bg-slate-900/40 hover:bg-slate-800/80' : 'bg-slate-50 hover:bg-white'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-sm border border-white/20 ${
                                  rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-yellow-900/30' : 
                                  rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-900/30' : 
                                  rank === 3 ? 'bg-gradient-to-br from-orange-400 to-amber-700 shadow-orange-900/30' : 
                                  'bg-gradient-to-br from-indigo-500 to-purple-600'
                                }`}>
                                  {(player.display_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className={`text-sm font-bold ${textPrimary}`}>{player.display_name || 'Anonymous'}</span>
                                  <div className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Lv. {pLevel}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-black ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-orange-500' : 'text-indigo-500'}`}>
                                  #{rank}
                                </div>
                                <div className={`text-[10px] font-semibold ${textSecondary}`}>
                                  {(player.current_xp || 0).toLocaleString()} XP
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Badges/Achievements */}
                  <div className={`${bgPanel} ${metallicBorder} p-6 rounded-3xl shadow-sm`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Badges</h3>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer">👾</div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer">🏅</div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer">🎓</div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer">⭐</div>
                      <div className={`w-10 h-10 rounded-xl ${metallicBorder} ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center text-xs font-black ${textSecondary} shadow-inner`}>+8</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= */}
          {/*    LEADERBOARD VIEW     */}
          {/* ======================= */}
          {currentView === 'leaderboard' && (
            <div className="max-w-5xl mx-auto space-y-12 pb-10">
              <div className="text-center space-y-3">
                <h1 className="text-4xl font-black tracking-tight">Global Rankings</h1>
                <p className={`text-sm font-medium ${textSecondary}`}>Top 50 developers by total XP across CodeAnim.</p>
              </div>

              {/* Podium Section */}
              {top3.length > 0 && (
                <div className="flex flex-col md:flex-row justify-center items-end gap-6 pt-4 pb-8">
                  {top3.length > 1 && renderPodiumCard(top3[1], 2)}
                  {renderPodiumCard(top3[0], 1)}
                  {top3.length > 2 && renderPodiumCard(top3[2], 3)}
                </div>
              )}

              {/* Leaderboard Table */}
              {restOfLeaderboard.length > 0 && (
                <div className={`${bgPanel} ${metallicBorder} rounded-3xl p-6 shadow-sm`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
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
                              <td className="py-4 px-6"><span className={`text-sm font-bold ${textSecondary}`}>#{rank}</span></td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isCurrentUser ? 'bg-indigo-500' : 'bg-slate-500'}`}>
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
          )}

          {/* ===================== */}
          {/*     LIBRARY VIEW      */}
          {/* ===================== */}
          {currentView === 'library' && (
            <div className="max-w-7xl mx-auto pb-10">
              
              <div className="text-center space-y-3 mb-10 mt-4">
                <h1 className="text-4xl font-black tracking-tight">Algorithm Library</h1>
                <p className={`text-sm font-medium ${textSecondary}`}>Explore and visualize {ALGORITHMS_DATABASE.length} computer science algorithms step-by-step.</p>
              </div>

              <div className={`flex flex-col gap-5 p-6 rounded-3xl ${metallicBorder} ${bgPanel} shadow-sm mb-8`}>
                <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
                  <div className="relative w-full lg:w-96">
                    <span className={`absolute left-4 top-3 text-sm ${textSecondary}`}>🔍</span>
                    <input 
                      type="text"
                      placeholder="Search algorithms or topics..."
                      value={libSearchTerm}
                      onChange={(e) => setLibSearchTerm(e.target.value)}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner ${isDark ? 'bg-[#0A0D14] border-slate-800 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                    />
                  </div>

                  <div className={`flex border rounded-xl p-1.5 w-full lg:w-auto ${isDark ? 'bg-[#0A0D14] border-slate-800' : 'bg-slate-50 border-slate-200'} shadow-inner`}>
                    {libDifficulties.map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setLibDifficulty(diff)}
                        className={`flex-1 px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          libDifficulty === diff
                            ? diff === 'Easy' ? 'bg-emerald-500/20 text-emerald-500 shadow-sm' 
                              : diff === 'Medium' ? 'bg-amber-500/20 text-amber-500 shadow-sm'
                              : diff === 'Hard' ? 'bg-rose-500/20 text-rose-500 shadow-sm'
                              : 'bg-indigo-500/20 text-indigo-500 shadow-sm'
                            : `${textSecondary} ${hoverBg}`
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Topics:</span>
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex-1">
                    {libCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setLibCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          libCategory === cat
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30"
                            : `${isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLibrary.map((algo) => {
                  const isCompleted = completedAlgos.has(algo.id);
                  
                  return (
                    <div 
                      key={algo.id}
                      className={`border hover:border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/10 group ${metallicBorder} ${bgPanel}`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex gap-2">
                            <span className="text-[10px] font-mono uppercase font-black text-indigo-500 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-md shadow-sm">
                              {algo.category}
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] font-mono font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                                ✅ DONE
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-black shadow-sm ${
                            algo.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                              : algo.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                          }`}>
                            {algo.difficulty}
                          </span>
                        </div>

                        <h3 className={`text-lg font-black mb-3 tracking-tight transition-colors ${isDark ? 'text-slate-100 group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                          {algo.title}
                        </h3>

                        <p className={`text-xs leading-relaxed mb-6 font-medium line-clamp-3 ${textSecondary}`}>
                          {algo.description}
                        </p>
                      </div>

                      <div>
                        <div className={`flex justify-between py-3 border-t border-b mb-6 font-mono text-[11px] font-bold rounded-xl px-4 ${isDark ? 'border-slate-800/80 text-slate-400 bg-slate-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'} shadow-inner`}>
                          <div className="flex flex-col gap-1">
                            <span className={`text-[9px] uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Time</span>
                            <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{algo.timeComplexity}</span>
                          </div>
                          <div className={`w-px h-auto ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                          <div className="flex flex-col gap-1 text-right">
                            <span className={`text-[9px] uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Space</span>
                            <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{algo.spaceComplexity}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenInTracer(algo)}
                          className={`w-full py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border ${
                            isDark 
                              ? 'bg-indigo-500/10 hover:bg-indigo-600 border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white' 
                              : 'bg-indigo-50 hover:bg-indigo-600 border-indigo-200 hover:border-indigo-600 text-indigo-700 hover:text-white'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                          <span>{isCompleted ? 'Review Algorithm' : 'Visualize Step-by-Step'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredLibrary.length === 0 && (
                <div className={`py-24 flex flex-col items-center justify-center text-center rounded-3xl ${metallicBorder} ${isDark ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
                  <span className="text-5xl mb-5 opacity-50">📭</span>
                  <h3 className="text-xl font-bold mb-2">No algorithms found</h3>
                  <p className={`text-sm font-medium max-w-sm ${textSecondary}`}>
                    Adjust your search or filter criteria to explore the database.
                  </p>
                  <button 
                    onClick={() => { setLibSearchTerm(''); setLibCategory('All'); setLibDifficulty('All'); }}
                    className={`mt-6 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors ${metallicBorder} ${hoverBg}`}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}