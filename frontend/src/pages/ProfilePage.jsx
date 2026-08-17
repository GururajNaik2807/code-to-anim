import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';

export default function ProfilePage() {
  // Check session storage so full loader only triggers once per tab session
  const hasLoadedBefore = sessionStorage.getItem('profile_loaded') === 'true';

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedCodes, setSavedCodes] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Only show full loading screen if it hasn't loaded in this tab session yet
  const [loading, setLoading] = useState(!hasLoadedBefore);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [shareText, setShareText] = useState('Share Profile');

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  const { currentTheme, changeTheme } = useTheme(); 
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
      // Fetch all concurrently for maximum speed
      const [
        { data: profileData },
        { data: codesData },
        { data: progData },
        { data: actData },
        { data: logData }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('saved_algorithms').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
        supabase.from('user_progress').select('*').eq('user_id', session.user.id).order('last_accessed', { ascending: false }),
        supabase.from('daily_activity').select('*').eq('user_id', session.user.id),
        supabase.from('activity_logs').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5)
      ]);

      setProfile(profileData || {});
      setSavedCodes(codesData || []);
      setProgressData(progData || []);
      setDailyActivity(actData || []);
      setRecentActivities(logData || []);

      // Mark that this session has loaded once, preventing future full-screen flashes
      sessionStorage.setItem('profile_loaded', 'true');
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Clear session cache on logout so next login triggers fresh load if desired
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
      
      let bgClass = isDark ? 'bg-gray-800' : 'bg-gray-200';
      if (count > 0 && count <= 2) bgClass = 'bg-indigo-500/40';
      if (count > 2 && count <= 5) bgClass = 'bg-indigo-500/70';
      if (count > 5) bgClass = 'bg-indigo-500';
      
      return <div key={i} className={`w-full aspect-square rounded-[2px] ${bgClass}`} title={`${dateStr}: ${count} executions`}></div>;
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

  const ALGORITHM_TOTALS = {
    'Searching': 2, 'Sorting': 5, 'Two Pointers': 4, 'Arrays': 5, 'Math': 3,
    'Dynamic Programming': 4, 'Stack': 2, 'Graphs': 2, 'Linked Lists': 5,
    'Strings': 5, 'Trees': 5, 'Bit Manipulation': 3, 'Greedy': 2,
    'Hash Map': 5, 'Intervals': 3, 'Heaps': 3, 'Backtracking': 1
  };

  const calculateCategoryProgress = (categoryName) => {
    const categoryAlgos = progressData.filter(p => p.category?.toLowerCase() === categoryName.toLowerCase());
    if (categoryAlgos.length === 0) return 0;
    const totalProgressPercent = categoryAlgos.reduce((sum, item) => sum + (item.progress_percent || 0), 0);
    const totalPossible = (ALGORITHM_TOTALS[categoryName] || 5) * 100; 
    return Math.min(100, Math.round((totalProgressPercent / totalPossible) * 100));
  };

  const algoProgressStats = [
    { name: 'Sorting', icon: '📊', prog: calculateCategoryProgress('Sorting') },
    { name: 'Searching', icon: '🔍', prog: calculateCategoryProgress('Searching') },
    { name: 'Linked Lists', icon: '🔗', prog: calculateCategoryProgress('Linked Lists') },
    { name: 'Strings', icon: '📝', prog: calculateCategoryProgress('Strings') },
    { name: 'Trees', icon: '🌲', prog: calculateCategoryProgress('Trees') }
  ];

  const recentAlgo = progressData.find(algo => algo.progress_percent < 100) || null;

  const bgMain = isDark ? 'bg-[#0E1117]' : 'bg-[#F9FAFB]';
  const bgPanel = isDark ? 'bg-[#161B22]' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDark ? 'border-gray-800' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  const scrollbarStyles = `
    [&::-webkit-scrollbar]:w-1.5 
    [&::-webkit-scrollbar-track]:bg-transparent 
    [&::-webkit-scrollbar-thumb]:rounded-full 
    ${isDark 
      ? '[&::-webkit-scrollbar-thumb]:bg-gray-800 hover:[&::-webkit-scrollbar-thumb]:bg-gray-700' 
      : '[&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400'
    }
  `;

  // Only displays full-screen on the absolute first tab load
  if (loading) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center font-mono gap-4 ${bgMain} ${textPrimary}`}>
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm tracking-widest text-purple-400 uppercase font-bold animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const userHandle = `@${displayName.toLowerCase().replace(/\s/g, '')}`;
  const userInitial = displayName.charAt(0).toUpperCase();
  const joinDate = new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', {month:'short', year:'numeric'});
  const currentLevel = profile?.current_level || 1;
  const currentXP = profile?.current_xp || 0;
  const xpForNextLevel = currentLevel * 500;
  const xpRemaining = Math.max(0, xpForNextLevel - currentXP);
  const xpPercentage = Math.min(100, Math.max(0, Math.round((currentXP / xpForNextLevel) * 100)));
  const learningSeconds = profile?.learning_time_seconds || 0;
  const hours = Math.floor(learningSeconds / 3600);
  const minutes = Math.floor((learningSeconds % 3600) / 60);
  const streakCount = profile?.longest_streak || profile?.streak_count || 0;

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
    { section: 'ALGORITHMS', links: [{ name: 'My Algorithms', path: '/profile', icon: '📂', active: true }] },
    { section: 'LEARNING', links: [{ name: 'Learning Path', path: '/learn', icon: '🎓' }, { name: 'Topics', path: '/algorithms', icon: '📚' }] },
    { section: 'COMMUNITY', links: [{ name: 'Community', path: '/community', icon: '💬' }] }
  ];

  return (
    <div className={`flex h-screen w-screen font-sans ${bgMain} ${textPrimary} overflow-hidden`}>
      
      {isLoggingOut && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`relative w-full max-w-sm border rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center transform transition-all ${isDark ? 'bg-[#121620] border-emerald-500/30 text-white shadow-emerald-900/20' : 'bg-white border-emerald-500/30 text-gray-900 shadow-emerald-500/10'}`}>
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-3xl mb-4 border border-emerald-500/30 shadow-inner">
              👋
            </div>
            <h2 className="text-2xl font-black mb-2">Successfully Logged Out</h2>
            <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Your progress has been securely saved. Redirecting you to home...
            </p>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div className="h-full bg-emerald-500 w-full animate-[pulse_1s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      <aside className={`w-64 flex-shrink-0 border-r ${borderCol} ${bgPanel} flex flex-col justify-between overflow-y-auto ${scrollbarStyles}`}>
        <div>
          <div className="h-16 flex items-center px-6 font-extrabold text-xl tracking-tight">
            <span>&lt;/&gt; Code</span>
            <span className="text-indigo-500 ml-1">Anim</span>
          </div>
          <div className="px-4 py-2">
            <Link to="/profile" className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>🏠 Dashboard</Link>
          </div>
          <div className="px-4 pb-6">
            {navLinks.map((group, idx) => (
              <div key={idx} className="mt-6">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-4 ${textSecondary}`}>{group.section}</h4>
                {group.links.map((link, lIdx) => (
                  <Link key={lIdx} to={link.path} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${link.active ? (isDark ? 'text-white bg-gray-800/50' : 'text-black bg-gray-100') : `${textSecondary} ${hoverBg}`}`}>
                    <span>{link.icon}</span>{link.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={`p-4 border-t ${borderCol}`}>
          <button onClick={toggleTheme} className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border ${borderCol} ${hoverBg} transition-colors`}>
            <div className="flex items-center gap-2 text-sm font-medium"><span>{isDark ? '🌙' : '☀️'}</span><span>Theme</span></div>
            <span className={`text-xs ${textSecondary}`}>{isDark ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`h-16 flex-shrink-0 border-b ${borderCol} ${bgPanel} flex items-center justify-between px-8`}>
          <div className={`flex items-center w-96 border ${borderCol} rounded-md px-3 py-1.5 ${isDark ? 'bg-[#0E1117]' : 'bg-gray-50'}`}>
            <span className="text-gray-400 text-sm">🔍</span>
            <input type="text" placeholder="Search algorithms, topics, users..." className={`bg-transparent border-none outline-none text-sm w-full ml-2 ${textPrimary}`} />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/workspace" className={`flex items-center gap-2 px-4 py-1.5 border ${borderCol} rounded-md text-sm font-semibold hover:border-indigo-500 transition-colors`}>⚡ Workspace</Link>
            <button className="text-gray-400 hover:text-indigo-400">🔔</button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">{userInitial}</div>
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-gray-500">▼</span>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-8 ${scrollbarStyles}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className={`${bgPanel} border ${borderCol} rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center shadow-sm`}>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-emerald-800 border-4 border-emerald-500 flex items-center justify-center text-4xl text-white font-bold">{userInitial}</div>
                  <div className="absolute bottom-0 right-0 p-1.5 bg-gray-700 rounded-full border-2 border-gray-900 text-xs">✏️</div>
                </div>
                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-1">
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={`text-xl font-bold bg-transparent border-b border-indigo-500 outline-none w-48 ${textPrimary}`} autoFocus />
                      <button onClick={handleSaveProfile} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-500">Save</button>
                      <button onClick={() => setIsEditing(false)} className={`text-xs border ${borderCol} px-2 py-1 rounded hover:bg-gray-500`}>Cancel</button>
                    </div>
                  ) : (
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                  )}
                  <p className={`text-sm ${textSecondary}`}>{userHandle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-semibold`}>Algorithm Explorer</span>
                    <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-200'} font-semibold`}>Level {currentLevel}</span>
                  </div>
                  <p className={`text-xs ${textSecondary} mt-3`}>Joined {joinDate} • 🇮🇳 India</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4 mt-6 md:mt-0 w-full md:w-1/3">
                <div className="w-full">
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>Level {currentLevel}</span><span className={textSecondary}>{currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${xpPercentage}%` }}></div>
                  </div>
                  <p className="text-xs text-indigo-500 mt-1">{xpRemaining.toLocaleString()} XP until Level {currentLevel + 1}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleEditClick} className={`px-4 py-1.5 text-sm font-semibold border ${borderCol} rounded ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}>Edit Profile</button>
                  <button onClick={handleShareProfile} className="w-28 px-4 py-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors text-center">{shareText}</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickStats.map((stat, i) => (
                <div key={i} className={`${bgPanel} border ${borderCol} p-4 rounded-xl shadow-sm flex flex-col justify-between`}>
                  <div className="flex justify-between items-start mb-2"><div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${stat.color}`}>{stat.icon}</div></div>
                  <div>
                    <h4 className={`text-xs font-semibold ${textSecondary}`}>{stat.label}</h4>
                    <div className="text-xl font-bold mt-1">{stat.val}</div>
                    <div className="text-[10px] text-emerald-500 font-medium mt-1">{stat.trend}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-1 ${bgPanel} border ${borderCol} p-5 rounded-xl`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Learning Activity</h3>
                  <span className={`text-xs ${textSecondary}`}>Last 12 Weeks</span>
                </div>
                <div className="grid grid-cols-12 gap-1 mb-4 opacity-80">
                  {generateHeatmap()}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className={`w-3 h-3 rounded-[2px] ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                      <div className="w-3 h-3 rounded-[2px] bg-indigo-500/40"></div>
                      <div className="w-3 h-3 rounded-[2px] bg-indigo-500/70"></div>
                      <div className="w-3 h-3 rounded-[2px] bg-indigo-500"></div>
                    </div>
                    <span>More</span>
                  </div>
                  <Link to="#" className="hover:text-indigo-400">View Full Activity →</Link>
                </div>
              </div>

              <div className={`lg:col-span-1 ${bgPanel} border ${borderCol} p-5 rounded-xl flex flex-col justify-between`}>
                <div>
                  <h3 className="font-bold mb-1">Continue Learning</h3>
                  <p className={`text-xs ${textSecondary}`}>Pick up where you left off</p>
                </div>
                {recentAlgo ? (
                  <>
                    <div className="flex items-center gap-4 mt-4">
                      <div className={`w-16 h-16 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center text-2xl`}>🧱</div>
                      <div className="flex-1">
                        <h4 className="font-bold">{recentAlgo.title}</h4>
                        <p className={`text-xs ${textSecondary}`}>{recentAlgo.category} • {recentAlgo.difficulty}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${recentAlgo.progress_percent}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-400">{recentAlgo.progress_percent}%</span>
                        </div>
                      </div>
                    </div>
                    <p className={`text-[10px] ${textSecondary} mt-4 mb-3`}>Last activity: {getTimeAgo(recentAlgo.last_accessed)}</p>
                  </>
                ) : (
                   <div className="flex-1 flex items-center justify-center text-sm text-gray-500">No pending algorithms or lessons.</div>
                )}
                <button onClick={() => navigate('/learn')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
                  {recentAlgo ? 'Continue Visualization ▷' : 'Explore Library ▷'}
                </button>
              </div>

              <div className={`lg:col-span-1 ${bgPanel} border ${borderCol} p-5 rounded-xl`}>
                <h3 className="font-bold mb-1">Algorithm Progress</h3>
                <p className={`text-xs ${textSecondary} mb-4`}>Your progress across different topics</p>
                <div className="space-y-4">
                  {algoProgressStats.map((topic, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 w-1/3">
                        <span className="text-sm">{topic.icon}</span><span className={`text-xs font-medium ${textSecondary}`}>{topic.name}</span>
                      </div>
                      <div className="w-1/2">
                        <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                           <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${topic.prog}%` }}></div>
                        </div>
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{topic.prog}%</span>
                    </div>
                  ))}
                </div>
                <Link to="/learn" className={`text-xs ${textSecondary} hover:text-white mt-4 inline-block`}>View All Topics →</Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 ${bgPanel} border ${borderCol} p-5 rounded-xl`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">Saved Algorithms</h3><span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>{savedCodes.length}</span>
                  </div>
                  <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md hover:bg-gray-700">+ New Algorithm</button>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className={`flex items-center border ${borderCol} rounded px-2 py-1 flex-1 min-w-[200px]`}>
                    <span className="text-xs mr-2">🔍</span>
                    <input type="text" placeholder="Search algorithms..." className="bg-transparent border-none outline-none text-xs w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>

                {savedCodes.length === 0 ? (
                  <div className={`py-12 text-center text-sm ${textSecondary}`}>No algorithms saved yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedCodes.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())).slice(0,4).map((item) => (
                      <div key={item.id} className={`border ${borderCol} rounded-lg p-4 hover:border-indigo-500 transition-all cursor-pointer`} onClick={() => navigate('/workspace', { state: { presetCode: item.code_content } })}>
                        <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-sm">{item.title}</h4><span className="text-yellow-500 text-sm">⭐</span></div>
                        <div className="flex gap-2 mb-2"><span className={`text-[10px] px-2 py-0.5 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>Python</span><span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-500">Medium</span></div>
                        <p className={`text-xs ${textSecondary} line-clamp-2 mb-3 h-8`}>{item.code_content?.substring(0, 50) || "Code snippet..."}</p>
                        <div className={`flex justify-between items-center text-[10px] ${textSecondary} pt-2 border-t ${borderCol}`}>
                          <div className="flex gap-3"><span>▶ 18 runs</span><span>❤️ {Math.floor(Math.random() * 20)}</span></div>
                          <span>Updated {new Date(item.updated_at || item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className={`${bgPanel} border ${borderCol} p-5 rounded-xl`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Recent Activity</h3>
                    <Link to="#" className={`text-xs ${textSecondary}`}>View All</Link>
                  </div>
                  <div className="space-y-4">
                    {recentActivities.length === 0 ? (
                      <div className={`text-sm ${textSecondary} text-center py-4`}>No recent activity found.</div>
                    ) : (
                      recentActivities.map((log) => {
                        const { icon, action } = getActivityFormatting(log.action_type, log.action_details);
                        return (
                          <div key={log.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                {icon}
                              </span>
                              <span className={`text-xs font-medium ${textPrimary}`}>{action}</span>
                            </div>
                            <span className={`text-[10px] ${textSecondary}`}>{getTimeAgo(log.created_at)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className={`${bgPanel} border ${borderCol} p-5 rounded-xl`}>
                  <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Achievements</h3><Link to="#" className={`text-xs ${textSecondary}`}>View All</Link></div>
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-lg bg-purple-900/40 border border-purple-500/50 flex items-center justify-center text-lg">👾</div>
                    <div className="w-10 h-10 rounded-lg bg-yellow-900/40 border border-yellow-500/50 flex items-center justify-center text-lg">🏅</div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-900/40 border border-emerald-500/50 flex items-center justify-center text-lg">🎓</div>
                    <div className="w-10 h-10 rounded-lg bg-blue-900/40 border border-blue-500/50 flex items-center justify-center text-lg">⭐</div>
                    <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center text-xs font-bold text-gray-400`}>+8</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}