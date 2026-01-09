import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* The Sidebar (Visible on Desktop) */}
      <Sidebar />

      {/* Mobile Header (Visible only on Mobile) */}
      <div className="flex h-16 items-center border-b-2 border-black bg-white px-6 lg:hidden">
        <div className="text-xl font-black uppercase tracking-tight">Krama</div>
        {/* We will add a mobile hamburger menu later */}
      </div>

      {/* Main Content Area */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl p-6 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  )
}