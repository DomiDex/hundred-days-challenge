'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import SunIcon from '@/components/svg/SunIcon';
import MoonIcon from '@/components/svg/MoonIcon';
import ComputerIcon from '@/components/svg/ComputerIcon';

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className='w-[96px] h-8' />;
  }

  return (
    <div className='flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 shadow-inner'>
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center justify-center w-8 h-7 rounded-full transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 shadow-md text-yellow-500'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        aria-label='Light mode'
      >
        <SunIcon />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center justify-center w-8 h-7 rounded-full transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 shadow-md text-purple-500'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        aria-label='Dark mode'
      >
        <MoonIcon />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex items-center justify-center w-8 h-7 rounded-full transition-all duration-200 ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 shadow-md text-blue-500'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        aria-label='System mode'
      >
        <ComputerIcon />
      </button>
    </div>
  );
}
