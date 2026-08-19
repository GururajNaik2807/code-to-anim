import React, { useRef, useEffect } from 'react';

const highlightPythonCode = (line, isDark) => {
  if (!line) return <span> </span>;

  if (line.trim().startsWith('#')) {
    return <span className={isDark ? "text-slate-500 italic" : "text-slate-400 italic"}>{line}</span>;
  }

  const keywords = /\b(def|return|for|in|range|if|else|elif|break|continue|print|import|from|as|while|class|try|except)\b/g;
  const numbers = /\b(\d+)\b/g;
  const strings = /(["'].*?["'])/g;

  return (
    <span>
      {line.split(/(\s+|["'].*?["']|\b(?:def|return|for|in|range|if|else|elif|break|continue|print|import|from|as|while|class)\b|\b\d+\b|[()\[\]{}:,.=+\-*/<>])/).map((part, i) => {
        if (!part) return null;
        if (part.match(keywords)) {
          return <span key={i} className={isDark ? "text-purple-400 font-semibold" : "text-purple-700 font-semibold"}>{part}</span>;
        } else if (part.match(strings)) {
          return <span key={i} className={isDark ? "text-emerald-300" : "text-emerald-700"}>{part}</span>;
        } else if (part.match(numbers)) {
          return <span key={i} className={isDark ? "text-amber-300" : "text-amber-600"}>{part}</span>;
        } else if (['for', 'in', 'range'].includes(part.trim())) {
          return <span key={i} className={isDark ? "text-blue-400" : "text-blue-600"}>{part}</span>;
        }
        return <span key={i} className={isDark ? "text-slate-200" : "text-slate-900"}>{part}</span>;
      })}
    </span>
  );
};

export default function Editor({ 
  code, 
  setCode, 
  isEditing, 
  setIsEditing,
  user, 
  openAuthModal,
  activeLineNumber, 
  handleSaveCode, 
  handleExecuteTrace, 
  isLoading, 
  isDark 
}) {
  const codeLines = code.split('\n');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);
  
  const scrollbarStyles = `
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar]:h-2
      [&::-webkit-scrollbar-track]:bg-transparent 
      [&::-webkit-scrollbar-thumb]:rounded-full 
      ${isDark 
        ? '[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600' 
        : '[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'}
    `;
    
  const handleEditorClick = () => {
    if (!user) {
      openAuthModal('Log in to unlock direct code editing!');
      return;
    }
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  // Professional color themes with metallic black borders
  const bgPanel = isDark ? 'bg-[#10141D]' : 'bg-[#FFFFFF]';
  const bgCodeArea = isDark ? 'bg-[#0A0D14]' : 'bg-[#FAFAFC]';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  
  // High-end metallic black border for both dark and light modes
  const metallicBorder = 'border border-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_5px_rgba(0,0,0,0.25)]';

  return (
    <div className={`w-1/2 h-full flex flex-col ${metallicBorder} border-y-0 border-l-0 ${bgPanel}`}>
      
      {/* Editor Tab Header */}
      <div className={`h-10 ${metallicBorder} border-x-0 border-t-0 flex items-center justify-between px-4 text-xs font-mono ${isDark ? 'bg-[#0E121B]' : 'bg-slate-100'}`}>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 border-t-2 border-purple-600 font-bold flex items-center gap-2 ${metallicBorder} border-b-0 ${isDark ? 'bg-[#10141D] text-white' : 'bg-white text-slate-900'}`}>
            <span>🐍 main.py</span>
            {user && (
              <span className="text-[10px] text-emerald-500 font-mono ml-1 font-semibold">
                {isEditing ? '● Editing Mode' : '● Click to Edit'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          {!user && <span className="text-amber-600 font-medium text-[10px]">🔒 Log in to edit</span>}
          {user && isEditing && (
            <button 
              onClick={() => setIsEditing(false)} 
              className="px-2 py-0.5 rounded bg-slate-900 text-white hover:bg-slate-800 text-[10px] shadow"
            >
              Done Editing
            </button>
          )}
        </div>
      </div>

      {/* Main Code Area with Click-to-Edit Functionality */}
      <div 
        onClick={handleEditorClick}
        className={`flex-1 flex overflow-auto font-mono text-sm leading-6 ${bgCodeArea} cursor-text relative ${scrollbarStyles}`}
      >
        <div className={`select-none py-4 text-right pr-3 pl-3 ${textSecondary} font-mono text-xs min-w-[40px] border-r ${isDark ? 'border-slate-800/80' : 'border-slate-300'}`}>
          {codeLines.map((_, idx) => {
            const lineNum = idx + 1;
            const isActive = lineNum === activeLineNumber;
            return (
              <div key={idx} className={`h-6 flex items-center justify-end gap-1 ${isActive ? "text-purple-600 font-bold" : ""}`}>
                {isActive && <span className="text-[10px]">▶</span>}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {isEditing && user ? (
          <div className="flex-1 py-4 px-3 flex flex-col relative">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className={`w-full h-full bg-transparent font-mono text-sm leading-6 resize-none outline-none ${isDark ? 'text-slate-100' : 'text-slate-900'} caret-purple-600 whitespace-pre ${scrollbarStyles}`}
            />
          </div>
        ) : (
          <div className="flex-1 py-4 px-3">
            {codeLines.map((lineStr, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLineNumber;
              return (
                <div
                  key={idx}
                  className={`h-6 px-2 rounded flex items-center whitespace-pre transition-colors ${
                    isActive
                      ? isDark 
                        ? "bg-purple-950/60 border-l-2 border-purple-500 text-purple-200 font-bold shadow-sm" 
                        : "bg-purple-100 border-l-2 border-purple-600 text-purple-950 font-bold shadow-sm"
                      : isDark ? "text-slate-300 hover:bg-slate-900/40" : "text-slate-800 hover:bg-slate-200/50"
                  }`}
                >
                  {highlightPythonCode(lineStr, isDark)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Bottom Status Bar */}
      <div className={`h-7 ${metallicBorder} border-x-0 border-b-0 flex items-center justify-between px-4 text-[10px] font-mono ${textSecondary} ${isDark ? 'bg-[#0E121B]' : 'bg-slate-100'}`}>
        <div>
          Ln {activeLineNumber || 1}, Col 1 &nbsp; Spaces: 4 &nbsp; UTF-8 &nbsp; Python 3.10
        </div>
        <div className="flex items-center gap-1 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span>{user ? (isEditing ? 'Active Edit Mode' : 'Ready (Click code to edit)') : 'Read-Only Mode'}</span>
        </div>
      </div>

    </div>
  );
}