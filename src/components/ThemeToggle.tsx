import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-button"
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={`relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 ${className}`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 transition-transform duration-200" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200" />
      )}
    </button>
  );
};
