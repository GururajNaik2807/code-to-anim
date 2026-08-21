import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Optimized animation variants
const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

// Particle Background Component (Responsive)
// Particle Background Component (Responsive) - 3 Color Palette
const FloatingParticles = ({ isMobile }) => {
  // Particles increased 5x (40 for mobile, 175 for desktop)
  const particleCount = isMobile ? 40 : 175; 

  // Define a 3-color palette (purple, cyan, pink)
  const particleColors = [
    "#A855F7", // Purple
    "#39FF14", // Cyan
    "#EC4899"  // Pink
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(particleCount)].map((_, i) => {
        const size = Math.random() * (isMobile ? 3 : 6) + 2;
        
        // Pick a color from the 3-color palette for each particle
        const color = particleColors[i % particleColors.length];

        return (
          <motion.div
            key={i}
            // Removed gradient class, color is applied in style
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color, // Applied the selected color
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -300 - 100],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, Math.random() * 0.5 + 0.2, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + (isMobile ? 8 : 5),
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        );
      })}
    </div>
  );
};

const LandingPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Force scroll to top on page refresh/mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Detect screen size for performance-based animation rendering
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    // ... rest of your existing JSX remains exactly the same ...
    <div className="min-h-screen bg-[#030014] flex flex-col font-sans text-gray-100 selection:bg-purple-500/50 selection:text-white overflow-hidden relative">
      
      {/* Dynamic Background Effects - Scaled based on device */}
      <FloatingParticles isMobile={isMobile} />
      
      <AnimatePresence>
        {!isMobile && (
          <>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/20 rounded-full blur-[120px] -z-10 pointer-events-none"
            />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/20 rounded-full blur-[120px] -z-10 pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

{/* Header - Semantic & SEO Friendly */}
      <header className="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        
        <Link to="/" className="text-2xl font-extrabold tracking-tighter text-white flex items-center gap-3 z-10 group">
          {/* Your SVG Logo */}
          <img 
            src="/favicon.svg" 
            alt="CodeToAnim Logo" 
            className="w-8 h-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" 
          />
          
          <div>
            CodeTo<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 group-hover:from-blue-400 group-hover:to-purple-500 transition-all duration-500">Anim</span> 
          </div>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 z-10" aria-label="Main Navigation">
          <Link 
            to="/auth" 
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <Link 
            to="/workspace" 
            className="relative group px-5 py-2.5 rounded-lg font-bold text-sm bg-white/10 text-white border border-white/10 overflow-hidden"
          >
            <span className="relative z-10">Open Workspace</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
          </Link>
        </nav>
      </header>
      <main className="flex-grow flex flex-col items-center w-full z-10">
        
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative w-full">
            
            <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              v1.1 is now live for visual learners
            </motion.div>
            
            <motion.h1 
              variants={fadeUpVariant} 
              className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[1.1]"
            >
              Don't just read code.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x">
                Watch it alive.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUpVariant} className="text-lg md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              CodeToAnim accelerates your learning curve by converting Python logic into interactive, step-by-step visual stories. Master logic visually.
            </motion.p>

            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto px-4">
              <Link to="/workspace" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(168,85,247,0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 text-white font-bold py-4 px-10 rounded-xl transition-all w-full flex items-center justify-center gap-3 text-lg"
                >
                  Start Visualizing
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </motion.button>
              </Link>
              <Link to="/learn" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent backdrop-blur-sm text-white font-bold py-4 px-10 rounded-xl border border-white/20 transition-all w-full text-lg"
                >
                  Explore Presets 💡
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-24 px-6 w-full max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer} className="text-center mb-20"
          >
            <motion.h2 variants={fadeUpVariant} className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Master Complex Concepts
            </motion.h2>
            <motion.p variants={fadeUpVariant} className="text-gray-400 max-w-2xl mx-auto text-xl font-light">
              Stop guessing what happens inside memory. Our interactive canvases let you scrub through your code timeline.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: "📊", title: "Data Structures", desc: "Watch arrays sort, trees branch out, and linked lists connect in real-time.", color: "from-blue-500/20 to-blue-900/20", border: "hover:border-blue-500/50" },
              { icon: "⚙️", title: "Automation", desc: "Visualize how your scripts mutate data step-by-step. Perfect for catching edge cases.", color: "from-purple-500/20 to-purple-900/20", border: "hover:border-purple-500/50" },
              { icon: "🎮", title: "Game Logic", desc: "Map out complex state machines and coordinate systems before testing in-engine.", color: "from-pink-500/20 to-pink-900/20", border: "hover:border-pink-500/50" }
            ].map((feature, idx) => (
              <motion.article 
                key={idx} variants={fadeUpVariant} 
                whileHover={!isMobile ? { y: -10, scale: 1.02 } : {}}
                className={`bg-gradient-to-b ${feature.color} backdrop-blur-xl p-10 rounded-3xl border border-white/5 ${feature.border} transition-all duration-300 group`}
              >
                <div className="text-4xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 origin-bottom-left">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-light">{feature.desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-black to-blue-900/20 z-0" />
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }} viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 md:p-20 backdrop-blur-2xl shadow-2xl overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Build Your Library</h2>
              <p className="text-gray-300 mb-10 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                Unlock your personal developer dashboard. Save custom logic, track history, and bookmark complex visualizations.
              </p>
              <Link to="/auth">
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="bg-white text-black hover:bg-gray-200 font-extrabold py-4 px-12 rounded-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] text-lg"
                >
                  Create Free Account
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 max-w-4xl mx-auto w-full">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer} className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer} className="space-y-4"
          >
            {[
              { q: "What programming languages are supported?", a: "CodeToAnim currently specializes in Python. We instantly translate standard coding structures directly from your code logic." },
              { q: "Do I need to install anything?", a: "No installation is required. Runs entirely in your browser, allowing you to write, test, and watch code animate instantly." },
              { q: "Is CodeToAnim free to use?", a: "Yes! Completely free for individual learning for now. Creating an account simply unlocks the ability to save your workspace history." }
            ].map((faq, index) => (
              <motion.article 
                key={index} variants={fadeUpVariant}
                className="bg-white/5 p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-gray-400 leading-relaxed font-light">{faq.a}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

      </main>

      {/* Semantic Footer */}
      <footer className="w-full border-t border-white/10 bg-[#02000a] py-16 px-6 z-10" aria-label="Site Footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="text-2xl font-black tracking-tighter text-white mb-6">
              CodeTo<span className="text-purple-500">Anim</span>
            </div>
            <p className="text-gray-500 text-base max-w-sm font-light leading-relaxed">
              The premier interactive code visualization platform designed to bridge the gap between abstract logic and solid mental models.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
            <ul className="space-y-4 text-gray-500 font-light">
              <li><Link to="/workspace" className="hover:text-purple-400 transition-colors">Interactive Workspace</Link></li>
              <li><Link to="/algorithms" className="hover:text-purple-400 transition-colors">Algorithm Presets</Link></li>
              <li><Link to="/auth" className="hover:text-purple-400 transition-colors">Developer Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Connect</h4>
            <ul className="space-y-4 text-gray-500 font-light">
              <li><a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">GitHub Community</a></li>
              <li><a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">X (Twitter)</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 text-sm text-gray-600 font-light flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} CodeToAnim. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;