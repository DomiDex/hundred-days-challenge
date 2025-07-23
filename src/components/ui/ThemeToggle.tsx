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
    return <div className='w-[78px] h-7' />;
  }

  return (
    <div
      className="flex items-center rounded-full p-0.5 shadow-inner bg-gray-200 dark:bg-gray-700"
      style={{ minWidth: '78px', height: '28px' }}
    >
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center justify-center w-[25px] h-6 rounded-full transition-all duration-200 ${
          theme === 'light'
            ? 'shadow-md text-yellow-500 bg-white dark:bg-gray-600'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        aria-label='Light mode'
      >
        <SunIcon />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center justify-center w-[25px] h-6 rounded-full transition-all duration-200 ${
          theme === 'dark'
            ? 'shadow-md text-purple-500 bg-white dark:bg-gray-600'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        aria-label='Dark mode'
      >
        <MoonIcon />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex items-center justify-center w-[25px] h-6 rounded-full transition-all duration-200 ${
          theme === 'system'
            ? 'shadow-md text-blue-500 bg-white dark:bg-gray-600'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        aria-label='System mode'
      >
        <ComputerIcon />
      </button>
    </div>
  );
}
