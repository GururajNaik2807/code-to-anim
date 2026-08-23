import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ALGORITHMS_DATABASE } from '../data/algorithmsData';
import { useTheme } from '../context/ThemeContext';

export default function AlgorithmLibrary({ 
  isEmbedded = false, 
  embeddedCompleted = new Set(), 
  onEmbeddedOpen = null, 
  isDarkOverride = null 
}) {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  
  const isDark = isDarkOverride !== null ? isDarkOverride : currentTheme === 'dark';

  const [libSearchTerm, setLibSearchTerm] = useState('');
  const [libCategory, setLibCategory] = useState('All');
  const [libDifficulty, setLibDifficulty] = useState('All');

  const libCategories = useMemo(() => {
    const cats = new Set(ALGORITHMS_DATABASE.map(algo => algo.category));
    return ['All', ...Array.from(cats)].sort();
  }, []);
  
  const libDifficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredLibrary = useMemo(() => {
    return ALGORITHMS_DATABASE.filter((algo) => {
      const searchStr = libSearchTerm.toLowerCase();
      const matchesSearch = 
        algo.title.toLowerCase().includes(searchStr) ||
        algo.description.toLowerCase().includes(searchStr) ||
        algo.category.toLowerCase().includes(searchStr);
      const matchesCategory = libCategory === 'All' || algo.category === libCategory;
      const matchesDifficulty = libDifficulty === 'All' || algo.difficulty === libDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [libSearchTerm, libCategory, libDifficulty]);

  const bgMain = isDark ? 'bg-[#090B10]' : 'bg-gray-50';
  const bgPanel = isDark ? 'bg-[#05070A]' : 'bg-[#FFFFFF]';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const metallicBorder = isDark 
    ? 'border border-slate-800/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)]' 
    : 'border border-slate-200/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.05)]';
  const hoverBg = isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50';

  const mainContent = (
    <div className={`max-w-7xl mx-auto ${isEmbedded ? 'pb-10' : 'p-8 mt-4'}`}>
      {!isEmbedded && (
        <Helmet>
          <title>Algorithm Library | CodeToAnim Visualizer</title>
          <meta 
            name="description" 
            content={`Explore and step-through ${ALGORITHMS_DATABASE.length} computer science algorithms including Sorting, Searching, Dynamic Programming, Graphs, and Trees in real-time.`} 
          />
          <link rel="canonical" href="https://code-to-anim.vercel.app/algorithms" />
        </Helmet>
      )}

      <div className="text-center space-y-3 mb-10 mt-4">
        <h1 className="text-4xl font-black tracking-tight">Algorithm Library</h1>
        <p className={`text-sm font-medium ${textSecondary}`}>
          Explore and visualize {ALGORITHMS_DATABASE.length} computer science algorithms step-by-step.
        </p>
      </div>

      <div className={`flex flex-col gap-5 p-6 rounded-3xl ${metallicBorder} ${bgPanel}/90 backdrop-blur-md shadow-sm mb-8`}>
        <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className={`absolute left-4 top-3 text-sm ${textSecondary}`}>🔍</span>
            <input 
              type="text"
              placeholder="Search algorithms or topics..."
              value={libSearchTerm}
              onChange={(e) => setLibSearchTerm(e.target.value)}
              className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner ${isDark ? 'bg-[#0A0D14] border-slate-800 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>

          <div className={`flex flex-wrap border rounded-xl p-1.5 w-full lg:w-auto ${isDark ? 'bg-[#0A0D14] border-slate-800' : 'bg-slate-50 border-slate-200'} shadow-inner`}>
            {libDifficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setLibDifficulty(diff)}
                className={`flex-1 px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  libDifficulty === diff
                    ? diff === 'Easy' ? 'bg-emerald-500/20 text-emerald-500 shadow-sm' 
                      : diff === 'Medium' ? 'bg-amber-500/20 text-amber-500 shadow-sm'
                      : diff === 'Hard' ? 'bg-rose-500/20 text-rose-500 shadow-sm'
                      : 'bg-indigo-500/20 text-indigo-500 shadow-sm'
                    : `${textSecondary} ${hoverBg}`
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Topics:</span>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 flex-1">
            {libCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setLibCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  libCategory === cat
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30"
                    : `${isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLibrary.map((algo) => {
          const isCompleted = embeddedCompleted.has(algo.id);
          const targetUrl = `/workspace?algo=${algo.id}`;

          return (
            <div 
              key={algo.id}
              className={`border hover:border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/10 group ${metallicBorder} ${bgPanel}/90 backdrop-blur-md`}
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className="flex gap-2">
                    <span className="text-[10px] font-mono uppercase font-black text-indigo-500 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-md shadow-sm">
                      {algo.category}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-mono font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                        ✅ DONE
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-black shadow-sm ${
                    algo.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                      : algo.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                  }`}>
                    {algo.difficulty}
                  </span>
                </div>

                <h3 className={`text-lg font-black mb-3 tracking-tight transition-colors ${isDark ? 'text-slate-100 group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                  {algo.title}
                </h3>

                <p className={`text-xs leading-relaxed mb-6 font-medium line-clamp-3 ${textSecondary}`}>
                  {algo.description}
                </p>
              </div>

              <div>
                <div className={`flex justify-between py-3 border-t border-b mb-6 font-mono text-[11px] font-bold rounded-xl px-4 ${isDark ? 'border-slate-800/80 text-slate-400 bg-slate-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'} shadow-inner`}>
                  <div className="flex flex-col gap-1">
                    <span className={`text-[9px] uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Time</span>
                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{algo.timeComplexity}</span>
                  </div>
                  <div className={`w-px h-auto ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className={`text-[9px] uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Space</span>
                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{algo.spaceComplexity}</span>
                  </div>
                </div>

                {isEmbedded ? (
                  <button
                    onClick={() => onEmbeddedOpen && onEmbeddedOpen(algo)}
                    className={`w-full py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border ${
                      isDark 
                        ? 'bg-indigo-500/10 hover:bg-indigo-600 border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white' 
                        : 'bg-indigo-50 hover:bg-indigo-600 border-indigo-200 hover:border-indigo-600 text-indigo-700 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    <span>{isCompleted ? 'Review Algorithm' : 'Visualize Step-by-Step'}</span>
                  </button>
                ) : (
                  <Link
                    to={targetUrl}
                    state={{
                      presetCode: algo.code,
                      metadata: {
                        id: algo.id,
                        type: 'algorithm',
                        algorithmTitle: algo.title,
                        strategy: algo.category,
                        category: algo.category,
                        difficulty: algo.difficulty,
                        description: algo.description,
                        language: 'Python 3',
                        complexityTime: algo.timeComplexity,
                        complexitySpace: algo.spaceComplexity
                      }
                    }}
                    className={`w-full py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border ${
                      isDark 
                        ? 'bg-indigo-500/10 hover:bg-indigo-600 border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white' 
                        : 'bg-indigo-50 hover:bg-indigo-600 border-indigo-200 hover:border-indigo-600 text-indigo-700 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    <span>{isCompleted ? 'Review Algorithm' : 'Visualize Step-by-Step'}</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLibrary.length === 0 && (
        <div className={`py-24 flex flex-col items-center justify-center text-center rounded-3xl ${metallicBorder} ${isDark ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
          <span className="text-5xl mb-5 opacity-50">📭</span>
          <h3 className="text-xl font-bold mb-2">No algorithms found</h3>
          <p className={`text-sm font-medium max-w-sm ${textSecondary}`}>
            Adjust your search or filter criteria to explore the database.
          </p>
          <button 
            onClick={() => { setLibSearchTerm(''); setLibCategory('All'); setLibDifficulty('All'); }}
            className={`mt-6 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors ${metallicBorder} ${hoverBg}`}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  if (isEmbedded) return mainContent;

  return (
    <div className={`min-h-screen ${bgMain} ${isDark ? 'text-gray-100' : 'text-gray-900'} font-sans pb-20`}>
      <header className={`h-16 border-b ${metallicBorder} ${bgPanel} flex items-center px-8 sticky top-0 z-20`}>
        <Link to="/workspace" className={`flex items-center gap-2 text-sm font-bold ${textSecondary} hover:text-indigo-400 transition-colors`}>
          <span>←</span> Back to Workspace
        </Link>
      </header>
      <main>
        {mainContent}
      </main>
    </div>
  );
}