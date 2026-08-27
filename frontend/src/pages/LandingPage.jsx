import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LandingNav from '../components/LandingNav'; // Import the unified Nav

// Refined editorial motion variants
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
    transition: { staggerChildren: 0.1 }
  }
};

const LandingPage = () => {
  const { user } = useAuth();
  
  // Interactive Live Algorithm State for Signature Demo
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Simple step ticker for algorithm demo
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev >= 3 ? 0 : prev + 1));
      }, 2000); 
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Corrected, mathematically accurate state traces for Bubble Sort
  const demoStates = {
    bubble: [
      { arr: [8, 3, 5, 12], j: 0, codeLine: 4, note: "Comparing index 0 (8) and index 1 (3). Since 8 > 3, swap required." },
      { arr: [3, 8, 5, 12], j: 1, codeLine: 4, note: "Comparing index 1 (8) and index 2 (5). Since 8 > 5, swap required." },
      { arr: [3, 5, 8, 12], j: 2, codeLine: 4, note: "Comparing index 2 (8) and index 3 (12). Since 8 < 12, condition False." },
      { arr: [3, 5, 8, 12], j: -1, codeLine: 1, note: "Pass complete. Element 12 placed in final position." }
    ]
  };

  const currentBubbleState = demoStates.bubble[stepIndex % demoStates.bubble.length];

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
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <div className="min-h-screen flex flex-col selection:bg-(--cobalt) selection:text-white relative overflow-x-hidden">
        
        {/* --- ONE SINGLE GLOBAL NAV COMPONENT --- */}
        <LandingNav />

        <main className="grow flex flex-col items-center w-full z-10">
          
          {/* SECTION 1: HERO */}
          <section className="w-full px-6 pt-16 pb-24 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer} 
              className="lg:col-span-6 flex flex-col items-start text-left relative"
            >
              <motion.h1 
                variants={fadeUpVariant} 
                className="text-5xl sm:text-6xl lg:text-[68px] font-bold text-(--ink) mb-6 tracking-tight leading-[1.05]"
              >
                Step through your Python code <br />
                <span className="text-(--cobalt)">in real-time.</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeUpVariant} 
                className="text-lg md:text-xl text-(--ink-secondary) mb-8 max-w-xl leading-relaxed font-normal"
              >
                Stop using print statements to track off-by-one errors and nested loops. Trace dynamic programming states, memory allocations, and recursion trees visually.
              </motion.p>

              <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link to={user ? "/profile" : "/workspace"} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-(--cobalt) hover:bg-(--cobalt-dark) text-white font-medium py-3.5 px-8 rounded-lg transition-all shadow-md flex items-center justify-center gap-3 text-base">
                    <span>Start Visualizing</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </Link>

                <Link to="/about" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-transparent text-(--ink) hover:bg-(--canvas-paper) font-medium py-3.5 px-6 rounded-lg border border-(--ink-line) transition-all flex items-center justify-center gap-2 text-base">
                    <span>How it works</span>
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.15, ease: easeCurve }}
              className="lg:col-span-6 relative"
            >
              <div className="bg-(--canvas-paper) border border-(--ink-line-strong) rounded-xl overflow-hidden shadow-2xl flex flex-col">
                <div className="bg-(--canvas-tint) px-4 py-3 border-b border-(--ink-line) flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#E5E5E5] border border-(--ink-line-strong)"></span>
                    <span className="w-3 h-3 rounded-full bg-[#E5E5E5] border border-(--ink-line-strong)"></span>
                    <span className="w-3 h-3 rounded-full bg-[#E5E5E5] border border-(--ink-line-strong)"></span>
                    <span className="ml-3 font-mono text-xs font-semibold text-(--ink-secondary) tracking-tight">
                      workspace.py
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-(--canvas-paper) border border-(--ink-line) px-2.5 py-0.5 rounded text-(--cobalt) font-medium">
                    STEP {stepIndex + 1} / 4
                  </span>
                </div>

                <div className="grid sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-(--ink-line)">
                  <div className="sm:col-span-5 bg-(--editor-bg) p-4 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto">
                    <div className="text-(--ink-muted) opacity-60 mb-2"># Bubble Sort</div>
                    <div className={`${currentBubbleState.codeLine === 1 ? 'bg-white/10 text-white -mx-2 px-2 py-0.5 rounded border-l-2 border-(--cobalt)' : ''}`}>
                      <span className="text-[#FF7B72]">def</span> <span className="text-[#79C0FF]">bubble</span>(arr):
                    </div>
                    <div className="pl-3">
                      <span className="text-[#FF7B72]">n</span> = <span className="text-[#79C0FF]">len</span>(arr)
                    </div>
                    <div className={`pl-3 ${currentBubbleState.codeLine === 3 ? 'bg-white/10 text-white -mx-2 px-2 py-0.5 rounded border-l-2 border-(--yellow)' : ''}`}>
                      <span className="text-[#FF7B72]">for</span> j <span className="text-[#FF7B72]">in</span> <span className="text-[#79C0FF]">range</span>(n-1):
                    </div>
                    <div className={`pl-6 ${currentBubbleState.codeLine === 4 ? 'bg-(--cobalt)/30 text-white -mx-2 px-2 py-0.5 rounded border-l-2 border-(--vermilion) font-semibold' : ''}`}>
                      <span className="text-[#FF7B72]">if</span> arr[j] &gt; arr[j+1]:
                    </div>
                    <div className="pl-9 text-gray-400">
                      arr[j], arr[j+1] = arr[j+1], arr[j]
                    </div>
                  </div>

                  <div className="sm:col-span-7 bg-(--canvas-paper) p-6 flex flex-col justify-between relative min-h-[260px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-medium text-(--ink-muted)">
                        EXECUTION STATE
                      </span>
                    </div>

                    <div className="my-6 flex items-center justify-center gap-2.5">
                      {currentBubbleState.arr.map((val, idx) => {
                        const isComparing = idx === currentBubbleState.j || idx === currentBubbleState.j + 1;

                        return (
                          <div key={idx} className="flex flex-col items-center">
                            <motion.div
                              layout
                              transition={{ type: "spring", stiffness: 350, damping: 25 }}
                              className={`w-12 h-14 rounded-lg flex items-center justify-center font-mono text-base font-bold transition-all border ${
                                isComparing
                                  ? 'bg-(--cobalt) text-white border-(--cobalt-dark) shadow-md'
                                  : 'bg-(--canvas-tint) text-(--ink) border-(--ink-line)'
                              }`}
                            >
                              {val}
                            </motion.div>

                            <div className="h-6 mt-2 flex items-center justify-center font-mono text-xs font-bold">
                              {idx === currentBubbleState.j && (
                                <span className="text-(--cobalt)">j</span>
                              )}
                              {idx === currentBubbleState.j + 1 && (
                                <span className="text-(--vermilion)">j+1</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-2.5 rounded bg-(--canvas-tint) border border-(--ink-line) text-xs text-(--ink-secondary) flex items-start gap-2">
                      <span className="text-(--cobalt) font-bold">●</span>
                      <p className="leading-snug">{currentBubbleState.note}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-(--canvas-dark) px-4 py-3 border-t border-(--ink-line) flex items-center justify-between text-xs font-mono text-(--ink-secondary)">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-3 py-1.5 rounded bg-(--canvas-paper) border border-(--ink-line) hover:border-(--ink-muted) text-(--ink) font-semibold transition-colors"
                    >
                      {isPlaying ? 'Pause' : 'Auto-Play'}
                    </button>
                    <button 
                      onClick={() => setStepIndex((prev) => (prev >= 3 ? 0 : prev + 1))}
                      className="px-3 py-1.5 rounded bg-(--cobalt) text-white font-semibold transition-colors hover:bg-(--cobalt-dark)"
                    >
                      Step Forward →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* SECTION 2: THE PROBLEM */}
          <section className="w-full py-20 bg-(--canvas-paper) border-y border-(--ink-line)">
            <div className="max-w-7xl mx-auto px-6">
              <div className="max-w-3xl mb-16">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-(--ink-muted)">
                  THE CHALLENGE
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-(--ink) mt-4 mb-4 tracking-tight">
                  Reading code is only <span className="text-(--vermilion)">half the story.</span>
                </h2>
                <p className="text-lg text-(--ink-secondary) leading-relaxed">
                  You spend hours staring at static text trying to guess what variables hold at line 38. CodeToAnim replaces print-statement debugging with direct visual execution.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                <div className="p-8 rounded-xl bg-(--canvas) border border-(--ink-line) flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-(--ink) mb-2">Static Code</h3>
                    <p className="text-sm text-(--ink-secondary) mb-6">
                      Juggling memory addresses, pointer hops, and nested loop indexes purely in your head.
                    </p>
                    <div className="bg-(--editor-bg) rounded-lg p-4 font-mono text-xs text-gray-400 space-y-1.5 border border-(--ink-line)">
                      <div><span className="text-purple-400">while</span> current <span className="text-purple-400">and</span> current.next:</div>
                      <div className="pl-4">temp = current.next</div>
                      <div className="pl-4">current.next = temp.next</div>
                      <div className="pl-4 text-gray-500">print(f"Debug: &#123;current&#125;")</div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-xl bg-(--cobalt-tint) border border-(--cobalt) flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-(--ink) mb-2">Interactive Visual Clarity</h3>
                    <p className="text-sm text-(--ink-secondary) mb-6">
                      Every node reroute, recursive branch, and pointer shift paints itself before your eyes.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-(--cobalt) flex items-center justify-center gap-3 overflow-x-auto shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-2 rounded bg-(--canvas) border border-(--ink-line) font-mono text-xs font-bold text-(--ink)">
                          Node(A)
                        </div>
                        <span className="text-(--cobalt) font-bold">→</span>
                        <div className="px-3 py-2 rounded bg-(--cobalt) text-white font-mono text-xs font-bold">
                          Node(B)
                        </div>
                        <span className="text-(--teal) font-bold">→</span>
                        <div className="px-3 py-2 rounded bg-(--yellow-tint) border border-(--yellow) font-mono text-xs font-bold text-(--coffee)">
                          Node(C)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: SIGNATURE CODE TRANSFORMATION */}
          <section className="w-full py-24 max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-(--ink) tracking-tight">
                From code statement to <span className="text-(--teal)">structural motion.</span>
              </h2>
              <p className="text-(--ink-secondary) mt-4 text-base sm:text-lg">
                Linked lists, recursive trees, and memory pointers aren't abstract concepts—they are dynamic structures that transform step by step.
              </p>
            </div>

            <div className="w-full bg-(--canvas-paper) border border-(--ink-line-strong) rounded-xl shadow-lg overflow-hidden grid lg:grid-cols-12">
              <div className="lg:col-span-5 bg-(--editor-bg) p-6 sm:p-8 font-mono text-sm text-gray-300 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-(--ink-line)">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs text-gray-400">
                    <span>linked_list_traversal.py</span>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div><span className="text-[#FF7B72]">def</span> <span className="text-[#79C0FF]">traverse</span>(head):</div>
                    <div className="pl-4 text-gray-400">curr = head</div>
                    <div className="pl-4 bg-(--teal)/30 text-white -mx-3 px-3 py-1 rounded border-l-2 border-(--teal) my-1">
                      <span className="text-[#FF7B72]">while</span> curr <span className="text-[#FF7B72]">is not</span> <span className="text-[#79C0FF]">None</span>:
                    </div>
                    <div className="pl-8"><span className="text-[#79C0FF]">print</span>(curr.val)</div>
                    <div className="pl-8 text-yellow-200">curr = curr.next</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-(--canvas-tint) p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-xs font-mono font-bold text-(--ink-secondary) uppercase tracking-wider">
                    POINTER FLOW GRAPH
                  </div>
                </div>

                <div className="flex items-center justify-start sm:justify-center gap-3 overflow-x-auto py-8">
                  <div className="flex flex-col items-center relative">
                    <span className="text-[11px] font-mono text-(--ink-muted) mb-1">head</span>
                    <div className="flex rounded border border-(--ink-line) bg-(--canvas-paper) shadow-sm overflow-hidden">
                      <div className="px-4 py-3 font-mono text-sm font-bold text-(--ink) border-r border-(--ink-line)">
                        10
                      </div>
                      <div className="px-3 py-3 font-mono text-xs text-(--ink-muted) bg-(--canvas-dark) flex items-center">
                        ●
                      </div>
                    </div>
                  </div>

                  <div className="text-(--ink-muted) font-bold text-lg">→</div>

                  <div className="flex flex-col items-center relative">
                    <span className="text-[11px] font-mono font-bold text-(--cobalt) mb-1">curr (Active)</span>
                    <div className="flex rounded border-2 border-(--cobalt) bg-white shadow-md scale-105 transition-transform overflow-hidden">
                      <div className="px-4 py-3 font-mono text-sm font-bold text-(--cobalt) border-r border-(--cobalt)">
                        42
                      </div>
                      <div className="px-3 py-3 font-mono text-xs text-(--cobalt) bg-(--cobalt-tint) flex items-center font-bold">
                        ●
                      </div>
                    </div>
                  </div>

                  <div className="text-(--ink-muted) font-bold text-lg">→</div>

                  <div className="flex flex-col items-center relative">
                    <span className="text-[11px] font-mono text-(--ink-muted) mb-1">tail</span>
                    <div className="flex rounded border border-(--ink-line) bg-(--canvas-paper) shadow-sm overflow-hidden">
                      <div className="px-4 py-3 font-mono text-sm font-bold text-(--ink) border-r border-(--ink-line)">
                        73
                      </div>
                      <div className="px-3 py-3 font-mono text-xs text-(--ink-muted) bg-(--canvas-dark) flex items-center">
                        null
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-(--ink-line) flex items-center justify-between text-xs font-mono text-(--ink-secondary)">
                  <span>Active Pointer: curr evaluates to memory address of Node(42).</span>
                  <Link to="/workspace" className="text-(--cobalt) font-semibold hover:underline">
                    Try in Workspace →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3.5: WHY I BUILT THIS (SCRAPBOOK) */}
          <section className="w-full py-28 bg-(--canvas) relative overflow-hidden border-t border-(--ink-line)">
            <div className="max-w-3xl mx-auto px-10 sm:px-6 relative">
              <div className="relative bg-[#FAFAFA] p-8 sm:p-14 shadow-[2px_8px_24px_rgba(0,0,0,0.08)] border border-[#E5E5E5] -rotate-1 sm:-rotate-2 rounded-sm z-10">
                <div className="absolute -top-7 left-8 sm:left-12 rotate-[15deg] text-[#9CA3AF] drop-shadow-md">
                  <svg width="32" height="72" viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 44C17.5 44 22 39.5 22 34V12C22 7.5 18.5 4 14 4C9.5 4 6 7.5 6 12V32C6 35.3 8.7 38 12 38C15.3 38 18 35.3 18 32V14" 
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-(--ink) mb-6 font-mono tracking-tight">
                   why_i_built_this.md
                </h3>
                
                <div className="space-y-5 text-(--ink-secondary) leading-relaxed text-base sm:text-lg">
                  <p>Look, studying DSA is brutal.</p>
                  <p>I used to spend hours grinding on a single problem, get completely stuck, and eventually cave—I'd ask AI to explain it, watch a tutorial, and finally get the code to work. But without fail, if I tried to solve that exact same problem a week later? I’d completely blank. Nothing was sticking.</p>
                  <p>My actual breaking point was Linked Lists. I was trying to juggle <code>curr.val</code> and <code>curr = curr.next</code> in my head, trying to imagine where all the pointers were going. I got so frustrated and confused that I literally quit and went back to studying arrays just to feel sane again.</p>
                  <p>That’s when it hit me. I wasn't failing to understand the logic; I just couldn't see what the code was doing. Staring at static text wasn't working for me. I needed a way to watch the pointers move and visualize the data structures changing at every single step.</p>
                  <p>Since I couldn't find exactly what I needed, I decided to build it myself.</p>
                </div>
                
                <div 
                  className="absolute -right-4 sm:-right-20 -bottom-10 sm:-bottom-12 rotate-[12deg] text-3xl sm:text-4xl text-(--vermilion) pointer-events-none"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  RIP print("here") 🪦
                </div>
                
                <div 
                  className="absolute -left-8 sm:-left-40 top-16 sm:top-24 -rotate-[14deg] text-3xl sm:text-4xl text-(--cobalt) pointer-events-none hidden sm:block"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  Pointer hell = 💀
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: FUNCTIONAL TOOLS */}
          <section className="w-full py-20 bg-(--canvas-dark) border-t border-(--ink-line)">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
                <div className="max-w-xl">
                  <h2 className="text-3xl sm:text-4xl font-bold text-(--ink) mt-2 mb-4 tracking-tight">
                    Debug visually. <span className="text-(--cobalt)">Understand instantly.</span>
                  </h2>
                  <p className="text-(--ink-secondary) text-base leading-relaxed">
                    A suite of debugging features designed to connect what you write directly to what happens inside the machine.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                  {[
                    { step: "01", name: "Breakpoints", note: "Pause execution", color: "var(--ink)" },
                    { step: "02", name: "Variables", note: "Inspect state", color: "var(--cobalt)" },
                    { step: "03", name: "Call Stacks", note: "Navigate trees", color: "var(--vermilion)" },
                    { step: "04", name: "Custom I/O", note: "Test edge cases", color: "var(--teal)" }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-lg bg-(--canvas-paper) border border-(--ink-line) flex flex-col justify-between min-w-[120px]"
                    >
                      <div className="text-[10px] font-mono font-bold text-(--ink-muted) mb-3">{item.step}</div>
                      <div>
                        <div className="text-base font-bold" style={{ color: item.color }}>{item.name}</div>
                        <div className="text-[11px] text-(--ink-muted) font-mono">{item.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: FINAL CTA */}
          <section className="w-full py-28 px-6 bg-(--cobalt) text-white border-t border-(--ink-line-strong)">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                Your code already has a story. <br />
                <span className="text-(--yellow)">See how it unfolds.</span>
              </h2>
              <p className="text-white/80 text-lg sm:text-xl max-w-xl mx-auto mb-10 font-normal leading-relaxed">
                Step inside the studio. Write algorithms in Python and explore their physical execution step by step.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={user ? "/profile" : "/workspace"} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-(--yellow) hover:bg-[#E5B540] text-(--ink) font-bold py-4 px-10 rounded-lg transition-colors text-base shadow-sm">
                    Start Visualizing Free →
                  </button>
                </Link>
                <Link to="/learn" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white font-medium py-4 px-8 rounded-lg border border-white/30 transition-colors text-base">
                    Browse Algorithm Library
                  </button>
                </Link>
              </div>
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="w-full border-t border-(--ink-line) bg-(--canvas-paper) py-14 px-6" aria-label="Site Footer">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <img src="/favicon.svg" alt="CodeToAnim Logo" className="w-7 h-7 object-contain" />
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
                <li><Link to={user ? "/profile" : "/auth"} className="hover:text-(--cobalt) transition-colors">Dashboard</Link></li>
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

            <div>
              <h4 className="text-(--ink) font-bold mb-4 text-xs font-mono uppercase tracking-wider">Community</h4>
              <ul className="space-y-2.5 text-(--ink-secondary) text-sm font-medium">
                <li><a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-(--cobalt) transition-colors">GitHub Repository</a></li>
                <li><a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="hover:text-(--cobalt) transition-colors">Twitter / X</a></li>
                <li><Link to="/about" className="text-(--cobalt) transition-colors">About the Project</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-(--ink-line) text-xs text-(--ink-muted) flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} CodeToAnim Studio. Code is something you can watch, explore, and understand.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;