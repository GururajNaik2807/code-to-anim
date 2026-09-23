import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import LoginModal from '../components/LoginModal';
import LandingNav from '../components/LandingNav';

import Editor from '../components/Editor';
import Visualizer from '../components/Visualizer';

import { ALGORITHMS_DATABASE } from '../data/algorithmsData';
import { Helmet } from 'react-helmet-async'; 
import { trackEvent, trackPageView } from '../utils/analytics'; 

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
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
  
  const activeThemeName = isEmbedded 
    ? (theme || currentTheme || 'dark') 
    : 'coffee';

  const isDark = isEmbedded && activeThemeName === 'dark';

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
    description: '',
    insight: '',
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
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFileName, setSaveFileName] = useState("");
  const [savedToast, setSavedToast] = useState(null); 

  const autoPlayRef = useRef(null);
  const completionCheckRef = useRef(null);

  useEffect(() => {
    trackPageView(isEmbedded ? '/profile/workspace' : '/workspace', {
      view_mode: isEmbedded ? 'embedded' : 'standalone'
    });
  }, [isEmbedded]);

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
          insight: targetAlgo.insight || (targetAlgo.timeComplexity ? `Time Complexity: ${targetAlgo.timeComplexity} | Space Complexity: ${targetAlgo.spaceComplexity}` : ''),
          language: 'Python 3',
          exampleInput: targetAlgo.exampleInput || null,
          exampleOutput: targetAlgo.exampleOutput || null
        });
        return; 
      }
    }

    if (location.state?.presetCode) {
      setCode(location.state.presetCode);
      if (location.state?.metadata) setAlgoMetadata({ ...DEFAULT_METADATA, ...location.state.metadata });
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

      trackEvent('mark_algorithm_complete', {
        algorithm_id: String(algoMetadata.id),
        algorithm_title: algoMetadata.algorithmTitle,
        category: algoMetadata.category || 'General',
      });
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

      trackEvent('save_code', {
        title: normalizedTitle,
      });
    } catch (error) {
      setErrorMessage("Failed to save code: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          setLimitMessage("Your 10 execution limit is reached. Come back tomorrow!");
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
    setCurrentStepIndex(0);
    setSteps([]);
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
        setIsPlaying(true); 
        logCodeExecution(algoMetadata.algorithmTitle);

        trackEvent('execute_trace', {
          algorithm_title: algoMetadata.algorithmTitle || 'Custom Sandbox',
          lines_of_code: code.split('\n').length,
          is_preset: Boolean(algoMetadata.id),
          view_mode: isEmbedded ? 'embedded' : 'standalone' 
        });
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
    
    navigate(isEmbedded ? '/profile' : '/workspace', { replace: true, state: {} });
  };

  const handleFirstStep = () => { setIsPlaying(false); setCurrentStepIndex(0); };
  const handlePrevStep = () => { setIsPlaying(false); setCurrentStepIndex((prev) => Math.max(0, prev - 1)); };
  const handleTogglePlay = () => { 
    if (steps.length > 0) {
      if (currentStepIndex === steps.length - 1 && !isPlaying) return;
      setIsPlaying(!isPlaying); 
    }
  };
  const handleNextStep = () => { setIsPlaying(false); setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1)); };
  const handleLastStep = () => { setIsPlaying(false); setCurrentStepIndex(Math.max(0, steps.length - 1)); };

  const currentStep = steps[currentStepIndex];
  const activeLineNumber = currentStep?.line ?? null;
  const consoleOutput = currentStep?.output ?? "";

  const themeStyles = {
    dark: {
      bgMain: 'bg-[#0B1117]', bgNav: 'bg-[#101820]', bgPanel: 'bg-[#101820]', 
      textPrimary: 'text-[#E6EDF3]', textSecondary: 'text-[#8B9AA8]', metallicBorder: 'border-[#26323D]',
      actionBtnClass: 'bg-[#3FB6A8] hover:bg-[#52C7B8] text-[#0A1016]',
      accentTextClass: 'text-[#3FB6A8]', accentBorderHover: 'hover:border-[#3FB6A8]'
    },
    coffee: {
      bgMain: 'bg-[#F5EBE1]', bgNav: 'bg-[#EFE8DE]', bgPanel: 'bg-[#EFE8DE]', 
      textPrimary: 'text-[#3E2723]', textSecondary: 'text-[#765A51]', metallicBorder: 'border-[#D7CCC8]',
      actionBtnClass: 'bg-[#8C5A48] hover:opacity-80 text-white',
      accentTextClass: 'text-[#8C5A48]', accentBorderHover: 'hover:border-[#8C5A48]'
    },
    light: {
      bgMain: 'bg-[#F5F2EB]', bgNav: 'bg-[#FFFEFA]', bgPanel: 'bg-[#FFFEFA]', 
      textPrimary: 'text-[#202124]', textSecondary: 'text-[#5E5B55]', metallicBorder: 'border-[#E8E3D8]', 
      actionBtnClass: 'bg-[#31599B] hover:bg-[#274B85] text-white font-bold', 
      accentTextClass: 'text-[#31599B]', accentBorderHover: 'hover:border-[#31599B]'
    }
  };
  const activeStyle = themeStyles[activeThemeName] || themeStyles.coffee;
  
  const t = (darkClass, coffeeClass, lightClass, directClass) => {
    if (!isEmbedded) return directClass;
    if (activeThemeName === 'dark') return darkClass;
    if (activeThemeName === 'coffee') return coffeeClass;
    return lightClass;
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

  const customScrollbar = `
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-track]:rounded-none
    [&::-webkit-scrollbar-thumb]:rounded-none 
    [&::-webkit-scrollbar-thumb]:border-2 
    [&::-webkit-scrollbar-thumb]:border-transparent 
    [&::-webkit-scrollbar-thumb]:bg-clip-content
    ${t('[&::-webkit-scrollbar-thumb]:bg-[#26323D] hover:[&::-webkit-scrollbar-thumb]:bg-[#8B9AA8]', '[&::-webkit-scrollbar-thumb]:bg-[#D7CCC8] hover:[&::-webkit-scrollbar-thumb]:bg-[#8C5A48]', '[&::-webkit-scrollbar-thumb]:bg-[#D9D1C4] hover:[&::-webkit-scrollbar-thumb]:bg-[#817D74]', '')}
  `;

  return (
    <>
      <Helmet>
        <title>{algoMetadata.algorithmTitle} - Python Algorithm Visualization</title>
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
            --cobalt: #2457C5;
            --teal: #16756F;
            --vermilion: #D94F3D;
          }
        `}</style>
      )}

      <div className={`${isEmbedded ? 'h-full w-full' : 'h-screen w-full'} flex flex-col font-sans overflow-hidden ${bgMain} ${textPrimary}`}>
        <LoginModal />
        {!isEmbedded && <LandingNav />}

        {savedToast && (
          <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 bg-(--teal) text-white px-5 py-3 rounded shadow-xl animate-[bounce_0.5s_ease-in-out]">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            <div>
              <h4 className="font-bold text-sm">Algorithm Saved!</h4>
            </div>
          </div>
        )}

        {showSaveModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-sm rounded p-6 flex flex-col gap-4 shadow-2xl transition-all ${t(
              'bg-[#101820] text-white border-[#26323D]', 
              'bg-[#F5EBE1] text-[#3E2723] border-[#D7CCC8]', 
              'bg-[#FFFFFF] text-black border-[#E8E3D8]', 
              'bg-(--canvas-paper) text-(--ink) border-(--ink-line)'
            )}`}>
              <div>
                <h3 className="text-lg font-bold mb-1">Save Algorithm</h3>
              </div>
              <input 
                type="text" 
                value={saveFileName}
                onChange={(e) => setSaveFileName(e.target.value)}
                maxLength={MAX_SAVE_TITLE_LENGTH}
                className={`w-full px-3 py-2 rounded text-sm font-medium outline-none border transition-all ${t(
                  'bg-[#0B1117] border-[#26323D] focus:border-[#3FB6A8] text-white', 
                  'bg-white/50 border-[#D7CCC8] focus:border-[#8C5A48] text-[#3E2723]', 
                  'bg-slate-50 border-[#E8E3D8] focus:border-[#31599B] text-black', 
                  'bg-(--canvas-tint) border-(--ink-line) focus:border-(--cobalt) text-(--ink)'
                )}`}
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowSaveModal(false)} className={`px-4 py-2 rounded text-xs font-bold transition-all ${t('hover:bg-[#121B24] text-[#8B9AA8]', 'hover:bg-black/5 text-[#765A51]', 'hover:bg-slate-100 text-slate-600', 'hover:bg-(--canvas-tint) text-(--ink-secondary)')}`}>Cancel</button>
                <button onClick={confirmSaveCode} disabled={!saveFileName.trim()} className={`px-4 py-2 rounded text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${actionBtnClass}`}>Save to Profile</button>
              </div>
            </div>
          </div>
        )}

        {showLimitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className={`relative w-full max-w-md rounded p-8 flex flex-col items-center text-center transform transition-all ${cleanBorder} ${t(
              'bg-[#101820] text-white', 
              'bg-[#F5EBE1] text-[#3E2723] shadow-xl', 
              'bg-[#FFFFFF] text-black shadow-xl', 
              'bg-(--canvas-paper) text-(--ink) shadow-xl'
            )}`}>
              <h2 className="text-xl font-bold mb-4 tracking-tight">Daily Limit Reached</h2>
              <button onClick={() => setShowLimitModal(false)} className={`w-full py-2 font-bold rounded transition-all ${actionBtnClass}`}>Understood</button>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden relative min-h-0 ws-mobile-main-row">
          
          <aside className={`group relative shrink-0 ${cleanBorder} border-y-0 border-l-0 ${bgPanel} transition-[width,padding] duration-500 ease-in-out flex flex-col justify-between overflow-hidden ws-mobile-desc-panel ${
            isDescriptionOpen ? "w-64 p-5" : "w-12 p-2 items-center ws-mobile-closed"
          }`}>
           
           <button 
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className={`absolute top-4 right-2.5 z-20 w-6 h-6 rounded flex items-center justify-center ${accentTextClass} transition-all duration-300 ease-in-out hidden md:flex ${t(
              'hover:bg-[#121B24]', 
              'hover:bg-[#E8DED4]', 
              'hover:bg-slate-100', 
              'hover:bg-(--canvas-tint)'
            )} ${isDescriptionOpen ? 'scale-100' : 'scale-90 rotate-180'}`}
           >
            <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>

            <div className={`flex flex-col items-center gap-6 mt-14 cursor-pointer closed-desc-inner transition-all duration-500 ${isDescriptionOpen ? 'opacity-0 absolute pointer-events-none translate-y-8' : 'opacity-100 translate-y-0 delay-200'}`} onClick={() => setIsDescriptionOpen(true)}>
              <span className={`text-[10px] font-bold uppercase font-mono tracking-widest ${textSecondary} [writing-mode:vertical-lr] rotate-180 closed-text group-hover:${accentTextClass} transition-colors duration-300`}>
                INFO
              </span>
            </div>
            
            <article className={`space-y-6 overflow-y-auto pr-2 w-full transition-all duration-500 ${customScrollbar} ${!isDescriptionOpen ? 'opacity-0 absolute pointer-events-none -translate-x-8' : 'opacity-100 translate-x-0 delay-150'}`}>
              <header>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>ALGORITHM</span>
                <h1 className="text-lg font-bold mt-1 tracking-tight leading-tight">{algoMetadata.algorithmTitle}</h1>
                {algoMetadata.strategy && (
                  <span className={`inline-block mt-3 text-[10px] px-2 py-1 rounded font-bold border ${t(
                    'bg-[#121B24] text-[#3FB6A8] border-[#3FB6A8]/30', 
                    'bg-[#8C5A48]/10 text-[#8C5A48] border-[#8C5A48]/30', 
                    'bg-[#31599B]/10 text-[#31599B] border-[#31599B]/30', 
                    'bg-(--cobalt-tint) text-(--cobalt) border-(--cobalt)/30'
                  )}`}>
                    {algoMetadata.strategy}
                  </span>
                )}
              </header>

              {algoMetadata.description && (
                <div className={`text-[13px] font-medium leading-relaxed opacity-90 ${textPrimary}`}>
                  {algoMetadata.description}
                </div>
              )}

              {algoMetadata.insight && (
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>KEY KNOWLEDGE</span>
                  <div className={`mt-2 p-3 rounded border ${cleanBorder} ${t(
                    'bg-[#121B24]', 'bg-white/40', 'bg-slate-50', 'bg-(--canvas)'
                  )} text-xs font-medium leading-relaxed ${textPrimary}`}>
                    💡 {algoMetadata.insight}
                  </div>
                </div>
              )}

              <div>
  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>LANGUAGE</span>
  <div className={`mt-1 text-xs font-bold flex items-center gap-2 ${textPrimary}`}>
    {/* High-quality Python Logo */}
    <svg className="w-4 h-4" viewBox="0 0 110 110" xmlns="http://w3.org">
      <defs>
        <linearGradient id="pyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3776ab" />
          <stop offset="100%" stop-color="#1e4467" />
        </linearGradient>
        <linearGradient id="pyYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd43b" />
          <stop offset="100%" stop-color="#ffe873" />
        </linearGradient>
      </defs>
      {/* Top Snake */}
      <path fill="url(#pyBlue)" d="M54 10.1c-16.3 0-25.2 1.4-25.2 1.4s-12.7 1.8-12.7 13.9v9h26V38h-37C1.8 38 .2 46.8.2 55.4c0 9.2 4.4 16.3 14.5 16.3h9.6v-13c0-14.7 11.2-25.6 25.8-25.6h25.4v-9c0-11.4-10.2-14-14-14H54zm-14.4 7c2.4 0 4.3 1.9 4.3 4.3s-1.9 4.3-4.3 4.3-4.3-1.9-4.3-4.3 1.9-4.3 4.3-4.3z"/>
      {/* Bottom Snake */}
      <path fill="url(#pyYellow)" d="M55.4 99.1c16.3 0 25.2-1.4 25.2-1.4s12.7-1.8 12.7-13.9v-9h-26V71h37c3.3 0 4.9-8.8 4.9-17.4 0-9.2-4.4-16.3-14.5-16.3h-9.6v13c0 14.7-11.2 25.6-25.8 25.6H23.9v9c0 11.4 10.2 14 14 14h17.5zm14.4-7c-2.4 0-4.3-1.9-4.3-4.3s1.9-4.3 4.3-4.3 4.3 1.9 4.3 4.3-1.9 4.3-4.3 4.3z"/>
    </svg>
    {algoMetadata.language || 'Python 3'}
  </div>
</div>


              {algoMetadata.exampleInput && (
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE INPUT</span>
                  <pre className={`mt-1 p-2 rounded border ${cleanBorder} font-mono text-[11px] ${t(
                    'bg-[#0B1117] text-[#E6EDF3]', 'bg-[#EFE8DE] text-[#3E2723]', 'bg-white text-[#202124]', 'bg-(--canvas) text-(--ink-secondary)'
                  )}`}>{algoMetadata.exampleInput}</pre>
                </div>
              )}

              {algoMetadata.exampleOutput && (
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE OUTPUT</span>
                  <pre className={`mt-1 p-2 rounded border ${cleanBorder} font-mono text-[11px] ${t(
                    'bg-[#0B1117] text-[#E6EDF3]', 'bg-[#EFE8DE] text-[#3E2723]', 'bg-white text-[#202124]', 'bg-(--canvas) text-(--ink-secondary)'
                  )}`}>{algoMetadata.exampleOutput}</pre>
                </div>
              )}

            </article>
          </aside>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden ws-mobile-workspace-col">
            
            <header className={`h-12 shrink-0 ${cleanBorder} border-x-0 border-t-0 ${bgNav} flex items-center justify-between px-4 z-10 ws-mobile-header`}>
              <div className="flex items-center gap-3">
                {!isEmbedded && (
                  <div className="flex items-center gap-2">
                    <img src="/favicon.svg" alt="Logo" className="w-5 h-5 object-contain" />
                    <span className={`font-bold text-sm tracking-tight ${accentTextClass}`}>CodeToAnim</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 header-actions">
                <div className={`hidden md:flex items-center p-0.5 rounded ${cleanBorder} ${t(
                  'bg-[#0B1117]', 'bg-[#E8DED4]', 'bg-slate-100', 'bg-(--canvas-tint)'
                )}`}>
                  <button
                    onClick={() => setIsEditorOpen(true)}
                    className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${isEditorOpen ? t(
                      'bg-[#121B24] text-white', 'bg-white text-[#3E2723] shadow-sm', 'bg-white text-black shadow-sm', 'bg-(--canvas-paper) text-(--ink) shadow-sm'
                    ) : t(
                      'text-[#8B9AA8] hover:text-[#E6EDF3]', 'text-[#765A51 hover:text-[#3E2723]', 'text-[#5E5B55] hover:text-black', 'text-(--ink-muted) hover:text-(--ink)'
                    )}`}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => {
                      setIsEditorOpen(false);
                      setIsDescriptionOpen(false);
                    }}
                    className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${!isEditorOpen ? t(
                      'bg-[#121B24] text-white', 'bg-white text-[#3E2723] shadow-sm', 'bg-white text-black shadow-sm', 'bg-(--canvas-paper) text-(--ink) shadow-sm'
                    ) : t(
                      'text-[#8B9AA8] hover:text-[#E6EDF3]', 'text-[#765A51] hover:text-[#3E2723]', 'text-[#5E5B55] hover:text-black', 'text-(--ink-muted) hover:text-(--ink)'
                    )}`}
                  >
                    Vis Only
                  </button>
                </div>
                
                <button onClick={handleSaveCodeClick} className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${t(
                  'text-[#E6EDF3] hover:bg-[#121B24]', 'text-[#3E2723] hover:bg-black/5', 'text-black hover:bg-slate-100', 'text-(--ink) hover:bg-(--canvas-tint)'
                )}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Save Code
                </button>
                
                <button onClick={handleExecuteTrace} disabled={isLoading} className={`px-4 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${actionBtnClass}`}>
                  {isLoading ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                  <span>{isLoading ? "Tracing..." : "Execute Trace"}</span>
                </button>
              </div>
            </header>

            {errorMessage && (
              <div className={`px-4 py-2 text-[11px] font-mono font-bold flex shrink-0 items-center gap-2 ${t('bg-[#D96C6C]/10 text-[#D96C6C] border-b border-[#D96C6C]/20', 'bg-[#C8533C]/10 text-[#C8533C] border-b border-[#C8533C]/20', 'bg-red-50 text-red-600 border-b border-red-200', 'bg-(--vermilion-tint) text-(--vermilion) border-b border-(--vermilion)/20')}`}>
                ⚠️ {errorMessage}
              </div>
            )}

            <div className={`flex-1 min-h-0 flex overflow-hidden relative ws-mobile-editor-row`}>
              
              <div className={`${isEditorOpen ? 'w-full md:w-1/2 lg:w-[45%] shrink-0' : 'hidden'} flex flex-col h-full overflow-hidden transition-all ${cleanBorder} border-y-0 border-l-0`}>
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
                />
              </div>

              <div className={`flex-1 min-h-0 flex flex-col h-full overflow-hidden relative ${bgMain}`}>
                <Visualizer 
                  steps={steps} 
                  currentStepIndex={currentStepIndex} 
                  errorMessage={null} 
                  isDark={isDark}
                  activeThemeName={activeThemeName} 
                />
              </div>
              
            </div>

            {/* Persistent Output Console */}
            <div className={`h-[110px] shrink-0 flex flex-col ${cleanBorder} border-x-0 border-t ${bgPanel}`}>
              <div className={`h-8 px-4 flex items-center justify-between border-b ${cleanBorder} ${bgNav}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Output</span>
              </div>
              <div className={`flex-1 min-h-0 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap ${textPrimary} ${customScrollbar}`}>
                {consoleOutput.trim() ? consoleOutput : <span className="opacity-50">No output yet. Execute the program to see console output.</span>}
              </div>
            </div>

            {/* Execution Timeline Bar */}
            <footer className={`h-12 shrink-0 ${cleanBorder} border-x-0 border-t border-b-0 ${bgNav} flex items-center px-4 z-10 ws-mobile-footer`}>
              <div className="flex w-full items-center gap-4">
                
                <div className={`flex items-center gap-1`}>
                  <button onClick={handleFirstStep} disabled={steps.length === 0 || currentStepIndex === 0} className={`p-1.5 rounded ${textSecondary} hover:${textPrimary} ${t('hover:bg-[#121B24]', 'hover:bg-white/50', 'hover:bg-slate-100', 'hover:bg-(--canvas) hover:shadow-sm')} disabled:opacity-30 transition-all`} title="First Step">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                  </button>
                  <button onClick={handlePrevStep} disabled={steps.length === 0 || currentStepIndex === 0} className={`p-1.5 rounded ${textSecondary} hover:${textPrimary} ${t('hover:bg-[#121B24]', 'hover:bg-white/50', 'hover:bg-slate-100', 'hover:bg-(--canvas) hover:shadow-sm')} disabled:opacity-30 transition-all`} title="Previous Step">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
                  </button>
                  <button onClick={handleTogglePlay} disabled={steps.length === 0 || (currentStepIndex === steps.length - 1 && !isPlaying)} className={`p-1.5 rounded flex items-center justify-center text-white transition-all disabled:opacity-40 ${
                    isPlaying ? t('bg-[#D6A64F] hover:bg-[#D6A64F]/90 text-[#0A1016]', 'bg-amber-700 hover:bg-amber-600', 'bg-amber-500 hover:bg-amber-400 text-black', 'bg-(--vermilion) hover:bg-(--vermilion)/90 shadow-sm') : actionBtnClass
                  }`} title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                  </button>
                  <button onClick={handleNextStep} disabled={steps.length === 0 || currentStepIndex === steps.length - 1} className={`p-1.5 rounded ${textSecondary} hover:${textPrimary} ${t('hover:bg-[#121B24]', 'hover:bg-white/50', 'hover:bg-slate-100', 'hover:bg-(--canvas) hover:shadow-sm')} disabled:opacity-30 transition-all`} title="Next Step">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
                  </button>
                  <button onClick={handleLastStep} disabled={steps.length === 0 || currentStepIndex === steps.length - 1} className={`p-1.5 rounded ${textSecondary} hover:${textPrimary} ${t('hover:bg-[#121B24]', 'hover:bg-white/50', 'hover:bg-slate-100', 'hover:bg-(--canvas) hover:shadow-sm')} disabled:opacity-30 transition-all`} title="Last Step">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                  </button>
                </div>

                <div className="flex-1 flex items-center min-w-0">
                  <div className={`w-full h-1 rounded overflow-hidden ${cleanBorder} ${t('bg-[#0B1117]', 'bg-black/10', 'bg-slate-200', 'bg-(--ink-line)')}`}>
                    <div className={`h-full transition-all duration-300 rounded ${t('bg-[#3FB6A8]', 'bg-[#8C5A48]', 'bg-[#31599B]', 'bg-(--cobalt)')}`} style={{ width: `${steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className={`font-mono text-[11px] font-bold ${textSecondary} whitespace-nowrap min-w-[70px] text-right`}>
                  STEP <span className={textPrimary}>{steps.length > 0 ? currentStepIndex + 1 : 0}</span> / {steps.length}
                </div>

              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}