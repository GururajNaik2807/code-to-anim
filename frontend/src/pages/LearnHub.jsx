import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LESSONS_DATABASE } from '../data/lessonsData';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function LearnHub() {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const isDark = currentTheme === 'dark';

  const [completedLessons, setCompletedLessons] = useState(new Set());

  // Fetch completed lessons
  useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_progress')
          .select('algorithm_id')
          .eq('user_id', user.id)
          .eq('progress_percent', 100);
          
        if (data) {
          setCompletedLessons(new Set(data.map(d => d.algorithm_id)));
        }
      }
    };
    fetchProgress();
  }, [user]);

  // Helper icons and metadata for rendering cards
  const CARD_ICONS = {
    'data-structures/array': '📊',
    'data-structures/linked-list': '🔗',
    'data-structures/stack': '🥞',
    'data-structures/queue': '🚶‍♂️',
    'data-structures/tree': '🌲',
    'data-structures/binary-tree': '🌿',
    'data-structures/graph': '🕸️',
    'algorithms/binary-search': '🔍',
    'algorithms/bubble-sort': '🫧',
    'algorithms/merge-sort': '🧩',
  };

  // Convert LESSONS_DATABASE keys into array items
  const lessons = Object.keys(LESSONS_DATABASE).map((pathKey) => ({
    pathKey,
    routePath: `/learn/${pathKey}`,
    icon: CARD_ICONS[pathKey] || '📚',
    ...LESSONS_DATABASE[pathKey],
  }));

  // Group lessons by Data Structures vs Algorithms
  const dataStructures = lessons.filter((item) => item.category === 'Data Structures');
  const algorithms = lessons.filter((item) => item.category === 'Algorithms');

  const bgMain = isDark ? 'bg-[#090B10]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#121620]' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderCol = isDark ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} font-sans flex flex-col`}>
      {/* Top Header */}
      <header className={`h-16 border-b ${borderCol} ${bgCard} flex items-center justify-between px-8 sticky top-0 z-20`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/30 flex items-center justify-center p-1 hover:scale-105 transition-transform">
            <img src="/favicon.svg" alt="Logo" className="w-full h-full object-contain" />
          </Link>
          <h1 className="text-lg font-extrabold tracking-tight">
            Code<span className="text-purple-400">Anim</span> Learn Hub
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/workspace" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all">
            ⚡ Workspace
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full p-8 flex-1 flex flex-col gap-10">
        
        {/* Banner Section */}
        <section className={`p-8 rounded-2xl border ${borderCol} ${bgCard} shadow-sm text-center max-w-3xl mx-auto`}>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            Interactive Curriculum
          </span>
          <h2 className="text-3xl font-black mt-3 mb-2">Master Data Structures & Algorithms</h2>
          <p className={`text-sm ${textSecondary} leading-relaxed`}>
            Select a topic to read documentation-style lessons and step through real-time code executions.
          </p>
        </section>

        {/* Data Structures Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-purple-400">Data Structures</h3>
            <span className={`text-xs ${textSecondary} font-mono`}>({dataStructures.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataStructures.map((item) => {
              const isCompleted = completedLessons.has(item.workspaceMetadata?.id);
              return (
                <Link
                  key={item.pathKey}
                  to={item.routePath}
                  className={`p-6 rounded-2xl border ${borderCol} ${bgCard} hover:border-purple-500/80 transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex gap-2">
                        {isCompleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center">
                            ✅ DONE
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          {item.complexity.time.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h4>
                    
                    <p className={`text-xs ${textSecondary} mt-2 line-clamp-2 leading-relaxed`}>
                      {item.overview}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800/50 flex justify-between items-center text-xs text-purple-400 font-semibold">
                    <span>Read Lesson</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Algorithms Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-indigo-400">Algorithms</h3>
            <span className={`text-xs ${textSecondary} font-mono`}>({algorithms.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {algorithms.map((item) => {
              const isCompleted = completedLessons.has(item.workspaceMetadata?.id);
              return (
                <Link
                  key={item.pathKey}
                  to={item.routePath}
                  className={`p-6 rounded-2xl border ${borderCol} ${bgCard} hover:border-indigo-500/80 transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex gap-2">
                        {isCompleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center">
                            ✅ DONE
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          {item.complexity.time}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                    
                    <p className={`text-xs ${textSecondary} mt-2 line-clamp-2 leading-relaxed`}>
                      {item.overview}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800/50 flex justify-between items-center text-xs text-indigo-400 font-semibold">
                    <span>Read Lesson</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}