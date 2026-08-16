import React from 'react';
import { Link } from 'react-router-dom'; //[cite: 1]
import { motion } from 'framer-motion'; //[cite: 1]

// Animation Variants for highly kinetic, staggered reveals
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, skewY: 5 },
  visible: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { type: "spring", stiffness: 100, damping: 10 }
  }
};

const LandingPage = () => { //[cite: 1]
  return (
    // Deep black background with radial noise overlay
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans text-gray-100 selection:bg-red-500 selection:text-white overflow-hidden relative">
      
      {/* Background kinetic grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/10 relative z-10">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-2"
        >
          CodeTo<span className="text-red-500">Anim</span> {/*[cite: 1] */}
        </motion.div>
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-6"
        >
          <Link to="/auth" className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
            Sign In {/*[cite: 1] */}
          </Link>
          <Link to="/workspace"> {/*[cite: 1] */}
            <motion.div 
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(239,68,68,0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-bold bg-white text-black px-6 py-2 uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all transform skew-x-[-10deg]"
            >
              <div className="skew-x-[10deg]">Open Workspace</div> {/*[cite: 1] */}
            </motion.div>
          </Link>
        </motion.div>
      </nav>

      <main className="flex-grow flex flex-col items-center relative z-10"> {/*[cite: 1] */}
        
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 max-w-6xl mx-auto"> {/*[cite: 1] */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={itemVariants} className="inline-block mb-6 px-4 py-1 border-l-4 border-red-500 bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-[0.2em]">
              v1.0 is now live in the workspace {/*[cite: 1] */}
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[0.9] uppercase">
              Don't just run <br /> your code. <br /> {/*[cite: 1] */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                Watch it execute. {/*[cite: 1] */}
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto font-medium">
              CodeToAnim eliminates mental overhead by converting your raw Python logic into playable, step-by-step visual stories in real time. Perfect for debugging and mastering complex data structures. {/*[cite: 1] */}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center w-full"> {/*[cite: 1] */}
              <Link to="/workspace" className="w-full sm:w-auto"> {/*[cite: 1] */}
                <motion.button 
                  whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgb(255,255,255)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 px-10 border-b-4 border-red-800 transition-all w-full sm:w-auto transform skew-x-[-10deg]"
                >
                  <span className="block skew-x-[10deg]">Start Visualizing</span> {/*[cite: 1] */}
                </motion.button>
              </Link>
              <Link to="/learn" className="w-full sm:w-auto"> {/*[cite: 1] */}
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent text-white font-black uppercase tracking-widest py-4 px-10 border border-white/20 transition-all w-full sm:w-auto transform skew-x-[-10deg]"
                >
                   <span className="block skew-x-[10deg]">Explore Presets</span> {/*[cite: 1] */}
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* How CodeToAnim Works Section */}
        <section className="py-24 px-6 max-w-7xl mx-auto w-full relative"> {/*[cite: 1] */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">How It Works</h2> {/*[cite: 1] */}
            <div className="w-24 h-1 bg-red-500 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> {/*[cite: 1] */}
            {[
              { step: "01", title: "Write Your Logic", icon: "💻", text: "Use our integrated Monaco Editor to write custom Python code. The engine reads your exact syntax." }, //[cite: 1]
              { step: "02", title: "Trace Execution", icon: "⚡", text: "Our backend utilizes isolated process pools and sys.settrace() to safely capture variable states at every single step." }, //[cite: 1]
              { step: "03", title: "Play The Animation", icon: "🚀", text: "Data structures physically slide, swap, and highlight on our canvas. Step backward and forward through execution." } //[cite: 1]
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                whileHover={{ y: -10, borderColor: "rgba(239,68,68,0.5)", boxShadow: "0 20px 40px -10px rgba(239,68,68,0.2)" }}
                className="bg-white/[0.02] backdrop-blur-lg p-8 border border-white/10 group transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 text-7xl font-black text-white/[0.03] group-hover:text-red-500/10 transition-colors pointer-events-none">
                  {item.step}
                </div>
                <div className="text-red-500 mb-6 text-4xl drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">{item.icon}</div>
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wide">{item.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed font-medium">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Account Banner */}
        <section className="w-full py-24 px-6 bg-red-600 border-t border-b border-red-500 relative overflow-hidden"> {/*[cite: 1] */}
          {/* Glitch/Speed lines background effect */}
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10"> {/*[cite: 1] */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring" }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">Never Lose Your Work</h2> {/*[cite: 1] */}
              <p className="text-white/90 mb-10 text-xl font-medium max-w-2xl mx-auto">
                Sign in to unlock your personal dashboard. Save logic, track execution history, and bookmark complex visualizations. {/*[cite: 1] */}
              </p>
              <Link to="/auth"> {/*[cite: 1] */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#09090b] text-white hover:bg-black font-black uppercase tracking-widest py-4 px-12 border border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[5px] hover:translate-y-[5px] transition-all"
                >
                  Create an Account {/*[cite: 1] */}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="py-24 px-6 max-w-5xl mx-auto w-full"> {/*[cite: 1] */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">FAQ</h2> {/*[cite: 1] */}
            <div className="w-16 h-1 bg-red-500 mx-auto mb-6"></div>
          </div>

          <div className="space-y-6"> {/*[cite: 1] */}
            {[
              {
                q: "What programming languages are supported?", //[cite: 1]
                a: "CodeToAnim currently specializes in Python execution tracing. We capture standard data structures including Arrays, Linked Lists, Binary Trees, and Graphs directly from your code logic without extra manual setup." //[cite: 1]
              },
              {
                q: "How does real-time visualization work?", //[cite: 1]
                a: "When you submit code in our workspace, our backend traces system calls step-by-step. Each frame captures pointer modifications, variable updates, and memory states, translating them directly into smooth React canvas animations." //[cite: 1]
              },
              {
                q: "Is CodeToAnim free to use for algorithm practice?", //[cite: 1]
                a: "Yes! CodeToAnim is completely free for individual learning, teaching, and algorithm debugging. Creating an account unlocks custom code saving and personal workspace history." //[cite: 1]
              }
            ].map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-transparent p-6 border-l-4 border-white/20 hover:border-red-500 hover:bg-white/[0.02] transition-all group"
              >
                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wide group-hover:text-red-400 transition-colors">{faq.q}</h3>
                <p className="text-gray-400 text-base leading-relaxed font-medium">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#060608] py-16 px-6 relative z-10"> {/*[cite: 1] */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12"> {/*[cite: 1] */}
          <div className="md:col-span-2">
            <div className="text-3xl font-black tracking-tighter text-white uppercase italic mb-6">
              CodeTo<span className="text-red-500">Anim</span> {/*[cite: 1] */}
            </div>
            <p className="text-gray-500 text-base font-medium max-w-sm">
              An interactive code visualization platform bridging the gap between abstract programming logic and mental models. {/*[cite: 1] */}
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-6 border-b border-red-500/30 pb-2 inline-block">Product</h4> {/*[cite: 1] */}
            <ul className="space-y-4 text-sm text-gray-500 font-bold uppercase tracking-wider">
              <li><Link to="/workspace" className="hover:text-red-500 transition-colors">Workspace</Link></li> {/*[cite: 1] */}
              <li><Link to="/learn" className="hover:text-red-500 transition-colors">Presets & Learn</Link></li> {/*[cite: 1] */}
              <li><Link to="/auth" className="hover:text-red-500 transition-colors">Account</Link></li> {/*[cite: 1] */}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-6 border-b border-red-500/30 pb-2 inline-block">Connect</h4> {/*[cite: 1] */}
            <ul className="space-y-4 text-sm text-gray-500 font-bold uppercase tracking-wider">
              <li><a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">GitHub</a></li> {/*[cite: 1] */}
              <li><a href="https://x.com/your-handle" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">X (Twitter)</a></li> {/*[cite: 1] */}
              <li><a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">LinkedIn</a></li> {/*[cite: 1] */}
              <li><a href="https://youtube.com/@your-channel" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">YouTube</a></li> {/*[cite: 1] */}
              <li><a href="https://instagram.com/your-handle" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">Instagram</a></li> {/*[cite: 1] */}
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 text-xs text-gray-600 font-black uppercase tracking-widest flex flex-col md:flex-row justify-between items-center"> {/*[cite: 1] */}
          <p>© {new Date().getFullYear()} CodeToAnim. All rights reserved.</p> {/*[cite: 1] */}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; //[cite: 1]