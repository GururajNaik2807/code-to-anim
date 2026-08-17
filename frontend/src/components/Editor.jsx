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
  isEditorMinimized 
}) {
  const codeLines = code.split('\n');

  return (
    <div 
      className={`h-full flex flex-col bg-gray-950 transition-all duration-300 ease-in-out border-gray-800 ${
        isEditorMinimized ? "w-0 border-r-0 overflow-hidden opacity-0" : "w-1/2 border-r opacity-100"
      }`}
    >
      <div className="px-4 py-2 border-b bg-gray-900 border-gray-800 text-xs font-mono font-semibold text-gray-400 flex justify-between items-center whitespace-nowrap min-w-max">
        <span>{isEditing && user ? "✏️ PYTHON EDITOR" : "🔍 EXECUTION TRACE"}</span>
        <span className="text-purple-400">main.py</span>
      </div>

      {isEditing && user ? (
        <div className="flex-1 flex flex-col p-4 bg-gray-950 min-w-[300px]">
          <div className="flex-1 relative flex rounded-lg border border-gray-800 bg-gray-900/60 overflow-hidden focus-within:border-purple-500/80 transition-colors">
            <div className="select-none py-3 px-2 bg-gray-950/80 text-right text-gray-600 font-mono text-xs leading-6 border-r border-gray-800/80 min-w-[36px]">
              {codeLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Type or paste any Python algorithm code here..."
              spellCheck={false}
              className="flex-1 bg-transparent p-3 text-gray-100 font-mono text-sm leading-6 resize-none focus:outline-none scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
            />
          </div>

          <div className="mt-3 flex justify-end gap-3">
            <button
              onClick={handleSaveCode}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-blue-300 font-bold text-sm rounded-lg border border-blue-500/30 transition-all"
            >
              💾 Save Code
            </button>
            <button
              onClick={handleExecuteTrace}
              disabled={isLoading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold text-sm rounded-lg shadow-lg shadow-purple-500/20 transition-all"
            >
              {isLoading ? "Running..." : "🚀 Run & Visualize"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative bg-gray-950 font-mono text-sm overflow-auto flex min-w-[300px] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <div className="bg-gray-900/50 border-r border-gray-800/60 select-none py-4 text-right pr-3 pl-2 text-gray-600 font-mono text-xs leading-6 min-w-[40px]">
            {codeLines.map((_, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLineNumber;
              return (
                <div key={idx} className={`h-6 flex items-center justify-end gap-1 ${isActive ? "text-purple-400 font-bold" : ""}`}>
                  {isActive && <span className="text-xs animate-pulse">👉</span>}
                  <span>{lineNum}</span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 py-4 px-3 relative">
            {codeLines.map((lineStr, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLineNumber;
              return (
                <div
                  key={idx}
                  className={`h-6 px-2 rounded flex items-center font-mono text-sm leading-6 whitespace-pre transition-colors duration-150 ${
                    isActive
                      ? "bg-purple-900/40 border-l-4 border-purple-500 text-purple-200 font-semibold shadow-sm"
                      : "text-gray-300"
                  }`}
                >
                  {lineStr || " "}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}