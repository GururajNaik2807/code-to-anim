import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Visualizer({ 
  steps, 
  currentStepIndex, 
  isEditorMinimized, 
  setIsEditorMinimized, 
  errorMessage, 
  activeLineNumber, 
  isEditing, 
  user, 
  handleFirstStep, 
  handlePrevStep, 
  handleNextStep, 
  handleLastStep 
}) {
  
  const currentStep = steps[currentStepIndex];
  const variables = currentStep?.variables || {};
  const consoleOutput = currentStep?.output ?? "";
  
  // SECURE: Retrieve the pre-calculated layout directly from the backend
  const layout = currentStep?.visual_layout || { type: 'none' };

  const variableEntries = Object.entries(variables).filter(([val]) => {
    if (typeof val === 'string') return !(val.startsWith("<class") || val.startsWith("<function") || val.startsWith("<method") || val.startsWith("<module"));
    return true;
  });

  return (
    <div className={`h-full flex flex-col bg-gray-900/40 transition-all duration-300 ease-in-out ${isEditorMinimized ? "w-full" : "w-1/2"}`}>
      
      <div className="px-4 py-2 border-b bg-gray-900 border-gray-800 text-xs font-mono font-semibold text-gray-400 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditorMinimized(!isEditorMinimized)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-purple-300 rounded border border-gray-700 transition-colors flex items-center gap-2">
            {isEditorMinimized ? "▶ Show Editor" : "◀ Hide Editor"}
          </button>
          <span>VISUAL CANVAS & STATE INSPECTOR</span>
        </div>
        {activeLineNumber && (!isEditing || !user) && (
          <span className="text-xs text-purple-400 font-mono bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded">
            Line {activeLineNumber}
          </span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col p-6 overflow-auto gap-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {errorMessage && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 text-red-300 rounded-lg text-sm font-mono shadow-lg">⚠️ {errorMessage}</div>
        )}

        {/* --- DUMB RENDERING ENGINE --- */}
        {layout.type === 'tree' ? (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <span className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider">Binary Tree ({layout.key})</span>
              <span className="text-xs font-mono text-gray-500">nodes: {layout.nodes.length}</span>
            </div>
            <div className="relative w-full min-h-[220px] overflow-auto flex justify-center bg-gray-950/50 rounded-lg border border-gray-800/50">
              <div className="relative w-[500px] h-[220px]">
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {layout.edges.map((edge, idx) => (
                    <line key={`edge-${idx}`} x1={edge.x1} y1={edge.y1 + 16} x2={edge.x2} y2={edge.y2 + 16} stroke="#374151" strokeWidth="2" />
                  ))}
                </svg>
                <AnimatePresence>
                  {layout.nodes.map((node) => (
                    <motion.div
                      key={`tree-node-${node.id}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 bg-gray-900 border-green-500 flex items-center justify-center text-sm font-bold font-mono text-green-400 shadow-md shadow-green-500/20 z-10"
                      style={{ left: node.x, top: node.y + 16 }}
                    >
                      {node.val}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : layout.type === 'linked_list' ? (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Linked List ({layout.key})</span>
              <span className="text-xs font-mono text-gray-500">nodes: {layout.nodes.length}</span>
            </div>
            <div className="flex gap-2 items-center py-4 min-h-[120px] overflow-x-auto max-w-full px-4 scrollbar-thin scrollbar-thumb-gray-800">
              <AnimatePresence mode="popLayout">
                {layout.nodes.map((node, idx) => (
                  <motion.div key={`ll-node-${idx}`} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full border-2 bg-gray-800 border-blue-500/50 flex items-center justify-center text-lg font-bold font-mono text-blue-300 shadow-md shadow-blue-500/20">{node.val}</div>
                    </div>
                    {idx < layout.nodes.length - 1 && <div className="mx-2 text-gray-600 font-bold">➔</div>}
                    {idx === layout.nodes.length - 1 && (<><div className="mx-2 text-gray-600 font-bold">➔</div><div className="text-xs font-mono text-gray-500 font-bold italic">None</div></>)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : layout.type === 'dict' ? (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">Dictionary ({layout.key})</span>
              <span className="text-xs font-mono text-gray-500">keys: {layout.entries.length}</span>
            </div>
            <div className="w-full max-w-md flex flex-col gap-1.5 py-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
              {layout.entries.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {layout.entries.map((entry) => (
                    <motion.div key={`dict-${entry.key}`} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center bg-gray-950 border border-gray-800 rounded-md p-2.5 shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden"><span className="font-mono text-xs text-gray-500">Key:</span><span className="font-mono text-sm text-yellow-300 font-bold truncate">{entry.key}</span></div>
                      <div className="flex items-center gap-2 overflow-hidden"><span className="font-mono text-xs text-gray-500">Val:</span><span className="font-mono text-sm text-gray-200 truncate">{entry.val}</span></div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : <div className="text-center text-xs font-mono text-gray-600 italic py-4">Dictionary is empty</div>}
            </div>
          </div>
        ) : layout.type === 'array' ? (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Structure ({layout.key})</span>
              <span className="text-xs font-mono text-gray-500">length: {layout.data.length}</span>
            </div>
            <div className="flex gap-4 items-end py-4 min-h-[120px] overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-800">
              <AnimatePresence mode="popLayout">
                {layout.data.map((val, idx) => {
                  const pointingKeys = layout.pointers.filter(p => p.index === idx).map(p => p.key);
                  return (
                    <motion.div key={`array-node-${idx}-${val}`} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center flex-shrink-0">
                      <div className="h-7 flex flex-col items-center justify-end mb-1">
                        {pointingKeys.length > 0 && (
                          <motion.div initial={{ y: -4 }} animate={{ y: 0 }} className="flex flex-col items-center animate-bounce">
                            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-purple-500 text-white shadow">{pointingKeys.join(", ")}</span>
                            <span className="text-purple-400 text-xs">⬇️</span>
                          </motion.div>
                        )}
                      </div>
                      <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold font-mono transition-all duration-200 shadow-md ${pointingKeys.length > 0 ? "bg-purple-900/80 border-purple-400 text-white shadow-purple-500/30 scale-105" : "bg-gray-800 border-gray-700 text-purple-300"}`}>
                        {val}
                      </div>
                      <span className="mt-1 text-[10px] font-mono text-gray-500">[{idx}]</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-xl p-4 text-center text-gray-500 font-mono text-xs">No active list, tree, or dict structure currently in scope.</div>
        )}

        {/* SECTION 2: Variable State Inspector */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md">
          <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-3 border-b border-gray-800 pb-2 flex justify-between">
            <span>Variable Inspector</span><span>{variableEntries.length} Active</span>
          </div>
          {variableEntries.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {variableEntries.map(([varName, varVal]) => (
                <div key={varName} className={`p-2.5 rounded-lg border font-mono transition-all ${varName === layout.key ? "bg-purple-950/30 border-purple-800/60" : "bg-gray-950/60 border-gray-800"}`}>
                  <div className="text-[10px] text-gray-400 flex justify-between items-center mb-0.5">
                    <span className="font-bold text-purple-300">{varName}</span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{typeof varVal === 'object' ? JSON.stringify(varVal) : String(varVal)}</div>
                </div>
              ))}
            </div>
          ) : <div className="text-gray-500 font-mono text-xs text-center py-4">Run steps to inspect variables.</div>}
        </div>

        {/* SECTION 3: Terminal Console */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 shadow-inner flex flex-col min-h-[120px]">
          <div className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider mb-2 border-b border-gray-800/80 pb-1.5 flex justify-between items-center">
            <span>📟 Terminal Output</span><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
          <div className="flex-1 font-mono text-xs text-green-300 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[140px] scrollbar-thin scrollbar-thumb-gray-800">
            {consoleOutput ? consoleOutput : <span className="text-gray-600 italic">&gt; Output stream empty...</span>}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="h-16 border-t bg-gray-900 border-gray-800 flex items-center justify-center gap-4 px-6 shadow-inner">
        <button onClick={handleFirstStep} disabled={steps.length === 0 || currentStepIndex === 0} className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-md text-lg transition-colors">⏮️</button>
        <button onClick={handlePrevStep} disabled={steps.length === 0 || currentStepIndex === 0} className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-md text-lg transition-colors">⏪</button>
        <div className="font-mono text-xs font-semibold text-gray-400 min-w-[130px] text-center tracking-wide">{steps.length > 0 ? `STEP ${currentStepIndex + 1} / ${steps.length}` : "STEP 0 / 0"}</div>
        <button onClick={handleNextStep} disabled={steps.length === 0 || currentStepIndex === steps.length - 1} className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-md text-lg shadow-md transition-colors">⏩</button>
        <button onClick={handleLastStep} disabled={steps.length === 0 || currentStepIndex === steps.length - 1} className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-md text-lg shadow-md transition-colors">⏭️</button>
      </footer>
    </div>
  );
}