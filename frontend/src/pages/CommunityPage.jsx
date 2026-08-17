import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function CommunityPage() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  // Theming classes
  const bgMain = isDark ? 'bg-[#0E1117]' : 'bg-[#F9FAFB]';
  const bgPanel = isDark ? 'bg-[#161B22]' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDark ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`flex h-screen w-screen font-sans ${bgMain} ${textPrimary} overflow-hidden`}>
      
      {/* LEFT SIDEBAR NAVIGATION
      <aside className={`w-20 flex-shrink-0 border-r ${borderCol} ${bgPanel} flex flex-col items-center py-6 gap-6 z-20`}>
        <Link to="/" className="text-2xl hover:scale-110 transition-transform" title="Home">🎬</Link>
        <div className="w-10 h-[1px] bg-gray-800"></div>
        <Link to="/profile" className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg hover:bg-gray-800 transition-colors`} title="Profile">🏠</Link>
        <Link to="/workspace" className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg hover:bg-gray-800 transition-colors`} title="Workspace">⚡</Link>
        <Link to="/learn" className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg hover:bg-gray-800 transition-colors`} title="Library">📚</Link>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-md cursor-default`} title="Community">💬</div>
      </aside> */}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Chat Header */}
        <header className={`h-16 flex-shrink-0 border-b ${borderCol} ${bgPanel} flex items-center px-8 shadow-sm z-10`}>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span className="text-indigo-500">#</span> global-algorithms
            </h1>
            <p className={`text-xs ${textSecondary}`}>Discuss data structures, logic, and help others debug.</p>
          </div>
        </header>

        {/* COMING SOON OVERLAY */}
        <div className="absolute inset-0 top-16 z-10 flex flex-col items-center justify-center backdrop-blur-sm bg-gray-950/60 p-6">
          <div className="bg-gray-900 border border-indigo-500/30 p-10 rounded-2xl shadow-2xl shadow-indigo-900/20 max-w-md text-center transform hover:scale-105 transition-transform duration-500">
            <div className="text-6xl mb-6 animate-bounce">🚧</div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Community Chat</h2>
            <h3 className="text-lg font-bold text-indigo-400 mb-4">Coming Soon</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              We are currently building a high-performance real-time server for you to connect, chat, and debug code with other algorithm explorers worldwide. Stay tuned!
            </p>
            <Link 
              to="/profile"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-500/30 transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>

        {/* FAKE BACKGROUND CHAT (Blurred out) */}
        <main className="flex-1 p-6 space-y-6 opacity-30 select-none overflow-hidden">
          {/* Fake Message 1 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold bg-emerald-600">J</div>
            <div className="max-w-[70%] flex flex-col items-start">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-bold text-gray-300">Jayden</span>
                <span className="text-[10px] text-gray-500">10:42 AM</span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${bgPanel} border ${borderCol} rounded-tl-none`}>
                Has anyone figured out the optimal time complexity for the dynamic programming coin change problem?
              </div>
            </div>
          </div>

          {/* Fake Message 2 */}
          <div className="flex gap-4 flex-row-reverse">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold bg-indigo-600">U</div>
            <div className="max-w-[70%] flex flex-col items-end">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-bold text-indigo-400">You</span>
                <span className="text-[10px] text-gray-500">10:45 AM</span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed bg-indigo-600 text-white rounded-tr-none">
                Yeah! You can do it in O(n * amount) time using a bottom-up tabulation approach. Check out the library!
              </div>
            </div>
          </div>
          
          {/* Fake Message 3 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold bg-rose-600">A</div>
            <div className="max-w-[70%] flex flex-col items-start">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-bold text-gray-300">AlexCode</span>
                <span className="text-[10px] text-gray-500">10:47 AM</span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${bgPanel} border ${borderCol} rounded-tl-none`}>
                Thanks! That visualizer really helped me understand the 2D matrix state changes. 🚀
              </div>
            </div>
          </div>
        </main>

        {/* Fake Input Box (Blurred) */}
        <div className={`p-4 bg-gray-950 border-t ${borderCol} opacity-30 select-none`}>
          <div className={`max-w-5xl mx-auto flex items-end gap-3 p-2 bg-gray-900 border ${borderCol} rounded-xl`}>
            <button type="button" className={`p-2 text-gray-400`}>➕</button>
            <div className="flex-1 py-2.5 text-sm text-gray-500">Message #global-algorithms...</div>
            <button type="button" className="p-2.5 bg-gray-800 text-gray-600 rounded-lg font-bold">Send</button>
          </div>
        </div>

      </div>
    </div>
  );
}