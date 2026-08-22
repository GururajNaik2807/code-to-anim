import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { LESSONS_DATABASE } from '../data/lessonsData';
import { useTheme } from '../context/ThemeContext';

export default function LessonPage() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const { category, topic } = useParams();
  const pathKey = `${category}/${topic}`;
  
  const lesson = LESSONS_DATABASE[pathKey];

  if (!lesson) {
    return <Navigate to="/learn" />;
  }

  const bgMain = isDark ? 'bg-[#090B10]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#121620]' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderCol = isDark ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} font-sans pb-20`}>
      <header className={`h-16 border-b ${borderCol} ${bgCard} flex items-center px-8 sticky top-0 z-20`}>
        <Link to="/learn" className={`flex items-center gap-2 text-sm font-bold ${textSecondary} hover:text-purple-400 transition-colors`}>
          <span>←</span> Back to Learn Hub
        </Link>
      </header>

      <main className="max-w-4xl mx-auto w-full p-8 mt-4">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase">
              {lesson.category}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              Time: {lesson.complexity?.time}
            </span>
          </div>
          
          <h1 className="text-4xl font-black mb-4">{lesson.title}</h1>
          <p className={`text-lg ${textSecondary} leading-relaxed`}>
            {lesson.overview}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* THE FIX IS HERE: The question mark prevents crashes */}
          {lesson.basicConcepts?.map((concept, index) => (
            <section key={index} className={`p-6 rounded-2xl border ${borderCol} ${bgCard} shadow-sm`}>
              <h3 className="text-2xl font-bold text-purple-400 mb-3">{concept.name}</h3>
              <p className={`text-sm ${textSecondary} leading-relaxed mb-6`}>{concept.description}</p>

              {concept.codeSnippet && (
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-800 bg-[#0d1117]">
                  <div className="bg-gray-900/80 px-4 py-2 border-b border-gray-800 flex items-center">
                    <span className="text-xs font-mono text-gray-400">Example Code</span>
                  </div>
                  <pre className="p-4 overflow-x-auto">
                    <code className="text-sm font-mono text-green-400 leading-loose">
                      {concept.codeSnippet}
                    </code>
                  </pre>
                </div>
              )}

              {concept.workspaceContext && lesson.workspaceMetadata?.id && (
                <Link
                  to={`/workspace?lesson=${lesson.workspaceMetadata.id}&step=${concept.workspaceContext.highlightLine}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                >
                  ⚡ Visualize this step in Workspace
                </Link>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}