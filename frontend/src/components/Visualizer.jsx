import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Global scrollbar configuration for this component (thin & themed)
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

  const variableEntries = Object.entries(variables).filter(([_, val]) => {
      if (typeof val === 'string') return !(val.startsWith("<class") || val.startsWith("<function") || val.startsWith("<method") || val.startsWith("<module"));
      return true;
  });

  return (
    <div className={`w-full h-full flex flex-col ${bgPanel}`}>
      
      {/* Canvas Tab Header (Breakpoints removed) */}
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

      {/* Main Canvas Content */}
      <div className={`flex-1 flex flex-col p-6 overflow-auto gap-6 ${customScrollbar}`}>
        {errorMessage && (
          <div className={`p-3 rounded-lg text-xs font-mono shadow-md border ${metallicBorder} ${isDark ? 'bg-red-950/80 text-red-300' : 'bg-red-100 text-red-700'}`}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* --- TAB: VISUALIZATION (Dashboard View) --- */}
        {activeTab === 'VISUALIZATION' && (
          <>
            {/* CONTAINER REF ATTACHED HERE */}
            <div ref={containerRef} className={`flex-1 p-4 sm:p-6 rounded-2xl border ${metallicBorder} flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden ${bgContent} shadow-inner`}>
              
              {/* Header pinned to absolute top so it doesn't offset calculations */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold z-10">
                <span className={`uppercase tracking-wider ${isDark ? 'text-purple-600' : isLight ? 'text-[#7C3AED]' : 'text-[#8C5A48]'}`}>
                  {layout.type !== 'none' ? `${layout.type}: ${layout.key || ''}` : 'Canvas'}
                </span>
                <span className={textSecondary}>STEP {steps.length > 0 ? currentStepIndex + 1 : 0} / {steps.length}</span>
              </div>

              {/* 1. ARRAY LAYOUT RENDERER */}
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

              {/* 2. TREE LAYOUT RENDERER (Centered & Responsive) */}
              {layout.type === 'tree' && (() => {
                let minX = 0, maxX = 0, minY = 0, maxY = 0;
                if (layout.nodes && layout.nodes.length > 0) {
                  minX = Math.min(...layout.nodes.map(n => n.x || 0));
                  maxX = Math.max(...layout.nodes.map(n => n.x || 0));
                  minY = Math.min(...layout.nodes.map(n => n.y || 0));
                  maxY = Math.max(...layout.nodes.map(n => n.y || 0));
                }
                const treeCenterX = (minX + maxX) / 2;
                const treeCenterY = (minY + maxY) / 2;

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
              
              {/* 3. LINKED LIST LAYOUT RENDERER */}
              {layout.type === 'linked_list' && (
                <div className={`flex items-center gap-4 overflow-x-auto p-6 my-auto max-w-full ${customScrollbar}`}>
                  {layout.nodes?.map((node, idx) => (
                    <div key={`ll-${idx}`} className="flex items-center gap-4 flex-shrink-0">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base shadow-md font-mono border ${metallicBorder} ${
                        isDark ? 'bg-indigo-950 text-indigo-200 border-indigo-500' : isLight ? 'bg-[#00CED1] text-white border-[#00B4D8]' : 'bg-[#8C5A48] text-white'
                      }`}>
                        {node.val}
                      </div>
                      {idx < layout.nodes.length - 1 && (
                        <span className={`font-bold text-xl ${isDark ? 'text-purple-500' : isLight ? 'text-[#7C3AED]' : 'text-[#8C5A48]'}`}>→</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 4. DICTIONARY / HASHMAP LAYOUT RENDERER */}
              {layout.type === 'dict' && (
                <div className={`flex flex-wrap gap-2 items-center justify-center py-4 my-auto overflow-auto ${customScrollbar}`}>
                  {layout.entries?.map((entry, idx) => (
                    <div key={`dict-${idx}`} className={`px-3 py-2 rounded-xl flex items-center gap-2 font-mono text-xs border ${metallicBorder} ${isDark ? 'bg-slate-900 text-slate-200' : isLight ? 'bg-[#D2F4F8] text-[#0F172A]' : 'bg-white text-slate-800'}`}>
                      <span className={`font-bold ${isDark ? 'text-purple-400' : isLight ? 'text-[#7C3AED]' : 'text-[#8C5A48]'}`}>{entry.key}:</span>
                      <span>{entry.val}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 5. GRAPH LAYOUT RENDERER (Adaptive Bounds & Scaling) */}
              {layout.type === 'graph' && (() => {
                const nodesCount = layout.nodes?.length || 0;
                
                const nodeSize = nodesCount > 8 ? 32 : nodesCount > 5 ? 40 : 48; 
                const padding = nodeSize + 24; 
                
                const availableWidth = Math.max(120, dimensions.width - padding * 2);
                const availableHeight = Math.max(120, dimensions.height - padding * 2);
                
                const radius = Math.min(availableWidth, availableHeight) / 2;

                const positionedNodes = layout.nodes?.map((node, idx) => {
                  const angle = (idx / nodesCount) * 2 * Math.PI - Math.PI / 2;
                  return {
                    ...node,
                    x: radius * Math.cos(angle),
                    y: radius * Math.sin(angle)
                  };
                }) || [];

                return (
                  <div className={`relative w-full h-full min-h-[16rem] flex items-center justify-center flex-1 overflow-hidden ${customScrollbar}`}>
                    <div className="relative w-0 h-0 flex items-center justify-center">
                      <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
                        {positionedNodes.map((node) => {
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

              {/* 6. VERTICAL STACK LAYOUT RENDERER */}
              {layout.type === 'stack' && (
                <div className={`flex flex-col-reverse items-center justify-end h-full w-full pt-4 pb-2 relative z-0 ${customScrollbar}`}>
                  <div className={`w-40 h-2 rounded-full mt-2 shadow-md shrink-0 ${isDark ? 'bg-slate-700' : isLight ? 'bg-[#BBE8ED]' : 'bg-slate-300'}`}></div>
                  <div className={`flex flex-col-reverse gap-2 items-center w-full overflow-y-auto px-4 pb-1 ${customScrollbar}`}>
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
                            <div className={`w-32 h-12 rounded-xl flex items-center justify-center text-sm font-bold font-mono shadow-md border-b-4 shrink-0 border ${metallicBorder} transition-all ${
                              idx === layout.data.length - 1 
                                ? (isDark ? 'bg-purple-600 border-purple-800 text-white' : isLight ? 'bg-[#00CED1] border-[#00B4D8] text-white' : 'bg-[#8C5A48] border-[#765A51] text-white') 
                                : (isDark ? 'bg-slate-800 border-slate-900 text-slate-200' : isLight ? 'bg-white border-[#BBE8ED] text-[#0F172A]' : 'bg-white border-[#D7CCC8] text-[#3E2723]')
                            }`}>
                              {val}
                            </div>
                            
                            {pointingKeys.length > 0 && (
                              <div className="absolute left-[calc(50%+4.5rem)] top-1/2 -translate-y-1/2 flex items-center z-10">
                                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shadow-md whitespace-nowrap border ${metallicBorder} ${isDark ? 'bg-amber-600 text-white' : isLight ? 'bg-[#7C3AED] text-white' : 'bg-[#EFE8DE] text-[#8C5A48]'}`}>
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
              <div className={`relative w-full flex justify-center mb-auto min-h-[160px] ${customScrollbar}`}>
                <div className="relative w-[90%] max-w-2xl h-24 flex items-center px-4">
                  <div className={`absolute inset-0 w-full h-full border-t-4 border-b-4 pointer-events-none rounded-sm ${isDark ? 'border-slate-600' : isLight ? 'border-[#BBE8ED]' : 'border-[#D7CCC8]'}`}></div>
                  <div className={`relative w-full h-full flex items-center gap-4 overflow-x-auto z-10 px-2 py-4 ${customScrollbar}`}>
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
                            {pointingKeys.length > 0 && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center whitespace-nowrap z-20">
                                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shadow-md border ${metallicBorder} ${isDark ? 'bg-amber-600 text-white' : isLight ? 'bg-[#7C3AED] text-white' : 'bg-[#EFE8DE] text-[#8C5A48]'}`}>
                                  ↓ {pointingKeys.join(', ')}
                                </span>
                              </div>
                            )}

                            <div className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-bold font-mono shadow-md border-b-4 border ${metallicBorder} transition-all ${
                              idx === 0 
                                ? (isDark ? 'bg-emerald-600 border-emerald-800 text-white' : isLight ? 'bg-[#00CED1] border-[#00B4D8] text-white' : 'bg-[#8C5A48] border-[#765A51] text-white') 
                                : (isDark ? 'bg-slate-800 border-slate-900 text-slate-200' : isLight ? 'bg-white border-[#BBE8ED] text-[#0F172A]' : 'bg-white border-[#D7CCC8] text-[#3E2723]')
                            }`}>
                              {val}
                            </div>
                            
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
            
            {/* 8. HASH SET LAYOUT RENDERER */}
              {layout.type === 'set' && (
                <div className={`flex flex-col items-center justify-center my-auto p-4 w-full overflow-auto ${customScrollbar}`}>
                  <div className={`p-5 rounded-2xl border ${metallicBorder} border-dashed flex flex-wrap gap-3 items-center justify-center max-w-lg ${isDark ? 'bg-slate-900/50 border-purple-500/40' : isLight ? 'bg-[#D2F4F8]/50 border-[#00CED1]/40' : 'bg-[#8C5A48]/5 border-[#8C5A48]/30'}`}>
                    <AnimatePresence>
                      {layout.data?.map((val, idx) => (
                        <motion.div
                          key={`set-${val}-${idx}`}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold shadow-md border ${metallicBorder} ${
                            isDark ? 'bg-purple-950 text-purple-200 border-purple-500/60' : isLight ? 'bg-[#00CED1] text-white border-[#00B4D8]' : 'bg-[#8C5A48] text-white'
                          }`}
                        >
                          {val}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {(!layout.data || layout.data.length === 0) && (
                      <span className={`text-xs font-mono italic ${textSecondary}`}>Empty Set ∅</span>
                    )}
                  </div>
                </div>
              )}

            {/* Bottom 2 Mini Panels (Variables & Call Stack split 50/50) */}
            <div className="grid grid-cols-2 gap-4">
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