import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '../supabaseClient';
import LoginModal from '../components/LoginModal';

// Import our new split components
import Editor from '../components/Editor';
import Visualizer from '../components/Visualizer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://code-to-anim-backend.vercel.app";

export default function WorkspacePage() {
  const location = useLocation();
  const { user, openAuthModal } = useAuth(); 
  
  const DEFAULT_CODE = `# 1. Define input variables\nnums = [2, 7, 11, 15]\ntarget = 9\n\n# 2. Result variable\nfound_indices = []\n\n# 3. Check every pair\nfor i in range(len(nums)):\n    for j in range(i + 1, len(nums)):\n        if nums[i] + nums[j] == target:\n            found_indices = [i, j]\n            break\n    if found_indices:\n        break\n\nprint("Indices found:", found_indices)`;

  const [code, setCode] = useState(location.state?.presetCode || DEFAULT_CODE);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditorMinimized, setIsEditorMinimized] = useState(false);

  useEffect(() => {
    if (location.state?.presetCode) {
      setCode(location.state.presetCode);
    }
  }, [location.state]);

  const logCodeExecution = async (algorithmTitle = 'Custom Algorithm') => {
    if (!user) return; 

    const userId = user.id;
    try {
      await supabase.from('activity_logs').insert([{ user_id: userId, action_type: 'EXECUTE', action_details: algorithmTitle }]);

      const { data: profile } = await supabase.from('profiles').select('total_executions').eq('id', userId).maybesingle();
      if (profile) await supabase.from('profiles').update({ total_executions: (profile.total_executions || 0) + 1 }).eq('id', userId);

      const today = new Date().toISOString().split('T')[0];
      const { data: dailyActivity } = await supabase.from('daily_activity').select('execution_count').eq('user_id', userId).eq('activity_date', today).single();
      
      if (dailyActivity) {
        await supabase.from('daily_activity').update({ execution_count: dailyActivity.execution_count + 1 }).eq('user_id', userId).eq('activity_date', today);
      } else {
        await supabase.from('daily_activity').insert([{ user_id: userId, activity_date: today, execution_count: 1 }]);
      }
    } catch (error) {
      console.error("Error logging execution:", error);
    }
  };

  const handleSaveCode = async () => {
    if (!user) return openAuthModal('Create a free account or log in to save your custom code and algorithms!');
    const algoName = prompt("Enter a name for this algorithm:", "My Custom Algorithm");
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
        logCodeExecution("Python Algorithm");
      } else {
        setErrorMessage(data.detail || data.error || "Execution trace failed.");
      }
    } catch (err) {
      setErrorMessage(`Could not connect to backend server at ${API_BASE_URL}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions passed as props to Visualizer
  const handleFirstStep = () => setCurrentStepIndex(0);
  const handlePrevStep = () => setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  const handleNextStep = () => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  const handleLastStep = () => setCurrentStepIndex(Math.max(0, steps.length - 1));

  // Determine active line number for the Editor
  const currentStep = steps[currentStepIndex];
  const activeLineNumber = currentStep?.line ?? null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-950 text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      <LoginModal />

      <header className="h-16 border-b bg-gray-900 border-gray-800 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-3xl hover:scale-105 transition-transform" title="Home">🎬</Link>
          <h1 className="text-xl font-extrabold text-white tracking-tighter">Code<span className="text-purple-500">Anim</span> Universal</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/algorithms" className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-purple-300 rounded-md font-medium border border-purple-500/30 transition-colors flex items-center gap-1.5">
            📚 Algorithm Library
          </Link>
          <button onClick={handleSaveCode} className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-blue-300 rounded-md font-medium border border-blue-500/30 transition-colors flex items-center gap-1.5">
            💾 Save Code
          </button>

          {user ? (
            <>
              <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-purple-300 rounded-md font-medium border border-purple-500/30 transition-colors flex items-center gap-1.5">
                {isEditing ? "👁️ View Visual Execution" : "✏️ Edit Python Code"}
              </button>
              <Link to="/profile" className="px-4 py-2 text-sm bg-purple-900/30 hover:bg-purple-900/60 text-purple-200 rounded-md font-medium border border-purple-500/40 transition-colors flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                Profile
              </Link>
            </>
          ) : (
            <button onClick={() => openAuthModal('Create an account to unlock unlimited executions and edit code!')} className="px-4 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-md font-medium border border-purple-500/50 transition-colors flex items-center gap-1.5">
              🔐 Sign Up / Log In
            </button>
          )}

          <button onClick={handleExecuteTrace} disabled={isLoading} className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white rounded-md font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2">
            {isLoading ? "Running Trace..." : "▶ Execute Trace"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <Editor 
          code={code} 
          setCode={setCode} 
          isEditing={isEditing} 
          user={user} 
          activeLineNumber={activeLineNumber} 
          handleSaveCode={handleSaveCode} 
          handleExecuteTrace={handleExecuteTrace} 
          isLoading={isLoading} 
          isEditorMinimized={isEditorMinimized} 
        />
        <Visualizer 
          steps={steps} 
          currentStepIndex={currentStepIndex} 
          isEditorMinimized={isEditorMinimized} 
          setIsEditorMinimized={setIsEditorMinimized} 
          errorMessage={errorMessage} 
          activeLineNumber={activeLineNumber} 
          isEditing={isEditing} 
          user={user} 
          handleFirstStep={handleFirstStep} 
          handlePrevStep={handlePrevStep} 
          handleNextStep={handleNextStep} 
          handleLastStep={handleLastStep} 
        />
      </main>
    </div>
  );
}