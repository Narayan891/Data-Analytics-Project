import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
/* ThemeToggle styles are now global in index.css */

const ThemeToggle = () => {
  const [theme, setTheme] = useState('obsidian');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'obsidian' ? 'prismatic' : 'obsidian');
  };

  return (
    <div className="theme-toggle-container" onClick={toggleTheme}>
      <div className={`theme-toggle-track ${theme}`}>
        <div className="theme-toggle-thumb">
          {theme === 'obsidian' ? <Moon size={14} /> : <Sun size={14} />}
        </div>
        <div className="theme-toggle-icons">
          <Moon size={12} className={theme === 'obsidian' ? 'active' : ''} />
          <Sun size={12} className={theme === 'prismatic' ? 'active' : ''} />
        </div>
      </div>
      <span className="theme-label">
        {theme === 'obsidian' ? 'Stealth Mode' : 'Observation Mode'}
      </span>
    </div>
  );
};

export default ThemeToggle;
