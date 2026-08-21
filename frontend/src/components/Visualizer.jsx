import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Visualizer({ 
  steps, 
  currentStepIndex, 
  errorMessage, 
  isDark 
}) {
  const [activeTab, setActiveTab] = useState('VISUALIZATION');

  const currentStep = steps[currentStepIndex];
  const variables = currentStep?.variables || {};
  const layout = currentStep?.visual_layout || { type: 'none' };
  
  const callStack = currentStep?.call_stack || [{ name: 'module', file: 'main.py', line: currentStep?.line || 1 }];

  const bgPanel = isDark ? 'bg-[#10141D]' : 'bg-[#FFFFFF]';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  
  const metallicBorder = 'border border-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_5px_rgba(0,0,0,0.25)]';

  const variableEntries = Object.entries(variables).filter(([val]) => {
    if (typeof val === 'string') return !(val.startsWith("<class") || val.startsWith("<function") || val.startsWith("<method") || val.startsWith("<module"));
    return true;
  });

  return (
    <div className={`w-full h-full flex flex-col ${bgPanel}`}>
      
      {/* Canvas Tab Header */}
      <div className={`h-10 ${metallicBorder} border-x-0 border-t-0 flex items-center justify-between px-4 text-xs font-bold ${isDark ? 'bg-[#0E121B]' : 'bg-slate-100'}`}>
        <div className="flex gap-6 h-full pt-1">
          {['VISUALIZATION', 'VARIABLES', 'CALL STACK', 'BREAKPOINTS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 border-b-[3px] transition-colors ${
                activeTab === tab 
                  ? 'border-purple-600 text-purple-600 font-extrabold' 
                  : `border-transparent ${textSecondary} hover:text-slate-900 dark:hover:text-slate-200`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Content */}
      <div className="flex-1 flex flex-col p-6 overflow-auto gap-6">
        {errorMessage && (
          <div className={`p-3 rounded-lg text-xs font-mono shadow-md ${metallicBorder} ${isDark ? 'bg-red-950/80 text-red-300' : 'bg-red-100 text-red-700'}`}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* --- TAB: VISUALIZATION (Dashboard View) --- */}
        {activeTab === 'VISUALIZATION' && (
          <>
            <div className={`p-6 rounded-2xl ${metallicBorder} flex flex-col items-center min-h-[280px] relative overflow-hidden ${isDark ? 'bg-slate-950/60 shadow-inner' : 'bg-slate-50 shadow-sm'}`}>
              <div className="w-full flex justify-between items-center mb-4 text-xs font-mono font-bold z-10">
                <span className="text-purple-600 uppercase tracking-wider">{layout.type !== 'none' ? `${layout.type}: ${layout.key || ''}` : 'Canvas'}</span>
                <span className={textSecondary}>STEP {steps.length > 0 ? currentStepIndex + 1 : 0} / {steps.length}</span>
              </div>

              {/* 1. ARRAY LAYOUT RENDERER */}
              {layout.type === 'array' && (
                <div className="flex gap-3 items-end py-6 overflow-x-auto max-w-full my-auto">
                  <AnimatePresence mode="popLayout">
                    {layout.data.map((val, idx) => {
                      const pointingKeys = layout.pointers.filter(p => p.index === idx).map(p => p.key);
                      return (
                        <motion.div key={`arr-${idx}`} layout className="flex flex-col items-center">
                          <div className="h-6 flex flex-col items-center justify-end mb-1">
                            {pointingKeys.length > 0 && (
                              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shadow-md ${metallicBorder} ${isDark ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-900'}`}>
                                {pointingKeys.join(', ')}
                              </span>
                            )}
                          </div>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold font-mono ${metallicBorder} transition-all ${
                            pointingKeys.length > 0 
                              ? (isDark ? 'bg-purple-950/80 text-white shadow-purple-900/50' : 'bg-purple-100 text-purple-950 shadow-md')
                              : (isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900 shadow-sm')
                          }`}>
                            {val}
                          </div>
                          <span className={`mt-1 text-[10px] font-mono font-bold ${textSecondary}`}>[{idx}]</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {/* 2. TREE LAYOUT RENDERER */}
              {layout.type === 'tree' && (
                <div className="relative w-full h-64 flex items-center justify-center my-auto">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {layout.edges?.map((edge, idx) => (
                      <line 
                        key={`edge-${idx}`} 
                        x1={edge.x1} y1={edge.y1} 
                        x2={edge.x2} y2={edge.y2} 
                        stroke={isDark ? '#6366f1' : '#818cf8'} 
                        strokeWidth="2" 
                      />
                    ))}
                  </svg>
                  
                  {layout.nodes.map((node, idx) => {
                    // Check if any pointer from the backend targets this specific node
                    const activePointers = layout.pointers?.filter(p => p.target_val === node.val) || [];
                    const isTargeted = activePointers.length > 0;

                    return (
                      <div 
                        key={idx} 
                        // --- FIX: Added translate(-50%, -50%) to perfectly center the nodes on the SVG lines ---
                        style={{ position: 'absolute', left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
                      >
                        
                        {/* 1. The Glowing Node */}
                        <div className={`
                          flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                          ${isTargeted 
                            ? 'bg-purple-900 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.7)] text-white scale-110 z-10' 
                            : isDark ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                          }
                        `}>
                          {node.val}
                        </div>

                        {/* 2. Show the variable name (e.g., "curr") floating under the node */}
                        {isTargeted && (
                          <div className="absolute top-14 left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center z-20">
                            {activePointers.map((ptr, i) => (
                              <span key={i} className="px-2 py-0.5 text-[10px] font-bold text-purple-900 bg-purple-300 rounded-md shadow-sm">
                                {ptr.key}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
              {/* 3. LINKED LIST LAYOUT RENDERER */}
              {layout.type === 'linked_list' && (
                <div className="flex items-center gap-4 overflow-x-auto p-6 my-auto max-w-full">
                  {layout.nodes?.map((node, idx) => (
                    <div key={`ll-${idx}`} className="flex items-center gap-4 flex-shrink-0">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base shadow-md font-mono ${metallicBorder} ${
                        isDark ? 'bg-indigo-950 text-indigo-200 border-indigo-500' : 'bg-indigo-600 text-white border-indigo-400'
                      }`}>
                        {node.val}
                      </div>
                      {idx < layout.nodes.length - 1 && (
                        <span className="text-purple-500 font-bold text-xl">→</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 4. DICTIONARY / HASHMAP LAYOUT RENDERER */}
              {layout.type === 'dict' && (
                <div className="flex flex-wrap gap-2 items-center justify-center py-4 my-auto">
                  {layout.entries?.map((entry, idx) => (
                    <div key={`dict-${idx}`} className={`px-3 py-2 rounded-xl flex items-center gap-2 font-mono text-xs ${metallicBorder} ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}`}>
                      <span className="text-purple-400 font-bold">{entry.key}:</span>
                      <span>{entry.val}</span>
                    </div>
                  ))}
                </div>
              )}
              

{/* 5. GRAPH LAYOUT RENDERER (Animated) */}
              {layout.type === 'graph' && (
                <div className="flex flex-wrap gap-4 items-center justify-center p-4 my-auto w-full">
                  {layout.nodes?.map((node, idx) => {
                    // Check our variables dynamically to see what state this node is in!
                    const isCurrent = variables.current_node === node.id || variables.node === node.id;
                    const isVisited = Array.isArray(variables.visited) && variables.visited.includes(node.id);
                    const inQueue = Array.isArray(variables.queue) && variables.queue.includes(node.id);

                    // Determine the color based on its algorithmic state
                    let bgColor = isDark ? "bg-purple-900 border-purple-500" : "bg-purple-600 border-purple-400";
                    let extraStyles = "";

                    if (isCurrent) {
                      bgColor = "bg-amber-500 border-amber-300"; // Active node being processed
                      extraStyles = "ring-4 ring-amber-500/50 scale-110 z-10";
                    } else if (isVisited) {
                      bgColor = "bg-emerald-600 border-emerald-400"; // Completely processed
                      extraStyles = "opacity-90";
                    } else if (inQueue) {
                      bgColor = "bg-blue-500 border-blue-400"; // Waiting in line
                      extraStyles = "ring-2 ring-blue-400 border-dashed";
                    }

                    return (
                      <div key={`graph-node-${idx}`} className={`p-3 rounded-xl flex flex-col items-center gap-2 ${metallicBorder} ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900'} transition-all duration-300`}>
                        <span className={`w-10 h-10 rounded-full border-2 text-white font-bold flex items-center justify-center text-xs shadow-md transition-all duration-300 ${bgColor} ${extraStyles}`}>
                          {node.id}
                        </span>
                        <span className="text-[10px] font-mono opacity-70">
                          → [{Array.isArray(node.neighbors) ? node.neighbors.join(', ') : (node.neighbors ? Object.keys(node.neighbors).join(', ') : '')}]
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* 6. VERTICAL STACK LAYOUT RENDERER */}
              {layout.type === 'stack' && (
                <div className="flex flex-col-reverse items-center justify-end h-full w-full pt-4 pb-2 relative z-0">
                  
                  {/* The solid base of the stack */}
                  <div className={`w-40 h-2 rounded-full mt-2 shadow-md shrink-0 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>

                  <div className="flex flex-col-reverse gap-2 items-center w-full overflow-y-auto px-4 pb-1">
                    <AnimatePresence mode="popLayout">
                      {layout.data.map((val, idx) => {
                        const pointingKeys = layout.pointers?.filter(p => p.index === idx).map(p => p.key) || [];
                        return (
                          <motion.div 
                            key={`stack-${idx}`} 
                            layout 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative flex justify-center w-full"
                          >
                            {/* Main Stack Block */}
                            <div className={`w-32 h-12 rounded-xl flex items-center justify-center text-sm font-bold font-mono shadow-md border-b-4 shrink-0 ${metallicBorder} transition-all ${
                              idx === layout.data.length - 1 
                                ? (isDark ? 'bg-purple-600 border-purple-800 text-white' : 'bg-purple-500 border-purple-700 text-white') 
                                : (isDark ? 'bg-slate-800 border-slate-900 text-slate-200' : 'bg-white border-slate-200 text-slate-900')
                            }`}>
                              {val}
                            </div>
                            
                            {/* Pointers fixed to the right (Absolute position prevents breaking the center alignment!) */}
                            {pointingKeys.length > 0 && (
                              <div className="absolute left-[calc(50%+4.5rem)] top-1/2 -translate-y-1/2 flex items-center z-10">
                                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shadow-md whitespace-nowrap ${metallicBorder} ${isDark ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-900'}`}>
                                  ← {pointingKeys.join(', ')}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              {layout.type === 'none' && (
                <div className={`my-auto text-xs font-mono font-semibold ${textSecondary}`}>Execute a trace to render visual state.</div>
              )}
            </div>
              {/* 7. HORIZONTAL QUEUE (TUNNEL) LAYOUT RENDERER */}
              {layout.type === 'queue' && (
                <div className="relative w-full flex justify-center mb-auto min-h-[160px]">
                  
                  {/* The Tunnel Container */}
                  <div className="relative w-[90%] max-w-2xl h-24 flex items-center px-4">
                    
                    {/* Straight, Equal Tunnel Top and Bottom Lines */}
                    <div className={`absolute inset-0 w-full h-full border-t-4 border-b-4 pointer-events-none rounded-sm ${isDark ? 'border-slate-600' : 'border-slate-400'}`}></div>

                    {/* Queue Items Container */}
                    <div className="relative w-full h-full flex items-center gap-4 overflow-x-auto no-scrollbar z-10 px-2 py-4">
                      <AnimatePresence mode="popLayout">
                        {layout.data.map((val, idx) => {
                          const pointingKeys = layout.pointers?.filter(p => p.index === idx).map(p => p.key) || [];
                          return (
                            <motion.div 
                              key={`queue-${val}-${idx}`} 
                              layout 
                              initial={{ opacity: 0, x: 50, scale: 0.8 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: -50, scale: 0.8 }}
                              className="relative flex justify-center items-center shrink-0 w-14 h-14"
                            >
                              {/* Pointers above the queue items */}
                              {pointingKeys.length > 0 && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center whitespace-nowrap z-20">
                                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shadow-md ${metallicBorder} ${isDark ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-900'}`}>
                                    ↓ {pointingKeys.join(', ')}
                                  </span>
                                </div>
                              )}

                              {/* Queue Item Block */}
                              <div className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-bold font-mono shadow-md border-b-4 ${metallicBorder} transition-all ${
                                idx === 0 
                                  ? (isDark ? 'bg-emerald-600 border-emerald-800 text-white' : 'bg-emerald-500 border-emerald-700 text-white') // Highlight front of queue
                                  : (isDark ? 'bg-slate-800 border-slate-900 text-slate-200' : 'bg-white border-slate-200 text-slate-900')
                              }`}>
                                {val}
                              </div>
                              
                              {/* Index indicator */}
                              <span className={`absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold ${textSecondary}`}>
                                [{idx}]
                              </span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl ${metallicBorder} ${isDark ? 'bg-slate-950/40' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>VARIABLES</div>
                <div className="space-y-2 font-mono text-xs overflow-y-auto max-h-32 pr-1">
                  {variableEntries.map(([k, v]) => (
                    <div key={k} className="flex justify-between items-start gap-2">
                      <span className={textSecondary}>{k}</span>
                      <span className="font-bold text-right break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                  {variableEntries.length === 0 && <span className={textSecondary}>No variables</span>}
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${metallicBorder} ${isDark ? 'bg-slate-950/40' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>CALL STACK</div>
                <div className="space-y-2 font-mono text-xs overflow-y-auto max-h-32 pr-1">
                  {callStack.map((frame, idx) => (
                    <div key={idx} className={`p-2 rounded-xl shadow-sm ${metallicBorder} ${isDark ? 'bg-purple-950/40 text-purple-200' : 'bg-purple-50 text-purple-900'}`}>
                      &lt;{frame.name}&gt; {frame.file}:{frame.line}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${metallicBorder} ${isDark ? 'bg-slate-950/40' : 'bg-white shadow-sm'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>BREAKPOINTS</span>
                </div>
                <div className={`text-xs font-mono font-medium ${textSecondary}`}>No breakpoints set</div>
              </div>
            </div>
          </>
        )}

        {/* --- TAB: FULL VARIABLES VIEW --- */}
        {activeTab === 'VARIABLES' && (
          <div className={`flex-1 p-6 rounded-2xl ${metallicBorder} ${isDark ? 'bg-slate-950/60 shadow-inner' : 'bg-slate-50 shadow-sm'}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>All Local Variables</h2>
            <div className="space-y-3 font-mono text-sm">
              {variableEntries.length > 0 ? variableEntries.map(([k, v]) => (
                <div key={k} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-xl ${metallicBorder} ${isDark ? 'bg-[#10141D]' : 'bg-white'}`}>
                  <span className={`font-semibold ${textSecondary}`}>{k}</span>
                  <span className="font-bold break-all mt-1 sm:mt-0">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                </div>
              )) : (
                <div className={textSecondary}>No variables currently in scope.</div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: FULL CALL STACK VIEW --- */}
        {activeTab === 'CALL STACK' && (
          <div className={`flex-1 p-6 rounded-2xl ${metallicBorder} ${isDark ? 'bg-slate-950/60 shadow-inner' : 'bg-slate-50 shadow-sm'}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>Call Stack Frames</h2>
            <div className="space-y-3 font-mono text-sm flex flex-col-reverse">
              {callStack.map((frame, idx) => (
                <div key={idx} className={`p-4 rounded-xl shadow-sm flex items-center justify-between ${metallicBorder} ${isDark ? 'bg-purple-950/40 text-purple-200' : 'bg-purple-50 text-purple-900'}`}>
                  <span className="font-bold">&lt;{frame.name}&gt;</span>
                  <span className="opacity-80">{frame.file} : Line {frame.line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: FULL BREAKPOINTS VIEW --- */}
        {activeTab === 'BREAKPOINTS' && (
          <div className={`flex-1 p-6 rounded-2xl flex flex-col items-center justify-center text-center ${metallicBorder} ${isDark ? 'bg-slate-950/60 shadow-inner' : 'bg-slate-50 shadow-sm'}`}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
              ⏸
            </div>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Breakpoints</h2>
            <p className={`text-xs mb-6 max-w-xs ${textSecondary}`}>Click the margin in the editor to add breakpoints and pause execution during playback.</p>
            <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${metallicBorder} ${isDark ? 'bg-[#10141D] hover:bg-slate-800' : 'bg-white hover:bg-slate-100'}`}>
              Manage Breakpoints
            </button>
          </div>
        )}

      </div>
    </div>
  );
}