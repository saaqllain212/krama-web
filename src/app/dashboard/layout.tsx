'use client'

import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TrialGuard from '@/components/dashboard/TrialGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-64">
         <div className="mx-auto max-w-6xl p-6 lg:p-12">
           <TrialGuard>
              {children}
           </TrialGuard>
         </div>
      </main>
    </div>
  )
}