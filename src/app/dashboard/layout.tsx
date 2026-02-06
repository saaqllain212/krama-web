'use client'

import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TrialGuard from '@/components/dashboard/TrialGuard'
import { XPProvider } from '@/context/XPContext'
import XPNotification from '@/components/dashboard/XPNotification'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <XPProvider>
      <div className="min-h-screen bg-gray-50">
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