import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LEETCODE_DATABASE } from '../data/leetcodeData';
import LandingNav from '../components/LandingNav';
import { trackEvent } from '../utils/analytics';

// --- MODERN NAMELESS DROPDOWN ---
function CustomSelect({ value, options, onChange, widthClass }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${widthClass} flex-shrink-0 z-[100]`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-(--canvas-paper) text-(--ink) text-sm font-semibold rounded-xl pl-4 pr-3 py-3 shadow-sm hover:shadow-md hover:bg-(--canvas-tint) outline-none focus:ring-2 focus:ring-(--cobalt)/50 transition-all duration-200"
        style={{ backgroundColor: 'var(--canvas-paper)' }}
      >
        <span className="truncate">{value}</span>
        <svg 
          className={`w-4 h-4 text-(--ink-muted) transition-transform duration-300 ${isOpen ? 'rotate-180 text-(--cobalt)' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-[calc(100%+8px)] left-0 w-full rounded-xl shadow-2xl overflow-hidden py-1.5 max-h-60 overflow-y-auto z-[999] transform origin-top animate-in fade-in zoom-in-95"
          style={{ backgroundColor: 'var(--canvas-paper)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)' }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all ${
                value === opt 
                  ? 'bg-(--cobalt-tint) text-(--cobalt) font-bold pl-5' 
                  : 'text-(--ink) hover:bg-(--canvas-tint) hover:pl-5'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeetcodeProblems({ 
  isEmbedded = false, 
  embeddedCompleted = new Set(), 
  onEmbeddedOpen = null
}) {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(LEETCODE_DATABASE.map(algo => algo.category));
    return ['All', ...Array.from(cats)].sort();
  }, []);
  
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const statuses = ['All', 'Done', 'Todo'];

  const stats = useMemo(() => {
    let easyT = 0, medT = 0, hardT = 0;
    let easyS = 0, medS = 0, hardS = 0;

    LEETCODE_DATABASE.forEach(algo => {
      const isSolved = embeddedCompleted.has(algo.id);
      if (algo.difficulty === 'Easy') {
        easyT++;
        if (isSolved) easyS++;
      } else if (algo.difficulty === 'Medium') {
        medT++;
        if (isSolved) medS++;
      } else if (algo.difficulty === 'Hard') {
        hardT++;
        if (isSolved) hardS++;
      }
    });

    return {
      total: LEETCODE_DATABASE.length,
      solved: easyS + medS + hardS,
      easyT, medT, hardT,
      easyS, medS, hardS
    };
  }, [embeddedCompleted]);

  // Math for SVG Gauge - Thickened for modern look
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const totalItems = stats.total || 1; 
  
  const easyArc = (stats.easyS / totalItems) * circumference;
  const medArc = (stats.medS / totalItems) * circumference;
  const hardArc = (stats.hardS / totalItems) * circumference;

  const filteredProblems = useMemo(() => {
    return LEETCODE_DATABASE.filter((algo) => {
      const searchStr = searchTerm.toLowerCase();
      const isCompleted = embeddedCompleted.has(algo.id);

      const matchesSearch = 
        algo.title.toLowerCase().includes(searchStr) || 
        algo.category.toLowerCase().includes(searchStr);
      const matchesCategory = selectedCategory === 'All' || algo.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || algo.difficulty === selectedDifficulty;
      
      let matchesStatus = true;
      if (statusFilter === 'Done') matchesStatus = isCompleted;
      if (statusFilter === 'Todo') matchesStatus = !isCompleted;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty, statusFilter, embeddedCompleted]);

  const handleTrackSelect = (algo) => {
    trackEvent('select_leetcode_problem', { problem_id: algo.id });
  };

  const getDifficultyStyles = (diff) => {
    if (diff === 'Easy') return { color: 'text-(--teal)', bg: 'bg-(--teal)', fill: 'var(--teal)' };
    if (diff === 'Medium') return { color: 'text-[#B47C11]', bg: 'bg-[#B47C11]', fill: '#B47C11' };
    if (diff === 'Hard') return { color: 'text-(--vermilion)', bg: 'bg-(--vermilion)', fill: 'var(--vermilion)' };
    return { color: 'text-(--cobalt)', bg: 'bg-(--cobalt)', fill: 'var(--cobalt)' };
  };

  // --- REUSABLE PROGRESS BAR ---
  const ProgressBar = ({ label, solved, total, color, bgClass }) => {
    const percentage = total > 0 ? (solved / total) * 100 : 0;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold" style={{ color }}>{label}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-(--ink)">{solved}</span>
            <span className="text-xs font-bold text-(--ink-muted)">/ {total}</span>
          </div>
        </div>
        <div className="h-2.5 w-full bg-(--canvas) rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          >
            {/* Subtle inner gloss effect */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-20"></div>
          </div>
        </div>
      </div>
    );
  };

  const mainContent = (
    <div className={`max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 relative ${isEmbedded ? 'pb-10' : 'px-6 py-12'}`}>
      
      {/* LEFT COLUMN: Modern Sticky Gauge */}
      <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-8 lg:sticky lg:top-1/2 lg:-translate-y-1/2 self-start h-fit z-30">
        
        <div className="space-y-3 mb-2 px-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-(--ink)">
            Practice <span className="text-(--cobalt)">Hub</span>
          </h1>
          <p className="text-base text-(--ink-secondary) font-medium leading-relaxed">
            Master algorithms through interactive step-by-step visualization.
          </p>
        </div>

        {/* Revamped Progress Card (Borderless, shadow-based) */}
        <div 
          className="rounded-[32px] p-8 relative overflow-hidden group shadow-xl"
          style={{ backgroundColor: 'var(--canvas-paper)' }}
        >
          {/* Subtle background glow effect */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-(--cobalt-tint) rounded-full blur-[60px] opacity-30 pointer-events-none transition-opacity duration-700 group-hover:opacity-50"></div>
          
          <div className="flex justify-between items-center mb-10 relative z-10">
            <h3 className="text-lg font-black text-(--ink) tracking-tight">Your Progress</h3>
            <div className="w-8 h-8 rounded-full bg-(--canvas-tint) flex items-center justify-center text-(--ink-muted) hover:text-(--cobalt) hover:bg-(--cobalt-tint) transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
          </div>

          <div className="flex flex-col gap-10 relative z-10">
            
            {/* SVG Circular Gauge - Thicker & Sleeker */}
            <div className="relative w-[160px] h-[160px] mx-auto flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-lg">
                {/* Background Track */}
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--canvas-tint)" strokeWidth="10" />
                
                {/* Arcs with rounded caps */}
                {easyArc > 0 && (
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--teal)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${easyArc} ${circumference}`} strokeDashoffset={0} 
                  />
                )}
                {medArc > 0 && (
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#B47C11" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${medArc} ${circumference}`} strokeDashoffset={-easyArc} 
                  />
                )}
                {hardArc > 0 && (
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--vermilion)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${hardArc} ${circumference}`} strokeDashoffset={-(easyArc + medArc)} 
                  />
                )}
              </svg>
              
              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                <span className="text-4xl font-black text-(--ink) tracking-tighter leading-none">{stats.solved}</span>
                <div className="w-8 h-[2px] bg-(--ink-line) my-1.5 opacity-50"></div>
                <span className="text-xs font-bold text-(--ink-muted) tracking-widest">{stats.total} TOTAL</span>
              </div>
            </div>

            {/* Revamped Breakdown Stats */}
            <div className="flex flex-col gap-5 w-full">
              <ProgressBar label="Easy" solved={stats.easyS} total={stats.easyT} color="var(--teal)" />
              <ProgressBar label="Medium" solved={stats.medS} total={stats.medT} color="#B47C11" />
              <ProgressBar label="Hard" solved={stats.hardS} total={stats.hardT} color="var(--vermilion)" />
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Search, Filters & Sleek List */}
      <div className="flex-grow flex flex-col gap-6 min-w-0">
        
        {/* Sleek Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 relative z-50">
          <div className="relative flex-grow min-w-[200px] group">
            <span className="absolute left-5 top-3.5 text-sm text-(--ink-muted) group-focus-within:text-(--cobalt) transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text"
              placeholder="Search problems or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-(--ink) placeholder-(--ink-muted) rounded-xl pl-12 pr-4 py-3 text-sm font-semibold focus:outline-none shadow-sm focus:shadow-md focus:ring-2 focus:ring-(--cobalt)/50 transition-all"
              style={{ backgroundColor: 'var(--canvas-paper)' }}
            />
          </div>

          <div className="flex gap-3 overflow-visible pb-1 sm:pb-0">
            <CustomSelect value={selectedDifficulty} options={difficulties} onChange={setSelectedDifficulty} widthClass="w-32" />
            <CustomSelect value={selectedCategory} options={categories} onChange={setSelectedCategory} widthClass="w-36" />
            <CustomSelect value={statusFilter} options={statuses} onChange={setStatusFilter} widthClass="w-32" />
          </div>
        </div>

        {/* Problem List */}
        <div className="flex flex-col gap-3 relative z-0">
          {filteredProblems.map((problem) => {
            const isCompleted = embeddedCompleted.has(problem.id);
            const targetUrl = `/workspace?algo=${problem.id}`;
            const originalIndex = parseInt(problem.id.split('-')[0], 10) || LEETCODE_DATABASE.findIndex(p => p.id === problem.id) + 1;
            const diffStyle = getDifficultyStyles(problem.difficulty);

            const ListCard = (
              <div 
                className="relative flex items-center justify-between w-full px-6 py-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden"
                style={{ backgroundColor: 'var(--canvas-paper)' }}
              >
                {/* Subtle left accent bar on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--cobalt) opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Left: Status & Title */}
                <div className="flex items-center gap-5 flex-grow min-w-0 z-10">
                  <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ${isCompleted ? 'text-(--canvas-paper) shadow-md' : 'text-(--ink-muted) bg-(--canvas-tint) group-hover:bg-(--cobalt-tint) group-hover:text-(--cobalt)'}`}
                       style={isCompleted ? { backgroundColor: 'var(--teal)' } : {}}
                  >
                    {isCompleted ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></div>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-(--ink) group-hover:text-(--cobalt) transition-colors truncate">
                    <span className="text-(--ink-muted) mr-2 opacity-60 font-semibold">{originalIndex}.</span> 
                    {problem.title.replace(/^\d+\.\s*/, '')} 
                  </h3>
                </div>
                
                {/* Right: Category, Difficulty & Action */}
                <div className="flex items-center justify-end gap-6 ml-4 flex-shrink-0 z-10">
                  
                  <span className="hidden md:flex text-xs font-bold text-(--ink-muted) uppercase tracking-wider bg-(--canvas) px-3 py-1.5 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity">
                    {problem.category}
                  </span>

                  <div className="flex items-center justify-center w-24">
                    <span className={`text-sm font-black tracking-wide ${diffStyle.color}`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* Play Button Action */}
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-(--canvas-tint) text-(--ink-muted) group-hover:bg-(--cobalt) group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                  </div>

                </div>
              </div>
            );

            return isEmbedded ? (
              <div key={problem.id} onClick={() => { handleTrackSelect(problem); if (onEmbeddedOpen) onEmbeddedOpen(problem); }}>
                {ListCard}
              </div>
            ) : (
              <Link key={problem.id} to={targetUrl} onClick={() => handleTrackSelect(problem)} className="outline-none block">
                {ListCard}
              </Link>
            );
          })}

          {filteredProblems.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center rounded-[32px] bg-(--canvas-paper) shadow-sm mt-4">
              <div className="w-20 h-20 bg-(--canvas-tint) rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl opacity-50">📭</span>
              </div>
              <h3 className="text-2xl font-black mb-2 text-(--ink) tracking-tight">No challenges found</h3>
              <p className="text-base font-medium text-(--ink-secondary) mb-8 max-w-sm">
                We couldn't find any problems matching your current filters. Try adjusting them.
              </p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedDifficulty('All'); setStatusFilter('All'); }}
                className="px-8 py-3 rounded-xl text-sm font-black shadow-md transition-all bg-(--cobalt) hover:bg-(--cobalt)/90 text-white hover:-translate-y-1 hover:shadow-lg"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-(--canvas) text-(--ink) selection:bg-(--cobalt) selection:text-white font-sans">
      {!isEmbedded && <LandingNav />}
      <main className="grow w-full z-10 relative">
        {mainContent}
      </main>
    </div>
  );
}