// Visualizer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { filterVariables, calculateTreeBounds, calculateGraphLayout } from './layoutEngine';

export default function Visualizer({ 
  steps, 
  currentStepIndex, 
  errorMessage, 
  isDark, 
  activeThemeName 
}) {
  const [activeTab, setActiveTab] = useState('VISUALIZATION');

  // --- MEASUREMENT STATE & OBSERVER ---
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 280 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const currentStep = steps[currentStepIndex];
  const variables = currentStep?.variables || {};
  const layout = currentStep?.visual_layout || { type: 'none' };
  const callStack = currentStep?.call_stack || [{ name: 'module', file: 'main.py', line: currentStep?.line || 1 }];

  // --- 3-Theme Active Flags ---
  const isLight = activeThemeName === 'light';
  const isCoffee = activeThemeName === 'coffee';

  // --- Updated Theme Colors with Scrollbars ---
  const themeStyles = {
    dark: { 
      bgPanel: 'bg-[#111A22]', bgContent: 'bg-[#0A1118]', textPrimary: 'text-[#E2E8F0]', textSecondary: 'text-[#94A3B8]', metallicBorder: 'border-[#1E293B]',
      scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#0A1118]', scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#1E293B] hover:[&::-webkit-scrollbar-thumb]:bg-[#38B2AC]'
    },
    coffee: { 
      bgPanel: 'bg-[#EFE8DE]', bgContent: 'bg-[#F5EBE1]', textPrimary: 'text-[#3E2723]', textSecondary: 'text-[#765A51]', metallicBorder: 'border-[#D7CCC8]',
      scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#F5EBE1]', scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#D7CCC8] hover:[&::-webkit-scrollbar-thumb]:bg-[#8C5A48]'
    },
    light: { 
      bgPanel: 'bg-[#D2F4F8]', bgContent: 'bg-[#FFFFFF]', textPrimary: 'text-[#0F172A]', textSecondary: 'text-[#475569]', metallicBorder: 'border-[#BBE8ED]',
      scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#FFFFFF]', scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#BBE8ED] hover:[&::-webkit-scrollbar-thumb]:bg-[#00CED1]'
    }
  };
  
  const activeStyle = themeStyles[activeThemeName] || themeStyles.dark;
  const { bgPanel, bgContent, textPrimary, textSecondary, metallicBorder, scrollTrack, scrollThumb } = activeStyle;

  const customScrollbar = `
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5
    ${scrollTrack}
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-thumb]:rounded-full 
    [&::-webkit-scrollbar-thumb]:border-2 
    [&::-webkit-scrollbar-thumb]:border-transparent 
    [&::-webkit-scrollbar-thumb]:bg-clip-content
    ${scrollThumb}
  `;

  // Extracted logic call
  const variableEntries = filterVariables(variables);

  return (
    <div className={`w-full h-full flex flex-col ${bgPanel}`}>
      <div className={`h-10 border-b ${metallicBorder} flex items-center justify-between px-4 text-xs font-bold`}>
        <div className="flex gap-6 h-full pt-1">
          {['VISUALIZATION', 'VARIABLES', 'CALL STACK'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 border-b-[3px] transition-colors ${
                activeTab === tab 
                  ? (isDark ? 'border-purple-600 text-purple-600 font-extrabold' : isLight ? 'border-[#7C3AED] text-[#7C3AED] font-extrabold' : 'border-[#8C5A48] text-[#8C5A48] font-extrabold')
                  : `border-transparent ${textSecondary} hover:${textPrimary}`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col p-6 overflow-auto gap-6 ${customScrollbar}`}>
        {errorMessage && (
          <div className={`p-3 rounded-lg text-xs font-mono shadow-md border ${metallicBorder} ${isDark ? 'bg-red-950/80 text-red-300' : 'bg-red-100 text-red-700'}`}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* --- TAB: VISUALIZATION --- */}
        {activeTab === 'VISUALIZATION' && (
          <>
            <div ref={containerRef} className={`flex-1 p-4 sm:p-6 rounded-2xl border ${metallicBorder} flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden ${bgContent} shadow-inner`}>
              
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold z-10">
                <span className={`uppercase tracking-wider ${isDark ? 'text-purple-600' : isLight ? 'text-[#7C3AED]' : 'text-[#8C5A48]'}`}>
                  {layout.type !== 'none' ? `${layout.type}: ${layout.key || ''}` : 'Canvas'}
                </span>
                <span className={textSecondary}>STEP {steps.length > 0 ? currentStepIndex + 1 : 0} / {steps.length}</span>
              </div>

              {/* ARRAY */}
              {layout.type === 'array' && (
                <div className={`flex gap-3 items-end py-6 overflow-x-auto max-w-full my-auto ${customScrollbar}`}>
                  <AnimatePresence mode="popLayout">
                    {layout.data.map((val, idx) => {
                      const pointingKeys = layout.pointers.filter(p => p.index === idx).map(p => p.key);
                      return (
                        <motion.div key={`arr-${idx}`} layout className="flex flex-col items-center">
                          <div className="h-6 flex flex-col items-center justify-end mb-1">
                            {pointingKeys.length > 0 && (
                              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shadow-md border ${metallicBorder} ${isDark ? 'bg-purple-600 text-white' : isLight ? 'bg-[#7C3AED] text-white' : 'bg-[#8C5A48] text-white'}`}>
                                {pointingKeys.join(', ')}
                              </span>
                            )}
                          </div>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold font-mono border ${metallicBorder} transition-all ${
                            pointingKeys.length > 0 
                              ? (isDark ? 'bg-purple-950/80 text-white shadow-purple-900/50' : isLight ? 'bg-[#00CED1] text-white shadow-md' : 'bg-[#8C5A48] text-white shadow-md')
                              : (isDark ? 'bg-slate-900 text-slate-200' : isLight ? 'bg-white text-[#0F172A] shadow-sm' : 'bg-white text-[#3E2723] shadow-sm')
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

              {/* TREE */}
              {layout.type === 'tree' && (() => {
                const { treeCenterX, treeCenterY } = calculateTreeBounds(layout.nodes);

                return (
                  <div className={`relative w-full h-full min-h-[16rem] flex items-center justify-center flex-1 overflow-hidden ${customScrollbar}`}>
                    <div 
                      className="relative w-0 h-0 flex items-center justify-center"
                      style={{ transform: `translate(${-treeCenterX}px, ${-treeCenterY}px)` }}
                    >
                      <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
                        {layout.edges?.map((edge, idx) => (
                          <line 
                            key={`edge-${idx}`} 
                            x1={edge.x1} y1={edge.y1} 
                            x2={edge.x2} y2={edge.y2} 
                            stroke={isDark ? '#6366f1' : isLight ? '#00CED1' : '#8C5A48'} 
                            strokeWidth="2" 
                          />
                        ))}
                      </svg>
                      
                      {layout.nodes.map((node, idx) => {
                        const activePointers = layout.pointers?.filter(p => p.target_val === node.val) || [];
                        const isTargeted = activePointers.length > 0;

                        return (
                          <div 
                            key={idx} 
                            style={{ position: 'absolute', left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
                          >
                            <div className={`
                              flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 text-xs sm:text-sm
                              ${isTargeted 
                                ? (isDark ? 'bg-purple-900 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.7)] text-white scale-110 z-10' : isLight ? 'bg-[#00CED1] border-[#00B4D8] shadow-lg text-white scale-110 z-10' : 'bg-[#8C5A48] border-[#765A51] shadow-lg text-white scale-110 z-10')
                                : (isDark ? 'bg-slate-800 border-slate-600 text-slate-300' : isLight ? 'bg-white border-[#BBE8ED] text-[#0F172A]' : 'bg-white border-[#D7CCC8] text-[#3E2723]')
                              }
                            `}>
                              {node.val}
                            </div>

                            {isTargeted && (
                              <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center z-20">
                                {activePointers.map((ptr, i) => (
                                  <span key={i} className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold rounded-md shadow-sm border ${metallicBorder} ${isDark ? 'text-purple-900 bg-purple-300' : isLight ? 'bg-[#F8FAFC] text-[#7C3AED]' : 'bg-[#EFE8DE] text-[#8C5A48]'}`}>
                                    {ptr.key}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              
              {/* GRAPH */}
              {layout.type === 'graph' && (() => {
                const { positionedNodes, nodeSize } = calculateGraphLayout(layout.nodes, dimensions);

                return (
                  <div className={`relative w-full h-full min-h-[16rem] flex items-center justify-center flex-1 overflow-hidden ${customScrollbar}`}>
                    <div className="relative w-0 h-0 flex items-center justify-center">
                      <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
                        {positionedNodes.makeNodeEdges?.() || positionedNodes.map((node) => {
                          const neighbors = Array.isArray(node.neighbors) 
                            ? node.neighbors 
                            : Object.keys(node.neighbors || {});

                          return neighbors.map((neighborId) => {
                            const targetNode = positionedNodes.find(n => String(n.id) === String(neighborId));
                            if (!targetNode) return null;
                            
                            return (
                              <line
                                key={`edge-${node.id}-${neighborId}`}
                                x1={node.x} y1={node.y}
                                x2={targetNode.x} y2={targetNode.y}
                                stroke={isDark ? '#6366f1' : isLight ? '#00CED1' : '#8C5A48'}
                                strokeWidth="2"
                                opacity="0.6"
                              />
                            );
                          });
                        })}
                      </svg>
                      
                      {positionedNodes.map((node, idx) => {
                        const isCurrent = variables.current_node === node.id || variables.node === node.id;
                        const isVisited = Array.isArray(variables.visited) && variables.visited.includes(node.id);
                        const inQueue = Array.isArray(variables.queue) && variables.queue.includes(node.id);

                        let bgColor = isDark ? "bg-purple-900 border-purple-500" : isLight ? "bg-[#00CED1] border-[#00B4D8]" : "bg-[#8C5A48] border-[#765A51]";
                        let extraStyles = "";

                        if (isCurrent) {
                          bgColor = isDark ? "bg-amber-500 border-amber-300" : isLight ? "bg-amber-400 border-amber-500" : "bg-amber-600 border-amber-500";
                          extraStyles = "ring-4 ring-amber-500/50 scale-110 z-10";
                        } else if (isVisited) {
                          bgColor = isDark ? "bg-emerald-600 border-emerald-400" : isLight ? "bg-emerald-500 border-emerald-600" : "bg-emerald-600 border-emerald-500";
                          extraStyles = "opacity-90";
                        } else if (inQueue) {
                          bgColor = isDark ? "bg-blue-500 border-blue-400" : isLight ? "bg-[#7C3AED] border-purple-500" : "bg-blue-600 border-blue-500";
                          extraStyles = "ring-2 ring-blue-400 border-dashed";
                        }

                        return (
                          <div 
                            key={`graph-node-${idx}`} 
                            style={{ 
                              position: 'absolute', 
                              left: node.x, 
                              top: node.y, 
                              transform: 'translate(-50%, -50%)' 
                            }}
                          >
                            <span 
                              style={{ width: `${nodeSize}px`, height: `${nodeSize}px` }}
                              className={`rounded-full border-2 text-white font-bold flex items-center justify-center text-xs shadow-md transition-all duration-300 ${bgColor} ${extraStyles}`}
                            >
                              {node.id}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {layout.type === 'none' && (
                <div className={`my-auto text-xs font-mono font-semibold ${textSecondary}`}>Execute a trace to render visual state.</div>
              )}
            </div>

            {/* Bottom 2 Mini Panels */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className={`p-4 rounded-2xl border ${metallicBorder} ${bgPanel}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-cyan-400' : isLight ? 'text-[#00CED1]' : 'text-[#8C5A48]'}`}>VARIABLES</div>
                <div className={`space-y-2 font-mono text-xs overflow-y-auto max-h-32 pr-1 ${customScrollbar}`}>
                  {variableEntries.map(([k, v]) => (
                    <div key={k} className="flex justify-between items-start gap-2">
                      <span className={textSecondary}>{k}</span>
                      <span className={`font-bold text-right break-all ${textPrimary}`}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                  {variableEntries.length === 0 && <span className={textSecondary}>No variables</span>}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${metallicBorder} ${bgPanel}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-purple-400' : isLight ? 'text-[#7C3AED]' : 'text-[#8C5A48]'}`}>CALL STACK</div>
                <div className={`space-y-2 font-mono text-xs overflow-y-auto max-h-32 pr-1 ${customScrollbar}`}>
                  {callStack.map((frame, idx) => (
                    <div key={idx} className={`p-2 rounded-xl shadow-sm border ${metallicBorder} ${isDark ? 'bg-purple-950/40 text-purple-200' : isLight ? 'bg-[#FFFFFF] text-[#0F172A]' : 'bg-[#F5EBE1] text-[#3E2723]'}`}>
                      &lt;{frame.name}&gt; {frame.file}:{frame.line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- TAB: FULL VARIABLES VIEW --- */}
        {activeTab === 'VARIABLES' && (
          <div className={`flex-1 p-6 rounded-2xl border ${metallicBorder} ${bgContent} shadow-inner overflow-auto ${customScrollbar}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-cyan-400' : isLight ? 'text-[#00CED1]' : 'text-[#8C5A48]'}`}>All Local Variables</h2>
            <div className="space-y-3 font-mono text-sm">
              {variableEntries.length > 0 ? variableEntries.map(([k, v]) => (
                <div key={k} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-xl border ${metallicBorder} ${bgPanel}`}>
                  <span className={`font-semibold ${textSecondary}`}>{k}</span>
                  <span className={`font-bold break-all mt-1 sm:mt-0 ${textPrimary}`}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                </div>
              )) : (
                <div className={textSecondary}>No variables currently in scope.</div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: FULL CALL STACK VIEW --- */}
        {activeTab === 'CALL STACK' && (
          <div className={`flex-1 p-6 rounded-2xl border ${metallicBorder} ${bgContent} shadow-inner overflow-auto ${customScrollbar}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-purple-400' : isLight ? 'text-[#7C3AED]' : 'text-[#8C5A48]'}`}>Call Stack Frames</h2>
            <div className="space-y-3 font-mono text-sm flex flex-col-reverse">
              {callStack.map((frame, idx) => (
                <div key={idx} className={`p-4 rounded-xl shadow-sm flex items-center justify-between border ${metallicBorder} ${isDark ? 'bg-purple-950/40 text-purple-200' : isLight ? 'bg-[#FFFFFF] text-[#0F172A]' : 'bg-[#EFE8DE] text-[#3E2723]'}`}>
                  <span className="font-bold">&lt;{frame.name}&gt;</span>
                  <span className="opacity-80">{frame.file} : Line {frame.line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}