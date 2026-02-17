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
import { Wrench } from 'lucide-react'

const pageTransition = {
  duration: 0.15,
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

  return (
    <MaintenanceGate>
      <div className="min-h-screen bg-[#f0f2f7]">
        {!isFocusMode && <Sidebar />}
        {!isFocusMode && <MobileNav />}
        
        <main className={isFocusMode ? '' : 'lg:pl-64'}>
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            <TrialGuard>
              {/* FIX: Removed AnimatePresence mode="wait" — it forced full unmount/remount 
                   on every route change, blocking render until exit completes.
                   Simple fade-in via motion.div is much lighter. */}
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={pageTransition}
              >
                {children}
              </motion.div>
            </TrialGuard>
          </div>
        </main>
        <XPNotification />
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
