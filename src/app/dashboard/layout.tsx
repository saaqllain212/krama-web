'use client'

import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TrialGuard from '@/components/dashboard/TrialGuard'
import { XPProvider } from '@/context/XPContext'
import { FocusModeProvider, useFocusMode } from '@/context/FocusModeContext'
import XPNotification from '@/components/dashboard/XPNotification'

// Inner layout that reacts to focus mode
function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isFocusMode } = useFocusMode()

  return (
    <div className="min-h-screen bg-[#f0f2f7]">
      {/* Sidebar & MobileNav hide when focus mode is active */}
      {!isFocusMode && <Sidebar />}
      {!isFocusMode && <MobileNav />}
      
      <main className={isFocusMode ? '' : 'lg:pl-64'}>
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          <TrialGuard>
            {children}
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