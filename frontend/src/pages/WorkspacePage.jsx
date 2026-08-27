import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import LoginModal from '../components/LoginModal';
import LandingNav from '../components/LandingNav';

import Editor from '../components/Editor';
import Visualizer from '../components/Visualizer';

import { ALGORITHMS_DATABASE } from '../data/algorithmsData';
import { Helmet } from 'react-helmet-async'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://code-to-anim-backend.vercel.app";
const MAX_CODE_LENGTH = 20000;
const MAX_SAVE_TITLE_LENGTH = 120;
const TRACE_TIMEOUT_MS = 10000;

export default function WorkspacePage({ isEmbedded = false, themeColors = null, theme = null }) {
  const location = useLocation();
  const navigate = useNavigate(); 
  
  const [searchParams] = useSearchParams();
  const algoQueryId = searchParams.get('algo');

  const { user, openAuthModal } = useAuth(); 
  const { currentTheme } = useTheme();
  
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
    const normalizedTitle = saveFileName.trim().slice(0, MAX_SAVE_TITLE_LENGTH);
    if (!normalizedTitle || !user?.id || code.length > MAX_CODE_LENGTH) return;
    
    setIsLoading(true);
    setShowSaveModal(false);
    try {
      const { error } = await supabase.rpc('save_user_code', {
        p_user_id: user.id,
        p_title: normalizedTitle,
        p_code: code
      });
      if (error) throw error;
      
      setSavedToast(normalizedTitle);
      setTimeout(() => setSavedToast(null), 4000); 
    } catch (error) {
      setErrorMessage("Failed to save code: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

// ... (inside WorkspacePage.jsx)

  const handleExecuteTrace = async () => {
    if (code.length > MAX_CODE_LENGTH) {
      setErrorMessage(`Code is too large. Please keep it under ${MAX_CODE_LENGTH.toLocaleString()} characters.`);
      return;
    }

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

      // UPDATED: 3 execution limit message for guests
      if (execData.count >= 3) {
        return openAuthModal('3 execution limit is over. Sign up to execute more!');
      }
      
      execData.count += 1;
      execData.date = today;
      localStorage.setItem('guest_exec_data', JSON.stringify(execData));
    } 
    else {
      try {
        const { data: canExecute, error } = await supabase.rpc('can_user_execute', { p_user_id: user.id });
        if (error) throw error;
        if (!canExecute) {
          // UPDATED: 10 execution limit message for logged-in users
          setLimitMessage("Your 10 execution limit is reached. Come back tomorrow!");
          setShowLimitModal(true);
          return; 
        }
      } catch (err) {
        console.error("Error checking premium status or daily limit:", err);
      }
    }

// ... (rest of the function remains the same)

    setIsLoading(true);
    setIsPlaying(false);
    setErrorMessage(null);
    const executableCode = code.replace(/if\s+__name__\s*==\s*['"]__main__['"]\s*:/g, "if True: # forced main "); 
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TRACE_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}/api/trace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: executableCode }),
        signal: controller.signal,
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
      setErrorMessage(err.name === 'AbortError'
        ? 'Execution timed out. Please try a smaller or simpler program.'
        : 'Could not connect to backend server');
    } finally {
      clearTimeout(timeoutId);
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
  
  const t = (embeddedDark, embeddedLight, directClass) => {
    if (!isEmbedded) return directClass;
    return isDark ? embeddedDark : embeddedLight;
  };

  const bgMain = !isEmbedded ? 'bg-(--canvas)' : (themeColors ? themeColors.bg : activeStyle.bgMain);
  const bgNav = !isEmbedded ? 'bg-(--canvas-paper)' : (themeColors ? themeColors.panel : activeStyle.bgNav);
  const bgPanel = !isEmbedded ? 'bg-(--canvas-paper)' : (themeColors ? themeColors.panel : activeStyle.bgPanel);
  const textPrimary = !isEmbedded ? 'text-(--ink)' : (themeColors ? themeColors.text : activeStyle.textPrimary);
  const textSecondary = !isEmbedded ? 'text-(--ink-secondary)' : activeStyle.textSecondary;
  const cleanBorder = !isEmbedded ? 'border border-(--ink-line)' : (themeColors ? `border ${themeColors.border}` : `border ${activeStyle.metallicBorder}`);
  const actionBtnClass = !isEmbedded ? 'bg-(--cobalt) hover:bg-(--cobalt-dark) text-white shadow-sm' : activeStyle.actionBtnClass;
  const accentTextClass = !isEmbedded ? 'text-(--cobalt)' : activeStyle.accentTextClass;
  const accentBorderHover = !isEmbedded ? 'hover:border-(--cobalt)' : activeStyle.accentBorderHover;

  return (
    <>
      <Helmet>
        <title>{algoMetadata.algorithmTitle} | CodeToAnim Visualization</title>
        <meta name="description" content={algoMetadata.description} />
      </Helmet>

      {!isEmbedded && (
        <style>{`
          :root {
            --canvas: #F5F0E6;
            --canvas-paper: #FCFAF5;
            --canvas-tint: #EFE8DA;
            --canvas-dark: #ECE4D4;
            --ink: #191816;
            --ink-secondary: #4A463F;
            --ink-muted: #7A7468;
            --ink-line: #D9D2C3;
            --ink-line-strong: #191816;
            --cobalt: #2457C5;
            --cobalt-dark: #1A3F91;
            --cobalt-tint: #EBF1FD;
            --teal: #16756F;
            --teal-tint: #E8F4F3;
            --vermilion: #D94F3D;
            --vermilion-tint: #FCEFEA;
            --yellow: #F2C14E;
            --yellow-tint: #FEF9EB;
          }
        `}</style>
      )}

      <style>{`
        @media (max-width: 768px) {
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

      <div className={`${isEmbedded ? 'h-full w-full' : 'h-screen w-full'} flex flex-col font-sans overflow-hidden ${bgMain} ${textPrimary}`}>
        <LoginModal />

        {!isEmbedded && <LandingNav />}

        {savedToast && (
          <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 bg-(--teal) text-white px-5 py-3 rounded-2xl shadow-xl animate-[bounce_0.5s_ease-in-out]">
            <span className="text-xl">✅</span>
            <div>
              <h4 className="font-bold text-sm">Algorithm Saved!</h4>
              <p className="text-xs text-white/80">"{savedToast}" successfully stored to profile.</p>
            </div>
          </div>
        )}

        {showSaveModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-sm rounded-3xl p-8 flex flex-col gap-4 shadow-2xl transition-all ${t('bg-[#131822] text-white border border-slate-800', 'bg-[#F5EBE1] text-[#3E2723] border border-[#D7CCC8]', 'bg-(--canvas-paper) text-(--ink) border border-(--ink-line)')}`}>
              <div>
                <h3 className="text-xl font-bold mb-1">Save Algorithm</h3>
                <p className={`text-xs ${textSecondary}`}>Give your custom script a memorable name to easily find it in your profile library.</p>
              </div>
              <input 
                type="text" 
                value={saveFileName}
                onChange={(e) => setSaveFileName(e.target.value)}
                maxLength={MAX_SAVE_TITLE_LENGTH}
                placeholder="e.g. Optimized Bubble Sort"
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${t('bg-[#0A0D14] border border-slate-800 focus:border-indigo-500 text-white', 'bg-white/50 border border-[#D7CCC8] focus:border-[#8C5A48] text-[#3E2723]', 'bg-(--canvas-tint) border border-(--ink-line) focus:border-(--cobalt) text-(--ink)')}`}
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setShowSaveModal(false)} 
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${t('hover:bg-slate-800 text-slate-300', 'hover:bg-black/5 text-[#765A51]', 'hover:bg-(--canvas-tint) text-(--ink-secondary)')}`}
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
            <div className={`relative w-full max-w-md rounded-3xl p-8 flex flex-col items-center text-center transform transition-all ${cleanBorder} ${t('bg-[#131822] text-white', 'bg-[#F5EBE1] text-[#3E2723] shadow-xl', 'bg-(--canvas-paper) text-(--ink) shadow-xl')}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner ${t('bg-purple-500/10 text-purple-600 border border-purple-500/30', 'bg-[#8C5A48]/10 border border-[#8C5A48]/30', 'bg-(--vermilion-tint) text-(--vermilion) border border-(--vermilion)/30')}`}>
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

        <div className="flex-1 flex flex-col overflow-hidden">
          
          <header className={`h-14 ${cleanBorder} border-x-0 border-t-0 ${bgNav} flex items-center justify-between px-6 z-10 ws-mobile-header`}>
            <div className="flex items-center gap-3">
              {isEmbedded && (
                <div className="flex items-center gap-2">
                  <img src="/favicon.svg" alt="Logo" className="w-5 h-5 object-contain" />
                  <span className={`font-extrabold text-sm tracking-tight ${accentTextClass}`}>CodeToAnim <span className={`text-[17px] font-mono ${!isEmbedded ? 'text-(--ink-muted)' : 'text-slate-500'}`}>Workspace</span></span>
                </div>
              )}

              <div className={`flex items-center gap-2 ${cleanBorder} rounded-lg px-3 py-1 text-xs font-semibold ${t('bg-slate-900/60 text-slate-100', 'bg-black/5 text-[#3E2723]', 'bg-(--canvas-tint) text-(--ink)')}`}>
                <span>{algoMetadata.algorithmTitle}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${t('bg-purple-950 text-purple-300 border border-purple-800/60', 'bg-[#8C5A48]/10 text-[#8C5A48] border border-[#8C5A48]/30', 'bg-(--cobalt-tint) text-(--cobalt) border border-(--cobalt)/30')}`}>
                  {algoMetadata.strategy || 'Lesson'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 header-actions">
              <div className={`hidden md:flex items-center p-1 rounded-lg ${cleanBorder} ${t('bg-slate-900/60', 'bg-black/5', 'bg-(--canvas-tint)')}`}>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${isEditorOpen ? t('bg-slate-700 text-white shadow-sm', 'bg-white text-slate-900 shadow-sm border border-[#D7CCC8]', 'bg-(--canvas-paper) text-(--ink) shadow-sm border border-(--ink-line)') : `text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ${!isEmbedded && 'text-(--ink-muted) hover:text-(--ink)'}`}`}
                  title="Show Code & Visualizer"
                >
                  Split
                </button>
                <button
                  onClick={() => {
                    setIsEditorOpen(false);
                    setIsDescriptionOpen(false);
                  }}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${!isEditorOpen ? t('bg-indigo-600 text-white shadow-sm', 'bg-[#8C5A48] text-white shadow-sm', 'bg-(--cobalt) text-white shadow-sm') : `text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ${!isEmbedded && 'text-(--ink-muted) hover:text-(--ink)'}`}`}
                  title="Maximize Visualizer Space"
                >
                  Visualize Only
                </button>
              </div>

              {algoMetadata.type !== 'sandbox' && (
                 <button 
                  onClick={handleResetSandbox} 
                  className={`px-3 py-1.5 ${cleanBorder} rounded-lg text-xs font-semibold transition-colors ${t('bg-slate-900/60 hover:border-amber-500 hover:text-amber-500', 'bg-black/5 hover:border-amber-500 hover:text-amber-500', 'bg-(--canvas) hover:bg-(--canvas-tint) text-(--ink)')}`}
                  title="Clear workspace and return to Sandbox"
                >
                  🔄 Reset Sandbox
                </button>
              )}

              {incomingLessonUrl ? (
                <Link to={incomingLessonUrl} className={`px-3 py-1.5 ${cleanBorder} rounded-lg text-xs font-semibold transition-colors ${accentBorderHover} ${accentTextClass} ${t('bg-slate-900/60', 'bg-black/5', 'bg-(--canvas) hover:bg-(--canvas-tint)')}`}>
                  ← Back to Lesson
                </Link>
              ) : null}

              {user ? (
                <>
                  {algoMetadata.id && (
                    <button 
                      onClick={handleMarkComplete} 
                      disabled={isCompleting || isCompleted}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${cleanBorder} ${
                        isCompleted 
                          ? t('bg-emerald-950/50 text-emerald-400 border-emerald-600/60', 'bg-emerald-50 text-emerald-700 border-emerald-300', 'bg-(--teal-tint) text-(--teal) border-(--teal)/30')
                          : `hover:border-emerald-500 hover:text-emerald-500 ${t('bg-slate-900/60', 'bg-black/5', 'bg-(--canvas) hover:bg-(--canvas-tint)')}`
                      }`}
                    >
                      {isCompleting ? '⏳ Saving...' : isCompleted ? '✅ Completed' : '🏆 Mark Complete'}
                    </button>
                  )}
                  
                  <button onClick={handleSaveCodeClick} className={`px-3 py-1.5 ${cleanBorder} rounded-lg text-xs font-semibold hover:border-blue-600 transition-colors ${t('bg-slate-900/60', 'bg-black/5', 'bg-(--canvas) hover:bg-(--canvas-tint) text-(--ink)')}`}>
                    💾 Save Code
                  </button>
                </>
              ) : null}
              
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
             
             <button 
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className={`absolute top-4 right-2.5 z-20 w-7 h-7 rounded-full ${cleanBorder} ${bgNav} flex items-center justify-center ${accentTextClass} transition-all duration-500 ease-in-out hidden md:flex shadow-md ${t('hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:border-purple-500', 'hover:shadow-md hover:border-[#8C5A48]', 'hover:shadow-md hover:border-(--cobalt) hover:bg-(--canvas-tint)')} ${isDescriptionOpen ? 'scale-100 hover:scale-110' : 'scale-90 hover:scale-110 rotate-180'}`}
              title={isDescriptionOpen ? "Collapse Description" : "Expand Description"}
             >
              <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>

              <div className={`flex flex-col items-center gap-6 mt-14 cursor-pointer closed-desc-inner transition-all duration-500 ${isDescriptionOpen ? 'opacity-0 absolute pointer-events-none translate-y-8' : 'opacity-100 translate-y-0 delay-200'}`} onClick={() => setIsDescriptionOpen(true)}>
                <span className={`text-[10px] font-bold uppercase font-mono tracking-widest ${textSecondary} [writing-mode:vertical-lr] rotate-180 closed-text group-hover:${accentTextClass} transition-colors duration-300`}>
                  DESCRIPTION
                </span>
              </div>
              
              <div className={`space-y-5 overflow-y-auto pr-2 w-full transition-all duration-500 ${!isDescriptionOpen ? 'opacity-0 absolute pointer-events-none -translate-x-8' : 'opacity-100 translate-x-0 delay-150'}`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>CURRENT ALGORITHM</span>
                  <h2 className="text-lg font-bold mt-1 tracking-tight">{algoMetadata.algorithmTitle}</h2>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold border shadow-sm ${t('bg-purple-950 text-purple-300 border-purple-800/60', 'bg-[#8C5A48]/10 text-[#8C5A48] border-[#8C5A48]/30', 'bg-(--cobalt-tint) text-(--cobalt) border-(--cobalt)/30')}`}>
                    {algoMetadata.strategy || 'Standard'}
                  </span>
                  <p className={`text-xs ${textSecondary} mt-3 leading-relaxed`}>
                    {algoMetadata.description}
                  </p>
                </div>

                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>LANGUAGE</span>
                  <div className={`mt-1 ${cleanBorder} rounded-lg p-2 text-xs font-medium flex items-center gap-2 ${t('bg-slate-900/50', 'bg-black/5', 'bg-(--canvas-tint)')}`}>
                    <span>🐍</span> {algoMetadata.language || 'Python 3'}
                  </div>
                </div>

                {algoMetadata.exampleInput && (
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE INPUT</span>
                    <pre className={`mt-1 p-2 rounded-lg ${cleanBorder} font-mono text-xs ${t('bg-slate-950 text-slate-300', 'bg-white/50 text-[#3E2723]', 'bg-(--canvas) text-(--ink-secondary)')}`}>{algoMetadata.exampleInput}</pre>
                  </div>
                )}

                {algoMetadata.exampleOutput && (
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE OUTPUT</span>
                    <pre className={`mt-1 p-2 rounded-lg ${cleanBorder} font-mono text-xs ${t('bg-slate-950 text-slate-300', 'bg-white/50 text-[#3E2723]', 'bg-(--canvas) text-(--ink-secondary)')}`}>{algoMetadata.exampleOutput}</pre>
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
                  <span className={`${!isEmbedded ? 'text-(--teal)' : 'text-emerald-500'} font-semibold truncate`}>
                    {consoleOutput.trim() ? consoleOutput : '> Stream empty...'}
                  </span>
                </div>

                <div className={`flex items-center gap-2 p-1.5 rounded-2xl ${cleanBorder} ${t('bg-slate-950/80 shadow-inner', 'bg-black/5 shadow-sm', 'bg-(--canvas-tint) shadow-inner')}`}>
                  <button 
                    onClick={handleFirstStep} 
                    disabled={steps.length === 0 || currentStepIndex === 0} 
                    className={`p-2 rounded-xl ${textSecondary} hover:${textPrimary} ${t('hover:bg-white dark:hover:bg-slate-800/60', 'hover:bg-white', 'hover:bg-(--canvas) hover:shadow-sm')} disabled:opacity-30 transition-all border-transparent`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                  </button>
                  <button 
                    onClick={handlePrevStep} 
                    disabled={steps.length === 0 || currentStepIndex === 0} 
                    className={`p-2 rounded-xl ${textSecondary} hover:${textPrimary} ${t('hover:bg-white dark:hover:bg-slate-800/60', 'hover:bg-white', 'hover:bg-(--canvas) hover:shadow-sm')} disabled:opacity-30 transition-all border-transparent`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
                  </button>
                  <button 
                    onClick={handleTogglePlay} 
                    disabled={steps.length === 0} 
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all ${
                      isPlaying 
                        ? t('bg-amber-600 hover:bg-amber-500', 'bg-amber-700 hover:bg-amber-600', 'bg-(--vermilion) hover:bg-(--vermilion)/90 shadow-md')
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
                    className={`p-2 rounded-xl ${textSecondary} hover:${textPrimary} ${t('hover:bg-white dark:hover:bg-slate-800/60', 'hover:bg-white', 'hover:bg-(--canvas) hover:shadow-sm')} disabled:opacity-30 transition-all border-transparent`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
                  </button>
                  <button 
                    onClick={handleLastStep} 
                    disabled={steps.length === 0 || currentStepIndex === steps.length - 1} 
                    className={`p-2 rounded-xl ${textSecondary} hover:${textPrimary} ${t('hover:bg-white dark:hover:bg-slate-800/60', 'hover:bg-white', 'hover:bg-(--canvas) hover:shadow-sm')} disabled:opacity-30 transition-all border-transparent`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                  </button>
                </div>

                <div className={`font-mono text-xs ${textSecondary} flex items-center gap-3`}>
                  <div className={`w-32 h-1.5 rounded-full overflow-hidden ${cleanBorder} ${t('bg-slate-900', 'bg-black/10', 'bg-(--ink-line)')}`}>
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${t('bg-gradient-to-r from-purple-600 to-indigo-600', 'bg-[#8C5A48]', 'bg-(--cobalt)')}`}
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