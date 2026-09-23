import React, { useRef, useEffect } from 'react';

const highlightPythonCode = (line, activeThemeName) => {
  if (!line) return <span> </span>;

  const isDark = activeThemeName === 'dark';
  const isLight = activeThemeName === 'light';

  if (line.trim().startsWith('#')) {
    return <span className={isDark ? "text-[#647484] italic" : isLight ? "text-[#817D74] italic" : "text-slate-400 italic"}>{line}</span>;
  }

  const keywords = /\b(def|return|if|else|elif|break|continue|import|from|as|while|class|try|except)\b/g;
  const builtins = /\b(range|len|print)\b/g;
  const controlFlow = /\b(for|in)\b/g;
  const numbers = /\b(\d+)\b/g;
  const strings = /(["'].*?["'])/g;
  const operators = /([()\[\]{}:,.=+\-*/<>])/g;

  return (
    <span>
      {line.split(/(\s+|["'].*?["']|\b(?:def|return|for|in|range|len|if|else|elif|break|continue|print|import|from|as|while|class)\b|\b\d+\b|[()\[\]{}:,.=+\-*/<>])/).map((part, i) => {
        if (!part) return null;
        if (part.match(keywords) || part.match(controlFlow)) {
          return <span key={i} className={isDark ? "text-[#3FB6A8] font-semibold" : isLight ? "text-[#C8533C] font-semibold" : "text-purple-700 font-semibold"}>{part}</span>;
        } else if (part.match(builtins)) {
          return <span key={i} className={isDark ? "text-[#52C7B8]" : isLight ? "text-[#31599B]" : "text-blue-600"}>{part}</span>;
        } else if (part.match(strings)) {
          return <span key={i} className={isDark ? "text-[#55B878]" : isLight ? "text-[#2E7D32]" : "text-emerald-700"}>{part}</span>;
        } else if (part.match(numbers)) {
          return <span key={i} className={isDark ? "text-[#D6A64F]" : isLight ? "text-[#B45F06]" : "text-amber-600"}>{part}</span>;
        } else if (part.match(operators)) {
          return <span key={i} className={isDark ? "text-[#8B9AA8]" : isLight ? "text-[#5E5B55]" : "text-slate-800"}>{part}</span>;
        }
        return <span key={i} className={isDark ? "text-[#E6EDF3]" : isLight ? "text-[#202124]" : "text-slate-900"}>{part}</span>;
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
  isDark,
  activeThemeName 
}) {
  const codeLines = code.split('\n');
  const textareaRef = useRef(null);
  const activeLineRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const historyRef = useRef([code]);
  const historyIndexRef = useRef(0);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);
  
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
  
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);

    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(val);
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (historyIndexRef.current > 0) {
        historyIndexRef.current -= 1;
        setCode(historyRef.current[historyIndexRef.current]);
      }
    }
    else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyIndexRef.current += 1;
        setCode(historyRef.current[historyIndexRef.current]);
      }
    }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const newValue = val.substring(0, start) + "    " + val.substring(end);
      
      setCode(newValue);
      
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(newValue);
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;

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

  const themeStyles = {
    dark: { 
        bgPanel: 'bg-[#0B1117]', bgCodeArea: 'bg-[#0A1016]', bgLineNumbers: 'bg-[#0A1016]',
        textPrimary: 'text-[#E6EDF3]', textSecondary: 'text-[#8B9AA8]', metallicBorder: 'border-[#26323D]',
        editorBorder: 'border-[#26323D]', tabActiveBg: 'bg-[#0A1016]', tabActiveText: 'text-[#E6EDF3]',
        tabTopBorder: 'border-[#3FB6A8]', btnBg: 'bg-[#121B24] border border-[#26323D] text-[#E6EDF3] hover:bg-[#26323D]',
        activeLineNum: 'text-[#E6EDF3]', activeLineBg: 'bg-[#121B24] border-l-2 border-[#3FB6A8] text-[#E6EDF3]',
        inactiveLineHover: 'hover:bg-[#121B24] text-[#E6EDF3]', caret: 'caret-[#3FB6A8]',
        selectionBg: 'selection:bg-[#3FB6A8]/20', scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#0A1016]', 
        scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#26323D] hover:[&::-webkit-scrollbar-thumb]:bg-[#8B9AA8]'
    },
    coffee: { 
        bgPanel: 'bg-[#EFE8DE]', bgCodeArea: 'bg-[#F5EBE1]', bgLineNumbers: 'bg-[#F5EBE1]',
        textPrimary: 'text-[#3E2723]', textSecondary: 'text-[#765A51]', metallicBorder: 'border-[#D7CCC8]',
        editorBorder: 'border-[#D7CCC8]', tabActiveBg: 'bg-[#F5EBE1]', tabActiveText: 'text-[#3E2723]',
        tabTopBorder: 'border-[#8C5A48]', btnBg: 'bg-[#8C5A48] text-white hover:opacity-80',
        activeLineNum: 'text-[#8C5A48]', activeLineBg: 'bg-[#8C5A48]/10 border-l-2 border-[#8C5A48] text-[#3E2723]',
        inactiveLineHover: 'hover:bg-[#8C5A48]/5 text-[#3E2723]', caret: 'caret-[#8C5A48]',
        selectionBg: 'selection:bg-[#8C5A48]/30', scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#F5EBE1]', 
        scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#D7CCC8] hover:[&::-webkit-scrollbar-thumb]:bg-[#8C5A48]'
    },
    light: { 
        bgPanel: 'bg-[#FFFEFA]', bgCodeArea: 'bg-[#FFFEFA]', bgLineNumbers: 'bg-[#F8F5EE]',
        textPrimary: 'text-[#202124]', textSecondary: 'text-[#817D74]', metallicBorder: 'border-[#E8E3D8]',
        editorBorder: 'border-[#E8E3D8]', tabActiveBg: 'bg-[#FFFEFA]', tabActiveText: 'text-[#31599B]',
        tabTopBorder: 'border-[#31599B]', btnBg: 'bg-[#F8F5EE] border border-[#D9D1C4] text-[#202124] hover:bg-[#F1EEE7]',
        activeLineNum: 'text-[#31599B]', activeLineBg: 'bg-[#EAF0FA] border-l-2 border-[#31599B] text-[#202124]',
        inactiveLineHover: 'hover:bg-[#F8F5EE] text-[#202124]', caret: 'caret-[#31599B]',
        selectionBg: 'selection:bg-[#31599B]/20', scrollTrack: '[&::-webkit-scrollbar-track]:!bg-[#FFFEFA]', 
        scrollThumb: '[&::-webkit-scrollbar-thumb]:bg-[#D9D1C4] hover:[&::-webkit-scrollbar-thumb]:bg-[#817D74]'
    }
  };

  const activeStyle = themeStyles[activeThemeName] || themeStyles.dark;
  const { 
    bgPanel, bgCodeArea, bgLineNumbers, textPrimary, textSecondary, metallicBorder, editorBorder,
    tabActiveBg, tabActiveText, tabTopBorder, btnBg, activeLineNum, activeLineBg, inactiveLineHover, caret, selectionBg,
    scrollTrack, scrollThumb
  } = activeStyle;

  const editorScrollbar = `
    [&::-webkit-scrollbar]:w-1
    ${scrollTrack}
    [&::-webkit-scrollbar-track]:rounded-none
    [&::-webkit-scrollbar-thumb]:rounded-none 
    [&::-webkit-scrollbar-thumb]:border-2 
    [&::-webkit-scrollbar-thumb]:border-transparent 
    [&::-webkit-scrollbar-thumb]:bg-clip-content
    ${scrollThumb}
  `;

  return (
    <div className={`w-full h-full flex flex-col ${bgPanel}`}> 
      
      <div className={`h-10 border-b ${metallicBorder} flex items-center justify-between px-4 text-xs font-mono z-10 ${bgPanel}`}>
        <div className="flex items-center gap-2 h-full pt-1">
          <div className={`px-4 h-full border-t-2 ${tabTopBorder} font-bold flex items-center gap-2 border-x ${editorBorder} border-b-0 ${tabActiveBg} ${tabActiveText} relative top-[1px]`}>
            <span>main.py</span>
          </div>
        </div>

        <div className={`flex items-center gap-2 text-[11px] font-semibold ${textSecondary}`}>
          {user && isEditing && (
            <button 
              onClick={() => setIsEditing(false)} 
              className={`px-3 py-1 rounded text-[10px] transition-colors font-bold ${btnBg}`}
            >
              Done
            </button>
          )}
        </div>
      </div>

      <div className={`flex-1 flex overflow-hidden font-mono text-[13px] leading-relaxed ${bgCodeArea} cursor-text relative`}>
        
        <div 
          ref={lineNumbersRef}
          className={`select-none pb-24 pt-4 text-right pr-3 pl-3 ${textSecondary} font-mono text-xs min-w-[40px] border-r ${editorBorder} overflow-hidden ${bgLineNumbers}`}
        >
          {codeLines.map((_, idx) => {
            const lineNum = idx + 1;
            const isActive = lineNum === activeLineNumber;
            return (
              <div key={idx} className={`h-6 flex items-center justify-end gap-2 ${isActive ? `${activeLineNum} font-bold` : ""}`}>
                {isActive && <span className="text-[9px]">▶</span>}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {isEditing && user ? (
          <div className="flex-1 relative bg-transparent">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              spellCheck={false}
              className={`absolute inset-0 w-full h-full pb-24 pt-4 px-4 overflow-auto bg-transparent font-mono text-[13px] leading-relaxed resize-none outline-none ${textPrimary} ${caret} ${selectionBg} whitespace-pre ${editorScrollbar}`}
            />
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onClick={handleEditorClick}
            className={`flex-1 pb-24 pt-4 px-2 overflow-auto h-full ${editorScrollbar}`}
          >
            {codeLines.map((lineStr, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLineNumber;
              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  className={`h-6 px-2 flex items-center whitespace-pre transition-colors font-semibold ${
                    isActive ? activeLineBg : inactiveLineHover
                  }`}
                >
                  {highlightPythonCode(lineStr, activeThemeName)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={`h-7 border-t ${editorBorder} flex items-center justify-between px-4 text-[10px] font-mono ${textSecondary} z-10 ${bgLineNumbers}`}>
        <div>
          Ln {activeLineNumber || 1}, Col 1 &nbsp; Spaces: 4 &nbsp; UTF-8 &nbsp; Python 3.10
        </div>
        <div className="flex items-center gap-1.5 font-semibold">
          <span className={`w-2 h-2 rounded-full ${user ? (isEditing ? 'bg-[#D6A64F]' : 'bg-[#55B878]') : 'bg-[#647484]'}`}></span>
          <span>{user ? (isEditing ? 'Editing' : 'Ready') : 'Read-Only'}</span>
        </div>
      </div>

    </div>
  );
}