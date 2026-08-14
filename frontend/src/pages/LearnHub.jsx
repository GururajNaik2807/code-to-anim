import React from 'react';
import { Link } from 'react-router-dom';

export default function LearnHub() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col">
      <header className="h-16 border-b bg-gray-900 border-gray-800 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-3xl" title="Home">🎬</Link>
          <h1 className="text-xl font-extrabold">Code<span className="text-purple-500">Anim</span> Learn Hub</h1>
        </div>
        <div className="text-sm text-gray-400">Data Structures · In Development</div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full bg-gradient-to-br from-gray-900/70 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">🚧 Learn Hub — Coming Soon</h2>
          <p className="text-gray-400 mb-6">A dedicated space to learn Data Structures (Linked Lists, Trees, Graphs) with interactive lessons, quizzes, and guided visualizations. We're building this feature with care — check back soon.</p>

          <div className="flex justify-center gap-4">
            <Link to="/algorithms" className="px-5 py-3 bg-purple-600 hover:bg-purple-500 rounded-md text-white font-bold">Explore Algorithm Library</Link>
            <a className="px-5 py-3 bg-gray-800 rounded-md text-gray-300" href="#" onClick={(e)=>e.preventDefault()}>Notify me</a>
          </div>

          <div className="mt-8 text-sm text-gray-500">Want to help build the curriculum? Reach out via the community links in the footer.</div>
        </div>
      </main>
    </div>
  );
}
