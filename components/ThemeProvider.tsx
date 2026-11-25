'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  mounted: boolean
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'adaptive-cache-theme'

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  mounted: false,
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const attr = document.documentElement.getAttribute('data-theme')
      const resolved: ThemeMode =
        saved === 'dark' || saved === 'light'
          ? saved
          : attr === 'dark' || attr === 'light'
          ? attr
          : 'light'
      setThemeState(resolved)
      document.documentElement.setAttribute('data-theme', resolved)
    } catch {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
    document.documentElement.setAttribute('data-theme', mode)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, mounted, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
