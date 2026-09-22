import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function LandingNav() {
  const { user, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await supabase.auth.signOut();
    navigate('/');
  };

  const getLinkClass = (path) => {
    const isActive = path === '/' 
      ? location.pathname === '/' 
      : location.pathname.startsWith(path);
      
    return `text-sm font-medium transition-colors ${
      isActive 
        ? "text-(--cobalt) font-bold" 
        : "text-(--ink-secondary) hover:text-(--ink)"
    }`;
  };

  const handleAuthClick = (message) => {
    if (openAuthModal) {
      openAuthModal(message);
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className={`w-full sticky top-0 z-50 flex justify-center transition-all duration-300 pointer-events-none ${
      isScrolled ? "pt-5" : "pt-0"
    }`}>
      
      {/* 
        NO BLUR OR OPACITY HERE: 
        Uses solid bg-(--canvas-paper) so absolutely no glowing/haze bleeds through.
      */}
      <div className={`pointer-events-auto shrink-0 transition-all duration-300 ${
        isScrolled 
          ? "w-[95%] md:w-[85%] max-w-5xl bg-(--canvas-paper) rounded-2xl border border-(--ink-line) shadow-lg py-2 px-6" 
          : "w-full bg-(--canvas-paper) border-b border-(--ink-line) shadow-sm py-3.5 px-6 sm:px-10"
      }`}>
        
        <div className="w-full grid grid-cols-3 items-center relative">
          
          {/* 1. LEFT: Logo */}
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/favicon.svg" 
                alt="CodeToAnim Logo" 
                className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-(--ink) leading-tight">
                  CodeTo<span className="text-(--cobalt)">Anim</span>
                </span>
              </div>
            </Link>
          </div>

          {/* 2. CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center justify-center gap-8">
            <Link to="/" className={getLinkClass('/')}>Home</Link>
            <Link to="/algorithms" className={getLinkClass('/algorithms')}>Explore</Link>
            <Link to="/workspace" className={getLinkClass('/workspace')}>Visualize</Link>
            <Link to="/learn" className={getLinkClass('/learn')}>Learn</Link>
            <Link to="/about" className={getLinkClass('/about')}>About</Link>
          </nav>

          {/* 3. RIGHT: Auth / Profile */}
          <div className="flex items-center justify-end gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-lg bg-(--canvas) border border-(--ink-line-strong) flex items-center justify-center text-(--ink) font-bold text-sm hover:bg-(--canvas-tint) transition-all shadow-sm"
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
                      className="absolute right-0 mt-3 w-60 rounded-xl bg-(--canvas-paper) border border-(--ink-line) shadow-xl overflow-hidden flex flex-col z-[100]"
                    >
                      <div className="px-4 py-3 border-b border-(--ink-line) bg-(--canvas-tint)">
                        <p className="text-[11px] font-mono text-(--ink-muted) uppercase tracking-wider">Account</p>
                        <p className="text-sm font-medium text-(--ink) truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        <Link to="/profile" className="px-3 py-2 text-sm font-medium text-(--ink) hover:bg-(--cobalt-tint) hover:text-(--cobalt) rounded-lg transition-colors flex items-center gap-2">
                          <span>Dashboard</span>
                        </Link>
                        <Link to="/algorithms" className="px-3 py-2 text-sm font-medium text-(--ink) hover:bg-(--teal-tint) hover:text-(--teal) rounded-lg transition-colors flex items-center gap-2">
                          <span>Library</span>
                        </Link>
                        <Link to="/workspace" className="px-3 py-2 text-sm font-medium text-(--ink) hover:bg-(--yellow-tint) hover:text-[#B47C11] rounded-lg transition-colors flex items-center gap-2">
                          <span>Open Workspace</span>
                        </Link>
                        <div className="my-1 border-t border-(--ink-line)"></div>
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-medium text-(--vermilion) hover:bg-(--vermilion-tint) rounded-lg transition-colors flex items-center gap-2">
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleAuthClick('Welcome back! Please log in.')} 
                  className="text-sm font-bold text-(--ink-secondary) hover:text-(--ink) px-3 py-2 transition-colors hidden sm:block"
                >
                  Log In
                </button>
                <button 
                  onClick={() => handleAuthClick('Sign up to track your progress and save code!')} 
                  className="px-5 py-2 rounded-lg font-bold text-sm bg-(--cobalt) text-white hover:bg-(--cobalt-dark) border border-[#1A3F91] transition-all shadow-[0_2px_8px_rgba(36,87,197,0.25)] hidden sm:block"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg border border-(--ink-line) text-(--ink) bg-(--canvas)">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className={`pointer-events-auto md:hidden border border-(--ink-line) bg-(--canvas-paper) px-6 py-4 flex flex-col gap-3 z-50 absolute shadow-xl transition-all duration-300 w-full left-0 ${
          isScrolled ? "top-[calc(100%+8px)] rounded-xl max-w-[calc(100%-2rem)] mx-4" : "top-full border-t-0 rounded-b-xl"
        }`}>
          <Link to="/" className={`py-2 ${getLinkClass('/')}`}>Home</Link>
          <Link to="/algorithms" className={`py-2 ${getLinkClass('/algorithms')}`}>Explore</Link>
          <Link to="/learn" className={`py-2 ${getLinkClass('/learn')}`}>Learn</Link>
          <Link to="/workspace" className={`py-2 ${getLinkClass('/workspace')}`}>Visualize</Link>
          <Link to="/about" className={`py-2 ${getLinkClass('/about')}`}>About</Link>
          
          {!user && (
            <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-(--ink-line)">
              <button onClick={() => handleAuthClick('Welcome back! Please log in.')} className="text-sm font-bold py-2 px-4 rounded-lg border border-(--ink-line) text-(--ink) text-center w-full">Log In</button>
              <button onClick={() => handleAuthClick('Sign up to track your progress and save code!')} className="text-sm font-bold py-2 px-4 rounded-lg bg-(--cobalt) text-white text-center w-full">Sign Up</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}