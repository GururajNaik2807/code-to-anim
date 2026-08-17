import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize state from localStorage, defaulting to 'dark'
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('app_theme');
      return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
    } catch (error) {
      return 'dark';
    }
  });

  // Function to change the theme and persist it
  const changeTheme = (themeName) => {
    if (themeName !== 'light' && themeName !== 'dark') return;
    
    setCurrentTheme(themeName);
    
    try {
      localStorage.setItem('app_theme', themeName);
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
  };

  // Optional: Apply a global class to the <body> if you ever want to use standard Tailwind dark mode (e.g. `dark:bg-gray-900`)
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the Theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};