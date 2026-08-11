import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function WorkspacePage() {
  // State management
  const [code, setCode] = useState("arr = [4, 2, 8, 1]\nfor i in range(len(arr)):\n    for j in range(0, len(arr)-i-1):\n        if arr[j] > arr[j+1]:\n            arr[j], arr[j+1] = arr[j+1], arr[j]");
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // --- API Call: Execute Trace ---
  const handleExecuteTrace = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/trace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSteps(data.steps);
        setCurrentStepIndex(0);
      } else {
        setErrorMessage(data.detail || data.error || "Execution failed.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to FastAPI backend on http://127.0.0.1:8000");
    } finally {
      setIsLoading(false);
    }
  };

  // --- API Call: Load Preset Algorithm ---
  const handleLoadPreset = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/presets");
      const presets = await response.json();
      
      if (presets.bubble_sort) {
        setCode(presets.bubble_sort);
      }
    } catch (err) {
      setErrorMessage("Failed to fetch presets from backend.");
    }
  };

  // --- Controls Navigation ---
  const handleFirstStep = () => setCurrentStepIndex(0);
  const handlePrevStep = () => setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  const handleNextStep = () => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  const handleLastStep = () => setCurrentStepIndex(steps.length - 1);

  // Derive variable state for the current trace step
  const currentStep = steps[currentStepIndex];
  const currentArray = currentStep?.variables?.arr || [4, 2, 8, 1];
  const currentLine = currentStep?.line ?? null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-950 text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Header */}
      <header className="h-16 border-b bg-gray-900 border-gray-800 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-3xl hover:scale-105 transition-transform" title="Return Home">
            🎬
          </Link>
          <h1 className="text-xl font-extrabold text-white tracking-tighter">
            Code<span className="text-purple-500">Anim</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLoadPreset}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md font-medium border border-gray-700 transition-colors"
          >
            Load Preset
          </button>
          <button 
            onClick={handleExecuteTrace}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white rounded-md font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
          >
            {isLoading ? "Tracing..." : "Execute Trace"}
          </button>
        </div>
      </header>

      {/* Workspace Split View */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: Code Editor */}
        <div className="w-1/2 h-full border-r border-gray-800 flex flex-col bg-gray-950">
          <div className="px-4 py-2 border-b bg-gray-900 border-gray-800 text-sm font-semibold text-gray-400 flex justify-between items-center">
            <span>Input Python Code</span>
            <span className="text-xs text-gray-500">main.py</span>
          </div>
          <div className="flex-1 bg-gray-950 text-gray-300 p-4 font-mono text-sm overflow-auto">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-gray-200"
              placeholder="Type Python code here..."
            />
          </div>
        </div>

        {/* Right: Visualization Canvas */}
        <div className="w-1/2 h-full flex flex-col bg-gray-900/50">
          <div className="px-4 py-2 border-b bg-gray-900 border-gray-800 text-sm font-semibold text-gray-400 flex justify-between items-center">
            <span>Visual Execution</span>
            {currentLine && (
              <span className="text-xs text-purple-400 font-mono">
                Executing Line: {currentLine}
              </span>
            )}
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-auto">
            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-950/80 border border-red-500/50 text-red-300 rounded-lg max-w-md w-full text-sm font-mono shadow-lg">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Visualized Array Elements */}
            <div className="flex gap-4 items-end">
              {Array.isArray(currentArray) ? (
                currentArray.map((num, index) => (
                  <div 
                    key={index} 
                    className="w-16 h-16 bg-gray-800 border-2 border-purple-500/50 rounded-lg shadow-lg shadow-purple-500/10 flex items-center justify-center text-3xl font-extrabold text-purple-400 transition-all transform duration-300"
                  >
                    {String(num)}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 font-mono text-sm">
                  Variable `arr` is not a list.
                </div>
              )}
            </div>

            {/* Variable Monitor Debug Panel */}
            {currentStep && (
              <div className="mt-8 bg-gray-900/80 border border-gray-800 p-4 rounded-lg font-mono text-xs text-gray-400 max-w-md w-full">
                <div className="text-purple-400 font-bold mb-1">State Inspector (Step {currentStep.step}):</div>
                <pre>{JSON.stringify(currentStep.variables, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Trace Player */}
          <footer className="h-16 border-t bg-gray-900 border-gray-800 flex items-center justify-center gap-4 px-6 shadow-inner">
            <button 
              onClick={handleFirstStep}
              disabled={steps.length === 0 || currentStepIndex === 0}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-md text-xl transition-colors"
            >
              ⏮️
            </button>
            <button 
              onClick={handlePrevStep}
              disabled={steps.length === 0 || currentStepIndex === 0}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-md text-xl transition-colors"
            >
              ⏪
            </button>
            
            <div className="font-semibold text-gray-400 min-w-[120px] text-center tracking-wide">
              {steps.length > 0 
                ? `Step ${currentStepIndex + 1} / ${steps.length}`
                : "Step 0 / 0"
              }
            </div>
            
            <button 
              onClick={handleNextStep}
              disabled={steps.length === 0 || currentStepIndex === steps.length - 1}
              className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-md text-xl shadow-md transition-colors"
            >
              ⏩
            </button>
            <button 
              onClick={handleLastStep}
              disabled={steps.length === 0 || currentStepIndex === steps.length - 1}
              className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-md text-xl shadow-md transition-colors"
            >
              ⏭️
            </button>
          </footer>
        </div>

      </main>
    </div>
  );
}