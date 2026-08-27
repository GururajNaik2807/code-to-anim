import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ALGORITHMS_DATABASE } from '../data/algorithmsData';
import LandingNav from '../components/LandingNav'; // 1. Imported the new Nav!

export default function AlgorithmLibrary({ 
  isEmbedded = false, 
  embeddedCompleted = new Set(), 
  onEmbeddedOpen = null
}) {
  const navigate = useNavigate();
  
  // Library Filter State
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

  // Helper for difficulty badge styling matching the canonical syntax
  const getDifficultyColors = (diff) => {
    if (diff === 'Easy') return 'bg-(--teal-tint) text-(--teal) border-(--teal)/30';
    if (diff === 'Medium') return 'bg-(--yellow-tint) text-[#B47C11] border-(--yellow)/50'; 
    if (diff === 'Hard') return 'bg-(--vermilion-tint) text-(--vermilion) border-(--vermilion)/30';
    return 'bg-(--cobalt-tint) text-(--cobalt) border-(--cobalt)/30';
  };

  const mainContent = (
    <div className={`max-w-7xl mx-auto ${isEmbedded ? 'pb-10' : 'px-6 py-16'}`}>
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

      <div className="text-center sm:text-left space-y-4 mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-(--ink)">
          Algorithm <span className="text-(--cobalt)">Library</span>
        </h1>
        <p className="text-lg text-(--ink-secondary) font-medium max-w-2xl">
          Explore and visualize {ALGORITHMS_DATABASE.length} computer science algorithms step-by-step.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-xl bg-(--canvas-paper) border border-(--ink-line-strong) shadow-sm mb-12">
        <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <span className="absolute left-4 top-3 text-sm text-(--ink-muted)">🔍</span>
            <input 
              type="text"
              placeholder="Search algorithms or topics..."
              value={libSearchTerm}
              onChange={(e) => setLibSearchTerm(e.target.value)}
              className="w-full bg-(--canvas-tint) border border-(--ink-line) text-(--ink) placeholder-(--ink-muted) rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-(--cobalt) focus:ring-1 focus:ring-(--cobalt) transition-all shadow-inner"
            />
          </div>

          {/* Difficulty Toggle */}
          <div className="flex flex-wrap border border-(--ink-line) rounded-lg p-1.5 w-full lg:w-auto bg-(--canvas-tint) shadow-inner">
            {libDifficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setLibDifficulty(diff)}
                className={`flex-1 px-5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  libDifficulty === diff
                    ? `bg-(--canvas-paper) shadow-sm border border-(--ink-line) ${
                        diff === 'Easy' ? 'text-(--teal)' : diff === 'Medium' ? 'text-[#B47C11]' : diff === 'Hard' ? 'text-(--vermilion)' : 'text-(--cobalt)'
                      }`
                    : 'text-(--ink-secondary) hover:text-(--ink) hover:bg-(--canvas-paper)/50 border border-transparent'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t border-(--ink-line) pt-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-(--ink-muted)">Topics:</span>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 flex-1 hide-scrollbar">
            {libCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setLibCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                  libCategory === cat
                    ? "bg-(--cobalt) border-(--cobalt) text-white shadow-md"
                    : "bg-(--canvas-paper) border-(--ink-line) text-(--ink-secondary) hover:bg-(--canvas-tint) hover:text-(--ink)"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Algorithm Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLibrary.map((algo) => {
          const isCompleted = embeddedCompleted.has(algo.id);
          const targetUrl = `/workspace?algo=${algo.id}`;

          return (
            <div 
              key={algo.id}
              className="bg-(--canvas-paper) border border-(--ink-line) hover:border-(--cobalt) hover:shadow-xl hover:-translate-y-1 rounded-xl p-6 sm:p-8 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-(--cobalt) bg-(--cobalt-tint) border border-(--cobalt)/30 px-2.5 py-1 rounded-md shadow-sm">
                      {algo.category}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-mono font-bold text-(--teal) bg-(--teal-tint) border border-(--teal)/30 px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                        ✅ DONE
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-bold shadow-sm border ${getDifficultyColors(algo.difficulty)}`}>
                    {algo.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-3 tracking-tight text-(--ink) group-hover:text-(--cobalt) transition-colors">
                  {algo.title}
                </h3>

                <p className="text-sm leading-relaxed mb-6 font-medium line-clamp-3 text-(--ink-secondary)">
                  {algo.description}
                </p>
              </div>

              <div>
                {/* Time & Space Complexity */}
                <div className="flex justify-between py-3 border-y border-(--ink-line) mb-6 font-mono text-[11px] font-bold rounded-lg px-4 bg-(--canvas-tint) shadow-inner">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-(--ink-muted)">Time</span>
                    <span className="text-(--ink)">{algo.timeComplexity}</span>
                  </div>
                  <div className="w-px h-auto bg-(--ink-line)"></div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[9px] uppercase tracking-widest text-(--ink-muted)">Space</span>
                    <span className="text-(--ink)">{algo.spaceComplexity}</span>
                  </div>
                </div>

                {/* CTA Button */}
                {isEmbedded ? (
                  <button
                    onClick={() => onEmbeddedOpen && onEmbeddedOpen(algo)}
                    className="w-full py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm border bg-(--canvas) border-(--ink-line) text-(--ink) hover:bg-(--cobalt) hover:border-(--cobalt) hover:text-white group-hover:border-(--cobalt)"
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
                    className="w-full py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm border bg-(--canvas) border-(--ink-line) text-(--ink) hover:bg-(--cobalt) hover:border-(--cobalt) hover:text-white group-hover:border-(--cobalt)"
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

      {/* Empty State */}
      {filteredLibrary.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-center rounded-xl border border-(--ink-line) bg-(--canvas-paper)">
          <span className="text-5xl mb-5 opacity-50">📭</span>
          <h3 className="text-xl font-bold mb-2 text-(--ink)">No algorithms found</h3>
          <p className="text-sm font-medium max-w-sm text-(--ink-secondary)">
            Adjust your search or filter criteria to explore the database.
          </p>
          <button 
            onClick={() => { setLibSearchTerm(''); setLibCategory('All'); setLibDifficulty('All'); }}
            className="mt-6 px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors border border-(--ink-line) bg-(--canvas) hover:bg-(--canvas-tint) text-(--ink)"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  // If embedded in the Workspace tool, just return the main content without Nav/Footer.
  if (isEmbedded) {
    return (
      <>
        <style>{`
          /* Embedded Theme Variables Fallback */
          .embedded-lib-wrapper {
            --canvas: #F5F0E6;
            --canvas-paper: #FCFAF5;
            --canvas-tint: #EFE8DA;
            --ink: #191816;
            --ink-secondary: #4A463F;
            --ink-muted: #7A7468;
            --ink-line: #D9D2C3;
            --ink-line-strong: #191816;
            --cobalt: #2457C5;
            --cobalt-tint: #EBF1FD;
            --teal: #16756F;
            --teal-tint: #E8F4F3;
            --vermilion: #D94F3D;
            --vermilion-tint: #FCEFEA;
            --yellow: #F2C14E;
            --yellow-tint: #FEF9EB;
          }
        `}</style>
        <div className="embedded-lib-wrapper bg-(--canvas) font-sans text-(--ink) w-full">
          {mainContent}
        </div>
      </>
    );
  }

  // Standalone Page Layout
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

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

        body {
          background-color: var(--canvas);
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Hide scrollbar for category filters */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-(--canvas) text-(--ink) selection:bg-(--cobalt) selection:text-white font-sans overflow-x-hidden">
        
        {/* Replaced entire header block with our new component */}
        <LandingNav />

        <main className="grow w-full z-10">
          {mainContent}
        </main>

        {/* ========================================================
            FOOTER
            ======================================================== */}
        <footer className="w-full border-t border-(--ink-line) bg-(--canvas-paper) py-14 px-6" aria-label="Site Footer">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
            
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <img src="/favicon.svg" alt="CodeToAnim Logo" className="w-7 h-7 object-contain" />
                <span className="text-xl font-bold tracking-tight text-(--ink)">
                  CodeTo<span className="text-(--cobalt)">Anim</span>
                </span>
              </Link>
              <p className="text-(--ink-secondary) text-sm max-w-sm leading-relaxed mb-6">
                The visual workspace for developers. Transforming abstract code execution into tactile, visual understanding.
              </p>
            </div>
            
            <div>
              <h4 className="text-(--ink) font-bold mb-4 text-xs font-mono uppercase tracking-wider">Studio</h4>
              <ul className="space-y-2.5 text-(--ink-secondary) text-sm font-medium">
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Visual Workspace</Link></li>
                <li><Link to="/algorithms" className="text-(--cobalt) transition-colors">Algorithms Library</Link></li>
                <li><Link to="/learn" className="hover:text-(--cobalt) transition-colors">Interactive Lessons</Link></li>
                <li><Link to="/profile" className="hover:text-(--cobalt) transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-(--ink) font-bold mb-4 text-xs font-mono uppercase tracking-wider">Concepts</h4>
              <ul className="space-y-2.5 text-(--ink-secondary) text-sm font-medium">
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Arrays &amp; Sorting</Link></li>
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Linked Lists</Link></li>
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Trees &amp; Graphs</Link></li>
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Recursion Call Stacks</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-(--ink) font-bold mb-4 text-xs font-mono uppercase tracking-wider">Community</h4>
              <ul className="space-y-2.5 text-(--ink-secondary) text-sm font-medium">
                <li><a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-(--cobalt) transition-colors">GitHub Repository</a></li>
                <li><a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="hover:text-(--cobalt) transition-colors">Twitter / X</a></li>
                <li><Link to="/about" className="text-(--cobalt) transition-colors">About the Project</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-(--ink-line) text-xs text-(--ink-muted) flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} CodeToAnim Studio. Code is something you can watch, explore, and understand.</p>
          </div>
        </footer>

      </div>
    </>
  );
}