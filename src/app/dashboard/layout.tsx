'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TrialGuard from '@/components/dashboard/TrialGuard'
import { XPProvider } from '@/context/XPContext'
import { FocusModeProvider, useFocusMode } from '@/context/FocusModeContext'
import { AppConfigProvider, useAppConfig } from '@/context/AppConfigContext'
import XPNotification from '@/components/dashboard/XPNotification'
import StudyReminder from '@/components/dashboard/StudyReminder'
import { Wrench } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'

const CheckoutModal = dynamic(() => import('@/components/dashboard/CheckoutModal'), { ssr: false })

const pageTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
}

// Maintenance mode gate — shows maintenance page when enabled
function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { config, loading } = useAppConfig()

  if (loading) return null // Don't flash maintenance screen while loading

  if (config.maintenance_mode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
            <Wrench className="text-amber-600" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Under Maintenance</h1>
          <p className="text-gray-600 font-medium text-lg">
            {config.maintenance_message || 'Krama is undergoing maintenance. We\'ll be back shortly!'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Inner layout that reacts to focus mode + animates page transitions
function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isFocusMode } = useFocusMode()
  const pathname = usePathname()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const supabase = useMemo(() => createClient(), [])

  // Get user info for checkout
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
        setUserEmail(user.email || '')
      }
    }
    getUser()
  }, [supabase])

  // Listen for PremiumGate upgrade events
  useEffect(() => {
    const handler = () => setIsCheckoutOpen(true)
    window.addEventListener('open-checkout', handler)
    return () => window.removeEventListener('open-checkout', handler)
  }, [])

  return (
    <MaintenanceGate>
      <div className="min-h-screen bg-gray-50">
        {!isFocusMode && <Sidebar />}
        {!isFocusMode && <MobileNav />}
        
        <main className={isFocusMode ? '' : 'lg:pl-64'}>
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <TrialGuard>
              {/* FIX: Removed AnimatePresence mode="wait" — it forced full unmount/remount 
                   on every route change, blocking render until exit completes.
                   Simple fade-in via motion.div is much lighter. */}
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={pageTransition}
              >
                {children}
              </motion.div>
            </TrialGuard>
          </div>
        </main>
        <XPNotification />
        <StudyReminder />
        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          userName={userName}
          userEmail={userEmail}
        />
      </div>
    </MaintenanceGate>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppConfigProvider>
      <XPProvider>
        <FocusModeProvider>
          <DashboardInner>{children}</DashboardInner>
        </FocusModeProvider>
      </XPProvider>
    </AppConfigProvider>
  )
}
