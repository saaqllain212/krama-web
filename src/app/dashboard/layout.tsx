'use client'

import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TrialGuard from '@/components/dashboard/TrialGuard'
import { XPProvider } from '@/context/XPContext'
import XPNotification from '@/components/dashboard/XPNotification'

// NEW: Import Dashboard Cursor
import DashboardCursor from '@/components/dashboard/DashboardCursor'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <XPProvider>
      <div className="min-h-screen bg-[#f0f2f7]">
        {/* NEW: Add Dashboard Cursor (Step 3) */}
        <DashboardCursor />

        <Sidebar />
        <MobileNav />
        <main className="lg:pl-64">
           <div className="mx-auto max-w-7xl p-6 lg:p-8">
             <TrialGuard>
                {children}
             </TrialGuard>
           </div>
        </main>
        <XPNotification />
      </div>
    </XPProvider>
  )
}