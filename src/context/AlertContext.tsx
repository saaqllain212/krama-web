'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

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

  const showAlert = (msg: string, type: AlertType = 'neutral') => {
    setAlert({ show: true, msg, type })
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

      {/* --- TOAST --- */}
      <AnimatePresence>
        {alert.show && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className={`px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 font-medium text-sm border
              ${alert.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : alert.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              {alert.type === 'success' && <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />}
              {alert.type === 'error' && <AlertCircle size={18} className="text-red-500 flex-shrink-0" />}
              {alert.type === 'neutral' && <Info size={18} className="text-gray-400 flex-shrink-0" />}
              {alert.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM MODAL --- */}
      <AnimatePresence>
        {confirm.show && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3">Are you sure?</h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {confirm.msg}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirm({ ...confirm, show: false })} 
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm} 
                  className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
                >
                  Confirm
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
