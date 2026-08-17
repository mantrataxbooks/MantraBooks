'use client'
import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const stored = localStorage.getItem('mb-theme') as Theme | null
    const initial: Theme = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    applyTheme(initial)
    setTheme(initial)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    applyTheme(next)
    setTheme(next)
    localStorage.setItem('mb-theme', next)
  }

  return { theme, toggle, isDark: theme === 'dark' }
}

function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t)
}
