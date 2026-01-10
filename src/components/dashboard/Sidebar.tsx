'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Timer, RotateCw, Map, LineChart, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSyllabus } from '@/context/SyllabusContext'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Focus Mode', href: '/dashboard/focus', icon: Timer },
  { label: 'Spaced Review', href: '/dashboard/review', icon: RotateCw },
  { label: 'Syllabus Map', href: '/dashboard/syllabus', icon: Map },
  { label: 'Mock Scores', href: '/dashboard/mocks', icon: LineChart },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  // 1. Get Active Protocol
  const { activeExam } = useSyllabus()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  // 2. Filter Items Logic
  const visibleItems = NAV_ITEMS.filter(item => {
    // If in Focus Mode, show Overview, Focus, AND Review.
    // Hide only Syllabus and Mocks.
    if (activeExam === 'focus') {
       return ['Overview', 'Focus Mode', 'Spaced Review'].includes(item.label)
    }
    // Otherwise show everything
    return true
  })

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r-2 border-black bg-white lg:flex">
      {/* Brand Logo */}
      <div className="flex h-20 items-center border-b-2 border-black px-6">
        <div className="text-2xl font-black uppercase tracking-tight">Krama</div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 p-4">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 border-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                ${isActive 
                  ? 'border-black bg-brand shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                  : 'border-transparent bg-transparent hover:border-black hover:bg-white'
                }`}
            >
              <Icon className="h-5 w-5 stroke-[2.5px]" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer / User / Logout */}
      <div className="border-t-2 border-black p-4">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 border-2 border-transparent px-4 py-3 text-sm font-bold uppercase tracking-wide text-black/40 hover:border-black hover:bg-red-100 hover:text-red-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <LogOut className="h-5 w-5 stroke-[2.5px]" />
          Log Out
        </button>
      </div>
    </aside>
  )
}