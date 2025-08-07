import { renderHook, act } from '@testing-library/react'
import { useThemeStore } from '@/store/themeStore'

type ZustandSet<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean | undefined
) => void
type ZustandGet<T> = () => T
type ZustandApi<T> = {
  setState: ZustandSet<T>
  getState: ZustandGet<T>
  subscribe: (listener: (state: T, prevState: T) => void) => () => void
  destroy: () => void
}

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist:
    <T>(config: (set: ZustandSet<T>, get: ZustandGet<T>, api: ZustandApi<T>) => T) =>
    (set: ZustandSet<T>, get: ZustandGet<T>, api: ZustandApi<T>) =>
      config(set, get, api),
}))

describe('useThemeStore', () => {
  beforeEach(() => {
    // Clear store state before each test
    const { result } = renderHook(() => useThemeStore())
    act(() => {
      result.current.setTheme('system')
    })
  })

  it('returns initial theme as system', () => {
    const { result } = renderHook(() => useThemeStore())
    expect(result.current.theme).toBe('system')
  })

  it('updates theme to light', () => {
    const { result } = renderHook(() => useThemeStore())

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')
  })

  it('updates theme to dark', () => {
    const { result } = renderHook(() => useThemeStore())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
  })

  it('updates theme back to system', () => {
    const { result } = renderHook(() => useThemeStore())

    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.setTheme('system')
    })
    expect(result.current.theme).toBe('system')
  })

  it('maintains theme state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useThemeStore())
    const { result: result2 } = renderHook(() => useThemeStore())

    act(() => {
      result1.current.setTheme('dark')
    })

    expect(result1.current.theme).toBe('dark')
    expect(result2.current.theme).toBe('dark')
  })

  it('cycles through all theme options', () => {
    const { result } = renderHook(() => useThemeStore())
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

    themes.forEach((theme) => {
      act(() => {
        result.current.setTheme(theme)
      })
      expect(result.current.theme).toBe(theme)
    })
  })
})
