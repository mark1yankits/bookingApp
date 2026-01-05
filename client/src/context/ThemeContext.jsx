import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const themes = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8fafc',
    '--bg-tertiary': '#ffffff',
    '--text-primary': '#1e293b',
    '--text-secondary': '#64748b',
    '--text-muted': '#94a3b8',
    '--border-color': '#e2e8f0',
    '--accent-color': '#3b82f6',
    '--accent-hover': '#2563eb',
    '--success-color': '#10b981',
    '--error-color': '#ef4444',
    '--warning-color': '#f59e0b',

    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

    '--gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  dark: {
    '--bg-primary': '#0f172a',
    '--bg-secondary': '#1e293b',
    '--bg-tertiary': '#334155',
    '--text-primary': '#f1f5f9',
    '--text-secondary': '#cbd5e1',
    '--text-muted': '#94a3b8',
    '--border-color': '#475569',
    '--accent-color': '#60a5fa',
    '--accent-hover': '#3b82f6',
    '--success-color': '#34d399',
    '--error-color': '#f87171',
    '--warning-color': '#fbbf24',

    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',

    
    '--gradient-primary': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  }
}

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light' 

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && themes[savedTheme]) {
    return savedTheme
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

const isUserSetTheme = () => {
  return localStorage.getItem('theme') !== null
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const [isUserPreference, setIsUserPreference] = useState(isUserSetTheme)

  useEffect(() => {
    const root = document.documentElement
    const themeVars = themes[theme]

    Object.entries(themeVars).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    if (isUserPreference) {
      localStorage.setItem('theme', theme)
    }
  }, [theme, isUserPreference])

  useEffect(() => {
    if (typeof window === 'undefined' || isUserPreference) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isUserPreference])

  const toggleTheme = () => {
    setIsUserPreference(true) 
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const resetToSystemTheme = () => {
    setIsUserPreference(false)
    localStorage.removeItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }

  const value = {
    theme,
    toggleTheme,
    resetToSystemTheme,
    isUserPreference,
    themes: Object.keys(themes)
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
