import { useNavigate } from 'react-router-dom';

export default function LandingPage({ onOpenLogin }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      {/* Landing Header */}
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8">
        <div className="text-2xl font-bold tracking-wider">
          Code<span className="text-indigo-500">ToAnim</span>
        </div>
        <button 
          onClick={onOpenLogin}
          className="px-5 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition"
        >
          Login
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto text-center px-6 py-20 flex flex-col items-center gap-8">
        <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-semibold border border-indigo-500/20">
          ✨ Interactive Code Visualization Engine
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Visualize Python execution <br />
          <span className="text-indigo-500">line by line.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          Paste your code, step through every loop and memory mutation, and watch array sorting and data structures animate smoothly in real time.
        </p>

        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/app')}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            Get Started (Launch MVP) 🚀
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-sm text-slate-500">
        Built with FastAPI, React & Framer Motion
      </footer>
    </div>
  );
}