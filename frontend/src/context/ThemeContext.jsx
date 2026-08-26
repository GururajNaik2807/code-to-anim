import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize state from sessionStorage first, then localStorage, defaulting to 'dark'
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const sessionTheme = sessionStorage.getItem('codeanim_session_theme');
      const savedTheme = localStorage.getItem('app_theme');
      const validThemes = ['light', 'dark', 'coffee'];
      
      if (sessionTheme && validThemes.includes(sessionTheme)) return sessionTheme;
      if (savedTheme && validThemes.includes(savedTheme)) return savedTheme;
      
      return 'dark';
    } catch (error) {
      return 'dark';
    }
  });

  // Function to change the theme and persist it
  const changeTheme = (themeName) => {
    // Whitelist all 3 themes
    if (!['light', 'dark', 'coffee'].includes(themeName)) return;
    
    setCurrentTheme(themeName);
    
    try {
      localStorage.setItem('app_theme', themeName);
      // Keep session bucket in sync for the database tab-close optimization
      sessionStorage.setItem('codeanim_session_theme', themeName);
      sessionStorage.setItem('codeanim_theme_changed', 'true');
    } catch (error) {
      console.warn('Could not save theme to storage:', error);
    }
  };

  // Dynamically apply the current theme class to the <body> 
  // while stripping out the inactive ones.
  useEffect(() => {
    document.body.classList.remove('light', 'dark', 'coffee');
    document.body.classList.add(currentTheme);
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