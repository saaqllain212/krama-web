'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, X, Trash2 } from 'lucide-react'

// Types
type AlertType = 'success' | 'error' | 'neutral'
type AlertState = { show: boolean; msg: string; type: AlertType }
type ConfirmState = { show: boolean; msg: string; onConfirm: () => void }

interface AlertContextType {
  showAlert: (msg: string, type?: AlertType) => void
  askConfirm: (msg: string, onConfirm: () => void) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({ show: false, msg: '', type: 'neutral' })
  const [confirm, setConfirm] = useState<ConfirmState>({ show: false, msg: '', onConfirm: () => {} })

  // Functions accessible to app
  const showAlert = (msg: string, type: AlertType = 'neutral') => {
    setAlert({ show: true, msg, type })
    // Auto-hide after 3 seconds
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 3000)
  }

  const askConfirm = (msg: string, onConfirm: () => void) => {
    setConfirm({ show: true, msg, onConfirm })
  }

  const handleConfirm = () => {
    confirm.onConfirm()
    setConfirm({ ...confirm, show: false })
  }

  return (
    <AlertContext.Provider value={{ showAlert, askConfirm }}>
      {children}

      {/* --- 1. THE TOAST (Alert) --- */}
      <AnimatePresence>
        {alert.show && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className={`px-6 py-3 border-2 shadow-[4px_4px_0_rgba(0,0,0,0.2)] flex items-center gap-3 font-bold uppercase tracking-wider text-sm
              ${alert.type === 'error' ? 'bg-red-50 border-red-600 text-red-900' : 
                alert.type === 'success' ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 
                'bg-white border-black text-black'}`}>
              
              {alert.type === 'success' && <CheckCircle size={16} />}
              {alert.type === 'error' && <AlertCircle size={16} />}
              {alert.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 2. THE MODAL (Confirm) --- */}
      <AnimatePresence>
        {confirm.show && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black p-8 max-w-sm w-full shadow-[12px_12px_0_rgba(0,0,0,1)] relative"
            >
              <h3 className="text-xl font-black uppercase mb-4 text-black">Confirmation Required</h3>
              <p className="text-black/60 font-medium mb-8 leading-relaxed">
                {confirm.msg}
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirm({ ...confirm, show: false })} 
                  className="flex-1 py-3 border-2 border-black/10 hover:border-black font-bold uppercase text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm} 
                  className="flex-1 py-3 bg-red-600 text-white border-2 border-black hover:bg-red-700 font-bold uppercase text-xs shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) throw new Error('useAlert must be used within an AlertProvider')
  return context
}