import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import LoginModal from '../components/LoginModal';
import { ALGORITHMS_DATABASE } from '../data/algorithmsData';

export default function LearnPage() {
  const { currentTheme } = useTheme();
  const { user, openAuthModal } = useAuth();
  
  const isDark = currentTheme === 'dark';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Track which algorithms the user has marked complete
  const [completedAlgos, setCompletedAlgos] = useState(new Set());

  // Fetch completed algorithms from database on load
  useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_progress')
          .select('algorithm_id')
          .eq('user_id', user.id)
          .eq('progress_percent', 100);
          
        if (data) {
          setCompletedAlgos(new Set(data.map(d => d.algorithm_id)));
        }
      }
    };
    fetchProgress();
  }, [user]);

  const categories = useMemo(() => {
    const cats = new Set(ALGORITHMS_DATABASE.map(algo => algo.category));
    return ['All', ...Array.from(cats)].sort();
  }, []);
  
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredAlgorithms = useMemo(() => {
    return ALGORITHMS_DATABASE.filter((algo) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        algo.title.toLowerCase().includes(searchStr) ||
        algo.description.toLowerCase().includes(searchStr) ||
        algo.category.toLowerCase().includes(searchStr);
        
      const matchesCategory = selectedCategory === 'All' || algo.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || algo.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  // NEW: Replaced the navigate handler with a specific guest limit checker for the <Link>
  const checkGuestLimit = (e, algoId) => {
    if (!user) {
      try {
        const raw = localStorage.getItem('guest_algo_views');
        const views = raw ? JSON.parse(raw) : [];
        if (!views.includes(algoId)) {
          if (views.length >= 5) {
            // Prevent the <Link> from navigating!
            e.preventDefault();
            openAuthModal('Guest algorithm view limit reached (5 unique algorithms viewed). Sign up to unlock the full library.');
            return;
          }
          views.push(algoId);
          localStorage.setItem('guest_algo_views', JSON.stringify(views));
        }
      } catch (err) {
        console.warn('Could not access guest_algo_views in localStorage', err);
      }
    }
  };

  const bgMain = isDark ? 'bg-[#090B10]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#121620]' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderCol = isDark ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} font-sans selection:bg-purple-500 selection:text-white flex flex-col`}>
      <LoginModal />    
      <header className={`h-16 border-b ${borderCol} ${bgCard} flex items-center justify-between px-8 shadow-sm`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/30 flex items-center justify-center p-1 hover:scale-105 transition-transform">
            <img src="/favicon.svg" alt="CodeAnim Logo" className="w-full h-full object-contain" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tighter">
            CodeTo<span className="text-purple-500">Anim</span> Algorithm Library
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/profile"
              className="px-4 py-2 text-sm bg-purple-900/30 hover:bg-purple-900/60 text-purple-200 rounded-md font-medium border border-purple-500/40 transition-colors flex items-center gap-2 shadow-sm"
              title="Go to Profile"
            >
              <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-inner">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              Back to Profile
            </Link>
          ) : (
            <button 
              onClick={() => openAuthModal('Create an account to track your progress and save favorites!')}
              className="px-4 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-md font-medium border border-purple-500/50 transition-colors flex items-center gap-1.5"
            >
              🔐 Sign Up / Log In
            </button>
          )}

          <Link 
            to="/workspace"
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
          >
            <span>💻 Open Workspace</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
        <div className={`bg-gradient-to-r from-purple-900/40 via-gray-900 to-gray-900 border border-purple-500/30 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl ${isDark ? '' : 'text-gray-100'}`}>
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Algorithm Explorer Library 📚
            </h2>
            <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">
              Explore our comprehensive database of computer science algorithms. Master data structures step-by-step from beginner fundamentals to advanced architectures. 
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-800 px-4 py-2 rounded-xl text-purple-300 font-mono text-sm shadow-inner">
            <span>⚡ {ALGORITHMS_DATABASE.length} Presets Ready</span>
          </div>
        </div>

        <div className={`flex flex-col gap-5 p-5 border ${borderCol} rounded-xl shadow-md ${isDark ? 'bg-gray-900/80' : 'bg-white'}`}>
          <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <span className={`absolute left-3 top-2.5 text-sm ${textSecondary}`}>🔍</span>
              <input 
                type="text"
                placeholder="Search algorithms, descriptions, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner ${isDark ? 'bg-gray-950 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
              />
            </div>

            <div className={`flex border rounded-lg p-1 w-full lg:w-auto ${isDark ? 'bg-gray-950 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedDifficulty === diff
                      ? diff === 'Easy' ? 'bg-green-600/20 text-green-500' 
                        : diff === 'Medium' ? 'bg-yellow-600/20 text-yellow-500'
                        : diff === 'Hard' ? 'bg-red-600/20 text-red-500'
                        : 'bg-purple-600/30 text-purple-500'
                      : `${textSecondary} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Topics:</span>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20"
                      : `${isDark ? 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-2">
          <span className={`text-sm font-mono ${textSecondary}`}>
            Showing <strong className="text-purple-500">{filteredAlgorithms.length}</strong> algorithms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAlgorithms.map((algo) => {
            const isCompleted = completedAlgos.has(algo.id);
            
            return (
              <div 
                key={algo.id}
                className={`border hover:border-purple-500/50 rounded-xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 group ${isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white border-gray-200'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono uppercase font-extrabold text-purple-500 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded shadow-sm">
                        {algo.category}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-mono font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                          ✅ DONE
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shadow-sm ${
                      algo.difficulty === 'Easy' 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                        : algo.difficulty === 'Medium'
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                        : 'bg-red-500/10 text-red-500 border border-red-500/30'
                    }`}>
                      {algo.difficulty}
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold mb-2 transition-colors ${isDark ? 'text-white group-hover:text-purple-300' : 'text-gray-900 group-hover:text-purple-600'}`}>
                    {algo.title}
                  </h3>

                  <p className={`text-xs leading-relaxed mb-5 line-clamp-3 ${textSecondary}`}>
                    {algo.description}
                  </p>
                </div>

                <div>
                  <div className={`flex justify-between py-3 border-t border-b mb-5 font-mono text-[11px] rounded-md px-3 ${isDark ? 'border-gray-800/80 text-gray-400 bg-gray-950/30' : 'border-gray-100 text-gray-500 bg-gray-50'}`}>
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] uppercase ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Time</span>
                      <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{algo.timeComplexity}</span>
                    </div>
                    <div className={`w-px h-auto ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className={`text-[10px] uppercase ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Space</span>
                      <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{algo.spaceComplexity}</span>
                    </div>
                  </div>

                  {/* NEW: Using an SEO-friendly <Link> instead of a <button> with navigate() */}
                  <Link
                    to={`/workspace?algo=${algo.id}`}
                    onClick={(e) => checkGuestLimit(e, algo.id)}
                    className="w-full py-2.5 bg-purple-600/10 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-500 text-purple-500 hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    <span>{isCompleted ? 'Review & Visualize Again' : 'Run & Visualize Step-by-Step'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAlgorithms.length === 0 && (
          <div className={`py-20 flex flex-col items-center justify-center text-center rounded-xl border border-dashed ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <span className="text-4xl mb-4">📭</span>
            <h3 className="text-lg font-bold mb-1">No algorithms found</h3>
            <p className={`font-mono text-sm max-w-sm ${textSecondary}`}>
              Adjust your search or filter criteria to explore the database.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className={`mt-4 px-4 py-2 rounded-md text-xs font-bold transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}