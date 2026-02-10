'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TrialGuard from '@/components/dashboard/TrialGuard'
import { XPProvider } from '@/context/XPContext'
import { FocusModeProvider, useFocusMode } from '@/context/FocusModeContext'
import XPNotification from '@/components/dashboard/XPNotification'

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
}

const pageTransition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
}

// Inner layout that reacts to focus mode + animates page transitions
function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isFocusMode } = useFocusMode()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f0f2f7]">
      {/* Sidebar & MobileNav hide when focus mode is active */}
      {!isFocusMode && <Sidebar />}
      {!isFocusMode && <MobileNav />}
      
      <main className={isFocusMode ? '' : 'lg:pl-64'}>
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          <TrialGuard>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </TrialGuard>
        </div>
      </main>
      <XPNotification />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <XPProvider>
      <FocusModeProvider>
        <DashboardInner>{children}</DashboardInner>
      </FocusModeProvider>
    </XPProvider>
  )
}