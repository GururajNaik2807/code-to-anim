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

export default function WorkspacePage({ isEmbedded = false }) {
  const location = useLocation();
  const navigate = useNavigate(); 
  
  const [searchParams] = useSearchParams();
  const algoQueryId = searchParams.get('algo');

  const { user, openAuthModal } = useAuth(); 
  const { currentTheme, changeTheme } = useTheme();
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
    description: 'Welcome to your personal algorithmic sandbox. This environment allows you to write custom scripts, test data structures, and visualize complex logic step-by-step. Start typing your Python code in the editor, and click "Execute Trace" to watch your logic come to life.',
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

  // Default to closed on mobile for better UX, open on PC
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(window.innerWidth > 768);
  const [isEditorOpen, setIsEditorOpen] = useState(true);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  const autoPlayRef = useRef(null);

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
      if (user && algoMetadata.id) {
        const { data } = await supabase
          .from('user_progress')
          .select('progress_percent')
          .eq('user_id', user.id)
          .eq('algorithm_id', algoMetadata.id)
          .maybeSingle();
        if (data && data.progress_percent === 100) {
          setIsCompleted(true);
        } else {
          setIsCompleted(false);
        }
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
    const userId = user.id;
    try {
      await supabase.from('activity_logs').insert([{ user_id: userId, action_type: 'EXECUTE', action_details: algorithmTitle }]);

      const { data: profile } = await supabase.from('profiles').select('total_executions').eq('id', userId).maybeSingle();
      if (profile) await supabase.from('profiles').update({ total_executions: (profile.total_executions || 0) + 1 }).eq('id', userId);

      const today = new Date().toISOString().split('T')[0];
      const { data: dailyActivity } = await supabase.from('daily_activity').select('execution_count').eq('user_id', userId).eq('activity_date', today).maybeSingle();
      
      if (dailyActivity) {
        await supabase.from('daily_activity').update({ execution_count: dailyActivity.execution_count + 1 }).eq('user_id', userId).eq('activity_date', today);
      } else {
        await supabase.from('daily_activity').insert([{ user_id: userId, activity_date: today, execution_count: 1 }]);
      }

      if (algoMetadata.id) {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('algorithm_id', algoMetadata.id)
          .maybeSingle();

        if (existingProgress) {
          await supabase.from('user_progress').update({
            last_accessed: new Date().toISOString()
          }).eq('id', existingProgress.id);
        } else {
          await supabase.from('user_progress').insert([{
            user_id: userId,
            algorithm_id: algoMetadata.id,
            title: algoMetadata.algorithmTitle,
            category: algoMetadata.category || 'General',
            difficulty: algoMetadata.difficulty || 'Medium',
            progress_percent: 50,
            last_accessed: new Date().toISOString()
          }]);
        }
      }
    } catch (error) {
      console.error("Error logging execution:", error);
    }
  };

  const handleMarkComplete = async () => {
    if (!user) return openAuthModal('Create a free account to track your algorithm progress!');
    if (!algoMetadata.id) return alert("This algorithm/lesson doesn't have a tracking ID assigned.");

    setIsCompleting(true);
    try {
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('algorithm_id', algoMetadata.id)
        .maybeSingle();

      if (existingProgress) {
        await supabase.from('user_progress').update({
          progress_percent: 100,
          last_accessed: new Date().toISOString()
        }).eq('id', existingProgress.id);
      } else {
        await supabase.from('user_progress').insert([{
          user_id: user.id,
          algorithm_id: algoMetadata.id,
          title: algoMetadata.algorithmTitle,
          category: algoMetadata.category || 'General',
          difficulty: algoMetadata.difficulty || 'Medium',
          progress_percent: 100,
          last_accessed: new Date().toISOString()
        }]);
      }

      if (!existingProgress || existingProgress.progress_percent < 100) {
        const { data: profile } = await supabase.from('profiles').select('algorithms_solved, topics_explored, current_xp').eq('id', user.id).maybeSingle();
        let updates = { current_xp: (profile?.current_xp || 0) + 150 };
        if (algoMetadata.type === 'lesson') {
          updates.topics_explored = (profile?.topics_explored || 0) + 1;
        } else {
          updates.algorithms_solved = (profile?.algorithms_solved || 0) + 1;
        }
        await supabase.from('profiles').update(updates).eq('id', user.id);
        await supabase.from('activity_logs').insert([{ user_id: user.id, action_type: 'ACHIEVEMENT', action_details: algoMetadata.algorithmTitle }]);
      }
      setIsCompleted(true);
    } catch (error) {
      setErrorMessage("Failed to mark complete: " + error.message);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSaveCode = async () => {
    if (!user) return openAuthModal('Create a free account to save your custom algorithms!');
    const algoName = prompt("Enter a name for this algorithm:", algoMetadata.algorithmTitle);
    if (!algoName) return; 
    
    setIsLoading(true);
    try {
      const { error } = await supabase.from('saved_algorithms').insert([{ user_id: user.id, title: algoName, code_content: code, list_name: 'Favorites' }]);
      if (error) throw error;
      await supabase.from('activity_logs').insert([{ user_id: user.id, action_type: 'CREATE', action_details: algoName }]);
      alert(`"${algoName}" saved successfully to your profile!`);
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
        const today = new Date().toISOString().split('T')[0];
        const { data: dailyActivity } = await supabase
          .from('daily_activity')
          .select('execution_count')
          .eq('user_id', user.id)
          .eq('activity_date', today)
          .maybeSingle();
          
        if (dailyActivity && dailyActivity.execution_count >= 10) {
          setLimitMessage("You've hit your limit of 10 executions for today! You're making great progress. Come back tomorrow to continue your learning journey.");
          setShowLimitModal(true);
          return; 
        }
      } catch (err) {
        console.error("Error checking daily limit:", err);
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
      setErrorMessage(`Could not connect to backend server at ${API_BASE_URL}`);
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

  const bgMain = isDark ? 'bg-[#0A0D14]' : 'bg-[#FAFAFC]';
  const bgNav = isDark ? 'bg-[#10141D]' : 'bg-[#FFFFFF]';
  const bgPanel = isDark ? 'bg-[#131822]' : 'bg-[#FFFFFF]';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  
  const metallicBorder = 'border border-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_5px_rgba(0,0,0,0.25)]';

  return (
    <>
      <Helmet>
        <title>{algoMetadata.algorithmTitle} | CodeToAnim Visualization</title>
        <meta name="description" content={algoMetadata.description} />
      </Helmet>

      {/* ISOLATED OVERRIDE STYLES: 'ws-' prefix prevents collision with ProfilePage CSS */}
      <style>{`
        @media (max-width: 768px) {
          .ws-mobile-hide { display: none !important; }

          .ws-mobile-header {
            height: auto !important;
            flex-direction: column !important;
            padding: 8px 12px !important;
            gap: 8px !important;
          }
          .ws-mobile-header > div {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .ws-mobile-header .header-actions {
            justify-content: center !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .ws-mobile-header button, .ws-mobile-header a {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
            font-size: 11px !important;
          }

          .ws-mobile-main-row {
            flex-direction: column !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }

          .ws-mobile-desc-panel {
            width: 100% !important;
            height: auto !important;
            min-height: 32px !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(100,100,100,0.3) !important;
            flex: none !important;
            z-index: 20 !important;
          }

          .ws-mobile-closed {
            height: 36px !important;
            padding: 0 12px !important;
            flex-direction: row !important;
            align-items: center !important;
          }
          
          .ws-mobile-closed .closed-desc-inner {
            flex-direction: row !important;
            margin-top: 0 !important;
            height: 100% !important;
            width: 100% !important;
            justify-content: flex-start !important;
            align-items: center !important;
          }
          
          .ws-mobile-closed .closed-text {
            writing-mode: horizontal-tb !important;
            transform: none !important;
            margin-top: 0 !important;
            margin-left: 10px !important;
          }

          .ws-mobile-workspace-col {
            overflow: visible !important;
            flex: none !important;
          }

          .ws-mobile-editor-row {
            flex-direction: column !important;
            overflow: visible !important;
            flex: none !important;
          }

          .ws-mobile-editor-row > * {
            width: 100% !important;
            height: 60vh !important;
            min-height: 450px !important;
            flex: none !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(100,100,100,0.3) !important;
          }

          .ws-mobile-footer {
            position: sticky !important;
            bottom: 0 !important;
            height: auto !important;
            flex-direction: column !important;
            gap: 6px !important;
            padding: 8px 12px !important;
            z-index: 50 !important;
            box-shadow: 0 -10px 20px rgba(0,0,0,0.5) !important;
          }
          
          .ws-mobile-footer > div {
            width: 100% !important;
            justify-content: center !important;
          }

          .ws-mobile-footer .gap-2 {
             gap: 4px !important;
          }
          .ws-mobile-footer button {
             padding: 4px !important;
          }
          .ws-mobile-footer button.w-11 {
             width: 32px !important;
             height: 30px !important;
             min-height: 32px !important;
          }
          .ws-mobile-footer button.w-11 svg {
             width: 16px !important;
             height: 16px !important;
          }
          .ws-mobile-footer > div:last-child {
             margin-top: 2px !important;
          }
        }
      `}</style>

      <div className={`${isEmbedded ? 'h-full w-full' : 'h-screen w-screen'} flex font-sans overflow-hidden ${bgMain} ${textPrimary}`}>
        <LoginModal />

        {showLimitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className={`relative w-full max-w-md rounded-3xl p-8 flex flex-col items-center text-center transform transition-all ${metallicBorder} ${isDark ? 'bg-[#131822] text-white shadow-purple-950/40' : 'bg-white text-slate-900 shadow-xl'}`}>
              <div className="w-16 h-16 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center text-3xl mb-4 border border-purple-500/30 shadow-inner">
                ⏳
              </div>
              <h2 className="text-2xl font-black mb-2 tracking-tight">Daily Limit Reached</h2>
              <p className={`text-sm mb-8 leading-relaxed ${textSecondary}`}>
                {limitMessage}
              </p>
              <button 
                onClick={() => setShowLimitModal(false)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-900/30"
              >
                Understood
              </button>
            </div>
          </div>
        )}

        {!isEmbedded && (
          <aside className={`hidden md:flex w-16 flex-shrink-0 ${metallicBorder} ${bgNav} flex-col items-center justify-between py-4 z-20 ws-mobile-hide`}>
            <div className="flex flex-col items-center gap-6">
              <Link to="/" className={`w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center p-2 hover:scale-105 transition-transform ${metallicBorder}`}>
                <img src="/favicon.svg" alt="CodeAnim Logo" className="w-full h-full object-contain" />
              </Link>

              <nav className="flex flex-col gap-3">
                <Link to="/profile" className={`w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ${metallicBorder}`}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Link>
              </nav>
            </div>

            <button 
              onClick={toggleTheme} 
              className={`w-10 h-10 rounded-xl ${metallicBorder} flex items-center justify-center text-lg hover:bg-slate-800/10 transition-colors bg-white/5`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            >
              {isDark ? '🌙' : '☀️'}
            </button>
          </aside>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className={`h-14 ${metallicBorder} border-x-0 border-t-0 ${bgNav} flex items-center justify-between px-6 z-10 ws-mobile-header`}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src="/favicon.svg" alt="Logo" className="w-5 h-5 object-contain" />
                <span className="font-extrabold text-sm tracking-tight text-purple-600">CodeToAnim <span className="text-[17px] text-slate-500 font-mono">Workspace</span></span>
              </div>

              <div className={`flex items-center gap-2 ${metallicBorder} rounded-lg px-3 py-1 text-xs font-semibold ${isDark ? 'bg-slate-900/60' : 'bg-slate-100'}`}>
                <span>{algoMetadata.algorithmTitle}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isDark ? 'bg-purple-950 text-purple-300 border border-purple-800/60' : 'bg-purple-100 text-purple-700 border border-purple-300'}`}>
                  {algoMetadata.strategy || 'Lesson'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 header-actions">
              {algoMetadata.type !== 'sandbox' && (
                 <button 
                  onClick={handleResetSandbox} 
                  className={`px-3 py-1.5 ${metallicBorder} rounded-lg text-xs font-semibold hover:border-amber-500 hover:text-amber-500 transition-colors ${isDark ? 'bg-slate-900/60' : 'bg-white'}`}
                  title="Clear workspace and return to Sandbox"
                >
                  🔄 Reset Sandbox
                </button>
              )}

              {incomingLessonUrl ? (
                <Link to={incomingLessonUrl} className={`px-3 py-1.5 ${metallicBorder} rounded-lg text-xs font-semibold hover:border-purple-600 transition-colors text-purple-600 ${isDark ? 'bg-slate-900/60' : 'bg-white'}`}>
                  ← Back to Lesson
                </Link>
              ) : !isEmbedded ? (
                <Link to="/algorithms" className={`px-3 py-1.5 ${metallicBorder} rounded-lg text-xs font-semibold hover:border-purple-600 transition-colors ${isDark ? 'bg-slate-900/60' : 'bg-white'}`}>
                  📚 Algorithm Library
                </Link>
              ) : null}

              {!user ? (
                <>
                  <button 
                    onClick={() => openAuthModal('Log in to save your custom algorithms!')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => openAuthModal('Sign up to track your progress and save code!')} 
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-purple-900/30"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${metallicBorder} ${
                        isCompleted 
                          ? (isDark ? 'bg-emerald-950/50 text-emerald-400 border-emerald-600/60' : 'bg-emerald-100 text-emerald-700 border-emerald-300')
                          : `hover:border-emerald-500 hover:text-emerald-500 ${isDark ? 'bg-slate-900/60' : 'bg-white'}`
                      }`}
                    >
                      {isCompleting ? '⏳ Saving...' : isCompleted ? '✅ Completed' : '🏆 Mark Complete'}
                    </button>
                  )}
                  
                  <button onClick={handleSaveCode} className={`px-3 py-1.5 ${metallicBorder} rounded-lg text-xs font-semibold hover:border-blue-600 transition-colors ${isDark ? 'bg-slate-900/60' : 'bg-white'}`}>
                    💾 Save Code
                  </button>
                </>
              )}
              
              <button onClick={handleExecuteTrace} disabled={isLoading} className={`px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${metallicBorder}`}>
                <span>▷</span>
                <span>{isLoading ? "Tracing..." : "Execute Trace"}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden relative ws-mobile-main-row">
            <aside className={`relative flex-shrink-0 ${metallicBorder} border-y-0 border-l-0 ${bgPanel} transition-all duration-300 flex flex-col justify-between overflow-hidden ws-mobile-desc-panel ${
              isDescriptionOpen ? "w-64 p-5" : "w-10 p-2 items-center ws-mobile-closed"
            }`}>
             <button 
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className={`absolute top-3 right-2 z-20 w-6 h-6 rounded-full ${metallicBorder} ${bgNav} hover:border-purple-500 text-purple-600 items-center justify-center text-xs transition-colors hidden md:flex`}
              title={isDescriptionOpen ? "Collapse Description" : "Expand Description"}
             >
              {isDescriptionOpen ? "◀" : "▶"}
            </button>

              {!isDescriptionOpen ? (
                <div className="flex flex-col items-center gap-6 mt-12 cursor-pointer closed-desc-inner" onClick={() => setIsDescriptionOpen(true)}>
                  <span className={`text-[10px] font-bold uppercase font-mono tracking-widest ${textSecondary} [writing-mode:vertical-lr] rotate-180 closed-text`}>
                    DESCRIPTION
                  </span>
                </div>
              ) : (
                <div className="space-y-5 overflow-y-auto pr-2">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>CURRENT ALGORITHM</span>
                    <h2 className="text-lg font-bold mt-1 tracking-tight">{algoMetadata.algorithmTitle}</h2>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold border shadow-sm ${isDark ? 'bg-purple-950 text-purple-300 border-purple-800/60' : 'bg-purple-100 text-purple-700 border-purple-300'}`}>
                      {algoMetadata.strategy || 'Standard'}
                    </span>
                    <p className={`text-xs ${textSecondary} mt-3 leading-relaxed`}>
                      {algoMetadata.description}
                    </p>
                  </div>

                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>LANGUAGE</span>
                    <div className={`mt-1 ${metallicBorder} rounded-lg p-2 text-xs font-medium flex items-center gap-2 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                      <span>🐍</span> {algoMetadata.language || 'Python 3'}
                    </div>
                  </div>

                  {algoMetadata.exampleInput && (
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE INPUT</span>
                      <pre className={`mt-1 p-2 rounded-lg ${metallicBorder} font-mono text-xs ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>{algoMetadata.exampleInput}</pre>
                    </div>
                  )}

                  {algoMetadata.exampleOutput && (
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE OUTPUT</span>
                      <pre className={`mt-1 p-2 rounded-lg ${metallicBorder} font-mono text-xs ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>{algoMetadata.exampleOutput}</pre>
                    </div>
                  )}
                </div>
              )}
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden ws-mobile-workspace-col">
              <div className="flex-1 flex overflow-hidden relative ws-mobile-editor-row">
                <Editor 
                  code={code} 
                  setCode={setCode} 
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  user={user} 
                  openAuthModal={openAuthModal}
                  activeLineNumber={activeLineNumber} 
                  handleSaveCode={handleSaveCode} 
                  handleExecuteTrace={handleExecuteTrace} 
                  isLoading={isLoading} 
                  isDark={isDark}
                  isEditorOpen={isEditorOpen}
                  setIsEditorOpen={setIsEditorOpen}
                />

                <Visualizer 
                  steps={steps} 
                  currentStepIndex={currentStepIndex} 
                  errorMessage={errorMessage} 
                  isDark={isDark}
                />
              </div>

              <footer className={`h-16 ${metallicBorder} border-x-0 border-b-0 ${bgNav} flex items-center justify-between px-8 z-10 ws-mobile-footer`}>
                <div className={`font-mono text-xs ${textSecondary} flex items-center gap-2 max-w-xs truncate`}>
                  <span className="text-purple-600 font-bold">OUTPUT:</span>
                  <span className="text-emerald-500 font-semibold truncate">
                    {consoleOutput.trim() ? consoleOutput : '> Stream empty...'}
                  </span>
                </div>

                <div className={`flex items-center gap-2 p-1.5 rounded-2xl ${metallicBorder} ${isDark ? 'bg-slate-950/80 shadow-inner' : 'bg-slate-200/50 shadow-sm'}`}>
                  <button 
                    onClick={handleFirstStep} 
                    disabled={steps.length === 0 || currentStepIndex === 0} 
                    className={`p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60 disabled:opacity-30 transition-all ${metallicBorder} border-transparent hover:border-slate-900`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                  </button>
                  <button 
                    onClick={handlePrevStep} 
                    disabled={steps.length === 0 || currentStepIndex === 0} 
                    className={`p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60 disabled:opacity-30 transition-all ${metallicBorder} border-transparent hover:border-slate-900`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
                  </button>
                  <button 
                    onClick={handleTogglePlay} 
                    disabled={steps.length === 0} 
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all ${metallicBorder} ${
                      isPlaying 
                        ? 'bg-amber-600 hover:bg-amber-500' 
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
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
                    className={`p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60 disabled:opacity-30 transition-all ${metallicBorder} border-transparent hover:border-slate-900`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
                  </button>
                  <button 
                    onClick={handleLastStep} 
                    disabled={steps.length === 0 || currentStepIndex === steps.length - 1} 
                    className={`p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60 disabled:opacity-30 transition-all ${metallicBorder} border-transparent hover:border-slate-900`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                  </button>
                </div>

                <div className={`font-mono text-xs ${textSecondary} flex items-center gap-3`}>
                  <div className={`w-32 h-1.5 rounded-full overflow-hidden ${metallicBorder} bg-slate-200 dark:bg-slate-900`}>
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
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