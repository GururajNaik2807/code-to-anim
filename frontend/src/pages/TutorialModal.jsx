import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext'; // Adjust path as needed

export default function TutorialModal({ isOpen, onClose }) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to CodeToAnim! 👋",
      content: "This is your personalized dashboard where you can track your algorithmic journey, manage your saved code, and level up your skills.",
      icon: "🚀"
    },
    {
      title: "Interactive Workspace",
      content: "Head over to the Workspace to write, debug, and visualize your code step-by-step in real-time.",
      icon: "⚡"
    },
    {
      title: "Algorithm Library",
      content: "Explore our vast library of algorithms. Filter by difficulty, search for specific topics, and master computer science fundamentals.",
      icon: "📚"
    },
    {
      title: "Global Leaderboard",
      content: "Earn XP by completing algorithms and climb the ranks on the global leaderboard. Compete with other developers!",
      icon: "🏆"
    }
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const bgPanel = isDark ? 'bg-[#131822] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`w-full max-w-md rounded-3xl p-8 flex flex-col gap-6 shadow-2xl border ${bgPanel}`}
        >
          {/* Header & Icon */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl border border-indigo-500/20 shadow-inner mb-4">
              {tutorialSteps[currentStep].icon}
            </div>
            <h3 className="text-2xl font-black tracking-tight">{tutorialSteps[currentStep].title}</h3>
          </div>

          {/* Content */}
          <div className="min-h-[80px] flex items-center justify-center text-center">
            <p className={`text-sm leading-relaxed ${textSecondary}`}>
              {tutorialSteps[currentStep].content}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 my-2">
            {tutorialSteps.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentStep ? 'w-6 bg-indigo-500' : isDark ? 'w-2 bg-slate-700' : 'w-2 bg-slate-300'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-2">
            <button 
              onClick={onClose} 
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${textSecondary} hover:text-indigo-500`}
            >
              Skip Tutorial
            </button>
            <button 
              onClick={handleNext} 
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}