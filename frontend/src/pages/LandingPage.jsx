import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LandingNav from '../components/LandingNav';

const easeCurve = [0.19, 1, 0.22, 1];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: easeCurve } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const LandingPage = () => {
  const { user, openAuthModal } = useAuth();
  
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev >= 3 ? 0 : prev + 1));
      }, 2000); 
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const demoStates = {
    bubble: [
      { arr: [8, 3, 5, 12], j: 0, codeLine: 4, note: "Comparing index 0 (8) and index 1 (3). 8 > 3, swapping." },
      { arr: [3, 8, 5, 12], j: 1, codeLine: 4, note: "Comparing index 1 (8) and index 2 (5). 8 > 5, swapping." },
      { arr: [3, 5, 8, 12], j: 2, codeLine: 4, note: "Comparing index 2 (8) and index 3 (12). 8 < 12, no swap." },
      { arr: [3, 5, 8, 12], j: -1, codeLine: 1, note: "Pass complete. Element 12 locked in final position." }
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
          overflow-y: scroll !important;
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        /* Custom decorative grid */
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, var(--ink-line) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--ink-line) 1px, transparent 1px);
          mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
        }
      `}</style>

      {/* Removed overflow-x-hidden from root container to allow sticky positioning */}
      <div className="min-h-screen flex flex-col font-sans bg-(--canvas) text-(--ink) selection:bg-(--cobalt) selection:text-white relative">
        
        {/* Sticky Nav Wrapper */}
        <div className="sticky top-0 z-[100] w-full bg-(--canvas)/90 backdrop-blur-md border-b border-(--ink-line) shadow-sm transition-all">
          <LandingNav />
        </div>

        {/* Moved overflow-x-hidden to main to prevent horizontal scroll issues */}
        <main className="grow flex flex-col items-center w-full z-10 overflow-x-hidden">
          
          {/* SECTION 1: HERO */}
          <section className="relative w-full px-6 pt-20 pb-32 flex flex-col items-center justify-center">
            {/* Background pattern layer */}
            <div className="absolute inset-0 z-0 bg-grid-pattern opacity-60"></div>
            
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center relative z-10">
              <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={staggerContainer} 
                className="lg:col-span-6 flex flex-col items-start text-left relative"
              >
                <motion.div variants={fadeUpVariant} className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--cobalt-tint) border border-(--cobalt)/20 text-(--cobalt) text-sm font-semibold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-(--vermilion) animate-pulse"></span>
                  Visual Algorithm Studio
                </motion.div>
                
                <motion.h1 
                  variants={fadeUpVariant} 
                  className="text-5xl sm:text-6xl lg:text-[72px] font-bold text-(--ink) mb-6 tracking-tight leading-[1.1]"
                >
                  Step through your Python code <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-(--cobalt) to-(--teal)">
                    in real-time.
                  </span>
                </motion.h1>
                
                <motion.p 
                  variants={fadeUpVariant} 
                  className="text-lg md:text-xl text-(--ink-secondary) mb-10 max-w-xl leading-relaxed font-normal"
                >
                  Stop using print statements to track off-by-one errors and nested loops. Trace dynamic programming states, memory allocations, and recursion trees visually.
                </motion.p>

                <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <Link to={user ? "/profile" : "/workspace"} className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto bg-(--cobalt) hover:bg-(--cobalt-dark) text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg">
                      <span>Start Visualizing</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </Link>

                  <Link to="/about" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto bg-transparent text-(--ink) hover:bg-(--canvas-paper) font-bold py-4 px-8 rounded-xl border-2 border-(--ink-line) hover:border-(--ink-muted) transition-all flex items-center justify-center gap-2 text-lg">
                      <span>How it works</span>
                    </button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Enhanced Interactive Editor Display */}
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: easeCurve }}
                className="lg:col-span-6 relative"
              >
                {/* Glowing backdrop */}
                <div className="absolute inset-0 bg-gradient-to-tr from-(--cobalt)/20 via-(--teal)/10 to-(--vermilion)/20 blur-3xl -z-10 rounded-[3rem]"></div>
                
                <div className="bg-(--canvas-paper) border border-(--ink-line-strong) rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(25,24,22,0.1)] flex flex-col transform hover:scale-[1.01] transition-transform duration-500">
                  <div className="bg-[#191816] px-4 py-3 border-b border-(--ink-line) flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FF5F56]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#FFBD2E]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#27C93F]"></span>
                      <span className="ml-3 font-mono text-xs font-medium text-gray-400 tracking-tight">
                        workspace.py
                      </span>
                    </div>
                    <span className="text-[11px] font-mono bg-(--editor-surface) border border-gray-700 px-2.5 py-1 rounded text-(--teal-tint) font-bold shadow-sm">
                      STEP {stepIndex + 1} / 4
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-(--ink-line)">
                    <div className="sm:col-span-5 bg-(--editor-bg) p-5 font-mono text-sm text-gray-300 leading-relaxed overflow-x-auto">
                      <div className="text-(--ink-muted) opacity-80 mb-3 text-xs uppercase tracking-widest font-bold"># Bubble Sort</div>
                      <div className={`${currentBubbleState.codeLine === 1 ? 'bg-(--cobalt)/20 text-white -mx-2 px-2 py-0.5 rounded border-l-2 border-(--cobalt)' : ''}`}>
                        <span className="text-[#FF7B72]">def</span> <span className="text-[#79C0FF]">bubble</span>(arr):
                      </div>
                      <div className="pl-4">
                        <span className="text-[#FF7B72]">n</span> = <span className="text-[#79C0FF]">len</span>(arr)
                      </div>
                      <div className={`pl-4 ${currentBubbleState.codeLine === 3 ? 'bg-(--yellow)/20 text-white -mx-2 px-2 py-0.5 rounded border-l-2 border-(--yellow)' : ''}`}>
                        <span className="text-[#FF7B72]">for</span> j <span className="text-[#FF7B72]">in</span> <span className="text-[#79C0FF]">range</span>(n-1):
                      </div>
                      <div className={`pl-8 ${currentBubbleState.codeLine === 4 ? 'bg-(--vermilion)/20 text-white -mx-2 px-2 py-0.5 rounded border-l-2 border-(--vermilion) font-semibold' : ''}`}>
                        <span className="text-[#FF7B72]">if</span> arr[j] &gt; arr[j+1]:
                      </div>
                      <div className="pl-12 text-gray-500">
                        arr[j], arr[j+1] = arr[j+1], arr[j]
                      </div>
                    </div>

                    <div className="sm:col-span-7 bg-(--canvas-paper) p-6 flex flex-col justify-between relative min-h-[280px]">
                      <div className="text-[11px] font-mono font-bold text-(--ink-secondary) tracking-widest uppercase">
                        Execution State
                      </div>

                      <div className="my-8 flex items-center justify-center gap-3">
                        {currentBubbleState.arr.map((val, idx) => {
                          const isComparing = idx === currentBubbleState.j || idx === currentBubbleState.j + 1;
                          return (
                            <div key={idx} className="flex flex-col items-center">
                              <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className={`w-14 h-16 rounded-xl flex items-center justify-center font-mono text-xl font-bold transition-all border-2 ${
                                  isComparing
                                    ? 'bg-(--cobalt) text-white border-(--cobalt-dark) shadow-lg scale-110 z-10'
                                    : 'bg-(--canvas-tint) text-(--ink) border-(--ink-line)'
                                }`}
                              >
                                {val}
                              </motion.div>
                              <div className="h-6 mt-3 flex items-center justify-center font-mono text-sm font-bold">
                                {idx === currentBubbleState.j && <span className="text-(--cobalt)">j</span>}
                                {idx === currentBubbleState.j + 1 && <span className="text-(--vermilion)">j+1</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-3.5 rounded-lg bg-(--canvas-tint) border border-(--ink-line) text-sm text-(--ink-secondary) flex items-start gap-3 shadow-inner">
                        <span className="text-(--vermilion) font-bold animate-pulse">●</span>
                        <p className="leading-snug font-medium">{currentBubbleState.note}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-(--canvas-dark) px-5 py-4 border-t border-(--ink-line) flex items-center justify-between font-mono text-sm">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-4 py-2 rounded-md bg-(--canvas-paper) border-2 border-(--ink-line) hover:border-(--ink-muted) text-(--ink) font-bold transition-colors shadow-sm"
                      >
                        {isPlaying ? '⏸ Pause' : '▶ Auto-Play'}
                      </button>
                      <button 
                        onClick={() => setStepIndex((prev) => (prev >= 3 ? 0 : prev + 1))}
                        className="px-4 py-2 rounded-md bg-(--cobalt) text-white font-bold transition-colors hover:bg-(--cobalt-dark) shadow-md hover:shadow-lg"
                      >
                        Step Forward →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* SECTION 2: THE PROBLEM */}
          <section className="w-full py-24 bg-(--ink) text-(--canvas) border-y border-(--ink-line-strong)">
            <div className="max-w-7xl mx-auto px-6">
              <div className="max-w-3xl mb-16">
                <span className="text-sm font-mono font-bold uppercase tracking-widest text-(--yellow)">
                  THE CHALLENGE
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6 tracking-tight">
                  Reading code is only <span className="text-(--vermilion)">half the story.</span>
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed font-light">
                  You spend hours staring at static text trying to guess what variables hold at line 38. CodeToAnim replaces print-statement debugging with direct visual execution.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                <motion.div whileHover={{ y: -5 }} className="p-10 rounded-2xl bg-[#1A1A1A] border border-gray-800 flex flex-col justify-between shadow-xl">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Static Code</h3>
                    <p className="text-base text-gray-400 mb-8">
                      Juggling memory addresses, pointer hops, and nested loop indexes purely in your head.
                    </p>
                    <div className="bg-black/50 rounded-xl p-6 font-mono text-sm text-gray-400 space-y-2 border border-gray-800">
                      <div><span className="text-[#C678DD]">while</span> current <span className="text-[#C678DD]">and</span> current.next:</div>
                      <div className="pl-6">temp = current.next</div>
                      <div className="pl-6">current.next = temp.next</div>
                      <div className="pl-6 text-gray-600 italic">print(f"Debug: &#123;current&#125;")</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="p-10 rounded-2xl bg-gradient-to-br from-(--cobalt-dark) to-(--teal) border border-(--cobalt) flex flex-col justify-between shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-3">Interactive Clarity</h3>
                    <p className="text-base text-(--canvas-tint) mb-8">
                      Every node reroute, recursive branch, and pointer shift paints itself before your eyes.
                    </p>
                    <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center justify-center gap-4 overflow-x-auto">
                      <div className="px-4 py-3 rounded-lg bg-(--canvas) border border-(--ink-line) font-mono text-sm font-bold text-(--ink)">
                        Node(A)
                      </div>
                      <span className="text-(--cobalt) font-black text-xl">→</span>
                      <div className="px-4 py-3 rounded-lg bg-(--cobalt) text-white font-mono text-sm font-bold shadow-lg transform scale-110">
                        Node(B)
                      </div>
                      <span className="text-(--teal) font-black text-xl">→</span>
                      <div className="px-4 py-3 rounded-lg bg-(--yellow-tint) border border-(--yellow) font-mono text-sm font-bold text-(--coffee)">
                        Node(C)
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* SECTION 3: SIGNATURE CODE TRANSFORMATION */}
          <section className="w-full py-32 max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-(--ink) tracking-tight">
                From code statement to <span className="text-(--teal)">structural motion.</span>
              </h2>
              <p className="text-(--ink-secondary) mt-6 text-lg sm:text-xl font-medium">
                Linked lists, recursive trees, and memory pointers aren't abstract concepts—they are dynamic structures that transform step by step.
              </p>
            </div>

            <div className="w-full bg-white border border-(--ink-line-strong) rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-12 transform transition-all hover:shadow-[0_20px_60px_rgba(22,117,111,0.15)]">
              <div className="lg:col-span-5 bg-(--editor-bg) p-8 font-mono text-sm text-gray-300 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-(--ink-line)">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <span>linked_list_traversal.py</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-[#FF7B72]">def</span> <span className="text-[#79C0FF]">traverse</span>(head):</div>
                    <div className="pl-6 text-gray-400">curr = head</div>
                    <div className="pl-6 bg-(--teal)/20 text-white -mx-4 px-4 py-1.5 rounded border-l-4 border-(--teal) my-2 shadow-inner">
                      <span className="text-[#FF7B72]">while</span> curr <span className="text-[#FF7B72]">is not</span> <span className="text-[#79C0FF]">None</span>:
                    </div>
                    <div className="pl-12"><span className="text-[#79C0FF]">print</span>(curr.val)</div>
                    <div className="pl-12 text-yellow-200">curr = curr.next</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-(--canvas-paper) p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden bg-grid-pattern">
                <div className="flex items-center justify-between mb-10">
                  <div className="text-sm font-mono font-bold text-(--ink) uppercase tracking-widest bg-white px-4 py-1 rounded-full border border-(--ink-line) shadow-sm">
                    Pointer Flow Graph
                  </div>
                </div>

                <div className="flex items-center justify-start sm:justify-center gap-4 overflow-x-auto py-8">
                  <div className="flex flex-col items-center relative">
                    <span className="text-xs font-mono text-(--ink-muted) mb-2 font-bold uppercase">head</span>
                    <div className="flex rounded-lg border border-(--ink-line) bg-white shadow-md overflow-hidden">
                      <div className="px-5 py-4 font-mono text-base font-bold text-(--ink) border-r border-(--ink-line)">10</div>
                      <div className="px-4 py-4 font-mono text-xs text-(--ink-muted) bg-(--canvas-dark) flex items-center">●</div>
                    </div>
                  </div>

                  <div className="text-(--ink-muted) font-black text-2xl">→</div>

                  <div className="flex flex-col items-center relative">
                    <span className="text-xs font-mono font-bold text-(--teal) mb-2 uppercase tracking-wide">curr (Active)</span>
                    <div className="flex rounded-lg border-2 border-(--teal) bg-white shadow-xl scale-110 transition-transform overflow-hidden z-10">
                      <div className="px-5 py-4 font-mono text-base font-bold text-(--teal) border-r border-(--teal)">42</div>
                      <div className="px-4 py-4 font-mono text-xs text-(--teal) bg-(--teal-tint) flex items-center font-bold">●</div>
                    </div>
                  </div>

                  <div className="text-(--ink-muted) font-black text-2xl">→</div>

                  <div className="flex flex-col items-center relative">
                    <span className="text-xs font-mono text-(--ink-muted) mb-2 font-bold uppercase">tail</span>
                    <div className="flex rounded-lg border border-(--ink-line) bg-white shadow-md overflow-hidden">
                      <div className="px-5 py-4 font-mono text-base font-bold text-(--ink) border-r border-(--ink-line)">73</div>
                      <div className="px-4 py-4 font-mono text-xs text-(--ink-muted) bg-(--canvas-dark) flex items-center">null</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3.5: WHY I BUILT THIS */}
          <section className="w-full py-32 bg-(--canvas-tint) relative overflow-hidden border-t border-(--ink-line) flex items-center justify-center">
            <div className="absolute inset-0 z-0 bg-grid-pattern opacity-40"></div>
            
            <div className="max-w-4xl mx-auto px-6 relative z-10">
              <motion.div 
                whileHover={{ rotate: 0, scale: 1.02 }}
                className="relative bg-white p-10 sm:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.12)] border-2 border-(--ink-line) -rotate-2 rounded-xl transition-all duration-300"
              >
                {/* Decorative Pin */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-(--vermilion) shadow-md flex items-center justify-center border-4 border-white">
                  <div className="w-4 h-4 rounded-full bg-black/20"></div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-(--ink) mb-8 font-mono tracking-tight flex items-center gap-3">
                  <span className="text-(--cobalt)">_</span>why_i_built_this.md
                </h3>
                
                <div className="space-y-6 text-(--ink-secondary) font-medium leading-relaxed text-lg sm:text-xl">
                  <p>Look, studying DSA is brutal.</p>
                  <p>I used to spend hours grinding on a single problem, get completely stuck, and eventually cave. I'd ask AI, watch a tutorial, and get the code to work. But a week later? I’d completely blank. Nothing stuck.</p>
                  <p className="p-6 bg-(--canvas) border border-(--ink-line) rounded-lg shadow-inner font-mono text-sm my-6 text-(--ink)">
                    My breaking point: <span className="text-(--vermilion)">Linked Lists.</span> Trying to juggle <span className="bg-white px-2 py-1 rounded">curr.val</span> and <span className="bg-white px-2 py-1 rounded">curr = curr.next</span> in my head made me want to quit.
                  </p>
                  <p>That’s when it hit me. I wasn't failing logic; I just couldn't <strong>see</strong> what the code was doing. I needed a way to watch the pointers move. Since I couldn't find exactly what I needed, I built it.</p>
                </div>
                
                <div 
                  className="absolute -right-8 -bottom-14 rotate-[15deg] text-4xl sm:text-5xl text-(--vermilion) pointer-events-none drop-shadow-md"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  RIP print("here") 🪦
                </div>
              </motion.div>
            </div>
          </section>

          {/* SECTION 4: FUNCTIONAL TOOLS */}
          <section className="w-full py-28 bg-(--canvas-dark) border-t border-(--ink-line)">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-16">
                <div className="max-w-xl">
                  <h2 className="text-4xl sm:text-5xl font-bold text-(--ink) mt-2 mb-6 tracking-tight">
                    Debug visually. <br/><span className="text-(--cobalt)">Understand instantly.</span>
                  </h2>
                  <p className="text-(--ink-secondary) text-lg font-medium leading-relaxed">
                    A suite of debugging features designed to connect what you write directly to what happens inside the machine.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full lg:w-1/2">
                  {[
                    { step: "01", name: "Breakpoints", note: "Pause execution", color: "var(--ink)", bg: "bg-white" },
                    { step: "02", name: "Variables", note: "Inspect state", color: "var(--cobalt)", bg: "bg-(--cobalt-tint)" },
                    { step: "03", name: "Call Stacks", note: "Navigate trees", color: "var(--vermilion)", bg: "bg-(--vermilion-tint)" },
                    { step: "04", name: "Custom I/O", note: "Test edge cases", color: "var(--teal)", bg: "bg-(--teal-tint)" }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className={`p-6 rounded-2xl ${item.bg} border-2 border-(--ink-line) flex flex-col justify-between shadow-sm cursor-pointer`}
                    >
                      <div className="text-xs font-mono font-bold text-(--ink-muted) mb-8">{item.step}</div>
                      <div>
                        <div className="text-xl font-bold mb-1" style={{ color: item.color }}>{item.name}</div>
                        <div className="text-sm text-(--ink-muted) font-mono font-bold">{item.note}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: FINAL CTA */}
          <section className="w-full py-32 px-6 bg-(--cobalt) text-white relative overflow-hidden">
            {/* Dramatic background shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-(--teal) opacity-50 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-(--vermilion) opacity-40 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                Your code has a story. <br />
                <span className="text-(--yellow)">See how it unfolds.</span>
              </h2>
              <p className="text-white/90 text-xl sm:text-2xl max-w-2xl mx-auto mb-14 font-medium leading-relaxed">
                Step inside the studio. Write algorithms in Python and explore their physical execution step by step.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <Link to={user ? "/profile" : "/workspace"} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-(--yellow) hover:bg-[#E5B540] text-(--ink) font-black py-5 px-10 rounded-xl transition-all text-lg shadow-[0_10px_30px_rgba(242,193,78,0.3)] hover:-translate-y-1">
                    Start Visualizing Free →
                  </button>
                </Link>
                <Link to="/learn" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-5 px-10 rounded-xl border-2 border-white/30 transition-all text-lg backdrop-blur-sm">
                    Browse Algorithm Library
                  </button>
                </Link>
              </div>

              {!user && (
                <div className="max-w-3xl mx-auto bg-black/20 border border-white/10 rounded-3xl p-10 backdrop-blur-md shadow-2xl">
                  <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Unlock the Full Experience</h3>
                  <p className="text-white/80 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
                    Create a free account to save custom algorithms, track your progress, and manage everything from a centralized dashboard.
                  </p>
                  <button 
                    onClick={() => openAuthModal ? openAuthModal('Sign up to track your progress and save code!') : window.location.href='/auth'}
                    className="bg-white text-(--cobalt) hover:bg-(--canvas-paper) font-bold py-4 px-12 rounded-xl transition-transform hover:scale-105 shadow-xl w-full sm:w-auto text-lg"
                  >
                    Sign Up for Free
                  </button>
                </div>
              )}
            </div>
          </section>

        </main>

        <footer className="w-full border-t border-(--ink-line) bg-(--canvas-paper) py-16 px-6 relative z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold tracking-tight text-(--ink)">
                  CodeTo<span className="text-(--cobalt)">Anim</span>
                </span>
              </Link>
              <p className="text-(--ink-secondary) text-base max-w-sm leading-relaxed mb-6 font-medium">
                The visual workspace for developers. Transforming abstract code execution into tactile, visual understanding.
              </p>
            </div>
            
            <div>
              <h4 className="text-(--ink) font-bold mb-6 text-sm font-mono uppercase tracking-widest">Studio</h4>
              <ul className="space-y-4 text-(--ink-secondary) text-sm font-bold">
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Visual Workspace</Link></li>
                <li><Link to="/algorithms" className="hover:text-(--cobalt) transition-colors">Algorithms Library</Link></li>
                <li><Link to="/learn" className="hover:text-(--cobalt) transition-colors">Interactive Lessons</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-(--ink) font-bold mb-6 text-sm font-mono uppercase tracking-widest">Concepts</h4>
              <ul className="space-y-4 text-(--ink-secondary) text-sm font-bold">
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Arrays &amp; Sorting</Link></li>
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Linked Lists</Link></li>
                <li><Link to="/workspace" className="hover:text-(--cobalt) transition-colors">Trees &amp; Graphs</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-(--ink-line) text-sm font-bold text-(--ink-muted) flex flex-col justify-center items-center text-center">
            <p>© {new Date().getFullYear()} CodeToAnim Studio. Code is something you can watch, explore, and understand.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;