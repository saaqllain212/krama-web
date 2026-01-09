import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TrialGuard from '@/components/dashboard/TrialGuard' // <--- IMPORT

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // WRAP EVERYTHING IN TRIAL GUARD
    <TrialGuard>
      <div className="min-h-screen bg-[#FBF9F6]">
        <Sidebar />
        <MobileNav />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-6xl p-6 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </TrialGuard>
  )
}