import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animation variants for staggered, smooth reveals
const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans text-gray-100 selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {/* Header - SEO Semantic */}
      <header className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-gray-800/50 relative z-10">
        <div className="text-2xl font-extrabold tracking-tighter text-white flex items-center gap-2">
          CodeTo<span className="text-purple-500">Anim</span> 🚀
        </div>
        <nav className="flex items-center gap-6" aria-label="Main Navigation">
          <Link 
            to="/auth" 
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/workspace" 
            className="text-sm font-bold bg-white text-black px-4 py-2 rounded-md hover:bg-purple-100 transition-colors shadow-lg shadow-white/10"
          >
            Open Workspace
          </Link>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center relative">
        
        {/* Background Animated Elements */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl -z-10 pointer-events-none"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -z-10 pointer-events-none"
        />

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 max-w-5xl mx-auto z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpVariant} className="inline-block mb-6 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold tracking-wide">
              v1.0 is now live for visual learners
            </motion.div>
            
            <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Don't just read your code.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Watch it come alive.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUpVariant} className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              CodeToAnim accelerates your learning curve by converting Python logic into interactive, step-by-step visual stories. Whether you are debugging complex data analytics pipelines, optimizing automation scripts, or mapping out game state mechanics, master it all visually.
            </motion.p>

            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/workspace">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  Start Visualizing
                </motion.button>
              </Link>
              <Link to="/learn">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg border border-gray-700 transition-all w-full sm:w-auto"
                >
                  Explore Presets 💡
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* What You Will Learn Section (Replaced the backend execution section) */}
        <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUpVariant} className="text-3xl md:text-4xl font-bold text-white mb-4">Master Complex Concepts Visually</motion.h2>
            <motion.p variants={fadeUpVariant} className="text-gray-400 max-w-2xl mx-auto text-lg">
              Stop guessing what happens inside loops and memory. Our interactive canvases let you scrub through your code timeline to build unbreakable mental models.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeUpVariant} whileHover={{ y: -5 }} className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all group">
              <div className="text-blue-400 mb-4 text-3xl transform group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Data Structures</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Watch arrays sort, trees branch out, and linked lists connect in real-time. Visually tracing algorithms makes preparing for technical interviews intuitive and fast.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariant} whileHover={{ y: -5 }} className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all group">
              <div className="text-purple-400 mb-4 text-3xl transform group-hover:scale-110 transition-transform">⚙️</div>
              <h3 className="text-xl font-bold text-white mb-3">Automation & Scripting</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Visualize how your data cleaning scripts mutate dataframes step-by-step. Perfect for catching edge cases before deploying your freelance automation projects.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariant} whileHover={{ y: -5 }} className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-pink-500/50 transition-all group">
              <div className="text-pink-400 mb-4 text-3xl transform group-hover:scale-110 transition-transform">🎮</div>
              <h3 className="text-xl font-bold text-white mb-3">Game Logic Flow</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Map out complex state machines, coordinate systems, and entity movements. See exactly how your conditional logic dictates player actions before testing in-engine.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Account Banner */}
        <section className="w-full py-16 px-6 bg-gradient-to-b from-gray-900 to-gray-950 border-t border-b border-gray-800/50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-12 backdrop-blur-md shadow-2xl relative overflow-hidden"
            >
              {/* Decorative glare */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
              
              <h2 className="text-3xl font-bold text-white mb-4">Build Your Knowledge Library</h2>
              <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
                Sign in to unlock your personal developer dashboard. Save your custom logic, track your learning history, and bookmark the most complex visualizations to review later.
              </p>
              <Link to="/auth">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-lg transition-all shadow-xl"
                >
                  Create a Free Account
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Frequently Asked Questions - SEO Optimized */}
        <section className="py-20 px-6 max-w-4xl mx-auto w-full">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know about learning Python through visual execution.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-6"
          >
            {[
              { q: "What programming languages are supported?", a: "CodeToAnim currently specializes in Python. We instantly translate standard coding structures including Arrays, Linked Lists, Binary Trees, and Graphs directly from your code logic into visual learning modules." },
              { q: "Do I need to install anything?", a: "No installation is required. Our interactive Python visualization environment runs entirely in your browser, allowing you to write, test, and watch code animate instantly." },
              { q: "Is CodeToAnim free to use for algorithm practice?", a: "Yes! CodeToAnim is completely free for individual learning, studying, and algorithm visualization. Creating an account simply unlocks the ability to save your workspace history." }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                variants={fadeUpVariant}
                className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

      </main>

      {/* Footer - SEO Semantic */}
      <footer className="w-full border-t border-gray-800/50 bg-gray-950 py-12 px-6 z-10" aria-label="Site Footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-xl font-extrabold tracking-tighter text-white mb-4">
              CodeTo<span className="text-purple-500">Anim</span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm">
              The premier interactive code visualization platform designed to bridge the gap between abstract programming logic and solid mental models.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/workspace" className="hover:text-purple-400 transition-colors">Interactive Workspace</Link></li>
              <li><Link to="/algorithms" className="hover:text-purple-400 transition-colors">Algorithm Presets</Link></li>
              <li><Link to="/auth" className="hover:text-purple-400 transition-colors">Developer Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">GitHub Community</a></li>
              <li><a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">X (Twitter)</a></li>
              <li><a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">YouTube Tutorials</a></li>
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