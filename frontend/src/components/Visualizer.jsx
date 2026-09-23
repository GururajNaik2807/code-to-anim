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
  const output = currentStep?.output || '';

  const isLight = activeThemeName === 'light';

  const themeStyles = {
    dark: { 
      bgPanel: 'bg-[#0B1117]', bgContent: 'bg-[#0A1016]', textPrimary: 'text-[#E6EDF3]', textSecondary: 'text-[#8B9AA8]', metallicBorder: 'border-[#26323D]',
      scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#0A1016]', scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#26323D] hover:[&::-webkit-scrollbar-thumb]:bg-[#8B9AA8]'
    },
    coffee: { 
      bgPanel: 'bg-[#EFE8DE]', bgContent: 'bg-[#F5EBE1]', textPrimary: 'text-[#3E2723]', textSecondary: 'text-[#765A51]', metallicBorder: 'border-[#D7CCC8]',
      scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#F5EBE1]', scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#D7CCC8] hover:[&::-webkit-scrollbar-thumb]:bg-[#8C5A48]'
    },
    light: { 
      bgPanel: 'bg-[#FFFEFA]', bgContent: 'bg-[#F8F5EE]', textPrimary: 'text-[#202124]', textSecondary: 'text-[#5E5B55]', metallicBorder: 'border-[#E8E3D8]',
      scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#FFFEFA]', scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#D9D1C4] hover:[&::-webkit-scrollbar-thumb]:bg-[#817D74]'
    }
  };
  
  const activeStyle = themeStyles[activeThemeName] || themeStyles.dark;
  const { bgPanel, bgContent, textPrimary, textSecondary, metallicBorder, scrollTrack, scrollThumb } = activeStyle;

  const customScrollbar = `
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5
    ${scrollTrack}
    [&::-webkit-scrollbar-track]:rounded-none
    [&::-webkit-scrollbar-thumb]:rounded-none 
    [&::-webkit-scrollbar-thumb]:border-2 
    [&::-webkit-scrollbar-thumb]:border-transparent 
    [&::-webkit-scrollbar-thumb]:bg-clip-content
    ${scrollThumb}
  `;

  const variableEntries = filterVariables(variables);

  // Dynamic Scaling Calculations
  const availableW = Math.max(dimensions.width - 40, 100);
  const availableH = Math.max(dimensions.height - 60, 100);
  
  let visualScale = 1;
  let treeBounds = null;
  let graphData = null;

  if (['array', 'stack', 'queue'].includes(layout.type)) {
    const reqW = (layout.data?.length || 0) * 64; 
    visualScale = Math.max(0.3, Math.min(1, availableW / reqW));
  } else if (layout.type === 'linked_list') {
    const reqW = (layout.nodes?.length || 0) * 110;
    visualScale = Math.max(0.3, Math.min(1, availableW / reqW));
  } else if (layout.type === 'tree') {
    treeBounds = calculateTreeBounds(layout.nodes);
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    if (layout.nodes?.length > 0) {
       minX = Math.min(...layout.nodes.map(n => n.x || 0));
       maxX = Math.max(...layout.nodes.map(n => n.x || 0));
       minY = Math.min(...layout.nodes.map(n => n.y || 0));
       maxY = Math.max(...layout.nodes.map(n => n.y || 0));
    }
    const reqW = Math.max(maxX - minX + 100, 100);
    const reqH = Math.max(maxY - minY + 100, 100);
    visualScale = Math.max(0.2, Math.min(1, availableW / reqW, availableH / reqH));
  } else if (layout.type === 'graph') {
    graphData = calculateGraphLayout(layout.nodes, dimensions);
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    const nodesToMeasure = graphData.positionedNodes || [];
    if (nodesToMeasure.length > 0) {
       minX = Math.min(...nodesToMeasure.map(n => n.x || 0));
       maxX = Math.max(...nodesToMeasure.map(n => n.x || 0));
       minY = Math.min(...nodesToMeasure.map(n => n.y || 0));
       maxY = Math.max(...nodesToMeasure.map(n => n.y || 0));
    }
    const reqW = Math.max(maxX - minX + 100, 100);
    const reqH = Math.max(maxY - minY + 100, 100);
    visualScale = Math.max(0.2, Math.min(1, availableW / reqW, availableH / reqH));
  }

  return (
    <div className={`w-full flex-1 min-h-0 flex flex-col ${bgPanel}`}>
      <div className={`h-10 border-b ${metallicBorder} flex items-center justify-between px-4 text-xs font-bold`}>
        <div className="flex gap-6 h-full pt-1">
          {['VISUALIZATION', 'VARIABLES'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 border-b-[3px] transition-colors ${
                activeTab === tab 
                  ? (isDark ? 'border-[#3FB6A8] text-[#3FB6A8] font-extrabold' : isLight ? 'border-[#31599B] text-[#31599B] font-extrabold' : 'border-[#8C5A48] text-[#8C5A48] font-extrabold')
                  : `border-transparent ${textSecondary} hover:${textPrimary}`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 min-h-0 flex flex-col p-6 overflow-hidden gap-6`}>
        
        {/* --- TAB: VISUALIZATION --- */}
        {activeTab === 'VISUALIZATION' && (
          <div ref={containerRef} className={`flex-1 min-h-0 p-4 sm:p-6 rounded-lg border ${metallicBorder} flex flex-col items-center justify-center relative overflow-hidden ${bgContent}`}>
            
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold z-10 pointer-events-none">
              <span className={`uppercase tracking-wider ${isDark ? 'text-[#3FB6A8]' : isLight ? 'text-[#31599B]' : 'text-[#8C5A48]'}`}>
                {layout.type !== 'none' ? `${layout.type}: ${layout.key || ''}` : 'CANVAS'}
              </span>
              <span className={textSecondary}>STEP {steps.length > 0 ? currentStepIndex + 1 : 0} / {steps.length}</span>
            </div>

            {/* ARRAY / STACK / QUEUE */}
            {['array', 'stack', 'queue'].includes(layout.type) && (
              <div className={`relative w-full h-full flex items-center justify-center overflow-auto ${customScrollbar}`}>
                <div 
                  style={{ transform: `scale(${visualScale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
                  className={`flex gap-3 items-center justify-center p-8 w-max`}
                >
                  <AnimatePresence mode="popLayout">
                    {layout.data.map((val, idx) => {
                      const pointingKeys = layout.pointers.filter(p => p.index === idx).map(p => p.key);
                      return (
                        <motion.div key={`arr-${idx}`} layout className="relative flex flex-col items-center">
                          
                          {/* Floating Pointers */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-max">
                            {pointingKeys.map((ptrKey, i) => (
                              <span key={i} className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md shadow-sm border transition-colors ${metallicBorder} ${isDark ? 'bg-[#121B24] text-[#3FB6A8] border-[#3FB6A8]/50' : isLight ? 'bg-[#31599B] text-white' : 'bg-[#8C5A48] text-white'}`}>
                                {ptrKey}
                              </span>
                            ))}
                          </div>

                          {/* Node Box */}
                          <div className={`w-12 h-12 rounded-lg border shadow-sm flex items-center justify-center text-sm font-bold font-mono transition-colors ${
                            pointingKeys.length > 0 
                              ? (isDark ? 'bg-[#121B24] text-white border-[#3FB6A8] shadow-[#3FB6A8]/10' : isLight ? 'bg-[#31599B] text-white border-[#274B85]' : 'bg-[#8C5A48] text-white')
                              : (isDark ? 'bg-[#101820] text-[#E6EDF3] border-[#26323D]' : isLight ? 'bg-[#FFFEFA] text-[#202124] border-[#E8E3D8]' : 'bg-white text-[#3E2723] border-[#D7CCC8]')
                          }`}>
                            {val}
                          </div>
                          
                          {/* Index Label */}
                          <span className={`absolute top-full mt-2 text-[10px] font-mono font-bold ${textSecondary}`}>[{idx}]</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* LINKED LIST */}
            {layout.type === 'linked_list' && (
              <div className={`relative w-full h-full flex items-center justify-center overflow-auto ${customScrollbar}`}>
                <div 
                  style={{ transform: `scale(${visualScale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
                  className={`flex items-center justify-center p-8 w-max`}
                >
                  <AnimatePresence mode="popLayout">
                    {layout.nodes.map((node, idx) => {
                      const activePointers = layout.pointers?.filter(p => p.target_val === node.val) || [];
                      
                      return (
                        <motion.div key={`ll-${idx}`} layout className="flex items-center">
                          <div className="relative flex flex-col items-center">
                            
                            {/* Floating Pointers */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-max">
                              {activePointers.map((ptr, i) => (
                                <span key={i} className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md shadow-sm border transition-colors ${metallicBorder} ${isDark ? 'bg-[#121B24] text-[#3FB6A8] border-[#3FB6A8]/50' : isLight ? 'bg-[#31599B] text-white' : 'bg-[#8C5A48] text-white'}`}>
                                  {ptr.key}
                                </span>
                              ))}
                            </div>
                            
                            {/* Node Box */}
                            <div className={`w-14 h-10 rounded-lg border flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
                              activePointers.length > 0 
                                ? (isDark ? 'bg-[#121B24] border-[#3FB6A8] text-white shadow-[#3FB6A8]/10' : isLight ? 'bg-[#31599B] border-[#274B85] text-white' : 'bg-[#8C5A48] border-[#765A51] text-white')
                                : (isDark ? 'bg-[#101820] border-[#26323D] text-[#E6EDF3]' : isLight ? 'bg-[#FFFEFA] border-[#E8E3D8] text-[#202124]' : 'bg-white border-[#D7CCC8] text-[#3E2723]')
                            }`}>
                              {node.val}
                            </div>
                          </div>

                          {idx < layout.nodes.length - 1 && (
                            <div className={`mx-3 text-2xl font-bold flex items-center justify-center ${isDark ? 'text-[#3FB6A8]' : isLight ? 'text-[#31599B]' : 'text-[#8C5A48]'}`}>
                              →
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
            
            {/* TREE */}
            {layout.type === 'tree' && (() => {
              const { treeCenterX, treeCenterY } = treeBounds;

              return (
                <div className={`relative w-full h-full flex items-center justify-center overflow-auto ${customScrollbar}`}>
                  <div 
                    style={{ transform: `scale(${visualScale}) translate(${-treeCenterX}px, ${-treeCenterY}px)`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
                    className="relative w-0 h-0 flex items-center justify-center"
                  >
                    <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
                      {layout.edges?.map((edge, idx) => (
                        <line 
                          key={`edge-${idx}`} 
                          x1={edge.x1} y1={edge.y1} 
                          x2={edge.x2} y2={edge.y2} 
                          stroke={isDark ? '#3FB6A8' : isLight ? '#31599B' : '#8C5A48'} 
                          strokeWidth="2" 
                          opacity="0.7"
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
                          <div className="relative flex items-center justify-center">
                            
                            {/* Floating Pointers */}
                            <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-max z-20">
                              {activePointers.map((ptr, i) => (
                                <span key={i} className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md shadow-sm border transition-colors ${metallicBorder} ${isDark ? 'bg-[#121B24] text-[#3FB6A8] border-[#3FB6A8]/50' : isLight ? 'bg-[#EAF0FA] text-[#31599B]' : 'bg-[#EFE8DE] text-[#8C5A48]'}`}>
                                  {ptr.key}
                                </span>
                              ))}
                            </div>

                            {/* Node Box */}
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border shadow-sm flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 z-10 ${
                              isTargeted 
                                ? (isDark ? 'bg-[#121B24] border-[#3FB6A8] text-white scale-110 shadow-[#3FB6A8]/10' : isLight ? 'bg-[#31599B] border-[#274B85] text-white scale-110' : 'bg-[#8C5A48] border-[#765A51] text-white scale-110')
                                : (isDark ? 'bg-[#101820] border-[#26323D] text-[#E6EDF3]' : isLight ? 'bg-[#FFFEFA] border-[#E8E3D8] text-[#202124]' : 'bg-white border-[#D7CCC8] text-[#3E2723]')
                            }`}>
                              {node.val}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            
            {/* GRAPH */}
            {layout.type === 'graph' && (() => {
              const { positionedNodes, nodeSize } = graphData;

              return (
                <div className={`relative w-full h-full flex items-center justify-center overflow-auto ${customScrollbar}`}>
                  <div 
                    style={{ transform: `scale(${visualScale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
                    className="relative w-0 h-0 flex items-center justify-center"
                  >
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
                              stroke={isDark ? '#3FB6A8' : isLight ? '#31599B' : '#8C5A48'}
                              strokeWidth="2"
                              opacity="0.5"
                            />
                          );
                        });
                      })}
                    </svg>
                    
                    {positionedNodes.map((node, idx) => {
                      const isCurrent = variables.current_node === node.id || variables.node === node.id;
                      const isVisited = Array.isArray(variables.visited) && variables.visited.includes(node.id);
                      const inQueue = Array.isArray(variables.queue) && variables.queue.includes(node.id);

                      let bgColor = isDark ? "bg-[#101820] border-[#26323D] text-[#E6EDF3]" : isLight ? "bg-[#FFFEFA] border-[#E8E3D8] text-[#202124]" : "bg-white border-[#D7CCC8] text-[#3E2723]";
                      let extraStyles = "";

                      if (isCurrent) {
                        bgColor = isDark ? "bg-[#D6A64F] border-[#D6A64F] text-[#0A1016]" : isLight ? "bg-[#C8533C] text-[#FFFEFA] border-[#A94330]" : "bg-amber-600 border-amber-500";
                        extraStyles = "scale-110 z-20 shadow-md";
                      } else if (isVisited) {
                        bgColor = isDark ? "bg-[#55B878] border-[#55B878] text-[#0A1016]" : isLight ? "bg-[#31599B]/80 border-[#274B85] text-white" : "bg-emerald-600 border-emerald-500 text-white";
                        extraStyles = "opacity-90 z-10 shadow-sm";
                      } else if (inQueue) {
                        bgColor = isDark ? "bg-[#121B24] border-[#3FB6A8] text-[#3FB6A8]" : isLight ? "bg-[#EAF0FA] text-[#31599B] border-[#31599B]" : "bg-blue-600 border-blue-500 text-white";
                        extraStyles = "border-dashed z-10 shadow-sm";
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
                            className={`rounded-lg border shadow-sm font-bold font-mono flex items-center justify-center text-xs transition-all duration-300 ${bgColor} ${extraStyles}`}
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
              <div className={`my-auto flex flex-col items-center justify-center text-center gap-2 ${textSecondary}`}>
                <span className="font-mono text-sm font-bold">Your visualization will appear here</span>
                <span className="font-mono text-xs">Execute your code to generate an interactive trace.</span>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: VARIABLES --- */}
        {activeTab === 'VARIABLES' && (
          <div className={`flex-1 min-h-0 p-6 rounded-lg border ${metallicBorder} ${bgContent} overflow-auto ${customScrollbar}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-[#3FB6A8]' : isLight ? 'text-[#31599B]' : 'text-[#8C5A48]'}`}>Variables</h2>
            <div className="space-y-3 font-mono text-sm">
              {variableEntries.length > 0 ? variableEntries.map(([k, v]) => (
                <div key={k} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border-b ${metallicBorder}`}>
                  <span className={`font-semibold ${textSecondary}`}>{k}</span>
                  <span className={`font-bold break-all mt-1 sm:mt-0 ${textPrimary}`}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                </div>
              )) : (
                <div className={textSecondary}>No variables currently in scope.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}