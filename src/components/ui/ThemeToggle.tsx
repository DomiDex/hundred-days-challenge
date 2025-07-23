'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import SunIcon from '@/components/svg/SunIcon';
import MoonIcon from '@/components/svg/MoonIcon';
import ComputerIcon from '@/components/svg/ComputerIcon';

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setActualTheme(isDark ? 'dark' : 'light');

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setActualTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setActualTheme(theme as 'light' | 'dark');
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <div className='w-[78px] h-7' />;
  }

  return (
    <div
      className={`flex items-center rounded-full p-0.5 shadow-inner ${
        actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}
    >
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center justify-center w-[25px] h-6 rounded-full transition-all duration-200 ${
          theme === 'light'
            ? `shadow-md text-yellow-500 ${
                actualTheme === 'dark' ? 'bg-gray-600' : 'bg-white'
              }`
            : actualTheme === 'dark' 
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label='Light mode'
      >
        <SunIcon />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center justify-center w-[25px] h-6 rounded-full transition-all duration-200 ${
          theme === 'dark'
            ? `shadow-md text-purple-500 ${
                actualTheme === 'dark' ? 'bg-gray-600' : 'bg-white'
              }`
            : actualTheme === 'dark' 
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label='Dark mode'
      >
        <MoonIcon />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex items-center justify-center w-[25px] h-6 rounded-full transition-all duration-200 ${
          theme === 'system'
            ? `shadow-md text-blue-500 ${
                actualTheme === 'dark' ? 'bg-gray-600' : 'bg-white'
              }`
            : actualTheme === 'dark' 
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label='System mode'
      >
        <ComputerIcon />
      </button>
    </div>
  );
}
