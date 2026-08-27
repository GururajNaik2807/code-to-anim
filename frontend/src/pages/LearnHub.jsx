import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LESSONS_DATABASE } from '../data/lessonsData';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import LandingNav from '../components/LandingNav'; // Import unified Nav

export default function LearnHub() {
  const { user } = useAuth();
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

  return (
    <>
      <Helmet>
        <title>Learn Hub | CodeToAnim</title>
        <meta name="description" content="Master Data Structures and Algorithms with interactive, visual lessons." />
      </Helmet>

      {/* Global Theme Injection */}
      <style>{`
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
      `}</style>

      <div className="min-h-screen bg-(--canvas) text-(--ink) font-sans flex flex-col selection:bg-(--cobalt) selection:text-white overflow-x-hidden">
        
        {/* --- ONE SINGLE GLOBAL NAV COMPONENT --- */}
        <LandingNav />

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto w-full px-6 py-12 grow flex flex-col gap-16">
          
          {/* Banner Section */}
          <section className="p-8 sm:p-12 rounded-xl border border-(--ink-line-strong) bg-(--canvas-paper) shadow-sm text-center max-w-4xl mx-auto flex flex-col items-center">
            <span className="px-3 py-1 rounded-md bg-(--cobalt-tint) text-(--cobalt) text-[10px] font-bold border border-(--cobalt)/30 font-mono uppercase tracking-wider mb-4">
              Interactive Curriculum
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-(--ink) mb-4">
              Master Data Structures <br className="hidden sm:block" />
              & <span className="text-(--cobalt)">Algorithms</span>
            </h1>
            <p className="text-base sm:text-lg text-(--ink-secondary) leading-relaxed max-w-2xl font-medium">
              Select a topic to read comprehensive lessons and step through real-time code executions in the visual workspace.
            </p>
          </section>

          {/* Data Structures Section */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-b border-(--ink-line) pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-(--ink) tracking-tight">Data Structures</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-(--canvas-dark) text-(--ink-muted) text-xs font-mono font-bold">
                {dataStructures.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataStructures.map((item) => {
                const isCompleted = completedLessons.has(item.workspaceMetadata?.id);
                return (
                  <Link
                    key={item.pathKey}
                    to={item.routePath}
                    className="p-6 sm:p-8 rounded-xl border border-(--ink-line) bg-(--canvas-paper) hover:border-(--cobalt) transition-all duration-300 group flex flex-col justify-between hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-4xl drop-shadow-sm">{item.icon}</span>
                        <div className="flex gap-2 flex-col items-end sm:flex-row sm:items-center">
                          {isCompleted && (
                            <span className="text-[10px] px-2 py-1 rounded-md bg-(--teal-tint) text-(--teal) font-bold border border-(--teal)/30 flex items-center font-mono">
                              ✅ DONE
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-1 rounded-md bg-(--canvas-tint) text-(--ink-secondary) font-bold border border-(--ink-line) font-mono">
                            {item.complexity.time.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-bold text-(--ink) group-hover:text-(--cobalt) transition-colors mb-3 tracking-tight">
                        {item.title}
                      </h4>
                      
                      <p className="text-sm text-(--ink-secondary) line-clamp-3 leading-relaxed font-medium">
                        {item.overview}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-(--ink-line) flex justify-between items-center text-xs font-bold text-(--ink) group-hover:text-(--cobalt) transition-colors">
                      <span>Begin Lesson</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Algorithms Section */}
          <section className="pb-16">
            <div className="flex items-center gap-3 mb-8 border-b border-(--ink-line) pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-(--ink) tracking-tight">Algorithms</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-(--canvas-dark) text-(--ink-muted) text-xs font-mono font-bold">
                {algorithms.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {algorithms.map((item) => {
                const isCompleted = completedLessons.has(item.workspaceMetadata?.id);
                return (
                  <Link
                    key={item.pathKey}
                    to={item.routePath}
                    className="p-6 sm:p-8 rounded-xl border border-(--ink-line) bg-(--canvas-paper) hover:border-(--vermilion) transition-all duration-300 group flex flex-col justify-between hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-4xl drop-shadow-sm">{item.icon}</span>
                        <div className="flex gap-2 flex-col items-end sm:flex-row sm:items-center">
                          {isCompleted && (
                            <span className="text-[10px] px-2 py-1 rounded-md bg-(--teal-tint) text-(--teal) font-bold border border-(--teal)/30 flex items-center font-mono">
                              ✅ DONE
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-1 rounded-md bg-(--canvas-tint) text-(--ink-secondary) font-bold border border-(--ink-line) font-mono">
                            {item.complexity.time}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-bold text-(--ink) group-hover:text-(--vermilion) transition-colors mb-3 tracking-tight">
                        {item.title}
                      </h4>
                      
                      <p className="text-sm text-(--ink-secondary) line-clamp-3 leading-relaxed font-medium">
                        {item.overview}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-(--ink-line) flex justify-between items-center text-xs font-bold text-(--ink) group-hover:text-(--vermilion) transition-colors">
                      <span>Begin Lesson</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="w-full border-t border-(--ink-line) bg-(--canvas-paper) py-12 px-6" aria-label="Site Footer">
          <div className="max-w-7xl mx-auto text-xs text-(--ink-muted) flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} CodeToAnim Studio. Built for visual learners.</p>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-(--cobalt) transition-colors">About</Link>
              <Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Workspace</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}