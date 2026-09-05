import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingNav from '../components/LandingNav';

const easeCurve = [0.19, 1, 0.22, 1];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: easeCurve } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&family=Caveat:wght@400..700&display=swap');

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
          --coffee: #3E2B21;

          --editor-bg: #14171E;
          --editor-surface: #1B202A;
          --editor-border: rgba(255, 255, 255, 0.09);
        }

        body {
          background-color: var(--canvas);
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          scrollbar-gutter: stable;
        }

        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, var(--ink-line) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--ink-line) 1px, transparent 1px);
          mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-(--canvas) text-(--ink) selection:bg-(--cobalt) selection:text-white font-sans relative">
        
        {/* FIX: Removed the blurry wrapper div */}
        <LandingNav />

        <main className="grow flex flex-col items-center w-full z-10 overflow-x-hidden">
          
          <section className="relative w-full px-6 pt-24 pb-20 text-center sm:text-left flex flex-col items-center">
            <div className="absolute inset-0 z-0 bg-grid-pattern opacity-60 pointer-events-none"></div>

            <div className="max-w-[800px] mx-auto w-full relative z-10">
              <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={staggerContainer}
                className="flex flex-col items-center sm:items-start"
              >
                <motion.div variants={fadeUpVariant} className="text-xs font-mono font-semibold uppercase tracking-wider text-(--ink-muted) mb-6">
                  About The Project
                </motion.div>
                <motion.h1 variants={fadeUpVariant} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-(--ink) mb-8 tracking-tight leading-[1.05]">
                  Stop compiling code in <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-(--vermilion) to-(--yellow)">your head.</span>
                </motion.h1>
                <motion.p variants={fadeUpVariant} className="text-lg sm:text-xl text-(--ink-secondary) leading-relaxed mb-6 font-normal">
                  Computer science is taught backwards. We give students static text files and expect them to mentally simulate dynamic, stateful machines. 
                </motion.p>
                <motion.p variants={fadeUpVariant} className="text-lg sm:text-xl text-(--ink-secondary) leading-relaxed font-normal">
                  CodeToAnim was built to bridge the gap between syntax and spatial memory. It’s a tool for developers, students, and educators to finally see what their memory addresses, pointers, and recursive branches are actually doing.
                </motion.p>
              </motion.div>
            </div>
          </section>

          <section className="w-full py-20 bg-(--canvas-paper) border-y border-(--ink-line)">
            <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-8 items-stretch">
              
              <div className="p-8 sm:p-10 rounded-xl bg-(--canvas) border border-(--ink-line) flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                <div>
                  <div className="font-mono text-xs font-bold text-(--ink-muted) mb-4 tracking-wider">THE OLD WAY</div>
                  <h3 className="text-2xl font-bold text-(--ink) mb-4">Print Statement Hell</h3>
                  <p className="text-(--ink-secondary) leading-relaxed mb-8">
                    Trying to understand a dynamic programming matrix or a graph traversal algorithm by littering your code with <code>print("here 1")</code> and <code>print(curr.val)</code> is an exercise in misery. You end up parsing console logs instead of understanding the logic.
                  </p>
                  <div className="bg-(--editor-bg) rounded-lg p-5 font-mono text-xs text-gray-400 space-y-2 border border-(--ink-line) shadow-inner">
                    <div className="text-gray-500">print(f"Entering loop: i=&#123;i&#125;, j=&#123;j&#125;")</div>
                    <div className="text-gray-500">print(f"Current array: &#123;arr&#125;")</div>
                    <div className="text-[#FF7B72] mt-4">IndexError: list index out of range</div>
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-10 rounded-xl bg-(--cobalt-tint) border border-(--cobalt) flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 shadow-lg">
                <div>
                  <div className="font-mono text-xs font-bold text-(--cobalt) mb-4 tracking-wider">THE CODETOANIM WAY</div>
                  <h3 className="text-2xl font-bold text-(--ink) mb-4">Visual State Tracking</h3>
                  <p className="text-(--ink-secondary) leading-relaxed mb-8">
                    We parse your Python AST (Abstract Syntax Tree) and trace state changes frame by frame. You get a scrubbable timeline of your code's execution, allowing you to step exactly to the point where your logic breaks.
                  </p>
                  <div className="bg-white rounded-lg p-5 border border-(--cobalt) flex flex-col justify-center gap-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-mono text-(--cobalt-dark)">
                      <span>FRAME 42 / 128</span>
                      <span className="font-bold bg-(--cobalt-tint) px-2 py-1 rounded">arr[j] &gt; pivot</span>
                    </div>
                    <div className="w-full h-2 bg-(--canvas) rounded-full overflow-hidden border border-(--ink-line)">
                      <div className="h-full bg-(--cobalt) w-1/3 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <section className="w-full px-6 py-28 max-w-[800px] mx-auto text-left relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-(--ink) mb-12 tracking-tight">Our Philosophy</h2>
            
            <div className="space-y-12 relative z-10">
              <div className="relative pl-8 sm:pl-12">
                <span className="absolute left-0 top-1 text-(--teal) font-mono text-sm font-bold">01.</span>
                <h4 className="text-xl font-bold text-(--ink) mb-3">
                  Transparency over Magic
                </h4>
                <p className="text-lg text-(--ink-secondary) leading-relaxed">
                  We don't abstract the code away. CodeToAnim executes real Python logic. If your code has an infinite loop, the visualizer will show you exactly where and why you're stuck.
                </p>
              </div>
              
              <div className="relative pl-8 sm:pl-12">
                <span className="absolute left-0 top-1 text-(--yellow) font-mono text-sm font-bold">02.</span>
                <h4 className="text-xl font-bold text-(--ink) mb-3">
                  Built for Edge Cases
                </h4>
                <p className="text-lg text-(--ink-secondary) leading-relaxed">
                  Understanding the "happy path" of an algorithm is easy. True mastery comes from seeing how a binary tree handles a severely unbalanced input, or how quicksort behaves on an already-sorted array. We let you input custom data to test these boundaries.
                </p>
              </div>

              <div className="relative pl-8 sm:pl-12">
                <span className="absolute left-0 top-1 text-(--vermilion) font-mono text-sm font-bold">03.</span>
                <h4 className="text-xl font-bold text-(--ink) mb-3">
                  Tooling for Developers
                </h4>
                <p className="text-lg text-(--ink-secondary) leading-relaxed">
                  We use the dark-mode editor you're used to, keyboard shortcuts you expect, and accurate terminology. This isn't a toy app for kids; it's a runtime visualizer for serious programmers.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full py-24 px-6 bg-(--cobalt) text-white text-center border-t border-(--ink-line-strong) relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-(--teal) opacity-50 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-(--vermilion) opacity-40 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-2xl mx-auto relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight leading-tight">Ready to see your code?</h2>
              <p className="text-white/80 text-lg sm:text-xl mb-10 font-normal">
                Jump into the workspace, write some Python, and watch the execution unfold.
              </p>
              <Link to="/workspace">
                <button className="bg-(--yellow) hover:bg-[#E5B540] text-(--ink) font-bold py-4 px-10 rounded-lg transition-transform hover:-translate-y-1 text-base shadow-[0_10px_30px_rgba(242,193,78,0.3)]">
                  Open the Workspace →
                </button>
              </Link>
            </div>
          </section>

        </main>

        <footer className="w-full border-t border-(--ink-line) bg-(--canvas-paper) py-14 px-6" aria-label="Site Footer">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
            
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <span className="text-xl font-bold tracking-tight text-(--ink)">
                  CodeTo<span className="text-(--cobalt)">Anim</span>
                </span>
              </Link>
              <p className="text-(--ink-secondary) text-sm max-w-sm leading-relaxed mb-6">
                The visual workspace for developers. Transforming abstract code execution into tactile, visual understanding.
              </p>
            </div>
            
            <div>
              <h4 className="text-(--ink) font-bold mb-4 text-xs font-mono uppercase tracking-wider">Studio</h4>
              <ul className="space-y-2.5 text-(--ink-secondary) text-sm font-medium">
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Visual Workspace</Link></li>
                <li><Link to="/algorithms" className="hover:text-(--cobalt) transition-colors">Algorithms Library</Link></li>
                <li><Link to="/learn" className="hover:text-(--cobalt) transition-colors">Interactive Lessons</Link></li>
                <li><Link to="/profile" className="hover:text-(--cobalt) transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-(--ink) font-bold mb-4 text-xs font-mono uppercase tracking-wider">Concepts</h4>
              <ul className="space-y-2.5 text-(--ink-secondary) text-sm font-medium">
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Arrays &amp; Sorting</Link></li>
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Linked Lists</Link></li>
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Trees &amp; Graphs</Link></li>
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Recursion Call Stacks</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-(--ink-line) text-xs text-(--ink-muted) flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} CodeToAnim Studio. Code is something you can watch, explore, and understand.</p>
          </div>
        </footer>

      </div>
    </>
  );
};

export default About;