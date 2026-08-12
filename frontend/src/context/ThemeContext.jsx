import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  'midnight-purple': {
    name: 'Midnight Purple 🟣',
    bg: 'bg-gray-950',
    card: 'bg-gray-900 border-gray-800',
    primary: 'bg-purple-600 hover:bg-purple-500 text-white',
    accentText: 'text-purple-400',
    monacoTheme: 'vs-dark',
  },
  'cyberpunk': {
    name: 'Cyberpunk Neon ⚡',
    bg: 'bg-black',
    card: 'bg-gray-900 border-yellow-500/30',
    primary: 'bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold',
    accentText: 'text-yellow-400',
    monacoTheme: 'hc-black',
  },
  'monokai': {
    name: 'Monokai Dark 🟢',
    bg: 'bg-stone-950',
    card: 'bg-stone-900 border-stone-800',
    primary: 'bg-green-600 hover:bg-green-500 text-white',
    accentText: 'text-green-400',
    monacoTheme: 'vs-dark',
  },
  'nordic': {
    name: 'Nordic Slate ❄️',
    bg: 'bg-slate-950',
    card: 'bg-slate-900 border-slate-800',
    primary: 'bg-sky-600 hover:bg-sky-500 text-white',
    accentText: 'text-sky-400',
    monacoTheme: 'vs-dark',
  },
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('midnight-purple');

  useEffect(() => {
    const savedTheme = localStorage.getItem('codetoanim_theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const changeTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
      localStorage.setItem('codetoanim_theme', themeKey);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, theme: themes[currentTheme], changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);