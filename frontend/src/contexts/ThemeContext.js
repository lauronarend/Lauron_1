import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = [
  {
    name: 'brasil',
    label: '🇧🇷 Brasil',
    primary: '#FFD700',
    accent: '#009C3B',
    bg: 'linear-gradient(135deg, #002147 0%, #003d1a 50%, #001a0d 100%)',
    bgSolid: '#002147'
  },
  {
    name: 'argentina',
    label: '🇦🇷 Argentina',
    primary: '#74ACDF',
    accent: '#FFFFFF',
    bg: 'linear-gradient(135deg, #003d7a 0%, #005fa3 50%, #001a40 100%)',
    bgSolid: '#003d7a'
  },
  {
    name: 'espanha',
    label: '🇪🇸 Espanha',
    primary: '#AA151B',
    accent: '#F1BF00',
    bg: 'linear-gradient(135deg, #1a0000 0%, #3d0007 50%, #1a0005 100%)',
    bgSolid: '#1a0000'
  },
  {
    name: 'franca',
    label: '🇫🇷 França',
    primary: '#002395',
    accent: '#EF4135',
    bg: 'linear-gradient(135deg, #000d2e 0%, #001a5c 50%, #000820 100%)',
    bgSolid: '#000d2e'
  },
  {
    name: 'alemanha',
    label: '🇩🇪 Alemanha',
    primary: '#FFFFFF',
    accent: '#FFCC00',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #050505 100%)',
    bgSolid: '#0a0a0a'
  },
  {
    name: 'portugal',
    label: '🇵🇹 Portugal',
    primary: '#006600',
    accent: '#FF0000',
    bg: 'linear-gradient(135deg, #001a00 0%, #003300 50%, #000d00 100%)',
    bgSolid: '#001a00'
  },
  {
    name: 'italia',
    label: '🇮🇹 Itália',
    primary: '#0066CC',
    accent: '#FFFFFF',
    bg: 'linear-gradient(135deg, #000d1a 0%, #002952 50%, #000814 100%)',
    bgSolid: '#000d1a'
  },
  {
    name: 'inglaterra',
    label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra',
    primary: '#CF091F',
    accent: '#FFFFFF',
    bg: 'linear-gradient(135deg, #0a0000 0%, #1f0005 50%, #050000 100%)',
    bgSolid: '#0a0000'
  }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentKit, setCurrentKit] = useState(null);

  useEffect(() => {
    const random = themes[Math.floor(Math.random() * themes.length)];
    setCurrentKit(random);

    // CSS variables
    document.documentElement.style.setProperty('--primary', random.primary);
    document.documentElement.style.setProperty('--primary-foreground', random.accent);
    document.documentElement.style.setProperty('--accent', random.accent);

    // Background
    document.body.style.background = random.bg;
    document.body.style.minHeight = '100vh';
    document.body.style.backgroundAttachment = 'fixed';

    // Also set root background
    document.documentElement.style.setProperty('--bg-gradient', random.bg);
    document.documentElement.style.setProperty('--bg-solid', random.bgSolid);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentKit, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
