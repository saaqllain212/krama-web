'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Moon, Sun, Palette } from 'lucide-react'

export type FocusTheme = 'default' | 'dark' | 'warm' | 'minimal'

type FocusThemeContextType = {
  theme: FocusTheme
  setTheme: (theme: FocusTheme) => void
}

const FocusThemeContext = createContext<FocusThemeContextType>({
  theme: 'default',
  setTheme: () => {},
})

export function useFocusTheme() {
  return useContext(FocusThemeContext)
}

export function FocusThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<FocusTheme>('default')

  useEffect(() => {
    const saved = localStorage.getItem('krama_focus_theme') as FocusTheme
    if (saved && ['default', 'dark', 'warm', 'minimal'].includes(saved)) {
      setThemeState(saved)
    }
  }, [])

  const setTheme = (t: FocusTheme) => {
    setThemeState(t)
    localStorage.setItem('krama_focus_theme', t)
  }

  return (
    <FocusThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </FocusThemeContext.Provider>
  )
}

// Theme CSS classes
export const THEME_STYLES: Record<FocusTheme, {
  bg: string
  text: string
  subtext: string
  input: string
  card: string
  accent: string
  timerColor: string
  label: string
  icon: typeof Sun
}> = {
  default: {
    bg: 'bg-[#f0f2f7]',
    text: 'text-gray-900',
    subtext: 'text-gray-600',
    input: 'bg-white border-gray-200 text-gray-900',
    card: 'bg-white',
    accent: 'text-primary-600',
    timerColor: '#5B8FF9',
    label: 'Default',
    icon: Sun,
  },
  dark: {
    bg: 'bg-gray-950',
    text: 'text-gray-100',
    subtext: 'text-gray-400',
    input: 'bg-gray-900 border-gray-700 text-gray-100',
    card: 'bg-gray-900',
    accent: 'text-indigo-400',
    timerColor: '#818CF8',
    label: 'Dark',
    icon: Moon,
  },
  warm: {
    bg: 'bg-amber-950',
    text: 'text-amber-100',
    subtext: 'text-amber-300/70',
    input: 'bg-amber-900/50 border-amber-700/50 text-amber-100',
    card: 'bg-amber-900/30',
    accent: 'text-amber-400',
    timerColor: '#FBBF24',
    label: 'Warm',
    icon: Palette,
  },
  minimal: {
    bg: 'bg-white',
    text: 'text-black',
    subtext: 'text-gray-400',
    input: 'bg-gray-50 border-gray-200 text-black',
    card: 'bg-gray-50',
    accent: 'text-black',
    timerColor: '#000000',
    label: 'Minimal',
    icon: Sun,
  },
}

// Theme picker component for focus page
export function FocusThemePicker() {
  const { theme, setTheme } = useFocusTheme()

  const themes: FocusTheme[] = ['default', 'dark', 'warm', 'minimal']

  return (
    <div className="flex items-center gap-1.5">
      {themes.map(t => {
        const style = THEME_STYLES[t]
        const isActive = theme === t
        
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            title={style.label}
            className={`w-7 h-7 rounded-md border-2 transition-all ${
              isActive ? 'border-primary-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <div className={`w-full h-full rounded-[4px] ${
              t === 'default' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
              t === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-950' :
              t === 'warm' ? 'bg-gradient-to-br from-amber-700 to-amber-900' :
              'bg-gradient-to-br from-white to-gray-100 border border-gray-200'
            }`} />
          </button>
        )
      })}
    </div>
  )
}
