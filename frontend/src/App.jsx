import { useState } from 'react'

const initialArray = [4, 2, 8, 1];

function App() {
  const [code, setCode] = useState("arr = [4, 2, 8, 1]");

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      
      {/* Top Header / Nav */}
      <header className="h-16 border-b bg-white border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎬</span>
          <h1 className="text-xl font-bold text-slate-950">
            Code<span className="text-indigo-600">ToAnim</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md font-medium">
            Load Preset
          </button>
          <button className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold shadow">
            Execute Trace
          </button>
        </div>
      </header>

      {/* Main Workspace (Split View) */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Code Input */}
        <div className="w-1/2 h-full border-r border-slate-200 flex flex-col">
          <div className="px-4 py-2 border-b bg-white border-slate-200 text-sm font-semibold text-slate-600">
            Input Python Code
          </div>
          <div className="flex-1 bg-slate-950 text-slate-100 p-4 font-mono text-sm overflow-auto">
            {code}
          </div>
        </div>

        {/* Right Panel: Animated Canvas & Trace Player */}
        <div className="w-1/2 h-full flex flex-col bg-slate-50">
          <div className="px-4 py-2 border-b bg-white border-slate-200 text-sm font-semibold text-slate-600">
            Visual Execution
          </div>
          
          <div className="flex-1 flex items-center justify-center p-10 overflow-auto">
            <div className="flex gap-4 items-end">
              {initialArray.map((num, index) => (
                <div 
                  key={index} 
                  className="w-16 h-16 bg-white border-2 border-indigo-200 rounded-lg shadow-lg flex items-center justify-center text-3xl font-extrabold text-indigo-700"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Trace Controls */}
          <footer className="h-16 border-t bg-white border-slate-200 flex items-center justify-center gap-3 px-6 shadow-inner">
            <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md text-xl">⏮️</button>
            <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md text-xl">⏪</button>
            <div className="font-semibold text-slate-600 min-w-32 text-center">
              Step 1 / 4
            </div>
            <button className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xl">⏩</button>
            <button className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xl">⏭️</button>
          </footer>
        </div>

      </main>
    </div>
  )
}

export default App