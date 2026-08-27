import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function LandingNav() {
  const { user, openAuthModal } = useAuth();
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/workspace');
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await supabase.auth.signOut();
  };

  // Keep the site rail visually distinct from the workspace toolbar.
  const getLinkClass = (path) => {
    const isActive = location.pathname.startsWith(path);
    return `px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
      isActive 
        ? isWorkspace && path === '/workspace'
          ? "bg-(--cobalt) text-white shadow-sm"
          : "bg-(--canvas-dark) text-(--cobalt) shadow-inner border border-(--ink-line)"
        : "text-(--ink-secondary) hover:text-(--ink) hover:bg-(--canvas-tint) border border-transparent"
    }`;
  };

  return (
    <header className={`w-full shrink-0 bg-(--canvas-paper)/95 backdrop-blur-xl border-b border-(--ink-line) sticky top-0 z-50 ${isWorkspace ? 'shadow-none' : 'shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)]'}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex justify-between items-center">
        
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img 
              src="/favicon.svg" 
              alt="CodeToAnim Logo" 
              className="w-6 h-6 object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
            />
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-(--ink) leading-none mt-0.5">
              CodeTo<span className="text-(--cobalt)">Anim</span>
            </span>
          </Link>

          {/* Vertical Divider for Visual Separation */}
          <div className="hidden md:block w-px h-6 bg-(--ink-line) mx-2"></div>

          <nav className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-(--canvas-tint)/60 border border-(--ink-line)">
            <Link to="/learn" className={getLinkClass('/learn')}>Learn</Link>
            <Link to="/workspace" className={getLinkClass('/workspace')}>Visualize</Link>
            <Link to="/algorithms" className={getLinkClass('/algorithms')}>Explore</Link>
            <Link to="/about" className={getLinkClass('/about')}>About</Link>
          </nav>
        </div>

        {/* Right Side: Auth & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-md bg-(--canvas) border border-(--ink-line) flex items-center justify-center text-(--ink) font-bold text-sm hover:bg-(--canvas-tint) hover:border-(--cobalt) hover:text-(--cobalt) transition-all shadow-sm"
              >
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-60 rounded-xl bg-(--canvas-paper) border border-(--ink-line) shadow-2xl overflow-hidden flex flex-col z-[100]"
                  >
                    <div className="px-4 py-3 border-b border-(--ink-line) bg-(--canvas-tint)">
                      <p className="text-[10px] font-mono text-(--ink-muted) font-bold uppercase tracking-widest">Account</p>
                      <p className="text-sm font-bold text-(--ink) truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <Link to="/profile" className="px-3 py-2 text-sm font-semibold text-(--ink-secondary) hover:bg-(--cobalt-tint) hover:text-(--cobalt) rounded-lg transition-colors flex items-center gap-2">
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/algorithms" className="px-3 py-2 text-sm font-semibold text-(--ink-secondary) hover:bg-(--teal-tint) hover:text-(--teal) rounded-lg transition-colors flex items-center gap-2">
                        <span>Library</span>
                      </Link>
                      <Link to="/workspace" className="px-3 py-2 text-sm font-semibold text-(--ink-secondary) hover:bg-(--yellow-tint) hover:text-[#B47C11] rounded-lg transition-colors flex items-center gap-2">
                        <span>Open Workspace</span>
                      </Link>
                      <div className="my-1 border-t border-(--ink-line)"></div>
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-semibold text-(--vermilion) hover:bg-(--vermilion-tint) rounded-lg transition-colors flex items-center gap-2">
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : !isWorkspace ? (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="text-sm font-bold text-(--ink-secondary) hover:text-(--ink) px-3 py-2 transition-colors hidden sm:block">
                Sign In
              </Link>
              <button 
                onClick={() => openAuthModal ? openAuthModal() : window.location.href='/auth'} 
                className="px-4 py-1.5 rounded-md font-bold text-sm bg-(--cobalt) text-white hover:bg-(--cobalt-dark) transition-all shadow-sm border border-transparent"
              >
                Sign Up
              </button>
            </div>
          ) : null}

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-1.5 rounded-md border border-(--ink-line) text-(--ink) bg-(--canvas-paper) hover:bg-(--canvas-tint) transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile dropdown drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-(--ink-line) bg-(--canvas-paper) px-6 py-4 flex flex-col gap-2 z-50 absolute w-full shadow-2xl">
          <Link to="/learn" className={`text-sm font-semibold py-2 px-3 rounded-lg ${location.pathname.startsWith('/learn') ? 'bg-(--canvas-dark) text-(--cobalt)' : 'text-(--ink-secondary) hover:bg-(--canvas-tint)'}`}>Learn</Link>
          <Link to="/workspace" className={`text-sm font-semibold py-2 px-3 rounded-lg ${location.pathname.startsWith('/workspace') ? 'bg-(--canvas-dark) text-(--cobalt)' : 'text-(--ink-secondary) hover:bg-(--canvas-tint)'}`}>Visualize</Link>
          <Link to="/algorithms" className={`text-sm font-semibold py-2 px-3 rounded-lg ${location.pathname.startsWith('/algorithms') ? 'bg-(--canvas-dark) text-(--cobalt)' : 'text-(--ink-secondary) hover:bg-(--canvas-tint)'}`}>Explore</Link>
          <Link to="/about" className={`text-sm font-semibold py-2 px-3 rounded-lg ${location.pathname.startsWith('/about') ? 'bg-(--canvas-dark) text-(--cobalt)' : 'text-(--ink-secondary) hover:bg-(--canvas-tint)'}`}>About</Link>
          {!user && !isWorkspace && (
            <Link to="/auth" className="text-sm font-bold py-2 px-3 mt-2 rounded-lg bg-(--cobalt-tint) text-(--cobalt) text-center">Sign In / Sign Up</Link>
          )}
        </div>
      )}
    </header>
  );
}