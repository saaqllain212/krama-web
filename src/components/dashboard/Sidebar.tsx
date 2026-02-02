'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Timer, 
  RotateCw, 
  Map, 
  LineChart, 
  LogOut,
  ChevronRight,
  User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSyllabus } from '@/context/SyllabusContext'
import LevelBadge from '@/components/dashboard/LevelBadge'

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
  
  const { activeExam, stats } = useSyllabus()
  
  // User state
  const [userName, setUserName] = useState('')
  const [userInitial, setUserInitial] = useState('U')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        const name = user.user_metadata.full_name
        setUserName(name.split(' ')[0])
        setUserInitial(name.charAt(0).toUpperCase())
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
        setUserInitial(user.email.charAt(0).toUpperCase())
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  // Filter items based on mode
  const visibleItems = NAV_ITEMS.filter(item => {
    if (activeExam === 'focus') {
      return ['Overview', 'Focus Mode', 'Spaced Review', 'Mock Scores'].includes(item.label)
    }
    return true
  })

  // Get exam label
  const getExamLabel = () => {
    switch(activeExam) {
      case 'upsc': return 'UPSC'
      case 'ssc': return 'SSC'
      case 'bank': return 'Bank PO'
      case 'jee': return 'JEE'
      case 'neet': return 'NEET'
      case 'rbi': return 'RBI'
      case 'custom': return 'Custom'
      case 'focus': return 'Focus'
      default: return 'Exam'
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r-2 border-black bg-white lg:flex">
      
      {/* Brand Logo */}
      <div className="flex h-20 items-center justify-between border-b-2 border-black px-6">
        <div className="text-2xl font-black uppercase tracking-tight">Krama</div>
        {activeExam && (
          <div className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-1">
            {getExamLabel()}
          </div>
        )}
      </div>

      {/* User Section with Level */}
      <div className="border-b-2 border-black/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-lg">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{userName || 'Student'}</div>
            <div className="text-xs text-black/50 font-medium">
              {stats.percentage}% complete
            </div>
          </div>
        </div>
        
        {/* Level Badge */}
        <LevelBadge variant="compact" showProgress={true} />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all
                ${isActive 
                  ? 'bg-black text-white' 
                  : 'text-black/60 hover:bg-black/5 hover:text-black'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" strokeWidth={2} />
                {item.label}
              </div>
              {isActive && <ChevronRight size={16} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="border-t-2 border-black p-4">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-black/40 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="h-5 w-5" strokeWidth={2} />
          Log Out
        </button>
      </div>
    </aside>
  )
}