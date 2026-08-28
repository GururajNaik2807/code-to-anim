import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import TutorialModal from './TutorialModal'; 
import TooltipTour from './TooltipTour'; 
import FeedbackWidget from './FeedbackWidget'; 
import { trackEvent, trackPageView } from '../utils/analytics'; // Imported GA4 helpers

import { ALGORITHMS_DATABASE } from '../data/algorithmsData';
import WorkspacePage from './WorkspacePage';

// --- Level System Definitions ---
const HONORS = [
  "Novice", "Beginner", "Apprentice", "Coder", "Scripter", 
  "Programmer", "Developer", "Engineer", "Architect", "Master", 
  "Grandmaster", "Algorithmist", "Code Weaver", "Logic Lord", "Byte Sorcerer", 
  "System Sage", "Kernel Knight", "Tech Titan", "Silicon Deity", "CodeAnim Legend"
];

const MAX_DISPLAY_NAME_LENGTH = 80;

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

// --- Custom SVG Icons ---
const Icons = {
  Home: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Workspace: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Library: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Leaderboard: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Feedback: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Moon: () => <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>,
  Sun: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
};

export default function ProfilePage() {
  const hasLoadedBefore = sessionStorage.getItem('profile_loaded') === 'true';
  const [showTutorial, setShowTutorial] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedCodes, setSavedCodes] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]); 
  
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('codeanim_current_view') || 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [libSearchTerm, setLibSearchTerm] = useState('');
  const [libCategory, setLibCategory] = useState('All');
  const [libDifficulty, setLibDifficulty] = useState('All');
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const headerSearchRef = useRef(null);
  const mainRef = useRef(null);

  const [loading, setLoading] = useState(!hasLoadedBefore);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [shareText, setShareText] = useState('Share Profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const { currentTheme, changeTheme } = useTheme(); 
  const { openAuthModal } = useAuth();
  
  const THEME_OPTIONS = ['light', 'dark', 'coffee'];
  const activeThemeName = THEME_OPTIONS.includes(currentTheme) ? currentTheme : 'dark';
  
  const themeStyles = {
    dark: {
      bgMain: 'bg-[#0A1118]', bgPanel: 'bg-[#111A22]', textPrimary: 'text-[#E2E8F0]', textSecondary: 'text-[#94A3B8]',
      scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#0A1118]',
      metallicBorder: 'border-[#1E293B]', hoverBg: 'hover:bg-[#1E293B]', hoverBorder: 'hover:border-[#38B2AC]', 
      accentText: 'text-[#38B2AC]', accentBg: 'bg-[#38B2AC]', accentBgLight: 'bg-[#38B2AC]/10',
      scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#1E293B] hover:[&::-webkit-scrollbar-thumb]:bg-[#38B2AC]',
      hexAccent: '#38B2AC', 
      sidebarBg: 'bg-[#111A22]/95', 
      sidebarContainer: 'border-r border-[#1E293B]', 
      sidebarText: 'text-[#E2E8F0]', sidebarTextSecondary: 'text-[#94A3B8]',
      activeSidebar: 'bg-[#38B2AC]/10 text-[#38B2AC] shadow-inner',
      inactiveSidebar: 'text-[#94A3B8] hover:bg-[#1E293B]'
    },
    coffee: {
      bgMain: 'bg-[#F5EBE1]', bgPanel: 'bg-[#EFE8DE]', textPrimary: 'text-[#3E2723]', textSecondary: 'text-[#765A51]',
      scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#F5EBE1]',
      metallicBorder: 'border-[#D7CCC8]', hoverBg: 'hover:bg-[#E8DED4]', hoverBorder: 'hover:border-[#8C5A48]', 
      accentText: 'text-[#8C5A48]', accentBg: 'bg-[#8C5A48]', accentBgLight: 'bg-[#8C5A48]/10',
      scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#D7CCC8] hover:[&::-webkit-scrollbar-thumb]:bg-[#8C5A48]',
      hexAccent: '#8C5A48', 
      sidebarBg: 'bg-[#8C5A48]', 
      sidebarContainer: 'border-r-0 shadow-[4px_0_24px_rgba(62,39,35,0.15)]', 
      sidebarText: 'text-white', sidebarTextSecondary: 'text-white/70',
      activeSidebar: 'bg-white text-black shadow-md',
      inactiveSidebar: 'text-white/70 hover:bg-white/20 hover:text-white'
    },
    light: {
      bgMain: 'bg-[#F5F2EB]', 
      scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#F5F2EB]',
      bgPanel: 'bg-[#FFFEFA]', 
      textPrimary: 'text-[#202124]', 
      textSecondary: 'text-[#5E5B55]', 
      metallicBorder: 'border-[#E8E3D8]', 
      hoverBg: 'hover:bg-[#F1EEE7]', 
      hoverBorder: 'hover:border-[#D9D1C4]', 
      accentText: 'text-[#31599B]', 
      accentBg: 'bg-[#31599B]', 
      accentBgLight: 'bg-[#EAF0FA]', 
      scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#D9D1C4] hover:[&::-webkit-scrollbar-thumb]:bg-[#817D74]', 
      hexAccent: '#31599B', 
      sidebarBg: 'bg-[#F8F5EE]', 
      sidebarContainer: 'border-r border-[#E8E3D8] shadow-[2px_0_15px_rgba(0,0,0,0.03)]', 
      sidebarText: 'text-[#202124]', 
      sidebarTextSecondary: 'text-[#5E5B55]',
      activeSidebar: 'bg-[#EAF0FA] text-[#31599B] border border-[#C9D7EE] shadow-sm', 
      inactiveSidebar: 'text-[#5E5B55] hover:bg-[#F1EEE7] hover:text-[#202124]'
    }
  };

  const activeStyle = themeStyles[activeThemeName];
  const { 
    bgMain, bgPanel, textPrimary, textSecondary, metallicBorder, hoverBg, hoverBorder, 
    accentText, accentBg, accentBgLight, scrollThumb, scrollTrack, hexAccent, 
    sidebarBg, sidebarContainer, sidebarText, sidebarTextSecondary, activeSidebar, inactiveSidebar 
  } = activeStyle;

  const isDark = activeThemeName === 'dark';

  const scrollbarStyles = `
    [&::-webkit-scrollbar]:w-2
    ${scrollTrack}
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-thumb]:rounded-full 
    [&::-webkit-scrollbar-thumb]:border-2 
    [&::-webkit-scrollbar-thumb]:border-transparent 
    [&::-webkit-scrollbar-thumb]:bg-clip-content
    ${scrollThumb}
  `;

  const cycleTheme = () => {
    const currentIndex = THEME_OPTIONS.indexOf(activeThemeName);
    const nextTheme = THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length];
    
    changeTheme(nextTheme); 
    sessionStorage.setItem('codeanim_session_theme', nextTheme);
    sessionStorage.setItem('codeanim_theme_changed', 'true'); 

    trackEvent('change_theme', { theme: nextTheme });
  };

  useEffect(() => {
    const syncThemeToSupabase = () => {
      const sessionTheme = sessionStorage.getItem('codeanim_session_theme');
      const wasChanged = sessionStorage.getItem('codeanim_theme_changed') === 'true';
      
      if (user?.id && sessionTheme && wasChanged) {
        supabase
          .from('profiles')
          .update({ selected_theme: sessionTheme })
          .eq('id', user.id)
          .then(() => sessionStorage.removeItem('codeanim_theme_changed')); 
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') syncThemeToSupabase();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', syncThemeToSupabase);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', syncThemeToSupabase);
      syncThemeToSupabase();
    };
  }, [user?.id]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false); 
    };
    checkMobile(); 
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerSearchRef.current && !headerSearchRef.current.contains(event.target)) {
        setIsHeaderSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (session) {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          fetchProfileData(session);
        }
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      } else if (!session && event === 'INITIAL_SESSION') {
         setTimeout(() => {
            if (isMounted) navigate('/auth');
         }, 500);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const fetchProfileData = async (session) => {
    setUser(session.user);
    const CACHE_KEY = `codeanim_dashboard_${session.user.id}`;
    const CACHE_EXPIRY = 5 * 60 * 1000; 

    const cachedString = sessionStorage.getItem(CACHE_KEY);
    if (cachedString) {
      try {
        const { data, timestamp } = JSON.parse(cachedString);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setProfile(data.profile);
          setSavedCodes(data.savedCodes);
          setProgressData(data.progressData);
          setDailyActivity(data.dailyActivity);
          setRecentActivities(data.recentActivities);
          setLeaderboardData(data.leaderboardData);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Cache corrupted, fetching fresh data...");
      }
    }

    try {
      const { data: payload, error } = await supabase.rpc('get_user_dashboard_payload', { p_user_id: session.user.id });
      if (error) throw error;

      const freshData = {
        profile: payload.profile || {},
        savedCodes: payload.savedCodes || [],
        progressData: payload.progressData || [],
        dailyActivity: payload.dailyActivity || [],
        recentActivities: payload.recentActivities || [],
        leaderboardData: payload.leaderboardData || []
      };
      
      if (freshData.profile.selected_theme && !sessionStorage.getItem('codeanim_session_theme')) {
         sessionStorage.setItem('codeanim_session_theme', freshData.profile.selected_theme);
         changeTheme(freshData.profile.selected_theme);
      }

      setProfile(freshData.profile);
      setSavedCodes(freshData.savedCodes);
      setProgressData(freshData.progressData);
      setDailyActivity(freshData.dailyActivity);
      setRecentActivities(freshData.recentActivities);
      setLeaderboardData(freshData.leaderboardData);

      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: freshData, timestamp: Date.now() }));
      sessionStorage.setItem('profile_loaded', 'true');
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    sessionStorage.removeItem(`codeanim_dashboard_${user?.id}`);
    sessionStorage.removeItem('profile_loaded');
    
    trackEvent('logout');

    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate('/');
    }, 1500);
  };

  const handleEditClick = () => {
    setEditName(profile?.display_name || user?.email?.split('@')[0] || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    const normalizedName = editName.trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
    if (!user?.id || !normalizedName) return;
    const { error } = await supabase.from('profiles').update({ display_name: normalizedName }).eq('id', user.id);
    if (!error) {
      setProfile({ ...profile, display_name: normalizedName });
      setIsEditing(false);
      
      trackEvent('update_profile', { feature: 'display_name' });

      const CACHE_KEY = `codeanim_dashboard_${user.id}`;
      const cachedString = sessionStorage.getItem(CACHE_KEY);
      if(cachedString) {
        const parsedCache = JSON.parse(cachedString);
        parsedCache.data.profile.display_name = normalizedName;
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(parsedCache));
      }
    }
  };

  const handleShareProfile = () => {
    if (!user?.id) return;
    const shareUrl = `${window.location.origin}/p/${user.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareText('Link Copied! 🔗');
      trackEvent('share_profile', { user_id: user.id });
      setTimeout(() => setShareText('Share Profile'), 2000);
    });
  };

  const headerSearchResults = useMemo(() => {
    if (!headerSearchTerm.trim()) return [];
    const query = headerSearchTerm.toLowerCase();
    return ALGORITHMS_DATABASE.filter(algo => 
      algo.title.toLowerCase().includes(query) ||
      algo.category.toLowerCase().includes(query) ||
      algo.description.toLowerCase().includes(query)
    ).slice(0, 8); 
  }, [headerSearchTerm]);

  const completedAlgos = useMemo(() => new Set(progressData.filter(p => p.progress_percent === 100).map(p => p.algorithm_id)), [progressData]);
  const libCategories = useMemo(() => ['All', ...Array.from(new Set(ALGORITHMS_DATABASE.map(algo => algo.category)))].sort(), []);
  const libDifficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredLibrary = useMemo(() => {
    return ALGORITHMS_DATABASE.filter((algo) => {
      const searchStr = libSearchTerm.toLowerCase();
      const matchesSearch = algo.title.toLowerCase().includes(searchStr) || algo.description.toLowerCase().includes(searchStr) || algo.category.toLowerCase().includes(searchStr);
      const matchesCategory = libCategory === 'All' || algo.category === libCategory;
      const matchesDifficulty = libDifficulty === 'All' || algo.difficulty === libDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [libSearchTerm, libCategory, libDifficulty]);

  const handleOpenInTracer = (algo) => {
    trackEvent('search_select_algorithm', { algorithm_id: algo.id, algorithm_title: algo.title });
    
    setHeaderSearchTerm('');
    setIsHeaderSearchOpen(false);
    navigate('/profile', { 
      state: { 
        presetCode: algo.code,
        metadata: {
          id: algo.id, type: 'algorithm', algorithmTitle: algo.title, strategy: algo.category,
          category: algo.category, difficulty: algo.difficulty, description: algo.description,
          insight: algo.insight, 
          language: 'Python 3', complexityTime: algo.timeComplexity, complexitySpace: algo.spaceComplexity
        }
      } 
    });
    setCurrentView('workspace');
    if(isMobile) setIsSidebarOpen(false);
  };

  const generateHeatmap = () => {
    const today = new Date();
    return Array.from({ length: 84 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (83 - i));
      const dateStr = d.toISOString().split('T')[0];
      const activity = dailyActivity.find(a => a.activity_date === dateStr);
      const count = activity ? activity.execution_count : 0;
      
      let fillClass = bgPanel; 
      if (count > 0 && count <= 2) fillClass = `${accentBg} opacity-40`;
      if (count > 2 && count <= 5) fillClass = `${accentBg} opacity-70`;
      if (count > 5) fillClass = `${accentBg}`;
      
      return <div key={i} className={`w-full aspect-square rounded-[2px] ${fillClass} transition-colors border ${metallicBorder}`} title={`${dateStr}: ${count} executions`}></div>;
    });
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

  const handleScroll = (e) => {
    if (currentView === 'library') sessionStorage.setItem('library_scroll_pos', e.target.scrollTop);
  };

  useEffect(() => {
    if (currentView === 'library' && mainRef.current) {
      const savedScroll = sessionStorage.getItem('library_scroll_pos');
      if (savedScroll) {
        setTimeout(() => { if (mainRef.current) mainRef.current.scrollTop = parseInt(savedScroll, 10); }, 50);
      }
    }
  }, [currentView]);

  if (loading) {
    return (
      <div className={`h-screen w-full flex flex-col items-center justify-center font-mono gap-4 ${bgMain} ${textPrimary}`}>
        <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-[${hexAccent}]`}></div>
        <p className={`text-sm tracking-widest uppercase font-bold animate-pulse ${accentText}`}>Loading Dashboard...</p>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const userHandle = `@${displayName.toLowerCase().replace(/\s/g, '')}`;
  const userInitial = displayName.charAt(0).toUpperCase();
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

  const handleNavClick = (view) => {
    setCurrentView(view);
    localStorage.setItem('codeanim_current_view', view);
    
    // GA4 Navigation Event Track
    trackEvent('nav_click', { view_name: view, view_mode: 'embedded' });
    trackPageView(`/profile/${view}`, { view_mode: 'embedded', tab_name: view });

    if (isMobile) setIsSidebarOpen(false);
  };

  const navLinks = [
    { section: 'WORKSPACE', links: [{ name: 'Workspace', action: () => handleNavClick('workspace'), icon: <Icons.Workspace />, isActive: currentView === 'workspace' }] },
    { section: 'LEARNING', links: [{ name: 'Algorithm Library', action: () => handleNavClick('library'), icon: <Icons.Library />, isActive: currentView === 'library' }] },
    { section: 'COMMUNITY', links: [
      { name: 'Leaderboard', action: () => handleNavClick('leaderboard'), icon: <Icons.Leaderboard />, isActive: currentView === 'leaderboard' },
      { name: 'Give Feedback', action: () => handleNavClick('feedback'), icon: <Icons.Feedback />, isActive: currentView === 'feedback' }
    ] }
  ];

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
      <div className={`flex flex-col items-center p-6 rounded-3xl border ${metallicBorder} ${bgPanel} ${glow} relative overflow-hidden flex-1 max-w-[280px] transition-transform duration-300 podium-card ${rank === 1 ? 'md:-mt-8 z-10 scale-105' : 'opacity-90'} hover:-translate-y-2 ${hoverBorder}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${rankColors} rounded-full blur-3xl opacity-20 pointer-events-none`}></div>
        <div className="absolute top-4 right-4 text-2xl drop-shadow-md">{badge}</div>
        <div className={`absolute top-4 left-4 text-xs font-black ${textSecondary}`}>#{rank}</div>
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${rankColors} flex items-center justify-center text-3xl font-black shadow-lg mb-4 mt-2 border-2 ${metallicBorder}`}>{initial}</div>
        <h3 className="font-bold text-lg tracking-tight truncate w-full text-center">{player.display_name || 'Anonymous'}</h3>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${textSecondary} mt-1 mb-4`}>{honor}</p>
        <div className={`w-full py-2 px-3 rounded-xl border ${metallicBorder} ${bgMain} flex justify-between items-center shadow-inner`}>
          <span className={`text-xs font-bold ${textSecondary}`}>Lv. {level}</span>
          <span className={`text-sm font-black ${accentText}`}>{totalXP.toLocaleString()} XP</span>
        </div>
      </div>
    );
  };

  const isCollapsed = !isSidebarHovered && !isMobile;
  const itemLayout = `relative flex items-center h-12 mx-auto transition-all duration-300 overflow-hidden ${
    isCollapsed ? 'w-12 justify-center rounded-2xl' : 'w-[calc(100%-1.5rem)] justify-start px-4 rounded-xl'
  }`;
  const activeSidebarClass = activeSidebar;
  const inactiveSidebarClass = inactiveSidebar;

  return (
    <div className={`flex h-screen w-full font-sans ${bgMain} ${textPrimary} overflow-hidden relative`}>

      <style>{`
        @keyframes scroll-left { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
        .animate-scroll-left { animation: scroll-left 30s linear infinite; }
        .animate-scroll-left:hover { animation-play-state: paused; }
        
        .sidebar-text { transition: opacity 0.2s ease-in-out; white-space: nowrap; overflow: hidden; }

        @media (max-width: 768px) {
          .sidebar-container { position: absolute !important; height: 100% !important; z-index: 50 !important; box-shadow: 5px 0 20px rgba(0,0,0,0.5) !important; }
          .mobile-header { height: auto !important; flex-direction: row !important; padding: 10px 16px !important; gap: 10px !important; align-items: center !important; }
          .mobile-header > div:first-child { flex: 1 !important; width: auto !important; }
          .mobile-header input { width: 100% !important; }
          .profile-card { flex-direction: column !important; text-align: center !important; padding: 20px 16px !important; gap: 16px !important; }
          .profile-user-info { flex-direction: column !important; align-items: center !important; text-align: center !important; width: 100% !important; gap: 12px !important; }
          .profile-card-stats { width: 100% !important; margin-top: 4px !important; align-items: center !important; }
          .profile-badges-row { justify-content: center !important; flex-wrap: wrap !important; gap: 6px !important; }
          .profile-edit-actions { width: 100% !important; justify-content: center !important; gap: 8px !important; }
          .profile-edit-actions button { flex: 1 !important; min-width: 0 !important; padding-left: 8px !important; padding-right: 8px !important; font-size: 13px !important; }
          .quick-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
          .dashboard-panels-grid, .dashboard-bottom-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 16px !important; }
          .podium-container { flex-direction: column !important; gap: 20px !important; align-items: center !important; padding-bottom: 24px !important; }
          .podium-card { width: 100% !important; max-width: 100% !important; margin-top: 0 !important; transform: none !important; }
          .library-filters { flex-direction: column !important; gap: 12px !important; }
          .library-filters > div { width: 100% !important; }
          .library-filters button { flex: 1 1 40% !important; }
        }
      `}</style>

      {isLoggingOut && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className={`relative w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center transform transition-all border ${metallicBorder} ${bgPanel}`}>
            <div className={`w-16 h-16 ${accentBgLight} ${accentText} rounded-full flex items-center justify-center text-3xl mb-4 border ${metallicBorder} shadow-inner`}>👋</div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">Successfully Logged Out</h2>
            <p className={`text-sm leading-relaxed mb-6 ${textSecondary}`}>Your progress has been securely saved. Redirecting you to home...</p>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${bgMain} border ${metallicBorder} shadow-none`}>
              <div className={`h-full ${accentBg} w-full animate-[pulse_1s_ease-in-out_infinite]`}></div>
            </div>
          </div>
        </div>
      )}

      <div 
        className={`sidebar-container transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden relative z-20 rounded-r-[2rem] ${isMobile ? (isSidebarOpen ? 'w-64' : 'w-0') : (isSidebarHovered ? 'w-64' : 'w-20')} ${sidebarContainer}`}
        onMouseEnter={() => !isMobile && setIsSidebarHovered(true)}
        onMouseLeave={() => !isMobile && setIsSidebarHovered(false)}
      >
        <aside className={`w-full h-full ${sidebarBg} backdrop-blur-md flex flex-col justify-between overflow-y-auto ${scrollbarStyles}`}>
          <div>
            <Link to="/" className={`h-16 flex items-center tracking-tight border-b border-transparent group transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
              <img 
                src="/favicon.svg" 
                alt="CodeToAnim Logo" 
                className={`shrink-0 rounded-md object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${isCollapsed ? 'w-11 h-11' : 'w-7 h-7'}`} 
              />
              <span className={`font-extrabold text-xl whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'} ${sidebarText}`}>
                CodeTo<span className="opacity-80">Anim</span>
              </span>
            </Link>

            <div className="py-4 border-b border-white/10">
              <button 
                onClick={() => handleNavClick('dashboard')}
                className={`font-bold transition-all duration-300 ${itemLayout} ${currentView === 'dashboard' ? activeSidebarClass : inactiveSidebarClass}`}
              >
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center"><Icons.Home /></div>
                <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'}`}>
                  Dashboard
                </span>
              </button>
            </div>

            <div className="py-6">
              {navLinks.map((group, idx) => (
                <div key={idx} className={idx > 0 ? "mt-6" : ""}>
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'text-center px-0 opacity-50' : 'px-6 opacity-100'} ${sidebarTextSecondary}`}>
                    {isCollapsed ? '•••' : group.section}
                  </h4>
                  <div className="space-y-1.5">
                    {group.links.map((link, lIdx) => {
                      const activeClasses = link.isActive ? activeSidebarClass : inactiveSidebarClass;
                      return link.action ? (
                        <button key={lIdx} onClick={link.action} className={`font-bold transition-all duration-300 ${itemLayout} ${activeClasses}`}>
                          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">{link.icon}</div>
                          <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'}`}>
                            {link.name}
                          </span>
                        </button>
                      ) : (
                        <Link key={lIdx} to={link.path} className={`font-bold transition-all duration-300 ${itemLayout} ${activeClasses}`}>
                          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">{link.icon}</div>
                          <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'}`}>
                            {link.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-4 mt-auto ${isDark ? `border-t ${metallicBorder}` : 'border-none'}`}>
            <button 
              onClick={cycleTheme} 
              className={`flex items-center h-12 mx-auto transition-all duration-300 overflow-hidden shadow-sm ${
                isCollapsed 
                  ? 'w-12 justify-center rounded-2xl bg-black/10 hover:bg-black/20' 
                  : `w-[calc(100%-1rem)] px-4 justify-between rounded-xl ${!isDark ? 'bg-black/5 hover:bg-black/10' : `border ${metallicBorder} ${hoverBg}`}`
              }`}
            >
              <div className={`flex items-center text-sm font-bold ${!isDark ? sidebarText : textSecondary}`}>
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {activeThemeName === 'dark' && <Icons.Moon />}
                  {activeThemeName === 'light' && <Icons.Sun />}
                  {activeThemeName === 'coffee' && <span className="text-lg leading-none">☕</span>}
                </div>
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[100px] opacity-100 ml-3'} ${sidebarText}`}>
                  Theme
                </span>
              </div>
              <span className={`text-xs font-medium capitalize whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[60px] opacity-100'} ${sidebarTextSecondary}`}>
                {activeThemeName}
              </span>
            </button>
          </div>
        </aside>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className={`h-16 flex-shrink-0 border-b ${metallicBorder} ${bgPanel}/80 backdrop-blur-md flex items-center justify-between px-8 z-10 transition-all mobile-header`}>
          <div className="flex items-center gap-4">
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl border ${metallicBorder} ${hoverBg} transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-sm group`}>
                <svg className={`w-5 h-5 ${textSecondary} transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </button>
            )}

            <div ref={headerSearchRef} className="relative z-50">
              <div className={`flex items-center w-80 lg:w-96 border ${metallicBorder} rounded-xl px-3 py-1.5 transition-shadow focus-within:ring-2 focus-within:ring-opacity-30 ${bgMain}`}>
                <span className="text-slate-400 text-sm">🔍</span>
                <input 
                  type="text" value={headerSearchTerm} onChange={(e) => { setHeaderSearchTerm(e.target.value); setIsHeaderSearchOpen(true); }} onFocus={() => setIsHeaderSearchOpen(true)}
                  placeholder="Search algorithms, topics, users..." 
                  className={`bg-transparent border-none outline-none text-sm font-medium w-full ml-2 placeholder-opacity-70 ${textPrimary}`} 
                />
                {headerSearchTerm && <button onClick={() => setHeaderSearchTerm('')} className={`hover:opacity-80 text-xs px-1 ${textSecondary}`}>✕</button>}
              </div>

              {isHeaderSearchOpen && headerSearchTerm.trim().length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border ${metallicBorder} ${bgPanel} overflow-hidden max-h-80 overflow-y-auto ${scrollbarStyles} z-50 transition-all`}>
                  <div className={`p-2 border-b ${metallicBorder} text-[10px] font-black uppercase tracking-wider ${accentText} px-4`}>Algorithm Results ({headerSearchResults.length})</div>
                  {headerSearchResults.length > 0 ? (
                    <div className="p-1 space-y-1">
                      {headerSearchResults.map((algo) => (
                        <div key={algo.id} onClick={() => handleOpenInTracer(algo)} className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${hoverBg} group`}>
                          <div>
                            <div className={`font-bold text-sm ${accentText} flex items-center gap-2`}><span>{algo.title}</span></div>
                            <div className={`text-[11px] line-clamp-1 ${textSecondary} mt-0.5`}>{algo.description}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${accentBgLight} ${accentText} border ${metallicBorder}`}>{algo.category}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${algo.difficulty === 'Easy' ? 'text-emerald-500 bg-emerald-500/10' : algo.difficulty === 'Medium' ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10'}`}>{algo.difficulty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-6 text-center text-xs ${textSecondary}`}>No matching algorithms found for "{headerSearchTerm}"</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className={`flex items-center gap-3 cursor-pointer pl-4 border-l ${metallicBorder}`} onClick={handleLogoutClick}>
              <div className={`w-9 h-9 rounded-full ${accentBg} flex items-center justify-center text-white font-bold text-sm shadow-md`}>{userInitial}</div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-sm font-bold leading-tight">{displayName}</span>
                <span className={`text-[10px] font-medium ${textSecondary} leading-tight`}>Log Out</span>
              </div>
            </div>
          </div>
        </header>

        <main ref={mainRef} onScroll={handleScroll} className={`flex-1 ${currentView === 'workspace' ? 'overflow-hidden flex flex-col' : `overflow-y-auto p-4 md:p-8 ${scrollbarStyles}`}`}>
          
          {currentView === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className={`w-full overflow-hidden rounded-2xl border ${metallicBorder} ${accentBgLight} shadow-sm flex items-center group`}>
                <div className="whitespace-nowrap inline-block pl-[100%] animate-scroll-left py-3">
                  <span className={`text-xs md:text-sm font-bold ${accentText} flex items-center gap-2`}>
                    <img src="/favicon.svg" alt="Logo" className="w-4 h-4 object-contain" /> 
                    We are actively building <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 tracking-tight text-sm md:text-base">CodeToAnim</span> for visual learners and developers. Your suggestions directly shape our next updates. — 
                    <button onClick={() => handleNavClick('feedback')} className="underline decoration-2 underline-offset-2 hover:opacity-70 transition-colors cursor-pointer mx-1">Give Feedback</button> 
                    to share your thoughts and help shape the platform! 💡
                  </span>
                </div>
              </div>
              
              <div className={`profile-card ${bgPanel}/90 backdrop-blur-md border ${metallicBorder} rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center shadow-sm relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${accentBgLight} rounded-full blur-3xl pointer-events-none opacity-50`}></div>
                
                <div className="profile-user-info flex items-center gap-6 relative z-10 w-full md:w-auto">
                  <div className="relative group flex-shrink-0">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${accentBg} border-4 border-transparent flex items-center justify-center text-3xl md:text-4xl text-white font-black shadow-xl group-hover:scale-105 transition-transform`}>{userInitial}</div>
                    <button onClick={handleEditClick} className={`absolute bottom-0 right-0 p-1.5 ${bgMain} rounded-full border-2 ${metallicBorder} text-xs shadow-md ${hoverBg} transition-colors`}>✏️</button>
                  </div>

                  <div className="flex-1 min-w-0 max-w-full">
                    {isEditing ? (
                      <div className="flex items-center gap-2 mb-1 justify-center md:justify-start flex-wrap">
                        <input type="text" value={editName} maxLength={MAX_DISPLAY_NAME_LENGTH} onChange={(e) => setEditName(e.target.value)} className={`text-xl md:text-2xl font-black bg-transparent border-b-2 ${metallicBorder} w-40 outline-none focus:border-b-4 focus:border-[${hexAccent}] ${textPrimary}`} autoFocus />
                        <button onClick={handleSaveProfile} className={`text-xs font-bold ${accentBg} text-white px-3 py-1 rounded-lg shadow-md hover:opacity-80 transition-colors`}>Save</button>
                        <button onClick={() => setIsEditing(false)} className={`text-xs font-bold px-3 py-1 rounded-lg border ${metallicBorder} ${hoverBg} transition-colors`}>Cancel</button>
                      </div>
                    ) : (
                      <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate max-w-full">{displayName}</h1>
                    )}
                    <p className={`text-xs md:text-sm font-medium ${textSecondary} truncate`}>{userHandle}</p>
                    <div className="profile-badges-row flex items-center gap-2 mt-3 flex-wrap justify-center md:justify-start">
                      <span className={`text-[11px] md:text-xs px-2.5 py-1 rounded-md ${bgMain} border ${metallicBorder} font-bold shadow-sm flex items-center gap-1.5`}><span className={`text-[9px] uppercase ${textSecondary}`}>Lv. {levelInfo.level}</span> {levelInfo.honor}</span>
                      <span className={`text-[11px] md:text-xs px-2.5 py-1 rounded-md ${accentBgLight} ${accentText} border ${metallicBorder} font-bold shadow-sm`}>Algorithm Explorer</span>
                    </div>
                  </div>
                </div>

                <div className="profile-card-stats flex flex-col items-end gap-4 mt-4 md:mt-0 w-full md:w-1/3 relative z-10">
                  <div className={`w-full ${bgMain} p-4 rounded-2xl border ${metallicBorder}`}>
                    <div className="flex justify-between text-xs md:text-sm font-bold mb-2">
                      <span className={`${accentText}`}>Level {levelInfo.level}</span>
                      <span className={textSecondary}>{levelInfo.totalXP.toLocaleString()} <span className="opacity-50">/ {levelInfo.nextLevelXP.toLocaleString()} XP</span></span>
                    </div>
                    <div className={`w-full h-2 rounded-full border ${metallicBorder} ${bgPanel} overflow-hidden shadow-inner`}>
                      <div className={`h-full ${accentBg} rounded-full transition-all duration-700 ease-out`} style={{ width: `${levelInfo.progressPercent}%` }}></div>
                    </div>
                    <p className={`text-[11px] font-semibold ${textSecondary} mt-2 text-center md:text-right`}>{levelInfo.isMax ? "Max Level Reached!" : `${levelInfo.xpRemaining.toLocaleString()} XP to level up`}</p>
                  </div>

                  <div className="profile-edit-actions flex gap-3 w-full justify-end">
                    <button onClick={handleEditClick} className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl shadow-sm border ${metallicBorder} ${hoverBg} transition-colors`}>Edit Profile</button>
                    <button onClick={handleShareProfile} className={`px-4 py-2 text-xs md:text-sm font-bold ${accentBg} hover:opacity-80 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 md:w-36`}>{shareText}</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 quick-stats-grid">
                {quickStats.map((stat, i) => (
                  <div key={i} className={`${bgPanel}/90 backdrop-blur-md border ${metallicBorder} ${hoverBorder} p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 group`}>
                    <div className="flex justify-between items-start mb-3"><div className={`p-2.5 rounded-xl shadow-inner border ${metallicBorder} ${bgMain} ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</div></div>
                    <div>
                      <h4 className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>{stat.label}</h4>
                      <div className="text-2xl font-black mt-1 tracking-tight">{stat.val}</div>
                      <div className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1">{stat.trend}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 dashboard-panels-grid">
                <div className={`lg:col-span-1 ${bgPanel}/90 backdrop-blur-md border ${metallicBorder} p-6 rounded-3xl shadow-sm flex flex-col`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Learning Activity</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${metallicBorder} ${bgMain} ${textSecondary}`}>12 Weeks</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1.5 mb-6 flex-1 items-center">{generateHeatmap()}</div>
                </div>

                <div className={`lg:col-span-1 ${bgPanel}/90 backdrop-blur-md border ${metallicBorder} p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${accentBgLight} rounded-full blur-2xl`}></div>
                  <div><h3 className="font-bold text-lg mb-1">Continue Learning</h3><p className={`text-xs font-medium ${textSecondary}`}>Pick up where you left off</p></div>
                  {recentAlgo ? (
                    <div className="flex items-center gap-4 mt-6">
                      <div className={`w-14 h-14 rounded-2xl border ${metallicBorder} shadow-inner ${bgMain} flex items-center justify-center text-2xl`}>🧱</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm leading-tight">{recentAlgo.title}</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mt-1`}>{recentAlgo.category} • {recentAlgo.difficulty}</p>
                      </div>
                    </div>
                  ) : <div className={`flex-1 flex items-center justify-center text-sm font-medium ${textSecondary} py-10`}>No pending lessons.</div>}
                  <button onClick={() => setCurrentView('library')} className={`w-full py-3 ${accentBg} hover:opacity-80 text-white text-sm font-bold rounded-xl shadow-md transition-all mt-6`}>Explore Library</button>
                </div>

                <div className={`lg:col-span-1 ${bgPanel}/90 backdrop-blur-md border ${metallicBorder} p-6 rounded-3xl shadow-sm flex flex-col`}>
                  <h3 className="font-bold text-lg mb-1">Topic Mastery</h3><p className={`text-xs font-medium ${textSecondary} mb-6`}>Progress across categories</p>
                  <div className="space-y-5 flex-1">
                    {algoProgressStats.map((topic, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 w-1/3"><span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${metallicBorder} ${bgMain}`}>{topic.icon}</span><span className={`text-xs font-bold ${textSecondary}`}>{topic.name}</span></div>
                        <div className="w-[45%]"><div className={`h-1.5 w-full rounded-full border ${metallicBorder} ${bgMain}`}><div className={`h-full ${accentBg} rounded-full`} style={{ width: `${topic.prog}%` }}></div></div></div>
                        <span className="text-xs font-black w-10 text-right">{topic.prog}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 dashboard-bottom-grid">
                <div className={`lg:col-span-2 ${bgPanel}/90 backdrop-blur-md border ${metallicBorder} p-6 rounded-3xl shadow-sm flex flex-col`}>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3"><h3 className="font-bold text-lg">Saved Algorithms</h3><span className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${metallicBorder} ${bgMain}`}>{savedCodes.length}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className={`flex items-center border ${metallicBorder} rounded-xl px-3 py-2 flex-1 min-w-[200px] ${bgMain}`}>
                      <span className="text-sm mr-2 text-slate-400">🔍</span>
                      <input type="text" placeholder="Search saved algorithms..." className={`bg-transparent border-none outline-none text-sm font-medium w-full ${textPrimary}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                  </div>
                  {savedCodes.length === 0 ? (
                    <div className={`flex-1 flex flex-col items-center justify-center text-center py-10 ${textSecondary}`}><p className="text-sm font-medium">No algorithms saved yet.</p></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedCodes.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())).slice(0,4).map((item) => (
                        <div key={item.id} className={`border ${metallicBorder} ${hoverBorder} rounded-2xl p-5 ${hoverBg} cursor-pointer ${bgPanel}`} 
                          onClick={() => { 
                            trackEvent('load_saved_algorithm', { title: item.title });
                            navigate('/profile', { state: { presetCode: item.code_content } }); 
                            setCurrentView('workspace'); 
                          }}>
                          <h4 className="font-bold text-sm tracking-tight mb-3">{item.title}</h4>
                          <div className={`text-xs font-mono p-2 rounded-lg border ${metallicBorder} ${bgMain} line-clamp-2 h-10 mb-4 shadow-inner ${textSecondary}`}>{item.code_content?.substring(0, 50) || "Code snippet..."}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className={`${bgPanel}/90 backdrop-blur-md border ${metallicBorder} p-6 rounded-3xl shadow-sm`}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2"><h3 className="font-bold text-lg">Top Ranked</h3><span className="text-amber-500 text-sm drop-shadow-md">🏆</span></div>
                      <button onClick={() => setCurrentView('leaderboard')} className={`text-xs font-bold ${accentText} hover:opacity-80 transition-colors`}>View All</button>
                    </div>
                    <div className="space-y-3">
                      {leaderboardData.length === 0 ? (
                        <div className={`text-sm font-medium ${textSecondary} text-center py-4`}>Loading ranks...</div>
                      ) : (
                        leaderboardData.slice(0, 3).map((player, idx) => {
                          const rank = idx + 1;
                          const pLevel = calculateLevelInfo(player.current_xp || 0).level;
                          return (
                            <div key={player.id} onClick={() => setCurrentView('leaderboard')} className={`flex items-center justify-between p-3 rounded-2xl border ${metallicBorder} transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${bgMain} ${hoverBg} ${hoverBorder}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-sm border ${metallicBorder} ${rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-yellow-900/30' : rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-900/30' : rank === 3 ? 'bg-gradient-to-br from-orange-400 to-amber-700 shadow-orange-900/30' : accentBg}`}>{(player.display_name || 'U').charAt(0).toUpperCase()}</div>
                                <div><span className={`text-sm font-bold ${textPrimary}`}>{player.display_name || 'Anonymous'}</span><div className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Lv. {pLevel}</div></div>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-black ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-orange-500' : accentText}`}>#{rank}</div>
                                <div className={`text-[10px] font-semibold ${textSecondary}`}>{(player.current_xp || 0).toLocaleString()} XP</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className={`${bgPanel}/90 backdrop-blur-md border ${metallicBorder} p-6 rounded-3xl shadow-sm`}>
                    <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg">Badges</h3></div>
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer">👾</div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer">🏅</div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer">🎓</div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer">⭐</div>
                      <div className={`w-10 h-10 rounded-xl border ${metallicBorder} ${bgMain} flex items-center justify-center text-xs font-black ${textSecondary} shadow-inner`}>+8</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'feedback' && (
            <div className="max-w-3xl mx-auto py-10 space-y-8">
              <div className="text-center space-y-3 mb-10 mt-4">
                <h1 className="text-4xl font-black tracking-tight">We'd Love Your Feedback!</h1>
                <p className={`text-sm font-medium ${textSecondary}`}>Help us improve CodeToAnim by sharing your thoughts.</p>
              </div>
              <FeedbackWidget 
                user={user} 
                isDark={isDark} 
                metallicBorder={metallicBorder} 
                textSecondary={textSecondary} 
                bgPanel={bgPanel}
                accentBg={accentBg}
                accentText={accentText}
                hoverBg={hoverBg}
                textPrimary={textPrimary}
              />
            </div>
          )}

          {currentView === 'leaderboard' && (
            <div className="max-w-5xl mx-auto space-y-12 pb-10">
              <div className="text-center space-y-3 mt-4">
                <h1 className="text-4xl font-black tracking-tight">Global Rankings</h1>
                <p className={`text-sm font-medium ${textSecondary}`}>Top 50 developers by total XP across CodeAnim.</p>
              </div>
              {top3.length > 0 && (
                <div className="podium-container flex flex-col md:flex-row justify-center items-end gap-6 pt-4 pb-8">
                  {top3.length > 1 && renderPodiumCard(top3[1], 2)}
                  {renderPodiumCard(top3[0], 1)}
                  {top3.length > 2 && renderPodiumCard(top3[2], 3)}
                </div>
              )}
              {restOfLeaderboard.length > 0 && (
                <div className={`${bgPanel}/90 backdrop-blur-md border ${metallicBorder} rounded-3xl p-6 shadow-sm`}>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className={`border-b ${metallicBorder}`}>
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
                            <tr key={player.id} className={`border-b last:border-b-0 transition-colors border ${metallicBorder} ${hoverBorder} ${isCurrentUser ? `${accentBgLight}` : hoverBg}`}>
                              <td className="py-4 px-6"><span className={`text-sm font-bold ${textSecondary}`}>#{rank}</span></td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isCurrentUser ? accentBg : 'bg-slate-500'}`}>{(player.display_name || 'U').charAt(0).toUpperCase()}</div>
                                  <div>
                                    <div className={`font-bold text-sm flex items-center gap-2 ${isCurrentUser ? accentText : textPrimary}`}>
                                      {player.display_name || 'Anonymous'}
                                      {isCurrentUser && <span className={`text-[9px] px-1.5 py-0.5 rounded border ${accentBgLight} border ${metallicBorder} ${accentText}`}>YOU</span>}
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>{honor}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6"><span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${metallicBorder} ${bgMain}`}>Lv. {level}</span></td>
                              <td className="py-4 px-6 text-right"><span className={`text-sm font-black ${accentText}`}>{totalXP.toLocaleString()} XP</span></td>
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

          {currentView === 'library' && (
            <div className="max-w-7xl mx-auto pb-10">
              <div className="text-center space-y-3 mb-10 mt-4">
                <h1 className="text-4xl font-black tracking-tight">Algorithm Library</h1>
                <p className={`text-sm font-medium ${textSecondary}`}>Explore and visualize {ALGORITHMS_DATABASE.length} computer science algorithms step-by-step.</p>
              </div>

              <div className={`library-filters flex flex-col gap-5 p-6 rounded-3xl border ${metallicBorder} ${bgPanel}/90 backdrop-blur-md shadow-sm mb-8`}>
                <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
                  <div className="relative w-full lg:w-96">
                    <span className={`absolute left-4 top-3 text-sm ${textSecondary}`}>🔍</span>
                    <input type="text" placeholder="Search algorithms or topics..." value={libSearchTerm} onChange={(e) => setLibSearchTerm(e.target.value)} className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all shadow-inner ${bgMain} ${metallicBorder} ${textPrimary}`} />
                  </div>
                  <div className={`flex flex-wrap border rounded-xl p-1.5 w-full lg:w-auto ${bgMain} ${metallicBorder} shadow-inner`}>
                    {libDifficulties.map((diff) => (
                      <button key={diff} onClick={() => setLibDifficulty(diff)} className={`flex-1 px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${libDifficulty === diff ? diff === 'Easy' ? 'bg-emerald-500/20 text-emerald-500 shadow-sm' : diff === 'Medium' ? 'bg-amber-500/20 text-amber-500 shadow-sm' : diff === 'Hard' ? 'bg-rose-500/20 text-rose-500 shadow-sm' : `${accentBgLight} ${accentText} shadow-sm` : `${textSecondary} ${hoverBg}`}`}>{diff}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Topics:</span>
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex-1">
                    {libCategories.map((cat) => (
                      <button key={cat} onClick={() => setLibCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${libCategory === cat ? `${accentBg} border-transparent text-white shadow-md` : `${bgPanel} ${metallicBorder} ${textSecondary} ${hoverBg}`}`}>{cat}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLibrary.map((algo) => {
                  const isCompleted = completedAlgos.has(algo.id);
                  return (
                    <div key={algo.id} className={`border rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl group ${metallicBorder} ${hoverBorder} ${bgPanel}/90 backdrop-blur-md`}>
                      <div>
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex gap-2">
                            <span className={`text-[10px] font-mono uppercase font-black ${accentText} ${accentBgLight} border ${metallicBorder} px-2.5 py-1 rounded-md shadow-sm`}>{algo.category}</span>
                            {isCompleted && <span className="text-[10px] font-mono font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">✅ DONE</span>}
                          </div>
                          <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-black shadow-sm ${algo.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : algo.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'}`}>{algo.difficulty}</span>
                        </div>
                        <h3 className={`text-lg font-black mb-3 tracking-tight transition-colors ${textPrimary} group-hover:opacity-80`}>{algo.title}</h3>
                        <p className={`text-xs leading-relaxed mb-6 font-medium line-clamp-3 ${textSecondary}`}>{algo.description}</p>
                      </div>

                      <div>
                        <div className={`flex justify-between py-3 border-t border-b mb-6 font-mono text-[11px] font-bold rounded-xl px-4 border ${metallicBorder} ${bgMain} shadow-inner`}>
                          <div className="flex flex-col gap-1"><span className={`text-[9px] uppercase tracking-widest ${textSecondary}`}>Time</span><span className={textPrimary}>{algo.timeComplexity}</span></div>
                          <div className={`w-px h-auto ${metallicBorder}`}></div>
                          <div className="flex flex-col gap-1 text-right"><span className={`text-[9px] uppercase tracking-widest ${textSecondary}`}>Space</span><span className={textPrimary}>{algo.spaceComplexity}</span></div>
                        </div>
                        <button onClick={() => handleOpenInTracer(algo)} className={`w-full py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border ${accentBgLight} ${accentText} ${metallicBorder} hover:opacity-80`}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                          <span>{isCompleted ? 'Review Algorithm' : 'Visualize Step-by-Step'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredLibrary.length === 0 && (
                <div className={`py-24 flex flex-col items-center justify-center text-center rounded-3xl border ${metallicBorder} ${bgMain}`}>
                  <span className="text-5xl mb-5 opacity-50">📭</span>
                  <h3 className="text-xl font-bold mb-2">No algorithms found</h3>
                  <p className={`text-sm font-medium max-w-sm ${textSecondary}`}>Adjust your search or filter criteria to explore the database.</p>
                  <button onClick={() => { setLibSearchTerm(''); setLibCategory('All'); setLibDifficulty('All'); }} className={`mt-6 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors border ${metallicBorder} ${hoverBg}`}>Clear Filters</button>
                </div>
              )}
            </div>
          )}

          {currentView === 'workspace' && (
            <WorkspacePage 
              isEmbedded={true} 
              isDark={isDark} 
              theme={activeThemeName}
              themeColors={{
                  bg: bgMain, panel: bgPanel, text: textPrimary, border: metallicBorder,
                  accentBg: hexAccent, accentText: hexAccent
              }} 
            />
          )}

        </main>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all">
          <div className={`w-full max-w-sm rounded-3xl p-8 flex flex-col gap-5 shadow-2xl transition-all border ${metallicBorder} ${bgPanel}`}>
            <div className={`w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center text-2xl border border-red-500/20 shadow-inner`}>🚪</div>
            <div>
              <h3 className="text-xl font-bold mb-1 tracking-tight">Confirm Logout</h3>
              <p className={`text-xs leading-relaxed ${textSecondary}`}>Are you sure you want to log out of your CodeToAnim session?</p>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setShowLogoutConfirm(false)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${metallicBorder} ${hoverBg}`}>Cancel</button>
              <button onClick={confirmLogout} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all">Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}