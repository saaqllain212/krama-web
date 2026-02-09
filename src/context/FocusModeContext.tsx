'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type FocusModeContextType = {
  isFocusMode: boolean
  setFocusMode: (active: boolean) => void
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined)

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isFocusMode, setFocusMode] = useState(false)

  return (
    <FocusModeContext.Provider value={{ isFocusMode, setFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  )
}

export function useFocusMode() {
  const context = useContext(FocusModeContext)
  if (!context) throw new Error('useFocusMode must be used within a FocusModeProvider')
  return context
}