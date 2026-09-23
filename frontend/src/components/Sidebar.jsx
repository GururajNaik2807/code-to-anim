import React from 'react';
import { useNavigate } from 'react-router-dom';

// --- Custom SVG Icons ---
const Icons = {
  Library: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  LeetCode: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, 
  Home: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zm10 0a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z" /></svg>,
  Workspace: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Leaderboard: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6a2 2 0 012-2h2a2 2 0 012 2v13M4 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m4 0v-4a2 2 0 012-2h2a2 2 0 012 2v4M3 21h18" /></svg>,
  Feedback: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Moon: () => <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>,
  Sun: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Coffee: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h1a4 4 0 110 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 3v2M10 3v2M14 3v2" /></svg>
};

export default function Sidebar({
  currentView,
  onNavClick,
  isMobile,
  isSidebarOpen,
  isSidebarHovered,
  setIsSidebarHovered,
  activeThemeName,
  onCycleTheme,
  themeStyles,
  accentText
}) {
  const {
    sidebarContainer,
    sidebarBg,
    sidebarText,
    inactiveSidebar,
    activeSidebar,
    headerBorderColor
  } = themeStyles;

  const isCollapsed = !isSidebarHovered && !isMobile;
  const navigate = useNavigate();

  const navGroups = [
    {
      section: 'PRIMARY',
      links: [
        { name: 'Dashboard', id: 'dashboard', action: () => onNavClick('dashboard'), icon: <Icons.Home /> },
        { name: 'Visualize', id: 'workspace', action: () => onNavClick('workspace'), icon: <Icons.Workspace />, isPrimary: true }
      ]
    },
    {
      section: 'LEARN',
      links: [
        { name: 'Algorithm Library', id: 'library', action: () => onNavClick('library'), icon: <Icons.Library /> }
      ]
    },
    {
      section: 'PRACTICE',
      links: [
        { name: 'Problems', id: 'leetcode', action: () => onNavClick('leetcode'), icon: <Icons.LeetCode /> }
      ]
    },
    {
      section: 'COMMUNITY',
      links: [
        { name: 'Leaderboard', id: 'leaderboard', action: () => onNavClick('leaderboard'), icon: <Icons.Leaderboard /> }
      ]
    }
  ];

  const bottomLinks = [
    { name: 'Give Feedback', id: 'feedback', action: () => onNavClick('feedback'), icon: <Icons.Feedback /> }
  ];

  const renderNavItem = (link) => {
    const isActive = currentView === link.id;
    const activeClasses = isActive
      ? `${activeSidebar} shadow-[0_10px_24px_rgba(15,23,42,0.12)]`
      : `${inactiveSidebar} hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]`;

    const iconColor = isActive
      ? 'text-white'
      : link.isPrimary
        ? activeThemeName === 'coffee'
          ? 'text-[#F9F0E8]'
          : activeThemeName === 'light'
            ? 'text-[#31599B]'
            : 'text-[#7dd3fc]'
        : activeThemeName === 'coffee'
          ? 'text-[#F9F0E8]'
          : activeThemeName === 'light'
            ? 'text-[#5E5B55]'
            : 'text-[#94A3B8]';

    return (
      <button
        key={link.id}
        onClick={link.action}
        className={`relative group w-full flex items-center h-12 transition-all duration-200 overflow-hidden rounded-r-xl ${activeClasses}`}
        title={isCollapsed ? link.name : ''}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-current rounded-r-md shadow-[0_0_12px_rgba(255,255,255,0.35)]"></div>
        )}

        <div className={`w-[72px] h-full flex-shrink-0 flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${iconColor}`}>
          {link.icon}
        </div>
        <span className={`text-[13.5px] font-semibold tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0' : 'opacity-100 pr-4'}`}>
          {link.name}
        </span>
      </button>
    );
  };

  return (
    <div 
      className={`sidebar-container transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0 overflow-hidden relative z-20 ${isMobile ? (isSidebarOpen ? 'w-[240px]' : 'w-0') : (isSidebarHovered ? 'w-[240px]' : 'w-[72px]')} ${sidebarContainer}`}
      onMouseEnter={() => !isMobile && setIsSidebarHovered(true)}
      onMouseLeave={() => !isMobile && setIsSidebarHovered(false)}
    >
      {/* Changed to strict overflow-hidden on the aside to prevent bottom scrollbars */}
      <aside className={`w-full h-full ${sidebarBg} flex flex-col justify-between overflow-hidden`}>
        
        {/* Brand Header */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className={`h-16 flex items-center border-b ${headerBorderColor} group transition-all duration-300 shrink-0 w-full text-left hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40`}
          aria-label="Go to the landing page"
        >
          <div className="w-[72px] h-full flex-shrink-0 flex items-center justify-center">
            <div className="w-[34px] h-[34px] bg-[#ffffff] rounded-xl flex items-center justify-center shadow-[0_10px_20px_rgba(15,23,42,0.12)] border border-black/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_26px_rgba(15,23,42,0.18)]">
              <img
                src="/favicon.svg"
                alt="CodeToAnim Logo"
                className="w-5 h-5 shrink-0"
              />
            </div>
          </div>
          <span className={`font-extrabold text-[16px] tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0' : 'opacity-100'} ${sidebarText}`}>
            CodeTo<span className="opacity-80 font-semibold">Anim</span>
          </span>
        </button>

        {/* Navigation Body - Scrolling is restricted only to this middle area */}
        <div className="flex-1 py-5 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navGroups.map((group, idx) => (
            <div key={idx} className={idx > 0 ? "mt-6" : ""}>
              <h4 className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 mb-0' : 'px-6 pl-7 mb-3 opacity-50'} ${sidebarText}`}>
                {group.section}
              </h4>
              <div className="space-y-0.5">
                {group.links.map(renderNavItem)}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Area */}
        <div className={`mt-auto py-4 border-t ${headerBorderColor} flex flex-col gap-0.5 shrink-0`}>
          {bottomLinks.map(renderNavItem)}
          
          <button 
            onClick={onCycleTheme} 
            className={`relative group w-full flex items-center h-12 transition-all duration-200 overflow-hidden ${inactiveSidebar} !border-l-0`}
            title={isCollapsed ? `Theme: ${activeThemeName}` : ''}
          >
            <div className="w-[72px] h-full flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              {activeThemeName === 'dark' && <Icons.Moon />}
              {activeThemeName === 'light' && <Icons.Sun />}
              {activeThemeName === 'coffee' && <Icons.Coffee />}
            </div>
            <div className={`flex items-center justify-between flex-1 pr-5 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0' : 'opacity-100'}`}>
              <span className="text-[13.5px] font-semibold tracking-wide">Theme</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-current/20 opacity-70`}>
                {activeThemeName}
              </span>
            </div>
          </button>
        </div>
      </aside>
    </div>
  );
}