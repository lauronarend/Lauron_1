import React, { createContext, useContext, useState, useEffect } from 'react';

const kits = [
  {
    name: "canary",
    primary: "#FFDF00",
    primaryForeground: "#009C3B",
    accent: "#009C3B"
  },
  {
    name: "celeste",
    primary: "#75AADB",
    primaryForeground: "#FFFFFF",
    accent: "#FFFFFF"
  },
  {
    name: "furia",
    primary: "#AA151B",
    primaryForeground: "#F1BF00",
    accent: "#F1BF00"
  },
  {
    name: "les_bleus",
    primary: "#002395",
    primaryForeground: "#FFFFFF",
    accent: "#EF4135"
  },
  {
    name: "die_mannschaft",
    primary: "#FFFFFF",
    primaryForeground: "#000000",
    accent: "#FFCC00"
  }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentKit, setCurrentKit] = useState(null);

  useEffect(() => {
    // Randomly select a kit on mount
    const randomKit = kits[Math.floor(Math.random() * kits.length)];
    setCurrentKit(randomKit);
    
    // Apply CSS variables
    document.documentElement.style.setProperty('--primary', randomKit.primary);
    document.documentElement.style.setProperty('--primary-foreground', randomKit.primaryForeground);
    document.documentElement.style.setProperty('--accent', randomKit.accent);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentKit }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};