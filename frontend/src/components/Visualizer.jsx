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

  const bgPanel = isDark ? 'bg-[#0E1117]' : 'bg-white';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDark ? 'border-gray-800/80' : 'border-gray-200';

  const variableEntries = Object.entries(variables).filter(([val]) => {
    if (typeof val === 'string') return !(val.startsWith("<class") || val.startsWith("<function") || val.startsWith("<method") || val.startsWith("<module"));
    return true;
  });

  return (
    <div className={`w-1/2 h-full flex flex-col ${bgPanel}`}>
      
      {/* Canvas Tab Header */}
      <div className={`h-10 border-b ${borderCol} flex items-center justify-between px-4 text-xs font-bold ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex gap-6">
          {['VISUALIZATION', 'VARIABLES', 'CALL STACK', 'BREAKPOINTS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-purple-500 text-purple-400' 
                  : `border-transparent ${textSecondary} hover:text-gray-300`
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
          <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-300 rounded-lg text-xs font-mono">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Dynamic Visualization Canvas */}
        <div className={`p-6 rounded-xl border ${borderCol} shadow-inner flex flex-col items-center min-h-[220px] ${isDark ? 'bg-gray-950/50' : 'bg-gray-50'}`}>
          <div className="w-full flex justify-between items-center mb-4 text-xs font-mono font-bold">
            <span className="text-purple-400 uppercase">{layout.type !== 'none' ? `${layout.type}: ${layout.key || ''}` : 'Canvas'}</span>
            <span className={textSecondary}>STEP {steps.length > 0 ? currentStepIndex + 1 : 0} / {steps.length}</span>
          </div>

          {layout.type === 'array' ? (
            <div className="flex gap-3 items-end py-6 overflow-x-auto max-w-full">
              <AnimatePresence mode="popLayout">
                {layout.data.map((val, idx) => {
                  const pointingKeys = layout.pointers.filter(p => p.index === idx).map(p => p.key);
                  return (
                    <motion.div key={`arr-${idx}`} layout className="flex flex-col items-center">
                      <div className="h-6 flex flex-col items-center justify-end mb-1">
                        {pointingKeys.length > 0 && (
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-purple-600 text-white shadow">
                            {pointingKeys.join(', ')}
                          </span>
                        )}
                      </div>
                      <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-sm font-bold font-mono ${pointingKeys.length > 0 ? 'bg-purple-900/60 border-purple-400 text-white' : isDark ? 'bg-gray-900 border-gray-800 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}>
                        {val}
                      </div>
                      <span className={`mt-1 text-[10px] font-mono ${textSecondary}`}>[{idx}]</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className={`my-auto text-xs font-mono ${textSecondary}`}>Execute a trace to render visual state.</div>
          )}
        </div>

        {/* Bottom Inspector Cards */}
        <div className="grid grid-cols-3 gap-4">
          
          {/* Variables Inspector Card */}
          <div className={`p-4 rounded-xl border ${borderCol} ${isDark ? 'bg-gray-950/30' : 'bg-gray-50'}`}>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">VARIABLES</div>
            <div className="space-y-2 font-mono text-xs">
              {variableEntries.map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className={textSecondary}>{k}</span>
                  <span className="font-bold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call Stack Inspector Card */}
          <div className={`p-4 rounded-xl border ${borderCol} ${isDark ? 'bg-gray-950/30' : 'bg-gray-50'}`}>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">CALL STACK</div>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2 rounded bg-purple-950/30 border border-purple-800/50 text-purple-200">
                &lt;module&gt; main.py:{currentStep?.line || 1}
              </div>
            </div>
          </div>

          {/* Breakpoints Card */}
          <div className={`p-4 rounded-xl border ${borderCol} ${isDark ? 'bg-gray-950/30' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">BREAKPOINTS</span>
              <span className="text-xs text-purple-400 cursor-pointer">+ Add</span>
            </div>
            <div className={`text-xs font-mono ${textSecondary}`}>No breakpoints set</div>
          </div>

        </div>

      </div>

    </div>
  );
}