import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans text-gray-100 selection:bg-purple-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-gray-800/50">
        <div className="text-2xl font-extrabold tracking-tighter text-white flex items-center gap-2">
          CodeTo<span className="text-purple-500">Anim</span> 🎬
        </div>
        <div className="flex items-center gap-6">
          {/* Linked Sign In Option */}
          <Link 
            to="/auth" 
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          {/* Corrected path from /app to /workspace */}
          <Link 
            to="/workspace" 
            className="text-sm font-bold bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Open Workspace
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
              v1.0 is now live in the workspace
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Don't just run your code.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Watch it execute.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              CodeToAnim eliminates mental overhead by converting your raw Python logic into playable, step-by-step visual stories in real time. Perfect for debugging and mastering complex data structures.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/workspace">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-purple-500/25 transition-all w-full sm:w-auto"
                >
                  Start Visualizing
                </motion.button>
              </Link>
              <Link to="/learn">
                <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg border border-gray-700 transition-all w-full sm:w-auto">
                  Explore Presets 📚
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        <hr className="w-full border-gray-800/50" />

        {/* Informational / Features Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How CodeToAnim Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We bypass standard simulators by using real Python execution engines to track your exact logic, memory states, and line positions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="text-blue-400 mb-4 text-2xl">📝</div>
              <h3 className="text-xl font-bold text-white mb-3">1. Write Your Logic</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Use our integrated Monaco Editor to write custom Python code. Whether you are implementing Two-Pointers, sorting algorithms, or tree traversals, the engine reads your exact syntax.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="text-purple-400 mb-4 text-2xl">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">2. Trace Execution</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our backend utilizes isolated process pools and <code className="text-pink-400 bg-gray-950 px-1 py-0.5 rounded">sys.settrace()</code> to safely capture variable states and memory snapshots at every single step, ensuring a 3-second timeout limit.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="text-pink-400 mb-4 text-2xl">🎬</div>
              <h3 className="text-xl font-bold text-white mb-3">3. Play The Animation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Data structures physically slide, swap, and highlight on our Framer Motion canvas. Use the playback controls to step backward and forward through your execution timeline.
              </p>
            </div>
          </div>
        </section>

        {/* Account & Save Logic Banner */}
        <section className="w-full py-16 px-6 bg-gradient-to-b from-gray-900 to-gray-950 border-t border-b border-gray-800/50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-10 backdrop-blur-sm"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Never Lose Your Work</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Sign in to unlock your personal developer dashboard. Creating a free account allows you to <strong>save your custom logic</strong>, track your execution history, and bookmark your most complex visualizations to review later.
              </p>
              <Link to="/auth">
                <button className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-lg transition-all">
                  Create an Account
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800/50 bg-gray-950 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-xl font-extrabold tracking-tighter text-white mb-4">
              CodeTo<span className="text-purple-500">Anim</span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm">
              An interactive code visualization platform bridging the gap between abstract programming logic and mental models.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/workspace" className="hover:text-purple-400 transition-colors">Workspace</Link></li>
              <li><Link to="/learn" className="hover:text-purple-400 transition-colors">Presets & Learn</Link></li>
              <li><Link to="/auth" className="hover:text-purple-400 transition-colors">Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">GitHub Repository</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800/50 text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} CodeToAnim. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;