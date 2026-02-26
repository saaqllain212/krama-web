'use client'

import { useEffect, useState, useRef } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

/**
 * PWAInstallPrompt: Captures the browser's beforeinstallprompt event
 * and shows a custom install banner at the right moment.
 * 
 * Trigger: After the user completes their first focus session (custom event)
 * OR after 3 page navigations (they're clearly engaged)
 * 
 * Suppressed: If already installed (standalone mode), or dismissed before
 */
export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const deferredPromptRef = useRef<any>(null)

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Don't show if user already dismissed
    if (localStorage.getItem('krama_pwa_dismissed')) return

    // Capture the browser's install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e
    }

    // Show prompt after first successful focus session
    const handleSessionComplete = () => {
      if (deferredPromptRef.current && !localStorage.getItem('krama_pwa_dismissed')) {
        // Small delay so it doesn't overlap with session review modal
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('focus-session-saved', handleSessionComplete)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('focus-session-saved', handleSessionComplete)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPromptRef.current) return

    deferredPromptRef.current.prompt()
    const { outcome } = await deferredPromptRef.current.userChoice
    
    if (outcome === 'accepted') {
      localStorage.setItem('krama_pwa_dismissed', 'installed')
    }
    
    deferredPromptRef.current = null
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('krama_pwa_dismissed', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80 animate-in slide-in-from-top">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-start gap-3">
        <div className="bg-primary-100 p-2.5 rounded-xl shrink-0">
          <Smartphone size={20} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">Install Krama</p>
          <p className="text-xs text-gray-500 mt-0.5">Add to home screen for instant access & offline support</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 bg-primary-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Download size={14} />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
