import React from 'react';

export default function Editor({ 
  code, 
  setCode, 
  isEditing, 
  user, 
  activeLineNumber, 
  handleSaveCode, 
  handleExecuteTrace, 
  isLoading, 
  isDark 
}) {
  const codeLines = code.split('\n');

  const bgPanel = isDark ? 'bg-[#0E1117]' : 'bg-white';
  const textSecondary = isDark ? 'text-gray-500' : 'text-gray-400';
  const borderCol = isDark ? 'border-gray-800/80' : 'border-gray-200';

  return (
    <div className={`w-1/2 h-full flex flex-col border-r ${borderCol} ${bgPanel}`}>
      
      {/* Editor Tab Header */}
      <div className={`h-10 border-b ${borderCol} flex items-center justify-between px-4 text-xs font-mono ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 border-t-2 border-purple-500 font-bold flex items-center gap-2 ${isDark ? 'bg-[#0E1117] text-white' : 'bg-white text-black'}`}>
            <span>🐍 main.py</span>
            <span className="text-[10px] text-gray-500">✕</span>
          </div>
          <button className={`p-1 hover:text-white ${textSecondary}`}>+</button>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-[11px]">
          <button title="Settings">⚙️</button>
        </div>
      </div>

      {/* Code Text Area or Trace View */}
      {isEditing && user ? (
        <div className="flex-1 flex flex-col p-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className={`flex-1 bg-transparent font-mono text-sm leading-6 resize-none outline-none ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto flex font-mono text-sm leading-6">
          <div className={`select-none py-4 text-right pr-3 pl-3 ${textSecondary} font-mono text-xs min-w-[40px] border-r ${borderCol}`}>
            {codeLines.map((_, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLineNumber;
              return (
                <div key={idx} className={`h-6 flex items-center justify-end gap-1 ${isActive ? "text-purple-400 font-bold" : ""}`}>
                  {isActive && <span className="text-[10px]">▶</span>}
                  <span>{lineNum}</span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 py-4 px-3">
            {codeLines.map((lineStr, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLineNumber;
              return (
                <div
                  key={idx}
                  className={`h-6 px-2 rounded flex items-center whitespace-pre transition-colors ${
                    isActive
                      ? "bg-purple-900/30 border-l-2 border-purple-500 text-purple-200 font-bold"
                      : isDark ? "text-gray-300" : "text-gray-800"
                  }`}
                >
                  {lineStr || " "}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Editor Bottom Status Bar */}
      <div className={`h-7 border-t ${borderCol} flex items-center justify-between px-4 text-[10px] font-mono ${textSecondary} ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}>
        <div>
          Ln {activeLineNumber || 1}, Col 1 &nbsp; Spaces: 4 &nbsp; UTF-8 &nbsp; LF &nbsp; Python 3.10
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Ready</span>
        </div>
      </div>

    </div>
  );
}