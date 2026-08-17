import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LESSONS_DATABASE } from '../data/lessonsData';
import { useTheme } from '../context/ThemeContext';

export default function LessonPage() {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const routeKey = `${category}/${topic}`;
  const lesson = LESSONS_DATABASE[routeKey];

  useEffect(() => {
    if (lesson) {
      document.title = `${lesson.seoTitle} | CodeAnim`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', lesson.seoDescription);
    }
  }, [lesson]);

  const bgMain = isDark ? 'bg-[#090B10]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#121620]' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderCol = isDark ? 'border-gray-800' : 'border-gray-200';

  if (!lesson) {
    return (
      <div className={`min-h-screen ${bgMain} ${textPrimary} flex flex-col items-center justify-center p-8 font-sans`}>
        <h1 className="text-3xl font-extrabold mb-2">Lesson Not Found</h1>
        <p className={`${textSecondary} mb-6`}>The requested topic does not exist in our library.</p>
        <Link to="/learn" className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg">
          Return to Library
        </Link>
      </div>
    );
  }

  const handleStartVisualization = () => {
    navigate('/workspace', {
      state: {
        presetCode: lesson.presetCode,
        metadata: lesson.workspaceMetadata,
        lessonUrl: `/learn/${category}/${topic}`
      }
    });
  };

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} font-sans flex flex-col`}>
      <header className={`h-16 border-b ${borderCol} ${bgCard} px-8 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/30 flex items-center justify-center p-1 hover:scale-105 transition-transform">
            <img src="/favicon.svg" alt="Logo" className="w-full h-full object-contain" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono">
            <Link to="/learn" className={textSecondary}>learn</Link>
            <span className={textSecondary}>/</span>
            <span className="text-purple-400 font-bold">{category}</span>
            <span className={textSecondary}>/</span>
            <span className="font-bold">{topic}</span>
          </div>
        </div>

        <button
          onClick={handleStartVisualization}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
        >
          <span>🚀 Start Visualizing Lesson</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto w-full p-8 flex-1 flex flex-col gap-8">
        <section className={`p-8 rounded-2xl border ${borderCol} ${bgCard} shadow-sm`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              {lesson.category}
            </span>
            <span className={`text-xs font-mono ${textSecondary}`}>
              Time: {lesson.complexity.time} | Space: {lesson.complexity.space}
            </span>
          </div>
          <h1 className="text-3xl font-black mb-3">{lesson.title}</h1>
          <p className={`text-sm ${textSecondary} leading-relaxed`}>{lesson.overview}</p>
        </section>

        <section className="space-y-6">
          {lesson.modules.map((mod) => (
            <article key={mod.id} className={`p-6 rounded-2xl border ${borderCol} ${bgCard} shadow-sm space-y-3`}>
              <h2 className="text-xl font-bold text-purple-400">{mod.title}</h2>
              <p className={`text-sm ${textSecondary} leading-relaxed whitespace-pre-line`}>
                {mod.content}
              </p>
            </article>
          ))}
        </section>

        <section className={`p-6 rounded-2xl border ${borderCol} ${bgCard} space-y-4`}>
          <h3 className="text-lg font-bold">Lesson Python Implementation</h3>
          <pre className={`p-4 rounded-xl border ${borderCol} font-mono text-xs overflow-x-auto ${isDark ? 'bg-gray-950 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
            {lesson.presetCode}
          </pre>
        </section>

        <section className="p-8 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-gray-900 border border-purple-500/40 flex flex-col items-center text-center gap-4 shadow-xl">
          <h3 className="text-2xl font-black">Ready to see this logic step-by-step?</h3>
          <p className={`text-sm ${textSecondary} max-w-lg`}>
            Launch our execution visualizer to trace pointer updates, memory states, and variable values in real-time.
          </p>
          <button
            onClick={handleStartVisualization}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-purple-500/30 transition-all flex items-center gap-2"
          >
            ⚡ Start Visualizing {lesson.title}
          </button>
        </section>
      </main>
    </div>
  );
}