'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import SunIcon from '@/components/svg/SunIcon'
import MoonIcon from '@/components/svg/MoonIcon'
import ComputerIcon from '@/components/svg/ComputerIcon'

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-7 w-[78px]" />
  }

  return (
    <div
      className="flex items-center rounded-full bg-gray-200 p-0.5 shadow-inner dark:bg-gray-700"
      style={{ minWidth: '78px', height: '28px' }}
      role="group"
      aria-label="Theme switcher"
    >
      <button
        onClick={() => setTheme('light')}
        className={`flex h-6 w-[25px] items-center justify-center rounded-full transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white text-yellow-500 shadow-md dark:bg-gray-600'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        aria-label="Switch to light mode"
        aria-pressed={theme === 'light'}
      >
        <SunIcon />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex h-6 w-[25px] items-center justify-center rounded-full transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-white text-purple-500 shadow-md dark:bg-gray-600'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        aria-label="Switch to dark mode"
        aria-pressed={theme === 'dark'}
      >
        <MoonIcon />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex h-6 w-[25px] items-center justify-center rounded-full transition-all duration-200 ${
          theme === 'system'
            ? 'bg-white text-blue-500 shadow-md dark:bg-gray-600'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        aria-label="Switch to system theme"
        aria-pressed={theme === 'system'}
      >
        <ComputerIcon />
      </button>
    </div>
  )
}
