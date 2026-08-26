import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import LoginModal from '../components/LoginModal';

import Editor from '../components/Editor';
import Visualizer from '../components/Visualizer';

import { ALGORITHMS_DATABASE } from '../data/algorithmsData';
import { Helmet } from 'react-helmet-async'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://code-to-anim-backend.vercel.app";

export default function WorkspacePage({ isEmbedded = false, themeColors = null, theme = null }) {
  const location = useLocation();
  const navigate = useNavigate(); 
  
  const [searchParams] = useSearchParams();
  const algoQueryId = searchParams.get('algo');

  const { user, openAuthModal } = useAuth(); 
  const { currentTheme, changeTheme } = useTheme();
  
  // Keep isDark for backwards compatibility with children components if needed
  const isDark = currentTheme === 'dark';

  const DEFAULT_CODE = `# Welcome to the CodeToAnim Workspace.
# Use this sandbox to write, execute, and trace your Python algorithms.

arr = [64, 34, 25, 12, 22, 11, 90]
n = len(arr)

for i in range(n):
    for j in range(0, n - i - 1):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]

print("Final Sorted Array:", arr)`;

  const DEFAULT_METADATA = {
    id: null,
    type: 'sandbox', 
    algorithmTitle: 'Sandbox Workspace',
    strategy: 'Custom Development',
    description: 'Welcome to your personal algorithmic sandbox. This environment allows you to write custom scripts, test data structures, and visualize complex logic step-by-step.',
    language: 'Python 3',
    exampleInput: null, 
    exampleOutput: null 
  };

  const incomingLessonUrl = location.state?.lessonUrl || null;

  const [code, setCode] = useState(DEFAULT_CODE);
  const [algoMetadata, setAlgoMetadata] = useState(DEFAULT_METADATA);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(window.innerWidth > 768);
  const [isEditorOpen, setIsEditorOpen] = useState(true);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  
  // --- Save Modal & Acknowledgement Card State ---
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFileName, setSaveFileName] = useState("");
  const [savedToast, setSavedToast] = useState(null); 

  const autoPlayRef = useRef(null);
  const completionCheckRef = useRef(null);

  useEffect(() => {
    if (algoQueryId) {
      const targetAlgo = ALGORITHMS_DATABASE.find(a => String(a.id) === String(algoQueryId));
      if (targetAlgo) {
        setCode(targetAlgo.code);
        setAlgoMetadata({
          id: targetAlgo.id,
          type: 'algorithm',
          algorithmTitle: targetAlgo.title,
          strategy: targetAlgo.category,
          category: targetAlgo.category,
          difficulty: targetAlgo.difficulty,
          description: targetAlgo.description,
          language: 'Python 3',
          exampleInput: null,
          exampleOutput: null
        });
        return; 
      }
    }

    if (location.state?.presetCode) {
      setCode(location.state.presetCode);
      if (location.state?.metadata) setAlgoMetadata(location.state.metadata);
      return; 
    }

    setCode(DEFAULT_CODE);
    setAlgoMetadata(DEFAULT_METADATA);
  }, [algoQueryId, location.state]);

  useEffect(() => {
    const checkCompletion = async () => {
      if (!user || !algoMetadata.id) return;
      
      if (completionCheckRef.current === algoMetadata.id) return;
      completionCheckRef.current = algoMetadata.id;

      const { data } = await supabase
        .from('user_progress')
        .select('progress_percent')
        .eq('user_id', user.id)
        .eq('algorithm_id', String(algoMetadata.id))
        .maybeSingle();
        
      if (data && data.progress_percent === 100) {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }
    };
    checkCompletion();
  }, [user, algoMetadata.id]);

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(autoPlayRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isPlaying, steps, playbackSpeed]);

  const logCodeExecution = async (algorithmTitle = 'Custom Algorithm') => {
    if (!user) return; 
    try {
      await supabase.rpc('log_user_execution', {
        p_user_id: user.id,
        p_algo_title: algorithmTitle,
        p_algo_id: algoMetadata.id ? String(algoMetadata.id) : null,
        p_category: algoMetadata.category || 'General',
        p_difficulty: algoMetadata.difficulty || 'Medium'
      });
    } catch (error) {
      console.error("Error logging execution:", error);
    }
  };

  const handleMarkComplete = async () => {
    if (!user) return openAuthModal('Create a free account to track your algorithm progress!');
    if (!algoMetadata.id) return alert("This algorithm/lesson doesn't have a tracking ID assigned.");

    setIsCompleting(true);
    try {
      await supabase.rpc('mark_algorithm_complete', {
        p_user_id: user.id,
        p_algo_id: String(algoMetadata.id),
        p_title: algoMetadata.algorithmTitle,
        p_category: algoMetadata.category || 'General',
        p_difficulty: algoMetadata.difficulty || 'Medium',
        p_type: algoMetadata.type || 'algorithm'
      });
      setIsCompleted(true);
    } catch (error) {
      setErrorMessage("Failed to mark complete: " + error.message);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSaveCodeClick = () => {
    if (!user) return openAuthModal('Create a free account to save your custom algorithms!');
    setSaveFileName(algoMetadata.algorithmTitle || "My Custom Algorithm");
    setShowSaveModal(true);
  };

  const confirmSaveCode = async () => {
    if (!saveFileName.trim()) return; 
    
    setIsLoading(true);
    setShowSaveModal(false);
    try {
      const { error } = await supabase.rpc('save_user_code', {
        p_user_id: user.id,
        p_title: saveFileName,
        p_code: code
      });
      if (error) throw error;
      
      setSavedToast(saveFileName);
      setTimeout(() => setSavedToast(null), 4000); 
    } catch (error) {
      setErrorMessage("Failed to save code: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteTrace = async () => {
    if (!user) {
      const today = new Date().toDateString(); 
      let execData = { count: 0, date: today };
      try {
        const raw = localStorage.getItem('guest_exec_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.date === today) execData.count = typeof parsed.count === 'number' ? parsed.count : 0;
        }
      } catch (err) {}

      if (execData.count >= 3) return openAuthModal('Daily execution limit reached (3/3 runs used). Sign up for more executions!');
      execData.count += 1;
      execData.date = today;
      localStorage.setItem('guest_exec_data', JSON.stringify(execData));
    } 
    else {
      try {
        const { data: canExecute, error } = await supabase.rpc('can_user_execute', { p_user_id: user.id });
        if (error) throw error;
        if (!canExecute) {
          setLimitMessage("You've hit your limit of 10 executions for today! You're making great progress. Come back tomorrow or upgrade to premium for unlimited runs.");
          setShowLimitModal(true);
          return; 
        }
      } catch (err) {
        console.error("Error checking premium status or daily limit:", err);
      }
    }

    setIsLoading(true);
    setIsPlaying(false);
    setErrorMessage(null);
    const executableCode = code.replace(/if\s+__name__\s*==\s*['"]__main__['"]\s*:/g, "if True: # forced main "); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/trace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: executableCode }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSteps(data.steps || []);
        setCurrentStepIndex(0);
        setIsEditing(false); 
        logCodeExecution(algoMetadata.algorithmTitle);
      } else {
        setErrorMessage(data.detail || data.error || "Execution trace failed.");
      }
    } catch (err) {
      setErrorMessage(`Could not connect to backend server`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSandbox = () => {
    setCode(DEFAULT_CODE);
    setAlgoMetadata(DEFAULT_METADATA);
    setSteps([]);
    setCurrentStepIndex(0);
    setErrorMessage(null);
    setIsCompleted(false);
    setIsPlaying(false);
    navigate('/workspace', { replace: true, state: {} });
  };

  const toggleTheme = () => changeTheme(isDark ? 'light' : 'dark');

  const handleFirstStep = () => { setIsPlaying(false); setCurrentStepIndex(0); };
  const handlePrevStep = () => { setIsPlaying(false); setCurrentStepIndex((prev) => Math.max(0, prev - 1)); };
  const handleTogglePlay = () => { if (steps.length > 0) setIsPlaying(!isPlaying); };
  const handleNextStep = () => { setIsPlaying(false); setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1)); };
  const handleLastStep = () => { setIsPlaying(false); setCurrentStepIndex(Math.max(0, steps.length - 1)); };

  const currentStep = steps[currentStepIndex];
  const activeLineNumber = currentStep?.line ?? null;
  const consoleOutput = currentStep?.output ?? "";

  // ==========================================
  // --- EXACT 3-THEME COLOR MAPPINGS ---
  // ==========================================
  const THEME_OPTIONS = ['light', 'dark', 'coffee'];
  const activeThemeName = THEME_OPTIONS.includes(theme || currentTheme) ? (theme || currentTheme) : 'dark';

  const themeStyles = {
    dark: {
      bgMain: 'bg-[#0A1118]', bgNav: 'bg-[#111A22]', bgPanel: 'bg-[#111A22]', 
      textPrimary: 'text-[#E2E8F0]', textSecondary: 'text-[#94A3B8]', metallicBorder: 'border-[#1E293B]',
      actionBtnClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30',
      accentTextClass: 'text-[#38B2AC]', accentBorderHover: 'hover:border-[#38B2AC]'
    },
    coffee: {
      bgMain: 'bg-[#F5EBE1]', bgNav: 'bg-[#EFE8DE]', bgPanel: 'bg-[#EFE8DE]', 
      textPrimary: 'text-[#3E2723]', textSecondary: 'text-[#765A51]', metallicBorder: 'border-[#D7CCC8]',
      actionBtnClass: 'bg-[#8C5A48] hover:opacity-80 text-white shadow-md',
      accentTextClass: 'text-[#8C5A48]', accentBorderHover: 'hover:border-[#8C5A48]'
    },
    light: {
      bgMain: 'bg-[#FFFFFF]', bgNav: 'bg-[#D2F4F8]', bgPanel: 'bg-[#D2F4F8]', 
      textPrimary: 'text-[#0F172A]', textSecondary: 'text-[#475569]', metallicBorder: 'border-[#BBE8ED]',
      actionBtnClass: 'bg-[#00CED1] hover:opacity-80 text-white shadow-md',
      accentTextClass: 'text-[#00CED1]', accentBorderHover: 'hover:border-[#00CED1]'
    }
  };

  const activeStyle = themeStyles[activeThemeName];
  const bgMain = isEmbedded && themeColors ? themeColors.bg : activeStyle.bgMain;
  const bgNav = isEmbedded && themeColors ? themeColors.panel : activeStyle.bgNav;
  const bgPanel = isEmbedded && themeColors ? themeColors.panel : activeStyle.bgPanel;
  const textPrimary = isEmbedded && themeColors ? themeColors.text : activeStyle.textPrimary;
  const textSecondary = activeStyle.textSecondary;
  const cleanBorder = isEmbedded && themeColors ? `border ${themeColors.border}` : `border ${activeStyle.metallicBorder}`;
  const actionBtnClass = activeStyle.actionBtnClass;
  const accentTextClass = activeStyle.accentTextClass;
  const accentBorderHover = activeStyle.accentBorderHover;
  const logoBg = activeThemeName === 'dark' ? 'bg-gradient-to-br from-purple-600/20 to-indigo-600/20' : activeThemeName === 'light' ? 'bg-[#00CED1]/10' : 'bg-[#8C5A48]/10';

  return (
    <>
      <Helmet>
        <title>{algoMetadata.algorithmTitle} | CodeToAnim Visualization</title>
        <meta name="description" content={algoMetadata.description} />
      </Helmet>

      <style>{`
        @media (max-width: 768px) {
          .ws-mobile-hide { display: none !important; }
          .ws-mobile-header { height: auto !important; flex-direction: column !important; padding: 8px 12px !important; gap: 8px !important; }
          .ws-mobile-header > div { width: 100% !important; justify-content: space-between !important; }
          .ws-mobile-header .header-actions { justify-content: center !important; flex-wrap: wrap !important; gap: 6px !important; }
          .ws-mobile-header button, .ws-mobile-header a { padding-top: 4px !important; padding-bottom: 4px !important; font-size: 11px !important; }
          .ws-mobile-main-row { flex-direction: column !important; overflow-y: auto !important; overflow-x: hidden !important; }
          .ws-mobile-desc-panel { width: 100% !important; height: auto !important; min-height: 32px !important; border-right: none !important; border-bottom: 1px solid rgba(100,100,100,0.3) !important; flex: none !important; z-index: 20 !important; }
          .ws-mobile-closed { height: 36px !important; padding: 0 12px !important; flex-direction: row !important; align-items: center !important; }
          .ws-mobile-closed .closed-desc-inner { flex-direction: row !important; margin-top: 0 !important; height: 100% !important; width: 100% !important; justify-content: flex-start !important; align-items: center !important; }
          .ws-mobile-closed .closed-text { writing-mode: horizontal-tb !important; transform: none !important; margin-top: 0 !important; margin-left: 10px !important; }
          .ws-mobile-workspace-col { overflow: visible !important; flex: none !important; }
          .ws-mobile-editor-row { flex-direction: column !important; overflow: visible !important; flex: none !important; }
          .ws-mobile-editor-row > * { width: 100% !important; height: 60vh !important; min-height: 450px !important; flex: none !important; border-right: none !important; border-bottom: 1px solid rgba(100,100,100,0.3) !important; }
          .ws-mobile-footer { position: sticky !important; bottom: 0 !important; height: auto !important; flex-direction: column !important; gap: 6px !important; padding: 8px 12px !important; z-index: 50 !important; box-shadow: 0 -10px 20px rgba(0,0,0,0.5) !important; }
          .ws-mobile-footer > div { width: 100% !important; justify-content: center !important; }
          .ws-mobile-footer .gap-2 { gap: 4px !important; }
          .ws-mobile-footer button { padding: 4px !important; }
          .ws-mobile-footer button.w-11 { width: 32px !important; height: 30px !important; min-height: 32px !important; }
          .ws-mobile-footer button.w-11 svg { width: 16px !important; height: 16px !important; }
          .ws-mobile-footer > div:last-child { margin-top: 2px !important; }
        }
      `}</style>

      {/* Changed w-screen to w-full to avoid scrollbar layout shift bugs */}
      <div className={`${isEmbedded ? 'h-full w-full' : 'h-screen w-full'} flex font-sans overflow-hidden ${bgMain} ${textPrimary}`}>
        <LoginModal />

        {/* --- SUCCESS ACKNOWLEDGEMENT TOAST CARD --- */}
        {savedToast && (
          <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl animate-[bounce_0.5s_ease-in-out]">
            <span className="text-xl">✅</span>
            <div>
              <h4 className="font-bold text-sm">Algorithm Saved!</h4>
              <p className="text-xs text-emerald-100">"{savedToast}" successfully stored to profile.</p>
            </div>
          </div>
        )}

        {/* --- SAVE MODAL --- */}
        {showSaveModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-sm rounded-3xl p-8 flex flex-col gap-4 shadow-2xl transition-all ${isDark ? 'bg-[#131822] text-white border border-slate-800' : 'bg-[#F5EBE1] text-[#3E2723] border border-[#D7CCC8]'}`}>
              <div>
                <h3 className="text-xl font-bold mb-1">Save Algorithm</h3>
                <p className={`text-xs ${textSecondary}`}>Give your custom script a memorable name to easily find it in your profile library.</p>
              </div>
              <input 
                type="text" 
                value={saveFileName}
                onChange={(e) => setSaveFileName(e.target.value)}
                placeholder="e.g. Optimized Bubble Sort"
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${isDark ? 'bg-[#0A0D14] border border-slate-800 focus:border-indigo-500 text-white' : 'bg-white/50 border border-[#D7CCC8] focus:border-[#8C5A48] text-[#3E2723]'}`}
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setShowSaveModal(false)} 
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-black/5 text-[#765A51]'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmSaveCode} 
                  disabled={!saveFileName.trim()}
                  className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${actionBtnClass}`}
                >
                  Save to Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {showLimitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className={`relative w-full max-w-md rounded-3xl p-8 flex flex-col items-center text-center transform transition-all ${cleanBorder} ${isDark ? 'bg-[#131822] text-white' : 'bg-[#F5EBE1] text-[#3E2723] shadow-xl'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner ${isDark ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30' : 'bg-[#8C5A48]/10 border border-[#8C5A48]/30'}`}>
                ⏳
              </div>
              <h2 className="text-2xl font-black mb-2 tracking-tight">Daily Limit Reached</h2>
              <p className={`text-sm mb-8 leading-relaxed ${textSecondary}`}>
                {limitMessage}
              </p>
              <button 
                onClick={() => setShowLimitModal(false)}
                className={`w-full py-3 text-white font-bold rounded-xl transition-all ${actionBtnClass}`}
              >
                Understood
              </button>
            </div>
          </div>
        )}

        {!isEmbedded && (
          <aside className={`hidden md:flex w-16 shrink-0 ${cleanBorder} border-y-0 border-l-0 ${bgNav} flex-col items-center justify-between py-4 z-20 ws-mobile-hide`}>
            <div className="flex flex-col items-center gap-6">
              <Link to="/" className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 hover:scale-105 transition-transform ${cleanBorder} ${logoBg}`}>
                <img src="/favicon.svg" alt="CodeAnim Logo" className="w-full h-full object-contain" />
              </Link>

              <nav className="flex flex-col gap-3">
                <Link to="/profile" className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${cleanBorder} ${actionBtnClass}`}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Link>
              </nav>
            </div>

            <button 
              onClick={toggleTheme} 
              className={`w-10 h-10 rounded-xl ${cleanBorder} flex items-center justify-center text-lg hover:bg-slate-800/10 transition-colors bg-black/5 dark:bg-white/5`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            >
              {isDark ? '🌙' : '☀️'}
            </button>
          </aside>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className={`h-14 ${cleanBorder} border-x-0 border-t-0 ${bgNav} flex items-center justify-between px-6 z-10 ws-mobile-header`}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src="/favicon.svg" alt="Logo" className="w-5 h-5 object-contain" />
                <span className={`font-extrabold text-sm tracking-tight ${accentTextClass}`}>CodeToAnim <span className="text-[17px] text-slate-500 font-mono">Workspace</span></span>
              </div>

              {/* Theme-Adaptive Header Badge */}
              <div className={`flex items-center gap-2 ${cleanBorder} rounded-lg px-3 py-1 text-xs font-semibold ${isDark ? 'bg-slate-900/60 text-slate-100' : 'bg-black/5 text-[#3E2723]'}`}>
                <span>{algoMetadata.algorithmTitle}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isDark ? 'bg-purple-950 text-purple-300 border border-purple-800/60' : 'bg-[#8C5A48]/10 text-[#8C5A48] border border-[#8C5A48]/30'}`}>
                  {algoMetadata.strategy || 'Lesson'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 header-actions">
              <div className={`hidden md:flex items-center p-1 rounded-lg ${cleanBorder} ${isDark ? 'bg-slate-900/60' : 'bg-black/5'}`}>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${isEditorOpen ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm border border-[#D7CCC8]') : `text-slate-500 hover:text-slate-700 dark:hover:text-slate-300`}`}
                  title="Show Code & Visualizer"
                >
                  Split
                </button>
                <button
                  onClick={() => {
                    setIsEditorOpen(false);
                    setIsDescriptionOpen(false);
                  }}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${!isEditorOpen ? (isDark ? 'bg-indigo-600 text-white shadow-sm' : 'bg-[#8C5A48] text-white shadow-sm') : `text-slate-500 hover:text-slate-700 dark:hover:text-slate-300`}`}
                  title="Maximize Visualizer Space"
                >
                  Visualize Only
                </button>
              </div>

              {algoMetadata.type !== 'sandbox' && (
                 <button 
                  onClick={handleResetSandbox} 
                  className={`px-3 py-1.5 ${cleanBorder} rounded-lg text-xs font-semibold hover:border-amber-500 hover:text-amber-500 transition-colors ${isDark ? 'bg-slate-900/60' : 'bg-black/5'}`}
                  title="Clear workspace and return to Sandbox"
                >
                  🔄 Reset Sandbox
                </button>
              )}

              {incomingLessonUrl ? (
                <Link to={incomingLessonUrl} className={`px-3 py-1.5 ${cleanBorder} rounded-lg text-xs font-semibold transition-colors ${accentBorderHover} ${accentTextClass} ${isDark ? 'bg-slate-900/60' : 'bg-black/5'}`}>
                  ← Back to Lesson
                </Link>
              ) : !isEmbedded ? (
                <Link 
                  to="/algorithms" 
                  className={`px-3 py-1.5 ${cleanBorder} rounded-lg text-xs font-semibold ${accentBorderHover} transition-colors ${isDark ? 'bg-slate-900/60' : 'bg-black/5'}`}
                >
                  📚 Algorithm Library
                </Link>
              ) : null}

              {!user ? (
                <>
                  <button 
                    onClick={() => openAuthModal('Log in to save your custom algorithms!')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-[#765A51] hover:text-[#3E2723]'}`}
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => openAuthModal('Sign up to track your progress and save code!')} 
                    className={`px-4 py-1.5 text-white text-xs font-bold rounded-lg transition-all ${actionBtnClass}`}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  {algoMetadata.id && (
                    <button 
                      onClick={handleMarkComplete} 
                      disabled={isCompleting || isCompleted}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${cleanBorder} ${
                        isCompleted 
                          ? (isDark ? 'bg-emerald-950/50 text-emerald-400 border-emerald-600/60' : 'bg-emerald-50 text-emerald-700 border-emerald-300')
                          : `hover:border-emerald-500 hover:text-emerald-500 ${isDark ? 'bg-slate-900/60' : 'bg-black/5'}`
                      }`}
                    >
                      {isCompleting ? '⏳ Saving...' : isCompleted ? '✅ Completed' : '🏆 Mark Complete'}
                    </button>
                  )}
                  
                  <button onClick={handleSaveCodeClick} className={`px-3 py-1.5 ${cleanBorder} rounded-lg text-xs font-semibold hover:border-blue-600 transition-colors ${isDark ? 'bg-slate-900/60' : 'bg-black/5'}`}>
                    💾 Save Code
                  </button>
                </>
              )}
              
              <button onClick={handleExecuteTrace} disabled={isLoading} className={`px-4 py-1.5 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${cleanBorder} ${actionBtnClass}`}>
                <span>▷</span>
                <span>{isLoading ? "Tracing..." : "Execute Trace"}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden relative ws-mobile-main-row">
            <aside className={`group relative shrink-0 ${cleanBorder} border-y-0 border-l-0 ${bgPanel} transition-[width,padding] duration-500 ease-in-out flex flex-col justify-between overflow-hidden ws-mobile-desc-panel ${
              isDescriptionOpen ? "w-64 p-5" : "w-12 p-2 items-center ws-mobile-closed"
            }`}>
             
             {/* THE COOL TOGGLE BUTTON */}
             <button 
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className={`absolute top-4 right-2.5 z-20 w-7 h-7 rounded-full ${cleanBorder} ${bgNav} flex items-center justify-center ${accentTextClass} transition-all duration-500 ease-in-out hidden md:flex shadow-md ${isDark ? 'hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:border-purple-500' : 'hover:shadow-md hover:border-[#8C5A48]'} ${isDescriptionOpen ? 'scale-100 hover:scale-110' : 'scale-90 hover:scale-110 rotate-180'}`}
              title={isDescriptionOpen ? "Collapse Description" : "Expand Description"}
             >
              <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>

              {/* CLOSED STATE: Animated Text */}
              <div className={`flex flex-col items-center gap-6 mt-14 cursor-pointer closed-desc-inner transition-all duration-500 ${isDescriptionOpen ? 'opacity-0 absolute pointer-events-none translate-y-8' : 'opacity-100 translate-y-0 delay-200'}`} onClick={() => setIsDescriptionOpen(true)}>
                <span className={`text-[10px] font-bold uppercase font-mono tracking-widest ${textSecondary} [writing-mode:vertical-lr] rotate-180 closed-text group-hover:${accentTextClass} transition-colors duration-300`}>
                  DESCRIPTION
                </span>
              </div>
              
              {/* OPEN STATE: Animated Content */}
              <div className={`space-y-5 overflow-y-auto pr-2 w-full transition-all duration-500 ${!isDescriptionOpen ? 'opacity-0 absolute pointer-events-none -translate-x-8' : 'opacity-100 translate-x-0 delay-150'}`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>CURRENT ALGORITHM</span>
                  <h2 className="text-lg font-bold mt-1 tracking-tight">{algoMetadata.algorithmTitle}</h2>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold border shadow-sm ${isDark ? 'bg-purple-950 text-purple-300 border-purple-800/60' : 'bg-[#8C5A48]/10 text-[#8C5A48] border-[#8C5A48]/30'}`}>
                    {algoMetadata.strategy || 'Standard'}
                  </span>
                  <p className={`text-xs ${textSecondary} mt-3 leading-relaxed`}>
                    {algoMetadata.description}
                  </p>
                </div>

                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>LANGUAGE</span>
                  <div className={`mt-1 ${cleanBorder} rounded-lg p-2 text-xs font-medium flex items-center gap-2 ${isDark ? 'bg-slate-900/50' : 'bg-black/5'}`}>
                    <span>🐍</span> {algoMetadata.language || 'Python 3'}
                  </div>
                </div>

                {algoMetadata.exampleInput && (
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE INPUT</span>
                    <pre className={`mt-1 p-2 rounded-lg ${cleanBorder} font-mono text-xs ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-white/50 text-[#3E2723]'}`}>{algoMetadata.exampleInput}</pre>
                  </div>
                )}

                {algoMetadata.exampleOutput && (
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE OUTPUT</span>
                    <pre className={`mt-1 p-2 rounded-lg ${cleanBorder} font-mono text-xs ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-white/50 text-[#3E2723]'}`}>{algoMetadata.exampleOutput}</pre>
                  </div>
                )}
              </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden ws-mobile-workspace-col">
              
              <div className={`flex-1 flex overflow-hidden relative ws-mobile-editor-row rounded-3xl m-4 ${cleanBorder} shadow-sm`}>
                
                <div className={`${isEditorOpen ? 'w-full md:w-1/2 lg:w-[45%] shrink-0' : 'hidden'} flex flex-col h-full overflow-hidden transition-all`}>
                  <Editor 
                    code={code} 
                    setCode={setCode} 
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    user={user} 
                    openAuthModal={openAuthModal}
                    activeLineNumber={activeLineNumber} 
                    handleSaveCode={handleSaveCodeClick} 
                    handleExecuteTrace={handleExecuteTrace} 
                    isLoading={isLoading} 
                    isDark={isDark}
                    activeThemeName={activeThemeName} 
                    isEditorOpen={isEditorOpen}
                    setIsEditorOpen={setIsEditorOpen}
                  />
                </div>

                <div className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden relative ${bgMain} shadow-inner`}>
                  <Visualizer 
                    steps={steps} 
                    currentStepIndex={currentStepIndex} 
                    errorMessage={errorMessage} 
                    isDark={isDark}
                    activeThemeName={activeThemeName} 
                  />
                </div>
                
              </div>

              <footer className={`h-16 ${cleanBorder} border-x-0 border-b-0 ${bgNav} flex items-center justify-between px-8 z-10 ws-mobile-footer`}>
                <div className={`font-mono text-xs ${textSecondary} flex items-center gap-2 flex-1 overflow-x-auto whitespace-nowrap`}>
                  <span className={`${accentTextClass} font-bold`}>OUTPUT:</span>
                  <span className="text-emerald-500 font-semibold truncate">
                    {consoleOutput.trim() ? consoleOutput : '> Stream empty...'}
                  </span>
                </div>

                <div className={`flex items-center gap-2 p-1.5 rounded-2xl ${cleanBorder} ${isDark ? 'bg-slate-950/80 shadow-inner' : 'bg-black/5 shadow-sm'}`}>
                  <button 
                    onClick={handleFirstStep} 
                    disabled={steps.length === 0 || currentStepIndex === 0} 
                    className={`p-2 rounded-xl ${textSecondary} hover:${textPrimary} hover:bg-white dark:hover:bg-slate-800/60 disabled:opacity-30 transition-all border-transparent`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                  </button>
                  <button 
                    onClick={handlePrevStep} 
                    disabled={steps.length === 0 || currentStepIndex === 0} 
                    className={`p-2 rounded-xl ${textSecondary} hover:${textPrimary} hover:bg-white dark:hover:bg-slate-800/60 disabled:opacity-30 transition-all border-transparent`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
                  </button>
                  <button 
                    onClick={handleTogglePlay} 
                    disabled={steps.length === 0} 
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all ${
                      isPlaying 
                        ? (isDark ? 'bg-amber-600 hover:bg-amber-500' : 'bg-amber-700 hover:bg-amber-600') 
                        : actionBtnClass
                    } disabled:opacity-40`}
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                  <button 
                    onClick={handleNextStep} 
                    disabled={steps.length === 0 || currentStepIndex === steps.length - 1} 
                    className={`p-2 rounded-xl ${textSecondary} hover:${textPrimary} hover:bg-white dark:hover:bg-slate-800/60 disabled:opacity-30 transition-all border-transparent`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
                  </button>
                  <button 
                    onClick={handleLastStep} 
                    disabled={steps.length === 0 || currentStepIndex === steps.length - 1} 
                    className={`p-2 rounded-xl ${textSecondary} hover:${textPrimary} hover:bg-white dark:hover:bg-slate-800/60 disabled:opacity-30 transition-all border-transparent`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                  </button>
                </div>

                <div className={`font-mono text-xs ${textSecondary} flex items-center gap-3`}>
                  <div className={`w-32 h-1.5 rounded-full overflow-hidden ${cleanBorder} ${isDark ? 'bg-slate-900' : 'bg-black/10'}`}>
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${isDark ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-[#8C5A48]'}`}
                      style={{ width: `${steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span>STEP <span className={textPrimary}>{steps.length > 0 ? currentStepIndex + 1 : 0}</span> / {steps.length}</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}