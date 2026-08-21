import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function TooltipTour({ isOpen, onClose }) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);

  // Mapped 1 through 4 sequentially across your dashboard elements
  const steps = [
    {
      title: "1. Navigation & Sidebar",
      content: "Use this sidebar to toggle views, jump to the Workspace, or check the Library.",
      position: "left-[270px] top-[100px]",
      arrow: "left" 
    },
    {
      title: "2. Global Header Search",
      content: "Instantly look up any algorithm, data structure, or topic across the app.",
      position: "left-[270px] top-[80px]",
      arrow: "top"
    },
    {
      title: "3. Profile & Level Stats",
      content: "Track your current rank, XP progression, streaks, and learning analytics.",
      position: "right-[350px] top-[140px]",
      arrow: "right"
    },
    {
      title: "4. Algorithm Library & Workspace",
      content: "Select any algorithm card or jump into the code visualizer to master it step-by-step.",
      position: "left-[45%] top-[45%]",
      arrow: "none"
    }
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const bgBox = isDark ? 'bg-[#10141D] border-slate-700/80 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-xl';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const arrowColor = isDark ? '#10141D' : '#ffffff';
  const arrowBorderColor = isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 1)';

  const renderArrow = (direction) => {
    if (direction === 'none' || !direction) return null;

    const baseStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    let specificStyle = {};
    const arrowSize = 8;

    switch (direction) {
      case 'left':
        specificStyle = {
          left: `-${arrowSize}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: `transparent ${arrowColor} transparent transparent`,
          filter: `drop-shadow(-1px 0px 0px ${arrowBorderColor})`
        };
        break;
      case 'right':
        specificStyle = {
          right: `-${arrowSize}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent transparent ${arrowColor}`,
          filter: `drop-shadow(1px 0px 0px ${arrowBorderColor})`
        };
        break;
      case 'top':
        specificStyle = {
          top: `-${arrowSize}px`,
          left: '20px',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent ${arrowColor} transparent`,
          filter: `drop-shadow(0px -1px 0px ${arrowBorderColor})`
        };
        break;
      case 'bottom':
        specificStyle = {
          bottom: `-${arrowSize}px`,
          left: '20px',
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: `${arrowColor} transparent transparent transparent`,
          filter: `drop-shadow(0px 1px 0px ${arrowBorderColor})`
        };
        break;
      default:
        return null;
    }

    return <div style={{ ...baseStyle, ...specificStyle }} />;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[700] pointer-events-none">
        <motion.div 
          key={currentStep}
          drag
          dragMomentum={false}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={`absolute ${steps[currentStep].position} pointer-events-auto w-[380px] rounded-2xl p-4 border ${bgBox} backdrop-blur-md flex items-center gap-4 relative cursor-grab active:cursor-grabbing shadow-2xl`}
        >
          {renderArrow(steps[currentStep].arrow)}

          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-black text-xs flex-shrink-0 shadow-inner z-10 relative">
            {currentStep + 1}/{steps.length}
          </div>

          <div className="flex-1 min-w-0 z-10 relative">
            <h4 className="font-bold text-sm tracking-tight truncate">{steps[currentStep].title}</h4>
            <p className={`text-[11px] leading-snug truncate ${textSecondary}`}>
              {steps[currentStep].content}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 z-10 relative">
            <button 
              onClick={onClose} 
              className={`text-[11px] ${textSecondary} hover:text-indigo-500 font-bold px-1`}
            >
              Skip
            </button>
            <button 
              onClick={handleNext}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap"
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next ➔"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}