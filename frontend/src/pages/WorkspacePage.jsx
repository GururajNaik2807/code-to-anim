import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import LoginModal from '../components/LoginModal';

import Editor from '../components/Editor';
import Visualizer from '../components/Visualizer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://code-to-anim-backend.vercel.app";

export default function WorkspacePage() {
  const location = useLocation();
  const { user, openAuthModal } = useAuth(); 
  const { currentTheme, changeTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const DEFAULT_CODE = `# 1. Define input variables
nums = [2, 7, 11, 15]
target = 9

# 2. Result variable
found_indices = []

# 3. Check every pair
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            found_indices = [i, j]
            break
    if found_indices:
        break

print("Indices found:", found_indices)`;

  const DEFAULT_METADATA = {
    id: null,
    type: 'algorithm', 
    algorithmTitle: 'Find Target Index',
    strategy: 'Brute Force',
    description: 'Searches for a target number in an array and returns all indices where the target is found.',
    language: 'Python 3',
    exampleInput: 'nums = [2, 7, 11, 15]\ntarget = 9',
    exampleOutput: '[0, 1]'
  };

  const incomingLessonUrl = location.state?.lessonUrl || null;

  const [code, setCode] = useState(location.state?.presetCode || DEFAULT_CODE);
  const [algoMetadata, setAlgoMetadata] = useState(location.state?.metadata || DEFAULT_METADATA);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(true);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const autoPlayRef = useRef(null);

  useEffect(() => {
    if (location.state?.presetCode) setCode(location.state.presetCode);
    if (location.state?.metadata) setAlgoMetadata(location.state.metadata);
  }, [location.state]);

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
      // 1. Log to activity logs
      await supabase.from('activity_logs').insert([{ user_id: userId, action_type: 'EXECUTE', action_details: algorithmTitle }]);

      // 2. Update profile total executions
      const { data: profile } = await supabase.from('profiles').select('total_executions').eq('id', userId).maybeSingle();
      if (profile) await supabase.from('profiles').update({ total_executions: (profile.total_executions || 0) + 1 }).eq('id', userId);

      // 3. Update daily heatmap
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyActivity } = await supabase.from('daily_activity').select('execution_count').eq('user_id', userId).eq('activity_date', today).maybeSingle();
      if (dailyActivity) {
        await supabase.from('daily_activity').update({ execution_count: dailyActivity.execution_count + 1 }).eq('user_id', userId).eq('activity_date', today);
      } else {
        await supabase.from('daily_activity').insert([{ user_id: userId, activity_date: today, execution_count: 1 }]);
      }

      // 4. NEW: Register as "In Progress" (50%) for the Continue Learning widget
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
            progress_percent: 50, // 50% means started but not marked complete
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

      if (execData.count >= 3) return openAuthModal('Daily execution limit reached (3/3 runs used). Sign up for unlimited executions!');
      execData.count += 1;
      execData.date = today;
      localStorage.setItem('guest_exec_data', JSON.stringify(execData));
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

  const toggleTheme = () => changeTheme(isDark ? 'light' : 'dark');

  const handleFirstStep = () => { setIsPlaying(false); setCurrentStepIndex(0); };
  const handlePrevStep = () => { setIsPlaying(false); setCurrentStepIndex((prev) => Math.max(0, prev - 1)); };
  const handleTogglePlay = () => { if (steps.length > 0) setIsPlaying(!isPlaying); };
  const handleNextStep = () => { setIsPlaying(false); setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1)); };
  const handleLastStep = () => { setIsPlaying(false); setCurrentStepIndex(Math.max(0, steps.length - 1)); };

  const currentStep = steps[currentStepIndex];
  const activeLineNumber = currentStep?.line ?? null;
  const consoleOutput = currentStep?.output ?? "";

  const bgMain = isDark ? 'bg-[#090B10]' : 'bg-[#F3F4F6]';
  const bgNav = isDark ? 'bg-[#0E1117]' : 'bg-white';
  const bgPanel = isDark ? 'bg-[#121620]' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDark ? 'border-gray-800/80' : 'border-gray-200';

  return (
    <div className={`h-screen w-screen flex font-sans overflow-hidden ${bgMain} ${textPrimary}`}>
      <LoginModal />

      <aside className={`w-16 flex-shrink-0 border-r ${borderCol} ${bgNav} flex flex-col items-center justify-between py-4 z-20`}>
        <div className="flex flex-col items-center gap-6">
          <Link to="/" className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center p-2 hover:scale-105 transition-transform shadow-md">
            <img src="/favicon.svg" alt="CodeAnim Logo" className="w-full h-full object-contain" />
          </Link>

          <nav className="flex flex-col gap-3">
            <button className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex flex-col items-center justify-center text-[10px] font-bold">
              <span>&lt;/&gt;</span>
              <span>Workspace</span>
            </button>
            <Link to="/learn" className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] ${textSecondary} hover:bg-gray-800/40`}>
              <span>⚡</span>
              <span>Algorithms</span>
            </Link>
            <Link to="/profile" className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] ${textSecondary} hover:bg-gray-800/40`}>
              <span>📂</span>
              <span>Saved</span>
            </Link>
          </nav>
        </div>

        <button 
          onClick={toggleTheme} 
          className={`w-10 h-10 rounded-xl border ${borderCol} flex items-center justify-center text-lg hover:bg-gray-800/50 transition-colors`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? '🌙' : '☀️'}
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`h-14 border-b ${borderCol} ${bgNav} flex items-center justify-between px-6 z-10`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="Logo" className="w-5 h-5 object-contain" />
              <span className="font-extrabold text-sm tracking-tight text-purple-400">CodeAnim <span className="text-[10px] text-gray-500 font-mono">UNIVERSAL</span></span>
            </div>

            <div className={`flex items-center gap-2 border ${borderCol} rounded-lg px-3 py-1 text-xs font-semibold ${isDark ? 'bg-gray-900/60' : 'bg-gray-50'}`}>
              <span>{algoMetadata.algorithmTitle}</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 text-[10px]">{algoMetadata.strategy || 'Lesson'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            {algoMetadata.id && (
              <button 
                onClick={handleMarkComplete} 
                disabled={isCompleting || isCompleted}
                className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50 cursor-default' 
                    : `border-${isDark ? 'gray-700' : 'gray-300'} hover:border-emerald-500 hover:text-emerald-500`
                }`}
              >
                {isCompleting ? '⏳ Saving...' : isCompleted ? '✅ Completed' : '🏆 Mark Complete'}
              </button>
            )}

            {incomingLessonUrl ? (
              <Link to={incomingLessonUrl} className={`px-3 py-1.5 border ${borderCol} rounded-lg text-xs font-semibold hover:border-purple-500 transition-colors text-purple-400`}>
                ← Back to Lesson
              </Link>
            ) : (
              <Link to="/algorithms" className={`px-3 py-1.5 border ${borderCol} rounded-lg text-xs font-semibold hover:border-purple-500 transition-colors`}>
                📚 Algorithm Library
              </Link>
            )}
            
            <button onClick={handleSaveCode} className={`px-3 py-1.5 border ${borderCol} rounded-lg text-xs font-semibold hover:border-blue-500 transition-colors`}>
              💾 Save Code
            </button>
            
            <Link to="/profile" className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Link>
            
            <button onClick={handleExecuteTrace} disabled={isLoading} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5">
              <span>▷</span>
              <span>{isLoading ? "Tracing..." : "Execute Trace"}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <aside className={`relative flex-shrink-0 border-r ${borderCol} ${bgPanel} transition-all duration-300 flex flex-col justify-between overflow-hidden ${
            isDescriptionOpen ? "w-64 p-5" : "w-10 p-2 items-center"
          }`}>
            <button 
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className={`absolute top-3 right-2 z-20 w-6 h-6 rounded-full border ${borderCol} ${bgNav} hover:border-purple-500 text-purple-400 flex items-center justify-center text-xs shadow-md transition-colors`}
              title={isDescriptionOpen ? "Collapse Description" : "Expand Description"}
            >
              {isDescriptionOpen ? "◀" : "▶"}
            </button>

            {!isDescriptionOpen ? (
              <div className="flex flex-col items-center gap-6 mt-12 cursor-pointer" onClick={() => setIsDescriptionOpen(true)}>
                <span className={`text-[10px] font-bold uppercase font-mono tracking-widest text-gray-500 [writing-mode:vertical-lr] rotate-180`}>
                  DESCRIPTION
                </span>
              </div>
            ) : (
              <div className="space-y-5 overflow-y-auto pr-2">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>CURRENT ALGORITHM</span>
                  <h2 className="text-lg font-bold mt-1">{algoMetadata.algorithmTitle}</h2>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">{algoMetadata.strategy || 'Standard'}</span>
                  <p className={`text-xs ${textSecondary} mt-3 leading-relaxed`}>
                    {algoMetadata.description}
                  </p>
                </div>

                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>LANGUAGE</span>
                  <div className={`mt-1 border ${borderCol} rounded-lg p-2 text-xs font-medium flex items-center gap-2 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <span>🐍</span> {algoMetadata.language || 'Python 3'}
                  </div>
                </div>

                {algoMetadata.exampleInput && (
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE INPUT</span>
                    <pre className={`mt-1 p-2 rounded-lg border ${borderCol} font-mono text-xs ${isDark ? 'bg-gray-950 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>{algoMetadata.exampleInput}</pre>
                  </div>
                )}

                {algoMetadata.exampleOutput && (
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>EXAMPLE OUTPUT</span>
                    <pre className={`mt-1 p-2 rounded-lg border ${borderCol} font-mono text-xs ${isDark ? 'bg-gray-950 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>{algoMetadata.exampleOutput}</pre>
                  </div>
                )}
              </div>
            )}
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden relative">
              <Editor 
                code={code} 
                setCode={setCode} 
                isEditing={isEditing} 
                user={user} 
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

            <footer className={`h-16 border-t ${borderCol} ${bgNav} flex items-center justify-between px-8 z-10`}>
              <div className={`font-mono text-xs ${textSecondary} flex items-center gap-2 max-w-xs truncate`}>
                <span className="text-purple-400 font-bold">OUTPUT:</span>
                <span className="text-emerald-400 truncate">
                  {consoleOutput.trim() ? consoleOutput : '> Stream empty...'}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 rounded-2xl border border-gray-800/80 shadow-inner">
                <button 
                  onClick={handleFirstStep} 
                  disabled={steps.length === 0 || currentStepIndex === 0} 
                  className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 disabled:opacity-20 transition-all`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button 
                  onClick={handlePrevStep} 
                  disabled={steps.length === 0 || currentStepIndex === 0} 
                  className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 disabled:opacity-20 transition-all`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
                </button>
                <button 
                  onClick={handleTogglePlay} 
                  disabled={steps.length === 0} 
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg transition-all ${
                    isPlaying 
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30' 
                      : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  } disabled:opacity-30`}
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
                  className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 disabled:opacity-20 transition-all`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
                </button>
                <button 
                  onClick={handleLastStep} 
                  disabled={steps.length === 0 || currentStepIndex === steps.length - 1} 
                  className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 disabled:opacity-20 transition-all`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
              </div>

              <div className={`font-mono text-xs ${textSecondary} flex items-center gap-3`}>
                <div className="w-32 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
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
  );
}