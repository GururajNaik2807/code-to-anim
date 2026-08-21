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
  const activeLineRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // --- NEW: Custom History Stack for Undo/Redo ---
  const historyRef = useRef([code]);
  const historyIndexRef = useRef(0);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);
  
  // Cinematic auto-scroll for read-only trace mode
  useEffect(() => {
    if (!isEditing && activeLineRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetElement = activeLineRef.current;
      const targetScroll = targetElement.offsetTop - (container.clientHeight / 2) + (targetElement.clientHeight / 2);
      
      const smoothScrollTo = (container, targetPosition, duration) => {
        const startPosition = container.scrollTop;
        const distance = targetPosition - startPosition;
        let startTime = null;
        const animation = (currentTime) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          container.scrollTop = startPosition + distance * ease;
          if (timeElapsed < duration) requestAnimationFrame(animation);
        };
        requestAnimationFrame(animation);
      };
      
      smoothScrollTo(container, targetScroll, 600);
    }
  }, [activeLineNumber, isEditing]);
  
  // --- NEW: Sync line numbers scroll with code scroll ---
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // --- NEW: Manage History and State Changes ---
  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);

    // Truncate future history if user types after an undo
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(val);
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  };

  // --- NEW: Intercept Keyboard Shortcuts ---
  const handleKeyDown = (e) => {
    // 1. Undo (Ctrl + Z)
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (historyIndexRef.current > 0) {
        historyIndexRef.current -= 1;
        setCode(historyRef.current[historyIndexRef.current]);
      }
    }
    // 2. Redo (Ctrl + Y)
    else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyIndexRef.current += 1;
        setCode(historyRef.current[historyIndexRef.current]);
      }
    }
    // 3. Tab spacing (4 spaces)
    else if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const newValue = val.substring(0, start) + "    " + val.substring(end);
      
      setCode(newValue);
      
      // Push to history stack
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(newValue);
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;

      // Maintain cursor position after injecting spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handleEditorClick = () => {
    if (!user) {
      openAuthModal('Log in to unlock direct code editing!');
      return;
    }
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const bgPanel = isDark ? 'bg-[#10141D]' : 'bg-[#FFFFFF]';
  const bgCodeArea = isDark ? 'bg-[#0A0D14]' : 'bg-[#FAFAFC]';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const metallicBorder = 'border border-slate-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_5px_rgba(0,0,0,0.25)]';

  return (
    <div className={`w-full h-full flex flex-col ${metallicBorder} border-y-0 border-l-0 ${bgPanel}`}> 
      
      <div className={`h-10 ${metallicBorder} border-x-0 border-t-0 flex items-center justify-between px-4 text-xs font-mono ${isDark ? 'bg-[#0E121B]' : 'bg-slate-100'} z-10`}>
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

      {/* --- FIX: Outer container is now hidden. Only the inner components scroll. --- */}
      <div className={`flex-1 flex overflow-hidden font-mono text-sm leading-6 ${bgCodeArea} cursor-text relative`}>
        
        {/* Synchronized Line Numbers */}
        <div 
          ref={lineNumbersRef}
          className={`select-none py-4 text-right pr-3 pl-3 ${textSecondary} font-mono text-xs min-w-[40px] border-r ${isDark ? 'border-slate-800/80' : 'border-slate-300'} overflow-hidden`}
        >
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
          <div className="flex-1 relative bg-transparent">
            {/* The Textarea is now the sole scrollable element */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              spellCheck={false}
              className={`absolute inset-0 w-full h-full py-4 px-3 overflow-auto bg-transparent font-mono text-sm leading-6 resize-none outline-none ${isDark ? 'text-slate-100' : 'text-slate-900'} caret-purple-600 whitespace-pre`}
            />
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onClick={handleEditorClick}
            className="flex-1 py-4 px-3 overflow-auto"
          >
            {codeLines.map((lineStr, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLineNumber;
              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
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

      <div className={`h-7 ${metallicBorder} border-x-0 border-b-0 flex items-center justify-between px-4 text-[10px] font-mono ${textSecondary} ${isDark ? 'bg-[#0E121B]' : 'bg-slate-100'} z-10`}>
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